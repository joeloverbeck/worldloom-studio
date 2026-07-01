# Causal Canon Worldbuilding System

Version `0.4` is a storage- and software-agnostic methodology for creating and maintaining fictional worlds whose canon facts propagate through the world instead of sitting as isolated lore. It does not assume Markdown, a database, a graph engine, a web app, an API, or an LLM-based workflow. A solo author, writing room, tabletop group, game team, or setting steward can use it with paper, notebooks, cards, documents, wikis, spreadsheets, index cards, wall charts, or any other medium.

The records in `templates/` and the sweeps in `checklists/` are human thinking instruments, not implementation instructions. They name the questions that must be answered; they do not prescribe a storage model.

Version `0.4` keeps the iteration-three file architecture because every original file remained load-bearing and already had a clear authority tier. The improvement is internal: sharper decision jurisdiction, stronger traceability from doctrine to instruments, better anti-over-simulation guidance, deeper diffusion and institution checks, stronger transmedia/adaptation boundaries, and more explicit regression tests.

## Core idea

A canon fact is not an entry in a lore pile. A canon fact is an intervention into a living system.

For every important fact, ask:

1. What must already be true for this fact to exist?
2. Who knows it, misunderstands it, hides it, denies it, or profits from confusion about it?
3. Who can use it, regulate it, counterfeit it, steal it, teach it, suppress it, ritualize it, or weaponize it?
4. What becomes cheaper, more expensive, sacred, illegal, routine, obsolete, taboo, prestigious, or dangerous?
5. What institutions, markets, taboos, rituals, professions, countermeasures, and myths form around it?
6. What ordinary-life residue shows it has existed for long enough?
7. What historical scars, laws, ruins, names, borders, jokes, songs, inherited inequalities, measurements, or habits prove it was not just decoration?
8. What contradictions, mysteries, and branch possibilities must be governed instead of ignored?

The most important rule remains:

> If this has been true, why is the world not already different?

The second rule is just as important:

> If explaining this would kill the world’s wonder, what boundaries preserve the mystery while still preserving consequence?

## Authority order

Use the package downward:

1. `01_core_theory.md` and `03_truth_layers_and_canon_governance.md` govern everything below them.
2. `02_world_model.md` and `04_domain_atlas.md` provide thinking primitives and propagation domains.
3. `05`–`17` are protocols: they turn doctrine into repeatable craft procedures.
4. `18`–`23` provide quality control, examples, AI-use boundaries, instrument index, vocabulary, and research rationale.
5. `checklists/` and `templates/` operationalize the protocols. If an instrument appears to contradict a protocol, the protocol wins and the instrument should be repaired.

The package distinguishes four concepts that must not be blurred:

- **canon status** — governance standing of a fact;
- **constraint tag** — a causal limit on a fact;
- **admission decision operation** — what the steward decides during fact admission;
- **repair operation** — what the steward does to fix contradiction, instability, or mystery damage.

## Recommended use

### For a new world

1. Start with `01_core_theory.md`.
2. Fill a lean `templates/world_kernel.md`.
3. Use `05_creation_protocol.md` to decompose every seed fact.
4. Run `checklists/frontloaded_seed_audit.md` so the initial premise receives the same scrutiny as later changes.
5. Admit seed facts with `06_canon_fact_admission_protocol.md`, `checklists/canon_fact_gate.md`, and `templates/canon_fact_card.md`.
6. Propagate major facts with `07_propagation_engine.md`, `04_domain_atlas.md`, `templates/propagation_report.md`, and `checklists/propagation_sweep.md`.
7. Add temporal, spatial, agent, institutional, uncertainty, branch, constraint, and aesthetic passes only where the fact applies.
8. Run the specialized sweeps named in the parent protocol.
9. Run `18_quality_assurance_tests.md` before treating the first version as stable.

### For an existing world

1. Read `01_core_theory.md`, `02_world_model.md`, and `03_truth_layers_and_canon_governance.md`.
2. Inventory the most dangerous facts: broad capabilities, metaphysical rules, strategic resources, laws, institutions, historical events, secrets, branch divergences, and contradictions.
3. Pick one high-pressure fact and run `06_canon_fact_admission_protocol.md` as if the fact had just been proposed.
4. Use `13_contradiction_retcon_and_mystery.md` for conflicts and mystery boundaries; use `14_uncertainty_belief_and_evidence.md` for claims, sources, confidence, and belief ecology.
5. Use `15_branching_versioning_and_collaboration.md` when more than one continuity or contributor is involved.
6. Use `18_quality_assurance_tests.md` to identify weak areas without trying to explain everything at once.

### For a single new idea

Use the quick path:

1. `templates/canon_change_proposal.md`
2. `checklists/canon_fact_gate.md`
3. `06_canon_fact_admission_protocol.md` at the appropriate severity level
4. `07_propagation_engine.md` and `checklists/propagation_sweep.md` if the fact creates more than local pressure
5. `18_quality_assurance_tests.md`

### For a contradiction, mystery, or retcon

1. Separate fact, claim, belief, mystery boundary, branch, and error with `03_truth_layers_and_canon_governance.md`.
2. Use `templates/contradiction_report.md` for the conflict or `templates/mystery_ledger_entry.md` for the protected unknown.
3. Apply repair operations from `13_contradiction_retcon_and_mystery.md`, not admission decision operations from `03`, unless a new proposal is being admitted.
4. Run `checklists/mystery_preservation.md` whenever a repair touches a protected unknown.

### For transmedia, game, or adaptation work

1. Identify invariant world anchors before changing expression, mechanics, viewpoint, budget, audience, or medium.
2. Use `16_narrative_game_and_transmedia_extraction.md` to separate world facts from story pressure, game affordance, and medium-specific rendering.
3. Use `15_branching_versioning_and_collaboration.md` when a medium changes continuity rather than presentation.
4. Use `17_aesthetic_coherence_and_semiosis.md` to preserve symbolic and sensory identity.

## Minimal discipline

Not every idea needs every protocol. Every important idea needs a visible reason for whichever protocols were skipped.

A tiny local detail may need only a fact card and a short propagation note. A new magic system, political institution, species, technology, religion, war, founding trauma, economic resource, or physical law needs admission, propagation, constraints, temporal/spatial passes, institutional/economic passes, contradiction checks, mystery checks, and QA.

## Package map

### Doctrine and primitives

- `01_core_theory.md` — philosophy, 12 operating laws, Causal Canon cycle, smell tests, and limits.
- `02_world_model.md` — conceptual primitives and relation verbs. These are thinking tools, not database tables.
- `03_truth_layers_and_canon_governance.md` — truth layers, canon statuses, constraint tags, admission decision operations, repair-operation boundary, and governance roles.
- `04_domain_atlas.md` — fourteen world domains facts ripple through.

### Core protocols

- `05_creation_protocol.md` — bootstrapping worlds without letting seed facts escape propagation.
- `06_canon_fact_admission_protocol.md` — fact gate, severity levels, and admission change package.
- `07_propagation_engine.md` — shock-cone propagation, mechanisms, branches, stopping rules, and propagation sweep.
- `08_constraint_composition.md` — how limits combine, collide, leak, and create new pressures.
- `09_temporal_and_timeline_protocol.md` — timelines, eras, latency, residues, retcons, and branch chronology.
- `10_spatial_and_geographic_propagation.md` — terrain, distance, settlement, infrastructure, regional variation, and spatial diffusion.
- `11_agent_character_psychology.md` — actors, identity, belief, incentives, memory, trauma, and bounded agency.
- `12_institutional_economic_and_suppression_protocol.md` — action arenas, rules-in-use, transaction costs, markets, black markets, suppression, and counter-institutions.
- `13_contradiction_retcon_and_mystery.md` — contradiction taxonomy, repair operations, retcon types, mystery ledger, and mystery preservation.
- `14_uncertainty_belief_and_evidence.md` — confidence, source reliability, evidence, credence, disputed knowledge, and belief ecology.
- `15_branching_versioning_and_collaboration.md` — branch canon, continuity diffs, human approval, disputes, merge decisions, retirement, and deprecation.

### Extraction, quality, workflow, reference

- `16_narrative_game_and_transmedia_extraction.md` — deriving story, game, and medium-specific pressure from world facts.
- `17_aesthetic_coherence_and_semiosis.md` — tone, genre, mood, symbolism, language, and aesthetic residue.
- `18_quality_assurance_tests.md` — scoring rubric, regression tests, and coherence-audit patterns.
- `19_worked_examples.md` — worked examples using the protocols.
- `20_ai_assisted_workflow.md` — AI as proposer, auditor, and challenger; never canon authority.
- `21_templates_index.md` — how all templates and checklists fit together.
- `22_glossary.md` — authoritative shared vocabulary.
- `23_research_notes_and_bibliography.md` — research roots and translation rules.
- `00_overhaul_notes.md` — iteration-four provenance, mapping, retention audit, coherence fixes, and research rationale.

## Operating stance

The system does not require realism, exhaustive simulation, every question answered, a map before a story, hard magic, software, or an LLM. It requires consequences.

Coherence is not maximal explanation. A world is strongest when known facts, false beliefs, secrets, mysteries, contradictions, limits, costs, latencies, path dependencies, black markets, counter-institutions, and aesthetic residues all have governed places.

When in doubt, keep the world small, pressure-test one fact, and let the next domain expand only when consequence forces it.

