# Trial-Readiness Program — audit verdict and PRD seeds

**Date:** 2026-07-06 · **Baseline commit:** b0b1093 (branch `prd-173`, = main + one skills commit) · **Method version:** worldbuilding-system 1.1
**Session:** `/grill-with-docs` stewardship audit of the app's readiness for the parity-trial phase; every decision below was ratified live by the steward. This report is the durable record and the source for the three PRD issues it seeds. It follows `reports/method-surface-program.md` (the four-PRD program it declared is complete) and supersedes nothing.

## The question as felt

The steward's mission has five commitments: (1) the app fully replaces `docs/worldbuilding-system/*` in normal use, with all method instruction on screen; (2) parity with the package's workflows, divergences carefully justified; (3) every decision-point group represented; (4) two-mode prompt generation per decision-point group, structured on real prompting research, never hand-wavey; (5) prompts self-contained, carrying all context an external LLM realistically needs. The steward's two concerns entering the session: *what is still lacking for this to be fulfilled completely,* and *do `docs/principles/*` reflect the intentions in full?* The next planned step is a Codex skill that field-trials the app against the package from zero and evaluates generated prompts in isolated subagents.

## Verdict

The method-surface program (#170–#173) closed the architecture gap it was declared for. All seven guided flows — Creation (phases 1–2), Admission, Propagation, Constraint Composition, Stage 12, Stage 13, QA — serve the shared `decision-point/v1` contract in the routed browser shell with method cards, blockers, write intent, source manifests, and both prompt modes; a live Puppeteer walk this session confirmed setup → workflow map → Creation renders as specced. The principles encode all five commitments (W-9, P-1 + coverage ledger, W-8, W-1, cold-LLM test) and **stand unchanged**. What is lacking is not architecture: it is two known, recorded, but untracked content gaps sitting directly on the trial's path, plus the steward's explicit quality bar for prompt structure, which had doctrine-level grounding but no dedicated prompting-research pass. This session grooms all three as PRDs so the trial phase validates instead of rediscovering.

## Findings

### F-1 — The temporal pass (`09`) is field-tested upstream but flowless in the app; its tracker trail went dead.

The package README's version-1.1 claims name the temporal pass as field-tested and "generative rather than merely defensive in field use," and the recommended new-world path invokes it at step 8. The app covers `09` as sweep-inside-another-flow only: the `temporal_timeline` record type and generic editing exist, but there is no guided flow, no method cards, no temporal prompt modes. Issue #111 (the backlog holder) was closed during PRD #165 cleanup with "needs future PRD grooming," and nothing re-filed it; the coverage ledger still cited "#111 open." This is the largest true parity gap on the field-tested pipeline: a blind steward walking the new-world path in the app hits a wall where the package expects a generative pass. **Resolution: PRD-E below.**

### F-2 — Creation phases 4–8 have a ratified design decision (#112) but no implementation and no tracker presence.

Guided Creation covers phases 1–2 (kernel, seed decomposition); phase 3 routes to Admission, phase 9 to QA, phase 10 is the app itself. Phases 4–8 — minimal viable world, expand-along-pressure-lines, ordinary life, path dependence, factional answers — have no home. Issue #112 closed with a recorded decision: a **non-generative Minimal Viable World checkpoint** (option 2 — read-only coverage computed from existing records, no generation), deferred until the coverage ledger existed. The ledger has existed since #169; the checkpoint was never scheduled. Since #112 predates methodology 1.1, the checkpoint's decision points now also owe standard two-mode prompt-out under amended W-1 — externalized drafting via proposal prompts is no longer in tension with the clerk role. **Resolution: PRD-F below.**

### F-3 — Prompt packets are doctrine-complete but their structure predates a dedicated prompting-research pass.

The 10-section packet standard (`docs/specs/prompt-out-context-assembly.md`) and the cold-LLM test are grounded in the 2026-07-04 external research pass (context engineering, RAG, over-reliance) — but no research pass has examined *prompt structure itself*: instruction placement, section ordering, delimiter formats, long-context degradation, role-framing efficacy, proposal diversity, negative-constraint adherence, chat-paste output elicitation. The steward's bar is explicit: packet structure must be based on deep research, and the Codex trial should test the best-known structure rather than discover avoidable weaknesses. A deep-research pass was run this session (see PRD-G's findings digest and `reports/prompt-structure-research-report.md`). **Resolution: PRD-G below.**

### F-4 — Doc staleness (fixed this session).

`docs/methodology-coverage.md`'s Open Coverage Decisions row for `09` cited "#111 open" (closed); `.claude/skills/parity-field-trial/SKILL.md`'s report template pinned "Method version: worldbuilding-system 1.0" and its frontier note cited #111. Both are synced in this session's working tree: the ledger row and the skill's frontier note now point at PRD-E, and the skill template reads 1.1.

### Explored facts (audit answers, no decision owed)

- **Principles completeness:** all five steward commitments are encoded — W-9 (replacement-grade, file paths demoted to provenance), P-1 + the coverage ledger (parity with justified divergences), W-8 (decision-point contract at exactly the "coherent group of fields" grain), W-1 (proposal + pressure at every decision point, essence excepted), prompt-context spec (self-contained packets, cold-LLM test). No missing intention was found. Ratified: principles stand; prompt-structure findings land at spec altitude, not principle altitude.
- **Justified divergences stand:** chapters `10`/`11`/`14`/`16`/`17` remain schema-only under charter T-8 (the package itself declares them honestly untested); `15` remains a UI non-goal under ADR 0003. These are the "carefully justified divergences" the mission permits. The trial phase generates the evidence that could later promote them.
- **The Codex-skill plan has a local ancestor:** `.claude/skills/parity-field-trial/SKILL.md` already runs the dual-track walk (doc-track author + blind app steward via browser automation), the prompt-quality beat, typed findings, and PRD-seed reports. The planned Codex skill extends it; the delta is listed at the end of this report.

## Ratified decision ledger

```
Decision: RATIFIED gap strategy -> groom PRD-E (temporal `09` guided flow) and PRD-F (Creation phases 4–8 MVW checkpoint) now; rationale: both sit on the trial's new-world path; trials validate, not rediscover, known work.
Decision: RATIFIED prompt research -> dedicated deep-research pass on LLM prompting best practices now, before the trial; rationale: steward's explicit quality bar — the trial should test the best-known prompt structure.
Decision: RATIFIED research execution -> run the deep-research harness in this session; cited report in reports/; applicable findings seed PRD-G; rationale: authorized, keeps this the last pre-Codex session, preserves PRD conformance discipline.
Decision: RATIFIED principles verdict -> docs/principles/* stand unchanged; prompt-structure findings land at spec altitude (prompt-out-context-assembly.md + template texts); rationale: principles own what packets carry, the spec owns how they are structured.
Decision: RATIFIED deliverable depth -> program-style report in reports/ with three PRD seeds + create the three GitHub PRD issues (enhancement, ready-for-agent, Principles sections) this session; rationale: no intermediate /to-prd session before the Codex step.
Decision: RATIFIED doc hygiene -> fix directly: coverage-ledger `#111 open` row repointed at PRD-E, parity-field-trial skill template bumped to method version 1.1 and frontier note updated; rationale: trivial syncs; stale docs must not leak into the trial phase.
```

## The PRDs (three, in order)

### PRD-E — Temporal/Timeline (`09`) guided flow

**Problem:** the field-tested new-world path's step 8 names the temporal pass; the app offers only generic records. A blind steward cannot run temporal questions, date types, latency, sequence integrity, retrospective insertion, or the timeline audit from the UI, and no temporal prompt modes exist.
**Scope:** a dedicated Temporal/Timeline guided flow implementing `09_temporal_and_timeline_protocol.md`, `checklists/temporal_timeline_sweep.md`, and `templates/temporal_timeline_card.md`, built by **adoption** of the shared `decision-point/v1` contract, the W-9 guidance layer (new method cards for `09`'s decision points), and the shared two-mode prompt rollout (pressure role: spatial-temporal analyst per `workflow-principles.md`'s W-1 mapping). Entry from the workflow map's conditional-passes area with `09`'s own trigger rule surfaced (Level 2+ facts with first-appearance/discovery/institutional/branch/retcon/inheritance/war/migration/law/aging/evidence implications); run starts from a fact, capability, or pass-report resume, following the Constraint Composition (`08`, PRD #141) precedent. Sweeps propose — facts the pass generates route to Admission (W-3); skips are W-4 records; the master record follows W-5/W-6 (pass-report container or `temporal_timeline` card when timing is load-bearing). Coverage ledger row promotes `09` from sweep-inside-another-flow to guided flow with honest maturity; workflow-map payload and navigation spec gain the destination; browser walkthrough evidence per `browser-visible-guidance-acceptance.md`.
**Out of scope:** branching UI (T-6 stands; `09`'s timeline-branch material stays at its ADR 0003 schema door); spatial (`10`) and other untested passes.
**Touches:** `09`; `schema-v1.md` (existing `temporal_timeline` type); `workflow-map-and-navigation.md`; `guided-flow-spec-template.md` (new spec born on-template); W-8/W-9/W-10, W-1–W-7, P-1/P-3, T-8; ADR 0007/0008/0009; PRD #141 as precedent; `docs/methodology-coverage.md`.

### PRD-F — Creation phases 4–8: the Minimal Viable World checkpoint

**Problem:** `05`'s phases 4–8 ("Ordinary life is the test that separates a world from a backdrop") have no app surface; #112's ratified checkpoint decision was never implemented; naive stewards can ship backdrops without the app ever posing the phase-4 questions.
**Scope:** implement #112's option 2 as ratified — a **non-generative** Minimal Viable World checkpoint, computed read-only from live records (per seed: ordinary-life residue, adapted institution, factional disagreement, path dependence, mystery boundary — from phases 4/6/7/8), surfaced at Creation close and echoed in QA's first-coherence-audit entry (`05` phase 9 → `18`; the "first stable candidate" verdict language of `19`). The checkpoint renders coverage signals (clerk work, P-3) and collects **steward judgments** per dimension — covered, deferred with reason (a W-4 skip/debt record), or protected as mystery — never auto-verdicts. Decision points carry method cards for phases 4–8 doctrine (including phase 5's expand-only-along-pressure-lines rule) and standard two-mode prompt-out per amended W-1 (proposal externalizes drafting of, e.g., candidate ordinary-life residues, as advisory material; the app itself still generates nothing — #112's non-generative constraint is about the app, and v1.1 makes externalized drafting orthodox). Record shape (reuse of the `21` pass-report container vs. report sections on the Creation trail) is a grooming decision inside the PRD, bounded by T-4 (no invented structure) and W-6 (append-only report regime).
**Out of scope:** generative filling of any checkpoint dimension by the app; changes to Admission/QA jurisdiction; phases 3/9/10 (already routed).
**Touches:** `05` phases 4–8; `creation-flow.md`; `qa-flow.md` (first-audit echo); issue #112's recorded decision; W-1/W-2/W-4/W-7/W-8/W-9, P-3; `docs/methodology-coverage.md` (Creation row and open-decisions row).

### PRD-G — Prompt-packet structure hardening (research-fed)

**Problem:** the packet standard is context-complete by doctrine but its rendering order, formatting, and instruction placement were designed from first principles, not from prompting-effectiveness evidence; the steward's bar requires the trial to test the best-known structure.
**Scope:** apply the applicable findings of `reports/prompt-structure-research-report.md` (produced this session) to (a) `docs/specs/prompt-out-context-assembly.md` — packet section *ordering and rendering* rules alongside the existing content rules; (b) the versioned default prompt texts of every flow's templates (the `canon-sovereignty.md` "Default prompt texts" discipline governs: derivation re-checked, versioned, steward-editable); (c) structural conformance tests at the server prompt-generation seam. Findings digest and the concrete restructuring decisions live in the PRD issue; the research report is the citation target.
**Out of scope:** any change to *what* context packets carry (W-1's content list stands); LLM API integration (charter non-goal); principle amendments (ratified: spec altitude).
**Touches:** `prompt-out-context-assembly.md`; default prompt texts across the seven guided flows; `canon-sovereignty.md` W-1 discipline (conformance, not amendment); `20_ai_assisted_workflow.md` v1.1 (upstream, unchanged); the cold-LLM test (extended with structural criteria).

## After the PRDs: the Codex trial phase

Parity trials resume as the acceptance instrument once PRD-E/F/G land (sequencing is the steward's call; E and F are walk-blockers at their path positions, G improves every prompt the trial will grade). The planned Codex skill starts from `.claude/skills/parity-field-trial/SKILL.md` and adds this delta:

- **Dual-purpose findings:** the doc-track author also logs methodology defects (upstream package issues), not only app parity gaps — routed as proposed package amendments per P-1, never designed around.
- **Isolated prompt evaluation:** generated prompts are executed in cold subagents (no repo, no world context beyond the packet) and graded against the cold-LLM test and PRD-G's structural criteria — replacing the current skill's self-answered "external LLM" role, which cannot be blind to session context.
- **Same-world parallel build:** one world built from zero on both tracks through the workflows one by one, with per-stretch friction notes, per the steward's plan.
- **Port target:** a Codex skill (the steward's `~/.codex` harness), with the repo skill remaining the Claude-side ancestor.

## Provenance

- Steward intent: this session's six ratified decisions (ledger above).
- Authorities read: `docs/principles/*` (7 files, full), `docs/methodology-coverage.md`, `docs/specs/prompt-out-context-assembly.md`, `guided-flow-spec-template.md` (shape), package `README.md` v1.1 claims and recommended paths, `09_temporal_and_timeline_protocol.md` (full), `05_creation_protocol.md` (phase spine), `19_worked_examples.md` (first-stable-candidate verdict), `reports/method-surface-program.md`, `reports/prd-173-adoption-walkthrough.md`, `.claude/skills/parity-field-trial/SKILL.md`, `CONTEXT.md`, `docs/agents/domain.md`.
- Live evidence: Puppeteer walk at commit b0b1093 — setup method card, workflow map (stages, queues, next-decision), Creation method card + kernel decision contract + prompt preview + source manifest + write preview, Substrate admin surface.
- Tracker: zero open issues at session start; PRDs #170–#173 and children #174–#199 closed; #111 and #112 closed with recorded but untracked follow-up intent (now PRD-E/PRD-F).
- External research: **used** — deep-research pass on prompt structuring, `reports/prompt-structure-research-report.md` (this session).
- Rejected alternatives: trials-first discovery of known gaps (wasted runs); principle-level prompt-quality bar (wrong altitude); research-brief handoff to another session (extra session before the Codex step); report-only close with a later `/to-prd` pass (same).

## Principles

Touches `charter.md` (Mission, P-3, P-4, T-8), `domain-fidelity.md` (P-1), `canon-sovereignty.md` (P-2, W-1, default-prompt discipline), `workflow-principles.md` (P-5, W-1–W-4, W-7), `guided-workflow-usability.md` (W-8, W-9, W-10), `data-principles.md` (W-4–W-6, T-4, T-6), ADR 0003/0007/0008/0009, and `docs/worldbuilding-system/` `05`/`09`/`18`/`19`/`20` v1.1 (upstream, unchanged — PRD-F and PRD-E implement, PRD-G conforms). It affirms non-contradiction; no package amendment is proposed.
