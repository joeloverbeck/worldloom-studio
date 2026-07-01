# Causal Canon Worldbuilding System

A regimented system for creating and maintaining fictional worlds whose canon facts propagate through the world instead of sitting as isolated lore.

The system is intentionally storage-agnostic. It does not assume Markdown, a database, a graph engine, a web app, or an LLM-based workflow. It defines the conceptual machinery a human, a writing team, or a later software system could use.

## What this package is for

Use it when you want to:

- add a canon fact and immediately know what else must change;
- prevent "cool ideas" from becoming incoherent exceptions;
- build story worlds for fiction, games, or private exploration;
- preserve depth, mystery, myth, and contradiction without letting them become authorial sloppiness;
- make cultures, institutions, economies, technologies, ecologies, and histories respond to one another;
- produce worlds that feel lived-in rather than painted behind the plot.

## Core idea

A canon fact is not an entry in a wiki.

A canon fact is an intervention into a living system.

The system asks:

1. What must already be true for this fact to exist?
2. Who knows it?
3. Who can use it?
4. Who can stop it?
5. Who profits from it?
6. Who is harmed by it?
7. What does it make obsolete?
8. What institutions adapt to it?
9. What daily-life residues does it leave?
10. What historical scars prove it has existed for long enough?
11. What contradictions does it create?
12. What mysteries should remain protected?

## Recommended use

For a new world:

1. Fill out `templates/world_kernel.md`.
2. Add initial facts as separate `templates/canon_fact_card.md` entries.
3. Run `checklists/frontloaded_seed_audit.md` so seed facts propagate as deeply as later facts.
4. For each fact, run `06_canon_fact_admission_protocol.md`.
5. Build propagation reports with `templates/propagation_report.md`.
6. Maintain contradictions with `templates/contradiction_report.md`.
7. Protect mystery with `templates/mystery_ledger_entry.md`.

For an existing world:

1. Inventory major canon facts.
2. Recast abilities, technologies, magic, geography, and metaphysics as capabilities with access constraints.
3. Identify institutions that should have formed around each capability.
4. Audit places where the world behaves as though a fact does not exist.
5. Repair by constraining, localizing, pricing, monopolizing, ritualizing, historicizing, or rejecting the fact.

## Package map

- `01_core_theory.md`: the philosophy and operating laws of coherent worldbuilding.
- `02_world_model.md`: the conceptual model of facts, claims, entities, events, institutions, capabilities, constraints, and consequences.
- `03_truth_layers_and_canon_governance.md`: how to separate objective canon, disputed claims, myths, propaganda, errors, secrets, and mysteries.
- `04_domain_atlas.md`: the domains that world facts ripple through.
- `05_creation_protocol.md`: how to bootstrap a world without frontloading unpropagated facts.
- `06_canon_fact_admission_protocol.md`: the gate every new fact must pass.
- `07_propagation_engine.md`: the ripple-effect algorithm.
- `08_institutional_and_economic_ripple_protocol.md`: the high-priority causal machinery for power, money, labor, rules, scarcity, and adoption.
- `09_contradiction_retcon_and_mystery.md`: how to repair conflicts and preserve the numinous.
- `10_narrative_and_game_extraction.md`: how to derive stories and games from the world without breaking it.
- `11_quality_assurance_tests.md`: stress tests for coherence.
- `12_worked_examples.md`: examples including reprogrammed robots, legal ghost witnesses, alien visitation, and cheap teleportation.
- `13_ai_assisted_workflow.md`: how to use AI as an analyst and proposal generator without letting it canonize changes.
- `14_templates_index.md`: how the included templates fit together.
- `15_glossary.md`: shared terminology.
- `16_research_notes_and_bibliography.md`: research foundations and reading list.
- `templates/`: reusable Markdown templates.
- `checklists/`: operational checklists.

## The most important rule

Never ask only, "Is this cool?"

Ask, "If this has been true, why is the world not already different?"
