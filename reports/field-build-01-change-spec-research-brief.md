# Research Brief — Field Build 01 (Brindlemark) Doc Change-Spec

**You are a deep-research session (ChatGPT-Pro).** You have been handed this prompt plus one uploaded file: a **manifest** listing every path in a source repository at one exact commit. Read this brief in full, fetch and read the files named below from that commit, research online as deeply as you judge useful, and then **produce the single deliverable specified in §7 directly, as a downloadable markdown document.** Do not interview, do not ask clarifying questions — the requirements here are final (§7 restates this). The interview that produced this brief already happened; you are locked to it.

---

## 1. Context

The uploaded manifest (`reports/manifest_2026-07-06_862ffa0.txt`) is the path inventory of the **`joeloverbeck/worldloom-studio`** repository — a local-first, single-steward web app for maintaining fictional worlds from a **continuity-and-causality** perspective. The app is meant to eventually *encode* an upstream worldbuilding methodology so completely that a steward can build a world with the methodology docs closed.

**Fetch every file you read from commit `862ffa07bf3062655af5ac6841ed7ca6abdac760` (short `862ffa0`)** — the uploaded manifest is exactly that commit's tree (`git ls-tree -r --name-only`). Read only from this commit.

**Authority order among the repo's docs (governs everything below).** From `docs/principles/README.md`:

1. **The methodology package** — `docs/worldbuilding-system/` — is upstream of everything. Nothing downstream restates it; conflicts resolve in the package's favor or route as package amendments.
2. **`charter.md`** — constitution altitude (identity, differentiator, scope).
3. **`canon-sovereignty.md`** and **`domain-fidelity.md`** — constitution altitude.
4. **`workflow-principles.md`**, **`guided-workflow-usability.md`**, **`data-principles.md`** — architectural principles; *"Durable, but may evolve with field evidence from app use."*
5. **ADRs** in `docs/adr/` — concrete decisions, revisable with stated cost.
   Below the principle folder sit the app-facing **specs** in `docs/specs/` (downstream artifacts checked *against* the principles) and the **coverage ledger** `docs/methodology-coverage.md`.

**This is a new research line — there is no predecessor brief to treat as a delta.** The seed is a single field-build report (§2). One provenance caveat you must respect: the report's own header cites **App commit `89ffac8`** (the app state the build was driven against). The fetch baseline is `862ffa0`, the commit that *added the report itself*. I have verified with `git diff --stat 89ffac8 862ffa0` that **no file under `docs/` changed between those two commits** — the entire doc stack you will read at `862ffa0` is byte-identical to what the field build ran against, so every finding in the report applies to exactly the docs you are triaging. (The only doc-adjacent change in that range was a light revision of the field-build skill file itself, noted in §2.)

---

## 2. Read in full (evidence first, then repo authority order)

Read the evidence being triaged, then the doc stack in the repo's authority order. For the three directory-scoped tiers, the stated file counts are exact at this commit — use them for your §8 completeness self-check.

**A. The evidence being triaged (read first).**

- `reports/field-build-01-brindlemark.md` — **the entire evidence base.** The first end-to-end field build: a real world ("Brindlemark") driven through the running app with the methodology docs held open only as the yardstick. Every recommended change must trace here. Note its finding taxonomy (P/R/M/F/V) and its two verdict sections, **"For The App"** and **"For The Methodology"** (which states *"No methodology-source finding in this run"*).
- `.claude/skills/field-build/SKILL.md` — **what the pressure test *is*.** Defines the P/R/M/F/V finding types, the **cold-LLM packet probe** (a fresh subagent gets only the app's generated prompt packet — if it answers well, the packet carries the right context), and the north star: *drive the app toward **doc-obsolescence** (the app fully encoding the methodology so the docs can be closed).* You must read the findings through this lens. (Provenance note: this file was lightly revised at `862ffa0` relative to the `89ffac8` run that produced the report; read the `862ffa0` version as the current definition of the method.)

**B. Authority anchor (read second).**

- `docs/principles/README.md` — owns the **authority order**, the **conformance rule** (every groomed spec/issue carries a "Principles" section naming the principle docs it touches and affirming non-contradiction), and the master **P-/W-/T- identifier table** mapping each principle ID to its owning document. This governs what your change-spec may touch and how it must cite.

**C. The upstream methodology package — *package-by-exception* tier (directory-scoped).**

- `docs/worldbuilding-system/` — **58 files** (24 numbered chapters `00`–`23` + 19 `templates/` + 12 `checklists/` + 3 top-level: `README.md`, `manifest.json`, `operating_card.md`). Read in the **package's own authority order** (its `README.md` routing → doctrine `01`–`04` → protocols `05`–`18` → reference `19`–`23` → `templates/` + `checklists/`). Purpose: (a) confirm whether the package genuinely already covers the seams the app failed at — kernel *consequence-mode* commitment, *truth-layer* assignment for seeds, section-by-section kernel prompts — and (b) locate any genuine methodology (M-class) defect. **You recommend a package amendment ONLY by exception** (see §3.1 and §6). Priority reads within the package for this target:
  - `05_creation_protocol.md`, `03_truth_layers_and_canon_governance.md`, `20_ai_assisted_workflow.md`, `templates/world_kernel.md`, `checklists/frontloaded_seed_audit.md` — the exact kernel→seed-decomposition path the field build walked and got blocked on.
  - `00_overhaul_notes.md` and `README.md` — the **version-1.1 coverage statement** and the package's **evidence-bounded amendment discipline and "no-downgrade set"** (validated behaviors any future wording change must preserve). These constrain what §3.1's "by exception" is allowed to propose.

**D. The architectural principle tier — reinforcement candidates (read third).**

- `docs/principles/` — **7 files.** Split by mutability:
  - *Constitution tier — boundary-awareness, NOT mutable here:* `charter.md`, `canon-sovereignty.md`, `domain-fidelity.md` (README: *"Changes require an explicit steward decision"*). Read to bound scope; do not design changes into them except as a flagged item explicitly labeled *"requires an explicit steward decision"* (§3.1).
  - *Architectural tier — the legitimate field-evidence reinforcement targets:* `workflow-principles.md`, `guided-workflow-usability.md`, `data-principles.md`. These own the identifiers the field build repeatedly cites — **W-1** (prompt-out at every decision point, proposal + pressure), **W-7** (gates demand substance), **W-8** (guided flows are decision-point surfaces; the **Decision-Point Contract**), **W-10** (the workflow map is the home surface), and **T-2/T-3/T-4** (facet fidelity; identifiers are the app's job; prose fidelity).

**E. The coverage ledger — honesty-correction target (read fourth).**

- `docs/methodology-coverage.md` — the living coverage/guidance-maturity ledger. It currently rates Creation (`05`) **"walkthrough-passed."** The first real field build blocked at the *first seed decomposition*. This ledger is a prime doc-change target (a maturity correction and/or a new field-build-tested maturity rung and the discipline behind it).

**F. The ADR tier — new-ADR-if-warranted (directory-scoped, boundary-awareness).**

- `docs/adr/` — **9 files** (`0001`–`0009`). Read to know the concrete architectural decisions in force so any new-ADR recommendation is grounded and non-duplicative. Nearest the Creation/prompt-out/map seams: **`0006`** (admission-flow module boundary), **`0007`** (prompt-out step module seam), **`0009`** (browser-guided flow boundary).

**G. The app-facing specs — the primary change surface (read fifth).**

- `docs/specs/` — **16 files.**
  - *Primary (load-bearing for the walked seams):* `creation-flow.md`, `prompt-out-context-assembly.md`, `workflow-map-and-navigation.md`, `guided-flow-spec-template.md`, `method-cards.md`, `admission-flow.md`, `browser-visible-guidance-acceptance.md`.
  - *Boundary-awareness (read to bound scope, NOT a conformance/audit target):* the downstream-flow specs the field build never reached — `propagation-flow.md`, `constraint-composition-flow.md`, `temporal-timeline-flow.md`, `institutional-economic-suppression-flow.md`, `contradiction-retcon-mystery-flow.md`, `qa-flow.md`, `canon-workbench.md`, `markdown-export.md`, `schema-v1.md`. Do not propose changes to these from this one build's evidence; read them only to place your recommendations correctly and to avoid contradicting adjacent contracts.

**H. Governance / lineage context (read last).**

- `reports/tenth-iteration-outlook.md` — the package's own adversarial self-assessment at the 1.0/1.1 line. It establishes the discipline your "package-by-exception" scope must honor: *"the package should not be edited again until a field log demands it,"* *"every unforced edit is now a risk to a certified surface,"* and the **no-downgrade set**. Read as boundary-awareness for §3.1 and §6.

---

## 3. Settled intentions (these make you *locked* — do not re-open them)

**3.1 Tier scope — app tiers, package by exception.** Your change-spec may recommend changes to: the app-facing specs in `docs/specs/`, the **architectural** principle tier (`workflow-principles.md`, `guided-workflow-usability.md`, `data-principles.md`), the coverage ledger `docs/methodology-coverage.md`, and a **new ADR** in `docs/adr/` if one is warranted.

- The upstream package `docs/worldbuilding-system/` is **package-by-exception**: recommend an amendment **only** if your own deep read surfaces a genuine methodology (M-class) defect the field build's narrow walk did not name — and then present it as a *flagged, evidence-gated recommendation* that honors the package's amendment discipline and no-downgrade set (§6), **never** as a rewrite. The field build logged **zero** methodology-source findings, so the default expectation is *no package change*; overturning that default requires you to state the defect and the evidence explicitly.
- **Negative intention (do not re-open):** the constitution-tier principles `charter.md`, `canon-sovereignty.md`, `domain-fidelity.md` are **out of scope for change**, because the principles README bars field-evidence mutation of that tier. If — and only if — your evidence genuinely implicates one of them, surface it as a single clearly labeled item marked *"requires an explicit steward decision"* and stop there; do not draft the change.

**3.2 Radicalism — grounded-but-bold.** Anchor every recommended change to a specific field-build finding **or** to your own reading of the doc stack. Where the evidence implies a *deeper* structural problem than the raw finding states, you are authorized to recommend radical restructuring — but **label each recommendation as direct-evidence or inference**, and never present an inference as a demonstrated finding.

**3.3 App/PRD — doc-tier only.** The deliverable targets **docs**. You may note, in one line, which spec change implies downstream app/code work, but you do **not** author PRD scopes, endpoint/component fixes, or implementation plans — the report's own "For The App" section plus the repo's `/to-prd` process own implementation. (Most field-build findings are app-encoding; keeping them out of the doc change-spec is deliberate, not an oversight — see §3.5.)

**3.4 Deliverable nature — recommendation change-spec, not ratified text.** For each recommended change, state **the substance** (your own prose, at the right doc altitude — what the target doc must now own) and **its home** (which file and section; whether it *replaces*, *adds to*, or *corrects* existing content). Do **not** write final paste-ready wording, and do **not** invent principle IDs, ADR numbers, or glossary terms — identifier assignment and ratification are the repo's own reassess/amend process (the principles README and the package's amendment discipline govern this). You are specifying *what should change and where*, so the steward can ratify it faithfully.

**3.5 Finding-triage discipline (load-bearing — do this first, per finding).** The field build's findings are not uniform. Classify **each** P/R/M/F/V finding as one of:
- **(a) Spec-divergence** — the app violates a doc contract that is *already correct*. Example: `creation-flow.md`'s *Decision-Point UI Contract* already requires a truth-layer control in seed decomposition (finding F-02); *Deferred Decision #9* already requires an explicit, never-defaulted `consequence_mode` facet (R-03/F-01); `prompt-out-context-assembly.md`'s *Omission Rules* already forbid the kernel-only fallback after decomposition material exists (P-01/P-03) and its *Assistance Modes* already require pressure exposure (P-02); `workflow-map-and-navigation.md`'s *State Grammar* already defines `not_yet_earned` (R-01). These warrant **no doc change** — record each as "conformance/code work, out of scope, noted for the app" and move on.
- **(b) Genuine doc gap** — no existing doc contract covers the seam, or the docs are internally inconsistent/underspecified. These are your in-scope change targets. From the exploration that produced this brief, the credible (b)-class gaps to test and (if confirmed) spec are: **R-02** (no spec requires the *selected kernel section's template prompt to render beside the field*); **F-03** (no inline decomposition-error-recovery contract exists in `creation-flow.md`, `guided-flow-spec-template.md`, or `workflow-map-and-navigation.md`); the **"decomposition depends on / blocks on consequence-mode"** dependency (creation-flow ties consequence-mode to kernel authoring only and never states decomposition's dependency on it — note the methodology itself assigns truth layer at *admission/audit*, one phase after decomposition, so the app's decomposition-time blocker may be enforcing at the wrong phase — reconcile this precisely); and **per-kernel-section prompt-out binding** (both `creation-flow.md` and `prompt-out-context-assembly.md` bind the packet at flow/step/material grain, not at the *selected kernel section* sub-decision, except the World-premise essence exception).

Only (b)-class gaps, plus the **coverage-ledger honesty correction** and any warranted **architectural-principle reinforcement**, yield doc changes. Verify each of the above against the actual files — do not take this brief's classification on faith; it is your starting hypothesis, and confirming or overturning it *is* part of the determination.

**3.6 Embedded determination.** Open the deliverable with an evidence-based verdict that (i) **adjudicates the report's "no methodology-source finding" claim** — endorse it or overturn it, with citations to the package files that do (or fail to) cover the seams; and (ii) states, **per tier**, where changes land and where they do not. A conclusion that "the warranted doc changes are narrower than the raw finding list, and concentrate in the coverage ledger + a few genuine spec gaps + optional principle reinforcement" is a **legitimate, valuable outcome** — not a failure to find enough to change. Do not manufacture churn to look thorough; the package's own discipline treats unforced edits as risk.

**3.7 Locked / no-questions; deep research authorized.** Produce the deliverable directly. Research online as deeply as you judge useful (§5).

---

## 4. The task

This is a **foundational / doc-overhaul** determination with a **hardening** edge: given the first real end-to-end field build's pressure-test evidence, decide what should change across Worldloom Studio's doc/methodology stack, and specify those changes. The build walked the app from world setup through kernel authoring to the first seed decomposition, where it was **blocked** (no consequence-mode control, no truth-layer control, no inline error recovery, a prompt-out packet that stayed kernel-bound). Your job is to convert that evidence — read through the field-build method and the repo's authority order — into a precise, evidence-anchored change-spec that (per §3) targets the app-facing tiers, corrects the coverage ledger's honesty, reinforces the architectural principles where the field justifies it, and touches the upstream package only by flagged exception. The output tells the steward *what should change and where*, so they can ratify it through the repo's own process.

---

## 5. Exploration + online-research mandate

Explore the repository as deeply as needed beyond the files listed in §2 (e.g. `docs/agents/domain.md` for the ADR-conflict-surfacing convention, or any spec cross-reference you need to place a recommendation). Research online as deeply as needed — comparable "methodology-vs-tool encoding" problems, guided-workflow / wizard usability literature, decision-point and error-recovery UX patterns, provenance and controlled-vocabulary modeling, and any prior art on "when a certified spec should change vs. when the implementation should" — wherever it sharpens a recommendation. **Cite sources for any external claim that shapes a decision.** The deep research is yours to run; this brief only commissions it.

---

## 6. Doctrine & constraints (honor these; they are the repo's own, not imported)

- **Authority flows downward.** package → `charter` → `canon-sovereignty`/`domain-fidelity` → architectural principles → ADRs → specs → coverage ledger. A change at a lower tier may not silently contradict a higher one; if the field evidence genuinely pushes *up* a tier, that is a flagged escalation (§3.1), not a downstream edit.
- **The conformance rule.** Every groomed spec and implementable issue carries a "Principles" section naming the principle docs it touches and affirming non-contradiction. Any doc change you recommend must be describable in those terms; where a recommended spec change would touch a new principle, name the principle *document* (not a new ID) and let the repo assign identifiers.
- **The constitution/architectural mutability split is a hard line.** Constitution-tier principles change only by explicit steward decision; architectural-tier principles *may* evolve with field evidence. Your field-evidence-driven reinforcements belong to the architectural tier only.
- **The package's evidence-bounded amendment discipline + no-downgrade set.** The package is version 1.1, released under the rule that it is not edited until a field log *demands* it, and that every prior validated behavior (`00_overhaul_notes.md`'s no-downgrade set; both field trials' protected behaviors) survives any future edit. Doctrine `01`–`04` is release-certified byte-identical. Any §3.1 "by exception" package recommendation must show it clears this bar; if it cannot, do not make it.
- **Facet fidelity (T-2/T-3/T-4).** The app may store and check the package's controlled vocabularies but may never redefine, merge, or auto-assign them: no auto-severity, no auto-status, **no inferred consequence-mode or truth layer** — classification is steward judgment. Any recommendation about consequence-mode or truth-layer controls must preserve this (the fix is *surfacing the steward's control*, never inferring the value).
- **Doc-obsolescence is the app's north star.** The point of the field build is to measure and close the distance between the app today and an app that makes the docs unnecessary. Frame every recommendation by whether it moves the app toward carrying the decision *without the docs open* — that is the standard the specs and coverage ledger are ultimately judged against.
- **Scope guard (restating §3.3/§3.5).** Do not audit or "correct" the boundary-awareness specs (the unreached downstream flows) or the constitution-tier principles; do not author app/PRD/code work. Keep the change-spec to the doc tiers §3.1 authorizes.

---

## 7. Deliverable specification

Produce **one new downloadable markdown document**:

- **`reports/field-build-01-change-spec.md`** — *new file; not a replacement of any existing doc.*
  *(assumption: this filename — rename freely if you prefer another; it is not pinned by the interview.)*

Recommended shape (adapt as the evidence warrants, but cover all of it):

1. **Determination / verdict (§3.6).** The adjudication of the "no methodology-source finding" claim and the per-tier statement of where changes land and where they do not. Lead with this.
2. **Per-finding triage (§3.5).** A table or list classifying each field-build finding as spec-divergence (out of scope, noted for the app) vs. genuine doc gap (in scope), each with a one-line justification citing the doc contract that does or does not already cover it.
3. **Recommended doc changes**, grouped by target file/tier. For each: the **substance** (your prose, right altitude — what the doc must own), its **home** (file + section; replace/add/correct), its **evidence anchor** (finding ID or your doc-reading), and a **direct-evidence vs. inference** label. Expected clusters: coverage-ledger honesty correction (`methodology-coverage.md`); genuine spec gaps (`creation-flow.md`, `prompt-out-context-assembly.md`, and the `guided-flow-spec-template.md` slot for whatever pattern generalizes); optional architectural-principle reinforcement (`guided-workflow-usability.md` W-8 / `workflow-principles.md` W-7 / `canon-sovereignty.md`-adjacent W-1 — via the architectural docs only); a new ADR if a genuine architectural decision is implied.
4. **Out of scope / for the app.** A short pointer section listing the spec-divergence findings that are code/conformance work, so the steward routes them to the field-build report + `/to-prd` rather than expecting them here.
5. **Package-by-exception (§3.1), if any.** Any package-amendment recommendation, flagged separately, with its M-class defect statement and an explicit argument that it clears the evidence-bounded / no-downgrade bar (§6). If you find none — the expected outcome — say so explicitly and state why the package is left untouched.

**No final wording, no invented identifiers** (§3.4). **Locked / no-questions:** produce the deliverable directly as a downloadable markdown document. Do not interview, do not ask clarifying questions — the requirements above are final. If a genuine contradiction makes a requirement impossible, state it in the deliverable and proceed with the most faithful interpretation.

---

## 8. Self-check (run against your own output before returning)

- **Determination present and evidence-based.** The deliverable opens by adjudicating the "no methodology-source finding" claim and states, per tier, where changes land (§3.6).
- **Every finding triaged.** Each P/R/M/F/V finding is classified spec-divergence vs. doc gap, with a justification citing the relevant doc contract (§3.5). No spec-divergence finding was turned into a doc change; no genuine gap was dropped.
- **Every recommended change has substance + home + evidence anchor + direct-vs-inference label**, and no recommendation includes final paste-ready wording or an invented principle/ADR/glossary identifier (§3.4).
- **Tier scope honored.** No change is recommended to a boundary-awareness spec (the unreached downstream flows), to a constitution-tier principle (except a single flagged "requires an explicit steward decision" item, if genuinely implicated), or as app/PRD/code work (§3.1, §3.3).
- **Package left untouched unless a flagged, no-downgrade-clearing M-class exception is argued** (§3.1, §6).
- **Every external claim that shaped a recommendation is cited** (§5).
- **The deliverable set matches §7 exactly** (one new file; the determination, triage, changes, out-of-scope pointer, and package-by-exception section all present).
- **Baseline integrity.** Every file you read exists at commit `862ffa0` and is present in the uploaded manifest; the `docs/` stack you triaged is the same one the field build ran against (§1).
