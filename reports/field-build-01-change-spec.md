# Field Build 01 Change-Spec — Brindlemark

**Target repository:** `joeloverbeck/worldloom-studio`  
**Target commit:** `862ffa07bf3062655af5ac6841ed7ca6abdac760`  
**Output status:** new recommendation document; not ratified doc text; not a replacement for any existing file.  
**Freshness claim:** user-supplied target commit only. This report does **not** verify that the commit is current `main`.

All repository citations below refer to files fetched from the exact commit above through exact raw GitHub URLs. External sources are used only as supporting UX/research evidence; they are never used to assert target-repository state.

---

## 1. Determination / verdict

**Verdict: endorse the field report's “No methodology-source finding” claim.** The first Brindlemark field build exposed a real app/doc-obsolescence failure, but the failure is not in the upstream methodology package. The package already tells a steward to build a compact world kernel, names the kernel's reality/consequence-mode obligation, maps the kernel list section-by-section to `templates/world_kernel.md`, requires early mode declaration before seed decomposition, and defines seed decomposition with an explicit granularity rule and thin-start bound (`docs/worldbuilding-system/05_creation_protocol.md:L1-L8`; `docs/worldbuilding-system/templates/world_kernel.md:L0-L7`). The package also places truth-layer assignment in Phase 3, after decomposition and before the seed is treated as accepted, while the frontloaded seed audit says each seed fact must have truth layer and proposed status before admission (`docs/worldbuilding-system/05_creation_protocol.md:L8-L9`; `docs/worldbuilding-system/checklists/frontloaded_seed_audit.md:L0-L1`).

The package's AI workflow is also adequate for the walked seam: proposal mode asks for candidate material for the judgment at hand; pressure mode challenges steward-authored material; the steward remains the author; and AI output may not assign truth layer, status, or other separated labels (`docs/worldbuilding-system/20_ai_assisted_workflow.md:L0-L3`, `docs/worldbuilding-system/20_ai_assisted_workflow.md:L20-L21`). The field report itself reaches the same conclusion: the package was actionable and the blocker was app encoding (`reports/field-build-01-brindlemark.md:L24-L25`).

**The warranted doc changes are therefore narrower than the raw finding list.** They land in the coverage ledger, a few app-facing specs, and one optional architectural-principle hardening. Most findings are conformance/code work against existing docs, not new documentation requirements.

### Per-tier disposition

| Tier | Disposition |
|---|---|
| Upstream package, `docs/worldbuilding-system/` | **No package amendment.** No M-class methodology defect was found. The package covers the method seams the app failed to carry: kernel section prompts, consequence-mode commitment, seed decomposition, seed audit/admission, and AI proposal/pressure boundaries. |
| Constitution-tier principles: `charter.md`, `canon-sovereignty.md`, `domain-fidelity.md` | **No change.** The constitution already says the app replaces package files in normal use, the steward judges while the app remembers/routes/checks, and the app must never compute/default/infer truth layer, status, or equivalent steward judgments (`docs/principles/charter.md:L1-L3`; `docs/principles/domain-fidelity.md:L8-L12`). No explicit-steward-decision escalation is warranted. |
| Architectural principles | **One narrow reinforcement recommended** in `guided-workflow-usability.md` W-8: make nested/composite decision points explicit. No new principle ID should be invented by this report. `workflow-principles.md` W-1/W-7 already covers prompt-out modes and substance gates, so no separate change there is required (`docs/principles/workflow-principles.md:L10-L14`). |
| ADRs | **No new ADR recommended.** ADR 0007 already owns Prompt-out as a cross-flow step module with step identity, flow context, selected-record context, and self-contained prompt generation (`docs/adr/0007-prompt-out-step-module-seam.md:L0-L6`). ADR 0009 already owns the browser guided-flow boundary and says the browser consumes server-owned flow state, doctrine payloads, prompt lifecycle shapes, blockers, write intents, and trails (`docs/adr/0009-browser-guided-flow-boundary.md:L0-L4`). The Brindlemark failures need spec hardening and implementation conformance, not a new architectural seam. |
| App-facing specs | **Targeted changes recommended** in `creation-flow.md`, `prompt-out-context-assembly.md`, `guided-flow-spec-template.md`, and `browser-visible-guidance-acceptance.md`. These changes specify selected-section guidance, selected-section prompt packet grain, and inline recovery/error evidence. |
| Coverage ledger | **Honesty correction required.** `docs/methodology-coverage.md` currently rates Creation as `walkthrough-passed` and describes PRD evidence for seed decomposition blockers and prompt context (`docs/methodology-coverage.md:L3-L10`, `docs/methodology-coverage.md:L24-L28`). Field Build 01 blocked at the first seed decomposition and should now be recorded as a stricter app-use regression against that claim (`reports/field-build-01-brindlemark.md:L24-L26`). |
| Boundary-awareness specs for unreached downstream flows | **No change.** They were read for scope and contradiction checks only. This one field build did not reach Propagation, Constraint Composition, Temporal/Timeline, Institutional/Economic/Suppression, Contradiction/Retcon/Mystery, QA, Canon Workbench, markdown export, or schema-v1. |

---

## 2. Per-finding triage

Classification key:

- **Spec-divergence / app conformance** — the docs already contain the necessary contract; route to app/code/PRD work, not doc change.
- **Genuine doc gap** — the relevant downstream docs are missing or under-specifying the contract; include in §3 recommendations.
- **Validation** — evidence that an existing surface worked; no change.

| Finding | Triage | Justification | Routing |
|---|---|---|---|
| **V-01 — setup/world creation carried by the app** | Validation | The field build says setup/open was docs-obsolete (`reports/field-build-01-brindlemark.md:L1-L2`). Existing workflow-map/setup spec already requires setup controls before a world opens, inline create/open failures, and Creation foregrounding after success (`docs/specs/workflow-map-and-navigation.md:L6-L9`). | No doc change. |
| **R-01 — workflow map foregrounds Creation but later destinations look available** | Spec-divergence / app conformance | W-10 says the map renders stages as done, active, owed, blocked, or not yet earned, and that all flows must not compete as equal first actions (`docs/principles/guided-workflow-usability.md:L10-L12`). The workflow-map spec defines `blocked` and `not_yet_earned`, with unlock reasons (`docs/specs/workflow-map-and-navigation.md:L11-L13`). | Code/conformance work against existing `workflow-map-and-navigation.md`; no doc change. |
| **V-02 — world-premise proposal refusal is correct** | Validation | The report validates the essence refusal (`reports/field-build-01-brindlemark.md:L4-L5`). `20` reserves the world's essence to the steward, and the prompt-out spec encodes the Creation World-premise exception (`docs/worldbuilding-system/20_ai_assisted_workflow.md:L3-L4`; `docs/specs/prompt-out-context-assembly.md:L22-L24`). | No doc change. |
| **V-03 — world-premise pressure packet passed cold-LLM test** | Validation | The field report says the cold subagent produced grounded pressure from the packet (`reports/field-build-01-brindlemark.md:L5-L7`). The prompt-out spec defines cold external LLM pass/fail criteria (`docs/specs/prompt-out-context-assembly.md:L28-L30`). | No doc change. |
| **R-02 — kernel section prompts missing at point of authoring** | Genuine doc gap | The report says the UI showed section names and required/allowed-empty state but not the selected section's template prompt (`reports/field-build-01-brindlemark.md:L7-L8`). `creation-flow.md` requires section headings, required sections, and template citation, but not the selected section's local prompt beside the field (`docs/specs/creation-flow.md:L6-L8`, `docs/specs/creation-flow.md:L17-L18`). W-8 implies local doctrine at the decision point, but the app-facing spec should own this exact section-level requirement (`docs/principles/guided-workflow-usability.md:L1-L3`). | Doc change in `creation-flow.md`; generalized template change in `guided-flow-spec-template.md`; optional W-8 hardening. |
| **P-01 — kernel proposal packet does not identify selected section** | Genuine doc gap | The report's cold LLM returned broad kernel candidates because the selected section and section-local prompt were absent (`reports/field-build-01-brindlemark.md:L8-L10`). `prompt-out-context-assembly.md` says Creation packets include current kernel/decomposition material and `templates/world_kernel.md` where kernel authoring is in scope, but does not require selected heading, section prompt, required/optional status, or local task identity as packet grain (`docs/specs/prompt-out-context-assembly.md:L15-L18`). | Doc change in `prompt-out-context-assembly.md` and `creation-flow.md`; generalized template change. |
| **R-03 — consequence-mode explicitness inconsistent** | Spec-divergence / app conformance | The downstream contract already exists: `creation-flow.md` says the authoritative value is the `consequence_mode` facet, never defaulted, and written only from explicit steward choice (`docs/specs/creation-flow.md:L11-L11`, `docs/specs/creation-flow.md:L25-L27`). The constitution/architectural principles forbid inferred/defaulted steward labels (`docs/principles/workflow-principles.md:L1-L1`; `docs/principles/domain-fidelity.md:L8-L12`). | App must expose/satisfy the existing facet contract. No doc change to the facet obligation itself. The inline-readiness recommendation in §3.2 concerns recovery presentation, not a new consequence-mode rule. |
| **P-02 — kernel pressure mode advertised but not reachable** | Spec-divergence / app conformance | `workflow-principles.md` W-1 requires proposal prompts except the essence decision and pressure prompts wherever steward material exists, with modes visible in the browser (`docs/principles/workflow-principles.md:L12-L14`). `prompt-out-context-assembly.md` separately defines proposal and pressure modes (`docs/specs/prompt-out-context-assembly.md:L22-L24`). | Code/conformance work. No doc change. |
| **F-01 — seed decomposition blocked by missing consequence-mode control** | Spec-divergence / app conformance | The app's own spec requires explicit consequence-mode selection in kernel authoring and writes the facet only from steward choice (`docs/specs/creation-flow.md:L17-L18`, `docs/specs/creation-flow.md:L25-L27`). `05` also requires mode declaration before decomposition (`docs/worldbuilding-system/05_creation_protocol.md:L5-L8`). | Code/conformance work to surface the existing control/facet. The §3.2 readiness/error change only makes missing-control blockers visible before/after submit. |
| **F-02 — seed decomposition sends empty truth layer without visible control** | Spec-divergence / app conformance, with package-order note | `creation-flow.md` already requires title/body/truth-layer/granularity controls inside Creation and parks seed records with steward-supplied truth layer at `proposed` (`docs/specs/creation-flow.md:L20-L22`, `docs/specs/creation-flow.md:L26-L28`). The package assigns truth layer in Phase 3 after decomposition and before acceptance (`docs/worldbuilding-system/05_creation_protocol.md:L8-L9`; `docs/worldbuilding-system/checklists/frontloaded_seed_audit.md:L0-L1`). That mismatch is not a package defect; it is a downstream app design that must either be implemented as specified or later deliberately amended. | Code/conformance work under current docs. No package change. No auto-assignment. |
| **F-03 — decomposition 400 has no visible inline recovery** | Genuine doc gap | W-8 requires app-owned blockers and substance validations at point of use, and browser acceptance asks for blocker evidence (`docs/principles/guided-workflow-usability.md:L3-L6`, `docs/principles/guided-workflow-usability.md:L14-L16`; `docs/specs/browser-visible-guidance-acceptance.md:L1-L3`). But neither `creation-flow.md` nor `guided-flow-spec-template.md` clearly says a server-returned action failure must render inline, preserve input, and name the recovery path (`docs/specs/guided-flow-spec-template.md:L2-L5`). | Doc change in `creation-flow.md`, `guided-flow-spec-template.md`, and `browser-visible-guidance-acceptance.md`. |
| **P-03 — seed decomposition prompt-out remains kernel-bound** | Spec-divergence / app conformance | `creation-flow.md` already says Seed decomposition proposal/pressure modes use `decomposition_pressure`, and `prompt-out-context-assembly.md` says missing/incomplete decomposition material is a blocker, not a reason to generate a kernel-only prompt (`docs/specs/creation-flow.md:L13-L16`; `docs/specs/prompt-out-context-assembly.md:L25-L30`). | Code/conformance work. No separate doc change. The P-01/R-02 selected-section gap is distinct and narrower. |

No M-class finding was logged, and this review did not discover one.

---

## 3. Recommended doc changes

These recommendations specify **substance and home**, not final ratified wording. They deliberately avoid new principle IDs, ADR numbers, or glossary terms.

### 3.1 `docs/methodology-coverage.md` — coverage-ledger honesty correction

**Home:** Guidance Maturity Snapshot row for Creation (`05`); Package Chapter Matrix row for `05_creation_protocol.md`; Guidance Maturity definitions or local ledger note.  
**Operation:** correct the current maturity claim; add field-build regression discipline.  
**Evidence anchor:** Field Build 01 blocked at first seed-decomposition attempt (`reports/field-build-01-brindlemark.md:L24-L26`); current ledger says Creation is `walkthrough-passed` and describes seed-decomposition blockers, prompt-context completeness, and kernel prompt evidence (`docs/methodology-coverage.md:L7-L10`, `docs/methodology-coverage.md:L24-L28`).  
**Label:** direct evidence.

**Substance to own:**

- Record Field Build 01 as a stricter app-use result against Creation's current maturity: setup/open and World-premise pressure worked, but the kernel-to-decomposition handoff blocked before any seed could be parked.
- Stop presenting Creation as unqualified `walkthrough-passed` for phases 1-2. Either split the row into sub-surfaces or mark the whole Creation row as `walkthrough-passed` with a visible field-blocked caveat for the kernel-to-decomposition handoff.
- Add a ledger discipline: a real app-use field build that blocks on a path supersedes earlier representative PRD/walkthrough evidence for that affected path until a follow-up walkthrough or field build verifies the corrected path. This does not demote unrelated surfaces that the field build validated.
- Keep the package/app distinction explicit: this is an app coverage and guidance-maturity correction, not an amendment to `05_creation_protocol.md`.

**Downstream app/code implication:** any PRD derived from this correction should prove the new handoff by walking from completed kernel through first seed parking, not by unit-level control evidence alone.

---

### 3.2 `docs/specs/creation-flow.md` — selected-section kernel guidance and decomposition recovery

#### Selected kernel section prompt beside the authoring field

**Home:** `Decision-Point UI Contract` → `Kernel authoring`; optionally `Deferred Decisions` → `Kernel section headings` if the current heading seed rule is expanded.  
**Operation:** add a section-local guidance requirement.  
**Evidence anchor:** R-02; `05` maps Phase 1 to the template section-by-section; `templates/world_kernel.md` carries the section prompts the app failed to show (`reports/field-build-01-brindlemark.md:L7-L8`; `docs/worldbuilding-system/05_creation_protocol.md:L3-L5`; `docs/worldbuilding-system/templates/world_kernel.md:L0-L7`).  
**Label:** direct evidence.

**Substance to own:**

- Kernel authoring must not show only the section heading and required/allowed-empty status. When a kernel section is selected, the surface must show the selected section's app-owned template prompt or obligation beside the textarea.
- The selected-section guidance must distinguish required sections from allowed-empty sections and state what the section must contribute to the kernel, in app wording, with package/template path only as provenance.
- The World premise keeps its essence proposal exception, but it is still a decision point with local guidance; the exception only governs proposal mode, not whether the prompt/instruction is visible.

#### Selected kernel section is prompt-out grain

**Home:** `Step Map` → `Kernel authoring`; `Decision-Point UI Contract` → `Prompt-out in context`; `Flow Behavior` prompt-out bullet.  
**Operation:** add section-level binding for Creation kernel prompt-out.  
**Evidence anchor:** P-01; existing spec binds Prompt-out to current flow, step, and material but not the selected kernel section (`reports/field-build-01-brindlemark.md:L8-L10`; `docs/specs/creation-flow.md:L13-L19`).  
**Label:** direct evidence.

**Substance to own:**

- Treat kernel authoring as a composite decision point. The active local unit is the selected kernel section, not just the whole kernel record.
- The prompt preview for kernel proposal/pressure must identify the selected heading, selected section prompt/obligation, current section prose or empty state, required/allowed-empty state, and the local task. Surrounding kernel material may appear as bearing context, but it must not replace the selected-section task.
- Full-kernel pressure can still exist after sufficient steward material exists, but the spec should distinguish a full-kernel pressure beat from section-local proposal/pressure. A generic `kernel_pressure` packet while a section is selected is insufficient unless the UI explicitly says the prompt is a full-kernel pass and why that is the current decision.

#### Seed decomposition readiness and inline recovery

**Home:** `Decision-Point UI Contract` → `Seed decomposition`; `Flow Behavior`; `Testing Seams` / `Browser seam`.  
**Operation:** add recovery contract; clarify readiness preflight for existing required controls/facets.  
**Evidence anchor:** F-03 directly; F-01/F-02 as examples of the missing controls whose blockers were not recoverable in-browser (`reports/field-build-01-brindlemark.md:L13-L17`).  
**Label:** direct evidence for inline recovery; inference for pre-submit readiness copy.

**Substance to own:**

- The seed-decomposition surface must render server-returned blockers and validation failures inline at or near the action that failed, preserve the steward's entered material, and name the exact remediation path in app wording.
- Before submit, the surface should expose readiness for the required existing contract values: explicit `consequence_mode` facet, title/body/truth-layer/granularity controls under the current app spec, consumed source material, and write preview. This does not create a new consequence-mode or truth-layer rule; it makes the existing rule recoverable without network tools.
- Consequence-mode and truth-layer values remain steward-selected. The app may show the missing requirement and route the steward to the control, but it must not infer the value from prose or default it.
- The spec should preserve the package-order note: Creation parks proposed seeds; Admission owns first canon standing, frontloaded seed audit, severity, gate results, and canon-status changes (`docs/specs/creation-flow.md:L20-L23`). If a future steward wants truth-layer assignment to move wholly into Admission/audit instead of Creation parking, that is a separate deliberate downstream spec revision, not a package amendment implied by this report.

External support: accessible/error-recovery guidance agrees with this direction. W3C's WCAG understanding document says unsuccessful form submission must identify the error in text, and WCAG error-suggestion guidance says users should receive correction suggestions when possible; GOV.UK's validation guidance says errors should explain what went wrong and how to fix it.[^ext-w3c-error-id][^ext-w3c-error-suggestion][^ext-govuk-validation]

---

### 3.3 `docs/specs/prompt-out-context-assembly.md` — selected-section context assembly

**Home:** `Inclusion Rules` → Creation Prompt-out; optionally `Common Prompt Packet` examples for composite decision points.  
**Operation:** add selected-kernel-section packet requirements.  
**Evidence anchor:** P-01/R-02; current Inclusion Rules mention `templates/world_kernel.md` where kernel authoring is in scope but do not require selected heading, selected prompt, required/optional state, or correct local packet identity (`reports/field-build-01-brindlemark.md:L8-L10`; `docs/specs/prompt-out-context-assembly.md:L15-L18`).  
**Label:** direct evidence.

**Substance to own:**

- For Creation kernel authoring, the packet's “current decision” must identify the selected kernel section when one is selected.
- The “decision material” and “package doctrine” blocks must include the selected section's current prose or empty state and the selected section's template prompt/obligation, not only a whole-kernel summary.
- The packet's mode request must match the selected local decision. Proposal mode should ask for candidates for that section; pressure mode should challenge the steward-authored section or full kernel only when the UI has made that pressure grain explicit.
- Omission reasons must name omitted section context when a packet cannot carry it. Silent fallback to generic kernel help is not acceptable for a section-local prompt.
- Keep existing forbidden moves intact: the packet may recommend; it may not assign canon standing, truth layer, status, or other separated labels (`docs/specs/prompt-out-context-assembly.md:L4-L6`, `docs/specs/prompt-out-context-assembly.md:L22-L24`).

External support: Nielsen Norman Group's “recognition rather than recall” heuristic argues that information required to use a design should be visible or easily retrievable when needed; for this app, the selected template prompt is exactly the instruction the steward otherwise had to remember from docs.[^ext-nng-heuristics]

---

### 3.4 `docs/specs/guided-flow-spec-template.md` — reusable composite-decision and recovery slots

#### Composite decision point / selected local unit

**Home:** `Decision-Point Contract`; `Prompt-Out Requirements`; `Browser Acceptance Scenarios`.  
**Operation:** add a reusable slot for composite steps.  
**Evidence anchor:** R-02/P-01, generalized beyond Creation. The current template requires local decision, doctrine excerpts, prompt preview, context sources, blockers, and browser scenarios, but it does not ask a spec to declare what happens when one browser step contains selectable sections, lenses, checklist rows, score rows, or other sub-decisions (`docs/specs/guided-flow-spec-template.md:L2-L5`).  
**Label:** inference from direct field evidence.

**Substance to own:**

- When a guided-flow step contains multiple selectable local units, the spec must declare the active local unit and what content, doctrine/template excerpt, prompt packet grain, blocker state, write preview, and read trail follow that selection.
- The screen context and prompt packet must track the same active local unit. If they intentionally differ, the spec must say why and how the steward can see the distinction.
- This should not invent a new workflow concept. It is a spec-template slot under the already-ratified W-8 Decision-Point Contract.

External support: wizard-style processes are step-by-step flows in which later steps may depend on earlier input; a selectable section inside a larger step is a local version of the same dependency problem and should keep the user oriented to the current step and input.[^ext-nng-wizards]

#### Inline recovery for server-returned blockers/action failures

**Home:** `Decision-Point Contract` blockers/substance validations; `Browser Acceptance Scenarios`; `Naive-Steward Cognitive Walkthrough`.  
**Operation:** add a reusable inline-recovery requirement.  
**Evidence anchor:** F-03; current template asks for blockers but not for post-submit error placement, preservation, or recovery (`reports/field-build-01-brindlemark.md:L16-L17`; `docs/specs/guided-flow-spec-template.md:L2-L5`).  
**Label:** direct evidence.

**Substance to own:**

- Specs using the template must state how a server-returned blocker or action failure appears in the browser, how input is preserved, and what remediation text or route is visible.
- The cognitive walkthrough should include “can the steward recover after a failed action?” not only “can the steward recover after exit/resume?” when the slice includes a write/action.
- API/store tests are still necessary, but a hidden console/network failure cannot satisfy browser-visible guidance.

---

### 3.5 `docs/specs/browser-visible-guidance-acceptance.md` — add generic action-error evidence

**Home:** `Required Evidence Patterns`; optional `Cognitive Walkthrough Checklist`.  
**Operation:** add a reusable evidence pattern for guided-flow action errors.  
**Evidence anchor:** F-03; current acceptance evidence asks for blocker examples and setup/open failure recovery, but does not generalize inline recovery to guided-flow write actions (`docs/specs/browser-visible-guidance-acceptance.md:L1-L6`).  
**Label:** direct evidence.

**Substance to own:**

- For any browser slice that can submit a guided-flow action, acceptance evidence should include at least one action-failure or server-blocker case when the slice introduces or changes such behavior.
- The evidence should show the error near the blocked action or field, the steward's input preserved, the remediation path visible, and no reliance on console/network tooling.
- This is not a test-framework requirement; it is reviewer guidance for deciding whether a guided-flow issue actually satisfied W-8 in the browser.

---

### 3.6 `docs/principles/guided-workflow-usability.md` — optional W-8 hardening

**Home:** W-8 / Decision-Point Contract.  
**Operation:** add a clarification; no new identifier.  
**Evidence anchor:** R-02/P-01 show that “current decision point” was interpreted at flow/step grain while the steward was actually working a selected kernel section (`reports/field-build-01-brindlemark.md:L7-L10`).  
**Label:** inference from direct field evidence.

**Substance to own:**

- Clarify that a decision point may be nested or composite: if a browser step contains selectable sections, rows, lenses, or local units, the selected local unit is part of “the current decision.”
- The local doctrine/template excerpt, prompt preview, blocker state, and write preview should follow that selected local unit unless the surface explicitly marks a broader whole-step pass.
- Keep this as architectural guidance, not layout prescription. W-8 already says a decision point has local purpose, package authority, state, context, obligations, and consequences; the field build only shows that “local” needs to be explicit for composite steps (`docs/principles/guided-workflow-usability.md:L1-L6`).

No change is recommended to `workflow-principles.md` W-1/W-7: W-1 already requires prompt-out at every decision point in both modes and says prompts derive from the decision point rather than a detached panel; W-7 already says gates demand content, not clicks (`docs/principles/workflow-principles.md:L10-L14`).

---

## 4. Out of scope / for the app

These findings should be routed to the field-build report and the repo's implementation/PRD process, not treated as doc-change requests:

- **R-01:** render workflow-map destinations according to the existing active/owed/blocked/not-yet-earned grammar.
- **R-03 / F-01:** expose and persist the explicit `consequence_mode` facet from steward choice; do not infer it from prose or default it.
- **P-02:** expose proposal/pressure mode controls and loaded-mode confirmation wherever the current decision and authored material make both modes available.
- **F-02:** under current `creation-flow.md`, expose a truth-layer control or pre-submit blocker for seed parking; do not infer truth layer. A future decision to defer truth-layer assignment entirely to Admission/audit would be a separate downstream spec revision.
- **P-03:** bind seed-decomposition prompt-out to the active decomposition decision or show the existing decomposition-specific blocker; do not fall back to kernel prompts.
- **V-01 / V-02 / V-03:** preserve validated setup/open, essence refusal, and World-premise pressure behavior.

This document deliberately does not author PRD scopes, endpoint/component fixes, or implementation plans.

---

## 5. Package-by-exception determination

**No package amendment is recommended.**

The package clears the evidence bar for the seams Field Build 01 exercised:

- Kernel construction, consequence-mode commitment, and section-by-section template mapping are explicit in `05_creation_protocol.md` and `templates/world_kernel.md` (`docs/worldbuilding-system/05_creation_protocol.md:L1-L8`; `docs/worldbuilding-system/templates/world_kernel.md:L0-L7`).
- Truth layer and status assignment are explicitly part of Phase 3 / admission-side work after seed decomposition and before any seed is treated as accepted (`docs/worldbuilding-system/05_creation_protocol.md:L8-L9`; `docs/worldbuilding-system/checklists/frontloaded_seed_audit.md:L0-L1`; `docs/worldbuilding-system/06_canon_fact_admission_protocol.md:L6-L10`).
- Proposal/pressure mode, essence exception, steward authorship, and forbidden label assignment are covered by `20_ai_assisted_workflow.md` (`docs/worldbuilding-system/20_ai_assisted_workflow.md:L0-L3`, `docs/worldbuilding-system/20_ai_assisted_workflow.md:L20-L21`).
- The package's own release discipline is deliberately conservative: version 1.0/1.1 edits were evidence-bounded and sentence-scale, with no structural package change unless a field log demands it (`docs/worldbuilding-system/00_overhaul_notes.md:L4-L6`; `reports/tenth-iteration-outlook.md:L28-L34`).

Field Build 01 demanded app-encoding and downstream-spec hardening. It did not demand an upstream methodology rewrite, a new package term, or a package correction.

---

## 6. Completeness / self-check

- Evidence file read first: `reports/field-build-01-brindlemark.md`.
- Field-build method read: `.claude/skills/field-build/SKILL.md`.
- Authority anchor read: `docs/principles/README.md`.
- Upstream methodology package read: 58 files under `docs/worldbuilding-system/`.
- Principle tier read: 7 files under `docs/principles/`.
- Coverage ledger read: `docs/methodology-coverage.md`.
- ADR tier read: 9 files under `docs/adr/`.
- App-facing specs read: 16 files under `docs/specs/`.
- Governance/lineage read: `reports/tenth-iteration-outlook.md`.
- Additional placement context read: `docs/agents/domain.md`.
- Every field-build finding was triaged in §2.
- No recommendation targets an unreached downstream-flow spec, a constitution-tier principle, or the upstream package.
- No final paste-ready wording, principle ID, ADR number, or glossary term is invented here.

---

## 7. External research lane

External sources shaped only the recovery/guidance hardening recommendations. They are not repository evidence.

[^ext-nng-heuristics]: Nielsen Norman Group, “10 Usability Heuristics for User Interface Design,” especially recognition rather than recall and error recovery. Accessed 2026-07-06. <https://www.nngroup.com/articles/ten-usability-heuristics/>
[^ext-w3c-error-id]: W3C Web Accessibility Initiative, “Understanding Success Criterion 3.3.1: Error Identification.” Accessed 2026-07-06. <https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html>
[^ext-w3c-error-suggestion]: W3C Web Accessibility Initiative, “Understanding Success Criterion 3.3.3: Error Suggestion.” Accessed 2026-07-06. <https://www.w3.org/WAI/WCAG21/Understanding/error-suggestion.html>
[^ext-govuk-validation]: GOV.UK Design System, “Help users to recover from validation errors” and “Error message.” Accessed 2026-07-06. <https://design-system.service.gov.uk/patterns/validation/> and <https://design-system.service.gov.uk/components/error-message/>
[^ext-nng-wizards]: Nielsen Norman Group, “Wizards: Definition and Design Recommendations.” Accessed 2026-07-06. <https://www.nngroup.com/articles/wizards/>

---

## Appendix A — Exact-commit acquisition ledger

```text
Requested repository: joeloverbeck/worldloom-studio
Target commit: 862ffa07bf3062655af5ac6841ed7ca6abdac760
Freshness claim: user-supplied target commit only; not independently verified as latest main
Manifest role: path inventory only
Repository metadata used: no
Default-branch lookup used: no
Branch-name file fetch used: no
Target-repository code search used: no
Clone used: no
URL fetch method: web.run open() with full raw.githubusercontent.com exact-commit URLs
Requested file count: 95
Successfully verified file count: 95
Fetched repository files:
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/reports/field-build-01-brindlemark.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/.claude/skills/field-build/SKILL.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/principles/README.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/00_overhaul_notes.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/01_core_theory.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/02_world_model.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/03_truth_layers_and_canon_governance.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/04_domain_atlas.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/05_creation_protocol.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/06_canon_fact_admission_protocol.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/07_propagation_engine.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/08_constraint_composition.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/09_temporal_and_timeline_protocol.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/10_spatial_and_geographic_propagation.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/11_agent_character_psychology.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/12_institutional_economic_and_suppression_protocol.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/14_uncertainty_belief_and_evidence.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/15_branching_versioning_and_collaboration.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/16_narrative_game_and_transmedia_extraction.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/17_aesthetic_coherence_and_semiosis.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/18_quality_assurance_tests.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/19_worked_examples.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/20_ai_assisted_workflow.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/21_templates_index.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/22_glossary.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/23_research_notes_and_bibliography.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/README.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/checklists/aesthetic_coherence_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/checklists/agent_character_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/checklists/branching_collaboration_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/checklists/canon_fact_gate.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/checklists/constraint_composition_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/checklists/frontloaded_seed_audit.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/checklists/institutional_economic_suppression_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/checklists/mystery_preservation.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/checklists/propagation_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/checklists/spatial_geographic_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/checklists/temporal_timeline_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/checklists/uncertainty_evidence_sweep.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/manifest.json
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/operating_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/templates/action_arena_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/templates/admission_ledger.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/templates/aesthetic_coherence_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/templates/agent_character_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/templates/canon_branch_diff.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/templates/canon_change_proposal.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/templates/canon_fact_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/templates/capability_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/templates/collaboration_decision_record.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/templates/constraint_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/templates/contradiction_report.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/templates/counter_institution_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/templates/institution_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/templates/mystery_ledger_entry.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/templates/propagation_report.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/templates/spatial_region_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/templates/temporal_timeline_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/templates/uncertainty_evidence_card.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/worldbuilding-system/templates/world_kernel.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/principles/canon-sovereignty.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/principles/charter.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/principles/data-principles.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/principles/domain-fidelity.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/principles/guided-workflow-usability.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/principles/workflow-principles.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/methodology-coverage.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/adr/0001-sqlite-file-per-world.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/adr/0002-localhost-native-process.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/adr/0003-branch-and-collaboration-schema-door.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/adr/0004-typescript-hono-react-better-sqlite.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/adr/0005-github-automation-baseline.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/adr/0006-admission-flow-module-boundary.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/adr/0007-prompt-out-step-module-seam.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/adr/0008-flow-owned-persistence-stores.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/adr/0009-browser-guided-flow-boundary.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/specs/admission-flow.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/specs/browser-visible-guidance-acceptance.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/specs/canon-workbench.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/specs/constraint-composition-flow.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/specs/contradiction-retcon-mystery-flow.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/specs/creation-flow.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/specs/guided-flow-spec-template.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/specs/institutional-economic-suppression-flow.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/specs/markdown-export.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/specs/method-cards.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/specs/prompt-out-context-assembly.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/specs/propagation-flow.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/specs/qa-flow.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/specs/schema-v1.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/specs/temporal-timeline-flow.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/specs/workflow-map-and-navigation.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/reports/tenth-iteration-outlook.md
- https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/862ffa07bf3062655af5ac6841ed7ca6abdac760/docs/agents/domain.md

Fetch-provenance contamination observed: no
Foreign-repository references inside fetched file contents: permitted; not a provenance check
Connector/tool namespace trusted as evidence: no
External research lane: separate from repository evidence

```
