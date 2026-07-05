# App Parity Field Trial 03 - Replacement guidance and prompt context

**Date:** 2026-07-05  |  **App commit:** 24444dc  |  **Method version:** worldbuilding-system 1.0
**Trial world:** Mourningweather - public grief precipitates literal weather; unmourned losses become floods, droughts, or corrosive fog. Machinery: affective-climatic / ecological-emotional, distinct from Saltmarrow and Carillon.
**Stretch walked:** Setup/open verification, Mourningweather resume, Creation phase 2 seed decomposition, Creation-to-Admission handoff, and Creation prompt-out after decomposition.  **Prior runs:** `reports/app-parity-trial-01-creation-decision-points.md`, `reports/app-parity-trial-02-setup-open-world.md`.

## Evidence

Browser automation used the Playwright CLI wrapper at `/home/joeloverbeck/.codex/skills/playwright/scripts/playwright_cli.sh`.

This tracked report is the durable Trial 03 source summarized for PRD #165.
Any temporary transcript, screenshot set, or scratch artifact behind the trial is
supporting evidence only and must not be cited as stable implementation
authority unless it is committed here or reconstructed in a durable issue
comment.

Scratch artifacts are under `/tmp/worldloom-parity-trial/`:

- `app-parity-03-entry.png` - first-load setup screen.
- `app-parity-03-creation-resumed.png` - Creation resumed with `Flow 1 · kernel 1`.
- `app-parity-03-seed-ready.png` - seed-decomposition form filled before parking.
- `app-parity-03-seed-parked.png` - parked seed and decomposition report visible.

DOM and network evidence came from Playwright snapshots and request inspection:

- Entry DOM: server/catalog status, world-file path, Create/Open controls, and recent worlds only.
- Open-world network: `POST /api/worlds/open => 200`.
- Seed parking network: `POST /api/flows/creation/decompose => 201`, creating `SEE-1` and `FAC-1`.
- Prompt network: `POST /api/prompt-out/steps/actions/generate?flowKey=creation&flowId=1&templateKey=decomposition_pressure&recordId=1&stepKey=decomposition_pressure => 200`.
- Console: 0 errors, 0 warnings.

Live issue check on 2026-07-05: #109, #110, #112, and #113 are closed; #111 remains open as the separate guided-flow backlog for constraint composition and temporal/timeline coverage.

## Findings

### V-01 - Setup/open-world entry is now passable. Severity: validation.

- Screen: first-load setup screen (`app-parity-03-entry`).
- What the steward saw: a setup-only page with server status, catalog status, a world-file path field, Create/Open buttons, and recent worlds. DOM excerpt: `Server status: Reachable (0.0.0)`; `Catalog status: 27 record types and 25 link types available`.
- What the methodology requires: before method work can begin, the app must let the steward create or open the local world file; `docs/specs/workflow-map-and-navigation.md` says setup/open work should not compete with workflow panels before a world is open.
- The validation: the app no longer showed the Trial 02 wall of workflow controls before a world was open, and `/tmp/worldloom-parity-mourningweather.sqlite` opened from the UI.
- Fix direction: preserve this setup-only entry behavior.
- Touches: validates the direction of Trial 02 / PRD #158; no new issue scope.

### O-01 - Post-open workspace still becomes an everything panel. Severity: friction.

- Screen: opened Mourningweather workspace after `POST /api/worlds/open => 200` (`app-parity-03-creation-resumed`).
- What the steward saw: setup controls, snapshot/export/search/link controls, Canon Workbench, New record, Draft space, Prompt-out, Admission, Stage 12, Constraint Composition, Stage 13, Propagation, QA, and Creation all present in one long page. DOM excerpts included `Setup controls`, `Canon Workbench`, `New record`, `Prompt-out`, `Admission flow`, `Constraint Composition flow`, `Contradiction/Retcon/Mystery flow`, `Propagation flow`, `QA flow`, and `Creation decision point`.
- What the methodology requires: `workflow-map-and-navigation.md` says an open world with no or early kernel work should foreground the active guided path and show unrelated flows as prerequisite or not-yet-ready states. The app should answer where the steward is, why, what blocks them, and what happens next.
- The gap: Creation is now much more legible than in Trial 01, but the opened workspace still asks the blind steward to scan the whole product surface before finding the active method frontier. This is no longer blocking, but it still weakens the replacement promise.
- Fix direction: keep Creation and the immediate handoff foregrounded after a resumed early-world state; collapse unrelated advanced flows into compact prerequisite states unless selected.
- Touches: `docs/specs/workflow-map-and-navigation.md`, `docs/principles/guided-workflow-usability.md` W-8; extends the research report's R7/R8/R13 guidance rather than duplicating #109.

### G-01 - User-facing guidance depends on markdown file paths. Severity: friction.

- Screen: Operating Card, Prompt-out, Admission, and Creation decision surface.
- What the steward saw: the app repeatedly named markdown files as the guidance surface: `Source: docs/worldbuilding-system/operating_card.md`, `Source: docs/worldbuilding-system/20_ai_assisted_workflow.md`, `docs/worldbuilding-system/05_creation_protocol.md#phase-2-seed-decomposition`, and `Queue and gate derive from docs/worldbuilding-system/06_canon_fact_admission_protocol.md...`.
- What the methodology requires: the user should be able to work the method through the app with the markdown files closed. `guided-workflow-usability.md` W-8 requires the decision point to show the relevant doctrine, checklist, template rule, or operating-card excerpt at point of use; it does not license file paths as the steward's working instructions.
- The gap: the current UI treats source paths as visible guidance. That is useful provenance for maintainers, but a docs-naive steward cannot follow or verify those paths, and the product is supposed to replace the markdown files in normal use.
- Fix direction: keep source/provenance available in an audit/detail affordance, but translate package authority into app-owned method cards or inline excerpts that stand alone. File paths should not be the primary instructional text.
- Touches: `docs/principles/guided-workflow-usability.md` W-8, `docs/principles/workflow-principles.md` P-5, `docs/principles/domain-fidelity.md` P-1; likely needs a principle reinforcement that provenance may cite files but user-facing workflow guidance must not depend on file access.

### P-01 - Decomposition prompt-out omits the actual decomposition. Severity: friction.

- Screen: Creation Prompt-out after parking `FAC-1` and `SEE-1`.
- What the steward saw: the in-flow preview switched to `Prerequisite auditor · available`, but generating the prompt sent `recordId=1` and the prompt context contained only `KER-1 World kernel` and the world premise. It omitted the actual split seed, decomposition report, granularity rationale, and Admission intent.
- Network excerpt: request #44 persisted the seed and rationale in `/api/flows/creation/decompose`; request #59 generated `decomposition_pressure` with `recordId=1`. Response excerpt: `Context preview: Record context: KER-1 World kernel ... ## World premise ...`.
- What the methodology requires: `05_creation_protocol.md` Phase 2 says seed decomposition splits broad facts until each can be independently rejected. `canon-sovereignty.md` W-1 says every prompt embeds or explicitly omits the selected record or draft context, relevant dependencies/source links, doctrine, standing rulings, omissions, and the requested analyst role; prompts must be fully self-contained for a cold external LLM.
- The gap: the external LLM is asked to pressure-test "this steward-authored seed decomposition," but it does not receive `FAC-1`, `SEE-1`, the seed body, or the granularity rationale. It can only respond to the kernel premise, so it cannot judge whether the decomposition is too bundled, missing prerequisites, or admission-ready.
- Fix direction: after decomposition, bind `decomposition_pressure` to the seed-decomposition report and parked seeds, not just the kernel record. Include seed titles/bodies, truth layers, granularity rationale, Admission intent, links to kernel/report, and explicit omissions.
- Touches: `docs/specs/prompt-out-context-assembly.md`, `docs/specs/creation-flow.md`, `docs/principles/canon-sovereignty.md` W-1, `docs/principles/guided-workflow-usability.md` W-8; extends closed #113 rather than duplicating it.

### D-01 - Prompt packets cite doctrine instead of carrying replacement-grade doctrine. Severity: friction.

- Screen: generated `decomposition_pressure` prompt.
- What the steward saw: the prompt did include a granularity rule and advisory warning, but it also used source-path labels such as `Default prompt derivation (docs/worldbuilding-system/20_ai_assisted_workflow.md)` and `Creation doctrine: docs/worldbuilding-system/05_creation_protocol.md Phase 2`.
- What the methodology requires: `canon-sovereignty.md` W-1 says prompts must be fully self-contained. The user's app-replacement constraint means the receiving LLM and steward should not need access to `docs/worldbuilding-system/*` files to interpret the request.
- The gap: the generated prompt is partially self-contained, but still leans on markdown-path references as doctrine identity. More importantly, it omitted the key world context for the decomposition decision, so the path references cannot rescue the prompt.
- Fix direction: use source labels as a manifest, but include the actual decision-relevant rule text in the prompt body: granularity rule, thin-start boundary, proposed-status handoff, and relevant omission reasons.
- Touches: `docs/principles/canon-sovereignty.md` W-1, `docs/specs/prompt-out-context-assembly.md`, research report R3/R6.

### V-02 - Creation phase 2 can park a proposed seed and create the handoff trail. Severity: validation.

- Screen: Creation after `Decompose and Park Seed` (`app-parity-03-seed-parked`).
- What the steward saw: `FAC-1 · Public mourning produces local weather`, `canon_fact · Objective canon · proposed`; `SEE-1 · Seed decomposition`; derived-from links from seed to kernel/report; read-side trail entries for kernel, decomposition report, parked seed, and Admission queue.
- Network excerpt: `POST /api/flows/creation/decompose => 201 Created`; response created report `SEE-1`, record `FAC-1`, flow state `complete`, and `current_step: decomposition:complete`.
- What the methodology requires: `05_creation_protocol.md` Phase 2 requires decomposed seeds; `creation-flow.md` says Creation parks seed records at `proposed`, writes one append-only `seed_decomposition` report, links seed/report/kernel, and points to Admission without admitting canon.
- The validation: the app now reaches the Trial 01 frontier and performs the Creation phase 2 write path through the UI.
- Fix direction: preserve this write behavior while improving prompt context and replacement-grade guidance around it.
- Touches: `docs/specs/creation-flow.md`, `docs/principles/data-principles.md` W-5/W-6.

### Q-01 - Principles need a replacement-grade guidance rule. Severity: cosmetic.

- Screen: cross-cutting; visible in Operating Card, flow doctrine, and prompt manifests.
- What the steward saw: path references work as developer provenance, but the app often exposes them as if the user can open the package docs.
- What the methodology requires: the package stays upstream, but the app is supposed to be the steward's method surface. Current W-8 and W-1 imply this, but do not explicitly say "file provenance is not user guidance."
- The gap: implementation can satisfy "source doctrine visible" with markdown-path citations, while violating the product intent that the app replace the markdown files for normal users.
- Fix direction: add or strengthen principle/spec language: user-facing workflow guidance must be self-contained and app-owned; file paths may appear as provenance, audit detail, or maintainer source labels, not as required operating instructions.
- Touches: `docs/principles/guided-workflow-usability.md`, `docs/principles/workflow-principles.md`, `docs/principles/canon-sovereignty.md`, `docs/principles/domain-fidelity.md`; this is a doc-reinforcement seed, not an implementation fix in this report.

## PRD seed

- Problem (steward's view): "I can now open the world and park a decomposed seed, but the app keeps pointing me at markdown files I cannot access, and the prompt for reviewing my decomposition does not include the decomposition I just made."
- Scope (one PRD): make the Creation-to-Admission handoff replacement-grade. Convert visible method references into self-contained app-owned guidance, demote file paths to provenance/detail, and fix Creation decomposition Prompt-out so it binds to the seed-decomposition report and parked seeds with rationale, truth layer, Admission intent, source links, and explicit omissions.
- Out of scope / deferred to later runs: broad redesign of all post-open workspace navigation; full Admission quality/frontloaded seed audit walk; #111's 08/09 guided-flow backlog; later `05` phases 4-8 beyond the already closed #112 decision; changing source-of-truth authority away from `docs/worldbuilding-system/`.
- Extends / duplicates: extends closed #113 because the creation-stage prompt exists but the decomposition packet is still missing decision context; does not duplicate #109 setup/reachability, #110 coverage ledger, #112 later-Creation decision, or #111's separate 08/09 backlog. Confirms research report R1/R3/R6/R7/R8/R13 and suggests a principle reinforcement beyond the current W-8 wording.

## Frontier

- Walked to: Mourningweather opened from the setup-only entry; Creation `Flow 1` resumed; `KER-1` preserved; consequence mode `weird` saved; `FAC-1` proposed seed and `SEE-1` seed-decomposition report created through the UI; generated `decomposition_pressure` prompt inspected.
- Next run resumes at: Admission queue selection for `FAC-1`, including frontloaded seed audit availability and Admission prompt-out context. Before judging Admission, account for this run's replacement-guidance/prompt-context PRD so file-path guidance is not mistaken for app-owned method instruction.
- Trial-world state: `/tmp/worldloom-parity-mourningweather.sqlite` exists. `KER-1` has the Mourningweather premise and `weird` consequence mode. `FAC-1 · Public mourning produces local weather` is `Objective canon · proposed`. `SEE-1 · Seed decomposition` exists, and `FAC-1` is linked `derived_from` both `KER-1` and `SEE-1`.
