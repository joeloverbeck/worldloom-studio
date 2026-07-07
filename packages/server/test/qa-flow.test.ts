import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import Database from "better-sqlite3";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

let tempDirs: string[] = [];

const tempPath = (name: string) => {
  const dir = mkdtempSync(join(tmpdir(), "worldloom-qa-"));
  tempDirs.push(dir);
  return join(dir, name);
};

const explicitAccepted = {
  truthLayer: "Objective canon",
  canonStatus: "accepted"
};

const json = async <T,>(response: Response): Promise<T> => response.json() as Promise<T>;

const fullGateSections = async (app: ReturnType<typeof createApp>, recordId: number, context: string) => {
  const response = await app.request(`/api/admission/records/${recordId}/gate`);
  expect(response.status).toBe(200);
  const payload = await json<{
    decisionPoint: {
      fullGateContract: {
        sections: Array<{ key: string; label: string; quietDomain: boolean }>;
      };
    };
  }>(response);
  return payload.decisionPoint.fullGateContract.sections.map((section) => ({
    key: section.key,
    substance: `${section.label} substance for ${context}.`,
    ...(section.quietDomain ? { quietDomainDeclaration: `No quiet-domain omission for ${context}.` } : {})
  }));
};

afterEach(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs = [];
});

describe("QA flow HTTP seam", () => {
  it("drives QA pass start, scorecard, profile, floor, repair routing, prompt-out, skips, and finalize", async () => {
    const app = createApp();
    const path = tempPath("qa-world.sqlite");
    expect((await app.request("/api/worlds/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path })
    })).status).toBe(201);

    const subject = await json<{ record: { id: number; shortId: string } }>(await app.request("/api/records", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        recordTypeKey: "canon_fact",
        title: "Moon eats oaths",
        body: "Broken oaths are eaten by the moon each month.",
        ...explicitAccepted
      })
    }));
    expect((await app.request(`/api/records/${subject.record.id}/facets`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ vocabulary: "consequence_mode", term: "mythic" })
    })).status).toBe(201);

    const started = await app.request("/api/qa/passes/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subjectType: "record", subjectRecordId: subject.record.id, title: "QA moon oaths" })
    });
    expect(started.status).toBe(201);
    const startedJson = await json<{
      flow: { id: number; current_step: string };
      pass: { id: number; recordTypeKey: string };
      scorecard: { tests: Array<{ number: number; name: string; failureSmell: string; anchors: { weak: string; adequate: string; strong: string } }>; subjectMode: string | null; doctrine: { redFlags: string[] } };
      band: { color: string; persisted: boolean };
    }>(started);
    expect(startedJson.pass.recordTypeKey).toBe("qa_pass");
    expect(startedJson.flow.current_step).toBe("qa:entry");
    expect(startedJson.scorecard.tests).toHaveLength(28);
    expect(startedJson.scorecard.tests.map((test) => test.number)).not.toEqual(expect.arrayContaining(["P1", "P2"]));
    expect(startedJson.scorecard.tests[0]).toMatchObject({
      number: 1,
      name: "Consequence test",
      failureSmell: expect.stringContaining("nothing changes"),
      anchors: {
        weak: expect.stringContaining("Broken promises"),
        adequate: expect.stringContaining("shame songs"),
        strong: expect.stringContaining("courtship rites")
      }
    });
    expect(startedJson.scorecard.subjectMode).toBe("mythic");
    expect(startedJson.scorecard.doctrine.redFlags).toEqual(expect.arrayContaining([expect.stringContaining("Nobody thought of that")]));
    expect(startedJson.band).toMatchObject({ color: "unscored", persisted: false });
    expect(await json(await app.request(`/api/links?recordId=${startedJson.pass.id}`))).toMatchObject({
      links: expect.arrayContaining([expect.objectContaining({ toRecordId: subject.record.id, linkTypeKey: "assesses" })])
    });

    const worldPass = await json<{ pass: { id: number }; scorecard: { subjectMode: string | null } }>(await app.request("/api/qa/passes/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subjectType: "world", title: "Whole-world QA" })
    }));
    expect(worldPass.scorecard.subjectMode).toBe(null);
    expect(await json(await app.request(`/api/links?recordId=${worldPass.pass.id}`))).toMatchObject({ links: [] });

    const badNa = await app.request("/api/qa/scores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId: startedJson.flow.id, testNumber: 1, score: "na" })
    });
    expect(badNa.status).toBe(400);
    expect(await json(badNa)).toMatchObject({ error: expect.stringContaining("n/a reason") });

    const naScore = await app.request("/api/qa/scores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId: startedJson.flow.id, testNumber: 1, score: "na", naReason: "No branch mechanics in this subject.", notes: "Single-record QA." })
    });
    expect(naScore.status).toBe(201);
    const lowScore = await json<{ band: { color: string; persisted: boolean } }>(await app.request("/api/qa/scores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        flowId: startedJson.flow.id,
        testNumber: 2,
        score: "0",
        notes: "The oath-eating moon has no prior rite yet.",
        requiredRepair: "Name the rite that makes oath-eating possible.",
        loadBearing: true,
        repairRouted: true
      })
    }));
    expect(lowScore.band).toMatchObject({ color: "yellow", persisted: false });
    expect(await json(await app.request(`/api/qa/passes/${startedJson.flow.id}`))).toMatchObject({
      flow: { id: startedJson.flow.id },
      scores: expect.arrayContaining([
        expect.objectContaining({ testNumber: 1, score: "na", naReason: "No branch mechanics in this subject." }),
        expect.objectContaining({ testNumber: 2, score: "0", requiredRepair: "Name the rite that makes oath-eating possible." })
      ])
    });

    const profile = await app.request("/api/qa/profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        flowId: startedJson.flow.id,
        fields: {
          strongestDomain: "Ritual recurrence",
          weakestDomain: "Prerequisites",
          mostDangerousUnderPropagatedFact: "Moon eats oaths",
          mostLikelyContradiction: "The moon eats oaths but courts ignore it",
          mostFragileMystery: "Why the moon hungers",
          mostOverloadedConstraint: "Monthly only",
          mostSuspiciousAbsentInstitutionResponse: "No oath rite",
          mostAtRiskAestheticDrift: "Pretty image without residue",
          canonDebtBeforeFoundationalFacts: "Oath-eating rite debt"
        },
        recordLinkIds: [subject.record.id]
      })
    });
    expect(profile.status).toBe(201);
    expect(await json(await app.request(`/api/records/${startedJson.pass.id}/sections`))).toMatchObject({
      sections: expect.arrayContaining([
        expect.objectContaining({
          heading: "Regression profile",
          body: expect.stringContaining("strongest domain: Ritual recurrence")
        })
      ])
    });

    const badFloorOverride = await app.request("/api/qa/floor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        flowId: startedJson.flow.id,
        conditions: {
          repeatableHighImpactCapability: true,
          lacksAccessLimits: true,
          lacksCost: true,
          lacksCountermeasure: true,
          lacksActorAdaptation: true,
          lacksTemporalResidue: true,
          lacksDistributionPattern: true,
          lacksInstitutionOrModeEquivalent: true
        },
        override: true,
        workScale: "major"
      })
    });
    expect(badFloorOverride.status).toBe(400);
    expect(await json(badFloorOverride)).toMatchObject({ error: expect.stringContaining("override reason") });

    const floor = await app.request("/api/qa/floor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        flowId: startedJson.flow.id,
        conditions: {
          repeatableHighImpactCapability: true,
          lacksAccessLimits: true,
          lacksCost: true,
          lacksCountermeasure: true,
          lacksActorAdaptation: true,
          lacksTemporalResidue: true,
          lacksDistributionPattern: true,
          lacksInstitutionOrModeEquivalent: true
        },
        override: true,
        overrideReason: "The rite is intentionally being admitted as debt before new foundations.",
        workScale: "major"
      })
    });
    expect(floor.status).toBe(201);
    expect(await json(floor)).toMatchObject({ verdict: { triggered: true, override: true, blocked: false } });

    const proposed = await json<{ record: { id: number; canonStatus: string }; queue: Array<{ id: number }> }>(await app.request("/api/qa/repairs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        flowId: startedJson.flow.id,
        testNumber: 2,
        repairKind: "fact",
        repairText: "Create the oath rite as a proposed canon fact.",
        candidate: { title: "Moon-oath rite exists", body: "Vows are witnessed under a monthly moon rite.", truthLayer: "Objective canon" }
      })
    }));
    expect(proposed.record.canonStatus).toBe("proposed");
    expect(proposed.queue).toEqual(expect.arrayContaining([expect.objectContaining({ id: proposed.record.id })]));
    expect(await json(await app.request(`/api/links?recordId=${proposed.record.id}`))).toMatchObject({
      links: expect.arrayContaining([expect.objectContaining({ toRecordId: startedJson.pass.id, linkTypeKey: "derived_from" })])
    });
    const db = new Database(path, { readonly: true });
    try {
      expect(db.prepare("SELECT COUNT(*) AS count FROM jurisdiction_events WHERE record_id = ?").get(proposed.record.id)).toMatchObject({ count: 0 });
    } finally {
      db.close();
    }

    const debtRepair = await json<{ debt: { id: number; title: string } }>(await app.request("/api/qa/repairs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        flowId: startedJson.flow.id,
        testNumber: 15,
        repairKind: "canon_debt",
        debtKind: "contradiction",
        debtName: "Court oath contradiction",
        repairText: "Courts must answer what happens when an eaten oath is disputed."
      })
    }));
    expect(debtRepair.debt.title).toBe("Court oath contradiction");
    expect(await json(await app.request(`/api/links?recordId=${startedJson.pass.id}`))).toMatchObject({
      links: expect.arrayContaining([expect.objectContaining({ toRecordId: debtRepair.debt.id, linkTypeKey: "requires_follow_up" })])
    });

    expect((await app.request(`/api/admission/records/${proposed.record.id}/severity`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ admissionLevel: "4", workScale: "severe" })
    })).status).toBe(200);
    const admission = await app.request("/api/admission/gate/complete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        recordId: proposed.record.id,
        truthLayer: "Objective canon",
        canonStatus: "accepted",
        operations: ["accept"],
        consequenceText: "The new oath rite creates a standing court obligation.",
        sections: await fullGateSections(app, proposed.record.id, "moon oath proposal")
      })
    });
    expect(admission.status).toBe(201);
    expect(await json(admission)).toMatchObject({ warnings: expect.arrayContaining([expect.objectContaining({ id: debtRepair.debt.id })]) });

    const prompt = await json<{ prompt: string; promptOut: { flowKey: string; templateKey: string } }>(await app.request("/api/prompt-out/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowKey: "qa", flowId: startedJson.flow.id, templateKey: "qa_red_team", recordId: subject.record.id, stepKey: "qa:red-team" })
    }));
    expect(prompt.promptOut).toMatchObject({ flowKey: "qa", templateKey: "qa_red_team" });
    expect(prompt.prompt).toContain("hostile reader");
    expect(prompt.prompt).toContain("What fact would a hostile reader exploit");

    const advisory = await json<{ record: { id: number; recordTypeKey: string; body: string } }>(await app.request("/api/prompt-out/advisory-artifacts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowKey: "qa", flowId: startedJson.flow.id, stepKey: "qa:red-team", promptText: prompt.prompt, responseText: "The courts dodge the moon." })
    }));
    expect(advisory.record.recordTypeKey).toBe("advisory_artifact");
    expect(advisory.record.body).toContain("Flow: qa");
    expect((await app.request(`/api/prompt-out/advisory-artifacts/${advisory.record.id}/dispositions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ disposition: "standing ruling", note: "Always pressure courts.", standingRuling: true })
    })).status).toBe(201);
    const majorSkip = await app.request("/api/prompt-out/skip", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowKey: "qa", flowId: startedJson.flow.id, stepKey: "qa:red-team", workScale: "major" })
    });
    expect(majorSkip.status).toBe(400);
    expect((await app.request("/api/prompt-out/skip", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowKey: "qa", flowId: startedJson.flow.id, stepKey: "qa:red-team", workScale: "minor" })
    })).status).toBe(201);

    const badFinalizePass = await json<{ flow: { id: number } }>(await app.request("/api/qa/passes/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subjectType: "record", subjectRecordId: subject.record.id, title: "Bad finalize" })
    }));
    expect((await app.request("/api/qa/scores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flowId: badFinalizePass.flow.id, testNumber: 3, score: "0", loadBearing: true, repairRouted: true })
    })).status).toBe(201);
    const refusedFinalize = await app.request(`/api/qa/passes/${badFinalizePass.flow.id}/finalize`, { method: "POST" });
    expect(refusedFinalize.status).toBe(400);
    expect(await json(refusedFinalize)).toMatchObject({ error: expect.stringContaining("required repair") });

    const finalized = await app.request(`/api/qa/passes/${startedJson.flow.id}/finalize`, { method: "POST" });
    expect(finalized.status).toBe(201);
    expect(await json(finalized)).toMatchObject({
      flow: { state: "complete", current_step: "qa:complete" },
      pass: { id: startedJson.pass.id, recordTypeKey: "qa_pass" },
      band: { color: "yellow", persisted: false }
    });
  });
});
