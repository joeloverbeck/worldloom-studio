import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import Database from "better-sqlite3";
import { afterEach, describe, expect, it } from "vitest";
import {
  APPLICATION_ID,
  CURRENT_SCHEMA_VERSION,
  migration001,
  migration002,
  migration003,
  migration004,
  migration005,
  migration006,
  migration007
} from "../src/schema.js";
import { WorldFile } from "../src/world-file.js";
import * as AdmissionFlow from "../src/admission-flow.js";
import * as ContradictionFlow from "../src/contradiction-flow.js";
import * as CreationFlow from "../src/creation-flow.js";
import * as PromptOut from "../src/prompt-out.js";
import * as PropagationFlow from "../src/propagation-flow.js";

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

describe("WorldFile", () => {
  it("keeps orchestration flow modules behind the WorldFile persistence seam", () => {
    const flowModules = [
      "admission-flow.ts",
      "creation-flow.ts",
      "propagation-flow.ts",
      "contradiction-flow.ts",
      "qa-flow.ts"
    ];

    for (const moduleName of flowModules) {
      const source = readFileSync(new URL(`../src/${moduleName}`, import.meta.url), "utf8");
      expect(source).not.toMatch(/store\.db|\.db\.prepare|\.db\.transaction/);
    }

    for (const moduleName of ["propagation-flow.ts", "contradiction-flow.ts"]) {
      const source = readFileSync(new URL(`../src/${moduleName}`, import.meta.url), "utf8");
      expect(source).toContain("intakeProposedFact");
      expect(source).not.toMatch(/createRecord\(\{\s*recordTypeKey:\s*"canon_fact"/);
    }

    const qaSource = readFileSync(new URL("../src/qa-flow.ts", import.meta.url), "utf8");
    expect(qaSource).toContain("intakeProposedFact");
    expect(qaSource).not.toMatch(/store\.db|\.db\.prepare|\.db\.transaction/);
    expect(qaSource).not.toMatch(/updateRecord\([^)]*canonStatus/);
  });

  it("keeps Prompt-out single-caller persistence out of the WorldFile public surface", () => {
    const worldFileSource = readFileSync(new URL("../src/world-file.ts", import.meta.url), "utf8");
    expect(worldFileSource).not.toMatch(/\bpromptTemplateRows\b/);
    expect(worldFileSource).not.toMatch(/\bpromptTemplateRow\b/);
    expect(worldFileSource).not.toMatch(/\bappendPromptTemplateVersion\b/);
    expect(worldFileSource).not.toMatch(/\bpromptRecordContext\b/);
    expect(worldFileSource).not.toMatch(/\bstandingRulingRows\b/);
    expect(worldFileSource).not.toMatch(/\binsertAdvisoryDisposition\b/);
    expect(worldFileSource).not.toMatch(/\bPromptTemplateRow\b/);
    expect(worldFileSource).not.toMatch(/\bAdvisoryDispositionRow\b/);

    const promptOutSource = readFileSync(new URL("../src/prompt-out.ts", import.meta.url), "utf8");
    const worldFileImport = promptOutSource.split("\n").find((line) => line.includes("./world-file.js")) ?? "";
    expect(promptOutSource).toMatch(/\bworld\.db\.prepare\b/);
    expect(promptOutSource).toMatch(/\bworld\.atomicWrite\b/);
    expect(worldFileImport).not.toContain("PromptTemplateRow");
    expect(worldFileImport).not.toContain("AdvisoryDispositionRow");
  });

  it("keeps Contradiction/Retcon/Mystery single-caller persistence out of the WorldFile public surface", () => {
    const worldFileSource = readFileSync(new URL("../src/world-file.ts", import.meta.url), "utf8");
    const storeSource = readFileSync(new URL("../src/contradiction-store.ts", import.meta.url), "utf8");
    const contradictionFlowSource = readFileSync(new URL("../src/contradiction-flow.ts", import.meta.url), "utf8");
    const worldFileMethodNames = [
      "findInProgressContradictionFlowBySource",
      "insertContradictionImplicatedRecord",
      "contradictionImplicatedRecordIds",
      "insertContradictionTitle",
      "contradictionWorkScale",
      "contradictionDisposition",
      "contradictionTriageEntries",
      "upsertContradictionTriageEntry",
      "upsertContradictionWorkScale",
      "upsertContradictionDisposition",
      "contradictionRepairOperations",
      "replaceContradictionRepairOperations",
      "contradictionRepairTargets",
      "insertContradictionRepairTarget",
      "insertContradictionRepairCreatedProposal",
      "contradictionRepairCreatedProposals",
      "assignContradictionReportToCreatedProposals",
      "contradictionRetconCosts",
      "replaceContradictionRetconCosts",
      "contradictionRepairPropagation",
      "upsertContradictionRepairPropagation",
      "completedMysteryChecklistForFlow",
      "owedBoundaryRows",
      "insertMysteryBoundaryLink",
      "insertMysteryPreservationChecklist",
      "mysteryPreservationChecklistsForFlow"
    ];

    for (const methodName of worldFileMethodNames) {
      expect(worldFileSource).not.toMatch(new RegExp(`\\b${methodName}\\b`));
      expect(contradictionFlowSource).toMatch(new RegExp(`\\bContradictionStore\\.${methodName}\\b`));
    }
    expect(storeSource).toMatch(/\bworld\.db\.prepare\b/);
    expect(storeSource).not.toMatch(/\bworld\.db\.transaction\b/);
    expect(contradictionFlowSource).not.toMatch(/\bworld\.db\.prepare\b|\.db\.transaction\b/);
  });

  it("creates a world file with application id, schema version, and seeded catalogs", () => {
    const path = tempPath("world.sqlite");
    const store = WorldFile.create(path);

    expect(store.db.pragma("application_id", { simple: true })).toBe(APPLICATION_ID);
    expect(store.db.pragma("user_version", { simple: true })).toBe(CURRENT_SCHEMA_VERSION);
    expect(store.db.pragma("journal_mode", { simple: true })).toBe("wal");
    expect(store.db.prepare("SELECT COUNT(*) AS count FROM record_types").get()).toMatchObject({ count: 27 });
    expect(store.db.prepare("SELECT COUNT(*) AS count FROM link_types").get()).toMatchObject({ count: 25 });
    expect(store.db.prepare("SELECT COUNT(*) AS count FROM vocabulary_terms WHERE vocabulary = 'canon_status'").get()).toMatchObject({ count: 11 });
    expect(store.db.prepare("SELECT COUNT(*) AS count FROM vocabulary_terms WHERE vocabulary = 'consequence_disposition'").get()).toMatchObject({ count: 4 });
    expect(store.db.prepare("SELECT COUNT(*) AS count FROM vocabulary_terms WHERE vocabulary = 'contradiction_disposition'").get()).toMatchObject({ count: 7 });
    expect(store.db.prepare("SELECT COUNT(*) AS count FROM vocabulary_terms WHERE vocabulary = 'advisory_disposition' AND term = 'adopted with steward revision'").get()).toMatchObject({ count: 1 });
    expect(store.db.prepare("SELECT COUNT(*) AS count FROM qa_test_catalog").get()).toMatchObject({ count: 28 });
    expect(store.db.prepare("SELECT mutation_regime FROM record_types WHERE key = 'qa_pass'").get()).toMatchObject({ mutation_regime: "report" });
    expect(store.db.prepare("SELECT label FROM link_types WHERE key = 'assesses'").get()).toMatchObject({ label: "assesses" });
    expect(store.db.prepare("SELECT heading FROM record_section_headings WHERE record_type_key = 'pass_report' AND position = 2").get()).toMatchObject({ heading: "Coverage lenses" });
    expect(store.db.prepare("SELECT strict FROM pragma_table_list WHERE name = 'stage12_coverage'").get()).toMatchObject({ strict: 1 });
    expect(PromptOut.listPromptTemplates(store)).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "admission_queue_severity" }),
      expect.objectContaining({ key: "admission_prerequisite_audit" }),
      expect.objectContaining({ key: "admission_constraint_challenge" }),
      expect.objectContaining({ key: "propagation_consequence_scout" }),
      expect.objectContaining({ key: "qa_red_team" }),
      expect.objectContaining({ key: "institution_economy_analyst" })
    ]));
    expect(store.db.prepare("SELECT strict FROM pragma_table_list WHERE name = 'records'").get()).toMatchObject({ strict: 1 });

    store.close();
  });

  it("re-seeds admission prompt templates when opening an existing v2 world", () => {
    const path = tempPath("existing-v2.sqlite");
    const store = WorldFile.create(path);
    store.db.prepare("DELETE FROM prompt_template_versions WHERE template_key LIKE 'admission_%'").run();
    store.db.prepare("DELETE FROM prompt_templates WHERE key LIKE 'admission_%'").run();
    store.close();

    const reopened = WorldFile.open(path);
    expect(PromptOut.listPromptTemplates(reopened)).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "admission_queue_severity" }),
      expect.objectContaining({ key: "admission_prerequisite_audit" }),
      expect.objectContaining({ key: "admission_constraint_challenge" })
    ]));
    reopened.close();
  });

  it("re-seeds creation prompt templates and generates creation prompt-out when opening an existing world", () => {
    const path = tempPath("existing-creation-prompts.sqlite");
    const store = WorldFile.create(path);
    const kernel = store.createRecord({
      recordTypeKey: "world_kernel",
      title: "Echo city kernel",
      body: "A city built on echoes.",
      ...explicitJudgment
    });
    store.replaceSections(kernel.id, [
      { heading: "World premise", body: "A city built on echoes.", position: 1 }
    ]);
    const decomposition = store.createRecord({
      recordTypeKey: "seed_decomposition",
      title: "Echo seed split",
      body: "Echo laws split into testimony, cost, and enforcement seeds.",
      ...explicitJudgment
    });
    store.replaceSections(decomposition.id, [
      { heading: "Kernel source", body: "KER-1 World kernel", position: 1 },
      { heading: "Drafts consumed", body: "(empty)", position: 2 },
      { heading: "Granularity decisions", body: "Each seed can be rejected independently.", position: 3 },
      { heading: "Parked seeds", body: "FAC-1 Echo court testimony", position: 4 },
      { heading: "Thin-start boundary", body: "No seed is admitted by Creation.\nAdmission intent: audit in Admission.", position: 5 }
    ]);
    const seed = store.createRecord({
      recordTypeKey: "canon_fact",
      title: "Echo court testimony",
      body: "Courts accept echo testimony under conditions.",
      ...explicitJudgment
    });
    store.createLink(seed.id, kernel.id, "derived_from", "Seed decomposed from world kernel");
    store.createLink(seed.id, decomposition.id, "derived_from", "Seed recorded by decomposition report");
    store.db.prepare("DELETE FROM prompt_template_versions WHERE template_key IN ('kernel_pressure', 'decomposition_pressure')").run();
    store.db.prepare("DELETE FROM prompt_templates WHERE key IN ('kernel_pressure', 'decomposition_pressure')").run();
    store.close();

    const reopened = WorldFile.open(path);

    expect(reopened.schemaVersion()).toBe(CURRENT_SCHEMA_VERSION);
    expect(PromptOut.listPromptTemplates(reopened)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        key: "kernel_pressure",
        role_name: "Consequence scout",
        package_source: "docs/worldbuilding-system/20_ai_assisted_workflow.md",
        current_text: expect.stringContaining("steward-authored kernel")
      }),
      expect.objectContaining({
        key: "decomposition_pressure",
        role_name: "Prerequisite auditor",
        package_source: "docs/worldbuilding-system/20_ai_assisted_workflow.md",
        current_text: expect.stringContaining("hidden prerequisites")
      })
    ]));

    const kernelPrompt = PromptOut.generatePrompt(reopened, {
      flowKey: "creation",
      templateKey: "kernel_pressure",
      recordId: kernel.id,
      stepKey: "creation:kernel"
    });
    expect(kernelPrompt.promptOut).toMatchObject({
      flowKey: "creation",
      stepKey: "creation:kernel",
      templateKey: "kernel_pressure",
      recordId: kernel.id
    });
    expect(kernelPrompt.prompt).toContain("Consequence scout");
    expect(kernelPrompt.prompt).toContain("Role stance (not an accuracy claim): Consequence scout");
    expect(kernelPrompt.prompt).toContain("Prohibition: do not write final canon");
    expect(kernelPrompt.prompt).toContain("Vocabulary guardrail");
    expect(kernelPrompt.prompt).toContain("A city built on echoes.");

    const decompositionPrompt = PromptOut.generatePrompt(reopened, {
      flowKey: "creation",
      templateKey: "decomposition_pressure",
      recordId: decomposition.id,
      stepKey: "creation:decomposition"
    });
    expect(decompositionPrompt.promptOut).toMatchObject({
      flowKey: "creation",
      stepKey: "creation:decomposition",
      templateKey: "decomposition_pressure",
      recordId: decomposition.id
    });
    expect(decompositionPrompt.prompt).toContain("Prerequisite auditor");
    expect(decompositionPrompt.prompt).toContain("Vocabulary guardrail");
    expect(decompositionPrompt.prompt).toContain("Echo laws split into testimony, cost, and enforcement seeds.");
    expect(decompositionPrompt.prompt).toContain("FAC-1");
    expect(decompositionPrompt.prompt).toContain("Courts accept echo testimony under conditions.");
    expect(decompositionPrompt.prompt).toContain("Admission intent: audit in Admission.");

    reopened.close();
  });

  it("advances unchanged Prompt-out defaults while preserving steward-edited template versions", () => {
    const path = tempPath("prompt-template-upgrade.sqlite");
    const store = WorldFile.create(path);
    const oldKernelDefault = "Pressure-test this steward-authored kernel as a pressure seed. Work from the kernel first, then surface direct consequences, speculative assumptions, ordinary-life residue, institutions, constraints, and quiet domains that the world may need to answer. Do not write first-draft or final canon; label surfaced facts as proposed-only.";
    const oldQaDefault = "Run a QA red-team pass as a hostile reader. Ask for pressure, not answers. Do not write final canon.\nUse the eight red-team questions from docs/worldbuilding-system/18_quality_assurance_tests.md.";
    const stewardEdit = "Custom steward QA red-team wording.";
    store.db.prepare("UPDATE prompt_templates SET original_text = ?, current_version = 1 WHERE key = 'kernel_pressure'").run(oldKernelDefault);
    store.db.prepare("UPDATE prompt_template_versions SET text = ? WHERE template_key = 'kernel_pressure' AND version = 1").run(oldKernelDefault);
    store.db.prepare("UPDATE prompt_templates SET original_text = ?, current_version = 1 WHERE key = 'qa_red_team'").run(oldQaDefault);
    store.db.prepare("UPDATE prompt_template_versions SET text = ? WHERE template_key = 'qa_red_team' AND version = 1").run(oldQaDefault);
    PromptOut.updatePromptTemplate(store, "qa_red_team", stewardEdit);
    store.close();

    const reopened = WorldFile.open(path);
    const templates = PromptOut.listPromptTemplates(reopened);
    const kernelTemplate = templates.find((template) => template.key === "kernel_pressure");
    const qaTemplate = templates.find((template) => template.key === "qa_red_team");

    expect(templates).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "minimal_viable_world_checkpoint", current_text: expect.stringContaining("sandwich packet") }),
      expect.objectContaining({ key: "constraint_challenger", current_text: expect.stringContaining("sandwich packet") }),
      expect.objectContaining({ key: "temporal_spatial_analyst", current_text: expect.stringContaining("sandwich packet") })
    ]));
    expect(kernelTemplate).toMatchObject({
      current_text: expect.stringContaining("sandwich packet"),
      original_text: expect.stringContaining("sandwich packet")
    });
    expect(kernelTemplate?.current_version).toBeGreaterThan(1);
    expect(reopened.db.prepare("SELECT text FROM prompt_template_versions WHERE template_key = 'kernel_pressure' ORDER BY version").all())
      .toEqual(expect.arrayContaining([expect.objectContaining({ text: oldKernelDefault })]));
    expect(qaTemplate).toMatchObject({
      current_text: stewardEdit,
      original_text: expect.stringContaining("sandwich packet")
    });
    expect(PromptOut.revertPromptTemplate(reopened, "qa_red_team")).toMatchObject({
      current_text: expect.stringContaining("sandwich packet")
    });
    expect(reopened.db.prepare("SELECT text FROM prompt_template_versions WHERE template_key = 'qa_red_team' ORDER BY version").all())
      .toEqual(expect.arrayContaining([
        expect.objectContaining({ text: oldQaDefault }),
        expect.objectContaining({ text: stewardEdit })
      ]));

    reopened.close();
  });

  it("backs up an older world before migrating it and rejects corrupted files plainly", () => {
    const oldPath = tempPath("old.sqlite");
    const oldDb = new Database(oldPath);
    oldDb.pragma(`application_id = ${APPLICATION_ID}`);
    oldDb.exec("CREATE TABLE old_marker (value TEXT) STRICT;");
    oldDb.close();

    const migrated = WorldFile.open(oldPath);
    expect(migrated.db.pragma("user_version", { simple: true })).toBe(CURRENT_SCHEMA_VERSION);
    migrated.close();
    expect(readdirSync(join(oldPath, "..")).some((name) => name.includes(`pre-migration-v0-to-v${CURRENT_SCHEMA_VERSION}`))).toBe(true);

    const corruptPath = tempPath("corrupt.sqlite");
    writeFileSync(corruptPath, "not sqlite");
    expect(() => WorldFile.open(corruptPath)).toThrow(/database|SQLite|file/i);
  });

  it("writes history for card-regime edits and rejects report-regime edits", () => {
    const path = tempPath("world.sqlite");
    const store = WorldFile.create(path);
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

    const migrated = WorldFile.open(path);
    expect(migrated.db.pragma("user_version", { simple: true })).toBe(CURRENT_SCHEMA_VERSION);
    expect(migrated.getRecord(recordId)).toMatchObject({ body: "Body from v1" });
    expect(migrated.db.prepare("SELECT COUNT(*) AS count FROM vocabulary_terms WHERE vocabulary = 'consequence_disposition'").get()).toMatchObject({ count: 4 });
    expect(migrated.sectionHeadings("world_kernel")).toEqual(expect.arrayContaining([
      expect.objectContaining({ heading: "World premise" })
    ]));
    migrated.close();
    expect(readdirSync(join(path, "..")).some((name) => name.includes(`pre-migration-v1-to-v${CURRENT_SCHEMA_VERSION}`))).toBe(true);

    const newerPath = tempPath("newer.sqlite");
    const newer = new Database(newerPath);
    newer.pragma(`application_id = ${APPLICATION_ID}`);
    newer.pragma("user_version = 99");
    newer.close();
    expect(() => WorldFile.open(newerPath)).toThrow(/newer than this app/);
  });

  it("migrates v3 files to the contradiction vocabulary seed delta with backup", () => {
    const path = tempPath("v3.sqlite");
    const db = new Database(path);
    db.exec("BEGIN");
    db.exec(migration001);
    db.exec(migration002);
    db.exec(migration003);
    db.exec("COMMIT");
    expect(db.pragma("user_version", { simple: true })).toBe(3);
    db.close();

    const migrated = WorldFile.open(path);
    expect(migrated.db.pragma("user_version", { simple: true })).toBe(CURRENT_SCHEMA_VERSION);
    expect(readdirSync(join(path, "..")).some((name) => name.includes(`pre-migration-v3-to-v${CURRENT_SCHEMA_VERSION}`))).toBe(true);

    const repairTerms = (migrated.db.prepare("SELECT term FROM vocabulary_terms WHERE vocabulary = 'repair_operation'").all() as Array<{ term: string }>)
      .map((row) => row.term)
      .sort();
    expect(repairTerms).toEqual([
      "add constraint",
      "clarify scope",
      "diffuse unevenly",
      "historicize",
      "institutionalize",
      "localize",
      "price the fact",
      "quarantine",
      "reject",
      "reinterpret",
      "retcon",
      "split"
    ].sort());
    expect(migrated.db.prepare("SELECT COUNT(*) AS count FROM vocabulary_terms WHERE vocabulary = 'repair_operation' AND term IN ('branch', 'supersede', 'deprecate')").get()).toMatchObject({ count: 0 });
    expect(migrated.db.prepare("SELECT COUNT(*) AS count FROM vocabulary_terms WHERE vocabulary = 'contradiction_disposition'").get()).toMatchObject({ count: 7 });
    expect(migrated.db.prepare("SELECT COUNT(*) AS count FROM vocabulary_terms WHERE vocabulary = 'preservation_operation'").get()).toMatchObject({ count: 7 });
    expect(migrated.db.prepare("SELECT COUNT(*) AS count FROM vocabulary_terms WHERE vocabulary = 'retcon_type'").get()).toMatchObject({ count: 6 });
    expect(migrated.db.prepare("SELECT COUNT(*) AS count FROM vocabulary_terms WHERE vocabulary = 'protected_effect_type'").get()).toMatchObject({ count: 6 });
    expect(migrated.db.prepare("SELECT * FROM seed_divergences WHERE key = 'contradiction_report_foundational_work_scale'").get()).toMatchObject({
      package_source: "docs/worldbuilding-system/templates/contradiction_report.md"
    });
    migrated.close();
  });

  it("migrates v4 files to the QA schema with backup, score constraints, and catalog seeds", () => {
    const path = tempPath("v4.sqlite");
    const db = new Database(path);
    db.exec("BEGIN");
    db.exec(migration001);
    db.exec(migration002);
    db.exec(migration003);
    db.exec(migration004);
    db.exec("COMMIT");
    expect(db.pragma("user_version", { simple: true })).toBe(4);
    db.close();

    const migrated = WorldFile.open(path);
    expect(migrated.db.pragma("user_version", { simple: true })).toBe(CURRENT_SCHEMA_VERSION);
    expect(readdirSync(join(path, "..")).some((name) => name.includes(`pre-migration-v4-to-v${CURRENT_SCHEMA_VERSION}`))).toBe(true);
    expect(migrated.db.prepare("SELECT COUNT(*) AS count FROM qa_test_catalog").get()).toMatchObject({ count: 28 });
    expect(migrated.db.prepare("SELECT COUNT(*) AS count FROM qa_test_catalog WHERE number IN ('P1', 'P2')").get()).toMatchObject({ count: 0 });

    const subject = migrated.createRecord({ recordTypeKey: "canon_fact", title: "Moon oath", body: "The moon eats oaths.", truthLayer: "Objective canon", canonStatus: "accepted" });
    const pass = migrated.createRecord({ recordTypeKey: "qa_pass", title: "QA pass: Moon oath", body: "Subject: record", truthLayer: "Objective canon", canonStatus: "accepted" });
    const flow = migrated.createFlowInstance({ flowKey: "qa", currentStep: "qa:entry", qaSubjectRecordId: subject.id, qaPassRecordId: pass.id }) as { id: number };
    expect(() => migrated.updateRecord(pass.id, { body: "edited" })).toThrow(/append-only/);
    expect(() => migrated.createLink(pass.id, subject.id, "assesses")).not.toThrow();
    expect(() => migrated.createLink(pass.id, 9999, "assesses")).toThrow(/FOREIGN KEY/);

    expect(() => migrated.db.prepare(`
      INSERT INTO qa_test_scores (flow_id, qa_pass_record_id, test_number, score, na_reason, notes, required_repair, flow_step)
      VALUES (?, ?, 1, '4', '', '', '', 'qa:scorecard')
    `).run(flow.id, pass.id)).toThrow(/CHECK/);
    expect(() => migrated.db.prepare(`
      INSERT INTO qa_test_scores (flow_id, qa_pass_record_id, test_number, score, na_reason, notes, required_repair, flow_step)
      VALUES (?, ?, 1, 'na', '', '', '', 'qa:scorecard')
    `).run(flow.id, pass.id)).toThrow(/n\/a reason/);
    migrated.db.prepare(`
      INSERT INTO qa_test_scores (flow_id, qa_pass_record_id, test_number, score, na_reason, notes, required_repair, flow_step)
      VALUES (?, ?, 1, 'na', 'No capability applies.', 'Single-record pass.', '', 'qa:scorecard')
    `).run(flow.id, pass.id);
    migrated.db.prepare(`
      INSERT INTO qa_test_scores (flow_id, qa_pass_record_id, test_number, score, na_reason, notes, required_repair, flow_step)
      VALUES (?, ?, 2, '0', '', 'Prerequisites absent.', 'Name the prior condition.', 'qa:scorecard')
    `).run(flow.id, pass.id);
    expect(migrated.db.prepare("SELECT COUNT(*) AS count FROM qa_test_scores WHERE qa_pass_record_id = ?").get(pass.id)).toMatchObject({ count: 2 });

    migrated.close();
  });

  it("migrates v7 files to the proposal-mode advisory vocabulary with backup", () => {
    const path = tempPath("v7.sqlite");
    const db = new Database(path);
    db.exec("BEGIN");
    db.exec(migration001);
    db.exec(migration002);
    db.exec(migration003);
    db.exec(migration004);
    db.exec(migration005);
    db.exec(migration006);
    db.exec(migration007);
    db.exec("COMMIT");
    expect(db.pragma("user_version", { simple: true })).toBe(7);
    expect(db.prepare("SELECT COUNT(*) AS count FROM vocabulary_terms WHERE vocabulary = 'advisory_disposition' AND term = 'adopted with steward revision'").get()).toMatchObject({ count: 0 });
    db.close();

    const migrated = WorldFile.open(path);

    expect(migrated.db.pragma("user_version", { simple: true })).toBe(CURRENT_SCHEMA_VERSION);
    expect(readdirSync(join(path, "..")).some((name) => name.includes(`pre-migration-v7-to-v${CURRENT_SCHEMA_VERSION}`))).toBe(true);
    expect(migrated.db.prepare("SELECT COUNT(*) AS count FROM vocabulary_terms WHERE vocabulary = 'advisory_disposition' AND term = 'adopted with steward revision'").get()).toMatchObject({ count: 1 });
    migrated.close();
  });

  it("stores sectioned prose with card history, report immutability, and FTS coverage", () => {
    const store = WorldFile.create(tempPath("sections.sqlite"));
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
    const store = WorldFile.create(tempPath("flow.sqlite"));
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

    const prompt = PromptOut.generatePrompt(store, { templateKey: "kernel_pressure", recordId: fact.id, stepKey: "kernel" }).prompt;
    expect(prompt).toContain("Record context");
    expect(prompt).toContain("Vocabulary guardrail");
    const advisory = PromptOut.storeAdvisoryResponse(store, { stepKey: "kernel", promptText: prompt, responseText: "Pressure response verbatim" });
    PromptOut.disposeAdvisoryArtifact(store, advisory.id, { disposition: "standing ruling", note: "Prefer concrete institutional pressure", standingRuling: true });
    expect(PromptOut.generatePrompt(store, { templateKey: "kernel_pressure", recordId: fact.id }).prompt).toContain("Prefer concrete institutional pressure");

    const authored = PromptOut.createRecordWithExplicitAdvisoryUse(store, { recordTypeKey: "canon_fact", title: "Authored with context", body: "Steward wording", ...explicitJudgment }, advisory.id);
    expect(store.listLinks(authored.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ fromRecordId: authored.id, toRecordId: advisory.id, linkTypeKey: "derived_from" }),
      expect.objectContaining({ fromRecordId: authored.id, toRecordId: advisory.id, linkTypeKey: "cites_advisory_artifact" })
    ]));
    expect(() => store.updateRecord(advisory.id, { body: "Changed" })).toThrow(/append-only/);

    const flow = CreationFlow.startCreationFlow(store) as { id: number };
    const kernelStep = CreationFlow.saveKernelStep(store, { flowId: flow.id, heading: "World premise", body: "A city built on echoes", consequenceMode: "weird" }) as { kernel: { id: number }; facets: unknown[] };
    expect(kernelStep.facets).toEqual([expect.objectContaining({ vocabulary: "consequence_mode", term: "weird" })]);
    const result = CreationFlow.decomposeSeeds(store, {
      flowId: flow.id,
      kernelRecordId: kernelStep.kernel.id,
      granularityRationale: "The bridge seed can be rejected independently.",
      seeds: [{ title: "Echo bridges answer", body: "The bridges answer questions at dawn", truthLayer: "Objective canon", granularityConfirmed: true }]
    }) as { report: { id: number }; records: Array<{ id: number; canonStatus: string }> };
    expect(result.records).toMatchObject([{ canonStatus: "proposed" }]);
    expect(AdmissionFlow.admissionQueue(store)).toEqual(expect.arrayContaining([expect.objectContaining({ id: result.records[0]!.id, canonStatus: "proposed" })]));
    expect(store.listLinks(result.records[0]!.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ toRecordId: kernelStep.kernel.id, linkTypeKey: "derived_from" }),
      expect.objectContaining({ toRecordId: result.report.id, linkTypeKey: "derived_from" })
    ]));
    store.close();
  });

  it("routes draft and record proposals through admission queue intake without changing behavior", () => {
    const store = WorldFile.create(tempPath("admission-intake.sqlite"));
    const draft = store.createDraft({ title: "Market rumor", body: "Bell sellers form a guild." });
    const draftProposal = AdmissionFlow.proposeDraftToAdmission(store, draft.id, { truthLayer: "Objective canon" });

    expect(draftProposal.record).toMatchObject({ recordTypeKey: "canon_fact", title: "Market rumor", canonStatus: "proposed" });
    expect(draftProposal.queue).toEqual(expect.arrayContaining([expect.objectContaining({ id: draftProposal.record.id })]));
    expect(store.listLinks(draftProposal.record.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ linkTypeKey: "derived_from", note: "Propose action provenance" })
    ]));
    expect(store.db.prepare("SELECT COUNT(*) AS count FROM jurisdiction_events WHERE record_id = ? AND origin = 'sweep'").get(draftProposal.record.id)).toMatchObject({ count: 1 });

    const existing = store.createRecord({ recordTypeKey: "canon_fact", title: "Existing queue fact", body: "Already proposed", ...explicitJudgment });
    const recordProposal = AdmissionFlow.proposeRecordToAdmission(store, existing.id);

    expect(recordProposal.record).toMatchObject({ id: existing.id, truthLayer: "Objective canon", canonStatus: "proposed" });
    expect(recordProposal.queue).toEqual(expect.arrayContaining([expect.objectContaining({ id: existing.id })]));
    expect(store.listLinks(existing.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ linkTypeKey: "derived_from", note: "Propose action provenance" })
    ]));
    expect(store.db.prepare("SELECT COUNT(*) AS count FROM jurisdiction_events WHERE record_id = ? AND origin = 'sweep'").get(existing.id)).toMatchObject({ count: 1 });

    const flowProposal = AdmissionFlow.intakeProposedFact(store, {
      origin: "future-flow",
      candidate: {
        title: "QA surfaced fact",
        body: "A later QA flow can surface this without minting records itself.",
        truthLayer: "Objective canon",
        canonStatus: "proposed"
      },
      sourceLinks: [{ recordId: existing.id, note: "Future flow source context" }],
      recordSweepJurisdiction: true,
      provenanceFlowStep: "future-flow:surface-proposal"
    });

    expect(flowProposal.record).toMatchObject({ recordTypeKey: "canon_fact", title: "QA surfaced fact", canonStatus: "proposed" });
    expect(flowProposal.queue).toEqual(expect.arrayContaining([expect.objectContaining({ id: flowProposal.record.id })]));
    expect(store.listLinks(flowProposal.record.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ toRecordId: existing.id, linkTypeKey: "derived_from", note: "Future flow source context" }),
      expect.objectContaining({ linkTypeKey: "derived_from", note: "Propose action provenance" })
    ]));
    expect(store.db.prepare("SELECT COUNT(*) AS count FROM jurisdiction_events WHERE record_id = ? AND origin = 'sweep'").get(flowProposal.record.id)).toMatchObject({ count: 1 });
    store.close();
  });

  it("enforces jurisdiction, promotion genealogy, link integrity, traversal, and FTS freshness", () => {
    const store = WorldFile.create(tempPath("world.sqlite"));
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
    const store = WorldFile.create(tempPath("admission.sqlite"));
    const fact = store.createRecord({ recordTypeKey: "canon_fact", title: "Flood writ", body: "A writ redirects floodwater", ...explicitJudgment });
    AdmissionFlow.declareAdmissionSeverity(store, fact.id, { admissionLevel: "3", workScale: "major" });
    const flow = AdmissionFlow.startAdmissionGate(store, fact.id) as { current_step: string };
    expect(flow.current_step).toContain(`record:${fact.id}:gate`);
    const decisionPoint = AdmissionFlow.admissionDecisionPoint(store, fact.id);
    expect(decisionPoint).toMatchObject({
      currentStep: `record:${fact.id}:gate`,
      localDecision: "Complete the full canon fact gate with written substance.",
      severity: { admissionLevel: "3", workScale: "major", gatePath: "full_gate" },
      fullGateContract: {
        sections: expect.arrayContaining([
          expect.objectContaining({ key: "fact_statement", required: true }),
          expect.objectContaining({ key: "dependencies", canMarkNotApplicable: true }),
          expect.objectContaining({ key: "institutions_or_quiet_domain_declaration", quietDomain: true })
        ]),
        allowedNextCanonStatuses: expect.arrayContaining(["accepted", "accepted with constraints", "rejected"]),
        operationOptions: expect.arrayContaining(["accept", "institutionalize"]),
        completionAction: { method: "POST", href: "/api/admission/gate/complete" }
      },
      blockers: expect.arrayContaining([
        expect.objectContaining({ key: "written_consequence", requires: "written consequence text" })
      ]),
      promptOut: {
        advisory: "optional",
        preview: {
          currentDecision: "Complete the full canon fact gate with written substance.",
          sourceManifest: expect.arrayContaining([expect.stringContaining("Record")]),
          advisoryCanonWarning: expect.stringContaining("advisory")
        }
      },
      writeIntent: {
        willWrite: expect.arrayContaining(["gate_result report"]),
        willRouteOnward: expect.arrayContaining(["Read-side views remain read-only and do not gain Admission mutation controls"])
      },
      readSideTrail: expect.arrayContaining([expect.objectContaining({ label: "Audit Trail" })])
    });
    expect(() => AdmissionFlow.completeAdmissionGate(store, {
      recordId: fact.id,
      truthLayer: "Objective canon",
      canonStatus: "deprecated",
      operations: ["accept"],
      consequenceText: "Flood courts now need clerks."
    })).toThrow(/illegal canon status transition/);
    expect(() => AdmissionFlow.completeAdmissionGate(store, {
      recordId: fact.id,
      truthLayer: "Objective canon",
      canonStatus: "accepted",
      operations: ["accept"]
    })).toThrow(/written consequence/);
    expect(() => AdmissionFlow.completeAdmissionGate(store, {
      recordId: fact.id,
      truthLayer: "Objective canon",
      canonStatus: "accepted",
      operations: ["accept"],
      consequenceText: "Flood courts now need clerks.",
      sections: [{ key: "fact_statement", substance: "A governed writ redirects floodwater." }]
    })).toThrow(/Submitted full-gate section keys/);
    expect(() => AdmissionFlow.completeAdmissionGate(store, {
      recordId: fact.id,
      truthLayer: "Objective canon",
      canonStatus: "accepted",
      operations: ["accept"],
      consequenceText: "Flood courts now need clerks.",
      sections: decisionPoint.fullGateContract!.sections.map((section) => ({
        key: section.key,
        substance: section.key === "dependencies" ? "" : `${section.label} substance for flood writ admission.`,
        quietDomainDeclaration: section.quietDomain ? "No quiet-domain omission; flood courts are in scope." : ""
      }))
    })).toThrow(/Dependencies/);

    const gate = AdmissionFlow.completeAdmissionGate(store, {
      recordId: fact.id,
      body: "A governed writ redirects floodwater",
      truthLayer: "Objective canon",
      canonStatus: "accepted",
      operations: ["accept", "institutionalize"],
      consequenceText: "Flood courts now need clerks.",
      sections: decisionPoint.fullGateContract!.sections.map((section) => ({
        key: section.key,
        substance: `${section.label} substance for flood writ admission.`,
        quietDomainDeclaration: section.quietDomain ? "No quiet-domain omission; flood courts are in scope." : ""
      })),
      quietDomainDeclarations: ["No household-level change."],
      notApplicableReasons: ["No branch implication."]
    });
    expect(gate.record).toMatchObject({ id: fact.id, canonStatus: "accepted" });
    expect(gate.gateResult.body).toContain("Gate sections:");
    expect(gate.gateResult.body).toContain("Dependencies: Dependencies substance for flood writ admission.");
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

    const ledger = AdmissionFlow.admitMinorBatch(store, {
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
    const store = WorldFile.create(tempPath("propagation.sqlite"));
    const fact = store.createRecord({ recordTypeKey: "canon_fact", title: "Ghost tolls bind bridges", body: "Dead witnesses can charge crossings.", truthLayer: "Objective canon", canonStatus: "accepted" });
    AdmissionFlow.declareAdmissionSeverity(store, fact.id, { admissionLevel: "4", workScale: "severe" });
    const debt = store.createCanonDebt({ name: `Propagation owed for ${fact.shortId}`, scope: "propagation", assignee: "steward", body: "Admission owed a shock cone." });

    expect(PropagationFlow.propagationQueue(store)).toEqual([expect.objectContaining({ id: debt.id, scope: "propagation" })]);
    const flow = PropagationFlow.startPropagationRun(store, { factRecordId: fact.id, debtRecordId: debt.id }) as { id: number; current_step: string };
    expect(flow.current_step).toBe("propagation:entry");
    expect(PropagationFlow.startPropagationRun(store, { factRecordId: fact.id, debtRecordId: debt.id })).toMatchObject({ id: flow.id });

    const direct = PropagationFlow.addPropagationConsequence(store, {
      flowId: flow.id,
      orderKey: "first",
      domainName: "Economy, trade, and scarcity",
      body: "Bridge tolls become debt instruments priced by mortuary advocates.",
      pressure: "high"
    });
    PropagationFlow.recordPropagationDomain(store, { flowId: flow.id, domainName: "Economy, trade, and scarcity", triage: "direct", declaration: "Tolls and credit markets change." });
    PropagationFlow.recordPropagationDomain(store, { flowId: flow.id, domainName: "Aesthetics, tone, and narrative use", triage: "negative", declaration: "No comic shortcut; this stays funerary and costly." });

    expect(() => PropagationFlow.closePropagationRun(store, flow.id)).toThrow(/missing-foundational-orders, missing-full-domain-atlas, undispositioned-high-pressure/);
    const disposition = PropagationFlow.dispositionPropagationConsequence(store, {
      consequenceId: direct.id,
      disposition: "assigned as canon debt",
      note: "Track counterfeiting and enforcement.",
      debtName: "Bridge toll counterfeiting pressure"
    });
    expect(disposition.debtRecordId).toEqual(expect.any(Number));

    for (const [orderKey, body] of [
      ["zeroth", "Ghost tolls redefine bridge crossings as debt-bearing thresholds."],
      ["second", "Ferrymen adapt by pricing witness-backed routes separately."],
      ["third", "Bridge courts institutionalize mortuary toll clerks."],
      ["fourth", "Old toll bridges become sites of debtor memorials."],
      ["fifth", "Bridge identity shifts toward metaphysical accounting."]
    ] as const) {
      PropagationFlow.addPropagationConsequence(store, {
        flowId: flow.id,
        orderKey,
        body,
        pressure: "normal"
      });
    }
    for (const [domainName, triage] of [
      ["Physics, metaphysics, and cosmology", "direct"],
      ["Geography, climate, and infrastructure", "dependency"],
      ["Ecology, food, disease, and nonhuman life", "negative"],
      ["Population, demography, and household life", "reaction"],
      ["Production, labor, and technology/magic", "dependency"],
      ["Governance, law, and bureaucracy", "direct"],
      ["War, coercion, and security", "negative"],
      ["Religion, ritual, myth, and meaning", "reaction"],
      ["Culture, custom, language, and identity", "reaction"],
      ["Knowledge, education, science, and records", "direct"],
      ["History, memory, and path dependence", "reaction"],
      ["Daily life and material residue", "reaction"]
    ] as const) {
      PropagationFlow.recordPropagationDomain(store, {
        flowId: flow.id,
        domainName,
        triage,
        declaration: `${domainName} is accounted for in the foundational ghost toll sweep.`
      });
    }

    const proposal = PropagationFlow.proposeFactFromPropagation(store, {
      flowId: flow.id,
      title: "Mortuary toll scrip exists",
      body: "Debt paper backed by dead witnesses circulates near bridges.",
      truthLayer: "Objective canon"
    });
    expect(proposal.record).toMatchObject({ recordTypeKey: "canon_fact", canonStatus: "proposed" });
    expect(proposal.queue).toEqual(expect.arrayContaining([expect.objectContaining({ id: proposal.record.id })]));
    expect(store.db.prepare("SELECT COUNT(*) AS count FROM jurisdiction_events WHERE record_id = ? AND origin = 'sweep'").get(proposal.record.id)).toMatchObject({ count: 1 });
    expect(store.listLinks(proposal.record.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ linkTypeKey: "derived_from", note: "Propose action provenance" })
    ]));

    const closed = PropagationFlow.closePropagationRun(store, flow.id);
    expect(closed.report).toMatchObject({ recordTypeKey: "propagation_report", canonStatus: "accepted" });
    expect(closed.debt).toMatchObject({ id: debt.id, canonStatus: "accepted" });
    expect(store.listLinks(fact.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ fromRecordId: fact.id, toRecordId: closed.report.id, linkTypeKey: "digest_of" })
    ]));
    expect(store.listLinks(proposal.record.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ fromRecordId: proposal.record.id, toRecordId: closed.report.id, linkTypeKey: "derived_from" })
    ]));
    expect(store.search("counterfeiting")).toEqual(expect.arrayContaining([expect.objectContaining({ id: closed.report.id })]));
    const correction = PropagationFlow.correctPropagationReport(store, { originalReportId: closed.report.id, body: "Corrected propagation report prose." });
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

  it("works contradiction triage with disposition-gated close and append-only reports", () => {
    const store = WorldFile.create(tempPath("contradiction.sqlite"));
    const fact = store.createRecord({ recordTypeKey: "canon_fact", title: "Bridge remains", body: "The bridge survived the flood.", truthLayer: "Objective canon", canonStatus: "accepted" });
    const flow = ContradictionFlow.startContradictionRun(store, { sourceRecordId: fact.id, implicatedRecordIds: [fact.id], title: "Bridge conflict" }) as { id: number; current_step: string };
    expect(flow.current_step).toBe("contradiction:entry");
    expect(ContradictionFlow.startContradictionRun(store, { sourceRecordId: fact.id, implicatedRecordIds: [fact.id], title: "Bridge conflict" })).toMatchObject({ id: flow.id });

    ContradictionFlow.recordContradictionTriage(store, { flowId: flow.id, stepKey: "contradiction_statement", body: "The bridge survived; the same bridge was destroyed." });
    ContradictionFlow.recordContradictionTriage(store, { flowId: flow.id, stepKey: "truth_layers", body: "Both claims are Objective canon." });
    expect(() => ContradictionFlow.recordContradictionTriage(store, { flowId: flow.id, stepKey: "invented_step", body: "This row would not render." })).toThrow(/Unknown contradiction triage step/);
    ContradictionFlow.declareContradictionWorkScale(store, { flowId: flow.id, workScale: "major" });
    expect(() => ContradictionFlow.closeContradictionRun(store, flow.id)).toThrow(/disposition/);
    ContradictionFlow.setContradictionDisposition(store, { flowId: flow.id, disposition: "not a contradiction", note: "The destroyed bridge was a downstream copy." });

    const closed = ContradictionFlow.closeContradictionRun(store, flow.id);
    expect(closed.report).toMatchObject({ recordTypeKey: "contradiction_report", canonStatus: "accepted" });
    expect(closed.flow).toMatchObject({ state: "complete", current_step: "contradiction:complete" });
    expect(store.listSections(closed.report.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ heading: "Contradiction statement", body: expect.stringContaining("bridge survived") }),
      expect.objectContaining({ heading: "Disposition", body: expect.stringContaining("not a contradiction") })
    ]));
    expect(store.listLinks(closed.report.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ fromRecordId: closed.report.id, toRecordId: fact.id, linkTypeKey: "derived_from" })
    ]));

    const secondConnection = new Database(store.path);
    secondConnection.pragma("foreign_keys = ON");
    expect(() => secondConnection.prepare("UPDATE records SET body = 'Changed' WHERE id = ?").run(closed.report.id)).toThrow(/append-only/);
    secondConnection.close();
    store.close();
  });

  it("applies repair jurisdiction, standing changes, history, and repair-created admission proposals", () => {
    const store = WorldFile.create(tempPath("repair.sqlite"));
    const fact = store.createRecord({ recordTypeKey: "canon_fact", title: "Bridge remains", body: "The bridge survived the flood.", truthLayer: "Objective canon", canonStatus: "accepted" });
    const flow = ContradictionFlow.startContradictionRun(store, { sourceRecordId: fact.id, implicatedRecordIds: [fact.id], title: "Repair bridge conflict" }) as { id: number };
    ContradictionFlow.recordContradictionTriage(store, { flowId: flow.id, stepKey: "contradiction_statement", body: "The bridge survived; later records require it destroyed." });
    ContradictionFlow.declareContradictionWorkScale(store, { flowId: flow.id, workScale: "major" });
    ContradictionFlow.setContradictionDisposition(store, { flowId: flow.id, disposition: "repair required" });
    expect(() => ContradictionFlow.closeContradictionRun(store, flow.id)).toThrow(/repair operations/);
    expect(() => ContradictionFlow.recordContradictionRepair(store, { flowId: flow.id, operations: ["accept"], repairText: "Admission operation must not be accepted as a repair." })).toThrow(/Unknown repair_operation term|unknown repair operation/i);

    const prompt = PromptOut.generatePrompt(store, { templateKey: "repair_challenge", recordId: fact.id, stepKey: "contradiction:repair" }).prompt;
    const advisory = PromptOut.storeAdvisoryResponse(store, { stepKey: "contradiction:repair", promptText: prompt, responseText: "Challenge response" });
    PromptOut.disposeAdvisoryArtifact(store, advisory.id, { disposition: "standing ruling", note: "Preserve the flood consequence.", standingRuling: true });
    const editedBoundaryTemplate = PromptOut.updatePromptTemplate(store, "boundary_guard", "Custom boundary pressure") as { current_text: string; current_version: number };
    expect(editedBoundaryTemplate).toMatchObject({ current_text: "Custom boundary pressure" });
    expect(PromptOut.revertPromptTemplate(store, "boundary_guard")).toMatchObject({ current_text: expect.stringContaining("Pressure-test the preservation boundary") });
    ContradictionFlow.recordContradictionRepair(store, { flowId: flow.id, operations: ["clarify scope", "add constraint"], repairText: "The bridge survived only as a ferry charter; the stone span fell." });
    ContradictionFlow.addContradictionRepairTarget(store, {
      flowId: flow.id,
      recordId: fact.id,
      nextCanonStatus: "quarantined",
      newBody: "The stone span fell; a ferry charter preserved the bridge right.",
      advisoryRecordId: advisory.id
    });
    const proposal = ContradictionFlow.proposeFactFromContradiction(store, {
      flowId: flow.id,
      title: "Ferry charter inherits bridge tolls",
      body: "The ferry charter keeps bridge toll law alive after the stone span falls.",
      truthLayer: "Objective canon"
    });
    expect(proposal.queue).toEqual(expect.arrayContaining([expect.objectContaining({ id: proposal.record.id, canonStatus: "proposed" })]));
    expect(store.listLinks(proposal.record.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ linkTypeKey: "derived_from", note: "Propose action provenance" })
    ]));

    const closed = ContradictionFlow.closeContradictionRun(store, flow.id);
    expect(store.getRecord(fact.id)).toMatchObject({ body: "The stone span fell; a ferry charter preserved the bridge right.", canonStatus: "quarantined" });
    expect(store.history(fact.id)).toEqual(expect.arrayContaining([expect.objectContaining({ retired_body: "The bridge survived the flood." })]));
    expect(store.db.prepare("SELECT repair_operation FROM jurisdiction_events WHERE record_id = ? AND origin = 'repair' ORDER BY id").all(fact.id)).toEqual([
      { repair_operation: "clarify scope" },
      { repair_operation: "add constraint" }
    ]);
    expect(store.listLinks(proposal.record.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ fromRecordId: proposal.record.id, toRecordId: closed.report.id, linkTypeKey: "derived_from" })
    ]));
    expect(store.listLinks(fact.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ fromRecordId: fact.id, toRecordId: advisory.id, linkTypeKey: "cites_advisory_artifact" })
    ]));

    const admissionFact = store.createRecord({ recordTypeKey: "canon_fact", title: "Admission cannot quarantine accepted", body: "Stable", truthLayer: "Objective canon", canonStatus: "accepted" });
    expect(() => AdmissionFlow.completeAdmissionGate(store, {
      recordId: admissionFact.id,
      truthLayer: "Objective canon",
      canonStatus: "quarantined",
      operations: ["accept"],
      consequenceText: "Trying the wrong jurisdiction."
    })).toThrow(/illegal canon status transition/);
    store.close();
  });

  it("enforces retcon costs, repair propagation debt, and contradiction skip thresholds", () => {
    const store = WorldFile.create(tempPath("retcon.sqlite"));
    const fact = store.createRecord({ recordTypeKey: "canon_fact", title: "Old calendar", body: "The flood happened in 900.", truthLayer: "Objective canon", canonStatus: "accepted" });
    const flow = ContradictionFlow.startContradictionRun(store, { sourceRecordId: fact.id, implicatedRecordIds: [fact.id], title: "Calendar retcon" }) as { id: number };
    ContradictionFlow.recordContradictionTriage(store, { flowId: flow.id, stepKey: "contradiction_statement", body: "The flood date conflicts with the coronation." });
    ContradictionFlow.declareContradictionWorkScale(store, { flowId: flow.id, workScale: "severe" });
    ContradictionFlow.setContradictionDisposition(store, { flowId: flow.id, disposition: "repair required" });
    ContradictionFlow.recordContradictionRepair(store, { flowId: flow.id, operations: ["retcon"], repairText: "Move the flood date to keep the coronation causal chain coherent." });
    ContradictionFlow.addContradictionRepairTarget(store, { flowId: flow.id, recordId: fact.id, nextCanonStatus: "superseded", newBody: "The flood happened in 905." });
    expect(() => ContradictionFlow.closeContradictionRun(store, flow.id)).toThrow(/retcon cost/);

    ContradictionFlow.recordContradictionRetconCosts(store, {
      flowId: flow.id,
      retconType: "hard retcon",
      costs: [{ cost: "continuity", text: "Earlier flood references need rereading." }]
    });
    const propagation = ContradictionFlow.setContradictionRepairPropagation(store, { flowId: flow.id, action: "assign", debtName: "Propagate flood-date repair", body: "Calendar changes ripple through institutions." });
    const closed = ContradictionFlow.closeContradictionRun(store, flow.id);
    expect(propagation.debtRecordId).toEqual(expect.any(Number));
    expect(PropagationFlow.propagationQueue(store)).toEqual(expect.arrayContaining([expect.objectContaining({ id: propagation.debtRecordId })]));
    expect(store.listLinks(closed.report.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ fromRecordId: closed.report.id, toRecordId: propagation.debtRecordId, linkTypeKey: "requires_follow_up" })
    ]));

    const declineFlow = ContradictionFlow.startContradictionRun(store, { title: "Declined repair propagation" }) as { id: number };
    expect(() => ContradictionFlow.setContradictionRepairPropagation(store, { flowId: declineFlow.id, action: "decline", workScale: "major" })).toThrow(/reason/);
    const declined = ContradictionFlow.setContradictionRepairPropagation(store, { flowId: declineFlow.id, action: "decline", workScale: "minor" });
    expect(store.getRecord(declined.skipRecordId!)).toMatchObject({ recordTypeKey: "skip_record", body: expect.stringContaining("Reason not collected") });
    expect(() => ContradictionFlow.skipContradictionStep(store, { flowId: declineFlow.id, stepKey: "repair_challenge", workScale: "major" })).toThrow(/reason/);
    store.close();
  });

  it("drains owed boundaries into mystery ledgers and gates mystery-preserving close on a checklist", () => {
    const store = WorldFile.create(tempPath("mystery.sqlite"));
    const fact = store.createRecord({ recordTypeKey: "canon_fact", title: "Chapel mouth", body: "The chapel mouth speaks at noon.", truthLayer: "Objective canon", canonStatus: "accepted" });
    const propagationFlow = PropagationFlow.startPropagationRun(store, { factRecordId: fact.id }) as { id: number };
    const consequence = PropagationFlow.addPropagationConsequence(store, {
      flowId: propagationFlow.id,
      orderKey: "first",
      body: "Pilgrims route their noon travel around the speaking chapel.",
      pressure: "high"
    });
    PropagationFlow.recordPropagationDomain(store, {
      flowId: propagationFlow.id,
      domainName: "Daily life and material residue",
      triage: "reaction",
      declaration: "Pilgrims reroute daily noon travel around the speaking chapel."
    });
    PropagationFlow.dispositionPropagationConsequence(store, {
      consequenceId: consequence.id,
      disposition: "protected as a mystery boundary",
      preservationBoundary: "author-secret",
      note: "Do not explain the speaking origin."
    });
    const propagationClosed = PropagationFlow.closePropagationRun(store, propagationFlow.id);
    const queue = ContradictionFlow.owedBoundariesQueue(store);
    expect(queue).toEqual([expect.objectContaining({ protectedRecordId: fact.id, propagationReportRecordId: propagationClosed.report.id })]);

    const ledger = ContradictionFlow.createMysteryLedgerEntry(store, {
      propagationDispositionId: queue[0]!.propagationDispositionId,
      title: "Chapel mouth opacity",
      protectedRecordId: fact.id,
      propagationReportRecordId: propagationClosed.report.id,
      effectType: "sacred opacity",
      mysteryState: "author-secret",
      preservationBoundary: "author-secret",
      sections: {
        "Protected effect type": "sacred opacity",
        "Puzzle question, if any": "none",
        "What is fixed": "The mouth speaks at noon and sunset.",
        "What is secret or undecided": "The origin remains author-secret.",
        "Damaging explanations": "A mechanical speaker would flatten the sacred effect.",
        "Preserved consequences": "Candles gutter blue and witnesses lose one memory.",
        "Reveal permissions": "Partial witness consequences may be revealed.",
        "Reveal prohibitions": "The origin must not be explained."
      }
    });
    expect(ContradictionFlow.owedBoundariesQueue(store)).toEqual([]);
    expect(store.listFacets(ledger.record.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ vocabulary: "protected_effect_type", term: "sacred opacity" }),
      expect.objectContaining({ vocabulary: "mystery_state", term: "author-secret" }),
      expect.objectContaining({ vocabulary: "preservation_boundary", term: "author-secret" })
    ]));
    expect(store.listLinks(ledger.record.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ fromRecordId: ledger.record.id, toRecordId: fact.id, linkTypeKey: "preserves_boundary_for" }),
      expect.objectContaining({ fromRecordId: ledger.record.id, toRecordId: propagationClosed.report.id, linkTypeKey: "derived_from" })
    ]));
    ContradictionFlow.createMysteryLedgerEntry(store, {
      ledgerRecordId: ledger.record.id,
      title: "Chapel mouth opacity",
      protectedRecordId: fact.id,
      propagationReportRecordId: propagationClosed.report.id,
      effectType: "sacred opacity",
      mysteryState: "author-secret",
      preservationBoundary: "author-secret",
      sections: {
        "Protected effect type": "sacred opacity",
        "Puzzle question, if any": "none",
        "What is fixed": "The mouth speaks at noon, sunset, and eclipse."
      }
    });
    expect(store.sectionHistory(ledger.record.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ retired_heading: "What is fixed", retired_body: "The mouth speaks at noon and sunset." })
    ]));

    const flow = ContradictionFlow.startContradictionRun(store, { sourceRecordId: fact.id, implicatedRecordIds: [fact.id], title: "Mystery-preserving conflict" }) as { id: number };
    ContradictionFlow.recordContradictionTriage(store, { flowId: flow.id, stepKey: "contradiction_statement", body: "A later repair touches the sacred speaking origin." });
    ContradictionFlow.declareContradictionWorkScale(store, { flowId: flow.id, workScale: "major" });
    ContradictionFlow.setContradictionDisposition(store, { flowId: flow.id, disposition: "mystery-preserving conflict" });
    expect(() => ContradictionFlow.closeContradictionRun(store, flow.id)).toThrow(/preservation checklist/);
    const checklist = ContradictionFlow.completeMysteryPreservationChecklist(store, {
      flowId: flow.id,
      ledgerRecordId: ledger.record.id,
      protectedRecordId: fact.id,
      operation: "consecrate",
      effectType: "sacred opacity",
      body: "The repair preserves the sacred refusal while keeping costs visible.",
      sacredGuardBody: "Origin refused; noon/sunset timing, blue candles, memory cost, and witness records stay fixed."
    });
    expect(checklist.sacredOpacityGuardRequired).toBe(true);
    expect(ContradictionFlow.closeContradictionRun(store, flow.id).report).toMatchObject({ recordTypeKey: "contradiction_report" });
    store.close();
  });

  it("snapshots a live world to a chosen path as a valid complete world file", () => {
    const path = tempPath("world.sqlite");
    const snapshotPath = tempPath("snapshot.sqlite");
    const store = WorldFile.create(path);
    const record = store.createRecord({ recordTypeKey: "canon_fact", title: "Live backup", body: "Copy this", ...explicitJudgment });
    const written = store.snapshot(snapshotPath);
    store.updateRecord(record.id, { body: "Changed after snapshot" });
    expect(written).toBe(snapshotPath);
    expect(existsSync(snapshotPath)).toBe(true);

    const snapshot = WorldFile.open(snapshotPath);
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

    expect(() => WorldFile.open(path)).toThrow(/not a Worldloom/);
  });
});
