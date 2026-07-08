# PRD #268 Active Packet Identity Walkthrough

Date: 2026-07-08

Scope: issues #279-#282 for active Prompt-out packet currentness across routed Creation and Admission surfaces.

## TDD Evidence

Red test first failed on the intended active-route identity regression:

- `renders a server-provided sandwich packet preview...` expected a preview-only packet selector; the preview still used `prompt-packet-text`.
- Creation currentness expected one canonical `prompt-packet-text` node; the active route rendered two because preview and current body shared the selector.
- Admission currentness expected one canonical `prompt-packet-text` node; the active route rendered two for the same reason.

Focused green suite:

- `pnpm --filter @worldloom/web exec vitest run src/prompt-out-lifecycle.test.tsx --reporter=dot`
- Result: 7 tests passed.
- `pnpm --filter @worldloom/server exec vitest run test/prompt-out.test.ts --reporter=dot`
- Result: 6 tests passed.

Root gates:

- `pnpm test`
- `pnpm typecheck`
- `pnpm build`
- Result: all passed.

The lifecycle suite now verifies:

- Preview packet text uses `prompt-packet-preview-text`, not `prompt-packet-text`.
- Current packet bodies use one canonical `prompt-packet-text` plus `current-prompt-packet-text` and `data-current-prompt-packet="true"`.
- Stale packet bodies use `stale-prompt-packet-text` and `data-stale-prompt-packet="true"` without the canonical current-body class.
- Creation stale cases cover mode, selected section, seed-decomposition step, and world changes.
- Admission stale cases cover mode, selected record, severity/full-gate step, full-gate draft identity, and world changes.
- Shared copy/store source guards still depend on `canUseCurrentPromptPacket`.

## Implementation

`PromptPacketPreview` now renders preview text with `prompt-packet-preview-text` and `data-prompt-packet-preview="true"`, so the preview can never be mistaken for the active loaded packet body.

`PromptPacketBodyStatus` now gives current, stale, and unbound packet bodies distinct DOM markers:

- current: `prompt-packet-text current-prompt-packet-text` and `data-current-prompt-packet="true"`
- stale: `stale-prompt-packet-text` and `data-stale-prompt-packet="true"`
- unbound: `unbound-prompt-packet-text` and `data-unbound-prompt-packet="true"`

The visual styling remains shared across these text blocks.

## Browser Replay

Dev server:

- API: `http://127.0.0.1:4173`
- Web: `http://127.0.0.1:5173`

Seed world:

- `/tmp/worldloom-prd268-active-identity-a.sqlite`

Artifact:

- `output/playwright/prd268-active-packet-identity-stale.png`

Console check:

- `playwright-cli console error` returned 0 errors and 0 warnings at error level.

### Creation

Replay path:

1. Created `/tmp/worldloom-prd268-active-identity-a.sqlite`.
2. Entered Workflow map -> Creation.
3. Confirmed World premise Proposal mode was refused and Prompt-out load was disabled until steward-authored material existed.
4. Saved World premise text: `A harbor city where every public promise changes the weather.`
5. Saved consequence mode: `hard speculative`.
6. Selected Pressure mode and loaded Creation Prompt-out.
7. Verified source manifest, omissions, advisory warning, loaded mode, current loaded origin, and one canonical current packet body.
8. Switched back to Proposal mode to make the loaded Pressure packet stale.

Current Creation DOM proof:

```json
{
  "currentSections": 1,
  "canonicalBodies": 1,
  "currentBodies": 1,
  "staleSections": 0,
  "staleBodies": 0,
  "previewBodies": 1,
  "bodyState": "subpanel prompt-packet-body-status current",
  "loadedMode": true,
  "advisoryWarning": true,
  "sourceManifest": true,
  "omissions": true
}
```

Stale Creation DOM proof after mode change:

```json
{
  "currentSections": 0,
  "canonicalBodies": 0,
  "currentBodies": 0,
  "staleSections": 1,
  "staleBodies": 1,
  "previewBodies": 1,
  "staleHeading": true,
  "staleReason": true,
  "priorMode": true,
  "selectedMode": true,
  "loadDisabled": [true],
  "bodyState": "subpanel prompt-packet-body-status stale"
}
```

### Admission

Replay path:

1. Parked proposed seed `Weather-binding oath` from the Creation route.
2. Entered Admission and selected queued record `FAC-1`.
3. Confirmed the Admission queue/severity preview exposed selected record context, source manifest, omissions, advisory warning, and enabled `Load Admission Prompt-out Step`.
4. Loaded Admission Prompt-out for `FAC-1`.
5. Verified one current canonical packet body and no stale body.
6. Declared `admission_level` 4 and `work_scale` severe to move from queue/severity to full-gate context.
7. Verified the prior queue/severity packet became stale, lost the canonical current-body marker, and displayed the no-copy/export/store stale reason.

Current Admission DOM proof:

```json
{
  "currentSections": 1,
  "canonicalBodies": 1,
  "currentBodies": 1,
  "staleSections": 0,
  "staleBodies": 0,
  "previewBodies": 1,
  "currentHeading": true,
  "staleHeading": false,
  "record": true,
  "mode": true,
  "step": true,
  "template": true,
  "admissionLevel": true,
  "sourceManifest": true,
  "omissions": true,
  "advisoryWarning": true,
  "bodyState": "subpanel prompt-packet-body-status current"
}
```

Stale Admission DOM proof after severity/full-gate transition:

```json
{
  "currentSections": 0,
  "canonicalBodies": 0,
  "currentBodies": 0,
  "staleSections": 1,
  "staleBodies": 1,
  "staleHeading": true,
  "staleReason": true,
  "priorQueueStep": true,
  "fullGateContext": true,
  "severeContext": true,
  "bodyState": "subpanel prompt-packet-body-status stale"
}
```

### Same-Runtime World Switch

Replay path:

1. Reopened `/tmp/worldloom-prd268-active-identity-a.sqlite` in a fresh browser session.
2. Entered Creation, saved a minimal World premise and consequence mode, and loaded a current Creation Pressure packet.
3. Confirmed world A exposed one current canonical packet body before the switch.
4. Entered `/tmp/worldloom-prd268-active-identity-b.sqlite` and accepted the app's world-switch warning in the same browser runtime.
5. Verified world B opened with no A-world packet body, loaded status, source manifest, current packet selector, or stale packet selector. The old A path was visible only in the Recent Worlds history list.

Before switch:

```json
{
  "worldAOpen": true,
  "currentSections": 1,
  "canonicalBodies": 1,
  "currentBodies": 1,
  "staleSections": 0,
  "oldMarker": true,
  "loadedStatus": true
}
```

After switch:

```json
{
  "worldBOpen": true,
  "oldWorldVisible": true,
  "oldMarkerVisible": false,
  "currentSections": 0,
  "canonicalBodies": 0,
  "currentBodies": 0,
  "staleSections": 0,
  "staleBodies": 0,
  "loadedStatus": false,
  "promptStatusText": false,
  "sourceManifest": false,
  "recentWorldHistoryOnly": true
}
```

## Cognitive Walkthrough

Naive-steward walkthrough result: pass for the PRD #268 routed Creation and Admission packet identity paths.

- The steward can identify the current packet because the status region says `Current prompt packet body` only when the packet identity matches the active route, world, flow, record, section, step, mode, template, severity context, draft identity, and packet freshness.
- The steward can identify a stale packet because the stale status names the prior origin and says the body cannot be copied, exported, or stored as the active decision's current packet.
- Preview packet text, source manifest, omissions, and advisory/canon warnings remain visible but are not counted as the active current packet body.
- Creation route transitions through mode change, selected section, seed-decomposition step, and world identity are covered by browser-surface tests; the live replay exercised current and mode-stale behavior.
- Admission route transitions through selected record, mode, severity/full-gate step, full-gate draft identity, and world identity are covered by browser-surface tests; the live replay exercised current and severity/full-gate stale behavior.
- The routed surfaces keep Prompt-out advisory: pasted responses remain advisory artifacts and do not mutate kernel sections, seed records, reports, proposals, or Admission canon standing without explicit steward action.

## Cold LLM Evidence

Blocked: no external cold LLM execution tool is available in this local session. This report does not claim a cold external LLM pass or promote global Prompt-out to prompt-context-complete.

The packet contents were inspected through browser replay and browser-surface tests: current packets include source manifest, omissions, advisory warning, mode/status identity, and selected Creation or Admission context without relying on hidden repository context.

## Issue Evidence

- #279: current/preview/stale DOM markers now make a single active current packet body auditable, while stale packet bodies cannot share the canonical current selector.
- #280: Creation browser-surface tests cover mode switch, selected-section switch, seed-decomposition step switch, and world switch; browser replay covers routed current and mode-stale behavior.
- #281: Admission browser-surface tests cover selected-record switch, mode switch, severity/full-gate context, full-gate draft identity, and world switch; browser replay covers routed current and queue/severity-to-full-gate stale behavior.
- #282: this report, the screenshot artifact, the same-runtime world-switch replay, the focused tests, and `docs/methodology-coverage.md` update close the active packet identity evidence loop while preserving PRD #269 and PRD #270 caveats.

## Coverage Decision

`docs/methodology-coverage.md` now records PRD #268 as closed for routed Creation and Admission active-route packet currentness. It does not close the PRD #269 target-heading active-route caveat, the PRD #270 Propagation active replay caveat, direct LLM integration, or global field validation for Prompt-out.
