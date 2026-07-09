# Field Build 09: The Bloom

Date: 2026-07-09
Seed: "It's the year 2034, and suddenly, all over the world, some children start developing brighter, more luminous skin. Those same children become more intelligent, and some even develop psychic abilities. They're otherwise fine. People ended up calling this phenomenon the Bloom."

## Scope

This run continued the field-build method from the setup screen through a new world kernel and the first Creation prompt-out packet, while replaying the latest prior report's open/carry issues first.

World file:
- `/tmp/worldloom-field-build/worlds/the-bloom.worldloom.sqlite`

Scratch evidence root:
- `/tmp/worldloom-field-build/`

App state at run:
- Worktree baseline: clean.
- App commit: `819fc3d`.
- App server: `pnpm dev`, web at `http://127.0.0.1:5173`, API at `http://127.0.0.1:4173`.

## Prior-Art Regression Gate

Prior report checked: `reports/field-build-08-submanor-continent.md`.

Carryover items replayed:

- `B-01`: late Admission did not block direct Creation mutation.
- `F-01`: workflow map could mark Admission done/complete too early after kernel-only state.

Result:

- `B-01` is fixed on this run. A regression world was opened, `FAC-3` was moved into Admission with declared severity, Creation then showed `FAC-3` as `late_admission`, and the direct mutation controls were blocked. A direct API mutation attempt for seed record `6` returned `400` with validation error `admission_started`.
- `F-01` is fixed for the kernel-only Bloom state reached here. After all kernel sections were saved and before any proposed seeds existed, the Workflow map showed `Creation active`, `Seed decomposition owed`, `Admission not yet earned`, and admission queue `0`.

Evidence:
- `/tmp/worldloom-field-build/screenshots/field-build-09-04-b01-pre-admission-creation-correctable.png`
- `/tmp/worldloom-field-build/screenshots/field-build-09-05-b01-admission-severity-declared.png`
- `/tmp/worldloom-field-build/screenshots/field-build-09-06-b01-late-admission-creation-blocked.png`
- `/tmp/worldloom-field-build/cold-llm/field-build-09-b01-regression-result.json`
- `/tmp/worldloom-field-build/screenshots/field-build-09-08-map-kernel-no-seed.png`

## Method Walk

Setup carried the method without external docs: the setup screen exposed the current SQLite world path, server/catalog status, and workflow destinations. The Bloom world was created and opened from the visible setup controls.

Evidence:
- `/tmp/worldloom-field-build/screenshots/field-build-09-01-entry-setup.png`
- `/tmp/worldloom-field-build/screenshots/field-build-09-02-workflow-map-open.png`

Creation carried kernel authoring. The app accepted a steward-authored kernel with explicit consequence mode and saved all nine kernel sections. Server readback confirmed one `world_kernel` record, `KER-1`, with `consequence_mode: hard speculative` and all authored sections present.

Evidence:
- `/tmp/worldloom-field-build/screenshots/field-build-09-07-bloom-kernel-complete.png`
- `/tmp/worldloom-field-build/cold-llm/field-build-09-kernel-readback.json`

Authored Bloom kernel:

- World premise: In 2034, some children across the world begin to Bloom: their skin becomes visibly luminous, their cognition accelerates, and a minority develop intermittent psychic abilities while remaining medically healthy, recognizably human, and still children.
- Core promise: The Bloom is a near-future social wonder about care under pressure: families, schools, states, markets, religions, and the children themselves must adapt to gifts that are beautiful, useful, frightening, and too visible to keep private.
- Starting scale: Start at planetary public awareness but work from local surfaces first: households, classrooms, clinics, transit, child-protection offices, media feeds, and national ministries responding to Bloom children in their care.
- Genre, tone, and consequence-mode commitments: Hard speculative social drama with a primary material/institutional consequence mode and secondary wonder/ethical-dread pressure. The world must never become superhero wish fulfillment, eugenic triumphalism, or a puzzle where the children exist only to solve adult problems.
- Foundational facts: The Bloom begins in 2034 among children worldwide. Bloomed children have brighter, luminous skin. The same children show higher intelligence than before. Some, not all, develop psychic abilities. Medical checks find no immediate illness or injury caused by the change. Public language settles on the name "the Bloom."
- Foundational constraints: The Bloom initially affects only children, not adults. No cause, trigger, cure, or reliable induction method is known. Psychic abilities are intermittent, tiring, limited by attention and consent boundaries, and too unreliable to make investigation, education, war, or markets frictionless. Luminosity can be covered but not made socially invisible.
- Initial mysteries and protected effects: Protect the cause of the Bloom, why children are affected, whether the change persists into adulthood, whether psychic abilities imply shared minds, and whether public religious, alien, evolutionary, or conspiracy explanations are true. The mystery must preserve awe without excusing absent consequences.
- Primary pressures and initial domains: Family protection versus state monitoring; school acceleration versus child welfare; privacy and consent around psychic contact; medical classification without pathology; faith and identity claims; labor and military exploitation pressure; anti-Bloom backlash; media spectacle; ordinary-life accommodations for visible luminosity.
- Ordinary-life promise: An ordinary Bloom child still needs breakfast, sleep, privacy, friends, and consent. A teacher adjusts lighting and reading groups; a sibling closes curtains before news drones arrive; a school nurse asks before documenting a psychic incident; parents argue about whether brightness should be hidden on the bus.

Creation prompt-out carried the World premise pressure packet after a save/refresh workaround. The exact packet was captured from the server generate endpoint and sent to a cold subagent with no forked context. The cold response quoted source lines first, stayed in pressure mode, did not assign canon standing, and raised usable risks around distribution, cognition, psychic-ability scope, medical-health wording, and childhood guardrails.

Evidence:
- `/tmp/worldloom-field-build/cold-llm/field-build-09-world-premise-pressure-step.json`
- `/tmp/worldloom-field-build/cold-llm/field-build-09-world-premise-pressure-response.json`
- `/tmp/worldloom-field-build/cold-llm/field-build-09-world-premise-pressure-prompt.md`
- `/tmp/worldloom-field-build/cold-llm/field-build-09-world-premise-pressure.md`

## Findings

### V-01: Setup and workflow-map entry are app-carried

Type: validation

The setup screen gave a visible world path, local SQLite ownership, server/catalog status, recent world access, and workflow navigation. I did not need the docs to understand how to create or reopen the Bloom world.

Evidence:
- `/tmp/worldloom-field-build/screenshots/field-build-09-01-entry-setup.png`
- `/tmp/worldloom-field-build/screenshots/field-build-09-02-workflow-map-open.png`

### V-02: Prior `B-01` late-Admission mutation bug is fixed

Type: validation

After severity was declared for proposed fact `FAC-3`, Creation no longer allowed direct correction through the pre-Admission controls. The API also rejected a direct mutation with `admission_started`.

Evidence:
- `/tmp/worldloom-field-build/cold-llm/field-build-09-b01-regression-result.json`
- `/tmp/worldloom-field-build/screenshots/field-build-09-06-b01-late-admission-creation-blocked.png`

### V-03: Prior `F-01` workflow-map kernel-only state is fixed

Type: validation

After the Bloom kernel was saved but before any proposed seed existed, the map correctly showed seed decomposition owed, Admission not yet earned, and admission queue `0`.

Evidence:
- `/tmp/worldloom-field-build/screenshots/field-build-09-08-map-kernel-no-seed.png`

### V-04: Kernel authoring and server readback carried the methodology

Type: validation

Creation made consequence mode an explicit steward judgment and saved each kernel section into `KER-1`. Server readback showed the saved consequence mode and all nine kernel section values.

Evidence:
- `/tmp/worldloom-field-build/screenshots/field-build-09-07-bloom-kernel-complete.png`
- `/tmp/worldloom-field-build/cold-llm/field-build-09-kernel-readback.json`

### V-05: Cold prompt-out packet is independently usable

Type: validation

The captured World premise pressure packet carried selected-section identity, doctrine, source records, omissions, source manifest, forbidden moves, and an output skeleton. A cold subagent using only that packet produced usable pressure and did not cross into canon assignment or final wording.

Evidence:
- `/tmp/worldloom-field-build/cold-llm/field-build-09-world-premise-pressure-prompt.md`
- `/tmp/worldloom-field-build/cold-llm/field-build-09-world-premise-pressure.md`

### P-01: Kernel prompt-out preview can temporarily stay bound to the previous section after a section switch

Type: prompt-out / active-surface mismatch

What happened:

After all kernel sections were saved with `Ordinary-life promise` as the last selected section, I changed the kernel step back to `World premise` and selected Pressure mode. The selected-section state showed World premise, but the prompt preview remained bound to the previous Ordinary-life packet and the `Load Creation Prompt-out Step` button stayed disabled. Re-saving the World premise section repaired the preview and made the pressure packet loadable.

Why it matters:

The methodology relies on exact, current prompt packets at each decision point. A steward using the app blind can see the selected section and the preview disagree, then has to discover that re-saving an already-saved section refreshes the active packet.

Design verdict:

Structural prompt-out correctness issue, not merely copy. The active packet identity and loadability must follow the selected decision without requiring a no-op save.

Recommendation:

Refresh the prompt-out step, preview, and load-button state immediately when `Kernel step` or prompt mode changes. Add a visible "refresh preview" action only if automatic refresh is impossible, and make stale preview state name the prior section explicitly.

Evidence:
- `/tmp/worldloom-field-build/screenshots/field-build-09-07-bloom-kernel-complete.png`
- `/tmp/worldloom-field-build/cold-llm/field-build-09-world-premise-pressure-step.json`
- `/tmp/worldloom-field-build/cold-llm/field-build-09-world-premise-pressure-response.json`

### R-01: The not-yet-earned Minimal Viable World checkpoint still dominates early Creation

Type: readability / workflow ordering

What happened:

On the Creation screen after kernel completion and before seed decomposition, a full Minimal Viable World checkpoint panel rendered above Kernel authoring and Seed decomposition. It was correctly labeled `not owed`, but its disabled controls and contract text occupied the main path before the owed seed-decomposition work.

Why it matters:

The app now computes the state correctly, but a blind steward still has to read past a large non-current checkpoint surface to continue the active Creation path.

Design verdict:

Local presentation friction. It does not block the method, but it pulls attention away from the currently owed decision.

Recommendation:

Collapse not-yet-earned checkpoint details by default, or move them below the active kernel/seed decomposition surfaces until admitted seed evidence exists.

Evidence:
- `/tmp/worldloom-field-build/screenshots/field-build-09-07-bloom-kernel-complete.png`
- `/tmp/worldloom-field-build/screenshots/field-build-09-08-map-kernel-no-seed.png`

## Frontier

Stable stop point: Bloom world created, kernel saved and read back, World premise pressure prompt captured, and cold prompt-out response saved.

Next method step:
- Return to Creation seed decomposition.
- Park proposed seed facts from the Bloom kernel, likely splitting the initial package into separate proposed facts for global onset, luminosity, cognition change, minority psychic abilities, medical no-immediate-pathology, and public naming.
- Then enter Admission for the first proposed fact and run severity plus full canon-fact gate.

## Console / Browser Check

Browser console check after the workflow-map capture reported:

- Total messages: 3
- Errors: 0
- Warnings: 0

## Evidence Index

- Screenshots: `/tmp/worldloom-field-build/screenshots/field-build-09-*.png`
- Bloom world: `/tmp/worldloom-field-build/worlds/the-bloom.worldloom.sqlite`
- Regression readback: `/tmp/worldloom-field-build/cold-llm/field-build-09-b01-regression-result.json`
- Kernel readback: `/tmp/worldloom-field-build/cold-llm/field-build-09-kernel-readback.json`
- Prompt step: `/tmp/worldloom-field-build/cold-llm/field-build-09-world-premise-pressure-step.json`
- Prompt response: `/tmp/worldloom-field-build/cold-llm/field-build-09-world-premise-pressure-response.json`
- Saved prompt packet: `/tmp/worldloom-field-build/cold-llm/field-build-09-world-premise-pressure-prompt.md`
- Cold response: `/tmp/worldloom-field-build/cold-llm/field-build-09-world-premise-pressure.md`
