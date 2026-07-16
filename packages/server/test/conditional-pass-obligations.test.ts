import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Database from "better-sqlite3";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import {
  coverMatchingConditionalPassObligation,
  deferConditionalPassObligation,
  emitFoundationalObligations,
  reinstateConditionalPassObligation
} from "../src/conditional-pass-obligations.js";
import { CURRENT_SCHEMA_VERSION } from "../src/schema.js";
import { WorldFile } from "../src/world-file.js";

let tempDirs: string[] = [];

const tempPath = (name: string) => {
  const dir = mkdtempSync(join(tmpdir(), "worldloom-conditional-pass-"));
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

const canonicalDomainNames = [
  "Physics, metaphysics, and cosmology",
  "Geography, climate, and infrastructure",
  "Ecology, food, disease, and nonhuman life",
  "Population, demography, and household life",
  "Production, labor, and technology/magic",
  "Economy, trade, and scarcity",
  "Governance, law, and bureaucracy",
  "War, coercion, and security",
  "Religion, ritual, myth, and meaning",
  "Culture, custom, language, and identity",
  "Knowledge, education, science, and records",
  "History, memory, and path dependence",
  "Daily life and material residue",
  "Aesthetics, tone, and narrative use"
];

const createWorld = async (name = "conditional-pass.sqlite") => {
  const app = createApp();
  expect((await postJson(app, "/api/worlds/create", { path: tempPath(name) })).status).toBe(201);
  return app;
};

const createRecord = async (
  app: ReturnType<typeof createApp>,
  input: { recordTypeKey?: string; title: string; body: string; canonStatus?: string }
) => (await json<{ record: { id: number; shortId: string; title: string; body: string; canonStatus: string } }>(await postJson(app, "/api/records", {
  recordTypeKey: input.recordTypeKey ?? "canon_fact",
  title: input.title,
  body: input.body,
  truthLayer: "Objective canon",
  canonStatus: input.canonStatus ?? "accepted"
}))).record;

const prepareFoundationalPropagation = async (app: ReturnType<typeof createApp>, factId: number, debtRecordId?: number) => {
  await postJson(app, `/api/records/${factId}/facets`, { vocabulary: "admission_level", term: "5" });
  await postJson(app, `/api/records/${factId}/facets`, { vocabulary: "work_scale", term: "catastrophic" });
  const started = await json<{ flow: { id: number } }>(await postJson(app, "/api/propagation/runs/start", { factRecordId: factId, debtRecordId }));
  for (const orderKey of ["zeroth", "first", "second", "third", "fourth", "fifth"]) {
    expect((await postJson(app, "/api/propagation/consequences", {
      flowId: started.flow.id,
      orderKey,
      body: `${orderKey} order foundational consequence with durable substance.`,
      pressure: "normal"
    })).status).toBe(201);
  }
  for (const domainName of canonicalDomainNames) {
    expect((await postJson(app, "/api/propagation/domains", {
      flowId: started.flow.id,
      domainName,
      triage: "direct",
      declaration: `${domainName} is governed in the foundational pass.`
    })).status).toBe(201);
  }
  return started.flow.id;
};

const closeFoundationalPropagation = async (app: ReturnType<typeof createApp>, factId: number, debtRecordId?: number) => {
  const flowId = await prepareFoundationalPropagation(app, factId, debtRecordId);
  const response = await postJson(app, `/api/propagation/runs/${flowId}/close`);
  if (response.status !== 201) throw new Error(`Propagation close failed: ${await response.clone().text()}`);
  return json<any>(response);
};

afterEach(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs = [];
});

describe("conditional-pass obligation HTTP contract", () => {
  it("enforces Conditional-pass event transition shape at the SQLite boundary", () => {
    const path = tempPath("conditional-pass-event-invariants.sqlite");
    const world = WorldFile.create(path);
    try {
      const fact = world.createRecord({
        recordTypeKey: "canon_fact",
        title: "Invariant source fact",
        body: "Direct SQL must preserve the Conditional-pass lifecycle contract.",
        truthLayer: "Objective canon",
        canonStatus: "accepted"
      });
      world.addFacet(fact.id, { vocabulary: "admission_level", term: "5" });
      world.addFacet(fact.id, { vocabulary: "work_scale", term: "catastrophic" });
      const report = world.createRecord({
        recordTypeKey: "propagation_report",
        title: "Invariant final Propagation report",
        body: "Final source-linked report.",
        truthLayer: "Objective canon",
        canonStatus: "accepted"
      });
      const obligation = emitFoundationalObligations(world, {
        sourceFactRecordId: fact.id,
        propagationReportRecordId: report.id
      })[0]!;
      const evidence = world.createRecord({
        recordTypeKey: "pass_report",
        title: "Completed matching pass",
        body: "Substantive completed evidence.",
        truthLayer: "Objective canon",
        canonStatus: "accepted"
      });
      const insert = world.db.prepare(`
        INSERT INTO conditional_pass_obligation_events (
          obligation_id, action_key, prior_disposition, resulting_disposition,
          rationale, evidence_record_id, actor_id, flow_step
        ) VALUES (?, ?, ?, ?, ?, ?, 1, 'test:direct-sql')
      `);

      expect(() => insert.run(obligation.id, "reinstated", "outstanding", "outstanding", "Invalid prior state.", null))
        .toThrow(/reinstated.*deferred.*outstanding/i);
      expect(() => insert.run(obligation.id, "reinstated", "deferred", "outstanding", "   ", null))
        .toThrow(/reinstated.*reason/i);
      expect(() => insert.run(obligation.id, "covered", "deferred", "covered", null, null))
        .toThrow(/covered.*evidence/i);
      expect(() => insert.run(obligation.id, "covered", "deferred", "covered", "Reason is not coverage evidence.", evidence.id))
        .toThrow(/covered.*rationale/i);
    } finally {
      world.close();
    }
  });

  it("migrates deferred obligations and ordered history without rewriting them before redemption", () => {
    const path = tempPath("conditional-pass-v13-migration.sqlite");
    const world = WorldFile.create(path);
    const fact = world.createRecord({
      recordTypeKey: "canon_fact",
      title: "Historical redemption source",
      body: "A historical deferred handoff must remain deferred until explicit redemption.",
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    });
    world.addFacet(fact.id, { vocabulary: "admission_level", term: "5" });
    world.addFacet(fact.id, { vocabulary: "work_scale", term: "catastrophic" });
    const report = world.createRecord({
      recordTypeKey: "propagation_report",
      title: "Historical final Propagation report",
      body: "The immutable historical report owns the original source-linked handoff.",
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    });
    const obligations = emitFoundationalObligations(world, {
      sourceFactRecordId: fact.id,
      propagationReportRecordId: report.id
    });
    const temporal = obligations.find((item) => item.passKey === "temporal_timeline")!;
    const constraint = obligations.find((item) => item.passKey === "constraint_composition")!;
    deferConditionalPassObligation(world, {
      obligationId: temporal.id,
      reason: "Historical Temporal deferral remains governed.",
      passKey: temporal.passKey,
      sourceFactRecordId: fact.id,
      propagationReportRecordId: report.id
    });
    deferConditionalPassObligation(world, {
      obligationId: constraint.id,
      reason: "Historical Constraint deferral remains governed.",
      passKey: constraint.passKey,
      sourceFactRecordId: fact.id,
      propagationReportRecordId: report.id
    });
    const obligationsBefore = world.db.prepare(`
      SELECT * FROM conditional_pass_obligations ORDER BY id
    `).all();
    const eventsBefore = world.db.prepare(`
      SELECT * FROM conditional_pass_obligation_events ORDER BY id
    `).all();

    world.db.exec(`
      DROP TABLE conditional_pass_flow_bindings;
      DROP TRIGGER conditional_pass_events_emission_shape;
      DROP TRIGGER conditional_pass_events_deferral_shape;
      DROP TRIGGER conditional_pass_events_deferral_reason;
      DROP TRIGGER conditional_pass_events_reinstatement_shape;
      DROP TRIGGER conditional_pass_events_reinstatement_reason;
      DROP TRIGGER conditional_pass_events_coverage_shape;
      DROP TRIGGER conditional_pass_events_coverage_evidence;
      DROP TRIGGER conditional_pass_events_coverage_rationale;
      ALTER TABLE conditional_pass_obligation_events RENAME TO conditional_pass_obligation_events_v14;
      CREATE TABLE conditional_pass_obligation_events (
        id INTEGER PRIMARY KEY,
        obligation_id INTEGER NOT NULL REFERENCES conditional_pass_obligations(id) ON DELETE CASCADE,
        action_key TEXT NOT NULL CHECK (action_key IN ('emitted', 'reconciled', 'deferred', 'covered')),
        prior_disposition TEXT CHECK (prior_disposition IN ('outstanding', 'covered', 'deferred')),
        resulting_disposition TEXT NOT NULL CHECK (resulting_disposition IN ('outstanding', 'covered', 'deferred')),
        rationale TEXT,
        evidence_record_id INTEGER REFERENCES records(id) ON DELETE RESTRICT,
        actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
        flow_step TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        UNIQUE (obligation_id, action_key, resulting_disposition, evidence_record_id)
      ) STRICT;
      INSERT INTO conditional_pass_obligation_events
      SELECT * FROM conditional_pass_obligation_events_v14 ORDER BY id;
      DROP TABLE conditional_pass_obligation_events_v14;
      PRAGMA user_version = 13;
    `);
    world.close();

    const migrated = WorldFile.open(path);
    try {
      expect(migrated.schemaVersion()).toBe(CURRENT_SCHEMA_VERSION);
      expect(migrated.db.prepare("SELECT * FROM conditional_pass_obligations ORDER BY id").all()).toEqual(obligationsBefore);
      expect(migrated.db.prepare("SELECT * FROM conditional_pass_obligation_events ORDER BY id").all()).toEqual(eventsBefore);
      expect(migrated.db.prepare(`
        SELECT disposition FROM conditional_pass_obligations WHERE id = ?
      `).get(temporal.id)).toEqual({ disposition: "deferred" });

      const reinstated = reinstateConditionalPassObligation(migrated, {
        obligationId: temporal.id,
        reason: "Historical evidence is ready for renewed Temporal work.",
        passKey: temporal.passKey,
        sourceFactRecordId: fact.id,
        propagationReportRecordId: report.id
      }).obligation;
      expect(reinstated).toMatchObject({ disposition: "outstanding", rationale: null });

      const evidence = migrated.createRecord({
        recordTypeKey: "pass_report",
        title: "Historical Constraint completion evidence",
        body: "Completed matching work directly redeems the historical deferred obligation.",
        truthLayer: "Objective canon",
        canonStatus: "accepted"
      });
      const covered = coverMatchingConditionalPassObligation(migrated, {
        obligationId: constraint.id,
        passKey: constraint.passKey,
        sourceFactRecordId: fact.id,
        propagationReportRecordId: report.id,
        coveringReportRecordId: evidence.id,
        flowStep: "test:historical-direct-coverage"
      });
      expect(covered).toMatchObject({
        disposition: "covered",
        history: expect.arrayContaining([
          expect.objectContaining({ action: "deferred", rationale: "Historical Constraint deferral remains governed." }),
          expect.objectContaining({ action: "covered", priorState: "deferred", evidenceRecordId: evidence.id })
        ])
      });
      expect(migrated.db.prepare(`
        SELECT action_key FROM conditional_pass_obligation_events ORDER BY id LIMIT ?
      `).all(eventsBefore.length)).toEqual(eventsBefore.map((event: any) => ({ action_key: event.action_key })));
    } finally {
      migrated.close();
    }
  });

  it("refuses ambiguous or wrong-report direct coverage without selecting an obligation", () => {
    const path = tempPath("conditional-pass-coverage-identity.sqlite");
    const world = WorldFile.create(path);
    try {
      const fact = world.createRecord({
        recordTypeKey: "canon_fact",
        title: "Coverage identity source",
        body: "Multiple final reports require exact structured coverage identity.",
        truthLayer: "Objective canon",
        canonStatus: "accepted"
      });
      world.addFacet(fact.id, { vocabulary: "admission_level", term: "5" });
      world.addFacet(fact.id, { vocabulary: "work_scale", term: "catastrophic" });
      const reports = ["First final report", "Second final report"].map((title) => world.createRecord({
        recordTypeKey: "propagation_report",
        title,
        body: `${title} preserves its own source-linked handoff.`,
        truthLayer: "Objective canon",
        canonStatus: "accepted"
      }));
      const first = emitFoundationalObligations(world, {
        sourceFactRecordId: fact.id,
        propagationReportRecordId: reports[0]!.id
      }).find((item) => item.passKey === "temporal_timeline")!;
      const second = emitFoundationalObligations(world, {
        sourceFactRecordId: fact.id,
        propagationReportRecordId: reports[1]!.id
      }).find((item) => item.passKey === "temporal_timeline")!;
      const evidence = world.createRecord({
        recordTypeKey: "pass_report",
        title: "Completed Temporal evidence",
        body: "Completed source-linked Temporal work.",
        truthLayer: "Objective canon",
        canonStatus: "accepted"
      });
      const before = world.db.prepare(`
        SELECT id, disposition, rationale, covering_report_record_id
        FROM conditional_pass_obligations
        WHERE id IN (?, ?)
        ORDER BY id
      `).all(first.id, second.id);

      expect(() => coverMatchingConditionalPassObligation(world, {
        passKey: "temporal_timeline",
        sourceFactRecordId: fact.id,
        propagationReportRecordId: reports[1]!.id + 999,
        coveringReportRecordId: evidence.id,
        flowStep: "test:wrong-report"
      })).toThrow(/Propagation report.*does not match/i);
      expect(() => coverMatchingConditionalPassObligation(world, {
        passKey: "temporal_timeline",
        sourceFactRecordId: fact.id,
        coveringReportRecordId: evidence.id,
        flowStep: "test:ambiguous"
      })).toThrow(/multiple non-covered.*select.*Propagation report/i);
      expect(world.db.prepare(`
        SELECT id, disposition, rationale, covering_report_record_id
        FROM conditional_pass_obligations
        WHERE id IN (?, ?)
        ORDER BY id
      `).all(first.id, second.id)).toEqual(before);
    } finally {
      world.close();
    }
  });

  it("rolls back projection and event persistence failures without changing unrelated World state", () => {
    const path = tempPath("conditional-pass-transition-rollback.sqlite");
    const world = WorldFile.create(path);
    try {
      const kernel = world.createRecord({
        recordTypeKey: "world_kernel",
        title: "Rollback kernel",
        body: "Only the selected Conditional-pass projection and event may change.",
        truthLayer: "Objective canon",
        canonStatus: "accepted"
      });
      const fact = world.createRecord({
        recordTypeKey: "canon_fact",
        title: "Rollback source fact",
        body: "Forced transition failures preserve every authoritative neighbor.",
        truthLayer: "Objective canon",
        canonStatus: "accepted"
      });
      world.addFacet(fact.id, { vocabulary: "admission_level", term: "5" });
      world.addFacet(fact.id, { vocabulary: "work_scale", term: "catastrophic" });
      const report = world.createRecord({
        recordTypeKey: "propagation_report",
        title: "Rollback final Propagation report",
        body: "Append-only report content must survive every forced failure.",
        truthLayer: "Objective canon",
        canonStatus: "accepted"
      });
      const admission = world.createRecord({
        recordTypeKey: "canon_fact",
        title: "Unrelated Admission proposal",
        body: "This queued proposal is outside the transition boundary.",
        truthLayer: "Objective canon",
        canonStatus: "proposed"
      });
      const debt = world.createCanonDebt({
        name: "Unrelated rollback debt",
        scope: "qa",
        assignee: "steward",
        body: "This debt remains unchanged."
      });
      world.createLinkIfMissing(debt.id, kernel.id, "requires_follow_up", "Unrelated rollback fixture link");
      const obligations = emitFoundationalObligations(world, {
        sourceFactRecordId: fact.id,
        propagationReportRecordId: report.id
      });
      const temporal = obligations.find((item) => item.passKey === "temporal_timeline")!;
      const constraint = obligations.find((item) => item.passKey === "constraint_composition")!;
      deferConditionalPassObligation(world, {
        obligationId: temporal.id,
        reason: "Deferred before forced reinstatement failures.",
        passKey: temporal.passKey,
        sourceFactRecordId: fact.id,
        propagationReportRecordId: report.id
      });
      deferConditionalPassObligation(world, {
        obligationId: constraint.id,
        reason: "Deferred before forced coverage failure.",
        passKey: constraint.passKey,
        sourceFactRecordId: fact.id,
        propagationReportRecordId: report.id
      });
      const snapshot = () => ({
        obligations: world.db.prepare("SELECT * FROM conditional_pass_obligations ORDER BY id").all(),
        events: world.db.prepare("SELECT * FROM conditional_pass_obligation_events ORDER BY id").all(),
        records: world.listRecords(),
        links: world.listLinks(),
        admission: world.getRecord(admission.id),
        debt: world.getRecord(debt.id)
      });

      const beforeProjectionFailure = snapshot();
      world.db.exec(`
        CREATE TRIGGER fail_conditional_pass_projection_update
        BEFORE UPDATE ON conditional_pass_obligations
        WHEN old.id = ${temporal.id}
        BEGIN
          SELECT RAISE(ABORT, 'forced Conditional-pass projection failure');
        END;
      `);
      expect(() => reinstateConditionalPassObligation(world, {
        obligationId: temporal.id,
        reason: "This transition must roll back.",
        passKey: temporal.passKey,
        sourceFactRecordId: fact.id,
        propagationReportRecordId: report.id
      })).toThrow(/forced Conditional-pass projection failure/i);
      expect(snapshot()).toEqual(beforeProjectionFailure);
      world.db.exec("DROP TRIGGER fail_conditional_pass_projection_update");

      const beforeEventFailure = snapshot();
      world.db.exec(`
        CREATE TRIGGER fail_conditional_pass_reinstatement_event
        BEFORE INSERT ON conditional_pass_obligation_events
        WHEN new.action_key = 'reinstated'
        BEGIN
          SELECT RAISE(ABORT, 'forced Conditional-pass event failure');
        END;
      `);
      expect(() => reinstateConditionalPassObligation(world, {
        obligationId: temporal.id,
        reason: "The projection update must roll back with the event.",
        passKey: temporal.passKey,
        sourceFactRecordId: fact.id,
        propagationReportRecordId: report.id
      })).toThrow(/forced Conditional-pass event failure/i);
      expect(snapshot()).toEqual(beforeEventFailure);
      world.db.exec("DROP TRIGGER fail_conditional_pass_reinstatement_event");

      const evidence = world.createRecord({
        recordTypeKey: "pass_report",
        title: "Forced coverage evidence",
        body: "This report exists before the forced event failure.",
        truthLayer: "Objective canon",
        canonStatus: "accepted"
      });
      const beforeCoverageFailure = snapshot();
      world.db.exec(`
        CREATE TRIGGER fail_conditional_pass_coverage_event
        BEFORE INSERT ON conditional_pass_obligation_events
        WHEN new.action_key = 'covered'
        BEGIN
          SELECT RAISE(ABORT, 'forced Conditional-pass coverage event failure');
        END;
      `);
      expect(() => coverMatchingConditionalPassObligation(world, {
        obligationId: constraint.id,
        passKey: constraint.passKey,
        sourceFactRecordId: fact.id,
        propagationReportRecordId: report.id,
        coveringReportRecordId: evidence.id,
        flowStep: "test:forced-coverage-failure"
      })).toThrow(/forced Conditional-pass coverage event failure/i);
      expect(snapshot()).toEqual(beforeCoverageFailure);
    } finally {
      world.close();
    }
  });

  it("atomically emits the three ordered source/report-linked obligations on foundational Propagation close", async () => {
    const app = await createWorld();
    await createRecord(app, {
      recordTypeKey: "world_kernel",
      title: "Chrononaut kernel",
      body: "A chrononaut state governs causal crossings."
    });
    const fact = await createRecord(app, {
      title: "FAC-3 foundational chrononaut",
      body: "FAC-3 changes how causality may be crossed."
    });
    const close = await closeFoundationalPropagation(app, fact.id);

    expect(close.obligations).toHaveLength(3);
    expect(close.obligations.map((item: any) => [item.passKey, item.ordinal, item.disposition])).toEqual([
      ["temporal_timeline", 1, "outstanding"],
      ["constraint_composition", 2, "outstanding"],
      ["institutional_economic_suppression", 3, "outstanding"]
    ]);
    expect(close.obligations).toEqual(expect.arrayContaining([
      expect.objectContaining({
        record: expect.objectContaining({ recordTypeKey: "conditional_pass_obligation" }),
        sourceFact: expect.objectContaining({ id: fact.id, shortId: fact.shortId }),
        propagationReport: expect.objectContaining({ id: close.report.id, recordTypeKey: "propagation_report" })
      })
    ]));

    const read = await app.request("/api/conditional-pass-obligations");
    expect(read.status).toBe(200);
    const payload = await json<{ obligations: Array<any> }>(read);
    expect(payload.obligations).toEqual(close.obligations);

    for (const obligation of payload.obligations) {
      expect(obligation.readSideTrail).toEqual([
        expect.objectContaining({ label: `Source fact ${fact.shortId}`, recordId: fact.id, href: `/api/canon-workbench/records/${fact.id}` }),
        expect.objectContaining({ label: `Propagation report ${close.report.shortId}`, recordId: close.report.id, href: `/api/canon-workbench/records/${close.report.id}` }),
        expect.objectContaining({ label: `Obligation ${obligation.record.shortId}`, recordId: obligation.record.id, href: `/api/canon-workbench/records/${obligation.record.id}` })
      ]);
      for (const trail of obligation.readSideTrail) {
        expect((await app.request(trail.href)).status).toBe(200);
      }
      const links = await json<{ links: Array<{ fromRecordId: number; toRecordId: number; linkTypeKey: string }> }>(
        await app.request(`/api/links?recordId=${obligation.record.id}`)
      );
      expect(links.links).toEqual(expect.arrayContaining([
        expect.objectContaining({ fromRecordId: obligation.record.id, toRecordId: fact.id, linkTypeKey: "derived_from" }),
        expect.objectContaining({ fromRecordId: obligation.record.id, toRecordId: close.report.id, linkTypeKey: "derived_from" })
      ]));
    }
  });

  it("reconciles a historical closed foundational run once at world open without rewriting its audit history", async () => {
    const path = tempPath("historical-conditional-pass.sqlite");
    const app = createApp();
    expect((await postJson(app, "/api/worlds/create", { path })).status).toBe(201);
    const fact = await createRecord(app, {
      title: "Historical foundational bridge",
      body: "The bridge has always carried testimony across generations."
    });
    const close = await closeFoundationalPropagation(app, fact.id);
    const reportBefore = close.report;
    const linksBefore = await json<{ links: Array<any> }>(await app.request(`/api/links?recordId=${fact.id}`));
    const digestBefore = linksBefore.links.find((link) => link.fromRecordId === fact.id && link.toRecordId === reportBefore.id && link.linkTypeKey === "digest_of");
    expect(digestBefore).toBeDefined();

    expect((await postJson(app, "/api/worlds/create", { path: tempPath("historical-dummy.sqlite") })).status).toBe(201);
    const db = new Database(path);
    db.pragma("foreign_keys = ON");
    const obligationRecordIds = (db.prepare("SELECT record_id FROM conditional_pass_obligations ORDER BY id").all() as Array<{ record_id: number }>).map((row) => row.record_id);
    db.exec("DROP TABLE conditional_pass_flow_bindings");
    db.exec("DROP TABLE conditional_pass_obligation_events");
    db.exec("DROP TABLE conditional_pass_obligations");
    for (const recordId of obligationRecordIds) db.prepare("DELETE FROM records WHERE id = ?").run(recordId);
    db.prepare("DELETE FROM record_type_sequences WHERE record_type_key = 'conditional_pass_obligation'").run();
    db.prepare("DELETE FROM record_types WHERE key = 'conditional_pass_obligation'").run();
    db.pragma("user_version = 11");
    expect(db.pragma("user_version", { simple: true })).toBe(11);
    db.close();

    const historicalOpen = await postJson(app, "/api/worlds/open", { path });
    expect(historicalOpen.status, await historicalOpen.clone().text()).toBe(200);
    const first = await json<{ obligations: Array<any> }>(await app.request("/api/conditional-pass-obligations"));
    expect(first.obligations).toHaveLength(3);
    expect(first.obligations.every((item) => item.history[0]?.action === "reconciled")).toBe(true);
    expect(first.obligations.every((item) => item.sourceFact.id === fact.id && item.propagationReport.id === reportBefore.id)).toBe(true);

    const recordsAfter = await json<{ records: Array<any> }>(await app.request("/api/records"));
    expect(recordsAfter.records.find((record) => record.id === fact.id)).toMatchObject({ body: fact.body, canonStatus: fact.canonStatus });
    expect(recordsAfter.records.find((record) => record.id === reportBefore.id)).toMatchObject({ body: reportBefore.body, recordTypeKey: "propagation_report" });
    const linksAfter = await json<{ links: Array<any> }>(await app.request(`/api/links?recordId=${fact.id}`));
    expect(linksAfter.links).toEqual(expect.arrayContaining([digestBefore]));

    expect((await postJson(app, "/api/worlds/create", { path: tempPath("historical-dummy-2.sqlite") })).status).toBe(201);
    expect((await postJson(app, "/api/worlds/open", { path })).status).toBe(200);
    const second = await json<{ obligations: Array<any> }>(await app.request("/api/conditional-pass-obligations"));
    expect(second.obligations).toEqual(first.obligations);
  });

  it("skips historical reconciliation when structured severity or the typed fact-to-report digest is absent", async () => {
    const app = createApp();
    for (const missing of ["severity", "digest"] as const) {
      const path = tempPath(`historical-missing-${missing}.sqlite`);
      expect((await postJson(app, "/api/worlds/create", { path })).status).toBe(201);
      const fact = await createRecord(app, {
        title: `Historical source missing ${missing}`,
        body: "Prose alone never establishes a conditional-pass obligation."
      });
      const close = await closeFoundationalPropagation(app, fact.id);
      expect((await postJson(app, "/api/worlds/create", { path: tempPath(`historical-missing-${missing}-dummy.sqlite`) })).status).toBe(201);

      const db = new Database(path);
      db.pragma("foreign_keys = ON");
      const obligationRecordIds = (db.prepare("SELECT record_id FROM conditional_pass_obligations").all() as Array<{ record_id: number }>).map((row) => row.record_id);
      db.prepare("DELETE FROM conditional_pass_obligations").run();
      for (const recordId of obligationRecordIds) db.prepare("DELETE FROM records WHERE id = ?").run(recordId);
      if (missing === "severity") {
        db.prepare("DELETE FROM record_facets WHERE record_id = ? AND vocabulary IN ('admission_level', 'work_scale')").run(fact.id);
      } else {
        db.prepare("DELETE FROM record_links WHERE from_record_id = ? AND to_record_id = ? AND link_type_key = 'digest_of'").run(fact.id, close.report.id);
      }
      db.close();

      expect((await postJson(app, "/api/worlds/open", { path })).status).toBe(200);
      const read = await json<{ obligations: Array<any> }>(await app.request("/api/conditional-pass-obligations"));
      expect(read.obligations).toEqual([]);
    }
  });

  it("rolls back the entire foundational close when an obligation write fails", async () => {
    const path = tempPath("failed-obligation-write.sqlite");
    const app = createApp();
    expect((await postJson(app, "/api/worlds/create", { path })).status).toBe(201);
    const fact = await createRecord(app, {
      title: "Rollback foundational fact",
      body: "A failed handoff must not leave a closed Propagation report."
    });
    const debt = await json<{ debt: { id: number } }>(await postJson(app, "/api/canon-debt", {
      name: "Rollback propagation debt",
      scope: "propagation",
      assignee: "steward",
      body: "This debt closes only with the full atomic handoff."
    }));
    await postJson(app, "/api/links", {
      fromRecordId: debt.debt.id,
      toRecordId: fact.id,
      linkTypeKey: "derived_from",
      note: "Rollback fixture source"
    });
    const recordsBefore = await json<{ records: Array<any> }>(await app.request("/api/records"));
    const debtBefore = recordsBefore.records.find((record) => record.id === debt.debt.id);
    const flowId = await prepareFoundationalPropagation(app, fact.id, debt.debt.id);

    const db = new Database(path);
    db.exec(`
      CREATE TRIGGER fail_conditional_pass_obligation_write
      BEFORE INSERT ON conditional_pass_obligations
      BEGIN
        SELECT RAISE(ABORT, 'forced conditional-pass obligation failure');
      END;
    `);
    db.close();

    const failed = await postJson(app, `/api/propagation/runs/${flowId}/close`);
    expect(failed.status).toBe(400);
    expect(await json<{ error: string }>(failed)).toMatchObject({ error: expect.stringContaining("forced conditional-pass obligation failure") });

    const run = await json<any>(await app.request(`/api/propagation/runs/${flowId}`));
    expect(run.flow).toMatchObject({ state: "in_progress", propagation_report_record_id: null });
    const records = await json<{ records: Array<any> }>(await app.request("/api/records"));
    expect(records.records.filter((record) => record.recordTypeKey === "propagation_report")).toEqual([]);
    expect(records.records.filter((record) => record.recordTypeKey === "conditional_pass_obligation")).toEqual([]);
    expect(records.records.find((record) => record.id === debt.debt.id)).toEqual(debtBefore);
    const links = await json<{ links: Array<any> }>(await app.request(`/api/links?recordId=${fact.id}`));
    expect(links.links.some((link) => link.fromRecordId === fact.id && link.linkTypeKey === "digest_of")).toBe(false);
  });

  it("governs explicit deferral with rationale, provenance, idempotency, and sibling isolation", async () => {
    const app = await createWorld("deferral.sqlite");
    const fact = await createRecord(app, {
      title: "Deferrable foundational fact",
      body: "Its specialized passes remain source-linked and independently governed."
    });
    const close = await closeFoundationalPropagation(app, fact.id);
    const target = close.obligations[1];
    const siblingBefore = close.obligations[2];
    const otherFact = await createRecord(app, {
      title: "Another fact",
      body: "This fact cannot govern the first fact's obligation."
    });
    const recordsBefore = await json<{ records: Array<any> }>(await app.request("/api/records"));

    const empty = await postJson(app, `/api/conditional-pass-obligations/${target.id}/defer`, { rationale: "" });
    expect(empty.status).toBe(400);
    expect(await json<{ error: string }>(empty)).toMatchObject({ error: expect.stringMatching(/non-empty.*rationale/i) });

    const invalidIdentityAttempts = [
      { body: { rationale: "Substantive but invalid.", disposition: "covered" }, error: /unknown.*disposition/i },
      { body: { rationale: "Substantive but invalid.", passKey: "unknown_pass" }, error: /unknown or mismatched.*key/i },
      { body: { rationale: "Substantive but invalid.", sourceFactRecordId: otherFact.id }, error: /source fact.*does not match/i },
      { body: { rationale: "Substantive but invalid.", propagationReportRecordId: close.report.id + 999 }, error: /Propagation report.*does not match/i }
    ];
    for (const attempt of invalidIdentityAttempts) {
      const response = await postJson(app, `/api/conditional-pass-obligations/${target.id}/defer`, attempt.body);
      expect(response.status).toBe(400);
      expect(await json<{ error: string }>(response)).toMatchObject({ error: expect.stringMatching(attempt.error) });
    }

    const rationale = "Defer constraint composition until the steward has named the bridge materials; Admission remains available.";
    const valid = await postJson(app, `/api/conditional-pass-obligations/${target.id}/defer`, { rationale });
    expect(valid.status).toBe(201);
    const governed = await json<{ obligation: any }>(valid);
    expect(governed.obligation).toMatchObject({
      id: target.id,
      disposition: "deferred",
      rationale,
      sourceFact: { id: fact.id },
      propagationReport: { id: close.report.id },
      coveringEvidence: null,
      history: expect.arrayContaining([
        expect.objectContaining({
          action: "deferred",
          priorState: "outstanding",
          resultingState: "deferred",
          rationale,
          actor: "steward",
          timestamp: expect.any(String),
          flowStep: "conditional-pass-obligation:defer"
        })
      ])
    });

    const retry = await postJson(app, `/api/conditional-pass-obligations/${target.id}/defer`, { rationale });
    expect(retry.status).toBe(200);
    expect((await json<{ obligation: any }>(retry)).obligation).toEqual(governed.obligation);

    const incompatible = await postJson(app, `/api/conditional-pass-obligations/${target.id}/defer`, { rationale: "A different rationale." });
    expect(incompatible.status).toBe(400);
    expect(await json<{ error: string }>(incompatible)).toMatchObject({ error: expect.stringMatching(/already deferred.*different rationale/i) });

    const read = await json<{ obligations: Array<any> }>(await app.request("/api/conditional-pass-obligations"));
    expect(read.obligations.find((item) => item.id === target.id)).toEqual(governed.obligation);
    expect(read.obligations.find((item) => item.id === siblingBefore.id)).toEqual(siblingBefore);
    const recordsAfter = await json<{ records: Array<any> }>(await app.request("/api/records"));
    for (const recordId of [fact.id, close.report.id]) {
      expect(recordsAfter.records.find((record) => record.id === recordId)).toEqual(recordsBefore.records.find((record) => record.id === recordId));
    }
  });

  it("reinstates a deferred obligation with governed history, state-aware retries, and fresh-map routing", async () => {
    const app = await createWorld("reinstatement.sqlite");
    await createRecord(app, {
      recordTypeKey: "world_kernel",
      title: "Redeemable handoff kernel",
      body: "The workflow map keeps Admission available while specialized work remains governed."
    });
    await createRecord(app, {
      title: "Waiting Admission proposal",
      body: "This proposal remains directly navigable while Conditional-pass work is owed.",
      canonStatus: "proposed"
    });
    const fact = await createRecord(app, {
      title: "Redeemable foundational fact",
      body: "Its Temporal obligation may be deferred and later reinstated without losing history."
    });
    const close = await closeFoundationalPropagation(app, fact.id);
    const target = close.obligations.find((item: any) => item.passKey === "temporal_timeline");
    const initialMap = await json<any>(await app.request("/api/workflow-map"));
    const outstanding = initialMap.conditionalPasses.obligations.find((item: any) => item.id === target.id);

    expect(outstanding).toMatchObject({
      disposition: "outstanding",
      packageSources: [
        "docs/worldbuilding-system/03_truth_layers_and_canon_governance.md",
        "docs/worldbuilding-system/07_propagation_engine.md",
        "docs/worldbuilding-system/22_glossary.md"
      ],
      fieldClassifications: {
        required: ["reason"],
        optional: [],
        skippable: ["governed deferral with written rationale"],
        severityDependent: []
      },
      action: {
        kind: "defer",
        requiredReason: true,
        body: {
          disposition: "deferred",
          expectedDisposition: "outstanding",
          passKey: "temporal_timeline",
          sourceFactRecordId: fact.id,
          propagationReportRecordId: close.report.id
        }
      }
    });

    const deferralReason = "Defer Temporal work until the chrononaut archive is indexed.";
    const deferredResponse = await postJson(app, outstanding.action.href, {
      ...outstanding.action.body,
      reason: deferralReason
    });
    expect(deferredResponse.status).toBe(201);
    const deferred = (await json<{ obligation: any }>(deferredResponse)).obligation;
    expect(deferred).toMatchObject({
      disposition: "deferred",
      rationale: deferralReason,
      coveringEvidence: null,
      action: {
        kind: "reinstate",
        requiredReason: true,
        body: {
          disposition: "outstanding",
          expectedDisposition: "deferred",
          passKey: "temporal_timeline",
          sourceFactRecordId: fact.id,
          propagationReportRecordId: close.report.id
        }
      }
    });

    const invalid = await postJson(app, deferred.action.href, { ...deferred.action.body, reason: "" });
    expect(invalid.status).toBe(400);
    expect(await json<{ error: string; remediation: string }>(invalid)).toMatchObject({
      error: expect.stringMatching(/reinstatement.*non-empty.*reason/i),
      remediation: expect.stringMatching(/enter.*reason.*retry/i)
    });
    const unchangedAfterInvalid = await json<{ obligations: Array<any> }>(await app.request("/api/conditional-pass-obligations"));
    expect(unchangedAfterInvalid.obligations.find((item) => item.id === target.id)).toEqual(deferred);

    const reinstatementReason = "The archive is indexed; make the source-selected Temporal pass owed again.";
    const reinstatedResponse = await postJson(app, deferred.action.href, {
      ...deferred.action.body,
      reason: reinstatementReason
    });
    expect(reinstatedResponse.status).toBe(201);
    const reinstated = (await json<{ obligation: any }>(reinstatedResponse)).obligation;
    expect(reinstated).toMatchObject({
      disposition: "outstanding",
      rationale: null,
      coveringEvidence: null,
      action: { kind: "defer" },
      history: expect.arrayContaining([
        expect.objectContaining({
          action: "deferred",
          priorState: "outstanding",
          resultingState: "deferred",
          rationale: deferralReason
        }),
        expect.objectContaining({
          action: "reinstated",
          priorState: "deferred",
          resultingState: "outstanding",
          rationale: reinstatementReason,
          actor: "steward",
          timestamp: expect.any(String),
          flowStep: "conditional-pass-obligation:reinstate"
        })
      ])
    });

    const retry = await postJson(app, deferred.action.href, {
      ...deferred.action.body,
      reason: reinstatementReason
    });
    expect(retry.status).toBe(200);
    expect((await json<{ obligation: any }>(retry)).obligation).toEqual(reinstated);

    const incompatible = await postJson(app, deferred.action.href, {
      ...deferred.action.body,
      reason: "A different retry reason."
    });
    expect(incompatible.status).toBe(400);
    expect(await json<{ error: string }>(incompatible)).toMatchObject({
      error: expect.stringMatching(/already outstanding.*different reinstatement reason/i)
    });

    const secondDeferredResponse = await postJson(app, reinstated.action.href, {
      ...reinstated.action.body,
      reason: deferralReason
    });
    expect(secondDeferredResponse.status).toBe(201);
    const secondDeferred = (await json<{ obligation: any }>(secondDeferredResponse)).obligation;
    const secondReinstatedResponse = await postJson(app, secondDeferred.action.href, {
      ...secondDeferred.action.body,
      reason: reinstatementReason
    });
    expect(secondReinstatedResponse.status).toBe(201);
    const secondReinstated = (await json<{ obligation: any }>(secondReinstatedResponse)).obligation;
    expect(secondReinstated.history.filter((event: any) => event.action === "deferred")).toHaveLength(2);
    expect(secondReinstated.history.filter((event: any) => event.action === "reinstated")).toHaveLength(2);
    expect(secondReinstated.history.map((event: any) => event.action)).toEqual([
      "emitted",
      "deferred",
      "reinstated",
      "deferred",
      "reinstated"
    ]);
    const secondRetry = await postJson(app, secondDeferred.action.href, {
      ...secondDeferred.action.body,
      reason: reinstatementReason
    });
    expect(secondRetry.status).toBe(200);
    expect((await json<{ obligation: any }>(secondRetry)).obligation.history).toEqual(secondReinstated.history);

    const refreshedMap = await json<any>(await app.request("/api/workflow-map"));
    expect(refreshedMap.conditionalPasses).toMatchObject({
      outstandingCount: 3,
      governedCount: 0,
      nextOrResumeState: {
        current: "Temporal/Timeline",
        next: "Constraint Composition",
        resume: expect.stringMatching(/fresh workflow-map/i)
      }
    });
    expect(refreshedMap.nextDecision).toMatchObject({
      destinationKey: "temporal",
      label: expect.stringMatching(/Temporal\/Timeline.*Redeemable foundational fact|Temporal\/Timeline.*FAC-/i)
    });
    expect(refreshedMap.destinations).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "temporal", state: "owed" }),
      expect.objectContaining({ key: "admission", state: "active" })
    ]));
  });

  it("covers the Temporal obligation only from a completed matching source-linked Temporal pass", async () => {
    const app = await createWorld("temporal-coverage.sqlite");
    const fact = await createRecord(app, {
      title: "Temporal foundational fact",
      body: "Its first-true and first-known dates govern every later pass."
    });
    const close = await closeFoundationalPropagation(app, fact.id);
    const temporal = close.obligations.find((item: any) => item.passKey === "temporal_timeline");

    const started = await json<any>(await postJson(app, "/api/temporal/runs/start", { sourceType: "fact", recordId: fact.id }));
    const incomplete = await postJson(app, `/api/temporal/runs/${started.flow.id}/close`);
    expect(incomplete.status).toBe(400);
    let read = await json<{ obligations: Array<any> }>(await app.request("/api/conditional-pass-obligations"));
    expect(read.obligations.find((item) => item.id === temporal.id)).toMatchObject({ disposition: "outstanding", coveringEvidence: null });

    expect((await postJson(app, "/api/temporal/coverage", {
      flowId: started.flow.id,
      temporalQuestions: "When did the fact become true, known, regulated, and ordinary?",
      firstTrueOrRelativeSequence: "The fact becomes true before the first crossing and before public notice.",
      firstKnownOrReason: "The steward records first knowledge after the third observed crossing.",
      dateTypesAndGranularity: "Event, discovery, public, institutional, ordinary-life, mythic, and authorial dates remain distinct at season granularity.",
      latency: "Discovery takes three crossings and institutional reaction takes two seasons.",
      residueByTimescale: "Days create rumor, years create licenses, and generations create inherited offices.",
      sequenceIntegrity: "The licensing office cannot precede the third observed crossing.",
      retrospectiveInsertion: "Earlier scenes retain rumor and one suppressed archive entry.",
      temporalMysteryBoundaries: "The cause stays author-secret while recurrence and forbidden uses remain governed.",
      outcomeDecision: "Close one source-linked pass report and route any new fact through Admission."
    })).status).toBe(201);
    const completed = await postJson(app, `/api/temporal/runs/${started.flow.id}/close`);
    expect(completed.status).toBe(201);
    const pass = await json<any>(completed);

    read = await json<{ obligations: Array<any> }>(await app.request("/api/conditional-pass-obligations"));
    expect(read.obligations.find((item) => item.id === temporal.id)).toMatchObject({
      disposition: "covered",
      rationale: null,
      coveringEvidence: { id: pass.report.id, recordTypeKey: "pass_report" },
      history: expect.arrayContaining([
        expect.objectContaining({
          action: "covered",
          priorState: "outstanding",
          resultingState: "covered",
          evidenceRecordId: pass.report.id,
          flowStep: "temporal:complete"
        })
      ])
    });
    expect(read.obligations.filter((item) => item.id !== temporal.id).every((item) => item.disposition === "outstanding")).toBe(true);
  });

  it("covers a deferred obligation directly from completed matching evidence and keeps covered state terminal", async () => {
    const app = await createWorld("direct-deferred-coverage.sqlite");
    const fact = await createRecord(app, {
      title: "Direct redemption foundational fact",
      body: "Completing the real Temporal work may redeem its deferred obligation without an intervening reinstatement."
    });
    const close = await closeFoundationalPropagation(app, fact.id);
    const temporal = close.obligations.find((item: any) => item.passKey === "temporal_timeline");
    const deferralReason = "Defer the route while another valid Temporal entry is already underway.";
    const deferredResponse = await postJson(app, `/api/conditional-pass-obligations/${temporal.id}/defer`, {
      reason: deferralReason,
      disposition: "deferred",
      expectedDisposition: "outstanding",
      passKey: "temporal_timeline",
      sourceFactRecordId: fact.id,
      propagationReportRecordId: close.report.id
    });
    expect(deferredResponse.status).toBe(201);
    const deferred = (await json<{ obligation: any }>(deferredResponse)).obligation;

    const started = await json<any>(await postJson(app, "/api/temporal/runs/start", { sourceType: "fact", recordId: fact.id }));
    expect((await postJson(app, "/api/temporal/coverage", {
      flowId: started.flow.id,
      temporalQuestions: "When does direct evidence become complete enough to redeem the deferred obligation?",
      firstTrueOrRelativeSequence: "The fact becomes true before observation, regulation, and ordinary-life adaptation.",
      firstKnownOrReason: "The steward records first knowledge after repeated source-linked observations.",
      dateTypesAndGranularity: "Event, discovery, public, institutional, ordinary-life, mythic, and authorial dates remain separate at season granularity.",
      latency: "Observation precedes institutional reaction by two seasons.",
      residueByTimescale: "Days create rumor, years create procedure, and generations create inherited offices.",
      sequenceIntegrity: "The institutional response cannot precede the first governed observation.",
      retrospectiveInsertion: "Earlier scenes retain rumor and one source-linked archive entry.",
      temporalMysteryBoundaries: "The cause remains author-secret while recurrence and forbidden uses stay governed.",
      outcomeDecision: "Close the substantive pass and let matching evidence redeem the exact source obligation."
    })).status).toBe(201);
    const completedResponse = await postJson(app, `/api/temporal/runs/${started.flow.id}/close`);
    expect(completedResponse.status).toBe(201);
    const completed = await json<any>(completedResponse);

    const read = await json<{ obligations: Array<any> }>(await app.request("/api/conditional-pass-obligations"));
    const covered = read.obligations.find((item) => item.id === temporal.id);
    expect(covered).toMatchObject({
      disposition: "covered",
      rationale: null,
      coveringEvidence: { id: completed.report.id, recordTypeKey: "pass_report" },
      blocker: expect.stringMatching(/terminal/i),
      action: null,
      history: expect.arrayContaining([
        expect.objectContaining({
          action: "deferred",
          priorState: "outstanding",
          resultingState: "deferred",
          rationale: deferralReason
        }),
        expect.objectContaining({
          action: "covered",
          priorState: "deferred",
          resultingState: "covered",
          evidenceRecordId: completed.report.id,
          flowStep: "temporal:complete"
        })
      ]),
      readSideTrail: expect.arrayContaining([
        expect.objectContaining({
          label: `Covering report ${completed.report.shortId}`,
          recordId: completed.report.id
        })
      ])
    });
    expect(covered.history.filter((event: any) => event.action === "reinstated")).toEqual([]);

    const refreshedMap = await json<any>(await app.request("/api/workflow-map"));
    expect(refreshedMap.destinations).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "temporal", state: "blocked" }),
      expect.objectContaining({ key: "constraint", state: "owed" }),
      expect.objectContaining({ key: "stage12", state: "owed" })
    ]));

    for (const attempt of [
      { path: `/api/conditional-pass-obligations/${temporal.id}/defer`, body: { reason: "Try to defer covered work." }, error: /covered.*cannot be deferred/i },
      { path: `/api/conditional-pass-obligations/${temporal.id}/reinstate`, body: { reason: "Try to reinstate covered work." }, error: /covered.*cannot be reinstated/i }
    ]) {
      const response = await postJson(app, attempt.path, attempt.body);
      expect(response.status).toBe(400);
      expect(await json<{ error: string }>(response)).toMatchObject({ error: expect.stringMatching(attempt.error) });
    }
    const afterRefusals = await json<{ obligations: Array<any> }>(await app.request("/api/conditional-pass-obligations"));
    expect(afterRefusals.obligations.find((item) => item.id === temporal.id)).toEqual(covered);
    expect(deferred.history).toHaveLength(2);
  });

  it("binds a source-selected specialized pass to the exact obligation when the source has multiple final Propagation reports", async () => {
    const app = await createWorld("source-selected-binding.sqlite");
    const fact = await createRecord(app, {
      title: "Repeated Propagation source",
      body: "Two final Propagation reports for the same source keep separate Temporal obligations."
    });
    const firstClose = await closeFoundationalPropagation(app, fact.id);
    const secondClose = await closeFoundationalPropagation(app, fact.id);
    const firstTemporal = firstClose.obligations.find((item: any) => item.passKey === "temporal_timeline");
    const secondTemporal = secondClose.obligations.find((item: any) => item.passKey === "temporal_timeline");
    const firstConstraint = firstClose.obligations.find((item: any) => item.passKey === "constraint_composition");
    const otherFact = await createRecord(app, {
      title: "Wrong source fact",
      body: "This record cannot inherit the selected obligation's route."
    });
    const map = await json<any>(await app.request("/api/workflow-map"));
    const selected = map.conditionalPasses.obligations.find((item: any) => item.id === firstTemporal.id);

    expect(selected.destination.body).toEqual({
      sourceType: "fact",
      recordId: fact.id,
      conditionalPassObligationId: firstTemporal.id,
      propagationReportRecordId: firstClose.report.id
    });
    const recordsBeforeInvalidStarts = await json<{ records: Array<any> }>(await app.request("/api/records"));
    for (const attempt of [
      {
        body: { ...selected.destination.body, recordId: otherFact.id },
        error: /source fact does not match/i
      },
      {
        body: { ...selected.destination.body, propagationReportRecordId: secondClose.report.id },
        error: /Propagation report does not match/i
      },
      {
        body: {
          ...selected.destination.body,
          conditionalPassObligationId: firstConstraint.id
        },
        error: /pass key does not match/i
      }
    ]) {
      const response = await postJson(app, selected.destination.href, attempt.body);
      expect(response.status).toBe(400);
      expect(await json<{ error: string; remediation: string }>(response)).toMatchObject({
        error: expect.stringMatching(attempt.error),
        remediation: expect.any(String)
      });
    }
    expect(await json(await app.request("/api/records"))).toEqual(recordsBeforeInvalidStarts);

    const started = await json<any>(await postJson(app, selected.destination.href, selected.destination.body));
    expect(started.conditionalPassBinding).toMatchObject({
      obligationId: firstTemporal.id,
      sourceFactRecordId: fact.id,
      propagationReportRecordId: firstClose.report.id,
      passKey: "temporal_timeline"
    });
    expect((await postJson(app, "/api/temporal/coverage", {
      flowId: started.flow.id,
      temporalQuestions: "Which of the source's final Propagation reports does this pass satisfy?",
      firstTrueOrRelativeSequence: "The source becomes true before the first selected report and its later correction report.",
      firstKnownOrReason: "The selected report's audit identifies the exact governed handoff.",
      dateTypesAndGranularity: "Event, discovery, public, institutional, ordinary-life, mythic, and authorial dates remain separate at season granularity.",
      latency: "The selected handoff's response occurs two seasons after public proof.",
      residueByTimescale: "Days create rumor, years create report-linked procedure, and generations retain audit offices.",
      sequenceIntegrity: "Coverage follows the selected report and never jumps to the later report.",
      retrospectiveInsertion: "Earlier scenes retain source-linked residue without merging report identities.",
      temporalMysteryBoundaries: "The cause remains author-secret while report identity stays explicit.",
      outcomeDecision: "Close this pass against only the server-selected Conditional-pass obligation."
    })).status).toBe(201);
    const completed = await postJson(app, `/api/temporal/runs/${started.flow.id}/close`);
    expect(completed.status, await completed.clone().text()).toBe(201);

    const read = await json<{ obligations: Array<any> }>(await app.request("/api/conditional-pass-obligations"));
    expect(read.obligations.find((item) => item.id === firstTemporal.id)).toMatchObject({
      disposition: "covered",
      propagationReport: { id: firstClose.report.id }
    });
    expect(read.obligations.find((item) => item.id === secondTemporal.id)).toMatchObject({
      disposition: "outstanding",
      propagationReport: { id: secondClose.report.id }
    });
  });

  it("covers Constraint Composition and Institutional obligations from their existing completed pass reports", async () => {
    const app = await createWorld("remaining-pass-coverage.sqlite");
    const fact = await createRecord(app, {
      title: "Three-pass foundational fact",
      body: "The same source fact must remain authoritative across specialized passes."
    });
    const close = await closeFoundationalPropagation(app, fact.id);

    const constraintRun = await json<any>(await postJson(app, "/api/constraint-composition/runs/start", { sourceType: "fact", recordId: fact.id }));
    expect((await postJson(app, "/api/constraint-composition/inventory", {
      flowId: constraintRun.flow.id,
      constrainedFact: "Three-pass foundational fact",
      constraintStatement: "Crossings require a public source record and named report.",
      constraintType: "knowledge",
      prevents: "Unlinked work cannot satisfy the source obligation.",
      allows: "A matching pass can still govern the fact.",
      boundaryKnowledge: "The steward and audit trail know the boundary.",
      bypassActors: "Unlinked reports may try to claim coverage.",
      causeOrMysteryBoundary: "Typed provenance is the accepted boundary.",
      enforcement: "The server checks the matching source.",
      residue: "Every governed row retains source and report identity.",
      costOrObservable: "Mismatches return a visible blocker."
    })).status).toBe(201);
    for (const analysisType of ["stacking", "gate", "tradeoff", "threshold", "sequential", "cancellation", "contradiction", "chain"]) {
      expect((await postJson(app, "/api/constraint-composition/composition", {
        flowId: constraintRun.flow.id,
        analysisType,
        body: `${analysisType} analysis keeps the source-linked constraint pass substantive.`
      })).status).toBe(201);
    }
    expect((await postJson(app, "/api/constraint-composition/leakage", {
      flowId: constraintRun.flow.id,
      bottleneck: "Typed source identity is the bottleneck.",
      loopholes: "Human-readable notes cannot bypass it.",
      partialWorkarounds: "Only a completed matching pass works.",
      falseBypasses: "A title match remains insufficient.",
      accidents: "A mismatched source exposes the blocker.",
      countermeasures: "The server preserves structured identity.",
      boundaryTesters: "Retries and unrelated facts test the boundary."
    })).status).toBe(201);
    expect((await postJson(app, "/api/constraint-composition/residue", {
      flowId: constraintRun.flow.id,
      ordinaryLife: "Stewards see source identity in the ledger.",
      institutionalEffects: "The workflow map preserves governed history.",
      economicEffects: "No economic mutation is introduced.",
      visibleTraces: "The covering report remains linked.",
      expertise: "The steward can read the provenance trail.",
      resentment: "Admission remains available as a choice.",
      crime: "Prose spoofing cannot claim coverage.",
      ritual: "Pass close is the evidence boundary.",
      markets: "No market state changes.",
      failureModes: "Incomplete or mismatched passes remain outstanding."
    })).status).toBe(201);
    const constraintClose = await postJson(app, `/api/constraint-composition/runs/${constraintRun.flow.id}/close`);
    expect(constraintClose.status).toBe(201);
    const constraintPass = await json<any>(constraintClose);

    const stage12Run = await json<any>(await postJson(app, "/api/institutional/runs/start", { sourceType: "fact", recordId: fact.id }));
    for (const lens of stage12Run.doctrine.lenses) {
      expect((await postJson(app, "/api/institutional/coverage", {
        flowId: stage12Run.flow.id,
        lensKey: lens.key,
        body: `${lens.label} has concrete institutional, economic, suppression, household, and provenance consequences.`
      })).status).toBe(201);
    }
    const stage12Close = await postJson(app, `/api/institutional/runs/${stage12Run.flow.id}/close`);
    expect(stage12Close.status).toBe(201);
    const stage12Pass = await json<any>(stage12Close);

    const read = await json<{ obligations: Array<any> }>(await app.request("/api/conditional-pass-obligations"));
    expect(read.obligations.find((item) => item.passKey === "constraint_composition")).toMatchObject({
      disposition: "covered",
      coveringEvidence: { id: constraintPass.report.id },
      history: expect.arrayContaining([expect.objectContaining({ action: "covered", flowStep: "constraint:complete" })])
    });
    expect(read.obligations.find((item) => item.passKey === "institutional_economic_suppression")).toMatchObject({
      disposition: "covered",
      coveringEvidence: { id: stage12Pass.report.id },
      history: expect.arrayContaining([expect.objectContaining({ action: "covered", flowStep: "stage12:complete" })])
    });
    expect(read.obligations.find((item) => item.passKey === "temporal_timeline")).toMatchObject({ disposition: "outstanding" });
    expect(read.obligations.map((item) => item.id)).toEqual(close.obligations.map((item: any) => item.id));
  });

  it("derives workflow-map arbitration and the ordered ledger from typed obligations instead of debt prose", async () => {
    const app = await createWorld("workflow-map-obligations.sqlite");
    await createRecord(app, {
      recordTypeKey: "world_kernel",
      title: "Conditional handoff kernel",
      body: "The workflow map governs typed post-Propagation duties."
    });
    await createRecord(app, {
      title: "Waiting Admission proposal",
      body: "One proposal remains directly navigable in Admission.",
      canonStatus: "proposed"
    });
    await createRecord(app, {
      title: "Existing accepted context",
      body: "A prior fact makes the foundational source the third canon-fact record."
    });
    const fact = await createRecord(app, {
      title: "FAC-3 source fact",
      body: "Typed obligations remain effective without trigger keywords."
    });
    const close = await closeFoundationalPropagation(app, fact.id);
    expect(close.debt).toBeNull();
    await postJson(app, "/api/canon-debt", {
      name: "Unrelated temporal timeline prose",
      scope: "creation residue",
      assignee: "steward",
      body: "This unrelated prose contains temporal and timeline but no typed conditional-pass obligation."
    });
    const recordsBefore = await json<{ records: Array<any> }>(await app.request("/api/records"));
    const linksBefore = await json<{ links: Array<any> }>(await app.request("/api/links"));

    const map = await json<any>(await app.request("/api/workflow-map"));
    expect(map.readOnly).toBe(true);
    expect(map.queues).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "admission", count: 1, destinationKey: "admission" }),
      expect.objectContaining({ key: "owed-propagation", count: 0 }),
      expect.objectContaining({ key: "conditional-passes", count: 3, destinationKey: "temporal" })
    ]));
    expect(map.stages).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "conditional-passes", state: "owed", destinationKey: "temporal" }),
      expect.objectContaining({ key: "admission", state: "active" })
    ]));
    expect(map.destinations).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "temporal", state: "owed" }),
      expect.objectContaining({ key: "constraint", state: "owed" }),
      expect.objectContaining({ key: "stage12", state: "owed" }),
      expect.objectContaining({ key: "admission", state: "active" })
    ]));
    expect(map.nextDecision).toMatchObject({
      destinationKey: "temporal",
      label: expect.stringMatching(/Temporal\/Timeline.*FAC-3.*PRP-1/i),
      reason: expect.stringMatching(/foundational.*specialized.*before further.*Admission/i),
      href: "/api/temporal/runs/start"
    });
    expect(map.conditionalPasses).toMatchObject({
      readOnly: true,
      outstandingCount: 3,
      governedCount: 0,
      doctrine: expect.stringMatching(/full-pass.*Admission remains available/i),
      nextOrResumeState: {
        current: "Temporal/Timeline",
        next: "Constraint Composition",
        resume: expect.stringMatching(/fresh workflow-map/i)
      }
    });
    expect(map.conditionalPasses.obligations.map((item: any) => [item.passKey, item.ordinal, item.sourceFact.id, item.propagationReport.id])).toEqual([
      ["temporal_timeline", 1, fact.id, close.report.id],
      ["constraint_composition", 2, fact.id, close.report.id],
      ["institutional_economic_suppression", 3, fact.id, close.report.id]
    ]);
    expect(await json(await app.request("/api/records"))).toEqual(recordsBefore);
    expect(await json(await app.request("/api/links"))).toEqual(linksBefore);

    for (const obligation of close.obligations) {
      expect((await postJson(app, `/api/conditional-pass-obligations/${obligation.id}/defer`, {
        rationale: `Govern ${obligation.passLabel} later while retaining its source-linked history.`
      })).status).toBe(201);
    }
    const governed = await json<any>(await app.request("/api/workflow-map"));
    expect(governed.conditionalPasses).toMatchObject({ outstandingCount: 0, governedCount: 3 });
    expect(governed.nextDecision).toMatchObject({ destinationKey: "admission", label: "Work Admission queue" });
    expect(governed.stages).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "conditional-passes", state: expect.not.stringMatching(/^owed$/) })
    ]));
    expect(governed.conditionalPasses.obligations.every((item: any) => item.disposition === "deferred")).toBe(true);
  });

  it("groups multiple source facts independently and never advances one handoff from another fact's disposition", async () => {
    const app = await createWorld("multiple-facts.sqlite");
    const firstFact = await createRecord(app, { title: "First foundational fact", body: "First source handoff." });
    const firstClose = await closeFoundationalPropagation(app, firstFact.id);
    const secondFact = await createRecord(app, { title: "Second foundational fact", body: "Second source handoff." });
    const secondClose = await closeFoundationalPropagation(app, secondFact.id);

    let map = await json<any>(await app.request("/api/workflow-map"));
    expect(map.conditionalPasses.obligations.map((item: any) => [item.sourceFact.id, item.propagationReport.id, item.ordinal])).toEqual([
      [firstFact.id, firstClose.report.id, 1],
      [firstFact.id, firstClose.report.id, 2],
      [firstFact.id, firstClose.report.id, 3],
      [secondFact.id, secondClose.report.id, 1],
      [secondFact.id, secondClose.report.id, 2],
      [secondFact.id, secondClose.report.id, 3]
    ]);

    for (const obligation of firstClose.obligations) {
      expect((await postJson(app, `/api/conditional-pass-obligations/${obligation.id}/defer`, {
        rationale: `Govern the first fact's ${obligation.passLabel} later without changing the second fact.`
      })).status).toBe(201);
    }
    map = await json<any>(await app.request("/api/workflow-map"));
    expect(map.conditionalPasses.nextOrResumeState.current).toBe("Temporal/Timeline");
    expect(map.nextDecision.label).toMatch(new RegExp(`${secondFact.shortId}.*${secondClose.report.shortId}`));
    expect(map.conditionalPasses.obligations.filter((item: any) => item.sourceFact.id === firstFact.id).every((item: any) => item.disposition === "deferred")).toBe(true);
    expect(map.conditionalPasses.obligations.filter((item: any) => item.sourceFact.id === secondFact.id).every((item: any) => item.disposition === "outstanding")).toBe(true);
  });
});
