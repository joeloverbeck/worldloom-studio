# PRD #233 Creation Kernel Hardening Walkthrough

Date: 2026-07-07

Scope: PRD #233 and issues #244-#248. This is the browser-backed closeout for the Creation kernel-authoring hardening cluster: saved consequence mode, section-keyed kernel drafts, selected-section prompt context, and clean-world Creation entry.

## Fixture

- Dev server: `pnpm dev`
- Browser URL: `http://127.0.0.1:5175/`
- World file: `/tmp/worldloom-prd233-reviewfix-20260707.sqlite`
- Screenshots:
  - `output/playwright/prd233-creation-kernel-stale-guard.png`
  - `output/playwright/prd233-creation-kernel-hardening.png`
- Browser console: 0 errors, 0 warnings; only the standard React DevTools info message appeared.

## Walkthrough

1. Created a fresh world from setup/open controls. The workflow map rendered the new world path and showed Creation as the active next decision.
2. Opened the routed Creation destination. The app auto-started/resumed Creation flow `1`; kernel authoring showed `Flow 1` before editable fields were used.
3. Selected consequence mode `weird`. The browser showed `Unsaved draft consequence mode: weird. Save the kernel step before decomposition can use it.` Decomposition readiness stayed blocked with save-specific wording and the decompose action stayed disabled for the unsaved mode.
4. Authored the World premise section and saved. The refreshed surface showed `Saved consequence mode: weird.`, `Saved consequence mode ready.`, `Saved text is available for World premise.`, and `Flow 1 - kernel 1`.
5. Selected `Starting scale`. The field cleared and showed `No saved text exists yet for Starting scale; the field should start empty for this section.`
6. Before saving Starting scale, Prompt-out showed `Prompt-out waits for the selected section to be saved before it can use Starting scale.` and disabled `Load Creation Prompt-out Step`, preventing the visible selected heading from loading a prior server-selected section packet.
7. Typed an unsaved Starting scale draft, switched to `Core promise`, and observed the Core promise field empty with its own no-saved-text message. The Starting scale draft did not transfer.
8. Switched back to `Starting scale`. The browser restored the draft under that heading and showed `Unsaved draft held under its own heading key: Starting scale.`
9. Saved Starting scale. The refreshed surface showed `Saved text is available for Starting scale.`, the save target remained `Starting scale`, and the Prompt-out preview/source manifest switched to `Selected kernel section: Starting scale` with the saved Starting scale body.
10. Entered a seed title/body, selected `Objective canon`, supplied a granularity rationale, and clicked `Decompose and Park Seed`.
11. The final Creation handoff showed `FAC-1 - Raid broadcasts allocate power rations`, truth layer `Objective canon`, current canon status `proposed`, the seed decomposition report, kernel/read-side links, and the Admission queue route.

## Issue Evidence

- #244: `packages/server/src/creation-flow.ts` now returns saved consequence-mode state, selected-section save target, saved body or explicit empty state, and selected-section prompt context from the server contract. `packages/server/test/creation-flow.test.ts` covers missing/saved consequence mode, selected saved-section hydration, empty-section state, prompt/source context, and targeted section saves.
- #245: `packages/web/src/main.tsx` renders consequence mode as draft/saved state and blocks readiness/decompose for an unsaved local selection. The browser proof selected `weird`, observed unsaved-draft copy and save-specific readiness, then saved and observed saved readiness.
- #246: `packages/web/src/main.tsx` keeps kernel body drafts keyed by kernel record and heading, hydrates saved headings from the server contract, clears empty headings, exposes held-draft state, and blocks Creation Prompt-out loading while a local selected heading/draft is not saved into the server-selected section. The browser proof switched Starting scale -> Core promise -> Starting scale without silent text transfer.
- #247: The routed Creation destination auto-started/resumed the flow before authoring was used. The surface includes a disabled-with-blocker fallback for pending/failed start/resume, and the shared reset boundary clears Creation section drafts on world switch.
- #248: This report, `docs/methodology-coverage.md`, `output/playwright/prd233-creation-kernel-stale-guard.png`, and `output/playwright/prd233-creation-kernel-hardening.png` provide the durable browser evidence and coverage closeout.

## User Story Mapping

- US1-US4: covered by the saved/draft consequence-mode contract, browser state, focused server/web tests, and browser steps 3-4.
- US5-US10, US15-US16, and US19: covered by selected-section server payload, section-keyed browser drafts, focused tests, and browser steps 5-8.
- US11-US13, US17, and US21: covered by auto-start/resume state, disabled-with-blocker fallback, reset-boundary coverage, and browser step 2.
- US18, US20, and US22: covered by this report, screenshot artifact, console check, coverage-ledger update, and final closeout gates.

## Naive-Steward Check

The final browser state names the current Creation decision, method card, package provenance, required/allowed-empty work, consequence-mode saved state, selected section state, Prompt-out source manifest, advisory/canon warning, readiness blockers, write intent, read-side trail, safe exit/resume text, and Creation-to-Admission handoff. A steward can see that Creation parks `proposed` material for Admission without opening source docs.

## Verification Matrix

| Evidence | Coverage |
|---|---|
| `pnpm --filter @worldloom/server exec vitest run test/creation-flow.test.ts` | #244 server contract and saved-facet policy |
| `pnpm --filter @worldloom/web exec vitest run src/creation-decision-surface.test.tsx src/setup-open-world.test.tsx` | #245-#247 browser surface and reset boundary |
| `pnpm --filter @worldloom/server typecheck` | server type contract |
| `pnpm --filter @worldloom/web typecheck` | browser type contract |
| Playwright CLI walkthrough on `http://127.0.0.1:5175/` | #248 browser proof and cognitive walkthrough |
| `pnpm test`, `pnpm typecheck`, `pnpm build` | root gates passed locally before issue closeout |

## Coverage Ledger Impact

`docs/methodology-coverage.md` records PRD #233 as closing Field Build 02's residual Creation kernel-authoring caveats for the exact kernel-to-first-seed browser path. This does not promote Creation phase 3, Creation phases 9-10, global Prompt-out field validation, Admission completion controls, or downstream flows beyond their already recorded evidence.
