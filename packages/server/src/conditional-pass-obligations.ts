import type { RecordRow, WorldFile } from "./world-file.js";

export type ConditionalPassKey = "temporal_timeline" | "constraint_composition" | "institutional_economic_suppression";
export type ConditionalPassDisposition = "outstanding" | "covered" | "deferred";

interface ObligationRow {
  id: number;
  record_id: number;
  source_fact_record_id: number;
  propagation_report_record_id: number;
  pass_key: ConditionalPassKey;
  ordinal: number;
  disposition: ConditionalPassDisposition;
  rationale: string | null;
  covering_report_record_id: number | null;
  actor_id: number;
  actor_name: string;
  flow_step: string;
  created_at: string;
  updated_at: string;
}

const PASS_DEFINITIONS = [
  { passKey: "temporal_timeline" as const, ordinal: 1, label: "Temporal/Timeline", destinationKey: "temporal", href: "/api/temporal/runs/start" },
  { passKey: "constraint_composition" as const, ordinal: 2, label: "Constraint Composition", destinationKey: "constraint", href: "/api/constraint-composition/runs/start" },
  { passKey: "institutional_economic_suppression" as const, ordinal: 3, label: "Institutional / Economic / Suppression", destinationKey: "stage12", href: "/api/institutional/runs/start" }
];

const rowById = (world: WorldFile, id: number): ObligationRow => {
  const row = world.db.prepare(`
  SELECT obligation.*, actor.name AS actor_name
  FROM conditional_pass_obligations obligation
  JOIN actors actor ON actor.id = obligation.actor_id
  WHERE obligation.id = ?
  `).get(id) as ObligationRow | undefined;
  if (!row) throw new Error(`unknown conditional-pass obligation: ${id}`);
  return row;
};

const rows = (world: WorldFile): ObligationRow[] => world.db.prepare(`
  SELECT obligation.*, actor.name AS actor_name
  FROM conditional_pass_obligations obligation
  JOIN actors actor ON actor.id = obligation.actor_id
  ORDER BY obligation.source_fact_record_id, obligation.propagation_report_record_id, obligation.ordinal, obligation.id
`).all() as ObligationRow[];

const isFoundationalFact = (world: WorldFile, factRecordId: number): boolean => {
  const facets = world.db.prepare(`
    SELECT vocabulary, term
    FROM record_facets
    WHERE record_id = ?
      AND ((vocabulary = 'admission_level' AND term IN ('4', '5'))
        OR (vocabulary = 'work_scale' AND term IN ('severe', 'catastrophic')))
  `).all(factRecordId);
  return facets.length > 0;
};

const eventRows = (world: WorldFile, obligationId: number) => world.db.prepare(`
  SELECT event.*, actor.name AS actor_name
  FROM conditional_pass_obligation_events event
  JOIN actors actor ON actor.id = event.actor_id
  WHERE event.obligation_id = ?
  ORDER BY event.id
`).all(obligationId) as Array<Record<string, unknown>>;

const toPublic = (world: WorldFile, row: ObligationRow) => {
  const definition = PASS_DEFINITIONS.find((item) => item.passKey === row.pass_key)!;
  const sourceFact = world.getRecord(row.source_fact_record_id);
  const propagationReport = world.getRecord(row.propagation_report_record_id);
  const coveringEvidence = row.covering_report_record_id == null ? null : world.getRecord(row.covering_report_record_id);
  return {
    id: row.id,
    record: world.getRecord(row.record_id),
    sourceFact,
    propagationReport,
    passKey: row.pass_key,
    passLabel: definition.label,
    ordinal: row.ordinal,
    disposition: row.disposition,
    rationale: row.rationale,
    coveringEvidence,
    doctrine: "A foundational Propagation run owes Temporal/Timeline, Constraint Composition, and Institutional / Economic / Suppression before further dependency-bearing Admission; Admission remains available.",
    blocker: null,
    destination: {
      destinationKey: definition.destinationKey,
      label: definition.label,
      method: "POST" as const,
      href: definition.href,
      body: { sourceType: "fact" as const, recordId: sourceFact.id }
    },
    provenance: {
      actor: row.actor_name,
      timestamp: row.created_at,
      flowStep: row.flow_step,
      sourceFact: { id: sourceFact.id, shortId: sourceFact.shortId },
      propagationReport: { id: propagationReport.id, shortId: propagationReport.shortId }
    },
    history: eventRows(world, row.id).map((event) => ({
      action: String(event.action_key),
      priorState: event.prior_disposition == null ? null : String(event.prior_disposition),
      resultingState: String(event.resulting_disposition),
      rationale: event.rationale == null ? null : String(event.rationale),
      evidenceRecordId: event.evidence_record_id == null ? null : Number(event.evidence_record_id),
      actor: String(event.actor_name),
      timestamp: String(event.created_at),
      flowStep: String(event.flow_step)
    })),
    readSideTrail: [
      { label: `Source fact ${sourceFact.shortId}`, recordId: sourceFact.id, href: `/api/canon-workbench/records/${sourceFact.id}` },
      { label: `Propagation report ${propagationReport.shortId}`, recordId: propagationReport.id, href: `/api/canon-workbench/records/${propagationReport.id}` },
      { label: `Obligation ${world.getRecord(row.record_id).shortId}`, recordId: row.record_id, href: `/api/canon-workbench/records/${row.record_id}` }
    ],
    action: row.disposition === "outstanding" ? {
      method: "POST" as const,
      href: `/api/conditional-pass-obligations/${row.id}/defer`,
      requiredRationale: true as const,
      body: {
        disposition: "deferred" as const,
        passKey: row.pass_key,
        sourceFactRecordId: sourceFact.id,
        propagationReportRecordId: propagationReport.id
      },
      proposedWrite: `Defer ${definition.label} for ${sourceFact.shortId} from ${propagationReport.shortId}; preserve the obligation as governed history.`,
      willLeaveUntouched: ["source fact text and canon standing", "append-only Propagation report", "canon debt", "Admission queue", "sibling obligations", "conditional-pass runs"]
    } : null
  };
};

export type ConditionalPassObligation = ReturnType<typeof toPublic>;

export const listConditionalPassObligations = (world: WorldFile): ConditionalPassObligation[] =>
  rows(world).map((row) => toPublic(world, row));

export const emitFoundationalObligations = (
  world: WorldFile,
  input: { sourceFactRecordId: number; propagationReportRecordId: number; eventKind?: "emitted" | "reconciled" }
): ConditionalPassObligation[] => {
  if (!isFoundationalFact(world, input.sourceFactRecordId)) return [];
  const sourceFact = world.getRecord(input.sourceFactRecordId);
  const report = world.getRecord(input.propagationReportRecordId);
  if (sourceFact.recordTypeKey !== "canon_fact") throw new Error("conditional-pass obligations require a canon_fact source");
  if (report.recordTypeKey !== "propagation_report") throw new Error("conditional-pass obligations require a final propagation_report");

  for (const definition of PASS_DEFINITIONS) {
    const existing = world.db.prepare(`
      SELECT id FROM conditional_pass_obligations
      WHERE source_fact_record_id = ? AND propagation_report_record_id = ? AND pass_key = ?
    `).get(sourceFact.id, report.id, definition.passKey) as { id: number } | undefined;
    if (existing) continue;
    const record = world.createRecord({
      recordTypeKey: "conditional_pass_obligation",
      title: `${definition.label} owed for ${sourceFact.shortId} after ${report.shortId}`,
      body: `${sourceFact.shortId} and ${report.shortId} owe the ${definition.label} pass. Identity and routing come from structured obligation state, not this prose.`,
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    });
    const result = world.db.prepare(`
      INSERT INTO conditional_pass_obligations (
        record_id, source_fact_record_id, propagation_report_record_id, pass_key, ordinal, disposition, flow_step
      ) VALUES (?, ?, ?, ?, ?, 'outstanding', ?)
    `).run(record.id, sourceFact.id, report.id, definition.passKey, definition.ordinal, input.eventKind === "reconciled" ? "world-open:conditional-pass-reconciliation" : "propagation:close:conditional-pass-handoff");
    const obligationId = Number(result.lastInsertRowid);
    world.createLink(record.id, sourceFact.id, "derived_from", "Conditional-pass obligation source fact");
    world.createLink(record.id, report.id, "derived_from", "Conditional-pass obligation final Propagation report");
    world.db.prepare(`
      INSERT INTO conditional_pass_obligation_events (
        obligation_id, action_key, resulting_disposition, flow_step
      ) VALUES (?, ?, 'outstanding', ?)
    `).run(obligationId, input.eventKind ?? "emitted", input.eventKind === "reconciled" ? "world-open:conditional-pass-reconciliation" : "propagation:close:conditional-pass-handoff");
  }
  return rows(world)
    .filter((row) => row.source_fact_record_id === sourceFact.id && row.propagation_report_record_id === report.id)
    .map((row) => toPublic(world, row));
};

export const reconcileHistoricalFoundationalObligations = (world: WorldFile): ConditionalPassObligation[] =>
  world.atomicWrite(() => {
    const closedRuns = world.db.prepare(`
      SELECT flow.propagation_fact_record_id AS source_fact_record_id,
             flow.propagation_report_record_id AS propagation_report_record_id
      FROM flow_instances flow
      JOIN records fact ON fact.id = flow.propagation_fact_record_id AND fact.record_type_key = 'canon_fact'
      JOIN records report ON report.id = flow.propagation_report_record_id AND report.record_type_key = 'propagation_report'
      WHERE flow.flow_key = 'propagation'
        AND flow.state = 'complete'
        AND flow.propagation_fact_record_id IS NOT NULL
        AND flow.propagation_report_record_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM record_links link
          WHERE link.from_record_id = flow.propagation_fact_record_id
            AND link.to_record_id = flow.propagation_report_record_id
            AND link.link_type_key = 'digest_of'
        )
      ORDER BY flow.id
    `).all() as Array<{ source_fact_record_id: number; propagation_report_record_id: number }>;
    for (const run of closedRuns) {
      emitFoundationalObligations(world, {
        sourceFactRecordId: run.source_fact_record_id,
        propagationReportRecordId: run.propagation_report_record_id,
        eventKind: "reconciled"
      });
    }
    return listConditionalPassObligations(world);
  });

export const getConditionalPassObligation = (world: WorldFile, id: number): ConditionalPassObligation =>
  toPublic(world, rowById(world, id));

export const deferConditionalPassObligation = (
  world: WorldFile,
  input: {
    obligationId: number;
    rationale: string;
    disposition?: string;
    passKey?: string;
    sourceFactRecordId?: number;
    propagationReportRecordId?: number;
  }
): { obligation: ConditionalPassObligation; created: boolean } => {
  const rationale = input.rationale?.trim();
  if (!rationale) throw new Error("Conditional-pass deferral requires a non-empty written rationale");
  return world.atomicWrite(() => {
    const current = rowById(world, input.obligationId);
    if (input.disposition != null && input.disposition !== "deferred") throw new Error(`unknown conditional-pass disposition: ${input.disposition}`);
    if (input.passKey != null && input.passKey !== current.pass_key) throw new Error(`unknown or mismatched conditional-pass key: ${input.passKey}`);
    if (input.sourceFactRecordId != null && input.sourceFactRecordId !== current.source_fact_record_id) throw new Error("conditional-pass obligation source fact does not match the governed obligation");
    if (input.propagationReportRecordId != null && input.propagationReportRecordId !== current.propagation_report_record_id) throw new Error("conditional-pass obligation Propagation report does not match the governed obligation");
    if (current.disposition === "covered") throw new Error("Covered conditional-pass obligations cannot be deferred");
    if (current.disposition === "deferred") {
      if (current.rationale !== rationale) throw new Error("Conditional-pass obligation is already deferred with a different rationale");
      return { obligation: toPublic(world, current), created: false };
    }
    world.db.prepare(`
      UPDATE conditional_pass_obligations
      SET disposition = 'deferred', rationale = ?, covering_report_record_id = NULL,
          actor_id = 1, flow_step = 'conditional-pass-obligation:defer'
      WHERE id = ? AND disposition = 'outstanding'
    `).run(rationale, current.id);
    world.db.prepare(`
      INSERT INTO conditional_pass_obligation_events (
        obligation_id, action_key, prior_disposition, resulting_disposition, rationale, actor_id, flow_step
      ) VALUES (?, 'deferred', 'outstanding', 'deferred', ?, 1, 'conditional-pass-obligation:defer')
    `).run(current.id, rationale);
    return { obligation: toPublic(world, rowById(world, current.id)), created: true };
  });
};

export const coverMatchingConditionalPassObligation = (
  world: WorldFile,
  input: { passKey: ConditionalPassKey; sourceFactRecordId: number; coveringReportRecordId: number; flowStep: string }
): ConditionalPassObligation | null => {
  const source = world.getRecord(input.sourceFactRecordId);
  const evidence = world.getRecord(input.coveringReportRecordId);
  if (source.recordTypeKey !== "canon_fact") throw new Error("Conditional-pass coverage requires the obligation's canon_fact source");
  if (evidence.recordTypeKey !== "pass_report") throw new Error("Conditional-pass coverage requires a completed pass_report");
  return world.atomicWrite(() => {
    const matches = world.db.prepare(`
      SELECT id
      FROM conditional_pass_obligations
      WHERE source_fact_record_id = ? AND pass_key = ? AND disposition = 'outstanding'
      ORDER BY propagation_report_record_id, id
    `).all(source.id, input.passKey) as Array<{ id: number }>;
    if (matches.length === 0) return null;
    if (matches.length > 1) throw new Error(`Multiple outstanding ${input.passKey} obligations exist for ${source.shortId}; select the source Propagation report explicitly`);
    const current = rowById(world, matches[0]!.id);
    world.db.prepare(`
      UPDATE conditional_pass_obligations
      SET disposition = 'covered', rationale = NULL, covering_report_record_id = ?,
          actor_id = 1, flow_step = ?
      WHERE id = ? AND disposition = 'outstanding'
    `).run(evidence.id, input.flowStep, current.id);
    world.db.prepare(`
      INSERT INTO conditional_pass_obligation_events (
        obligation_id, action_key, prior_disposition, resulting_disposition, evidence_record_id, actor_id, flow_step
      ) VALUES (?, 'covered', 'outstanding', 'covered', ?, 1, ?)
    `).run(current.id, evidence.id, input.flowStep);
    return toPublic(world, rowById(world, current.id));
  });
};

export const conditionalPassRecord = (obligation: ConditionalPassObligation): RecordRow => obligation.record;
