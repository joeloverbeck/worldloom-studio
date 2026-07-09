# Workflow Map and Navigation Spec

This spec defines the cross-flow orientation grammar for guided workflows. It is downstream of `docs/principles/guided-workflow-usability.md`, `docs/principles/workflow-principles.md`, `docs/principles/data-principles.md`, and the flow specs.

The workflow map is not a gamified dashboard and not a project-management layer. It is a compact answer to: where am I in the method, why am I here, what blocks me, and what happens next?

## Journey Model

The map renders the operating card's method journey, not a loose list of app features.

1. **Creation**: start with a lean `world_kernel`, decompose seeds until each can be independently rejected without destroying its siblings, then, after Admission has admitted seed evidence, work the non-generative Minimal Viable World checkpoint.
2. **Frontloaded seed audit and Admission**: after Creation parks proposed seeds, the frontloaded seed audit and Canon Fact Admission govern first canon standing. Admission is the only path from proposed fact to canon standing.
3. **Propagation**: major facts owe shock-cone work, consequence dispositions, and stopping-rule judgments.
4. **Conditional passes**: constraint composition, Temporal/Timeline, and the institutional/economic/suppression pass appear as "when facts apply" work, never as false universal prerequisites.
5. **Contradiction/retcon/mystery**: contradiction pressure, repair work, and mystery-preservation duties are worked after propagation or canon pressure exposes them. Owed-boundary work is filled by propagation dispositions that protect mysteries.
6. **Minimal Viable World checkpoint**: when admitted seeds exist and no earlier owed queue is foregrounded, Creation checks phases 4-8 coverage through steward dispositions, governed deferrals, protected-mystery routing, and Admission proposals. It does not score or admit facts.
7. **QA**: stability checks run before calling a world version stable; whole-world QA echoes the Minimal Viable World checkpoint read-only when one exists.
8. **Steady-state maintenance loop**: after the first stable path, new material re-enters at the lightest valid instrument: propose/admit, propagate when owed, run conditional passes when facts apply, repair contradictions or protected boundaries, re-work the checkpoint when admitted seeds change, and re-check QA when the version's load-bearing material changes.

The browser may use friendlier labels, but the state grammar and destination list stay aligned to this journey.

## Setup/Open-World Entry

Before a world is open, the browser renders setup work only: server status, catalog status, create/open world-file controls, recently opened worlds, and setup/open errors. It does not render workflow panels, search, snapshot/export, generic record/link tools, Prompt-out, Canon Workbench work, or method step content as competing inactive surfaces.

The setup shell has no manual token input and does not require a copied terminal token. Health, catalog, create, and open are normal local app dependencies. If server or catalog readiness fails, the browser reports that state instead of showing blank catalog-backed controls as if the method has no vocabulary.

Create/open policy remains server-owned. The browser shows server-returned path, wrong-file, future-schema, migration/backup, integrity, filesystem, and open/create failures next to the setup controls while preserving the entered path for correction. A successful create/open names the world file, updates recent worlds, and reveals the workspace.

Successful create/open of a different world is a world-scoped reset boundary. Before the new workspace renders, the browser clears or remounts all world-scoped guided-flow state: active destination-local payloads, flow/run identifiers, selected records, decision payloads, Creation kernel and seed draft buffers, consequence-mode and decomposition state, Minimal Viable World state, Admission queue selection and loaded decision state, Prompt-out preview and loaded status, advisory/lifecycle UI state, Canon Workbench selections, destination-local caches, and flow/action errors. The visible invariant is that the displayed world path matches the world file behind every visible flow record, prompt state, queue state, draft buffer, selected record, decision payload, and flow/action error. Failed create/open attempts preserve the current open world's workspace state while showing setup/open recovery near the setup controls. When current-world unsaved browser buffers would be discarded by a switch, the steward is warned before the successful switch continues.

After a world is open, setup controls become secondary and the workflow map becomes the home surface. A world with no `world_kernel` foregrounds Creation start/resume from the map as the primary active guided path; unrelated flows show prerequisite or not-yet-ready states until the kernel prerequisite exists. A world with a saved `world_kernel` and no parked proposed seed remains in Creation: the kernel proves Creation has begun, but seed decomposition is still owed before Admission has queue work. In that state Admission is not yet earned or blocked by missing proposed seeds, its queue count may be `0` without implying completion, the unlock reason names proposed seeds as the prerequisite, and the next decision points back to Creation seed decomposition rather than QA, review, or a generic stability destination. A world that has just parked Creation seeds foregrounds the Creation-to-Admission handoff and the Admission queue route: parked proposed seeds, seed-decomposition report, source links, granularity rationale, optional decomposition Prompt-out, and Admission queue route. Unrelated advanced flows remain available as substrate or later work, but they are visually secondary to the immediate handoff where this state is in scope.

## Map-as-Home Rule

Once a world is open, the map is the open-world home. Guided flows are destinations entered from it and presented one visible destination at a time. Read-side views and the record substrate remain reachable from the map, but they do not compete with the active guided path as peer first actions.

The map itself is a read-side orientation surface. It performs no writes, mints no records, admits no canon, records no skips, and runs no flow step. It renders server-returned state and route affordances. The browser computes no prerequisite, readiness, queue, or next-decision policy locally.

## State Grammar

Stages render with one of these states:

- `done`: the stage's current prerequisite or open work has been satisfied for the current world state.
- `active`: the steward can act on this stage now, or a run in this stage is in progress.
- `owed`: the world already contains material that owes this stage work.
- `blocked`: enough world material exists for the stage to matter, but no specific owed item is currently foregrounded.
- `not_yet_earned`: the stage is unavailable until an earlier method prerequisite exists.

Stages in `blocked` or `not_yet_earned` state must state what unlocks them. Conditional passes use this language to explain "when facts apply" instead of presenting the passes as mandatory stops for every fact.

Early-world state grammar is explicit:

1. **No kernel**: Creation is active; Admission and later guided stages are not yet earned because no `world_kernel` exists.
2. **Kernel authoring in progress**: Creation remains active; Admission is not yet earned because seed decomposition has not parked proposed seeds.
3. **Kernel saved, seed decomposition owed**: Creation is active or owed for seed decomposition; Admission is unavailable with proposed-seed unlock guidance; Admission queue `0` means no proposed seeds exist yet, not completed Admission work; the next decision routes to Creation seed decomposition.
4. **Seed parked, coverage unresolved**: proposed seeds may appear in the Admission queue, but Creation remains active or owed for seed-family coverage. Admission queue visibility is secondary and does not make Creation read as done.
5. **Seed parked, coverage resolved**: Admission is active or owed according to the Admission queue contract; Creation has handed proposed seed work to Admission without admitting canon standing.
6. **Post-correction proposed material**: corrected proposed facts created by governed Creation correction remain routed to Admission, preserving the PRD #302 correction and late-Admission blocking behavior, but unresolved required coverage still keeps Creation primary.

## Foregrounding and Queues

The map foregrounds state in this order unless a future spec narrows the order further:

- an empty world foregrounds **Start Creation** because no `world_kernel` exists;
- a saved `world_kernel` with no parked proposed seeds foregrounds **Creation seed decomposition** because Creation phases 1-2 are not complete and Admission has not earned queue work;
- parked proposed seeds or under-review facts foreground the **Admission queue** only after required Creation seed-family coverage rows are covered, deferred with rationale, or out of scope with rationale;
- propagation-scoped debt foregrounds **Owed propagation**;
- temporal/timeline debt foregrounds the **Temporal/Timeline** destination when sequence, latency, residue, or timing-boundary work is owed;
- propagation dispositions that protect mysteries foreground **Owed boundaries** for contradiction/retcon/mystery work;
- admitted seed evidence with unresolved checkpoint dispositions foregrounds **Minimal Viable World checkpoint** in Creation after earlier owed queues;
- when no owed queue is foregrounded, the next decision may point to QA or another stability check if enough world material exists.

The map displays queue signals with counts for:

- Admission queue;
- owed propagation;
- owed boundaries;
- Minimal Viable World checkpoint;
- open canon debt;
- skips.

Counts come from the server's existing flow, queue, debt, and record reads. A zero-count queue may remain visible when it teaches the next prerequisite; it must not imply hidden work.

## Destinations

The map owns destination entry for:

- Creation;
- Admission;
- Propagation;
- constraint composition;
- Temporal/Timeline;
- institutional/economic/suppression;
- contradiction/retcon/mystery;
- QA;
- Canon Workbench;
- markdown export;
- substrate.

The substrate destination contains generic records, links, search, draft space, and Prompt-out admin tools. The Canon Workbench and markdown export are read-side destinations. Guided-flow destinations keep their decision-point interiors, current/next/resume state, blockers, Prompt-out affordances, write previews, and read-side trails per the standard affordances below.

Every destination has a safe return to the map. Returning to the map after a flow action reloads a fresh server-owned map payload so stage state, owed queues, and next decision reflect the current world file.

## Prompt-Out Classification

In-flow Prompt-out is the only prompt path on guided routes. It belongs to the current decision point and carries that decision point's context, doctrine, omissions, and advisory/canon warning.

The generic Prompt-out panel is classified as substrate/admin. It remains reachable, but it does not appear beside guided-flow decision points and does not compete with in-flow Prompt-out.

## Propagation Before Protected-Boundary Work

The owed-boundaries queue is downstream of propagation dispositions. Protected consequences found during propagation create owed contradiction/retcon/mystery work; the map exposes that queue once it exists. The browser must not invent contradiction prerequisites locally, and the map must not imply that protected-boundary work exists before the propagation or canon pressure that creates it.

## Standard Affordances

Every guided flow browser surface exposes:

- current flow, step, and run state;
- completed, current, blocked, optional, and skippable steps;
- declared severity path and why that path changes obligations;
- active source record or debt item;
- open blockers and substance validations returned by the server;
- available prompt-out step and advisory status;
- skips, canon debt, surfaced proposals, and unresolved follow-up work created in this run;
- safe exit/resume affordance;
- next step and why it is next;
- read-side trail to reports, records, advisory artifacts, skip records, debt, and Audit Trail context once they exist.

## Cross-Flow Handoffs

- A new world with no `world_kernel` foregrounds Creation start/resume as the primary active guided path; unrelated flows show prerequisites or not-yet-ready states until the kernel prerequisite exists.
- A world with a saved `world_kernel` but no parked proposed seeds keeps Creation active or owed for seed decomposition. Admission remains unavailable or not yet earned with an unlock reason naming proposed seeds, the Admission queue count remains truthfully `0`, and QA/review cannot be foregrounded merely because the kernel record exists.
- Creation parks seeds at `proposed`; Admission owns first canon standing.
- Creation seed-family coverage remains Creation-owned. A parked proposed seed family does not complete Creation when required coverage rows are missing or unresolved. In that partial-decomposition state, the map keeps Creation active or owed, names unresolved seed-family coverage as the work before Admission handoff, and may still show the Admission queue count as secondary proposed-seed visibility.
- After seed parking, the active handoff names the seed-decomposition report, derived-from links, current/next/resume state, prompt-out state or governed skip, and read-side trail before steering the steward to Admission.
- After Admission admits seed facts, the Creation destination can become owed for the Minimal Viable World checkpoint. The map links to `/api/flows/creation/minimal-viable-world`; the checkpoint can create skip records, canon debt, and Admission proposals, but it does not admit facts or compute a verdict.
- Sweeps and specialized passes, including Temporal/Timeline, propose facts; Admission admits.
- Propagation, contradiction, institutional/economic/suppression, and QA may mint canon debt; debt appears in the relevant queue without changing canon standing.
- Read-side workbench views link back to flow artifacts but do not mutate them.

## Server Policy Boundary

The browser renders server-returned step maps, blockers, severity paths, prompt-out availability, and close readiness. It may improve presentation and keyboard flow, but it does not duplicate canon mutation, admission, repair, skip, advisory, or close policy locally.

## Acceptance

A browser workflow slice that changes navigation must show:

- for map-first shell changes, a walkthrough from setup through open-world to the map, into a guided flow, back to the map with run state parked and refreshed, and into the Admission queue when Admission is owed;
- on the map, stage state, queue counts, next decision, why that decision is next, and unlock reasons for unearned stages;
- for the kernel-complete/no-seed state, Creation current/owed state, Admission unavailable state, Admission queue `0`, proposed-seed unlock guidance, Creation seed-decomposition next decision, and non-mutation/read-only behavior;
- a start/resume path;
- a visible current decision point;
- at least one next-step or blocker state;
- an exit/resume path;
- the resulting read-side trail or explicit reason none exists yet.
- for setup/open-world changes, a walkthrough from no-world setup through create/open success and the empty-world Creation prerequisite state.
- for world-switch reset changes, a same-runtime browser walkthrough that starts in world A with loaded Creation, Admission, Prompt-out, draft/buffer, selected-record, queue, decision, and error state where available; switches to world B without refreshing; and verifies no world A short IDs, titles, prompt packets, loaded statuses, draft text, selected records, queue selections, decision payloads, or flow/action errors render under world B's displayed path.
- for Creation-to-Admission handoff changes, a walkthrough from open early-world state through seed parking, prompt preview or governed skip, and Admission handoff, with unrelated advanced flows presented as not-current or prerequisite surfaces where the slice touches them.
- for pre-Admission handoff changes, a cognitive walkthrough that starts with a saved kernel before seed parking, identifies seed decomposition as the owed decision, distinguishes unlock guidance from provenance, predicts that the map writes nothing, follows the Creation resume destination, parks proposed seeds, and returns to a refreshed Admission queue state.
- for seed-family coverage changes, a walkthrough that starts with parked proposed seeds and unresolved required coverage, verifies Creation remains current or owed, verifies Admission queue visibility is secondary, resolves or deliberately disposes coverage rows, refreshes the map, and verifies Admission becomes the primary next decision only after server-owned coverage state is resolved.

## Principles

Touches `docs/worldbuilding-system/05_creation_protocol.md`, `docs/worldbuilding-system/06_canon_fact_admission_protocol.md`, `docs/worldbuilding-system/09_temporal_and_timeline_protocol.md`, `docs/worldbuilding-system/20_ai_assisted_workflow.md`, `docs/specs/creation-flow.md`, `docs/specs/temporal-timeline-flow.md`, `docs/specs/prompt-out-context-assembly.md`, `docs/specs/browser-visible-guidance-acceptance.md`, `guided-workflow-usability.md` W-8, `workflow-principles.md` P-5/W-2/W-3/W-4/W-7, `data-principles.md` P-6/W-5/W-6, `charter.md` v1 scope and T-8, `domain-fidelity.md` P-1/T-2, ADR 0007, ADR 0009, PRD #150, PRD #158, PRD #165, and PRD #201. It affirms non-contradiction.
