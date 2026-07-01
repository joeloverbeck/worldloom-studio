# Research brief — Causal Canon Worldbuilding System, iteration 7

*This brief is the complete instruction set for the session that will perform the seventh iteration. Unlike iterations 1–6, the executor is **not** ChatGPT-Pro: you are a **Claude Code session running the Fable model, with direct read/write access to the repository working tree**. There is no manifest to upload and no URL fetching — you read the files with your own tools and edit them in place. You have none of the context in which this brief was authored; everything you need is in this brief plus the repository itself. Produce the work directly; do not interview or ask clarifying questions.*

---

## 1. Context

You are working inside the `joeloverbeck/worldloom-studio` repository — a web app to create and maintain fictional worlds from a continuity and causality perspective. The subject of this task is the repository's **Causal Canon Worldbuilding System**, a storage- and software-agnostic worldbuilding methodology living entirely under `docs/worldbuilding-system/**`. It is currently at **version 0.6** and comprises **56 files**: 24 numbered documents (`00`–`23`), a package `README.md`, a `manifest.json`, 12 `checklists/`, and 18 `templates/`.

**Baseline.** This brief was authored against commit `2b3e38a` (full SHA `2b3e38a1ff6be1c223f336bd4ecf81950066748f`, "Sixth iteration of worldbuilding system."), the repository HEAD on `main` at authoring time. Verify HEAD when you start (`git rev-parse HEAD`); if it has moved past `2b3e38a`, work from the live tree and note the divergence in your overhaul notes. You edit the working tree directly — the baseline pin exists so provenance is honest, not because you fetch anything from it.

**Lineage.** This is the **seventh iteration** of an iterated overhaul. Iterations 1–6 were performed by ChatGPT-Pro deep-research sessions from full replacement packages; iterations 3–6 were convergence/improvement passes that each deliberately kept the 56-file layout and improved content in place. The durable record of what the sixth iteration delivered is the package's own `docs/worldbuilding-system/00_overhaul_notes.md`, currently written for iteration 6 / version 0.6 — **treat it as the delta seed**. It records iteration 6's three resolved priorities: (A) non-naturalistic muscle memory — equal-weight non-naturalistic smell tests in `01`, mode-balance calibration and non-naturalistic anchors in `18`, and five non-naturalistic worked cases in `19` (fairy tale full; mythic, absurd-comic, dream-logic, and sacred/horror compact); (B) sacred-opacity adversarial hardening — the earned-sacred-opacity vs. sacred-opacity-cheat distinction with an opacity accountability test across `13`, `17`, `checklists/mystery_preservation.md`, `templates/mystery_ledger_entry.md`, and `22`; (C) point-of-use non-naturalistic micro-examples across protocols `05`–`17` and selected instruments.

**A known gap in the lineage.** The sixth iteration was also commissioned to deliver a standalone "seventh-iteration outlook" report (remaining weak points, convergence assessment, and a verdict on whether this seventh pass was warranted). That report was **never committed to the repository and is presumed lost**. You therefore do not have the sixth iteration's own residue list. This is why your priorities are self-derived (§3.6): your first job is a careful, independent analysis of the whole package.

**Provenance format note.** The current `00_overhaul_notes.md` and `manifest.json` carry ChatGPT-fetch-shaped provenance (raw-URL acquisition ledger, fetch-contamination checklist, `source_commit` of the *previous* baseline `8d6f0a8`). That format reflects the old remote-fetch workflow and does not fit a local session. When you rewrite them for iteration 7, replace that provenance with an honest local-session record: executor (Claude Code, Fable model), the HEAD you actually worked from, and direct-file-read acquisition. Do not carry forward the stale `8d6f0a8` source commit.

## 2. Read in full (authority order)

Read every file below, in this order, before changing anything. All 56 package files are load-bearing — you are stewarding all of them, whether or not you end up editing each one. Order follows the package's own authority tiers (doctrine → primitives → core protocols → extraction/quality/reference → changelog → inventory → instruments). Reasons describe the **version-0.6** state you are revising.

**Primary (the package you are revising):**

Doctrine & primitives
- `docs/worldbuilding-system/README.md` — package purpose, authority order, recommended-use flows, package map, operating stance; the top-of-package orientation (0.6: mode-aware consequence, protected effects, non-naturalistic breadth).
- `docs/worldbuilding-system/01_core_theory.md` — philosophy, the 12 operating laws, the Causal Canon cycle, consequence-mode doctrine, and (since 0.6) non-naturalistic smell tests at equal weight with institutional smell tests; the constitution everything else must satisfy.
- `docs/worldbuilding-system/02_world_model.md` — conceptual primitives and relation verbs (thinking tools, not schemas), including consequence mode, recurrence consequence, symbolic transformation, sacred opacity, symbolic excess.
- `docs/worldbuilding-system/03_truth_layers_and_canon_governance.md` — truth layers, canon statuses, constraint tags, admission decision operations, repair-operation boundary, preservation boundaries, governance roles; the governance spine.
- `docs/worldbuilding-system/04_domain_atlas.md` — the fourteen world domains facts ripple through, with 0.6 domain-triage reinforcement.

Core protocols
- `docs/worldbuilding-system/05_creation_protocol.md` — bootstrapping worlds without seed facts escaping propagation; consequence-mode declaration; 0.6 point-of-use micro-example.
- `docs/worldbuilding-system/06_canon_fact_admission_protocol.md` — fact gate, severity levels, admission change package, consequence-mode classification; 0.6 micro-example.
- `docs/worldbuilding-system/07_propagation_engine.md` — shock-cone propagation, mechanisms, branches, stopping rules, recurrence/symbolic-transformation mechanisms; 0.6 micro-example.
- `docs/worldbuilding-system/08_constraint_composition.md` — how limits combine, collide, leak, create pressures; preservation constraints for protected effects; 0.6 micro-example.
- `docs/worldbuilding-system/09_temporal_and_timeline_protocol.md` — timelines, eras, latency, residues, retcons, branch chronology, recurrence time; 0.6 micro-example.
- `docs/worldbuilding-system/10_spatial_and_geographic_propagation.md` — terrain, distance, settlement, infrastructure, regional variation, symbolic/sacred geography; 0.6 micro-example.
- `docs/worldbuilding-system/11_agent_character_psychology.md` — actors, identity, belief, incentives, memory, trauma, bounded agency, agency in non-naturalistic modes; 0.6 micro-example.
- `docs/worldbuilding-system/12_institutional_economic_and_suppression_protocol.md` — action arenas, rules-in-use, transaction costs, markets, black markets, suppression, counter-institutions. The system's institutional hard edge; **preserve its rigor undiminished** (§3.5).
- `docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md` — contradiction taxonomy, repair operations, retcon types, mystery governance, protected-effect preservation, and (0.6) earned sacred opacity vs. sacred-opacity cheat with paired adversarial examples.
- `docs/worldbuilding-system/14_uncertainty_belief_and_evidence.md` — confidence, source reliability, evidence, credence, disputed knowledge, belief ecology; uncertainty distinguished from protected opacity.
- `docs/worldbuilding-system/15_branching_versioning_and_collaboration.md` — branch canon, continuity diffs, human approval, disputes, merges, retirement, deprecation, guardianship roles.

Extraction, quality, workflow, reference
- `docs/worldbuilding-system/16_narrative_game_and_transmedia_extraction.md` — deriving story/game/medium pressure from world facts; mode-aware extraction; 0.6 micro-example.
- `docs/worldbuilding-system/17_aesthetic_coherence_and_semiosis.md` — tone, genre, mood, symbolism, semiotic propagation, protected aesthetic effects, and (0.6) the earned-sacred-opacity guard on the aesthetic side.
- `docs/worldbuilding-system/18_quality_assurance_tests.md` — the 0–3 scoring rubric, ~30 core tests, red-flag smells, regression profile, calibrated exemplar anchors, and (0.6) mode-balance calibration and non-naturalistic benchmark anchors.
- `docs/worldbuilding-system/19_worked_examples.md` — worked examples applying the protocols, including five non-naturalistic cases (fairy-tale "broken promises become birds" full; mythic, absurd-comic, dream-logic, sacred/horror compact).
- `docs/worldbuilding-system/20_ai_assisted_workflow.md` — AI as proposer/auditor/challenger, never canon authority. Note: this file governs AI use *inside a steward's worldbuilding practice*; the fact that you (an AI) are performing this overhaul does not change its doctrine.
- `docs/worldbuilding-system/21_templates_index.md` — how templates and checklists fit together; minimal paths and field discipline.
- `docs/worldbuilding-system/22_glossary.md` — authoritative shared vocabulary, including the 0.6 additions (earned sacred opacity, sacred-opacity cheat, opacity accountability test).
- `docs/worldbuilding-system/23_research_notes_and_bibliography.md` — research roots and translation rules, with 0.5 and 0.6 research additions distinguished (Propp; Burke, Kant, Otto, Bennett, Freud, Carroll, Windsor; Esslin; dream-work).

Changelog & inventory
- `docs/worldbuilding-system/00_overhaul_notes.md` — **the iteration-6 changelog, old-to-new mapping, retention audit, priority-resolution record, and research rationale; your primary delta seed** (see §1 for its provenance-format caveat).
- `docs/worldbuilding-system/manifest.json` — machine-readable file inventory and version marker (currently `0.6`, `file_count` 56, stale `source_commit`).

Instruments — checklists (human sweeps; each wired to a parent protocol)
- `docs/worldbuilding-system/checklists/frontloaded_seed_audit.md`
- `docs/worldbuilding-system/checklists/canon_fact_gate.md`
- `docs/worldbuilding-system/checklists/propagation_sweep.md`
- `docs/worldbuilding-system/checklists/constraint_composition_sweep.md`
- `docs/worldbuilding-system/checklists/temporal_timeline_sweep.md`
- `docs/worldbuilding-system/checklists/spatial_geographic_sweep.md`
- `docs/worldbuilding-system/checklists/agent_character_sweep.md`
- `docs/worldbuilding-system/checklists/institutional_economic_suppression_sweep.md` — institutional rigor retained; **do not weaken** (§3.5).
- `docs/worldbuilding-system/checklists/uncertainty_evidence_sweep.md`
- `docs/worldbuilding-system/checklists/branching_collaboration_sweep.md`
- `docs/worldbuilding-system/checklists/mystery_preservation.md` — carries the 0.6 opacity accountability check.
- `docs/worldbuilding-system/checklists/aesthetic_coherence_sweep.md`

Instruments — templates (human record cards; not database schemas)
- `docs/worldbuilding-system/templates/world_kernel.md`
- `docs/worldbuilding-system/templates/canon_fact_card.md`
- `docs/worldbuilding-system/templates/canon_change_proposal.md`
- `docs/worldbuilding-system/templates/capability_card.md`
- `docs/worldbuilding-system/templates/constraint_card.md`
- `docs/worldbuilding-system/templates/propagation_report.md`
- `docs/worldbuilding-system/templates/temporal_timeline_card.md`
- `docs/worldbuilding-system/templates/spatial_region_card.md`
- `docs/worldbuilding-system/templates/agent_character_card.md`
- `docs/worldbuilding-system/templates/action_arena_card.md`
- `docs/worldbuilding-system/templates/institution_card.md`
- `docs/worldbuilding-system/templates/counter_institution_card.md`
- `docs/worldbuilding-system/templates/contradiction_report.md`
- `docs/worldbuilding-system/templates/mystery_ledger_entry.md` — carries the 0.6 opacity accountability field.
- `docs/worldbuilding-system/templates/uncertainty_evidence_card.md`
- `docs/worldbuilding-system/templates/canon_branch_diff.md`
- `docs/worldbuilding-system/templates/collaboration_decision_record.md`
- `docs/worldbuilding-system/templates/aesthetic_coherence_card.md`

**Boundary-awareness (read to bound scope, not a conformance or editing target):**
- `README.md` (repository root) — one-line repo identity ("a web app to create and maintain fictional worlds"). Read it only to understand the *downstream* product the methodology feeds. It is **out of scope**: do not edit it, and do not let the web-app framing leak into the methodology (§3.4, §6).

Nothing else in the repository (`.claude/`, `.agents/`, `docs/agents/`, `reports/`, `AGENTS.md`, `CLAUDE.md`) is part of this task; do not edit any of it except the single new report named in §7C.

## 3. Settled intentions

These decisions are final. Lines marked `assumption:` were resolved by the brief author's judgment when the user was unavailable — treat them as defaults the user could have overridden, and honor them unless the user has said otherwise in your session.

1. **You edit the package in place — there is no replacement package to emit.** Unlike iterations 1–6, there is no "deliverable document set": you change the files of `docs/worldbuilding-system/**` directly with your editing tools. A file you do not need to change stays untouched (do not churn version markers through files you made no substantive change to — but files whose content presents itself as current-version-marked, plus `README.md`, `manifest.json`, and `00_overhaul_notes.md`, must end the pass consistent with §3.7).
2. **Structural change is authorized, but the bar is high — prefer improving in place.** You may remove, merge, split, rename, correct, and add documents, but only when truly warranted: the restructure must make the system materially clearer, more coherent, or more complete, and no valid content may be lost. Iterations 3–6 all concluded that every file remained load-bearing and kept the 56-file layout. That is a strong prior, not a prohibition — if your analysis finds a genuine architectural problem, fix it; if not, keep file identity.
3. **No-downgrade is the overriding constraint.** Be extremely careful not to lose valid information from the version-0.6 documents. Anything deleted or merged away must be demonstrably preserved elsewhere or shown to be genuinely redundant or incorrect. Everything iteration 6 delivered (the five non-naturalistic worked cases, the rebalanced smell tests and QA anchors, the earned-sacred-opacity guard and its vocabulary, the point-of-use micro-examples) and everything it inherited (the 12 operating laws, truth-layer order, the status/tag/decision-operation/repair-operation/preservation-boundary separations, shock-cone propagation, calibrated QA anchors, the institutional hard edge, the protected-effect machinery, the worked examples) is protected. When in doubt, keep. Record the pass's fate-of-every-file mapping and retention audit in the rewritten `00_overhaul_notes.md`.
4. **The system stays downstream-agnostic.** The methodology must not assume Markdown, a database, a graph engine, a web app, an API, or an LLM-based workflow — even though the hosting repository is a web app, and even though *you* are an AI editing it. This is a negative settled intention: do not re-open it, do not "modernize" the docs toward the product, and treat any coupling you would introduce as a defect.
5. **Preserve the load-bearing doctrine — including the institutional hard edge.** The consequence-first constitution, the operating laws, the governance separations, the mode-aware consequence doctrine, and the institutional/economic/suppression rigor may be sharpened, re-homed, or better explained, but not weakened or silently dropped. If your analysis convinces you a load-bearing element is actually *wrong*, you may correct it — you have a correction license this pass — but the correction must be explicit, argued in `00_overhaul_notes.md`, and flagged in the outlook report (§7C), never silent.
6. **`assumption:` Your priorities are self-derived.** The sixth iteration's outlook report (which would have named the residues this pass should target) was never committed and is presumed lost. You must therefore perform your own careful, independent analysis of all 56 files first — coherence, drift, redundancy, contradiction between tiers, instrument wiring, glossary consistency, doctrine gaps, over- or under-weighted areas, usability friction — and decide for yourself what the seventh iteration should fix. Analysis precedes editing; do not start changing files until you have read the whole package and formed a prioritized view.
7. **`assumption:` Version bumps to `0.7`.** Update `manifest.json`, the package `README.md`, `00_overhaul_notes.md`, and in-file current-version markers accordingly. Do not graduate to `1.0` — even if you judge the system converged, say so in the outlook report and let the user make the 1.0 call.
8. **`assumption:` The closing verdict is a durable file plus a chat summary** — see §7C. The sixth iteration's verdict was lost because it lived only in a ChatGPT session; this one is written to `reports/eighth-iteration-outlook.md` so the lineage survives.
9. **`assumption:` Leave all changes uncommitted.** Do not run `git commit`. The user reviews the working tree and commits themselves, as they did for iterations 1–6.

## 4. The task

Perform a **seventh-iteration doc-overhaul** of the Causal Canon Worldbuilding System, executed directly on the repository files. Read the entire version-0.6 package closely (§2); form your own prioritized diagnosis of its weaknesses, since no external residue list survives (§3.6); research online where it sharpens a decision (§5); then make the changes you consider necessary — corrections, strengthening, merging, removal, or addition of documents where truly warranted (§3.2) — while losing no valid content (§3.3) and keeping the methodology fully downstream-agnostic (§3.4). Rewrite `00_overhaul_notes.md` and `manifest.json` as the iteration-7 stewardship record with honest local-session provenance (§1). Finally, deliver the eighth-iteration outlook (§7C): the warnings and weaknesses of the seventh iteration you just finished, a convergence assessment, and a reasoned verdict on whether an eighth iteration is warranted.

## 5. Exploration + online-research mandate

Explore the repository as deeply as needed beyond the files listed above. Research online as deeply as needed — worldbuilding and continuity craft, narrative theory, the package's existing research lanes (institutional economics, diffusion, semiotics, belief revision, folktale morphology, aesthetics of the sublime/sacred/horror), or any new lane your diagnosis opens — wherever it sharpens a change. Cite sources in `23_research_notes_and_bibliography.md` (and the overhaul notes' research rationale) for any external claim that shapes a change. Keep external research in a lane separate from repository evidence: never use a web source to assert what the repository contains. If you make no research-shaped changes, say so in the overhaul notes rather than citing for decoration.

## 6. Doctrine & constraints

Honor these, all derived from the package's own established doctrine:

- **Authority flows downward.** `01_core_theory.md` and `03_truth_layers_and_canon_governance.md` govern everything below; `02`/`04` provide primitives; protocols `05`–`17` turn doctrine into craft; `18`–`23` provide quality control and reference; `checklists/` and `templates/` operationalize the protocols. A lower-tier change that contradicts a higher tier requires amending the higher tier deliberately and visibly — never designing against it silently. Keep the tiers coherent after every change.
- **The 12 operating laws, the truth-layer order, and the mode-aware consequence doctrine are load-bearing** and must remain satisfiable by every protocol, checklist, and template.
- **Separations stay crisp:** canon *status* vs. constraint *tag* vs. admission *decision operation* vs. *repair operation* vs. *preservation boundary* vs. *consequence mode*. Iterations 3–6 spent effort reconciling these; do not re-blur them.
- **Instruments stay wired to parent protocols.** Every checklist and template must remain traceable to the protocol it operationalizes, keeping its parent-protocol note, completion rule, and red flags. If an instrument contradicts a protocol, the protocol wins and the instrument is repaired.
- **Vocabulary stays authoritative and consistent** with `22_glossary.md`; if you add, rename, or remove terms, update the glossary and every use site. Do not regress standardized terms or the protected-effect vocabulary (mystery, wonder/awe/sublimity, sacred opacity, horror/terror/dread, symbolic excess, earned sacred opacity, sacred-opacity cheat, opacity accountability test).
- **Instruments are human thinking tools, not implementation instructions** — templates are record cards, not schemas; preserve that framing.
- **Consequence doctrine stays mode-aware, and the institutional edge stays hard.** Non-naturalistic and institutional rigor are both fully available and fully rigorous; strengthening one must not dilute the other.
- **Agnosticism guard** (§3.4): no storage/software/API/web-app/LLM coupling introduced anywhere.
- **High-bar restructure guard** (§3.2): keep file identity unless a restructure clears the no-downgrade threshold with explicit justification recorded in `00_overhaul_notes.md`.

## 7. Deliverable specification

Three things. A and B are in-place edits; C is one new file outside the package.

**A. The revised package, edited in place** — `docs/worldbuilding-system/**` after your changes:
- Every substantive change justified by your own diagnosis (§3.6) and compliant with §3 and §6.
- Any removed, merged, renamed, split, or added file justified against the §3.2 high bar, with its valid content demonstrably preserved.
- `manifest.json` — updated to the final file inventory, `version` `0.7`, `iteration` 7, date updated, provenance rewritten per §1 (no stale `source_commit`).

**B. `docs/worldbuilding-system/00_overhaul_notes.md` — rewritten for iteration 7:**
- honest local-session provenance (§1): executor Claude Code / Fable model, the HEAD actually worked from, direct file reads, no URL ledger;
- your **diagnosis**: the prioritized weaknesses your analysis found and why they were the right targets;
- a complete **fate mapping** covering every version-0.6 file (kept untouched / updated in place / renamed / split / merged / deleted / added) — a compact table row per file is enough for untouched files;
- a **retention audit** proving no valid version-0.6 content was lost;
- the research rationale with citations for any research-shaped change (or an explicit statement that none was needed).

**C. `reports/eighth-iteration-outlook.md` — new, outside the package** *(assumption: this filename; the user can rename on receipt)*, plus a closing chat message summarizing it. It must contain:
- the **warnings and weaknesses of the just-finished seventh iteration**: what you could not fix, what you fixed but are least confident in, coverage gaps, unresolved tensions, places doctrine may still be wrong or untested, agnosticism risks, usability friction — each with reasoning;
- a **convergence assessment**: after seven iterations (four of them convergence passes), is the system approaching a stable/"done" state? What would "converged / 1.0-ready" look like, and what still blocks it?
- a clear, reasoned **verdict on whether an eighth iteration is warranted** — yes/no plus why, and if yes, the highest-value focus of an eighth pass. Since this outlook is written by the same session that did the work, be adversarial with yourself: the verdict must not be a self-grade inflated by effort spent.

**Do not commit** (§3.9). Leave the working tree for the user's review, and make the closing chat message a faithful summary of the outlook report plus a plain statement of what changed in the package.

**Locked / no-questions.** Do the work directly. Do not interview, do not ask clarifying questions — the requirements above are final. If a genuine contradiction makes a requirement impossible, state it in `00_overhaul_notes.md` and the outlook report and proceed with the most faithful interpretation.

## 8. Self-check (run against the working tree before your closing message)

- Every version-0.6 file's fate is accounted for in the `00_overhaul_notes.md` mapping; every retained file preserves its load-bearing content (including all iteration-6 additions); every deletion/merge is justified with its valid content preserved elsewhere (no downgrade).
- Analysis preceded editing: the overhaul notes' diagnosis reads as the reason for the changes, not a rationalization after them.
- No lower-tier change contradicts a higher tier; the operating laws, truth-layer order, consequence-mode doctrine, and the status/tag/decision/repair/preservation-boundary separations remain intact and satisfiable; any deliberate correction to load-bearing doctrine is argued explicitly, not silent.
- Every checklist and template remains traceable to a parent protocol with its completion-rule/red-flag structure; `21_templates_index.md` still matches the actual instrument set; `22_glossary.md` and all use sites are consistent after any addition/rename/removal.
- No storage/software/API/web-app/LLM coupling was introduced anywhere; agnostic framing is intact or strengthened.
- `manifest.json` lists exactly the final file set at `version 0.7`, `iteration` 7, with local-session provenance; the package `README.md`'s package map matches the actual files; no stale `0.6`-as-current or `8d6f0a8` provenance markers remain in files you touched.
- `reports/eighth-iteration-outlook.md` exists with weaknesses/warnings, a convergence assessment, and an explicit eighth-iteration verdict; the closing chat message summarizes it faithfully.
- Every external claim that shaped a change is cited in `23_research_notes_and_bibliography.md` and the overhaul notes; if none, that is stated.
- Nothing outside `docs/worldbuilding-system/**` and `reports/eighth-iteration-outlook.md` was modified; nothing was committed.
