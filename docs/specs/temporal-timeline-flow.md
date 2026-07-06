# Temporal/Timeline Flow Spec

This spec defines Worldloom Studio's dedicated guided flow for `09_temporal_and_timeline_protocol.md`, `checklists/temporal_timeline_sweep.md`, and `templates/temporal_timeline_card.md`. It is downstream of GitHub PRD #201, the foundational principles, ADRs 0001-0009, `docs/specs/browser-visible-guidance-acceptance.md`, `docs/specs/prompt-out-context-assembly.md`, `docs/specs/workflow-map-and-navigation.md`, and the existing Admission, Prompt-out, Canon Workbench, and method-card specs.

"Temporal/Timeline flow" is a protocol-specific flow name. It uses package vocabulary directly: first true, first known, event date, discovery date, public date, institutional date, ordinary-life date, mythic date, latency, residue, sequence integrity, retrospective insertion, temporal mystery boundary, temporal timeline card, pass report, advisory artifact, skip record, and canon debt.

## Package Authority

- Package source files: `docs/worldbuilding-system/09_temporal_and_timeline_protocol.md`, `docs/worldbuilding-system/checklists/temporal_timeline_sweep.md`, `docs/worldbuilding-system/templates/temporal_timeline_card.md`, and `docs/worldbuilding-system/20_ai_assisted_workflow.md`.
- Templates, checklists, and cross-flow specs: `docs/specs/guided-flow-spec-template.md`, `docs/specs/browser-visible-guidance-acceptance.md`, `docs/specs/prompt-out-context-assembly.md`, `docs/specs/workflow-map-and-navigation.md`, and `docs/specs/method-cards.md`.
- Controlled vocabularies or package terms: `canon_status`, `truth_layer`, `work_scale`, `admission_level`, advisory dispositions, and existing typed links.
- Known package divergences: branch/collaboration UI remains closed by ADR 0003; the flow records branch chronology or temporal mystery boundaries without building branch management.

## Flow Purpose and Non-Goals

- Purpose: guide a steward through the `09` temporal sweep: temporal questions, date-type separation, granularity, latency, residue, sequence integrity, retrospective insertion, mystery boundaries, outcome routing, Prompt-out pressure, governed skips, and a durable append-only pass report.
- Steward-owned judgments: whether the trigger recommendation applies, date type, granularity, sequence explanation, latency plausibility, residue scale, boundary wording, whether a card is warranted, whether material is canon-worthy, and final prose.
- App-owned clerking: source capture, trigger recommendation display, doctrine payload, method cards, blockers, report assembly, links, proposal/debt routing, advisory artifact handling, skip records, close readiness, and read-side trail.
- Explicit non-goals: no automatic trigger classification, no automatic date inference, no timeline graph, no branch-management UI, no generic all-specialized-passes framework, no LLM API integration, no automatic canon mutation, and no replacement of read-side views with mutation workflows.

## Fixed Decisions

1. **Flow key.** The durable flow key is `temporal_timeline`.
2. **Run entry.** A run starts from a selected `canon_fact`, `capability`, `canon_debt`, selected material, or an existing in-progress Temporal `pass_report`.
3. **Report as master record.** Starting a run creates or reuses exactly one append-only `pass_report`. Closing inserts source/run, linked cards, Admission proposals, canon debt, Prompt-out/skips, and close-readiness sections once.
4. **Doctrine payload.** Every run response includes the `09` protocol source, sweep checklist source, temporal timeline card template source, trigger recommendation, completion rule, step map, method cards, and browser policy boundary.
5. **Required evidence.** Close requires steward-authored substance for first-true or relative sequence, first-known timing or reason, date types and granularity, latency, residue by timescale, sequence integrity, temporal mystery boundaries, and outcome decision. Checkbox-only answers, generic empty answers, and unreasoned `none` do not satisfy readiness.
6. **Temporal timeline cards.** The flow can create or link a `temporal_timeline` card only when the steward chooses. Card creation preserves steward-authored material and requires steward-supplied truth layer and canon status.
7. **Admission proposal routing.** New fact-shaped timing discoveries route through Admission at `proposed`, with provenance to the pass report, source material, and flow step.
8. **Canon debt routing.** Deferred boundaries, unresolved forbidden uses, missing residue, declined pressure, or no-card follow-up can become `canon_debt` linked to the pass report.
9. **Prompt-out.** The flow uses the existing Prompt-out lifecycle with the `temporal_spatial_analyst` template. Packets include current decision, source, Temporal coverage, doctrine, omissions, advisory/canon warning, and source manifest.
10. **Advisory material.** Pasted responses are immutable advisory artifacts. They influence reports, cards, proposals, debt, or skips only after explicit disposition and explicit-use linking.
11. **Governed skips.** Offered instruments and steps may be skipped. Major-or-higher skipped Temporal work requires a reason and preserves or creates canon debt when unresolved work remains.
12. **Read-side trail.** Current Canon, Audit Trail, record detail, and export surfaces show or link pass reports, timeline cards, proposals, debt, advisory artifacts, dispositions, skip records, and explicit-use links.
13. **No schema migration.** The flow uses existing records, sections, links, prompt templates, advisory dispositions, and `flow_instances`.

## Step Map

| Step | Package source | Decision point | Dependency-bearing | Severity path | Prompt-out modes and pressure role |
|---|---|---|---|---|---|
| Run entry and trigger recommendation | `09` and guided-flow specs | Choose source material and decide whether the Temporal trigger recommendation matters. | yes | Level 2+ recommendation is displayed as guidance; the app does not classify applicability. | Proposal mode can request labeled timing candidates; pressure is blocked until steward-authored material exists. |
| Temporal questions | `09` temporal questions | Record when the fact became true, became known, adapted, and left residue. | yes | Major-or-higher work owes fuller answers. | Proposal and pressure modes use Spatial-temporal analyst. |
| Date type and granularity | `09` date and granularity rules | Separate event, discovery, public, institutional, ordinary-life, mythic, and authorial revision dates; choose sufficient granularity. | yes | Granularity is steward judgment; close requires prose. | Proposal mode can suggest labeled date facets; pressure mode challenges collapsed dates. |
| Latency and residue | `09` latency and residue rules | Explain plausible delay and residues across the relevant timescale. | yes | Older/load-bearing facts owe stronger residue. | Pressure challenges instant adaptation and missing fossils. |
| Sequence integrity and retrospective insertion | `09` sequence and retcon rules | Check cause/effect order and what inserted facts disturb. | yes | Retcon or branch pressure raises evidence depth without adding branch UI. | Pressure challenges impossible sequences and unworked prior scenes. |
| Temporal mystery boundaries | `09` temporal mystery section and ADR 0003 | Record observable boundaries without solving protected time mysteries or adding branch UI. | yes | Protected boundaries require explicit prose. | Pressure challenges unmanaged prophecy, cycles, missing years, or forbidden uses. |
| Outcomes | `09`, `templates/temporal_timeline_card.md`, W-3, and ADR 0006 | Choose timeline card, Admission proposal, canon debt, explicit no-card close, or non-mutation. | yes | Receiving flows own later severity. | Proposal and pressure modes remain advisory; Admission admits facts later. |
| Prompt-out and skips | `20`, W-1, W-4, and ADR 0007 | Use, dispose, cite, or skip advisory Temporal pressure. | yes | Major skipped work requires a reason and may create debt. | Spatial-temporal analyst. |
| Close preview | checklist completion rule | Confirm substance and append the report. | yes | Server blockers only. | Prompt-out can be skipped; pressure mode never changes canon standing directly. |
| Read-side trail | W-5, W-6, W-8, and ADR 0009 | Follow report, source, cards, proposals, debt, advisory artifacts, and skips. | no | Not severity-dependent. | None. |

## Browser Acceptance Scenarios

At least one representative scenario shows entry or resume, trigger recommendation, current decision, doctrine at point of use, required/optional/skippable/severity-dependent obligations, server blocker/substance validation, saved coverage, Prompt-out preview and advisory separation, a card/proposal/debt/skip or explicit non-mutation, write intent, read-side trail, safe exit, and resume state.

The naive-steward walkthrough should prove the steward can:

1. identify that the decision is Temporal/Timeline work, not generic record editing;
2. see why `09` asks the current timing question;
3. distinguish required evidence from optional outcomes and governed skips;
4. see Prompt-out as advisory pressure, not canon generation;
5. predict what the app will write, link, route, or leave untouched;
6. exit and resume from the pass report;
7. tell which file paths are provenance and which visible text is the operating instruction.

## Testing Seams

- API/server seam: HTTP app tests against temp-file world databases for start/resume, doctrine payload, one pass report, required coverage, close refusal, successful close, temporal card create/link, Admission proposal routing, canon debt routing, advisory disposition and explicit use, governed skips, Prompt-out context, and read-side trail.
- Browser seam: React/component-render tests and a representative browser walkthrough verify entry controls, trigger recommendation, coverage editors, server blocker display, card/proposal/debt/Prompt-out/skip controls, close wiring, and server-policy consumption.
- Store seam: no separate direct-store seam by default because behavior is proven through HTTP and existing append-only records/sections/links.
- Acceptance artifacts: root gates `pnpm test`, `pnpm typecheck`, `pnpm build`; browser proof recorded separately because there is no repo-wide browser/e2e hard gate.

## Principles

Touches `docs/principles/README.md` and affirms non-contradiction with:

- `docs/worldbuilding-system/09_temporal_and_timeline_protocol.md`: the flow preserves timing as causality under sequence, latency, residue, and mystery boundaries.
- `docs/worldbuilding-system/checklists/temporal_timeline_sweep.md`: close readiness requires worked evidence, not checkboxes.
- `docs/worldbuilding-system/templates/temporal_timeline_card.md`: timeline cards remain steward-authored reasoning instruments.
- `docs/worldbuilding-system/20_ai_assisted_workflow.md`: AI remains advisory pressure and never canon authority.
- `charter.md` P-3/P-4/T-8: the app clerks continuity and causality for a field-tested surface.
- `domain-fidelity.md` P-1/T-2: package terms and vocabularies are preserved without auto-classification.
- `canon-sovereignty.md` P-2/W-1/T-5 and ADR 0006: Temporal proposes and routes; Admission owns canon standing.
- `workflow-principles.md` P-5/W-1/W-2/W-3/W-4/W-7: the flow is resumable, severity-aware, Prompt-out-capable, skip-record-aware, Admission-routed, and substance-gated.
- `guided-workflow-usability.md` W-8: the browser presents decision points, not generic CRUD.
- `data-principles.md` P-6/W-5/W-6/T-3/T-4/T-5/T-6: the local world file remains canonical; reports are append-only; provenance and typed links carry the trail.
- ADRs 0001-0009: SQLite remains canonical, browser storage is non-canonical, branch/collaboration UI remains closed, the TypeScript/Hono/React stack remains, GitHub gates are unchanged, Admission owns canon intake, Prompt-out owns advisory mechanics, flow-owned persistence stays local to the flow, and browser workflow state renders server-owned policy.

No deliberate exceptions.
