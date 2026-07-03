# Admission flow module boundary

Worldloom Studio treats the Admission flow as the first-class module that owns the governance transition into canon. Admission owns intake into the single admission queue, proposal provenance, queue presentation, admission-specific severity interpretation, gate composition, ledger and gate outputs, admission-adjacent debt warnings or follow-up creation, and legal status-changing admission operations.

`WorldFile` remains the persistence and invariant layer. Creation, Propagation, Contradiction, QA, and future guided flows may surface candidate facts, but they route proposed canon fact creation or routing through Admission intake instead of hand-minting proposed facts directly. This makes `workflow-principles.md` W-3 ("Sweeps propose; only admission admits") a module boundary, not only a route convention.

Neutral severity thresholds remain shared app policy because Propagation, Contradiction, skip recording, and coverage checks need questions such as major-or-higher, foundational, and catastrophic. Admission owns Admission-specific interpretations: queue ordering, gate path and steps, full-gate substance validation, and foundational open-debt warnings.

Canon debt remains a method-wide record capability. Generic canon-debt list/create/close behavior belongs behind a neutral API surface; Admission keeps only admission-adjacent behavior such as full-gate follow-up debt creation and foundational open-debt warnings.

The server-side Admission boundary is the hard invariant. Browser code consumes server-returned queue, gate, warning, skip, and coverage shapes and should not duplicate queue ordering, gate policy, debt-warning policy, status legality, or severity interpretation.

This ADR records an architecture boundary only. It does not introduce a schema migration, new record type, browser redesign, or steward-visible Admission behavior change.

## Considered Options

- Keep the current partial boundary, with other flows creating proposed facts directly and then routing them to Admission. Rejected because it leaves the "only admission admits" boundary half-open.
- Move all severity policy into Admission. Rejected because major-or-higher and foundational thresholds are cross-flow policy, not admission-only behavior.
- Treat all canon debt as Admission-owned. Rejected because canon debt is method-wide and already arises from propagation, contradiction repair, QA, mystery, branch, residue, and aesthetic work.
- Make the browser Admission panel the primary boundary. Rejected because the invariant must hold below the UI; the browser may be reorganized later but must consume server policy shapes.

## Consequences

- Admission exposes one origin-aware intake path for proposed canon facts from drafts, existing records, creation seeds, propagation-surfaced facts, contradiction repair-created facts, and future flow origins.
- Flow modules provide origin metadata and source/report context; Admission performs proposal creation or routing, provenance, sweep jurisdiction where applicable, source links, and queue entry.
- Propagation and Contradiction retain ownership of their run state, reports, repairs, dispositions, boundaries, and follow-up debt, but not proposed canon fact creation.
- Admission-specific policy can deepen behind `packages/server/src/admission-flow.ts` without bloating `WorldFile` or leaking gate rules to other flows.
- Generic canon-debt routes should not remain permanently nested under `/api/admission/debt`; existing Admission debt routes may remain temporarily as compatibility adapters.
- No deliberate exception is taken against `charter.md`, `canon-sovereignty.md`, `domain-fidelity.md`, `workflow-principles.md`, `data-principles.md`, or ADRs 0001-0005.
