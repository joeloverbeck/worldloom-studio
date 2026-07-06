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
| Method-card guidance layer (`W-9`) | walkthrough-passed | PRD #172 / issues #186-#191 add the versioned method-card spec, card catalog, card-fed decision-point doctrine slots, prompt-packet card wording, setup/workflow-map/operating-card copy, provenance demotion, T-8 excluded-source checks, and one representative Creation walkthrough. This row covers the shared guidance-content layer; it does not promote individual flow interiors beyond their own field or browser evidence. Report: `reports/prd-172-method-card-guidance-walkthrough.md`. |
| Workflow map/navigation (`W-10`) | walkthrough-passed | PRD #171 / issues #180-#184 add the map-as-home grammar, server-owned workflow-map payload, routed shell entry, one-destination map navigation, and browser walkthrough evidence from setup through map, Creation, back to map, and Admission. This row covers cross-flow orientation only; it does not promote the maturity of individual flow interiors. Browser artifact: `output/playwright/prd171-map-first-admission.png`; report: `reports/prd-171-map-first-walkthrough.md`. |
| Creation (`05`) | walkthrough-passed | PRD #150 / issues #151-#157 added decision-guided evidence for phases 1-2: new-world start/resume, kernel guidance, Creation-bound Prompt-out, seed decomposition blockers, proposed parking, Admission handoff, and read-side trail. PRD #165 / issues #166-#169 add replacement-grade evidence for the post-decomposition handoff and prove the Creation `decomposition_pressure` packet as prompt-context-complete for that path. PRD #170 / issues #174-#179 add shared decision-point context, proposal/pressure mode rendering, the World premise essence refusal, a Starting scale proposal packet, advisory disposition, pressure skip, and read-side evidence for the Creation kernel prompt path. PRD #202 / issues #211-#217 add the non-generative Minimal Viable World checkpoint for phases 4-8: server-owned coverage signals over admitted seeds, append-only checkpoint report snapshots, governed dispositions/deferrals/protected mysteries, Admission proposal routing, checkpoint Prompt-out, workflow-map owed state, and QA read-only echo. Browser artifacts: `output/playwright/prd150-creation-decision-smoke.png`, `reports/prd-165-replacement-handoff-walkthrough.md`, `reports/prd-170-prompt-modes-walkthrough.md`, `reports/prd-202-minimal-viable-world-walkthrough.md`, and `output/playwright/prd170-prompt-modes-walkthrough.png`. |
| Admission (`06`) | decision-guided | PRD #133 / issues #134-#140 added the server-owned decision-point payload, browser decision surface, close preview, read-side trail, and representative render/browser evidence for queue, severity, gate, seed audit, skip, Prompt-out preview, and write intent. |
| Propagation (`07`) and domain atlas (`04`) | decision-guided | PRD #173 / issues #193-#199 add the shared `decision-point/v1` contract, routed-shell contract panel, proposal/pressure modes, write intent, close blockers, read-side trail, and browser walkthrough evidence for the shock-cone path. Browser artifact: `output/playwright/prd173-propagation-contract.png`; report: `reports/prd-173-adoption-walkthrough.md`. |
| Constraint Composition (`08`) | walkthrough-passed | PRD #141 / issues #142-#149 added the dedicated flow, server blockers, browser decision surface, Prompt-out challenger path, read-side trail, and naive-steward walkthrough evidence. |
| Temporal/Timeline (`09`) | walkthrough-passed | PRD #201 / issues #205-#210 add the dedicated Temporal/Timeline guided flow, server blockers, browser decision surface, Spatial-temporal analyst Prompt-out path, pass-report close sections, read-side trail, and naive-steward walkthrough evidence. Report: `reports/prd-201-temporal-timeline-walkthrough.md`. |
| Stage 12 (`12`) | decision-guided | PRD #173 / issues #193-#199 add the shared `decision-point/v1` contract, routed-shell contract panel, proposal/pressure modes, lens blockers, write intent, and browser walkthrough evidence. Browser artifact: `output/playwright/prd173-stage12-contract.png`; report: `reports/prd-173-adoption-walkthrough.md`. |
| Contradiction/Retcon/Mystery (`13`) | decision-guided | PRD #173 / issues #193-#199 add the shared `decision-point/v1` contract, routed-shell contract panel, proposal/pressure modes, close blockers for work scale/disposition/repair/retcon/mystery obligations, write intent, and browser walkthrough evidence. Browser artifact: `output/playwright/prd173-stage13-contract.png`; report: `reports/prd-173-adoption-walkthrough.md`. |
| QA (`18`) | decision-guided | PRD #173 / issues #193-#199 add the shared `decision-point/v1` contract, routed-shell contract panel, proposal/pressure modes, QA scorecard/pass naming alignment, write intent, finalization blockers, and browser walkthrough evidence. PRD #202 adds the whole-world Minimal Viable World read-only echo so first coherence review sees checkpoint state without writing checkpoint records. Browser artifact: `output/playwright/prd173-qa-contract.png`; reports: `reports/prd-173-adoption-walkthrough.md`, `reports/prd-202-minimal-viable-world-walkthrough.md`. |
| Prompt-out (`20`) | browser-exposed | Prompt mechanics exist. PRD #165 proves one Creation decomposition path with source manifest and cold-context packet evidence. PRD #170 proves the proposal-mode browser grammar for one Creation kernel decision path, including the essence blocker, proposal packet, advisory disposition, and pressure skip. PRD #173 / issues #193-#199 complete the shared proposal/pressure mode contract across Creation, Admission, Constraint Composition, Propagation, Stage 12, Stage 13, and QA. PRD #201 / issues #205-#210 add Temporal/Timeline Spatial-temporal analyst packet parity through the same shared lifecycle. `20` is not promoted globally to field-validated until a real field trial exercises proposal mode beyond representative paths. |

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
| `05_creation_protocol.md` | guided flow | Creation flow covers phases 1-2 plus the non-generative Minimal Viable World checkpoint for phases 4-8. PRD #150 is the W-8 retrofit for new-world entry, kernel decision guidance, Creation-bound Prompt-out, and first seed decomposition into parked `proposed` records. PRD #165 adds the replacement-grade Creation-to-Admission handoff after seed parking and binds `decomposition_pressure` to the seed-decomposition report plus parked seeds. PRD #170 adds the shared decision-point contract and proposal/pressure Prompt-out mode evidence for the kernel path, including the World premise essence exception and Starting scale proposal packet. PRD #202 adds the checkpoint over admitted seed evidence, steward-authored dispositions, governed deferrals/protected mysteries, checkpoint Prompt-out, Admission proposal routing, workflow-map owed state, and QA echo. Admission covers frontloaded seed audit and first canon standing. | `creation-flow.md`; `admission-flow.md`; `qa-flow.md`; PRD #150; issues #151-#157; PRD #165; issues #166-#169; PRD #170; issues #174-#179; issue #112 decision; PRD #202; issues #211-#217; `reports/app-parity-trial-01-creation-decision-points.md`; `reports/app-parity-trial-03-replacement-guidance-prompt-context.md`; `reports/prd-165-replacement-handoff-walkthrough.md`; `reports/prd-170-prompt-modes-walkthrough.md`; `reports/prd-202-minimal-viable-world-walkthrough.md`; `output/playwright/prd150-creation-decision-smoke.png`; `output/playwright/prd170-prompt-modes-walkthrough.png`. | Core creation pipeline is field-tested; browser guidance has walkthrough evidence for phases 1-2, prompt-context-complete evidence for the post-decomposition handoff, prompt-mode walkthrough evidence for one kernel path, and checkpoint walkthrough evidence for phases 4-8. It is not app field-validated and does not automate phase 3 or phases 9-10. |
| `06_canon_fact_admission_protocol.md` | guided flow | Admission queue, severity declaration, gate, ledger rows, seed audit, skip records, canon debt, server-owned decision-point payload, browser close preview, and read-side trail. | `admission-flow.md`; PRD #133; issues #134-#140. | Field-tested core pipeline; browser guidance is decision-guided as of the W-8 retrofit evidence. |
| `07_propagation_engine.md` | guided flow | Propagation queue, shock-cone orders, domain sweep, consequence dispositions, surfaced proposals, propagation report, and PRD #173 shared decision contract. | `propagation-flow.md`; PRD #29; PRD #173; issues #193-#199; `reports/prd-173-adoption-walkthrough.md`. | Field-tested core pipeline; browser guidance is decision-guided as of PRD #173 evidence. |
| `08_constraint_composition.md` | guided flow | Constraint Composition flow supports fact, capability, constraint card, canon debt, selected material, record section, and pass-report resume starts; inventory, composition testing, leakage, residue, constraint cards, Admission proposals, canon debt, Prompt-out advisory use, governed skips, pass-report close sections, and Canon Workbench read-side trail. | `constraint-composition-flow.md`; PRD #141; issues #142-#149. | Field-tested in package trial 1 and now represented by a dedicated app flow; not field-validated in the app. |
| `09_temporal_and_timeline_protocol.md` | guided flow | Temporal/Timeline flow supports fact, capability, canon debt, selected material, and pass-report resume starts; temporal questions, date-type/granularity coverage, latency, residue, sequence integrity, retrospective insertion, mystery boundaries, temporal timeline cards, Admission proposals, canon debt, Prompt-out advisory use, governed skips, pass-report close sections, and Canon Workbench read-side trail. | `temporal-timeline-flow.md`; PRD #201; issues #205-#210; `reports/prd-201-temporal-timeline-walkthrough.md`. | Field-tested in package trial 2 and now represented by a dedicated app flow; not field-validated in the app. |
| `10_spatial_and_geographic_propagation.md` | schema-only (T-8) | `spatial_region` record type, spatial facets/links, and generic record editing. | `schema-v1.md`; `charter.md` T-8. | Honestly untested in anger per `README.md` and `00_overhaul_notes.md`. |
| `11_agent_character_psychology.md` | schema-only (T-8) | `agent_character` and `capability` record support through generic record editing. | `schema-v1.md`; `charter.md` T-8. | Honestly untested in anger per `README.md` and `00_overhaul_notes.md`. |
| `12_institutional_economic_and_suppression_protocol.md` | guided flow | Institutional, Economic, and Suppression flow with `pass_report`, action arena, institution/counter-institution cards, proposals, debt, prompt-out, skips, Canon Workbench visibility, and PRD #173 shared decision contract. | `institutional-economic-suppression-flow.md`; PRD #100; PRD #173; issues #193-#199; `reports/prd-173-adoption-walkthrough.md`. | Field-tested in package trial 2; browser guidance is decision-guided as of PRD #173 evidence. |
| `13_contradiction_retcon_and_mystery.md` | guided flow | Contradiction/Retcon/Mystery flow, mystery ledger, preservation checklist, owed-boundaries queue, repair routing, retcon costs, prompt-out, and PRD #173 shared decision contract. | `contradiction-retcon-mystery-flow.md`; issue #109; capstone issue #120; PRD #173; issues #193-#199; `reports/prd-173-adoption-walkthrough.md`. | Field-tested core spine; browser guidance is decision-guided as of PRD #173 evidence. |
| `14_uncertainty_belief_and_evidence.md` | schema-only (T-8) | `uncertainty_evidence_card` report type and generic record editing. | `schema-v1.md`; `charter.md` T-8. | Honestly untested in anger per `README.md` and `00_overhaul_notes.md`. |
| `15_branching_versioning_and_collaboration.md` | non-goal (charter/ADR) | Branch/collaboration schema door only: continuity scope, branch diff, collaboration decision record, provenance actor. No branching or multi-steward UI. | `docs/adr/0003-branch-and-collaboration-schema-door.md`; `charter.md` v1 scope. | Zero field exposure; closed in UI, open in schema. |
| `16_narrative_game_and_transmedia_extraction.md` | schema-only (T-8) | `action_arena` record support and generic record editing; no extraction workflow. | `schema-v1.md`; `charter.md` T-8. | Honestly untested in anger per `README.md` and `00_overhaul_notes.md`. |
| `17_aesthetic_coherence_and_semiosis.md` | schema-only (T-8) | `aesthetic_coherence` record type, aesthetic consequence mode support, generic record editing. | `schema-v1.md`; `charter.md` T-8. | Honestly untested in anger; aesthetic-promise disposal in lyrical/sacred-primary worlds remains untested. |
| `18_quality_assurance_tests.md` | guided flow | QA scorecard/pass, 28-test catalog, score rows, regression profile, floor advisory, repair routing, canon debt, prompt-out, skips, PRD #173 shared decision contract, and PRD #202 Minimal Viable World read-only echo on whole-world QA. | `qa-flow.md`; PRD #173; issues #193-#199; PRD #202; issue #216; `reports/prd-173-adoption-walkthrough.md`; `reports/prd-202-minimal-viable-world-walkthrough.md`. | Field-tested QA machinery, including live mystery-preservation firing; browser guidance is decision-guided as of PRD #173 evidence, with checkpoint echo walkthrough evidence from PRD #202. |
| `19_worked_examples.md` | non-goal (method doctrine/reference) | Reference material only; no app flow. | `README.md` package map; `charter.md` T-8. | Untested under a genuinely naive steward. |
| `20_ai_assisted_workflow.md` | sweep-inside-another-flow | Prompt-out templates and advisory artifact lifecycle are offered inside Creation, Admission, Propagation, Contradiction, Institutional, QA, Constraint Composition, and Temporal/Timeline flows. PRD #165 proves the Creation `decomposition_pressure` packet can carry decomposition material, doctrine, source manifest, omissions, advisory/canon warning, and output labels without hidden repo context. PRD #170 implements proposal and pressure mode vocabulary, the essence exception, shared screen/packet context for Creation/Admission/Constraint decision points, and one browser walkthrough for the Creation kernel proposal packet plus pressure skip. PRD #173 extends the shared proposal/pressure contract to Propagation, Stage 12, Stage 13, and QA and records mode availability in each routed browser surface. PRD #201 adds Spatial-temporal analyst packet parity for Temporal/Timeline with source manifest, coverage, omissions, advisory/canon warning, and shared disposition/skip lifecycle. | `creation-flow.md`; `prompt-out-context-assembly.md`; `admission-flow.md`; `propagation-flow.md`; `contradiction-retcon-mystery-flow.md`; `institutional-economic-suppression-flow.md`; `qa-flow.md`; `constraint-composition-flow.md`; `temporal-timeline-flow.md`; ADR 0007; PRD #165; PRD #170; PRD #173; PRD #201; issues #193-#199; issues #205-#210; `reports/prd-165-replacement-handoff-walkthrough.md`; `reports/prd-170-prompt-modes-walkthrough.md`; `reports/prd-173-adoption-walkthrough.md`; `reports/prd-201-temporal-timeline-walkthrough.md`; `output/playwright/prd170-prompt-modes-walkthrough.png`. | Prompt-out mechanics are implemented; one Creation decomposition prompt path has prompt-context-complete evidence, one Creation kernel path has proposal-mode walkthrough evidence, the PRD #173 adopted flows expose proposal/pressure mode availability, and Temporal has prompt-context parity evidence. Proposal mode remains honestly untested in field use until a trial exercises it across real worldbuilding work. |
| `21_templates_index.md` | non-goal (method doctrine/reference) | Record types, minimal instrument paths, pass-report container, and skip discipline guide schema and flows. | `schema-v1.md`; `workflow-principles.md` W-4; `charter.md` T-8. | Reference/index; package trial validated selected template paths. |
| `22_glossary.md` | non-goal (method doctrine/reference) | Naming authority for UI, schema, code, and docs. | `domain-fidelity.md` P-1; root `CONTEXT.md`. | Reference authority, not a workflow. |
| `23_research_notes_and_bibliography.md` | non-goal (method doctrine/reference) | Research rationale only; no app surface. | `README.md` package map; `charter.md` P-3/P-4. | Reference authority, not a workflow. |
| `operating_card.md` | non-goal (method doctrine/reference) | Derived method quick-reference shown or cited by app surfaces where relevant. | `workflow-principles.md` P-5; `creation-flow.md`; package `README.md`. | Working-memory artifact validated in package trial 2. |

## Specialized Pass And Instrument Matrix

| Pass or instrument | Coverage class | App coverage | Decision and citation | Field-use status |
|---|---|---|---|---|
| Frontloaded seed audit | guided flow | Offered inside Admission; completion writes a `gate_result`; declined path writes `skip_record`; the browser decision surface now shows audit authority, skip rule, and non-mutation preview. | `admission-flow.md`; `05`; `06`; `checklists/frontloaded_seed_audit.md`; issues #137/#140. | Field-tested core pipeline with W-8 browser guidance evidence. |
| Canon fact gate and admission ledger | guided flow | Admission full gate and minor batch ledger rows; the browser decision surface now distinguishes required, optional, skippable, and severity-dependent work with server-owned blockers and write intent. | `admission-flow.md`; `checklists/canon_fact_gate.md`; `templates/admission_ledger.md`; issues #136/#139/#140. | Field-tested core pipeline, including batch ledger promotion, with W-8 browser guidance evidence. |
| Propagation sweep and domain atlas | guided flow | Propagation flow covers shock-cone orders, domain sweep, dispositions, report, surfaced proposals, shared decision contract, and proposal/pressure modes. | `propagation-flow.md`; PRD #29; PRD #173; issues #193-#199. | Field-tested core pipeline; browser guidance is decision-guided as of PRD #173 evidence. |
| Constraint composition sweep (`08`) | guided flow | Dedicated Constraint Composition flow covers constraint budget, composition interactions, loopholes, enforcement, residue, outcome routing, Prompt-out advisory pressure, governed skips, and pass-report/read-side closure. | `constraint-composition-flow.md`; PRD #141; issues #142-#149. | Field-tested in the package and now walkthrough-covered in the app; not app field-validated. |
| Temporal/timeline sweep (`09`) | guided flow | Dedicated Temporal/Timeline flow covers temporal questions, date facets, granularity, latency, residue, sequence integrity, retrospective insertion, mystery boundaries, outcome routing, Prompt-out advisory pressure, governed skips, and pass-report/read-side closure. | `temporal-timeline-flow.md`; PRD #201; issues #205-#210. | Field-tested in the package and now walkthrough-covered in the app; not app field-validated. |
| Spatial/geographic sweep (`10`) | schema-only (T-8) | `spatial_region` record type and generic record editing. | `schema-v1.md`; `charter.md` T-8. | Honestly untested. |
| Agent/character sweep (`11`) | schema-only (T-8) | `agent_character` and `capability` record types. | `schema-v1.md`; `charter.md` T-8. | Honestly untested. |
| Institutional/economic/suppression sweep (`12`) | guided flow | Stage-12 flow with `pass_report` coverage, outcome routing, shared decision contract, and proposal/pressure modes. | `institutional-economic-suppression-flow.md`; PRD #100; PRD #173; issues #193-#199. | Field-tested and decision-guided in the browser as of PRD #173 evidence. |
| Mystery preservation checklist | guided flow | Contradiction flow and QA use preservation checklist/mystery ledger paths, with Stage 13 shared decision contract evidence for mystery/repair blockers. | `contradiction-retcon-mystery-flow.md`; `qa-flow.md`; issue #109/#120; PRD #173; issues #193-#199. | Field-tested live firing; browser guidance is decision-guided as of PRD #173 evidence. |
| Uncertainty/evidence sweep (`14`) | schema-only (T-8) | `uncertainty_evidence_card` report type. | `schema-v1.md`; `charter.md` T-8. | Honestly untested. |
| Branching/collaboration sweep (`15`) | non-goal (charter/ADR) | Schema door only; no branch/collaboration UI. | ADR 0003; `charter.md` v1 scope. | Zero field exposure. |
| Extraction pass (`16`) | schema-only (T-8) | Generic records only; no guided extraction flow. | `schema-v1.md`; `charter.md` T-8. | Honestly untested. |
| Aesthetic coherence sweep (`17`) | schema-only (T-8) | `aesthetic_coherence` record type and generic editing. | `schema-v1.md`; `charter.md` T-8. | Honestly untested. |
| QA scorecard (`18`) | guided flow | QA scorecard/pass, score rows, regression profile, floor advisory, repair/debt routing, shared decision contract, and proposal/pressure modes. | `qa-flow.md`; PRD #173; issues #193-#199. | Field-tested and decision-guided in the browser as of PRD #173 evidence. |

## Open Coverage Decisions

| Surface | Current ledger state | Tracker |
|---|---|---|
| Stage 13 UI reachability | Guided flow. The prior server-only coverage gap is closed; Stage 13 is browser-reachable and Prompt-out is wired. | #109 closed; #120 closed. |
| `08` constraint composition | Dedicated guided flow implemented from PRD #141 with coverage ledger, browser decision surface, Prompt-out challenger path, and read-side trail. Future work is app field validation, not flow grooming. | #141; #142-#149. |
| `09` temporal/timeline | Dedicated guided flow implemented from PRD #201 with coverage ledger, browser decision surface, Prompt-out Spatial-temporal analyst path, and read-side trail. Future work is app field validation, not flow grooming. | #111 closed; #201; #205-#210. |
| Creation phases 4-8 | The #112 ratified decision shipped through PRD #202 as a non-generative Minimal Viable World checkpoint. Future work is app field validation and later phase 9-10/maintenance coverage, not basic checkpoint grooming. | #112 closed; #202; #211-#217. |
| Creation prompt-out bug | The original adjacent W-1 prompt bug is closed. PRD #165 adds specific evidence that post-decomposition `decomposition_pressure` no longer falls back to a kernel-only prompt, without upgrading global Prompt-out maturity. | #113 closed; #165; #166-#169. |
| Prompt-out proposal mode | Proposal and pressure modes are app-implemented for the shared Prompt-out contract. PRD #170 supplied a browser walkthrough for the Creation kernel path; PRD #173 extends browser-visible mode availability to Propagation, Stage 12, Stage 13, and QA. Keep global maturity below field-validated until a real field trial exercises proposal mode beyond these representative paths. | #170; #174-#179; #173; #193-#199. |

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
