# Overhaul Notes — Causal Canon Worldbuilding System Version 0.8

Date: 2026-07-02

This document records the eighth-iteration overhaul of `docs/worldbuilding-system/**`. It supersedes the version-0.7 overhaul notes for package stewardship. It is the package's single changelog: iteration history lives here, not inside the doctrine, protocol, or instrument files.

## Provenance

Iteration 8, like iteration 7, was performed by a **Claude Code session running the Fable model with direct read/write access to the repository working tree**.

```text
Executor: Claude Code (model: Fable / claude-fable-5)
Repository: joeloverbeck/worldloom-studio (local working tree)
HEAD at start of pass: 4b9356eef4aa5288598da6620b6c409999adacc8
  ("First field trial.")
Baseline divergence: none — HEAD matched the brief's pinned baseline exactly
Acquisition method: direct file reads of the working tree; all 56 package
  files, the field-trial log, the eighth-iteration outlook, and all 11
  trial-world artifacts were read in full before any file was changed
URL fetching: two web searches only, to check whether records-management
  and job-aid literature sharpened planned fixes (see Research rationale)
Edits: applied directly to the working tree; nothing committed
```

## The evidence base: a field trial, not a self-derived diagnosis

Iterations 1–7 were document-editing passes. Iteration 7's own outlook concluded that another editing pass was not warranted and that the highest-value eighth iteration was a **field trial**: a steward with no authorship stake building a small world end-to-end using only the package, followed by *only the changes the trial log demands*.

That trial happened before this pass. A steward built the world *Saltmarrow* from kernel through QA — seed kernel → decomposition → admission → propagation → one constraint composition → one contradiction repair → one protected effect under the opacity accountability test → QA regression profile — logging sixteen frictions (F-01…F-16, with no F-14 in the numbering), six skips (S-01…S-06), six unanswered questions (Q-01…Q-06), nineteen validated strengths (V-01…V-19), and eight ranked recommendations. The trial log is committed in the repository's reports area; the package version it exercised is byte-identical to this pass's baseline.

The trial's verdict: **the system works** — the instruments generated design quality rather than merely checking it, and the friction is concentrated in *connective tissue* (reading-path routing, instrument handoffs, record lifecycle), not substance. This pass therefore made only the changes the log demands, plus two argued consistency extensions discovered while implementing them (noted in the disposition table).

## Structural decision

Two files were added; none was removed, renamed, split, or merged. The package grows from 56 to **58 files**. The high bar for structural change was met by field evidence, not ambition:

- **`operating_card.md`** (top-level, unnumbered like the README) — trial recommendation 5. The trial measured a ~4,400-line minimum read before the first world is stable and repeated hesitations that the label-separation table, severity map, and minimal-use paths would have prevented if held in hand. The card is a derived quick reference; it states that `README`/`03`/`06`/`21` govern on any conflict, so it adds no authority tier.
- **`templates/admission_ledger.md`** — trial recommendation 3 / F-08. The trial's fifteen-seed decomposition collided with the one-fact-per-card rule while severity-scaled evidence said minor facts owe only five items — and no instrument existed for that record. The steward improvised a ledger table that worked; this template blesses that pattern as a sanctioned instrument, wired into `06`, `21`, and the README path.

Everything else was repaired in place.

## Finding → disposition table

Every trial ledger item and ranked recommendation, with its disposition. "Fixed as proposed" means the trial's own repair proposal was implemented; "fixed differently" explains the deviation; "declined" explains the refusal.

### Frictions (F-ledger)

| # | Finding | Disposition |
|---|---|---|
| F-01 | New-world path never routes `03`, but the audit and admission need its vocabulary | **Fixed as proposed.** `README.md` new-world path step 4 now assigns `03` before the seed audit. |
| F-02 | Kernel template asks for genre mode and consequence mode with no gloss | **Fixed as proposed.** `templates/world_kernel.md`: genre mode glossed as the reader-facing shelf label (the genre contract of `17`); consequence mode glossed as which smell tests govern admission (`01`). |
| F-03 | Shared change-scoped "Minimum completion" boilerplate fits the kernel awkwardly | **Fixed as proposed.** `templates/world_kernel.md` now carries a kernel-appropriate completion rule (whole-world scope, starting scale and pressures, seed list, implied debt, cross-references). Other templates keep the shared block — no findings against them. |
| F-04 | `05` Phase 1's nine-item kernel disagrees with the template; the ordinary-life anchor person silently drops out | **Fixed as proposed, protocol governing.** `templates/world_kernel.md` gains "Starting scale", "Primary pressures and initial domains" (forces plus domains), and an ordinary-life-anchor prompt. `05` Phase 1 now maps its nine items onto the template's sections explicitly and states that the protocol governs on disagreement. The anchor person was kept as doctrine and wired downstream: `05` Phase 6 now starts from the kernel's anchor. |
| F-05 | Audit placement ambiguous between README order and `05` Phase 3 | **Fixed as proposed.** `checklists/frontloaded_seed_audit.md` now states when it runs (after decomposition, before first admission; either placement satisfies this). `05` Phase 3 reworded to run the audit first, then the gate. |
| F-06 | Audit asks for "initial status" before admission, which can only be `proposed` | **Fixed as proposed.** The checklist box now says pre-admission status is `proposed` and asks for the intended post-admission status so the gate can check the intention. |
| F-07 | Fact card and capability card overlap ~half their sections with no division of labor | **Fixed as proposed.** `06` (admission instruments) states the division — fact card = governance record + shock-cone digest; capability card = causal analysis of use — and both templates carry the cross-reference rule. This codifies the division the trial steward improvised. |
| F-08 | One-fact-per-card collides with decomposition output; no instrument exists for minor-fact records | **Fixed as proposed (template option).** New `templates/admission_ledger.md`; wired into `06` (instruments + severity table), `21` (families, matrix, new "Batch of minor facts" minimal path), `05` Phase 3, and the README path. The fact card notes the ledger as the sanctioned lighter record. |
| F-09 | Gate asks for a singular admission operation; real admissions compose | **Fixed as proposed.** `checklists/canon_fact_gate.md` box now reads "operation(s) recorded, primary first"; `03` (decision operations) adds the composition rule — primary first, components as context, composition never crossing the admission/repair jurisdiction boundary (protecting V-14). |
| F-10 | Shock cone demanded at three granularities (fact card, propagation report, sweep) | **Fixed as proposed.** `07` names the propagation report the master record of the shock cone; the fact card's summary section says digest-or-pointer when a report exists; the sweep's shock-cone section says to work its boxes in the report, not a third time. |
| F-11 | Propagation report field labeled "Severity level" but offers work-scale values | **Fixed as proposed.** Field renamed "Severity (work scale)" with a one-line pointer to `06`'s mapping. **Argued extension:** the contradiction report's "Severity" field offers the same values and per `06` uses the work scale; it was relabeled "Severity (work scale)" for consistency. |
| F-12 | Contradiction report's "Repair operation" field singular; real repairs compose | **Fixed as proposed.** Field now "Repair operation(s), primary first" with the composition rule; `13` (repair operations) adds the matching doctrine sentence, composition confined to the repair list. |
| F-13 | **The card-lifecycle gap:** nothing says where corrected wording lives after a repair supersedes a fact | **Fixed as proposed (trial rec 1).** New "Record lifecycle: living cards and the audit trail" section in `03`: cards are living present-tense records updated in place; outgoing wording moves to a history note with its status (`superseded`/`deprecated`) and a pointer to the report; reports are the unedited audit trail. Operationalized in: `06` (instruments note + change package item), `13` (triage step 11 — update cards after propagating the repair), `templates/canon_fact_card.md` (living-record note + History section), `templates/capability_card.md`, `templates/contradiction_report.md` (supersession handoff), `templates/admission_ledger.md` (rows follow the lifecycle). Built entirely from existing statuses; glossary updated in lockstep (Living record, Audit trail). |
| F-15 | QA scorecard has no n/a convention | **Fixed as proposed.** `18` "Interpreting scores" now defines n/a-with-reason (subject matter does not exist in the world), distinguishes it from 0, and flags unexplained n/a. |
| F-16 | `21`'s guidance arrives too late (unrouted), and its "Major capability" path conflicts with the README on the change proposal | **Fixed as proposed.** README new-world step 6 routes `21` at admission time; `21`'s intro says to read it at admission, not after. Conflict resolved in `06`'s favor (the protocol tier already made the proposal conditional): `21`'s Major-capability path now states the proposal is required when the change needs alternatives, review, or a recorded admission decision, and that a solo steward admitting seeds with no alternatives may skip it and record the skip. README and `21` now agree. |

(No F-14 exists in the trial's numbering.)

### Questions (Q-ledger)

| # | Finding | Disposition |
|---|---|---|
| Q-01 | Kernel gives no seed-count guidance (resolved by `05` during the trial) | **Fixed as proposed (cross-reference).** The kernel template's Foundational facts section now points to the thin-start rule and seed decomposition in `05`. |
| Q-02 | No decomposition granularity rule | **Fixed as proposed.** `05` Phase 2 adopts the trial steward's test verbatim in substance: split until each seed could be independently rejected without destroying its siblings, with the thin-start rule as the opposite bound. |
| Q-03 | Aesthetic promises have no admission station | **Fixed differently (explicit disposal rather than a new station).** `05`'s seed-admission-order section now states the disposal: aesthetic promises are admitted as kernel commitments and checked by the QA aesthetic-residue test; load-bearing aesthetic rules get a record (fact card typed `aesthetic rule`, or the aesthetic coherence card under `17`). Deferring the rest to the aesthetic pass is named as the correct disposal, not a skip. A dedicated gate pass was not created because the trial's own experience showed the deferral worked; what was missing was the sentence saying so. |
| Q-04 | Weak-mystery "author has not decided" vs. deliberate undecidedness | **Fixed as proposed.** `13`'s weak-list bullet now distinguishes undecided-by-neglect from a deliberate, recorded refusal under an authorial mystery boundary. |
| Q-05 | QA tests 29–30 score the package, not the world | **Fixed as proposed, with renumbering.** `18` gains a "Package self-audit tests" subsection stating who runs them and when; the two tests moved there with their calibrated anchors intact and were relabeled P1/P2 so the world scorecard's core tests read 1–28 without a gap. No content was lost. |
| Q-06 | What is the canonical current-state of canon after repairs? | **Fixed as proposed (with F-13).** `03`'s record-lifecycle section answers it directly: the current state of canon is the set of live cards read in the present tense; the reports replayed in order are how it got there. |

### Skips (S-ledger)

| # | Finding | Disposition |
|---|---|---|
| S-01 | Change proposal skipped for seeds, conflicting with `21` | **Fixed with F-16** — the conditional rule now makes the trial steward's skip explicitly correct. |
| S-02 | Mystery-preservation checklist never triggered | **No change needed** — the trial confirms the checklist's own trigger conditions worked as designed. |
| S-03 | Specialized passes `09`–`12`, `14`–`17` sampled, not run | **No change** — trial scope, not a package defect. Recorded as the main coverage gap in the ninth-iteration outlook. |
| S-04 | `02` never routed, never needed | **Fixed as proposed (declared optional).** README new-world path and package map now state `02` is enrichment, not a required stop. Nothing in `02` was cut. |
| S-05 | `19` unreachable when the steward was stuck | **Fixed as proposed.** README new-world path and `21`'s intro now route to `19` for "how do the instruments compose?" questions, and `19` gained the records-lifecycle example those questions actually need. |
| S-06 | `15`, `16`, `20`, `22`, `23` out of trial scope | **No change** — correct skips per scope; glossary-not-needed is itself evidence `03`'s tables work. |

### Ranked recommendations

| # | Recommendation | Disposition |
|---|---|---|
| 1 | Close the card-lifecycle gap | **Implemented** — see F-13/Q-06. Doctrine placed in `03` (the governance spine owns record state), operationalized in `06`, `13`, and four templates. |
| 2 | Fix the reading path | **Implemented** — see F-01, F-16, S-04, S-05. |
| 3 | Batch-admission pattern + division-of-labor sentence | **Implemented** — see F-07, F-08; the trial's improvised ledger became `templates/admission_ledger.md` with a Promotions rule added (rows promote to cards when facts turn load-bearing), which the trial's structure implied but did not state. |
| 4 | Reconcile the kernel's two definitions | **Implemented** — see F-04; the ordinary-life anchor was ruled real doctrine and wired to `05` Phase 6 rather than cut. |
| 5 | One-page operating card | **Implemented** — new `operating_card.md` with the four components the trial named (path with real dependencies, label-separation table, severity map, minimal-use paths) plus the records rule, since the trial ranked that gap first. |
| 6 | Records-lifecycle worked example | **Implemented** — `19`'s twelfth example, adapted from the trial's Saltmarrow artifacts into a self-contained walkthrough (no repository paths; the package remains storage-agnostic and self-contained). The trial steward's filled instruments are the uncredited-in-package source; credit lives here: the example condenses the Saltmarrow world built in the eighth-iteration field trial. |
| 7 | Small template fixes | **Implemented** — F-02, F-05, F-06, F-09, F-11, F-12, F-15, Q-01…Q-05 as tabled above. |
| 8 | Drop severity-scale unification; deprioritize reinforcement-tail weaving | **Honored (declined work).** The two severity scales remain, with only the F-11 field labels fixed — V-06 shows the mapping already works. No reinforcement-tail weaving was attempted — no trial evidence of need. |

### Discovered defects (argued, beyond the log)

1. **Contradiction report severity label** — the same work-scale-values-under-a-bare-"Severity"-heading pattern F-11 flagged on the propagation report; relabeled for consistency (see F-11 row).
2. **QA test renumbering** — moving tests 29–30 out of the core list would have left "core tests 1–28, 29–30 elsewhere" ambiguity; they were relabeled P1/P2 inside the new package-self-audit subsection so both lists read cleanly. Verified no other file references the old numbers.

## Fate mapping

Every version-0.7 file was kept at its path; two files were added. "Untouched" means byte-identical to version 0.7.

| Path | Change in 0.8 |
|---|---|
| `00_overhaul_notes.md` | Rewritten as the iteration-8 stewardship record. |
| `01_core_theory.md` | Untouched (trial V-02: reads as doctrine should). |
| `02_world_model.md` | Untouched; its optional status is declared in the README, not here. |
| `03_truth_layers_and_canon_governance.md` | Record-lifecycle section added; composed-operations rule added to decision operations. |
| `04_domain_atlas.md` | Untouched (trial-validated, V-11). |
| `05_creation_protocol.md` | Phase 1 kernel-template mapping; Phase 2 granularity rule; Phase 3 audit-first wording + ledger reference; Phase 6 anchor wiring; aesthetic-promise disposal added to the seed admission order. |
| `06_canon_fact_admission_protocol.md` | Admission-ledger instrument added; card division-of-labor rule; record-lifecycle note; severity table's minor/moderate rows name the ledger; change package gains card-upkeep item; completeness item 9 gains the digest-or-pointer note. |
| `07_propagation_engine.md` | Propagation report named master shock-cone record (one paragraph). |
| `08_constraint_composition.md` | Untouched (trial-validated, V-13/V-14). |
| `09_temporal_and_timeline_protocol.md` | Untouched. |
| `10_spatial_and_geographic_propagation.md` | Untouched. |
| `11_agent_character_psychology.md` | Untouched. |
| `12_institutional_economic_and_suppression_protocol.md` | Untouched (institutional hard edge preserved undiminished). |
| `13_contradiction_retcon_and_mystery.md` | Triage step 11 (card upkeep); repairs-compose rule; Q-04 neglect-vs-commitment clause. |
| `14_uncertainty_belief_and_evidence.md` | Untouched. |
| `15_branching_versioning_and_collaboration.md` | Untouched. |
| `16_narrative_game_and_transmedia_extraction.md` | Untouched. |
| `17_aesthetic_coherence_and_semiosis.md` | Untouched. |
| `18_quality_assurance_tests.md` | n/a convention added; tests 29–30 moved (content intact, anchors intact) into a new "Package self-audit tests" subsection as P1/P2. |
| `19_worked_examples.md` | Twelfth example added (records lifecycle); intro sentence and reuse table updated. |
| `20_ai_assisted_workflow.md` | Untouched (AI-is-never-canon-authority doctrine intact). |
| `21_templates_index.md` | Intro routes itself to admission time and to `19`/operating card; admission ledger added to families and matrix; "Batch of minor facts" minimal path added; Major-capability path's change-proposal line made conditional per `06`. |
| `22_glossary.md` | Three entries added (Admission ledger, Audit trail, Living record); all prior entries preserved verbatim. |
| `23_research_notes_and_bibliography.md` | Iteration-8 research note appended (one lane, one source). |
| `README.md` | Version 0.8; new-world path rewritten with all real dependencies; `02` declared enrichment; `19`/`21`/operating card routed; package map updated. |
| `manifest.json` | Rewritten: version 0.8, iteration 8, 58 files, local-session provenance. |
| `checklists/canon_fact_gate.md` | Plural-operations box (F-09). |
| `checklists/frontloaded_seed_audit.md` | Timing note; initial-status clarification (F-05, F-06). |
| `checklists/propagation_sweep.md` | Master-record note under Shock cone (F-10). |
| `checklists/mystery_preservation.md` | Untouched (trial-validated by correct non-firing, S-02). |
| `checklists/constraint_composition_sweep.md`, `temporal_timeline_sweep.md`, `spatial_geographic_sweep.md`, `agent_character_sweep.md`, `institutional_economic_suppression_sweep.md`, `uncertainty_evidence_sweep.md`, `branching_collaboration_sweep.md`, `aesthetic_coherence_sweep.md` | Untouched. |
| `templates/world_kernel.md` | Starting scale; primary-pressures prompt; mode glosses; anchor prompt; thin-start cross-reference; kernel-appropriate completion rule (F-02, F-03, F-04, Q-01). |
| `templates/canon_fact_card.md` | Living-record note; History section; shock-cone digest rule; ledger and division-of-labor notes (F-07, F-08, F-10, F-13). |
| `templates/capability_card.md` | Living-record and division-of-labor note (F-07, F-13). |
| `templates/contradiction_report.md` | Plural operations, primary first; supersession handoff; severity field labeled work scale (F-11 ext., F-12, F-13). |
| `templates/propagation_report.md` | Severity field renamed to work scale (F-11). |
| `templates/mystery_ledger_entry.md` | Untouched ("the best instrument in the package", V-08/V-15 — deliberately not degraded). |
| `templates/canon_change_proposal.md`, `constraint_card.md`, `institution_card.md`, `counter_institution_card.md`, `action_arena_card.md`, `temporal_timeline_card.md`, `spatial_region_card.md`, `agent_character_card.md`, `uncertainty_evidence_card.md`, `canon_branch_diff.md`, `collaboration_decision_record.md`, `aesthetic_coherence_card.md` | Untouched. |
| **Added:** `operating_card.md` | One-page quick reference (trial rec 5); derived, parents govern. |
| **Added:** `templates/admission_ledger.md` | Batch admission record for minor facts (trial rec 3 / F-08). |

## Retention audit

- **Core doctrine retained.** `01` is untouched: the 12 operating laws, Causal Canon cycle, mode-aware smell tests, equal-weight non-naturalistic pressure, institutional-rigor guards, anti-failure questions, and craft ceiling are byte-identical to 0.7.
- **Primitives retained.** `02` untouched; declaring it optional in the README removed no content and introduced no coupling.
- **Governance spine retained and extended, never blurred.** All 13 truth layers, 11 canon statuses, constraint tags, 12 admission operations, 12 repair operations, the seven-row label-separation table, operation-context matrix, decision-jurisdiction table, canon-debt machinery, and governance board survive verbatim in `03`. The additions (composition rule, record lifecycle) use only existing vocabulary and explicitly reinforce the admission/repair boundary the trial validated (V-14).
- **Trial-validated strengths preserved.** Checked item by item: the README path keeps its nine-step named-file shape (V-01); `01` untouched (V-02); the kernel template's non-naturalistic prompt untouched (V-03); `03`'s tables untouched (V-04); the audit's latency question untouched (V-05); the `06` severity mapping kept, only field labels fixed (V-06); the gate's contradiction-risk box untouched (V-07); the mystery ledger untouched (V-08, V-15, V-16); propagation mechanisms and stop-when-governed untouched (V-09, V-10); domain triage untouched (V-11); the sweep's contradiction check untouched (V-12); `08` untouched (V-13); the jurisdiction boundary restated, not weakened, by the composition rule (V-14); QA anchors and red-team prompts intact, with the two package tests relocated whole (V-17–V-19).
- **QA calibration retained.** All 30 tests and all 30 calibrated anchors survive: 28 core tests in place, tests 29–30 moved intact (definitions and anchors) to the package-self-audit subsection as P1/P2. The scorecard, red flags, repair loop, regression profile, red-team prompts, and pass/fail floor are unchanged.
- **Institutional hard edge retained.** `12` and its sweep are byte-identical to 0.7.
- **Worked examples retained and extended.** All eleven prior examples byte-identical; one example added; the reuse table gained one row.
- **Instruments retained and wired.** All 12 checklists and 18 prior templates keep their parent-protocol notes, completion rules, and red flags; the new template carries all three; `21`'s matrix matches the 19-template set.
- **Glossary retained and extended.** All 71 version-0.7 entries preserved verbatim; three added, none removed or altered.
- **Research corpus retained.** Every citation and lane in `23` survives; one lane and one source added.
- **Deletions accounted for.** No prose was deleted this pass except wording replaced in place by its own corrected version (field labels, the audit's status box, the gate's operation box, `21`'s change-proposal line, the kernel's completion block — each superseded wording's intent is preserved or strengthened by its replacement, and each replacement is tabled above). Nothing was removed without a successor.
- **Agnosticism intact.** No storage, software, API, web-app, or LLM coupling introduced; no package file cites a repository path outside the package; the records-lifecycle example is fully self-contained; `20`'s doctrine is untouched.
- **No re-stratification.** All fixes are woven in timelessly; no "iteration 8 adds…" strata exist in any doctrine, protocol, or instrument file. The only current-version markers are the package `README.md`, `manifest.json`, and this file.

## Research rationale

Iteration 8 is evidence-bounded: nearly every change traces to a logged trial finding, and the trial log — not external literature — set the priorities. One external lane shaped one change: the record-lifecycle doctrine (`03`) adapts the records-management distinction between living working documents and fixed evidential records with audit trails, per ISO 15489-1:2016 (cited in `23`'s iteration-8 note with the craft translation). A second lane was checked and rejected: job-aid/quick-reference design literature was surveyed for the operating card and found to add nothing beyond what the trial log itself demanded (field the exact tables the steward reached for); citing it would have been decoration, which `23`'s translation rules forbid. No other change was research-shaped.
