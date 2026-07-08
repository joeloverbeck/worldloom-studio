# PRD #270 Propagation Active Route Replay

Date: 2026-07-08

Scope: PRD #270 and child issues #286-#291.

## Result

The active Propagation owed-debt route is walkthrough-passed for the representative replay. The app now routes from the workflow map owed item into the Propagation decision surface, preserves the owed debt/source fact identity, exposes shock-cone and domain-atlas controls, supports in-flow Propagation Prompt-out, refuses close while required coverage is missing, closes with a propagation report and owed-debt closure after coverage is supplied, and renders the close preview plus read-side trail after completion.

This closes the PRD #270 active owed-debt sweep caveat. It does not promote global Prompt-out to prompt-context-complete or field-validated, and it does not claim direct external LLM validation.

## Fixture

Replay world:

- `/tmp/worldloom-propagation-replay-1783496130555.sqlite`

Representative records:

- Source fact: `FAC-1`, record id `1`, title `Noon bridge testimony`
- Owed debt: `DEB-1`, record id `2`, title `Propagation owed for noon bridge`
- Propagation flow: id `1`
- Close report: `PRP-1`, record id `3`

The fixture intentionally starts from a representative propagation debt linked to a source fact rather than an Admission-created debt. PRD #270's active-route requirement is the Propagation route itself: owed queue identity, active sweep controls, Prompt-out context, close preview, and read-side proof from an owed debt. This keeps the replay independent from sibling Admission PRDs while still using the same record/link contract the active route consumes.

## Issue Evidence Map

| Issue | Evidence |
|---|---|
| #286 | Owed queue row carried `sourceFact`, `owedItem`, and `route`; browser workflow map exposed `Work owed propagation`; Start/Resume used the server-owned route body; mismatched source/debt identity is rejected by focused server tests; same-session world switch reset is covered by the web route test. |
| #287 | Server returned severity-derived coverage obligations, six shock-cone order controls, and fourteen domain-atlas states; close refused while blockers remained; replay completed only after major-severity order/domain obligations were supplied. |
| #288 | Replay recorded consequences, a high-pressure disposition, negative domain declaration, no surfaced proposals, and preservation-boundary/debt behavior; close report sections include dispositions, proposals, and debt boundaries. |
| #289 | Browser rendered Propagation Prompt-out in the active flow; API readback generated a Proposal packet for the same flow and verified the packet included the owed debt plus advisory/canon warning. |
| #290 | Browser rendered close blockers before completion, `Close/result preview` after completion, and read-side trail chips for source fact, propagation report, owed debt, current canon, and audit trail. |
| #291 | This report, the browser screenshots, API readback, cognitive walkthrough notes, and the narrow `docs/methodology-coverage.md` update are the replay closeout evidence. |

## Browser Proof

Artifacts:

- `output/playwright/prd270-propagation-after-owed-entry.png`
- `output/playwright/prd270-propagation-after-close-read-side.png`

Route exercised:

1. Opened the replay world from Recent worlds.
2. Used the workflow map owed item labeled `Work owed propagation`.
3. Entered the active Propagation destination with `Go to decision`.
4. Started the owed run with `Start/Resume Owed Run`.
5. Verified the active surface showed:
   - source fact `FAC-1: Noon bridge testimony`
   - owed debt `DEB-1: Propagation owed for noon bridge`
   - flow `1`
   - severity `3 / major`
   - shock-cone order controls
   - domain-atlas sweep cards
   - missing-coverage close blockers
   - Propagation Prompt-out controls and prompt preview context
6. Completed the sweep through the server API.
7. Refreshed flow `1` in the active Propagation destination.
8. Verified the browser showed no server-returned blockers, `Close/result preview`, and `Read-side trail` entries for source fact, propagation report, owed propagation debt, current canon, and audit trail.

## API Readback

The completion replay used the app API against the running dev server.

Key readback:

- `flowId`: `1`
- `sourceFactId`: `1`
- `owedDebtId`: `2`
- first consequence id: `1`
- high-pressure consequence id: `2`
- Prompt-out packet hash: `3bac59de783d47aff2b187070061bf7001c2f966cdbd142571fba10bf77d4edb`
- Prompt packet included owed debt text: `true`
- Prompt packet included advisory/canon warning: `true`
- `beforeCloseBlockers`: `[]`
- close report id: `3`, code `PRP-1`
- closed owed debt id: `2`, code `DEB-1`, canon status `accepted`
- `closePreview.status`: `ready`
- `closePreview.blockers`: `[]`

Close preview write/read boundary:

- will write: existing append-only propagation report `PRP-1`, source fact digest link, provenance link for surfaced proposals, and owed propagation debt closure
- will leave untouched: source canon standing, proposed facts, and advisory artifacts unless explicitly linked by steward use

Report sections read back:

- `Fact and run`
- `Shock-cone orders`
- `Domain-atlas sweep`
- `Negative domains`
- `Consequences and dispositions`
- `Surfaced proposals`
- `Debt and preservation boundaries`
- `Stopping-rule audit`

Links read back:

- report `PRP-1` derived from source fact `FAC-1`
- source fact digest link back to report `PRP-1`
- owed debt `DEB-1` derived from source fact `FAC-1`

## Cognitive Walkthrough

The active route now gives a steward enough information to do Propagation work without reading the methodology docs beside the app. The owed queue names the debt and source fact before start. The active run keeps those identities visible after start and resume. Coverage controls are not a generic form: the page names the six shock-cone orders, the fourteen domain atlas areas, current triage state, severity-derived blockers, and which write boundaries close will touch. The page also distinguishes Prompt-out advisory text from canon writes by keeping prompt generation in-flow and showing the advisory/canon warning in the generated packet.

The close path is legible after completion. The browser read-side trail names the source fact, propagation report, owed propagation debt, current canon, and audit trail, so a steward can navigate what changed and what remained untouched.

## External LLM Status

No external cold LLM executor is available in this environment. The replay therefore does not claim external LLM success. The local Prompt-out evidence verifies that the generated Propagation packet was assembled for the active owed run, included the owed debt text, and included the advisory/canon warning. This is sufficient for PRD #270's local active-route replay report, but global Prompt-out remains honestly caveated until a real external cold LLM trial is available.
