import { intakeProposedFact } from "./admission-flow.js";
import { methodCard, methodCardsForFlow } from "./method-cards.js";
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
  const row = store.getFlowInstance(flowId, "qa");
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

const scorecard = (store: WorldFile, subjectRecordId: number | null) => ({
  tests: store.qaTestCatalog(),
  subjectMode: subjectMode(store, subjectRecordId),
  methodCard: methodCard("qa.scorecard"),
  methodCards: methodCardsForFlow("qa"),
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
    source: "docs/worldbuilding-system/18_quality_assurance_tests.md"
  }
});

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
      flowKey: "qa",
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
      scorecard: scorecard(store, subjectRecordId),
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
    scorecard: scorecard(store, flow.qa_subject_record_id),
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
