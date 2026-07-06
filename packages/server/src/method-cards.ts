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
    key: "constraint.constrained-fact",
    flowKey: "constraint_composition",
    decisionPoint: "Constrained-fact framing",
    decision: "Name the fact, capability, card, debt, or selected material whose limits are being tested.",
    operativeRule: "Constraint work starts by making the constrained subject explicit before inventory or composition begins.",
    why: "A constraint cannot create useful pressure if the steward has not named what is limited.",
    goodMaterial: "Good framing names the constrained subject, the source material, and the reason this limit matters to the world.",
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
    key: "constraint.leakage-residue",
    flowKey: "constraint_composition",
    decisionPoint: "Leakage and residue",
    decision: "Record loopholes, false bypasses, countermeasures, and ordinary-life residue.",
    operativeRule: "Limits are only believable when the steward records who tests them, where they leak, and what residue remains.",
    why: "Leakage and residue keep constraints from becoming abstract prohibitions with no world effect.",
    goodMaterial: "Good leakage and residue prose names boundary testers, countermeasures, visible traces, resentment, markets, and failure modes.",
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
    key: "constraint.prompt-out-skips",
    flowKey: "constraint_composition",
    decisionPoint: "Constraint Prompt-out and skips",
    decision: "Use, dispose, cite, or skip advisory pressure for the constraint pass.",
    operativeRule: "Prompt-out is advisory; skipped instruments and used advisory material must leave governed records before they affect outcomes.",
    why: "Constraint pressure can help, but it must not smuggle unowned material or silent omissions into canon work.",
    goodMaterial: "Good advisory handling names the prompt-out step, the disposition, the cited artifact if used, and the skip or debt when declined work remains.",
    guidanceDepth: "standard",
    packageSources: [
      "docs/worldbuilding-system/08_constraint_composition.md",
      "docs/worldbuilding-system/20_ai_assisted_workflow.md",
      "docs/worldbuilding-system/21_templates_index.md"
    ]
  }),
  card({
    key: "constraint.close-preview",
    flowKey: "constraint_composition",
    decisionPoint: "Constraint close preview",
    decision: "Check server blockers before the pass report closes.",
    operativeRule: "A completed pass must leave constraint budget, loopholes, enforcement, residue, and routed outcomes or explicit non-mutation.",
    why: "Close readiness prevents checkbox completion from replacing performed constraint work.",
    goodMaterial: "Good close evidence shows required coverage satisfied, unresolved work routed, and the pass report ready to become append-only audit trail.",
    guidanceDepth: "standard",
    packageSources: [
      "docs/worldbuilding-system/08_constraint_composition.md",
      "docs/worldbuilding-system/21_templates_index.md"
    ]
  }),
  card({
    key: "constraint.read-side-trail",
    flowKey: "constraint_composition",
    decisionPoint: "Constraint read-side trail",
    decision: "Follow the pass report, source, cards, proposals, debt, advisory artifacts, and skips after the decision.",
    operativeRule: "Constraint outcomes remain auditable through record links and read-side trails rather than hidden browser state.",
    why: "The steward must be able to see how a constraint pass created or routed later work.",
    goodMaterial: "A good trail links the pass report, source record, surfaced proposals, canon debt, skipped instruments, and consulted advisory material.",
    guidanceDepth: "lean",
    packageSources: [
      "docs/worldbuilding-system/08_constraint_composition.md",
      "docs/principles/data-principles.md"
    ]
  }),
  card({
    key: "temporal.run-entry",
    flowKey: "temporal_timeline",
    decisionPoint: "Temporal run entry",
    decision: "Choose the source and decide whether the Temporal trigger recommendation applies.",
    operativeRule: "Start from a fact, capability, selected material, canon debt, or pass report; the app shows `09`'s trigger rule as guidance and never classifies applicability.",
    why: "Temporal work only earns its keep when timing is load-bearing enough to affect sequence, discovery, institutions, residue, evidence, branch, or retcon pressure.",
    goodMaterial: "Good entry material names the audited subject, source provenance, and why timing matters without defaulting date type, granularity, or trigger judgment.",
    guidanceDepth: "standard",
    packageSources: ["docs/worldbuilding-system/09_temporal_and_timeline_protocol.md"]
  }),
  card({
    key: "temporal.questions",
    flowKey: "temporal_timeline",
    decisionPoint: "Temporal questions",
    decision: "Answer when the fact became true, became known, adapted, and left residue.",
    operativeRule: "Work time as causality under sequence, duration, delay, memory, and residue rather than as a date field.",
    why: "The package asks these questions to keep causal order from breaking when timing becomes load-bearing.",
    goodMaterial: "Good answers separate first-true, first-known, public, institutional, ordinary-life, and mythic timing where those distinctions matter.",
    guidanceDepth: "full",
    packageSources: [
      "docs/worldbuilding-system/09_temporal_and_timeline_protocol.md",
      "docs/worldbuilding-system/checklists/temporal_timeline_sweep.md"
    ]
  }),
  card({
    key: "temporal.date-type-granularity",
    flowKey: "temporal_timeline",
    decisionPoint: "Date type and granularity",
    decision: "Separate date facets and choose the lightest granularity that preserves causal order.",
    operativeRule: "Event, discovery, public, institutional, ordinary-life, mythic, and authorial revision dates remain separate prose facets; the app never collapses them into one timestamp.",
    why: "A fact can be ancient, publicly recent, institutionally suppressed, and mythically misdated at the same time.",
    goodMaterial: "Good granularity states whether before/after, season, reign, generation, era, exact date, ritual cycle, draft phase, mythic age, or subjective time is enough.",
    guidanceDepth: "full",
    packageSources: [
      "docs/worldbuilding-system/09_temporal_and_timeline_protocol.md",
      "docs/principles/data-principles.md"
    ]
  }),
  card({
    key: "temporal.latency-residue",
    flowKey: "temporal_timeline",
    decisionPoint: "Latency and residue",
    decision: "Explain why adaptation is delayed and what residue remains by timescale.",
    operativeRule: "Latency must be plausible, and old facts need old residue; unreasoned 'none' is not Temporal evidence.",
    why: "Latency explains why a powerful fact has not transformed everything instantly.",
    goodMaterial: "Good material names discovery, proof, travel, training, manufacturing, adoption, legal, generational, taboo, suppression, ecological, or aesthetic reveal delay plus days/months, years, generations, or era-scale fossils.",
    guidanceDepth: "full",
    packageSources: [
      "docs/worldbuilding-system/09_temporal_and_timeline_protocol.md",
      "docs/worldbuilding-system/checklists/temporal_timeline_sweep.md"
    ]
  }),
  card({
    key: "temporal.sequence-retrospective",
    flowKey: "temporal_timeline",
    decisionPoint: "Sequence integrity and retrospective insertion",
    decision: "Check that effects follow causes, and treat inserted facts as timeline disturbances.",
    operativeRule: "An inserted fact must state what was always true, what became true later, who noticed first, and what old canon should now reflect.",
    why: "Sequence failures are where a timeline breaks even when dates look plausible.",
    goodMaterial: "Good material names precursor events, later effects, existing scenes or institutions that must change, and any reader/player-facing explanation owed.",
    guidanceDepth: "full",
    packageSources: ["docs/worldbuilding-system/09_temporal_and_timeline_protocol.md"]
  }),
  card({
    key: "temporal.mystery-boundaries",
    flowKey: "temporal_timeline",
    decisionPoint: "Temporal mystery boundaries",
    decision: "Record observable boundaries without solving protected time mysteries or opening branch UI.",
    operativeRule: "Temporal mysteries can remain mysterious, but recurrence windows, boundaries, forbidden uses, branch divergence, and observable residue stay governed.",
    why: "Protected time cannot become unmanaged time; mystery limits explanation, not continuity.",
    goodMaterial: "Good material names cyclical history, prophecy, missing years, disagreeing records, outside-time agents, unreliable calendars, or branch memories with boundaries and forbidden uses.",
    guidanceDepth: "full",
    packageSources: [
      "docs/worldbuilding-system/09_temporal_and_timeline_protocol.md",
      "docs/adr/0003-branch-and-collaboration-schema-door.md"
    ]
  }),
  card({
    key: "temporal.outcomes",
    flowKey: "temporal_timeline",
    decisionPoint: "Temporal outcomes",
    decision: "Choose card links, Admission proposals, canon debt, advisory use, skips, explicit no-card close, or non-mutation.",
    operativeRule: "Temporal sweeps propose and route; only Admission admits, and timing cards are written only when timing itself is load-bearing.",
    why: "The pass may discover precursor events, era boundaries, archives, or institutions, but those facts still need Admission.",
    goodMaterial: "Good outcomes name the timeline card or no-card reason, proposed facts, debt, advisory provenance if used, and read-side trail.",
    guidanceDepth: "standard",
    packageSources: [
      "docs/worldbuilding-system/09_temporal_and_timeline_protocol.md",
      "docs/worldbuilding-system/templates/temporal_timeline_card.md",
      "docs/worldbuilding-system/06_canon_fact_admission_protocol.md"
    ]
  }),
  card({
    key: "temporal.prompt-out-skips",
    flowKey: "temporal_timeline",
    decisionPoint: "Temporal Prompt-out and skips",
    decision: "Use, dispose, cite, or skip advisory Temporal pressure.",
    operativeRule: "Prompt-out is advisory; skipped instruments and used advisory material must leave governed records before they affect outcomes.",
    why: "Spatial-temporal pressure can catch hidden sequence and residue failures without becoming canon authority.",
    goodMaterial: "Good advisory handling names the prompt-out step, disposition, consulted artifact if used, and any skip or debt left by declined work.",
    guidanceDepth: "standard",
    packageSources: [
      "docs/worldbuilding-system/09_temporal_and_timeline_protocol.md",
      "docs/worldbuilding-system/20_ai_assisted_workflow.md",
      "docs/worldbuilding-system/21_templates_index.md"
    ]
  }),
  card({
    key: "temporal.close-preview",
    flowKey: "temporal_timeline",
    decisionPoint: "Temporal close preview",
    decision: "Check server blockers before the pass report closes.",
    operativeRule: "Close only after sequence, latency, date facets, residue, mystery boundaries, and outcomes have steward-authored substance or governed routing.",
    why: "Temporal close prevents a checked timeline from replacing a worked chronology.",
    goodMaterial: "Good close evidence names satisfied blockers, cards/proposals/debt/skips, explicit non-mutations, and the pass report that preserves the audit.",
    guidanceDepth: "standard",
    packageSources: [
      "docs/worldbuilding-system/09_temporal_and_timeline_protocol.md",
      "docs/worldbuilding-system/21_templates_index.md"
    ]
  }),
  card({
    key: "temporal.read-side-trail",
    flowKey: "temporal_timeline",
    decisionPoint: "Temporal read-side trail",
    decision: "Follow the pass report, source, cards, proposals, debt, advisory artifacts, and skips after the decision.",
    operativeRule: "Temporal outcomes remain auditable through record links and read-side trails rather than hidden browser state.",
    why: "The steward must be able to see how a timing pass created or routed later work.",
    goodMaterial: "A good trail links the pass report, source record, timeline cards, surfaced proposals, canon debt, skipped instruments, and consulted advisory material.",
    guidanceDepth: "lean",
    packageSources: [
      "docs/worldbuilding-system/09_temporal_and_timeline_protocol.md",
      "docs/principles/data-principles.md"
    ]
  }),
  card({
    key: "stage12.entry",
    flowKey: "institutional_economic_suppression",
    decisionPoint: "Stage 12 run entry",
    decision: "Choose the material that needs institutional, economic, or suppression pressure.",
    operativeRule: "Start from a fact, under-review fact, canon debt, selected material, record section, or pass report, then preserve source provenance.",
    why: "Stage 12 work is meaningful only when the pressure source is explicit and resumable.",
    goodMaterial: "Good entry material names the source, why this pass is owed, and which record or selected prose the pass will analyze.",
    guidanceDepth: "standard",
    packageSources: ["docs/worldbuilding-system/12_institutional_economic_and_suppression_protocol.md"]
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
    key: "stage12.close-readiness",
    flowKey: "institutional_economic_suppression",
    decisionPoint: "Stage 12 close readiness",
    decision: "Confirm every required lens has steward-authored substance before closing the pass.",
    operativeRule: "A checkbox alone is not evidence; missing lens substance blocks close until the pass records enough world-specific prose.",
    why: "Institutional and economic passes should close because pressure was worked, not because the steward reached the end of a form.",
    goodMaterial: "Good close evidence names each satisfied lens, routed proposals or debt, governed skips, and the pass report that preserves the audit trail.",
    guidanceDepth: "standard",
    packageSources: [
      "docs/worldbuilding-system/12_institutional_economic_and_suppression_protocol.md",
      "docs/worldbuilding-system/checklists/institutional_economic_suppression_sweep.md",
      "docs/worldbuilding-system/21_templates_index.md"
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
    key: "propagation.shock-cone-orders",
    flowKey: "propagation",
    decisionPoint: "Shock-cone orders",
    decision: "Work the ordered consequences of the accepted fact.",
    operativeRule: "Move from definition through direct effects, adaptations, institutions, residue, and identity pressure at the depth severity licenses.",
    why: "The shock cone turns a fact into causal pressure across the world instead of leaving it as an isolated statement.",
    goodMaterial: "Good order evidence names a consequence, its order, pressure level, and enough prose to show why the world now answers differently.",
    guidanceDepth: "full",
    packageSources: ["docs/worldbuilding-system/07_propagation_engine.md"]
  }),
  card({
    key: "propagation.domain-atlas",
    flowKey: "propagation",
    decisionPoint: "Domain-atlas sweep",
    decision: "Classify which domains are directly changed, indirectly pressured, reactive, or quiet.",
    operativeRule: "Domain declarations should explain the relationship to the fact, and negative domains need explicit declarations when they matter.",
    why: "The domain atlas prevents the steward from only following the most obvious consequence path.",
    goodMaterial: "Good domain evidence names direct, dependency, reaction, or negative pressure and gives enough declaration to audit why the domain was handled that way.",
    guidanceDepth: "full",
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
    key: "propagation.proposals",
    flowKey: "propagation",
    decisionPoint: "Surfaced propagation proposals",
    decision: "Route surfaced consequences as proposed facts when the pass creates new canon work.",
    operativeRule: "Propagation may surface proposed facts, but Admission remains the only path to canon standing.",
    why: "Consequences can become new work without bypassing governance.",
    goodMaterial: "Good surfaced proposals name the consequence source, truth layer, proposed canon status, and Admission route.",
    guidanceDepth: "standard",
    packageSources: [
      "docs/worldbuilding-system/07_propagation_engine.md",
      "docs/worldbuilding-system/06_canon_fact_admission_protocol.md"
    ]
  }),
  card({
    key: "propagation.close",
    flowKey: "propagation",
    decisionPoint: "Propagation close",
    decision: "Close only after high-pressure consequences reach a stopping state.",
    operativeRule: "Open high-pressure consequences block close until answered, scoped out, assigned as canon debt, or protected as a mystery boundary.",
    why: "Propagation close is the audit point that keeps unfinished consequences visible.",
    goodMaterial: "Good close material names the report, unresolved blockers if any, and the stopping state for every high-pressure consequence.",
    guidanceDepth: "standard",
    packageSources: [
      "docs/worldbuilding-system/07_propagation_engine.md",
      "docs/worldbuilding-system/21_templates_index.md"
    ]
  }),
  card({
    key: "contradiction.triage",
    flowKey: "contradiction",
    decisionPoint: "Contradiction triage",
    decision: "State the contradiction or mystery pressure and name the affected scope.",
    operativeRule: "Triage records affected truth layers, who can notice, contradiction type, higher authority, and mystery relationship before repair.",
    why: "Repair starts by separating actual contradictions from diegetic conflict and protected uncertainty.",
    goodMaterial: "Good triage names the claims in tension, affected records, notice boundaries, and whether mystery protection is at stake.",
    guidanceDepth: "full",
    packageSources: [
      "docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md",
      "docs/worldbuilding-system/templates/contradiction_report.md"
    ]
  }),
  card({
    key: "contradiction.work-scale",
    flowKey: "contradiction",
    decisionPoint: "Contradiction work scale",
    decision: "Declare the work scale before choosing repair depth.",
    operativeRule: "Repair cost scales with the steward-declared work scale; the app must not infer that judgment.",
    why: "Scale decides how much evidence, routing, and audit the repair owes.",
    goodMaterial: "Good scale material explains why the conflict is minor, moderate, major, severe, or catastrophic in world terms.",
    guidanceDepth: "standard",
    packageSources: [
      "docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md",
      "docs/worldbuilding-system/06_canon_fact_admission_protocol.md"
    ]
  }),
  card({
    key: "contradiction.disposition",
    flowKey: "contradiction",
    decisionPoint: "Contradiction disposition",
    decision: "Choose whether this is not a contradiction, diegetic conflict, mystery-preserving conflict, or repair work.",
    operativeRule: "Disposition selects the repair jurisdiction and must not collapse protected mystery into ordinary inconsistency.",
    why: "The same apparent conflict can require no repair, diegetic handling, mystery protection, or canon repair.",
    goodMaterial: "Good disposition material names the chosen disposition and the reason that route respects truth layers and protected effects.",
    guidanceDepth: "full",
    packageSources: ["docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md"]
  }),
  card({
    key: "contradiction.repair",
    flowKey: "contradiction",
    decisionPoint: "Repair operations",
    decision: "Record ordered repair operations and steward-authored repair text.",
    operativeRule: "Repair operations stay separate from Admission operations, with the primary repair operation first.",
    why: "Repair changes governance state without pretending it is first admission.",
    goodMaterial: "Good repair material names affected records, ordered operations, next canon status if any, and repair prose in steward wording.",
    guidanceDepth: "full",
    packageSources: [
      "docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md",
      "docs/worldbuilding-system/templates/contradiction_report.md"
    ]
  }),
  card({
    key: "contradiction.retcon-cost",
    flowKey: "contradiction",
    decisionPoint: "Retcon cost",
    decision: "Record the cost of any retcon before it is accepted as repair.",
    operativeRule: "Retcons owe explicit cost by type, not only a replacement statement.",
    why: "Cost makes the repair's damage visible before the steward chooses it.",
    goodMaterial: "Good retcon cost names continuity, institutional, character, mystery, aesthetic, or future cost with concrete prose.",
    guidanceDepth: "full",
    packageSources: ["docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md"]
  }),
  card({
    key: "contradiction.repair-propagation",
    flowKey: "contradiction",
    decisionPoint: "Repair propagation",
    decision: "Assign or decline the follow-up propagation owed by repair.",
    operativeRule: "Repairs that change consequences either create propagation debt or record a governed decline.",
    why: "Repair can create new shock cones, and silent non-propagation hides downstream costs.",
    goodMaterial: "Good repair propagation names the debt or skip record, why it is owed or declined, and which repaired material it follows.",
    guidanceDepth: "standard",
    packageSources: [
      "docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md",
      "docs/worldbuilding-system/07_propagation_engine.md"
    ]
  }),
  card({
    key: "contradiction.mystery-preservation",
    flowKey: "contradiction",
    decisionPoint: "Mystery preservation",
    decision: "Protect mystery boundaries when repair pressure would flatten uncertainty or sacred opacity.",
    operativeRule: "Mystery-preserving closes require preservation evidence, reveal permissions, reveal prohibitions, and accountability where required.",
    why: "The method allows protected uncertainty, but only when its consequences remain governed.",
    goodMaterial: "Good preservation material names fixed facts, secret or undecided material, damaging explanations, reveal boundaries, and sacred-opacity accountability when owed.",
    guidanceDepth: "full",
    packageSources: [
      "docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md",
      "docs/worldbuilding-system/checklists/mystery_preservation.md",
      "docs/worldbuilding-system/templates/mystery_ledger_entry.md"
    ]
  }),
  card({
    key: "contradiction.close",
    flowKey: "contradiction",
    decisionPoint: "Contradiction close",
    decision: "Close the contradiction only after repair, propagation, proposals, and mystery evidence are routed.",
    operativeRule: "Close writes audit evidence and leaves unresolved consequences as routed work rather than invisible leftovers.",
    why: "Contradiction repair is only stable when the audit trail shows what changed and what remains owed.",
    goodMaterial: "Good close material names the contradiction report, final disposition, changed records, routed proposals or debt, and preservation evidence if relevant.",
    guidanceDepth: "standard",
    packageSources: [
      "docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md",
      "docs/worldbuilding-system/21_templates_index.md"
    ]
  }),
  card({
    key: "qa.entry",
    flowKey: "qa",
    decisionPoint: "QA pass entry",
    decision: "Choose the record or whole world to score before calling it stable.",
    operativeRule: "QA starts by naming the subject, preserving the pass report, and keeping score judgment with the steward.",
    why: "A scorecard is only useful when the subject and audit container are explicit.",
    goodMaterial: "Good entry material names the subject, consequence mode if known, and why this pass is owed now.",
    guidanceDepth: "standard",
    packageSources: ["docs/worldbuilding-system/18_quality_assurance_tests.md"]
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
    key: "qa.regression-profile",
    flowKey: "qa",
    decisionPoint: "QA regression profile",
    decision: "Name strongest, weakest, dangerous, fragile, overloaded, and suspicious domains after scoring.",
    operativeRule: "The regression profile turns individual scores into world-level risk language.",
    why: "QA should tell the steward where future facts are most likely to break the world.",
    goodMaterial: "Good profile material names the weakest domain, most dangerous under-propagated fact, fragile mystery, overloaded constraint, and suspicious absent institutional response.",
    guidanceDepth: "full",
    packageSources: ["docs/worldbuilding-system/18_quality_assurance_tests.md"]
  }),
  card({
    key: "qa.pass-fail-floor",
    flowKey: "qa",
    decisionPoint: "QA pass/fail floor",
    decision: "Check whether load-bearing failures force repair routing before finalizing the pass.",
    operativeRule: "Low load-bearing scores and floor-triggering capability gaps require repair pressure, not optimistic close.",
    why: "The floor catches worlds that look scored but still fail stability under use.",
    goodMaterial: "Good floor evidence names the triggered condition, score pattern, and what repair or debt will handle it.",
    guidanceDepth: "full",
    packageSources: ["docs/worldbuilding-system/18_quality_assurance_tests.md"]
  }),
  card({
    key: "qa.repair-routing",
    flowKey: "qa",
    decisionPoint: "QA repair routing",
    decision: "Route weak tests into repair, canon debt, Admission proposals, or governed skips.",
    operativeRule: "QA identifies instability; repair and Admission own mutations and canon standing.",
    why: "The pass should create governed follow-up work without silently changing canon.",
    goodMaterial: "Good repair routing names the failed test, proposed repair text or debt, target flow, and advisory provenance if used.",
    guidanceDepth: "standard",
    packageSources: [
      "docs/worldbuilding-system/18_quality_assurance_tests.md",
      "docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md",
      "docs/worldbuilding-system/06_canon_fact_admission_protocol.md"
    ]
  }),
  card({
    key: "qa.finalize",
    flowKey: "qa",
    decisionPoint: "QA finalize",
    decision: "Finalize the pass only after scores, profile, floor checks, and repair routing are recorded.",
    operativeRule: "Finalizing QA preserves an audit trail; unresolved repair work remains visible as routed follow-up.",
    why: "A stable-world claim needs durable evidence, not just a completed screen.",
    goodMaterial: "Good finalize material names the pass report, band, routed repairs or debt, and any remaining limitations.",
    guidanceDepth: "standard",
    packageSources: [
      "docs/worldbuilding-system/18_quality_assurance_tests.md",
      "docs/worldbuilding-system/21_templates_index.md"
    ]
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
