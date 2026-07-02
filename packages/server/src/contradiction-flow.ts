import { requiresSkipReason } from "./severity-policy.js";
import type { AdmissionQueueRow, RecordRow, SectionInput, WorldStore } from "./world-store.js";

export interface OwedBoundaryRow {
  propagationDispositionId: number;
  consequenceId: number;
  protectedRecordId: number;
  propagationReportRecordId: number | null;
  preservationBoundary: string;
  note: string;
  consequenceBody: string;
}

export interface ContradictionRepairPropagationRow {
  flowId: number;
  action: "assign" | "decline";
  debtRecordId: number | null;
  skipRecordId: number | null;
  note: string;
}

export interface MysteryChecklistRow {
  id: number;
  flowId: number | null;
  ledgerRecordId: number | null;
  protectedRecordId: number | null;
  operation: string;
  effectType: string;
  body: string;
  sacredGuardBody: string;
  completed: boolean;
  sacredOpacityGuardRequired: boolean;
}

type ContradictionFlowRow = {
  id: number;
  state: string;
  current_step: string;
  contradiction_source_record_id: number | null;
  contradiction_report_record_id: number | null;
};

const TRIAGE_SECTION_BY_STEP: Record<string, string> = {
  contradiction_statement: "Contradiction statement",
  truth_layers: "Affected truth layers",
  scope: "Affected scope",
  who_can_notice: "Who can notice",
  audience_notice: "Audience notice",
  contradiction_type: "Contradiction type",
  higher_authority: "Higher-authority material",
  mystery_relationship: "Mystery / protected-effect relationship",
  notes: "Notes"
};

const REPORT_HEADINGS = [
  "Contradiction statement",
  "Affected truth layers",
  "Affected scope",
  "Who can notice",
  "Audience notice",
  "Contradiction type",
  "Higher-authority material",
  "Mystery / protected-effect relationship",
  "Work scale",
  "Disposition",
  "Repair operation(s), primary first",
  "Retcon cost",
  "Propagation required",
  "Resulting canon status or branch decision",
  "Notes",
  "Close audit"
] as const;

const MYSTERY_LEDGER_HEADINGS = [
  "Protected effect type",
  "Puzzle question, if any",
  "What is fixed",
  "What is secret or undecided",
  "Damaging explanations",
  "Preserved consequences",
  "Recurrence / motif / transformation",
  "Reveal permissions",
  "Reveal prohibitions",
  "Explanation-pressure operation",
  "What would break if solved or flattened",
  "Sacred-opacity accountability"
] as const;

const RETCON_COSTS = new Set(["continuity", "institutional", "character", "mystery", "aesthetic", "future"]);
const REPAIR_DISPOSITIONS = new Set(["repair required", "deprecation required", "rejection required"]);
const REPAIR_STANDING_TARGETS = new Set(["superseded", "deprecated", "quarantined", "localized", "accepted with constraints", "branch-only", "rejected"]);

const assertVocabularyTerm = (store: WorldStore, vocabulary: string, term: string): void => {
  const row = store.db.prepare("SELECT 1 FROM vocabulary_terms WHERE vocabulary = ? AND term = ?").get(vocabulary, term);
  if (!row) throw new Error(`Unknown ${vocabulary} term: ${term}`);
};

const safeLink = (store: WorldStore, fromRecordId: number, toRecordId: number, linkTypeKey: string, note: string): void => {
  store.db.prepare(`
    INSERT OR IGNORE INTO record_links (from_record_id, to_record_id, link_type_key, note)
    VALUES (?, ?, ?, ?)
  `).run(fromRecordId, toRecordId, linkTypeKey, note);
};

const readContradictionFlow = (store: WorldStore, flowId: number): ContradictionFlowRow => {
  const row = store.db.prepare("SELECT * FROM flow_instances WHERE id = ? AND flow_key = 'contradiction'").get(flowId) as Record<string, unknown> | undefined;
  if (!row) throw new Error(`Contradiction flow not found: ${flowId}`);
  return {
    id: Number(row.id),
    state: String(row.state),
    current_step: String(row.current_step),
    contradiction_source_record_id: row.contradiction_source_record_id == null ? null : Number(row.contradiction_source_record_id),
    contradiction_report_record_id: row.contradiction_report_record_id == null ? null : Number(row.contradiction_report_record_id)
  };
};

const workScale = (store: WorldStore, flowId: number): string | null => {
  const row = store.db.prepare("SELECT work_scale FROM contradiction_work_scales WHERE flow_id = ?").get(flowId) as { work_scale: string } | undefined;
  return row?.work_scale ?? null;
};

const disposition = (store: WorldStore, flowId: number): { disposition: string; note: string } | null => {
  const row = store.db.prepare("SELECT disposition, note FROM contradiction_dispositions WHERE flow_id = ?").get(flowId) as { disposition: string; note: string } | undefined;
  return row ?? null;
};

const triageEntries = (store: WorldStore, flowId: number): Array<{ step_key: string; body: string }> =>
  store.db.prepare("SELECT step_key, body FROM contradiction_triage_entries WHERE flow_id = ? ORDER BY id").all(flowId) as Array<{ step_key: string; body: string }>;

const repairOperations = (store: WorldStore, flowId: number): Array<{ operation: string; repair_text: string; position: number }> =>
  store.db.prepare("SELECT operation, repair_text, position FROM contradiction_repair_operations WHERE flow_id = ? ORDER BY position").all(flowId) as Array<{ operation: string; repair_text: string; position: number }>;

const repairTargets = (store: WorldStore, flowId: number): Array<{ record_id: number; next_canon_status: string; new_title: string | null; new_body: string | null; note: string; advisory_record_id: number | null }> =>
  store.db.prepare("SELECT record_id, next_canon_status, new_title, new_body, note, advisory_record_id FROM contradiction_repair_targets WHERE flow_id = ? ORDER BY id").all(flowId) as Array<{ record_id: number; next_canon_status: string; new_title: string | null; new_body: string | null; note: string; advisory_record_id: number | null }>;

const retconCosts = (store: WorldStore, flowId: number): Array<{ retcon_type: string; cost_key: string; cost_text: string }> =>
  store.db.prepare("SELECT retcon_type, cost_key, cost_text FROM contradiction_retcon_costs WHERE flow_id = ? ORDER BY id").all(flowId) as Array<{ retcon_type: string; cost_key: string; cost_text: string }>;

const repairPropagation = (store: WorldStore, flowId: number): ContradictionRepairPropagationRow | null => {
  const row = store.db.prepare("SELECT * FROM contradiction_repair_propagation WHERE flow_id = ?").get(flowId) as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    flowId,
    action: String(row.action) as "assign" | "decline",
    debtRecordId: row.debt_record_id == null ? null : Number(row.debt_record_id),
    skipRecordId: row.skip_record_id == null ? null : Number(row.skip_record_id),
    note: String(row.note ?? "")
  };
};

const completedChecklistForFlow = (store: WorldStore, flowId: number): boolean => {
  const row = store.db.prepare("SELECT 1 FROM mystery_preservation_checklists WHERE flow_id = ? AND completed = 1 LIMIT 1").get(flowId);
  return Boolean(row);
};

const replaceSingleFacet = (store: WorldStore, recordId: number, vocabulary: string, term: string): void => {
  assertVocabularyTerm(store, vocabulary, term);
  for (const facet of store.listFacets(recordId).filter((row) => row.vocabulary === vocabulary)) {
    store.removeFacet(recordId, facet.id);
  }
  store.addFacet(recordId, { vocabulary, term, position: 1 });
};

const rowToOwedBoundary = (row: Record<string, unknown>): OwedBoundaryRow => ({
  propagationDispositionId: Number(row.propagation_disposition_id),
  consequenceId: Number(row.consequence_id),
  protectedRecordId: Number(row.protected_record_id),
  propagationReportRecordId: row.propagation_report_record_id == null ? null : Number(row.propagation_report_record_id),
  preservationBoundary: String(row.preservation_boundary ?? ""),
  note: String(row.note ?? ""),
  consequenceBody: String(row.consequence_body ?? "")
});

const rowToChecklist = (row: Record<string, unknown>): MysteryChecklistRow => {
  const effectType = String(row.effect_type);
  return {
    id: Number(row.id),
    flowId: row.flow_id == null ? null : Number(row.flow_id),
    ledgerRecordId: row.ledger_record_id == null ? null : Number(row.ledger_record_id),
    protectedRecordId: row.protected_record_id == null ? null : Number(row.protected_record_id),
    operation: String(row.operation),
    effectType,
    body: String(row.body ?? ""),
    sacredGuardBody: String(row.sacred_guard_body ?? ""),
    completed: Number(row.completed) === 1,
    sacredOpacityGuardRequired: effectType === "sacred opacity" || effectType === "horror-terror-dread"
  };
};

export const startContradictionRun = (
  store: WorldStore,
  input: { sourceRecordId?: number; implicatedRecordIds?: number[]; title?: string }
): unknown => {
  if (input.sourceRecordId != null) store.getRecord(input.sourceRecordId);
  const implicatedRecordIds = [...new Set([...(input.sourceRecordId == null ? [] : [input.sourceRecordId]), ...(input.implicatedRecordIds ?? [])])];
  for (const recordId of implicatedRecordIds) store.getRecord(recordId);

  if (input.sourceRecordId != null) {
    const existing = store.db.prepare(`
      SELECT * FROM flow_instances
      WHERE flow_key = 'contradiction'
        AND state = 'in_progress'
        AND contradiction_source_record_id = ?
      ORDER BY id DESC
      LIMIT 1
    `).get(input.sourceRecordId);
    if (existing) return existing;
  }

  const result = store.db.prepare(`
    INSERT INTO flow_instances (flow_key, current_step, contradiction_source_record_id)
    VALUES ('contradiction', 'contradiction:entry', ?)
  `).run(input.sourceRecordId ?? null);
  const flowId = Number(result.lastInsertRowid);
  for (const recordId of implicatedRecordIds) {
    store.db.prepare("INSERT OR IGNORE INTO contradiction_implicated_records (flow_id, record_id) VALUES (?, ?)").run(flowId, recordId);
  }
  if (input.title?.trim()) {
    store.db.prepare(`
      INSERT INTO contradiction_triage_entries (flow_id, step_key, body)
      VALUES (?, 'title', ?)
    `).run(flowId, input.title);
  }
  return store.db.prepare("SELECT * FROM flow_instances WHERE id = ?").get(flowId);
};

export const getContradictionRun = (store: WorldStore, flowId: number): unknown => {
  const flow = readContradictionFlow(store, flowId);
  const implicatedRecords = (store.db.prepare("SELECT record_id FROM contradiction_implicated_records WHERE flow_id = ? ORDER BY id").all(flowId) as Array<{ record_id: number }>)
    .map((row) => store.getRecord(row.record_id));
  return {
    flow,
    implicatedRecords,
    triage: triageEntries(store, flowId),
    workScale: workScale(store, flowId),
    disposition: disposition(store, flowId),
    repairOperations: repairOperations(store, flowId),
    repairTargets: repairTargets(store, flowId),
    retconCosts: retconCosts(store, flowId),
    repairPropagation: repairPropagation(store, flowId),
    proposals: store.db.prepare("SELECT * FROM contradiction_repair_created_proposals WHERE flow_id = ? ORDER BY id").all(flowId),
    checklists: store.db.prepare("SELECT * FROM mystery_preservation_checklists WHERE flow_id = ? ORDER BY id").all(flowId)
  };
};

export const recordContradictionTriage = (
  store: WorldStore,
  input: { flowId: number; stepKey: string; body: string }
): unknown => {
  readContradictionFlow(store, input.flowId);
  if (!(input.stepKey in TRIAGE_SECTION_BY_STEP)) throw new Error(`Unknown contradiction triage step: ${input.stepKey}`);
  if (!input.body.trim()) throw new Error("contradiction triage entries require steward-written prose");
  store.db.prepare(`
    INSERT INTO contradiction_triage_entries (flow_id, step_key, body)
    VALUES (?, ?, ?)
    ON CONFLICT(flow_id, step_key) DO UPDATE SET body = excluded.body
  `).run(input.flowId, input.stepKey, input.body);
  store.db.prepare("UPDATE flow_instances SET current_step = ? WHERE id = ?").run(`contradiction:${input.stepKey}`, input.flowId);
  return store.db.prepare("SELECT * FROM contradiction_triage_entries WHERE flow_id = ? AND step_key = ?").get(input.flowId, input.stepKey);
};

export const declareContradictionWorkScale = (
  store: WorldStore,
  input: { flowId: number; workScale: string }
): unknown => {
  readContradictionFlow(store, input.flowId);
  assertVocabularyTerm(store, "work_scale", input.workScale);
  store.db.prepare(`
    INSERT INTO contradiction_work_scales (flow_id, work_scale)
    VALUES (?, ?)
    ON CONFLICT(flow_id) DO UPDATE SET work_scale = excluded.work_scale
  `).run(input.flowId, input.workScale);
  store.db.prepare("UPDATE flow_instances SET current_step = 'contradiction:work-scale' WHERE id = ?").run(input.flowId);
  return store.db.prepare("SELECT * FROM contradiction_work_scales WHERE flow_id = ?").get(input.flowId);
};

export const setContradictionDisposition = (
  store: WorldStore,
  input: { flowId: number; disposition: string; note?: string }
): unknown => {
  readContradictionFlow(store, input.flowId);
  assertVocabularyTerm(store, "contradiction_disposition", input.disposition);
  store.db.prepare(`
    INSERT INTO contradiction_dispositions (flow_id, disposition, note)
    VALUES (?, ?, ?)
    ON CONFLICT(flow_id) DO UPDATE SET disposition = excluded.disposition, note = excluded.note
  `).run(input.flowId, input.disposition, input.note ?? "");
  store.db.prepare("UPDATE flow_instances SET current_step = 'contradiction:disposition' WHERE id = ?").run(input.flowId);
  return store.db.prepare("SELECT * FROM contradiction_dispositions WHERE flow_id = ?").get(input.flowId);
};

export const recordContradictionRepair = (
  store: WorldStore,
  input: { flowId: number; operations: string[]; repairText: string }
): unknown[] => {
  readContradictionFlow(store, input.flowId);
  if (!input.operations.length) throw new Error("repair requires at least one operation");
  if (!input.repairText.trim()) throw new Error("repair operations require written repair text");
  input.operations.forEach((operation) => assertVocabularyTerm(store, "repair_operation", operation));
  store.db.transaction(() => {
    store.db.prepare("DELETE FROM contradiction_repair_operations WHERE flow_id = ?").run(input.flowId);
    input.operations.forEach((operation, index) => {
      store.db.prepare(`
        INSERT INTO contradiction_repair_operations (flow_id, position, operation, repair_text)
        VALUES (?, ?, ?, ?)
      `).run(input.flowId, index + 1, operation, input.repairText);
    });
    store.db.prepare("UPDATE flow_instances SET current_step = 'contradiction:repair' WHERE id = ?").run(input.flowId);
  })();
  return store.db.prepare("SELECT * FROM contradiction_repair_operations WHERE flow_id = ? ORDER BY position").all(input.flowId);
};

export const addContradictionRepairTarget = (
  store: WorldStore,
  input: { flowId: number; recordId: number; nextCanonStatus: string; newTitle?: string; newBody?: string; note?: string; advisoryRecordId?: number }
): unknown => {
  readContradictionFlow(store, input.flowId);
  store.getRecord(input.recordId);
  assertVocabularyTerm(store, "canon_status", input.nextCanonStatus);
  if (input.advisoryRecordId != null) store.getRecord(input.advisoryRecordId);
  const result = store.db.prepare(`
    INSERT INTO contradiction_repair_targets (flow_id, record_id, next_canon_status, new_title, new_body, note, advisory_record_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(input.flowId, input.recordId, input.nextCanonStatus, input.newTitle ?? null, input.newBody ?? null, input.note ?? "", input.advisoryRecordId ?? null);
  store.db.prepare("UPDATE flow_instances SET current_step = 'contradiction:repair-target' WHERE id = ?").run(input.flowId);
  return store.db.prepare("SELECT * FROM contradiction_repair_targets WHERE id = ?").get(result.lastInsertRowid);
};

export const proposeFactFromContradiction = (
  store: WorldStore,
  input: { flowId: number; title: string; body: string; truthLayer: string }
): { record: RecordRow; queue: AdmissionQueueRow[] } => {
  const flow = readContradictionFlow(store, input.flowId);
  const record = store.createRecord({ recordTypeKey: "canon_fact", title: input.title, body: input.body, truthLayer: input.truthLayer, canonStatus: "proposed" });
  store.db.prepare(`
    INSERT INTO contradiction_repair_created_proposals (flow_id, proposal_record_id, report_record_id)
    VALUES (?, ?, ?)
  `).run(input.flowId, record.id, flow.contradiction_report_record_id ?? null);
  if (flow.contradiction_report_record_id != null) {
    safeLink(store, record.id, flow.contradiction_report_record_id, "derived_from", "Fact surfaced by contradiction repair report");
  }
  store.db.prepare(`
    INSERT INTO jurisdiction_events (record_id, origin)
    VALUES (?, 'sweep')
  `).run(record.id);
  store.db.prepare("UPDATE flow_instances SET current_step = 'contradiction:surface-proposal' WHERE id = ?").run(input.flowId);
  return { record, queue: store.admissionQueue() };
};

export const recordContradictionRetconCosts = (
  store: WorldStore,
  input: { flowId: number; retconType: string; costs: Array<{ cost: string; text: string }> }
): unknown[] => {
  readContradictionFlow(store, input.flowId);
  assertVocabularyTerm(store, "retcon_type", input.retconType);
  if (!input.costs.length) throw new Error("retcon repairs require at least one named cost");
  for (const cost of input.costs) {
    if (!RETCON_COSTS.has(cost.cost)) throw new Error(`Unknown retcon cost: ${cost.cost}`);
    if (!cost.text.trim()) throw new Error("retcon costs require written substance");
  }
  store.db.transaction(() => {
    store.db.prepare("DELETE FROM contradiction_retcon_costs WHERE flow_id = ?").run(input.flowId);
    for (const cost of input.costs) {
      store.db.prepare(`
        INSERT INTO contradiction_retcon_costs (flow_id, retcon_type, cost_key, cost_text)
        VALUES (?, ?, ?, ?)
      `).run(input.flowId, input.retconType, cost.cost, cost.text);
    }
    store.db.prepare("UPDATE flow_instances SET current_step = 'contradiction:retcon-cost' WHERE id = ?").run(input.flowId);
  })();
  return store.db.prepare("SELECT * FROM contradiction_retcon_costs WHERE flow_id = ? ORDER BY id").all(input.flowId);
};

export const setContradictionRepairPropagation = (
  store: WorldStore,
  input: { flowId: number; action: "assign" | "decline"; debtName?: string; body?: string; admissionLevel?: string; workScale?: string; reason?: string }
): ContradictionRepairPropagationRow => {
  const flow = readContradictionFlow(store, input.flowId);
  let debtRecordId: number | null = null;
  let skipRecordId: number | null = null;
  if (input.action === "assign") {
    if (!input.debtName?.trim()) throw new Error("assigned repair propagation requires a debt name");
    debtRecordId = store.createCanonDebt({ name: input.debtName, scope: "propagation", assignee: "steward", body: input.body }).id;
  } else {
    const severity = {
      admissionLevel: input.admissionLevel ?? null,
      workScale: input.workScale ?? workScale(store, input.flowId) ?? null
    };
    if (requiresSkipReason(severity) && !input.reason?.trim()) throw new Error("major contradiction skips require a reason");
    const skip = store.recordSkip({ flowId: input.flowId, stepKey: "contradiction:repair-propagation", reason: input.reason });
    skipRecordId = skip.id;
    if (flow.contradiction_source_record_id != null) safeLink(store, skip.id, flow.contradiction_source_record_id, "derived_from", "Repair propagation declined");
  }
  store.db.prepare(`
    INSERT INTO contradiction_repair_propagation (flow_id, action, debt_record_id, skip_record_id, note)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(flow_id) DO UPDATE SET
      action = excluded.action,
      debt_record_id = excluded.debt_record_id,
      skip_record_id = excluded.skip_record_id,
      note = excluded.note
  `).run(input.flowId, input.action, debtRecordId, skipRecordId, input.body ?? input.reason ?? "");
  store.db.prepare("UPDATE flow_instances SET current_step = 'contradiction:repair-propagation' WHERE id = ?").run(input.flowId);
  return repairPropagation(store, input.flowId)!;
};

export const owedBoundariesQueue = (store: WorldStore): OwedBoundaryRow[] =>
  store.db.prepare(`
    SELECT
      d.id AS propagation_disposition_id,
      c.id AS consequence_id,
      c.fact_record_id AS protected_record_id,
      f.propagation_report_record_id,
      d.preservation_boundary,
      d.note,
      c.body AS consequence_body
    FROM propagation_consequence_dispositions d
    JOIN propagation_consequences c ON c.id = d.consequence_id
    JOIN flow_instances f ON f.id = c.flow_id
    LEFT JOIN contradiction_mystery_boundary_links l ON l.propagation_disposition_id = d.id
    WHERE d.disposition = 'protected as a mystery boundary'
      AND l.id IS NULL
    ORDER BY d.id
  `).all().map((row) => rowToOwedBoundary(row as Record<string, unknown>));

export const createMysteryLedgerEntry = (
  store: WorldStore,
  input: {
    propagationDispositionId?: number;
    ledgerRecordId?: number;
    title: string;
    protectedRecordId: number;
    propagationReportRecordId?: number;
    effectType: string;
    mysteryState: string;
    preservationBoundary: string;
    sections: Record<string, string>;
  }
): { record: RecordRow; queue: OwedBoundaryRow[] } => {
  store.getRecord(input.protectedRecordId);
  if (input.propagationReportRecordId != null) store.getRecord(input.propagationReportRecordId);
  assertVocabularyTerm(store, "protected_effect_type", input.effectType);
  assertVocabularyTerm(store, "mystery_state", input.mysteryState);
  assertVocabularyTerm(store, "preservation_boundary", input.preservationBoundary);
  const record = store.db.transaction(() => {
    const ledger = input.ledgerRecordId == null
      ? store.createRecord({
        recordTypeKey: "mystery_ledger_entry",
        title: input.title,
        body: `Protected effect type: ${input.effectType}`,
        truthLayer: "mystery boundary",
        canonStatus: "accepted"
      })
      : store.updateRecord(input.ledgerRecordId, { title: input.title, body: `Protected effect type: ${input.effectType}` });
    const sections: SectionInput[] = MYSTERY_LEDGER_HEADINGS
      .map((heading, index) => ({ heading, body: input.sections[heading] ?? "", position: index + 1 }))
      .filter((section) => section.body.trim());
    if (sections.length) store.replaceSections(ledger.id, sections);
    replaceSingleFacet(store, ledger.id, "protected_effect_type", input.effectType);
    replaceSingleFacet(store, ledger.id, "mystery_state", input.mysteryState);
    replaceSingleFacet(store, ledger.id, "preservation_boundary", input.preservationBoundary);
    safeLink(store, ledger.id, input.protectedRecordId, "preserves_boundary_for", "Mystery ledger protects this boundary");
    if (input.propagationReportRecordId != null) safeLink(store, ledger.id, input.propagationReportRecordId, "derived_from", "Mystery ledger worked from propagation boundary");
    if (input.propagationDispositionId != null) {
      store.db.prepare(`
        INSERT OR IGNORE INTO contradiction_mystery_boundary_links (propagation_disposition_id, ledger_record_id)
        VALUES (?, ?)
      `).run(input.propagationDispositionId, ledger.id);
    }
    return store.getRecord(ledger.id);
  })();
  return { record, queue: owedBoundariesQueue(store) };
};

export const completeMysteryPreservationChecklist = (
  store: WorldStore,
  input: { flowId?: number; ledgerRecordId?: number; protectedRecordId?: number; operation: string; effectType: string; body: string; sacredGuardBody?: string }
): MysteryChecklistRow => {
  if (input.flowId != null) readContradictionFlow(store, input.flowId);
  if (input.ledgerRecordId != null) store.getRecord(input.ledgerRecordId);
  if (input.protectedRecordId != null) store.getRecord(input.protectedRecordId);
  assertVocabularyTerm(store, "preservation_operation", input.operation);
  assertVocabularyTerm(store, "protected_effect_type", input.effectType);
  if (!input.body.trim()) throw new Error("preservation checklist requires steward-written prose");
  const sacred = input.effectType === "sacred opacity" || input.effectType === "horror-terror-dread";
  if (sacred && !input.sacredGuardBody?.trim()) throw new Error("sacred-opacity guard requires accountability prose");
  const result = store.db.prepare(`
    INSERT INTO mystery_preservation_checklists (flow_id, ledger_record_id, protected_record_id, operation, effect_type, body, sacred_guard_body, completed)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `).run(input.flowId ?? null, input.ledgerRecordId ?? null, input.protectedRecordId ?? null, input.operation, input.effectType, input.body, input.sacredGuardBody ?? "");
  if (input.flowId != null) store.db.prepare("UPDATE flow_instances SET current_step = 'contradiction:preservation-checklist' WHERE id = ?").run(input.flowId);
  return rowToChecklist(store.db.prepare("SELECT * FROM mystery_preservation_checklists WHERE id = ?").get(result.lastInsertRowid) as Record<string, unknown>);
};

export const skipContradictionStep = (
  store: WorldStore,
  input: { flowId?: number; stepKey: string; admissionLevel?: string; workScale?: string; reason?: string }
): RecordRow => {
  const flow = input.flowId == null ? null : readContradictionFlow(store, input.flowId);
  if (requiresSkipReason({ admissionLevel: input.admissionLevel ?? null, workScale: input.workScale ?? (input.flowId == null ? null : workScale(store, input.flowId)) ?? null }) && !input.reason?.trim()) {
    throw new Error("major contradiction skips require a reason");
  }
  const record = store.recordSkip({ flowId: input.flowId, stepKey: input.stepKey, reason: input.reason });
  if (flow?.contradiction_source_record_id != null) safeLink(store, record.id, flow.contradiction_source_record_id, "derived_from", "Contradiction instrument declined");
  if (input.flowId != null) store.db.prepare("UPDATE flow_instances SET current_step = ? WHERE id = ?").run(`contradiction:skip:${input.stepKey}`, input.flowId);
  return record;
};

export const closeContradictionRun = (store: WorldStore, flowId: number): { flow: unknown; report: RecordRow } => {
  const flow = readContradictionFlow(store, flowId);
  if (flow.contradiction_report_record_id != null) {
    return { flow: store.db.prepare("SELECT * FROM flow_instances WHERE id = ?").get(flowId), report: store.getRecord(flow.contradiction_report_record_id) };
  }
  const selectedDisposition = disposition(store, flowId);
  if (!selectedDisposition) throw new Error("contradiction disposition required before close");
  const selectedWorkScale = workScale(store, flowId);
  if (!selectedWorkScale) throw new Error("work scale must be steward-declared before close");
  const operations = repairOperations(store, flowId);
  if (REPAIR_DISPOSITIONS.has(selectedDisposition.disposition) && !operations.length) {
    throw new Error("repair-required close requires ordered repair operations and written repair text");
  }
  if (operations.some((row) => row.operation === "retcon") && !retconCosts(store, flowId).length) {
    throw new Error("retcon repairs require a retcon cost");
  }
  if (selectedDisposition.disposition === "mystery-preserving conflict" && !completedChecklistForFlow(store, flowId)) {
    throw new Error("mystery-preserving close requires a completed preservation checklist");
  }

  return store.db.transaction(() => {
    const report = writeContradictionReport(store, flowId);
    const targets = repairTargets(store, flowId);
    for (const target of targets) {
      applyRepairTarget(store, report.id, operations, target);
    }
    const proposalRows = store.db.prepare("SELECT proposal_record_id FROM contradiction_repair_created_proposals WHERE flow_id = ?").all(flowId) as Array<{ proposal_record_id: number }>;
    for (const row of proposalRows) {
      safeLink(store, row.proposal_record_id, report.id, "derived_from", "Fact surfaced by contradiction repair report");
    }
    store.db.prepare("UPDATE contradiction_repair_created_proposals SET report_record_id = ? WHERE flow_id = ? AND report_record_id IS NULL").run(report.id, flowId);
    const propagation = repairPropagation(store, flowId);
    if (propagation?.debtRecordId != null) safeLink(store, report.id, propagation.debtRecordId, "requires_follow_up", "Contradiction repair assigned propagation debt");
    const implicated = store.db.prepare("SELECT record_id FROM contradiction_implicated_records WHERE flow_id = ? ORDER BY id").all(flowId) as Array<{ record_id: number }>;
    for (const row of implicated) safeLink(store, report.id, row.record_id, "derived_from", "Contradiction report implicates this record");
    store.db.prepare("UPDATE flow_instances SET state = 'complete', current_step = 'contradiction:complete', contradiction_report_record_id = ? WHERE id = ?").run(report.id, flowId);
    return { flow: store.db.prepare("SELECT * FROM flow_instances WHERE id = ?").get(flowId), report };
  })();
};

const applyRepairTarget = (
  store: WorldStore,
  reportId: number,
  operations: Array<{ operation: string }>,
  target: { record_id: number; next_canon_status: string; new_title: string | null; new_body: string | null; advisory_record_id: number | null }
): void => {
  const current = store.getRecord(target.record_id);
  if (current.canonStatus !== target.next_canon_status && !REPAIR_STANDING_TARGETS.has(target.next_canon_status)) {
    throw new Error(`illegal repair status transition: ${current.canonStatus} -> ${target.next_canon_status}`);
  }
  store.updateRecord(target.record_id, {
    title: target.new_title ?? current.title,
    body: target.new_body ?? current.body,
    canonStatus: target.next_canon_status
  });
  for (const operation of operations) {
    store.db.prepare(`
      INSERT INTO jurisdiction_events (record_id, origin, repair_operation)
      VALUES (?, 'repair', ?)
    `).run(target.record_id, operation.operation);
  }
  safeLink(store, target.record_id, reportId, "derived_from", "Record repaired by contradiction report");
  if (target.advisory_record_id != null) {
    safeLink(store, target.record_id, target.advisory_record_id, "derived_from", "Repair informed by advisory material");
    safeLink(store, target.record_id, target.advisory_record_id, "cites_advisory_artifact", "Verbatim contradiction advisory artifact consulted");
  }
};

const writeContradictionReport = (store: WorldStore, flowId: number): RecordRow => {
  const flow = readContradictionFlow(store, flowId);
  const source = flow.contradiction_source_record_id == null ? null : store.getRecord(flow.contradiction_source_record_id);
  const triage = triageEntries(store, flowId);
  const triageByStep = new Map(triage.map((row) => [row.step_key, row.body]));
  const selectedDisposition = disposition(store, flowId)!;
  const selectedWorkScale = workScale(store, flowId)!;
  const operations = repairOperations(store, flowId);
  const costs = retconCosts(store, flowId);
  const targets = repairTargets(store, flowId);
  const propagation = repairPropagation(store, flowId);
  const title = source ? `Contradiction report: ${source.shortId}` : `Contradiction report: flow ${flowId}`;
  const report = store.createRecord({
    recordTypeKey: "contradiction_report",
    title,
    body: [
      source ? `Source: ${source.shortId} ${source.title}` : "Source: free-standing",
      `Flow: ${flowId}`,
      `Work scale: ${selectedWorkScale}`,
      `Disposition: ${selectedDisposition.disposition}`,
      `Repair operations: ${operations.map((row) => row.operation).join(", ") || "none"}`
    ].join("\n"),
    truthLayer: "Objective canon",
    canonStatus: "accepted"
  });
  const sectionBody = (heading: string): string => {
    const step = Object.entries(TRIAGE_SECTION_BY_STEP).find(([, section]) => section === heading)?.[0];
    if (step) return triageByStep.get(step) ?? "";
    if (heading === "Work scale") return selectedWorkScale;
    if (heading === "Disposition") return [selectedDisposition.disposition, selectedDisposition.note].filter(Boolean).join("\n");
    if (heading === "Repair operation(s), primary first") return operations.map((row) => `${row.position}. ${row.operation}: ${row.repair_text}`).join("\n");
    if (heading === "Retcon cost") return costs.map((row) => `${row.retcon_type} / ${row.cost_key}: ${row.cost_text}`).join("\n");
    if (heading === "Propagation required") return propagation ? `${propagation.action}${propagation.debtRecordId ? `: debt record ${propagation.debtRecordId}` : ""}${propagation.skipRecordId ? `: skip record ${propagation.skipRecordId}` : ""}` : "";
    if (heading === "Resulting canon status or branch decision") return targets.map((row) => `Record ${row.record_id} -> ${row.next_canon_status}`).join("\n");
    if (heading === "Close audit") return [
      "Disposition recorded.",
      operations.some((row) => row.operation === "retcon") ? "Retcon cost recorded." : "No retcon operation recorded.",
      selectedDisposition.disposition === "mystery-preserving conflict" ? "Preservation checklist completed." : "No mystery-preserving close gate."
    ].join("\n");
    return "";
  };
  store.replaceSections(report.id, REPORT_HEADINGS.map((heading, index) => ({ heading, body: sectionBody(heading), position: index + 1 })));
  return report;
};
