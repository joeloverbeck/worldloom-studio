# Research Brief — Workflow Usability and Documentation Overhaul

*Paste this entire document into a fresh ChatGPT-Pro deep-research session and upload the manifest file named below. You have none of the context in which this brief was authored; everything you need is in this prompt plus the uploaded manifest. Produce the deliverable directly. Do not interview or ask clarifying questions.*

## 1. Context

The uploaded manifest is `reports/manifest_2026-07-04_c63a7db.txt`, the exact path inventory of the `joeloverbeck/worldloom-studio` repository at commit `c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e` (`c63a7db`). Fetch every repository file you need from that commit; the manifest reflects that tree. Use raw URLs of the form:

`https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e/<path>`

Worldloom Studio is a local-first, single-steward web app for creating and maintaining fictional worlds from a continuity and causality perspective. It implements the Causal Canon Worldbuilding System 1.0 in `docs/worldbuilding-system/`.

The current concern is directional, not a narrow bug: the formal record types and world-file contents appear mostly developed, but the web app risks becoming opaque. The methodology is supposed to become easier in software. When following `docs/worldbuilding-system/**` directly, a steward gets precise instructions at each decision point. Software should improve that by showing the exact local task, required fields, doctrine at point of use, and copyable prompts assembled with enough context for an external LLM to help at that point. The current app direction may not be doing that strongly enough.

This is a **foundational / doc-overhaul** research task. Your deliverable is a downloadable markdown report recommending intended changes anywhere under `docs/**` so future specs, issues, and implementation work build a usable guided process rather than a technically faithful but opaque record editor. Radical recommendations are allowed: remove, merge, correct, split, or create docs if the evidence warrants it. Do **not** edit the repository; this session produces the report only.

There is no predecessor brief on this exact concern. Relevant prior lineage includes:

- `archive/reports/foundational-principles-research-report.md` — the original evidence base for the app principles.
- `reports/principles-third-iteration-outlook.md` — later robustness/build-readiness assessment of the principles line.
- `reports/build-start-plan.md` — the sequence that led from principles into ADRs/specs/implementation.
- `reports/tenth-iteration-outlook.md` — package-line warnings about what the methodology does and does not claim.

Treat those as evidence and lineage, not as settled answers to this task.

## 2. Read in full

Read these in full before producing the report. The file counts below were computed from commit `c63a7dbcf9d2dfa7fbc46f467d6beb1eb32d184e`.

**Orientation and app vocabulary**

- `README.md` — repo identity and mission.
- `CONTEXT.md` — app-layer vocabulary and avoided synonyms.
- `docs/methodology-coverage.md` — current ledger of guided-flow, sweep-only, schema-only, and non-goal coverage.

**Primary authority and target surface**

- `docs/worldbuilding-system/` — entire directory, 58 files. Read in the package's own authority order. Group reason: this is the upstream method the app must make easier to perform. Priority files for this task: `README.md`, `00_overhaul_notes.md`, `05_creation_protocol.md`, `06_canon_fact_admission_protocol.md`, `20_ai_assisted_workflow.md`, `21_templates_index.md`, `operating_card.md`, all `templates/**`, and all `checklists/**`.
- `docs/principles/` — entire directory, 6 files. Group reason: this is the suspected gap surface; it should govern whether future app work owes decision-point instructions, doctrine surfacing, context assembly, and prompt-out support.
- `docs/adr/` — entire directory, 8 files. Group reason: architecture decisions may be steering implementation toward generic surfaces or away from explicit process guidance.
- `docs/specs/` — entire directory, 9 files. Group reason: current specs show how principles are translated into app behavior; assess whether their standard of "guided flow" is strong enough.

**Evidence and prior reports**

- `archive/reports/foundational-principles-research-brief.md` — the original commission for the app principles.
- `archive/reports/foundational-principles-research-report.md` — evidence and recommendation report for the first app-principles line.
- `reports/principles-third-iteration-research-brief.md` — later principles robustness brief.
- `reports/principles-third-iteration-outlook.md` — verdict, warnings, and readiness gaps from the principles robustness pass.
- `reports/build-start-plan.md` — ratified/provisional build-start decisions and sequence.
- `reports/tenth-iteration-outlook.md` — warnings about over-reading the methodology's 1.0 label and its honestly untested surfaces.
- `reports/eighth-iteration-field-trial.md` and `reports/ninth-iteration-field-trial.md` — field-trial logs showing how the method actually behaves when performed manually.
- `reports/field-trial-world/` — entire directory, 11 files. Group reason: first filled artifact set; use it to compare manual process steps with what the app currently surfaces.
- `reports/field-trial-world-2/` — entire directory, 13 files. Group reason: second filled artifact set; especially useful for admission ledger, pass reports, supersession, prompt/help opportunities, and QA.

**Current code seams as evidence only**

Read these to understand what the current docs have induced in the app. Do not turn this into an implementation review; use code only as evidence of product direction.

- `packages/shared/src/index.ts` — record types, vocabularies, link types, and schema-facing package derivations.
- `packages/server/src/prompt-out.ts` — prompt assembly and advisory artifact mechanics.
- `packages/server/src/creation-flow.ts` — creation-flow server behavior.
- `packages/server/src/admission-flow.ts` — admission queue and gate policy.
- `packages/server/src/propagation-flow.ts` — propagation flow.
- `packages/server/src/contradiction-flow.ts` — contradiction/retcon/mystery flow.
- `packages/server/src/institutional-flow.ts` — stage-12 guided flow.
- `packages/server/src/qa-flow.ts` — QA flow.
- `packages/server/src/canon-workbench.ts` — read-side workbench.
- `packages/web/src/main.tsx` — current React surface and workflow affordances.
- `packages/web/src/styles.css` — current layout and information hierarchy clues.

**Boundary-awareness**

- `AGENTS.md` and `CLAUDE.md` — repo operating guidance.
- `docs/agents/` — issue tracker, domain-doc, and triage conventions. Read only to avoid recommending a workflow that conflicts with repo governance.

If `CONTEXT-MAP.md` is absent, proceed; this repo has `CONTEXT.md`, and the agent docs allow lazy creation of context maps.

## 3. Settled intentions

These decisions are final for this research task.

1. **The report is about future documentation direction.** Recommend what should change in `docs/**` so future app work builds a clearer guided process. Do not produce implementation code and do not edit repo files.
2. **The user's concern is accepted as the hypothesis to test.** The app may be formally faithful while still opaque. Assess whether the current docs fail to require enough guidance at decision points.
3. **The desired app behavior is decision-point assistance.** At each meaningful step, the steward should see what they are deciding, what must be filled, which package doctrine governs it, what is optional/skippable, what the app will remember/check, and what prompt-out support is available.
4. **Prompt-out remains external.** Do not recommend built-in LLM API calls as the primary fix. The v1 boundary is prompt-out/paste-in: the app generates copyable prompts, the steward runs them externally, pasted responses are advisory artifacts, and canon never changes without deliberate steward action.
5. **Context assembly is a first-class product requirement.** A generated prompt should be sophisticated enough to carry the relevant world context, record context, doctrine, vocabulary guardrails, standing rulings, and current decision point so an external LLM can produce useful pressure for that exact step.
6. **User sovereignty remains structural.** Do not weaken `canon-sovereignty.md` P-2, do not allow generated text to become canon automatically, and do not recommend prompt UX that starts by asking the LLM to author final canon before steward material exists.
7. **Radical doc changes are allowed.** If evidence supports it, recommend removing, merging, correcting, splitting, or creating docs anywhere under `docs/**`, including principles, ADRs, specs, coverage ledgers, or methodology-package documents. Since `docs/worldbuilding-system/` is upstream, proposed changes there must be framed as package amendments, not silent app-layer workarounds.
8. **Output is an analysis/recommendation report, not ratified text.** For each recommendation, provide the substance and home: what the target document must own, which file should change, and why. Do not write final paste-ready replacement prose unless a short illustrative snippet is necessary to disambiguate the recommendation.
9. `assumption:` The deliverable filename is `workflow-usability-doc-overhaul-research-report.md`.

## 4. The task

Perform a deep research and repository analysis pass to determine what should change in `docs/**` so Worldloom Studio becomes a guided, understandable software implementation of the Causal Canon Worldbuilding System rather than an opaque data-entry surface.

Evaluate whether the current documentation stack sufficiently requires:

- exact instructions at each decision point;
- step-specific form/field obligations;
- visible package doctrine at point of use;
- severity-scaled paths that prevent both bureaucracy and under-governance;
- explicit optional/skippable instruments and skip recording;
- prompt-out support at every dependency-bearing step;
- context-rich copyable prompts for external LLMs;
- clear separation between advisory material and canon;
- workflow maps that let the steward know where they are, what is next, and why;
- read-side views that answer "what is canon today?" and "how did it get here?" without replacing guided creation/maintenance;
- specs/issues that make browser-visible guidance and ergonomic workflow surfaces part of acceptance, not incidental UI.

Use the current code as evidence of how the docs are being interpreted. If the code appears opaque because the docs permit or encourage a record-store-first interpretation, say which docs should change. If the docs already say the right thing but specs/issues or coverage ledgers fail to enforce it, recommend where to harden that enforcement.

## 5. Exploration and online-research mandate

Explore the repository as deeply as needed beyond the read list. Research online as deeply as needed; cite sources for every external claim that shapes a recommendation.

Prior-art and research directions likely to matter:

- software for making complex formal processes usable: decision support systems, wizard flows, progressive disclosure, checklist design, cognitive walkthroughs, task-oriented forms, workflow engines, and documentation-to-UI translation;
- mixed-initiative creative tools and human-in-the-loop authoring;
- prompt engineering for context packaging, retrieval-grounded prompt generation, copyable prompt UX, and external-LLM workflows;
- worldbuilding/campaign/continuity tools such as World Anvil, LegendKeeper, Kanka, Campfire, Obsidian-based stacks, wiki systems, and professional franchise continuity databases;
- local-first creative tools that balance structured records with narrative work;
- HCI research on opacity, user mental models, guided workflows, form burden, and AI over-reliance;
- checklist research, including where checklists improve outcomes and where they degrade into ritual;
- process-mining or workflow-design literature if it helps map a methodology into software.

Deep research is expected here. Do not stop at repo-internal evidence if external research can sharpen what the docs should require.

## 6. Doctrine and constraints

- **Authority order.** `docs/principles/README.md` says `docs/worldbuilding-system/` is upstream; then `charter.md`; then `canon-sovereignty.md` and `domain-fidelity.md`; then `workflow-principles.md` and `data-principles.md`; then ADRs. A genuine conflict is repaired at the right tier or routed as a package amendment.
- **Methodology fidelity.** The app implements the Causal Canon Worldbuilding System; it does not replace it with generic CRUD, a wiki, a project manager, or freeform AI generation.
- **The steward judges; the app clerks.** The app should remember, route, assemble context, preserve references, surface doctrine, track state, and enforce substance. It must not compute or infer steward-owned judgments such as truth layer, canon status, consequence mode, or final wording.
- **Prompt-out/paste-in is a sovereignty mechanism.** Generated prompts are assistance, not authority. Pasted responses are immutable advisory artifacts. Any future convenience still routes through the advisory store and admission gate.
- **Severity scaling matters.** Recommendations should preserve the package's balance: trivial facts must remain cheap, but major/foundational facts must not bypass required substance.
- **Evidence honesty.** Surfaces the package marks honestly untested (`10`, `11`, `14`, `15`, `16`, `17`, and `19`/`20` under a naive steward) must not be upgraded silently. If your recommendation depends on an untested surface, flag it.
- **No implementation prescription unless doc-level.** You may name code seams as evidence, but the deliverable is not a PRD, not a code-review report, and not an issue breakdown.

## 7. Deliverable specification

Produce one downloadable markdown document:

`workflow-usability-doc-overhaul-research-report.md`

The report must contain:

1. **Executive verdict.** State whether the current documentation stack is sufficient to force the desired app shape, and why.
2. **Problem model.** Describe the specific mismatch between manual methodology use and current app direction: what the human gets from the docs today, what software should add, and where opacity appears.
3. **Evidence from the repo.** Cite the docs and code seams that show the current direction, including any contradictions or weak requirements.
4. **External research and prior art.** Summarize relevant findings and cite sources. Focus on research that changes a recommendation.
5. **Recommended doc changes.** For each recommendation:
   - target file/path or proposed new file;
   - change type: add, remove, merge, split, correct, strengthen, or package-amendment candidate;
   - the intended substance the document should own;
   - rationale from repo evidence and/or external research;
   - priority and dependency ordering;
   - risks or tradeoffs.
6. **Principles gap assessment.** Specifically assess whether `docs/principles/*` needs new principles or stronger wording around guided workflows, decision-point instruction, context assembly, prompt-out quality, and UI/UX obligations.
7. **Spec and ADR gap assessment.** Identify changes needed so future specs/issues cannot satisfy a flow by exposing API operations while leaving the browser workflow opaque.
8. **Methodology-package amendment candidates.** If any `docs/worldbuilding-system/**` change is warranted, list it separately as an upstream amendment candidate, with evidence and caution.
9. **A phased adoption plan.** Recommended order for making doc changes later, without assuming all changes happen at once.
10. **Self-check.** A short checklist proving the report read the required surfaces, preserved sovereignty, did not recommend automatic canonization, and tied each recommendation to a document home.

Produce the deliverable directly as a downloadable markdown document. Do not interview, do not ask clarifying questions. If a genuine contradiction makes a requirement impossible, state it in the report and proceed with the most faithful interpretation.

## 8. Self-check for Session 2

Before returning the report, verify:

- Every directory-scoped read requirement was satisfied, especially `docs/worldbuilding-system/` (58 files), `docs/principles/` (6), `docs/adr/` (8), and `docs/specs/` (9).
- The report treats current code as evidence, not as the target artifact.
- Every external claim that shapes a recommendation is cited.
- No recommendation allows LLM output to become canon automatically.
- Recommendations distinguish app-layer doc changes from upstream methodology amendments.
- Recommendations include both what to change and where the change should live.
- The report names at least one way future specs/issues can enforce browser-visible guidance and prompt quality instead of merely server/API correctness.
- The deliverable filename matches `workflow-usability-doc-overhaul-research-report.md`.
