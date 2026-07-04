import type { FlowInstanceRow, WorldFile } from "./world-file.js";

export const findInProgressContradictionFlowBySource = (world: WorldFile, sourceRecordId: number): FlowInstanceRow | null =>
  (world.db.prepare(`
    SELECT * FROM flow_instances
    WHERE flow_key = 'contradiction'
      AND state = 'in_progress'
      AND contradiction_source_record_id = ?
    ORDER BY id DESC
    LIMIT 1
  `).get(sourceRecordId) as FlowInstanceRow | undefined) ?? null;

export const insertContradictionImplicatedRecord = (world: WorldFile, flowId: number, recordId: number): void => {
  world.db.prepare("INSERT OR IGNORE INTO contradiction_implicated_records (flow_id, record_id) VALUES (?, ?)").run(flowId, recordId);
};

export const contradictionImplicatedRecordIds = (world: WorldFile, flowId: number): number[] =>
  (world.db.prepare("SELECT record_id FROM contradiction_implicated_records WHERE flow_id = ? ORDER BY id").all(flowId) as Array<{ record_id: number }>)
    .map((row) => row.record_id);

export const insertContradictionTitle = (world: WorldFile, flowId: number, title: string): void => {
  world.db.prepare(`
    INSERT INTO contradiction_triage_entries (flow_id, step_key, body)
    VALUES (?, 'title', ?)
  `).run(flowId, title);
};

export const contradictionWorkScale = (world: WorldFile, flowId: number): string | null => {
  const row = world.db.prepare("SELECT work_scale FROM contradiction_work_scales WHERE flow_id = ?").get(flowId) as { work_scale: string } | undefined;
  return row?.work_scale ?? null;
};

export const contradictionDisposition = (world: WorldFile, flowId: number): { disposition: string; note: string } | null => {
  const row = world.db.prepare("SELECT disposition, note FROM contradiction_dispositions WHERE flow_id = ?").get(flowId) as { disposition: string; note: string } | undefined;
  return row ?? null;
};

export const contradictionTriageEntries = (world: WorldFile, flowId: number): Array<{ step_key: string; body: string }> =>
  world.db.prepare("SELECT step_key, body FROM contradiction_triage_entries WHERE flow_id = ? ORDER BY id").all(flowId) as Array<{ step_key: string; body: string }>;

export const upsertContradictionTriageEntry = (world: WorldFile, flowId: number, stepKey: string, body: string): FlowInstanceRow => {
  world.db.prepare(`
    INSERT INTO contradiction_triage_entries (flow_id, step_key, body)
    VALUES (?, ?, ?)
    ON CONFLICT(flow_id, step_key) DO UPDATE SET body = excluded.body
  `).run(flowId, stepKey, body);
  return world.db.prepare("SELECT * FROM contradiction_triage_entries WHERE flow_id = ? AND step_key = ?").get(flowId, stepKey) as FlowInstanceRow;
};

export const upsertContradictionWorkScale = (world: WorldFile, flowId: number, workScale: string): FlowInstanceRow => {
  world.db.prepare(`
    INSERT INTO contradiction_work_scales (flow_id, work_scale)
    VALUES (?, ?)
    ON CONFLICT(flow_id) DO UPDATE SET work_scale = excluded.work_scale
  `).run(flowId, workScale);
  return world.db.prepare("SELECT * FROM contradiction_work_scales WHERE flow_id = ?").get(flowId) as FlowInstanceRow;
};

export const upsertContradictionDisposition = (world: WorldFile, flowId: number, disposition: string, note?: string): FlowInstanceRow => {
  world.db.prepare(`
    INSERT INTO contradiction_dispositions (flow_id, disposition, note)
    VALUES (?, ?, ?)
    ON CONFLICT(flow_id) DO UPDATE SET disposition = excluded.disposition, note = excluded.note
  `).run(flowId, disposition, note ?? "");
  return world.db.prepare("SELECT * FROM contradiction_dispositions WHERE flow_id = ?").get(flowId) as FlowInstanceRow;
};

export const contradictionRepairOperations = (world: WorldFile, flowId: number): Array<{ operation: string; repair_text: string; position: number }> =>
  world.db.prepare("SELECT operation, repair_text, position FROM contradiction_repair_operations WHERE flow_id = ? ORDER BY position").all(flowId) as Array<{ operation: string; repair_text: string; position: number }>;

export const replaceContradictionRepairOperations = (world: WorldFile, flowId: number, input: { operations: string[]; repairText: string }): Array<{ operation: string; repair_text: string; position: number }> => {
  world.db.prepare("DELETE FROM contradiction_repair_operations WHERE flow_id = ?").run(flowId);
  input.operations.forEach((operation, index) => {
    world.db.prepare(`
      INSERT INTO contradiction_repair_operations (flow_id, position, operation, repair_text)
      VALUES (?, ?, ?, ?)
    `).run(flowId, index + 1, operation, input.repairText);
  });
  return contradictionRepairOperations(world, flowId);
};

export const contradictionRepairTargets = (world: WorldFile, flowId: number): Array<{ record_id: number; next_canon_status: string; new_title: string | null; new_body: string | null; note: string; advisory_record_id: number | null }> =>
  world.db.prepare("SELECT record_id, next_canon_status, new_title, new_body, note, advisory_record_id FROM contradiction_repair_targets WHERE flow_id = ? ORDER BY id").all(flowId) as Array<{ record_id: number; next_canon_status: string; new_title: string | null; new_body: string | null; note: string; advisory_record_id: number | null }>;

export const insertContradictionRepairTarget = (world: WorldFile, input: { flowId: number; recordId: number; nextCanonStatus: string; newTitle?: string; newBody?: string; note?: string; advisoryRecordId?: number }): FlowInstanceRow => {
  const result = world.db.prepare(`
    INSERT INTO contradiction_repair_targets (flow_id, record_id, next_canon_status, new_title, new_body, note, advisory_record_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(input.flowId, input.recordId, input.nextCanonStatus, input.newTitle ?? null, input.newBody ?? null, input.note ?? "", input.advisoryRecordId ?? null);
  return world.db.prepare("SELECT * FROM contradiction_repair_targets WHERE id = ?").get(result.lastInsertRowid) as FlowInstanceRow;
};

export const insertContradictionRepairCreatedProposal = (world: WorldFile, input: { flowId: number; proposalRecordId: number; reportRecordId?: number | null }): void => {
  world.db.prepare(`
    INSERT INTO contradiction_repair_created_proposals (flow_id, proposal_record_id, report_record_id)
    VALUES (?, ?, ?)
  `).run(input.flowId, input.proposalRecordId, input.reportRecordId ?? null);
};

export const contradictionRepairCreatedProposals = (world: WorldFile, flowId: number): FlowInstanceRow[] =>
  world.db.prepare("SELECT * FROM contradiction_repair_created_proposals WHERE flow_id = ? ORDER BY id").all(flowId) as FlowInstanceRow[];

export const assignContradictionReportToCreatedProposals = (world: WorldFile, flowId: number, reportRecordId: number): void => {
  world.db.prepare("UPDATE contradiction_repair_created_proposals SET report_record_id = ? WHERE flow_id = ? AND report_record_id IS NULL").run(reportRecordId, flowId);
};

export const contradictionRetconCosts = (world: WorldFile, flowId: number): Array<{ retcon_type: string; cost_key: string; cost_text: string }> =>
  world.db.prepare("SELECT retcon_type, cost_key, cost_text FROM contradiction_retcon_costs WHERE flow_id = ? ORDER BY id").all(flowId) as Array<{ retcon_type: string; cost_key: string; cost_text: string }>;

export const replaceContradictionRetconCosts = (world: WorldFile, flowId: number, input: { retconType: string; costs: Array<{ cost: string; text: string }> }): Array<{ retcon_type: string; cost_key: string; cost_text: string }> => {
  world.db.prepare("DELETE FROM contradiction_retcon_costs WHERE flow_id = ?").run(flowId);
  for (const cost of input.costs) {
    world.db.prepare(`
      INSERT INTO contradiction_retcon_costs (flow_id, retcon_type, cost_key, cost_text)
      VALUES (?, ?, ?, ?)
    `).run(flowId, input.retconType, cost.cost, cost.text);
  }
  return contradictionRetconCosts(world, flowId);
};

export const contradictionRepairPropagation = (world: WorldFile, flowId: number): FlowInstanceRow | null =>
  (world.db.prepare("SELECT * FROM contradiction_repair_propagation WHERE flow_id = ?").get(flowId) as FlowInstanceRow | undefined) ?? null;

export const upsertContradictionRepairPropagation = (world: WorldFile, input: { flowId: number; action: "assign" | "decline"; debtRecordId: number | null; skipRecordId: number | null; note: string }): FlowInstanceRow => {
  world.db.prepare(`
    INSERT INTO contradiction_repair_propagation (flow_id, action, debt_record_id, skip_record_id, note)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(flow_id) DO UPDATE SET
      action = excluded.action,
      debt_record_id = excluded.debt_record_id,
      skip_record_id = excluded.skip_record_id,
      note = excluded.note
  `).run(input.flowId, input.action, input.debtRecordId, input.skipRecordId, input.note);
  return contradictionRepairPropagation(world, input.flowId)!;
};

export const completedMysteryChecklistForFlow = (world: WorldFile, flowId: number): boolean =>
  Boolean(world.db.prepare("SELECT 1 FROM mystery_preservation_checklists WHERE flow_id = ? AND completed = 1 LIMIT 1").get(flowId));

export const owedBoundaryRows = (world: WorldFile): FlowInstanceRow[] =>
  world.db.prepare(`
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
  `).all() as FlowInstanceRow[];

export const insertMysteryBoundaryLink = (world: WorldFile, propagationDispositionId: number, ledgerRecordId: number): void => {
  world.db.prepare(`
    INSERT OR IGNORE INTO contradiction_mystery_boundary_links (propagation_disposition_id, ledger_record_id)
    VALUES (?, ?)
  `).run(propagationDispositionId, ledgerRecordId);
};

export const insertMysteryPreservationChecklist = (world: WorldFile, input: { flowId?: number; ledgerRecordId?: number; protectedRecordId?: number; operation: string; effectType: string; body: string; sacredGuardBody?: string }): FlowInstanceRow => {
  const result = world.db.prepare(`
    INSERT INTO mystery_preservation_checklists (flow_id, ledger_record_id, protected_record_id, operation, effect_type, body, sacred_guard_body, completed)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `).run(input.flowId ?? null, input.ledgerRecordId ?? null, input.protectedRecordId ?? null, input.operation, input.effectType, input.body, input.sacredGuardBody ?? "");
  return world.db.prepare("SELECT * FROM mystery_preservation_checklists WHERE id = ?").get(result.lastInsertRowid) as FlowInstanceRow;
};

export const mysteryPreservationChecklistsForFlow = (world: WorldFile, flowId: number): FlowInstanceRow[] =>
  world.db.prepare("SELECT * FROM mystery_preservation_checklists WHERE flow_id = ? ORDER BY id").all(flowId) as FlowInstanceRow[];
