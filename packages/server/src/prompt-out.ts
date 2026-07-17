import { isFoundationalSeverity, isMajorOrHigher, requiresSkipReason, type DeclaredSeverity } from "./severity-policy.js";
import * as CreationCoverage from "./creation-coverage.js";
import { resolveCreationDecompositionHandoff } from "./creation-handoff.js";
import { methodCard, methodCardDoctrineSlots, methodCardSourceManifest, maybeMethodCard } from "./method-cards.js";
import { PROMPT_TEMPLATE_SEEDS } from "./prompt-out-defaults.js";
import * as PropagationStore from "./propagation-store.js";
import * as TemporalStore from "./temporal-store.js";
import { foundationalProposalDoctrine, foundationalProposalManifest, foundationalProposalOmissions, propagationPacketCompleteness, propagationRelatedWorldContext, PROPAGATION_ATLAS_DOMAINS, PROPAGATION_RELATED_WORLD_BUDGET, type PropagationPacketCompleteness, type PropagationRelatedWorldContext, type PropagationRelatedWorldRecord } from "./propagation-prompt-context.js";
import type { PromptMode } from "./decision-point-contract.js";
import type { MethodCard } from "@worldloom/shared";
import type { RecordInput, RecordRow, WorldFile } from "./world-file.js";
import { createHash } from "node:crypto";

export type PromptOutFlowKey = "creation" | "admission" | "propagation" | "contradiction" | "qa" | string;

export interface PromptTemplateRow {
  key: string;
  role_name: string;
  original_text: string;
  package_source: string;
  current_version: number;
  current_text: string;
}

const BUILT_IN_PROMPT_TEMPLATES: PromptTemplateRow[] = PROMPT_TEMPLATE_SEEDS.map((template) => ({
  key: template.key,
  role_name: template.roleName,
  original_text: template.text,
  package_source: template.packageSource,
  current_version: 1,
  current_text: template.text
}));

export interface AdvisoryDispositionRow {
  id: number;
  advisory_record_id: number;
  disposition: string;
  note: string;
  standing_ruling: number;
  created_at: string;
}

export interface PromptOutStepContext {
  flowKey?: PromptOutFlowKey;
  flowId?: number;
  stepKey: string;
  mode?: PromptMode;
  activeSetRevision?: number | null;
  selectedSectionHeading?: string | null;
  admissionLevel?: string | null;
  workScale?: string | null;
  reason?: string;
}

export interface PromptGenerationInput {
  flowKey?: PromptOutFlowKey;
  flowId?: number;
  templateKey: string;
  recordId?: number;
  stepKey?: string;
  mode?: PromptMode;
  activeSetRevision?: number | null;
  selectedSectionHeading?: string | null;
  admissionLevel?: string | null;
  workScale?: string | null;
  admissionFullGateDraft?: AdmissionFullGateDraftPayload | null;
}

export interface AdmissionFullGateDraftSection {
  key: string;
  label?: string;
  substance?: string;
  notApplicableReason?: string;
  quietDomainDeclaration?: string;
}

export interface AdmissionFullGateDraftPayload {
  saved?: boolean;
  draftHash?: string;
  sectionKeys?: string[];
  sections?: AdmissionFullGateDraftSection[];
  consequenceText?: string;
  operations?: string[];
  targetCanonStatus?: string;
  constraintTags?: string[];
  followUpDebt?: string;
  advisoryRecordId?: number | null;
}

export type AdmissionDraftState = "not_applicable" | "missing_required" | "incomplete" | "represented";

export interface PromptPacketIdentity {
  worldPath: string | null;
  flowKey: PromptOutFlowKey | null;
  flowId: number | null;
  stepKey: string;
  mode: PromptMode;
  templateKey: string;
  recordId: number | null;
  recordShortId: string | null;
  recordTypeKey: string | null;
  selectedSectionHeading: string | null;
  admissionLevel: string | null;
  workScale: string | null;
  activeSetRevision: number | null;
  admissionDraftState: AdmissionDraftState;
  admissionDraftHash: string | null;
  admissionSectionKeys: string[];
  decisionLabel: string;
  generatedAt: string | null;
  packetHash: string | null;
  bodyHash: string | null;
  sourceManifestHash: string | null;
}

export interface PromptEvidenceItem {
  id: string;
  displayText: string;
  kind: "source" | "omission";
  candidateIdentity: string | null;
  ruleIdentity: string;
  standing: { truthLayer: string | null; canonStatus: string | null } | null;
  relationship: string | null;
  decisionMeaning: string | null;
  provenanceReferences: string[];
  aggregatePathCount: number | null;
}

interface PromptEvidenceDraft extends Omit<PromptEvidenceItem, "id" | "provenanceReferences" | "aggregatePathCount"> {
  provenanceReferences?: string[];
  contributionCount?: number;
}

type PromptIdentityRecord = Pick<RecordRow, "id" | "shortId" | "recordTypeKey" | "title">;

export interface PromptGenerationResult {
  prompt: string;
  promptOut: {
    flowKey: PromptOutFlowKey | null;
    flowId: number | null;
    stepKey: string;
    mode: PromptMode;
    templateKey: string;
    recordId: number | null;
    packetIdentity: PromptPacketIdentity;
    evidence: {
      sourceManifest: PromptEvidenceItem[];
      omissions: PromptEvidenceItem[];
    };
    propagationContext?: PropagationPacketContextPreview | null;
    temporalContext?: TemporalPacketContextPreview | null;
  };
}

export interface TemporalPacketContextRecord {
  id: number;
  shortId: string;
  title: string;
  recordTypeKey: string;
  body: string;
  standing: {
    truthLayer: string | null;
    canonStatus: string | null;
  };
  relationship: {
    kind: string;
    direction: "selected" | "incoming" | "outgoing" | "world";
    note: string;
  };
  provenance: {
    actor: string;
    timestamp: string;
    flowStep: string;
  };
  inclusionReason: string;
}

export interface TemporalPacketContextPreview {
  serverOwned: true;
  mode: PromptMode;
  flowKey: "temporal_timeline";
  stepKey: string;
  packageSources: string[];
  completeness: { status: "complete" | "incomplete"; blockers: string[] };
  coverage: Array<{ key: string; label: string; value: string }>;
  selectedSource: TemporalPacketContextRecord | null;
  sourcePropagation: TemporalPacketContextRecord[];
  relatedCanon: TemporalPacketContextRecord[];
  openDebt: TemporalPacketContextRecord[];
  protectedBoundaries: TemporalPacketContextRecord[];
  kernelCommitments: TemporalPacketContextRecord[];
  timelineCards: TemporalPacketContextRecord[];
  routedProposals: TemporalPacketContextRecord[];
  skips: TemporalPacketContextRecord[];
  advisoryDispositions: Array<{ advisory: TemporalPacketContextRecord; dispositions: AdvisoryDispositionRow[] }>;
  sourceDocuments: PromptDocument[];
  sourceManifest: PromptEvidenceItem[];
  omissions: PromptEvidenceItem[];
  outputLabels: string[];
  advisoryCanonWarning: string;
  recovery: {
    method: "POST";
    href: "/api/prompt-out/steps";
    body: {
      flowKey: "temporal_timeline";
      flowId: number;
      recordId?: number;
      templateKey: string;
      stepKey: string;
      mode: PromptMode;
      label: string;
      activeSetRevision: number;
    };
  };
  orientation: { current: string; next: string; resume: string; safeExit: string };
  readOnlyGuarantee: string;
}

export interface PropagationPacketContextPreview {
  serverOwned: true;
  mode: PromptMode;
  decisionPoint: string;
  packageSources: string[];
  atlas: {
    required: boolean;
    domains: Array<{ name: string; decisionPrompt: string }>;
    triage: string;
    severityReason: string;
  };
  completeness: PropagationPacketCompleteness;
  relatedWorld: {
    aggregateBudget: number;
    perRecordCap: number;
    usedCharacters: number;
    completeness: PropagationRelatedWorldContext["completeness"];
    selectedRecords: PropagationRelatedWorldRecord[];
  };
  sourceManifest: PromptEvidenceItem[];
  omissions: PromptEvidenceItem[];
  advisoryCanonWarning: string;
  readOnlyGuarantee: string;
}

export interface AdvisoryResponseInput {
  flowKey?: PromptOutFlowKey;
  flowId?: number;
  stepKey: string;
  mode?: PromptMode;
  activeSetRevision?: number | null;
  promptText: string;
  responseText: string;
}

const contextLines = (input: { flowKey?: PromptOutFlowKey; flowId?: number; stepKey: string; selectedSectionHeading?: string | null; activeSetRevision?: number | null }): string[] => [
  ...(input.flowKey ? [`Flow: ${input.flowKey}`] : []),
  ...(input.flowId == null ? [] : [`Flow id: ${input.flowId}`]),
  ...(input.activeSetRevision == null ? [] : [`Active set revision: ${input.activeSetRevision}`]),
  ...(input.selectedSectionHeading ? [`Selected section heading: ${input.selectedSectionHeading}`] : []),
  `Step: ${input.stepKey}`
];

const modeLine = (mode?: PromptMode): string[] => mode ? [`Mode: ${mode}`] : [];

interface PromptDocument {
  source: string;
  content: string;
}

interface PromptPacketInput {
  mode: PromptMode;
  roleName: string;
  templateText: string;
  currentDecision: string;
  modeRequest: string;
  bearingContext: string[];
  packageDoctrine: string[];
  decisionMaterial: string[];
  sourceDocuments: PromptDocument[];
  standingRulings: string[];
  omissions: Array<string | PromptEvidenceItem>;
  sourceManifest: Array<string | PromptEvidenceItem>;
  advisoryWarning: string;
  outputLabels?: string[];
}

const DEFAULT_OUTPUT_LABELS = [
  "selected",
  "deleted",
  "challenged",
  "ignored",
  "standing ruling",
  "adopted with steward revision",
  "rejected"
];

const compact = (lines: string[]): string =>
  lines.map((line) => line.trim()).filter(Boolean).join("\n");

const tagBlock = (tag: string, body: string): string =>
  [`<${tag}>`, body.trim() || "(none)", `</${tag}>`].join("\n");

const inlineTag = (tag: string, body: string): string =>
  `<${tag}>${body.trim() || "(none)"}</${tag}>`;

const renderList = (lines: string[]): string =>
  lines.length ? lines.map((line) => `- ${line}`).join("\n") : "- none";

const renderEvidenceList = (items: Array<string | PromptEvidenceItem>, section: "omissions" | "source_manifest"): string =>
  items.length ? items.map((item) => {
    if (typeof item === "string") return `- ${item}`;
    const standing = item.standing == null
      ? "standing not applicable"
      : `standing truth=${item.standing.truthLayer ?? "unset"}, canon=${item.standing.canonStatus ?? "unset"}`;
    const detail = [
      `evidence ${item.id}`,
      `kind ${item.kind}`,
      `candidate ${item.candidateIdentity ?? "none"}`,
      `rule ${item.ruleIdentity}`,
      standing,
      `relationship ${item.relationship ?? "none"}`,
      `decision meaning ${item.decisionMeaning ?? "none"}`,
      `provenance ${item.provenanceReferences.join(" | ") || "none"}`,
      ...(item.aggregatePathCount == null ? [] : [`aggregate path count ${item.aggregatePathCount}`])
    ].join("; ");
    const prefix = section === "source_manifest" && item.kind === "omission" ? "Omission: " : "";
    return `- ${prefix}${item.displayText} [${detail}]`;
  }).join("\n") : "- none";

const renderDocuments = (documents: PromptDocument[]): string =>
  tagBlock("documents", documents.map((document) => tagBlock("document", [
    inlineTag("source", document.source),
    tagBlock("document_content", document.content || "(empty)")
  ].join("\n"))).join("\n\n") || "(none)");

const packetHash = (prompt: string): string =>
  createHash("sha256").update(prompt).digest("hex");

const manifestHash = (sourceManifest: unknown[]): string =>
  packetHash(stableJson(sourceManifest));

const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableJson(entryValue)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
};

const evidenceSemanticTuple = (item: PromptEvidenceDraft): unknown => ({
  candidateIdentity: item.candidateIdentity,
  decisionMeaning: item.decisionMeaning,
  kind: item.kind,
  relationship: item.relationship,
  ruleIdentity: item.ruleIdentity,
  standing: item.standing
});

const canonicalizePromptEvidence = (drafts: PromptEvidenceDraft[]): PromptEvidenceItem[] => {
  const groups = new Map<string, {
    draft: PromptEvidenceDraft;
    displayTexts: Set<string>;
    provenanceReferences: Set<string>;
    contributionCount: number;
  }>();
  for (const draft of drafts) {
    const semanticKey = stableJson(evidenceSemanticTuple(draft));
    const existing = groups.get(semanticKey);
    if (existing) {
      existing.displayTexts.add(draft.displayText);
      for (const reference of draft.provenanceReferences ?? []) existing.provenanceReferences.add(reference);
      existing.contributionCount += draft.contributionCount ?? 1;
      continue;
    }
    groups.set(semanticKey, {
      draft,
      displayTexts: new Set([draft.displayText]),
      provenanceReferences: new Set(draft.provenanceReferences ?? []),
      contributionCount: draft.contributionCount ?? 1
    });
  }
  return [...groups.entries()]
    .map(([semanticKey, group]) => ({
      id: `prompt-evidence-${createHash("sha256").update(semanticKey).digest("hex").slice(0, 20)}`,
      displayText: [...group.displayTexts].sort((left, right) => left.localeCompare(right))[0]!,
      kind: group.draft.kind,
      candidateIdentity: group.draft.candidateIdentity,
      ruleIdentity: group.draft.ruleIdentity,
      standing: group.draft.standing,
      relationship: group.draft.relationship,
      decisionMeaning: group.draft.decisionMeaning,
      provenanceReferences: [...group.provenanceReferences].sort((left, right) => left.localeCompare(right)),
      aggregatePathCount: group.contributionCount > 1 ? group.contributionCount : null
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
};

const promptEvidenceCompatibilityBoundary = (
  items: Array<string | PromptEvidenceItem>,
  kind: PromptEvidenceItem["kind"],
  collectionIdentity: string
): PromptEvidenceItem[] => items.map((item, index) => {
  if (typeof item !== "string") return item;
  const fallbackKey = stableJson({ collectionIdentity, index, kind });
  return {
    id: `prompt-evidence-${createHash("sha256").update(fallbackKey).digest("hex").slice(0, 20)}`,
    displayText: item.replace(/^Omission:\s*/, ""),
    kind,
    candidateIdentity: null,
    ruleIdentity: "compatibility.string-row",
    standing: null,
    relationship: null,
    decisionMeaning: `legacy ${kind} row ${index + 1} in ${collectionIdentity}`,
    provenanceReferences: [`compatibility:${collectionIdentity}:${index + 1}`],
    aggregatePathCount: null
  };
});

const packetEvidenceCollections = (input: {
  sourceManifest: Array<string | PromptEvidenceItem>;
  omissions: Array<string | PromptEvidenceItem>;
  collectionIdentity: string;
}): { sourceManifest: PromptEvidenceItem[]; omissions: PromptEvidenceItem[] } => {
  const omissions = promptEvidenceCompatibilityBoundary(
    input.omissions,
    "omission",
    `${input.collectionIdentity}:omissions`
  );
  const sourceRows = input.sourceManifest.filter((item) =>
    typeof item !== "string" || !item.startsWith("Omission: "));
  const sourceManifest = promptEvidenceCompatibilityBoundary(
    sourceRows,
    "source",
    `${input.collectionIdentity}:source-manifest`
  );
  const byId = new Map(sourceManifest.map((item) => [item.id, item]));
  for (const omission of omissions) byId.set(omission.id, omission);
  return { sourceManifest: [...byId.values()], omissions };
};

const admissionDraftSectionKeys = (draft?: AdmissionFullGateDraftPayload | null): string[] =>
  draft?.sectionKeys?.length
    ? draft.sectionKeys
    : draft?.sections?.map((section) => section.key) ?? [];

const draftText = (value?: string | null): string => value?.trim() ?? "";

const admissionDraftOmissions = (draft?: AdmissionFullGateDraftPayload | null): string[] => {
  if (!draft) return ["Admission full-gate draft omitted: required draft payload was not provided."];
  const omissions: string[] = [];
  for (const section of draft.sections ?? []) {
    const label = draftText(section.label) || section.key;
    if (!draftText(section.substance)) omissions.push(`Missing full-gate draft substance: ${label}`);
  }
  if (!draftText(draft.consequenceText)) omissions.push("Missing full-gate draft written consequence.");
  if (!draft.operations?.length) omissions.push("Missing full-gate draft operation order.");
  return omissions;
};

const admissionDraftHash = (draft?: AdmissionFullGateDraftPayload | null): string | null =>
  draft ? draft.draftHash ?? packetHash(stableJson({
    ...draft,
    draftHash: undefined,
    sectionKeys: admissionDraftSectionKeys(draft),
    sections: draft.sections ?? []
  })) : null;

const admissionDraftRequired = (input: PromptGenerationInput, mode: PromptMode): boolean =>
  input.flowKey === "admission" && input.templateKey === "admission_constraint_challenge" && mode === "pressure";

const admissionDraftState = (input: PromptGenerationInput, mode: PromptMode): AdmissionDraftState => {
  if (!admissionDraftRequired(input, mode)) return "not_applicable";
  if (!input.admissionFullGateDraft) return "missing_required";
  return admissionDraftOmissions(input.admissionFullGateDraft).length ? "incomplete" : "represented";
};

const quoteGrounding = "Quote-grounding pre-step: first quote the specific canon, doctrine, or source-record lines your candidates or critiques rest on before the main answer.";

const topForbiddenSummary = "Forbidden-move summary: no canon standing, no truth layer or status assignment, no separated package-label assignment, no final canon wording, no hidden assumptions, and no automatic adoption.";

const forbiddenMoves = (mode: PromptMode): string[] => [
  "Prohibition: do not assign canon standing. Rationale: only Admission and the steward can change canon standing. Positive restatement: label every proposal as a candidate for steward review.",
  "Prohibition: do not assign truth layer, status, constraint tag, admission operation, repair operation, consequence mode, or preservation boundary. Rationale: the methodology keeps these as separated steward judgments. Positive restatement: name any recommended label as a recommendation with reasons.",
  "Prohibition: do not write final canon. Rationale: the steward authors surviving material in their own wording. Positive restatement: return challenge, risks, alternatives, and questions for steward disposition.",
  "Prohibition: do not hide invented facts or borrowed assumptions. Rationale: cold prompt-out only works when provenance and assumptions are auditable. Positive restatement: mark assumptions and provenance gaps plainly.",
  mode === "proposal"
    ? "Prohibition: do not collapse proposal alternatives into one safe answer. Rationale: proposal mode needs real steward choice. Positive restatement: offer alternatives that differ along named axes: premise, mechanism, and consequence."
    : "Prohibition: do not turn pressure mode into a rewrite. Rationale: pressure mode exists to challenge steward-authored material. Positive restatement: keep challenge, risks, alternatives, and questions separate from final canon authorship."
];

const structuralSkeleton = (mode: PromptMode): string => mode === "proposal"
  ? [
      "Structural skeleton example (proposal mode)",
      "Grounding quotes:",
      "- \"<short source or doctrine quote>\" — <source id>",
      "",
      "Candidate A — <axis difference: premise | mechanism | consequence>",
      "Candidate material: <content-light candidate wording>",
      "Assumptions: <labeled assumptions or none>",
      "Risks: <advisory risks>",
      "Questions: <steward decisions owed>"
    ].join("\n")
  : [
      "Structural skeleton example (pressure mode)",
      "Grounding quotes:",
      "- \"<short source or doctrine quote>\" — <source id>",
      "",
      "Challenge: <what breaks or goes unsupported>",
      "Risk: <canon, mystery, causality, or fidelity risk>",
      "Alternative: <non-final option the steward may consider>",
      "Question: <decision the steward must answer>"
    ].join("\n");

const roleStance = (mode: PromptMode, roleName: string): string =>
  mode === "proposal"
    ? `Role stance (not an accuracy claim): ${roleName} frames candidate generation for the current decision.`
    : `Role stance (not an accuracy claim): ${roleName} frames pressure, risks, alternatives, and questions.`;

const renderPromptPacket = (input: PromptPacketInput): string => {
  const outputLabels = input.outputLabels ?? DEFAULT_OUTPUT_LABELS;
  const modeTitle = input.mode === "proposal" ? "Proposal mode" : "Pressure mode";
  const modeRequest = input.mode === "proposal"
    ? `${input.modeRequest} Require alternatives that differ along named axes: premise, mechanism, and consequence.`
    : input.modeRequest;
  const compactTop = tagBlock("compact_top_block", compact([
    `Mode: ${modeTitle}`,
    roleStance(input.mode, input.roleName),
    `Advisory/canon warning: ${input.advisoryWarning}`,
    topForbiddenSummary,
    `Output-label names: ${outputLabels.join("; ")}`
  ]));
  const contextPacket = tagBlock("context_packet", [
    "Context preview:",
    tagBlock("bearing_context", compact([
      "Micro-instruction: use this as decision-bearing context only; omissions are listed with reasons.",
      ...input.bearingContext
    ])),
    tagBlock("package_doctrine", compact([
      "Micro-instruction: these are excerpts or app-owned derivations at point of use; omissions are listed separately.",
      ...input.packageDoctrine
    ])),
    tagBlock("decision_material", compact([
      "Micro-instruction: treat steward-authored material as material under review and pasted/proposed material as advisory until the steward acts.",
      ...input.decisionMaterial
    ])),
    tagBlock("source_records", renderDocuments(input.sourceDocuments)),
    tagBlock("standing_rulings", renderList(input.standingRulings)),
    tagBlock("omissions", renderEvidenceList(input.omissions, "omissions")),
    tagBlock("source_manifest", compact(["Source manifest:", renderEvidenceList(input.sourceManifest, "source_manifest")]))
  ].join("\n\n"));
  const bottom = [
    "Current decision:",
    input.currentDecision,
    "",
    "Mode request:",
    modeRequest,
    "",
    quoteGrounding,
    "",
    "Forbidden moves with rationales and positive restatements:",
    ...forbiddenMoves(input.mode),
    "",
    "Output label definitions:",
    ...outputLabels.map((label) => `- ${label}: advisory label for steward disposition; not canon status.`),
    "",
    structuralSkeleton(input.mode),
    "",
    `Default prompt derivation: ${input.templateText}`,
    "",
    `Based on the material above, answer only for the current decision in ${input.mode} mode and keep every claim traceable to the quoted packet material.`
  ].join("\n");
  return [compactTop, contextPacket, bottom].join("\n\n");
};

const rowToPromptTemplate = (row: Record<string, unknown>): PromptTemplateRow => ({
  key: String(row.key),
  role_name: String(row.role_name),
  original_text: String(row.original_text),
  package_source: String(row.package_source),
  current_version: Number(row.current_version),
  current_text: String(row.current_text)
});

const rowToAdvisoryDisposition = (row: Record<string, unknown>): AdvisoryDispositionRow => ({
  id: Number(row.id),
  advisory_record_id: Number(row.advisory_record_id),
  disposition: String(row.disposition),
  note: String(row.note ?? ""),
  standing_ruling: Number(row.standing_ruling),
  created_at: String(row.created_at)
});

const promptTemplateRows = (world: WorldFile): PromptTemplateRow[] => {
  const rows = world.db.prepare(`
    SELECT pt.*, ptv.text AS current_text
    FROM prompt_templates pt
    JOIN prompt_template_versions ptv ON ptv.template_key = pt.key AND ptv.version = pt.current_version
    ORDER BY pt.key
  `).all().map((row) => rowToPromptTemplate(row as Record<string, unknown>));
  const existing = new Set(rows.map((row) => row.key));
  return [...rows, ...BUILT_IN_PROMPT_TEMPLATES.filter((row) => !existing.has(row.key))];
};

const promptTemplateRow = (world: WorldFile, key: string): PromptTemplateRow => {
  const row = world.db.prepare(`
    SELECT pt.*, ptv.text AS current_text
    FROM prompt_templates pt
    JOIN prompt_template_versions ptv ON ptv.template_key = pt.key AND ptv.version = pt.current_version
    WHERE pt.key = ?
  `).get(key) as Record<string, unknown> | undefined;
  if (!row) {
    const builtIn = BUILT_IN_PROMPT_TEMPLATES.find((template) => template.key === key);
    if (builtIn) return builtIn;
    throw new Error(`Prompt template not found: ${key}`);
  }
  return rowToPromptTemplate(row);
};

const appendPromptTemplateVersion = (world: WorldFile, key: string, text: string): PromptTemplateRow => {
  const current = world.db.prepare("SELECT * FROM prompt_templates WHERE key = ?").get(key) as { current_version: number } | undefined;
  if (!current) throw new Error(`Prompt template not found: ${key}`);
  const versionRow = world.db.prepare("SELECT COALESCE(MAX(version), 0) + 1 AS next FROM prompt_template_versions WHERE template_key = ?").get(key) as { next: number };
  const nextVersion = versionRow.next;
  world.atomicWrite(() => {
    world.db.prepare("INSERT INTO prompt_template_versions (template_key, version, text) VALUES (?, ?, ?)").run(key, nextVersion, text);
    world.db.prepare("UPDATE prompt_templates SET current_version = ? WHERE key = ?").run(nextVersion, key);
  });
  return promptTemplateRow(world, key);
};

const promptRecordContext = (world: WorldFile, recordId: number): string => {
  const record = world.getRecord(recordId);
  const sections = world.listSections(recordId);
  return [
    `${record.shortId} ${record.title}`,
    `Type: ${record.recordTypeKey}`,
    `Truth layer: ${record.truthLayer ?? "unset"}`,
    `Canon status: ${record.canonStatus ?? "unset"}`,
    record.body,
    ...sections.map((section) => `## ${section.heading}\n${section.body}\n${section.heading}: ${section.body}`)
  ].filter(Boolean).join("\n");
};

const CREATION_SECTION_PROMPTS: Record<string, string> = {
  "World premise": "What is the world, in one or two sentences?",
  "Core promise": "What experience should the world reliably create?",
  "Starting scale": "Name where the world starts; scale expands only when a fact forces it.",
  "Genre, tone, and consequence-mode commitments": "Name genre, tone, primary consequence mode, secondary modes, tonal boundaries, and what the world must never become by accident.",
  "Foundational facts": "List the few seed facts everything else must answer to.",
  "Foundational constraints": "Name limits that keep the premise from becoming shapeless.",
  "Initial mysteries and protected effects": "Name what is intentionally unknown, sacred, terrifying, or protected from flattening.",
  "Primary pressures and initial domains": "Name three to seven forces that drive adaptation and the domains they touch first.",
  "Ordinary-life promise": "Name everyday residue and one ordinary-life anchor touched by the core pressures."
};

const creationSelectedKernelSection = (world: WorldFile, input: PromptGenerationInput, record: RecordRow): { heading: string; prompt: string; body: string } => {
  const flow = input.flowId == null ? null : world.getFlowInstance(input.flowId, "creation");
  const currentStep = typeof flow?.current_step === "string" ? flow.current_step : "";
  const requestedHeading = input.selectedSectionHeading?.trim();
  if (requestedHeading && !(requestedHeading in CREATION_SECTION_PROMPTS)) {
    throw new Error(`Unknown Creation kernel target heading: ${requestedHeading}`);
  }
  const heading = requestedHeading || (currentStep.startsWith("kernel:") ? currentStep.slice("kernel:".length) : "World premise");
  const body = world.listSections(record.id).find((section) => section.heading === heading)?.body.trim() ?? "";
  return {
    heading,
    prompt: CREATION_SECTION_PROMPTS[heading] ?? "Use the world-kernel template and keep prose steward-authored.",
    body
  };
};

export const promptPacketIdentity = (
  world: WorldFile,
  input: PromptGenerationInput,
  options: {
    mode?: PromptMode;
    stepKey?: string;
    record?: PromptIdentityRecord | null;
    selectedSectionHeading?: string | null;
    decisionLabel?: string;
    generatedAt?: string | null;
    packetHash?: string | null;
    bodyHash?: string | null;
    sourceManifestHash?: string | null;
  } = {}
): PromptPacketIdentity => {
  const stepKey = options.stepKey ?? input.stepKey ?? input.templateKey;
  const mode = options.mode ?? input.mode ?? "pressure";
  const record = options.record === undefined
    ? (input.recordId == null ? null : world.getRecord(input.recordId))
    : options.record;
  const selectedSectionHeading = options.selectedSectionHeading !== undefined
    ? options.selectedSectionHeading
    : input.selectedSectionHeading !== undefined
      ? input.selectedSectionHeading
      : input.flowKey === "creation" && input.templateKey === "kernel_pressure" && record?.recordTypeKey === "world_kernel"
        ? creationSelectedKernelSection(world, input, world.getRecord(record.id)).heading
        : null;
  return {
    flowKey: input.flowKey ?? null,
    worldPath: world.path,
    flowId: input.flowId ?? null,
    stepKey,
    mode,
    templateKey: input.templateKey,
    recordId: record?.id ?? input.recordId ?? null,
    recordShortId: record?.shortId ?? null,
    recordTypeKey: record?.recordTypeKey ?? null,
    selectedSectionHeading: selectedSectionHeading ?? null,
    admissionLevel: input.admissionLevel ?? null,
    workScale: input.workScale ?? null,
    activeSetRevision: input.activeSetRevision ?? null,
    admissionDraftState: admissionDraftState(input, mode),
    admissionDraftHash: admissionDraftHash(input.admissionFullGateDraft),
    admissionSectionKeys: admissionDraftSectionKeys(input.admissionFullGateDraft),
    decisionLabel: options.decisionLabel ?? selectedSectionHeading ?? record?.title ?? stepKey,
    generatedAt: options.generatedAt ?? null,
    packetHash: options.packetHash ?? null,
    bodyHash: options.bodyHash ?? null,
    sourceManifestHash: options.sourceManifestHash ?? null
  };
};

const generatedPacketIdentity = (
  world: WorldFile,
  input: PromptGenerationInput,
  prompt: string,
  options: Parameters<typeof promptPacketIdentity>[2] = {}
): PromptPacketIdentity => {
  const bodyHash = packetHash(prompt);
  const identity = promptPacketIdentity(world, input, {
    ...options,
    generatedAt: new Date().toISOString(),
    bodyHash,
    packetHash: null
  });
  return {
    ...identity,
    packetHash: packetHash(stableJson({ ...identity, generatedAt: null, packetHash: null }))
  };
};

const standingRulingRows = (world: WorldFile): Array<{ disposition: string; note: string }> =>
  world.db.prepare("SELECT disposition, note FROM advisory_dispositions WHERE standing_ruling = 1 ORDER BY id")
    .all()
    .map((row) => {
      const values = row as Record<string, unknown>;
      return { disposition: String(values.disposition), note: String(values.note ?? "") };
    });

const promptMethodCard = (input: PromptGenerationInput): MethodCard | null => {
  if (input.flowKey === "creation") {
    if (input.templateKey === "minimal_viable_world_checkpoint") return methodCard("creation.minimal-viable-world");
    return methodCard(input.templateKey === "decomposition_pressure" ? "creation.seed-decomposition" : "creation.kernel");
  }
  if (input.flowKey === "admission") {
    if (input.templateKey === "admission_queue_severity") return methodCard("admission.queue-severity");
    return methodCard(input.templateKey === "admission_prerequisite_audit" ? "admission.minor-ledger" : "admission.full-gate");
  }
  if (input.flowKey === "constraint_composition") {
    const stepKey = input.stepKey ?? "";
    if (stepKey.includes("skip") || stepKey.includes("prompt") || stepKey.includes("advisory")) return methodCard("constraint.prompt-out-skips");
    return methodCard("constraint.outcomes");
  }
  if (input.flowKey === "temporal_timeline") {
    const stepKey = input.stepKey ?? "";
    if (stepKey.includes("date") || stepKey.includes("granularity")) return methodCard("temporal.date-type-granularity");
    if (stepKey.includes("latency") || stepKey.includes("residue")) return methodCard("temporal.latency-residue");
    if (stepKey.includes("sequence") || stepKey.includes("retrospective")) return methodCard("temporal.sequence-retrospective");
    if (stepKey.includes("mystery") || stepKey.includes("branch")) return methodCard("temporal.mystery-boundaries");
    if (stepKey.includes("skip") || stepKey.includes("prompt") || stepKey.includes("advisory")) return methodCard("temporal.prompt-out-skips");
    return methodCard("temporal.outcomes");
  }
  if (input.flowKey === "institutional_economic_suppression") return methodCard("stage12.outcomes");
  if (input.flowKey === "propagation") return methodCard("propagation.disposition");
  if (input.flowKey === "contradiction") return methodCard(input.templateKey === "boundary_guard" ? "contradiction.mystery-preservation" : "contradiction.repair");
  if (input.flowKey === "qa") return methodCard(input.templateKey === "qa_red_team" ? "qa.repair-routing" : "qa.scorecard");
  return maybeMethodCard(`${input.flowKey ?? ""}.${input.stepKey ?? input.templateKey}`);
};

const temporalReportIdFromStep = (step: string): number | null => {
  const match = step.match(/^temporal:report:(\d+):/);
  return match ? Number(match[1]) : null;
};

const TEMPORAL_COVERAGE_FIELDS = [
  ["temporalQuestions", "Temporal questions"],
  ["firstTrueOrRelativeSequence", "First true or relative sequence"],
  ["firstKnownOrReason", "First known date or reason"],
  ["dateTypesAndGranularity", "Date types and granularity"],
  ["latency", "Latency"],
  ["residueByTimescale", "Residue by timescale"],
  ["sequenceIntegrity", "Sequence integrity"],
  ["retrospectiveInsertion", "Retrospective insertion"],
  ["temporalMysteryBoundaries", "Temporal mystery boundaries"],
  ["outcomeDecision", "Outcome decision"]
] as const;

const temporalLineValue = (body: string, label: string): string => {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return body.match(new RegExp(`^${escaped}: (.*)$`, "m"))?.[1]?.trim() ?? "";
};

const temporalRecordProvenance = (world: WorldFile, recordId: number, fallbackCreatedAt: string) => {
  const row = world.db.prepare(`
    SELECT actor.name AS actor, record.created_at AS timestamp
    FROM records record
    JOIN actors actor ON actor.id = record.actor_id
    WHERE record.id = ?
  `).get(recordId) as { actor: string; timestamp: string } | undefined;
  return {
    actor: row?.actor ?? "steward",
    timestamp: row?.timestamp ?? fallbackCreatedAt,
    flowStep: "unavailable: record creation did not persist a flow step"
  };
};

const temporalContextRecord = (
  world: WorldFile,
  record: RecordRow,
  relationship: TemporalPacketContextRecord["relationship"],
  inclusionReason: string
): TemporalPacketContextRecord => ({
  id: record.id,
  shortId: record.shortId,
  title: record.title,
  recordTypeKey: record.recordTypeKey,
  body: record.body,
  standing: { truthLayer: record.truthLayer, canonStatus: record.canonStatus },
  relationship,
  provenance: temporalRecordProvenance(world, record.id, record.createdAt),
  inclusionReason
});

const temporalRelationship = (recordId: number, link: ReturnType<WorldFile["listLinks"]>[number]): TemporalPacketContextRecord["relationship"] => ({
  kind: link.linkTypeKey,
  direction: link.fromRecordId === recordId ? "outgoing" : "incoming",
  note: link.note
});

const temporalRecordManifest = (record: TemporalPacketContextRecord): string =>
  `${record.shortId} ${record.title}; type ${record.recordTypeKey}; standing truth=${record.standing.truthLayer ?? "unset"}, canon=${record.standing.canonStatus ?? "unset"}; relationship ${record.relationship.direction}:${record.relationship.kind} (${record.relationship.note || "no note"}); inclusion ${record.inclusionReason}; provenance actor=${record.provenance.actor}, timestamp=${record.provenance.timestamp}, flow_step=${record.provenance.flowStep}`;

const temporalOmissionDraft = (input: {
  displayText: string;
  ruleIdentity: string;
  decisionMeaning: string;
  candidate?: RecordRow | null;
  relationship?: string | null;
  provenanceReferences: string[];
}): PromptEvidenceDraft => ({
  displayText: input.displayText,
  kind: "omission",
  candidateIdentity: input.candidate?.shortId ?? null,
  ruleIdentity: input.ruleIdentity,
  standing: input.candidate == null
    ? null
    : { truthLayer: input.candidate.truthLayer, canonStatus: input.candidate.canonStatus },
  relationship: input.relationship ?? null,
  decisionMeaning: input.decisionMeaning,
  provenanceReferences: input.provenanceReferences
});

const temporalRecordEvidenceDraft = (record: TemporalPacketContextRecord): PromptEvidenceDraft => ({
  displayText: temporalRecordManifest(record),
  kind: "source",
  candidateIdentity: record.shortId,
  ruleIdentity: "temporal.included-context",
  standing: record.standing,
  relationship: `${record.relationship.direction}:${record.relationship.kind}`,
  decisionMeaning: record.inclusionReason,
  provenanceReferences: [
    `record:${record.shortId}:actor=${record.provenance.actor}:timestamp=${record.provenance.timestamp}:flow-step=${record.provenance.flowStep}`
  ]
});

const inactiveTemporalStatuses = new Set(["superseded", "deprecated", "rejected", "withdrawn"]);

type TemporalContextLink = ReturnType<WorldFile["listLinks"]>[number];

const uniqueTemporalLinks = (links: TemporalContextLink[]): TemporalContextLink[] =>
  links.filter((link, index) => links.findIndex((candidate) => candidate.id === link.id) === index);

const temporalContextGraph = (world: WorldFile, reportId: number, sourceRecordId: number | null, flowId?: number) => {
  const directLinks = sourceRecordId == null ? [] : world.listLinks(sourceRecordId);
  const directIds = new Set(directLinks.flatMap((link) => [link.fromRecordId, link.toRecordId]));
  if (sourceRecordId != null) directIds.delete(sourceRecordId);
  directIds.delete(reportId);
  const secondHopLinks = [...directIds].flatMap((recordId) => world.listLinks(recordId));
  const staged = flowId == null ? null : TemporalStore.findRun(world, flowId);
  const reportLinks = [
    ...(reportId > 0 ? world.listLinks(reportId) : []),
    ...(staged?.retained_prior_report_record_id == null ? [] : world.listLinks(staged.retained_prior_report_record_id)),
    ...(flowId == null ? [] : TemporalStore.listOutcomes(world, flowId).map((outcome, index) => ({
      id: -(index + 1),
      fromRecordId: reportId,
      toRecordId: outcome.record_id,
      linkTypeKey: outcome.link_type_key,
      note: outcome.note,
      createdAt: staged?.created_at ?? ""
    })))
  ];
  const revisionLinks = uniqueTemporalLinks([...directLinks, ...secondHopLinks, ...reportLinks]);
  return { directLinks, directIds, secondHopLinks, reportLinks, revisionLinks };
};

export const temporalPacketRevision = (world: WorldFile, flowId: number): number => {
  const staged = TemporalStore.findRun(world, flowId);
  if (staged) {
    const reportIds = [staged.retained_prior_report_record_id, staged.final_report_record_id].filter((id): id is number => id != null);
    const outcomes = TemporalStore.listOutcomes(world, flowId);
    const outcomeIds = outcomes.map((outcome) => outcome.record_id);
    const advisoryRecordIds = world.listRecords().filter((record) => outcomeIds.includes(record.id) && record.recordTypeKey === "advisory_artifact").map((record) => record.id);
    const contextRecordIds = new Set<number>([
      ...(staged.source_record_id == null ? [] : [staged.source_record_id]),
      ...reportIds,
      ...outcomeIds,
      ...world.listRecords().filter((record) => record.recordTypeKey === "world_kernel").map((record) => record.id)
    ]);
    const records = world.listRecords().filter((record) => contextRecordIds.has(record.id));
    const digest = createHash("sha256").update(stableJson({
      run: staged,
      revisions: TemporalStore.listRevisions(world, flowId),
      records,
      reportSections: reportIds.flatMap((reportId) => world.listSections(reportId)),
      links: reportIds.flatMap((reportId) => world.listLinks(reportId)),
      outcomes,
      advisoryDispositions: advisoryRecordIds.flatMap((recordId) => world.db.prepare("SELECT * FROM advisory_dispositions WHERE advisory_record_id = ? ORDER BY id").all(recordId)),
      standingRulings: standingRulingRows(world),
      promptTemplate: promptTemplateRow(world, "temporal_spatial_analyst")
    })).digest();
    return digest.readUInt32BE(0);
  }
  const flow = world.getFlowInstance(flowId, "temporal_timeline");
  const reportId = temporalReportIdFromStep(String(flow.current_step));
  if (reportId == null) throw new Error("Temporal packet identity requires a pass report bound to the current flow");
  const report = world.getRecord(reportId);
  const sourceRecordIdText = temporalLineValue(report.body, "Source record id");
  const sourceRecordId = sourceRecordIdText ? Number(sourceRecordIdText) : null;
  const graph = temporalContextGraph(world, reportId, sourceRecordId);
  const contextRecordIds = new Set<number>([
    reportId,
    ...(sourceRecordId == null ? [] : [sourceRecordId]),
    ...graph.directIds,
    ...graph.revisionLinks.flatMap((link) => [link.fromRecordId, link.toRecordId]),
    ...world.listRecords().filter((record) => record.recordTypeKey === "world_kernel").map((record) => record.id)
  ]);
  const contextRecords = world.listRecords().filter((record) => contextRecordIds.has(record.id));
  const advisoryRecordIds = contextRecords.filter((record) => record.recordTypeKey === "advisory_artifact").map((record) => record.id);
  const digest = createHash("sha256").update(stableJson({
    report,
    sections: world.listSections(reportId),
    records: contextRecords,
    links: graph.revisionLinks,
    advisoryDispositions: advisoryRecordIds.flatMap((recordId) => world.db.prepare("SELECT * FROM advisory_dispositions WHERE advisory_record_id = ? ORDER BY id").all(recordId)),
    standingRulings: standingRulingRows(world),
    promptTemplate: promptTemplateRow(world, "temporal_spatial_analyst")
  })).digest();
  return digest.readUInt32BE(0);
};

export const assertTemporalPacketCurrent = (world: WorldFile, flowId: number, submittedRevision?: number | null): void => {
  const currentRevision = temporalPacketRevision(world, flowId);
  if (submittedRevision == null || submittedRevision !== currentRevision) {
    const error = new Error(`stale Temporal packet identity (submitted revision ${submittedRevision ?? "missing"}; current revision ${currentRevision})`) as Error & { remediation: string };
    error.remediation = "Preserve the selected Temporal mode, refresh the run, and invoke its server-provided current-packet recovery action.";
    throw error;
  }
};

const temporalIncompleteContextError = (detail: string): Error & { remediation: string } => {
  const error = new Error(`Temporal Prompt-out incomplete context: ${detail}`) as Error & { remediation: string };
  error.remediation = "Preserve the selected mode, repair the named Temporal context, refresh the run, and use its server-provided current-packet recovery action.";
  return error;
};

const temporalPromptContext = (world: WorldFile, input: PromptGenerationInput): {
  lines: string[];
  sourceDocuments: PromptDocument[];
  sourceManifest: PromptEvidenceItem[];
  omissions: PromptEvidenceItem[];
  preview: TemporalPacketContextPreview | null;
} => {
  if (input.flowKey !== "temporal_timeline" || input.flowId == null) {
    return { lines: [], sourceDocuments: [], sourceManifest: [], omissions: [], preview: null };
  }
  if (input.mode == null) throw new Error("Temporal Prompt-out requires an explicit Proposal or Pressure mode; omitted mode is never an implicit Pressure request");
  const flow = world.getFlowInstance(input.flowId, "temporal_timeline");
  const staged = TemporalStore.findRun(world, input.flowId);
  const legacyReportId = temporalReportIdFromStep(String(flow.current_step));
  if (!staged && legacyReportId == null) {
    throw temporalIncompleteContextError("the current flow does not identify its pass report");
  }
  const activeRevision = staged ? TemporalStore.activeRevision(world, input.flowId) : null;
  const report: RecordRow = staged
    ? {
        id: -input.flowId,
        shortId: `TEMPORAL-RUN-${input.flowId}`,
        recordTypeKey: "pass_report",
        title: `Open Temporal staging: ${staged.source_summary}`,
        body: [
          "Flow key: temporal_timeline",
          `Flow id: ${input.flowId}`,
          `Source type: ${staged.source_type}`,
          `Source record id: ${staged.source_record_id ?? ""}`,
          `Material title: ${staged.material_title}`,
          `Material body: ${staged.material_body}`,
          `Audited subject: ${staged.audited_subject}`,
          `Source summary: ${staged.source_summary}`,
          `Active revision id: ${activeRevision?.id ?? "none"}`,
          `Active-set identity: temporal:${input.flowId}:${staged.active_set_revision}:${activeRevision?.id ?? "none"}`
        ].join("\n"),
        truthLayer: "Objective canon",
        canonStatus: "under review",
        createdAt: staged.created_at,
        updatedAt: staged.created_at
      }
    : world.getRecord(legacyReportId!);
  const sections = staged
    ? activeRevision == null
      ? []
      : [{ heading: "Coverage lenses", body: TEMPORAL_COVERAGE_FIELDS.map(([key, label]) => `${label}: ${activeRevision.values[key]}`).join("\n") }]
    : world.listSections(report.id);
  const coverageSection = sections.find((section) => section.heading === "Coverage lenses") ?? null;
  const coverage = TEMPORAL_COVERAGE_FIELDS.map(([key, label]) => ({
    key,
    label,
    value: coverageSection ? temporalLineValue(coverageSection.body, label) : ""
  }));
  const sourceRecordIdText = temporalLineValue(report.body, "Source record id");
  const sourceRecordId = staged?.source_record_id ?? (sourceRecordIdText ? Number(sourceRecordIdText) : null);
  const materialTitle = staged?.material_title ?? temporalLineValue(report.body, "Material title");
  const materialBody = staged?.material_body ?? temporalLineValue(report.body, "Material body");
  const blockers: string[] = [];
  if (input.recordId != null && sourceRecordId != null && input.recordId !== sourceRecordId) {
    blockers.push(`selected record ${input.recordId} does not match Temporal source record ${sourceRecordId}`);
  }
  if (sourceRecordId == null && !materialBody) blockers.push("selected source fact or material is unavailable");
  if (input.mode === "pressure" && coverage.some((item) => !item.value)) blockers.push("Pressure requires all ten saved Temporal coverage lenses");

  const selectedRecord = sourceRecordId == null ? null : world.getRecord(sourceRecordId);
  const selectedSource = selectedRecord == null
    ? materialBody
      ? {
          id: report.id,
          shortId: `${report.shortId}:material`,
          title: materialTitle,
          recordTypeKey: "selected_material",
          body: materialBody,
          standing: { truthLayer: null, canonStatus: null },
          relationship: {
            kind: "selected_temporal_material",
            direction: "selected" as const,
            note: "Selected steward material persisted by the Temporal pass report"
          },
          provenance: temporalRecordProvenance(world, report.id, report.createdAt),
          inclusionReason: "This selected material is the steward-authored subject whose timing, latency, residue, and sequence are under decision."
        }
      : null
    : temporalContextRecord(world, selectedRecord, {
        kind: "selected_temporal_source",
        direction: "selected",
        note: "Source identity persisted by the Temporal pass report"
      }, "The selected source is the material whose timing, latency, residue, and sequence are under decision.");
  const graph = temporalContextGraph(world, report.id, selectedRecord?.id ?? null, input.flowId);
  const sourcePropagation: TemporalPacketContextRecord[] = [];
  const relatedCanon: TemporalPacketContextRecord[] = [];
  const openDebt: TemporalPacketContextRecord[] = [];
  const protectedBoundaries: TemporalPacketContextRecord[] = [];
  const timelineCards: TemporalPacketContextRecord[] = [];
  const routedProposals: TemporalPacketContextRecord[] = [];
  const skips: TemporalPacketContextRecord[] = [];
  const advisoryDispositions: Array<{ advisory: TemporalPacketContextRecord; dispositions: AdvisoryDispositionRow[] }> = [];
  const omissionDrafts: PromptEvidenceDraft[] = [];
  const stagedOutcomeIds = new Set(TemporalStore.findRun(world, input.flowId) ? TemporalStore.listOutcomes(world, input.flowId).map((outcome) => outcome.record_id) : []);
  const seenDirectRecordIds = new Set<number>();

  for (const link of graph.directLinks) {
    const otherId = link.fromRecordId === selectedRecord?.id ? link.toRecordId : link.fromRecordId;
    const candidate = world.getRecord(otherId);
    if (candidate.id === report.id) continue;
    if (stagedOutcomeIds.has(candidate.id)) continue;
    if (seenDirectRecordIds.has(candidate.id)) continue;
    seenDirectRecordIds.add(candidate.id);
    if (inactiveTemporalStatuses.has(candidate.canonStatus ?? "")) {
      omissionDrafts.push(temporalOmissionDraft({
        displayText: `${candidate.shortId} omitted as inactive ${candidate.canonStatus} context; it is historical rather than current support.`,
        ruleIdentity: "temporal.inactive-current-support",
        decisionMeaning: "historical rather than current Temporal support",
        candidate,
        relationship: link.linkTypeKey,
        provenanceReferences: [`direct-path:selected=${selectedRecord?.shortId ?? "material"}:link=${link.id}:candidate=${candidate.shortId}`]
      }));
      continue;
    }
    const relationship = temporalRelationship(selectedRecord!.id, link);
    if (candidate.recordTypeKey === "propagation_report") {
      sourcePropagation.push(temporalContextRecord(world, candidate, relationship, "The linked final Propagation report and any recorded gate result establish why Temporal work is owed."));
    } else if (candidate.recordTypeKey === "canon_fact") {
      relatedCanon.push(temporalContextRecord(world, candidate, relationship, "This directly related canon fact can constrain the current Temporal decision."));
    } else if (candidate.recordTypeKey === "canon_debt") {
      if (candidate.canonStatus === "accepted" || candidate.body.includes("State: closed")) {
        omissionDrafts.push(temporalOmissionDraft({
          displayText: `${candidate.shortId} omitted because the linked canon debt is closed or inactive.`,
          ruleIdentity: "temporal.closed-debt",
          decisionMeaning: "closed debt is not current Temporal support",
          candidate,
          relationship: link.linkTypeKey,
          provenanceReferences: [`direct-path:selected=${selectedRecord?.shortId ?? "material"}:link=${link.id}:candidate=${candidate.shortId}`]
        }));
      } else {
        openDebt.push(temporalContextRecord(world, candidate, relationship, "This open debt bears on unresolved timing or residue work."));
      }
    } else if (candidate.recordTypeKey === "mystery_ledger_entry") {
      protectedBoundaries.push(temporalContextRecord(world, candidate, relationship, "This linked mystery ledger entry bounds what the Temporal pass may explain."));
    } else if (candidate.recordTypeKey !== "world_kernel") {
      omissionDrafts.push(temporalOmissionDraft({
        displayText: `${candidate.shortId} omitted as irrelevant to the Spatial-temporal role despite direct relationship ${link.linkTypeKey}.`,
        ruleIdentity: "temporal.role-irrelevant",
        decisionMeaning: "irrelevant to the Spatial-temporal role",
        candidate,
        relationship: link.linkTypeKey,
        provenanceReferences: [`direct-path:selected=${selectedRecord?.shortId ?? "material"}:link=${link.id}:candidate=${candidate.shortId}`]
      }));
    }
  }

  const kernelRecords = world.listRecords().filter((record) => record.recordTypeKey === "world_kernel");
  for (const record of kernelRecords.filter((candidate) => inactiveTemporalStatuses.has(candidate.canonStatus ?? ""))) {
    omissionDrafts.push(temporalOmissionDraft({
      displayText: `${record.shortId} omitted as inactive ${record.canonStatus} world-kernel context; it is historical rather than a current commitment.`,
      ruleIdentity: "temporal.inactive-kernel",
      decisionMeaning: "historical kernel is not a current commitment",
      candidate: record,
      relationship: "world_kernel_commitment",
      provenanceReferences: [`world-kernel:${record.shortId}`]
    }));
  }
  const kernelCommitments = kernelRecords
    .filter((record) => !inactiveTemporalStatuses.has(record.canonStatus ?? ""))
    .map((record) => temporalContextRecord(world, record, {
      kind: "world_kernel_commitment",
      direction: "world",
      note: "Current kernel commitments bound every guided-flow decision"
    }, "Current premise, tone, constraints, or protected effects can bound Temporal candidates and pressure."));

  for (const link of graph.secondHopLinks) {
    const directId = graph.directIds.has(link.fromRecordId)
      ? link.fromRecordId
      : graph.directIds.has(link.toRecordId)
        ? link.toRecordId
        : null;
    if (directId == null) continue;
    const secondHopId = link.fromRecordId === directId ? link.toRecordId : link.fromRecordId;
    if (secondHopId === selectedRecord?.id || graph.directIds.has(secondHopId) || secondHopId === report.id) continue;
    const candidate = world.getRecord(secondHopId);
    if (candidate.recordTypeKey === "world_kernel") continue;
    const directRecord = world.getRecord(directId);
    omissionDrafts.push(temporalOmissionDraft({
      displayText: `${candidate.shortId} omitted by the bounded second-hop rule; only the selected source and its direct structural relationships are decision context.`,
      ruleIdentity: "temporal.bounded-second-hop",
      decisionMeaning: "excluded from bounded Temporal context",
      candidate,
      relationship: link.linkTypeKey,
      provenanceReferences: [`bounded-path:selected=${selectedRecord?.shortId ?? "material"}:via=${directRecord.shortId}:link=${link.id}:candidate=${candidate.shortId}`]
    }));
  }

  const seenOutcomeIds = new Set<number>();
  for (const link of graph.reportLinks.filter((candidate) => candidate.fromRecordId === report.id)) {
    const candidate = world.getRecord(link.toRecordId);
    if (candidate.id === selectedRecord?.id || seenOutcomeIds.has(candidate.id)) continue;
    seenOutcomeIds.add(candidate.id);
    if (inactiveTemporalStatuses.has(candidate.canonStatus ?? "")) {
      omissionDrafts.push(temporalOmissionDraft({
        displayText: `${candidate.shortId} omitted as inactive ${candidate.canonStatus} Temporal outcome context.`,
        ruleIdentity: "temporal.inactive-outcome",
        decisionMeaning: "inactive outcome is not current Temporal support",
        candidate,
        relationship: link.linkTypeKey,
        provenanceReferences: [`report-path:report=${report.shortId}:link=${link.id}:candidate=${candidate.shortId}`]
      }));
      continue;
    }
    const relationship = temporalRelationship(report.id, link);
    if (candidate.recordTypeKey === "temporal_timeline") {
      timelineCards.push(temporalContextRecord(world, candidate, relationship, "This existing timeline card records timing already proposed or adopted for the current Temporal pass."));
    } else if (candidate.recordTypeKey === "canon_fact" && link.linkTypeKey === "covers") {
      routedProposals.push(temporalContextRecord(world, candidate, relationship, "This proposed fact was routed from the current Temporal pass for Admission review."));
    } else if (candidate.recordTypeKey === "canon_debt") {
      if (candidate.canonStatus === "accepted" || candidate.body.includes("State: closed")) {
        omissionDrafts.push(temporalOmissionDraft({
          displayText: `${candidate.shortId} omitted because the report-linked canon debt is closed or inactive.`,
          ruleIdentity: "temporal.closed-debt",
          decisionMeaning: "closed debt is not current Temporal support",
          candidate,
          relationship: link.linkTypeKey,
          provenanceReferences: [`report-path:report=${report.shortId}:link=${link.id}:candidate=${candidate.shortId}`]
        }));
      } else if (!openDebt.some((record) => record.id === candidate.id)) {
        openDebt.push(temporalContextRecord(world, candidate, relationship, "This open debt records unresolved work from the current Temporal pass."));
      }
    } else if (candidate.recordTypeKey === "skip_record") {
      skips.push(temporalContextRecord(world, candidate, relationship, "This governed skip records a declined Temporal instrument and its reason."));
    } else if (candidate.recordTypeKey === "advisory_artifact") {
      const dispositions = world.db.prepare("SELECT * FROM advisory_dispositions WHERE advisory_record_id = ? ORDER BY id")
        .all(candidate.id)
        .map((row) => rowToAdvisoryDisposition(row as Record<string, unknown>));
      if (!dispositions.length) omissionDrafts.push(temporalOmissionDraft({
        displayText: `${candidate.shortId} advisory disposition unavailable: the stored advisory has no explicit steward disposition yet.`,
        ruleIdentity: "temporal.missing-advisory-disposition",
        decisionMeaning: "undisposed advisory material is not current guidance",
        candidate,
        relationship: link.linkTypeKey,
        provenanceReferences: [`report-path:report=${report.shortId}:link=${link.id}:candidate=${candidate.shortId}`]
      }));
      const dispositionBody = dispositions.map((row) => `${row.disposition}${row.note ? `: ${row.note}` : ""}`).join("\n");
      const advisory = temporalContextRecord(world, {
        ...candidate,
        body: [candidate.body, dispositionBody ? `Advisory dispositions:\n${dispositionBody}` : ""].filter(Boolean).join("\n\n")
      }, relationship, "This stored advisory and its steward dispositions can constrain repeated suggestions without changing canon standing.");
      advisoryDispositions.push({ advisory, dispositions });
    } else if (candidate.recordTypeKey !== "pass_report") {
      omissionDrafts.push(temporalOmissionDraft({
        displayText: `${candidate.shortId} omitted as irrelevant report-linked context for the current Temporal decision.`,
        ruleIdentity: "temporal.report-role-irrelevant",
        decisionMeaning: "report-linked record is irrelevant to the current Temporal decision",
        candidate,
        relationship: link.linkTypeKey,
        provenanceReferences: [`report-path:report=${report.shortId}:link=${link.id}:candidate=${candidate.shortId}`]
      }));
    }
  }
  const unavailable = (present: boolean, displayText: string, ruleIdentity: string, decisionMeaning: string): void => {
    if (present) return;
    omissionDrafts.push(temporalOmissionDraft({
      displayText,
      ruleIdentity,
      decisionMeaning,
      provenanceReferences: [`temporal-run:${input.flowId}:${ruleIdentity}`]
    }));
  };
  unavailable(sourcePropagation.length > 0, "Source Propagation report unavailable: no directly linked final Propagation report is present for this Temporal source.", "temporal.missing-source-propagation", "required source Propagation context is unavailable");
  unavailable(relatedCanon.length > 0, "Related canon unavailable: no active directly linked canon fact bears on this Temporal decision.", "temporal.missing-related-canon", "related current canon is unavailable");
  unavailable(openDebt.length > 0, "Open debt unavailable: no active directly linked canon debt bears on this Temporal decision.", "temporal.missing-open-debt", "bearing open debt is unavailable");
  unavailable(protectedBoundaries.length > 0, "Protected-boundary context unavailable: no active directly linked mystery ledger entry bears on this decision.", "temporal.missing-protected-boundary", "bearing protected boundary is unavailable");
  unavailable(kernelCommitments.length > 0, "Kernel commitments unavailable: this world has no active world-kernel record.", "temporal.missing-kernel", "current kernel commitment is unavailable");
  unavailable(timelineCards.length > 0, "Existing timeline cards unavailable: this Temporal pass has no linked timeline card.", "temporal.missing-timeline-card", "existing timeline-card context is unavailable");
  unavailable(routedProposals.length > 0, "Routed proposals unavailable: this Temporal pass has no fact proposal routed to Admission.", "temporal.missing-routed-proposal", "routed Admission proposal context is unavailable");
  unavailable(skips.length > 0, "Governed skips unavailable: this Temporal pass has no recorded skipped instrument.", "temporal.missing-skip", "governed skip context is unavailable");
  unavailable(advisoryDispositions.length > 0, "Advisory dispositions unavailable: this Temporal pass has no linked advisory artifact and disposition history.", "temporal.missing-advisory-history", "advisory disposition history is unavailable");
  unavailable(coverageSection != null, "Saved Temporal coverage unavailable: no Coverage lenses section exists yet; Proposal may help draft candidates, but Pressure is incomplete.", "temporal.missing-coverage", "saved Temporal coverage is unavailable");
  for (const item of coverage.filter((item) => !item.value)) omissionDrafts.push({
    displayText: `${item.label} unavailable: no saved steward-authored value exists yet.`,
    kind: "omission",
    candidateIdentity: `temporal-coverage:${input.flowId}:${item.key}`,
    ruleIdentity: "temporal.missing-coverage-lens",
    standing: null,
    relationship: "active-revision",
    decisionMeaning: "required saved Temporal coverage lens is unavailable",
    provenanceReferences: [`temporal-run:${input.flowId}:coverage:${item.key}`]
  });

  const includedRecords = [
    ...(selectedSource ? [selectedSource] : []),
    ...sourcePropagation,
    ...relatedCanon,
    ...openDebt,
    ...protectedBoundaries,
    ...kernelCommitments,
    ...timelineCards,
    ...routedProposals,
    ...skips,
    ...advisoryDispositions.map((item) => item.advisory)
  ];
  const sourceDocuments: PromptDocument[] = [
    { source: `temporal_report:${report.shortId}`, content: [report.body, ...sections.map((section) => `## ${section.heading}\n${section.body}`)].join("\n\n") },
    ...includedRecords.map((record) => ({ source: `${record.recordTypeKey}:${record.shortId}`, content: [temporalRecordManifest(record), record.body].join("\n") }))
  ];
  const omissions = canonicalizePromptEvidence(omissionDrafts);
  const sourceManifest = canonicalizePromptEvidence([
    {
      displayText: `Temporal pass report: ${report.shortId} ${report.title}; flow ${input.flowId}; provenance current step ${String(flow.current_step)}`,
      kind: "source",
      candidateIdentity: report.shortId,
      ruleIdentity: "temporal.current-pass",
      standing: { truthLayer: report.truthLayer, canonStatus: report.canonStatus },
      relationship: "selected-temporal-run",
      decisionMeaning: "current Temporal run and report context",
      provenanceReferences: [`temporal-run:${input.flowId}:step=${String(flow.current_step)}`]
    },
    ...coverage.map((item): PromptEvidenceDraft => ({
      displayText: `Temporal coverage lens: ${item.label}; saved=${item.value ? "yes" : "no"}`,
      kind: "source",
      candidateIdentity: `temporal-coverage:${input.flowId}:${item.key}`,
      ruleIdentity: "temporal.coverage-lens",
      standing: null,
      relationship: "active-revision",
      decisionMeaning: item.value ? "saved active Temporal coverage" : "missing active Temporal coverage",
      provenanceReferences: [`temporal-run:${input.flowId}:revision=${activeRevision?.id ?? "legacy"}:coverage=${item.key}`]
    })),
    ...includedRecords.map(temporalRecordEvidenceDraft),
    ...omissionDrafts
  ]);
  const revision = temporalPacketRevision(world, input.flowId);
  const stepKey = input.stepKey ?? input.templateKey;
  const advisoryCanonWarning = "This Prompt-out packet is optional advisory support. The steward authors surviving material; only Admission may change canon standing.";
  const preview: TemporalPacketContextPreview = {
    serverOwned: true,
    mode: input.mode,
    flowKey: "temporal_timeline",
    stepKey,
    packageSources: [
      "docs/worldbuilding-system/09_temporal_and_timeline_protocol.md",
      "docs/worldbuilding-system/20_ai_assisted_workflow.md"
    ],
    completeness: { status: blockers.length ? "incomplete" : "complete", blockers },
    coverage,
    selectedSource,
    sourcePropagation,
    relatedCanon,
    openDebt,
    protectedBoundaries,
    kernelCommitments,
    timelineCards,
    routedProposals,
    skips,
    advisoryDispositions,
    sourceDocuments,
    sourceManifest,
    omissions,
    outputLabels: [...DEFAULT_OUTPUT_LABELS],
    advisoryCanonWarning,
    recovery: {
      method: "POST",
      href: "/api/prompt-out/steps",
      body: {
        flowKey: "temporal_timeline",
        flowId: input.flowId,
        ...(selectedRecord ? { recordId: selectedRecord.id } : {}),
        templateKey: input.templateKey,
        stepKey,
        mode: input.mode,
        label: input.mode === "proposal" ? "Temporal Proposal" : "Spatial-temporal analyst",
        activeSetRevision: revision
      }
    },
    orientation: {
      current: `Temporal/Timeline · ${String(flow.current_step)}`,
      next: coverageSection ? "Review the current packet, then choose an explicit Temporal outcome or close preview." : "Save Temporal coverage or use Proposal mode to draft candidates.",
      resume: `Resume Temporal run ${input.flowId} from pass report ${report.shortId}.`,
      safeExit: "Return to a fresh workflow map; the in-progress pass report preserves current and next orientation."
    },
    readOnlyGuarantee: "Generation, loading, preview, copy, and download create or change no record, link, flow, disposition, skip, debt, status, or world-file content."
  };
  if (blockers.length) {
    throw temporalIncompleteContextError(blockers.join("; "));
  }
  return {
    lines: [
      `Temporal pass report: ${report.shortId} ${report.title}`,
      ...coverage.map((item) => `${item.label}: ${item.value || "not saved"}`),
      ...includedRecords.map((record) => temporalRecordManifest(record))
    ],
    sourceDocuments,
    sourceManifest,
    omissions,
    preview
  };
};

const propagationSeverity = (world: WorldFile, factRecordId: number): DeclaredSeverity => {
  const facets = world.listFacets(factRecordId);
  return {
    admissionLevel: facets.find((facet) => facet.vocabulary === "admission_level")?.term ?? null,
    workScale: facets.find((facet) => facet.vocabulary === "work_scale")?.term ?? null
  };
};

const propagationCoverage = (severity: DeclaredSeverity): string => {
  if (isFoundationalSeverity(severity)) return "full domain-atlas sweep";
  if (isMajorOrHigher(severity)) return "multiple orders and direct/dependency/reaction domains";
  return "immediate effects and one ordinary-life residue when relevant";
};

const propagationPromptBlockers = (
  severity: DeclaredSeverity,
  consequences: PropagationStore.PropagationConsequenceStoreRow[],
  domains: PropagationStore.PropagationDomainSweepStoreRow[]
): string[] => {
  const blockers: string[] = [];
  const orderKeys = new Set(consequences.map((row) => row.order_key));
  const triageStates = new Set(domains.map((row) => row.triage));
  const domainNames = new Set(domains.map((row) => row.domain_name));
  if (isFoundationalSeverity(severity)) {
    if (orderKeys.size < 6) blockers.push("missing-foundational-orders");
    if (PROPAGATION_ATLAS_DOMAINS.some((domain) => !domainNames.has(domain.name))) blockers.push("missing-full-domain-atlas");
    return blockers;
  }
  if (isMajorOrHigher(severity)) {
    if (orderKeys.size < 2) blockers.push("missing-shock-cone-orders");
    for (const triage of ["direct", "dependency", "reaction"] as const) {
      if (!triageStates.has(triage)) blockers.push(`missing-domain-${triage}`);
    }
    return blockers;
  }
  if (!consequences.length) blockers.push("missing-immediate-effect");
  if (!domains.length) blockers.push("missing-ordinary-life-domain");
  return blockers;
};

const propagationPromptContext = (world: WorldFile, input: PromptGenerationInput): { lines: string[]; doctrineLines: string[]; sourceDocuments: PromptDocument[]; sourceManifest: string[]; omissions: string[]; severity: DeclaredSeverity | null; mode: PromptMode; relatedWorld: PropagationRelatedWorldContext } => {
  const mode = input.mode ?? "pressure";
  if (input.flowKey !== "propagation" || input.flowId == null) return {
    lines: [],
    doctrineLines: [],
    sourceDocuments: [],
    sourceManifest: [],
    omissions: [],
    severity: null,
    mode,
    relatedWorld: {
      lines: [],
      sourceDocuments: [],
      selectedRecords: [],
      usedCharacters: 0,
      completeness: { status: "complete", failures: [] },
      sourceManifest: [],
      omissions: []
    }
  };
  const flow = world.getFlowInstance(input.flowId, "propagation");
  const factId = Number(flow.propagation_fact_record_id);
  const fact = world.getRecord(factId);
  const debtId = flow.propagation_debt_record_id == null ? null : Number(flow.propagation_debt_record_id);
  const debt = debtId == null ? null : world.getRecord(debtId);
  const reportId = flow.propagation_report_record_id == null ? null : Number(flow.propagation_report_record_id);
  const allConsequences = PropagationStore.listConsequences(world, input.flowId);
  const allDomains = PropagationStore.listDomainSweeps(world, input.flowId);
  const consequences = allConsequences.filter((row) => row.lifecycle_state === "active");
  const domains = allDomains.filter((row) => row.lifecycle_state === "active");
  const dispositions = PropagationStore.listDispositions(world, input.flowId);
  const activeConsequenceIds = new Set(consequences.map((row) => row.id));
  const activeDispositions = dispositions.filter((row) => activeConsequenceIds.has(row.consequence_id));
  const activeSet = PropagationStore.activeSetState(world, input.flowId);
  const proposals = world.propagationSurfacedProposals(input.flowId) as Array<{ proposal_record_id: number }>;
  const severity = propagationSeverity(world, factId);
  const requiredCoverage = propagationCoverage(severity);
  const relatedWorld = propagationRelatedWorldContext(world, factId, mode, proposals.map((row) => Number(row.proposal_record_id)));
  const blockers = propagationPromptBlockers(severity, consequences, domains);
  const consequenceDispositionIds = new Set(activeDispositions.map((row) => row.consequence_id));
  for (const consequence of consequences.filter((row) => row.pressure === "high" && !consequenceDispositionIds.has(row.id))) {
    blockers.push(`undispositioned-high-pressure #${consequence.id}`);
  }
  const omissions = [
    ...(debt ? [] : ["Owed propagation debt omitted: run was not started from a debt item."]),
    ...(consequences.length ? [] : ["Recorded consequences omitted: none have been written yet."]),
    ...(domains.length ? [] : ["Domain-atlas coverage omitted: no domains have been recorded yet."]),
    ...(activeDispositions.length ? [] : ["Active dispositions omitted: no active consequences have reached a stopping state yet."]),
    ...(proposals.length ? [] : ["Surfaced proposals omitted: none have been routed to Admission yet."]),
    ...(blockers.length ? blockers.map((blocker) => `Close blocker: ${blocker}`) : []),
    ...relatedWorld.omissions,
    ...foundationalProposalOmissions(severity, mode)
  ];
  return {
    lines: [
      `Propagation source fact: ${fact.shortId} ${fact.title}`,
      `Owed debt: ${debt ? `${debt.shortId} ${debt.title}` : "none"}`,
      `Flow id: ${input.flowId}`,
      `Active set revision: ${activeSet.revision}`,
      `Last active-set change: ${activeSet.changedKind ?? "initial active set"}${activeSet.changedRowId == null ? "" : ` row ${activeSet.changedRowId}`}${activeSet.changedReason ? ` - ${activeSet.changedReason}` : ""}`,
      `Current step: ${String(flow.current_step)}`,
      `Severity path: admission_level ${severity.admissionLevel ?? "unset"}, work_scale ${severity.workScale ?? "unset"}`,
      `Required coverage: ${requiredCoverage}`,
      `Recorded consequences: ${consequences.length}`,
      ...consequences.map((row) =>
        `Active consequence lineage ${row.lineage_id} v${row.version} #${row.id}: order ${row.order_key}, domain ${row.domain_name ?? "none"}, pressure ${row.pressure}, prose ${row.body}`
      ),
      `Retired consequence versions: ${allConsequences.length - consequences.length}`,
      ...allConsequences.filter((row) => row.lifecycle_state !== "active").map((row) =>
        `Historical consequence lineage ${row.lineage_id} v${row.version} #${row.id} ${row.lifecycle_state}: ${row.body}; reason ${row.revision_reason ?? "none"}`
      ),
      `Domain coverage: ${domains.length}`,
      ...domains.map((row) =>
        `Active domain lineage ${row.lineage_id} v${row.version} #${row.id} ${row.domain_name}: ${row.triage}${row.declaration.trim() ? ` - ${row.declaration}` : ""}`
      ),
      `Retired domain versions: ${allDomains.length - domains.length}`,
      `Active dispositions: ${activeDispositions.length}`,
      ...activeDispositions.map((row) => `Active disposition for consequence #${row.consequence_id}: ${row.disposition} ${row.note}`.trim()),
      `Surfaced proposals: ${proposals.length}`,
      `Blockers: ${blockers.join(", ") || "none"}`,
      `Close preview: ${consequences.length} active consequence version(s), ${domains.length} active domain version(s), ${allConsequences.length - consequences.length + allDomains.length - domains.length} retired audit row(s); report ${reportId ?? "not assigned"}; blockers ${blockers.join(", ") || "none"}`,
      ...relatedWorld.lines
    ],
    doctrineLines: foundationalProposalDoctrine(severity, mode),
    sourceDocuments: relatedWorld.sourceDocuments,
    severity,
    mode,
    relatedWorld,
    sourceManifest: [
      `Propagation source fact: ${fact.shortId} ${fact.title}`,
      ...(debt ? [`Propagation owed debt: ${debt.shortId} ${debt.title}`] : []),
      `Propagation flow id: ${input.flowId}`,
      `Propagation active set revision: ${activeSet.revision}`,
      `Propagation step: ${String(flow.current_step)}`,
      `Propagation required coverage: ${requiredCoverage}`,
      `Propagation blockers: ${blockers.join(", ") || "none"}`,
      ...relatedWorld.sourceManifest,
      ...foundationalProposalManifest(severity, mode),
      ...(reportId == null ? [] : [`Propagation report: ${reportId}`])
    ],
    omissions
  };
};

const admissionFullGateDraftContext = (input: PromptGenerationInput): {
  lines: string[];
  sourceDocuments: PromptDocument[];
  sourceManifest: string[];
  omissions: string[];
} => {
  const draft = input.admissionFullGateDraft;
  if (input.flowKey !== "admission" || input.templateKey !== "admission_constraint_challenge") {
    return { lines: [], sourceDocuments: [], sourceManifest: [], omissions: [] };
  }
  if (!draft) {
    const omission = "Admission full-gate draft omitted: required draft payload was not provided; packet is incomplete and cannot be exported as the current browser draft packet.";
    return {
      lines: [
        "Admission full-gate draft status: missing required browser draft payload.",
        omission
      ],
      sourceDocuments: [],
      sourceManifest: [
        "Admission full-gate draft state: missing_required",
        `Omission: ${omission}`
      ],
      omissions: [omission]
    };
  }

  const statusLine = draft.saved
    ? "Admission full-gate draft status: saved steward draft, still not canon until Admission completion."
    : "Admission full-gate draft status: current unsaved steward draft, not canon.";
  const sectionLines: string[] = [];
  const omissions = admissionDraftOmissions(draft);
  const sections = draft.sections ?? [];

  for (const section of sections) {
    const label = draftText(section.label) || section.key;
    const substance = draftText(section.substance);
    const notApplicableReason = draftText(section.notApplicableReason);
    const quietDomainDeclaration = draftText(section.quietDomainDeclaration);
    if (substance) sectionLines.push(`${label}: ${substance}`);
    if (notApplicableReason) sectionLines.push(`${label} N/A reason: ${notApplicableReason}`);
    if (quietDomainDeclaration) sectionLines.push(`${label} quiet-domain declaration: ${quietDomainDeclaration}`);
  }

  const sectionKeys = admissionDraftSectionKeys(draft);
  const lines = [
    statusLine,
    ...(sectionKeys.length ? [`Draft section keys: ${sectionKeys.join(", ")}`] : []),
    ...sectionLines,
    ...(draftText(draft.consequenceText) ? [`Written consequence draft: ${draftText(draft.consequenceText)}`] : ["Written consequence draft: missing"]),
    ...(draft.operations?.length ? [`Operation order draft: ${draft.operations.join(", ")}`] : ["Operation order draft: missing"]),
    ...(draftText(draft.targetCanonStatus) ? [`Target canon status draft: ${draftText(draft.targetCanonStatus)}`] : []),
    ...(draft.constraintTags?.length ? [`Constraint tags draft: ${draft.constraintTags.join(", ")}`] : []),
    ...(draftText(draft.followUpDebt) ? [`Follow-up debt draft: ${draftText(draft.followUpDebt)}`] : []),
    ...(draft.advisoryRecordId != null ? [`Advisory-use selection draft: advisory record ${draft.advisoryRecordId}`] : ["Advisory-use selection draft: none"]),
    "Draft/canon boundary: this draft is pressure context only; it is not admitted canon and cannot assign final standing."
  ];

  return {
    lines,
    sourceDocuments: [{ source: "admission_full_gate_draft:current", content: lines.join("\n") }],
    sourceManifest: [
      `Admission full-gate draft: ${draft.saved ? "saved steward draft" : "current unsaved steward draft"}`,
      `Admission full-gate draft state: ${admissionDraftState(input, input.mode ?? "pressure")}`,
      ...(sectionKeys.length ? [`Admission full-gate draft section keys: ${sectionKeys.join(", ")}`] : []),
      ...omissions.map((omission) => `Omission: ${omission}`)
    ],
    omissions
  };
};

const creationDecompositionPrompt = (
  world: WorldFile,
  input: PromptGenerationInput,
  template: PromptTemplateRow,
  stepKey: string
): PromptGenerationResult => {
  const mode = input.mode ?? "pressure";
  const handoff = resolveCreationDecompositionHandoff(world, input.recordId);
  const cardValue = methodCard("creation.seed-decomposition");
  const rulings = standingRulingRows(world);
  const report = handoff.seedDecompositionReport;
  if (!report) throw new Error("decomposition prompt requires a seed-decomposition report and parked seeds");
  const reportSections = handoff.reportSections.map((section) => `### ${section.heading}\n${section.body || "(empty)"}`).join("\n\n");
  const seedContext = handoff.parkedSeeds.map((seed) => [
    `Seed ${seed.shortId}: ${seed.title}`,
    `Truth layer: ${seed.truthLayer ?? "unset"}`,
    `Canon status: ${seed.canonStatus ?? "unset"}`,
    `Body: ${seed.body}`,
    `Derived-from links: ${seed.sourceLinks.map((link) => `${link.shortId} ${link.title} (${link.note})`).join("; ")}`
  ].join("\n")).join("\n\n");
  const kernelContext = handoff.supportingKernel
    ? [
        `Supporting kernel context: ${handoff.supportingKernel.shortId} ${handoff.supportingKernel.title}`,
        handoff.supportingKernel.body,
        ...handoff.kernelSections.map((section) => `${section.heading}: ${section.body}`)
      ].filter(Boolean).join("\n")
    : "Supporting kernel context: omitted because no linked kernel was found.";
  const coverageContext = CreationCoverage.coverageContextForPrompt(world, {
    kernelRecordId: handoff.supportingKernel?.id ?? null,
    seedDecompositionReportId: report.id
  });
  const coverageInventoryMissing = coverageContext.status === "missing_inventory";
  const omissions = [
    "Frontloaded seed audit results omitted: Admission owns that instrument and no result exists yet.",
    "Admission gate results omitted: Admission has not selected severity or run a gate yet.",
    "Standing rulings omitted when none exist.",
    "Open canon debt omitted unless it affects the decomposition decision.",
    ...coverageContext.omissions
  ];
  const sourceManifest = [
    `Source record: seed-decomposition report ${report.shortId} ${report.title}`,
    ...handoff.parkedSeeds.map((seed) => `Source record: parked seed ${seed.shortId} ${seed.title}`),
    ...(handoff.supportingKernel ? [`Source record: supporting kernel ${handoff.supportingKernel.shortId} ${handoff.supportingKernel.title}`] : []),
    ...coverageContext.sourceManifest,
    `Prompt template: ${template.key} (${template.package_source})`,
    ...methodCardSourceManifest(cardValue),
    ...omissions.map((omission) => `Omission: ${omission}`)
  ];
  const evidence = packetEvidenceCollections({
    sourceManifest,
    omissions,
    collectionIdentity: `creation:${report.id}:${stepKey}:${mode}`
  });

  const prompt = renderPromptPacket({
      mode,
      roleName: mode === "proposal" ? "Decision proposal" : template.role_name,
      templateText: template.current_text,
      currentDecision: coverageInventoryMissing
        ? `Flow ${input.flowKey ?? "creation"}, step ${stepKey}: create or confirm seed-family coverage rows before Admission handoff.`
        : `Flow ${input.flowKey ?? "creation"}, step ${stepKey}: decide whether the seed decomposition is ready to hand to Admission.`,
      modeRequest: mode === "proposal"
        ? coverageInventoryMissing
          ? "Ask for candidate coverage row labels, source kernel context, required or optional judgment prompts, and possible disposition rationale questions over unresolved kernel seed families. Do not create rows, infer dispositions, or treat parked seeds as Admission-ready."
          : "Draft labeled candidate split material, alternatives, assumptions, risks, and questions that help the steward repair the parked seed before Admission. Do not assign truth layer, canon standing, or final wording."
        : coverageInventoryMissing
          ? "Do not evaluate Admission readiness while the coverage inventory is missing; challenge missing seed families, false equivalences, unjustified deferrals, unsupported out-of-scope claims, and premature handoff language."
          : "Provide pressure, risks, alternatives, and questions that help the steward decide whether the decomposition is ready for Admission.",
      bearingContext: [
        ...contextLines({ flowKey: input.flowKey, flowId: input.flowId, stepKey, activeSetRevision: input.activeSetRevision }),
        `Granularity rationale: ${handoff.granularityRationale ?? "Each parked seed is independently rejectable without destroying its siblings."}`,
        ...(handoff.admissionIntent ? [`Admission intent: ${handoff.admissionIntent}`] : []),
        kernelContext,
        ...coverageContext.lines
      ],
      packageDoctrine: [
        ...methodCardDoctrineSlots(cardValue),
        "Vocabulary guardrail: label whether any suggestion touches truth layer, canon status, constraint tag, admission decision operation, repair operation, consequence mode, or preservation boundary. Do not blur those categories.",
        "Coverage guardrail: no automatic coverage disposition; no automatic seed creation; Creation coverage rows need explicit steward action."
      ],
      decisionMaterial: [
        `Seed decomposition report ${report.shortId}: ${report.title}`,
        report.body,
        reportSections,
        "Parked seeds:",
        seedContext
      ],
      sourceDocuments: [
        {
          source: `seed_decomposition_report:${report.shortId}`,
          content: [`${report.shortId} ${report.title}`, report.body, reportSections].filter(Boolean).join("\n\n")
        },
        ...handoff.parkedSeeds.map((seed) => ({
          source: `parked_seed:${seed.shortId}`,
          content: [
            `${seed.shortId} ${seed.title}`,
            `Truth layer: ${seed.truthLayer ?? "unset"}`,
            `Canon status: ${seed.canonStatus ?? "unset"}`,
            seed.body,
            `Derived-from links: ${seed.sourceLinks.map((link) => `${link.shortId} ${link.title} (${link.note})`).join("; ")}`
          ].join("\n")
        })),
        ...(handoff.supportingKernel
          ? [{
              source: `supporting_kernel:${handoff.supportingKernel.shortId}`,
              content: kernelContext
            }]
          : []),
        ...coverageContext.sourceDocuments
      ],
      standingRulings: rulings.map((row) => `${row.disposition}: ${row.note}`),
      omissions: evidence.omissions,
      sourceManifest: evidence.sourceManifest,
      advisoryWarning: "This prompt asks for optional pressure only. Pasted responses stay advisory artifacts until the steward authors and admits canon through the governed flow.",
      outputLabels: ["bundled seed", "missing prerequisite", "admission concern", "risk", "alternative", "question", "standing-ruling candidate", "irrelevant omission"]
    });

  return {
    prompt,
    promptOut: {
      flowKey: input.flowKey ?? null,
      flowId: input.flowId ?? null,
      stepKey,
      mode,
      templateKey: input.templateKey,
      recordId: report.id,
      packetIdentity: generatedPacketIdentity(world, { ...input, recordId: report.id, mode, stepKey }, prompt, {
        mode,
        stepKey,
        record: report,
        selectedSectionHeading: null,
        decisionLabel: report.title,
        sourceManifestHash: manifestHash(evidence.sourceManifest)
      }),
      evidence
    }
  };
};

const creationKernelPrompt = (
  world: WorldFile,
  input: PromptGenerationInput,
  template: PromptTemplateRow,
  stepKey: string,
  mode: PromptMode,
  selectedRecord: RecordRow
): PromptGenerationResult => {
  const cardValue = methodCard("creation.kernel");
  const rulings = standingRulingRows(world);
  const section = creationSelectedKernelSection(world, input, selectedRecord);
  if (mode === "proposal" && section.heading === "World premise") {
    throw new Error("Proposal prompts are refused for the World premise essence; select a non-premise kernel section or author the premise as steward-owned material.");
  }
  if (mode === "pressure" && !section.body.trim()) {
    throw new Error(`Pressure prompts require steward-authored material for selected Creation kernel section ${section.heading}.`);
  }
  const sections = world.listSections(selectedRecord.id);
  const fullKernelContext = [
    `${selectedRecord.shortId} ${selectedRecord.title}`,
    selectedRecord.body,
    ...sections.map((row) => `${row.heading}: ${row.body || "(empty)"}`)
  ].filter(Boolean).join("\n");
  const selectedMaterial = [
    `Current kernel section: ${section.heading}`,
    `Selected section prompt: ${section.prompt}`,
    `Selected section material: ${section.body || "(empty)"}`,
    ...(section.body
      ? []
      : ["Selected section empty-state context: no saved text exists yet; proposal may request candidates, while pressure remains unavailable until steward-authored material is saved."])
  ];
  const omissions = [
    "Frontloaded seed audit and first canon standing are omitted because Admission owns them.",
    "No silent kernel-only fallback: selected section context is carried when a kernel section is selected.",
    "Open canon debt omitted unless it affects this kernel decision."
  ];
  const sourceManifest = [
    `Selected kernel section: ${section.heading}`,
    `Section prompt: ${section.prompt}`,
    `Source record: world kernel ${selectedRecord.shortId} ${selectedRecord.title}`,
    `Prompt template: ${template.key} (${template.package_source})`,
    ...methodCardSourceManifest(cardValue),
    ...omissions.map((omission) => `Omission: ${omission}`)
  ];
  const evidence = packetEvidenceCollections({
    sourceManifest,
    omissions,
    collectionIdentity: `creation:${selectedRecord.id}:${stepKey}:${mode}:${section.heading}`
  });

  const prompt = renderPromptPacket({
      mode,
      roleName: mode === "proposal" ? "Decision proposal" : template.role_name,
      templateText: template.current_text,
      currentDecision: `Flow ${input.flowKey ?? "creation"}, selected kernel section ${section.heading}: work only on this local kernel decision.`,
      modeRequest: mode === "proposal"
        ? `Draft labeled candidate material for the selected ${section.heading} section. Recommend alternatives with assumptions; do not assign truth layer, canon status, consequence mode, or any separated label.`
        : `Provide pressure, risks, alternatives, and questions on the selected ${section.heading} section's steward-authored material.`,
      bearingContext: [
        ...modeLine(mode),
        ...contextLines({ flowKey: input.flowKey, flowId: input.flowId, stepKey, selectedSectionHeading: section.heading, activeSetRevision: input.activeSetRevision }),
        "Kernel authoring is a composite decision point; the active local unit is the selected section."
      ],
      packageDoctrine: [
        ...methodCardDoctrineSlots(cardValue),
        `Selected section obligation: ${section.prompt}`,
        "World premise essence exception: proposal mode is refused only for the World premise section; other sections may request proposal candidates.",
        "Vocabulary guardrail: label whether any suggestion touches truth layer, canon status, constraint tag, admission decision operation, repair operation, consequence mode, or preservation boundary. Do not blur those categories."
      ],
      decisionMaterial: [
        ...selectedMaterial,
        "",
        "Full kernel context for orientation only:",
        fullKernelContext
      ],
      sourceDocuments: [
        {
          source: `selected_kernel_section:${section.heading}`,
          content: selectedMaterial.join("\n")
        },
        {
          source: `world_kernel:${selectedRecord.shortId}`,
          content: fullKernelContext
        }
      ],
      standingRulings: rulings.map((row) => `${row.disposition}: ${row.note}`),
      omissions: evidence.omissions,
      sourceManifest: evidence.sourceManifest,
      advisoryWarning: "This prompt is optional advisory support. Pasted responses stay advisory artifacts until the steward authors and admits canon through the governed flow.",
      outputLabels: ["candidate", "assumption", "risk", "alternative", "question", "standing-ruling candidate", "off-section"]
    });

  return {
    prompt,
    promptOut: {
      flowKey: input.flowKey ?? null,
      flowId: input.flowId ?? null,
      stepKey,
      mode,
      templateKey: input.templateKey,
      recordId: selectedRecord.id,
      packetIdentity: generatedPacketIdentity(world, { ...input, mode, stepKey, recordId: selectedRecord.id }, prompt, {
        mode,
        stepKey,
        record: selectedRecord,
        selectedSectionHeading: section.heading,
        decisionLabel: section.heading,
        sourceManifestHash: manifestHash(evidence.sourceManifest)
      }),
      evidence
    }
  };
};

const insertAdvisoryDisposition = (
  world: WorldFile,
  advisoryRecordId: number,
  input: { disposition: string; note?: string; standingRuling?: boolean }
): AdvisoryDispositionRow => {
  world.getRecord(advisoryRecordId);
  world.assertVocabularyTerm("advisory_disposition", input.disposition);
  const result = world.db.prepare(`
    INSERT INTO advisory_dispositions (advisory_record_id, disposition, note, standing_ruling)
    VALUES (?, ?, ?, ?)
  `).run(advisoryRecordId, input.disposition, input.note ?? "", input.standingRuling ? 1 : 0);
  return rowToAdvisoryDisposition(world.db.prepare("SELECT * FROM advisory_dispositions WHERE id = ?").get(result.lastInsertRowid) as Record<string, unknown>);
};

export const listPromptTemplates = (world: WorldFile): PromptTemplateRow[] =>
  promptTemplateRows(world);

export const updatePromptTemplate = (world: WorldFile, key: string, text: string): PromptTemplateRow =>
  appendPromptTemplateVersion(world, key, text);

export const revertPromptTemplate = (world: WorldFile, key: string): PromptTemplateRow => {
  const template = promptTemplateRow(world, key);
  return appendPromptTemplateVersion(world, key, template.original_text);
};

export const generatePrompt = (world: WorldFile, input: PromptGenerationInput): PromptGenerationResult => {
  const template = promptTemplateRow(world, input.templateKey);
  const stepKey = input.stepKey ?? input.templateKey;
  const mode: PromptMode = input.mode ?? "pressure";
  if (input.flowKey === "creation" && input.templateKey === "decomposition_pressure") {
    return creationDecompositionPrompt(world, input, template, stepKey);
  }
  const selectedRecord = input.recordId == null ? null : world.getRecord(input.recordId);
  if (input.flowKey === "creation" && input.templateKey === "kernel_pressure" && selectedRecord?.recordTypeKey === "world_kernel") {
    return creationKernelPrompt(world, input, template, stepKey, mode, selectedRecord);
  }
  const recordContext = selectedRecord == null ? "No record context selected." : promptRecordContext(world, selectedRecord.id);
  const rulings = standingRulingRows(world);
  const cardValue = promptMethodCard(input);
  const doctrineLines = cardValue ? methodCardDoctrineSlots(cardValue) : [];
  const temporalContext = temporalPromptContext(world, input);
  const propagationContext = propagationPromptContext(world, input);
  const flowContext = {
    lines: [...temporalContext.lines, ...propagationContext.lines],
    doctrineLines: propagationContext.doctrineLines,
    sourceDocuments: [...temporalContext.sourceDocuments, ...propagationContext.sourceDocuments],
    sourceManifest: [...temporalContext.sourceManifest, ...propagationContext.sourceManifest],
    omissions: [...temporalContext.omissions, ...propagationContext.omissions]
  };
  const admissionDraftContext = admissionFullGateDraftContext(input);
  const sourceManifest = [
    `Prompt template: ${template.key} (${template.package_source})`,
    ...(cardValue ? methodCardSourceManifest(cardValue) : []),
    ...flowContext.sourceManifest,
    ...admissionDraftContext.sourceManifest,
    selectedRecord == null ? "Selected record: none" : `Selected record: ${selectedRecord.shortId} ${selectedRecord.title}`,
    `Standing rulings: ${rulings.length}`,
    "Omissions: no hidden repository context; unavailable world context must be named before copy-out."
  ];
  const omissions = [
    ...(selectedRecord == null ? ["Selected record omitted: no record context was provided."] : []),
    ...flowContext.omissions,
    ...admissionDraftContext.omissions,
    "No hidden repository context is available to the external LLM.",
    "Unavailable world context must be named before copy-out rather than silently omitted."
  ];
  const evidence = packetEvidenceCollections({
    sourceManifest,
    omissions,
    collectionIdentity: `${input.flowKey ?? "unspecified"}:${input.flowId ?? "none"}:${stepKey}:${mode}`
  });
  const advisoryWarning = temporalContext.preview?.advisoryCanonWarning
    ?? "This prompt is optional advisory support. Pasted responses stay advisory artifacts until the steward authors and admits canon through the governed flow.";
  const foundationalPropagation = propagationContext.severity != null && isFoundationalSeverity(propagationContext.severity);
  const atlasDomains = mode === "proposal" && foundationalPropagation
    ? PROPAGATION_ATLAS_DOMAINS.map((domain) => ({ ...domain }))
    : [];
  const completeness = propagationPacketCompleteness({
    mode,
    foundational: foundationalPropagation,
    atlas: atlasDomains,
    relatedWorld: propagationContext.relatedWorld
  });

  const prompt = renderPromptPacket({
    mode,
    roleName: template.role_name,
    templateText: template.current_text,
    currentDecision: `Flow ${input.flowKey ?? "unspecified"}, step ${stepKey}; selected record ${selectedRecord ? `${selectedRecord.shortId} ${selectedRecord.title}` : "none"}.`,
    modeRequest: mode === "proposal"
      ? "Draft labeled candidate material with alternatives, assumptions, risks, and questions. Recommend with reasons, never assign canon standing or separated labels."
      : "Provide pressure, risks, alternatives, and questions on steward-authored material. Do not author final canon.",
    bearingContext: [
      ...modeLine(mode),
      ...contextLines({ flowKey: input.flowKey, flowId: input.flowId, stepKey, activeSetRevision: input.activeSetRevision }),
      ...(flowContext.lines.length ? flowContext.lines : [])
    ],
    packageDoctrine: [
      ...doctrineLines,
      ...flowContext.doctrineLines,
      "Vocabulary guardrail: label whether any suggestion touches truth layer, canon status, constraint tag, admission decision operation, repair operation, consequence mode, or preservation boundary. Do not blur those categories.",
      "Label assumptions instruction: separate direct consequences from speculative assumptions and mark unadmitted assumptions plainly."
    ],
    decisionMaterial: ["Record context:", recordContext, ...admissionDraftContext.lines],
    sourceDocuments: [
      ...(selectedRecord
        ? [{ source: `selected_record:${selectedRecord.shortId}`, content: recordContext }]
        : []),
      ...(flowContext.lines.length
        ? [{ source: `flow_context:${input.flowKey ?? "unspecified"}:${stepKey}`, content: flowContext.lines.join("\n\n") }]
        : []),
      ...flowContext.sourceDocuments,
      ...admissionDraftContext.sourceDocuments
    ],
    standingRulings: rulings.map((row) => `${row.disposition}: ${row.note}`),
    omissions: evidence.omissions,
    sourceManifest: evidence.sourceManifest,
    advisoryWarning
  });

  return {
    prompt,
    promptOut: {
      flowKey: input.flowKey ?? null,
      flowId: input.flowId ?? null,
      stepKey,
      mode,
      templateKey: input.templateKey,
      recordId: input.recordId ?? null,
      packetIdentity: generatedPacketIdentity(world, { ...input, mode, stepKey }, prompt, {
        mode,
        stepKey,
        record: selectedRecord,
        selectedSectionHeading: null,
        decisionLabel: selectedRecord?.title ?? stepKey,
        sourceManifestHash: manifestHash(evidence.sourceManifest)
      }),
      evidence,
      propagationContext: input.flowKey === "propagation" && propagationContext.severity
        ? {
            serverOwned: true,
            mode,
            decisionPoint: stepKey,
            packageSources: [
              "docs/worldbuilding-system/04_domain_atlas.md",
              "docs/worldbuilding-system/07_propagation_engine.md",
              "docs/worldbuilding-system/20_ai_assisted_workflow.md"
            ],
            atlas: {
              required: mode === "proposal" && isFoundationalSeverity(propagationContext.severity),
              domains: atlasDomains,
              triage: "Direct domains are where the fact acts first; dependency domains contain what must already exist; reaction domains show adaptation; negative domains require an explanation when suspiciously quiet.",
              severityReason: isFoundationalSeverity(propagationContext.severity)
                ? "Foundational severity owes the complete fourteen-domain atlas; lower-severity packets remain proportionate."
                : "This lower-severity packet remains proportionate and does not inherit the foundational full-atlas dump."
            },
            completeness,
            relatedWorld: {
              aggregateBudget: PROPAGATION_RELATED_WORLD_BUDGET.aggregate,
              perRecordCap: PROPAGATION_RELATED_WORLD_BUDGET.perRecord,
              usedCharacters: propagationContext.relatedWorld.usedCharacters,
              completeness: propagationContext.relatedWorld.completeness,
              selectedRecords: propagationContext.relatedWorld.selectedRecords
            },
            sourceManifest: evidence.sourceManifest,
            omissions: evidence.omissions,
            advisoryCanonWarning: advisoryWarning,
            readOnlyGuarantee: "Preview and copy create no record, link, status, debt, skip, advisory artifact, disposition, flow-state, or world-file mutation."
          }
        : null
      ,
      temporalContext: input.flowKey === "temporal_timeline" ? temporalContext.preview : null
    }
  };
};

export const storeAdvisoryResponse = (world: WorldFile, input: AdvisoryResponseInput): RecordRow =>
  world.createRecord({
    recordTypeKey: "advisory_artifact",
    title: `Advisory artifact: ${input.stepKey}`,
    body: [...contextLines(input), ...modeLine(input.mode), `Prompt:`, input.promptText, `Response:`, input.responseText].join("\n\n"),
    truthLayer: "disputed claim",
    canonStatus: "proposed"
  });

const advisoryContextValue = (body: string, label: string): string | null => {
  const prefix = `${label}: `;
  return body.split("\n").find((line) => line.startsWith(prefix))?.slice(prefix.length).trim() ?? null;
};

export const assertTemporalAdvisoryDispositionPacket = (
  world: WorldFile,
  advisoryRecordId: number,
  flowId: number,
  submittedRevision?: number | null
): void => {
  const advisory = world.getRecord(advisoryRecordId);
  const artifactFlow = advisoryContextValue(advisory.body, "Flow");
  const artifactFlowId = Number(advisoryContextValue(advisory.body, "Flow id"));
  const artifactRevision = Number(advisoryContextValue(advisory.body, "Active set revision"));
  if (
    advisory.recordTypeKey !== "advisory_artifact"
    || artifactFlow !== "temporal_timeline"
    || artifactFlowId !== flowId
    || submittedRevision == null
    || !Number.isFinite(artifactRevision)
    || artifactRevision !== submittedRevision
  ) {
    const error = new Error("stale Temporal packet identity: advisory disposition must use the packet revision that created its immutable artifact") as Error & { remediation: string };
    error.remediation = "Preserve the selected Temporal mode, recover the current packet, and dispose only the advisory artifact created from that packet action.";
    throw error;
  }
};

const assertAdvisoryPacketCurrent = (world: WorldFile, advisory: RecordRow): void => {
  if (advisoryContextValue(advisory.body, "Flow") !== "propagation") return;
  const activeSetRevisionValue = advisoryContextValue(advisory.body, "Active set revision");
  if (activeSetRevisionValue == null) return;
  const flowIdValue = advisoryContextValue(advisory.body, "Flow id");
  const flowId = Number(flowIdValue);
  const activeSetRevision = Number(activeSetRevisionValue);
  if (flowIdValue == null || !Number.isFinite(flowId)) throw new Error("stale Propagation active set: advisory artifact has no run identity; load the current packet before continuing");
  const current = PropagationStore.activeSetState(world, flowId);
  if (!Number.isFinite(activeSetRevision) || activeSetRevision !== current.revision) {
    throw new Error(`stale Propagation active set (artifact revision ${Number.isFinite(activeSetRevision) ? activeSetRevision : "missing"}; current revision ${current.revision}); load the current packet before continuing`);
  }
};

export const disposeAdvisoryArtifact = (
  world: WorldFile,
  advisoryRecordId: number,
  input: { disposition: string; note?: string; standingRuling?: boolean }
): AdvisoryDispositionRow => {
  const advisory = world.getRecord(advisoryRecordId);
  if (advisory.recordTypeKey !== "advisory_artifact") {
    throw new Error("advisory disposition target must be an advisory artifact");
  }
  assertAdvisoryPacketCurrent(world, advisory);
  return insertAdvisoryDisposition(world, advisoryRecordId, input);
};

export const linkExplicitAdvisoryUse = (
  world: WorldFile,
  stewardAuthoredRecordId: number,
  advisoryRecordId: number,
  notes: { derivedFromNote: string; citationNote: string }
): void => {
  world.getRecord(stewardAuthoredRecordId);
  const advisory = world.getRecord(advisoryRecordId);
  if (advisory.recordTypeKey !== "advisory_artifact") {
    throw new Error(`Consulted advisory target must be an advisory artifact: ${advisoryRecordId}`);
  }
  assertAdvisoryPacketCurrent(world, advisory);
  world.createLinkIfMissing(stewardAuthoredRecordId, advisoryRecordId, "derived_from", notes.derivedFromNote);
  world.createLinkIfMissing(stewardAuthoredRecordId, advisoryRecordId, "cites_advisory_artifact", notes.citationNote);
};

export const createRecordWithExplicitAdvisoryUse = (
  world: WorldFile,
  input: RecordInput,
  advisoryRecordId?: number
): RecordRow =>
  world.atomicWrite(() => {
    const record = world.createRecord(input);
    if (advisoryRecordId != null) {
      linkExplicitAdvisoryUse(world, record.id, advisoryRecordId, {
        derivedFromNote: "Steward authored with advisory material on the table",
        citationNote: "Verbatim advisory artifact consulted"
      });
    }
    return record;
  });

export const recordPromptOutSkip = (world: WorldFile, input: PromptOutStepContext): RecordRow => {
  if (requiresSkipReason({ admissionLevel: input.admissionLevel ?? null, workScale: input.workScale ?? null }) && !input.reason?.trim()) {
    throw new Error("major prompt-out skips require a reason");
  }
  return world.createRecord({
    recordTypeKey: "skip_record",
    title: `Skip: ${input.stepKey}`,
    body: input.reason
      ? [...contextLines(input), `Reason: ${input.reason}`].join("\n")
      : [...contextLines(input), "Reason not collected below major-fact threshold."].join("\n"),
    truthLayer: "Objective canon",
    canonStatus: "proposed"
  });
};
