# PRD #321 Creation Coverage Active-Route Replay

Date: 2026-07-09

Issues covered: #322, #323, #324, #325, #326, #327. Parent: #321.

## Active Route

Replay world: `/tmp/worldloom-prd321-active-route-1783616310719.sqlite`

Browser route exercised:

1. Created a new world through the setup UI.
2. Opened the routed Creation destination.
3. Saved a multi-seed-family kernel in `Foundational facts`: temporal access, anti-aging chemistry, spinal implant boundaries, and ordinary-life pressure.
4. Parked only one proposed seed: `FAC-1 Temporal access tool`.
5. Confirmed three Creation seed-family coverage rows through the server-owned coverage route.
6. Verified unresolved coverage kept Creation primary and Admission secondary.
7. Linked `Temporal access` to parked proposed seed `FAC-1`.
8. Deferred `Anti-aging chemistry` as seed debt with rationale.
9. Marked `Spinal implant boundaries` out of scope with rationale.
10. Refreshed the workflow map and verified Admission became the primary next decision only after coverage was resolved.

Artifacts:

- `output/playwright/prd321-creation-coverage-unresolved.png`
- `output/playwright/prd321-creation-coverage-resolved.png`
- `output/playwright/prd321-decomposition-proposal-packet.md`
- `output/playwright/prd321-decomposition-pressure-packet.md`

Browser console evidence: focused replay reported `Errors: 0, Warnings: 0`.

## Readback

SQLite readback from the replay world:

Records:

- `KER-1` `world_kernel` `World kernel` remains `proposed`.
- `SEE-1` `seed_decomposition` `Seed decomposition` remains `proposed`.
- `FAC-1` `canon_fact` `Temporal access tool` remains `proposed`.
- `DEB-1` `canon_debt` `Creation seed-family coverage: Anti-aging chemistry` is `under review`.

Coverage rows:

- `Temporal access`: `covered`; linked to `FAC-1`; rationale `Linked parked proposed seed covers this family.`
- `Anti-aging chemistry`: `deferred`; debt `DEB-1`; rationale `Chemistry remains seed debt until the first Admission pass.`
- `Spinal implant boundaries`: `out_of_scope`; rationale `Implant boundaries are out of scope for this Creation pass.`

Flow readback:

- Creation flow ended at `decomposition:complete`, state `complete`, after all required rows were covered, deferred, or out of scope.

## Prompt-Out

Generated packet hashes:

- Proposal packet hash: `6e59cd2edd388ed163f250fd36c913c7c69542ebbdc2f51e2fb74456e8905d80`
- Pressure packet hash: `6536578d269dedce4e80489d7f498a7fee2e83e88056f8789fdb92fa71743134`

Both generated packets include:

- `Creation seed-family coverage inventory`
- coverage rows for Temporal access, Anti-aging chemistry, and Spinal implant boundaries
- dispositions `covered`, `deferred`, and `out_of_scope`
- linked proposed seed `FAC-1`
- `Canon status: proposed`
- `Source record: Creation coverage inventory`
- guardrails `no automatic coverage disposition` and `no automatic seed creation`

Cold-context subagent verdict: Proposal mode pass; Pressure mode pass; no missing context for coverage inventory, row dispositions, linked proposed seed status, Admission boundary, or forbidden moves.

Supporting subagent-cited phrases:

- `Creation seed-family coverage inventory ... Coverage row: Temporal access ... Disposition: covered ... Coverage row: Anti-aging chemistry ... Disposition: deferred ... Coverage row: Spinal implant boundaries ... Disposition: out_of_scope`
- `No seed is admitted by this flow; admission is deferred to the admission flow` and `Forbidden-move summary: no canon standing, no truth layer or status assignment`

## Non-Mutation

Executable evidence:

- `packages/server/test/creation-flow.test.ts` test `exposes Creation seed-family coverage rows, dispositions, readback, and non-mutating reads` asserts repeated coverage reads do not change records or links.
- `packages/server/test/prompt-out.test.ts` test `threads Creation seed-family coverage inventory into decomposition Proposal and Pressure packets` asserts Proposal and Pressure generation do not change records, links, coverage rows, or coverage links.
- Browser replay used explicit coverage actions for the only writes: link, defer, and out-of-scope. Prompt packet generation and workflow-map reads were read-only evidence paths.

## Regression States

- PRD #302: `packages/server/test/creation-flow.test.ts` test `exposes and applies governed post-park correction actions before Admission begins` remains green, proving corrected proposed material routes to Admission while preserving kernel/report/proposal provenance.
- PRD #308: `packages/server/test/workflow-map.test.ts` test `keeps a saved-kernel world in Creation until seed decomposition parks proposed seeds` remains green.
- PRD #317: `packages/web/src/creation-decision-surface.test.tsx` tests `foregrounds empty-world Creation work before compact not-current Minimal Viable World status` and `foregrounds kernel-complete seed decomposition before compact not-current Minimal Viable World status` remain green.

## Cognitive Walkthrough

A docs-naive steward can identify:

- current decision: `decomposition:coverage`
- package source and doctrine at point of use from the Creation decision panel and prompt packet source manifest
- required row dispositions: linked seed, defer as seed debt, or out of scope with rationale
- why Creation is incomplete before coverage resolution: unresolved row blocker
- what will be written: coverage dispositions, coverage links, and canon debt for deferred seed families
- what stays untouched: Creation does not admit canon or assign Admission severity
- how to resume: safe-exit text keeps coverage rows visible from Creation
- read-side provenance: kernel, seed decomposition report, parked seed, and Admission queue/read-side links

## Coverage Tracking

`docs/methodology-coverage.md` was updated with narrow PRD #321 rows:

- Creation seed-family coverage gate: `walkthrough-passed`
- Prompt-out Creation coverage inventory: `browser-exposed; prompt-context-complete for this path`

No global Prompt-out field-validation promotion was made. No methodology, principle, or ADR amendment was introduced.

## Slice Mapping

- #322 docs contract: specs and checklist now describe the coverage gate, workflow priority, packet context, and browser guidance proof.
- #323 server coverage: schema v9 plus Creation coverage inventory/disposition routes and tests.
- #324 workflow map: Creation remains active/owed while unresolved coverage blocks Admission priority.
- #325 browser surface: routed Creation panel renders coverage rows, blockers, rationale fields, and link/defer/out-of-scope controls.
- #326 Prompt-out: Creation seed-decomposition Proposal and Pressure packets carry coverage inventory and guardrails with cold-context proof.
- #327 replay: active browser route and readback evidence recorded here.

## Verification

Focused gates already run:

- `pnpm --filter @worldloom/server exec vitest run test/creation-flow.test.ts test/workflow-map.test.ts test/prompt-out.test.ts`
- `pnpm --filter @worldloom/web exec vitest run src/creation-decision-surface.test.tsx`
- `pnpm --filter @worldloom/server typecheck`
- `pnpm --filter @worldloom/web typecheck`

Root gates still required before tracker closure:

- `pnpm test`
- `pnpm typecheck`
- `pnpm build`
