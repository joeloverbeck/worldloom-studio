import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { WorldFile } from "../src/world-file.js";

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
  it("keeps a new run report-free while the first ten-lens revision is active staging", async () => {
    const app = createApp();
    expect((await postJson(app, "/api/worlds/create", { path: tempPath("temporal-staging.sqlite") })).status).toBe(201);
    const fact = (await json<{ record: { id: number } }>(await postJson(app, "/api/records", {
      recordTypeKey: "canon_fact",
      title: "The third bell establishes a ward curfew",
      body: "Three matched warning bells cause the ward to impose a seasonal curfew.",
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    }))).record;

    const started = await json<{
      flow: { id: number };
      report: null;
      revisionState: { active: null; lineage: []; activeSet: { revision: 0; identity: string }; lifecycleState: "open" };
    }>(await postJson(app, "/api/temporal/runs/start", { sourceType: "fact", recordId: fact.id }));
    expect(started.report).toBeNull();
    expect(started.revisionState).toMatchObject({
      active: null,
      lineage: [],
      activeSet: { revision: 0 },
      lifecycleState: "open"
    });

    const values = {
      temporalQuestions: "The bell becomes true after the foundry accident and becomes teachable after the third matched death.",
      firstTrueOrRelativeSequence: "The foundry accident precedes the first bell, which precedes three deaths and then the curfew.",
      firstKnownOrReason: "Ward archivists recognize the pattern only after the third matched death.",
      dateTypesAndGranularity: "Event, discovery, public, institutional, ordinary-life, mythic, and authorial revision dates remain separate at season granularity.",
      latency: "Three deaths establish proof; one additional season passes before the ward court regulates the bell.",
      residueByTimescale: "Days bring panic, years bring licenses, and generations preserve bell-law offices and funeral calendars.",
      sequenceIntegrity: "The curfew follows proof of the third death and cannot appear in records from the earlier foundry season.",
      retrospectiveInsertion: "Earlier scenes retain rumors and price shocks but no settled bell law.",
      temporalMysteryBoundaries: "The recurrence is observable while the cause remains author-secret and forbidden to solve.",
      outcomeDecision: "Keep the coverage staged until close and route no new fact from this first revision."
    };
    const saved = await json<{
      revisionState: {
        active: { id: number; lineageId: string; version: 1; lifecycleState: "active"; values: typeof values };
        lineage: Array<{ id: number }>;
        activeSet: { revision: 1; identity: string };
      };
    }>(await postJson(app, "/api/temporal/coverage", { flowId: started.flow.id, ...values }));
    expect(saved.revisionState.active).toMatchObject({ version: 1, lifecycleState: "active", values });
    expect(saved.revisionState.lineage).toHaveLength(1);
    expect(saved.revisionState.activeSet).toMatchObject({ revision: 1 });

    const reloaded = await json<typeof saved & { report: null }>(await app.request(`/api/temporal/runs/${started.flow.id}`));
    expect(reloaded.report).toBeNull();
    expect(reloaded.revisionState.active).toEqual(saved.revisionState.active);
    expect(reloaded.revisionState.activeSet).toEqual(saved.revisionState.activeSet);

    const preview = await json<{
      decisionContract: { name: string; packageSources: string[]; stagingDoctrine: string };
      activeRevision: { id: number };
      revisionAudit: Array<{ id: number }>;
      reportRelationship: { type: "final"; retainedPriorReportRecordId: null };
      writeIntent: { willWrite: string[]; willLink: string[]; willLeaveUntouched: string[] };
      closeReadiness: { status: "ready" };
      orientation: { current: string; next: string; resume: string };
    }>(await postJson(app, `/api/temporal/runs/${started.flow.id}/preview`));
    expect(preview).toMatchObject({
      decisionContract: {
        name: "Temporal coverage revision and finalization",
        packageSources: expect.arrayContaining([
          "docs/worldbuilding-system/03_truth_layers_and_canon_governance.md",
          "docs/worldbuilding-system/09_temporal_and_timeline_protocol.md",
          "docs/worldbuilding-system/20_ai_assisted_workflow.md"
        ]),
        stagingDoctrine: expect.stringContaining("append-only")
      },
      activeRevision: { id: saved.revisionState.active.id },
      revisionAudit: [{ id: saved.revisionState.active.id }],
      reportRelationship: { type: "final", retainedPriorReportRecordId: null },
      closeReadiness: { status: "ready" }
    });
    expect(preview.writeIntent.willLeaveUntouched).toEqual(expect.arrayContaining(["source fact text and standing", "sibling conditional-pass obligations", "Admission contents"]));
    const recovered = await json<{ revisionState: typeof saved.revisionState; recovery: { discardedAttemptedDraft: true; authoritativeRevisionId: number } }>(await postJson(app, `/api/temporal/runs/${started.flow.id}/recover`));
    expect(recovered.revisionState).toEqual(saved.revisionState);
    expect(recovered.recovery).toEqual({ discardedAttemptedDraft: true, authoritativeRevisionId: saved.revisionState.active.id });
  });

  it("atomically replaces active coverage with reasoned lineage and stales the earlier packet", async () => {
    const app = createApp();
    expect((await postJson(app, "/api/worlds/create", { path: tempPath("temporal-revision.sqlite") })).status).toBe(201);
    const fact = (await json<{ record: { id: number } }>(await postJson(app, "/api/records", {
      recordTypeKey: "canon_fact",
      title: "The salt bell predicts a named death",
      body: "A salt bell rings before a named citizen dies.",
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    }))).record;
    const run = await json<{ flow: { id: number } }>(await postJson(app, "/api/temporal/runs/start", { sourceType: "fact", recordId: fact.id }));
    const firstValues = {
      temporalQuestions: "The bell became true after the foundry accident and was understood after the third death.",
      firstTrueOrRelativeSequence: "The accident precedes the bell, three deaths, public proof, and the first ordinance.",
      firstKnownOrReason: "Archivists identify the recurrence after three deaths and publish it one season later.",
      dateTypesAndGranularity: "Event, discovery, public, institutional, ordinary-life, mythic, and authorial dates stay separate by season.",
      latency: "Proof takes three deaths and regulation takes one further season.",
      residueByTimescale: "Panic appears in days, licensing in years, and inherited bell offices in generations.",
      sequenceIntegrity: "No ordinance predates public proof of the third death.",
      retrospectiveInsertion: "Earlier scenes gain rumors and price movement but no settled regulation.",
      temporalMysteryBoundaries: "False positives remain observable while the bell's cause stays author-secret.",
      outcomeDecision: "Close only after current Pressure or a governed skip."
    };
    const first = await json<{ revisionState: { active: { id: number }; activeSet: { revision: number } } }>(await postJson(app, "/api/temporal/coverage", { flowId: run.flow.id, ...firstValues }));
    const step = await json<{ step: { actions: { generate: { href: string }; storeAdvisory: { href: string } } } }>(await postJson(app, "/api/prompt-out/steps", {
      flowKey: "temporal_timeline",
      flowId: run.flow.id,
      recordId: fact.id,
      templateKey: "temporal_spatial_analyst",
      stepKey: "temporal:spatial-temporal-analysis",
      mode: "pressure",
      label: "Spatial-temporal analyst"
    }));
    const revisedValues = {
      ...firstValues,
      firstTrueOrRelativeSequence: "The accident precedes the bell, three deaths, public proof, a failed hearing, and only then the ordinance.",
      latency: "Proof takes three deaths; a failed hearing adds a second season before regulation.",
      residueByTimescale: "Panic appears in days, hearing transcripts and licensing in years, and inherited bell offices in generations.",
      sequenceIntegrity: "The failed hearing occurs after public proof and before the ordinance; no effect precedes its cause."
    };
    const refused = await postJson(app, `/api/temporal/runs/${run.flow.id}/revisions`, {
      expectedRevisionId: first.revisionState.active.id,
      reason: "",
      ...revisedValues
    });
    expect(refused.status).toBe(400);
    expect(await json(refused)).toMatchObject({
      error: expect.stringContaining("steward-authored reason"),
      attemptedInput: expect.objectContaining({ latency: revisedValues.latency }),
      remediation: expect.stringContaining("reason"),
      authoritativeState: { active: { id: first.revisionState.active.id, values: firstValues } }
    });

    const replaced = await json<{
      revisionState: {
        active: { id: number; version: 2; priorVersionId: number; revisionReason: string; values: typeof revisedValues };
        lineage: Array<{ id: number; lifecycleState: string; retirementProvenance: { actor: string; timestamp: string; flowStep: string } | null }>;
        activeSet: { revision: 2; changedRevisionId: number; pressureOwedRevision: null };
      };
    }>(await postJson(app, `/api/temporal/runs/${run.flow.id}/revisions`, {
      expectedRevisionId: first.revisionState.active.id,
      reason: "Pressure exposed a missing failed hearing and longer legal delay.",
      ...revisedValues
    }));
    expect(replaced.revisionState.active).toMatchObject({
      version: 2,
      priorVersionId: first.revisionState.active.id,
      revisionReason: "Pressure exposed a missing failed hearing and longer legal delay.",
      values: revisedValues
    });
    expect(replaced.revisionState.lineage).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: first.revisionState.active.id, lifecycleState: "superseded", retirementProvenance: expect.objectContaining({ actor: "steward", flowStep: "temporal:coverage:revision" }) })
    ]));
    expect(replaced.revisionState.activeSet).toMatchObject({ revision: 2, changedRevisionId: replaced.revisionState.active.id, pressureOwedRevision: null });

    const stale = await postJson(app, step.step.actions.generate.href);
    expect(stale.status).toBe(400);
    expect(await json(stale)).toMatchObject({
      error: expect.stringContaining("stale Temporal packet identity"),
      remediation: expect.stringContaining("current-packet recovery")
    });
  });

  it("migrates frozen open coverage without rewriting it and closes through a linked correction report", async () => {
    const path = tempPath("temporal-legacy-correction.sqlite");
    const legacy = WorldFile.create(path);
    const source = legacy.createRecord({
      recordTypeKey: "canon_fact",
      title: "The salt bell predicts a death",
      body: "A salt bell rings before a named citizen dies.",
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    });
    const prior = legacy.createRecord({
      recordTypeKey: "pass_report",
      title: `Temporal/Timeline pass: ${source.shortId} ${source.title}`,
      body: [
        "Flow key: temporal_timeline",
        "Flow id: pending",
        "Status: in progress",
        "Source type: fact",
        `Source record id: ${source.id}`,
        "Material title: ",
        `Material body: ${source.body}`,
        `Audited subject: ${source.shortId} ${source.title}`,
        `Source summary: ${source.shortId} ${source.title}`
      ].join("\n"),
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    });
    const legacyValues = {
      temporalQuestions: "The bell became true after the foundry accident and was understood after the third death.",
      firstTrueOrRelativeSequence: "The accident precedes the bell, three deaths, public proof, and the first ordinance.",
      firstKnownOrReason: "Archivists identify the recurrence after three deaths and publish it one season later.",
      dateTypesAndGranularity: "Event, discovery, public, institutional, ordinary-life, mythic, and authorial dates stay separate by season.",
      latency: "Proof takes three deaths and regulation takes one further season.",
      residueByTimescale: "Panic appears in days, licensing in years, and inherited bell offices in generations.",
      sequenceIntegrity: "No ordinance predates public proof of the third death.",
      retrospectiveInsertion: "Earlier scenes gain rumors and price movement but no settled regulation.",
      temporalMysteryBoundaries: "False positives remain observable while the bell's cause stays author-secret.",
      outcomeDecision: "Correct the legal delay before final close."
    };
    const priorCoverageBody = [
      `Temporal questions: ${legacyValues.temporalQuestions}`,
      `First true or relative sequence: ${legacyValues.firstTrueOrRelativeSequence}`,
      `First known date or reason: ${legacyValues.firstKnownOrReason}`,
      `Date types and granularity: ${legacyValues.dateTypesAndGranularity}`,
      `Latency: ${legacyValues.latency}`,
      `Residue by timescale: ${legacyValues.residueByTimescale}`,
      `Sequence integrity: ${legacyValues.sequenceIntegrity}`,
      `Retrospective insertion: ${legacyValues.retrospectiveInsertion}`,
      `Temporal mystery boundaries: ${legacyValues.temporalMysteryBoundaries}`,
      `Outcome decision: ${legacyValues.outcomeDecision}`
    ].join("\n");
    legacy.replaceSections(prior.id, [{ heading: "Coverage lenses", body: priorCoverageBody, position: 2 }]);
    const legacyFlow = legacy.createFlowInstance({ flowKey: "temporal_timeline", currentStep: `temporal:report:${prior.id}:coverage` });
    legacy.createLinkIfMissing(prior.id, source.id, "derived_from", "Temporal/Timeline pass audits this source");
    const frozenBody = legacy.getRecord(prior.id).body;
    const frozenSections = legacy.listSections(prior.id);
    legacy.close();

    const app = createApp();
    expect((await postJson(app, "/api/worlds/open", { path })).status).toBe(200);
    const migrated = await json<{
      flow: { id: number };
      report: null;
      priorReport: { id: number; body: string };
      revisionState: { active: { version: 1; revisionReason: null; values: typeof legacyValues }; lineage: Array<unknown> };
    }>(await postJson(app, "/api/temporal/runs/start", { sourceType: "pass_report", reportRecordId: prior.id }));
    expect(migrated.flow.id).toBe(legacyFlow.id);
    expect(migrated.report).toBeNull();
    expect(migrated.priorReport).toMatchObject({ id: prior.id, body: frozenBody });
    expect(migrated.revisionState.active).toMatchObject({ version: 1, revisionReason: null, values: legacyValues });
    expect(migrated.revisionState.lineage).toHaveLength(1);

    const revisedValues = {
      ...legacyValues,
      firstTrueOrRelativeSequence: "The accident precedes the bell, three deaths, public proof, a failed hearing, and the later ordinance.",
      latency: "Proof takes three deaths; a failed hearing adds a second season before regulation.",
      residueByTimescale: "Panic appears in days, hearing transcripts and licenses in years, and inherited bell offices in generations.",
      sequenceIntegrity: "The failed hearing follows public proof and precedes the ordinance."
    };
    const replacement = await json<{ revisionState: { active: { id: number } } }>(await postJson(app, `/api/temporal/runs/${legacyFlow.id}/revisions`, {
      expectedRevisionId: (migrated.revisionState.active as unknown as { id: number }).id,
      reason: "Pressure exposed the missing failed hearing.",
      ...revisedValues
    }));
    const closed = await json<{
      flow: { state: "complete" };
      report: { id: number; body: string };
      priorReport: { id: number; body: string };
      revisionState: { lifecycleState: "finalized"; active: { id: number } };
      reportRelationship: { type: "correction"; supersedesReportRecordId: number };
      readSideTrail: Array<{ label: string; recordId?: number }>;
    }>(await postJson(app, `/api/temporal/runs/${legacyFlow.id}/close`));
    expect(closed.flow.state).toBe("complete");
    expect(closed.report.id).not.toBe(prior.id);
    expect(closed.report.body).toContain(revisedValues.latency);
    expect(closed.report.body).toContain("Revision audit");
    expect(closed.priorReport).toMatchObject({ id: prior.id, body: frozenBody });
    expect(closed.reportRelationship).toEqual({ type: "correction", supersedesReportRecordId: prior.id });
    expect(closed.revisionState).toMatchObject({ lifecycleState: "finalized", active: { id: replacement.revisionState.active.id } });
    expect(closed.readSideTrail).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "Corrected current Temporal report", recordId: closed.report.id }),
      expect.objectContaining({ label: "Retained prior Temporal report", recordId: prior.id })
    ]));
    expect(closed.readSideTrail).not.toContainEqual(expect.objectContaining({ label: "Admission proposal", recordId: source.id }));

    const postClose = await postJson(app, `/api/temporal/runs/${legacyFlow.id}/revisions`, {
      expectedRevisionId: replacement.revisionState.active.id,
      reason: "Attempt to reopen closed staging.",
      ...revisedValues,
      latency: `${revisedValues.latency} Another season.`
    });
    expect(postClose.status).toBe(400);
    expect(await json(postClose)).toMatchObject({ error: expect.stringContaining("closed"), authoritativeState: { lifecycleState: "finalized" } });

    const reopened = WorldFile.open(path);
    expect(reopened.getRecord(prior.id).body).toBe(frozenBody);
    expect(reopened.listSections(prior.id)).toEqual(frozenSections);
    expect(reopened.listLinks(closed.report.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ fromRecordId: closed.report.id, toRecordId: prior.id, linkTypeKey: "supersedes" })
    ]));
    reopened.close();
  });

  it("owes current Pressure or governed skip after revision of Pressure-used coverage", async () => {
    const app = createApp();
    expect((await postJson(app, "/api/worlds/create", { path: tempPath("temporal-pressure-owed.sqlite") })).status).toBe(201);
    const fact = (await json<{ record: { id: number } }>(await postJson(app, "/api/records", {
      recordTypeKey: "canon_fact",
      title: "The salt bell predicts a death",
      body: "A salt bell rings before a named citizen dies.",
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    }))).record;
    const run = await json<{ flow: { id: number } }>(await postJson(app, "/api/temporal/runs/start", { sourceType: "fact", recordId: fact.id }));
    const firstValues = {
      temporalQuestions: "The bell became true after the foundry accident and was understood after the third death.",
      firstTrueOrRelativeSequence: "The accident precedes the bell, three deaths, public proof, and the first ordinance.",
      firstKnownOrReason: "Archivists identify the recurrence after three deaths and publish it one season later.",
      dateTypesAndGranularity: "Event, discovery, public, institutional, ordinary-life, mythic, and authorial dates stay separate by season.",
      latency: "Proof takes three deaths and regulation takes one further season.",
      residueByTimescale: "Panic appears in days, licensing in years, and inherited bell offices in generations.",
      sequenceIntegrity: "No ordinance predates public proof of the third death.",
      retrospectiveInsertion: "Earlier scenes gain rumors and price movement but no settled regulation.",
      temporalMysteryBoundaries: "False positives remain observable while the bell's cause stays author-secret.",
      outcomeDecision: "Close only after current support or a governed skip."
    };
    const first = await json<{ revisionState: { active: { id: number } } }>(await postJson(app, "/api/temporal/coverage", { flowId: run.flow.id, ...firstValues }));
    const pressure = await json<{ step: { actions: { generate: { href: string }; storeAdvisory: { href: string } } } }>(await postJson(app, "/api/prompt-out/steps", {
      flowKey: "temporal_timeline",
      flowId: run.flow.id,
      recordId: fact.id,
      templateKey: "temporal_spatial_analyst",
      stepKey: "temporal:spatial-temporal-analysis",
      mode: "pressure",
      label: "Spatial-temporal analyst"
    }));
    const packet = await json<{ prompt: string }>(await postJson(app, pressure.step.actions.generate.href));
    expect((await postJson(app, pressure.step.actions.storeAdvisory.href, { promptText: packet.prompt, responseText: "The legal delay is too short." })).status).toBe(201);

    const revised = await json<{ revisionState: { active: { id: number }; activeSet: { pressureUsedRevision: 1; pressureOwedRevision: 2 } }; closeReadiness: { status: string; blockers: Array<{ key: string }> } }>(await postJson(app, `/api/temporal/runs/${run.flow.id}/revisions`, {
      expectedRevisionId: first.revisionState.active.id,
      reason: "Pressure exposed a missing failed hearing.",
      ...firstValues,
      latency: "Proof takes three deaths; a failed hearing adds a second season before regulation.",
      sequenceIntegrity: "Public proof precedes a failed hearing, which precedes the ordinance."
    }));
    expect(revised.revisionState.activeSet).toMatchObject({ pressureUsedRevision: 1, pressureOwedRevision: 2 });
    expect(revised.closeReadiness).toMatchObject({ status: "blocked", blockers: expect.arrayContaining([expect.objectContaining({ key: "pressure_currentness" })]) });
    expect((await postJson(app, `/api/temporal/runs/${run.flow.id}/close`)).status).toBe(400);

    const current = await json<{ decisionPoint: { sharedContract: { promptOut: { modes: Array<{ mode: string; stepRequest: { href: string; body: unknown } | null }> } } } }>(await app.request(`/api/temporal/runs/${run.flow.id}`));
    const currentPressure = current.decisionPoint.sharedContract.promptOut.modes.find((mode) => mode.mode === "pressure")!.stepRequest!;
    const skipStep = await json<{ step: { actions: { skip: { href: string } } } }>(await postJson(app, currentPressure.href, currentPressure.body));
    const tooShort = await postJson(app, skipStep.step.actions.skip.href, { workScale: "major", reason: "" });
    expect(tooShort.status).toBe(400);
    const skipped = await json<{ revisionState: { activeSet: { pressureOwedRevision: null; pressureSkipRevision: 2 } }; closeReadiness: { status: "ready" } }>(await postJson(app, skipStep.step.actions.skip.href, {
      workScale: "major",
      reason: "The steward incorporated the useful Pressure and records this governed external-LLM skip."
    }));
    expect(skipped.revisionState.activeSet).toMatchObject({ pressureOwedRevision: null, pressureSkipRevision: 2 });
    expect(skipped.closeReadiness.status).toBe("ready");
  });

  it("assembles an explicit-mode, decision-complete, read-only Temporal packet from server-owned context", async () => {
    const app = createApp();
    expect((await postJson(app, "/api/worlds/create", { path: tempPath("temporal-packet.sqlite") })).status).toBe(201);

    const createRecord = async (input: { recordTypeKey: string; title: string; body: string; truthLayer?: string; canonStatus?: string }) =>
      (await json<{ record: { id: number; shortId: string; createdAt: string; updatedAt: string } }>(await postJson(app, "/api/records", {
        truthLayer: "Objective canon",
        canonStatus: "accepted",
        ...input
      }))).record;
    const link = async (fromRecordId: number, toRecordId: number, linkTypeKey: string, note: string) =>
      postJson(app, "/api/links", { fromRecordId, toRecordId, linkTypeKey, note });

    const fact = await createRecord({
      recordTypeKey: "canon_fact",
      title: "The salt bell tolls before deaths",
      body: "A salt bell rings three days before a named citizen dies."
    });
    const propagationReport = await createRecord({
      recordTypeKey: "propagation_report",
      title: "Salt bell final Propagation report",
      body: "Gate result: passed. The final shock cone requires a Temporal pass."
    });
    const relatedCanon = await createRecord({
      recordTypeKey: "canon_fact",
      title: "Ward courts archive false positives",
      body: "Each ward court keeps an accepted register of unmatched bell tolls."
    });
    const debt = await createRecord({
      recordTypeKey: "canon_debt",
      title: "Explain the first false positive",
      body: "State: open. Preserve this unresolved timing debt.",
      canonStatus: "under review"
    });
    const boundary = await createRecord({
      recordTypeKey: "mystery_ledger_entry",
      title: "The bell's author-secret cause",
      body: "Observable recurrence is public; the originating cause is forbidden knowledge."
    });
    const kernel = await createRecord({
      recordTypeKey: "world_kernel",
      title: "Salt city kernel",
      body: "Premise: warnings create institutions before certainty. Protected effect: dread without solved causation."
    });
    const inactiveKernel = await createRecord({
      recordTypeKey: "world_kernel",
      title: "Retired salt city kernel",
      body: "This superseded premise is no longer an active world commitment.",
      canonStatus: "superseded"
    });
    const inactive = await createRecord({
      recordTypeKey: "canon_fact",
      title: "Retired bell calendar",
      body: "This superseded calendar is historical only.",
      canonStatus: "superseded"
    });
    const secondHop = await createRecord({
      recordTypeKey: "canon_fact",
      title: "Second-hop funeral custom",
      body: "This is outside the bounded direct relationship set."
    });
    expect((await link(propagationReport.id, fact.id, "derived_from", "Final Propagation report for the Temporal source fact")).status).toBe(201);
    expect((await link(propagationReport.id, fact.id, "covers", "The same report also records explicit coverage")).status).toBe(201);
    expect((await link(fact.id, relatedCanon.id, "depends_on", "Direct canon dependency for the Temporal decision")).status).toBe(201);
    expect((await link(fact.id, debt.id, "requires_follow_up", "Open Temporal debt")).status).toBe(201);
    expect((await link(fact.id, boundary.id, "preserves_boundary_for", "Protected Temporal mystery boundary")).status).toBe(201);
    expect((await link(fact.id, inactive.id, "depends_on", "Inactive historical support")).status).toBe(201);
    expect((await link(relatedCanon.id, secondHop.id, "depends_on", "Bounded second-hop candidate")).status).toBe(201);

    const run = await json<{ flow: { id: number }; report: null }>(await postJson(app, "/api/temporal/runs/start", { sourceType: "fact", recordId: fact.id }));
    const timelineCard = await createRecord({
      recordTypeKey: "temporal_timeline",
      title: "Existing salt bell chronology",
      body: "The existing card separates event, discovery, public, and institutional dates.",
      canonStatus: "proposed"
    });
    const omittedMode = await postJson(app, "/api/prompt-out/steps", {
      flowKey: "temporal_timeline",
      flowId: run.flow.id,
      templateKey: "temporal_spatial_analyst",
      recordId: fact.id,
      stepKey: "temporal:spatial-temporal-analysis"
    });
    expect(omittedMode.status).toBe(400);
    expect(await json(omittedMode)).toMatchObject({ error: expect.stringContaining("explicit Proposal or Pressure mode") });

    const coverageInput = {
      flowId: run.flow.id,
      temporalQuestions: "The bell became true after the foundry accident, was noticed after three deaths, and changed ward routines before the courts believed it.",
      firstTrueOrRelativeSequence: "The first true toll follows the salt-foundry accident and precedes the first named death by three days.",
      firstKnownOrReason: "Witnesses first know the pattern after the third matched death; earlier tolls remain isolated rumor.",
      dateTypesAndGranularity: "Event, discovery, public, institutional, ordinary-life, mythic, and authorial-revision dates stay separate at ward-season granularity.",
      latency: "Proof takes three deaths and legal adaptation takes two seasons because ward courts test false positives.",
      residueByTimescale: "Days bring panic, years bring licensing, generations leave funeral calendars, and eras leave obsolete bell offices.",
      sequenceIntegrity: "The ordinance follows the third matched death; no law or institution appears before evidence exists.",
      retrospectiveInsertion: "Earlier scenes gain local rumors, price boards, and an archive entry without rewriting every district.",
      temporalMysteryBoundaries: "Recurrence windows and false positives are observable while the bell's cause remains author-secret and forbidden to solve.",
      outcomeDecision: "Keep the report advisory, create no canon in this step, and route any new archive fact through Admission."
    };
    expect((await postJson(app, "/api/temporal/coverage", coverageInput)).status).toBe(201);

    expect((await postJson(app, "/api/temporal/cards", { flowId: run.flow.id, existingRecordId: timelineCard.id, relation: "Existing Temporal timeline card" })).status).toBe(201);
    const routedProposal = (await json<{ record: { id: number; shortId: string } }>(await postJson(app, "/api/temporal/proposals", {
      flowId: run.flow.id,
      sourceStep: "temporal:outcomes",
      title: "Proposed ward archive",
      body: "Candidate fact routed to Admission rather than admitted in Temporal.",
      truthLayer: "Objective canon"
    }))).record;
    const reportDebt = (await json<{ debt: { id: number; shortId: string } }>(await postJson(app, "/api/temporal/debt", {
      flowId: run.flow.id,
      sourceStep: "temporal:outcomes",
      name: "Resolve unmatched toll jurisdiction",
      reason: "This Temporal outcome remains unresolved after the current coverage decision."
    }))).debt;
    const setupStep = await json<{ step: { actions: { generate: { href: string }; storeAdvisory: { href: string } } } }>(await postJson(app, "/api/prompt-out/steps", {
      flowKey: "temporal_timeline",
      flowId: run.flow.id,
      templateKey: "temporal_spatial_analyst",
      recordId: fact.id,
      stepKey: "temporal:spatial-temporal-analysis",
      mode: "proposal",
      label: "Temporal Proposal"
    }));
    const setupPrompt = await json<{ prompt: string }>(await postJson(app, setupStep.step.actions.generate.href));
    const advisory = (await json<{ record: { id: number; shortId: string } }>(await postJson(app, setupStep.step.actions.storeAdvisory.href, {
      promptText: setupPrompt.prompt,
      responseText: "Test the ward archive against false positives."
    }))).record;
    expect((await postJson(app, `/api/advisory-artifacts/${advisory.id}/dispositions`, {
      disposition: "selected",
      note: "Use only the false-positive archive pressure."
    })).status).toBe(201);
    const skipStep = await json<{ step: { actions: { skip: { href: string } } } }>(await postJson(app, "/api/prompt-out/steps", {
      flowKey: "temporal_timeline",
      flowId: run.flow.id,
      templateKey: "temporal_spatial_analyst",
      recordId: fact.id,
      stepKey: "temporal:branch-chronology",
      mode: "proposal",
      label: "Temporal Proposal"
    }));
    const governedSkip = (await json<{ record: { id: number; shortId: string } }>(await postJson(app, skipStep.step.actions.skip.href, {
      workScale: "minor",
      reason: "branch chronology is not yet earned"
    }))).record;

    const before = {
      records: await json(await app.request("/api/records")),
      links: await json(await app.request("/api/links")),
      run: await json(await app.request(`/api/temporal/runs/${run.flow.id}`))
    };
    const step = await json<{ step: { packetIdentity: { activeSetRevision: number }; actions: { generate: { href: string } } } }>(await postJson(app, "/api/prompt-out/steps", {
      flowKey: "temporal_timeline",
      flowId: run.flow.id,
      templateKey: "temporal_spatial_analyst",
      recordId: fact.id,
      stepKey: "temporal:spatial-temporal-analysis",
      mode: "proposal",
      label: "Temporal Proposal"
    }));
    expect(step.step.packetIdentity.activeSetRevision).toBeTypeOf("number");
    const generated = await json<{
      prompt: string;
      promptOut: {
        packetIdentity: { packetHash: string; bodyHash: string; activeSetRevision: number };
        temporalContext: {
          serverOwned: true;
          mode: "proposal" | "pressure";
          flowKey: string;
          stepKey: string;
          completeness: { status: string; blockers: string[] };
          coverage: Array<{ key: string; label: string; value: string }>;
          selectedSource: { id: number; standing: { canonStatus: string }; provenance: { actor: string; timestamp: string; flowStep: string } };
          sourcePropagation: Array<{ id: number; relationship: { kind: string }; inclusionReason: string }>;
          relatedCanon: Array<{ id: number }>;
          openDebt: Array<{ id: number }>;
          protectedBoundaries: Array<{ id: number }>;
          kernelCommitments: Array<{ id: number }>;
          timelineCards: Array<{ id: number }>;
          routedProposals: Array<{ id: number }>;
          skips: Array<{ id: number }>;
          advisoryDispositions: Array<{ advisory: { id: number }; dispositions: Array<{ disposition: string; note: string }> }>;
          sourceDocuments: Array<{ source: string; content: string }>;
          sourceManifest: string[];
          omissions: string[];
          outputLabels: string[];
          advisoryCanonWarning: string;
          recovery: { method: string; href: string; body: { mode: string; activeSetRevision: number } };
          orientation: { current: string; next: string; resume: string; safeExit: string };
          readOnlyGuarantee: string;
        };
      };
    }>(await postJson(app, step.step.actions.generate.href));

    expect(generated.promptOut.temporalContext).toMatchObject({
      serverOwned: true,
      mode: "proposal",
      flowKey: "temporal_timeline",
      stepKey: "temporal:spatial-temporal-analysis",
      completeness: { status: "complete", blockers: [] },
      selectedSource: {
        id: fact.id,
        standing: { canonStatus: "accepted" },
        provenance: {
          actor: "steward",
          timestamp: fact.createdAt,
          flowStep: "unavailable: record creation did not persist a flow step"
        }
      },
      sourcePropagation: [expect.objectContaining({ id: propagationReport.id, inclusionReason: expect.stringContaining("Propagation") })],
      relatedCanon: [expect.objectContaining({ id: relatedCanon.id })],
      openDebt: expect.arrayContaining([
        expect.objectContaining({ id: debt.id }),
        expect.objectContaining({ id: reportDebt.id })
      ]),
      protectedBoundaries: [expect.objectContaining({ id: boundary.id })],
      kernelCommitments: [expect.objectContaining({ id: kernel.id })],
      timelineCards: [expect.objectContaining({ id: timelineCard.id })],
      routedProposals: [expect.objectContaining({ id: routedProposal.id })],
      skips: [expect.objectContaining({ id: governedSkip.id })],
      advisoryDispositions: [expect.objectContaining({
        advisory: expect.objectContaining({ id: advisory.id }),
        dispositions: [expect.objectContaining({ disposition: "selected", note: "Use only the false-positive archive pressure." })]
      })],
      recovery: {
        method: "POST",
        href: "/api/prompt-out/steps",
        body: expect.objectContaining({ mode: "proposal", activeSetRevision: step.step.packetIdentity.activeSetRevision })
      },
      orientation: {
        current: expect.any(String),
        next: expect.any(String),
        resume: expect.any(String),
        safeExit: expect.any(String)
      }
    });
    expect(generated.promptOut.temporalContext.coverage).toHaveLength(10);
    expect(generated.promptOut.temporalContext.coverage.map((item) => item.key)).toEqual([
      "temporalQuestions",
      "firstTrueOrRelativeSequence",
      "firstKnownOrReason",
      "dateTypesAndGranularity",
      "latency",
      "residueByTimescale",
      "sequenceIntegrity",
      "retrospectiveInsertion",
      "temporalMysteryBoundaries",
      "outcomeDecision"
    ]);
    expect(generated.promptOut.temporalContext.omissions).toEqual(expect.arrayContaining([
      expect.stringContaining("inactive"),
      expect.stringContaining(inactive.shortId),
      expect.stringContaining(inactiveKernel.shortId),
      expect.stringContaining("bounded second-hop"),
      expect.stringContaining(secondHop.shortId)
    ]));
    expect(generated.promptOut.temporalContext.sourceDocuments.map((item) => item.source)).toEqual(expect.arrayContaining([
      expect.stringContaining(fact.shortId),
      expect.stringContaining(propagationReport.shortId),
      expect.stringContaining(kernel.shortId),
      expect.stringContaining(timelineCard.shortId),
      expect.stringContaining(routedProposal.shortId),
      expect.stringContaining(reportDebt.shortId),
      expect.stringContaining(governedSkip.shortId),
      expect.stringContaining(advisory.shortId)
    ]));
    expect(new Set(generated.promptOut.temporalContext.sourceDocuments.map((item) => item.source)).size)
      .toBe(generated.promptOut.temporalContext.sourceDocuments.length);
    expect(generated.promptOut.temporalContext.sourceDocuments.find((document) => document.source.includes(advisory.shortId))?.content)
      .toContain("selected: Use only the false-positive archive pressure.");
    expect(generated.promptOut.temporalContext.outputLabels).toContain("adopted with steward revision");
    expect(generated.promptOut.temporalContext.advisoryCanonWarning).toContain("optional advisory");
    expect(generated.promptOut.temporalContext.readOnlyGuarantee).toContain("no record");
    for (const value of Object.values(coverageInput).filter((value): value is string => typeof value === "string")) {
      expect(generated.prompt).toContain(value);
    }
    expect(generated.prompt).toContain("Gate result: passed");
    for (const document of generated.promptOut.temporalContext.sourceDocuments) {
      expect(generated.prompt).toContain(document.source);
      expect(generated.prompt).toContain(document.content);
    }
    for (const manifestItem of generated.promptOut.temporalContext.sourceManifest) expect(generated.prompt).toContain(manifestItem);
    for (const omission of generated.promptOut.temporalContext.omissions) expect(generated.prompt).toContain(omission);
    for (const outputLabel of generated.promptOut.temporalContext.outputLabels) expect(generated.prompt).toContain(outputLabel);
    expect(generated.prompt).toContain(generated.promptOut.temporalContext.advisoryCanonWarning);
    expect(generated.promptOut.packetIdentity).toMatchObject({
      packetHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      bodyHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      activeSetRevision: step.step.packetIdentity.activeSetRevision
    });
    const after = {
      records: await json(await app.request("/api/records")),
      links: await json(await app.request("/api/links")),
      run: await json(await app.request(`/api/temporal/runs/${run.flow.id}`))
    };
    expect(after).toEqual(before);

    const currentProposalRevision = async () => {
      const current = await json<{
        decisionPoint: { sharedContract: { promptOut: { modes: Array<{ mode: string; stepRequest: { body: { activeSetRevision: number } } | null }> } } };
      }>(await app.request(`/api/temporal/runs/${run.flow.id}`));
      return current.decisionPoint.sharedContract.promptOut.modes.find((mode) => mode.mode === "proposal")?.stepRequest?.body.activeSetRevision;
    };
    const revisionBeforeDisposition = await currentProposalRevision();
    expect((await postJson(app, `/api/advisory-artifacts/${advisory.id}/dispositions`, {
      disposition: "challenged",
      note: "A later steward ruling changes the packet-bearing disposition history."
    })).status).toBe(201);
    const revisionAfterDisposition = await currentProposalRevision();
    expect(revisionAfterDisposition).not.toBe(revisionBeforeDisposition);

    const laterSkipStep = await json<{ step: { actions: { skip: { href: string } } } }>(await postJson(app, "/api/prompt-out/steps", {
      flowKey: "temporal_timeline",
      flowId: run.flow.id,
      templateKey: "temporal_spatial_analyst",
      recordId: fact.id,
      stepKey: "temporal:later-branch-work",
      mode: "proposal",
      label: "Temporal Proposal"
    }));
    expect((await postJson(app, laterSkipStep.step.actions.skip.href, { workScale: "minor", reason: "later branch work remains unearned" })).status).toBe(201);
    expect(await currentProposalRevision()).not.toBe(revisionAfterDisposition);
    const staleGeneration = await postJson(app, step.step.actions.generate.href);
    expect(staleGeneration.status).toBe(400);
    expect(await json(staleGeneration)).toMatchObject({
      error: expect.stringContaining("stale Temporal packet identity"),
      remediation: expect.any(String)
    });
  });

  it("gives selected Temporal material stable server-owned identity and provenance", async () => {
    const app = createApp();
    expect((await postJson(app, "/api/worlds/create", { path: tempPath("temporal-material.sqlite") })).status).toBe(201);
    const run = await json<{ flow: { id: number } }>(await postJson(app, "/api/temporal/runs/start", {
      sourceType: "material",
      materialTitle: "Recovered bell-calendar fragment",
      materialBody: "The fragment places three tolls before the first public archive.",
      auditedSubject: "Recovered bell chronology"
    }));
    const step = await json<{ step: { actions: { generate: { href: string } } } }>(await postJson(app, "/api/prompt-out/steps", {
      flowKey: "temporal_timeline",
      flowId: run.flow.id,
      templateKey: "temporal_spatial_analyst",
      stepKey: "temporal:spatial-temporal-analysis",
      mode: "proposal",
      label: "Temporal Proposal"
    }));
    const generated = await json<{
      prompt: string;
      promptOut: { temporalContext: { selectedSource: {
        id: number;
        shortId: string;
        title: string;
        recordTypeKey: string;
        body: string;
        standing: { truthLayer: null; canonStatus: null };
        relationship: { direction: string; kind: string };
        provenance: { actor: string; timestamp: string; flowStep: string };
        inclusionReason: string;
      } } };
    }>(await postJson(app, step.step.actions.generate.href));

    expect(generated.promptOut.temporalContext.selectedSource).toMatchObject({
      id: expect.any(Number),
      shortId: expect.stringContaining("material"),
      title: "Recovered bell-calendar fragment",
      recordTypeKey: "selected_material",
      body: "The fragment places three tolls before the first public archive.",
      standing: { truthLayer: null, canonStatus: null },
      relationship: { direction: "selected", kind: "selected_temporal_material" },
      provenance: {
        actor: "steward",
        timestamp: expect.any(String),
        flowStep: "unavailable: record creation did not persist a flow step"
      },
      inclusionReason: expect.stringContaining("selected material")
    });
    expect(generated.prompt).toContain("Recovered bell-calendar fragment");
    expect(generated.prompt).toContain("The fragment places three tolls before the first public archive.");
  });

  it("binds both modes to current flow context, blocks incomplete Pressure, and changes identity with saved coverage", async () => {
    const app = createApp();
    expect((await postJson(app, "/api/worlds/create", { path: tempPath("temporal-sensitivity.sqlite") })).status).toBe(201);
    const fact = (await json<{ record: { id: number } }>(await postJson(app, "/api/records", {
      recordTypeKey: "canon_fact",
      title: "The winter archive opens after every third thaw",
      body: "The archive's recurrence governs inheritance evidence.",
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    }))).record;
    const otherFact = (await json<{ record: { id: number } }>(await postJson(app, "/api/records", {
      recordTypeKey: "canon_fact",
      title: "Unrelated summer ledger",
      body: "This record is not the selected Temporal source.",
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    }))).record;
    const firstRun = await json<{ flow: { id: number } }>(await postJson(app, "/api/temporal/runs/start", { sourceType: "fact", recordId: fact.id }));

    const incompleteStep = await json<{ step: { actions: { generate: { href: string } } } }>(await postJson(app, "/api/prompt-out/steps", {
      flowKey: "temporal_timeline",
      flowId: firstRun.flow.id,
      templateKey: "temporal_spatial_analyst",
      recordId: fact.id,
      stepKey: "temporal:spatial-temporal-analysis",
      mode: "pressure",
      label: "Spatial-temporal analyst"
    }));
    const incomplete = await postJson(app, incompleteStep.step.actions.generate.href);
    expect(incomplete.status).toBe(400);
    expect(await json(incomplete)).toMatchObject({
      error: expect.stringContaining("Pressure requires all ten saved Temporal coverage lenses"),
      remediation: expect.stringContaining("Preserve the selected mode")
    });

    const coverageA = {
      flowId: firstRun.flow.id,
      temporalQuestions: "Version A asks when the third-thaw rule became true, known, teachable, regulated, and remembered.",
      firstTrueOrRelativeSequence: "Version A begins after the first sealed inheritance dispute and before the first winter archive.",
      firstKnownOrReason: "Version A becomes known when three executors independently match the thaw recurrence.",
      dateTypesAndGranularity: "Version A separates event, discovery, public, institutional, ordinary-life, mythic, and revision dates by thaw cycle.",
      latency: "Version A requires two thaw cycles for proof and one generation for ordinary legal reliance.",
      residueByTimescale: "Version A leaves witness queues, licensing, inherited archive guilds, and obsolete winter seals.",
      sequenceIntegrity: "Version A keeps the archive after the dispute and the inheritance code after repeated proof.",
      retrospectiveInsertion: "Version A adds sealed ledgers and family strategies to earlier scenes without universal foreknowledge.",
      temporalMysteryBoundaries: "Version A fixes the recurrence while forbidding explanation of why the third thaw matters.",
      outcomeDecision: "Version A records a non-mutating review and routes any new inheritance claim through Admission."
    };
    expect((await postJson(app, "/api/temporal/coverage", coverageA)).status).toBe(201);

    const generate = async (flowId: number, mode: "proposal" | "pressure", recordId = fact.id) => {
      const step = await json<{ step: { actions: { generate: { href: string } } } }>(await postJson(app, "/api/prompt-out/steps", {
        flowKey: "temporal_timeline",
        flowId,
        templateKey: "temporal_spatial_analyst",
        recordId,
        stepKey: "temporal:spatial-temporal-analysis",
        mode,
        label: mode === "proposal" ? "Temporal Proposal" : "Spatial-temporal analyst"
      }));
      return postJson(app, step.step.actions.generate.href);
    };

    const mismatched = await generate(firstRun.flow.id, "proposal", otherFact.id);
    expect(mismatched.status).toBe(400);
    expect(await json(mismatched)).toMatchObject({
      error: expect.stringContaining(`selected record ${otherFact.id} does not match Temporal source record ${fact.id}`),
      remediation: expect.any(String)
    });

    const proposalA = await json<{ prompt: string; promptOut: { mode: string; packetIdentity: { packetHash: string; bodyHash: string }; temporalContext: { mode: string; completeness: { status: string } } } }>(await generate(firstRun.flow.id, "proposal"));
    const pressureA = await json<{ prompt: string; promptOut: { mode: string; packetIdentity: { packetHash: string; bodyHash: string }; temporalContext: { mode: string; completeness: { status: string } } } }>(await generate(firstRun.flow.id, "pressure"));
    expect(proposalA.promptOut).toMatchObject({ mode: "proposal", temporalContext: { mode: "proposal", completeness: { status: "complete" } } });
    expect(pressureA.promptOut).toMatchObject({ mode: "pressure", temporalContext: { mode: "pressure", completeness: { status: "complete" } } });
    expect(proposalA.prompt).toContain(coverageA.temporalQuestions);
    expect(pressureA.prompt).toContain(coverageA.temporalMysteryBoundaries);
    expect(proposalA.promptOut.packetIdentity.packetHash).not.toBe(pressureA.promptOut.packetIdentity.packetHash);
    expect((await postJson(app, `/api/temporal/runs/${firstRun.flow.id}/close`)).status).toBe(201);

    const secondRun = await json<{ flow: { id: number } }>(await postJson(app, "/api/temporal/runs/start", { sourceType: "fact", recordId: fact.id }));
    expect(secondRun.flow.id).not.toBe(firstRun.flow.id);
    const coverageB = Object.fromEntries(Object.entries(coverageA).map(([key, value]) => [
      key,
      key === "flowId" ? secondRun.flow.id : String(value).replaceAll("Version A", "Version B materially changes the saved chronology")
    ]));
    expect((await postJson(app, "/api/temporal/coverage", coverageB)).status).toBe(201);
    const proposalB = await json<{ prompt: string; promptOut: { packetIdentity: { packetHash: string; bodyHash: string } } }>(await generate(secondRun.flow.id, "proposal"));
    expect(proposalB.prompt).toContain("Version B materially changes the saved chronology");
    expect(proposalB.prompt).not.toContain(coverageA.temporalQuestions);
    expect(proposalB.promptOut.packetIdentity.packetHash).not.toBe(proposalA.promptOut.packetIdentity.packetHash);
    expect(proposalB.promptOut.packetIdentity.bodyHash).not.toBe(proposalA.promptOut.packetIdentity.bodyHash);
  });

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
      report: null;
      revisionState: { lifecycleState: "open"; active: null; lineage: [] };
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
    expect(run.report).toBeNull();
    expect(run.revisionState).toMatchObject({ lifecycleState: "open", active: null, lineage: [] });
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

    const resumed = await json<{ flow: { id: number }; report: null }>(await postJson(app, "/api/temporal/runs/start", { sourceType: "fact", recordId: fact.id }));
    expect(resumed.flow.id).toBe(run.flow.id);
    expect(resumed.report).toBeNull();

    for (const startPayload of [
      { sourceType: "capability", recordId: capability.id },
      { sourceType: "canon_debt", recordId: debt.id },
      { sourceType: "material", materialTitle: "Bell ordinance", materialBody: "The first death-bell law arrives after three false positives." }
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

    const sourceRevision = await app.request(`/api/records/${fact.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body: "A salt bell rings three days before a named citizen dies; a newly saved ward note narrows the current source material." })
    });
    expect(sourceRevision.status).toBe(200);

    const staleSkip = await postJson(app, promptStep.step.actions.skip.href, {
      reason: "The pressure prompt was declined after the steward recorded enough latency and residue evidence.",
      unresolved: true,
      debtName: "Review declined temporal pressure later"
    });
    expect(staleSkip.status).toBe(400);
    expect(await json(staleSkip)).toMatchObject({
      error: expect.stringContaining("stale Temporal packet identity"),
      remediation: expect.anything()
    });
    const currentRun = await json<{
      decisionPoint: { sharedContract: { promptOut: { modes: Array<{ mode: string; stepRequest: { method: "POST"; href: string; body: Record<string, unknown> } | null }> } } };
    }>(await app.request(`/api/temporal/runs/${run.flow.id}`));
    const pressureRecovery = currentRun.decisionPoint.sharedContract.promptOut.modes.find((mode) => mode.mode === "pressure")?.stepRequest;
    expect(pressureRecovery).toMatchObject({
      method: "POST",
      href: "/api/prompt-out/steps",
      body: expect.objectContaining({ mode: "pressure", activeSetRevision: expect.any(Number) })
    });
    const recoveredStep = await json<{ step: { actions: { skip: { href: string } } } }>(await postJson(app, pressureRecovery!.href, pressureRecovery!.body));
    const skip = await json<{ record: { recordTypeKey: string }; debt: { recordTypeKey: string } | null }>(await postJson(app, recoveredStep.step.actions.skip.href, {
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
      expect.objectContaining({ label: "Final current Temporal report", recordId: closed.report.id }),
      expect.objectContaining({ label: "Temporal timeline card", recordId: card.card.id })
    ]));
    expect(new Set(closed.readSideTrail.map((item) => `${item.label}:${item.recordId ?? "none"}`)).size)
      .toBe(closed.readSideTrail.length);
  });
});
