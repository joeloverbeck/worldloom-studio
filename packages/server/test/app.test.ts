import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { RECORD_TYPES } from "@worldloom/shared";
import { createApp } from "../src/app.js";

let tempDirs: string[] = [];

const tempPath = (name: string) => {
  const dir = mkdtempSync(join(tmpdir(), "worldloom-api-"));
  tempDirs.push(dir);
  return join(dir, name);
};

const explicitJudgment = {
  truthLayer: "Objective canon",
  canonStatus: "proposed"
};

const json = async <T,>(response: Response): Promise<T> => response.json() as Promise<T>;

const postJson = (app: ReturnType<typeof createApp>, path: string, payload?: unknown) =>
  app.request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload)
  });

afterEach(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs = [];
});

describe("HTTP API", () => {
  it("serves typed health data and requires explicit judgment fields for records", async () => {
    const app = createApp();
    const health = await app.request("/api/health");
    expect(await json(health)).toMatchObject({ ok: true, version: "0.0.0" });

    const path = tempPath("api-world.sqlite");
    expect((await app.request("/api/worlds/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path })
    })).status).toBe(201);

    const missingJudgment = await app.request("/api/records", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ recordTypeKey: "canon_fact", title: "Glass road", body: "Visible only at noon" })
    });
    expect(missingJudgment.status).toBe(400);
    expect(await json(missingJudgment)).toMatchObject({ error: expect.stringContaining("explicit steward choices") });

    const vocabularies = await json<{ terms: Array<{ vocabulary: string; term: string }> }>(await app.request("/api/vocabularies"));
    expect(vocabularies.terms).toEqual(expect.arrayContaining([
      expect.objectContaining({ vocabulary: "repair_operation", term: "add constraint" }),
      expect.objectContaining({ vocabulary: "contradiction_disposition", term: "repair required" }),
      expect.objectContaining({ vocabulary: "preservation_operation", term: "consecrate" }),
      expect.objectContaining({ vocabulary: "retcon_type", term: "hard retcon" }),
      expect.objectContaining({ vocabulary: "protected_effect_type", term: "sacred opacity" })
    ]));
    expect(vocabularies.terms).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ vocabulary: "repair_operation", term: "branch" })
    ]));

    const failedOpen = await app.request("/api/worlds/open", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: tempPath("missing.sqlite") })
    });
    expect(failedOpen.status).toBe(400);
    const stillOpen = await app.request("/api/records");
    expect(stillOpen.status).toBe(200);
    expect(await json(stillOpen)).toMatchObject({ records: [] });
  });

  it("creates every generic record type, edits cards, preserves reports, links, traverses, searches, promotes, and snapshots", async () => {
    const app = createApp();
    const path = tempPath("api-world.sqlite");
    const snapshotPath = tempPath("api-snapshot.sqlite");

    const created = await app.request("/api/worlds/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path })
    });
    expect(created.status).toBe(201);

    const catalog = await json<{ recordTypes: typeof RECORD_TYPES }> (await app.request("/api/catalog"));
    expect(catalog.recordTypes.map((recordType) => recordType.key)).toEqual(RECORD_TYPES.map((recordType) => recordType.key));

    const createdRecords: Array<{ id: number; recordTypeKey: string; shortId: string }> = [];
    for (const recordType of RECORD_TYPES) {
      const response = await app.request("/api/records", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          recordTypeKey: recordType.key,
          title: recordType.key === "canon_fact" ? `${recordType.label} Glass road` : `${recordType.label} surface`,
          body: recordType.key === "canon_fact" ? "Visible only at noon" : "Methodology surface",
          ...explicitJudgment
        })
      });
      expect(response.status, recordType.key).toBe(201);
      createdRecords.push((await json<{ record: { id: number; recordTypeKey: string; shortId: string } }>(response)).record);
    }

    const firstJson = { record: createdRecords.find((record) => record.recordTypeKey === "canon_fact")! };
    const secondJson = { record: createdRecords.find((record) => record.recordTypeKey === "constraint")! };
    const reportJson = { record: createdRecords.find((record) => record.recordTypeKey === "propagation_report")! };

    const edited = await app.request(`/api/records/${firstJson.record.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body: "Glass road renamed into the noon bridge" })
    });
    expect(edited.status).toBe(200);

    const reportEdit = await app.request(`/api/records/${reportJson.record.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body: "Changed report" })
    });
    expect(reportEdit.status).toBe(400);
    expect(await json(reportEdit)).toMatchObject({ error: expect.stringContaining("append-only") });

    const link = await app.request("/api/links", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fromRecordId: secondJson.record.id, toRecordId: firstJson.record.id, linkTypeKey: "constrains" })
    });
    expect(link.status).toBe(201);

    const chain = await app.request("/api/links", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fromRecordId: reportJson.record.id, toRecordId: secondJson.record.id, linkTypeKey: "constrains" })
    });
    expect(chain.status).toBe(201);

    const traversal = await app.request(`/api/links/traverse?recordId=${reportJson.record.id}&linkTypeKey=constrains`);
    expect(await json(traversal)).toMatchObject({ links: [{ depth: 1 }, { depth: 2 }] });

    const search = await app.request("/api/search?q=Glass");
    expect(search.status).toBe(200);
    expect(await search.json()).toMatchObject({ records: [{ id: firstJson.record.id }] });

    const promoted = await app.request(`/api/records/${secondJson.record.id}/promote`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ recordTypeKey: "canon_fact" })
    });
    expect(promoted.status).toBe(200);
    expect(await json(promoted)).toMatchObject({ record: { id: secondJson.record.id, recordTypeKey: "canon_fact" } });

    const snapshot = await app.request("/api/worlds/snapshot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ destinationPath: snapshotPath })
    });
    expect(snapshot.status).toBe(200);
    expect(await snapshot.json()).toMatchObject({ path: snapshotPath });

    const reopened = await app.request("/api/worlds/open", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: snapshotPath })
    });
    expect(reopened.status).toBe(200);
    expect(await json(reopened)).toMatchObject({ records: expect.arrayContaining([expect.objectContaining({ id: firstJson.record.id })]) });
  });

  it("exercises facets, sections, drafts, prompts, skips, and seed parking through the HTTP seam", async () => {
    const app = createApp();
    const path = tempPath("flow-world.sqlite");
    expect((await app.request("/api/worlds/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path })
    })).status).toBe(201);

    const factResponse = await app.request("/api/records", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ recordTypeKey: "canon_fact", title: "Seven-day echoes", body: "Echoes remain for seven days", ...explicitJudgment })
    });
    const fact = (await json<{ record: { id: number } }>(factResponse)).record;

    expect(await json(await app.request(`/api/records/${fact.id}/facets`))).toMatchObject({ facets: [] });
    const facetA = await json<{ facet: { id: number; position: number } }>(await app.request(`/api/records/${fact.id}/facets`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ vocabulary: "admission_decision_operation", term: "accept" })
    }));
    const facetB = await json<{ facet: { position: number } }>(await app.request(`/api/records/${fact.id}/facets`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ vocabulary: "admission_decision_operation", term: "price" })
    }));
    expect([facetA.facet.position, facetB.facet.position]).toEqual([1, 2]);
    const badFacet = await app.request(`/api/records/${fact.id}/facets`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ vocabulary: "admission_decision_operation", term: "invented" })
    });
    expect(badFacet.status).toBe(400);
    await app.request(`/api/records/${fact.id}/facets/${facetA.facet.id}`, { method: "DELETE" });
    expect(await json(await app.request(`/api/records/${fact.id}/facets`))).toMatchObject({ facets: [{ position: 2 }] });

    const sections = await app.request(`/api/records/${fact.id}/sections`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sections: [{ heading: "Fact statement", body: "Echoes answer through advocates", position: 1 }] })
    });
    expect(sections.status).toBe(200);
    expect(await json(await app.request("/api/search?q=advocates"))).toMatchObject({ records: [{ id: fact.id }] });

    const draft = await json<{ draft: { id: number } }>(await app.request("/api/drafts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Bell seed", body: "A bell remembers debts" })
    }));
    expect(await json(await app.request("/api/drafts"))).toMatchObject({ drafts: [{ title: "Bell seed" }] });
    const converted = await app.request(`/api/drafts/${draft.draft.id}/convert`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ recordTypeKey: "canon_fact", truthLayer: "Objective canon", canonStatus: "proposed" })
    });
    expect(converted.status).toBe(201);
    expect(await json(await app.request("/api/drafts"))).toMatchObject({ drafts: [] });

    const prompt = await json<{ prompt: string }>(await app.request("/api/prompts/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ templateKey: "kernel_pressure", recordId: fact.id, stepKey: "kernel" })
    }));
    expect(prompt.prompt).toContain("Record context");
    expect(prompt.prompt).toContain("Vocabulary guardrail");
    expect(prompt.prompt).toContain("Label assumptions instruction");

    const advisory = await json<{ record: { id: number } }>(await app.request("/api/advisory-artifacts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stepKey: "kernel", promptText: prompt.prompt, responseText: "Verbatim response" })
    }));
    expect((await app.request(`/api/records/${advisory.record.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body: "edited" })
    })).status).toBe(400);
    expect((await app.request(`/api/advisory-artifacts/${advisory.record.id}/dispositions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ disposition: "standing ruling", note: "Keep pressure concrete", standingRuling: true })
    })).status).toBe(201);
    expect((await json<{ prompt: string }>(await app.request("/api/prompts/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ templateKey: "kernel_pressure", recordId: fact.id })
    }))).prompt).toContain("Keep pressure concrete");

    const editedTemplate = await app.request("/api/prompt-templates/kernel_pressure", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "Custom pressure text" })
    });
    expect(editedTemplate.status).toBe(200);
    expect(await json(await app.request("/api/prompt-templates"))).toMatchObject({
      templates: expect.arrayContaining([expect.objectContaining({ key: "kernel_pressure", current_text: "Custom pressure text", original_text: expect.stringContaining("steward-authored kernel") })])
    });
    const revertedTemplate = await app.request("/api/prompt-templates/kernel_pressure/revert", { method: "POST" });
    expect(revertedTemplate.status).toBe(200);

    const flow = await json<{ flow: { id: number } }>(await app.request("/api/flows/creation/start", { method: "POST" }));
    const kernelStep = await json<{ kernel: { id: number }; facets: Array<{ term: string }> }>(await app.request("/api/flows/creation/kernel-step", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId: flow.flow.id, heading: "World premise", body: "A city hears its dead", consequenceMode: "weird" })
    }));
    expect(kernelStep.facets).toEqual([expect.objectContaining({ term: "weird" })]);
    expect((await app.request("/api/flows/creation/skip", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId: flow.flow.id, stepKey: "kernel_prompt" })
    })).status).toBe(201);

    const decomposed = await app.request("/api/flows/creation/decompose", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        flowId: flow.flow.id,
        kernelRecordId: kernelStep.kernel.id,
        granularityRationale: "The court testimony seed can be rejected independently.",
        seeds: [{ title: "Echo court testimony", body: "Courts accept echo testimony under conditions", truthLayer: "Objective canon", granularityConfirmed: true }]
      })
    });
    expect(decomposed.status).toBe(201);
    expect(await json(decomposed)).toMatchObject({ records: [{ canonStatus: "proposed" }] });
  });

  it("exposes flow-aware Prompt-out routes for prompts, advisory artifacts, dispositions, and skips", async () => {
    const app = createApp();
    const path = tempPath("prompt-out-world.sqlite");
    expect((await app.request("/api/worlds/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path })
    })).status).toBe(201);

    const fact = await json<{ record: { id: number } }>(await app.request("/api/records", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ recordTypeKey: "canon_fact", title: "Toll ghosts", body: "Ghosts testify over bridge tolls.", ...explicitJudgment })
    }));

    const generated = await json<{ prompt: string; promptOut: { flowKey: string; stepKey: string } }>(await app.request("/api/prompt-out/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        flowKey: "admission",
        templateKey: "admission_prerequisite_audit",
        recordId: fact.record.id,
        stepKey: "admission:dependencies"
      })
    }));
    expect(generated.promptOut).toMatchObject({ flowKey: "admission", stepKey: "admission:dependencies" });
    expect(generated.prompt).toContain("Prerequisite auditor");
    expect(generated.prompt).toContain("Toll ghosts");

    const advisory = await json<{ record: { id: number; recordTypeKey: string; body: string } }>(await app.request("/api/prompt-out/advisory-artifacts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        flowKey: "admission",
        flowId: 44,
        stepKey: "admission:dependencies",
        promptText: generated.prompt,
        responseText: "Name the enforcement office."
      })
    }));
    expect(advisory.record.recordTypeKey).toBe("advisory_artifact");
    expect(advisory.record.body).toContain("Flow: admission");
    expect(advisory.record.body).toContain("Flow id: 44");
    expect(advisory.record.body).toContain("Step: admission:dependencies");
    expect((await app.request(`/api/prompt-out/advisory-artifacts/${advisory.record.id}/dispositions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ disposition: "standing ruling", note: "Keep enforcement offices named.", standingRuling: true })
    })).status).toBe(201);
    expect((await json<{ prompt: string }>(await app.request("/api/prompt-out/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowKey: "admission", templateKey: "admission_prerequisite_audit", recordId: fact.record.id, stepKey: "admission:dependencies" })
    }))).prompt).toContain("Keep enforcement offices named.");

    const creationFlow = await json<{ flow: { id: number } }>(await app.request("/api/flows/creation/start", { method: "POST" }));
    expect((await app.request("/api/prompt-out/skip", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowKey: "creation", flowId: creationFlow.flow.id, stepKey: "creation:kernel_prompt", workScale: "minor" })
    })).status).toBe(201);

    const admissionSkip = await json<{ record: { id: number } }>(await app.request("/api/prompt-out/skip", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowKey: "admission", recordId: fact.record.id, stepKey: "admission:dependencies", admissionLevel: "1", workScale: "minor" })
    }));
    expect(await json(await app.request(`/api/links?recordId=${admissionSkip.record.id}`))).toMatchObject({
      links: expect.arrayContaining([expect.objectContaining({ toRecordId: fact.record.id, linkTypeKey: "derived_from" })])
    });

    const propagationFlow = await json<{ flow: { id: number } }>(await app.request("/api/propagation/runs/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ factRecordId: fact.record.id })
    }));
    const propagationSkipResponse = await app.request("/api/prompt-out/skip", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowKey: "propagation", flowId: propagationFlow.flow.id, stepKey: "propagation:first", workScale: "minor" })
    });
    expect(propagationSkipResponse.status).toBe(201);
    const propagationSkip = await json<{ record: { body: string } }>(propagationSkipResponse);
    expect(propagationSkip.record.body).toContain("Flow: propagation");
    expect(propagationSkip.record.body).toContain(`Flow id: ${propagationFlow.flow.id}`);
    expect(propagationSkip.record.body).toContain("Step: propagation:first");
    expect(await json(await app.request(`/api/propagation/runs/${propagationFlow.flow.id}`))).toMatchObject({
      flow: expect.objectContaining({ current_step: "propagation:skip:propagation:first" })
    });
    expect((await app.request("/api/prompt-out/skip", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowKey: "propagation", flowId: propagationFlow.flow.id, stepKey: "propagation:domain-atlas", workScale: "major" })
    })).status).toBe(400);

    const contradictionFlow = await json<{ flow: { id: number } }>(await app.request("/api/contradiction/runs/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sourceRecordId: fact.record.id, title: "Prompt-out skip contradiction" })
    }));
    expect((await app.request("/api/prompt-out/skip", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowKey: "contradiction", flowId: contradictionFlow.flow.id, stepKey: "contradiction:boundary_guard", workScale: "minor" })
    })).status).toBe(201);
    expect(await json(await app.request(`/api/contradiction/runs/${contradictionFlow.flow.id}`))).toMatchObject({
      flow: expect.objectContaining({ current_step: "contradiction:skip:contradiction:boundary_guard" })
    });
  });

  it("drives admission queue, severity, ledger, gate, audit, skips, debt, and prompts through the HTTP seam", async () => {
    const app = createApp();
    const path = tempPath("admission-world.sqlite");
    expect((await app.request("/api/worlds/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path })
    })).status).toBe(201);

    const draft = await json<{ draft: { id: number } }>(await app.request("/api/drafts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Toll bell", body: "A bell charges each crossing" })
    }));
    const proposed = await app.request(`/api/admission/propose-draft/${draft.draft.id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ truthLayer: "Objective canon" })
    });
    expect(proposed.status).toBe(201);
    const proposedJson = await json<{ record: { id: number; canonStatus: string }; queue: Array<{ id: number; canonStatus: string }> }>(proposed);
    expect(proposedJson.record.canonStatus).toBe("proposed");
    expect(proposedJson.queue).toEqual(expect.arrayContaining([expect.objectContaining({ id: proposedJson.record.id, canonStatus: "proposed" })]));
    expect(await json(await app.request(`/api/links?recordId=${proposedJson.record.id}`))).toMatchObject({
      links: [expect.objectContaining({ fromRecordId: proposedJson.record.id, linkTypeKey: "derived_from", note: "Propose action provenance" })]
    });
    expect(await json(await app.request("/api/admission/queue"))).toMatchObject({
      queue: expect.arrayContaining([
        expect.objectContaining({
          id: proposedJson.record.id,
          sourceLinks: expect.arrayContaining([
            expect.objectContaining({ linkTypeKey: "derived_from", note: "Propose action provenance" })
          ])
        })
      ])
    });

    const seed = await json<{ record: { id: number } }>(await app.request("/api/records", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ recordTypeKey: "canon_fact", title: "Seed fact", body: "Seed body", ...explicitJudgment })
    }));
    expect(await json(await app.request("/api/admission/queue"))).toMatchObject({
      queue: expect.arrayContaining([
        expect.objectContaining({
          id: seed.record.id,
          decisionPointHref: `/api/admission/records/${seed.record.id}/decision-point`
        })
      ])
    });

    const queuedDecision = await json<{
      decisionPoint: {
        localDecision: string;
        methodCard: { key: string };
        selectedRecord: { id: number };
        severity: {
          admissionLevel: string | null;
          workScale: string | null;
          gatePath: string | null;
          definitions: Array<{ key: string; term: string; definition: string }>;
        };
        work: { required: string[]; optional: string[]; skippable: string[]; severityDependent: string[] };
        skipRule: { reasonRequired: boolean; belowThresholdNote: string };
        promptOut: {
          templateKey: string;
          stepKey: string;
          role: string;
          modes: Array<{ mode: string; availability: string; blocker: string | null }>;
          preview: { promptText: string; sourceManifest: string[]; omissions: string[]; advisoryCanonWarning: string };
        };
        writeIntent: { willWrite: string[]; willLink: string[]; willLeaveUntouched: string[] };
        readSideTrail: Array<{ label: string; href: string }>;
      };
    }>(await app.request(`/api/admission/records/${seed.record.id}/decision-point`));
    expect(queuedDecision.decisionPoint).toMatchObject({
      localDecision: "Choose and classify the proposed fact before Admission changes canon standing.",
      methodCard: { key: "admission.queue-severity" },
      selectedRecord: { id: seed.record.id },
      severity: {
        admissionLevel: null,
        workScale: null,
        gatePath: null,
        definitions: expect.arrayContaining([
          expect.objectContaining({ key: "admission_level", term: "0" }),
          expect.objectContaining({ key: "work_scale", term: "minor" })
        ])
      },
      work: {
        required: expect.arrayContaining(["Declare admission_level", "Declare work_scale"]),
        optional: expect.arrayContaining(["Prompt-out advisory pressure after steward-authored material exists"]),
        skippable: expect.arrayContaining(["Frontloaded seed audit can be declined with a governed skip record"]),
        severityDependent: expect.arrayContaining(["Gate depth is unavailable until severity is declared"])
      },
      skipRule: { reasonRequired: false, belowThresholdNote: expect.stringContaining("Reason not collected") },
      promptOut: {
        templateKey: "admission_queue_severity",
        stepKey: "admission:queue-severity",
        role: "Severity classification readiness",
        modes: expect.arrayContaining([
          expect.objectContaining({ mode: "proposal", availability: "available", blocker: null }),
          expect.objectContaining({ mode: "pressure", availability: "available", blocker: null })
        ]),
        preview: expect.objectContaining({
          promptText: expect.stringContaining("classification readiness"),
          sourceManifest: expect.arrayContaining([
            expect.stringContaining("Method card: admission.queue-severity"),
            expect.stringContaining("Prompt template: admission_queue_severity"),
            expect.stringContaining("Vocabulary admission_level 0"),
            expect.stringContaining("Vocabulary work_scale minor")
          ]),
          omissions: expect.arrayContaining([expect.stringContaining("Minor ledger")]),
          advisoryCanonWarning: expect.stringContaining("advisory")
        })
      },
      writeIntent: {
        willWrite: expect.arrayContaining(["No canon mutation until the steward completes Admission"]),
        willLink: expect.arrayContaining(["Read-side trail links expose Current Canon, Audit Trail, record detail, advisory artifacts, skip records, canon debt, and export"]),
        willLeaveUntouched: expect.arrayContaining(["Seed audit does not mutate seed truth layer, canon status, tags, severity, or operations"])
      },
      readSideTrail: expect.arrayContaining([
        expect.objectContaining({ label: "Current Canon" }),
        expect.objectContaining({ label: "Audit Trail" }),
        expect.objectContaining({ label: "Record detail" })
      ])
    });
    expect(queuedDecision.decisionPoint.promptOut.preview.promptText).toContain("risks");
    expect(queuedDecision.decisionPoint.promptOut.preview.promptText).toContain("dependencies");
    expect(queuedDecision.decisionPoint.promptOut.preview.promptText).toContain("missing information");
    expect(queuedDecision.decisionPoint.promptOut.preview.promptText).toContain("candidate questions");
    expect(queuedDecision.decisionPoint.promptOut.preview.promptText).toContain("do not assign canon standing");
    expect(queuedDecision.decisionPoint.promptOut.preview.promptText).toContain("do not assign truth layer");
    expect(queuedDecision.decisionPoint.promptOut.preview.promptText).not.toContain("minor-ledger completion");
    expect(queuedDecision.decisionPoint.promptOut.preview.promptText).not.toContain("admission_prerequisite_audit");

    const severity = await postJson(app, `/api/admission/records/${proposedJson.record.id}/severity`, { admissionLevel: "4", workScale: "severe" });
    expect(severity.status).toBe(200);
    expect(await json(severity)).toMatchObject({
      gate: { path: "full_gate", steps: expect.arrayContaining(["shock-cone summary"]) },
      decisionPoint: {
        localDecision: "Complete the full canon fact gate with written substance.",
        severity: {
          admissionLevel: "4",
          workScale: "severe",
          gatePath: "full_gate",
          definitions: expect.arrayContaining([
            expect.objectContaining({ key: "admission_level", term: "4" }),
            expect.objectContaining({ key: "work_scale", term: "severe" })
          ])
        },
        work: {
          required: expect.arrayContaining(["Written consequence text", "Admission operation order"]),
          optional: expect.arrayContaining(["Prompt-out advisory pressure after steward-authored material exists"]),
          skippable: expect.arrayContaining(["Prompt-out can be declined through a skip_record"]),
          severityDependent: expect.arrayContaining(["temporal/spatial passes"])
        },
        blockers: expect.arrayContaining([
          expect.objectContaining({ key: "written_consequence", requires: "written consequence text" })
        ]),
        promptOut: {
          advisory: "optional",
          preview: expect.objectContaining({
            currentDecision: "Complete the full canon fact gate with written substance.",
            sourceManifest: expect.arrayContaining([expect.stringContaining("Record")]),
            advisoryCanonWarning: expect.stringContaining("advisory")
          })
        }
      }
    });

    const gatePayload = await json<{
      gate: {
        path: string;
        executableContract: {
          sections: Array<{ key: string; label: string; required: boolean; canMarkNotApplicable: boolean; quietDomain: boolean }>;
          allowedNextCanonStatuses: string[];
          operationOptions: string[];
          constraintTagOptions: string[];
          completionAction: { method: string; href: string };
        };
      };
      decisionPoint: {
        currentStep: string;
        fullGateContract: {
          sections: Array<{ key: string; label: string; required: boolean; canMarkNotApplicable: boolean; quietDomain: boolean }>;
          allowedNextCanonStatuses: string[];
          operationOptions: string[];
          constraintTagOptions: string[];
          validationErrors: Array<{ key: string; message: string }>;
          completionAction: { method: string; href: string };
          advisoryArtifacts: Array<{ id: number; shortId: string; title: string; stepKey: string }>;
        };
        writeIntent: { willWrite: string[] };
      };
    }>(await app.request(`/api/admission/records/${proposedJson.record.id}/gate`));
    expect(gatePayload).toMatchObject({
      gate: {
        executableContract: {
          allowedNextCanonStatuses: expect.arrayContaining(["under review", "accepted", "accepted with constraints", "localized", "contested", "quarantined", "branch-only", "rejected"]),
          operationOptions: expect.arrayContaining(["accept", "constrain", "price"]),
          constraintTagOptions: expect.arrayContaining(["cost-bound"]),
          completionAction: { method: "POST", href: "/api/admission/gate/complete" }
        }
      },
      decisionPoint: {
        currentStep: `record:${proposedJson.record.id}:severity-declared`,
        fullGateContract: {
          sections: expect.arrayContaining([
            expect.objectContaining({ key: "fact_statement", label: "Fact statement", required: true, canMarkNotApplicable: false }),
            expect.objectContaining({ key: "dependencies", label: "Dependencies", required: true, canMarkNotApplicable: true }),
            expect.objectContaining({ key: "institutions_or_quiet_domain_declaration", quietDomain: true })
          ]),
          validationErrors: [],
          completionAction: { method: "POST", href: "/api/admission/gate/complete" }
        },
        writeIntent: {
          willWrite: expect.arrayContaining(["gate_result report"])
        }
      }
    });
    expect(gatePayload.decisionPoint.fullGateContract.operationOptions).toEqual(gatePayload.gate.executableContract.operationOptions);
    expect(gatePayload.decisionPoint.fullGateContract.allowedNextCanonStatuses).toEqual(gatePayload.gate.executableContract.allowedNextCanonStatuses);

    const minorSeverity = await app.request(`/api/admission/records/${seed.record.id}/severity`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ admissionLevel: "1", workScale: "minor" })
    });
    expect(minorSeverity.status).toBe(200);
    expect(await json(minorSeverity)).toMatchObject({
      decisionPoint: {
        localDecision: "Complete the minor admission ledger while preserving batch speed.",
        severity: { admissionLevel: "1", workScale: "minor", gatePath: "minor_ledger" },
        work: {
          required: expect.arrayContaining(["One consequence check"]),
          severityDependent: expect.arrayContaining(["Minor path writes admission_ledger_row records and ordered admission operations"])
        },
        seedAudit: {
          offered: true,
          runWrites: expect.stringContaining("gate_result"),
          declineWrites: expect.stringContaining("skip_record")
        }
      }
    });

    const prompt = await json<{ prompt: string }>(await app.request("/api/prompts/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ templateKey: "admission_prerequisite_audit", recordId: proposedJson.record.id, stepKey: "admission:dependencies" })
    }));
    expect(prompt.prompt).toContain("Prerequisite auditor");
    expect(prompt.prompt).toContain("Vocabulary guardrail");
    expect(prompt.prompt).toContain("Source manifest:");
    expect(prompt.prompt).toContain("Context preview:");
    expect(prompt.prompt).toContain("Advisory/canon warning:");

    const badGate = await postJson(app, "/api/admission/gate/complete", { recordId: proposedJson.record.id, truthLayer: "Objective canon", canonStatus: "accepted", operations: ["accept"] });
    expect(badGate.status).toBe(400);
    expect(await json(badGate)).toMatchObject({
      error: expect.stringContaining("written consequence"),
      validationErrors: expect.arrayContaining([expect.objectContaining({ key: "written_consequence" })])
    });

    const emptyOperationsGate = await postJson(app, "/api/admission/gate/complete", {
      recordId: proposedJson.record.id,
      truthLayer: "Objective canon",
      canonStatus: "accepted",
      operations: [],
      consequenceText: "Markets now price crossings by bell debt."
    });
    expect(emptyOperationsGate.status).toBe(400);
    expect(await json(emptyOperationsGate)).toMatchObject({
      validationErrors: expect.arrayContaining([expect.objectContaining({ key: "operations" })])
    });

    const missingSectionGate = await postJson(app, "/api/admission/gate/complete", {
      recordId: proposedJson.record.id,
      truthLayer: "Objective canon",
      canonStatus: "accepted",
      operations: ["accept"],
      consequenceText: "Markets now price crossings by bell debt.",
      sections: [{ key: "fact_statement", substance: "A bell charges bridge crossings." }]
    });
    expect(missingSectionGate.status).toBe(400);
    expect(await json(missingSectionGate)).toMatchObject({
      validationErrors: expect.arrayContaining([expect.objectContaining({ key: "dependencies" })])
    });

    const blankStructuredReasonGate = await postJson(app, "/api/admission/gate/complete", {
      recordId: proposedJson.record.id,
      truthLayer: "Objective canon",
      canonStatus: "accepted",
      operations: ["accept"],
      consequenceText: "Markets now price crossings by bell debt.",
      sections: gatePayload.decisionPoint.fullGateContract.sections.map((section) => ({
        key: section.key,
        substance: section.key === "branch_implications" ? "" : `${section.label} substance`,
        notApplicableReason: section.key === "branch_implications" ? " " : "",
        quietDomainDeclaration: section.quietDomain ? "No quiet-domain omission; bridge wards are in scope." : ""
      }))
    });
    expect(blankStructuredReasonGate.status).toBe(400);
    expect(await json(blankStructuredReasonGate)).toMatchObject({
      validationErrors: expect.arrayContaining([expect.objectContaining({ key: "branch_implications.notApplicableReason" })])
    });

    const duplicateSectionGate = await postJson(app, "/api/admission/gate/complete", {
      recordId: proposedJson.record.id,
      truthLayer: "Objective canon",
      canonStatus: "accepted",
      operations: ["accept"],
      consequenceText: "Markets now price crossings by bell debt.",
      sections: [
        ...gatePayload.decisionPoint.fullGateContract.sections.map((section) => ({
          key: section.key,
          substance: `${section.label} substance`,
          quietDomainDeclaration: section.quietDomain ? "No quiet-domain omission; bridge wards are explicitly in scope." : ""
        })),
        {
          key: gatePayload.decisionPoint.fullGateContract.sections[0].key,
          substance: "Duplicate stale section from a prior draft."
        }
      ]
    });
    expect(duplicateSectionGate.status).toBe(400);
    expect(await json(duplicateSectionGate)).toMatchObject({
      validationErrors: expect.arrayContaining([expect.objectContaining({ key: "fact_statement.duplicate" })])
    });

    const mismatchedSectionOrderGate = await postJson(app, "/api/admission/gate/complete", {
      recordId: proposedJson.record.id,
      truthLayer: "Objective canon",
      canonStatus: "accepted",
      operations: ["accept"],
      consequenceText: "Markets now price crossings by bell debt.",
      sections: [...gatePayload.decisionPoint.fullGateContract.sections].reverse().map((section) => ({
        key: section.key,
        substance: `${section.label} substance`,
        quietDomainDeclaration: section.quietDomain ? "No quiet-domain omission; bridge wards are explicitly in scope." : ""
      }))
    });
    expect(mismatchedSectionOrderGate.status).toBe(400);
    expect(await json(mismatchedSectionOrderGate)).toMatchObject({
      validationErrors: expect.arrayContaining([expect.objectContaining({ key: "sections.0.key" })])
    });

    const blankQuietDomainGate = await postJson(app, "/api/admission/gate/complete", {
      recordId: proposedJson.record.id,
      truthLayer: "Objective canon",
      canonStatus: "accepted",
      operations: ["accept"],
      consequenceText: "Markets now price crossings by bell debt.",
      sections: gatePayload.decisionPoint.fullGateContract.sections.map((section) => ({
        key: section.key,
        substance: section.quietDomain ? "" : `${section.label} substance`,
        quietDomainDeclaration: section.quietDomain ? " " : ""
      }))
    });
    expect(blankQuietDomainGate.status).toBe(400);
    expect(await json(blankQuietDomainGate)).toMatchObject({
      validationErrors: expect.arrayContaining([expect.objectContaining({ key: "institutions_or_quiet_domain_declaration.quietDomainDeclaration" })])
    });

    const debt = await json<{ debt: { id: number } }>(await app.request("/api/canon-debt", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Unpriced bell crossings", scope: "economy", assignee: "steward" })
    }));
    expect(await json(await app.request("/api/canon-debt?open=true"))).toMatchObject({
      debt: expect.arrayContaining([expect.objectContaining({ id: debt.debt.id })])
    });
    const compatibilityDebt = await json<{ debt: { id: number } }>(await app.request("/api/admission/debt", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Compatibility debt route", scope: "propagation", assignee: "steward" })
    }));
    expect(await json(await app.request("/api/admission/debt?open=true"))).toMatchObject({
      debt: expect.arrayContaining([expect.objectContaining({ id: compatibilityDebt.debt.id })])
    });
    expect(await json(await app.request("/api/propagation/queue"))).toMatchObject({
      queue: expect.arrayContaining([expect.objectContaining({ id: compatibilityDebt.debt.id })])
    });
    const gateStep = await json<{ step: { actions: Record<"generate" | "storeAdvisory" | "disposition", { method: "POST"; href: string }> } }>(
      await postJson(app, "/api/prompt-out/steps", {
        flowKey: "admission",
        templateKey: "admission_constraint_challenge",
        recordId: proposedJson.record.id,
        stepKey: "admission:constraints",
        mode: "pressure",
        label: "Constraint challenger",
        admissionLevel: "4",
        workScale: "severe"
      })
    );
    const gatePrompt = await json<{ prompt: string }>(await postJson(app, gateStep.step.actions.generate.href));
    const gateAdvisory = await json<{ record: { id: number; shortId: string } }>(await postJson(app, gateStep.step.actions.storeAdvisory.href, {
      promptText: gatePrompt.prompt,
      responseText: "Price the bell by crossing class and publish exemptions."
    }));
    expect(await json(await app.request(`/api/links?recordId=${proposedJson.record.id}`))).toMatchObject({
      links: expect.not.arrayContaining([expect.objectContaining({ linkTypeKey: "cites_advisory_artifact", toRecordId: gateAdvisory.record.id })])
    });
    expect((await postJson(app, gateStep.step.actions.disposition.href, {
      advisoryRecordId: gateAdvisory.record.id,
      disposition: "adopted with steward revision",
      note: "Use pricing pressure only after steward rewrite."
    })).status).toBe(201);

    const completedGate = await postJson(app, "/api/admission/gate/complete", {
      recordId: proposedJson.record.id,
      truthLayer: "Objective canon",
      canonStatus: "accepted with constraints",
      constraintTags: ["cost-bound"],
      operations: ["constrain", "price"],
      consequenceText: "Markets now price crossings by bell debt.",
      sections: gatePayload.decisionPoint.fullGateContract.sections.map((section) => ({
        key: section.key,
        substance: `${section.label} substance for bridge-toll admission.`,
        quietDomainDeclaration: section.quietDomain ? "No quiet-domain omission; bridge wards are explicitly in scope." : ""
      })),
      notApplicableReasons: ["No branch implication in main continuity."],
      quietDomainDeclarations: ["No spatial spread beyond bridge wards yet."],
      followUpDebt: "Propagate bridge-toll economics.",
      advisoryRecordId: gateAdvisory.record.id
    });
    expect(completedGate.status).toBe(201);
    const completedGatePayload = await json(completedGate);
    expect(completedGatePayload).toMatchObject({
      record: { canonStatus: "accepted with constraints" },
      gateResult: {
        recordTypeKey: "gate_result",
        body: expect.stringContaining("Gate sections:")
      },
      warnings: expect.arrayContaining([expect.objectContaining({ id: debt.debt.id })]),
      readback: {
        livingRecord: {
          id: proposedJson.record.id,
          title: "Toll bell",
          body: "A bell charges each crossing",
          canonStatus: "accepted with constraints"
        },
        gateResult: {
          body: expect.stringContaining("Fact statement: Fact statement substance for bridge-toll admission.")
        },
        operationEvents: ["constrain", "price"],
        constraintTags: ["cost-bound"],
        followUpDebt: expect.objectContaining({ body: expect.stringContaining("Propagate bridge-toll economics.") }),
        advisoryUse: expect.objectContaining({ advisoryRecordId: gateAdvisory.record.id }),
        historyEvidence: expect.objectContaining({ previousBody: "A bell charges each crossing" }),
        readSideTrail: expect.arrayContaining([expect.objectContaining({ label: "Current Canon" })])
      },
      decisionPoint: {
        flow: { runState: "complete" },
        currentStep: `record:${proposedJson.record.id}:complete`,
        closePreview: {
          afterCompletion: expect.arrayContaining(["Current Canon", "Audit Trail", "record detail"])
        },
        readSideTrail: expect.arrayContaining([
          expect.objectContaining({ label: "Current Canon" }),
          expect.objectContaining({ label: "Export" })
        ])
      }
    });
    expect(await json(await app.request(`/api/links?recordId=${proposedJson.record.id}`))).toMatchObject({
      links: expect.arrayContaining([
        expect.objectContaining({ linkTypeKey: "cites_advisory_artifact", toRecordId: gateAdvisory.record.id })
      ])
    });

    const minorBatch = await app.request("/api/admission/minor-batch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        source: "seed cluster",
        rows: [{
          title: "Ledger: bell toll color",
          fact: "The toll bell is blue.",
          scope: "bridge ward",
          truthLayer: "Objective canon",
          status: "accepted",
          operations: ["accept"],
          consequenceCheck: "Blue paint becomes the bridge ward's ordinary sign."
        }]
      })
    });
    expect(minorBatch.status).toBe(201);
    expect(await json(minorBatch)).toMatchObject({ records: [{ recordTypeKey: "admission_ledger_row", canonStatus: "accepted" }] });

    const audit = await app.request("/api/admission/seed-audit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ seedRecordIds: [seed.record.id], findings: "Seed has a scope and intended status.", decision: "proceed" })
    });
    expect(audit.status).toBe(201);
    const auditJson = await json<{
      report: { recordTypeKey: string };
      seeds: Array<{ canonStatus: string }>;
      decisionPoints: Array<{ seedAudit: { offered: boolean; nonMutation: string } }>;
    }>(audit);
    expect(auditJson.report).toMatchObject({ recordTypeKey: "gate_result" });
    expect(auditJson.seeds).toEqual(expect.arrayContaining([expect.objectContaining({ canonStatus: "proposed" })]));
    expect(await json(await app.request(`/api/links?recordId=${seed.record.id}`))).toMatchObject({
      links: expect.arrayContaining([
        expect.objectContaining({ fromRecordId: seed.record.id, linkTypeKey: "derived_from", note: "Frontloaded seed audit report" })
      ])
    });
    expect(await json(await app.request(`/api/records/${seed.record.id}/facets`))).toMatchObject({
      facets: expect.arrayContaining([
        expect.objectContaining({ vocabulary: "admission_level", term: "1" }),
        expect.objectContaining({ vocabulary: "work_scale", term: "minor" })
      ])
    });
    expect(auditJson.decisionPoints).toEqual(expect.arrayContaining([expect.objectContaining({
        seedAudit: expect.objectContaining({
          offered: true,
          nonMutation: expect.stringContaining("does not mutate seed truth layer")
        })
      })]));

    const minorSkip = await app.request("/api/admission/skip", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ recordId: seed.record.id, stepKey: "seed_audit", admissionLevel: "1", workScale: "minor" })
    });
    expect(minorSkip.status).toBe(201);
    expect(await json(minorSkip)).toMatchObject({
      record: { recordTypeKey: "skip_record", body: expect.stringContaining("Reason not collected") },
      decisionPoint: { skipRule: { reasonRequired: false } }
    });
    const majorSkip = await app.request("/api/admission/skip", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ recordId: seed.record.id, stepKey: "canon_change_proposal", admissionLevel: "3", workScale: "major" })
    });
    expect(majorSkip.status).toBe(400);
    expect((await app.request(`/api/canon-debt/${debt.debt.id}/close`, { method: "POST" })).status).toBe(200);
    expect((await app.request(`/api/admission/debt/${compatibilityDebt.debt.id}/close`, { method: "POST" })).status).toBe(200);
  });

  it("drives propagation queue, run work, dispositions, report, proposal routing, prompts, and skips through the HTTP seam", async () => {
    const app = createApp();
    const path = tempPath("propagation-world.sqlite");
    expect((await app.request("/api/worlds/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path })
    })).status).toBe(201);

    const fact = await json<{ record: { id: number; shortId: string } }>(await app.request("/api/records", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ recordTypeKey: "canon_fact", title: "Ghost tolls bind bridges", body: "Dead witnesses can charge crossings.", truthLayer: "Objective canon", canonStatus: "accepted" })
    }));
    expect((await app.request(`/api/admission/records/${fact.record.id}/severity`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ admissionLevel: "4", workScale: "severe" })
    })).status).toBe(200);
    const debt = await json<{ debt: { id: number } }>(await app.request("/api/canon-debt", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: `Propagation owed for ${fact.record.shortId}`, scope: "propagation", assignee: "steward", body: "Admission owed a shock cone." })
    }));

    expect(await json(await app.request("/api/propagation/queue"))).toMatchObject({ queue: [expect.objectContaining({ id: debt.debt.id })] });
    const plan = await json<{ plan: { requiredDomainCount: number; domains: string[]; doctrine: { signatureTests: string[] } } }>(await app.request(`/api/propagation/records/${fact.record.id}/plan`));
    expect(plan.plan.requiredDomainCount).toBe(14);
    expect(plan.plan.domains).toContain("Economy, trade, and scarcity");
    expect(plan.plan.doctrine.signatureTests).toContain("where are the fossils?");

    const flow = await json<{ flow: { id: number } }>(await app.request("/api/propagation/runs/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ factRecordId: fact.record.id, debtRecordId: debt.debt.id })
    }));
    const resumed = await json<{ flow: { id: number } }>(await app.request("/api/propagation/runs/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ factRecordId: fact.record.id, debtRecordId: debt.debt.id })
    }));
    expect(resumed.flow.id).toBe(flow.flow.id);

    const prompt = await json<{ prompt: string }>(await app.request("/api/prompts/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ templateKey: "propagation_consequence_scout", recordId: fact.record.id, stepKey: "propagation:first" })
    }));
    expect(prompt.prompt).toContain("Consequence scout");
    expect(prompt.prompt).toContain("Record context");
    expect((await app.request("/api/prompt-templates/propagation_consequence_scout", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: "Custom propagation pressure text" })
    })).status).toBe(200);
    expect(await json(await app.request("/api/prompt-templates"))).toMatchObject({
      templates: expect.arrayContaining([expect.objectContaining({ key: "propagation_consequence_scout", current_text: "Custom propagation pressure text" })])
    });
    expect((await app.request("/api/prompt-templates/propagation_consequence_scout/revert", { method: "POST" })).status).toBe(200);
    const advisory = await json<{ record: { id: number } }>(await app.request("/api/advisory-artifacts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stepKey: "propagation:first", promptText: prompt.prompt, responseText: "Pressure response verbatim" })
    }));
    expect((await app.request(`/api/advisory-artifacts/${advisory.record.id}/dispositions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ disposition: "standing ruling", note: "Keep bridge economics explicit", standingRuling: true })
    })).status).toBe(201);
    expect((await json<{ prompt: string }>(await app.request("/api/prompts/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ templateKey: "propagation_consequence_scout", recordId: fact.record.id, stepKey: "propagation:second" })
    }))).prompt).toContain("Keep bridge economics explicit");

    const minorSkip = await app.request("/api/propagation/skip", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId: flow.flow.id, stepKey: "optional_enemy_use", admissionLevel: "1", workScale: "minor" })
    });
    expect(minorSkip.status).toBe(201);
    const majorSkip = await app.request("/api/propagation/skip", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId: flow.flow.id, stepKey: "domain_atlas", admissionLevel: "4", workScale: "severe" })
    });
    expect(majorSkip.status).toBe(400);

    const consequence = await json<{ consequence: { id: number } }>(await app.request("/api/propagation/consequences", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        flowId: flow.flow.id,
        orderKey: "first",
        domainName: "Economy, trade, and scarcity",
        body: "Bridge tolls become debt instruments priced by mortuary advocates.",
        pressure: "high"
      })
    }));
    expect((await app.request("/api/propagation/domains", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId: flow.flow.id, domainName: "Economy, trade, and scarcity", triage: "direct", declaration: "Tolls and credit markets change." })
    })).status).toBe(201);
    expect((await app.request("/api/propagation/domains", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId: flow.flow.id, domainName: "Aesthetics, tone, and narrative use", triage: "negative", declaration: "No comic shortcut; this stays funerary and costly." })
    })).status).toBe(201);

    const refusedClose = await app.request(`/api/propagation/runs/${flow.flow.id}/close`, { method: "POST" });
    expect(refusedClose.status).toBe(400);
    expect(await json(refusedClose)).toMatchObject({ error: expect.stringContaining("undispositioned-high-pressure") });

    expect((await app.request("/api/propagation/dispositions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ consequenceId: consequence.consequence.id, disposition: "protected as a mystery boundary", preservationBoundary: "author-secret", note: "Keep the origin of toll authority hidden." })
    })).status).toBe(201);
    for (const orderKey of ["zeroth", "second", "third", "fourth", "fifth"]) {
      expect((await app.request("/api/propagation/consequences", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          flowId: flow.flow.id,
          orderKey,
          body: `Foundational coverage for ${orderKey}.`,
          pressure: "normal"
        })
      })).status).toBe(201);
    }
    for (const [domainName, triage] of [
      ["Physics, metaphysics, and cosmology", "dependency"],
      ["Geography, climate, and infrastructure", "reaction"],
      ["Ecology, food, disease, and nonhuman life", "dependency"],
      ["Population, demography, and household life", "reaction"],
      ["Production, labor, and technology/magic", "dependency"],
      ["Governance, law, and bureaucracy", "reaction"],
      ["War, coercion, and security", "dependency"],
      ["Religion, ritual, myth, and meaning", "reaction"],
      ["Culture, custom, language, and identity", "dependency"],
      ["Knowledge, education, science, and records", "reaction"],
      ["History, memory, and path dependence", "dependency"],
      ["Daily life and material residue", "reaction"]
    ] as const) {
      expect((await app.request("/api/propagation/domains", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ flowId: flow.flow.id, domainName, triage, declaration: `Foundational ${triage} coverage.` })
      })).status).toBe(201);
    }
    const proposed = await json<{ record: { id: number; canonStatus: string }; queue: Array<{ id: number }> }>(await app.request("/api/propagation/propose-fact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId: flow.flow.id, title: "Mortuary toll scrip exists", body: "Debt paper backed by dead witnesses circulates near bridges.", truthLayer: "Objective canon" })
    }));
    expect(proposed.record.canonStatus).toBe("proposed");
    expect(proposed.queue).toEqual(expect.arrayContaining([expect.objectContaining({ id: proposed.record.id })]));
    expect(await json(await app.request(`/api/links?recordId=${proposed.record.id}`))).toMatchObject({
      links: expect.arrayContaining([expect.objectContaining({ linkTypeKey: "derived_from", note: "Propose action provenance" })])
    });

    const closed = await app.request(`/api/propagation/runs/${flow.flow.id}/close`, { method: "POST" });
    expect(closed.status).toBe(201);
    const closedJson = await json<{ report: { id: number; recordTypeKey: string }; debt: { id: number; canonStatus: string } }>(closed);
    expect(closedJson).toMatchObject({ report: { recordTypeKey: "propagation_report" }, debt: { id: debt.debt.id, canonStatus: "accepted" } });
    expect(await json(await app.request(`/api/links?recordId=${fact.record.id}`))).toMatchObject({
      links: expect.arrayContaining([expect.objectContaining({ toRecordId: closedJson.report.id, linkTypeKey: "digest_of" })])
    });
    expect(await json(await app.request(`/api/links?recordId=${proposed.record.id}`))).toMatchObject({
      links: expect.arrayContaining([expect.objectContaining({ toRecordId: closedJson.report.id, linkTypeKey: "derived_from" })])
    });
    expect(await json(await app.request(`/api/records/${closedJson.report.id}/sections`))).toMatchObject({
      sections: expect.arrayContaining([expect.objectContaining({ heading: "Surfaced proposals", body: expect.stringContaining("Mortuary toll scrip exists") })])
    });
    const correction = await app.request(`/api/propagation/reports/${closedJson.report.id}/corrections`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body: "Corrected report prose without editing the original." })
    });
    expect(correction.status).toBe(201);
    const correctionJson = await json<{ report: { id: number; recordTypeKey: string } }>(correction);
    expect(correctionJson.report.recordTypeKey).toBe("propagation_report");
    expect(await json(await app.request(`/api/links?recordId=${correctionJson.report.id}`))).toMatchObject({
      links: expect.arrayContaining([expect.objectContaining({ toRecordId: closedJson.report.id, linkTypeKey: "supersedes" })])
    });
    expect(await json(await app.request("/api/search?q=mortuary"))).toMatchObject({ records: expect.arrayContaining([expect.objectContaining({ id: closedJson.report.id })]) });
  });

  it("drives contradiction repair and mystery boundary governance through the HTTP seam", async () => {
    const app = createApp();
    const path = tempPath("contradiction-world.sqlite");
    expect((await app.request("/api/worlds/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path })
    })).status).toBe(201);

    const fact = await json<{ record: { id: number; shortId: string } }>(await app.request("/api/records", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ recordTypeKey: "canon_fact", title: "Bridge remains", body: "The bridge survived the flood.", truthLayer: "Objective canon", canonStatus: "accepted" })
    }));
    const flow = await json<{ flow: { id: number } }>(await app.request("/api/contradiction/runs/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sourceRecordId: fact.record.id, implicatedRecordIds: [fact.record.id], title: "Bridge conflict" })
    }));
    expect((await app.request("/api/contradiction/triage", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId: flow.flow.id, stepKey: "contradiction_statement", body: "The bridge survived; later records require it destroyed." })
    })).status).toBe(201);
    expect((await app.request("/api/contradiction/scale", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId: flow.flow.id, workScale: "major" })
    })).status).toBe(201);
    expect((await app.request("/api/contradiction/disposition", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId: flow.flow.id, disposition: "repair required" })
    })).status).toBe(201);
    const refusedClose = await app.request(`/api/contradiction/runs/${flow.flow.id}/close`, { method: "POST" });
    expect(refusedClose.status).toBe(400);
    expect(await json(refusedClose)).toMatchObject({ error: expect.stringContaining("repair operations") });

    const prompt = await json<{ prompt: string }>(await app.request("/api/prompts/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ templateKey: "repair_challenge", recordId: fact.record.id, stepKey: "contradiction:repair" })
    }));
    expect(prompt.prompt).toContain("Contradiction hunter");
    const advisory = await json<{ record: { id: number } }>(await app.request("/api/advisory-artifacts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stepKey: "contradiction:repair", promptText: prompt.prompt, responseText: "Challenge response" })
    }));

    expect((await app.request("/api/contradiction/repairs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId: flow.flow.id, operations: ["clarify scope"], repairText: "The bridge right survived; the stone span fell." })
    })).status).toBe(201);
    expect((await app.request("/api/contradiction/repair-targets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId: flow.flow.id, recordId: fact.record.id, nextCanonStatus: "quarantined", newBody: "The stone span fell; the bridge right survived.", advisoryRecordId: advisory.record.id })
    })).status).toBe(201);
    const proposed = await json<{ record: { id: number; canonStatus: string }; queue: Array<{ id: number }> }>(await app.request("/api/contradiction/propose-fact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId: flow.flow.id, title: "Bridge right survives the span", body: "A ferry charter inherits bridge toll law.", truthLayer: "Objective canon" })
    }));
    expect(proposed.record.canonStatus).toBe("proposed");
    expect(proposed.queue).toEqual(expect.arrayContaining([expect.objectContaining({ id: proposed.record.id })]));
    expect(await json(await app.request(`/api/links?recordId=${proposed.record.id}`))).toMatchObject({
      links: expect.arrayContaining([expect.objectContaining({ linkTypeKey: "derived_from", note: "Propose action provenance" })])
    });
    const closed = await app.request(`/api/contradiction/runs/${flow.flow.id}/close`, { method: "POST" });
    expect(closed.status).toBe(201);
    const closedJson = await json<{ report: { id: number; recordTypeKey: string } }>(closed);
    expect(closedJson.report.recordTypeKey).toBe("contradiction_report");
    expect(await json(await app.request(`/api/links?recordId=${proposed.record.id}`))).toMatchObject({
      links: expect.arrayContaining([expect.objectContaining({ toRecordId: closedJson.report.id, linkTypeKey: "derived_from" })])
    });
    expect(await json(await app.request(`/api/records/${closedJson.report.id}/sections`))).toMatchObject({
      sections: expect.arrayContaining([expect.objectContaining({ heading: "Close audit", body: expect.stringContaining("Bridge right survives the span") })])
    });

    const propagationFlow = await json<{ flow: { id: number } }>(await app.request("/api/propagation/runs/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ factRecordId: fact.record.id })
    }));
    const consequence = await json<{ consequence: { id: number } }>(await app.request("/api/propagation/consequences", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId: propagationFlow.flow.id, orderKey: "first", body: "Pilgrims route noon travel around the speaking chapel.", pressure: "high" })
    }));
    expect((await app.request("/api/propagation/domains", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId: propagationFlow.flow.id, domainName: "Daily life and material residue", triage: "direct", declaration: "Travel rituals change around the speaking chapel." })
    })).status).toBe(201);
    expect((await app.request("/api/propagation/dispositions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ consequenceId: consequence.consequence.id, disposition: "protected as a mystery boundary", preservationBoundary: "author-secret" })
    })).status).toBe(201);
    const propagationClosed = await json<{ report: { id: number } }>(await app.request(`/api/propagation/runs/${propagationFlow.flow.id}/close`, { method: "POST" }));
    const owed = await json<{ queue: Array<{ propagationDispositionId: number; protectedRecordId: number }> }>(await app.request("/api/contradiction/owed-boundaries"));
    expect(owed.queue).toEqual([expect.objectContaining({ protectedRecordId: fact.record.id })]);
    const ledger = await json<{ record: { id: number } }>(await app.request("/api/contradiction/mystery-ledgers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        propagationDispositionId: owed.queue[0]!.propagationDispositionId,
        title: "Chapel mouth opacity",
        protectedRecordId: fact.record.id,
        propagationReportRecordId: propagationClosed.report.id,
        effectType: "sacred opacity",
        mysteryState: "author-secret",
        preservationBoundary: "author-secret",
        sections: { "Protected effect type": "sacred opacity", "Puzzle question, if any": "none", "What is fixed": "The mouth speaks at noon." }
      })
    }));
    expect(ledger.record.id).toEqual(expect.any(Number));
    expect(await json(await app.request("/api/contradiction/owed-boundaries"))).toMatchObject({ queue: [] });

    const mysteryFlow = await json<{ flow: { id: number } }>(await app.request("/api/contradiction/runs/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sourceRecordId: fact.record.id, implicatedRecordIds: [fact.record.id], title: "Mystery conflict" })
    }));
    await app.request("/api/contradiction/triage", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId: mysteryFlow.flow.id, stepKey: "contradiction_statement", body: "A repair touches the sacred origin." })
    });
    await app.request("/api/contradiction/scale", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId: mysteryFlow.flow.id, workScale: "major" })
    });
    await app.request("/api/contradiction/disposition", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId: mysteryFlow.flow.id, disposition: "mystery-preserving conflict" })
    });
    expect((await app.request(`/api/contradiction/runs/${mysteryFlow.flow.id}/close`, { method: "POST" })).status).toBe(400);
    const checklist = await json<{ checklist: { sacredOpacityGuardRequired: boolean } }>(await app.request("/api/contradiction/preservation-checklists", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId: mysteryFlow.flow.id, ledgerRecordId: ledger.record.id, protectedRecordId: fact.record.id, operation: "consecrate", effectType: "sacred opacity", body: "Preserve sacred refusal.", sacredGuardBody: "Costs remain fixed." })
    }));
    expect(checklist.checklist.sacredOpacityGuardRequired).toBe(true);
    expect((await app.request(`/api/contradiction/runs/${mysteryFlow.flow.id}/close`, { method: "POST" })).status).toBe(201);
    expect((await app.request("/api/contradiction/skip", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId: mysteryFlow.flow.id, stepKey: "boundary_guard", workScale: "major" })
    })).status).toBe(400);
  });
});
