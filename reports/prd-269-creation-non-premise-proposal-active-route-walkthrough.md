# PRD #269 Creation Non-Premise Proposal Active-Route Walkthrough

Date: 2026-07-08

## Scope

This report covers PRD #269 / issues #283-#285: the active routed Creation path after a saved World premise, selected empty non-premise kernel heading, Proposal load, selected-heading packet display, blocker checks, stale-state checks, and safe no-save/no-flow-advance verification.

This closes the Field Build 04 active-route caveat for Creation non-premise Proposal only. It does not promote global Prompt-out field validation, sibling PRD #270 Propagation work, direct LLM integration, Creation phase 3, Creation phases 9-10, Admission, or downstream flows.

## Automated Coverage

- Red command: `pnpm --filter @worldloom/web exec vitest run src/creation-decision-surface.test.tsx --reporter=dot`
  - Intended failure: `allows unsaved non-premise Proposal targeting...` expected the active Creation Prompt-out origin/loader to use `creationPromptCurrentDecision`; the browser was still wired to the server-saved preview decision label.
- Green command: `pnpm --filter @worldloom/web exec vitest run src/creation-decision-surface.test.tsx --reporter=dot`
  - Result: 5 tests passed.
- Server focused command: `pnpm --filter @worldloom/server exec vitest run test/creation-flow.test.ts test/prompt-out.test.ts --reporter=dot`
  - Result: 13 tests passed.
- Web currentness command: `pnpm --filter @worldloom/web exec vitest run src/prompt-out-lifecycle.test.tsx --reporter=dot`
  - Result: 7 tests passed.

The focused suites preserve:

- explicit `selectedSectionHeading` Proposal generation when the persisted Creation step is still World premise;
- World premise Proposal refusal by selected/requested heading;
- empty non-premise Pressure blocking by authored-material rule;
- omitted-heading compatibility for the older saved-step path;
- one current packet body only when packet identity matches active world, flow, record, section, step, mode, template, and packet hash;
- stale packet bodies structurally excluded from the canonical current selector.

## Browser Route

- App: `http://127.0.0.1:5173/`
- API: `http://127.0.0.1:4173`
- World: `/tmp/worldloom-prd269-active-route.sqlite`
- Surface: Workflow map -> Creation -> kernel authoring -> selected `Core promise` section -> Proposal-mode Prompt-out
- Screenshot: `output/playwright/prd269-creation-non-premise-proposal-active-route.png`

## Real Browser Replay

1. Created `/tmp/worldloom-prd269-active-route.sqlite` through setup controls.
2. Entered Creation through the workflow map's active `Start Creation` decision.
3. Started/resumed Creation, selected `World premise`, saved only `World premise` text, and saved consequence mode `weird`.
4. Selected unsaved `Core promise`, left the section body empty, selected Proposal mode, and observed `Load Creation Prompt-out Step` enabled.
5. Loaded the Creation Prompt-out step.
6. Switched to Pressure mode for empty `Core promise`.
7. Switched back to Proposal mode and selected `World premise`.
8. Captured screenshot evidence and read back records, sections, and the Creation flow through browser-executed localhost fetches.

Compact DOM proof:

```json
{
  "coreProposalCurrent": {
    "selectedModeStatus": "Selected mode: Proposal mode - available for selected Core promise via explicit target heading.",
    "currentBodies": 1,
    "staleBodies": 0,
    "canonicalBodies": 1,
    "loadDisabled": false,
    "loadedStatusMentionsCore": true,
    "packetMentionsCore": true,
    "packetMentionsEmpty": true,
    "bodyStatusMentionsCurrent": true,
    "sourceManifest": true,
    "advisoryWarning": true
  },
  "corePressureBlocked": {
    "currentBodies": 0,
    "staleBodies": 1,
    "canonicalBodies": 0,
    "loadDisabled": true,
    "loadedStatusMentionsCore": true,
    "bodyStatusMentionsNoCopy": true,
    "previewMentionsPressureBlocker": true
  },
  "worldPremiseRefused": {
    "selectedModeStatus": "Selected mode: Proposal mode - Proposal prompts are refused for the world's essence; the AI-assisted workflow reserves the World premise to the steward.",
    "currentBodies": 0,
    "staleBodies": 1,
    "canonicalBodies": 0,
    "loadDisabled": true,
    "loadedStatusMentionsCore": true,
    "bodyStatusMentionsNoCopy": true,
    "previewMentionsEssenceRefusal": true
  }
}
```

Console check: Playwright console `error` level returned 0 errors and 0 warnings.

## Persistence And Non-Mutation

Browser-executed readback after Proposal load, Pressure switch, and World premise switch:

```json
{
  "records": [
    { "id": 1, "shortId": "KER-1", "type": "world_kernel", "title": "World kernel", "canonStatus": "proposed" }
  ],
  "sections": [
    {
      "recordId": 1,
      "heading": "World premise",
      "body": "Harbor law is enforced by bells that wake the dead.",
      "position": 1
    }
  ],
  "flow": {
    "id": 1,
    "flow_key": "creation",
    "state": "in_progress",
    "current_step": "kernel:World premise",
    "kernel_record_id": 1
  }
}
```

There is no saved `Core promise` section row. Loading Proposal did not auto-save an empty section, did not advance the persisted Creation step to `kernel:Core promise`, did not mutate kernel prose, did not create an advisory artifact, did not create a canon record, and did not assign canon standing.

## Cold External LLM Evidence

Blocked: no external cold LLM execution tool is available in this local session. This report does not claim the cold-packet checklist passed.

Packet inspection still shows the selected-heading Proposal packet is self-contained for a cold model: it names `Core promise`, selected-section obligation, empty-state context, source manifest, omissions, advisory/canon warning, forbidden moves, output labels, and candidate-material task framing.

## Naive-Steward Walkthrough

Docs closed, a steward can tell:

- the active decision is Creation kernel authoring for selected `Core promise`;
- Proposal is available because the status says it is available for selected `Core promise` via explicit target heading;
- the generated/current packet is current because the status says `Current prompt packet body` and the origin names section `Core promise`;
- the packet is advisory because the preview and body warn that pasted responses remain advisory artifacts and cannot mutate kernel sections, seed records, reports, proposals, or canon standing without explicit steward use;
- Pressure is blocked for empty `Core promise` because the preview names the authored-material blocker;
- World premise Proposal is refused by the essence rule when `World premise` is selected;
- stale packet evidence is not current because stale bodies lose the canonical current selector, name the prior `Core promise` origin, and say the body cannot be copied, exported, or stored as the active decision's current packet.

## Issue Evidence

- #283: browser route and server tests show selected empty `Core promise` Proposal loads after saved World premise, carries selected heading through request/generation/identity/body/source/omissions, exposes one current packet body, and leaves kernel/canon/advisory state untouched.
- #284: server tests preserve World premise refusal and empty-section Pressure blocking by selected/requested target; browser replay shows Pressure and World premise transitions stale the prior packet, disable active loading, and render blocker/refusal text for the active selection.
- #285: this report, screenshot, focused tests, browser replay, persistence/readback proof, cognitive walkthrough, blocked cold-LLM note, and `docs/methodology-coverage.md` update provide the closeout evidence.

## PRD User Story Mapping

- US1-US4: selected empty `Core promise` Proposal loads from the active route before save and does not mutate kernel/flow/canon state.
- US5-US7, US13-US14: World premise Proposal refusal and empty non-premise Pressure blocking remain server-owned by selected/requested target.
- US8-US11, US16: mode/heading switches stale the prior packet, preserve origin details, and exclude stale bodies from copy/store/export currentness.
- US12, US20-US21: focused server and web tests preserve explicit target-heading Proposal behavior and active browser coverage.
- US17-US19, US22: the browser replay, persistence proof, and narrow coverage-ledger update close PRD #269's active-route caveat.

## Coverage Decision

`docs/methodology-coverage.md` now records PRD #269 as closed for the routed Creation active route where a saved World premise is followed by selected empty non-premise Proposal, blocker/stale cleanup, and no-empty-save verification. It preserves caveats for sibling PRD #270, global Prompt-out field validation, direct LLM integration, Creation phase 3, Creation phases 9-10, Admission, and downstream flows.
