import { intakeProposedFact } from "./admission-flow.js";
import { ADVISORY_OUTPUT_LABELS, promptMode, withPromptModeSummaries, type DecisionPointPromptMode, type DecisionPointSharedContract } from "./decision-point-contract.js";
import { methodCard, methodCardDoctrineSlots, methodCardsForFlow, methodCardSourceManifest } from "./method-cards.js";
import { coverMatchingConditionalPassObligation } from "./conditional-pass-obligations.js";
import * as PromptOut from "./prompt-out.js";
import type { AdmissionQueueRow, RecordRow, SectionRow, WorldFile } from "./world-file.js";

export const FLOW_KEY = "temporal_timeline";
export const PROMPT_TEMPLATE_KEY = "temporal_spatial_analyst";

type TemporalSourceType = "fact" | "capability" | "canon_debt" | "material";

const STEP_MAP = [
  { key: "run_entry", label: "Run entry and trigger recommendation", decision: "Choose the source and trigger recommendation, then decide whether Temporal work applies." },
  { key: "temporal_questions", label: "Temporal questions", decision: "Answer when the fact became true, became known, adapted, and left residue." },
  { key: "date_type_granularity", label: "Date-type and granularity assignment", decision: "Separate date facets and choose the lightest granularity that preserves sequence." },
  { key: "latency_assessment", label: "Latency assessment", decision: "Explain why the world did not adapt instantly." },
  { key: "residue_by_timescale", label: "Residue by timescale", decision: "Name days, years, generations, or era-scale fossils." },
  { key: "sequence_integrity", label: "Sequence-integrity audit", decision: "Check that effects do not precede causes without explanation." },
  { key: "retrospective_insertion", label: "Retrospective insertion", decision: "Treat inserted facts as timeline disturbances." },
  { key: "temporal_mystery_boundaries", label: "Temporal mystery boundaries", decision: "Record observable boundaries without solving protected time mysteries." },
  { key: "outcomes", label: "Temporal outcomes", decision: "Choose card, proposal, debt, explicit no-card close, or non-mutation." },
  { key: "prompt_out_skips", label: "Prompt-out and skips", decision: "Use, dispose, cite, or skip advisory Temporal pressure." },
  { key: "close_preview", label: "Close preview", decision: "Confirm substance before closing the append-only pass report." },
  { key: "read_side_trail", label: "Read-side trail", decision: "Follow the report, cards, proposals, debt, advisory artifacts, and skips." }
] as const;

const DOCTRINE = {
  flowKey: FLOW_KEY,
  protocol: "docs/worldbuilding-system/09_temporal_and_timeline_protocol.md",
  checklist: "docs/worldbuilding-system/checklists/temporal_timeline_sweep.md",
  template: "docs/worldbuilding-system/templates/temporal_timeline_card.md",
  aiWorkflow: "docs/worldbuilding-system/20_ai_assisted_workflow.md",
  triggerRecommendation: "Run `09` for any Level 2 or higher fact with first appearance, discovery, public knowledge, institutional reaction, branch divergence, retcon, prophecy, inheritance, war, migration, law, aging, or evidence implications. The app surfaces this as guidance and never classifies applicability.",
  completionRule: "A completed Temporal sweep must leave sequence, latency band, competing chronology, and residue; skipped major work records why the protocol did not apply.",
  browserPolicy: "Server responses own trigger recommendation, decision-point obligations, blockers, Prompt-out state, write intent, close readiness, and read-side trail.",
  stepMap: STEP_MAP,
  handoffs: [
    "temporal questions/date facets/granularity/latency/residue/sequence integrity",
    "Temporal timeline cards and explicit no-card close",
    "Admission proposals and canon debt",
    "Prompt-out/skips",
    "browser decision surface",
    "coverage closeout"
  ],
  work: {
    required: ["First-true or relative sequence", "First-known date or reason", "Date types and granularity", "Plausible latency", "Residue by timescale", "Sequence-integrity answer", "Temporal mystery boundaries where relevant"],
    optional: ["Temporal timeline card", "Admission proposal", "Canon debt", "Prompt-out advisory support", "Explicit no-card close"],
    skippable: ["Offered Temporal instruments write skip_record entries when declined"],
    severityDependent: ["Level 2+ facts owe the full Temporal audit recommendation", "Major-or-higher skipped Temporal work requires a reason and can preserve or create canon debt"]
  }
} as const;

const COVERAGE_LABELS = {
  temporalQuestions: "Temporal questions",
  firstTrueOrRelativeSequence: "First true or relative sequence",
  firstKnownOrReason: "First known date or reason",
  dateTypesAndGranularity: "Date types and granularity",
  latency: "Latency",
  residueByTimescale: "Residue by timescale",
  sequenceIntegrity: "Sequence integrity",
  retrospectiveInsertion: "Retrospective insertion",
  temporalMysteryBoundaries: "Temporal mystery boundaries",
  outcomeDecision: "Outcome decision"
} as const;

type TemporalCoverage = Record<keyof typeof COVERAGE_LABELS, string>;

const emptyishValues = new Set(["checked", "done", "yes", "true", "x", "[x]", "complete", "completed", "none", "n/a", "na", "no"]);

const hasSubstance = (value: string): boolean => {
  const normalized = value.trim().toLowerCase();
  return normalized.length >= 12 && !emptyishValues.has(normalized);
};

const assertSubstance = (value: string, label: string): void => {
  if (!hasSubstance(value)) throw new Error(`${label} requires steward-authored substance; checkbox-only answers, generic empty answers, and unreasoned none are not evidence`);
};

const assertCoverageSubstance = (coverage: TemporalCoverage): void => {
  for (const [key, value] of Object.entries(coverage) as Array<[keyof TemporalCoverage, string]>) {
    assertSubstance(value, COVERAGE_LABELS[key]);
  }
};

const lineValue = (body: string, label: string): string => {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return body.match(new RegExp(`^${escaped}: (.*)$`, "m"))?.[1] ?? "";
};

const sourceFromReport = (report: RecordRow) => ({
  flowId: Number(lineValue(report.body, "Flow id") || 0),
  passReportRecordId: report.id,
  sourceType: lineValue(report.body, "Source type") as TemporalSourceType,
  sourceRecordId: lineValue(report.body, "Source record id") ? Number(lineValue(report.body, "Source record id")) : null,
  materialTitle: lineValue(report.body, "Material title"),
  materialBody: lineValue(report.body, "Material body"),
  auditedSubject: lineValue(report.body, "Audited subject"),
  sourceSummary: lineValue(report.body, "Source summary"),
  triggerRecommendation: DOCTRINE.triggerRecommendation
});

const coverageBody = (coverage: TemporalCoverage): string =>
  (Object.entries(COVERAGE_LABELS) as Array<[keyof TemporalCoverage, string]>)
    .map(([key, label]) => `${label}: ${coverage[key]}`)
    .join("\n");

const coverageFromSections = (sections: SectionRow[]): TemporalCoverage | null => {
  const section = sections.find((item) => item.heading === "Coverage lenses");
  if (!section) return null;
  return Object.fromEntries(
    (Object.entries(COVERAGE_LABELS) as Array<[keyof TemporalCoverage, string]>)
      .map(([key, label]) => [key, lineValue(section.body, label)])
  ) as TemporalCoverage;
};

const reportIdFromStep = (step: string): number | null => {
  const match = step.match(/^temporal:report:(\d+):/);
  return match ? Number(match[1]) : null;
};

const stepWithReport = (reportId: number, step: string): string => `temporal:report:${reportId}:${step}`;

const readFlow = (world: WorldFile, flowId: number) => world.getFlowInstance(flowId, FLOW_KEY);

const readReport = (world: WorldFile, flowId: number): RecordRow => {
  const flow = readFlow(world, flowId);
  const reportId = reportIdFromStep(String(flow.current_step));
  if (reportId == null) throw new Error(`Temporal run is missing pass report in current step: ${flow.current_step}`);
  const report = world.getRecord(reportId);
  if (report.recordTypeKey !== "pass_report") throw new Error("Temporal run report must be a pass_report");
  return report;
};

const sourceRecordIds = (source: ReturnType<typeof sourceFromReport>): number[] =>
  source.sourceRecordId == null ? [] : [source.sourceRecordId];

const inProgressTemporalFlows = (world: WorldFile) =>
  world.db.prepare("SELECT * FROM flow_instances WHERE flow_key = ? AND state = 'in_progress' ORDER BY id DESC").all(FLOW_KEY) as Array<{ id: number; current_step: string }>;

const findRunForReport = (world: WorldFile, reportRecordId: number) =>
  inProgressTemporalFlows(world).find((flow) => reportIdFromStep(String(flow.current_step)) === reportRecordId)?.id ?? null;

const temporalMethodCardForStep = (stepKey: string) => {
  if (stepKey.includes("questions")) return methodCard("temporal.questions");
  if (stepKey.includes("date") || stepKey.includes("granularity")) return methodCard("temporal.date-type-granularity");
  if (stepKey.includes("latency") || stepKey.includes("residue")) return methodCard("temporal.latency-residue");
  if (stepKey.includes("sequence") || stepKey.includes("retrospective")) return methodCard("temporal.sequence-retrospective");
  if (stepKey.includes("mystery") || stepKey.includes("branch")) return methodCard("temporal.mystery-boundaries");
  if (stepKey.includes("outcome") || stepKey.includes("card") || stepKey.includes("proposal") || stepKey.includes("debt")) return methodCard("temporal.outcomes");
  if (stepKey.includes("prompt") || stepKey.includes("skip") || stepKey.includes("advisory")) return methodCard("temporal.prompt-out-skips");
  if (stepKey.includes("close") || stepKey.includes("complete")) return methodCard("temporal.close-preview");
  if (stepKey.includes("trail") || stepKey.includes("read")) return methodCard("temporal.read-side-trail");
  return methodCard("temporal.run-entry");
};

const sourceSummaryFor = (world: WorldFile, input: Exclude<StartTemporalRunInput, { sourceType: "pass_report" }>) => {
  if (input.sourceType === "material") {
    if (!input.materialTitle.trim() || !input.materialBody.trim()) throw new Error("Temporal material starts require a title and body");
    return {
      sourceType: input.sourceType,
      sourceRecordId: null,
      materialTitle: input.materialTitle,
      materialBody: input.materialBody,
      auditedSubject: input.auditedSubject?.trim() || input.materialTitle,
      sourceSummary: `Selected material: ${input.materialTitle}`
    };
  }

  const record = world.getRecord(input.recordId);
  if (input.sourceType === "fact" && record.recordTypeKey !== "canon_fact") throw new Error("Temporal fact starts require a canon_fact record");
  if (input.sourceType === "capability" && record.recordTypeKey !== "capability") throw new Error("Temporal capability starts require a capability record");
  if (input.sourceType === "canon_debt" && record.recordTypeKey !== "canon_debt") throw new Error("Temporal debt starts require a canon_debt record");
  return {
    sourceType: input.sourceType,
    sourceRecordId: record.id,
    materialTitle: "",
    materialBody: record.body,
    auditedSubject: input.auditedSubject?.trim() || `${record.shortId} ${record.title}`,
    sourceSummary: `${record.shortId} ${record.title}`
  };
};

const findExistingRun = (world: WorldFile, source: ReturnType<typeof sourceSummaryFor>): number | null => {
  for (const flow of inProgressTemporalFlows(world)) {
    const reportId = reportIdFromStep(String(flow.current_step));
    if (reportId == null) continue;
    const current = sourceFromReport(world.getRecord(reportId));
    if (
      current.sourceType === source.sourceType
      && current.sourceRecordId === source.sourceRecordId
      && current.materialTitle === source.materialTitle
      && current.materialBody === source.materialBody
    ) return Number(flow.id);
  }
  return null;
};

const closeReadiness = (world: WorldFile, flowId: number) => {
  const flow = readFlow(world, flowId);
  if (String(flow.state) === "complete") return { status: "closed", blockers: [] };
  const coverage = coverageFromSections(world.listSections(readReport(world, flowId).id));
  const blockers: Array<{ kind: string; key: string; label: string; message: string; classification: string }> = [];
  const push = (key: string, label: string, message: string) => blockers.push({ kind: key, key, label, message, classification: "missing_required_coverage" });
  if (!coverage || !hasSubstance(coverage.firstTrueOrRelativeSequence)) push("first_true_sequence", "First true or relative sequence", "Record when the fact first became true or its relative causal sequence.");
  if (!coverage || !hasSubstance(coverage.firstKnownOrReason)) push("first_known_date", "First known date", "Record when knowledge first matters or why it does not.");
  if (!coverage || !hasSubstance(coverage.dateTypesAndGranularity)) push("date_types_granularity", "Date types and granularity", "Separate date facets and record the chosen granularity.");
  if (!coverage || !hasSubstance(coverage.latency)) push("latency", "Latency", "Explain plausible adaptation delay.");
  if (!coverage || !hasSubstance(coverage.residueByTimescale)) push("residue", "Residue by timescale", "Name residue at the timescale the fact's age requires.");
  if (!coverage || !hasSubstance(coverage.sequenceIntegrity)) push("sequence_integrity", "Sequence integrity", "Check that causes precede effects or explain the exception.");
  if (!coverage || !hasSubstance(coverage.temporalMysteryBoundaries)) push("temporal_mystery_boundaries", "Temporal mystery boundaries", "Record observable boundaries for mysteries or branches, or why none are in scope.");
  if (!coverage || !hasSubstance(coverage.outcomeDecision)) push("outcome_decision", "Outcome decision", "Record card, proposal, debt, no-card close, or explicit non-mutation.");
  return { status: blockers.length ? "blocked" : "ready", blockers };
};

const promptOutState = (world: WorldFile, flowId: number) => {
  const source = sourceFromReport(readReport(world, flowId));
  const coverage = coverageFromSections(world.listSections(source.passReportRecordId));
  const available = coverage != null;
  return {
    available,
    templateKey: PROMPT_TEMPLATE_KEY,
    role: "Spatial-temporal analyst",
    stepKey: "temporal:spatial-temporal-analysis",
    reason: available ? "Steward-authored Temporal material exists." : "Pressure prompts require steward-authored Temporal material for the current decision point.",
    coldUseEvidence: "Prompt packets include source manifest, current Temporal decision, date facets, latency, residue, sequence integrity, doctrine, omissions, and advisory/canon warning for a cold external LLM.",
    sourceRecordId: source.sourceRecordId
  };
};

const temporalPromptModes = (world: WorldFile, flowId: number): DecisionPointPromptMode[] => {
  const promptOut = promptOutState(world, flowId);
  const source = sourceFromReport(readReport(world, flowId));
  const activeSetRevision = PromptOut.temporalPacketRevision(world, flowId);
  const commonBody = {
    flowKey: FLOW_KEY,
    flowId,
    recordId: promptOut.sourceRecordId ?? undefined,
    templateKey: PROMPT_TEMPLATE_KEY,
    stepKey: promptOut.stepKey,
    activeSetRevision
  };
  return withPromptModeSummaries([
    promptMode({
      mode: "proposal",
      label: "Proposal mode",
      available: true,
      blocker: null,
      framing: `Request labeled candidate Temporal material for ${source.sourceSummary}; adoption remains steward authorship.`,
      role: "Temporal/Timeline proposal",
      templateKey: PROMPT_TEMPLATE_KEY,
      stepKey: promptOut.stepKey,
      outputLabels: ADVISORY_OUTPUT_LABELS,
      stepRequest: { method: "POST", href: "/api/prompt-out/steps", body: { ...commonBody, mode: "proposal", label: "Proposal mode" } }
    }),
    promptMode({
      mode: "pressure",
      label: "Pressure mode",
      available: promptOut.available,
      blocker: promptOut.available ? null : "Pressure prompts require steward-authored Temporal material for the current decision point.",
      framing: "Ask for challenge on sequence, diffusion, latency, residue, chronology pluralism, and mystery boundaries.",
      role: promptOut.role,
      templateKey: PROMPT_TEMPLATE_KEY,
      stepKey: promptOut.stepKey,
      outputLabels: ADVISORY_OUTPUT_LABELS,
      stepRequest: promptOut.available ? { method: "POST", href: "/api/prompt-out/steps", body: { ...commonBody, mode: "pressure", label: promptOut.role } } : null
    })
  ]);
};

const readSideTrail = (world: WorldFile, flowId: number) => {
  const source = sourceFromReport(readReport(world, flowId));
  const trail: Array<{ label: string; href: string; recordId?: number }> = [
    { label: "Temporal pass report", recordId: source.passReportRecordId, href: `/api/canon-workbench/records/${source.passReportRecordId}` },
    ...sourceRecordIds(source).map((recordId) => ({ label: "Source record", recordId, href: `/api/canon-workbench/records/${recordId}` })),
    { label: "Audit Trail", href: "/api/canon-workbench/audit" },
    { label: "Current Canon", href: "/api/canon-workbench/current" }
  ];
  for (const link of world.listLinks(source.passReportRecordId)) {
    if (link.fromRecordId !== source.passReportRecordId) continue;
    const target = world.getRecord(link.toRecordId);
    if (target.recordTypeKey === "temporal_timeline") trail.push({ label: "Temporal timeline card", recordId: target.id, href: `/api/canon-workbench/records/${target.id}` });
    if (target.recordTypeKey === "canon_fact") trail.push({ label: "Admission proposal", recordId: target.id, href: `/api/canon-workbench/records/${target.id}` });
    if (target.recordTypeKey === "canon_debt") trail.push({ label: "Canon debt", recordId: target.id, href: `/api/canon-workbench/records/${target.id}` });
    if (target.recordTypeKey === "skip_record") trail.push({ label: "Skip record", recordId: target.id, href: `/api/canon-workbench/records/${target.id}` });
    if (target.recordTypeKey === "advisory_artifact") trail.push({ label: "Advisory artifact", recordId: target.id, href: `/api/canon-workbench/records/${target.id}` });
  }
  return trail;
};

const temporalDecisionPoint = (world: WorldFile, flowId: number): { sharedContract: DecisionPointSharedContract } => {
  const flow = readFlow(world, flowId);
  const report = readReport(world, flowId);
  const source = sourceFromReport(report);
  const stepKey = String(flow.current_step).replace(/^temporal:report:\d+:/, "temporal:");
  const cardValue = temporalMethodCardForStep(stepKey);
  const readiness = closeReadiness(world, flowId);
  const promptOut = promptOutState(world, flowId);
  const coverage = coverageFromSections(world.listSections(report.id));
  const displayed = [
    `Source: ${source.sourceSummary}`,
    `Audited subject: ${source.auditedSubject}`,
    `09 trigger recommendation: ${DOCTRINE.triggerRecommendation}`,
    coverage ? `Date facets: ${coverage.dateTypesAndGranularity}` : "Date facets: not steward-authored yet",
    coverage ? `Latency: ${coverage.latency}` : "Latency: not steward-authored yet",
    `Prompt-out: ${promptOut.reason}`
  ];
  return {
    sharedContract: {
      contractVersion: "decision-point/v1",
      methodCard: cardValue,
      flow: { key: FLOW_KEY, runState: String(flow.state ?? "in_progress") },
      step: {
        key: stepKey,
        localDecision: (STEP_MAP.find((step) => stepKey.includes(step.key)) ?? STEP_MAP[0]).decision,
        packageSource: DOCTRINE.protocol,
        why: "Temporal/Timeline keeps timing as causality under sequence, latency, residue, and steward-owned date judgments."
      },
      obligations: {
        required: [...DOCTRINE.work.required],
        optional: [...DOCTRINE.work.optional],
        skippable: [...DOCTRINE.work.skippable],
        severityDependent: [...DOCTRINE.work.severityDependent]
      },
      skipRule: { offered: true, reasonRequired: true, reasonThreshold: "major-or-higher Temporal work", recordType: "skip_record" },
      doctrine: {
        slots: methodCardDoctrineSlots(cardValue),
        packageSources: [DOCTRINE.protocol, DOCTRINE.checklist, DOCTRINE.template, DOCTRINE.aiWorkflow]
      },
      bearingContext: {
        displayed,
        sourceManifest: [
          `Pass report: ${source.passReportRecordId}`,
          ...(source.sourceRecordId == null ? [] : [`Source record id: ${source.sourceRecordId}`]),
          ...methodCardSourceManifest(cardValue)
        ],
        omissions: ["Timeline branching UI is omitted by ADR 0003; date type, granularity, trigger applicability, and canon standing remain steward-authored."]
      },
      promptOut: { serverOwned: true, modes: temporalPromptModes(world, flowId) },
      blockers: readiness.blockers,
      substanceValidations: [
        "First-true sequence, latency, residue, and sequence integrity require steward-authored prose.",
        "Date facets stay separate; the app never collapses them into one timestamp."
      ],
      writeIntent: {
        willWrite: ["pass_report sections", "temporal_timeline card only with explicit steward title/body/truth layer/canon status", "skip_record when offered work is declined"],
        willLink: ["derived_from source link", "covers links for cards/proposals/skips", "advisory links only after explicit steward use"],
        willQueue: ["Admission proposals and canon debt only when explicitly routed"],
        willRouteOnward: ["Admission proposals", "canon debt", "read-side trail"],
        willLeaveUntouched: ["Temporal never admits facts in-pass", "the app does not classify trigger applicability, date type, granularity, or canon standing", "no branching UI is introduced"]
      },
      nextOrResumeState: {
        currentStep: stepKey,
        nextStep: readiness.status === "ready" ? "close preview or outcome routing" : "complete missing Temporal coverage",
        safeExit: "Safe exit leaves the Temporal pass in progress and resumable from its pass report."
      },
      readSideTrail: readSideTrail(world, flowId)
    }
  };
};

const linkedRecords = (world: WorldFile, reportId: number, recordType: string, linkType?: string) =>
  world.listLinks(reportId)
    .filter((link) => link.fromRecordId === reportId && (linkType == null || link.linkTypeKey === linkType))
    .map((link) => world.getRecord(link.toRecordId))
    .filter((record) => record.recordTypeKey === recordType);

const sections = (world: WorldFile, flowId: number) => world.listSections(readReport(world, flowId).id);

export type StartTemporalRunInput =
  | { sourceType: "fact" | "capability" | "canon_debt"; recordId: number; auditedSubject?: string }
  | { sourceType: "material"; materialTitle: string; materialBody: string; auditedSubject?: string }
  | { sourceType: "pass_report"; reportRecordId: number };

export interface SaveTemporalCoverageInput extends TemporalCoverage {
  flowId: number;
}

export const getTemporalRun = (world: WorldFile, flowId: number) => {
  const flow = readFlow(world, flowId);
  const report = readReport(world, flowId);
  const source = sourceFromReport(report);
  const currentSections = world.listSections(report.id);
  const coverage = coverageFromSections(currentSections);
  return {
    flow,
    report,
    source,
    doctrine: DOCTRINE,
    methodCards: methodCardsForFlow(FLOW_KEY),
    coverage,
    sections: currentSections,
    cards: linkedRecords(world, report.id, "temporal_timeline", "covers").map((card) => ({ card })),
    proposals: linkedRecords(world, report.id, "canon_fact", "covers").map((record) => ({ record })),
    debt: linkedRecords(world, report.id, "canon_debt", "requires_follow_up").map((record) => ({ record })),
    advisories: linkedRecords(world, report.id, "advisory_artifact", "cites_advisory_artifact").map((record) => ({ record })),
    skips: linkedRecords(world, report.id, "skip_record", "covers").map((record) => ({ record })),
    closeReadiness: closeReadiness(world, flowId),
    closePreview: closeReadiness(world, flowId),
    promptOut: promptOutState(world, flowId),
    readSideTrail: readSideTrail(world, flowId),
    decisionPoint: temporalDecisionPoint(world, flowId)
  };
};

export const startTemporalRun = (world: WorldFile, input: StartTemporalRunInput) => {
  if (input.sourceType === "pass_report") {
    const report = world.getRecord(input.reportRecordId);
    if (report.recordTypeKey !== "pass_report") throw new Error("Temporal resume requires a pass_report");
    const flowId = findRunForReport(world, report.id);
    if (flowId == null) throw new Error("Temporal pass report is not owned by an in-progress run");
    return getTemporalRun(world, flowId);
  }

  const source = sourceSummaryFor(world, input);
  const existingFlowId = findExistingRun(world, source);
  if (existingFlowId != null) return getTemporalRun(world, existingFlowId);

  return world.atomicWrite(() => {
    const report = world.createRecord({
      recordTypeKey: "pass_report",
      title: `Temporal/Timeline pass: ${source.sourceSummary}`,
      body: [
        `Flow key: ${FLOW_KEY}`,
        "Flow id: pending",
        "Status: in progress",
        `Source type: ${source.sourceType}`,
        `Source record id: ${source.sourceRecordId ?? ""}`,
        `Material title: ${source.materialTitle}`,
        `Material body: ${source.materialBody}`,
        `Audited subject: ${source.auditedSubject}`,
        `Source summary: ${source.sourceSummary}`,
        `Trigger recommendation: ${DOCTRINE.triggerRecommendation}`,
        "Close sections are inserted as append-only pass-report sections when steward-authored coverage and outcomes exist."
      ].join("\n"),
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    });
    const flow = world.createFlowInstance({ flowKey: FLOW_KEY, currentStep: stepWithReport(report.id, "entry") });
    if (source.sourceRecordId != null) {
      world.createLinkIfMissing(report.id, source.sourceRecordId, "derived_from", "Temporal/Timeline pass audits this source");
    }
    return getTemporalRun(world, Number(flow.id));
  });
};

export const saveTemporalCoverage = (world: WorldFile, input: SaveTemporalCoverageInput) => {
  const flow = readFlow(world, input.flowId);
  const report = readReport(world, input.flowId);
  if (coverageFromSections(world.listSections(report.id))) throw new Error("Temporal coverage is append-only for this run; start a new pass for corrected coverage");
  const coverage: TemporalCoverage = {
    temporalQuestions: input.temporalQuestions,
    firstTrueOrRelativeSequence: input.firstTrueOrRelativeSequence,
    firstKnownOrReason: input.firstKnownOrReason,
    dateTypesAndGranularity: input.dateTypesAndGranularity,
    latency: input.latency,
    residueByTimescale: input.residueByTimescale,
    sequenceIntegrity: input.sequenceIntegrity,
    retrospectiveInsertion: input.retrospectiveInsertion,
    temporalMysteryBoundaries: input.temporalMysteryBoundaries,
    outcomeDecision: input.outcomeDecision
  };
  assertCoverageSubstance(coverage);
  world.replaceSections(report.id, [{ heading: "Coverage lenses", body: coverageBody(coverage), position: 2 }]);
  world.updateFlowInstance(Number(flow.id), { currentStep: stepWithReport(report.id, "coverage") });
  return { coverage, closeReadiness: closeReadiness(world, input.flowId), promptOut: promptOutState(world, input.flowId), decisionPoint: temporalDecisionPoint(world, input.flowId) };
};

const requireCoverage = (world: WorldFile, flowId: number): TemporalCoverage => {
  const coverage = coverageFromSections(world.listSections(readReport(world, flowId).id));
  if (!coverage) throw new Error("Temporal outcome requires steward-authored Temporal coverage first");
  return coverage;
};

const assertAdvisoryDisposed = (world: WorldFile, advisoryRecordId: number): void => {
  const advisory = world.getRecord(advisoryRecordId);
  if (advisory.recordTypeKey !== "advisory_artifact") throw new Error("Temporal advisory use requires an advisory artifact");
  const row = world.db.prepare("SELECT 1 FROM advisory_dispositions WHERE advisory_record_id = ? LIMIT 1").get(advisoryRecordId);
  if (!row) throw new Error("advisory material cannot influence Temporal outcomes before an explicit disposition");
};

const temporalCardBody = (coverage: TemporalCoverage, extraBody = "") => [
  "Event or era",
  coverage.temporalQuestions,
  "",
  "Time scope",
  coverage.dateTypesAndGranularity,
  "",
  "Causes",
  coverage.firstTrueOrRelativeSequence,
  "",
  "Immediate consequences",
  coverage.firstKnownOrReason,
  "",
  "Delayed consequences",
  coverage.residueByTimescale,
  "",
  "Latency and lag",
  coverage.latency,
  "",
  "Competing chronologies",
  coverage.sequenceIntegrity,
  "",
  "Branch chronology",
  coverage.temporalMysteryBoundaries,
  "",
  "Retcon risk",
  coverage.retrospectiveInsertion,
  "",
  "Traceability note",
  `Parent protocol: ${DOCTRINE.protocol}. Separate event date, discovery date, public date, institutional date, ordinary-life date, and mythic date where relevant.`,
  extraBody
].filter(Boolean).join("\n");

export const createOrLinkTemporalCard = (
  world: WorldFile,
  input: { flowId: number; existingRecordId?: number; title?: string; body?: string; truthLayer?: string; canonStatus?: string; relation?: string; advisoryRecordId?: number }
) => {
  const report = readReport(world, input.flowId);
  const source = sourceFromReport(report);
  const coverage = requireCoverage(world, input.flowId);
  if (input.advisoryRecordId != null) assertAdvisoryDisposed(world, input.advisoryRecordId);
  return world.atomicWrite(() => {
    const truthLayer = input.truthLayer?.trim() ?? "";
    const canonStatus = input.canonStatus?.trim() ?? "";
    if (input.existingRecordId == null && (!truthLayer || !canonStatus)) {
      throw new Error("Temporal card creation requires steward-authored truth layer and canon status");
    }
    const card = input.existingRecordId == null
      ? world.createRecord({
          recordTypeKey: "temporal_timeline",
          title: input.title?.trim() || `Temporal timeline: ${source.auditedSubject}`,
          body: temporalCardBody(coverage, input.body),
          truthLayer,
          canonStatus
        })
      : world.getRecord(input.existingRecordId);
    if (card.recordTypeKey !== "temporal_timeline") throw new Error("linked card must be a temporal_timeline record");
    world.createLinkIfMissing(report.id, card.id, "covers", input.relation || "Temporal/Timeline pass records this timeline card");
    world.createLinkIfMissing(card.id, report.id, "derived_from", "Temporal timeline card created or linked from Temporal/Timeline pass");
    for (const recordId of sourceRecordIds(source)) {
      world.createLinkIfMissing(card.id, recordId, "temporal_depends_on", "Temporal card preserves source timing provenance");
    }
    if (input.advisoryRecordId != null) {
      PromptOut.linkExplicitAdvisoryUse(world, card.id, input.advisoryRecordId, {
        derivedFromNote: "Temporal card used disposed advisory material",
        citationNote: "Disposed Temporal advisory artifact consulted"
      });
    }
    world.updateFlowInstance(input.flowId, { currentStep: stepWithReport(report.id, "card") });
    return { card, closeReadiness: closeReadiness(world, input.flowId), readSideTrail: readSideTrail(world, input.flowId) };
  });
};

export const proposeFactFromTemporalRun = (
  world: WorldFile,
  input: { flowId: number; sourceStep: string; title: string; body: string; truthLayer?: string; advisoryRecordId?: number }
): { record: RecordRow; queue: AdmissionQueueRow[] } => {
  const report = readReport(world, input.flowId);
  const source = sourceFromReport(report);
  requireCoverage(world, input.flowId);
  if (!input.title.trim() || !input.body.trim()) throw new Error("Temporal proposals require steward-authored title and body");
  const truthLayer = input.truthLayer?.trim() ?? "";
  if (!truthLayer) throw new Error("Temporal proposals require steward-authored truth layer");
  if (input.advisoryRecordId != null) assertAdvisoryDisposed(world, input.advisoryRecordId);
  return world.atomicWrite(() => {
    const intake = intakeProposedFact(world, {
      origin: "future-flow",
      candidate: {
        title: input.title,
        body: [`Temporal/Timeline step: ${input.sourceStep}`, input.body].join("\n"),
        truthLayer,
        canonStatus: "proposed"
      },
      sourceLinks: [
        { recordId: report.id, note: "Fact surfaced by Temporal/Timeline pass report" },
        ...sourceRecordIds(source).map((recordId) => ({ recordId, note: "Temporal/Timeline source material" }))
      ],
      recordSweepJurisdiction: true,
      provenanceFlowStep: `temporal:proposal:${input.sourceStep}`
    });
    world.createLinkIfMissing(report.id, intake.record.id, "covers", "Temporal/Timeline pass surfaced this Admission proposal");
    if (input.advisoryRecordId != null) {
      PromptOut.linkExplicitAdvisoryUse(world, intake.record.id, input.advisoryRecordId, {
        derivedFromNote: "Temporal proposal used disposed advisory material",
        citationNote: "Disposed Temporal advisory artifact consulted"
      });
    }
    world.updateFlowInstance(input.flowId, { currentStep: stepWithReport(report.id, `proposal:${input.sourceStep}`) });
    return intake;
  });
};

export const mintTemporalDebt = (
  world: WorldFile,
  input: { flowId: number; sourceStep: string; name: string; reason: string; advisoryRecordId?: number }
) => {
  const report = readReport(world, input.flowId);
  const source = sourceFromReport(report);
  requireCoverage(world, input.flowId);
  if (!input.name.trim()) throw new Error("Temporal canon debt requires a name");
  assertSubstance(input.reason, "Temporal canon debt");
  if (input.advisoryRecordId != null) assertAdvisoryDisposed(world, input.advisoryRecordId);
  return world.atomicWrite(() => {
    const debt = world.createCanonDebt({
      name: input.name,
      scope: `temporal-timeline:${input.sourceStep}`,
      assignee: "steward",
      body: [`Source step: ${input.sourceStep}`, `Reason: ${input.reason}`, `Source report: ${report.id}`].join("\n")
    });
    world.createLinkIfMissing(report.id, debt.id, "requires_follow_up", "Temporal/Timeline pass minted follow-up canon debt");
    for (const recordId of sourceRecordIds(source)) {
      world.createLinkIfMissing(debt.id, recordId, "derived_from", "Temporal debt preserves source provenance");
    }
    if (input.advisoryRecordId != null) {
      PromptOut.linkExplicitAdvisoryUse(world, debt.id, input.advisoryRecordId, {
        derivedFromNote: "Temporal debt used disposed advisory material",
        citationNote: "Disposed Temporal advisory artifact consulted"
      });
    }
    world.updateFlowInstance(input.flowId, { currentStep: stepWithReport(report.id, `debt:${input.sourceStep}`) });
    return { debt, closeReadiness: closeReadiness(world, input.flowId), readSideTrail: readSideTrail(world, input.flowId) };
  });
};

export const storeTemporalAdvisory = (
  world: WorldFile,
  input: { flowId: number; stepKey: string; mode?: "proposal" | "pressure"; activeSetRevision?: number | null; promptText: string; responseText: string }
) => {
  const report = readReport(world, input.flowId);
  return world.atomicWrite(() => {
    const record = PromptOut.storeAdvisoryResponse(world, { flowKey: FLOW_KEY, flowId: input.flowId, stepKey: input.stepKey, mode: input.mode, activeSetRevision: input.activeSetRevision, promptText: input.promptText, responseText: input.responseText });
    world.createLinkIfMissing(report.id, record.id, "cites_advisory_artifact", "Temporal/Timeline pass stores this advisory artifact");
    world.createLinkIfMissing(record.id, report.id, "derived_from", "Temporal advisory artifact belongs to this pass report");
    world.updateFlowInstance(input.flowId, { currentStep: stepWithReport(report.id, `advisory:${input.stepKey}`) });
    return { record, closeReadiness: closeReadiness(world, input.flowId), readSideTrail: readSideTrail(world, input.flowId) };
  });
};

export const skipTemporalStep = (
  world: WorldFile,
  input: { flowId: number; stepKey: string; admissionLevel?: string; workScale?: string; reason?: string; unresolved?: boolean; debtName?: string; existingDebtRecordId?: number }
) => {
  const report = readReport(world, input.flowId);
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
        if (debt.recordTypeKey !== "canon_debt") throw new Error("unresolved Temporal skip follow-up must be canon debt");
      } else {
        if (!input.debtName?.trim()) throw new Error("unresolved Temporal skips require a follow-up debt name");
        debt = world.createCanonDebt({
          name: input.debtName,
          scope: `temporal-timeline:${input.stepKey}`,
          assignee: "steward",
          body: input.reason ?? `Skipped Temporal step ${input.stepKey}`
        });
      }
      world.createLinkIfMissing(report.id, debt.id, "requires_follow_up", "Temporal skip left unresolved work");
    }
    world.createLinkIfMissing(report.id, record.id, "covers", "Temporal/Timeline pass records this governed skip");
    world.createLinkIfMissing(record.id, report.id, "derived_from", "Temporal skip belongs to this pass report");
    world.updateFlowInstance(input.flowId, { currentStep: stepWithReport(report.id, `skip:${input.stepKey}`) });
    return { record, debt, closeReadiness: closeReadiness(world, input.flowId), readSideTrail: readSideTrail(world, input.flowId) };
  });
};

const recordList = (world: WorldFile, reportId: number, recordType: string, linkType: string) =>
  linkedRecords(world, reportId, recordType, linkType).map((record) => `- ${record.shortId} ${record.title}`).join("\n") || "None recorded.";

export const closeTemporalRun = (world: WorldFile, flowId: number) => {
  const flow = readFlow(world, flowId);
  if (String(flow.state) === "complete") throw new Error("Temporal run is already closed");
  const readiness = closeReadiness(world, flowId);
  if (readiness.blockers.length) {
    throw new Error(`Temporal close blocked: ${readiness.blockers.map((blocker) => blocker.label).join(", ")}`);
  }
  return world.atomicWrite(() => {
    const report = readReport(world, flowId);
    const source = sourceFromReport(report);
    const coverage = requireCoverage(world, flowId);
    const existingHeadings = new Set(world.listSections(report.id).map((section) => section.heading));
    const inserts = [
      {
        heading: "Source and run",
        body: [`Flow key: ${FLOW_KEY}`, `Flow id: ${flowId}`, `Source: ${source.sourceSummary}`, `Source type: ${source.sourceType}`, `Audited subject: ${source.auditedSubject}`, `Trigger recommendation: ${DOCTRINE.triggerRecommendation}`].join("\n"),
        position: 1
      },
      {
        heading: "Linked cards",
        body: recordList(world, report.id, "temporal_timeline", "covers"),
        position: 3
      },
      {
        heading: "Admission proposals",
        body: recordList(world, report.id, "canon_fact", "covers"),
        position: 4
      },
      {
        heading: "Canon debt",
        body: recordList(world, report.id, "canon_debt", "requires_follow_up"),
        position: 5
      },
      {
        heading: "Prompt-out and skips",
        body: [
          recordList(world, report.id, "advisory_artifact", "cites_advisory_artifact"),
          recordList(world, report.id, "skip_record", "covers"),
          `Follow-up debt:\n${recordList(world, report.id, "canon_debt", "requires_follow_up")}`
        ].join("\n\n"),
        position: 6
      },
      {
        heading: "Close readiness",
        body: [
          "Temporal close blockers satisfied with steward-authored coverage.",
          `First true: ${coverage.firstTrueOrRelativeSequence}`,
          `Latency: ${coverage.latency}`,
          `Residue: ${coverage.residueByTimescale}`,
          "Temporal never admitted facts in-pass; generated facts remain proposed through Admission."
        ].join("\n"),
        position: 7
      }
    ].filter((section) => !existingHeadings.has(section.heading));
    if (inserts.length) world.replaceSections(report.id, inserts);
    const complete = world.updateFlowInstance(flowId, { state: "complete", currentStep: stepWithReport(report.id, "complete") });
    if (source.sourceRecordId != null) {
      coverMatchingConditionalPassObligation(world, {
        passKey: "temporal_timeline",
        sourceFactRecordId: source.sourceRecordId,
        coveringReportRecordId: report.id,
        flowStep: "temporal:complete"
      });
    }
    return { ...getTemporalRun(world, flowId), flow: complete, report: world.getRecord(report.id) };
  });
};
