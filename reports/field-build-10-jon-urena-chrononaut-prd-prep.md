# Field Build 10 PRD-Ready Determination: Creation MVW Foregrounding

Source artifact: `reports/field-build-10-jon-urena-chrononaut.md`

Selected source sections: `Findings` entry `R-01`, with validation findings `V-01` through `V-04`, the prior-finding regression notes, and `For the app (PRD seeds)` used as supporting evidence.

Source durability status: untracked local report. The report is present in this checkout but is not known to git and is not visible on `origin/main`. Later PRD publication should summarize this report's conclusions rather than cite it as a stable published source unless it has been committed and publication-ref checked first. The screenshots, SQLite world file, prompt packets, readbacks, and cold-LLM outputs under `/tmp/worldloom-field-build/` are temp-only evidence and must be summarized, not cited by local path, in a published PRD.

Authored artifact status: new untracked PRD-ready determination artifact. This file is a local prep artifact until tracked, committed, and publication-ref visible.

Live checkout snapshot: branch `main`, HEAD `914126b`. Pre-write worktree dirt was `.claude/skills/field-build/SKILL.md`, `.claude/skills/grilling/SKILL.md`, `.claude/skills/implement/references/closeout-templates.md`, `.claude/skills/implement/references/tracker-closeout-gates.md`, `.claude/skills/to-issues/SKILL.md`, and `.claude/skills/to-prd/SKILL.md` modified, plus untracked `reports/field-build-09-the-bloom.md`, `reports/field-build-09-the-bloom-prd-prep.md`, and `reports/field-build-10-jon-urena-chrononaut.md`. Those were treated as pre-existing artifacts for this prep.

Tracker freshness: current open issue search for Minimal Viable World, MVW, Creation, workflow map, seed decomposition, Field Build, and PRD returned no matching open issues on 2026-07-09. Relevant closed tracker work inspected: PRD #202 and children #211-#217 for the shipped Minimal Viable World checkpoint, especially #215 and #217; PRD #308 and children #309-#312 for workflow-map pre-Admission state grammar and browser rendering; PRD #313 and #316 for the Field Build 09 Prompt-out currentness fix.

Deliverable status: PRD-ready determination only. No code, tracker, methodology, principle, ADR, or domain glossary mutation happened in this prep.

External research: skipped. The task is repo/report determination and all governing facts are local repo authorities plus GitHub tracker state.

Decision: RATIFIED artifact home and selected first scope -> write `reports/field-build-10-jon-urena-chrononaut-prd-prep.md` with Creation Minimal Viable World foregrounding as the selected first PRD; rationale: the user approved the recommended artifact home after the report, authorities, implementation surface, and tracker overlap were inspected.

## Reassessment Verdict

Field Build 10 validates that setup/open-world orientation, workflow-map entry, Creation kernel authoring, selected-section Prompt-out currentness, and the World premise pressure packet now work on the active route. No PRD is owed for those validation findings.

The remaining codebase-wide product work is narrow: the Creation destination should stop foregrounding the full Minimal Viable World checkpoint before admitted seed evidence exists. The checkpoint state grammar is correct and should remain server-owned, but the browser currently renders a not-owed future checkpoint with its decision contract and controls above active kernel authoring and seed decomposition. This makes a future checkpoint look like current Creation work.

Recommended first PRD seam: existing Creation browser destination and its React/browser tests, with a small spec clarification in `docs/specs/creation-flow.md`. Do not introduce a new server state-machine seam unless implementation proves the browser lacks enough server-returned state to distinguish owed from not-yet-earned checkpoint presentation.

Follow-on candidates: none from Field Build 10. The prompt-currentness issue from Field Build 09 is fixed in this report and already covered by closed PRD #313/#316.

Supporting skill result: Domain model unchanged - no new app-layer terms, no glossary edits owed, and no ADR-worthy trade-off was resolved by this prep.

## Evidence Checked

| Finding or candidate | Status | PRD impact |
|---|---|---|
| `V-01` setup and empty-world workflow map | Validated | No product scope. Setup/open-world and map-as-home orientation carried the method. |
| `V-02` prior `P-01` stale kernel prompt preview | Fixed validation | No product scope. Closed PRD #313/#316 behavior held in Field Build 10. |
| `V-03` kernel authoring and readback | Validated | No product scope. Creation saved all nine kernel sections plus explicit consequence mode. |
| `V-04` World premise pressure packet | Validated | No product scope. The captured pressure packet passed a cold-LLM probe and preserved advisory/canon boundaries. |
| `R-01` not-yet-owed Minimal Viable World checkpoint dominates early Creation | Fresh product scope | Selected first PRD. State is correct, but presentation over-foregrounds non-current checkpoint work before seed decomposition. |
| Field Build 09 `R-01` | Corroborating prior evidence | Strengthens priority. The same presentation friction appeared in two independent seeds. |

Live source checks:

- `packages/web/src/main.tsx` renders the full Minimal Viable World checkpoint before `Kernel authoring` and `Seed decomposition decision` in the Creation destination. The panel includes refresh/load actions, decision contract, whole-world signals, seed controls, disposition controls, proposal controls, and Prompt-out affordances even when the checkpoint is `not owed`.
- `packages/web/src/creation-decision-surface.test.tsx` currently asserts that the full Minimal Viable World checkpoint contract and controls render before `Kernel authoring`. The future PRD should invert or qualify that expectation.
- `packages/server/src/workflow-map.ts` already keeps the map state correct: Minimal Viable World becomes owed only after admitted seed evidence and after earlier owed queues lose priority; kernel-complete/no-seed worlds route to Creation seed decomposition.
- `docs/specs/creation-flow.md` already says the Minimal Viable World checkpoint is earned after admitted seed facts and that a saved `world_kernel` alone leaves Creation active or owed for seed decomposition.
- `docs/specs/workflow-map-and-navigation.md` already says the workflow map foregrounds seed decomposition before Admission and before later checkpoint work. The gap is the in-destination visual priority, not map state.

Tracker overlap:

- No matching open issues existed at refresh time.
- PRD #202 is closed and shipped the Minimal Viable World checkpoint. Its child #215 required the checkpoint to render as owed only when the server says admitted seed evidence exists, but it did not settle how compact a not-owed checkpoint should be inside the Creation destination.
- PRD #217 is closed and recorded checkpoint walkthrough evidence for the owed state, not the early-Creation not-yet-earned presentation discovered later by field builds.
- PRD #308/#311 are closed and fixed workflow-map pre-Admission state grammar and browser rendering. Field Build 10 confirms that state-level fix is not the remaining problem.
- PRD #313/#316 are closed and fixed Field Build 09 `P-01`; Field Build 10 validates that no new Prompt-out currentness PRD is needed.

## Authority Findings

No methodology, principle, ADR, or domain glossary change is owed before the next PRD.

Existing authorities already require the selected scope:

- `docs/worldbuilding-system/05_creation_protocol.md` places Minimal Viable World after seed decomposition and seed admission. Early Creation owes kernel authoring and seed decomposition first.
- `docs/specs/creation-flow.md` says a saved `world_kernel` alone keeps Creation active or owed for seed decomposition and does not earn Admission or later checkpoint work.
- `docs/specs/workflow-map-and-navigation.md` says a saved kernel with no parked proposed seeds foregrounds Creation seed decomposition, and Minimal Viable World is foregrounded only after admitted seed evidence and earlier queues.
- `docs/principles/guided-workflow-usability.md` W-8/W-10 require guided surfaces and the workflow map to show the current decision without letting non-current surfaces compete as peer first actions.
- `docs/principles/workflow-principles.md` P-5 and W-7 support keeping active guided work cheap and substance-oriented rather than forcing the steward to read through future controls.
- ADR 0009 supports browser guided-flow surfaces as renderers of server-owned flow policy. The fix should not move checkpoint readiness policy into the browser.

Spec changes are part of the future PRD. `docs/specs/creation-flow.md` should clarify that when the Minimal Viable World checkpoint is not owed because admitted seed evidence does not exist, the Creation destination may show only compact status and unlock guidance until active Creation work has been foregrounded. `docs/specs/workflow-map-and-navigation.md` probably needs no state-machine change, but it may be cited for the existing priority rule.

## Recommended First PRD

### Creation Minimal Viable World Foregrounding Before Seed Evidence Exists

Purpose: keep the active Creation path visually honest. A steward in an early world should see kernel authoring and seed decomposition as current work before seeing a full future Minimal Viable World checkpoint.

Sources:

- Field Build 10 `R-01`, summarized from `reports/field-build-10-jon-urena-chrononaut.md`.
- Field Build 09 `R-01`, summarized from `reports/field-build-09-the-bloom.md`.
- Closed PRDs #202, #215, #217, #308, #311, #313, and #316 as prior tracker context.
- `docs/specs/creation-flow.md`.
- `docs/specs/workflow-map-and-navigation.md`.
- `docs/specs/browser-visible-guidance-acceptance.md`.
- `docs/worldbuilding-system/05_creation_protocol.md`.
- `docs/principles/guided-workflow-usability.md`, `workflow-principles.md`, `data-principles.md`, and `domain-fidelity.md`.
- ADR 0009.

Problem:

The server and workflow map correctly know that Minimal Viable World is not owed before admitted seed evidence exists. But the Creation destination still renders the full checkpoint panel before active kernel/seed-decomposition work. In two field builds, the panel was correctly labeled `not owed`, yet its decision contract, controls, signals, prompt blockers, disabled actions, and proposal/disposition affordances occupied the primary reading path before the current Creation task.

Recommended product rule:

When the Minimal Viable World checkpoint is not owed because admitted seed evidence does not exist, the Creation destination must render it as a compact not-current status with an unlock reason, or move it below active kernel and seed-decomposition surfaces. Full checkpoint decision contract, disposition controls, proposal routing controls, per-seed coverage tables, and checkpoint Prompt-out controls should appear only when admitted seed evidence makes the checkpoint owed or when the steward explicitly expands the compact preview.

Scope:

- Creation destination presentation ordering for Minimal Viable World when `checkpoint.owed` is false because there is no admitted seed evidence.
- Browser copy that names the unlock condition without implying hidden work or completion.
- React/browser-surface tests that prove active Creation work appears before not-yet-earned checkpoint detail in empty-world and kernel-complete/no-seed states.
- Owed-state regression tests proving the full checkpoint still appears when admitted seed evidence makes it current.
- Narrow spec clarification in `docs/specs/creation-flow.md` for in-destination not-yet-earned checkpoint presentation.

Acceptance:

- In a new or kernel-complete/no-seed world, the Creation destination foregrounds kernel authoring and seed decomposition before Minimal Viable World checkpoint details.
- In that state, the checkpoint remains discoverable as `not owed` or `not yet earned` and names the unlock condition: admitted seed evidence is required.
- In that state, full checkpoint controls do not dominate the active path: disposition recording, proposal routing, per-seed coverage controls, and checkpoint Prompt-out loading are hidden, collapsed, moved below active work, or otherwise visually secondary.
- The browser does not compute checkpoint readiness locally; it consumes server-returned checkpoint/map state.
- When admitted seed evidence exists and the checkpoint is owed, the full Minimal Viable World decision surface still renders with decision contract, coverage signals, disposition controls, Prompt-out modes, Admission proposal routing, current/next/resume state, and read-side trail.
- The workflow map behavior from PRD #308 remains unchanged: kernel-complete/no-seed worlds route to Creation seed decomposition, Admission is not yet earned, and Admission queue `0` does not imply completion.
- The Prompt-out currentness behavior from PRD #313/#316 remains unchanged.
- Browser evidence includes a cognitive walkthrough from setup/open-world to Creation entry, kernel-complete/no-seed Creation, and owed checkpoint state after admitted seed evidence.

Likely issue slices:

1. Creation spec and test contract for not-yet-earned checkpoint presentation.
2. Browser Creation layout update for compact/moved not-current MVW checkpoint.
3. Active-route replay and closeout for Field Build 09/10 `R-01`.

Out of scope:

- Server workflow-map state-machine redesign.
- Minimal Viable World coverage algorithm changes.
- Checkpoint disposition, skip, debt, or Admission proposal behavior changes.
- QA Minimal Viable World echo changes.
- Creation kernel authoring or seed decomposition data-model changes.
- Prompt-out packet currentness, stale-state, or cold-LLM packet content changes, except for regression proof that existing behavior still holds.
- Direct LLM integration.
- Methodology edits to `docs/worldbuilding-system/05_creation_protocol.md`.

## Follow-On Candidates

### Coverage-only replay after implementation

Purpose: prove the future PRD closes the exact field-build complaint across both early Creation states: new/empty world and kernel-complete/no-seed world.

Problem: field builds found the presentation issue while doing real method work, not from a synthetic fixture. The closeout should replay a realistic early-world route rather than relying only on component render assertions.

Recommended rule or open design point: after the PRD lands, run a focused browser replay that starts in setup/open-world, enters Creation, saves or loads a kernel-complete/no-seed world, verifies active work comes first, then verifies the owed checkpoint state still expands after admitted seed evidence.

Scope: browser replay and closeout evidence only.

Acceptance: if replay finds the not-current checkpoint still visually dominates, reopen as product work rather than marking coverage complete.

## Coverage Follow-Up

The next field build should resume at seed decomposition for the Jon Urena world only after this presentation issue is either accepted as known friction or fixed. A future field build finding would become new product work only if it shows the compact/moved checkpoint still blocks task flow, hides the unlock condition, or breaks owed-state checkpoint access.

## Rejected Or No-Op Alternatives

- Treat Field Build 10 as fully covered by PRD #202. Rejected because #202 shipped checkpoint behavior and owed-state rendering; the field-build issue is pre-owed presentation priority discovered after that work.
- Treat the issue as fixed by PRD #308. Rejected because #308 fixed the workflow-map state and Admission queue grammar. Field Build 10 confirms that state is correct; the remaining problem is inside the Creation destination.
- Create a broad Creation redesign PRD. Rejected because the active route now validates setup, map, kernel authoring, prompt-out currentness, and cold packet usefulness. The only fresh product scope is not-current checkpoint foregrounding.
- Reopen Prompt-out currentness work. Rejected because Field Build 10 validates the prior `P-01` fix.
- Patch only copy from `not owed` to a stronger label. Rejected because the problem is visual order and control density, not only wording.
- Hide the checkpoint entirely until owed. Rejected as too strong unless the future PRD chooses it deliberately; the better default is compact discoverability with unlock reason.
- Change server checkpoint readiness. Rejected because live source and tracker evidence show the state grammar is already correct.

## PRD Publication Inputs

Suggested title:

`PRD: Creation MVW foregrounding - compact not-yet-earned checkpoint before admitted seeds`

Publication package: one PRD first, plus a coverage-only replay slice. No multi-PRD program is recommended.

Recommended testing seam: existing web Creation routed destination and React/browser-surface tests, plus existing server workflow-map/checkpoint payload fixtures for owed versus not-owed state. The later `/to-prd` pass still owes its seam checkpoint. Recommended seam wording: reuse existing seams unchanged; no new architecture seam unless the browser lacks sufficient server state.

`/to-prd` usage: consulted for house style only during this prep. It was not invoked, and no issue was published.

Likely label: `ready-for-agent` after `/to-prd` seam confirmation, if the PRD body maps the browser-visible guidance checklist and no open decisions remain. Downgrade to `needs-triage` if the PRD chooses a new server policy seam, hides the checkpoint entirely without ratification, or cites untracked/temp evidence as stable.

Principles, ADRs, specs, and prior PRDs to cite:

- `docs/specs/creation-flow.md`
- `docs/specs/workflow-map-and-navigation.md`
- `docs/specs/browser-visible-guidance-acceptance.md`
- `docs/worldbuilding-system/05_creation_protocol.md`
- `docs/worldbuilding-system/20_ai_assisted_workflow.md` for Prompt-out regression boundaries only
- `docs/principles/README.md`
- `docs/principles/guided-workflow-usability.md`
- `docs/principles/workflow-principles.md`
- `docs/principles/data-principles.md`
- `docs/principles/domain-fidelity.md`
- ADR 0009
- PRD #202
- PRD #215
- PRD #217
- PRD #308
- PRD #311
- PRD #313/#316 as closed no-op context for Prompt-out currentness

Browser-visible guidance checklist mapping requirements:

| Checklist item | Future PRD home |
|---|---|
| package source cited | Preamble and Principles should cite Creation protocol, Creation flow spec, workflow-map spec, browser-visible guidance, and ADR 0009. |
| decision-point contract named | Problem/Solution/Implementation should name Creation kernel authoring, seed decomposition, and Minimal Viable World checkpoint as the affected decision-point ordering. |
| required, optional, skippable, and severity-dependent fields visible where relevant | In scope for preserving active kernel/seed-decomposition fields and hiding/collapsing not-current checkpoint controls. Severity is N/A for Creation kernel and MVW. |
| doctrine at the actual decision point | In scope. Active Creation doctrine should appear before future checkpoint doctrine in early states. |
| prompt packet preview, source manifest, and cold external LLM test | N/A for new behavior unless checkpoint Prompt-out controls are touched; regression should prove existing Prompt-out behavior is not broken. |
| advisory/canon separation visible | N/A for compact not-current state; owed-state regression should preserve existing checkpoint advisory/canon warnings. |
| skip path and reason storage | N/A; the PRD should not alter skip behavior. |
| blockers/substance validation | In scope for unlock reason and disabled/not-current checkpoint status; no new substance validation expected. |
| current, next, and resume state | In scope. Early Creation should name current kernel/seed decomposition work before future MVW work. |
| read-side audit or provenance link | N/A for not-current presentation; owed-state regression should preserve existing read-side trail. |
| cognitive walkthrough | In scope. Use Field Build 09/10 sequence as the naive-steward path. |

Canonical gates:

- `pnpm test`
- `pnpm typecheck`
- `pnpm build`

Focused likely gates:

- web Creation decision-surface tests;
- web workflow shell tests preserving PRD #308 map behavior;
- server workflow-map tests only if payload shape changes;
- focused browser smoke/walkthrough for early Creation ordering and owed checkpoint regression.

Browser/cold-LLM evidence expectations:

- Active browser replay of setup/open-world into Creation with no admitted seed evidence.
- Kernel-complete/no-seed replay proving kernel authoring and seed decomposition are foregrounded before not-current MVW detail.
- Owed checkpoint replay with admitted seed evidence proving the full checkpoint still renders when current.
- Console check with zero errors/warnings or explicit triage.
- Cold external LLM is not expected for this PRD because the behavior is presentation ordering, not prompt packet content. If Prompt-out controls are touched, capture existing packet/advisory warnings as regression evidence.

Source durability warnings and temporary-path handling:

- `reports/field-build-10-jon-urena-chrononaut.md` is untracked in this checkout at prep time. A published PRD should say the Field Build 10 source report is a local untracked source summarized for the PRD unless it is committed and publication-ref visible before publication.
- `reports/field-build-09-the-bloom.md` and `reports/field-build-09-the-bloom-prd-prep.md` are also untracked at prep time. Use them as summarized prior local evidence unless committed and publication-ref visible before publication.
- Do not cite `/tmp/worldloom-field-build/...` paths in the published PRD. Summarize the evidence and, if durable evidence is needed, archive or track a cleaned evidence report first.
- This prep file is also new/untracked until committed and publication-ref visible. If `/to-prd` cites this file before that happens, it must mark it pending local publication or summarize it without durable-citation wording.

## Completion Self-Check

- `/to-prd` consulted for house style only: yes.
- Source artifact posture recorded: yes, Field Build 10 and Field Build 09 reports are untracked/local and `/tmp` evidence is temp-only.
- Authored artifact posture recorded: yes, new untracked prep artifact.
- Tracker freshness recorded: yes, no matching open issues and relevant closed PRDs/issues named.
- Selected first PRD recorded: yes, Creation Minimal Viable World foregrounding before seed evidence exists.
- Follow-on candidates recorded: yes, coverage-only replay.
- Recommended testing seam recorded: yes, existing Creation browser seam and existing workflow-map/checkpoint payload fixtures.
- Likely label and downgrade conditions recorded: yes.
- Canonical and focused gates recorded: yes.

## Freshness And Boundaries

Refreshed in this session:

- `reports/field-build-10-jon-urena-chrononaut.md`.
- `reports/field-build-09-the-bloom.md` and its prep artifact as prior local context.
- `docs/specs/creation-flow.md`.
- `docs/specs/workflow-map-and-navigation.md`.
- `docs/specs/browser-visible-guidance-acceptance.md` via issue-tracker checklist requirements.
- `docs/principles/README.md`, `guided-workflow-usability.md`, `workflow-principles.md`, `canon-sovereignty.md`, and `data-principles.md`.
- `docs/worldbuilding-system/05_creation_protocol.md` and `20_ai_assisted_workflow.md`.
- ADR 0001, ADR 0002, ADR 0007, and ADR 0009, with exact filename resolution after stale shorthand filenames were rejected by the filesystem.
- `packages/web/src/main.tsx`, `packages/web/src/creation-decision-surface.test.tsx`, `packages/web/src/workflow-shell.test.tsx`, and `packages/server/src/workflow-map.ts`.
- GitHub issue overlap for relevant open issues and closed PRDs/issues.

Not done:

- No app run or browser replay was performed for this prep.
- No tests were run because no code changed.
- No source report was committed, staged, or publication-ref checked.
- No GitHub issue or PRD was created.

Pre-existing worktree dirt:

- Modified skill files and closeout references listed in the live checkout snapshot.
- Untracked Field Build 09 report/prep and Field Build 10 report.

Files intentionally added or changed by this prep:

- Added `reports/field-build-10-jon-urena-chrononaut-prd-prep.md`.
