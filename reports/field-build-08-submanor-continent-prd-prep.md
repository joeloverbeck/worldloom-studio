# Field Build 08 Submanor Continent PRD Prep

**Source artifact reassessed:** `reports/field-build-08-submanor-continent.md`.
**Selected section:** findings `B-01`, `F-01`, `V-01` through `V-04`, "Regression of prior findings", "For the app (PRD seeds)", and "PRD #302 closeout addendum".
**Source durability status:** durable. The source report, `reports/prd-302-creation-correction-active-route-replay.md`, and `docs/methodology-coverage.md` are tracked, clean, and visible on `origin/main` in the current checkout. The source report summarizes machine-local field evidence; a later published PRD should cite tracked reports and, if this prep is still uncommitted, summarize this prep's conclusions without stable-citation wording rather than publishing local evidence paths.
**Live checkout checked:** `main` at `17f2d01` on 2026-07-09. Worktree was clean before this prep was written.
**Tracker freshness:** `gh issue list --state open --limit 80 --json number,title,labels,url,updatedAt` returned `[]`. PRD #302 and child closeout issue #307 were verified closed; PRD #302 closed at 2026-07-09T02:05:11Z, and #307 closed at 2026-07-09T02:04:52Z.
**Deliverable status:** PRD-ready determination only. This prep writes no product code, no specs, no methodology source, no principles, no ADRs, and no tracker mutation.

## Reassessment Verdict

Field Build 08 is mostly closeout evidence for PRD #302, plus one fresh workflow-map orientation defect.

- `B-01` is covered by recent commits and tracker closeout. The source report's addendum says Creation correction now returns `late_admission` and blocks direct split/retract/replace mutation after Admission severity/work state begins. Current source and test surfaces confirm that behavior, and PRD #302/#303-#307 are closed.
- `V-01` through `V-04` are validations. They should be preserved as regression constraints, not opened as fresh product work.
- Field Build 07's `P-04` and `P-05` packet-export/context gaps are covered by PRD #302 and PRD #297/packet-safety work.
- Field Build 07's `F-03` post-park correction gap is covered by PRD #302.
- Field Build 07's stale packet visual dominance remains a polish or verification candidate, not the first PRD from Field Build 08, because active identity/export safety held in `V-04`.
- The remaining first PRD should be **Workflow Map Pre-Admission Handoff Orientation**: after kernel completion but before seed parking, the map can mark Admission `done`, show Admission queue `0`, and point the next decision at review/QA even though Creation seed decomposition is still owed.

Recommended first PRD: **Workflow Map Pre-Admission Handoff Orientation**.

Supporting skill result: Domain model unchanged. This prep uses existing app and package vocabulary: Workflow map, Creation flow, Admission flow, world kernel, seed decomposition, proposed fact, Admission queue, Prompt-out step, Prompt packet, and steward. No new app-layer term is owed to `CONTEXT.md`, and no ADR-worthy decision is resolved here; current ADRs already assign the server/browser workflow boundaries.

External research: skipped. Repo authorities, current source, tracked field reports, and live tracker state were sufficient.

Decision: RATIFIED artifact home and first PRD prep scope -> write `reports/field-build-08-submanor-continent-prd-prep.md` focused on the workflow-map `F-01` follow-up, with PRD #302 work classified as covered; rationale: the user accepted the recommended artifact-home prompt and the prompt named this scope explicitly.

## Evidence Checked

Field Build 08 findings read and classified:

| Finding | Status | PRD impact |
|---|---|---|
| `V-01` Creation decomposition packets active/exportable/cold-useful | validation | No PRD. Preserve exact active export and cold usefulness as regression constraints. |
| `V-02` decomposition packet context includes parked seed and kernel | validation | No PRD. Covered by PRD #302/#304 and packet artifacts. |
| `V-03` post-park correction supports validation recovery and split before Admission | validation | No PRD. Covered by PRD #302/#303/#305/#306. |
| `B-01` late Admission does not block direct Creation mutation | covered blocker | No fresh PRD. Source addendum, current source, tests, browser proof, and closed #302/#303/#305/#307 cover it. |
| `F-01` Workflow map marks Admission done before any seed is parked | open friction | Recommended first PRD. |
| `V-04` PRD #297 stale/current packet guards hold | validation with visual polish caveat | Preserve safety. Stale-body visual hierarchy remains deferred verification/polish. |

Current source checks:

- Workflow map state derivation currently treats Creation as `done` when a `world_kernel` exists and no Creation flow is in progress.
- Admission stage state currently treats a world with a kernel and no Admission queue/in-progress Admission flow as `done`.
- The next-decision fallback can point at QA/review when no kernel is missing and no owed queues are foregrounded.
- Creation flow state can be complete only at `decomposition:complete`; before decomposition, an in-progress Creation flow can exist with saved kernel material and seed decomposition still owed. The map should reflect that pre-Admission handoff state.
- PRD #302 late-Admission blocking exists in current Creation correction source and tests: `late_admission`, `directMutationBlocked`, and `admission_started` are represented in server, web tests, and browser proof output.

Tracker overlap checked:

- Open GitHub issues: none.
- PRD #302 is closed with `enhancement` and `ready-for-agent` labels; it records Field Build 08 `F-01` as separate follow-up rather than a PRD #302 blocker.
- Child issues #303, #304, #305, #306, and #307 are closed.

Durable local evidence checked:

- `reports/field-build-08-submanor-continent.md`
- `reports/prd-302-creation-correction-active-route-replay.md`
- `docs/methodology-coverage.md`
- `docs/specs/workflow-map-and-navigation.md`
- `docs/specs/creation-flow.md`
- `docs/specs/admission-flow.md`
- `docs/principles/README.md`
- `docs/principles/guided-workflow-usability.md`
- `docs/principles/workflow-principles.md`
- `docs/principles/data-principles.md`
- `docs/principles/canon-sovereignty.md`
- ADR 0006, ADR 0008, and ADR 0009

## Authority Findings

No methodology-package amendment is warranted. `docs/worldbuilding-system/05_creation_protocol.md` and `docs/worldbuilding-system/operating_card.md` already put seed decomposition before frontloaded audit and first Admission. The source report also found no methodology-source `M` finding.

No principles amendment is warranted. Existing principles already require the fix:

- `guided-workflow-usability.md` W-10 defines the Workflow map as the home surface that shows live stage state, queues, and the next decision.
- `guided-workflow-usability.md` W-8 requires decision surfaces to show what happens next and why.
- `workflow-principles.md` P-5 keeps guided flows resumable and interleavable.
- `workflow-principles.md` W-3 says sweeps propose and only Admission admits; the map must not imply Admission has completed before any proposed seed exists.
- `data-principles.md` W-5/W-6 distinguish stored records from guided workflow state; the presence of a kernel record alone is not the whole Creation journey.

No ADR amendment is warranted. ADR 0009 already says browser workflow state is a guided decision surface over server-owned flow policy. ADR 0006 keeps Admission as the governance transition boundary. ADR 0008 supports keeping workflow-map derivation close to the owning server module rather than pushing policy into the browser.

Spec changes should be part of the future PRD:

- `docs/specs/workflow-map-and-navigation.md` should clarify the kernel-complete/no-seed state: Creation remains active or owed for seed decomposition; Admission is not `done`; the next decision points back to Creation seed decomposition until a proposed seed or under-review fact exists.
- `docs/specs/creation-flow.md` should clarify that kernel completion alone does not complete Creation phases 1-2; seed decomposition must park at least one proposed seed or otherwise show an explicit no-seed blocked state before Admission can be foregrounded.
- `docs/specs/admission-flow.md` likely needs no behavior change, but the future PRD should cite it to affirm that Admission queue work begins only when proposed/under-review facts exist.
- `docs/methodology-coverage.md` should be updated only if the implementation changes workflow-map maturity claims; otherwise closeout should explicitly confirm no coverage change.

## Recommended First PRD

### PRD - Workflow Map Pre-Admission Handoff Orientation

**Purpose:** Make the workflow map truthful between kernel completion and seed parking, so the steward is routed back to Creation seed decomposition instead of seeing Admission as done or QA/review as next.

**Sources:** Field Build 08 `F-01`; Field Build 08 decision-point log for kernel completion; `docs/specs/workflow-map-and-navigation.md`; `docs/specs/creation-flow.md`; `docs/specs/admission-flow.md`; `docs/worldbuilding-system/05_creation_protocol.md`; `docs/worldbuilding-system/06_canon_fact_admission_protocol.md`; `docs/worldbuilding-system/operating_card.md`; `docs/principles/guided-workflow-usability.md` W-8/W-10; `docs/principles/workflow-principles.md` P-5/W-3; ADR 0006 and ADR 0009.

**Problem:** After the steward completes the world kernel but before any seed is parked, the map can show Admission as `done`, Admission queue `0`, and a QA/review-style next decision. That is methodologically backward: Creation still owes seed decomposition, and Admission has not begun because no proposed seed exists.

**Recommended product rule:** A world with a saved kernel but no parked proposed Creation seed must keep Creation foregrounded for seed decomposition. Admission should be `not_yet_earned` or otherwise blocked/unavailable with an unlock reason naming proposed seeds, not `done`. The next decision should be Creation seed decomposition, not QA/review, until a proposed/under-review fact exists or an explicit flow state says no seed can be parked.

**Scope:**

- Update server-owned workflow-map derivation for the kernel-complete/no-seed state.
- Distinguish at least these early-world states in the map: no kernel, kernel in progress, kernel saved but seed decomposition owed, seed parked/proposed and Admission owed, and post-correction Admission queue active.
- Ensure stage state, destination state, queue count, unlock reason, and next decision agree with one another.
- Keep browser policy rendering server-owned; the web shell should consume the corrected map payload rather than deriving its own prerequisite logic.
- Add focused server workflow-map tests for a world with a saved kernel and no seed-decomposition report/parked seed.
- Add browser or rendered-shell proof only if the user-facing map text/state changes beyond server payloads; otherwise server map payload tests plus existing shell rendering tests may be sufficient.

**Acceptance:**

- In a fresh world with no kernel, Creation is active and Admission is not yet earned.
- After saving a complete enough kernel and consequence mode but before seed decomposition, Creation remains active or owed for seed decomposition.
- In that kernel-complete/no-seed state, Admission is not marked `done`; it states that proposed seeds are needed before Admission has work.
- The next decision points to Creation seed decomposition, not QA/review.
- Admission queue count remains `0` without implying Admission is complete.
- Once Creation parks proposed seeds, Admission becomes active and the next decision points to the Admission queue.
- Existing post-correction state from PRD #302 still shows Creation handoff/resume correctly and Admission active when corrected proposed facts exist.
- The map remains read-only and mints no records.
- Browser-visible guidance checklist mapping is present in the PRD body because this touches browser workflow navigation and guided-flow handoff state.
- Parent closeout runs the canonical root gates: `pnpm test`, `pnpm typecheck`, and `pnpm build`. Focused implementation should at least run the server workflow-map tests first.

**Likely issue slices:**

- Spec update for kernel-complete/no-seed workflow-map state.
- Server workflow-map derivation and tests for early Creation/Admission handoff states.
- Browser map rendering/readback proof if visible labels, unlock reasons, or next-decision copy change.
- Closeout replay proving Field Build 08 `F-01` is gone and PRD #302 handoff state still behaves.

**Out of scope:**

- Reopening PRD #302 correction behavior, late-Admission blocking, or Prompt-out packet parity.
- Rebuilding Creation kernel authoring or seed decomposition internals.
- Running Admission gate, Propagation, Minimal Viable World, or QA.
- Global workflow-map redesign beyond the early pre-Admission handoff.
- Stale Prompt-out body visual hierarchy.
- Methodology, principle, or ADR amendments.

## Follow-On Candidates

### Candidate 2 - Stale Prompt Packet Visual Hierarchy Verification

**Purpose:** Decide whether Field Build 07/08 stale packet visual dominance still needs a small Prompt-out UI polish PRD.

**Sources:** Field Build 07 `P-01`, Field Build 08 `V-04`, PRD #297/#299 closeout context.

**Problem:** Active packet identity/export safety is now good enough for field use, but stale bodies can remain visually large after navigation or mode changes.

**Recommended rule or open design point:** Verification first. If replay shows stale prior-origin bodies still dominate the active decision surface, open a narrow UI hierarchy PRD to collapse stale packet bodies behind disclosure while preserving stale labels and no-copy/export/store safeguards.

**Acceptance:** Replay either proves the stale visual issue is no longer material or records exact active-route acceptance for stale body collapse.

### Candidate 3 - Admission Prompt Mode Cold-Probe Coverage

**Purpose:** Resolve bounded prompt coverage left by Field Build 08, where Admission Proposal/Pressure availability was checked but not cold-probed.

**Sources:** Field Build 08 regression notes; Field Build 07 `Q-01`.

**Problem:** The PRD #302 frontier intentionally prioritized correction evidence, so Admission mode cold usefulness remains representative rather than fully proven in this run.

**Recommended rule or open design point:** Treat as next field-build coverage, not product work. It becomes product scope only if a replay finds incomplete, mis-bound, unavailable, or cold-useless packets.

**Acceptance:** A later field build records which Admission modes were exercised, whether exact active packets were exported, whether cold LLM checks were useful, and whether any product defect was found.

## Coverage Follow-Up

After the workflow-map PRD lands, a small replay should exercise:

- fresh world setup/open;
- kernel save through Creation;
- workflow map before seed parking, proving Creation remains the next step and Admission is not done;
- seed decomposition and proposed seed parking;
- workflow map after parking, proving Admission becomes active;
- one PRD #302 regression state, proving corrected proposed facts still route Admission correctly.

This remains coverage work unless it finds a new defect.

## Rejected Or No-Op Alternatives

- **Reopen PRD #302 for `B-01`.** Rejected. The source addendum, current source/tests, browser proof output, and closed tracker state cover late-Admission blocking.
- **Make one broad Field Build 08 omnibus PRD.** Rejected. Most findings are validations or closeout evidence; only workflow-map `F-01` remains fresh product scope.
- **Fold stale packet visual hierarchy into the first PRD.** Rejected. `V-04` says safety held. Visual hierarchy can be verified or polished separately.
- **Open a methodology amendment.** Rejected. The package already orders kernel, decomposition, audit, and Admission correctly.
- **Open a principle or ADR amendment.** Rejected. Existing W-8/W-10, W-3, ADR 0006, and ADR 0009 already require truthful handoff orientation.
- **Fix only the browser copy locally.** Rejected. The map's state grammar is server-owned; browser-only correction would duplicate policy and contradict ADR 0009.
- **Treat kernel existence as enough to mark Creation done.** Rejected. Creation phases 1-2 require seed decomposition and proposed parking before Admission earns work.
- **Patch code or specs immediately from this prep.** Rejected. The requested stopping point is readiness for a later `/to-prd` pass.

## PRD Publication Inputs

Use these fields when the later `/to-prd` pass creates the PRD:

- **Suggested title:** `PRD: Workflow map pre-Admission handoff - seed decomposition owed before Admission done`
- **Publication package:** one intended PRD now, with stale packet visual hierarchy and Admission prompt cold-probe coverage recorded as deferred follow-ons.
- **Recommended testing seam:** reuse the existing server workflow-map HTTP/API seam over temp-file world databases, plus existing web workflow-map rendering tests if visible browser copy or layout changes. No new architecture seam is needed.
- **Seam checkpoint still owed to `/to-prd`:** confirm the user accepts the existing workflow-map HTTP payload plus browser map rendering as the testing seam.
- **Likely label after `/to-prd`:** `ready-for-agent` if product scope and seams are ratified and the PRD body includes browser-visible guidance checklist mapping; otherwise `needs-triage`.
- **Principles to cite:** `docs/principles/README.md`, `docs/principles/guided-workflow-usability.md` W-8/W-10, `docs/principles/workflow-principles.md` P-5/W-3/W-7, `docs/principles/data-principles.md` W-5/W-6, `docs/principles/domain-fidelity.md` P-1/T-2, and `docs/principles/canon-sovereignty.md` P-2 where Admission boundary is discussed.
- **Relevant ADRs:** ADR 0006 and ADR 0009 primary; ADR 0008 as module-ownership support if implementation changes stay server-side.
- **Relevant specs:** `docs/specs/workflow-map-and-navigation.md`, `docs/specs/creation-flow.md`, `docs/specs/admission-flow.md`, and `docs/specs/browser-visible-guidance-acceptance.md`.
- **Relevant tracker IDs:** closed PRD #302 and child #307 as evidence that correction-specific blocker work is covered; closed #303-#306 as PRD #302 child coverage; closed prior map/Creation/Admission PRDs #150, #158, #165, #171, #222, #231, #297, and #302 as context, not blockers.
- **Browser-visible guidance checklist mapping:** owed because the PRD touches browser workflow navigation and guided-flow handoff. The PRD should map package source, decision-point contract, required/optional fields where relevant, doctrine at point of use, current/next/resume state, read-side/non-mutation behavior, blockers/unlock reasons, and a cognitive walkthrough from kernel completion to seed parking.
- **Canonical gates:** `pnpm test`, `pnpm typecheck`, and `pnpm build` at parent closeout. Focused gate during implementation: `pnpm --filter @worldloom/server test -- test/workflow-map.test.ts` or equivalent package command.
- **Browser evidence:** recommended if visible map text or state chips change; otherwise server payload tests plus existing render tests may be sufficient, but closeout should explain the seam.
- **Cold LLM evidence:** N/A for the first PRD. Prompt-out is not in scope except as a deferred coverage candidate.
- **Durability warning:** the Field Build 08 source report is tracked, clean, and visible on `origin/main`. This prep file is a new session artifact and remains pending local publication until committed. A later published PRD should either wait until this prep is durable or summarize its conclusions without stable-citation wording. Do not publish local `/tmp` evidence paths in the PRD body; summarize their conclusions through tracked reports.
- **Template-conformance warning:** future PRD user stories must use the repo's exact `As a/an <actor>, I want..., so that...` shape.

## Freshness And Boundaries

This prep refreshed live worktree status, branch, open tracker state, PRD #302/#307 closed state, source report durability, publication-ref visibility, relevant current source surfaces, relevant specs, principles, ADRs, methodology excerpts, Field Build 07 prep/report context, PRD #302 replay report, and methodology coverage rows.

This prep did not run product tests, start the app, create issues, publish a PRD, mutate tracker state, patch product code, or patch specs. It relies on Field Build 08's recorded field evidence plus current source/tracker inspection for scope selection.

Files intentionally added or changed by this prep: `reports/field-build-08-submanor-continent-prd-prep.md`.
