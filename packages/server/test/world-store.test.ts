import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import Database from "better-sqlite3";
import { afterEach, describe, expect, it } from "vitest";
import { APPLICATION_ID, migration001 } from "../src/schema.js";
import { WorldStore } from "../src/world-store.js";

let tempDirs: string[] = [];

const tempPath = (name: string) => {
  const dir = mkdtempSync(join(tmpdir(), "worldloom-store-"));
  tempDirs.push(dir);
  return join(dir, name);
};

const explicitJudgment = {
  truthLayer: "Objective canon",
  canonStatus: "proposed"
};

afterEach(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs = [];
});

describe("WorldStore", () => {
  it("creates a world file with application id, schema version, and seeded catalogs", () => {
    const path = tempPath("world.sqlite");
    const store = WorldStore.create(path);

    expect(store.db.pragma("application_id", { simple: true })).toBe(APPLICATION_ID);
    expect(store.db.pragma("user_version", { simple: true })).toBe(3);
    expect(store.db.pragma("journal_mode", { simple: true })).toBe("wal");
    expect(store.db.prepare("SELECT COUNT(*) AS count FROM record_types").get()).toMatchObject({ count: 26 });
    expect(store.db.prepare("SELECT COUNT(*) AS count FROM link_types").get()).toMatchObject({ count: 24 });
    expect(store.db.prepare("SELECT COUNT(*) AS count FROM vocabulary_terms WHERE vocabulary = 'canon_status'").get()).toMatchObject({ count: 11 });
    expect(store.db.prepare("SELECT COUNT(*) AS count FROM vocabulary_terms WHERE vocabulary = 'consequence_disposition'").get()).toMatchObject({ count: 4 });
    expect(store.promptTemplates()).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "admission_prerequisite_audit" }),
      expect.objectContaining({ key: "admission_constraint_challenge" }),
      expect.objectContaining({ key: "propagation_consequence_scout" })
    ]));
    expect(store.db.prepare("SELECT strict FROM pragma_table_list WHERE name = 'records'").get()).toMatchObject({ strict: 1 });

    store.close();
  });

  it("re-seeds admission prompt templates when opening an existing v2 world", () => {
    const path = tempPath("existing-v2.sqlite");
    const store = WorldStore.create(path);
    store.db.prepare("DELETE FROM prompt_template_versions WHERE template_key LIKE 'admission_%'").run();
    store.db.prepare("DELETE FROM prompt_templates WHERE key LIKE 'admission_%'").run();
    store.close();

    const reopened = WorldStore.open(path);
    expect(reopened.promptTemplates()).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "admission_prerequisite_audit" }),
      expect.objectContaining({ key: "admission_constraint_challenge" })
    ]));
    reopened.close();
  });

  it("backs up an older world before migrating it and rejects corrupted files plainly", () => {
    const oldPath = tempPath("old.sqlite");
    const oldDb = new Database(oldPath);
    oldDb.pragma(`application_id = ${APPLICATION_ID}`);
    oldDb.exec("CREATE TABLE old_marker (value TEXT) STRICT;");
    oldDb.close();

    const migrated = WorldStore.open(oldPath);
    expect(migrated.db.pragma("user_version", { simple: true })).toBe(3);
    migrated.close();
    expect(readdirSync(join(oldPath, "..")).some((name) => name.includes("pre-migration-v0-to-v3"))).toBe(true);

    const corruptPath = tempPath("corrupt.sqlite");
    writeFileSync(corruptPath, "not sqlite");
    expect(() => WorldStore.open(corruptPath)).toThrow(/database|SQLite|file/i);
  });

  it("writes history for card-regime edits and rejects report-regime edits", () => {
    const path = tempPath("world.sqlite");
    const store = WorldStore.create(path);
    const card = store.createRecord({ recordTypeKey: "canon_fact", title: "Salt remembers", body: "First wording", ...explicitJudgment });
    store.updateRecord(card.id, { body: "Second wording" });

    expect(store.history(card.id)).toMatchObject([{ sequence: 1, retired_body: "First wording" }]);

    const report = store.createRecord({ recordTypeKey: "propagation_report", title: "Shock cone", body: "Audit wording", ...explicitJudgment });
    expect(() => store.updateRecord(report.id, { body: "Changed wording" })).toThrow(/append-only/);

    const secondConnection = new Database(path);
    secondConnection.pragma("foreign_keys = ON");
    expect(() => secondConnection.prepare("UPDATE records SET body = 'Changed' WHERE id = ?").run(report.id)).toThrow(/append-only/);
    expect(() => secondConnection.prepare("DELETE FROM records WHERE id = ?").run(report.id)).toThrow(/append-only/);
    expect(() => secondConnection.prepare("UPDATE records SET actor_id = 2 WHERE id = ?").run(card.id)).toThrow(/provenance/);
    secondConnection.close();
    store.close();
  });

  it("migrates v1 files to sectioned prose, preserves body content, and rejects newer schemas plainly", () => {
    const path = tempPath("v1.sqlite");
    const db = new Database(path);
    db.exec("BEGIN");
    db.exec(migration001);
    expect(db.prepare("SELECT COUNT(*) AS count FROM vocabulary_terms WHERE vocabulary = 'consequence_disposition'").get()).toMatchObject({ count: 0 });
    const recordId = Number(db.prepare(`
      INSERT INTO records (short_id, record_type_key, title, body, truth_layer, canon_status)
      VALUES ('FAC-99', 'canon_fact', 'Preserved fact', 'Body from v1', 'Objective canon', 'proposed')
    `).run().lastInsertRowid);
    db.exec("COMMIT");
    db.close();

    const migrated = WorldStore.open(path);
    expect(migrated.db.pragma("user_version", { simple: true })).toBe(3);
    expect(migrated.getRecord(recordId)).toMatchObject({ body: "Body from v1" });
    expect(migrated.db.prepare("SELECT COUNT(*) AS count FROM vocabulary_terms WHERE vocabulary = 'consequence_disposition'").get()).toMatchObject({ count: 4 });
    expect(migrated.sectionHeadings("world_kernel")).toEqual(expect.arrayContaining([
      expect.objectContaining({ heading: "World premise" })
    ]));
    migrated.close();
    expect(readdirSync(join(path, "..")).some((name) => name.includes("pre-migration-v1-to-v3"))).toBe(true);

    const newerPath = tempPath("newer.sqlite");
    const newer = new Database(newerPath);
    newer.pragma(`application_id = ${APPLICATION_ID}`);
    newer.pragma("user_version = 99");
    newer.close();
    expect(() => WorldStore.open(newerPath)).toThrow(/newer than this app/);
  });

  it("stores sectioned prose with card history, report immutability, and FTS coverage", () => {
    const store = WorldStore.create(tempPath("sections.sqlite"));
    const kernel = store.createRecord({ recordTypeKey: "world_kernel", title: "Kernel", body: "", ...explicitJudgment });
    store.replaceSections(kernel.id, [{ heading: "World premise", body: "The salt moon wakes", position: 1 }]);
    store.replaceSections(kernel.id, [{ heading: "World premise", body: "The silver moon wakes", position: 1 }]);
    store.replaceSections(kernel.id, [
      { heading: "Core promise", body: "Debts speak plainly", position: 1 },
      { heading: "World premise", body: "The silver moon wakes", position: 2 }
    ]);

    expect(store.sectionHistory(kernel.id)).toMatchObject([{ retired_body: "The salt moon wakes" }]);
    expect(store.listSections(kernel.id)).toMatchObject([
      { heading: "Core promise", position: 1 },
      { heading: "World premise", position: 2 }
    ]);
    expect(store.search("silver")).toMatchObject([{ id: kernel.id }]);

    const report = store.createRecord({ recordTypeKey: "seed_decomposition", title: "Decomposition", body: "Audit", ...explicitJudgment });
    store.replaceSections(report.id, [{ heading: "Kernel source", body: "Kernel KER-1", position: 1 }]);
    const secondConnection = new Database(store.path);
    secondConnection.pragma("foreign_keys = ON");
    expect(() => secondConnection.prepare("UPDATE record_sections SET body = 'Changed' WHERE record_id = ?").run(report.id)).toThrow(/append-only/);
    expect(() => secondConnection.prepare("DELETE FROM record_sections WHERE record_id = ?").run(report.id)).toThrow(/append-only/);
    secondConnection.close();
    store.close();
  });

  it("records facets, drafts, prompt rulings, advisory immutability, provenance, and decomposition", () => {
    const store = WorldStore.create(tempPath("flow.sqlite"));
    const fact = store.createRecord({ recordTypeKey: "canon_fact", title: "Echo law", body: "Echoes last seven days", ...explicitJudgment });
    expect(store.listFacets(fact.id)).toEqual([]);
    const first = store.addFacet(fact.id, { vocabulary: "admission_decision_operation", term: "accept" });
    const second = store.addFacet(fact.id, { vocabulary: "admission_decision_operation", term: "price" });
    expect(store.listFacets(fact.id)).toMatchObject([{ id: first.id, position: 1 }, { id: second.id, position: 2 }]);
    expect(() => store.addFacet(fact.id, { vocabulary: "missing", term: "accept" })).toThrow(/Unknown/);
    store.removeFacet(fact.id, first.id);
    expect(store.listFacets(fact.id)).toMatchObject([{ id: second.id, position: 2 }]);

    const draft = store.createDraft({ title: "Raw seed", body: "A bell remembers debts" });
    expect(store.listRecords().some((record) => record.title === "Raw seed")).toBe(false);
    const converted = store.convertDraft(draft.id, { recordTypeKey: "canon_fact", truthLayer: "Objective canon", canonStatus: "proposed" });
    expect(converted).toMatchObject({ title: "Raw seed", canonStatus: "proposed" });
    expect(store.listDrafts()).toEqual([]);

    const prompt = store.generatePrompt({ templateKey: "kernel_pressure", recordId: fact.id, stepKey: "kernel" }).prompt;
    expect(prompt).toContain("Record context");
    expect(prompt).toContain("Vocabulary guardrail");
    const advisory = store.createAdvisoryArtifact({ stepKey: "kernel", promptText: prompt, responseText: "Pressure response verbatim" });
    store.disposeAdvisoryArtifact(advisory.id, { disposition: "standing ruling", note: "Prefer concrete institutional pressure", standingRuling: true });
    expect(store.generatePrompt({ templateKey: "kernel_pressure", recordId: fact.id }).prompt).toContain("Prefer concrete institutional pressure");

    const authored = store.createRecordWithProvenance({ recordTypeKey: "canon_fact", title: "Authored with context", body: "Steward wording", ...explicitJudgment }, advisory.id);
    expect(store.listLinks(authored.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ fromRecordId: authored.id, toRecordId: advisory.id, linkTypeKey: "derived_from" }),
      expect.objectContaining({ fromRecordId: authored.id, toRecordId: advisory.id, linkTypeKey: "cites_advisory_artifact" })
    ]));
    expect(() => store.updateRecord(advisory.id, { body: "Changed" })).toThrow(/append-only/);

    const flow = store.startCreationFlow() as { id: number };
    const kernelStep = store.saveKernelStep({ flowId: flow.id, heading: "World premise", body: "A city built on echoes", consequenceMode: "weird" }) as { kernel: { id: number }; facets: unknown[] };
    expect(kernelStep.facets).toEqual([expect.objectContaining({ vocabulary: "consequence_mode", term: "weird" })]);
    const result = store.decomposeSeeds({
      flowId: flow.id,
      kernelRecordId: kernelStep.kernel.id,
      seeds: [{ title: "Echo bridges answer", body: "The bridges answer questions at dawn", truthLayer: "Objective canon", canonStatus: "proposed" }]
    }) as { report: { id: number }; records: Array<{ id: number; canonStatus: string }> };
    expect(result.records).toMatchObject([{ canonStatus: "proposed" }]);
    expect(store.admissionQueue()).toEqual(expect.arrayContaining([expect.objectContaining({ id: result.records[0]!.id, canonStatus: "proposed" })]));
    expect(store.listLinks(result.records[0]!.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ toRecordId: kernelStep.kernel.id, linkTypeKey: "derived_from" }),
      expect.objectContaining({ toRecordId: result.report.id, linkTypeKey: "derived_from" })
    ]));
    store.close();
  });

  it("routes draft and record proposals through admission queue intake without changing behavior", () => {
    const store = WorldStore.create(tempPath("admission-intake.sqlite"));
    const draft = store.createDraft({ title: "Market rumor", body: "Bell sellers form a guild." });
    const draftProposal = store.proposeDraftToAdmission(draft.id, { truthLayer: "Objective canon" });

    expect(draftProposal.record).toMatchObject({ recordTypeKey: "canon_fact", title: "Market rumor", canonStatus: "proposed" });
    expect(draftProposal.queue).toEqual(expect.arrayContaining([expect.objectContaining({ id: draftProposal.record.id })]));
    expect(store.listLinks(draftProposal.record.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ linkTypeKey: "derived_from", note: "Propose action provenance" })
    ]));
    expect(store.db.prepare("SELECT COUNT(*) AS count FROM jurisdiction_events WHERE record_id = ? AND origin = 'sweep'").get(draftProposal.record.id)).toMatchObject({ count: 1 });

    const existing = store.createRecord({ recordTypeKey: "canon_fact", title: "Existing queue fact", body: "Already proposed", ...explicitJudgment });
    const recordProposal = store.proposeRecordToAdmission(existing.id);

    expect(recordProposal.record).toMatchObject({ id: existing.id, truthLayer: "Objective canon", canonStatus: "proposed" });
    expect(recordProposal.queue).toEqual(expect.arrayContaining([expect.objectContaining({ id: existing.id })]));
    expect(store.listLinks(existing.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ linkTypeKey: "derived_from", note: "Propose action provenance" })
    ]));
    expect(store.db.prepare("SELECT COUNT(*) AS count FROM jurisdiction_events WHERE record_id = ? AND origin = 'sweep'").get(existing.id)).toMatchObject({ count: 1 });
    store.close();
  });

  it("enforces jurisdiction, promotion genealogy, link integrity, traversal, and FTS freshness", () => {
    const store = WorldStore.create(tempPath("world.sqlite"));
    const named = store.createRecord({ recordTypeKey: "canon_fact", title: "Moon bridge", body: "A quiet crossing", ...explicitJudgment });
    const bodyOnly = store.createRecord({ recordTypeKey: "canon_fact", title: "River law", body: "The moon bridge appears in testimony", ...explicitJudgment });
    const ledger = store.createRecord({ recordTypeKey: "admission_ledger_row", title: "Ledger row", body: "Promotion candidate", ...explicitJudgment });

    expect(() => store.createLink(named.id, 999, "depends_on")).toThrow(/FOREIGN KEY/);
    store.createLink(bodyOnly.id, named.id, "depends_on");
    store.createLink(ledger.id, bodyOnly.id, "depends_on");

    expect(store.search("moon")).toMatchObject([{ id: named.id }, { id: bodyOnly.id }]);
    store.updateRecord(named.id, { title: "Star bridge", body: "A bright crossing" });
    expect(store.search("moon")).toMatchObject([{ id: bodyOnly.id }]);
    expect(store.search("star")).toMatchObject([{ id: named.id }]);

    expect(store.traverse(ledger.id, "depends_on")).toMatchObject([
      { fromRecordId: ledger.id, toRecordId: bodyOnly.id, depth: 1 },
      { fromRecordId: bodyOnly.id, toRecordId: named.id, depth: 2 }
    ]);

    const promoted = store.promoteRecord(ledger.id, "canon_fact");
    expect(promoted.id).toBe(ledger.id);
    expect(promoted.recordTypeKey).toBe("canon_fact");
    expect(store.listLinks(ledger.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ fromRecordId: ledger.id, toRecordId: ledger.id, linkTypeKey: "tombstones" })
    ]));

    expect(() => store.db.prepare(`
      INSERT INTO jurisdiction_events (record_id, origin, repair_operation)
      VALUES (?, 'admission', 'retcon')
    `).run(named.id)).toThrow(/CHECK/);
    expect(() => store.db.prepare(`
      INSERT INTO jurisdiction_events (record_id, origin, admission_decision_operation)
      VALUES (?, 'repair', 'accept')
    `).run(named.id)).toThrow(/CHECK/);
    expect(store.db.prepare(`
      INSERT INTO jurisdiction_events (record_id, origin, admission_decision_operation)
      VALUES (?, 'admission', 'accept')
    `).run(named.id).changes).toBe(1);

    const ftsSql = store.db.prepare("SELECT sql FROM sqlite_schema WHERE name = 'records_fts'").get() as { sql: string };
    expect(ftsSql.sql).toContain("content='records'");
    store.close();
  });

  it("enforces admission invariants at the store and SQL seams", () => {
    const store = WorldStore.create(tempPath("admission.sqlite"));
    const fact = store.createRecord({ recordTypeKey: "canon_fact", title: "Flood writ", body: "A writ redirects floodwater", ...explicitJudgment });
    store.declareAdmissionSeverity(fact.id, { admissionLevel: "3", workScale: "major" });
    const flow = store.startAdmissionGate(fact.id) as { current_step: string };
    expect(flow.current_step).toContain(`record:${fact.id}:gate`);
    expect(() => store.completeAdmissionGate({
      recordId: fact.id,
      truthLayer: "Objective canon",
      canonStatus: "deprecated",
      operations: ["accept"],
      consequenceText: "Flood courts now need clerks."
    })).toThrow(/illegal canon status transition/);
    expect(() => store.completeAdmissionGate({
      recordId: fact.id,
      truthLayer: "Objective canon",
      canonStatus: "accepted",
      operations: ["accept"]
    })).toThrow(/written consequence/);

    const gate = store.completeAdmissionGate({
      recordId: fact.id,
      body: "A governed writ redirects floodwater",
      truthLayer: "Objective canon",
      canonStatus: "accepted",
      operations: ["accept", "institutionalize"],
      consequenceText: "Flood courts now need clerks.",
      quietDomainDeclarations: ["No household-level change."],
      notApplicableReasons: ["No branch implication."]
    });
    expect(gate.record).toMatchObject({ id: fact.id, canonStatus: "accepted" });
    expect(store.history(fact.id)).toEqual(expect.arrayContaining([expect.objectContaining({ retired_body: "A writ redirects floodwater" })]));
    expect(store.db.prepare("SELECT admission_decision_operation FROM jurisdiction_events WHERE record_id = ? AND origin = 'admission' ORDER BY id").all(fact.id)).toEqual([
      { admission_decision_operation: "accept" },
      { admission_decision_operation: "institutionalize" }
    ]);

    const secondConnection = new Database(store.path);
    secondConnection.pragma("foreign_keys = ON");
    expect(() => secondConnection.prepare("UPDATE records SET body = 'Changed' WHERE id = ?").run(gate.gateResult.id)).toThrow(/append-only/);
    expect(() => secondConnection.prepare(`
      INSERT INTO jurisdiction_events (record_id, origin, repair_operation)
      VALUES (?, 'admission', 'retcon')
    `).run(fact.id)).toThrow(/CHECK/);
    secondConnection.close();

    const ledger = store.admitMinorBatch({
      rows: [{
        title: "Minor flood custom",
        fact: "Clerks use blue wax.",
        scope: "flood court",
        truthLayer: "Objective canon",
        status: "accepted",
        operations: ["accept"],
        consequenceCheck: "Blue wax enters household errands."
      }]
    }).records[0]!;
    store.createLink(ledger.id, fact.id, "depends_on");
    const promoted = store.promoteRecord(ledger.id, "canon_fact");
    expect(promoted.id).toBe(ledger.id);
    expect(promoted.shortId).toBe(ledger.shortId);
    expect(store.listLinks(promoted.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ toRecordId: fact.id, linkTypeKey: "depends_on" }),
      expect.objectContaining({ fromRecordId: ledger.id, toRecordId: ledger.id, linkTypeKey: "tombstones" })
    ]));
    store.close();
  });

  it("works propagation runs with coverage, report digest, proposal routing, and SQL invariants", () => {
    const store = WorldStore.create(tempPath("propagation.sqlite"));
    const fact = store.createRecord({ recordTypeKey: "canon_fact", title: "Ghost tolls bind bridges", body: "Dead witnesses can charge crossings.", truthLayer: "Objective canon", canonStatus: "accepted" });
    store.declareAdmissionSeverity(fact.id, { admissionLevel: "4", workScale: "severe" });
    const debt = store.createCanonDebt({ name: `Propagation owed for ${fact.shortId}`, scope: "propagation", assignee: "steward", body: "Admission owed a shock cone." });

    expect(store.propagationQueue()).toEqual([expect.objectContaining({ id: debt.id, scope: "propagation" })]);
    const flow = store.startPropagationRun({ factRecordId: fact.id, debtRecordId: debt.id }) as { id: number; current_step: string };
    expect(flow.current_step).toBe("propagation:entry");
    expect(store.startPropagationRun({ factRecordId: fact.id, debtRecordId: debt.id })).toMatchObject({ id: flow.id });

    const direct = store.addPropagationConsequence({
      flowId: flow.id,
      orderKey: "first",
      domainName: "Economy, trade, and scarcity",
      body: "Bridge tolls become debt instruments priced by mortuary advocates.",
      pressure: "high"
    });
    store.recordPropagationDomain({ flowId: flow.id, domainName: "Economy, trade, and scarcity", triage: "direct", declaration: "Tolls and credit markets change." });
    store.recordPropagationDomain({ flowId: flow.id, domainName: "Aesthetics, tone, and narrative use", triage: "negative", declaration: "No comic shortcut; this stays funerary and costly." });

    expect(() => store.closePropagationRun(flow.id)).toThrow(/undispositioned high-pressure consequences: #/);
    const disposition = store.dispositionPropagationConsequence({
      consequenceId: direct.id,
      disposition: "assigned as canon debt",
      note: "Track counterfeiting and enforcement.",
      debtName: "Bridge toll counterfeiting pressure"
    });
    expect(disposition.debtRecordId).toEqual(expect.any(Number));

    const proposal = store.proposeFactFromPropagation({
      flowId: flow.id,
      title: "Mortuary toll scrip exists",
      body: "Debt paper backed by dead witnesses circulates near bridges.",
      truthLayer: "Objective canon"
    });
    expect(proposal.record).toMatchObject({ recordTypeKey: "canon_fact", canonStatus: "proposed" });
    expect(proposal.queue).toEqual(expect.arrayContaining([expect.objectContaining({ id: proposal.record.id })]));
    expect(store.db.prepare("SELECT COUNT(*) AS count FROM jurisdiction_events WHERE record_id = ? AND origin = 'sweep'").get(proposal.record.id)).toMatchObject({ count: 1 });

    const closed = store.closePropagationRun(flow.id);
    expect(closed.report).toMatchObject({ recordTypeKey: "propagation_report", canonStatus: "accepted" });
    expect(closed.debt).toMatchObject({ id: debt.id, canonStatus: "accepted" });
    expect(store.listLinks(fact.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ fromRecordId: fact.id, toRecordId: closed.report.id, linkTypeKey: "digest_of" })
    ]));
    expect(store.listLinks(proposal.record.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ fromRecordId: proposal.record.id, toRecordId: closed.report.id, linkTypeKey: "derived_from" })
    ]));
    expect(store.search("counterfeiting")).toEqual(expect.arrayContaining([expect.objectContaining({ id: closed.report.id })]));
    const correction = store.correctPropagationReport({ originalReportId: closed.report.id, body: "Corrected propagation report prose." });
    expect(correction).toMatchObject({ recordTypeKey: "propagation_report", canonStatus: "accepted" });
    expect(store.listLinks(correction.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ fromRecordId: correction.id, toRecordId: closed.report.id, linkTypeKey: "supersedes" })
    ]));

    const secondConnection = new Database(store.path);
    secondConnection.pragma("foreign_keys = ON");
    expect(() => secondConnection.prepare("UPDATE records SET body = 'Changed' WHERE id = ?").run(closed.report.id)).toThrow(/append-only/);
    expect(() => secondConnection.prepare("DELETE FROM records WHERE id = ?").run(closed.report.id)).toThrow(/append-only/);
    expect(() => secondConnection.prepare(`
      INSERT INTO jurisdiction_events (record_id, origin, admission_decision_operation)
      VALUES (?, 'sweep', 'accept')
    `).run(proposal.record.id)).toThrow(/CHECK/);
    secondConnection.close();
    store.close();
  });

  it("snapshots a live world to a chosen path as a valid complete world file", () => {
    const path = tempPath("world.sqlite");
    const snapshotPath = tempPath("snapshot.sqlite");
    const store = WorldStore.create(path);
    const record = store.createRecord({ recordTypeKey: "canon_fact", title: "Live backup", body: "Copy this", ...explicitJudgment });
    const written = store.snapshot(snapshotPath);
    store.updateRecord(record.id, { body: "Changed after snapshot" });
    expect(written).toBe(snapshotPath);
    expect(existsSync(snapshotPath)).toBe(true);

    const snapshot = WorldStore.open(snapshotPath);
    expect(snapshot.integrityCheck()).toBe("ok");
    expect(snapshot.getRecord(record.id)).toMatchObject({ title: "Live backup", body: "Copy this" });
    snapshot.close();
    store.close();
  });

  it("rejects files with the wrong application id", () => {
    const path = tempPath("wrong.sqlite");
    const db = new Database(path);
    db.pragma("application_id = 1234");
    db.pragma("user_version = 1");
    db.close();

    expect(() => WorldStore.open(path)).toThrow(/not a Worldloom/);
  });
});
