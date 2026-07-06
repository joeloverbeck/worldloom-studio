import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import type { HealthPayload, LinkTypeDefinition, RecordTypeDefinition, WorkflowMapPayload } from "@worldloom/shared";
import { WorkflowShell } from "./workflow-shell.js";
import "./styles.css";

interface RecordRow {
  id: number;
  shortId: string;
  recordTypeKey: string;
  title: string;
  body: string;
  truthLayer: string | null;
  canonStatus: string | null;
  updatedAt: string;
}

interface VocabularyTerm {
  vocabulary: string;
  term: string;
}

interface SectionHeading {
  record_type_key: string;
  position: number;
  heading: string;
  package_source: string;
}

interface SectionRow {
  id: number;
  heading: string;
  body: string;
  position: number;
}

interface FacetRow {
  id: number;
  vocabulary: string;
  term: string;
  position: number;
}

interface DraftRow {
  id: number;
  title: string;
  body: string;
}

interface LinkRow {
  id: number;
  fromRecordId: number;
  toRecordId: number;
  linkTypeKey: string;
  note: string;
  depth?: number;
}

interface RecentWorld {
  path: string;
  openedAt: string;
}

interface SetupErrorState {
  action: "create" | "open";
  path: string;
  kind: string;
  message: string;
  recovery: string;
}

interface SetupStatusPayload {
  server: { reachable: true; version: string };
  catalog: { ready: boolean; recordTypeCount: number; linkTypeCount: number };
  world: { open: false } | { open: true; path: string };
  recentWorlds: RecentWorld[];
}

interface AdmissionQueueRow extends RecordRow {
  admissionLevel: string | null;
  workScale: string | null;
  constraintTags: string[];
  decisionPointHref?: string;
  sourceLinks?: Array<LinkRow & { target: Pick<RecordRow, "id" | "shortId" | "title" | "recordTypeKey"> | null }>;
}

interface PropagationQueueRow extends RecordRow {
  scope: string;
  state: string;
}

interface PropagationConsequence {
  id: number;
  orderKey: string;
  orderLabel: string;
  domainName: string | null;
  body: string;
  pressure: "normal" | "high";
}

interface PropagationDomain {
  id: number;
  domainName: string;
  triage: "direct" | "dependency" | "reaction" | "negative";
  declaration: string;
}

interface PropagationDisposition {
  id: number;
  consequenceId: number;
  disposition: string;
}

interface PropagationPlan {
  requiredCoverage: string;
  requiredDomainCount: number;
  orders: Array<{ key: string; label: string }>;
  domains: string[];
  doctrine: { signatureTests: string[]; stoppingRules: string[] };
}

interface QaTest {
  number: number;
  name: string;
  cluster: string;
  failureSmell: string;
  anchors: {
    weak: string;
    adequate: string;
    strong: string;
  };
  modeBenchmark: string;
}

interface QaScore {
  id: number;
  testNumber: number;
  score: "0" | "1" | "2" | "3" | "na";
  naReason: string;
  notes: string;
  requiredRepair: string;
  loadBearing: boolean;
  repairRouted: boolean;
}

interface QaBand {
  color: "unscored" | "green" | "yellow" | "red";
  reason: string;
  persisted: false;
}

interface QaScorecard {
  tests: QaTest[];
  subjectMode: string | null;
  doctrine: {
    redFlags: string[];
    modeBenchmarks: string[];
    repairLoop: string[];
  };
}

interface QaProfileFields {
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

interface QaFloorConditions {
  repeatableHighImpactCapability: boolean;
  lacksAccessLimits: boolean;
  lacksCost: boolean;
  lacksCountermeasure: boolean;
  lacksActorAdaptation: boolean;
  lacksTemporalResidue: boolean;
  lacksDistributionPattern: boolean;
  lacksInstitutionOrModeEquivalent: boolean;
}

interface Stage12Lens {
  key: string;
  label: string;
  checklistGroup: string;
}

interface Stage12CloseBlocker {
  kind: string;
  key: string;
  label: string;
  message: string;
}

interface Stage12Run {
  flow: { id: number; state: string; current_step: string };
  report: RecordRow;
  source: {
    sourceType: string;
    sourceRecordId: number | null;
    sourceSectionHeading: string | null;
    materialTitle: string;
    materialBody: string;
    sourceSummary: string;
  };
  doctrine: {
    flowKey: string;
    protocol: string;
    checklist: string;
    templateIndex: string;
    lenses: Stage12Lens[];
    completionRule: string;
    browserPolicy: string;
  };
  coverage: Array<{ id: number; lensKey: string; lensLabel: string; body: string }>;
  linkedCards: Array<{ id: number; cardTypeKey: string; lensKey: string | null; card: RecordRow }>;
  proposals: Array<{ id: number; lensKey: string | null; record: RecordRow }>;
  debt: Array<{ id: number; lensKey: string | null; record: RecordRow }>;
  advisories: Array<{ id: number; stepKey: string; record: RecordRow }>;
  skips: Array<{ id: number; stepKey: string; record: RecordRow; debt: RecordRow | null }>;
  closeReadiness: { status: string; blockers: Stage12CloseBlocker[] };
}

interface ConstraintCloseBlocker {
  kind: string;
  key: string;
  label: string;
  message: string;
}

interface ConstraintRun {
  flow: { id: number; state: string; current_step: string };
  report: RecordRow;
  source: {
    sourceType: string;
    sourceRecordId: number | null;
    sourceSectionHeading: string | null;
    materialTitle: string;
    materialBody: string;
    constrainedSubject: string;
    sourceSummary: string;
  };
  doctrine: {
    flowKey: string;
    protocol: string;
    checklist: string;
    template: string;
    stepMap: Array<{ key: string; label: string; decision: string }>;
    completionRule: string;
    browserPolicy: string;
  };
  inventory: Array<{ id: number; constrainedFact: string; constraintStatement: string; constraintType: string; prevents: string; allows: string; enforcement: string; residue: string }>;
  composition: Array<{ id: number; analysisType: string; body: string }>;
  leakage: { loopholes: string; countermeasures: string } | null;
  residue: { ordinaryLife: string; institutionalEffects: string; economicEffects: string } | null;
  linkedCards: Array<{ id: number; relation: string; card: RecordRow }>;
  proposals: Array<{ id: number; sourceStep: string; record: RecordRow }>;
  debt: Array<{ id: number; sourceStep: string; record: RecordRow }>;
  advisories: Array<{ id: number; stepKey: string; record: RecordRow }>;
  skips: Array<{ id: number; stepKey: string; record: RecordRow; debt: RecordRow | null }>;
  closeReadiness: { status: string; blockers: ConstraintCloseBlocker[] };
  closePreview: { state: string; outcomeState: string; beforeCompletion: string[]; afterCompletion: string[] };
  promptOut: { available: boolean; templateKey: string; stepKey: string; coldUseEvidence: string; sourceRecordId: number | null };
  readSideTrail: Array<{ label: string; href: string; recordId?: number }>;
}

interface Stage13Run {
  flow: {
    id: number;
    state: string;
    current_step: string;
    contradiction_source_record_id: number | null;
    contradiction_report_record_id: number | null;
  };
  implicatedRecords: RecordRow[];
  triage: Array<{ step_key: string; body: string }>;
  workScale: string | null;
  disposition: { disposition: string; note: string } | null;
  repairOperations: Array<{ operation: string; repair_text: string; position: number }>;
  repairTargets: Array<{
    record_id: number;
    next_canon_status: string;
    new_title: string | null;
    new_body: string | null;
    note: string;
    advisory_record_id: number | null;
  }>;
  retconCosts: Array<{ retcon_type: string; cost_key: string; cost_text: string }>;
  repairPropagation: {
    flowId: number;
    action: "assign" | "decline";
    debtRecordId: number | null;
    skipRecordId: number | null;
    note: string;
  } | null;
  proposals: Array<{ id: number; proposal_record_id: number; report_record_id: number | null }>;
  checklists: Array<{
    id: number;
    flow_id: number | null;
    ledger_record_id: number | null;
    protected_record_id: number | null;
    operation: string;
    effect_type: string;
    body: string;
    sacred_guard_body: string;
    completed: number;
  }>;
}

interface OwedBoundaryRow {
  propagationDispositionId: number;
  consequenceId: number;
  protectedRecordId: number;
  propagationReportRecordId: number | null;
  preservationBoundary: string;
  note: string;
  consequenceBody: string;
}

interface PromptTemplate {
  key: string;
  role_name: string;
  original_text: string;
  current_text: string;
  current_version: number;
}

interface CanonWorkbenchCurrentRow {
  id: number;
  shortId: string;
  title: string;
  recordTypeKey: string;
  recordTypeLabel: string;
  truthLayer: string;
  canonStatus: string;
  continuityScope: string;
  relationshipMarkers: {
    hasOpenDebt: boolean;
    hasAdvisoryUse: boolean;
    typedLinkTypes: string[];
  };
}

interface CanonWorkbenchRecordRef {
  id: number;
  shortId: string;
  title: string;
  recordTypeKey: string;
  recordTypeLabel?: string;
  mutationRegime?: "card" | "report";
  truthLayer?: string;
  canonStatus?: string;
  continuityScope?: string;
  body?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CanonWorkbenchAuditItem {
  record: CanonWorkbenchRecordRef;
  authoredAt: string;
  attachments: {
    recordHistory: unknown[];
    sectionHistory: unknown[];
    skipRecords: CanonWorkbenchRecordRef[];
    canonDebtEvents: Array<{ record: CanonWorkbenchRecordRef; history: unknown[] }>;
    advisoryArtifacts: Array<{ record: CanonWorkbenchRecordRef; dispositions: unknown[] }>;
    standingRulings: unknown[];
    advisoryDispositions: unknown[];
    jurisdictionEvents: unknown[];
    typedLinkCreations: Array<{ id: number; linkTypeKey: string }>;
    flowRelationships: unknown[];
  };
  affectedCurrentRecords: CanonWorkbenchRecordRef[];
}

interface CanonWorkbenchDetail {
  record: CanonWorkbenchRecordRef & {
    body: string;
    recordTypeLabel: string;
    truthLayer: string;
    canonStatus: string;
    continuityScope: string;
    createdAt: string;
    updatedAt: string;
  };
  facets: FacetRow[];
  sections: SectionRow[];
  outgoingLinks: Array<LinkRow & { target: CanonWorkbenchRecordRef | null }>;
  incomingLinks: Array<LinkRow & { source: CanonWorkbenchRecordRef | null }>;
  recordHistory: unknown[];
  sectionHistory: unknown[];
  relatedReports: CanonWorkbenchRecordRef[];
  canonDebt: CanonWorkbenchRecordRef[];
  skipRecords: CanonWorkbenchRecordRef[];
  advisoryArtifacts: Array<{ record: CanonWorkbenchRecordRef; dispositions: unknown[] }>;
  standingRulings: unknown[];
  advisoryDispositions: unknown[];
  exportAffordance: { method: "GET"; href: string };
}

interface AdmissionDecisionPoint {
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
    sourceLinks: Array<LinkRow & { target: Pick<RecordRow, "id" | "shortId" | "title" | "recordTypeKey"> | null }>;
  };
  severity: {
    admissionLevel: string | null;
    workScale: string | null;
    gatePath: "minor_ledger" | "full_gate" | null;
    definitions: Array<{ key: string; term: string; definition: string; source: string }>;
    obligations: string[];
  };
  work: {
    required: string[];
    optional: string[];
    skippable: string[];
    severityDependent: string[];
  };
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
    modes?: PromptOutMode[];
    stepRequest: {
      method: "POST";
      href: string;
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
  readSideTrail: Array<{ label: string; href: string }>;
}

interface CreationDecisionPoint {
  flow: {
    key: "creation";
    runState: string;
  };
  currentStep: string;
  localDecision: string;
  packageAuthority: {
    primary: string;
    why: string;
    citations: string[];
  };
  currentKernel: {
    id: number;
    shortId: string;
    title: string;
  } | null;
  sectionPrompts: Array<{
    heading: string;
    prompt: string;
    obligation: "required" | "optional" | "allowed-empty";
  }>;
  work: {
    required: string[];
    optional: string[];
    allowedEmpty: string[];
    skippable: string[];
  };
  blockers: Array<{ key: string; label: string; message: string; requires: string }>;
  promptOut: {
    available: boolean;
    blocker: string | null;
    templateKey: string;
    stepKey: string;
    role: string;
    modes?: PromptOutMode[];
    stepRequest: {
      method: "POST";
      href: string;
      body: {
        flowKey: "creation";
        flowId: number;
        recordId: number;
        templateKey: string;
        stepKey: string;
        mode?: "proposal" | "pressure";
        label: string;
      };
    } | null;
    preview: {
      currentDecision: string;
      promptText: string;
      contextPreview: string;
      sourceManifest: string[];
      omissions: string[];
      advisoryCanonWarning: string;
    };
  };
  writeIntent: {
    willWrite: string[];
    willLink: string[];
    willQueue: string[];
    willRouteOnward: string[];
    willLeaveUntouched: string[];
  };
  nextOrResumeState: {
    currentStep: string;
    nextStep: string;
    safeExit: string;
  };
  readSideTrail: Array<{ label: string; href: string; recordId?: number }>;
  handoffs: string[];
  handoff: {
    seedDecompositionReport: {
      id: number;
      shortId: string;
      title: string;
      recordTypeKey: string;
      body: string;
      truthLayer: string | null;
      canonStatus: string | null;
    } | null;
    reportSections: SectionRow[];
    parkedSeeds: Array<{
      id: number;
      shortId: string;
      title: string;
      recordTypeKey: string;
      body: string;
      truthLayer: string | null;
      canonStatus: string | null;
      sourceLinks: Array<{
        label: string;
        href: string;
        recordId: number;
        shortId: string;
        title: string;
        recordTypeKey: string;
        linkTypeKey: string;
        note: string;
      }>;
    }>;
    supportingKernel: {
      id: number;
      shortId: string;
      title: string;
      recordTypeKey: string;
      body: string;
      truthLayer: string | null;
      canonStatus: string | null;
    } | null;
    kernelSections: SectionRow[];
    granularityRationale: string | null;
    admissionIntent: string | null;
    admissionQueueRoute: string;
    currentStatus: string;
    nextStep: string;
    sourceLinks: Array<{
      label: string;
      href: string;
      recordId: number;
      shortId: string;
      title: string;
      recordTypeKey: string;
      linkTypeKey: string;
      note: string;
    }>;
    doctrineAtPointOfUse: string[];
  };
}

interface AppProps {
  initialRecords?: RecordRow[];
  initialOpenWorld?: string | null;
  initialRecentWorlds?: RecentWorld[];
  initialSetupError?: SetupErrorState | null;
  initialWorkflowMap?: WorkflowMapPayload | null;
  initialDestination?: string;
  initialCanonCurrent?: CanonWorkbenchCurrentRow[];
  initialCanonAudit?: CanonWorkbenchAuditItem[];
  initialCanonDetail?: CanonWorkbenchDetail | null;
  initialAdmissionQueue?: AdmissionQueueRow[];
  initialAdmissionDecision?: AdmissionDecisionPoint | null;
  initialCreationDecision?: CreationDecisionPoint | null;
}

type PromptFlowKey = "creation" | "admission" | "propagation" | "contradiction" | "qa" | "institutional_economic_suppression" | "constraint_composition";

interface PromptOutMode {
  mode: "proposal" | "pressure";
  label: string;
  available: boolean;
  availability?: "available" | "blocked";
  blocker: string | null;
  framing: string;
  outputLabels: string[];
  stepRequest: {
    method: "POST";
    href: string;
    body: Record<string, unknown>;
  } | null;
}

interface PromptOutActionLink {
  method: "POST";
  href: string;
}

interface PromptOutStep {
  id: string;
  label: string;
  templateKey: string;
  mode?: "proposal" | "pressure";
  availableModes?: Array<{ mode: "proposal" | "pressure"; label: string; framing: string; available: boolean; blocker: string | null }>;
  context: {
    flowKey: string | null;
    flowId: number | null;
    stepKey: string;
  };
  selectedRecord: {
    id: number;
    shortId: string;
    title: string;
    recordTypeKey: string;
  } | null;
  severity: {
    admissionLevel: string | null;
    workScale: string | null;
  };
  currentState: {
    promptText: string | null;
    advisoryRecordId: number | null;
    disposition: string | null;
  };
  actions: {
    generate: PromptOutActionLink;
    storeAdvisory: PromptOutActionLink;
    disposition: PromptOutActionLink;
    skip: PromptOutActionLink;
  };
}

class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const api = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init?.headers
    }
  });
  const payload = await response.json();
  if (!response.ok) throw new ApiError(payload.error ?? response.statusText, response.status, payload);
  return payload as T;
};

const emptyRecordForm = {
  title: "",
  body: "",
  truthLayer: "",
  canonStatus: ""
};

const defaultCreationDecision: CreationDecisionPoint = {
  flow: {
    key: "creation",
    runState: "not started"
  },
  currentStep: "kernel:World premise",
  localDecision: "Define the world's first governing kernel or pressure seed.",
  packageAuthority: {
    primary: "docs/worldbuilding-system/05_creation_protocol.md",
    why: "Phase 1 owns the world kernel as a pressure seed, not an encyclopedia.",
    citations: [
      "docs/worldbuilding-system/05_creation_protocol.md",
      "docs/worldbuilding-system/templates/world_kernel.md",
      "docs/worldbuilding-system/20_ai_assisted_workflow.md",
      "docs/specs/creation-flow.md"
    ]
  },
  currentKernel: null,
  sectionPrompts: [
    { heading: "World premise", prompt: "What is the world, in one or two sentences?", obligation: "required" },
    { heading: "Core promise", prompt: "What experience should the world reliably create?", obligation: "allowed-empty" },
    { heading: "Starting scale", prompt: "Name where the world starts.", obligation: "required" },
    { heading: "Genre, tone, and consequence-mode commitments", prompt: "Name consequence mode explicitly.", obligation: "required" },
    { heading: "Initial mysteries and protected effects", prompt: "Name protected unknowns if they exist.", obligation: "allowed-empty" }
  ],
  work: {
    required: [
      "Write steward-authored kernel material",
      "Explicitly select consequence mode before seed decomposition",
      "For decomposition, provide seed title, body, truth layer, and granularity confirmation"
    ],
    optional: [
      "Allowed-empty kernel sections may remain thin",
      "Creation Prompt-out advisory pressure after steward-authored material exists",
      "Admission intent note for future review"
    ],
    allowedEmpty: ["Core promise", "Foundational constraints", "Initial mysteries and protected effects", "Ordinary-life promise"],
    skippable: ["Prompt-out advisory pressure can be declined with a skip_record"]
  },
  blockers: [
    { key: "kernel_material", label: "Kernel material", message: "Creation Prompt-out and seed decomposition wait for steward-authored kernel material.", requires: "steward-authored kernel material" },
    { key: "consequence_mode", label: "Consequence mode", message: "Seed decomposition cannot proceed until the steward explicitly selects consequence mode.", requires: "explicit consequence mode" }
  ],
  promptOut: {
    available: false,
    blocker: "Creation Prompt-out requires steward-authored kernel material and a current kernel record.",
    templateKey: "kernel_pressure",
    stepKey: "creation:kernel_prompt",
    role: "Consequence scout",
    stepRequest: null,
    preview: {
      currentDecision: "Define the world's first governing kernel or pressure seed.",
      promptText: "Role framing: ask for pressure, not answers.",
      contextPreview: "No kernel material has been saved yet.",
      sourceManifest: [
        "Doctrine: docs/worldbuilding-system/05_creation_protocol.md Phase 1",
        "Doctrine: docs/worldbuilding-system/templates/world_kernel.md",
        "Doctrine: docs/worldbuilding-system/20_ai_assisted_workflow.md"
      ],
      omissions: ["Current kernel material is absent until the steward writes it."],
      advisoryCanonWarning: "Pasted responses remain advisory artifacts and are not admitted canon."
    }
  },
  writeIntent: {
    willWrite: ["one living world_kernel record", "seed_decomposition report", "canon_fact records fixed at proposed"],
    willLink: ["read-side trail placeholders until records exist", "derived_from links from parked seeds to the kernel and decomposition report"],
    willQueue: ["parked seeds appear in the Admission queue"],
    willRouteOnward: ["Seed decomposition after explicit consequence mode", "Admission flow"],
    willLeaveUntouched: ["canon standing is not admitted inside Creation", "pasted advisory text does not alter canon fields"]
  },
  nextOrResumeState: {
    currentStep: "kernel:World premise",
    nextStep: "continue kernel authoring",
    safeExit: "Safe exit leaves the Creation flow in progress and resumable from the same world file."
  },
  readSideTrail: [
    { label: "Current Canon", href: "/api/canon-workbench/current" },
    { label: "Audit Trail", href: "/api/canon-workbench/audit" },
    { label: "Admission queue", href: "/api/admission/queue" }
  ],
  handoffs: ["new-world navigation", "kernel decision surface", "Creation-bound Prompt-out", "seed decomposition surface", "browser evidence/coverage closeout"],
  handoff: {
    seedDecompositionReport: null,
    reportSections: [],
    parkedSeeds: [],
    supportingKernel: null,
    kernelSections: [],
    granularityRationale: null,
    admissionIntent: null,
    admissionQueueRoute: "/api/admission/queue",
    currentStatus: "not parked",
    nextStep: "complete seed decomposition",
    sourceLinks: [],
    doctrineAtPointOfUse: []
  }
};

const emptyQaProfile: QaProfileFields = {
  strongestDomain: "",
  weakestDomain: "",
  mostDangerousUnderPropagatedFact: "",
  mostLikelyContradiction: "",
  mostFragileMystery: "",
  mostOverloadedConstraint: "",
  mostSuspiciousAbsentInstitutionResponse: "",
  mostAtRiskAestheticDrift: "",
  canonDebtBeforeFoundationalFacts: ""
};

const qaFloorConditionLabels: Record<keyof QaFloorConditions, string> = {
  repeatableHighImpactCapability: "Repeatable high-impact capability",
  lacksAccessLimits: "No access limits",
  lacksCost: "No cost",
  lacksCountermeasure: "No countermeasure",
  lacksActorAdaptation: "No actor adaptation",
  lacksTemporalResidue: "No temporal residue",
  lacksDistributionPattern: "No distribution pattern",
  lacksInstitutionOrModeEquivalent: "No institution or mode-equivalent response"
};

const emptyQaFloorConditions: QaFloorConditions = {
  repeatableHighImpactCapability: false,
  lacksAccessLimits: false,
  lacksCost: false,
  lacksCountermeasure: false,
  lacksActorAdaptation: false,
  lacksTemporalResidue: false,
  lacksDistributionPattern: false,
  lacksInstitutionOrModeEquivalent: false
};

const stage13TriageSteps = [
  { stepKey: "contradiction_statement", label: "Contradiction statement" },
  { stepKey: "truth_layers", label: "Truth layers" },
  { stepKey: "scope", label: "Scope" },
  { stepKey: "who_can_notice", label: "Who can notice" },
  { stepKey: "audience_notice", label: "Audience notice" },
  { stepKey: "contradiction_type", label: "Contradiction type" },
  { stepKey: "higher_authority", label: "Higher-authority material" },
  { stepKey: "mystery_relationship", label: "Mystery / protected-effect relationship" },
  { stepKey: "notes", label: "Notes" }
];

const stage13RetconCostKeys = ["continuity", "institutional", "character", "mystery", "aesthetic", "future"];

const stage13MysterySectionHeadings = [
  "Protected effect type",
  "Puzzle question, if any",
  "What is fixed",
  "What is secret or undecided",
  "Damaging explanations",
  "Preserved consequences",
  "Recurrence / motif / transformation",
  "Reveal permissions",
  "Reveal prohibitions",
  "Explanation-pressure operation",
  "What would break if solved or flattened",
  "Sacred-opacity accountability"
];

const emptyStage13RetconCosts = Object.fromEntries(stage13RetconCostKeys.map((key) => [key, ""])) as Record<string, string>;
const emptyStage13MysterySections = Object.fromEntries(stage13MysterySectionHeadings.map((heading) => [heading, ""])) as Record<string, string>;
const constraintCompositionTypes = ["stacking", "gate", "tradeoff", "threshold", "sequential", "cancellation", "contradiction", "chain"];

const emptyConstraintInventory = {
  constrainedFact: "",
  constraintStatement: "",
  constraintType: "access",
  prevents: "",
  allows: "",
  boundaryKnowledge: "",
  bypassActors: "",
  causeOrMysteryBoundary: "",
  enforcement: "",
  residue: "",
  costOrObservable: ""
};

const emptyConstraintLeakage = {
  bottleneck: "",
  loopholes: "",
  partialWorkarounds: "",
  falseBypasses: "",
  accidents: "",
  countermeasures: "",
  boundaryTesters: ""
};

const emptyConstraintResidue = {
  ordinaryLife: "",
  institutionalEffects: "",
  economicEffects: "",
  visibleTraces: "",
  expertise: "",
  resentment: "",
  crime: "",
  ritual: "",
  markets: "",
  failureModes: ""
};

const parseNumberList = (value: string): number[] =>
  value
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));

const optionalNumber = (value: string): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

function App({
  initialRecords = [],
  initialOpenWorld = null,
  initialRecentWorlds = [],
  initialSetupError = null,
  initialWorkflowMap = null,
  initialDestination,
  initialCanonCurrent = [],
  initialCanonAudit = [],
  initialCanonDetail = null,
  initialAdmissionQueue = [],
  initialAdmissionDecision = null,
  initialCreationDecision = null
}: AppProps = {}) {
  const [worldPath, setWorldPath] = useState("");
  const [openWorld, setOpenWorld] = useState<string | null>(initialOpenWorld);
  const [workflowMap, setWorkflowMap] = useState<WorkflowMapPayload | null>(initialWorkflowMap);
  const [activeDestination, setActiveDestination] = useState<string>(initialDestination ?? (initialWorkflowMap ? "map" : "legacy"));
  const [serverVersion, setServerVersion] = useState("");
  const [serverStatus, setServerStatus] = useState<"checking" | "ready" | "failed">("checking");
  const [catalogStatus, setCatalogStatus] = useState<"checking" | "ready" | "failed">("checking");
  const [setupError, setSetupError] = useState<SetupErrorState | null>(initialSetupError);
  const [message, setMessage] = useState("");
  const [recordTypes, setRecordTypes] = useState<RecordTypeDefinition[]>([]);
  const [linkTypes, setLinkTypes] = useState<LinkTypeDefinition[]>([]);
  const [records, setRecords] = useState<RecordRow[]>(initialRecords);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [recentWorlds, setRecentWorlds] = useState<RecentWorld[]>(initialRecentWorlds);
  const [terms, setTerms] = useState<VocabularyTerm[]>([]);
  const [headings, setHeadings] = useState<SectionHeading[]>([]);
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [facets, setFacets] = useState<FacetRow[]>([]);
  const [drafts, setDrafts] = useState<DraftRow[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [admissionQueue, setAdmissionQueue] = useState<AdmissionQueueRow[]>(initialAdmissionQueue);
  const [admissionDecision, setAdmissionDecision] = useState<AdmissionDecisionPoint | null>(initialAdmissionDecision);
  const [creationDecision, setCreationDecision] = useState<CreationDecisionPoint | null>(initialCreationDecision);
  const [canonDebt, setCanonDebt] = useState<RecordRow[]>([]);
  const [propagationQueue, setPropagationQueue] = useState<PropagationQueueRow[]>([]);
  const [propagationPlan, setPropagationPlan] = useState<PropagationPlan | null>(null);
  const [propagationConsequences, setPropagationConsequences] = useState<PropagationConsequence[]>([]);
  const [propagationDomains, setPropagationDomains] = useState<PropagationDomain[]>([]);
  const [propagationDispositions, setPropagationDispositions] = useState<PropagationDisposition[]>([]);
  const [stage12Run, setStage12Run] = useState<Stage12Run | null>(null);
  const [stage12FlowId, setStage12FlowId] = useState<number | null>(null);
  const [stage12SourceType, setStage12SourceType] = useState<"fact" | "under_review_fact" | "canon_debt" | "material" | "record_section" | "pass_report">("fact");
  const [stage12SourceRecordId, setStage12SourceRecordId] = useState("");
  const [stage12SourceSection, setStage12SourceSection] = useState("");
  const [stage12MaterialTitle, setStage12MaterialTitle] = useState("");
  const [stage12MaterialBody, setStage12MaterialBody] = useState("");
  const [stage12LensKey, setStage12LensKey] = useState("action_arena");
  const [stage12CoverageBody, setStage12CoverageBody] = useState("");
  const [stage12CardType, setStage12CardType] = useState<"action_arena" | "institution" | "counter_institution">("action_arena");
  const [stage12ExistingCardId, setStage12ExistingCardId] = useState("");
  const [stage12CardRelation, setStage12CardRelation] = useState("");
  const [stage12AdvisoryRecordId, setStage12AdvisoryRecordId] = useState("");
  const [stage12SkipStep, setStage12SkipStep] = useState("black_market_depth");
  const [stage12SkipUnresolved, setStage12SkipUnresolved] = useState(false);
  const [constraintRun, setConstraintRun] = useState<ConstraintRun | null>(null);
  const [constraintFlowId, setConstraintFlowId] = useState<number | null>(null);
  const [constraintSourceType, setConstraintSourceType] = useState<"fact" | "capability" | "constraint_card" | "canon_debt" | "material" | "record_section" | "pass_report">("fact");
  const [constraintSourceRecordId, setConstraintSourceRecordId] = useState("");
  const [constraintSourceSection, setConstraintSourceSection] = useState("");
  const [constraintMaterialTitle, setConstraintMaterialTitle] = useState("");
  const [constraintMaterialBody, setConstraintMaterialBody] = useState("");
  const [constraintSubject, setConstraintSubject] = useState("");
  const [constraintInventory, setConstraintInventory] = useState(emptyConstraintInventory);
  const [constraintCompositionType, setConstraintCompositionType] = useState("stacking");
  const [constraintCompositionBody, setConstraintCompositionBody] = useState("");
  const [constraintLeakage, setConstraintLeakage] = useState(emptyConstraintLeakage);
  const [constraintResidue, setConstraintResidue] = useState(emptyConstraintResidue);
  const [constraintInventoryId, setConstraintInventoryId] = useState("");
  const [constraintExistingCardId, setConstraintExistingCardId] = useState("");
  const [constraintCardRelation, setConstraintCardRelation] = useState("");
  const [constraintSourceStep, setConstraintSourceStep] = useState("constraint:challenge");
  const [constraintAdvisoryRecordId, setConstraintAdvisoryRecordId] = useState("");
  const [constraintSkipStep, setConstraintSkipStep] = useState("constraint:challenge");
  const [constraintSkipUnresolved, setConstraintSkipUnresolved] = useState(false);
  const [stage13Run, setStage13Run] = useState<Stage13Run | null>(null);
  const [stage13FlowId, setStage13FlowId] = useState<number | null>(null);
  const [stage13SourceRecordId, setStage13SourceRecordId] = useState("");
  const [stage13ImplicatedRecordIds, setStage13ImplicatedRecordIds] = useState("");
  const [stage13Title, setStage13Title] = useState("");
  const [stage13TriageStep, setStage13TriageStep] = useState("contradiction_statement");
  const [stage13TriageBody, setStage13TriageBody] = useState("");
  const [stage13WorkScale, setStage13WorkScale] = useState("");
  const [stage13Disposition, setStage13Disposition] = useState("");
  const [stage13DispositionNote, setStage13DispositionNote] = useState("");
  const [stage13RepairOperationDraft, setStage13RepairOperationDraft] = useState("");
  const [stage13RepairOperationOrder, setStage13RepairOperationOrder] = useState("");
  const [stage13RepairText, setStage13RepairText] = useState("");
  const [stage13RepairTargetRecordId, setStage13RepairTargetRecordId] = useState("");
  const [stage13RepairTargetStatus, setStage13RepairTargetStatus] = useState("");
  const [stage13RepairTargetTitle, setStage13RepairTargetTitle] = useState("");
  const [stage13RepairTargetBody, setStage13RepairTargetBody] = useState("");
  const [stage13RepairTargetNote, setStage13RepairTargetNote] = useState("");
  const [stage13RepairAdvisoryRecordId, setStage13RepairAdvisoryRecordId] = useState("");
  const [stage13ProposalTitle, setStage13ProposalTitle] = useState("");
  const [stage13ProposalBody, setStage13ProposalBody] = useState("");
  const [stage13ProposalTruthLayer, setStage13ProposalTruthLayer] = useState("Objective canon");
  const [stage13RetconType, setStage13RetconType] = useState("");
  const [stage13RetconCostTexts, setStage13RetconCostTexts] = useState<Record<string, string>>(emptyStage13RetconCosts);
  const [stage13PropagationAction, setStage13PropagationAction] = useState<"assign" | "decline">("assign");
  const [stage13PropagationDebtName, setStage13PropagationDebtName] = useState("");
  const [stage13PropagationBody, setStage13PropagationBody] = useState("");
  const [stage13PropagationReason, setStage13PropagationReason] = useState("");
  const [stage13SkipStep, setStage13SkipStep] = useState("boundary_guard");
  const [stage13SkipReason, setStage13SkipReason] = useState("");
  const [stage13OwedBoundaries, setStage13OwedBoundaries] = useState<OwedBoundaryRow[]>([]);
  const [stage13LedgerRecordId, setStage13LedgerRecordId] = useState("");
  const [stage13LedgerTitle, setStage13LedgerTitle] = useState("");
  const [stage13ProtectedRecordId, setStage13ProtectedRecordId] = useState("");
  const [stage13PropagationReportRecordId, setStage13PropagationReportRecordId] = useState("");
  const [stage13PropagationDispositionId, setStage13PropagationDispositionId] = useState("");
  const [stage13ProtectedEffectType, setStage13ProtectedEffectType] = useState("");
  const [stage13MysteryState, setStage13MysteryState] = useState("");
  const [stage13PreservationBoundary, setStage13PreservationBoundary] = useState("");
  const [stage13MysterySections, setStage13MysterySections] = useState<Record<string, string>>(emptyStage13MysterySections);
  const [stage13ChecklistOperation, setStage13ChecklistOperation] = useState("");
  const [stage13ChecklistEffectType, setStage13ChecklistEffectType] = useState("");
  const [stage13ChecklistBody, setStage13ChecklistBody] = useState("");
  const [stage13ChecklistSacredGuard, setStage13ChecklistSacredGuard] = useState("");
  const [qaFlowId, setQaFlowId] = useState<number | null>(null);
  const [qaPassId, setQaPassId] = useState<number | null>(null);
  const [qaSubjectType, setQaSubjectType] = useState<"record" | "world">("record");
  const [qaSubjectRecordId, setQaSubjectRecordId] = useState("");
  const [qaScorecard, setQaScorecard] = useState<QaScorecard | null>(null);
  const [qaScores, setQaScores] = useState<QaScore[]>([]);
  const [qaBand, setQaBand] = useState<QaBand | null>(null);
  const [qaTestNumber, setQaTestNumber] = useState("1");
  const [qaScore, setQaScore] = useState<"0" | "1" | "2" | "3" | "na">("2");
  const [qaNaReason, setQaNaReason] = useState("");
  const [qaNotes, setQaNotes] = useState("");
  const [qaRequiredRepair, setQaRequiredRepair] = useState("");
  const [qaLoadBearing, setQaLoadBearing] = useState(false);
  const [qaRepairRouted, setQaRepairRouted] = useState(false);
  const [qaProfile, setQaProfile] = useState<QaProfileFields>(emptyQaProfile);
  const [qaFloorConditions, setQaFloorConditions] = useState<QaFloorConditions>(emptyQaFloorConditions);
  const [qaFloorOverride, setQaFloorOverride] = useState(false);
  const [qaFloorOverrideReason, setQaFloorOverrideReason] = useState("");
  const [qaRepairKind, setQaRepairKind] = useState<"fact" | "canon_debt">("fact");
  const [qaDebtKind, setQaDebtKind] = useState("contradiction");
  const [search, setSearch] = useState("");
  const [snapshotPath, setSnapshotPath] = useState("");
  const [exportDirectory, setExportDirectory] = useState("");
  const [exportedMarkdown, setExportedMarkdown] = useState("");
  const [recordTypeKey, setRecordTypeKey] = useState("canon_fact");
  const [promotionRecordTypeKey, setPromotionRecordTypeKey] = useState("canon_fact");
  const [recordForm, setRecordForm] = useState(emptyRecordForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [facetVocabulary, setFacetVocabulary] = useState("consequence_mode");
  const [facetTerm, setFacetTerm] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [fromRecordId, setFromRecordId] = useState("");
  const [toRecordId, setToRecordId] = useState("");
  const [linkTypeKey, setLinkTypeKey] = useState("depends_on");
  const [promptRecordId, setPromptRecordId] = useState("");
  const [promptTemplateKey, setPromptTemplateKey] = useState("kernel_pressure");
  const [promptFlowKey, setPromptFlowKey] = useState<PromptFlowKey>("creation");
  const [promptStep, setPromptStep] = useState<PromptOutStep | null>(null);
  const [promptText, setPromptText] = useState("");
  const [templateEdit, setTemplateEdit] = useState("");
  const [responseText, setResponseText] = useState("");
  const [disposition, setDisposition] = useState("standing ruling");
  const [flowId, setFlowId] = useState<number | null>(null);
  const [kernelRecordId, setKernelRecordId] = useState<number | null>(null);
  const [kernelHeading, setKernelHeading] = useState("World premise");
  const [kernelBody, setKernelBody] = useState("");
  const [consequenceMode, setConsequenceMode] = useState("");
  const [seedTitle, setSeedTitle] = useState("");
  const [seedBody, setSeedBody] = useState("");
  const [seedTruthLayer, setSeedTruthLayer] = useState("");
  const [granularityRationale, setGranularityRationale] = useState("");
  const [granularityConfirmed, setGranularityConfirmed] = useState(false);
  const [admissionIntent, setAdmissionIntent] = useState("");
  const [admissionRecordId, setAdmissionRecordId] = useState("");
  const [admissionLevel, setAdmissionLevel] = useState("");
  const [workScale, setWorkScale] = useState("");
  const [admissionOperation, setAdmissionOperation] = useState("accept");
  const [gateConsequence, setGateConsequence] = useState("");
  const [gateQuietDomain, setGateQuietDomain] = useState("");
  const [gateNotApplicable, setGateNotApplicable] = useState("");
  const [canonDebtName, setCanonDebtName] = useState("");
  const [seedAuditFindings, setSeedAuditFindings] = useState("");
  const [propagationFactId, setPropagationFactId] = useState("");
  const [propagationDebtId, setPropagationDebtId] = useState("");
  const [propagationFlowId, setPropagationFlowId] = useState<number | null>(null);
  const [propagationOrderKey, setPropagationOrderKey] = useState("first");
  const [propagationDomainName, setPropagationDomainName] = useState("");
  const [propagationTriage, setPropagationTriage] = useState<"direct" | "dependency" | "reaction" | "negative">("direct");
  const [propagationText, setPropagationText] = useState("");
  const [propagationPressure, setPropagationPressure] = useState<"normal" | "high">("normal");
  const [propagationDispositionTerm, setPropagationDispositionTerm] = useState("answered");
  const [propagationConsequenceId, setPropagationConsequenceId] = useState("");
  const [propagationBoundary, setPropagationBoundary] = useState("");
  const [canonCurrentRows, setCanonCurrentRows] = useState<CanonWorkbenchCurrentRow[]>(initialCanonCurrent);
  const [canonAuditTrail, setCanonAuditTrail] = useState<CanonWorkbenchAuditItem[]>(initialCanonAudit);
  const [canonDetail, setCanonDetail] = useState<CanonWorkbenchDetail | null>(initialCanonDetail);
  const [selectedCanonRecordId, setSelectedCanonRecordId] = useState<number | null>(initialCanonDetail?.record.id ?? null);
  const [selectedAuditReportId, setSelectedAuditReportId] = useState<number | null>(initialCanonAudit[0]?.record.id ?? null);
  const [canonWorkbenchQuery, setCanonWorkbenchQuery] = useState("");
  const [canonWorkbenchRecordType, setCanonWorkbenchRecordType] = useState("");
  const [canonWorkbenchTruthLayer, setCanonWorkbenchTruthLayer] = useState("");
  const [canonWorkbenchStatus, setCanonWorkbenchStatus] = useState("");
  const [canonWorkbenchConsequenceMode, setCanonWorkbenchConsequenceMode] = useState("");
  const [canonWorkbenchScope, setCanonWorkbenchScope] = useState("");
  const [canonWorkbenchOpenDebt, setCanonWorkbenchOpenDebt] = useState(false);
  const [canonWorkbenchBranchRelevant, setCanonWorkbenchBranchRelevant] = useState(false);

  const truthLayers = useMemo(() => terms.filter((term) => term.vocabulary === "truth_layer"), [terms]);
  const canonStatuses = useMemo(() => terms.filter((term) => term.vocabulary === "canon_status"), [terms]);
  const vocabularies = useMemo(() => [...new Set(terms.map((term) => term.vocabulary))], [terms]);
  const facetTerms = useMemo(() => terms.filter((term) => term.vocabulary === facetVocabulary), [terms, facetVocabulary]);
  const consequenceModes = useMemo(() => terms.filter((term) => term.vocabulary === "consequence_mode"), [terms]);
  const constraintTypes = useMemo(() => terms.filter((term) => term.vocabulary === "constraint_type"), [terms]);
  const advisoryDispositions = useMemo(() => terms.filter((term) => term.vocabulary === "advisory_disposition"), [terms]);
  const admissionLevels = useMemo(() => terms.filter((term) => term.vocabulary === "admission_level"), [terms]);
  const workScales = useMemo(() => terms.filter((term) => term.vocabulary === "work_scale"), [terms]);
  const admissionOperations = useMemo(() => terms.filter((term) => term.vocabulary === "admission_decision_operation"), [terms]);
  const consequenceDispositions = useMemo(() => terms.filter((term) => term.vocabulary === "consequence_disposition"), [terms]);
  const contradictionDispositions = useMemo(() => terms.filter((term) => term.vocabulary === "contradiction_disposition"), [terms]);
  const repairOperationTerms = useMemo(() => terms.filter((term) => term.vocabulary === "repair_operation"), [terms]);
  const retconTypes = useMemo(() => terms.filter((term) => term.vocabulary === "retcon_type"), [terms]);
  const protectedEffectTypes = useMemo(() => terms.filter((term) => term.vocabulary === "protected_effect_type"), [terms]);
  const mysteryStates = useMemo(() => terms.filter((term) => term.vocabulary === "mystery_state"), [terms]);
  const preservationBoundaries = useMemo(() => terms.filter((term) => term.vocabulary === "preservation_boundary"), [terms]);
  const preservationOperations = useMemo(() => terms.filter((term) => term.vocabulary === "preservation_operation"), [terms]);
  const recordTypeByKey = useMemo(() => new Map(recordTypes.map((recordType) => [recordType.key, recordType])), [recordTypes]);
  const selectedRecordType = editingId == null ? recordTypeByKey.get(recordTypeKey) : recordTypeByKey.get(recordTypeKey);
  const editingReportRecord = editingId != null && selectedRecordType?.mutationRegime === "report";
  const canSaveRecord = Boolean(openWorld && recordForm.title.trim() && recordForm.truthLayer && recordForm.canonStatus && !editingReportRecord);
  const selectedHeadings = headings.filter((heading) => heading.record_type_key === recordTypeKey);
  const selectedTemplate = templates.find((template) => template.key === promptTemplateKey);
  const selectedAdmissionRecord = records.find((record) => record.id === Number(admissionRecordId));
  const displayedCreationDecision = creationDecision ?? defaultCreationDecision;
  const creationDecisionHandoff = creationDecision ? creationDecision.handoff : displayedCreationDecision.handoff;
  const creationHandoffReady = displayedCreationDecision.handoff.parkedSeeds.length > 0;
  const relatedAuditItems = useMemo(() => selectedCanonRecordId == null
    ? []
    : canonAuditTrail.filter((item) => item.affectedCurrentRecords.some((record) => record.id === selectedCanonRecordId)),
  [canonAuditTrail, selectedCanonRecordId]);

  useEffect(() => {
    api<HealthPayload>("/api/health")
      .then((health) => {
        setServerVersion(health.version);
        setServerStatus("ready");
      })
      .catch((error: Error) => {
        setServerStatus("failed");
        setMessage(error.message);
      });
    api<{ recordTypes: RecordTypeDefinition[]; linkTypes: LinkTypeDefinition[] }>("/api/catalog")
      .then((catalog) => {
        setCatalogStatus("ready");
        setRecordTypes(catalog.recordTypes);
        setLinkTypes(catalog.linkTypes);
        setRecordTypeKey(catalog.recordTypes[0]?.key ?? "canon_fact");
        setPromotionRecordTypeKey(catalog.recordTypes.find((recordType) => recordType.key === "canon_fact")?.key ?? catalog.recordTypes[0]?.key ?? "canon_fact");
        setLinkTypeKey(catalog.linkTypes[0]?.key ?? "depends_on");
        return loadRecentWorlds();
      })
      .catch((error: Error) => {
        setCatalogStatus("failed");
        setMessage(error.message);
      });
  }, []);

  useEffect(() => {
    if (!facetTerm && facetTerms[0]) setFacetTerm(facetTerms[0].term);
  }, [facetTerm, facetTerms]);

  useEffect(() => {
    if (!stage13RepairOperationDraft && repairOperationTerms[0]) setStage13RepairOperationDraft(repairOperationTerms[0].term);
    if (!stage13Disposition && contradictionDispositions[0]) setStage13Disposition(contradictionDispositions[0].term);
    if (!stage13RetconType && retconTypes[0]) setStage13RetconType(retconTypes[0].term);
    if (!stage13ProtectedEffectType && protectedEffectTypes[0]) setStage13ProtectedEffectType(protectedEffectTypes[0].term);
    if (!stage13ChecklistEffectType && protectedEffectTypes[0]) setStage13ChecklistEffectType(protectedEffectTypes[0].term);
    if (!stage13MysteryState && mysteryStates[0]) setStage13MysteryState(mysteryStates[0].term);
    if (!stage13PreservationBoundary && preservationBoundaries[0]) setStage13PreservationBoundary(preservationBoundaries[0].term);
    if (!stage13ChecklistOperation && preservationOperations[0]) setStage13ChecklistOperation(preservationOperations[0].term);
  }, [
    contradictionDispositions,
    mysteryStates,
    preservationBoundaries,
    preservationOperations,
    protectedEffectTypes,
    repairOperationTerms,
    retconTypes,
    stage13ChecklistEffectType,
    stage13ChecklistOperation,
    stage13Disposition,
    stage13MysteryState,
    stage13PreservationBoundary,
    stage13ProtectedEffectType,
    stage13RepairOperationDraft,
    stage13RetconType
  ]);

  useEffect(() => {
    const existing = stage13Run?.triage.find((entry) => entry.step_key === stage13TriageStep);
    setStage13TriageBody(existing?.body ?? "");
  }, [stage13Run, stage13TriageStep]);

  useEffect(() => {
    setTemplateEdit(selectedTemplate?.current_text ?? "");
  }, [selectedTemplate]);

  useEffect(() => {
    setPromptStep(null);
  }, [
    admissionLevel,
    admissionRecordId,
    constraintFlowId,
    constraintSourceRecordId,
    flowId,
    promptFlowKey,
    promptRecordId,
    promptTemplateKey,
    propagationFactId,
    propagationFlowId,
    qaFlowId,
    qaSubjectRecordId,
    stage12FlowId,
    stage12SourceRecordId,
    stage13FlowId,
    stage13SourceRecordId,
    stage13WorkScale,
    workScale
  ]);

  const loadRecentWorlds = async () => {
    const payload = await api<{ recentWorlds: RecentWorld[] }>("/api/recent-worlds");
    setRecentWorlds(payload.recentWorlds);
  };

  const loadWorldData = async () => {
    const [workflowMapPayload, recordPayload, linkPayload, vocabularyPayload, headingPayload, draftPayload, templatePayload, queuePayload, debtPayload, propagationQueuePayload, stage13OwedPayload, canonCurrentPayload, canonAuditPayload] = await Promise.all([
      api<WorkflowMapPayload>("/api/workflow-map"),
      api<{ records: RecordRow[] }>("/api/records"),
      api<{ links: LinkRow[] }>("/api/links"),
      api<{ terms: VocabularyTerm[] }>("/api/vocabularies"),
      api<{ headings: SectionHeading[] }>("/api/section-headings"),
      api<{ drafts: DraftRow[] }>("/api/drafts"),
      api<{ templates: PromptTemplate[] }>("/api/prompt-templates"),
      api<{ queue: AdmissionQueueRow[] }>("/api/admission/queue"),
      api<{ debt: RecordRow[] }>("/api/canon-debt?open=true"),
      api<{ queue: PropagationQueueRow[] }>("/api/propagation/queue"),
      api<{ queue: OwedBoundaryRow[] }>("/api/contradiction/owed-boundaries"),
      api<{ rows: CanonWorkbenchCurrentRow[] }>("/api/canon-workbench/current"),
      api<{ spine: CanonWorkbenchAuditItem[] }>("/api/canon-workbench/audit")
    ]);
    setWorkflowMap(workflowMapPayload);
    setRecords(recordPayload.records);
    setLinks(linkPayload.links);
    setTerms(vocabularyPayload.terms);
    setHeadings(headingPayload.headings);
    setDrafts(draftPayload.drafts);
    setTemplates(templatePayload.templates);
    setAdmissionQueue(queuePayload.queue);
    setCanonDebt(debtPayload.debt);
    setPropagationQueue(propagationQueuePayload.queue);
    setStage13OwedBoundaries(stage13OwedPayload.queue);
    setCanonCurrentRows(canonCurrentPayload.rows);
    setCanonAuditTrail(canonAuditPayload.spine);
  };

  const applyAdmissionDecision = (decision: AdmissionDecisionPoint | null) => {
    setAdmissionDecision(decision);
    if (!decision) return;
    setAdmissionRecordId(String(decision.selectedRecord.id));
    if (decision.severity.admissionLevel) setAdmissionLevel(decision.severity.admissionLevel);
    if (decision.severity.workScale) setWorkScale(decision.severity.workScale);
    setPromptFlowKey("admission");
    setPromptTemplateKey(decision.promptOut.templateKey);
    setPromptRecordId(String(decision.selectedRecord.id));
  };

  const loadAdmissionDecision = async (recordId = admissionRecordId, href?: string) => {
    const selectedId = optionalNumber(recordId);
    if (selectedId == null) return null;
    const payload = await api<{ decisionPoint: AdmissionDecisionPoint }>(href ?? `/api/admission/records/${selectedId}/decision-point`);
    applyAdmissionDecision(payload.decisionPoint);
    return payload.decisionPoint;
  };

  const selectAdmissionQueueRow = async (row: AdmissionQueueRow) => {
    setAdmissionRecordId(String(row.id));
    await loadAdmissionDecision(String(row.id), row.decisionPointHref);
  };

  const loadCanonWorkbench = async () => {
    const params = new URLSearchParams();
    if (canonWorkbenchRecordType) params.set("recordType", canonWorkbenchRecordType);
    if (canonWorkbenchTruthLayer) params.set("truthLayer", canonWorkbenchTruthLayer);
    if (canonWorkbenchStatus) params.set("canonStatus", canonWorkbenchStatus);
    if (canonWorkbenchConsequenceMode) params.set("consequenceMode", canonWorkbenchConsequenceMode);
    if (canonWorkbenchScope) params.set("continuityScope", canonWorkbenchScope);
    if (canonWorkbenchOpenDebt) params.set("openCanonDebt", "true");
    if (canonWorkbenchBranchRelevant) params.set("branchRelevant", "true");
    if (canonWorkbenchQuery) params.set("q", canonWorkbenchQuery);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    const [currentPayload, auditPayload] = await Promise.all([
      api<{ rows: CanonWorkbenchCurrentRow[] }>(`/api/canon-workbench/current${suffix}`),
      api<{ spine: CanonWorkbenchAuditItem[] }>("/api/canon-workbench/audit")
    ]);
    setCanonCurrentRows(currentPayload.rows);
    setCanonAuditTrail(auditPayload.spine);
    if (selectedCanonRecordId != null) {
      setCanonDetail(await api<CanonWorkbenchDetail>(`/api/canon-workbench/records/${selectedCanonRecordId}`));
    }
  };

  const createOrOpen = async (mode: "create" | "open", selectedPath = worldPath) => {
    try {
      const payload = await api<{
        path: string;
        records: RecordRow[];
        setupStatus?: SetupStatusPayload;
      }>(`/api/worlds/${mode}`, {
        method: "POST",
        body: JSON.stringify({ path: selectedPath })
      });
      setOpenWorld(payload.path);
      setWorldPath(payload.path);
      setRecords(payload.records);
      setActiveDestination("map");
      setSetupError(null);
      if (payload.setupStatus?.recentWorlds) setRecentWorlds(payload.setupStatus.recentWorlds);
      await loadWorldData();
      await loadRecentWorlds();
      setMessage(`${mode === "create" ? "Created" : "Opened"} ${payload.path}`);
    } catch (error) {
      const payload = error instanceof ApiError ? error.payload as { setupError?: SetupErrorState; setupStatus?: SetupStatusPayload } : null;
      const nextError = payload?.setupError ?? {
        action: mode,
        path: selectedPath,
        kind: "open_failed",
        message: error instanceof Error ? error.message : String(error),
        recovery: "Correct the world-file prerequisite shown here, then retry create or open."
      };
      setSetupError(nextError);
      if (payload?.setupStatus?.recentWorlds) setRecentWorlds(payload.setupStatus.recentWorlds);
      setMessage(nextError.message);
    }
  };

  const resetRecordForm = () => {
    setEditingId(null);
    setRecordForm(emptyRecordForm);
    setSections([]);
    setFacets([]);
  };

  const editRecord = async (record: RecordRow) => {
    setEditingId(record.id);
    setRecordTypeKey(record.recordTypeKey);
    setRecordForm({ title: record.title, body: record.body, truthLayer: record.truthLayer ?? "", canonStatus: record.canonStatus ?? "" });
    const [sectionPayload, facetPayload] = await Promise.all([
      api<{ sections: SectionRow[] }>(`/api/records/${record.id}/sections`),
      api<{ facets: FacetRow[] }>(`/api/records/${record.id}/facets`)
    ]);
    setSections(sectionPayload.sections);
    setFacets(facetPayload.facets);
    setPromptRecordId(String(record.id));
  };

  const saveRecord = async () => {
    const payload = await api<{ record: RecordRow }>(editingId == null ? "/api/records" : `/api/records/${editingId}`, {
      method: editingId == null ? "POST" : "PATCH",
      body: JSON.stringify({ recordTypeKey, ...recordForm, truthLayer: recordForm.truthLayer || null, canonStatus: recordForm.canonStatus || null })
    });
    if (sections.length) {
      await api(`/api/records/${payload.record.id}/sections`, {
        method: "PUT",
        body: JSON.stringify({ sections })
      });
    }
    setMessage(`Saved ${payload.record.shortId}`);
    resetRecordForm();
    await loadWorldData();
  };

  const updateSection = (heading: SectionHeading, body: string) => {
    setSections((current) => {
      const existing = current.find((section) => section.heading === heading.heading);
      if (existing) {
        return current.map((section) => section.heading === heading.heading ? { ...section, body, position: heading.position } : section);
      }
      return [...current, { id: 0, heading: heading.heading, body, position: heading.position }];
    });
  };

  const addFacet = async () => {
    if (editingId == null) return;
    await api(`/api/records/${editingId}/facets`, {
      method: "POST",
      body: JSON.stringify({ vocabulary: facetVocabulary, term: facetTerm })
    });
    const payload = await api<{ facets: FacetRow[] }>(`/api/records/${editingId}/facets`);
    setFacets(payload.facets);
  };

  const removeFacet = async (facetId: number) => {
    if (editingId == null) return;
    await api(`/api/records/${editingId}/facets/${facetId}`, { method: "DELETE" });
    const payload = await api<{ facets: FacetRow[] }>(`/api/records/${editingId}/facets`);
    setFacets(payload.facets);
  };

  const saveDraft = async () => {
    await api("/api/drafts", {
      method: "POST",
      body: JSON.stringify({ title: draftTitle, body: draftBody })
    });
    setDraftTitle("");
    setDraftBody("");
    await loadWorldData();
  };

  const convertDraft = async (draft: DraftRow) => {
    await api(`/api/drafts/${draft.id}/convert`, {
      method: "POST",
      body: JSON.stringify({ recordTypeKey, truthLayer: recordForm.truthLayer, canonStatus: recordForm.canonStatus })
    });
    await loadWorldData();
  };

  const discardDraft = async (draft: DraftRow) => {
    await api(`/api/drafts/${draft.id}`, { method: "DELETE" });
    await loadWorldData();
  };

  const runSearch = async () => {
    const payload = await api<{ records: RecordRow[] }>(`/api/search?q=${encodeURIComponent(search)}`);
    setRecords(payload.records);
  };

  const createLink = async () => {
    await api("/api/links", {
      method: "POST",
      body: JSON.stringify({ fromRecordId: Number(fromRecordId), toRecordId: Number(toRecordId), linkTypeKey })
    });
    await loadWorldData();
  };

  const traverseLinks = async () => {
    const payload = await api<{ links: LinkRow[] }>(`/api/links/traverse?recordId=${encodeURIComponent(fromRecordId)}&linkTypeKey=${encodeURIComponent(linkTypeKey)}`);
    setLinks(payload.links);
  };

  const promoteRecord = async (record: RecordRow) => {
    await api(`/api/records/${record.id}/promote`, {
      method: "POST",
      body: JSON.stringify({ recordTypeKey: promotionRecordTypeKey })
    });
    await loadWorldData();
  };

  const snapshot = async () => {
    const payload = await api<{ path: string }>("/api/worlds/snapshot", {
      method: "POST",
      body: JSON.stringify({ destinationPath: snapshotPath || undefined })
    });
    setMessage(`Snapshot written to ${payload.path}`);
  };

  const exportWorldMarkdown = async () => {
    const payload = await api<{ directory: string; files: string[] }>("/api/worlds/export/markdown", {
      method: "POST",
      body: JSON.stringify({ destinationPath: exportDirectory })
    });
    setMessage(`Markdown export written to ${payload.directory} (${payload.files.length} files)`);
  };

  const exportRecordMarkdown = async (record: RecordRow) => {
    const payload = await api<{ markdown: string }>(`/api/records/${record.id}/export/markdown`);
    setExportedMarkdown(payload.markdown);
    setMessage(`Rendered markdown for ${record.shortId}`);
  };

  const selectCurrentCanonRow = async (row: CanonWorkbenchCurrentRow) => {
    setSelectedCanonRecordId(row.id);
    setSelectedAuditReportId(null);
    setCanonDetail(await api<CanonWorkbenchDetail>(`/api/canon-workbench/records/${row.id}`));
  };

  const selectAuditTrailItem = async (item: CanonWorkbenchAuditItem) => {
    setSelectedAuditReportId(item.record.id);
    const selectedRecord = item.affectedCurrentRecords[0] ?? item.record;
    setSelectedCanonRecordId(selectedRecord.id);
    setCanonDetail(await api<CanonWorkbenchDetail>(`/api/canon-workbench/records/${selectedRecord.id}`));
  };

  const promptStepFlowId = () => {
    if (promptFlowKey === "creation") return flowId ?? undefined;
    if (promptFlowKey === "propagation") return propagationFlowId ?? undefined;
    if (promptFlowKey === "qa") return qaFlowId ?? undefined;
    if (promptFlowKey === "institutional_economic_suppression") return stage12FlowId ?? undefined;
    if (promptFlowKey === "constraint_composition") return constraintFlowId ?? undefined;
    if (promptFlowKey === "contradiction") return stage13FlowId ?? undefined;
    return undefined;
  };

  const promptStepRecordId = () =>
    optionalNumber(promptRecordId)
    ?? (promptFlowKey === "admission"
      ? optionalNumber(admissionRecordId)
      : promptFlowKey === "propagation"
        ? optionalNumber(propagationFactId)
        : promptFlowKey === "qa"
          ? optionalNumber(qaSubjectRecordId)
          : promptFlowKey === "institutional_economic_suppression"
            ? optionalNumber(stage12SourceRecordId)
            : promptFlowKey === "constraint_composition"
              ? optionalNumber(constraintSourceRecordId)
              : promptFlowKey === "contradiction"
                ? optionalNumber(stage13SourceRecordId)
                : undefined);

  const loadPromptStep = async () => {
    const payload = await api<{ step: PromptOutStep }>("/api/prompt-out/steps", {
      method: "POST",
      body: JSON.stringify({
        flowKey: promptFlowKey,
        flowId: promptStepFlowId(),
        templateKey: promptTemplateKey,
        recordId: promptStepRecordId(),
        stepKey: promptFlowKey === "constraint_composition" ? "constraint:challenge" : promptTemplateKey,
        label: selectedTemplate?.role_name ?? promptTemplateKey,
        admissionLevel: admissionLevel || undefined,
        workScale: promptFlowKey === "contradiction" ? (stage13WorkScale || undefined) : (workScale || undefined)
      })
    });
    setPromptStep(payload.step);
    setMessage(`Loaded Prompt-out step ${payload.step.label}`);
    return payload.step;
  };

  const loadAdmissionPromptStep = async () => {
    if (!admissionDecision) return null;
    const request = admissionDecision.promptOut.stepRequest;
    setPromptFlowKey("admission");
    setPromptTemplateKey(admissionDecision.promptOut.templateKey);
    setPromptRecordId(String(admissionDecision.promptOut.stepRequest.body.recordId));
    const payload = await api<{ step: PromptOutStep }>(request.href, {
      method: request.method,
      body: JSON.stringify(request.body)
    });
    setPromptStep(payload.step);
    setPromptText(admissionDecision.promptOut.preview.promptText);
    setMessage(`Loaded Admission Prompt-out step ${payload.step.label}`);
    return payload.step;
  };

  const loadCreationPromptStep = async () => {
    if (!creationDecision?.promptOut.stepRequest && !creationDecision?.promptOut.modes?.some((mode) => mode.stepRequest)) return null;
    const mode = creationDecision.promptOut.modes?.find((mode) => mode.available && mode.stepRequest) ?? null;
    const request = mode?.stepRequest ?? creationDecision.promptOut.stepRequest;
    if (!request) return null;
    setPromptFlowKey("creation");
    setPromptTemplateKey(String(request.body.templateKey ?? creationDecision.promptOut.templateKey));
    setPromptRecordId(String(request.body.recordId ?? ""));
    const payload = await api<{ step: PromptOutStep }>(request.href, {
      method: request.method,
      body: JSON.stringify(request.body)
    });
    setPromptStep(payload.step);
    setPromptText(creationDecision.promptOut.preview.promptText);
    setMessage(`Loaded Creation Prompt-out step ${payload.step.label}`);
    return payload.step;
  };

  const ensurePromptStep = async () => promptStep ?? loadPromptStep();

  const generatePrompt = async () => {
    const promptStep = await ensurePromptStep();
    const payload = await api<{ prompt: string }>(promptStep.actions.generate.href, { method: promptStep.actions.generate.method });
    setPromptText(payload.prompt);
  };

  const savePromptTemplate = async () => {
    await api(`/api/prompt-templates/${promptTemplateKey}`, {
      method: "PATCH",
      body: JSON.stringify({ text: templateEdit })
    });
    await loadWorldData();
  };

  const revertPromptTemplate = async () => {
    await api(`/api/prompt-templates/${promptTemplateKey}/revert`, { method: "POST" });
    await loadWorldData();
  };

  const storeAdvisory = async () => {
    const promptStep = await ensurePromptStep();
    const artifact = await api<{ record: RecordRow }>(promptStep.actions.storeAdvisory.href, {
      method: promptStep.actions.storeAdvisory.method,
      body: JSON.stringify({ promptText, responseText })
    });
    await api(promptStep.actions.disposition.href, {
      method: promptStep.actions.disposition.method,
      body: JSON.stringify({ advisoryRecordId: artifact.record.id, disposition, note: responseText, standingRuling: disposition === "standing ruling" })
    });
    await loadWorldData();
    setMessage(`Stored ${artifact.record.shortId}`);
  };

  const startFlow = async () => {
    const payload = await api<{ flow: { id: number; kernel_record_id?: number }; decisionPoint: CreationDecisionPoint }>("/api/flows/creation/start", { method: "POST" });
    setFlowId(payload.flow.id);
    if (payload.flow.kernel_record_id) setKernelRecordId(payload.flow.kernel_record_id);
    setCreationDecision(payload.decisionPoint);
  };

  const saveKernelStep = async () => {
    if (flowId == null) return;
    const payload = await api<{ kernel: { id: number }; decisionPoint: CreationDecisionPoint }>("/api/flows/creation/kernel-step", {
      method: "POST",
      body: JSON.stringify({ flowId, heading: kernelHeading, body: kernelBody, consequenceMode: consequenceMode || undefined })
    });
    setKernelRecordId(payload.kernel.id);
    setCreationDecision(payload.decisionPoint);
    await loadWorldData();
  };

  const skipPrompt = async () => {
    const promptStep = await ensurePromptStep();
    const stage12 = promptStep.context.flowKey === "institutional_economic_suppression";
    const constraint = promptStep.context.flowKey === "constraint_composition";
    await api(promptStep.actions.skip.href, {
      method: promptStep.actions.skip.method,
      body: JSON.stringify({
        reason: gateNotApplicable || undefined,
        unresolved: stage12 ? stage12SkipUnresolved : constraint ? constraintSkipUnresolved : undefined,
        debtName: stage12 && stage12SkipUnresolved
          ? (canonDebtName || "Stage-12 skipped-work debt")
          : constraint && constraintSkipUnresolved
            ? (canonDebtName || "Constraint Composition skipped-work debt")
            : undefined,
        workScale: constraint ? (workScale || undefined) : undefined
      })
    });
    await loadWorldData();
    if (constraintFlowId != null) await refreshConstraintRun(constraintFlowId);
  };

  const decompose = async () => {
    if (flowId == null || kernelRecordId == null) return;
    const payload = await api<{ decisionPoint: CreationDecisionPoint }>("/api/flows/creation/decompose", {
      method: "POST",
      body: JSON.stringify({
        flowId,
        kernelRecordId,
        granularityRationale,
        admissionIntent,
        seeds: [{ title: seedTitle, body: seedBody, truthLayer: seedTruthLayer, granularityConfirmed }]
      })
    });
    setCreationDecision(payload.decisionPoint);
    setSeedTitle("");
    setSeedBody("");
    setGranularityRationale("");
    setGranularityConfirmed(false);
    setAdmissionIntent("");
    await loadWorldData();
  };

  const proposeRecord = async (record: RecordRow) => {
    await api(`/api/admission/propose-record/${record.id}`, { method: "POST" });
    setAdmissionRecordId(String(record.id));
    await loadWorldData();
    await loadAdmissionDecision(String(record.id));
  };

  const proposeDraft = async (draft: DraftRow) => {
    await api(`/api/admission/propose-draft/${draft.id}`, {
      method: "POST",
      body: JSON.stringify({ truthLayer: recordForm.truthLayer })
    });
    await loadWorldData();
  };

  const declareSeverity = async () => {
    if (!admissionRecordId) return;
    const payload = await api<{ decisionPoint: AdmissionDecisionPoint }>(`/api/admission/records/${admissionRecordId}/severity`, {
      method: "POST",
      body: JSON.stringify({ admissionLevel, workScale })
    });
    applyAdmissionDecision(payload.decisionPoint);
    await loadWorldData();
  };

  const startAdmission = async () => {
    if (!admissionRecordId) return;
    const payload = await api<{ decisionPoint: AdmissionDecisionPoint }>(`/api/admission/records/${admissionRecordId}/start`, { method: "POST" });
    applyAdmissionDecision(payload.decisionPoint);
    await loadWorldData();
  };

  const completeAdmission = async () => {
    if (!admissionRecordId) return;
    const payload = await api<{ decisionPoint: AdmissionDecisionPoint }>("/api/admission/gate/complete", {
      method: "POST",
      body: JSON.stringify({
        recordId: Number(admissionRecordId),
        truthLayer: recordForm.truthLayer || selectedAdmissionRecord?.truthLayer,
        canonStatus: recordForm.canonStatus || "accepted",
        operations: [admissionOperation],
        consequenceText: gateConsequence,
        notApplicableReasons: gateNotApplicable ? [gateNotApplicable] : [],
        quietDomainDeclarations: gateQuietDomain ? [gateQuietDomain] : []
      })
    });
    applyAdmissionDecision(payload.decisionPoint);
    await loadWorldData();
  };

  const admitMinorBatch = async () => {
    await api("/api/admission/minor-batch", {
      method: "POST",
      body: JSON.stringify({
        source: "web admission panel",
        rows: [{
          title: recordForm.title || "Minor admission row",
          fact: recordForm.body || recordForm.title,
          scope: "declared in admission panel",
          truthLayer: recordForm.truthLayer,
          status: recordForm.canonStatus || "accepted",
          operations: [admissionOperation],
          consequenceCheck: gateConsequence
        }]
      })
    });
    await loadWorldData();
  };

  const runSeedAudit = async () => {
    if (!admissionRecordId) return;
    const payload = await api<{ decisionPoints: AdmissionDecisionPoint[] }>("/api/admission/seed-audit", {
      method: "POST",
      body: JSON.stringify({ seedRecordIds: [Number(admissionRecordId)], findings: seedAuditFindings, decision: "proceed" })
    });
    applyAdmissionDecision(payload.decisionPoints[0] ?? null);
    await loadWorldData();
  };

  const createDebt = async () => {
    await api("/api/canon-debt", {
      method: "POST",
      body: JSON.stringify({ name: canonDebtName, scope: "admission", assignee: "steward" })
    });
    setCanonDebtName("");
    await loadWorldData();
  };

  const closeDebt = async (debt: RecordRow) => {
    await api(`/api/canon-debt/${debt.id}/close`, { method: "POST" });
    await loadWorldData();
  };

  const skipAdmissionInstrument = async () => {
    const payload = await api<{ decisionPoint: AdmissionDecisionPoint | null }>("/api/admission/skip", {
      method: "POST",
      body: JSON.stringify({ recordId: admissionRecordId ? Number(admissionRecordId) : undefined, stepKey: "web_admission_instrument", admissionLevel, workScale, reason: gateNotApplicable || undefined })
    });
    applyAdmissionDecision(payload.decisionPoint);
    await loadWorldData();
  };

  const loadPropagationRun = async (flowId: number) => {
    const payload = await api<{
      plan: PropagationPlan;
      consequences: PropagationConsequence[];
      domainSweeps: PropagationDomain[];
      dispositions: PropagationDisposition[];
    }>(`/api/propagation/runs/${flowId}`);
    setPropagationPlan(payload.plan);
    setPropagationConsequences(payload.consequences);
    setPropagationDomains(payload.domainSweeps);
    setPropagationDispositions(payload.dispositions);
  };

  const startPropagation = async () => {
    if (!propagationFactId) return;
    const payload = await api<{ flow: { id: number } }>("/api/propagation/runs/start", {
      method: "POST",
      body: JSON.stringify({ factRecordId: Number(propagationFactId), debtRecordId: propagationDebtId ? Number(propagationDebtId) : undefined })
    });
    setPropagationFlowId(payload.flow.id);
    await loadPropagationRun(payload.flow.id);
    await loadWorldData();
  };

  const loadPropagationPlan = async () => {
    if (!propagationFactId) return;
    const payload = await api<{ plan: PropagationPlan }>(`/api/propagation/records/${propagationFactId}/plan`);
    setPropagationPlan(payload.plan);
    setPropagationDomainName(payload.plan.domains[0] ?? "");
    setPropagationOrderKey(payload.plan.orders[1]?.key ?? payload.plan.orders[0]?.key ?? "first");
  };

  const savePropagationConsequence = async () => {
    if (propagationFlowId == null) return;
    const payload = await api<{ consequence: PropagationConsequence }>("/api/propagation/consequences", {
      method: "POST",
      body: JSON.stringify({ flowId: propagationFlowId, orderKey: propagationOrderKey, domainName: propagationDomainName || undefined, body: propagationText, pressure: propagationPressure })
    });
    setPropagationConsequenceId(String(payload.consequence.id));
    setPropagationText("");
    await loadPropagationRun(propagationFlowId);
  };

  const savePropagationDomain = async () => {
    if (propagationFlowId == null) return;
    await api("/api/propagation/domains", {
      method: "POST",
      body: JSON.stringify({ flowId: propagationFlowId, domainName: propagationDomainName, triage: propagationTriage, declaration: propagationText })
    });
    setPropagationText("");
    await loadPropagationRun(propagationFlowId);
  };

  const savePropagationDisposition = async () => {
    if (!propagationConsequenceId) return;
    await api("/api/propagation/dispositions", {
      method: "POST",
      body: JSON.stringify({
        consequenceId: Number(propagationConsequenceId),
        disposition: propagationDispositionTerm,
        note: propagationText,
        debtName: propagationDispositionTerm === "assigned as canon debt" ? propagationBoundary || "Propagation follow-up debt" : undefined,
        preservationBoundary: propagationDispositionTerm === "protected as a mystery boundary" ? propagationBoundary : undefined
      })
    });
    setPropagationText("");
    setPropagationBoundary("");
    if (propagationFlowId != null) await loadPropagationRun(propagationFlowId);
    await loadWorldData();
  };

  const proposePropagationFact = async () => {
    if (propagationFlowId == null) return;
    await api("/api/propagation/propose-fact", {
      method: "POST",
      body: JSON.stringify({ flowId: propagationFlowId, title: recordForm.title, body: recordForm.body, truthLayer: recordForm.truthLayer })
    });
    await loadWorldData();
  };

  const skipPropagation = async () => {
    await api("/api/propagation/skip", {
      method: "POST",
      body: JSON.stringify({ flowId: propagationFlowId ?? undefined, stepKey: "web_propagation_step", admissionLevel, workScale, reason: gateNotApplicable || undefined })
    });
    await loadWorldData();
  };

  const closePropagation = async () => {
    if (propagationFlowId == null) return;
    const payload = await api<{ report: RecordRow }>(`/api/propagation/runs/${propagationFlowId}/close`, { method: "POST" });
    setMessage(`Closed propagation run with ${payload.report.shortId}`);
    await loadPropagationRun(propagationFlowId);
    await loadWorldData();
  };

  const applyStage12Run = (payload: Stage12Run) => {
    setStage12Run(payload);
    setStage12FlowId(payload.flow.id);
    setStage12LensKey(payload.doctrine.lenses[0]?.key ?? "action_arena");
    if (payload.source.sourceRecordId != null) setStage12SourceRecordId(String(payload.source.sourceRecordId));
  };

  const refreshStage12Run = async (flowId = stage12FlowId) => {
    if (flowId == null) return;
    applyStage12Run(await api<Stage12Run>(`/api/institutional/runs/${flowId}`));
  };

  const stage12StartPayload = () => {
    if (stage12SourceType === "material") {
      return { sourceType: stage12SourceType, materialTitle: stage12MaterialTitle, materialBody: stage12MaterialBody };
    }
    if (stage12SourceType === "record_section") {
      return { sourceType: stage12SourceType, recordId: Number(stage12SourceRecordId), sectionHeading: stage12SourceSection };
    }
    if (stage12SourceType === "pass_report") {
      return { sourceType: stage12SourceType, reportRecordId: Number(stage12SourceRecordId) };
    }
    return { sourceType: stage12SourceType, recordId: Number(stage12SourceRecordId) };
  };

  const startStage12Run = async () => {
    const payload = await api<Stage12Run>("/api/institutional/runs/start", {
      method: "POST",
      body: JSON.stringify(stage12StartPayload())
    });
    applyStage12Run(payload);
    setPromptFlowKey("institutional_economic_suppression");
    setPromptTemplateKey("institution_economy_analyst");
    await loadWorldData();
  };

  const saveStage12Coverage = async () => {
    if (stage12FlowId == null) return;
    await api("/api/institutional/coverage", {
      method: "POST",
      body: JSON.stringify({ flowId: stage12FlowId, lensKey: stage12LensKey, body: stage12CoverageBody })
    });
    setStage12CoverageBody("");
    await refreshStage12Run(stage12FlowId);
  };

  const createOrLinkStage12Card = async () => {
    if (stage12FlowId == null) return;
    await api("/api/institutional/cards", {
      method: "POST",
      body: JSON.stringify({
        flowId: stage12FlowId,
        cardTypeKey: stage12CardType,
        existingRecordId: stage12ExistingCardId ? Number(stage12ExistingCardId) : undefined,
        title: recordForm.title || undefined,
        body: recordForm.body || undefined,
        lensKey: stage12LensKey,
        relation: stage12CardRelation || undefined,
        advisoryRecordId: stage12AdvisoryRecordId ? Number(stage12AdvisoryRecordId) : undefined
      })
    });
    await refreshStage12Run(stage12FlowId);
    await loadWorldData();
  };

  const routeStage12Proposal = async () => {
    if (stage12FlowId == null) return;
    await api("/api/institutional/proposals", {
      method: "POST",
      body: JSON.stringify({
        flowId: stage12FlowId,
        lensKey: stage12LensKey,
        title: recordForm.title,
        body: recordForm.body || stage12CoverageBody,
        truthLayer: recordForm.truthLayer || "Objective canon",
        advisoryRecordId: stage12AdvisoryRecordId ? Number(stage12AdvisoryRecordId) : undefined
      })
    });
    await refreshStage12Run(stage12FlowId);
    await loadWorldData();
  };

  const mintStage12Debt = async () => {
    if (stage12FlowId == null) return;
    await api("/api/institutional/debt", {
      method: "POST",
      body: JSON.stringify({
        flowId: stage12FlowId,
        lensKey: stage12LensKey,
        name: canonDebtName || "Stage-12 follow-up debt",
        reason: stage12CoverageBody || gateNotApplicable,
        severityOrConsequenceMode: workScale || consequenceMode || undefined,
        advisoryRecordId: stage12AdvisoryRecordId ? Number(stage12AdvisoryRecordId) : undefined
      })
    });
    await refreshStage12Run(stage12FlowId);
    await loadWorldData();
  };

  const recordStage12Skip = async () => {
    if (stage12FlowId == null) return;
    await api("/api/institutional/skips", {
      method: "POST",
      body: JSON.stringify({
        flowId: stage12FlowId,
        stepKey: stage12SkipStep,
        admissionLevel: admissionLevel || undefined,
        workScale: workScale || undefined,
        reason: gateNotApplicable || undefined,
        unresolved: stage12SkipUnresolved,
        debtName: stage12SkipUnresolved ? (canonDebtName || "Stage-12 skipped-work debt") : undefined
      })
    });
    await refreshStage12Run(stage12FlowId);
    await loadWorldData();
  };

  const closeStage12Run = async () => {
    if (stage12FlowId == null) return;
    const payload = await api<Stage12Run>(`/api/institutional/runs/${stage12FlowId}/close`, { method: "POST" });
    applyStage12Run(payload);
    setMessage(`Closed stage-12 run with ${payload.report.shortId}`);
    await loadWorldData();
  };

  const applyConstraintRun = (payload: ConstraintRun) => {
    setConstraintRun(payload);
    setConstraintFlowId(payload.flow.id);
    if (payload.source.sourceRecordId != null) setConstraintSourceRecordId(String(payload.source.sourceRecordId));
    setConstraintSubject(payload.source.constrainedSubject);
    if (payload.inventory[0] && !constraintInventoryId) setConstraintInventoryId(String(payload.inventory[0].id));
  };

  const refreshConstraintRun = async (flowId = constraintFlowId) => {
    if (flowId == null) return;
    applyConstraintRun(await api<ConstraintRun>(`/api/constraint-composition/runs/${flowId}`));
  };

  const constraintStartPayload = () => {
    if (constraintSourceType === "material") {
      return {
        sourceType: constraintSourceType,
        materialTitle: constraintMaterialTitle,
        materialBody: constraintMaterialBody,
        constrainedSubject: constraintSubject || undefined
      };
    }
    if (constraintSourceType === "record_section") {
      return {
        sourceType: constraintSourceType,
        recordId: Number(constraintSourceRecordId),
        sectionHeading: constraintSourceSection,
        constrainedSubject: constraintSubject || undefined
      };
    }
    if (constraintSourceType === "pass_report") {
      return { sourceType: constraintSourceType, reportRecordId: Number(constraintSourceRecordId) };
    }
    return {
      sourceType: constraintSourceType,
      recordId: Number(constraintSourceRecordId),
      constrainedSubject: constraintSubject || undefined
    };
  };

  const startConstraintRun = async () => {
    const payload = await api<ConstraintRun>("/api/constraint-composition/runs/start", {
      method: "POST",
      body: JSON.stringify(constraintStartPayload())
    });
    applyConstraintRun(payload);
    setPromptFlowKey("constraint_composition");
    setPromptTemplateKey("constraint_challenger");
    if (payload.promptOut.sourceRecordId != null) setPromptRecordId(String(payload.promptOut.sourceRecordId));
    await loadWorldData();
  };

  const saveConstraintInventory = async () => {
    if (constraintFlowId == null) return;
    await api("/api/constraint-composition/inventory", {
      method: "POST",
      body: JSON.stringify({ flowId: constraintFlowId, ...constraintInventory })
    });
    await refreshConstraintRun(constraintFlowId);
  };

  const saveConstraintComposition = async () => {
    if (constraintFlowId == null) return;
    await api("/api/constraint-composition/composition", {
      method: "POST",
      body: JSON.stringify({ flowId: constraintFlowId, analysisType: constraintCompositionType, body: constraintCompositionBody })
    });
    setConstraintCompositionBody("");
    await refreshConstraintRun(constraintFlowId);
  };

  const saveConstraintLeakage = async () => {
    if (constraintFlowId == null) return;
    await api("/api/constraint-composition/leakage", {
      method: "POST",
      body: JSON.stringify({ flowId: constraintFlowId, ...constraintLeakage })
    });
    await refreshConstraintRun(constraintFlowId);
  };

  const saveConstraintResidue = async () => {
    if (constraintFlowId == null) return;
    await api("/api/constraint-composition/residue", {
      method: "POST",
      body: JSON.stringify({ flowId: constraintFlowId, ...constraintResidue })
    });
    await refreshConstraintRun(constraintFlowId);
  };

  const createOrLinkConstraintCard = async () => {
    if (constraintFlowId == null) return;
    await api("/api/constraint-composition/cards", {
      method: "POST",
      body: JSON.stringify({
        flowId: constraintFlowId,
        existingRecordId: constraintExistingCardId ? Number(constraintExistingCardId) : undefined,
        inventoryId: constraintInventoryId ? Number(constraintInventoryId) : undefined,
        title: recordForm.title || undefined,
        body: recordForm.body || undefined,
        relation: constraintCardRelation || undefined,
        advisoryRecordId: constraintAdvisoryRecordId ? Number(constraintAdvisoryRecordId) : undefined
      })
    });
    await refreshConstraintRun(constraintFlowId);
    await loadWorldData();
  };

  const routeConstraintProposal = async () => {
    if (constraintFlowId == null) return;
    await api("/api/constraint-composition/proposals", {
      method: "POST",
      body: JSON.stringify({
        flowId: constraintFlowId,
        sourceStep: constraintSourceStep,
        title: recordForm.title,
        body: recordForm.body || constraintCompositionBody || constraintInventory.constraintStatement,
        truthLayer: recordForm.truthLayer || "Objective canon",
        advisoryRecordId: constraintAdvisoryRecordId ? Number(constraintAdvisoryRecordId) : undefined
      })
    });
    await refreshConstraintRun(constraintFlowId);
    await loadWorldData();
  };

  const mintConstraintDebt = async () => {
    if (constraintFlowId == null) return;
    await api("/api/constraint-composition/debt", {
      method: "POST",
      body: JSON.stringify({
        flowId: constraintFlowId,
        sourceStep: constraintSourceStep,
        name: canonDebtName || "Constraint Composition follow-up debt",
        reason: gateNotApplicable || constraintCompositionBody || constraintInventory.residue,
        severityOrConsequenceMode: workScale || consequenceMode || undefined,
        advisoryRecordId: constraintAdvisoryRecordId ? Number(constraintAdvisoryRecordId) : undefined
      })
    });
    await refreshConstraintRun(constraintFlowId);
    await loadWorldData();
  };

  const recordConstraintSkip = async () => {
    if (constraintFlowId == null) return;
    const payload = await api<{ step: PromptOutStep }>("/api/prompt-out/steps", {
      method: "POST",
      body: JSON.stringify({
        flowKey: "constraint_composition",
        flowId: constraintFlowId,
        templateKey: "constraint_challenger",
        recordId: optionalNumber(constraintSourceRecordId),
        stepKey: constraintSkipStep,
        label: "Constraint challenger",
        workScale: workScale || undefined
      })
    });
    await api(payload.step.actions.skip.href, {
      method: payload.step.actions.skip.method,
      body: JSON.stringify({
        reason: gateNotApplicable || undefined,
        unresolved: constraintSkipUnresolved,
        debtName: constraintSkipUnresolved ? (canonDebtName || "Constraint Composition skipped-work debt") : undefined,
        workScale: workScale || undefined
      })
    });
    setPromptStep(payload.step);
    await refreshConstraintRun(constraintFlowId);
    await loadWorldData();
  };

  const closeConstraintRun = async () => {
    if (constraintFlowId == null) return;
    const payload = await api<ConstraintRun>(`/api/constraint-composition/runs/${constraintFlowId}/close`, { method: "POST" });
    applyConstraintRun(payload);
    setMessage(`Closed Constraint Composition run with ${payload.report.shortId}`);
    await loadWorldData();
  };

  const applyStage13Run = (payload: Stage13Run) => {
    setStage13Run(payload);
    setStage13FlowId(payload.flow.id);
    if (payload.flow.contradiction_source_record_id != null) setStage13SourceRecordId(String(payload.flow.contradiction_source_record_id));
    if (payload.workScale) setStage13WorkScale(payload.workScale);
    if (payload.disposition) {
      setStage13Disposition(payload.disposition.disposition);
      setStage13DispositionNote(payload.disposition.note);
    }
  };

  const refreshStage13Run = async (flowId = stage13FlowId) => {
    if (flowId == null) return;
    applyStage13Run(await api<Stage13Run>(`/api/contradiction/runs/${flowId}`));
  };

  const startStage13Run = async () => {
    try {
      const payload = await api<{ flow: { id: number } }>("/api/contradiction/runs/start", {
        method: "POST",
        body: JSON.stringify({
          sourceRecordId: stage13SourceRecordId ? Number(stage13SourceRecordId) : undefined,
          implicatedRecordIds: parseNumberList(stage13ImplicatedRecordIds),
          title: stage13Title || undefined
        })
      });
      setStage13FlowId(payload.flow.id);
      setPromptFlowKey("contradiction");
      setPromptTemplateKey("repair_challenge");
      await refreshStage13Run(payload.flow.id);
      await loadWorldData();
    } catch (error) {
      setMessage(`Stage 13 start blocked: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const saveStage13Triage = async () => {
    if (stage13FlowId == null) return;
    try {
      await api("/api/contradiction/triage", {
        method: "POST",
        body: JSON.stringify({ flowId: stage13FlowId, stepKey: stage13TriageStep, body: stage13TriageBody })
      });
      await refreshStage13Run(stage13FlowId);
    } catch (error) {
      setMessage(`Stage 13 triage blocked: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const saveStage13Scale = async () => {
    if (stage13FlowId == null) return;
    try {
      await api("/api/contradiction/scale", {
        method: "POST",
        body: JSON.stringify({ flowId: stage13FlowId, workScale: stage13WorkScale })
      });
      await refreshStage13Run(stage13FlowId);
    } catch (error) {
      setMessage(`Stage 13 work scale blocked: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const saveStage13Disposition = async () => {
    if (stage13FlowId == null) return;
    try {
      await api("/api/contradiction/disposition", {
        method: "POST",
        body: JSON.stringify({ flowId: stage13FlowId, disposition: stage13Disposition, note: stage13DispositionNote || undefined })
      });
      await refreshStage13Run(stage13FlowId);
    } catch (error) {
      setMessage(`Stage 13 disposition blocked: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const closeStage13Run = async () => {
    if (stage13FlowId == null) return;
    try {
      const payload = await api<{ flow: { id: number }; report: RecordRow }>(`/api/contradiction/runs/${stage13FlowId}/close`, { method: "POST" });
      setMessage(`Closed Stage 13 run with ${payload.report.shortId}`);
      await refreshStage13Run(payload.flow.id);
      await loadWorldData();
    } catch (error) {
      setMessage(`Stage 13 close blocked: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const addStage13RepairOperation = () => {
    if (!stage13RepairOperationDraft) return;
    setStage13RepairOperationOrder((current) => [current, stage13RepairOperationDraft].filter(Boolean).join("\n"));
  };

  const saveStage13Repair = async () => {
    if (stage13FlowId == null) return;
    try {
      await api("/api/contradiction/repairs", {
        method: "POST",
        body: JSON.stringify({
          flowId: stage13FlowId,
          operations: stage13RepairOperationOrder.split(/[\n,]+/).map((operation) => operation.trim()).filter(Boolean),
          repairText: stage13RepairText
        })
      });
      await refreshStage13Run(stage13FlowId);
    } catch (error) {
      setMessage(`Stage 13 repair blocked: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const addStage13RepairTarget = async () => {
    if (stage13FlowId == null) return;
    try {
      await api("/api/contradiction/repair-targets", {
        method: "POST",
        body: JSON.stringify({
          flowId: stage13FlowId,
          recordId: Number(stage13RepairTargetRecordId),
          nextCanonStatus: stage13RepairTargetStatus,
          newTitle: stage13RepairTargetTitle || undefined,
          newBody: stage13RepairTargetBody || undefined,
          note: stage13RepairTargetNote || undefined,
          advisoryRecordId: stage13RepairAdvisoryRecordId ? Number(stage13RepairAdvisoryRecordId) : undefined
        })
      });
      await refreshStage13Run(stage13FlowId);
    } catch (error) {
      setMessage(`Stage 13 repair target blocked: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const proposeStage13Fact = async () => {
    if (stage13FlowId == null) return;
    try {
      await api("/api/contradiction/propose-fact", {
        method: "POST",
        body: JSON.stringify({
          flowId: stage13FlowId,
          title: stage13ProposalTitle,
          body: stage13ProposalBody,
          truthLayer: stage13ProposalTruthLayer
        })
      });
      await refreshStage13Run(stage13FlowId);
      await loadWorldData();
    } catch (error) {
      setMessage(`Stage 13 proposal blocked: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const saveStage13RetconCosts = async () => {
    if (stage13FlowId == null) return;
    try {
      await api("/api/contradiction/retcon-costs", {
        method: "POST",
        body: JSON.stringify({
          flowId: stage13FlowId,
          retconType: stage13RetconType,
          costs: stage13RetconCostKeys
            .map((cost) => ({ cost, text: stage13RetconCostTexts[cost] ?? "" }))
            .filter((cost) => cost.text.trim())
        })
      });
      await refreshStage13Run(stage13FlowId);
    } catch (error) {
      setMessage(`Stage 13 retcon costs blocked: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const saveStage13RepairPropagation = async () => {
    if (stage13FlowId == null) return;
    try {
      await api("/api/contradiction/repair-propagation", {
        method: "POST",
        body: JSON.stringify({
          flowId: stage13FlowId,
          action: stage13PropagationAction,
          debtName: stage13PropagationAction === "assign" ? stage13PropagationDebtName : undefined,
          body: stage13PropagationBody || undefined,
          workScale: stage13WorkScale || undefined,
          reason: stage13PropagationReason || undefined
        })
      });
      await refreshStage13Run(stage13FlowId);
      await loadWorldData();
    } catch (error) {
      setMessage(`Stage 13 repair propagation blocked: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const recordStage13Skip = async () => {
    try {
      await api("/api/contradiction/skip", {
        method: "POST",
        body: JSON.stringify({
          flowId: stage13FlowId ?? undefined,
          stepKey: stage13SkipStep,
          workScale: stage13WorkScale || undefined,
          reason: stage13SkipReason || undefined
        })
      });
      if (stage13FlowId != null) await refreshStage13Run(stage13FlowId);
      await loadWorldData();
    } catch (error) {
      setMessage(`Stage 13 skip blocked: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const selectOwedBoundary = (row: OwedBoundaryRow) => {
    setStage13PropagationDispositionId(String(row.propagationDispositionId));
    setStage13ProtectedRecordId(String(row.protectedRecordId));
    setStage13PropagationReportRecordId(row.propagationReportRecordId == null ? "" : String(row.propagationReportRecordId));
    setStage13PreservationBoundary(row.preservationBoundary);
    setStage13LedgerTitle(`Mystery ledger for record ${row.protectedRecordId}`);
    setStage13MysterySections((current) => ({
      ...current,
      "Preserved consequences": row.consequenceBody,
      "Reveal prohibitions": row.note
    }));
  };

  const saveStage13MysteryLedger = async () => {
    try {
      const payload = await api<{ record: RecordRow; queue: OwedBoundaryRow[] }>("/api/contradiction/mystery-ledgers", {
        method: "POST",
        body: JSON.stringify({
          propagationDispositionId: stage13PropagationDispositionId ? Number(stage13PropagationDispositionId) : undefined,
          ledgerRecordId: stage13LedgerRecordId ? Number(stage13LedgerRecordId) : undefined,
          title: stage13LedgerTitle,
          protectedRecordId: Number(stage13ProtectedRecordId),
          propagationReportRecordId: stage13PropagationReportRecordId ? Number(stage13PropagationReportRecordId) : undefined,
          effectType: stage13ProtectedEffectType,
          mysteryState: stage13MysteryState,
          preservationBoundary: stage13PreservationBoundary,
          sections: stage13MysterySections
        })
      });
      setStage13LedgerRecordId(String(payload.record.id));
      setStage13OwedBoundaries(payload.queue);
      await loadWorldData();
    } catch (error) {
      setMessage(`Stage 13 mystery ledger blocked: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const completeStage13Checklist = async () => {
    try {
      await api("/api/contradiction/preservation-checklists", {
        method: "POST",
        body: JSON.stringify({
          flowId: stage13FlowId ?? undefined,
          ledgerRecordId: stage13LedgerRecordId ? Number(stage13LedgerRecordId) : undefined,
          protectedRecordId: stage13ProtectedRecordId ? Number(stage13ProtectedRecordId) : undefined,
          operation: stage13ChecklistOperation,
          effectType: stage13ChecklistEffectType,
          body: stage13ChecklistBody,
          sacredGuardBody: stage13ChecklistSacredGuard || undefined
        })
      });
      if (stage13FlowId != null) await refreshStage13Run(stage13FlowId);
      await loadWorldData();
    } catch (error) {
      setMessage(`Stage 13 checklist blocked: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const applyQaPayload = (payload: {
    flow?: { id: number };
    pass?: { id: number };
    scorecard?: QaScorecard;
    scores?: QaScore[];
    band?: QaBand;
  }) => {
    if (payload.flow?.id != null) setQaFlowId(payload.flow.id);
    if (payload.pass?.id != null) setQaPassId(payload.pass.id);
    if (payload.scorecard) {
      setQaScorecard(payload.scorecard);
      setQaTestNumber(String(payload.scorecard.tests[0]?.number ?? 1));
    }
    if (payload.scores) setQaScores(payload.scores);
    if (payload.band) setQaBand(payload.band);
  };

  const startQaPass = async () => {
    const payload = await api<{ flow: { id: number }; pass: { id: number }; scorecard: QaScorecard; band: QaBand }>("/api/qa/passes/start", {
      method: "POST",
      body: JSON.stringify({
        subjectType: qaSubjectType,
        subjectRecordId: qaSubjectType === "record" ? Number(qaSubjectRecordId) : undefined,
        title: qaSubjectType === "record" ? undefined : "Whole-world QA pass"
      })
    });
    applyQaPayload(payload);
    setMessage(`Started QA pass ${payload.pass.id}`);
    await loadWorldData();
  };

  const refreshQaPass = async () => {
    if (qaFlowId == null) return;
    applyQaPayload(await api<{ flow: { id: number }; pass: { id: number }; scorecard: QaScorecard; scores: QaScore[]; band: QaBand }>(`/api/qa/passes/${qaFlowId}`));
  };

  const saveQaScore = async () => {
    if (qaFlowId == null) return;
    const payload = await api<{ scores: QaScore[]; band: QaBand }>("/api/qa/scores", {
      method: "POST",
      body: JSON.stringify({
        flowId: qaFlowId,
        testNumber: Number(qaTestNumber),
        score: qaScore,
        naReason: qaNaReason || undefined,
        notes: qaNotes,
        requiredRepair: qaRequiredRepair,
        loadBearing: qaLoadBearing,
        repairRouted: qaRepairRouted
      })
    });
    setQaScores(payload.scores);
    setQaBand(payload.band);
    setQaNaReason("");
    setQaNotes("");
    setQaRequiredRepair("");
  };

  const saveQaProfile = async () => {
    if (qaFlowId == null) return;
    await api("/api/qa/profile", {
      method: "POST",
      body: JSON.stringify({
        flowId: qaFlowId,
        fields: qaProfile,
        recordLinkIds: qaSubjectRecordId ? [Number(qaSubjectRecordId)] : []
      })
    });
    await refreshQaPass();
  };

  const saveQaFloor = async () => {
    if (qaFlowId == null) return;
    const payload = await api<{ verdict: unknown }>("/api/qa/floor", {
      method: "POST",
      body: JSON.stringify({
        flowId: qaFlowId,
        conditions: qaFloorConditions,
        override: qaFloorOverride,
        overrideReason: qaFloorOverrideReason || undefined,
        admissionLevel: admissionLevel || undefined,
        workScale: workScale || undefined
      })
    });
    setMessage(`QA floor recorded: ${JSON.stringify(payload.verdict)}`);
  };

  const routeQaRepair = async () => {
    if (qaFlowId == null) return;
    await api("/api/qa/repairs", {
      method: "POST",
      body: JSON.stringify({
        flowId: qaFlowId,
        testNumber: Number(qaTestNumber),
        repairKind: qaRepairKind,
        repairText: qaRequiredRepair,
        debtKind: qaRepairKind === "canon_debt" ? qaDebtKind : undefined,
        debtName: qaRepairKind === "canon_debt" ? (canonDebtName || "QA canon debt") : undefined,
        candidate: qaRepairKind === "fact"
          ? { title: recordForm.title || "QA surfaced fact", body: recordForm.body || qaRequiredRepair, truthLayer: recordForm.truthLayer || "Objective canon" }
          : undefined
      })
    });
    await refreshQaPass();
    await loadWorldData();
  };

  const finalizeQaPass = async () => {
    if (qaFlowId == null) return;
    const payload = await api<{ flow: { current_step: string }; pass: RecordRow; band: QaBand }>(`/api/qa/passes/${qaFlowId}/finalize`, { method: "POST" });
    setQaBand(payload.band);
    setMessage(`Finalized QA pass ${payload.pass.shortId}`);
    await loadWorldData();
  };

  const setupPanel = (secondary = false) => (
    <section className={secondary ? "setup-panel compact-setup" : "setup-panel"}>
      <h2>{secondary ? "Setup controls" : "Setup/open world"}</h2>
      <div className="grid compact-grid">
        <section className="subpanel">
          <h3>Server status</h3>
          <p className="status">{serverStatus === "ready" ? `Reachable (${serverVersion})` : serverStatus === "failed" ? "Server unreachable" : "Checking local server"}</p>
        </section>
        <section className="subpanel">
          <h3>Catalog status</h3>
          <p className="status">{catalogStatus === "ready" ? `${recordTypes.length} record types and ${linkTypes.length} link types available` : catalogStatus === "failed" ? "Catalog unavailable" : "Loading app catalog"}</p>
        </section>
      </div>
      <label>World file path<input value={worldPath} onChange={(event) => setWorldPath(event.target.value)} placeholder="/tmp/example.worldloom.sqlite" /></label>
      <div className="row">
        <button onClick={() => createOrOpen("create")}>Create world</button>
        <button onClick={() => createOrOpen("open")}>Open world</button>
      </div>
      {setupError && (
        <section className="subpanel setup-error">
          <h3>{setupError.action === "create" ? "Create failed" : "Open failed"}</h3>
          <p>{setupError.message}</p>
          <p>{setupError.recovery}</p>
          <p className="meta">{setupError.path}</p>
        </section>
      )}
      <section className="subpanel">
        <h3>Recent worlds</h3>
        {recentWorlds.length === 0 ? (
          <p className="status">{catalogStatus === "failed" ? "Recent worlds unavailable until the app catalog loads." : "No recent worlds yet."}</p>
        ) : (
          <div className="recent">
            {recentWorlds.map((recent) => <button key={recent.path} onClick={() => { setWorldPath(recent.path); void createOrOpen("open", recent.path); }}>{recent.path}</button>)}
          </div>
        )}
      </section>
    </section>
  );

  if (!openWorld) {
    return (
      <main>
        <header className="topbar">
          <div>
            <h1>Worldloom Studio</h1>
            <p>{serverVersion ? `Server ${serverVersion} · ` : ""}No world open</p>
          </div>
        </header>
        <section className="setup-shell">
          {setupPanel()}
          {message && <p className="status">{message}</p>}
        </section>
      </main>
    );
  }

  if (activeDestination !== "legacy") {
    if (!workflowMap) {
      return (
        <main>
          <header className="topbar">
            <div>
              <h1>Worldloom Studio</h1>
              <p>{serverVersion ? `Server ${serverVersion} · ` : ""}World open · {openWorld}</p>
            </div>
          </header>
          <section className="workspace workflow-shell">
            <aside className="sidebar">
              {setupPanel(true)}
            </aside>
            <section className="editor">
              <div className="panel">
                <h2>Workflow map</h2>
                <p className="status">Loading server-owned workflow map.</p>
              </div>
            </section>
          </section>
        </main>
      );
    }

    const displayedWorkflowMap = workflowMap;
    const shellSurfaces = {
      creation: (
        <section className="panel creation-decision">
          <div className="operating-card">
            <strong>Operating Card</strong>
            <span>Source: docs/worldbuilding-system/operating_card.md</span>
            <span>Fill a lean world kernel, decompose seeds until each can be independently rejected, then admit later through `06`.</span>
          </div>
          <h2>{"Creation decision point"}</h2>
          <p className="status">Primary active path for a new world</p>
          <section className="subpanel">
            <h3>{displayedCreationDecision.currentStep}</h3>
            <p>{displayedCreationDecision.localDecision}</p>
            <p>{displayedCreationDecision.packageAuthority.primary}</p>
            <p>{displayedCreationDecision.packageAuthority.why}</p>
            <div className="chips">
              {displayedCreationDecision.packageAuthority.citations.map((citation) => <span key={citation}>{citation}</span>)}
            </div>
          </section>
          {creationHandoffReady && (
            <section className="subpanel">
              <h3>Creation-to-Admission handoff</h3>
              <p className="status">Not current: work from the Creation handoff before starting unrelated advanced flows.</p>
              <p>File paths and package sources are provenance, not primary operating instructions.</p>
              <div className="grid compact-grid">
                {creationDecisionHandoff.parkedSeeds.map((seed) => (
                  <article key={seed.id} className="subpanel">
                    <h3>{`${seed.shortId} · ${seed.title}`}</h3>
                    <p>{seed.body}</p>
                    <p className="meta">{`Truth layer: ${seed.truthLayer ?? "unset"} · Current canon status: ${seed.canonStatus ?? "unset"}`}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
          <section className="subpanel">
            <h3>Prerequisites before other flows</h3>
            <div className="grid compact-grid">
              {displayedCreationDecision.blockers.map((blocker) => (
                <article key={blocker.key} className="subpanel">
                  <h3>{blocker.label}</h3>
                  <p>{blocker.message}</p>
                  <p className="meta">{blocker.requires}</p>
                </article>
              ))}
            </div>
          </section>
          <section className="subpanel">
            <h3>Kernel authoring</h3>
            <p>Consequence mode is steward judgment.</p>
            <div className="grid compact-grid">
              <label>Kernel step<select value={kernelHeading} onChange={(event) => setKernelHeading(event.target.value)}>{displayedCreationDecision.sectionPrompts.map((prompt) => <option key={prompt.heading}>{prompt.heading}</option>)}</select></label>
              <label>Kernel section<textarea rows={4} value={kernelBody} onChange={(event) => setKernelBody(event.target.value)} placeholder={displayedCreationDecision.sectionPrompts.find((prompt) => prompt.heading === kernelHeading)?.prompt} /></label>
              {displayedCreationDecision.sectionPrompts.map((prompt) => (
                <p key={prompt.heading} className="meta">{prompt.heading} · {prompt.obligation}</p>
              ))}
            </div>
            <button onClick={saveKernelStep} disabled={flowId == null}>Save kernel step</button>
          </section>
          <section className="subpanel">
            <h3>{"Prompt-out preview"}</h3>
            <p>{displayedCreationDecision.promptOut.preview.currentDecision}</p>
            <p>{displayedCreationDecision.promptOut.preview.promptText}</p>
            <p>{displayedCreationDecision.promptOut.preview.advisoryCanonWarning}</p>
            <h3>Source manifest</h3>
            <div className="chips">
              {displayedCreationDecision.promptOut.preview.sourceManifest.map((source) => <span key={source}>{source}</span>)}
            </div>
            <button onClick={loadCreationPromptStep} disabled={!openWorld || (!creationDecision?.promptOut.stepRequest && !creationDecision?.promptOut.modes?.some((mode) => mode.stepRequest))}>Load Creation Prompt-out Step</button>
          </section>
          <section className="subpanel">
            <h3>Seed decomposition decision</h3>
            <p>Actual current status: proposed</p>
            <div className="grid compact-grid">
              <label>Seed title<input value={seedTitle} onChange={(event) => setSeedTitle(event.target.value)} /></label>
              <label>Seed body<textarea rows={3} value={seedBody} onChange={(event) => setSeedBody(event.target.value)} /></label>
              <label>Admission intent<input value={admissionIntent} onChange={(event) => setAdmissionIntent(event.target.value)} /></label>
            </div>
            <label>Granularity rationale<textarea rows={3} value={granularityRationale} onChange={(event) => setGranularityRationale(event.target.value)} /></label>
            <label className="inline-check"><input type="checkbox" checked={granularityConfirmed} onChange={(event) => setGranularityConfirmed(event.target.checked)} />Granularity confirmation</label>
            <button onClick={decompose} disabled={flowId == null || kernelRecordId == null}>Decompose and Park Seed</button>
          </section>
          <section className="subpanel">
            <h3>Write preview</h3>
            <p>{displayedCreationDecision.writeIntent.willWrite.join(" · ")}</p>
            <p>{displayedCreationDecision.writeIntent.willLink.join(" · ")}</p>
            <p>Admission handoff: {displayedCreationDecision.writeIntent.willRouteOnward.join(" · ")}</p>
          </section>
          <section className="subpanel">
            <h3>Read-side trail</h3>
            <div className="chips">
              {displayedCreationDecision.readSideTrail.map((item) => <span key={`${item.label}:${item.href}`}>{item.label} · {item.href}</span>)}
            </div>
            <p>Safe exit/resume: {displayedCreationDecision.nextOrResumeState.safeExit}</p>
          </section>
          <section className="subpanel">
            <h3>Naive steward walkthrough</h3>
            <ol>
              <li>Identify the current Creation decision and source doctrine.</li>
              <li>Distinguish required, optional, skippable, and allowed-empty obligations.</li>
              <li>Treat Prompt-out as advisory pressure, not canon generation.</li>
            </ol>
          </section>
        </section>
      ),
      admission: (
        <section className="panel">
          <h2>Admission flow</h2>
          <p>Admission is the only flow that changes canon standing.</p>
          <section className="subpanel">
            <h3>Queue</h3>
            {admissionQueue.length === 0 ? <p className="status">No Admission work is queued.</p> : admissionQueue.map((record) => <p key={record.id}>{record.shortId} · {record.title}</p>)}
          </section>
          {admissionDecision && (
            <section className="subpanel">
              <h3>{admissionDecision.currentStep}</h3>
              <p>{admissionDecision.localDecision}</p>
              <p>{admissionDecision.packageAuthority.primary}</p>
            </section>
          )}
        </section>
      ),
      propagation: (
        <section className="panel">
          <h2>Propagation flow</h2>
          <p>Work shock cones, consequence domains, and stopping-rule dispositions.</p>
          {propagationQueue.map((record) => <p key={record.id}>{record.shortId} · {record.title}</p>)}
        </section>
      ),
      constraint: (
        <section className="panel">
          <h2>Constraint composition flow</h2>
          <p>Compose constraints where facts apply.</p>
        </section>
      ),
      stage12: (
        <section className="panel">
          <h2>Institutional / Economic / Suppression flow</h2>
          <p>Run conditional institutional, economic, and suppression passes.</p>
        </section>
      ),
      contradiction: (
        <section className="panel">
          <h2>Contradiction/Retcon/Mystery flow</h2>
          <p>Repair contradictions and preserve protected effects.</p>
          {stage13OwedBoundaries.map((row) => <p key={row.propagationDispositionId}>Boundary #{row.propagationDispositionId} · protected record {row.protectedRecordId}</p>)}
        </section>
      ),
      qa: (
        <section className="panel">
          <h2>QA</h2>
          <p>Score stability before calling the world stable.</p>
        </section>
      ),
      "canon-workbench": (
        <section className="panel">
          <h2>Canon Workbench</h2>
          <p>Current Canon</p>
          <p>Audit Trail</p>
          <p>Canon Workbench text query</p>
          {canonCurrentRows.map((row) => <p key={row.id}>{row.shortId} · {row.title}</p>)}
        </section>
      ),
      "markdown-export": (
        <section className="panel">
          <h2>Markdown export</h2>
          <label>Markdown export directory<input value={exportDirectory} onChange={(event) => setExportDirectory(event.target.value)} placeholder="/tmp/example-markdown-export" /></label>
          <button onClick={exportWorldMarkdown} disabled={!openWorld || !exportDirectory.trim()}>Export World Markdown</button>
          {exportedMarkdown && <textarea rows={12} value={exportedMarkdown} readOnly />}
        </section>
      ),
      substrate: (
        <section className="panel">
          <h2>Substrate</h2>
          <p>Generic records, links, search, draft space, and Prompt-out substrate/admin.</p>
          <section className="subpanel">
            <h3>Search and links</h3>
            <label>Search<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="record title or prose" /></label>
            <div className="row">
              <button onClick={runSearch} disabled={!openWorld}>Search</button>
              <button onClick={loadWorldData} disabled={!openWorld}>All</button>
            </div>
            <label>Link from<input value={fromRecordId} onChange={(event) => setFromRecordId(event.target.value)} placeholder="record id" /></label>
            <label>Link to<input value={toRecordId} onChange={(event) => setToRecordId(event.target.value)} placeholder="record id" /></label>
            <button onClick={createLink} disabled={!openWorld}>Create Link</button>
          </section>
          <section className="subpanel">
            <h3>New record</h3>
            <label>Title<input value={recordForm.title} onChange={(event) => setRecordForm({ ...recordForm, title: event.target.value })} /></label>
            <label>Body<textarea rows={5} value={recordForm.body} onChange={(event) => setRecordForm({ ...recordForm, body: event.target.value })} /></label>
            <button onClick={saveRecord} disabled={!canSaveRecord}>Save record</button>
          </section>
          <section className="subpanel">
            <h3>Prompt-out substrate/admin</h3>
            <p>Generic Prompt-out is secondary to the in-flow Creation Prompt-out path.</p>
            <button onClick={loadPromptStep} disabled={!openWorld}>Load Prompt Step</button>
          </section>
          {records.map((record) => (
            <article key={record.id} className="subpanel">
              <h3>{record.shortId} · {record.title}</h3>
              <p>{record.body || "No prose yet."}</p>
            </article>
          ))}
        </section>
      )
    };

    return (
      <main>
        <header className="topbar">
          <div>
            <h1>Worldloom Studio</h1>
            <p>{serverVersion ? `Server ${serverVersion} · ` : ""}World open · {openWorld}</p>
          </div>
        </header>
        <WorkflowShell
          workflowMap={displayedWorkflowMap}
          activeDestination={activeDestination}
          setupControls={setupPanel(true)}
          surfaces={shellSurfaces}
          status={message ? <p className="status">{message}</p> : null}
          onNavigate={setActiveDestination}
        />
      </main>
    );
  }

  return (
    <main>
      <header className="topbar">
        <div>
          <h1>Worldloom Studio</h1>
          <p>{serverVersion ? `Server ${serverVersion} · ` : ""}World open · {openWorld}</p>
        </div>
      </header>

      <section className="workspace">
        <aside className="sidebar">
          {setupPanel(true)}
          <label>Snapshot path<input value={snapshotPath} onChange={(event) => setSnapshotPath(event.target.value)} placeholder="/tmp/example.snapshot.sqlite" /></label>
          <button onClick={snapshot} disabled={!openWorld}>Snapshot</button>
          <label>Markdown export directory<input value={exportDirectory} onChange={(event) => setExportDirectory(event.target.value)} placeholder="/tmp/example-markdown-export" /></label>
          <button onClick={exportWorldMarkdown} disabled={!openWorld || !exportDirectory.trim()}>Export World Markdown</button>
          <label>Search<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="record title or prose" /></label>
          <div className="row">
            <button onClick={runSearch} disabled={!openWorld}>Search</button>
            <button onClick={loadWorldData} disabled={!openWorld}>All</button>
          </div>
          <label>Link from<input value={fromRecordId} onChange={(event) => setFromRecordId(event.target.value)} placeholder="record id" /></label>
          <label>Link to<input value={toRecordId} onChange={(event) => setToRecordId(event.target.value)} placeholder="record id" /></label>
          <label>Link type<select value={linkTypeKey} onChange={(event) => setLinkTypeKey(event.target.value)}>{linkTypes.map((linkType) => <option key={linkType.key} value={linkType.key}>{linkType.label}</option>)}</select></label>
          <label>Promotion target<select value={promotionRecordTypeKey} onChange={(event) => setPromotionRecordTypeKey(event.target.value)}>{recordTypes.filter((recordType) => recordType.mutationRegime === "card").map((recordType) => <option key={recordType.key} value={recordType.key}>{recordType.label}</option>)}</select></label>
          <button onClick={createLink} disabled={!openWorld}>Create Link</button>
          <button onClick={traverseLinks} disabled={!openWorld || !fromRecordId}>Traverse</button>
        </aside>

        <section className="editor">
          <div className="operating-card">
            <strong>Operating Card</strong>
            <span>Source: docs/worldbuilding-system/operating_card.md</span>
            <span>Fill a lean world kernel, decompose seeds until each can be independently rejected, then admit later through `06`.</span>
          </div>

          {creationHandoffReady && (
            <div className="panel method-frontier">
              <section className="subpanel">
                <h2>Creation-to-Admission handoff</h2>
                <p className="status">Not current: work from the Creation handoff before starting unrelated advanced flows.</p>
                <p>File paths and package sources are provenance, not primary operating instructions.</p>
                <div className="doctrine">
                  <strong>Method rule</strong>
                  {creationDecisionHandoff.doctrineAtPointOfUse.map((rule) => <span key={rule}>{rule}</span>)}
                </div>
                <div className="grid compact-grid">
                  <section className="subpanel">
                    <h3>Parked seeds</h3>
                    {creationDecisionHandoff.parkedSeeds.map((seed) => (
                      <article key={seed.id}>
                        <h3>{`${seed.shortId} · ${seed.title}`}</h3>
                        <p>{seed.body}</p>
                        <p className="meta">{`Truth layer: ${seed.truthLayer ?? "unset"} · Current canon status: ${seed.canonStatus ?? "unset"}`}</p>
                        <p>{`Source links: ${seed.sourceLinks.map((link) => link.label).join(" · ") || "none"}`}</p>
                      </article>
                    ))}
                  </section>
                  <section className="subpanel">
                    <h3>Report and rationale</h3>
                    <p>{creationDecisionHandoff.seedDecompositionReport
                      ? `Seed decomposition report ${creationDecisionHandoff.seedDecompositionReport.shortId}: ${creationDecisionHandoff.seedDecompositionReport.title}`
                      : "No seed-decomposition report yet."}</p>
                    <p>{creationDecisionHandoff.granularityRationale ? `Granularity rationale: ${creationDecisionHandoff.granularityRationale}` : "Granularity rationale not recorded yet."}</p>
                    {creationDecisionHandoff.admissionIntent && <p>{`Admission intent: ${creationDecisionHandoff.admissionIntent}`}</p>}
                  </section>
                  <section className="subpanel">
                    <h3>Prompt packet</h3>
                    <p>{displayedCreationDecision.promptOut.role} · {displayedCreationDecision.promptOut.available ? "available" : "blocked"}</p>
                    <p>{displayedCreationDecision.promptOut.blocker ?? displayedCreationDecision.promptOut.preview.currentDecision}</p>
                    <p>{displayedCreationDecision.promptOut.preview.advisoryCanonWarning}</p>
                  </section>
                  <section className="subpanel">
                    <h3>Next and read-side trail</h3>
                    <p>{creationDecisionHandoff.nextStep}</p>
                    <p>{`Admission route: ${creationDecisionHandoff.admissionQueueRoute}`}</p>
                    <div className="chips">
                      {displayedCreationDecision.readSideTrail.map((item) => <span key={`${item.label}-${item.href}`}>{`${item.label} · ${item.href}`}</span>)}
                    </div>
                  </section>
                </div>
              </section>
            </div>
          )}

          {!records.some((record) => record.recordTypeKey === "world_kernel") && (
            <div className="panel">
              <section className="subpanel">
                <h2>Prerequisites before other flows</h2>
                <p className="status">Creation is the primary path until a world_kernel exists.</p>
                <p>Admission, Propagation, QA, Canon Workbench work, and generic substrate tools are available after a world is open, but they do not replace the first kernel decision.</p>
              </section>
            </div>
          )}

          <div className="panel canon-workbench">
            <h2>Canon Workbench</h2>
            {!openWorld ? (
              <p className="status">No world is open</p>
            ) : (
              <>
                <div className="grid compact-grid">
                  <label>Canon Workbench text query<input value={canonWorkbenchQuery} onChange={(event) => setCanonWorkbenchQuery(event.target.value)} /></label>
                  <label>Record type filter<select value={canonWorkbenchRecordType} onChange={(event) => setCanonWorkbenchRecordType(event.target.value)}>
                    <option value="">All current card types</option>
                    {recordTypes.filter((recordType) => recordType.mutationRegime === "card").map((recordType) => <option key={recordType.key} value={recordType.key}>{recordType.label}</option>)}
                  </select></label>
                  <label>Truth layer filter<select value={canonWorkbenchTruthLayer} onChange={(event) => setCanonWorkbenchTruthLayer(event.target.value)}>
                    <option value="">Any truth layer</option>
                    {truthLayers.map((term) => <option key={term.term}>{term.term}</option>)}
                  </select></label>
                  <label>Canon status filter<select value={canonWorkbenchStatus} onChange={(event) => setCanonWorkbenchStatus(event.target.value)}>
                    <option value="">Default standing statuses</option>
                    {canonStatuses.map((term) => <option key={term.term}>{term.term}</option>)}
                  </select></label>
                  <label>Consequence mode filter<select value={canonWorkbenchConsequenceMode} onChange={(event) => setCanonWorkbenchConsequenceMode(event.target.value)}>
                    <option value="">Any consequence mode</option>
                    {consequenceModes.map((term) => <option key={term.term}>{term.term}</option>)}
                  </select></label>
                  <label>Continuity scope filter<input value={canonWorkbenchScope} onChange={(event) => setCanonWorkbenchScope(event.target.value)} placeholder="main continuity" /></label>
                </div>
                <div className="row">
                  <label className="inline-check"><input type="checkbox" checked={canonWorkbenchOpenDebt} onChange={(event) => setCanonWorkbenchOpenDebt(event.target.checked)} />Open canon debt</label>
                  <label className="inline-check"><input type="checkbox" checked={canonWorkbenchBranchRelevant} onChange={(event) => setCanonWorkbenchBranchRelevant(event.target.checked)} />Branch-relevant filter</label>
                  <button onClick={loadCanonWorkbench}>Refresh Workbench</button>
                </div>
                <div className="grid two">
                  <section className="subpanel">
                    <h3>Current Canon</h3>
                    {canonCurrentRows.length === 0 && <p className="status">No current canon matches these filters</p>}
                    <div className="records compact">
                      {canonCurrentRows.map((row) => (
                        <article key={row.id} className={selectedCanonRecordId === row.id ? "selected" : undefined}>
                          <button onClick={() => void selectCurrentCanonRow(row)}>Select</button>
                          <h3>{row.shortId} · {row.title}</h3>
                          <p className="meta">{row.recordTypeLabel} · {row.truthLayer} · {row.canonStatus} · {row.continuityScope}</p>
                          <div className="chips">
                            {row.relationshipMarkers.hasOpenDebt && <span>Open debt</span>}
                            {row.relationshipMarkers.hasAdvisoryUse && <span>Advisory use</span>}
                            {row.relationshipMarkers.typedLinkTypes.map((linkType) => <span key={linkType}>{linkType}</span>)}
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                  <section className="subpanel">
                    <h3>Audit Trail</h3>
                    <div className="records compact">
                      {canonAuditTrail.map((item) => (
                        <article key={item.record.id} className={selectedAuditReportId === item.record.id ? "selected" : undefined}>
                          <button onClick={() => void selectAuditTrailItem(item)}>Select</button>
                          <h3>{item.record.shortId} · {item.record.title}</h3>
                          <p className="meta">Report spine · {item.record.recordTypeKey} · {item.authoredAt}</p>
                          <p>Affected current records: {item.affectedCurrentRecords.map((record) => `${record.shortId} ${record.title}`).join(", ") || "none"}</p>
                          <p>Attached context: history {item.attachments.recordHistory.length}, sections {item.attachments.sectionHistory.length}, skips {item.attachments.skipRecords.length}, debt {item.attachments.canonDebtEvents.length}, advisory {item.attachments.advisoryArtifacts.length}, links {item.attachments.typedLinkCreations.length}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                </div>
                <section className="subpanel">
                  <h3>Detail pane</h3>
                  {canonDetail ? (
                    <article>
                      <h3>{canonDetail.record.shortId} · {canonDetail.record.title}</h3>
                      <p className="meta">{canonDetail.record.recordTypeLabel} · {canonDetail.record.truthLayer} · {canonDetail.record.canonStatus} · {canonDetail.record.continuityScope}</p>
                      <p>{canonDetail.record.body || "No prose yet."}</p>
                      <div className="chips">
                        {canonDetail.facets.map((facet) => <span key={facet.id}>{facet.vocabulary}: {facet.term}</span>)}
                      </div>
                      {canonDetail.sections.map((section) => (
                        <div key={section.id} className="doctrine">
                          <strong>{section.heading}</strong>
                          <span>{section.body}</span>
                        </div>
                      ))}
                      <p>Links: {canonDetail.outgoingLinks.length} outgoing, {canonDetail.incomingLinks.length} incoming</p>
                      <p>History: {canonDetail.recordHistory.length} record, {canonDetail.sectionHistory.length} section</p>
                      <p>Related reports: {canonDetail.relatedReports.map((record) => `${record.shortId} ${record.title}`).join(", ") || "none"}</p>
                      <p>Canon debt: {canonDetail.canonDebt.map((record) => `${record.shortId} ${record.title}`).join(", ") || "none"}</p>
                      <p>Skips: {canonDetail.skipRecords.length} · Advisory artifacts: {canonDetail.advisoryArtifacts.length} · Standing rulings: {canonDetail.standingRulings.length}</p>
                      {relatedAuditItems.length > 0 && <p>Matching Audit Trail context: {relatedAuditItems.map((item) => item.record.shortId).join(", ")}</p>}
                      <button onClick={() => { void api<{ markdown: string }>(canonDetail.exportAffordance.href).then((payload) => setExportedMarkdown(payload.markdown)); }}>Export Markdown</button>
                    </article>
                  ) : (
                    <p className="status">Select a Current Canon row or Audit Trail item.</p>
                  )}
                </section>
              </>
            )}
          </div>

          <div className="panel">
            <h2>{editingId == null ? "New record" : `Editing record ${editingId}`}</h2>
            {editingReportRecord && <p className="status">Report-regime records are append-only and view-only after creation.</p>}
            <div className="grid">
              <label>Record type<select value={recordTypeKey} onChange={(event) => { setRecordTypeKey(event.target.value); setSections([]); }} disabled={editingId != null}>{recordTypes.map((recordType) => <option key={recordType.key} value={recordType.key}>{recordType.label} ({recordType.mutationRegime})</option>)}</select></label>
              <label>Truth layer<select value={recordForm.truthLayer} onChange={(event) => setRecordForm({ ...recordForm, truthLayer: event.target.value })} disabled={editingReportRecord}><option></option>{truthLayers.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
              <label>Canon status<select value={recordForm.canonStatus} onChange={(event) => setRecordForm({ ...recordForm, canonStatus: event.target.value })} disabled={editingReportRecord}><option></option>{canonStatuses.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
            </div>
            <label>Title<input value={recordForm.title} onChange={(event) => setRecordForm({ ...recordForm, title: event.target.value })} disabled={editingReportRecord} /></label>
            <label>Prose<textarea value={recordForm.body} onChange={(event) => setRecordForm({ ...recordForm, body: event.target.value })} rows={5} disabled={editingReportRecord} /></label>
            {selectedHeadings.length > 0 && (
              <div className="subpanel">
                <h3>Sections</h3>
                {selectedHeadings.map((heading) => (
                  <label key={heading.heading}>{heading.heading}
                    <textarea rows={3} value={sections.find((section) => section.heading === heading.heading)?.body ?? ""} onChange={(event) => updateSection(heading, event.target.value)} disabled={editingReportRecord} />
                  </label>
                ))}
              </div>
            )}
            <div className="subpanel">
              <h3>Facets</h3>
              <div className="grid">
                <label>Vocabulary<select value={facetVocabulary} onChange={(event) => { setFacetVocabulary(event.target.value); setFacetTerm(""); }}>{vocabularies.map((vocabulary) => <option key={vocabulary}>{vocabulary}</option>)}</select></label>
                <label>Term<select value={facetTerm} onChange={(event) => setFacetTerm(event.target.value)}>{facetTerms.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
                <button onClick={addFacet} disabled={editingId == null}>Add Facet</button>
              </div>
              <div className="chips">{facets.map((facet) => <button key={facet.id} onClick={() => removeFacet(facet.id)}>{facet.vocabulary}: {facet.term} #{facet.position}</button>)}</div>
            </div>
            <div className="row">
              <button onClick={saveRecord} disabled={!canSaveRecord}>Save Record</button>
              <button onClick={resetRecordForm}>Clear</button>
            </div>
          </div>

          <div className="panel two">
            <section className="subpanel">
              <h2>Draft space</h2>
              <label>Title<input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} /></label>
              <label>Body<textarea rows={4} value={draftBody} onChange={(event) => setDraftBody(event.target.value)} /></label>
              <button onClick={saveDraft} disabled={!openWorld || !draftTitle.trim()}>Save Draft</button>
              {drafts.map((draft) => (
                <article key={draft.id}>
                  <h3>{draft.title}</h3>
                  <p>{draft.body}</p>
                  <div className="row">
                    <button onClick={() => convertDraft(draft)} disabled={!recordForm.truthLayer || !recordForm.canonStatus}>Convert to Proposed</button>
                    <button onClick={() => proposeDraft(draft)} disabled={!recordForm.truthLayer}>Propose</button>
                    <button onClick={() => discardDraft(draft)}>Discard</button>
                  </div>
                </article>
              ))}
            </section>
            <section className="subpanel">
              <h2>Prompt-out substrate/admin</h2>
              <p className="status">Generic Prompt-out is secondary to the in-flow Creation Prompt-out path.</p>
              <label>Prompt context<select value={promptFlowKey} onChange={(event) => {
                const next = event.target.value as PromptFlowKey;
                setPromptFlowKey(next);
                if (next === "institutional_economic_suppression") setPromptTemplateKey("institution_economy_analyst");
                if (next === "constraint_composition") setPromptTemplateKey("constraint_challenger");
                if (next === "contradiction") setPromptTemplateKey("repair_challenge");
              }}>
                <option value="creation">Creation</option>
                <option value="admission">Admission</option>
                <option value="propagation">Propagation</option>
                <option value="contradiction">Contradiction</option>
                <option value="qa">QA</option>
                <option value="institutional_economic_suppression">Institutional / economic / suppression</option>
                <option value="constraint_composition">Constraint Composition</option>
              </select></label>
              <label>Template<select value={promptTemplateKey} onChange={(event) => setPromptTemplateKey(event.target.value)}>{templates.map((template) => <option key={template.key} value={template.key}>{template.role_name} v{template.current_version}</option>)}</select></label>
              {selectedTemplate && (
                <div className="doctrine">
                  <strong>{selectedTemplate.role_name}</strong>
                  <span>Source: docs/worldbuilding-system/20_ai_assisted_workflow.md</span>
                  <span>Original: {selectedTemplate.original_text}</span>
                </div>
              )}
              <label>Steward-editable prompt text<textarea rows={4} value={templateEdit} onChange={(event) => setTemplateEdit(event.target.value)} /></label>
              <div className="row">
                <button onClick={savePromptTemplate} disabled={!openWorld || !templateEdit.trim()}>Save Template</button>
                <button onClick={revertPromptTemplate} disabled={!openWorld}>Revert Template</button>
              </div>
              <label>Record id<input value={promptRecordId} onChange={(event) => setPromptRecordId(event.target.value)} /></label>
              <button onClick={loadPromptStep} disabled={!openWorld}>Load Prompt Step</button>
              <div className="doctrine">
                <strong>Server-owned step</strong>
                <span>{promptStep ? `${promptStep.label} · ${promptStep.context.stepKey}` : "Load a server-returned Prompt-out step before actions."}</span>
                {promptStep?.mode && <span>{promptStep.mode === "proposal" ? "Proposal mode" : "Pressure mode"}</span>}
                {(promptStep?.availableModes ?? []).map((mode) => (
                  <span key={mode.mode}>{`${mode.label}: ${mode.available ? "available" : mode.blocker ?? "blocked"} · ${mode.framing}`}</span>
                ))}
                <span>{promptStep?.selectedRecord ? `${promptStep.selectedRecord.shortId} · ${promptStep.selectedRecord.title}` : "No selected record context loaded."}</span>
              </div>
              <button onClick={generatePrompt} disabled={!openWorld}>Generate Prompt</button>
              <textarea rows={7} value={promptText} onChange={(event) => setPromptText(event.target.value)} />
              <label>Pasted response<textarea rows={5} value={responseText} onChange={(event) => setResponseText(event.target.value)} /></label>
              <label>Disposition<select value={disposition} onChange={(event) => setDisposition(event.target.value)}>{advisoryDispositions.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
              <div className="row">
                <button onClick={storeAdvisory} disabled={!promptText || !responseText}>Store Advisory</button>
                <button onClick={skipPrompt} disabled={!openWorld}>Skip Prompt</button>
              </div>
            </section>
          </div>

          <div className="panel">
            <h2>Admission flow</h2>
            <div className="doctrine">
              <strong>Doctrine at point of use</strong>
              <span>Queue and gate derive from docs/worldbuilding-system/06_canon_fact_admission_protocol.md, checklists/canon_fact_gate.md, checklists/frontloaded_seed_audit.md, and templates/admission_ledger.md.</span>
              <span>Severity is steward-declared; sweeps propose and only admission admits.</span>
            </div>
            <section className="decision-point">
              <h3>Decision point</h3>
              <p><strong>{admissionDecision?.localDecision ?? "Choose which proposed fact enters Admission now."}</strong></p>
              <p>Only Admission changes canon standing; proposed facts remain proposed until the steward completes this governed Admission flow.</p>
              <p>No severity is selected by default. Existing severity values are displayed only when the server payload or steward selection supplies them.</p>
              <div className="chips">
                <span>Flow state: {admissionDecision?.flow.runState ?? "not started"}</span>
                <span>Current step: {admissionDecision?.currentStep ?? "admission:queue-selection"}</span>
                <span>Next/resume: {admissionDecision?.nextOrResumeState.nextStep ?? "select a proposed fact"}</span>
              </div>
              {admissionDecision?.selectedRecord && (
                <div className="doctrine">
                  <strong>{admissionDecision.selectedRecord.shortId} · {admissionDecision.selectedRecord.title}</strong>
                  <span>{admissionDecision.selectedRecord.recordTypeKey} · {admissionDecision.selectedRecord.truthLayer ?? "unset truth layer"} · {admissionDecision.selectedRecord.canonStatus ?? "unset canon status"}</span>
                  <span>Source or origin links: {admissionDecision.selectedRecord.sourceLinks.map((link) => link.target ? `${link.target.shortId} ${link.target.title}` : `record ${link.toRecordId}`).join(", ") || "none returned"}</span>
                </div>
              )}
              <div className="grid compact-grid">
                <section className="subpanel">
                  <h3>Severity definitions</h3>
                  {admissionDecision?.severity.definitions.length ? admissionDecision.severity.definitions.map((definition) => (
                    <p key={`${definition.key}:${definition.term}`}><strong>{definition.key}</strong> {definition.term}: {definition.definition}</p>
                  )) : <p className="status">Declare admission_level and work_scale explicitly to load the server-owned severity path.</p>}
                  <p>Severity path: {admissionDecision?.severity.gatePath ?? "undeclared"}</p>
                </section>
                <section className="subpanel">
                  <h3>Path obligations</h3>
                  <p>{(admissionDecision?.severity.obligations ?? ["Declare admission_level", "Declare work_scale"]).join(" · ")}</p>
                  <p>{admissionDecision?.nextOrResumeState.safeExit ?? "Safe exit leaves the fact in the Admission queue for later resume."}</p>
                </section>
              </div>
              <div className="grid compact-grid">
                <section className="subpanel work-list required-work">
                  <h3>Required work</h3>
                  {(admissionDecision?.work.required ?? ["Select a proposed fact", "Declare admission_level", "Declare work_scale"]).map((item) => <p key={item}>{item}</p>)}
                </section>
                <section className="subpanel work-list optional-work">
                  <h3>Optional work</h3>
                  {(admissionDecision?.work.optional ?? ["Prompt-out advisory pressure after steward-authored material exists"]).map((item) => <p key={item}>{item}</p>)}
                </section>
                <section className="subpanel work-list skippable-work">
                  <h3>Skippable work</h3>
                  {(admissionDecision?.work.skippable ?? ["Offered instruments write skip_record entries when declined"]).map((item) => <p key={item}>{item}</p>)}
                </section>
                <section className="subpanel work-list severity-work">
                  <h3>Severity-dependent work</h3>
                  {(admissionDecision?.work.severityDependent ?? ["Gate depth is unavailable until severity is declared"]).map((item) => <p key={item}>{item}</p>)}
                </section>
              </div>
              <div className="grid compact-grid">
                <section className="subpanel">
                  <h3>Minor ledger path</h3>
                  <p>Minor work stays batch-friendly: fact statement, scope, truth layer, canon status plus separated constraint tags, ordered admission operations, and one consequence check.</p>
                  <p>Native Tab/Enter form order is preserved by the existing form controls below.</p>
                </section>
                <section className="subpanel">
                  <h3>Full gate path</h3>
                  {admissionDecision?.blockers.length ? admissionDecision.blockers.map((blocker) => (
                    <p key={blocker.key}><strong>{blocker.label}</strong>: {blocker.message} Requires {blocker.requires}.</p>
                  )) : <p>Full-gate blockers are returned by the server after severity declaration.</p>}
                </section>
              </div>
              <section className="subpanel">
                <h3>Frontloaded seed audit</h3>
                <p>{admissionDecision?.seedAudit.offered ? "Offered before first seed admission when relevant." : "Not currently offered for the selected record."}</p>
                <p>{admissionDecision?.seedAudit.runWrites ?? "Running seed audit writes a gate_result when offered."}</p>
                <p>{admissionDecision?.seedAudit.declineWrites ?? "Declining an offered instrument writes a governed skip_record."}</p>
                <p>{admissionDecision?.seedAudit.nonMutation ?? "Seed audit does not mutate seed truth layer, canon status, tags, severity, or operations."}</p>
                {(admissionDecision?.seedAudit.doctrine ?? [
                  "docs/worldbuilding-system/05_creation_protocol.md",
                  "docs/worldbuilding-system/06_canon_fact_admission_protocol.md",
                  "docs/worldbuilding-system/checklists/frontloaded_seed_audit.md"
                ]).map((citation) => <p key={citation}>Doctrine: {citation}</p>)}
                <p>{`Reason required: ${admissionDecision?.skipRule.reasonRequired ? "yes" : "no"} · ${admissionDecision?.skipRule.reasonThreshold ?? "major-or-higher Admission work"} · ${admissionDecision?.skipRule.belowThresholdNote ?? "Reason not collected below major-fact threshold."}`}</p>
                <p>Open canon debt warnings are non-blocking and remain steward judgment context.</p>
              </section>
              <section className="subpanel">
                <h3>Prompt packet preview</h3>
                <p>{admissionDecision?.promptOut.role ?? "Admission Prompt-out role loads after selecting a record."} · {admissionDecision?.promptOut.advisory ?? "optional"} advisory pressure</p>
                {(admissionDecision?.promptOut.modes ?? []).map((mode) => (
                  <div className="doctrine" key={mode.mode}>
                    <strong>{mode.label}</strong>
                    <span>{mode.available ? "Available from server" : mode.blocker ?? "Blocked by server"}</span>
                    <span>{mode.framing}</span>
                    <span>Output labels: {mode.outputLabels.join(", ")}</span>
                  </div>
                ))}
                <p>{admissionDecision?.promptOut.preview.currentDecision ?? "Prompt-out appears only after steward-authored material exists."}</p>
                <strong>Source manifest</strong>
                {(admissionDecision?.promptOut.preview.sourceManifest ?? ["No source manifest loaded yet."]).map((item) => <p key={item}>{item}</p>)}
                <strong>Context preview</strong>
                <p>{admissionDecision?.promptOut.preview.contextPreview ?? "No context preview loaded yet."}</p>
                <strong>Omissions</strong>
                {(admissionDecision?.promptOut.preview.omissions ?? ["No omissions loaded yet."]).map((item) => <p key={item}>{item}</p>)}
                <strong>Advisory/canon warning</strong>
                <p>{admissionDecision?.promptOut.preview.advisoryCanonWarning ?? "Pasted responses remain advisory artifacts and are not admitted canon."}</p>
                <p>Pasted advisory responses are stored as advisory_artifact records and remain visibly separate from canon fields.</p>
                <button onClick={loadAdmissionPromptStep} disabled={!openWorld || !admissionDecision}>Load Admission Prompt-out Step</button>
              </section>
              <section className="subpanel">
                <h3>Close preview</h3>
                <div className="grid compact-grid">
                  <div>
                    <strong>What will be written</strong>
                    {(admissionDecision?.writeIntent.willWrite ?? ["No canon mutation until Admission completion."]).map((item) => <p key={item}>{item}</p>)}
                  </div>
                  <div>
                    <strong>What will be linked</strong>
                    {(admissionDecision?.writeIntent.willLink ?? ["Read-side trail links load with a selected decision point."]).map((item) => <p key={item}>{item}</p>)}
                  </div>
                  <div>
                    <strong>What will be queued or left untouched</strong>
                    {[...(admissionDecision?.writeIntent.willQueue ?? []), ...(admissionDecision?.writeIntent.willLeaveUntouched ?? [])].map((item) => <p key={item}>{item}</p>)}
                  </div>
                  <div>
                    <strong>What routes onward</strong>
                    {(admissionDecision?.writeIntent.willRouteOnward ?? ["Read-side views remain read-only."]).map((item) => <p key={item}>{item}</p>)}
                  </div>
                </div>
                <p>Before completion: {(admissionDecision?.closePreview.beforeCompletion ?? ["canon status change", "gate result", "resume state"]).join(" · ")}</p>
                <p>After completion: {(admissionDecision?.closePreview.afterCompletion ?? ["Current Canon", "Audit Trail", "record detail"]).join(" · ")}</p>
              </section>
              <section className="subpanel">
                <h3>Read-side trail</h3>
                <p>Read-side views stay read-only; Admission mutation controls remain inside this flow.</p>
                <div className="chips">
                  {(admissionDecision?.readSideTrail ?? [{ label: "Current Canon", href: "/api/canon-workbench/current" }, { label: "Audit Trail", href: "/api/canon-workbench/audit" }]).map((item) => <span key={`${item.label}:${item.href}`}>{item.label} · {item.href}</span>)}
                </div>
              </section>
            </section>
            <div className="grid">
              <label>Record id<input value={admissionRecordId} onChange={(event) => setAdmissionRecordId(event.target.value)} /></label>
              <label>Admission level<select value={admissionLevel} onChange={(event) => setAdmissionLevel(event.target.value)}><option></option>{admissionLevels.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
              <label>Work scale<select value={workScale} onChange={(event) => setWorkScale(event.target.value)}><option></option>{workScales.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
            </div>
            <div className="row">
              <button onClick={declareSeverity} disabled={!openWorld || !admissionRecordId || !admissionLevel || !workScale}>Declare Severity</button>
              <button onClick={startAdmission} disabled={!openWorld || !admissionRecordId}>Start Gate</button>
              <button onClick={skipAdmissionInstrument} disabled={!openWorld}>Record Skip</button>
            </div>
            <div className="grid">
              <label>Operation<select value={admissionOperation} onChange={(event) => setAdmissionOperation(event.target.value)}>{admissionOperations.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
              <label>Quiet domain declaration<input value={gateQuietDomain} onChange={(event) => setGateQuietDomain(event.target.value)} /></label>
              <label>N/A reason<input value={gateNotApplicable} onChange={(event) => setGateNotApplicable(event.target.value)} /></label>
            </div>
            <label>Consequence check<textarea rows={3} value={gateConsequence} onChange={(event) => setGateConsequence(event.target.value)} /></label>
            <div className="row">
              <button onClick={completeAdmission} disabled={!openWorld || !admissionRecordId || !(recordForm.truthLayer || selectedAdmissionRecord?.truthLayer) || !admissionOperation}>Complete Gate</button>
              <button onClick={admitMinorBatch} disabled={!openWorld || !recordForm.title || !recordForm.truthLayer || !gateConsequence}>Admit Minor Row</button>
            </div>
            <label>Seed audit findings<textarea rows={3} value={seedAuditFindings} onChange={(event) => setSeedAuditFindings(event.target.value)} /></label>
            <button onClick={runSeedAudit} disabled={!openWorld || !admissionRecordId || !seedAuditFindings}>Run Seed Audit</button>
            <div className="subpanel">
              <h3>Canon debt</h3>
              <div className="row">
                <input aria-label="Canon debt name" value={canonDebtName} onChange={(event) => setCanonDebtName(event.target.value)} placeholder="named debt" />
                <button onClick={createDebt} disabled={!openWorld || !canonDebtName}>Create Debt</button>
              </div>
              {canonDebt.map((debt) => <button key={debt.id} onClick={() => closeDebt(debt)}>{debt.shortId} · {debt.title}</button>)}
            </div>
            <div className="records compact">
              {admissionQueue.map((row) => {
                const queueSources = row.sourceLinks?.map((link) =>
                  link.target ? `${link.target.shortId} ${link.target.title}` : `record ${link.toRecordId}`
                ).join(", ") || "none returned";
                return (
                  <article key={row.id}>
                    <button onClick={() => { void selectAdmissionQueueRow(row); }}>Select</button>
                    <h3>{row.shortId} · {row.title}</h3>
                    <p className="meta">{`${row.recordTypeKey} · ${row.truthLayer ?? "unset truth layer"} · ${row.canonStatus ?? "unset canon status"}`}</p>
                    <p className="meta">level {row.admissionLevel ?? "unset"} · {row.workScale ?? "unset"} · tags {row.constraintTags.join(", ") || "none"}</p>
                    <p className="meta">Queue source or origin: {queueSources}</p>
                    <p className="meta">Open canon debt warning context: {canonDebt.length ? `${canonDebt.length} open item(s)` : "none currently loaded"}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="panel">
            <h2>Institutional, Economic, and Suppression flow</h2>
            <div className="doctrine">
              <strong>Doctrine and checklist</strong>
              <span>{stage12Run ? `${stage12Run.doctrine.protocol} · ${stage12Run.doctrine.checklist}` : "Start or resume a stage-12 run to load server-returned doctrine."}</span>
              <span>{stage12Run?.doctrine.completionRule ?? "The server owns close readiness and coverage policy."}</span>
            </div>
            <div className="grid">
              <label>Source type<select value={stage12SourceType} onChange={(event) => setStage12SourceType(event.target.value as typeof stage12SourceType)}>
                <option value="fact">fact</option>
                <option value="under_review_fact">under-review fact</option>
                <option value="canon_debt">canon debt</option>
                <option value="material">selected material</option>
                <option value="record_section">record section</option>
                <option value="pass_report">pass report</option>
              </select></label>
              <label>Source or report id<input value={stage12SourceRecordId} onChange={(event) => setStage12SourceRecordId(event.target.value)} /></label>
              <label>Section heading<input value={stage12SourceSection} onChange={(event) => setStage12SourceSection(event.target.value)} /></label>
              <label>Flow id<input value={stage12FlowId ?? ""} onChange={(event) => setStage12FlowId(event.target.value ? Number(event.target.value) : null)} /></label>
            </div>
            <div className="grid">
              <label>Material title<input value={stage12MaterialTitle} onChange={(event) => setStage12MaterialTitle(event.target.value)} /></label>
              <label>Material body<textarea rows={2} value={stage12MaterialBody} onChange={(event) => setStage12MaterialBody(event.target.value)} /></label>
            </div>
            <div className="row">
              <button onClick={startStage12Run} disabled={!openWorld || (stage12SourceType !== "material" && !stage12SourceRecordId) || (stage12SourceType === "material" && (!stage12MaterialTitle.trim() || !stage12MaterialBody.trim()))}>Start or Resume Stage-12</button>
              <button onClick={() => void refreshStage12Run()} disabled={!openWorld || stage12FlowId == null}>Refresh Stage-12</button>
              <button onClick={closeStage12Run} disabled={!openWorld || stage12FlowId == null}>Close Stage-12 Run</button>
            </div>
            {!stage12Run && (
              <>
                <section className="subpanel">
                  <h3>Close blockers</h3>
                  <p className="status">Start or refresh a run to load server-returned blockers.</p>
                </section>
                <div className="grid">
                  <label>Coverage lens<select value={stage12LensKey} onChange={(event) => setStage12LensKey(event.target.value)}></select></label>
                  <label>Stage-12 advisory id<input value={stage12AdvisoryRecordId} onChange={(event) => setStage12AdvisoryRecordId(event.target.value)} /></label>
                </div>
                <label>Coverage or outcome prose<textarea rows={4} value={stage12CoverageBody} onChange={(event) => setStage12CoverageBody(event.target.value)} /></label>
                <div className="row">
                  <button onClick={saveStage12Coverage} disabled>Save Coverage</button>
                  <button onClick={routeStage12Proposal} disabled>Route Proposal</button>
                  <button onClick={mintStage12Debt} disabled>Mint Stage-12 Debt</button>
                </div>
                <section className="subpanel">
                  <h3>Create or Link Card</h3>
                  <button onClick={createOrLinkStage12Card} disabled>Create or Link Card</button>
                </section>
                <section className="subpanel">
                  <h3>Governed skip</h3>
                  <button onClick={recordStage12Skip} disabled>Record Governed Skip</button>
                </section>
              </>
            )}
            {stage12Run && (
              <>
                <div className="doctrine">
                  <strong>{stage12Run.report.shortId} · {stage12Run.source.sourceSummary}</strong>
                  <span>{stage12Run.doctrine.browserPolicy}</span>
                  <span>Run status: {stage12Run.flow.state} · close readiness: {stage12Run.closeReadiness.status}</span>
                </div>
                <section className="subpanel">
                  <h3>Close blockers</h3>
                  {stage12Run.closeReadiness.blockers.length === 0 ? (
                    <p className="status">No server-returned blockers.</p>
                  ) : (
                    <ul>
                      {stage12Run.closeReadiness.blockers.map((blocker) => <li key={blocker.key}>{blocker.label}: {blocker.message}</li>)}
                    </ul>
                  )}
                </section>
                <div className="grid">
                  <label>Coverage lens<select value={stage12LensKey} onChange={(event) => setStage12LensKey(event.target.value)}>
                    {stage12Run.doctrine.lenses.map((lens) => <option key={lens.key} value={lens.key}>{lens.label}</option>)}
                  </select></label>
                  <label>Stage-12 advisory id<input value={stage12AdvisoryRecordId} onChange={(event) => setStage12AdvisoryRecordId(event.target.value)} /></label>
                </div>
                <label>Coverage or outcome prose<textarea rows={4} value={stage12CoverageBody} onChange={(event) => setStage12CoverageBody(event.target.value)} /></label>
                <div className="row">
                  <button onClick={saveStage12Coverage} disabled={stage12FlowId == null || !stage12CoverageBody.trim()}>Save Coverage</button>
                  <button onClick={routeStage12Proposal} disabled={stage12FlowId == null || !recordForm.title.trim() || !(recordForm.body || stage12CoverageBody).trim()}>Route Proposal</button>
                  <button onClick={mintStage12Debt} disabled={stage12FlowId == null || !(canonDebtName || recordForm.title).trim() || !stage12CoverageBody.trim()}>Mint Stage-12 Debt</button>
                </div>
                <section className="subpanel">
                  <h3>Create or Link Card</h3>
                  <div className="grid">
                    <label>Card type<select value={stage12CardType} onChange={(event) => setStage12CardType(event.target.value as typeof stage12CardType)}>
                      <option value="action_arena">action_arena</option>
                      <option value="institution">institution</option>
                      <option value="counter_institution">counter_institution</option>
                    </select></label>
                    <label>Existing card id<input value={stage12ExistingCardId} onChange={(event) => setStage12ExistingCardId(event.target.value)} /></label>
                    <label>Relation<input value={stage12CardRelation} onChange={(event) => setStage12CardRelation(event.target.value)} /></label>
                  </div>
                  <button onClick={createOrLinkStage12Card} disabled={stage12FlowId == null || (!stage12ExistingCardId && !recordForm.title.trim())}>Create or Link Card</button>
                </section>
                <section className="subpanel">
                  <h3>Governed skip</h3>
                  <div className="grid">
                    <label>Skip step<input value={stage12SkipStep} onChange={(event) => setStage12SkipStep(event.target.value)} /></label>
                    <label className="inline-check"><input type="checkbox" checked={stage12SkipUnresolved} onChange={(event) => setStage12SkipUnresolved(event.target.checked)} />Unresolved follow-up</label>
                  </div>
                  <button onClick={recordStage12Skip} disabled={stage12FlowId == null || !stage12SkipStep.trim()}>Record Governed Skip</button>
                </section>
                <div className="grid two">
                  <section className="subpanel">
                    <h3>Coverage</h3>
                    {stage12Run.coverage.map((coverage) => <article key={coverage.id}><h3>{coverage.lensLabel}</h3><p>{coverage.body}</p></article>)}
                  </section>
                  <section className="subpanel">
                    <h3>Outcomes</h3>
                    <p>Cards: {stage12Run.linkedCards.map((card) => `${card.card.shortId} ${card.card.title}`).join(", ") || "none"}</p>
                    <p>Proposals: {stage12Run.proposals.map((proposal) => `${proposal.record.shortId} ${proposal.record.title}`).join(", ") || "none"}</p>
                    <p>Debt: {stage12Run.debt.map((debt) => `${debt.record.shortId} ${debt.record.title}`).join(", ") || "none"}</p>
                    <p>Advisory: {stage12Run.advisories.map((advisory) => `${advisory.record.shortId} ${advisory.stepKey}`).join(", ") || "none"}</p>
                    <p>Skips: {stage12Run.skips.map((skip) => `${skip.record.shortId} ${skip.stepKey}`).join(", ") || "none"}</p>
                  </section>
                </div>
              </>
            )}
          </div>

          <div className="panel">
            <h2>Constraint Composition flow</h2>
            <section className="subpanel">
              <h3>Start or Resume Constraint Composition</h3>
              <div className="doctrine">
                <strong>Doctrine, checklist, and template</strong>
                <span>{constraintRun ? `${constraintRun.doctrine.protocol} · ${constraintRun.doctrine.checklist} · ${constraintRun.doctrine.template}` : "Start or resume a run to load server-returned doctrine."}</span>
                <span>{constraintRun?.doctrine.completionRule ?? "The server owns constraint budget, loopholes, enforcement, residue, and close readiness."}</span>
              </div>
              <div className="grid">
                <label>Source type<select value={constraintSourceType} onChange={(event) => setConstraintSourceType(event.target.value as typeof constraintSourceType)}>
                  <option value="fact">fact</option>
                  <option value="capability">capability</option>
                  <option value="constraint_card">constraint card</option>
                  <option value="canon_debt">canon debt</option>
                  <option value="material">selected material</option>
                  <option value="record_section">record section</option>
                  <option value="pass_report">pass report</option>
                </select></label>
                <label>Source or report id<input value={constraintSourceRecordId} onChange={(event) => setConstraintSourceRecordId(event.target.value)} /></label>
                <label>Section heading<input value={constraintSourceSection} onChange={(event) => setConstraintSourceSection(event.target.value)} /></label>
                <label>Flow id<input value={constraintFlowId ?? ""} onChange={(event) => setConstraintFlowId(event.target.value ? Number(event.target.value) : null)} /></label>
              </div>
              <div className="grid">
                <label>Material title<input value={constraintMaterialTitle} onChange={(event) => setConstraintMaterialTitle(event.target.value)} /></label>
                <label>Material body<textarea rows={2} value={constraintMaterialBody} onChange={(event) => setConstraintMaterialBody(event.target.value)} /></label>
                <label>Constrained subject<input value={constraintSubject} onChange={(event) => setConstraintSubject(event.target.value)} /></label>
              </div>
              <div className="row">
                <button onClick={startConstraintRun} disabled={!openWorld || (constraintSourceType !== "material" && !constraintSourceRecordId) || (constraintSourceType === "material" && (!constraintMaterialTitle.trim() || !constraintMaterialBody.trim()))}>Start or Resume Constraint Composition</button>
                <button onClick={() => void refreshConstraintRun()} disabled={!openWorld || constraintFlowId == null}>Refresh Constraint Run</button>
                <button onClick={closeConstraintRun} disabled={!openWorld || constraintFlowId == null}>Close Constraint Run</button>
              </div>
            </section>

            <section className="subpanel">
              <h3>Current decision</h3>
              <p className="status">{constraintRun ? `${constraintRun.report.shortId} · ${constraintRun.source.sourceSummary} · ${constraintRun.flow.current_step}` : "No Constraint Composition run loaded."}</p>
              <p className="meta">{constraintRun?.doctrine.browserPolicy ?? "Browser controls surface server policy, blockers, write intent, Prompt-out state, and read-side trail."}</p>
              <ol>
                {(constraintRun?.doctrine.stepMap ?? [
                  { key: "source_selection", label: "Source selection", decision: "Pick the constrained material." },
                  { key: "constraint_inventory", label: "Constraint inventory", decision: "Record budget, loopholes, enforcement, and residue." },
                  { key: "close_preview", label: "Close preview", decision: "Use server-returned blockers before appending a report." }
                ]).map((step) => <li key={step.key}>{step.label}: {step.decision}</li>)}
              </ol>
            </section>

            <section className="subpanel">
              <h3>Server close blockers</h3>
              {constraintRun && constraintRun.closeReadiness.blockers.length === 0 ? (
                <p className="status">No server-returned blockers.</p>
              ) : (
                <ul>
                  {(constraintRun?.closeReadiness.blockers ?? [
                    { key: "constraint_budget", label: "Constraint budget", message: "Start a run to load exact server blockers." },
                    { key: "loopholes", label: "Loopholes", message: "Start a run to load exact server blockers." },
                    { key: "enforcement", label: "Enforcement", message: "Start a run to load exact server blockers." },
                    { key: "residue", label: "Residue", message: "Start a run to load exact server blockers." }
                  ]).map((blocker) => <li key={blocker.key}>{blocker.label}: {blocker.message}</li>)}
                </ul>
              )}
            </section>

            <section className="subpanel">
              <h3>Constraint Inventory</h3>
              <div className="grid">
                <label>Constrained fact<input value={constraintInventory.constrainedFact} onChange={(event) => setConstraintInventory((current) => ({ ...current, constrainedFact: event.target.value }))} /></label>
                <label>Constraint statement<input value={constraintInventory.constraintStatement} onChange={(event) => setConstraintInventory((current) => ({ ...current, constraintStatement: event.target.value }))} /></label>
                <label>Constraint type<select value={constraintInventory.constraintType} onChange={(event) => setConstraintInventory((current) => ({ ...current, constraintType: event.target.value }))}>
                  {constraintTypes.map((term) => <option key={term.term}>{term.term}</option>)}
                </select></label>
                <label>Boundary knowledge<input value={constraintInventory.boundaryKnowledge} onChange={(event) => setConstraintInventory((current) => ({ ...current, boundaryKnowledge: event.target.value }))} /></label>
              </div>
              <div className="grid">
                <label>Prevents<textarea rows={2} value={constraintInventory.prevents} onChange={(event) => setConstraintInventory((current) => ({ ...current, prevents: event.target.value }))} /></label>
                <label>Allows<textarea rows={2} value={constraintInventory.allows} onChange={(event) => setConstraintInventory((current) => ({ ...current, allows: event.target.value }))} /></label>
                <label>Bypass actors<textarea rows={2} value={constraintInventory.bypassActors} onChange={(event) => setConstraintInventory((current) => ({ ...current, bypassActors: event.target.value }))} /></label>
                <label>Cause or mystery boundary<textarea rows={2} value={constraintInventory.causeOrMysteryBoundary} onChange={(event) => setConstraintInventory((current) => ({ ...current, causeOrMysteryBoundary: event.target.value }))} /></label>
                <label>Enforcement<textarea rows={2} value={constraintInventory.enforcement} onChange={(event) => setConstraintInventory((current) => ({ ...current, enforcement: event.target.value }))} /></label>
                <label>Residue<textarea rows={2} value={constraintInventory.residue} onChange={(event) => setConstraintInventory((current) => ({ ...current, residue: event.target.value }))} /></label>
                <label>Cost or observable<input value={constraintInventory.costOrObservable} onChange={(event) => setConstraintInventory((current) => ({ ...current, costOrObservable: event.target.value }))} /></label>
              </div>
              <button onClick={saveConstraintInventory} disabled={constraintFlowId == null}>Save Constraint Inventory</button>
            </section>

            <section className="subpanel">
              <h3>Composition Testing</h3>
              <div className="grid">
                <label>Analysis type<select value={constraintCompositionType} onChange={(event) => setConstraintCompositionType(event.target.value)}>
                  {constraintCompositionTypes.map((type) => <option key={type}>{type}</option>)}
                </select></label>
                <label>Analysis<textarea rows={3} value={constraintCompositionBody} onChange={(event) => setConstraintCompositionBody(event.target.value)} /></label>
              </div>
              <button onClick={saveConstraintComposition} disabled={constraintFlowId == null || !constraintCompositionBody.trim()}>Save Composition Test</button>
              <p className="meta">Saved: {constraintRun?.composition.map((entry) => entry.analysisType).join(", ") || "none"}</p>
            </section>

            <section className="subpanel">
              <h3>Leakage and Residue</h3>
              <div className="grid two">
                <div>
                  <label>Bottleneck<textarea rows={2} value={constraintLeakage.bottleneck} onChange={(event) => setConstraintLeakage((current) => ({ ...current, bottleneck: event.target.value }))} /></label>
                  <label>Loopholes<textarea rows={2} value={constraintLeakage.loopholes} onChange={(event) => setConstraintLeakage((current) => ({ ...current, loopholes: event.target.value }))} /></label>
                  <label>Partial workarounds<textarea rows={2} value={constraintLeakage.partialWorkarounds} onChange={(event) => setConstraintLeakage((current) => ({ ...current, partialWorkarounds: event.target.value }))} /></label>
                  <label>False bypasses<textarea rows={2} value={constraintLeakage.falseBypasses} onChange={(event) => setConstraintLeakage((current) => ({ ...current, falseBypasses: event.target.value }))} /></label>
                  <label>Accidents<textarea rows={2} value={constraintLeakage.accidents} onChange={(event) => setConstraintLeakage((current) => ({ ...current, accidents: event.target.value }))} /></label>
                  <label>Countermeasures<textarea rows={2} value={constraintLeakage.countermeasures} onChange={(event) => setConstraintLeakage((current) => ({ ...current, countermeasures: event.target.value }))} /></label>
                  <label>Boundary testers<textarea rows={2} value={constraintLeakage.boundaryTesters} onChange={(event) => setConstraintLeakage((current) => ({ ...current, boundaryTesters: event.target.value }))} /></label>
                  <button onClick={saveConstraintLeakage} disabled={constraintFlowId == null}>Save Leakage</button>
                </div>
                <div>
                  <label>Ordinary life<textarea rows={2} value={constraintResidue.ordinaryLife} onChange={(event) => setConstraintResidue((current) => ({ ...current, ordinaryLife: event.target.value }))} /></label>
                  <label>Institutional effects<textarea rows={2} value={constraintResidue.institutionalEffects} onChange={(event) => setConstraintResidue((current) => ({ ...current, institutionalEffects: event.target.value }))} /></label>
                  <label>Economic effects<textarea rows={2} value={constraintResidue.economicEffects} onChange={(event) => setConstraintResidue((current) => ({ ...current, economicEffects: event.target.value }))} /></label>
                  <label>Visible traces<textarea rows={2} value={constraintResidue.visibleTraces} onChange={(event) => setConstraintResidue((current) => ({ ...current, visibleTraces: event.target.value }))} /></label>
                  <label>Expertise<input value={constraintResidue.expertise} onChange={(event) => setConstraintResidue((current) => ({ ...current, expertise: event.target.value }))} /></label>
                  <label>Resentment<input value={constraintResidue.resentment} onChange={(event) => setConstraintResidue((current) => ({ ...current, resentment: event.target.value }))} /></label>
                  <label>Crime<input value={constraintResidue.crime} onChange={(event) => setConstraintResidue((current) => ({ ...current, crime: event.target.value }))} /></label>
                  <label>Ritual<input value={constraintResidue.ritual} onChange={(event) => setConstraintResidue((current) => ({ ...current, ritual: event.target.value }))} /></label>
                  <label>Markets<input value={constraintResidue.markets} onChange={(event) => setConstraintResidue((current) => ({ ...current, markets: event.target.value }))} /></label>
                  <label>Failure modes<input value={constraintResidue.failureModes} onChange={(event) => setConstraintResidue((current) => ({ ...current, failureModes: event.target.value }))} /></label>
                  <button onClick={saveConstraintResidue} disabled={constraintFlowId == null}>Save Residue</button>
                </div>
              </div>
            </section>

            <div className="grid two">
              <section className="subpanel">
                <h3>Create or Link Constraint Card</h3>
                <div className="grid">
                  <label>Inventory id<input value={constraintInventoryId} onChange={(event) => setConstraintInventoryId(event.target.value)} /></label>
                  <label>Existing card id<input value={constraintExistingCardId} onChange={(event) => setConstraintExistingCardId(event.target.value)} /></label>
                  <label>Relation<input value={constraintCardRelation} onChange={(event) => setConstraintCardRelation(event.target.value)} /></label>
                  <label>Advisory id<input value={constraintAdvisoryRecordId} onChange={(event) => setConstraintAdvisoryRecordId(event.target.value)} /></label>
                </div>
                <button onClick={createOrLinkConstraintCard} disabled={constraintFlowId == null || (!constraintExistingCardId && !recordForm.title.trim() && !constraintInventoryId)}>Create or Link Constraint Card</button>
                <p>Cards: {constraintRun?.linkedCards.map((card) => `${card.card.shortId} ${card.card.title}`).join(", ") || "none"}</p>
              </section>
              <section className="subpanel">
                <h3>Route Admission Proposal</h3>
                <label>Source step<input value={constraintSourceStep} onChange={(event) => setConstraintSourceStep(event.target.value)} /></label>
                <button onClick={routeConstraintProposal} disabled={constraintFlowId == null || !recordForm.title.trim() || !(recordForm.body || constraintCompositionBody || constraintInventory.constraintStatement).trim()}>Route Admission Proposal</button>
                <h3>Mint Constraint Debt</h3>
                <button onClick={mintConstraintDebt} disabled={constraintFlowId == null || !(canonDebtName || recordForm.title).trim() || !(gateNotApplicable || constraintCompositionBody || constraintInventory.residue).trim()}>Mint Constraint Debt</button>
                <p>Proposals: {constraintRun?.proposals.map((proposal) => `${proposal.record.shortId} ${proposal.record.title}`).join(", ") || "none"}</p>
                <p>Debt: {constraintRun?.debt.map((debt) => `${debt.record.shortId} ${debt.record.title}`).join(", ") || "none"}</p>
              </section>
            </div>

            <div className="grid two">
              <section className="subpanel">
                <h3>Record Governed Skip</h3>
                <div className="grid">
                  <label>Skip step<input value={constraintSkipStep} onChange={(event) => setConstraintSkipStep(event.target.value)} /></label>
                  <label className="inline-check"><input type="checkbox" checked={constraintSkipUnresolved} onChange={(event) => setConstraintSkipUnresolved(event.target.checked)} />Unresolved follow-up</label>
                </div>
                <button onClick={recordConstraintSkip} disabled={constraintFlowId == null || !constraintSkipStep.trim()}>Record Governed Skip</button>
                <p>Skips: {constraintRun?.skips.map((skip) => `${skip.record.shortId} ${skip.stepKey}`).join(", ") || "none"}</p>
              </section>
              <section className="subpanel">
                <h3>Prompt-out preview</h3>
                <p className="meta">{constraintRun?.promptOut.coldUseEvidence ?? "Prompt-out becomes available after steward-authored constraint material exists."}</p>
                <button onClick={() => {
                  setPromptFlowKey("constraint_composition");
                  setPromptTemplateKey("constraint_challenger");
                  if (constraintRun?.promptOut.sourceRecordId != null) setPromptRecordId(String(constraintRun.promptOut.sourceRecordId));
                }} disabled={!constraintRun}>Use Constraint Challenger</button>
                <p>Advisory: {constraintRun?.advisories.map((advisory) => `${advisory.record.shortId} ${advisory.stepKey}`).join(", ") || "none"}</p>
              </section>
            </div>

            <section className="subpanel">
              <h3>Read-side trail</h3>
              <ul>
                {(constraintRun?.readSideTrail ?? [
                  { label: "Pass report", href: "/api/canon-workbench/records/:id" },
                  { label: "Audit Trail", href: "/api/canon-workbench/audit" },
                  { label: "Current Canon", href: "/api/canon-workbench/current" }
                ]).map((item) => <li key={`${item.label}-${item.href}`}>{item.label}: {item.href}</li>)}
              </ul>
            </section>

            <section className="subpanel">
              <h3>Naive steward walkthrough</h3>
              <ol>
                <li>Start from a fact, capability, constraint card, canon debt, selected material, record section, or pass report.</li>
                <li>Fill inventory, composition testing, leakage, and residue until the server removes close blockers.</li>
                <li>Choose card, proposal, debt, Prompt-out, or skip outcomes without directly mutating canon from advisory material.</li>
                <li>Close only when the pass report and read-side trail show the governed outcome.</li>
              </ol>
            </section>
          </div>

          <div className="panel">
            <h2>Contradiction/Retcon/Mystery flow</h2>
            <div className="doctrine">
              <strong>Stage 13</strong>
              <span>Source: docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md and docs/specs/contradiction-retcon-mystery-flow.md.</span>
              <span>Prompt-out templates: repair_challenge · boundary_guard</span>
              <span>{stage13Run ? `Run ${stage13Run.flow.id} · ${stage13Run.flow.state} · ${stage13Run.flow.current_step}` : "Start or refresh a Stage 13 run to load server-returned state."}</span>
            </div>
            <div className="grid">
              <label>Source record id<input value={stage13SourceRecordId} onChange={(event) => setStage13SourceRecordId(event.target.value)} /></label>
              <label>Implicated record ids<input value={stage13ImplicatedRecordIds} onChange={(event) => setStage13ImplicatedRecordIds(event.target.value)} /></label>
              <label>Flow id<input value={stage13FlowId ?? ""} onChange={(event) => setStage13FlowId(event.target.value ? Number(event.target.value) : null)} /></label>
            </div>
            <label>Free-standing contradiction title<input value={stage13Title} onChange={(event) => setStage13Title(event.target.value)} /></label>
            <div className="row">
              <button onClick={startStage13Run} disabled={!openWorld || (!stage13SourceRecordId && !stage13Title.trim())}>Start or Resume Stage 13</button>
              <button onClick={() => void refreshStage13Run()} disabled={!openWorld || stage13FlowId == null}>Refresh Stage 13</button>
              <button onClick={closeStage13Run} disabled={!openWorld || stage13FlowId == null}>Attempt Stage 13 Close</button>
            </div>

            <section className="subpanel">
              <h3>Triage</h3>
              <div className="grid">
                <label>Triage section<select value={stage13TriageStep} onChange={(event) => setStage13TriageStep(event.target.value)}>
                  {stage13TriageSteps.map((step) => <option key={step.stepKey} value={step.stepKey}>{step.label}</option>)}
                </select></label>
                <label>Work scale<select value={stage13WorkScale} onChange={(event) => setStage13WorkScale(event.target.value)}><option></option>{workScales.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
                <label>Contradiction disposition<select value={stage13Disposition} onChange={(event) => setStage13Disposition(event.target.value)}><option></option>{contradictionDispositions.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
              </div>
              <label>{stage13TriageSteps.find((step) => step.stepKey === stage13TriageStep)?.label ?? "Contradiction statement"}<textarea rows={3} value={stage13TriageBody} onChange={(event) => setStage13TriageBody(event.target.value)} /></label>
              <label>Disposition note<textarea rows={2} value={stage13DispositionNote} onChange={(event) => setStage13DispositionNote(event.target.value)} /></label>
              <div className="row">
                <button onClick={saveStage13Triage} disabled={stage13FlowId == null || !stage13TriageBody.trim()}>Save Triage Section</button>
                <button onClick={saveStage13Scale} disabled={stage13FlowId == null || !stage13WorkScale}>Save Work Scale</button>
                <button onClick={saveStage13Disposition} disabled={stage13FlowId == null || !stage13Disposition}>Save Disposition</button>
              </div>
              <div className="records compact">
                {(stage13Run?.triage ?? []).map((entry) => (
                  <article key={entry.step_key}>
                    <h3>{stage13TriageSteps.find((step) => step.stepKey === entry.step_key)?.label ?? entry.step_key}</h3>
                    <p>{entry.body}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="subpanel">
              <h3>Repair operations</h3>
              <div className="grid">
                <label>Repair operation<select value={stage13RepairOperationDraft} onChange={(event) => setStage13RepairOperationDraft(event.target.value)}>{repairOperationTerms.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
                <label>Repair advisory id<input value={stage13RepairAdvisoryRecordId} onChange={(event) => setStage13RepairAdvisoryRecordId(event.target.value)} /></label>
                <button onClick={addStage13RepairOperation} disabled={!stage13RepairOperationDraft}>Add Operation</button>
              </div>
              <label>Repair operation order<textarea rows={3} value={stage13RepairOperationOrder} onChange={(event) => setStage13RepairOperationOrder(event.target.value)} /></label>
              <label>Repair text<textarea rows={3} value={stage13RepairText} onChange={(event) => setStage13RepairText(event.target.value)} /></label>
              <button onClick={saveStage13Repair} disabled={stage13FlowId == null || !stage13RepairOperationOrder.trim() || !stage13RepairText.trim()}>Save Repair Operations</button>
              <div className="grid">
                <label>Repair target record id<input value={stage13RepairTargetRecordId} onChange={(event) => setStage13RepairTargetRecordId(event.target.value)} /></label>
                <label>Next canon status<select value={stage13RepairTargetStatus} onChange={(event) => setStage13RepairTargetStatus(event.target.value)}><option></option>{canonStatuses.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
                <label>Target note<input value={stage13RepairTargetNote} onChange={(event) => setStage13RepairTargetNote(event.target.value)} /></label>
              </div>
              <div className="grid">
                <label>Replacement title<input value={stage13RepairTargetTitle} onChange={(event) => setStage13RepairTargetTitle(event.target.value)} /></label>
                <label>Replacement body<textarea rows={2} value={stage13RepairTargetBody} onChange={(event) => setStage13RepairTargetBody(event.target.value)} /></label>
                <button onClick={addStage13RepairTarget} disabled={stage13FlowId == null || !stage13RepairTargetRecordId || !stage13RepairTargetStatus}>Add Repair Target</button>
              </div>
              <p>Saved repair operations: {stage13Run?.repairOperations.map((operation) => `${operation.position}. ${operation.operation}`).join(", ") || "none"}</p>
              <p>Saved repair targets: {stage13Run?.repairTargets.map((target) => `${target.record_id} -> ${target.next_canon_status}`).join(", ") || "none"}</p>
            </section>

            <section className="subpanel">
              <h3>Admission proposals</h3>
              <div className="grid">
                <label>Proposed title<input value={stage13ProposalTitle} onChange={(event) => setStage13ProposalTitle(event.target.value)} /></label>
                <label>Truth layer<select value={stage13ProposalTruthLayer} onChange={(event) => setStage13ProposalTruthLayer(event.target.value)}>{truthLayers.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
              </div>
              <label>Proposed body<textarea rows={3} value={stage13ProposalBody} onChange={(event) => setStage13ProposalBody(event.target.value)} /></label>
              <button onClick={proposeStage13Fact} disabled={stage13FlowId == null || !stage13ProposalTitle.trim() || !stage13ProposalBody.trim() || !stage13ProposalTruthLayer}>Propose Repair-Created Fact to Admission</button>
              <p>Admission proposals: {stage13Run?.proposals.map((proposal) => `record ${proposal.proposal_record_id}`).join(", ") || "none"}</p>
            </section>

            <section className="subpanel">
              <h3>Retcon costs</h3>
              <label>Retcon type<select value={stage13RetconType} onChange={(event) => setStage13RetconType(event.target.value)}><option></option>{retconTypes.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
              <div className="grid compact-grid">
                {stage13RetconCostKeys.map((cost) => (
                  <label key={cost}>{cost}<textarea rows={2} value={stage13RetconCostTexts[cost] ?? ""} onChange={(event) => setStage13RetconCostTexts({ ...stage13RetconCostTexts, [cost]: event.target.value })} /></label>
                ))}
              </div>
              <button onClick={saveStage13RetconCosts} disabled={stage13FlowId == null || !stage13RetconType || !stage13RetconCostKeys.some((cost) => stage13RetconCostTexts[cost]?.trim())}>Save Retcon Costs</button>
              <p>Saved retcon costs: {stage13Run?.retconCosts.map((cost) => `${cost.retcon_type} / ${cost.cost_key}`).join(", ") || "none"}</p>
            </section>

            <section className="subpanel">
              <h3>Repair propagation</h3>
              <div className="grid">
                <label>Propagation action<select value={stage13PropagationAction} onChange={(event) => setStage13PropagationAction(event.target.value as "assign" | "decline")}><option value="assign">assign</option><option value="decline">decline</option></select></label>
                <label>Debt name<input value={stage13PropagationDebtName} onChange={(event) => setStage13PropagationDebtName(event.target.value)} /></label>
                <label>Decline reason<input value={stage13PropagationReason} onChange={(event) => setStage13PropagationReason(event.target.value)} /></label>
              </div>
              <label>Propagation body<textarea rows={3} value={stage13PropagationBody} onChange={(event) => setStage13PropagationBody(event.target.value)} /></label>
              <button onClick={saveStage13RepairPropagation} disabled={stage13FlowId == null || (stage13PropagationAction === "assign" && !stage13PropagationDebtName.trim())}>Save Repair Propagation</button>
              <p>Repair propagation state: {stage13Run?.repairPropagation ? `${stage13Run.repairPropagation.action} · debt ${stage13Run.repairPropagation.debtRecordId ?? "none"} · skip ${stage13Run.repairPropagation.skipRecordId ?? "none"}` : "none"}</p>
              <div className="grid">
                <label>Skip step<input value={stage13SkipStep} onChange={(event) => setStage13SkipStep(event.target.value)} /></label>
                <label>Skip reason<input value={stage13SkipReason} onChange={(event) => setStage13SkipReason(event.target.value)} /></label>
              </div>
              <button onClick={recordStage13Skip} disabled={!openWorld || !stage13SkipStep.trim()}>Record Stage 13 Skip</button>
            </section>

            <section className="subpanel">
              <h3>Owed-boundaries queue</h3>
              <div className="records compact">
                {stage13OwedBoundaries.map((row) => (
                  <article key={row.propagationDispositionId}>
                    <button onClick={() => selectOwedBoundary(row)}>Select</button>
                    <h3>Boundary #{row.propagationDispositionId} · protected record {row.protectedRecordId}</h3>
                    <p className="meta">{row.preservationBoundary} · propagation report {row.propagationReportRecordId ?? "none"}</p>
                    <p>{row.consequenceBody || row.note}</p>
                  </article>
                ))}
              </div>
              <div className="grid">
                <label>Propagation disposition id<input value={stage13PropagationDispositionId} onChange={(event) => setStage13PropagationDispositionId(event.target.value)} /></label>
                <label>Ledger record id<input value={stage13LedgerRecordId} onChange={(event) => setStage13LedgerRecordId(event.target.value)} /></label>
                <label>Protected record id<input value={stage13ProtectedRecordId} onChange={(event) => setStage13ProtectedRecordId(event.target.value)} /></label>
                <label>Propagation report id<input value={stage13PropagationReportRecordId} onChange={(event) => setStage13PropagationReportRecordId(event.target.value)} /></label>
                <label>Protected effect type<select value={stage13ProtectedEffectType} onChange={(event) => setStage13ProtectedEffectType(event.target.value)}><option></option>{protectedEffectTypes.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
                <label>Mystery state<select value={stage13MysteryState} onChange={(event) => setStage13MysteryState(event.target.value)}><option></option>{mysteryStates.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
                <label>Preservation boundary<select value={stage13PreservationBoundary} onChange={(event) => setStage13PreservationBoundary(event.target.value)}><option></option>{preservationBoundaries.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
              </div>
              <label>Mystery ledger title<input value={stage13LedgerTitle} onChange={(event) => setStage13LedgerTitle(event.target.value)} /></label>
              <div className="grid compact-grid">
                {stage13MysterySectionHeadings.map((heading) => (
                  <label key={heading}>{heading}<textarea rows={2} value={stage13MysterySections[heading] ?? ""} onChange={(event) => setStage13MysterySections({ ...stage13MysterySections, [heading]: event.target.value })} /></label>
                ))}
              </div>
              <button onClick={saveStage13MysteryLedger} disabled={!openWorld || !stage13LedgerTitle.trim() || !stage13ProtectedRecordId || !stage13ProtectedEffectType || !stage13MysteryState || !stage13PreservationBoundary}>Create or Update Mystery Ledger</button>
            </section>

            <section className="subpanel">
              <h3>Preservation checklist</h3>
              <div className="grid">
                <label>Operation<select value={stage13ChecklistOperation} onChange={(event) => setStage13ChecklistOperation(event.target.value)}><option></option>{preservationOperations.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
                <label>Checklist effect type<select value={stage13ChecklistEffectType} onChange={(event) => setStage13ChecklistEffectType(event.target.value)}><option></option>{protectedEffectTypes.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
              </div>
              <label>Checklist body<textarea rows={3} value={stage13ChecklistBody} onChange={(event) => setStage13ChecklistBody(event.target.value)} /></label>
              <label>Sacred-opacity accountability<textarea rows={3} value={stage13ChecklistSacredGuard} onChange={(event) => setStage13ChecklistSacredGuard(event.target.value)} /></label>
              <button onClick={completeStage13Checklist} disabled={!openWorld || !stage13ChecklistOperation || !stage13ChecklistEffectType || !stage13ChecklistBody.trim()}>Complete Preservation Checklist</button>
              <p>Checklists: {stage13Run?.checklists.map((checklist) => `${checklist.operation} · ${checklist.effect_type}`).join(", ") || "none"}</p>
            </section>

            <section className="subpanel">
              <h3>Run payload</h3>
              <p>Implicated records: {stage13Run?.implicatedRecords.map((record) => `${record.shortId} ${record.title}`).join(", ") || "none"}</p>
              <p>Work scale: {stage13Run?.workScale ?? "unset"} · disposition: {stage13Run?.disposition?.disposition ?? "unset"}</p>
              <p>Repair operations: {stage13Run?.repairOperations.map((operation) => operation.operation).join(", ") || "none"}</p>
              <p>Retcon costs: {stage13Run?.retconCosts.map((cost) => cost.cost_key).join(", ") || "none"}</p>
              <p>Repair propagation: {stage13Run?.repairPropagation?.action ?? "none"}</p>
              <p>Proposals: {stage13Run?.proposals.map((proposal) => proposal.proposal_record_id).join(", ") || "none"}</p>
              <p>Checklists: {stage13Run?.checklists.length ?? 0}</p>
            </section>
          </div>

          <div className="panel">
            <h2>Propagation flow</h2>
            <div className="doctrine">
              <strong>Shock cone</strong>
              <span>Source: docs/worldbuilding-system/07_propagation_engine.md and docs/worldbuilding-system/04_domain_atlas.md.</span>
              <span>{propagationPlan?.requiredCoverage ?? "Load a fact plan to see severity-scaled coverage."}</span>
            </div>
            <div className="grid">
              <label>Fact id<input value={propagationFactId} onChange={(event) => setPropagationFactId(event.target.value)} /></label>
              <label>Debt id<input value={propagationDebtId} onChange={(event) => setPropagationDebtId(event.target.value)} /></label>
              <label>Flow id<input value={propagationFlowId ?? ""} onChange={(event) => setPropagationFlowId(event.target.value ? Number(event.target.value) : null)} /></label>
            </div>
            <div className="row">
              <button onClick={loadPropagationPlan} disabled={!openWorld || !propagationFactId}>Load Plan</button>
              <button onClick={startPropagation} disabled={!openWorld || !propagationFactId}>Start or Resume</button>
              <button onClick={() => propagationFlowId != null && loadPropagationRun(propagationFlowId)} disabled={!openWorld || propagationFlowId == null}>Refresh Run</button>
              <button onClick={closePropagation} disabled={!openWorld || propagationFlowId == null}>Close Run</button>
            </div>
            {propagationPlan && (
              <div className="doctrine">
                <strong>Signature tests</strong>
                <span>{propagationPlan.doctrine.signatureTests.join(" · ")}</span>
                <span>Stopping states: {propagationPlan.doctrine.stoppingRules.join(" · ")}</span>
              </div>
            )}
            <div className="grid">
              <label>Order<select value={propagationOrderKey} onChange={(event) => setPropagationOrderKey(event.target.value)}>{(propagationPlan?.orders ?? []).map((order) => <option key={order.key} value={order.key}>{order.label}</option>)}</select></label>
              <label>Domain<select value={propagationDomainName} onChange={(event) => setPropagationDomainName(event.target.value)}><option></option>{(propagationPlan?.domains ?? []).map((domain) => <option key={domain}>{domain}</option>)}</select></label>
              <label>Pressure<select value={propagationPressure} onChange={(event) => setPropagationPressure(event.target.value as "normal" | "high")}><option>normal</option><option>high</option></select></label>
              <label>Triage<select value={propagationTriage} onChange={(event) => setPropagationTriage(event.target.value as "direct" | "dependency" | "reaction" | "negative")}><option>direct</option><option>dependency</option><option>reaction</option><option>negative</option></select></label>
            </div>
            <label>Propagation prose<textarea rows={4} value={propagationText} onChange={(event) => setPropagationText(event.target.value)} /></label>
            <div className="row">
              <button onClick={savePropagationConsequence} disabled={propagationFlowId == null || !propagationText.trim()}>Add Consequence</button>
              <button onClick={savePropagationDomain} disabled={propagationFlowId == null || !propagationDomainName || (propagationTriage === "negative" && !propagationText.trim())}>Record Domain</button>
              <button onClick={skipPropagation} disabled={!openWorld}>Record Skip</button>
            </div>
            <div className="grid">
              <label>Consequence id<input value={propagationConsequenceId} onChange={(event) => setPropagationConsequenceId(event.target.value)} /></label>
              <label>Disposition<select value={propagationDispositionTerm} onChange={(event) => setPropagationDispositionTerm(event.target.value)}>{consequenceDispositions.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
              <label>Debt or boundary<input value={propagationBoundary} onChange={(event) => setPropagationBoundary(event.target.value)} /></label>
            </div>
            <div className="row">
              <button onClick={savePropagationDisposition} disabled={!propagationConsequenceId || !propagationDispositionTerm}>Save Disposition</button>
              <button onClick={proposePropagationFact} disabled={propagationFlowId == null || !recordForm.title || !recordForm.truthLayer}>Propose Surfaced Fact</button>
            </div>
            <div className="subpanel">
              <h3>Owed propagation</h3>
              {propagationQueue.map((debt) => <button key={debt.id} onClick={() => { setPropagationDebtId(String(debt.id)); }}>{debt.shortId} · {debt.title}</button>)}
            </div>
            <div className="records compact">
              {propagationConsequences.map((consequence) => (
                <article key={consequence.id}>
                  <button onClick={() => setPropagationConsequenceId(String(consequence.id))}>Select</button>
                  <h3>#{consequence.id} · {consequence.orderLabel}</h3>
                  <p className="meta">{consequence.pressure} · {consequence.domainName ?? "no domain"} · {propagationDispositions.some((row) => row.consequenceId === consequence.id) ? "dispositioned" : "open"}</p>
                  <p>{consequence.body}</p>
                </article>
              ))}
              {propagationDomains.map((domain) => (
                <article key={domain.id}>
                  <h3>{domain.domainName}</h3>
                  <p className="meta">{domain.triage}</p>
                  <p>{domain.declaration || "swept"}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="panel">
            <h2>QA flow</h2>
            <div className="doctrine">
              <strong>Scorecard</strong>
              <span>Source: docs/worldbuilding-system/18_quality_assurance_tests.md.</span>
              <span>{qaBand ? `Band: ${qaBand.color} - ${qaBand.reason}` : "Start or refresh a QA pass to load scorecard policy."}</span>
              {qaScorecard?.subjectMode && <span>Consequence mode: {qaScorecard.subjectMode}</span>}
            </div>
            <div className="grid">
              <label>Subject type<select value={qaSubjectType} onChange={(event) => setQaSubjectType(event.target.value as "record" | "world")}>
                <option value="record">record</option>
                <option value="world">world</option>
              </select></label>
              <label>Subject record id<input value={qaSubjectRecordId} onChange={(event) => setQaSubjectRecordId(event.target.value)} /></label>
              <label>Flow id<input value={qaFlowId ?? ""} onChange={(event) => setQaFlowId(event.target.value ? Number(event.target.value) : null)} /></label>
            </div>
            <div className="row">
              <button onClick={startQaPass} disabled={!openWorld || (qaSubjectType === "record" && !qaSubjectRecordId)}>Start QA Pass</button>
              <button onClick={refreshQaPass} disabled={!openWorld || qaFlowId == null}>Refresh QA Pass</button>
              <button onClick={finalizeQaPass} disabled={!openWorld || qaFlowId == null}>Finalize QA Pass</button>
              {qaPassId != null && <span className="status">Pass {qaPassId}</span>}
            </div>
            <div className="subpanel">
              <h3>28-test scorecard</h3>
              <div className="grid">
                <label>Test<select value={qaTestNumber} onChange={(event) => setQaTestNumber(event.target.value)}>
                  {(qaScorecard?.tests ?? []).map((test) => <option key={test.number} value={test.number}>{test.number}. {test.name}</option>)}
                </select></label>
                <label>Score<select value={qaScore} onChange={(event) => setQaScore(event.target.value as "0" | "1" | "2" | "3" | "na")}>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="na">n/a</option>
                </select></label>
                <label>N/A reason<input value={qaNaReason} onChange={(event) => setQaNaReason(event.target.value)} /></label>
              </div>
              <label>Notes<textarea rows={3} value={qaNotes} onChange={(event) => setQaNotes(event.target.value)} /></label>
              <label>Required repair<textarea rows={3} value={qaRequiredRepair} onChange={(event) => setQaRequiredRepair(event.target.value)} /></label>
              <div className="row">
                <label className="inline-check"><input type="checkbox" checked={qaLoadBearing} onChange={(event) => setQaLoadBearing(event.target.checked)} />Load-bearing</label>
                <label className="inline-check"><input type="checkbox" checked={qaRepairRouted} onChange={(event) => setQaRepairRouted(event.target.checked)} />Repair routed</label>
                <button onClick={saveQaScore} disabled={qaFlowId == null}>Save QA Score</button>
              </div>
              <div className="records compact">
                {(qaScorecard?.tests ?? []).map((test) => (
                  <article key={test.number}>
                    <button onClick={() => setQaTestNumber(String(test.number))}>Select</button>
                    <h3>{test.number}. {test.name}</h3>
                    <p className="meta">{test.cluster} · {qaScores.find((score) => score.testNumber === test.number)?.score ?? "unscored"}</p>
                    <p>{test.failureSmell}</p>
                    <p>{test.anchors.weak} / {test.anchors.adequate} / {test.anchors.strong}</p>
                  </article>
                ))}
              </div>
            </div>
            <div className="subpanel">
              <h3>Regression profile</h3>
              <div className="grid">
                <label>Strongest domain<input value={qaProfile.strongestDomain} onChange={(event) => setQaProfile({ ...qaProfile, strongestDomain: event.target.value })} /></label>
                <label>Weakest domain<input value={qaProfile.weakestDomain} onChange={(event) => setQaProfile({ ...qaProfile, weakestDomain: event.target.value })} /></label>
                <label>Under-propagated fact<input value={qaProfile.mostDangerousUnderPropagatedFact} onChange={(event) => setQaProfile({ ...qaProfile, mostDangerousUnderPropagatedFact: event.target.value })} /></label>
              </div>
              <div className="grid">
                <label>Likely contradiction<input value={qaProfile.mostLikelyContradiction} onChange={(event) => setQaProfile({ ...qaProfile, mostLikelyContradiction: event.target.value })} /></label>
                <label>Fragile mystery<input value={qaProfile.mostFragileMystery} onChange={(event) => setQaProfile({ ...qaProfile, mostFragileMystery: event.target.value })} /></label>
                <label>Overloaded constraint<input value={qaProfile.mostOverloadedConstraint} onChange={(event) => setQaProfile({ ...qaProfile, mostOverloadedConstraint: event.target.value })} /></label>
              </div>
              <div className="grid">
                <label>Absent institution response<input value={qaProfile.mostSuspiciousAbsentInstitutionResponse} onChange={(event) => setQaProfile({ ...qaProfile, mostSuspiciousAbsentInstitutionResponse: event.target.value })} /></label>
                <label>Aesthetic drift<input value={qaProfile.mostAtRiskAestheticDrift} onChange={(event) => setQaProfile({ ...qaProfile, mostAtRiskAestheticDrift: event.target.value })} /></label>
                <label>Blocking canon debt<input value={qaProfile.canonDebtBeforeFoundationalFacts} onChange={(event) => setQaProfile({ ...qaProfile, canonDebtBeforeFoundationalFacts: event.target.value })} /></label>
              </div>
              <button onClick={saveQaProfile} disabled={qaFlowId == null}>Save Regression Profile</button>
            </div>
            <div className="subpanel">
              <h3>Repair loop and floor</h3>
              <div className="doctrine">
                <strong>Repair loop</strong>
                <span>{qaScorecard?.doctrine.repairLoop.join(" ") ?? "Load the scorecard to see repair doctrine."}</span>
                <span>{qaScorecard?.doctrine.redFlags.slice(0, 3).join(" · ") ?? ""}</span>
              </div>
              <div className="grid">
                <label>Repair kind<select value={qaRepairKind} onChange={(event) => setQaRepairKind(event.target.value as "fact" | "canon_debt")}>
                  <option value="fact">fact</option>
                  <option value="canon_debt">canon debt</option>
                </select></label>
                <label>Debt kind<input value={qaDebtKind} onChange={(event) => setQaDebtKind(event.target.value)} /></label>
                <label>Debt name<input value={canonDebtName} onChange={(event) => setCanonDebtName(event.target.value)} /></label>
              </div>
              <div className="grid compact-grid">
                {(Object.entries(qaFloorConditionLabels) as Array<[keyof QaFloorConditions, string]>).map(([key, label]) => (
                  <label className="inline-check" key={key}>
                    <input
                      type="checkbox"
                      checked={qaFloorConditions[key]}
                      onChange={(event) => setQaFloorConditions({ ...qaFloorConditions, [key]: event.target.checked })}
                    />
                    {label}
                  </label>
                ))}
              </div>
              <div className="row">
                <button onClick={routeQaRepair} disabled={qaFlowId == null || !qaRequiredRepair.trim()}>Route QA Repair</button>
                <label className="inline-check"><input type="checkbox" checked={qaFloorOverride} onChange={(event) => setQaFloorOverride(event.target.checked)} />Override floor</label>
              </div>
              <label>Floor override reason<input value={qaFloorOverrideReason} onChange={(event) => setQaFloorOverrideReason(event.target.value)} /></label>
              <button onClick={saveQaFloor} disabled={qaFlowId == null}>Record Floor Advisory</button>
            </div>
          </div>

          <div className="panel creation-decision">
            <h2>Creation decision point</h2>
            <p className="status">Primary active path for a new world</p>
            <div className="row">
              <button onClick={startFlow} disabled={!openWorld}>Start or Resume Creation</button>
              <span className="status">{flowId ? `Flow ${flowId}${kernelRecordId ? ` · kernel ${kernelRecordId}` : ""}` : "No Creation flow loaded"}</span>
            </div>
            <section className="decision-point">
              <h3>Current decision</h3>
              <p><strong>{displayedCreationDecision.localDecision}</strong></p>
              <div className="chips">
                <span>Flow state: {displayedCreationDecision.flow.runState}</span>
                <span>Current step: {displayedCreationDecision.currentStep}</span>
                <span>Next: {displayedCreationDecision.nextOrResumeState.nextStep}</span>
                <span>Safe exit/resume</span>
              </div>
              <div className="doctrine">
                <strong>Package authority</strong>
                <span>{displayedCreationDecision.packageAuthority.primary}</span>
                <span>{displayedCreationDecision.packageAuthority.why}</span>
                {displayedCreationDecision.packageAuthority.citations.map((citation) => <span key={citation}>{citation}</span>)}
              </div>
            </section>
            <div className="grid compact-grid">
              <section className="subpanel work-list required-work">
                <h3>Required</h3>
                {displayedCreationDecision.work.required.map((item) => <p key={item}>{item}</p>)}
              </section>
              <section className="subpanel work-list optional-work">
                <h3>Optional</h3>
                {displayedCreationDecision.work.optional.map((item) => <p key={item}>{item}</p>)}
              </section>
              <section className="subpanel work-list allowed-empty-work">
                <h3>Allowed-empty</h3>
                {displayedCreationDecision.work.allowedEmpty.map((item) => <p key={item}>{item}</p>)}
              </section>
              <section className="subpanel work-list skippable-work">
                <h3>Skippable</h3>
                {displayedCreationDecision.work.skippable.map((item) => <p key={item}>{item}</p>)}
              </section>
            </div>
            <section className="subpanel">
              <h3>Server blockers</h3>
              {displayedCreationDecision.blockers.length === 0
                ? <p className="status">No Creation blockers returned for the current step.</p>
                : displayedCreationDecision.blockers.map((blocker) => (
                  <p key={blocker.key}><strong>{blocker.label}</strong>: {blocker.message} Requires {blocker.requires}.</p>
                ))}
            </section>
            <section className="subpanel">
              <h3>Kernel authoring</h3>
              <p>Consequence mode is steward judgment; the app does not infer, default, or silently reuse it.</p>
              <div className="grid">
                <label>Kernel step<select value={kernelHeading} onChange={(event) => setKernelHeading(event.target.value)}>{headings.filter((heading) => heading.record_type_key === "world_kernel").map((heading) => <option key={heading.heading}>{heading.heading}</option>)}</select></label>
                <label>Consequence mode<select value={consequenceMode} onChange={(event) => setConsequenceMode(event.target.value)}><option></option>{consequenceModes.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
              </div>
              <div className="grid compact-grid">
                {displayedCreationDecision.sectionPrompts.map((section) => (
                  <div key={section.heading} className="doctrine">
                    <strong>{section.heading}</strong>
                    <span>{section.obligation}</span>
                    <span>{section.prompt}</span>
                  </div>
                ))}
              </div>
              <label>Kernel section<textarea rows={4} value={kernelBody} onChange={(event) => setKernelBody(event.target.value)} /></label>
              <div className="subpanel">
                <h3>Write preview</h3>
                <p>{displayedCreationDecision.writeIntent.willWrite.join(" · ")}</p>
                <p>{displayedCreationDecision.writeIntent.willLeaveUntouched.join(" · ")}</p>
              </div>
              <button onClick={saveKernelStep} disabled={flowId == null}>Save Kernel Step</button>
            </section>
            <section className="subpanel">
              <h3>Prompt-out preview</h3>
              <p>{displayedCreationDecision.promptOut.role} · {displayedCreationDecision.promptOut.available ? "available" : "blocked"}</p>
              {(displayedCreationDecision.promptOut.modes ?? []).map((mode) => (
                <div className="doctrine" key={mode.mode}>
                  <strong>{mode.label}</strong>
                  <span>{mode.available ? "Available from server" : mode.blocker ?? "Blocked by server"}</span>
                  <span>{mode.framing}</span>
                  <span>Output labels: {mode.outputLabels.join(", ")}</span>
                </div>
              ))}
              <p>{displayedCreationDecision.promptOut.preview.currentDecision}</p>
              <strong>Source manifest</strong>
              {displayedCreationDecision.promptOut.preview.sourceManifest.map((item) => <p key={item}>{item}</p>)}
              <strong>Context preview</strong>
              <p>{displayedCreationDecision.promptOut.preview.contextPreview}</p>
              <strong>Omissions</strong>
              {displayedCreationDecision.promptOut.preview.omissions.map((item) => <p key={item}>{item}</p>)}
              <strong>Advisory/canon warning</strong>
              <p>{displayedCreationDecision.promptOut.preview.advisoryCanonWarning}</p>
              <p>Pasted responses remain advisory artifacts and do not mutate kernel sections, seed records, reports, or proposals without explicit steward use.</p>
              <button onClick={loadCreationPromptStep} disabled={!openWorld || (!creationDecision?.promptOut.stepRequest && !creationDecision?.promptOut.modes?.some((mode) => mode.stepRequest))}>Load Creation Prompt-out Step</button>
            </section>
            <section className="subpanel">
              <h3>Seed decomposition decision</h3>
              <p>Split broad steward material into smaller seed facts that can be independently rejected.</p>
              <p>Actual current status: proposed</p>
              <div className="grid">
                <label>Seed title<input value={seedTitle} onChange={(event) => setSeedTitle(event.target.value)} /></label>
                <label>Seed body<input value={seedBody} onChange={(event) => setSeedBody(event.target.value)} /></label>
                <label>Truth layer<select value={seedTruthLayer} onChange={(event) => setSeedTruthLayer(event.target.value)}><option></option>{truthLayers.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
                <label>Admission intent<input value={admissionIntent} onChange={(event) => setAdmissionIntent(event.target.value)} placeholder="advisory future handling only" /></label>
              </div>
              <label>Granularity rationale<textarea rows={3} value={granularityRationale} onChange={(event) => setGranularityRationale(event.target.value)} /></label>
              <label className="inline-check"><input type="checkbox" checked={granularityConfirmed} onChange={(event) => setGranularityConfirmed(event.target.checked)} />Granularity confirmation</label>
              <div className="subpanel">
                <h3>Write preview</h3>
                <p>{displayedCreationDecision.writeIntent.willWrite.join(" · ")}</p>
                <p>{displayedCreationDecision.writeIntent.willLink.join(" · ")}</p>
                <p>{displayedCreationDecision.writeIntent.willQueue.join(" · ")}</p>
                <p>Admission handoff: {displayedCreationDecision.writeIntent.willRouteOnward.join(" · ")}</p>
              </div>
              <button onClick={decompose} disabled={flowId == null || kernelRecordId == null}>Decompose and Park Seed</button>
            </section>
            <section className="subpanel">
              <h3>Read-side trail</h3>
              <div className="chips">
                {displayedCreationDecision.readSideTrail.map((item) => <span key={`${item.label}:${item.href}`}>{item.label} · {item.href}</span>)}
              </div>
            </section>
            <section className="subpanel">
              <h3>Naive steward walkthrough</h3>
              <ol>
                <li>Identify the current Creation decision and source doctrine.</li>
                <li>Distinguish required, optional, skippable, and allowed-empty obligations.</li>
                <li>Treat Prompt-out as advisory pressure, not canon generation.</li>
                <li>Predict the kernel, report, seed records, links, Admission handoff, and non-mutations before writing.</li>
                <li>Exit and resume without losing flow orientation.</li>
              </ol>
            </section>
          </div>

          {message && <p className="status">{message}</p>}

          {exportedMarkdown && (
            <div className="panel">
              <h2>Markdown export</h2>
              <textarea rows={12} value={exportedMarkdown} readOnly />
            </div>
          )}

          <div className="records">
            {records.map((record) => (
              <article key={record.id}>
                <div className="row">
                  <button onClick={() => editRecord(record)}>Edit</button>
                  <button onClick={() => proposeRecord(record)}>Propose</button>
                  <button onClick={() => exportRecordMarkdown(record)}>Export Markdown</button>
                  {recordTypeByKey.get(record.recordTypeKey)?.mutationRegime === "card" && <button onClick={() => promoteRecord(record)}>Promote</button>}
                </div>
                <h3>{record.shortId} · {record.title}</h3>
                <p className="meta">{record.recordTypeKey} · {record.truthLayer ?? "no layer"} · {record.canonStatus ?? "no status"} · {record.updatedAt}</p>
                <p>{record.body || "No prose yet."}</p>
              </article>
            ))}
          </div>
          {links.length > 0 && (
            <div className="links">
              <h2>Links</h2>
              {links.map((link) => <p key={`${link.id}-${link.depth ?? 0}`}>{link.depth ? `${link.depth}. ` : ""}{link.fromRecordId} {link.linkTypeKey} {link.toRecordId}{link.note ? ` · ${link.note}` : ""}</p>)}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

const rootElement = typeof document === "undefined" ? null : document.getElementById("root");
if (rootElement) createRoot(rootElement).render(<App />);

export { App };
