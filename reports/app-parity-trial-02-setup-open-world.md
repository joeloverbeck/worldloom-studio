# App Parity Field Trial 02 - Setup and world-file opening

**Date:** 2026-07-05 | **App commit:** b34854e | **Method version:** worldbuilding-system 1.0
**Trial world:** Mourningweather - public grief precipitates literal weather; unmourned losses become floods, droughts, or corrosive fog. Machinery: affective-climatic / ecological-emotional, distinct from Saltmarrow and Carillon.
**Stretch walked:** App setup, token entry, catalog load, and world-file create/open before Creation can resume. **Prior runs:** `reports/app-parity-trial-01-creation-decision-points.md`.

## Durability and PRD #158 decision

This report is the durable repo summary for the setup/open-world field trial. The scratch files listed below were local evidence captures and must not be cited as stable implementation authority on their own.

PRD #158 supersedes the pre-PRD fix directions in this report wherever they suggest validating, documenting, or recovering a manual browser token. The ratified v1 direction is no manual token gate: local setup is bounded by the loopback browser/API boundary, not a steward-entered secret.

## Evidence

Scratch artifacts are under `/tmp/worldloom-parity-trial/`:

- `app-parity-02-entry.png` and `app-parity-02-entry.snapshot.txt` - first-load screen.
- `app-parity-02-path-filled.snapshot.txt` - `/tmp/worldloom-parity-setup-blocker.sqlite` in the world path field.
- `app-parity-02-after-create.png` - create attempt with no valid token.
- `app-parity-02-typed-invalid-token.png` - reported invalid token state, `aaaaaa`.
- `app-parity-02-invalid-token-after-create.png` and `app-parity-02-invalid-token-create.snapshot.txt` - create attempt with `x-worldloom-token: aaaaaa`.

Runtime notes:

- `pnpm dev` started successfully.
- Vite reported port drift from 5173 to `http://127.0.0.1:5174/`, matching the reported URL.
- The server printed a runtime `WORLDLOOM_TOKEN` in the terminal, but the blind steward did not have an in-app path to discover or validate it.

## Findings

### G-01 - Token setup blocks the app before methodology work begins. Severity: blocking.

- Screen: entry header token field and first-load page (`app-parity-02-entry`, `app-parity-02-typed-invalid-token`).
- What the steward saw: a single unlabeled-purpose token input with placeholder `server token`; when the field contained `aaaaaa`, the browser repeatedly logged 401s for `/api/health` and `/api/catalog`. The page kept showing a full form surface with empty dropdowns. The visible token field did not explain where the token comes from, whether it is valid, how to recover from a stale value, or why the catalog failed.
- What the methodology requires: the operating card's new-world path starts with the steward filling a lean world kernel and decomposing seeds (`docs/worldbuilding-system/operating_card.md`); `docs/specs/workflow-map-and-navigation.md` says a new world with no kernel foregrounds Creation start/resume; `docs/principles/guided-workflow-usability.md` says the browser must let the steward work the method without reconstructing protocol from memory.
- The gap: the app requires out-of-band terminal knowledge before the docs-naive steward can even open a world. A stale localStorage token (`worldloom-token=aaaaaa`) produces repeated API failures and blank controls rather than a setup decision surface.
- Fix direction: add a setup-first state that validates token health/catalog access, explains the local dev token source, exposes stale-token recovery, and blocks or collapses downstream workflow controls until auth is valid.
- PRD #158 update: remove the manual token gate instead of adding token recovery UI; stale browser token state must be ignored by the product path.
- Touches: `docs/specs/workflow-map-and-navigation.md`, `docs/specs/browser-visible-guidance-acceptance.md`, `docs/principles/guided-workflow-usability.md`; extends Trial 01 Q-01 from cosmetic setup friction to a blocking setup gap.

### G-02 - World-file create/open fails without local recovery. Severity: blocking.

- Screen: world-file path controls in the entry header (`app-parity-02-path-filled`, `app-parity-02-invalid-token-create`).
- What the steward saw: entering `/tmp/worldloom-parity-setup-blocker.sqlite` and clicking `Create` left the page at `No world file open`. Network evidence showed `POST /api/worlds/create` returning 401 with `{"error":"Missing or invalid Worldloom token"}`. No SQLite file was created.
- What the methodology requires: one SQLite file is the canonical local world (`docs/specs/schema-v1.md`), and the browser must provide a start/resume path before guided workflow work can happen (`docs/specs/workflow-map-and-navigation.md`).
- The gap: a simple local file path does not create or open anything unless auth is already correct, and the app does not keep the failure at the world-file action with a clear recovery path. The blind steward cannot reach the trial world or seed a new one.
- Fix direction: make create/open a guided setup step: validate token first, then validate path, then show success/failure inline near the controls; on failure, preserve the path and explain the exact missing prerequisite.
- PRD #158 update: validate server/catalog readiness and world-file path without any token prerequisite.
- Touches: `docs/specs/schema-v1.md`, `docs/specs/workflow-map-and-navigation.md`, `docs/specs/browser-visible-guidance-acceptance.md`.

### O-01 - The no-world screen is still an everything panel. Severity: friction.

- Screen: first-load page and full accessibility snapshot (`app-parity-02-entry`).
- What the steward saw: before any world is open, the page exposes world-file controls, Operating Card, Canon Workbench, New record, Draft space, Prompt-out, Admission, Stage-12, Constraint Composition, Stage 13, Propagation, QA, and Creation. Many controls are disabled or empty.
- What the methodology requires: `docs/specs/workflow-map-and-navigation.md` says a new world with no `world_kernel` foregrounds Creation start/resume as the primary active guided path, while unrelated flows show prerequisites or not-yet-ready states.
- The gap: setup, read-side workbench, generic substrate, and every guided flow compete on the same page before the app can even load its catalog. This confirms the user's "onslaught of forms" report and makes the auth failure harder to understand.
- Fix direction: split no-world setup from world workflow. Until a world is open, show only token/connection state, world create/open, and a short explanation of what becomes available next. After a valid empty world opens, foreground Creation and collapse unrelated flows behind prerequisite states.
- Touches: `docs/specs/workflow-map-and-navigation.md`, `docs/specs/creation-flow.md`, `docs/principles/guided-workflow-usability.md`, research report R1/R7/R8/R13.

### D-01 - Auth-gated catalog data fails as blank form controls. Severity: friction.

- Screen: generic record/link/prompt controls with invalid token (`app-parity-02-entry`, `app-parity-02-typed-invalid-token`).
- What the steward saw: record type, truth layer, canon status, link type, promotion target, vocabulary, term, and prompt template controls appeared blank while `/api/catalog` returned 401. The app logged console errors but mostly represented the state as empty dropdowns and disabled buttons.
- What the methodology requires: `docs/specs/schema-v1.md` says catalog-backed record types exist as seeded substrate, while also warning that schema completeness is not workflow completeness; `docs/specs/workflow-map-and-navigation.md` says the browser renders server-returned blockers and prerequisites.
- The gap: the app presents unavailable catalog-backed controls as if the world has no options, instead of saying "catalog could not load because the token is invalid." This is a faithful-recreation problem because the steward sees empty vocabularies where the method actually has defined truth layers, canon statuses, and record types.
- Fix direction: add explicit catalog-load states and auth blockers for every catalog-backed control, preferably hidden behind the setup card until health/catalog pass.
- Touches: `docs/specs/schema-v1.md`, `docs/specs/workflow-map-and-navigation.md`, `docs/principles/guided-workflow-usability.md`.

### Q-01 - Developer-token policy needs a product decision. Severity: cosmetic.

- Screen: entry token input.
- What the steward saw: the local server printed a token in the terminal, and the browser accepted arbitrary token text, stored it in localStorage, and retried requests on each typed character. The app itself did not say whether this token is a developer-only guard, a real app credential, or a setup secret.
- What the methodology requires: no worldbuilding-method chapter requires token auth. This is product/runtime setup, not canon governance.
- The gap: if the app remains local-first/single-steward, the token may still be acceptable as a developer safeguard, but the UI needs a declared stance. If the intended user is a non-developer steward, terminal-only token discovery is incompatible with replacing the markdown-only methodology.
- Fix direction: decide whether local dev token entry is a developer-only mode or a user-facing security boundary. Then encode that in the UI: copyable token help for dev mode, or a real first-run pairing/unlock flow for user mode.
- PRD #158 update: the decision is no user-facing v1 token or pairing flow; localhost exposure stays loopback-scoped.
- Touches: `AGENTS.md` runtime expectations, `docs/specs/workflow-map-and-navigation.md`.

## PRD seed

- Problem (steward's view): "I opened `http://127.0.0.1:5174/`, saw `aaaaaa` in the token field, got 401s for `/api/catalog`, tried `/tmp/worldloom.sqllite`, and nothing useful happened. The rest of the page was a wall of empty forms."
- Scope (one PRD): build a setup/open-world entry surface that validates token, health, catalog, and world-file create/open before exposing workflow forms. It should show inline 401/path errors, stale-token recovery, catalog-load state, successful open/create confirmation, and the next guided step after a valid empty world opens.
- Out of scope / deferred to later runs: Creation decision-point fixes from Trial 01 / PRD #150; Admission/frontloaded seed audit quality; later methodology stages; changing the entire auth model beyond the minimum product decision in Q-01.
- Extends / duplicates: extends Trial 01 Q-01 and confirms the same UI-reachability root cause called out by issue #109, but does not duplicate issues #109-#113. Live check on 2026-07-05: #109, #110, #112, and #113 are closed; #111 remains the separate 08/09 guided-flow backlog.

## Frontier

- Walked to: app setup only. The app served on `http://127.0.0.1:5174/`, but blank/invalid token states blocked `/api/catalog` and `/api/worlds/create`. `/tmp/worldloom-parity-setup-blocker.sqlite` was not created.
- Next run resumes at: after setup/open-world fixes, first verify that a docs-naive steward can clear/enter a valid token, create or open a world file, and see a single next guided step. Then reopen `/tmp/worldloom-parity-mourningweather.sqlite` from Trial 01 if it still exists and continue the Creation frontier there.
- Trial-world state: Mourningweather was not opened in this run. No new trial world was seeded. The browser profile used for evidence ended with `localStorage.worldloom-token = "aaaaaa"` to reproduce the reported stale-token state.
