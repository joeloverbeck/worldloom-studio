# Research brief — Causal Canon Worldbuilding System, iteration 4

*Paste this entire prompt into a fresh ChatGPT-Pro deep-research session and upload the manifest named in §1. You (Session 2) have none of the context in which this brief was authored — everything you need is in this prompt plus the uploaded manifest. Produce the deliverables directly; do not interview or ask clarifying questions.*

---

## 1. Context

The uploaded manifest (`manifest_2026-07-01_a27ab31.txt`) is the exact path inventory of the `joeloverbeck/worldloom-studio` repository — a web app to create and maintain fictional worlds from a continuity and causality perspective. The subject of this task is the repository's **Causal Canon Worldbuilding System**, a storage- and software-agnostic worldbuilding methodology living entirely under `docs/worldbuilding-system/**`. It is currently at **version 0.3** and comprises **56 files**: 24 numbered documents (`00`–`23`), a package `README.md`, a `manifest.json`, 12 `checklists/`, and 18 `templates/`.

**Fetch every file from commit `a27ab31` (full SHA `a27ab313fff16a2953ffb97b7810a7b20dfce652`).** This is the repository's current `HEAD` on `main` — the merge commit that landed the "third iteration of the worldbuilding system" (its parent `b0d1b71` is the iteration-3 commit; the merge changed no package content) — and the uploaded manifest reflects exactly that tree.

**Baseline-divergence warning (read before fetching).** The package's own `docs/worldbuilding-system/00_overhaul_notes.md` records its target commit as `37eed3442fbc7ea0afe88139e84396e20da5ffaf` and explicitly states it "does not independently verify that the commit is the current `main`." That `37eed34` is the **iteration-2** commit — the baseline the *iteration-3* overhaul was authored against — and it predates the iteration-3 content you are now revising. **Do not fetch from `37eed34`.** Use `a27ab31`, the verified current HEAD, for every file. When you cite a repository path, cite the `a27ab31` version.

**Lineage.** This is the **fourth iteration** of an iterated overhaul. The durable record of what the previous (third) iteration delivered is the package's own `00_overhaul_notes.md` — treat it as the delta seed: it tells you what iteration 3 changed, what it deliberately kept, and its retention audit. Your job is the *next* convergence-or-improvement pass over the iteration-3 package, not a cold-start rebuild. There is no separate predecessor research brief to read; the changelog document is the lineage anchor.

## 2. Read in full (authority order)

Read every file below, in this order, before producing anything. The package replaces all of itself, so all 56 package files are load-bearing. Order follows the package's own authority tiers (doctrine → primitives → core protocols → extraction/quality/reference → changelog → inventory → instruments).

**Primary (the package you are replacing):**

Doctrine & primitives
- `docs/worldbuilding-system/README.md` — package purpose, recommended-use flows, package map, operating stance; the top-of-package orientation.
- `docs/worldbuilding-system/01_core_theory.md` — philosophy, the 12 operating laws, the Causal Canon cycle, smell tests, limits; the constitution everything else must satisfy.
- `docs/worldbuilding-system/02_world_model.md` — conceptual primitives and relation verbs (thinking tools, not schemas).
- `docs/worldbuilding-system/03_truth_layers_and_canon_governance.md` — 13 truth layers, canon statuses, constraint tags, admission decision operations, repair-operation boundary, governance roles; the governance spine.
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
- `docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md` — contradiction taxonomy, repair operations, retcon types, mystery ledger, mystery preservation.
- `docs/worldbuilding-system/14_uncertainty_belief_and_evidence.md` — confidence, source reliability, evidence, credence, disputed knowledge, belief ecology.
- `docs/worldbuilding-system/15_branching_versioning_and_collaboration.md` — branch canon, continuity diffs, human approval, disputes, merges, retirement, deprecation.

Extraction, quality, workflow, reference
- `docs/worldbuilding-system/16_narrative_game_and_transmedia_extraction.md` — deriving story/game/medium pressure from world facts.
- `docs/worldbuilding-system/17_aesthetic_coherence_and_semiosis.md` — tone, genre, mood, symbolism, language, aesthetic residue.
- `docs/worldbuilding-system/18_quality_assurance_tests.md` — scoring rubric and QA tests.
- `docs/worldbuilding-system/19_worked_examples.md` — worked examples applying the protocols.
- `docs/worldbuilding-system/20_ai_assisted_workflow.md` — AI as proposer/auditor/challenger, never canon authority.
- `docs/worldbuilding-system/21_templates_index.md` — how templates and checklists fit together; minimal paths and field discipline.
- `docs/worldbuilding-system/22_glossary.md` — authoritative shared vocabulary.
- `docs/worldbuilding-system/23_research_notes_and_bibliography.md` — research roots and translation rules.

Changelog & inventory
- `docs/worldbuilding-system/00_overhaul_notes.md` — **the iteration-3 changelog, old-to-new mapping, retention audit, drift reconciliation, and research rationale; your primary delta seed** (see §1 for its baseline-commit caveat).
- `docs/worldbuilding-system/manifest.json` — machine-readable file inventory and version marker (currently `0.3`).

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
- `docs/worldbuilding-system/checklists/mystery_preservation.md`
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
- `docs/worldbuilding-system/templates/mystery_ledger_entry.md`
- `docs/worldbuilding-system/templates/uncertainty_evidence_card.md`
- `docs/worldbuilding-system/templates/canon_branch_diff.md`
- `docs/worldbuilding-system/templates/collaboration_decision_record.md`
- `docs/worldbuilding-system/templates/aesthetic_coherence_card.md`

**Boundary-awareness (read to bound scope, not a conformance or replacement target):**
- `README.md` (repository root) — one-line repo identity ("a web app to create and maintain fictional worlds"). Read it only to understand the *downstream* product the methodology feeds. It is **out of scope**: do not replace it, and do not let the web-app framing leak into the methodology (see §3 and §6 on agnosticism).

## 3. Settled intentions

These decisions are final. They are the reason this session is locked — do not re-open them.

1. **Deliverable is a full replacement package.** Emit every file of `docs/worldbuilding-system/**` as a complete, drop-in replacement set — not a diff, not a changed-files-only subset. Every file the final package contains must be produced in full.
2. **Structural change is authorized — with a hard guard.** You *may* delete, merge, split, rename, correct, and add documents (numbered docs, checklists, and templates alike) wherever you can justify that it makes the system clearer, more coherent, or more complete. Structure is not frozen at the current 56 files. This is a genuine license to improve the architecture of the package, not merely its prose.
3. **No-downgrade is the overriding constraint.** Every structural change must be justified and mapped. Any content that is deleted or merged away must be demonstrably preserved elsewhere or shown to be genuinely redundant/incorrect. Produce an explicit **old-to-new mapping** and **retention audit** (in the updated `00_overhaul_notes.md`) covering every original file's fate. If a change would risk losing valid craft coverage, doctrine, worked examples, vocabulary, or research rationale, do not make it. Extreme care against downgrade outranks any tidiness or consolidation instinct. When in doubt, keep.
4. **The system stays downstream-agnostic.** The methodology must not assume Markdown, a database, a graph engine, a web app, an API, or an LLM-based workflow — even though the repository that hosts it is a web app. This is a *negative* settled intention: do not re-open it, do not "modernize" the docs toward the product, and treat any web-app/storage/API coupling you would introduce as a defect. Reinforce agnostic language; do not weaken it.
5. **The weak-points / next-iteration verdict is a separate standalone report** — see §7. It is *not* folded into the package and is *not* part of the pasteable drop-in set.
6. **Preserve the load-bearing doctrine.** The consequence-first constitution, the 12 operating laws, the 13 truth-layer order, shock-cone propagation, and the canon-status / constraint-tag / admission-decision-operation / repair-operation separations are load-bearing. They may be sharpened, re-homed, or better explained, but not weakened or silently dropped. If research convinces you a load-bearing element is actually wrong, flag it explicitly in the assessment report (§7) rather than quietly removing it.

## 4. The task

Perform a **fourth-iteration doc-overhaul** of the Causal Canon Worldbuilding System. Read the entire iteration-3 package (§2) closely; deep-research worldbuilding craft, comparable systems and tools, and relevant scholarship (§5); then produce an improved, internally consistent, complete replacement package (§7) that loses no valid content from iteration 3 (§3). The previous iterations were *convergence* passes that fixed drift but explicitly declined to restructure; this pass is authorized to restructure where justified, so treat it as an opportunity to fix deeper architectural, coverage, and coherence weaknesses — not just polish. Separately, deliver a candid assessment of the system's remaining weak points and a reasoned verdict on whether a fifth iteration will be needed.

## 5. Exploration + online-research mandate

Explore the repository as deeply as needed beyond the files listed above. Research online as deeply as needed — comparable worldbuilding and story-continuity systems (e.g. story bibles, series continuity/"canon" management practices, TTRPG setting-design frameworks, worldbuilding method literature), transmedia-continuity and adaptation-governance practice, and the scholarly roots the package already leans on and any it should (systems thinking and leverage points; institutional and new-institutional economics, action arenas, rules-in-use, transaction costs; diffusion of innovations and spatial diffusion; bounded rationality, norm/identity-shaped agency; belief revision and Bayesian epistemology; semiotics and sociolinguistics; game-design frameworks; legibility/suppression). Pull in prior art, research papers, and comparable implementations wherever they sharpen a decision or expose a gap. **Cite sources for every external claim that shapes a change.** Keep external research in a lane separate from repository state: never use a web source to assert what the repository contains.

## 6. Doctrine & constraints

Honor these, all derived from the package's own established doctrine:

- **Authority flows downward.** `01_core_theory.md`'s constitution and the `03` governance spine govern the protocols; the protocols govern their instruments (checklists/templates). A lower-tier change that contradicts a higher tier requires amending the higher tier deliberately and visibly — never designing against it silently. Keep the tiers coherent after any restructure.
- **The 12 operating laws and the 13 truth-layer order are load-bearing** and must remain satisfiable by every protocol, checklist, and template.
- **Separations must stay crisp:** canon *status* (governance standing) vs. constraint *tag* (causal limit) vs. admission *decision operation* vs. *repair operation*. Iteration 3 spent effort reconciling these; do not re-blur them.
- **Checklists stay wired to parent protocols.** Iteration 3 fixed seven orphaned checklists; every checklist and template must remain traceable to the protocol it operationalizes after any restructure.
- **Vocabulary stays authoritative and consistent** with `22_glossary.md`; if you add or rename terms, update the glossary and every use site (iteration 3 standardized "black market" over "shadow markets" — do not regress).
- **Instruments are human thinking tools, not implementation instructions** — preserve that framing; templates are record cards, not schemas.
- **Agnosticism guard** (§3.4): no storage/software/API/web-app/LLM coupling introduced anywhere.

## 7. Deliverable specification

Produce **two** things as downloadable markdown (the assessment report is separate from the package).

**A. The full replacement package** — every file of the final `docs/worldbuilding-system/**`, each as a complete downloadable markdown document (and `manifest.json` as JSON), drop-in ready to replace the originals:
- For every **retained** file: the full updated content, preserving all load-bearing original content (§3.3, §3.6).
- For every **new / renamed / split / merged** file: the full content, plus its justification recorded in the mapping below.
- `manifest.json` — regenerated to the final file inventory, `version` bumped to **`0.4`**, dates updated.
- `00_overhaul_notes.md` — rewritten for iteration 4: provenance (baseline `a27ab31`, per §1), a complete **old-to-new mapping** covering the fate of every iteration-3 file (kept / updated / renamed / split / merged / deleted / added), a **retention audit** proving no valid content was lost, the drift/coherence issues fixed, and the research rationale with citations. Do **not** carry forward the stale `37eed34` baseline from the old `00`.

**B. A standalone assessment report** — a separate downloadable markdown document, **new**, *not* part of the package and *not* something the user pastes back into the system. *(assumption: name it `iteration-4-assessment.md`; the user can rename on receipt.)* It must contain:
- an evidence-based list of the system's remaining **weak points** after iteration 4 (coverage gaps, unresolved tensions, places doctrine may be wrong or untested, agnosticism risks, usability friction), each with reasoning and any supporting citations;
- a clear, reasoned **verdict on whether a fifth iteration is warranted** — yes/no plus why, and if yes, what the highest-value focus of a fifth pass would be.

**Locked / no-questions.** Produce the deliverables directly as downloadable documents. Do not interview, do not ask clarifying questions — the requirements above are final. If a genuine contradiction makes a requirement impossible, state it inside the affected deliverable and proceed with the most faithful interpretation.

## 8. Self-check (run against your own output before returning)

- Every original file's fate is accounted for in the old-to-new mapping; every retained file preserves its load-bearing content; every deletion/merge is justified and its valid content demonstrably preserved elsewhere (no downgrade).
- No lower-tier change contradicts a higher tier; the 12 laws, 13 truth layers, and the status/tag/decision/repair separations remain intact and satisfiable.
- Every checklist and template is traceable to a parent protocol; glossary and all use sites are consistent after any rename/addition.
- No storage/software/API/web-app/LLM coupling was introduced anywhere; agnostic framing is intact or strengthened.
- `manifest.json` lists exactly the final file set at `version 0.4`; the package and manifest agree.
- The standalone assessment report exists, is separate from the package, lists weak points with reasoning, and gives an explicit fifth-iteration verdict.
- Every external claim that shaped a change is cited.
- The fetch baseline used was `a27ab31` (not `37eed34`), and every file named in §2 was read.
