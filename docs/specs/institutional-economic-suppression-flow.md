# Institutional, Economic, and Suppression Flow Spec

This spec defines Worldloom Studio's stage-12 guided flow: `12_institutional_economic_and_suppression_protocol.md` plus `checklists/institutional_economic_suppression_sweep.md`. It is downstream of GitHub PRD #100, `docs/specs/schema-v1.md`, the existing flow specs, the foundational principles, ADRs 0001-0008, `docs/worldbuilding-system/12_institutional_economic_and_suppression_protocol.md`, `docs/worldbuilding-system/checklists/institutional_economic_suppression_sweep.md`, and `docs/worldbuilding-system/21_templates_index.md`.

"Institutional, Economic, and Suppression flow" is a protocol-specific flow name, not a new app-layer glossary term. The flow uses package vocabulary verbatim: action arena, rules-in-use, transaction cost, surplus capture, suppression residue, counter-institution, synthesis sentence, daily-life residue, power conflict, pass report, advisory artifact, skip record, and canon debt.

## Fixed Decisions

1. **Flow key.** The durable flow key is `institutional_economic_suppression`.
2. **Run entry.** A run starts from a selected canon or under-review fact, a canon debt item, selected world material, a record section, or an existing in-progress stage-12 `pass_report`.
3. **Report as master record.** Starting a run creates or reuses exactly one append-only `pass_report`. The report identifies source, analyzed subject, flow status, coverage, linked records, advisory artifacts, skips, proposed Admission items, and follow-up canon debt. Because reports are append-only, close details are inserted as report sections once, at close.
4. **Doctrine payload.** Every run response includes the stage-12 protocol source, checklist source, template-index source, required lenses, and close policy. Browser code consumes this payload and does not encode completion policy locally.
5. **Required coverage slots.** Close requires steward-authored substance for action arena, rules-in-use, transaction cost, surplus capture, suppression residue, counter-institution, synthesis sentence, daily-life residue, and power conflict. A checkbox alone is not evidence.
6. **Close readiness.** The server groups blockers by missing stage-12 evidence and unresolved governed outcomes. Browser code renders server blockers only.
7. **Cards and links.** The flow can create or link `action_arena`, `institution`, and `counter_institution` cards. New cards are proposed analysis structure and do not admit new canon facts. Report/card/source relationships are typed links.
8. **Admission proposal routing.** Surfaced facts or repairs route through Admission intake at `proposed` with provenance to the pass report, source material when record-backed, the motivating coverage lens, and any advisory artifact explicitly used.
9. **Canon debt routing.** Unresolved institutional/economic/suppression work mints `canon_debt` with lens/scope, reason, severity or consequence mode when known, source report, and report links.
10. **Prompt-out advisory use.** Stage 12 uses the existing Prompt-out lifecycle with an institution/economy analyst prompt. Advisory artifacts are immutable. Advisory material can influence a proposal, debt item, card, or report conclusion only after the steward records an explicit disposition; explicit-use links are then created.
11. **Governed skips.** Skips use existing skip-record semantics. Major-or-higher skips require a steward-visible reason. If an unresolved consequence remains, the skip creates or preserves follow-up canon debt.
12. **Canon Workbench and audit visibility.** Existing Current Canon, record detail, and Audit Trail read models expose stage-12 reports, linked cards, proposals, debt, advisory artifacts, dispositions, skip records, and flow chronology. No mutation controls are added.
13. **Browser consumer.** The browser provides entry/resume, source display, doctrine/checklist, coverage editors, linked-card controls, Prompt-out/advisory controls, proposal/debt/skip controls, server-returned blockers, and close wiring. It does not duplicate completion, advisory, skip, Admission, or canon-mutation policy.
14. **No broader framework.** This flow may add the smallest `pass_report` lifecycle support it needs. It does not introduce a generic all-specialized-passes framework.
15. **No context or ADR update.** No new `CONTEXT.md` or ADR update is owed unless implementation discovery changes the boundary.

## Existing Types and Links

No new canon-facing record types are introduced. The flow uses existing `pass_report`, `action_arena`, `institution`, `counter_institution`, `canon_fact`, `canon_debt`, `skip_record`, `advisory_artifact`, `canon_change_proposal`, `flow_instances`, `record_links`, `record_sections`, and `advisory_dispositions`.

Existing link types used: `derived_from`, `covers`, `requires_follow_up`, and `cites_advisory_artifact`. Creating or linking cards records analysis structure; any canon-changing claim re-enters Admission at `proposed`.

## Testing Seams

Primary seam: localhost HTTP API against temp-file world databases for start/resume, doctrine payload, report creation/reuse, provenance, required coverage, close refusal, successful close, card create/link, proposal routing, debt routing, advisory disposition and explicit use, governed skips, and Canon Workbench/audit visibility.

Browser seam: thin React surface tests verify the stage-12 entry point, run controls, doctrine/checklist rendering, coverage editors, server blocker display, card/proposal/debt/Prompt-out/skip controls, close wiring, and server-policy consumption.

No store seam is required beyond migration coverage because flow-owned persistence follows ADR 0008 and behavior is proven through the HTTP app seam.

## Principles

Touches `docs/principles/README.md` and affirms non-contradiction with:

- `docs/worldbuilding-system/12_institutional_economic_and_suppression_protocol.md`: the software encodes the stage-12 lenses instead of inventing a generic politics workflow.
- `docs/worldbuilding-system/checklists/institutional_economic_suppression_sweep.md`: completed runs leave substance for the mandatory institutional/economic/suppression surfaces.
- `docs/worldbuilding-system/21_templates_index.md`: specialized pass output lives in one `pass_report`, and new facts re-enter Admission.
- `domain-fidelity.md` P-1/T-2: methodology terms keep their package meaning.
- `canon-sovereignty.md` P-2/W-1/T-5: Prompt-out is advisory; the flow never lets an LLM or checklist canonize material.
- `workflow-principles.md` P-5/W-2/W-3/W-4/W-7: flows are resumable, skips are records, sweeps propose, and gates demand substance.
- `data-principles.md` P-6/W-5/W-6/T-3/T-4/T-5: the world file remains canonical; records, links, provenance, and report sections preserve the audit trail.
- `charter.md` P-3/P-4/T-8: the app clerks consequence and governance rather than replacing the methodology with generic project management.
- ADRs 0001-0008: SQLite remains canonical, browser storage is non-canonical, the stack and GitHub gates are unchanged, Admission owns canon intake, Prompt-out owns advisory mechanics, and stage-12 SQL lives with the flow module.

No deliberate exceptions.
