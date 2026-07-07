# Field Build 02 Change Plan Research Brief

## 1. Context

The uploaded manifest is `reports/manifest_2026-07-07_dd04bbd.txt`, the path inventory for `https://github.com/joeloverbeck/worldloom-studio.git`. Fetch every file from commit `dd04bbd1447f98817b9545651e4043dc326a72de`; the manifest reflects that exact tree.

Worldloom Studio is a local-first web app for creating and maintaining fictional worlds from a continuity and causality perspective. The repo authority order is: `docs/worldbuilding-system/` upstream of principles; `docs/principles/README.md` defines the principles authority order; ADRs in `docs/adr/` record concrete architecture decisions; specs in `docs/specs/` are downstream implementation contracts.

This brief responds to `reports/field-build-02-dead-air-earth.md`. That report's own app commit is `ed372a5c6aadad2ac7ba2fe6c50285861b6c102a`, while this remote-fetch baseline is `dd04bbd1447f98817b9545651e4043dc326a72de`. A targeted authoring-time equivalence check, `git diff --stat ed372a5 HEAD --` over the Admission, Creation, Prompt-out, workflow-shell, and relevant test seam paths named below, produced no output. Treat the named seam files as unchanged across the report commit and fetch baseline; do not generalize that claim to unrelated files.

The report names screenshots and a world file under `/tmp/worldloom-field-build/`. Those are not in the manifest and are not fetchable. Use the screenshot filenames inside the report as evidence labels only; do not require the images as inputs.

## 2. Read in full

Read these in full, in this order.

### Evidence read first

- `reports/field-build-02-dead-air-earth.md` - the pressure-test evidence being triaged; it owns the new blockers and friction findings.
- `reports/field-build-01-brindlemark.md` - prior field-build evidence that Field Build 02 partially regressed and partially validated.
- `reports/field-build-01-change-spec.md` - prior change plan that separated doc gaps from app conformance work after Field Build 01.
- `reports/prd-222-creation-handoff-walkthrough.md` - claimed browser evidence for the Creation handoff that Field Build 02 regression-checked.
- `reports/workflow-usability-doc-overhaul-research-report.md` - prior workflow usability analysis; use it as background for W-8/W-9 altitude, not as a substitute for the current field evidence.

### Repo identity and coverage

- `README.md` - repo purpose.
- `CONTEXT.md` - app-specific vocabulary and the deference rule to the worldbuilding-system glossary.
- `docs/methodology-coverage.md` - current coverage/maturity ledger; Field Build 02 may require honest updates or caveats.

### Methodology package

- `docs/worldbuilding-system/` - read all 58 files under this directory. This count was computed from the fetch baseline: 27 root/package files, 12 checklists, and 19 templates. Read the package in its own order: README/manifest/operating card, numbered root files, then checklists/templates relevant to Creation, Admission, and Prompt-out. The entire package is load-bearing because the user explicitly requested it and because this task must distinguish methodology defects from app encoding defects.

### Principles, ADRs, and specs

- `docs/principles/` - read all 7 files. Start with `docs/principles/README.md`; it defines the authority order and conformance rule.
- `docs/adr/` - read all 9 files in numeric order. Pay special attention to ADR 0001, 0002, 0006, 0007, 0008, and 0009.
- `docs/specs/` - read all 16 files. Prioritize `admission-flow.md`, `creation-flow.md`, `workflow-map-and-navigation.md`, `browser-visible-guidance-acceptance.md`, `prompt-out-context-assembly.md`, `guided-flow-spec-template.md`, `method-cards.md`, and `schema-v1.md`, then read the remaining flow specs for cross-flow consistency.

### Primary code seams

- `packages/server/src/admission-flow.ts` - Admission queue, severity, decision-point payload, prompt-out binding, seed audit, write intent, and read-side trail.
- `packages/server/src/http/admission-routes.ts` - HTTP shape for Admission queue, decision point, severity, start, gate, seed audit, skip, and minor batch routes.
- `packages/server/src/prompt-out.ts` - shared prompt assembly and method-card selection for Admission/Creation prompt generation.
- `packages/server/src/prompt-out-defaults.ts` - default prompt templates and role text.
- `packages/server/src/decision-point-contract.ts` - shared `decision-point/v1` contract.
- `packages/server/src/creation-flow.ts` - Creation decision payload, selected-section context, consequence-mode readiness, seed parking, and handoff.
- `packages/server/src/http/creation-routes.ts` - Creation start, kernel-step, decomposition, and checkpoint route shape.
- `packages/server/src/active-world-session.ts` - server-side active world session.
- `packages/server/src/app.ts` - route composition and app setup.
- `packages/web/src/main.tsx` - browser state, workflow-shell routing, Admission destination, Creation state, prompt step state, create/open handling, and legacy/routed surface split.
- `packages/web/src/workflow-shell.tsx` - routed guided-flow shell and destination surface.
- `packages/web/src/admission-decision-surface.test.tsx` - browser-render evidence for Admission decision-point payload.
- `packages/web/src/creation-decision-surface.test.tsx` - browser-render evidence for Creation decision-point payload.
- `packages/web/src/setup-open-world.test.tsx` - setup/open browser evidence.
- `packages/web/src/workflow-shell.test.tsx` - workflow-shell expectations.
- `packages/server/test/app.test.ts` - HTTP seam coverage, especially Admission and prompt-out tests.
- `packages/server/test/creation-flow.test.ts` - Creation flow coverage.
- `packages/server/test/setup-open-world.test.ts` - server setup/open coverage.

Explore beyond this list as needed, especially nearby tests, CSS, route registry tests, and any GitHub/PRD references discoverable from tracked docs. The list above is the required minimum, not the exploration ceiling.

## 3. Settled intentions

- You are ChatGPT-Pro in a remote-fetch deep-research session. Fetch files from the pinned commit above, use the manifest as the path inventory, and produce the deliverable directly.
- The task is a foundational/doc-overhaul plus hardening analysis driven by real pressure-test evidence. Big changes are allowed if the evidence warrants them.
- The primary seed is Field Build 02. Read it before the authority stack so the evidence frames the questions you ask of the docs and code.
- The output is a recommendation/change-plan report, not direct code, not ratified spec text, and not an issue publication. It should describe intended changes and their correct homes.
- Distinguish three classes rigorously: methodology/package defect, downstream doc/spec gap, and app conformance/code defect. If existing specs already require the behavior, classify the finding as conformance/code work rather than inventing a new doctrine change.
- Treat Field Build 02 validation findings as evidence too. Do not write a plan that reopens already-fixed Field Build 01 happy-path blockers unless Field Build 02 found residual friction.
- The Admission blocker is the likely primary slice: the workflow map routes to Admission, but the routed Admission destination must let a docs-closed steward perform the selected queue record's active decision from server-owned data.
- The state hardening cluster is secondary but important: same-session world switching must not pair one visible world file with another world's flow records or prompt state; Creation kernel section selection and unsaved consequence-mode selection must not create misleading or cross-section writes.
- Online research is encouraged where it improves the change plan: guided workflow design, decision-support UI, local-first app state reset patterns, prompt/context assembly, AI advisory governance, or similar prior art. Cite external sources for any claim that shapes a recommendation.
- assumption: The deliverable filename is `field-build-02-change-plan.md`. If a different filename is desired, preserve the report substance and rename only the file.

## 4. The task

Analyze Field Build 02 in depth, then analyze all requested docs and whatever code is needed, and produce a downloadable markdown change plan that states the intended changes Worldloom Studio should make in response. The plan should be evidence-based, authority-aware, and implementation-oriented: identify what belongs in docs/specs, what belongs in code, what belongs in tests/browser evidence, and what should be sliced into PRD/issue work.

## 5. Exploration and online-research mandate

Explore the repository as deeply as needed beyond the files listed above. Research online as deeply as needed - similar implementations, decision-support UI patterns, local-first state management, prompt/context design, human-in-the-loop AI governance, or other prior art - wherever it sharpens the deliverable. Cite sources for any external claim that affects a recommendation.

Do not ask clarifying questions. If a genuine contradiction makes a requirement impossible, state it in the deliverable and proceed with the most faithful interpretation.

## 6. Doctrine and constraints

- `docs/worldbuilding-system/` is upstream of principles, ADRs, specs, and code. A real package conflict must be identified as a package amendment; downstream docs must not silently override it.
- `docs/principles/README.md` defines the principles authority order. Key constraints engaged here include P-2/W-1 steward sovereignty and prompt-out as advisory, W-2 severity scaling, W-3 sweeps propose and only Admission admits, W-8 guided flows as decision-point surfaces, W-9 replacement-grade guidance, T-1/T-7 one SQLite world file and browser storage never canonical, and T-8 honest coverage.
- ADR 0006 makes Admission a server-side module boundary. Browser code consumes server-returned queue, gate, warning, skip, coverage, and severity shapes; it must not own Admission policy.
- ADR 0007 makes Prompt-out a server-side cross-flow module. Prompt-out steps are advisory, optional, and step-oriented. Pasted responses do not become canon and advisory use is explicit.
- ADR 0008 says flow-owned persistence stores durable flow state; UI state is not the canon source.
- ADR 0009 says browser workflow state is a first-class guided decision surface over server-owned flow policy. Generic record forms are substrate, not a substitute for field-tested guided protocols.
- `docs/specs/admission-flow.md` already requires queue selection, severity declaration, minor/full gate paths, frontloaded seed audit, skip records, doctrine at point of use, and browser decision-point UI. Test whether Field Build 02 reveals missing implementation rather than missing spec.
- `docs/specs/workflow-map-and-navigation.md` already requires one visible destination at a time, guided-flow interiors, server-owned state refresh, and Admission queue foregrounding after parked proposed seeds.
- `docs/specs/prompt-out-context-assembly.md` already requires screen context and prompt packet context to be one assembly, with explicit omissions and advisory/canon warning. Test whether the Admission prompt preview violates that by choosing minor-ledger framing before severity is declared.
- `docs/specs/creation-flow.md` already requires explicit consequence-mode facet selection, selected-section kernel prompt grain, decomposition blockers, seed parking at `proposed`, and Admission handoff. Test Field Build 02 residual friction against this contract before recommending new docs.
- The report's "For The Methodology" section says no methodology-source finding was found. Do not overturn that lightly; only recommend package changes if the full read shows a genuine methodology defect.

Authoring-time observations to verify against the pinned code:

- `admissionDecisionPoint` chooses method card `admission.queue-severity` when severity is undeclared, but `promptOutFor` appears to pick `admission_prerequisite_audit` and `admission:dependencies` whenever `gate?.path !== "full_gate"`. In `prompt-out.ts`, that admission template maps to `admission.minor-ledger`. This likely explains Field Build 02 P-01.
- The routed workflow-shell Admission surface in `packages/web/src/main.tsx` is much thinner than the legacy Admission surface in the same file. The richer legacy surface appears to render decision payload details, while the routed surface can show only a queue and minimal decision text unless state has already been loaded. This likely explains Field Build 02 F-02.
- `createOrOpen` reloads world data and moves to the map, but appears not to clear flow-specific client state such as `creationDecision`, `flowId`, `kernelRecordId`, selected Admission decision, and loaded prompt step. This likely explains Field Build 02 F-01.
- Creation kernel heading/body state appears to be local React state; verify whether changing `kernelHeading` deterministically hydrates saved section text or empty state, and whether dirty unsaved text is guarded before switching. This likely explains R-REG-02.
- Consequence-mode selection is local until saved as a facet; verify whether readiness text distinguishes selected-but-unsaved state. This likely explains R-REG-01.

These are observations, not verdicts. Verify them from source before using them.

## 7. Deliverable specification

Produce one new downloadable markdown document named:

- `field-build-02-change-plan.md`

This is a recommendation/change-plan report, not a ratified repo artifact. It should provide substance plus home, not final paste-ready spec prose. For each intended change, state:

- the evidence anchor from Field Build 02;
- the classification: methodology/package change, docs/spec gap, app conformance/code fix, test/evidence change, or no-action validation;
- the target home: package doc, principle, ADR, spec, code seam, test seam, coverage ledger, or PRD/issue slice;
- the intended change in precise engineering language;
- why that location is the correct altitude;
- acceptance/proof needed before closing it.

Recommended report structure:

1. Executive verdict.
2. Evidence classification table covering every Field Build 02 finding: V-REG-01, R-REG-01, R-REG-02, V-01, F-01, R-01, V-02, V-03, F-02, P-01, P-02.
3. Primary change package: Admission queue-selection and decision-point projection.
4. Secondary hardening package: world-switch state reset, Creation section hydration, unsaved consequence-mode readiness, and loaded prompt status binding.
5. Docs/spec implications: which docs are already sufficient, which need amendments, and which should not change.
6. Code seams and test seams to change.
7. Suggested PRD/issue slicing, including blocker-first order.
8. Browser/field evidence required to prove the fix.
9. Risks, big-change justification, and non-goals.
10. Open assumptions or contradictions, if any.

Produce the deliverable directly. Do not interview, do not ask clarifying questions. If a genuine contradiction makes a requirement impossible, state it in the deliverable and proceed with the most faithful interpretation.

## 8. Self-check

Before returning, verify your deliverable against this checklist:

- You read every required path group, including all 90 requested authority files under `docs/adr/`, `docs/principles/`, `docs/specs/`, and `docs/worldbuilding-system/`.
- You did not rely on `/tmp` screenshots or world files as fetchable inputs.
- Every Field Build 02 finding is classified, including validation findings and prompt/status friction findings.
- You separated methodology/package defects from downstream doc gaps and app conformance/code defects.
- You did not weaken the authority order in `docs/principles/README.md`.
- You did not recommend LLM API integration, automatic canonization, or any path that bypasses prompt-out advisory storage and Admission governance.
- You treated the field report's `ed372a5` commit as provenance and the fetch baseline `dd04bbd1447f98817b9545651e4043dc326a72de` as the source tree to inspect.
- You cite external sources for every online-research claim that materially affects the plan.
- The deliverable set matches section 7 exactly: one markdown document named `field-build-02-change-plan.md`.
