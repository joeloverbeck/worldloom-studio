# PRD #202 Minimal Viable World Walkthrough

Date: 2026-07-06
World file: `/tmp/worldloom-mvw-smoke-1783351459299.sqlite`
Scope: issues #211-#217 for the non-generative Creation phases 4-8 Minimal Viable World checkpoint.

## Verdict

Walkthrough passed for the PRD #202 acceptance level: a docs-naive steward can see when Creation owes a Minimal Viable World checkpoint, review admitted seed coverage against the required dimensions, record steward-authored dispositions without generating canon, route Admission proposals for unresolved gaps, load the checkpoint Prompt-out advisory packet, and see the same checkpoint state echoed read-only in the first whole-world QA review.

This is browser walkthrough evidence, not app field validation.

## Browser Evidence

Artifacts:

- `output/playwright/prd-202-minimal-viable-world-qa-echo.png`
- `output/playwright/prd-202-minimal-viable-world-creation-deferral-proposal.png`

Observed flow:

1. A smoke world was seeded through the local API with accepted seed facts linked back to the world kernel plus supporting evidence records.
2. The workflow map showed `Minimal Viable World checkpoint` as the next Creation decision and surfaced one owed Creation checkpoint queue item.
3. The Creation checkpoint surface showed the server-owned decision contract, whole-world coverage signals, per-seed dimension matrix, source manifest, proposal routing, pressure availability, and read-side pass-report trail.
4. Recording an ordinary-life disposition created append-only report snapshot `PAS-1` with the checkpoint disposition and evidence links.
5. Final-tree browser review found and fixed a routed-surface gap: the active Creation checkpoint now shows protected-record, deferral, canon-debt, proposal seed, and truth-layer controls instead of hiding those controls in the legacy full workspace.
6. Recording a deferred disposition for `FAC-2` through the active Creation checkpoint wrote checkpoint canon debt and refreshed the report/read-side state.
7. Routing a fact-shaped follow-up through the active checkpoint created `FAC-4 Bell ration queue proposal` as `proposed` in the Admission queue and advanced the latest checkpoint report to `PAS-2`.
8. The checkpoint remained non-generative: pressure mode became available only after saved steward material, unresolved gaps stayed visible as steward obligations, and the app still showed `automatic pass/fail verdict: not_applicable`.
9. Loading the checkpoint Prompt-out step returned `Minimal Viable World proposal` with the checkpoint source manifest and advisory boundary.
10. Starting a whole-world QA pass showed the Minimal Viable World echo as read-only, including checkpoint presence, report id, deferral/debt/proposal counts, source manifest, and whole-world coverage signals.

Focused API lifecycle evidence covered the branches not fully expanded in the browser smoke: covered disposition, deferred-to-skip disposition, deferred-to-canon-debt disposition, protected-mystery disposition with linked boundary evidence, proposal and pressure packet generation, advisory artifact storage and disposition, checkpoint Prompt-out skip with open debt, explicit advisory-use links, successor checkpoint report snapshots, Admission proposal routing as `proposed`, and QA echo of the final linked report/advisory/proposal/debt state.

Network evidence included:

- `POST /api/worlds/create => 201`
- `POST /api/records => 201`
- `GET /api/flows/creation/minimal-viable-world => 200`
- `POST /api/flows/creation/minimal-viable-world/dispositions => 200`
- `POST /api/flows/creation/minimal-viable-world/admission-proposals => 200`
- `POST /api/prompt-out/steps => 200`
- `POST /api/prompt-out/steps/actions/generate => 200`
- `POST /api/prompt-out/steps/actions/store-advisory => 201`
- `POST /api/prompt-out/steps/actions/disposition => 201`
- `POST /api/prompt-out/steps/actions/skip => 201`
- `GET /api/flows/qa/scorecard => 200`

Final-tree readback after the browser review fix:

- Latest checkpoint report: `PAS-2`
- Checkpoint debt: `Bell scarcity ordinary-life debt`
- Admission proposal: `FAC-4 Bell ration queue proposal`, status `proposed`

Console evidence: no blocking browser console error was observed during the walkthrough.

## Naive-Steward Checklist

- Current decision visible: workflow map and Creation checkpoint both named the Minimal Viable World checkpoint as the owed decision.
- Whole-world checkpoint visible: coverage signals named ordinary life, paths of action, mystery pressure, aesthetic pressure, automatic pass/fail verdict, and unresolved gaps.
- Required/optional/skippable distinction: required dimensions and missing coverage were shown separately from governed deferrals, protected mysteries, debt, and proposals.
- Prompt-out boundary: the checkpoint Prompt-out step was available as advisory context only and did not create canon.
- Write/link/route preview: the checkpoint surface showed append-only pass-report snapshots, evidence links, protected-mystery links, skip/debt/proposal routing, advisory artifact separation, and no direct Admission.
- Exit/resume: the saved report snapshots appeared in the read-side trail and QA source manifest.
- QA echo: whole-world QA echoed checkpoint state read-only and named that it does not write checkpoint records.

## Verification

TDD red:

- `pnpm --filter @worldloom/server exec vitest run test/minimal-viable-world.test.ts` initially failed before the checkpoint route existed.

Focused green:

- `pnpm --filter @worldloom/server exec vitest run test/minimal-viable-world.test.ts`
- `pnpm --filter @worldloom/web exec vitest run src/creation-decision-surface.test.tsx src/qa-flow.test.tsx`
- `pnpm --filter @worldloom/server typecheck`
- `pnpm --filter @worldloom/web typecheck`

Root gates:

- `pnpm test`
- `pnpm typecheck`
- `pnpm build`

## Coverage Ledger

`docs/methodology-coverage.md` now promotes Creation `05` to include the non-generative Minimal Viable World checkpoint for phases 4-8, records the QA `18` read-only echo, and marks the open Creation phases 4-8 decision as shipped through PRD #202 / issues #211-#217.
