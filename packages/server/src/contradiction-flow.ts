import { requiresSkipReason } from "./severity-policy.js";
import { intakeProposedFact } from "./admission-flow.js";
import { createSkipRecord } from "./flow-support.js";
import type { AdmissionQueueRow, RecordRow, SectionInput, WorldFile } from "./world-file.js";

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

const assertVocabularyTerm = (store: WorldFile, vocabulary: string, term: string): void => {
  store.assertVocabularyTerm(vocabulary, term);
};

const safeLink = (store: WorldFile, fromRecordId: number, toRecordId: number, linkTypeKey: string, note: string): void => {
  store.createLinkIfMissing(fromRecordId, toRecordId, linkTypeKey, note);
};

const readContradictionFlow = (store: WorldFile, flowId: number): ContradictionFlowRow => {
  const row = store.getFlowInstance(flowId, "contradiction");
  return {
    id: Number(row.id),
    state: String(row.state),
    current_step: String(row.current_step),
    contradiction_source_record_id: row.contradiction_source_record_id == null ? null : Number(row.contradiction_source_record_id),
    contradiction_report_record_id: row.contradiction_report_record_id == null ? null : Number(row.contradiction_report_record_id)
  };
};

const workScale = (store: WorldFile, flowId: number): string | null => {
  return store.contradictionWorkScale(flowId);
};

const disposition = (store: WorldFile, flowId: number): { disposition: string; note: string } | null => {
  return store.contradictionDisposition(flowId);
};

const triageEntries = (store: WorldFile, flowId: number): Array<{ step_key: string; body: string }> =>
  store.contradictionTriageEntries(flowId);

const repairOperations = (store: WorldFile, flowId: number): Array<{ operation: string; repair_text: string; position: number }> =>
  store.contradictionRepairOperations(flowId);

const repairTargets = (store: WorldFile, flowId: number): Array<{ record_id: number; next_canon_status: string; new_title: string | null; new_body: string | null; note: string; advisory_record_id: number | null }> =>
  store.contradictionRepairTargets(flowId);

const retconCosts = (store: WorldFile, flowId: number): Array<{ retcon_type: string; cost_key: string; cost_text: string }> =>
  store.contradictionRetconCosts(flowId);

const repairPropagation = (store: WorldFile, flowId: number): ContradictionRepairPropagationRow | null => {
  const row = store.contradictionRepairPropagation(flowId);
  if (!row) return null;
  return {
    flowId,
    action: String(row.action) as "assign" | "decline",
    debtRecordId: row.debt_record_id == null ? null : Number(row.debt_record_id),
    skipRecordId: row.skip_record_id == null ? null : Number(row.skip_record_id),
    note: String(row.note ?? "")
  };
};

const completedChecklistForFlow = (store: WorldFile, flowId: number): boolean => {
  return store.completedMysteryChecklistForFlow(flowId);
};

const replaceSingleFacet = (store: WorldFile, recordId: number, vocabulary: string, term: string): void => {
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
  store: WorldFile,
  input: { sourceRecordId?: number; implicatedRecordIds?: number[]; title?: string }
): unknown => {
  if (input.sourceRecordId != null) store.getRecord(input.sourceRecordId);
  const implicatedRecordIds = [...new Set([...(input.sourceRecordId == null ? [] : [input.sourceRecordId]), ...(input.implicatedRecordIds ?? [])])];
  for (const recordId of implicatedRecordIds) store.getRecord(recordId);

  if (input.sourceRecordId != null) {
    const existing = store.findInProgressContradictionFlowBySource(input.sourceRecordId);
    if (existing) return existing;
  }

  const flow = store.createFlowInstance({ flowKey: "contradiction", currentStep: "contradiction:entry", contradictionSourceRecordId: input.sourceRecordId ?? null });
  const flowId = Number(flow.id);
  for (const recordId of implicatedRecordIds) {
    store.insertContradictionImplicatedRecord(flowId, recordId);
  }
  if (input.title?.trim()) {
    store.insertContradictionTitle(flowId, input.title);
  }
  return store.getFlowInstance(flowId);
};

export const getContradictionRun = (store: WorldFile, flowId: number): unknown => {
  const flow = readContradictionFlow(store, flowId);
  const implicatedRecords = store.contradictionImplicatedRecordIds(flowId).map((recordId) => store.getRecord(recordId));
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
    proposals: store.contradictionRepairCreatedProposals(flowId),
    checklists: store.mysteryPreservationChecklistsForFlow(flowId)
  };
};

export const recordContradictionTriage = (
  store: WorldFile,
  input: { flowId: number; stepKey: string; body: string }
): unknown => {
  readContradictionFlow(store, input.flowId);
  if (!(input.stepKey in TRIAGE_SECTION_BY_STEP)) throw new Error(`Unknown contradiction triage step: ${input.stepKey}`);
  if (!input.body.trim()) throw new Error("contradiction triage entries require steward-written prose");
  const entry = store.upsertContradictionTriageEntry(input.flowId, input.stepKey, input.body);
  store.updateFlowInstance(input.flowId, { currentStep: `contradiction:${input.stepKey}` });
  return entry;
};

export const declareContradictionWorkScale = (
  store: WorldFile,
  input: { flowId: number; workScale: string }
): unknown => {
  readContradictionFlow(store, input.flowId);
  assertVocabularyTerm(store, "work_scale", input.workScale);
  const row = store.upsertContradictionWorkScale(input.flowId, input.workScale);
  store.updateFlowInstance(input.flowId, { currentStep: "contradiction:work-scale" });
  return row;
};

export const setContradictionDisposition = (
  store: WorldFile,
  input: { flowId: number; disposition: string; note?: string }
): unknown => {
  readContradictionFlow(store, input.flowId);
  assertVocabularyTerm(store, "contradiction_disposition", input.disposition);
  const row = store.upsertContradictionDisposition(input.flowId, input.disposition, input.note);
  store.updateFlowInstance(input.flowId, { currentStep: "contradiction:disposition" });
  return row;
};

export const recordContradictionRepair = (
  store: WorldFile,
  input: { flowId: number; operations: string[]; repairText: string }
): unknown[] => {
  readContradictionFlow(store, input.flowId);
  if (!input.operations.length) throw new Error("repair requires at least one operation");
  if (!input.repairText.trim()) throw new Error("repair operations require written repair text");
  input.operations.forEach((operation) => assertVocabularyTerm(store, "repair_operation", operation));
  return store.atomicWrite(() => {
    const operations = store.replaceContradictionRepairOperations(input.flowId, input);
    store.updateFlowInstance(input.flowId, { currentStep: "contradiction:repair" });
    return operations;
  });
};

export const addContradictionRepairTarget = (
  store: WorldFile,
  input: { flowId: number; recordId: number; nextCanonStatus: string; newTitle?: string; newBody?: string; note?: string; advisoryRecordId?: number }
): unknown => {
  readContradictionFlow(store, input.flowId);
  store.getRecord(input.recordId);
  assertVocabularyTerm(store, "canon_status", input.nextCanonStatus);
  if (input.advisoryRecordId != null) store.getRecord(input.advisoryRecordId);
  const target = store.insertContradictionRepairTarget(input);
  store.updateFlowInstance(input.flowId, { currentStep: "contradiction:repair-target" });
  return target;
};

export const proposeFactFromContradiction = (
  store: WorldFile,
  input: { flowId: number; title: string; body: string; truthLayer: string }
): { record: RecordRow; queue: AdmissionQueueRow[] } => {
  return store.atomicWrite(() => {
    const flow = readContradictionFlow(store, input.flowId);
    const intake = intakeProposedFact(store, {
      origin: "contradiction-repair-created-fact",
      candidate: {
        title: input.title,
        body: input.body,
        truthLayer: input.truthLayer,
        canonStatus: "proposed"
      },
      sourceLinks: flow.contradiction_report_record_id == null
        ? []
        : [{ recordId: flow.contradiction_report_record_id, note: "Fact surfaced by contradiction repair report" }],
      recordSweepJurisdiction: true,
      provenanceFlowStep: "contradiction:surface-proposal"
    });
    store.insertContradictionRepairCreatedProposal({
      flowId: input.flowId,
      proposalRecordId: intake.record.id,
      reportRecordId: flow.contradiction_report_record_id
    });
    store.updateFlowInstance(input.flowId, { currentStep: "contradiction:surface-proposal" });
    return intake;
  });
};

export const recordContradictionRetconCosts = (
  store: WorldFile,
  input: { flowId: number; retconType: string; costs: Array<{ cost: string; text: string }> }
): unknown[] => {
  readContradictionFlow(store, input.flowId);
  assertVocabularyTerm(store, "retcon_type", input.retconType);
  if (!input.costs.length) throw new Error("retcon repairs require at least one named cost");
  for (const cost of input.costs) {
    if (!RETCON_COSTS.has(cost.cost)) throw new Error(`Unknown retcon cost: ${cost.cost}`);
    if (!cost.text.trim()) throw new Error("retcon costs require written substance");
  }
  return store.atomicWrite(() => {
    const costs = store.replaceContradictionRetconCosts(input.flowId, input);
    store.updateFlowInstance(input.flowId, { currentStep: "contradiction:retcon-cost" });
    return costs;
  });
};

export const setContradictionRepairPropagation = (
  store: WorldFile,
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
    const skip = createSkipRecord(store, { stepKey: "contradiction:repair-propagation", reason: input.reason });
    skipRecordId = skip.id;
    if (flow.contradiction_source_record_id != null) safeLink(store, skip.id, flow.contradiction_source_record_id, "derived_from", "Repair propagation declined");
  }
  store.upsertContradictionRepairPropagation({
    flowId: input.flowId,
    action: input.action,
    debtRecordId,
    skipRecordId,
    note: input.body ?? input.reason ?? ""
  });
  store.updateFlowInstance(input.flowId, { currentStep: "contradiction:repair-propagation" });
  return repairPropagation(store, input.flowId)!;
};

export const owedBoundariesQueue = (store: WorldFile): OwedBoundaryRow[] =>
  store.owedBoundaryRows().map((row) => rowToOwedBoundary(row as Record<string, unknown>));

export const createMysteryLedgerEntry = (
  store: WorldFile,
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
  const record = store.atomicWrite(() => {
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
      store.insertMysteryBoundaryLink(input.propagationDispositionId, ledger.id);
    }
    return store.getRecord(ledger.id);
  });
  return { record, queue: owedBoundariesQueue(store) };
};

export const completeMysteryPreservationChecklist = (
  store: WorldFile,
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
  const row = store.insertMysteryPreservationChecklist(input);
  if (input.flowId != null) store.updateFlowInstance(input.flowId, { currentStep: "contradiction:preservation-checklist" });
  return rowToChecklist(row as Record<string, unknown>);
};

export const skipContradictionStep = (
  store: WorldFile,
  input: { flowId?: number; stepKey: string; admissionLevel?: string; workScale?: string; reason?: string }
): RecordRow => {
  const flow = input.flowId == null ? null : readContradictionFlow(store, input.flowId);
  if (requiresSkipReason({ admissionLevel: input.admissionLevel ?? null, workScale: input.workScale ?? (input.flowId == null ? null : workScale(store, input.flowId)) ?? null }) && !input.reason?.trim()) {
    throw new Error("major contradiction skips require a reason");
  }
  const record = createSkipRecord(store, { stepKey: input.stepKey, reason: input.reason });
  if (flow?.contradiction_source_record_id != null) safeLink(store, record.id, flow.contradiction_source_record_id, "derived_from", "Contradiction instrument declined");
  if (input.flowId != null) store.updateFlowInstance(input.flowId, { currentStep: `contradiction:skip:${input.stepKey}` });
  return record;
};

export const closeContradictionRun = (store: WorldFile, flowId: number): { flow: unknown; report: RecordRow } => {
  const flow = readContradictionFlow(store, flowId);
  if (flow.contradiction_report_record_id != null) {
    return { flow: store.getFlowInstance(flowId), report: store.getRecord(flow.contradiction_report_record_id) };
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

  return store.atomicWrite(() => {
    const report = writeContradictionReport(store, flowId);
    const targets = repairTargets(store, flowId);
    for (const target of targets) {
      applyRepairTarget(store, report.id, operations, target);
    }
    const proposalRows = store.contradictionRepairCreatedProposals(flowId);
    for (const row of proposalRows) {
      safeLink(store, Number(row.proposal_record_id), report.id, "derived_from", "Fact surfaced by contradiction repair report");
    }
    store.assignContradictionReportToCreatedProposals(flowId, report.id);
    const propagation = repairPropagation(store, flowId);
    if (propagation?.debtRecordId != null) safeLink(store, report.id, propagation.debtRecordId, "requires_follow_up", "Contradiction repair assigned propagation debt");
    const implicatedRecordIds = store.contradictionImplicatedRecordIds(flowId);
    for (const recordId of implicatedRecordIds) safeLink(store, report.id, recordId, "derived_from", "Contradiction report implicates this record");
    const completedFlow = store.updateFlowInstance(flowId, { state: "complete", currentStep: "contradiction:complete", contradictionReportRecordId: report.id });
    return { flow: completedFlow, report };
  });
};

const applyRepairTarget = (
  store: WorldFile,
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
    store.recordJurisdictionEvent(target.record_id, { origin: "repair", repairOperation: operation.operation });
  }
  safeLink(store, target.record_id, reportId, "derived_from", "Record repaired by contradiction report");
  if (target.advisory_record_id != null) {
    safeLink(store, target.record_id, target.advisory_record_id, "derived_from", "Repair informed by advisory material");
    safeLink(store, target.record_id, target.advisory_record_id, "cites_advisory_artifact", "Verbatim contradiction advisory artifact consulted");
  }
};

const writeContradictionReport = (store: WorldFile, flowId: number): RecordRow => {
  const flow = readContradictionFlow(store, flowId);
  const source = flow.contradiction_source_record_id == null ? null : store.getRecord(flow.contradiction_source_record_id);
  const triage = triageEntries(store, flowId);
  const triageByStep = new Map(triage.map((row) => [row.step_key, row.body]));
  const selectedDisposition = disposition(store, flowId)!;
  const selectedWorkScale = workScale(store, flowId)!;
  const operations = repairOperations(store, flowId);
  const proposalRows = store.contradictionRepairCreatedProposals(flowId) as Array<{ proposal_record_id: number }>;
  const proposals = proposalRows.map((row) => store.getRecord(Number(row.proposal_record_id)));
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
      `Repair-created proposals: ${proposals.map((proposal) => `${proposal.shortId} ${proposal.title} (${proposal.canonStatus})`).join("; ") || "none"}.`,
      operations.some((row) => row.operation === "retcon") ? "Retcon cost recorded." : "No retcon operation recorded.",
      selectedDisposition.disposition === "mystery-preserving conflict" ? "Preservation checklist completed." : "No mystery-preserving close gate."
    ].join("\n");
    return "";
  };
  store.replaceSections(report.id, REPORT_HEADINGS.map((heading, index) => ({ heading, body: sectionBody(heading), position: index + 1 })));
  return report;
};
