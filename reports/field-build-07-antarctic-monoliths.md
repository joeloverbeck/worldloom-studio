# Field Build 07 - Antarctic Monoliths

**Date:** 2026-07-08 · **App commit:** `defd3f8` · **Method version:** worldbuilding-system 1.1  
**Essence (user seed):** In an alternate 1950s, Antarctic researchers uncover passages to miles-deep monolithic architecture with strange remains and language-like traces, while the U.S. tries to block foreign access.  
**World:** Antarctic Monoliths - Cold War polar discovery about disciplined awe under containment, where interpretation, logistics, scientific openness, secrecy, and rival access claims grind against an underground mystery. **World file:** `/tmp/worldloom-field-build/worlds/antarctic-monoliths.worldloom.sqlite`.  
**Path walked:** setup/open -> Creation kernel -> seed decomposition -> Admission frontier. **Prior runs:** none for this seed; latest canonical run baseline `reports/field-build-06-divine-routing.md`.  
**Evidence:** screenshots at `/tmp/worldloom-field-build/screenshots/field-build-07-*.png`; cold prompt packets and outputs at `/tmp/worldloom-field-build/cold-llm/field-build-07-*.md`; live log at `/tmp/worldloom-field-build/build-log.md`.  
**Prior-art frame:** Findings confirm/extend issues #109-#113, PRDs #201/#202/#204/#205-#210, and prior field/parity reports. The stale-packet and packet-export findings confirm Field Build 06 `P-01`/`P-02`/`P-04` and PRD #250's packet-identity surface. The post-park correction gap confirms Field Build 05/06 `F-03` and relates to issue #112 / PRD #202's MVW and Creation-coverage concerns. The decomposition packet-context gap extends PRD #204 and `prompt-out-context-assembly.md` cold-packet criteria. All named GitHub surfaces were reachable via `gh`; local field/parity reports were reachable.

## Findings

### V-01 - Setup and world-file opening are app-carried. Severity: validation.
- Where: Setup / Workflow map.
- What happened: `pnpm dev` served API at `http://127.0.0.1:4173` and the app UI at `http://127.0.0.1:5174` because `5173` belonged to another repo. The setup screen created `/tmp/worldloom-field-build/worlds/antarctic-monoliths.worldloom.sqlite`; `/api/workflow-map` read back that world path with Creation active.
- What the methodology requires: A real local world file must be opened before walking the operating-card path.
- The snag: N/A - validation.
- Fix direction: none.
- Touches: setup/open flow, T-1/T-7 local-first runtime.

### V-02 - World-premise essence refusal and pressure are app-carried. Severity: validation.
- Where: Creation / World premise.
- What happened: Proposal mode refused the essence correctly. Pressure mode generated a packet for `KER-1`, selected section `World premise`, mode `pressure`, packet `0404c0afb551d45b17c93fe8806898235ce846b528c8142dc38d4bffa5b57a93`; cold subagent `019f4278-7b09-73e0-918b-aab0213e0753` gave useful pressure on starting scale, consequence mode, U.S.-centring, and protected unknowns.
- What the methodology requires: Essence is steward-authored; pressure challenges steward material without writing canon.
- The snag: N/A - validation; extraction friction is `P-04`.
- Fix direction: preserve World-premise proposal refusal and selected-section pressure context.
- Touches: `docs/specs/creation-flow.md`, `docs/specs/prompt-out-context-assembly.md`, W-1.

### V-03 - Full kernel authoring saves and reads back coherently. Severity: validation.
- Where: Creation / Kernel sections.
- What happened: `KER-1` readback returned all nine kernel sections and `consequence_mode=mixed`: premise, core promise, starting scale, genre/tone/mode commitments, foundational facts, constraints, mysteries, pressure domains, and ordinary-life anchor. Screenshot: `field-build-07-08-kernel-complete.png`.
- What the methodology requires: A lean kernel with consequence mode, pressures, protected unknowns, seed facts, constraints, and ordinary life before seed decomposition.
- The snag: N/A - validation.
- Fix direction: preserve section save/readback and explicit consequence-mode facet behavior.
- Touches: `docs/specs/creation-flow.md`, `docs/worldbuilding-system/05_creation_protocol.md`.

### V-04 - Seed decomposition writes `SEE-1` and `FAC-1` with Admission handoff. Severity: validation.
- Where: Creation / Seed decomposition.
- What happened: Creation wrote `SEE-1 Seed decomposition` and proposed `FAC-1 Antarctic passages open into artificial-looking monolithic complex`; `FAC-1` had derived-from links to `KER-1` and `SEE-1`, and `/api/workflow-map` changed Creation to `done`, Admission to `active`, and Admission queue count to `1`.
- What the methodology requires: Creation parks proposed seeds; Admission owns first canon standing.
- The snag: N/A for write/readback; the cold critique and correction gap are `F-03`.
- Fix direction: preserve write/readback and handoff behavior.
- Touches: Creation seed decomposition, Admission queue.

### P-01 - Stale prompt packets remain visually dominant after section changes. Severity: prompt-out friction. Mode: proposal/pressure. *Carried/confirmed from Field Build 06 `P-01`/`P-02`.*
- Where: Creation / Prompt-out loaded status.
- What happened: After moving from World premise pressure to Core promise and later from Core promise proposal to Ordinary-life promise, the old packet was correctly labeled stale and non-copyable, but the stale packet body still occupied a large visible region below the active decision. Screenshots: `field-build-07-06-core-promise-proposal-ready.png`, `field-build-07-08-kernel-complete.png`.
- What the methodology requires: The active packet for the current decision should be visually unambiguous.
- The snag: Safety improved, but stale prior packets still dominate the active workflow.
- Design verdict: local structural fix - stale-state guardrails exist, but the visual hierarchy still over-promotes prior packets.
- Recommendation: collapse stale packet bodies behind a disclosure after section/step changes and keep only compact prior-origin metadata visible.
- Repro: load a Creation World-premise pressure packet, switch the selected kernel section to Core promise, then inspect the loaded prompt status and stale packet body.
- Fix direction: Prompt-out lifecycle display in `packages/web/src/main.tsx`.
- Touches: `docs/specs/prompt-out-context-assembly.md`, PRD #250.

### P-04 - Exact prompt packet export is still operationally fragile. Severity: prompt-out friction. Mode: proposal/pressure. *Extends Field Build 06 `P-04`.*
- Where: Creation / Prompt-out packet extraction.
- What happened: The active UI loaded packets, but Playwright DOM extraction and `response-body` routes hung or produced zero-byte files. Exact artifacts were saved through a diagnostic direct API route with local Node escalation, e.g. `field-build-07-world-premise-pressure-prompt.md`, `field-build-07-core-promise-proposal-prompt.md`, and `field-build-07-seed-decomposition-proposal-prompt.md`.
- What the methodology requires: The steward should be able to copy/export the exact current packet from the active surface for a cold LLM.
- The snag: The app can generate the right packet, but field evidence still depends on diagnostic/API tooling rather than a first-class visible copy/download.
- Design verdict: structural P - exact current-packet export is part of W-1 field use, not only test tooling.
- Recommendation: add visible `Copy packet` / `Download packet` on the current prompt body and include packet identity/hash in the copied artifact.
- Repro: load a Creation prompt-out step, then attempt to save the exact active packet from the visible surface without using direct API regeneration.
- Fix direction: Prompt-out preview component and packet lifecycle actions.
- Touches: `docs/specs/prompt-out-context-assembly.md`, PRD #204, PRD #250.

### P-05 - Seed-decomposition proposal packet omits parked seed body and full kernel context. Severity: prompt-out friction. Mode: proposal.
- Where: Creation / Seed decomposition Prompt-out.
- What happened: The visible post-park screen showed `FAC-1` body in its context preview, but the generated packet for `SEE-1` only carried the decomposition report, parked seed title, granularity rationale, and thin-start boundary. It did not include the actual `FAC-1` body or full `KER-1` section content. Cold subagent `019f42ce-9df2-76e2-84e9-7f93d475e690` still produced a useful bundle critique, but it could not quote or audit the seed body.
- What the methodology requires: Decomposition packets after seed parking carry the report, exact parked seeds, seed bodies, governance status, supporting kernel context, and explicit omissions.
- The snag: Screen/packet parity breaks at a decision point where the exact seed body matters.
- Design verdict: structural P - the packet assembly is missing decision-bearing material.
- Recommendation: include every parked seed's title, body, truth layer, status, provenance links, and relevant kernel section excerpts in `decomposition_pressure` packets; if omitted, name why.
- Repro: park `FAC-1`, load/generate Creation decomposition proposal for `SEE-1`, compare visible `Context preview` to `field-build-07-seed-decomposition-proposal-prompt.md`.
- Fix direction: Creation decomposition prompt context assembly.
- Touches: `docs/specs/prompt-out-context-assembly.md`, `docs/specs/creation-flow.md`, PRD #204.

### F-03 - Post-park critique still has no visible split/retract/recompose path. Severity: blocking. *Carried/still-broken from Field Build 05/06 `F-03`.*
- Where: Creation / after seed parking.
- What happened: The cold decomposition proposal correctly challenged `FAC-1` as still bundled. The active Creation surface had already parked the seed and foregrounded Admission handoff; it did not expose split, retract, recompose, or replace actions for the parked seed.
- What the methodology requires: If prompt-out critique shows bad granularity after parking, the steward needs a governed correction path before Admission.
- The snag: The responsible next action is to stop, not push the bad seed through Admission.
- Design verdict: redesign candidate - this is not copy polish; the flow structure assumes forward motion after parking and lacks an explicit correction loop.
- Recommendation: add a post-park correction panel with actions to split into sibling facts, retract/rewrite the parked seed, or carry a named Admission narrowing note, with readback/provenance.
- Repro: park a seed bundling passage discovery, apparent artificiality, and monolithic-complex scale; load decomposition proposal; cold critique flags bundling; inspect active Creation handoff for correction actions.
- Fix direction: Creation seed decomposition correction model in spec/server/web.
- Touches: `docs/specs/creation-flow.md`, `packages/server/src/creation-flow.ts`, `packages/web/src/main.tsx`, issue #112 / PRD #202 context.

### Q-01 - Prompt coverage remains bounded. Severity: question.
- Where: Creation / kernel and seed decomposition.
- What happened: This run cold-probed World-premise pressure, Core-promise proposal, and Seed-decomposition proposal. It did not cold-probe every kernel section in both modes, and decomposition pressure was deferred because the proposal critique stopped the run.
- What the methodology requires: Every reached decision point should exercise proposal and pressure unless the frontier or tooling boundary is explicitly recorded.
- The snag: N/A - question.
- Fix direction: Next run should resume after the correction path is available, then exercise corrected seed decomposition pressure and Admission modes.
- Touches: field-build coverage ledger, W-1.

## Regression of prior findings

Gate: `b59bec0 -> defd3f8`; HEAD advanced. Baseline worktree had no `apps/` or `packages/` dirt, but unrelated skill/report dirt existed before this run. Field Build 06 had no carried blocking findings, so no mandatory blocker replay was owed.

- `P-01` / `P-02` (stale or mis-bound prompt identity): still friction -> `P-01`.
  - Repro replayed: loaded one Creation packet, changed kernel section, observed stale prior packet body and status. Result: safe/non-current labeling holds, but visual dominance remains.
- `P-03` (Admission prompt modes not active-selectable): not-reverifiable-this-run.
  - Repro replayed: not reached; run stopped at Admission frontier before selecting `FAC-1`.
- `P-04` (exact packet extraction fragile): still friction -> `P-04`.
  - Repro replayed: Creation prompt packets required diagnostic API extraction; active UI had no reliable exact export.
- `F-03` (post-park critique has no split/retract/recompose affordance): still-broken -> `F-03`.
  - Repro replayed: cold decomposition probe challenged the parked seed as bundled; no active correction route was visible.
- `Q-01` (bounded prompt coverage): still bounded -> `Q-01`.
  - Repro replayed: representative probes ran, but not all modes/sections were exercised.

## Decision-point log (evidence)

### Setup / Open World
- Docs-first draft: create a new world file and drive setup live.
- Prompt-out coverage: proposal=N/A; pressure=N/A.
- Cold LLM: N/A.
- Committed: `/tmp/worldloom-field-build/worlds/antarctic-monoliths.worldloom.sqlite`.
- UX/style verdict: ok.
- Obsolescence verdict: docs-obsolete (V-01).

### Kernel / World Premise
- Docs-first draft: alternate 1950s Antarctic monolith discovery becomes a Cold War access crisis around technological/language-like finds.
- Prompt-out coverage: proposal=refused; pressure=exercised via `/tmp/worldloom-field-build/cold-llm/field-build-07-world-premise-pressure-prompt.md`, output `/tmp/worldloom-field-build/cold-llm/field-build-07-world-premise-pressure.md`, subagent `019f4278-7b09-73e0-918b-aab0213e0753`.
- Cold LLM (pressure): useful; challenged missing scale/mode clarity, premature technology/language certainty, U.S.-centring, and protected unknowns.
- Committed: revised premise preserving "seem technological and linguistic" as interpretation, plus `consequence_mode=mixed`.
- UX/style verdict: ok with extraction friction.
- Obsolescence verdict: mostly docs-obsolete (V-02); docs still needed for exact evidence discipline (P-04).

### Kernel / Remaining Sections
- Docs-first draft: site-first scale, material-institutional primary mode, restrained dread, explicit constraints/mysteries/pressures, and ordinary-life radio/electrical maintenance anchor.
- Prompt-out coverage: proposal=exercised for Core promise via `/tmp/worldloom-field-build/cold-llm/field-build-07-core-promise-proposal-prompt.md`, output `/tmp/worldloom-field-build/cold-llm/field-build-07-core-promise-proposal.md`, subagent `019f42c0-8457-7472-b3e5-9f7538c58845`; pressure=deferred except representative World-premise pressure.
- Cold LLM (proposal): useful; proposed discovery-under-monopoly, language/technology pressure, and institutional-strain axes.
- Committed: all nine `KER-1` sections; readback from `/api/canon-workbench/records/1`.
- UX/style verdict: ok for authoring, local R/P for stale prompt status.
- Obsolescence verdict: app carried save/readback (V-03); docs still needed for bounded coverage accounting (Q-01).

### Seed Decomposition / FAC-1
- Docs-first draft: isolate the first site-discovery fact and keep depth, apparent technology, language-like traces, and U.S. access control as siblings.
- Prompt-out coverage: proposal=exercised via `/tmp/worldloom-field-build/cold-llm/field-build-07-seed-decomposition-proposal-prompt.md`, output `/tmp/worldloom-field-build/cold-llm/field-build-07-seed-decomposition-proposal.md`, subagent `019f42ce-9df2-76e2-84e9-7f93d475e690`; pressure=deferred because frontier moved.
- Cold LLM (proposal): useful and challenging; it said the parked seed was still bundled and should split passage discovery, apparent artificiality, consequence pressure, and monolithic/complex scale.
- Committed: `SEE-1` and `FAC-1` proposed with derived-from links to kernel/report.
- UX/style verdict: redesign candidate for post-park correction path.
- Obsolescence verdict: docs still needed; app parks and hands off, but does not provide a corrective route after prompt critique (F-03, P-05).

## For the app (PRD seeds)

Prompt-out lifecycle and export:
- Confirming/extending prior art: confirms Field Build 06 `P-01`/`P-04`, PRD #204, and PRD #250.
- Scope: local structural fix plus one export affordance. Collapse stale packets after active-decision changes and add first-class copy/download for exact current packets.

Creation decomposition packet context:
- New/extends prior art: extends PRD #204's cold-packet criteria into post-park seed decomposition.
- Scope: server prompt assembly. Include parked seed bodies, statuses, links, and relevant kernel sections in `decomposition_pressure`; keep screen/packet parity.

Creation post-park correction:
- Confirming prior art: confirms Field Build 05/06 `F-03` and connects to #112 / PRD #202's Creation coverage concerns.
- Scope: redesign candidate. Add a correction loop after prompt critique: split, retract/rewrite, replace, or carry an explicit Admission narrowing note.

## For the methodology

No methodology-source `M` finding. The docs clearly supported stopping before Admission when decomposition pressure showed the first seed was still bundled. The gap is app encoding, not source doctrine.

## Frontier

- Walked to: Creation complete; Admission active with `FAC-1` proposed, but Admission not started.
- Next run resumes at: `/tmp/worldloom-field-build/worlds/antarctic-monoliths.worldloom.sqlite`, Admission queue item `FAC-1` record id `3`; first re-check should be whether a Creation split/retract/recompose path exists for the bundled seed.
- Carried-open findings: `P-01`, `P-04`, `P-05`, `F-03`, `Q-01`; `P-03` not-reverifiable this run.
- World state: `KER-1` complete; `SEE-1`; `FAC-1` proposed in Admission queue; no Admission audit/gate, propagation, conditional pass, MVW checkpoint, or QA pass authored.
