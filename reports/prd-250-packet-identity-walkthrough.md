# PRD #250 Packet Identity Walkthrough

Date: 2026-07-07

## Scope

This report covers PRD #250 / issues #257-#261: Prompt-out packet identity metadata, the shared origin-bound packet-body guard, Creation and Admission stale-state consumers, and the coverage closeout for packet-body trust.

## Browser Route

- App: `http://127.0.0.1:5175/` (Vite selected port 5175 because 5173 and 5174 were occupied)
- API: `http://127.0.0.1:4173`
- World: `/tmp/worldloom-prd250-packet-identity.sqlite`
- Surface: Workflow map -> Creation -> selected `World premise` kernel section -> Pressure-mode Prompt-out
- Screenshot: `output/playwright/prd250-packet-identity-current.png`

## Real Browser Smoke

1. Opened the app in a fresh Playwright browser session and opened `/tmp/worldloom-prd250-packet-identity.sqlite`.
2. Entered the routed Creation destination from the workflow map.
3. Verified the Creation Prompt-out preview showed selected-section context, source manifest, omissions, advisory/canon warning, and non-mutation expectations for `World premise`.
4. Selected Pressure mode and loaded `Load Creation Prompt-out Step`.
5. Browser text assertion after load returned:
   - `hasCurrent: true`
   - `hasStale: false`
   - `hasLoadedCurrent: true`
   - `hasPriorOrigin: true`
   - `message: true`
6. Fresh-browser console check returned 0 errors and 0 warnings at error level.

The smoke proves the production route can load a current selected-section Creation packet without the loaded status and visible packet body disagreeing. It is intentionally narrower than the full transition matrix, which is locked by the browser-surface tests below.

## Browser-Surface Transition Matrix

`packages/web/src/prompt-out-lifecycle.test.tsx` renders the app surface with server-shaped Prompt-out identities and verifies:

- A matching Creation identity renders `Current prompt packet body` with section `World premise`, record short id `KER-1`, and no stale body.
- Creation mismatches for mode switch, selected-section switch, kernel-to-seed-decomposition step change, and world switch render `Stale prompt packet body`, name the prior origin, and do not render `Current prompt packet body`.
- A matching Admission identity renders `Current prompt packet body` with record short id `FAC-7` and severity context `none`.
- Admission mismatches for mode switch, selected-record switch, queue/severity-to-full-gate severity and step change, and world switch render `Stale prompt packet body`, name the prior origin, and do not render `Current prompt packet body`.
- The status regions use `role="status"` and `aria-live="polite"`.
- The shared copy/store affordances are source-guarded by `canUseCurrentPromptPacket`, so stale or unbound packet bodies cannot be copied or stored as current.

## Server Identity Evidence

`packages/server/test/prompt-out.test.ts` verifies generated Prompt-out packet identity for:

- Creation kernel packets: flow, flow/run id, step key, mode, template key, selected world-kernel record, selected section heading, generated timestamp, and SHA-256 packet hash.
- Admission packets: selected record id/short id/type, step key, mode, template key, `admission_level`, `work_scale`, generated timestamp, and SHA-256 packet hash.

`packages/server/test/prompt-out-lifecycle.test.ts` verifies Prompt-out step lifecycle identity and generated identity use compatible fields. Step lifecycle identity has no generated timestamp/hash until a packet is generated; generated packets add freshness.

## Cold Packet Check

No external cold LLM tool is available in this environment. Per #261, this is recorded as blocked evidence and this report does not claim that the cold-test checklist passed.

Structural packet inspection still shows the current packet is self-contained: the browser-visible Creation packet includes compact mode framing, selected section material, package doctrine, source documents, standing rulings, omissions, source manifest, advisory/canon warning, output labels, and forbidden moves. The Admission packet structure is covered by server tests and Admission browser-surface render tests, but not by an external cold LLM run.

## Naive-Steward Walkthrough

A docs-closed steward can identify:

- The current packet: the status region says `Current prompt packet body` only when the packet identity matches the active world, flow/run, record, section, step, mode, template, severity context, and body freshness.
- Why a prior packet is stale: stale status names the prior world, flow/run, record, record short id, record type, selected section when applicable, step, mode, template, generated time/hash, and Admission severity context.
- How to recover: load or generate the Prompt-out step for the active decision after changing mode, section, record, severity, step context, or world.
- Advisory/canon separation: packet previews and generated packets repeat that pasted responses remain advisory artifacts and do not mutate canon fields without explicit steward use.

## Issue Evidence

- #257: server identity metadata added to generated Prompt-out responses and Prompt-out step lifecycle responses; focused server tests cover Creation and Admission.
- #258: the browser stores packet body with packet identity, renders current/stale/unbound packet body status through an accessible status region, and gates copy/store on `canUseCurrentPromptPacket`.
- #259: Creation currentness covers mode, selected section, seed-decomposition step, and world changes in browser-surface tests; the real browser smoke verifies a current Creation Pressure packet on the production route.
- #260: Admission currentness covers mode, selected record, severity/full-gate context, and world changes in browser-surface tests.
- #261: this report, `docs/methodology-coverage.md`, focused tests, browser smoke, and screenshot artifact provide the durable proof and coverage closeout.

## PRD User Story Mapping

- US1, US2, US7, US8, US10-US12, US16: #258 shared guard and browser-surface tests prove body/status agreement, visible stale prior origin, and disabled current-packet extraction paths through `canUseCurrentPromptPacket`.
- US3, US6, US15 Creation-side behavior: #259 tests cover mode, selected section, seed-decomposition, and world changes; browser smoke verifies the current Creation route.
- US4, US5, US15 Admission-side behavior: #260 tests cover selected-record, severity/full-gate context, mode, and world changes.
- US9 accessible transition: #258-#261 render current/stale packet body state in status regions with live announcements.
- US13, US14, US17 server identity and cross-flow metadata: #257 server tests and the shared browser identity conversion cover Creation and Admission metadata.

## Coverage Decision

`docs/methodology-coverage.md` records packet-body trust as hardened for Creation and Admission without promoting global Prompt-out maturity to field-validated, without claiming direct LLM integration, without claiming PRD #251 Creation Proposal decoupling, and without promoting untested flows.
