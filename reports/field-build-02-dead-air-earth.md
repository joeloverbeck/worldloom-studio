# Field Build 02 - Dead Air Earth

**Date:** 2026-07-07  |  **App commit:** `ed372a5`  |  **Method version:** worldbuilding-system 1.1
**Essence (user seed):** Earth in the future; the planet is dying; isolated communities with broadcast access watch scavenger crews explore and assault unsafe locations; viewers enjoy the spectacle, including death.
**World:** Dead Air Earth - a near-future dying Earth where safe communities depend on televised scavenger raids for salvage, supply legitimacy, and public spectacle.  **World file:** `/tmp/worldloom-field-build/dead-air-earth.worldloom.sqlite`.
**Path walked:** prior Brindlemark regression -> setup/open -> workflow map -> Creation kernel -> Creation prompt-out -> seed decomposition -> Admission queue.  **Prior field run:** `reports/field-build-01-brindlemark.md`.
**Evidence screenshots:** `/tmp/worldloom-field-build/screenshots/field-build-02-*.png`.

## Findings

### V-REG-01 - Brindlemark Creation blockers are fixed on the happy path. Severity: validation.
- Where: Regression replay of Field Build 01.
- What happened: Creation now exposes consequence mode, seed truth layer, granularity controls, inline recovery, and a decomposition handoff. After saving consequence mode, `POST /api/flows/creation/decompose` returned 201 and created `SEE-1` plus `FAC-1`.
- Prior findings covered: Field Build 01 F-01, F-02, and F-03.
- Evidence: `field-build-02-05-regression-no-mode-inline.png`, `field-build-02-07-regression-mode-saved.png`, `field-build-02-08-regression-seed-parked.png`.
- Residual snag: see R-REG-01 and R-REG-02.

### R-REG-01 - Consequence-mode selection looks applied before it is saved. Severity: friction.
- Where: Creation / Kernel authoring and Seed decomposition.
- What happened: selecting `mixed` in the Consequence mode dropdown left Seed decomposition blocked until `Save kernel step` was clicked. The readiness text still told the steward to select consequence mode, not to save/apply it.
- Why it matters: a visible selected value reads like an explicit judgment, but the server correctly rejects decomposition until the saved facet exists.
- Fix direction: either persist the mode on selection, disable decomposition with "Save kernel step first", or make readiness distinguish unsaved draft mode from saved mode.

### R-REG-02 - Existing kernel sections do not reliably hydrate when selected. Severity: friction.
- Where: Creation / Kernel authoring.
- What happened: selecting Brindlemark's existing `Genre, tone, and consequence-mode commitments` section showed a blank textarea even though the saved section existed in prompt context. In Dead Air, switching from saved World premise to empty Core promise retained the World premise text while the placeholder changed.
- Why it matters: the steward can accidentally overwrite saved content or save one section's material under another heading.
- Evidence: `field-build-02-06-regression-selected-mode-still-blocked.png`; Dead Air observed before `field-build-02-14-dead-air-kernel-saved.png`.
- Fix direction: selected section changes should load saved section text or empty state deterministically, and dirty unsaved text should be guarded before switching sections.

### V-01 - Setup, workflow map, and Creation-first route are app-carried. Severity: validation.
- Where: setup/open and workflow map.
- What happened: creating `/tmp/worldloom-field-build/dead-air-earth.worldloom.sqlite` worked from the setup screen. The workflow map marked Creation active and later guided flows as not yet earned with unlock reasons.
- Evidence: `field-build-02-09-dead-air-world-open.png`.
- Obsolescence verdict: docs were not needed for setup/open or initial route selection.

### F-01 - Same-session world switch can show stale Creation state from another world. Severity: blocking.
- Where: after opening Brindlemark Creation, then creating/opening Dead Air in the same browser session.
- What happened: the header and API pointed at `/tmp/worldloom-field-build/dead-air-earth.worldloom.sqlite`, but the visible Creation surface still showed Brindlemark's flow, `SEE-1`, `FAC-1`, and prompt packet.
- API truth: create/open and records responses for Dead Air returned an empty new world; the stale material was browser state.
- Evidence: `field-build-02-10-dead-air-creation-empty.png`.
- Why it matters: the app's own setup principle says one visible SQLite world file is canonical. This violates that by pairing a new world path with old-world decision material.
- Fix direction: world switches must reset destination-local flow state and selected records before rendering, or force a safe reload.

### R-01 - Clean Creation required a second Start/Resume click before saving authored premise. Severity: friction.
- Where: Dead Air Creation / World premise.
- What happened: after reload/open recovery, the steward could type a world premise, but `Save kernel step` stayed disabled until `Start or Resume Creation` was clicked again. The text survived and then saved.
- Evidence: `field-build-02-12-dead-air-save-disabled.png`, `field-build-02-13-dead-air-premise-saved.png`.
- Fix direction: either disable the textarea until a flow exists or create/resume the flow before enabling authoring fields.

### V-02 - World-premise prompt-out pressure works cold. Severity: validation.
- Where: Creation / World premise.
- What happened: proposal mode was refused for the premise, as expected. Pressure mode produced a packet with selected section material, `KER-1`, source manifest, omissions, advisory warning, and forbidden moves. A cold subagent stayed in-bounds and challenged the missing survival mechanism behind the broadcasts.
- Evidence: `field-build-02-13-dead-air-premise-saved.png`.
- Obsolescence verdict: docs were not needed to make the pressure packet useful for this decision.

### V-03 - Creation now carries full kernel and first seed parking. Severity: validation.
- Where: Creation / kernel authoring and Seed decomposition.
- What happened: all nine kernel sections were saved through app controls; consequence mode was stored as `mixed`; `FAC-1 Broadcast ratings allocate survival support` was parked with `Objective canon` and `proposed` status; Creation displayed the Admission handoff and read-side trail.
- Evidence: `field-build-02-14-dead-air-kernel-saved.png`, `field-build-02-15-dead-air-seed-parked.png`.
- Obsolescence verdict: Creation's kernel-to-first-seed path is now mostly app-carried after the state issues above are avoided.

### F-02 - Admission UI exposes the queue but not the Admission decision. Severity: blocking.
- Where: Admission destination after `FAC-1` is queued.
- What happened: the visible screen showed only "Admission flow", the rule that Admission changes canon standing, and `FAC-1` in the queue. It did not show severity declaration, work-scale declaration, seed audit controls, prompt-out controls, accept/reject/defer actions, method-card details, read-side trail, or a way to start/resume the Admission record.
- API truth: `/api/admission/records/3/decision-point` has the missing contract: `admission.queue-severity`, required obligations, blockers, seed audit, prompt-out modes, write intent, close preview, and read-side trail.
- Evidence: `field-build-02-16-admission-queue-no-controls.png`.
- Why it matters: the workflow map correctly says Admission is active, but a docs-closed steward cannot perform the active Admission decision from the UI.
- Fix direction: render the server-owned Admission decision-point payload and controls for the selected queue record.

### P-01 - Admission prompt preview assumes minor ledger before severity is declared. Severity: blocking. Mode: pressure/proposal.
- Where: `/api/admission/records/3/decision-point`.
- What happened: the payload correctly says `admissionLevel: null`, `workScale: null`, and gate depth is unavailable until severity is declared. But its prompt-out preview uses `Method card: admission.minor-ledger` and doctrine for completing a minor admission ledger before the steward has declared severity.
- Why it matters: a cold LLM would be grounded in the wrong Admission sub-decision. Severity classification must precede minor-vs-full gate framing.
- Fix direction: before severity declaration, prompt-out should target `admission.queue-severity` and pressure/propose severity prerequisites, not minor-ledger completion.

### P-02 - Loaded prompt-out status can outlive the active decision. Severity: friction.
- Where: Creation after loading Ordinary-life proposal prompt-out, then parking a seed.
- What happened: after decomposition, the active prompt preview moved to the seed decomposition decision, but the page footer still said `Loaded Creation Prompt-out step Proposal mode (Proposal mode)` from the prior Ordinary-life prompt.
- Why it matters: loaded-mode status can imply the copied/loaded prompt matches the current decision when it may belong to the previous one.
- Fix direction: clear loaded prompt status when the active decision changes, or show the exact decision/record that the loaded prompt belongs to.

## Decision-Point Log

### Regression: Brindlemark First Seed
- Docs-first intent: replay the prior broken kernel-to-first-seed path.
- App result: inline 400 recovery works; saved consequence mode plus truth layer allows seed parking.
- Cold LLM: not repeated for Brindlemark; this was a blocker regression pass.
- Verdict: Field Build 01 Creation blockers are fixed on the happy path, with remaining state/framing friction.

### Setup/Open World
- Docs-first draft: create a fresh local world file for Dead Air Earth at `/tmp/worldloom-field-build/dead-air-earth.worldloom.sqlite`.
- Cold LLM: not applicable.
- Committed: world file created through setup UI.
- Obsolescence verdict: docs-obsolete for setup/open and initial route; stale world-switch state blocks trust in same-session switching.

### Kernel / World Premise
- Docs-first draft: a near-future dying Earth where isolated safe communities consume live broadcasts of scavenger raids, and those broadcasts turn survival risk and death into civic spectacle.
- Cold LLM (proposal): refused by app, correctly.
- Cold LLM (pressure): useful and in-bounds; it pushed the broadcast-survival causal mechanism.
- Committed: `KER-1` World premise.
- Obsolescence verdict: prompt packet works; save-state and section-hydration controls need hardening.

### Kernel / Remaining Sections
- Docs-first draft: completed core promise, starting scale, mixed consequence mode, foundational facts/constraints, protected mysteries, primary pressures, and ordinary-life anchor Mara Venn.
- Cold LLM: Ordinary-life proposal mode was available and loaded; full cold run for every remaining kernel section was not completed because the report-worthy path moved to Admission.
- Committed: all nine `KER-1` sections persisted in SQLite.
- Obsolescence verdict: app can carry the kernel, but stale textarea state is risky.

### Seed Decomposition / First Seed
- Docs-first draft: `Broadcast ratings allocate survival support`.
- Cold LLM: the decomposition prompt preview was bound to `SEE-1`/`FAC-1` after parking; no cold run was needed to decide the steward-authored seed.
- Committed: `SEE-1 Seed decomposition`; `FAC-1 Broadcast ratings allocate survival support`, `Objective canon`, `proposed`.
- Obsolescence verdict: first seed parking and Creation-to-Admission handoff are app-carried.

### Admission / First Proposed Fact
- Docs-first intent: classify `FAC-1` by admission level and work scale, then run the appropriate Admission path.
- Cold LLM: not run from UI because the Admission page exposes no prompt-out controls; API prompt preview was inspected and found misbound to minor ledger before severity.
- Committed: nothing; `FAC-1` remains proposed.
- Obsolescence verdict: blocked in UI; API has most of the needed decision contract but it is not rendered, and its prompt default is premature.

## For The App

Likeliest PRD seed: render and repair Admission queue-selection.

Scope:
- Render `/api/admission/records/:id/decision-point` in the Admission destination.
- Add visible selection/start/resume for queued proposed facts.
- Add `admission_level` and `work_scale` controls before any gate path is chosen.
- Expose seed audit decline/run controls and governed skip behavior.
- Bind Admission prompt-out to queue-severity until severity is declared.
- Show read-side trail and safe-exit/resume state.

Separate hardening seed:
- Clear destination-local state on world switch and fix kernel section hydration/dirty-state guards.

## For The Methodology

No methodology-source finding in this run. The method was actionable; the blockers were app encoding and UI projection of server-owned contracts.

## Frontier

- Walked to: Admission active with one proposed fact in queue.
- Next run resumes at: `/tmp/worldloom-field-build/dead-air-earth.worldloom.sqlite`, Admission queue for `FAC-1 Broadcast ratings allocate survival support`.
- World state: `KER-1` complete with all nine sections; `SEE-1` decomposition report; `FAC-1` proposed Objective canon; no admitted facts; no propagation, conditional passes, MVW checkpoint, or QA work earned yet.
