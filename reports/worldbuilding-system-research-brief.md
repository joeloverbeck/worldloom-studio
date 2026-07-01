# Research brief — Causal Canon Worldbuilding System, iteration 5

*Paste this entire prompt into a fresh ChatGPT-Pro deep-research session and upload the manifest named in §1. You (Session 2) have none of the context in which this brief was authored — everything you need is in this prompt plus the uploaded manifest. Produce the deliverables directly; do not interview or ask clarifying questions.*

---

## 1. Context

The uploaded manifest (`manifest_2026-07-01_2244966.txt`) is the exact path inventory of the `joeloverbeck/worldloom-studio` repository — a web app to create and maintain fictional worlds from a continuity and causality perspective. The subject of this task is the repository's **Causal Canon Worldbuilding System**, a storage- and software-agnostic worldbuilding methodology living entirely under `docs/worldbuilding-system/**`. It is currently at **version 0.4** and comprises **56 files**: 24 numbered documents (`00`–`23`), a package `README.md`, a `manifest.json`, 12 `checklists/`, and 18 `templates/`.

**Fetch every file from commit `2244966` (full SHA `224496657616c6f25c0c207df9862d7e1445a04e`).** This is the repository's current `HEAD` on `main` — the commit that landed the "Fourth iteration of the worldbuilding system." The uploaded manifest reflects exactly that tree.

**Baseline-divergence warning (read before fetching).** The package's own `docs/worldbuilding-system/manifest.json` and `docs/worldbuilding-system/00_overhaul_notes.md` record their baseline commit as `a27ab313fff16a2953ffb97b7810a7b20dfce652` and explicitly state the freshness is "user-supplied target commit only; not independently verified as latest main." That `a27ab31` is the **iteration-3 merge commit** — the baseline the *iteration-4* overhaul was authored *against* — and it predates the iteration-4 content you are now revising (the iteration-4 changes were committed *on top of* `a27ab31` as `2244966`). **Do not fetch from `a27ab31`.** Use `2244966`, the verified current HEAD, for every file. When you cite a repository path, cite the `2244966` version.

**Lineage.** This is the **fifth iteration** of an iterated overhaul. The four prior passes progressively built and then converged the package; iterations 3 and 4 were explicitly *convergence* passes that fixed drift and traceability but deliberately declined to restructure the file layout (iteration 4 kept all 56 files, changing content in place). The durable record of what the previous (fourth) iteration delivered is the package's own `00_overhaul_notes.md` — **treat it as the delta seed**: it tells you what iteration 4 changed, what it deliberately kept, its old-to-new mapping, and its retention audit. Your job is the *next* improvement pass over the iteration-4 package, not a cold-start rebuild. There is no separate predecessor research brief to read; the in-package changelog is the lineage anchor.

## 2. Read in full (authority order)

Read every file below, in this order, before producing anything. The package replaces all of itself, so all 56 package files are load-bearing. Order follows the package's own authority tiers (doctrine → primitives → core protocols → extraction/quality/reference → changelog → inventory → instruments).

**Primary (the package you are replacing):**

Doctrine & primitives
- `docs/worldbuilding-system/README.md` — package purpose, recommended-use flows, package map, operating stance; the top-of-package orientation.
- `docs/worldbuilding-system/01_core_theory.md` — philosophy, the 12 operating laws, the Causal Canon cycle, the strong-worldbuilding **smell tests**, and the limits/anti-over-simulation guardrails; the constitution everything else must satisfy. **Priority-A target (§3.7): its smell tests lean institutional.**
- `docs/worldbuilding-system/02_world_model.md` — conceptual primitives and relation verbs (thinking tools, not schemas).
- `docs/worldbuilding-system/03_truth_layers_and_canon_governance.md` — truth layers, canon statuses, constraint tags, admission decision operations, repair-operation boundary, governance roles; the governance spine.
- `docs/worldbuilding-system/04_domain_atlas.md` — the fourteen world domains facts ripple through.

Core protocols
- `docs/worldbuilding-system/05_creation_protocol.md` — bootstrapping worlds without seed facts escaping propagation.
- `docs/worldbuilding-system/06_canon_fact_admission_protocol.md` — fact gate, severity levels, admission change package.
- `docs/worldbuilding-system/07_propagation_engine.md` — shock-cone propagation, mechanisms, branches, stopping rules, propagation sweep.
- `docs/worldbuilding-system/08_constraint_composition.md` — how limits combine, collide, leak, create new pressures.
- `docs/worldbuilding-system/09_temporal_and_timeline_protocol.md` — timelines, eras, latency, residues, retcons, branch chronology.
- `docs/worldbuilding-system/10_spatial_and_geographic_propagation.md` — terrain, distance, settlement, infrastructure, regional variation, spatial diffusion.
- `docs/worldbuilding-system/11_agent_character_psychology.md` — actors, identity, belief, incentives, memory, trauma, bounded agency.
- `docs/worldbuilding-system/12_institutional_economic_and_suppression_protocol.md` — action arenas, rules-in-use, transaction costs, markets, black markets, suppression, counter-institutions.
- `docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md` — contradiction taxonomy, repair operations, retcon types, mystery ledger, mystery preservation. **Priority-B target (§3.8): mystery is treated as a puzzle-to-govern; wonder/awe/sacredness/horror/symbolic-excess are under-distinguished.**
- `docs/worldbuilding-system/14_uncertainty_belief_and_evidence.md` — confidence, source reliability, evidence, credence, disputed knowledge, belief ecology.
- `docs/worldbuilding-system/15_branching_versioning_and_collaboration.md` — branch canon, continuity diffs, human approval, disputes, merges, retirement, deprecation.

Extraction, quality, workflow, reference
- `docs/worldbuilding-system/16_narrative_game_and_transmedia_extraction.md` — deriving story/game/medium pressure from world facts.
- `docs/worldbuilding-system/17_aesthetic_coherence_and_semiosis.md` — tone, genre, mood, symbolism, language, aesthetic residue, Peircean icon/index/symbol semiosis. **Priority-B target (§3.8): symbolic transformation and non-instrumental wonder.**
- `docs/worldbuilding-system/18_quality_assurance_tests.md` — the 0–3 scoring rubric, ~30 core tests, red-flag smells, regression profile. **Priority-A and Priority-C target (§3.7, §3.9): smell tests lean institutional; the rubric lacks calibrated example answers.**
- `docs/worldbuilding-system/19_worked_examples.md` — worked examples applying the protocols. **Priority-A target (§3.7): needs ≥1 concrete non-naturalistic worked example.**
- `docs/worldbuilding-system/20_ai_assisted_workflow.md` — AI as proposer/auditor/challenger, never canon authority.
- `docs/worldbuilding-system/21_templates_index.md` — how templates and checklists fit together; minimal paths and field discipline.
- `docs/worldbuilding-system/22_glossary.md` — authoritative shared vocabulary.
- `docs/worldbuilding-system/23_research_notes_and_bibliography.md` — research roots and translation rules.

Changelog & inventory
- `docs/worldbuilding-system/00_overhaul_notes.md` — **the iteration-4 changelog, old-to-new mapping, retention audit, drift reconciliation, and research rationale; your primary delta seed** (see §1 for its baseline-commit caveat).
- `docs/worldbuilding-system/manifest.json` — machine-readable file inventory and version marker (currently `0.4`).

Instruments — checklists (human sweeps; each is wired to a parent protocol)
- `docs/worldbuilding-system/checklists/frontloaded_seed_audit.md`
- `docs/worldbuilding-system/checklists/canon_fact_gate.md`
- `docs/worldbuilding-system/checklists/propagation_sweep.md`
- `docs/worldbuilding-system/checklists/constraint_composition_sweep.md`
- `docs/worldbuilding-system/checklists/temporal_timeline_sweep.md`
- `docs/worldbuilding-system/checklists/spatial_geographic_sweep.md`
- `docs/worldbuilding-system/checklists/agent_character_sweep.md`
- `docs/worldbuilding-system/checklists/institutional_economic_suppression_sweep.md`
- `docs/worldbuilding-system/checklists/uncertainty_evidence_sweep.md`
- `docs/worldbuilding-system/checklists/branching_collaboration_sweep.md`
- `docs/worldbuilding-system/checklists/mystery_preservation.md` — **Priority-B target (§3.8): protects mysteries as puzzles, not wonder/sacred opacity.**
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
- `docs/worldbuilding-system/templates/mystery_ledger_entry.md` — **Priority-B target (§3.8): mystery-ledger fields assume a question awaiting an answer.**
- `docs/worldbuilding-system/templates/uncertainty_evidence_card.md`
- `docs/worldbuilding-system/templates/canon_branch_diff.md`
- `docs/worldbuilding-system/templates/collaboration_decision_record.md`
- `docs/worldbuilding-system/templates/aesthetic_coherence_card.md`

**Boundary-awareness (read to bound scope, not a conformance or replacement target):**
- `README.md` (repository root) — one-line repo identity ("a web app to create and maintain fictional worlds"). Read it only to understand the *downstream* product the methodology feeds. It is **out of scope**: do not replace it, and do not let the web-app framing leak into the methodology (see §3.4 and §6 on agnosticism).

## 3. Settled intentions

These decisions are final. They are the reason this session is locked — do not re-open them.

1. **Deliverable is a full replacement package.** Emit every file of `docs/worldbuilding-system/**` as a complete, drop-in replacement set — not a diff, not a changed-files-only subset. Every file the final package contains must be produced in full.
2. **Structural change is authorized, but the bar is high — prefer improving in place.** You *may* delete, merge, split, rename, correct, and add documents (numbered docs, checklists, and templates alike), but do so **only when you can justify that the restructure clears an explicit no-downgrade threshold** — i.e., it makes the system materially clearer, more coherent, or more complete, and no valid content is lost. The default is to improve content *inside* the existing files, matching iterations 3 and 4, which deliberately kept the file layout because every file remained load-bearing. This is a real license to fix genuine architectural problems (e.g., a new document is the cleanest home for the Priority-B wonder/mystery material in §3.8), **not** an invitation to churn structure for tidiness. When a restructure is not clearly warranted, keep the file identity and improve in place.
3. **No-downgrade is the overriding constraint.** Every structural change must be justified and mapped. Any content that is deleted or merged away must be demonstrably preserved elsewhere or shown to be genuinely redundant/incorrect. Produce an explicit **old-to-new mapping** and **retention audit** (in the updated `00_overhaul_notes.md`) covering every original file's fate. If a change would risk losing valid craft coverage, doctrine, worked examples, vocabulary, or research rationale, do not make it. Extreme care against downgrade outranks any tidiness or consolidation instinct. When in doubt, keep.
4. **The system stays downstream-agnostic.** The methodology must not assume Markdown, a database, a graph engine, a web app, an API, or an LLM-based workflow — even though the repository that hosts it is a web app. This is a *negative* settled intention: do not re-open it, do not "modernize" the docs toward the product, and treat any web-app/storage/API coupling you would introduce as a defect. Reinforce agnostic language; do not weaken it.
5. **Version bumps to `0.5`.** The package is currently `0.4`. This iteration is `0.5`: update `manifest.json`, `README.md`, `00_overhaul_notes.md`, and any in-file version markers accordingly. Do not graduate to `1.0`.
6. **Preserve the load-bearing doctrine.** The consequence-first constitution, the 12 operating laws, the truth-layer order, shock-cone propagation, and the canon-status / constraint-tag / admission-decision-operation / repair-operation separations are load-bearing. They may be sharpened, re-homed, or better explained, but not weakened or silently dropped. If research convinces you a load-bearing element is actually wrong, flag it explicitly in the standalone assessment report (§7B) rather than quietly removing it.

**The three priority focus areas.** These are the substantive reason a fifth iteration was commissioned. They come from the reviewer's own notes on the iteration-4 package. Each must be addressed in the replacement package.

7. **Priority A — protect non-naturalistic worlds against the institutional bias.** The system intentionally privileges institutions, economy, suppression, and ordinary-life residue — that is a genuine strength, and it must be preserved. But it is also a bias: the dominant smell tests (in `01_core_theory.md` and `18_quality_assurance_tests.md`) lean toward *institutional response* ("do governments regulate it, do markets price it, do enemies optimize it"), which can flatten deliberately non-naturalistic modes — mythic, surreal, lyrical, absurdist, fairy-tale, dream-logic, theological, and comic worlds — that may want **coherence of recurrence and symbolic transformation** more than institutional plausibility. This pass must **test the consequence doctrine against deliberately non-naturalistic worlds** and ensure it does not flatten dream, myth, comedy, or sacred contradiction. Concretely, iteration 5 must: (a) rebalance/annotate the smell tests and red-flag lists so they read as *one mode of consequence among several* rather than the only valid mode, offering non-institutional consequence tests (recurrence, symbolic transformation, ritual logic, tonal/mythic inevitability) alongside the institutional ones; (b) strengthen the existing non-realism protections so they are load-bearing, not caveats; and (c) **add at least one fully worked non-naturalistic example** to `19_worked_examples.md` (e.g., a fairy-tale, dream-logic, myth, or absurdist/comic world) demonstrating that the method produces coherent consequence *without* institutional plausibility. Do **not** solve this by weakening the institutional doctrine for realist worlds; solve it by making the doctrine mode-aware.
8. **Priority B — distinguish mystery from wonder, sacredness, horror, and symbolic excess.** The package protects mysteries well by distinguishing *fixed*, *secret*, *undecided*, and *forbidden* explanations — but that framing treats a mystery as **a question awaiting an answer**. Many worlds need **non-instrumental wonder**: awe, sublimity, terror, enchantment, ambiguity, and sacred opacity that exist even when there is *no puzzle to solve* and nothing is being hidden. This pass must create a clearer conceptual distinction between **mystery** (a governed unknown/puzzle), **wonder/awe/sublimity** (non-instrumental magnitude), **sacredness/opacity** (that which is protected from explanation *as* sacred), **horror/terror** (dread that consequence must not "solve away"), and **symbolic excess** (meaning that overflows function). It must give stewards a way to *preserve* these without the current machinery pressuring them to convert every unknown into a puzzle with hidden answers, evidence trails, and eventual reveals. This most directly engages `13_contradiction_retcon_and_mystery.md`, `17_aesthetic_coherence_and_semiosis.md`, `checklists/mystery_preservation.md`, and `templates/mystery_ledger_entry.md`; a dedicated new document or section is an acceptable home if §3.2's bar is met. Preserve everything the existing mystery machinery already does — this is an *addition and disambiguation*, not a replacement of mystery governance.
9. **Priority C — add calibrated example answers to the QA rubric.** `18_quality_assurance_tests.md` scores 0–3, but score interpretation depends on steward judgment, which limits comparability across teams. Rather than adding more numeric precision, iteration 5 must add **calibrated exemplar answers — a concrete "weak / adequate / strong" (or 1 / 2 / 3) sample answer — for each QA category**, so stewards can anchor their ratings against worked examples instead of raw judgment. Keep the existing 0–3 scale and interpretation bands; the addition is anchoring exemplars, not a new scoring scheme.

10. **The weak-points / next-iteration verdict is a separate standalone report** — see §7B. It is *not* folded into the package and is *not* part of the pasteable drop-in set. It lives outside `docs/worldbuilding-system/`.

## 4. The task

Perform a **fifth-iteration doc-overhaul** of the Causal Canon Worldbuilding System. Read the entire iteration-4 package (§2) closely; deep-research worldbuilding craft, comparable systems, and relevant scholarship (§5) — with particular new attention to non-realist poetics, the aesthetics of wonder/the sublime/the sacred/horror, and rubric-calibration methods; then produce an improved, internally consistent, complete replacement package (§7A) that loses no valid content from iteration 4 (§3.3) and materially advances the three priority focus areas (§3.7–§3.9). Prefer in-place improvement; restructure only where §3.2's bar is met. Separately, deliver a candid assessment of the system's remaining weak points and a reasoned verdict on whether a *sixth* iteration will be needed (§7B).

## 5. Exploration + online-research mandate

Explore the repository as deeply as needed beyond the files listed above. Research online as deeply as needed, and pull in prior art, research papers, and comparable implementations wherever they sharpen a decision or expose a gap. Relevant lanes:

- **General (retain the package's existing roots):** comparable worldbuilding and story-continuity systems (story bibles, series continuity/"canon" management, TTRPG setting-design frameworks, worldbuilding method literature); transmedia-continuity and adaptation-governance practice; systems thinking and leverage points; institutional and new-institutional economics (action arenas, rules-in-use, transaction costs); diffusion of innovations and spatial diffusion; bounded rationality and norm/identity-shaped agency; belief revision and Bayesian epistemology; semiotics (Peirce) and sociolinguistics (indexicality); game-design frameworks (MDA); legibility/suppression.
- **Priority A — non-naturalistic modes:** poetics and structural logics of myth, fairy tale, folktale (e.g., morphology-of-the-folktale and structural approaches), surrealism, the absurd, dream logic, theological/sacred narrative, and comic worlds — where *recurrence, transformation, motif, and tonal inevitability* substitute for institutional causation. Find how these traditions define coherence so the non-institutional consequence tests you add are grounded, not invented.
- **Priority B — wonder, the sublime, the sacred, horror, symbolic excess:** the aesthetics of the sublime and of wonder/enchantment; the numinous and the sacred (e.g., Otto's *idea of the holy*, Burke and Kant on the sublime, re-enchantment literature); poetics of horror/dread and the unspeakable; symbolic excess / non-instrumental meaning. Ground the distinctions between mystery, wonder, sacredness, horror, and symbolic excess in this literature.
- **Priority C — rubric calibration:** anchored and behaviorally-anchored rating-scale (BARS) design, calibrated exemplars/scoring guides, and rubric-anchoring practice, to justify the "weak/adequate/strong" exemplar approach.

**Cite sources for every external claim that shapes a change.** Keep external research in a lane separate from repository state: never use a web source to assert what the repository contains.

## 6. Doctrine & constraints

Honor these, all derived from the package's own established doctrine:

- **Authority flows downward.** `01_core_theory.md`'s constitution and the `03` governance spine govern the protocols; the protocols govern their instruments (checklists/templates). A lower-tier change that contradicts a higher tier requires amending the higher tier deliberately and visibly — never designing against it silently. Keep the tiers coherent after any change.
- **The 12 operating laws and the truth-layer order are load-bearing** and must remain satisfiable by every protocol, checklist, and template.
- **Separations must stay crisp:** canon *status* (governance standing) vs. constraint *tag* (causal limit) vs. admission *decision operation* vs. *repair operation*. Iterations 3–4 spent effort reconciling these; do not re-blur them.
- **Checklists stay wired to parent protocols.** Every checklist and template must remain traceable to the protocol it operationalizes; each currently ends with a parent-protocol note, completion rule, and red flags — preserve that structure.
- **Vocabulary stays authoritative and consistent** with `22_glossary.md`; if you add or rename terms (Priority B will introduce wonder/sacredness/horror/symbolic-excess vocabulary), update the glossary and every use site. Do not regress standardized terms (e.g., "black market" over "shadow markets").
- **Instruments are human thinking tools, not implementation instructions** — preserve that framing; templates are record cards, not schemas.
- **Consequence doctrine must become mode-aware, not weaker.** The non-naturalistic protections added under Priority A must not dilute the institutional rigor that realist worlds depend on; they must sit *alongside* it as alternative modes of consequence. Both must remain fully available.
- **Agnosticism guard** (§3.4): no storage/software/API/web-app/LLM coupling introduced anywhere.
- **High-bar restructure guard** (§3.2): keep file identity unless a restructure clears the no-downgrade threshold with explicit justification.

## 7. Deliverable specification

Produce **two** things as downloadable markdown (the assessment report is separate from the package).

**A. The full replacement package** — every file of the final `docs/worldbuilding-system/**`, each as a complete downloadable markdown document (and `manifest.json` as JSON), drop-in ready to replace the originals:
- For every **retained** file: the full updated content, preserving all load-bearing original content (§3.3, §3.6).
- For every **new / renamed / split / merged** file (if §3.2's bar is met): the full content, plus its justification recorded in the mapping below.
- The three priority focus areas (§3.7–§3.9) are realized in this package: mode-aware smell tests + a non-naturalistic worked example (Priority A); a clear mystery/wonder/sacredness/horror/symbolic-excess distinction with steward guidance and updated instruments (Priority B); calibrated weak/adequate/strong exemplar answers per QA category in `18` (Priority C).
- `manifest.json` — regenerated to the final file inventory, `version` bumped to **`0.5`**, dates updated.
- `00_overhaul_notes.md` — rewritten for iteration 5: provenance (baseline `2244966`, per §1 — do **not** carry forward the `a27ab31` baseline from the old `00`/`manifest.json`), a complete **old-to-new mapping** covering the fate of every iteration-4 file (kept / updated / renamed / split / merged / deleted / added), a **retention audit** proving no valid content was lost, the drift/coherence issues fixed, how each of the three priorities was addressed, and the research rationale with citations.

**B. A standalone assessment report — the "sixth-iteration outlook."** A separate downloadable markdown document, **new**, *not* part of the package and *not* something the user pastes back into the system; it lives outside `docs/worldbuilding-system/`. *(assumption: name it `sixth-iteration-outlook.md`; the user can rename on receipt.)* It must contain:
- an evidence-based list of the system's remaining **weak points and warnings** after iteration 5 (coverage gaps, unresolved tensions, places doctrine may be wrong or untested, agnosticism risks, usability friction), each with reasoning and any supporting citations — **explicitly including a candid assessment of how well the three priority focus areas were resolved and what residue remains** (e.g., whether the institutional bias is genuinely rebalanced or only annotated; whether the wonder/mystery distinction holds under pressure; whether the QA exemplars actually improve cross-team comparability);
- a clear, reasoned **verdict on whether a sixth iteration is warranted** — yes/no plus why, and if yes, what the highest-value focus of a sixth pass would be.

**Locked / no-questions.** Produce the deliverables directly as downloadable documents. Do not interview, do not ask clarifying questions — the requirements above are final. If a genuine contradiction makes a requirement impossible, state it inside the affected deliverable and proceed with the most faithful interpretation.

## 8. Self-check (run against your own output before returning)

- Every original file's fate is accounted for in the old-to-new mapping; every retained file preserves its load-bearing content; every deletion/merge is justified and its valid content demonstrably preserved elsewhere (no downgrade).
- No lower-tier change contradicts a higher tier; the 12 laws, the truth-layer order, and the status/tag/decision/repair separations remain intact and satisfiable.
- Every checklist and template is traceable to a parent protocol and retains its completion-rule/red-flag structure; glossary and all use sites are consistent after any addition/rename.
- **Priority A satisfied:** the smell tests / red flags are mode-aware (institutional consequence is one mode, not the only one); non-naturalistic protections are load-bearing; ≥1 fully worked non-naturalistic example exists in `19`; institutional rigor for realist worlds is undiminished.
- **Priority B satisfied:** mystery, wonder/awe/sublimity, sacredness/opacity, horror/terror, and symbolic excess are explicitly distinguished, with steward guidance for preserving non-instrumental wonder where there is no puzzle; the existing mystery machinery is preserved, not replaced; new vocabulary is in the glossary and instruments.
- **Priority C satisfied:** each QA category in `18` has a calibrated weak/adequate/strong exemplar answer; the 0–3 scale and interpretation bands are preserved.
- No storage/software/API/web-app/LLM coupling was introduced anywhere; agnostic framing is intact or strengthened.
- `manifest.json` lists exactly the final file set at `version 0.5`; the package and manifest agree; dates updated.
- The standalone sixth-iteration outlook report exists, is separate from the package, lists weak points/warnings with reasoning (including the three priorities' residue), and gives an explicit sixth-iteration verdict.
- Every external claim that shaped a change is cited.
- The fetch baseline used was `2244966` (not `a27ab31`), and every file named in §2 was read.
