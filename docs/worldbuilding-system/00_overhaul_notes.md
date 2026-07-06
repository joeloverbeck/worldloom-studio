# Overhaul Notes — Causal Canon Worldbuilding System

This document is the package's single changelog: iteration history lives here, not inside the doctrine, protocol, or instrument files. It carries the version-1.0 release record (below) and the version-1.1 amendment record (at the end).

## Version 1.0 release pass

Date: 2026-07-02

This section records the version-1.0 release pass of `docs/worldbuilding-system/**` — the repair half of the ninth iteration, whose first half was the second field trial. It supersedes the version-0.8 overhaul notes for package stewardship.

## Provenance

Iteration 9's repair half, like iterations 7 and 8, was performed by a **Claude Code session running the Fable model with direct read/write access to the repository working tree**.

```text
Executor: Claude Code (model: Fable / claude-fable-5)
Repository: joeloverbeck/worldloom-studio (local working tree)
HEAD at start of pass: b2580daf44a8173509ffbad319725d84327dba95
  ("Second field trial.")
Baseline divergence: none — HEAD matched the release brief's pinned baseline
  exactly, and the package was verified byte-identical between the commit the
  second trial ran against and this baseline
Acquisition method: direct file reads of the working tree; the full package,
  the second trial's log and all 13 of its filled instruments, both prior
  outlooks, and the prior trial log were read before any file was changed
URL fetching: none — the pass is evidence-bounded and needed no research
Edits: applied directly to the working tree; nothing committed
```

## The evidence base: a second field trial, and a convergence gate met

Iteration 8 was the first evidence-bounded pass: it consumed the first field trial's entire finding backlog and changed nothing the log did not demand. Its own adversarial outlook then refused to grade that homework: every 0.8 fix was unvalidated by use, and the defensible 1.0 gate was defined as *a second field trial, run cold on 0.8, whose friction log demands no structural change and confirms the 0.8 additions carry their weight*.

That trial happened as the ninth iteration's first half. A steward with no authorship stake in 0.8 built a second small world cold through the README's new-world path — kernel → decomposition → seed audit → ledger-based batch admission (with one row promotion) → propagation → the first field runs of the temporal and institutional/suppression passes → a supersession chain two repairs deep → QA with a live mystery-preservation firing — logging three frictions (F2-01…F2-03), two questions (Q2-01, Q2-02), six skips (S2-01…S2-06), and twenty-three validations (V2-01…V2-23), and scoring the package 3/3 on both self-audit tests.

The trial's verdict: **version 0.8 works, the eighth iteration's repairs specifically work, and the gate is met.** No finding touches doctrine; every friction is a sentence; every 0.8 fix the trial's path crossed was confirmed working, and none regressed. Its first recommendation — apply the log's sentence fixes and nothing else — is this pass's entire substantive work list; its second — declare 1.0 with a named coverage statement — is this pass's mandate, accepted by the user.

## Structural decision

**None.** No file was added, removed, renamed, split, or merged; the package stays at 58 files. Every change is a sentence-scale repair woven into an existing file. This is not restraint for its own sake: two consecutive trials have converged on frictions that are sentences, and the evidence licenses nothing larger.

## Finding → disposition table

Every trial ledger item and ranked recommendation, with its disposition. "Fixed as proposed" means the trial's own repair proposal was implemented; "fixed differently" explains the deviation; "no change needed" explains why the finding demands no package edit.

### Frictions (F2-ledger)

| # | Finding | Disposition |
|---|---|---|
| F2-01 | Pass-generated facts' admission route unstated in `07`/`09`/`12` (stated only for repair-created facts in `13`); the trial steward inferred the route and appended gated ledger rows | **Fixed as proposed.** One routing statement in each of the three files, worded as a pointer to `06`'s jurisdiction, never as new admission machinery: `07` (end of the propagation-sweep-instrument section) states the general rule — new facts a sweep or specialized pass surfaces go through `06` like any other fact, an admission-ledger row sufficing for minor ones, exactly as repair-created facts re-enter admission under `13`, with "the sweep proposes; only admission admits" as the jurisdiction seal; `09` (timeline audit) and `12` (instrument use) each carry the same rule with pass-appropriate examples and the explicit clause that the pass records proposals and never admits from inside the sweep. The sweeps' existing red flags ("the sweep changes canon status … without using the proper parent protocol") remain exactly true — the new sentences restate that boundary from the protocol side rather than weakening it. |
| F2-02 | `18`'s QA scorecard worksheet has 9 condensed rows against 28 named tests; the n/a convention and per-test anchors operate at test granularity, forcing the trial steward to expand it | **Fixed as proposed (triage-view option).** The trial offered two shapes: present the worksheet per-test, or declare the 9 rows a triage view. The second was chosen: `18`'s scorecard section now states that the scorecard of record is per-test (one row per core test 1–28, where scoring, the n/a convention, and the calibrated anchors all operate) and that the condensed nine-row worksheet is a triage view for locating weakness, not a substitute for per-test scoring. A 28-row blank table would have added length without adding instruction; the sentence gives the steward the same authority the trial steward had to reach for by judgment. |
| F2-03 | Severity-level classification wobbles for world-structuring laws: "a law" reads as inherently Level 2 | **Fixed as proposed.** A parenthetical in `06`'s Level 2 entry: classify a law by the scope of what it structures, not by its type — a law of regional reach sits at Level 2, a law that constitutes a capability or strategic procedure is Level 3, a law that changes possibility itself is Level 4. This makes the trial steward's Level 3 judgment call for the undated-acts class of law readable directly from the levels list. |

### Questions (Q2-ledger)

| # | Finding | Disposition |
|---|---|---|
| Q2-01 | Where does a specialized pass's output live? Completion rules say what a sweep "must leave" without naming the container; the trial steward improvised pass-report files on the propagation report's model | **Fixed as proposed.** One statement in `21`, placed at the end of the propagation-and-domain-sweeps checklist family: a specialized pass's output lives in a single pass report — a record bundling the sweep's completion outputs and any domain cards the pass filled, on the model of the propagation report. The sentence sanctions a **record container, not a new instrument**: it explicitly says "not a separate template," binds the container to report discipline (audit trail, never edited after the pass), and closes the loop with F2-01 (new facts the pass generated re-enter through admission). No template was created; `21`'s matrix is unchanged at 19 templates. "Pass report" is used as plain description of a record in the existing report family, not as new controlled vocabulary — no glossary entry is owed, since the glossary's Audit trail entry already governs reports as a class. |
| Q2-02 | When does a solo steward's Level-5 change owe an explicit decision record? Derivable from `06`'s work scale (catastrophic only) but never stated | **Fixed as proposed, placed in `06` (the governing parent), with the operating card re-synchronized.** A clause in `06`'s severity-scaled-evidence section, directly after the two-vocabularies mapping: the explicit decision record enters at the catastrophic band only — a Level 5 change owing foundational work, the solo steward's typical contradiction repair, owes the contradiction report and its propagation as its record, and a separate decision record becomes due only when the work turns catastrophic or when multiple contributors require a collaboration decision (`15`). The trial offered `06` or the operating card as placement; `06` was chosen because the card never becomes an authority tier — the card's severity-map Level 5 row was then re-synchronized ("decision record and rollback/branch plan owed at the catastrophic band only") so the condensed row no longer reads as if every Level 5 change owes the record. |

### Skips (S2-ledger)

| # | Finding | Disposition |
|---|---|---|
| S2-01 | `02` skipped, with the package's blessing (0.8's declared-enrichment fix) | **No change needed** — the skip is the 0.8 fix working as designed (V2-01 territory). |
| S2-02 | `08` + constraint card + composition sweep skipped; trial mandate chose `09` + `12` | **No change needed** — legible trial scope, correctly rediscovered by the QA scorecard's constraint 2-score; `08` remains field-validated from trial 1. |
| S2-03 | `10`, `11`, `14`–`17` and their instruments out of trial scope | **No change needed** — trial scope, not a defect; carried into the coverage statement's honestly-untested list and the tenth-iteration outlook. |
| S2-04 | Change proposal skipped for solo seed admission | **No change needed** — the skip is licensed by `21`'s conditional rule (the 0.8 fix for trial 1's S-01/F-16 conflict, confirmed working: V2-13). |
| S2-05 | `19` never consulted (never stuck long enough to need it) | **No change needed as a skip;** the honest caveat it carries — `19` still untested by a genuinely naive steward — goes to the coverage statement and the outlook, not to a package edit. The V2-20 micro-fix below makes the records example slightly more self-teaching for that future reader. |
| S2-06 | `15`, `16`, `20`, `22`, `23` unneeded; the operating card's table answered vocabulary questions before the glossary was needed | **No change needed** — correct skips per scope; the glossary-not-needed observation is itself evidence the card earns its page (V2-02). |

### Ranked recommendations

| # | Recommendation | Disposition |
|---|---|---|
| 1 | Apply this log's sentence fixes and nothing else | **Implemented in full, and nothing else** — see the F2/Q2 rows above. Every substantive edit in this pass traces to one of those five findings; the only additional touches are the two argued derived-document re-syncs tabled below and the optional V2-20 one-liner. |
| 2 | Declare 1.0 with a named coverage statement | **Implemented.** `README.md` carries version 1.0 and a "What version 1.0 claims" subsection naming the field-tested surfaces and the honestly-untested list in protocol terms; `manifest.json` reads version 1.0, iteration 9; this file carries the coverage statement of record (below). The user accepted the recommendation; the trial's own framing — an honest claim about tested surfaces, not a claim of total coverage — is quoted nearly verbatim in the README's subsection. |
| 3 | Do not run a tenth editing iteration | **Honored as scope** — this pass performed no work beyond recommendations 1–2, and the question of any next iteration is reasoned fresh (and adversarially) in the tenth-iteration outlook rather than pre-committed here. |
| 4 | Future trials, if wanted, in priority order (sacred/lyrical-primary world; naive-steward trial; collaboration trial when a second contributor exists) | **Routed to the tenth-iteration outlook**, where the priority list is adopted as the recommended shape of all future work. No package edit follows from it, by design. |

### Optional micro-fix (V2-20)

**Adopted.** One parenthetical line at the end of the records-lifecycle example's repair step in `19`: an *additive* amendment — new wording with the old text left intact — owes no history note, because `03` assigns History to outgoing wording only and an additive amendment retires nothing. The trial found the doctrine's wording precise enough to adjudicate this case unaided (V2-20); the line exists so the next steward — especially the genuinely naive one `19` has not yet met — reaches the same answer by reading rather than derivation. No doctrine was touched; the line restates `03`'s existing assignment.

### Argued extensions (beyond the log's letter, within its findings)

1. **Operating card, path step 8** — one clause added: new facts a pass surfaces go back through admission (`06`), and the pass's output lives in one pass report. The card is the at-hand condensation of the path, and its contradiction-path line already carried the matching rule for repair-created facts; without the clause, the card would have silently omitted the two rules this pass added to its parents. Derived-document discipline: the parents (`07`/`09`/`12` via `06`'s jurisdiction, and `21`) carry the governing statements; the card condenses them.
2. **Operating card, severity-map Level 5 row** — re-synchronized with the Q2-02 clause, as tabled in the Q2-02 row above.

Both extensions are re-synchronizations of a derived document with parent content this pass edited, per the card's own "parents govern" rule; neither adds card-only authority. After these two touches the card was re-verified line by line against `README`, `03`, `06`, and `21` — no other drift found (consistent with the trial's V2-02 drift check of 0.8).

## Fate mapping

Every version-0.8 file was kept at its path; none was added or removed (58 files). "Untouched — release-certified" means byte-identical to version 0.8, read in full this pass, and certified consistent with the five fixes.

| Path | Change in 1.0 |
|---|---|
| `00_overhaul_notes.md` | Rewritten as the version-1.0 stewardship record. |
| `01_core_theory.md` | Untouched — release-certified (doctrine; byte-identical, per the convergence criterion). |
| `02_world_model.md` | Untouched — release-certified (doctrine; byte-identical). |
| `03_truth_layers_and_canon_governance.md` | Untouched — release-certified (doctrine; byte-identical). The F2-01 route and the V2-20 line both point *at* its existing content; neither required amending it. |
| `04_domain_atlas.md` | Untouched — release-certified (doctrine; byte-identical). |
| `05_creation_protocol.md` | Untouched — release-certified (kernel reconciliation and aesthetic-promise disposal validated in use: V2-03, V2-11). |
| `06_canon_fact_admission_protocol.md` | F2-03 law-classification parenthetical in the Level 2 entry; Q2-02 decision-record clause in the severity-scaled-evidence section. |
| `07_propagation_engine.md` | F2-01 pass-generated-facts routing statement in the propagation-sweep-instrument section. |
| `08_constraint_composition.md` | Untouched — release-certified (field-validated in trial 1). |
| `09_temporal_and_timeline_protocol.md` | F2-01 routing statement in the timeline-audit section. First field run passed (V2-15); nothing else changed. |
| `10_spatial_and_geographic_propagation.md` | Untouched — release-certified (honestly untested in anger; named in the coverage statement). |
| `11_agent_character_psychology.md` | Untouched — release-certified (honestly untested in anger; named in the coverage statement). |
| `12_institutional_economic_and_suppression_protocol.md` | F2-01 routing statement in the instrument-use section. First field run passed (V2-16); the institutional hard edge is otherwise byte-identical. |
| `13_contradiction_retcon_and_mystery.md` | Untouched — release-certified; it already owned the repair-created-facts route that F2-01 generalizes, and the two-deep supersession chain validated its triage and lifecycle wiring (V2-18, V2-19). |
| `14_uncertainty_belief_and_evidence.md` | Untouched — release-certified (honestly untested in anger). |
| `15_branching_versioning_and_collaboration.md` | Untouched — release-certified (multi-steward tier; zero field exposure, named in the coverage statement). |
| `16_narrative_game_and_transmedia_extraction.md` | Untouched — release-certified (honestly untested in anger). |
| `17_aesthetic_coherence_and_semiosis.md` | Untouched — release-certified (honestly untested in anger). |
| `18_quality_assurance_tests.md` | F2-02 reconciliation: scorecard-of-record is per-test; the nine-row worksheet declared a triage view. All 28 core tests, P1/P2, anchors, red flags, and red-team prompts unchanged. |
| `19_worked_examples.md` | V2-20 one-liner in the records-lifecycle example (additive amendments owe no history note). All twelve examples otherwise byte-identical; the Saltmarrow package example deliberately not synced with any external artifact. |
| `20_ai_assisted_workflow.md` | Untouched — release-certified (AI-is-never-canon-authority doctrine intact; untested under a naive steward, named in the coverage statement). |
| `21_templates_index.md` | Q2-01 pass-report statement at the end of the sweeps family. Families, matrix (19 templates), minimal paths, and skipping rule unchanged. |
| `22_glossary.md` | Untouched — release-certified. No fix introduced new controlled vocabulary (argued in the Q2-01 row); all 74 entries preserved verbatim. |
| `23_research_notes_and_bibliography.md` | Untouched — release-certified. No research-shaped change this pass (see Research rationale); its own translation rules forbid citation as decoration, so nothing was added. |
| `README.md` | Version 1.0; "What version 1.0 claims" coverage subsection; the 0.8-specific version framing replaced by a timeless retention sentence; the `00` package-map line made iteration-neutral. New-world path, package map, and all routing preserved exactly (validated literally: V2-01). |
| `manifest.json` | Version 1.0, iteration 9, 58 files; fresh local-session provenance (this pass's baseline commit); no-structural-change note; no stale commit strings. |
| `operating_card.md` | Two re-syncs with edited parents (path step 8 clause; severity-map Level 5 row), argued above; re-verified against `README`/`03`/`06`/`21` after the touches. |
| `checklists/` (all 12) | Untouched — release-certified. No trial finding names any checklist; the gate, seed audit, propagation sweep, temporal sweep, institutional sweep, and mystery-preservation checklist were all validated in live use (V2 ledger), and the F2-01 sentences deliberately restate — never alter — the sweeps' red-flag boundary. |
| `templates/` (all 19) | Untouched — release-certified. The ledger (V2-08/V2-09, including the Promotions rule), kernel (V2-03), fact and capability cards (V2-10, V2-18, V2-20), mystery ledger entry (V2-12), and contradiction report (V2-19) were all validated in use; Q2-01 sanctioned a container precisely so no new template would be created. |

## Retention audit

- **Core doctrine retained absolutely.** `01`–`04` are byte-identical to version 0.8 — verified by diff, not by intention. The 12 operating laws, 13 truth layers, 11 canon statuses, 12 admission decision operations, 12 repair operations, label-separation table, operation-context matrix, decision-jurisdiction table, canon-debt machinery, governance board, and record-lifecycle doctrine all survive verbatim.
- **Every version-0.8 addition survives, now field-validated.** The routed reading path (V2-01), the operating card (V2-02, plus the two argued re-syncs), the reconciled kernel (V2-03), the admission ledger and its Promotions rule (V2-08/V2-09), the division-of-labor and digest rules (V2-10), the record lifecycle under a two-deep chain (V2-18/V2-19), the n/a convention and P1/P2 placement (V2-21), and the mystery-preservation boundary logic (V2-23) are all intact; the five fixes sit adjacent to several of these, and each was worded against the validated behavior as its acceptance test.
- **Both trials' protected sets honored.** The iteration-8 protected set (trial 1's V-01…V-19, audited item-by-item in the 0.8 retention audit) remains protected — nothing this pass touched intersects it except the QA scorecard section, where every test, anchor, and rule is unchanged and only the worksheet's standing was clarified. The V2 ledger's validated behaviors (above) now join that protected set for future passes.
- **Jurisdiction seams stay crisp.** The F2-01 sentences route pass output *to* admission without creating admission machinery inside `07`/`09`/`12`; the sweeps' "never change canon from inside a sweep" red flags remain exactly true; Q2-01 sanctions a record container in the existing report family; the Q2-02 clause reads the work scale, it does not amend it. The status / tag / admission-operation / repair-operation / consequence-mode / preservation-boundary separations are untouched.
- **QA calibration retained.** All 28 core tests, both package self-audit tests, all calibrated anchors, the mode-aware calibration, red flags, repair loop, regression profile, red-team prompts, and pass/fail floor are unchanged; the per-test rule states how the existing machinery already operates.
- **Institutional hard edge retained.** `12` received one routing statement and nothing else; every step, method list, residue list, synthesis requirement, and mode-aware check is byte-identical.
- **Vocabulary authoritative and consistent.** No new glossary entries were needed and none was added; all 74 entries preserved verbatim; every term the five fixes use is existing vocabulary.
- **Deletions accounted for.** The only prose removed this pass is the README's 0.8-specific version-framing paragraph, superseded by the 1.0 coverage subsection that replaces it (its retention sentence — the list of preserved earlier-version substance — was carried forward verbatim and extended with the 0.8 additions), and the manifest's iteration-8 note fields, superseded by their iteration-9 successors. Nothing was removed without a successor; iteration-8 history survives in this file's evidence-base section and in the repository's own history.
- **Agnosticism intact.** No storage, software, API, web-app, or LLM coupling introduced; no package file cites a repository path outside the package; the coverage statement names protocol surfaces, never trial artifacts; `manifest.json` remains inventory, not schema.
- **No re-stratification.** All fixes are woven in timelessly; no "version 1.0 adds…" strata exist in any doctrine, protocol, or instrument file. The only current-version markers are the package `README.md`, `manifest.json`, and this file.

## Coverage statement of record

The README carries the user-facing version of this statement; this is the full accounting behind it.

**Field-tested (two independent end-to-end cold builds, run by stewards without authorship stakes, logged with friction/skip/question/validation ledgers):**

- The core pipeline, twice over: kernel → seed decomposition → frontloaded seed audit → severity-scaled admission (gate, fact/capability cards, mystery ledger) → propagation (full fourteen-domain pass) → contradiction repair → QA regression profile.
- Batch admission through the admission ledger, including addendum batches and one row promotion under the Promotions rule.
- Constraint composition (`08`) — trial 1.
- The temporal pass (`09`) and the institutional/economic/suppression pass (`12`) — trial 2, first runs in anger, both generative.
- The record lifecycle under accumulation: a supersession chain two repairs deep, with the second contradiction discovered *by* the first repair's mandated propagation.
- The QA machinery at per-test granularity with the n/a convention, the red-team prompts (a genuine boundary defect and a leak channel found in each trial), and a live firing of the mystery-preservation checklist under a QA repair touching a protected effect.
- The on-ramp as an artifact set: the routed README path (zero forced off-path reads), the operating card as persistent working memory, and the reconciled kernel.

**Honestly untested (named so the version number stays true):**

- `10` (spatial), `11` (agent/psychology), `14` (uncertainty/evidence), `16` (extraction), `17` (aesthetic coherence) — never run in anger; each trial's QA profile names its 2-scores exactly there.
- `15` and every multi-steward mechanism — governance board workflow roles, dispute handling, collaboration decision records — zero field exposure; a different failure surface (contested authority, not solo confusion).
- `19` and `20` under a genuinely naive steward — both trial stewards carried methodology-adjacent contamination and never needed the stuck-on-composition fallback.
- The aesthetic-promise disposal in a lyrical- or sacred-primary world, where aesthetic promises are the load-bearing facts rather than kernel commitments.
- Both trials were run by stewards of the same model family as the package's authors — a disclosed contamination that only a human or heterogeneous trial can clear.

## Research rationale

None was needed, and none was used. This pass is evidence-bounded by design: all five fixes, the micro-fix, and the coverage statement trace to logged findings of the second field trial, and the release-versioning question (what a 1.0 label may honestly claim) was answered by the trial's own verdict language rather than by external versioning literature — importing release-engineering convention into a storage-agnostic methodology package would have been citation as decoration, which `23`'s translation rules forbid. `23` is therefore untouched; all prior research lanes and citations are retained unchanged.

## Version 1.1 amendment — proposal mode (2026-07-05)

**Change.** `20_ai_assisted_workflow.md` now defines **two assistance modes** — proposal mode (the steward asks the AI to draft candidate material for the judgment at hand) and pressure mode (the existing challenge discipline) — with a matching proposal-mode workflow, prompt discipline, an anti-automation clarification, one new output label ("adopted with steward revision"), and one boundary: the world's essence (`05` Phase 1 kernel premise) originates with the steward and is never delegated. Adoption remains authorship: the steward selects, edits, and words everything that enters a record, and admission (`06`) still governs canon standing. The core rule — AI is never canon authority — is unchanged, as are all ten analyst roles, the vocabulary guardrail, the risk bands, and the failure-mode checklist.

**Evidence and provenance.** This is a steward-decided amendment, not a trial-driven one, and is recorded as such. The steward's ratified intent (2026-07-05 stewardship session): externalize essentially every judgment except the world's essence to an external assistant via context-complete requests, then curate the responses into the record. Supporting evidence: the pre-package working practice this system grew from (an LLM drafting whole worlds from a seed, whose failure was *wholesale* delegation without judgment-scoped curation — the failure proposal mode's discipline exists to prevent), and three application-layer parity field trials (2026-07-05) showing the pressure-only reading produced assistance blocked exactly where drafting help was wanted. `20`'s own opening ("proposer, challenger, summarizer…") and its risk-band row for creating new canon ("AI proposal must pass admission like any other proposal") already licensed the substance; 1.0's prompt discipline ("ask for pressure, not answers") contradicted them, and 1.1 resolves that tension in the proposer direction.

**Honesty.** Proposal mode is **untested in anger** — no field trial has run it. It joins the coverage statement's honestly-untested list (`README.md` "What version 1.1 claims") beside `20`-under-a-naive-steward, and is expected to generate the next revision's evidence. The two field-validated trials exercised pressure-style assistance only.

**Scope and retention.** One protocol-tier file edited (`20`); doctrine (`01`–`04`), all other protocols, all instruments, and the glossary byte-identical. "Proposal mode" and "pressure mode" are used as plain descriptions, not new controlled vocabulary — no glossary entry is owed (the Q2-01 precedent). Agnosticism intact: the amendment speaks of stewards and assistants, never of software, storage, or any application. Version markers updated: `README.md` (version line and coverage subsection), `manifest.json` (version 1.1, iteration 10), and this file. File count unchanged at 58; no structural change.
