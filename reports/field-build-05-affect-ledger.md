# Field Build 05 - Affect Ledger

**Date:** 2026-07-08  |  **App commit:** `f57d416`  |  **Method version:** worldbuilding-system 1.1
**Essence (user seed):** A young man wakes after an accident able to see numeric emotional reactions and attachments toward him, turning intimacy into a tempting and dangerous measurement problem.
**World:** Affect Ledger - near-present psychological thriller about Nico Vale, whose private emotional readouts promise certainty while creating privacy violations, manipulation pressure, proof problems, and uncertainty about whether measured feeling is truth, surface reaction, or a dangerous interface. **World file:** `/tmp/worldloom-field-build/affect-ledger.worldloom.sqlite`.
**Path walked:** setup/open -> Creation kernel -> seed decomposition -> Admission severity -> seed audit -> full canon gate -> Propagation owed-run frontier. **Prior field run:** `reports/field-build-04-aftershock-imposter-earth.md`.
**Evidence:** screenshots at `/tmp/worldloom-field-build/screenshots/field-build-05-*.png`; cold prompt packets and outputs at `/tmp/worldloom-field-build/cold-llm/field-build-05-*.md`.

## Findings

### V-REG-01 - Non-premise empty kernel Proposal mode now works. Severity: validation.
- Where: Regression replay of Field Build 04 `P-02`, Creation / Core promise before steward-authored material.
- What happened: after saving only the World premise, selecting empty `Core promise` and Proposal mode produced a Core-promise proposal packet with a visible preview and packet hash `88e6e700c112b4c05c4f74fb5502cbe69c3be17139967bc19ce14ec566adafdf`.
- Evidence: `field-build-05-04-regression-core-proposal-available.png`; `/tmp/worldloom-field-build/cold-llm/field-build-05-core-promise-proposal-prompt.md`.
- Prior finding covered: Field Build 04 `P-02`.

### P-01 - Prompt-out identity is safer but still not atomic. Severity: prompt-out friction. Mode: proposal/pressure. *Carried/partially fixed from Field Build 04 P-01.*
- Where: Creation and Admission loaded Prompt-out status.
- What happened: stale packets are now labeled stale and non-copyable, which reduces the prior safety risk. The edge remains that the main active preview area can show the prior decision until a mode/section refresh, and route changes can leave a large stale Admission packet visible in the loaded status panel while the steward is on Propagation.
- Evidence: `field-build-05-04-regression-core-proposal-available.png`; `field-build-05-14-propagation-owed-run-disabled.png`.
- The snag: a cold-probe workflow still requires the steward to inspect packet identity carefully rather than trusting the visible surface.
- Design verdict: local structural fix - the app has the right stale-state vocabulary, but the active and prior packet regions need a clearer ownership model.
- Recommendation: make the active prompt region empty or explicitly "no active packet loaded" after any flow/record/section/step/mode change, and move stale packets behind a collapsed prior-origin disclosure.
- Repro: save a World premise pressure packet, select an empty Core promise before refreshing mode, then navigate later to Propagation after loading Admission full-gate pressure; observe stale prior origin/status remaining visible.
- Fix direction: treat flow, record, section, step, mode, template, and packet body as one atomic active identity; clear the loaded panel or collapse it when leaving the active origin.
- Touches: `docs/specs/prompt-out-context-assembly.md`, `docs/specs/creation-flow.md`, `docs/specs/admission-flow.md`, `packages/web/src/main.tsx`.

### F-01 - Full-gate completion is cleaner, but living card wording still diverges from accepted gate substance. Severity: blocking. *Carried/partially fixed from Field Build 04 F-01.*
- Where: Admission / severe full canon fact gate.
- What happened: the earlier stale cross-world text and corrupted gate report did not recur. The form opened blank, exact-payload review worked, completion emptied the queue, wrote `accepted with constraints`, added four constraint tags, linked `GAT-2`, and created `DEB-1`. `GAT-2` now contains the full gate sections under the correct headings. The remaining mismatch is that `/api/canon-workbench/records/3` still shows the original broad seed body as the accepted current card body, while the narrowed accepted fact statement lives only inside `GAT-2`.
- Evidence: `field-build-05-09-admission-full-gate-blank.png`, `field-build-05-12-full-gate-exact-payload.png`, `field-build-05-13-admission-complete.png`; `/api/canon-workbench/records/3`; `/api/canon-workbench/records/5`.
- The snag: a docs-closed steward cannot tell whether the accepted living fact is the broad card body or the constrained gate fact statement.
- Design verdict: redesign candidate - local label fixes are no longer the main issue; the read model needs to show the standing relationship between card body, gate fact statement, and accepted constraints.
- Recommendation: either update the living card body to the accepted constrained fact statement, or explicitly render the accepted gate statement as the current standing text beside the original proposal body and label the proposal body as historical.
- Repro: admit a severe fact with a full-gate fact statement that narrows the proposed body, complete through exact-payload review, then compare `/api/canon-workbench/records/<fact>` body with `/api/canon-workbench/records/<gate-result>` `Fact statement:`.
- Fix direction: Admission write/read contract in `docs/specs/admission-flow.md`, server admission completion, and Canon Workbench current-card display.
- Touches: `docs/specs/admission-flow.md`, `packages/server/src/admission-flow.ts`, `packages/web/src/main.tsx`.

### V-REG-02 - Full-gate pressure packet now includes steward-filled gate draft. Severity: validation.
- Where: Regression replay of Field Build 04 `P-03`, Admission / full canon fact gate Prompt-out.
- What happened: after the full-gate form was filled, the visible `admission_constraint_challenge` packet included the current unsaved draft section keys, fact statement, scope, type, truth-layer/status notes, tags, dependencies, costs, shock cone, institutions and quiet-domain declaration, evidence/belief, mystery risk, debt, temporal/spatial passes, branch N/A reason, aesthetic/QA checks, written consequence, operation, target status, tags, follow-up debt, and draft/canon boundary.
- Evidence: `field-build-05-12-full-gate-exact-payload.png`; `/tmp/worldloom-field-build/cold-llm/field-build-05-admission-full-gate-pressure-prompt.md`; `/tmp/worldloom-field-build/cold-llm/field-build-05-admission-full-gate-pressure.md`.
- Prior finding covered: Field Build 04 `P-03`.

### P-04 - Admission prompt modes are advertised but not user-selectable in the active surface. Severity: prompt-out friction. Mode: proposal.
- Where: Admission decision contract and full-gate prompt-out.
- What happened: the Admission contract listed Proposal and Pressure as available, but the active surface exposed only `Load Admission Prompt-out Step` and loaded the pressure template. Severity Proposal was exercised through diagnostic API extraction, not through a visible in-flow mode selector.
- Evidence: `field-build-05-08-admission-fac1-selected.png`; `field-build-05-11-full-gate-filled-before-prompt.png`; `/tmp/worldloom-field-build/cold-llm/field-build-05-admission-severity-proposal-prompt.md`.
- The snag: the app says Proposal exists, but a steward cannot choose it from the active Admission workflow.
- Design verdict: local structural fix - the screen already has prompt-out framing, but it needs the same visible mode selector pattern used elsewhere.
- Recommendation: add an Admission prompt mode selector wired to the server step identity, and show the selected mode next to the load button and source manifest.
- Repro: select a proposed fact in Admission; inspect the contract's `Prompt modes` list and the prompt-out controls; no Proposal/Pressure selector is available before loading.
- Fix direction: `docs/specs/admission-flow.md`, `docs/specs/prompt-out-context-assembly.md`, active Admission component.
- Touches: `packages/web/src/main.tsx`, `packages/server/src/admission-flow.ts`.

### F-02 - Propagation owed run cannot start from the active owed queue. Severity: blocking. *Carried/still-broken from Field Build 04 F-02.*
- Where: Propagation destination after Admission-created `DEB-1`.
- What happened: the active Propagation screen now shows consequence, domain, disposition, and prompt-out controls, which is progress. But the owed item says `Source fact not returned for this owed item`; `/api/propagation/queue` returns `sourceFact:null` and `route:null`; `Start/Resume Owed Run` is disabled, leaving `Flow not started` and all working controls disabled.
- Evidence: `field-build-05-14-propagation-owed-run-disabled.png`; `/api/propagation/queue` returning `DEB-1` with `sourceFact:null`.
- The snag: an Admission-created propagation debt is visible but cannot be worked from the user-reachable workflow.
- Design verdict: redesign candidate - the active shell has the right categories of controls now, but the owed-run selection/start contract is structurally broken.
- Recommendation: make Admission-created propagation debt carry or resolve its source fact and route, enable one-click start/resume from the owed item, then hydrate consequence/domain/disposition controls from the run.
- Repro: complete a severe Admission full gate with propagation debt; open Propagation; observe the owed item with `Source fact not returned for this owed item` and disabled `Start/Resume Owed Run`.
- Fix direction: debt/source-fact linking between Admission and Propagation queue, plus active Propagation run start.
- Touches: `docs/specs/propagation-flow.md`, `packages/server/src/propagation-flow.ts`, `packages/server/src/admission-flow.ts`, `packages/web/src/main.tsx`.

### F-03 - Creation critique after parking has no split/retract/recompose affordance. Severity: friction.
- Where: Creation / seed decomposition after `FAC-1` is parked.
- What happened: cold proposal and pressure probes correctly flagged that `FAC-1` still bundled private perception, numeric-label format, axis taxonomy, proof limits, accident timing, exclusivity, scope, and consequence pressure. The active handoff pointed onward to Admission; there was no in-flow split, retract, or recompose action for a parked seed.
- Evidence: `field-build-05-06-seed-parked.png`; `/tmp/worldloom-field-build/cold-llm/field-build-05-seed-decomposition-proposal.md`; `/tmp/worldloom-field-build/cold-llm/field-build-05-seed-decomposition-pressure.md`.
- The snag: the app can help discover a granularity problem only after parking, but then leaves the steward to use docs/operator judgment to know whether to redo Creation or narrow in Admission.
- Design verdict: structural F with local R - the handoff is readable, but the workflow lacks the correction action implied by its own critique.
- Recommendation: after seed prompt-out flags bundling, offer explicit actions: split into sibling proposed facts, retract/rewrite the parked seed, or carry a named Admission narrowing note.
- Fix direction: `docs/specs/creation-flow.md`, seed decomposition action model.
- Touches: `packages/web/src/main.tsx`, `packages/server/src/creation-flow.ts`.

### Q-01 - Kernel section-specific prompt coverage was bounded. Severity: question.
- Where: Creation / kernel sections.
- What happened: the app now exposes section-specific packets; this run cold-probed World premise pressure and Core promise proposal, then authored and saved the remaining kernel sections. A fuller prompt-out audit would exercise proposal and pressure for every non-premise section.
- Evidence: `/tmp/worldloom-field-build/cold-llm/field-build-05-world-premise-pressure-prompt.md`; `/tmp/worldloom-field-build/cold-llm/field-build-05-core-promise-proposal-prompt.md`; `field-build-05-05-kernel-complete.png`.
- The unknown: whether every remaining section-specific packet is as self-contained as the representative packets tested here.

### V-01 - Setup and local-file world opening are app-carried. Severity: validation.
- Where: Setup / Workflow map.
- What happened: setup showed server/catalog state, current world file path, recent worlds, and opened `/tmp/worldloom-field-build/affect-ledger.worldloom.sqlite`; the workflow map foregrounded Creation as the first earned step.
- Evidence: `field-build-05-01-entry-setup.png`, `field-build-05-02-workflow-map-open.png`.

### V-02 - Premise essence refusal and pressure packet are app-carried. Severity: validation.
- Where: Creation / World premise.
- What happened: Proposal mode refused the essence correctly; pressure mode generated a self-contained packet. The cold answer usefully challenged overfull axes, accident as protected threshold, uncertainty type, and institutional horizon.
- Evidence: `/tmp/worldloom-field-build/cold-llm/field-build-05-world-premise-pressure-prompt.md`; `/tmp/worldloom-field-build/cold-llm/field-build-05-world-premise-pressure.md`.

### V-03 - Kernel saving and readback are app-carried. Severity: validation.
- Where: Creation / full kernel.
- What happened: `KER-1` saved all nine sections plus `consequence_mode=mixed`; API readback returned every section.
- Evidence: `field-build-05-05-kernel-complete.png`; `/api/canon-workbench/records/1`.

### V-04 - Seed decomposition writes proposed fact and provenance. Severity: validation.
- Where: Creation / Seed decomposition.
- What happened: `FAC-1 · Nico privately sees emotional readouts` was parked as Objective canon / proposed, linked to `KER-1` and `SEE-1`, and surfaced in the Admission queue.
- Evidence: `field-build-05-06-seed-parked.png`; `/api/admission/queue`.

### V-05 - Frontloaded seed audit writes linked report and preserves standing. Severity: validation.
- Where: Admission / Frontloaded seed audit.
- What happened: `GAT-1 Frontloaded seed audit` was created and linked to `FAC-1`; the seed remained proposed until full-gate completion.
- Evidence: `field-build-05-10-seed-audit-written.png`; `/api/canon-workbench/audit`.

### V-06 - Admission writes status, tags, gate report, and debt. Severity: validation.
- Where: Admission / full gate completion.
- What happened: completion changed `FAC-1` to `accepted with constraints`, added `knowledge-bound`, `access-bound`, `material-bound`, `time-bound`, recorded operation `constrain`, linked `GAT-2`, emptied Admission queue, and created `DEB-1`.
- Evidence: `field-build-05-13-admission-complete.png`; `/api/admission/queue`; `/api/canon-debt?open=true`.
- Caveat: this validation does not close `F-01` because current card body and accepted gate statement still diverge.

### V-07 - Propagation active surface now contains working-control categories. Severity: validation.
- Where: Propagation destination.
- What happened: unlike Field Build 04's mostly empty route shell, the active screen now shows owed propagation, run identity, shock-cone order controls, domain-atlas controls, dispositions, and Prompt-out controls.
- Evidence: `field-build-05-14-propagation-owed-run-disabled.png`.
- Caveat: this does not close `F-02` because the owed run cannot start.

## Regression of prior findings

Gate: `dd5bf2a -> f57d416`; HEAD advanced and the app-source working tree was clean, so Field Build 04 open blocking findings were replayed.

- `P-01` (prompt-out mode controls and active packet body can disagree): partially-fixed.
  - Repro replayed: Creation premise pressure -> empty Core promise proposal, then later Admission loaded packet -> Propagation route. Result: stale state is now explicitly labeled and non-copyable, but active/stale packet identity still requires manual vigilance. See `P-01`.
- `P-02` (non-premise empty kernel sections cannot use Proposal): fixed -> `V-REG-01`.
  - Repro replayed: saved only World premise, selected empty Core promise, chose Proposal. Result: Core-promise proposal packet loaded and was cold-probed.
- `F-01` (full-gate execution unsafe after the form appears): partially-fixed.
  - Repro replayed: opened full gate after prior-world work, filled all sections, reviewed exact payload, completed, then compared fact record, gate report, queue, and debt. Result: stale/corrupt form state fixed, exact review added, clean `GAT-2` written; living card body still diverges from accepted gate fact statement. See `F-01`.
- `P-03` (full-gate prompt packet ignores steward-filled gate substance): fixed -> `V-REG-02`.
  - Repro replayed: filled full-gate sections, loaded Admission Prompt-out. Result: packet included current unsaved gate draft and produced useful cold pressure.
- `F-02` (Propagation entry starts but active workflow cannot work the sweep): still-broken.
  - Repro replayed: completed severe Admission with debt, opened Propagation. Result: active workflow now has more controls, but the owed item has `sourceFact:null`, `route:null`, and disabled Start/Resume. See `F-02`.

## Decision-point log

### Setup / Open World
- Docs-first draft: create `/tmp/worldloom-field-build/affect-ledger.worldloom.sqlite` and start from the new-world path.
- Prompt-out coverage: proposal=not applicable; pressure=not applicable.
- Committed: world file opened through setup UI.
- UX/style verdict: ok.
- Obsolescence verdict: docs-obsolete for setup/open.

### Regression Pass
- Docs-first intent: replay prior blocking findings before trusting new-world progress.
- Prompt-out coverage: proposal=not applicable except where prior P findings were replayed; pressure=not applicable except where prior P findings were replayed.
- Committed: `P-02` and `P-03` fixed; `P-01` and `F-01` partially fixed; `F-02` still broken.
- UX/style verdict: mixed, with current findings above.
- Obsolescence verdict: docs still needed for regression discipline and edge probes.

### Kernel / World Premise
- Docs-first draft: a near-present psychological thriller in which Nico Vale survives an accident and privately sees numeric emotional readouts for reactions and attachments toward him; the numbers tempt certainty while creating privacy, manipulation, proof, and interpretation pressure.
- Prompt-out coverage: proposal=refused correctly for essence; pressure=exercised with `/tmp/worldloom-field-build/cold-llm/field-build-05-world-premise-pressure-prompt.md`, output `/tmp/worldloom-field-build/cold-llm/field-build-05-world-premise-pressure.md`, subagent `019f4117-3e2d-7160-86fb-d17605f7aabb`.
- Cold LLM pressure: useful; pushed a dominant first uncertainty, accident as protected threshold, social/institutional horizon, and consequence pathway.
- Committed: `KER-1` World premise plus `consequence_mode=mixed`.
- UX/style verdict: ok, with stale packet vigilance under `P-01`.
- Obsolescence verdict: docs-obsolete for premise and essence refusal.

### Kernel / Remaining Sections
- Docs-first draft: completed Core promise, Starting scale, Genre/tone/consequence, Foundational facts, Foundational constraints, Initial mysteries, Primary pressures, and Ordinary-life promise from the kernel protocol.
- Prompt-out coverage: proposal=exercised for empty Core promise with `/tmp/worldloom-field-build/cold-llm/field-build-05-core-promise-proposal-prompt.md`, output `/tmp/worldloom-field-build/cold-llm/field-build-05-core-promise-proposal.md`, subagent `019f4119-50f3-79e2-b077-a8ab549cd5be`; pressure=representative World premise pressure only, with section-wide limitation `Q-01`.
- Cold LLM proposal: useful; offered intimacy-breakdown, temptation-engine, corrosive-certainty, and interface-ambiguity variants.
- Committed: all nine `KER-1` sections; `consequence_mode=mixed`.
- UX/style verdict: ok.
- Obsolescence verdict: mostly docs-obsolete for authoring and saving; docs still needed for strict prompt-coverage expectations.

### Seed Decomposition / FAC-1
- Docs-first draft: park one proposed seed isolating Nico's repeatable private readout capability while leaving origin, ontology, reliability, axis taxonomy, proof limits, and relationship effects as constraints or sibling work.
- Prompt-out coverage: proposal=exercised with `/tmp/worldloom-field-build/cold-llm/field-build-05-seed-decomposition-proposal-prompt.md`, output `/tmp/worldloom-field-build/cold-llm/field-build-05-seed-decomposition-proposal.md`, subagent `019f4120-b261-7be0-abb1-7e415d7243f6`; pressure=exercised with `/tmp/worldloom-field-build/cold-llm/field-build-05-seed-decomposition-pressure-prompt.md`, output `/tmp/worldloom-field-build/cold-llm/field-build-05-seed-decomposition-pressure.md`, subagent `019f4127-070f-7590-bf88-4a4154dd9b02`.
- Cold LLM result: useful; both modes flagged bundling and recommended finer capability, proof, reliability, taxonomy, and scope boundaries.
- Committed: `SEE-1 Seed decomposition`; `FAC-1 Nico privately sees emotional readouts`, Objective canon, proposed.
- UX/style verdict: local R / structural F because post-park critique lacks split/retract/recompose affordance (`F-03`).
- Obsolescence verdict: docs still needed after critique reveals granularity trouble.

### Admission / Severity Declaration
- Docs-first draft: classify `FAC-1` as severe because it is a foundational private perception capability that affects privacy, evidence, medicine, work, dating, coercion, mystery, and selfhood.
- Prompt-out coverage: proposal=exercised diagnostically through server packet with `/tmp/worldloom-field-build/cold-llm/field-build-05-admission-severity-proposal-prompt.md`, output `/tmp/worldloom-field-build/cold-llm/field-build-05-admission-severity-proposal.md`, subagent `019f412b-9163-7d42-9ede-fd46407f5946`; pressure=exercised with `/tmp/worldloom-field-build/cold-llm/field-build-05-admission-severity-pressure-prompt.md`, output `/tmp/worldloom-field-build/cold-llm/field-build-05-admission-severity-pressure.md`, subagent `019f412c-128a-7a11-a2d7-c230c5f76d50`.
- Cold LLM result: useful; supported deep work and challenged reliability, category expansion, accident timing, direct encounter boundaries, and proof limits.
- Committed: `admission_level=4`, `work_scale=severe`.
- UX/style verdict: ok for severity controls; prompt mode selector gap logged as `P-04`.
- Obsolescence verdict: severity declaration mostly app-carried.

### Admission / Frontloaded Seed Audit
- Docs-first draft: allow Admission only with constraints; do not admit mechanism, objective reliability, universal exclusivity, mediated-contact behavior, or future category expansion.
- Prompt-out coverage: proposal=not separate; pressure=covered by severity and seed-decomposition pressure.
- Committed: `GAT-1 Frontloaded seed audit`, linked to `FAC-1`.
- UX/style verdict: ok.
- Obsolescence verdict: docs-obsolete for audit execution.

### Admission / Full Canon Fact Gate
- Docs-first draft: accept with constraints only the fact that Nico privately perceives numeric emotional readouts in starting-scale direct encounters after the accident; preserve origin, ontology, reliability, proof, remote/mass contact, future categories, and other users as debt or protected unknowns.
- Prompt-out coverage: proposal=blocked on active UI by missing mode selector (`P-04`); pressure=exercised with `/tmp/worldloom-field-build/cold-llm/field-build-05-admission-full-gate-pressure-prompt.md`, output `/tmp/worldloom-field-build/cold-llm/field-build-05-admission-full-gate-pressure.md`, subagent `019f413b-ecab-7461-906f-706e10118370`.
- Cold LLM pressure: useful; challenged calibration, directionality, current-only exclusivity, test danger, leakage path, branch watchpoints, hostile optimization, and dependency specificity.
- Committed: `FAC-1` accepted with constraints; tags `knowledge-bound`, `access-bound`, `material-bound`, `time-bound`; `GAT-2`; `DEB-1`.
- UX/style verdict: redesign candidate for card/gate standing readback (`F-01`); otherwise full-gate review and report writing are much improved.
- Obsolescence verdict: docs still needed to notice current-card/gate-statement divergence.

### Propagation / Owed Run Frontier
- Docs-first draft: start the full domain-atlas sweep from `FAC-1` and `DEB-1`, then record consequences and dispositions across privacy, medicine, work, dating, family, friends, therapy, evidence/law, coercion, online leakage, and selfhood.
- Prompt-out coverage: proposal=blocked by app at disabled owed-run start; pressure=blocked by app at disabled owed-run start.
- Committed: no propagation run started; `DEB-1` remains open.
- UX/style verdict: redesign candidate; the active surface has working-control categories but cannot hydrate/start the owed run.
- Obsolescence verdict: blocked at `F-02`.

## For the app

Admission/full-gate PRD seed:
- Decide and encode the relationship between proposal card body, accepted gate fact statement, and current canon standing. The recommended UX direction is a current-standing panel that displays accepted gate wording as the operative statement, with the original proposal body labeled as source/proposal history if retained.
- Preserve the exact-payload review and clean `GAT-2` behavior from this run.

Propagation PRD seed:
- Fix Admission-created propagation debt so the Propagation queue returns `sourceFact` and a start route.
- Enable `Start/Resume Owed Run` from the owed item and hydrate the visible consequence/domain/disposition/prompt-out controls from that run.

Prompt-out PRD seed:
- Make prompt identity atomic across flow/record/section/step/mode/template/body.
- Add a visible Admission prompt mode selector wherever the contract advertises both Proposal and Pressure.

Creation refinement PRD seed:
- Add an in-flow correction path after seed prompt-out flags bundling: split into sibling facts, retract/rewrite, or carry a structured Admission narrowing note.

## For the methodology

No methodology-source finding in this run. The docs were actionable; the gaps are app encoding, read-side truth presentation, prompt-mode UI, and active-flow parity.

## Frontier

- Walked to: Propagation owed-run disabled state for `DEB-1`.
- Next run resumes at: `/tmp/worldloom-field-build/affect-ledger.worldloom.sqlite`, Propagation with `FAC-1` record id `3` and `DEB-1` debt id `6`; first check whether `/api/propagation/queue` returns a non-null `sourceFact` and whether `Start/Resume Owed Run` is enabled.
- Carried-open findings: `P-01`, `F-01`, `P-04`, `F-02`, `F-03`, `Q-01`. Mandatory next regression set should prioritize blocking `F-01` and `F-02`; `P-01` remains prompt-out friction unless it regresses to unsafe copy/export behavior.
- World state: `KER-1` complete; `SEE-1`; `FAC-1` accepted with constraints; `GAT-1` seed audit; `GAT-2` clean full-gate report; `DEB-1` open; no Propagation run, specialized passes, MVW checkpoint, or QA complete.
