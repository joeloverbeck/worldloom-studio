import {
  isCatastrophicSeverity,
  isFoundationalSeverity,
  isMajorOrHigher,
  type DeclaredSeverity
} from "./severity-policy.js";
import * as PromptOut from "./prompt-out.js";
import type { AdmissionQueueRow, FacetRow, RecordRow, WorldFile } from "./world-file.js";

export type AdmissionGatePath = "minor_ledger" | "full_gate";

export interface AdmissionGatePolicy {
  path: AdmissionGatePath;
  doctrine: string[];
  steps: string[];
}

export interface AdmissionQueueSortKey {
  workScaleRank: number;
  admissionLevelRank: number;
}

type AdmissionIntakeCompletion = {
  recordSweepJurisdiction?: boolean;
  provenanceFlowStep?: string;
};

type AdmissionSourceLink = {
  recordId: number;
  note: string;
};

type AdmissionCandidate = {
  title: string;
  body?: string;
  truthLayer: string;
  canonStatus: string;
};

export type AdmissionIntakeInput =
  | (AdmissionIntakeCompletion & {
      origin: "draft";
      draftId: number;
      candidate: Omit<AdmissionCandidate, "body">;
      sourceLinks?: AdmissionSourceLink[];
    })
  | (AdmissionIntakeCompletion & {
      origin: "existing-record";
      recordId: number;
      sourceLinks?: AdmissionSourceLink[];
    })
  | (AdmissionIntakeCompletion & {
      origin: "creation-seed" | "propagation-surfaced-fact" | "contradiction-repair-created-fact" | "future-flow";
      candidate: AdmissionCandidate;
      sourceLinks?: AdmissionSourceLink[];
    });

const WORK_SCALE_QUEUE_RANK: Record<string, number> = {
  catastrophic: 1,
  severe: 2,
  major: 3,
  moderate: 4,
  minor: 5
};

const MINOR_LEDGER_STEPS = [
  "fact statement",
  "scope",
  "truth layer",
  "canon status",
  "constraint tags",
  "admission operations",
  "one consequence check"
];

const FULL_GATE_STEPS = [
  "fact statement",
  "scope",
  "type",
  "truth layer",
  "canon status",
  "constraint tags",
  "dependencies",
  "costs/access/bottlenecks",
  "shock-cone summary",
  "institutions or quiet-domain declaration",
  "evidence/belief note",
  "contradiction and mystery risk",
  "follow-up debt"
];

const FOUNDATIONAL_GATE_STEPS = [
  "temporal/spatial passes",
  "branch implications",
  "mystery/aesthetic checks",
  "QA follow-up"
];

const CATASTROPHIC_GATE_STEPS = [
  "explicit decision record",
  "rollback/branch plan"
];

const declaredSeverityFromFacets = (facets: FacetRow[]): DeclaredSeverity => ({
  admissionLevel: facets.find((facet) => facet.vocabulary === "admission_level")?.term ?? null,
  workScale: facets.find((facet) => facet.vocabulary === "work_scale")?.term ?? null
});

export const admissionQueueSortKey = (severity: DeclaredSeverity): AdmissionQueueSortKey => {
  const admissionLevelRank = severity.admissionLevel == null ? -1 : Number.parseInt(severity.admissionLevel, 10);
  return {
    workScaleRank: WORK_SCALE_QUEUE_RANK[severity.workScale ?? ""] ?? 6,
    admissionLevelRank: Number.isNaN(admissionLevelRank) ? 0 : admissionLevelRank
  };
};

export const admissionGatePolicy = (severity: DeclaredSeverity): AdmissionGatePolicy => {
  const fullGate = isMajorOrHigher(severity);
  const foundational = isFoundationalSeverity(severity);
  const catastrophic = isCatastrophicSeverity(severity);
  const steps = fullGate
    ? [
        ...FULL_GATE_STEPS,
        ...(foundational ? FOUNDATIONAL_GATE_STEPS : []),
        ...(catastrophic ? CATASTROPHIC_GATE_STEPS : [])
      ]
    : [...MINOR_LEDGER_STEPS];

  return {
    path: fullGate ? "full_gate" : "minor_ledger",
    doctrine: [
      "docs/worldbuilding-system/06_canon_fact_admission_protocol.md",
      fullGate ? "docs/worldbuilding-system/checklists/canon_fact_gate.md" : "docs/worldbuilding-system/templates/admission_ledger.md"
    ],
    steps
  };
};

export const warnsForOpenCanonDebt = (severity: DeclaredSeverity): boolean => isFoundationalSeverity(severity);

const withAdmissionFacets = (worldFile: WorldFile, record: RecordRow): AdmissionQueueRow => {
  const facets = worldFile.listFacets(record.id);
  return {
    ...record,
    admissionLevel: facets.find((facet) => facet.vocabulary === "admission_level")?.term ?? null,
    workScale: facets.find((facet) => facet.vocabulary === "work_scale")?.term ?? null,
    constraintTags: facets.filter((facet) => facet.vocabulary === "constraint_tag").map((facet) => facet.term)
  };
};

export const admissionQueue = (worldFile: WorldFile): AdmissionQueueRow[] =>
  worldFile.listRecords()
    .filter((record) => ["canon_fact", "admission_ledger_row"].includes(record.recordTypeKey))
    .filter((record) => record.canonStatus === "proposed" || record.canonStatus === "under review")
    .map((record) => withAdmissionFacets(worldFile, record))
    .sort((left, right) => {
      const leftKey = admissionQueueSortKey(left);
      const rightKey = admissionQueueSortKey(right);
      if (leftKey.workScaleRank !== rightKey.workScaleRank) return leftKey.workScaleRank - rightKey.workScaleRank;
      if (leftKey.admissionLevelRank !== rightKey.admissionLevelRank) return rightKey.admissionLevelRank - leftKey.admissionLevelRank;
      if (left.updatedAt !== right.updatedAt) return left.updatedAt < right.updatedAt ? 1 : -1;
      return right.id - left.id;
    });

export const routeRecordToAdmissionQueue = (
  worldFile: WorldFile,
  recordId: number,
  completion: AdmissionIntakeCompletion = {}
): AdmissionQueueRow[] => {
  return intakeProposedFact(worldFile, { origin: "existing-record", recordId, ...completion }).queue;
};

const applyAdmissionIntakeCompletion = (
  worldFile: WorldFile,
  record: RecordRow,
  input: AdmissionIntakeInput
): { record: RecordRow; queue: AdmissionQueueRow[] } => {
  for (const sourceLink of input.sourceLinks ?? []) {
    worldFile.createLinkIfMissing(record.id, sourceLink.recordId, "derived_from", sourceLink.note);
  }
  if (input.recordSweepJurisdiction) worldFile.recordJurisdictionEvent(record.id, { origin: "sweep" });
  if (input.provenanceFlowStep) worldFile.recordProposeProvenance(record.id, input.provenanceFlowStep);
  return { record, queue: admissionQueue(worldFile) };
};

export const intakeProposedFact = (
  worldFile: WorldFile,
  input: AdmissionIntakeInput
): { record: RecordRow; queue: AdmissionQueueRow[] } =>
  worldFile.atomicWrite(() => {
    if (input.origin === "existing-record") {
      return applyAdmissionIntakeCompletion(worldFile, worldFile.getRecord(input.recordId), input);
    }
    if (input.origin === "draft") {
      if (!input.candidate.truthLayer || !input.candidate.canonStatus) {
        throw new Error("draft intake requires explicit truth layer and canon status");
      }
      const record = worldFile.convertDraft(input.draftId, {
        recordTypeKey: "canon_fact",
        title: input.candidate.title,
        truthLayer: input.candidate.truthLayer,
        canonStatus: input.candidate.canonStatus
      });
      return applyAdmissionIntakeCompletion(worldFile, record, input);
    }

    if (!input.candidate.truthLayer || !input.candidate.canonStatus) {
      throw new Error("admission intake requires explicit truth layer and canon status");
    }
    const record = worldFile.createRecord({
      recordTypeKey: "canon_fact",
      title: input.candidate.title,
      body: input.candidate.body,
      truthLayer: input.candidate.truthLayer,
      canonStatus: input.candidate.canonStatus
    });
    return applyAdmissionIntakeCompletion(worldFile, record, input);
  });

export const parkCreationSeedForAdmission = (
  worldFile: WorldFile,
  seed: { title: string; body: string; truthLayer: string; canonStatus: string },
  kernelRecordId: number,
  reportRecordId: number
): RecordRow => {
  if (!seed.truthLayer || !seed.canonStatus) throw new Error("seed parking requires explicit truth layer and canon status");
  return intakeProposedFact(worldFile, {
    origin: "creation-seed",
    candidate: seed,
    sourceLinks: [
      { recordId: kernelRecordId, note: "Seed decomposed from world kernel" },
      { recordId: reportRecordId, note: "Seed recorded by decomposition report" }
    ]
  }).record;
};

export const proposeDraftToAdmission = (
  worldFile: WorldFile,
  id: number,
  input: { title?: string; truthLayer: string }
): { record: RecordRow; queue: AdmissionQueueRow[] } =>
  intakeProposedFact(worldFile, {
    origin: "draft",
    draftId: id,
    candidate: { title: input.title ?? worldFile.getDraft(id).title, truthLayer: input.truthLayer, canonStatus: "proposed" },
    recordSweepJurisdiction: true,
    provenanceFlowStep: "admission:propose-draft"
  });

export const proposeRecordToAdmission = (
  worldFile: WorldFile,
  id: number
): { record: RecordRow; queue: AdmissionQueueRow[] } =>
  intakeProposedFact(worldFile, {
    origin: "existing-record",
    recordId: id,
    recordSweepJurisdiction: true,
    provenanceFlowStep: "admission:propose-record"
  });

export const gateComposition = (worldFile: WorldFile, recordId: number): unknown => {
  const record = worldFile.getRecord(recordId);
  const facets = worldFile.listFacets(recordId);
  const severity = declaredSeverityFromFacets(facets);
  const gate = admissionGatePolicy(severity);
  return {
    record,
    admissionLevel: severity.admissionLevel,
    workScale: severity.workScale,
    path: gate.path,
    doctrine: gate.doctrine,
    steps: gate.steps
  };
};

export const declareAdmissionSeverity = (
  worldFile: WorldFile,
  recordId: number,
  input: { admissionLevel: string; workScale: string }
): { record: RecordRow; facets: FacetRow[]; gate: unknown; queue: AdmissionQueueRow[] } =>
  worldFile.atomicWrite(() => {
    worldFile.assertVocabularyTerm("admission_level", input.admissionLevel);
    worldFile.assertVocabularyTerm("work_scale", input.workScale);
    worldFile.replaceSingleFacet(recordId, "admission_level", input.admissionLevel);
    worldFile.replaceSingleFacet(recordId, "work_scale", input.workScale);
    return { record: worldFile.getRecord(recordId), facets: worldFile.listFacets(recordId), gate: gateComposition(worldFile, recordId), queue: admissionQueue(worldFile) };
  });

export const admitMinorBatch = (
  worldFile: WorldFile,
  input: { source?: string; rows: Array<{ title: string; fact: string; scope: string; truthLayer: string; status: string; constraintTags?: string[]; operations: string[]; consequenceCheck: string }> }
): { records: RecordRow[]; report: RecordRow } => {
  if (!input.rows.length) throw new Error("minor admission batch requires at least one row");
  return worldFile.atomicWrite(() => {
    const report = worldFile.createRecord({
      recordTypeKey: "gate_result",
      title: "Minor admission batch",
      body: `Source: ${input.source ?? "admission queue"}\nRows: ${input.rows.length}`,
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    });
    const records = input.rows.map((row) => {
      if (!row.fact || !row.scope || !row.truthLayer || !row.status || !row.operations.length || !row.consequenceCheck) {
        throw new Error("minor ledger rows require fact, scope, truth layer, status, operations, and one consequence check");
      }
      const record = worldFile.createRecord({
        recordTypeKey: "admission_ledger_row",
        title: row.title,
        body: [
          `Fact: ${row.fact}`,
          `Scope: ${row.scope}`,
          `Status: ${row.status}`,
          `Constraint tags: ${(row.constraintTags ?? []).join(", ") || "none"}`,
          `Admission operation(s): ${row.operations.join(", ")}`,
          `One consequence check: ${row.consequenceCheck}`
        ].join("\n"),
        truthLayer: row.truthLayer,
        canonStatus: row.status
      });
      worldFile.replaceSingleFacet(record.id, "admission_level", "1");
      worldFile.replaceSingleFacet(record.id, "work_scale", "minor");
      for (const [index, tag] of (row.constraintTags ?? []).entries()) {
        worldFile.addFacet(record.id, { vocabulary: "constraint_tag", term: tag, position: index + 1 });
      }
      row.operations.forEach((operation) => worldFile.recordJurisdictionEvent(record.id, { origin: "admission", admissionOperation: operation }));
      worldFile.createLink(record.id, report.id, "derived_from", "Minor admission batch gate result");
      return record;
    });
    return { records, report };
  });
};

export const startAdmissionGate = (worldFile: WorldFile, recordId: number): unknown =>
  worldFile.atomicWrite(() => {
    worldFile.getRecord(recordId);
    const row = worldFile.findLatestInProgressFlowByStepPrefix("admission", `record:${recordId}:`);
    if (row) return row;
    const flow = worldFile.createFlowInstance({ flowKey: "admission", currentStep: `record:${recordId}:gate` });
    worldFile.updateRecord(recordId, { canonStatus: "under review" });
    return flow;
  });

export const completeAdmissionGate = (
  worldFile: WorldFile,
  input: {
    recordId: number;
    title?: string;
    body?: string;
    truthLayer: string;
    canonStatus: string;
    constraintTags?: string[];
    operations: string[];
    consequenceText?: string;
    notApplicableReasons?: string[];
    quietDomainDeclarations?: string[];
    followUpDebt?: string;
    advisoryRecordId?: number;
  }
): { record: RecordRow; gateResult: RecordRow; warnings: RecordRow[] } => {
  const current = worldFile.getRecord(input.recordId);
  const gate = gateComposition(worldFile, input.recordId) as { path: string };
  if (!input.operations.length) throw new Error("admission gate requires at least one admission operation");
  if (gate.path === "full_gate") {
    if (!input.consequenceText?.trim()) throw new Error("full gate requires written consequence text");
    if ((input.notApplicableReasons ?? []).some((reason) => !reason.trim())) throw new Error("n/a gate items require a reason");
    if ((input.quietDomainDeclarations ?? []).some((declaration) => !declaration.trim())) throw new Error("quiet domains require a declaration");
  }
  worldFile.assertAllowedStatusTransition(current.canonStatus, input.canonStatus);
  return worldFile.atomicWrite(() => {
    const warnings = warnsForOpenCanonDebt(declaredSeverityFromFacets(worldFile.listFacets(input.recordId))) ? worldFile.listCanonDebt(true) : [];
    const record = worldFile.updateRecord(input.recordId, {
      title: input.title ?? current.title,
      body: input.body ?? current.body,
      truthLayer: input.truthLayer,
      canonStatus: input.canonStatus
    });
    worldFile.replaceAllFacets(record.id, "constraint_tag", input.constraintTags ?? []);
    input.operations.forEach((operation) => worldFile.recordJurisdictionEvent(record.id, { origin: "admission", admissionOperation: operation }));
    const gateResult = worldFile.createRecord({
      recordTypeKey: "gate_result",
      title: `Gate result: ${record.shortId}`,
      body: [
        `Record: ${record.shortId} ${record.title}`,
        `Status: ${input.canonStatus}`,
        `Operations: ${input.operations.join(", ")}`,
        `Consequence: ${input.consequenceText ?? "minor or not supplied"}`,
        `N/A reasons: ${(input.notApplicableReasons ?? []).join("; ") || "none"}`,
        `Quiet domains: ${(input.quietDomainDeclarations ?? []).join("; ") || "none"}`,
        `Follow-up debt: ${input.followUpDebt ?? "none"}`
      ].join("\n"),
      truthLayer: "Objective canon",
      canonStatus: input.canonStatus === "rejected" ? "rejected" : "accepted"
    });
    worldFile.createLink(record.id, gateResult.id, "derived_from", "Admission gate result");
    if (input.advisoryRecordId != null) {
      PromptOut.linkExplicitAdvisoryUse(worldFile, record.id, input.advisoryRecordId, {
        derivedFromNote: "Admission decision informed by advisory material",
        citationNote: "Verbatim admission advisory artifact consulted"
      });
    }
    if (input.followUpDebt) {
      worldFile.createCanonDebt({ name: `Propagation owed for ${record.shortId}`, scope: "propagation", assignee: "steward", body: input.followUpDebt });
    }
    worldFile.completeAdmissionFlowsForRecord(record.id);
    return { record, gateResult, warnings };
  });
};

export const runSeedAudit = (
  worldFile: WorldFile,
  input: { seedRecordIds: number[]; findings: string; decision: string }
): { report: RecordRow; seeds: RecordRow[] } => {
  if (!input.seedRecordIds.length) throw new Error("seed audit requires at least one seed");
  const seeds = input.seedRecordIds.map((id) => worldFile.getRecord(id));
  return worldFile.atomicWrite(() => {
    const report = worldFile.createRecord({
      recordTypeKey: "gate_result",
      title: "Frontloaded seed audit",
      body: [
        `Seeds: ${seeds.map((seed) => seed.shortId).join(", ")}`,
        `Findings: ${input.findings}`,
        `Decision: ${input.decision}`,
        "Audit proposes; it does not admit or mutate seed judgment fields."
      ].join("\n"),
      truthLayer: "Objective canon",
      canonStatus: "proposed"
    });
    for (const seed of seeds) worldFile.createLink(seed.id, report.id, "derived_from", "Frontloaded seed audit report");
    return { report, seeds: input.seedRecordIds.map((id) => worldFile.getRecord(id)) };
  });
};

export const declineAdmissionInstrument = (
  worldFile: WorldFile,
  input: { recordId?: number; stepKey: string; admissionLevel?: string; workScale?: string; reason?: string }
): RecordRow => {
  const record = PromptOut.recordPromptOutSkip(worldFile, { flowKey: "admission", ...input });
  if (input.recordId != null) worldFile.createLink(record.id, input.recordId, "derived_from", "Admission instrument declined");
  return record;
};
