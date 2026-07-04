# Worldloom Studio

The app context: a local-first, single-steward web app implementing the Causal Canon Worldbuilding System 1.0 as guided flows over a structured record store.

**Deference rule:** for every worldbuilding-domain concept — canon status, truth layer, shock cone, steward, admission, canon debt, and the rest — `docs/worldbuilding-system/22_glossary.md` is authoritative and is not restated here. This file defines only the terms the *app* introduces on top of the method. Per `docs/principles/domain-fidelity.md`, glossary terms are used verbatim in UI, schema, code, and docs.

## Language

**World file**:
The single database file that is one world's canonical store; the unit of ownership, backup, and sharing.
_Avoid_: project file, save file, workspace

**Flow**:
An ordered, resumable, interleavable sequence of steps that implements a package protocol over the record store.
_Avoid_: wizard, pipeline

**Admission flow**:
The app flow that applies the upstream admission protocol to proposed facts; it is the only app flow that changes canon standing.
_Avoid_: approval workflow, review flow

**Draft space**:
The ungated workspace for notes, half-formed seeds, and pasted material; nothing in it is under canon governance until proposed for admission.
_Avoid_: sandbox, scratchpad, inbox

**Admission queue**:
The single queue through which every proposed fact, from any origin, reaches the admission flow.
_Avoid_: review queue, approval queue

**Prompt-out step**:
A flow step that generates a self-contained prompt the steward may run in any external LLM; always optional.
_Avoid_: AI step, generation step

**Decision point**:
A flow step where the steward must judge, author, classify, route, skip, or dispose of material under package doctrine.
_Avoid_: form field, wizard page

**Prompt packet**:
The self-contained content assembled for a prompt-out step: current decision, relevant world context, doctrine, source records, standing rulings, omissions, and advisory framing.
_Avoid_: prompt text, AI context

**Advisory artifact**:
A pasted LLM response stored verbatim and immutably, attached to the prompt-out step that produced its prompt; type-separate from canon records, never parsed into them.
_Avoid_: AI output, suggestion, draft

**Standing ruling**:
A steward's persisted disposition of advisory material, carried as context into future generated prompts.
_Avoid_: preference, feedback

**Owed-boundaries queue**:
A view of propagation results where the steward protected a consequence as a mystery boundary but has not yet linked a governed mystery ledger entry.
_Avoid_: mystery backlog, boundary task table
