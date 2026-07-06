# Method-Surface Program — diagnosis and PRD seeds

**Date:** 2026-07-05 · **Baseline commit:** 1f57c33 (branch `concerns-about-direction`) · **Method version:** worldbuilding-system 1.1 (amended this session)
**Session:** `/grill-with-docs` stewardship session on the repo's direction; every decision below was ratified live by the steward. This report is the durable record and the source for a later `/to-prd` pass. It supersedes no prior report; it sequences the work the parity trials were discovering piecemeal.

## The problem as felt

The app was meant to be a faithful, pleasant replacement of `docs/worldbuilding-system/*`, with (1) painless workflow-following, (2) a context-complete prompt for an external LLM at every decision point, and (3) the app itself teaching the method. Instead the steward experience is an opaque mess, and the parity-field-trial loop keeps finding blockers "we shouldn't have had from the beginning," one stretch at a time, without exposing a seam to cut.

## Verdict

The substrate is not the mess. Schema, stores, governance invariants, the admission boundary, and the record lifecycle are faithful and repeatedly validated — by the 2026-07-04 divergence audit and by every parity trial's V-findings. The mess is one missing layer — the **method surface** (the shell between flows, the guidance inside decision points, and the prompt packets leaving them) — plus one constitutional divergence that the parity instrument was structurally unable to see.

## Findings

### F-1 — The prompt mission was constitutionally wrong (the deep seam). RESOLVED this session.

The steward's actual purpose #2 is **externalized drafting**: at every decision point except the world's essence, generate a context-complete prompt instructing an external LLM to *propose the content*, which the steward then curates into the record. The ratified constitution said the opposite: `canon-sovereignty.md` W-1 forbade any step from opening with generation ("never for the first draft"), operationalizing `20_ai_assisted_workflow.md` 1.0's "ask for pressure, not answers." Every spec, prompt template, and trial then faithfully enforced challenge-only prompt-out — and scored prompts against the wrong mission.

**Why the seam was unfindable:** the parity-field-trial measures *app vs package*. This divergence was *package vs steward intent*. No amount of parity evidence could surface it.

**Resolution (this session):** package amended to version 1.1 — `20` now defines **proposal mode** and **pressure mode**, with the essence exception (`05` Phase 1 kernel premise is never delegated), adoption-as-authorship, and an "adopted with steward revision" output label; changelog in `00_overhaul_notes.md`, README/manifest re-synced. `canon-sovereignty.md` W-1, `workflow-principles.md`'s W-1 mapping, and the principles index were amended to match. Proposal mode is honestly untested and is named in the 1.1 coverage statement.

### F-2 — Nobody owns the journey. RESOLVED at principle tier; implementation is PRD-B.

No spec defines how a steward reaches Propagation, Stage-12, Stage-13, or QA; `workflow-map-and-navigation.md` paves setup→Creation→Admission and stops, and each later flow's "Run entry" presupposes an already-selected record. The web UI is a single 3,917-line `main.tsx` with no router: all flows render as one scrolled stack (the "everything panel" hit by all three trials, deferred out of PRD #165, and untracked). W-8 governs a decision point's interior; nothing governed the space between them.

**Resolution (this session):** new principle **W-10 — the workflow map is the home surface** (`guided-workflow-usability.md`), plus the CONTEXT.md term "Workflow map." Implementation is PRD-B below.

### F-3 — The replacement bar wasn't constitutional. RESOLVED at principle tier; content is PRD-C.

"The app replaces the docs in normal use" lived only in the parity-trial skill and two #165 spec sentences. So three trials in a row rediscovered file-paths-as-guidance, and each PRD re-litigated the bar. All doctrine text shown today is hardcoded string literals (server flow modules + `main.tsx` defaults); package paths are displayed as if the steward could open them.

**Resolution (this session):** charter mission amendment ("the app replaces the package files in normal use") plus new principle **W-9 — replacement-grade guidance** (self-contained app-owned method instruction per decision point, as versioned derivations; file paths demoted to provenance). Content and mechanism are PRD-C below.

### F-4 — Cross-cutting contracts are being built as special cases. Implementation is PRD-A/PRD-D.

The decision-point payload pattern exists three times (Admission #133, Creation #150, Constraint #141), each hand-built. Prompt context was fixed per-template (#165 fixed `decomposition_pressure` alone, and `prompt-out-context-assembly.md` now accretes per-template bullets). Four flows (Propagation, Stage-12, Stage-13, QA) still await W-8 retrofits that would rediscover the same classes. The parity loop converges, but at roughly one debt-class instance per stretch, with the shell deferred every time.

### Supporting facts

- Timeline: methodology 07-01/02 (two field trials, 1.0); principles ratified 07-02; app built 07-03/04 with "done" = server+tests; W-8/ADR-0009/spec scaffolding shipped 07-04 (the usability overhaul predicted the "technically faithful control room" verbatim); parity trials + three retrofit PRDs 07-05.
- Tracker at session start: one open issue (#111, reduced to the `09` temporal flow). #109/#110/#112/#113 closed. Untracked known work: the post-open workspace (everything panel), the #112 Minimal Viable World checkpoint.
- Methodology census: the method's judgment calls cluster into decision points at the "one block of steward-fillable data" grain (ratified). The critical path (kernel → decomposition → seed audit → admission → propagation → conditional passes → QA) holds a few dozen such blocks; guidance and prompts must be a content layer addressed by decision point, not per-flow prose.
- Spec seams worth fixing in passing (from the corpus read): `qa_pass` (qa-flow.md) vs `qa_scorecard` (schema-v1.md, markdown-export.md) naming; Prompt-out as standalone destination (browser-visible-guidance-acceptance.md) vs strictly in-flow (creation-flow.md) tension; the Propagation-before-Contradiction ordering dependency (owed-boundaries queue) absent from the navigation spec's handoff list; four pre-template flow specs not yet on `guided-flow-spec-template.md`'s shape.

## Ratified decision ledger

```
Decision: RATIFIED prompt-out mission -> proposal prompts first-class at every decision point except world essence; steward curates; sovereignty at adoption + admission; pressure roles remain; rationale: steward's explicit intent; 20's "proposer" opening and risk bands half-licensed it; prior-app failure was wholesale delegation, not drafting per se.
Decision: RATIFIED prompt grain -> one prompt per decision point = one coherent block of otherwise-hand-filled data, never per field, never per flow; rationale: steward correction of the census grain.
Decision: RATIFIED replacement-grade bar -> charter mission sentence + W-9; rationale: three trials rediscovered file-paths-as-guidance; specs alone don't bind future PRDs.
Decision: RATIFIED home surface -> map-first shell (W-10); flows become destinations; main.tsx decomposes into routed views; rationale: the method is a loop with owed parallel work; nothing answered "where am I".
Decision: RATIFIED strategy -> seam program, then parity trials resume as validation; rationale: remaining stretches would re-trip known classes; the parity loop is blind to F-1.
Decision: RATIFIED deliverable -> two-tier doc package this session (package 1.1 + principles + this report); docs only, no commits.
```

## Changed this session (docs only)

- `docs/worldbuilding-system/20_ai_assisted_workflow.md` — two assistance modes, proposal workflow, proposal prompt discipline, anti-automation clarification, new output label.
- `docs/worldbuilding-system/00_overhaul_notes.md` — version-1.1 amendment record (steward-decided; proposal mode flagged untested).
- `docs/worldbuilding-system/README.md`, `manifest.json` — version 1.1 / iteration 10; coverage statement extended.
- `docs/principles/canon-sovereignty.md` — W-1 rewritten for two modes; context-list made mode-appropriate.
- `docs/principles/workflow-principles.md` — W-1 mapping now decision-point-scoped, two modes, packet = decision-point context.
- `docs/principles/charter.md` — replacement commitment in Mission; version reference updated.
- `docs/principles/domain-fidelity.md` — version reference updated.
- `docs/principles/guided-workflow-usability.md` — W-9 and W-10 added; prompt-context section now states "one context assembly, two renderings."
- `docs/principles/README.md` — index rows for W-1 (retitled), W-9, W-10.
- `CONTEXT.md` — Workflow map term; decision-point grain sentence; prompt-out step mode reference; version reference.

## The program (four PRDs, in order)

### PRD-A — Decision-point contract and context assembler (server tier)

**Problem:** three hand-built decision-point payloads; prompt packets bound per-template to single records; proposal mode has no lifecycle.
**Scope:** extract ONE server-owned decision-point payload contract (state, local decision, obligations, blockers, doctrine slots, write intent, next/resume, read-side trail — per W-8) that every flow serves; build the context assembler that renders that payload for the screen **and** assembles the prompt packet from the same context ("one assembly, two consumers" — a packet omitting what the screen shows is a defect); add proposal-mode prompt generation alongside pressure mode per amended W-1 (essence exception enforced; skip records unchanged; advisory store unchanged; adoption stays an explicit steward act). Replace `prompt-out-context-assembly.md`'s per-template special cases with the general rule.
**Out of scope:** new flows; UI beyond what proving the contract needs.
**Touches:** ADR 0006/0007/0008/0009; `canon-sovereignty.md` W-1/P-2; `guided-workflow-usability.md` W-8/W-9; `docs/specs/prompt-out-context-assembly.md`; the three existing payload implementations (Admission, Creation, Constraint) as the extraction source.

### PRD-B — Map-first shell (web tier)

**Problem:** F-2. The everything panel; no launcher; no journey.
**Scope:** implement W-10: upgrade `docs/specs/workflow-map-and-navigation.md` from orientation grammar to the shell spec (journey model over live world state, flow launcher, queue signals, between-flow states, the Propagation→Contradiction owed-boundaries dependency made explicit); decompose `main.tsx` into routed views (setup shell stays as shipped by #158; map = home; one flow visible at a time; Canon Workbench and substrate demoted to reachable-not-competing). Resolve the Prompt-out-as-destination tension: in-flow only on guided paths; the generic panel becomes substrate/admin.
**Out of scope:** visual design polish; new flow capabilities.
**Touches:** W-10, W-8, P-5; `workflow-map-and-navigation.md`; ADR 0009; every flow panel (relocation, not redesign).

### PRD-C — Replacement-grade guidance layer (content tier)

**Problem:** F-3. Doctrine shown as file paths and scattered hardcoded strings.
**Scope:** implement W-9: a versioned guidance-content layer addressed by decision point (the same derivation discipline as the operating card and default prompts), carrying: the decision in plain language, the operative rule in app wording, what good material looks like, why the method asks. Migrate existing hardcoded doctrine strings into it; demote package paths to provenance affordances everywhere; wire the layer into PRD-A's payload doctrine slots.
**Out of scope:** authoring guidance for untested surfaces (`10`,`11`,`14`–`17` stay schema-only per T-8).
**Touches:** W-9, P-1 (derivation re-check duty), `domain-fidelity.md`; `browser-visible-guidance-acceptance.md` (its "app-owned rule text" bar becomes checkable against the layer).

### PRD-D — Flow adoption and prompt-mode rollout

**Problem:** F-4 residue. Propagation, Stage-12, Stage-13, and QA are `browser-exposed` only; prompt paths beyond Creation decomposition unproven; specs on the old shape.
**Scope:** adopt PRD-A's contract and PRD-C's content in Propagation, Stage-12, Stage-13, and QA (adoption, not bespoke retrofit); roll proposal+pressure modes across all prompt templates; fix the `qa_pass`/`qa_scorecard` naming seam; bring the four pre-template flow specs onto `guided-flow-spec-template.md`'s shape as they're touched; update `docs/methodology-coverage.md` maturity rows honestly; update `.claude/skills/parity-field-trial/SKILL.md` so the prompt-out beat tests both modes and the mission is 1.1's.
**Out of scope:** the `09` temporal flow (#111) and the #112 MVW checkpoint — groom these as ordinary follow-ups **after** the program; export changes; LLM API (charter non-goal stands).

### After the program

Parity trials resume as the **acceptance instrument**: walk the frontier (next stop per Trial 03: Admission for FAC-1) expecting V-findings; a flow claims done only at `walkthrough-passed` on the coverage ledger's maturity scale. Trials stop being the discovery mechanism for architecture — that is what this program just did.

## Provenance

- Steward intent: this session's ratified answers (prompt mission, grain, bar, shell, strategy, deliverable).
- Trials: `reports/app-parity-trial-01-creation-decision-points.md`, `-02-setup-open-world.md`, `-03-replacement-guidance-prompt-context.md`; methodology trials `reports/eighth-` and `ninth-iteration-field-trial.md`.
- Audits/research: the 2026-07-04 divergence audit (issues #109–#113), `reports/workflow-usability-doc-overhaul-research-report.md` (R1–R15), `reports/principles-third-iteration-outlook.md`, `reports/build-start-plan.md`.
- Authorities read: all of `docs/worldbuilding-system/` (58 files), `docs/principles/` (7), `docs/specs/` (14), `docs/adr/` (9), `docs/methodology-coverage.md`, `CONTEXT.md`, `docs/agents/domain.md`; app surface inventory of `packages/web` and `packages/server`.
- Tracker: #111 open; #109/#110/#112/#113 closed; PRDs #45/#133/#141/#150/#158/#165 closed.
- External research: none used — every divergence was internal, and the 07-04 research report already carried the external-evidence pass.

## Principles

Touches `charter.md` (Mission, P-3, P-4, T-8), `canon-sovereignty.md` (P-2, W-1, T-5), `domain-fidelity.md` (P-1), `workflow-principles.md` (P-5, W-1–W-4, W-7), `guided-workflow-usability.md` (W-8, W-9, W-10), `data-principles.md` (P-6, W-5, W-6), ADRs 0006–0009, and `docs/worldbuilding-system/20_ai_assisted_workflow.md` (v1.1). The package amendment was routed through the package's own change process per P-1, not designed around. It affirms non-contradiction with the amended documents.
