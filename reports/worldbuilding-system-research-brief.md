# Research brief — Causal Canon Worldbuilding System, iteration 8 (field-trial-driven repair pass)

*This brief is the complete instruction set for the session that will perform the eighth iteration. The executor is a **Claude Code session with direct read/write access to the repository working tree** — there is no manifest to upload and no URL fetching; you read the files with your own tools and edit them in place. You have none of the context in which this brief was authored; everything you need is in this brief plus the repository itself. Produce the work directly; do not interview or ask clarifying questions.*

---

## 1. Context

You are working inside the `joeloverbeck/worldloom-studio` repository — a web app to create and maintain fictional worlds from a continuity and causality perspective. The subject of this task is the repository's **Causal Canon Worldbuilding System**, a storage- and software-agnostic worldbuilding methodology living entirely under `docs/worldbuilding-system/**`. It is currently at **version 0.7** and comprises **56 files**: 24 numbered documents (`00`–`23`), a package `README.md`, a `manifest.json`, 12 `checklists/`, and 18 `templates/`.

**Baseline.** This brief was authored against commit `4b9356e` (full SHA `4b9356eef4aa5288598da6620b6c409999adacc8`, "First field trial."), the repository HEAD on `main` at authoring time. Verify HEAD when you start (`git rev-parse HEAD`); if it has moved past `4b9356e`, work from the live tree and note the divergence in your overhaul notes. You edit the working tree directly — the baseline pin exists so provenance is honest, not because you fetch anything from it.

**Lineage.** This is the **eighth iteration** of an iterated overhaul, and it is shaped differently from every predecessor. Iterations 1–6 (ChatGPT-Pro) and 7 (a local Claude Code session) were all *document-editing* passes. Iteration 7's changelog is the package's own `docs/worldbuilding-system/00_overhaul_notes.md` (version 0.7, de-stratification and tier-consistency pass); its adversarial self-assessment is `reports/eighth-iteration-outlook.md`, which concluded that **another editing pass was not warranted** and that the highest-value eighth iteration was a **field trial**: a steward with no authorship stake building a small world end-to-end using only the package, followed by *only the changes the trial log demands*.

That trial has now happened. Its log — **`reports/eighth-iteration-field-trial.md`** — is your **primary seed and work order**. A steward built the world *Saltmarrow* from kernel through QA (seed kernel → decomposition → admission → propagation → one constraint composition → one contradiction repair → one protected effect under the opacity accountability test → QA regression profile), logging every friction (F-01…F-16), skip (S-01…S-06), unanswered question (Q-01…Q-06), and validated strength (V-01…V-19), and closing with a verdict ("the system works; the friction is concentrated in connective tissue, not substance") and **eight ranked recommendations**. The trial's filled instruments live in `reports/field-trial-world/` (11 files) — they are your evidence base and raw material. Note one numbering quirk so you do not hunt for a missing entry: the F-ledger has **no F-14**; the numbering runs F-01…F-13, F-15, F-16.

**Equivalence of the trial's evidence to your tree.** The trial log pins package version 0.7 at commit `ad7334f`. Verified at authoring time: `git diff ad7334f 4b9356e -- docs/worldbuilding-system/` is **empty** — the package is byte-identical between the commit the trial ran against and this brief's baseline (the only change in that range is the addition of the trial report, the outlook, and the `reports/field-trial-world/` artifacts). Every claim the trial makes about the documents therefore applies verbatim to the tree you are editing.

**Package facts you can rely on** (from the version-0.7 `00_overhaul_notes.md` retention audit, read directly at baseline): 12 operating laws in `01`; 13 truth layers, 11 canon statuses, 12 admission decision operations, and 12 repair operations in `03`; fourteen propagation domains in `04`; two explicitly mapped severity vocabularies in `06` (admission Levels 0–5 ↔ the minor→catastrophic work scale); 30 core QA tests with calibrated exemplar anchors in `18`; 71 glossary entries in `22`.

## 2. Read in full (authority order)

Read everything below, in this order, before changing anything. The evidence tier comes first — unlike iteration 7, your priorities are *not* self-derived; they are in the trial log.

**Evidence and lineage (the mandate):**

- `reports/eighth-iteration-field-trial.md` — **the work order.** The friction/skip/question/strength ledgers, the verdict, and the eight ranked recommendations that define this pass.
- `reports/eighth-iteration-outlook.md` — iteration 7's adversarial self-assessment: its least-confident fixes (the `03` mystery-governance row, the `06` severity mapping), its named residues (no on-ramp, no longitudinal example, reinforcement tails), and the four "converged / 1.0-ready" criteria you will re-score in your own outlook. The trial confirms some of its candidates (operating card, records-side example) and refutes others (severity-scale unification — see trial rec 8).
- `docs/worldbuilding-system/00_overhaul_notes.md` — the iteration-7 changelog, fate mapping, retention audit, and provenance format; the single-changelog doctrine ("iteration history lives here, not in the doctrine files") that your pass must also honor. You rewrite this file as the iteration-8 record.

**Trial artifacts — the Saltmarrow world (evidence for every F/Q item; raw material for the records-lifecycle example, per §3.4):**

- `reports/field-trial-world/world_kernel.md` — exhibits F-02/F-03/F-04 (kernel-template frictions) in a filled instrument.
- `reports/field-trial-world/seed_decomposition.md` — exhibits Q-02 (granularity rule the steward had to invent).
- `reports/field-trial-world/frontloaded_seed_audit.md` — exhibits F-05/F-06 (audit timing, pre-admission status).
- `reports/field-trial-world/admission_ledger.md` — **the improvised batch-admission instrument** the trial recommends blessing (rec 3 / F-08).
- `reports/field-trial-world/fact_cards.md`, `capability_card_memory_salt.md` — exhibit F-07 (card division of labor) and F-10 (triple shock-cone duplication).
- `reports/field-trial-world/mystery_ledger_weeping_shelf.md` — the V-08/V-15 exemplar (template used correctly before its parent protocol was read).
- `reports/field-trial-world/propagation_report_SF1.md` — exhibits F-11 (severity field mislabel) and the stop-when-governed rule in use.
- `reports/field-trial-world/constraint_composition_cellar_banks.md` — the V-13 exemplar of `08` as a generative protocol.
- `reports/field-trial-world/contradiction_report_C1.md` — **exhibits F-12 and F-13/Q-06, the trial's most important structural finding** (the card-lifecycle gap: S2b superseded by S2b′ with no doctrine on where the corrected wording lives).
- `reports/field-trial-world/qa_regression_profile.md` — exhibits F-15 (no n/a convention) and Q-05 (tests 29–30 score the package, not the world).

**Primary (the package you are revising)** — all 56 files, in the package's own authority order. Per-file annotations flag where the trial's findings land:

Doctrine & primitives
- `docs/worldbuilding-system/README.md` — authority order, recommended-use flows, package map. **Top routing target:** the new-world path never routes `03` or `21` though both are required (F-01, F-16), never states whether `02` is required or enrichment (S-04), never routes `19` (S-05), and conflicts with `21` on whether seed capabilities need a change proposal (F-16/S-01) — trial rec 2.
- `docs/worldbuilding-system/01_core_theory.md` — the constitution: 12 laws, Causal Canon cycle, mode-aware smell tests, craft ceiling. Trial verdict V-02: reads as doctrine should; touch only if a fix demands it.
- `docs/worldbuilding-system/02_world_model.md` — conceptual primitives and relation verbs. The trial completed the entire pipeline without ever needing it (S-04); decide and state whether it is genuinely optional or under-routed.
- `docs/worldbuilding-system/03_truth_layers_and_canon_governance.md` — the governance spine (V-04: "the strongest document in the package"). Candidate home for the **card-lifecycle doctrine** (F-13/Q-06, trial rec 1) and source of content for the operating card (rec 5).
- `docs/worldbuilding-system/04_domain_atlas.md` — fourteen domains, triage, negative domains; trial-validated (V-11).

Core protocols
- `docs/worldbuilding-system/05_creation_protocol.md` — **kernel-definition mismatch** (F-04, rec 4): Phase 1's nine-item kernel list disagrees with `templates/world_kernel.md` (no "Starting scale"/"Primary pressures" in the template; "Ordinary-life anchor" person exists only here and silently drops out of the instrument chain); also the audit-placement ambiguity (F-05) and the missing decomposition granularity rule (Q-02, rec 7).
- `docs/worldbuilding-system/06_canon_fact_admission_protocol.md` — the other candidate home for card-lifecycle doctrine (rec 1); needs the fact-card/capability-card division-of-labor sentence (F-07), the batch-admission pattern (F-08, rec 3), the shock-cone master-record sentence (F-10), and an admission station or explicit disposal for aesthetic promises (Q-03). Its severity two-scale mapping is trial-validated (V-06) — keep it.
- `docs/worldbuilding-system/07_propagation_engine.md` — mechanisms, branch types, stop-when-governed rule: all trial-validated (V-09/V-10); co-owner of the shock-cone duplication fix (F-10).
- `docs/worldbuilding-system/08_constraint_composition.md` — trial-validated as generative (V-13/V-14); no findings against it.
- `docs/worldbuilding-system/09`–`12` — temporal, spatial, agent, institutional/economic/suppression protocols. Sampled-not-run by the trial (S-03); no findings; **institutional hard edge in `12` preserved undiminished**.
- `docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md` — repair operations (plural-operation gap, F-12), the weak-mystery "author has not decided" vs. deliberate-undecidedness clause (Q-04), and the trial-validated opacity machinery (V-15/V-16).
- `docs/worldbuilding-system/14`–`17` — uncertainty, branching, extraction, aesthetics. Out of trial scope (S-03/S-06); no findings; `17` is where "genre mode" is presumably defined (F-02 asks for a gloss on the kernel template pointing to it — verify).

Quality, examples, workflow, reference
- `docs/worldbuilding-system/18_quality_assurance_tests.md` — scorecard fixes: n/a convention (F-15), tests 29–30 moved to a package-self-audit subsection (Q-05); anchors trial-validated (V-17/V-18/V-19).
- `docs/worldbuilding-system/19_worked_examples.md` — trial rec 6 (refined): Example A already covers the *causal* lifecycle; what is missing is the **records-side** lifecycle example (which instruments get filled at each step; what a fact card looks like before and after a repair supersedes part of it). The Saltmarrow artifacts are a ready-made draft. Also: route the paths to this file (S-05).
- `docs/worldbuilding-system/20_ai_assisted_workflow.md` — untouched by trial findings; AI-is-never-canon-authority doctrine stays intact.
- `docs/worldbuilding-system/21_templates_index.md` — the traceability matrix and "lightest instrument that catches the danger" doctrine that F-16 found *too late*; resolve its change-proposal conflict with the README one way or the other (rec 2) and route it from the new-world path.
- `docs/worldbuilding-system/22_glossary.md` — update for any vocabulary your fixes add or change.
- `docs/worldbuilding-system/23_research_notes_and_bibliography.md` — research roots and translation rules; cite here for any research-shaped change (§5).
- `docs/worldbuilding-system/manifest.json` — file inventory and version marker; ends the pass at 0.8 with the final file set.

Instruments — checklists (human sweeps, each wired to a parent protocol; read all 12):
- `frontloaded_seed_audit.md` — timing note + "initial status = proposed" clarification (F-05, F-06); its latency question is trial-validated (V-05).
- `canon_fact_gate.md` — "operation(s), primary first" plural fix (F-09); the gate itself is trial-validated (V-07).
- `propagation_sweep.md` — shock-cone duplication co-owner (F-10); its contradiction check is trial-validated (V-12).
- `mystery_preservation.md` — correctly never triggered in the trial (S-02); no change expected.
- the other eight (`constraint_composition_sweep`, `temporal_timeline_sweep`, `spatial_geographic_sweep`, `agent_character_sweep`, `institutional_economic_suppression_sweep`, `uncertainty_evidence_sweep`, `branching_collaboration_sweep`, `aesthetic_coherence_sweep`) — no trial findings; read for wiring consistency with whatever you change.

Instruments — templates (human record cards, not schemas; read all 18):
- `world_kernel.md` — genre-mode vs. consequence-mode gloss (F-02); ill-fitting change-scoped "Minimum completion" boilerplate (F-03); reconcile with `05` Phase 1 (F-04); optionally cross-reference the thin-start rule (Q-01, resolved-minor).
- `canon_fact_card.md` + `capability_card.md` — division-of-labor sentence (F-07); the one-fact-per-card rule vs. minor-seed batch admission (F-08); shock-cone digest-or-pointer sentence (F-10); **the card-lifecycle doctrine must reach these cards** (F-13: living present-tense record, history section, reports as audit trail).
- `contradiction_report.md` — "Repair operation(s), primary first" (F-12); the supersession handoff to card upkeep (F-13).
- `propagation_report.md` — rename the mislabeled "Severity level" field to the work scale it actually offers (F-11).
- `mystery_ledger_entry.md` — trial-validated as "the best instrument in the package" (V-08/V-15); do not degrade it.
- `canon_change_proposal.md` — subject of the README-vs-`21` conflict (F-16/S-01).
- the remaining 12 (`constraint_card`, `institution_card`, `counter_institution_card`, `action_arena_card`, `temporal_timeline_card`, `spatial_region_card`, `agent_character_card`, `uncertainty_evidence_card`, `canon_branch_diff`, `collaboration_decision_record`, `aesthetic_coherence_card`, plus any your fixes touch) — no trial findings; read for boilerplate consistency (the shared "Minimum completion" block F-03 flags is described as shared across templates).

**Boundary-awareness (read to bound scope, not a conformance or editing target):**
- `README.md` (repository root) — one-line repo identity ("a web app to create and maintain fictional worlds"). The downstream web app is out of scope; do not edit it, and do not let web-app framing leak into the methodology.

Nothing else in the repository (`.claude/`, `docs/agents/`, the older files in `reports/`, `CLAUDE.md`) is part of this task; do not edit any of it except the single new report named in §7C. `reports/eighth-iteration-field-trial.md`, `reports/eighth-iteration-outlook.md`, and `reports/field-trial-world/**` are **read-only evidence** — never edit them.

## 3. Settled intentions

These decisions are final. Lines marked `assumption:` were resolved by the brief author's judgment when the user was unavailable — treat them as defaults the user could have overridden, and honor them unless the user has said otherwise in your session.

1. **The trial log is the work order — this is an evidence-bounded pass, not another self-derived diagnosis.** Your primary work-list is the trial's eight ranked recommendations and the F/Q/S ledgers behind them. The user has authorized you to **radically alter the package — delete, merge, correct, or add documents — where the trial's evidence warrants it**; the trial's own verdict is that nothing suggests an overhaul and almost every friction is "fixable with sentences, not sections," so let the evidence set the blast radius, not ambition. You may fix a defect you discover yourself while implementing (with the discovery argued in the changelog), but do not open new self-derived improvement fronts: iteration 7's outlook already established that document-editing beyond what evidence demands has hit diminishing returns.
2. **You may deviate from a recommendation's *proposed fix* but not from its *finding*.** The recommendations are the trial steward's repair proposals; the ledger entries are the evidence. Every F, Q, and S-04/S-05 item must receive an explicit disposition (fixed this way / fixed differently because… / deliberately declined because…) recorded in `00_overhaul_notes.md`. Honor the trial's explicit deprioritizations: rec 8 drops severity-scale unification (V-06 shows the mapping already works — only the F-11 field label needs fixing) and deprioritizes deeper reinforcement-tail weaving (no trial evidence of need).
3. **Structural additions are authorized where the log demands them — the high bar is now met by evidence.** Iterations 3–7 kept the 56-file layout because nothing justified changing it; the trial supplies justification for specific additions: a **one-page operating card** (rec 5: new-world path with all real dependencies + label-separation table + severity map + minimal-use paths — content already in `03`/`21`/`06`), a **batch-admission instrument or blessed pattern** (rec 3: the trial's improvised admission-ledger table, either as a tiny template or as sentences in `06`), and a **records-lifecycle worked example** (rec 6: in `19` or adjacent). Whether each becomes a new file or lives inside an existing one is your call — apply `21`'s own "lightest instrument that catches the danger" doctrine to the package itself. Deletions/merges remain available but nothing in the trial calls for one; the no-downgrade constraint (§3.5) governs.
4. **Trial-world content may be adapted in, never linked out.** The Saltmarrow artifacts are ready-made raw material (especially for the records-lifecycle example and the batch-admission pattern), and you may rewrite/incorporate their content into package files. But the package is self-contained and storage-agnostic: **no package file may cite a `reports/…` path** or otherwise depend on this repository's layout. Adapt the substance; credit, if any, belongs in `00_overhaul_notes.md`.
5. **No-downgrade is the overriding constraint — now including the trial-validated strengths.** Anything deleted or merged away must be demonstrably preserved elsewhere or shown genuinely redundant or incorrect. Beyond the inherited protected set (the 12 operating laws, truth-layer order, the status/tag/admission-operation/repair-operation/consequence-mode/preservation-boundary separations, shock-cone propagation, mode-aware consequence doctrine, the institutional hard edge, protected-effect machinery, calibrated QA anchors, the non-naturalistic worked cases and smell banks), this pass additionally protects what the trial *proved works*: the V-ledger names them — the README's step-by-step path shape (V-01), `01`'s stopping rules (V-02), the kernel template's non-naturalistic prompt (V-03), `03`'s tables (V-04), the audit's latency question (V-05), the severity mapping (V-06), the gate's contradiction-risk box (V-07), the mystery ledger (V-08, V-15, V-16), propagation mechanisms and stop-when-governed (V-09, V-10), domain triage (V-11), the sweep's contradiction check (V-12), `08`'s composition machinery (V-13), the admission/repair jurisdiction boundary (V-14), and the QA anchors and red-team prompts (V-17–V-19). Repairs must not destabilize these; when a fix touches one, the validated behavior is the acceptance test.
6. **The package stays downstream-agnostic.** No Markdown/database/graph-engine/web-app/API/LLM coupling — even though the hosting repo is a web app and you are an AI. This is a negative settled intention: do not re-open it. §3.4's no-`reports/`-paths rule is part of it.
7. **Single-changelog discipline — do not re-stratify.** Iteration 7 spent its pass removing version-tagged sediment. Your fixes must be woven in timelessly ("The fact card is a living record…"), never appended as "Iteration 8 adds…" strata; iteration history lives only in `00_overhaul_notes.md`. The only current-version markers are the package `README.md`, `manifest.json`, and `00`.
8. **`assumption:` Version bumps to `0.8`, iteration 8.** Update `manifest.json`, the package `README.md`, and `00_overhaul_notes.md` accordingly. Do not graduate to `1.0` even though the field trial satisfies the outlook's hardest readiness criterion — re-score the four criteria in your outlook (§7C) and leave the 1.0 call to the user.
9. **`assumption:` Leave all changes uncommitted.** Do not run `git commit`. The user reviews the working tree and commits themselves, as they did for every prior iteration.
10. **`assumption:` The closing report is `reports/ninth-iteration-outlook.md`** — continuing the lineage convention where the outlook filename names the *next* iteration it informs (iteration 7 wrote `eighth-iteration-outlook.md`). The user asked for "a report indicating the warnings and weaknesses of the new eighth iteration of changes"; that is exactly what this file's first section is (see §7C). The user can rename on receipt.

## 4. The task

Perform the **eighth iteration** of the Causal Canon Worldbuilding System: a **field-trial-driven repair pass** (target type: foundational / doc-overhaul, evidence-bounded), executed directly on the repository files. Read the trial log, the outlook, and the full package (§2); triage every F/Q/S finding and the eight recommendations into a disposition plan; research online where it sharpens a fix (§5); then make the changes the evidence demands — routing repairs, the card-lifecycle doctrine, the batch-admission pattern, kernel reconciliation, the operating card, the records-lifecycle example, and the small template fixes — while losing no valid content (§3.5) and keeping the methodology fully downstream-agnostic (§3.6). Rewrite `00_overhaul_notes.md` and `manifest.json` as the iteration-8 stewardship record with honest local-session provenance and a complete finding→disposition mapping. Finally, deliver the ninth-iteration outlook (§7C): the warnings and weaknesses of the eighth iteration you just finished, a convergence re-assessment, and a reasoned verdict on whether a ninth iteration is warranted and of what shape.

## 5. Exploration + online-research mandate

Explore the repository as deeply as needed beyond the files listed above. Research online as deeply as needed — the user has explicitly authorized deep research "for whatever is necessary." Lanes this pass plausibly opens: records-management and single-source-of-truth practice for the card-lifecycle doctrine (F-13 — how living records, supersession history, and immutable audit trails are handled in documentation/records disciplines); quick-reference / job-aid design for the one-page operating card (rec 5); checklist and form design for the small instrument fixes; anything the package's existing research lanes in `23` already cover. Cite sources in `23_research_notes_and_bibliography.md` (and the overhaul notes' research rationale) for any external claim that shapes a change; keep external research in a lane separate from repository evidence; if a fix needs no research, do not cite for decoration — `23`'s own translation rules forbid it.

## 6. Doctrine & constraints

Honor these, all derived from the package's own established doctrine and the settled intentions above:

- **Authority flows downward.** `01`/`03` govern everything below; `02`/`04` provide primitives; protocols `05`–`17` turn doctrine into craft; `18`–`23` provide quality control and reference; `checklists/` and `templates/` operationalize the protocols. A lower-tier change that contradicts a higher tier requires amending the higher tier deliberately and visibly — argued in `00_overhaul_notes.md` — never silently. Several trial fixes are *instrument-tier* repairs of *protocol-tier* ambiguity (F-04, F-16): decide at which tier the single source of truth lives, fix it there, and make the other tier defer.
- **Every substantive change traces to a logged trial finding** (an F/Q/S item or ranked recommendation) **or to a defect you discovered and argued in the changelog.** No unprompted improvement fronts (§3.1).
- **The separations stay crisp:** canon status / constraint tag / admission decision operation / repair operation / consequence mode / preservation boundary. The trial scored vocabulary separation 3/3 and called it a converted historic weakness — do not re-blur it. Note that two trial fixes touch it directly: the plural-operations fix (F-09/F-12) must permit composed operations *without* blurring the admission/repair jurisdiction boundary the trial validated (V-14), and the card-lifecycle doctrine (F-13) must be built from `03`'s existing statuses (superseded, deprecated), not new vocabulary, unless the glossary is updated in lockstep.
- **Instruments stay wired to parent protocols.** Every checklist and template keeps its parent-protocol note, completion rule, and red flags; `21`'s traceability matrix must match the actual instrument set after your changes — including any instrument you add. If an instrument contradicts a protocol, the protocol wins and the instrument is repaired.
- **Vocabulary stays authoritative and consistent** with `22_glossary.md`; update the glossary and every use site for anything you add or rename.
- **Instruments are human thinking tools, not implementation instructions** — templates are record cards, not schemas. The batch-admission instrument (rec 3), if you create it, must be framed this way too.
- **Consequence doctrine stays mode-aware, and the institutional edge stays hard.** No fix may dilute either.
- **Agnosticism guard** (§3.6): no storage/software/API/web-app/LLM coupling introduced anywhere; no `reports/` paths cited in package files (§3.4).
- **No re-stratification** (§3.7): fixes woven in timelessly; history only in `00`.

## 7. Deliverable specification

Three things. A and B are in-place edits; C is one new file outside the package.

**A. The revised package, edited in place** — `docs/worldbuilding-system/**` after your changes:
- every substantive change traceable per §6 and compliant with §3;
- any added file (operating card, batch-admission instrument, or other) justified against §3.3, wired into `21`'s matrix and the package `README.md`'s map, and consistent with the numbered-spine / `checklists/` / `templates/` layout;
- the README's recommended-use paths repaired per rec 2 (route `03` and `21`; state `02`'s status; route `19`; resolve the change-proposal conflict) so that a steward following the new-world path literally is never forced off-path — the trial measured this failure precisely;
- `manifest.json` — updated to the final file inventory, `version` `0.8`, `iteration` 8, date updated, local-session provenance.

**B. `docs/worldbuilding-system/00_overhaul_notes.md` — rewritten as the iteration-8 changelog:**
- honest local-session provenance: executor (Claude Code + your model), the HEAD actually worked from, direct file reads, edits uncommitted;
- the evidence base: the trial log as work order, with the **complete finding→disposition table** — every F-01…F-16 (no F-14 exists), Q-01…Q-06, S-01…S-06 item and every ranked recommendation, each marked fixed-as-proposed / fixed-differently-because / declined-because, with file pointers;
- a **fate mapping** covering every version-0.7 file (kept untouched / updated in place / renamed / split / merged / deleted) plus every added file;
- a **retention audit** proving no valid version-0.7 content was lost and the §3.5 trial-validated strengths survive;
- the research rationale with citations for any research-shaped change (or an explicit statement that none was needed).

**C. `reports/ninth-iteration-outlook.md` — new, outside the package** *(assumption: this filename; the user can rename on receipt)*, plus a closing chat message summarizing it. This is the report the user asked for — "the warnings and weaknesses of the new eighth iteration of changes." It must contain:
- the **warnings and weaknesses of the just-finished eighth iteration**: what you could not fix, what you fixed but are least confident in, findings you declined and why, fixes whose real test is the *next* field trial, coverage gaps (the trial sampled one specialized pass — `09`–`12`, `14`–`17` remain field-untested), agnosticism risks, and any tension your fixes created — each with reasoning;
- a **convergence re-assessment**: re-score the four "converged / 1.0-ready" criteria from `reports/eighth-iteration-outlook.md` §2 in light of the trial and your pass (the trial satisfies criterion 2 for the *paths it exercised*; the severity question of criterion 3 was answered by V-06; criterion 4's on-ramp is now evidence-shaped). State plainly what still blocks 1.0; the 1.0 call remains the user's;
- a clear, reasoned **verdict on whether a ninth iteration is warranted** — yes/no plus why, and if yes its highest-value shape (e.g., a second field trial exercising the untested specialized passes, or a multi-steward/collaboration trial). Since this outlook is written by the same session that did the work, be adversarial with yourself: the verdict must not be a self-grade inflated by effort spent.

**Do not commit** (§3.9). Leave the working tree for the user's review, and make the closing chat message a faithful summary of the outlook report plus a plain statement of what changed in the package.

**Locked / no-questions.** Do the work directly. Do not interview, do not ask clarifying questions — the requirements above are final. If a genuine contradiction makes a requirement impossible, state it in `00_overhaul_notes.md` and the outlook report and proceed with the most faithful interpretation.

## 8. Self-check (run against the working tree before your closing message)

- Every trial ledger item (F-01…F-13, F-15, F-16; Q-01…Q-06; S-01…S-06) and every ranked recommendation has an explicit disposition in `00_overhaul_notes.md`, with file pointers; every substantive change traces back to one of them or to an argued discovered defect.
- Every version-0.7 file's fate is accounted for in the mapping; every retained file preserves its load-bearing content; every §3.5 trial-validated strength (V-01…V-19) survives intact or strengthened; any deletion/merge is justified with its valid content preserved elsewhere.
- The README new-world path, followed literally, now routes every document and instrument it actually depends on — no unrouted-but-required reads remain, and the README-vs-`21` change-proposal conflict is resolved consistently in both files.
- The card-lifecycle doctrine exists, names where corrected wording lives and what the audit trail is, is consistent between `03`/`06` and the card templates, and answers Q-06 ("what is the canonical current-state of canon after repairs?") without new unglossaried vocabulary.
- No lower-tier change contradicts a higher tier; the six-way separation, the admission/repair jurisdiction boundary, the truth-layer order, and the mode-aware consequence doctrine remain intact and satisfiable; plural-operation fields do not blur which jurisdiction's operations they compose.
- Every checklist and template remains traceable to a parent protocol; `21`'s matrix and the package `README.md`'s map match the actual final file set, including any additions; `22_glossary.md` and all use sites are consistent.
- No storage/software/API/web-app/LLM coupling introduced; **no package file cites a `reports/…` path**; no "Iteration 8"-style strata in any doctrine/protocol/instrument file; the only current-version markers are `README.md`, `manifest.json`, `00_overhaul_notes.md`.
- `manifest.json` lists exactly the final file set at `version` `0.8`, `iteration` 8, with local-session provenance and no stale commit strings.
- `reports/ninth-iteration-outlook.md` exists with the eighth iteration's warnings/weaknesses, the four-criteria convergence re-score, and an explicit ninth-iteration verdict; the closing chat message summarizes it faithfully.
- Every external claim that shaped a change is cited in `23` and the overhaul notes; if none, that is stated.
- Nothing outside `docs/worldbuilding-system/**` and `reports/ninth-iteration-outlook.md` was modified by this session (verify against your own edit log, not raw `git status` — surface, don't own, any concurrent changes); `reports/eighth-iteration-field-trial.md`, `reports/eighth-iteration-outlook.md`, and `reports/field-trial-world/**` are untouched; nothing was committed.
