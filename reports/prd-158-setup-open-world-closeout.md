# PRD #158 setup/open-world closeout evidence

Date: 2026-07-05

Scope: GitHub issues #159-#164 for PRD #158, covering the setup/open-world shell, no-token localhost posture, create/open recovery, world-open reveal, empty-world Creation entry, and closeout proof.

## Implementation summary

- ADR 0004 now records the v1 no-token localhost stance: no accounts, no hosted multi-user auth, no manual browser token, loopback default, and local-only development CORS.
- The server no longer rejects `/api/*` requests for missing or stale `x-worldloom-token` headers and no longer prints a terminal token at startup.
- `/api/setup/status`, create/open success payloads, and create/open setup-error payloads give the browser server-owned setup status, recent-world state, and recoverable failure text.
- The browser has a setup-only no-world shell with server/catalog status, create/open controls, recent worlds, and inline setup errors. Workflow panels and substrate tools render only after a world is open.
- After create/open succeeds, setup controls move to secondary world-file controls, the workspace is revealed, and an empty world foregrounds Creation with prerequisite messaging for other flows.

## TDD evidence

| Issue | Context / doctrine read | Seam | Red command/failure | Green command or evidence | Acceptance covered | Review fix / red-first skip reason |
|---|---|---|---|---|---|---|
| #159 | `CONTEXT.md`; principles README; charter; data/workflow/guided-usability/domain/canon principles; ADRs 0001/0002/0004/0005/0006/0007/0009; specs schema/workflow/browser-guidance/creation; methodology coverage | docs/conformance, no runnable seam | N/A - document deliverable | Updated `reports/app-parity-trial-02-setup-open-world.md`, ADR 0004, workflow map, browser-visible guidance, schema spec | Durable field-trial summary, tracked-source caveat, no-token doctrine, setup/open-world specs, principles section conformance | N/A |
| #160 | Same doctrine set | server HTTP app tests | `pnpm --filter @worldloom/server exec vitest run test/setup-open-world.test.ts` failed: health returned 401, setup status missing, no-token/stale-token create/open failed | Same command passed: 3 tests | no-token health/catalog/create/open, stale-token ignored, startup token not advertised, localhost/CORS documented | N/A |
| #161 | Same doctrine set | server HTTP app tests and browser-surface test | `pnpm --filter @worldloom/server exec vitest run test/setup-open-world.test.ts` failed: setup errors lacked `setupError`/`setupStatus`; `pnpm --filter @worldloom/web exec vitest run src/setup-open-world.test.tsx` failed: inline setup shell absent | Same commands passed | preserved path, inline setup error, blank/missing path, wrong-file, corrupt-file, future-schema classification, recent-world update, workspace reveal after success | Existing package test exposed intended contract shift: failed open now preserves current world; updated expectation and `pnpm --filter @worldloom/server test` passed |
| #162 | Same doctrine set | React/browser-surface test | `pnpm --filter @worldloom/web exec vitest run src/setup-open-world.test.tsx` failed: token input/localStorage/header source and everything-panel no-world render were still present | Same command passed | no token UI/source/header, stale token ignored by not reading it, setup-only no-world shell, non-setup tools hidden before world open | Existing web tests updated to render workspace surfaces with `initialOpenWorld`; `pnpm --filter @worldloom/web test` passed |
| #163 | Same doctrine set | React/browser-surface test | `pnpm --filter @worldloom/web exec vitest run src/setup-open-world.test.tsx` failed: world-open status/setup controls/prerequisite cue absent | Same command passed | world-open reveal, secondary setup controls, empty-world Creation priority, prerequisite cue, generic/read-side tools only after open | N/A |
| #164 | Same doctrine set | evidence-only browser walkthrough and root gates | N/A - browser walkthrough evidence-only seam | Playwright CLI on `http://127.0.0.1:5173/`; screenshot `output/playwright/prd158-setup-open-world.png`; `pnpm test`; `pnpm typecheck`; `pnpm build` | setup walkthrough, recoverable failure, successful create, empty-world Creation, coverage map, conformance, root gates | Expected console 400 occurred during the intentionally failed open; no token/auth console failure observed |

## Browser walkthrough

Route: `http://127.0.0.1:5173/` with API proxy to `http://127.0.0.1:4173`.

Action path and observed outcomes:

1. Fresh page load showed `Setup/open world`, server status `Reachable (0.0.0)`, catalog status `27 record types and 25 link types available`, world-file path input, `Create world`, `Open world`, and no token field.
2. Entered `/tmp/worldloom-prd158-missing.sqlite` and clicked `Open world`. The no-world shell stayed visible, preserved the path, and rendered inline `Open failed`, `World file does not exist: /tmp/worldloom-prd158-missing.sqlite`, and the recovery text.
3. Entered `/tmp/worldloom-prd158-smoke-20260705.sqlite` and clicked `Create world`. The header changed to `World open`, setup controls moved to the sidebar, recent worlds showed the created path, the workspace revealed, and an empty-world prerequisite panel said Creation is primary until a `world_kernel` exists.
4. The same page showed `Creation decision point`, package source `docs/worldbuilding-system/templates/world_kernel.md`, current/next/resume state, Prompt-out advisory warning, write preview, Admission handoff, and prerequisite context for unrelated flows.

Artifact: `output/playwright/prd158-setup-open-world.png`.

## Coverage map

| Story | Evidence |
|---|---|
| 1 | No token UI in `src/setup-open-world.test.tsx`; server no-token test; browser walkthrough first load |
| 2 | Browser stops reading/sending stale token source; server stale-token test |
| 3 | Setup shell server status in web test and browser walkthrough |
| 4 | Setup shell catalog status in web test and browser walkthrough |
| 5 | No-world setup-only render in web test and browser walkthrough |
| 6 | Create/open primary controls in web test and browser walkthrough |
| 7 | Recent worlds in server test and browser walkthrough after create |
| 8 | Failed-open path preserved in web test and browser walkthrough |
| 9 | Inline setup error near controls in web test and browser walkthrough |
| 10 | Server setup-error recovery text and browser walkthrough |
| 11 | Wrong-file classification in server test |
| 12 | Future-schema classification in server test |
| 13 | Existing migration/backup world-file tests plus setup-error classification, corrupt-file HTTP coverage, and docs |
| 14 | Create/open success names open world in server test and browser walkthrough |
| 15 | Web test hides workspace before world open and reveals it after create/open |
| 16 | Web test and browser walkthrough foreground Creation for empty world |
| 17 | Prerequisite panel in web test and browser walkthrough |
| 18 | Web test hides generic tools before world open and shows them after open |
| 19 | No-world shell prevents Canon Workbench empty-result confusion; workspace Canon Workbench only renders after world open |
| 20 | Search/snapshot/export hidden before world open and available/blocked by prerequisites after open |
| 21 | ADR 0001, schema spec setup/open-world section, server create/open tests |
| 22 | No token UI; setup failures visible only when local API/world-file prerequisites fail |
| 23 | Browser walkthrough failed-open step preserves input and gives recovery text |
| 24 | ADR 0004 revised |
| 25 | `packages/server/src/index.ts` still defaults `HOST` to `127.0.0.1` |
| 26 | `packages/server/src/app.ts` local development CORS list and ADR 0004 CORS text |
| 27 | Server setup status and no-token health/catalog tests |
| 28 | Existing `packages/server/test/app.test.ts` plus setup create/open tests |
| 29 | No migration files or schema version changed; schema spec states no setup-shell migration by default |
| 30 | Browser consumes server setup-error payloads; server owns error classification |
| 31 | `packages/server/test/setup-open-world.test.ts` |
| 32 | `packages/web/src/setup-open-world.test.tsx` |
| 33 | Playwright walkthrough and screenshot artifact |
| 34 | Conformance review below plus docs/ADR updates |
| 35 | `pnpm test`, `pnpm typecheck`, and `pnpm build` passed |

## Conformance review

Principles/ADR conformance: no deliberate exceptions.

- Methodology upstream: setup/open-world work is pre-method entry and does not amend `docs/worldbuilding-system/`.
- Charter v1 scope: no accounts, hosted service, multi-user auth, or LLM integration added.
- Data principles and ADR 0001: one visible SQLite file per world remains the canonical store; create/open policy remains server-owned.
- ADR 0002 and ADR 0004: localhost native process/browser split remains; no-token stance is now explicitly recorded; development CORS is scoped to local browser origins.
- ADR 0005: no lint, hard audit, or repo-wide browser/e2e gate added.
- ADR 0006, ADR 0007, ADR 0009: Admission, Prompt-out, and browser guided-flow policy stay server-owned; the browser shell gates visibility rather than duplicating canon policy.
- PRD #150 and Creation spec: empty-world state foregrounds Creation without expanding Creation behavior beyond the existing decision-point contract.

## Non-goals confirmed

No hosted accounts, multi-user auth, desktop shell, LLM API integration, default schema migration, upstream methodology amendment, product glossary update, or new hard browser/e2e root gate was introduced.

## Verification

- `pnpm --filter @worldloom/server exec vitest run test/setup-open-world.test.ts` passed.
- `pnpm --filter @worldloom/web exec vitest run src/setup-open-world.test.tsx` passed.
- `pnpm --filter @worldloom/server test` passed.
- `pnpm --filter @worldloom/web test` passed.
- `pnpm test` passed.
- `pnpm typecheck` passed.
- `pnpm build` passed.
