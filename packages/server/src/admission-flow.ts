import {
  isCatastrophicSeverity,
  isFoundationalSeverity,
  isMajorOrHigher,
  requiresSkipReason,
  type DeclaredSeverity
} from "./severity-policy.js";
import { ADVISORY_OUTPUT_LABELS, promptMode, splitDisplayedContext, withPromptModeSummaries, type DecisionPointPromptMode, type DecisionPointSharedContract } from "./decision-point-contract.js";
import { methodCard, methodCardDoctrineSlots, methodCardSourceManifest } from "./method-cards.js";
import * as PromptOut from "./prompt-out.js";
import type { MethodCard } from "@worldloom/shared";
import type { AdmissionQueueRow, FacetRow, LinkRow, RecordRow, WorldFile } from "./world-file.js";

export type AdmissionGatePath = "minor_ledger" | "full_gate";

export interface AdmissionGatePolicy {
  path: AdmissionGatePath;
  doctrine: string[];
  steps: string[];
}

export interface AdmissionValidationError {
  key: string;
  message: string;
}

export interface AdmissionGateSection {
  key: string;
  label: string;
  required: boolean;
  canMarkNotApplicable: boolean;
  quietDomain: boolean;
  guidance: string;
  doctrine: string;
}

export interface AdmissionFullGateSectionInput {
  key: string;
  substance?: string;
  notApplicableReason?: string;
  quietDomainDeclaration?: string;
}

export interface AdmissionAdvisoryArtifactRef {
  id: number;
  shortId: string;
  title: string;
  stepKey: string;
}

export interface AdmissionFullGateContract {
  sections: AdmissionGateSection[];
  allowedNextCanonStatuses: string[];
  operationOptions: string[];
  constraintTagOptions: string[];
  validationErrors: AdmissionValidationError[];
  completionAction: { method: "POST"; href: "/api/admission/gate/complete" };
  advisoryArtifacts: AdmissionAdvisoryArtifactRef[];
  writePreview: {
    recordId: number;
    writes: string[];
    links: string[];
  };
  readSideTrail: AdmissionDecisionReference[];
}

export interface AdmissionQueueSortKey {
  workScaleRank: number;
  admissionLevelRank: number;
}

export interface AdmissionDecisionReference {
  label: string;
  href: string;
}

export type AdmissionDecisionSourceLink = LinkRow & {
  target: { id: number; shortId: string; title: string; recordTypeKey: string } | null;
};

export interface AdmissionQueueDecisionRow extends AdmissionQueueRow {
  decisionPointHref: string;
  sourceLinks: AdmissionDecisionSourceLink[];
}

export interface AdmissionDecisionWork {
  required: string[];
  optional: string[];
  skippable: string[];
  severityDependent: string[];
}

export interface AdmissionDecisionPayload {
  methodCard: MethodCard;
  flow: {
    key: "admission";
    runState: string;
  };
  currentStep: string;
  nextOrResumeState: {
    currentStep: string;
    nextStep: string;
    safeExit: string;
  };
  localDecision: string;
  packageAuthority: {
    primary: string;
    why: string;
    citations: string[];
  };
  selectedRecord: AdmissionQueueRow & {
    sourceLinks: AdmissionDecisionSourceLink[];
  };
  severity: {
    admissionLevel: string | null;
    workScale: string | null;
    gatePath: AdmissionGatePath | null;
    definitions: Array<{ key: "admission_level" | "work_scale"; term: string; definition: string; source: string }>;
    obligations: string[];
  };
  work: AdmissionDecisionWork;
  doctrineCitations: string[];
  blockers: Array<{ key: string; label: string; message: string; requires: string }>;
  skipRule: {
    offered: boolean;
    reasonRequired: boolean;
    reasonThreshold: string;
    belowThresholdNote: string;
    recordType: "skip_record";
  };
  seedAudit: {
    offered: boolean;
    doctrine: string[];
    runWrites: string;
    declineWrites: string;
    nonMutation: string;
  };
  promptOut: {
    advisory: "optional";
    templateKey: string;
    stepKey: string;
    role: string;
    modes: DecisionPointPromptMode[];
    stepRequest: {
      method: "POST";
      href: "/api/prompt-out/steps";
      body: {
        flowKey: "admission";
        templateKey: string;
        recordId: number;
        stepKey: string;
        mode?: "proposal" | "pressure";
        label: string;
        admissionLevel?: string;
        workScale?: string;
      };
    };
    preview: {
      currentDecision: string;
      promptText: string;
      sourceManifest: string[];
      contextPreview: string;
      omissions: string[];
      advisoryCanonWarning: string;
      currentness: {
        state: "not_loaded";
        label: string;
        loadedMode: null;
        currentPacketActions: "disabled";
        loadAction: string;
      };
    };
  };
  writeIntent: {
    willWrite: string[];
    willLink: string[];
    willQueue: string[];
    willLeaveUntouched: string[];
    willRouteOnward: string[];
  };
  closePreview: {
    beforeCompletion: string[];
    afterCompletion: string[];
  };
  readSideTrail: AdmissionDecisionReference[];
  fullGateContract: AdmissionFullGateContract | null;
  sharedContract: DecisionPointSharedContract;
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

const ADMISSION_LEVEL_DEFINITIONS: Record<string, string> = {
  "0": "Trivial or bookkeeping admission; still steward-declared and recorded.",
  "1": "Minor admission level; fast ledger work is usually enough.",
  "2": "Moderate admission level; minor work plus targeted cost, access, constraint, or ripple checks.",
  "3": "Major admission level; full canon fact gate and written consequence substance are owed.",
  "4": "Severe/foundational admission level; full gate plus temporal, spatial, branch, mystery, aesthetic, and QA follow-up pressure.",
  "5": "Catastrophic admission level; full gate plus explicit decision-record and rollback or branch planning pressure."
};

const WORK_SCALE_DEFINITIONS: Record<string, string> = {
  minor: "Small local fact; batch ledger path should remain cheap.",
  moderate: "Moderate change; targeted extra checks can be required.",
  major: "Major dependency-bearing change; full gate substance and skip reasons are required.",
  severe: "Foundational change; open canon debt warns and deeper follow-up work is expected.",
  catastrophic: "World-scale or rollback-risk change; explicit decision and branch/rollback planning are expected."
};

const decisionPointHref = (recordId: number): string => `/api/admission/records/${recordId}/decision-point`;

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

const FULL_GATE_SECTION_CONTRACTS: Record<string, AdmissionGateSection> = {
  "fact statement": {
    key: "fact_statement",
    label: "Fact statement",
    required: true,
    canMarkNotApplicable: false,
    quietDomain: false,
    guidance: "State the fact being admitted in steward-authored wording.",
    doctrine: "docs/worldbuilding-system/checklists/canon_fact_gate.md"
  },
  scope: {
    key: "scope",
    label: "Scope",
    required: false,
    canMarkNotApplicable: false,
    quietDomain: false,
    guidance: "Name the continuity scope when the record body does not already make it clear.",
    doctrine: "docs/worldbuilding-system/06_canon_fact_admission_protocol.md"
  },
  type: {
    key: "type",
    label: "Type",
    required: false,
    canMarkNotApplicable: false,
    quietDomain: false,
    guidance: "Confirm what kind of canon record is being admitted.",
    doctrine: "docs/worldbuilding-system/06_canon_fact_admission_protocol.md"
  },
  "truth layer": {
    key: "truth_layer",
    label: "Truth layer",
    required: false,
    canMarkNotApplicable: false,
    quietDomain: false,
    guidance: "Confirm the steward-selected truth layer; do not infer it from Prompt-out.",
    doctrine: "docs/worldbuilding-system/06_canon_fact_admission_protocol.md"
  },
  "canon status": {
    key: "canon_status",
    label: "Canon status",
    required: false,
    canMarkNotApplicable: false,
    quietDomain: false,
    guidance: "Choose an allowed next canon status from the server contract.",
    doctrine: "docs/worldbuilding-system/06_canon_fact_admission_protocol.md"
  },
  "constraint tags": {
    key: "constraint_tags",
    label: "Constraint tags",
    required: false,
    canMarkNotApplicable: false,
    quietDomain: false,
    guidance: "Keep tags separate from the canon status and only use steward-selected vocabulary terms.",
    doctrine: "docs/worldbuilding-system/06_canon_fact_admission_protocol.md"
  },
  dependencies: {
    key: "dependencies",
    label: "Dependencies",
    required: true,
    canMarkNotApplicable: true,
    quietDomain: false,
    guidance: "Dependencies require steward-authored substance or an explicit not-applicable reason.",
    doctrine: "docs/worldbuilding-system/checklists/canon_fact_gate.md"
  },
  "costs/access/bottlenecks": {
    key: "costs_access_bottlenecks",
    label: "Costs/access/bottlenecks",
    required: true,
    canMarkNotApplicable: true,
    quietDomain: false,
    guidance: "Name costs, access limits, and bottlenecks created by this admission.",
    doctrine: "docs/worldbuilding-system/checklists/canon_fact_gate.md"
  },
  "shock-cone summary": {
    key: "shock_cone_summary",
    label: "Shock-cone summary",
    required: true,
    canMarkNotApplicable: false,
    quietDomain: false,
    guidance: "Summarize the expected ripple cone before canon standing changes.",
    doctrine: "docs/worldbuilding-system/checklists/canon_fact_gate.md"
  },
  "institutions or quiet-domain declaration": {
    key: "institutions_or_quiet_domain_declaration",
    label: "Institutions or quiet-domain declaration",
    required: true,
    canMarkNotApplicable: false,
    quietDomain: true,
    guidance: "Name affected institutions or explicitly declare that no quiet domain is implicated.",
    doctrine: "docs/worldbuilding-system/checklists/canon_fact_gate.md"
  },
  "evidence/belief note": {
    key: "evidence_belief_note",
    label: "Evidence/belief note",
    required: true,
    canMarkNotApplicable: true,
    quietDomain: false,
    guidance: "Record evidence, belief state, or why that evidence is not applicable.",
    doctrine: "docs/worldbuilding-system/checklists/canon_fact_gate.md"
  },
  "contradiction and mystery risk": {
    key: "contradiction_and_mystery_risk",
    label: "Contradiction and mystery risk",
    required: true,
    canMarkNotApplicable: true,
    quietDomain: false,
    guidance: "Name contradiction or mystery risks before the fact is admitted.",
    doctrine: "docs/worldbuilding-system/checklists/canon_fact_gate.md"
  },
  "follow-up debt": {
    key: "follow_up_debt",
    label: "Follow-up debt",
    required: true,
    canMarkNotApplicable: true,
    quietDomain: false,
    guidance: "Name follow-up debt or explain why none is owed.",
    doctrine: "docs/worldbuilding-system/checklists/canon_fact_gate.md"
  },
  "temporal/spatial passes": {
    key: "temporal_spatial_passes",
    label: "Temporal/spatial passes",
    required: true,
    canMarkNotApplicable: true,
    quietDomain: false,
    guidance: "Run temporal and spatial pressure on foundational admissions.",
    doctrine: "docs/worldbuilding-system/checklists/canon_fact_gate.md"
  },
  "branch implications": {
    key: "branch_implications",
    label: "Branch implications",
    required: false,
    canMarkNotApplicable: true,
    quietDomain: false,
    guidance: "Name branch implications or mark the section not applicable with a reason.",
    doctrine: "docs/worldbuilding-system/checklists/canon_fact_gate.md"
  },
  "mystery/aesthetic checks": {
    key: "mystery_aesthetic_checks",
    label: "Mystery/aesthetic checks",
    required: true,
    canMarkNotApplicable: true,
    quietDomain: false,
    guidance: "Preserve intended mystery and aesthetic pressure before admitting foundational facts.",
    doctrine: "docs/worldbuilding-system/checklists/canon_fact_gate.md"
  },
  "QA follow-up": {
    key: "qa_follow_up",
    label: "QA follow-up",
    required: true,
    canMarkNotApplicable: true,
    quietDomain: false,
    guidance: "Name QA follow-up owed by this admission or give a reason none is owed.",
    doctrine: "docs/worldbuilding-system/checklists/canon_fact_gate.md"
  },
  "explicit decision record": {
    key: "explicit_decision_record",
    label: "Explicit decision record",
    required: true,
    canMarkNotApplicable: false,
    quietDomain: false,
    guidance: "Catastrophic admissions owe an explicit steward decision record.",
    doctrine: "docs/worldbuilding-system/checklists/canon_fact_gate.md"
  },
  "rollback/branch plan": {
    key: "rollback_branch_plan",
    label: "Rollback/branch plan",
    required: true,
    canMarkNotApplicable: false,
    quietDomain: false,
    guidance: "Catastrophic admissions must name rollback or branch handling before completion.",
    doctrine: "docs/worldbuilding-system/checklists/canon_fact_gate.md"
  }
};

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

export const admissionQueueWithDecisionPointLinks = (worldFile: WorldFile): AdmissionQueueDecisionRow[] =>
  admissionQueue(worldFile).map((row) => ({
    ...row,
    decisionPointHref: decisionPointHref(row.id),
    sourceLinks: admissionSourceLinks(worldFile, row.id)
  }));

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

const vocabularyTerms = (worldFile: WorldFile, vocabulary: string): string[] =>
  (worldFile.vocabularies() as Array<{ vocabulary: string; term: string }>)
    .filter((term) => term.vocabulary === vocabulary)
    .map((term) => term.term);

const allowedNextCanonStatuses = (worldFile: WorldFile, current: string | null): string[] =>
  vocabularyTerms(worldFile, "canon_status").filter((status) => {
    try {
      worldFile.assertAllowedStatusTransition(current, status);
      return true;
    } catch {
      return false;
    }
  });

const fullGateSectionsFor = (gate: AdmissionGatePolicy): AdmissionGateSection[] =>
  gate.steps.map((step) => {
    const section = FULL_GATE_SECTION_CONTRACTS[step];
    if (!section) throw new Error(`unknown full gate step: ${step}`);
    return section;
  });

const advisoryStepKeyFromBody = (body: string): string | null => {
  const match = body.match(/^Step:\s*(.+)$/m);
  return match?.[1]?.trim() ?? null;
};

const isAdmissionFullGateAdvisory = (record: RecordRow): boolean =>
  record.recordTypeKey === "advisory_artifact"
  && /^Flow:\s*admission$/m.test(record.body)
  && /^Step:\s*admission:constraints$/m.test(record.body);

const admissionFullGateAdvisoryArtifacts = (worldFile: WorldFile): AdmissionAdvisoryArtifactRef[] =>
  worldFile.listRecords()
    .filter(isAdmissionFullGateAdvisory)
    .map((record) => ({
      id: record.id,
      shortId: record.shortId,
      title: record.title,
      stepKey: advisoryStepKeyFromBody(record.body) ?? "admission:constraints"
    }));

const fullGateContractFor = (
  worldFile: WorldFile,
  record: AdmissionQueueRow,
  gate: AdmissionGatePolicy | null,
  readSideTrail: AdmissionDecisionReference[]
): AdmissionFullGateContract | null => {
  if (gate?.path !== "full_gate") return null;
  return {
    sections: fullGateSectionsFor(gate),
    allowedNextCanonStatuses: allowedNextCanonStatuses(worldFile, record.canonStatus),
    operationOptions: vocabularyTerms(worldFile, "admission_decision_operation"),
    constraintTagOptions: vocabularyTerms(worldFile, "constraint_tag"),
    validationErrors: [],
    completionAction: { method: "POST", href: "/api/admission/gate/complete" },
    advisoryArtifacts: admissionFullGateAdvisoryArtifacts(worldFile),
    writePreview: {
      recordId: record.id,
      writes: ["gate_result report", "ordered admission operation events", "steward-selected canon status change on completion"],
      links: ["Admission gate result link", "advisory-use link only when explicitly selected"]
    },
    readSideTrail
  };
};

export const gateComposition = (worldFile: WorldFile, recordId: number): unknown => {
  const record = worldFile.getRecord(recordId);
  const facets = worldFile.listFacets(recordId);
  const severity = declaredSeverityFromFacets(facets);
  const gate = admissionGatePolicy(severity);
  const recordWithFacets = withAdmissionFacets(worldFile, record);
  const executableContract = fullGateContractFor(worldFile, recordWithFacets, gate, readSideTrailFor(recordId));
  return {
    record,
    admissionLevel: severity.admissionLevel,
    workScale: severity.workScale,
    path: gate.path,
    doctrine: gate.doctrine,
    steps: gate.steps,
    executableContract
  };
};

const currentAdmissionStep = (worldFile: WorldFile, record: RecordRow, severityDeclared: boolean): { runState: string; currentStep: string } => {
  const flow = worldFile.findLatestInProgressFlowByStepPrefix("admission", `record:${record.id}:`);
  if (flow) {
    return {
      runState: String(flow.state ?? "in_progress"),
      currentStep: String(flow.current_step ?? `record:${record.id}:gate`)
    };
  }
  if (["accepted", "accepted with constraints", "localized", "contested", "quarantined", "branch-only", "rejected"].includes(record.canonStatus ?? "")) {
    return { runState: "complete", currentStep: `record:${record.id}:complete` };
  }
  if (severityDeclared) return { runState: "not_started", currentStep: `record:${record.id}:severity-declared` };
  return { runState: "not_started", currentStep: `record:${record.id}:queue-selection` };
};

const severityDefinitions = (_severity: DeclaredSeverity): AdmissionDecisionPayload["severity"]["definitions"] => [
  ...Object.entries(ADMISSION_LEVEL_DEFINITIONS).map(([term, definition]) => ({
    key: "admission_level" as const,
    term,
    definition,
    source: "docs/worldbuilding-system/06_canon_fact_admission_protocol.md"
  })),
  ...Object.entries(WORK_SCALE_DEFINITIONS).map(([term, definition]) => ({
    key: "work_scale" as const,
    term,
    definition,
    source: "docs/worldbuilding-system/06_canon_fact_admission_protocol.md"
  }))
];

const admissionSourceLinks = (
  worldFile: WorldFile,
  recordId: number
): AdmissionDecisionSourceLink[] =>
  worldFile.listLinks(recordId)
    .filter((link) => link.fromRecordId === recordId && link.linkTypeKey === "derived_from")
    .map((link) => {
      let target: AdmissionDecisionSourceLink["target"] = null;
      try {
        const record = worldFile.getRecord(link.toRecordId);
        target = { id: record.id, shortId: record.shortId, title: record.title, recordTypeKey: record.recordTypeKey };
      } catch {
        target = null;
      }
      return { ...link, target };
    });

const seedAuditIsRelevant = (record: RecordRow, sourceLinks: AdmissionDecisionPayload["selectedRecord"]["sourceLinks"]): boolean => {
  const sourceText = [record.title, record.body, ...sourceLinks.map((link) => link.note)].join(" ").toLowerCase();
  return record.recordTypeKey === "canon_fact" && record.canonStatus === "proposed" && /\b(seed|world kernel)\b/.test(sourceText);
};

const localDecisionFor = (severityDeclared: boolean, gatePath: AdmissionGatePath | null): string => {
  if (!severityDeclared) return "Choose and classify the proposed fact before Admission changes canon standing.";
  if (gatePath === "minor_ledger") return "Complete the minor admission ledger while preserving batch speed.";
  return "Complete the full canon fact gate with written substance.";
};

const workFor = (
  severityDeclared: boolean,
  gate: AdmissionGatePolicy | null,
  seedAuditOffered: boolean
): AdmissionDecisionWork => {
  if (!severityDeclared || !gate) {
    return {
      required: ["Select a proposed fact", "Declare admission_level", "Declare work_scale"],
      optional: ["Prompt-out advisory pressure after steward-authored material exists"],
      skippable: seedAuditOffered ? ["Frontloaded seed audit can be declined with a governed skip record"] : [],
      severityDependent: ["Gate depth is unavailable until severity is declared"]
    };
  }

  if (gate.path === "minor_ledger") {
    return {
      required: [
        "Precise fact statement",
        "Scope",
        "Truth layer",
        "Canon status and separated constraint tags",
        "Admission operation order",
        "One consequence check"
      ],
      optional: ["Prompt-out advisory pressure after steward-authored material exists"],
      skippable: [
        ...(seedAuditOffered ? ["Frontloaded seed audit can be declined with a governed skip record"] : []),
        "Prompt-out can be declined through a skip_record"
      ],
      severityDependent: ["Minor path writes admission_ledger_row records and ordered admission operations"]
    };
  }

  return {
    required: ["Written consequence text", "Admission operation order", ...gate.steps],
    optional: ["Prompt-out advisory pressure after steward-authored material exists", "Advisory-use link when an advisory artifact informed the steward-authored decision"],
    skippable: [
      ...(seedAuditOffered ? ["Frontloaded seed audit can be declined with a governed skip record"] : []),
      "Prompt-out can be declined through a skip_record"
    ],
    severityDependent: gate.steps
  };
};

const blockersFor = (severityDeclared: boolean, gate: AdmissionGatePolicy | null): AdmissionDecisionPayload["blockers"] => {
  if (!severityDeclared) {
    return [
      {
        key: "severity_required",
        label: "Severity declaration",
        message: "Admission cannot choose a path until the steward declares both severity facets.",
        requires: "admission_level and work_scale"
      }
    ];
  }
  if (gate?.path !== "full_gate") {
    return [
      {
        key: "minor_consequence_check",
        label: "One consequence check",
        message: "Minor ledger rows still owe one consequence check before admission.",
        requires: "one consequence check"
      }
    ];
  }
  return [
    {
      key: "written_consequence",
      label: "Written consequence",
      message: "Full gates refuse checkbox-only completion.",
      requires: "written consequence text"
    },
    {
      key: "not_applicable_reason",
      label: "N/A reason",
      message: "Any not-applicable gate item must carry a reason.",
      requires: "n/a reason"
    },
    {
      key: "quiet_domain_declaration",
      label: "Quiet domain declaration",
      message: "Quiet domains must be declared rather than clicked away.",
      requires: "quiet-domain declaration"
    }
  ];
};

const doctrineFor = (gate: AdmissionGatePolicy | null, seedAuditOffered: boolean): string[] => [
  "docs/worldbuilding-system/06_canon_fact_admission_protocol.md",
  ...(gate?.path === "full_gate" ? ["docs/worldbuilding-system/checklists/canon_fact_gate.md"] : ["docs/worldbuilding-system/templates/admission_ledger.md"]),
  ...(seedAuditOffered
    ? [
        "docs/worldbuilding-system/05_creation_protocol.md",
        "docs/worldbuilding-system/checklists/frontloaded_seed_audit.md"
      ]
    : []),
  "docs/worldbuilding-system/20_ai_assisted_workflow.md",
  "docs/principles/guided-workflow-usability.md"
];

const readSideTrailFor = (recordId: number): AdmissionDecisionReference[] => [
  { label: "Current Canon", href: "/api/canon-workbench/current" },
  { label: "Audit Trail", href: "/api/canon-workbench/audit" },
  { label: "Record detail", href: `/api/canon-workbench/records/${recordId}` },
  { label: "Advisory artifacts", href: `/api/canon-workbench/records/${recordId}` },
  { label: "Skip records", href: `/api/canon-workbench/records/${recordId}` },
  { label: "Canon debt", href: "/api/canon-debt?open=true" },
  { label: "Export", href: `/api/records/${recordId}/export/markdown` }
];

const preLoadPromptPacketText = (record: AdmissionQueueRow): string => [
  "No selected-mode Admission Prompt packet is loaded yet.",
  "This pre-load preview is non-current and cannot be copied, exported, stored, or treated as the selected-mode packet.",
  `Selected Admission record: ${record.shortId} ${record.title}.`,
  "Choose Proposal mode or Pressure mode, then use Load Admission Prompt-out Step to generate the current packet for this selected Admission record."
].join("\n");

const promptOutFor = (
  worldFile: WorldFile,
  record: AdmissionQueueRow,
  localDecision: string,
  gate: AdmissionGatePolicy | null,
  sourceLinks: AdmissionDecisionPayload["selectedRecord"]["sourceLinks"],
  doctrineCitations: string[],
  cardValue: MethodCard
): AdmissionDecisionPayload["promptOut"] => {
  const queueSeverity = gate == null;
  const fullGate = gate?.path === "full_gate";
  const templateKey = queueSeverity
    ? "admission_queue_severity"
    : fullGate
      ? "admission_constraint_challenge"
      : "admission_prerequisite_audit";
  const stepKey = queueSeverity
    ? "admission:queue-severity"
    : fullGate
      ? "admission:constraints"
      : "admission:dependencies";
  const role = queueSeverity
    ? "Severity classification readiness"
    : fullGate
      ? "Constraint challenger"
      : "Prerequisite auditor";
  const sourceManifest = [
    `Record ${record.shortId}: ${record.title}`,
    ...sourceLinks.map((link) => `Source link ${link.linkTypeKey}: ${link.target ? `${link.target.shortId} ${link.target.title}` : `record ${link.toRecordId}`} (${link.note || "no note"})`),
    `Prompt template: ${templateKey}`,
    ...(queueSeverity
      ? [
          ...Object.entries(ADMISSION_LEVEL_DEFINITIONS).map(([term, definition]) => `Vocabulary admission_level ${term}: ${definition}`),
          ...Object.entries(WORK_SCALE_DEFINITIONS).map(([term, definition]) => `Vocabulary work_scale ${term}: ${definition}`)
        ]
      : []),
    ...methodCardSourceManifest(cardValue),
    ...doctrineCitations.filter((citation) => !cardValue.packageSources.includes(citation)).map((citation) => `Related provenance: ${citation}`)
  ];
  const pressureStepRequest = {
    method: "POST" as const,
    href: "/api/prompt-out/steps" as const,
    body: {
      flowKey: "admission" as const,
      templateKey,
      recordId: record.id,
      stepKey,
      mode: "pressure" as const,
      label: role,
      ...(queueSeverity || !record.admissionLevel ? {} : { admissionLevel: record.admissionLevel }),
      ...(queueSeverity || !record.workScale ? {} : { workScale: record.workScale })
    }
  };
  const proposalStepRequest = {
    method: "POST" as const,
    href: "/api/prompt-out/steps" as const,
    body: {
      flowKey: "admission" as const,
      templateKey,
      recordId: record.id,
      stepKey,
      mode: "proposal" as const,
      label: "Proposal mode",
      ...(queueSeverity || !record.admissionLevel ? {} : { admissionLevel: record.admissionLevel }),
      ...(queueSeverity || !record.workScale ? {} : { workScale: record.workScale })
    }
  };
  const modes: DecisionPointPromptMode[] = withPromptModeSummaries([
    promptMode({
      mode: "proposal",
      label: "Proposal mode",
      available: true,
      blocker: null,
      framing: queueSeverity
        ? "Ask for risks, dependencies, missing information, uncertainty, and candidate questions before the steward declares admission_level and work_scale."
        : "Request labeled candidate Admission material with alternatives and assumptions; Admission still governs canon standing.",
      role: queueSeverity ? "Severity classification readiness" : "Admission proposal",
      templateKey,
      stepKey,
      outputLabels: ADVISORY_OUTPUT_LABELS,
      stepRequest: proposalStepRequest
    }),
    promptMode({
      mode: "pressure",
      label: "Pressure mode",
      available: Boolean(record.body.trim()),
      blocker: record.body.trim() ? null : "Pressure prompts require steward-authored material on the proposed fact.",
      framing: queueSeverity
        ? "Challenge whether the proposed fact has enough source, vocabulary, and risk context for the steward to classify severity."
        : "Ask for challenge, risks, alternatives, and questions on the proposed fact.",
      role,
      templateKey,
      stepKey,
      outputLabels: ADVISORY_OUTPUT_LABELS,
      stepRequest: record.body.trim() ? pressureStepRequest : null
    })
  ]);
  return {
    advisory: "optional",
    templateKey,
    stepKey,
    role,
    modes,
    stepRequest: pressureStepRequest,
    preview: {
      currentDecision: localDecision,
      promptText: preLoadPromptPacketText(record),
      sourceManifest,
      contextPreview: `${record.shortId} ${record.title}\n${record.body || "No body supplied."}`,
      omissions: [
        ...(queueSeverity ? ["Minor ledger completion omitted until severity is declared."] : []),
        "No hidden repository context is required; any unavailable world context must be named before copy-out."
      ],
      advisoryCanonWarning: "Prompt-out is optional advisory pressure. Pasted responses remain advisory artifacts and are not admitted canon.",
      currentness: {
        state: "not_loaded",
        label: "No selected-mode packet loaded",
        loadedMode: null,
        currentPacketActions: "disabled",
        loadAction: "Choose Proposal mode or Pressure mode, then use Load Admission Prompt-out Step."
      }
    }
  };
};

export const admissionDecisionPoint = (worldFile: WorldFile, recordId: number): AdmissionDecisionPayload => {
  const record = withAdmissionFacets(worldFile, worldFile.getRecord(recordId));
  const severity: DeclaredSeverity = { admissionLevel: record.admissionLevel, workScale: record.workScale };
  const severityDeclared = Boolean(severity.admissionLevel && severity.workScale);
  const gate = severityDeclared ? admissionGatePolicy(severity) : null;
  const sourceLinks = admissionSourceLinks(worldFile, recordId);
  const seedAuditOffered = seedAuditIsRelevant(record, sourceLinks);
  const { runState, currentStep } = currentAdmissionStep(worldFile, record, severityDeclared);
  const localDecision = localDecisionFor(severityDeclared, gate?.path ?? null);
  const doctrineCitations = doctrineFor(gate, seedAuditOffered);
  const cardValue = methodCard(
    !severityDeclared
      ? "admission.queue-severity"
      : gate?.path === "minor_ledger"
        ? "admission.minor-ledger"
        : "admission.full-gate"
  );
  const cardDoctrineSlots = methodCardDoctrineSlots(cardValue);
  const reasonRequired = requiresSkipReason(severity);
  const work = workFor(severityDeclared, gate, seedAuditOffered);
  const promptOut = promptOutFor(worldFile, record, localDecision, gate, sourceLinks, doctrineCitations, cardValue);
  const writeIntent = {
    willWrite: severityDeclared
      ? [
          gate?.path === "full_gate" ? "gate_result report" : "admission_ledger_row records",
          "ordered admission operation events",
          "steward-selected canon status change on completion"
        ]
      : ["No canon mutation until the steward completes Admission"],
    willLink: [
      "Admission gate result links",
      "advisory-use links only when the steward explicitly names an advisory artifact",
      "Read-side trail links expose Current Canon, Audit Trail, record detail, advisory artifacts, skip records, canon debt, and export"
    ],
    willQueue: ["Follow-up propagation canon debt when the steward supplies follow-up debt"],
    willLeaveUntouched: [
      "Admission does not infer truth layer, canon status, tags, or operations",
      "Seed audit does not mutate seed truth layer, canon status, tags, severity, or operations"
    ],
    willRouteOnward: [
      "minor ledger or full gate after severity declaration",
      "Read-side views remain read-only and do not gain Admission mutation controls"
    ]
  };
  const nextOrResumeState = {
    currentStep,
    nextStep: severityDeclared ? (gate?.path === "full_gate" ? "Full gate completion" : "Minor ledger entry") : "Severity declaration",
    safeExit: "Leave the record at proposed or under review; resume from the same Admission record."
  };
  const readSideTrail = readSideTrailFor(recordId);
  const fullGateContract = fullGateContractFor(worldFile, record, gate, readSideTrail);
  const sharedContract: DecisionPointSharedContract = {
    contractVersion: "decision-point/v1",
    methodCard: cardValue,
    flow: { key: "admission", runState },
    step: {
      key: currentStep,
      localDecision,
      packageSource: "docs/worldbuilding-system/06_canon_fact_admission_protocol.md",
      why: "Admission is the only flow that changes canon standing; flow policy remains server-owned."
    },
    obligations: {
      required: work.required,
      optional: work.optional,
      skippable: work.skippable,
      severityDependent: work.severityDependent
    },
    skipRule: {
      offered: true,
      reasonRequired,
      reasonThreshold: "major-or-higher Admission work",
      recordType: "skip_record"
    },
    doctrine: {
      slots: cardDoctrineSlots,
      packageSources: doctrineCitations
    },
    bearingContext: {
      displayed: splitDisplayedContext(promptOut.preview.contextPreview),
      sourceManifest: promptOut.preview.sourceManifest,
      omissions: promptOut.preview.omissions
    },
    promptOut: {
      serverOwned: true,
      modes: promptOut.modes
    },
    blockers: blockersFor(severityDeclared, gate),
    substanceValidations: [
      "Minor ledger rows still owe one consequence check.",
      "Full gates refuse checkbox-only completion.",
      "Any not-applicable gate item must carry a reason."
    ],
    writeIntent,
    nextOrResumeState,
    readSideTrail
  };

  return {
    methodCard: cardValue,
    flow: { key: "admission", runState },
    currentStep,
    nextOrResumeState,
    localDecision,
    packageAuthority: {
      primary: "docs/worldbuilding-system/06_canon_fact_admission_protocol.md",
      why: "Admission is the only flow that changes canon standing; this payload lets the browser show local decisions without owning policy.",
      citations: doctrineCitations
    },
    selectedRecord: {
      ...record,
      sourceLinks
    },
    severity: {
      admissionLevel: severity.admissionLevel,
      workScale: severity.workScale,
      gatePath: gate?.path ?? null,
      definitions: severityDefinitions(severity),
      obligations: gate?.steps ?? ["Declare admission_level", "Declare work_scale"]
    },
    work,
    doctrineCitations,
    blockers: blockersFor(severityDeclared, gate),
    skipRule: {
      offered: true,
      reasonRequired,
      reasonThreshold: "major-or-higher Admission work",
      belowThresholdNote: "Reason not collected below major-fact threshold.",
      recordType: "skip_record"
    },
    seedAudit: {
      offered: seedAuditOffered,
      doctrine: [
        "docs/worldbuilding-system/05_creation_protocol.md",
        "docs/worldbuilding-system/06_canon_fact_admission_protocol.md",
        "docs/worldbuilding-system/checklists/frontloaded_seed_audit.md"
      ],
      runWrites: "Running seed audit writes a gate_result linked to audited seeds.",
      declineWrites: "Declining seed audit writes a governed skip_record and leaves the proposed fact admissible.",
      nonMutation: "Seed audit does not mutate seed truth layer, canon status, tags, severity, or operations."
    },
    promptOut,
    writeIntent,
    closePreview: {
      beforeCompletion: [
        "canon status change",
        "gate result",
        "card update/history behavior",
        "ordered admission operation events",
        "advisory-use links",
        "canon-debt warnings",
        "skip records",
        "next step",
        "resume state"
      ],
      afterCompletion: [
        "Current Canon",
        "Audit Trail",
        "record detail",
        "advisory artifacts",
        "skip records",
        "canon debt",
        "export"
      ]
    },
    readSideTrail,
    fullGateContract,
    sharedContract
  };
};

export const declareAdmissionSeverity = (
  worldFile: WorldFile,
  recordId: number,
  input: { admissionLevel: string; workScale: string }
): { record: RecordRow; facets: FacetRow[]; gate: unknown; queue: AdmissionQueueRow[]; decisionPoint: AdmissionDecisionPayload } =>
  worldFile.atomicWrite(() => {
    worldFile.assertVocabularyTerm("admission_level", input.admissionLevel);
    worldFile.assertVocabularyTerm("work_scale", input.workScale);
    worldFile.replaceSingleFacet(recordId, "admission_level", input.admissionLevel);
    worldFile.replaceSingleFacet(recordId, "work_scale", input.workScale);
    return {
      record: worldFile.getRecord(recordId),
      facets: worldFile.listFacets(recordId),
      gate: gateComposition(worldFile, recordId),
      queue: admissionQueue(worldFile),
      decisionPoint: admissionDecisionPoint(worldFile, recordId)
    };
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

export interface AdmissionGateCompletionInput {
  recordId: number;
  title?: string;
  body?: string;
  truthLayer: string;
  canonStatus: string;
  constraintTags?: string[];
  operations: string[];
  consequenceText?: string;
  sections?: AdmissionFullGateSectionInput[];
  notApplicableReasons?: string[];
  quietDomainDeclarations?: string[];
  followUpDebt?: string;
  advisoryRecordId?: number;
}

export interface AdmissionGateCompletionReadback {
  livingRecord: RecordRow;
  gateResult: RecordRow;
  operationEvents: string[];
  constraintTags: string[];
  followUpDebt: RecordRow | null;
  advisoryUse: { advisoryRecordId: number; linkTypes: string[] } | null;
  standingText: {
    acceptedGateStatement: string;
    currentLivingText: string;
    originalProposalText: string;
    currentDiffersFromAccepted: boolean;
  };
  historyEvidence: {
    previousTitle: string;
    previousBody: string;
    recordHistory: unknown[];
  };
  readSideTrail: AdmissionDecisionReference[];
}

const nonEmpty = (value?: string | null): string => value?.trim() ?? "";

const admissionValidationFailure = (errors: AdmissionValidationError[]): Error & { validationErrors: AdmissionValidationError[] } => {
  const first = errors[0];
  const error = new Error(first ? `${first.key}: ${first.message}` : "admission gate validation failed") as Error & { validationErrors: AdmissionValidationError[] };
  error.validationErrors = errors;
  return error;
};

const sectionValidationError = (section: AdmissionGateSection): AdmissionValidationError => {
  const verb = section.label === "Dependencies" ? "require" : "requires";
  return {
    key: section.key,
    message: `${section.label} ${verb} steward-authored substance.`
  };
};

const validateFullGateSections = (
  contract: AdmissionFullGateContract,
  input: AdmissionGateCompletionInput
): AdmissionValidationError[] => {
  const errors: AdmissionValidationError[] = [];
  const knownKeys = new Set(contract.sections.map((section) => section.key));
  const suppliedSections = input.sections ?? [];
  const sectionsByKey = new Map(suppliedSections.map((section) => [section.key, section]));
  const keyCounts = new Map<string, number>();

  if (suppliedSections.length !== contract.sections.length) {
    errors.push({
      key: "sections",
      message: "Submitted full-gate section keys must exactly match the active server contract."
    });
  }

  for (const [index, supplied] of suppliedSections.entries()) {
    keyCounts.set(supplied.key, (keyCounts.get(supplied.key) ?? 0) + 1);
    if (!knownKeys.has(supplied.key)) {
      errors.push({ key: supplied.key, message: `Unknown full-gate section: ${supplied.key}` });
    }
    const expected = contract.sections[index]?.key;
    if (expected && supplied.key !== expected) {
      errors.push({
        key: `sections.${index}.key`,
        message: `Full-gate section ${index + 1} must be ${expected}; received ${supplied.key}.`
      });
    }
  }

  for (const [key, count] of keyCounts.entries()) {
    if (count > 1) {
      errors.push({ key: `${key}.duplicate`, message: `Duplicate full-gate section submitted: ${key}.` });
    }
  }

  for (const section of contract.sections) {
    const supplied = sectionsByKey.get(section.key);
    const substance = nonEmpty(supplied?.substance);
    const notApplicableReason = nonEmpty(supplied?.notApplicableReason);
    const quietDomainDeclaration = nonEmpty(supplied?.quietDomainDeclaration);
    const nARequested = supplied?.notApplicableReason != null && !substance;
    const quietDeclarationSupplied = supplied != null && Object.prototype.hasOwnProperty.call(supplied, "quietDomainDeclaration");

    if (nARequested && !notApplicableReason) {
      errors.push({
        key: `${section.key}.notApplicableReason`,
        message: `${section.label} is marked not applicable and requires a reason.`
      });
      continue;
    }
    if (notApplicableReason && !section.canMarkNotApplicable) {
      errors.push({
        key: section.key,
        message: `${section.label} cannot be marked not applicable.`
      });
      continue;
    }
    if (section.quietDomain && quietDeclarationSupplied && !quietDomainDeclaration) {
      errors.push({
        key: `${section.key}.quietDomainDeclaration`,
        message: `${section.label} quiet-domain declaration requires steward-authored text.`
      });
      if (!substance && !notApplicableReason) continue;
    }
    if (!section.quietDomain && quietDomainDeclaration) {
      errors.push({
        key: `${section.key}.quietDomainDeclaration`,
        message: `${section.label} does not accept a quiet-domain declaration.`
      });
      continue;
    }
    if (section.required && !substance && !notApplicableReason && !(section.quietDomain && quietDomainDeclaration)) {
      errors.push(sectionValidationError(section));
    }
  }

  return errors;
};

const validateAdmissionGateCompletion = (
  worldFile: WorldFile,
  current: RecordRow,
  input: AdmissionGateCompletionInput,
  gate: AdmissionGatePolicy,
  contract: AdmissionFullGateContract | null
): AdmissionValidationError[] => {
  const errors: AdmissionValidationError[] = [];
  if (!input.operations?.length) {
    errors.push({ key: "operations", message: "Admission gate requires at least one admission operation." });
  }
  if (gate.path === "full_gate" && !nonEmpty(input.consequenceText)) {
    errors.push({ key: "written_consequence", message: "Full gate requires written consequence text." });
  }
  for (const [index, reason] of (input.notApplicableReasons ?? []).entries()) {
    if (!nonEmpty(reason)) {
      errors.push({ key: `notApplicableReasons.${index}`, message: "N/A gate items require a reason." });
    }
  }
  for (const [index, declaration] of (input.quietDomainDeclarations ?? []).entries()) {
    if (!nonEmpty(declaration)) {
      errors.push({ key: `quietDomainDeclarations.${index}`, message: "Quiet domains require a declaration." });
    }
  }
  try {
    worldFile.assertAllowedStatusTransition(current.canonStatus, input.canonStatus);
  } catch (error) {
    errors.push({
      key: "canon_status",
      message: error instanceof Error ? error.message : String(error)
    });
  }
  if (input.advisoryRecordId != null) {
    try {
      const advisory = worldFile.getRecord(input.advisoryRecordId);
      if (!isAdmissionFullGateAdvisory(advisory)) {
        errors.push({
          key: "advisoryRecordId",
          message: "Selected advisory artifact must come from the Admission full-gate Prompt-out step."
        });
      }
    } catch (error) {
      errors.push({
        key: "advisoryRecordId",
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }
  if (gate.path === "full_gate" && contract) {
    errors.push(...validateFullGateSections(contract, input));
  }
  return errors;
};

const fullGateSectionLines = (
  contract: AdmissionFullGateContract | null,
  sections: AdmissionFullGateSectionInput[] | undefined
): string[] => {
  if (!contract) return [];
  const sectionsByKey = new Map((sections ?? []).map((section) => [section.key, section]));
  return [
    "Gate sections:",
    ...contract.sections.map((section) => {
      const supplied = sectionsByKey.get(section.key);
      const substance = nonEmpty(supplied?.substance);
      const notApplicableReason = nonEmpty(supplied?.notApplicableReason);
      const quietDomainDeclaration = nonEmpty(supplied?.quietDomainDeclaration);
      if (substance) return `${section.label}: ${substance}`;
      if (notApplicableReason) return `${section.label}: N/A - ${notApplicableReason}`;
      if (quietDomainDeclaration) return `${section.label}: Quiet-domain declaration - ${quietDomainDeclaration}`;
      return `${section.label}: not supplied`;
    })
  ];
};

const acceptedGateStatement = (
  contract: AdmissionFullGateContract | null,
  sections: AdmissionFullGateSectionInput[] | undefined
): string => {
  if (!contract) return "";
  const factStatement = sections?.find((section) => section.key === "fact_statement");
  return nonEmpty(factStatement?.substance);
};

const currentLivingTextForGateCompletion = (
  current: RecordRow,
  input: AdmissionGateCompletionInput,
  gate: AdmissionGatePolicy,
  contract: AdmissionFullGateContract | null
): string => {
  const requestedLivingText = nonEmpty(input.body);
  if (requestedLivingText) return requestedLivingText;
  const acceptedStatement = gate.path === "full_gate" ? acceptedGateStatement(contract, input.sections) : "";
  return acceptedStatement || current.body;
};

export const completeAdmissionGate = (
  worldFile: WorldFile,
  input: AdmissionGateCompletionInput
): { record: RecordRow; gateResult: RecordRow; warnings: RecordRow[]; readback: AdmissionGateCompletionReadback } => {
  const current = worldFile.getRecord(input.recordId);
  const severity = declaredSeverityFromFacets(worldFile.listFacets(input.recordId));
  const gate = admissionGatePolicy(severity);
  const currentWithFacets = withAdmissionFacets(worldFile, current);
  const contract = fullGateContractFor(worldFile, currentWithFacets, gate, readSideTrailFor(input.recordId));
  const validationErrors = validateAdmissionGateCompletion(worldFile, current, input, gate, contract);
  if (validationErrors.length) throw admissionValidationFailure(validationErrors);
  worldFile.assertAllowedStatusTransition(current.canonStatus, input.canonStatus);
  return worldFile.atomicWrite(() => {
    const warnings = warnsForOpenCanonDebt(declaredSeverityFromFacets(worldFile.listFacets(input.recordId))) ? worldFile.listCanonDebt(true) : [];
    const acceptedStatement = gate.path === "full_gate" ? acceptedGateStatement(contract, input.sections) : nonEmpty(input.body);
    const currentLivingText = currentLivingTextForGateCompletion(current, input, gate, contract);
    const record = worldFile.updateRecord(input.recordId, {
      title: input.title ?? current.title,
      body: currentLivingText,
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
        `Accepted standing text: ${acceptedStatement || currentLivingText}`,
        `Current living text: ${currentLivingText}`,
        `Original proposal/source text: ${current.body}`,
        `Operations: ${input.operations.join(", ")}`,
        `Consequence: ${input.consequenceText ?? "minor or not supplied"}`,
        `N/A reasons: ${(input.notApplicableReasons ?? []).join("; ") || "none"}`,
        `Quiet domains: ${(input.quietDomainDeclarations ?? []).join("; ") || "none"}`,
        ...fullGateSectionLines(contract, input.sections),
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
    const followUpDebt = input.followUpDebt
      ? worldFile.createCanonDebt({ name: `Propagation owed for ${record.shortId}`, scope: "propagation", assignee: "steward", body: input.followUpDebt })
      : null;
    if (followUpDebt) {
      worldFile.createLinkIfMissing(
        followUpDebt.id,
        record.id,
        "derived_from",
        `Admission-created propagation debt source fact: ${record.shortId}`
      );
    }
    worldFile.completeAdmissionFlowsForRecord(record.id);
    return {
      record,
      gateResult,
      warnings,
      readback: {
        livingRecord: record,
        gateResult,
        operationEvents: input.operations,
        constraintTags: input.constraintTags ?? [],
        followUpDebt,
        advisoryUse: input.advisoryRecordId == null
          ? null
          : { advisoryRecordId: input.advisoryRecordId, linkTypes: ["derived_from", "cites_advisory_artifact"] },
        standingText: {
          acceptedGateStatement: acceptedStatement || currentLivingText,
          currentLivingText,
          originalProposalText: current.body,
          currentDiffersFromAccepted: Boolean(acceptedStatement && currentLivingText !== acceptedStatement)
        },
        historyEvidence: {
          previousTitle: current.title,
          previousBody: current.body,
          recordHistory: worldFile.history(record.id)
        },
        readSideTrail: readSideTrailFor(record.id)
      }
    };
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
