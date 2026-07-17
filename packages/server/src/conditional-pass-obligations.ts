import type { RecordRow, WorldFile } from "./world-file.js";
import { resolveGuidedFlowSourceSelection } from "./guided-flow-source-selection.js";

export type ConditionalPassKey = "temporal_timeline" | "constraint_composition" | "institutional_economic_suppression";
export type ConditionalPassDisposition = "outstanding" | "covered" | "deferred";

export const CONDITIONAL_PASS_PACKAGE_SOURCES = [
  "docs/worldbuilding-system/03_truth_layers_and_canon_governance.md",
  "docs/worldbuilding-system/07_propagation_engine.md",
  "docs/worldbuilding-system/22_glossary.md"
] as const;

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

const latestTransitionEvent = (world: WorldFile, obligationId: number) => world.db.prepare(`
  SELECT action_key, rationale
  FROM conditional_pass_obligation_events
  WHERE obligation_id = ?
    AND action_key IN ('deferred', 'reinstated', 'covered')
  ORDER BY id DESC
  LIMIT 1
`).get(obligationId) as { action_key: string; rationale: string | null } | undefined;

const transitionError = (message: string, remediation: string, authoritativeState?: unknown): Error =>
  Object.assign(new Error(message), {
    remediation,
    ...(authoritativeState === undefined ? {} : { authoritativeState })
  });

const assertIdentityGuards = (
  current: ObligationRow,
  input: {
    passKey?: string;
    sourceFactRecordId?: number;
    propagationReportRecordId?: number;
  }
): void => {
  if (input.passKey != null && input.passKey !== current.pass_key) {
    throw transitionError(
      `unknown or mismatched conditional-pass key: ${input.passKey}`,
      "Reload the current Conditional-pass obligation and retry with the server-returned pass identity."
    );
  }
  if (input.sourceFactRecordId != null && input.sourceFactRecordId !== current.source_fact_record_id) {
    throw transitionError(
      "conditional-pass obligation source fact does not match the governed obligation",
      "Reload the current obligation and use its server-returned source fact identity."
    );
  }
  if (input.propagationReportRecordId != null && input.propagationReportRecordId !== current.propagation_report_record_id) {
    throw transitionError(
      "conditional-pass obligation Propagation report does not match the governed obligation",
      "Reload the current obligation and use its server-returned final Propagation report identity."
    );
  }
};

const toPublic = (world: WorldFile, row: ObligationRow) => {
  const definition = PASS_DEFINITIONS.find((item) => item.passKey === row.pass_key)!;
  const sourceFact = world.getRecord(row.source_fact_record_id);
  const propagationReport = world.getRecord(row.propagation_report_record_id);
  const coveringEvidence = row.covering_report_record_id == null ? null : world.getRecord(row.covering_report_record_id);
  const sourceSelection = resolveGuidedFlowSourceSelection(world, row.pass_key, {
    sourceType: "fact",
    recordId: sourceFact.id,
    conditionalPassObligationId: row.id,
    propagationReportRecordId: propagationReport.id
  });
  const fieldClassifications = {
    required: row.disposition === "covered" ? [] : ["reason"],
    optional: [],
    skippable: row.disposition === "covered" ? [] : ["governed deferral with written rationale"],
    severityDependent: []
  };
  const action = row.disposition === "outstanding"
    ? {
        kind: "defer" as const,
        label: "Defer with rationale",
        method: "POST" as const,
        href: `/api/conditional-pass-obligations/${row.id}/defer`,
        requiredReason: true as const,
        requiredRationale: true as const,
        reasonLabel: "Deferral rationale",
        identityGuards: ["passKey", "sourceFactRecordId", "propagationReportRecordId"] as const,
        body: {
          disposition: "deferred" as const,
          expectedDisposition: "outstanding" as const,
          passKey: row.pass_key,
          sourceFactRecordId: sourceFact.id,
          propagationReportRecordId: propagationReport.id
        },
        proposedWrite: `Defer ${definition.label} for ${sourceFact.shortId} from ${propagationReport.shortId}; preserve the obligation as governed history.`,
        willLeaveUntouched: ["source fact text and canon standing", "append-only Propagation report", "canon debt", "Admission queue", "sibling obligations", "conditional-pass runs"]
      }
    : row.disposition === "deferred"
      ? {
          kind: "reinstate" as const,
          label: "Reinstate obligation",
          method: "POST" as const,
          href: `/api/conditional-pass-obligations/${row.id}/reinstate`,
          requiredReason: true as const,
          requiredRationale: true as const,
          reasonLabel: "Reinstatement reason",
          identityGuards: ["passKey", "sourceFactRecordId", "propagationReportRecordId"] as const,
          body: {
            disposition: "outstanding" as const,
            expectedDisposition: "deferred" as const,
            passKey: row.pass_key,
            sourceFactRecordId: sourceFact.id,
            propagationReportRecordId: propagationReport.id
          },
          proposedWrite: `Reinstate ${definition.label} for ${sourceFact.shortId} from ${propagationReport.shortId}; restore the existing source-selected route and preserve prior deferral history.`,
          willLeaveUntouched: ["source fact text and canon standing", "append-only Propagation report", "prior Conditional-pass events", "canon debt", "Admission queue", "sibling obligations", "conditional-pass runs"]
        }
      : null;
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
    sourceSelection,
    doctrine: "The post-Propagation Conditional-pass handoff keeps outstanding work owed, makes deferral and reinstatement explicit steward-governed actions, permits completed matching evidence to cover outstanding or deferred work, preserves immutable history, and keeps covered obligations terminal; Admission remains available.",
    packageSources: [...CONDITIONAL_PASS_PACKAGE_SOURCES],
    fieldClassifications,
    blocker: row.disposition === "covered" ? "Covered Conditional-pass obligations are terminal in this lifecycle." : null,
    remediation: row.disposition === "covered" ? "Correct or supersede completed specialized work through its owning flow and append-only report regime." : null,
    destination: {
      destinationKey: definition.destinationKey,
      label: definition.label,
      method: "POST" as const,
      href: definition.href,
      available: row.disposition === "outstanding",
      blocker: row.disposition === "outstanding" ? null : "The source-selected pass route is available only while the obligation is outstanding.",
      body: {
        sourceType: "fact" as const,
        recordId: sourceFact.id,
        conditionalPassObligationId: row.id,
        propagationReportRecordId: propagationReport.id
      }
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
      { label: `Obligation ${world.getRecord(row.record_id).shortId}`, recordId: row.record_id, href: `/api/canon-workbench/records/${row.record_id}` },
      ...(coveringEvidence == null ? [] : [{ label: `Covering report ${coveringEvidence.shortId}`, recordId: coveringEvidence.id, href: `/api/canon-workbench/records/${coveringEvidence.id}` }])
    ],
    action
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

export interface ConditionalPassFlowBinding {
  flowId: number;
  obligationId: number;
  passKey: ConditionalPassKey;
  sourceFactRecordId: number;
  propagationReportRecordId: number;
}

export const conditionalPassBindingForFlow = (world: WorldFile, flowId: number): ConditionalPassFlowBinding | null => {
  const row = world.db.prepare(`
    SELECT binding.flow_id,
           obligation.id AS obligation_id,
           obligation.pass_key,
           obligation.source_fact_record_id,
           obligation.propagation_report_record_id
    FROM conditional_pass_flow_bindings binding
    JOIN conditional_pass_obligations obligation ON obligation.id = binding.obligation_id
    WHERE binding.flow_id = ?
  `).get(flowId) as {
    flow_id: number;
    obligation_id: number;
    pass_key: ConditionalPassKey;
    source_fact_record_id: number;
    propagation_report_record_id: number;
  } | undefined;
  return row == null ? null : {
    flowId: row.flow_id,
    obligationId: row.obligation_id,
    passKey: row.pass_key,
    sourceFactRecordId: row.source_fact_record_id,
    propagationReportRecordId: row.propagation_report_record_id
  };
};

export const bindConditionalPassFlow = (
  world: WorldFile,
  input: {
    flowId: number;
    obligationId: number;
    passKey: ConditionalPassKey;
    sourceFactRecordId: number;
    propagationReportRecordId?: number;
  }
): ConditionalPassFlowBinding => {
  const obligation = rowById(world, input.obligationId);
  if (obligation.pass_key !== input.passKey) {
    throw transitionError(
      "Conditional-pass destination pass key does not match the selected obligation",
      "Reload the workflow map and start the specialized pass from the selected server-returned destination."
    );
  }
  if (obligation.source_fact_record_id !== input.sourceFactRecordId) {
    throw transitionError(
      "Conditional-pass destination source fact does not match the selected obligation",
      "Reload the workflow map and retain the selected obligation's source fact identity."
    );
  }
  if (input.propagationReportRecordId != null && obligation.propagation_report_record_id !== input.propagationReportRecordId) {
    throw transitionError(
      "Conditional-pass destination Propagation report does not match the selected obligation",
      "Reload the workflow map and retain the selected obligation's final Propagation report identity."
    );
  }
  if (obligation.disposition !== "outstanding") {
    throw transitionError(
      `Conditional-pass destination is unavailable while the obligation is ${obligation.disposition}`,
      obligation.disposition === "deferred"
        ? "Reinstate the deferred obligation before following its source-selected route, or complete matching work through another valid route."
        : "Use the owning specialized flow's correction or supersession path; completed coverage remains terminal.",
      toPublic(world, obligation)
    );
  }
  const existing = conditionalPassBindingForFlow(world, input.flowId);
  if (existing) {
    if (existing.obligationId !== obligation.id) {
      throw transitionError(
        "This specialized pass run is already bound to a different Conditional-pass obligation",
        "Return to the workflow map and start or resume the server-selected obligation's own run."
      );
    }
    return existing;
  }
  world.db.prepare(`
    INSERT INTO conditional_pass_flow_bindings (flow_id, obligation_id)
    VALUES (?, ?)
  `).run(input.flowId, obligation.id);
  return conditionalPassBindingForFlow(world, input.flowId)!;
};

export const deferConditionalPassObligation = (
  world: WorldFile,
  input: {
    obligationId: number;
    reason?: string;
    rationale?: string;
    disposition?: string;
    expectedDisposition?: string;
    passKey?: string;
    sourceFactRecordId?: number;
    propagationReportRecordId?: number;
  }
): { obligation: ConditionalPassObligation; created: boolean } => {
  const rationale = (input.reason ?? input.rationale)?.trim();
  if (!rationale) {
    throw transitionError(
      "Conditional-pass deferral requires a non-empty written rationale",
      "Enter a substantive deferral rationale and retry the server-returned action."
    );
  }
  return world.atomicWrite(() => {
    const current = rowById(world, input.obligationId);
    if (input.disposition != null && input.disposition !== "deferred") throw new Error(`unknown conditional-pass disposition: ${input.disposition}`);
    assertIdentityGuards(current, input);
    if (current.disposition === "covered") {
      throw transitionError(
        "Covered conditional-pass obligations cannot be deferred",
        "Use the owning specialized flow's correction or supersession path; the Conditional-pass obligation remains terminal.",
        toPublic(world, current)
      );
    }
    if (current.disposition === "deferred") {
      if (current.rationale !== rationale) {
        throw transitionError(
          "Conditional-pass obligation is already deferred with a different rationale",
          "Reload the authoritative deferred obligation; reinstate it before recording a genuinely new deferral.",
          toPublic(world, current)
        );
      }
      return { obligation: toPublic(world, current), created: false };
    }
    if (input.expectedDisposition != null && input.expectedDisposition !== current.disposition) {
      throw transitionError(
        `Stale Conditional-pass transition: expected ${input.expectedDisposition}, found ${current.disposition}`,
        "Reload the current workflow map and retry the server-returned action.",
        toPublic(world, current)
      );
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

export const reinstateConditionalPassObligation = (
  world: WorldFile,
  input: {
    obligationId: number;
    reason: string;
    disposition?: string;
    expectedDisposition?: string;
    passKey?: string;
    sourceFactRecordId?: number;
    propagationReportRecordId?: number;
  }
): { obligation: ConditionalPassObligation; created: boolean } => {
  const reason = input.reason?.trim();
  if (!reason) {
    throw transitionError(
      "Conditional-pass reinstatement requires a non-empty written reason",
      "Enter a substantive reinstatement reason and retry the server-returned action."
    );
  }
  return world.atomicWrite(() => {
    const current = rowById(world, input.obligationId);
    if (input.disposition != null && input.disposition !== "outstanding") {
      throw transitionError(
        `unknown conditional-pass disposition: ${input.disposition}`,
        "Reload the current obligation and submit the server-returned reinstatement body."
      );
    }
    assertIdentityGuards(current, input);
    if (current.disposition === "covered") {
      throw transitionError(
        "Covered conditional-pass obligations cannot be reinstated",
        "Use the owning specialized flow's correction or supersession path; the Conditional-pass obligation remains terminal.",
        toPublic(world, current)
      );
    }
    if (current.disposition === "outstanding") {
      const latest = latestTransitionEvent(world, current.id);
      if (latest?.action_key === "reinstated" && latest.rationale === reason) {
        return { obligation: toPublic(world, current), created: false };
      }
      if (latest?.action_key === "reinstated") {
        throw transitionError(
          "Conditional-pass obligation is already outstanding after reinstatement with a different reinstatement reason",
          "Reload the authoritative outstanding obligation before recording another lifecycle transition.",
          toPublic(world, current)
        );
      }
      throw transitionError(
        "Only deferred conditional-pass obligations can be reinstated",
        "Reload the workflow map and use the transition action returned for the current disposition.",
        toPublic(world, current)
      );
    }
    if (input.expectedDisposition != null && input.expectedDisposition !== current.disposition) {
      throw transitionError(
        `Stale Conditional-pass transition: expected ${input.expectedDisposition}, found ${current.disposition}`,
        "Reload the current workflow map and retry the server-returned action.",
        toPublic(world, current)
      );
    }
    world.db.prepare(`
      UPDATE conditional_pass_obligations
      SET disposition = 'outstanding', rationale = NULL, covering_report_record_id = NULL,
          actor_id = 1, flow_step = 'conditional-pass-obligation:reinstate'
      WHERE id = ? AND disposition = 'deferred'
    `).run(current.id);
    world.db.prepare(`
      INSERT INTO conditional_pass_obligation_events (
        obligation_id, action_key, prior_disposition, resulting_disposition, rationale, actor_id, flow_step
      ) VALUES (?, 'reinstated', 'deferred', 'outstanding', ?, 1, 'conditional-pass-obligation:reinstate')
    `).run(current.id, reason);
    return { obligation: toPublic(world, rowById(world, current.id)), created: true };
  });
};

export const coverMatchingConditionalPassObligation = (
  world: WorldFile,
  input: {
    passKey: ConditionalPassKey;
    sourceFactRecordId: number;
    propagationReportRecordId?: number;
    obligationId?: number;
    coveringReportRecordId: number;
    flowStep: string;
  }
): ConditionalPassObligation | null => {
  const source = world.getRecord(input.sourceFactRecordId);
  const evidence = world.getRecord(input.coveringReportRecordId);
  if (source.recordTypeKey !== "canon_fact") throw new Error("Conditional-pass coverage requires the obligation's canon_fact source");
  if (evidence.recordTypeKey !== "pass_report") throw new Error("Conditional-pass coverage requires a completed pass_report");
  return world.atomicWrite(() => {
    const matches = input.obligationId == null
      ? world.db.prepare(`
          SELECT id
          FROM conditional_pass_obligations
          WHERE source_fact_record_id = ?
            AND pass_key = ?
            AND disposition IN ('outstanding', 'deferred')
            AND (? IS NULL OR propagation_report_record_id = ?)
          ORDER BY propagation_report_record_id, id
        `).all(source.id, input.passKey, input.propagationReportRecordId ?? null, input.propagationReportRecordId ?? null) as Array<{ id: number }>
      : [{ id: input.obligationId }];
    if (matches.length === 0) {
      const covered = world.db.prepare(`
        SELECT id
        FROM conditional_pass_obligations
        WHERE source_fact_record_id = ?
          AND pass_key = ?
          AND (? IS NULL OR propagation_report_record_id = ?)
          AND disposition = 'covered'
        ORDER BY propagation_report_record_id, id
        LIMIT 1
      `).get(source.id, input.passKey, input.propagationReportRecordId ?? null, input.propagationReportRecordId ?? null) as { id: number } | undefined;
      if (covered) {
        throw transitionError(
          `The matching ${input.passKey} Conditional-pass obligation is already covered`,
          "Use the owning specialized flow's correction or supersession path; completed coverage remains terminal.",
          toPublic(world, rowById(world, covered.id))
        );
      }
      if (input.propagationReportRecordId != null) {
        const otherReport = world.db.prepare(`
          SELECT id
          FROM conditional_pass_obligations
          WHERE source_fact_record_id = ?
            AND pass_key = ?
          ORDER BY propagation_report_record_id, id
          LIMIT 1
        `).get(source.id, input.passKey) as { id: number } | undefined;
        if (otherReport) {
          throw transitionError(
            "Conditional-pass coverage Propagation report does not match the governed source/pass obligation",
            "Reload the server-owned obligation and retain its final Propagation report identity through specialized-pass completion."
          );
        }
      }
      return null;
    }
    if (matches.length > 1) {
      throw transitionError(
        `Multiple non-covered ${input.passKey} obligations exist for ${source.shortId}; select the source Propagation report explicitly`,
        "Start or resume the specialized pass from the server-returned Conditional-pass obligation route so the final Propagation report identity remains bound."
      );
    }
    const current = rowById(world, matches[0]!.id);
    if (current.source_fact_record_id !== source.id) {
      throw transitionError(
        "Conditional-pass coverage source fact does not match the selected obligation",
        "Reload the selected obligation and complete the specialized pass for its server-returned source fact."
      );
    }
    if (current.pass_key !== input.passKey) {
      throw transitionError(
        "Conditional-pass coverage pass key does not match the selected obligation",
        "Reload the selected obligation and complete its server-returned specialized pass."
      );
    }
    if (input.propagationReportRecordId != null && current.propagation_report_record_id !== input.propagationReportRecordId) {
      throw transitionError(
        "Conditional-pass coverage Propagation report does not match the selected obligation",
        "Reload the selected obligation and retain its final Propagation report identity through pass completion."
      );
    }
    if (current.disposition === "covered") {
      throw transitionError(
        "The selected Conditional-pass obligation is already covered",
        "Use the owning specialized flow's correction or supersession path; completed coverage remains terminal.",
        toPublic(world, current)
      );
    }
    const priorDisposition = current.disposition;
    world.db.prepare(`
      UPDATE conditional_pass_obligations
      SET disposition = 'covered', rationale = NULL, covering_report_record_id = ?,
          actor_id = 1, flow_step = ?
      WHERE id = ? AND disposition IN ('outstanding', 'deferred')
    `).run(evidence.id, input.flowStep, current.id);
    world.db.prepare(`
      INSERT INTO conditional_pass_obligation_events (
        obligation_id, action_key, prior_disposition, resulting_disposition, evidence_record_id, actor_id, flow_step
      ) VALUES (?, 'covered', ?, 'covered', ?, 1, ?)
    `).run(current.id, priorDisposition, evidence.id, input.flowStep);
    return toPublic(world, rowById(world, current.id));
  });
};

export const conditionalPassRecord = (obligation: ConditionalPassObligation): RecordRow => obligation.record;
