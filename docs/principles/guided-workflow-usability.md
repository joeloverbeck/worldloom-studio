# Guided Workflow Usability

*Altitude: architectural principles. Durable, but may evolve with field evidence from app use.*

This document owns the browser-visible standard for guided flows. The package defines the method; this principle defines what the app must show so the steward can work the method without reconstructing the protocol from memory.

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

Prompt-out is only useful when the copied prompt carries the decision point. A generated prompt for a dependency-bearing step must be understandable in a cold external LLM session: it names the current task, source records, relevant doctrine, constraints, standing rulings, omissions, and the pressure role being requested. Prompt text that asks for help while forcing the steward to hand-assemble context does not satisfy W-1 or W-8.

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
