import { propagationCoveragePolicy, requiresSkipReason, type DeclaredSeverity } from "./severity-policy.js";
import type { AdmissionQueueRow, FacetRow, RecordRow, WorldStore } from "./world-store.js";

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

const assertVocabularyTerm = (store: WorldStore, vocabulary: string, term: string): void => {
  const row = store.db.prepare("SELECT 1 FROM vocabulary_terms WHERE vocabulary = ? AND term = ?").get(vocabulary, term);
  if (!row) throw new Error(`Unknown ${vocabulary} term: ${term}`);
};

const recordSweepJurisdiction = (store: WorldStore, recordId: number): void => {
  store.getRecord(recordId);
  store.db.prepare(`
    INSERT INTO jurisdiction_events (record_id, origin, admission_decision_operation)
    VALUES (?, 'sweep', NULL)
  `).run(recordId);
};

const readPropagationFlow = (store: WorldStore, flowId: number): PropagationFlowRow => {
  const flow = store.db.prepare("SELECT * FROM flow_instances WHERE id = ? AND flow_key = 'propagation'").get(flowId) as Record<string, unknown> | undefined;
  if (!flow) throw new Error(`Propagation flow not found: ${flowId}`);
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

const propagationConsequences = (store: WorldStore, flowId: number): PropagationConsequenceRow[] =>
  store.db.prepare("SELECT * FROM propagation_consequences WHERE flow_id = ? ORDER BY id").all(flowId)
    .map((row) => rowToPropagationConsequence(row as Record<string, unknown>));

const propagationDomainSweeps = (store: WorldStore, flowId: number): PropagationDomainSweepRow[] =>
  store.db.prepare("SELECT * FROM propagation_domain_sweeps WHERE flow_id = ? ORDER BY id").all(flowId)
    .map((row) => rowToPropagationDomainSweep(row as Record<string, unknown>));

const propagationDispositions = (store: WorldStore, flowId: number): PropagationDispositionRow[] =>
  store.db.prepare(`
    SELECT d.*
    FROM propagation_consequence_dispositions d
    JOIN propagation_consequences c ON c.id = d.consequence_id
    WHERE c.flow_id = ?
    ORDER BY d.id
  `).all(flowId).map((row) => rowToPropagationDisposition(row as Record<string, unknown>));

const undispositionedHighPressureConsequences = (store: WorldStore, flowId: number): PropagationConsequenceRow[] =>
  store.db.prepare(`
    SELECT c.*
    FROM propagation_consequences c
    LEFT JOIN propagation_consequence_dispositions d ON d.consequence_id = c.id
    WHERE c.flow_id = ?
      AND c.pressure = 'high'
      AND d.id IS NULL
    ORDER BY c.id
  `).all(flowId).map((row) => rowToPropagationConsequence(row as Record<string, unknown>));

export const propagationQueue = (store: WorldStore): PropagationQueueRow[] =>
  (store.db.prepare(`
    SELECT id
    FROM records
    WHERE record_type_key = 'canon_debt'
      AND canon_status != 'accepted'
      AND (
        lower(body) LIKE '%scope: propagation%'
        OR lower(title) LIKE '%propagation owed%'
      )
    ORDER BY updated_at DESC, id DESC
  `).all() as Array<{ id: number }>).map((row) => {
    const record = store.getRecord(Number(row.id));
    return { ...record, scope: "propagation", state: "open" };
  });

export const propagationPlan = (store: WorldStore, recordId: number): unknown => {
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

export const startPropagationRun = (store: WorldStore, input: { factRecordId: number; debtRecordId?: number }): unknown => {
  const fact = store.getRecord(input.factRecordId);
  if (input.debtRecordId != null) {
    const debt = store.getRecord(input.debtRecordId);
    if (debt.recordTypeKey !== "canon_debt") throw new Error("propagation debt must be a canon debt record");
    if (!propagationQueue(store).some((row) => row.id === debt.id)) throw new Error("debt is not an open propagation-scoped debt item");
  }
  const existing = store.db.prepare(`
    SELECT * FROM flow_instances
    WHERE flow_key = 'propagation'
      AND state = 'in_progress'
      AND propagation_fact_record_id = ?
      AND COALESCE(propagation_debt_record_id, 0) = COALESCE(?, 0)
    ORDER BY id DESC
    LIMIT 1
  `).get(fact.id, input.debtRecordId ?? null);
  if (existing) return existing;
  const result = store.db.prepare(`
    INSERT INTO flow_instances (flow_key, current_step, propagation_fact_record_id, propagation_debt_record_id)
    VALUES ('propagation', 'propagation:entry', ?, ?)
  `).run(fact.id, input.debtRecordId ?? null);
  return store.db.prepare("SELECT * FROM flow_instances WHERE id = ?").get(result.lastInsertRowid);
};

export const getPropagationRun = (store: WorldStore, flowId: number): unknown => {
  const flow = readPropagationFlow(store, flowId);
  return {
    flow,
    plan: propagationPlan(store, flow.propagation_fact_record_id),
    consequences: propagationConsequences(store, flowId),
    domainSweeps: propagationDomainSweeps(store, flowId),
    dispositions: propagationDispositions(store, flowId),
    proposals: store.db.prepare("SELECT * FROM propagation_surfaced_proposals WHERE flow_id = ? ORDER BY id").all(flowId)
  };
};

export const addPropagationConsequence = (
  store: WorldStore,
  input: { flowId: number; orderKey: string; domainName?: string; body: string; pressure?: "normal" | "high" }
): PropagationConsequenceRow => {
  const flow = readPropagationFlow(store, input.flowId);
  const order = PROPAGATION_ORDERS.find(([key]) => key === input.orderKey);
  if (!order) throw new Error(`Unknown propagation order: ${input.orderKey}`);
  if (input.domainName && !DOMAIN_ATLAS.includes(input.domainName as (typeof DOMAIN_ATLAS)[number])) throw new Error(`Unknown domain: ${input.domainName}`);
  if (!input.body.trim()) throw new Error("propagation consequence requires steward-written prose");
  const result = store.db.prepare(`
    INSERT INTO propagation_consequences (flow_id, fact_record_id, order_key, order_label, domain_name, body, pressure, flow_step)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(input.flowId, flow.propagation_fact_record_id, order[0], order[1], input.domainName ?? null, input.body, input.pressure ?? "normal", `propagation:${order[0]}`);
  store.db.prepare("UPDATE flow_instances SET current_step = ? WHERE id = ?").run(`propagation:${order[0]}`, input.flowId);
  return rowToPropagationConsequence(store.db.prepare("SELECT * FROM propagation_consequences WHERE id = ?").get(result.lastInsertRowid) as Record<string, unknown>);
};

export const recordPropagationDomain = (
  store: WorldStore,
  input: { flowId: number; domainName: string; triage: "direct" | "dependency" | "reaction" | "negative"; declaration?: string }
): PropagationDomainSweepRow => {
  readPropagationFlow(store, input.flowId);
  if (!DOMAIN_ATLAS.includes(input.domainName as (typeof DOMAIN_ATLAS)[number])) throw new Error(`Unknown domain: ${input.domainName}`);
  if (input.triage === "negative" && !input.declaration?.trim()) throw new Error("negative domains require an explicit declaration");
  const result = store.db.prepare(`
    INSERT INTO propagation_domain_sweeps (flow_id, domain_name, triage, declaration, flow_step)
    VALUES (?, ?, ?, ?, 'propagation:domain-atlas')
    ON CONFLICT(flow_id, domain_name) DO UPDATE SET
      triage = excluded.triage,
      declaration = excluded.declaration,
      flow_step = excluded.flow_step
  `).run(input.flowId, input.domainName, input.triage, input.declaration ?? "");
  store.db.prepare("UPDATE flow_instances SET current_step = 'propagation:domain-atlas' WHERE id = ?").run(input.flowId);
  const row = result.lastInsertRowid
    ? store.db.prepare("SELECT * FROM propagation_domain_sweeps WHERE id = ?").get(result.lastInsertRowid)
    : store.db.prepare("SELECT * FROM propagation_domain_sweeps WHERE flow_id = ? AND domain_name = ?").get(input.flowId, input.domainName);
  return rowToPropagationDomainSweep(row as Record<string, unknown>);
};

export const dispositionPropagationConsequence = (
  store: WorldStore,
  input: { consequenceId: number; disposition: string; note?: string; debtName?: string; preservationBoundary?: string }
): PropagationDispositionRow => {
  const consequence = store.db.prepare("SELECT * FROM propagation_consequences WHERE id = ?").get(input.consequenceId) as Record<string, unknown> | undefined;
  if (!consequence) throw new Error(`Propagation consequence not found: ${input.consequenceId}`);
  assertVocabularyTerm(store, "consequence_disposition", input.disposition);
  let debtRecordId: number | null = null;
  if (input.disposition === "assigned as canon debt") {
    if (!input.debtName?.trim()) throw new Error("assigned-as-debt consequences require a named debt");
    debtRecordId = store.createCanonDebt({ name: input.debtName, scope: "propagation", assignee: "steward", body: input.note ?? String(consequence.body) }).id;
  }
  if (input.disposition === "protected as a mystery boundary" && !input.preservationBoundary?.trim()) {
    throw new Error("protected consequences require an explicit preservation boundary");
  }
  const result = store.db.prepare(`
    INSERT INTO propagation_consequence_dispositions (consequence_id, disposition, note, preservation_boundary, debt_record_id, flow_step)
    VALUES (?, ?, ?, ?, ?, 'propagation:disposition')
  `).run(input.consequenceId, input.disposition, input.note ?? "", input.preservationBoundary ?? null, debtRecordId);
  store.db.prepare("UPDATE flow_instances SET current_step = 'propagation:disposition' WHERE id = ?").run(Number(consequence.flow_id));
  return rowToPropagationDisposition(store.db.prepare("SELECT * FROM propagation_consequence_dispositions WHERE id = ?").get(result.lastInsertRowid) as Record<string, unknown>);
};

export const proposeFactFromPropagation = (
  store: WorldStore,
  input: { flowId: number; title: string; body: string; truthLayer: string }
): { record: RecordRow; queue: AdmissionQueueRow[] } => {
  const flow = readPropagationFlow(store, input.flowId);
  const record = store.createRecord({ recordTypeKey: "canon_fact", title: input.title, body: input.body, truthLayer: input.truthLayer, canonStatus: "proposed" });
  store.db.prepare(`
    INSERT INTO propagation_surfaced_proposals (flow_id, proposal_record_id, report_record_id, flow_step)
    VALUES (?, ?, ?, 'propagation:surface-proposal')
  `).run(input.flowId, record.id, flow.propagation_report_record_id ?? null);
  if (flow.propagation_report_record_id != null) {
    store.createLink(record.id, flow.propagation_report_record_id, "derived_from", "Fact surfaced by propagation report");
  }
  store.db.prepare("UPDATE flow_instances SET current_step = 'propagation:surface-proposal' WHERE id = ?").run(input.flowId);
  recordSweepJurisdiction(store, record.id);
  return { record, queue: store.admissionQueue() };
};

export const skipPropagationStep = (
  store: WorldStore,
  input: { flowId?: number; stepKey: string; admissionLevel?: string; workScale?: string; reason?: string }
): RecordRow => {
  if (requiresSkipReason({ admissionLevel: input.admissionLevel ?? null, workScale: input.workScale ?? null }) && !input.reason?.trim()) {
    throw new Error("major propagation skips require a reason");
  }
  const record = store.recordSkip({ flowId: input.flowId, stepKey: input.stepKey, reason: input.reason });
  if (input.flowId != null) {
    const flow = readPropagationFlow(store, input.flowId);
    store.createLink(record.id, flow.propagation_fact_record_id, "derived_from", "Propagation step declined");
    store.db.prepare("UPDATE flow_instances SET current_step = ? WHERE id = ?").run(`propagation:skip:${input.stepKey}`, input.flowId);
  }
  return record;
};

export const closePropagationRun = (store: WorldStore, flowId: number): { flow: unknown; report: RecordRow; debt: RecordRow | null; missing: PropagationConsequenceRow[] } => {
  const flow = readPropagationFlow(store, flowId);
  const missing = undispositionedHighPressureConsequences(store, flowId);
  if (missing.length) {
    throw new Error(`undispositioned high-pressure consequences: ${missing.map((row) => `#${row.id}`).join(", ")}`);
  }
  return store.db.transaction(() => {
    const report = flow.propagation_report_record_id == null
      ? writePropagationReport(store, flowId)
      : store.getRecord(flow.propagation_report_record_id);
    const fact = store.getRecord(flow.propagation_fact_record_id);
    store.createLink(fact.id, report.id, "digest_of", "Fact card shock-cone digest points to propagation report");
    store.db.prepare("UPDATE propagation_surfaced_proposals SET report_record_id = ? WHERE flow_id = ? AND report_record_id IS NULL").run(report.id, flowId);
    const proposalRows = store.db.prepare("SELECT proposal_record_id FROM propagation_surfaced_proposals WHERE flow_id = ?").all(flowId) as Array<{ proposal_record_id: number }>;
    for (const row of proposalRows) {
      store.createLink(row.proposal_record_id, report.id, "derived_from", "Fact surfaced by propagation report");
    }
    const debt = flow.propagation_debt_record_id == null ? null : store.closeCanonDebt(flow.propagation_debt_record_id);
    store.db.prepare("UPDATE flow_instances SET state = 'complete', current_step = 'propagation:complete', propagation_report_record_id = ? WHERE id = ?").run(report.id, flowId);
    return { flow: store.db.prepare("SELECT * FROM flow_instances WHERE id = ?").get(flowId), report, debt, missing: [] };
  })();
};

export const correctPropagationReport = (
  store: WorldStore,
  input: { originalReportId: number; title?: string; body: string }
): RecordRow => {
  const original = store.getRecord(input.originalReportId);
  if (original.recordTypeKey !== "propagation_report") throw new Error("only propagation reports can be corrected through this route");
  if (!input.body.trim()) throw new Error("propagation report corrections require steward-written prose");
  return store.db.transaction(() => {
    const correction = store.createRecord({
      recordTypeKey: "propagation_report",
      title: input.title ?? `Correction: ${original.shortId}`,
      body: input.body,
      truthLayer: original.truthLayer ?? "Objective canon",
      canonStatus: "accepted"
    });
    store.createLink(correction.id, original.id, "supersedes", "Propagation report correction; original remains append-only");
    return correction;
  })();
};

const writePropagationReport = (store: WorldStore, flowId: number): RecordRow => {
  const flow = readPropagationFlow(store, flowId);
  const fact = store.getRecord(flow.propagation_fact_record_id);
  const consequences = propagationConsequences(store, flowId);
  const domainSweeps = propagationDomainSweeps(store, flowId);
  const dispositions = propagationDispositions(store, flowId);
  const dispositionByConsequence = new Map(dispositions.map((disposition) => [disposition.consequenceId, disposition]));
  const proposalRows = store.db.prepare(`
    SELECT proposal_record_id
    FROM propagation_surfaced_proposals
    WHERE flow_id = ?
    ORDER BY id
  `).all(flowId) as Array<{ proposal_record_id: number }>;
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
