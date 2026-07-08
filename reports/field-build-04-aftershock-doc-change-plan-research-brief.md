# Field Build 04 Aftershock Doc Change Plan Research Brief

## 1. Context

The uploaded manifest is `reports/manifest_2026-07-07_016c076.txt`, the path inventory for `https://github.com/joeloverbeck/worldloom-studio.git`. Fetch every file from commit `016c07631c17ecddedfe7a17b0f8c23474bde824`; the manifest reflects that exact tree and contains 368 tracked paths.

Worldloom Studio is a local-first web app for creating and maintaining fictional worlds from a continuity and causality perspective. The repo authority order is: `docs/worldbuilding-system/` upstream of everything; `docs/principles/README.md` defines the principles authority order; ADRs in `docs/adr/` record concrete architecture decisions; specs in `docs/specs/` are downstream implementation contracts; `docs/methodology-coverage.md` records app coverage and guidance maturity without amending the package.

This brief responds to `reports/field-build-04-aftershock-imposter-earth.md`. That report's own app commit is `dd5bf2a`, while this remote-fetch baseline is `016c07631c17ecddedfe7a17b0f8c23474bde824`. An authoring-time seam check, `git diff --stat dd5bf2a HEAD --` over the named methodology coverage, principles, ADRs, specs, worldbuilding package, and Admission, Creation, Prompt-out, Propagation, workflow-map, decision-point, world-file, web route, and focused test seams named below produced empty output. Treat the named seam files as unchanged across the report commit and fetch baseline; do not generalize that claim to unrelated files. The report itself is present at the fetch baseline.

The report names screenshots, a world file, and cold-LLM artifacts under `/tmp/worldloom-field-build/`. Those are not in the manifest and are not fetchable. Use their filenames inside the report as evidence labels only; do not require those files as inputs.

This brief continues the field-build change-plan line after `reports/field-build-03-change-plan.md` and the subsequent PRD proof reports for Admission full-gate completion, Prompt-out packet identity, and Creation non-premise Proposal targeting. Treat those proof reports as claims to reconcile against the later Field Build 04 pressure evidence, not as conclusive closure.

## 2. Read in full

Read these in full, in this order.

### Evidence first

- `reports/field-build-04-aftershock-imposter-earth.md` - the primary pressure-test evidence being triaged. It owns the new blockers, snags, frictions, validations, regression replay, and frontier state.
- `reports/field-build-03-change-plan.md` - predecessor change plan; use it to distinguish Field Build 04 residuals from work already commissioned after Field Build 03.
- `reports/field-build-03-twentyfall-frontier.md` - prior field-build evidence that Field Build 04 regression-replayed.

### Recent proof reports to reconcile

- `reports/prd-249-full-gate-walkthrough.md` - claimed routed Admission full-gate completion proof that Field Build 04 later pressure-tests and partially contradicts.
- `reports/prd-250-packet-identity-walkthrough.md` - claimed Prompt-out packet-body identity proof that Field Build 04 later pressure-tests and partially contradicts.
- `reports/prd-251-non-premise-proposal-walkthrough.md` - claimed non-premise Creation Proposal proof that Field Build 04 later pressure-tests and partially contradicts.
- `reports/prd-173-adoption-walkthrough.md` - shared decision-point contract proof for Propagation, Stage 12, Stage 13, and QA; Field Build 04's Propagation frontier tests whether the active destination is merely contract-visible or actually workable.
- `reports/prd-231-admission-first-decision-walkthrough.md` - routed Admission first-decision proof and pre-severity handoff context.
- `reports/prd-232-world-state-reset-walkthrough.md` - claimed same-session world-switch reset proof relevant to Field Build 04's stale full-gate textarea values.
- `reports/prd-233-creation-kernel-hardening-walkthrough.md` - Creation kernel state hardening proof relevant to prompt state and selected-section context.

### Repo identity and coverage

- `README.md` - repo purpose and scope.
- `CONTEXT.md` - app vocabulary and the deference rule to the worldbuilding-system glossary.
- `docs/methodology-coverage.md` - living app coverage and guidance-maturity ledger; Field Build 04 may require honest caveats, demotions, or no-promotion notes.

### Methodology package

- `docs/worldbuilding-system/` - read all 58 tracked files under this directory. This count was computed from the fetch baseline: 27 root/package files, 12 checklists, and 19 templates. Read the package in its own authority order: package README/manifest/operating card, numbered root files, then relevant checklists/templates. The entire package is load-bearing because the user explicitly requested it and because this task must decide whether the pressure evidence warrants package changes or confirms the package was actionable. Prioritize:
  - `docs/worldbuilding-system/README.md`
  - `docs/worldbuilding-system/00_overhaul_notes.md`
  - `docs/worldbuilding-system/03_truth_layers_and_canon_governance.md`
  - `docs/worldbuilding-system/04_domain_atlas.md`
  - `docs/worldbuilding-system/05_creation_protocol.md`
  - `docs/worldbuilding-system/06_canon_fact_admission_protocol.md`
  - `docs/worldbuilding-system/07_propagation_engine.md`
  - `docs/worldbuilding-system/18_quality_assurance_tests.md`
  - `docs/worldbuilding-system/20_ai_assisted_workflow.md`
  - `docs/worldbuilding-system/21_templates_index.md`
  - `docs/worldbuilding-system/checklists/canon_fact_gate.md`
  - `docs/worldbuilding-system/checklists/frontloaded_seed_audit.md`
  - `docs/worldbuilding-system/checklists/propagation_sweep.md`
  - `docs/worldbuilding-system/templates/propagation_report.md`
  - `docs/worldbuilding-system/templates/world_kernel.md`

### Principles, ADRs, and specs

- `docs/principles/` - read all 7 tracked files. Start with `docs/principles/README.md`; it defines the authority order and conformance rule.
- `docs/adr/` - read all 9 tracked ADRs in numeric order. Pay special attention to ADR 0006, ADR 0007, ADR 0008, and ADR 0009.
- `docs/specs/` - read all 16 tracked specs. Prioritize:
  - `docs/specs/admission-flow.md`
  - `docs/specs/prompt-out-context-assembly.md`
  - `docs/specs/creation-flow.md`
  - `docs/specs/propagation-flow.md`
  - `docs/specs/workflow-map-and-navigation.md`
  - `docs/specs/browser-visible-guidance-acceptance.md`
  - `docs/specs/guided-flow-spec-template.md`
  - `docs/specs/method-cards.md`
  - `docs/specs/schema-v1.md`
  Then read the remaining flow specs for cross-flow consistency and boundary awareness.

The authority-doc set above contains 90 tracked files under `docs/adr/`, `docs/principles/`, `docs/specs/`, and `docs/worldbuilding-system/`, plus `docs/methodology-coverage.md`.

### Primary code seams

- `packages/server/src/admission-flow.ts` - Admission queue, severity, full-gate policy/completion, seed audit, prompt-out binding, write intent, advisory-use links, debt, and read-side trail.
- `packages/server/src/http/admission-routes.ts` - HTTP shape for queue, decision point, severity, seed audit, gate completion, and related Admission routes.
- `packages/server/src/creation-flow.ts` - Creation decision payload, selected-section context, mode availability, section target heading, seed parking, and handoff.
- `packages/server/src/prompt-out.ts` - shared prompt assembly and generated packet identity.
- `packages/server/src/prompt-out-defaults.ts` - default prompt templates and role text.
- `packages/server/src/prompt-out-step-actions.ts` - Prompt-out lifecycle actions for generate, store advisory, disposition, skip, and flow-specific aftermath.
- `packages/server/src/propagation-flow.ts` - Propagation queue, run entry, coverage requirements, consequence/domain/disposition state, surfaced proposals, close blockers, and prompt-out contract.
- `packages/server/src/http/propagation-routes.ts` - Propagation route surface for queue, start/resume, consequence, domain, disposition, proposal, skip, and close.
- `packages/server/src/world-file.ts` - persistence invariants, flow instances, status transitions, links, facets, records, advisory detail, and report/card regimes.
- `packages/server/src/workflow-map.ts` - active/owed/not-earned workflow map state and queue foregrounding.
- `packages/server/src/decision-point-contract.ts` - shared `decision-point/v1` contract.
- `packages/server/src/method-cards.ts` - method-card catalog and point-of-use guidance.
- `packages/server/src/schema.ts` - schema and validation triggers if recommendations touch persistence shape.
- `packages/web/src/main.tsx` - browser state, workflow-shell routing, Admission full-gate form, Creation prompt-out controls, prompt packet current/stale state, Propagation active destination, advisory storage, and create/open reset state.
- `packages/web/src/workflow-shell.tsx` - workflow map shell and destination navigation.

### Primary test seams

- `packages/server/test/app.test.ts` - HTTP seam coverage, especially Admission full-gate completion, seed audit, prompt-out, canon debt, and Propagation routes.
- `packages/server/test/prompt-out-lifecycle.test.ts` - Prompt-out step lifecycle identity, advisory/disposition routing, and lifecycle compatibility.
- `packages/server/test/prompt-out.test.ts` - prompt generation, generated packet identity, advisory artifacts, disposition, standing rulings, and advisory-use links.
- `packages/server/test/creation-flow.test.ts` - Creation selected-section target heading and prompt-out guardrails.
- `packages/server/test/decision-point-contract.test.ts` - shared decision contract coverage.
- `packages/server/test/method-cards.test.ts` - method-card expectations if guidance changes.
- `packages/server/test/world-file.test.ts` - record lifecycle, status transitions, and persistence invariants.
- `packages/web/src/admission-decision-surface.test.tsx` - routed Admission browser-render and full-gate evidence.
- `packages/web/src/prompt-out-lifecycle.test.tsx` - prompt-out mode/status/body currentness and advisory browser evidence.
- `packages/web/src/creation-decision-surface.test.tsx` - Creation selected-section and prompt-out browser evidence.
- `packages/web/src/propagation-flow.test.tsx` - Propagation active destination browser evidence.
- `packages/web/src/workflow-shell.test.tsx` - workflow destination state and active route expectations.

Explore beyond this list as needed, especially nearby route tests, code paths referenced by these modules, GitHub issue references discoverable from tracked docs, and external sources that sharpen the recommendations. The list above is the required minimum, not the exploration ceiling.

## 3. Settled intentions

- You are ChatGPT-Pro in a remote-fetch deep-research session. Fetch files from the pinned commit above, use the uploaded manifest as the path inventory, and produce the deliverable directly.
- This is a foundational/doc-overhaul task driven by pressure-test evidence, with secondary app-hardening and change-planning dimensions. The deliverable is a recommendation/change-plan report that says which documents should change, which should not, and why.
- The primary seed is Field Build 04. Read it before the authority stack so the evidence frames the questions you ask of the docs and code.
- Pay special attention to the pressure-test evidence of notes, snags, friction, blocked prompt-out paths, stale state, manual-proof burden, and route/UI mismatch. Still classify validation findings so fixed work is not reopened.
- The output is a recommendation/change-plan document, not direct code, not ratified spec text, and not issue publication. It should describe intended changes and their correct homes.
- Analyze `docs/adr/*`, `docs/principles/*`, `docs/specs/*`, `docs/methodology-coverage.md`, and `docs/worldbuilding-system/*` for how they should change in response to the pressure evidence. A correct answer may be "no change" for a tier, but every no-change verdict must be argued from the evidence and authority order.
- Distinguish these classes rigorously: methodology/package defect, principles change, ADR change, spec gap, methodology-coverage ledger change, app conformance/code defect, test/evidence change, PRD/issue slicing work, and no-action validation.
- Treat Field Build 04's "No methodology-source finding" as evidence, not as a command. Overturn it only if the full read shows a genuine methodology/package defect.
- Treat recent PRD proof reports as claims to reconcile, not as closure. Field Build 04 was run after the PRD #249/#250/#251 code line, yet it still reports related friction. Prefer the later pressure-test evidence when the route actually used by the steward contradicts a narrow proof report, and explain the reconciliation.
- The codebase analysis is in scope only to route findings to the right home and to make the doc-change report precise. Do not produce patches or final replacement prose.
- Online research is encouraged where it improves the change plan: guided workflow design, decision-support UI, local-first state reset, human-in-the-loop AI governance, clipboard prompt workflows, advisory artifact provenance, accessibility/form validation, state-machine UX, propagation/domain-sweep interaction design, or similar prior art. Cite external sources for any claim that shapes a recommendation.
- Do not rely on `/tmp/worldloom-field-build/...` files as fetchable. Use only the report's references to those files unless you can obtain them independently through an explicit external source.
- assumption: The deliverable filename is `field-build-04-aftershock-doc-change-plan.md`. If a different filename is desired, preserve the report substance and rename only the file.

## 4. The task

Analyze Field Build 04 in depth, then analyze all requested docs and whatever code is needed, and produce a downloadable markdown document that states the intended changes Worldloom Studio should make in response. The report must be evidence-based, authority-aware, and implementation-oriented: identify what belongs in the methodology package, principles, ADRs, specs, methodology coverage ledger, app code, tests, browser evidence, and PRD/issue slices. The central question is not only "what app bugs remain?" but "what should the documentation system change, if anything, so this kind of pressure evidence is encoded honestly and future work is aimed at the right home?"

## 5. Exploration and online-research mandate

Explore the repository as deeply as needed beyond the files listed above. Research online as deeply as needed - similar implementations, decision-support UI patterns, local-first state management, prompt/context design, human-in-the-loop AI governance, advisory artifact provenance, accessibility/form validation, state-machine UX, propagation workflow design, or other prior art - wherever it sharpens the deliverable. Cite sources for any external claim that materially affects a recommendation.

Do not ask clarifying questions. If a genuine contradiction makes a requirement impossible, state it in the deliverable and proceed with the most faithful interpretation.

## 6. Doctrine and constraints

- `docs/worldbuilding-system/` is upstream of principles, ADRs, specs, and code. A real package conflict must be identified as a package amendment; downstream docs must not silently override it.
- The package README says the method is storage- and software-agnostic. Do not add app-specific behavior to package files unless the pressure evidence proves a methodology defect independent of the app implementation.
- `docs/principles/README.md` defines the principles authority order. Higher-tier docs govern lower ones; a genuine divergence requires amending the higher tier first, never designing against it silently.
- `docs/principles/domain-fidelity.md` says the app implements the package and does not amend it; app field evidence can flow back upstream, but package amendments follow the package's evidence discipline.
- `docs/principles/charter.md` says the app replaces the package files in normal use: every decision point must carry the method instruction needed with `docs/worldbuilding-system/` closed.
- `docs/principles/canon-sovereignty.md` enforces steward sovereignty and W-1 Prompt-out: proposal/pressure prompts are advisory, pasted responses are immutable advisory artifacts, and no generated text becomes canon without deliberate steward authorship and Admission governance.
- `docs/principles/workflow-principles.md` says Admission is the only flow that admits, severity scales gate depth, skips are records, gates demand substance not clicks, and prompt-out belongs at every decision point except the world-essence proposal exception.
- `docs/principles/guided-workflow-usability.md` says a guided flow is incomplete unless the browser decision point shows what is owed, why, what can be skipped, prompt-out support, write intent, next step, and read-side trail. API/store tests are necessary but not enough for browser usability.
- `docs/principles/data-principles.md` says guided workflow surfaces may differ from stored record shape; generic record editing remains substrate and does not complete a field-tested protocol.
- ADR 0006 makes Admission a server-side module boundary. Browser code consumes server-returned queue, gate, warning, skip, coverage, and severity shapes; it must not own Admission policy.
- ADR 0007 makes Prompt-out a server-side cross-flow module. Prompt-out steps are advisory, optional, and step-oriented. Prompt-out never infers advisory use merely because a response was pasted.
- ADR 0008 says flow-owned persistence stores durable flow state; UI state is not the canon source.
- ADR 0009 says browser workflow state is a first-class guided decision surface over server-owned flow policy. Generic record forms are substrate, not a substitute for field-tested guided protocols.
- `docs/specs/admission-flow.md` already requires a server-returned executable full-gate completion contract, stable validation keys, input preservation, allowed statuses, ordered operations, constraint tags, explicit advisory-use artifacts, full-gate result, and read-side write preview. Test whether Field Build 04 reveals missing implementation, missing state reset, missing tests, missing spec, or missing coverage honesty.
- `docs/specs/prompt-out-context-assembly.md` already requires screen context and prompt packet context to be one assembly, loaded prompt status identity, proposal/pressure mode semantics, advisory/canon warning, advisory artifacts, dispositions, explicit advisory-use links, and current/stale packet-body guards. Test whether Field Build 04 reveals an implementation gap, a spec gap, or a coverage/proof gap.
- `docs/specs/creation-flow.md` already requires selected-section kernel prompt grain, the World premise essence exception, non-premise Proposal mode availability, explicit selected target heading, pressure gating for empty authored material, and no auto-save/flow advance from Proposal loading. Reconcile this with Field Build 04 P-02 and PRD #251.
- `docs/specs/propagation-flow.md` already requires owed-propagation queue, run entry, shock-cone orders, domain-atlas sweep, dispositions, debt/protected-boundary outcomes, surfaced proposals, close/result preview, prompt-out modes, and close blockers. Reconcile this with Field Build 04 F-02 and PRD #173.
- `docs/specs/workflow-map-and-navigation.md` says owed propagation should be foregrounded, guided flows are destinations entered from the map, and returning after flow action reloads fresh server-owned map state. Use this to assess F-02's manual fact/debt-id entry and active destination gaps.
- `docs/specs/browser-visible-guidance-acceptance.md` and `docs/specs/guided-flow-spec-template.md` define the proof standard for guided-flow writes and browser-visible acceptance. Use them to judge whether prior proof reports were too narrow and whether the docs should require stronger field-build regression mapping after representative browser proof.
- `docs/methodology-coverage.md` should be updated only when coverage class, maturity, caveat, field-use status, or proof claim changes. Do not promote global Prompt-out, Admission, Creation, or Propagation maturity from representative tests alone; require browser-visible and field evidence where the ledger demands it.

Authoring-time observations to verify against the pinned code:

- Field Build 04 says P-01 mode/body mismatch recurred after the PRD #250 packet identity line. Verify whether the active route still allows multiple visible packet bodies, stale DOM extraction, loaded-status/body disagreement, or action affordances that make the steward manually prove currentness.
- Field Build 04 says P-02 non-premise empty Proposal was blocked after the PRD #251 target-heading line. Verify whether the field run hit a stale route, disabled local selection state, missing server mode availability, wrong selected heading, failed auto-start, or a genuine incomplete fix.
- Field Build 04 says full-gate controls render and submit, but F-01 found stale cross-world textarea values, ambiguous labels, current-canon body/gate-section divergence, and unsafe gate result readback. Verify whether this is browser local-state reset, accessible-label uniqueness, server payload mapping, final review, living-card update policy, or spec ambiguity.
- Field Build 04 says P-03 full-gate prompt packets ignored steward-filled gate substance. Verify whether prompt assembly reads only selected-record prose and not unsaved/saved gate sections, status, operation, tags, written consequence, debt, omissions, or advisory-use context.
- Field Build 04 says F-02 Propagation run entry exists but the active workflow-shell cannot work the sweep. Verify whether the active routed destination lacks controls, whether controls exist only in a lower/legacy full-workspace panel, whether owed-debt selection is route-owned, and whether close blockers reflect severity-derived coverage before content exists.
- Field Build 04's methodology section says no methodology-source finding. Verify that claim by reading the package; do not overturn it lightly.

## 7. Deliverable specification

Produce one new downloadable markdown document named:

- `field-build-04-aftershock-doc-change-plan.md`

This is a recommendation/change-plan report, not a ratified repo artifact. It should provide substance plus home, not final paste-ready spec prose. For each intended change, state:

- the evidence anchor from Field Build 04;
- the classification: methodology/package change, principle change, ADR change, spec gap, methodology-coverage ledger change, app conformance/code fix, test/evidence change, no-action validation, or PRD/issue slice;
- the target home: package doc, principle, ADR, spec, code seam, test seam, coverage ledger, or PRD/issue slice;
- the intended change in precise engineering language;
- why that location is the correct altitude;
- acceptance/proof needed before closing it.

Recommended report structure:

1. Executive verdict.
2. Evidence classification table covering every Field Build 04 finding: V-REG-01, P-01, P-02, F-01, P-03, V-01, V-02, F-02, V-03, regression notes, decision-point log verdicts, and frontier state.
3. Reconciliation against recent proof reports: PRD #249, #250, #251, and #173. State which proofs remain valid, which were too narrow, and which pressure evidence reopens or reframes them.
4. Documentation impact by authority tier:
   - `docs/worldbuilding-system/` package: amend or explicitly no-change.
   - `docs/principles/`: amend or explicitly no-change.
   - `docs/adr/`: amend or explicitly no-change.
   - `docs/specs/`: exact spec homes for any needed clarifications.
   - `docs/methodology-coverage.md`: exact rows/caveats/maturity changes after implementation.
5. App/code implications needed to make the doc recommendations concrete: Admission full-gate state/review/readback, Prompt-out packet/gate context, Creation Proposal availability, Propagation active destination, workflow map/owed queue, and tests.
6. Suggested PRD/issue slicing in blocker-first order.
7. Browser/field evidence required to prove the fix, including docs-closed walkthrough expectations and cold external LLM packet checks when Prompt-out is in scope.
8. Online research findings that materially shaped the recommendations, with citations.
9. Risks, non-goals, and assumptions.

Produce the deliverable directly. Do not interview, do not ask clarifying questions. If a genuine contradiction makes a requirement impossible, state it in the deliverable and proceed with the most faithful interpretation.

## 8. Self-check

Before returning, verify your deliverable against this checklist:

- You read every required path group, including all 90 requested authority files under `docs/adr/`, `docs/principles/`, `docs/specs/`, and `docs/worldbuilding-system/`, plus `docs/methodology-coverage.md`.
- You did not rely on `/tmp` screenshots, cold-LLM artifacts, or world files as fetchable inputs.
- Every Field Build 04 finding and validation is classified, including regression replay and frontier state.
- You separated methodology/package defects from downstream principles, ADR, spec, coverage-ledger, app conformance, and evidence-proof defects.
- You reconciled the apparent contradiction between recent PRD proof reports and later Field Build 04 pressure evidence instead of treating either side as automatically authoritative.
- You did not weaken the authority order in `docs/principles/README.md`.
- You did not recommend LLM API integration, automatic canonization, auto-classification, or any path that bypasses prompt-out advisory storage and Admission governance.
- You treated the field report's `dd5bf2a` app commit as provenance and the fetch baseline `016c07631c17ecddedfe7a17b0f8c23474bde824` as the source tree to inspect.
- You cite external sources for every online-research claim that materially affects the plan.
- The deliverable states intended changes and homes, not final ratified replacement prose or issue publications.
- The deliverable set matches Section 7 exactly: one markdown document named `field-build-04-aftershock-doc-change-plan.md`.
