# Guided Workflow Usability

*Altitude: architectural principles. Durable, but may evolve with field evidence from app use.*

This document owns the browser-visible standard for guided flows and for the navigation between them. The package defines the method; these principles define what the app must show so the steward can work the method without reconstructing the protocol from memory — and, per the charter, without opening the package files at all.

## W-8. Guided flows are decision-point surfaces

A guided flow is not complete merely because its records, routes, stores, validations, and server policy exist. It is complete only when each meaningful browser step tells the steward what decision is being made, why the package asks for it, what evidence and context bear on it, what must be filled, what may be skipped, what prompt-out support is available, what the app will write, and what happens next.

The unit of guidance is the **decision point**: a flow step where the steward must judge, author, classify, route, skip, or dispose of material. A decision point may be small, but it is not a naked form field. It has local purpose, package authority, state, context, obligations, and consequences.

## Decision-Point Contract

Every meaningful decision point in a guided flow must expose, at the point of use:

- the current flow, step name, and run state;
- the local decision in plain language;
- the package source and why this step exists;
- required fields, optional fields, and severity-dependent fields;
- the skippability rule and the skip record or reason owed;
- the relevant doctrine, checklist, template rule, or operating-card excerpt;
- source records, dependencies, standing rulings, open canon debt, prior skips, and unresolved contradictions relevant to this step;
- the available prompt-out role, prompt preview, context preview, and advisory/canon warning;
- app-owned blockers and substance validations;
- what will be written, linked, queued, left untouched, or routed back to Admission;
- the next step, safe exit/resume path, and read-side trail.

This is a contract, not a layout prescription. A compact expert surface can satisfy it; a dense panel that technically contains all data but hides the local task cannot.

## Progressive disclosure is severity-bound

The app may hide advanced detail until it matters, but it must not hide why the steward is being asked to decide. Severity scaling from `workflow-principles.md` W-2 controls how much evidence and instrumentation a step owes. Minor work stays cheap; major-or-higher work earns fuller doctrine, blockers, prompts, skip reasons, and audit trails.

## Prompt context is part of usability

Prompt-out is only useful when the copied prompt carries the decision point. A generated prompt — proposal or pressure — must be understandable in a cold external LLM session: it names the current task, source records, relevant doctrine, constraints, standing rulings, omissions, and the mode and role being requested. Prompt text that asks for help while forcing the steward to hand-assemble context does not satisfy W-1 or W-8. The prompt packet and the decision-point surface are two renderings of one context assembly: whatever the screen shows the steward, the packet can carry to the external LLM, and a packet that omits material the decision point displays is a defect, not a variant.

## W-9. Replacement-grade guidance: the app is the method surface

The charter commits the app to replacing the package files in normal use. This principle makes that testable: **every decision point carries self-contained, app-owned method instruction** — what is being decided, the operative rule in app wording, what good material looks like, and why the method asks — as versioned derivations of package doctrine, under the same discipline as the operating card and default prompt texts (derived, versioned, re-checked when upstream changes; P-1).

- Package file paths are provenance: maintainer-facing, visible in audit or detail affordances, greppable for fidelity review. They are never the operating instruction. A surface that satisfies W-8's "relevant doctrine" item with a bare file citation violates this principle.
- The unit of guidance is the decision point — one coherent block of steward-authored material — matching W-1's prompt grain. Guidance is therefore a content layer addressed by decision point, not prose hand-written per flow surface.
- Guidance teaches as it guides: a steward who has never read the package should finish a flow knowing not just what they filled but what the method just did for them.

## W-10. The workflow map is the home surface

W-8 governs the interior of a decision point; this principle governs the space between decision points. Once a world is open, the app's home is the **workflow map**: the method journey rendered against live world state — stages done, active, owed, blocked, or not yet earned; the queues that hold work (admission, owed propagation, owed boundaries, canon debt, skips); and the most likely next decision, with why it is next.

- Guided flows are destinations entered from the map, presented one at a time; a surface that presents all flows simultaneously as equal first actions violates this principle.
- Read-side views (Canon Workbench) and the generic record substrate stay reachable from the map but never compete with the active guided path as peers.
- The map is not a dashboard or project-management layer: it answers *where am I in the method, why am I here, what blocks me, what happens next* — nothing else. `docs/specs/workflow-map-and-navigation.md` is its spec and owns the concrete grammar.

## Read-side views do not replace guided work

Current Canon, Audit Trail, and record detail views answer read questions. They may link back to flow artifacts, skip records, advisory artifacts, debt, supersession, and branch notes, but they do not become the primary creation, admission, propagation, repair, or QA workflows. A read surface can explain how canon got here; a guided flow governs how new canon work happens.

## Acceptance evidence

Issues and specs that touch a guided flow must include browser-visible acceptance evidence appropriate to the slice. At minimum, reviewers need a representative path showing:

- the decision point and source doctrine;
- required, optional, and severity-dependent obligations;
- a skip or blocker example when the slice offers one;
- a prompt-out preview with context and advisory separation when prompt-out is in scope;
- the resulting write, link, queue entry, audit trail, or explicit non-mutation;
- a naive-steward cognitive walkthrough for learnability when the slice changes the browser workflow.

API or store tests remain necessary, but they are not sufficient evidence that a guided flow is usable.

## Principles

Touches `charter.md` P-3/P-4/T-8, `canon-sovereignty.md` P-2/W-1/T-5, `domain-fidelity.md` P-1/T-2, `workflow-principles.md` P-5/W-1-W-4/W-7, and `data-principles.md` P-6/W-5/W-6/T-3/T-4/T-5. It affirms non-contradiction.
