# PRD #249 Full-Gate Walkthrough

Date: 2026-07-07

## Scope

This report covers PRD #249 / issues #252-#256: routed Admission full-gate completion for a severe proposed fact, including server-owned executable contract rendering, keyed validation, input preservation after failed validation, explicit advisory-use selection, in-place canon standing update, and read-side/gate-result evidence.

## Browser Route

- App: `http://127.0.0.1:5175/` (Vite selected port 5175 because 5173 and 5174 were occupied)
- API: `http://127.0.0.1:4173`
- World: `/tmp/worldloom-prd249-browser.sqlite`
- Surface: Workflow map -> Admission queue -> selected `FAC-1 Bridge toll bell law`

## Actions

1. Created a disposable world and proposed `FAC-1 Bridge toll bell law` as `canon_fact` with `Objective canon` / `proposed`.
2. Declared `admission_level=4` and `work_scale=severe`; `/api/admission/records/1/severity` returned a full-gate contract with 17 sections.
3. Stored `ADV-1 Advisory artifact: admission:constraints` through the Admission Prompt-out step.
4. In the browser, opened the world, navigated to Admission, selected `FAC-1`, and verified the `Full-gate completion form` rendered sections, allowed status, primary operation, validation panel, read-side trail, and `ADV-1`.
5. Submitted an incomplete form with only fact statement and written consequence. The server returned 400; the browser displayed keyed validation errors including `Dependencies require steward-authored substance.` and preserved the entered fact/consequence text.
6. Filled the required full-gate sections, selected `ADV-1`, and submitted `Complete and update canon standing`.

## Outcome

- Browser decision contract showed `admission · complete · record:1:complete`.
- `FAC-1` updated to `canonStatus: accepted`.
- `GAT-1` was created as a `gate_result` with `Gate sections:`.
- Links from `FAC-1` include:
  - `derived_from -> GAT-1`
  - `derived_from -> ADV-1`
  - `cites_advisory_artifact -> ADV-1`
- The only console error during the run was the expected 400 from the intentional invalid validation submit.

## Artifact

- Browser screenshot: `output/playwright/prd249-full-gate-completed.png`
