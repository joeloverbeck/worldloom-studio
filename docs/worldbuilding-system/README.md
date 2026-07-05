# Causal Canon Worldbuilding System

Version `1.1` is a storage- and software-agnostic methodology for creating and maintaining fictional worlds whose canon facts propagate through the world instead of sitting as isolated lore. It does not assume Markdown, a database, a graph engine, a web app, an API, an LLM workflow, or any particular publishing medium. A solo author, writing room, tabletop group, game team, or setting steward can use it with paper, notebooks, cards, documents, wikis, spreadsheets, index cards, wall charts, conversation, or any other medium.

The records in `templates/` and the sweeps in `checklists/` are human thinking instruments, not implementation instructions. They name the questions that must be answered; they do not prescribe a storage model.

Version `1.1` keeps the numbered-spine architecture at 58 files. All substance delivered by earlier versions — equal-weight non-naturalistic consequence tests, worked cases for myth, absurd comedy, dream logic, and sacred/horror, the adversarial earned-sacred-opacity guard, point-of-use micro-examples, calibrated QA anchors, the record-lifecycle doctrine, the institutional hard edge, the one-page operating card, and the batch admission ledger — is retained. Version `1.1`'s single change is the two assistance modes in `20_ai_assisted_workflow.md`: proposal mode joins pressure mode as a first-class, steward-curated use of AI (see `00_overhaul_notes.md`).

## What version 1.1 claims

The version number is a claim about tested surfaces, not about total coverage. Two independent end-to-end field builds of small worlds — each run cold, following this README's new-world path literally — have exercised and validated:

- the core pipeline twice over: kernel → seed decomposition → seed audit → severity-scaled admission → propagation → contradiction repair → QA;
- constraint composition (`08`), the temporal pass (`09`), and the institutional/economic/suppression pass (`12`), each generative rather than merely defensive in field use;
- the record lifecycle under a supersession chain two repairs deep;
- batch admission through the ledger, including a row promotion to a full card;
- the QA machinery — per-test scoring, the n/a convention, the red-team prompts — with a live firing of the mystery-preservation checklist.

Honestly untested remain: the spatial (`10`), agent/psychology (`11`), uncertainty/evidence (`14`), extraction (`16`), and aesthetic (`17`) passes in anger; branching/versioning/collaboration (`15`) and every multi-steward mechanism; the worked examples (`19`) and AI workflow (`20`) under a genuinely naive steward; the proposal mode of `20`, adopted by steward decision in version `1.1` and not yet run in a field trial; and the aesthetic-promise disposal in a world whose primary consequence mode is lyrical or sacred. Use those surfaces with the scrutiny owed to an untested instrument, and expect them to generate the next revision's evidence.

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

The package distinguishes six concepts that must not be blurred:

- **canon status** — governance standing of a fact;
- **constraint tag** — a causal limit on a fact;
- **admission decision operation** — what the steward decides during fact admission;
- **repair operation** — what the steward does to fix contradiction, instability, or mystery damage;
- **consequence mode** — the form of consequence that proves a fact matters in this world;
- **preservation boundary** — what a reveal, repair, or adaptation must not destroy.

## Recommended use

### For a new world

1. Start with `01_core_theory.md`, keeping `operating_card.md` at hand as a quick reference for the whole path.
2. Fill a lean `templates/world_kernel.md`.
3. Use `05_creation_protocol.md` to decompose every seed fact.
4. Read `03_truth_layers_and_canon_governance.md` before auditing anything: the seed audit and every admission instrument depend on its truth layers, canon statuses, constraint tags, and operation vocabularies.
5. Run `checklists/frontloaded_seed_audit.md` so the initial premise receives the same scrutiny as later changes.
6. Admit seed facts with `06_canon_fact_admission_protocol.md` and `checklists/canon_fact_gate.md`: full record cards (`templates/canon_fact_card.md`, `templates/capability_card.md`) for major facts, `templates/admission_ledger.md` rows for minor ones. Consult `21_templates_index.md` here for the lightest instrument that catches the danger and for when `templates/canon_change_proposal.md` is required.
7. Propagate major facts with `07_propagation_engine.md`, `04_domain_atlas.md`, `templates/propagation_report.md`, and `checklists/propagation_sweep.md`.
8. Add temporal, spatial, agent, institutional, uncertainty, branch, constraint, and aesthetic passes only where the fact applies, running the specialized sweeps named in each parent protocol.
9. Run `18_quality_assurance_tests.md` before treating the first version as stable.

When stuck on how the instruments compose in practice, `19_worked_examples.md` demonstrates full chains, including a records-lifecycle walkthrough that shows which instrument gets filled at each step. `02_world_model.md` is enrichment rather than a required stop on this path: read it when you want sharper thinking primitives or when a fact resists classification.

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

- `01_core_theory.md` — philosophy, 12 operating laws, Causal Canon cycle, mode-aware smell tests, and limits.
- `02_world_model.md` — conceptual primitives and relation verbs. These are thinking tools, not database tables. Enrichment for any path: required reading only when the primitives vocabulary is needed.
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
- `13_contradiction_retcon_and_mystery.md` — contradiction taxonomy, repair operations, retcon types, mystery governance, and preservation of wonder, sacred opacity, horror, and symbolic excess.
- `14_uncertainty_belief_and_evidence.md` — confidence, source reliability, evidence, credence, disputed knowledge, and belief ecology.
- `15_branching_versioning_and_collaboration.md` — branch canon, continuity diffs, human approval, disputes, merge decisions, retirement, and deprecation.

### Extraction, quality, workflow, reference

- `16_narrative_game_and_transmedia_extraction.md` — deriving story, game, and medium-specific pressure from world facts.
- `17_aesthetic_coherence_and_semiosis.md` — tone, genre, mood, symbolism, language, semiotic propagation, wonder, sacred opacity, horror, and aesthetic residue.
- `18_quality_assurance_tests.md` — scoring rubric, calibrated exemplar anchors, regression tests, and coherence-audit patterns.
- `19_worked_examples.md` — worked examples using the protocols, including a records-lifecycle walkthrough of the full instrument chain.
- `20_ai_assisted_workflow.md` — AI as proposer, auditor, and challenger; never canon authority.
- `21_templates_index.md` — how all templates and checklists fit together.
- `22_glossary.md` — authoritative shared vocabulary.
- `23_research_notes_and_bibliography.md` — research roots and translation rules.
- `operating_card.md` — one-page quick reference: the new-world path with its real dependencies, the label-separation table, the severity map, and the minimal instrument paths. Derived from `README`, `03`, `06`, and `21`; those files govern on any conflict.
- `00_overhaul_notes.md` — current-iteration provenance, evidence base, finding dispositions, fate mapping, retention audit, the coverage statement of record, and research rationale. The single changelog: iteration history lives here, not in the doctrine and protocol files.

## Operating stance

The system does not require realism, institutional plausibility in every mode, exhaustive simulation, every question answered, a map before a story, hard magic, software, or an LLM. It requires consequences appropriate to the world’s declared mode: material, institutional, ritual, symbolic, mythic, comic, sacred, horrific, dreamlike, or some governed hybrid.

Coherence is not maximal explanation. A world is strongest when known facts, false beliefs, secrets, mysteries, contradictions, limits, costs, latencies, path dependencies, black markets, counter-institutions, and aesthetic residues all have governed places.

When in doubt, keep the world small, pressure-test one fact, and let the next domain expand only when consequence forces it.
