# Field Build 05 Affect Ledger PRD Prep

**Source artifact reassessed:** `reports/field-build-05-affect-ledger.md`
**Primary field evidence:** `/tmp/worldloom-field-build/affect-ledger.worldloom.sqlite`, screenshots under `/tmp/worldloom-field-build/screenshots/field-build-05-*.png`, and cold prompt packets/outputs under `/tmp/worldloom-field-build/cold-llm/field-build-05-*.md`
**Live checkout checked:** `f57d416` on `main`
**Tracker freshness:** `gh issue list --state open --limit 200 --json number,title,labels,state` returned `[]` on 2026-07-08.
**Deliverable status:** PRD-ready prep only. No PRDs, issues, product-code patches, spec patches, or tracker changes have been created from this report.

## Reassessment Verdict

Field Build 05 is post-closeout evidence against the PRD #267-#270 repair wave. The app is substantially better than Field Build 04, but two blocking seams remain after a real Admission full-gate completion:

- The accepted full-gate fact statement is not the unambiguous current living fact text. The current `FAC-1` body still carries the broader proposed seed, while the narrower operative gate statement lives inside `GAT-2`.
- The Admission-created propagation debt is visible as `DEB-1`, but it has no typed source-fact relationship, so `/api/propagation/queue` cannot return `sourceFact` or a start route.

Recommended first PRD seam: **Admission full-gate standing and Propagation handoff integrity**. Treat full-gate completion as one end-to-end contract: the accepted standing text, original proposal history, gate result, follow-up debt, workflow map owed item, Propagation queue route, and Canon Workbench readback must agree.

The prompt-out and Creation findings are real, but they are better as follow-on PRDs or sibling issue families after the blocker PRD:

- Prompt-out still needs primary-active-region cleanup and an Admission mode selector.
- Creation needs a post-park correction path when prompt-out reveals over-bundled seeds.
- Kernel section prompt coverage remains an audit question, not immediate product scope unless the next field run prioritizes it.

Supporting skill result: Domain model unchanged. No new app-layer terms are owed to `CONTEXT.md`; the core terms here are upstream methodology terms (`canon status`, `living record`, `gate result`, `canon debt`, `fact statement`) or existing app terms (`Admission flow`, `Prompt-out step`, `Prompt packet`, `Workflow map`). No ADR-worthy architecture decision is resolved by this prep; current ADRs already assign the relevant module boundaries.

External research: skipped. This prep used repo authorities, live GitHub tracker state, current code, and local field evidence only.

## Evidence Checked

Report artifacts existed at the named paths:

- Screenshots confirmed present: `field-build-05-04-regression-core-proposal-available.png`, `field-build-05-06-seed-parked.png`, `field-build-05-09-admission-full-gate-blank.png`, `field-build-05-12-full-gate-exact-payload.png`, `field-build-05-13-admission-complete.png`, `field-build-05-14-propagation-owed-run-disabled.png`.
- Cold-prompt files confirmed present: `field-build-05-core-promise-proposal-prompt.md`, `field-build-05-admission-full-gate-pressure-prompt.md`, `field-build-05-admission-severity-proposal-prompt.md`, `field-build-05-seed-decomposition-proposal.md`, `field-build-05-seed-decomposition-pressure.md`, `field-build-05-world-premise-pressure-prompt.md`.
- World file confirmed present: `/tmp/worldloom-field-build/affect-ledger.worldloom.sqlite`.

Direct SQLite readback for the two blockers:

- `FAC-1` record id `3`, type `canon_fact`, status `accepted with constraints`, body remains the broad seed: Nico sees emotional readouts after the accident, with categories, limits, and ordinary encounters.
- `GAT-2` record id `5`, type `gate_result`, includes the narrower `Fact statement:` that admits only direct-encounter readout labels after the accident and explicitly excludes mechanism, objective reliability, universal exclusivity, category expansion, mediated contact, mind reading, causes, memories, intentions, future actions, and externally inspectable proof.
- `DEB-1` record id `6`, type `canon_debt`, title `Propagation owed for FAC-1`, scope `propagation`, state open, but no `derived_from` link connects it to `FAC-1`.
- Existing links around the blocker were `FAC-1 -> KER-1`, `FAC-1 -> SEE-1`, `FAC-1 -> GAT-1`, and `FAC-1 -> GAT-2`; there was no debt-to-source-fact link for `DEB-1`.

This matches the report's symptoms: the Canon Workbench can show the accepted broad card body while the gate result holds the narrowed statement, and Propagation cannot infer `sourceFact` from the Admission-created debt.

## Authority Findings

No methodology-package amendment is warranted. `docs/worldbuilding-system/06_canon_fact_admission_protocol.md` says cards are living records updated in place as canon changes, while gate results and reports are unedited audit trail. `docs/worldbuilding-system/03_truth_layers_and_canon_governance.md` says cards state current canon and outgoing wording moves to history. `docs/worldbuilding-system/22_glossary.md` defines canon status as governance standing. The package already condemns a live fact card that leaves current standing ambiguous.

No principles amendment is warranted. The current principles are enough:

- `workflow-principles.md` W-7: gates demand substance, not clicks.
- `guided-workflow-usability.md` W-8 and W-9: guided flows must expose what is owed, what will be written, what happens next, and must replace package files in normal use.
- `data-principles.md` W-5 and W-6: record once, view anywhere; living records state the present tense and reports remain append-only audit trail.
- `canon-sovereignty.md` P-2 and W-1: prompt-out remains advisory; final canon wording is steward-authored.
- `domain-fidelity.md` P-1 and T-2: package terms and separated labels stay exact.

No ADR amendment is warranted. ADR 0006 keeps Admission as the canon-standing transition boundary; ADR 0007 keeps Prompt-out as a step-oriented advisory module; ADR 0008 keeps flow persistence with the owning flow; ADR 0009 says browser guided-flow state is a first-class decision surface over server policy. The failures are under-specified or under-implemented contracts inside those boundaries, not boundary reversals.

Specs and coverage should change through PRD work:

- `docs/specs/admission-flow.md` should make the standing-text rule executable: for full-gate completion, the accepted `Fact statement` section becomes the current living fact text unless the steward explicitly chooses and reviews a different current standing body. The original proposal body remains history/source context, not the operative current fact.
- `docs/specs/canon-workbench.md` should require detail/current views to distinguish current living fact text, gate-result audit text, outgoing proposal wording/history, and linked follow-up debt.
- `docs/specs/propagation-flow.md` and `docs/specs/admission-flow.md` should require Admission-created propagation debt to carry a typed source-fact relationship that the Propagation queue turns into `sourceFact` and a start/resume route.
- `docs/specs/prompt-out-context-assembly.md` should tighten stale-packet display: stale packets are prior-origin evidence, not the primary active prompt body.
- `docs/specs/admission-flow.md` should require a visible Admission prompt mode selector wherever both Proposal and Pressure are advertised.
- `docs/specs/creation-flow.md` should add a post-park correction path for over-bundled seeds discovered by prompt-out critique.
- `docs/methodology-coverage.md` should regain caveats for the contradicted active routes until the next PRD closeout proves them under Field Build 05's exact route.

## Prior-Art Frame

Relevant closed tracker context:

- PRD #267 and issues #273-#278: Admission full-gate trust, exact final review, unique labels, section-key validation, draft Prompt-out context, active replay.
- PRD #268 and issues #279-#282: active Prompt-out packet identity across Creation and Admission.
- PRD #269 and issues #283-#285: Creation non-premise Proposal active route.
- PRD #270 and issues #286-#291: Propagation active destination replay.
- Earlier context: PRD #173, #222, #231, #249, #250, #251, #266.

Field Build 05 framing:

| Finding | Prior-art status | PRD impact |
|---|---|---|
| `V-REG-01` non-premise empty kernel Proposal works | Confirms PRD #269 | No new PRD. Keep as validation evidence. |
| `P-01` Prompt-out identity safer but not atomic | Extends/reopens part of PRD #268 | Follow-on Prompt-out PRD: stale content should leave the primary active region. |
| `F-01` accepted card body diverges from gate statement | Extends/reopens PRD #267 | First blocker PRD: standing text/readback parity. |
| `V-REG-02` full-gate pressure packet includes current draft | Confirms PRD #267 | No new PRD except preserve regression coverage. |
| `P-04` Admission prompt modes advertised but not selectable | New/extends PRD #231/#267/#268 | Follow-on or sibling Prompt-out PRD: Admission mode selector. |
| `F-02` Admission-created propagation debt cannot start | Extends/reopens PRD #270 | First blocker PRD: Admission debt-source linkage and Propagation route. |
| `F-03` Creation critique after parking lacks correction actions | New/extends PRD #222/#165 | Follow-on Creation refinement PRD. |
| `Q-01` kernel section-specific prompt coverage bounded | Audit question | Defer to next field-build coverage plan or small audit issue. |

## Recommended First PRD

### PRD - Admission Full-Gate Standing And Propagation Handoff Integrity

**Purpose:** Close the Field Build 05 blockers by making full-gate completion produce one coherent current fact and one startable owed Propagation route.

**Sources:** `reports/field-build-05-affect-ledger.md` (`F-01`, `F-02`, `V-06`, `V-07`), `/tmp/worldloom-field-build/affect-ledger.worldloom.sqlite`, PRD #267, PRD #270, `docs/specs/admission-flow.md`, `docs/specs/canon-workbench.md`, `docs/specs/propagation-flow.md`, `docs/specs/workflow-map-and-navigation.md`, `docs/specs/browser-visible-guidance-acceptance.md`, `docs/worldbuilding-system/03_truth_layers_and_canon_governance.md`, `docs/worldbuilding-system/06_canon_fact_admission_protocol.md`, `docs/worldbuilding-system/22_glossary.md`, ADR 0006, ADR 0008, ADR 0009.

**Problem:** Field Build 05 completed a severe full gate cleanly enough to write `GAT-2`, status, tags, operation, and `DEB-1`, but the current read model and onward route diverged:

- `FAC-1` remained broadly worded while `GAT-2` held the accepted narrowed `Fact statement`.
- The steward cannot tell whether current canon is the proposal body or the accepted gate statement without reading the gate report and applying operator judgment.
- `DEB-1` was open and scoped to propagation, but it had no typed source link to `FAC-1`, so the active Propagation queue returned `sourceFact:null`, `route:null`, and a disabled `Start/Resume Owed Run`.

**Recommended product rule:** The full-gate `Fact statement` section is the default accepted standing text for the living fact card. If the steward intentionally wants a different current body, the final review must make that difference explicit and require review of both fields. The original proposed body is preserved as history/source context and in the gate result, not left as the operative current fact by accident.

**Scope:**

- Update `docs/specs/admission-flow.md` with the standing-text rule and final-review/readback acceptance.
- Update `docs/specs/canon-workbench.md` so Current Canon and record detail expose current living text, gate-result audit text, outgoing proposal/history, operation/tags, and linked follow-up debt without making the steward infer standing from raw records.
- Update `docs/specs/propagation-flow.md` and `docs/specs/workflow-map-and-navigation.md` to require Admission-created propagation debt to carry source fact identity into owed queue rows and route bodies.
- In `packages/server/src/admission-flow.ts`, map full-gate `fact_statement` section substance into the living record body by default, preserve outgoing broad body in history, and create a typed `derived_from` or equivalent source relationship from the follow-up debt to the admitted fact.
- In `packages/server/src/propagation-flow.ts` and `packages/server/src/world-file.ts`, keep or deepen source-fact resolution around typed links and add focused regression tests for Admission-created debt, not only manually linked representative debt.
- In `packages/web/src/main.tsx`, make exact final review display accepted standing text distinctly from source/proposal history, and ensure the Propagation owed queue enables `Start/Resume Owed Run` for Admission-created debt.
- Update coverage caveats once the active Field Build 05 replay path passes.

**Acceptance:**

- Same-runtime browser replay starting from a proposed Creation seed, through severe Admission full gate, to Propagation.
- Final review shows accepted standing text sourced from full-gate `Fact statement`, original proposal/source body, target status, operations, constraint tags, consequence, gate sections, follow-up debt, and read-side trail.
- Completion readback shows `FAC-1` current body equal to the accepted constrained statement or an explicitly reviewed alternative standing body; outgoing proposal body appears in history/source context.
- `GAT-2` remains append-only audit trail and includes the full gate sections under stable headings.
- `DEB-1` has a typed source relationship to `FAC-1`.
- `/api/propagation/queue` returns `sourceFact` and `route` for the Admission-created debt.
- Active Propagation shows source fact, owed debt, severity, controls, prompt-out, blockers, and an enabled `Start/Resume Owed Run` from the owed item.
- Regression proof includes API/readback evidence from the field route, not only a manually linked representative fixture.
- `docs/methodology-coverage.md` no longer claims the contradicted active routes are mature until this proof lands.

**Likely issue slices:**

- Spec and coverage caveat update for Field Build 05 blockers.
- Admission standing-text payload and final-review/readback parity.
- Canon Workbench current/gate/history/debt presentation.
- Admission-created propagation debt source link and server queue route.
- Active Propagation replay from full-gate-created debt.
- Browser/API closeout report with Field Build 05 replay evidence.

**Out of scope:**

- Prompt-out stale-region UX cleanup beyond what this PRD needs for final review.
- Admission prompt mode selector, unless a child slice needs it for the blocker replay.
- Creation split/retract/recompose.
- Direct LLM integration or automatic canon text adoption.
- Methodology-package, principle, or ADR amendments.

## Follow-On PRD Candidates

### Candidate 2 - Prompt-Out Active Region And Admission Mode Selection

**Purpose:** Finish the Prompt-out safety/friction work Field Build 05 still found after PRD #268.

**Sources:** `P-01`, `P-04`, PRD #268, PRD #231, PRD #267, `docs/specs/prompt-out-context-assembly.md`, `docs/specs/admission-flow.md`, ADR 0007, ADR 0009.

**Scope:**

- Treat flow, world, record, section, step, mode, template, body, packet hash, severity, and full-gate draft hash as one active prompt identity.
- When identity changes, the primary active prompt region should be empty or explicitly say no active packet is loaded.
- Stale packets may remain only behind collapsed prior-origin disclosure with copy/export/store disabled.
- Add an Admission prompt mode selector wired to the selected server-returned mode `stepRequest`, parallel to Creation and Propagation.
- Show selected Admission mode beside the load button and source manifest.

**Acceptance:** Field route replay through Creation premise pressure, Core promise proposal, Admission severity proposal/pressure, Admission full-gate pressure, and Propagation navigation. At each point the active prompt body is either current and copyable or absent; stale prior-origin content is collapsed/non-copyable. Admission Proposal and Pressure are both user-selectable wherever the contract advertises both.

### Candidate 3 - Creation Post-Park Seed Correction

**Purpose:** Let the steward act when prompt-out critique reveals that a parked seed is over-bundled after Creation has already written it.

**Sources:** `F-03`, `docs/specs/creation-flow.md`, `docs/specs/admission-flow.md`, PRD #222, PRD #165, `docs/worldbuilding-system/05_creation_protocol.md`.

**Scope:**

- Add post-park correction actions to the Creation handoff:
  - split one parked seed into sibling proposed facts;
  - retract or rewrite a parked proposed seed before Admission;
  - carry a structured Admission narrowing note when the steward intentionally defers narrowing to Admission.
- Preserve provenance from kernel, original seed-decomposition report, old proposed seed, new sibling facts, and Admission queue entries.
- Keep Creation clear that it parks proposed material only; Admission owns first canon standing.

**Open design point for the PRD pass:** choose whether retract/rewrite mutates the living proposed fact with history, supersedes it with a new proposed fact, or writes a new append-only seed-decomposition correction report. The strongest default is probably a new correction report plus proposed fact update/history, but this deserves explicit PRD treatment.

**Acceptance:** After seed-decomposition Proposal/Pressure flags bundling, the routed Creation handoff offers the three correction paths. Splitting creates sibling proposed facts in the Admission queue with source links. Retract/rewrite keeps original provenance visible. Admission narrowing note is visible to Admission without changing canon standing.

### Candidate 4 - Kernel Section Prompt Coverage Audit

**Purpose:** Close `Q-01` by testing proposal and pressure packets for every exposed non-premise kernel section.

**Sources:** `Q-01`, `V-REG-01`, `docs/specs/creation-flow.md`, `docs/specs/prompt-out-context-assembly.md`.

**Scope:** A narrow audit or field-build harness update, not a product PRD unless failures are found. Confirm each exposed section has the expected Proposal availability, Pressure blocker/availability, selected heading identity, source manifest, omissions, advisory warning, and no accidental world-premise essence refusal.

**Acceptance:** Coverage table names each kernel section and mode as passed, refused correctly, blocked correctly, or failed with a new finding.

## Rejected Or No-Op Alternatives

- **Amend `docs/worldbuilding-system/`.** Rejected. Field Build 05 says the methodology was actionable and the package already defines living records, gate results, canon standing, and propagation debt enough to condemn the blockers.
- **Add a new principle.** Rejected. Existing W-8/W-9/W-7/W-1/W-5/W-6/P-2/P-5 language is sufficient.
- **Add or amend an ADR.** Rejected for now. The current ADRs already assign Admission, Prompt-out, persistence, and browser-flow boundaries.
- **Treat PRD #267-#270 as still fully closed.** Rejected. Field Build 05 is stronger evidence for the real active route than the representative closeout fixtures.
- **Solve F-02 only by parsing `FAC-1` from the debt title or body.** Rejected. `data-principles.md` T-3 says identifiers and cross-references are app-owned; the durable fix is a typed link/relationship, not title parsing.
- **Leave the broad proposal body as current canon and expect the steward to inspect `GAT-2`.** Rejected. It violates living-record/read-side clarity and keeps the docs/operator judgment in the loop.
- **Fold every open finding into one huge implementation PRD.** Rejected as a first move. The two blockers share an end-to-end completion/handoff seam; Prompt-out and Creation correction can follow without blocking the first repair.
- **Patch code immediately from this reassessment.** Deferred. The requested stopping point is PRD-ready preparation, not implementation.

## PRD Publication Inputs

Use these common fields when turning this into PRD(s):

- **Principles section:** cite `docs/principles/README.md`, `guided-workflow-usability.md` W-8/W-9/W-10, `workflow-principles.md` W-1/W-2/W-3/W-7, `data-principles.md` W-5/W-6/T-3/T-5, `canon-sovereignty.md` P-2/W-1, and `domain-fidelity.md` P-1/T-2.
- **Relevant ADRs:** first blocker PRD cites ADR 0006, ADR 0008, and ADR 0009; Prompt-out follow-on cites ADR 0007 and ADR 0009.
- **Canonical gates:** `pnpm test`, `pnpm typecheck`, `pnpm build` for broad workflow/spec/code changes. Narrow child issues may run package-focused tests first, but parent closeout should run all three.
- **Browser evidence:** no committed global e2e hard gate exists. Require targeted browser-visible proof, screenshots, component render tests, or manual walkthrough per `docs/specs/browser-visible-guidance-acceptance.md`.
- **Field replay evidence:** active-route replay should start from Creation seed -> Admission full gate -> Propagation owed queue using `/tmp/worldloom-field-build/affect-ledger.worldloom.sqlite` or a fresh equivalent world that reproduces the same structure.
- **Cold LLM evidence:** only required for Prompt-out packet completeness scopes. If no external cold LLM executor is available, state that honestly and do not claim cold-packet success.
- **Tracker state:** no open issues existed at prep time. Relevant closed parents/children: #267-#291, especially #267/#273-#278 and #270/#286-#291.

## Freshness And Boundaries

This prep refreshed live worktree status, branch/HEAD, open and recent closed issue state, principles, ADRs, relevant specs, coverage ledger, prior PRD closeout reports, implementation seams in `packages/server/src/admission-flow.ts`, `packages/server/src/propagation-flow.ts`, `packages/server/src/world-file.ts`, `packages/server/src/canon-workbench.ts`, and `packages/web/src/main.tsx`, plus focused tests by search.

This prep did not run product tests, start the app, create issues, publish a PRD, mutate tracker state, or patch product code/specs. It confirmed named `/tmp` evidence exists and directly queried the Field Build 05 SQLite records/links for the blocker facts, but it did not visually inspect the screenshots or independently run the cold LLM packets.

Existing worktree dirt before this file was created:

- Modified: `.claude/skills/field-build/SKILL.md`
- Untracked: `reports/field-build-05-affect-ledger.md`

This report adds only `reports/field-build-05-affect-ledger-prd-prep.md`.
