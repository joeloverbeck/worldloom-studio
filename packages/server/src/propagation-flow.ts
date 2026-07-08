import { isFoundationalSeverity, isMajorOrHigher, type DeclaredSeverity } from "./severity-policy.js";
import { intakeProposedFact } from "./admission-flow.js";
import { ADVISORY_OUTPUT_LABELS, promptMode, withPromptModeSummaries, type DecisionPointPromptMode, type DecisionPointSharedContract } from "./decision-point-contract.js";
import { methodCard, methodCardDoctrineSlots, methodCardSourceManifest, methodCardsForFlow } from "./method-cards.js";
import * as PromptOut from "./prompt-out.js";
import type { AdmissionQueueRow, FacetRow, RecordRow, WorldFile } from "./world-file.js";

interface RecordRef {
  id: number;
  shortId: string;
  recordTypeKey: string;
  title: string;
  body: string;
  truthLayer: string | null;
  canonStatus: string | null;
}

interface PropagationActionRoute {
  method: "POST";
  href: string;
  body: { factRecordId: number; debtRecordId?: number };
}

export interface PropagationQueueRow extends RecordRow {
  scope: string;
  state: string;
  owedItem: RecordRef;
  sourceFact: RecordRef | null;
  route: PropagationActionRoute | null;
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

interface PropagationCoverageObligations extends PropagationCoveragePolicy {
  severityClass: "foundational" | "major-or-higher" | "lower";
  requiredDomainStates: Array<PropagationDomainSweepRow["triage"]>;
  requiredOrders: string[];
}

const PROPAGATION_ORDERS = [
  ["zeroth", "Zeroth-order: definition"],
  ["first", "First-order: direct effects"],
  ["second", "Second-order: adaptations"],
  ["third", "Third-order: institutionalization"],
  ["fourth", "Fourth-order: historical and cultural residue"],
  ["fifth", "Fifth-order: identity and metaphysics"]
] as const;

const PROPAGATION_PROTOCOL = "docs/worldbuilding-system/07_propagation_engine.md";
const DOMAIN_ATLAS_PROTOCOL = "docs/worldbuilding-system/04_domain_atlas.md";
const AI_WORKFLOW_PROTOCOL = "docs/worldbuilding-system/20_ai_assisted_workflow.md";
const PROMPT_TEMPLATE_KEY = "propagation_consequence_scout";

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

const propagationCoverageObligations = (severity: DeclaredSeverity): PropagationCoverageObligations => {
  const policy = propagationCoveragePolicy(severity);
  if (isFoundationalSeverity(severity)) {
    return {
      ...policy,
      severityClass: "foundational",
      requiredDomainStates: ["direct", "dependency", "reaction", "negative"],
      requiredOrders: ["zeroth", "first", "second", "third", "fourth", "fifth"]
    };
  }
  if (isMajorOrHigher(severity)) {
    return {
      ...policy,
      severityClass: "major-or-higher",
      requiredDomainStates: ["direct", "dependency", "reaction"],
      requiredOrders: ["multiple shock-cone orders"]
    };
  }
  return {
    ...policy,
    severityClass: "lower",
    requiredDomainStates: ["direct"],
    requiredOrders: ["immediate-effect consequence"]
  };
};

const recordRef = (record: RecordRow): RecordRef => ({
  id: record.id,
  shortId: record.shortId,
  recordTypeKey: record.recordTypeKey,
  title: record.title,
  body: record.body,
  truthLayer: record.truthLayer,
  canonStatus: record.canonStatus
});

const parseSourceFactId = (body: string): number | null => {
  const match = body.match(/\b(?:source fact id|fact id|record id):\s*(\d+)\b/i);
  return match ? Number(match[1]) : null;
};

const sourceFactForPropagationDebt = (store: WorldFile, debt: RecordRow): RecordRow | null => {
  for (const link of store.listLinks(debt.id)) {
    const candidateId = link.fromRecordId === debt.id ? link.toRecordId : link.fromRecordId;
    if (candidateId === debt.id) continue;
    const candidate = store.getRecord(candidateId);
    if (candidate.recordTypeKey === "canon_fact" && link.linkTypeKey === "derived_from") return candidate;
  }
  const parsedId = parseSourceFactId(debt.body);
  if (parsedId == null) return null;
  const candidate = store.getRecord(parsedId);
  return candidate.recordTypeKey === "canon_fact" ? candidate : null;
};

const owedDebtForFlow = (store: WorldFile, flow: PropagationFlowRow): RecordRow | null =>
  flow.propagation_debt_record_id == null ? null : store.getRecord(flow.propagation_debt_record_id);

const severityForRecord = (store: WorldFile, recordId: number): DeclaredSeverity =>
  declaredSeverityFromFacets(store.listFacets(recordId));

const severityExpectation = (severity: DeclaredSeverity): string => {
  const obligations = propagationCoverageObligations(severity);
  if (obligations.severityClass === "foundational") return "Foundational facts owe all six orders and the full fourteen-domain atlas.";
  if (obligations.severityClass === "major-or-higher") return "Major-or-higher facts owe multiple orders plus direct, dependency, and reaction domains.";
  return "Lower-severity facts owe an immediate consequence and at least one ordinary-life or direct domain check.";
};

const orderControls = (
  severity: DeclaredSeverity,
  consequences: PropagationConsequenceRow[],
  currentStep = "propagation:entry"
) => {
  const expectation = severityExpectation(severity);
  return PROPAGATION_ORDERS.map(([key, label]) => {
    const rows = consequences.filter((row) => row.orderKey === key);
    return {
      key,
      label,
      current: currentStep.includes(key),
      doctrine: methodCard("propagation.shock-cone-orders").operativeRule,
      severityExpectation: expectation,
      consequenceCount: rows.length,
      pressureLevels: [...new Set(rows.map((row) => row.pressure))]
    };
  });
};

const domainAtlasControls = (domainSweeps: PropagationDomainSweepRow[]) =>
  DOMAIN_ATLAS.map((name) => {
    const sweep = domainSweeps.find((row) => row.domainName === name);
    return {
      name,
      state: sweep?.triage ?? "unswept",
      declaration: sweep?.declaration ?? "",
      doctrine: methodCard("propagation.domain-atlas").operativeRule
    };
  });

const skipRecordsForFlow = (store: WorldFile, flowId: number): RecordRow[] =>
  store.listRecords().filter((record) =>
    record.recordTypeKey === "skip_record"
    && record.body.includes("Flow: propagation")
    && record.body.includes(`Flow id: ${flowId}`)
  );

const linkedDispositionDebtRecords = (store: WorldFile, dispositions: PropagationDispositionRow[]): RecordRow[] =>
  dispositions
    .filter((row) => row.debtRecordId != null)
    .map((row) => store.getRecord(row.debtRecordId!));

const propagationMethodCardForStep = (stepKey: string) => {
  if (stepKey.includes("domain")) return methodCard("propagation.domain-atlas");
  if (stepKey.includes("disposition")) return methodCard("propagation.disposition");
  if (stepKey.includes("proposal")) return methodCard("propagation.proposals");
  if (stepKey.includes("close") || stepKey.includes("complete")) return methodCard("propagation.close");
  if (["zeroth", "first", "second", "third", "fourth", "fifth"].some((order) => stepKey.includes(order))) {
    return methodCard("propagation.shock-cone-orders");
  }
  return methodCard("propagation.entry");
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

const coverageBlockers = (store: WorldFile, flow: PropagationFlowRow): DecisionPointSharedContract["blockers"] => {
  const severity = severityForRecord(store, flow.propagation_fact_record_id);
  const obligations = propagationCoverageObligations(severity);
  const consequences = propagationConsequences(store, flow.id);
  const sweeps = propagationDomainSweeps(store, flow.id);
  const blockers: DecisionPointSharedContract["blockers"] = [];
  const orderKeys = new Set(consequences.map((row) => row.orderKey));
  const sweptDomains = new Set(sweeps.map((row) => row.domainName));
  const triageStates = new Set(sweeps.map((row) => row.triage));

  if (obligations.severityClass === "foundational") {
    if (orderKeys.size < PROPAGATION_ORDERS.length) {
      blockers.push({
        key: "missing-foundational-orders",
        label: "Missing foundational shock-cone orders",
        message: "Foundational propagation requires all six shock-cone orders before close.",
        requires: "zeroth through fifth order consequences",
        classification: "coverage"
      });
    }
    const unswept = DOMAIN_ATLAS.filter((domainName) => !sweptDomains.has(domainName));
    if (unswept.length) {
      blockers.push({
        key: "missing-full-domain-atlas",
        label: "Missing full domain-atlas sweep",
        message: `Foundational propagation still has ${unswept.length} unswept domain-atlas domains.`,
        requires: "all fourteen domain-atlas domains",
        classification: "coverage"
      });
    }
    return blockers;
  }

  if (obligations.severityClass === "major-or-higher") {
    if (orderKeys.size < 2) {
      blockers.push({
        key: "missing-shock-cone-orders",
        label: "Missing multiple shock-cone orders",
        message: "Major-or-higher propagation requires consequences in at least two shock-cone orders.",
        requires: "multiple shock-cone orders",
        classification: "coverage"
      });
    }
    for (const triage of obligations.requiredDomainStates) {
      if (!triageStates.has(triage)) {
        blockers.push({
          key: `missing-domain-${triage}`,
          label: `Missing ${triage} domain coverage`,
          message: `Major-or-higher propagation requires at least one ${triage} domain-atlas declaration.`,
          requires: `${triage} domain-atlas state`,
          classification: "coverage"
        });
      }
    }
    return blockers;
  }

  if (!consequences.length) {
    blockers.push({
      key: "missing-immediate-effect",
      label: "Missing immediate consequence",
      message: "Lower-severity propagation still requires at least one steward-authored consequence.",
      requires: "immediate-effect consequence",
      classification: "coverage"
    });
  }
  if (!sweeps.length) {
    blockers.push({
      key: "missing-ordinary-life-domain",
      label: "Missing domain coverage",
      message: "Lower-severity propagation still requires at least one domain-atlas declaration when relevant.",
      requires: "domain-atlas coverage",
      classification: "coverage"
    });
  }
  return blockers;
};

const propagationCloseBlockers = (store: WorldFile, flowId: number): DecisionPointSharedContract["blockers"] => {
  const flow = readPropagationFlow(store, flowId);
  return [
    ...coverageBlockers(store, flow),
    ...undispositionedHighPressureConsequences(store, flowId).map((row) => ({
      key: "undispositioned-high-pressure",
      label: "Undispositioned high-pressure consequence",
      message: `High-pressure consequence #${row.id} must be answered, scoped out, assigned as canon debt, or protected as a mystery boundary before close.`,
      requires: "consequence disposition",
      classification: "stopping-rule"
    }))
  ];
};

const propagationCloseReadiness = (store: WorldFile, flowId: number) => {
  const blockers = propagationCloseBlockers(store, flowId);
  return {
    status: blockers.length ? "blocked" : "ready",
    blockers
  };
};

const propagationPromptModes = (
  record: RecordRow,
  options: { flowId?: number; stepKey: string }
): DecisionPointPromptMode[] => {
  const commonBody = {
    flowKey: "propagation",
    flowId: options.flowId,
    recordId: record.id,
    templateKey: PROMPT_TEMPLATE_KEY,
    stepKey: options.stepKey
  };
  const hasMaterial = Boolean(record.body.trim());
  return withPromptModeSummaries([
    promptMode({
      mode: "proposal",
      label: "Proposal mode",
      available: true,
      blocker: null,
      framing: `Request labeled propagation candidates for ${record.shortId}; adoption remains steward authorship and routes onward as proposed work.`,
      role: "Propagation proposal",
      templateKey: PROMPT_TEMPLATE_KEY,
      stepKey: options.stepKey,
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
      blocker: hasMaterial ? null : "Pressure prompts require steward-authored source fact material.",
      framing: "Ask for consequences, adaptations, countermeasures, quiet domains, fossils, and assumptions without admitting new facts.",
      role: "Consequence scout",
      templateKey: PROMPT_TEMPLATE_KEY,
      stepKey: options.stepKey,
      outputLabels: ADVISORY_OUTPUT_LABELS,
      stepRequest: hasMaterial
        ? {
            method: "POST",
            href: "/api/prompt-out/steps",
            body: { ...commonBody, mode: "pressure", label: "Consequence scout" }
          }
        : null
    })
  ]);
};

const propagationDecisionPoint = (
  store: WorldFile,
  input: { recordId: number; flowId?: number; runState?: string; currentStep?: string; blockers?: DecisionPointSharedContract["blockers"] }
): { sharedContract: DecisionPointSharedContract } => {
  const record = store.getRecord(input.recordId);
  const severity = declaredSeverityFromFacets(store.listFacets(record.id));
  const coverage = propagationCoveragePolicy(severity);
  const currentStep = input.currentStep ?? "propagation:entry";
  const cardValue = propagationMethodCardForStep(currentStep);
  const displayed = [
    `Source fact: ${record.shortId} ${record.title}`,
    record.body,
    `Admission level: ${severity.admissionLevel ?? "unset"}`,
    `Work scale: ${severity.workScale ?? "unset"}`,
    `Required coverage: ${coverage.requiredCoverage}`,
    `Current step: ${currentStep}`
  ].filter(Boolean);
  const modes = propagationPromptModes(record, { flowId: input.flowId, stepKey: currentStep });
  return {
    sharedContract: {
      contractVersion: "decision-point/v1",
      methodCard: cardValue,
      flow: { key: "propagation", runState: input.runState ?? "not_started" },
      step: {
        key: currentStep,
        localDecision: cardValue.decision,
        packageSource: PROPAGATION_PROTOCOL,
        why: "Propagation turns an accepted fact into worked causal pressure while leaving canon standing changes to Admission."
      },
      obligations: {
        required: [
          "Start from a canon fact or propagation-scoped canon debt",
          `Work the required coverage path: ${coverage.requiredCoverage}`,
          "Disposition every high-pressure consequence before close"
        ],
        optional: ["Route surfaced consequences as proposed facts when the pass creates new canon work"],
        skippable: ["Prompt-out advisory support can be declined with a skip_record"],
        severityDependent: [
          "Major-or-higher facts require multiple orders and direct/dependency/reaction domains",
          "Foundational facts require a full domain-atlas sweep"
        ]
      },
      skipRule: {
        offered: true,
        reasonRequired: isMajorOrHigher(severity),
        reasonThreshold: "major-or-higher propagation work",
        recordType: "skip_record"
      },
      doctrine: {
        slots: methodCardDoctrineSlots(cardValue),
        packageSources: [PROPAGATION_PROTOCOL, DOMAIN_ATLAS_PROTOCOL, AI_WORKFLOW_PROTOCOL]
      },
      bearingContext: {
        displayed,
        sourceManifest: [
          `Source fact: ${record.shortId} ${record.title}`,
          ...methodCardSourceManifest(cardValue)
        ],
        omissions: ["Cross-flow consequences remain proposed or canon-debt routed until the steward works the receiving flow."]
      },
      promptOut: { serverOwned: true, modes },
      blockers: input.blockers ?? [],
      substanceValidations: [
        "High-pressure consequences must reach an explicit stopping state before close.",
        "Negative domain declarations require steward-authored explanation when recorded."
      ],
      writeIntent: {
        willWrite: ["propagation consequence, domain, disposition, skip, and close-report records when the steward acts"],
        willLink: ["digest and derived_from links from the source fact, report, proposals, and governed skips"],
        willQueue: ["canon debt when a consequence is assigned as follow-up work"],
        willRouteOnward: ["surfaced facts route to Admission as proposed", "protected mystery boundaries route to Stage 13"],
        willLeaveUntouched: ["Propagation never admits facts", "accepted source canon standing remains unchanged by the propagation pass"]
      },
      nextOrResumeState: {
        currentStep,
        nextStep: input.blockers?.length ? "disposition high-pressure consequences" : "continue shock cone, domain sweep, or close readiness",
        safeExit: "Return to the workflow map; this propagation run can be resumed."
      },
      readSideTrail: [
        { label: "Source fact", href: `/api/canon-workbench/records/${record.id}`, recordId: record.id },
        { label: "Current Canon", href: "/api/canon-workbench/current" },
        { label: "Audit Trail", href: "/api/canon-workbench/audit" }
      ]
    }
  };
};

const propagationReadSideTrail = (store: WorldFile, flowId: number) => {
  const flow = readPropagationFlow(store, flowId);
  const fact = store.getRecord(flow.propagation_fact_record_id);
  const debt = owedDebtForFlow(store, flow);
  const dispositions = propagationDispositions(store, flowId);
  const proposalRows = store.propagationSurfacedProposals(flowId) as Array<{ proposal_record_id: number; report_record_id: number | null }>;
  const report = flow.propagation_report_record_id == null ? null : store.getRecord(flow.propagation_report_record_id);
  return [
    { label: "Source fact", href: `/api/canon-workbench/records/${fact.id}`, recordId: fact.id },
    ...(report
      ? [
          { label: "Propagation report", href: `/api/canon-workbench/records/${report.id}`, recordId: report.id },
          { label: "Source fact digest link", href: `/api/canon-workbench/records/${fact.id}`, recordId: fact.id }
        ]
      : []),
    ...(debt ? [{ label: "Owed propagation debt", href: `/api/canon-workbench/records/${debt.id}`, recordId: debt.id }] : []),
    ...proposalRows.map((row) => {
      const proposal = store.getRecord(row.proposal_record_id);
      return { label: "Surfaced proposal", href: `/api/canon-workbench/records/${proposal.id}`, recordId: proposal.id };
    }),
    ...linkedDispositionDebtRecords(store, dispositions).map((record) => ({
      label: "Follow-up canon debt",
      href: `/api/canon-workbench/records/${record.id}`,
      recordId: record.id
    })),
    ...dispositions.filter((row) => row.preservationBoundary).map((row) => ({
      label: "Protected boundary",
      href: "/api/contradiction/owed-boundaries",
      recordId: row.consequenceId
    })),
    ...skipRecordsForFlow(store, flowId).map((record) => ({
      label: "Skip record",
      href: `/api/canon-workbench/records/${record.id}`,
      recordId: record.id
    })),
    { label: "Current Canon", href: "/api/canon-workbench/current" },
    { label: "Audit Trail", href: "/api/canon-workbench/audit" }
  ];
};

const propagationClosePreview = (store: WorldFile, flowId: number) => {
  const flow = readPropagationFlow(store, flowId);
  const fact = store.getRecord(flow.propagation_fact_record_id);
  const report = flow.propagation_report_record_id == null ? null : store.getRecord(flow.propagation_report_record_id);
  const dispositions = propagationDispositions(store, flowId);
  const proposalRows = store.propagationSurfacedProposals(flowId) as Array<{ proposal_record_id: number; report_record_id: number | null }>;
  const skipRecords = skipRecordsForFlow(store, flowId);
  return {
    status: propagationCloseReadiness(store, flowId).status,
    blockers: propagationCloseBlockers(store, flowId),
    willWrite: [
      report
        ? `read existing append-only propagation report ${report.shortId}`
        : `append-only propagation report for ${fact.shortId}`,
      "source fact digest link",
      "report provenance links for surfaced proposals",
      ...(flow.propagation_debt_record_id == null ? [] : ["close the owed propagation debt that started this run"]),
      ...(skipRecords.length ? ["skip records remain linked in the audit trail"] : [])
    ],
    existingRecords: [
      ...(report ? [{ kind: "propagation report", recordId: report.id, title: report.title }] : []),
      ...proposalRows.map((row) => {
        const proposal = store.getRecord(row.proposal_record_id);
        return { kind: "surfaced proposal", recordId: proposal.id, title: proposal.title, canonStatus: proposal.canonStatus };
      }),
      ...linkedDispositionDebtRecords(store, dispositions).map((record) => ({
        kind: "follow-up canon debt",
        recordId: record.id,
        title: record.title,
        canonStatus: record.canonStatus
      })),
      ...dispositions.filter((row) => row.preservationBoundary).map((row) => ({
        kind: "protected boundary",
        recordId: row.consequenceId,
        title: row.preservationBoundary
      })),
      ...skipRecords.map((record) => ({ kind: "skip record", recordId: record.id, title: record.title }))
    ],
    willLeaveUntouched: [
      "source canon standing remains unchanged",
      "proposed facts remain proposed until Admission works them",
      "advisory artifacts remain advisory unless explicitly linked by steward use"
    ],
    readSideTrail: propagationReadSideTrail(store, flowId)
  };
};

export const propagationQueue = (store: WorldFile): PropagationQueueRow[] =>
  store.propagationQueueRecordIds().map((id) => {
    const record = store.getRecord(id);
    const sourceFact = sourceFactForPropagationDebt(store, record);
    return {
      ...record,
      scope: "propagation",
      state: "open",
      owedItem: recordRef(record),
      sourceFact: sourceFact == null ? null : recordRef(sourceFact),
      route: sourceFact == null
        ? null
        : {
            method: "POST",
            href: "/api/propagation/runs/start",
            body: { factRecordId: sourceFact.id, debtRecordId: record.id }
          }
    };
  });

export const propagationPlan = (store: WorldFile, recordId: number, options: { flowId?: number; currentStep?: string } = {}): unknown => {
  const record = store.getRecord(recordId);
  const facets = store.listFacets(recordId);
  const severity = declaredSeverityFromFacets(facets);
  const coverage = propagationCoveragePolicy(severity);
  const obligations = propagationCoverageObligations(severity);
  const consequences = options.flowId == null ? [] : propagationConsequences(store, options.flowId);
  const domainSweeps = options.flowId == null ? [] : propagationDomainSweeps(store, options.flowId);
  return {
    record,
    sourceFact: recordRef(record),
    admissionLevel: severity.admissionLevel,
    workScale: severity.workScale,
    severityPath: severity,
    requiredCoverage: coverage.requiredCoverage,
    requiredDomainCount: coverage.requiredDomainCount === "all" ? DOMAIN_ATLAS.length : coverage.requiredDomainCount,
    coverageObligations: {
      ...obligations,
      requiredDomainCount: obligations.requiredDomainCount === "all" ? DOMAIN_ATLAS.length : obligations.requiredDomainCount
    },
    orders: PROPAGATION_ORDERS.map(([key, label]) => ({ key, label })),
    domains: DOMAIN_ATLAS,
    orderControls: orderControls(severity, consequences, options.currentStep),
    domainAtlas: domainAtlasControls(domainSweeps),
    methodCard: methodCard("propagation.entry"),
    methodCards: methodCardsForFlow("propagation"),
    decisionPoint: propagationDecisionPoint(store, { recordId, flowId: options.flowId, currentStep: options.currentStep }),
    doctrine: {
      mechanisms: "docs/worldbuilding-system/07_propagation_engine.md#propagation-mechanisms",
      signatureTests: ["why not everywhere?", "why not used by enemies?", "where are the fossils?"],
      stoppingRules: ["answered", "intentionally scoped out", "assigned as canon debt", "protected as a mystery boundary"],
      domainAtlas: "docs/worldbuilding-system/04_domain_atlas.md"
    }
  };
};

export const startPropagationRun = (store: WorldFile, input: { factRecordId?: number; debtRecordId?: number }): unknown => {
  let factRecordId = input.factRecordId;
  if (input.debtRecordId != null) {
    const debt = store.getRecord(input.debtRecordId);
    if (debt.recordTypeKey !== "canon_debt") throw new Error("propagation debt must be a canon debt record");
    const queueItem = propagationQueue(store).find((row) => row.id === debt.id);
    if (!queueItem) throw new Error("debt is not an open propagation-scoped debt item");
    if (queueItem.sourceFact != null && factRecordId != null && factRecordId !== queueItem.sourceFact.id) {
      throw new Error("source fact does not match propagation debt identity");
    }
    factRecordId = queueItem.sourceFact?.id ?? factRecordId;
  }
  if (factRecordId == null) throw new Error("propagation run requires a source fact");
  const fact = store.getRecord(factRecordId);
  const existing = store.findInProgressPropagationFlow(fact.id, input.debtRecordId);
  if (existing) return existing;
  return store.createFlowInstance({ flowKey: "propagation", currentStep: "propagation:entry", propagationFactRecordId: fact.id, propagationDebtRecordId: input.debtRecordId ?? null });
};

export const getPropagationRun = (store: WorldFile, flowId: number): unknown => {
  const flow = readPropagationFlow(store, flowId);
  const stepKey = String(flow.current_step ?? "propagation:entry");
  const blockers = propagationCloseBlockers(store, flowId);
  const sourceFact = store.getRecord(flow.propagation_fact_record_id);
  const owedDebt = owedDebtForFlow(store, flow);
  const severity = severityForRecord(store, flow.propagation_fact_record_id);
  return {
    flow,
    sourceFact: recordRef(sourceFact),
    owedDebt: owedDebt == null ? null : recordRef(owedDebt),
    severityPath: severity,
    coverageObligations: propagationCoverageObligations(severity),
    closeReadiness: propagationCloseReadiness(store, flowId),
    closePreview: propagationClosePreview(store, flowId),
    readSideTrail: propagationReadSideTrail(store, flowId),
    plan: propagationPlan(store, flow.propagation_fact_record_id, { flowId, currentStep: stepKey }),
    methodCard: propagationMethodCardForStep(stepKey),
    methodCards: methodCardsForFlow("propagation"),
    decisionPoint: propagationDecisionPoint(store, {
      recordId: flow.propagation_fact_record_id,
      flowId,
      runState: flow.state,
      currentStep: stepKey,
      blockers
    }),
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
    store.createLinkIfMissing(debtRecordId, Number(consequence.fact_record_id), "derived_from", "Propagation follow-up debt preserves source fact");
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

export const closePropagationRun = (store: WorldFile, flowId: number): { flow: unknown; report: RecordRow; debt: RecordRow | null; missing: PropagationConsequenceRow[]; closePreview: unknown; readSideTrail: unknown[] } => {
  const flow = readPropagationFlow(store, flowId);
  const blockers = propagationCloseBlockers(store, flowId);
  if (blockers.length) {
    throw new Error(`missing propagation coverage or dispositions: ${blockers.map((row) => row.key).join(", ")}`);
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
    return {
      flow: updatedFlow,
      report,
      debt,
      missing: [],
      closePreview: propagationClosePreview(store, flowId),
      readSideTrail: propagationReadSideTrail(store, flowId)
    };
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
