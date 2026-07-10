# PRD #339 Creation Coverage Bootstrap Active-Route Replay

Date: 2026-07-10

Issues covered: #340, #341, and #342. Parent: #339.

## Summary

The routed Creation surface now handles the empty seed-family coverage inventory state as active work. A steward can create initial coverage rows from kernel material, recover from server validation without losing draft input, resolve rows through link/defer/out-of-scope dispositions, and reach Admission only after Creation coverage is resolved. Missing-inventory Prompt-out packets now frame the task as coverage-row creation/confirmation, not Admission readiness.

Durable evidence:

- `output/playwright/prd339-replay-result.json`
- `output/playwright/prd339-coverage-empty-bootstrap.png`
- `output/playwright/prd339-coverage-validation.png`
- `output/playwright/prd339-coverage-rows-created.png`
- `output/playwright/prd339-coverage-resolved-map.png`
- `output/playwright/prd339-proposal-packet.md`
- `output/playwright/prd339-pressure-packet.md`

## Active Route

Replay world: `/tmp/worldloom-prd339-1783649506513.sqlite`

Browser route exercised:

1. Created a new world through the setup UI.
2. Seeded a Creation flow with a broad kernel naming temporal access, anti-aging chemistry, spinal implant boundaries, accountability pressure, ordinary-life consequences, and institutional consequences.
3. Parked one proposed seed, `FAC-1 Temporal access tool`, through Creation seed decomposition.
4. Confirmed the coverage API returned `missing_inventory`, zero rows, and a create-or-confirm body with `kernelRecordId: 1` and `seedDecompositionReportId: 2`.
5. Opened the routed Creation destination and verified the empty-inventory panel showed `Create initial coverage rows`.
6. Loaded Proposal and Pressure Prompt-out packets from the visible Creation decision surface.
7. Verified Prompt-out generation did not change record, link, or coverage row counts: before `records=3, links=2, rows=0`; after `records=3, links=2, rows=0`.
8. Submitted a bootstrap row with source context but no label. The browser showed `rows[0].label: Coverage row label is required.` and preserved the entered source context.
9. Created four coverage rows: Temporal access, Anti-aging chemistry, Spinal implant boundaries, and Ordinary-life consequences.
10. Linked Temporal access to the parked proposed seed, deferred Anti-aging chemistry, marked Spinal implant boundaries out of scope, and deferred Ordinary-life consequences.
11. Verified final coverage status `resolved`, linked seed status stayed `proposed`, deferred rows created governed debt, and out-of-scope rationale persisted.
12. Returned to the workflow map and verified the next decision became Admission only after coverage resolved.

Browser console evidence: one expected 400 error from the intentional invalid bootstrap submit; no unexpected page errors were recorded by the replay.

## Prompt-Out

Proposal packet evidence:

- `Creation seed-family coverage inventory: missing`
- `Coverage inventory task: create or confirm seed-family coverage rows before Admission handoff.`
- `candidate coverage row labels`
- `Do not create rows, infer dispositions, or treat parked seeds as Admission-ready.`

Pressure packet evidence:

- `Creation seed-family coverage inventory: missing`
- `Do not evaluate Admission readiness while the coverage inventory is missing.`
- `unsupported out-of-scope claims`
- `Advisory material cannot create coverage rows, links, debt, canon standing, or Admission queue changes.`

Cold no-repo packet-read subagent result: pass. The subagent was instructed to read only `output/playwright/prd339-proposal-packet.md` and `output/playwright/prd339-pressure-packet.md`, with no repo, issue, spec, or conversation context. It found no direct contradiction. It noted the intended boundary: the packets ask the model to propose candidate labels/questions and pressure the coverage task, but the advisory response cannot create rows, dispositions, canon standing, or Admission queue changes.

## Readback

Final coverage state from `output/playwright/prd339-replay-result.json`:

| Row | Disposition | Evidence |
|---|---|---|
| Temporal access | covered | Linked seed status stayed `proposed`. |
| Anti-aging chemistry | deferred | Debt record created. |
| Spinal implant boundaries | out_of_scope | Out-of-scope rationale persisted. |
| Ordinary-life consequences | deferred | Debt record created. |

Workflow map readback after resolution:

- Creation stage: `done`
- Admission stage: `active`
- Next decision destination: `admission`
- Next decision label: `Work Admission queue`

## Non-Mutation

Prompt-out and workflow reads were non-mutating in the replay. The only writes were explicit steward actions on the coverage route: create initial rows, link a parked proposed seed, defer with rationale, and mark out of scope with rationale. Creation did not admit canon, change seed canon status, assign Admission severity, or write Admission queue changes.

## Regression Proof

- PRD #321 coverage inventory/disposition behavior remains fixed: the replay created rows through the Creation coverage route, resolved one row by linking a parked proposed seed, deferred two rows with governed debt, marked one row out of scope with rationale, preserved linked seed status as `proposed`, and moved the workflow next decision to Admission only after coverage status became `resolved`.
- PRD #328 correction-note visibility is N/A for this replay: the active route starts from a fresh seed decomposition with no corrected seeds or correction notes, and this PRD does not touch Creation correction-note rendering or idempotence paths.
- PRD #336 current-packet clarity remains fixed where Prompt-out packets are loaded: the replay loaded Proposal and Pressure packets from the routed Creation decision surface, extracted the canonical current packet body from `section[data-current-prompt-packet="true"] pre`, saved the exact packet artifacts, and verified the body matched the active missing-inventory decision before continuing.

## Issue Map

| Issue | Evidence |
|---|---|
| #340 | Empty coverage inventory renders actionable bootstrap controls, sends current kernel/report identity, preserves invalid draft input after server validation, and creates initial rows through the routed Creation surface. |
| #341 | Missing-inventory Proposal and Pressure packets frame the current task as creating/confirming coverage rows before Admission handoff and preserve advisory/non-mutation guardrails. |
| #342 | Active-route replay covers Jon Urena-style broad-kernel material, empty inventory bootstrap, validation recovery, row creation, link/defer/out-of-scope dispositions, proposed seed preservation, Admission unlock after resolution, screenshots, packet artifacts, cold packet read, and coverage-ledger update. |

## Coverage Tracking

`docs/methodology-coverage.md` was updated with narrow PRD #339 evidence in these rows:

- Creation seed-family coverage gate (`05` / `20`, PRD #321 / PRD #339)
- Prompt-out Creation coverage inventory (`20`, PRD #321 / PRD #339)
- `05_creation_protocol.md` PRD #321 / PRD #339 seed-family coverage gate

No global Prompt-out field-validation promotion was made. No methodology, principle, or ADR amendment was introduced.

## Verification

Focused gates already run:

- `pnpm --filter @worldloom/web exec vitest run src/creation-decision-surface.test.tsx`
- `pnpm --filter @worldloom/web exec vitest run src/setup-open-world.test.tsx`
- `pnpm --filter @worldloom/web typecheck`
- `pnpm --filter @worldloom/server exec vitest run test/creation-flow.test.ts`
- `pnpm --filter @worldloom/server exec vitest run test/prompt-out.test.ts`
- `pnpm --filter @worldloom/server exec vitest run test/workflow-map.test.ts`
- `pnpm --filter @worldloom/server typecheck`
- `bash /home/joeloverbeck/.codex/skills/playwright/scripts/playwright_cli.sh run-code --filename /tmp/prd339-active-route-replay.js`

Root gates:

- `pnpm test`: passed
- `pnpm typecheck`: passed
- `pnpm build`: passed
