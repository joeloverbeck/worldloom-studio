export type MutationRegime = "card" | "report";

export interface RecordTypeDefinition {
  key: string;
  label: string;
  namespace: string;
  mutationRegime: MutationRegime;
  packageSource: string;
  untestedSurface?: boolean;
}

export interface VocabularyTerm {
  vocabulary: string;
  term: string;
  packageSource: string;
  extensionAllowed?: boolean;
  seededOther?: boolean;
}

export interface LinkTypeDefinition {
  key: string;
  label: string;
  packageSource: string;
}

export interface HealthPayload {
  ok: true;
  version: string;
}

export type WorkflowMapStageState = "done" | "active" | "owed" | "blocked" | "not_yet_earned";
export type WorkflowMapDestinationKind = "guided-flow" | "read-side" | "substrate";
export type WorkflowMapDestinationState = "done" | "active" | "available" | "owed" | "blocked" | "not_yet_earned";

export interface WorkflowMapStage {
  key: string;
  label: string;
  state: WorkflowMapStageState;
  summary: string;
  destinationKey: string;
  unlockReason?: string;
}

export interface WorkflowMapQueue {
  key: string;
  label: string;
  count: number;
  destinationKey: string;
  href: string;
  summary: string;
}

export interface WorkflowMapDestination {
  key: string;
  label: string;
  kind: WorkflowMapDestinationKind;
  summary: string;
  state: WorkflowMapDestinationState;
}

export type MethodCardGuidanceDepth = "lean" | "standard" | "full";

export interface MethodCard {
  key: string;
  flowKey: string;
  decisionPoint: string;
  decision: string;
  operativeRule: string;
  why: string;
  goodMaterial: string;
  guidanceDepth: MethodCardGuidanceDepth;
  derivationVersion: string;
  packageSources: string[];
}

export interface WorkflowMapPayload {
  readOnly: true;
  world: { path: string };
  stages: WorkflowMapStage[];
  queues: WorkflowMapQueue[];
  nextDecision: {
    destinationKey: string;
    label: string;
    reason: string;
    href: string;
  };
  destinations: WorkflowMapDestination[];
  methodCards?: {
    operatingCard: MethodCard;
    setup: MethodCard;
    workflowMap: MethodCard;
  };
}

export const APP_VERSION = "0.0.0";

export const RECORD_TYPES: RecordTypeDefinition[] = [
  { key: "world_kernel", label: "World kernel", namespace: "KER", mutationRegime: "card", packageSource: "docs/worldbuilding-system/templates/world_kernel.md" },
  { key: "canon_fact", label: "Canon fact", namespace: "FAC", mutationRegime: "card", packageSource: "docs/worldbuilding-system/templates/canon_fact_card.md" },
  { key: "constraint", label: "Constraint", namespace: "CON", mutationRegime: "card", packageSource: "docs/worldbuilding-system/templates/constraint_card.md" },
  { key: "capability", label: "Capability", namespace: "CAP", mutationRegime: "card", packageSource: "docs/worldbuilding-system/templates/capability_card.md" },
  { key: "spatial_region", label: "Spatial region", namespace: "SPA", mutationRegime: "card", packageSource: "docs/worldbuilding-system/templates/spatial_region_card.md", untestedSurface: true },
  { key: "temporal_timeline", label: "Temporal timeline", namespace: "TIM", mutationRegime: "card", packageSource: "docs/worldbuilding-system/templates/temporal_timeline_card.md" },
  { key: "institution", label: "Institution", namespace: "INS", mutationRegime: "card", packageSource: "docs/worldbuilding-system/templates/institution_card.md" },
  { key: "counter_institution", label: "Counter-institution", namespace: "COU", mutationRegime: "card", packageSource: "docs/worldbuilding-system/templates/counter_institution_card.md" },
  { key: "agent_character", label: "Agent character", namespace: "AGE", mutationRegime: "card", packageSource: "docs/worldbuilding-system/templates/agent_character_card.md", untestedSurface: true },
  { key: "action_arena", label: "Action arena", namespace: "ACT", mutationRegime: "card", packageSource: "docs/worldbuilding-system/templates/action_arena_card.md", untestedSurface: true },
  { key: "aesthetic_coherence", label: "Aesthetic coherence", namespace: "AES", mutationRegime: "card", packageSource: "docs/worldbuilding-system/templates/aesthetic_coherence_card.md", untestedSurface: true },
  { key: "mystery_ledger_entry", label: "Mystery ledger entry", namespace: "MYS", mutationRegime: "card", packageSource: "docs/worldbuilding-system/templates/mystery_ledger_entry.md" },
  { key: "admission_ledger_row", label: "Admission ledger row", namespace: "LED", mutationRegime: "card", packageSource: "docs/worldbuilding-system/templates/admission_ledger.md" },
  { key: "canon_debt", label: "Canon debt", namespace: "DEB", mutationRegime: "card", packageSource: "docs/worldbuilding-system/18_quality_assurance_tests.md" },
  { key: "skip_record", label: "Skip record", namespace: "SKP", mutationRegime: "card", packageSource: "docs/worldbuilding-system/21_templates_index.md" },
  { key: "canon_branch_diff", label: "Canon branch diff", namespace: "BRD", mutationRegime: "card", packageSource: "docs/worldbuilding-system/templates/canon_branch_diff.md", untestedSurface: true },
  { key: "propagation_report", label: "Propagation report", namespace: "PRP", mutationRegime: "report", packageSource: "docs/worldbuilding-system/templates/propagation_report.md" },
  { key: "contradiction_report", label: "Contradiction report", namespace: "CTR", mutationRegime: "report", packageSource: "docs/worldbuilding-system/templates/contradiction_report.md" },
  { key: "uncertainty_evidence_card", label: "Uncertainty evidence card", namespace: "UNC", mutationRegime: "report", packageSource: "docs/worldbuilding-system/templates/uncertainty_evidence_card.md", untestedSurface: true },
  { key: "canon_change_proposal", label: "Canon change proposal", namespace: "CCP", mutationRegime: "report", packageSource: "docs/worldbuilding-system/templates/canon_change_proposal.md", untestedSurface: true },
  { key: "collaboration_decision_record", label: "Collaboration decision record", namespace: "CDR", mutationRegime: "report", packageSource: "docs/worldbuilding-system/templates/collaboration_decision_record.md", untestedSurface: true },
  { key: "gate_result", label: "Gate result", namespace: "GAT", mutationRegime: "report", packageSource: "docs/worldbuilding-system/06_canon_fact_admission_protocol.md" },
  { key: "pass_report", label: "Pass report", namespace: "PAS", mutationRegime: "report", packageSource: "docs/worldbuilding-system/21_templates_index.md", untestedSurface: true },
  { key: "qa_scorecard", label: "QA scorecard", namespace: "QA", mutationRegime: "report", packageSource: "docs/worldbuilding-system/18_quality_assurance_tests.md" },
  { key: "qa_pass", label: "QA pass", namespace: "QAP", mutationRegime: "report", packageSource: "docs/worldbuilding-system/18_quality_assurance_tests.md" },
  { key: "seed_decomposition", label: "Seed decomposition", namespace: "SEE", mutationRegime: "report", packageSource: "docs/worldbuilding-system/05_creation_protocol.md" },
  { key: "advisory_artifact", label: "Advisory artifact", namespace: "ADV", mutationRegime: "report", packageSource: "docs/worldbuilding-system/20_ai_assisted_workflow.md" }
];

export const LINK_TYPES: LinkTypeDefinition[] = [
  { key: "depends_on", label: "depends on", packageSource: "docs/worldbuilding-system/02_world_model.md" },
  { key: "blocks", label: "blocks", packageSource: "docs/worldbuilding-system/02_world_model.md" },
  { key: "soft_depends_on", label: "soft depends on", packageSource: "docs/worldbuilding-system/02_world_model.md" },
  { key: "social_depends_on", label: "social depends on", packageSource: "docs/worldbuilding-system/02_world_model.md" },
  { key: "economic_depends_on", label: "economic depends on", packageSource: "docs/worldbuilding-system/02_world_model.md" },
  { key: "epistemic_depends_on", label: "epistemic depends on", packageSource: "docs/worldbuilding-system/02_world_model.md" },
  { key: "temporal_depends_on", label: "temporal depends on", packageSource: "docs/worldbuilding-system/02_world_model.md" },
  { key: "spatial_depends_on", label: "spatial depends on", packageSource: "docs/worldbuilding-system/02_world_model.md" },
  { key: "aesthetic_depends_on", label: "aesthetic depends on", packageSource: "docs/worldbuilding-system/02_world_model.md" },
  { key: "constrains", label: "constrains", packageSource: "docs/worldbuilding-system/templates/constraint_card.md" },
  { key: "opposes", label: "opposes", packageSource: "docs/worldbuilding-system/templates/counter_institution_card.md" },
  { key: "digest_of", label: "digest of", packageSource: "docs/worldbuilding-system/07_propagation_engine.md" },
  { key: "retired_by", label: "retired by", packageSource: "docs/worldbuilding-system/templates/canon_fact_card.md" },
  { key: "supersedes", label: "supersedes", packageSource: "docs/worldbuilding-system/03_truth_layers_and_canon_governance.md" },
  { key: "promoted_to", label: "promoted to", packageSource: "docs/worldbuilding-system/templates/admission_ledger.md" },
  { key: "covers", label: "covers", packageSource: "docs/principles/data-principles.md" },
  { key: "bundles", label: "bundles", packageSource: "docs/principles/data-principles.md" },
  { key: "derived_from", label: "derived from", packageSource: "docs/principles/canon-sovereignty.md" },
  { key: "cites_advisory_artifact", label: "cites advisory artifact", packageSource: "docs/principles/canon-sovereignty.md" },
  { key: "tombstones", label: "tombstones", packageSource: "docs/principles/data-principles.md" },
  { key: "branches_from", label: "branches from", packageSource: "docs/worldbuilding-system/15_branching_versioning_and_collaboration.md" },
  { key: "merge_candidate_for", label: "merge candidate for", packageSource: "docs/worldbuilding-system/15_branching_versioning_and_collaboration.md" },
  { key: "preserves_boundary_for", label: "preserves boundary for", packageSource: "docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md" },
  { key: "requires_follow_up", label: "requires follow-up", packageSource: "docs/worldbuilding-system/checklists/branching_collaboration_sweep.md" },
  { key: "assesses", label: "assesses", packageSource: "docs/worldbuilding-system/18_quality_assurance_tests.md" }
];

const terms = (vocabulary: string, packageSource: string, values: string[], extensionAllowed = false, seededOther = false): VocabularyTerm[] =>
  values.map((term) => ({ vocabulary, term, packageSource, extensionAllowed, seededOther: seededOther || term === "other" }));

export const VOCABULARY_TERMS: VocabularyTerm[] = [
  ...terms("truth_layer", "docs/worldbuilding-system/templates/canon_fact_card.md", ["Objective canon", "author-secret canon", "branch canon", "mystery boundary", "diegetic claim", "public belief", "local belief", "elite belief", "mythic truth", "propaganda", "lie", "honest error", "disputed claim"]),
  ...terms("canon_status", "docs/worldbuilding-system/templates/canon_fact_card.md", ["proposed", "under review", "accepted", "accepted with constraints", "localized", "contested", "quarantined", "branch-only", "superseded", "deprecated", "rejected"]),
  ...terms("constraint_tag", "docs/worldbuilding-system/03_truth_layers_and_canon_governance.md", ["cost-bound", "place-bound", "time-bound", "access-bound", "knowledge-bound", "institution-bound", "branch-bound"]),
  ...terms("constraint_tag", "docs/worldbuilding-system/22_glossary.md", ["ritual-bound", "material-bound", "population-bound"], true, true),
  ...terms("admission_decision_operation", "docs/worldbuilding-system/checklists/canon_fact_gate.md", ["accept", "constrain", "localize", "historicize", "reinterpret", "institutionalize", "price", "branch", "quarantine", "supersede", "deprecate", "reject"]),
  ...terms("repair_operation", "docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md", ["clarify scope", "add constraint", "price the fact", "localize", "historicize", "institutionalize", "diffuse unevenly", "reinterpret", "split", "retcon", "quarantine", "reject"]),
  ...terms("contradiction_disposition", "docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md", ["not a contradiction", "diegetic conflict", "mystery-preserving conflict", "repair required", "branch required", "deprecation required", "rejection required"]),
  ...terms("preservation_operation", "docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md", ["reveal", "delay", "forbid", "consecrate", "dread-preserve", "excess-preserve", "translate"]),
  ...terms("retcon_type", "docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md", ["soft retcon", "hard retcon", "diegetic retcon", "branch retcon", "audience-facing retcon", "back-office retcon"]),
  ...terms("protected_effect_type", "docs/worldbuilding-system/templates/mystery_ledger_entry.md", ["governed mystery", "wonder-awe-sublimity", "sacred opacity", "horror-terror-dread", "symbolic excess"]),
  ...terms("protected_effect_type", "docs/worldbuilding-system/templates/mystery_ledger_entry.md", ["hybrid"], true, true),
  ...terms("consequence_mode", "docs/worldbuilding-system/05_creation_protocol.md", ["realist", "mythic", "weird", "hard speculative", "horror", "satirical", "mixed", "other"], true),
  ...terms("preservation_boundary", "docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md", ["fixed", "author-secret", "deliberately undecided", "forbidden", "evidence-governed", "none"]),
  ...terms("work_scale", "docs/worldbuilding-system/06_canon_fact_admission_protocol.md", ["minor", "moderate", "major", "severe", "catastrophic"]),
  ...terms("admission_level", "docs/worldbuilding-system/06_canon_fact_admission_protocol.md", ["0", "1", "2", "3", "4", "5"]),
  ...terms("fact_type", "docs/worldbuilding-system/templates/canon_fact_card.md", ["world fact", "constraint", "capability", "institution", "character", "spatial", "temporal", "aesthetic rule", "other"], true),
  ...terms("dependency_type", "docs/worldbuilding-system/02_world_model.md", ["hard", "soft", "social", "economic", "epistemic", "temporal", "spatial", "aesthetic"]),
  ...terms("constraint_type", "docs/worldbuilding-system/checklists/constraint_composition_sweep.md", ["access", "cost", "location", "time", "population", "material", "legal", "ritual", "knowledge", "social", "biological", "ecological", "psychological", "aesthetic", "branch"]),
  ...terms("contradiction_type", "docs/worldbuilding-system/templates/contradiction_report.md", ["timeline", "spatial", "causal", "capacity", "institutional", "psychological", "economic", "epistemic", "semantic", "branch"]),
  ...terms("mystery_state", "docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md", ["fixed", "author-secret", "deliberately undecided", "forbidden", "evidence-governed"]),
  ...terms("branch_status", "docs/worldbuilding-system/templates/canon_branch_diff.md", ["active", "retired", "merged", "quarantined"]),
  ...terms("merge_expectation", "docs/worldbuilding-system/templates/canon_branch_diff.md", ["never", "possible", "planned", "required"]),
  ...terms("workflow_role", "docs/worldbuilding-system/templates/collaboration_decision_record.md", ["steward", "contributor", "reviewer", "approver", "implementer", "observer", "advisor", "maintainer"]),
  ...terms("provenance_actor_role", "docs/principles/data-principles.md", ["steward"]),
  ...terms("advisory_disposition", "docs/worldbuilding-system/20_ai_assisted_workflow.md", ["selected", "deleted", "challenged", "ignored", "standing ruling", "adopted with steward revision"]),
  ...terms("consequence_disposition", "docs/worldbuilding-system/07_propagation_engine.md", ["answered", "intentionally scoped out", "assigned as canon debt", "protected as a mystery boundary"]),
  ...terms("admission_ledger_minor_item", "docs/worldbuilding-system/templates/admission_ledger.md", ["fact", "truth layer", "status", "dependencies", "canon debt"])
];

export const RECORD_TYPE_BY_KEY = new Map(RECORD_TYPES.map((recordType) => [recordType.key, recordType]));
