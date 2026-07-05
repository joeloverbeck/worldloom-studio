# Creation Flow Spec

This spec defines Worldloom Studio's first guided flow: `05_creation_protocol.md` phases 1-2 only. It is downstream of `docs/worldbuilding-system/05_creation_protocol.md`, `docs/worldbuilding-system/20_ai_assisted_workflow.md`, `docs/worldbuilding-system/21_templates_index.md`, `docs/worldbuilding-system/22_glossary.md`, `docs/worldbuilding-system/operating_card.md`, the foundational principles, ADRs 0001-0004, and `docs/specs/schema-v1.md`.

The terminal state is a living world kernel plus seed records parked at `proposed`. This flow does not admit seeds, run the frontloaded seed audit, assign severity, produce gate results, or expose the admission queue.

PRD #150 retrofits this flow into a W-8 decision-point surface for new-world start/resume, kernel authoring, Creation-bound Prompt-out, and seed decomposition. The durable parity source is `reports/app-parity-trial-01-creation-decision-points.md`; any temporary/local field-trial transcript that preceded that report is not stable implementation authority unless tracked.

## Deferred Decisions

1. **Kernel section headings.** `record_section_headings` seeds the world kernel headings from `templates/world_kernel.md`: World premise; Core promise; Starting scale; Genre, tone, and consequence-mode commitments; Foundational facts; Foundational constraints; Initial mysteries and protected effects; Primary pressures and initial domains; Ordinary-life promise. `05_creation_protocol.md` constrains their meaning and wins on conflict.
2. **Seed decomposition report shape.** The append-only `seed_decomposition` report uses sections for Kernel source, Drafts consumed, Granularity decisions, Parked seeds, and Thin-start boundary, all constrained by `05` Phase 2.
3. **Draft-space data model.** Drafts live in a `drafts` table inside the world file. They are not records, owe no truth layer or canon status, are absent from record listings/search/link targets, and leave draft space only through explicit conversion or decomposition.
4. **Prompt-context assembly.** A prompt-out step assembles the selected record's title, type, truth layer, canon status, body, section content, role framing, vocabulary guardrail, label-assumptions instruction, and standing rulings.
5. **Default prompt derivations.** Default prompts are versioned rows derived from `20` analyst roles. The original `20` text remains visible; steward edits create a new version; revert creates a new version equal to the original.
6. **Flow-instance persistence.** `flow_instances` stores flow key, current step, state, and kernel record id in the world file so reopening resumes the parked step.
7. **Operating-card derivation.** The UI displays a persistent operating-card panel derived from `operating_card.md`, with the upstream source named. Re-checking is manual in this slice: the derivation states its source and versioned text is updated with the app.
8. **Skip records.** Declining an offered prompt writes a `skip_record` mechanically. Below the major-fact threshold, reason text is not required and the record states that no reason was collected.
9. **Consequence-mode representation.** The world kernel slot remains prose, but the authoritative consequence-mode declaration is the `consequence_mode` facet. The flow never defaults it; the steward must choose it explicitly when that step is completed.

## Step Map

| Step | Package source | Analyst role | Dependency-bearing | Prompt template |
|---|---|---|---|---|
| Kernel authoring | `05_creation_protocol.md` Phase 1 and `templates/world_kernel.md` | Consequence scout, assigned from `20` because kernel authoring is not named in the workflow table | yes | `kernel_pressure` |
| Seed decomposition | `05_creation_protocol.md` Phase 2 | Prerequisite auditor, assigned from `20` for pressure on hidden assumptions | yes | `decomposition_pressure` |

Both prompts preserve `20`'s invariant sequence: the steward's material is present first, and the model is asked for pressure, not first-draft canon.

## Decision-Point UI Contract

This flow must satisfy `guided-workflow-usability.md` W-8 and `guided-flow-spec-template.md`.

- **New-world start/resume:** when no `world_kernel` exists, the browser foregrounds Creation as the primary active guided path. World-file controls, Operating Card status, read-only workbench views, and substrate controls may remain available, but unrelated guided flows must show prerequisites or unavailable states instead of competing as equivalent first actions.
- **Kernel authoring:** the browser shows the steward that the decision is to define the world's first governing kernel, cites `05` Phase 1 and `templates/world_kernel.md`, marks required sections versus allowed empty sections, requires explicit consequence-mode selection, previews the kernel prompt packet, records prompt skips, and shows that the resulting write is a living `world_kernel` record rather than admitted canon facts.
- **Prompt-out in context:** Creation Prompt-out appears inside the current decision point after steward-authored material exists. It is pre-bound to the current flow, step, and material, avoids raw record-id entry on the normal Creation path, previews the prompt packet and source manifest, names omission reasons, warns that pasted responses remain advisory artifacts, and uses the shared Prompt-out lifecycle from ADR 0007.
- **Seed decomposition:** the browser shows that the decision is to split steward material into parked seeds, cites `05` Phase 2, shows consumed drafts/kernel material, exposes title/body/truth-layer/granularity controls inside Creation, fixes the actual current seed canon status at `proposed`, keeps any future Admission intent type-separated as advisory intent, previews the decomposition prompt packet, records prompt skips, writes one append-only `seed_decomposition` report, parks seed records at `proposed`, and points the steward to Admission as the next governed step.
- **Resume/exit:** the flow map shows current step, kernel/decomposition state, prompt-out status, skipped instruments, and safe resume from `flow_instances`.

## Flow Behavior

- Starting the flow creates or resumes an in-progress `creation` flow instance.
- Kernel authoring creates one `world_kernel` card-regime record if none exists for the flow.
- Each kernel step writes sectioned prose under a seeded heading. Empty sections are allowed.
- The consequence-mode step writes the `consequence_mode` facet only from an explicit steward choice.
- Prompt-out is offered at dependency-bearing steps only after steward-authored material exists or with a server-owned blocker/omission reason explaining why it is unavailable. Decline writes a skip record.
- Decomposition consumes selected drafts and/or kernel seed material, writes one append-only `seed_decomposition` report, and parks each seed as a `canon_fact` record with steward-supplied truth layer and actual current canon status `proposed`.
- Parked seeds link to the kernel and decomposition report through app-minted `derived_from` links.
- Completing decomposition marks the flow complete. No record is created with an admitted status by this flow.

## Out-of-Scope Creation Phases

This spec remains limited to `05_creation_protocol.md` phases 1-2. It explicitly excludes frontloaded seed audit, seed admission, Minimal Viable World, ordinary-life establishment, path dependence, factional answers, first coherence audit, and iterative canon maintenance. Admission owns first canon standing and the frontloaded seed audit. Issue #112 records the later Creation phases 4-8 follow-up decision.

## Testing Seams

Primary seam: the localhost HTTP API against real temp-file world databases for facets, sections, drafts, prompt generation, advisory disposition, flow steps, skips, and seed parking.

Secondary seam: direct SQL against real world files for migration v2, pre-migration backup, report-regime immutability, advisory artifact immutability, card section history, section FTS, and newer-schema rejection.

Browser seam: React/browser-surface tests and a representative browser-visible walkthrough must show the new-world entry state, kernel decision point, in-flow Prompt-out preview or skip, decomposition blockers and write preview, seed parking result, Admission handoff, read-side trail, and safe exit/resume orientation before this flow claims W-8 maturity.

## Principles

Touches `docs/worldbuilding-system/05_creation_protocol.md`, `docs/worldbuilding-system/templates/world_kernel.md`, `docs/worldbuilding-system/20_ai_assisted_workflow.md`, `docs/worldbuilding-system/03_truth_layers_and_canon_governance.md`, `charter.md` (P-3, P-4, T-8), `canon-sovereignty.md` (P-2, W-1, T-5), `domain-fidelity.md` (P-1, T-2), `workflow-principles.md` (P-5, W-1, W-3, W-4, W-7), `guided-workflow-usability.md` (W-8), `data-principles.md` (P-6, W-5, W-6, T-3, T-4, T-5), ADR 0006, ADR 0007, ADR 0009, and PRD #150. It affirms non-contradiction.

T-8 honesty: prompt-out/paste-in remains an unvalidated field-use surface; this flow records evidence from use but does not claim external validation.
