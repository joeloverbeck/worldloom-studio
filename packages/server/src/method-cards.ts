import type { MethodCard, MethodCardGuidanceDepth } from "@worldloom/shared";

export const METHOD_CARD_DERIVATION_VERSION = "method-card/v1";

type MethodCardInput = Omit<MethodCard, "derivationVersion"> & {
  guidanceDepth: MethodCardGuidanceDepth;
};

const card = (input: MethodCardInput): MethodCard => ({
  ...input,
  derivationVersion: METHOD_CARD_DERIVATION_VERSION
});

export const METHOD_CARDS: MethodCard[] = [
  card({
    key: "creation.kernel",
    flowKey: "creation",
    decisionPoint: "World kernel",
    decision: "Define the world's first governing kernel or pressure seed.",
    operativeRule: "Start lean: name the premise, starting scale, consequence mode, initial pressures, and any protected unknowns before decomposing seeds.",
    why: "The kernel gives later facts something to answer without turning Creation into an encyclopedia.",
    goodMaterial: "A good kernel is brief, consequence-bearing, explicit about consequence mode, and clear enough that a later seed can be accepted or rejected independently.",
    guidanceDepth: "standard",
    packageSources: [
      "docs/worldbuilding-system/05_creation_protocol.md",
      "docs/worldbuilding-system/templates/world_kernel.md",
      "docs/worldbuilding-system/20_ai_assisted_workflow.md"
    ]
  }),
  card({
    key: "creation.seed-decomposition",
    flowKey: "creation",
    decisionPoint: "Seed decomposition",
    decision: "Split broad steward material into smaller seed facts that can be independently rejected.",
    operativeRule: "Decompose until each seed can be rejected without destroying its siblings, then park it as proposed for Admission.",
    why: "Creation finds workable pressure seeds; Admission owns first canon standing.",
    goodMaterial: "Good seeds have a title, prose body, explicit truth layer, proposed canon status, and a granularity rationale or confirmation.",
    guidanceDepth: "standard",
    packageSources: [
      "docs/worldbuilding-system/05_creation_protocol.md",
      "docs/worldbuilding-system/06_canon_fact_admission_protocol.md",
      "docs/worldbuilding-system/20_ai_assisted_workflow.md"
    ]
  }),
  card({
    key: "admission.queue-severity",
    flowKey: "admission",
    decisionPoint: "Admission queue and severity",
    decision: "Choose and classify the proposed fact before Admission changes canon standing.",
    operativeRule: "The steward declares admission_level and work_scale; the app uses those declarations to choose minor ledger or full gate depth.",
    why: "Admission is the only flow that changes canon standing, so classification must be explicit before mutation.",
    goodMaterial: "Good severity choice states the fact's scale, keeps truth layer separate from canon status, and names why the chosen path is cheap or deep enough.",
    guidanceDepth: "standard",
    packageSources: ["docs/worldbuilding-system/06_canon_fact_admission_protocol.md"]
  }),
  card({
    key: "admission.minor-ledger",
    flowKey: "admission",
    decisionPoint: "Minor admission ledger",
    decision: "Complete the minor admission ledger while preserving batch speed.",
    operativeRule: "Minor work still owes fact statement, scope, truth layer, canon status, constraint tags, ordered operation, and one consequence check.",
    why: "Cheap Admission is allowed, but a fact still needs enough substance to enter governance honestly.",
    goodMaterial: "A good minor ledger row is concise, names one real consequence, and keeps separated labels out of the prose.",
    guidanceDepth: "lean",
    packageSources: [
      "docs/worldbuilding-system/06_canon_fact_admission_protocol.md",
      "docs/worldbuilding-system/templates/admission_ledger.md"
    ]
  }),
  card({
    key: "admission.full-gate",
    flowKey: "admission",
    decisionPoint: "Full canon fact gate",
    decision: "Complete the full canon fact gate with written substance.",
    operativeRule: "Major-or-higher work owes written consequences, ordered admission operations, n/a reasons, quiet-domain declarations, and follow-up debt where appropriate.",
    why: "Load-bearing canon changes should expose their costs before they become accepted world truth.",
    goodMaterial: "Good full-gate material names dependencies, costs, access limits, shock-cone summary, contradiction or mystery risk, and follow-up obligations in steward wording.",
    guidanceDepth: "full",
    packageSources: [
      "docs/worldbuilding-system/06_canon_fact_admission_protocol.md",
      "docs/worldbuilding-system/checklists/canon_fact_gate.md"
    ]
  }),
  card({
    key: "admission.seed-audit",
    flowKey: "admission",
    decisionPoint: "Frontloaded seed audit",
    decision: "Audit Creation seeds before their first canon admission when the seed origin makes that work relevant.",
    operativeRule: "The audit checks seed fitness without mutating truth layer, canon status, tags, severity, or operations.",
    why: "Seed audit catches Creation shortcuts at the Admission boundary, where canon standing is actually governed.",
    goodMaterial: "Good audit evidence names what was checked, what was left alone, and any debt or skip record created.",
    guidanceDepth: "standard",
    packageSources: [
      "docs/worldbuilding-system/05_creation_protocol.md",
      "docs/worldbuilding-system/06_canon_fact_admission_protocol.md",
      "docs/worldbuilding-system/checklists/frontloaded_seed_audit.md"
    ]
  }),
  card({
    key: "constraint.source-selection",
    flowKey: "constraint_composition",
    decisionPoint: "Constraint source selection",
    decision: "Choose the source and constrained subject.",
    operativeRule: "Start from a fact, capability, constraint card, canon debt, selected material, record section, or pass report, then name what is being constrained.",
    why: "Constraint Composition only works when the constrained material is explicit enough to test.",
    goodMaterial: "Good source framing names the material under pressure and the subject whose limits will be examined.",
    guidanceDepth: "standard",
    packageSources: ["docs/worldbuilding-system/08_constraint_composition.md"]
  }),
  card({
    key: "constraint.inventory",
    flowKey: "constraint_composition",
    decisionPoint: "Constraint inventory",
    decision: "Record what each constraint prevents, allows, exposes, and leaves behind.",
    operativeRule: "A constraint is not a label; it needs prevented outcome, allowed remainder, boundary knowledge, bypass actors, enforcement, and residue.",
    why: "Constraint work preserves consequence by making limits create pressure instead of closing play.",
    goodMaterial: "Good inventory prose names a concrete bottleneck, the actors who test it, and visible residue in ordinary life.",
    guidanceDepth: "full",
    packageSources: [
      "docs/worldbuilding-system/08_constraint_composition.md",
      "docs/worldbuilding-system/checklists/constraint_composition_sweep.md",
      "docs/worldbuilding-system/templates/constraint_card.md"
    ]
  }),
  card({
    key: "constraint.composition",
    flowKey: "constraint_composition",
    decisionPoint: "Composition testing",
    decision: "Test stacking, gates, tradeoffs, thresholds, sequences, cancellation, contradiction, and chains.",
    operativeRule: "Composition evidence must explain how constraints interact; checkbox-only answers are not evidence.",
    why: "Multiple constraints are where worlds become causal systems rather than lists of restrictions.",
    goodMaterial: "Good composition names at least one pressure created by interaction and one failure mode or tradeoff.",
    guidanceDepth: "full",
    packageSources: [
      "docs/worldbuilding-system/08_constraint_composition.md",
      "docs/worldbuilding-system/checklists/constraint_composition_sweep.md"
    ]
  }),
  card({
    key: "constraint.outcomes",
    flowKey: "constraint_composition",
    decisionPoint: "Constraint outcomes",
    decision: "Choose card links, Admission proposals, canon debt, advisory use, skips, or explicit non-mutation.",
    operativeRule: "Constraint sweeps propose and route; only Admission admits, and advisory material must be explicitly disposed before use.",
    why: "The pass creates governed outcomes without smuggling new canon around Admission.",
    goodMaterial: "Good outcomes name the target record, route, advisory provenance if any, and why unresolved work becomes canon debt or a skip.",
    guidanceDepth: "standard",
    packageSources: [
      "docs/worldbuilding-system/08_constraint_composition.md",
      "docs/worldbuilding-system/20_ai_assisted_workflow.md"
    ]
  }),
  card({
    key: "stage12.lens",
    flowKey: "institutional_economic_suppression",
    decisionPoint: "Stage 12 lens",
    decision: "Work the institutional, economic, or suppression lens that applies to the selected material.",
    operativeRule: "Each required lens needs steward-authored substance; a checkbox alone is not evidence.",
    why: "Stage 12 turns power, cost, enforcement, and counter-institutions into visible consequences.",
    goodMaterial: "Good lens prose names actors, rules-in-use, transaction costs, surplus capture, suppression residue, or counter-institutions in the world.",
    guidanceDepth: "full",
    packageSources: [
      "docs/worldbuilding-system/12_institutional_economic_and_suppression_protocol.md",
      "docs/worldbuilding-system/checklists/institutional_economic_suppression_sweep.md"
    ]
  }),
  card({
    key: "stage12.outcomes",
    flowKey: "institutional_economic_suppression",
    decisionPoint: "Stage 12 outcomes",
    decision: "Choose linked cards, Admission proposals, canon debt, advisory use, or governed skips.",
    operativeRule: "Stage 12 may surface cards and proposals, but canon standing still routes through Admission.",
    why: "Institutional and economic consequences often create follow-up work that needs durable routing.",
    goodMaterial: "Good outcomes name the lens, the proposed record or debt, advisory provenance if any, and the reason unresolved work remains open.",
    guidanceDepth: "standard",
    packageSources: [
      "docs/worldbuilding-system/12_institutional_economic_and_suppression_protocol.md",
      "docs/worldbuilding-system/21_templates_index.md",
      "docs/worldbuilding-system/20_ai_assisted_workflow.md"
    ]
  }),
  card({
    key: "propagation.entry",
    flowKey: "propagation",
    decisionPoint: "Propagation run entry",
    decision: "Start the shock cone for a canon fact or propagation-scoped canon debt.",
    operativeRule: "Propagation asks what changes because this fact is true, at the coverage depth licensed by severity.",
    why: "Accepted facts become world pressure only when their consequences are worked.",
    goodMaterial: "Good entry material names the fact, its scale, and whether owed debt is driving this run.",
    guidanceDepth: "standard",
    packageSources: [
      "docs/worldbuilding-system/07_propagation_engine.md",
      "docs/worldbuilding-system/04_domain_atlas.md"
    ]
  }),
  card({
    key: "propagation.disposition",
    flowKey: "propagation",
    decisionPoint: "Consequence disposition",
    decision: "Answer, scope out, assign as canon debt, or protect each high-pressure consequence as a mystery boundary.",
    operativeRule: "Every high-pressure consequence must reach one of the four stopping states before close.",
    why: "The stop rule prevents fatigue from masquerading as completion.",
    goodMaterial: "Good disposition names the chosen state and gives enough note, debt, or preservation boundary to resume or audit later.",
    guidanceDepth: "full",
    packageSources: [
      "docs/worldbuilding-system/07_propagation_engine.md",
      "docs/worldbuilding-system/04_domain_atlas.md"
    ]
  }),
  card({
    key: "contradiction.guidance",
    flowKey: "contradiction",
    decisionPoint: "Contradiction, retcon, and mystery repair",
    decision: "Triage the conflict, choose disposition, repair within jurisdiction, and protect mystery boundaries when needed.",
    operativeRule: "Repair operations stay separate from Admission operations, retcons record cost, and mystery-preserving closes require preservation evidence.",
    why: "Repair keeps canon coherent without flattening protected uncertainty or bypassing governance.",
    goodMaterial: "Good repair material names affected truth layers, work scale, disposition, ordered repair operations, retcon cost if any, and repair propagation.",
    guidanceDepth: "full",
    packageSources: [
      "docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md",
      "docs/worldbuilding-system/templates/contradiction_report.md",
      "docs/worldbuilding-system/checklists/mystery_preservation.md"
    ]
  }),
  card({
    key: "qa.scorecard",
    flowKey: "qa",
    decisionPoint: "QA scorecard",
    decision: "Score stability, name n/a reasons, profile weak domains, and route repairs before finalizing the pass.",
    operativeRule: "Scores require notes where judgment matters, n/a requires a reason, and low load-bearing scores require repair routing.",
    why: "QA makes world stability visible before the steward calls a version stable.",
    goodMaterial: "Good QA evidence names the scored test, the reason for n/a or low score, repair text, and any debt or proposal created.",
    guidanceDepth: "full",
    packageSources: ["docs/worldbuilding-system/18_quality_assurance_tests.md"]
  }),
  card({
    key: "setup.open-world",
    flowKey: "setup",
    decisionPoint: "Open world",
    decision: "Create or open the world file that owns this steward's canon work.",
    operativeRule: "One visible SQLite world file is canonical; browser storage is never the source of truth.",
    why: "Local-first ownership lets the data outlive the app.",
    goodMaterial: "Good setup makes the current world path visible and keeps recovery instructions about choosing or creating a valid Worldloom world file.",
    guidanceDepth: "lean",
    packageSources: [
      "docs/principles/data-principles.md",
      "docs/adr/0001-sqlite-file-per-world.md",
      "docs/adr/0002-localhost-native-process.md"
    ]
  }),
  card({
    key: "workflow-map.orientation",
    flowKey: "workflow_map",
    decisionPoint: "Workflow map",
    decision: "Choose the next method destination from live world state.",
    operativeRule: "The map is the home surface: it foregrounds active, owed, blocked, and not-yet-earned method work without becoming a project dashboard.",
    why: "The steward should know where they are in the method and why that destination is next.",
    goodMaterial: "A good map explains the next decision, queues, blockers, stages, and safe route back to guided work.",
    guidanceDepth: "lean",
    packageSources: [
      "docs/principles/guided-workflow-usability.md",
      "docs/specs/workflow-map-and-navigation.md"
    ]
  }),
  card({
    key: "operating-card",
    flowKey: "operating_card",
    decisionPoint: "Operating card",
    decision: "Keep the method's working-memory rule visible while the steward works.",
    operativeRule: "Start lean, work consequences, route commitment through Admission, and keep provenance separate from instruction.",
    why: "The operating card is a versioned derivation that keeps the method close without making package files the working surface.",
    goodMaterial: "Good operating-card copy is short, non-editable, and points to provenance only as audit detail.",
    guidanceDepth: "lean",
    packageSources: [
      "docs/worldbuilding-system/operating_card.md",
      "docs/principles/workflow-principles.md",
      "docs/principles/guided-workflow-usability.md"
    ]
  })
];

export const methodCard = (key: string): MethodCard => {
  const found = METHOD_CARDS.find((item) => item.key === key);
  if (!found) throw new Error(`Method card not found: ${key}`);
  return found;
};

export const maybeMethodCard = (key: string): MethodCard | null =>
  METHOD_CARDS.find((item) => item.key === key) ?? null;

export const methodCardsForFlow = (flowKey: string): MethodCard[] =>
  METHOD_CARDS.filter((item) => item.flowKey === flowKey);

export const methodCardDoctrineSlots = (cardValue: MethodCard): string[] => [
  `Decision: ${cardValue.decision}`,
  `Operative rule: ${cardValue.operativeRule}`,
  `Why the method asks: ${cardValue.why}`,
  `What good material looks like: ${cardValue.goodMaterial}`
];

export const methodCardSourceManifest = (cardValue: MethodCard): string[] => [
  `Method card: ${cardValue.key} (${cardValue.derivationVersion})`,
  ...cardValue.packageSources.map((source) => `Package source: ${source}`)
];

export const workflowMapMethodCards = () => ({
  operatingCard: methodCard("operating-card"),
  setup: methodCard("setup.open-world"),
  workflowMap: methodCard("workflow-map.orientation")
});

export const untestedSurfacePackageSources = [
  "docs/worldbuilding-system/10_spatial_and_geographic_propagation.md",
  "docs/worldbuilding-system/11_agent_character_psychology.md",
  "docs/worldbuilding-system/14_uncertainty_belief_and_evidence.md",
  "docs/worldbuilding-system/16_narrative_game_and_transmedia_extraction.md",
  "docs/worldbuilding-system/17_aesthetic_coherence_and_semiosis.md",
  "docs/worldbuilding-system/templates/spatial_region_card.md",
  "docs/worldbuilding-system/templates/agent_character_card.md",
  "docs/worldbuilding-system/templates/uncertainty_evidence_card.md",
  "docs/worldbuilding-system/templates/aesthetic_coherence_card.md"
];
