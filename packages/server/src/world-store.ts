import Database from "better-sqlite3";
import { dirname, resolve } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { APPLICATION_ID, CURRENT_SCHEMA_VERSION, migration001, migration002, migration003, migration004 } from "./schema.js";
import {
  addContradictionRepairTarget as addContradictionFlowRepairTarget,
  closeContradictionRun as closeContradictionFlowRun,
  completeMysteryPreservationChecklist as completeMysteryFlowPreservationChecklist,
  createMysteryLedgerEntry as createContradictionFlowMysteryLedgerEntry,
  declareContradictionWorkScale as declareContradictionFlowWorkScale,
  getContradictionRun as getContradictionFlowRun,
  owedBoundariesQueue as contradictionFlowOwedBoundariesQueue,
  proposeFactFromContradiction as proposeFactFromContradictionFlow,
  recordContradictionRepair as recordContradictionFlowRepair,
  recordContradictionRetconCosts as recordContradictionFlowRetconCosts,
  recordContradictionTriage as recordContradictionFlowTriage,
  setContradictionDisposition as setContradictionFlowDisposition,
  setContradictionRepairPropagation as setContradictionFlowRepairPropagation,
  skipContradictionStep as skipContradictionFlowStep,
  startContradictionRun as startContradictionFlowRun,
  type ContradictionRepairPropagationRow,
  type MysteryChecklistRow,
  type OwedBoundaryRow
} from "./contradiction-flow.js";
import {
  addPropagationConsequence as addPropagationFlowConsequence,
  closePropagationRun as closePropagationFlowRun,
  correctPropagationReport as correctPropagationFlowReport,
  dispositionPropagationConsequence as dispositionPropagationFlowConsequence,
  getPropagationRun as getPropagationFlowRun,
  propagationPlan as propagationFlowPlan,
  propagationQueue as propagationFlowQueue,
  proposeFactFromPropagation as proposeFactFromPropagationFlow,
  recordPropagationDomain as recordPropagationFlowDomain,
  skipPropagationStep as skipPropagationFlowStep,
  startPropagationRun as startPropagationFlowRun,
  type PropagationConsequenceRow,
  type PropagationDispositionRow,
  type PropagationDomainSweepRow,
  type PropagationQueueRow
} from "./propagation-flow.js";
import {
  admissionGatePolicy,
  admissionQueueSortKey,
  requiresSkipReason,
  warnsForOpenCanonDebt,
  type DeclaredSeverity
} from "./severity-policy.js";
import { LINK_TYPES, RECORD_TYPE_BY_KEY } from "@worldloom/shared";

export type {
  ContradictionRepairPropagationRow,
  MysteryChecklistRow,
  OwedBoundaryRow
} from "./contradiction-flow.js";

export type {
  PropagationConsequenceRow,
  PropagationDispositionRow,
  PropagationDomainSweepRow,
  PropagationQueueRow
} from "./propagation-flow.js";

export interface RecordInput {
  recordTypeKey: string;
  title: string;
  body?: string;
  truthLayer: string;
  canonStatus: string;
}

export interface RecordRow {
  id: number;
  shortId: string;
  recordTypeKey: string;
  title: string;
  body: string;
  truthLayer: string | null;
  canonStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LinkRow {
  id: number;
  fromRecordId: number;
  toRecordId: number;
  linkTypeKey: string;
  note: string;
  createdAt: string;
}

export interface FacetInput {
  vocabulary: string;
  term: string;
  position?: number;
}

export interface FacetRow extends FacetInput {
  id: number;
  recordId: number;
  position: number;
}

export interface SectionInput {
  heading: string;
  body?: string;
  position: number;
}

export interface SectionRow {
  id: number;
  recordId: number;
  heading: string;
  body: string;
  position: number;
}

export interface DraftRow {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface TraversalRow extends LinkRow {
  depth: number;
}

export interface AdmissionQueueRow extends RecordRow {
  admissionLevel: string | null;
  workScale: string | null;
  constraintTags: string[];
}

type AdmissionSeedInput = { title: string; body: string; truthLayer: string; canonStatus: string };

type AdmissionIntakeCompletion = {
  recordSweepJurisdiction?: boolean;
  provenanceFlowStep?: string;
};

const rowToRecord = (row: Record<string, unknown>): RecordRow => ({
  id: Number(row.id),
  shortId: String(row.short_id),
  recordTypeKey: String(row.record_type_key),
  title: String(row.title),
  body: String(row.body ?? ""),
  truthLayer: row.truth_layer == null ? null : String(row.truth_layer),
  canonStatus: row.canon_status == null ? null : String(row.canon_status),
  createdAt: String(row.created_at),
  updatedAt: String(row.updated_at)
});

const rowToLink = (row: Record<string, unknown>): LinkRow => ({
  id: Number(row.id),
  fromRecordId: Number(row.from_record_id),
  toRecordId: Number(row.to_record_id),
  linkTypeKey: String(row.link_type_key),
  note: String(row.note ?? ""),
  createdAt: String(row.created_at)
});

const rowToFacet = (row: Record<string, unknown>): FacetRow => ({
  id: Number(row.id),
  recordId: Number(row.record_id),
  vocabulary: String(row.vocabulary),
  term: String(row.term),
  position: Number(row.position)
});

const rowToSection = (row: Record<string, unknown>): SectionRow => ({
  id: Number(row.id),
  recordId: Number(row.record_id),
  heading: String(row.heading),
  body: String(row.body ?? ""),
  position: Number(row.position)
});

const rowToDraft = (row: Record<string, unknown>): DraftRow => ({
  id: Number(row.id),
  title: String(row.title),
  body: String(row.body ?? ""),
  createdAt: String(row.created_at),
  updatedAt: String(row.updated_at)
});

const quoteSqlPath = (path: string): string => `'${path.replaceAll("'", "''")}'`;

export class WorldStore {
  readonly db: Database.Database;
  readonly path: string;

  private constructor(path: string, db: Database.Database) {
    this.path = path;
    this.db = db;
  }

  static create(path: string): WorldStore {
    const resolved = resolve(path);
    mkdirSync(dirname(resolved), { recursive: true });
    const db = new Database(resolved);
    const store = new WorldStore(resolved, db);
    store.configureConnection();
    store.migrate({ backupBeforeMigration: false });
    return store;
  }

  static open(path: string): WorldStore {
    if (!existsSync(path)) {
      throw new Error(`World file does not exist: ${path}`);
    }
    const resolved = resolve(path);
    const db = new Database(resolved);
    const store = new WorldStore(resolved, db);
    store.configureConnection();
    store.assertIntegrity();
    store.assertApplicationIdCanOpen();
    store.migrate({ backupBeforeMigration: true });
    return store;
  }

  close(): void {
    this.db.close();
  }

  snapshot(destinationPath?: string): string {
    const destination = destinationPath ? resolve(destinationPath) : this.backupPath("snapshot");
    mkdirSync(dirname(destination), { recursive: true });
    this.db.exec(`VACUUM INTO ${quoteSqlPath(destination)}`);
    return destination;
  }

  integrityCheck(): string {
    return String(this.db.pragma("integrity_check", { simple: true }));
  }

  listRecords(): RecordRow[] {
    return this.db.prepare("SELECT * FROM records ORDER BY updated_at DESC, id DESC").all().map((row) => rowToRecord(row as Record<string, unknown>));
  }

  getRecord(id: number): RecordRow {
    const row = this.db.prepare("SELECT * FROM records WHERE id = ?").get(id);
    if (!row) throw new Error(`Record not found: ${id}`);
    return rowToRecord(row as Record<string, unknown>);
  }

  createRecord(input: RecordInput): RecordRow {
    this.assertRecordType(input.recordTypeKey);
    if (!input.truthLayer || !input.canonStatus) {
      throw new Error("truthLayer and canonStatus are explicit steward choices");
    }
    const shortId = this.nextShortId(input.recordTypeKey);
    const result = this.db.prepare(`
      INSERT INTO records (short_id, record_type_key, title, body, truth_layer, canon_status)
      VALUES (@shortId, @recordTypeKey, @title, @body, @truthLayer, @canonStatus)
    `).run({
      shortId,
      recordTypeKey: input.recordTypeKey,
      title: input.title,
      body: input.body ?? "",
      truthLayer: input.truthLayer,
      canonStatus: input.canonStatus
    });
    return this.getRecord(Number(result.lastInsertRowid));
  }

  createRecordWithProvenance(input: RecordInput, advisoryRecordId?: number): RecordRow {
    const record = this.createRecord(input);
    if (advisoryRecordId != null) {
      this.createLink(record.id, advisoryRecordId, "derived_from", "Steward authored with advisory material on the table");
      this.createLink(record.id, advisoryRecordId, "cites_advisory_artifact", "Verbatim advisory artifact consulted");
    }
    return record;
  }

  updateRecord(id: number, input: Partial<Omit<RecordInput, "recordTypeKey">>): RecordRow {
    const current = this.getRecord(id);
    this.db.prepare(`
      UPDATE records
      SET title = @title,
          body = @body,
          truth_layer = @truthLayer,
          canon_status = @canonStatus
      WHERE id = @id
    `).run({
      id,
      title: input.title ?? current.title,
      body: input.body ?? current.body,
      truthLayer: input.truthLayer === undefined ? current.truthLayer : input.truthLayer,
      canonStatus: input.canonStatus === undefined ? current.canonStatus : input.canonStatus
    });
    return this.getRecord(id);
  }

  promoteRecord(id: number, nextRecordTypeKey: string): RecordRow {
    const current = this.getRecord(id);
    const nextType = this.assertRecordType(nextRecordTypeKey);
    if (nextType.mutationRegime !== "card") {
      throw new Error("promotion target must use the card mutation regime");
    }
    this.db.transaction(() => {
      this.db.prepare("UPDATE records SET record_type_key = ? WHERE id = ?").run(nextRecordTypeKey, id);
      this.db.prepare(`
        INSERT OR IGNORE INTO record_links (from_record_id, to_record_id, link_type_key, note)
        VALUES (?, ?, 'tombstones', ?)
      `).run(id, current.id, `Promotion changed ${current.shortId} from ${current.recordTypeKey} to ${nextRecordTypeKey}`);
    })();
    return this.getRecord(id);
  }

  listFacets(recordId: number): FacetRow[] {
    return this.db.prepare("SELECT * FROM record_facets WHERE record_id = ? ORDER BY vocabulary, position, id").all(recordId).map((row) => rowToFacet(row as Record<string, unknown>));
  }

  addFacet(recordId: number, input: FacetInput): FacetRow {
    this.getRecord(recordId);
    this.assertVocabularyTerm(input.vocabulary, input.term);
    const result = this.db.prepare(`
      INSERT INTO record_facets (record_id, vocabulary, term, position)
      VALUES (?, ?, ?, ?)
    `).run(recordId, input.vocabulary, input.term, input.position ?? this.nextFacetPosition(recordId, input.vocabulary));
    return rowToFacet(this.db.prepare("SELECT * FROM record_facets WHERE id = ?").get(result.lastInsertRowid) as Record<string, unknown>);
  }

  removeFacet(recordId: number, facetId: number): void {
    const result = this.db.prepare("DELETE FROM record_facets WHERE record_id = ? AND id = ?").run(recordId, facetId);
    if (!result.changes) throw new Error(`Facet not found: ${facetId}`);
  }

  sectionHeadings(recordTypeKey?: string): unknown[] {
    if (recordTypeKey) {
      return this.db.prepare("SELECT * FROM record_section_headings WHERE record_type_key = ? ORDER BY position").all(recordTypeKey);
    }
    return this.db.prepare("SELECT * FROM record_section_headings ORDER BY record_type_key, position").all();
  }

  listSections(recordId: number): SectionRow[] {
    return this.db.prepare("SELECT * FROM record_sections WHERE record_id = ? ORDER BY position").all(recordId).map((row) => rowToSection(row as Record<string, unknown>));
  }

  replaceSections(recordId: number, sections: SectionInput[]): SectionRow[] {
    const record = this.getRecord(recordId);
    const headings = new Set(this.sectionHeadings(record.recordTypeKey).map((row) => String((row as { heading: string }).heading)));
    for (const section of sections) {
      if (!headings.has(section.heading)) throw new Error(`Unknown section heading for ${record.recordTypeKey}: ${section.heading}`);
    }
    this.db.transaction(() => {
      const current = new Map(this.listSections(recordId).map((section) => [section.heading, section]));
      for (const section of sections) {
        const existing = current.get(section.heading);
        if (existing) {
          this.db.prepare("UPDATE record_sections SET position = ? WHERE id = ?").run(existing.position + 10000, existing.id);
        }
      }
      for (const section of sections) {
        const existing = current.get(section.heading);
        if (existing) {
          this.db.prepare("UPDATE record_sections SET body = ?, position = ? WHERE id = ?").run(section.body ?? "", section.position, existing.id);
        } else {
          this.db.prepare("INSERT INTO record_sections (record_id, heading, body, position) VALUES (?, ?, ?, ?)").run(recordId, section.heading, section.body ?? "", section.position);
        }
      }
    })();
    return this.listSections(recordId);
  }

  sectionHistory(recordId: number): unknown[] {
    return this.db.prepare("SELECT * FROM record_section_history WHERE record_id = ? ORDER BY id").all(recordId);
  }

  listDrafts(): DraftRow[] {
    return this.db.prepare("SELECT * FROM drafts ORDER BY updated_at DESC, id DESC").all().map((row) => rowToDraft(row as Record<string, unknown>));
  }

  createDraft(input: { title: string; body?: string }): DraftRow {
    const result = this.db.prepare("INSERT INTO drafts (title, body) VALUES (?, ?)").run(input.title, input.body ?? "");
    return rowToDraft(this.db.prepare("SELECT * FROM drafts WHERE id = ?").get(result.lastInsertRowid) as Record<string, unknown>);
  }

  updateDraft(id: number, input: { title?: string; body?: string }): DraftRow {
    const current = this.db.prepare("SELECT * FROM drafts WHERE id = ?").get(id) as Record<string, unknown> | undefined;
    if (!current) throw new Error(`Draft not found: ${id}`);
    this.db.prepare("UPDATE drafts SET title = ?, body = ? WHERE id = ?").run(input.title ?? current.title, input.body ?? current.body ?? "", id);
    return rowToDraft(this.db.prepare("SELECT * FROM drafts WHERE id = ?").get(id) as Record<string, unknown>);
  }

  discardDraft(id: number): void {
    const result = this.db.prepare("DELETE FROM drafts WHERE id = ?").run(id);
    if (!result.changes) throw new Error(`Draft not found: ${id}`);
  }

  convertDraft(id: number, input: Omit<RecordInput, "title" | "body"> & { title?: string }): RecordRow {
    const draft = this.db.prepare("SELECT * FROM drafts WHERE id = ?").get(id) as Record<string, unknown> | undefined;
    if (!draft) throw new Error(`Draft not found: ${id}`);
    if (!input.recordTypeKey || !input.truthLayer || !input.canonStatus) {
      throw new Error("draft conversion requires explicit record type, truth layer, and canon status");
    }
    const record = this.db.transaction(() => {
      const created = this.createRecord({
        recordTypeKey: input.recordTypeKey,
        title: input.title ?? String(draft.title),
        body: String(draft.body ?? ""),
        truthLayer: input.truthLayer,
        canonStatus: input.canonStatus
      });
      this.db.prepare("DELETE FROM drafts WHERE id = ?").run(id);
      return created;
    })();
    return record;
  }

  promptTemplates(): unknown[] {
    return this.db.prepare(`
      SELECT pt.*, ptv.text AS current_text
      FROM prompt_templates pt
      JOIN prompt_template_versions ptv ON ptv.template_key = pt.key AND ptv.version = pt.current_version
      ORDER BY pt.key
    `).all();
  }

  updatePromptTemplate(key: string, text: string): unknown {
    const current = this.db.prepare("SELECT * FROM prompt_templates WHERE key = ?").get(key) as { current_version: number } | undefined;
    if (!current) throw new Error(`Prompt template not found: ${key}`);
    const nextVersion = current.current_version + 1;
    this.db.transaction(() => {
      this.db.prepare("INSERT INTO prompt_template_versions (template_key, version, text) VALUES (?, ?, ?)").run(key, nextVersion, text);
      this.db.prepare("UPDATE prompt_templates SET current_version = ? WHERE key = ?").run(nextVersion, key);
    })();
    return this.db.prepare(`
      SELECT pt.*, ptv.text AS current_text
      FROM prompt_templates pt
      JOIN prompt_template_versions ptv ON ptv.template_key = pt.key AND ptv.version = pt.current_version
      WHERE pt.key = ?
    `).get(key);
  }

  revertPromptTemplate(key: string): unknown {
    const template = this.db.prepare("SELECT original_text FROM prompt_templates WHERE key = ?").get(key) as { original_text: string } | undefined;
    if (!template) throw new Error(`Prompt template not found: ${key}`);
    return this.updatePromptTemplate(key, template.original_text);
  }

  generatePrompt(input: { templateKey: string; recordId?: number; stepKey?: string }): { prompt: string } {
    const template = this.db.prepare(`
      SELECT pt.key, pt.role_name, pt.original_text, pt.package_source, ptv.text AS current_text
      FROM prompt_templates pt
      JOIN prompt_template_versions ptv ON ptv.template_key = pt.key AND ptv.version = pt.current_version
      WHERE pt.key = ?
    `).get(input.templateKey) as Record<string, unknown> | undefined;
    if (!template) throw new Error(`Prompt template not found: ${input.templateKey}`);
    const recordContext = input.recordId == null ? "No record context selected." : this.recordPromptContext(input.recordId);
    const rulings = this.standingRulings();
    return {
      prompt: [
        `Role framing (${template.role_name}): ask for pressure, not answers. The steward's material comes first; do not write final canon.`,
        `Default prompt derivation (${template.package_source}): ${template.current_text}`,
        "Vocabulary guardrail: label whether any suggestion touches truth layer, canon status, constraint tag, admission decision operation, repair operation, consequence mode, or preservation boundary. Do not blur those categories.",
        "Label assumptions instruction: separate direct consequences from speculative assumptions and mark unadmitted assumptions plainly.",
        `Standing rulings: ${rulings.length ? rulings.map((row) => `${row.disposition}: ${row.note}`).join("; ") : "none"}.`,
        `Step: ${input.stepKey ?? input.templateKey}`,
        "Record context:",
        recordContext
      ].join("\n\n")
    };
  }

  createAdvisoryArtifact(input: { stepKey: string; promptText: string; responseText: string }): RecordRow {
    return this.createRecord({
      recordTypeKey: "advisory_artifact",
      title: `Advisory artifact: ${input.stepKey}`,
      body: [`Prompt:`, input.promptText, `Response:`, input.responseText].join("\n\n"),
      truthLayer: "disputed claim",
      canonStatus: "proposed"
    });
  }

  disposeAdvisoryArtifact(advisoryRecordId: number, input: { disposition: string; note?: string; standingRuling?: boolean }): unknown {
    this.getRecord(advisoryRecordId);
    this.assertVocabularyTerm("advisory_disposition", input.disposition);
    const result = this.db.prepare(`
      INSERT INTO advisory_dispositions (advisory_record_id, disposition, note, standing_ruling)
      VALUES (?, ?, ?, ?)
    `).run(advisoryRecordId, input.disposition, input.note ?? "", input.standingRuling ? 1 : 0);
    return this.db.prepare("SELECT * FROM advisory_dispositions WHERE id = ?").get(result.lastInsertRowid);
  }

  startCreationFlow(): unknown {
    const row = this.db.prepare("SELECT * FROM flow_instances WHERE flow_key = 'creation' AND state = 'in_progress' ORDER BY id DESC LIMIT 1").get();
    if (row) return row;
    const result = this.db.prepare("INSERT INTO flow_instances (flow_key, current_step) VALUES ('creation', 'kernel:World premise')").run();
    return this.db.prepare("SELECT * FROM flow_instances WHERE id = ?").get(result.lastInsertRowid);
  }

  saveKernelStep(input: { flowId: number; heading: string; body: string; consequenceMode?: string }): unknown {
    const flow = this.db.prepare("SELECT * FROM flow_instances WHERE id = ?").get(input.flowId) as { kernel_record_id: number | null } | undefined;
    if (!flow) throw new Error(`Flow not found: ${input.flowId}`);
    const kernelId = flow.kernel_record_id ?? this.createRecord({
      recordTypeKey: "world_kernel",
      title: "World kernel",
      body: "",
      truthLayer: "Objective canon",
      canonStatus: "proposed"
    }).id;
    if (!flow.kernel_record_id) {
      this.db.prepare("UPDATE flow_instances SET kernel_record_id = ? WHERE id = ?").run(kernelId, input.flowId);
    }
    const heading = this.sectionHeadings("world_kernel").find((row) => String((row as { heading: string }).heading) === input.heading) as { position: number } | undefined;
    if (!heading) throw new Error(`Unknown kernel step: ${input.heading}`);
    this.replaceSections(kernelId, [{ heading: input.heading, body: input.body, position: Number(heading.position) }]);
    if (input.consequenceMode) {
      const existing = this.listFacets(kernelId).filter((facet) => facet.vocabulary === "consequence_mode");
      for (const facet of existing) this.removeFacet(kernelId, facet.id);
      this.addFacet(kernelId, { vocabulary: "consequence_mode", term: input.consequenceMode, position: 1 });
    }
    this.db.prepare("UPDATE flow_instances SET current_step = ? WHERE id = ?").run(`kernel:${input.heading}`, input.flowId);
    return { flow: this.db.prepare("SELECT * FROM flow_instances WHERE id = ?").get(input.flowId), kernel: this.getRecord(kernelId), sections: this.listSections(kernelId), facets: this.listFacets(kernelId) };
  }

  recordSkip(input: { flowId?: number; stepKey: string; reason?: string }): RecordRow {
    return this.createRecord({
      recordTypeKey: "skip_record",
      title: `Skip: ${input.stepKey}`,
      body: input.reason ? `Step: ${input.stepKey}\nReason: ${input.reason}` : `Step: ${input.stepKey}\nReason not collected below major-fact threshold.`,
      truthLayer: "Objective canon",
      canonStatus: "proposed"
    });
  }

  decomposeSeeds(input: { flowId: number; kernelRecordId: number; draftIds?: number[]; seeds: AdmissionSeedInput[] }): unknown {
    const kernel = this.getRecord(input.kernelRecordId);
    const drafts = (input.draftIds ?? []).map((id) => {
      const row = this.db.prepare("SELECT * FROM drafts WHERE id = ?").get(id);
      if (!row) throw new Error(`Draft not found: ${id}`);
      return rowToDraft(row as Record<string, unknown>);
    });
    return this.db.transaction(() => {
      const report = this.createRecord({
        recordTypeKey: "seed_decomposition",
        title: "Seed decomposition",
        body: `Kernel ${kernel.shortId}; drafts consumed: ${drafts.map((draft) => draft.title).join(", ") || "none"}`,
        truthLayer: "Objective canon",
        canonStatus: "proposed"
      });
      this.replaceSections(report.id, [
        { heading: "Kernel source", body: `${kernel.shortId} ${kernel.title}`, position: 1 },
        { heading: "Drafts consumed", body: drafts.map((draft) => `${draft.title}\n${draft.body}`).join("\n\n"), position: 2 },
        { heading: "Granularity decisions", body: "Each parked seed is independently rejectable without destroying its siblings.", position: 3 },
        { heading: "Parked seeds", body: input.seeds.map((seed) => seed.title).join("\n"), position: 4 },
        { heading: "Thin-start boundary", body: "No seed is admitted by this flow; admission is deferred to the admission flow.", position: 5 }
      ]);
      const records = input.seeds.map((seed) => this.intakeCreationSeed(seed, kernel.id, report.id));
      for (const draft of drafts) this.db.prepare("DELETE FROM drafts WHERE id = ?").run(draft.id);
      this.db.prepare("UPDATE flow_instances SET current_step = 'decomposition:complete', state = 'complete' WHERE id = ?").run(input.flowId);
      return { report, records, flow: this.db.prepare("SELECT * FROM flow_instances WHERE id = ?").get(input.flowId) };
    })();
  }

  admissionQueue(): AdmissionQueueRow[] {
    return this.readAdmissionQueue();
  }

  proposeDraftToAdmission(id: number, input: { title?: string; truthLayer: string }): { record: RecordRow; queue: AdmissionQueueRow[] } {
    return this.intakeDraftProposal(id, input);
  }

  proposeRecordToAdmission(id: number): { record: RecordRow; queue: AdmissionQueueRow[] } {
    return this.intakeRecordProposal(id);
  }

  declareAdmissionSeverity(recordId: number, input: { admissionLevel: string; workScale: string }): { record: RecordRow; facets: FacetRow[]; gate: unknown; queue: AdmissionQueueRow[] } {
    return this.refreshAdmissionQueueAfterSeverity(recordId, input);
  }

  private intakeCreationSeed(seed: AdmissionSeedInput, kernelRecordId: number, reportRecordId: number): RecordRow {
    if (!seed.truthLayer || !seed.canonStatus) throw new Error("seed parking requires explicit truth layer and canon status");
    const record = this.createRecord({ recordTypeKey: "canon_fact", title: seed.title, body: seed.body, truthLayer: seed.truthLayer, canonStatus: seed.canonStatus });
    this.createLink(record.id, kernelRecordId, "derived_from", "Seed decomposed from world kernel");
    this.createLink(record.id, reportRecordId, "derived_from", "Seed recorded by decomposition report");
    this.completeAdmissionIntake(record.id);
    return record;
  }

  private intakeDraftProposal(id: number, input: { title?: string; truthLayer: string }): { record: RecordRow; queue: AdmissionQueueRow[] } {
    const record = this.convertDraft(id, { recordTypeKey: "canon_fact", title: input.title, truthLayer: input.truthLayer, canonStatus: "proposed" });
    return { record, queue: this.completeAdmissionIntake(record.id, { recordSweepJurisdiction: true, provenanceFlowStep: "admission:propose-draft" }) };
  }

  private intakeRecordProposal(id: number): { record: RecordRow; queue: AdmissionQueueRow[] } {
    const record = this.getRecord(id);
    return { record, queue: this.completeAdmissionIntake(record.id, { recordSweepJurisdiction: true, provenanceFlowStep: "admission:propose-record" }) };
  }

  private refreshAdmissionQueueAfterSeverity(recordId: number, input: { admissionLevel: string; workScale: string }): { record: RecordRow; facets: FacetRow[]; gate: unknown; queue: AdmissionQueueRow[] } {
    this.assertVocabularyTerm("admission_level", input.admissionLevel);
    this.assertVocabularyTerm("work_scale", input.workScale);
    this.replaceSingleFacet(recordId, "admission_level", input.admissionLevel);
    this.replaceSingleFacet(recordId, "work_scale", input.workScale);
    return { record: this.getRecord(recordId), facets: this.listFacets(recordId), gate: this.gateComposition(recordId), queue: this.readAdmissionQueue() };
  }

  private completeAdmissionIntake(recordId: number, completion: AdmissionIntakeCompletion = {}): AdmissionQueueRow[] {
    if (completion.recordSweepJurisdiction) this.recordJurisdictionEvent(recordId, "sweep");
    if (completion.provenanceFlowStep) this.recordProposeProvenance(recordId, completion.provenanceFlowStep);
    return this.readAdmissionQueue();
  }

  private readAdmissionQueue(): AdmissionQueueRow[] {
    return this.db.prepare(`
      SELECT r.*
      FROM records r
      WHERE r.record_type_key IN ('canon_fact', 'admission_ledger_row')
        AND r.canon_status IN ('proposed', 'under review')
    `).all()
      .map((row) => this.withAdmissionFacets(rowToRecord(row as Record<string, unknown>)))
      .sort((left, right) => {
        const leftKey = admissionQueueSortKey(left);
        const rightKey = admissionQueueSortKey(right);
        if (leftKey.workScaleRank !== rightKey.workScaleRank) return leftKey.workScaleRank - rightKey.workScaleRank;
        if (leftKey.admissionLevelRank !== rightKey.admissionLevelRank) return rightKey.admissionLevelRank - leftKey.admissionLevelRank;
        if (left.updatedAt !== right.updatedAt) return left.updatedAt < right.updatedAt ? 1 : -1;
        return right.id - left.id;
      });
  }

  gateComposition(recordId: number): unknown {
    const record = this.getRecord(recordId);
    const facets = this.listFacets(recordId);
    const severity = this.declaredSeverityFromFacets(facets);
    const gate = admissionGatePolicy(severity);
    return {
      record,
      admissionLevel: severity.admissionLevel,
      workScale: severity.workScale,
      path: gate.path,
      doctrine: gate.doctrine,
      steps: gate.steps
    };
  }

  admitMinorBatch(input: { source?: string; rows: Array<{ title: string; fact: string; scope: string; truthLayer: string; status: string; constraintTags?: string[]; operations: string[]; consequenceCheck: string }> }): { records: RecordRow[]; report: RecordRow } {
    if (!input.rows.length) throw new Error("minor admission batch requires at least one row");
    return this.db.transaction(() => {
      const report = this.createRecord({
        recordTypeKey: "gate_result",
        title: "Minor admission batch",
        body: `Source: ${input.source ?? "admission queue"}\nRows: ${input.rows.length}`,
        truthLayer: "Objective canon",
        canonStatus: "accepted"
      });
      const records = input.rows.map((row) => {
        if (!row.fact || !row.scope || !row.truthLayer || !row.status || !row.operations.length || !row.consequenceCheck) {
          throw new Error("minor ledger rows require fact, scope, truth layer, status, operations, and one consequence check");
        }
        const record = this.createRecord({
          recordTypeKey: "admission_ledger_row",
          title: row.title,
          body: [
            `Fact: ${row.fact}`,
            `Scope: ${row.scope}`,
            `Status: ${row.status}`,
            `Constraint tags: ${(row.constraintTags ?? []).join(", ") || "none"}`,
            `Admission operation(s): ${row.operations.join(", ")}`,
            `One consequence check: ${row.consequenceCheck}`
          ].join("\n"),
          truthLayer: row.truthLayer,
          canonStatus: row.status
        });
        this.replaceSingleFacet(record.id, "admission_level", "1");
        this.replaceSingleFacet(record.id, "work_scale", "minor");
        for (const [index, tag] of (row.constraintTags ?? []).entries()) {
          this.addFacet(record.id, { vocabulary: "constraint_tag", term: tag, position: index + 1 });
        }
        row.operations.forEach((operation) => this.recordJurisdictionEvent(record.id, "admission", operation));
        this.createLink(record.id, report.id, "derived_from", "Minor admission batch gate result");
        return record;
      });
      return { records, report };
    })();
  }

  startAdmissionGate(recordId: number): unknown {
    this.getRecord(recordId);
    const row = this.db.prepare("SELECT * FROM flow_instances WHERE flow_key = 'admission' AND state = 'in_progress' AND current_step LIKE ? ORDER BY id DESC LIMIT 1").get(`record:${recordId}:%`);
    if (row) return row;
    const result = this.db.prepare("INSERT INTO flow_instances (flow_key, current_step) VALUES ('admission', ?)").run(`record:${recordId}:gate`);
    this.updateRecord(recordId, { canonStatus: "under review" });
    return this.db.prepare("SELECT * FROM flow_instances WHERE id = ?").get(result.lastInsertRowid);
  }

  completeAdmissionGate(input: {
    recordId: number;
    title?: string;
    body?: string;
    truthLayer: string;
    canonStatus: string;
    constraintTags?: string[];
    operations: string[];
    consequenceText?: string;
    notApplicableReasons?: string[];
    quietDomainDeclarations?: string[];
    followUpDebt?: string;
    advisoryRecordId?: number;
  }): { record: RecordRow; gateResult: RecordRow; warnings: RecordRow[] } {
    const current = this.getRecord(input.recordId);
    const gate = this.gateComposition(input.recordId) as { path: string };
    if (!input.operations.length) throw new Error("admission gate requires at least one admission operation");
    if (gate.path === "full_gate") {
      if (!input.consequenceText?.trim()) throw new Error("full gate requires written consequence text");
      if ((input.notApplicableReasons ?? []).some((reason) => !reason.trim())) throw new Error("n/a gate items require a reason");
      if ((input.quietDomainDeclarations ?? []).some((declaration) => !declaration.trim())) throw new Error("quiet domains require a declaration");
    }
    this.assertAllowedStatusTransition(current.canonStatus, input.canonStatus);
    return this.db.transaction(() => {
      const warnings = this.openCanonDebtWarnings(input.recordId);
      const record = this.updateRecord(input.recordId, {
        title: input.title ?? current.title,
        body: input.body ?? current.body,
        truthLayer: input.truthLayer,
        canonStatus: input.canonStatus
      });
      this.replaceAllFacets(record.id, "constraint_tag", input.constraintTags ?? []);
      input.operations.forEach((operation) => this.recordJurisdictionEvent(record.id, "admission", operation));
      const gateResult = this.createRecord({
        recordTypeKey: "gate_result",
        title: `Gate result: ${record.shortId}`,
        body: [
          `Record: ${record.shortId} ${record.title}`,
          `Status: ${input.canonStatus}`,
          `Operations: ${input.operations.join(", ")}`,
          `Consequence: ${input.consequenceText ?? "minor or not supplied"}`,
          `N/A reasons: ${(input.notApplicableReasons ?? []).join("; ") || "none"}`,
          `Quiet domains: ${(input.quietDomainDeclarations ?? []).join("; ") || "none"}`,
          `Follow-up debt: ${input.followUpDebt ?? "none"}`
        ].join("\n"),
        truthLayer: "Objective canon",
        canonStatus: input.canonStatus === "rejected" ? "rejected" : "accepted"
      });
      this.createLink(record.id, gateResult.id, "derived_from", "Admission gate result");
      if (input.advisoryRecordId != null) {
        this.createLink(record.id, input.advisoryRecordId, "derived_from", "Admission decision informed by advisory material");
        this.createLink(record.id, input.advisoryRecordId, "cites_advisory_artifact", "Verbatim admission advisory artifact consulted");
      }
      if (input.followUpDebt) {
        this.createCanonDebt({ name: `Propagation owed for ${record.shortId}`, scope: "propagation", assignee: "steward", body: input.followUpDebt });
      }
      this.db.prepare("UPDATE flow_instances SET state = 'complete', current_step = ? WHERE flow_key = 'admission' AND state = 'in_progress' AND current_step LIKE ?").run(`record:${record.id}:complete`, `record:${record.id}:%`);
      return { record, gateResult, warnings };
    })();
  }

  runSeedAudit(input: { seedRecordIds: number[]; findings: string; decision: string }): { report: RecordRow; seeds: RecordRow[] } {
    if (!input.seedRecordIds.length) throw new Error("seed audit requires at least one seed");
    const seeds = input.seedRecordIds.map((id) => this.getRecord(id));
    return this.db.transaction(() => {
      const report = this.createRecord({
        recordTypeKey: "gate_result",
        title: "Frontloaded seed audit",
        body: [
          `Seeds: ${seeds.map((seed) => seed.shortId).join(", ")}`,
          `Findings: ${input.findings}`,
          `Decision: ${input.decision}`,
          "Audit proposes; it does not admit or mutate seed judgment fields."
        ].join("\n"),
        truthLayer: "Objective canon",
        canonStatus: "proposed"
      });
      for (const seed of seeds) this.createLink(seed.id, report.id, "derived_from", "Frontloaded seed audit report");
      return { report, seeds: input.seedRecordIds.map((id) => this.getRecord(id)) };
    })();
  }

  declineAdmissionInstrument(input: { recordId?: number; stepKey: string; admissionLevel?: string; workScale?: string; reason?: string }): RecordRow {
    if (requiresSkipReason({ admissionLevel: input.admissionLevel ?? null, workScale: input.workScale ?? null }) && !input.reason?.trim()) {
      throw new Error("major admission skips require a reason");
    }
    const record = this.recordSkip({ stepKey: input.stepKey, reason: input.reason });
    if (input.recordId != null) this.createLink(record.id, input.recordId, "derived_from", "Admission instrument declined");
    return record;
  }

  createCanonDebt(input: { name: string; scope: string; assignee: string; body?: string }): RecordRow {
    return this.createRecord({
      recordTypeKey: "canon_debt",
      title: input.name,
      body: [`Scope: ${input.scope}`, `Assignee: ${input.assignee}`, `State: open`, input.body ?? ""].filter(Boolean).join("\n"),
      truthLayer: "Objective canon",
      canonStatus: "under review"
    });
  }

  listCanonDebt(openOnly = false): RecordRow[] {
    const rows = this.db.prepare(`
      SELECT * FROM records
      WHERE record_type_key = 'canon_debt'
        AND (@openOnly = 0 OR canon_status != 'accepted')
      ORDER BY updated_at DESC, id DESC
    `).all({ openOnly: openOnly ? 1 : 0 });
    return rows.map((row) => rowToRecord(row as Record<string, unknown>));
  }

  closeCanonDebt(id: number): RecordRow {
    const debt = this.getRecord(id);
    if (debt.recordTypeKey !== "canon_debt") throw new Error("only canon debt can be closed through this route");
    return this.updateRecord(id, { body: `${debt.body}\nState: closed`, canonStatus: "accepted" });
  }

  propagationQueue(): PropagationQueueRow[] {
    return propagationFlowQueue(this);
  }

  propagationPlan(recordId: number): unknown {
    return propagationFlowPlan(this, recordId);
  }

  startPropagationRun(input: { factRecordId: number; debtRecordId?: number }): unknown {
    return startPropagationFlowRun(this, input);
  }

  getPropagationRun(flowId: number): unknown {
    return getPropagationFlowRun(this, flowId);
  }

  addPropagationConsequence(input: { flowId: number; orderKey: string; domainName?: string; body: string; pressure?: "normal" | "high" }): PropagationConsequenceRow {
    return addPropagationFlowConsequence(this, input);
  }

  recordPropagationDomain(input: { flowId: number; domainName: string; triage: "direct" | "dependency" | "reaction" | "negative"; declaration?: string }): PropagationDomainSweepRow {
    return recordPropagationFlowDomain(this, input);
  }

  dispositionPropagationConsequence(input: { consequenceId: number; disposition: string; note?: string; debtName?: string; preservationBoundary?: string }): PropagationDispositionRow {
    return dispositionPropagationFlowConsequence(this, input);
  }

  proposeFactFromPropagation(input: { flowId: number; title: string; body: string; truthLayer: string }): { record: RecordRow; queue: AdmissionQueueRow[] } {
    return proposeFactFromPropagationFlow(this, input);
  }

  skipPropagationStep(input: { flowId?: number; stepKey: string; admissionLevel?: string; workScale?: string; reason?: string }): RecordRow {
    return skipPropagationFlowStep(this, input);
  }

  closePropagationRun(flowId: number): { flow: unknown; report: RecordRow; debt: RecordRow | null; missing: PropagationConsequenceRow[] } {
    return closePropagationFlowRun(this, flowId);
  }

  correctPropagationReport(input: { originalReportId: number; title?: string; body: string }): RecordRow {
    return correctPropagationFlowReport(this, input);
  }

  startContradictionRun(input: { sourceRecordId?: number; implicatedRecordIds?: number[]; title?: string }): unknown {
    return startContradictionFlowRun(this, input);
  }

  getContradictionRun(flowId: number): unknown {
    return getContradictionFlowRun(this, flowId);
  }

  recordContradictionTriage(input: { flowId: number; stepKey: string; body: string }): unknown {
    return recordContradictionFlowTriage(this, input);
  }

  declareContradictionWorkScale(input: { flowId: number; workScale: string }): unknown {
    return declareContradictionFlowWorkScale(this, input);
  }

  setContradictionDisposition(input: { flowId: number; disposition: string; note?: string }): unknown {
    return setContradictionFlowDisposition(this, input);
  }

  recordContradictionRepair(input: { flowId: number; operations: string[]; repairText: string }): unknown[] {
    return recordContradictionFlowRepair(this, input);
  }

  addContradictionRepairTarget(input: { flowId: number; recordId: number; nextCanonStatus: string; newTitle?: string; newBody?: string; note?: string; advisoryRecordId?: number }): unknown {
    return addContradictionFlowRepairTarget(this, input);
  }

  proposeFactFromContradiction(input: { flowId: number; title: string; body: string; truthLayer: string }): { record: RecordRow; queue: AdmissionQueueRow[] } {
    return proposeFactFromContradictionFlow(this, input);
  }

  recordContradictionRetconCosts(input: { flowId: number; retconType: string; costs: Array<{ cost: string; text: string }> }): unknown[] {
    return recordContradictionFlowRetconCosts(this, input);
  }

  setContradictionRepairPropagation(input: { flowId: number; action: "assign" | "decline"; debtName?: string; body?: string; admissionLevel?: string; workScale?: string; reason?: string }): ContradictionRepairPropagationRow {
    return setContradictionFlowRepairPropagation(this, input);
  }

  owedBoundariesQueue(): OwedBoundaryRow[] {
    return contradictionFlowOwedBoundariesQueue(this);
  }

  createMysteryLedgerEntry(input: {
    propagationDispositionId?: number;
    ledgerRecordId?: number;
    title: string;
    protectedRecordId: number;
    propagationReportRecordId?: number;
    effectType: string;
    mysteryState: string;
    preservationBoundary: string;
    sections: Record<string, string>;
  }): { record: RecordRow; queue: OwedBoundaryRow[] } {
    return createContradictionFlowMysteryLedgerEntry(this, input);
  }

  completeMysteryPreservationChecklist(input: { flowId?: number; ledgerRecordId?: number; protectedRecordId?: number; operation: string; effectType: string; body: string; sacredGuardBody?: string }): MysteryChecklistRow {
    return completeMysteryFlowPreservationChecklist(this, input);
  }

  skipContradictionStep(input: { flowId?: number; stepKey: string; admissionLevel?: string; workScale?: string; reason?: string }): RecordRow {
    return skipContradictionFlowStep(this, input);
  }

  closeContradictionRun(flowId: number): { flow: unknown; report: RecordRow } {
    return closeContradictionFlowRun(this, flowId);
  }

  createLink(fromRecordId: number, toRecordId: number, linkTypeKey: string, note = ""): LinkRow {
    this.assertLinkType(linkTypeKey);
    const result = this.db.prepare(`
      INSERT INTO record_links (from_record_id, to_record_id, link_type_key, note)
      VALUES (?, ?, ?, ?)
    `).run(fromRecordId, toRecordId, linkTypeKey, note);
    return rowToLink(this.db.prepare("SELECT * FROM record_links WHERE id = ?").get(result.lastInsertRowid) as Record<string, unknown>);
  }

  listLinks(recordId?: number): LinkRow[] {
    if (recordId == null) {
      return this.db.prepare("SELECT * FROM record_links ORDER BY id").all().map((row) => rowToLink(row as Record<string, unknown>));
    }
    return this.db.prepare(`
      SELECT * FROM record_links
      WHERE from_record_id = ? OR to_record_id = ?
      ORDER BY id
    `).all(recordId, recordId).map((row) => rowToLink(row as Record<string, unknown>));
  }

  traverse(recordId: number, linkTypeKey?: string): TraversalRow[] {
    return this.db.prepare(`
      WITH RECURSIVE walk(id, from_record_id, to_record_id, link_type_key, note, created_at, depth) AS (
        SELECT id, from_record_id, to_record_id, link_type_key, note, created_at, 1
        FROM record_links
        WHERE from_record_id = @recordId
          AND (@linkTypeKey IS NULL OR link_type_key = @linkTypeKey)
        UNION ALL
        SELECT rl.id, rl.from_record_id, rl.to_record_id, rl.link_type_key, rl.note, rl.created_at, walk.depth + 1
        FROM record_links rl
        JOIN walk ON rl.from_record_id = walk.to_record_id
        WHERE walk.depth < 32
          AND (@linkTypeKey IS NULL OR rl.link_type_key = @linkTypeKey)
      )
      SELECT * FROM walk ORDER BY depth, id
    `).all({ recordId, linkTypeKey: linkTypeKey ?? null }).map((row) => ({
      ...rowToLink(row as Record<string, unknown>),
      depth: Number((row as Record<string, unknown>).depth)
    }));
  }

  search(query: string): RecordRow[] {
    const trimmed = query.trim();
    if (!trimmed) return [];
    return this.db.prepare(`
      SELECT r.*
      FROM records_fts f
      JOIN records r ON r.id = f.rowid
      WHERE records_fts MATCH ?
      ORDER BY bm25(records_fts, -3.0, -8.0, -1.0), r.updated_at DESC
      LIMIT 50
    `).all(trimmed).map((row) => rowToRecord(row as Record<string, unknown>));
  }

  vocabularies(): unknown[] {
    return this.db.prepare("SELECT * FROM vocabulary_terms ORDER BY vocabulary, term").all();
  }

  history(recordId: number): unknown[] {
    return this.db.prepare("SELECT * FROM record_history WHERE record_id = ? ORDER BY sequence").all(recordId);
  }

  private configureConnection(): void {
    this.db.pragma("foreign_keys = ON");
    this.db.pragma("busy_timeout = 5000");
  }

  private migrate(options: { backupBeforeMigration: boolean }): void {
    const version = Number(this.db.pragma("user_version", { simple: true }));
    if (version > CURRENT_SCHEMA_VERSION) {
      throw new Error(`World schema ${version} is newer than this app supports (${CURRENT_SCHEMA_VERSION})`);
    }
    if (version < CURRENT_SCHEMA_VERSION && options.backupBeforeMigration) {
      this.snapshot(this.backupPath(`pre-migration-v${version}-to-v${CURRENT_SCHEMA_VERSION}`));
    }
    if (version === 0) {
      this.db.exec("BEGIN");
      try {
        this.db.exec(migration001);
        this.db.exec("COMMIT");
      } catch (error) {
        this.db.exec("ROLLBACK");
        throw error;
      }
    }
    if (version < 2) {
      this.db.exec("BEGIN");
      try {
        this.db.exec(migration002);
        this.db.exec("COMMIT");
      } catch (error) {
        this.db.exec("ROLLBACK");
        throw error;
      }
    }
    if (version < 3) {
      this.db.exec("BEGIN");
      try {
        this.db.exec(migration003);
        this.db.exec("COMMIT");
      } catch (error) {
        this.db.exec("ROLLBACK");
        throw error;
      }
    }
    if (version < 4) {
      this.db.exec("BEGIN");
      try {
        this.db.exec(migration004);
        this.db.exec("COMMIT");
      } catch (error) {
        this.db.exec("ROLLBACK");
        throw error;
      }
    }
    this.ensurePromptTemplates();
    this.db.pragma("journal_mode = WAL");
  }

  private assertIntegrity(): void {
    const result = this.db.pragma("integrity_check", { simple: true });
    if (result !== "ok") {
      throw new Error(`SQLite integrity check failed: ${String(result)}`);
    }
  }

  private assertApplicationIdCanOpen(): void {
    const appId = Number(this.db.pragma("application_id", { simple: true }));
    const version = Number(this.db.pragma("user_version", { simple: true }));
    if (version > 0 && appId !== APPLICATION_ID) {
      throw new Error("This is not a Worldloom world file");
    }
  }

  private nextShortId(recordTypeKey: string): string {
    const recordType = RECORD_TYPE_BY_KEY.get(recordTypeKey);
    if (!recordType) throw new Error(`Unknown record type: ${recordTypeKey}`);
    const transaction = this.db.transaction(() => {
      const row = this.db.prepare("SELECT next_value FROM record_type_sequences WHERE record_type_key = ?").get(recordTypeKey) as { next_value: number } | undefined;
      if (!row) throw new Error(`No sequence for record type: ${recordTypeKey}`);
      this.db.prepare("UPDATE record_type_sequences SET next_value = next_value + 1 WHERE record_type_key = ?").run(recordTypeKey);
      return `${recordType.namespace}-${row.next_value}`;
    });
    return transaction();
  }

  private assertRecordType(recordTypeKey: string) {
    const recordType = RECORD_TYPE_BY_KEY.get(recordTypeKey);
    if (!recordType) {
      throw new Error(`Unknown record type: ${recordTypeKey}`);
    }
    return recordType;
  }

  private assertLinkType(linkTypeKey: string): void {
    if (!LINK_TYPES.some((linkType) => linkType.key === linkTypeKey)) {
      throw new Error(`Unknown link type: ${linkTypeKey}`);
    }
  }

  private assertVocabularyTerm(vocabulary: string, term: string): void {
    const row = this.db.prepare("SELECT 1 FROM vocabulary_terms WHERE vocabulary = ? AND term = ?").get(vocabulary, term);
    if (!row) throw new Error(`Unknown ${vocabulary} term: ${term}`);
  }

  private withAdmissionFacets(record: RecordRow): AdmissionQueueRow {
    const facets = this.listFacets(record.id);
    return {
      ...record,
      admissionLevel: facets.find((facet) => facet.vocabulary === "admission_level")?.term ?? null,
      workScale: facets.find((facet) => facet.vocabulary === "work_scale")?.term ?? null,
      constraintTags: facets.filter((facet) => facet.vocabulary === "constraint_tag").map((facet) => facet.term)
    };
  }

  private declaredSeverityFromFacets(facets: FacetRow[]): DeclaredSeverity {
    return {
      admissionLevel: facets.find((facet) => facet.vocabulary === "admission_level")?.term ?? null,
      workScale: facets.find((facet) => facet.vocabulary === "work_scale")?.term ?? null
    };
  }

  private replaceSingleFacet(recordId: number, vocabulary: string, term: string): void {
    this.replaceAllFacets(recordId, vocabulary, [term]);
  }

  private replaceAllFacets(recordId: number, vocabulary: string, terms: string[]): void {
    this.getRecord(recordId);
    terms.forEach((term) => this.assertVocabularyTerm(vocabulary, term));
    this.db.prepare("DELETE FROM record_facets WHERE record_id = ? AND vocabulary = ?").run(recordId, vocabulary);
    terms.forEach((term, index) => this.addFacet(recordId, { vocabulary, term, position: index + 1 }));
  }

  private recordJurisdictionEvent(recordId: number, origin: "admission" | "repair" | "sweep", admissionOperation?: string): void {
    this.getRecord(recordId);
    if (admissionOperation) this.assertVocabularyTerm("admission_decision_operation", admissionOperation);
    this.db.prepare(`
      INSERT INTO jurisdiction_events (record_id, origin, admission_decision_operation)
      VALUES (?, ?, ?)
    `).run(recordId, origin, admissionOperation ?? null);
  }

  private recordProposeProvenance(recordId: number, flowStep: string): void {
    const record = this.getRecord(recordId);
    const provenance = this.createRecord({
      recordTypeKey: "canon_change_proposal",
      title: `Propose: ${record.shortId}`,
      body: [
        `Actor: steward`,
        `Flow step: ${flowStep}`,
        `Record: ${record.shortId} ${record.title}`,
        "Proposing routes the record to the universal admission queue and does not mutate judgment fields."
      ].join("\n"),
      truthLayer: record.truthLayer ?? "disputed claim",
      canonStatus: "proposed"
    });
    this.createLink(record.id, provenance.id, "derived_from", "Propose action provenance");
  }

  private assertAllowedStatusTransition(current: string | null, next: string): void {
    this.assertVocabularyTerm("canon_status", next);
    const allowed: Record<string, string[]> = {
      proposed: ["under review", "accepted", "accepted with constraints", "localized", "contested", "quarantined", "branch-only", "rejected"],
      "under review": ["proposed", "accepted", "accepted with constraints", "localized", "contested", "quarantined", "branch-only", "rejected"],
      accepted: ["superseded", "deprecated"],
      "accepted with constraints": ["superseded", "deprecated"],
      localized: ["superseded", "deprecated"],
      contested: ["under review", "quarantined", "rejected"],
      quarantined: ["under review", "rejected"],
      "branch-only": ["superseded", "deprecated"],
      superseded: [],
      deprecated: [],
      rejected: []
    };
    if (current && current !== next && !allowed[current]?.includes(next)) {
      throw new Error(`illegal canon status transition: ${current} -> ${next}`);
    }
  }

  private openCanonDebtWarnings(recordId: number): RecordRow[] {
    return warnsForOpenCanonDebt(this.declaredSeverityFromFacets(this.listFacets(recordId))) ? this.listCanonDebt(true) : [];
  }

  private nextFacetPosition(recordId: number, vocabulary: string): number {
    const row = this.db.prepare("SELECT COALESCE(MAX(position), 0) + 1 AS next FROM record_facets WHERE record_id = ? AND vocabulary = ?").get(recordId, vocabulary) as { next: number };
    return row.next;
  }

  private recordPromptContext(recordId: number): string {
    const record = this.getRecord(recordId);
    const sections = this.listSections(recordId);
    return [
      `${record.shortId} ${record.title}`,
      `Type: ${record.recordTypeKey}`,
      `Truth layer: ${record.truthLayer ?? "unset"}`,
      `Canon status: ${record.canonStatus ?? "unset"}`,
      record.body,
      ...sections.map((section) => `## ${section.heading}\n${section.body}`)
    ].filter(Boolean).join("\n");
  }

  private standingRulings(): Array<{ disposition: string; note: string }> {
    return this.db.prepare("SELECT disposition, note FROM advisory_dispositions WHERE standing_ruling = 1 ORDER BY id").all() as Array<{ disposition: string; note: string }>;
  }

  private ensurePromptTemplates(): void {
    const templates = [
      {
        key: "admission_prerequisite_audit",
        roleName: "Prerequisite auditor",
        text: "Pressure-test this proposed fact statement and its dependencies. Identify hard, soft, economic, institutional, temporal, spatial, and psychological prerequisites; flag any prerequisite that needs its own admission."
      },
      {
        key: "admission_constraint_challenge",
        roleName: "Constraint challenger",
        text: "Challenge the proposed capability, access, cost, and constraints. Look for hostile optimization, cheap countermeasures, missing prices, quiet domains, and places where a constraint should be typed rather than hidden in prose."
      },
      {
        key: "propagation_consequence_scout",
        roleName: "Consequence scout",
        text: "Pressure-test this propagation step. Work from the steward material first, then list direct consequences, adaptations, countermeasures, fossils, quiet domains, and assumptions. Do not admit facts; label any surfaced fact as proposed-only."
      },
      {
        key: "repair_challenge",
        roleName: "Contradiction hunter",
        text: "Pressure-test the quoted claims, chosen repair operation, retcon costs, status changes, and propagation obligations. Suggest repair pressure only; do not decide canon standing."
      },
      {
        key: "boundary_guard",
        roleName: "Mystery guardian",
        text: "Pressure-test the preservation boundary, protected effect type, explanation-pressure operation, reveal permissions, reveal prohibitions, and sacred-opacity accountability. Protect consequence; do not solve by default."
      }
    ];
    this.db.transaction(() => {
      for (const template of templates) {
        this.db.prepare(`
          INSERT OR IGNORE INTO prompt_templates (key, role_name, original_text, package_source)
          VALUES (?, ?, ?, 'docs/worldbuilding-system/20_ai_assisted_workflow.md')
        `).run(template.key, template.roleName, template.text);
        this.db.prepare(`
          INSERT OR IGNORE INTO prompt_template_versions (template_key, version, text)
          VALUES (?, 1, ?)
        `).run(template.key, template.text);
      }
    })();
  }

  private backupPath(label: string): string {
    const timestamp = new Date().toISOString().replaceAll(/[:.]/g, "-");
    return `${this.path}.${label}.${timestamp}.sqlite`;
  }
}
