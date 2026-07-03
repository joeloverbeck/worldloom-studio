import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import type { HealthPayload, LinkTypeDefinition, RecordTypeDefinition } from "@worldloom/shared";
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

interface AdmissionQueueRow extends RecordRow {
  admissionLevel: string | null;
  workScale: string | null;
  constraintTags: string[];
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

interface AppProps {
  initialRecords?: RecordRow[];
  initialOpenWorld?: string | null;
  initialCanonCurrent?: CanonWorkbenchCurrentRow[];
  initialCanonAudit?: CanonWorkbenchAuditItem[];
  initialCanonDetail?: CanonWorkbenchDetail | null;
}

type PromptFlowKey = "creation" | "admission" | "propagation" | "contradiction" | "qa" | "institutional_economic_suppression";

const storedToken = () => typeof window === "undefined" ? "" : window.localStorage.getItem("worldloom-token") ?? "";

const api = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const token = storedToken();
  const response = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(token ? { "x-worldloom-token": token } : {}),
      ...init?.headers
    }
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? response.statusText);
  return payload as T;
};

const emptyRecordForm = {
  title: "",
  body: "",
  truthLayer: "",
  canonStatus: ""
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

function App({
  initialRecords = [],
  initialOpenWorld = null,
  initialCanonCurrent = [],
  initialCanonAudit = [],
  initialCanonDetail = null
}: AppProps = {}) {
  const [token, setToken] = useState(storedToken());
  const [worldPath, setWorldPath] = useState("");
  const [openWorld, setOpenWorld] = useState<string | null>(initialOpenWorld);
  const [serverVersion, setServerVersion] = useState("");
  const [message, setMessage] = useState("");
  const [recordTypes, setRecordTypes] = useState<RecordTypeDefinition[]>([]);
  const [linkTypes, setLinkTypes] = useState<LinkTypeDefinition[]>([]);
  const [records, setRecords] = useState<RecordRow[]>(initialRecords);
  const [links, setLinks] = useState<LinkRow[]>([]);
  const [recentWorlds, setRecentWorlds] = useState<RecentWorld[]>([]);
  const [terms, setTerms] = useState<VocabularyTerm[]>([]);
  const [headings, setHeadings] = useState<SectionHeading[]>([]);
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [facets, setFacets] = useState<FacetRow[]>([]);
  const [drafts, setDrafts] = useState<DraftRow[]>([]);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [admissionQueue, setAdmissionQueue] = useState<AdmissionQueueRow[]>([]);
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
  const advisoryDispositions = useMemo(() => terms.filter((term) => term.vocabulary === "advisory_disposition"), [terms]);
  const admissionLevels = useMemo(() => terms.filter((term) => term.vocabulary === "admission_level"), [terms]);
  const workScales = useMemo(() => terms.filter((term) => term.vocabulary === "work_scale"), [terms]);
  const admissionOperations = useMemo(() => terms.filter((term) => term.vocabulary === "admission_decision_operation"), [terms]);
  const consequenceDispositions = useMemo(() => terms.filter((term) => term.vocabulary === "consequence_disposition"), [terms]);
  const recordTypeByKey = useMemo(() => new Map(recordTypes.map((recordType) => [recordType.key, recordType])), [recordTypes]);
  const selectedRecordType = editingId == null ? recordTypeByKey.get(recordTypeKey) : recordTypeByKey.get(recordTypeKey);
  const editingReportRecord = editingId != null && selectedRecordType?.mutationRegime === "report";
  const canSaveRecord = Boolean(openWorld && recordForm.title.trim() && recordForm.truthLayer && recordForm.canonStatus && !editingReportRecord);
  const selectedHeadings = headings.filter((heading) => heading.record_type_key === recordTypeKey);
  const selectedTemplate = templates.find((template) => template.key === promptTemplateKey);
  const selectedAdmissionRecord = records.find((record) => record.id === Number(admissionRecordId));
  const promptOutFlowId = promptFlowKey === "creation"
    ? flowId
    : promptFlowKey === "propagation"
      ? propagationFlowId
      : promptFlowKey === "qa"
        ? qaFlowId
        : promptFlowKey === "institutional_economic_suppression"
          ? stage12FlowId
          : null;
  const promptOutRecordId = promptRecordId || (promptFlowKey === "admission"
    ? admissionRecordId
    : promptFlowKey === "propagation"
      ? propagationFactId
      : promptFlowKey === "qa"
        ? qaSubjectRecordId
        : promptFlowKey === "institutional_economic_suppression"
          ? stage12SourceRecordId
          : "");
  const relatedAuditItems = useMemo(() => selectedCanonRecordId == null
    ? []
    : canonAuditTrail.filter((item) => item.affectedCurrentRecords.some((record) => record.id === selectedCanonRecordId)),
  [canonAuditTrail, selectedCanonRecordId]);

  useEffect(() => {
    if (!token) return;
    api<HealthPayload>("/api/health")
      .then((health) => setServerVersion(health.version))
      .catch((error: Error) => setMessage(error.message));
    api<{ recordTypes: RecordTypeDefinition[]; linkTypes: LinkTypeDefinition[] }>("/api/catalog")
      .then((catalog) => {
        setRecordTypes(catalog.recordTypes);
        setLinkTypes(catalog.linkTypes);
        setRecordTypeKey(catalog.recordTypes[0]?.key ?? "canon_fact");
        setPromotionRecordTypeKey(catalog.recordTypes.find((recordType) => recordType.key === "canon_fact")?.key ?? catalog.recordTypes[0]?.key ?? "canon_fact");
        setLinkTypeKey(catalog.linkTypes[0]?.key ?? "depends_on");
        return loadRecentWorlds();
      })
      .catch((error: Error) => setMessage(error.message));
  }, [token]);

  useEffect(() => {
    if (!facetTerm && facetTerms[0]) setFacetTerm(facetTerms[0].term);
  }, [facetTerm, facetTerms]);

  useEffect(() => {
    setTemplateEdit(selectedTemplate?.current_text ?? "");
  }, [selectedTemplate]);

  const rememberToken = (next: string) => {
    setToken(next);
    if (typeof window !== "undefined") window.localStorage.setItem("worldloom-token", next);
  };

  const loadRecentWorlds = async () => {
    const payload = await api<{ recentWorlds: RecentWorld[] }>("/api/recent-worlds");
    setRecentWorlds(payload.recentWorlds);
  };

  const loadWorldData = async () => {
    const [recordPayload, linkPayload, vocabularyPayload, headingPayload, draftPayload, templatePayload, queuePayload, debtPayload, propagationQueuePayload, canonCurrentPayload, canonAuditPayload] = await Promise.all([
      api<{ records: RecordRow[] }>("/api/records"),
      api<{ links: LinkRow[] }>("/api/links"),
      api<{ terms: VocabularyTerm[] }>("/api/vocabularies"),
      api<{ headings: SectionHeading[] }>("/api/section-headings"),
      api<{ drafts: DraftRow[] }>("/api/drafts"),
      api<{ templates: PromptTemplate[] }>("/api/prompt-templates"),
      api<{ queue: AdmissionQueueRow[] }>("/api/admission/queue"),
      api<{ debt: RecordRow[] }>("/api/canon-debt?open=true"),
      api<{ queue: PropagationQueueRow[] }>("/api/propagation/queue"),
      api<{ rows: CanonWorkbenchCurrentRow[] }>("/api/canon-workbench/current"),
      api<{ spine: CanonWorkbenchAuditItem[] }>("/api/canon-workbench/audit")
    ]);
    setRecords(recordPayload.records);
    setLinks(linkPayload.links);
    setTerms(vocabularyPayload.terms);
    setHeadings(headingPayload.headings);
    setDrafts(draftPayload.drafts);
    setTemplates(templatePayload.templates);
    setAdmissionQueue(queuePayload.queue);
    setCanonDebt(debtPayload.debt);
    setPropagationQueue(propagationQueuePayload.queue);
    setCanonCurrentRows(canonCurrentPayload.rows);
    setCanonAuditTrail(canonAuditPayload.spine);
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
    const payload = await api<{ path: string; records: RecordRow[] }>(`/api/worlds/${mode}`, {
      method: "POST",
      body: JSON.stringify({ path: selectedPath })
    });
    setOpenWorld(payload.path);
    setRecords(payload.records);
    await loadWorldData();
    await loadRecentWorlds();
    setMessage(`${mode === "create" ? "Created" : "Opened"} ${payload.path}`);
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

  const generatePrompt = async () => {
    const payload = await api<{ prompt: string }>("/api/prompt-out/generate", {
      method: "POST",
      body: JSON.stringify({
        flowKey: promptFlowKey,
        flowId: promptOutFlowId ?? undefined,
        templateKey: promptTemplateKey,
        recordId: promptOutRecordId ? Number(promptOutRecordId) : undefined,
        stepKey: promptTemplateKey
      })
    });
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
    const stage12 = promptFlowKey === "institutional_economic_suppression" && promptOutFlowId != null;
    const artifact = await api<{ record: RecordRow }>(stage12 ? "/api/institutional/advisory-artifacts" : "/api/prompt-out/advisory-artifacts", {
      method: "POST",
      body: JSON.stringify(stage12
        ? {
            flowId: promptOutFlowId,
            stepKey: promptTemplateKey,
            promptText,
            responseText
          }
        : {
            flowKey: promptFlowKey,
            flowId: promptOutFlowId ?? undefined,
            stepKey: promptTemplateKey,
            promptText,
            responseText
          })
    });
    await api(`/api/prompt-out/advisory-artifacts/${artifact.record.id}/dispositions`, {
      method: "POST",
      body: JSON.stringify({ disposition, note: responseText, standingRuling: disposition === "standing ruling" })
    });
    await loadWorldData();
    setMessage(`Stored ${artifact.record.shortId}`);
  };

  const startFlow = async () => {
    const payload = await api<{ flow: { id: number; kernel_record_id?: number } }>("/api/flows/creation/start", { method: "POST" });
    setFlowId(payload.flow.id);
    if (payload.flow.kernel_record_id) setKernelRecordId(payload.flow.kernel_record_id);
  };

  const saveKernelStep = async () => {
    if (flowId == null) return;
    const payload = await api<{ kernel: { id: number } }>("/api/flows/creation/kernel-step", {
      method: "POST",
      body: JSON.stringify({ flowId, heading: kernelHeading, body: kernelBody, consequenceMode: consequenceMode || undefined })
    });
    setKernelRecordId(payload.kernel.id);
    await loadWorldData();
  };

  const skipPrompt = async () => {
    await api("/api/prompt-out/skip", {
      method: "POST",
      body: JSON.stringify({
        flowKey: promptFlowKey,
        flowId: promptOutFlowId ?? undefined,
        recordId: promptFlowKey === "admission" && admissionRecordId ? Number(admissionRecordId) : undefined,
        stepKey: promptTemplateKey,
        admissionLevel: admissionLevel || undefined,
        workScale: workScale || undefined,
        reason: gateNotApplicable || undefined
      })
    });
    await loadWorldData();
  };

  const decompose = async () => {
    if (flowId == null || kernelRecordId == null) return;
    await api("/api/flows/creation/decompose", {
      method: "POST",
      body: JSON.stringify({
        flowId,
        kernelRecordId,
        seeds: [{ title: seedTitle, body: seedBody, truthLayer: recordForm.truthLayer, canonStatus: recordForm.canonStatus }]
      })
    });
    setSeedTitle("");
    setSeedBody("");
    await loadWorldData();
  };

  const proposeRecord = async (record: RecordRow) => {
    await api(`/api/admission/propose-record/${record.id}`, { method: "POST" });
    setAdmissionRecordId(String(record.id));
    await loadWorldData();
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
    await api(`/api/admission/records/${admissionRecordId}/severity`, {
      method: "POST",
      body: JSON.stringify({ admissionLevel, workScale })
    });
    await loadWorldData();
  };

  const startAdmission = async () => {
    if (!admissionRecordId) return;
    await api(`/api/admission/records/${admissionRecordId}/start`, { method: "POST" });
    await loadWorldData();
  };

  const completeAdmission = async () => {
    if (!admissionRecordId) return;
    await api("/api/admission/gate/complete", {
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
    await api("/api/admission/seed-audit", {
      method: "POST",
      body: JSON.stringify({ seedRecordIds: [Number(admissionRecordId)], findings: seedAuditFindings, decision: "proceed" })
    });
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
    await api("/api/admission/skip", {
      method: "POST",
      body: JSON.stringify({ recordId: admissionRecordId ? Number(admissionRecordId) : undefined, stepKey: "web_admission_instrument", admissionLevel, workScale, reason: gateNotApplicable || undefined })
    });
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

  return (
    <main>
      <header className="topbar">
        <div>
          <h1>Worldloom Studio</h1>
          <p>{serverVersion ? `Server ${serverVersion} · ` : ""}{openWorld ?? "No world file open"}</p>
        </div>
        <input aria-label="Worldloom token" placeholder="server token" value={token} onChange={(event) => rememberToken(event.target.value)} />
      </header>

      <section className="workspace">
        <aside className="sidebar">
          <label>World file path<input value={worldPath} onChange={(event) => setWorldPath(event.target.value)} placeholder="/tmp/example.worldloom.sqlite" /></label>
          <div className="row">
            <button onClick={() => createOrOpen("create")}>Create</button>
            <button onClick={() => createOrOpen("open")}>Open</button>
          </div>
          <label>Snapshot path<input value={snapshotPath} onChange={(event) => setSnapshotPath(event.target.value)} placeholder="/tmp/example.snapshot.sqlite" /></label>
          <button onClick={snapshot} disabled={!openWorld}>Snapshot</button>
          <label>Markdown export directory<input value={exportDirectory} onChange={(event) => setExportDirectory(event.target.value)} placeholder="/tmp/example-markdown-export" /></label>
          <button onClick={exportWorldMarkdown} disabled={!openWorld || !exportDirectory.trim()}>Export World Markdown</button>
          <div className="recent">
            {recentWorlds.map((recent) => <button key={recent.path} onClick={() => { setWorldPath(recent.path); void createOrOpen("open", recent.path); }}>{recent.path}</button>)}
          </div>
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
              <h2>Prompt-out</h2>
              <label>Prompt context<select value={promptFlowKey} onChange={(event) => {
                const next = event.target.value as PromptFlowKey;
                setPromptFlowKey(next);
                if (next === "institutional_economic_suppression") setPromptTemplateKey("institution_economy_analyst");
              }}>
                <option value="creation">Creation</option>
                <option value="admission">Admission</option>
                <option value="propagation">Propagation</option>
                <option value="contradiction">Contradiction</option>
                <option value="qa">QA</option>
                <option value="institutional_economic_suppression">Institutional / economic / suppression</option>
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
              {admissionQueue.map((row) => (
                <article key={row.id}>
                  <button onClick={() => setAdmissionRecordId(String(row.id))}>Select</button>
                  <h3>{row.shortId} · {row.title}</h3>
                  <p className="meta">{row.canonStatus} · level {row.admissionLevel ?? "unset"} · {row.workScale ?? "unset"} · tags {row.constraintTags.join(", ") || "none"}</p>
                </article>
              ))}
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

          <div className="panel">
            <h2>Creation flow</h2>
            <div className="row">
              <button onClick={startFlow} disabled={!openWorld}>Start or Resume</button>
              <span className="status">{flowId ? `Flow ${flowId}${kernelRecordId ? ` · kernel ${kernelRecordId}` : ""}` : ""}</span>
            </div>
            <div className="grid">
              <label>Kernel step<select value={kernelHeading} onChange={(event) => setKernelHeading(event.target.value)}>{headings.filter((heading) => heading.record_type_key === "world_kernel").map((heading) => <option key={heading.heading}>{heading.heading}</option>)}</select></label>
              <label>Consequence mode<select value={consequenceMode} onChange={(event) => setConsequenceMode(event.target.value)}><option></option>{consequenceModes.map((term) => <option key={term.term}>{term.term}</option>)}</select></label>
            </div>
            <div className="doctrine">
              <strong>Doctrine at point of use</strong>
              <span>Kernel steps derive from docs/worldbuilding-system/05_creation_protocol.md and docs/worldbuilding-system/templates/world_kernel.md.</span>
              <span>Decomposition uses the granularity rule: split until each seed can be independently rejected without destroying its siblings; stop at the thin-start boundary.</span>
            </div>
            <label>Kernel section<textarea rows={4} value={kernelBody} onChange={(event) => setKernelBody(event.target.value)} /></label>
            <button onClick={saveKernelStep} disabled={flowId == null}>Save Kernel Step</button>
            <div className="grid">
              <label>Seed title<input value={seedTitle} onChange={(event) => setSeedTitle(event.target.value)} /></label>
              <label>Seed body<input value={seedBody} onChange={(event) => setSeedBody(event.target.value)} /></label>
            </div>
            <button onClick={decompose} disabled={flowId == null || kernelRecordId == null || !seedTitle || !recordForm.truthLayer || !recordForm.canonStatus}>Decompose and Park Seed</button>
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
