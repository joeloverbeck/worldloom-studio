# Research Brief — Third Iteration of the Foundational Principles (Robustness / Build-Readiness Pass)

*This brief commissions a **local Claude Code session** with direct read/write access to the `worldloom-studio` repository working tree. You read files with your own tools, fetch nothing, and upload nothing. You are locked: do not interview, do not ask clarifying questions — the requirements below are final.*

## 1. Context

This repository holds two doc tiers and their evidence trail. Upstream: the **Causal Canon Worldbuilding System 1.0** (`docs/worldbuilding-system/`, 58 files), a released methodology package whose own iteration line is closed (see `reports/tenth-iteration-outlook.md`). Downstream: the **foundational principles of the Worldloom Studio app** (`docs/principles/`, 6 files) and three ADRs (`docs/adr/`), which govern every future spec and implementable issue for the web app that will mechanize the methodology. The repo's authority order is defined in `docs/principles/README.md`: package → charter → constitution docs → architectural-principle docs → ADRs.

**Lineage of the principles line.** Iteration 1: the archived deep-research pass (`archive/reports/foundational-principles-research-brief.md` → `archive/reports/foundational-principles-research-report.md`) whose recommendations were ratified into `docs/principles/` and `docs/adr/` at commit `2b89b1b` ("Ratify first iteration of the foundational documents", 2026-07-02). Iteration 2: a small hardening pass at commit `90c30f0` ("Second iteration of improvements to foundational docs.") — it added the `20` invariant-sequence paragraph to `canon-sovereignty.md`, the evidence-flows-upstream bullet to `domain-fidelity.md`, and repointed citations to `archive/`. Iteration 2 shipped **without** a report artifact, so there is no principles-line outlook to seed from; the evidentiary seeds are the archived report itself and the repo's git history. **This brief commissions iteration 3**, and its deliverable report renders the verdict on whether a fourth is needed.

**Baseline (authored-against, not fetch-from).** This brief was authored against commit `90c30f0` (repo HEAD at write time, clean tree). When you start, run `git rev-parse HEAD`, work from the **live working tree**, and note any divergence from `90c30f0` in your deliverable report. The pin is provenance, not a fetch instruction.

## 2. Read in full (authority order)

Read everything below before modifying anything. Paths are repo paths you Read directly.

**Tier 0 — upstream authority (read-only for this pass):**

- `docs/worldbuilding-system/` — the entire package: 58 files at authoring time (README, the 24 numbered files `00`–`23`, `operating_card.md`, `manifest.json`, 12 checklists, 19 templates). Read in the package's own order (its `README.md` declares the reading path). Group reason: the principles tier exists to implement this package faithfully (P-1); robustness of the principles can only be judged against what the package actually demands. Priority flags for this target: `00_overhaul_notes.md` (changelog + the coverage statement naming field-tested vs. honestly-untested surfaces — the charter's T-8 hangs on it), `02_world_model.md` (the dependency-graph model the charter claims as differentiator), `03_truth_layers_and_canon_governance.md` (the two mutation regimes and status machine that `data-principles.md` W-6 mechanizes), `06_canon_fact_admission_protocol.md` (the admission gate W-3 mechanizes), `07_propagation_engine.md`, `13_contradiction_retcon_and_mystery.md`, `18_quality_assurance_tests.md` (QA is in v1 scope per the charter), `20_ai_assisted_workflow.md` (the doctrine `canon-sovereignty.md` operationalizes), `21_templates_index.md` (skip-licensing, minimal use paths), `22_glossary.md` (the naming authority `domain-fidelity.md` binds the app to).

**Tier 1 — the tier under assessment (your write scope):**

- `docs/principles/README.md` — index: authority order, conformance rule, the formal principle-ID table. Any merge/rename/retirement you perform must update this file coherently.
- `docs/principles/charter.md` — constitution: mission, identity (P-3), differentiator (P-4), v1 scope, non-goals, evidence-led scope (T-8).
- `docs/principles/canon-sovereignty.md` — constitution: P-2, W-1, default prompt texts, advisory retention, provenance doctrine, the API door.
- `docs/principles/domain-fidelity.md` — constitution: P-1, glossary authority, T-2, the store-and-check-never-redefine line.
- `docs/principles/workflow-principles.md` — architectural: P-5, W-2, W-3, W-4, W-7, the step-to-role mapping.
- `docs/principles/data-principles.md` — architectural: P-6, W-5, W-6, T-3, T-4, T-5, T-6, the engine-agnostic lifecycle requirements.
- `docs/adr/0001-sqlite-file-per-world.md` — T-1 engine decision, binding schema configuration.
- `docs/adr/0002-localhost-native-process.md` — T-7 deployment shape; names the **stack ADR still owed** before the first implementation ticket.
- `docs/adr/0003-branch-and-collaboration-schema-door.md` — T-6 door-keeping for untested surface `15`.

**Tier 2 — evidentiary basis (read-only):**

- `archive/reports/foundational-principles-research-report.md` — the full evidentiary argument iteration 1 ratified from; still the formal citation target of the README. Its §9 lists the user-owned open questions whose defaults were ratified.
- `archive/reports/foundational-principles-research-brief.md` — what iteration 1 was commissioned to do; read to know what was *asked*, so you can spot what was never asked.
- `reports/ninth-iteration-field-trial.md` — the latest trial log: how a steward actually moved through the guide, with skip/question/friction ledgers and measured onboarding cost.
- `reports/field-trial-world-2/` — all 13 artifacts of that trial (kernel, seed decomposition, fact cards, admission ledger, propagation report, temporal pass, institutional/suppression pass, contradiction reports C1/C2, capability card, mystery ledger, frontloaded seed audit, QA regression profile). These are the concrete record shapes the app's data model must hold — the strongest available test of whether the principles' data and workflow claims survive contact with real artifacts.
- `reports/tenth-iteration-outlook.md` — the package line's closing outlook. Binding warnings for the app tier: the operating-card productization risk (§1.4), the no-repo-coupling invariant, the untested-surface exposure (§1.1), and the closed-line verdict you must not re-open.

**Secondary evidence (read; lighter weight):**

- `reports/eighth-iteration-field-trial.md` and `reports/field-trial-world/` (11 artifacts) — trial 1. The principles repeatedly claim "both trials"; verify those claims against both, not just trial 2.

**Boundary-awareness (read to bound scope; not conformance targets, not audit targets):**

- `CONTEXT.md` — the app-layer domain terms already coined downstream of the principles (world file, flow, draft space, admission queue, prompt-out step, advisory artifact). If your edits rename a concept, this file's terms must not silently dangle.
- `CLAUDE.md`, `AGENTS.md` — root pointers to `docs/principles/README.md` and the authority order.
- `docs/agents/domain.md` — the ADR-conflict surfacing convention the conformance rule cites.
- `docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md` — the grooming pipeline the conformance rule attaches to (`ready-for-agent` / `ready-for-human`).

## 3. Settled intentions

These decisions are final; do not re-open them.

1. **This pass is iteration 3 of the principles line.** Its report judges whether iteration 4 is needed. It does not renumber or re-ratify the line's history.
2. **The determination is build-readiness.** The steward's concern, verbatim in intent: *are the foundational principles robust enough that spec- and ticket-writing for the web app can start now?* Every finding is weighed against that bar — a weakness matters in proportion to how badly it would misdirect the first specs, schema, and flows.
3. **Docs conditional, report unconditional.** You always produce the outlook report (§7). You modify `docs/principles/*` and `docs/adr/*` **only where warranted** — removing, adding, correcting, merging, and splitting documents are all licensed. If nothing is warranted, change nothing and let the report say why the tier is already sound; do not manufacture edits to justify the pass. An unforced edit to a sound document is itself a defect.
4. **The package is read-only.** `docs/worldbuilding-system/` is upstream and fixed (P-1), and its editing line is closed (tenth-iteration outlook §3: no edits until a field log demands them). Any place where the principles cannot faithfully implement the package becomes a **flagged proposed package amendment in your report** — never an edit, and never a silent design-around.
5. **`archive/` is frozen.** The archived report remains the citation target for iteration-1 evidence even after your edits; if your changes retire or renumber a principle, the README's ID table records it (retired numbers never reused, per the README's own rule) — the archive is not rewritten to match.
6. **Steward-owned decisions stay reserved.** The stack ADR owed per ADR 0002 (server framework, SQLite binding, migration tooling, test setup) is *not yours to author*: you may flag its absence as a readiness gap and lay out decision criteria in the report, but you make no stack picks. The same reservation covers the other user-owned choices the archived report's §9 named (packaging, naming, BYO-key roadmap): their ratified defaults stand; challenge one only in the report, with evidence, as a question for the steward.
7. **Cross-reference integrity travels with renames.** If you merge, rename, or remove a Tier-1 file, you fix every reference to it across the repo (`CLAUDE.md`, `AGENTS.md`, `CONTEXT.md`, `docs/agents/*`, and within `docs/principles/`/`docs/adr/`) — mechanical consistency only; no substantive changes outside the Tier-1 write scope.
8. **Deep research is authorized.** Explore the repo beyond §2 and research online as deeply as the assessment warrants; cite sources for any external claim that shapes a decision. `assumption:` depth is yours to judge — a robustness pass that finds the tier sound may need little; a structural gap may deserve real prior-art work.
9. **Nothing is committed.** All changes stay in the working tree for the steward's review.
10. `assumption:` the report filename is `reports/principles-third-iteration-outlook.md` (steward-confirmed at interview; carried here so a collision or renaming need is surfaced, not silently resolved).

## 4. The task

This is a **foundational / doc-overhaul** pass with a determination at its core. Assess whether `docs/principles/*` and `docs/adr/*` — as they stand after two iterations — are robust enough to govern the app-building phase: complete enough that the first specs won't hit questions the principles should have answered, correct enough against the package and the trial evidence that conformance to them produces a faithful app, and internally coherent enough that two specs citing different principle docs can't be led into contradiction. Where the assessment finds warranted changes, make them yourself, directly in the working tree. Then write the outlook report: the build-readiness verdict, the fourth-iteration verdict, and an honest accounting of the new iteration's remaining warnings and weaknesses.

Angles the assessment must cover (not exhaustive — add your own): whether every claim the principles make about the package is accurate at package version 1.0 (e.g. the vocabulary counts, the status-machine size, the "both trials" evidence claims); whether the record shapes in `reports/field-trial-world-2/` are actually representable under `data-principles.md` as written; whether the conformance rule is executable by a spec author (is "affirming non-contradiction" checkable?); whether any principle is stated at the wrong altitude (constitution vs. architecture vs. ADR) or duplicated across documents in ways that can drift; what a spec author would still have to *guess* — the gaps between principle tier and first spec (readiness gaps to name in the report, not necessarily to fill with new doctrine); and whether the ID table, authority order, and cross-references survive your own edits intact.

## 5. Exploration + online-research mandate

Explore the repository as deeply as needed beyond the files listed above — git history included. Research online as deeply as needed — local-first app practice, SQLite-backed personal archives, provenance and mixed-initiative literature, principle/ADR governance practice in comparable projects — wherever it sharpens the determination or a specific edit. Cite sources for any external claim that shapes a decision. The archived report's §10 research appendix is the existing citation base; extend it in your report rather than re-deriving it.

## 6. Doctrine & constraints

- **Authority order governs your edits.** Per `docs/principles/README.md`: package > charter > canon-sovereignty/domain-fidelity > workflow/data principles > ADRs. A lower tier is corrected to fit a higher one; a genuine higher-tier defect is amended *at that tier* explicitly (constitution-altitude changes are exactly the "explicit steward decision" the docs reserve — you may draft such a change, but your report must flag every constitution-altitude edit prominently so the steward's review is informed consent, not discovery).
- **The glossary is the naming authority** (`22_glossary.md`, via `domain-fidelity.md`): package terms verbatim in any prose you write; app-layer terms defer to `CONTEXT.md`.
- **Principle-ID discipline** (README): principles cited as `<document> <ID>`; new principles take the next free number in the fitting series (P/W/T); retired numbers never reused; the README table is updated in the same pass as any change it indexes.
- **No repo coupling into the package** (tenth-iteration outlook §1.4): nothing you write may add a package-file citation of a repository path outside the package, and nothing in the app tier may require the package to change to stay true.
- **Untested-surface honesty** (charter T-8): the package's coverage statement is load-bearing; any principle prose touching `10`, `11`, `14`–`17` keeps its untested-surface flag. Do not let an edit silently upgrade untested doctrine into tested-sounding doctrine.
- **The prior app's failure is the constitution's reason for existing** (`canon-sovereignty.md` preamble): any edit that weakens P-2's structural (not advisory) character, or opens a code path from generated text to canon, is out of bounds regardless of what any research suggests.
- **This report tier's own convention:** outlooks in this repo are written adversarially against their own pass (see `reports/tenth-iteration-outlook.md`'s self-frame). Yours inherits that stance: you are both assessor and editor, so the report must name where self-grade inflation could hide and give the steward concrete checks to run.

## 7. Deliverable specification

Deliverables are files you Write or Edit in place in the working tree, uncommitted:

1. **Conditional — edits to the assessed tier.** Modified, added, removed, merged, or split files under `docs/principles/` and `docs/adr/` only, plus mechanical cross-reference fixes elsewhere per intention 7. Every edit traceable to a finding your report states.
2. **Unconditional — the outlook report:** `reports/principles-third-iteration-outlook.md` (new file). It must contain, clearly sectioned: (a) the **build-readiness verdict** — can spec/ticket work start now, stated plainly with its evidentiary basis; (b) the **fourth-iteration verdict** — is another principles iteration needed, and what would trigger it; (c) **warnings and weaknesses of iteration 3** — what this pass leaves unresolved, under-evidenced, or at risk, written adversarially per §6; (d) a **change log** of every file you touched and the finding that warranted it — or the explicit statement that no changes were warranted and why; (e) any **proposed package amendments** (flagged, not performed) and any **steward-reserved questions** (stack ADR criteria included, if you judge that gap material); (f) citations for external claims.

Produce the deliverables directly. Do not interview, do not ask clarifying questions — the requirements above are final. If a genuine contradiction makes a requirement impossible, state it in the report and proceed with the most faithful interpretation.

## 8. Self-check

Before finishing, verify against your own edit log (the tree is shared — surface, don't own, any pre-existing or concurrent changes you did not make):

- Every §2 path was actually read; the full `docs/worldbuilding-system/` sweep covered all 58 files (count them).
- Nothing outside `docs/principles/`, `docs/adr/`, the one report file, and intention-7 cross-reference fixes was modified; `docs/worldbuilding-system/` and `archive/` are byte-identical to when you started.
- Nothing was committed.
- The README authority order, conformance rule, and ID table are consistent with the post-edit document set; no retired ID was reused; no reference anywhere in the repo dangles against a file you renamed, merged, or removed.
- No edit weakened P-2's structural character, reopened a settled steward-owned decision (intention 6), or upgraded an untested surface's flagged status.
- The report contains all six sections of §7.2; every change in the tree appears in its change log; every constitution-altitude edit is prominently flagged; every external claim is cited.
- If HEAD diverged from `90c30f0`, the divergence is noted in the report.
