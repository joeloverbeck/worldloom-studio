# Overhaul Notes — Causal Canon Worldbuilding System Version 0.7

Date: 2026-07-02

This document records the seventh-iteration overhaul of `docs/worldbuilding-system/**`. It supersedes the version-0.6 overhaul notes for package stewardship. It is the package's single changelog: iteration history lives here, not inside the doctrine, protocol, or instrument files.

## Provenance

Unlike iterations 1–6, which were performed by ChatGPT-Pro deep-research sessions working from raw-URL fetches of a pinned commit, iteration 7 was performed by a **Claude Code session running the Fable model with direct read/write access to the repository working tree**.

```text
Executor: Claude Code (model: Fable / claude-fable-5)
Repository: joeloverbeck/worldloom-studio (local working tree)
HEAD at start of pass: 2b3e38a1ff6be1c223f336bd4ecf81950066748f
  ("Sixth iteration of worldbuilding system.")
Baseline divergence: none — HEAD matched the brief's pinned baseline exactly
Acquisition method: direct file reads of the working tree; all 56 package
  files plus the repository root README.md (boundary awareness only) were
  read in full before any file was changed
URL fetching: none
External research lane: kept separate from repository evidence; no new
  research-shaped changes were made this pass (see Research rationale)
Edits: applied directly to the working tree; nothing committed
```

The old fetch-shaped provenance apparatus (URL acquisition ledger, fetch-contamination checklist, `source_commit` of a previous baseline) does not apply to a local session and is retired. The prior notes' target commit `8d6f0a8de1bbe2da649386283ddd7475fe01649f` is retained here only as historical context: it was the baseline *iteration 6* worked from, not this pass's baseline.

**A note on the lineage.** Iteration 6 was commissioned to deliver a standalone "seventh-iteration outlook" report naming the residues this pass should target. That report was never committed to the repository and is presumed lost. This pass's priorities were therefore self-derived from an independent full read of the version-0.6 package. The corresponding iteration-7 outlook is committed as a durable file (`reports/eighth-iteration-outlook.md`) precisely so the same loss does not repeat.

## Diagnosis

A full read of all 56 files produced this prioritized weakness list. Analysis preceded editing; every change below traces to one of these findings.

1. **Sedimentary version-stratification (highest priority).** Four successive convergence passes had each deposited their additions as version-tagged strata: "Version 0.6 reinforcement: …", "Version 0.6 micro-examples: …", "Version 0.6 completion rule", "Version 0.6 traceability note", and in-text markers like "Version 0.6 adds…" appeared in nearly every file. Documents were partly organized by *when content was added* rather than by *what it teaches*. Concrete damage: `01` carried two near-duplicate "institutional rigor is not downgraded" guards and two overlapping mode-smell tables in separate strata; `08` had two "Constraint residues" sections; `18` had two overlapping mode-scoring notes, placed *before* the core tests they calibrate, with the non-naturalistic anchors far from the calibrated exemplar anchors they parallel; the glossary was three alphabetical strata stacked (base + 0.5 appendix + 0.6 appendix); `12` said "Iteration 4 makes explicit…" inside timeless doctrine under a heading claiming 0.6. Left alone, every future iteration would deepen the sediment.
2. **Tier and vocabulary inconsistencies.** (a) `03`'s operation-context matrix gave mystery governance an ad hoc operation list ("preserve, prohibit use…") that did not match the precise preservation operations `13` defines (reveal, delay, forbid, consecrate, dread-preserve, excess-preserve, translate). (b) The package `README.md` said the package "distinguishes four concepts", while doctrine, glossary, and QA test 30 actually enforce six/seven-way separation (adding consequence mode and preservation boundary, and splitting admission from repair operations). (c) The glossary's "Domain" entry enumerated a fourteen-item list that matched neither `04_domain_atlas.md`'s fourteen domains nor `16`'s extraction lens — three different "fourteens" coexisted. (d) `06` carried two severity vocabularies (admission Levels 0–5 and the minor→catastrophic work scale) that other files (`07`, `09`, templates) reference without any stated mapping.
3. **Editing scars.** `14`'s "What uncertainty is for" heading had been severed from its content (the "Use uncertainty to:" list sat stranded inside the mystery-governance boundary section); `19`'s introduction was duplicated across an editing seam; `templates/uncertainty_evidence_card.md` had a guidance sentence spliced before the field's own prompt list; `23` cited "the standalone seventh-iteration outlook" as if it existed in the package (it was never committed); `05`'s mode-declaration discipline sat under Phase 10 although it governs Phase 1, and Phase 1's kernel list predated the consequence-mode vocabulary.
4. **Stale stewardship records.** `00_overhaul_notes.md` and `manifest.json` carried remote-fetch provenance and the previous baseline's commit, wrong in format and content for a local pass.

No deeper problem was found with the package's substance: the 12 operating laws, truth-layer order, governance separations, shock-cone propagation, mode-aware consequence doctrine, protected-effect machinery, institutional hard edge, QA calibration, worked examples, and instrument wiring all held up under a hostile read. Iteration 7 is therefore a coherence, consistency, and stewardship pass, not a doctrine change.

## Structural decision

No files were added, removed, renamed, split, or merged. The package remains 56 files: package `README.md`, numbered documents `00`–`23`, `manifest.json`, 12 checklists, and 18 templates. Every file remained load-bearing; the diagnosed problems were all repairable in place, so the high-bar restructure threshold was not met.

The one package-wide structural change is **de-stratification**: all version-tagged section headings were retitled by content (e.g. "Version 0.6 reinforcement: constraint budgets" → "Constraint budgets"; "Version 0.6 completion rule" → "Completion rule"; "Version 0.6 traceability note" → "Traceability note"), changelog-speak in body text was made timeless ("The system now treats…" → "The system treats…"), and the only remaining current-version markers are the package `README.md`, `manifest.json`, and this file. `23_research_notes_and_bibliography.md` keeps its per-iteration research-addition sections because there the history *is* the content; they are retitled to say "iteration" honestly rather than posing as current-version markers.

## Version 0.7 change summary

1. **De-stratification (all tiers).** Version-tagged headings retitled by content across the numbered documents, all 12 checklists, and all 18 templates; in-text changelog-speak removed; footnote anchors left untouched.
2. **Duplicate-guidance merges.** `01`: the two "institutional rigor" guards merged into one subsection holding both paragraphs; the equal-weight non-naturalistic material now reads as one continuous smell-test region. `08`: the stray second "Constraint residues" subsection merged into the main section (its unique "authorial duct tape" warning and residue list preserved). `18`: the two mode-scoring notes merged into one "Mode-aware scoring calibration" section before the core tests; the non-naturalistic benchmark anchors and scoring examples moved to sit directly after the calibrated exemplar anchors they parallel; "Additional Version 0.6 non-naturalistic red flags" renamed and kept beside the main red-flag list. `19`: duplicated introduction merged.
3. **Tier-consistency repairs.** `03`: the label-separation table extended from four rows to seven — splitting admission decision operations from repair operations and adding consequence mode and preservation boundary — matching what the glossary and QA test 30 already enforce; the mystery-governance row of the operation-context matrix now names `13`'s preservation operations instead of an ad hoc list (deliberate higher-tier amendment, argued below); a cross-reference added distinguishing the seven judgment perspectives of the governance board from the eight collaboration workflow roles in `15`. `README.md`: "four concepts" corrected to six. `22`: "Domain" entry corrected to enumerate `04`'s actual fourteen domains. `16`: its conflict-derivation list explicitly marked as a dramatic-pressure lens deferring to `04`'s atlas. `06`: the two severity vocabularies explicitly mapped (Levels 0–5 ↔ minor→catastrophic work scale) with a note on which instruments use which.
4. **Editing-scar repairs.** `14`: "What uncertainty is for" reunited with its content, boundary sections reordered after it. `05`: consequence-mode declaration added to the Phase 1 kernel list and the mode-declaration discipline moved from Phase 10 to Phase 1 (text unchanged apart from the "During creation" framing). `templates/uncertainty_evidence_card.md`: prompt list restored before the sacred-opacity guard sentence. `23`: the reference to the never-committed seventh-iteration outlook corrected to state the loss; an iteration-7 research note appended. `12`: "Iteration 4 makes explicit…" made timeless.
5. **Glossary unification.** `22` re-alphabetized into a single sequence (all 69 prior entries preserved verbatim except the corrected "Domain" entry) and two umbrella entries added that the package used without defining: **Protected effect** (also naming "non-instrumental effect") and **Mode-equivalent consequence**.
6. **Stewardship records.** This file and `manifest.json` rewritten with local-session provenance, version 0.7, iteration 7.

### Deliberate higher-tier amendments

Per doctrine, a lower-tier change may not contradict a higher tier silently; the following higher-tier texts were amended deliberately:

- **`03` operation-context matrix, mystery-governance row.** The old row's operation list ("define boundary, preserve, delay, reveal, prohibit use, reclassify claim, quarantine if unsafe") predated the preservation operations `13` introduced in iterations 5–6 and no longer matched them. The row now defers to `13`'s vocabulary (reveal, delay, forbid, consecrate, dread-preserve, excess-preserve, translate) while keeping "define boundary", "reclassify claim", and "quarantine if unsafe". This is an upward harmonization — the governing tier adopts the precise vocabulary its subordinate protocol already operates with — not a doctrine change: "preserve" was a rough name for consecrate/dread-preserve/excess-preserve, and "prohibit use" for forbid.
- **`03` label-separation table and `README.md` "four concepts".** Extended to name all six separations (status, tag, admission decision, repair operation, consequence mode, preservation boundary). This states explicitly what glossary entries and QA test 30 already required; no meaning changed.
- **`22` "Domain" entry.** Previously enumerated a list matching neither `04` nor `16`. Corrected to `04`'s fourteen domains, which are the authoritative propagation domains. This is a factual repair of glossary drift, not a redefinition.

## Fate mapping

Every version-0.6 file was kept and updated in place; none was added, removed, renamed, split, or merged. "Retitle only" means the only changes were de-stratified section headings (and, where present, removal of in-text changelog-speak); all body content is byte-identical otherwise.

| Version-0.6 path (all retained at same path) | Change in 0.7 |
|---|---|
| `00_overhaul_notes.md` | Rewritten as the iteration-7 stewardship record with local-session provenance. |
| `01_core_theory.md` | Retitles; duplicate institutional-rigor guards merged into one subsection (both paragraphs kept); changelog-speak removed. |
| `02_world_model.md` | Retitles; "Version 0.6 adds these…" made timeless. |
| `03_truth_layers_and_canon_governance.md` | Label-separation table extended to seven rows; mystery-governance operations aligned with `13`; board-vs-workflow-roles cross-reference added; retitles. |
| `04_domain_atlas.md` | Retitle only ("Domain triage"). |
| `05_creation_protocol.md` | Consequence mode added to Phase 1 kernel list; mode-declaration discipline moved from Phase 10 to Phase 1; retitles. |
| `06_canon_fact_admission_protocol.md` | Severity-vocabulary mapping added; cross-reference to `18`'s renamed scoring section updated; retitles. |
| `07_propagation_engine.md` | Retitle only. |
| `08_constraint_composition.md` | Duplicate "Constraint residues" merged (all content preserved in main section); retitles. |
| `09_temporal_and_timeline_protocol.md` | Retitle only. |
| `10_spatial_and_geographic_propagation.md` | Retitle only. |
| `11_agent_character_psychology.md` | Retitle only. |
| `12_institutional_economic_and_suppression_protocol.md` | "Iteration 4 makes explicit…" made timeless; retitles. |
| `13_contradiction_retcon_and_mystery.md` | "Version 0.6 adds a fifth distinction" made timeless; retitles. |
| `14_uncertainty_belief_and_evidence.md` | "What uncertainty is for" reunited with its displaced content; boundary sections reordered; retitles. |
| `15_branching_versioning_and_collaboration.md` | Retitle only. |
| `16_narrative_game_and_transmedia_extraction.md` | Domain-lens clarification added to conflict derivation; retitles. |
| `17_aesthetic_coherence_and_semiosis.md` | Retitle only. |
| `18_quality_assurance_tests.md` | Two mode-scoring notes merged; non-naturalistic anchors/examples moved beside the calibrated exemplar anchors; red-flags heading renamed; retitles. |
| `19_worked_examples.md` | Duplicated introduction merged; in-text version marker made timeless; retitles. |
| `20_ai_assisted_workflow.md` | Retitle only. |
| `21_templates_index.md` | Retitle only ("Instrument traceability matrix"). |
| `22_glossary.md` | Re-alphabetized into one sequence; "Domain" entry corrected; "Protected effect" and "Mode-equivalent consequence" entries added; all 69 prior entries otherwise preserved verbatim. |
| `23_research_notes_and_bibliography.md` | Iteration-history sections retitled honestly; lost-outlook reference corrected; iteration-7 research note appended. |
| `README.md` | Version 0.7; 0.7 change description; "four concepts" → six; `00` description updated. |
| `manifest.json` | Rewritten: version 0.7, iteration 7, local-session provenance, no stale source commit. |
| `checklists/aesthetic_coherence_sweep.md` | Retitle only. |
| `checklists/agent_character_sweep.md` | Retitle only. |
| `checklists/branching_collaboration_sweep.md` | Retitle only. |
| `checklists/canon_fact_gate.md` | Retitle only. |
| `checklists/constraint_composition_sweep.md` | Retitle only. |
| `checklists/frontloaded_seed_audit.md` | Retitle only. |
| `checklists/institutional_economic_suppression_sweep.md` | Retitle only. |
| `checklists/mystery_preservation.md` | Retitle only. |
| `checklists/propagation_sweep.md` | Retitle only. |
| `checklists/spatial_geographic_sweep.md` | Retitle only. |
| `checklists/temporal_timeline_sweep.md` | Retitle only. |
| `checklists/uncertainty_evidence_sweep.md` | Retitle only. |
| `templates/action_arena_card.md` | Retitle only. |
| `templates/aesthetic_coherence_card.md` | Retitle only. |
| `templates/agent_character_card.md` | Retitle only. |
| `templates/canon_branch_diff.md` | Retitle only. |
| `templates/canon_change_proposal.md` | Retitle only. |
| `templates/canon_fact_card.md` | Retitle only. |
| `templates/capability_card.md` | Retitle only. |
| `templates/collaboration_decision_record.md` | Retitle only. |
| `templates/constraint_card.md` | Retitle only. |
| `templates/contradiction_report.md` | Retitle only. |
| `templates/counter_institution_card.md` | Retitle only. |
| `templates/institution_card.md` | Retitle only. |
| `templates/mystery_ledger_entry.md` | Retitle only. |
| `templates/propagation_report.md` | Retitle only. |
| `templates/spatial_region_card.md` | Retitle only. |
| `templates/temporal_timeline_card.md` | Retitle only. |
| `templates/uncertainty_evidence_card.md` | Field order restored in "What would change confidence"; retitles. |
| `templates/world_kernel.md` | Retitle only. |

## Retention audit

- **Core doctrine retained.** The 12 operating laws, the Causal Canon cycle, the anti-over-simulation guardrails, the mode-aware consequence doctrine, the no-free-pass rule, and both institutional-rigor guard paragraphs remain in `01_core_theory.md` word-for-word; the two guards now live in one subsection instead of two strata.
- **Primitives retained.** All conceptual primitives, mode-aware primitives, relation verbs, dependency classes, and the minimum model record remain in `02_world_model.md`. No schema coupling introduced.
- **Governance spine retained and sharpened.** All 13 truth layers, 11 canon statuses, constraint tags, 12 admission decision operations, 12 repair operations, canon-debt machinery, and governance rules remain in `03`. The separations were made *more* explicit (seven-row table), never blurred; the only vocabulary change is the deliberate harmonization of the mystery-governance operation row with `13`, argued above.
- **All iteration-6 deliverables retained.** The five non-naturalistic worked cases (promise-birds full; mythic hand-loss, law-hats, dream-trains, chapel-mouth compact) are untouched in `19` apart from the merged introduction. The equal-weight smell bank, non-naturalistic red flags, mode-balance calibration, and non-naturalistic benchmark anchors are fully present in `01` and `18` (the `18` material moved within the file, not reduced). The earned-sacred-opacity guard, paired adversarial examples, and opacity accountability test remain in `13`, `17`, `checklists/mystery_preservation.md`, `templates/mystery_ledger_entry.md`, and `22`. Every point-of-use micro-example in protocols `05`–`17` and the instruments remains, retitled only.
- **Institutional hard edge retained.** `12` and its sweep are content-identical apart from one changelog phrase made timeless and heading retitles. Nothing was weakened.
- **QA calibration retained.** All 30 core tests, all 30 calibrated exemplar anchors, the scorecard, red flags, repair loop, regression profile, red-team prompts, and pass/fail floor remain in `18`; only ordering and headings changed.
- **Instruments retained and wired.** All 12 checklists and 18 templates keep their parent-protocol notes, completion rules, red flags, and micro-examples. `21`'s traceability matrix still matches the actual instrument set.
- **Glossary retained and extended.** All 69 version-0.6 entries survive (verified by entry-name diff); the single content change is the "Domain" correction; two entries were added, none removed.
- **Research corpus retained.** Every citation and research lane in `23` survives; the iteration-5 and iteration-6 addition sections are intact under honest historical titles.
- **Deletions accounted for.** The only deleted prose is: (a) the second copies of merged duplicate passages in `01`, `08`, `18`, and `19`, whose unique sentences were folded into the surviving copy; (b) version-tag words inside headings and changelog-speak phrases ("Version 0.6", "now", "Iteration 4 makes explicit") whose factual content, where it mattered, moved to this changelog; (c) the old fetch-provenance apparatus of `00` and `manifest.json`, replaced by the local-session record above, with the historical `8d6f0a8` baseline noted in the Provenance section. No worldbuilding doctrine, protocol step, instrument field, example, anchor, red flag, or citation was lost.
- **Agnosticism intact.** No storage, software, API, web-app, or LLM coupling was introduced anywhere; the executor being an AI changed the provenance record only, and `20_ai_assisted_workflow.md`'s doctrine (AI is never canon authority) is untouched.

## Research rationale

Iteration 7 made **no research-shaped changes**. The pass's targets — de-stratification, tier consistency, vocabulary harmonization, editing-scar repair, and stewardship-record correctness — were all internal-coherence work grounded in the package's own doctrine (authority order, vocabulary consistency, traceability). No external claim shaped any change, so no new citation is added; citing for decoration would violate `23`'s own translation rules. All existing research lanes and citations are retained unchanged, and `23` now carries an explicit iteration-7 note saying so.
