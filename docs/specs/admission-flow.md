# Admission Flow Spec

This spec defines Worldloom Studio's second guided flow: `06_canon_fact_admission_protocol.md`, plus the frontloaded seed audit that `05_creation_protocol.md` places after seed decomposition and before first admission. It is downstream of `docs/specs/schema-v1.md`, `docs/specs/creation-flow.md`, `docs/worldbuilding-system/06_canon_fact_admission_protocol.md`, `docs/worldbuilding-system/checklists/canon_fact_gate.md`, `docs/worldbuilding-system/checklists/frontloaded_seed_audit.md`, `docs/worldbuilding-system/templates/admission_ledger.md`, `docs/worldbuilding-system/20_ai_assisted_workflow.md`, the foundational principles, and ADRs 0001-0004.

The flow is where a proposed fact becomes governed canon. Sweeps and checklist runs may propose material, but only admission changes canon standing.

## Fixed Decisions

1. **Admission queue.** The queue lists `canon_fact` and `admission_ledger_row` records whose canon status is `proposed` or `under review`. Creation-flow parked seeds enter automatically because they are `canon_fact` records at `proposed`. Queue rows surface short ID, title, record type, truth layer, canon status, declared `admission_level`, declared `work_scale`, and constraint tags. Ordering is `work_scale` danger first (`catastrophic`, `severe`, `major`, `moderate`, `minor`), then admission level descending, then most recent update.
2. **Universal propose affordance.** Draft-space proposal converts a draft to a `canon_fact` with a steward-supplied truth layer and `proposed` status. Proposal from an existing record records a provenance event and returns the same queue surface without changing truth layer, canon status, tags, severity, or operations.
3. **Severity declaration.** Severity is two separate facets: `admission_level` and `work_scale`. The UI/API exposes vocabulary definitions from seeded vocabulary rows at point of use. No default, suggestion, or inference is rendered; the steward submits both terms explicitly.
4. **Gate composition.** Level 0-1 or `minor` work renders the minor ledger path. Level 2 or `moderate` work renders minor work plus cost/access/constraint and one domain ripple. Level 3 or `major` work renders the full gate. Level 4 or `severe` work renders the full gate plus temporal/spatial, branch, mystery/aesthetic, and QA follow-up prompts. Level 5 or `catastrophic` work renders the full gate plus explicit decision-record and branch/rollback prompts. This maps directly to `06` severity-scaled evidence and admission-level text.
5. **Substance validation.** For major-or-higher gates, checkbox-only completion is refused. A consequence check requires written consequence text; an `n/a` gate item requires a reason; a quiet domain requires an explicit quiet-domain declaration.
6. **Minor ledger row form.** A minor row owes the admission-ledger columns: fact statement, scope, truth layer, status plus separated constraint tags, ordered admission operation(s), and one consequence check. Batch admission creates one `admission_ledger_row` card per fact in one run and records admission operations in order.
7. **Keyboard paths.** The web flow keeps ledger fields in source order and supports the browser's native Tab/Enter form path through repeated rows. Batch submission is one command after rows are filled.
8. **Promotion.** Row-to-card promotion uses the existing identity-preserving record promotion: surrogate ID, short ID, links, and history stay with the record. A promotion link/audit note records the transition.
9. **Full gate result.** A completed major gate writes a `gate_result` report and updates the living card in place. Report-regime triggers make gate results append-only; card-regime triggers preserve outgoing wording as history.
10. **Status transitions.** The flow exposes these store-enforced transitions: `proposed -> under review`, `proposed|under review -> accepted|accepted with constraints|localized|contested|quarantined|branch-only|rejected`, and any accepted standing to `superseded|deprecated` only through a later governed admission/repair path. Illegal transitions are refused.
11. **Operation jurisdiction.** Admission decisions record ordered `admission_decision_operation` events only. Repair operations are refused in admission operations by the existing `jurisdiction_events` check.
12. **Frontloaded seed audit.** A seed audit is an offered checklist run over a seed set before first admission. Completion writes a `gate_result` report attached to each audited seed by `derived_from` links. It never changes seed truth layer, canon status, tags, severity, or operations. Declining the audit is legal and leaves seeds admissible.
13. **Skip records.** Every declined offered instrument writes a `skip_record` mechanically. A reason is required at major-or-higher threshold and not required below it; below threshold the record states that no reason was collected.
14. **Canon debt.** Canon debt is a `canon_debt` card with name, scope, assignee, and open/closed state in prose and status. Open debt warns at foundational admissions (`admission_level` 4 or 5, or work scale `severe`/`catastrophic`) but never blocks admission. Owed propagation is recorded as canon debt scoped to propagation.
15. **Admission prompts.** Admission adds two default prompt templates derived from `20_ai_assisted_workflow.md`: `admission_prerequisite_audit` for statement/dependencies and `admission_constraint_challenge` for capability/access/cost/constraints. Generated prompts include record context, role framing, vocabulary guardrail, label-assumptions instruction, and standing rulings. Pasted responses remain immutable advisory artifacts and are linked from informed admission mutations.
16. **Doctrine at point of use.** Gate responses include doctrine citations to `06`, `checklists/canon_fact_gate.md`, `templates/admission_ledger.md`, `checklists/frontloaded_seed_audit.md`, and `20_ai_assisted_workflow.md` as relevant.
17. **Schema migration.** No new record types are needed. Existing records, facets, links, `jurisdiction_events`, prompt templates, flow instances, and report/card mutation regimes cover the slice.

## Testing Seams

Primary seam: the localhost HTTP API against temp-file world databases for queue contents, proposing from drafts and records, severity declaration, batch ledger admission, full gate validation, gate results, seed audit, skip records, canon debt warnings, and admission prompt generation.

Secondary seam: direct store/SQL assertions for status-transition refusal, report immutability, card history, operation jurisdiction, and promotion identity preservation.

## Principles

Touches `charter.md` (P-3, T-8), `canon-sovereignty.md` (P-2, W-1, T-5), `domain-fidelity.md` (P-1, T-2), `workflow-principles.md` (P-5, W-1-W-4, W-7), `data-principles.md` (W-5, W-6, T-3, T-4, T-5), and ADRs 0001-0004. It affirms non-contradiction: the methodology stays upstream, every judgment field is steward-declared, generated text is advisory, severity scales gate depth, only admission admits, skips/debt are records, and gates demand written substance.

T-8 honesty: prompt-out/paste-in remains unvalidated under a naive steward. This flow extends the creation-flow sovereignty surface without claiming new external validation.
