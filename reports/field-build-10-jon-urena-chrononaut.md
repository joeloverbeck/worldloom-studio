# Field Build 10 — Jon Ureña Chrononaut

**Date:** 2026-07-09  ·  **App commit:** `914126b`  ·  **Method version:** worldbuilding-system 1.1
**Essence (user seed):** Jon Ureña is a biologically anomalous, immortal, invulnerable time traveler whose private obsessions keep colliding with history.
**World:** Jon Ureña Chrononaut — one private actor can keep returning to history, while ordinary people and institutions absorb the residue. **World file:** `/tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite`.
**Path walked:** setup/open world → workflow map → Creation kernel complete → World premise pressure packet/cold probe → revised premise. **Prior runs:** none for this seed; latest canonical run was `reports/field-build-09-the-bloom.md`.
**Evidence:** screenshots at `/tmp/worldloom-field-build/screenshots/field-build-10-*.png`; prompt packet/output and readbacks at `/tmp/worldloom-field-build/cold-llm/field-build-10-*.md|json`.
**Prior-art frame:** Findings are framed against issues #109-#113, PRDs #201/#202/#204/#205-#210, `docs/methodology-coverage.md`, and prior field/parity reports. `P-01` confirms a prior field-build gap is fixed; `R-01` extends the Field Build 09 MVW ordering gap on the same Creation surface.

## Findings

### V-01 — Setup and empty-world workflow map are app-carried

Severity: validation
- Where: Setup/open world and Workflow map / `workflow-map-and-navigation.md`
- What happened: Setup showed server/catalog status and a visible SQLite world path control; creating `/tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite` opened the map with Creation active, Start Creation foregrounded, later stages not yet earned, and Admission queue `0`. Evidence: `/tmp/worldloom-field-build/screenshots/field-build-10-01-entry-setup.png`, `/tmp/worldloom-field-build/screenshots/field-build-10-02-workflow-map-open.png`.
- What the methodology requires: local-first world-file ownership and map-as-home orientation before method work.
- The snag: N/A - validation finding.
- Fix direction: N/A - no fix.
- Touches: `docs/specs/workflow-map-and-navigation.md`, `data-principles.md` P-6/W-5/W-6, ADR 0001/0002.

### V-02 — Prior `P-01` stale kernel prompt preview is fixed

Severity: validation
- Where: Creation Prompt-out / `creation-flow.md` and `prompt-out-context-assembly.md`
- What happened: After saving Ordinary-life promise last, switching to `World premise` and `Pressure mode` refreshed the preview to World premise and enabled `Load Creation Prompt-out Step` without a no-op save. Evidence: `/tmp/worldloom-field-build/screenshots/field-build-10-05-p01-world-premise-pressure-fixed.png`.
- What the methodology requires: selected-section prompt packets must track the active decision point and mode.
- The snag: N/A - validation finding.
- Fix direction: N/A - previous finding fixed.
- Touches: Field Build 09 `P-01`, `creation-flow.md`, `prompt-out-context-assembly.md`, W-1.

### V-03 — Kernel authoring and readback carried the Phase 1 kernel

Severity: validation
- Where: Creation / `05_creation_protocol.md` Phase 1
- What happened: All nine kernel sections were saved through visible controls with explicit `hard speculative` consequence mode; server readback showed `KER-1`, the `consequence_mode` facet, and all section bodies. Evidence: `/tmp/worldloom-field-build/screenshots/field-build-10-04-kernel-complete.png`, `/tmp/worldloom-field-build/cold-llm/field-build-10-kernel-readback-after-pressure-revision.json`.
- What the methodology requires: a lean kernel with premise, promise, scale, consequence mode, facts, constraints, mysteries, pressures, and ordinary-life anchor.
- The snag: N/A - validation finding.
- Fix direction: N/A - no fix.
- Touches: `docs/worldbuilding-system/05_creation_protocol.md`, `docs/specs/creation-flow.md`, W-8/W-9.

### V-04 — World premise pressure packet passed the cold-LLM probe

Severity: validation
- Where: Creation Prompt-out, World premise pressure / `20_ai_assisted_workflow.md`
- What happened: The exact pressure packet was saved at `/tmp/worldloom-field-build/cold-llm/field-build-10-world-premise-pressure-prompt.md`; its body hash matched the visible loaded prompt body hash. Cold subagent `019f46b6-6f2a-7801-97f3-14f4f905b346` received only that packet and returned useful pressure without assigning canon standing. Output: `/tmp/worldloom-field-build/cold-llm/field-build-10-world-premise-pressure.md`.
- What the methodology requires: pressure mode challenges steward-authored material while preserving advisory/canon boundaries.
- The snag: N/A - validation finding.
- Fix direction: N/A - no fix.
- Touches: `docs/specs/prompt-out-context-assembly.md`, `docs/worldbuilding-system/20_ai_assisted_workflow.md`, W-1.

### R-01 — Not-yet-owed Minimal Viable World checkpoint still dominates early Creation

Severity: friction
- Where: Creation screen before seed decomposition / `creation-flow.md` and `workflow-map-and-navigation.md`
- What happened: In a new world and again after kernel completion, a full Minimal Viable World checkpoint panel rendered above Kernel authoring and Seed decomposition. It was correctly labeled `not owed`, but displayed a full decision contract, controls, signals, prompt blockers, and disabled actions before the active Creation work. Evidence: `/tmp/worldloom-field-build/screenshots/field-build-10-03-creation-entry.png`, `/tmp/worldloom-field-build/screenshots/field-build-10-04-kernel-complete.png`.
- What the methodology requires: before admitted seed evidence exists, Creation should foreground kernel and then seed decomposition; MVW is not earned until admitted seeds exist.
- The snag: the state is correct, but the visual order still makes a future checkpoint feel like current work.
- Design verdict: local polish - the underlying state grammar is right, but the not-current panel is too expanded and too high in the page.
- Recommendation: collapse or move the not-yet-earned MVW checkpoint below kernel/decomposition until admitted seed evidence exists; keep a compact status line and unlock reason only.
- Fix direction: `packages/web/src/main.tsx` Creation layout and `docs/specs/creation-flow.md` browser presentation expectations.
- Touches: Field Build 09 `R-01`, PRD #202, W-8/W-10.

## Regression of prior findings

Gate: `819fc3d` → `914126b`; HEAD advanced and no `apps/`/`packages/` worktree dirt was present at bootstrap.

- `P-01` (kernel prompt preview could remain bound to previous section): fixed → V-02.
  - Repro replayed: saved the last kernel section as Ordinary-life promise, selected `World premise`, selected `Pressure mode`, and checked preview/load state. Result: preview identified World premise, did not show Ordinary-life promise, and load button was enabled. Evidence: `/tmp/worldloom-field-build/screenshots/field-build-10-05-p01-world-premise-pressure-fixed.png`.
- `R-01` (not-yet-earned MVW checkpoint dominates early Creation): still-broken / extended.
  - Repro replayed: entered Creation before any kernel and after kernel completion. Result: full MVW checkpoint still renders before active kernel/decomposition work. Evidence: `/tmp/worldloom-field-build/screenshots/field-build-10-03-creation-entry.png`, `/tmp/worldloom-field-build/screenshots/field-build-10-04-kernel-complete.png`.

## Decision-point log (evidence)

### Setup/open world

- Stage / decision point: Setup/open world.
- Docs-first draft: create a stable local world file for the Jon Ureña seed at `/tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite`.
- Prompt-out coverage: proposal=N/A - no prompt-out owed; pressure=N/A - no prompt-out owed.
- Cold LLM (proposal): N/A.
- Cold LLM (pressure): N/A.
- Committed: created and opened the world file.
- UX/style verdict: ok.
- Obsolescence verdict: docs-obsolete (V-01) - setup and map carried the decision.

### Creation / World premise and kernel authoring

- Stage / decision point: Creation kernel, with World premise pressure exercised and the remaining kernel sections authored as a coherent kernel block.
- Docs-first draft: a hard speculative secret-history world where Jon Ureña's unique time travel, anti-aging, and invulnerability force history to absorb one obsessive private actor's interventions.
- Prompt-out coverage: proposal=refused for World premise essence; pressure=active exercised with prompt `/tmp/worldloom-field-build/cold-llm/field-build-10-world-premise-pressure-prompt.md`, output `/tmp/worldloom-field-build/cold-llm/field-build-10-world-premise-pressure.md`, subagent `019f46b6-6f2a-7801-97f3-14f4f905b346`. Other section-specific kernel prompt modes were deferred because the run stopped at a stable kernel-complete frontier.
- Cold LLM (proposal): refused - essence.
- Cold LLM (pressure): useful pressure; it challenged premise density, the dominance of "immortal and invulnerable", sunken-continent prominence, exact-date overload, and accountability framing.
- Committed: `KER-1` with all nine sections and revised World premise: "On modern Earth, Jon Ureña is the only known human who can keep returning to the past: a neurologically anomalous time traveler whose anti-aging chemistry and future spinal implant let his body survive almost anything while history, evidence, institutions, and ordinary people absorb the damage and mercy of his obsessions."
- UX/style verdict: local R - active kernel work is usable, but the MVW checkpoint panel remains too prominent while not owed.
- Obsolescence verdict: mostly docs-obsolete for kernel authoring and prompt-out; docs still needed for judging stable-frontier scope and for deciding how to decompose the dense seed next → R-01 remains.

Kernel coverage table is in `/tmp/worldloom-field-build/build-log.md`; World premise pressure was exercised, World premise proposal was refused correctly, and other section-specific modes are marked `deferred because frontier moved`.

## For the app (PRD seeds)

- **Creation layout polish (extends Field Build 09 `R-01`; confirms PRD #202 is state-correct but presentation-heavy):** collapse or move the not-yet-earned MVW checkpoint until admitted seed evidence exists. This is local polish, not a flow redesign.
- **Creation prompt-out section binding (confirms prior `P-01` fixed):** no PRD seed needed unless future runs find a neighboring stale-state edge.

## For the methodology

N/A - no methodology-source findings landed in this run. The method files were sufficient for kernel authoring and for stopping at a stable frontier.

## Frontier

- Walked to: Creation kernel complete for Jon Ureña Chrononaut; World premise pressure prompt exercised and cold-probed; premise revised and read back.
- Next run resumes at: Creation seed decomposition in `/tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite`.
- Carried-open findings: `R-01` still-broken / extended. No carried blocking findings.
- World state: `KER-1` exists with `consequence_mode=hard speculative`; Admission queue is `0`; workflow map next decision is Seed decomposition owed.
