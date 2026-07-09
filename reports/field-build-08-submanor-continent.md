# Field Build 08 - Submanor Continent

**Date:** 2026-07-09 · **App commit:** `defd3f8` plus pre-existing app-source working-tree dirt for PRD #302 · **Method version:** worldbuilding-system 1.1  
**Essence (user seed):** Late 1880s Europe, noble houses secretly access an ancient continent buried deep beneath their manors, organize expeditions, and trade or debate findings.  
**World:** Submanor Continent - gothic expedition politics under aristocratic secrecy, where estate-bound access, household hierarchy, trade in findings, and protected archaeological awe carry the pressure. **World file:** `/tmp/worldloom-field-build/worlds/submanor-continent.worldloom.sqlite`.  
**Path walked:** setup/open -> Creation kernel -> parked over-bundled seed -> active Proposal/Pressure packets -> cold probes -> post-park correction -> Admission queue/read-side -> late Admission regression probe. **Prior runs:** none for this seed; latest canonical run baseline `reports/field-build-07-antarctic-monoliths.md`.  
**Evidence:** screenshots at `/tmp/worldloom-field-build/screenshots/field-build-08-*.png`; exact prompt packets and cold outputs at `/tmp/worldloom-field-build/cold-llm/field-build-08-*.md`; API readbacks at `/tmp/worldloom-field-build/cold-llm/field-build-08-*.json`; live log at `/tmp/worldloom-field-build/build-log.md`.  
**Prior-art frame:** GitHub issues #109-#113 and PRDs #201/#202/#204/#205-#210 were reachable. PRD #297 is closed and PRD #302 is open. This run primarily tests the current PRD #302 implementation and rechecks the PRD #297 prompt packet identity/export/stale guards under active UI use.

## Findings

### V-01 - Creation decomposition packets are active-surface exportable and cold-useful. Severity: validation.
- Where: Creation / Seed decomposition Prompt-out.
- What happened: After parking `FAC-1`, the active UI loaded both Creation decomposition modes and exposed `Copy Current Packet` plus `Download Current Packet`. Proposal packet origin: mode `proposal`, packet `377e13f92b77c6906ce877fc12c736c1ee84876a3afe5a4b997f02b537f20c46`, body `3b59b75624cad619469084677b8f8246452b05eadaf7f28f1e18b29acc39f97d`. Pressure packet origin: mode `pressure`, packet `89ab1a4038524d00c0dea2735d81e2a5fa141ef549b4d934db1c89d81336c16f`, body `c450794d65064e59de3e2de9a7870fae20bc8e6804589164839dcbe9e178534d`.
- Cold evidence: Proposal subagent `019f4470-abe1-7453-9d66-05a259b2e6b0`, with no forked context, proposed split candidates from the packet alone: access, expedition practice, recovery/exchange, secrecy, casualties, scope, and consequence axes. Pressure subagent `019f4473-0122-7da2-9c5d-3abaa62939a3`, with no forked context, critiqued the exact parked seed as bundled from the packet alone.
- Packet source: active UI rendered status/body extraction, not diagnostic fallback. Exact files: `field-build-08-seed-decomposition-proposal-prompt.md`, `field-build-08-seed-decomposition-proposal.md`, `field-build-08-seed-decomposition-pressure-prompt.md`, `field-build-08-seed-decomposition-pressure.md`.
- The snag: N/A - validation.
- Fix direction: preserve active copy/download and packet identity metadata.
- Touches: PRD #297, PRD #302, `docs/specs/prompt-out-context-assembly.md`.

### V-02 - Decomposition packet context now includes the parked seed and supporting kernel. Severity: validation.
- Where: Creation / Seed decomposition Prompt-out.
- What happened: Both exported packets included `FAC-1` title/body, truth layer, proposed status, derived-from links, `SEE-1`, and all supporting `KER-1` kernel sections. This directly addresses Field Build 07 `P-05`.
- What the methodology requires: A cold LLM must be able to evaluate the active decision from the packet alone, with omissions named.
- The snag: N/A - validation.
- Fix direction: preserve screen/packet parity for parked seed body, status, links, and kernel context.
- Touches: PRD #204, PRD #297, PRD #302.

### V-03 - Post-park correction supports validation recovery and successful split before Admission begins. Severity: validation.
- Where: Creation / Post-park correction.
- What happened: `FAC-1` was first corrected into `FAC-2` proposed. Then `FAC-2` was deliberately submitted with a missing first sibling truth layer; the server returned `siblings[0].truthLayer: Correction truth layer is required.` while preserving the rationale, first sibling title/body, and complete second sibling. Filling the missing truth layer and resubmitting split `FAC-2` into `FAC-3` and `FAC-4`.
- Readback: `FAC-2` became rejected; `CCP-2` was written; `FAC-3` and `FAC-4` are proposed in `/api/admission/queue`. Both corrected facts derive from `KER-1`, `SEE-1`, `FAC-2`, and `CCP-2`.
- Evidence: `field-build-08-10-correction-validation-preserved.png`, `field-build-08-11-correction-success-split.png`, `field-build-08-admission-queue.json`, `field-build-08-record-6-CCP-2.json`, `field-build-08-record-7-FAC-3.json`, `field-build-08-record-8-FAC-4.json`.
- The snag: N/A for the typed UI path. One synthetic DOM-fill attempt did not update controlled form state; real browser typing worked.
- Fix direction: preserve validation locality, input preservation, and correction-context provenance.
- Touches: PRD #302, Creation correction flow.

### B-01 - Late Admission does not block direct Creation mutation. Severity: blocking.
- Where: Admission -> Creation / `FAC-3`.
- What happened: In Admission, `FAC-3` was selected and severity was declared as `admissionLevel=1`, `workScale=minor`; Admission advanced to `record:7:severity-declared` with severity path `minor_ledger`. Returning to Creation still showed `FAC-3` as "Correctable before Admission begins" with active split/retract/replace fields and an enabled `Submit Correction` button.
- What the methodology requires: Once Admission has begun for a proposed fact, Creation must not offer direct split/rewrite mutation for that fact. Any later adjustment must remain governed by Admission or a later repair path.
- The snag: The browser exposes active direct split/rewrite fields for a late-Admission option. This is a PRD #302 regression failure.
- Evidence: `field-build-08-13-admission-severity-declared.png`, `field-build-08-14-late-admission-creation-mutation-still-active.png`, `field-build-08-admission-queue-post-severity.json`.
- Fix direction: Creation correction eligibility must account for Admission-owned state, not only current canon status. Hide split/retract/replace controls for records with Admission severity/work state and show a read-only or Admission-narrowing route instead.
- Touches: PRD #302, Creation correction UI/server contract, Admission queue state.

### F-01 - Workflow map briefly marks Admission done before any seed is parked. Severity: friction.
- Where: Workflow map after kernel completion but before seed parking.
- What happened: After completing the kernel but before parking a proposed seed, the map reported Admission `done`, Admission queue `0`, and a QA/review-style next decision. Seed decomposition was still owed.
- What the methodology requires: Creation seed parking must precede Admission credit.
- The snag: The map can misorient the steward during Creation before the handoff exists.
- Evidence: `field-build-08-03-map-premature-admission-done.png`.
- Fix direction: Workflow map status should treat completed kernel without seed decomposition as Creation active/owed, not Admission done.
- Touches: Workflow map state derivation, Creation/Admission handoff.

### V-04 - PRD #297 stale/current packet guards still hold. Severity: validation.
- Where: Prompt-out loaded status across Creation, Admission, Workflow map, and Canon Workbench.
- What happened: Switching from Creation Proposal to Pressure produced distinct packet/body hashes. Navigating to Admission, Workflow map, and Canon Workbench marked the prior Creation packet stale, removed active copy/download affordances, and said it could not be copied/exported/stored as the active decision's current packet. Loading Pressure made the Pressure packet current again for Creation.
- The snag: The stale body remains visually large, but identity/export safety held.
- Evidence: `field-build-08-07-proposal-packet-stale-after-mode-switch.png`, `field-build-08-12-admission-stale-prompt-guard.png`.
- Fix direction: preserve stale/current guard behavior; optional polish remains to collapse large stale bodies.
- Touches: PRD #297, Prompt-out lifecycle.

## Regression of prior findings

Gate: `defd3f8 -> defd3f8` plus pre-existing PRD #302 app-source dirt; same HEAD as Field Build 07, so the open findings were replayed against the dirty implementation under test.

- Field Build 07 `P-01` stale packets visually dominant: safety improved/held, visual friction remains. Stale packets are non-copyable and clearly labeled, but still occupy a large region on non-Creation surfaces.
- Field Build 07 `P-04` exact packet export fragile: fixed for the primary path. Active UI exposes copy/download and exact packets were captured from the active surface rather than diagnostic regeneration.
- Field Build 07 `P-05` decomposition packet missing seed body/kernel: fixed. Cold packets include `FAC-1` body, status, links, and full supporting kernel context.
- Field Build 07 `F-03` no post-park correction path: fixed for pre-Admission correction. New blocker `B-01` covers the remaining late-Admission guard failure.
- Field Build 07 `P-03` Admission modes not reverified: reverified enough for availability and stale guard. Admission Proposal/Pressure modes were available after selecting `FAC-3`, but not cold-probed because the requested frontier was PRD #302 correction evidence.
- Field Build 07 `Q-01` bounded coverage: improved for the targeted decision. Both Creation decomposition Proposal and Pressure were cold-probed; not every kernel/admission mode was probed.

## Decision-point log

### Setup / Open World
- Committed: `/tmp/worldloom-field-build/worlds/submanor-continent.worldloom.sqlite`.
- UX/style verdict: ok.
- Obsolescence verdict: app carries setup/open.

### Creation / Kernel
- Committed: `KER-1` with all nine sections and `consequence_mode=mixed`.
- Evidence: `/api/canon-workbench/records/1`; screenshots `field-build-08-02-workflow-map-open.png` and related kernel readbacks.
- UX/style verdict: ok with an automation-only caveat: direct synthetic fill did not always update controlled form state, while real typed browser input did.
- Obsolescence verdict: app carries kernel save/readback; workflow-map orientation bug remains `F-01`.

### Creation / Parked Seed and Prompt-out
- Parked seed: `FAC-1 Noble houses use manor descents to explore and trade buried-continent findings`.
- Prompt coverage: Proposal and Pressure both loaded from active UI and both cold-probed.
- Cold answer summary: Proposal can propose split candidates from the packet alone; Pressure can critique the exact parked seed from the packet alone.
- Extraction verdict: active surface, not diagnostic fallback.

### Creation / Correction
- Failed correction path: `FAC-2` split with missing first sibling truth layer failed and preserved typed input.
- Successful split: `FAC-2` split into `FAC-3 The manor descents reach one shared buried continent` and `FAC-4 Access remains estate-bound and socially controlled`.
- Queue/read-side: Admission queue contains `FAC-3` and `FAC-4`; Canon Workbench proposed filter shows both with `derived_from` provenance markers.

### Admission / Late Mutation Probe
- State change: selected `FAC-3`, declared `admissionLevel=1`, `workScale=minor`, and observed Admission step `record:7:severity-declared`.
- Regression result: failed. Creation still exposes direct split/rewrite controls for `FAC-3`; see `B-01`.

### Safe Exit / Resume
- Workflow map after correction: Creation `done`, Admission `active`, Admission queue `2`.
- Creation resume: opening Creation from the map resumes at `decomposition:complete`, not a blank kernel flow.
- Evidence: `field-build-08-15-workflow-map-after-correction-admission.png`, `field-build-08-16-creation-resume-decomposition-complete.png`.

## For the app (PRD seeds)

PRD #302 blocker:
- Creation correction eligibility must treat Admission severity/work state as a hard boundary. `FAC-3` with `admissionLevel=1` and `workScale=minor` still had active direct Creation mutation controls.
- Suggested issue slice: "Block Creation correction controls after Admission state begins." Acceptance should include browser proof that split/retract/replace fields are absent or disabled for a severity-declared record, while a pre-Admission sibling such as `FAC-4` remains correctable.

Workflow-map follow-up:
- Kernel-complete/no-seed state can misreport Admission as done. This is less urgent than `B-01` but should be separated from PRD #302 if triaged.

Prompt-out:
- PRD #297 guardrails and active export are now good enough for field use. Remaining work is visual hierarchy for stale packet bodies, not identity safety.

## For the methodology

No methodology-source `M` finding. The docs were sufficient to identify the over-bundled seed, require independent rejectability, and stop at the correction/Admission frontier. The gap is app enforcement for late Admission ownership.

## Frontier

- Walked to: Creation correction completed; Admission queue and Canon Workbench read-side checked; Creation decomposition Proposal and Pressure cold probes recorded; `FAC-3` moved to Admission severity-declared solely to probe the PRD #302 late-state guard.
- Next run resumes at: `/tmp/worldloom-field-build/worlds/submanor-continent.worldloom.sqlite`; Admission active with `FAC-3` severity-declared (`level 1`, `minor`) and `FAC-4` still proposed/unclassified.
- Carried-open blockers: `B-01` late Admission does not block direct Creation mutation; `F-01` workflow map premature Admission done after kernel-only state.
- World state: `KER-1`; `SEE-1`; `FAC-1` and `FAC-2` rejected by Creation corrections; `CCP-1` and `CCP-2`; `FAC-3`/`FAC-4` proposed; no Admission ledger completion, canon standing acceptance, propagation, MVW checkpoint, or QA pass authored.

## PRD #302 closeout addendum

Recorded after the original field run, on the same date, once `B-01` was patched.

- `B-01` fix: Creation correction eligibility now treats Admission severity/work facets as Admission-owned state. A proposed fact with `admission_level` or `work_scale` facets returns `late_admission`, blocks direct split/retract/replace correction, and offers only superseding, re-proposal, or Admission-facing note routes.
- Focused regression: `pnpm --filter @worldloom/server exec vitest run test/creation-flow.test.ts -t "exposes and applies governed post-park correction actions before Admission begins"` first failed with the severity-declared corrected fact still `correctable`, then passed after the fix. The passing full Creation-flow file also verifies a pre-Admission sibling remains `correctable`.
- Browser-consumed active-route proof: `output/playwright/prd302-late-admission-proof.json` and `output/playwright/prd302-late-admission-proof.png` show a real browser-side route sequence creating a world, splitting a Creation seed, declaring Admission severity on `FAC-3`, observing `late_admission`/`directMutationBlocked: true`, preserving a pre-Admission sibling as `correctable`, and receiving `400` with `admission_started` for direct Creation mutation. Browser console state: one expected 400 error from that deliberate blocked mutation, zero warnings.
- PRD #302 issue coverage: `V-01` and `V-02` cover #304 Prompt-out context parity and cold usefulness; `V-03` plus the closeout addendum cover #303/#305 pre-Admission correction and late-Admission blocking; `V-03` covers #306 Admission queue/read-side provenance for corrected proposed facts; `V-04` covers PRD #297 packet safety regression constraints; this report plus the addendum covers #307 active-route replay closeout.
- Remaining `F-01` workflow-map premature Admission-done state is a separate workflow-map follow-up candidate. It is not part of the PRD #302 correction/Prompt-out parity acceptance surface.
