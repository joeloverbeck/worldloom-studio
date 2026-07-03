import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

let tempDirs: string[] = [];

const tempPath = (name: string) => {
  const dir = mkdtempSync(join(tmpdir(), "worldloom-stage12-"));
  tempDirs.push(dir);
  return join(dir, name);
};

const json = async <T,>(response: Response): Promise<T> => response.json() as Promise<T>;

const postJson = (app: ReturnType<typeof createApp>, path: string, payload?: unknown) =>
  app.request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload)
  });

const putJson = (app: ReturnType<typeof createApp>, path: string, payload: unknown) =>
  app.request(path, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

afterEach(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs = [];
});

describe("Institutional, Economic, and Suppression flow HTTP API", () => {
  it("drives the stage-12 pass report lifecycle, coverage, outcomes, and workbench visibility", async () => {
    const app = createApp();
    expect((await postJson(app, "/api/worlds/create", { path: tempPath("stage12.sqlite") })).status).toBe(201);

    const fact = (await json<{ record: { id: number; shortId: string } }>(await postJson(app, "/api/records", {
      recordTypeKey: "canon_fact",
      title: "Bridge ghosts sell toll testimony",
      body: "Dead witnesses can charge living merchants for safe bridge crossings.",
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    }))).record;
    const debt = (await json<{ debt: { id: number } }>(await postJson(app, "/api/canon-debt", {
      name: `Stage-12 owed for ${fact.shortId}`,
      scope: "institutional economic suppression",
      assignee: "steward",
      body: "Work the institutional, economic, and suppression consequences."
    }))).debt;

    const factRun = await json<{ flow: { id: number }; report: { id: number; recordTypeKey: string }; source: { sourceType: string }; doctrine: { lenses: Array<{ key: string; label: string }> }; closeReadiness: { status: string; blockers: Array<{ key: string }> } }>(await postJson(app, "/api/institutional/runs/start", {
      sourceType: "fact",
      recordId: fact.id
    }));
    expect(factRun.source.sourceType).toBe("fact");
    expect(factRun.report).toMatchObject({ recordTypeKey: "pass_report" });
    expect(factRun.doctrine.lenses.map((lens) => lens.key)).toEqual([
      "action_arena",
      "rules_in_use",
      "transaction_cost",
      "surplus_capture",
      "suppression_residue",
      "counter_institution",
      "synthesis_sentence",
      "daily_life_residue",
      "power_conflict"
    ]);
    expect(factRun.closeReadiness).toMatchObject({ status: "blocked" });

    const resumed = await json<{ flow: { id: number }; report: { id: number } }>(await postJson(app, "/api/institutional/runs/start", {
      sourceType: "fact",
      recordId: fact.id
    }));
    expect(resumed.flow.id).toBe(factRun.flow.id);
    expect(resumed.report.id).toBe(factRun.report.id);

    const debtRun = await json<{ source: { sourceType: string; sourceRecordId: number } }>(await postJson(app, "/api/institutional/runs/start", {
      sourceType: "canon_debt",
      recordId: debt.id
    }));
    expect(debtRun.source).toMatchObject({ sourceType: "canon_debt", sourceRecordId: debt.id });
    const materialRun = await json<{ source: { sourceType: string; materialTitle: string } }>(await postJson(app, "/api/institutional/runs/start", {
      sourceType: "material",
      materialTitle: "Bridge toll scene",
      materialBody: "Merchants haggle with ghosts at the west arch."
    }));
    expect(materialRun.source).toMatchObject({ sourceType: "material", materialTitle: "Bridge toll scene" });

    await putJson(app, `/api/records/${fact.id}/sections`, {
      sections: [{ heading: "Fact statement", body: "Ghost testimony creates bridge toll offices.", position: 1 }]
    });
    const sectionRun = await json<{ source: { sourceType: string; sourceRecordId: number; sourceSectionHeading: string } }>(await postJson(app, "/api/institutional/runs/start", {
      sourceType: "record_section",
      recordId: fact.id,
      sectionHeading: "Fact statement"
    }));
    expect(sectionRun.source).toMatchObject({ sourceType: "record_section", sourceRecordId: fact.id, sourceSectionHeading: "Fact statement" });

    const checkboxOnly = await postJson(app, "/api/institutional/coverage", {
      flowId: factRun.flow.id,
      lensKey: "action_arena",
      body: "checked"
    });
    expect(checkboxOnly.status).toBe(400);
    expect(await json(checkboxOnly)).toMatchObject({ error: expect.stringContaining("steward-authored substance") });

    for (const lens of factRun.doctrine.lenses) {
      const response = await postJson(app, "/api/institutional/coverage", {
        flowId: factRun.flow.id,
        lensKey: lens.key,
        body: `${lens.label}: bridge courts, merchant families, mortuary advocates, and smugglers now have concrete consequences to track.`
      });
      expect(response.status, lens.key).toBe(201);
    }

    const actionArena = await json<{ card: { id: number; recordTypeKey: string; canonStatus: string }; closeReadiness: { status: string } }>(await postJson(app, "/api/institutional/cards", {
      flowId: factRun.flow.id,
      cardTypeKey: "action_arena",
      title: "Bridge toll hearing",
      body: "Merchants, ghosts, and guards contest whether testimony buys passage."
    }));
    expect(actionArena.card).toMatchObject({ recordTypeKey: "action_arena", canonStatus: "proposed" });
    const institution = await json<{ card: { id: number; recordTypeKey: string } }>(await postJson(app, "/api/institutional/cards", {
      flowId: factRun.flow.id,
      cardTypeKey: "institution",
      title: "Mortuary toll office",
      body: "A formal office licenses dead witnesses and prices bridge testimony."
    }));
    const counterInstitution = await json<{ card: { id: number; recordTypeKey: string } }>(await postJson(app, "/api/institutional/cards", {
      flowId: factRun.flow.id,
      cardTypeKey: "counter_institution",
      title: "Lantern smugglers",
      body: "A rival network escorts merchants outside the licensed toll route."
    }));
    expect([institution.card.recordTypeKey, counterInstitution.card.recordTypeKey]).toEqual(["institution", "counter_institution"]);

    const prompt = await json<{ prompt: string; promptOut: { flowKey: string; flowId: number; stepKey: string } }>(await postJson(app, "/api/prompt-out/generate", {
      flowKey: "institutional_economic_suppression",
      flowId: factRun.flow.id,
      templateKey: "institution_economy_analyst",
      recordId: fact.id,
      stepKey: "stage12:analysis"
    }));
    expect(prompt.prompt).toContain("Institution/economy analyst");
    expect(prompt.prompt).toContain("Flow: institutional_economic_suppression");
    expect(prompt.prompt).toContain(`Flow id: ${factRun.flow.id}`);
    expect(prompt.prompt).toContain("Step: stage12:analysis");

    const advisory = await json<{ record: { id: number } }>(await postJson(app, "/api/institutional/advisory-artifacts", {
      flowId: factRun.flow.id,
      stepKey: "stage12:analysis",
      promptText: prompt.prompt,
      responseText: "The toll office will suppress free ghost testimony."
    }));
    const blockedAdvisoryUse = await postJson(app, "/api/institutional/proposals", {
      flowId: factRun.flow.id,
      lensKey: "suppression_residue",
      advisoryRecordId: advisory.record.id,
      title: "Free ghost testimony is suppressed",
      body: "The toll office classifies free testimony as fraud.",
      truthLayer: "Objective canon"
    });
    expect(blockedAdvisoryUse.status).toBe(400);
    expect(await json(blockedAdvisoryUse)).toMatchObject({ error: expect.stringContaining("explicit disposition") });
    expect((await postJson(app, `/api/prompt-out/advisory-artifacts/${advisory.record.id}/dispositions`, {
      disposition: "selected",
      note: "Use only the suppression pressure, not its wording."
    })).status).toBe(201);

    const proposal = await json<{ record: { id: number; canonStatus: string }; queue: Array<{ id: number }> }>(await postJson(app, "/api/institutional/proposals", {
      flowId: factRun.flow.id,
      lensKey: "suppression_residue",
      advisoryRecordId: advisory.record.id,
      title: "Free ghost testimony is suppressed",
      body: "The toll office classifies free testimony as fraud.",
      truthLayer: "Objective canon"
    }));
    expect(proposal.record.canonStatus).toBe("proposed");
    expect(proposal.queue).toEqual(expect.arrayContaining([expect.objectContaining({ id: proposal.record.id })]));

    const followUpDebt = await json<{ debt: { id: number; recordTypeKey: string }; closeReadiness: { status: string } }>(await postJson(app, "/api/institutional/debt", {
      flowId: factRun.flow.id,
      lensKey: "power_conflict",
      name: "Resolve toll rebellion reprisals",
      reason: "The pass found likely violence but not its outcome.",
      severityOrConsequenceMode: "major"
    }));
    expect(followUpDebt.debt).toMatchObject({ recordTypeKey: "canon_debt" });

    const majorSkip = await postJson(app, "/api/institutional/skips", {
      flowId: factRun.flow.id,
      stepKey: "black_market_depth",
      admissionLevel: "3",
      workScale: "major",
      unresolved: true
    });
    expect(majorSkip.status).toBe(400);
    const skip = await json<{ record: { id: number }; debt: { id: number } }>(await postJson(app, "/api/institutional/skips", {
      flowId: factRun.flow.id,
      stepKey: "black_market_depth",
      admissionLevel: "3",
      workScale: "major",
      reason: "Black-market details need a later scene pass.",
      unresolved: true,
      debtName: "Stage-12 black-market follow-up"
    }));
    expect(skip.debt.id).toBeGreaterThan(0);

    const ready = await json<{ closeReadiness: { status: string; blockers: unknown[] }; linkedCards: unknown[]; proposals: unknown[]; debt: unknown[]; skips: unknown[] }>(await app.request(`/api/institutional/runs/${factRun.flow.id}`));
    expect(ready.closeReadiness).toMatchObject({ status: "ready", blockers: [] });
    expect(ready.linkedCards).toHaveLength(3);
    expect(ready.proposals).toHaveLength(1);
    expect(ready.debt).toHaveLength(2);
    expect(ready.skips).toHaveLength(1);

    const closed = await json<{ flow: { state: string; current_step: string }; report: { id: number; recordTypeKey: string } }>(await postJson(app, `/api/institutional/runs/${factRun.flow.id}/close`));
    expect(closed.flow).toMatchObject({ state: "complete", current_step: "stage12:complete" });
    expect(closed.report.id).toBe(factRun.report.id);
    expect((await postJson(app, "/api/institutional/runs/start", {
      sourceType: "pass_report",
      reportRecordId: factRun.report.id
    })).status).toBe(400);

    const reportSections = await json<{ sections: Array<{ heading: string; body: string }> }>(await app.request(`/api/records/${factRun.report.id}/sections`));
    expect(reportSections.sections).toEqual(expect.arrayContaining([
      expect.objectContaining({ heading: "Coverage lenses", body: expect.stringContaining("Bridge toll hearing") }),
      expect.objectContaining({ heading: "Linked cards", body: expect.stringContaining("Mortuary toll office") }),
      expect.objectContaining({ heading: "Admission proposals", body: expect.stringContaining("Free ghost testimony is suppressed") }),
      expect.objectContaining({ heading: "Canon debt", body: expect.stringContaining("Stage-12 black-market follow-up") }),
      expect.objectContaining({ heading: "Prompt-out and skips", body: expect.stringContaining("Black-market details need a later scene pass") })
    ]));

    const detail = await json<{
      relatedReports: Array<{ id: number; recordTypeKey: string }>;
      canonDebt: Array<{ id: number }>;
      skipRecords: Array<{ id: number }>;
      advisoryArtifacts: Array<{ record: { id: number } }>;
    }>(await app.request(`/api/canon-workbench/records/${fact.id}`));
    expect(detail.relatedReports).toEqual(expect.arrayContaining([expect.objectContaining({ id: factRun.report.id, recordTypeKey: "pass_report" })]));
    expect(detail.canonDebt).toEqual(expect.arrayContaining([expect.objectContaining({ id: followUpDebt.debt.id })]));
    expect(detail.skipRecords).toEqual(expect.arrayContaining([expect.objectContaining({ id: skip.record.id })]));
    expect(detail.advisoryArtifacts).toEqual(expect.arrayContaining([expect.objectContaining({ record: expect.objectContaining({ id: advisory.record.id }) })]));

    const audit = await json<{ spine: Array<{ record: { id: number }; attachments: { flowRelationships: Array<{ kind: string }>; typedLinkCreations: Array<{ toRecordId: number; linkTypeKey: string }> } }> }>(await app.request("/api/canon-workbench/audit"));
    const stage12Item = audit.spine.find((item) => item.record.id === factRun.report.id);
    expect(stage12Item?.attachments.flowRelationships).toEqual(expect.arrayContaining([expect.objectContaining({ kind: "stage12_subject" })]));
    expect(stage12Item?.attachments.typedLinkCreations).toEqual(expect.arrayContaining([expect.objectContaining({ toRecordId: actionArena.card.id, linkTypeKey: "covers" })]));
  });
});
