# PRD 302 Creation Correction Active-Route Replay

Date: 2026-07-09

Scope: GitHub issues #303, #304, #305, #306, and #307 for PRD #302.

## Summary

The active Creation route now resumes a completed seed-decomposition handoff instead of starting a blank Creation flow. From that handoff, the browser shows the parked seed body, truth layer, proposed status, original wording, correction actions, write/link/queue/non-mutation preview, next/resume state, and read-side trail.

The replay exercised one failed split correction with entered material preserved, then one successful split correction. The original bundled seed became non-current, corrected proposed facts stayed at `proposed`, the Admission queue refreshed to the corrected facts, and Canon Workbench/read-side links exposed the original seed, correction context, corrected facts, kernel provenance, and seed-decomposition report provenance.

## Durable Artifacts

Browser evidence:

- `output/playwright/prd302-correction-before.png`
- `output/playwright/prd302-correction-invalid.png`
- `output/playwright/prd302-correction-success.png`
- `output/playwright/prd302-readside-trail.png`

Packet and API evidence:

- `output/playwright/prd302-decomposition-proposal-packet.md`
- `output/playwright/prd302-decomposition-pressure-packet.md`
- `output/playwright/prd302-replay-result.json`

The replay world files were temporary local world files under `/tmp/worldloom-prd302/`; the durable evidence is the report plus artifacts above.

## Active Route

1. Created a fresh local world and authored a lean Creation kernel.
2. Parked `FAC-1 Bundled Antarctic monolith discovery` as a proposed `canon_fact` through the Creation seed-decomposition route.
3. Reopened the world from Recent worlds, selected the Creation destination, and verified the route resumed `Flow 1` at `decomposition:complete`.
4. Verified the handoff showed `FAC-1`, the seed body, `Objective canon`, `Current canon status: proposed`, original seed wording, source provenance, correction actions, and non-mutation preview.
5. Submitted an invalid split with `Sibling title = Passage discovery split candidate` and missing rationale/body/truth layer. The browser showed server validation near the action and preserved the entered sibling title.
6. Filled the split correction and submitted it successfully.
7. Verified the handoff refreshed: `FAC-1` became non-current, `FAC-2` and `FAC-3` were visible as proposed corrected facts, the page message said the Admission queue and read-side trail refreshed, and the read-side trail listed original seed, correction context, both corrected facts, and Admission queue.

## Packet Evidence

The exported Proposal and Pressure packets both used `flowKey=creation`, `stepKey=creation:decomposition_prompt`, `templateKey=decomposition_pressure`, `recordId=2`, and `recordTypeKey=seed_decomposition`.

Recorded packet hashes:

- Proposal packet hash: `e86d67a87ff5deffb7ce820740ab176b6f904a52c8ee332bcf71b43ed4eb7701`
- Proposal body hash: `49a55043db5cbb181bb1fea89abf5f986434427472b9dadb8689590120ca56ef`
- Pressure packet hash: `dbd757382a5ccb014089415e40c0baa9ccd2073e8a5c360a732588c5fb9183be`
- Pressure body hash: `5cac1158c0abe82ababdbc25be7fe4885c35fa08d1f083e5fa9cae09abd0602d`

Both packet modes included the parked seed body, proposed status, truth layer, seed-decomposition report context, granularity rationale, supporting kernel context, source manifest, explicit omissions, and advisory/canon warning. Proposal differed by candidate-split framing; Pressure differed by critique framing.

Cold external LLM evidence: unavailable in this local session. No external cold LLM executor was available, and subagent delegation was not authorized by the user request. The closeout therefore records exact packet exports and packet-content checks, but does not claim external model success.

## Read-Side Evidence

API replay readback showed corrected fact links:

- `derived_from -> World kernel`
- `derived_from -> Seed decomposition`
- `derived_from -> Bundled Antarctic monolith discovery`
- `derived_from -> Creation correction: FAC-1`

The browser read-side trail showed:

- `Original seed FAC-1 -> /api/canon-workbench/records/3`
- `Correction context CCP-1 -> /api/canon-workbench/records/4`
- `Corrected proposed fact FAC-2 -> /api/canon-workbench/records/5`
- `Corrected proposed fact FAC-3 -> /api/canon-workbench/records/6`
- `Admission queue -> /api/admission/queue`

Creation did not admit canon or assign Admission severity. Corrected facts remained `proposed`.

## Issue Map

| Issue | Evidence |
|---|---|
| #303 | Server correction contract, validation, split/rewrite/replace/narrowing-note behavior, late-Admission block, and resume-to-handoff behavior are covered by `packages/server/test/creation-flow.test.ts` and API replay evidence. |
| #304 | Proposal and Pressure decomposition packets share the same post-park decision-bearing context; exact packet exports and hashes are recorded. External cold LLM success remains blocked by unavailable/unauthorized external model execution. |
| #305 | Browser Creation handoff renders correction panel, failed-action remediation, preserved entered material, successful correction refresh, and read-side trail. |
| #306 | Admission queue/read-side evidence shows corrected proposed facts with correction provenance and no Creation-side canon-standing change. |
| #307 | Active-route replay, browser artifacts, packet exports, child issue map, and coverage-ledger update are recorded here. External cold LLM success remains caveated as unavailable. |

## Verification

Final focused checks:

- `pnpm --filter @worldloom/server exec vitest run test/creation-flow.test.ts`: passed
- `pnpm --filter @worldloom/server exec vitest run test/prompt-out.test.ts`: passed
- `pnpm --filter @worldloom/web exec vitest run src/creation-decision-surface.test.tsx`: passed
- `pnpm --filter @worldloom/web exec vitest run src/prompt-out-lifecycle.test.tsx`: passed

Final root gates:

- `pnpm test`: passed
- `pnpm typecheck`: passed
- `pnpm build`: passed

Closeout blocker: #304 and #307 require cold external LLM evidence. This local run exported and checked both packets, but no external cold LLM executor was available and subagent delegation was not authorized by the user request. Therefore #304, #307, and parent #302 should remain open until that evidence is supplied or explicitly authorized.

## Regression Notes

PRD #297 packet-safety regressions are preserved by existing prompt lifecycle coverage: current packet export, active packet identity, stale/non-current guards, and no stale copy affordance remain covered by `packages/web/src/prompt-out-lifecycle.test.tsx` and root gates.

No direct LLM integration, automatic critique parsing, automatic split/rewrite, automatic Admission decision, automatic canon adoption, methodology amendment, principle amendment, ADR amendment, Propagation/QA execution, or repo-wide browser/e2e hard gate was introduced.

## Naive Steward Walkthrough

The browser route supports the expected walkthrough:

1. Identify the current Creation decision and source doctrine at `decomposition:complete`.
2. Distinguish required correction substance from optional Prompt-out critique.
3. Treat Prompt-out as advisory pressure, not canon generation.
4. Predict that correction writes a correction context and proposed facts, links them to kernel/report/original seed, queues proposed facts for Admission, and leaves canon standing untouched.
5. Recover from failed correction without losing entered material.
6. Exit and resume with original seed, correction context, corrected facts, and Admission route visible.
