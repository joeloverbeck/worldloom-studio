# Prompt-out step module seam

Worldloom Studio treats Prompt-out as a server-side cross-flow module that owns the shared W-1/P-2 sovereignty mechanics: prompt template listing and versioning, prompt assembly, standing rulings, immutable advisory artifact storage, advisory disposition validation, prompt-out skip record creation, and advisory-use links. Creation, Admission, Propagation, Contradiction, QA, and future guided flows consume Prompt-out through a small step lifecycle interface instead of learning the generate/store/dispose/skip/link sequence themselves.

`WorldFile` remains the persistence and invariant layer. Prompt-out may use `WorldFile` to read templates, records, vocabulary terms, and standing rulings and to write advisory artifacts, skip records, dispositions, and typed links, but those operations are no longer exposed as generic world-file behavior for flow modules to orchestrate by hand.

The external Prompt-out interface is step-oriented rather than CRUD-oriented. Flow modules offer a prompt-out step with step identity, flow context, severity context, selected record context, and intended provenance target; Prompt-out generates the self-contained prompt, stores a pasted response as an advisory artifact, records a declined prompt-out step as a skip record, and links consulted advisory material when a steward-authored mutation explicitly names it. Prompt-out never infers advisory use merely because a response was pasted.

Prompt-out owns prompt-out skip policy and reason-threshold enforcement. Flow modules still own their flow-specific aftermath: updating run state, linking a skip to a source fact or report, and deciding whether a skipped instrument affects close coverage.

No new canon-facing record type is introduced for every generated prompt-out step. The durable audit surface remains the existing `advisory_artifact` record when a response is pasted and the existing `skip_record` when the prompt-out step is declined. If implementation later proves that generated prompts need stable IDs for resume or audit gaps, add a small internal table rather than a new methodology-facing record type.

Existing HTTP routes for prompt template management, prompt generation, advisory artifacts, and advisory dispositions may remain as compatibility adapters while they delegate to the Prompt-out module. Newer browser and flow routes should use the step lifecycle so the browser does not hard-code a flow-specific skip endpoint or duplicate Prompt-out sequencing.

This ADR records an architecture seam only. It does not introduce a schema migration, new record type, browser redesign, or steward-visible Prompt-out behavior change.

## Considered Options

- Keep Prompt-out behavior split across `WorldFile`, flow modules, HTTP routes, and the browser. Rejected because it leaves W-1/P-2 as a caller discipline and already leaks flow-specific skip behavior through the generic browser panel.
- Make each flow own its own Prompt-out handling. Rejected because prompt assembly, standing rulings, advisory immutability, disposition validation, and advisory provenance links are cross-flow sovereignty mechanics.
- Persist every generated prompt-out step as a new record type. Rejected for now because durable audit already begins when the steward stores a pasted advisory response or records a skip, and a new record type would add canon-facing surface before a resume or audit gap proves the need.
- Let Prompt-out own all skip aftermath. Rejected because run-state transitions, source/report links, and close-coverage effects are flow-specific.
- Infer advisory use from pasted responses. Rejected because P-2 requires explicit steward authorship and decision; artifact existence is not evidence that the artifact informed a later mutation.

## Consequences

- Flow modules should call Prompt-out for prompt-out step mechanics, then apply only their own flow-state aftermath.
- `WorldFile` can shed prompt-template, prompt-generation, advisory-disposition, and advisory-link orchestration from its public flow-facing surface over time.
- The browser Prompt-out panel should consume server-returned step lifecycle shapes instead of selecting generic templates and routing skips through Creation.
- Compatibility routes can preserve existing tests and clients while the deeper module is introduced.
- No deliberate exception is taken against `charter.md`, `canon-sovereignty.md`, `domain-fidelity.md`, `workflow-principles.md`, `data-principles.md`, or ADRs 0001-0006.
