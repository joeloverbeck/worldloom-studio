import type { PromptMode } from "./decision-point-contract.js";
import { isFoundationalSeverity, type DeclaredSeverity } from "./severity-policy.js";
import type { LinkRow, RecordRow, WorldFile } from "./world-file.js";

export interface PropagationAtlasDomain {
  name: string;
  decisionPrompt: string;
}

export const PROPAGATION_ATLAS_DOMAINS: readonly PropagationAtlasDomain[] = [
  { name: "Physics, metaphysics, and cosmology", decisionPrompt: "what is possible or impossible, who knows the rules, how do rules vary, and what practices or exploits follow?" },
  { name: "Geography, climate, and infrastructure", decisionPrompt: "where can people live or move, which routes and places matter, and what hazards or barriers shape infrastructure?" },
  { name: "Ecology, food, disease, and nonhuman life", decisionPrompt: "what sustains settlement, what eats or sickens whom, and how does the fact change species, defenses, and ecological cycles?" },
  { name: "Population, demography, and household life", decisionPrompt: "who lives with and depends on whom, and how does the fact change care, reproduction, aging, death, inheritance, or migration?" },
  { name: "Production, labor, and technology/magic", decisionPrompt: "what can be made, by whom, with which scarce skills, tools, maintenance, licensing, or failure modes?" },
  { name: "Economy, trade, and scarcity", decisionPrompt: "what becomes scarce, abundant, cheap, costly, profitable, taxable, insurable, rationed, smuggled, or hoarded?" },
  { name: "Governance, law, and bureaucracy", decisionPrompt: "what needs jurisdiction, records, rights, evidence, regulation, public provision, punishment, or bureaucratic legibility?" },
  { name: "War, coercion, and security", decisionPrompt: "how do attack, defense, force, espionage, detention, doctrine, deterrence, and routine countermeasures change?" },
  { name: "Religion, ritual, myth, and meaning", decisionPrompt: "how is the fact interpreted, ritualized, sanctified, condemned, doubted, or made part of daily spiritual practice?" },
  { name: "Culture, custom, language, and identity", decisionPrompt: "what speech, signs, customs, education, class markers, art, humor, honor, or shame make the fact socially lived?" },
  { name: "Knowledge, education, science, and records", decisionPrompt: "who knows, teaches, certifies, records, proves, censors, inherits, classifies, or sells knowledge of the fact?" },
  { name: "History, memory, and path dependence", decisionPrompt: "what past events, residues, institutions, compromises, traumas, ruins, or revisions should exist if the fact is old?" },
  { name: "Daily life and material residue", decisionPrompt: "what does an ordinary person, child, worker, house, market, routine, object, or small luxury reveal before explanation?" },
  { name: "Aesthetics, tone, and narrative use", decisionPrompt: "how does the fact affect genre, mood, symbolic language, wonder, horror, beauty, scale, focus, and the world's emotional promise?" }
] as const;

export const foundationalProposalDoctrine = (severity: DeclaredSeverity, mode: PromptMode): string[] => {
  if (mode !== "proposal" || !isFoundationalSeverity(severity)) return [];
  return [
    "Foundational Propagation Proposal atlas (canonical package order; compact app-owned derivation):",
    ...PROPAGATION_ATLAS_DOMAINS.map((domain, index) => `${index + 1}. ${domain.name} — ${domain.decisionPrompt}`),
    "Atlas triage: Direct domains are where the fact acts first. Dependency domains contain what must already exist. Reaction domains show adaptation by people, institutions, ecologies, markets, or symbols. Negative domains look unaffected but would be contradictory or suspiciously quiet without an explanation.",
    "Foundational severity owes the full fourteen-domain atlas because foundational pressure requires full domain, temporal, spatial, agent, institution/economy, mystery, branch, aesthetic, and QA passes. Minor and ordinary major packets remain proportionate to their declared severity."
  ];
};

export const foundationalProposalManifest = (severity: DeclaredSeverity, mode: PromptMode): string[] =>
  mode === "proposal" && isFoundationalSeverity(severity)
    ? [
        "Foundational atlas doctrine: docs/worldbuilding-system/04_domain_atlas.md (compact app-owned derivation)",
        "Foundational propagation severity: docs/worldbuilding-system/07_propagation_engine.md",
        "Proposal and advisory doctrine: docs/worldbuilding-system/20_ai_assisted_workflow.md"
      ]
    : [];

export const foundationalProposalOmissions = (severity: DeclaredSeverity, mode: PromptMode): string[] =>
  mode === "proposal" && isFoundationalSeverity(severity)
    ? ["Full upstream domain descriptions and question lists are intentionally shortened to one decision-bearing prompt per domain; the canonical order and decision coverage are preserved."]
    : [];

const RELATED_WORLD_AGGREGATE_BUDGET = 12_000;
const RELATED_WORLD_RECORD_CAP = 2_000;
const INACTIVE_STATUSES = new Set(["superseded", "deprecated", "rejected", "quarantined"]);
const ROLE_IRRELEVANT_RECORD_TYPES = new Set(["advisory_artifact", "skip_record"]);
const CURRENT_CANON_STATUSES = new Set(["accepted", "accepted with constraints"]);

export interface PropagationRelatedWorldDocument {
  source: string;
  content: string;
}

export interface PropagationRelatedWorldContext {
  lines: string[];
  sourceDocuments: PropagationRelatedWorldDocument[];
  selectedRecords: PropagationRelatedWorldRecord[];
  usedCharacters: number;
  completeness: {
    status: "complete" | "incomplete";
    failures: string[];
  };
  sourceManifest: string[];
  omissions: string[];
}

export interface PropagationRelatedWorldRecord {
  sourceDocumentId: string;
  stableIdentity: string;
  title: string;
  recordType: string;
  canonStatus: string;
  truthLayer: string | null;
  relationship: string;
  inclusionReason: string;
  role: "active context";
  nonCanon: boolean;
}

export interface PropagationPacketCompleteness {
  status: "complete" | "incomplete";
  failures: string[];
}

export interface PropagationPacketCompletenessInput {
  mode: PromptMode;
  foundational: boolean;
  atlas: readonly PropagationAtlasDomain[];
  relatedWorld: PropagationRelatedWorldContext;
}

export const PROPAGATION_RELATED_WORLD_BUDGET = {
  aggregate: RELATED_WORLD_AGGREGATE_BUDGET,
  perRecord: RELATED_WORLD_RECORD_CAP
} as const;

interface RelatedCandidate {
  record: RecordRow;
  relationship: string;
  inclusionReason: string;
  relationshipClass: "kernel" | "direct" | "shared-origin";
}

const unicodeLength = (value: string): number => [...value].length;
const unicodeSlice = (value: string, limit: number): string => [...value].slice(0, limit).join("");

const otherRecordId = (link: LinkRow, recordId: number): number =>
  link.fromRecordId === recordId ? link.toRecordId : link.fromRecordId;

const recordText = (world: WorldFile, record: RecordRow): string => {
  const sections = world.listSections(record.id);
  return [record.body, ...sections.map((section) => `${section.heading}: ${section.body}`)]
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n\n");
};

const KERNEL_PRESSURE_SECTION = /premise|core promise|genre|tone|consequence|constraint|myster|protected effect|primary pressure/i;

const candidate = (
  record: RecordRow,
  relationship: string,
  inclusionReason: string,
  relationshipClass: RelatedCandidate["relationshipClass"]
): RelatedCandidate => ({
  record,
  relationship,
  inclusionReason,
  relationshipClass
});

const omission = (record: RecordRow, reason: string): string =>
  `${record.shortId} ${record.title}: ${reason}`;

export const propagationRelatedWorldContext = (
  world: WorldFile,
  sourceFactId: number,
  mode: PromptMode,
  activeMaterialRecordIds: readonly number[] = []
): PropagationRelatedWorldContext => {
  if (mode !== "pressure") return {
    lines: [],
    sourceDocuments: [],
    selectedRecords: [],
    usedCharacters: 0,
    completeness: { status: "complete", failures: [] },
    sourceManifest: [],
    omissions: []
  };

  const sourceFact = world.getRecord(sourceFactId);
  const records = world.listRecords();
  const recordsById = new Map(records.map((record) => [record.id, record]));
  const sourceLinks = world.listLinks(sourceFactId);
  const origins = new Map<number, RecordRow>();
  for (const link of sourceLinks.filter((value) => value.linkTypeKey === "derived_from")) {
    const record = recordsById.get(otherRecordId(link, sourceFactId));
    if (record) origins.set(record.id, record);
  }

  const candidates = new Map<number, RelatedCandidate>();
  for (const kernel of records.filter((record) => record.recordTypeKey === "world_kernel")) {
    candidates.set(kernel.id, candidate(
      kernel,
      "active world kernel",
      "kernel support for premise, tone, consequence mode, constraints, and protected effects",
      "kernel"
    ));
  }

  const activeMaterialRecords = activeMaterialRecordIds
    .map((recordId) => recordsById.get(recordId))
    .filter((record): record is RecordRow => record != null);
  for (const anchor of [sourceFact, ...activeMaterialRecords]) {
    for (const link of world.listLinks(anchor.id)) {
      const related = recordsById.get(otherRecordId(link, anchor.id));
      if (!related || related.id === sourceFactId || activeMaterialRecordIds.includes(related.id) || related.recordTypeKey === "world_kernel") continue;
      candidates.set(related.id, candidate(
        related,
        `direct ${link.linkTypeKey}`,
        anchor.id === sourceFactId
          ? `existing typed ${link.linkTypeKey} relationship to source fact ${sourceFact.shortId}`
          : `existing typed ${link.linkTypeKey} relationship to active Propagation material ${anchor.shortId}`,
        "direct"
      ));
    }
  }

  for (const origin of origins.values()) {
    for (const link of world.listLinks(origin.id).filter((value) => value.linkTypeKey === "derived_from")) {
      const sibling = recordsById.get(otherRecordId(link, origin.id));
      if (!sibling || sibling.id === sourceFactId || sibling.id === origin.id || candidates.has(sibling.id)) continue;
      candidates.set(sibling.id, candidate(
        sibling,
        `shared origin ${origin.shortId}`,
        `shares immediate derivation origin ${origin.shortId} with source fact ${sourceFact.shortId}`,
        "shared-origin"
      ));
    }
  }

  const omissions: string[] = [];
  const completenessFailures: string[] = [];
  if (![...candidates.values()].some((value) => value.relationshipClass === "kernel")) {
    const failure = "World kernel (not found): unavailable content; create or open the active world kernel before treating Pressure as context-complete.";
    omissions.push(failure);
    completenessFailures.push(failure);
  }
  const candidateText = new Map<number, string>();
  for (const value of candidates.values()) {
    if (value.relationshipClass !== "kernel") {
      candidateText.set(value.record.id, recordText(world, value.record));
      continue;
    }
    const sections = world.listSections(value.record.id);
    const relevantSections = sections.filter((section) => KERNEL_PRESSURE_SECTION.test(section.heading));
    for (const section of sections.filter((candidateSection) => !KERNEL_PRESSURE_SECTION.test(candidateSection.heading))) {
      omissions.push(`${value.record.shortId} ${value.record.title} section ${section.heading}: irrelevant to premise, tone, consequence mode, constraints, or protected effects`);
    }
    candidateText.set(value.record.id, [
      value.record.body.trim(),
      ...relevantSections.map((section) => `${section.heading}: ${section.body}`)
    ].filter(Boolean).join("\n\n"));
  }
  const eligible = [...candidates.values()].filter((value) => {
    if (ROLE_IRRELEVANT_RECORD_TYPES.has(value.record.recordTypeKey)) {
      omissions.push(omission(value.record, "irrelevant to the active Pressure role"));
      return false;
    }
    if (INACTIVE_STATUSES.has(value.record.canonStatus ?? "")) {
      omissions.push(omission(value.record, "inactive or superseded current-support status"));
      return false;
    }
    if (!candidateText.get(value.record.id)) {
      const failure = omission(value.record, "unavailable content; restore readable record content or remove the structural relationship before treating Pressure as complete");
      omissions.push(failure);
      completenessFailures.push(failure);
      return false;
    }
    return true;
  }).sort((left, right) => {
    const priority = (value: RelatedCandidate): number => {
      if (value.relationshipClass === "kernel") return 0;
      if (CURRENT_CANON_STATUSES.has(value.record.canonStatus ?? "")) return value.relationshipClass === "direct" ? 1 : 2;
      return 3;
    };
    return priority(left) - priority(right)
      || left.relationshipClass.localeCompare(right.relationshipClass)
      || left.record.id - right.record.id
  });

  const structurallyEligibleIds = new Set([sourceFactId, ...activeMaterialRecordIds, ...origins.keys(), ...candidates.keys()]);
  const secondHopIds = new Set<number>();
  for (const value of candidates.values()) {
    for (const link of world.listLinks(value.record.id)) {
      const relatedId = otherRecordId(link, value.record.id);
      if (!structurallyEligibleIds.has(relatedId)) secondHopIds.add(relatedId);
    }
  }
  for (const recordId of [...secondHopIds].sort((left, right) => left - right)) {
    const record = recordsById.get(recordId);
    if (record) omissions.push(omission(record, "outside the bounded relationship shapes (second hop)"));
  }

  let used = 0;
  const sourceDocuments: PropagationRelatedWorldDocument[] = [];
  const selectedRecords: PropagationRelatedWorldRecord[] = [];
  const sourceManifest: string[] = [];
  for (const value of eligible) {
    const fullText = candidateText.get(value.record.id) ?? "";
    const excerpt = unicodeSlice(fullText, RELATED_WORLD_RECORD_CAP);
    if (used + unicodeLength(excerpt) > RELATED_WORLD_AGGREGATE_BUDGET) {
      omissions.push(omission(value.record, "trimmed by the 12,000-character related-world budget"));
      continue;
    }
    used += unicodeLength(excerpt);
    const source = `related_world:${value.record.shortId}`;
    const nonCanonLabel = CURRENT_CANON_STATUSES.has(value.record.canonStatus ?? "") ? "" : " (non-canon context)";
    sourceDocuments.push({
      source,
      content: [
        `Source document identifier: ${source}`,
        `Stable identity: ${value.record.shortId}`,
        `Title: ${value.record.title}`,
        `Record type: ${value.record.recordTypeKey}`,
        `Canon status: ${value.record.canonStatus ?? "unset"}${nonCanonLabel}`,
        `Truth layer: ${value.record.truthLayer ?? "not present"}`,
        `Relationship: ${value.relationship}`,
        `Inclusion reason: ${value.inclusionReason}`,
        "Active versus historical role: active context",
        `Excerpt (${unicodeLength(excerpt)} Unicode characters; cap ${RELATED_WORLD_RECORD_CAP}): ${excerpt}`,
        ...(unicodeLength(fullText) > RELATED_WORLD_RECORD_CAP ? [`Excerpt note: targeted content truncated at ${RELATED_WORLD_RECORD_CAP} Unicode characters.`] : [])
      ].join("\n")
    });
    selectedRecords.push({
      sourceDocumentId: source,
      stableIdentity: value.record.shortId,
      title: value.record.title,
      recordType: value.record.recordTypeKey,
      canonStatus: value.record.canonStatus ?? "unset",
      truthLayer: value.record.truthLayer,
      relationship: value.relationship,
      inclusionReason: value.inclusionReason,
      role: "active context",
      nonCanon: !CURRENT_CANON_STATUSES.has(value.record.canonStatus ?? "")
    });
    sourceManifest.push(`${source}: ${value.record.shortId} ${value.record.title}; ${value.relationship}; ${value.record.canonStatus ?? "unset"}`);
  }

  const uniqueOmissions = [...new Set(omissions)];
  return {
    lines: [
      `Related-world budget: ${RELATED_WORLD_AGGREGATE_BUDGET} Unicode characters aggregate; ${RELATED_WORLD_RECORD_CAP} per record`,
      `Related-world selected records: ${sourceDocuments.length}`,
      `Related-world excerpt characters used: ${used}`,
      "Related-world selection is structural, deterministic, non-recursive, and read-only; inclusion changes no record standing or world state."
    ],
    sourceDocuments,
    selectedRecords,
    usedCharacters: used,
    completeness: {
      status: completenessFailures.length ? "incomplete" : "complete",
      failures: [...new Set(completenessFailures)]
    },
    sourceManifest,
    omissions: uniqueOmissions
  };
};

export const propagationPacketCompleteness = (input: PropagationPacketCompletenessInput): PropagationPacketCompleteness => {
  const failures = [...input.relatedWorld.completeness.failures];
  if (input.mode === "proposal" && input.foundational) {
    const atlasMatches = input.atlas.length === PROPAGATION_ATLAS_DOMAINS.length
      && input.atlas.every((domain, index) => domain.name === PROPAGATION_ATLAS_DOMAINS[index]?.name && domain.decisionPrompt.trim());
    if (!atlasMatches) {
      failures.push("Foundational atlas doctrine is missing, incomplete, out of order, or lacks a compact decision prompt; restore the canonical fourteen-domain server doctrine before treating Proposal as complete.");
    }
  }
  if (input.mode === "pressure") {
    for (const record of input.relatedWorld.selectedRecords) {
      if (!record.sourceDocumentId.trim() || !record.stableIdentity.trim() || !record.title.trim() || !record.recordType.trim()
        || !record.canonStatus.trim() || !record.relationship.trim() || !record.inclusionReason.trim() || record.role !== "active context") {
        failures.push(`${record.stableIdentity || "Unidentified related record"}: malformed standing or provenance; restore identity, type, standing, relationship, inclusion reason, and role before treating Pressure as complete.`);
      }
    }
    for (const omissionReason of input.relatedWorld.omissions) {
      if (!/^(?:[A-Z]+-\d+\b|World kernel \(not found\):)/.test(omissionReason)) {
        failures.push(`Related-world omission lacks stable identity: ${omissionReason}; identify the candidate and its exclusion reason before treating Pressure as complete.`);
      }
    }
  }
  const uniqueFailures = [...new Set(failures)];
  return { status: uniqueFailures.length ? "incomplete" : "complete", failures: uniqueFailures };
};
