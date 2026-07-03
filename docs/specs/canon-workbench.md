# Canon Workbench Spec

This spec defines Worldloom Studio's read-only Canon Workbench surface: Current Canon, Audit Trail, and the shared record-detail payload. It is downstream of GitHub PRD #94, `docs/specs/schema-v1.md`, `docs/specs/creation-flow.md`, `docs/specs/admission-flow.md`, `docs/specs/propagation-flow.md`, `docs/specs/contradiction-retcon-mystery-flow.md`, `docs/specs/qa-flow.md`, `docs/specs/markdown-export.md`, `docs/worldbuilding-system/03_truth_layers_and_canon_governance.md`, `docs/worldbuilding-system/20_ai_assisted_workflow.md`, `docs/worldbuilding-system/21_templates_index.md`, `docs/worldbuilding-system/22_glossary.md`, the foundational principles, and ADRs 0001-0008.

"Canon Workbench" is a screen and PRD title, not a new app-layer domain term. The workbench uses existing methodology and app vocabulary: living record, audit trail, canon status, canon debt, skip record, advisory artifact, standing ruling, short ID, report regime, card regime, continuity scope, and typed links. No `CONTEXT.md` or ADR update is owed for the screen title.

## Fixed Decisions

1. **Read-only workbench.** The workbench reads the world file and never mutates `records`, `record_sections`, `record_facets`, `record_links`, `jurisdiction_events`, canon-debt records, advisory dispositions, flow instances, or flow-owned tables. Existing flow and record routes remain the only mutation surfaces.
2. **Route surface.** The read model is exposed through `GET /api/canon-workbench/current`, `GET /api/canon-workbench/audit`, and `GET /api/canon-workbench/records/:id`. Equivalent routes must preserve these payload responsibilities if renamed later.
3. **Current Canon default.** The default Current Canon result includes card-regime records whose canon status is `accepted`, `accepted with constraints`, `localized`, or `contested`.
4. **Current Canon explicit exclusions.** `proposed`, `under review`, `quarantined`, `superseded`, `deprecated`, and `rejected` records are excluded by default and become visible only through an explicit canon-status filter.
5. **Branch-only scope gate.** `branch-only` records are excluded by default. They appear only when the steward selects a continuity-scope filter or another branch-relevant filter such as `canonStatus=branch-only`, `truthLayer=branch canon`, or an explicit branch-relevant flag.
6. **Current Canon filters.** The Current Canon API supports filters for record type, truth layer, canon status, consequence mode when represented as a facet, continuity scope, open-canon-debt presence, and text query.
7. **Current Canon scan fields.** Rows expose short ID, title, record type key and label, truth layer, canon status, continuity scope, open-debt marker, advisory-use marker, and important typed-link markers. The browser renders this server-returned shape and does not recompute inclusion policy.
8. **Audit Trail report spine.** The Audit Trail uses report-regime records as the chronological spine, ordered by authored timestamp and then record ID. This is a governed sequence, not a raw event dump.
9. **Audit Trail attachments.** Spine items attach relevant record history, section history, skip records, canon-debt open/close context where the world file records it, advisory artifacts, standing rulings, advisory dispositions, jurisdiction events, typed-link creations, and already-persisted flow relationships under the affected record or report.
10. **No invented history.** The Audit Trail reads stored records, links, histories, dispositions, jurisdiction events, and flow-owned relationships. It does not fabricate missing historical data or retroactively event-source facts the schema never captured. A discovered blocking gap is a narrow follow-up, not permission to widen the schema in this slice.
11. **Spine and context remain distinct.** The Audit Trail payload separates the report spine item from attached context so the browser renders report-first governance rather than a flat event list.
12. **Shared detail payload.** Selecting a Current Canon row or Audit Trail item reads one record-first payload: identity, short ID, title, record type, truth layer, canon status, continuity scope, facets, sectioned prose, lifecycle timestamps, outgoing and incoming typed links, relevant record history, section history, related report-regime records, canon-debt records, skip records, advisory artifacts, standing rulings, advisory dispositions, and the per-record markdown export affordance.
13. **Existing export behavior.** The detail payload links to the existing per-record markdown route. It does not change markdown rendering.
14. **Browser consumer.** The browser exposes a Canon Workbench entry point from an open world and outside any flow. It renders Current Canon and Audit Trail as synchronized views and opens the shared detail pane from the detail API.
15. **Selection synchronization.** Selecting a Current Canon item reveals matching Audit Trail context when stored relationships make it available. Selecting an Audit Trail item reveals affected current records when they still stand.
16. **Empty states.** The browser distinguishes "No world is open" from "No current canon matches these filters."
17. **Deferred surfaces.** Graph-first visualization, atlas views, branch management, collaboration workflow, prompt-out behavior, canon mutation controls, flow automation, import, sync, publishing, and browser-storage features are out of scope.

## Testing Seams

Primary seam: the existing localhost HTTP app seam against temp-file world databases. Tests populate worlds through existing record, section, facet, link, flow, advisory, canon-debt, skip, and export routes, then assert Current Canon defaults and filters, Audit Trail chronology and attachment categories, record-detail payload shape, export affordance, and no mutation of record counts, lifecycle fields, history rows, section-history rows, link rows, debt state, or advisory dispositions.

Browser seam: thin React browser-surface tests verify the Canon Workbench entry point, Current Canon controls, empty states, Audit Trail spine/context rendering, selection synchronization wiring, detail-pane wiring, and API route consumption. Browser tests do not duplicate the server's inclusion, chronology, or relationship policy.

No store seam is introduced. Add store-level tests only if a later implementation adds persistence support or schema/index changes; then those tests cover that persistence narrowly.

## Principles

Touches `docs/principles/README.md` and affirms non-contradiction with:

- `charter.md` P-3, P-4, T-8: the workbench is mechanized continuity-clerk work. It remembers, indexes, cross-references, surfaces status, and answers governed read questions without judging canon.
- `data-principles.md` P-6, W-5, W-6, T-3, T-4, T-5: the world file remains canonical; Current Canon renders living card records; Audit Trail renders report-regime chronology; prose, short IDs, typed links, and provenance stay intact.
- `workflow-principles.md` P-5, W-3, W-4, W-7: the workbench sits in the ungated margin, reads across flows, does not admit or repair facts, and surfaces skips and owed work as governed records.
- `canon-sovereignty.md` P-2, W-1, T-5: advisory artifacts and standing rulings are displayed as advisory provenance, never interpreted as canon, and no prompt-out or LLM behavior is added.
- `domain-fidelity.md` P-1, T-2: UI and filters use methodology and seeded-vocabulary terms verbatim. The screen title does not replace package vocabulary.
- ADR 0001: the SQLite world file remains canonical. ADR 0002: the local native process serves the read surface and browser storage is not canonical. ADR 0003: scoped and branch-only records are readable without building branch management. ADR 0004: no stack change. ADR 0005: no new CI or lint policy is introduced. ADR 0006: Admission remains the only flow that changes canon standing. ADR 0007: Prompt-out artifacts are consumed as existing advisory records. ADR 0008: flow-owned persistence remains owned by flows; the workbench composes read outputs.

No deliberate exceptions.
