import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import type { HealthPayload, LinkTypeDefinition, MethodCard, RecordTypeDefinition, WorkflowMapConditionalPassObligation, WorkflowMapPayload } from "@worldloom/shared";
import {
  PropagationWorkspace,
  type ConsequenceRevisionInput,
  type DomainRevisionInput,
  type PropagationWorkspaceConsequence,
  type PropagationWorkspaceDisposition,
  type PropagationWorkspaceDomain
} from "./propagation-workspace.js";
import { WorkflowShell } from "./workflow-shell.js";
import {
  TemporalPromptOutPanel,
  type TemporalPacketContextView,
  type TemporalPromptError,
  type TemporalPromptModeOffer
} from "./temporal-prompt-out-panel.js";
import {
  TemporalRevisionWorkspace,
  type TemporalCoverageDraft,
  type TemporalFinalizationPreview,
  type TemporalRevisionStateView
} from "./temporal-revision-workspace.js";
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

interface DecisionPointPromptMode {
  mode: string;
  label: string;
  availability: string;
  blocker: string | null;
  framing: string;
  outputLabels?: string[];
  stepRequest: { method: string; href: string; body: Record<string, unknown> } | null;
}

interface DecisionPointSharedContract {
  methodCard?: MethodCard;
  flow: { key: string; runState: string };
  step: { key: string; localDecision: string; packageSource: string; why: string };
  obligations: { required: string[]; optional: string[]; skippable: string[]; severityDependent: string[] };
  bearingContext: { displayed: string[]; sourceManifest: string[]; omissions: string[] };
  promptOut: { serverOwned: boolean; modes: DecisionPointPromptMode[] };
  blockers: Array<{ key: string; label?: string; message: string; requires?: string; consequenceId?: number }>;
  writeIntent: {
    willWrite: string[];
    willLink: string[];
    willQueue: string[];
    willRouteOnward: string[];
    willLeaveUntouched: string[];
  };
  nextOrResumeState: { currentStep: string; nextStep: string; safeExit: string };
  readSideTrail: Array<{ label: string; href: string; recordId?: number }>;
}

interface DecisionPointEnvelope {
  sharedContract: DecisionPointSharedContract;
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
  owedItem?: RecordRow;
  sourceFact?: RecordRow | null;
  route?: { method: "POST"; href: string; body: { factRecordId: number; debtRecordId?: number } } | null;
}

type PropagationConsequence = PropagationWorkspaceConsequence;
type PropagationDomain = PropagationWorkspaceDomain;
type PropagationDisposition = PropagationWorkspaceDisposition;

interface PropagationPlan {
  sourceFact?: RecordRow;
  severityPath?: { admissionLevel: string | null; workScale: string | null };
  requiredCoverage: string;
  requiredDomainCount: number;
  orders: Array<{ key: string; label: string }>;
  domains: string[];
  orderControls?: Array<{ key: string; label: string; doctrine: string; severityExpectation: string; consequenceCount?: number; pressureLevels?: string[] }>;
  domainAtlas?: Array<{ name: string; state: "direct" | "dependency" | "reaction" | "negative" | "unswept"; declaration: string; doctrine: string }>;
  methodCard?: MethodCard;
  methodCards?: MethodCard[];
  decisionPoint?: DecisionPointEnvelope;
  doctrine: { signatureTests: string[]; stoppingRules: string[] };
}

interface PropagationRunPayload {
  flow: { id: number; state: string; current_step: string; propagation_fact_record_id: number; propagation_debt_record_id: number | null; propagation_report_record_id?: number | null; propagation_active_set_revision: number };
  sourceFact: RecordRow;
  owedDebt: RecordRow | null;
  severityPath: { admissionLevel: string | null; workScale: string | null };
  revisionDecision: {
    name: string;
    packageSources: string[];
    doctrine: { staging: string; reportBoundary: string };
    writeIntent: { willWrite: string[]; willLink: string[]; willQueue: string[]; willLeaveUntouched: string[] };
  };
  activeSet: {
    revision: number;
    changedKind: string | null;
    changedRowId: number | null;
    changedReason: string | null;
  };
  packetCurrentness: {
    status: "current" | "stale";
    activeSetRevision: number;
    priorPressureRevision: number | null;
    reason: string;
    recovery: { action: string; changedKind: string | null; changedRowId: number | null; href: string; body: Record<string, unknown> };
    pressure: {
      status: "current-or-unused" | "owed";
      reasonRequired: boolean;
      externalLlmRequired: boolean;
      freshPacket: { method: "POST"; href: string; body: Record<string, unknown> };
      skip: { method: "POST"; href: string };
    };
  };
  closeReadiness: { status: string; blockers: Array<{ key: string; label?: string; message: string; requires?: string; consequenceId?: number }> };
  closePreview: {
    willWrite: string[];
    existingRecords: Array<{ kind: string; recordId: number; title?: string; canonStatus?: string | null }>;
    willLeaveUntouched: string[];
    readSideTrail: Array<{ label: string; href: string; recordId?: number }>;
  };
  readSideTrail: Array<{ label: string; href: string; recordId?: number }>;
  plan: PropagationPlan;
  decisionPoint?: DecisionPointEnvelope;
  consequences: PropagationConsequence[];
  domainSweeps: PropagationDomain[];
  dispositions: PropagationDisposition[];
  proposals?: unknown[];
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
  methodCard?: MethodCard;
  methodCards?: MethodCard[];
  decisionPoint?: DecisionPointEnvelope;
  minimalViableWorldEcho?: MinimalViableWorldEcho | null;
  doctrine: {
    redFlags: string[];
    modeBenchmarks: string[];
    repairLoop: string[];
  };
}

interface MinimalViableWorldEvidenceRef {
  id: number;
  shortId: string;
  title: string;
  recordTypeKey: string;
  canonStatus: string | null;
}

interface MinimalViableWorldSignal {
  key: string;
  label: string;
  status: string;
  evidence: MinimalViableWorldEvidenceRef[];
  reason: string;
}

interface MinimalViableWorldDisposition {
  seedRecordId: number;
  dimensionKey: string;
  disposition: "covered" | "deferred" | "protected_mystery";
  substance: string;
  evidenceRecordIds: number[];
  protectedRecordId?: number | null;
}

interface MinimalViableWorldState {
  checkpoint: {
    owed: boolean;
    report: RecordRow | null;
    route: string;
    blockers: Array<{ key: string; label?: string; message: string; requires?: string }>;
    coverageSignals: {
      admittedSeeds: Array<MinimalViableWorldEvidenceRef & { dimensions: MinimalViableWorldSignal[] }>;
      wholeWorld: MinimalViableWorldSignal[];
    };
    dispositions: MinimalViableWorldDisposition[];
    closeReadiness: { status: string; blockers: Array<{ key: string; label: string; message: string }> };
    unresolvedDeferrals: MinimalViableWorldDisposition[];
    openCanonDebt: RecordRow[];
    admissionProposals: RecordRow[];
    advisoryArtifacts: RecordRow[];
  };
  decisionPoint: DecisionPointEnvelope;
}

interface MinimalViableWorldEcho {
  status: string;
  route: string;
  report: RecordRow | null;
  dispositions: MinimalViableWorldDisposition[];
  coverageSignalSummary: MinimalViableWorldSignal[];
  unresolvedDeferrals: MinimalViableWorldDisposition[];
  protectedMysteryEvidence: MinimalViableWorldSignal[];
  openCanonDebt: RecordRow[];
  admissionProposals: RecordRow[];
  advisoryArtifacts: RecordRow[];
  readSideTrail: Array<{ label: string; href: string; recordId?: number }>;
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
  methodCard?: MethodCard;
  methodCards?: MethodCard[];
  coverage: Array<{ id: number; lensKey: string; lensLabel: string; body: string }>;
  linkedCards: Array<{ id: number; cardTypeKey: string; lensKey: string | null; card: RecordRow }>;
  proposals: Array<{ id: number; lensKey: string | null; record: RecordRow }>;
  debt: Array<{ id: number; lensKey: string | null; record: RecordRow }>;
  advisories: Array<{ id: number; stepKey: string; record: RecordRow }>;
  skips: Array<{ id: number; stepKey: string; record: RecordRow; debt: RecordRow | null }>;
  closeReadiness: { status: string; blockers: Stage12CloseBlocker[] };
  decisionPoint?: DecisionPointEnvelope;
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
  methodCards?: MethodCard[];
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
  decisionPoint?: { sharedContract: { methodCard?: MethodCard } };
}

interface TemporalCloseBlocker {
  kind: string;
  key: string;
  label: string;
  message: string;
}

type TemporalCoverage = TemporalCoverageDraft;

interface TemporalRun {
  flow: { id: number; state: string; current_step: string };
  report: RecordRow | null;
  priorReport: RecordRow | null;
  source: {
    sourceType: string;
    sourceRecordId: number | null;
    materialTitle: string;
    materialBody: string;
    auditedSubject: string;
    sourceSummary: string;
    triggerRecommendation: string;
  };
  doctrine: {
    flowKey: string;
    protocol: string;
    checklist: string;
    template: string;
    triggerRecommendation: string;
    stepMap: Array<{ key: string; label: string; decision: string }>;
    completionRule: string;
    browserPolicy: string;
  };
  methodCards?: MethodCard[];
  coverage: TemporalCoverage | null;
  revisionState: TemporalRevisionStateView;
  revisionContract: {
    name: string;
    packageSources: string[];
    stagingDoctrine: string;
    draftState: { status: string; dirty: boolean; failed: boolean; authoritativeRevisionId: number | null };
    reportRelationship: { type: "final" | "correction"; retainedPriorReportRecordId: number | null };
  };
  sections: SectionRow[];
  cards: Array<{ card: RecordRow }>;
  proposals: Array<{ record: RecordRow }>;
  debt: Array<{ record: RecordRow }>;
  advisories: Array<{ record: RecordRow }>;
  skips: Array<{ record: RecordRow }>;
  closeReadiness: { status: string; blockers: TemporalCloseBlocker[] };
  closePreview: TemporalFinalizationPreview;
  reportRelationship: { type: "final" | "correction"; retainedPriorReportRecordId: number | null };
  promptOut: { available: boolean; templateKey: string; stepKey: string; coldUseEvidence: string; sourceRecordId: number | null };
  readSideTrail: Array<{ label: string; href: string; recordId?: number }>;
  decisionPoint?: DecisionPointEnvelope;
}

interface Stage13Run {
  flow: {
    id: number;
    state: string;
    current_step: string;
    contradiction_source_record_id: number | null;
    contradiction_report_record_id: number | null;
  };
  methodCard?: MethodCard;
  methodCards?: MethodCard[];
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
  decisionPoint?: DecisionPointEnvelope;
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
  body?: string;
  recordTypeKey: string;
  recordTypeLabel: string;
  truthLayer: string;
  canonStatus: string;
  continuityScope: string;
  currentLivingText?: string;
  gateProvenance?: {
    hasGateResult: boolean;
    hasProposalHistory: boolean;
    hasLinkedDebt: boolean;
  };
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
  standingProvenance?: {
    currentLivingText: string;
    proposalHistoryText: string | null;
    gateAuditText: string | null;
    admissionOperation: string | null;
    constraintTags: string[];
    linkedPropagationDebt: Array<CanonWorkbenchRecordRef & { sourceRelationship: string }>;
    typedLinkTrail: Array<{ linkTypeKey: string; note: string; fromRecordId?: number; toRecordId?: number }>;
  };
  skipRecords: CanonWorkbenchRecordRef[];
  advisoryArtifacts: Array<{ record: CanonWorkbenchRecordRef; dispositions: unknown[] }>;
  standingRulings: unknown[];
  advisoryDispositions: unknown[];
  exportAffordance: { method: "GET"; href: string };
}

interface AdmissionValidationError {
  key: string;
  message: string;
}

interface AdmissionGateSection {
  key: string;
  label: string;
  required: boolean;
  canMarkNotApplicable: boolean;
  quietDomain: boolean;
  guidance: string;
  doctrine?: string;
}

interface AdmissionFullGateContract {
  sections: AdmissionGateSection[];
  allowedNextCanonStatuses: string[];
  operationOptions: string[];
  constraintTagOptions: string[];
  validationErrors: AdmissionValidationError[];
  completionAction: { method: "POST"; href: string };
  advisoryArtifacts: Array<{ id: number; shortId: string; title: string; stepKey: string }>;
  writePreview?: {
    recordId: number;
    writes: string[];
    links: string[];
  };
  readSideTrail?: Array<{ label: string; href: string }>;
}

interface AdmissionFullGateSectionPayload {
  key: string;
  substance?: string;
  notApplicableReason?: string;
  quietDomainDeclaration?: string;
}

interface AdmissionGateCompletionPayload {
  recordId: number;
  title: string;
  body: string;
  truthLayer: string;
  canonStatus: string;
  constraintTags: string[];
  operations: string[];
  consequenceText: string;
  sections: AdmissionFullGateSectionPayload[];
  notApplicableReasons: string[];
  quietDomainDeclarations: string[];
  followUpDebt?: string;
  advisoryRecordId?: number;
}

interface AdmissionFullGateDraftPayload {
  saved: boolean;
  draftHash: string;
  sectionKeys: string[];
  sections: Array<AdmissionFullGateSectionPayload & { label: string }>;
  consequenceText: string;
  operations: string[];
  targetCanonStatus: string;
  constraintTags: string[];
  followUpDebt?: string;
  advisoryRecordId?: number;
}

interface AdmissionFullGateReview {
  identity: string;
  reviewedAt: string;
  payload: AdmissionGateCompletionPayload;
}

interface AdmissionCompletionReadback {
  livingRecord?: Partial<RecordRow>;
  gateResult?: Partial<RecordRow>;
  operationEvents?: string[];
  constraintTags?: string[];
  followUpDebt?: Partial<RecordRow> | null;
  advisoryUse?: { advisoryRecordId: number; linkTypes?: string[] } | null;
  standingText?: {
    acceptedGateStatement: string;
    currentLivingText: string;
    originalProposalText: string;
    currentDiffersFromAccepted: boolean;
  };
  historyEvidence?: { previousTitle?: string; previousBody?: string };
  readSideTrail?: Array<{ label: string; href: string }>;
}

interface AdmissionDecisionPoint {
  methodCard?: MethodCard;
  sharedContract?: DecisionPointSharedContract;
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
      currentness?: PromptPreviewCurrentness;
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
  fullGateContract?: AdmissionFullGateContract | null;
}

interface CreationDecisionPoint {
  methodCard?: MethodCard;
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
    savedBody: string;
    hasSavedBody: boolean;
    emptyState: {
      kind: "saved_section_text" | "no_saved_section_text";
      message: string;
    };
    saveTarget: {
      flowId: number;
      heading: string;
    };
  }>;
  selectedSection: {
    heading: string;
    prompt: string;
    obligation: "required" | "optional" | "allowed-empty";
    savedBody: string;
    hasSavedBody: boolean;
    emptyState: {
      kind: "saved_section_text" | "no_saved_section_text";
      message: string;
    };
    saveTarget: {
      flowId: number;
      heading: string;
    };
  } | null;
  consequenceMode: {
    saved: string | null;
    status: "saved" | "missing_saved_facet";
    source: "record facet: consequence_mode";
    blocker: string | null;
  };
  work: {
    required: string[];
    optional: string[];
    allowedEmpty: string[];
    skippable: string[];
  };
  blockers: Array<{ key: string; label: string; message: string; requires: string }>;
  decompositionReadiness: Array<{
    key: string;
    label: string;
    status: "satisfied" | "blocked";
    message: string;
    remediation: string;
  }>;
  coverageInventory: CreationCoverageInventory;
  promptOut: {
    available: boolean;
    blocker: string | null;
    templateKey: string;
    stepKey: string;
    role: string;
    modes?: PromptOutMode[];
    stepRequest: CreationPromptOutStepRequest | null;
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
      correction?: {
        availability: string;
        directMutationBlocked: boolean;
        originalSeedWording: string;
        correctionContext: string;
        appliedNarrowingNotes?: Array<{
          note: string;
          rationale: string;
          correctionContext: {
            id: number;
            shortId: string;
            title: string;
            recordTypeKey: string;
            href: string;
          };
          framing: string;
        }>;
        actions: Array<{ key: string; label: string; available: boolean; blocker: string | null; preview: string }>;
        writeIntent: {
          willWrite: string[];
          willLink: string[];
          willQueue: string[];
          willLeaveUntouched: string[];
        };
        nextOrResumeState: {
          currentStep: string;
          nextStep: string;
          safeExit: string;
        };
      };
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

interface CreationCoverageInventory {
  kernel: {
    id: number;
    shortId: string;
    title: string;
    recordTypeKey: string;
    body: string;
    truthLayer: string | null;
    canonStatus: string | null;
  } | null;
  state: {
    status: "missing_inventory" | "blocked" | "resolved" | string;
    completionBlocked: boolean;
    summary: string;
    blockers: Array<{ key: string; label: string; message: string; requires: string }>;
  };
  createOrConfirmPath: {
    method: "POST";
    href: "/api/flows/creation/coverage";
    body: { kernelRecordId: number; seedDecompositionReportId?: number | null };
  } | null;
  rows: Array<{
    id: number;
    kernelRecordId: number;
    label: string;
    sourceKernelContext: string;
    required: boolean;
    disposition: "unresolved" | "covered" | "deferred" | "out_of_scope" | string;
    dispositionRationale: string | null;
    outOfScopeRationale: string | null;
    seedDecompositionReport: {
      id: number;
      shortId: string;
      title: string;
      recordTypeKey: string;
      body: string;
      truthLayer: string | null;
      canonStatus: string | null;
    } | null;
    linkedSeeds: Array<{
      id: number;
      shortId: string;
      title: string;
      recordTypeKey: string;
      body: string;
      truthLayer: string | null;
      canonStatus: string | null;
      note: string;
    }>;
    debtRecord: {
      id: number;
      shortId: string;
      title: string;
      recordTypeKey: string;
      body: string;
      truthLayer: string | null;
      canonStatus: string | null;
    } | null;
    actions: {
      link: { method: "POST"; href: "/api/flows/creation/coverage/link" };
      defer: { method: "POST"; href: "/api/flows/creation/coverage/defer" };
      outOfScope: { method: "POST"; href: "/api/flows/creation/coverage/out-of-scope" };
    };
  }>;
}

interface CreationPromptOutStepRequest {
  method: "POST";
  href: string;
  body: {
    flowKey: "creation";
    flowId: number;
    recordId: number;
    templateKey: string;
    stepKey: string;
    mode?: "proposal" | "pressure";
    selectedSectionHeading?: string;
    label: string;
  };
}

type CreationCorrectionActionKey =
  | "split"
  | "retract_and_rewrite"
  | "replace"
  | "admission_narrowing_note"
  | "superseding"
  | "re_proposal"
  | "admission_facing_note"
  | "read_history";

interface CreationCorrectionDraft {
  action: CreationCorrectionActionKey;
  rationale: string;
  siblingTitle: string;
  siblingBody: string;
  siblingTruthLayer: string;
  secondSiblingTitle: string;
  secondSiblingBody: string;
  secondSiblingTruthLayer: string;
  replacementTitle: string;
  replacementBody: string;
  replacementTruthLayer: string;
  narrowingNote: string;
}

interface CreationCoverageDraft {
  seedRecordIds: string;
  rationale: string;
  error: string | null;
}

const emptyCreationCoverageDraft: CreationCoverageDraft = {
  seedRecordIds: "",
  rationale: "",
  error: null
};

interface CreationCoverageBootstrapRowDraft {
  label: string;
  sourceKernelContext: string;
  required: boolean;
}

const emptyCreationCoverageBootstrapRow = (): CreationCoverageBootstrapRowDraft => ({
  label: "",
  sourceKernelContext: "",
  required: true
});

interface CreationCorrectionResponse {
  correction: unknown;
  admissionQueue: AdmissionQueueRow[];
  decisionPoint?: CreationDecisionPoint | null;
  handoff: CreationDecisionPoint["handoff"];
  readSideTrail: CreationDecisionPoint["readSideTrail"];
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
  initialMinimalViableWorld?: MinimalViableWorldState | null;
  initialPropagationQueue?: PropagationQueueRow[];
  initialPropagationRun?: PropagationRunPayload | null;
  initialTemporalRun?: TemporalRun | null;
  initialQaScorecard?: QaScorecard | null;
  initialLoadedPromptStatus?: LoadedPromptStatusState | null;
  initialPromptText?: string;
  initialPromptPacketOrigin?: LoadedPromptOrigin | null;
  initialCreationPromptMode?: "proposal" | "pressure";
}

type PromptFlowKey = "creation" | "admission" | "propagation" | "contradiction" | "qa" | "institutional_economic_suppression" | "constraint_composition" | "temporal_timeline";

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
  packetIdentity: PromptPacketIdentity;
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

interface LoadedPromptOrigin {
  worldPath: string;
  flowKey: string | null;
  flowId: number | null;
  recordId: number | null;
  recordShortId: string | null;
  recordTypeKey: string | null;
  selectedSectionHeading: string | null;
  stepKey: string;
  mode: string | null;
  templateKey: string;
  decisionLabel: string;
  createdAt: string;
  admissionLevel: string | null;
  workScale: string | null;
  activeSetRevision?: number | null;
  admissionDraftState: string;
  admissionDraftHash: string | null;
  admissionSectionKeys: string[];
  packetHash: string | null;
  bodyHash: string | null;
  sourceManifestHash: string | null;
}

interface PromptPacketIdentity {
  worldPath: string | null;
  flowKey: string | null;
  flowId: number | null;
  stepKey: string;
  mode: string | null;
  templateKey: string;
  recordId: number | null;
  recordShortId: string | null;
  recordTypeKey: string | null;
  selectedSectionHeading: string | null;
  admissionLevel: string | null;
  workScale: string | null;
  activeSetRevision?: number | null;
  admissionDraftState: string;
  admissionDraftHash: string | null;
  admissionSectionKeys: string[];
  decisionLabel: string;
  generatedAt: string | null;
  packetHash: string | null;
  bodyHash: string | null;
  sourceManifestHash: string | null;
}

interface LoadedPromptStatusState {
  origin: LoadedPromptOrigin;
}

export interface PropagationPacketContextPreview {
  serverOwned: true;
  mode: "proposal" | "pressure";
  decisionPoint: string;
  packageSources: string[];
  atlas: {
    required: boolean;
    domains: Array<{ name: string; decisionPrompt: string }>;
    triage: string;
    severityReason: string;
  };
  completeness: {
    status: "complete" | "incomplete";
    failures: string[];
  };
  relatedWorld: {
    aggregateBudget: number;
    perRecordCap: number;
    usedCharacters: number;
    completeness: {
      status: "complete" | "incomplete";
      failures: string[];
    };
    selectedRecords: Array<{
      sourceDocumentId: string;
      stableIdentity: string;
      title: string;
      recordType: string;
      canonStatus: string;
      truthLayer: string | null;
      relationship: string;
      inclusionReason: string;
      role: string;
      nonCanon: boolean;
    }>;
  };
  sourceManifest: string[];
  omissions: string[];
  advisoryCanonWarning: string;
  readOnlyGuarantee: string;
}

interface LoadedPromptStatusView {
  origin: LoadedPromptOrigin;
  state: "current" | "stale";
  staleReason: string | null;
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

interface ApiValidationPayload {
  error?: string;
  validationErrors?: Array<{ key: string; message: string }>;
}

const apiErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    const payload = error.payload as ApiValidationPayload;
    return payload.validationErrors?.map((entry) => `${entry.key}: ${entry.message}`).join("; ")
      || payload.error
      || error.message;
  }
  return error instanceof Error ? error.message : String(error);
};

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

const emptyCreationCorrectionDraft: CreationCorrectionDraft = {
  action: "split",
  rationale: "",
  siblingTitle: "",
  siblingBody: "",
  siblingTruthLayer: "",
  secondSiblingTitle: "",
  secondSiblingBody: "",
  secondSiblingTruthLayer: "",
  replacementTitle: "",
  replacementBody: "",
  replacementTruthLayer: "",
  narrowingNote: ""
};

const directCreationCorrectionActions = new Set<CreationCorrectionActionKey>([
  "split",
  "retract_and_rewrite",
  "replace",
  "admission_narrowing_note"
]);

function MethodCardPanel({ card, title = "Method card" }: { card?: MethodCard | null; title?: string }) {
  if (!card) return null;
  return (
    <section className="subpanel method-card">
      <h3>{title}: {card.decisionPoint}</h3>
      <p><strong>Decision</strong>: {card.decision}</p>
      <p><strong>Operative rule</strong>: {card.operativeRule}</p>
      <p><strong>Why the method asks</strong>: {card.why}</p>
      <p><strong>What good material looks like</strong>: {card.goodMaterial}</p>
      <details>
        <summary>Provenance</summary>
        <div className="chips">
          <span>{card.derivationVersion}</span>
          {card.packageSources.map((source) => <span key={source}>{source}</span>)}
        </div>
      </details>
    </section>
  );
}

function CreationCorrectionPanel({
  seed,
  draft,
  errorMessages,
  disabled,
  onDraftChange,
  onSubmit
}: {
  seed: CreationDecisionPoint["handoff"]["parkedSeeds"][number];
  draft: CreationCorrectionDraft;
  errorMessages: string[];
  disabled: boolean;
  onDraftChange: (patch: Partial<CreationCorrectionDraft>) => void;
  onSubmit: () => void;
}) {
  if (!seed.correction) return null;
  const correction = seed.correction;
  const selectedAction = correction.actions.find((action) => action.key === draft.action) ?? correction.actions[0];
  const selectedActionKey = (selectedAction?.key ?? draft.action) as CreationCorrectionActionKey;
  const actionUnavailable = correction.availability !== "correctable" || !selectedAction?.available || !directCreationCorrectionActions.has(selectedActionKey);
  const appliedNarrowingNotes = correction.appliedNarrowingNotes ?? [];
  return (
    <section className="subpanel correction-panel">
      <h4>Post-park correction</h4>
      <p className="status">{correction.availability === "correctable" && appliedNarrowingNotes.length === 0 ? "Correctable before Admission begins" : correction.correctionContext}</p>
      <p><strong>Original seed wording</strong>: {correction.originalSeedWording || seed.body}</p>
      {appliedNarrowingNotes.length > 0 && (
        <div className="applied-note-list">
          <h4>Applied Admission narrowing note</h4>
          {appliedNarrowingNotes.map((note) => (
            <div key={note.correctionContext.id} className="applied-note">
              <p>{note.note}</p>
              <p><strong>Rationale</strong>: {note.rationale}</p>
              <p>
                <a href={note.correctionContext.href}>{`Correction context ${note.correctionContext.shortId}`}</a>
                {` · ${note.correctionContext.title}`}
              </p>
              <p className="meta">{note.framing}</p>
            </div>
          ))}
        </div>
      )}
      <div className="grid compact-grid">
        <label>Correction action
          <select value={selectedActionKey} onChange={(event) => onDraftChange({ action: event.target.value as CreationCorrectionActionKey })}>
            {correction.actions.map((action) => (
              <option key={action.key} value={action.key} disabled={!action.available || !directCreationCorrectionActions.has(action.key as CreationCorrectionActionKey)}>
                {action.label}
              </option>
            ))}
          </select>
        </label>
        <label>Correction rationale
          <textarea rows={2} value={draft.rationale} onChange={(event) => onDraftChange({ rationale: event.target.value })} />
        </label>
      </div>
      <div className="grid compact-grid" hidden={selectedActionKey !== "split"}>
        <label>Sibling title<input value={draft.siblingTitle} onChange={(event) => onDraftChange({ siblingTitle: event.target.value })} /></label>
        <label>Sibling truth layer<input value={draft.siblingTruthLayer} onChange={(event) => onDraftChange({ siblingTruthLayer: event.target.value })} /></label>
        <label>Sibling body<textarea rows={2} value={draft.siblingBody} onChange={(event) => onDraftChange({ siblingBody: event.target.value })} /></label>
        <label>Second sibling title<input value={draft.secondSiblingTitle} onChange={(event) => onDraftChange({ secondSiblingTitle: event.target.value })} /></label>
        <label>Second sibling truth layer<input value={draft.secondSiblingTruthLayer} onChange={(event) => onDraftChange({ secondSiblingTruthLayer: event.target.value })} /></label>
        <label>Second sibling body<textarea rows={2} value={draft.secondSiblingBody} onChange={(event) => onDraftChange({ secondSiblingBody: event.target.value })} /></label>
      </div>
      <div className="grid compact-grid" hidden={selectedActionKey !== "retract_and_rewrite" && selectedActionKey !== "replace"}>
        <label>Replacement title<input value={draft.replacementTitle} onChange={(event) => onDraftChange({ replacementTitle: event.target.value })} /></label>
        <label>Replacement truth layer<input value={draft.replacementTruthLayer} onChange={(event) => onDraftChange({ replacementTruthLayer: event.target.value })} /></label>
        <label>Replacement body<textarea rows={2} value={draft.replacementBody} onChange={(event) => onDraftChange({ replacementBody: event.target.value })} /></label>
      </div>
      <label hidden={selectedActionKey !== "admission_narrowing_note"}>Narrowing note<textarea rows={2} value={draft.narrowingNote} onChange={(event) => onDraftChange({ narrowingNote: event.target.value })} /></label>
      {errorMessages.length > 0 && (
        <div className="error">
          {errorMessages.map((message) => <p key={message}>{message}</p>)}
        </div>
      )}
      <button onClick={onSubmit} disabled={disabled || actionUnavailable}>Submit Correction</button>
      <div className="grid compact-grid">
        {correction.actions.map((action) => (
          <article key={action.key} className="subpanel">
            <h3>{action.label}</h3>
            <p>{action.available ? action.preview : action.blocker}</p>
          </article>
        ))}
      </div>
      <div className="grid compact-grid">
        <section>
          <h4>Write intent</h4>
          <p>{correction.writeIntent.willWrite.join(" · ") || "No write from this state."}</p>
        </section>
        <section>
          <h4>Link intent</h4>
          <p>{correction.writeIntent.willLink.join(" · ") || "No link from this state."}</p>
        </section>
        <section>
          <h4>Queue intent</h4>
          <p>{correction.writeIntent.willQueue.join(" · ") || "No queue change from this state."}</p>
        </section>
        <section>
          <h4>Non-mutation guarantees</h4>
          <p>{correction.writeIntent.willLeaveUntouched.join(" · ") || "No mutation guarantee returned."}</p>
        </section>
      </div>
      <p>{correction.nextOrResumeState.nextStep}</p>
      <p className="meta">{correction.nextOrResumeState.safeExit}</p>
    </section>
  );
}

export function PropagationPacketContextPanel({ context }: { context: PropagationPacketContextPreview }) {
  return (
    <section className="subpanel propagation-packet-context" data-server-owned-propagation-packet-context="true">
      <h4>Server-owned Propagation packet context</h4>
      <p>{context.mode === "proposal" ? "Foundational Proposal supports candidate domain pressure." : "Related-world Pressure challenges steward-authored material."}</p>
      <p className="meta">Decision point: {context.decisionPoint}</p>
      <strong>Governing package sources</strong>
      {context.packageSources.map((source) => <p key={source}>{source}</p>)}
      <section className="doctrine">
        <strong>{context.atlas.required ? "Foundational atlas doctrine" : "Severity-proportionate atlas doctrine"}</strong>
        <span>{context.atlas.severityReason}</span>
        <span>{context.atlas.triage}</span>
      </section>
      {context.atlas.domains.map((domain, index) => (
        <article className="packet-domain-context" key={domain.name}>
          <strong>{index + 1}. {domain.name}</strong>
          <p>{domain.decisionPrompt}</p>
        </article>
      ))}
      <section className="doctrine">
        <strong>Related-world bounds</strong>
        <span>{`${context.relatedWorld.aggregateBudget.toLocaleString("en-US")} Unicode characters aggregate · ${context.relatedWorld.perRecordCap.toLocaleString("en-US")} per record`}</span>
        <span>{`${context.relatedWorld.usedCharacters.toLocaleString("en-US")} related-world excerpt characters selected by the server`}</span>
      </section>
      {context.completeness.status === "incomplete" ? (
        <section className="warning" data-propagation-context-completeness="incomplete">
          <strong>Incomplete related-world context</strong>
          {context.completeness.failures.map((failure) => <p key={failure}>{failure}</p>)}
        </section>
      ) : null}
      {context.relatedWorld.selectedRecords.map((record) => (
        <article className="packet-related-record" key={record.sourceDocumentId}>
          <strong>{record.stableIdentity} · {record.title}</strong>
          <p>{`${record.recordType} · ${record.canonStatus}${record.nonCanon ? " · non-canon context" : ""} · ${record.truthLayer ?? "truth layer not present"}`}</p>
          <p>{`${record.relationship} · ${record.inclusionReason} · ${record.role}`}</p>
          <p className="meta">Source document: {record.sourceDocumentId}</p>
        </article>
      ))}
      <strong>Server source manifest</strong>
      {context.sourceManifest.map((item) => <p key={item}>{item}</p>)}
      <strong>Record-specific omissions</strong>
      {context.omissions.map((item) => <p key={item}>{item}</p>)}
      <p>{context.advisoryCanonWarning}</p>
      <p>{context.readOnlyGuarantee}</p>
    </section>
  );
}

interface PromptPreviewCurrentness {
  state: string;
  label: string;
  loadedMode: string | null;
  currentPacketActions: string;
  loadAction: string;
}

interface PromptPreviewPayload {
  currentDecision: string;
  promptText: string;
  contextPreview: string;
  sourceManifest: string[];
  omissions: string[];
  advisoryCanonWarning: string;
  currentness?: PromptPreviewCurrentness;
}

function PromptPacketPreview({
  title,
  roleLine,
  modes,
  preview,
  advisoryNote,
  action
}: {
  title: string;
  roleLine?: string;
  modes?: PromptOutMode[];
  preview?: PromptPreviewPayload | null;
  advisoryNote?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="subpanel prompt-packet-preview">
      <h3>{title}</h3>
      {roleLine && <p>{roleLine}</p>}
      {(modes ?? []).map((mode) => (
        <div className="doctrine" key={mode.mode}>
          <strong>{mode.label}</strong>
          <span>{mode.available ? "Available from server" : mode.blocker ?? "Blocked by server"}</span>
          <span>{mode.framing}</span>
          <span>Output labels: {mode.outputLabels.join(", ")}</span>
        </div>
      ))}
      <p>{preview?.currentDecision ?? "Prompt-out appears after server context is loaded."}</p>
      {preview?.currentness && (
        <div className="doctrine prompt-preview-currentness" data-prompt-preview-currentness={preview.currentness.state}>
          <strong>Packet status: {preview.currentness.label}</strong>
          <span>Loaded packet mode: {preview.currentness.loadedMode ?? "none"}</span>
          <span>Current packet actions: {preview.currentness.currentPacketActions}</span>
          <span>{preview.currentness.loadAction}</span>
        </div>
      )}
      <pre className="prompt-packet-preview-text" data-prompt-packet-preview="true">{preview?.promptText ?? "No prompt packet loaded yet."}</pre>
      <strong>Source manifest</strong>
      {(preview?.sourceManifest ?? ["No source manifest loaded yet."]).map((item) => <p key={item}>{item}</p>)}
      <strong>Context preview</strong>
      <p>{preview?.contextPreview ?? "No context preview loaded yet."}</p>
      <strong>Omissions</strong>
      {(preview?.omissions ?? ["No omissions loaded yet."]).map((item) => <p key={item}>{item}</p>)}
      <strong>Advisory/canon warning</strong>
      <p>{preview?.advisoryCanonWarning ?? "Pasted responses remain advisory artifacts and are not admitted canon."}</p>
      {advisoryNote && <p>{advisoryNote}</p>}
      {action}
    </section>
  );
}

const originNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const sameStringList = (left: string[] = [], right: string[] = []): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index]);

const admissionDraftIdentityFor = (input: {
  worldPath: string | null;
  recordId: number | null;
  recordShortId: string | null;
  currentStep: string | null;
  admissionLevel: string | null;
  workScale: string | null;
  sectionKeys: string[];
  draft?: unknown;
}): string => JSON.stringify(input);

const promptOriginsMatch = (left: LoadedPromptOrigin, right: LoadedPromptOrigin): boolean =>
  left.worldPath === right.worldPath
  && left.flowKey === right.flowKey
  && left.flowId === right.flowId
  && left.recordId === right.recordId
  && left.recordShortId === right.recordShortId
  && left.recordTypeKey === right.recordTypeKey
  && left.selectedSectionHeading === right.selectedSectionHeading
  && left.stepKey === right.stepKey
  && left.mode === right.mode
  && left.templateKey === right.templateKey
  && left.admissionLevel === right.admissionLevel
  && left.workScale === right.workScale
  && (left.activeSetRevision ?? null) === (right.activeSetRevision ?? null)
  && (left.admissionDraftState ?? "not_applicable") === (right.admissionDraftState ?? "not_applicable")
  && (left.admissionDraftHash ?? null) === (right.admissionDraftHash ?? null)
  && sameStringList(left.admissionSectionKeys ?? [], right.admissionSectionKeys ?? [])
  && (left.sourceManifestHash ?? null) === (right.sourceManifestHash ?? null);

const samePromptPacketOrigin = (left: LoadedPromptOrigin, right: LoadedPromptOrigin): boolean =>
  promptOriginsMatch(left, right)
  && left.createdAt === right.createdAt
  && left.packetHash === right.packetHash
  && (left.bodyHash ?? null) === (right.bodyHash ?? null);

const describePromptOrigin = (origin: LoadedPromptOrigin): string => [
  `world ${origin.worldPath}`,
  `flow ${origin.flowKey ?? "none"}`,
  `flow/run ${origin.flowId ?? "none"}`,
  `record ${origin.recordId ?? "none"}`,
  `record short id ${origin.recordShortId ?? "none"}`,
  `record type ${origin.recordTypeKey ?? "none"}`,
  `section ${origin.selectedSectionHeading ?? "none"}`,
  `step ${origin.stepKey}`,
  `mode ${origin.mode ?? "none"}`,
  `active set revision ${origin.activeSetRevision ?? "none"}`,
  `template ${origin.templateKey}`,
  `decision ${origin.decisionLabel}`,
  `created ${origin.createdAt}`,
  `packet ${origin.packetHash ?? "none"}`,
  `body ${origin.bodyHash ?? "none"}`,
  `source_manifest ${origin.sourceManifestHash ?? "none"}`,
  `admission_level ${origin.admissionLevel ?? "none"}`,
  `work_scale ${origin.workScale ?? "none"}`,
  `draft state ${origin.admissionDraftState ?? "not_applicable"}`,
  `admission draft ${origin.admissionDraftHash ?? "none"}`,
  `admission section keys ${origin.admissionSectionKeys?.length ? origin.admissionSectionKeys.join(",") : "none"}`
].join(" · ");

const promptPacketExportText = (origin: LoadedPromptOrigin, promptText: string): string => {
  if (origin.flowKey === "temporal_timeline") return promptText;
  return [
    "Prompt packet manifest",
    `world: ${origin.worldPath}`,
    `flow: ${origin.flowKey ?? "none"}`,
    `flow_id: ${origin.flowId ?? "none"}`,
    `record_id: ${origin.recordId ?? "none"}`,
    `record_short_id: ${origin.recordShortId ?? "none"}`,
    `record_type: ${origin.recordTypeKey ?? "none"}`,
    `section: ${origin.selectedSectionHeading ?? "none"}`,
    `step: ${origin.stepKey}`,
    `mode: ${origin.mode ?? "none"}`,
    `template: ${origin.templateKey}`,
    `decision: ${origin.decisionLabel}`,
    `generated_at: ${origin.createdAt || "unknown"}`,
    `packet_hash: ${origin.packetHash ?? "none"}`,
    `body_hash: ${origin.bodyHash ?? "none"}`,
    `source_manifest_hash: ${origin.sourceManifestHash ?? "none"}`,
    `admission_level: ${origin.admissionLevel ?? "none"}`,
    `work_scale: ${origin.workScale ?? "none"}`,
    `draft_state: ${origin.admissionDraftState ?? "not_applicable"}`,
    `draft_digest: ${origin.admissionDraftHash ?? "none"}`,
    `draft_sections: ${origin.admissionSectionKeys?.length ? origin.admissionSectionKeys.join(",") : "none"}`,
    "",
    "Prompt packet body",
    promptText
  ].join("\n");
};

function LoadedPromptStatusPanel({
  view,
  onClear,
  onReturn,
  actions
}: {
  view: LoadedPromptStatusView;
  onClear: () => void;
  onReturn: () => void;
  actions?: React.ReactNode;
}) {
  return (
    <section className={`subpanel loaded-prompt-status ${view.state}`} role="status" aria-live="polite">
      <h3>Loaded Prompt-out status</h3>
      {view.state === "current" ? (
        <p>Current origin: {describePromptOrigin(view.origin)}</p>
      ) : (
        <>
          <p>Stale prior decision origin: {describePromptOrigin(view.origin)}</p>
          <p>{view.staleReason}</p>
          <p>This prior loaded status is shown as stale, so it never implies a match with the active decision.</p>
        </>
      )}
      <div className="row">
        <button onClick={onClear}>Clear loaded status</button>
        {view.state === "stale" && <button onClick={onReturn}>Return to prior origin</button>}
      </div>
      {view.state === "current" && actions ? <div className="row prompt-packet-export-actions">{actions}</div> : null}
    </section>
  );
}

function PromptPacketBodyStatus({
  promptText,
  state,
  reason,
  origin
}: {
  promptText: string;
  state: "current" | "stale" | "unbound" | "incomplete" | "inconsistent";
  reason: string;
  origin: LoadedPromptOrigin | null;
}) {
  if (!promptText) return null;
  const packetTextClassName = state === "current"
    ? "prompt-packet-text current-prompt-packet-text"
    : state === "stale"
      ? "stale-prompt-packet-text"
      : state === "incomplete"
        ? "unbound-prompt-packet-text incomplete-prompt-packet-text"
        : state === "inconsistent"
          ? "unbound-prompt-packet-text inconsistent-prompt-packet-text"
      : "unbound-prompt-packet-text";
  const heading = state === "current"
    ? "Current prompt packet body"
    : state === "stale"
      ? "Stale prompt packet body"
      : state === "incomplete"
        ? "Incomplete prompt packet body"
        : state === "inconsistent"
          ? "Inconsistent prompt packet body"
          : "Unbound prompt packet body";
  return (
    <section
      className={`subpanel prompt-packet-body-status ${state}`}
      data-current-prompt-packet={state === "current" ? "true" : undefined}
      data-stale-prompt-packet={state === "stale" ? "true" : undefined}
      data-unbound-prompt-packet={state === "unbound" ? "true" : undefined}
      data-incomplete-prompt-packet={state === "incomplete" ? "true" : undefined}
      data-inconsistent-prompt-packet={state === "inconsistent" ? "true" : undefined}
      role="status"
      aria-live="polite"
    >
      <h3>{heading}</h3>
      <p>{reason}</p>
      {origin && <p>Prior packet origin: {describePromptOrigin(origin)}</p>}
      <pre className={packetTextClassName}>{promptText}</pre>
    </section>
  );
}

function DecisionContractPanel({ title, contract }: { title: string; contract?: DecisionPointSharedContract | null }) {
  const modes = contract?.promptOut.modes ?? [];
  const writeItems = contract
    ? [
        ...contract.writeIntent.willWrite,
        ...contract.writeIntent.willLink,
        ...contract.writeIntent.willQueue,
        ...contract.writeIntent.willRouteOnward,
        ...contract.writeIntent.willLeaveUntouched
      ]
    : ["Start or refresh this flow to load server-returned write intent."];
  return (
    <section className="subpanel decision-contract">
      <h3>{title}</h3>
      <div className="grid compact-grid">
        <section>
          <h4>Current decision</h4>
          <p>{contract?.step.localDecision ?? "Start or refresh this flow to load the current decision."}</p>
          <p className="meta">{contract ? `${contract.flow.key} · ${contract.flow.runState} · ${contract.nextOrResumeState.currentStep}` : "No server contract loaded."}</p>
        </section>
        <section>
          <h4>Prompt modes</h4>
          {modes.length ? (
            <ul>{modes.map((mode) => <li key={mode.mode}>{mode.label}: {mode.availability}{mode.blocker ? ` - ${mode.blocker}` : ""}</li>)}</ul>
          ) : (
            <p>Proposal and pressure mode availability loads from the server contract.</p>
          )}
        </section>
        <section>
          <h4>Decision obligations</h4>
          {contract ? (
            <>
              <p>Required: {contract.obligations.required.join(" · ") || "none"}</p>
              <p>Optional: {contract.obligations.optional.join(" · ") || "none"}</p>
              <p>Skippable: {contract.obligations.skippable.join(" · ") || "none"}</p>
              <p>Severity-dependent: {contract.obligations.severityDependent.join(" · ") || "none"}</p>
            </>
          ) : <p>Required, optional, skippable, and severity-dependent work loads from the server contract.</p>}
        </section>
        <section>
          <h4>Write intent</h4>
          <ul>{writeItems.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
        <section>
          <h4>Next/resume</h4>
          <p>{contract?.nextOrResumeState.nextStep ?? "Start or refresh this flow to load the next step."}</p>
          <p className="meta">{contract?.nextOrResumeState.safeExit ?? "Safe exit and resume policy is server-owned."}</p>
        </section>
        <section>
          <h4>Close blockers</h4>
          {contract && contract.blockers.length === 0 ? (
            <p>No server-returned blockers.</p>
          ) : (
            <ul>{(contract?.blockers ?? [{ key: "not-loaded", message: "Start or refresh this flow to load exact server blockers." }]).map((blocker) => <li key={`${blocker.consequenceId ?? "run"}:${blocker.key}`}>{blocker.label ? `${blocker.label}: ` : ""}{blocker.message}</li>)}</ul>
          )}
        </section>
        <section>
          <h4>Prompt preview with source manifest</h4>
          <p>{contract?.bearingContext.displayed[0] ?? "Source context loads from the server contract."}</p>
          <p className="meta">{contract?.bearingContext.sourceManifest.join(" · ") || "No source manifest loaded yet."}</p>
        </section>
      </div>
    </section>
  );
}

const defaultCreationSection = (
  heading: string,
  prompt: string,
  obligation: "required" | "optional" | "allowed-empty"
): CreationDecisionPoint["sectionPrompts"][number] => ({
  heading,
  prompt,
  obligation,
  savedBody: "",
  hasSavedBody: false,
  emptyState: {
    kind: "no_saved_section_text",
    message: `No saved text exists yet for ${heading}; the field should start empty for this section.`
  },
  saveTarget: {
    flowId: 0,
    heading
  }
});

const kernelSectionDraftKeyFor = (recordId: number | null, heading: string) => `${recordId ?? "pending-kernel"}::${heading}`;

const defaultCreationCoverageInventory: CreationCoverageInventory = {
  kernel: null,
  state: {
    status: "missing_inventory",
    completionBlocked: true,
    summary: "Creation seed-family coverage inventory loads after seed decomposition.",
    blockers: []
  },
  createOrConfirmPath: null,
  rows: []
};

const defaultCreationDecision: CreationDecisionPoint = {
  flow: {
    key: "creation",
    runState: "not started"
  },
  currentStep: "kernel:World premise",
  localDecision: "Define the world's first governing kernel or pressure seed.",
  packageAuthority: {
    primary: "Server-returned method-card provenance loads after the Creation flow starts.",
    why: "The app shows the current decision and waits for server-owned method-card guidance before treating doctrine as loaded.",
    citations: []
  },
  currentKernel: null,
  sectionPrompts: [
    defaultCreationSection("World premise", "What is the world, in one or two sentences?", "required"),
    defaultCreationSection("Core promise", "What experience should the world reliably create?", "allowed-empty"),
    defaultCreationSection("Starting scale", "Name where the world starts.", "required"),
    defaultCreationSection("Genre, tone, and consequence-mode commitments", "Name consequence mode explicitly.", "required"),
    defaultCreationSection("Initial mysteries and protected effects", "Name protected unknowns if they exist.", "allowed-empty")
  ],
  selectedSection: defaultCreationSection("World premise", "What is the world, in one or two sentences?", "required"),
  consequenceMode: {
    saved: null,
    status: "missing_saved_facet",
    source: "record facet: consequence_mode",
    blocker: "Save the kernel step with an explicit steward-selected consequence mode before decomposition can treat it as applied."
  },
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
  decompositionReadiness: [
    {
      key: "consequence_mode",
      label: "Consequence mode",
      status: "blocked",
      message: "Seed decomposition is blocked until the steward explicitly selects consequence mode.",
      remediation: "Select consequence mode in kernel authoring; the app must not infer it from prose."
    },
    {
      key: "seed_title",
      label: "Seed title",
      status: "blocked",
      message: "Seed parking is blocked until the steward enters a seed title.",
      remediation: "Enter the smallest precise seed title before parking."
    },
    {
      key: "seed_body",
      label: "Seed body",
      status: "blocked",
      message: "Seed parking is blocked until the steward enters seed body material.",
      remediation: "Enter the seed body in steward-authored wording."
    },
    {
      key: "truth_layer",
      label: "Truth layer",
      status: "blocked",
      message: "Seed parking is blocked until the steward chooses a truth layer.",
      remediation: "Choose the seed truth layer as steward judgment; the app must not infer it from prose."
    },
    {
      key: "granularity_confirmation",
      label: "Granularity confirmation",
      status: "blocked",
      message: "Seed parking is blocked until the steward supplies granularity rationale or confirms the seed can stand independently.",
      remediation: "Add granularity rationale or check the confirmation after applying the Phase 2 granularity rule."
    }
  ],
  coverageInventory: defaultCreationCoverageInventory,
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
        "Server-returned source manifest loads after Creation starts."
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

const creationPromptOutStepRequest = (
  request: PromptOutMode["stepRequest"] | CreationPromptOutStepRequest | null | undefined
): CreationPromptOutStepRequest | null => {
  if (!request) return null;
  const body = request.body;
  if (
    body.flowKey !== "creation"
    || typeof body.flowId !== "number"
    || typeof body.recordId !== "number"
    || typeof body.templateKey !== "string"
    || typeof body.stepKey !== "string"
    || typeof body.label !== "string"
  ) return null;
  return request as CreationPromptOutStepRequest;
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

const emptyTemporalCoverage: TemporalCoverage = {
  temporalQuestions: "",
  firstTrueOrRelativeSequence: "",
  firstKnownOrReason: "",
  dateTypesAndGranularity: "",
  latency: "",
  residueByTimescale: "",
  sequenceIntegrity: "",
  retrospectiveInsertion: "",
  temporalMysteryBoundaries: "",
  outcomeDecision: ""
};

const parseNumberList = (value: string): number[] =>
  value
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));

const parseTextList = (value: string): string[] =>
  value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

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
  initialCreationDecision = null,
  initialMinimalViableWorld = null,
  initialPropagationQueue = [],
  initialPropagationRun = null,
  initialTemporalRun = null,
  initialQaScorecard = null,
  initialLoadedPromptStatus = null,
  initialPromptText = "",
  initialPromptPacketOrigin = null,
  initialCreationPromptMode = "proposal"
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
  const [decompositionError, setDecompositionError] = useState<string | null>(null);
  const [correctionDrafts, setCorrectionDrafts] = useState<Record<number, CreationCorrectionDraft>>({});
  const [correctionError, setCorrectionError] = useState<Record<number, string[]>>({});
  const [coverageBootstrapRows, setCoverageBootstrapRows] = useState<CreationCoverageBootstrapRowDraft[]>([
    emptyCreationCoverageBootstrapRow()
  ]);
  const [coverageBootstrapError, setCoverageBootstrapError] = useState<string | null>(null);
  const [coverageDrafts, setCoverageDrafts] = useState<Record<number, CreationCoverageDraft>>({});
  const [minimalViableWorld, setMinimalViableWorld] = useState<MinimalViableWorldState | null>(initialMinimalViableWorld);
  const [canonDebt, setCanonDebt] = useState<RecordRow[]>([]);
  const [propagationQueue, setPropagationQueue] = useState<PropagationQueueRow[]>(initialPropagationQueue);
  const [propagationRun, setPropagationRun] = useState<PropagationRunPayload | null>(initialPropagationRun);
  const [propagationPlan, setPropagationPlan] = useState<PropagationPlan | null>(initialPropagationRun?.plan ?? null);
  const [propagationDecisionPoint, setPropagationDecisionPoint] = useState<DecisionPointEnvelope | null>(initialPropagationRun?.decisionPoint ?? initialPropagationRun?.plan.decisionPoint ?? null);
  const [propagationConsequences, setPropagationConsequences] = useState<PropagationConsequence[]>(initialPropagationRun?.consequences ?? []);
  const [propagationDomains, setPropagationDomains] = useState<PropagationDomain[]>(initialPropagationRun?.domainSweeps ?? []);
  const [propagationDispositions, setPropagationDispositions] = useState<PropagationDisposition[]>(initialPropagationRun?.dispositions ?? []);
  const [propagationRevisionErrors, setPropagationRevisionErrors] = useState<Record<string, string>>({});
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
  const [temporalRun, setTemporalRun] = useState<TemporalRun | null>(initialTemporalRun);
  const [temporalFlowId, setTemporalFlowId] = useState<number | null>(initialTemporalRun?.flow.id ?? null);
  const [temporalSourceType, setTemporalSourceType] = useState<"fact" | "capability" | "canon_debt" | "material" | "pass_report">("fact");
  const [temporalSourceRecordId, setTemporalSourceRecordId] = useState(initialTemporalRun?.source.sourceRecordId == null ? "" : String(initialTemporalRun.source.sourceRecordId));
  const [temporalMaterialTitle, setTemporalMaterialTitle] = useState("");
  const [temporalMaterialBody, setTemporalMaterialBody] = useState("");
  const [temporalSubject, setTemporalSubject] = useState(initialTemporalRun?.source.auditedSubject ?? "");
  const [temporalCoverage, setTemporalCoverage] = useState<TemporalCoverage>(initialTemporalRun?.coverage ?? emptyTemporalCoverage);
  const [temporalFinalizationPreview, setTemporalFinalizationPreview] = useState<TemporalFinalizationPreview | null>(initialTemporalRun?.closePreview ?? null);
  const [temporalExistingCardId, setTemporalExistingCardId] = useState("");
  const [temporalCardRelation, setTemporalCardRelation] = useState("");
  const [temporalSourceStep, setTemporalSourceStep] = useState("temporal:outcome");
  const [temporalAdvisoryRecordId, setTemporalAdvisoryRecordId] = useState("");
  const [temporalSkipStep, setTemporalSkipStep] = useState("temporal:spatial-temporal-analysis");
  const [temporalSkipReason, setTemporalSkipReason] = useState("");
  const [temporalSkipUnresolved, setTemporalSkipUnresolved] = useState(false);
  const [temporalPromptMode, setTemporalPromptMode] = useState<"proposal" | "pressure">("proposal");
  const [temporalPacketContext, setTemporalPacketContext] = useState<TemporalPacketContextView | null>(null);
  const [temporalPromptError, setTemporalPromptError] = useState<TemporalPromptError | null>(null);
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
  const [qaScorecard, setQaScorecard] = useState<QaScorecard | null>(initialQaScorecard);
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
  const [creationPromptMode, setCreationPromptMode] = useState<"proposal" | "pressure">(initialCreationPromptMode);
  const [admissionPromptMode, setAdmissionPromptMode] = useState<"proposal" | "pressure">("proposal");
  const [promptStep, setPromptStep] = useState<PromptOutStep | null>(null);
  const [promptText, setPromptText] = useState(initialPromptText);
  const [propagationPacketContext, setPropagationPacketContext] = useState<PropagationPacketContextPreview | null>(null);
  const [promptPacketOrigin, setPromptPacketOrigin] = useState<LoadedPromptOrigin | null>(initialPromptPacketOrigin);
  const [loadedPromptStatus, setLoadedPromptStatus] = useState<LoadedPromptStatusState | null>(initialLoadedPromptStatus);
  const [templateEdit, setTemplateEdit] = useState("");
  const [responseText, setResponseText] = useState("");
  const [disposition, setDisposition] = useState("standing ruling");
  const [flowId, setFlowId] = useState<number | null>(null);
  const [kernelRecordId, setKernelRecordId] = useState<number | null>(null);
  const [kernelHeading, setKernelHeading] = useState("World premise");
  const [kernelBody, setKernelBody] = useState("");
  const [kernelSectionDrafts, setKernelSectionDrafts] = useState<Record<string, string>>({});
  const [consequenceMode, setConsequenceMode] = useState("");
  const [creationStartPending, setCreationStartPending] = useState(false);
  const [creationStartError, setCreationStartError] = useState<string | null>(null);
  const [creationAutoStartAttempted, setCreationAutoStartAttempted] = useState(false);
  const [seedTitle, setSeedTitle] = useState("");
  const [seedBody, setSeedBody] = useState("");
  const [seedTruthLayer, setSeedTruthLayer] = useState("");
  const [granularityRationale, setGranularityRationale] = useState("");
  const [granularityConfirmed, setGranularityConfirmed] = useState(false);
  const [minimalSeedRecordId, setMinimalSeedRecordId] = useState("");
  const [minimalDimensionKey, setMinimalDimensionKey] = useState("");
  const [minimalDisposition, setMinimalDisposition] = useState<"covered" | "deferred" | "protected_mystery">("covered");
  const [minimalDispositionSubstance, setMinimalDispositionSubstance] = useState("");
  const [minimalEvidenceRecordIds, setMinimalEvidenceRecordIds] = useState("");
  const [minimalProtectedRecordId, setMinimalProtectedRecordId] = useState("");
  const [minimalDeferralKind, setMinimalDeferralKind] = useState<"none" | "skip" | "canon_debt">("none");
  const [minimalDeferralStep, setMinimalDeferralStep] = useState("minimal_viable_world:coverage_review");
  const [minimalDebtName, setMinimalDebtName] = useState("");
  const [minimalProposalSeedRecordId, setMinimalProposalSeedRecordId] = useState("");
  const [minimalProposalTitle, setMinimalProposalTitle] = useState("");
  const [minimalProposalBody, setMinimalProposalBody] = useState("");
  const [minimalProposalTruthLayer, setMinimalProposalTruthLayer] = useState("Objective canon");
  const [admissionIntent, setAdmissionIntent] = useState("");
  const [admissionRecordId, setAdmissionRecordId] = useState("");
  const [admissionLevel, setAdmissionLevel] = useState("");
  const [workScale, setWorkScale] = useState("");
  const [admissionOperation, setAdmissionOperation] = useState("accept");
  const [gateConsequence, setGateConsequence] = useState("");
  const [gateQuietDomain, setGateQuietDomain] = useState("");
  const [gateNotApplicable, setGateNotApplicable] = useState("");
  const [gateSectionSubstance, setGateSectionSubstance] = useState<Record<string, string>>({});
  const [gateSectionNotApplicableReasons, setGateSectionNotApplicableReasons] = useState<Record<string, string>>({});
  const [gateSectionQuietDeclarations, setGateSectionQuietDeclarations] = useState<Record<string, string>>({});
  const [gateCanonStatus, setGateCanonStatus] = useState("");
  const [gateConstraintTags, setGateConstraintTags] = useState("");
  const [gateFollowUpDebt, setGateFollowUpDebt] = useState("");
  const [gateAdvisoryRecordId, setGateAdvisoryRecordId] = useState("");
  const [admissionValidationErrors, setAdmissionValidationErrors] = useState<AdmissionValidationError[]>([]);
  const [gateDraftIdentity, setGateDraftIdentity] = useState("");
  const [gateFinalReview, setGateFinalReview] = useState<AdmissionFullGateReview | null>(null);
  const [admissionCompletionReadback, setAdmissionCompletionReadback] = useState<AdmissionCompletionReadback | null>(null);
  const [canonDebtName, setCanonDebtName] = useState("");
  const [seedAuditFindings, setSeedAuditFindings] = useState("");
  const [propagationFactId, setPropagationFactId] = useState(initialPropagationRun ? String(initialPropagationRun.flow.propagation_fact_record_id) : "");
  const [propagationDebtId, setPropagationDebtId] = useState(initialPropagationRun?.flow.propagation_debt_record_id != null ? String(initialPropagationRun.flow.propagation_debt_record_id) : "");
  const [propagationFlowId, setPropagationFlowId] = useState<number | null>(initialPropagationRun?.flow.id ?? null);
  const [propagationOrderKey, setPropagationOrderKey] = useState("first");
  const [propagationDomainName, setPropagationDomainName] = useState("");
  const [propagationTriage, setPropagationTriage] = useState<"direct" | "dependency" | "reaction" | "negative">("direct");
  const [propagationText, setPropagationText] = useState("");
  const [propagationPressure, setPropagationPressure] = useState<"normal" | "high">("normal");
  const [propagationDispositionTerm, setPropagationDispositionTerm] = useState("answered");
  const [propagationConsequenceId, setPropagationConsequenceId] = useState("");
  const [propagationDispositionNote, setPropagationDispositionNote] = useState("");
  const [propagationDebtName, setPropagationDebtName] = useState("");
  const [propagationPreservationBoundary, setPropagationPreservationBoundary] = useState("");
  const [propagationPromptMode, setPropagationPromptMode] = useState<"proposal" | "pressure">("proposal");
  const [propagationPressureSkipReason, setPropagationPressureSkipReason] = useState("");
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
  const activeFullGateContract = admissionDecision?.severity.gatePath === "full_gate" ? admissionDecision.fullGateContract ?? null : null;
  const selectedGateAdvisoryArtifact = activeFullGateContract?.advisoryArtifacts.find((artifact) => String(artifact.id) === gateAdvisoryRecordId) ?? null;
  const gateAdvisoryUsePreview = gateAdvisoryRecordId
    ? `Selected advisory-use link: ${selectedGateAdvisoryArtifact ? `${selectedGateAdvisoryArtifact.shortId} ${selectedGateAdvisoryArtifact.title}` : `record ${gateAdvisoryRecordId}`}`
    : "Selected advisory-use link: none";
  const fullGateValidationErrors = [
    ...(activeFullGateContract?.validationErrors ?? []),
    ...admissionValidationErrors
  ];
  const activeFullGateSectionKeys = activeFullGateContract?.sections.map((section) => section.key) ?? [];
  const acceptedGateStatementDraft = activeFullGateContract ? (gateSectionSubstance.fact_statement ?? "").trim() : "";
  const originalProposalText = selectedAdmissionRecord?.body || admissionDecision?.selectedRecord.body || "";
  const intendedCurrentLivingText = recordForm.body.trim()
    || acceptedGateStatementDraft
    || originalProposalText;
  const currentLivingTextDiffersFromAccepted = Boolean(acceptedGateStatementDraft && intendedCurrentLivingText !== acceptedGateStatementDraft);
  const admissionDraftIdentity = activeFullGateContract && admissionDecision
    ? admissionDraftIdentityFor({
      worldPath: openWorld,
      recordId: admissionDecision.selectedRecord.id,
      recordShortId: admissionDecision.selectedRecord.shortId,
      currentStep: admissionDecision.currentStep,
      admissionLevel: admissionDecision.severity.admissionLevel,
      workScale: admissionDecision.severity.workScale,
      sectionKeys: activeFullGateSectionKeys,
      draft: {
        title: recordForm.title || selectedAdmissionRecord?.title || admissionDecision.selectedRecord.title,
        body: intendedCurrentLivingText,
        truthLayer: recordForm.truthLayer || selectedAdmissionRecord?.truthLayer || admissionDecision.selectedRecord.truthLayer || "Objective canon",
        canonStatus: gateCanonStatus || recordForm.canonStatus || selectedAdmissionRecord?.canonStatus || "accepted",
        constraintTags: gateConstraintTags,
        operation: admissionOperation,
        consequence: gateConsequence,
        sections: activeFullGateContract.sections.map((section) => ({
          key: section.key,
          substance: gateSectionSubstance[section.key] ?? "",
          notApplicableReason: gateSectionNotApplicableReasons[section.key] ?? "",
          quietDomainDeclaration: gateSectionQuietDeclarations[section.key] ?? ""
        })),
        notApplicable: gateNotApplicable,
        quietDomain: gateQuietDomain,
        followUpDebt: gateFollowUpDebt,
        advisoryRecordId: gateAdvisoryRecordId
      }
    })
    : "";
  const gateFinalReviewIsCurrent = Boolean(activeFullGateContract && gateFinalReview?.identity === admissionDraftIdentity);

  const buildAdmissionGateCompletionPayload = (canonStatusOverride?: string): AdmissionGateCompletionPayload => ({
    recordId: Number(admissionRecordId || admissionDecision?.selectedRecord.id || 0),
    title: recordForm.title || selectedAdmissionRecord?.title || admissionDecision?.selectedRecord.title || "",
    body: intendedCurrentLivingText,
    truthLayer: recordForm.truthLayer || selectedAdmissionRecord?.truthLayer || admissionDecision?.selectedRecord.truthLayer || "Objective canon",
    canonStatus: canonStatusOverride || gateCanonStatus || recordForm.canonStatus || selectedAdmissionRecord?.canonStatus || "accepted",
    constraintTags: gateConstraintTags ? parseTextList(gateConstraintTags) : admissionDecision?.selectedRecord.constraintTags ?? [],
    operations: [admissionOperation].filter(Boolean),
    consequenceText: gateConsequence,
    sections: activeFullGateContract?.sections.map((section) => ({
      key: section.key,
      substance: gateSectionSubstance[section.key] ?? "",
      ...(gateSectionNotApplicableReasons[section.key] == null ? {} : { notApplicableReason: gateSectionNotApplicableReasons[section.key] }),
      ...(gateSectionQuietDeclarations[section.key] == null ? {} : { quietDomainDeclaration: gateSectionQuietDeclarations[section.key] })
    })) ?? [],
    notApplicableReasons: gateNotApplicable ? [gateNotApplicable] : [],
    quietDomainDeclarations: gateQuietDomain ? [gateQuietDomain] : [],
    ...(gateFollowUpDebt ? { followUpDebt: gateFollowUpDebt } : {}),
    ...(optionalNumber(gateAdvisoryRecordId) == null ? {} : { advisoryRecordId: optionalNumber(gateAdvisoryRecordId)! })
  });

  const buildAdmissionFullGateDraftPayload = (): AdmissionFullGateDraftPayload | null => {
    if (!activeFullGateContract) return null;
    const completionPayload = buildAdmissionGateCompletionPayload();
    return {
      saved: false,
      draftHash: admissionDraftIdentity,
      sectionKeys: activeFullGateSectionKeys,
      sections: activeFullGateContract.sections.map((section) => ({
        key: section.key,
        label: section.label,
        substance: gateSectionSubstance[section.key] ?? "",
        ...(gateSectionNotApplicableReasons[section.key] == null ? {} : { notApplicableReason: gateSectionNotApplicableReasons[section.key] }),
        ...(gateSectionQuietDeclarations[section.key] == null ? {} : { quietDomainDeclaration: gateSectionQuietDeclarations[section.key] })
      })),
      consequenceText: completionPayload.consequenceText,
      operations: completionPayload.operations,
      targetCanonStatus: completionPayload.canonStatus,
      constraintTags: completionPayload.constraintTags,
      ...(completionPayload.followUpDebt ? { followUpDebt: completionPayload.followUpDebt } : {}),
      ...(completionPayload.advisoryRecordId == null ? {} : { advisoryRecordId: completionPayload.advisoryRecordId })
    };
  };

  const buildAdmissionFullGateReview = (): AdmissionFullGateReview | null => activeFullGateContract
    ? {
      identity: admissionDraftIdentity,
      reviewedAt: new Date().toISOString(),
      payload: buildAdmissionGateCompletionPayload()
    }
    : null;
  const displayedCreationDecision = creationDecision ?? defaultCreationDecision;
  const creationDecisionHandoff = creationDecision ? creationDecision.handoff : displayedCreationDecision.handoff;
  const creationHandoffReady = displayedCreationDecision.handoff.parkedSeeds.length > 0;
  const displayedCreationCoverage = displayedCreationDecision.coverageInventory ?? defaultCreationCoverageInventory;
  const creationCoverageBlocked = displayedCreationCoverage.state.completionBlocked;
  const creationPromptModes = displayedCreationDecision.promptOut.modes ?? [];
  const selectedSectionContract = displayedCreationDecision.sectionPrompts.find((section) => section.heading === kernelHeading)
    ?? displayedCreationDecision.selectedSection
    ?? displayedCreationDecision.sectionPrompts[0]
    ?? null;
  const kernelDraftRecordId = kernelRecordId ?? displayedCreationDecision.currentKernel?.id ?? null;
  const kernelSectionDraftKey = kernelSectionDraftKeyFor(kernelDraftRecordId, kernelHeading);
  const selectedSectionDraft = kernelSectionDrafts[kernelSectionDraftKey];
  const selectedSectionSavedBody = selectedSectionContract?.savedBody ?? "";
  const selectedSectionHasHeldDraft = selectedSectionDraft !== undefined && selectedSectionDraft !== selectedSectionSavedBody;
  const savedConsequenceMode = displayedCreationDecision.consequenceMode?.saved ?? "";
  const consequenceModeDraftState = consequenceMode && consequenceMode !== savedConsequenceMode
    ? "unsaved"
    : savedConsequenceMode
      ? "saved"
      : "missing";
  const creationAuthoringDisabled = flowId == null || creationStartPending;
  const displayedDecompositionReadiness = (displayedCreationDecision.decompositionReadiness ?? defaultCreationDecision.decompositionReadiness).map((item) => {
    if (item.key !== "consequence_mode" || consequenceModeDraftState !== "unsaved") return item;
    return {
      ...item,
      status: "blocked" as const,
      message: "Selected consequence mode is an unsaved draft; save the kernel step before decomposition can use it.",
      remediation: "Save the kernel step to apply the selected consequence mode as server-owned world-file truth."
    };
  });
  const decomposeDisabled = flowId == null || kernelRecordId == null || consequenceModeDraftState === "unsaved";
  const selectedCreationPromptMode = creationPromptModes.find((mode) => mode.mode === creationPromptMode)
    ?? creationPromptModes[0]
    ?? null;
  const creationKernelPromptTargeting = displayedCreationDecision.currentStep.startsWith("kernel:");
  const creationLocalSectionDiffers = creationKernelPromptTargeting
    && (displayedCreationDecision.selectedSection?.heading !== kernelHeading || selectedSectionHasHeldDraft);
  const creationAnyPromptRequest = creationPromptModes
    .map((mode) => creationPromptOutStepRequest(mode.stepRequest))
    .find((request): request is CreationPromptOutStepRequest => Boolean(request))
    ?? null;
  const creationPromptBaseRequest = creationPromptOutStepRequest(selectedCreationPromptMode?.stepRequest)
    ?? displayedCreationDecision.promptOut.stepRequest
    ?? creationAnyPromptRequest;
  const creationLocalProposalRequest = creationKernelPromptTargeting
    && creationPromptMode === "proposal"
    && kernelHeading !== "World premise"
    && creationPromptBaseRequest
    ? {
        ...creationPromptBaseRequest,
        body: {
          ...creationPromptBaseRequest.body,
          mode: "proposal",
          label: "Proposal mode",
          selectedSectionHeading: kernelHeading
        }
      }
    : null;
  const creationSelectedSectionHasSavedMaterial = Boolean(selectedSectionContract?.hasSavedBody && selectedSectionContract.savedBody.trim());
  const creationLocalPressureRequest = creationKernelPromptTargeting
    && creationPromptMode === "pressure"
    && creationSelectedSectionHasSavedMaterial
    && creationPromptBaseRequest
    ? {
        ...creationPromptBaseRequest,
        body: {
          ...creationPromptBaseRequest.body,
          mode: "pressure",
          label: displayedCreationDecision.promptOut.role || "Pressure mode",
          selectedSectionHeading: kernelHeading
        }
      }
    : null;
  const creationLocalPromptRequest = creationLocalProposalRequest ?? creationLocalPressureRequest;
  const serverCreationPromptRequest = selectedCreationPromptMode?.available && selectedCreationPromptMode.stepRequest
    ? creationPromptOutStepRequest(selectedCreationPromptMode.stepRequest)
    : selectedCreationPromptMode == null
      ? displayedCreationDecision.promptOut.stepRequest
      : null;
  const creationPromptStepRequest = creationLocalPromptRequest ?? (serverCreationPromptRequest
    ? {
        ...serverCreationPromptRequest,
        body: {
          ...serverCreationPromptRequest.body,
          ...(creationKernelPromptTargeting ? { selectedSectionHeading: kernelHeading } : {})
        }
      }
    : null);
  const creationPromptRecordId = originNumber(creationPromptStepRequest?.body.recordId) ?? null;
  const creationPromptRecord = creationPromptRecordId != null && displayedCreationDecision.handoff.seedDecompositionReport?.id === creationPromptRecordId
    ? displayedCreationDecision.handoff.seedDecompositionReport
    : creationPromptRecordId != null && displayedCreationDecision.currentKernel?.id === creationPromptRecordId
      ? { ...displayedCreationDecision.currentKernel, recordTypeKey: "world_kernel" }
      : null;
  const creationPromptOutBlockedByLocalSection = creationLocalSectionDiffers
    && !creationLocalPromptRequest;
  const creationPressureLocalSectionMessage = `Pressure Prompt-out waits for the selected section to be saved with steward-authored material before it can use ${kernelHeading}.`;
  const creationPromptOutLocalSectionMessage = creationPromptMode === "proposal" && kernelHeading === "World premise"
    ? "Proposal prompts are refused for the world's essence; the AI-assisted workflow reserves the World premise to the steward."
    : creationPressureLocalSectionMessage;
  const creationSelectedPromptModeLabel = creationPromptMode === "pressure" ? "Pressure mode" : "Proposal mode";
  const creationPromptModesForDisplay = creationPromptModes.map((mode) => {
    if (!creationLocalSectionDiffers) return mode;
    if (mode.mode === "proposal" && creationLocalProposalRequest) {
      return {
        ...mode,
        available: true,
        availability: "available" as const,
        blocker: null
      };
    }
    if (mode.mode === "proposal" && kernelHeading === "World premise") {
      return {
        ...mode,
        available: false,
        availability: "blocked" as const,
        blocker: "Proposal prompts are refused for the world's essence; the AI-assisted workflow reserves the World premise to the steward."
      };
    }
    if (mode.mode === "pressure" && creationLocalPressureRequest) {
      return {
        ...mode,
        available: true,
        availability: "available" as const,
        blocker: null,
        stepRequest: creationLocalPressureRequest
      };
    }
    if (mode.mode === "pressure") {
      return {
        ...mode,
        available: false,
        availability: "blocked" as const,
        blocker: creationPressureLocalSectionMessage
      };
    }
    return mode;
  });
  const creationPromptModeStatus = creationPromptOutBlockedByLocalSection
    ? `Selected mode: ${creationSelectedPromptModeLabel} - ${creationPromptOutLocalSectionMessage}`
    : creationLocalProposalRequest
      ? `Selected mode: Proposal mode - available for selected ${kernelHeading} via explicit target heading.`
      : creationLocalPressureRequest
        ? `Selected mode: Pressure mode - available for selected ${kernelHeading} via explicit target heading.`
      : selectedCreationPromptMode
        ? `Selected mode: ${selectedCreationPromptMode.label} - ${selectedCreationPromptMode.available ? "available" : selectedCreationPromptMode.blocker ?? "blocked"}`
        : "Selected mode: loads from the server packet.";
  const canLoadCreationPromptStep = Boolean(openWorld && creationPromptStepRequest && !creationPromptOutBlockedByLocalSection);
  const creationPromptCurrentDecision = (creationLocalPromptRequest || creationPromptOutBlockedByLocalSection) && selectedSectionContract
    ? `Define the world's first governing kernel section: ${kernelHeading}.`
    : displayedCreationDecision.promptOut.preview.currentDecision || displayedCreationDecision.localDecision;
  const loadedCreationPromptMode = promptStep?.context.flowKey === "creation" && promptStep.context.stepKey === displayedCreationDecision.promptOut.stepKey
    ? promptStep.mode ?? null
    : null;
  const creationPromptOutRoleLine = `${displayedCreationDecision.promptOut.role} · ${creationPromptOutBlockedByLocalSection
    ? "blocked"
    : displayedCreationDecision.promptOut.available
      ? "available"
      : "blocked"}`;
  const admissionPromptModes = admissionDecision?.promptOut.modes ?? [];
  const selectedAdmissionPromptMode = admissionPromptModes.find((mode) => mode.mode === admissionPromptMode)
    ?? admissionPromptModes[0]
    ?? null;
  const admissionPromptStepRequest = selectedAdmissionPromptMode?.stepRequest ?? admissionDecision?.promptOut.stepRequest ?? null;
  const canLoadAdmissionPromptStep = Boolean(openWorld && admissionDecision && admissionPromptStepRequest && selectedAdmissionPromptMode?.availability !== "blocked");
  const admissionPromptModeStatus = selectedAdmissionPromptMode
    ? `Selected mode: ${selectedAdmissionPromptMode.label} - ${selectedAdmissionPromptMode.available ? "available" : selectedAdmissionPromptMode.blocker ?? "blocked"}`
    : "Selected mode: loads from the server packet.";
  const loadedAdmissionPromptMode = promptStep?.context.flowKey === "admission" && promptStep.context.stepKey === admissionDecision?.promptOut.stepKey
    ? promptStep.mode ?? null
    : null;
  const minimalSeedOptions = minimalViableWorld?.checkpoint.coverageSignals.admittedSeeds ?? [];
  const minimalDimensionOptions = minimalSeedOptions[0]?.dimensions ?? [];
  const displayedMinimalDecision = minimalViableWorld?.decisionPoint.sharedContract;
  const relatedAuditItems = useMemo(() => selectedCanonRecordId == null
    ? []
    : canonAuditTrail.filter((item) => item.affectedCurrentRecords.some((record) => record.id === selectedCanonRecordId)),
  [canonAuditTrail, selectedCanonRecordId]);
  const displayedPropagationContract = (propagationDecisionPoint ?? propagationPlan?.decisionPoint)?.sharedContract ?? null;
  const propagationPromptModes = displayedPropagationContract?.promptOut.modes ?? [];
  const selectedPropagationPromptMode = propagationPromptModes.find((mode) => mode.mode === propagationPromptMode)
    ?? propagationPromptModes[0]
    ?? null;
  const propagationPromptStepRequest = selectedPropagationPromptMode?.stepRequest ?? null;
  const canLoadPropagationPromptStep = Boolean(openWorld && propagationPromptStepRequest && selectedPropagationPromptMode?.availability !== "blocked");
  const temporalPromptModes = (temporalRun?.decisionPoint?.sharedContract.promptOut.modes ?? []) as TemporalPromptModeOffer[];
  const selectedTemporalPromptMode = temporalPromptModes.find((mode) => mode.mode === temporalPromptMode) ?? null;
  const temporalPromptStepRequest = selectedTemporalPromptMode?.stepRequest ?? null;
  const currentLoadedPromptOrigin = useMemo<LoadedPromptOrigin | null>(() => {
    if (!openWorld) return null;

    if (activeDestination === "admission" && admissionDecision) {
      const request = admissionPromptStepRequest?.body ?? admissionDecision.promptOut.stepRequest.body;
      return {
        worldPath: openWorld,
        flowKey: "admission",
        flowId: null,
        recordId: admissionDecision.selectedRecord.id,
        recordShortId: admissionDecision.selectedRecord.shortId,
        recordTypeKey: admissionDecision.selectedRecord.recordTypeKey,
        selectedSectionHeading: null,
        stepKey: admissionDecision.promptOut.stepKey,
        mode: typeof request.mode === "string" ? request.mode : selectedAdmissionPromptMode?.mode ?? null,
        templateKey: admissionDecision.promptOut.templateKey,
        decisionLabel: admissionDecision.promptOut.preview.currentDecision || admissionDecision.localDecision,
        createdAt: loadedPromptStatus?.origin.createdAt ?? "",
        admissionLevel: admissionDecision.severity.admissionLevel,
        workScale: admissionDecision.severity.workScale,
        admissionDraftState: loadedPromptStatus?.origin.admissionDraftState ?? "not_applicable",
        admissionDraftHash: activeFullGateContract ? admissionDraftIdentity : null,
        admissionSectionKeys: activeFullGateContract ? activeFullGateSectionKeys : [],
        packetHash: loadedPromptStatus?.origin.packetHash ?? null,
        bodyHash: loadedPromptStatus?.origin.bodyHash ?? null,
        sourceManifestHash: loadedPromptStatus?.origin.sourceManifestHash ?? null
      };
    }

    if (activeDestination === "creation") {
      if (creationPromptOutBlockedByLocalSection) return null;
      const request = creationPromptStepRequest?.body;
      if (!request) return null;
      return {
        worldPath: openWorld,
        flowKey: "creation",
        flowId: originNumber(request.flowId) ?? flowId,
        recordId: originNumber(request.recordId) ?? kernelRecordId,
        recordShortId: creationPromptRecord?.shortId ?? null,
        recordTypeKey: creationPromptRecord?.recordTypeKey ?? null,
        selectedSectionHeading: typeof request.selectedSectionHeading === "string"
          ? request.selectedSectionHeading
          : displayedCreationDecision.currentStep.startsWith("kernel:")
            ? displayedCreationDecision.selectedSection?.heading ?? kernelHeading
            : null,
        stepKey: displayedCreationDecision.promptOut.stepKey,
        mode: typeof request.mode === "string" ? request.mode : selectedCreationPromptMode?.mode ?? null,
        templateKey: String(request.templateKey ?? displayedCreationDecision.promptOut.templateKey),
        decisionLabel: creationPromptCurrentDecision,
        createdAt: loadedPromptStatus?.origin.createdAt ?? "",
        admissionLevel: null,
        workScale: null,
        admissionDraftState: "not_applicable",
        admissionDraftHash: null,
        admissionSectionKeys: [],
        packetHash: loadedPromptStatus?.origin.packetHash ?? null,
        bodyHash: loadedPromptStatus?.origin.bodyHash ?? null,
        sourceManifestHash: loadedPromptStatus?.origin.sourceManifestHash ?? null
      };
    }

    if (activeDestination === "propagation" && propagationPromptStepRequest) {
      const request = propagationPromptStepRequest.body;
      return {
        worldPath: openWorld,
        flowKey: "propagation",
        flowId: originNumber(request.flowId) ?? propagationFlowId,
        recordId: originNumber(request.recordId) ?? propagationRun?.sourceFact.id ?? originNumber(propagationFactId),
        recordShortId: propagationRun?.sourceFact.shortId ?? null,
        recordTypeKey: propagationRun?.sourceFact.recordTypeKey ?? null,
        selectedSectionHeading: null,
        stepKey: String(request.stepKey ?? displayedPropagationContract?.nextOrResumeState.currentStep ?? "propagation:entry"),
        mode: typeof request.mode === "string" ? request.mode : propagationPromptMode,
        templateKey: String(request.templateKey ?? "propagation_consequence_scout"),
        decisionLabel: displayedPropagationContract?.step.localDecision ?? propagationRun?.sourceFact.title ?? "Propagation",
        createdAt: loadedPromptStatus?.origin.createdAt ?? "",
        admissionLevel: propagationRun?.severityPath.admissionLevel ?? null,
        workScale: propagationRun?.severityPath.workScale ?? null,
        activeSetRevision: propagationRun?.activeSet?.revision ?? null,
        admissionDraftState: "not_applicable",
        admissionDraftHash: null,
        admissionSectionKeys: [],
        packetHash: loadedPromptStatus?.origin.packetHash ?? null,
        bodyHash: loadedPromptStatus?.origin.bodyHash ?? null,
        sourceManifestHash: loadedPromptStatus?.origin.sourceManifestHash ?? null
      };
    }

    if (activeDestination === "temporal" && temporalRun && temporalPromptStepRequest) {
      const request = temporalPromptStepRequest.body;
      return {
        worldPath: openWorld,
        flowKey: "temporal_timeline",
        flowId: originNumber(request.flowId) ?? temporalRun.flow.id,
        recordId: originNumber(request.recordId) ?? temporalRun.source.sourceRecordId,
        recordShortId: temporalRun.source.sourceRecordId == null ? null : loadedPromptStatus?.origin.recordShortId ?? null,
        recordTypeKey: temporalRun.source.sourceRecordId == null ? null : loadedPromptStatus?.origin.recordTypeKey ?? null,
        selectedSectionHeading: null,
        stepKey: String(request.stepKey ?? temporalRun.promptOut.stepKey),
        mode: typeof request.mode === "string" ? request.mode : temporalPromptMode,
        templateKey: String(request.templateKey ?? temporalRun.promptOut.templateKey),
        decisionLabel: temporalRun.decisionPoint?.sharedContract.step.localDecision ?? "Temporal/Timeline Prompt-out",
        createdAt: loadedPromptStatus?.origin.createdAt ?? "",
        admissionLevel: null,
        workScale: null,
        activeSetRevision: originNumber(request.activeSetRevision) ?? null,
        admissionDraftState: "not_applicable",
        admissionDraftHash: null,
        admissionSectionKeys: [],
        packetHash: loadedPromptStatus?.origin.packetHash ?? null,
        bodyHash: loadedPromptStatus?.origin.bodyHash ?? null,
        sourceManifestHash: loadedPromptStatus?.origin.sourceManifestHash ?? null
      };
    }

    if (activeDestination === "substrate" && promptStep) {
      return {
        worldPath: openWorld,
        flowKey: promptStep.context.flowKey,
        flowId: promptStep.context.flowId,
        recordId: promptStep.selectedRecord?.id ?? originNumber(promptRecordId),
        recordShortId: promptStep.selectedRecord?.shortId ?? null,
        recordTypeKey: promptStep.selectedRecord?.recordTypeKey ?? null,
        selectedSectionHeading: promptStep.packetIdentity.selectedSectionHeading,
        stepKey: promptStep.context.stepKey,
        mode: promptStep.mode ?? null,
        templateKey: promptStep.templateKey,
        decisionLabel: promptStep.label,
        createdAt: loadedPromptStatus?.origin.createdAt ?? "",
        admissionLevel: promptStep.severity.admissionLevel,
        workScale: promptStep.severity.workScale,
        activeSetRevision: promptStep.packetIdentity.activeSetRevision ?? null,
        admissionDraftState: promptStep.packetIdentity.admissionDraftState ?? "not_applicable",
        admissionDraftHash: promptStep.packetIdentity.admissionDraftHash,
        admissionSectionKeys: promptStep.packetIdentity.admissionSectionKeys,
        packetHash: loadedPromptStatus?.origin.packetHash ?? null,
        bodyHash: loadedPromptStatus?.origin.bodyHash ?? null,
        sourceManifestHash: loadedPromptStatus?.origin.sourceManifestHash ?? null
      };
    }

    return null;
  }, [
    activeDestination,
    admissionDecision,
    activeFullGateContract,
    admissionPromptStepRequest,
    admissionDraftIdentity,
    activeFullGateSectionKeys,
    creationPromptOutBlockedByLocalSection,
    creationPromptStepRequest,
    creationPromptCurrentDecision,
    displayedCreationDecision,
    flowId,
    kernelHeading,
    kernelRecordId,
    loadedPromptStatus,
    openWorld,
    promptRecordId,
    promptStep,
    propagationFactId,
    propagationFlowId,
    propagationPromptMode,
    propagationPromptStepRequest,
    propagationRun,
    displayedPropagationContract,
    temporalPromptMode,
    temporalPromptStepRequest,
    temporalRun,
    selectedAdmissionPromptMode,
    selectedCreationPromptMode
  ]);
  const loadedPromptStatusView = useMemo<LoadedPromptStatusView | null>(() => {
    if (!loadedPromptStatus) return null;
    if (currentLoadedPromptOrigin && promptOriginsMatch(loadedPromptStatus.origin, currentLoadedPromptOrigin)) {
      return { origin: loadedPromptStatus.origin, state: "current", staleReason: null };
    }
    return {
      origin: loadedPromptStatus.origin,
      state: "stale",
      staleReason: currentLoadedPromptOrigin
        ? `Current decision changed to ${currentLoadedPromptOrigin.decisionLabel}.`
        : "No active decision identity is available for the loaded prompt."
    };
  }, [currentLoadedPromptOrigin, loadedPromptStatus]);
  const promptPacketView = useMemo(() => {
    if (!promptText) return null;
    if (!promptPacketOrigin) {
      return {
        state: "unbound" as const,
        reason: "This prompt packet body has no server-returned identity, so it cannot be copied, exported, or stored as current.",
        origin: null
      };
    }
    if (["missing_required", "incomplete"].includes(promptPacketOrigin.admissionDraftState ?? "not_applicable")) {
      return {
        state: "incomplete" as const,
        reason: `This prompt packet body has draft state ${promptPacketOrigin.admissionDraftState}; load a complete current draft before copying, exporting, or storing it.`,
        origin: promptPacketOrigin
      };
    }
    if (
      loadedPromptStatusView?.state === "current"
      && loadedPromptStatus
      && samePromptPacketOrigin(promptPacketOrigin, loadedPromptStatus.origin)
    ) {
      return {
        state: "current" as const,
        reason: "This prompt packet body matches the active loaded Prompt-out origin.",
        origin: promptPacketOrigin
      };
    }
    if (
      loadedPromptStatusView?.state === "current"
      && loadedPromptStatus
      && promptOriginsMatch(promptPacketOrigin, loadedPromptStatus.origin)
    ) {
      return {
        state: "inconsistent" as const,
        reason: "This prompt packet body has the active origin but its generated timestamp, packet hash, or body hash disagrees with the loaded status.",
        origin: promptPacketOrigin
      };
    }
    return {
      state: "stale" as const,
      reason: "This prompt packet body belongs to a prior origin and cannot be copied, exported, or stored as the active decision's current packet.",
      origin: promptPacketOrigin
    };
  }, [loadedPromptStatus, loadedPromptStatusView, promptPacketOrigin, promptText]);
  const canUseCurrentPromptPacket = Boolean(promptText && promptPacketView?.state === "current");
  const copyCurrentPromptPacket = () => {
    if (!canUseCurrentPromptPacket || !promptPacketOrigin) {
      setMessage("Prompt packet body is stale or unbound; load or generate the current packet before copying.");
      return;
    }
    void navigator.clipboard?.writeText(promptPacketExportText(promptPacketOrigin, promptText));
    setMessage("Current prompt packet copied.");
  };
  const downloadCurrentPromptPacket = () => {
    if (!canUseCurrentPromptPacket || !promptPacketOrigin) {
      setMessage("Prompt packet body is stale or unbound; load or generate the current packet before downloading.");
      return;
    }
    const blob = new Blob([promptPacketExportText(promptPacketOrigin, promptText)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${promptPacketOrigin.flowKey ?? "prompt"}-${promptPacketOrigin.stepKey.replaceAll(":", "-")}-${promptPacketOrigin.packetHash ?? "packet"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Current prompt packet downloaded.");
  };
  const promptPacketExportControls = (
    <>
      <button onClick={copyCurrentPromptPacket} disabled={!canUseCurrentPromptPacket}>Copy Current Packet</button>
      <button onClick={downloadCurrentPromptPacket} disabled={!canUseCurrentPromptPacket}>Download Current Packet</button>
    </>
  );
  const promptPacketStatusPanel = promptPacketView ? (
    <PromptPacketBodyStatus
      promptText={promptText}
      state={promptPacketView.state}
      reason={promptPacketView.reason}
      origin={promptPacketView.origin}
    />
  ) : null;
  const currentTemporalPacket = temporalPacketContext && promptPacketOrigin?.flowKey === "temporal_timeline" && promptText
    ? { promptText, identity: promptPacketOrigin, context: temporalPacketContext }
    : null;
  const loadedPromptStatusPanel = loadedPromptStatusView ? (
    <LoadedPromptStatusPanel
      view={loadedPromptStatusView}
      onClear={() => {
        setLoadedPromptStatus(null);
        clearPromptPacketBody();
      }}
      onReturn={() => setActiveDestination(loadedPromptStatusView.origin.flowKey === "creation" || loadedPromptStatusView.origin.flowKey === "admission"
        ? loadedPromptStatusView.origin.flowKey
        : "substrate")}
      actions={promptPacketExportControls}
    />
  ) : null;
  const currentCreationPromptPacketText = activeDestination === "creation"
    && promptPacketView?.state === "current"
    && promptPacketOrigin?.flowKey === "creation"
    ? promptText
    : null;
  const currentCreationPromptPacketPreview: PromptPreviewPayload | null = currentCreationPromptPacketText && promptPacketOrigin?.flowKey === "creation"
    ? {
        currentDecision: `Current loaded Prompt-out packet for ${promptPacketOrigin.stepKey} in ${promptPacketOrigin.mode === "pressure" ? "Pressure mode" : "Proposal mode"}.`,
        promptText: currentCreationPromptPacketText,
        contextPreview: [
          `Current decision: ${promptPacketOrigin.decisionLabel}`,
          promptPacketOrigin.recordShortId ? `Record: ${promptPacketOrigin.recordShortId}` : null,
          promptPacketOrigin.recordTypeKey ? `Record type: ${promptPacketOrigin.recordTypeKey}` : null,
          promptPacketOrigin.selectedSectionHeading ? `Selected section: ${promptPacketOrigin.selectedSectionHeading}` : null,
          "The preview is bound to the same loaded Prompt-out identity as the current copy/download actions."
        ].filter((line): line is string => Boolean(line)).join(" "),
        sourceManifest: [
          `Current packet identity: flow ${promptPacketOrigin.flowKey ?? "none"}; step ${promptPacketOrigin.stepKey}; mode ${promptPacketOrigin.mode ?? "none"}; template ${promptPacketOrigin.templateKey}`,
          `Current packet record: ${promptPacketOrigin.recordId ?? "none"}${promptPacketOrigin.recordShortId ? ` (${promptPacketOrigin.recordShortId})` : ""}`,
          `Prompt packet hash: ${promptPacketOrigin.packetHash ?? "none"}`,
          `Prompt packet body hash: ${promptPacketOrigin.bodyHash ?? "none"}`,
          `Prompt packet source_manifest hash: ${promptPacketOrigin.sourceManifestHash ?? "none"}`
        ],
        omissions: ["Current packet replaces the secondary preview while its identity matches the active Creation decision."],
        advisoryCanonWarning: displayedCreationDecision.promptOut.preview.advisoryCanonWarning
      }
    : null;
  const creationLocalPreviewUsesSelectedSection = creationKernelPromptTargeting
    && selectedSectionContract
    && (creationLocalPromptRequest || creationPromptOutBlockedByLocalSection);
  const creationPromptPreviewForDisplay: PromptPreviewPayload = currentCreationPromptPacketPreview
    ?? (creationLocalPreviewUsesSelectedSection && selectedSectionContract
      ? {
        ...displayedCreationDecision.promptOut.preview,
        currentDecision: creationPromptCurrentDecision,
        promptText: currentCreationPromptPacketText ?? [
          creationPromptMode === "pressure" ? "Pressure mode selected target:" : "Proposal mode selected target:",
          kernelHeading,
          `Selected section prompt: ${selectedSectionContract.prompt}`,
          `Selected section material: ${selectedSectionContract.savedBody.trim() || "(empty)"}`,
          creationPromptOutBlockedByLocalSection
            ? `Current blocker: ${creationPromptOutLocalSectionMessage}`
            : creationPromptMode === "pressure"
              ? "Mode request: challenge the selected section's saved steward-authored material; advisory material is not canon and loading Prompt-out remains side-effect free."
              : selectedSectionContract.savedBody.trim()
                ? "Selected section has saved steward material."
                : "Selected section empty-state context: no saved text exists yet; proposal may request candidates, while pressure remains unavailable until steward-authored material is saved.",
          ...(creationPromptOutBlockedByLocalSection || creationPromptMode === "pressure"
            ? []
            : ["Mode request: draft labeled candidate material for this selected section; advisory material is not canon and saving kernel text remains a separate steward write."])
        ].join(" "),
        sourceManifest: [
          `Selected kernel section: ${kernelHeading}`,
          `Section prompt: ${selectedSectionContract.prompt}`,
          `Section obligation: ${selectedSectionContract.obligation}`,
          `Prompt mode: ${creationPromptMode}`,
          `Prompt template: ${creationPromptStepRequest?.body.templateKey ?? creationPromptBaseRequest?.body.templateKey ?? displayedCreationDecision.promptOut.templateKey}`,
          ...displayedCreationDecision.promptOut.preview.sourceManifest.filter((item) => item.startsWith("Method card:") || item.startsWith("Package source:") || item.startsWith("Omissions:"))
        ],
        contextPreview: [
          `Selected kernel section: ${kernelHeading}`,
          `Section obligation: ${selectedSectionContract.obligation}`,
          `Section prompt: ${selectedSectionContract.prompt}`,
          `Selected section material: ${selectedSectionContract.savedBody.trim() || "(empty)"}`
        ].join(" "),
        advisoryCanonWarning: displayedCreationDecision.promptOut.preview.advisoryCanonWarning
      }
      : displayedCreationDecision.promptOut.preview);

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
    admissionPromptMode,
    admissionRecordId,
    constraintFlowId,
    constraintSourceRecordId,
    flowId,
    promptFlowKey,
    promptRecordId,
    promptTemplateKey,
    propagationFactId,
    propagationFlowId,
    propagationPromptMode,
    qaFlowId,
    qaSubjectRecordId,
    stage12FlowId,
    stage12SourceRecordId,
    stage13FlowId,
    stage13SourceRecordId,
    stage13WorkScale,
    workScale
  ]);

  useEffect(() => {
    const firstSeed = minimalViableWorld?.checkpoint.coverageSignals.admittedSeeds[0];
    if (firstSeed && !minimalSeedRecordId) setMinimalSeedRecordId(String(firstSeed.id));
    if (firstSeed && !minimalProposalSeedRecordId) setMinimalProposalSeedRecordId(String(firstSeed.id));
    const firstDimension = firstSeed?.dimensions[0];
    if (firstDimension && !minimalDimensionKey) setMinimalDimensionKey(firstDimension.key);
  }, [minimalDimensionKey, minimalProposalSeedRecordId, minimalSeedRecordId, minimalViableWorld]);

  const loadRecentWorlds = async () => {
    const payload = await api<{ recentWorlds: RecentWorld[] }>("/api/recent-worlds");
    setRecentWorlds(payload.recentWorlds);
  };

  const loadWorldData = async () => {
    const [workflowMapPayload, recordPayload, linkPayload, vocabularyPayload, headingPayload, draftPayload, templatePayload, queuePayload, debtPayload, propagationQueuePayload, stage13OwedPayload, minimalViableWorldPayload, canonCurrentPayload, canonAuditPayload] = await Promise.all([
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
      api<MinimalViableWorldState>("/api/flows/creation/minimal-viable-world"),
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
    setMinimalViableWorld(minimalViableWorldPayload);
    setCanonCurrentRows(canonCurrentPayload.rows);
    setCanonAuditTrail(canonAuditPayload.spine);
  };

  const navigateWorkflow = async (destinationKey: string) => {
    if (destinationKey !== "map") {
      setActiveDestination(destinationKey);
      if (destinationKey === "propagation") {
        try {
          const payload = await api<{ run: PropagationRunPayload | null }>("/api/propagation/runs/active");
          if (payload.run != null) applyPropagationRun(payload.run);
        } catch (error) {
          setMessage(error instanceof Error ? error.message : String(error));
        }
      }
      return;
    }
    try {
      await loadWorldData();
      setActiveDestination("map");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    }
  };

  const followConditionalPass = async (obligation: WorkflowMapConditionalPassObligation) => {
    const sourceId = String(obligation.destination.body.recordId);
    if (obligation.passKey === "temporal_timeline") {
      setTemporalSourceType("fact");
      setTemporalSourceRecordId(sourceId);
    } else if (obligation.passKey === "constraint_composition") {
      setConstraintSourceType("fact");
      setConstraintSourceRecordId(sourceId);
    } else {
      setStage12SourceType("fact");
      setStage12SourceRecordId(sourceId);
    }
    await navigateWorkflow(obligation.destination.destinationKey);
  };

  const deferConditionalPass = async (obligation: WorkflowMapConditionalPassObligation, rationale: string) => {
    await api<{ obligation: WorkflowMapConditionalPassObligation }>(obligation.action?.href ?? `/api/conditional-pass-obligations/${obligation.id}/defer`, {
      method: "POST",
      body: JSON.stringify({ ...obligation.action?.body, rationale })
    });
    await loadWorldData();
  };

  const resetAdmissionFullGateDraftState = (decision: AdmissionDecisionPoint | null = null) => {
    setGateConsequence("");
    setGateQuietDomain("");
    setGateNotApplicable("");
    setGateSectionSubstance({});
    setGateSectionNotApplicableReasons({});
    setGateSectionQuietDeclarations({});
    setGateFollowUpDebt("");
    setGateAdvisoryRecordId("");
    setGateFinalReview(null);
    setAdmissionCompletionReadback(null);
    if (decision?.severity.gatePath === "full_gate" && decision.fullGateContract) {
      setGateCanonStatus(decision.fullGateContract.allowedNextCanonStatuses.find((status) => status !== decision.selectedRecord.canonStatus) || decision.selectedRecord.canonStatus || "");
      setGateConstraintTags(decision.selectedRecord.constraintTags.join(", "));
      setAdmissionOperation(decision.fullGateContract.operationOptions[0] || "accept");
      setAdmissionValidationErrors(decision.fullGateContract.validationErrors ?? []);
    } else {
      setGateCanonStatus("");
      setGateConstraintTags("");
      setAdmissionOperation("accept");
      setAdmissionValidationErrors([]);
    }
  };

  const applyAdmissionDecision = (decision: AdmissionDecisionPoint | null) => {
    setAdmissionDecision(decision);
    if (!decision) {
      setGateDraftIdentity("");
      resetAdmissionFullGateDraftState(null);
      return;
    }
    setAdmissionRecordId(String(decision.selectedRecord.id));
    if (decision.severity.admissionLevel) setAdmissionLevel(decision.severity.admissionLevel);
    if (decision.severity.workScale) setWorkScale(decision.severity.workScale);
    if (decision.severity.gatePath === "full_gate" && decision.fullGateContract) {
      const nextDraftIdentity = admissionDraftIdentityFor({
        worldPath: openWorld,
        recordId: decision.selectedRecord.id,
        recordShortId: decision.selectedRecord.shortId,
        currentStep: decision.currentStep,
        admissionLevel: decision.severity.admissionLevel,
        workScale: decision.severity.workScale,
        sectionKeys: decision.fullGateContract.sections.map((section) => section.key)
      });
      if (nextDraftIdentity !== gateDraftIdentity) {
        resetAdmissionFullGateDraftState(decision);
        setGateDraftIdentity(nextDraftIdentity);
      } else {
        setGateCanonStatus((current) => current || decision.fullGateContract?.allowedNextCanonStatuses.find((status) => status !== decision.selectedRecord.canonStatus) || decision.selectedRecord.canonStatus || "");
        setGateConstraintTags((current) => current || decision.selectedRecord.constraintTags.join(", "));
        setAdmissionOperation((current) => current || decision.fullGateContract?.operationOptions[0] || "accept");
        setAdmissionValidationErrors((current) => current.length ? current : decision.fullGateContract?.validationErrors ?? []);
      }
    } else {
      setGateDraftIdentity("");
      resetAdmissionFullGateDraftState(decision);
      setAdmissionValidationErrors([]);
    }
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

  const hasUnsavedWorldScopedBrowserBuffers = () => [
    recordForm.title,
    recordForm.body,
    sections.map((section) => section.body).join("\n"),
    Object.values(kernelSectionDrafts).join("\n"),
    draftTitle,
    draftBody,
    promptText,
    responseText,
    kernelBody,
    consequenceMode,
    seedTitle,
    seedBody,
    seedTruthLayer,
    granularityRationale,
    admissionIntent,
    coverageBootstrapRows
      .filter((row) => row.label.trim() || row.sourceKernelContext.trim() || !row.required)
      .map((row) => `${row.label}\n${row.sourceKernelContext}\n${row.required ? "required" : "optional"}`)
      .join("\n"),
    coverageBootstrapError ?? "",
    Object.values(coverageDrafts).map((draft) => `${draft.seedRecordIds}\n${draft.rationale}\n${draft.error ?? ""}`).join("\n"),
    minimalDispositionSubstance,
    minimalEvidenceRecordIds,
    minimalProtectedRecordId,
    minimalDebtName,
    minimalProposalTitle,
    minimalProposalBody,
    admissionLevel,
    workScale,
    gateConsequence,
    gateQuietDomain,
    gateNotApplicable,
    Object.values(gateSectionSubstance).join("\n"),
    Object.values(gateSectionNotApplicableReasons).join("\n"),
    Object.values(gateSectionQuietDeclarations).join("\n"),
    gateCanonStatus,
    gateConstraintTags,
    gateFollowUpDebt,
    gateAdvisoryRecordId,
    admissionValidationErrors.map((error) => `${error.key}:${error.message}`).join("\n"),
    gateFinalReview ? JSON.stringify(gateFinalReview.payload) : "",
    canonDebtName,
    seedAuditFindings,
    propagationText,
    propagationDispositionNote,
    propagationDebtName,
    propagationPreservationBoundary,
    stage12MaterialTitle,
    stage12MaterialBody,
    stage12CoverageBody,
    constraintMaterialTitle,
    constraintMaterialBody,
    constraintSubject,
    constraintCompositionBody,
    temporalMaterialTitle,
    temporalMaterialBody,
    temporalSubject,
    temporalCoverage.temporalQuestions,
    temporalCoverage.firstTrueOrRelativeSequence,
    temporalCoverage.firstKnownOrReason,
    temporalCoverage.dateTypesAndGranularity,
    temporalCoverage.latency,
    temporalCoverage.residueByTimescale,
    temporalCoverage.sequenceIntegrity,
    temporalCoverage.retrospectiveInsertion,
    temporalCoverage.temporalMysteryBoundaries,
    temporalCoverage.outcomeDecision,
    stage13Title,
    stage13TriageBody,
    stage13DispositionNote,
    stage13RepairText,
    stage13RepairTargetTitle,
    stage13RepairTargetBody,
    stage13RepairTargetNote,
    stage13ProposalTitle,
    stage13ProposalBody,
    stage13PropagationDebtName,
    stage13PropagationBody,
    stage13PropagationReason,
    stage13SkipReason,
    stage13LedgerTitle,
    stage13ChecklistBody,
    stage13ChecklistSacredGuard,
    qaNaReason,
    qaNotes,
    qaRequiredRepair
  ].some((value) => value.trim().length > 0);

  // One boundary for destination-local state when the active world file changes.
  const resetWorldScopedBrowserState = () => {
    setWorkflowMap(null);
    setActiveDestination("map");
    setRecords([]);
    setLinks([]);
    setHeadings([]);
    setSections([]);
    setFacets([]);
    setDrafts([]);
    setTemplates([]);
    setAdmissionQueue([]);
    setAdmissionDecision(null);
    setCreationDecision(null);
    setDecompositionError(null);
    setCoverageBootstrapRows([emptyCreationCoverageBootstrapRow()]);
    setCoverageBootstrapError(null);
    setCoverageDrafts({});
    setMinimalViableWorld(null);
    setCanonDebt([]);
    setPropagationQueue([]);
    setPropagationRun(null);
    setPropagationPlan(null);
    setPropagationDecisionPoint(null);
    setPropagationConsequences([]);
    setPropagationDomains([]);
    setPropagationDispositions([]);
    setStage12Run(null);
    setStage12FlowId(null);
    setStage12SourceRecordId("");
    setStage12SourceSection("");
    setStage12MaterialTitle("");
    setStage12MaterialBody("");
    setStage12CoverageBody("");
    setStage12ExistingCardId("");
    setStage12CardRelation("");
    setStage12AdvisoryRecordId("");
    setStage12SkipUnresolved(false);
    setConstraintRun(null);
    setConstraintFlowId(null);
    setConstraintSourceRecordId("");
    setConstraintSourceSection("");
    setConstraintMaterialTitle("");
    setConstraintMaterialBody("");
    setConstraintSubject("");
    setConstraintInventory({ ...emptyConstraintInventory });
    setConstraintCompositionBody("");
    setConstraintLeakage({ ...emptyConstraintLeakage });
    setConstraintResidue({ ...emptyConstraintResidue });
    setConstraintInventoryId("");
    setConstraintExistingCardId("");
    setConstraintCardRelation("");
    setConstraintAdvisoryRecordId("");
    setConstraintSkipUnresolved(false);
    setTemporalRun(null);
    setTemporalFlowId(null);
    setTemporalSourceRecordId("");
    setTemporalMaterialTitle("");
    setTemporalMaterialBody("");
    setTemporalSubject("");
    setTemporalCoverage({ ...emptyTemporalCoverage });
    setTemporalExistingCardId("");
    setTemporalCardRelation("");
    setTemporalAdvisoryRecordId("");
    setTemporalSkipUnresolved(false);
    setStage13Run(null);
    setStage13FlowId(null);
    setStage13SourceRecordId("");
    setStage13ImplicatedRecordIds("");
    setStage13Title("");
    setStage13TriageBody("");
    setStage13WorkScale("");
    setStage13DispositionNote("");
    setStage13RepairOperationOrder("");
    setStage13RepairText("");
    setStage13RepairTargetRecordId("");
    setStage13RepairTargetStatus("");
    setStage13RepairTargetTitle("");
    setStage13RepairTargetBody("");
    setStage13RepairTargetNote("");
    setStage13RepairAdvisoryRecordId("");
    setStage13ProposalTitle("");
    setStage13ProposalBody("");
    setStage13RetconCostTexts({ ...emptyStage13RetconCosts });
    setStage13PropagationDebtName("");
    setStage13PropagationBody("");
    setStage13PropagationReason("");
    setStage13SkipReason("");
    setStage13OwedBoundaries([]);
    setStage13LedgerRecordId("");
    setStage13LedgerTitle("");
    setStage13ProtectedRecordId("");
    setStage13PropagationReportRecordId("");
    setStage13PropagationDispositionId("");
    setStage13MysterySections({ ...emptyStage13MysterySections });
    setStage13ChecklistBody("");
    setStage13ChecklistSacredGuard("");
    setQaFlowId(null);
    setQaPassId(null);
    setQaSubjectRecordId("");
    setQaScorecard(null);
    setQaScores([]);
    setQaBand(null);
    setQaNaReason("");
    setQaNotes("");
    setQaRequiredRepair("");
    setQaLoadBearing(false);
    setQaRepairRouted(false);
    setQaProfile({ ...emptyQaProfile });
    setQaFloorConditions({ ...emptyQaFloorConditions });
    setQaFloorOverride(false);
    setQaFloorOverrideReason("");
    setSearch("");
    setExportedMarkdown("");
    setRecordForm(emptyRecordForm);
    setEditingId(null);
    setDraftTitle("");
    setDraftBody("");
    setFromRecordId("");
    setToRecordId("");
    setPromptRecordId("");
    setPromptFlowKey("creation");
    setPromptTemplateKey("kernel_pressure");
    setAdmissionLevel("");
    setWorkScale("");
    setAdmissionOperation("accept");
    setGateConsequence("");
    setGateQuietDomain("");
    setGateNotApplicable("");
    setGateSectionSubstance({});
    setGateSectionNotApplicableReasons({});
    setGateSectionQuietDeclarations({});
    setGateCanonStatus("");
    setGateConstraintTags("");
    setGateFollowUpDebt("");
    setGateAdvisoryRecordId("");
    setAdmissionValidationErrors([]);
    setGateDraftIdentity("");
    setGateFinalReview(null);
    setAdmissionCompletionReadback(null);
    setCreationPromptMode("proposal");
    setAdmissionPromptMode("proposal");
    setPromptStep(null);
    setPromptText("");
    setPromptPacketOrigin(null);
    setLoadedPromptStatus(null);
    setTemplateEdit("");
    setResponseText("");
    setDisposition("standing ruling");
    setFlowId(null);
    setKernelRecordId(null);
    setKernelHeading("World premise");
    setKernelBody("");
    setKernelSectionDrafts({});
    setConsequenceMode("");
    setCreationStartPending(false);
    setCreationStartError(null);
    setCreationAutoStartAttempted(false);
    setSeedTitle("");
    setSeedBody("");
    setSeedTruthLayer("");
    setGranularityRationale("");
    setGranularityConfirmed(false);
    setMinimalSeedRecordId("");
    setMinimalDimensionKey("");
    setMinimalDisposition("covered");
    setMinimalDispositionSubstance("");
    setMinimalEvidenceRecordIds("");
    setMinimalProtectedRecordId("");
    setMinimalDeferralKind("none");
    setMinimalDebtName("");
    setMinimalProposalSeedRecordId("");
    setMinimalProposalTitle("");
    setMinimalProposalBody("");
    setAdmissionIntent("");
    setAdmissionRecordId("");
    setAdmissionLevel("");
    setWorkScale("");
    setGateConsequence("");
    setGateQuietDomain("");
    setGateNotApplicable("");
    setCanonDebtName("");
    setSeedAuditFindings("");
    setPropagationFactId("");
    setPropagationDebtId("");
    setPropagationFlowId(null);
    setPropagationPromptMode("proposal");
    setPropagationDomainName("");
    setPropagationText("");
    setPropagationConsequenceId("");
    setPropagationDispositionNote("");
    setPropagationDebtName("");
    setPropagationPreservationBoundary("");
    setCanonCurrentRows([]);
    setCanonAuditTrail([]);
    setCanonDetail(null);
    setSelectedCanonRecordId(null);
    setSelectedAuditReportId(null);
    setCanonWorkbenchQuery("");
    setCanonWorkbenchRecordType("");
    setCanonWorkbenchTruthLayer("");
    setCanonWorkbenchStatus("");
    setCanonWorkbenchConsequenceMode("");
    setCanonWorkbenchScope("");
    setCanonWorkbenchOpenDebt(false);
    setCanonWorkbenchBranchRelevant(false);
  };

  const createOrOpen = async (mode: "create" | "open", selectedPath = worldPath) => {
    const switchingWorlds = Boolean(openWorld && selectedPath && selectedPath !== openWorld);
    if (switchingWorlds && hasUnsavedWorldScopedBrowserBuffers()) {
      const shouldContinue = typeof window === "undefined" || window.confirm("Switching worlds clears current-world browser drafts, Prompt-out status, selections, and flow buffers before the new world renders. Continue?");
      if (!shouldContinue) {
        setMessage("World switch canceled; current browser buffers were preserved.");
        return;
      }
    }
    try {
      const payload = await api<{
        path: string;
        records: RecordRow[];
        setupStatus?: SetupStatusPayload;
      }>(`/api/worlds/${mode}`, {
        method: "POST",
        body: JSON.stringify({ path: selectedPath })
      });
      if (payload.path !== openWorld) resetWorldScopedBrowserState();
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
    if (promptFlowKey === "temporal_timeline") return temporalFlowId ?? undefined;
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
              : promptFlowKey === "temporal_timeline"
                ? optionalNumber(temporalSourceRecordId)
                : promptFlowKey === "contradiction"
                  ? optionalNumber(stage13SourceRecordId)
                  : undefined);

  const promptOriginFromStep = (
    step: PromptOutStep,
    decisionLabel: string,
    fallback: Partial<LoadedPromptOrigin> = {}
  ): LoadedPromptOrigin => ({
    worldPath: openWorld ?? fallback.worldPath ?? "",
    flowKey: step.context.flowKey ?? fallback.flowKey ?? null,
    flowId: step.context.flowId ?? fallback.flowId ?? null,
    recordId: step.selectedRecord?.id ?? fallback.recordId ?? null,
    recordShortId: step.selectedRecord?.shortId ?? fallback.recordShortId ?? step.packetIdentity.recordShortId ?? null,
    recordTypeKey: step.selectedRecord?.recordTypeKey ?? fallback.recordTypeKey ?? step.packetIdentity.recordTypeKey ?? null,
    selectedSectionHeading: step.packetIdentity.selectedSectionHeading ?? fallback.selectedSectionHeading ?? null,
    stepKey: step.context.stepKey,
    mode: step.mode ?? fallback.mode ?? null,
    templateKey: step.templateKey,
    decisionLabel,
    createdAt: new Date().toISOString(),
    admissionLevel: step.severity.admissionLevel ?? fallback.admissionLevel ?? null,
    workScale: step.severity.workScale ?? fallback.workScale ?? null,
    activeSetRevision: step.packetIdentity.activeSetRevision ?? fallback.activeSetRevision ?? null,
    admissionDraftState: step.packetIdentity.admissionDraftState ?? fallback.admissionDraftState ?? "not_applicable",
    admissionDraftHash: step.packetIdentity.admissionDraftHash ?? fallback.admissionDraftHash ?? null,
    admissionSectionKeys: step.packetIdentity.admissionSectionKeys ?? fallback.admissionSectionKeys ?? [],
    packetHash: fallback.packetHash ?? null,
    bodyHash: step.packetIdentity.bodyHash ?? fallback.bodyHash ?? null,
    sourceManifestHash: step.packetIdentity.sourceManifestHash ?? fallback.sourceManifestHash ?? null
  });

  const promptOriginFromPacketIdentity = (
    identity: PromptPacketIdentity,
    fallback: Partial<LoadedPromptOrigin> = {}
  ): LoadedPromptOrigin => ({
    worldPath: identity.worldPath ?? openWorld ?? fallback.worldPath ?? "",
    flowKey: identity.flowKey ?? fallback.flowKey ?? null,
    flowId: identity.flowId ?? fallback.flowId ?? null,
    recordId: identity.recordId ?? fallback.recordId ?? null,
    recordShortId: identity.recordShortId ?? fallback.recordShortId ?? null,
    recordTypeKey: identity.recordTypeKey ?? fallback.recordTypeKey ?? null,
    selectedSectionHeading: identity.selectedSectionHeading ?? fallback.selectedSectionHeading ?? null,
    stepKey: identity.stepKey,
    mode: identity.mode ?? fallback.mode ?? null,
    templateKey: identity.templateKey,
    decisionLabel: identity.decisionLabel || fallback.decisionLabel || identity.selectedSectionHeading || identity.stepKey,
    createdAt: identity.generatedAt ?? fallback.createdAt ?? new Date().toISOString(),
    admissionLevel: identity.admissionLevel ?? fallback.admissionLevel ?? null,
    workScale: identity.workScale ?? fallback.workScale ?? null,
    activeSetRevision: identity.activeSetRevision ?? fallback.activeSetRevision ?? null,
    admissionDraftState: identity.admissionDraftState ?? fallback.admissionDraftState ?? "not_applicable",
    admissionDraftHash: identity.admissionDraftHash ?? fallback.admissionDraftHash ?? null,
    admissionSectionKeys: identity.admissionSectionKeys ?? fallback.admissionSectionKeys ?? [],
    packetHash: identity.packetHash ?? fallback.packetHash ?? null,
    bodyHash: identity.bodyHash ?? fallback.bodyHash ?? null,
    sourceManifestHash: identity.sourceManifestHash ?? fallback.sourceManifestHash ?? null
  });

  const setLoadedPromptAndPacket = (origin: LoadedPromptOrigin, text?: string | null) => {
    setLoadedPromptStatus({ origin });
    if (text != null) {
      setPromptText(text);
      setPromptPacketOrigin(origin);
    }
  };

  const clearPromptPacketBody = () => {
    setPromptText("");
    setPromptPacketOrigin(null);
    setPropagationPacketContext(null);
  };

  const selectedPromptStepKey = () => {
    if (promptFlowKey === "constraint_composition") return "constraint:challenge";
    if (promptFlowKey === "temporal_timeline") return temporalRun?.promptOut.stepKey ?? "temporal:spatial-temporal-analysis";
    return promptTemplateKey;
  };

  const loadPromptStep = async () => {
    const payload = await api<{ step: PromptOutStep }>("/api/prompt-out/steps", {
      method: "POST",
      body: JSON.stringify({
        flowKey: promptFlowKey,
        flowId: promptStepFlowId(),
        templateKey: promptTemplateKey,
        recordId: promptStepRecordId(),
        stepKey: selectedPromptStepKey(),
        mode: promptFlowKey === "temporal_timeline" ? temporalPromptMode : undefined,
        label: selectedTemplate?.role_name ?? promptTemplateKey,
        admissionLevel: admissionLevel || undefined,
        workScale: promptFlowKey === "contradiction" ? (stage13WorkScale || undefined) : (workScale || undefined)
      })
    });
    setPromptStep(payload.step);
    setLoadedPromptStatus({ origin: promptOriginFromStep(payload.step, payload.step.label, { recordId: promptStepRecordId() ?? null }) });
    setPromptPacketOrigin(null);
    setMessage(`Loaded Prompt-out step ${payload.step.label}`);
    return payload.step;
  };

  const loadAdmissionPromptStep = async () => {
    if (!admissionDecision) return null;
    const request = admissionPromptStepRequest;
    if (!request || selectedAdmissionPromptMode?.availability === "blocked") {
      setMessage(`${selectedAdmissionPromptMode?.label ?? "Admission Prompt-out"} is blocked: ${selectedAdmissionPromptMode?.blocker ?? "server returned no step request"}`);
      return null;
    }
    const admissionFullGateDraft = buildAdmissionFullGateDraftPayload();
    const requestBody = admissionFullGateDraft
      ? { ...request.body, admissionFullGateDraft }
      : request.body;
    setPromptFlowKey("admission");
    setPromptTemplateKey(String(request.body.templateKey ?? admissionDecision.promptOut.templateKey));
    setPromptRecordId(String(request.body.recordId ?? admissionDecision.selectedRecord.id));
    const payload = await api<{ step: PromptOutStep }>(request.href, {
      method: request.method,
      body: JSON.stringify(requestBody)
    });
    setPromptStep(payload.step);
    const generated = await api<{ prompt: string; promptOut: { packetIdentity: PromptPacketIdentity; propagationContext?: PropagationPacketContextPreview | null } }>(payload.step.actions.generate.href, {
      method: payload.step.actions.generate.method,
      body: admissionFullGateDraft ? JSON.stringify({ admissionFullGateDraft }) : undefined
    });
    setLoadedPromptAndPacket(
      promptOriginFromPacketIdentity(generated.promptOut.packetIdentity, {
        flowKey: "admission",
        recordId: admissionDecision.selectedRecord.id,
        mode: typeof request.body.mode === "string" ? request.body.mode : selectedAdmissionPromptMode?.mode ?? null,
        admissionLevel: admissionDecision.severity.admissionLevel,
        workScale: admissionDecision.severity.workScale,
        decisionLabel: admissionDecision.promptOut.preview.currentDecision || admissionDecision.localDecision
      }),
      generated.prompt
    );
    setPropagationPacketContext(generated.promptOut.propagationContext ?? null);
    setMessage(`Loaded Admission Prompt-out step ${payload.step.label}`);
    return payload.step;
  };

  const loadCreationPromptStep = async () => {
    if (creationPromptOutBlockedByLocalSection) {
      setMessage(creationPromptOutLocalSectionMessage);
      return null;
    }
    if (!creationDecision?.promptOut.stepRequest && !creationDecision?.promptOut.modes?.some((mode) => mode.stepRequest)) return null;
    const selectedMode = creationDecision.promptOut.modes?.find((mode) => mode.mode === creationPromptMode) ?? null;
    const request = creationPromptStepRequest;
    if (!request) {
      setMessage(`${selectedMode?.label ?? "Creation Prompt-out"} is blocked: ${selectedMode?.blocker ?? "server returned no step request"}`);
      return null;
    }
    setPromptFlowKey("creation");
    setPromptTemplateKey(String(request.body.templateKey ?? creationDecision.promptOut.templateKey));
    setPromptRecordId(String(request.body.recordId ?? ""));
    const payload = await api<{ step: PromptOutStep }>(request.href, {
      method: request.method,
      body: JSON.stringify(request.body)
    });
    setPromptStep(payload.step);
    const generated = await api<{ prompt: string; promptOut: { packetIdentity: PromptPacketIdentity } }>(payload.step.actions.generate.href, {
      method: payload.step.actions.generate.method
    });
    setLoadedPromptAndPacket(
      promptOriginFromPacketIdentity(generated.promptOut.packetIdentity, {
        flowKey: "creation",
        flowId: originNumber(request.body.flowId),
        recordId: originNumber(request.body.recordId),
        recordShortId: creationPromptRecord?.shortId ?? null,
        recordTypeKey: creationPromptRecord?.recordTypeKey ?? null,
        mode: typeof request.body.mode === "string" ? request.body.mode : selectedMode?.mode ?? null,
        selectedSectionHeading: typeof request.body.selectedSectionHeading === "string"
          ? request.body.selectedSectionHeading
          : displayedCreationDecision.currentStep.startsWith("kernel:")
            ? kernelHeading
            : null,
        decisionLabel: creationPromptCurrentDecision
      }),
      generated.prompt
    );
    setMessage(`Loaded Creation Prompt-out step ${payload.step.label} (${payload.step.mode === "pressure" ? "Pressure mode" : "Proposal mode"})`);
    return payload.step;
  };

  const loadPropagationPromptStep = async () => {
    const request = propagationPromptStepRequest;
    if (!request || selectedPropagationPromptMode?.availability === "blocked") {
      setMessage(`${selectedPropagationPromptMode?.label ?? "Propagation Prompt-out"} is blocked: ${selectedPropagationPromptMode?.blocker ?? "server returned no step request"}`);
      return null;
    }
    setPromptFlowKey("propagation");
    setPromptTemplateKey(String(request.body.templateKey ?? "propagation_consequence_scout"));
    setPromptRecordId(String(request.body.recordId ?? propagationRun?.sourceFact.id ?? ""));
    const payload = await api<{ step: PromptOutStep }>(request.href, {
      method: request.method,
      body: JSON.stringify(request.body)
    });
    setPromptStep(payload.step);
    const generated = await api<{ prompt: string; promptOut: { packetIdentity: PromptPacketIdentity; propagationContext?: PropagationPacketContextPreview | null } }>(payload.step.actions.generate.href, {
      method: payload.step.actions.generate.method
    });
    setLoadedPromptAndPacket(
      promptOriginFromPacketIdentity(generated.promptOut.packetIdentity, {
        flowKey: "propagation",
        flowId: originNumber(request.body.flowId) ?? propagationFlowId,
        recordId: propagationRun?.sourceFact.id ?? originNumber(request.body.recordId) ?? null,
        recordShortId: propagationRun?.sourceFact.shortId ?? null,
        recordTypeKey: propagationRun?.sourceFact.recordTypeKey ?? null,
        mode: typeof request.body.mode === "string" ? request.body.mode : selectedPropagationPromptMode?.mode ?? propagationPromptMode,
        admissionLevel: propagationRun?.severityPath.admissionLevel ?? null,
        workScale: propagationRun?.severityPath.workScale ?? null,
        decisionLabel: displayedPropagationContract?.step.localDecision ?? payload.step.label
      }),
      generated.prompt
    );
    setPropagationPacketContext(generated.promptOut.propagationContext ?? null);
    setMessage(`Loaded Propagation Prompt-out step ${payload.step.label} (${payload.step.mode === "proposal" ? "Proposal mode" : "Pressure mode"})`);
    return payload.step;
  };

  const loadCurrentPropagationPacket = async () => {
    const request = propagationRun?.packetCurrentness.pressure.freshPacket;
    if (!request) return null;
    try {
      setPropagationPromptMode("pressure");
      setPromptFlowKey("propagation");
      setPromptTemplateKey(String(request.body.templateKey ?? "propagation_consequence_scout"));
      setPromptRecordId(String(request.body.recordId ?? propagationRun.sourceFact.id));
      const payload = await api<{ step: PromptOutStep }>(request.href, {
        method: request.method,
        body: JSON.stringify(request.body)
      });
      setPromptStep(payload.step);
      const generated = await api<{ prompt: string; promptOut: { packetIdentity: PromptPacketIdentity; propagationContext?: PropagationPacketContextPreview | null } }>(payload.step.actions.generate.href, {
        method: payload.step.actions.generate.method
      });
      setLoadedPromptAndPacket(promptOriginFromPacketIdentity(generated.promptOut.packetIdentity, {
        flowKey: "propagation",
        flowId: propagationRun.flow.id,
        recordId: propagationRun.sourceFact.id,
        recordShortId: propagationRun.sourceFact.shortId,
        recordTypeKey: propagationRun.sourceFact.recordTypeKey,
        mode: "pressure",
        admissionLevel: propagationRun.severityPath.admissionLevel,
        workScale: propagationRun.severityPath.workScale,
        activeSetRevision: propagationRun.activeSet.revision,
        decisionLabel: displayedPropagationContract?.step.localDecision ?? payload.step.label
      }), generated.prompt);
      setPropagationPacketContext(generated.promptOut.propagationContext ?? null);
      setPropagationRevisionErrors((current) => ({ ...current, pressure: "" }));
      setMessage(`Loaded current Propagation Pressure packet at active-set revision ${propagationRun.activeSet.revision}`);
      return payload.step;
    } catch (error) {
      const message = apiErrorMessage(error);
      setPropagationRevisionErrors((current) => ({ ...current, pressure: message }));
      setMessage(message);
      return null;
    }
  };

  const skipCurrentPropagationPressure = async () => {
    if (!propagationRun) return;
    try {
      const payload = await api<{ record: RecordRow }>(propagationRun.packetCurrentness.pressure.skip.href, {
        method: propagationRun.packetCurrentness.pressure.skip.method,
        body: JSON.stringify({ reason: propagationPressureSkipReason || undefined })
      });
      setPropagationPressureSkipReason("");
      setPropagationRevisionErrors((current) => ({ ...current, pressure: "", close: "" }));
      await loadPropagationRun(propagationRun.flow.id);
      setMessage(`Recorded governed Pressure skip ${payload.record.shortId}`);
    } catch (error) {
      const message = apiErrorMessage(error);
      setPropagationRevisionErrors((current) => ({ ...current, pressure: message }));
      setMessage(message);
    }
  };

  const ensurePromptStep = async () => promptStep ?? loadPromptStep();

  const generatePrompt = async () => {
    const promptStep = await ensurePromptStep();
    const payload = await api<{ prompt: string; promptOut: { packetIdentity: PromptPacketIdentity; propagationContext?: PropagationPacketContextPreview | null } }>(promptStep.actions.generate.href, { method: promptStep.actions.generate.method });
    setLoadedPromptAndPacket(promptOriginFromPacketIdentity(payload.promptOut.packetIdentity, {
      decisionLabel: promptStep.label
    }), payload.prompt);
    setPropagationPacketContext(payload.promptOut.propagationContext ?? null);
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
    if (!canUseCurrentPromptPacket) {
      setMessage("Prompt packet body is stale or unbound; load or generate the current packet before storing advisory material.");
      return;
    }
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
    if (promptStep.context.flowKey === "temporal_timeline" && temporalFlowId != null) {
      await refreshTemporalRun(temporalFlowId);
    }
    setMessage(`Stored ${artifact.record.shortId}`);
  };

  const applyCreationDecisionPayload = (
    payload: { flow: { id: number; kernel_record_id?: number | null }; decisionPoint: CreationDecisionPoint }
  ) => {
    setFlowId(payload.flow.id);
    const nextKernelRecordId = payload.flow.kernel_record_id ?? payload.decisionPoint.currentKernel?.id ?? null;
    if (nextKernelRecordId != null) setKernelRecordId(nextKernelRecordId);
    const nextSection = payload.decisionPoint.selectedSection ?? payload.decisionPoint.sectionPrompts[0] ?? null;
    if (nextSection) {
      setKernelHeading(nextSection.heading);
      setKernelBody(nextSection.savedBody);
    }
    setConsequenceMode(payload.decisionPoint.consequenceMode.saved ?? "");
    setCreationDecision(payload.decisionPoint);
    setCreationStartError(null);
  };

  const startFlow = async () => {
    try {
      setCreationStartPending(true);
      const payload = await api<{ flow: { id: number; kernel_record_id?: number }; decisionPoint: CreationDecisionPoint }>("/api/flows/creation/start", { method: "POST" });
      applyCreationDecisionPayload(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setCreationStartError(message);
      setMessage(message);
    } finally {
      setCreationStartPending(false);
    }
  };

  const autoStartCreationFlow = async () => {
    try {
      setCreationStartPending(true);
      const payload = await api<{ flow: { id: number; kernel_record_id?: number }; decisionPoint: CreationDecisionPoint }>("/api/flows/creation/start", { method: "POST" });
      applyCreationDecisionPayload(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setCreationStartError(message);
      setMessage(message);
    } finally {
      setCreationStartPending(false);
    }
  };

  useEffect(() => {
    if (!openWorld || activeDestination !== "creation" || flowId != null || creationStartPending || creationAutoStartAttempted) return;
    setCreationAutoStartAttempted(true);
    void autoStartCreationFlow();
  }, [activeDestination, creationAutoStartAttempted, creationStartPending, flowId, openWorld]);

  const handleKernelHeadingChange = (nextHeading: string) => {
    const currentSavedBody = selectedSectionContract?.savedBody ?? "";
    let drafts = kernelSectionDrafts;
    if (kernelBody !== currentSavedBody) {
      drafts = { ...kernelSectionDrafts, [kernelSectionDraftKey]: kernelBody };
      setKernelSectionDrafts(drafts);
    }
    const nextSection = displayedCreationDecision.sectionPrompts.find((section) => section.heading === nextHeading);
    const nextKey = kernelSectionDraftKeyFor(kernelDraftRecordId, nextHeading);
    setKernelHeading(nextHeading);
    setKernelBody(drafts[nextKey] ?? nextSection?.savedBody ?? "");
  };

  const updateKernelBody = (body: string) => {
    setKernelBody(body);
    setKernelSectionDrafts((current) => ({ ...current, [kernelSectionDraftKey]: body }));
  };

  const saveKernelStep = async () => {
    if (flowId == null) return;
    const payload = await api<{ kernel: { id: number }; decisionPoint: CreationDecisionPoint }>("/api/flows/creation/kernel-step", {
      method: "POST",
      body: JSON.stringify({ flowId, heading: kernelHeading, body: kernelBody, consequenceMode: consequenceMode || undefined })
    });
    setKernelRecordId(payload.kernel.id);
    setCreationDecision(payload.decisionPoint);
    setKernelSectionDrafts((current) => {
      const next = { ...current };
      delete next[kernelSectionDraftKeyFor(payload.kernel.id, kernelHeading)];
      delete next[kernelSectionDraftKeyFor(kernelDraftRecordId, kernelHeading)];
      return next;
    });
    setConsequenceMode(payload.decisionPoint.consequenceMode.saved ?? consequenceMode);
    setKernelBody(payload.decisionPoint.selectedSection?.savedBody ?? kernelBody);
    await loadWorldData();
  };

  const skipPrompt = async () => {
    const promptStep = await ensurePromptStep();
    const stage12 = promptStep.context.flowKey === "institutional_economic_suppression";
    const constraint = promptStep.context.flowKey === "constraint_composition";
    const temporal = promptStep.context.flowKey === "temporal_timeline";
    await api(promptStep.actions.skip.href, {
      method: promptStep.actions.skip.method,
      body: JSON.stringify({
        reason: gateNotApplicable || undefined,
        unresolved: stage12 ? stage12SkipUnresolved : constraint ? constraintSkipUnresolved : temporal ? temporalSkipUnresolved : undefined,
        debtName: stage12 && stage12SkipUnresolved
          ? (canonDebtName || "Stage-12 skipped-work debt")
          : constraint && constraintSkipUnresolved
            ? (canonDebtName || "Constraint Composition skipped-work debt")
            : temporal && temporalSkipUnresolved
              ? (canonDebtName || "Temporal/Timeline skipped-work debt")
              : undefined,
        workScale: constraint || temporal ? (workScale || undefined) : undefined
      })
    });
    await loadWorldData();
    if (constraintFlowId != null) await refreshConstraintRun(constraintFlowId);
    if (temporalFlowId != null) await refreshTemporalRun(temporalFlowId);
  };

  const decompose = async () => {
    if (flowId == null || kernelRecordId == null) return;
    try {
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
      setDecompositionError(null);
      setSeedTitle("");
      setSeedBody("");
      setGranularityRationale("");
      setGranularityConfirmed(false);
      setAdmissionIntent("");
      await loadWorldData();
    } catch (error) {
      if (error instanceof ApiError) {
        const payload = error.payload as { error?: string; decisionPoint?: CreationDecisionPoint };
        if (payload.decisionPoint) setCreationDecision(payload.decisionPoint);
        setDecompositionError(payload.error ?? error.message);
        setMessage(payload.error ?? error.message);
        return;
      }
      throw error;
    }
  };

  const updateCoverageBootstrapRow = (index: number, patch: Partial<CreationCoverageBootstrapRowDraft>) => {
    setCoverageBootstrapRows((current) => current.map((row, rowIndex) =>
      rowIndex === index ? { ...row, ...patch } : row
    ));
    setCoverageBootstrapError(null);
  };

  const addCoverageBootstrapRow = () => {
    setCoverageBootstrapRows((current) => [...current, emptyCreationCoverageBootstrapRow()]);
    setCoverageBootstrapError(null);
  };

  const setCoverageBootstrapSubmitError = (error: unknown) => {
    const message = apiErrorMessage(error);
    setCoverageBootstrapError(message);
    setMessage(message);
  };

  const submitCoverageBootstrap = async () => {
    const action = displayedCreationCoverage.createOrConfirmPath;
    if (!action) return;
    try {
      const payload = await api<{ coverage: CreationCoverageInventory }>(action.href, {
        method: action.method,
        body: JSON.stringify({
          kernelRecordId: action.body.kernelRecordId,
          seedDecompositionReportId: action.body.seedDecompositionReportId ?? creationDecisionHandoff.seedDecompositionReport?.id ?? undefined,
          rows: coverageBootstrapRows.map((row) => ({
            label: row.label,
            sourceKernelContext: row.sourceKernelContext,
            required: row.required
          }))
        })
      });
      setCreationDecision((current) => current ? { ...current, coverageInventory: payload.coverage } : current);
      setCoverageBootstrapRows([emptyCreationCoverageBootstrapRow()]);
      setCoverageBootstrapError(null);
      await startFlow();
      await loadWorldData();
    } catch (error) {
      setCoverageBootstrapSubmitError(error);
    }
  };

  const coverageDraftFor = (rowId: number): CreationCoverageDraft =>
    coverageDrafts[rowId] ?? emptyCreationCoverageDraft;

  const updateCoverageDraft = (rowId: number, patch: Partial<CreationCoverageDraft>) => {
    setCoverageDrafts((current) => ({
      ...current,
      [rowId]: {
        ...emptyCreationCoverageDraft,
        ...current[rowId],
        ...patch
      }
    }));
  };

  const setCoverageDraftError = (rowId: number, error: unknown) => {
    const message = apiErrorMessage(error);
    updateCoverageDraft(rowId, { error: message });
    setMessage(message);
  };

  const applyCoverageMutation = async (coverage: CreationCoverageInventory, rowId: number) => {
    setCreationDecision((current) => current ? { ...current, coverageInventory: coverage } : current);
    updateCoverageDraft(rowId, { error: null });
    await startFlow();
    await loadWorldData();
  };

  const submitCoverageLink = async (row: CreationCoverageInventory["rows"][number]) => {
    const draft = coverageDraftFor(row.id);
    const seedRecordIds = parseTextList(draft.seedRecordIds)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));
    try {
      const payload = await api<{ coverage: CreationCoverageInventory }>(row.actions.link.href, {
        method: row.actions.link.method,
        body: JSON.stringify({
          rowId: row.id,
          seedRecordIds,
          seedDecompositionReportId: row.seedDecompositionReport?.id ?? creationDecisionHandoff.seedDecompositionReport?.id ?? undefined,
          expectedDisposition: row.disposition,
          rationale: draft.rationale || undefined
        })
      });
      await applyCoverageMutation(payload.coverage, row.id);
    } catch (error) {
      setCoverageDraftError(row.id, error);
    }
  };

  const submitCoverageDefer = async (row: CreationCoverageInventory["rows"][number]) => {
    const draft = coverageDraftFor(row.id);
    try {
      const payload = await api<{ coverage: CreationCoverageInventory }>(row.actions.defer.href, {
        method: row.actions.defer.method,
        body: JSON.stringify({ rowId: row.id, rationale: draft.rationale, expectedDisposition: row.disposition })
      });
      await applyCoverageMutation(payload.coverage, row.id);
    } catch (error) {
      setCoverageDraftError(row.id, error);
    }
  };

  const submitCoverageOutOfScope = async (row: CreationCoverageInventory["rows"][number]) => {
    const draft = coverageDraftFor(row.id);
    try {
      const payload = await api<{ coverage: CreationCoverageInventory }>(row.actions.outOfScope.href, {
        method: row.actions.outOfScope.method,
        body: JSON.stringify({ rowId: row.id, rationale: draft.rationale, expectedDisposition: row.disposition })
      });
      await applyCoverageMutation(payload.coverage, row.id);
    } catch (error) {
      setCoverageDraftError(row.id, error);
    }
  };

  const correctionDraftFor = (seedRecordId: number): CreationCorrectionDraft =>
    correctionDrafts[seedRecordId] ?? emptyCreationCorrectionDraft;

  const updateCorrectionDraft = (seedRecordId: number, patch: Partial<CreationCorrectionDraft>) => {
    setCorrectionDrafts((current) => ({
      ...current,
      [seedRecordId]: {
        ...emptyCreationCorrectionDraft,
        ...current[seedRecordId],
        ...patch
      }
    }));
  };

  const correctionPayloadFor = (seedRecordId: number, draft: CreationCorrectionDraft): Record<string, unknown> => {
    const payload: Record<string, unknown> = {
      seedRecordId,
      action: draft.action,
      rationale: draft.rationale
    };
    if (draft.action === "split") {
      payload.siblings = [
        { title: draft.siblingTitle, body: draft.siblingBody, truthLayer: draft.siblingTruthLayer },
        ...(draft.secondSiblingTitle.trim() || draft.secondSiblingBody.trim() || draft.secondSiblingTruthLayer.trim()
          ? [{ title: draft.secondSiblingTitle, body: draft.secondSiblingBody, truthLayer: draft.secondSiblingTruthLayer }]
          : [])
      ];
    }
    if (draft.action === "retract_and_rewrite" || draft.action === "replace") {
      payload.replacement = {
        title: draft.replacementTitle,
        body: draft.replacementBody,
        truthLayer: draft.replacementTruthLayer
      };
    }
    if (draft.action === "admission_narrowing_note") {
      payload.narrowingNote = draft.narrowingNote;
    }
    return payload;
  };

  const submitCreationCorrection = async (seedRecordId: number) => {
    const draft = correctionDraftFor(seedRecordId);
    try {
      const payload = await api<CreationCorrectionResponse>("/api/flows/creation/corrections", {
        method: "POST",
        body: JSON.stringify(correctionPayloadFor(seedRecordId, draft))
      });
      setCorrectionError((current) => {
        const next = { ...current };
        delete next[seedRecordId];
        return next;
      });
      setCreationDecision((current) => payload.decisionPoint ?? (current
        ? { ...current, handoff: payload.handoff, readSideTrail: payload.readSideTrail ?? current.readSideTrail }
        : current));
      setAdmissionQueue(payload.admissionQueue ?? admissionQueue);
      setMessage("Creation correction applied; Admission queue and read-side trail refreshed.");
      await loadWorldData();
    } catch (error) {
      if (error instanceof ApiError) {
        const payload = error.payload as { error?: string; validationErrors?: Array<{ key: string; message: string }> };
        const messages = payload.validationErrors?.length
          ? payload.validationErrors.map((entry) => `${entry.key}: ${entry.message}`)
          : [payload.error ?? error.message];
        setCorrectionError((current) => ({ ...current, [seedRecordId]: messages }));
        setMessage(payload.error ?? error.message);
        return;
      }
      throw error;
    }
  };

  const loadMinimalViableWorld = async () => {
    const payload = await api<MinimalViableWorldState>("/api/flows/creation/minimal-viable-world");
    setMinimalViableWorld(payload);
    return payload;
  };

  const loadMinimalViableWorldPromptStep = async () => {
    const checkpointState = minimalViableWorld;
    const mode = checkpointState?.decisionPoint.sharedContract.promptOut.modes.find((mode) => mode.availability === "available" && mode.stepRequest);
    const request = mode?.stepRequest;
    if (!checkpointState || !request) return null;
    setPromptFlowKey("creation");
    setPromptTemplateKey(String(request.body.templateKey ?? "minimal_viable_world_checkpoint"));
    setPromptRecordId(String(request.body.recordId ?? ""));
    const payload = await api<{ step: PromptOutStep }>(request.href, {
      method: request.method,
      body: JSON.stringify(request.body)
    });
    setPromptStep(payload.step);
    setLoadedPromptAndPacket(
      promptOriginFromPacketIdentity(payload.step.packetIdentity, {
        flowKey: "creation",
        recordId: originNumber(request.body.recordId),
        mode: typeof request.body.mode === "string" ? request.body.mode : null,
        decisionLabel: checkpointState.decisionPoint.sharedContract.step.localDecision
      }),
      checkpointState.decisionPoint.sharedContract.bearingContext.displayed.join("\n")
    );
    setMessage(`Loaded Minimal Viable World Prompt-out step ${payload.step.label}`);
    return payload.step;
  };

  const recordMinimalViableWorldDisposition = async () => {
    if (!minimalSeedRecordId || !minimalDimensionKey || !minimalDispositionSubstance.trim()) return;
    await api("/api/flows/creation/minimal-viable-world/dispositions", {
      method: "POST",
      body: JSON.stringify({
        reportId: minimalViableWorld?.checkpoint.report?.id,
        dispositions: [{
          seedRecordId: Number(minimalSeedRecordId),
          dimensionKey: minimalDimensionKey,
          disposition: minimalDisposition,
          substance: minimalDispositionSubstance,
          evidenceRecordIds: parseNumberList(minimalEvidenceRecordIds),
          protectedRecordId: optionalNumber(minimalProtectedRecordId),
          deferral: minimalDeferralKind === "skip"
            ? { kind: "skip", stepKey: minimalDeferralStep || undefined }
            : minimalDeferralKind === "canon_debt"
              ? { kind: "canon_debt", debtName: minimalDebtName || "Minimal Viable World checkpoint debt" }
              : undefined
        }]
      })
    });
    setMinimalDispositionSubstance("");
    setMinimalEvidenceRecordIds("");
    setMinimalProtectedRecordId("");
    setMinimalDebtName("");
    await loadMinimalViableWorld();
    await loadWorldData();
  };

  const routeMinimalViableWorldProposal = async () => {
    const reportId = minimalViableWorld?.checkpoint.report?.id;
    if (reportId == null || !minimalProposalTitle.trim() || !minimalProposalBody.trim()) return;
    await api("/api/flows/creation/minimal-viable-world/admission-proposals", {
      method: "POST",
      body: JSON.stringify({
        reportId,
        seedRecordId: optionalNumber(minimalProposalSeedRecordId),
        title: minimalProposalTitle,
        body: minimalProposalBody,
        truthLayer: minimalProposalTruthLayer || "Objective canon"
      })
    });
    setMinimalProposalTitle("");
    setMinimalProposalBody("");
    await loadMinimalViableWorld();
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

  const completeAdmission = async (canonStatusOverride?: string) => {
    if (!admissionRecordId) return;
    const contract = admissionDecision?.severity.gatePath === "full_gate" ? admissionDecision.fullGateContract ?? null : null;
    if (contract && (!gateFinalReviewIsCurrent || !gateFinalReview)) {
      setMessage("Final review required before completion.");
      return;
    }
    const reviewedPayload = contract ? gateFinalReview?.payload ?? null : null;
    if (contract && !reviewedPayload) {
      setMessage("Final review required before completion.");
      return;
    }
    if (contract && canonStatusOverride && reviewedPayload!.canonStatus !== canonStatusOverride) {
      setMessage("Final review required before completion.");
      return;
    }
    const completionPayload = reviewedPayload ?? buildAdmissionGateCompletionPayload(canonStatusOverride);
    try {
      const payload = await api<{ decisionPoint: AdmissionDecisionPoint; readback?: AdmissionCompletionReadback }>("/api/admission/gate/complete", {
        method: "POST",
        body: JSON.stringify(completionPayload)
      });
      setAdmissionValidationErrors([]);
      setGateFinalReview(null);
      applyAdmissionDecision(payload.decisionPoint);
      setAdmissionCompletionReadback(payload.readback ?? null);
      await loadWorldData();
    } catch (error) {
      if (error instanceof ApiError) {
        const payload = error.payload as { error?: string; validationErrors?: AdmissionValidationError[]; decisionPoint?: AdmissionDecisionPoint };
        setAdmissionValidationErrors(payload.validationErrors ?? []);
        if (payload.decisionPoint) applyAdmissionDecision(payload.decisionPoint);
        setMessage(payload.error ?? error.message);
        return;
      }
      throw error;
    }
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

  const applyPropagationRun = (payload: PropagationRunPayload) => {
    setPropagationRun(payload);
    setPropagationPlan(payload.plan);
    setPropagationDecisionPoint(payload.decisionPoint ?? payload.plan.decisionPoint ?? null);
    setPropagationConsequences(payload.consequences);
    setPropagationDomains(payload.domainSweeps);
    setPropagationDispositions(payload.dispositions);
    setPropagationFlowId(payload.flow.id);
    setPropagationFactId(String(payload.flow.propagation_fact_record_id));
    setPropagationDebtId(payload.flow.propagation_debt_record_id == null ? "" : String(payload.flow.propagation_debt_record_id));
    setPropagationDomainName(payload.plan.domainAtlas?.[0]?.name ?? payload.plan.domains[0] ?? "");
    setPropagationOrderKey(payload.plan.orderControls?.[1]?.key ?? payload.plan.orders[1]?.key ?? payload.plan.orders[0]?.key ?? "first");
  };

  const loadPropagationRun = async (flowId: number) => {
    applyPropagationRun(await api<PropagationRunPayload>(`/api/propagation/runs/${flowId}`));
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

  const startPropagationFromQueue = async (item: PropagationQueueRow) => {
    if (!item.route) return;
    const payload = await api<{ flow: { id: number } }>(item.route.href, {
      method: item.route.method,
      body: JSON.stringify(item.route.body)
    });
    setPropagationFactId(String(item.route.body.factRecordId));
    setPropagationDebtId(item.route.body.debtRecordId == null ? "" : String(item.route.body.debtRecordId));
    setPropagationFlowId(payload.flow.id);
    await loadPropagationRun(payload.flow.id);
    await loadWorldData();
  };

  const loadPropagationPlan = async () => {
    if (!propagationFactId) return;
    const payload = await api<{ plan: PropagationPlan }>(`/api/propagation/records/${propagationFactId}/plan`);
    setPropagationRun(null);
    setPropagationPlan(payload.plan);
    setPropagationDecisionPoint(payload.plan.decisionPoint ?? null);
    setPropagationDomainName(payload.plan.domainAtlas?.[0]?.name ?? payload.plan.domains[0] ?? "");
    setPropagationOrderKey(payload.plan.orderControls?.[1]?.key ?? payload.plan.orders[1]?.key ?? payload.plan.orders[0]?.key ?? "first");
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

  const revisePropagationConsequence = async (consequence: PropagationConsequence, draft: ConsequenceRevisionInput) => {
    if (propagationFlowId == null) return;
    const payload = await api<PropagationRunPayload>(`/api/propagation/consequences/${consequence.id}/revisions`, {
      method: "POST",
      body: JSON.stringify({
        flowId: propagationFlowId,
        reason: draft.reason,
        orderKey: draft.orderKey,
        domainName: draft.domainName || undefined,
        body: draft.body,
        pressure: draft.pressure
      })
    });
    await loadPropagationRun(payload.flow.id);
  };

  const retractPropagationConsequence = async (consequence: PropagationConsequence, reason: string) => {
    if (propagationFlowId == null) return;
    const payload = await api<PropagationRunPayload>(`/api/propagation/consequences/${consequence.id}/retract`, {
      method: "POST",
      body: JSON.stringify({ flowId: propagationFlowId, reason })
    });
    await loadPropagationRun(payload.flow.id);
  };

  const revisePropagationDomain = async (domainRow: PropagationDomain, draft: DomainRevisionInput) => {
    if (propagationFlowId == null) return;
    const payload = await api<PropagationRunPayload>(`/api/propagation/domains/${domainRow.id}/revisions`, {
      method: "POST",
      body: JSON.stringify({
        flowId: propagationFlowId,
        reason: draft.reason,
        triage: draft.triage,
        declaration: draft.declaration
      })
    });
    await loadPropagationRun(payload.flow.id);
  };

  const retractPropagationDomain = async (domainRow: PropagationDomain, reason: string) => {
    if (propagationFlowId == null) return;
    const payload = await api<PropagationRunPayload>(`/api/propagation/domains/${domainRow.id}/retract`, {
      method: "POST",
      body: JSON.stringify({ flowId: propagationFlowId, reason })
    });
    await loadPropagationRun(payload.flow.id);
  };

  const savePropagationDisposition = async () => {
    if (!propagationConsequenceId) return;
    try {
      const payload = await api<PropagationRunPayload>("/api/propagation/dispositions", {
        method: "POST",
        body: JSON.stringify({
          consequenceId: Number(propagationConsequenceId),
          disposition: propagationDispositionTerm,
          note: propagationDispositionNote,
          debtName: propagationDispositionTerm === "assigned as canon debt" ? propagationDebtName : undefined,
          preservationBoundary: propagationDispositionTerm === "protected as a mystery boundary" ? propagationPreservationBoundary : undefined
        })
      });
      setPropagationRevisionErrors((current) => ({ ...current, disposition: "", close: "" }));
      setPropagationDispositionNote("");
      setPropagationDebtName("");
      setPropagationPreservationBoundary("");
      await loadPropagationRun(payload.flow.id);
      await loadWorldData();
    } catch (error) {
      const message = apiErrorMessage(error);
      setPropagationRevisionErrors((current) => ({ ...current, disposition: message }));
      setMessage(message);
    }
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
    try {
      const payload = await api<{ report: RecordRow }>(`/api/propagation/runs/${propagationFlowId}/close`, { method: "POST" });
      setPropagationRevisionErrors((current) => ({ ...current, close: "" }));
      setMessage(`Closed propagation run with ${payload.report.shortId}`);
      await loadPropagationRun(propagationFlowId);
      await loadWorldData();
    } catch (error) {
      setPropagationRevisionErrors((current) => ({
        ...current,
        close: error instanceof Error ? error.message : "Propagation close was refused."
      }));
      await loadPropagationRun(propagationFlowId);
    }
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
        reason: temporalSkipReason || undefined,
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

  const applyTemporalRun = (payload: TemporalRun) => {
    setTemporalRun(payload);
    setTemporalFlowId(payload.flow.id);
    if (payload.source.sourceRecordId != null) setTemporalSourceRecordId(String(payload.source.sourceRecordId));
    setTemporalSubject(payload.source.auditedSubject);
    if (payload.coverage) setTemporalCoverage(payload.coverage);
    setTemporalFinalizationPreview(payload.closePreview);
  };

  const refreshTemporalRun = async (flowId = temporalFlowId) => {
    if (flowId == null) return;
    applyTemporalRun(await api<TemporalRun>(`/api/temporal/runs/${flowId}`));
  };

  const loadTemporalPromptStep = async (
    mode: "proposal" | "pressure",
    requestOverride?: TemporalPromptModeOffer["stepRequest"]
  ) => {
    setTemporalPromptMode(mode);
    const offer = temporalPromptModes.find((item) => item.mode === mode) ?? null;
    const request = requestOverride ?? offer?.stepRequest ?? null;
    if (!request || offer?.availability === "blocked" || offer?.available === false) {
      const message = offer?.blocker ?? `The server returned no current ${mode} packet action.`;
      setTemporalPromptError({ message, remediation: "Preserve this mode, complete the named server blocker, refresh the Temporal run, and recover the current packet." });
      return;
    }
    try {
      setTemporalPromptError(null);
      setPromptFlowKey("temporal_timeline");
      setPromptTemplateKey(String(request.body.templateKey ?? "temporal_spatial_analyst"));
      if (request.body.recordId != null) setPromptRecordId(String(request.body.recordId));
      const stepPayload = await api<{ step: PromptOutStep }>(request.href, {
        method: request.method,
        body: JSON.stringify(request.body)
      });
      setPromptStep(stepPayload.step);
      const generated = await api<{
        prompt: string;
        promptOut: { packetIdentity: PromptPacketIdentity; temporalContext: TemporalPacketContextView };
      }>(stepPayload.step.actions.generate.href, { method: stepPayload.step.actions.generate.method });
      setLoadedPromptAndPacket(promptOriginFromPacketIdentity(generated.promptOut.packetIdentity, {
        decisionLabel: temporalRun?.decisionPoint?.sharedContract.step.localDecision ?? stepPayload.step.label,
        mode
      }), generated.prompt);
      setTemporalPacketContext(generated.promptOut.temporalContext);
      setMessage(`Loaded current Temporal ${mode === "proposal" ? "Proposal" : "Pressure"} packet.`);
    } catch (error) {
      const payload = error instanceof ApiError ? error.payload as { error?: string; remediation?: string } : null;
      const message = payload?.error ?? apiErrorMessage(error);
      const remediation = payload?.remediation ?? "Preserve the selected mode, refresh the Temporal run, and use the server-provided current-packet recovery action.";
      setTemporalPromptError({ message, remediation });
      setMessage(message);
      if (temporalFlowId != null) await refreshTemporalRun(temporalFlowId);
    }
  };

  const recoverTemporalPromptPacket = async () => {
    if (temporalFlowId == null) return;
    const fresh = await api<TemporalRun>(`/api/temporal/runs/${temporalFlowId}`);
    applyTemporalRun(fresh);
    const recovery = (fresh.decisionPoint?.sharedContract.promptOut.modes ?? [])
      .find((mode) => mode.mode === temporalPromptMode)?.stepRequest as TemporalPromptModeOffer["stepRequest"] | undefined;
    await loadTemporalPromptStep(temporalPromptMode, recovery ?? null);
  };

  const temporalStartPayload = () => {
    if (temporalSourceType === "material") {
      return {
        sourceType: temporalSourceType,
        materialTitle: temporalMaterialTitle,
        materialBody: temporalMaterialBody,
        auditedSubject: temporalSubject || undefined
      };
    }
    if (temporalSourceType === "pass_report") {
      return { sourceType: temporalSourceType, reportRecordId: Number(temporalSourceRecordId) };
    }
    return {
      sourceType: temporalSourceType,
      recordId: Number(temporalSourceRecordId),
      auditedSubject: temporalSubject || undefined
    };
  };

  const startTemporalRun = async () => {
    const payload = await api<TemporalRun>("/api/temporal/runs/start", {
      method: "POST",
      body: JSON.stringify(temporalStartPayload())
    });
    applyTemporalRun(payload);
    setPromptFlowKey("temporal_timeline");
    setPromptTemplateKey("temporal_spatial_analyst");
    if (payload.promptOut.sourceRecordId != null) setPromptRecordId(String(payload.promptOut.sourceRecordId));
    await loadWorldData();
  };

  const saveTemporalCoverage = async () => {
    if (temporalFlowId == null) return;
    await api("/api/temporal/coverage", {
      method: "POST",
      body: JSON.stringify({ flowId: temporalFlowId, ...temporalCoverage })
    });
    await refreshTemporalRun(temporalFlowId);
  };

  const reviseTemporalCoverage = async (input: { expectedRevisionId: number; reason: string; coverage: TemporalCoverage }) => {
    if (temporalFlowId == null) return;
    await api(`/api/temporal/runs/${temporalFlowId}/revisions`, {
      method: "POST",
      body: JSON.stringify({ expectedRevisionId: input.expectedRevisionId, reason: input.reason, ...input.coverage })
    });
    await refreshTemporalRun(temporalFlowId);
  };

  const recoverTemporalCoverage = async (): Promise<TemporalCoverage | null> => {
    if (temporalFlowId == null) return null;
    const payload = await api<TemporalRun & { recovery: { authoritativeRevisionId: number | null } }>(`/api/temporal/runs/${temporalFlowId}/recover`, { method: "POST" });
    applyTemporalRun(payload);
    return payload.revisionState.active?.values ?? null;
  };

  const previewTemporalFinalization = async () => {
    if (temporalFlowId == null) return;
    setTemporalFinalizationPreview(await api<TemporalFinalizationPreview>(`/api/temporal/runs/${temporalFlowId}/preview`, { method: "POST" }));
  };

  const createOrLinkTemporalCard = async () => {
    if (temporalFlowId == null) return;
    await api("/api/temporal/cards", {
      method: "POST",
      body: JSON.stringify({
        flowId: temporalFlowId,
        existingRecordId: temporalExistingCardId ? Number(temporalExistingCardId) : undefined,
        title: recordForm.title || undefined,
        body: recordForm.body || undefined,
        truthLayer: recordForm.truthLayer || undefined,
        canonStatus: recordForm.canonStatus || undefined,
        relation: temporalCardRelation || undefined,
        advisoryRecordId: temporalAdvisoryRecordId ? Number(temporalAdvisoryRecordId) : undefined
      })
    });
    await refreshTemporalRun(temporalFlowId);
    await loadWorldData();
  };

  const routeTemporalProposal = async () => {
    if (temporalFlowId == null) return;
    await api("/api/temporal/proposals", {
      method: "POST",
      body: JSON.stringify({
        flowId: temporalFlowId,
        sourceStep: temporalSourceStep,
        title: recordForm.title,
        body: recordForm.body || temporalCoverage.outcomeDecision || temporalCoverage.firstTrueOrRelativeSequence,
        truthLayer: recordForm.truthLayer || undefined,
        advisoryRecordId: temporalAdvisoryRecordId ? Number(temporalAdvisoryRecordId) : undefined
      })
    });
    await refreshTemporalRun(temporalFlowId);
    await loadWorldData();
  };

  const mintTemporalDebt = async () => {
    if (temporalFlowId == null) return;
    await api("/api/temporal/debt", {
      method: "POST",
      body: JSON.stringify({
        flowId: temporalFlowId,
        sourceStep: temporalSourceStep,
        name: canonDebtName || recordForm.title || "Temporal/Timeline follow-up debt",
        reason: gateNotApplicable || temporalCoverage.outcomeDecision || temporalCoverage.temporalMysteryBoundaries,
        advisoryRecordId: temporalAdvisoryRecordId ? Number(temporalAdvisoryRecordId) : undefined
      })
    });
    await refreshTemporalRun(temporalFlowId);
    await loadWorldData();
  };

  const recordTemporalSkip = async () => {
    if (temporalFlowId == null) return;
    const payload = await api<{ step: PromptOutStep }>("/api/prompt-out/steps", {
      method: "POST",
      body: JSON.stringify({
        flowKey: "temporal_timeline",
        flowId: temporalFlowId,
        templateKey: "temporal_spatial_analyst",
        recordId: optionalNumber(temporalSourceRecordId),
        stepKey: temporalSkipStep,
        mode: temporalPromptMode,
        label: "Spatial-temporal analyst",
        workScale: workScale || undefined
      })
    });
    await api(payload.step.actions.skip.href, {
      method: payload.step.actions.skip.method,
      body: JSON.stringify({
        reason: gateNotApplicable || undefined,
        unresolved: temporalSkipUnresolved,
        debtName: temporalSkipUnresolved ? (canonDebtName || "Temporal/Timeline skipped-work debt") : undefined,
        workScale: workScale || undefined
      })
    });
    setPromptStep(payload.step);
    await refreshTemporalRun(temporalFlowId);
    await loadWorldData();
  };

  const closeTemporalRun = async () => {
    if (temporalFlowId == null) return;
    const payload = await api<TemporalRun>(`/api/temporal/runs/${temporalFlowId}/close`, { method: "POST" });
    applyTemporalRun(payload);
    setMessage(`Closed Temporal/Timeline run with ${payload.report?.shortId ?? "the final report"}`);
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

  const minimalViableWorldIsOwed = minimalViableWorld?.checkpoint.owed === true;
  const minimalViableWorldStatus = minimalViableWorld
    ? `${minimalViableWorld.checkpoint.owed ? "owed" : "not owed"} · close ${minimalViableWorld.checkpoint.closeReadiness.status}`
    : "No checkpoint state loaded";
  const minimalViableWorldUnlockReason = minimalViableWorld?.checkpoint.blockers.find((blocker) =>
    blocker.key === "no_admitted_seed_facts" || blocker.requires?.includes("admitted seed")
  )?.message ?? "Admitted seed evidence unlocks this checkpoint.";

  const minimalViableWorldCheckpointHeader = (includeReport = false) => (
    <div className="row">
      <button onClick={loadMinimalViableWorld} disabled={!openWorld}>Refresh Checkpoint</button>
      <span className="status">{minimalViableWorldStatus}</span>
      {includeReport && minimalViableWorld?.checkpoint.report && <span className="status">{minimalViableWorld.checkpoint.report.shortId}</span>}
    </div>
  );

  const activeCreationStatePanel = (
    <section className="subpanel active-creation-state">
      <h3>Active Creation state</h3>
      <p>Active now: {displayedCreationDecision.localDecision}</p>
      <div className="chips">
        <span>Current step: {displayedCreationDecision.nextOrResumeState.currentStep}</span>
        <span>Next: {displayedCreationDecision.nextOrResumeState.nextStep}</span>
        <span>Safe exit/resume: {displayedCreationDecision.nextOrResumeState.safeExit}</span>
      </div>
    </section>
  );

  const minimalViableWorldCompactPanel = (
    <section className="subpanel minimal-viable-world-checkpoint not-current">
      <h3>Minimal Viable World checkpoint is not current</h3>
      {minimalViableWorldCheckpointHeader()}
      <p>Not current: admitted seed evidence unlocks this checkpoint.</p>
      <p>{minimalViableWorldUnlockReason}</p>
      <p>Unavailable future work, not completed work.</p>
    </section>
  );

  const minimalViableWorldFullPanel = (
    <section className="subpanel minimal-viable-world-checkpoint">
      <h3>Minimal Viable World checkpoint</h3>
      {minimalViableWorldCheckpointHeader(true)}
      <DecisionContractPanel title="Minimal Viable World decision contract" contract={displayedMinimalDecision} />
      <div className="grid compact-grid">
        <section>
          <h4>Whole-world signals</h4>
          {(minimalViableWorld?.checkpoint.coverageSignals.wholeWorld ?? []).map((signal) => (
            <p key={signal.key}><strong>{signal.label}</strong>: {signal.status}</p>
          ))}
        </section>
        <section>
          <h4>Close readiness</h4>
          <p>{minimalViableWorld?.checkpoint.closeReadiness.status ?? "not loaded"}</p>
          {(minimalViableWorld?.checkpoint.closeReadiness.blockers ?? []).slice(0, 6).map((blocker) => (
            <p key={blocker.key}>{blocker.label}: {blocker.message}</p>
          ))}
        </section>
        <section>
          <h4>Deferrals and routes</h4>
          <p>Deferred: {minimalViableWorld?.checkpoint.unresolvedDeferrals.length ?? 0}</p>
          <p>Open debt: {minimalViableWorld?.checkpoint.openCanonDebt.length ?? 0}</p>
          <p>Admission proposals: {minimalViableWorld?.checkpoint.admissionProposals.length ?? 0}</p>
          <p>Advisory artifacts: {minimalViableWorld?.checkpoint.advisoryArtifacts.length ?? 0}</p>
        </section>
      </div>
      <div className="records compact">
        {minimalSeedOptions.map((seed) => (
          <article key={seed.id}>
            <button onClick={() => {
              setMinimalSeedRecordId(String(seed.id));
              setMinimalProposalSeedRecordId(String(seed.id));
            }}>Select</button>
            <h3>{seed.shortId}: {seed.title}</h3>
            <p className="meta">{seed.recordTypeKey} · {seed.canonStatus}</p>
            {seed.dimensions.map((dimension) => (
              <p key={`${seed.id}:${dimension.key}`}><strong>{dimension.label}</strong>: {dimension.status} · {dimension.evidence.map((record) => record.shortId).join(", ") || "no evidence"}</p>
            ))}
          </article>
        ))}
      </div>
      <div className="grid">
        <label>Seed<select value={minimalSeedRecordId} onChange={(event) => setMinimalSeedRecordId(event.target.value)}>
          <option></option>
          {minimalSeedOptions.map((seed) => <option key={seed.id} value={seed.id}>{seed.shortId}: {seed.title}</option>)}
        </select></label>
        <label>Dimension<select value={minimalDimensionKey} onChange={(event) => setMinimalDimensionKey(event.target.value)}>
          <option></option>
          {minimalDimensionOptions.map((dimension) => <option key={dimension.key} value={dimension.key}>{dimension.label}</option>)}
        </select></label>
        <label>Disposition<select value={minimalDisposition} onChange={(event) => setMinimalDisposition(event.target.value as "covered" | "deferred" | "protected_mystery")}>
          <option value="covered">covered</option>
          <option value="deferred">deferred</option>
          <option value="protected_mystery">protected mystery</option>
        </select></label>
        <label>Evidence ids<input value={minimalEvidenceRecordIds} onChange={(event) => setMinimalEvidenceRecordIds(event.target.value)} /></label>
        <label>Protected record id<input value={minimalProtectedRecordId} onChange={(event) => setMinimalProtectedRecordId(event.target.value)} /></label>
        <label>Deferral<select value={minimalDeferralKind} onChange={(event) => setMinimalDeferralKind(event.target.value as "none" | "skip" | "canon_debt")}>
          <option value="none">none</option>
          <option value="skip">skip</option>
          <option value="canon_debt">canon debt</option>
        </select></label>
        <label>Deferral step<input value={minimalDeferralStep} onChange={(event) => setMinimalDeferralStep(event.target.value)} /></label>
        <label>Debt name<input value={minimalDebtName} onChange={(event) => setMinimalDebtName(event.target.value)} /></label>
      </div>
      <label>Disposition substance<textarea rows={3} value={minimalDispositionSubstance} onChange={(event) => setMinimalDispositionSubstance(event.target.value)} /></label>
      <button onClick={recordMinimalViableWorldDisposition} disabled={!openWorld || !minimalSeedRecordId || !minimalDimensionKey || !minimalDispositionSubstance.trim()}>Record Checkpoint Disposition</button>
      <div className="grid">
        <label>Proposal seed<select value={minimalProposalSeedRecordId} onChange={(event) => setMinimalProposalSeedRecordId(event.target.value)}>
          <option></option>
          {minimalSeedOptions.map((seed) => <option key={seed.id} value={seed.id}>{seed.shortId}: {seed.title}</option>)}
        </select></label>
        <label>Proposal title<input value={minimalProposalTitle} onChange={(event) => setMinimalProposalTitle(event.target.value)} /></label>
        <label>Truth layer<select value={minimalProposalTruthLayer} onChange={(event) => setMinimalProposalTruthLayer(event.target.value)}>
          <option value="Objective canon">Objective canon</option>
          {truthLayers.map((term) => <option key={term.term}>{term.term}</option>)}
        </select></label>
      </div>
      <label>Proposal body<textarea rows={3} value={minimalProposalBody} onChange={(event) => setMinimalProposalBody(event.target.value)} /></label>
      <button onClick={routeMinimalViableWorldProposal} disabled={!openWorld || minimalViableWorld?.checkpoint.report == null || !minimalProposalTitle.trim() || !minimalProposalBody.trim()}>Route Checkpoint Proposal</button>
      <section className="subpanel">
        <h4>Checkpoint Prompt-out</h4>
        {(displayedMinimalDecision?.promptOut.modes ?? []).map((mode) => (
          <p key={mode.mode}><strong>{mode.label}</strong>: {mode.availability}{mode.blocker ? ` · ${mode.blocker}` : ""}</p>
        ))}
        <button onClick={loadMinimalViableWorldPromptStep} disabled={!openWorld || !displayedMinimalDecision?.promptOut.modes.some((mode) => mode.availability === "available" && mode.stepRequest)}>Load Checkpoint Prompt-out Step</button>
      </section>
      <div className="chips">
        {(displayedMinimalDecision?.readSideTrail ?? []).map((item) => <span key={`${item.label}:${item.href}`}>{item.label} · {item.href}</span>)}
      </div>
    </section>
  );

  const setupPanel = (secondary = false) => (
    <section className={secondary ? "setup-panel compact-setup" : "setup-panel"}>
      <h2>{secondary ? "Setup controls" : "Setup/open world"}</h2>
      {workflowMap?.methodCards?.setup ? (
        <MethodCardPanel card={workflowMap.methodCards.setup} title="Setup method card" />
      ) : (
        <section className="subpanel method-card">
          <h3>Setup method card: Open world</h3>
          <p><strong>Create or open the visible world file that owns the canon store.</strong></p>
          <p>One local world file is the working surface; browser storage is not the source of truth.</p>
          <p>The app will load server-owned setup provenance after a world is open.</p>
        </section>
      )}
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

  const temporalPanel = (
    <div className="panel">
      <h2>Temporal/Timeline flow</h2>
      <MethodCardPanel card={temporalRun?.decisionPoint?.sharedContract.methodCard} />
      <DecisionContractPanel title="Temporal decision contract" contract={temporalRun?.decisionPoint?.sharedContract} />
      <section className="subpanel">
        <h3>Start or Resume Temporal</h3>
        <div className="doctrine">
          <strong>trigger recommendation</strong>
          <span>{temporalRun?.doctrine.triggerRecommendation ?? "Run `09` for Level 2+ facts with first appearance, discovery, public knowledge, institutional reaction, branch divergence, retcon, prophecy, inheritance, war, migration, law, aging, or evidence implications."}</span>
          <span>{temporalRun?.doctrine.completionRule ?? "Complete Temporal/Timeline work by recording sequence, latency, date facets, residue, mystery boundaries, and an explicit outcome."}</span>
        </div>
        <div className="grid">
          <label>Source type<select value={temporalSourceType} onChange={(event) => setTemporalSourceType(event.target.value as typeof temporalSourceType)}>
            <option value="fact">fact</option>
            <option value="capability">capability</option>
            <option value="canon_debt">canon debt</option>
            <option value="material">selected material</option>
            <option value="pass_report">pass report</option>
          </select></label>
          <label>Source or report id<input value={temporalSourceRecordId} onChange={(event) => setTemporalSourceRecordId(event.target.value)} /></label>
          <label>Flow id<input value={temporalFlowId ?? ""} onChange={(event) => setTemporalFlowId(event.target.value ? Number(event.target.value) : null)} /></label>
        </div>
        <div className="grid">
          <label>Material title<input value={temporalMaterialTitle} onChange={(event) => setTemporalMaterialTitle(event.target.value)} /></label>
          <label>Material body<textarea rows={2} value={temporalMaterialBody} onChange={(event) => setTemporalMaterialBody(event.target.value)} /></label>
          <label>Audited subject<input value={temporalSubject} onChange={(event) => setTemporalSubject(event.target.value)} /></label>
        </div>
        <div className="row">
          <button onClick={startTemporalRun} disabled={!openWorld || (temporalSourceType !== "material" && !temporalSourceRecordId) || (temporalSourceType === "material" && (!temporalMaterialTitle.trim() || !temporalMaterialBody.trim()))}>Start or Resume Temporal</button>
          <button onClick={() => void refreshTemporalRun()} disabled={!openWorld || temporalFlowId == null}>Refresh Temporal</button>
        </div>
      </section>

      <section className="subpanel">
        <h3>Current decision</h3>
        <p className="status">{temporalRun ? `${temporalRun.report?.shortId ?? `Open staging ${temporalRun.flow.id}`} · ${temporalRun.source.sourceSummary} · ${temporalRun.flow.current_step}` : "No Temporal/Timeline run loaded."}</p>
        <p className="meta">{temporalRun?.doctrine.browserPolicy ?? "Browser controls surface server policy, blockers, write intent, Prompt-out state, and read-side trail."}</p>
        <ol>
          {(temporalRun?.doctrine.stepMap ?? [
            { key: "run_entry", label: "Run entry and trigger recommendation", decision: "Choose source material and inspect the server recommendation." },
            { key: "temporal_questions", label: "Temporal questions", decision: "Record when the fact became true, known, adapted, and consequential." },
            { key: "close_preview", label: "Close preview", decision: "Use server-returned blockers before appending the pass report." }
          ]).map((step) => <li key={step.key}>{step.label}: {step.decision}</li>)}
        </ol>
      </section>

      <section className="subpanel">
        <h3>Server close blockers</h3>
        {temporalRun ? (
          temporalRun.closeReadiness.blockers.length === 0 ? (
            <p className="status">No server-returned blockers.</p>
          ) : (
            <ul>{temporalRun.closeReadiness.blockers.map((blocker) => <li key={blocker.key}>{blocker.label}: {blocker.message}</li>)}</ul>
          )
        ) : (
          <ul>
            <li>First true or relative sequence: Start a run to load exact server blockers.</li>
            <li>Date types and granularity: Start a run to load exact server blockers.</li>
            <li>Latency and residue: Start a run to load exact server blockers.</li>
          </ul>
        )}
      </section>

      <TemporalRevisionWorkspace
        runId={temporalFlowId}
        revisionState={temporalRun?.revisionState ?? null}
        coverage={temporalCoverage}
        blockers={temporalRun?.closeReadiness.blockers ?? []}
        preview={temporalFinalizationPreview}
        onCoverageChange={setTemporalCoverage}
        onSave={saveTemporalCoverage}
        onRevise={reviseTemporalCoverage}
        onRecover={recoverTemporalCoverage}
        onPreview={previewTemporalFinalization}
        onClose={closeTemporalRun}
      />

      <div className="grid two">
        <section className="subpanel">
          <h3>Create or Link Temporal Timeline Card</h3>
          <div className="grid">
            <label>Outcome title<input value={recordForm.title} onChange={(event) => setRecordForm({ ...recordForm, title: event.target.value })} /></label>
            <label>Outcome body<textarea rows={2} value={recordForm.body} onChange={(event) => setRecordForm({ ...recordForm, body: event.target.value })} /></label>
            <label>Truth layer<input value={recordForm.truthLayer} onChange={(event) => setRecordForm({ ...recordForm, truthLayer: event.target.value })} /></label>
            <label>Canon status<input value={recordForm.canonStatus} onChange={(event) => setRecordForm({ ...recordForm, canonStatus: event.target.value })} /></label>
          </div>
          <div className="grid">
            <label>Existing card id<input value={temporalExistingCardId} onChange={(event) => setTemporalExistingCardId(event.target.value)} /></label>
            <label>Relation<input value={temporalCardRelation} onChange={(event) => setTemporalCardRelation(event.target.value)} /></label>
            <label>Advisory id<input value={temporalAdvisoryRecordId} onChange={(event) => setTemporalAdvisoryRecordId(event.target.value)} /></label>
          </div>
          <button onClick={createOrLinkTemporalCard} disabled={temporalFlowId == null || (!temporalExistingCardId && (!recordForm.title.trim() || !recordForm.truthLayer.trim() || !recordForm.canonStatus.trim()))}>Create or Link Temporal Timeline Card</button>
          <p>Cards: {temporalRun?.cards.map((card) => `${card.card.shortId} ${card.card.title}`).join(", ") || "none"}</p>
        </section>
        <section className="subpanel">
          <h3>Route Admission Proposal</h3>
          <label>Source step<input value={temporalSourceStep} onChange={(event) => setTemporalSourceStep(event.target.value)} /></label>
          <button onClick={routeTemporalProposal} disabled={temporalFlowId == null || !recordForm.title.trim() || !recordForm.truthLayer.trim() || !(recordForm.body || temporalCoverage.outcomeDecision || temporalCoverage.firstTrueOrRelativeSequence).trim()}>Route Admission Proposal</button>
          <h3>Mint Temporal Debt</h3>
          <button onClick={mintTemporalDebt} disabled={temporalFlowId == null || !(canonDebtName || recordForm.title).trim() || !(gateNotApplicable || temporalCoverage.outcomeDecision || temporalCoverage.temporalMysteryBoundaries).trim()}>Mint Temporal Debt</button>
          <p>Proposals: {temporalRun?.proposals.map((proposal) => `${proposal.record.shortId} ${proposal.record.title}`).join(", ") || "none"}</p>
          <p>Debt: {temporalRun?.debt.map((debt) => `${debt.record.shortId} ${debt.record.title}`).join(", ") || "none"}</p>
        </section>
      </div>

      <div className="grid two">
        <section className="subpanel">
          <h3>Record Governed Skip</h3>
          <div className="grid">
            <label>Skip step<input value={temporalSkipStep} onChange={(event) => setTemporalSkipStep(event.target.value)} /></label>
            <label>Pressure skip reason (required for major-or-higher Temporal work)<textarea rows={2} value={temporalSkipReason} onChange={(event) => setTemporalSkipReason(event.target.value)} /></label>
            <label className="inline-check"><input type="checkbox" checked={temporalSkipUnresolved} onChange={(event) => setTemporalSkipUnresolved(event.target.checked)} />Unresolved follow-up</label>
          </div>
          <button onClick={recordTemporalSkip} disabled={temporalFlowId == null || !temporalSkipStep.trim()}>Record Governed Skip</button>
          <p>Skips: {temporalRun?.skips.map((skip) => `${skip.record.shortId} ${skip.record.title}`).join(", ") || "none"}</p>
        </section>
        <section className="subpanel">
          <h3>Prompt-out advisory trail</h3>
          <p className="meta">{temporalRun?.promptOut.coldUseEvidence ?? "Prompt-out becomes available after steward-authored Temporal material exists."}</p>
          <p>Advisory: {temporalRun?.advisories.map((advisory) => `${advisory.record.shortId} ${advisory.record.title}`).join(", ") || "none"}</p>
        </section>
      </div>

      <TemporalPromptOutPanel
        modes={temporalPromptModes}
        selectedMode={temporalPromptMode}
        packet={currentTemporalPacket}
        error={temporalPromptError}
        packetState={promptPacketView?.state}
        packetStateReason={promptPacketView?.reason}
        copyDownloadControls={promptPacketExportControls}
        advisoryControls={(
          <div className="subpanel">
            <label>Temporal advisory response<textarea rows={5} value={responseText} onChange={(event) => setResponseText(event.target.value)} /></label>
            <label>Temporal advisory disposition<select value={disposition} onChange={(event) => setDisposition(event.target.value)}>{advisoryDispositions.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
            <button onClick={() => { void storeAdvisory(); }} disabled={!canUseCurrentPromptPacket || !responseText}>Store Current Temporal Advisory</button>
          </div>
        )}
        onLoadMode={(mode) => { void loadTemporalPromptStep(mode); }}
        onRecover={() => { void recoverTemporalPromptPacket(); }}
      />

      <section className="subpanel">
        <h3>Read-side trail</h3>
        <ul>
          {(temporalRun?.readSideTrail ?? [
            { label: "Temporal pass report", href: "/api/canon-workbench/records/:id" },
            { label: "Audit Trail", href: "/api/canon-workbench/audit" },
            { label: "Current Canon", href: "/api/canon-workbench/current" }
          ]).map((item) => <li key={`${item.label}-${item.href}`}>{item.label}: {item.href}</li>)}
        </ul>
      </section>

      <section className="subpanel">
        <h3>Naive steward walkthrough</h3>
        <ol>
          <li>Start from a fact, capability, canon debt, selected material, or pass report.</li>
          <li>Record date types, first-true sequence, first-known timing, latency, residue, sequence integrity, retrospective insertion, and mystery boundaries.</li>
          <li>Choose card, Admission proposal, canon debt, Prompt-out, or governed skip outcomes without admitting canon inside Temporal.</li>
          <li>Close only when the server removes blockers and the read-side trail shows the pass report and routed outcomes.</li>
        </ol>
      </section>
    </div>
  );

  const propagationGuidedPanel = (
    <section className="panel propagation-active-route">
      <h2>Propagation flow</h2>
      <p>Work shock cones, consequence domains, and stopping-rule dispositions.</p>
      <MethodCardPanel card={propagationPlan?.methodCard ?? displayedPropagationContract?.methodCard} />
      <DecisionContractPanel title="Propagation decision contract" contract={displayedPropagationContract} />

      {propagationRun?.revisionDecision && (
        <section className="subpanel propagation-revision-contract">
          <h3>{propagationRun.revisionDecision.name}</h3>
          <div className="grid compact-grid">
            <section>
              <h4>Editable staging</h4>
              <p>{propagationRun.revisionDecision.doctrine.staging}</p>
            </section>
            <section>
              <h4>Append-only report boundary</h4>
              <p>{propagationRun.revisionDecision.doctrine.reportBoundary}</p>
            </section>
            <section>
              <h4>Governing package sources</h4>
              {propagationRun.revisionDecision.packageSources.map((source) => <p className="meta" key={source}>{source}</p>)}
            </section>
            <section>
              <h4>Revision and close write intent</h4>
              {[...propagationRun.revisionDecision.writeIntent.willWrite, ...propagationRun.revisionDecision.writeIntent.willLink, ...propagationRun.revisionDecision.writeIntent.willQueue].map((item) => <p key={item}>{item}</p>)}
              <p className="meta">Left untouched: {propagationRun.revisionDecision.writeIntent.willLeaveUntouched.join(" · ")}</p>
            </section>
          </div>
        </section>
      )}

      <section className="subpanel owed-propagation">
        <h3>Owed propagation</h3>
        {propagationQueue.length ? propagationQueue.map((debt) => (
          <article key={debt.id} className="queue-item">
            <h4>{debt.owedItem?.shortId ?? debt.shortId} · {debt.owedItem?.title ?? debt.title}</h4>
            {debt.sourceFact ? (
              <p>{debt.sourceFact.shortId} · {debt.sourceFact.title}</p>
            ) : (
              <>
                <p className="status error">Missing source fact link</p>
                <p>Start is blocked until this canon debt has a derived_from source fact link.</p>
              </>
            )}
            <p className="meta">State {debt.state} · scope {debt.scope}</p>
            <button onClick={() => startPropagationFromQueue(debt)} disabled={!openWorld || !debt.route}>Start/Resume Owed Run</button>
          </article>
        )) : <p className="status">No owed propagation queue items returned.</p>}
      </section>

      <section className="subpanel">
        <h3>Run identity</h3>
        <div className="chips">
          <span>{propagationRun?.sourceFact ? `${propagationRun.sourceFact.shortId} · ${propagationRun.sourceFact.title}` : "Source fact loads from the run payload."}</span>
          <span>{propagationRun?.owedDebt ? `${propagationRun.owedDebt.shortId} · ${propagationRun.owedDebt.title}` : "No owed debt attached to this run."}</span>
          <span>Flow {propagationRun?.flow.id ?? propagationFlowId ?? "not started"}</span>
          <span>Severity {propagationRun?.severityPath.admissionLevel ?? "unset"} / {propagationRun?.severityPath.workScale ?? "unset"}</span>
        </div>
        <p>{displayedPropagationContract?.nextOrResumeState.safeExit ?? "Return to the workflow map; this propagation run can be resumed."}</p>
        <div className="row">
          <button onClick={() => void navigateWorkflow("map")}>Safe Return to Workflow Map</button>
          <button onClick={() => propagationFlowId != null && loadPropagationRun(propagationFlowId)} disabled={!openWorld || propagationFlowId == null}>Refresh Run</button>
          <button onClick={closePropagation} disabled={!openWorld || propagationFlowId == null || propagationRun?.flow.state !== "in_progress"}>Close Run</button>
        </div>
      </section>

      <section className="subpanel">
        <h3>Shock-cone orders</h3>
        <div className="grid compact-grid">
          {(propagationPlan?.orderControls ?? propagationPlan?.orders.map((order) => ({
            key: order.key,
            label: order.label,
            doctrine: propagationPlan.methodCard?.operativeRule ?? "Work the ordered consequences.",
            severityExpectation: propagationPlan.requiredCoverage
          })) ?? []).map((order) => (
            <article key={order.key} className="subpanel">
              <h4>{order.label}</h4>
              <p>{order.doctrine}</p>
              <p className="meta">{order.severityExpectation}</p>
              {typeof (order as unknown as { consequenceCount?: number }).consequenceCount === "number" && <p>Consequences: {(order as unknown as { consequenceCount: number }).consequenceCount}</p>}
            </article>
          ))}
        </div>
        <div className="grid">
          <label>Order<select value={propagationOrderKey} onChange={(event) => setPropagationOrderKey(event.target.value)}>{(propagationPlan?.orderControls ?? propagationPlan?.orders ?? []).map((order) => <option key={order.key} value={order.key}>{order.label}</option>)}</select></label>
          <label>Domain<select value={propagationDomainName} onChange={(event) => setPropagationDomainName(event.target.value)}><option></option>{(propagationPlan?.domainAtlas?.map((item) => item.name) ?? propagationPlan?.domains ?? []).map((domain) => <option key={domain}>{domain}</option>)}</select></label>
          <label>Pressure<select value={propagationPressure} onChange={(event) => setPropagationPressure(event.target.value as "normal" | "high")}><option>normal</option><option>high</option></select></label>
        </div>
        <label>Consequence prose<textarea rows={3} value={propagationText} onChange={(event) => setPropagationText(event.target.value)} /></label>
        <button onClick={savePropagationConsequence} disabled={propagationFlowId == null || !propagationText.trim()}>Add Consequence</button>
      </section>

      <PropagationWorkspace
        runState={propagationRun?.flow.state ?? "not_started"}
        decisionName={propagationRun?.revisionDecision?.name ?? "Pre-close Propagation revision and finalization"}
        packageSources={propagationRun?.revisionDecision?.packageSources ?? ["docs/worldbuilding-system/07_propagation_engine.md", "docs/worldbuilding-system/20_ai_assisted_workflow.md"]}
        obligations={displayedPropagationContract?.obligations ?? { required: [], optional: [], skippable: [], severityDependent: [] }}
        orders={propagationPlan?.orders ?? []}
        domainNames={propagationPlan?.domains ?? []}
        consequences={propagationConsequences}
        domains={propagationDomains}
        dispositions={propagationDispositions}
        blockers={propagationRun?.closeReadiness.blockers ?? []}
        onReviseConsequence={revisePropagationConsequence}
        onRetractConsequence={retractPropagationConsequence}
        onReviseDomain={revisePropagationDomain}
        onRetractDomain={retractPropagationDomain}
      />

      <section className="subpanel">
        <h3>Domain-atlas sweep</h3>
        <div className="grid compact-grid">
          {(propagationPlan?.domainAtlas ?? propagationPlan?.domains.map((name) => ({ name, state: "unswept", declaration: "", doctrine: "Domain declarations explain the relationship." })) ?? []).map((domainState) => (
            <article key={domainState.name} className="subpanel">
              <h4>{domainState.name}</h4>
              <p>{domainState.state}</p>
              <p className="meta">{domainState.declaration || domainState.doctrine}</p>
            </article>
          ))}
        </div>
        <div className="grid">
          <label>Triage<select value={propagationTriage} onChange={(event) => setPropagationTriage(event.target.value as "direct" | "dependency" | "reaction" | "negative")}><option>direct</option><option>dependency</option><option>reaction</option><option>negative</option></select></label>
          <label>Declaration<textarea rows={2} value={propagationText} onChange={(event) => setPropagationText(event.target.value)} /></label>
        </div>
        <button onClick={savePropagationDomain} disabled={propagationFlowId == null || !propagationDomainName || (propagationTriage === "negative" && !propagationText.trim())}>Record Domain</button>
      </section>

      <section className="subpanel">
        <h3>Consequences and dispositions</h3>
        <section>
          <h4>Disposition effects</h4>
          <p>answered: governed here with optional rationale.</p>
          <p>intentionally scoped out: governed by explicit scope note.</p>
          <p>assigned as canon debt: creates open propagation-scoped debt.</p>
          <p>protected as a mystery boundary: preserves the boundary for downstream work.</p>
        </section>
        <div className="grid">
          <label>Consequence id<input value={propagationConsequenceId} onChange={(event) => setPropagationConsequenceId(event.target.value)} /></label>
          <label>Disposition<select value={propagationDispositionTerm} onChange={(event) => setPropagationDispositionTerm(event.target.value)}>{consequenceDispositions.length ? consequenceDispositions.map((term) => <option key={term.term}>{term.term}</option>) : ["answered", "intentionally scoped out", "assigned as canon debt", "protected as a mystery boundary"].map((term) => <option key={term}>{term}</option>)}</select></label>
          <label>Disposition rationale<textarea rows={2} value={propagationDispositionNote} onChange={(event) => setPropagationDispositionNote(event.target.value)} /></label>
          {propagationDispositionTerm === "assigned as canon debt" && (
            <label>Debt name (required)<input value={propagationDebtName} onChange={(event) => setPropagationDebtName(event.target.value)} /></label>
          )}
          {propagationDispositionTerm === "protected as a mystery boundary" && (
            <label>Preservation boundary (required)<textarea rows={2} value={propagationPreservationBoundary} onChange={(event) => setPropagationPreservationBoundary(event.target.value)} /></label>
          )}
        </div>
        <div className="row">
          <button onClick={savePropagationDisposition} disabled={!propagationConsequenceId || !propagationDispositionTerm}>Save Disposition</button>
          <button onClick={proposePropagationFact} disabled={propagationFlowId == null || !recordForm.title || !recordForm.truthLayer}>Propose Surfaced Fact</button>
          <button onClick={skipPropagation} disabled={!openWorld}>Record Skip</button>
        </div>
        {propagationRevisionErrors.disposition && (
          <p className="status error">
            {propagationRevisionErrors.disposition} Entered consequence id, disposition, debt or boundary, and note were preserved; correct the named row and retry.
          </p>
        )}
      </section>

      <section className="propagation-finalization-landmark" aria-labelledby="propagation-finalization-heading">
        <header className="subpanel">
          <h3 id="propagation-finalization-heading">Finalization landmark</h3>
          <p><strong>Pre-close Propagation revision and finalization</strong> keeps the active close boundary reachable while you browse or edit rows.</p>
          <p>{propagationRun?.revisionDecision?.doctrine.staging ?? "Open-run material remains editable staging until close."}</p>
          <p>{propagationRun?.revisionDecision?.doctrine.reportBoundary ?? "Close writes one append-only propagation report."}</p>
          <p className="meta">Governing package sources: {(propagationRun?.revisionDecision?.packageSources ?? ["docs/worldbuilding-system/07_propagation_engine.md", "docs/worldbuilding-system/20_ai_assisted_workflow.md"]).join(" · ")}</p>
          <div className="chips">
            <span>Current step: {displayedPropagationContract?.nextOrResumeState.currentStep ?? propagationRun?.flow.current_step ?? "load the current run"}</span>
            <span>Next owed judgment: {displayedPropagationContract?.nextOrResumeState.nextStep ?? "restore server-returned close readiness"}</span>
            <span>Safe exit and resume: {displayedPropagationContract?.nextOrResumeState.safeExit ?? "Return to the workflow map and resume this run later."}</span>
          </div>
          <p>Required: {displayedPropagationContract?.obligations.required.join(" · ") || "server-returned active coverage"}</p>
          <p>Optional: {displayedPropagationContract?.obligations.optional.join(" · ") || "none returned"}</p>
          <p>Skippable: {displayedPropagationContract?.obligations.skippable.join(" · ") || "Prompt-out remains optional"}</p>
          <p>Severity-dependent: {displayedPropagationContract?.obligations.severityDependent.join(" · ") || "follow the server-returned severity path"}</p>
          <div className="row">
            <button onClick={() => void navigateWorkflow("map")}>Safe Return to Workflow Map</button>
            <button onClick={() => propagationFlowId != null && loadPropagationRun(propagationFlowId)} disabled={!openWorld || propagationFlowId == null}>Refresh Finalization State</button>
            <button onClick={closePropagation} disabled={!openWorld || propagationFlowId == null || propagationRun?.flow.state !== "in_progress"}>Review and Close Run</button>
          </div>
        </header>

        <section className="subpanel">
          <h3>{propagationRun?.packetCurrentness?.status === "stale" ? "Stale Propagation packet" : "Propagation packet currentness"}</h3>
        {propagationRun?.packetCurrentness ? (
          <>
            <p>{propagationRun.packetCurrentness.reason}</p>
            <p className="meta">Active-set revision {propagationRun.activeSet.revision} · last change {propagationRun.activeSet.changedKind ?? "initial set"}{propagationRun.activeSet.changedRowId == null ? "" : ` · row ${propagationRun.activeSet.changedRowId}`}</p>
            <button onClick={loadCurrentPropagationPacket}>Load current Pressure packet</button>
            <section className="subpanel">
              <h4>Fresh Pressure or governed skip</h4>
              <p>{propagationRun.packetCurrentness.pressure.status === "owed" ? "Fresh Pressure support or a governed skip is owed before close." : "No fresh-Pressure obligation is currently owed."}</p>
              <p>External LLM use remains optional; the governed skip is always the non-LLM path.</p>
              <label>Pressure skip reason {propagationRun.packetCurrentness.pressure.reasonRequired ? "(required for this severity)" : "(optional)"}<textarea rows={2} value={propagationPressureSkipReason} onChange={(event) => setPropagationPressureSkipReason(event.target.value)} /></label>
              <button onClick={skipCurrentPropagationPressure} disabled={propagationRun.packetCurrentness.pressure.status !== "owed"}>Record governed Pressure skip</button>
              {propagationRevisionErrors.pressure && <p className="status error">{propagationRevisionErrors.pressure} Entered skip reason was preserved; follow the server remediation and retry.</p>}
            </section>
          </>
        ) : <p>Start or refresh the run to load server-owned packet currentness.</p>}
      </section>

      <section className="subpanel">
        <h3>Propagation Prompt-out</h3>
        <div className="grid compact-grid">
          <label>Prompt mode<select value={propagationPromptMode} onChange={(event) => setPropagationPromptMode(event.target.value as "proposal" | "pressure")}>
            {propagationPromptModes.length ? propagationPromptModes.map((mode) => <option key={mode.mode} value={mode.mode}>{mode.label}</option>) : <option value="proposal">Proposal mode</option>}
          </select></label>
          <p className="status">{selectedPropagationPromptMode ? `${selectedPropagationPromptMode.label}: ${selectedPropagationPromptMode.availability}${selectedPropagationPromptMode.blocker ? ` - ${selectedPropagationPromptMode.blocker}` : ""}` : "Prompt modes load from the server contract."}</p>
          <button onClick={loadPropagationPromptStep} disabled={!canLoadPropagationPromptStep}>Load Propagation Prompt-out Step</button>
        </div>
        <p>{displayedPropagationContract?.bearingContext.sourceManifest.join(" · ") ?? "Source manifest loads from the active run."}</p>
        {displayedPropagationContract?.bearingContext.omissions.map((omission) => <p className="meta" key={omission}>Omission: {omission}</p>)}
        <p>Advisory/canon warning: copied or pasted model output remains advisory; the steward authors and governs every surviving word.</p>
        {selectedPropagationPromptMode?.outputLabels?.length ? <p>Output labels: {selectedPropagationPromptMode.outputLabels.join(" · ")}</p> : null}
        {promptStep?.context.flowKey === "propagation" && (
          <section className="subpanel">
            <h4>Current packet preview</h4>
            <p>Loaded Prompt-out step: {promptStep.label} · {promptStep.context.stepKey}</p>
            {propagationPacketContext && <PropagationPacketContextPanel context={propagationPacketContext} />}
            <pre className="prompt-preview">{promptText || "Generate the current packet to preview its exact body."}</pre>
            {promptPacketStatusPanel}
            {promptPacketExportControls}
          </section>
        )}
      </section>

      <section className="subpanel">
        <h3>Close blockers</h3>
        {propagationRevisionErrors.close && (
          <p className="status error">
            {propagationRevisionErrors.close} Resolve the server-returned blockers below, then retry Close Run.
          </p>
        )}
        {propagationRun?.closeReadiness.blockers.length ? (
          <ul>{propagationRun.closeReadiness.blockers.map((blocker) => <li key={`${blocker.consequenceId ?? "run"}:${blocker.key}`}>{blocker.label ? `${blocker.label}: ` : ""}{blocker.key} · {blocker.message}</li>)}</ul>
        ) : propagationRun ? (
          <p>No server-returned blockers.</p>
        ) : (
          <p>Start or refresh this flow to load exact server blockers.</p>
        )}
      </section>

      <section className="subpanel">
        <h3>Close/result preview</h3>
        <div className="grid compact-grid">
          <section>
            <h4>Will write</h4>
            {(propagationRun?.closePreview.willWrite ?? ["Close preview loads from the current run."]).map((item) => <p key={item}>{item}</p>)}
          </section>
          <section>
            <h4>Existing records</h4>
            {propagationRun?.closePreview.existingRecords.length ? propagationRun.closePreview.existingRecords.map((item) => <p key={`${item.kind}:${item.recordId}`}>{item.kind} · {item.recordId} · {item.title ?? ""}</p>) : <p>None returned.</p>}
          </section>
          <section>
            <h4>Will leave untouched</h4>
            {(propagationRun?.closePreview.willLeaveUntouched ?? ["Source canon standing remains unchanged."]).map((item) => <p key={item}>{item}</p>)}
          </section>
        </div>
      </section>

      <section className="subpanel">
        <h3>Read-side trail</h3>
        <div className="chips">
          {(propagationRun?.readSideTrail ?? displayedPropagationContract?.readSideTrail ?? []).map((item) => <span key={`${item.label}:${item.href}`}>{item.label} · {item.href}</span>)}
        </div>
      </section>
      </section>

      <section className="subpanel">
        <h3>Naive steward walkthrough</h3>
        <ol>
          <li>Identify the exact active consequence or domain version that would enter close; superseded and retracted rows are audit history.</li>
          <li>Revise or retract beside that row with a steward-authored reason and replacement fields required by its severity.</li>
          <li>Use the returned row blocker to restore active-only coverage or disposition without retyping after a failed action.</li>
          <li>When the prior packet is stale, load current Pressure or take the governed skip; external LLM use remains optional and advisory.</li>
          <li>Review what close writes, links, queues, and leaves untouched, then confirm the append-only report boundary.</li>
          <li>Return safely to the workflow map and resume the server-owned current, next, and lineage state later.</li>
        </ol>
      </section>

      <details className="subpanel">
        <summary>Substrate/admin identifiers</summary>
        <div className="grid">
          <label>Fact id<input value={propagationFactId} onChange={(event) => setPropagationFactId(event.target.value)} /></label>
          <label>Debt id<input value={propagationDebtId} onChange={(event) => setPropagationDebtId(event.target.value)} /></label>
          <label>Flow id<input value={propagationFlowId ?? ""} onChange={(event) => setPropagationFlowId(event.target.value ? Number(event.target.value) : null)} /></label>
        </div>
        <div className="row">
          <button onClick={loadPropagationPlan} disabled={!openWorld || !propagationFactId}>Load Plan</button>
          <button onClick={startPropagation} disabled={!openWorld || !propagationFactId}>Start or Resume</button>
        </div>
      </details>
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
    const operatingCard = displayedWorkflowMap.methodCards?.operatingCard;
    const admissionRoutedSurface = (
      <section className="panel admission-decision">
        <h2>Admission flow</h2>
        <MethodCardPanel card={admissionDecision?.methodCard} />
        <DecisionContractPanel title="Admission decision contract" contract={admissionDecision?.sharedContract} />
        <div className="doctrine">
          <strong>Admission method guidance</strong>
          <span>{admissionDecision?.methodCard?.operativeRule ?? "Select a proposed fact and load server-returned Admission guidance before treating doctrine as loaded."}</span>
          <span>{admissionDecision?.methodCard?.why ?? "Severity is steward-declared; sweeps propose and only Admission admits."}</span>
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
              <span>{`${admissionDecision.selectedRecord.recordTypeKey} · ${admissionDecision.selectedRecord.truthLayer ?? "unset truth layer"} · ${admissionDecision.selectedRecord.canonStatus ?? "unset canon status"}`}</span>
              <span>Source or origin links: {admissionDecision.selectedRecord.sourceLinks.map((link) => link.target ? `${link.target.shortId} ${link.target.title}` : `record ${link.toRecordId}`).join(", ") || "none returned"}</span>
            </div>
          )}
          <div className="grid compact-grid">
            <section className="subpanel">
              <h3>Severity definitions</h3>
              {admissionDecision?.severity.definitions.length ? admissionDecision.severity.definitions.map((definition) => (
                <p key={`${definition.key}:${definition.term}`}><strong>{definition.key}</strong> {definition.term}: {definition.definition}</p>
              )) : <p className="status">Declare admission_level and work_scale explicitly to load the server-owned severity path.</p>}
              <p>{`Severity path: ${admissionDecision?.severity.gatePath ?? "undeclared"}`}</p>
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
            </section>
            <section className="subpanel">
              <h3>Full gate path</h3>
              <p>Full gates refuse checkbox-only completion.</p>
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
            <details>
              <summary>Seed audit provenance</summary>
              {(admissionDecision?.seedAudit.doctrine ?? []).map((citation) => <p key={citation}>Provenance: {citation}</p>)}
            </details>
            <p>{`Reason required: ${admissionDecision?.skipRule.reasonRequired ? "yes" : "no"} · ${admissionDecision?.skipRule.reasonThreshold ?? "major-or-higher Admission work"} · ${admissionDecision?.skipRule.belowThresholdNote ?? "Reason not collected below major-fact threshold."}`}</p>
            <p>Open canon debt warnings are non-blocking and remain steward judgment context.</p>
          </section>
          <PromptPacketPreview
            title="Prompt packet preview"
            roleLine={`${admissionDecision?.promptOut.role ?? "Admission Prompt-out role loads after selecting a record."} · ${admissionDecision?.promptOut.advisory ?? "optional"} advisory pressure`}
            modes={admissionDecision?.promptOut.modes}
            preview={admissionDecision?.promptOut.preview}
            advisoryNote="Pasted advisory responses are stored as advisory_artifact records and remain visibly separate from canon fields."
            action={
              <div className="grid compact-grid">
                <label>Prompt mode<select value={admissionPromptMode} onChange={(event) => setAdmissionPromptMode(event.target.value as "proposal" | "pressure")}>
                  {admissionPromptModes.length ? admissionPromptModes.map((mode) => <option key={mode.mode} value={mode.mode}>{mode.label}</option>) : <option value="proposal">Proposal mode</option>}
                </select></label>
                <p className="status">{admissionPromptModeStatus}</p>
                <p className="status">{loadedAdmissionPromptMode
                  ? `Loaded mode: ${loadedAdmissionPromptMode === "pressure" ? "Pressure mode" : "Proposal mode"}`
                  : "Loaded mode: none yet"}</p>
                <button onClick={loadAdmissionPromptStep} disabled={!canLoadAdmissionPromptStep}>Load Admission Prompt-out Step</button>
              </div>
            }
          />
          {activeFullGateContract && (
            <section className="subpanel full-gate-form">
              <h3>Full-gate completion form</h3>
              <p className="meta">{activeFullGateContract.completionAction.method} {activeFullGateContract.completionAction.href}</p>
              <div className="grid compact-grid">
                {activeFullGateContract.sections.map((section) => (
                  <section key={section.key} className="subpanel">
                    <h4>{section.label}</h4>
                    <p className="meta">{section.required ? "required" : "optional"} · {section.canMarkNotApplicable ? "not-applicable allowed" : "substance required when applicable"} · {section.quietDomain ? "quiet-domain declaration allowed" : "no quiet-domain declaration"}</p>
                    <p>{section.guidance}</p>
                    <label htmlFor={`gate-section-${section.key}-substance`}>{section.label} substance<textarea
                      id={`gate-section-${section.key}-substance`}
                      aria-label={`${section.label} substance`}
                      rows={3}
                      value={gateSectionSubstance[section.key] ?? ""}
                      onChange={(event) => {
                        setGateFinalReview(null);
                        setGateSectionSubstance((current) => ({ ...current, [section.key]: event.target.value }));
                      }}
                    /></label>
                    {section.canMarkNotApplicable && (
                      <>
                        <label htmlFor={`gate-section-${section.key}-not-applicable`}><input
                          id={`gate-section-${section.key}-not-applicable`}
                          aria-label={`Mark ${section.label} not applicable`}
                          type="checkbox"
                          checked={gateSectionNotApplicableReasons[section.key] != null}
                          onChange={(event) => setGateSectionNotApplicableReasons((current) => {
                            setGateFinalReview(null);
                            const next = { ...current };
                            if (event.target.checked) next[section.key] = next[section.key] ?? "";
                            else delete next[section.key];
                            return next;
                          })}
                        /> Mark {section.label} not applicable</label>
                        <label htmlFor={`gate-section-${section.key}-not-applicable-reason`}>{section.label} not-applicable reason<input
                          id={`gate-section-${section.key}-not-applicable-reason`}
                          aria-label={`${section.label} not-applicable reason`}
                          value={gateSectionNotApplicableReasons[section.key] ?? ""}
                          onChange={(event) => {
                            setGateFinalReview(null);
                            setGateSectionNotApplicableReasons((current) => ({ ...current, [section.key]: event.target.value }));
                          }}
                        /></label>
                      </>
                    )}
                    {section.quietDomain && (
                      <label htmlFor={`gate-section-${section.key}-quiet-domain`}>{section.label} quiet-domain declaration<textarea
                        id={`gate-section-${section.key}-quiet-domain`}
                        aria-label={`${section.label} quiet-domain declaration`}
                        rows={2}
                        value={gateSectionQuietDeclarations[section.key] ?? ""}
                        onChange={(event) => {
                          setGateFinalReview(null);
                          setGateSectionQuietDeclarations((current) => ({ ...current, [section.key]: event.target.value }));
                        }}
                      /></label>
                    )}
                    {fullGateValidationErrors
                      .filter((error) => error.key === section.key || error.key.startsWith(`${section.key}.`) || error.message.includes(section.label))
                      .map((error) => <p key={`${section.key}:${error.key}:${error.message}`} className="status error">{error.message}</p>)}
                  </section>
                ))}
              </div>
              <div className="grid compact-grid">
                <label>Primary admission operation order<select value={admissionOperation} onChange={(event) => {
                  setGateFinalReview(null);
                  setAdmissionOperation(event.target.value);
                }}>
                  {activeFullGateContract.operationOptions.map((operation) => <option key={operation} value={operation}>{operation}</option>)}
                </select></label>
                <label>Allowed canon status target<select value={gateCanonStatus} onChange={(event) => {
                  setGateFinalReview(null);
                  setGateCanonStatus(event.target.value);
                }}>
                  <option></option>
                  {activeFullGateContract.allowedNextCanonStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select></label>
                <label>Constraint tags for full gate<input
                  list="admission-constraint-tags"
                  value={gateConstraintTags}
                  onChange={(event) => {
                    setGateFinalReview(null);
                    setGateConstraintTags(event.target.value);
                  }}
                /></label>
                <datalist id="admission-constraint-tags">
                  {activeFullGateContract.constraintTagOptions.map((tag) => <option key={tag} value={tag} />)}
                </datalist>
              </div>
              <label>Written consequence for full gate<textarea rows={3} value={gateConsequence} onChange={(event) => {
                setGateFinalReview(null);
                setGateConsequence(event.target.value);
              }} /></label>
              <label>Follow-up debt for full gate<textarea rows={2} value={gateFollowUpDebt} onChange={(event) => {
                setGateFinalReview(null);
                setGateFollowUpDebt(event.target.value);
              }} /></label>
              <label>Advisory use for full gate<select value={gateAdvisoryRecordId} onChange={(event) => {
                setGateFinalReview(null);
                setGateAdvisoryRecordId(event.target.value);
              }}>
                <option value="">No advisory-use link selected</option>
                {activeFullGateContract.advisoryArtifacts.map((artifact) => (
                  <option key={artifact.id} value={artifact.id}>{`${artifact.shortId} · ${artifact.title}`}</option>
                ))}
              </select></label>
              <section className="subpanel standing-text-review">
                <h4>Standing text review</h4>
                <p>By default, current canon uses the accepted Fact statement.</p>
                <p>Accepted gate statement: {acceptedGateStatementDraft || "not supplied yet"}</p>
                <p>Intended current living text: {intendedCurrentLivingText || "not supplied yet"}</p>
                <p>Original proposal/source text: {originalProposalText || "not supplied"}</p>
                {currentLivingTextDiffersFromAccepted && (
                  <p className="status error">Current living text differs from the accepted gate statement; review both before completion.</p>
                )}
              </section>
              <section className="subpanel final-review">
                <h4>Exact final review</h4>
                <p>Final review required before completion</p>
                <button onClick={() => {
                  const review = buildAdmissionFullGateReview();
                  if (review) setGateFinalReview(review);
                }}>Review exact full-gate payload</button>
                {gateFinalReview && (
                  <div>
                    <p className={gateFinalReviewIsCurrent ? "status" : "status error"}>{gateFinalReviewIsCurrent ? "Review matches current full-gate draft." : "Review is stale; review the current draft again."}</p>
                    <p>Reviewed at {gateFinalReview.reviewedAt}</p>
                    <p>Living record title: {gateFinalReview.payload.title}</p>
                    <p>Accepted gate statement: {gateFinalReview.payload.sections.find((section) => section.key === "fact_statement")?.substance || "not supplied"}</p>
                    <p>Intended current living text: {gateFinalReview.payload.body}</p>
                    <p>Original proposal/source text: {originalProposalText || "not supplied"}</p>
                    <p>Truth layer: {gateFinalReview.payload.truthLayer}</p>
                    <p>Canon standing transition: {admissionDecision?.selectedRecord.canonStatus ?? "unknown"} to {gateFinalReview.payload.canonStatus}</p>
                    <p>Ordered operations: {gateFinalReview.payload.operations.join(", ") || "none"}</p>
                    <p>Constraint tags: {gateFinalReview.payload.constraintTags.join(", ") || "none"}</p>
                    <p>Written consequence: {gateFinalReview.payload.consequenceText || "missing"}</p>
                    {activeFullGateContract.sections.map((section) => {
                      const payloadSection = gateFinalReview.payload.sections.find((candidate) => candidate.key === section.key);
                      return (
                        <p key={`review-${section.key}`}>{section.label}: {payloadSection?.substance || payloadSection?.notApplicableReason || payloadSection?.quietDomainDeclaration || "not supplied"}</p>
                      );
                    })}
                    <p>Advisory-use link: {gateFinalReview.payload.advisoryRecordId ?? "none"}</p>
                    <p>Follow-up debt: {gateFinalReview.payload.followUpDebt ?? "none"}</p>
                    <p>Read-side trail: {(activeFullGateContract.readSideTrail ?? admissionDecision?.readSideTrail ?? []).map((trail) => trail.label).join(" · ")}</p>
                  </div>
                )}
                {admissionCompletionReadback && (
                  <div>
                    <h4>Completion readback comparison</h4>
                    <p>Current canon: {admissionCompletionReadback.livingRecord?.title ?? "record returned"} · {admissionCompletionReadback.livingRecord?.canonStatus ?? "status returned"}</p>
                    <p>Current living text: {admissionCompletionReadback.standingText?.currentLivingText ?? admissionCompletionReadback.livingRecord?.body ?? "current text returned"}</p>
                    <p>Accepted gate statement: {admissionCompletionReadback.standingText?.acceptedGateStatement ?? "accepted text returned"}</p>
                    <p>Original proposal/source text: {admissionCompletionReadback.standingText?.originalProposalText ?? admissionCompletionReadback.historyEvidence?.previousBody ?? "history returned"}</p>
                    <p>Gate result: {admissionCompletionReadback.gateResult?.title ?? "gate_result returned"}</p>
                    <p>Operation events: {(admissionCompletionReadback.operationEvents ?? []).join(", ") || "none"}</p>
                    <p>Tags: {(admissionCompletionReadback.constraintTags ?? []).join(", ") || "none"}</p>
                    <p>Debt: {admissionCompletionReadback.followUpDebt?.title ?? "none"}</p>
                    <p>Advisory: {admissionCompletionReadback.advisoryUse?.advisoryRecordId ?? "none"}</p>
                    <p>Audit/history evidence: {admissionCompletionReadback.historyEvidence?.previousBody ?? "history returned"}</p>
                  </div>
                )}
              </section>
              <section className="subpanel">
                <h4>Full-gate validation errors</h4>
                {fullGateValidationErrors.length
                  ? fullGateValidationErrors.map((error) => <p key={`${error.key}:${error.message}`}>{error.message}</p>)
                  : <p className="status">No full-gate validation errors returned by the server.</p>}
                <p>Section failures preserve entered text and selections.</p>
              </section>
              <div className="row">
                <button onClick={() => completeAdmission()} disabled={!openWorld || !admissionRecordId || !gateFinalReviewIsCurrent}>Complete and update canon standing</button>
                <button onClick={startAdmission} disabled={!openWorld || !admissionRecordId}>Hold under review</button>
                <button onClick={() => completeAdmission("rejected")} disabled={!openWorld || !admissionRecordId || !gateFinalReviewIsCurrent}>Reject through Admission</button>
              </div>
            </section>
          )}
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
                {activeFullGateContract && <p>{gateAdvisoryUsePreview}</p>}
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
          <button onClick={skipAdmissionInstrument} disabled={!openWorld}>Record Skip</button>
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
          {admissionQueue.length === 0 ? <p className="status">No Admission work is queued.</p> : admissionQueue.map((row) => {
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
      </section>
    );
    const creationCoveragePanel = (
      <section className="subpanel seed-family-coverage">
        <h3>Seed-family coverage</h3>
        <p>Account for kernel seed families before Admission handoff.</p>
        <p className="status">{displayedCreationCoverage.state.summary}</p>
        {displayedCreationCoverage.createOrConfirmPath && (
          <p className="meta">{`${displayedCreationCoverage.createOrConfirmPath.method} ${displayedCreationCoverage.createOrConfirmPath.href} · kernel ${displayedCreationCoverage.createOrConfirmPath.body.kernelRecordId}`}</p>
        )}
        {creationCoverageBlocked && (
          <p>Admission queue remains visible but secondary until required Creation seed-family coverage is resolved.</p>
        )}
        <p>Creation does not admit canon or assign Admission severity; it only records coverage dispositions, seed links, and governed seed debt.</p>
        {displayedCreationCoverage.state.blockers.map((blocker) => (
          <p key={blocker.key} className="status error">{`${blocker.label}: ${blocker.message} · ${blocker.requires}`}</p>
        ))}
        {displayedCreationCoverage.rows.length === 0 ? (
          <section className="subpanel coverage-bootstrap">
            <h4>Create initial coverage rows</h4>
            <p className="status">No seed-family coverage rows have been confirmed yet.</p>
            <p>Use this bootstrap only to confirm the initial coverage inventory; row dispositions still happen through the server-owned row-level surface after refresh.</p>
            {creationDecisionHandoff.seedDecompositionReport && (
              <p>{`Seed decomposition report: ${creationDecisionHandoff.seedDecompositionReport.shortId} ${creationDecisionHandoff.seedDecompositionReport.title}`}</p>
            )}
            {creationHandoffReady && <p>Parked proposed seeds remain proposed until Admission.</p>}
            <div className="grid compact-grid">
              {coverageBootstrapRows.map((row, index) => (
                <article key={index} className="subpanel">
                  <h5>{`Coverage row ${index + 1}`}</h5>
                  <label>Coverage row label<input
                    value={row.label}
                    onChange={(event) => updateCoverageBootstrapRow(index, { label: event.target.value })}
                    placeholder="Anti-aging chemistry"
                  /></label>
                  <label>Source kernel context<textarea
                    rows={2}
                    value={row.sourceKernelContext}
                    onChange={(event) => updateCoverageBootstrapRow(index, { sourceKernelContext: event.target.value })}
                    placeholder="Kernel language that makes this seed family owed"
                  /></label>
                  <label className="inline-check"><input
                    type="checkbox"
                    checked={row.required}
                    onChange={(event) => updateCoverageBootstrapRow(index, { required: event.target.checked })}
                  />Required coverage row</label>
                </article>
              ))}
            </div>
            {coverageBootstrapError && <p className="status error">{coverageBootstrapError}</p>}
            <div className="row">
              <button onClick={addCoverageBootstrapRow} disabled={!openWorld}>Add another coverage row</button>
              <button onClick={() => void submitCoverageBootstrap()} disabled={!openWorld || !displayedCreationCoverage.createOrConfirmPath}>Confirm coverage rows</button>
            </div>
          </section>
        ) : (
          <div className="grid compact-grid">
            {displayedCreationCoverage.rows.map((row) => {
              const draft = coverageDraftFor(row.id);
              return (
                <article key={row.id} className="subpanel">
                  <h4>{row.label}</h4>
                  <p className="meta">{`${row.required ? "Required" : "Optional"} · Disposition: ${row.disposition}`}</p>
                  <p>{row.sourceKernelContext || "No kernel context returned for this row."}</p>
                  {row.dispositionRationale && <p>{`Disposition rationale: ${row.dispositionRationale}`}</p>}
                  {row.outOfScopeRationale && <p>{`Out-of-scope rationale: ${row.outOfScopeRationale}`}</p>}
                  {row.seedDecompositionReport && <p>{`Seed decomposition report: ${row.seedDecompositionReport.shortId} ${row.seedDecompositionReport.title}`}</p>}
                  {row.debtRecord && <p>{`Seed debt: ${row.debtRecord.shortId} ${row.debtRecord.title} · ${row.debtRecord.body}`}</p>}
                  {row.linkedSeeds.length ? row.linkedSeeds.map((seed) => (
                    <p key={seed.id}>{`Linked proposed seed ${seed.shortId}: ${seed.title} · Canon status: ${seed.canonStatus ?? "unset"}`}</p>
                  )) : <p className="meta">No parked proposed seeds are linked to this row yet.</p>}
                  <label>Link parked proposed seeds<input
                    value={draft.seedRecordIds}
                    onChange={(event) => updateCoverageDraft(row.id, { seedRecordIds: event.target.value, error: null })}
                    placeholder="record ids separated by commas or lines"
                  /></label>
                  <label>Disposition rationale<textarea
                    rows={2}
                    value={draft.rationale}
                    onChange={(event) => updateCoverageDraft(row.id, { rationale: event.target.value, error: null })}
                  /></label>
                  {draft.error && <p className="status error">{draft.error}</p>}
                  <div className="row">
                    <button onClick={() => void submitCoverageLink(row)} disabled={!openWorld || !draft.seedRecordIds.trim()}>Link parked proposed seeds</button>
                    <button onClick={() => void submitCoverageDefer(row)} disabled={!openWorld || !draft.rationale.trim()}>Defer as seed debt</button>
                    <button onClick={() => void submitCoverageOutOfScope(row)} disabled={!openWorld || !draft.rationale.trim()}>Mark out of scope</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    );
    const shellSurfaces = {
      creation: (
        <section className="panel creation-decision">
          <div className="operating-card">
            <strong>Operating Card</strong>
            <span>{operatingCard?.operativeRule ?? "Server-owned operating-card content loads with the workflow map."}</span>
            {operatingCard && <span>Provenance: {operatingCard.packageSources.join(" · ")}</span>}
          </div>
          <MethodCardPanel card={displayedCreationDecision.methodCard} />
          <h2>{"Creation decision point"}</h2>
          <p className="status">Primary active path for a new world</p>
          <div className="row">
            <button onClick={startFlow} disabled={!openWorld}>Start or Resume Creation</button>
            <span className="status">{flowId ? `Flow ${flowId}${kernelRecordId ? ` · kernel ${kernelRecordId}` : ""}` : "No Creation flow loaded"}</span>
          </div>
          <section className="subpanel">
            <h3>{displayedCreationDecision.currentStep}</h3>
            <p>{displayedCreationDecision.localDecision}</p>
            <p>{displayedCreationDecision.methodCard?.why ?? displayedCreationDecision.packageAuthority.why}</p>
            <p className="meta">Provenance</p>
            <div className="chips">
              {(displayedCreationDecision.methodCard?.packageSources ?? displayedCreationDecision.packageAuthority.citations).map((citation) => <span key={citation}>{citation}</span>)}
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
                    <CreationCorrectionPanel
                      seed={seed}
                      draft={correctionDraftFor(seed.id)}
                      errorMessages={correctionError[seed.id] ?? []}
                      disabled={!openWorld}
                      onDraftChange={(patch) => updateCorrectionDraft(seed.id, patch)}
                      onSubmit={() => { void submitCreationCorrection(seed.id); }}
                    />
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
          {creationCoveragePanel}
          {minimalViableWorldIsOwed && minimalViableWorldFullPanel}
          <section className="subpanel">
            <h3>Kernel authoring</h3>
            <p>Consequence mode is steward judgment; the app does not infer, default, or silently reuse it.</p>
            {creationAuthoringDisabled && (
              <p className="status">{creationStartPending
                ? "Creation is starting or resuming before kernel fields become writable."
                : "Creation must start or resume before kernel fields can be saved."}</p>
            )}
            {creationStartError && <p className="error">{`Creation start/resume failed: ${creationStartError}. Use Start or Resume Creation to retry; entered material is preserved.`}</p>}
            <section className="subpanel">
              <h4>Consequence mode draft/saved state</h4>
              <p>{savedConsequenceMode ? `Saved consequence mode: ${savedConsequenceMode}.` : "No saved consequence mode yet."}</p>
              <p>{consequenceModeDraftState === "unsaved"
                ? `Unsaved draft consequence mode: ${consequenceMode}. Save the kernel step before decomposition can use it.`
                : consequenceModeDraftState === "saved"
                  ? "The visible consequence mode matches saved server state."
                  : "A local selection will remain a draft until the kernel step is saved."}</p>
              {displayedCreationDecision.consequenceMode?.blocker && <p className="meta">{displayedCreationDecision.consequenceMode.blocker}</p>}
            </section>
            <section className="subpanel">
              <h4>Selected section state</h4>
              <p>{selectedSectionContract?.emptyState.message ?? "No selected section contract loaded."}</p>
              <p>{selectedSectionHasHeldDraft
                ? `Unsaved draft held under its own heading key: ${kernelHeading}.`
                : "No unsaved section draft is being transferred between headings."}</p>
              <p className="meta">{selectedSectionContract ? `Save target: ${selectedSectionContract.saveTarget.heading}` : "Save target loads from the server contract."}</p>
            </section>
            <div className="grid compact-grid">
              <label>Kernel step<select value={kernelHeading} onChange={(event) => handleKernelHeadingChange(event.target.value)} disabled={creationAuthoringDisabled}>{displayedCreationDecision.sectionPrompts.map((prompt) => <option key={prompt.heading}>{prompt.heading}</option>)}</select></label>
              <label>Consequence mode<select value={consequenceMode} onChange={(event) => setConsequenceMode(event.target.value)} disabled={creationAuthoringDisabled}><option></option>{consequenceModes.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
              <label>Kernel section<textarea rows={4} value={kernelBody} onChange={(event) => updateKernelBody(event.target.value)} placeholder={selectedSectionContract?.prompt} disabled={creationAuthoringDisabled} /></label>
              {displayedCreationDecision.sectionPrompts.map((section) => (
                <p key={section.heading} className="meta">{section.heading} · {section.obligation} · {section.prompt} · {section.hasSavedBody ? "saved body available" : "no saved section text"}</p>
              ))}
            </div>
            <button onClick={saveKernelStep} disabled={creationAuthoringDisabled}>Save kernel step</button>
          </section>
          <PromptPacketPreview
            title="Prompt-out preview"
            roleLine={creationPromptOutRoleLine}
            modes={creationPromptModesForDisplay}
            preview={creationPromptPreviewForDisplay}
            advisoryNote="Pasted responses remain advisory artifacts and do not mutate kernel sections, seed records, reports, or proposals without explicit steward use."
            action={
              <div className="grid compact-grid">
                <label>Prompt mode<select value={creationPromptMode} onChange={(event) => setCreationPromptMode(event.target.value as "proposal" | "pressure")}>
                  {creationPromptModes.map((mode) => <option key={mode.mode} value={mode.mode}>{mode.label}</option>)}
                </select></label>
                <p className="status">{creationPromptModeStatus}</p>
                <p className="status">{loadedCreationPromptMode
                  ? `Loaded mode: ${loadedCreationPromptMode === "pressure" ? "Pressure mode" : "Proposal mode"}`
                  : "Loaded mode: none yet"}</p>
                <button onClick={loadCreationPromptStep} disabled={!canLoadCreationPromptStep}>Load Creation Prompt-out Step</button>
              </div>
            }
          />
          <section className="subpanel">
            <h3>Seed decomposition decision</h3>
            <p>Truth layer is steward-supplied judgment; the app stores the selected layer and does not infer it from prose.</p>
            <p>Actual current status: proposed</p>
            <section className="subpanel">
              <h4>Pre-submit readiness</h4>
              <div className="grid compact-grid">
                {(displayedDecompositionReadiness ?? defaultCreationDecision.decompositionReadiness).map((item) => (
                  <article key={item.key} className={`subpanel readiness ${item.status}`}>
                    <h3>{item.label}</h3>
                    <p>{item.message}</p>
                    <p className="meta">{item.remediation}</p>
                  </article>
                ))}
              </div>
            </section>
            <section className="subpanel inline-recovery">
              <h4>Inline recovery</h4>
              <p>{decompositionError ?? "Server-returned decomposition blockers render here near the action; entered title, body, truth layer, and granularity inputs stay in place."}</p>
            </section>
            <div className="grid compact-grid">
              <label>Seed title<input value={seedTitle} onChange={(event) => setSeedTitle(event.target.value)} /></label>
              <label>Seed body<textarea rows={3} value={seedBody} onChange={(event) => setSeedBody(event.target.value)} /></label>
              <label>Truth layer<select value={seedTruthLayer} onChange={(event) => setSeedTruthLayer(event.target.value)}><option></option>{truthLayers.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
              <label>Admission intent<input value={admissionIntent} onChange={(event) => setAdmissionIntent(event.target.value)} /></label>
            </div>
            <label>Granularity rationale<textarea rows={3} value={granularityRationale} onChange={(event) => setGranularityRationale(event.target.value)} /></label>
            <label className="inline-check"><input type="checkbox" checked={granularityConfirmed} onChange={(event) => setGranularityConfirmed(event.target.checked)} />Granularity confirmation</label>
            <button onClick={decompose} disabled={decomposeDisabled}>Decompose and Park Seed</button>
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
          {!minimalViableWorldIsOwed && activeCreationStatePanel}
          {!minimalViableWorldIsOwed && minimalViableWorldCompactPanel}
        </section>
      ),
      admission: admissionRoutedSurface,
      propagation: propagationGuidedPanel,
      constraint: (
        <section className="panel">
          <h2>Constraint composition flow</h2>
          <p>Compose constraints where facts apply.</p>
          <MethodCardPanel card={constraintRun?.decisionPoint?.sharedContract.methodCard} />
        </section>
      ),
      temporal: temporalPanel,
      stage12: (
        <section className="panel">
          <h2>Institutional / Economic / Suppression flow</h2>
          <p>Run conditional institutional, economic, and suppression passes.</p>
          <MethodCardPanel card={stage12Run?.methodCard} />
          <DecisionContractPanel title="Stage-12 decision contract" contract={stage12Run?.decisionPoint?.sharedContract} />
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
            <label>Flow id<input value={stage12FlowId ?? ""} onChange={(event) => setStage12FlowId(event.target.value ? Number(event.target.value) : null)} /></label>
          </div>
          <div className="row">
            <button onClick={startStage12Run} disabled={!openWorld || (stage12SourceType !== "material" && !stage12SourceRecordId) || (stage12SourceType === "material" && (!stage12MaterialTitle.trim() || !stage12MaterialBody.trim()))}>Start or Resume Stage-12</button>
            <button onClick={() => void refreshStage12Run()} disabled={!openWorld || stage12FlowId == null}>Refresh Stage-12</button>
            <button onClick={closeStage12Run} disabled={!openWorld || stage12FlowId == null}>Close Stage-12 Run</button>
          </div>
          <section className="subpanel">
            <h3>Close blockers</h3>
            {stage12Run?.closeReadiness.blockers.length ? (
              <ul>{stage12Run.closeReadiness.blockers.map((blocker) => <li key={blocker.key}>{blocker.label}: {blocker.message}</li>)}</ul>
            ) : (
              <p className="status">{stage12Run ? "No server-returned blockers." : "Refresh a run to load exact server blockers."}</p>
            )}
          </section>
        </section>
      ),
      contradiction: (
        <section className="panel">
          <h2>Contradiction/Retcon/Mystery flow</h2>
          <p>Repair contradictions and preserve protected effects.</p>
          <MethodCardPanel card={stage13Run?.methodCard} />
          <DecisionContractPanel title="Stage 13 decision contract" contract={stage13Run?.decisionPoint?.sharedContract} />
          <div className="grid">
            <label>Source record id<input value={stage13SourceRecordId} onChange={(event) => setStage13SourceRecordId(event.target.value)} /></label>
            <label>Flow id<input value={stage13FlowId ?? ""} onChange={(event) => setStage13FlowId(event.target.value ? Number(event.target.value) : null)} /></label>
          </div>
          <div className="row">
            <button onClick={startStage13Run} disabled={!openWorld || (!stage13SourceRecordId && !stage13Title.trim())}>Start or Resume Stage 13</button>
            <button onClick={() => void refreshStage13Run()} disabled={!openWorld || stage13FlowId == null}>Refresh Stage 13</button>
            <button onClick={closeStage13Run} disabled={!openWorld || stage13FlowId == null}>Attempt Stage 13 Close</button>
          </div>
          {stage13OwedBoundaries.map((row) => <p key={row.propagationDispositionId}>Boundary #{row.propagationDispositionId} · protected record {row.protectedRecordId}</p>)}
        </section>
      ),
      qa: (
        <section className="panel">
          <h2>QA flow</h2>
          <p>Score stability before calling the world stable.</p>
          <MethodCardPanel card={qaScorecard?.methodCard} />
          <DecisionContractPanel title="QA decision contract" contract={qaScorecard?.decisionPoint?.sharedContract} />
          {qaScorecard?.minimalViableWorldEcho && (
            <section className="subpanel minimal-viable-world-echo">
              <h3>Minimal Viable World echo</h3>
              <div className="chips">
                <span>{qaScorecard.minimalViableWorldEcho.status}</span>
                <span>{qaScorecard.minimalViableWorldEcho.report ? qaScorecard.minimalViableWorldEcho.report.shortId : qaScorecard.minimalViableWorldEcho.route}</span>
                <span>Deferrals {qaScorecard.minimalViableWorldEcho.unresolvedDeferrals.length}</span>
                <span>Debt {qaScorecard.minimalViableWorldEcho.openCanonDebt.length}</span>
                <span>Proposals {qaScorecard.minimalViableWorldEcho.admissionProposals.length}</span>
              </div>
              {qaScorecard.minimalViableWorldEcho.coverageSignalSummary.map((signal) => <p key={signal.key}>{signal.label}: {signal.status}</p>)}
            </section>
          )}
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
          </div>
        </section>
      ),
      "canon-workbench": (
        <section className="panel canon-workbench">
          <h2>Canon Workbench</h2>
          <p>Current Canon</p>
          <p>Audit Trail</p>
          <div className="grid compact-grid">
            <label>Canon Workbench text query<input value={canonWorkbenchQuery} onChange={(event) => setCanonWorkbenchQuery(event.target.value)} /></label>
            <label>Canon status filter<select value={canonWorkbenchStatus} onChange={(event) => setCanonWorkbenchStatus(event.target.value)}>
              <option value="">Default standing statuses</option>
              {canonStatuses.map((term) => <option key={term.term}>{term.term}</option>)}
            </select></label>
          </div>
          <div className="row">
            <label className="inline-check"><input type="checkbox" checked={canonWorkbenchOpenDebt} onChange={(event) => setCanonWorkbenchOpenDebt(event.target.checked)} />Open canon debt</label>
            <button onClick={loadCanonWorkbench}>Refresh Workbench</button>
          </div>
          <section className="subpanel">
            <h3>Current Canon</h3>
            {canonCurrentRows.length === 0 && <p className="status">No current canon matches these filters</p>}
            <div className="records compact">
              {canonCurrentRows.map((row) => (
                <article key={row.id} className={selectedCanonRecordId === row.id ? "selected" : undefined}>
                  <button onClick={() => void selectCurrentCanonRow(row)}>Select</button>
                  <h3>{row.shortId} · {row.title}</h3>
                  <p className="meta">{row.recordTypeLabel} · {row.truthLayer} · {row.canonStatus} · {row.continuityScope}</p>
                  <p>Current living text: {row.currentLivingText ?? row.body ?? "not returned"}</p>
                  {row.gateProvenance && (
                    <p className="meta">
                      Gate provenance: {[
                        row.gateProvenance.hasGateResult ? "gate result" : "",
                        row.gateProvenance.hasProposalHistory ? "proposal history" : "",
                        row.gateProvenance.hasLinkedDebt ? "linked debt" : ""
                      ].filter(Boolean).join(" · ") || "none"}
                    </p>
                  )}
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
            <h3>Detail pane</h3>
            {canonDetail ? (
              <article>
                <h3>{canonDetail.record.shortId} · {canonDetail.record.title}</h3>
                <p className="meta">{canonDetail.record.recordTypeLabel} · {canonDetail.record.truthLayer} · {canonDetail.record.canonStatus} · {canonDetail.record.continuityScope}</p>
                <p>{canonDetail.record.body || "No prose yet."}</p>
                {canonDetail.standingProvenance && (
                  <section className="subpanel">
                    <h4>Standing provenance</h4>
                    <p>Current living text: {canonDetail.standingProvenance.currentLivingText || "not returned"}</p>
                    <p>Proposal/source history: {canonDetail.standingProvenance.proposalHistoryText || "none returned"}</p>
                    <p>Gate audit text: {canonDetail.standingProvenance.gateAuditText || "none returned"}</p>
                    <p>Admission operation: {canonDetail.standingProvenance.admissionOperation || "none returned"}</p>
                    <p>Constraint tags: {canonDetail.standingProvenance.constraintTags.join(", ") || "none"}</p>
                    <p>Linked propagation debt: {canonDetail.standingProvenance.linkedPropagationDebt.map((record) => `${record.shortId} ${record.title} · ${record.sourceRelationship}`).join(", ") || "none"}</p>
                    <p>Typed-link trail: {canonDetail.standingProvenance.typedLinkTrail.map((link) => `${link.linkTypeKey} ${link.note}`).join(", ") || "none"}</p>
                  </section>
                )}
                <p>Related reports: {canonDetail.relatedReports.map((record) => `${record.shortId} ${record.title}`).join(", ") || "none"}</p>
                <p>Canon debt: {canonDetail.canonDebt.map((record) => `${record.shortId} ${record.title}`).join(", ") || "none"}</p>
                <button onClick={() => { void api<{ markdown: string }>(canonDetail.exportAffordance.href).then((payload) => setExportedMarkdown(payload.markdown)); }}>Export Markdown</button>
              </article>
            ) : (
              <p className="status">Select a Current Canon row or Audit Trail item.</p>
            )}
          </section>
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
          status={loadedPromptStatusPanel || promptPacketStatusPanel || message ? (
            <>
              {loadedPromptStatusPanel}
              {promptPacketStatusPanel}
              {message && <p className="status">{message}</p>}
            </>
          ) : null}
          onNavigate={(destinationKey) => void navigateWorkflow(destinationKey)}
          onFollowConditionalPass={(obligation) => void followConditionalPass(obligation)}
          onDeferConditionalPass={deferConditionalPass}
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
            <span>{workflowMap?.methodCards?.operatingCard.operativeRule ?? "Server-owned operating-card content loads with the workflow map."}</span>
            {workflowMap?.methodCards?.operatingCard && <span>Provenance: {workflowMap.methodCards.operatingCard.packageSources.join(" · ")}</span>}
          </div>
          {loadedPromptStatusPanel}

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
                        <CreationCorrectionPanel
                          seed={seed}
                          draft={correctionDraftFor(seed.id)}
                          errorMessages={correctionError[seed.id] ?? []}
                          disabled={!openWorld}
                          onDraftChange={(patch) => updateCorrectionDraft(seed.id, patch)}
                          onSubmit={() => { void submitCreationCorrection(seed.id); }}
                        />
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
                          <p>Current living text: {row.currentLivingText ?? row.body ?? "not returned"}</p>
                          {row.gateProvenance && (
                            <p className="meta">
                              Gate provenance: {[
                                row.gateProvenance.hasGateResult ? "gate result" : "",
                                row.gateProvenance.hasProposalHistory ? "proposal history" : "",
                                row.gateProvenance.hasLinkedDebt ? "linked debt" : ""
                              ].filter(Boolean).join(" · ") || "none"}
                            </p>
                          )}
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
                      {canonDetail.standingProvenance && (
                        <section className="subpanel">
                          <h4>Standing provenance</h4>
                          <p>Current living text: {canonDetail.standingProvenance.currentLivingText || "not returned"}</p>
                          <p>Proposal/source history: {canonDetail.standingProvenance.proposalHistoryText || "none returned"}</p>
                          <p>Gate audit text: {canonDetail.standingProvenance.gateAuditText || "none returned"}</p>
                          <p>Admission operation: {canonDetail.standingProvenance.admissionOperation || "none returned"}</p>
                          <p>Constraint tags: {canonDetail.standingProvenance.constraintTags.join(", ") || "none"}</p>
                          <p>Linked propagation debt: {canonDetail.standingProvenance.linkedPropagationDebt.map((record) => `${record.shortId} ${record.title} · ${record.sourceRelationship}`).join(", ") || "none"}</p>
                          <p>Typed-link trail: {canonDetail.standingProvenance.typedLinkTrail.map((link) => `${link.linkTypeKey} ${link.note}`).join(", ") || "none"}</p>
                        </section>
                      )}
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
                if (next === "temporal_timeline") setPromptTemplateKey("temporal_spatial_analyst");
                if (next === "contradiction") setPromptTemplateKey("repair_challenge");
              }}>
                <option value="creation">Creation</option>
                <option value="admission">Admission</option>
                <option value="propagation">Propagation</option>
                <option value="contradiction">Contradiction</option>
                <option value="qa">QA</option>
                <option value="institutional_economic_suppression">Institutional / economic / suppression</option>
                <option value="constraint_composition">Constraint Composition</option>
                <option value="temporal_timeline">Temporal/Timeline</option>
              </select></label>
              <label>Template<select value={promptTemplateKey} onChange={(event) => setPromptTemplateKey(event.target.value)}>{templates.map((template) => <option key={template.key} value={template.key}>{template.role_name} v{template.current_version}</option>)}</select></label>
              {selectedTemplate && (
                <div className="doctrine">
                  <strong>{selectedTemplate.role_name}</strong>
                  <span>Provenance: docs/worldbuilding-system/20_ai_assisted_workflow.md</span>
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
              {promptPacketStatusPanel}
              <div className="row">
                {promptPacketExportControls}
              </div>
              <textarea rows={7} value={promptText} onChange={(event) => {
                setPromptText(event.target.value);
                setPromptPacketOrigin(null);
              }} />
              <label>Pasted response<textarea rows={5} value={responseText} onChange={(event) => setResponseText(event.target.value)} /></label>
              <label>Disposition<select value={disposition} onChange={(event) => setDisposition(event.target.value)}>{advisoryDispositions.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
              <div className="row">
                <button onClick={storeAdvisory} disabled={!canUseCurrentPromptPacket || !responseText}>Store Advisory</button>
                <button onClick={skipPrompt} disabled={!openWorld}>Skip Prompt</button>
              </div>
            </section>
          </div>

          <div className="panel">
            <h2>Admission moved to workflow map</h2>
            <p className="status">Use the routed Admission destination for queue selection, severity declaration, seed audit, and Prompt-out guidance.</p>
          </div>

          <div className="panel">
            <h2>Institutional, Economic, and Suppression flow</h2>
            <MethodCardPanel card={stage12Run?.methodCard} />
            <DecisionContractPanel title="Stage-12 decision contract" contract={stage12Run?.decisionPoint?.sharedContract} />
            <div className="doctrine">
              <strong>Method guidance</strong>
              <span>{stage12Run?.methodCard?.operativeRule ?? "Start or resume a stage-12 run to load server-returned method guidance."}</span>
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

          {temporalPanel}

          <div className="panel">
            <h2>Constraint Composition flow</h2>
            <MethodCardPanel card={constraintRun?.decisionPoint?.sharedContract.methodCard} />
            <section className="subpanel">
              <h3>Start or Resume Constraint Composition</h3>
              <div className="doctrine">
                <strong>Method guidance</strong>
                <span>{constraintRun?.decisionPoint?.sharedContract.methodCard?.operativeRule ?? "Start or resume a run to load server-returned method guidance."}</span>
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
            <MethodCardPanel card={stage13Run?.methodCard} />
            <DecisionContractPanel title="Stage 13 decision contract" contract={stage13Run?.decisionPoint?.sharedContract} />
            <div className="doctrine">
              <strong>Stage 13</strong>
              <span>{stage13Run?.methodCard?.operativeRule ?? "Start or refresh a Stage 13 run to load server-returned contradiction guidance."}</span>
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

          {propagationGuidedPanel}

          <div className="panel">
            <h2>QA flow</h2>
            <MethodCardPanel card={qaScorecard?.methodCard} />
            <DecisionContractPanel title="QA decision contract" contract={qaScorecard?.decisionPoint?.sharedContract} />
            <div className="doctrine">
              <strong>Scorecard</strong>
              <span>{qaScorecard?.methodCard?.operativeRule ?? "Start or refresh a QA pass to load server-returned scorecard guidance."}</span>
              <span>{qaBand ? `Band: ${qaBand.color} - ${qaBand.reason}` : "Start or refresh a QA pass to load scorecard policy."}</span>
              {qaScorecard?.subjectMode && <span>Consequence mode: {qaScorecard.subjectMode}</span>}
            </div>
            {qaScorecard?.minimalViableWorldEcho && (
              <section className="subpanel minimal-viable-world-echo">
                <h3>Minimal Viable World echo</h3>
                <div className="chips">
                  <span>{qaScorecard.minimalViableWorldEcho.status}</span>
                  <span>{qaScorecard.minimalViableWorldEcho.report ? qaScorecard.minimalViableWorldEcho.report.shortId : qaScorecard.minimalViableWorldEcho.route}</span>
                  <span>Deferrals {qaScorecard.minimalViableWorldEcho.unresolvedDeferrals.length}</span>
                  <span>Debt {qaScorecard.minimalViableWorldEcho.openCanonDebt.length}</span>
                  <span>Proposals {qaScorecard.minimalViableWorldEcho.admissionProposals.length}</span>
                </div>
                <div className="grid compact-grid">
                  <section>
                    <h4>Coverage echo</h4>
                    {qaScorecard.minimalViableWorldEcho.coverageSignalSummary.map((signal) => (
                      <p key={signal.key}><strong>{signal.label}</strong>: {signal.status}</p>
                    ))}
                  </section>
                  <section>
                    <h4>Protected mystery evidence</h4>
                    {qaScorecard.minimalViableWorldEcho.protectedMysteryEvidence.length
                      ? qaScorecard.minimalViableWorldEcho.protectedMysteryEvidence.map((signal) => <p key={signal.key}>{signal.label}: {signal.status}</p>)
                      : <p>No protected mystery evidence returned.</p>}
                  </section>
                  <section>
                    <h4>Read-side trail</h4>
                    {qaScorecard.minimalViableWorldEcho.readSideTrail.map((item) => <p key={`${item.label}:${item.href}`}>{item.label} · {item.href}</p>)}
                  </section>
                </div>
              </section>
            )}
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
            <MethodCardPanel card={displayedCreationDecision.methodCard} />
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
                <strong>Provenance</strong>
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
            {minimalViableWorldIsOwed && minimalViableWorldFullPanel}
            <section className="subpanel">
              <h3>Kernel authoring</h3>
              <p>Consequence mode is steward judgment; the app does not infer, default, or silently reuse it.</p>
              {creationAuthoringDisabled && (
                <p className="status">{creationStartPending
                  ? "Creation is starting or resuming before kernel fields become writable."
                  : "Creation must start or resume before kernel fields can be saved."}</p>
              )}
              {creationStartError && <p className="error">{`Creation start/resume failed: ${creationStartError}. Use Start or Resume Creation to retry; entered material is preserved.`}</p>}
              <section className="subpanel">
                <h4>Consequence mode draft/saved state</h4>
                <p>{savedConsequenceMode ? `Saved consequence mode: ${savedConsequenceMode}.` : "No saved consequence mode yet."}</p>
                <p>{consequenceModeDraftState === "unsaved"
                  ? `Unsaved draft consequence mode: ${consequenceMode}. Save the kernel step before decomposition can use it.`
                  : consequenceModeDraftState === "saved"
                    ? "The visible consequence mode matches saved server state."
                    : "A local selection will remain a draft until the kernel step is saved."}</p>
              </section>
              <section className="subpanel">
                <h4>Selected section state</h4>
                <p>{selectedSectionContract?.emptyState.message ?? "No selected section contract loaded."}</p>
                <p>{selectedSectionHasHeldDraft
                  ? `Unsaved draft held under its own heading key: ${kernelHeading}.`
                  : "No unsaved section draft is being transferred between headings."}</p>
                <p className="meta">{selectedSectionContract ? `Save target: ${selectedSectionContract.saveTarget.heading}` : "Save target loads from the server contract."}</p>
              </section>
              <div className="grid">
                <label>Kernel step<select value={kernelHeading} onChange={(event) => handleKernelHeadingChange(event.target.value)} disabled={creationAuthoringDisabled}>{headings.filter((heading) => heading.record_type_key === "world_kernel").map((heading) => <option key={heading.heading}>{heading.heading}</option>)}</select></label>
                <label>Consequence mode<select value={consequenceMode} onChange={(event) => setConsequenceMode(event.target.value)} disabled={creationAuthoringDisabled}><option></option>{consequenceModes.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
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
              <label>Kernel section<textarea rows={4} value={kernelBody} onChange={(event) => updateKernelBody(event.target.value)} disabled={creationAuthoringDisabled} /></label>
              <div className="subpanel">
                <h3>Write preview</h3>
                <p>{displayedCreationDecision.writeIntent.willWrite.join(" · ")}</p>
                <p>{displayedCreationDecision.writeIntent.willLeaveUntouched.join(" · ")}</p>
              </div>
              <button onClick={saveKernelStep} disabled={creationAuthoringDisabled}>Save Kernel Step</button>
            </section>
            <PromptPacketPreview
              title="Prompt-out preview"
              roleLine={`${displayedCreationDecision.promptOut.role} · ${displayedCreationDecision.promptOut.available ? "available" : "blocked"}`}
              modes={creationPromptModesForDisplay}
              preview={creationPromptPreviewForDisplay}
              advisoryNote="Pasted responses remain advisory artifacts and do not mutate kernel sections, seed records, reports, or proposals without explicit steward use."
              action={
                <div className="grid compact-grid">
                  <label>Prompt mode<select value={creationPromptMode} onChange={(event) => setCreationPromptMode(event.target.value as "proposal" | "pressure")}>
                    {creationPromptModes.map((mode) => <option key={mode.mode} value={mode.mode}>{mode.label}</option>)}
                  </select></label>
                  <p className="status">{creationPromptModeStatus}</p>
                  <p className="status">{loadedCreationPromptMode
                    ? `Loaded mode: ${loadedCreationPromptMode === "pressure" ? "Pressure mode" : "Proposal mode"}`
                    : "Loaded mode: none yet"}</p>
                  <button onClick={loadCreationPromptStep} disabled={!canLoadCreationPromptStep}>Load Creation Prompt-out Step</button>
                </div>
              }
            />
            <section className="subpanel">
              <h3>Seed decomposition decision</h3>
              <p>Split broad steward material into smaller seed facts that can be independently rejected.</p>
              <p>Truth layer is steward-supplied judgment; the app stores the selected layer and does not infer it from prose.</p>
              <p>Actual current status: proposed</p>
              <section className="subpanel">
                <h4>Pre-submit readiness</h4>
                <div className="grid compact-grid">
                  {(displayedDecompositionReadiness ?? defaultCreationDecision.decompositionReadiness).map((item) => (
                    <article key={item.key} className={`subpanel readiness ${item.status}`}>
                      <h3>{item.label}</h3>
                      <p>{item.message}</p>
                      <p className="meta">{item.remediation}</p>
                    </article>
                  ))}
                </div>
              </section>
              <section className="subpanel inline-recovery">
                <h4>Inline recovery</h4>
                <p>{decompositionError ?? "Server-returned decomposition blockers render here near the action; entered title, body, truth layer, and granularity inputs stay in place."}</p>
              </section>
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
              <button onClick={decompose} disabled={decomposeDisabled}>Decompose and Park Seed</button>
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
            {!minimalViableWorldIsOwed && activeCreationStatePanel}
            {!minimalViableWorldIsOwed && minimalViableWorldCompactPanel}
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
