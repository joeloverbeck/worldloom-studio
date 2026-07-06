import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

let tempDirs: string[] = [];

const tempPath = (name: string) => {
  const dir = mkdtempSync(join(tmpdir(), "worldloom-temporal-"));
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

afterEach(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs = [];
});

describe("Temporal/Timeline flow HTTP API", () => {
  it("drives Temporal run entry, lifecycle writes, Prompt-out, outcomes, skips, and close readiness", async () => {
    const app = createApp();
    expect((await postJson(app, "/api/worlds/create", { path: tempPath("temporal.sqlite") })).status).toBe(201);

    const fact = (await json<{ record: { id: number; shortId: string } }>(await postJson(app, "/api/records", {
      recordTypeKey: "canon_fact",
      title: "The salt bell tolls before deaths",
      body: "A salt bell rings three days before a named citizen dies.",
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    }))).record;
    const capability = (await json<{ record: { id: number } }>(await postJson(app, "/api/records", {
      recordTypeKey: "capability",
      title: "Death-bell hearing",
      body: "Witnesses can hear death-bell warnings across ward lines.",
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    }))).record;
    const debt = (await json<{ debt: { id: number } }>(await postJson(app, "/api/canon-debt", {
      name: `Temporal audit owed for ${fact.shortId}`,
      scope: "temporal timeline",
      assignee: "steward",
      body: "Work the bell's dates, latency, residue, and mystery boundaries."
    }))).debt;

    const run = await json<{
      flow: { id: number; state: string; current_step: string };
      report: { id: number; recordTypeKey: string; title: string };
      source: { sourceType: string; sourceRecordId: number | null; sourceSummary: string; triggerRecommendation: string };
      doctrine: { flowKey: string; protocol: string; checklist: string; template: string; stepMap: Array<{ key: string }>; handoffs: string[] };
      closeReadiness: { status: string; blockers: Array<{ key: string; classification: string }> };
      promptOut: { available: boolean; templateKey: string; role: string; coldUseEvidence: string };
      decisionPoint: {
        sharedContract: {
          contractVersion: string;
          flow: { key: string; runState: string };
          step: { localDecision: string; packageSource: string };
          obligations: { required: string[]; optional: string[]; skippable: string[]; severityDependent: string[] };
          bearingContext: { displayed: string[]; sourceManifest: string[]; omissions: string[] };
          promptOut: { modes: Array<{ mode: string; availability: string; blocker: string | null; framing: string }> };
          blockers: Array<{ key: string }>;
          writeIntent: { willWrite: string[]; willRouteOnward: string[]; willLeaveUntouched: string[] };
        };
      };
    }>(await postJson(app, "/api/temporal/runs/start", { sourceType: "fact", recordId: fact.id }));

    expect(run.source).toMatchObject({ sourceType: "fact", sourceRecordId: fact.id });
    expect(run.report).toMatchObject({ recordTypeKey: "pass_report", title: expect.stringContaining("Temporal/Timeline pass") });
    expect(run.doctrine).toMatchObject({
      flowKey: "temporal_timeline",
      protocol: "docs/worldbuilding-system/09_temporal_and_timeline_protocol.md",
      checklist: "docs/worldbuilding-system/checklists/temporal_timeline_sweep.md",
      template: "docs/worldbuilding-system/templates/temporal_timeline_card.md"
    });
    expect(run.doctrine.stepMap.map((step) => step.key)).toEqual([
      "run_entry",
      "temporal_questions",
      "date_type_granularity",
      "latency_assessment",
      "residue_by_timescale",
      "sequence_integrity",
      "retrospective_insertion",
      "temporal_mystery_boundaries",
      "outcomes",
      "prompt_out_skips",
      "close_preview",
      "read_side_trail"
    ]);
    expect(run.source.triggerRecommendation).toContain("first appearance");
    expect(run.closeReadiness).toMatchObject({
      status: "blocked",
      blockers: expect.arrayContaining([
        expect.objectContaining({ key: "first_true_sequence", classification: "missing_required_coverage" }),
        expect.objectContaining({ key: "latency", classification: "missing_required_coverage" }),
        expect.objectContaining({ key: "residue", classification: "missing_required_coverage" }),
        expect.objectContaining({ key: "sequence_integrity", classification: "missing_required_coverage" })
      ])
    });
    expect(run.promptOut).toMatchObject({
      available: false,
      templateKey: "temporal_spatial_analyst",
      role: "Spatial-temporal analyst"
    });
    expect(run.decisionPoint.sharedContract).toMatchObject({
      contractVersion: "decision-point/v1",
      flow: { key: "temporal_timeline" },
      step: {
        localDecision: expect.stringContaining("source and trigger recommendation"),
        packageSource: "docs/worldbuilding-system/09_temporal_and_timeline_protocol.md"
      },
      obligations: {
        required: expect.arrayContaining(["First-true or relative sequence", "Plausible latency", "Residue by timescale", "Sequence-integrity answer"]),
        optional: expect.arrayContaining(["Temporal timeline card", "Admission proposal", "Canon debt", "Prompt-out advisory support"]),
        skippable: expect.arrayContaining(["Offered Temporal instruments write skip_record entries when declined"]),
        severityDependent: expect.arrayContaining(["Level 2+ facts owe the full Temporal audit recommendation"])
      },
      promptOut: {
        modes: expect.arrayContaining([
          expect.objectContaining({ mode: "proposal", availability: "available", blocker: null }),
          expect.objectContaining({ mode: "pressure", availability: "blocked", blocker: expect.stringContaining("steward-authored Temporal material") })
        ])
      },
      blockers: expect.arrayContaining([expect.objectContaining({ key: "first_true_sequence" })]),
      writeIntent: {
        willRouteOnward: expect.arrayContaining(["Admission proposals", "canon debt", "read-side trail"]),
        willLeaveUntouched: expect.arrayContaining([
          "Temporal never admits facts in-pass",
          "the app does not classify trigger applicability, date type, granularity, or canon standing"
        ])
      }
    });
    expect(run.decisionPoint.sharedContract.bearingContext.displayed.join("\n")).toContain("trigger recommendation");

    const resumed = await json<{ flow: { id: number }; report: { id: number } }>(await postJson(app, "/api/temporal/runs/start", { sourceType: "fact", recordId: fact.id }));
    expect(resumed.flow.id).toBe(run.flow.id);
    expect(resumed.report.id).toBe(run.report.id);

    for (const startPayload of [
      { sourceType: "capability", recordId: capability.id },
      { sourceType: "canon_debt", recordId: debt.id },
      { sourceType: "material", materialTitle: "Bell ordinance", materialBody: "The first death-bell law arrives after three false positives." },
      { sourceType: "pass_report", reportRecordId: run.report.id }
    ]) {
      const response = await postJson(app, "/api/temporal/runs/start", startPayload);
      expect(response.status, JSON.stringify(startPayload)).toBe(201);
    }

    const weakCoverage = await postJson(app, "/api/temporal/coverage", {
      flowId: run.flow.id,
      temporalQuestions: "checked",
      firstTrueOrRelativeSequence: "checked",
      firstKnownOrReason: "none",
      dateTypesAndGranularity: "checked",
      latency: "none",
      residueByTimescale: "checked",
      sequenceIntegrity: "checked",
      retrospectiveInsertion: "checked",
      temporalMysteryBoundaries: "checked",
      outcomeDecision: "checked"
    });
    expect(weakCoverage.status).toBe(400);
    expect(await json(weakCoverage)).toMatchObject({ error: expect.stringContaining("steward-authored substance") });

    const coverage = await json<{
      coverage: { firstTrueOrRelativeSequence: string; dateTypesAndGranularity: string };
      closeReadiness: { status: string; blockers: unknown[] };
      promptOut: { available: boolean };
    }>(await postJson(app, "/api/temporal/coverage", {
      flowId: run.flow.id,
      temporalQuestions: "Ask when the bell first became true, when people noticed it, and what changed before institutions believed it.",
      firstTrueOrRelativeSequence: "The first true bell-ring precedes the first public death by three days and follows the salt-foundry accident.",
      firstKnownOrReason: "Witnesses first know the pattern after the third matched death; before then each bell is treated as rumor.",
      dateTypesAndGranularity: "Event date, discovery date, public date, institutional date, ordinary-life date, and mythic date remain separate prose facets at ward-season granularity.",
      latency: "Discovery delay lasts three deaths; legal delay lasts two seasons while the ward courts test false positives.",
      residueByTimescale: "Days bring panic and opportunists, years bring licenses and insurance, generations leave bell-law offices and funeral calendars.",
      sequenceIntegrity: "The ordinance cannot predate the third matched death; earlier scenes keep rumors local and suppressed.",
      retrospectiveInsertion: "Existing scenes need old price boards, bell jokes, and one archived false-positive case rather than a universal rewrite.",
      temporalMysteryBoundaries: "The bell's cause remains author-secret, but observable recurrence windows, false positives, and forbidden uses are recorded.",
      outcomeDecision: "Timing is load-bearing for the law, so create a temporal timeline card and route one archive fact to Admission."
    }));
    expect(coverage.coverage.dateTypesAndGranularity).toContain("Event date");
    expect(coverage.closeReadiness).toMatchObject({ status: "ready", blockers: [] });
    expect(coverage.promptOut.available).toBe(true);

    const ready = await json<{
      decisionPoint: { sharedContract: { promptOut: { modes: Array<{ mode: string; availability: string }> } } };
      closeReadiness: { status: string };
    }>(await app.request(`/api/temporal/runs/${run.flow.id}`));
    expect(ready.closeReadiness.status).toBe("ready");
    expect(ready.decisionPoint.sharedContract.promptOut.modes).toEqual(expect.arrayContaining([
      expect.objectContaining({ mode: "pressure", availability: "available" })
    ]));

    const promptStep = await json<{ step: { actions: { generate: { href: string }; storeAdvisory: { href: string }; disposition: { href: string }; skip: { href: string } } } }>(await postJson(app, "/api/prompt-out/steps", {
      flowKey: "temporal_timeline",
      flowId: run.flow.id,
      templateKey: "temporal_spatial_analyst",
      recordId: fact.id,
      stepKey: "temporal:latency",
      mode: "pressure",
      label: "Spatial-temporal analyst"
    }));
    const prompt = await json<{ prompt: string }>(await postJson(app, promptStep.step.actions.generate.href));
    expect(prompt.prompt).toContain("Spatial-temporal analyst");
    expect(prompt.prompt).toContain("Flow: temporal_timeline");
    expect(prompt.prompt).toContain("Source manifest:");
    expect(prompt.prompt).toContain("Advisory/canon warning");
    expect(prompt.prompt).toContain("date type");
    expect(prompt.prompt).toContain("granularity");

    const advisory = await json<{ record: { id: number; recordTypeKey: string } }>(await postJson(app, promptStep.step.actions.storeAdvisory.href, {
      promptText: prompt.prompt,
      responseText: "The ward courts should keep a false-positive archive before the first law."
    }));
    expect(advisory.record.recordTypeKey).toBe("advisory_artifact");
    expect((await postJson(app, promptStep.step.actions.disposition.href, {
      advisoryRecordId: advisory.record.id,
      disposition: "selected",
      note: "Use only the archive pressure."
    })).status).toBe(201);

    const unlabeledCard = await postJson(app, "/api/temporal/cards", {
      flowId: run.flow.id,
      title: "Unlabeled temporal card"
    });
    expect(unlabeledCard.status).toBe(400);
    expect(await json(unlabeledCard)).toMatchObject({ error: expect.stringContaining("steward-authored truth layer and canon status") });

    const unlabeledProposal = await postJson(app, "/api/temporal/proposals", {
      flowId: run.flow.id,
      sourceStep: "temporal:outcomes",
      title: "Unlabeled archive fact",
      body: "Ward courts keep archives before the first ordinance."
    });
    expect(unlabeledProposal.status).toBe(400);
    expect(await json(unlabeledProposal)).toMatchObject({ error: expect.stringContaining("steward-authored truth layer") });

    const card = await json<{ card: { id: number; recordTypeKey: string; canonStatus: string; body: string }; readSideTrail: unknown[] }>(await postJson(app, "/api/temporal/cards", {
      flowId: run.flow.id,
      title: "Salt bell death warning chronology",
      body: "Extra steward note: law calendars keep a separate false-positive era.",
      truthLayer: "Objective canon",
      canonStatus: "proposed",
      relation: "load-bearing temporal card",
      advisoryRecordId: advisory.record.id
    }));
    expect(card.card).toMatchObject({
      recordTypeKey: "temporal_timeline",
      canonStatus: "proposed",
      body: expect.stringContaining("Event date, discovery date, public date, institutional date, ordinary-life date, and mythic date remain separate")
    });

    const proposal = await json<{ record: { recordTypeKey: string; canonStatus: string; title: string }; queue: unknown[] }>(await postJson(app, "/api/temporal/proposals", {
      flowId: run.flow.id,
      sourceStep: "temporal:outcomes",
      title: "False-positive bell archives exist",
      body: "Ward courts keep archives of death-bell false positives before the first ordinance.",
      truthLayer: "Objective canon",
      advisoryRecordId: advisory.record.id
    }));
    expect(proposal.record).toMatchObject({
      recordTypeKey: "canon_fact",
      canonStatus: "proposed",
      title: "False-positive bell archives exist"
    });

    const debtResponse = await json<{ debt: { recordTypeKey: string; canonStatus: string } }>(await postJson(app, "/api/temporal/debt", {
      flowId: run.flow.id,
      sourceStep: "temporal:mystery-boundary",
      name: "Define forbidden uses of the salt bell mystery",
      reason: "The pass protects cause as author-secret but still owes forbidden-use boundaries before later scenes use the bell."
    }));
    expect(debtResponse.debt).toMatchObject({ recordTypeKey: "canon_debt", canonStatus: "under review" });

    const skip = await json<{ record: { recordTypeKey: string }; debt: { recordTypeKey: string } | null }>(await postJson(app, promptStep.step.actions.skip.href, {
      reason: "The pressure prompt was declined after the steward recorded enough latency and residue evidence.",
      unresolved: true,
      debtName: "Review declined temporal pressure later"
    }));
    expect(skip.record.recordTypeKey).toBe("skip_record");
    expect(skip.debt).toMatchObject({ recordTypeKey: "canon_debt" });

    const closed = await json<{
      flow: { state: string; current_step: string };
      report: { id: number };
      sections: Array<{ heading: string; body: string }>;
      readSideTrail: Array<{ label: string; recordId?: number }>;
    }>(await postJson(app, `/api/temporal/runs/${run.flow.id}/close`));
    expect(closed.flow).toMatchObject({ state: "complete", current_step: expect.stringContaining("complete") });
    expect(closed.sections).toEqual(expect.arrayContaining([
      expect.objectContaining({ heading: "Coverage lenses", body: expect.stringContaining("First true") }),
      expect.objectContaining({ heading: "Linked cards", body: expect.stringContaining("Salt bell death warning chronology") }),
      expect.objectContaining({ heading: "Admission proposals", body: expect.stringContaining("False-positive bell archives exist") }),
      expect.objectContaining({ heading: "Canon debt", body: expect.stringContaining("Define forbidden uses") }),
      expect.objectContaining({ heading: "Prompt-out and skips", body: expect.stringContaining("Review declined temporal pressure later") }),
      expect.objectContaining({ heading: "Close readiness", body: expect.stringContaining("Temporal close blockers satisfied") })
    ]));
    expect(closed.readSideTrail).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "Temporal pass report", recordId: run.report.id }),
      expect.objectContaining({ label: "Temporal timeline card", recordId: card.card.id })
    ]));
  });
});
