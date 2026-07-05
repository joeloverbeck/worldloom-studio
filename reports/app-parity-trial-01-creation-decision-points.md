# App Parity Field Trial 01 — Creation decision points

**Date:** 2026-07-05  ·  **App commit:** 3913565  ·  **Method version:** worldbuilding-system 1.0
**Trial world:** Mourningweather — public grief precipitates literal weather; unmourned losses become floods, droughts, or corrosive fog. Machinery: affective-climatic / ecological-emotional, distinct from Saltmarrow and Carillon.
**Stretch walked:** Creation flow start, kernel authoring, creation prompt-out, and first seed-decomposition gate (`05` phases 1-2).  **Prior runs:** none.

## Durability note

This report is the durable repo artifact for the Creation parity field-trial findings that shaped PRD #150 and issues #151-#157. Any earlier temporary or local transcript of the same field trial is intake evidence only and must not be cited as stable implementation authority unless it is separately tracked.

## Findings

### O-01 — Entry surface hides the new-world path. Severity: friction.
- Screen: entry/open-world screens (`app-parity-01-entry`, `app-parity-01-world-open`).
- What the steward saw: before any world exists, the app exposes world-file controls, Operating Card, Canon Workbench, New record, Draft space, Prompt-out, Admission, Stage-12, Constraint Composition, Stage 13, Propagation, QA, and Creation far below.
- What the methodology requires: `operating_card.md` says the new-world path starts with a lean world kernel, then seed decomposition; `workflow-map-and-navigation.md` requires a visible start/resume path and current decision point.
- The gap: the first visible work surface looks like a generic record/control room, not a guided creation start. A docs-naive steward has to infer that Creation, not New record, is the intended first path.
- Fix direction: make “new world / no kernel yet” route to a creation start/resume decision surface; collapse unrelated flows until a world exists or until their prerequisites are met.
- Touches: `docs/specs/workflow-map-and-navigation.md`, `docs/specs/creation-flow.md`, `guided-workflow-usability.md` W-8; confirms the UI-reachability root cause from issue #109 at a different flow boundary.

### G-01 — Kernel authoring is controls, not a decision point. Severity: friction.
- Screen: Creation flow after Start or Resume (`app-parity-01-creation-flow-started`, `app-parity-01-creation-fields`).
- What the steward saw: `Flow 1`, a `Kernel step` dropdown, a `Consequence mode` dropdown, two doctrine sentences, one blank `Kernel section` textarea, and `Save Kernel Step`.
- What the methodology requires: `05_creation_protocol.md` Phase 1 defines the world kernel contents and purpose; `templates/world_kernel.md` gives section-specific prompts; `creation-flow.md` says the browser shows the kernel decision, cites `05` and the template, marks required sections versus allowed empty sections, requires explicit consequence-mode selection, previews the prompt packet, and states that the write is a living `world_kernel` record rather than admitted canon facts.
- The gap: the app names the section but does not explain the local decision, required/optional obligations, write intent, blockers, prompt-out support, next/resume behavior, or read-side trail at the point of use.
- Fix direction: turn kernel authoring into a true W-8 decision surface: section prompt, required/optional state, consequence-mode obligation, what will be written, current blockers, prompt preview, and next step.
- Touches: `docs/worldbuilding-system/05_creation_protocol.md` Phase 1, `docs/worldbuilding-system/templates/world_kernel.md`, `docs/specs/creation-flow.md`, `guided-workflow-usability.md` W-8; aligns with research report R1/R2.

### P-01 — Creation prompt-out is detached and can generate without the current kernel. Severity: friction.
- Screen: Prompt-out panel (`app-parity-01-prompt-out-panel`).
- What the steward saw: the panel is far above Creation, asks for raw `Record id`, says to load a server-owned step, but `Generate Prompt` is enabled before any selected record context is loaded.
- What the methodology requires: `creation-flow.md` requires prompt-out at dependency-bearing creation steps; `prompt-out-context-assembly.md` requires current decision, steward material, source records, relevant doctrine excerpts, role request, advisory warning, and source manifest.
- The gap: clicking Generate Prompt without a record loaded produced a `kernel_pressure` prompt whose source manifest said `Selected record: none` and omitted the Mourningweather kernel text. Manually entering record id `1` and regenerating included `KER-1`, but the UI did not tell the steward that this was required and the prompt still lacked `05` Phase 1 / `world_kernel` template obligations as doctrine excerpts.
- Fix direction: move prompt-out into the Creation decision point, pre-bind it to the current flow/kernel step, disable generation until required context is present, and include the governing `05`/template doctrine in the source manifest.
- Touches: `docs/specs/prompt-out-context-assembly.md`, `docs/specs/creation-flow.md`, `canon-sovereignty.md` W-1, `guided-workflow-usability.md` W-8; extends issue #113 rather than duplicating it.

### G-02 — Seed decomposition is blocked by hidden generic fields. Severity: blocking.
- Screen: Creation flow with seed title/body filled (`app-parity-01-decompose-disabled`).
- What the steward saw: after `KER-1` exists, entering `Seed title` and `Seed body` leaves `Decompose and Park Seed` disabled with no explanation in the Creation panel.
- What the methodology requires: `05_creation_protocol.md` Phase 2 says split broad seed facts until each can be independently rejected; `creation-flow.md` says decomposition parks seed records at `proposed` with steward-supplied truth layer and canon status, then points to Admission.
- The gap: the disabled button depends on `Truth layer` and `Canon status` fields in the remote generic New record form, not on visible Creation controls. From the Creation screen alone, the blind steward cannot know what is missing or how to proceed.
- Fix direction: put seed classification controls and blocker text inside Creation decomposition, default or explain `proposed` status where faithful, and show the resulting parked seed/write/link intent before enabling the action.
- Touches: `docs/worldbuilding-system/05_creation_protocol.md` Phase 2, `docs/specs/creation-flow.md`, `workflow-principles.md` W-3/W-7, `guided-workflow-usability.md` W-8.

### V-01 — Creation flow persists a kernel record. Severity: validation.
- Screen: Creation flow after saving World premise.
- What the steward saw: saving the premise created `KER-1 · World kernel`, with `world_kernel · Objective canon · proposed`, and the flow state changed to `Flow 1 · kernel 1`.
- What the methodology requires: `creation-flow.md` says kernel authoring creates one living `world_kernel` record and preserves explicit consequence-mode selection.
- The validation: the app can create the flow instance and persist a sectioned kernel record; the parity problem is the browser guidance around that capability, not absence of the underlying write.
- Fix direction: preserve this persistence behavior while making it visible as the outcome of the decision point.
- Touches: `docs/specs/creation-flow.md`, `data-principles.md` W-5/W-6.

### Q-01 — Server-token onboarding is setup friction outside this PRD. Severity: cosmetic.
- Screen: entry header token input.
- What the steward saw: a `server token` field with no visible explanation. During the trial, an invalid doubled token produced `Missing or invalid Worldloom token` until corrected.
- What the methodology requires: no worldbuilding-method requirement; this is operational app access, not canon workflow.
- The gap: a docs-naive steward still needs a visible way to understand where the token comes from and why actions fail.
- Fix direction: defer to a small app-onboarding/auth affordance unless this is intentionally developer-only.
- Touches: out of scope for the Creation PRD; not covered by issues #109-#113.

## PRD seed

- Problem (steward's view): “I opened a new world and found a control room. I can start Creation, but the app gives me a textarea and disabled buttons instead of telling me what decision I am making, what is required, how prompt-out helps, and why seed decomposition is blocked.”
- Scope (one PRD): retrofit the Creation browser flow into a W-8 decision-point surface for kernel authoring, prompt-out, and seed decomposition. Include local blocker messages, in-flow truth-layer/status controls or faithful defaults, pre-bound prompt-out context, write/link/read-side previews, and a clear creation-first start/resume route for new worlds.
- Out of scope / deferred to later runs: token onboarding; Creation phases 4-8 checklist decision from issue #112; Admission quality after seeds are successfully parked; broader entry-screen redesign beyond making the creation path legible.
- Extends / duplicates: confirms issue #109's “server done but UI not reachable/usable” root cause in Creation; extends issue #113 because a creation prompt template exists but context binding is still not parity; does not duplicate issue #112, which concerns later `05` phases 4-8.

## Frontier

- Walked to: Creation `Flow 1`, `KER-1` created with the World premise section and consequence mode `weird`; seed-decomposition attempt stopped at the disabled `Decompose and Park Seed` button.
- Next run resumes at: after Creation decision-point fixes, reopen `/tmp/worldloom-parity-mourningweather.sqlite`, verify the Creation flow explains and enables decomposition, park the first seed, then proceed to Admission/frontloaded seed audit.
- Trial-world state: `/tmp/worldloom-parity-mourningweather.sqlite` exists. `KER-1` contains the premise “Mourningweather is a low delta world where public grief precipitates literal weather…” No seed was parked and no advisory response was stored.
