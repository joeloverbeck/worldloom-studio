# Causal Canon Worldbuilding System

A storage- and software-agnostic methodology for creating and maintaining fictional worlds whose canon facts propagate through the world instead of sitting as isolated lore.

The package does not assume Markdown, a database, a graph engine, a web app, an API, or an LLM-based workflow. It defines a disciplined craft process a solo author, a writing room, a tabletop group, or a setting team can use with paper, notebooks, cards, documents, wikis, or any other storage medium. The records in `templates/` are human thinking instruments, not implementation instructions.

## Core idea

A canon fact is not an entry in a lore pile. A canon fact is an intervention into a living system.

For every important fact, ask:

1. What must already be true for this fact to exist?
2. Who knows it, misunderstands it, hides it, or denies it?
3. Who can use it, regulate it, counterfeit it, steal it, teach it, suppress it, or weaponize it?
4. What becomes cheaper, more expensive, sacred, illegal, routine, obsolete, or dangerous?
5. What institutions, markets, taboos, rituals, professions, countermeasures, and myths form around it?
6. What ordinary-life residue shows it has existed for long enough?
7. What historical scars, laws, ruins, names, borders, jokes, songs, or inherited inequalities prove it was not just decoration?
8. What contradictions, mysteries, and branch possibilities must be governed instead of ignored?

The most important rule remains:

> If this has been true, why is the world not already different?

## Recommended use

### For a new world

1. Start with `01_core_theory.md`.
2. Fill a lean `templates/world_kernel.md`.
3. Use `05_creation_protocol.md` to decompose every seed fact.
4. Run `checklists/frontloaded_seed_audit.md` so the initial premise receives the same scrutiny as later changes.
5. Admit seed facts with `06_canon_fact_admission_protocol.md` and `templates/canon_fact_card.md`.
6. Propagate major facts with `07_propagation_engine.md`, `04_domain_atlas.md`, and `templates/propagation_report.md`.
7. Add temporal, spatial, agent, institutional, uncertainty, branch, and aesthetic passes only where the fact applies.
8. Run `18_quality_assurance_tests.md` before treating the first version as stable.

### For an existing world

1. Read `01_core_theory.md`, `02_world_model.md`, and `03_truth_layers_and_canon_governance.md`.
2. Inventory the most dangerous facts: broad capabilities, metaphysical rules, strategic resources, laws, institutions, historical events, secrets, and contradictions.
3. Pick one high-pressure fact and run `06_canon_fact_admission_protocol.md` as if the fact had just been proposed.
4. Use `13_contradiction_retcon_and_mystery.md` for conflicts and `15_branching_versioning_and_collaboration.md` when more than one continuity or contributor is involved.
5. Use `18_quality_assurance_tests.md` to identify weak areas without trying to explain everything at once.

### For a single new idea

Use the quick path:

1. `templates/canon_change_proposal.md`
2. `checklists/canon_fact_gate.md`
3. `06_canon_fact_admission_protocol.md` at the appropriate severity level
4. `07_propagation_engine.md`
5. `18_quality_assurance_tests.md`

## Package map

### Doctrine and primitives

- `01_core_theory.md` — philosophy, operating laws, Causal Canon cycle, smell tests, and limits.
- `02_world_model.md` — conceptual primitives and relation verbs. These are thinking tools, not database tables.
- `03_truth_layers_and_canon_governance.md` — truth layers, canon statuses, constraint tags, decision operations, governance roles.
- `04_domain_atlas.md` — fourteen world domains facts ripple through.

### Core protocols

- `05_creation_protocol.md` — bootstrapping worlds without letting seed facts escape propagation.
- `06_canon_fact_admission_protocol.md` — fact gate and severity levels.
- `07_propagation_engine.md` — shock-cone propagation, mechanisms, branches, stopping rules.
- `08_constraint_composition.md` — how limits combine, collide, leak, and create new pressures.
- `09_temporal_and_timeline_protocol.md` — timelines, eras, latency, residues, retcons, branch chronology.
- `10_spatial_and_geographic_propagation.md` — terrain, distance, settlement, infrastructure, regional variation, spatial diffusion.
- `11_agent_character_psychology.md` — individual actors, identity, belief, incentives, memory, trauma, and bounded agency.
- `12_institutional_economic_and_suppression_protocol.md` — action arenas, rules-in-use, transaction costs, markets, black markets, suppression, counter-institutions.
- `13_contradiction_retcon_and_mystery.md` — contradiction taxonomy, repair operations, retcon types, mystery ledger.
- `14_uncertainty_belief_and_evidence.md` — confidence, source reliability, evidence, credence, disputed knowledge.
- `15_branching_versioning_and_collaboration.md` — branch canon, continuity diffs, human approval, disputes, merge decisions.

### Extraction, quality, workflow, reference

- `16_narrative_game_and_transmedia_extraction.md` — deriving story, game, and medium-specific pressure from world facts.
- `17_aesthetic_coherence_and_semiosis.md` — tone, genre, mood, symbolism, language, and aesthetic residue.
- `18_quality_assurance_tests.md` — scoring rubric and expanded QA tests.
- `19_worked_examples.md` — expanded worked examples using the protocols.
- `20_ai_assisted_workflow.md` — AI as proposer, auditor, and challenger; never canon authority.
- `21_templates_index.md` — how all templates fit together.
- `22_glossary.md` — shared vocabulary.
- `23_research_notes_and_bibliography.md` — research roots and translation rules.
- `00_overhaul_notes.md` — changelog, old-to-new mapping, provenance summary, and retention audit.

## Operating stance

The system does not require realism, exhaustive simulation, every question answered, a map before a story, hard magic, software, or an LLM. It requires consequences.

Coherence is not maximal explanation. A world is strongest when known facts, false beliefs, secrets, mysteries, contradictions, and limits all have governed places.
