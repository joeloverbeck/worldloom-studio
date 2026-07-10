# Field Build 14 - Jon Urena Chrononaut

**Date:** 2026-07-10 | **App commit:** 4487ce5 | **Method version:** worldbuilding-system 1.1

**Essence (user seed):** Jon Urena is a biologically anomalous, immortal, invulnerable time traveler whose private obsessions keep colliding with history.

**World:** Jon Urena Chrononaut - a modern-Earth world where one anomalous person's non-deployable temporal access stresses history, evidence, institutions, and ordinary life. **World file:** `/tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite`.

**Path walked:** setup/open existing world -> Workflow map Admission handoff -> Admission queue -> `FAC-3` queue/severity Prompt-out proposal and pressure probes -> `FAC-3` severity declaration -> full-gate frontier.

**Prior runs:** `reports/field-build-13-jon-urena-chrononaut.md` and earlier Jon Urena runs 10-12.

**Evidence:** screenshots at `/tmp/worldloom-field-build/screenshots/field-build-14-*.png`; prompt packets and cold outputs at `/tmp/worldloom-field-build/cold-llm/field-build-14-*.md`; API readbacks at `/tmp/worldloom-field-build/cold-llm/field-build-14-*.json`.

**Prior-art frame:** Checked prior field-build/parity reports and GitHub surfaces #109-#113, #201/#202/#204/#205-#210, #321, and #339. This run mostly extends the prompt-currentness family from Field Build 11 and validates the Field Build 13 Admission handoff. The only P/R/F cluster is an Admission prompt preview polish extension of prior current-packet clarity work, not a new blocker.

## Findings

### V-01 - Existing Jon world reopens at the Admission frontier

- Where: Setup and Workflow map after opening `/tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite`.
- What happened: The visible world-path textbox was filled with the Field Build 13 world path and read back exactly before `Open world`. The app opened the Workflow map with Creation `done`, Admission `active`, next decision `Work Admission queue`, Admission queue count `2`, and canon debt count `6`.
- What the methodology requires: Continuation runs must resume the same world state and not restart Creation.
- The snag: None. This is validation evidence.
- Fix direction: N/A - validation.
- Touches: Local-first world open, Workflow map resume state.
- Repro: Open the app, enter `/tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite`, click `Open world`, and inspect Workflow map.
- Design verdict: N/A - validation.
- Recommendation: Keep explicit path readback and visible Workflow map state.
- Evidence: `/tmp/worldloom-field-build/screenshots/field-build-14-01-entry-setup.png`, `/tmp/worldloom-field-build/screenshots/field-build-14-02-workflow-map-resume.png`, `/tmp/worldloom-field-build/cold-llm/field-build-14-workflow-map-resume.json`, `/tmp/worldloom-field-build/cold-llm/field-build-14-admission-queue-resume.json`.

### V-02 - Admission queue selection carries the governance boundary

- Where: Admission queue and selected `FAC-3` decision contract.
- What happened: The Admission surface listed `FAC-3` and `FAC-2` as proposed facts, showed no default severity, displayed source/origin links, warned about six open canon-debt items, and after selecting `FAC-3` loaded the server contract for `record:6:queue-selection`.
- What the methodology requires: Admission is the only flow that changes canon standing, severity is steward-declared, and truth layer/status/tags must remain separate.
- The snag: None for the core decision contract. The presentation polish issue is tracked separately as `R-01`.
- Fix direction: N/A - validation.
- Touches: `docs/specs/admission-flow.md`, `docs/worldbuilding-system/06_canon_fact_admission_protocol.md`, W-1/W-3/W-8.
- Repro: From the Workflow map, click `Go to decision`, then select `FAC-3`.
- Design verdict: N/A - validation.
- Recommendation: Preserve the explicit no-default severity behavior and source-chain display.
- Evidence: `/tmp/worldloom-field-build/screenshots/field-build-14-03-admission-entry.png`, `/tmp/worldloom-field-build/screenshots/field-build-14-04-fac3-selected.png`, `/tmp/worldloom-field-build/cold-llm/field-build-14-fac3-decision-point.json`.

### V-03 - FAC-3 queue/severity prompt packets are self-contained in both modes

- Where: Admission Prompt-out for `FAC-3`, step `admission:queue-severity`.
- What happened: Proposal loaded with body hash `950009f50f2c98239fa67c9fb3ab1a5e9d096e60d39954cfc2d9643f2fcc5849`; Pressure loaded with body hash `ebee4b54315fd4141242b9611fcb7875e849405b51fb5b750f70a0482359ff99`. Cold subagents given only the saved packets returned useful severity framing and pressure without assigning canon standing.
- What the methodology requires: Prompt-out must provide exact, self-contained advisory packets in proposal and pressure modes while preserving steward authority.
- The snag: None for generated packet content. Diagnostic capture was used after rendered stdout extraction hung; tuple/body hashes matched the active loaded packets.
- Fix direction: N/A - validation.
- Touches: Prompt-out context assembly, Admission prompt templates, W-1.
- Repro: Select `FAC-3`, load Proposal and Pressure Prompt-out, compare loaded status hashes with saved packets, and cold-probe the packets without context.
- Design verdict: N/A - validation.
- Recommendation: Keep the queue/severity template's clear forbidden-move framing and source manifest.
- Evidence: `/tmp/worldloom-field-build/screenshots/field-build-14-05-fac3-proposal-loaded.png`, `/tmp/worldloom-field-build/screenshots/field-build-14-06-fac3-pressure-loaded.png`, `/tmp/worldloom-field-build/cold-llm/field-build-14-fac3-severity-proposal-prompt.md`, `/tmp/worldloom-field-build/cold-llm/field-build-14-fac3-severity-proposal.md`, `/tmp/worldloom-field-build/cold-llm/field-build-14-fac3-severity-pressure-prompt.md`, `/tmp/worldloom-field-build/cold-llm/field-build-14-fac3-severity-pressure.md`.

### V-04 - FAC-3 severity declaration persists without admitting canon

- Where: Admission queue/severity declaration for `FAC-3`.
- What happened: I declared admission level `4` and work scale `severe`. API readback showed `FAC-3` still `proposed`, now with `admissionLevel=4` and `workScale=severe`; `FAC-2` remained proposed with severity unset. The active decision moved to `record:6:severity-declared` / `Complete the full canon fact gate with written substance`.
- What the methodology requires: Severity declaration selects gate depth; it must not itself admit canon or infer final status.
- The snag: None. This is the expected boundary.
- Fix direction: N/A - validation.
- Touches: Admission severity declaration, full-gate routing, W-2/W-3/W-7.
- Repro: Select `FAC-3`, set Admission level `4`, Work scale `severe`, click `Declare Severity`, and read `/api/admission/queue` plus `/api/admission/records/6/decision-point`.
- Design verdict: N/A - validation.
- Recommendation: Resume at the full gate before touching `FAC-2`.
- Evidence: `/tmp/worldloom-field-build/screenshots/field-build-14-07-fac3-severity-declared.png`, `/tmp/worldloom-field-build/cold-llm/field-build-14-admission-queue-after-fac3-severity.json`, `/tmp/worldloom-field-build/cold-llm/field-build-14-fac3-decision-point-after-severity.json`.

### V-05 - Stale prior packet is clearly marked after severity changes the decision

- Where: Admission Prompt-out status after severity declaration.
- What happened: After `FAC-3` severity changed the active decision to full-gate completion, the previously loaded queue/severity pressure packet was relabeled `Stale prior decision origin`, and the body header changed to `Stale prompt packet body`; the UI says it cannot be copied, exported, or stored as the active decision's current packet.
- What the methodology requires: Current packet identity must be unambiguous; stale packet bodies must not masquerade as the active decision.
- The snag: None in the post-transition stale-state handling.
- Fix direction: N/A - validation.
- Touches: Prompt-out currentness, Field Build 11 stale-preview family.
- Repro: Load a `FAC-3` queue/severity packet, then declare severity and inspect the loaded status area.
- Design verdict: N/A - validation.
- Recommendation: Apply this explicit stale labeling consistently to pre-load previews; see `R-01`.
- Evidence: `/tmp/worldloom-field-build/screenshots/field-build-14-07-fac3-severity-declared.png`.

### R-01 - Selected Admission record shows a pressure packet preview before explicit mode load

- Where: Admission selected-record Prompt-out preview before clicking `Load Admission Prompt-out Step`.
- What happened: After selecting `FAC-3`, the main prompt preview rendered pressure-mode packet text while the control still showed `Prompt mode: Proposal mode` and `Loaded mode: none yet`. Loading Proposal corrected the active current packet and status, but the pre-load state can mislead a steward trying to copy the exact packet.
- What the methodology requires: A prompt-out surface should make current packet identity unambiguous before copying or cold-probing.
- The snag: The pre-load preview looks like a usable packet body but does not match the selected mode/load state.
- Design verdict: local polish - the underlying active packet generation and loaded-status identity work; the confusing state is before explicit load.
- Recommendation: Suppress packet body text until the selected mode is loaded, or label the pre-load body as preview-only/non-current and remove copy/export affordance from it.
- Repro: Open Admission, select `FAC-3`, observe the preview before clicking `Load Admission Prompt-out Step`.
- Fix direction: Admission Prompt-out UI state/presentation.
- Touches: `docs/specs/admission-flow.md`, `docs/specs/prompt-out-context-assembly.md`, W-1/W-8.
- Evidence: `/tmp/worldloom-field-build/screenshots/field-build-14-04-fac3-selected.png`.

### F-01 - Search endpoint 500s on a short-id-style punctuation query

- Where: Diagnostic read-side search API, `/api/search?q=FAC-`.
- What happened: A diagnostic search for `FAC-` returned `Internal Server Error`; the dev-server log printed `SqliteError: fts5: syntax error near ""` from `WorldFile.search`.
- What the methodology requires: Read/browse canon surfaces should be safe diagnostic/read-side routes and should not crash on ordinary short-id-style lookup text.
- The snag: A steward or agent looking for `FAC-*` records can trip a server error instead of a safe empty/result response or validation message.
- Design verdict: N/A - API/read-side robustness, not a screen-structure issue in this run.
- Recommendation: Escape or validate FTS query punctuation in `/api/search`, and return a stable 4xx validation response or literal-token search behavior for short-id prefixes.
- Repro: With the Jon world open, request `GET /api/search?q=FAC-`.
- Fix direction: `packages/server/src/world-file.ts` search query handling and substrate search route validation.
- Touches: Canon Workbench/read-side search, read-side diagnostic reliability, W-5.
- Evidence: `/tmp/worldloom-field-build/cold-llm/field-build-14-search-fac-records.json`; dev-server closeout log printed the FTS5 stack trace on shutdown.

## Regression of prior findings

**Replay gate:** Field Build 13 app commit `8fa2e54` -> current commit `4487ce5`. HEAD advanced, but no `apps/` or `packages/` source changed in the commit range or working tree; Field Build 13 had no open findings.

| Prior finding | Status in Field Build 14 | Evidence |
|---|---|---|
| Field Build 13 open findings | None. | Field Build 13 Frontier. |
| Field Build 11 `P-01` - stale secondary Prompt-out preview after correction/mode switch | Not re-verifiable this run. Creation correction/mode-switch was not re-entered. The Admission stale-state handling after severity was good, but it is not the same repro. | Carried as not-reached, not fixed. |
| Field Build 11 `F-02` - repeatable duplicate narrowing-note correction contexts | Not re-verifiable this run. The duplicate `CCP-2`/`CCP-3` provenance remains visible on `FAC-3`, but no current duplicate mutation was attempted. | Carried as not-reached, not fixed. |

## Decision-point log (evidence)

### Setup and reopen

- Stage / decision point: Setup/open existing world.
- Docs-first draft: Reopen the same SQLite file from Field Build 13 and verify Admission handoff state before authoring.
- Prompt-out coverage: proposal=N/A; pressure=N/A.
- Cold LLM (proposal): N/A.
- Cold LLM (pressure): N/A.
- Committed: No world mutation.
- UX/style verdict: ok.
- Obsolescence verdict: docs-obsolete (V-01) - app carried path ownership and Workflow map handoff.

### Admission queue / FAC-3 selection

- Stage / decision point: Admission queue selection.
- Docs-first draft: Work `FAC-3` first because it is first in queue and owns the non-deployable access boundary; note `CCP-2`/`CCP-3` duplicate provenance as prior evidence, not a fresh mutation.
- Prompt-out coverage: proposal=deferred to selected-record severity decision; pressure=deferred to selected-record severity decision.
- Cold LLM (proposal): N/A.
- Cold LLM (pressure): N/A.
- Committed: Selected `FAC-3`; no mutation.
- UX/style verdict: local R - see `R-01`.
- Obsolescence verdict: docs mostly obsolete for queue selection (V-02), but docs still needed to judge the severity burden.

### FAC-3 queue/severity

- Stage / decision point: Admission queue/severity classification for `FAC-3`.
- Docs-first draft: `FAC-3` should be foundational/severe: it prevents ordinary governments, companies, and labs from industrializing temporal access and protects the mechanism boundary. Keep "neurological anomaly" scoped as association, not a full medical explanation.
- Prompt-out coverage: proposal=`active=exercised; diagnostic=exercised via /api/prompt-out/steps/actions/generate; prompt=/tmp/worldloom-field-build/cold-llm/field-build-14-fac3-severity-proposal-prompt.md; output=/tmp/worldloom-field-build/cold-llm/field-build-14-fac3-severity-proposal.md; subagent=019f4a2c-1416-79d2-a00f-cee434876f8e`; pressure=`active=exercised; diagnostic=exercised via /api/prompt-out/steps/actions/generate; prompt=/tmp/worldloom-field-build/cold-llm/field-build-14-fac3-severity-pressure-prompt.md; output=/tmp/worldloom-field-build/cold-llm/field-build-14-fac3-severity-pressure.md; subagent=019f4a2d-e037-7541-94ac-12021a2ba0cc`.
- Cold LLM (proposal): Suggested anti-industrialization as the strongest severity frame, with biological exception and inaccessible mechanism as supporting candidate axes.
- Cold LLM (pressure): Challenged that `FAC-3` bundles cause category, anti-deployment constraint, and mystery boundary; asked whether neurological anomaly is objective explanation or in-world association.
- Committed: `admissionLevel=4`; `workScale=severe`; canon status remains `proposed`.
- UX/style verdict: local R before load; current packet/status after load were clear.
- Obsolescence verdict: docs still needed for severity judgment; app carried packet context and mutation boundary.

### Full-gate frontier

- Stage / decision point: Admission full gate for `FAC-3`.
- Docs-first draft: Stop before authoring the full gate. The next run must complete the 17-section full gate with written substance.
- Prompt-out coverage: proposal=deferred because frontier moved; pressure=deferred because frontier moved. The post-severity preview said the full-gate draft was missing, so no current full-gate packet was cold-probed.
- Cold LLM (proposal): N/A.
- Cold LLM (pressure): N/A.
- Committed: No full-gate fields authored; no canon status change.
- UX/style verdict: ok for the loaded full-gate contract; stale prior packet labeling validated by V-05.
- Obsolescence verdict: app carried the next decision and blockers, but docs will still be needed to author the full-gate substance unless the next run proves otherwise.

## For the app (PRD seeds)

### App Seed 1 - Admission pre-load prompt preview currentness polish

- Disposition: extending relative to Field Build 11 `P-01` and prompt-out current-packet clarity work; not a duplicate blocker because active load/status are correct.
- Likely spec/component: Admission Prompt-out preview / `docs/specs/prompt-out-context-assembly.md` UI binding.
- UX scope: local polish.

Before an explicit `Load Admission Prompt-out Step`, the selected Admission record can show a pressure-mode packet body while the dropdown says Proposal and loaded mode is none. Suppress the packet body until load, or label it preview-only/non-current. Keep the post-severity stale labeling behavior.

### App Seed 2 - Search query punctuation hardening

- Disposition: new relative to the checked prior field-build/prior-art surfaces.
- Likely spec/component: substrate search route / Canon Workbench read-side search.
- UX scope: N/A - not UX.

Short-id-style punctuation queries such as `FAC-` should not 500. Escape or validate the query before FTS, and return a stable response.

## For the methodology

No methodology-source change is proposed. `06_canon_fact_admission_protocol.md` and the canon fact gate checklist were sufficient to classify `FAC-3` as foundational/severe and to stop before full-gate authorship.

## Frontier

- Walked to: Admission queue/severity complete for `FAC-3`; full-gate decision loaded.
- Next run resumes at: `/tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite`, Admission `FAC-3` full gate (`record:6:severity-declared`) before `FAC-2`.
- Carried-open findings: Field Build 11 `P-01` and `F-02` remain not-reverifiable-this-run; new `R-01` is cosmetic/local polish; new `F-01` is read-side search friction.
- World state: `FAC-3` remains proposed with `admissionLevel=4`, `workScale=severe`; `FAC-2` remains proposed with severity unset; `DEB-1` through `DEB-6` remain open; no full-gate result has been written.
- Console check: final browser console check had 3 info messages, 0 errors, and 0 warnings.
