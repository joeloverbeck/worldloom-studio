import { intakeProposedFact } from "./admission-flow.js";
import { methodCard, methodCardsForFlow } from "./method-cards.js";
import * as PromptOut from "./prompt-out.js";
import type { AdmissionQueueRow, RecordRow, WorldFile } from "./world-file.js";

export const FLOW_KEY = "institutional_economic_suppression";
export const PROMPT_TEMPLATE_KEY = "institution_economy_analyst";

type Stage12SourceType = "fact" | "under_review_fact" | "canon_debt" | "material" | "record_section";
type Stage12CardType = "action_arena" | "institution" | "counter_institution";

type DbRow = Record<string, unknown>;

export interface Stage12Lens {
  key: string;
  label: string;
  checklistGroup: string;
}

const LENSES: Stage12Lens[] = [
  { key: "action_arena", label: "Action arena", checklistGroup: "Institutions" },
  { key: "rules_in_use", label: "Rules-in-use", checklistGroup: "Institutions" },
  { key: "transaction_cost", label: "Transaction cost", checklistGroup: "Economy" },
  { key: "surplus_capture", label: "Surplus capture", checklistGroup: "Economy" },
  { key: "suppression_residue", label: "Suppression residue", checklistGroup: "Suppression and counter-institutions" },
  { key: "counter_institution", label: "Counter-institution", checklistGroup: "Suppression and counter-institutions" },
  { key: "synthesis_sentence", label: "Synthesis sentence", checklistGroup: "Synthesis" },
  { key: "daily_life_residue", label: "Daily-life residue", checklistGroup: "Synthesis" },
  { key: "power_conflict", label: "Power conflict", checklistGroup: "Synthesis" }
];

const CARD_TYPES = new Set<Stage12CardType>(["action_arena", "institution", "counter_institution"]);

const DOCTRINE = {
  flowKey: FLOW_KEY,
  protocol: "docs/worldbuilding-system/12_institutional_economic_and_suppression_protocol.md",
  checklist: "docs/worldbuilding-system/checklists/institutional_economic_suppression_sweep.md",
  templateIndex: "docs/worldbuilding-system/21_templates_index.md",
  lenses: LENSES,
  completionRule: "A completed sweep must leave steward-authored substance for every required lens. A checkbox alone is not evidence.",
  browserPolicy: "Server responses own completion, advisory, skip, Admission-routing, and close-readiness policy."
} as const;

const stringValue = (row: DbRow, key: string): string => String(row[key] ?? "");
const numberValue = (row: DbRow, key: string): number => Number(row[key]);
const nullableNumber = (row: DbRow, key: string): number | null => row[key] == null ? null : Number(row[key]);

const rowToSource = (row: DbRow) => ({
  flowId: numberValue(row, "flow_id"),
  passReportRecordId: numberValue(row, "pass_report_record_id"),
  sourceType: stringValue(row, "source_type") as Stage12SourceType,
  sourceRecordId: nullableNumber(row, "source_record_id"),
  sourceSectionHeading: row.source_section_heading == null ? null : stringValue(row, "source_section_heading"),
  materialTitle: stringValue(row, "material_title"),
  materialBody: stringValue(row, "material_body"),
  sourceSummary: stringValue(row, "source_summary"),
  flowStep: stringValue(row, "flow_step"),
  createdAt: stringValue(row, "created_at")
});

const rowToCoverage = (row: DbRow) => ({
  id: numberValue(row, "id"),
  flowId: numberValue(row, "flow_id"),
  passReportRecordId: numberValue(row, "pass_report_record_id"),
  lensKey: stringValue(row, "lens_key"),
  lensLabel: stringValue(row, "lens_label"),
  body: stringValue(row, "body"),
  flowStep: stringValue(row, "flow_step"),
  createdAt: stringValue(row, "created_at"),
  updatedAt: stringValue(row, "updated_at")
});

const rowToLinkedCard = (world: WorldFile, row: DbRow) => ({
  id: numberValue(row, "id"),
  flowId: numberValue(row, "flow_id"),
  passReportRecordId: numberValue(row, "pass_report_record_id"),
  cardTypeKey: stringValue(row, "card_type_key") as Stage12CardType,
  lensKey: row.lens_key == null ? null : stringValue(row, "lens_key"),
  relation: stringValue(row, "relation"),
  card: world.getRecord(numberValue(row, "card_record_id")),
  flowStep: stringValue(row, "flow_step"),
  createdAt: stringValue(row, "created_at")
});

const rowToRecordRelation = (world: WorldFile, row: DbRow, recordKey: string) => ({
  id: numberValue(row, "id"),
  flowId: numberValue(row, "flow_id"),
  passReportRecordId: numberValue(row, "pass_report_record_id"),
  lensKey: row.lens_key == null ? null : stringValue(row, "lens_key"),
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

const lensByKey = (lensKey: string): Stage12Lens => {
  const lens = LENSES.find((item) => item.key === lensKey);
  if (!lens) throw new Error(`Unknown stage-12 lens: ${lensKey}`);
  return lens;
};

const hasSubstance = (value: string): boolean => {
  const normalized = value.trim().toLowerCase();
  return normalized.length >= 12 && !["checked", "done", "yes", "true", "x", "[x]", "complete", "completed"].includes(normalized);
};

const assertSubstance = (value: string): void => {
  if (!hasSubstance(value)) throw new Error("stage-12 entries require steward-authored substance; a checkbox alone is not evidence");
};

const assertAdvisoryDisposed = (world: WorldFile, advisoryRecordId: number): void => {
  const advisory = world.getRecord(advisoryRecordId);
  if (advisory.recordTypeKey !== "advisory_artifact") throw new Error("stage-12 advisory use requires an advisory artifact");
  const row = world.db.prepare("SELECT 1 FROM advisory_dispositions WHERE advisory_record_id = ? LIMIT 1").get(advisoryRecordId);
  if (!row) throw new Error("advisory material cannot influence stage-12 outcomes before an explicit disposition");
};

const readSource = (world: WorldFile, flowId: number) => {
  const row = world.db.prepare("SELECT * FROM stage12_run_sources WHERE flow_id = ?").get(flowId) as DbRow | undefined;
  if (!row) throw new Error(`Stage-12 source not found for flow: ${flowId}`);
  return rowToSource(row);
};

const readFlow = (world: WorldFile, flowId: number) => world.getFlowInstance(flowId, FLOW_KEY);

const coverageRows = (world: WorldFile, flowId: number) =>
  world.db.prepare("SELECT * FROM stage12_coverage WHERE flow_id = ? ORDER BY id").all(flowId).map((row) => rowToCoverage(row as DbRow));

const linkedCardRows = (world: WorldFile, flowId: number) =>
  world.db.prepare("SELECT * FROM stage12_linked_cards WHERE flow_id = ? ORDER BY id").all(flowId).map((row) => rowToLinkedCard(world, row as DbRow));

const proposalRows = (world: WorldFile, flowId: number) =>
  world.db.prepare("SELECT * FROM stage12_proposals WHERE flow_id = ? ORDER BY id").all(flowId).map((row) => rowToRecordRelation(world, row as DbRow, "proposal_record_id"));

const debtRows = (world: WorldFile, flowId: number) =>
  world.db.prepare("SELECT * FROM stage12_debts WHERE flow_id = ? ORDER BY id").all(flowId).map((row) => rowToRecordRelation(world, row as DbRow, "debt_record_id"));

const advisoryRows = (world: WorldFile, flowId: number) =>
  world.db.prepare("SELECT * FROM stage12_advisories WHERE flow_id = ? ORDER BY id").all(flowId).map((row) => rowToAdvisory(world, row as DbRow));

const skipRows = (world: WorldFile, flowId: number) =>
  world.db.prepare("SELECT * FROM stage12_skips WHERE flow_id = ? ORDER BY id").all(flowId).map((row) => rowToSkip(world, row as DbRow));

const closeReadiness = (world: WorldFile, flowId: number) => {
  const flow = readFlow(world, flowId);
  if (String(flow.state) === "complete") return { status: "closed", blockers: [] };
  const coverageByLens = new Map(coverageRows(world, flowId).map((row) => [row.lensKey, row]));
  const blockers = LENSES
    .filter((lens) => !hasSubstance(coverageByLens.get(lens.key)?.body ?? ""))
    .map((lens) => ({
      kind: "missing_stage12_evidence",
      key: lens.key,
      label: lens.label,
      message: `${lens.label} requires steward-authored evidence.`
    }));
  return { status: blockers.length ? "blocked" : "ready", blockers };
};

const sourceRecordIds = (source: ReturnType<typeof rowToSource>): number[] =>
  source.sourceRecordId == null ? [] : [source.sourceRecordId];

const sourceLinkInputs = (source: ReturnType<typeof rowToSource>): Array<{ recordId: number; note: string }> =>
  sourceRecordIds(source).map((recordId) => ({ recordId, note: `Stage-12 source: ${source.sourceSummary}` }));

const sourceSummaryFor = (world: WorldFile, input: StartStage12RunInput & { sourceType: Stage12SourceType }) => {
  if (input.sourceType === "material") {
    if (!input.materialTitle?.trim() || !input.materialBody?.trim()) throw new Error("material starts require a title and body");
    return {
      sourceRecordId: null,
      sourceSectionHeading: null,
      materialTitle: input.materialTitle,
      materialBody: input.materialBody,
      sourceSummary: `Selected material: ${input.materialTitle}`
    };
  }

  if (input.recordId == null) throw new Error(`${input.sourceType} starts require a record id`);
  const record = world.getRecord(input.recordId);
  if (input.sourceType === "canon_debt" && record.recordTypeKey !== "canon_debt") throw new Error("stage-12 debt starts require a canon debt record");
  if ((input.sourceType === "fact" || input.sourceType === "under_review_fact") && record.recordTypeKey !== "canon_fact") {
    throw new Error("stage-12 fact starts require a canon fact record");
  }
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
      sourceSummary: `Section ${heading} on ${record.shortId} ${record.title}`
    };
  }
  return {
    sourceRecordId: record.id,
    sourceSectionHeading: null,
    materialTitle: "",
    materialBody: record.body,
    sourceSummary: `${record.shortId} ${record.title}`
  };
};

const findExistingRun = (
  world: WorldFile,
  sourceType: Stage12SourceType,
  source: ReturnType<typeof sourceSummaryFor>
) => {
  const row = world.db.prepare(`
    SELECT s.flow_id
    FROM stage12_run_sources s
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

const stage12MethodCardForStep = (stepKey: string) => {
  if (stepKey.includes("entry")) return methodCard("stage12.entry");
  if (stepKey.includes("close") || stepKey.includes("complete")) return methodCard("stage12.close-readiness");
  if (stepKey.includes("proposal") || stepKey.includes("debt") || stepKey.includes("card") || stepKey.includes("skip") || stepKey.includes("advisory")) {
    return methodCard("stage12.outcomes");
  }
  return methodCard("stage12.lens");
};

export type StartStage12RunInput =
  | { sourceType: "fact" | "under_review_fact" | "canon_debt"; recordId: number }
  | { sourceType: "record_section"; recordId: number; sectionHeading: string }
  | { sourceType: "material"; materialTitle: string; materialBody: string }
  | { sourceType: "pass_report"; reportRecordId: number };

export const getStage12Run = (world: WorldFile, flowId: number) => {
  const flow = readFlow(world, flowId);
  const source = readSource(world, flowId);
  return {
    flow,
    report: world.getRecord(source.passReportRecordId),
    source,
    doctrine: DOCTRINE,
    methodCard: stage12MethodCardForStep(String(flow.current_step ?? "stage12:entry")),
    methodCards: methodCardsForFlow(FLOW_KEY),
    coverage: coverageRows(world, flowId),
    linkedCards: linkedCardRows(world, flowId),
    proposals: proposalRows(world, flowId),
    debt: debtRows(world, flowId),
    advisories: advisoryRows(world, flowId),
    skips: skipRows(world, flowId),
    closeReadiness: closeReadiness(world, flowId)
  };
};

export const startStage12Run = (world: WorldFile, input: StartStage12RunInput) => {
  if (input.sourceType === "pass_report") {
    const report = world.getRecord(input.reportRecordId);
    if (report.recordTypeKey !== "pass_report") throw new Error("stage-12 resume requires a pass_report");
    const row = world.db.prepare(`
      SELECT s.flow_id, f.state
      FROM stage12_run_sources s
      JOIN flow_instances f ON f.id = s.flow_id
      WHERE s.pass_report_record_id = ?
      ORDER BY s.flow_id DESC
      LIMIT 1
    `).get(report.id) as { flow_id: number; state: string } | undefined;
    if (!row) throw new Error("stage-12 pass report is not owned by an in-progress stage-12 run");
    if (row.state !== "in_progress") throw new Error("stage-12 pass report is already closed");
    return getStage12Run(world, row.flow_id);
  }

  const source = sourceSummaryFor(world, input);
  const existingFlowId = findExistingRun(world, input.sourceType, source);
  if (existingFlowId != null) return getStage12Run(world, existingFlowId);

  return world.atomicWrite(() => {
    const report = world.createRecord({
      recordTypeKey: "pass_report",
      title: `Stage-12 pass: ${source.sourceSummary}`,
      body: [
        `Flow key: ${FLOW_KEY}`,
        "Status: in progress",
        `Source: ${source.sourceSummary}`,
        "Close sections are inserted once when the pass satisfies server-owned readiness."
      ].join("\n"),
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    });
    const flow = world.createFlowInstance({ flowKey: FLOW_KEY, currentStep: "stage12:entry" });
    world.db.prepare(`
      INSERT INTO stage12_run_sources (
        flow_id,
        pass_report_record_id,
        source_type,
        source_record_id,
        source_section_heading,
        material_title,
        material_body,
        source_summary,
        flow_step
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'stage12:entry')
    `).run(
      Number(flow.id),
      report.id,
      input.sourceType,
      source.sourceRecordId,
      source.sourceSectionHeading,
      source.materialTitle,
      source.materialBody,
      source.sourceSummary
    );
    if (source.sourceRecordId != null) {
      world.createLinkIfMissing(report.id, source.sourceRecordId, "derived_from", "Stage-12 pass analyzes this source");
    }
    return getStage12Run(world, Number(flow.id));
  });
};

export const saveStage12Coverage = (
  world: WorldFile,
  input: { flowId: number; lensKey: string; body: string }
) => {
  readFlow(world, input.flowId);
  const source = readSource(world, input.flowId);
  const lens = lensByKey(input.lensKey);
  assertSubstance(input.body);
  world.db.prepare(`
    INSERT INTO stage12_coverage (flow_id, pass_report_record_id, lens_key, lens_label, body, flow_step)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(flow_id, lens_key) DO UPDATE SET
      body = excluded.body,
      flow_step = excluded.flow_step
  `).run(input.flowId, source.passReportRecordId, lens.key, lens.label, input.body, `stage12:coverage:${lens.key}`);
  world.updateFlowInstance(input.flowId, { currentStep: `stage12:coverage:${lens.key}` });
  return { coverage: coverageRows(world, input.flowId), closeReadiness: closeReadiness(world, input.flowId) };
};

export const createOrLinkStage12Card = (
  world: WorldFile,
  input: {
    flowId: number;
    cardTypeKey: Stage12CardType;
    existingRecordId?: number;
    title?: string;
    body?: string;
    lensKey?: string;
    relation?: string;
    advisoryRecordId?: number;
  }
) => {
  readFlow(world, input.flowId);
  if (!CARD_TYPES.has(input.cardTypeKey)) throw new Error(`Unsupported stage-12 card type: ${input.cardTypeKey}`);
  const source = readSource(world, input.flowId);
  const lensKey = input.lensKey ?? input.cardTypeKey;
  if (input.lensKey) lensByKey(input.lensKey);
  if (input.advisoryRecordId != null) assertAdvisoryDisposed(world, input.advisoryRecordId);

  return world.atomicWrite(() => {
    const card = input.existingRecordId == null
      ? world.createRecord({
          recordTypeKey: input.cardTypeKey,
          title: input.title?.trim() || `Stage-12 ${input.cardTypeKey}`,
          body: input.body ?? "",
          truthLayer: "Objective canon",
          canonStatus: "proposed"
        })
      : world.getRecord(input.existingRecordId);
    if (card.recordTypeKey !== input.cardTypeKey) throw new Error(`linked card must be ${input.cardTypeKey}`);
    world.db.prepare(`
      INSERT OR IGNORE INTO stage12_linked_cards (flow_id, pass_report_record_id, card_record_id, card_type_key, lens_key, relation, flow_step)
      VALUES (?, ?, ?, ?, ?, ?, 'stage12:card')
    `).run(input.flowId, source.passReportRecordId, card.id, input.cardTypeKey, lensKey, input.relation ?? "");
    world.createLinkIfMissing(source.passReportRecordId, card.id, "covers", "Stage-12 pass records this linked card");
    world.createLinkIfMissing(card.id, source.passReportRecordId, "derived_from", "Card created or linked from stage-12 pass");
    for (const recordId of sourceRecordIds(source)) {
      world.createLinkIfMissing(card.id, recordId, "derived_from", "Stage-12 card preserves analyzed-source provenance");
    }
    if (input.advisoryRecordId != null) {
      PromptOut.linkExplicitAdvisoryUse(world, card.id, input.advisoryRecordId, {
        derivedFromNote: "Stage-12 card used disposed advisory material",
        citationNote: "Disposed stage-12 advisory artifact consulted"
      });
      insertAdvisoryUse(world, input.flowId, source.passReportRecordId, input.advisoryRecordId, card.id, "card", "Disposed advisory material used for linked card");
    }
    world.updateFlowInstance(input.flowId, { currentStep: "stage12:card" });
    return { card, linkedCards: linkedCardRows(world, input.flowId), closeReadiness: closeReadiness(world, input.flowId) };
  });
};

export const proposeFactFromStage12 = (
  world: WorldFile,
  input: { flowId: number; lensKey: string; title: string; body: string; truthLayer: string; advisoryRecordId?: number }
): { record: RecordRow; queue: AdmissionQueueRow[] } => {
  readFlow(world, input.flowId);
  lensByKey(input.lensKey);
  if (!input.title.trim() || !input.body.trim()) throw new Error("stage-12 proposals require steward-authored title and body");
  if (input.advisoryRecordId != null) assertAdvisoryDisposed(world, input.advisoryRecordId);
  const source = readSource(world, input.flowId);

  return world.atomicWrite(() => {
    const intake = intakeProposedFact(world, {
      origin: "future-flow",
      candidate: {
        title: input.title,
        body: [`Stage-12 lens: ${input.lensKey}`, input.body].join("\n"),
        truthLayer: input.truthLayer,
        canonStatus: "proposed"
      },
      sourceLinks: [
        { recordId: source.passReportRecordId, note: "Fact surfaced by stage-12 pass report" },
        ...sourceLinkInputs(source)
      ],
      recordSweepJurisdiction: true,
      provenanceFlowStep: `stage12:proposal:${input.lensKey}`
    });
    world.db.prepare(`
      INSERT INTO stage12_proposals (flow_id, pass_report_record_id, proposal_record_id, lens_key, advisory_record_id, flow_step)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(input.flowId, source.passReportRecordId, intake.record.id, input.lensKey, input.advisoryRecordId ?? null, `stage12:proposal:${input.lensKey}`);
    world.createLinkIfMissing(source.passReportRecordId, intake.record.id, "covers", "Stage-12 pass surfaced this Admission proposal");
    if (input.advisoryRecordId != null) {
      PromptOut.linkExplicitAdvisoryUse(world, intake.record.id, input.advisoryRecordId, {
        derivedFromNote: "Stage-12 proposal used disposed advisory material",
        citationNote: "Disposed stage-12 advisory artifact consulted"
      });
      insertAdvisoryUse(world, input.flowId, source.passReportRecordId, input.advisoryRecordId, intake.record.id, "proposal", "Disposed advisory material used for proposal");
    }
    world.updateFlowInstance(input.flowId, { currentStep: `stage12:proposal:${input.lensKey}` });
    return intake;
  });
};

export const mintStage12Debt = (
  world: WorldFile,
  input: { flowId: number; lensKey: string; name: string; reason: string; severityOrConsequenceMode?: string; advisoryRecordId?: number }
) => {
  readFlow(world, input.flowId);
  lensByKey(input.lensKey);
  assertSubstance(input.reason);
  if (!input.name.trim()) throw new Error("stage-12 canon debt requires a name");
  if (input.advisoryRecordId != null) assertAdvisoryDisposed(world, input.advisoryRecordId);
  const source = readSource(world, input.flowId);
  return world.atomicWrite(() => {
    const debt = world.createCanonDebt({
      name: input.name,
      scope: `stage-12:${input.lensKey}`,
      assignee: "steward",
      body: [
        `Lens: ${input.lensKey}`,
        `Reason: ${input.reason}`,
        `Severity or consequence mode: ${input.severityOrConsequenceMode ?? "not recorded"}`,
        `Source report: ${source.passReportRecordId}`
      ].join("\n")
    });
    world.db.prepare(`
      INSERT INTO stage12_debts (flow_id, pass_report_record_id, debt_record_id, lens_key, reason, severity_or_consequence_mode, advisory_record_id, flow_step)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      input.flowId,
      source.passReportRecordId,
      debt.id,
      input.lensKey,
      input.reason,
      input.severityOrConsequenceMode ?? "",
      input.advisoryRecordId ?? null,
      `stage12:debt:${input.lensKey}`
    );
    world.createLinkIfMissing(source.passReportRecordId, debt.id, "requires_follow_up", "Stage-12 pass minted follow-up canon debt");
    for (const recordId of sourceRecordIds(source)) {
      world.createLinkIfMissing(debt.id, recordId, "derived_from", "Stage-12 debt preserves analyzed-source provenance");
    }
    if (input.advisoryRecordId != null) {
      PromptOut.linkExplicitAdvisoryUse(world, debt.id, input.advisoryRecordId, {
        derivedFromNote: "Stage-12 debt used disposed advisory material",
        citationNote: "Disposed stage-12 advisory artifact consulted"
      });
      insertAdvisoryUse(world, input.flowId, source.passReportRecordId, input.advisoryRecordId, debt.id, "debt", "Disposed advisory material used for debt");
    }
    world.updateFlowInstance(input.flowId, { currentStep: `stage12:debt:${input.lensKey}` });
    return { debt, debtRows: debtRows(world, input.flowId), closeReadiness: closeReadiness(world, input.flowId) };
  });
};

export const storeStage12Advisory = (
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
      INSERT INTO stage12_advisories (flow_id, pass_report_record_id, advisory_record_id, step_key, flow_step)
      VALUES (?, ?, ?, ?, ?)
    `).run(input.flowId, source.passReportRecordId, record.id, input.stepKey, `stage12:advisory:${input.stepKey}`);
    world.createLinkIfMissing(source.passReportRecordId, record.id, "cites_advisory_artifact", "Stage-12 pass stores this advisory artifact");
    world.createLinkIfMissing(record.id, source.passReportRecordId, "derived_from", "Stage-12 advisory artifact belongs to this pass report");
    world.updateFlowInstance(input.flowId, { currentStep: `stage12:advisory:${input.stepKey}` });
    return { record, advisories: advisoryRows(world, input.flowId), closeReadiness: closeReadiness(world, input.flowId) };
  });
};

export const skipStage12Step = (
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
        if (debt.recordTypeKey !== "canon_debt") throw new Error("unresolved stage-12 skip follow-up must be canon debt");
      } else {
        if (!input.debtName?.trim()) throw new Error("unresolved stage-12 skips require a follow-up debt name");
        debt = world.createCanonDebt({
          name: input.debtName,
          scope: `stage-12:${input.stepKey}`,
          assignee: "steward",
          body: input.reason ?? `Skipped stage-12 step ${input.stepKey}`
        });
      }
      world.createLinkIfMissing(source.passReportRecordId, debt.id, "requires_follow_up", "Stage-12 skip left unresolved work");
      world.db.prepare(`
        INSERT OR IGNORE INTO stage12_debts (
          flow_id,
          pass_report_record_id,
          debt_record_id,
          lens_key,
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
        input.reason ?? `Skipped stage-12 step ${input.stepKey}`,
        input.workScale ?? "",
        `stage12:skip:${input.stepKey}`
      );
    }
    world.db.prepare(`
      INSERT INTO stage12_skips (flow_id, pass_report_record_id, skip_record_id, step_key, unresolved, debt_record_id, flow_step)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(input.flowId, source.passReportRecordId, record.id, input.stepKey, input.unresolved ? 1 : 0, debt?.id ?? null, `stage12:skip:${input.stepKey}`);
    world.createLinkIfMissing(source.passReportRecordId, record.id, "covers", "Stage-12 pass records this governed skip");
    world.createLinkIfMissing(record.id, source.passReportRecordId, "derived_from", "Stage-12 skip belongs to this pass report");
    world.updateFlowInstance(input.flowId, { currentStep: `stage12:skip:${input.stepKey}` });
    return { record, debt, skips: skipRows(world, input.flowId), closeReadiness: closeReadiness(world, input.flowId) };
  });
};

const insertAdvisoryUse = (
  world: WorldFile,
  flowId: number,
  passReportRecordId: number,
  advisoryRecordId: number,
  outcomeRecordId: number,
  outcomeKind: "card" | "proposal" | "debt" | "report",
  note: string
) => {
  world.db.prepare(`
    INSERT OR IGNORE INTO stage12_advisory_uses (
      flow_id,
      pass_report_record_id,
      advisory_record_id,
      outcome_record_id,
      outcome_kind,
      note,
      flow_step
    )
    VALUES (?, ?, ?, ?, ?, ?, 'stage12:advisory-use')
  `).run(flowId, passReportRecordId, advisoryRecordId, outcomeRecordId, outcomeKind, note);
};

const cardTitlesByLens = (cards: ReturnType<typeof linkedCardRows>) => {
  const grouped = new Map<string, string[]>();
  for (const card of cards) {
    const key = card.lensKey ?? card.cardTypeKey;
    grouped.set(key, [...(grouped.get(key) ?? []), `${card.card.shortId} ${card.card.title}`]);
  }
  return grouped;
};

const writeCloseSections = (world: WorldFile, flowId: number): void => {
  const source = readSource(world, flowId);
  const report = world.getRecord(source.passReportRecordId);
  if (world.listSections(report.id).length) return;
  const coverage = coverageRows(world, flowId);
  const cards = linkedCardRows(world, flowId);
  const proposals = proposalRows(world, flowId);
  const debt = debtRows(world, flowId);
  const advisories = advisoryRows(world, flowId);
  const skips = skipRows(world, flowId);
  const cardTitles = cardTitlesByLens(cards);
  world.replaceSections(report.id, [
    {
      heading: "Source and run",
      body: [`Flow key: ${FLOW_KEY}`, `Flow id: ${flowId}`, `Source: ${source.sourceSummary}`, `Source type: ${source.sourceType}`].join("\n"),
      position: 1
    },
    {
      heading: "Coverage lenses",
      body: LENSES.map((lens) => {
        const row = coverage.find((item) => item.lensKey === lens.key);
        const linked = cardTitles.get(lens.key);
        return [
          `## ${lens.label}`,
          row?.body ?? "Missing.",
          linked?.length ? `Linked cards: ${linked.join(", ")}` : ""
        ].filter(Boolean).join("\n");
      }).join("\n\n"),
      position: 2
    },
    {
      heading: "Linked cards",
      body: cards.map((card) => `- ${card.card.shortId} ${card.card.title} (${card.cardTypeKey})${card.relation ? `: ${card.relation}` : ""}`).join("\n") || "No linked cards.",
      position: 3
    },
    {
      heading: "Admission proposals",
      body: proposals.map((proposal) => `- ${proposal.record.shortId} ${proposal.record.title} (${proposal.record.canonStatus}) from ${proposal.lensKey}`).join("\n") || "No Admission proposals.",
      position: 4
    },
    {
      heading: "Canon debt",
      body: debt.map((item) => `- ${item.record.shortId} ${item.record.title}: ${item.reason}`).join("\n") || "No stage-12 canon debt.",
      position: 5
    },
    {
      heading: "Prompt-out and skips",
      body: [
        advisories.map((advisory) => `- Advisory ${advisory.record.shortId} ${advisory.record.title} (${advisory.stepKey})`).join("\n"),
        skips.map((skip) => `- Skip ${skip.record.shortId} ${skip.stepKey}: ${skip.record.body}${skip.debt ? `\n  Follow-up debt: ${skip.debt.shortId} ${skip.debt.title}` : ""}`).join("\n")
      ].filter(Boolean).join("\n") || "No advisory artifacts or governed skips.",
      position: 6
    },
    {
      heading: "Close readiness",
      body: "Closed with all required stage-12 coverage present. Admission proposals, debt, advisory artifacts, and skips remain governed by their own records.",
      position: 7
    }
  ]);
};

export const closeStage12Run = (world: WorldFile, flowId: number) => {
  const flow = readFlow(world, flowId);
  if (String(flow.state) === "complete") throw new Error("stage-12 run is already closed");
  const readiness = closeReadiness(world, flowId);
  if (readiness.blockers.length) {
    throw new Error(`stage-12 close blocked: ${readiness.blockers.map((blocker) => blocker.label).join(", ")}`);
  }
  return world.atomicWrite(() => {
    const source = readSource(world, flowId);
    writeCloseSections(world, flowId);
    const complete = world.updateFlowInstance(flowId, { state: "complete", currentStep: "stage12:complete" });
    return {
      ...getStage12Run(world, flowId),
      flow: complete,
      report: world.getRecord(source.passReportRecordId)
    };
  });
};
