import { intakeProposedFact } from "./admission-flow.js";
import * as PromptOut from "./prompt-out.js";
import type { AdmissionQueueRow, RecordRow, WorldFile } from "./world-file.js";

export const FLOW_KEY = "constraint_composition";
export const PROMPT_TEMPLATE_KEY = "constraint_challenger";

type ConstraintSourceType = "fact" | "capability" | "constraint_card" | "canon_debt" | "material" | "record_section";
type CompositionType = "stacking" | "gate" | "tradeoff" | "threshold" | "sequential" | "cancellation" | "contradiction" | "chain";
type DbRow = Record<string, unknown>;

const COMPOSITION_TYPES: CompositionType[] = ["stacking", "gate", "tradeoff", "threshold", "sequential", "cancellation", "contradiction", "chain"];

const STEP_MAP = [
  { key: "source_selection", label: "Start/resume and source selection", decision: "Choose the source and constrained subject." },
  { key: "constrained_fact", label: "Constrained-fact framing", decision: "Name what is limited and why the limit matters." },
  { key: "constraint_inventory", label: "Constraint inventory", decision: "Record what each constraint prevents, allows, exposes, and leaves behind." },
  { key: "composition_testing", label: "Composition testing", decision: "Test stacking, gates, tradeoffs, thresholds, sequences, cancellation, contradiction, and chains." },
  { key: "leakage_residue", label: "Leakage and residue", decision: "Record loopholes, enforcement, bypass actors, countermeasures, and residue." },
  { key: "outcomes", label: "Cards, proposals, and debt", decision: "Choose card links, Admission proposals, canon debt, or explicit non-mutation." },
  { key: "prompt_out_skips", label: "Prompt-out and skips", decision: "Use, dispose, cite, or skip advisory pressure." },
  { key: "close_preview", label: "Close preview", decision: "Check server blockers and append the pass report." },
  { key: "read_side_trail", label: "Read-side trail", decision: "Follow the report, cards, proposals, debt, advisory artifacts, and skips." }
] as const;

const DOCTRINE = {
  flowKey: FLOW_KEY,
  protocol: "docs/worldbuilding-system/08_constraint_composition.md",
  checklist: "docs/worldbuilding-system/checklists/constraint_composition_sweep.md",
  template: "docs/worldbuilding-system/templates/constraint_card.md",
  aiWorkflow: "docs/worldbuilding-system/20_ai_assisted_workflow.md",
  stepMap: STEP_MAP,
  completionRule: "A completed sweep must leave constraint budget, loopholes, enforcement, and residue. Checkbox-only answers and unreasoned none are not evidence.",
  browserPolicy: "Server responses own step maps, blockers, skip rules, Prompt-out state, write intent, close readiness, and read-side trail.",
  handoffs: [
    "constraint inventory/composition/leakage/residue",
    "constraint cards and pass-report close assembly",
    "Admission proposals and canon debt",
    "Prompt-out/skips",
    "browser decision surface",
    "coverage closeout"
  ],
  work: {
    required: ["Constrained fact", "Constraint budget", "Loopholes", "Enforcement", "Residue"],
    optional: ["Constraint card", "Admission proposal", "Canon debt", "Prompt-out advisory pressure"],
    skippable: ["Prompt-out and offered instruments write skip_record entries when declined"],
    severityDependent: ["Major-or-higher skipped constraint work requires a reason and can preserve or create canon debt"]
  }
} as const;

const stringValue = (row: DbRow, key: string): string => String(row[key] ?? "");
const numberValue = (row: DbRow, key: string): number => Number(row[key]);
const nullableNumber = (row: DbRow, key: string): number | null => row[key] == null ? null : Number(row[key]);

const rowToSource = (row: DbRow) => ({
  flowId: numberValue(row, "flow_id"),
  passReportRecordId: numberValue(row, "pass_report_record_id"),
  sourceType: stringValue(row, "source_type") as ConstraintSourceType,
  sourceRecordId: nullableNumber(row, "source_record_id"),
  sourceSectionHeading: row.source_section_heading == null ? null : stringValue(row, "source_section_heading"),
  materialTitle: stringValue(row, "material_title"),
  materialBody: stringValue(row, "material_body"),
  constrainedSubject: stringValue(row, "constrained_subject"),
  sourceSummary: stringValue(row, "source_summary"),
  flowStep: stringValue(row, "flow_step"),
  createdAt: stringValue(row, "created_at")
});

const rowToInventory = (row: DbRow) => ({
  id: numberValue(row, "id"),
  flowId: numberValue(row, "flow_id"),
  passReportRecordId: numberValue(row, "pass_report_record_id"),
  constrainedFact: stringValue(row, "constrained_fact"),
  constraintStatement: stringValue(row, "constraint_statement"),
  constraintType: stringValue(row, "constraint_type"),
  prevents: stringValue(row, "prevents"),
  allows: stringValue(row, "allows"),
  boundaryKnowledge: stringValue(row, "boundary_knowledge"),
  bypassActors: stringValue(row, "bypass_actors"),
  causeOrMysteryBoundary: stringValue(row, "cause_or_mystery_boundary"),
  enforcement: stringValue(row, "enforcement"),
  residue: stringValue(row, "residue"),
  costOrObservable: stringValue(row, "cost_or_observable"),
  flowStep: stringValue(row, "flow_step"),
  createdAt: stringValue(row, "created_at"),
  updatedAt: stringValue(row, "updated_at")
});

const rowToComposition = (row: DbRow) => ({
  id: numberValue(row, "id"),
  flowId: numberValue(row, "flow_id"),
  passReportRecordId: numberValue(row, "pass_report_record_id"),
  analysisType: stringValue(row, "analysis_type") as CompositionType,
  body: stringValue(row, "body"),
  flowStep: stringValue(row, "flow_step"),
  createdAt: stringValue(row, "created_at"),
  updatedAt: stringValue(row, "updated_at")
});

const rowToLeakage = (row: DbRow | undefined) => row == null ? null : {
  flowId: numberValue(row, "flow_id"),
  passReportRecordId: numberValue(row, "pass_report_record_id"),
  bottleneck: stringValue(row, "bottleneck"),
  loopholes: stringValue(row, "loopholes"),
  partialWorkarounds: stringValue(row, "partial_workarounds"),
  falseBypasses: stringValue(row, "false_bypasses"),
  accidents: stringValue(row, "accidents"),
  countermeasures: stringValue(row, "countermeasures"),
  boundaryTesters: stringValue(row, "boundary_testers"),
  flowStep: stringValue(row, "flow_step"),
  createdAt: stringValue(row, "created_at"),
  updatedAt: stringValue(row, "updated_at")
};

const rowToResidue = (row: DbRow | undefined) => row == null ? null : {
  flowId: numberValue(row, "flow_id"),
  passReportRecordId: numberValue(row, "pass_report_record_id"),
  ordinaryLife: stringValue(row, "ordinary_life"),
  institutionalEffects: stringValue(row, "institutional_effects"),
  economicEffects: stringValue(row, "economic_effects"),
  visibleTraces: stringValue(row, "visible_traces"),
  expertise: stringValue(row, "expertise"),
  resentment: stringValue(row, "resentment"),
  crime: stringValue(row, "crime"),
  ritual: stringValue(row, "ritual"),
  markets: stringValue(row, "markets"),
  failureModes: stringValue(row, "failure_modes"),
  flowStep: stringValue(row, "flow_step"),
  createdAt: stringValue(row, "created_at"),
  updatedAt: stringValue(row, "updated_at")
};

const rowToLinkedCard = (world: WorldFile, row: DbRow) => ({
  id: numberValue(row, "id"),
  flowId: numberValue(row, "flow_id"),
  passReportRecordId: numberValue(row, "pass_report_record_id"),
  inventoryId: nullableNumber(row, "inventory_id"),
  relation: stringValue(row, "relation"),
  advisoryRecordId: nullableNumber(row, "advisory_record_id"),
  card: world.getRecord(numberValue(row, "card_record_id")),
  flowStep: stringValue(row, "flow_step"),
  createdAt: stringValue(row, "created_at")
});

const rowToRecordRelation = (world: WorldFile, row: DbRow, recordKey: string) => ({
  id: numberValue(row, "id"),
  flowId: numberValue(row, "flow_id"),
  passReportRecordId: numberValue(row, "pass_report_record_id"),
  sourceStep: stringValue(row, "source_step"),
  advisoryRecordId: nullableNumber(row, "advisory_record_id"),
  record: world.getRecord(numberValue(row, recordKey)),
  reason: row.reason == null ? undefined : stringValue(row, "reason"),
  severityOrConsequenceMode: row.severity_or_consequence_mode == null ? undefined : stringValue(row, "severity_or_consequence_mode"),
  flowStep: stringValue(row, "flow_step"),
  createdAt: stringValue(row, "created_at")
});

const rowToAdvisory = (world: WorldFile, row: DbRow) => ({
  id: numberValue(row, "id"),
  flowId: numberValue(row, "flow_id"),
  passReportRecordId: numberValue(row, "pass_report_record_id"),
  stepKey: stringValue(row, "step_key"),
  record: world.getRecord(numberValue(row, "advisory_record_id")),
  flowStep: stringValue(row, "flow_step"),
  createdAt: stringValue(row, "created_at")
});

const rowToSkip = (world: WorldFile, row: DbRow) => ({
  id: numberValue(row, "id"),
  flowId: numberValue(row, "flow_id"),
  passReportRecordId: numberValue(row, "pass_report_record_id"),
  stepKey: stringValue(row, "step_key"),
  unresolved: Number(row.unresolved) === 1,
  debtRecordId: nullableNumber(row, "debt_record_id"),
  record: world.getRecord(numberValue(row, "skip_record_id")),
  debt: row.debt_record_id == null ? null : world.getRecord(numberValue(row, "debt_record_id")),
  flowStep: stringValue(row, "flow_step"),
  createdAt: stringValue(row, "created_at")
});

const emptyishValues = new Set(["checked", "done", "yes", "true", "x", "[x]", "complete", "completed", "none", "n/a", "na", "no"]);

const hasSubstance = (value: string): boolean => {
  const normalized = value.trim().toLowerCase();
  return normalized.length >= 12 && !emptyishValues.has(normalized);
};

const assertSubstance = (value: string, label = "constraint-composition entries"): void => {
  if (!hasSubstance(value)) throw new Error(`${label} require steward-authored substance; checkbox-only answers, generic empty answers, and unreasoned none are not evidence`);
};

const assertSubstanceFields = (input: Record<string, string>, labels: Record<string, string> = {}): void => {
  for (const [key, value] of Object.entries(input)) {
    assertSubstance(value, labels[key] ?? key);
  }
};

const assertAdvisoryDisposed = (world: WorldFile, advisoryRecordId: number): void => {
  const advisory = world.getRecord(advisoryRecordId);
  if (advisory.recordTypeKey !== "advisory_artifact") throw new Error("constraint-composition advisory use requires an advisory artifact");
  const row = world.db.prepare("SELECT 1 FROM advisory_dispositions WHERE advisory_record_id = ? LIMIT 1").get(advisoryRecordId);
  if (!row) throw new Error("advisory material cannot influence constraint-composition outcomes before an explicit disposition");
};

const assertCompositionType: (analysisType: string) => asserts analysisType is CompositionType = (analysisType) => {
  if (!COMPOSITION_TYPES.includes(analysisType as CompositionType)) throw new Error(`Unknown constraint composition type: ${analysisType}`);
};

const readFlow = (world: WorldFile, flowId: number) => world.getFlowInstance(flowId, FLOW_KEY);

const readSource = (world: WorldFile, flowId: number) => {
  const row = world.db.prepare("SELECT * FROM constraint_run_sources WHERE flow_id = ?").get(flowId) as DbRow | undefined;
  if (!row) throw new Error(`Constraint Composition source not found for flow: ${flowId}`);
  return rowToSource(row);
};

const inventoryRows = (world: WorldFile, flowId: number) =>
  world.db.prepare("SELECT * FROM constraint_inventory_entries WHERE flow_id = ? ORDER BY id").all(flowId).map((row) => rowToInventory(row as DbRow));

const compositionRows = (world: WorldFile, flowId: number) =>
  world.db.prepare("SELECT * FROM constraint_composition_entries WHERE flow_id = ? ORDER BY id").all(flowId).map((row) => rowToComposition(row as DbRow));

const leakageRow = (world: WorldFile, flowId: number) =>
  rowToLeakage(world.db.prepare("SELECT * FROM constraint_leakage_entries WHERE flow_id = ?").get(flowId) as DbRow | undefined);

const residueRow = (world: WorldFile, flowId: number) =>
  rowToResidue(world.db.prepare("SELECT * FROM constraint_residue_entries WHERE flow_id = ?").get(flowId) as DbRow | undefined);

const linkedCardRows = (world: WorldFile, flowId: number) =>
  world.db.prepare("SELECT * FROM constraint_linked_cards WHERE flow_id = ? ORDER BY id").all(flowId).map((row) => rowToLinkedCard(world, row as DbRow));

const proposalRows = (world: WorldFile, flowId: number) =>
  world.db.prepare("SELECT * FROM constraint_proposals WHERE flow_id = ? ORDER BY id").all(flowId).map((row) => rowToRecordRelation(world, row as DbRow, "proposal_record_id"));

const debtRows = (world: WorldFile, flowId: number) =>
  world.db.prepare("SELECT * FROM constraint_debts WHERE flow_id = ? ORDER BY id").all(flowId).map((row) => rowToRecordRelation(world, row as DbRow, "debt_record_id"));

const advisoryRows = (world: WorldFile, flowId: number) =>
  world.db.prepare("SELECT * FROM constraint_advisories WHERE flow_id = ? ORDER BY id").all(flowId).map((row) => rowToAdvisory(world, row as DbRow));

const skipRows = (world: WorldFile, flowId: number) =>
  world.db.prepare("SELECT * FROM constraint_skips WHERE flow_id = ? ORDER BY id").all(flowId).map((row) => rowToSkip(world, row as DbRow));

const sourceRecordIds = (source: ReturnType<typeof rowToSource>): number[] =>
  source.sourceRecordId == null ? [] : [source.sourceRecordId];

const sourceLinkInputs = (source: ReturnType<typeof rowToSource>): Array<{ recordId: number; note: string }> =>
  sourceRecordIds(source).map((recordId) => ({ recordId, note: `Constraint Composition source: ${source.sourceSummary}` }));

const hasInventoryBudget = (rows: ReturnType<typeof inventoryRows>): boolean =>
  rows.some((row) =>
    hasSubstance(row.constrainedFact) &&
    hasSubstance(row.constraintStatement) &&
    hasSubstance(row.prevents) &&
    hasSubstance(row.allows) &&
    hasSubstance(row.causeOrMysteryBoundary)
  );

const hasInventoryEnforcement = (rows: ReturnType<typeof inventoryRows>): boolean =>
  rows.some((row) => hasSubstance(row.enforcement));

const hasInventoryResidue = (rows: ReturnType<typeof inventoryRows>): boolean =>
  rows.some((row) => hasSubstance(row.residue));

const closeReadiness = (world: WorldFile, flowId: number) => {
  const flow = readFlow(world, flowId);
  if (String(flow.state) === "complete") return { status: "closed", blockers: [] };
  const inventory = inventoryRows(world, flowId);
  const leakage = leakageRow(world, flowId);
  const residue = residueRow(world, flowId);
  const blockers: Array<{ kind: string; key: string; label: string; message: string; classification: string }> = [];
  if (!hasInventoryBudget(inventory)) {
    blockers.push({
      kind: "constraint_budget",
      key: "constraint_budget",
      label: "Constraint budget",
      message: "Name the constrained fact, constraint statement, prevented outcome, allowed remainder, and cause or mystery boundary.",
      classification: "missing_required_coverage"
    });
  }
  if (!leakage || !hasSubstance(leakage.loopholes)) {
    blockers.push({
      kind: "loopholes",
      key: "loopholes",
      label: "Loopholes",
      message: "Record loopholes or a reasoned boundary test; unreasoned none is not evidence.",
      classification: "missing_required_coverage"
    });
  }
  if (!hasInventoryEnforcement(inventory)) {
    blockers.push({
      kind: "enforcement",
      key: "enforcement",
      label: "Enforcement",
      message: "Name who or what maintains the constraint.",
      classification: "missing_required_coverage"
    });
  }
  if (!hasInventoryResidue(inventory) || !residue || !hasSubstance(residue.ordinaryLife) || !hasSubstance(residue.institutionalEffects) || !hasSubstance(residue.economicEffects)) {
    blockers.push({
      kind: "residue",
      key: "residue",
      label: "Residue",
      message: "Record ordinary-life, institutional, and economic residue with steward-authored substance.",
      classification: "missing_required_coverage"
    });
  }
  return { status: blockers.length ? "blocked" : "ready", blockers };
};

const promptOutState = (world: WorldFile, flowId: number) => {
  const inventory = inventoryRows(world, flowId);
  const composition = compositionRows(world, flowId);
  const leakage = leakageRow(world, flowId);
  const residue = residueRow(world, flowId);
  const available = inventory.length > 0 || composition.length > 0 || leakage != null || residue != null;
  const source = readSource(world, flowId);
  return {
    available,
    templateKey: PROMPT_TEMPLATE_KEY,
    role: "Constraint challenger",
    stepKey: "constraint:challenge",
    reason: available ? "Steward-authored constraint material exists." : "Prompt-out is offered after steward-authored material exists for the current decision point.",
    coldUseEvidence: "Prompt packets include source manifest, doctrine, current decision, constrained fact, omissions, and advisory/canon warning for a cold external LLM.",
    sourceRecordId: source.sourceRecordId
  };
};

const closePreview = (world: WorldFile, flowId: number) => {
  const readiness = closeReadiness(world, flowId);
  const proposals = proposalRows(world, flowId);
  const debt = debtRows(world, flowId);
  return {
    state: readiness.status,
    blockers: readiness.blockers,
    outcomeState: readiness.blockers.length
      ? "blocked_by_required_coverage"
      : proposals.length || debt.length
        ? "complete_with_routed_outcomes"
        : "complete_without_routed_outcomes",
    beforeCompletion: ["constraint budget", "loopholes", "enforcement", "residue", "outcome routing"],
    afterCompletion: ["append-only pass_report", "read-side trail", "Admission queue remains proposed", "canon debt remains open until separately closed"]
  };
};

const readSideTrail = (world: WorldFile, flowId: number) => {
  const source = readSource(world, flowId);
  return [
    { label: "Pass report", recordId: source.passReportRecordId, href: `/api/canon-workbench/records/${source.passReportRecordId}` },
    ...sourceRecordIds(source).map((recordId) => ({ label: "Source record", recordId, href: `/api/canon-workbench/records/${recordId}` })),
    { label: "Audit Trail", href: "/api/canon-workbench/audit" },
    { label: "Current Canon", href: "/api/canon-workbench/current" }
  ];
};

const sourceSummaryFor = (world: WorldFile, input: StartConstraintRunInput & { sourceType: ConstraintSourceType }) => {
  if (input.sourceType === "material") {
    if (!input.materialTitle?.trim() || !input.materialBody?.trim()) throw new Error("material starts require a title and body");
    return {
      sourceRecordId: null,
      sourceSectionHeading: null,
      materialTitle: input.materialTitle,
      materialBody: input.materialBody,
      constrainedSubject: input.constrainedSubject?.trim() || input.materialTitle,
      sourceSummary: `Selected material: ${input.materialTitle}`
    };
  }

  if (input.recordId == null) throw new Error(`${input.sourceType} starts require a record id`);
  const record = world.getRecord(input.recordId);
  if (input.sourceType === "fact" && record.recordTypeKey !== "canon_fact") throw new Error("constraint fact starts require a canon fact record");
  if (input.sourceType === "capability" && record.recordTypeKey !== "capability") throw new Error("constraint capability starts require a capability record");
  if (input.sourceType === "constraint_card" && record.recordTypeKey !== "constraint") throw new Error("constraint-card starts require a constraint record");
  if (input.sourceType === "canon_debt" && record.recordTypeKey !== "canon_debt") throw new Error("constraint debt starts require a canon debt record");
  if (input.sourceType === "record_section") {
    const heading = input.sectionHeading?.trim();
    if (!heading) throw new Error("record-section starts require a section heading");
    const section = world.listSections(record.id).find((row) => row.heading === heading);
    if (!section) throw new Error(`record section not found: ${heading}`);
    return {
      sourceRecordId: record.id,
      sourceSectionHeading: heading,
      materialTitle: "",
      materialBody: section.body,
      constrainedSubject: input.constrainedSubject?.trim() || `${record.shortId} ${heading}`,
      sourceSummary: `Section ${heading} on ${record.shortId} ${record.title}`
    };
  }
  return {
    sourceRecordId: record.id,
    sourceSectionHeading: null,
    materialTitle: "",
    materialBody: record.body,
    constrainedSubject: input.constrainedSubject?.trim() || `${record.shortId} ${record.title}`,
    sourceSummary: `${record.shortId} ${record.title}`
  };
};

const findExistingRun = (
  world: WorldFile,
  sourceType: ConstraintSourceType,
  source: ReturnType<typeof sourceSummaryFor>
) => {
  const row = world.db.prepare(`
    SELECT s.flow_id
    FROM constraint_run_sources s
    JOIN flow_instances f ON f.id = s.flow_id
    WHERE f.flow_key = @flowKey
      AND f.state = 'in_progress'
      AND s.source_type = @sourceType
      AND COALESCE(s.source_record_id, 0) = COALESCE(@sourceRecordId, 0)
      AND COALESCE(s.source_section_heading, '') = COALESCE(@sourceSectionHeading, '')
      AND s.material_title = @materialTitle
      AND s.material_body = @materialBody
    ORDER BY s.flow_id DESC
    LIMIT 1
  `).get({
    flowKey: FLOW_KEY,
    sourceType,
    sourceRecordId: source.sourceRecordId,
    sourceSectionHeading: source.sourceSectionHeading,
    materialTitle: source.materialTitle,
    materialBody: source.materialBody
  }) as { flow_id: number } | undefined;
  return row?.flow_id ?? null;
};

export type StartConstraintRunInput =
  | { sourceType: "fact" | "capability" | "constraint_card" | "canon_debt"; recordId: number; constrainedSubject?: string }
  | { sourceType: "record_section"; recordId: number; sectionHeading: string; constrainedSubject?: string }
  | { sourceType: "material"; materialTitle: string; materialBody: string; constrainedSubject?: string }
  | { sourceType: "pass_report"; reportRecordId: number };

export interface SaveConstraintInventoryInput {
  flowId: number;
  constrainedFact: string;
  constraintStatement: string;
  constraintType: string;
  prevents: string;
  allows: string;
  boundaryKnowledge: string;
  bypassActors: string;
  causeOrMysteryBoundary: string;
  enforcement: string;
  residue: string;
  costOrObservable?: string;
}

export interface SaveConstraintLeakageInput {
  flowId: number;
  bottleneck: string;
  loopholes: string;
  partialWorkarounds: string;
  falseBypasses: string;
  accidents: string;
  countermeasures: string;
  boundaryTesters: string;
}

export interface SaveConstraintResidueInput {
  flowId: number;
  ordinaryLife: string;
  institutionalEffects: string;
  economicEffects: string;
  visibleTraces: string;
  expertise: string;
  resentment: string;
  crime: string;
  ritual: string;
  markets: string;
  failureModes: string;
}

export const getConstraintRun = (world: WorldFile, flowId: number) => {
  const flow = readFlow(world, flowId);
  const source = readSource(world, flowId);
  return {
    flow,
    report: world.getRecord(source.passReportRecordId),
    source,
    doctrine: DOCTRINE,
    inventory: inventoryRows(world, flowId),
    composition: compositionRows(world, flowId),
    leakage: leakageRow(world, flowId),
    residue: residueRow(world, flowId),
    linkedCards: linkedCardRows(world, flowId),
    proposals: proposalRows(world, flowId),
    debt: debtRows(world, flowId),
    advisories: advisoryRows(world, flowId),
    skips: skipRows(world, flowId),
    closeReadiness: closeReadiness(world, flowId),
    closePreview: closePreview(world, flowId),
    promptOut: promptOutState(world, flowId),
    readSideTrail: readSideTrail(world, flowId)
  };
};

export const startConstraintRun = (world: WorldFile, input: StartConstraintRunInput) => {
  if (input.sourceType === "pass_report") {
    const report = world.getRecord(input.reportRecordId);
    if (report.recordTypeKey !== "pass_report") throw new Error("Constraint Composition resume requires a pass_report");
    const row = world.db.prepare(`
      SELECT s.flow_id, f.state
      FROM constraint_run_sources s
      JOIN flow_instances f ON f.id = s.flow_id
      WHERE s.pass_report_record_id = ?
      ORDER BY s.flow_id DESC
      LIMIT 1
    `).get(report.id) as { flow_id: number; state: string } | undefined;
    if (!row) throw new Error("Constraint Composition pass report is not owned by an in-progress run");
    if (row.state !== "in_progress") throw new Error("Constraint Composition pass report is already closed");
    return getConstraintRun(world, row.flow_id);
  }

  const source = sourceSummaryFor(world, input);
  const existingFlowId = findExistingRun(world, input.sourceType, source);
  if (existingFlowId != null) return getConstraintRun(world, existingFlowId);

  return world.atomicWrite(() => {
    const report = world.createRecord({
      recordTypeKey: "pass_report",
      title: `Constraint Composition pass: ${source.sourceSummary}`,
      body: [
        `Flow key: ${FLOW_KEY}`,
        "Status: in progress",
        `Source: ${source.sourceSummary}`,
        `Constrained subject: ${source.constrainedSubject}`,
        "Close sections are inserted once when the pass satisfies server-owned readiness."
      ].join("\n"),
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    });
    const flow = world.createFlowInstance({ flowKey: FLOW_KEY, currentStep: "constraint:entry" });
    world.db.prepare(`
      INSERT INTO constraint_run_sources (
        flow_id,
        pass_report_record_id,
        source_type,
        source_record_id,
        source_section_heading,
        material_title,
        material_body,
        constrained_subject,
        source_summary,
        flow_step
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'constraint:entry')
    `).run(
      Number(flow.id),
      report.id,
      input.sourceType,
      source.sourceRecordId,
      source.sourceSectionHeading,
      source.materialTitle,
      source.materialBody,
      source.constrainedSubject,
      source.sourceSummary
    );
    if (source.sourceRecordId != null) {
      world.createLinkIfMissing(report.id, source.sourceRecordId, "derived_from", "Constraint Composition pass analyzes this source");
    }
    return getConstraintRun(world, Number(flow.id));
  });
};

export const saveConstraintInventory = (world: WorldFile, input: SaveConstraintInventoryInput) => {
  readFlow(world, input.flowId);
  world.assertVocabularyTerm("constraint_type", input.constraintType);
  const source = readSource(world, input.flowId);
  assertSubstanceFields({
    constrainedFact: input.constrainedFact,
    constraintStatement: input.constraintStatement,
    prevents: input.prevents,
    allows: input.allows,
    boundaryKnowledge: input.boundaryKnowledge,
    bypassActors: input.bypassActors,
    causeOrMysteryBoundary: input.causeOrMysteryBoundary,
    enforcement: input.enforcement,
    residue: input.residue
  });
  const result = world.db.prepare(`
    INSERT INTO constraint_inventory_entries (
      flow_id,
      pass_report_record_id,
      constrained_fact,
      constraint_statement,
      constraint_type,
      prevents,
      allows,
      boundary_knowledge,
      bypass_actors,
      cause_or_mystery_boundary,
      enforcement,
      residue,
      cost_or_observable,
      flow_step
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'constraint:inventory')
  `).run(
    input.flowId,
    source.passReportRecordId,
    input.constrainedFact,
    input.constraintStatement,
    input.constraintType,
    input.prevents,
    input.allows,
    input.boundaryKnowledge,
    input.bypassActors,
    input.causeOrMysteryBoundary,
    input.enforcement,
    input.residue,
    input.costOrObservable ?? ""
  );
  world.updateFlowInstance(input.flowId, { currentStep: "constraint:inventory" });
  return { inventory: inventoryRows(world, input.flowId), closeReadiness: closeReadiness(world, input.flowId), promptOut: promptOutState(world, input.flowId), createdId: Number(result.lastInsertRowid) };
};

export const saveConstraintComposition = (world: WorldFile, input: { flowId: number; analysisType: string; body: string }) => {
  readFlow(world, input.flowId);
  assertCompositionType(input.analysisType);
  assertSubstance(input.body, `${input.analysisType} composition analysis`);
  const source = readSource(world, input.flowId);
  world.db.prepare(`
    INSERT INTO constraint_composition_entries (flow_id, pass_report_record_id, analysis_type, body, flow_step)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(flow_id, analysis_type) DO UPDATE SET
      body = excluded.body,
      flow_step = excluded.flow_step
  `).run(input.flowId, source.passReportRecordId, input.analysisType, input.body, `constraint:composition:${input.analysisType}`);
  world.updateFlowInstance(input.flowId, { currentStep: `constraint:composition:${input.analysisType}` });
  return { composition: compositionRows(world, input.flowId), closeReadiness: closeReadiness(world, input.flowId), promptOut: promptOutState(world, input.flowId) };
};

export const saveConstraintLeakage = (world: WorldFile, input: SaveConstraintLeakageInput) => {
  readFlow(world, input.flowId);
  assertSubstanceFields({
    bottleneck: input.bottleneck,
    loopholes: input.loopholes,
    partialWorkarounds: input.partialWorkarounds,
    falseBypasses: input.falseBypasses,
    accidents: input.accidents,
    countermeasures: input.countermeasures,
    boundaryTesters: input.boundaryTesters
  });
  const source = readSource(world, input.flowId);
  world.db.prepare(`
    INSERT INTO constraint_leakage_entries (
      flow_id,
      pass_report_record_id,
      bottleneck,
      loopholes,
      partial_workarounds,
      false_bypasses,
      accidents,
      countermeasures,
      boundary_testers,
      flow_step
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'constraint:leakage')
    ON CONFLICT(flow_id) DO UPDATE SET
      bottleneck = excluded.bottleneck,
      loopholes = excluded.loopholes,
      partial_workarounds = excluded.partial_workarounds,
      false_bypasses = excluded.false_bypasses,
      accidents = excluded.accidents,
      countermeasures = excluded.countermeasures,
      boundary_testers = excluded.boundary_testers,
      flow_step = excluded.flow_step
  `).run(
    input.flowId,
    source.passReportRecordId,
    input.bottleneck,
    input.loopholes,
    input.partialWorkarounds,
    input.falseBypasses,
    input.accidents,
    input.countermeasures,
    input.boundaryTesters
  );
  world.updateFlowInstance(input.flowId, { currentStep: "constraint:leakage" });
  return { leakage: leakageRow(world, input.flowId), closeReadiness: closeReadiness(world, input.flowId), promptOut: promptOutState(world, input.flowId) };
};

export const saveConstraintResidue = (world: WorldFile, input: SaveConstraintResidueInput) => {
  readFlow(world, input.flowId);
  assertSubstanceFields({
    ordinaryLife: input.ordinaryLife,
    institutionalEffects: input.institutionalEffects,
    economicEffects: input.economicEffects,
    visibleTraces: input.visibleTraces,
    expertise: input.expertise,
    resentment: input.resentment,
    crime: input.crime,
    ritual: input.ritual,
    markets: input.markets,
    failureModes: input.failureModes
  });
  const source = readSource(world, input.flowId);
  world.db.prepare(`
    INSERT INTO constraint_residue_entries (
      flow_id,
      pass_report_record_id,
      ordinary_life,
      institutional_effects,
      economic_effects,
      visible_traces,
      expertise,
      resentment,
      crime,
      ritual,
      markets,
      failure_modes,
      flow_step
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'constraint:residue')
    ON CONFLICT(flow_id) DO UPDATE SET
      ordinary_life = excluded.ordinary_life,
      institutional_effects = excluded.institutional_effects,
      economic_effects = excluded.economic_effects,
      visible_traces = excluded.visible_traces,
      expertise = excluded.expertise,
      resentment = excluded.resentment,
      crime = excluded.crime,
      ritual = excluded.ritual,
      markets = excluded.markets,
      failure_modes = excluded.failure_modes,
      flow_step = excluded.flow_step
  `).run(
    input.flowId,
    source.passReportRecordId,
    input.ordinaryLife,
    input.institutionalEffects,
    input.economicEffects,
    input.visibleTraces,
    input.expertise,
    input.resentment,
    input.crime,
    input.ritual,
    input.markets,
    input.failureModes
  );
  world.updateFlowInstance(input.flowId, { currentStep: "constraint:residue" });
  return { residue: residueRow(world, input.flowId), closeReadiness: closeReadiness(world, input.flowId), promptOut: promptOutState(world, input.flowId) };
};

const inventoryById = (world: WorldFile, flowId: number, inventoryId: number) => {
  const row = world.db.prepare("SELECT * FROM constraint_inventory_entries WHERE flow_id = ? AND id = ?").get(flowId, inventoryId) as DbRow | undefined;
  if (!row) throw new Error(`Constraint inventory entry not found: ${inventoryId}`);
  return rowToInventory(row);
};

const cardBodyFromInventory = (inventory: ReturnType<typeof rowToInventory>, extraBody?: string) => [
  `Constrained fact: ${inventory.constrainedFact}`,
  `Constraint statement: ${inventory.constraintStatement}`,
  `Constraint type: ${inventory.constraintType}`,
  `What it prevents: ${inventory.prevents}`,
  `What it still allows: ${inventory.allows}`,
  `Who knows the boundary: ${inventory.boundaryKnowledge}`,
  `Who tries to bypass it: ${inventory.bypassActors}`,
  `Why it exists: ${inventory.causeOrMysteryBoundary}`,
  `Who enforces it: ${inventory.enforcement}`,
  `Residue: ${inventory.residue}`,
  inventory.costOrObservable ? `Cost or observable proof: ${inventory.costOrObservable}` : "",
  extraBody ?? ""
].filter(Boolean).join("\n");

export const createOrLinkConstraintCard = (
  world: WorldFile,
  input: { flowId: number; existingRecordId?: number; inventoryId?: number; title?: string; body?: string; relation?: string; advisoryRecordId?: number }
) => {
  readFlow(world, input.flowId);
  const source = readSource(world, input.flowId);
  if (input.advisoryRecordId != null) assertAdvisoryDisposed(world, input.advisoryRecordId);
  const inventory = input.inventoryId == null ? null : inventoryById(world, input.flowId, input.inventoryId);

  return world.atomicWrite(() => {
    const card = input.existingRecordId == null
      ? world.createRecord({
          recordTypeKey: "constraint",
          title: input.title?.trim() || inventory?.constraintStatement || "Constraint Composition card",
          body: inventory ? cardBodyFromInventory(inventory, input.body) : input.body ?? "",
          truthLayer: "Objective canon",
          canonStatus: "proposed"
        })
      : world.getRecord(input.existingRecordId);
    if (card.recordTypeKey !== "constraint") throw new Error("linked card must be a constraint card");
    if (inventory && input.existingRecordId == null) {
      world.addFacet(card.id, { vocabulary: "constraint_type", term: inventory.constraintType });
    }
    world.db.prepare(`
      INSERT OR IGNORE INTO constraint_linked_cards (flow_id, pass_report_record_id, card_record_id, inventory_id, relation, advisory_record_id, flow_step)
      VALUES (?, ?, ?, ?, ?, ?, 'constraint:card')
    `).run(input.flowId, source.passReportRecordId, card.id, input.inventoryId ?? null, input.relation ?? "", input.advisoryRecordId ?? null);
    world.createLinkIfMissing(source.passReportRecordId, card.id, "covers", "Constraint Composition pass records this constraint card");
    world.createLinkIfMissing(card.id, source.passReportRecordId, "derived_from", "Constraint card created or linked from Constraint Composition pass");
    for (const recordId of sourceRecordIds(source)) {
      world.createLinkIfMissing(card.id, recordId, "constrains", "Constraint card constrains the analyzed source");
    }
    if (input.advisoryRecordId != null) {
      PromptOut.linkExplicitAdvisoryUse(world, card.id, input.advisoryRecordId, {
        derivedFromNote: "Constraint card used disposed advisory material",
        citationNote: "Disposed Constraint Composition advisory artifact consulted"
      });
      insertAdvisoryUse(world, input.flowId, source.passReportRecordId, input.advisoryRecordId, card.id, "card", "Disposed advisory material used for constraint card");
    }
    world.updateFlowInstance(input.flowId, { currentStep: "constraint:card" });
    return { card, linkedCards: linkedCardRows(world, input.flowId), closeReadiness: closeReadiness(world, input.flowId), readSideTrail: readSideTrail(world, input.flowId) };
  });
};

export const proposeFactFromConstraintRun = (
  world: WorldFile,
  input: { flowId: number; sourceStep: string; title: string; body: string; truthLayer: string; advisoryRecordId?: number }
): { record: RecordRow; queue: AdmissionQueueRow[] } => {
  readFlow(world, input.flowId);
  if (!input.title.trim() || !input.body.trim()) throw new Error("Constraint Composition proposals require steward-authored title and body");
  if (input.advisoryRecordId != null) assertAdvisoryDisposed(world, input.advisoryRecordId);
  const source = readSource(world, input.flowId);
  return world.atomicWrite(() => {
    const intake = intakeProposedFact(world, {
      origin: "future-flow",
      candidate: {
        title: input.title,
        body: [`Constraint Composition step: ${input.sourceStep}`, input.body].join("\n"),
        truthLayer: input.truthLayer,
        canonStatus: "proposed"
      },
      sourceLinks: [
        { recordId: source.passReportRecordId, note: "Fact surfaced by Constraint Composition pass report" },
        ...sourceLinkInputs(source)
      ],
      recordSweepJurisdiction: true,
      provenanceFlowStep: `constraint:proposal:${input.sourceStep}`
    });
    world.db.prepare(`
      INSERT INTO constraint_proposals (flow_id, pass_report_record_id, proposal_record_id, source_step, advisory_record_id, flow_step)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(input.flowId, source.passReportRecordId, intake.record.id, input.sourceStep, input.advisoryRecordId ?? null, `constraint:proposal:${input.sourceStep}`);
    world.createLinkIfMissing(source.passReportRecordId, intake.record.id, "covers", "Constraint Composition pass surfaced this Admission proposal");
    if (input.advisoryRecordId != null) {
      PromptOut.linkExplicitAdvisoryUse(world, intake.record.id, input.advisoryRecordId, {
        derivedFromNote: "Constraint Composition proposal used disposed advisory material",
        citationNote: "Disposed Constraint Composition advisory artifact consulted"
      });
      insertAdvisoryUse(world, input.flowId, source.passReportRecordId, input.advisoryRecordId, intake.record.id, "proposal", "Disposed advisory material used for proposal");
    }
    world.updateFlowInstance(input.flowId, { currentStep: `constraint:proposal:${input.sourceStep}` });
    return intake;
  });
};

export const mintConstraintDebt = (
  world: WorldFile,
  input: { flowId: number; sourceStep: string; name: string; reason: string; severityOrConsequenceMode?: string; advisoryRecordId?: number }
) => {
  readFlow(world, input.flowId);
  if (!input.name.trim()) throw new Error("Constraint Composition canon debt requires a name");
  assertSubstance(input.reason, "Constraint Composition canon debt");
  if (input.advisoryRecordId != null) assertAdvisoryDisposed(world, input.advisoryRecordId);
  const source = readSource(world, input.flowId);
  return world.atomicWrite(() => {
    const debt = world.createCanonDebt({
      name: input.name,
      scope: `constraint-composition:${input.sourceStep}`,
      assignee: "steward",
      body: [
        `Source step: ${input.sourceStep}`,
        `Reason: ${input.reason}`,
        `Severity or consequence mode: ${input.severityOrConsequenceMode ?? "not recorded"}`,
        `Source report: ${source.passReportRecordId}`
      ].join("\n")
    });
    world.db.prepare(`
      INSERT INTO constraint_debts (flow_id, pass_report_record_id, debt_record_id, source_step, reason, severity_or_consequence_mode, advisory_record_id, flow_step)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      input.flowId,
      source.passReportRecordId,
      debt.id,
      input.sourceStep,
      input.reason,
      input.severityOrConsequenceMode ?? "",
      input.advisoryRecordId ?? null,
      `constraint:debt:${input.sourceStep}`
    );
    world.createLinkIfMissing(source.passReportRecordId, debt.id, "requires_follow_up", "Constraint Composition pass minted follow-up canon debt");
    for (const recordId of sourceRecordIds(source)) {
      world.createLinkIfMissing(debt.id, recordId, "derived_from", "Constraint Composition debt preserves analyzed-source provenance");
    }
    if (input.advisoryRecordId != null) {
      PromptOut.linkExplicitAdvisoryUse(world, debt.id, input.advisoryRecordId, {
        derivedFromNote: "Constraint Composition debt used disposed advisory material",
        citationNote: "Disposed Constraint Composition advisory artifact consulted"
      });
      insertAdvisoryUse(world, input.flowId, source.passReportRecordId, input.advisoryRecordId, debt.id, "debt", "Disposed advisory material used for debt");
    }
    world.updateFlowInstance(input.flowId, { currentStep: `constraint:debt:${input.sourceStep}` });
    return { debt, debtRows: debtRows(world, input.flowId), closeReadiness: closeReadiness(world, input.flowId), readSideTrail: readSideTrail(world, input.flowId) };
  });
};

export const storeConstraintAdvisory = (
  world: WorldFile,
  input: { flowId: number; stepKey: string; promptText: string; responseText: string }
) => {
  readFlow(world, input.flowId);
  const source = readSource(world, input.flowId);
  return world.atomicWrite(() => {
    const record = PromptOut.storeAdvisoryResponse(world, {
      flowKey: FLOW_KEY,
      flowId: input.flowId,
      stepKey: input.stepKey,
      promptText: input.promptText,
      responseText: input.responseText
    });
    world.db.prepare(`
      INSERT INTO constraint_advisories (flow_id, pass_report_record_id, advisory_record_id, step_key, flow_step)
      VALUES (?, ?, ?, ?, ?)
    `).run(input.flowId, source.passReportRecordId, record.id, input.stepKey, `constraint:advisory:${input.stepKey}`);
    world.createLinkIfMissing(source.passReportRecordId, record.id, "cites_advisory_artifact", "Constraint Composition pass stores this advisory artifact");
    world.createLinkIfMissing(record.id, source.passReportRecordId, "derived_from", "Constraint Composition advisory artifact belongs to this pass report");
    world.updateFlowInstance(input.flowId, { currentStep: `constraint:advisory:${input.stepKey}` });
    return { record, advisories: advisoryRows(world, input.flowId), closeReadiness: closeReadiness(world, input.flowId) };
  });
};

export const skipConstraintStep = (
  world: WorldFile,
  input: {
    flowId: number;
    stepKey: string;
    admissionLevel?: string;
    workScale?: string;
    reason?: string;
    unresolved?: boolean;
    debtName?: string;
    existingDebtRecordId?: number;
  }
) => {
  readFlow(world, input.flowId);
  const source = readSource(world, input.flowId);
  return world.atomicWrite(() => {
    const record = PromptOut.recordPromptOutSkip(world, {
      flowKey: FLOW_KEY,
      flowId: input.flowId,
      stepKey: input.stepKey,
      admissionLevel: input.admissionLevel,
      workScale: input.workScale,
      reason: input.reason
    });
    let debt: RecordRow | null = null;
    if (input.unresolved) {
      if (input.existingDebtRecordId != null) {
        debt = world.getRecord(input.existingDebtRecordId);
        if (debt.recordTypeKey !== "canon_debt") throw new Error("unresolved Constraint Composition skip follow-up must be canon debt");
      } else {
        if (!input.debtName?.trim()) throw new Error("unresolved Constraint Composition skips require a follow-up debt name");
        debt = world.createCanonDebt({
          name: input.debtName,
          scope: `constraint-composition:${input.stepKey}`,
          assignee: "steward",
          body: input.reason ?? `Skipped Constraint Composition step ${input.stepKey}`
        });
      }
      world.createLinkIfMissing(source.passReportRecordId, debt.id, "requires_follow_up", "Constraint Composition skip left unresolved work");
      world.db.prepare(`
        INSERT OR IGNORE INTO constraint_debts (
          flow_id,
          pass_report_record_id,
          debt_record_id,
          source_step,
          reason,
          severity_or_consequence_mode,
          flow_step
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        input.flowId,
        source.passReportRecordId,
        debt.id,
        input.stepKey,
        input.reason ?? `Skipped Constraint Composition step ${input.stepKey}`,
        input.workScale ?? "",
        `constraint:skip:${input.stepKey}`
      );
    }
    world.db.prepare(`
      INSERT INTO constraint_skips (flow_id, pass_report_record_id, skip_record_id, step_key, unresolved, debt_record_id, flow_step)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(input.flowId, source.passReportRecordId, record.id, input.stepKey, input.unresolved ? 1 : 0, debt?.id ?? null, `constraint:skip:${input.stepKey}`);
    world.createLinkIfMissing(source.passReportRecordId, record.id, "covers", "Constraint Composition pass records this governed skip");
    world.createLinkIfMissing(record.id, source.passReportRecordId, "derived_from", "Constraint Composition skip belongs to this pass report");
    world.updateFlowInstance(input.flowId, { currentStep: `constraint:skip:${input.stepKey}` });
    return { record, debt, skips: skipRows(world, input.flowId), closeReadiness: closeReadiness(world, input.flowId) };
  });
};

const insertAdvisoryUse = (
  world: WorldFile,
  flowId: number,
  passReportRecordId: number,
  advisoryRecordId: number,
  outcomeRecordId: number,
  outcomeKind: "card" | "proposal" | "debt" | "report" | "skip",
  note: string
) => {
  world.db.prepare(`
    INSERT OR IGNORE INTO constraint_advisory_uses (
      flow_id,
      pass_report_record_id,
      advisory_record_id,
      outcome_record_id,
      outcome_kind,
      note,
      flow_step
    )
    VALUES (?, ?, ?, ?, ?, ?, 'constraint:advisory-use')
  `).run(flowId, passReportRecordId, advisoryRecordId, outcomeRecordId, outcomeKind, note);
};

const cardTitlesByInventory = (cards: ReturnType<typeof linkedCardRows>) => {
  const grouped = new Map<number, string[]>();
  for (const card of cards) {
    if (card.inventoryId == null) continue;
    grouped.set(card.inventoryId, [...(grouped.get(card.inventoryId) ?? []), `${card.card.shortId} ${card.card.title}`]);
  }
  return grouped;
};

const writeCloseSections = (world: WorldFile, flowId: number): void => {
  const source = readSource(world, flowId);
  const report = world.getRecord(source.passReportRecordId);
  if (world.listSections(report.id).length) return;
  const inventory = inventoryRows(world, flowId);
  const composition = compositionRows(world, flowId);
  const leakage = leakageRow(world, flowId);
  const residue = residueRow(world, flowId);
  const cards = linkedCardRows(world, flowId);
  const proposals = proposalRows(world, flowId);
  const debt = debtRows(world, flowId);
  const advisories = advisoryRows(world, flowId);
  const skips = skipRows(world, flowId);
  const cardTitles = cardTitlesByInventory(cards);
  world.replaceSections(report.id, [
    {
      heading: "Constraint source and run",
      body: [`Flow key: ${FLOW_KEY}`, `Flow id: ${flowId}`, `Source: ${source.sourceSummary}`, `Source type: ${source.sourceType}`, `Constrained subject: ${source.constrainedSubject}`].join("\n"),
      position: 8
    },
    {
      heading: "Constraint coverage",
      body: [
        inventory.map((entry) => {
          const linked = cardTitles.get(entry.id);
          return [
            `## ${entry.constrainedFact}`,
            `Constraint: ${entry.constraintStatement}`,
            `Type: ${entry.constraintType}`,
            `Prevents: ${entry.prevents}`,
            `Allows: ${entry.allows}`,
            `Boundary knowledge: ${entry.boundaryKnowledge}`,
            `Bypass actors: ${entry.bypassActors}`,
            `Cause or mystery boundary: ${entry.causeOrMysteryBoundary}`,
            `Enforcement: ${entry.enforcement}`,
            `Residue: ${entry.residue}`,
            entry.costOrObservable ? `Cost or observable proof: ${entry.costOrObservable}` : "",
            linked?.length ? `Linked cards: ${linked.join(", ")}` : ""
          ].filter(Boolean).join("\n");
        }).join("\n\n") || "No inventory coverage.",
        composition.map((entry) => `## ${entry.analysisType}\n${entry.body}`).join("\n\n") || "No composition analysis.",
        leakage ? `## Leakage\nBottleneck: ${leakage.bottleneck}\nLoopholes: ${leakage.loopholes}\nPartial workarounds: ${leakage.partialWorkarounds}\nFalse bypasses: ${leakage.falseBypasses}\nAccidents: ${leakage.accidents}\nCountermeasures: ${leakage.countermeasures}\nBoundary testers: ${leakage.boundaryTesters}` : "No leakage analysis.",
        residue ? `## Residue\nOrdinary life: ${residue.ordinaryLife}\nInstitutional effects: ${residue.institutionalEffects}\nEconomic effects: ${residue.economicEffects}\nVisible traces: ${residue.visibleTraces}\nExpertise: ${residue.expertise}\nResentment: ${residue.resentment}\nCrime: ${residue.crime}\nRitual: ${residue.ritual}\nMarkets: ${residue.markets}\nFailure modes: ${residue.failureModes}` : "No residue analysis."
      ].join("\n\n"),
      position: 9
    },
    {
      heading: "Constraint cards",
      body: cards.map((card) => `- ${card.card.shortId} ${card.card.title}${card.relation ? `: ${card.relation}` : ""}`).join("\n") || "No constraint cards.",
      position: 10
    },
    {
      heading: "Constraint proposals",
      body: proposals.map((proposal) => `- ${proposal.record.shortId} ${proposal.record.title} (${proposal.record.canonStatus}) from ${proposal.sourceStep}`).join("\n") || "No Admission proposals.",
      position: 11
    },
    {
      heading: "Constraint debt",
      body: debt.map((item) => `- ${item.record.shortId} ${item.record.title}: ${item.reason}`).join("\n") || "No constraint-composition canon debt.",
      position: 12
    },
    {
      heading: "Constraint Prompt-out and skips",
      body: [
        advisories.map((advisory) => `- Advisory ${advisory.record.shortId} ${advisory.record.title} (${advisory.stepKey})`).join("\n"),
        skips.map((skip) => `- Skip ${skip.record.shortId} ${skip.stepKey}: ${skip.record.body}${skip.debt ? `\n  Follow-up debt: ${skip.debt.shortId} ${skip.debt.title}` : ""}`).join("\n")
      ].filter(Boolean).join("\n") || "No advisory artifacts or governed skips.",
      position: 13
    },
    {
      heading: "Constraint close readiness",
      body: "Closed with constraint budget, loopholes, enforcement, and residue present. Admission proposals, debt, advisory artifacts, and skips remain governed by their own records. Temporal/Timeline remains out of scope.",
      position: 14
    }
  ]);
};

export const closeConstraintRun = (world: WorldFile, flowId: number) => {
  const flow = readFlow(world, flowId);
  if (String(flow.state) === "complete") throw new Error("Constraint Composition run is already closed");
  const readiness = closeReadiness(world, flowId);
  if (readiness.blockers.length) {
    throw new Error(`Constraint Composition close blocked: ${readiness.blockers.map((blocker) => blocker.label).join(", ")}`);
  }
  return world.atomicWrite(() => {
    const source = readSource(world, flowId);
    writeCloseSections(world, flowId);
    const complete = world.updateFlowInstance(flowId, { state: "complete", currentStep: "constraint:complete" });
    return {
      ...getConstraintRun(world, flowId),
      flow: complete,
      report: world.getRecord(source.passReportRecordId)
    };
  });
};
