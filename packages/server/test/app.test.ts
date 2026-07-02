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

    const failedOpen = await app.request("/api/worlds/open", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: tempPath("missing.sqlite") })
    });
    expect(failedOpen.status).toBe(400);
    expect((await app.request("/api/records")).status).toBe(409);
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
      templates: expect.arrayContaining([expect.objectContaining({ key: "kernel_pressure", current_text: "Custom pressure text", original_text: expect.stringContaining("Given this canon fact") })])
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
        seeds: [{ title: "Echo court testimony", body: "Courts accept echo testimony under conditions", truthLayer: "Objective canon", canonStatus: "proposed" }]
      })
    });
    expect(decomposed.status).toBe(201);
    expect(await json(decomposed)).toMatchObject({ records: [{ canonStatus: "proposed" }] });
  });
});
