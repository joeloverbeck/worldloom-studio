# PRD #232 World State Reset Walkthrough

Date: 2026-07-07

Scope: PRD #232 and issues #240-#243. This is a browser-backed closeout for the same-session world-switch trust fix and the loaded Prompt-out status identity fix.

## Fixture

- Dev server: `pnpm dev`
- Browser URL: `http://127.0.0.1:5175/`
- World A: `/tmp/worldloom-prd232-world-a.sqlite`
- World B: `/tmp/worldloom-prd232-world-b.sqlite`
- Distinct world A browser markers:
  - Kernel section text: `PRD232-WORLD-A-KERNEL`
  - Parked seed title/body: `PRD232 world A seed` / `PRD232-WORLD-A-SEED-BODY`
- Screenshot: `output/playwright/prd232-world-switch-status.png`

## Walkthrough

1. Created world A from setup/open controls in the running browser, entered the routed Creation destination, and started Creation flow `1`.
2. Authored the World premise kernel section with `PRD232-WORLD-A-KERNEL`, selected consequence mode `hard speculative`, and saved the kernel step.
3. Loaded the Creation Pressure-mode Prompt-out packet for the kernel prompt. The visible loaded status named the exact current origin: world A, flow `creation`, flow/run `1`, record `1`, step `creation:kernel_prompt`, mode `pressure`, template `kernel_pressure`, and the World premise decision label. The page also showed `Loaded mode: Pressure mode`.
4. Parked a seed with title `PRD232 world A seed`, body `PRD232-WORLD-A-SEED-BODY`, truth layer `Objective canon`, and steward-authored granularity rationale. The loaded Prompt-out status stayed visible only as a stale prior-decision origin, with the prior world/flow/record/step/mode/template and the reason `Current decision changed to Split broad steward material into smaller seed facts that can be independently rejected.`
5. Entered world B's path in setup controls and clicked `Create world` without refreshing the browser runtime. The app displayed and accepted the warning: `Switching worlds clears current-world browser drafts, Prompt-out status, selections, and flow buffers before the new world renders. Continue?`
6. World B rendered as the active world in the same page runtime. Browser text checks showed:
   - `hasWorldB: true`
   - `hasKernelMarker: false`
   - `hasSeedMarker: false`
   - `hasLoadedStatus: false`
   - `hasWorkflowMap: true`
7. The only remaining world A path text was the Recent worlds history entry. No world A kernel text, seed text, prompt packet, loaded Prompt-out status, selected Creation decision, or draft buffer rendered under world B's active path.
8. Browser console check after the run reported `Errors: 0, Warnings: 0`.

## Issue Evidence

- #240: `docs/specs/workflow-map-and-navigation.md` now states successful create/open of a different world is the world-scoped reset boundary and adds the same-runtime acceptance proof. `docs/specs/prompt-out-context-assembly.md` now states loaded/copied prompt status is scoped to exact prompt origin identity and must clear or render stale when that identity no longer matches.
- #241: `packages/web/src/main.tsx` adds the named `resetWorldScopedBrowserState` boundary and unsaved-buffer switch warning around create/open success. `packages/web/src/setup-open-world.test.tsx` locks the reset boundary, warning, failed-open preservation, and broad world-scoped state coverage. Browser proof switched from world A to world B in one runtime and verified the old Creation markers and loaded status were absent.
- #242: `packages/web/src/main.tsx` binds loaded Prompt-out status to world path, flow key/id, record id, step key, mode, template, decision label, and Admission severity context where available. `packages/web/src/prompt-out-lifecycle.test.tsx` locks current/stale rendering and clear/return actions. Browser proof showed a current Creation prompt origin, then a stale prior origin after seed parking changed the active decision.
- #243: This report, `docs/methodology-coverage.md`, and `output/playwright/prd232-world-switch-status.png` provide the durable closeout record and browser-visible artifact.

## PRD User Story Mapping

- Stories 1-8 and 14-17: covered by the named world-scoped reset boundary, the unsaved-buffer warning, the setup/open React test, and the world A to world B browser proof. The proof exercised Creation flow state, kernel/seed drafts, Prompt-out status, flow identifiers, decision payloads, action state, and the switch warning. Admission state is covered by the same named reset boundary and test coverage rather than by a separate manual Admission browser walkthrough.
- Stories 9-13 and 16: covered by loaded-status identity state, current/stale status rendering, clear/return actions, the Prompt-out lifecycle React test, and the browser proof that seed parking changed the active decision and made the prior prompt origin stale.
- Stories 18-19: covered by the spec amendments and methodology coverage ledger update.
- Stories 20-22: covered by the focused React tests plus this browser walkthrough and screenshot artifact. No repo-wide Playwright/e2e gate was added.

## Caveats

- The browser walkthrough used the Creation path as the representative same-runtime proof because Field Build 02's trust break was visible there. Admission reset is asserted through the shared reset boundary and regression test, not by a separate manually seeded Admission switch run.
- The Recent worlds list intentionally retains historical paths after a switch. That is not treated as stale world-scoped decision state because it is setup history, not a visible flow record, prompt packet, loaded status, draft, selected record, queue selection, or decision payload.
- This closeout does not promote unrelated Creation hardening from sibling PRD #233, and it does not move canonical world state into browser storage.
