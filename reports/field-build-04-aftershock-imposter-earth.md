# Field Build 04 - Aftershock Imposter Earth

**Date:** 2026-07-07  |  **App commit:** `dd5bf2a`  |  **Method version:** worldbuilding-system 1.1
**Essence (user seed):** Earth, 2030; global shockwaves are followed by smiling human-looking imposters who kill at close range, cannot be reasoned with, do not understand language, cannot use tools, and drive survivors into barricaded paranoid communities.
**World:** Aftershock Imposter Earth - near-future apocalyptic survival horror where close-range predation, visual mimicry, tool/language asymmetry, barricade dependence, and trust protocols shape survivor life. **World file:** `/tmp/worldloom-field-build/aftershock-imposter-earth.worldloom.sqlite`.
**Path walked:** prior blocker regression -> setup/open -> Creation kernel -> seed decomposition -> Admission severity -> seed audit -> full canon gate -> Propagation entry frontier. **Prior field run:** `reports/field-build-03-twentyfall-frontier.md`.
**Evidence:** screenshots at `/tmp/worldloom-field-build/screenshots/field-build-04-*.png`; cold prompt packets and outputs at `/tmp/worldloom-field-build/cold-llm/field-build-04-*.md`.

## Findings

### V-REG-01 - Full-gate controls now render and submit. Severity: validation.
- Where: Regression replay of Field Build 03 F-01, Admission / full canon fact gate.
- What happened: the severe full-gate screen now renders textareas, operation/status selectors, constraint tags, written consequence, follow-up debt, validation errors, and completion controls. Empty completion had earlier returned server validation and preserved input; a filled completion wrote status/tags and a gate result.
- Evidence: `field-build-04-03-regression-full-gate-empty-validation.png`, `field-build-04-04-regression-full-gate-complete.png`, `field-build-04-14-admission-full-gate-filled.png`, `field-build-04-15-admission-complete.png`.
- Prior finding covered: Field Build 03 F-01, but only partially; see F-01 below.

### P-01 - Prompt-out mode controls and active packet body can still disagree. Severity: prompt-out blocking. Mode: proposal/pressure.
- Where: Creation prompt-out across kernel, seed decomposition, and stale Admission status.
- What happened: the app now labels a prior loaded status as stale and prevents copying stale packet bodies, which is an improvement. But active decision mode/body mismatch still recurred: after kernel completion, active Ordinary-life packet body began `Mode: Proposal` while controls/status said Pressure; after seed parking, the seed-decomposition proposal packet was active while the dropdown/status remained Pressure.
- Evidence: `field-build-04-10-post-kernel-prompt-mode-mismatch-and-stale-status.png`, `field-build-04-11-seed-parked-prompt-mode-mismatch.png`, DOM extraction of two `pre.prompt-packet-text` nodes during Admission.
- The snag: cold-LLM testing depends on copying the exact intended mode. A mixed mode/status surface makes the steward prove correctness manually.
- Repro: create/open Aftershock world; save World premise; switch through remaining kernel/seed decisions; observe prompt mode dropdown/status and visible `pre.prompt-packet-text` after section/step changes.
- Fix direction: derive dropdown, loaded status, and packet body from one active prompt identity; clear active packet text whenever flow, record, section, step, or mode changes.
- Touches: `docs/specs/prompt-out-context-assembly.md`, `docs/specs/creation-flow.md`, `packages/web/src/main.tsx`.

### P-02 - Non-premise empty kernel sections still cannot use Proposal mode. Severity: prompt-out blocking. Mode: proposal.
- Where: Creation / Core promise before steward-authored material exists.
- What happened: selecting empty `Core promise` and Proposal mode left the load button disabled and the preview/status still bound to the World premise pressure blocker.
- Evidence: `field-build-04-07-regression-core-promise-proposal-still-broken.png`.
- The snag: `20_ai_assisted_workflow.md` reserves premise/essence to the steward, but proposal support should be available for non-premise kernel sections.
- Repro: in a new world, save only World premise, select Core promise, choose Proposal mode, and observe the disabled load state plus stale prior premise packet/status.
- Fix direction: refuse Proposal only for the premise exception; generate candidate packets for other empty kernel sections.
- Touches: `docs/specs/creation-flow.md`, `docs/worldbuilding-system/20_ai_assisted_workflow.md`.

### F-01 - Full-gate execution is unsafe after the form appears. Severity: blocking. *Carried/partially fixed from Field Build 03 F-01.*
- Where: Admission / severe full canon fact gate.
- What happened: the old blocker is partly fixed because a form exists and completion writes. Adjacent probes failed:
  - After replaying Twentyfall's full gate, Aftershock's full-gate textareas opened prefilled with Twentyfall twentieth-birthday content.
  - The quiet-domain area has ambiguous accessible labels; `Quiet-domain declaration` resolved to both the section's main textarea and the quiet-domain textarea.
  - Completion wrote `FAC-1` as `accepted with constraints` with tags and `DEB-1`, but the living current-canon record body stayed the original broad seed wording rather than the narrowed steward-authored fact statement.
  - `GAT-2` readback recorded `Fact statement:` as the institutions text after the ambiguous field correction, so the audit report and intended gate substance diverged.
- Evidence: `field-build-04-12-admission-full-gate-stale-twentyfall-values.png`, `field-build-04-14-admission-full-gate-filled.png`, `field-build-04-15-admission-complete.png`; `/api/canon-workbench/records/3`; `/api/canon-workbench/records/5`.
- The snag: a docs-closed steward can now click through the full gate, but the app does not make the resulting canon/audit state trustworthy.
- Repro: in one browser session, complete a full gate for one world, switch to a fresh world, drive a new severe fact to the full gate, inspect prefilled section text, then complete with edited section text and compare `/api/canon-workbench/records/<fact>` to the gate result report.
- Fix direction: reset full-gate local state on world/record/flow changes; make labels unique; add a final preview of exact section payload; update the living card wording or explicitly show that Admission will not rewrite the fact body; reject completion if gate sections and final record wording diverge.
- Touches: `docs/specs/admission-flow.md`, `packages/web/src/main.tsx`, `packages/server/src/admission-flow.ts`.

### P-03 - Full-gate prompt packet ignores steward-filled gate substance. Severity: prompt-out blocking. Mode: pressure.
- Where: Admission / full canon fact gate prompt-out.
- What happened: after the gate form was filled with narrowed steward material, the active `admission_constraint_challenge` packet still contained only the original proposed `FAC-1` body. The cold subagent usefully challenged the broad seed, but it could not pressure-test the filled gate package because that material was absent from the packet.
- Evidence: `/tmp/worldloom-field-build/cold-llm/field-build-04-admission-full-gate-pressure-prompt.md`, `/tmp/worldloom-field-build/cold-llm/field-build-04-admission-full-gate-pressure.md`.
- The snag: pressure mode is owed after steward-authored gate substance exists, not only against the un-gated proposal.
- Repro: fill full-gate sections, inspect `/api/admission/records/3/decision-point` or `pre.prompt-packet-text`; the packet's `decision_material` is still just selected-record prose.
- Fix direction: full-gate prompt-out should include current unsaved/saved gate section substance, status/operation/tags, written consequence, follow-up debt, and omissions.
- Touches: `docs/specs/prompt-out-context-assembly.md`, `docs/specs/admission-flow.md`.

### V-01 - Frontloaded seed audit writes and preserves seed standing. Severity: validation.
- Where: Admission / Frontloaded seed audit.
- What happened: audit findings for the broad tool-use seed wrote `GAT-1 Frontloaded seed audit` and linked it to `FAC-1`; `FAC-1` remained proposed until the gate completed.
- Evidence: `field-build-04-13-seed-audit-written.png`; `/api/canon-workbench/records/3`.
- Obsolescence verdict: the app carried this part of the method.

### V-02 - Admission can write status, tags, operation, gate result, and propagation debt. Severity: validation.
- Where: Admission / full-gate completion.
- What happened: completion changed `FAC-1` to `accepted with constraints`, added tags `knowledge-bound`, `material-bound`, `access-bound`, `time-bound`, recorded `constrain`, linked `GAT-2`, emptied Admission queue, and created `DEB-1 Propagation owed for FAC-1`.
- Evidence: `field-build-04-15-admission-complete.png`; `/api/admission/queue`; `/api/canon-debt?open=true`.
- Caveat: this validation does not close F-01 because the living body and gate section readback were unsafe.

### F-02 - Propagation entry starts, but the active workflow-shell cannot work the sweep. Severity: blocking.
- Where: Propagation destination after Admission-created `DEB-1`.
- What happened: the owed queue existed and manually entering `factId=3`, `debtId=6` started flow `2`. The active workflow-shell screen then showed the method card, decision contract, IDs, `Close Run`, and run payload counts, but no consequence prose, order/domain selectors, disposition controls, surfaced-fact controls, or prompt-out load controls. It also reported "No server-returned blockers" before any consequence, domain, or disposition existed despite required coverage `full domain-atlas sweep`.
- Evidence: `field-build-04-16-propagation-entry-frontier.png`; `/api/propagation/runs/2`.
- The snag: the next docs-closed step is impossible from the active destination; using API-only propagation would stop testing the app surface.
- Repro: admit a severe/foundational fact with follow-up propagation debt, open Propagation in the workflow shell, manually enter the fact/debt IDs, click Start or Resume, and observe that the active destination lacks the controls required by `docs/specs/propagation-flow.md`.
- Fix direction: port the consequence/domain/disposition/proposal/close-readiness controls into the active workflow-shell Propagation surface, add owed-debt selection, and make close blockers reflect severity-derived coverage.
- Touches: `docs/specs/propagation-flow.md`, `packages/web/src/main.tsx`, `packages/server/src/propagation-flow.ts`.

### V-03 - Propagation owed-debt queue and run entry exist. Severity: validation.
- Where: Propagation / run entry.
- What happened: Admission-created `DEB-1` appeared in `/api/propagation/queue`; starting Propagation produced flow `2` for `FAC-1` and exposed required coverage, six shock-cone orders, fourteen domains, and prompt modes in the server contract.
- Evidence: `field-build-04-16-propagation-entry-frontier.png`; `/api/propagation/runs/2`.
- Obsolescence verdict: the handoff exists, but working the sweep is blocked by F-02.

## Regression of prior findings

Gate: `39802bd -> dd5bf2a`; HEAD advanced, so Field Build 03 open blocking findings were replayed.

- `F-01` (full canon fact gate visible but not executable): partially-fixed.
  - Repro replayed: reached severe full gate, submitted empty gate, then filled and completed. Result: form and server completion exist. Edge probes failed: stale cross-world textarea values, ambiguous labels, current-canon body not narrowed, and gate report section mismatch. See V-REG-01 and F-01.
- `P-01` (prompt-out mode controls and visible packet body can disagree): still-broken / partially improved.
  - Repro replayed: Creation kernel and seed-decomposition prompt-out surfaces. Result: stale loaded status is now labeled stale and non-copyable, but active packet mode/body mismatch still occurs. See P-01.
- `P-02` (non-premise empty kernel sections cannot use Proposal mode): still-broken.
  - Repro replayed: Core promise selected before authoring. Result: Proposal remained blocked and stale premise pressure state remained visible. See P-02.

## Decision-point log

### Setup / Open World
- Docs-first draft: create `/tmp/worldloom-field-build/aftershock-imposter-earth.worldloom.sqlite`.
- Prompt-out coverage: proposal=not applicable; pressure=not applicable.
- Committed: world file opened through setup UI.
- UX/style verdict: ok.
- Obsolescence verdict: docs-obsolete for setup/open and workflow-map orientation.

### Regression Pass
- Docs-first intent: replay Field Build 03 blockers before building a new world.
- Prompt-out coverage: proposal=not applicable; pressure=not applicable.
- Committed: prior full-gate form existence validated but marked partially fixed; P-01/P-02 carried.
- UX/style verdict: local findings F-01/P-01/P-02.
- Obsolescence verdict: docs still needed to know what adjacent probes mattered.

### Kernel / World Premise
- Docs-first draft: Earth 2030 shockwaves introduce human-shaped close-range predators; barricades matter because imposters cannot reason, understand language, or use tools, while every new arrival becomes a trust crisis.
- Prompt-out coverage: proposal=refused correctly for essence; pressure=exercised with `/tmp/worldloom-field-build/cold-llm/field-build-04-world-premise-pressure-prompt.md`, output `/tmp/worldloom-field-build/cold-llm/field-build-04-world-premise-pressure.md`, subagent `019f3d86-5699-7640-922e-d60a43ecb78b`.
- Cold LLM pressure: useful; clarified visual mimicry, public first sightings, trust crisis, and protected shockwave origin.
- Committed: revised World premise in `KER-1`.
- UX/style verdict: ok except prompt-state carryover captured under P-01/P-02.
- Obsolescence verdict: mostly docs-obsolete for premise.

### Kernel / Remaining Sections
- Docs-first draft: completed Core promise, Starting scale, Genre/tone/consequence, Foundational facts, Foundational constraints, Initial mysteries, Primary pressures, and Ordinary-life promise.
- Prompt-out coverage: proposal=blocked by app for empty Core promise (P-02); pressure=blocked for representative remaining-section pressure because active packet/mode disagreed (P-01).
- Committed: `KER-1` all nine sections; `consequence_mode=mixed`.
- UX/style verdict: local P findings.
- Obsolescence verdict: app carried saving and verification; docs/operator vigilance still needed for prompt-out.

### Seed Decomposition / First Seed
- Docs-first draft: `Imposters cannot use tools` as the first load-bearing seed.
- Prompt-out coverage: proposal=exercised with `/tmp/worldloom-field-build/cold-llm/field-build-04-seed-decomposition-proposal-prompt.md`, output `/tmp/worldloom-field-build/cold-llm/field-build-04-seed-decomposition-proposal.md`, subagent `019f3d9d-5eea-7ef3-ae41-f63ba0920a0d`; pressure=blocked by P-01 mode/body mismatch.
- Cold LLM proposal: useful; challenged the tool-use boundary and recommended Admission split/constraint pressure.
- Committed: `SEE-1 Seed decomposition`; `FAC-1 Imposters cannot use tools`, `Objective canon`, `proposed`.
- UX/style verdict: seed parking ok; prompt-out mismatch local P.
- Obsolescence verdict: decomposition/handoff mostly app-carried.

### Admission / Severity Declaration
- Docs-first draft: classify FAC-1 as level 4 / severe because tool non-use changes barricades, security, tactics, institutions, and mystery boundaries.
- Prompt-out coverage: proposal=deferred because the steward had authored the seed and used pressure for classification; pressure=exercised with `/tmp/worldloom-field-build/cold-llm/field-build-04-admission-severity-pressure-prompt.md`, output `/tmp/worldloom-field-build/cold-llm/field-build-04-admission-severity-pressure.md`, subagent `019f3da3-d1ce-7913-9d81-dab9631fdee2`.
- Cold LLM pressure: useful; warned that tools, signs, weapons, vehicles, carrying, and observation-vs-universality must be separated.
- Committed: `admission_level=4`, `work_scale=severe`.
- UX/style verdict: ok.
- Obsolescence verdict: severity path is app-carried.

### Admission / Frontloaded Seed Audit
- Docs-first draft: accept the seed only with constraints; preserve passive object contact, brute force, signs, vehicles, body-as-weapon violence, dragging, and future learning as debt.
- Prompt-out coverage: proposal=not separate; pressure=covered by severity pressure.
- Committed: `GAT-1 Frontloaded seed audit`, linked to `FAC-1`.
- UX/style verdict: ok.
- Obsolescence verdict: docs-obsolete for audit execution.

### Admission / Full Canon Fact Gate
- Docs-first draft: narrow FAC-1 to observed inability to intentionally operate, wield, unlock, repair, or carry human tools/mechanisms; admit as `accepted with constraints` with explicit debt.
- Prompt-out coverage: proposal=deferred because frontier moved; pressure=exercised with `/tmp/worldloom-field-build/cold-llm/field-build-04-admission-full-gate-pressure-prompt.md`, output `/tmp/worldloom-field-build/cold-llm/field-build-04-admission-full-gate-pressure.md`, subagent `019f3de1-0e5b-71c1-835d-1f4901d5b061`.
- Cold LLM pressure: useful for broad FAC-1, but blind to filled gate substance because the packet omitted it.
- Committed: `FAC-1` status/tags/operation and `GAT-2`/`DEB-1` were written, but the living record body and gate report readback are not clean. See F-01.
- UX/style verdict: redesign candidate for full-gate state/review; local label fixes are insufficient because the final record/audit contract can diverge.
- Obsolescence verdict: docs still needed; app wrote unsafe canon/audit state.

### Propagation / Run Entry
- Docs-first draft: start the shock cone from `FAC-1` and `DEB-1`; next step should record consequences/domains/dispositions for a full domain-atlas sweep.
- Prompt-out coverage: proposal=deferred because frontier moved at missing active controls; pressure=deferred because frontier moved at missing active controls.
- Committed: Propagation flow `2` started, in progress, required coverage `full domain-atlas sweep`.
- UX/style verdict: redesign candidate; the active destination is a route shell, not the working propagation flow.
- Obsolescence verdict: blocked at F-02.

## For the app

Primary PRD seed: harden executable Admission full gate end to end.
- Reset full-gate local state when world/record/flow changes.
- Make every gate label unique and accessible; avoid duplicate names such as "Quiet-domain declaration".
- Add exact final review showing the payload that will be written.
- Decide and implement whether full-gate fact statement updates the living card body. If it does not, make that explicit and require the living fact body to remain safe.
- Ensure gate reports cannot record section text under the wrong heading.
- Include filled full-gate substance in prompt-out packets and advisory-use flows.

Second PRD seed: finish active workflow-shell Propagation.
- Add owed-debt selection, consequence/order/domain controls, disposition controls, surfaced proposal controls, prompt-out controls, and close readiness to the active destination.
- Make close blockers reflect full domain-atlas coverage before any propagation content exists.

Carry-forward prompt PRD seed:
- Resolve P-01/P-02 across Creation and Admission by making prompt identity atomic and enabling Proposal mode for non-premise empty sections.

## For the methodology

No methodology-source finding in this run. The source docs were actionable; the gaps are app encoding, state/reset behavior, and active-flow UI parity.

## Frontier

- Walked to: Propagation entry for `FAC-1` / `DEB-1`.
- Next run resumes at: `/tmp/worldloom-field-build/aftershock-imposter-earth.worldloom.sqlite`, Propagation flow `2`, `factId=3`, `debtId=6`.
- Carried-open findings: P-01, P-02, F-01, P-03, F-02.
- World state: `KER-1` complete; `SEE-1`; `FAC-1` accepted with constraints but living body remains broad; `GAT-1` seed audit; `GAT-2` gate result with unsafe section readback; `DEB-1` propagation debt open; Propagation flow `2` in progress with no consequences, domains, dispositions, report, specialized passes, MVW checkpoint, or QA complete.
