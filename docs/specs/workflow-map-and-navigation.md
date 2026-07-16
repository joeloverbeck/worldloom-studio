# Workflow Map and Navigation Spec

This spec defines the cross-flow orientation grammar for guided workflows. It is downstream of `docs/worldbuilding-system/03_truth_layers_and_canon_governance.md`, `docs/worldbuilding-system/07_propagation_engine.md`, `docs/worldbuilding-system/22_glossary.md`, `docs/principles/guided-workflow-usability.md`, `docs/principles/workflow-principles.md`, `docs/principles/data-principles.md`, and the flow specs.

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

### Admission and routeable owed Propagation

After Creation prerequisites and required seed-family coverage are clear, the map applies one narrow cross-queue rule. When Admission has proposed work and at least one open propagation-scoped `canon_debt` item from accepted canon has both a typed source-fact relationship and the existing non-null Propagation start/resume route, owed Propagation is the primary next decision unless a separately preserved destination case governs the payload. The primary label names owed Propagation work, and the reason explains that accepted canon has an owed shock cone that should be worked before further dependency-bearing Admission.

This recommendation is a paved path, not a gate. Both queue counts remain truthful. Admission remains visible, active when its queue has work, and directly navigable; the map does not mark it done, blocked, hidden, or unavailable merely because Propagation is primary. The steward remains free to enter Admission because open canon debt is a warning rather than a hard block (`workflow-principles.md` W-4).

Eligibility comes only from the server's existing typed source-fact and start/resume route data. Debt without either does not become a startable primary Propagation decision and retains its missing-source blocker in the Propagation destination. The map does not parse titles or prose, infer a dependency between the queued proposal and the debt source, or reproduce routeability policy in the browser.

Priority changes orientation only. It does not admit canon, change canon standing, close debt, create a Propagation run, write a deferral or skip, or otherwise mutate the world. It reuses the existing workflow-map response contract: `nextDecision.destinationKey`, `label`, `reason`, and `href`, plus the existing queues, stages, and destinations. No schema field, record type, persistence store, controlled vocabulary, scheduler, or generalized priority framework is introduced.

This pairwise rule leaves current behavior unchanged for unresolved Creation coverage, Admission-only, Propagation-only, owed-boundary, Temporal/Timeline, Minimal Viable World, QA, and other destination combinations outside this proven collision.

### Source-linked conditional passes after Propagation close

The map receives a server-owned ordered ledger of `conditional_pass_obligation` records backed by structured flow-owned state. Each obligation has exactly one source fact, one final Propagation report, one stable pass key, one ordinal, one current disposition (`outstanding`, `covered`, or `deferred`), optional current rationale, and optional covering evidence. The unique identity is source fact + report + pass key. Titles, bodies, rationales, debt prose, report prose, and link-note prose never determine identity, applicability, coverage, disposition, ordering, or routing.

The current projection remains three-valued. `reinstated` is an immutable history action whose prior disposition is `deferred` and resulting disposition is `outstanding`; it is never rendered or stored as a fourth current disposition. Ordered history retains every emitted, reconciled, deferred, reinstated, and covered event with prior and resulting disposition, actor, timestamp, flow step, rationale or evidence, and the source/report/obligation relationships needed to navigate the audit trail.

Fresh foundational Propagation close owes three obligations in this order, reusing existing guided destinations:

1. `temporal_timeline` → Temporal/Timeline;
2. `constraint_composition` → Constraint Composition;
3. `institutional_economic_suppression` → Institutional / Economic / Suppression.

World open/migration reconciliation creates missing obligations for historical closed foundational runs before this read-only map is built. Reconciliation uses typed source/report relationships and structured foundational severity, is idempotent, and does not change append-only report text, source canon, debt history, or completed flow state.

After preserved higher-priority Creation cases and the routeable open-Propagation arbitration above, the first outstanding obligation is the primary decision ahead of queued Admission. Conditional passes and the affected destination are `owed`; the response includes the full ledger grouped by source fact and report, stable order, source-selected start/resume input, doctrine, blockers, provenance, governed history, and current/next/resume state. The primary label and reason name the pass, source fact, and report and explain that the closed foundational run still owes specialized work before further dependency-bearing Admission.

For an outstanding obligation, the server may return the existing rationale-bearing deferral action and the source-selected pass destination. For a deferred obligation, the server may return a rationale-bearing reinstatement action. Each transition response owns the applicable action, required inputs, optional identity guards, skippability rule, severity-dependent classification, exact blocker and remediation, proposed request body, proposed write, untouched-state guarantees, destination, read-side trail, and refreshed history. Deferral remains the applicable skip path and reason storage. Reinstatement requires a non-empty written reason; it changes only the selected current projection to `outstanding`, clears the current deferral rationale, leaves covering evidence empty, restores the existing source-selected route, and retains every earlier rationale in ordered history. No new optional or severity-dependent authoring field is introduced.

State-aware retry behavior distinguishes transport retry from a genuine later transition. Repeating the same defer or reinstate request with the same reason against its unchanged target state returns the authoritative projection without another event. An incompatible repeat is refused. After an intervening valid transition, the same action and reason are a genuine new lifecycle event and remain visible as a separate history entry.

A completed matching specialized pass may cover either an outstanding or deferred obligation. Coverage records the actual prior disposition, changes the selected projection to `covered`, clears the current rationale, stores the completed `pass_report` as evidence, and retains every prior deferral and reinstatement event. Source fact, pass key, final Propagation report, completed report type, and unambiguous obligation identity are authoritative. Incomplete work, wrong source, wrong pass, wrong Propagation report, wrong report type, ambiguous matching, and already-covered attempts are refused with exact remediation; prose and partial identity never select a target.

Covered obligations are terminal in this lifecycle. They expose neither deferral nor reinstatement, and correction or supersession of specialized work remains owned by the specialized flow and append-only report regime. Every transition validates the authoritative current disposition inside the World file's atomic write boundary. Stale state, empty reason, incompatible repeat, identity mismatch, ambiguous coverage, or persistence failure leaves projection, events, covering evidence, sibling obligations, source fact, reports, Admission, canon debt, records, links, and unrelated flows unchanged.

Admission remains visible, active when queued, truthfully counted, and directly navigable. After a successful transition, the browser waits for a fresh workflow-map response before presenting outstanding and governed counts, stable source/report/ordinal order, Conditional-pass stage and destination state, primary next decision, routeability, current/next/resume state, safe return, and Admission orientation. When every obligation for a handoff is `covered` by matching completed pass evidence or explicitly `deferred` with a steward rationale, a fresh read may elevate Admission under the existing ordering; governed obligations remain visible. Map reads and navigation never emit, reconcile, cover, defer, reinstate, or otherwise mutate obligations. Canon-debt title/body keyword matching is not a source of Conditional-pass or Temporal/Timeline state.

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
- for Admission-versus-routeable-Propagation arbitration, a cognitive walkthrough that starts after major-or-higher Admission completion with another proposal waiting and open source-linked Propagation debt; reloads the map; identifies owed Propagation as primary and understands the accepted-canon shock-cone reason; verifies both queue counts and destinations remain truthful and Admission remains directly navigable; follows the primary route into the debt item with source, debt, severity, blocker, and start/resume state visible; predicts that map reads and navigation do not write; and returns safely to a freshly reloaded map. Package provenance, the decision contract, routeability and severity context, doctrine at point of use, blockers, current/next/resume state, source/debt provenance, read-only behavior, and the cognitive walkthrough are required at this seam. Prompt-out packets, advisory material, and skip recording are N/A for this map-priority rule.
- for the post-Propagation Conditional-pass handoff, a docs-naive reinstatement walkthrough that closes foundational Propagation with another proposal queued; reloads the map; identifies Temporal/Timeline from the source fact/report obligation rather than debt prose; inspects all three ordered obligations and their destinations; keeps Admission visible and navigable; previews and submits one explicit rationale-bearing deferral; observes deferred current state, unavailable source-selected routing, persisted provenance, and immutable history; attempts one invalid reinstatement with entered reason, row context, focus, blocker, remediation, and non-mutation preserved; submits a valid reinstatement; waits for a fresh map; observes outstanding current state, restored routing, counts, stable order, primary next decision, current/next/resume state, safe return, Admission orientation, and retained deferral plus reinstatement history; follows the restored pass; returns safely without creating coverage; completes substantive matching work; and observes outstanding-to-covered evidence plus terminal current state.
- for the independent direct-redemption path, a docs-naive walkthrough that starts with a separate deferred obligation and completes matching specialized work without reinstating it; observes deferred-to-covered history, retained deferral rationale, completed covering report, terminal current state, fresh orientation, and no fabricated reinstatement. Together the walkthroughs exercise incomplete, wrong-source, wrong-pass, wrong-report, ambiguous, stale, already-covered, retry, and repeated-cycle controls; record browser/API parity and before/after preservation fingerprints; distinguish required, optional, skippable, and severity-dependent fields; and classify browser console errors and warnings separately with zero unexplained entries.

## Principles

Touches `docs/worldbuilding-system/05_creation_protocol.md`, `docs/worldbuilding-system/06_canon_fact_admission_protocol.md`, `docs/worldbuilding-system/09_temporal_and_timeline_protocol.md`, `docs/worldbuilding-system/20_ai_assisted_workflow.md`, `docs/specs/creation-flow.md`, `docs/specs/temporal-timeline-flow.md`, `docs/specs/prompt-out-context-assembly.md`, `docs/specs/browser-visible-guidance-acceptance.md`, `guided-workflow-usability.md` W-8, `workflow-principles.md` P-5/W-2/W-3/W-4/W-7, `data-principles.md` P-6/W-5/W-6, `charter.md` v1 scope and T-8, `domain-fidelity.md` P-1/T-2, ADR 0007, ADR 0009, PRD #150, PRD #158, PRD #165, and PRD #201. It affirms non-contradiction.
