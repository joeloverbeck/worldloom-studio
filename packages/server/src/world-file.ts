import Database from "better-sqlite3";
import { basename, dirname, join, resolve } from "node:path";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { APPLICATION_ID, CURRENT_SCHEMA_VERSION, migration001, migration002, migration003, migration004, migration005, migration006, migration007, migration008 } from "./schema.js";
import { LINK_TYPES, RECORD_TYPES, RECORD_TYPE_BY_KEY } from "@worldloom/shared";

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

export interface MarkdownWorldExportResult {
  directory: string;
  indexPath: string;
  files: string[];
}

export interface AdmissionQueueRow extends RecordRow {
  admissionLevel: string | null;
  workScale: string | null;
  constraintTags: string[];
}

export type FlowInstanceRow = Record<string, unknown>;

export interface QaTestCatalogRow {
  number: number;
  name: string;
  cluster: string;
  packageSource: string;
  failureSmell: string;
  anchors: {
    weak: string;
    adequate: string;
    strong: string;
  };
  modeBenchmark: string;
}

export interface QaScoreRow {
  id: number;
  flowId: number;
  qaPassRecordId: number;
  testNumber: number;
  score: "0" | "1" | "2" | "3" | "na";
  naReason: string;
  notes: string;
  requiredRepair: string;
  loadBearing: boolean;
  repairRouted: boolean;
  flowStep: string;
  createdAt: string;
  updatedAt: string;
}

type FlowInstanceInput = {
  flowKey: string;
  currentStep: string;
  kernelRecordId?: number | null;
  propagationFactRecordId?: number | null;
  propagationDebtRecordId?: number | null;
  propagationReportRecordId?: number | null;
  contradictionSourceRecordId?: number | null;
  contradictionReportRecordId?: number | null;
  qaSubjectRecordId?: number | null;
  qaPassRecordId?: number | null;
};

type FlowInstanceUpdate = Partial<Omit<FlowInstanceInput, "flowKey"> & { state: string }>;

type ExportEntry = {
  record: RecordRow;
  filename: string;
  markdown: string;
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

const rowToQaTestCatalog = (row: Record<string, unknown>): QaTestCatalogRow => ({
  number: Number(row.number),
  name: String(row.name),
  cluster: String(row.cluster),
  packageSource: String(row.package_source),
  failureSmell: String(row.failure_smell),
  anchors: {
    weak: String(row.weak_anchor),
    adequate: String(row.adequate_anchor),
    strong: String(row.strong_anchor)
  },
  modeBenchmark: String(row.mode_benchmark)
});

const rowToQaScore = (row: Record<string, unknown>): QaScoreRow => ({
  id: Number(row.id),
  flowId: Number(row.flow_id),
  qaPassRecordId: Number(row.qa_pass_record_id),
  testNumber: Number(row.test_number),
  score: String(row.score) as QaScoreRow["score"],
  naReason: String(row.na_reason ?? ""),
  notes: String(row.notes ?? ""),
  requiredRepair: String(row.required_repair ?? ""),
  loadBearing: Number(row.load_bearing) === 1,
  repairRouted: Number(row.repair_routed) === 1,
  flowStep: String(row.flow_step),
  createdAt: String(row.created_at),
  updatedAt: String(row.updated_at)
});

const quoteSqlPath = (path: string): string => `'${path.replaceAll("'", "''")}'`;

export class WorldFile {
  readonly db: Database.Database;
  readonly path: string;

  private constructor(path: string, db: Database.Database) {
    this.path = path;
    this.db = db;
  }

  static create(path: string): WorldFile {
    const resolved = resolve(path);
    mkdirSync(dirname(resolved), { recursive: true });
    const db = new Database(resolved);
    const store = new WorldFile(resolved, db);
    store.configureConnection();
    store.migrate({ backupBeforeMigration: false });
    return store;
  }

  static open(path: string): WorldFile {
    if (!existsSync(path)) {
      throw new Error(`World file does not exist: ${path}`);
    }
    const resolved = resolve(path);
    const db = new Database(resolved);
    const store = new WorldFile(resolved, db);
    store.configureConnection();
    store.assertIntegrity();
    store.assertApplicationIdCanOpen();
    store.migrate({ backupBeforeMigration: true });
    return store;
  }

  close(): void {
    this.db.close();
  }

  atomicWrite<T>(operation: () => T): T {
    return this.db.transaction(operation)();
  }

  snapshot(destinationPath?: string): string {
    const destination = destinationPath ? resolve(destinationPath) : this.backupPath("snapshot");
    mkdirSync(dirname(destination), { recursive: true });
    this.db.exec(`VACUUM INTO ${quoteSqlPath(destination)}`);
    return destination;
  }

  exportRecordMarkdown(recordId: number): string {
    return this.renderRecordMarkdown(this.getRecord(recordId));
  }

  exportWorldMarkdown(destinationPath: string): MarkdownWorldExportResult {
    if (!destinationPath?.trim()) throw new Error("markdown export requires a destination directory");
    const destination = resolve(destinationPath);
    mkdirSync(destination, { recursive: true });
    this.removePreviousMarkdownExportFiles(destination);

    const entries = this.recordsForMarkdownExport().map((record) => ({
      record,
      filename: this.markdownFilename(record),
      markdown: this.renderRecordMarkdown(record)
    }));

    for (const entry of entries) {
      writeFileSync(join(destination, entry.filename), entry.markdown, "utf8");
    }

    const index = this.renderMarkdownIndex(entries);
    const indexPath = join(destination, "index.md");
    writeFileSync(indexPath, index, "utf8");
    return { directory: destination, indexPath, files: [...entries.map((entry) => entry.filename), "index.md"] };
  }

  integrityCheck(): string {
    return String(this.db.pragma("integrity_check", { simple: true }));
  }

  schemaVersion(): number {
    return Number(this.db.pragma("user_version", { simple: true }));
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

  getDraft(id: number): DraftRow {
    const row = this.db.prepare("SELECT * FROM drafts WHERE id = ?").get(id);
    if (!row) throw new Error(`Draft not found: ${id}`);
    return rowToDraft(row as Record<string, unknown>);
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

  findLatestInProgressFlow(flowKey: string): FlowInstanceRow | null {
    return (this.db.prepare("SELECT * FROM flow_instances WHERE flow_key = ? AND state = 'in_progress' ORDER BY id DESC LIMIT 1").get(flowKey) as FlowInstanceRow | undefined) ?? null;
  }

  findLatestInProgressFlowByStepPrefix(flowKey: string, stepPrefix: string): FlowInstanceRow | null {
    return (this.db.prepare("SELECT * FROM flow_instances WHERE flow_key = ? AND state = 'in_progress' AND current_step LIKE ? ORDER BY id DESC LIMIT 1").get(flowKey, `${stepPrefix}%`) as FlowInstanceRow | undefined) ?? null;
  }

  getFlowInstance(id: number, flowKey?: string): FlowInstanceRow {
    const row = flowKey
      ? this.db.prepare("SELECT * FROM flow_instances WHERE id = ? AND flow_key = ?").get(id, flowKey)
      : this.db.prepare("SELECT * FROM flow_instances WHERE id = ?").get(id);
    if (!row) throw new Error(flowKey ? `${flowKey} flow not found: ${id}` : `Flow not found: ${id}`);
    return row as FlowInstanceRow;
  }

  createFlowInstance(input: FlowInstanceInput): FlowInstanceRow {
    const result = this.db.prepare(`
      INSERT INTO flow_instances (
        flow_key,
        current_step,
        kernel_record_id,
        propagation_fact_record_id,
        propagation_debt_record_id,
        propagation_report_record_id,
        contradiction_source_record_id,
        contradiction_report_record_id,
        qa_subject_record_id,
        qa_pass_record_id
      )
      VALUES (
        @flowKey,
        @currentStep,
        @kernelRecordId,
        @propagationFactRecordId,
        @propagationDebtRecordId,
        @propagationReportRecordId,
        @contradictionSourceRecordId,
        @contradictionReportRecordId,
        @qaSubjectRecordId,
        @qaPassRecordId
      )
    `).run({
      flowKey: input.flowKey,
      currentStep: input.currentStep,
      kernelRecordId: input.kernelRecordId ?? null,
      propagationFactRecordId: input.propagationFactRecordId ?? null,
      propagationDebtRecordId: input.propagationDebtRecordId ?? null,
      propagationReportRecordId: input.propagationReportRecordId ?? null,
      contradictionSourceRecordId: input.contradictionSourceRecordId ?? null,
      contradictionReportRecordId: input.contradictionReportRecordId ?? null,
      qaSubjectRecordId: input.qaSubjectRecordId ?? null,
      qaPassRecordId: input.qaPassRecordId ?? null
    });
    return this.getFlowInstance(Number(result.lastInsertRowid));
  }

  updateFlowInstance(id: number, input: FlowInstanceUpdate): FlowInstanceRow {
    const columns: Array<[keyof FlowInstanceUpdate, string]> = [
      ["state", "state"],
      ["currentStep", "current_step"],
      ["kernelRecordId", "kernel_record_id"],
      ["propagationFactRecordId", "propagation_fact_record_id"],
      ["propagationDebtRecordId", "propagation_debt_record_id"],
      ["propagationReportRecordId", "propagation_report_record_id"],
      ["contradictionSourceRecordId", "contradiction_source_record_id"],
      ["contradictionReportRecordId", "contradiction_report_record_id"],
      ["qaSubjectRecordId", "qa_subject_record_id"],
      ["qaPassRecordId", "qa_pass_record_id"]
    ];
    const setClauses: string[] = [];
    const values: Record<string, unknown> = { id };
    for (const [key, column] of columns) {
      if (key in input) {
        setClauses.push(`${column} = @${key}`);
        values[key] = input[key] ?? null;
      }
    }
    if (!setClauses.length) return this.getFlowInstance(id);
    this.db.prepare(`UPDATE flow_instances SET ${setClauses.join(", ")} WHERE id = @id`).run(values);
    return this.getFlowInstance(id);
  }

  completeAdmissionFlowsForRecord(recordId: number): void {
    this.db.prepare("UPDATE flow_instances SET state = 'complete', current_step = ? WHERE flow_key = 'admission' AND state = 'in_progress' AND current_step LIKE ?")
      .run(`record:${recordId}:complete`, `record:${recordId}:%`);
  }

  findInProgressPropagationFlow(factRecordId: number, debtRecordId?: number): FlowInstanceRow | null {
    return (this.db.prepare(`
      SELECT * FROM flow_instances
      WHERE flow_key = 'propagation'
        AND state = 'in_progress'
        AND propagation_fact_record_id = ?
        AND COALESCE(propagation_debt_record_id, 0) = COALESCE(?, 0)
      ORDER BY id DESC
      LIMIT 1
    `).get(factRecordId, debtRecordId ?? null) as FlowInstanceRow | undefined) ?? null;
  }

  propagationQueueRecordIds(): number[] {
    return (this.db.prepare(`
      SELECT id
      FROM records
      WHERE record_type_key = 'canon_debt'
        AND canon_status != 'accepted'
        AND (
          lower(body) LIKE '%scope: propagation%'
          OR lower(title) LIKE '%propagation owed%'
        )
      ORDER BY updated_at DESC, id DESC
    `).all() as Array<{ id: number }>).map((row) => row.id);
  }

  propagationConsequences(flowId: number): FlowInstanceRow[] {
    return this.db.prepare("SELECT * FROM propagation_consequences WHERE flow_id = ? ORDER BY id").all(flowId) as FlowInstanceRow[];
  }

  propagationDomainSweeps(flowId: number): FlowInstanceRow[] {
    return this.db.prepare("SELECT * FROM propagation_domain_sweeps WHERE flow_id = ? ORDER BY id").all(flowId) as FlowInstanceRow[];
  }

  propagationDispositions(flowId: number): FlowInstanceRow[] {
    return this.db.prepare(`
      SELECT d.*
      FROM propagation_consequence_dispositions d
      JOIN propagation_consequences c ON c.id = d.consequence_id
      WHERE c.flow_id = ?
      ORDER BY d.id
    `).all(flowId) as FlowInstanceRow[];
  }

  undispositionedHighPressurePropagationConsequences(flowId: number): FlowInstanceRow[] {
    return this.db.prepare(`
      SELECT c.*
      FROM propagation_consequences c
      LEFT JOIN propagation_consequence_dispositions d ON d.consequence_id = c.id
      WHERE c.flow_id = ?
        AND c.pressure = 'high'
        AND d.id IS NULL
      ORDER BY c.id
    `).all(flowId) as FlowInstanceRow[];
  }

  insertPropagationConsequence(input: {
    flowId: number;
    factRecordId: number;
    orderKey: string;
    orderLabel: string;
    domainName?: string;
    body: string;
    pressure: "normal" | "high";
    flowStep: string;
  }): FlowInstanceRow {
    const result = this.db.prepare(`
      INSERT INTO propagation_consequences (flow_id, fact_record_id, order_key, order_label, domain_name, body, pressure, flow_step)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(input.flowId, input.factRecordId, input.orderKey, input.orderLabel, input.domainName ?? null, input.body, input.pressure, input.flowStep);
    return this.db.prepare("SELECT * FROM propagation_consequences WHERE id = ?").get(result.lastInsertRowid) as FlowInstanceRow;
  }

  upsertPropagationDomainSweep(input: { flowId: number; domainName: string; triage: string; declaration?: string }): FlowInstanceRow {
    this.db.prepare(`
      INSERT INTO propagation_domain_sweeps (flow_id, domain_name, triage, declaration, flow_step)
      VALUES (?, ?, ?, ?, 'propagation:domain-atlas')
      ON CONFLICT(flow_id, domain_name) DO UPDATE SET
        triage = excluded.triage,
        declaration = excluded.declaration,
        flow_step = excluded.flow_step
    `).run(input.flowId, input.domainName, input.triage, input.declaration ?? "");
    return this.db.prepare("SELECT * FROM propagation_domain_sweeps WHERE flow_id = ? AND domain_name = ?").get(input.flowId, input.domainName) as FlowInstanceRow;
  }

  getPropagationConsequence(consequenceId: number): FlowInstanceRow | null {
    return (this.db.prepare("SELECT * FROM propagation_consequences WHERE id = ?").get(consequenceId) as FlowInstanceRow | undefined) ?? null;
  }

  insertPropagationDisposition(input: { consequenceId: number; disposition: string; note?: string; preservationBoundary?: string; debtRecordId?: number | null }): FlowInstanceRow {
    const result = this.db.prepare(`
      INSERT INTO propagation_consequence_dispositions (consequence_id, disposition, note, preservation_boundary, debt_record_id, flow_step)
      VALUES (?, ?, ?, ?, ?, 'propagation:disposition')
    `).run(input.consequenceId, input.disposition, input.note ?? "", input.preservationBoundary ?? null, input.debtRecordId ?? null);
    return this.db.prepare("SELECT * FROM propagation_consequence_dispositions WHERE id = ?").get(result.lastInsertRowid) as FlowInstanceRow;
  }

  propagationSurfacedProposals(flowId: number): FlowInstanceRow[] {
    return this.db.prepare("SELECT * FROM propagation_surfaced_proposals WHERE flow_id = ? ORDER BY id").all(flowId) as FlowInstanceRow[];
  }

  insertPropagationSurfacedProposal(input: { flowId: number; proposalRecordId: number; reportRecordId?: number | null; flowStep: string }): void {
    this.db.prepare(`
      INSERT INTO propagation_surfaced_proposals (flow_id, proposal_record_id, report_record_id, flow_step)
      VALUES (?, ?, ?, ?)
    `).run(input.flowId, input.proposalRecordId, input.reportRecordId ?? null, input.flowStep);
  }

  assignPropagationReportToSurfacedProposals(flowId: number, reportRecordId: number): void {
    this.db.prepare("UPDATE propagation_surfaced_proposals SET report_record_id = ? WHERE flow_id = ? AND report_record_id IS NULL").run(reportRecordId, flowId);
  }

  createLinkIfMissing(fromRecordId: number, toRecordId: number, linkTypeKey: string, note = ""): void {
    this.assertLinkType(linkTypeKey);
    this.db.prepare(`
      INSERT OR IGNORE INTO record_links (from_record_id, to_record_id, link_type_key, note)
      VALUES (?, ?, ?, ?)
    `).run(fromRecordId, toRecordId, linkTypeKey, note);
  }

  findInProgressQaFlow(subjectRecordId: number | null): FlowInstanceRow | null {
    return (this.db.prepare(`
      SELECT *
      FROM flow_instances
      WHERE flow_key = 'qa'
        AND state = 'in_progress'
        AND COALESCE(qa_subject_record_id, 0) = COALESCE(?, 0)
      ORDER BY id DESC
      LIMIT 1
    `).get(subjectRecordId) as FlowInstanceRow | undefined) ?? null;
  }

  qaTestCatalog(): QaTestCatalogRow[] {
    return this.db.prepare("SELECT * FROM qa_test_catalog ORDER BY number").all().map((row) => rowToQaTestCatalog(row as Record<string, unknown>));
  }

  qaTestByNumber(testNumber: number): QaTestCatalogRow {
    const row = this.db.prepare("SELECT * FROM qa_test_catalog WHERE number = ?").get(testNumber);
    if (!row) throw new Error(`QA test not found: ${testNumber}`);
    return rowToQaTestCatalog(row as Record<string, unknown>);
  }

  qaScores(flowId: number): QaScoreRow[] {
    return this.db.prepare("SELECT * FROM qa_test_scores WHERE flow_id = ? ORDER BY test_number").all(flowId).map((row) => rowToQaScore(row as Record<string, unknown>));
  }

  upsertQaScore(input: {
    flowId: number;
    qaPassRecordId: number;
    testNumber: number;
    score: "0" | "1" | "2" | "3" | "na";
    naReason?: string;
    notes?: string;
    requiredRepair?: string;
    loadBearing?: boolean;
    repairRouted?: boolean;
    flowStep: string;
  }): QaScoreRow {
    this.qaTestByNumber(input.testNumber);
    this.db.prepare(`
      INSERT INTO qa_test_scores (
        flow_id,
        qa_pass_record_id,
        test_number,
        score,
        na_reason,
        notes,
        required_repair,
        load_bearing,
        repair_routed,
        flow_step
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(qa_pass_record_id, test_number) DO UPDATE SET
        score = excluded.score,
        na_reason = excluded.na_reason,
        notes = excluded.notes,
        required_repair = excluded.required_repair,
        load_bearing = excluded.load_bearing,
        repair_routed = excluded.repair_routed,
        flow_step = excluded.flow_step
    `).run(
      input.flowId,
      input.qaPassRecordId,
      input.testNumber,
      input.score,
      input.naReason ?? "",
      input.notes ?? "",
      input.requiredRepair ?? "",
      input.loadBearing ? 1 : 0,
      input.repairRouted ? 1 : 0,
      input.flowStep
    );
    return rowToQaScore(this.db.prepare("SELECT * FROM qa_test_scores WHERE qa_pass_record_id = ? AND test_number = ?").get(input.qaPassRecordId, input.testNumber) as Record<string, unknown>);
  }

  qaRegressionProfile(flowId: number): FlowInstanceRow | null {
    return (this.db.prepare("SELECT * FROM qa_regression_profiles WHERE flow_id = ?").get(flowId) as FlowInstanceRow | undefined) ?? null;
  }

  upsertQaRegressionProfile(input: {
    flowId: number;
    qaPassRecordId: number;
    fields: {
      strongestDomain: string;
      weakestDomain: string;
      mostDangerousUnderPropagatedFact: string;
      mostLikelyContradiction: string;
      mostFragileMystery: string;
      mostOverloadedConstraint: string;
      mostSuspiciousAbsentInstitutionResponse: string;
      mostAtRiskAestheticDrift: string;
      canonDebtBeforeFoundationalFacts: string;
    };
    flowStep: string;
  }): FlowInstanceRow {
    this.db.prepare(`
      INSERT INTO qa_regression_profiles (
        qa_pass_record_id,
        flow_id,
        strongest_domain,
        weakest_domain,
        most_dangerous_under_propagated_fact,
        most_likely_contradiction,
        most_fragile_mystery,
        most_overloaded_constraint,
        most_suspicious_absent_institution_response,
        most_at_risk_aesthetic_drift,
        canon_debt_before_foundational_facts,
        flow_step
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(qa_pass_record_id) DO UPDATE SET
        strongest_domain = excluded.strongest_domain,
        weakest_domain = excluded.weakest_domain,
        most_dangerous_under_propagated_fact = excluded.most_dangerous_under_propagated_fact,
        most_likely_contradiction = excluded.most_likely_contradiction,
        most_fragile_mystery = excluded.most_fragile_mystery,
        most_overloaded_constraint = excluded.most_overloaded_constraint,
        most_suspicious_absent_institution_response = excluded.most_suspicious_absent_institution_response,
        most_at_risk_aesthetic_drift = excluded.most_at_risk_aesthetic_drift,
        canon_debt_before_foundational_facts = excluded.canon_debt_before_foundational_facts,
        flow_step = excluded.flow_step
    `).run(
      input.qaPassRecordId,
      input.flowId,
      input.fields.strongestDomain,
      input.fields.weakestDomain,
      input.fields.mostDangerousUnderPropagatedFact,
      input.fields.mostLikelyContradiction,
      input.fields.mostFragileMystery,
      input.fields.mostOverloadedConstraint,
      input.fields.mostSuspiciousAbsentInstitutionResponse,
      input.fields.mostAtRiskAestheticDrift,
      input.fields.canonDebtBeforeFoundationalFacts,
      input.flowStep
    );
    return this.qaRegressionProfile(input.flowId)!;
  }

  qaFloorVerdict(flowId: number): FlowInstanceRow | null {
    return (this.db.prepare("SELECT * FROM qa_floor_verdicts WHERE flow_id = ?").get(flowId) as FlowInstanceRow | undefined) ?? null;
  }

  upsertQaFloorVerdict(input: {
    flowId: number;
    qaPassRecordId: number;
    conditions: {
      repeatableHighImpactCapability: boolean;
      lacksAccessLimits: boolean;
      lacksCost: boolean;
      lacksCountermeasure: boolean;
      lacksActorAdaptation: boolean;
      lacksTemporalResidue: boolean;
      lacksDistributionPattern: boolean;
      lacksInstitutionOrModeEquivalent: boolean;
    };
    triggered: boolean;
    override: boolean;
    overrideReason?: string;
    flowStep: string;
  }): FlowInstanceRow {
    this.db.prepare(`
      INSERT INTO qa_floor_verdicts (
        qa_pass_record_id,
        flow_id,
        repeatable_high_impact_capability,
        lacks_access_limits,
        lacks_cost,
        lacks_countermeasure,
        lacks_actor_adaptation,
        lacks_temporal_residue,
        lacks_distribution_pattern,
        lacks_institution_or_mode_equivalent,
        triggered,
        override,
        override_reason,
        flow_step
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(qa_pass_record_id) DO UPDATE SET
        repeatable_high_impact_capability = excluded.repeatable_high_impact_capability,
        lacks_access_limits = excluded.lacks_access_limits,
        lacks_cost = excluded.lacks_cost,
        lacks_countermeasure = excluded.lacks_countermeasure,
        lacks_actor_adaptation = excluded.lacks_actor_adaptation,
        lacks_temporal_residue = excluded.lacks_temporal_residue,
        lacks_distribution_pattern = excluded.lacks_distribution_pattern,
        lacks_institution_or_mode_equivalent = excluded.lacks_institution_or_mode_equivalent,
        triggered = excluded.triggered,
        override = excluded.override,
        override_reason = excluded.override_reason,
        flow_step = excluded.flow_step
    `).run(
      input.qaPassRecordId,
      input.flowId,
      input.conditions.repeatableHighImpactCapability ? 1 : 0,
      input.conditions.lacksAccessLimits ? 1 : 0,
      input.conditions.lacksCost ? 1 : 0,
      input.conditions.lacksCountermeasure ? 1 : 0,
      input.conditions.lacksActorAdaptation ? 1 : 0,
      input.conditions.lacksTemporalResidue ? 1 : 0,
      input.conditions.lacksDistributionPattern ? 1 : 0,
      input.conditions.lacksInstitutionOrModeEquivalent ? 1 : 0,
      input.triggered ? 1 : 0,
      input.override ? 1 : 0,
      input.overrideReason ?? "",
      input.flowStep
    );
    return this.qaFloorVerdict(input.flowId)!;
  }

  insertQaRepair(input: {
    flowId: number;
    qaPassRecordId: number;
    testNumber: number;
    repairKind: "fact" | "canon_debt";
    debtKind?: string;
    repairText: string;
    proposalRecordId?: number | null;
    debtRecordId?: number | null;
    flowStep: string;
  }): FlowInstanceRow {
    this.qaTestByNumber(input.testNumber);
    const result = this.db.prepare(`
      INSERT INTO qa_repairs (
        flow_id,
        qa_pass_record_id,
        test_number,
        repair_kind,
        debt_kind,
        repair_text,
        proposal_record_id,
        debt_record_id,
        flow_step
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      input.flowId,
      input.qaPassRecordId,
      input.testNumber,
      input.repairKind,
      input.debtKind ?? null,
      input.repairText,
      input.proposalRecordId ?? null,
      input.debtRecordId ?? null,
      input.flowStep
    );
    return this.db.prepare("SELECT * FROM qa_repairs WHERE id = ?").get(result.lastInsertRowid) as FlowInstanceRow;
  }

  qaRepairs(flowId: number): FlowInstanceRow[] {
    return this.db.prepare("SELECT * FROM qa_repairs WHERE flow_id = ? ORDER BY id").all(flowId) as FlowInstanceRow[];
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
    if (version < 5) {
      this.db.exec("BEGIN");
      try {
        this.db.exec(migration005);
        this.db.exec("COMMIT");
      } catch (error) {
        this.db.exec("ROLLBACK");
        throw error;
      }
    }
    if (version < 6) {
      this.db.exec("BEGIN");
      try {
        this.db.exec(migration006);
        this.db.exec("COMMIT");
      } catch (error) {
        this.db.exec("ROLLBACK");
        throw error;
      }
    }
    if (version < 7) {
      this.db.exec("BEGIN");
      try {
        this.db.exec(migration007);
        this.db.exec("COMMIT");
      } catch (error) {
        this.db.exec("ROLLBACK");
        throw error;
      }
    }
    if (version < 8) {
      this.db.exec("BEGIN");
      try {
        this.db.exec(migration008);
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

  assertVocabularyTerm(vocabulary: string, term: string): void {
    const row = this.db.prepare("SELECT 1 FROM vocabulary_terms WHERE vocabulary = ? AND term = ?").get(vocabulary, term);
    if (!row) throw new Error(`Unknown ${vocabulary} term: ${term}`);
  }

  replaceSingleFacet(recordId: number, vocabulary: string, term: string): void {
    this.replaceAllFacets(recordId, vocabulary, [term]);
  }

  replaceAllFacets(recordId: number, vocabulary: string, terms: string[]): void {
    this.getRecord(recordId);
    terms.forEach((term) => this.assertVocabularyTerm(vocabulary, term));
    this.db.prepare("DELETE FROM record_facets WHERE record_id = ? AND vocabulary = ?").run(recordId, vocabulary);
    terms.forEach((term, index) => this.addFacet(recordId, { vocabulary, term, position: index + 1 }));
  }

  recordJurisdictionEvent(recordId: number, input: { origin: "admission" | "repair" | "sweep"; admissionOperation?: string; repairOperation?: string }): void {
    this.getRecord(recordId);
    if (input.admissionOperation) this.assertVocabularyTerm("admission_decision_operation", input.admissionOperation);
    if (input.repairOperation) this.assertVocabularyTerm("repair_operation", input.repairOperation);
    this.db.prepare(`
      INSERT INTO jurisdiction_events (record_id, origin, admission_decision_operation, repair_operation)
      VALUES (?, ?, ?, ?)
    `).run(recordId, input.origin, input.admissionOperation ?? null, input.repairOperation ?? null);
  }

  recordProposeProvenance(recordId: number, flowStep: string): void {
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

  assertAllowedStatusTransition(current: string | null, next: string): void {
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

  private nextFacetPosition(recordId: number, vocabulary: string): number {
    const row = this.db.prepare("SELECT COALESCE(MAX(position), 0) + 1 AS next FROM record_facets WHERE record_id = ? AND vocabulary = ?").get(recordId, vocabulary) as { next: number };
    return row.next;
  }

  private ensurePromptTemplates(): void {
    const templates = [
      {
        key: "kernel_pressure",
        roleName: "Consequence scout",
        text: "Pressure-test this steward-authored kernel as a pressure seed. Work from the kernel first, then surface direct consequences, speculative assumptions, ordinary-life residue, institutions, constraints, and quiet domains that the world may need to answer. Do not write first-draft or final canon; label surfaced facts as proposed-only.",
        legacyText: "Given this canon fact and its constraints, list consequences across the domain atlas. Separate direct consequences from speculative ones. Do not invent new canon facts; label assumptions."
      },
      {
        key: "decomposition_pressure",
        roleName: "Prerequisite auditor",
        text: "Pressure-test this steward-authored seed decomposition. Work from the split seeds first, then identify hidden prerequisites across hard, soft, economic, institutional, temporal, spatial, and psychological domains. Flag bundled seeds, missing prerequisites, and any prerequisite that needs its own canon admission. Do not write final canon; label assumptions plainly.",
        legacyText: "What hard, soft, economic, institutional, temporal, spatial, and psychological prerequisites does this fact require? Flag any prerequisite that would itself need canon admission."
      },
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
      },
      {
        key: "qa_red_team",
        roleName: "QA hostile reader",
        text: "Run a QA red-team pass as a hostile reader. Ask for pressure, not answers. Do not write final canon.\nUse the eight red-team questions from docs/worldbuilding-system/18_quality_assurance_tests.md."
      },
      {
        key: "institution_economy_analyst",
        roleName: "Institution/economy analyst",
        text: "Pressure-test this institutional, economic, and suppression sweep. Work from steward-authored material first. Identify action arenas, rules-in-use, transaction costs, surplus capture, suppression residue, counter-institutions, daily-life residue, and power conflict. Do not admit facts; label surfaced facts as proposed-only and name unresolved canon debt."
      },
      {
        key: "temporal_spatial_analyst",
        roleName: "Spatial-temporal analyst",
        text: "Pressure-test this Temporal/Timeline pass. Work from steward-authored material first. Identify date type separation, granularity pressure, first-true sequence, discovery latency, institutional reaction, residue by timescale, diffusion speed, chronology pluralism, and temporal mystery boundaries. Do not admit facts; label surfaced facts as proposed-only and name unresolved canon debt."
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
        if (template.legacyText) {
          this.db.prepare("UPDATE prompt_templates SET original_text = ? WHERE key = ? AND original_text = ?")
            .run(template.text, template.key, template.legacyText);
          this.db.prepare("UPDATE prompt_template_versions SET text = ? WHERE template_key = ? AND version = 1 AND text = ?")
            .run(template.text, template.key, template.legacyText);
        }
      }
    })();
  }

  private backupPath(label: string): string {
    const timestamp = new Date().toISOString().replaceAll(/[:.]/g, "-");
    return `${this.path}.${label}.${timestamp}.sqlite`;
  }

  private recordsForMarkdownExport(): RecordRow[] {
    const rows = this.db.prepare("SELECT * FROM records ORDER BY id").all().map((row) => rowToRecord(row as Record<string, unknown>));
    const typePosition = new Map(RECORD_TYPES.map((recordType, index) => [recordType.key, index]));
    return rows.sort((left, right) => {
      const leftType = typePosition.get(left.recordTypeKey) ?? Number.MAX_SAFE_INTEGER;
      const rightType = typePosition.get(right.recordTypeKey) ?? Number.MAX_SAFE_INTEGER;
      if (leftType !== rightType) return leftType - rightType;
      return left.id - right.id;
    });
  }

  private renderRecordMarkdown(record: RecordRow): string {
    const recordType = this.assertRecordType(record.recordTypeKey);
    const sections = this.listSections(record.id).filter((section) => section.body.trim());
    const facets = this.listFacets(record.id);
    const links = this.markdownLinkReferences(record.id);
    const recordHistory = this.history(record.id) as Array<Record<string, unknown>>;
    const sectionHistory = this.sectionHistory(record.id) as Array<Record<string, unknown>>;
    const advisoryDispositions = record.recordTypeKey === "advisory_artifact" ? this.advisoryDispositionRows(record.id) : [];

    const lines = [
      `# ${record.shortId} - ${record.title}`,
      "",
      `Source world: ${this.path}`,
      `Schema version: ${this.schemaVersion()}`,
      `Record type: ${recordType.label} (\`${record.recordTypeKey}\`)`,
      `Mutation regime: ${recordType.mutationRegime}`,
      `Package source: \`${recordType.packageSource}\``,
      `Truth layer: ${record.truthLayer ?? "unset"}`,
      `Canon status: ${record.canonStatus ?? "unset"}`
    ];

    if (record.body.trim()) {
      lines.push("", "## Record prose", "", record.body);
    }

    if (sections.length) {
      for (const section of sections) {
        lines.push("", `## ${section.heading}`, "", section.body);
      }
    }

    if (facets.length) {
      lines.push("", "## Facets", "");
      for (const facet of facets) lines.push(`- ${facet.vocabulary}: ${facet.term}`);
    }

    if (links.length) {
      lines.push("", "## Links", "");
      for (const link of links) lines.push(`- ${link}`);
    }

    if (advisoryDispositions.length) {
      lines.push("", "## Advisory dispositions", "");
      for (const row of advisoryDispositions) {
        const note = String(row.note ?? "").trim();
        lines.push(`- ${row.disposition}${note ? `: ${note}` : ""}${row.standing_ruling ? " (standing ruling)" : ""}`);
      }
    }

    if (recordHistory.length || sectionHistory.length) {
      lines.push("", "## History notes", "");
      if (recordHistory.length) {
        lines.push("### Record wording", "");
        for (const row of recordHistory) {
          lines.push(`- Sequence ${row.sequence} retired at ${row.retired_at}`);
          lines.push(`  - Title: ${row.retired_title}`);
          if (String(row.retired_body ?? "").trim()) lines.push("  - Body:", this.indentMarkdown(String(row.retired_body)));
        }
      }
      if (sectionHistory.length) {
        lines.push("### Section wording", "");
        for (const row of sectionHistory) {
          lines.push(`- Sequence ${row.sequence} retired from ${row.retired_heading} at ${row.retired_at}`);
          if (String(row.retired_body ?? "").trim()) lines.push(this.indentMarkdown(String(row.retired_body)));
        }
      }
    }

    return `${lines.join("\n").trimEnd()}\n`;
  }

  private renderMarkdownIndex(entries: ExportEntry[]): string {
    const lines = [
      "# Worldloom Markdown Export",
      "",
      `Source world: ${this.path}`,
      `Schema version: ${this.schemaVersion()}`
    ];

    for (const recordType of RECORD_TYPES) {
      const group = entries.filter((entry) => entry.record.recordTypeKey === recordType.key);
      if (!group.length) continue;
      lines.push("", `## ${recordType.label}`, "");
      for (const entry of group) {
        lines.push(`- [${entry.record.shortId} - ${entry.record.title}](${entry.filename})`);
      }
    }

    lines.push(
      "",
      "<!-- worldloom-export-files",
      ...entries.map((entry) => entry.filename),
      "-->"
    );

    return `${lines.join("\n").trimEnd()}\n`;
  }

  private markdownFilename(record: RecordRow): string {
    const slug = record.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
    return slug ? `${record.shortId}-${slug}.md` : `${record.shortId}.md`;
  }

  private removePreviousMarkdownExportFiles(destination: string): void {
    const indexPath = join(destination, "index.md");
    if (!existsSync(indexPath)) return;
    const match = readFileSync(indexPath, "utf8").match(/<!-- worldloom-export-files\n([\s\S]*?)\n-->/);
    if (!match) return;
    for (const filename of match[1].split("\n").map((line) => line.trim()).filter(Boolean)) {
      if (filename !== basename(filename) || !filename.endsWith(".md") || filename === "index.md") continue;
      rmSync(join(destination, filename), { force: true });
    }
  }

  private markdownLinkReferences(recordId: number): string[] {
    return this.db.prepare(`
      SELECT rl.*,
             source.short_id AS source_short_id,
             source.title AS source_title,
             target.short_id AS target_short_id,
             target.title AS target_title
      FROM record_links rl
      JOIN records source ON source.id = rl.from_record_id
      JOIN records target ON target.id = rl.to_record_id
      WHERE rl.from_record_id = @recordId OR rl.to_record_id = @recordId
      ORDER BY rl.id
    `).all({ recordId }).map((row) => {
      const values = row as Record<string, unknown>;
      const outgoing = Number(values.from_record_id) === recordId;
      const direction = outgoing ? "outgoing" : "incoming";
      const arrow = outgoing ? "->" : "<-";
      const targetShortId = outgoing ? values.target_short_id : values.source_short_id;
      const targetTitle = outgoing ? values.target_title : values.source_title;
      const note = String(values.note ?? "").trim();
      return `${direction} ${values.link_type_key} ${arrow} ${targetShortId} - ${targetTitle}${note ? ` (${note})` : ""}`;
    });
  }

  private advisoryDispositionRows(recordId: number): Array<Record<string, unknown>> {
    return this.db.prepare("SELECT * FROM advisory_dispositions WHERE advisory_record_id = ? ORDER BY id").all(recordId) as Array<Record<string, unknown>>;
  }

  private indentMarkdown(value: string): string {
    return value.split("\n").map((line) => `    ${line}`).join("\n");
  }
}
