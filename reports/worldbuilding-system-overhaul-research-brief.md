# Research brief — Causal Canon Worldbuilding System, iteration three

*Paste this entire document into a fresh ChatGPT-Pro deep-research session, and upload the manifest file named below. You (that session) have none of the context in which this brief was authored — everything you need is in this prompt plus the uploaded manifest. Produce the deliverable directly. Do not interview or ask clarifying questions.*

---

## 1. Context

The uploaded manifest (`reports/manifest_2026-07-01_37eed34.txt`) is the exact path inventory of the `joeloverbeck/worldloom-studio` repository — a project whose root `README.md` describes it as "a web app to create and maintain fictional worlds from a continuity and causality perspective." **The web app is downstream and irrelevant to this task** (see §3.4). The object of this work is the storage- and software-agnostic methodology package under `docs/worldbuilding-system/**`: the **Causal Canon Worldbuilding System**.

**Fetch every file from commit `37eed3442fbc7ea0afe88139e84396e20da5ffaf` (`37eed34`, "Second iteration of worldbuilding system") — the uploaded manifest reflects exactly that commit's tree.** Use exact raw URLs of the form
`https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/37eed3442fbc7ea0afe88139e84396e20da5ffaf/<path>`.

**Provenance caveat — do not propagate a stale commit.** The package's own `00_overhaul_notes.md` (lines 5–9) records its target commit as `1bf66899004c24e3d737c2daaa70ef30fb524f21` (`1bf6689`). That is the commit of the *first* iteration, which the current package already overhauled; it is **not** your baseline. Read every file from `37eed34` as instructed above. When you regenerate `00_overhaul_notes.md` (§7), record provenance against `37eed34`, not `1bf6689`.

**Authority order among the docs.** The package presents itself in a numbered spine (`00`–`23`) with doctrine at the top and reference at the bottom. Treat that as the working authority order: `01_core_theory.md` and the world-model / governance primitives (`02`, `03`, `04`) govern the protocol docs below them, which govern the extraction/quality/reference tier, which govern the `checklists/` and `templates/` (the craft instruments that operationalize the docs). Higher-tier doctrine wins conflicts; a lower-tier instrument must never contradict the doctrine it serves.

**This is iteration three of a lineage, not a cold start.** Iteration two (recorded in the current `00_overhaul_notes.md`) preserved the consequence-first doctrine and expanded a 16-document spine into the current 24-document spine plus expanded templates and checklists. Your job is a *delta* over that: converge the system toward "done," not rebuild it from scratch. Preserve iteration two's gains; do not re-litigate settled reconciliations (e.g. the canon-status / decision-operation / repair-operation separation, the 13-entry truth-layer order, the adoption of "shock cone") except where §5 identifies them as unresolved.

---

## 2. Read in full (authority order)

This is a whole-tier overhaul, so **read the entire package** before producing anything. All 56 paths below resolve at baseline `37eed34`. Read in this order:

**Orientation**
- `README.md` — repo identity; confirms the downstream web app is out of scope for the package.
- `docs/worldbuilding-system/README.md` — package overview, recommended-use flows, package map, the "if this has been true, why is the world not already different?" rule.
- `docs/worldbuilding-system/00_overhaul_notes.md` — iteration-two changelog, old→new mapping, retention audit, drift reconciliation. This is the record you extend; it also tells you what iteration two *deliberately* did (read it to avoid undoing settled decisions). Note its stale target-commit (§1).
- `docs/worldbuilding-system/manifest.json` — canonical file inventory and version (`0.2`).

**Doctrine & primitives (top authority tier)**
- `docs/worldbuilding-system/01_core_theory.md` — the 12 operating laws, the Causal Canon cycle, smell tests, non-requirements. The doctrine everything else must satisfy.
- `docs/worldbuilding-system/02_world_model.md` — conceptual primitives and relation verbs (thinking tools, not database tables).
- `docs/worldbuilding-system/03_truth_layers_and_canon_governance.md` — truth layers, canon statuses, constraint tags, **decision operations**, governance roles.
- `docs/worldbuilding-system/04_domain_atlas.md` — the fourteen world domains facts ripple through.

**Core protocols**
- `docs/worldbuilding-system/05_creation_protocol.md`
- `docs/worldbuilding-system/06_canon_fact_admission_protocol.md`
- `docs/worldbuilding-system/07_propagation_engine.md`
- `docs/worldbuilding-system/08_constraint_composition.md`
- `docs/worldbuilding-system/09_temporal_and_timeline_protocol.md`
- `docs/worldbuilding-system/10_spatial_and_geographic_propagation.md`
- `docs/worldbuilding-system/11_agent_character_psychology.md`
- `docs/worldbuilding-system/12_institutional_economic_and_suppression_protocol.md`
- `docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md` — **repair operations**, mystery ledger.
- `docs/worldbuilding-system/14_uncertainty_belief_and_evidence.md`
- `docs/worldbuilding-system/15_branching_versioning_and_collaboration.md`

**Extraction, quality, workflow, reference**
- `docs/worldbuilding-system/16_narrative_game_and_transmedia_extraction.md`
- `docs/worldbuilding-system/17_aesthetic_coherence_and_semiosis.md`
- `docs/worldbuilding-system/18_quality_assurance_tests.md`
- `docs/worldbuilding-system/19_worked_examples.md`
- `docs/worldbuilding-system/20_ai_assisted_workflow.md`
- `docs/worldbuilding-system/21_templates_index.md`
- `docs/worldbuilding-system/22_glossary.md`
- `docs/worldbuilding-system/23_research_notes_and_bibliography.md`

**Craft instruments (must be consistent with, and referenced by, the docs above)**
- All 12 files under `docs/worldbuilding-system/checklists/`:
  `aesthetic_coherence_sweep.md`, `agent_character_sweep.md`, `branching_collaboration_sweep.md`, `canon_fact_gate.md`, `constraint_composition_sweep.md`, `frontloaded_seed_audit.md`, `institutional_economic_suppression_sweep.md`, `mystery_preservation.md`, `propagation_sweep.md`, `spatial_geographic_sweep.md`, `temporal_timeline_sweep.md`, `uncertainty_evidence_sweep.md`.
- All 18 files under `docs/worldbuilding-system/templates/`:
  `action_arena_card.md`, `aesthetic_coherence_card.md`, `agent_character_card.md`, `canon_branch_diff.md`, `canon_change_proposal.md`, `canon_fact_card.md`, `capability_card.md`, `collaboration_decision_record.md`, `constraint_card.md`, `contradiction_report.md`, `counter_institution_card.md`, `institution_card.md`, `mystery_ledger_entry.md`, `propagation_report.md`, `spatial_region_card.md`, `temporal_timeline_card.md`, `uncertainty_evidence_card.md`, `world_kernel.md`.

---

## 3. Settled intentions (final — do not re-open)

These decisions are locked. They pre-empt every clarifying question you might otherwise ask.

1. **Full discretion to converge.** You decide what "done" means for this system. You are free to **merge, split, tighten, correct, add, or remove** documents, checklists, and templates — and to renumber/rename files — to optimize for a coherent *finished* methodology rather than a larger one. You are **not** obligated to keep the 24-document spine; consolidation is welcome where docs overlap, and expansion is welcome only where it adds real craft value. Judge for quality of the finished system, and stop when further change would not improve it.

2. **Full regenerated replacement set.** The deliverable is a complete, self-contained bundle: **every file in the package re-emitted** — changed *and* unchanged — so the download can replace `docs/worldbuilding-system/**` wholesale. This includes a regenerated `manifest.json` (bump `version` to `0.3`, update `updated`, and list the final file set) and a rewritten `00_overhaul_notes.md` for iteration three.

3. **Extraordinary preservation — a downgrade is the one unacceptable outcome.** Take exceptional care not to lose already-valid information. No valid conceptual content from the current set may be silently dropped. Anything you remove, merge, or relocate must be **accounted for in the iteration-three overhaul notes** (old→new mapping + retention audit), exactly as the current `00_overhaul_notes.md` accounts for iteration two's changes. If in doubt about whether content is valid, preserve it (relocated or tightened) rather than cut it.

4. **Stay downstream-agnostic** *(negative intention — do not re-open).* The package must remain agnostic of storage medium, file format, database, graph engine, web app, API, and LLM workflow. It must **not** be tailored to the `worldloom-studio` web app or to any particular tool. Templates and checklists remain **human craft/thinking instruments**, not data schemas or implementation specs. Do not introduce software-primary-key semantics, API shapes, or tool-specific assumptions. Reinforced as a scope guard in §6.

5. **Preserve the rigor strengths.** Keep intact and, where possible, deepen: the consequence-first doctrine ("Once the world says a thing is possible, the rest of the world must respond"; "if this has been true, why is the world not already different?"); the citation/bibliography discipline (`23_research_notes_and_bibliography.md` and the inline footnote citations in the doctrine docs); and the governed treatment of mystery, contradiction, false belief, and suppression. Deepen, do not dilute.

6. `assumption:` The regenerated `00_overhaul_notes.md` records provenance against baseline `37eed34` (not the stale `1bf6689` currently cited). Correct this as part of the pass.

---

## 4. The task

Perform a **foundational doc-overhaul (iteration three)** of the Causal Canon Worldbuilding System and produce a full replacement document set that you judge to be a finished, converged version of the methodology. Preserve every valid idea from the current package; correct the concrete defects named in §5; reconcile internal inconsistencies; consolidate genuine redundancy; wire every craft instrument into the doctrine that invokes it; and add or deepen only where research and craft judgment show a real gap. The system must remain a disciplined, medium-agnostic worldbuilding *craft* — usable by a solo author with paper cards or by a writing room — and it must not regress in scope, rigor, or coverage relative to iteration two.

---

## 5. Exploration + online-research mandate

Explore the repository as deeply as needed beyond the files listed in §2. **Research online as deeply as you judge beneficial** — comparable worldbuilding methodologies and "story bible" / continuity-management practices; the systems-thinking, institutional-economics, diffusion, social-psychology, epistemology, and semiotics literatures the package already draws on (Meadows; Ostrom, North, Williamson; Rogers, Tobler, Hägerstrand; Simon, Ajzen, Tajfel/Turner; belief revision / Bayesian epistemology; Peirce, Hymes; MDA; Scott); and any prior art that sharpens the deliverable. **Cite every external claim that shapes a decision**, and fold new citations into the bibliography using the package's existing citation style. Keep external research in its own lane: it informs craft, it does not assert anything about the repository's state.

A consistency sweep of the current package already surfaced these **concrete, load-bearing defects** — treat them as a floor, not a ceiling (find and fix more):

- **Seven orphaned checklists.** `constraint_composition_sweep.md`, `temporal_timeline_sweep.md`, `spatial_geographic_sweep.md`, `agent_character_sweep.md`, `uncertainty_evidence_sweep.md`, `branching_collaboration_sweep.md`, and `aesthetic_coherence_sweep.md` exist but are referenced by no parent doc. Wire each into the workflow of the doc it serves (`08`, `09`, `10`, `11`, `14`, `15`, `17` respectively) — or justify removal in the overhaul notes.
- **Decision-operations vs. repair-operations divergence.** `03_truth_layers_and_canon_governance.md` (decision operations) and `13_contradiction_retcon_and_mystery.md` (repair operations) list materially different operation sets, and `22_glossary.md` does not say which governs when. `03` includes `branch, supersede, deprecate` absent from `13`; `13` includes `clarify scope, add constraint, diffuse unevenly, split, retcon` absent from `03`. Reconcile deliberately — a clarifying matrix of which operation applies in which context (admission vs. contradiction repair), or a unified vocabulary — and make the glossary authoritative. (Iteration two *intended* these as distinct categories; preserve that intent while removing the ambiguity.)
- **Constraint tags vs. statuses ambiguity** across `03`, `06_canon_fact_admission_protocol.md`, and `00_overhaul_notes.md` — clarify whether constraint tags fully replace the old "accepted as X" status modifiers or coexist with statuses, and state it once, authoritatively.
- **Vocabulary drift.** `12_institutional_economic_and_suppression_protocol.md` uses "shadow markets" where every other doc uses "black market(s)"; standardize and add a glossary entry. Add missing glossary entries for load-bearing terms used but undefined: **cost, latency, residue/fossil, path dependence** (and audit for others).
- **Redundant mystery coverage** spread across `01` (Law 6), `13` (mystery ledger / mystery types), and `14` (uncertainty overlapping the mystery boundary) — assign each its governed place and cross-reference rather than repeat.

You are expected to find additional issues (gaps, redundancy, contradictions, agnosticism leaks) through your own reading and research; the above is what one pass already confirmed.

---

## 6. Doctrine & constraints

Honor these, all derived from the package's own stated commitments:

- **Authority flows downward (§1).** Doctrine (`01`–`04`) governs protocols (`05`–`15`), which govern extraction/quality/reference (`16`–`23`), which govern the `checklists/` and `templates/`. A genuine improvement to a lower tier that contradicts a higher tier requires amending the higher tier explicitly (and recording it in the overhaul notes) — never a silent divergence. No craft instrument may state a rule its parent doc contradicts.
- **Consequence-first is the constitution.** Every change must satisfy the core doctrine of `01_core_theory.md`: facts are interventions; no free capabilities; consequences must leave residue; coherence is not maximal explanation; mystery, contradiction, false belief, and suppression are *governed*, not ignored. Do not weaken any of the 12 operating laws; sharpen them if you touch them.
- **Medium-agnostic craft (hard scope guard, from §3.4).** No storage/software/database/API/web-app/LLM assumptions. Templates and checklists stay human thinking instruments. Preserve the existing plain-language framing (e.g. "record label"/"name"/"reference" rather than "ID") that iteration two adopted precisely to avoid software-primary-key implications.
- **Preservation over cleverness (from §3.3).** When consolidating, the retention audit must show that every merged/removed idea landed somewhere or was deliberately and defensibly cut. A leaner set that quietly loses a valid distinction is a downgrade and is unacceptable.
- **Cite what shapes a decision (from §5).** Any external source that changes a design choice is cited in the bibliography in the package's existing style.

There is no separate engineering/test-coverage regime to honor — this is a documentation package, and its "tests" are the QA rubric in `18_quality_assurance_tests.md` and the `checklists/`, which are themselves in scope.

---

## 7. Deliverable specification

Produce, **as downloadable markdown documents**, a **complete replacement set** for `docs/worldbuilding-system/**`. Because §3.2 fixes the deliverable as a *full regenerated set*, emit **every file the finished package contains** — those you changed and those you left unchanged — so the bundle can replace the directory wholesale. Concretely:

- **Every numbered doctrine/protocol/reference document** in your final spine (whatever numbering you converge on), each as its own markdown file.
- **`README.md`** for the package — regenerated to match the final structure, recommended-use flows, and package map.
- **`manifest.json`** — regenerated: `version` → `0.3`, `updated` set to the current date, `files` listing the exact final set (keep the schema shape of the current manifest).
- **`00_overhaul_notes.md`** (or your renamed equivalent, kept as file `00`) — the iteration-three changelog. It **must** contain: provenance against baseline `37eed34`; a structural summary of what changed since iteration two; a complete **old→new mapping** table (every current file → its fate: kept / merged-into / split-into / renamed / removed); a **retention audit** proving no valid content was lost (§3.3); a drift-reconciliation section for every inconsistency you resolved (decision/repair operations, constraint tags, vocabulary); and a research-driven-rationale section.
- **All `checklists/**`** and **all `templates/**`** in your final set — each wired into (and referenced by) the doc it serves.

Numbering, filenames, and the count of files may differ from the current set at your discretion (§3.1), but the old→new mapping must make every such change traceable, and every internal cross-reference (README flows, templates index, glossary, inter-doc references, checklist/template invocations) must resolve within the delivered set.

**If, in your judgment, a current file should cease to exist** (merged or cut), do not emit it — but record its disposition in the overhaul notes. Every file you *do* emit must be complete and final, not a diff or a placeholder.

> Produce the deliverables directly as downloadable markdown documents. Do not interview, do not ask clarifying questions — the requirements above are final. If a genuine contradiction makes a requirement impossible, state it in the deliverable and proceed with the most faithful interpretation.

---

## 8. Self-check (run against your own output before returning)

- **Baseline integrity.** Every file named in §2 was read from commit `37eed34`; the regenerated overhaul notes cite `37eed34`, not `1bf6689`.
- **No downgrade.** Every valid idea in the current package survives in the new set (relocated/tightened is fine); the retention audit accounts for every removal or merge. Scope and coverage do not regress relative to iteration two.
- **Completeness of the bundle.** The deliverable is a full replacement set — every file the final package needs is emitted, including a regenerated `manifest.json` (`version` `0.3`) and `00`-numbered overhaul notes.
- **Reference integrity.** No dangling cross-references; the seven previously-orphaned checklists (and any others) are wired into or explicitly retired by their parent docs; README flows, templates index, and glossary all resolve within the delivered set.
- **Consistency resolved.** Decision-vs-repair operations reconciled with an authoritative glossary; constraint-tags-vs-statuses stated once; "black market" vocabulary standardized; named glossary gaps filled.
- **Doctrine preserved and un-weakened.** The 12 operating laws and consequence-first constitution are intact or sharpened; no lower-tier instrument contradicts higher-tier doctrine.
- **Agnosticism held.** No storage/software/database/API/web-app/LLM assumptions anywhere; templates/checklists remain human craft instruments.
- **Citations.** Every external claim that shaped a decision is cited in the package's existing bibliography style.
- **Deliverable matches §7 exactly.**
