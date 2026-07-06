import { intakeProposedFact } from "./admission-flow.js";
import { ADVISORY_OUTPUT_LABELS, promptMode, withPromptModeSummaries, type DecisionPointPromptMode, type DecisionPointSharedContract } from "./decision-point-contract.js";
import { methodCard, methodCardDoctrineSlots, methodCardSourceManifest, methodCardsForFlow } from "./method-cards.js";
import * as MinimalViableWorld from "./minimal-viable-world.js";
import * as PromptOut from "./prompt-out.js";
import { requiresSkipReason } from "./severity-policy.js";
import {
  QA_MODE_BENCHMARKS,
  QA_RED_FLAGS,
  QA_REPAIR_LOOP,
  QA_SCORE_GUIDANCE
} from "./qa-catalog.js";
import type { AdmissionQueueRow, QaScoreRow, RecordRow, WorldFile } from "./world-file.js";

export type QaSubjectType = "record" | "world";
export type QaScoreValue = "0" | "1" | "2" | "3" | "na";
export type QaBandColor = "unscored" | "green" | "yellow" | "red";

export interface QaBand {
  color: QaBandColor;
  persisted: false;
  reason: string;
}

export interface QaFloorConditions {
  repeatableHighImpactCapability: boolean;
  lacksAccessLimits: boolean;
  lacksCost: boolean;
  lacksCountermeasure: boolean;
  lacksActorAdaptation: boolean;
  lacksTemporalResidue: boolean;
  lacksDistributionPattern: boolean;
  lacksInstitutionOrModeEquivalent: boolean;
}

export interface QaProfileFields {
  strongestDomain: string;
  weakestDomain: string;
  mostDangerousUnderPropagatedFact: string;
  mostLikelyContradiction: string;
  mostFragileMystery: string;
  mostOverloadedConstraint: string;
  mostSuspiciousAbsentInstitutionResponse: string;
  mostAtRiskAestheticDrift: string;
  canonDebtBeforeFoundationalFacts: string;
}

type QaFlowRow = {
  id: number;
  state: string;
  current_step: string;
  qa_subject_record_id: number | null;
  qa_pass_record_id: number;
};

const FLOW_KEY = "qa";
const QA_PROTOCOL = "docs/worldbuilding-system/18_quality_assurance_tests.md";
const AI_WORKFLOW_PROTOCOL = "docs/worldbuilding-system/20_ai_assisted_workflow.md";
const PROMPT_TEMPLATE_KEY = "qa_red_team";

const PROFILE_FIELD_LABELS: Record<keyof QaProfileFields, string> = {
  strongestDomain: "strongest domain",
  weakestDomain: "weakest domain",
  mostDangerousUnderPropagatedFact: "most dangerous under-propagated fact",
  mostLikelyContradiction: "most likely contradiction",
  mostFragileMystery: "most fragile mystery",
  mostOverloadedConstraint: "most overloaded constraint",
  mostSuspiciousAbsentInstitutionResponse: "most suspicious absent institution/economy response",
  mostAtRiskAestheticDrift: "most at-risk aesthetic drift",
  canonDebtBeforeFoundationalFacts: "canon debt that must be resolved before new foundational facts"
};

const readQaFlow = (store: WorldFile, flowId: number): QaFlowRow => {
  const row = store.getFlowInstance(flowId, FLOW_KEY);
  if (row.qa_pass_record_id == null) throw new Error(`QA flow has no pass report: ${flowId}`);
  return {
    id: Number(row.id),
    state: String(row.state),
    current_step: String(row.current_step),
    qa_subject_record_id: row.qa_subject_record_id == null ? null : Number(row.qa_subject_record_id),
    qa_pass_record_id: Number(row.qa_pass_record_id)
  };
};

const subjectMode = (store: WorldFile, subjectRecordId: number | null): string | null => {
  if (subjectRecordId == null) return null;
  return store.listFacets(subjectRecordId).find((facet) => facet.vocabulary === "consequence_mode")?.term ?? null;
};

const qaMethodCardForStep = (stepKey: string) => {
  if (stepKey.includes("entry")) return methodCard("qa.entry");
  if (stepKey.includes("regression")) return methodCard("qa.regression-profile");
  if (stepKey.includes("floor")) return methodCard("qa.pass-fail-floor");
  if (stepKey.includes("repair") || stepKey.includes("skip")) return methodCard("qa.repair-routing");
  if (stepKey.includes("complete") || stepKey.includes("final")) return methodCard("qa.finalize");
  return methodCard("qa.scorecard");
};

const qaCloseBlockers = (store: WorldFile, flowId: number): DecisionPointSharedContract["blockers"] => {
  const scores = store.qaScores(flowId);
  const blockers: DecisionPointSharedContract["blockers"] = [];
  const unexplainedNa = scores.find((score) => score.score === "na" && !score.naReason.trim());
  if (unexplainedNa) {
    blockers.push({
      key: "na-reason",
      label: "N/A reason",
      message: `N/A reason required for QA test ${unexplainedNa.testNumber}.`,
      requires: "n/a reason"
    });
  }
  const missingRepair = scores.find((score) =>
    score.loadBearing
    && score.repairRouted
    && (score.score === "0" || score.score === "1")
    && !score.requiredRepair.trim()
  );
  if (missingRepair) {
    blockers.push({
      key: "required-repair",
      label: "Required repair",
      message: `Required repair substance missing for QA test ${missingRepair.testNumber}.`,
      requires: "repair substance"
    });
  }
  return blockers;
};

const qaPromptModes = (
  store: WorldFile,
  input: { flowId?: number; subjectRecordId: number | null; passRecordId?: number; stepKey: string }
): DecisionPointPromptMode[] => {
  const subject = input.subjectRecordId == null ? null : store.getRecord(input.subjectRecordId);
  const pass = input.passRecordId == null ? null : store.getRecord(input.passRecordId);
  const recordId = subject?.id ?? pass?.id;
  const hasMaterial = Boolean(subject?.body.trim() || pass?.body.trim());
  const commonBody = {
    flowKey: FLOW_KEY,
    flowId: input.flowId,
    recordId,
    templateKey: PROMPT_TEMPLATE_KEY,
    stepKey: input.stepKey
  };
  return withPromptModeSummaries([
    promptMode({
      mode: "proposal",
      label: "Proposal mode",
      available: true,
      blocker: null,
      framing: "Request labeled QA score, repair-route, and regression-profile candidates; adoption remains steward authorship.",
      role: "QA proposal",
      templateKey: PROMPT_TEMPLATE_KEY,
      stepKey: input.stepKey,
      outputLabels: ADVISORY_OUTPUT_LABELS,
      stepRequest: {
        method: "POST",
        href: "/api/prompt-out/steps",
        body: { ...commonBody, mode: "proposal", label: "Proposal mode" }
      }
    }),
    promptMode({
      mode: "pressure",
      label: "Pressure mode",
      available: hasMaterial,
      blocker: hasMaterial ? null : "Pressure prompts require a QA subject or pass record with steward-authored material.",
      framing: "Ask for weak scores, hidden contradictions, fragile mysteries, missing institutions, floor risks, and repair routing pressure.",
      role: "QA red team",
      templateKey: PROMPT_TEMPLATE_KEY,
      stepKey: input.stepKey,
      outputLabels: ADVISORY_OUTPUT_LABELS,
      stepRequest: hasMaterial
        ? {
            method: "POST",
            href: "/api/prompt-out/steps",
            body: { ...commonBody, mode: "pressure", label: "QA red team" }
          }
        : null
    })
  ]);
};

const qaDecisionPoint = (
  store: WorldFile,
  input: { flowId?: number; subjectRecordId: number | null; passRecordId?: number; stepKey: string; runState?: string; minimalViableWorldEcho?: ReturnType<typeof MinimalViableWorld.qaEcho> | null }
): { sharedContract: DecisionPointSharedContract } => {
  const subject = input.subjectRecordId == null ? null : store.getRecord(input.subjectRecordId);
  const pass = input.passRecordId == null ? null : store.getRecord(input.passRecordId);
  const cardValue = qaMethodCardForStep(input.stepKey);
  const blockers = input.flowId == null ? [] : qaCloseBlockers(store, input.flowId);
  return {
    sharedContract: {
      contractVersion: "decision-point/v1",
      methodCard: cardValue,
      flow: { key: FLOW_KEY, runState: input.runState ?? "not_started" },
      step: {
        key: input.stepKey,
        localDecision: cardValue.decision,
        packageSource: QA_PROTOCOL,
        why: "QA scores stability, names n/a and repair evidence, and routes repairs without changing canon standing directly."
      },
      obligations: {
        required: ["Score each applicable QA test", "Record n/a reasons", "Route required repairs when weak load-bearing scores are marked"],
        optional: ["Regression profile", "Pass/fail floor advisory", "Repair loop evidence"],
        skippable: ["Prompt-out advisory pressure can be declined with a skip_record"],
        severityDependent: ["Major floor overrides require a reason when the pass declares major-or-higher context"]
      },
      skipRule: {
        offered: true,
        reasonRequired: false,
        reasonThreshold: "major-or-higher QA work",
        recordType: "skip_record"
      },
      doctrine: {
        slots: methodCardDoctrineSlots(cardValue),
        packageSources: [QA_PROTOCOL, AI_WORKFLOW_PROTOCOL]
      },
      bearingContext: {
        displayed: [
          subject ? `Subject: ${subject.shortId} ${subject.title}` : "Subject: whole world",
          subject?.body ?? "",
          pass ? `QA scorecard: ${pass.shortId} ${pass.title}` : "",
          `Current step: ${input.stepKey}`,
          input.minimalViableWorldEcho
            ? `Minimal Viable World checkpoint: ${input.minimalViableWorldEcho.status}${input.minimalViableWorldEcho.report ? ` (${input.minimalViableWorldEcho.report.shortId})` : ""}`
            : "",
          `Subject mode: ${subjectMode(store, input.subjectRecordId) ?? "unset"}`
        ].filter(Boolean),
        sourceManifest: [
          ...(subject == null ? [] : [`Subject record: ${subject.shortId} ${subject.title}`]),
          ...(pass == null ? [] : [`QA scorecard: ${pass.shortId} ${pass.title}`]),
          ...(input.minimalViableWorldEcho?.report ? [`Minimal Viable World checkpoint report: ${input.minimalViableWorldEcho.report.shortId} ${input.minimalViableWorldEcho.report.title}`] : []),
          ...methodCardSourceManifest(cardValue)
        ],
        omissions: [
          "QA repair candidates remain routed outcomes until the steward admits or resolves them in the receiving flow.",
          "QA echoes Minimal Viable World state read-only and does not recompute checkpoint coverage."
        ]
      },
      promptOut: { serverOwned: true, modes: qaPromptModes(store, input) },
      blockers,
      substanceValidations: [
        "N/A scores require reasons before finalization.",
        "Weak load-bearing scores marked as repair-routed require repair substance."
      ],
      writeIntent: {
        willWrite: ["qa_scorecard/pass report sections, score rows, profile rows, floor advisory rows, repair rows, and skips when the steward acts"],
        willLink: ["assesses links, repair/debt links, and advisory links only after explicit steward use"],
        willQueue: ["fact-shaped QA repairs and canon debt only when explicitly routed"],
        willRouteOnward: ["fact-shaped repairs route to Admission as proposed", "canon-debt repairs route to open canon debt"],
        willLeaveUntouched: [
          "QA never changes canon standing directly",
          "subject records remain unchanged unless a later governed repair flow changes them",
          "QA echoes Minimal Viable World state read-only and does not write checkpoint records"
        ]
      },
      nextOrResumeState: {
        currentStep: input.stepKey,
        nextStep: blockers.length ? "clear QA finalization blockers" : "continue scoring, repair routing, or finalize",
        safeExit: "Return to the workflow map; this QA pass can be resumed from its scorecard."
      },
      readSideTrail: [
        ...(subject == null ? [] : [{ label: "Subject record", href: `/api/canon-workbench/records/${subject.id}`, recordId: subject.id }]),
        ...(pass == null ? [] : [{ label: "QA scorecard", href: `/api/canon-workbench/records/${pass.id}`, recordId: pass.id }]),
        { label: "Current Canon", href: "/api/canon-workbench/current" },
        { label: "Audit Trail", href: "/api/canon-workbench/audit" }
      ]
    }
  };
};

const scorecard = (
  store: WorldFile,
  subjectRecordId: number | null,
  stepKey = "qa:scorecard",
  context: { flowId?: number; passRecordId?: number; runState?: string } = {}
) => {
  const minimalViableWorldEcho = subjectRecordId == null ? MinimalViableWorld.qaEcho(store) : null;
  return {
    tests: store.qaTestCatalog(),
    subjectMode: subjectMode(store, subjectRecordId),
    methodCard: qaMethodCardForStep(stepKey),
    methodCards: methodCardsForFlow(FLOW_KEY),
    minimalViableWorldEcho,
    doctrine: {
      scoreGuidance: QA_SCORE_GUIDANCE,
      interpretation: {
        green: "mostly 2-3, no catastrophic 0 in a load-bearing area",
        yellow: "several 1s or one serious 0; usable with caution",
        red: "multiple load-bearing 0s or contradictions hidden by style"
      },
      modeBenchmarks: QA_MODE_BENCHMARKS,
      redFlags: QA_RED_FLAGS,
      repairLoop: QA_REPAIR_LOOP,
      source: QA_PROTOCOL
    },
    decisionPoint: qaDecisionPoint(store, {
      flowId: context.flowId,
      passRecordId: context.passRecordId,
      runState: context.runState,
      subjectRecordId,
      stepKey,
      minimalViableWorldEcho
    })
  };
};

export const derivedBand = (scores: QaScoreRow[]): QaBand => {
  const numeric = scores.filter((score) => score.score !== "na");
  if (!numeric.length) return { color: "unscored", persisted: false, reason: "No steward-entered scores yet." };
  const loadBearingZeroes = numeric.filter((score) => score.loadBearing && score.score === "0").length;
  if (loadBearingZeroes > 1) {
    return { color: "red", persisted: false, reason: "Multiple load-bearing 0 scores." };
  }
  if (numeric.some((score) => score.score === "0" || score.score === "1")) {
    return { color: "yellow", persisted: false, reason: "At least one serious 0 or weak 1 is present." };
  }
  return { color: "green", persisted: false, reason: "Entered scores are mostly 2-3 with no load-bearing 0." };
};

const floorTriggered = (conditions: QaFloorConditions): boolean =>
  conditions.repeatableHighImpactCapability
  && conditions.lacksAccessLimits
  && conditions.lacksCost
  && conditions.lacksCountermeasure
  && conditions.lacksActorAdaptation
  && conditions.lacksTemporalResidue
  && conditions.lacksDistributionPattern
  && conditions.lacksInstitutionOrModeEquivalent;

const profileBody = (fields: QaProfileFields): string =>
  (Object.keys(PROFILE_FIELD_LABELS) as Array<keyof QaProfileFields>)
    .map((key) => `${PROFILE_FIELD_LABELS[key]}: ${fields[key]}`)
    .join("\n");

export const startQaPass = (
  store: WorldFile,
  input: { subjectType: QaSubjectType; subjectRecordId?: number; title?: string }
): { flow: unknown; pass: RecordRow; scorecard: unknown; band: QaBand } => {
  const subjectRecordId = input.subjectType === "record" ? input.subjectRecordId ?? null : null;
  if (input.subjectType === "record" && subjectRecordId == null) throw new Error("record QA pass requires a subject record");
  const subject = subjectRecordId == null ? null : store.getRecord(subjectRecordId);

  return store.atomicWrite(() => {
    const pass = store.createRecord({
      recordTypeKey: "qa_pass",
      title: input.title?.trim() || (subject ? `QA pass: ${subject.shortId}` : "Whole-world QA pass"),
      body: [
        `Subject type: ${input.subjectType}`,
        subject ? `Subject: ${subject.shortId} ${subject.title}` : "Subject: whole world",
        "Append-only QA pass report. Scores, profile, floor verdicts, and repairs are child audit rows."
      ].join("\n"),
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    });
    store.replaceSections(pass.id, [
      { heading: "Subject and run", body: subject ? `Record: ${subject.shortId} ${subject.title}` : "Whole world", position: 1 },
      { heading: "Score summary", body: "No scores entered yet.", position: 2 },
      { heading: "Close audit", body: "Pass opened; not finalized.", position: 7 }
    ]);
    const flow = store.createFlowInstance({
      flowKey: FLOW_KEY,
      currentStep: "qa:entry",
      qaSubjectRecordId: subjectRecordId,
      qaPassRecordId: pass.id
    });
    if (subject != null) {
      store.createLink(pass.id, subject.id, "assesses", "QA pass assesses this record");
    }
    return {
      flow,
      pass,
      scorecard: scorecard(store, subjectRecordId, "qa:entry", { flowId: Number(flow.id), passRecordId: pass.id, runState: String(flow.state ?? "in_progress") }),
      band: derivedBand([])
    };
  });
};

export const getQaPass = (store: WorldFile, flowId: number): unknown => {
  const flow = readQaFlow(store, flowId);
  const pass = store.getRecord(flow.qa_pass_record_id);
  const scores = store.qaScores(flowId);
  return {
    flow,
    pass,
    subject: flow.qa_subject_record_id == null ? null : store.getRecord(flow.qa_subject_record_id),
    scorecard: scorecard(store, flow.qa_subject_record_id, flow.current_step, { flowId, passRecordId: flow.qa_pass_record_id, runState: flow.state }),
    scores,
    band: derivedBand(scores),
    profile: store.qaRegressionProfile(flowId),
    floor: store.qaFloorVerdict(flowId),
    repairs: store.qaRepairs(flowId)
  };
};

export const recordQaScore = (
  store: WorldFile,
  input: {
    flowId: number;
    testNumber: number;
    score: QaScoreValue;
    naReason?: string;
    notes?: string;
    requiredRepair?: string;
    loadBearing?: boolean;
    repairRouted?: boolean;
  }
): { score: QaScoreRow; scores: QaScoreRow[]; band: QaBand } => {
  const flow = readQaFlow(store, input.flowId);
  const score = store.upsertQaScore({
    flowId: input.flowId,
    qaPassRecordId: flow.qa_pass_record_id,
    testNumber: input.testNumber,
    score: input.score,
    naReason: input.naReason,
    notes: input.notes,
    requiredRepair: input.requiredRepair,
    loadBearing: input.loadBearing,
    repairRouted: input.repairRouted,
    flowStep: "qa:scorecard"
  });
  store.updateFlowInstance(input.flowId, { currentStep: `qa:score:${input.testNumber}` });
  const scores = store.qaScores(input.flowId);
  return { score, scores, band: derivedBand(scores) };
};

export const recordQaProfile = (
  store: WorldFile,
  input: { flowId: number; fields: QaProfileFields; recordLinkIds?: number[]; debtLinkIds?: number[] }
): { profile: unknown; pass: RecordRow } => {
  const flow = readQaFlow(store, input.flowId);
  for (const key of Object.keys(PROFILE_FIELD_LABELS) as Array<keyof QaProfileFields>) {
    if (!input.fields[key]?.trim()) throw new Error(`regression profile requires ${PROFILE_FIELD_LABELS[key]}`);
  }
  return store.atomicWrite(() => {
    const profile = store.upsertQaRegressionProfile({
      flowId: input.flowId,
      qaPassRecordId: flow.qa_pass_record_id,
      fields: input.fields,
      flowStep: "qa:regression-profile"
    });
    if (!store.listSections(flow.qa_pass_record_id).some((section) => section.heading === "Regression profile")) {
      store.replaceSections(flow.qa_pass_record_id, [{ heading: "Regression profile", body: profileBody(input.fields), position: 3 }]);
    }
    for (const recordId of input.recordLinkIds ?? []) {
      store.getRecord(recordId);
      store.createLinkIfMissing(flow.qa_pass_record_id, recordId, "derived_from", "QA regression profile names this record");
    }
    for (const debtId of input.debtLinkIds ?? []) {
      const debt = store.getRecord(debtId);
      if (debt.recordTypeKey !== "canon_debt") throw new Error("QA profile debt links must target canon debt");
      store.createLinkIfMissing(flow.qa_pass_record_id, debt.id, "requires_follow_up", "QA regression profile names blocking canon debt");
    }
    store.updateFlowInstance(input.flowId, { currentStep: "qa:regression-profile" });
    return { profile, pass: store.getRecord(flow.qa_pass_record_id) };
  });
};

export const recordQaFloor = (
  store: WorldFile,
  input: {
    flowId: number;
    conditions: QaFloorConditions;
    override?: boolean;
    overrideReason?: string;
    admissionLevel?: string;
    workScale?: string;
  }
): { verdict: unknown } => {
  const flow = readQaFlow(store, input.flowId);
  const triggered = floorTriggered(input.conditions);
  if (triggered && input.override && requiresSkipReason({ admissionLevel: input.admissionLevel ?? null, workScale: input.workScale ?? null }) && !input.overrideReason?.trim()) {
    throw new Error("major QA floor overrides require an override reason");
  }
  const row = store.upsertQaFloorVerdict({
    flowId: input.flowId,
    qaPassRecordId: flow.qa_pass_record_id,
    conditions: input.conditions,
    triggered,
    override: input.override ?? false,
    overrideReason: input.overrideReason,
    flowStep: "qa:pass-fail-floor"
  });
  store.updateFlowInstance(input.flowId, { currentStep: "qa:pass-fail-floor" });
  return {
    verdict: {
      ...row,
      triggered,
      override: input.override ?? false,
      blocked: false,
      advisory: triggered ? "QA pass/fail floor warning surfaced; steward may override." : "QA pass/fail floor not triggered."
    }
  };
};

export const routeQaRepair = (
  store: WorldFile,
  input: {
    flowId: number;
    testNumber: number;
    repairKind: "fact" | "canon_debt";
    repairText: string;
    debtKind?: string;
    debtName?: string;
    candidate?: { title: string; body: string; truthLayer: string };
  }
): { record?: RecordRow; debt?: RecordRow; queue?: AdmissionQueueRow[]; repair: unknown } => {
  if (!input.repairText.trim()) throw new Error("QA repairs require steward-written repair text");
  const flow = readQaFlow(store, input.flowId);
  return store.atomicWrite(() => {
    if (input.repairKind === "fact") {
      if (!input.candidate?.title?.trim() || !input.candidate.truthLayer) throw new Error("fact-shaped QA repair requires a candidate title and truth layer");
      const intake = intakeProposedFact(store, {
        origin: "future-flow",
        candidate: {
          title: input.candidate.title,
          body: input.candidate.body,
          truthLayer: input.candidate.truthLayer,
          canonStatus: "proposed"
        },
        sourceLinks: [{ recordId: flow.qa_pass_record_id, note: "Fact-shaped repair surfaced by QA pass" }],
        provenanceFlowStep: "qa:repair-proposal"
      });
      const repair = store.insertQaRepair({
        flowId: input.flowId,
        qaPassRecordId: flow.qa_pass_record_id,
        testNumber: input.testNumber,
        repairKind: "fact",
        repairText: input.repairText,
        proposalRecordId: intake.record.id,
        flowStep: "qa:repair-proposal"
      });
      store.updateFlowInstance(input.flowId, { currentStep: "qa:repair-proposal" });
      return { record: intake.record, queue: intake.queue, repair };
    }

    if (!input.debtName?.trim()) throw new Error("canon-debt QA repair requires a debt name");
    const debt = store.createCanonDebt({
      name: input.debtName,
      scope: `QA ${input.debtKind ?? "repair"}`,
      assignee: "steward",
      body: input.repairText
    });
    store.createLinkIfMissing(flow.qa_pass_record_id, debt.id, "requires_follow_up", "QA repair minted canon debt");
    const repair = store.insertQaRepair({
      flowId: input.flowId,
      qaPassRecordId: flow.qa_pass_record_id,
      testNumber: input.testNumber,
      repairKind: "canon_debt",
      debtKind: input.debtKind,
      repairText: input.repairText,
      debtRecordId: debt.id,
      flowStep: "qa:repair-debt"
    });
    store.updateFlowInstance(input.flowId, { currentStep: "qa:repair-debt" });
    return { debt, repair };
  });
};

export const skipQaStep = (
  store: WorldFile,
  input: { flowId?: number; stepKey: string; admissionLevel?: string; workScale?: string; reason?: string }
): RecordRow => {
  const record = PromptOut.recordPromptOutSkip(store, { flowKey: "qa", ...input });
  if (input.flowId != null) {
    const flow = readQaFlow(store, input.flowId);
    store.createLinkIfMissing(record.id, flow.qa_pass_record_id, "derived_from", "QA instrument declined");
    store.updateFlowInstance(input.flowId, { currentStep: `qa:skip:${input.stepKey}` });
  }
  return record;
};

export const finalizeQaPass = (
  store: WorldFile,
  flowId: number
): { flow: unknown; pass: RecordRow; scores: QaScoreRow[]; band: QaBand } => {
  const flow = readQaFlow(store, flowId);
  const scores = store.qaScores(flowId);
  const unexplainedNa = scores.find((score) => score.score === "na" && !score.naReason.trim());
  if (unexplainedNa) throw new Error(`n/a reason required for QA test ${unexplainedNa.testNumber}`);
  const missingRepair = scores.find((score) =>
    score.loadBearing
    && score.repairRouted
    && (score.score === "0" || score.score === "1")
    && !score.requiredRepair.trim()
  );
  if (missingRepair) throw new Error(`required repair substance missing for QA test ${missingRepair.testNumber}`);
  const completed = store.updateFlowInstance(flowId, { state: "complete", currentStep: "qa:complete" });
  return {
    flow: completed,
    pass: store.getRecord(flow.qa_pass_record_id),
    scores,
    band: derivedBand(scores)
  };
};
