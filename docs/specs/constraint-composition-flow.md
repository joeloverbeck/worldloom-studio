# Constraint Composition Flow Spec

This spec defines Worldloom Studio's Constraint Composition guided flow for `08_constraint_composition.md`, `checklists/constraint_composition_sweep.md`, and `templates/constraint_card.md`. It is downstream of GitHub PRD #141, `docs/specs/schema-v1.md`, the existing guided-flow specs, the foundational principles, ADRs 0001-0009, `docs/worldbuilding-system/08_constraint_composition.md`, `docs/worldbuilding-system/checklists/constraint_composition_sweep.md`, `docs/worldbuilding-system/templates/constraint_card.md`, `docs/worldbuilding-system/20_ai_assisted_workflow.md`, `docs/specs/browser-visible-guidance-acceptance.md`, `docs/specs/prompt-out-context-assembly.md`, and `docs/specs/workflow-map-and-navigation.md`.

"Constraint Composition flow" is a protocol-specific flow name, not a new app-layer glossary term. The flow uses package vocabulary verbatim: constrained fact, constraint budget, constraint type, stacking, gate, tradeoff, threshold, sequential constraint, cancellation, contradiction, leakage, enforcement, bypass actor, countermeasure, residue, constraint card, advisory artifact, skip record, canon debt, and pass report.

## Package Authority

- Package source files: `docs/worldbuilding-system/08_constraint_composition.md`, `docs/worldbuilding-system/checklists/constraint_composition_sweep.md`, `docs/worldbuilding-system/templates/constraint_card.md`, and `docs/worldbuilding-system/20_ai_assisted_workflow.md`.
- Templates, checklists, and cross-flow specs: `docs/specs/guided-flow-spec-template.md`, `docs/specs/browser-visible-guidance-acceptance.md`, `docs/specs/prompt-out-context-assembly.md`, and `docs/specs/workflow-map-and-navigation.md`.
- Controlled vocabularies or package terms: `constraint_type`, `canon_status`, `truth_layer`, `work_scale`, `admission_level`, advisory dispositions, and existing typed links.
- Known package divergences: none.

## Flow Purpose and Non-Goals

- Purpose: guide a steward through constraint inventory, composition testing, leakage, residue, outcome routing, Prompt-out pressure, governed skips, and a durable append-only pass report.
- Steward-owned judgments: constraint type, boundary meaning, whether a loophole matters, whether a constraint is worth keeping, whether material is canon-worthy, and final wording.
- App-owned clerking: source capture, doctrine payload, step map, blockers, report assembly, links, proposal/debt routing, advisory artifact handling, skip records, close readiness, and read-side trail.
- Explicit non-goals: no Temporal/Timeline flow, no generic specialized-pass framework, no automatic constraint classification, no LLM API integration, no automatic canon mutation, no replacement of read-side views with mutation workflows.

## Fixed Decisions

1. **Flow key.** The durable flow key is `constraint_composition`.
2. **Run entry.** A run starts from a selected `canon_fact` or `capability`, an existing `constraint` card, a `canon_debt` item, selected world material, a record section, or an existing in-progress Constraint Composition `pass_report`.
3. **Report as master record.** Starting a run creates or reuses exactly one append-only `pass_report` for the run. Closed sections are inserted once at close.
4. **Doctrine payload.** Every run response includes the `08` protocol source, sweep checklist source, constraint-card template source, completion rule, and browser policy boundary.
5. **Required evidence.** Close requires steward-authored substance for constraint budget, loopholes, enforcement, and residue. Checkbox-only answers, generic empty answers, and unreasoned "none" do not satisfy readiness.
6. **Constraint cards.** The flow can create or link a `constraint` card when the steward chooses. Card creation preserves steward-authored material and only records a constraint type when one was supplied.
7. **Admission proposal routing.** New facts, repair candidates, and constraints-as-canon-claims route through Admission at `proposed` with provenance to the pass report, source material, constrained subject, and flow step.
8. **Canon debt routing.** Missing enforcement, under-tested leakage, absent residue, unresolved contradiction, owed constraint card, or deferred follow-up work can become `canon_debt` linked to the pass report.
9. **Prompt-out.** The flow offers the `Constraint challenger` role only after steward-authored material exists. Prompt packets must include current decision, constrained fact, source material, existing constraints, doctrine, role request, forbidden moves, output labels, advisory warning, source manifest, and omissions.
10. **Advisory material.** Pasted responses are immutable advisory artifacts. They influence reports, cards, proposals, debt, or skips only after explicit disposition and explicit-use linking.
11. **Governed skips.** Offered instruments and steps may be skipped. Major-or-higher skipped constraint work requires a reason and preserves or creates canon debt when unresolved work remains.
12. **Read-side trail.** Current Canon, Audit Trail, record detail, and export surfaces show or link relevant reports, constraint cards, proposals, debt, advisory artifacts, dispositions, skip records, and explicit-use links.
13. **No context or ADR update.** No root `CONTEXT.md` or ADR change is owed unless implementation discovery changes the boundary.

## Step Map

| Step | Package source | Decision point | Dependency-bearing | Severity path | Prompt-out role |
|---|---|---|---|---|---|
| Start/resume and source selection | `08`, guided-flow specs | Choose the source and constrained subject. | no | source-driven | none |
| Constrained-fact framing | `08` constraint test | Name what is limited and why it matters. | yes | major work gets full reason trail | Constraint challenger |
| Constraint inventory | checklist inventory | Record constraints, type, prevention, allowance, knowledge, bypass actors, cause, enforcement, and residue. | yes | major work requires substance | Constraint challenger |
| Composition testing | `08` composition types | Test stacking, gates, tradeoffs, thresholds, sequential failure, cancellation, contradiction, and chains. | yes | severity changes depth, not policy ownership | Constraint challenger |
| Leakage and residue | `08` leakage/residue | Record bottlenecks, loopholes, workarounds, enforcement, actors, countermeasures, ordinary-life residue, and institutional/economic residue. | yes | major omissions require reasons | Constraint challenger |
| Card/proposal/debt outcomes | constraint card, W-3 | Decide what is linked, proposed, deferred, or left unchanged. | yes | outcome-specific | Constraint challenger |
| Prompt-out and skips | `20`, W-1/W-4 | Use, dispose, explicitly cite, or skip advisory pressure. | yes | major skips require reasons | Constraint challenger |
| Close preview | checklist completion rule | Confirm substance and append the report. | no | server blockers only | none |
| Read-side trail | W-5/W-6/W-8 | Follow report, cards, proposals, debt, advisory artifacts, and skips. | no | not severity-dependent | none |

## Decision-Point Contract

Each meaningful browser step exposes:

- the current constrained fact, source subject, flow state, and step;
- package authority and why the step exists;
- required, optional, skippable, and severity-dependent obligations where the server marks them;
- doctrine, checklist, template, and source context at the point of use;
- blockers and substance validations returned by the server;
- skip rule, skip record, and reason threshold;
- Prompt-out role, prompt preview, source manifest, omissions, disposition state, and advisory/canon warning when available;
- write intent for coverage, cards, proposals, debt, advisory use, skips, close, and explicit non-mutation;
- next step, safe exit/resume, and read-side trail links.

## Prompt-Out Requirements

- Prompt role: `Constraint challenger` from `20_ai_assisted_workflow.md`.
- Context packet sections: current decision, steward material, constrained fact, source records/material, existing constraints, current coverage, package doctrine, forbidden moves, output labels, advisory warning, source manifest, and omissions.
- Cold external LLM test: a model with no hidden world or repository context can pressure-test the constraint without being asked to write final canon.
- Pasted-response storage: immutable `advisory_artifact`.
- Advisory disposition and explicit-use links: required before advisory material can influence reports, cards, proposals, debt, or skips.

## Browser Acceptance Scenarios

At least one representative scenario shows entry or resume, the current decision, doctrine at point of use, required/optional/skippable/severity-dependent obligations, blocker/substance validation, saved inventory/composition/leakage/residue, Prompt-out preview and advisory separation, a skip or explicit non-mutation, write intent, read-side trail, safe exit, and resume state.

## Naive-Steward Cognitive Walkthrough

Task: a steward starts from a capability that risks flattening the world and wants to test limits before admitting new facts.

1. The steward can identify the current decision: what limit is being tested around which constrained fact.
2. The steward can see why the package asks for it: doctrine from `08` and the checklist are visible at the decision point.
3. The steward can distinguish required, optional, skippable, and severity-dependent work from server-returned obligations and blockers.
4. The steward can predict whether the app writes coverage, links a card, routes Admission, creates debt, stores advisory material, records a skip, closes a report, or leaves canon untouched.
5. The steward can exit and resume from the pass report without duplicate reports or lost coverage.

## Field Evidence and Untested Surfaces

- Field-trial evidence: `08` is field-tested and was deferred from earlier guided-flow PRDs as flowless coverage.
- Real app-use evidence: this PRD provides first app evidence for a dedicated `08` flow.
- Untested package surfaces: `09` Temporal/Timeline remains out of scope and the immediate follow-up candidate.
- Coverage ledger update: when implemented, `docs/methodology-coverage.md` promotes `08` from sweep-inside-another-flow to guided flow and records honest guidance maturity based on browser evidence.

## Testing Seams

- API/server seam: HTTP app tests against temp-file world databases for start/resume, doctrine payload, one pass report, inventory, composition, leakage, residue, close blockers, card create/link, proposals, debt, Prompt-out, advisory disposition/use, skips, close, and read-side trail.
- Store/persistence seam: no direct store seam by default; add focused persistence tests only if implementation introduces invariants not covered by the HTTP seam.
- Browser seam: React/component-render tests plus browser-visible evidence for W-8 obligations and workflow navigation.
- Acceptance artifacts: root gates `pnpm test`, `pnpm typecheck`, `pnpm build`; browser proof recorded separately because there is no repo-wide browser/e2e hard gate.

## Principles

Touches `docs/principles/README.md` and affirms non-contradiction with:

- `docs/worldbuilding-system/08_constraint_composition.md`: the flow preserves the reasoning order for limits, composition, leakage, residue, conflict, abuse, and repair.
- `docs/worldbuilding-system/checklists/constraint_composition_sweep.md`: close readiness requires constraint budget, loopholes, enforcement, and residue.
- `docs/worldbuilding-system/templates/constraint_card.md`: cards remain steward-authored reasoning instruments.
- `docs/worldbuilding-system/20_ai_assisted_workflow.md`: AI remains advisory pressure and never canon authority.
- `charter.md` P-3/P-4/T-8: the app clerks continuity and causality for a field-tested surface.
- `domain-fidelity.md` P-1/T-2: package terms and vocabularies are preserved without auto-classification.
- `canon-sovereignty.md` P-2/W-1/T-5: Prompt-out/paste-in remains optional and advisory, with explicit disposition/use before influence.
- `workflow-principles.md` P-5/W-1/W-2/W-3/W-4/W-7: the flow is resumable, severity-aware, Prompt-out-capable, skip-record-aware, Admission-routed, and substance-gated.
- `guided-workflow-usability.md` W-8: the browser presents decision points, not generic CRUD.
- `data-principles.md` P-6/W-5/W-6/T-3/T-4/T-5/T-6: the local world file remains canonical; reports are append-only; provenance and typed links carry the trail.
- ADRs 0001-0009: SQLite remains canonical, the localhost/browser boundary is unchanged, branch/collaboration remains closed in UI, the TypeScript/Hono/React stack remains, GitHub gates are unchanged, Admission owns canon intake, Prompt-out owns advisory mechanics, flow-owned persistence is local to the flow, and browser workflow state renders server-owned policy.

No deliberate exceptions.
