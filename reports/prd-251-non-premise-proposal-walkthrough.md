# PRD #251 Creation Non-Premise Proposal Walkthrough

Date: 2026-07-07

## Scope

This report covers PRD #251 / issues #262-#265: explicit Creation kernel target headings for Prompt-out Proposal mode, server-side essence refusal by target heading, the browser path for selected-but-unsaved non-premise sections, and coverage closeout for the walkthrough evidence.

## Browser Route

- App: `http://127.0.0.1:5175/` (Vite selected port 5175 because 5173 and 5174 were occupied)
- API: `http://127.0.0.1:4173`
- World: `/tmp/worldloom-prd251-browser.sqlite`
- Surface: Workflow map -> Creation -> kernel authoring -> selected `Core promise` section -> Proposal-mode Prompt-out
- Screenshot: `output/playwright/prd251-non-premise-proposal-current.png`
- Page snapshots used during the walkthrough:
  - `.playwright-cli/page-2026-07-07T15-19-41-672Z.yml`: selected empty `Core promise` before load; Proposal available, Pressure blocked.
  - `.playwright-cli/page-2026-07-07T15-19-57-177Z.yml`: loaded current `Core promise` Proposal packet.
  - `.playwright-cli/page-2026-07-07T15-20-17-913Z.yml`: empty-section Pressure remains blocked and prior Proposal packet is stale.
  - `.playwright-cli/page-2026-07-07T15-20-37-231Z.yml`: selected `World premise` Proposal is refused and the prior `Core promise` packet stays stale.
  - `.playwright-cli/page-2026-07-07T15-24-00-531Z.yml`: final rerun state reselects empty `Core promise` with current Proposal identity.

## Real Browser Smoke

1. Opened the app in a fresh Playwright browser session and created/opened `/tmp/worldloom-prd251-browser.sqlite`.
2. Entered the routed Creation destination, saved only `World premise` with `Harbor law is enforced by bells that wake the dead.`, and saved consequence mode `weird`.
3. Selected `Core promise` without entering or saving section text. The browser showed `No saved text exists yet for Core promise`, `Save target: Core promise`, `Proposal mode: Available from server`, and `Pressure Prompt-out waits for the selected section to be saved with steward-authored material before it can use Core promise.`
4. Loaded `Load Creation Prompt-out Step` in Proposal mode. The current origin, loaded status, inline preview, and packet body all named `Core promise`, mode `proposal`, template `kernel_pressure`, decision `Core promise`, and packet hash `23c33bd5673feedfb1d2cd427289f251dbcef47802dfa0254063c2c3f34b8c1c`.
5. The loaded packet carried `Selected section heading: Core promise`, `Selected section prompt: What experience should the world reliably create?`, `Selected section material: (empty)`, explicit empty-state context, the source manifest, omissions, advisory/canon warning, forbidden moves, and a candidate-material request for alternatives and assumptions.
6. Switched to Pressure mode for the empty `Core promise`. The browser disabled loading, named the authored-material blocker, and rendered the prior `Core promise` Proposal packet as stale rather than current/copyable.
7. Switched to `World premise` in Proposal mode. The browser showed the essence refusal, disabled loading, and kept the prior `Core promise` Proposal packet stale.
8. Fresh-browser console check returned 0 errors and 0 warnings at error level.

## Persistence And Non-Mutation Check

SQLite inspection of `/tmp/worldloom-prd251-browser.sqlite` after the final browser state showed:

- `records`: one `world_kernel` record, `KER-1`, `canon_status` `proposed`.
- `record_sections`: one section row only, heading `World premise`, body `Harbor law is enforced by bells that wake the dead.`, length 51.
- `flow_instances`: one Creation flow, `state` `in_progress`, `current_step` `kernel:World premise`, `kernel_record_id` `1`.
- `record_facets`: one `consequence_mode` facet, term `weird`.

There is no saved `Core promise` section row. Loading Proposal mode did not auto-save an empty section, did not advance the persisted Creation step to `kernel:Core promise`, did not mutate kernel prose, did not create a canon-facing record, and did not assign canon standing.

## Cold Packet Check

No external cold LLM tool is available in this environment. Per #265, this is recorded as blocked evidence and this report does not claim that the cold-test checklist passed.

Structural packet inspection still shows the copied/generated packet is self-contained for the selected section: it includes selected heading, section obligation, empty-state context, kernel context, source manifest, omissions, advisory/canon warning, forbidden moves, output labels, and a candidate-material request without hidden repository context.

## Naive-Steward Walkthrough

A docs-closed steward can identify:

- The current decision: Creation kernel authoring, selected section `Core promise`.
- Why Proposal is available: `Selected mode: Proposal mode - available for selected Core promise via explicit target heading.`
- Why Pressure is blocked: the browser says Pressure waits for saved steward-authored `Core promise` material.
- Why World premise refuses Proposal: the Proposal-mode status names the essence refusal when `World premise` is selected.
- Why generated text is advisory: the packet preview and current packet body repeat that pasted responses remain advisory artifacts and do not mutate kernel sections, seed records, reports, proposals, truth layer, canon standing, or consequence mode without explicit steward use.

## Issue Evidence

- #262: `docs/specs/creation-flow.md` clarifies that Proposal is available for empty non-premise selected sections, Pressure still requires authored material, World premise refusal is keyed to selected/requested target heading, and selected target heading is request/decision context rather than stored flow state.
- #263: server Prompt-out lifecycle and generation accept `selectedSectionHeading`; Creation decision payloads carry the selected target heading; generation returns empty non-premise section proposals, refuses `World premise` by target heading, preserves Pressure gating, and includes target heading in packet identity.
- #264: browser Creation Prompt-out uses the selected heading for local Proposal requests, enables Proposal load for unsaved non-premise sections, keeps World premise refused, keeps empty-section Pressure blocked, and renders stale prior packet bodies when the selected section/mode no longer matches.
- #265: this report, the screenshot, the browser snapshots, the SQLite non-mutation check, the focused tests, and the coverage ledger update provide the walkthrough and closeout evidence.

## PRD User Story Mapping

- US1-US3: Core promise was selected before saved prose existed, Proposal loaded, and no empty section save was required.
- US4-US5, US10-US11: World premise Proposal remained refused by selected target heading, with the server generate path owning the refusal.
- US6, US18: Pressure remained blocked for empty Core promise.
- US7, US13, US17: current/stale loaded origin and packet-body status tracked the selected heading, mode, template, decision, and packet identity.
- US8: the empty Core promise packet carried heading, section obligation, empty-state context, source manifest, omissions, advisory/canon warning, and forbidden moves.
- US9, US12: the Prompt-out request carries an explicit selected target heading and the browser relaxes the unsaved-section guard for Proposal only.
- US14: the Creation flow spec now records the proposal-availability clarification.
- US15-US16: server tests cover target-heading generation, essence refusal by target, empty non-premise proposal, Pressure gating, and omitted-heading compatibility.
- US19: the browser walkthrough and naive-steward check demonstrate usability without source docs beside the app.

## Verification Matrix

| Evidence | Coverage |
|---|---|
| `pnpm --filter @worldloom/server exec vitest run test/creation-flow.test.ts` | #263 Creation decision payload and Prompt-out mode availability |
| `pnpm --filter @worldloom/server exec vitest run test/prompt-out.test.ts test/prompt-out-lifecycle.test.ts` | #263 packet generation, target-heading identity, and lifecycle compatibility |
| `pnpm --filter @worldloom/web exec vitest run src/creation-decision-surface.test.tsx src/prompt-out-lifecycle.test.tsx` | #264 browser selected-section Proposal path and packet-body current/stale guard |
| `pnpm --filter @worldloom/server typecheck` | server target-heading contract |
| `pnpm --filter @worldloom/web typecheck` | browser request and identity contract |
| Playwright CLI walkthrough on `http://127.0.0.1:5175/` | #265 browser proof, cognitive walkthrough, World premise refusal, Pressure blocker, stale state |
| SQLite inspection of `/tmp/worldloom-prd251-browser.sqlite` | no auto-save, no flow advancement, no canon-standing side effect |
| `pnpm test`, `pnpm typecheck`, `pnpm build` | root gates passed locally for closeout |

## Coverage Ledger Impact

`docs/methodology-coverage.md` records PRD #251 as a narrow Creation/Prompt-out refinement: non-premise Creation Proposal is reachable before save through explicit target-heading context. It does not promote global Prompt-out maturity, direct LLM integration, unrelated Creation phases, Admission, or downstream flows.
