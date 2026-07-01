# Overhaul Notes — Causal Canon Worldbuilding System Version 0.6

Date: 2026-07-01

This document records the sixth-iteration replacement of `docs/worldbuilding-system/**`. It is part of the replacement package and supersedes the version-0.5 overhaul notes for package stewardship. The prior package's references to `224496657616c6f25c0c207df9862d7e1445a04e` are retained only as historical context in the old version; this pass uses the user-supplied target commit below.

## Provenance summary

```text
Requested repository: joeloverbeck/worldloom-studio
Target commit: 8d6f0a8de1bbe2da649386283ddd7475fe01649f
Freshness claim: user-supplied target commit only; not independently verified as latest main
Manifest role: path inventory only
Repository metadata used: no
Default-branch lookup used: no
Branch-name file fetch used: no
Target-repository code search used: no
Clone used: no
URL fetch method: full raw exact-commit URL fetches
Requested file count: 57
Successfully verified file count: 57
Fetched repository files: listed below
Fetch-provenance contamination observed: no
Foreign-repository references inside fetched file contents: permitted; not a provenance check
Connector/tool namespace trusted as evidence: no
External research lane: separate from repository evidence
```

The 57 fetched files are the 56 package files plus the repository root `README.md` for boundary awareness. The root `README.md` remains out of package scope and is not replaced.

## Exact URL acquisition ledger

- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/README.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/00_overhaul_notes.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/01_core_theory.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/02_world_model.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/03_truth_layers_and_canon_governance.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/04_domain_atlas.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/05_creation_protocol.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/06_canon_fact_admission_protocol.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/07_propagation_engine.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/08_constraint_composition.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/09_temporal_and_timeline_protocol.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/10_spatial_and_geographic_propagation.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/11_agent_character_psychology.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/12_institutional_economic_and_suppression_protocol.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/14_uncertainty_belief_and_evidence.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/15_branching_versioning_and_collaboration.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/16_narrative_game_and_transmedia_extraction.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/17_aesthetic_coherence_and_semiosis.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/18_quality_assurance_tests.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/19_worked_examples.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/20_ai_assisted_workflow.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/21_templates_index.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/22_glossary.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/23_research_notes_and_bibliography.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/README.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/checklists/aesthetic_coherence_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/checklists/agent_character_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/checklists/branching_collaboration_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/checklists/canon_fact_gate.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/checklists/constraint_composition_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/checklists/frontloaded_seed_audit.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/checklists/institutional_economic_suppression_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/checklists/mystery_preservation.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/checklists/propagation_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/checklists/spatial_geographic_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/checklists/temporal_timeline_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/checklists/uncertainty_evidence_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/manifest.json
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/templates/action_arena_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/templates/aesthetic_coherence_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/templates/agent_character_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/templates/canon_branch_diff.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/templates/canon_change_proposal.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/templates/canon_fact_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/templates/capability_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/templates/collaboration_decision_record.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/templates/constraint_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/templates/contradiction_report.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/templates/counter_institution_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/templates/institution_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/templates/mystery_ledger_entry.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/templates/propagation_report.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/templates/spatial_region_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/templates/temporal_timeline_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/templates/uncertainty_evidence_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/8d6f0a8de1bbe2da649386283ddd7475fe01649f/docs/worldbuilding-system/templates/world_kernel.md

## Structural decision

No files were added, removed, renamed, split, or merged. The package remains 56 files: package `README.md`, numbered documents `00`–`23`, `manifest.json`, 12 checklists, and 18 templates. This follows the high-bar in-place default: every file remained load-bearing, and the required work could be done more safely by strengthening doctrine, protocols, instruments, examples, and reference material in place.

## Version 0.6 change summary

Version 0.6 is a convergence and adversarial-hardening pass over version 0.5. It preserves the consequence-first constitution, the 12 operating laws, truth-layer order, status/tag/decision/repair/preservation-boundary separations, shock-cone propagation, calibrated QA anchors, mode-aware consequence doctrine, protected-effect vocabulary, and the institutional/economic/suppression hard edge.

The pass makes three load-bearing advances:

1. **Priority A — non-naturalistic muscle memory.** `01_core_theory.md` now gives non-naturalistic smell tests equal weight with institutional smell tests. `18_quality_assurance_tests.md` now adds a mode-balance calibration section, non-naturalistic benchmark anchors, and additional red flags. `19_worked_examples.md` retains the full fairy-tale/lyrical promise-birds example and adds compact-but-complete mythic, absurd-comic, dream-logic, and sacred/horror examples.
2. **Priority B — sacred-opacity hardening.** `13_contradiction_retcon_and_mystery.md` and `17_aesthetic_coherence_and_semiosis.md` now teach earned sacred opacity versus sacred-opacity cheat with paired adversarial examples. `checklists/mystery_preservation.md` and `templates/mystery_ledger_entry.md` now force an opacity accountability check at the stewardship point. `22_glossary.md` defines earned sacred opacity, sacred-opacity cheat, and opacity accountability test.
3. **Priority C — point-of-use micro-examples.** Protocols `05`–`17` now include short non-naturalistic micro-examples at the point of use, and selected instruments now include brief checks or prompts so mode-awareness is practiced during creation, admission, propagation, constraint composition, temporal/spatial/agent sweeps, mystery preservation, aesthetic coherence, and record-card completion.

## Old-to-new mapping

| Iteration-5 path | Fate | Version-0.6 path | Retention / change note |
|---|---|---|---|
| `docs/worldbuilding-system/00_overhaul_notes.md` | Kept; updated in place | `docs/worldbuilding-system/00_overhaul_notes.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/01_core_theory.md` | Kept; updated in place | `docs/worldbuilding-system/01_core_theory.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/02_world_model.md` | Kept; updated in place | `docs/worldbuilding-system/02_world_model.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/03_truth_layers_and_canon_governance.md` | Kept; updated in place | `docs/worldbuilding-system/03_truth_layers_and_canon_governance.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/04_domain_atlas.md` | Kept; updated in place | `docs/worldbuilding-system/04_domain_atlas.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/05_creation_protocol.md` | Kept; updated in place | `docs/worldbuilding-system/05_creation_protocol.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/06_canon_fact_admission_protocol.md` | Kept; updated in place | `docs/worldbuilding-system/06_canon_fact_admission_protocol.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/07_propagation_engine.md` | Kept; updated in place | `docs/worldbuilding-system/07_propagation_engine.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/08_constraint_composition.md` | Kept; updated in place | `docs/worldbuilding-system/08_constraint_composition.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/09_temporal_and_timeline_protocol.md` | Kept; updated in place | `docs/worldbuilding-system/09_temporal_and_timeline_protocol.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/10_spatial_and_geographic_propagation.md` | Kept; updated in place | `docs/worldbuilding-system/10_spatial_and_geographic_propagation.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/11_agent_character_psychology.md` | Kept; updated in place | `docs/worldbuilding-system/11_agent_character_psychology.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/12_institutional_economic_and_suppression_protocol.md` | Kept; updated in place | `docs/worldbuilding-system/12_institutional_economic_and_suppression_protocol.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md` | Kept; updated in place | `docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/14_uncertainty_belief_and_evidence.md` | Kept; updated in place | `docs/worldbuilding-system/14_uncertainty_belief_and_evidence.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/15_branching_versioning_and_collaboration.md` | Kept; updated in place | `docs/worldbuilding-system/15_branching_versioning_and_collaboration.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/16_narrative_game_and_transmedia_extraction.md` | Kept; updated in place | `docs/worldbuilding-system/16_narrative_game_and_transmedia_extraction.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/17_aesthetic_coherence_and_semiosis.md` | Kept; updated in place | `docs/worldbuilding-system/17_aesthetic_coherence_and_semiosis.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/18_quality_assurance_tests.md` | Kept; updated in place | `docs/worldbuilding-system/18_quality_assurance_tests.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/19_worked_examples.md` | Kept; updated in place | `docs/worldbuilding-system/19_worked_examples.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/20_ai_assisted_workflow.md` | Kept; updated in place | `docs/worldbuilding-system/20_ai_assisted_workflow.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/21_templates_index.md` | Kept; updated in place | `docs/worldbuilding-system/21_templates_index.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/22_glossary.md` | Kept; updated in place | `docs/worldbuilding-system/22_glossary.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/23_research_notes_and_bibliography.md` | Kept; updated in place | `docs/worldbuilding-system/23_research_notes_and_bibliography.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/README.md` | Kept; updated in place | `docs/worldbuilding-system/README.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/checklists/aesthetic_coherence_sweep.md` | Kept; updated in place | `docs/worldbuilding-system/checklists/aesthetic_coherence_sweep.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/checklists/agent_character_sweep.md` | Kept; updated in place | `docs/worldbuilding-system/checklists/agent_character_sweep.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/checklists/branching_collaboration_sweep.md` | Kept; updated in place | `docs/worldbuilding-system/checklists/branching_collaboration_sweep.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/checklists/canon_fact_gate.md` | Kept; updated in place | `docs/worldbuilding-system/checklists/canon_fact_gate.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/checklists/constraint_composition_sweep.md` | Kept; updated in place | `docs/worldbuilding-system/checklists/constraint_composition_sweep.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/checklists/frontloaded_seed_audit.md` | Kept; updated in place | `docs/worldbuilding-system/checklists/frontloaded_seed_audit.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/checklists/institutional_economic_suppression_sweep.md` | Kept; updated in place | `docs/worldbuilding-system/checklists/institutional_economic_suppression_sweep.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/checklists/mystery_preservation.md` | Kept; updated in place | `docs/worldbuilding-system/checklists/mystery_preservation.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/checklists/propagation_sweep.md` | Kept; updated in place | `docs/worldbuilding-system/checklists/propagation_sweep.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/checklists/spatial_geographic_sweep.md` | Kept; updated in place | `docs/worldbuilding-system/checklists/spatial_geographic_sweep.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/checklists/temporal_timeline_sweep.md` | Kept; updated in place | `docs/worldbuilding-system/checklists/temporal_timeline_sweep.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/checklists/uncertainty_evidence_sweep.md` | Kept; updated in place | `docs/worldbuilding-system/checklists/uncertainty_evidence_sweep.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/manifest.json` | Kept; updated in place | `docs/worldbuilding-system/manifest.json` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/templates/action_arena_card.md` | Kept; updated in place | `docs/worldbuilding-system/templates/action_arena_card.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/templates/aesthetic_coherence_card.md` | Kept; updated in place | `docs/worldbuilding-system/templates/aesthetic_coherence_card.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/templates/agent_character_card.md` | Kept; updated in place | `docs/worldbuilding-system/templates/agent_character_card.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/templates/canon_branch_diff.md` | Kept; updated in place | `docs/worldbuilding-system/templates/canon_branch_diff.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/templates/canon_change_proposal.md` | Kept; updated in place | `docs/worldbuilding-system/templates/canon_change_proposal.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/templates/canon_fact_card.md` | Kept; updated in place | `docs/worldbuilding-system/templates/canon_fact_card.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/templates/capability_card.md` | Kept; updated in place | `docs/worldbuilding-system/templates/capability_card.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/templates/collaboration_decision_record.md` | Kept; updated in place | `docs/worldbuilding-system/templates/collaboration_decision_record.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/templates/constraint_card.md` | Kept; updated in place | `docs/worldbuilding-system/templates/constraint_card.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/templates/contradiction_report.md` | Kept; updated in place | `docs/worldbuilding-system/templates/contradiction_report.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/templates/counter_institution_card.md` | Kept; updated in place | `docs/worldbuilding-system/templates/counter_institution_card.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/templates/institution_card.md` | Kept; updated in place | `docs/worldbuilding-system/templates/institution_card.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/templates/mystery_ledger_entry.md` | Kept; updated in place | `docs/worldbuilding-system/templates/mystery_ledger_entry.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/templates/propagation_report.md` | Kept; updated in place | `docs/worldbuilding-system/templates/propagation_report.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/templates/spatial_region_card.md` | Kept; updated in place | `docs/worldbuilding-system/templates/spatial_region_card.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/templates/temporal_timeline_card.md` | Kept; updated in place | `docs/worldbuilding-system/templates/temporal_timeline_card.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/templates/uncertainty_evidence_card.md` | Kept; updated in place | `docs/worldbuilding-system/templates/uncertainty_evidence_card.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |
| `docs/worldbuilding-system/templates/world_kernel.md` | Kept; updated in place | `docs/worldbuilding-system/templates/world_kernel.md` | Version marker bumped to 0.6; valid iteration-5 content preserved; targeted additions applied where load-bearing for Priority A/B/C or coherence. |

## Retention audit

- **Core doctrine retained.** The 12 operating laws, Causal Canon cycle, anti-over-simulation guardrails, mode-aware consequence doctrine, and “no free pass” rule remain in `01_core_theory.md` and are strengthened rather than replaced.
- **Primitives retained.** Conceptual primitives and relation verbs remain in `02_world_model.md`; Version 0.6 adds no schema coupling and does not convert thinking tools into implementation instructions.
- **Governance spine retained.** Truth layers, canon statuses, constraint tags, admission decision operations, repair operations, preservation boundaries, and governance roles remain separated in `03_truth_layers_and_canon_governance.md` and are not re-blurred.
- **Protocol coverage retained.** Creation, admission, propagation, constraints, temporal, spatial, agent, institutional/economic/suppression, contradiction/mystery, uncertainty, branching, extraction, aesthetic, QA, workflow, template index, glossary, and bibliography remain in their existing files.
- **Institutional hard edge retained.** `12_institutional_economic_and_suppression_protocol.md` remains rigorous. Version 0.6 explicitly says non-naturalistic modes change channels of consequence, not the obligation to follow power, scarcity, access, black markets, suppression, counter-institutions, and household impact where those pressures exist.
- **Iteration-5 protected-effect machinery retained.** Mystery, wonder/awe/sublimity, sacred opacity, horror/terror/dread, symbolic excess, preservation boundaries, and explanation-pressure operations remain. Version 0.6 adds a misuse guard rather than replacing the machinery.
- **Fairy-tale example retained full.** The existing “village where broken promises become birds” example remains in `19_worked_examples.md` as the full fairy-tale/lyrical case.
- **QA anchors retained and extended.** The calibrated weak/functional/strong anchors for the 30 core tests remain. Version 0.6 adds non-naturalistic benchmark anchors and red flags rather than discarding the existing calibration set.
- **Checklists/templates retained.** All checklists and templates remain wired to parent protocols and keep their completion-rule/red-flag discipline. Added prompts are human thinking aids, not database schemas.
- **Agnostic framing retained.** The methodology remains storage-, software-, API-, web-app-, and LLM-agnostic. AI workflow remains advisory and non-authoritative.

## Drift and coherence issues fixed

- The package's working provenance is corrected for this pass: target commit `8d6f0a8de1bbe2da649386283ddd7475fe01649f`, not the iteration-4 baseline `224496657616c6f25c0c207df9862d7e1445a04e` recorded in old version-0.5 notes.
- In-file version markers are bumped to 0.6 where they function as current-version markers. `23_research_notes_and_bibliography.md` now distinguishes retained version-0.5 research additions from version-0.6 research additions.
- `17_aesthetic_coherence_and_semiosis.md` corrects a duplicated heading and fixes the Windsor dread reference.
- `18_quality_assurance_tests.md` corrects duplicated local anchor text and adds balanced non-naturalistic calibration mass.
- Sacred opacity is no longer merely warned about; it now has an adversarial, steward-facing accountability test with legitimate and cheat examples.

## Priority resolution record

### Priority A — non-naturalistic breadth

Resolved materially. The package now tests doctrine against five non-naturalistic cases:

1. Fairy tale / lyrical — “The village where broken promises become birds” remains full.
2. Mythic / ritual — “The god who loses a hand every spring.”
3. Absurd comedy — “The republic where every law becomes a hat.”
4. Dream logic — “The station where dreams arrive before trains.”
5. Sacred / horror — “The chapel whose saint is a mouth in the wall.”

The smell tests in `01` and QA anchors/red flags in `18` now place mythic, fairy-tale, absurd-comic, dream-logic, sacred/horror, and lyrical/symbolic excess checks beside institutional checks rather than as a minority annotation. Propp's folktale morphology is used as the anchor for functional recurrence and motif logic; dream-work, absurdist recurrence, and protected-effect aesthetics extend the same “coherence without institutional plausibility” principle to the other modes.

### Priority B — sacred-opacity adversarial hardening

Resolved materially. The package introduces the vocabulary of **earned sacred opacity**, **sacred-opacity cheat**, and **opacity accountability test**. The distinction is simple and enforceable: legitimate opacity refuses explanation while accepting consequence, cost, recurrence, ritual boundary, contradiction repair, evidence handling, and craft critique; a cheat uses sacredness to dodge those obligations. This guard appears in doctrine-level mystery handling, aesthetic handling, the mystery-preservation checklist, and the mystery-ledger template.

### Priority C — micro-examples at point of use

Resolved materially. Brief micro-examples now appear across protocols `05`–`17` and in selected checklists/templates. They are deliberately short and operational: they show the same protocol step reading in mythic, dream, comic, sacred, horror, or lyrical modes without turning every protocol into an example gallery.

## Research rationale

Version 0.6 keeps external research in a separate lane from repository evidence. External sources shaped craft distinctions and example design, not claims about what the repository contained.

- Propp supports functional/motif/prohibition/helper/test logic for fairy-tale coherence without requiring realist sociology.[^v06-propp-00]
- Burke, Kant, Otto, Bennett, Freud, Carroll, and Windsor support distinctions among sublime terror, aesthetic judgment, numinous sacredness, enchantment, uncanniness, horror, and dread; the package explicitly states that scholarship supports distinctions but does not prevent misuse by itself.[^v06-burke-00][^v06-kant-00][^v06-otto-00][^v06-bennett-00][^v06-freud-00][^v06-carroll-00][^v06-windsor-00]
- Freud's dream-work vocabulary supports treating dream logic as condensation, displacement, representation, and false coherence rather than arbitrary discontinuity.[^v06-dreamwork-00]
- Esslin's theatre-of-the-absurd frame supports absurd-comic recurrence, trapped routine, and purposeless structures while the package translates that into auditable comic consequence.[^v06-esslin-00]

[^v06-propp-00]: Vladimir Propp, *Morphology of the Folktale: Second Edition*, University of Texas Press, 1968, https://www.degruyterbrill.com/document/doi/10.7560/783911/html.
[^v06-burke-00]: Royal Collection Trust, “Edmund Burke: A Philosophical Enquiry into the Origin of Our Ideas of the Sublime and Beautiful,” https://www.rct.uk/collection/themes/trails/canova-in-four-dimensions/edmund-burke-a-philosophical-enquiry-into-the-origin-of-our-ideas-of-the-sublime-and-beautiful.
[^v06-kant-00]: “Kant's Aesthetics and Teleology,” *Stanford Encyclopedia of Philosophy*, https://plato.stanford.edu/entries/kant-aesthetics/.
[^v06-otto-00]: Stuart Sarbacker, “Rudolf Otto and the Concept of the Numinous,” Oxford Research Encyclopedia of Religion, https://academic.oup.com/edited-volume/62249/chapter/551443194.
[^v06-bennett-00]: Jane Bennett, *The Enchantment of Modern Life*, Princeton University Press, https://press.princeton.edu/books/paperback/9780691088136/the-enchantment-of-modern-life.
[^v06-freud-00]: Freud Museum London, “The Uncanny,” https://www.freud.org.uk/education/resources/the-uncanny/.
[^v06-carroll-00]: Noël Carroll, *The Philosophy of Horror*, Routledge, https://www.routledge.com/The-Philosophy-of-Horror-or-Paradoxes-of-the-Heart/Carroll/p/book/9780415902168.
[^v06-windsor-00]: Mark Windsor, “Tales of Dread,” *Estetika* 56(1), 2019, https://philpapers.org/rec/WINTOD-3.
[^v06-dreamwork-00]: Freud Museum London, “The Dream-Work,” https://www.freud.org.uk/schools/resources/the-interpretation-of-dreams/the-dream-work/.
[^v06-esslin-00]: Martin Esslin, “The Theatre of the Absurd,” *The Tulane Drama Review* 4(4), 1960, https://www.jstor.org/stable/1124873.
