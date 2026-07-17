import { intakeProposedFact } from "./admission-flow.js";
import { ADVISORY_OUTPUT_LABELS, promptMode, withPromptModeSummaries, type DecisionPointPromptMode, type DecisionPointSharedContract } from "./decision-point-contract.js";
import { methodCard, methodCardDoctrineSlots, methodCardsForFlow, methodCardSourceManifest } from "./method-cards.js";
import {
  bindConditionalPassFlow,
  conditionalPassBindingForFlow,
  coverMatchingConditionalPassObligation
} from "./conditional-pass-obligations.js";
import {
  requireResolvedSourceSelection,
  resolveGuidedFlowSourceSelection,
  type ResolveSourceSelectionInput
} from "./guided-flow-source-selection.js";
import * as PromptOut from "./prompt-out.js";
import * as TemporalStore from "./temporal-store.js";
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

const sourceFromRun = (run: TemporalStore.TemporalRunStoreRow) => ({
  flowId: run.flow_id,
  passReportRecordId: run.final_report_record_id ?? run.retained_prior_report_record_id,
  sourceType: run.source_type,
  sourceRecordId: run.source_record_id,
  materialTitle: run.material_title,
  materialBody: run.material_body,
  auditedSubject: run.audited_subject,
  sourceSummary: run.source_summary,
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

const reportForRun = (world: WorldFile, flowId: number): RecordRow | null => {
  const staged = TemporalStore.findRun(world, flowId);
  const reportId = staged?.final_report_record_id ?? null;
  return reportId == null ? null : world.getRecord(reportId);
};

const priorReportForRun = (world: WorldFile, flowId: number): RecordRow | null => {
  const reportId = TemporalStore.findRun(world, flowId)?.retained_prior_report_record_id ?? null;
  return reportId == null ? null : world.getRecord(reportId);
};

const ensureStagedRun = (world: WorldFile, flowId: number): void => {
  if (TemporalStore.findRun(world, flowId)) return;
  const flow = readFlow(world, flowId);
  const reportId = reportIdFromStep(String(flow.current_step));
  if (reportId == null) throw new Error(`Temporal run ${flowId} has neither staged state nor a legacy pass report`);
  const report = world.getRecord(reportId);
  if (report.recordTypeKey !== "pass_report") throw new Error("legacy Temporal migration requires a pass_report");
  const source = sourceFromReport(report);
  const coverage = coverageFromSections(world.listSections(report.id));
  world.atomicWrite(() => {
    TemporalStore.createRun(world, {
      flowId,
      sourceType: source.sourceType,
      sourceRecordId: source.sourceRecordId,
      materialTitle: source.materialTitle,
      materialBody: source.materialBody,
      auditedSubject: source.auditedSubject,
      sourceSummary: source.sourceSummary,
      retainedPriorReportRecordId: report.id
    });
    if (coverage) TemporalStore.insertFirstRevision(world, flowId, coverage, "temporal:migration:legacy-report");
    world.updateFlowInstance(flowId, { currentStep: "temporal:migrated-open-report" });
  });
};

const sourceForRun = (world: WorldFile, flowId: number) => {
  const staged = TemporalStore.findRun(world, flowId);
  return staged ? sourceFromRun(staged) : sourceFromReport(readReport(world, flowId));
};

const sourceSelectionForRun = (world: WorldFile, flowId: number) => {
  const source = sourceForRun(world, flowId);
  const binding = conditionalPassBindingForFlow(world, flowId);
  return resolveTemporalSourceSelection(world, {
    sourceType: source.sourceType,
    ...(source.sourceType === "material"
      ? { materialTitle: source.materialTitle, materialBody: source.materialBody }
      : { recordId: source.sourceRecordId ?? undefined }),
    ...(binding == null ? {} : {
      conditionalPassObligationId: binding.obligationId,
      propagationReportRecordId: binding.propagationReportRecordId
    })
  });
};

const coverageForRun = (world: WorldFile, flowId: number): TemporalCoverage | null => {
  const staged = TemporalStore.findRun(world, flowId);
  if (staged) return TemporalStore.activeRevision(world, flowId)?.values ?? null;
  return coverageFromSections(world.listSections(readReport(world, flowId).id));
};

const sourceRecordIds = (source: { sourceRecordId: number | null }): number[] =>
  source.sourceRecordId == null ? [] : [source.sourceRecordId];

const inProgressTemporalFlows = (world: WorldFile) =>
  world.db.prepare("SELECT * FROM flow_instances WHERE flow_key = ? AND state = 'in_progress' ORDER BY id DESC").all(FLOW_KEY) as Array<{ id: number; current_step: string }>;

const findRunForReport = (world: WorldFile, reportRecordId: number) =>
  TemporalStore.listOpenRuns(world).find((run) => run.retained_prior_report_record_id === reportRecordId || run.final_report_record_id === reportRecordId)?.flow_id
  ?? inProgressTemporalFlows(world).find((flow) => reportIdFromStep(String(flow.current_step)) === reportRecordId)?.id
  ?? null;

const storedRunForReport = (world: WorldFile, report: RecordRow) => {
  const flowId = findRunForReport(world, report.id);
  if (flowId == null) return null;
  return { flowId, sourceRecordId: sourceForRun(world, flowId).sourceRecordId };
};

const conditionalPassBindingForFact = (world: WorldFile, fact: RecordRow) => {
  const flowId = findExistingRun(world, sourceSummaryFor(world, { sourceType: "fact", recordId: fact.id }));
  if (flowId == null) return null;
  return conditionalPassBindingForFlow(world, flowId);
};

export const resolveTemporalSourceSelection = (world: WorldFile, input: ResolveSourceSelectionInput) =>
  resolveGuidedFlowSourceSelection(world, "temporal_timeline", input, { storedRunForReport, conditionalPassBindingForFact });

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
  const matchesStableSource = (candidate: {
    source_type: string;
    source_record_id: number | null;
    material_title: string;
    material_body: string;
  }) => candidate.source_type === source.sourceType
    && (source.sourceRecordId == null
      ? candidate.source_record_id == null
        && candidate.material_title === source.materialTitle
        && candidate.material_body === source.materialBody
      : candidate.source_record_id === source.sourceRecordId);
  for (const run of TemporalStore.listOpenRuns(world)) {
    if (matchesStableSource(run)) return run.flow_id;
  }
  for (const flow of inProgressTemporalFlows(world)) {
    if (TemporalStore.findRun(world, Number(flow.id))) continue;
    const reportId = reportIdFromStep(String(flow.current_step));
    if (reportId == null) continue;
    const current = sourceFromReport(world.getRecord(reportId));
    if (matchesStableSource({
      source_type: current.sourceType,
      source_record_id: current.sourceRecordId,
      material_title: current.materialTitle,
      material_body: current.materialBody
    })) return Number(flow.id);
  }
  return null;
};

const closeReadiness = (world: WorldFile, flowId: number) => {
  const flow = readFlow(world, flowId);
  if (String(flow.state) === "complete") return { status: "closed", blockers: [] };
  const coverage = coverageForRun(world, flowId);
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
  const staged = TemporalStore.findRun(world, flowId);
  if (staged?.draft_state === "failed") {
    blockers.push({
      kind: "failed_revision_attempt",
      key: "failed_revision_attempt",
      label: "Failed revision attempt",
      message: "A failed revision attempt remains unsaved; save again or discard to the authoritative active revision before close.",
      classification: "unsaved_failed_revision"
    });
  }
  if (staged?.pressure_owed_revision != null) {
    blockers.push({
      kind: "pressure_currentness",
      key: "pressure_currentness",
      label: "Current Pressure or governed skip",
      message: "A material revision followed used Pressure; load current Pressure or record the governed Prompt-out skip before close.",
      classification: "stale_prompt_support"
    });
  }
  return { status: blockers.length ? "blocked" : "ready", blockers };
};

const reportRelationship = (world: WorldFile, flowId: number) => {
  const run = TemporalStore.getRun(world, flowId);
  return run.retained_prior_report_record_id == null
    ? { type: "final" as const, retainedPriorReportRecordId: null }
    : { type: "correction" as const, retainedPriorReportRecordId: run.retained_prior_report_record_id };
};

const revisionDecisionContract = (world: WorldFile, flowId: number) => {
  const state = TemporalStore.revisionState(world, flowId);
  return {
    name: "Temporal coverage revision and finalization",
    packageSources: [
      "docs/worldbuilding-system/03_truth_layers_and_canon_governance.md",
      "docs/worldbuilding-system/09_temporal_and_timeline_protocol.md",
      "docs/worldbuilding-system/20_ai_assisted_workflow.md"
    ],
    stagingDoctrine: "Open-run coverage is editable audit-safe staging; only successful close creates an append-only final or correction report.",
    draftState: {
      ...state.draftState,
      status: state.active == null && !state.draftState.failed ? "incomplete" : state.draftState.status,
      authoritativeRevisionId: state.active?.id ?? null,
      discardAction: { method: "POST", href: `/api/temporal/runs/${flowId}/recover` }
    },
    reviseAction: state.active == null ? null : { method: "POST", href: `/api/temporal/runs/${flowId}/revisions`, expectedRevisionId: state.active.id },
    reportRelationship: reportRelationship(world, flowId)
  };
};

export const previewTemporalClose = (world: WorldFile, flowId: number) => {
  ensureStagedRun(world, flowId);
  const source = sourceForRun(world, flowId);
  const state = TemporalStore.revisionState(world, flowId);
  return {
    decisionContract: revisionDecisionContract(world, flowId),
    activeRevision: state.active,
    revisionAudit: state.lineage,
    activeSet: state.activeSet,
    outcomes: TemporalStore.listOutcomes(world, flowId).map((outcome) => {
      const record = world.getRecord(outcome.record_id);
      return { kind: outcome.kind, recordId: record.id, shortId: record.shortId, title: record.title, linkTypeKey: outcome.link_type_key, note: outcome.note };
    }),
    reportRelationship: reportRelationship(world, flowId),
    closeReadiness: closeReadiness(world, flowId),
    writeIntent: {
      willWrite: ["one append-only final or correction pass_report", "only the active ten-lens revision", "the retained revision audit"],
      willLink: ["derived_from source", "explicit Temporal outcomes", "supersedes retained prior report when migrated"],
      willLeaveUntouched: ["source fact text and standing", "source Propagation report", "sibling conditional-pass obligations", "Admission contents", "existing canon debt", "advisory artifacts", "unrelated records, links, and flows"]
    },
    orientation: {
      current: `Temporal run ${flowId} active revision ${state.active?.id ?? "none"}`,
      next: closeReadiness(world, flowId).status === "ready" ? "Finalize the active revision" : "Resolve the returned blockers",
      resume: `Resume Temporal run ${flowId} for ${source.sourceSummary}`
    }
  };
};

export const recoverTemporalRun = (world: WorldFile, flowId: number) => {
  TemporalStore.clearFailedAttempt(world, flowId);
  const current = getTemporalRun(world, flowId);
  const active = TemporalStore.activeRevision(world, flowId);
  return {
    ...current,
    recovery: { discardedAttemptedDraft: true, authoritativeRevisionId: active?.id ?? null }
  };
};

const promptOutState = (world: WorldFile, flowId: number) => {
  const source = sourceForRun(world, flowId);
  const coverage = coverageForRun(world, flowId);
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
  const source = sourceForRun(world, flowId);
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
  const source = sourceForRun(world, flowId);
  const report = reportForRun(world, flowId);
  const priorReport = priorReportForRun(world, flowId);
  const trail: Array<{ label: string; href: string; recordId?: number }> = [
    ...(report == null ? [] : [{ label: priorReport == null ? "Final current Temporal report" : "Corrected current Temporal report", recordId: report.id, href: `/api/canon-workbench/records/${report.id}` }]),
    ...(priorReport == null ? [] : [{ label: "Retained prior Temporal report", recordId: priorReport.id, href: `/api/canon-workbench/records/${priorReport.id}` }]),
    ...sourceRecordIds(source).map((recordId) => ({ label: "Source record", recordId, href: `/api/canon-workbench/records/${recordId}` })),
    { label: "Audit Trail", href: "/api/canon-workbench/audit" },
    { label: "Current Canon", href: "/api/canon-workbench/current" }
  ];
  for (const outcome of TemporalStore.listOutcomes(world, flowId)) {
    const target = world.getRecord(outcome.record_id);
    if (target.recordTypeKey === "temporal_timeline") trail.push({ label: "Temporal timeline card", recordId: target.id, href: `/api/canon-workbench/records/${target.id}` });
    if (target.recordTypeKey === "canon_fact") trail.push({ label: "Admission proposal", recordId: target.id, href: `/api/canon-workbench/records/${target.id}` });
    if (target.recordTypeKey === "canon_debt") trail.push({ label: "Canon debt", recordId: target.id, href: `/api/canon-workbench/records/${target.id}` });
    if (target.recordTypeKey === "skip_record") trail.push({ label: "Skip record", recordId: target.id, href: `/api/canon-workbench/records/${target.id}` });
    if (target.recordTypeKey === "advisory_artifact") trail.push({ label: "Advisory artifact", recordId: target.id, href: `/api/canon-workbench/records/${target.id}` });
  }
  const uniqueTrail = () => [...new Map(trail.map((item) => [`${item.label}:${item.href}`, item])).values()];
  if (report == null) return uniqueTrail();
  for (const link of world.listLinks(report.id)) {
    if (link.fromRecordId !== report.id) continue;
    const target = world.getRecord(link.toRecordId);
    if (target.recordTypeKey === "temporal_timeline") trail.push({ label: "Temporal timeline card", recordId: target.id, href: `/api/canon-workbench/records/${target.id}` });
    if (target.recordTypeKey === "canon_fact" && link.linkTypeKey === "covers") trail.push({ label: "Admission proposal", recordId: target.id, href: `/api/canon-workbench/records/${target.id}` });
    if (target.recordTypeKey === "canon_debt") trail.push({ label: "Canon debt", recordId: target.id, href: `/api/canon-workbench/records/${target.id}` });
    if (target.recordTypeKey === "skip_record") trail.push({ label: "Skip record", recordId: target.id, href: `/api/canon-workbench/records/${target.id}` });
    if (target.recordTypeKey === "advisory_artifact") trail.push({ label: "Advisory artifact", recordId: target.id, href: `/api/canon-workbench/records/${target.id}` });
  }
  return uniqueTrail();
};

const temporalDecisionPoint = (world: WorldFile, flowId: number): { sharedContract: DecisionPointSharedContract } => {
  const flow = readFlow(world, flowId);
  const report = reportForRun(world, flowId);
  const source = sourceForRun(world, flowId);
  const stepKey = String(flow.current_step).replace(/^temporal:report:\d+:/, "temporal:");
  const cardValue = temporalMethodCardForStep(stepKey);
  const readiness = closeReadiness(world, flowId);
  const promptOut = promptOutState(world, flowId);
  const coverage = coverageForRun(world, flowId);
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
          ...(report == null ? ["Pass report: not created until successful close"] : [`Pass report: ${report.id}`]),
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

const stagedRecords = (world: WorldFile, flowId: number, recordType: string, linkType?: string) =>
  TemporalStore.listOutcomes(world, flowId)
    .filter((outcome) => linkType == null || outcome.link_type_key === linkType)
    .map((outcome) => world.getRecord(outcome.record_id))
    .filter((record) => record.recordTypeKey === recordType);

const sections = (world: WorldFile, flowId: number) => world.listSections(readReport(world, flowId).id);

export type StartTemporalRunInput =
  | {
      sourceType: "fact";
      recordId: number;
      auditedSubject?: string;
      conditionalPassObligationId?: number;
      propagationReportRecordId?: number;
    }
  | { sourceType: "capability" | "canon_debt"; recordId: number; auditedSubject?: string }
  | { sourceType: "material"; materialTitle: string; materialBody: string; auditedSubject?: string }
  | { sourceType: "pass_report"; reportRecordId: number };

export interface SaveTemporalCoverageInput extends TemporalCoverage {
  flowId: number;
}

export interface ReviseTemporalCoverageInput extends TemporalCoverage {
  flowId: number;
  expectedRevisionId: number;
  reason: string;
}

export const getTemporalRun = (world: WorldFile, flowId: number) => {
  ensureStagedRun(world, flowId);
  const flow = readFlow(world, flowId);
  const report = reportForRun(world, flowId);
  const priorReport = priorReportForRun(world, flowId);
  const source = sourceForRun(world, flowId);
  const currentSections = report == null ? [] : world.listSections(report.id);
  const coverage = coverageForRun(world, flowId);
  const revisionState = TemporalStore.findRun(world, flowId) ? TemporalStore.revisionState(world, flowId) : null;
  return {
    flow,
    report,
    priorReport,
    source,
    doctrine: DOCTRINE,
    methodCards: methodCardsForFlow(FLOW_KEY),
    coverage,
    sections: currentSections,
    revisionState,
    cards: stagedRecords(world, flowId, "temporal_timeline", "covers").map((card) => ({ card })),
    proposals: stagedRecords(world, flowId, "canon_fact", "covers").map((record) => ({ record })),
    debt: stagedRecords(world, flowId, "canon_debt", "requires_follow_up").map((record) => ({ record })),
    advisories: stagedRecords(world, flowId, "advisory_artifact", "cites_advisory_artifact").map((record) => ({ record })),
    skips: stagedRecords(world, flowId, "skip_record", "covers").map((record) => ({ record })),
    closeReadiness: closeReadiness(world, flowId),
    closePreview: previewTemporalClose(world, flowId),
    conditionalPassBinding: conditionalPassBindingForFlow(world, flowId),
    revisionContract: revisionDecisionContract(world, flowId),
    reportRelationship: reportRelationship(world, flowId),
    sourceSelection: sourceSelectionForRun(world, flowId),
    promptOut: promptOutState(world, flowId),
    readSideTrail: readSideTrail(world, flowId),
    decisionPoint: temporalDecisionPoint(world, flowId)
  };
};

export const startTemporalRun = (world: WorldFile, input: StartTemporalRunInput) => {
  const approvedSelection = requireResolvedSourceSelection(
    resolveTemporalSourceSelection(world, input)
  );
  if (input.sourceType === "pass_report") {
    const flowId = findRunForReport(world, input.reportRecordId);
    if (flowId == null) throw new Error("Temporal pass report is not owned by an in-progress run");
    return { ...getTemporalRun(world, flowId), sourceSelection: approvedSelection };
  }

  const source = sourceSummaryFor(world, input);
  const existingFlowId = findExistingRun(world, source);
  if (existingFlowId != null) {
    if (input.sourceType === "fact" && input.conditionalPassObligationId != null) {
      bindConditionalPassFlow(world, {
        flowId: existingFlowId,
        obligationId: input.conditionalPassObligationId,
        passKey: "temporal_timeline",
        sourceFactRecordId: input.recordId,
        propagationReportRecordId: input.propagationReportRecordId
      });
    }
    return getTemporalRun(world, existingFlowId);
  }

  return world.atomicWrite(() => {
    const flow = world.createFlowInstance({ flowKey: FLOW_KEY, currentStep: "temporal:entry" });
    TemporalStore.createRun(world, {
      flowId: Number(flow.id),
      sourceType: source.sourceType,
      sourceRecordId: source.sourceRecordId,
      materialTitle: source.materialTitle,
      materialBody: source.materialBody,
      auditedSubject: source.auditedSubject,
      sourceSummary: source.sourceSummary
    });
    if (input.sourceType === "fact" && input.conditionalPassObligationId != null) {
      bindConditionalPassFlow(world, {
        flowId: Number(flow.id),
        obligationId: input.conditionalPassObligationId,
        passKey: "temporal_timeline",
        sourceFactRecordId: input.recordId,
        propagationReportRecordId: input.propagationReportRecordId
      });
    }
    return getTemporalRun(world, Number(flow.id));
  });
};

const coverageFromInput = (input: SaveTemporalCoverageInput | ReviseTemporalCoverageInput): TemporalCoverage => ({
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
});

export const saveTemporalCoverage = (world: WorldFile, input: SaveTemporalCoverageInput) => {
  const flow = readFlow(world, input.flowId);
  const coverage = coverageFromInput(input);
  assertCoverageSubstance(coverage);
  if (TemporalStore.activeRevision(world, input.flowId)) throw new Error("Temporal material replacement requires the explicit revision action and a steward reason");
  return world.atomicWrite(() => {
    TemporalStore.insertFirstRevision(world, input.flowId, coverage);
    world.updateFlowInstance(Number(flow.id), { currentStep: "temporal:coverage" });
    return { coverage, revisionState: TemporalStore.revisionState(world, input.flowId), closeReadiness: closeReadiness(world, input.flowId), promptOut: promptOutState(world, input.flowId), decisionPoint: temporalDecisionPoint(world, input.flowId) };
  });
};

export const reviseTemporalCoverage = (world: WorldFile, input: ReviseTemporalCoverageInput) => {
  const values = coverageFromInput(input);
  const attemptedInput = { ...values, expectedRevisionId: input.expectedRevisionId, reason: input.reason };
  try {
    assertCoverageSubstance(values);
    return world.atomicWrite(() => {
      TemporalStore.replaceActiveRevision(world, {
        flowId: input.flowId,
        expectedRevisionId: input.expectedRevisionId,
        reason: input.reason,
        values
      });
      world.updateFlowInstance(input.flowId, { currentStep: "temporal:coverage:revision" });
      return {
        revisionState: TemporalStore.revisionState(world, input.flowId),
        closeReadiness: closeReadiness(world, input.flowId),
        promptOut: promptOutState(world, input.flowId),
        decisionPoint: temporalDecisionPoint(world, input.flowId)
      };
    });
  } catch (cause) {
    const error = cause instanceof Error ? cause : new Error(String(cause));
    const enriched = error as Error & { attemptedInput: unknown; authoritativeState: unknown; remediation: string };
    const remediation = "Preserve the attempted lenses, provide a steward-authored reason, then save again or discard to the authoritative active revision.";
    TemporalStore.recordFailedAttempt(world, input.flowId, { attemptedInput, error: error.message, remediation });
    enriched.attemptedInput = attemptedInput;
    enriched.authoritativeState = { ...TemporalStore.revisionState(world, input.flowId), closeReadiness: closeReadiness(world, input.flowId) };
    enriched.remediation = remediation;
    throw enriched;
  }
};

const requireCoverage = (world: WorldFile, flowId: number): TemporalCoverage => {
  const coverage = coverageForRun(world, flowId);
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
  const source = sourceForRun(world, input.flowId);
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
    TemporalStore.addOutcome(world, { flowId: input.flowId, recordId: card.id, linkTypeKey: "covers", note: input.relation || "Temporal/Timeline pass records this timeline card", kind: "temporal_timeline" });
    for (const recordId of sourceRecordIds(source)) {
      world.createLinkIfMissing(card.id, recordId, "temporal_depends_on", "Temporal card preserves source timing provenance");
    }
    if (input.advisoryRecordId != null) {
      PromptOut.linkExplicitAdvisoryUse(world, card.id, input.advisoryRecordId, {
        derivedFromNote: "Temporal card used disposed advisory material",
        citationNote: "Disposed Temporal advisory artifact consulted"
      });
    }
    world.updateFlowInstance(input.flowId, { currentStep: "temporal:card" });
    return { card, closeReadiness: closeReadiness(world, input.flowId), readSideTrail: readSideTrail(world, input.flowId) };
  });
};

export const proposeFactFromTemporalRun = (
  world: WorldFile,
  input: { flowId: number; sourceStep: string; title: string; body: string; truthLayer?: string; advisoryRecordId?: number }
): { record: RecordRow; queue: AdmissionQueueRow[] } => {
  const source = sourceForRun(world, input.flowId);
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
        ...sourceRecordIds(source).map((recordId) => ({ recordId, note: "Temporal/Timeline source material" }))
      ],
      recordSweepJurisdiction: true,
      provenanceFlowStep: `temporal:proposal:${input.sourceStep}`
    });
    TemporalStore.addOutcome(world, { flowId: input.flowId, recordId: intake.record.id, linkTypeKey: "covers", note: "Temporal/Timeline pass surfaced this Admission proposal", kind: "canon_fact" });
    if (input.advisoryRecordId != null) {
      PromptOut.linkExplicitAdvisoryUse(world, intake.record.id, input.advisoryRecordId, {
        derivedFromNote: "Temporal proposal used disposed advisory material",
        citationNote: "Disposed Temporal advisory artifact consulted"
      });
    }
    world.updateFlowInstance(input.flowId, { currentStep: `temporal:proposal:${input.sourceStep}` });
    return intake;
  });
};

export const mintTemporalDebt = (
  world: WorldFile,
  input: { flowId: number; sourceStep: string; name: string; reason: string; advisoryRecordId?: number }
) => {
  const source = sourceForRun(world, input.flowId);
  requireCoverage(world, input.flowId);
  if (!input.name.trim()) throw new Error("Temporal canon debt requires a name");
  assertSubstance(input.reason, "Temporal canon debt");
  if (input.advisoryRecordId != null) assertAdvisoryDisposed(world, input.advisoryRecordId);
  return world.atomicWrite(() => {
    const debt = world.createCanonDebt({
      name: input.name,
      scope: `temporal-timeline:${input.sourceStep}`,
      assignee: "steward",
          body: [`Source step: ${input.sourceStep}`, `Reason: ${input.reason}`, `Source Temporal run: ${input.flowId}`].join("\n")
        });
    TemporalStore.addOutcome(world, { flowId: input.flowId, recordId: debt.id, linkTypeKey: "requires_follow_up", note: "Temporal/Timeline pass minted follow-up canon debt", kind: "canon_debt" });
    for (const recordId of sourceRecordIds(source)) {
      world.createLinkIfMissing(debt.id, recordId, "derived_from", "Temporal debt preserves source provenance");
    }
    if (input.advisoryRecordId != null) {
      PromptOut.linkExplicitAdvisoryUse(world, debt.id, input.advisoryRecordId, {
        derivedFromNote: "Temporal debt used disposed advisory material",
        citationNote: "Disposed Temporal advisory artifact consulted"
      });
    }
    world.updateFlowInstance(input.flowId, { currentStep: `temporal:debt:${input.sourceStep}` });
    return { debt, closeReadiness: closeReadiness(world, input.flowId), readSideTrail: readSideTrail(world, input.flowId) };
  });
};

export const storeTemporalAdvisory = (
  world: WorldFile,
  input: { flowId: number; stepKey: string; mode?: "proposal" | "pressure"; activeSetRevision?: number | null; promptText: string; responseText: string }
) => {
  return world.atomicWrite(() => {
    const record = PromptOut.storeAdvisoryResponse(world, { flowKey: FLOW_KEY, flowId: input.flowId, stepKey: input.stepKey, mode: input.mode, activeSetRevision: input.activeSetRevision, promptText: input.promptText, responseText: input.responseText });
    TemporalStore.addOutcome(world, { flowId: input.flowId, recordId: record.id, linkTypeKey: "cites_advisory_artifact", note: "Temporal/Timeline pass stores this advisory artifact", kind: "advisory_artifact" });
    if (input.mode === "pressure") TemporalStore.markPressureUsed(world, input.flowId);
    world.updateFlowInstance(input.flowId, { currentStep: `temporal:advisory:${input.stepKey}` });
    return { record, closeReadiness: closeReadiness(world, input.flowId), readSideTrail: readSideTrail(world, input.flowId) };
  });
};

export const skipTemporalStep = (
  world: WorldFile,
  input: { flowId: number; stepKey: string; mode?: "proposal" | "pressure"; admissionLevel?: string; workScale?: string; reason?: string; unresolved?: boolean; debtName?: string; existingDebtRecordId?: number }
) => {
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
      TemporalStore.addOutcome(world, { flowId: input.flowId, recordId: debt.id, linkTypeKey: "requires_follow_up", note: "Temporal skip left unresolved work", kind: "canon_debt" });
    }
    TemporalStore.addOutcome(world, { flowId: input.flowId, recordId: record.id, linkTypeKey: "covers", note: "Temporal/Timeline pass records this governed skip", kind: "skip_record" });
    if (input.mode === "pressure") TemporalStore.markPressureSkipped(world, input.flowId);
    world.updateFlowInstance(input.flowId, { currentStep: `temporal:skip:${input.stepKey}` });
    return { record, debt, revisionState: TemporalStore.revisionState(world, input.flowId), closeReadiness: closeReadiness(world, input.flowId), readSideTrail: readSideTrail(world, input.flowId) };
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
    const source = sourceForRun(world, flowId);
    const conditionalPassBinding = conditionalPassBindingForFlow(world, flowId);
    const coverage = requireCoverage(world, flowId);
    const staged = TemporalStore.getRun(world, flowId);
    const lineage = TemporalStore.listRevisions(world, flowId);
    const active = TemporalStore.activeRevision(world, flowId)!;
    const priorReport = priorReportForRun(world, flowId);
    const revisionAudit = lineage.map((revision) => [
      `Revision ${revision.id} lineage ${revision.lineageId} v${revision.version} ${revision.lifecycleState}`,
      `Reason: ${revision.revisionReason ?? "none - restored or first staged revision"}`,
      `Created by ${revision.provenance.actor} at ${revision.provenance.timestamp} in ${revision.provenance.flowStep}`,
      revision.retirementProvenance == null
        ? "Retirement: active at finalization"
        : `Retired by ${revision.retirementProvenance.actor} at ${revision.retirementProvenance.timestamp} in ${revision.retirementProvenance.flowStep}`,
      coverageBody(revision.values)
    ].join("\n")).join("\n\n");
    const report = world.createRecord({
      recordTypeKey: "pass_report",
      title: `${priorReport == null ? "Temporal/Timeline pass" : "Temporal/Timeline correction"}: ${source.sourceSummary}`,
      body: [
        `Flow key: ${FLOW_KEY}`,
        `Flow id: ${flowId}`,
        "Status: complete",
        `Decision contract: Temporal coverage revision and finalization`,
        `Source type: ${source.sourceType}`,
        `Source record id: ${source.sourceRecordId ?? ""}`,
        `Material title: ${source.materialTitle}`,
        `Material body: ${source.materialBody}`,
        `Audited subject: ${source.auditedSubject}`,
        `Source summary: ${source.sourceSummary}`,
        `Active revision id: ${active.id}`,
        `Active-set identity: temporal:${flowId}:${staged.active_set_revision}:${active.id}`,
        `Report relationship: ${priorReport == null ? "final report" : `correction supersedes report ${priorReport.id}`}`,
        "",
        "Active coverage",
        coverageBody(coverage),
        "",
        "Revision audit",
        revisionAudit,
        "",
        "Untouched state",
        "Source fact text and standing, source Propagation report, sibling obligations, Admission contents, existing canon debt, advisory artifacts, unrelated records, links, and flows remain unchanged except for explicit Temporal outcomes and approved report links."
      ].join("\n"),
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    });
    if (source.sourceRecordId != null) world.createLinkIfMissing(report.id, source.sourceRecordId, "derived_from", "Temporal/Timeline final report audits this source");
    if (priorReport != null) world.createLinkIfMissing(report.id, priorReport.id, "supersedes", "Temporal correction report supersedes the retained immutable prior report");
    for (const outcome of TemporalStore.listOutcomes(world, flowId)) {
      world.createLinkIfMissing(report.id, outcome.record_id, outcome.link_type_key, outcome.note);
    }
    world.replaceSections(report.id, [
      { heading: "Source and run", body: [`Flow key: ${FLOW_KEY}`, `Flow id: ${flowId}`, `Source: ${source.sourceSummary}`, `Source type: ${source.sourceType}`, `Audited subject: ${source.auditedSubject}`].join("\n"), position: 1 },
      { heading: "Coverage lenses", body: coverageBody(coverage), position: 2 },
      { heading: "Linked cards", body: recordList(world, report.id, "temporal_timeline", "covers"), position: 3 },
      { heading: "Admission proposals", body: recordList(world, report.id, "canon_fact", "covers"), position: 4 },
      { heading: "Canon debt", body: recordList(world, report.id, "canon_debt", "requires_follow_up"), position: 5 },
      { heading: "Prompt-out and skips", body: [recordList(world, report.id, "advisory_artifact", "cites_advisory_artifact"), recordList(world, report.id, "skip_record", "covers"), `Follow-up debt:\n${recordList(world, report.id, "canon_debt", "requires_follow_up")}`].join("\n\n"), position: 6 },
      { heading: "Close readiness", body: ["Temporal close blockers satisfied with steward-authored active coverage.", `Active revision: ${active.id}`, `First true: ${coverage.firstTrueOrRelativeSequence}`, `Latency: ${coverage.latency}`, `Residue: ${coverage.residueByTimescale}`].join("\n"), position: 7 }
    ]);
    TemporalStore.finalizeRun(world, flowId, report.id);
    const complete = world.updateFlowInstance(flowId, { state: "complete", currentStep: stepWithReport(report.id, "complete") });
    if (source.sourceRecordId != null) {
      coverMatchingConditionalPassObligation(world, {
        passKey: "temporal_timeline",
        sourceFactRecordId: source.sourceRecordId,
        obligationId: conditionalPassBinding?.obligationId,
        propagationReportRecordId: conditionalPassBinding?.propagationReportRecordId,
        coveringReportRecordId: report.id,
        flowStep: "temporal:complete"
      });
    }
    return {
      ...getTemporalRun(world, flowId),
      flow: complete,
      report: world.getRecord(report.id),
      priorReport,
      reportRelationship: priorReport == null
        ? { type: "final" as const, supersedesReportRecordId: null }
        : { type: "correction" as const, supersedesReportRecordId: priorReport.id }
    };
  });
};
