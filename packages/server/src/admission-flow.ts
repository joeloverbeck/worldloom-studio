import {
  admissionGatePolicy,
  admissionQueueSortKey,
  requiresSkipReason,
  warnsForOpenCanonDebt,
  type DeclaredSeverity
} from "./severity-policy.js";
import { createSkipRecord } from "./flow-support.js";
import type { AdmissionQueueRow, FacetRow, RecordRow, WorldFile } from "./world-file.js";

type AdmissionIntakeCompletion = {
  recordSweepJurisdiction?: boolean;
  provenanceFlowStep?: string;
};

const declaredSeverityFromFacets = (facets: FacetRow[]): DeclaredSeverity => ({
  admissionLevel: facets.find((facet) => facet.vocabulary === "admission_level")?.term ?? null,
  workScale: facets.find((facet) => facet.vocabulary === "work_scale")?.term ?? null
});

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
  if (completion.recordSweepJurisdiction) worldFile.recordJurisdictionEvent(recordId, { origin: "sweep" });
  if (completion.provenanceFlowStep) worldFile.recordProposeProvenance(recordId, completion.provenanceFlowStep);
  return admissionQueue(worldFile);
};

export const parkCreationSeedForAdmission = (
  worldFile: WorldFile,
  seed: { title: string; body: string; truthLayer: string; canonStatus: string },
  kernelRecordId: number,
  reportRecordId: number
): RecordRow => {
  if (!seed.truthLayer || !seed.canonStatus) throw new Error("seed parking requires explicit truth layer and canon status");
  const record = worldFile.createRecord({ recordTypeKey: "canon_fact", title: seed.title, body: seed.body, truthLayer: seed.truthLayer, canonStatus: seed.canonStatus });
  worldFile.createLink(record.id, kernelRecordId, "derived_from", "Seed decomposed from world kernel");
  worldFile.createLink(record.id, reportRecordId, "derived_from", "Seed recorded by decomposition report");
  routeRecordToAdmissionQueue(worldFile, record.id);
  return record;
};

export const proposeDraftToAdmission = (
  worldFile: WorldFile,
  id: number,
  input: { title?: string; truthLayer: string }
): { record: RecordRow; queue: AdmissionQueueRow[] } =>
  worldFile.atomicWrite(() => {
    const record = worldFile.convertDraft(id, { recordTypeKey: "canon_fact", title: input.title, truthLayer: input.truthLayer, canonStatus: "proposed" });
    return { record, queue: routeRecordToAdmissionQueue(worldFile, record.id, { recordSweepJurisdiction: true, provenanceFlowStep: "admission:propose-draft" }) };
  });

export const proposeRecordToAdmission = (
  worldFile: WorldFile,
  id: number
): { record: RecordRow; queue: AdmissionQueueRow[] } =>
  worldFile.atomicWrite(() => {
    const record = worldFile.getRecord(id);
    return { record, queue: routeRecordToAdmissionQueue(worldFile, record.id, { recordSweepJurisdiction: true, provenanceFlowStep: "admission:propose-record" }) };
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
      worldFile.createLink(record.id, input.advisoryRecordId, "derived_from", "Admission decision informed by advisory material");
      worldFile.createLink(record.id, input.advisoryRecordId, "cites_advisory_artifact", "Verbatim admission advisory artifact consulted");
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
  if (requiresSkipReason({ admissionLevel: input.admissionLevel ?? null, workScale: input.workScale ?? null }) && !input.reason?.trim()) {
    throw new Error("major admission skips require a reason");
  }
  const record = createSkipRecord(worldFile, { stepKey: input.stepKey, reason: input.reason });
  if (input.recordId != null) worldFile.createLink(record.id, input.recordId, "derived_from", "Admission instrument declined");
  return record;
};
