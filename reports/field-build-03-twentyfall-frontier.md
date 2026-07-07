# Field Build 03 - Twentyfall Frontier

**Date:** 2026-07-07  |  **App commit:** `39802bd`  |  **Method version:** worldbuilding-system 1.1
**Essence (user seed):** Men long disappeared; every girl dies when she turns twenty; isolated settlements are attacked by deep-voiced humanoid beasts; a teenage boy appears in a frontier village claiming another world.
**World:** Twentyfall Frontier - girl-led settlements survive under a hard twentieth-birthday death rule, lost-men mystery, deep-voiced raids, and the destabilizing arrival of a living teenage boy. **World file:** `/tmp/worldloom-field-build/twentyfall-frontier.worldloom.sqlite`.
**Path walked:** prior Brindlemark/Dead Air regression -> setup/open -> workflow map -> Creation kernel -> Creation prompt-out -> seed decomposition -> Admission queue -> severity declaration -> seed audit -> full canon fact gate frontier. **Prior field run:** `reports/field-build-02-dead-air-earth.md`.
**Evidence screenshots:** `/tmp/worldloom-field-build/screenshots/field-build-03-*.png`.
**Cold LLM artifacts:** `/tmp/worldloom-field-build/cold-llm/field-build-03-*.md`.

## Findings

### V-REG-01 - Same-session world switch state is fixed. Severity: validation.
- Where: Regression replay of Field Build 02 F-01.
- What happened: I opened Brindlemark, entered Creation, then created `/tmp/worldloom-field-build/twentyfall-frontier.worldloom.sqlite` in the same browser session. The header, workflow map, queues, and Creation surface reset to the new world with no Brindlemark record IDs or stale seed/admission state.
- Evidence: `field-build-03-02-regression-brindlemark-open.png`, `field-build-03-03-regression-brindlemark-creation.png`, `field-build-03-04-regression-twentyfall-created.png`, `field-build-03-05-twentyfall-creation-empty.png`.
- Prior finding covered: Field Build 02 F-01.

### V-REG-02 - Admission queue selection and severity decision are now rendered. Severity: validation.
- Where: Regression replay of Field Build 02 F-02.
- What happened: after parking `FAC-1`, Admission exposed queue selection, selected-record context, `admission_level` and `work_scale` controls, severity definitions, blockers, seed audit controls, prompt preview, close preview, read-side trail, and resume state.
- Evidence: `field-build-03-14-admission-open.png`, `field-build-03-15-admission-selected.png`.
- Prior finding covered: Field Build 02 F-02.

### V-REG-03 - Admission prompt-out no longer assumes minor ledger before severity. Severity: validation.
- Where: Admission queue selection for `FAC-1`.
- What happened: the selected record loaded `record:3:queue-selection`; the prompt preview and direct decision-point payload were bound to `admission_queue_severity` / `admission:queue-severity` with unset severity facets and a `severity_required` blocker.
- Evidence: `field-build-03-15-admission-selected.png`, `field-build-03-16-admission-severity-ready.png`.
- Prior finding covered: Field Build 02 P-01.

### V-01 - Setup, workflow map, and Creation-first route are app-carried. Severity: validation.
- Where: setup/open and workflow map.
- What happened: creating the Twentyfall world worked from setup. Creation opened as the earned active route; other routes stayed visible with guided locked/not-yet-earned state.
- Evidence: `field-build-03-01-entry.png`, `field-build-03-04-regression-twentyfall-created.png`, `field-build-03-05-twentyfall-creation-empty.png`.
- Obsolescence verdict: docs were not needed for setup/open or route orientation.

### V-02 - World-premise pressure prompt-out works cold. Severity: validation.
- Where: Creation / World premise.
- What happened: proposal mode was refused for the premise, as expected. Pressure mode produced a self-contained packet with source manifest, omissions, advisory warning, and forbidden moves. A cold subagent stayed in-bounds and challenged overloaded mysteries, the boy's claim status, the ordinary-life burden of the age ceiling, and whether raiders prematurely answer the men mystery.
- Evidence: `field-build-03-07-world-premise-saved.png`, `field-build-03-08-world-premise-pressure-selected.png`, `field-build-03-world-premise-pressure.md`.
- Obsolescence verdict: the packet is useful without opening docs.

### P-01 - Prompt-out mode controls and visible packet body can disagree. Severity: prompt-out blocking.
- Where: Creation prompt-out across World premise, Ordinary-life promise, and Seed decomposition.
- What happened: after saving World premise, the packet body showed pressure-mode material while the dropdown still appeared to be in Proposal mode and the load button was disabled. Later, selecting Pressure mode for Ordinary-life and Seed decomposition left the visible/extracted packet in Proposal mode, so pressure could not be honestly copied out for those decisions.
- Evidence: `field-build-03-08-world-premise-pressure-selected.png`, `field-build-03-11-ordinary-life-pressure-preview.png`, `field-build-03-13-seed-parked.png`.
- Why it matters: field-build depends on exact proposal/pressure packets. A stale or mismatched mode can send the cold LLM the wrong task while the steward believes the other mode is selected.
- Fix direction: make mode selection and packet derivation a single source of truth; clear or visibly invalidate stale packet bodies when section, flow step, or mode changes.

### P-02 - Non-premise empty kernel sections cannot use Proposal mode. Severity: prompt-out blocking.
- Where: Creation / Core promise before steward-authored material exists.
- What happened: selecting Core promise and Proposal mode disabled loading with "Prompt-out waits for the selected section to be saved before it can use Core promise"; the packet body still showed the previous World premise pressure packet.
- Evidence: `field-build-03-09-core-promise-proposal-preview.png`.
- Why it matters: the method forbids premise proposal, but non-premise sections are exactly where proposal support should help the steward generate candidate material.
- Fix direction: allow Proposal packets for non-premise empty kernel sections, while continuing to refuse Proposal for the essence/premise exception.

### V-03 - Creation carries a complete kernel and saved consequence mode. Severity: validation.
- Where: Creation / kernel authoring.
- What happened: all nine kernel sections were saved. Consequence mode persisted as `mixed`; the UI showed saved body availability for authored sections and did not reproduce the prior selected-section hydration failure once authored material existed.
- Evidence: `field-build-03-10-kernel-complete.png`.
- Obsolescence verdict: kernel completion is mostly app-carried after avoiding prompt-out mode-state issues.

### V-04 - Seed decomposition and Creation-to-Admission handoff work. Severity: validation.
- Where: Creation / Seed decomposition.
- What happened: `POST /api/flows/creation/decompose` returned 201 and created `SEE-1 Seed decomposition` plus `FAC-1 Every known girl dies on her twentieth birthday`, truth layer `Objective canon`, canon status `proposed`. Creation then showed the Admission handoff.
- Evidence: `field-build-03-12-seed-ready.png`, `field-build-03-13-seed-parked.png`.
- Obsolescence verdict: first seed parking and handoff are app-carried.

### V-05 - Severe Admission classification opens the full-gate contract. Severity: validation.
- Where: Admission / severity declaration.
- What happened: after cold pressure, I selected `admission_level=4` and `work_scale=severe`. `POST /api/admission/records/3/severity` returned 200; the screen switched to `Method card: Full canon fact gate`, `admission.full-gate`, `admission_constraint_challenge`, `Severity path: full_gate`, and a full list of obligations.
- Evidence: `field-build-03-16-admission-severity-ready.png`, `field-build-03-17-admission-severity-declared.png`, `field-build-03-admission-severity-pressure.md`.
- Obsolescence verdict: severity selection and path routing are app-carried.

### V-06 - Frontloaded seed audit writes and links a gate result. Severity: validation.
- Where: Admission / Frontloaded seed audit.
- What happened: after severity was declared, entering audit findings enabled `Run Seed Audit`. `POST /api/admission/seed-audit` returned 201, and `FAC-1` then listed `GAT-1 Frontloaded seed audit` in its source/origin links.
- Evidence: `field-build-03-18-seed-audit-complete-full-gate-frontier.png`.
- Obsolescence verdict: first-seed audit is reachable and record-linked from the app.

### F-01 - Full canon fact gate is visible but not executable. Severity: blocking.
- Where: Admission after severity declaration and seed audit.
- What happened: the app lists full-gate obligations and blockers, including written consequence text, admission operation order, fact statement, scope, type, truth layer, canon status, constraint tags, dependencies, costs/access/bottlenecks, shock-cone summary, quiet-domain declarations, evidence/belief note, contradiction and mystery risk, follow-up debt, temporal/spatial passes, branch implications, mystery/aesthetic checks, and QA follow-up. The visible UI provides no authoring fields, status operation selector, constraint tag controls, n/a reason controls, quiet-domain controls, follow-up debt composer tied to the gate, or complete/full-gate submission control.
- Evidence: `field-build-03-17-admission-severity-declared.png`, `field-build-03-18-seed-audit-complete-full-gate-frontier.png`, `field-build-03-19-full-gate-promptout-loaded.png`.
- Why it matters: this is the next docs-closed stop. A steward can correctly classify the first severe fact and run seed audit, but cannot complete the canon fact gate or admit/hold/reject the fact through the governed UI.
- Fix direction: render the full-gate form from the server-owned decision contract, including written gate substance, ordered admission operations, n/a and quiet-domain declarations, follow-up debt, final steward operation/status, close preview, and completion/resume behavior.

### P-03 - Full-gate prompt-out loads only the current pressure status. Severity: friction.
- Where: Admission / Full canon fact gate prompt-out.
- What happened: `Load Admission Prompt-out Step` wrote loaded status for `flow admission · record 3 · step admission:constraints · mode pressure · template admission_constraint_challenge`. The screen still did not expose an in-place mode switch, advisory response paste/store controls, or advisory-use link selection, even though the prompt warning says pasted advisory responses are stored as advisory artifacts.
- Evidence: `field-build-03-19-full-gate-promptout-loaded.png`, `field-build-03-admission-full-gate-pressure.md`.
- Why it matters: the pressure packet itself is useful, but the UI stops at "loaded" rather than supporting the full advisory artifact loop promised by the Admission contract.
- Fix direction: make loaded prompt-out status decision-specific, add response capture/advisory artifact controls where the contract promises them, and keep proposal/pressure switching visible at the active decision point.

## Decision-Point Log

### Regression: Previous Field-Build Blockers
- Docs-first intent: replay prior open blockers because HEAD advanced from `ed372a5` to `39802bd`.
- App result: same-session world-switch state is fixed; Admission queue-selection UI is fixed; queue-severity prompt binding is fixed.
- Cold LLM: not repeated for old worlds; this was a blocker regression pass.
- Verdict: all three prior blocking findings are fixed.

### Setup/Open World
- Docs-first draft: create a fresh world file at `/tmp/worldloom-field-build/twentyfall-frontier.worldloom.sqlite`.
- Prompt-out coverage: proposal not applicable; pressure not applicable.
- Committed: world file created through setup UI.
- Obsolescence verdict: docs-obsolete for setup/open and route orientation.

### Kernel / World Premise
- Docs-first draft: scattered girl-led settlements survive under a twentieth-birthday death rule, men are vanished rumor, raiders make old books dangerous, and a teenage boy becomes a contradiction test.
- Prompt-out coverage: proposal refused correctly; pressure exercised through cold LLM.
- Committed: revised `KER-1` World premise after pressure.
- Obsolescence verdict: prompt packet was useful; mode-state needed manual correction.

### Kernel / Remaining Sections
- Docs-first draft: completed core promise, starting scale, genre/tone/consequence mode, foundational facts, constraints, mysteries, pressures, and ordinary-life anchor Sena Vale.
- Prompt-out coverage: Core promise proposal before authoring was blocked; Ordinary-life proposal was exercised through cold LLM; Ordinary-life pressure was blocked by stale Proposal packet body.
- Committed: all nine `KER-1` sections and saved consequence mode `mixed`.
- Obsolescence verdict: app carries the kernel, but prompt-out proposal/pressure behavior still needs hardening.

### Seed Decomposition / First Seed
- Docs-first draft: `Every known girl dies on her twentieth birthday`.
- Prompt-out coverage: proposal visible after seed parking; pressure selected but stale Proposal packet remained visible.
- Committed: `SEE-1 Seed decomposition`; `FAC-1 Every known girl dies on her twentieth birthday`, `Objective canon`, `proposed`.
- Obsolescence verdict: decomposition and handoff are app-carried.

### Admission / Severity Classification
- Docs-first intent: classify `FAC-1` before any canon standing change.
- Prompt-out coverage: severity pressure exercised through cold LLM; proposal available but not needed for the steward-authored classification.
- Committed: `admission_level=4`, `work_scale=severe`.
- Obsolescence verdict: queue selection, severity controls, and queue-severity prompt binding are app-carried.

### Admission / Frontloaded Seed Audit
- Docs-first intent: audit the first severe seed without mutating canon standing.
- Prompt-out coverage: not a separate prompt-out decision; authored audit findings used pressure from the prior severity pass.
- Committed: `GAT-1 Frontloaded seed audit`, linked to `FAC-1`.
- Obsolescence verdict: seed audit is app-carried.

### Admission / Full Canon Fact Gate
- Docs-first intent: complete written full-gate substance and then decide canon standing for `FAC-1`.
- Prompt-out coverage: full-gate pressure packet loaded and exercised through cold LLM. The cold pass warned not to upgrade "known settlements" into a universal law, not to resolve the boy's exception status, and not to turn institutional examples into fully designed canon.
- Committed: nothing beyond severity and seed audit. `FAC-1` remains proposed.
- Obsolescence verdict: blocked. The app exposes the full-gate contract but not the controls needed to complete it.

## For The App

Likeliest next PRD seed: implement executable Admission full gate.

Scope:
- Render full-gate authoring controls after major-or-higher severity is declared.
- Collect written consequence substance, ordered admission operations, status/operation decision, fact statement, scope, type, truth layer, canon status, constraint tags, dependencies, costs/access/bottlenecks, shock-cone summary, institutions/quiet-domain declarations, evidence/belief note, contradiction/mystery risk, follow-up debt, temporal/spatial passes, branch implications, mystery/aesthetic checks, and QA follow-up.
- Require n/a reasons and quiet-domain declarations where the contract says they are blockers.
- Let the steward complete, defer, reject, or hold the proposed fact through governed Admission without mutating read-side views.
- Link seed audit, prompt-out advisory artifacts, gate result, operation events, canon debt, and read-side trail.
- Add prompt-out response capture/advisory artifact controls for loaded Admission prompt-out steps.

Separate prompt-out hardening seed:
- Make mode selection and packet body atomic across Creation and Admission.
- Enable non-premise Proposal packets before section authoring.
- Clear stale packet bodies/status whenever flow step, section, record, or mode changes.

## For The Methodology

No methodology-source finding in this run. The method was actionable; the remaining blockers are app encoding and prompt-out state projection.

## Frontier

- Walked to: Admission full canon fact gate for `FAC-1 Every known girl dies on her twentieth birthday`.
- Next run resumes at: `/tmp/worldloom-field-build/twentyfall-frontier.worldloom.sqlite`, Admission `record:3:severity-declared`, full-gate completion.
- World state: `KER-1` complete with all nine sections; `SEE-1` decomposition report; `FAC-1` proposed Objective canon with `admission_level=4` and `work_scale=severe`; `GAT-1` Frontloaded seed audit linked; no admitted facts; no propagation, temporal, contradiction/mystery, MVW checkpoint, or QA work completed.
