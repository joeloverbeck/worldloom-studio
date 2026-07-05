# Methodology Coverage Ledger

This is the living ledger for Worldloom Studio's coverage of the upstream
Causal Canon Worldbuilding System. It exists so package surfaces are never
silently deferred: every guided flow, sweep-only surface, schema-only surface,
and UI non-goal has an auditable row.

Authority order follows `docs/principles/README.md`: the package in
`docs/worldbuilding-system/` is upstream, then the foundational principles, then
ADRs, specs, and tracker decisions. This ledger records app coverage; it does
not amend the package.

## Coverage Classes

- **guided flow**: the app has a protocol-specific guided workflow and spec.
- **sweep-inside-another-flow**: the package surface is exercised through
  another guided flow, generic records, or a pass report, but has no dedicated
  guided flow.
- **schema-only (T-8)**: record types, vocabularies, links, or generic record
  surfaces preserve the package shape because the surface is honestly untested.
- **non-goal (charter/ADR)**: the app deliberately does not build a UI flow or
  product surface for the method area; the decision is recorded by the charter,
  an ADR, or the package's own reference status.

Rows for doctrine, reference, examples, and support files use
`non-goal (method doctrine/reference)` so the numbered package spine is
complete without pretending every chapter should become a guided workflow.

## Guidance Maturity

Coverage class says how the package surface is represented. Guidance maturity
says how usable the browser workflow is when the surface is in scope. Use the
lowest honest value that applies:

- **record-only**: schema/generic record support exists.
- **server-policy**: flow policy exists below the UI.
- **browser-exposed**: the browser can invoke or display the surface.
- **decision-guided**: the browser satisfies `guided-workflow-usability.md` W-8's Decision-Point Contract.
- **prompt-context-complete**: prompt-out packets pass the cold external LLM test from `prompt-out-context-assembly.md`.
- **walkthrough-passed**: a naive-steward cognitive walkthrough passed.
- **field-validated**: field trial or real app use validated the browser surface.

Do not silently promote untested package surfaces. `10`, `11`, `14`, `15`,
`16`, `17`, and naive-steward `19`/`20` remain honestly untested until field
evidence says otherwise.

## Guidance Maturity Snapshot

| Surface | Current maturity | Notes |
|---|---|---|
| Creation (`05`) | walkthrough-passed | PRD #150 / issues #151-#157 added decision-guided evidence for phases 1-2: new-world start/resume, kernel guidance, Creation-bound Prompt-out, seed decomposition blockers, proposed parking, Admission handoff, and read-side trail. Browser smoke artifact: `output/playwright/prd150-creation-decision-smoke.png`. Later Creation phases remain out of scope. |
| Admission (`06`) | decision-guided | PRD #133 / issues #134-#140 added the server-owned decision-point payload, browser decision surface, close preview, read-side trail, and representative render/browser evidence for queue, severity, gate, seed audit, skip, Prompt-out preview, and write intent. |
| Propagation (`07`) and domain atlas (`04`) | browser-exposed | Flow exists; future work must prove shock-cone/domain/disposition decision points and prompt context completeness. |
| Constraint Composition (`08`) | walkthrough-passed | PRD #141 / issues #142-#149 added the dedicated flow, server blockers, browser decision surface, Prompt-out challenger path, read-side trail, and naive-steward walkthrough evidence. |
| Stage 12 (`12`) | browser-exposed | Strongest current browser contract; still needs W-8 evidence before claiming decision-guided. |
| Contradiction/Retcon/Mystery (`13`) | browser-exposed | UI reachability gap is closed; decision-guided maturity still needs browser acceptance evidence. |
| QA (`18`) | browser-exposed | Scorecard flow exists; decision-guided maturity needs visible score/profile/floor/repair walkthrough evidence. |
| Prompt-out (`20`) | browser-exposed | Prompt mechanics exist; prompt-context-complete requires source-manifest and cold external LLM proof. |

## Package Chapter Matrix

| Package surface | Coverage class | App coverage | Recorded decision and citation | Field-use status |
|---|---|---|---|---|
| `README.md` | non-goal (method doctrine/reference) | Package authority order, recommended paths, and coverage statement inform app specs and this ledger. | `domain-fidelity.md` P-1; `charter.md` T-8. | Names the field-tested and honestly-untested split for version 1.0. |
| `manifest.json` | non-goal (method doctrine/reference) | Package inventory/version metadata only; no app flow. | `README.md` package map; `00_overhaul_notes.md` provenance. | Inventory surface, not a workflow. |
| `00_overhaul_notes.md` | non-goal (method doctrine/reference) | Evidence source for this ledger, not an app flow. | Coverage statement of record in `00_overhaul_notes.md`; `charter.md` T-8. | Records the field-tested and honestly-untested split. |
| `01_core_theory.md` | non-goal (method doctrine/reference) | Doctrine shown or cited by downstream flows; no standalone UI. | `domain-fidelity.md` P-1; `charter.md` P-4. | Core doctrine validated by the two package field trials, but not a flow. |
| `02_world_model.md` | non-goal (method doctrine/reference) | Dependency-link vocabulary and schema primitives in `docs/specs/schema-v1.md`. | `schema-v1.md` typed links and `dependency_type`; `domain-fidelity.md` P-1/T-2. | Thinking primitives, not a guided protocol. |
| `03_truth_layers_and_canon_governance.md` | guided flow | Truth layers, canon statuses, admission decisions, repair jurisdiction, debt, and lifecycle are implemented across schema, Admission, Contradiction, QA, and Canon Workbench. | `schema-v1.md`; `admission-flow.md`; `contradiction-retcon-mystery-flow.md`; `qa-flow.md`; `canon-workbench.md`. | Field-tested governance spine; app coverage is cross-flow, not a standalone `03` flow. |
| `04_domain_atlas.md` | guided flow | Domain-atlas sweep is part of the Propagation flow. | `propagation-flow.md`; PRD #29. | Field-tested as part of the core propagation path. |
| `05_creation_protocol.md` | guided flow | Creation flow covers phases 1-2; PRD #150 is the W-8 retrofit for new-world entry, kernel decision guidance, Creation-bound Prompt-out, and first seed decomposition into parked `proposed` records. Admission covers frontloaded seed audit. Minimal Viable World / First Stable Candidate coverage for phases 4-8 is a recorded follow-up decision. | `creation-flow.md`; `admission-flow.md`; PRD #150; issues #151-#157; issue #112 decision; `reports/app-parity-trial-01-creation-decision-points.md`; `output/playwright/prd150-creation-decision-smoke.png`. | Core creation pipeline is field-tested; browser guidance has walkthrough evidence for phases 1-2, but not field validation and not phases 3-10. |
| `06_canon_fact_admission_protocol.md` | guided flow | Admission queue, severity declaration, gate, ledger rows, seed audit, skip records, canon debt, server-owned decision-point payload, browser close preview, and read-side trail. | `admission-flow.md`; PRD #133; issues #134-#140. | Field-tested core pipeline; browser guidance is decision-guided as of the W-8 retrofit evidence. |
| `07_propagation_engine.md` | guided flow | Propagation queue, shock-cone orders, domain sweep, consequence dispositions, surfaced proposals, propagation report. | `propagation-flow.md`; PRD #29. | Field-tested core pipeline. |
| `08_constraint_composition.md` | guided flow | Constraint Composition flow supports fact, capability, constraint card, canon debt, selected material, record section, and pass-report resume starts; inventory, composition testing, leakage, residue, constraint cards, Admission proposals, canon debt, Prompt-out advisory use, governed skips, pass-report close sections, and Canon Workbench read-side trail. | `constraint-composition-flow.md`; PRD #141; issues #142-#149. | Field-tested in package trial 1 and now represented by a dedicated app flow; not field-validated in the app. |
| `09_temporal_and_timeline_protocol.md` | sweep-inside-another-flow | Temporal timeline record type and temporal sweep support exist through schema/generic records and existing flow sweeps; no dedicated guided flow. | `schema-v1.md`; issue #111 backlog; PRD #29 and PRD #100 deferrals. | Field-tested in package trial 2, but flowless in the app. |
| `10_spatial_and_geographic_propagation.md` | schema-only (T-8) | `spatial_region` record type, spatial facets/links, and generic record editing. | `schema-v1.md`; `charter.md` T-8. | Honestly untested in anger per `README.md` and `00_overhaul_notes.md`. |
| `11_agent_character_psychology.md` | schema-only (T-8) | `agent_character` and `capability` record support through generic record editing. | `schema-v1.md`; `charter.md` T-8. | Honestly untested in anger per `README.md` and `00_overhaul_notes.md`. |
| `12_institutional_economic_and_suppression_protocol.md` | guided flow | Institutional, Economic, and Suppression flow with `pass_report`, action arena, institution/counter-institution cards, proposals, debt, prompt-out, skips, and Canon Workbench visibility. | `institutional-economic-suppression-flow.md`; PRD #100. | Field-tested in package trial 2 and implemented as a guided app flow. |
| `13_contradiction_retcon_and_mystery.md` | guided flow | Contradiction/Retcon/Mystery flow, mystery ledger, preservation checklist, owed-boundaries queue, repair routing, retcon costs, prompt-out. | `contradiction-retcon-mystery-flow.md`; issue #109; capstone issue #120. | Field-tested core spine; UI reachability gap is closed. |
| `14_uncertainty_belief_and_evidence.md` | schema-only (T-8) | `uncertainty_evidence_card` report type and generic record editing. | `schema-v1.md`; `charter.md` T-8. | Honestly untested in anger per `README.md` and `00_overhaul_notes.md`. |
| `15_branching_versioning_and_collaboration.md` | non-goal (charter/ADR) | Branch/collaboration schema door only: continuity scope, branch diff, collaboration decision record, provenance actor. No branching or multi-steward UI. | `docs/adr/0003-branch-and-collaboration-schema-door.md`; `charter.md` v1 scope. | Zero field exposure; closed in UI, open in schema. |
| `16_narrative_game_and_transmedia_extraction.md` | schema-only (T-8) | `action_arena` record support and generic record editing; no extraction workflow. | `schema-v1.md`; `charter.md` T-8. | Honestly untested in anger per `README.md` and `00_overhaul_notes.md`. |
| `17_aesthetic_coherence_and_semiosis.md` | schema-only (T-8) | `aesthetic_coherence` record type, aesthetic consequence mode support, generic record editing. | `schema-v1.md`; `charter.md` T-8. | Honestly untested in anger; aesthetic-promise disposal in lyrical/sacred-primary worlds remains untested. |
| `18_quality_assurance_tests.md` | guided flow | QA pass, 28-test catalog, score rows, regression profile, floor advisory, repair routing, canon debt, prompt-out, skips. | `qa-flow.md`. | Field-tested QA machinery, including live mystery-preservation firing. |
| `19_worked_examples.md` | non-goal (method doctrine/reference) | Reference material only; no app flow. | `README.md` package map; `charter.md` T-8. | Untested under a genuinely naive steward. |
| `20_ai_assisted_workflow.md` | sweep-inside-another-flow | Prompt-out templates and advisory artifact lifecycle are offered inside Creation, Admission, Propagation, Contradiction, Institutional, QA, and Constraint Composition flows. | `creation-flow.md`; `admission-flow.md`; `propagation-flow.md`; `contradiction-retcon-mystery-flow.md`; `institutional-economic-suppression-flow.md`; `qa-flow.md`; `constraint-composition-flow.md`; ADR 0007. | Prompt-out mechanics are implemented; `20` under a genuinely naive steward remains honestly untested. |
| `21_templates_index.md` | non-goal (method doctrine/reference) | Record types, minimal instrument paths, pass-report container, and skip discipline guide schema and flows. | `schema-v1.md`; `workflow-principles.md` W-4; `charter.md` T-8. | Reference/index; package trial validated selected template paths. |
| `22_glossary.md` | non-goal (method doctrine/reference) | Naming authority for UI, schema, code, and docs. | `domain-fidelity.md` P-1; root `CONTEXT.md`. | Reference authority, not a workflow. |
| `23_research_notes_and_bibliography.md` | non-goal (method doctrine/reference) | Research rationale only; no app surface. | `README.md` package map; `charter.md` P-3/P-4. | Reference authority, not a workflow. |
| `operating_card.md` | non-goal (method doctrine/reference) | Derived method quick-reference shown or cited by app surfaces where relevant. | `workflow-principles.md` P-5; `creation-flow.md`; package `README.md`. | Working-memory artifact validated in package trial 2. |

## Specialized Pass And Instrument Matrix

| Pass or instrument | Coverage class | App coverage | Decision and citation | Field-use status |
|---|---|---|---|---|
| Frontloaded seed audit | guided flow | Offered inside Admission; completion writes a `gate_result`; declined path writes `skip_record`; the browser decision surface now shows audit authority, skip rule, and non-mutation preview. | `admission-flow.md`; `05`; `06`; `checklists/frontloaded_seed_audit.md`; issues #137/#140. | Field-tested core pipeline with W-8 browser guidance evidence. |
| Canon fact gate and admission ledger | guided flow | Admission full gate and minor batch ledger rows; the browser decision surface now distinguishes required, optional, skippable, and severity-dependent work with server-owned blockers and write intent. | `admission-flow.md`; `checklists/canon_fact_gate.md`; `templates/admission_ledger.md`; issues #136/#139/#140. | Field-tested core pipeline, including batch ledger promotion, with W-8 browser guidance evidence. |
| Propagation sweep and domain atlas | guided flow | Propagation flow covers shock-cone orders, domain sweep, dispositions, report, surfaced proposals. | `propagation-flow.md`; PRD #29. | Field-tested core pipeline. |
| Constraint composition sweep (`08`) | guided flow | Dedicated Constraint Composition flow covers constraint budget, composition interactions, loopholes, enforcement, residue, outcome routing, Prompt-out advisory pressure, governed skips, and pass-report/read-side closure. | `constraint-composition-flow.md`; PRD #141; issues #142-#149. | Field-tested in the package and now walkthrough-covered in the app; not app field-validated. |
| Temporal/timeline sweep (`09`) | sweep-inside-another-flow | Temporal timeline records and generic/sweep handling only; no dedicated guided flow. | `schema-v1.md`; issue #111. | Field-tested but flowless. |
| Spatial/geographic sweep (`10`) | schema-only (T-8) | `spatial_region` record type and generic record editing. | `schema-v1.md`; `charter.md` T-8. | Honestly untested. |
| Agent/character sweep (`11`) | schema-only (T-8) | `agent_character` and `capability` record types. | `schema-v1.md`; `charter.md` T-8. | Honestly untested. |
| Institutional/economic/suppression sweep (`12`) | guided flow | Stage-12 flow with `pass_report` coverage and outcome routing. | `institutional-economic-suppression-flow.md`; PRD #100. | Field-tested and implemented. |
| Mystery preservation checklist | guided flow | Contradiction flow and QA use preservation checklist/mystery ledger paths. | `contradiction-retcon-mystery-flow.md`; `qa-flow.md`; issue #109/#120. | Field-tested live firing. |
| Uncertainty/evidence sweep (`14`) | schema-only (T-8) | `uncertainty_evidence_card` report type. | `schema-v1.md`; `charter.md` T-8. | Honestly untested. |
| Branching/collaboration sweep (`15`) | non-goal (charter/ADR) | Schema door only; no branch/collaboration UI. | ADR 0003; `charter.md` v1 scope. | Zero field exposure. |
| Extraction pass (`16`) | schema-only (T-8) | Generic records only; no guided extraction flow. | `schema-v1.md`; `charter.md` T-8. | Honestly untested. |
| Aesthetic coherence sweep (`17`) | schema-only (T-8) | `aesthetic_coherence` record type and generic editing. | `schema-v1.md`; `charter.md` T-8. | Honestly untested. |
| QA scorecard (`18`) | guided flow | QA pass, score rows, regression profile, floor advisory, repair/debt routing. | `qa-flow.md`. | Field-tested. |

## Open Coverage Decisions

| Surface | Current ledger state | Tracker |
|---|---|---|
| Stage 13 UI reachability | Guided flow. The prior server-only coverage gap is closed; Stage 13 is browser-reachable and Prompt-out is wired. | #109 closed; #120 closed. |
| `08` constraint composition | Dedicated guided flow implemented from PRD #141 with coverage ledger, browser decision surface, Prompt-out challenger path, and read-side trail. Future work is app field validation, not flow grooming. | #141; #142-#149. |
| `09` temporal/timeline | Field-tested but flowless. It remains visible as sweep-only coverage and needs future PRD grooming before a dedicated guided flow. | #111 open. |
| Creation phases 4-8 | Record the ratified decision: add a non-generative Minimal Viable World / First Stable Candidate checkpoint as a future follow-up after this ledger exists. | #112 closed. |
| Creation prompt-out bug | Not a coverage row. It was adjacent W-1 prompt coverage and is closed separately. | #113 closed. |

## Flow-Done Checklist

Whenever a new flow ships, a coverage deferral changes, or a principle/ADR
changes what v1 treats as schema-only or non-goal:

1. Update the relevant row in the package chapter matrix.
2. Update the specialized pass/instrument row if the change affects a sweep,
   checklist, template, or pass report.
3. Cite the governing PRD, issue, spec, principle, or ADR in the row.
4. Mark the field-use status honestly: field-tested, flowless, honestly
   untested, schema-only, or non-goal.
5. Mark guidance maturity honestly when the browser workflow or prompt-out
   surface changes.
6. Include "update `docs/methodology-coverage.md` or confirm no coverage
   change" in the flow's closeout audit.
