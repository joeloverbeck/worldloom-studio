# Field Build 06 - Divine Routing

**Date:** 2026-07-08 | **App commit:** `b59bec0` | **Method version:** worldbuilding-system 1.1
**Essence (user seed):** A universe where gods act as administrators of different worlds and route some dead people, exceptional or unlucky, into crisis worlds where they receive a boon to make the new life survivable.
**World:** Divine Routing - portal fantasy / divine bureaucracy about second lives that look like rescue but reveal obligation, jurisdiction, scarcity, hidden costs, local resistance, and the moral pressure of gods treating souls as intervention resources. **World file:** `/tmp/worldloom-field-build/worlds/divine-routing.worldloom.sqlite`.
**Path walked:** setup/open -> Creation kernel -> seed decomposition -> Admission severity -> frontloaded seed audit -> full canon gate -> Propagation owed-run entry frontier. **Prior field run:** `reports/field-build-05-affect-ledger.md`.
**Evidence:** live log at `/tmp/worldloom-field-build/build-log.md`; screenshots at `/tmp/worldloom-field-build/screenshots/field-build-06-*.png`; prompt packets, request/response captures, and cold outputs at `/tmp/worldloom-field-build/cold-llm/field-build-06-*`.

## Prior-Art Frame

- Latest canonical field-build baseline: Field Build 05 at app commit `f57d416`.
- Prior blocker set replayed: `F-01` Admission accepted-standing divergence and `F-02` Admission-created propagation debt unable to start from the active Propagation queue.
- Prompt-out friction carried into this run: Field Build 05 `P-01` stale packet identity, `P-04` missing Admission mode selector, `F-03` post-park Creation correction gap, and `Q-01` bounded kernel prompt coverage.
- Broader prior-art surfaces remained reachable for future PRD work: GitHub issues `#109`-`#113`, PRDs/issues `#201`, `#202`, `#204`, `#205`-`#210`, and walkthrough reports such as `reports/prd-249-full-gate-walkthrough.md`, `reports/prd-250-packet-identity-walkthrough.md`, `reports/prd-270-propagation-active-route-replay.md`, and `reports/prd-292-admission-propagation-handoff-replay.md`.

## Findings

### V-01 - Setup and local-file world opening are app-carried. Severity: validation.
- Where: Setup / Workflow map.
- What happened: `pnpm dev` served the app on `http://127.0.0.1:5173/` and API on `http://127.0.0.1:4173`; setup created and opened `/tmp/worldloom-field-build/worlds/divine-routing.worldloom.sqlite`; the workflow map opened with Creation active.
- What methodology requires: a steward must start from a real world file and drive the app's current operating-card path, not reason from docs alone.
- The snag: N/A - validation.
- Evidence: `field-build-06-01-entry-setup.png`; `field-build-06-02-workflow-map-open.png`; setup/server readback in `/tmp/worldloom-field-build/build-log.md`.
- Fix direction: none.
- Touches: setup/open flow.

### V-02 - Premise essence refusal and World-premise pressure are app-carried. Severity: validation.
- Where: Creation / World premise.
- What happened: Proposal mode refused the world essence correctly, reserving the premise to the steward. Pressure mode generated a self-contained packet for `KER-1` / `World premise`; a fresh cold probe challenged over-broad premise jobs, eligibility, divine administration, crisis-world dignity, soul scarcity, boon purpose, and protected unknowns.
- What methodology requires: essence should be steward-authored, while pressure should stress-test load-bearing commitments before the kernel hardens.
- The snag: exact prompt extraction still lacks a simple copy/export affordance, so the packet was saved from element-scoped output after visible identity checks.
- Evidence: `/tmp/worldloom-field-build/cold-llm/field-build-06-world-premise-pressure-prompt.md`; `/tmp/worldloom-field-build/cold-llm/field-build-06-world-premise-pressure.md`; subagent `019f41d0-4017-7d31-a004-6aa37cacd4fe`.
- Fix direction: optional prompt packet export affordance, covered more generally by `P-04`.
- Touches: Creation prompt-out surface.

### V-03 - Kernel sections saved and read back as a coherent starting world. Severity: validation.
- Where: Creation / full kernel.
- What happened: `KER-1` saved all nine kernel sections and `consequence_mode=mixed`. Readback returned the divine routing premise, rescue-with-cost core promise, one-routed-person starting scale, mixed sacred/institutional/ordinary-life consequence mode, five foundational facts, constraints, protected mysteries, six pressure domains, and an ordinary-life anchor around a clerk/officer/healer deciding whether to aid or report the routed outsider.
- What methodology requires: the kernel must constrain future facts before seed decomposition, including consequence mode, protected unknowns, pressure domains, and ordinary-life stakes.
- The snag: N/A - validation.
- Evidence: `field-build-06-04-kernel-complete.png`; `/api/canon-workbench/records/1` readback in the build log.
- Fix direction: none.
- Touches: Creation kernel save/readback.

### V-04 - Seed decomposition writes `SEE-1` / `FAC-1` with provenance and queue handoff. Severity: validation.
- Where: Creation / Seed decomposition.
- What happened: Creation parked `SEE-1` and `FAC-1 · Routable dead can be transferred into crisis worlds`. `FAC-1` was Objective canon / proposed, linked back to `KER-1` and `SEE-1`, and surfaced in the Admission queue.
- What methodology requires: the seed should split into one proposed fact that is narrow enough to admit, preserving sibling work for boons, exact crises, sponsor motives, and local response.
- The snag: prompt packet identity on this screen had stale/mis-bound UI friction; see `P-02`.
- Evidence: `field-build-06-05-seed-decomposition-ready.png`; `field-build-06-06-seed-parked.png`; `/api/admission/queue`; `/api/canon-workbench/records/2`; `/api/canon-workbench/records/3`.
- Fix direction: none for the write path; prompt-out identity fix under `P-02`.
- Touches: Creation seed decomposition and Admission handoff.

### V-05 - Frontloaded seed audit writes an advisory gate result and preserves standing. Severity: validation.
- Where: Admission / Frontloaded seed audit.
- What happened: Admission wrote `GAT-1 Frontloaded seed audit` linked to `FAC-1`; the seed remained proposed, with no admission operation or propagation debt until the full gate completed.
- What methodology requires: seed audit should sharpen the risk and admissibility frame without silently changing canon standing.
- The snag: N/A - validation.
- Evidence: `field-build-06-08-seed-audit-filled.png`; `field-build-06-09-seed-audit-complete.png`; `/api/canon-workbench/records/3`.
- Fix direction: none.
- Touches: Admission seed audit.

### V-REG-01 - Field Build 05 `F-01` is fixed: accepted standing now matches the narrowed gate statement. Severity: validation.
- Where: Admission / severe full canon fact gate.
- What happened: after completing the full gate, `FAC-1` had `canonStatus=accepted with constraints`, operation `constrain`, tags `access-bound`, `cost-bound`, `knowledge-bound`, `time-bound`, `institution-bound`, linked `GAT-2`, proposal history retaining the broader seed wording, and body/current living text equal to the narrowed accepted statement: `A shared divine routing apparatus can transfer a small subset of newly dead persons whose soul-state, timing, crisis fit, and divine jurisdiction make them routable into a receiving world with a declared local crisis.`
- What methodology requires: the accepted living canon statement must be the operative admitted claim, with broader proposal text retained only as history/provenance.
- The snag: N/A - prior blocker closed.
- Evidence: `field-build-06-12-full-gate-exact-payload.png`; `field-build-06-13-admission-complete.png`; `/api/canon-workbench/records/3` readback.
- Fix direction: preserve this Admission write/read contract.
- Touches: `packages/server/src/admission-flow.ts`, Canon Workbench read model, Admission active screen.

### V-REG-02 - Field Build 05 `F-02` is fixed: Admission-created debt starts from the active Propagation queue. Severity: validation.
- Where: Propagation / owed queue and run start.
- What happened: `/api/propagation/queue` returned `DEB-1` with non-null `sourceFact` `FAC-1` and route `POST /api/propagation/runs/start` with `{ factRecordId: 3, debtRecordId: 6 }`. The active UI enabled `Start/Resume Owed Run`; clicking it started `Flow 2`, hydrated source fact, owed debt, severity, required shock-cone orders, required domain-atlas sweep, prompt modes, and close blockers.
- What methodology requires: a propagation debt created by Admission must be resumable from the active Propagation operating-card path, with source, debt, and required coverage visible.
- The snag: N/A - prior blocker closed. Close remained blocked only by real coverage obligations: six shock-cone orders and fourteen unswept domains.
- Evidence: `field-build-06-14-propagation-queue-start-enabled.png`; `field-build-06-15-propagation-run-started.png`; `/api/propagation/queue`; `/api/propagation/runs/2`.
- Fix direction: preserve this queue/start/readback behavior.
- Touches: `packages/server/src/admission-flow.ts`, `packages/server/src/propagation-flow.ts`, active Propagation UI.

### P-01 - Stale prompt packets are safer but still visually prominent after route changes. Severity: prompt-out friction. Mode: proposal/pressure. *Carried/partially fixed from Field Build 05 `P-01`.*
- Where: Creation, Admission, and Propagation loaded Prompt-out status.
- What happened: stale packets are labeled stale/non-current and non-copyable, which preserves safety. However, after navigation from Admission to Propagation, the loaded status area still displayed a large stale Admission packet while the active screen was Propagation.
- What methodology requires: the steward should be able to tell which packet is active for the current decision without reading stale packet identity fields in detail.
- The snag: the app is safe enough to prevent obvious wrong-copy behavior, but the visual hierarchy still spends active-screen space on a prior decision's packet.
- Design verdict: local structural fix - stale-state vocabulary exists, but active and prior packet regions need clearer ownership.
- Recommendation: after flow/record/section/step/mode changes, clear the active prompt region or collapse stale prior packets behind a disclosure titled by their prior origin.
- Repro: load an Admission full-gate prompt, complete Admission, open Propagation, and inspect the loaded Prompt-out panel beside the active Propagation route.
- Fix direction: treat flow, record, section, step, mode, template, packet hash, and body as one active identity; collapse prior identities on navigation.
- Touches: `docs/specs/prompt-out-context-assembly.md`, `packages/web/src/main.tsx`.

### P-02 - Creation seed-decomposition prompt identity can be mis-bound in the visible loaded panel. Severity: prompt-out friction. Mode: proposal. *Extends Field Build 05 `P-01`.*
- Where: Creation / Seed decomposition prompt-out.
- What happened: network request `186` returned the correct decomposition proposal packet: `flowKey=creation`, `stepKey=creation:decomposition_prompt`, `recordId=2`, `recordShortId=SEE-1`, `mode=proposal`, packet hash `4597fc7862daf7a1e542c8819ff72fdc87995ffc1e6cd0354be9507be3f4f157`. The visible loaded status panel marked the just-generated packet as stale with `section Ordinary-life promise` while also showing decomposition `step` and `record 2`.
- What methodology requires: cold prompt probes must receive the exact active packet for the decision point, not a body whose section/step identity disagrees.
- The snag: the server response was usable, but the visible prompt panel undermined trust at the exact point the steward needs packet integrity.
- Design verdict: structural P - this is not just stale visual clutter; the active packet identity can look internally contradictory after section transitions.
- Recommendation: source the loaded prompt status from the same response identity used for the packet body, and hard-fail display when section/step/record/mode do not agree.
- Repro: after completing kernel sections, generate a Creation seed-decomposition Proposal packet and compare the network response identity with the loaded status panel.
- Fix direction: unify prompt identity hydration for Creation section state and decomposition step state.
- Touches: `docs/specs/prompt-out-context-assembly.md`, `docs/specs/creation-flow.md`, `packages/web/src/main.tsx`.

### P-03 - Admission prompt modes are advertised but not user-selectable in the active surface. Severity: prompt-out friction. Mode: proposal. *Carried/still-broken from Field Build 05 `P-04`.*
- Where: Admission / full gate prompt-out.
- What happened: the Admission screen listed Proposal and Pressure as available, but exposed a single `Load Admission Prompt-out Step` action that loaded pressure. Proposal coverage was only possible by calling `/api/prompt-out/generate` directly.
- What methodology requires: every decision point should make available prompt modes reachable from the active, user-facing workflow surface.
- The snag: a steward can see Proposal is available but cannot select it in the active Admission workflow.
- Design verdict: local structural fix - the screen already has prompt-out framing, but lacks the visible mode selector used elsewhere.
- Recommendation: add an Admission prompt mode selector wired to the active step identity, and show selected mode, template, source record, and packet hash beside the load button.
- Repro: select a proposed fact in Admission, inspect available Prompt modes, then inspect controls before loading; there is no Proposal/Pressure selector.
- Fix direction: active Admission prompt-out component and prompt-out contract display.
- Touches: `docs/specs/admission-flow.md`, `docs/specs/prompt-out-context-assembly.md`, `packages/server/src/admission-flow.ts`, `packages/web/src/main.tsx`.

### P-04 - Exact Admission pressure-packet extraction remains operationally fragile. Severity: prompt-out friction. Mode: pressure.
- Where: Admission / full gate pressure prompt-out.
- What happened: the active UI produced a current visible pressure packet with complete draft context (`packet 6ba576d24c545e6424fc31a581ac968a1217152437b14ed1ae7dde87e47daac4`; browser network request `219`). Wrapper redirection of `response-body 219` hung and left an empty file. A separately regenerated server request saved a non-equivalent packet that reported missing written consequence/operation despite the visible packet carrying them, so it was not used for a cold probe.
- What methodology requires: pressure probes must use the exact prompt packet visible for the current draft, especially for unsaved severe-gate state.
- The snag: the app can show the right draft-aware packet, but this field-build could not persist that exact packet to a file through the available browser/network tooling; direct route regeneration produced a different payload.
- Design verdict: structural P for prompt-out evidence workflows - if draft-aware packets depend on browser-local state, the app needs a first-class copy/export route for the exact current packet.
- Recommendation: add a visible `Copy packet` / `Download packet` affordance for the currently displayed packet, and include packet hash plus draft digest in the copied body. Also make direct server regeneration reject or explicitly mark missing draft payload rather than producing a plausible but non-equivalent packet.
- Repro: fill a severe full gate, load Admission Prompt-out, verify the visible packet includes unsaved draft fields, then attempt to capture the exact browser response and compare it with a separately regenerated server request.
- Fix direction: packet export from the active preview and stricter draft-context API semantics.
- Touches: `docs/specs/prompt-out-context-assembly.md`, `packages/server/src/prompt-out.ts`, `packages/web/src/main.tsx`.

### Q-01 - Prompt coverage remains bounded at the Propagation frontier. Severity: question.
- Where: Creation non-premise sections and Propagation entry.
- What happened: this build cold-probed World-premise pressure, Core-promise proposal, Seed-decomposition proposal, and Admission full-gate proposal. It did not pressure every kernel section, did not pressure the exact Admission full-gate packet due `P-04`, and did not exercise Propagation proposal/pressure because the run stopped at Propagation entry.
- What methodology requires: every major decision point should exercise available prompt-out modes unless the frontier or tooling boundary is explicitly recorded.
- The unknown: whether all remaining section-specific and Propagation entry packets are self-contained and correctly bound.
- Evidence: cold files under `/tmp/worldloom-field-build/cold-llm/field-build-06-*`; `field-build-06-15-propagation-run-started.png`.
- Fix direction: next field build should start at Propagation entry and exercise Proposal/Pressure for the first shock-cone/domain decision before authoring consequences.
- Touches: future field-build coverage, prompt-out specs if failures appear.

### F-03 - Creation critique after parking was not meaningfully reverified. Severity: carried friction. *Carried from Field Build 05 `F-03`.*
- Where: Creation / parked seed correction path.
- What happened: this run parked a narrow enough seed and moved to Admission; the cold decomposition proposal recommended additional prerequisite attention, but it did not force a split/retract/recompose decision. No active split/retract/recompose affordance was exercised or disproved.
- What methodology requires: when prompt-out critique reveals bad granularity after parking, the active workflow should offer a correction path rather than relying on docs/operator judgment.
- The snag: not reverified in this run; carry as open because the prior finding was not closed by evidence.
- Design verdict: unchanged from Field Build 05 - structural F with local R.
- Recommendation: after seed prompt-out flags bundling, offer explicit actions: split into sibling facts, retract/rewrite the parked seed, or carry a named Admission narrowing note.
- Repro: not replayed here.
- Fix direction: Creation seed decomposition correction model.
- Touches: `docs/specs/creation-flow.md`, `packages/server/src/creation-flow.ts`, `packages/web/src/main.tsx`.

## Regression of Prior Findings

Gate: `f57d416 -> b59bec0`; HEAD advanced and the app-source working tree was clean before this report was written.

- `F-01` (Admission full-gate completion leaves living card wording divergent from accepted gate substance): fixed -> `V-REG-01`.
  - Repro replayed: declared severe Admission work, completed seed audit, filled full gate with a narrowed fact statement, reviewed exact payload, completed, then compared `FAC-1` card body/current living text/gate result/proposal history. Result: the current living statement and card body match the narrowed accepted statement.
- `F-02` (Admission-created propagation debt visible but cannot start from active owed queue): fixed -> `V-REG-02`.
  - Repro replayed: completed severe Admission with propagation debt, opened Propagation, inspected queue, clicked `Start/Resume Owed Run`, then read `/api/propagation/runs/2`. Result: source fact and route are hydrated; Flow 2 starts and blocks only on real coverage obligations.
- `P-01` (prompt-out identity safer but not atomic): partially fixed / still friction -> `P-01` and `P-02`.
  - Repro replayed through Creation, Admission, and Propagation. Result: stale state is labeled and non-copyable, but stale or mis-bound prompt panels still require manual vigilance.
- `P-04` (Admission prompt modes advertised but not selectable): still-broken -> `P-03`.
  - Repro replayed on Admission full gate. Result: Proposal mode required direct API generation.
- `F-03` (Creation critique after parking has no split/retract/recompose affordance): not meaningfully reverified -> carried as `F-03`.
- `Q-01` (bounded kernel prompt coverage): still bounded -> `Q-01`.

No blocking findings are carried from Field Build 06. The next run can proceed from Propagation entry rather than being forced back to Admission.

## Decision-Point Log

### Setup / Open World
- Docs-first draft: create a new world file for the divine-routing seed and drive the setup workflow live.
- Prompt-out coverage: proposal=N/A; pressure=N/A.
- Committed: `/tmp/worldloom-field-build/worlds/divine-routing.worldloom.sqlite`.
- UX/style verdict: ok.
- Obsolescence verdict: docs-obsolete for setup/open.

### Kernel / World Premise
- Docs-first draft: after death, selected souls enter a divine interworld routing system and may be sent into crisis worlds with boons; the world tests scarcity, bureaucracy, sacred authority, and outsider intervention rather than consequence-free wish fulfillment.
- Prompt-out coverage: proposal=refused correctly for essence; pressure=exercised with `/tmp/worldloom-field-build/cold-llm/field-build-06-world-premise-pressure-prompt.md`, output `/tmp/worldloom-field-build/cold-llm/field-build-06-world-premise-pressure.md`, subagent `019f41d0-4017-7d31-a004-6aa37cacd4fe`.
- Cold LLM pressure: useful; challenged the breadth of divine administration, selection, scarcity, boon purpose, and protected unknowns.
- Committed: `KER-1` World premise and mixed consequence mode.
- UX/style verdict: ok with extraction friction.
- Obsolescence verdict: mostly docs-obsolete for the active authoring step.

### Kernel / Remaining Sections
- Docs-first draft: rescue-with-cost core promise; start with one newly dead routed person, one briefing god, and one receiving planet; make routing, eligibility, briefing, boon, and receiving-world autonomy separate constraints/pressures; preserve mysteries around the routing apparatus, non-routed dead, divine motives, outsider necessity, and boon cost.
- Prompt-out coverage: proposal=exercised for empty Core promise with `/tmp/worldloom-field-build/cold-llm/field-build-06-core-promise-proposal-prompt.md`, output `/tmp/worldloom-field-build/cold-llm/field-build-06-core-promise-proposal.md`, subagent `019f41d3-5e05-7a82-be40-c2eed71bfb51`; pressure=representative World-premise pressure only.
- Cold LLM proposal: useful; offered outsider-reassignment, divine-administration, cost-of-intervention, and rescue-with-hidden-cost axes.
- Committed: all nine `KER-1` sections.
- UX/style verdict: ok.
- Obsolescence verdict: app carried save/readback; docs still supplied strict prompt-coverage discipline.

### Seed Decomposition / FAC-1
- Docs-first draft: isolate the routing capability itself, not boons, exact crisis worlds, sponsor motives, or local response.
- Prompt-out coverage: proposal=exercised from network response due `P-02`, saved at `/tmp/worldloom-field-build/cold-llm/field-build-06-seed-decomposition-proposal-prompt.md`, output `/tmp/worldloom-field-build/cold-llm/field-build-06-seed-decomposition-proposal.md`, subagent `019f41dc-a9a3-7db3-ba57-5e32b69b577b`; pressure=deferred because frontier moved.
- Cold LLM proposal: useful; identified `routable` as the load-bearing hidden term and flagged eligibility, death-state, mechanism, crisis-world category, local recognition, cost/capacity, timing, crossing, identity, and consent.
- Committed: `SEE-1 Seed decomposition`; `FAC-1 Routable dead can be transferred into crisis worlds`, Objective canon, proposed.
- UX/style verdict: local R / structural P due packet identity mismatch.
- Obsolescence verdict: docs still needed for packet-integrity validation.

### Admission / Severity and Seed Audit
- Docs-first draft: classify `FAC-1` as severe because it defines cross-world transfer eligibility, divine jurisdiction, death handling, crisis declaration, scarcity, and the first institution-level handoff.
- Prompt-out coverage: proposal=deferred until full gate; pressure=not separate at severity step.
- Committed: `admission_level=4`, `work_scale=severe`, linked `GAT-1 Frontloaded seed audit`.
- UX/style verdict: ok.
- Obsolescence verdict: docs-obsolete for severity/audit execution.

### Admission / Full Canon Fact Gate
- Docs-first draft: accept with constraints only the fact that a small subset of newly dead persons can be transferred when soul-state, timing, crisis fit, and divine jurisdiction align; preserve mechanism, local recognition, boon details, cost/capacity, consent, and sponsor motive as follow-up pressure.
- Prompt-out coverage: proposal=exercised through `/api/prompt-out/generate` because active UI lacked a mode selector, saved at `/tmp/worldloom-field-build/cold-llm/field-build-06-admission-full-gate-proposal-prompt.md`, output `/tmp/worldloom-field-build/cold-llm/field-build-06-admission-full-gate-proposal.md`, subagent `019f41e4-b1e2-7a20-ab6f-19a6a8e7577a`; pressure=probe unavailable because exact current packet could not be persisted and direct regeneration was non-equivalent.
- Cold proposal: useful; pressed scarcity, jurisdiction, crisis-declaration abuse, cost, consent, and quiet-domain risk.
- Committed: `FAC-1` accepted with constraints; `GAT-2`; `DEB-1`.
- UX/style verdict: strong final review/readback; prompt-mode and extraction friction remain under `P-03` / `P-04`.
- Obsolescence verdict: app carried the gate after fields were filled; docs still needed for cold-probe discipline.

### Propagation / Owed Run Entry Frontier
- Docs-first draft: start the owed propagation run from `FAC-1` / `DEB-1`, confirm full shock-cone/domain-atlas obligations, and stop before authoring consequences.
- Prompt-out coverage: proposal=available but deferred; pressure=available but deferred.
- Committed: `Flow 2`, state `in_progress`, current step `propagation:entry`, severity `4 / severe`, required coverage full domain-atlas sweep, shock-cone orders zeroth through fifth, all fourteen domain-atlas domains unswept.
- UX/style verdict: ok for run entry; stale prior prompt panel remains friction.
- Obsolescence verdict: docs-obsolete for starting/resuming the owed run and seeing coverage obligations. Docs still needed for the next full propagation pass.

## For the App

Admission/full-gate:
- Preserve the fixed standing contract from `V-REG-01`: current living text/body must reflect the accepted narrowed statement, while proposal text remains history.
- Add a visible Admission prompt mode selector wherever the screen advertises both Proposal and Pressure.

Propagation:
- Preserve the fixed queue/start contract from `V-REG-02`: Admission-created debts must return `sourceFact`, expose a start route, and hydrate source/debt/run state after start.
- Next app parity pressure should move into actual shock-cone and domain-atlas authoring.

Prompt-out:
- Make prompt identity atomic across flow, record, section, step, mode, template, packet hash, and body.
- Collapse stale packets on route/decision changes.
- Add first-class copy/download for the exact currently displayed packet, especially for draft-aware Admission and Propagation packets.

Creation refinement:
- Carry Field Build 05 `F-03` until a run either closes it or a PRD adds split/retract/recompose after post-park critique.

## For the Methodology

No methodology-source finding in this run. The docs and field-build skill were actionable; the remaining gaps are app encoding, prompt-out identity/export, Admission mode reachability, and next-step Propagation coverage.

## Frontier

- Walked to: Propagation `Flow 2`, current step `propagation:entry`, after starting the owed run for `FAC-1` / `DEB-1`.
- Next run resumes at: `/tmp/worldloom-field-build/worlds/divine-routing.worldloom.sqlite`, Propagation run id `2`, source fact `FAC-1` record id `3`, owed debt `DEB-1` record id `6`.
- Next first checks: verify `/api/propagation/runs/2` still returns `state=in_progress`, `sourceFact=FAC-1`, `owedDebt=DEB-1`, required shock-cone orders zeroth through fifth, and all fourteen domain-atlas domains unswept; then exercise Propagation Proposal/Pressure before authoring the first shock-cone consequence.
- Carried-open non-blocking findings: `P-01`, `P-02`, `P-03`, `P-04`, `F-03`, `Q-01`.
- Carried blocking findings: none.
- World state: `KER-1` complete; `SEE-1`; `FAC-1` accepted with constraints; `GAT-1` seed audit; `GAT-2` full-gate result; `DEB-1` open; `Flow 2` in progress at Propagation entry; no shock-cone consequence, domain-atlas disposition, specialized pass, MVW checkpoint, or QA pass authored yet.
