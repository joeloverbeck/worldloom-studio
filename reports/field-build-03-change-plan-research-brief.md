# Field Build 03 Change Plan Research Brief

## 1. Context

The uploaded manifest is `reports/manifest_2026-07-07_cde63ee.txt`, the path inventory for `https://github.com/joeloverbeck/worldloom-studio.git`. Fetch every file from commit `cde63eeb750ff7572e277e594b86c5b8f99018e3`; the manifest reflects that exact tree.

Worldloom Studio is a local-first web app for creating and maintaining fictional worlds from a continuity and causality perspective. The repo authority order is: `docs/worldbuilding-system/` upstream of everything; `docs/principles/README.md` defines the principles authority order; ADRs in `docs/adr/` record concrete architecture decisions; specs in `docs/specs/` are downstream implementation contracts.

This brief responds to `reports/field-build-03-twentyfall-frontier.md`. That report's own app commit is `39802bd45825bd4e60d8865cd902958638f4dbff`, while this remote-fetch baseline is `cde63eeb750ff7572e277e594b86c5b8f99018e3`. An authoring-time seam check, `git diff --stat 39802bd HEAD --` over the report, methodology coverage, principles, ADRs, specs, worldbuilding package, and the Admission, Creation, Prompt-out, workflow-map, world-file, and relevant test seams named below, produced only:

```text
reports/field-build-03-twentyfall-frontier.md | 169 ++++++++++++++++++++++++++
1 file changed, 169 insertions(+)
```

Treat the named seam files as unchanged across the report commit and fetch baseline; do not generalize that claim to unrelated files. The report names screenshots and cold-LLM artifacts under `/tmp/worldloom-field-build/`. Those are not in the manifest and are not fetchable. Use their filenames inside the report as evidence labels only; do not require those files as inputs.

This brief continues the field-build change-plan line after `reports/field-build-02-change-plan.md`, which analyzed Field Build 02 and recommended blocker-first repairs around Admission first-decision projection, world-switch state reset, Creation section state, and prompt-out binding. Field Build 03 is the next pressure-test evidence: it validates several of those repairs and exposes the next blocker, executable Admission full-gate completion, plus prompt-out mode/body and advisory-loop friction.

## 2. Read in full

Read these in full, in this order.

### Evidence first

- `reports/field-build-03-twentyfall-frontier.md` - the primary pressure-test evidence being triaged; it owns the new blockers, frictions, validations, and frontier state.
- `reports/field-build-02-change-plan.md` - predecessor change plan; use it to distinguish newly exposed Field Build 03 work from already-commissioned Field Build 02 repairs.
- `reports/field-build-02-dead-air-earth.md` - prior field-build evidence that Field Build 03 regression-checked.
- `reports/field-build-01-change-spec.md` - earlier change-spec; use it to avoid reopening Creation blockers that later runs validate as fixed.
- `reports/field-build-01-brindlemark.md` - first field-build evidence and lineage context.
- `reports/prd-231-admission-first-decision-walkthrough.md` - claimed Admission first-decision/browser evidence that Field Build 03 validates and extends.
- `reports/prd-232-world-state-reset-walkthrough.md` - claimed world-switch reset evidence that Field Build 03 validates.
- `reports/prd-233-creation-kernel-hardening-walkthrough.md` - claimed Creation kernel hardening evidence that Field Build 03 validates and partially pressure-tests through prompt-out behavior.

### Repo identity and coverage

- `README.md` - repo purpose and scope.
- `CONTEXT.md` - app-specific vocabulary and the deference rule to the worldbuilding-system glossary.
- `docs/methodology-coverage.md` - living coverage and guidance-maturity ledger; Field Build 03 may require honest updates, caveats, or non-promotions.

### Methodology package

- `docs/worldbuilding-system/` - read all 58 tracked files under this directory. This count was computed from the fetch baseline: 27 root/package files, 12 checklists, and 19 templates. Read the package in its own order: package README/manifest/operating card, numbered root files, then checklists/templates relevant to Creation, Admission, Prompt-out, and the canon fact gate. The entire package is load-bearing because the user explicitly requested it and because this task must distinguish methodology defects from app encoding defects. Prioritize:
  - `docs/worldbuilding-system/README.md`
  - `docs/worldbuilding-system/03_truth_layers_and_canon_governance.md`
  - `docs/worldbuilding-system/05_creation_protocol.md`
  - `docs/worldbuilding-system/06_canon_fact_admission_protocol.md`
  - `docs/worldbuilding-system/20_ai_assisted_workflow.md`
  - `docs/worldbuilding-system/21_templates_index.md`
  - `docs/worldbuilding-system/checklists/canon_fact_gate.md`
  - `docs/worldbuilding-system/checklists/frontloaded_seed_audit.md`
  - `docs/worldbuilding-system/templates/admission_ledger.md`
  - `docs/worldbuilding-system/templates/world_kernel.md`

### Principles, ADRs, and specs

- `docs/principles/` - read all 7 tracked files. Start with `docs/principles/README.md`; it defines the authority order and conformance rule.
- `docs/adr/` - read all 9 tracked ADRs in numeric order. Pay special attention to ADR 0006, ADR 0007, ADR 0008, and ADR 0009.
- `docs/specs/` - read all 16 tracked specs. Prioritize:
  - `docs/specs/admission-flow.md`
  - `docs/specs/prompt-out-context-assembly.md`
  - `docs/specs/creation-flow.md`
  - `docs/specs/workflow-map-and-navigation.md`
  - `docs/specs/browser-visible-guidance-acceptance.md`
  - `docs/specs/guided-flow-spec-template.md`
  - `docs/specs/method-cards.md`
  - `docs/specs/schema-v1.md`
  Then read the remaining flow specs for cross-flow consistency and boundary awareness.

### Primary code seams

- `packages/server/src/admission-flow.ts` - Admission queue, severity, decision-point payload, full-gate policy/completion, seed audit, prompt-out binding, write intent, advisory-use links, debt, and read-side trail.
- `packages/server/src/http/admission-routes.ts` - HTTP shape for queue, decision point, severity, start, gate, seed audit, skip, and minor batch routes.
- `packages/server/src/prompt-out.ts` - shared prompt assembly and method-card selection for Admission/Creation prompt generation.
- `packages/server/src/prompt-out-defaults.ts` - default prompt templates and role text.
- `packages/server/src/prompt-out-step-actions.ts` - step lifecycle actions for generate, store advisory, disposition, skip, and flow-specific aftermath.
- `packages/server/src/decision-point-contract.ts` - shared `decision-point/v1` contract.
- `packages/server/src/creation-flow.ts` - Creation decision payload, selected-section context, consequence-mode readiness, seed parking, and handoff.
- `packages/server/src/creation-handoff.ts` - handoff resolution and seed-decomposition context.
- `packages/server/src/http/creation-routes.ts` - Creation start, kernel-step, decomposition, and checkpoint route shape.
- `packages/server/src/method-cards.ts` - method-card catalog and point-of-use guidance.
- `packages/server/src/workflow-map.ts` - active/owed/not-earned workflow map state.
- `packages/server/src/world-file.ts` - persistence invariants, flow instances, status transitions, links, facets, records, advisory detail, and admission flow completion.
- `packages/server/src/schema.ts` - nearby schema and validation triggers if the full-gate/advisory-loop recommendations touch persistence shape.
- `packages/web/src/main.tsx` - browser state, workflow-shell routing, routed Admission destination, legacy Admission controls, full-gate form reachability, Creation prompt-out controls, prompt step status, advisory storage, and create/open state.
- `packages/web/src/workflow-shell.tsx` - guided-flow shell and destination surface.
- `packages/web/src/styles.css` - only as needed if surface/layout recommendations require it.

### Primary test seams

- `packages/server/test/app.test.ts` - HTTP seam coverage, especially Admission full-gate completion, seed audit, prompt-out, and canon debt.
- `packages/server/test/world-file.test.ts` - record lifecycle, status transitions, and admission gate invariants.
- `packages/server/test/prompt-out-lifecycle.test.ts` - prompt-out step lifecycle and advisory/disposition routing.
- `packages/server/test/prompt-out.test.ts` - prompt generation, advisory artifacts, disposition, standing rulings, and advisory-use links.
- `packages/server/test/decision-point-contract.test.ts` - shared decision contract coverage.
- `packages/server/test/method-cards.test.ts` - method-card expectations if guidance changes.
- `packages/server/test/creation-flow.test.ts` - Creation and selected-section prompt-out guardrails.
- `packages/web/src/admission-decision-surface.test.tsx` - routed Admission browser-render evidence; verify whether it exercises real route/action path or only fixture injection.
- `packages/web/src/prompt-out-lifecycle.test.tsx` - prompt-out mode/status/advisory browser evidence.
- `packages/web/src/creation-decision-surface.test.tsx` - Creation selected-section and prompt-out browser evidence.
- `packages/web/src/workflow-shell.test.tsx` - workflow destination state and active route expectations.
- `packages/web/src/setup-open-world.test.tsx` - setup/open and world-switch evidence if state reset remains relevant.

Explore beyond this list as needed, especially nearby route tests, server tests, browser render tests, and any PRD/issue references discoverable from tracked docs. The list above is the required minimum, not the exploration ceiling.

## 3. Settled intentions

- You are ChatGPT-Pro in a remote-fetch deep-research session. Fetch files from the pinned commit above, use the uploaded manifest as the path inventory, and produce the deliverable directly.
- This is a hardening and change-planning task driven by pressure-test evidence. It has a secondary new-spec/implementation-planning dimension because the result may seed PRDs/issues, but the deliverable itself is a recommendation/change-plan report.
- The primary seed is Field Build 03. Read it before the authority stack so the evidence frames the questions you ask of the docs and code.
- Pay special attention to snags, friction, blockers, and prompt-out/admission failures. Still classify validation findings so already-fixed work is not reopened.
- The output is a recommendation/change-plan report, not direct code, not ratified spec text, and not issue publication. It should describe intended changes and their correct homes.
- Big changes are allowed if the evidence warrants them. Do not preserve a small patch shape merely because the immediate blocker is visible in one screen.
- Distinguish these classes rigorously: methodology/package defect, downstream doc/spec gap, app conformance/code defect, test/evidence change, no-action validation, and PRD/issue slicing work.
- Treat Field Build 03's "No methodology-source finding" as evidence, not as a command. Overturn it only if the full read shows a genuine methodology defect.
- Verify this authoring-time observation rather than trusting it: the server already appears to have a full-gate completion route and tests, while the routed browser Admission surface appears not to render an executable full-gate form/action around it. The likely gap is routed browser projection and possibly legacy-control drift, not necessarily missing backend capability.
- Verify this authoring-time observation rather than trusting it: Prompt-out mode controls and packet body can disagree in the browser, especially when a selected mode changes but the visible/extracted packet remains stale.
- Verify this authoring-time observation rather than trusting it: Proposal mode should remain refused for the World premise essence decision, but non-premise empty kernel sections should be able to produce Proposal packets.
- Verify this authoring-time observation rather than trusting it: Full-gate prompt-out/advisory-loop text promises stored advisory artifacts, but the active Admission full-gate surface may not expose in-place mode switching, response paste/store, disposition, or explicit advisory-use link controls.
- Online research is encouraged where it improves the change plan: guided workflow design, decision-support UI, form/recovery UX, local-first state reset, human-in-the-loop AI governance, prompt/context assembly, advisory artifact provenance, or similar prior art. Cite external sources for any claim that shapes a recommendation.
- assumption: The deliverable filename is `field-build-03-change-plan.md`. If a different filename is desired, preserve the report substance and rename only the file.

## 4. The task

Analyze Field Build 03 in depth, then analyze all requested docs and whatever code is needed, and produce a downloadable markdown change plan that states the intended changes Worldloom Studio should make in response. The plan should be evidence-based, authority-aware, and implementation-oriented: identify what belongs in methodology/package docs, principles, ADRs, specs, code, tests, browser evidence, coverage ledger updates, and PRD/issue slices.

## 5. Exploration and online-research mandate

Explore the repository as deeply as needed beyond the files listed above. Research online as deeply as needed - similar implementations, decision-support UI patterns, local-first state management, prompt/context design, human-in-the-loop AI governance, advisory artifact provenance, accessibility/form validation, or other prior art - wherever it sharpens the deliverable. Cite sources for any external claim that affects a recommendation.

Do not ask clarifying questions. If a genuine contradiction makes a requirement impossible, state it in the deliverable and proceed with the most faithful interpretation.

## 6. Doctrine and constraints

- `docs/worldbuilding-system/` is upstream of principles, ADRs, specs, and code. A real package conflict must be identified as a package amendment; downstream docs must not silently override it.
- `docs/principles/README.md` defines the principles authority order. Key constraints engaged here include P-2/W-1 steward sovereignty and prompt-out as advisory, W-2 severity scaling, W-3 sweeps propose and only Admission admits, W-7 gates demand substance not clicks, W-8 guided flows as decision-point surfaces, W-9 replacement-grade guidance, W-10 workflow map as the home surface, T-1/T-7 one SQLite world file and browser storage never canonical, and T-8 honest coverage.
- `docs/principles/canon-sovereignty.md` forbids generated text becoming canon without deliberate steward admission. Pasted LLM responses are immutable advisory artifacts, type-separate from canon records. Explicit steward use creates links; artifact existence is not evidence of use.
- `docs/principles/workflow-principles.md` says Admission is the only flow that admits, severity scales gate depth, skips are records, and prompt-out offers proposal and pressure modes at every decision point except the world essence proposal exception.
- `docs/principles/guided-workflow-usability.md` says a guided flow is incomplete unless the browser decision point shows what is owed, why, what can be skipped, prompt-out support, write intent, next step, and read-side trail. API/store tests are necessary but not enough for browser usability.
- ADR 0006 makes Admission a server-side module boundary. Browser code consumes server-returned queue, gate, warning, skip, coverage, and severity shapes; it must not own Admission policy.
- ADR 0007 makes Prompt-out a server-side cross-flow module. Prompt-out steps are advisory, optional, and step-oriented. Prompt-out never infers advisory use merely because a response was pasted.
- ADR 0008 says flow-owned persistence stores durable flow state; UI state is not the canon source.
- ADR 0009 says browser workflow state is a first-class guided decision surface over server-owned flow policy. Generic record forms are substrate, not a substitute for field-tested guided protocols.
- `docs/specs/admission-flow.md` already requires queue selection, explicit `admission_level` and `work_scale`, minor/full gate paths, full-gate written substance, frontloaded seed audit, skip records, prompt-out, close/result, doctrine at point of use, and browser decision-point UI. Test whether Field Build 03 reveals missing implementation, missing routed surface, missing tests, or missing spec.
- `docs/specs/prompt-out-context-assembly.md` already requires screen context and prompt packet context to be one assembly, loaded prompt status identity, proposal/pressure mode semantics, advisory/canon warning, advisory artifacts, dispositions, and explicit advisory-use links. Test whether the Creation/Admission prompt-out UI violates that by showing stale packet bodies or by hiding the advisory artifact loop.
- `docs/specs/creation-flow.md` already requires selected-section kernel prompt grain, the World premise essence exception, non-premise Proposal mode availability, explicit consequence-mode handling, seed parking at `proposed`, and Admission handoff. Test Field Build 03 residual prompt-out friction against this contract before recommending new docs.
- `docs/specs/workflow-map-and-navigation.md` and `docs/methodology-coverage.md` should be updated only when the flow maturity/evidence claim changes. Do not promote global Prompt-out or Admission full-gate maturity from representative tests alone; require browser-visible and field evidence where the ledger demands it.
- The report's "For The Methodology" section says no methodology-source finding was found. Do not overturn that lightly; only recommend package changes if the full read shows a genuine methodology defect.

Authoring-time observations to verify against the pinned code:

- `packages/server/src/admission-flow.ts` appears to expose `completeAdmissionGate`, and `packages/server/src/http/admission-routes.ts` exposes `/api/admission/gate/complete`. Server tests in `packages/server/test/app.test.ts` appear to cover failed and successful full-gate completion. If verified, Field Build 03 F-01 is likely a routed browser executability gap, not a missing server route.
- `packages/web/src/main.tsx` appears to define `completeAdmission`, `gateConsequence`, `gateNotApplicable`, `gateQuietDomain`, and `admissionOperation`, but the routed Admission surface inspected around the active decision panel did not render a full-gate form/action. Verify whether the controls live only in a legacy/full-workspace surface or are unreachable from the guided Admission destination.
- `packages/server/src/admission-flow.ts` appears to bind pre-severity Admission prompt-out to `admission_queue_severity` and post-severity full-gate prompt-out to `admission_constraint_challenge`, validating the Field Build 02 prompt-binding repair. Field Build 03 P-03 is probably about active full-gate prompt-out loop completeness, not the old pre-severity template bug.
- `packages/web/src/main.tsx` appears to store `promptText` and `promptStep` centrally. Verify whether changing prompt mode, selected section, selected record, flow step, or active decision invalidates the visible packet body, loaded status, and extracted/copyable packet atomically.
- `packages/server/src/prompt-out-step-actions.ts` appears to own store-advisory and disposition actions. Verify whether the browser exposes those returned action URLs inside the active routed Admission full-gate decision rather than only a generic Prompt-out/admin panel.

These are observations, not verdicts. Verify them from source before using them.

## 7. Deliverable specification

Produce one new downloadable markdown document named:

- `field-build-03-change-plan.md`

This is a recommendation/change-plan report, not a ratified repo artifact. It should provide substance plus home, not final paste-ready spec prose. For each intended change, state:

- the evidence anchor from Field Build 03;
- the classification: methodology/package change, docs/spec gap, app conformance/code fix, test/evidence change, no-action validation, or PRD/issue slice;
- the target home: package doc, principle, ADR, spec, code seam, test seam, coverage ledger, or PRD/issue slice;
- the intended change in precise engineering language;
- why that location is the correct altitude;
- acceptance/proof needed before closing it.

Recommended report structure:

1. Executive verdict.
2. Evidence classification table covering every Field Build 03 finding: V-REG-01, V-REG-02, V-REG-03, V-01, V-02, P-01, P-02, V-03, V-04, V-05, V-06, F-01, and P-03.
3. Primary change package: executable Admission full gate.
4. Separate prompt-out hardening package: mode/body atomicity, non-premise empty-section Proposal mode, loaded status identity, and full-gate advisory artifact loop.
5. Docs/spec implications: which docs are already sufficient, which need amendments, which should not change, and what `docs/methodology-coverage.md` should say after implementation.
6. Code seams and test seams to change.
7. Suggested PRD/issue slicing in blocker-first order.
8. Browser/field evidence required to prove the fix.
9. Big-change justification, risks, non-goals, and open assumptions.

Produce the deliverable directly. Do not interview, do not ask clarifying questions. If a genuine contradiction makes a requirement impossible, state it in the deliverable and proceed with the most faithful interpretation.

## 8. Self-check

Before returning, verify your deliverable against this checklist:

- You read every required path group, including all 90 requested authority files under `docs/adr/`, `docs/principles/`, `docs/specs/`, and `docs/worldbuilding-system/`.
- You did not rely on `/tmp` screenshots, cold-LLM artifacts, or world files as fetchable inputs.
- Every Field Build 03 finding is classified, including validation findings and prompt/status friction findings.
- You separated methodology/package defects from downstream doc gaps and app conformance/code defects.
- You did not weaken the authority order in `docs/principles/README.md`.
- You did not recommend LLM API integration, automatic canonization, or any path that bypasses prompt-out advisory storage and Admission governance.
- You treated the field report's `39802bd45825bd4e60d8865cd902958638f4dbff` app commit as provenance and the fetch baseline `cde63eeb750ff7572e277e594b86c5b8f99018e3` as the source tree to inspect.
- You verified whether the full-gate blocker is backend absence, routed browser absence, legacy/routed surface drift, missing tests, or a combination.
- You cite external sources for every online-research claim that materially affects the plan.
- The deliverable set matches section 7 exactly: one markdown document named `field-build-03-change-plan.md`.
