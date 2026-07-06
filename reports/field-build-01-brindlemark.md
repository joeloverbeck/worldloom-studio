# Field Build 01 — Brindlemark

**Date:** 2026-07-06  ·  **App commit:** `89ffac8`  ·  **Method version:** worldbuilding-system 1.1
**Essence (user seed):** medieval-ish low magic; animal peoples are ordinary persons; dangerous ancient artifacts and inferior modern artifacts; serious disputes often route through a dangerous political sport instead of war.
**World:** Brindlemark — a low-magic civic patchwork in the Greyspan Marches where mixed human/animal communities live under relic danger and Rungfall, a dangerous dispute sport.  **World file:** `/tmp/worldloom-field-build/brindlemark.worldloom.sqlite`.
**Path walked:** setup/open → workflow map → Creation kernel → seed-decomposition attempt.  **Prior runs:** none for this seed; checked prior app parity/field reports.

## Findings

### V-01 — Setup and world creation carried by the app. Severity: validation.
- Where: Setup/open world.
- What happened: entry screen showed server/catalog status, world-file path, Create/Open controls; after create, header changed to `World open` and workflow map rendered. Evidence: `field-build-01-entry.png`, `field-build-02-world-open.png`.
- What the methodology requires: one visible local world file before method work.
- The validation: docs were not needed for setup/open in this run.
- Touches: `workflow-map-and-navigation.md`, `data-principles.md` P-6/T-1.

### R-01 — Workflow map foregrounds Creation but still marks later destinations available. Severity: friction.
- Where: Workflow map.
- What happened: Start Creation was active, but Admission, Propagation, conditional passes, Stage 13, QA, Workbench, export, and Substrate all appeared as `available` destinations. Evidence: `field-build-02-world-open.png`.
- What the methodology requires: active/owed/blocked/not-yet-earned work should be foregrounded without dashboard sprawl.
- The snag: a docs-closed steward still sees later flows as generally open before prerequisites are earned.
- Fix direction: keep direct access possible, but distinguish active route from available tools and unavailable guided passes.
- Touches: `workflow-map-and-navigation.md`, W-8/W-10; extends Trial 03 O-01.

### V-02 — World-premise proposal refusal is correct. Severity: validation.
- Where: Creation / kernel:World premise.
- What happened: preview said proposal is refused for the world's essence because `20` reserves the premise to the steward.
- What the methodology requires: proposal mode is unavailable for the kernel premise/essence.
- The validation: the app encoded this boundary correctly.
- Touches: `20_ai_assisted_workflow.md`, W-1.

### V-03 — World-premise pressure packet passed the cold-LLM test. Severity: validation.
- Where: Creation / Prompt-out preview.
- What happened: packet included `KER-1`, doctrine, source manifest, omissions, forbidden moves, and advisory warning. A cold subagent produced grounded, useful pressure about scale, sport authority, relic mysteries, ordinary-life friction, champion power, and why war is worse. Evidence: `world-premise-pressure-dom.json`, `field-build-05-world-premise-pressure-preview.png`.
- What the methodology requires: a pressure packet should let a context-free model challenge steward-authored material without extra context.
- The validation: this specific pressure packet worked.
- Touches: `prompt-out-context-assembly.md`, W-1.

### R-02 — Kernel section prompts are missing at point of authoring. Severity: friction.
- Where: Creation / Kernel authoring.
- What happened: the form showed section names and required/allowed-empty state, but not the selected section's template prompt.
- What the methodology requires: `templates/world_kernel.md` operationalizes `05` section by section.
- The snag: docs supplied the section-local questions the app did not keep adjacent to the field.
- Fix direction: show the selected heading's prompt and obligation beside the textarea.
- Touches: `creation-flow.md`, `templates/world_kernel.md`, W-8.

### P-01 — Kernel proposal packet does not identify the selected section. Severity: friction. Mode: proposal.
- Where: Creation / Kernel prompt-out.
- What happened: with `Genre, tone, and consequence-mode commitments` selected, the packet still said `creation:kernel_prompt`, `kernel_pressure`, and generic kernel decision. The cold LLM returned broad kernel candidates, not section-targeted material.
- What the methodology requires: proposal mode at the judgment at hand.
- The snag: the selected kernel section and section-local template prompt are omitted from packet context.
- Fix direction: include selected heading, template prompt, required state, local task, and correct proposal template identity.
- Touches: `prompt-out-context-assembly.md`, `creation-flow.md`, W-1/W-8.

### R-03 — Consequence-mode explicitness is inconsistent. Severity: friction.
- Where: Creation / prerequisites and persisted world data.
- What happened: the UI says decomposition waits for explicit consequence mode; the prose kernel section names a mode; `record_facets` is empty; decomposition later fails as if mode was unset.
- What the methodology requires: explicit consequence mode before seed decomposition; spec says the authoritative value is a facet.
- The snag: the steward has no visible way to satisfy the app's own blocker.
- Fix direction: expose a true consequence-mode selector/facet or visibly derive the facet from a saved mode section.
- Touches: `creation-flow.md`, `05_creation_protocol.md`, W-7/W-8.

### P-02 — Kernel pressure mode is advertised but not reachable. Severity: friction. Mode: pressure.
- Where: Creation / Prompt-out preview.
- What happened: preview said pressure mode was available, but the only visible action loaded proposal mode and exposed no mode selector.
- What the methodology requires: both proposal and pressure modes at dependency-bearing authored material.
- The snag: the full-kernel pressure beat could not be exercised from the in-flow UI.
- Fix direction: add explicit proposal/pressure controls and loaded-mode confirmation.
- Touches: `prompt-out-context-assembly.md`, `creation-flow.md`, W-1.

### F-01 — Seed decomposition is blocked by missing consequence-mode control. Severity: blocking.
- Where: Creation / Seed decomposition.
- What happened: `POST /api/flows/creation/decompose` returned 400 with `seed decomposition requires explicit consequence mode`. Evidence: `decompose-400-1-response.network-response`.
- What the methodology requires: explicit mode before decomposition.
- The snag: no UI control sets the required mode, so the new-world path stops at first seed parking.
- Fix direction: add the missing control/facet and inline readiness state.
- Touches: `creation-flow.md`, `05_creation_protocol.md`, issue-family successor to PRD #150/#165/#202.

### F-02 — Seed decomposition sends empty truth layer with no visible truth-layer control. Severity: blocking.
- Where: Creation / Seed decomposition.
- What happened: request body included `"truthLayer":""`; the Creation seed form had no truth-layer selector. Evidence: `decompose-400-1-request.network-request`.
- What the methodology requires: each seed fact has a truth layer before parking/admission.
- The snag: the app owes a required field but does not surface it.
- Fix direction: expose truth-layer control inside Creation seed decomposition or block before POST with a precise message.
- Touches: `creation-flow.md`, `frontloaded_seed_audit.md`, W-7/W-8/T-2.

### F-03 — Decomposition 400 has no visible inline recovery. Severity: friction.
- Where: Creation / Seed decomposition.
- What happened: console showed 400 and uncaught promise; the screen stayed filled/focused with no error text.
- What the methodology requires: blockers should be visible at the action they block.
- The snag: the steward cannot recover from the server-returned blocker without network tools.
- Fix direction: render server blocker text near `Decompose and Park Seed` and preserve entered material.
- Touches: browser-visible guidance, W-7/W-8.

### P-03 — Seed decomposition prompt-out remains kernel-bound. Severity: friction. Mode: proposal.
- Where: Creation / Prompt-out preview while seed decomposition is active.
- What happened: preview/source manifest still showed `kernel_pressure` and generic kernel decision, not a decomposition proposal over seed material or kernel seed list.
- What the methodology requires: each decision point gets its own proposal/pressure packet or explicit blocker.
- The snag: a cold model would be asked for generic kernel help, not seed decomposition help.
- Fix direction: switch preview to decomposition prompt-out when the decomposition sub-decision is active, or show a decomposition-specific blocker.
- Touches: `prompt-out-context-assembly.md`, `creation-flow.md`, W-1/W-8.

## Decision-Point Log

### Setup/Open World
- Docs-first draft: create a fresh local world file for Brindlemark at `/tmp/worldloom-field-build/brindlemark.worldloom.sqlite`.
- Cold LLM (proposal): not applicable.
- Cold LLM (pressure): not applicable.
- Committed: world file created through setup UI.
- Obsolescence verdict: docs-obsolete for setup/open → V-01; workflow-map hierarchy still needs work → R-01.

### Kernel / World Premise
- Docs-first draft: Brindlemark is a medieval-ish, low-magic patchwork where humans and many animal peoples share markets, courts, kinship obligations, and grudges under the shadow of volatile relics from a vanished makers' age. Because open war is ruinous and relic authority is contested, many towns and regions settle serious disputes through a dangerous ritual sport whose champions can become political powers in their own right.
- Cold LLM (proposal): refused by app, correctly.
- Cold LLM (pressure): useful pressure on starting scale, sport authority, protected relic mysteries, ordinary-life friction, champion political power, and war's constraint.
- Committed: `KER-1` World premise.
- Obsolescence verdict: docs-obsolete for essence refusal and pressure packet → V-02/V-03; docs still supplied section-local template guidance → R-02.

### Kernel / Remaining Sections
- Docs-first draft: completed core promise, starting scale, genre/consequence mode, foundational facts, constraints, mysteries, pressures, and ordinary-life anchor Tamma Underwake.
- Cold LLM (proposal): broad kernel candidates; useful, but not selected-section-targeted because the packet omitted the active section → P-01.
- Cold LLM (pressure): unavailable from in-flow UI despite advertised availability → P-02.
- Committed: all nine `KER-1` sections persisted in SQLite.
- Obsolescence verdict: docs still needed for section prompts and consequence-mode/facet interpretation → R-02/R-03/P-01/P-02.

### Seed Decomposition / First Seed Attempt
- Docs-first draft: `Mixed peoples share civic institutions` as a proposed objective-canon seed for later Admission.
- Cold LLM (proposal): not meaningfully available; preview stayed kernel-bound → P-03.
- Cold LLM (pressure): not reached.
- Committed: nothing; POST failed with 400, no seed record created.
- Obsolescence verdict: blocked in app → F-01/F-02/F-03.

## For The App

Likeliest PRD seed: repair Creation's kernel-to-decomposition handoff.

Scope:
- Add explicit consequence-mode control/facet and visible satisfied/blocked state.
- Add seed truth-layer control in Creation decomposition.
- Render decomposition server errors inline.
- Bind prompt-out preview/mode controls to the active sub-decision and selected kernel section.

This confirms and extends the Trial 03 replacement-guidance/prompt-context line: prompt packets are structurally much stronger now, but the active decision binding and required-field surface still break doc-obsolescence.

## For The Methodology

No methodology-source finding in this run. The package was actionable; the blocker was app encoding.

## Frontier

- Walked to: kernel complete; first seed-decomposition attempt blocked.
- Next run resumes at: `/tmp/worldloom-field-build/brindlemark.worldloom.sqlite`, Creation flow 1, `KER-1` complete, before parking the first seed.
- World state: one `world_kernel` record with all nine sections; no seed decomposition report, no proposed seed facts, no admitted facts, no propagation or specialized passes.
