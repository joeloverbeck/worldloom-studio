import { randomUUID } from "node:crypto";
import type { WorldFile } from "./world-file.js";

export type PropagationLifecycleState = "active" | "superseded" | "retracted";

export interface PropagationActiveSetState {
  revision: number;
  changedKind: string | null;
  changedRowId: number | null;
  changedReason: string | null;
  pressureUsedRevision: number | null;
  pressureOwedRevision: number | null;
  pressureSkipRevision: number | null;
}

interface PropagationFlowStoreRow {
  id: number;
  state: string;
  propagation_report_record_id: number | null;
  propagation_active_set_revision: number;
  propagation_active_set_changed_kind: string | null;
  propagation_active_set_changed_row_id: number | null;
  propagation_active_set_changed_reason: string | null;
  propagation_pressure_used_revision: number | null;
  propagation_pressure_owed_revision: number | null;
  propagation_pressure_skip_revision: number | null;
}

export interface PropagationLifecycleStoreRow {
  id: number;
  flow_id: number;
  actor_id: number;
  actor_name: string;
  flow_step: string;
  created_at: string;
  lineage_id: string;
  version: number;
  lifecycle_state: PropagationLifecycleState;
  prior_version_id: number | null;
  revision_reason: string | null;
  retired_at: string | null;
  retired_actor_id: number | null;
  retired_actor_name: string | null;
  retired_flow_step: string | null;
}

export interface PropagationConsequenceStoreRow extends PropagationLifecycleStoreRow {
  fact_record_id: number;
  order_key: string;
  order_label: string;
  domain_name: string | null;
  body: string;
  pressure: "normal" | "high";
}

export interface PropagationDomainSweepStoreRow extends PropagationLifecycleStoreRow {
  domain_name: string;
  triage: "direct" | "dependency" | "reaction" | "negative";
  declaration: string;
}

export interface PropagationDispositionStoreRow {
  id: number;
  flow_id: number;
  consequence_id: number;
  disposition: string;
  note: string;
  preservation_boundary: string | null;
  debt_record_id: number | null;
  actor_id: number;
  flow_step: string;
  created_at: string;
}

const consequenceSelect = `
  SELECT consequence.*, creator.name AS actor_name, retiree.name AS retired_actor_name
  FROM propagation_consequences consequence
  JOIN actors creator ON creator.id = consequence.actor_id
  LEFT JOIN actors retiree ON retiree.id = consequence.retired_actor_id
`;

const domainSweepSelect = `
  SELECT domain_sweep.*, creator.name AS actor_name, retiree.name AS retired_actor_name
  FROM propagation_domain_sweeps domain_sweep
  JOIN actors creator ON creator.id = domain_sweep.actor_id
  LEFT JOIN actors retiree ON retiree.id = domain_sweep.retired_actor_id
`;

const propagationFlow = (world: WorldFile, flowId: number): PropagationFlowStoreRow =>
  world.getFlowInstance(flowId, "propagation") as unknown as PropagationFlowStoreRow;

export const assertOpenPropagationRun = (world: WorldFile, flowId: number): PropagationFlowStoreRow => {
  const flow = propagationFlow(world, flowId);
  if (flow.state !== "in_progress" || flow.propagation_report_record_id != null) {
    throw new Error(`Propagation run ${flowId} is closed; pre-close revision actions are refused`);
  }
  return flow;
};

export const activeSetState = (world: WorldFile, flowId: number): PropagationActiveSetState => {
  const flow = propagationFlow(world, flowId);
  return {
    revision: flow.propagation_active_set_revision,
    changedKind: flow.propagation_active_set_changed_kind,
    changedRowId: flow.propagation_active_set_changed_row_id,
    changedReason: flow.propagation_active_set_changed_reason,
    pressureUsedRevision: flow.propagation_pressure_used_revision,
    pressureOwedRevision: flow.propagation_pressure_owed_revision,
    pressureSkipRevision: flow.propagation_pressure_skip_revision
  };
};

export const assertCurrentActiveSet = (world: WorldFile, flowId: number, expectedRevision?: number): PropagationActiveSetState => {
  const current = activeSetState(world, flowId);
  if (expectedRevision == null || expectedRevision !== current.revision) {
    const expected = expectedRevision == null ? "missing" : String(expectedRevision);
    const changed = current.changedKind == null
      ? "the active set changed"
      : `${current.changedKind}${current.changedRowId == null ? "" : ` for row ${current.changedRowId}`}`;
    throw new Error(`stale Propagation active set (packet revision ${expected}; current revision ${current.revision} after ${changed}); load the current packet before continuing`);
  }
  return current;
};

export const advanceActiveSet = (
  world: WorldFile,
  flowId: number,
  change: { kind: string; rowId: number; reason: string; substantive: boolean }
): PropagationActiveSetState => {
  const before = activeSetState(world, flowId);
  const revision = before.revision + 1;
  const pressureOwedRevision = change.substantive && before.pressureUsedRevision != null
    ? revision
    : before.pressureOwedRevision;
  world.db.prepare(`
    UPDATE flow_instances
    SET propagation_active_set_revision = ?,
        propagation_active_set_changed_kind = ?,
        propagation_active_set_changed_row_id = ?,
        propagation_active_set_changed_reason = ?,
        propagation_pressure_owed_revision = ?
    WHERE id = ? AND flow_key = 'propagation'
  `).run(revision, change.kind, change.rowId, change.reason, pressureOwedRevision, flowId);
  return activeSetState(world, flowId);
};

export const markPressureUsed = (world: WorldFile, flowId: number, expectedRevision?: number): PropagationActiveSetState => {
  const current = assertCurrentActiveSet(world, flowId, expectedRevision);
  world.db.prepare(`
    UPDATE flow_instances
    SET propagation_pressure_used_revision = ?,
        propagation_pressure_owed_revision = NULL,
        propagation_pressure_skip_revision = NULL
    WHERE id = ? AND flow_key = 'propagation'
  `).run(current.revision, flowId);
  return activeSetState(world, flowId);
};

export const markPressureSkipped = (world: WorldFile, flowId: number, expectedRevision?: number): PropagationActiveSetState => {
  const current = assertCurrentActiveSet(world, flowId, expectedRevision);
  world.db.prepare(`
    UPDATE flow_instances
    SET propagation_pressure_owed_revision = NULL,
        propagation_pressure_skip_revision = ?
    WHERE id = ? AND flow_key = 'propagation'
  `).run(current.revision, flowId);
  return activeSetState(world, flowId);
};

export const listConsequences = (world: WorldFile, flowId: number): PropagationConsequenceStoreRow[] =>
  world.db.prepare(`${consequenceSelect} WHERE consequence.flow_id = ? ORDER BY consequence.lineage_id, consequence.version, consequence.id`).all(flowId) as PropagationConsequenceStoreRow[];

export const listActiveConsequences = (world: WorldFile, flowId: number): PropagationConsequenceStoreRow[] =>
  world.db.prepare(`${consequenceSelect} WHERE consequence.flow_id = ? AND consequence.lifecycle_state = 'active' ORDER BY consequence.id`).all(flowId) as PropagationConsequenceStoreRow[];

export const getConsequence = (world: WorldFile, consequenceId: number): PropagationConsequenceStoreRow | null =>
  (world.db.prepare(`${consequenceSelect} WHERE consequence.id = ?`).get(consequenceId) as PropagationConsequenceStoreRow | undefined) ?? null;

export const insertConsequence = (world: WorldFile, input: {
  flowId: number;
  factRecordId: number;
  orderKey: string;
  orderLabel: string;
  domainName?: string;
  body: string;
  pressure: "normal" | "high";
  flowStep: string;
}): PropagationConsequenceStoreRow => {
  const lineageId = `propagation-consequence:${randomUUID()}`;
  const result = world.db.prepare(`
    INSERT INTO propagation_consequences (
      flow_id, fact_record_id, order_key, order_label, domain_name, body, pressure, flow_step,
      lineage_id, version, lifecycle_state
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'active')
  `).run(
    input.flowId,
    input.factRecordId,
    input.orderKey,
    input.orderLabel,
    input.domainName ?? null,
    input.body,
    input.pressure,
    input.flowStep,
    lineageId
  );
  return getConsequence(world, Number(result.lastInsertRowid))!;
};

export const listDomainSweeps = (world: WorldFile, flowId: number): PropagationDomainSweepStoreRow[] =>
  world.db.prepare(`${domainSweepSelect} WHERE domain_sweep.flow_id = ? ORDER BY domain_sweep.lineage_id, domain_sweep.version, domain_sweep.id`).all(flowId) as PropagationDomainSweepStoreRow[];

export const listActiveDomainSweeps = (world: WorldFile, flowId: number): PropagationDomainSweepStoreRow[] =>
  world.db.prepare(`${domainSweepSelect} WHERE domain_sweep.flow_id = ? AND domain_sweep.lifecycle_state = 'active' ORDER BY domain_sweep.id`).all(flowId) as PropagationDomainSweepStoreRow[];

export const getDomainSweep = (world: WorldFile, domainId: number): PropagationDomainSweepStoreRow | null =>
  (world.db.prepare(`${domainSweepSelect} WHERE domain_sweep.id = ?`).get(domainId) as PropagationDomainSweepStoreRow | undefined) ?? null;

export const insertDomainSweep = (world: WorldFile, input: {
  flowId: number;
  domainName: string;
  triage: string;
  declaration?: string;
}): PropagationDomainSweepStoreRow => {
  const existing = world.db.prepare(`
    SELECT id FROM propagation_domain_sweeps
    WHERE flow_id = ? AND domain_name = ? AND lifecycle_state = 'active'
  `).get(input.flowId, input.domainName) as { id: number } | undefined;
  if (existing) throw new Error(`Domain ${input.domainName} already has an active declaration; revise row ${existing.id} instead`);
  const result = world.db.prepare(`
    INSERT INTO propagation_domain_sweeps (
      flow_id, domain_name, triage, declaration, flow_step, lineage_id, version, lifecycle_state
    )
    VALUES (?, ?, ?, ?, 'propagation:domain-atlas', ?, 1, 'active')
  `).run(input.flowId, input.domainName, input.triage, input.declaration ?? "", `propagation-domain:${randomUUID()}`);
  return getDomainSweep(world, Number(result.lastInsertRowid))!;
};

export const listDispositions = (world: WorldFile, flowId: number): PropagationDispositionStoreRow[] =>
  world.db.prepare(`
    SELECT d.*, c.flow_id
    FROM propagation_consequence_dispositions d
    JOIN propagation_consequences c ON c.id = d.consequence_id
    WHERE c.flow_id = ?
    ORDER BY d.id
  `).all(flowId) as PropagationDispositionStoreRow[];

export const dispositionForConsequence = (world: WorldFile, consequenceId: number): PropagationDispositionStoreRow | null =>
  (world.db.prepare(`
    SELECT d.*, c.flow_id
    FROM propagation_consequence_dispositions d
    JOIN propagation_consequences c ON c.id = d.consequence_id
    WHERE d.consequence_id = ?
  `).get(consequenceId) as PropagationDispositionStoreRow | undefined) ?? null;

export const insertDisposition = (world: WorldFile, input: {
  consequenceId: number;
  disposition: string;
  note?: string;
  preservationBoundary?: string;
  debtRecordId?: number | null;
}): PropagationDispositionStoreRow => {
  const result = world.db.prepare(`
    INSERT INTO propagation_consequence_dispositions (
      consequence_id, disposition, note, preservation_boundary, debt_record_id, flow_step
    )
    VALUES (?, ?, ?, ?, ?, 'propagation:disposition')
  `).run(
    input.consequenceId,
    input.disposition,
    input.note ?? "",
    input.preservationBoundary ?? null,
    input.debtRecordId ?? null
  );
  return world.db.prepare(`
    SELECT d.*, c.flow_id
    FROM propagation_consequence_dispositions d
    JOIN propagation_consequences c ON c.id = d.consequence_id
    WHERE d.id = ?
  `).get(result.lastInsertRowid) as PropagationDispositionStoreRow;
};

export const listUndispositionedHighPressure = (world: WorldFile, flowId: number): PropagationConsequenceStoreRow[] =>
  world.db.prepare(`
    SELECT c.*, creator.name AS actor_name, retiree.name AS retired_actor_name
    FROM propagation_consequences c
    JOIN actors creator ON creator.id = c.actor_id
    LEFT JOIN actors retiree ON retiree.id = c.retired_actor_id
    LEFT JOIN propagation_consequence_dispositions d ON d.consequence_id = c.id
    WHERE c.flow_id = ?
      AND c.lifecycle_state = 'active'
      AND c.pressure = 'high'
      AND d.id IS NULL
    ORDER BY c.id
  `).all(flowId) as PropagationConsequenceStoreRow[];

const requireActiveTarget = <Row extends PropagationLifecycleStoreRow>(row: Row | null, kind: "consequence" | "domain", rowId: number, flowId: number): Row => {
  if (!row) throw new Error(`Propagation ${kind} not found: ${rowId}`);
  if (row.flow_id !== flowId) throw new Error(`Propagation ${kind} ${rowId} does not belong to run ${flowId}`);
  if (row.lifecycle_state !== "active") throw new Error(`Propagation ${kind} ${rowId} is already ${row.lifecycle_state}`);
  return row;
};

const retireVersion = (
  world: WorldFile,
  table: "propagation_consequences" | "propagation_domain_sweeps",
  rowId: number,
  state: Exclude<PropagationLifecycleState, "active">,
  reason: string,
  flowStep: string
): void => {
  world.db.prepare(`
    UPDATE ${table}
    SET lifecycle_state = ?,
        revision_reason = ?,
        retired_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
        retired_actor_id = 1,
        retired_flow_step = ?
    WHERE id = ? AND lifecycle_state = 'active'
  `).run(state, reason, flowStep, rowId);
};

export const reviseConsequence = (world: WorldFile, input: {
  flowId: number;
  consequenceId: number;
  reason: string;
  orderKey: string;
  orderLabel: string;
  domainName?: string;
  body: string;
  pressure: "normal" | "high";
}): { retired: PropagationConsequenceStoreRow; active: PropagationConsequenceStoreRow; invalidatedDisposition: PropagationDispositionStoreRow | null } => {
  const target = requireActiveTarget(getConsequence(world, input.consequenceId), "consequence", input.consequenceId, input.flowId);
  const invalidatedDisposition = dispositionForConsequence(world, input.consequenceId);
  retireVersion(world, "propagation_consequences", input.consequenceId, "superseded", input.reason, "propagation:consequence-revision");
  const result = world.db.prepare(`
    INSERT INTO propagation_consequences (
      flow_id, fact_record_id, order_key, order_label, domain_name, body, pressure, actor_id, flow_step,
      lineage_id, version, lifecycle_state, prior_version_id, revision_reason
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'propagation:consequence-revision', ?, ?, 'active', ?, ?)
  `).run(
    input.flowId,
    target.fact_record_id,
    input.orderKey,
    input.orderLabel,
    input.domainName ?? null,
    input.body,
    input.pressure,
    target.lineage_id,
    target.version + 1,
    input.consequenceId,
    input.reason
  );
  return {
    retired: getConsequence(world, input.consequenceId)!,
    active: getConsequence(world, Number(result.lastInsertRowid))!,
    invalidatedDisposition
  };
};

export const retractConsequence = (world: WorldFile, input: {
  flowId: number;
  consequenceId: number;
  reason: string;
}): { retired: PropagationConsequenceStoreRow; invalidatedDisposition: PropagationDispositionStoreRow | null } => {
  requireActiveTarget(getConsequence(world, input.consequenceId), "consequence", input.consequenceId, input.flowId);
  const invalidatedDisposition = dispositionForConsequence(world, input.consequenceId);
  retireVersion(world, "propagation_consequences", input.consequenceId, "retracted", input.reason, "propagation:consequence-retraction");
  return { retired: getConsequence(world, input.consequenceId)!, invalidatedDisposition };
};

export const reviseDomainSweep = (world: WorldFile, input: {
  flowId: number;
  domainId: number;
  reason: string;
  triage: string;
  declaration?: string;
}): { retired: PropagationDomainSweepStoreRow; active: PropagationDomainSweepStoreRow } => {
  const target = requireActiveTarget(getDomainSweep(world, input.domainId), "domain", input.domainId, input.flowId);
  retireVersion(world, "propagation_domain_sweeps", input.domainId, "superseded", input.reason, "propagation:domain-revision");
  const result = world.db.prepare(`
    INSERT INTO propagation_domain_sweeps (
      flow_id, domain_name, triage, declaration, actor_id, flow_step,
      lineage_id, version, lifecycle_state, prior_version_id, revision_reason
    )
    VALUES (?, ?, ?, ?, 1, 'propagation:domain-revision', ?, ?, 'active', ?, ?)
  `).run(
    input.flowId,
    target.domain_name,
    input.triage,
    input.declaration ?? "",
    target.lineage_id,
    target.version + 1,
    input.domainId,
    input.reason
  );
  return {
    retired: getDomainSweep(world, input.domainId)!,
    active: getDomainSweep(world, Number(result.lastInsertRowid))!
  };
};

export const retractDomainSweep = (world: WorldFile, input: {
  flowId: number;
  domainId: number;
  reason: string;
}): { retired: PropagationDomainSweepStoreRow } => {
  requireActiveTarget(getDomainSweep(world, input.domainId), "domain", input.domainId, input.flowId);
  retireVersion(world, "propagation_domain_sweeps", input.domainId, "retracted", input.reason, "propagation:domain-retraction");
  return { retired: getDomainSweep(world, input.domainId)! };
};
