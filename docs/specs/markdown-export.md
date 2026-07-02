# Markdown Export Spec

This spec defines Worldloom Studio's markdown export surface: whole-world directory export and per-record markdown rendering. It is downstream of `docs/specs/schema-v1.md`, `docs/worldbuilding-system/21_templates_index.md`, the package templates in `docs/worldbuilding-system/templates/`, the foundational principles, and ADRs 0001-0004.

Export is a read-only view over the world file. The SQLite database remains the record; markdown is an owned, human-readable rendering of the current record store.

## Fixed Decisions

1. **Two export grains.** The app supports per-record markdown export and whole-world directory export. There is no filtered export, import, round-trip, watch mode, HTML, PDF, static site, or markdown-as-source behavior in this slice.
2. **No schema change.** Export uses existing records, sections, section history, facets, typed links, vocabulary rows, advisory dispositions, and world metadata. No new record types, vocabularies, link types, or tables are expected. If implementation discovery proves otherwise, surface it before continuing.
3. **Instrument-form rendering.** Every record renders as a markdown instrument derived from its record type's package source. Template-backed record types use their package headings. Record types without a dedicated template file render the same record envelope plus their steward prose, sections, facets, links, and history under a derived app form cited to the package source.
4. **Prose fidelity.** Record body prose and section prose are emitted verbatim. The renderer does not summarize, reflow, or invent structure beyond the record envelope and stored package headings.
5. **Optional empty sections.** Empty optional sections are omitted. Export must not pad records with empty scaffolding.
6. **Facet fidelity.** Truth layer, canon status, and record facets render in the stored package wording. Vocabulary names stay separate; they are not merged into display-only labels.
7. **Regime-faithful rendering.** Card-regime records render current wording as the live present tense plus history notes for retired record and section wording. Report-regime records render body and sections in stored append/order position exactly as written.
8. **Typed links as citations.** Typed links render as readable references with direction, link type, target short ID, and target title. Short IDs are the citation identifiers; hierarchical display numbers are never load-bearing.
9. **Advisory artifacts.** Advisory artifact records export verbatim like any report-regime record, including prompt and response text and any advisory disposition context.
10. **Draft exclusion.** Drafts are not records and never export.
11. **Source identity.** Every exported record and the whole-world index state the source world file path and schema version.
12. **Per-record export.** The per-record route returns the rendered markdown payload for any record from an open world. It writes nothing to the world file.
13. **Whole-world export.** The whole-world route accepts a steward-chosen destination directory and writes one markdown file per record plus `index.md`.
14. **Filenames.** Record filenames are stable within a world: `<short-id>-<title-slug>.md`, with the short ID making collisions impossible. If the title slug is empty, use `<short-id>.md`.
15. **Index.** `index.md` groups every exported record by record type and lists short ID, title, and markdown filename. The index is the navigation surface for reading the directory without the app.
16. **Re-export stale-file behavior.** Re-export reads the previous `index.md` generated-file manifest, removes only files named in that manifest, and writes the current record set and current index. Unrelated files in the destination directory are left alone.

## Record-Type Export Matrix

All current record types export.

| Record type | Regime | Export form source |
|---|---|---|
| `world_kernel` | card | `docs/worldbuilding-system/templates/world_kernel.md` |
| `canon_fact` | card | `docs/worldbuilding-system/templates/canon_fact_card.md` |
| `constraint` | card | `docs/worldbuilding-system/templates/constraint_card.md` |
| `capability` | card | `docs/worldbuilding-system/templates/capability_card.md` |
| `spatial_region` | card | `docs/worldbuilding-system/templates/spatial_region_card.md` |
| `temporal_timeline` | card | `docs/worldbuilding-system/templates/temporal_timeline_card.md` |
| `institution` | card | `docs/worldbuilding-system/templates/institution_card.md` |
| `counter_institution` | card | `docs/worldbuilding-system/templates/counter_institution_card.md` |
| `agent_character` | card | `docs/worldbuilding-system/templates/agent_character_card.md` |
| `action_arena` | card | `docs/worldbuilding-system/templates/action_arena_card.md` |
| `aesthetic_coherence` | card | `docs/worldbuilding-system/templates/aesthetic_coherence_card.md` |
| `mystery_ledger_entry` | card | `docs/worldbuilding-system/templates/mystery_ledger_entry.md` |
| `admission_ledger_row` | card | `docs/worldbuilding-system/templates/admission_ledger.md` |
| `canon_debt` | card | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| `skip_record` | card | `docs/worldbuilding-system/21_templates_index.md` |
| `canon_branch_diff` | card | `docs/worldbuilding-system/templates/canon_branch_diff.md` |
| `propagation_report` | report | `docs/worldbuilding-system/templates/propagation_report.md` |
| `contradiction_report` | report | `docs/worldbuilding-system/templates/contradiction_report.md` |
| `uncertainty_evidence_card` | report | `docs/worldbuilding-system/templates/uncertainty_evidence_card.md` |
| `canon_change_proposal` | report | `docs/worldbuilding-system/templates/canon_change_proposal.md` |
| `collaboration_decision_record` | report | `docs/worldbuilding-system/templates/collaboration_decision_record.md` |
| `gate_result` | report | `docs/worldbuilding-system/06_canon_fact_admission_protocol.md` |
| `pass_report` | report | `docs/worldbuilding-system/21_templates_index.md` |
| `qa_scorecard` | report | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| `seed_decomposition` | report | `docs/worldbuilding-system/05_creation_protocol.md` |
| `advisory_artifact` | report | `docs/worldbuilding-system/20_ai_assisted_workflow.md` |

## Testing Seams

Primary seam: the existing localhost HTTP API against temp-file world databases. Tests drive record creation, section/facet/history setup, typed links, advisory artifacts, per-record export, and whole-world directory export. Assertions observe returned markdown payloads and filesystem output: record files, index content, stable filenames, link references, card history, report order, draft exclusion, source world path, schema version, re-export stale-file cleanup, and no world-file record mutation.

Secondary seam: the web shell unit/browser surface. Web tests and browser smoke verify the ungated per-record export action and whole-world export action are visible from an open world and call the HTTP export routes without relying on browser storage as canonical data.

No store seam and no new seam are introduced. Export performs no database writes.

## Principles

Touches `docs/principles/README.md` (conformance rule), data-principles.md (P-6, W-5, W-6, T-3, T-4, T-5), domain-fidelity.md (P-1, T-2), canon-sovereignty.md (P-2, T-5), charter.md (P-3, T-8), workflow-principles.md (P-5), and ADRs 0001-0004. This spec affirms non-contradiction: export is clerk work over existing records, preserves steward prose and package vocabulary, uses short IDs for citation, keeps the database canonical, and uses the native process for filesystem writes.
