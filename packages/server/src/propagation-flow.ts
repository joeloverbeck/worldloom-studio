import { isFoundationalSeverity, isMajorOrHigher, type DeclaredSeverity } from "./severity-policy.js";
import { intakeProposedFact } from "./admission-flow.js";
import * as PromptOut from "./prompt-out.js";
import type { AdmissionQueueRow, FacetRow, RecordRow, WorldFile } from "./world-file.js";

export interface PropagationQueueRow extends RecordRow {
  scope: string;
  state: string;
}

export interface PropagationConsequenceRow {
  id: number;
  flowId: number;
  factRecordId: number;
  orderKey: string;
  orderLabel: string;
  domainName: string | null;
  body: string;
  pressure: "normal" | "high";
  flowStep: string;
  createdAt: string;
}

export interface PropagationDomainSweepRow {
  id: number;
  flowId: number;
  domainName: string;
  triage: "direct" | "dependency" | "reaction" | "negative";
  declaration: string;
  flowStep: string;
  createdAt: string;
}

export interface PropagationDispositionRow {
  id: number;
  consequenceId: number;
  disposition: string;
  note: string;
  preservationBoundary: string | null;
  debtRecordId: number | null;
  flowStep: string;
  createdAt: string;
}

export interface PropagationFlowRow {
  id: number;
  state: string;
  current_step: string;
  propagation_fact_record_id: number;
  propagation_debt_record_id: number | null;
  propagation_report_record_id: number | null;
}

type PropagationRequiredDomainCount = number | "all";

interface PropagationCoveragePolicy {
  requiredCoverage: string;
  requiredDomainCount: PropagationRequiredDomainCount;
}

const PROPAGATION_ORDERS = [
  ["zeroth", "Zeroth-order: definition"],
  ["first", "First-order: direct effects"],
  ["second", "Second-order: adaptations"],
  ["third", "Third-order: institutionalization"],
  ["fourth", "Fourth-order: historical and cultural residue"],
  ["fifth", "Fifth-order: identity and metaphysics"]
] as const;

const DOMAIN_ATLAS = [
  "Physics, metaphysics, and cosmology",
  "Geography, climate, and infrastructure",
  "Ecology, food, disease, and nonhuman life",
  "Population, demography, and household life",
  "Production, labor, and technology/magic",
  "Economy, trade, and scarcity",
  "Governance, law, and bureaucracy",
  "War, coercion, and security",
  "Religion, ritual, myth, and meaning",
  "Culture, custom, language, and identity",
  "Knowledge, education, science, and records",
  "History, memory, and path dependence",
  "Daily life and material residue",
  "Aesthetics, tone, and narrative use"
] as const;

const rowToPropagationConsequence = (row: Record<string, unknown>): PropagationConsequenceRow => ({
  id: Number(row.id),
  flowId: Number(row.flow_id),
  factRecordId: Number(row.fact_record_id),
  orderKey: String(row.order_key),
  orderLabel: String(row.order_label),
  domainName: row.domain_name == null ? null : String(row.domain_name),
  body: String(row.body),
  pressure: String(row.pressure) === "high" ? "high" : "normal",
  flowStep: String(row.flow_step),
  createdAt: String(row.created_at)
});

const rowToPropagationDomainSweep = (row: Record<string, unknown>): PropagationDomainSweepRow => ({
  id: Number(row.id),
  flowId: Number(row.flow_id),
  domainName: String(row.domain_name),
  triage: String(row.triage) as PropagationDomainSweepRow["triage"],
  declaration: String(row.declaration ?? ""),
  flowStep: String(row.flow_step),
  createdAt: String(row.created_at)
});

const rowToPropagationDisposition = (row: Record<string, unknown>): PropagationDispositionRow => ({
  id: Number(row.id),
  consequenceId: Number(row.consequence_id),
  disposition: String(row.disposition),
  note: String(row.note ?? ""),
  preservationBoundary: row.preservation_boundary == null ? null : String(row.preservation_boundary),
  debtRecordId: row.debt_record_id == null ? null : Number(row.debt_record_id),
  flowStep: String(row.flow_step),
  createdAt: String(row.created_at)
});

const declaredSeverityFromFacets = (facets: FacetRow[]): DeclaredSeverity => ({
  admissionLevel: facets.find((facet) => facet.vocabulary === "admission_level")?.term ?? null,
  workScale: facets.find((facet) => facet.vocabulary === "work_scale")?.term ?? null
});

const propagationCoveragePolicy = (severity: DeclaredSeverity): PropagationCoveragePolicy => {
  if (isFoundationalSeverity(severity)) {
    return {
      requiredCoverage: "full domain-atlas sweep",
      requiredDomainCount: "all"
    };
  }
  if (isMajorOrHigher(severity)) {
    return {
      requiredCoverage: "multiple orders and direct/dependency/reaction domains",
      requiredDomainCount: 3
    };
  }
  return {
    requiredCoverage: "immediate effects and one ordinary-life residue when relevant",
    requiredDomainCount: 1
  };
};

const readPropagationFlow = (store: WorldFile, flowId: number): PropagationFlowRow => {
  const flow = store.getFlowInstance(flowId, "propagation");
  if (flow.propagation_fact_record_id == null) throw new Error(`Propagation flow has no fact: ${flowId}`);
  return {
    id: Number(flow.id),
    state: String(flow.state),
    current_step: String(flow.current_step),
    propagation_fact_record_id: Number(flow.propagation_fact_record_id),
    propagation_debt_record_id: flow.propagation_debt_record_id == null ? null : Number(flow.propagation_debt_record_id),
    propagation_report_record_id: flow.propagation_report_record_id == null ? null : Number(flow.propagation_report_record_id)
  };
};

const propagationConsequences = (store: WorldFile, flowId: number): PropagationConsequenceRow[] =>
  store.propagationConsequences(flowId).map((row) => rowToPropagationConsequence(row));

const propagationDomainSweeps = (store: WorldFile, flowId: number): PropagationDomainSweepRow[] =>
  store.propagationDomainSweeps(flowId).map((row) => rowToPropagationDomainSweep(row));

const propagationDispositions = (store: WorldFile, flowId: number): PropagationDispositionRow[] =>
  store.propagationDispositions(flowId).map((row) => rowToPropagationDisposition(row));

const undispositionedHighPressureConsequences = (store: WorldFile, flowId: number): PropagationConsequenceRow[] =>
  store.undispositionedHighPressurePropagationConsequences(flowId).map((row) => rowToPropagationConsequence(row));

export const propagationQueue = (store: WorldFile): PropagationQueueRow[] =>
  store.propagationQueueRecordIds().map((id) => {
    const record = store.getRecord(id);
    return { ...record, scope: "propagation", state: "open" };
  });

export const propagationPlan = (store: WorldFile, recordId: number): unknown => {
  const record = store.getRecord(recordId);
  const facets = store.listFacets(recordId);
  const severity = declaredSeverityFromFacets(facets);
  const coverage = propagationCoveragePolicy(severity);
  return {
    record,
    admissionLevel: severity.admissionLevel,
    workScale: severity.workScale,
    requiredCoverage: coverage.requiredCoverage,
    requiredDomainCount: coverage.requiredDomainCount === "all" ? DOMAIN_ATLAS.length : coverage.requiredDomainCount,
    orders: PROPAGATION_ORDERS.map(([key, label]) => ({ key, label })),
    domains: DOMAIN_ATLAS,
    doctrine: {
      mechanisms: "docs/worldbuilding-system/07_propagation_engine.md#propagation-mechanisms",
      signatureTests: ["why not everywhere?", "why not used by enemies?", "where are the fossils?"],
      stoppingRules: ["answered", "intentionally scoped out", "assigned as canon debt", "protected as a mystery boundary"],
      domainAtlas: "docs/worldbuilding-system/04_domain_atlas.md"
    }
  };
};

export const startPropagationRun = (store: WorldFile, input: { factRecordId: number; debtRecordId?: number }): unknown => {
  const fact = store.getRecord(input.factRecordId);
  if (input.debtRecordId != null) {
    const debt = store.getRecord(input.debtRecordId);
    if (debt.recordTypeKey !== "canon_debt") throw new Error("propagation debt must be a canon debt record");
    if (!propagationQueue(store).some((row) => row.id === debt.id)) throw new Error("debt is not an open propagation-scoped debt item");
  }
  const existing = store.findInProgressPropagationFlow(fact.id, input.debtRecordId);
  if (existing) return existing;
  return store.createFlowInstance({ flowKey: "propagation", currentStep: "propagation:entry", propagationFactRecordId: fact.id, propagationDebtRecordId: input.debtRecordId ?? null });
};

export const getPropagationRun = (store: WorldFile, flowId: number): unknown => {
  const flow = readPropagationFlow(store, flowId);
  return {
    flow,
    plan: propagationPlan(store, flow.propagation_fact_record_id),
    consequences: propagationConsequences(store, flowId),
    domainSweeps: propagationDomainSweeps(store, flowId),
    dispositions: propagationDispositions(store, flowId),
    proposals: store.propagationSurfacedProposals(flowId)
  };
};

export const addPropagationConsequence = (
  store: WorldFile,
  input: { flowId: number; orderKey: string; domainName?: string; body: string; pressure?: "normal" | "high" }
): PropagationConsequenceRow => {
  const flow = readPropagationFlow(store, input.flowId);
  const order = PROPAGATION_ORDERS.find(([key]) => key === input.orderKey);
  if (!order) throw new Error(`Unknown propagation order: ${input.orderKey}`);
  if (input.domainName && !DOMAIN_ATLAS.includes(input.domainName as (typeof DOMAIN_ATLAS)[number])) throw new Error(`Unknown domain: ${input.domainName}`);
  if (!input.body.trim()) throw new Error("propagation consequence requires steward-written prose");
  const row = store.insertPropagationConsequence({
    flowId: input.flowId,
    factRecordId: flow.propagation_fact_record_id,
    orderKey: order[0],
    orderLabel: order[1],
    domainName: input.domainName,
    body: input.body,
    pressure: input.pressure ?? "normal",
    flowStep: `propagation:${order[0]}`
  });
  store.updateFlowInstance(input.flowId, { currentStep: `propagation:${order[0]}` });
  return rowToPropagationConsequence(row);
};

export const recordPropagationDomain = (
  store: WorldFile,
  input: { flowId: number; domainName: string; triage: "direct" | "dependency" | "reaction" | "negative"; declaration?: string }
): PropagationDomainSweepRow => {
  readPropagationFlow(store, input.flowId);
  if (!DOMAIN_ATLAS.includes(input.domainName as (typeof DOMAIN_ATLAS)[number])) throw new Error(`Unknown domain: ${input.domainName}`);
  if (input.triage === "negative" && !input.declaration?.trim()) throw new Error("negative domains require an explicit declaration");
  const row = store.upsertPropagationDomainSweep(input);
  store.updateFlowInstance(input.flowId, { currentStep: "propagation:domain-atlas" });
  return rowToPropagationDomainSweep(row);
};

export const dispositionPropagationConsequence = (
  store: WorldFile,
  input: { consequenceId: number; disposition: string; note?: string; debtName?: string; preservationBoundary?: string }
): PropagationDispositionRow => {
  const consequence = store.getPropagationConsequence(input.consequenceId);
  if (!consequence) throw new Error(`Propagation consequence not found: ${input.consequenceId}`);
  store.assertVocabularyTerm("consequence_disposition", input.disposition);
  let debtRecordId: number | null = null;
  if (input.disposition === "assigned as canon debt") {
    if (!input.debtName?.trim()) throw new Error("assigned-as-debt consequences require a named debt");
    debtRecordId = store.createCanonDebt({ name: input.debtName, scope: "propagation", assignee: "steward", body: input.note ?? String(consequence.body) }).id;
  }
  if (input.disposition === "protected as a mystery boundary" && !input.preservationBoundary?.trim()) {
    throw new Error("protected consequences require an explicit preservation boundary");
  }
  const row = store.insertPropagationDisposition({ consequenceId: input.consequenceId, disposition: input.disposition, note: input.note, preservationBoundary: input.preservationBoundary, debtRecordId });
  store.updateFlowInstance(Number(consequence.flow_id), { currentStep: "propagation:disposition" });
  return rowToPropagationDisposition(row);
};

export const proposeFactFromPropagation = (
  store: WorldFile,
  input: { flowId: number; title: string; body: string; truthLayer: string }
): { record: RecordRow; queue: AdmissionQueueRow[] } => {
  return store.atomicWrite(() => {
    const flow = readPropagationFlow(store, input.flowId);
    const intake = intakeProposedFact(store, {
      origin: "propagation-surfaced-fact",
      candidate: {
        title: input.title,
        body: input.body,
        truthLayer: input.truthLayer,
        canonStatus: "proposed"
      },
      sourceLinks: flow.propagation_report_record_id == null
        ? []
        : [{ recordId: flow.propagation_report_record_id, note: "Fact surfaced by propagation report" }],
      recordSweepJurisdiction: true,
      provenanceFlowStep: "propagation:surface-proposal"
    });
    store.insertPropagationSurfacedProposal({ flowId: input.flowId, proposalRecordId: intake.record.id, reportRecordId: flow.propagation_report_record_id ?? null, flowStep: "propagation:surface-proposal" });
    store.updateFlowInstance(input.flowId, { currentStep: "propagation:surface-proposal" });
    return intake;
  });
};

export const skipPropagationStep = (
  store: WorldFile,
  input: { flowId?: number; stepKey: string; admissionLevel?: string; workScale?: string; reason?: string }
): RecordRow => {
  const record = PromptOut.recordPromptOutSkip(store, { flowKey: "propagation", ...input });
  if (input.flowId != null) {
    const flow = readPropagationFlow(store, input.flowId);
    store.createLink(record.id, flow.propagation_fact_record_id, "derived_from", "Propagation step declined");
    store.updateFlowInstance(input.flowId, { currentStep: `propagation:skip:${input.stepKey}` });
  }
  return record;
};

export const closePropagationRun = (store: WorldFile, flowId: number): { flow: unknown; report: RecordRow; debt: RecordRow | null; missing: PropagationConsequenceRow[] } => {
  const flow = readPropagationFlow(store, flowId);
  const missing = undispositionedHighPressureConsequences(store, flowId);
  if (missing.length) {
    throw new Error(`undispositioned high-pressure consequences: ${missing.map((row) => `#${row.id}`).join(", ")}`);
  }
  return store.atomicWrite(() => {
    const report = flow.propagation_report_record_id == null
      ? writePropagationReport(store, flowId)
      : store.getRecord(flow.propagation_report_record_id);
    const fact = store.getRecord(flow.propagation_fact_record_id);
    store.createLink(fact.id, report.id, "digest_of", "Fact card shock-cone digest points to propagation report");
    store.assignPropagationReportToSurfacedProposals(flowId, report.id);
    const proposalRows = store.propagationSurfacedProposals(flowId) as Array<{ proposal_record_id: number }>;
    for (const row of proposalRows) {
      store.createLinkIfMissing(row.proposal_record_id, report.id, "derived_from", "Fact surfaced by propagation report");
    }
    const debt = flow.propagation_debt_record_id == null ? null : store.closeCanonDebt(flow.propagation_debt_record_id);
    const updatedFlow = store.updateFlowInstance(flowId, { state: "complete", currentStep: "propagation:complete", propagationReportRecordId: report.id });
    return { flow: updatedFlow, report, debt, missing: [] };
  });
};

export const correctPropagationReport = (
  store: WorldFile,
  input: { originalReportId: number; title?: string; body: string }
): RecordRow => {
  const original = store.getRecord(input.originalReportId);
  if (original.recordTypeKey !== "propagation_report") throw new Error("only propagation reports can be corrected through this route");
  if (!input.body.trim()) throw new Error("propagation report corrections require steward-written prose");
  return store.atomicWrite(() => {
    const correction = store.createRecord({
      recordTypeKey: "propagation_report",
      title: input.title ?? `Correction: ${original.shortId}`,
      body: input.body,
      truthLayer: original.truthLayer ?? "Objective canon",
      canonStatus: "accepted"
    });
    store.createLink(correction.id, original.id, "supersedes", "Propagation report correction; original remains append-only");
    return correction;
  });
};

const writePropagationReport = (store: WorldFile, flowId: number): RecordRow => {
  const flow = readPropagationFlow(store, flowId);
  const fact = store.getRecord(flow.propagation_fact_record_id);
  const consequences = propagationConsequences(store, flowId);
  const domainSweeps = propagationDomainSweeps(store, flowId);
  const dispositions = propagationDispositions(store, flowId);
  const dispositionByConsequence = new Map(dispositions.map((disposition) => [disposition.consequenceId, disposition]));
  const proposalRows = store.propagationSurfacedProposals(flowId) as Array<{ proposal_record_id: number }>;
  const proposals = proposalRows.map((row) => store.getRecord(row.proposal_record_id));
  const body = [
    `Fact: ${fact.shortId} ${fact.title}`,
    `Flow: ${flowId}`,
    `Orders worked: ${[...new Set(consequences.map((row) => row.orderLabel))].join(", ") || "none"}`,
    `Domains swept: ${domainSweeps.filter((row) => row.triage !== "negative").map((row) => row.domainName).join("; ") || "none"}`,
    `Negative domains: ${domainSweeps.filter((row) => row.triage === "negative").map((row) => `${row.domainName}: ${row.declaration}`).join("; ") || "none"}`,
    `Consequences: ${consequences.length}`,
    `Surface proposals: ${proposals.map((proposal) => proposal.shortId).join(", ") || "none"}`
  ].join("\n");
  const report = store.createRecord({
    recordTypeKey: "propagation_report",
    title: `Propagation report: ${fact.shortId}`,
    body,
    truthLayer: "Objective canon",
    canonStatus: "accepted"
  });
  store.replaceSections(report.id, [
    { heading: "Fact and run", body: `Fact: ${fact.shortId} ${fact.title}\nFlow: ${flowId}`, position: 1 },
    { heading: "Shock-cone orders", body: PROPAGATION_ORDERS.map(([, label]) => {
      const rows = consequences.filter((row) => row.orderLabel === label);
      return `## ${label}\n${rows.map((row) => `- [${row.pressure}] ${row.body}`).join("\n") || "No consequence recorded."}`;
    }).join("\n\n"), position: 2 },
    { heading: "Domain-atlas sweep", body: domainSweeps.filter((row) => row.triage !== "negative").map((row) => `- ${row.domainName} (${row.triage}): ${row.declaration || "swept"}`).join("\n") || "No swept domains recorded.", position: 3 },
    { heading: "Negative domains", body: domainSweeps.filter((row) => row.triage === "negative").map((row) => `- ${row.domainName}: ${row.declaration}`).join("\n") || "No negative domains declared.", position: 4 },
    { heading: "Consequences and dispositions", body: consequences.map((row) => {
      const disposition = dispositionByConsequence.get(row.id);
      return `- #${row.id} ${row.orderLabel}${row.domainName ? ` / ${row.domainName}` : ""}: ${row.body}\n  Disposition: ${disposition ? `${disposition.disposition}${disposition.note ? ` - ${disposition.note}` : ""}` : "undispositioned"}`;
    }).join("\n") || "No consequences recorded.", position: 5 },
    { heading: "Surfaced proposals", body: proposals.map((proposal) => `- ${proposal.shortId} ${proposal.title} (${proposal.canonStatus})`).join("\n") || "No surfaced proposals.", position: 6 },
    { heading: "Debt and preservation boundaries", body: dispositions.filter((row) => row.debtRecordId != null || row.preservationBoundary).map((row) => `- Consequence #${row.consequenceId}: ${row.debtRecordId ? `debt record ${row.debtRecordId}` : `boundary ${row.preservationBoundary}`}`).join("\n") || "None.", position: 7 },
    { heading: "Stopping-rule audit", body: `High-pressure consequences: ${consequences.filter((row) => row.pressure === "high").length}\nUndispositioned high-pressure consequences: ${undispositionedHighPressureConsequences(store, flowId).length}\nStates: answered; intentionally scoped out; assigned as canon debt; protected as a mystery boundary.`, position: 8 }
  ]);
  store.createLink(report.id, fact.id, "derived_from", "Propagation report works this fact's shock cone");
  for (const disposition of dispositions) {
    if (disposition.debtRecordId != null) store.createLink(report.id, disposition.debtRecordId, "requires_follow_up", "Propagation consequence assigned as canon debt");
  }
  return report;
};
