# Workflow Usability and Documentation Overhaul Research Report

**Target repository:** `joeloverbeck/worldloom-studio`  
**Target commit:** `c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e`  
**Deliverable:** `workflow-usability-doc-overhaul-research-report.md`  
**Freshness claim:** this report analyzes the user-supplied target commit only. It does **not** independently verify whether the commit is the current `main`.

## Acquisition and provenance statement

I used the uploaded manifest as a path inventory only. Repository-state claims in this report rely only on files whose paths appeared in that manifest and were fetched from exact raw URLs under:

```text
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/<path>
```

The acquisition covered the required directory-scoped surfaces: `docs/worldbuilding-system/` at 58 files, `docs/principles/` at 6 files, `docs/adr/` at 8 files, and `docs/specs/` at 9 files. It also covered the named orientation files, lineage reports, both field-trial artifact directories, the listed code seams, and governance docs. The full exact-URL ledger appears in **Appendix A**.

## Executive verdict

The current documentation stack is **directionally correct but not sufficient** to force the desired app shape.

The strongest pieces already exist. The principles say the steward judges while the app remembers, routes, checks, and assembles context. They say prompt-out is external, advisory, versioned, skippable, and never automatic canon. They say relevant doctrine should be visible at point of use. Several specs already require doctrine payloads, severity declaration, prompt-out support, and server-owned flow policy. The code seams show real effort toward those principles: flow modules exist, prompt-out is becoming a cross-flow lifecycle, admission owns canon transitions, and the browser already exposes parts of the method rather than being only a bare record table.

But that is not enough. The documentation does **not** yet define a reusable browser-visible **decision-point contract**. Without that contract, future work can satisfy the letter of the specs by exposing record types, routes, panels, stores, and validation while still making the steward infer the local task from a dense surface. The danger is not generic CRUD alone. The danger is a technically faithful control room with too many switches and not enough “you are deciding this, because this doctrine applies, and the next required move is this.”

The central recommendation is therefore constitutional, not cosmetic: add a top-level guided-workflow usability principle and a spec template that make **decision-point assistance** part of acceptance. Every meaningful flow step should be required to show the local task, why it exists, required and optional fields, severity path, package doctrine, skip affordance, prompt-out support, context preview, blockers, stored outputs, and next/resume state. That standard should then be retrofitted into the flow specs, ADRs, coverage ledger, and issue conventions.

## Problem model

### What the manual methodology gives the human today

The Causal Canon Worldbuilding System is not merely a set of records. It is a sequence of pressure tests. Manual use gives the steward questions in context. The creation protocol asks for a compact world kernel, seed decomposition, seed admission, minimal viable world elements, ordinary-life anchors, path dependence, factional answers, and a first coherence audit. The admission protocol walks from precise fact statement through consequence mode, truth layer, dependencies, access, cost, constraints, actor, institutional, economic, temporal, spatial, daily-life, historical, evidence, contradiction, repair, package completion, QA, and severity-scaled completeness. The templates index says templates and checklists are thinking instruments, not mandatory forms or schemas; it also gives minimal use paths and an explicit instrument skipping rule.

That manual shape is important: the steward does not merely fill a `canon_fact_card`. The steward moves through a reasoning process where each question is locally justified by doctrine.

### What software should add

Software should reduce orientation cost, not just preserve data. It should know where the steward is in the method, reveal the next decision, assemble the relevant context, preserve provenance, and prevent important steps from disappearing. The app should improve on the manual package by doing clerical work the package cannot do on paper: queueing, routing, surfacing dependency context, remembering standing rulings, linking source records, showing open debt, previewing prompt packets, and making skip decisions explicit.

The desired behavior is a guided process, not a prettier record editor. At each meaningful step the steward should be able to answer:

1. What am I deciding right now?
2. Why does this step exist in the methodology?
3. What must I fill before I can move on?
4. What is optional, skippable, or severity-dependent?
5. What will the app remember, block, or route?
6. What exact prompt-out help is available here?
7. What context will that prompt carry?
8. What happens next?

### Where opacity appears

Opacity appears in the gap between method fidelity and task legibility. The docs are strong on sovereignty, record vocabulary, flow boundaries, and server invariants. They are weaker on the browser task grammar that makes a complex method usable.

The implementation evidence is mixed in the instructive way. It shows good seams: prompt-out context assembly exists; admission and flow modules own policy; the browser includes doctrine, queues, panels, and prompts. It also shows the drift risk: the shared package exports a broad catalog of record types and vocabularies; the web surface contains a generic new/edit record path alongside many dense workflow panels; and recent ADRs explicitly avoid changing steward-visible behavior while deepening server/module boundaries. Those are legitimate build steps, but without stronger docs they can normalize a record-store-first product direction.

The result is a product that can be “correct” in database terms while still forcing the steward to reconstruct the method mentally.

## Evidence from the repository

### 1. Repository identity and vocabulary already point beyond CRUD

`README.md` identifies Worldloom Studio as a web app for maintaining fictional worlds from a continuity and causality perspective, not as a generic wiki. `CONTEXT.md` is sharper: it defines the app as a local-first, single-steward web app implementing the Causal Canon Worldbuilding System as guided flows over a structured record store; it also defines advisory artifacts as type-separate from canon records and never parsed into them. That vocabulary is the right foundation. The problem is not identity drift in the root docs; it is missing enforcement of what “guided” must mean in the browser.

Repository evidence: `README.md`, `CONTEXT.md`.

### 2. The methodology package is explicitly procedural

`docs/worldbuilding-system/05_creation_protocol.md` is a sequence of phases and questions, not a single form. Its world kernel phase defines exact contents; seed admission invokes a frontloaded seed audit and the admission protocol; later phases ask ordinary-life, path-dependence, factional, and QA questions.

`docs/worldbuilding-system/06_canon_fact_admission_protocol.md` is even more decisional. It requires a precise statement, fact classification, consequence mode, truth layer, status, dependency classes, access, cost, constraints, actor sweep, institutional and economic sweeps, temporal and spatial sweeps, domain propagation, daily-life and historical residue, evidence, contradiction, repair, package completion, QA, and severity-scaled completeness. It also distinguishes two severity vocabularies: what kind of fact is entering and how much admission work it owes.

`docs/worldbuilding-system/21_templates_index.md` is a crucial anti-CRUD warning. It says templates and checklists are thinking instruments, not mandatory forms, software records, schemas, API contracts, or implementation plans. It says to use the lightest instrument that catches the danger, and that skipping is allowed but silent skipping is not. That should drive the app toward instrument routing and severity-aware presentation, not toward surfacing every template as an equally heavy form.

Repository evidence: `docs/worldbuilding-system/05_creation_protocol.md`, `docs/worldbuilding-system/06_canon_fact_admission_protocol.md`, `docs/worldbuilding-system/21_templates_index.md`.

### 3. The principles say many correct things, but the obligations are scattered

`docs/principles/README.md` establishes the authority order: the methodology package is upstream, then app principles, then ADRs. That means the fix belongs primarily in principles/specs unless the upstream package itself needs clarification.

`docs/principles/charter.md` contains the strongest product sentence: the steward judges; the app remembers, routes, checks. It also names the anti-model: linked article tools, a wiki, and a module bazaar. That is exactly the right anti-model for this task.

`docs/principles/canon-sovereignty.md` is strong on the sovereignty boundary. It says generated text must not become canon without deliberate steward admission; it requires prompt-out at dependency-bearing steps; it requires prompt context, vocabulary guardrails, standing rulings, versioning, immutable advisory artifacts, explicit advisory-use links, and no built-in LLM API calls in v1.

`docs/principles/domain-fidelity.md` correctly says the methodology package is upstream, specs/tickets cite package files, app vocabulary follows the package, and the app must not infer steward-owned judgments such as truth layer or canon status.

`docs/principles/workflow-principles.md` is the suspected gap surface. It already says the app assembles context, mints IDs, keeps references, tracks status, enforces routing, shows relevant doctrine at point of use, supports severity scaling, makes skips first-class, and demands substance over checkboxes. But it does not define the unit of browser guidance. “Doctrine at point of use” is necessary but insufficient. A dense panel can technically include doctrine and still leave the steward unsure what to do.

`docs/principles/data-principles.md` is strong on read-side goals: “what is canon today?” and “how did canon get here?” It also says templates are human reasoning instruments, not schemas. It needs a companion rule that the stored record shape is not automatically the browser task shape.

Repository evidence: `docs/principles/README.md`, `docs/principles/charter.md`, `docs/principles/canon-sovereignty.md`, `docs/principles/domain-fidelity.md`, `docs/principles/workflow-principles.md`, `docs/principles/data-principles.md`.

### 4. Current specs are stronger than generic CRUD, but they lack a shared acceptance grammar

The existing flow specs already contain important usability hooks:

- `docs/specs/creation-flow.md` requires prompt context assembly, selected record context, operating-card display, skippable prompt-out, and prompts that ask for pressure rather than first-draft canon.
- `docs/specs/admission-flow.md` requires severity declaration with vocabulary definitions at point of use, no inferred defaults, gate composition by level, and substance validation.
- `docs/specs/propagation-flow.md` says the app never admits or generates consequences by itself; it organizes steward-written consequences, presents the domain atlas, and treats the report as the master record.
- `docs/specs/contradiction-retcon-mystery-flow.md` says the app never detects contradictions or admits facts through a side door; it stores sectioned prose, shows doctrine at point of use, and avoids default severity.
- `docs/specs/institutional-economic-suppression-flow.md` is unusually close to the desired standard: it requires source display, doctrine/checklist display, coverage editors, blockers, prompt/advisory support, governed skips, and browser entry/resume behavior.
- `docs/specs/qa-flow.md` requires doctrine rendering, score rows with steward-authored judgment, repair/debt creation, and no automated scoring or repair.
- `docs/specs/canon-workbench.md` correctly scopes the workbench as read-only current canon/audit trail, not as the workflow itself.

The gap is that each spec invents its own level of guidance. There is no required cross-flow section called, for example, “Decision-point UI contract,” “Browser workflow acceptance,” or “Prompt context packet.” A future spec can still be server-correct while under-specifying how the steward sees the local task.

`docs/specs/schema-v1.md` also matters. It deliberately establishes generic records and leaves guided flows out of scope. That was sensible as a walking-skeleton move, but it creates an inertia point: if later docs do not strongly define guided surfaces, the generic record form remains the fallback mental model.

Repository evidence: `docs/specs/creation-flow.md`, `docs/specs/admission-flow.md`, `docs/specs/propagation-flow.md`, `docs/specs/contradiction-retcon-mystery-flow.md`, `docs/specs/institutional-economic-suppression-flow.md`, `docs/specs/qa-flow.md`, `docs/specs/canon-workbench.md`, `docs/specs/schema-v1.md`.

### 5. ADRs are improving architecture seams, not steward legibility

`docs/adr/0006-admission-flow-module-boundary.md` makes Admission the first-class module that owns the transition into canon. This correctly turns “only admission admits” into a server-side invariant.

`docs/adr/0007-prompt-out-step-module-seam.md` moves prompt-out into a shared step lifecycle and explicitly rejects inferring advisory use from pasted responses. It says prompt-out generates self-contained prompts using step identity, flow context, severity context, selected record context, and intended provenance target. That is the right seam.

`docs/adr/0008-flow-owned-persistence-stores.md` narrows `WorldFile` and moves flow-specific SQL toward flow modules. That is likely healthy architecture.

But ADR 0007 and ADR 0008 explicitly say they do not introduce browser redesign or steward-visible behavior change. Again, that is fine as architecture, but it means the documentation stack needs a separate UX-governing decision. Otherwise the app can keep improving invisible seams while the steward-visible surface remains dense.

Repository evidence: `docs/adr/0006-admission-flow-module-boundary.md`, `docs/adr/0007-prompt-out-step-module-seam.md`, `docs/adr/0008-flow-owned-persistence-stores.md`.

### 6. Code seams show real progress and the exact opacity risk

`packages/shared/src/index.ts` exports a broad catalog of record types, link types, vocabulary terms, severity labels, and untested-surface flags. That is necessary for a structured world file. It also means a developer can easily think in catalog-and-form terms unless docs require a different browser presentation.

`packages/server/src/prompt-out.ts` shows the strongest current implementation direction: prompt generation includes flow and step identity, record context, role framing that asks for pressure rather than answers, vocabulary guardrails, label assumptions, standing rulings, advisory artifact storage, explicit advisory disposition, and skip recording. That is not opaque by itself; it is an asset that should be elevated into a formal prompt context spec.

The current React surface in `packages/web/src/main.tsx` shows both value and danger. It contains current-canon views, audit trail, operating-card text, draft space, prompt-out, admission, propagation, contradiction, institutional, and QA panels. But it also includes generic record creation/editing and densely co-located controls. The issue is not that these components exist. The issue is that the docs do not require the UI to reorganize them around the current decision rather than around everything the world file can store.

Repository evidence: `packages/shared/src/index.ts`, `packages/server/src/prompt-out.ts`, `packages/web/src/main.tsx`, `packages/web/src/styles.css`.

### 7. The coverage ledger tracks implementation class, not usability maturity

`docs/methodology-coverage.md` records whether each package area is guided-flow, sweep-only, schema-only, or non-goal. That is useful, and the honesty about untested surfaces is valuable. But “guided flow” currently means too little for this task. It should be possible to distinguish:

- record type exists;
- server policy exists;
- browser flow exists;
- browser flow is decision-point guided;
- prompt-out context is step-complete;
- naive-steward cognitive walkthrough passed;
- field-trial evidence exists.

Without this distinction, the coverage ledger can over-credit a surface that is technically routed but still opaque.

Repository evidence: `docs/methodology-coverage.md`.

### 8. Field trials show what the software must preserve

The field-trial directories contain filled artifacts: world kernels, seed decompositions, admission ledgers, fact cards, propagation reports, constraint passes, temporal passes, institutional suppression passes, contradiction reports, mystery ledgers, and QA profiles. These artifacts are not just record examples. They show the method as performed: a chain of decisions, skipped/omitted instruments, follow-up debt, supersession, QA warnings, and pass-specific pressure.

The app should not flatten that chain into “records exist.” It should guide the steward through generating that chain at appropriate severity.

Repository evidence: `reports/eighth-iteration-field-trial.md`, `reports/ninth-iteration-field-trial.md`, `reports/field-trial-world/**`, `reports/field-trial-world-2/**`.

## External research and prior art

The external research does not replace repository evidence. It sharpens what the docs should require.

### Complex forms are mental work

Nielsen Norman Group’s form-design guidance frames forms as mental work and recommends structure, transparency, clarity, and support to reduce cognitive load. It specifically calls for logical grouping, progress indicators, required/optional clarity, progressive disclosure, visible guidance, and one relevant task at a time for complex workflows.[^nng-forms] Worldloom’s workflows are not ordinary forms, but the cognitive problem is the same: each field asks the steward to interpret a question, retrieve context, and make a decision. Therefore “all controls on one page” is the wrong default for high-burden flows.

Design implication: specs should require step-level task framing, progress/state indicators, explicit required/optional marking, and progressive disclosure by severity.

### Cognitive walkthroughs are a good acceptance tool for learnability

NN/g describes cognitive walkthroughs as task-based usability inspections from a new user’s point of view, useful early in development and complementary to other methods.[^nng-walkthrough] This maps cleanly to Worldloom because the concern is not visual polish; it is whether a steward can learn what to do at each step.

Design implication: flow specs and issues should include a “naive steward cognitive walkthrough” acceptance scenario. A flow should not pass merely because routes and server validations work.

### Human-AI guidance supports transparency, verification, and mental models

Microsoft Research’s Guidelines for Human-AI Interaction synthesize 18 design guidelines validated with practitioners across AI products.[^ms-hax] Microsoft’s overreliance guidance warns that users need realistic mental models, verification cues, and verification support; it also warns that mitigations can backfire if they add friction or create false confidence.[^ms-overreliance] That directly supports Worldloom’s current sovereignty posture. The app should not ask an LLM to author final canon. It should ask for pressure, make the advisory status obvious, and help the steward verify or reject suggestions.

Design implication: prompt-out docs should require visible advisory separation, context manifests, and “verify/reject/admit through Admission” paths, not just copyable prompt text.

### Context engineering makes prompt quality a product requirement

Anthropic’s context-engineering framing treats context as the curated information available at inference time and argues that effective AI systems depend on selecting useful context, not merely on prompt phrasing.[^anthropic-context] Retrieval-augmented generation research similarly shows why external knowledge and provenance matter for knowledge-intensive generation, because parametric model memory alone is unreliable for precise facts and source grounding.[^rag]

Worldloom’s v1 boundary is not built-in retrieval or API calls. But the implication still holds: a copyable prompt must carry a curated packet of relevant world context, doctrine, vocabulary, standing rulings, source records, and current decision point. A cold external LLM should be able to provide useful pressure without inventing the world.

Design implication: add a prompt-out context assembly spec with a source manifest and step-specific packet requirements.

### Checklists help only when designed for the task and the user

AHRQ PSNet summarizes checklist design research: checklists can improve complex-task reliability, but they are not a panacea; poorly designed or overly lengthy checklists can harm performance, and good checklists require task decomposition, specific task outcomes, user knowledge, usability, task ownership, and testing.[^ahrq-checklists] WHO’s surgical checklist evidence also emphasizes short, simple, real-world-tested checklists.[^who-checklist]

Worldloom already has the right instinct: gates demand substance, not checkboxes, and templates are thinking instruments. The docs should now translate that into UI acceptance: checklists should ask for values, statements, dispositions, and follow-up debt, not “done” toggles.

Design implication: guided-flow docs should require checklists to produce visible records or skip reasons, not ritual completion.

### Worldbuilding tool prior art mostly optimizes organization, templates, and wiki affordances

World Anvil markets many worldbuilding templates and prompts, plus maps and secrets.[^worldanvil] Kanka emphasizes organizing campaigns/worlds through entities, mentions, calendars, maps, timelines, organizations, and related records.[^kanka] These tools are useful prior art for navigation, templates, and world organization, but they also clarify Worldloom’s differentiator: causal canon governance. Worldloom should not compete by becoming another wiki-plus-template store. It should be the tool that walks the steward through consequence, admission, contradiction, propagation, and audit.

Design implication: docs should explicitly distinguish “read-side knowledge base” from “guided canon-maintenance workflow.”

### Local-first research supports the current sovereignty and ownership boundary

Ink & Switch’s local-first essay argues for software where users retain ownership and control, with network independence and long-term data access as core ideals.[^localfirst] Worldloom’s local-first, prompt-out/paste-in posture fits that direction. The usability fix does not require weakening local-first or adding an LLM API. It requires better local context assembly and browser workflow guidance.

Design implication: do not solve opacity by outsourcing judgment to an integrated model. Solve it by making the local process intelligible.

## Recommended documentation changes

The recommendations are ordered by leverage. The first four are foundational; retrofitting flow specs before adding them would spread the same gap into more places.

### R1 — Add `docs/principles/guided-workflow-usability.md`

**Change type:** add.  
**Priority:** P0.  
**Dependency order:** first; other doc changes should cite it.

**Substance the document should own:** a constitutional **Decision-Point Contract** for every meaningful guided-flow step. It should define a guided step as browser-visible assistance, not merely a server state or route. Every meaningful step must expose:

- step name and current flow/run state;
- the local decision in plain language;
- why the step exists, with package source links;
- required fields, optional fields, and severity-dependent fields;
- whether the step is skippable, and what skip record/reason is owed;
- relevant doctrine excerpt or operating-card rule;
- source records, dependencies, standing rulings, open debt, and prior skips relevant to the step;
- available prompt-out role, default prompt, context preview, and advisory/canon warning;
- app-owned blockers and validations;
- what will be written, linked, queued, or left untouched;
- next step, exit/resume path, and read-side trail.

**Rationale:** `workflow-principles.md` already contains pieces of this, but not as a conformance standard. External UX evidence supports explicit structure, transparency, clarity, support, progress, and progressive disclosure for cognitively demanding forms.[^nng-forms] Cognitive walkthroughs support making task learnability a first-class acceptance criterion.[^nng-walkthrough]

**Risks/tradeoffs:** a new principle can become abstract fluff. Keep it operational: every bullet should map to spec acceptance. Do not use it to require heavyweight flows for trivial facts; severity scaling remains binding.

### R2 — Strengthen `docs/principles/workflow-principles.md`

**Change type:** strengthen.  
**Priority:** P0.  
**Dependency order:** after or alongside R1.

**Substance the document should own:** revise the workflow principles so “guided flow” means browser-visible decision assistance. Add an explicit rule:

> A flow is not complete merely because its records, routes, stores, and server validations exist. A flow is complete only when the browser tells the steward what decision is being made, what evidence and doctrine govern it, what must be filled, what can be skipped, what prompt-out support is available, and what happens next.

Also strengthen the existing doctrine-at-point-of-use and skip rules to require guidance at the exact decision point, not in a distant doc panel.

**Rationale:** current W-1/W-4/W-7 are right but underspecified. They need to block a dense “everything panel” interpretation.

**Risks/tradeoffs:** over-prescription can reduce experimentation. The document should define the contract, not exact layout.

### R3 — Strengthen `docs/principles/canon-sovereignty.md` around prompt quality and context packets

**Change type:** strengthen.  
**Priority:** P0.  
**Dependency order:** after R1 or parallel.

**Substance the document should own:** keep the sovereignty boundary unchanged, but define “context-rich prompt” more concretely. A generated prompt should include or explicitly omit with reason:

- current flow, step, and decision;
- selected record or draft context;
- relevant dependencies and source links;
- world kernel or current-canon summary where applicable;
- governing package doctrine excerpt;
- vocabulary guardrail and label assumptions;
- standing rulings and relevant prior advisory dispositions;
- open canon debt, skips, and unresolved contradictions that affect the step;
- requested analyst role;
- instruction to provide pressure, risks, alternatives, and questions, not final canon;
- advisory/canon warning.

Add a prompt-quality test: a copied prompt should be useful when pasted into a cold external LLM session with no other context.

**Rationale:** `packages/server/src/prompt-out.ts` already moves in this direction, and ADR 0007 names self-contained prompts. External context-engineering and RAG work support treating context selection and provenance as central to useful generation.[^anthropic-context][^rag]

**Risks/tradeoffs:** prompt packets may become long. Require context previews and “why included” source manifests, not hidden dumping. Do not add built-in LLM calls.

### R4 — Strengthen `docs/principles/domain-fidelity.md` and `docs/principles/data-principles.md`

**Change type:** strengthen.  
**Priority:** P1.  
**Dependency order:** after R1/R2.

**Substance the documents should own:** add the rule that methodology fidelity includes **order of use**, not just vocabulary and data shape. A schema-faithful record editor can still be methodology-unfaithful if it hides the protocol’s reasoning order.

In `data-principles.md`, add: stored records are durable prose/audit structures; browser workflow surfaces may and often must be different from the stored record shape. Read-side views answer “what is canon today?” and “how did canon get here?” but they do not replace guided creation and maintenance.

**Rationale:** the templates index explicitly says templates are not software records or schemas. The app needs a principle that protects that fact during implementation.

**Risks/tradeoffs:** the team may overcorrect and obscure record editing. Keep generic record editing as a secondary/admin/repair path; do not make it the primary path for field-tested protocols.

### R5 — Add `docs/specs/guided-flow-spec-template.md`

**Change type:** add.  
**Priority:** P0.  
**Dependency order:** after R1; before new flow specs.

**Substance the document should own:** a required template for all future guided-flow specs and major retrofits. Minimum sections:

1. package authority and source files;
2. flow purpose and non-goals;
3. step map;
4. decision-point contract per step;
5. required/optional/severity-dependent fields;
6. doctrine payloads and operating-card excerpts;
7. prompt-out roles and context packet requirements;
8. advisory artifact and canon separation;
9. skip rules and skip-record requirements;
10. blockers and substance validations;
11. read-side/audit trail outputs;
12. browser acceptance scenarios;
13. naive-steward cognitive walkthrough;
14. external-prompt cold-start test;
15. field-trial evidence status and untested-surface warnings.

**Rationale:** existing specs vary in how much browser guidance they require. A template prevents API/server correctness from counting as workflow completion.

**Risks/tradeoffs:** this is another doc to maintain. Its value is exactly that it prevents every flow from reinventing the standard.

### R6 — Add `docs/specs/prompt-out-context-assembly.md`

**Change type:** add.  
**Priority:** P0.  
**Dependency order:** after R3; before prompt-out-heavy flow retrofits.

**Substance the document should own:** cross-flow prompt packet design. It should specify:

- common prompt sections;
- role-specific modules from `20_ai_assisted_workflow.md`;
- source-manifest format;
- context inclusion rules by flow and severity;
- context omission rules and warnings;
- prompt preview requirements;
- advisory/canon warning language;
- copy/paste lifecycle;
- pasted response immutability;
- explicit disposition and advisory-use linking;
- skip reason thresholds;
- no built-in LLM API calls in v1.

**Rationale:** prompt-out quality is a first-class product requirement in the brief, and existing code/ADR seams are ready for a formal spec. External research supports context curation and verification rather than raw generation.[^anthropic-context][^ms-overreliance]

**Risks/tradeoffs:** prompt context can leak too much irrelevant material. Require step-specific context selection, not whole-world dumps.

### R7 — Add `docs/specs/workflow-map-and-navigation.md`

**Change type:** add.  
**Priority:** P1.  
**Dependency order:** after R1/R5; before broad browser redesign.

**Substance the document should own:** cross-flow map, queue, resume, and orientation behavior. Define standard affordances:

- current flow and step;
- completed, blocked, skippable, and optional steps;
- severity path and why it was chosen;
- open debt and follow-up tasks;
- source record trail;
- safe exit/resume;
- “what is next?” and “why?” panels;
- handoff between flows, especially sweeps that propose facts back into Admission.

**Rationale:** NN/g’s guidance on progress indicators and transparency maps directly onto the steward’s orientation problem.[^nng-forms] The current app has multiple panels but no documented global orientation grammar.

**Risks/tradeoffs:** flow maps can become bureaucratic dashboards. Keep maps focused on active decisions and blockers, not gamified completion.

### R8 — Strengthen all existing guided-flow specs with a “Decision-point UI contract” section

**Change type:** strengthen.  
**Priority:** P1.  
**Dependency order:** after R5.

**Target files:**

- `docs/specs/creation-flow.md`
- `docs/specs/admission-flow.md`
- `docs/specs/propagation-flow.md`
- `docs/specs/contradiction-retcon-mystery-flow.md`
- `docs/specs/institutional-economic-suppression-flow.md`
- `docs/specs/qa-flow.md`

**Substance the documents should own:** each spec should enumerate its steps in the Decision-Point Contract format. Do not merely say “render doctrine” or “provide prompt-out.” Say what the steward sees and does at each step.

Examples:

- Creation: show kernel phase, seed decomposition, seed admission handoff, minimal viable world checklist, ordinary-life anchor, path-dependence prompt, faction pressure, first QA audit. Make clear which phases are implemented now and which become follow-up.
- Admission: show severity declaration, minimal facts owed, full gate path, ledger row vs full card promotion, gate blockers, foundational debt warnings, skip/deferral path.
- Propagation: show source fact, shock cone step, domain atlas subset, consequence disposition, surfaced fact routing to Admission, follow-up debt.
- Contradiction: show conflict statement, contradiction type, repair operation, mystery boundary check, propagation of repair, branch/quarantine/deprecate choices.
- Stage 12: preserve its strong coverage-slot/blocker model, but align with the shared contract.
- QA: show test purpose, score anchor, steward score input, repair/debt path, regression profile meaning, floor advisory.

**Rationale:** the specs already contain many right requirements; this turns them into visible acceptance standards.

**Risks/tradeoffs:** retrofit can be tedious. Do the highest-risk flows first: Admission, Creation, Propagation, Contradiction.

### R9 — Strengthen `docs/specs/canon-workbench.md`

**Change type:** strengthen.  
**Priority:** P1.  
**Dependency order:** after R4/R7.

**Substance the document should own:** state more forcefully that the workbench is the read-side answer to “what is canon today?” and “how did it get here?” It must not become the primary creation/maintenance workflow. Add requirements for links from read-side objects back to their governing flow artifacts: admission decisions, propagation reports, contradiction reports, advisory artifacts, skip records, debt, supersession, and branch notes.

**Rationale:** data-principles already define the two query modes. The workbench should reinforce rather than replace guided workflows.

**Risks/tradeoffs:** too many audit links can clutter the workbench. Use progressive disclosure: current canon first, provenance on demand.

### R10 — Update `docs/methodology-coverage.md` with guidance maturity

**Change type:** strengthen.  
**Priority:** P1.  
**Dependency order:** after R1/R5.

**Substance the document should own:** add a second axis beside implementation coverage. Suggested values:

- `record-only` — record/schema exists;
- `server-policy` — flow policy exists below UI;
- `browser-exposed` — browser can invoke it;
- `decision-guided` — browser satisfies the Decision-Point Contract;
- `prompt-context-complete` — prompt-out packet passes cold-start test;
- `walkthrough-passed` — naive-steward cognitive walkthrough passed;
- `field-validated` — field-trial or real use has validated the surface.

Keep the existing honesty around untested surfaces. Do not silently promote `10`, `11`, `14`, `15`, `16`, `17`, or naive-steward `19`/`20` into validated territory.

**Rationale:** current “guided-flow” rows risk over-crediting a surface that exists but is not yet legible.

**Risks/tradeoffs:** more columns can be noisy. The payoff is large: future planning can distinguish “exists” from “usable.”

### R11 — Add `docs/adr/0009-browser-guided-flow-boundary.md`

**Change type:** add.  
**Priority:** P1.  
**Dependency order:** after R1/R5; before major browser reorganization.

**Substance the ADR should own:** record the architectural decision that browser workflow state is not an incidental rendering of records. The browser consumes server-returned flow policy, prompt-out lifecycle shapes, doctrine payloads, blockers, and step maps, then presents them through a guided decision-point UI. It should also reject the idea that generic record forms are the primary interface for field-tested protocols.

This ADR should complement 0006/0007/0008. Those ADRs moved policy and persistence to proper modules; 0009 would say the steward-visible layer is also a first-class boundary.

**Rationale:** recent ADRs intentionally did not change steward-visible behavior. A new ADR can make guided presentation a decision rather than a side effect.

**Risks/tradeoffs:** ADRs can be overused. This one earns its place because it changes architectural interpretation: UI is not just a consumer of CRUD endpoints.

### R12 — Update `docs/agents/issue-tracker.md` and triage conventions

**Change type:** strengthen.  
**Priority:** P1.  
**Dependency order:** after R5.

**Substance the documents should own:** any issue touching a guided flow must include acceptance criteria for browser-visible guidance and prompt quality. Required checklist:

- package source cited;
- decision-point contract satisfied;
- required/optional/severity fields visible;
- doctrine at the actual decision point;
- prompt-out packet preview and cold-start prompt test;
- advisory/canon separation visible;
- skip path and reason storage;
- blockers/substance validation;
- current/next/resume state;
- read-side audit link;
- cognitive walkthrough scenario.

**Rationale:** principles and specs will not matter if issues can be closed on API tests only. The brief specifically asks that specs/issues make ergonomic workflow surfaces part of acceptance.

**Risks/tradeoffs:** this increases issue-writing overhead. Keep the checklist short and reusable.

### R13 — Add `docs/specs/browser-visible-guidance-acceptance.md`

**Change type:** add.  
**Priority:** P2.  
**Dependency order:** after R5/R12.

**Substance the document should own:** acceptance test patterns for UI guidance. This should not be a PRD or implementation plan, but it should define evidence a reviewer can demand:

- screenshot or Playwright smoke path showing the task card;
- example selected record and severity path;
- generated prompt text with source manifest;
- skip reason example;
- blocker example;
- resulting audit trail link;
- one naive-steward cognitive walkthrough transcript or checklist.

**Rationale:** this turns the abstract principle into reviewable artifacts.

**Risks/tradeoffs:** screenshots can become brittle. Use them for guidance existence, not pixel-perfect layout.

### R14 — Strengthen `docs/specs/schema-v1.md` with a “not the product shape” warning

**Change type:** correct/strengthen.  
**Priority:** P2.  
**Dependency order:** after R4.

**Substance the document should own:** preserve the walking-skeleton value but add a clear warning that schema completeness is not workflow completeness. Generic record CRUD is a substrate/admin path. Field-tested protocols owe guided flow surfaces before they can be considered product-complete.

**Rationale:** schema-v1 was correct for early build order, but it is now a gravitational center for opaque UI if not bounded.

**Risks/tradeoffs:** do not disparage the schema. The schema is necessary; it is just not sufficient.

### R15 — Add a lightweight “field-trial-to-flow translation” report pattern under `docs/specs/` or `reports/`

**Change type:** add.  
**Priority:** P2.  
**Dependency order:** after R10.

**Substance the document should own:** a repeatable way to translate manual field trials into flow requirements. For each field-trial artifact set, extract:

- decision sequence actually performed;
- instruments used and skipped;
- moments where prompt-out would have helped;
- context required at each step;
- blockers or confusion points;
- outputs that became canon, advisory, debt, or audit trail.

**Rationale:** the repository already has two rich field trials. Use them as evidence for usable process design, not only methodology validation.

**Risks/tradeoffs:** avoid overfitting to two worlds. Mark the evidence level honestly.

## Principles gap assessment

### Does `docs/principles/*` need a new principle?

Yes. Strengthening existing files is necessary but not enough. The desired app behavior crosses workflow, data, sovereignty, domain fidelity, and UI acceptance. If it is only patched into `workflow-principles.md`, prompt context and read-side distinctions may remain underpowered. If it is only patched into `canon-sovereignty.md`, the result may over-focus on AI. A new `guided-workflow-usability.md` should become the canonical home for the browser-visible decision-point contract.

### Current principle strengths

The principle stack already protects the most dangerous boundary:

- user sovereignty is structural;
- generated text cannot auto-canonize;
- prompt-out is external and advisory;
- the app may assemble context but not infer steward-owned judgments;
- severity scaling prevents over- and under-governance;
- templates are thinking instruments, not schemas;
- read-side views answer current canon and audit history.

These should be preserved.

### Current principle gaps

The missing principle-level obligations are:

1. **Decision-point instruction:** the browser must show the local decision and why it exists.
2. **Step-specific obligations:** required/optional/severity fields must be visible before action.
3. **Context assembly quality:** prompt context must be defined as a packet with sources and omissions.
4. **Prompt-out quality:** prompts must be useful in a cold external LLM session and must ask for pressure, not final canon.
5. **UI/UX acceptance:** guided flow completion must require browser evidence and a learnability check, not only server/API behavior.
6. **Read/workflow separation:** workbench views do not replace guided admission, propagation, repair, or QA.
7. **Evidence honesty:** untested surfaces must remain labeled as untested in guidance maturity terms.

## Spec and ADR gap assessment

The specs and ADRs are not broken. They are incomplete in a predictable way.

### Spec gap

The current specs often include a doctrine or prompt-out requirement, but they do not share a required acceptance grammar. This allows a flow to be implemented as a route plus a dense panel. Future specs need to say exactly what browser-visible guidance is owed.

A future issue/spec should not be accepted as complete unless it can demonstrate, for at least one representative scenario:

- the screen shows the current decision and source doctrine;
- the required fields are marked and explained;
- optional/skippable instruments are explicit;
- severity changes the path visibly;
- the generated prompt includes relevant world/record/doctrine context;
- pasted AI output remains advisory;
- canon-changing actions route through Admission;
- blockers demand substance rather than checkbox completion;
- the resulting audit trail answers how the decision happened.

This can be enforced with a combination of written acceptance criteria, Playwright smoke paths, screenshot artifacts, and a lightweight cognitive walkthrough checklist. That is doc-level prescription, not implementation code.

### ADR gap

ADRs 0006–0008 correctly make server and persistence boundaries more modular. They also explicitly defer steward-visible behavior. A new ADR is warranted because the browser flow boundary is now a strategic decision: the UI must be a guided decision surface over server policy, not a generic world-file console.

Do not rewrite prior ADRs as if they were wrong. Add a successor ADR that says their invisible seams must be consumed by a visible decision contract.

## Methodology-package amendment candidates

These are upstream amendments. They should be treated carefully because `docs/worldbuilding-system/` is the package the app implements, not an app-layer convenience layer. The app docs can own UI contracts; the package should only change where the methodology itself would benefit.

### M1 — Amend `docs/worldbuilding-system/20_ai_assisted_workflow.md` with Prompt Packet Anatomy

**Change type:** package-amendment candidate.  
**Priority:** high.

**Substance:** add a general anatomy for useful external-LLM prompts:

- current task;
- selected fact/record;
- relevant canon excerpt or world kernel summary;
- doctrine excerpt;
- role requested;
- assumptions and forbidden moves;
- output labels;
- instruction to pressure, not author final canon;
- reminder that the steward decides.

Include one short example for a consequence scout or contradiction hunter using a realistic context packet. Keep it non-app-specific: “when using any AI assistant, include enough context for the role to challenge the decision without inventing canon.”

**Rationale:** current `20_ai_assisted_workflow.md` lists strong roles and prompts, but the prompts are skeletal. The app brief requires context-rich copyable prompts. The upstream package should clarify the methodology-level prompt discipline; the app spec should define exact implementation packets.

**Caution:** do not turn this into LLM integration guidance or automatic authoring.

### M2 — Amend `docs/worldbuilding-system/21_templates_index.md` with decision-use notes

**Change type:** package-amendment candidate.  
**Priority:** high.

**Substance:** keep the “thinking instruments, not forms” rule. Add a small section for each minimal use path that states the local decision being protected. Example: “Major capability: decide whether repeatable action permission is safely bounded before it enters canon.” This would help both manual users and software translators.

**Rationale:** the current index lists instruments and minimal paths, but software needs to know what decision each instrument protects. That is methodology content, not merely UI.

**Caution:** avoid software-field language. The package should not become an app spec.

### M3 — Amend `docs/worldbuilding-system/operating_card.md`

**Change type:** package-amendment candidate.  
**Priority:** medium.

**Substance:** add a compact “at any decision point” reminder:

- What fact/change is under judgment?
- What danger does it create?
- What is the lightest instrument that catches the danger?
- What can be skipped, and why is the skip safe?
- What pressure would an external assistant usefully apply?
- What must re-enter Admission?

**Rationale:** the app wants operating-card chrome. Strengthening the card gives the browser a better at-hand doctrine source.

**Caution:** keep it short. The operating card should not duplicate protocols.

### M4 — Add “record values, not checkmarks” notes to checklist files

**Change type:** package-amendment candidate.  
**Priority:** medium.

**Target files:** `docs/worldbuilding-system/checklists/*.md`, especially `canon_fact_gate.md`, `propagation_sweep.md`, `institutional_economic_suppression_sweep.md`, `mystery_preservation.md`, and `temporal_timeline_sweep.md`.

**Substance:** add a front-matter note that a checklist pass should produce a value, disposition, example, contradiction, debt item, or skip reason; a bare completion tick is not enough for load-bearing work.

**Rationale:** this aligns with existing workflow principles and checklist research: good checklists require specific task outcomes, not ritual confirmation.[^ahrq-checklists]

**Caution:** trivial/minor work must remain cheap.

### M5 — Add local decision cards to the most field-tested protocols

**Change type:** package-amendment candidate.  
**Priority:** medium.

**Target files:** `05_creation_protocol.md`, `06_canon_fact_admission_protocol.md`, `07_propagation_engine.md`, `12_institutional_economic_and_suppression_protocol.md`, `13_contradiction_retcon_and_mystery.md`, `18_quality_assurance_tests.md`.

**Substance:** for each major phase, add a one-sentence “decision protected” line and a “minimum output” line. Example for admission severity: “Decision protected: how much review this fact owes. Minimum output: declared level/work scale plus visible reason; the app may not infer it.”

**Rationale:** manual users also benefit from local decision clarity, and app translators gain a methodology-grounded map.

**Caution:** do this after app-layer principles/specs, so the upstream package is not forced to carry app-specific concepts.

## Phased adoption plan

### Phase 0 — Set the standard

1. Add `docs/principles/guided-workflow-usability.md`.
2. Strengthen `workflow-principles.md`, `canon-sovereignty.md`, `domain-fidelity.md`, and `data-principles.md`.
3. Add `docs/specs/guided-flow-spec-template.md`.
4. Update `docs/methodology-coverage.md` with guidance maturity.

This phase prevents further work from deepening the wrong product shape.

### Phase 1 — Define prompt and navigation infrastructure at the doc level

1. Add `docs/specs/prompt-out-context-assembly.md`.
2. Add `docs/specs/workflow-map-and-navigation.md`.
3. Add ADR 0009 for the browser guided-flow boundary.
4. Update issue/triage conventions to require browser-visible guidance acceptance.

This phase gives future implementation work a shared target without writing code in the report.

### Phase 2 — Retrofit the highest-risk flows

1. Admission flow.
2. Creation flow.
3. Propagation flow.
4. Contradiction/retcon/mystery flow.
5. QA flow.
6. Institutional/economic/suppression flow, mostly to align it with the shared contract because it is already comparatively strong.

For each, add a Decision-Point UI Contract and prompt context packet requirements.

### Phase 3 — Protect read-side boundaries

1. Strengthen `canon-workbench.md`.
2. Clarify `schema-v1.md` as substrate, not product shape.
3. Add browser-visible guidance acceptance patterns.

This phase prevents the current-canon/audit trail surfaces from becoming a substitute for guided maintenance.

### Phase 4 — Route upstream amendments carefully

1. Amend `20_ai_assisted_workflow.md` with prompt packet anatomy.
2. Amend `21_templates_index.md` with decision-use notes.
3. Strengthen `operating_card.md`.
4. Consider checklist and protocol decision-card amendments.

Keep these amendments methodology-level and app-agnostic.

### Phase 5 — Validate with walkthroughs and field trials

1. Run a naive-steward cognitive walkthrough for one creation-to-admission path.
2. Run a second walkthrough for a contradiction repair path.
3. Compare generated artifacts against the two existing field-trial artifact sets.
4. Update the coverage ledger’s guidance maturity statuses honestly.

## Self-check

- Required repository acquisition was completed from exact commit URLs only, using the manifest as path inventory. The full ledger is in Appendix A.
- `docs/worldbuilding-system/` was read as a 58-file directory-scoped surface, including priority files, templates, and checklists.
- `docs/principles/` was read as a 6-file directory-scoped surface.
- `docs/adr/` was read as an 8-file directory-scoped surface.
- `docs/specs/` was read as a 9-file directory-scoped surface.
- Current code was used only as evidence of product direction and doc interpretation, not as the target artifact.
- External claims shaping recommendations are cited in this report.
- No recommendation allows LLM output to become canon automatically.
- Prompt-out remains external prompt-out/paste-in; pasted responses remain advisory artifacts.
- Recommendations distinguish app-layer doc changes from upstream methodology-package amendment candidates.
- Every recommendation names a document home, change type, intended substance, rationale, priority, dependency ordering, and risks/tradeoffs.
- The report names concrete ways future specs/issues can enforce browser-visible guidance: Decision-Point UI Contract, prompt context cold-start test, screenshot/Playwright evidence, blocker examples, skip examples, and cognitive walkthrough scenarios.
- The deliverable filename is `workflow-usability-doc-overhaul-research-report.md`.

## Source notes

### Repository evidence source pattern

Every repository evidence source used above was fetched at the exact target commit from raw URLs under:

```text
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/
```

Key cited repository paths include:

- `README.md`
- `CONTEXT.md`
- `docs/methodology-coverage.md`
- `docs/principles/README.md`
- `docs/principles/charter.md`
- `docs/principles/canon-sovereignty.md`
- `docs/principles/domain-fidelity.md`
- `docs/principles/workflow-principles.md`
- `docs/principles/data-principles.md`
- `docs/specs/schema-v1.md`
- `docs/specs/creation-flow.md`
- `docs/specs/admission-flow.md`
- `docs/specs/propagation-flow.md`
- `docs/specs/contradiction-retcon-mystery-flow.md`
- `docs/specs/institutional-economic-suppression-flow.md`
- `docs/specs/qa-flow.md`
- `docs/specs/canon-workbench.md`
- `docs/adr/0006-admission-flow-module-boundary.md`
- `docs/adr/0007-prompt-out-step-module-seam.md`
- `docs/adr/0008-flow-owned-persistence-stores.md`
- `docs/worldbuilding-system/05_creation_protocol.md`
- `docs/worldbuilding-system/06_canon_fact_admission_protocol.md`
- `docs/worldbuilding-system/20_ai_assisted_workflow.md`
- `docs/worldbuilding-system/21_templates_index.md`
- `packages/shared/src/index.ts`
- `packages/server/src/prompt-out.ts`
- `packages/web/src/main.tsx`
- `packages/web/src/styles.css`

### External sources

[^nng-forms]: Nielsen Norman Group, “Few Guesses, More Success: 4 Principles to Reduce Cognitive Load in Forms,” July 18, 2025. https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/

[^nng-walkthrough]: Nielsen Norman Group, “Evaluate Interface Learnability with Cognitive Walkthroughs.” https://www.nngroup.com/articles/cognitive-walkthroughs/

[^ms-hax]: Microsoft Research, “Guidelines for Human-AI Interaction.” https://www.microsoft.com/en-us/research/publication/guidelines-for-human-ai-interaction/

[^ms-overreliance]: Microsoft Learn, “Overreliance on AI: Risk Identification and Mitigation Framework.” https://learn.microsoft.com/en-us/ai/playbook/technology-guidance/overreliance-on-ai/overreliance-on-ai

[^anthropic-context]: Anthropic, “Effective context engineering for AI agents.” https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

[^rag]: Lewis et al., “Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks,” arXiv:2005.11401. https://arxiv.org/abs/2005.11401

[^ahrq-checklists]: AHRQ PSNet, Anne Collins McLaughlin, “What Makes a Good Checklist,” October 1, 2010. https://psnet.ahrq.gov/perspective/what-makes-good-checklist

[^who-checklist]: World Health Organization, “Checklist helps reduce surgical complications, deaths,” December 11, 2010. https://www.who.int/news/item/11-12-2010-checklist-helps-reduce-surgical-complications-deaths

[^worldanvil]: World Anvil, “Worldbuilding tools & RPG Campaign Manager.” https://www.worldanvil.com/

[^kanka]: Kanka documentation, “Kanka overview.” https://docs.kanka.io/en/latest/overview.html

[^localfirst]: Martin Kleppmann et al., “Local-first software: You own your data, in spite of the cloud,” Ink & Switch. https://www.inkandswitch.com/essay/local-first/

## Appendix A — Exact-commit acquisition ledger

```text
Requested repository: joeloverbeck/worldloom-studio
Target commit: c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e
Freshness claim: user-supplied target commit only; not independently verified as latest main
Manifest role: path inventory only
Repository metadata used: no
Default-branch lookup used: no
Branch-name file fetch used: no
Target-repository code search used: no
Clone used: no
URL fetch method: web.open full raw.githubusercontent.com exact-commit URLs; supplemental container.download full exact-commit URL for representative preflight README
Requested file count: 132
Successfully verified file count: 132
Fetched repository files:
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/README.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/CONTEXT.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/methodology-coverage.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/00_overhaul_notes.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/01_core_theory.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/02_world_model.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/03_truth_layers_and_canon_governance.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/04_domain_atlas.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/05_creation_protocol.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/06_canon_fact_admission_protocol.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/07_propagation_engine.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/08_constraint_composition.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/09_temporal_and_timeline_protocol.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/10_spatial_and_geographic_propagation.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/11_agent_character_psychology.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/12_institutional_economic_and_suppression_protocol.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/14_uncertainty_belief_and_evidence.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/15_branching_versioning_and_collaboration.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/16_narrative_game_and_transmedia_extraction.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/17_aesthetic_coherence_and_semiosis.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/18_quality_assurance_tests.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/19_worked_examples.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/20_ai_assisted_workflow.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/21_templates_index.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/22_glossary.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/23_research_notes_and_bibliography.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/README.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/checklists/aesthetic_coherence_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/checklists/agent_character_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/checklists/branching_collaboration_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/checklists/canon_fact_gate.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/checklists/constraint_composition_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/checklists/frontloaded_seed_audit.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/checklists/institutional_economic_suppression_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/checklists/mystery_preservation.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/checklists/propagation_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/checklists/spatial_geographic_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/checklists/temporal_timeline_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/checklists/uncertainty_evidence_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/manifest.json
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/operating_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/templates/action_arena_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/templates/admission_ledger.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/templates/aesthetic_coherence_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/templates/agent_character_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/templates/canon_branch_diff.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/templates/canon_change_proposal.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/templates/canon_fact_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/templates/capability_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/templates/collaboration_decision_record.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/templates/constraint_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/templates/contradiction_report.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/templates/counter_institution_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/templates/institution_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/templates/mystery_ledger_entry.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/templates/propagation_report.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/templates/spatial_region_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/templates/temporal_timeline_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/templates/uncertainty_evidence_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/worldbuilding-system/templates/world_kernel.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/principles/README.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/principles/canon-sovereignty.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/principles/charter.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/principles/data-principles.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/principles/domain-fidelity.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/principles/workflow-principles.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/adr/0001-sqlite-file-per-world.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/adr/0002-localhost-native-process.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/adr/0003-branch-and-collaboration-schema-door.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/adr/0004-typescript-hono-react-better-sqlite.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/adr/0005-github-automation-baseline.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/adr/0006-admission-flow-module-boundary.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/adr/0007-prompt-out-step-module-seam.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/adr/0008-flow-owned-persistence-stores.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/specs/admission-flow.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/specs/canon-workbench.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/specs/contradiction-retcon-mystery-flow.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/specs/creation-flow.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/specs/institutional-economic-suppression-flow.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/specs/markdown-export.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/specs/propagation-flow.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/specs/qa-flow.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/specs/schema-v1.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/archive/reports/foundational-principles-research-brief.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/archive/reports/foundational-principles-research-report.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/principles-third-iteration-research-brief.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/principles-third-iteration-outlook.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/build-start-plan.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/tenth-iteration-outlook.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/eighth-iteration-field-trial.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/ninth-iteration-field-trial.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/field-trial-world/admission_ledger.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/field-trial-world/capability_card_memory_salt.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/field-trial-world/constraint_composition_cellar_banks.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/field-trial-world/contradiction_report_C1.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/field-trial-world/fact_cards.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/field-trial-world/frontloaded_seed_audit.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/field-trial-world/mystery_ledger_weeping_shelf.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/field-trial-world/propagation_report_SF1.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/field-trial-world/qa_regression_profile.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/field-trial-world/seed_decomposition.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/field-trial-world/world_kernel.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/field-trial-world-2/admission_ledger.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/field-trial-world-2/capability_card_intercalation.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/field-trial-world-2/contradiction_report_C1.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/field-trial-world-2/contradiction_report_C2.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/field-trial-world-2/fact_cards.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/field-trial-world-2/frontloaded_seed_audit.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/field-trial-world-2/institutional_suppression_pass.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/field-trial-world-2/mystery_ledger.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/field-trial-world-2/propagation_report_S2a.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/field-trial-world-2/qa_regression_profile.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/field-trial-world-2/seed_decomposition.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/field-trial-world-2/temporal_pass.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/reports/field-trial-world-2/world_kernel.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/packages/shared/src/index.ts
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/packages/server/src/prompt-out.ts
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/packages/server/src/creation-flow.ts
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/packages/server/src/admission-flow.ts
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/packages/server/src/propagation-flow.ts
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/packages/server/src/contradiction-flow.ts
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/packages/server/src/institutional-flow.ts
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/packages/server/src/qa-flow.ts
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/packages/server/src/canon-workbench.ts
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/packages/web/src/main.tsx
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/packages/web/src/styles.css
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/AGENTS.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/CLAUDE.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/agents/domain.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/agents/issue-tracker.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/docs/agents/triage-labels.md
Fetch-provenance contamination observed: no
Foreign-repository references inside fetched file contents: permitted; not a provenance check
Connector/tool namespace trusted as evidence: no
External research lane: separate from repository evidence

```
