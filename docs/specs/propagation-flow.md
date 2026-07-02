# Propagation Flow Spec

This spec defines Worldloom Studio's third guided flow: `07_propagation_engine.md` plus the domain-atlas sweep from `04_domain_atlas.md`. It is downstream of `docs/specs/schema-v1.md`, `docs/specs/admission-flow.md`, `docs/worldbuilding-system/03_truth_layers_and_canon_governance.md`, `docs/worldbuilding-system/04_domain_atlas.md`, `docs/worldbuilding-system/06_canon_fact_admission_protocol.md`, `docs/worldbuilding-system/07_propagation_engine.md`, `docs/worldbuilding-system/20_ai_assisted_workflow.md`, the foundational principles, and ADRs 0001-0004.

The flow works a fact's shock cone. It never admits facts and never generates consequences for the steward; it organizes steward-written consequences, checks coverage, writes the append-only propagation report, and routes surfaced facts back to admission at `proposed`.

## Fixed Decisions

1. **Owed-propagation queue.** The queue is a view over open `canon_debt` records scoped to propagation. It is not a new record type or table of debt. Admission-created debt with `Scope: propagation` appears automatically.
2. **Run entry.** A propagation run starts from an owed item or any chosen fact. Owed debt is the paved path, not a gate. Runs use existing `flow_instances` with propagation fact, debt, and report pointers.
3. **Shock-cone order.** Consequences are recorded under `07`'s zeroth through fifth orders as steward-written prose. The app stores order labels and optional domain attribution; it never infers content.
4. **Domain-atlas sweep.** The fourteen domains from `04_domain_atlas.md` are presented verbatim. Each swept domain is marked direct, dependency, reaction, or negative. Negative domains require a declaration and are distinct from unswept domains.
5. **Doctrine at point of use.** The flow exposes `07`'s propagation mechanisms, signature tests, and stopping rules, plus the `04` domain atlas. These are versioned derivations of upstream package text.
6. **Disposition storage.** Dispositions are a controlled vocabulary, `consequence_disposition`, seeded from `07`'s stop-when-governed states: `answered`, `intentionally scoped out`, `assigned as canon debt`, and `protected as a mystery boundary`. They are stored as standing rulings attached to consequence rows, not as record types.
7. **Coverage check.** Close is refused while any high-pressure consequence lacks one disposition. The app checks coverage only; the steward chooses all consequence text, pressure, and dispositions.
8. **Assigned debt.** `assigned as canon debt` mints an open `canon_debt` card on the existing lifecycle and links it from the propagation report as follow-up.
9. **Protected boundary.** `protected as a mystery boundary` requires an explicit preservation-boundary value in the disposition row.
10. **Report as master record.** Closing writes one append-only `propagation_report` with report sections for fact/run, orders, domain sweep, negative domains, consequences/dispositions, surfaced proposals, debt/boundaries, and stopping-rule audit. Corrections produce new records; report records and report sections remain append-only under the store triggers.
11. **Fact digest.** The fact card carries a `digest_of` link to the propagation report. The shock-cone prose lives in the report, not duplicated on the fact card.
12. **Surfaced facts.** A surfaced fact creates a `canon_fact` at `proposed`, with steward-declared truth layer. It records sweep jurisdiction and enters the universal admission queue. If the report exists, the proposal links `derived_from` the report; otherwise that link is attached on close.
13. **Severity scaling.** Coverage demands render from admission-declared `admission_level` and `work_scale` facets. The flow never re-classifies severity. Foundational facts require the full domain-atlas sweep; major facts require multiple orders and direct/dependency/reaction domains; minor facts require immediate effects and ordinary-life residue when relevant.
14. **Consequence-scout prompt.** Propagation contributes `propagation_consequence_scout`, a versioned, steward-editable default prompt derived from `20_ai_assisted_workflow.md`. Prompt-out/paste-in uses the existing advisory-artifact machinery.
15. **Skips.** Declined propagation steps write `skip_record` mechanically. A reason is required only at major-or-higher thresholds.
16. **Provenance.** Records keep actor/timestamp provenance; propagation consequence, domain, disposition, proposal, and flow rows record the flow step that produced them.

## Existing Types and Links

No new record types are introduced. This flow uses existing `canon_fact`, `canon_debt`, `propagation_report`, `skip_record`, `advisory_artifact`, `canon_change_proposal`, `flow_instances`, `record_links`, `record_sections`, `record_facets`, `jurisdiction_events`, and prompt-template tables.

Existing link types used: `digest_of`, `derived_from`, `requires_follow_up`, and `cites_advisory_artifact` where advisory material informs steward-authored records. `preserves_boundary_for` remains available for later contradiction/mystery slices; this flow records the preservation boundary on the disposition row and in the report.

## Testing Seams

Primary seam: localhost HTTP API against temp-file world databases for owed queue, run start/resume, consequence writing, domain and negative-domain declarations, prompt-out/paste-in, skip recording, proposal routing, refused close, successful close, report search, digest links, and debt closure.

Secondary seam: direct store/SQL assertions for report append-only enforcement, coverage refusal, debt minting, link integrity, proposal jurisdiction, and consequence-disposition validation.

## Principles

Touches `charter.md` (P-3, P-4, T-8), `canon-sovereignty.md` (P-2, W-1), `domain-fidelity.md` (P-1, T-2), `workflow-principles.md` (P-5, W-2, W-3, W-4, W-7), `data-principles.md` (P-6, W-5, W-6, T-3, T-4, T-5), and ADRs 0001-0004. It affirms non-contradiction: the app clerks queueing, coverage, reports, links, and provenance; every judgment stays steward-authored; sweeps propose and admission admits; report-regime records remain master audit records.

T-8 coverage statement: `07` and `04` are field-tested surfaces in the package, so a guided propagation flow is licensed. Specialized pass flows for `08`-`17` remain out of scope and continue to have schema-level/generic-record coverage only.
