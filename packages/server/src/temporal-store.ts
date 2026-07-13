import { randomUUID } from "node:crypto";
import type { WorldFile } from "./world-file.js";

export interface TemporalRunStoreRow {
  flow_id: number;
  source_type: "fact" | "capability" | "canon_debt" | "material";
  source_record_id: number | null;
  material_title: string;
  material_body: string;
  audited_subject: string;
  source_summary: string;
  retained_prior_report_record_id: number | null;
  final_report_record_id: number | null;
  active_set_revision: number;
  active_set_changed_revision_id: number | null;
  active_set_changed_reason: string | null;
  pressure_used_revision: number | null;
  pressure_owed_revision: number | null;
  pressure_skip_revision: number | null;
  draft_state: "current" | "failed";
  attempted_revision_json: string | null;
  attempt_error: string | null;
  attempt_remediation: string | null;
  created_at: string;
  finalized_at: string | null;
}

export interface TemporalCoverageValues {
  temporalQuestions: string;
  firstTrueOrRelativeSequence: string;
  firstKnownOrReason: string;
  dateTypesAndGranularity: string;
  latency: string;
  residueByTimescale: string;
  sequenceIntegrity: string;
  retrospectiveInsertion: string;
  temporalMysteryBoundaries: string;
  outcomeDecision: string;
}

interface TemporalCoverageStoreRow {
  id: number;
  flow_id: number;
  lineage_id: string;
  version: number;
  lifecycle_state: "active" | "superseded";
  prior_version_id: number | null;
  revision_reason: string | null;
  temporal_questions: string;
  first_true_or_relative_sequence: string;
  first_known_or_reason: string;
  date_types_and_granularity: string;
  latency: string;
  residue_by_timescale: string;
  sequence_integrity: string;
  retrospective_insertion: string;
  temporal_mystery_boundaries: string;
  outcome_decision: string;
  actor_id: number;
  actor_name: string;
  flow_step: string;
  created_at: string;
  retired_at: string | null;
  retired_actor_id: number | null;
  retired_actor_name: string | null;
  retired_flow_step: string | null;
}

export interface TemporalCoverageRevision {
  id: number;
  flowId: number;
  lineageId: string;
  version: number;
  lifecycleState: "active" | "superseded";
  priorVersionId: number | null;
  revisionReason: string | null;
  values: TemporalCoverageValues;
  provenance: { actorId: number; actor: string; timestamp: string; flowStep: string };
  retirementProvenance: { actorId: number; actor: string; timestamp: string; flowStep: string } | null;
}

const revisionSelect = `
  SELECT revision.*, creator.name AS actor_name, retiree.name AS retired_actor_name
  FROM temporal_coverage_revisions revision
  JOIN actors creator ON creator.id = revision.actor_id
  LEFT JOIN actors retiree ON retiree.id = revision.retired_actor_id
`;

const mapRevision = (row: TemporalCoverageStoreRow): TemporalCoverageRevision => ({
  id: row.id,
  flowId: row.flow_id,
  lineageId: row.lineage_id,
  version: row.version,
  lifecycleState: row.lifecycle_state,
  priorVersionId: row.prior_version_id,
  revisionReason: row.revision_reason,
  values: {
    temporalQuestions: row.temporal_questions,
    firstTrueOrRelativeSequence: row.first_true_or_relative_sequence,
    firstKnownOrReason: row.first_known_or_reason,
    dateTypesAndGranularity: row.date_types_and_granularity,
    latency: row.latency,
    residueByTimescale: row.residue_by_timescale,
    sequenceIntegrity: row.sequence_integrity,
    retrospectiveInsertion: row.retrospective_insertion,
    temporalMysteryBoundaries: row.temporal_mystery_boundaries,
    outcomeDecision: row.outcome_decision
  },
  provenance: { actorId: row.actor_id, actor: row.actor_name, timestamp: row.created_at, flowStep: row.flow_step },
  retirementProvenance: row.retired_at == null || row.retired_actor_id == null || row.retired_actor_name == null || row.retired_flow_step == null
    ? null
    : { actorId: row.retired_actor_id, actor: row.retired_actor_name, timestamp: row.retired_at, flowStep: row.retired_flow_step }
});

export const getRun = (world: WorldFile, flowId: number): TemporalRunStoreRow => {
  const row = world.db.prepare("SELECT * FROM temporal_runs WHERE flow_id = ?").get(flowId) as TemporalRunStoreRow | undefined;
  if (!row) throw new Error(`Temporal run ${flowId} has no staged run state`);
  return row;
};

export const findRun = (world: WorldFile, flowId: number): TemporalRunStoreRow | null =>
  (world.db.prepare("SELECT * FROM temporal_runs WHERE flow_id = ?").get(flowId) as TemporalRunStoreRow | undefined) ?? null;

export const listOpenRuns = (world: WorldFile): TemporalRunStoreRow[] =>
  world.db.prepare(`
    SELECT run.*
    FROM temporal_runs run
    JOIN flow_instances flow ON flow.id = run.flow_id
    WHERE flow.flow_key = 'temporal_timeline' AND flow.state = 'in_progress'
    ORDER BY run.flow_id DESC
  `).all() as TemporalRunStoreRow[];

export const createRun = (world: WorldFile, input: {
  flowId: number;
  sourceType: TemporalRunStoreRow["source_type"];
  sourceRecordId: number | null;
  materialTitle: string;
  materialBody: string;
  auditedSubject: string;
  sourceSummary: string;
  retainedPriorReportRecordId?: number | null;
}): TemporalRunStoreRow => {
  world.db.prepare(`
    INSERT INTO temporal_runs (
      flow_id, source_type, source_record_id, material_title, material_body,
      audited_subject, source_summary, retained_prior_report_record_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.flowId,
    input.sourceType,
    input.sourceRecordId,
    input.materialTitle,
    input.materialBody,
    input.auditedSubject,
    input.sourceSummary,
    input.retainedPriorReportRecordId ?? null
  );
  return getRun(world, input.flowId);
};

export const listRevisions = (world: WorldFile, flowId: number): TemporalCoverageRevision[] =>
  (world.db.prepare(`${revisionSelect} WHERE revision.flow_id = ? ORDER BY revision.version, revision.id`).all(flowId) as TemporalCoverageStoreRow[]).map(mapRevision);

export const activeRevision = (world: WorldFile, flowId: number): TemporalCoverageRevision | null => {
  const row = world.db.prepare(`${revisionSelect} WHERE revision.flow_id = ? AND revision.lifecycle_state = 'active'`).get(flowId) as TemporalCoverageStoreRow | undefined;
  return row ? mapRevision(row) : null;
};

export const getRevision = (world: WorldFile, revisionId: number): TemporalCoverageRevision | null => {
  const row = world.db.prepare(`${revisionSelect} WHERE revision.id = ?`).get(revisionId) as TemporalCoverageStoreRow | undefined;
  return row ? mapRevision(row) : null;
};

export const insertFirstRevision = (world: WorldFile, flowId: number, values: TemporalCoverageValues, flowStep = "temporal:coverage:first-save"): TemporalCoverageRevision => {
  const run = getRun(world, flowId);
  if (run.finalized_at != null) throw new Error(`Temporal run ${flowId} is closed; revision actions are refused`);
  if (activeRevision(world, flowId)) throw new Error("Temporal first save requires an empty staged lineage");
  const lineageId = `temporal-coverage:${randomUUID()}`;
  const result = world.db.prepare(`
    INSERT INTO temporal_coverage_revisions (
      flow_id, lineage_id, version, lifecycle_state, flow_step,
      temporal_questions, first_true_or_relative_sequence, first_known_or_reason,
      date_types_and_granularity, latency, residue_by_timescale, sequence_integrity,
      retrospective_insertion, temporal_mystery_boundaries, outcome_decision
    ) VALUES (?, ?, 1, 'active', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    flowId,
    lineageId,
    flowStep,
    values.temporalQuestions,
    values.firstTrueOrRelativeSequence,
    values.firstKnownOrReason,
    values.dateTypesAndGranularity,
    values.latency,
    values.residueByTimescale,
    values.sequenceIntegrity,
    values.retrospectiveInsertion,
    values.temporalMysteryBoundaries,
    values.outcomeDecision
  );
  const revisionId = Number(result.lastInsertRowid);
  world.db.prepare(`
    UPDATE temporal_runs
    SET active_set_revision = 1,
        active_set_changed_revision_id = ?,
        active_set_changed_reason = 'first staged Temporal coverage saved'
    WHERE flow_id = ?
  `).run(revisionId, flowId);
  return activeRevision(world, flowId)!;
};

export const replaceActiveRevision = (world: WorldFile, input: {
  flowId: number;
  expectedRevisionId: number;
  reason: string;
  values: TemporalCoverageValues;
}): TemporalCoverageRevision => {
  const run = getRun(world, input.flowId);
  if (run.finalized_at != null) throw new Error(`Temporal run ${input.flowId} is closed; revision actions are refused`);
  const target = getRevision(world, input.expectedRevisionId);
  if (!target) throw new Error(`Temporal revision ${input.expectedRevisionId} does not exist`);
  if (target.flowId !== input.flowId) throw new Error(`Temporal revision ${input.expectedRevisionId} belongs to another run`);
  if (target.lifecycleState !== "active") throw new Error(`Temporal revision ${input.expectedRevisionId} is retired; only the active revision can be replaced`);
  const active = activeRevision(world, input.flowId);
  if (!active || active.id !== target.id) throw new Error("Temporal revision target is not the authoritative active revision");
  const reason = input.reason.trim();
  if (!reason) throw new Error("Temporal material revision requires a non-empty steward-authored reason");
  if (JSON.stringify(target.values) === JSON.stringify(input.values)) throw new Error("Temporal material revision must change at least one lens value");

  world.db.prepare(`
    UPDATE temporal_coverage_revisions
    SET lifecycle_state = 'superseded',
        retired_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
        retired_actor_id = 1,
        retired_flow_step = 'temporal:coverage:revision'
    WHERE id = ? AND lifecycle_state = 'active'
  `).run(target.id);
  const result = world.db.prepare(`
    INSERT INTO temporal_coverage_revisions (
      flow_id, lineage_id, version, lifecycle_state, prior_version_id, revision_reason, flow_step,
      temporal_questions, first_true_or_relative_sequence, first_known_or_reason,
      date_types_and_granularity, latency, residue_by_timescale, sequence_integrity,
      retrospective_insertion, temporal_mystery_boundaries, outcome_decision
    ) VALUES (?, ?, ?, 'active', ?, ?, 'temporal:coverage:revision', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.flowId,
    target.lineageId,
    target.version + 1,
    target.id,
    reason,
    input.values.temporalQuestions,
    input.values.firstTrueOrRelativeSequence,
    input.values.firstKnownOrReason,
    input.values.dateTypesAndGranularity,
    input.values.latency,
    input.values.residueByTimescale,
    input.values.sequenceIntegrity,
    input.values.retrospectiveInsertion,
    input.values.temporalMysteryBoundaries,
    input.values.outcomeDecision
  );
  const replacementId = Number(result.lastInsertRowid);
  const activeSetRevision = run.active_set_revision + 1;
  const pressureOwedRevision = run.pressure_used_revision == null ? run.pressure_owed_revision : activeSetRevision;
  world.db.prepare(`
    UPDATE temporal_runs
    SET active_set_revision = ?,
        active_set_changed_revision_id = ?,
        active_set_changed_reason = ?,
        pressure_owed_revision = ?,
        draft_state = 'current',
        attempted_revision_json = NULL,
        attempt_error = NULL,
        attempt_remediation = NULL
    WHERE flow_id = ?
  `).run(activeSetRevision, replacementId, reason, pressureOwedRevision, input.flowId);
  return activeRevision(world, input.flowId)!;
};

export const markPressureUsed = (world: WorldFile, flowId: number): TemporalRunStoreRow => {
  const run = getRun(world, flowId);
  if (run.finalized_at != null) throw new Error(`Temporal run ${flowId} is closed; Prompt-out state cannot change`);
  world.db.prepare(`
    UPDATE temporal_runs
    SET pressure_used_revision = active_set_revision,
        pressure_owed_revision = NULL,
        pressure_skip_revision = NULL
    WHERE flow_id = ?
  `).run(flowId);
  return getRun(world, flowId);
};

export const markPressureSkipped = (world: WorldFile, flowId: number): TemporalRunStoreRow => {
  const run = getRun(world, flowId);
  if (run.finalized_at != null) throw new Error(`Temporal run ${flowId} is closed; Prompt-out state cannot change`);
  world.db.prepare(`
    UPDATE temporal_runs
    SET pressure_owed_revision = NULL,
        pressure_skip_revision = active_set_revision
    WHERE flow_id = ?
  `).run(flowId);
  return getRun(world, flowId);
};

export const recordFailedAttempt = (
  world: WorldFile,
  flowId: number,
  input: { attemptedInput: unknown; error: string; remediation: string }
): TemporalRunStoreRow => {
  const run = getRun(world, flowId);
  if (run.finalized_at != null) return run;
  world.db.prepare(`
    UPDATE temporal_runs
    SET draft_state = 'failed',
        attempted_revision_json = ?,
        attempt_error = ?,
        attempt_remediation = ?
    WHERE flow_id = ?
  `).run(JSON.stringify(input.attemptedInput), input.error, input.remediation, flowId);
  return getRun(world, flowId);
};

export const clearFailedAttempt = (world: WorldFile, flowId: number): TemporalRunStoreRow => {
  const run = getRun(world, flowId);
  if (run.finalized_at != null) throw new Error(`Temporal run ${flowId} is closed; recovery actions are refused`);
  world.db.prepare(`
    UPDATE temporal_runs
    SET draft_state = 'current',
        attempted_revision_json = NULL,
        attempt_error = NULL,
        attempt_remediation = NULL
    WHERE flow_id = ?
  `).run(flowId);
  return getRun(world, flowId);
};

const attemptedInput = (run: TemporalRunStoreRow): unknown => {
  if (run.attempted_revision_json == null) return null;
  try {
    return JSON.parse(run.attempted_revision_json);
  } catch {
    return null;
  }
};

export const revisionState = (world: WorldFile, flowId: number) => {
  const run = getRun(world, flowId);
  const active = activeRevision(world, flowId);
  return {
    lifecycleState: run.finalized_at == null ? "open" as const : "finalized" as const,
    active,
    lineage: listRevisions(world, flowId),
    draftState: {
      status: run.draft_state,
      dirty: run.draft_state === "failed",
      failed: run.draft_state === "failed",
      attemptedInput: attemptedInput(run),
      error: run.attempt_error,
      remediation: run.attempt_remediation
    },
    activeSet: {
      revision: run.active_set_revision,
      identity: `temporal:${flowId}:${run.active_set_revision}:${active?.id ?? "none"}`,
      changedRevisionId: run.active_set_changed_revision_id,
      changedReason: run.active_set_changed_reason,
      pressureUsedRevision: run.pressure_used_revision,
      pressureOwedRevision: run.pressure_owed_revision,
      pressureSkipRevision: run.pressure_skip_revision
    }
  };
};

export interface TemporalRunOutcomeStoreRow {
  flow_id: number;
  record_id: number;
  link_type_key: string;
  note: string;
  kind: string;
}

export const listOutcomes = (world: WorldFile, flowId: number): TemporalRunOutcomeStoreRow[] =>
  world.db.prepare("SELECT * FROM temporal_run_outcomes WHERE flow_id = ? ORDER BY record_id, link_type_key").all(flowId) as TemporalRunOutcomeStoreRow[];

export const addOutcome = (world: WorldFile, input: {
  flowId: number;
  recordId: number;
  linkTypeKey: string;
  note: string;
  kind: string;
}): void => {
  getRun(world, input.flowId);
  world.db.prepare(`
    INSERT OR IGNORE INTO temporal_run_outcomes (flow_id, record_id, link_type_key, note, kind)
    VALUES (?, ?, ?, ?, ?)
  `).run(input.flowId, input.recordId, input.linkTypeKey, input.note, input.kind);
};

export const finalizeRun = (world: WorldFile, flowId: number, reportRecordId: number): TemporalRunStoreRow => {
  const run = getRun(world, flowId);
  if (run.finalized_at != null || run.final_report_record_id != null) throw new Error(`Temporal run ${flowId} is already finalized`);
  world.db.prepare(`
    UPDATE temporal_runs
    SET final_report_record_id = ?, finalized_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE flow_id = ? AND finalized_at IS NULL
  `).run(reportRecordId, flowId);
  return getRun(world, flowId);
};
