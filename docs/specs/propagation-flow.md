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

## Cross-Flow Admission Priority

Owed Propagation remains a paved path rather than a gate. After Creation prerequisites and required seed-family coverage are clear, a world with both proposed Admission work and open routeable Propagation debt from accepted canon foregrounds owed Propagation as the workflow map's primary next decision when no separately preserved destination case governs the payload. A routeable owed item has both its existing typed source-fact relationship and its existing non-null start/resume route. The server-owned reason explains that the accepted fact's shock cone is owed before further dependency-bearing Admission.

Admission retains ownership of canon standing and remains visible, active when its queue has work, and directly navigable. Foregrounding Propagation does not infer that the queued proposal depends on the debt source, block Admission, admit canon, close debt, create a run, write a deferral or skip, or otherwise mutate the world. Debt without the typed source fact or start/resume route remains visible with its missing-source blocker and does not qualify as the primary startable decision.

The workflow map consumes the existing Propagation queue's debt identity, source-fact identity, declared severity context, blocker state, and action route. The browser renders that server-owned state without recomputing severity, source linkage, routeability, or cross-queue priority. The existing workflow-map payload is sufficient; this contract adds no schema field, record type, persistence store, controlled vocabulary, scheduler, or generalized priority framework. Creation coverage precedence and the established Admission-only, Propagation-only, owed-boundary, Temporal/Timeline, Minimal Viable World, QA, and other destination cases remain unchanged.

## Step Map

| Step | Package source | Decision point | Dependency-bearing | Severity path | Prompt-out modes and pressure role |
|---|---|---|---|---|---|
| Run entry | `07_propagation_engine.md` | Start the shock cone from a canon fact or propagation-scoped canon debt. | yes | Coverage is derived from existing `admission_level` and `work_scale` facets; the flow never reclassifies severity. | Proposal and pressure modes use `propagation_consequence_scout`; pressure is Consequence scout over source fact material. |
| Shock-cone orders | `07_propagation_engine.md` | Record zeroth through fifth-order consequences as steward-written prose. | yes | Major-or-higher facts require multiple orders; foundational facts require the deepest coverage. | Proposal mode can suggest labeled consequences; pressure mode challenges adaptations, countermeasures, fossils, and assumptions. |
| Domain-atlas sweep | `04_domain_atlas.md` | Mark domains direct, dependency, reaction, negative, or unswept with explanation where owed. | yes | Major-or-higher facts owe direct/dependency/reaction coverage; foundational facts owe the full atlas. | Proposal mode can suggest candidate domain pressure; pressure mode challenges quiet domains and missing residues. |
| Consequence disposition | `07_propagation_engine.md` | Choose answered, intentionally scoped out, assigned as canon debt, or protected as a mystery boundary. | yes | All high-pressure consequences block close until dispositioned. | Proposal mode can label stopping-state candidates; pressure mode tests whether the stop state hides unresolved work. |
| Surfaced proposals | `06_canon_fact_admission_protocol.md` and `07_propagation_engine.md` | Route surfaced facts to Admission at `proposed`. | yes | Admission later owns severity. | Proposal mode can shape candidates; pressure mode cannot admit facts and must preserve advisory/canon warning. |
| Close/result | `07_propagation_engine.md` and `21_templates_index.md` | Write the append-only propagation report and read-side trail after blockers clear. | yes | Close is blocked by undispositioned high-pressure consequences. | Prompt-out remains optional/skippable; used advisory material must be explicitly disposed and linked. |

## Decision-Point UI Contract

This flow must satisfy `guided-workflow-usability.md` W-8 and `guided-flow-spec-template.md`.

- **Run entry:** the browser shows whether the steward is working owed propagation debt or an elective fact, cites the source fact/debt, and makes clear that the flow organizes consequences without admitting facts.
- **Shock-cone orders:** each order shows the decision to write or stop a consequence, the relevant `07` doctrine, severity-derived expectations, consequence-scout prompt packet, and any blockers for high-pressure consequences.
- **Domain-atlas sweep:** the browser shows the fourteen `04` domains, distinguishes direct/dependency/reaction/negative/unswept states, requires negative-domain declarations where selected, and explains which domains remain unswept.
- **Disposition:** the browser shows the stop-when-governed choices, their package meaning, the write or routing effect of each choice, and whether the result creates canon debt, protects a mystery boundary, or surfaces a proposed fact.
- **Close/result:** the browser previews the append-only propagation report, digest link, surfaced Admission proposals, debt, protected boundaries, skip records, advisory-use links, and read-side trail.

## Existing Types and Links

No new record types are introduced. This flow uses existing `canon_fact`, `canon_debt`, `propagation_report`, `skip_record`, `advisory_artifact`, `canon_change_proposal`, `flow_instances`, `record_links`, `record_sections`, `record_facets`, `jurisdiction_events`, and prompt-template tables.

Existing link types used: `digest_of`, `derived_from`, `requires_follow_up`, and `cites_advisory_artifact` where advisory material informs steward-authored records. `preserves_boundary_for` remains available for later contradiction/mystery slices; this flow records the preservation boundary on the disposition row and in the report.

## Testing Seams

Primary seam: localhost HTTP API against temp-file world databases for owed queue, run start/resume, consequence writing, domain and negative-domain declarations, prompt-out/paste-in, skip recording, proposal routing, refused close, successful close, report search, digest links, and debt closure.

Secondary seam: direct store/SQL assertions for report append-only enforcement, coverage refusal, debt minting, link integrity, proposal jurisdiction, and consequence-disposition validation.

## Principles

Touches `charter.md` (P-3, P-4, T-8), `canon-sovereignty.md` (P-2, W-1), `domain-fidelity.md` (P-1, T-2), `workflow-principles.md` (P-5, W-2, W-3, W-4, W-7), `guided-workflow-usability.md` (W-8), `data-principles.md` (P-6, W-5, W-6, T-3, T-4, T-5), and ADRs 0001-0004 and 0009. It affirms non-contradiction: the app clerks queueing, coverage, reports, links, and provenance; every judgment stays steward-authored; sweeps propose and admission admits; report-regime records remain master audit records.

T-8 coverage statement: `07` and `04` are field-tested surfaces in the package, so a guided propagation flow is licensed. Specialized pass flows for `08`-`17` remain out of scope and continue to have schema-level/generic-record coverage only.
