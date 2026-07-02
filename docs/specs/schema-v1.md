# Schema v1 Spec

This spec defines the first Worldloom Studio world-file schema and the generic walking-skeleton surfaces that exercise it. It is downstream of `docs/worldbuilding-system/` package 1.0, `docs/adr/0001-sqlite-file-per-world.md`, `docs/adr/0002-localhost-native-process.md`, `docs/adr/0003-branch-and-collaboration-schema-door.md`, and `docs/adr/0004-typescript-hono-react-better-sqlite.md`.

Guided flows are out of scope. The schema makes every package record type usable at the record level before flow-specific screens exist.

## Required World-File Shape

- One SQLite file is one world.
- `PRAGMA application_id` identifies a Worldloom world file.
- `PRAGMA user_version` is the schema version.
- Every connection enables foreign keys.
- Tables are STRICT where SQLite permits it.
- WAL is enabled for normal operation.
- Migrations are forward-only and create a pre-migration backup before changing an older file.
- Browser storage is never canonical.

## Record Types and Mutation Regimes

Record types are stored in a seeded `record_types` table and referenced by records. Migration seed data is owned by immutable per-migration snapshots; the shared catalog in `packages/shared` is the current source for API validation and UI options. When the current catalog changes, a new migration owns the seed delta instead of changing historical migrations.

### Card Regime

Card-regime records are living records updated in place. Every update that changes steward-authored wording writes the outgoing wording to `record_history`.

Card-regime record types:

- `world_kernel` (`templates/world_kernel.md`, `05_creation_protocol.md`)
- `canon_fact` (`templates/canon_fact_card.md`, `06_canon_fact_admission_protocol.md`)
- `constraint` (`templates/constraint_card.md`, `08_constraint_composition.md`)
- `capability` (`templates/capability_card.md`, `11_agent_character_psychology.md`)
- `spatial_region` (`templates/spatial_region_card.md`, `10_spatial_and_geographic_propagation.md`)
- `temporal_timeline` (`templates/temporal_timeline_card.md`, `09_temporal_and_timeline_protocol.md`)
- `institution` (`templates/institution_card.md`, `12_institutional_economic_and_suppression_protocol.md`)
- `counter_institution` (`templates/counter_institution_card.md`, `12_institutional_economic_and_suppression_protocol.md`)
- `agent_character` (`templates/agent_character_card.md`, `11_agent_character_psychology.md`)
- `action_arena` (`templates/action_arena_card.md`, `16_narrative_game_and_transmedia_extraction.md`)
- `aesthetic_coherence` (`templates/aesthetic_coherence_card.md`, `17_aesthetic_coherence_and_semiosis.md`)
- `mystery_ledger_entry` (`templates/mystery_ledger_entry.md`, `13_contradiction_retcon_and_mystery.md`)
- `admission_ledger_row` (`templates/admission_ledger.md`, `22_glossary.md`)
- `canon_debt` (`03_truth_layers_and_canon_governance.md`, `18_quality_assurance_tests.md`)
- `skip_record` (`21_templates_index.md`, `workflow-principles.md` W-4)
- `canon_branch_diff` (`templates/canon_branch_diff.md`, `15_branching_versioning_and_collaboration.md`)

The world kernel is a card-regime record: it is the living present-tense seed of the world, and outgoing wording must be preserved when superseded.

### Report Regime

Report-regime records are append-only audit trail records. The store rejects UPDATE and DELETE.

Report-regime record types:

- `propagation_report` (`templates/propagation_report.md`, `07_propagation_engine.md`)
- `contradiction_report` (`templates/contradiction_report.md`, `13_contradiction_retcon_and_mystery.md`)
- `uncertainty_evidence_card` (`templates/uncertainty_evidence_card.md`, `14_uncertainty_belief_and_evidence.md`)
- `canon_change_proposal` (`templates/canon_change_proposal.md`, `15_branching_versioning_and_collaboration.md`)
- `collaboration_decision_record` (`templates/collaboration_decision_record.md`, `15_branching_versioning_and_collaboration.md`)
- `gate_result` (`06_canon_fact_admission_protocol.md`)
- `pass_report` (`21_templates_index.md`)
- `qa_scorecard` (`18_quality_assurance_tests.md`)
- `seed_decomposition` (`05_creation_protocol.md`)
- `advisory_artifact` (`20_ai_assisted_workflow.md`, `canon-sovereignty.md`)

## ID Semantics

- Every record has an app-minted surrogate key.
- Content is never a key.
- IDs are scoped per world file.
- Every record also has a short human-facing ID generated from the record type namespace plus a per-type sequence, for example `FAC-1` or `LED-1`.
- Short-ID namespaces are not derived by punctuation variants, avoiding collisions such as `T1` versus `T-1`.
- Hierarchical display numbers may be rendered in exports, but are never load-bearing identifiers.

## Record:Fact Cardinality

One record can govern multiple facts, and one fact can be covered or bundled by a higher-order record. The normal schema shape is 1:N, not 1:1. `record_links` carries `covers` and `bundles` relationships for those cases instead of duplicating prose.

## Controlled Vocabulary Seeds

Vocabulary rows store:

- vocabulary name
- term, using package wording
- package source file
- whether steward extension is allowed
- whether a row is a pre-seeded `other` term

The first seed appendix records known package divergences without amending the package:

- `fact_type`: seed from `templates/canon_fact_card.md`'s own list.
- `admission_ledger_minor_item`: seed from `templates/admission_ledger.md` columns, not from the prose phrase "five items".
- `constraint_tag`: seed doctrine terms from `03_truth_layers_and_canon_governance.md`; seed glossary extras from `22_glossary.md` as pre-seeded `other` rows.
- `contradiction_type`: seed from `templates/contradiction_report.md`'s ten types.
- `repair_operation`: migration v4 corrects the seed to `13_contradiction_retcon_and_mystery.md` and `templates/contradiction_report.md`'s repair operations; `branch`, `supersede`, and `deprecate` are resulting status or branch decisions, not repair operations.
- `work_scale`: `templates/contradiction_report.md` names `foundational`, but Worldloom Studio keeps `work_scale` aligned to `06_canon_fact_admission_protocol.md`; the divergence is logged in `seed_divergences`.

Core controlled vocabularies in schema v1:

- `truth_layer` (`03_truth_layers_and_canon_governance.md`, `02_world_model.md`)
- `canon_status` (`03_truth_layers_and_canon_governance.md`)
- `constraint_tag` (`03_truth_layers_and_canon_governance.md`, `22_glossary.md`)
- `admission_decision_operation` (`03_truth_layers_and_canon_governance.md`, `checklists/canon_fact_gate.md`)
- `repair_operation` (`13_contradiction_retcon_and_mystery.md`)
- `contradiction_disposition` (`13_contradiction_retcon_and_mystery.md`)
- `preservation_operation` (`13_contradiction_retcon_and_mystery.md`, `checklists/mystery_preservation.md`)
- `retcon_type` (`13_contradiction_retcon_and_mystery.md`)
- `protected_effect_type` (`13_contradiction_retcon_and_mystery.md`, `templates/mystery_ledger_entry.md`)
- `consequence_mode` (`01_core_theory.md`, `05_creation_protocol.md`)
- `consequence_disposition` (`07_propagation_engine.md`)
- `preservation_boundary` (`13_contradiction_retcon_and_mystery.md`)
- `work_scale` (`06_canon_fact_admission_protocol.md`)
- `admission_level` (`06_canon_fact_admission_protocol.md`)
- `fact_type` (`templates/canon_fact_card.md`)
- `dependency_type` (`02_world_model.md`)
- `constraint_type` (`checklists/constraint_composition_sweep.md`)
- `contradiction_type` (`templates/contradiction_report.md`)
- `mystery_state` (`13_contradiction_retcon_and_mystery.md`)
- `branch_status` (`templates/canon_branch_diff.md`)
- `merge_expectation` (`templates/canon_branch_diff.md`)
- `workflow_role` (`templates/collaboration_decision_record.md`, `20_ai_assisted_workflow.md`)
- `provenance_actor_role` (`15_branching_versioning_and_collaboration.md`, `data-principles.md`)
- `advisory_disposition` (`20_ai_assisted_workflow.md`)
- `admission_ledger_minor_item` (`templates/admission_ledger.md`)

The app may store and validate these terms. It may not merge, infer, or auto-assign them.

### Vocabulary Value Appendix

Each seeded vocabulary row stores its package source beside the term. Values grouped on one line share the cited source unless a note says otherwise.

- `truth_layer`: Objective canon; author-secret canon; branch canon; mystery boundary; diegetic claim; public belief; local belief; elite belief; mythic truth; propaganda; lie; honest error; disputed claim (`templates/canon_fact_card.md`).
- `canon_status`: proposed; under review; accepted; accepted with constraints; localized; contested; quarantined; branch-only; superseded; deprecated; rejected (`templates/canon_fact_card.md`, `22_glossary.md`).
- `constraint_tag`: cost-bound; place-bound; time-bound; access-bound; knowledge-bound; institution-bound; branch-bound (`03_truth_layers_and_canon_governance.md`); ritual-bound; material-bound; population-bound (`22_glossary.md`, pre-seeded `other` rows).
- `admission_decision_operation`: accept; constrain; localize; historicize; reinterpret; institutionalize; price; branch; quarantine; supersede; deprecate; reject (`checklists/canon_fact_gate.md`, `templates/canon_fact_card.md`).
- `repair_operation`: clarify scope; add constraint; price the fact; localize; historicize; institutionalize; diffuse unevenly; reinterpret; split; retcon; quarantine; reject (`13_contradiction_retcon_and_mystery.md`, `templates/contradiction_report.md`).
- `contradiction_disposition`: not a contradiction; diegetic conflict; mystery-preserving conflict; repair required; branch required; deprecation required; rejection required (`13_contradiction_retcon_and_mystery.md`).
- `preservation_operation`: reveal; delay; forbid; consecrate; dread-preserve; excess-preserve; translate (`13_contradiction_retcon_and_mystery.md`, `checklists/mystery_preservation.md`).
- `retcon_type`: soft retcon; hard retcon; diegetic retcon; branch retcon; audience-facing retcon; back-office retcon (`13_contradiction_retcon_and_mystery.md`).
- `protected_effect_type`: governed mystery; wonder-awe-sublimity; sacred opacity; horror-terror-dread; symbolic excess (`13_contradiction_retcon_and_mystery.md`, `templates/mystery_ledger_entry.md`); hybrid (`templates/mystery_ledger_entry.md`, pre-seeded `other` row).
- `consequence_mode`: realist; mythic; weird; hard speculative; horror; satirical; mixed; other (`05_creation_protocol.md`).
- `consequence_disposition`: answered; intentionally scoped out; assigned as canon debt; protected as a mystery boundary (`07_propagation_engine.md`).
- `preservation_boundary`: fixed; author-secret; deliberately undecided; forbidden; evidence-governed; none (`13_contradiction_retcon_and_mystery.md`).
- `work_scale`: minor; moderate; major; severe; catastrophic (`06_canon_fact_admission_protocol.md`).
- `admission_level`: 0; 1; 2; 3; 4; 5 (`06_canon_fact_admission_protocol.md`).
- `fact_type`: world fact; constraint; capability; institution; character; spatial; temporal; aesthetic rule; other (`templates/canon_fact_card.md`).
- `dependency_type`: hard; soft; social; economic; epistemic; temporal; spatial; aesthetic (`02_world_model.md`).
- `constraint_type`: access; cost; location; time; population; material; legal; ritual; knowledge; social; biological; ecological; psychological; aesthetic; branch (`checklists/constraint_composition_sweep.md`).
- `contradiction_type`: timeline; spatial; causal; capacity; institutional; psychological; economic; epistemic; semantic; branch (`templates/contradiction_report.md`).
- `mystery_state`: fixed; author-secret; deliberately undecided; forbidden; evidence-governed (`13_contradiction_retcon_and_mystery.md`).
- `branch_status`: active; retired; merged; quarantined (`templates/canon_branch_diff.md`).
- `merge_expectation`: never; possible; planned; required (`templates/canon_branch_diff.md`).
- `workflow_role`: steward; contributor; reviewer; approver; implementer; observer; advisor; maintainer (`templates/collaboration_decision_record.md`, `20_ai_assisted_workflow.md`).
- `provenance_actor_role`: steward (`data-principles.md`).
- `advisory_disposition`: selected; deleted; challenged; ignored; standing ruling (`20_ai_assisted_workflow.md`).
- `admission_ledger_minor_item`: fact; truth layer; status; dependencies; canon debt (`templates/admission_ledger.md`).

## Typed Links

`record_links` stores directed typed links with foreign keys on both ends. Link types are seeded from package relationship language:

- `depends_on` (`02_world_model.md`)
- `blocks` (`02_world_model.md`)
- `soft_depends_on` (`02_world_model.md`)
- `social_depends_on` (`02_world_model.md`)
- `economic_depends_on` (`02_world_model.md`)
- `epistemic_depends_on` (`02_world_model.md`)
- `temporal_depends_on` (`02_world_model.md`)
- `spatial_depends_on` (`02_world_model.md`)
- `aesthetic_depends_on` (`02_world_model.md`)
- `constrains` (`templates/constraint_card.md`)
- `opposes` (`templates/counter_institution_card.md`)
- `digest_of` (`07_propagation_engine.md`, `data-principles.md`)
- `retired_by` (`templates/canon_fact_card.md`, `data-principles.md`)
- `supersedes` (`03_truth_layers_and_canon_governance.md`)
- `promoted_to` (`templates/admission_ledger.md`, `data-principles.md`)
- `covers` (`data-principles.md`)
- `bundles` (`data-principles.md`)
- `derived_from` (`canon-sovereignty.md`, `data-principles.md`)
- `cites_advisory_artifact` (`canon-sovereignty.md`)
- `tombstones` (`data-principles.md`)
- `branches_from` (`15_branching_versioning_and_collaboration.md`)
- `merge_candidate_for` (`15_branching_versioning_and_collaboration.md`)
- `preserves_boundary_for` (`13_contradiction_retcon_and_mystery.md`)
- `requires_follow_up` (`checklists/branching_collaboration_sweep.md`)

## Walking Skeleton Acceptance

The first implementation slice must provide:

- workspace scaffold for shared, server, and web packages;
- world create/open at steward-chosen paths;
- migration forward on open with pre-migration backup;
- integrity and wrong-file checks on open;
- an app-level recently opened worlds registry;
- generic record creation and editing for every record type;
- vocabulary listing from seeded tables;
- typed-link creation and traversal;
- full-text search where titles outrank body prose;
- on-demand snapshot;
- direct SQL enforcement of report append-only behavior;
- direct SQL history writes for card-regime updates;
- no canonical browser storage.

## Principles

Touches `charter.md` (P-3, P-4, T-8), `canon-sovereignty.md` (P-2, T-5), `domain-fidelity.md` (P-1, T-2), `workflow-principles.md` (P-5, W-2, W-3, W-4, W-7), `data-principles.md` (P-6, W-5, W-6, T-1, T-3, T-4, T-6), and ADRs 0001-0004. This spec affirms non-contradiction with all of them.
