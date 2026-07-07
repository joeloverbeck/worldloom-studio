# Field Build 02 Change Plan

**Target repository:** `joeloverbeck/worldloom-studio`  
**Target commit analyzed:** `dd04bbd1447f98817b9545651e4043dc326a72de`  
**Report status:** recommendation/change-plan report; not ratified repository text; not direct code.  
**Freshness claim:** this analyzes the user-supplied target commit only. It does **not** independently verify that the commit is the current `main`.

## Provenance and evidence lanes

Repository evidence for this report comes only from files whose paths appear in `reports/manifest_2026-07-07_dd04bbd.txt` and that were fetched from exact commit URLs under:

```text
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/dd04bbd1447f98817b9545651e4043dc326a72de/<path>
```

or, for line-window inspection of the same manifest paths, the exact-commit GitHub blob URL form.

The uploaded manifest is treated as path inventory only. It is not treated as file content authority. The report brief defines the task and authority constraints. External sources are cited separately and are used only for design prior art, never for target-repository state.

**Acquisition ledger:** `field-build-02-acquisition-ledger.txt` contains the full exact-commit URL list. Summary:

```text
Requested repository: joeloverbeck/worldloom-studio
Target commit: dd04bbd1447f98817b9545651e4043dc326a72de
Freshness claim: user-supplied target commit only; not independently verified as latest main
Manifest role: path inventory only
Repository metadata used: no
Default-branch lookup used: no
Branch-name file fetch used: no
Target-repository code search used: no
Clone used: no
URL fetch method: web.run.open exact raw/blob URLs; container.download saved plain-text/Markdown where allowed
Requested file count: 148
Successfully verified file count: 148
Fetch-provenance contamination observed: no
Foreign-repository references inside fetched file contents: permitted; not a provenance check
Connector/tool namespace trusted as evidence: no
External research lane: separate from repository evidence
```

The required authority read was completed across the 90 requested authority files: all 58 files under `docs/worldbuilding-system/`, all 7 files under `docs/principles/`, all 9 ADRs, and all 16 specs. The primary report, prior field reports, PRD walkthrough reports, required code seams, required tests, and nearby seams named in the brief were also read.

---

## 1. Executive verdict

Field Build 02 does **not** justify a methodology-package amendment. The upstream worldbuilding package already gives usable doctrine for Creation, Admission, Prompt-out, and AI-assisted stewardship. The field report itself records “No methodology-source finding,” and the full authority read did not reveal a package conflict that downstream docs should patch around.

The real verdict is sharper: **the app has reached Creation-to-Admission, but Admission is not yet a browser-performable guided decision.** The workflow map successfully routes to Admission after Creation parks a proposed seed, and the server can produce a rich Admission decision-point payload. The routed browser surface, however, exposes only the queue shell and not the active Admission decision: no severity declaration, work-scale declaration, seed-audit controls, prompt-out controls, admission actions, read-side trail, or start/resume path. That is an app conformance failure against existing specs and ADRs, not a missing doctrine problem.

The second blocker is state trust. Same-session world switching can pair the visible new world path with stale Creation records, seed records, and loaded prompt state from the previous world. In a local-first app whose one SQLite file is the canonical world, this is a credibility break. The browser must never render old flow material under a new active world identity.

The third cluster is local Creation hardening. The Creation kernel now works on the happy path, but section switching and draft/saved consequence-mode state can mislead a steward into thinking a decision is saved or into saving one section’s text under another heading. These are not methodology defects. They are UI state and browser-evidence defects against a spec that already says the selected section is the local kernel decision grain and the consequence-mode facet is written only from explicit steward choice.

The fourth cluster is Prompt-out binding. Admission’s server decision correctly selects `admission.queue-severity` before severity is declared, but the prompt preview falls through to the minor-ledger template because the prompt assembly treats `gate === null` as “not full gate.” This is a concrete server conformance bug. The fix is not to teach the method that minor ledger comes first; the fix is to add and bind an Admission queue/severity prompt path before the gate path exists.

Recommended order:

1. **Blocker PRD A:** Admission queue selection, active decision projection, and pre-severity prompt binding.
2. **Blocker PRD B:** world-scoped state reset and loaded prompt identity/staleness binding.
3. **Friction PRD C:** Creation section hydration, dirty switching guard, unsaved consequence-mode readiness, and clean-start authoring guard.
4. **Evidence PRD D:** browser walkthroughs, tests, and coverage-ledger honesty updates after the fixes.

Big change is warranted in the Admission browser surface. A generic queue list is not a guided-flow interior. ADR 0009 explicitly rejects generic record forms as a substitute for field-tested guided protocols; `docs/specs/admission-flow.md` already says queue selection is a decision point and severity declaration must be visible, explicit, and server-governed.

---

## 2. Evidence classification table

| Finding | Field Build 02 evidence anchor | Classification | Target home | Intended change | Why this altitude | Acceptance/proof before close |
|---|---|---|---|---|---|---|
| **V-REG-01** Brindlemark Creation blockers fixed on happy path | Regression replay: Creation exposes consequence mode, seed truth layer, granularity controls, inline recovery, and handoff; `POST /api/flows/creation/decompose` returned 201 and created `SEE-1` plus `FAC-1`. Evidence labels: `field-build-02-05`, `-07`, `-08`. | No-action validation plus evidence/coverage update | `docs/methodology-coverage.md`; browser evidence archive | Preserve the validation. Do not reopen Field Build 01 Creation blockers. Update coverage wording to say the kernel-to-first-seed happy path is field-validated with residual state/framing caveats. | The app behavior now matches the existing Creation spec on the main path. This is evidence maturity, not new doctrine. | Coverage ledger names Field Build 02 as validation and distinguishes happy-path Creation from residual R-REG-01/R-REG-02/F-01 caveats. |
| **R-REG-01** consequence-mode selection looks applied before save | Selecting `mixed` left decomposition blocked until `Save kernel step`; readiness still told the steward to select consequence mode rather than save/apply it. | App conformance/code fix; test/evidence change; optional acceptance wording refinement | `packages/web/src/main.tsx`; `packages/server/src/creation-flow.ts` only if server payload needs a draft/saved distinction; `packages/web/src/creation-decision-surface.test.tsx`; `docs/specs/browser-visible-guidance-acceptance.md` if codifying visible draft/saved state | Represent consequence mode as either saved immediately on selection or visibly as an unsaved draft. Preferred first implementation: keep server canon as saved facet only, show “Draft consequence mode: mixed — save kernel step to apply,” and disable decomposition with that exact blocker until saved. | The method and spec already require explicit consequence-mode selection and facet persistence from steward choice. The gap is the UI implying an unsaved control value is applied server state. | Browser test selects mode but does not save, sees draft/saved distinction, decomposition remains disabled with save-specific copy, then save enables decomposition. |
| **R-REG-02** kernel sections do not reliably hydrate | Existing Brindlemark section showed blank textarea despite saved section in prompt context; Dead Air switch from saved World premise to empty Core promise retained old text while placeholder changed. | App conformance/code fix; test/evidence change | `packages/web/src/main.tsx`; `packages/web/src/creation-decision-surface.test.tsx`; maybe a small helper for section draft state keyed by `kernelRecordId + heading` | Section selection must deterministically hydrate the saved body for that heading or an explicit empty state. Dirty unsaved text must be guarded before switching or stored as a section-keyed draft that cannot be saved under another heading. | `docs/specs/creation-flow.md` and `docs/specs/prompt-out-context-assembly.md` already define the selected kernel section as the local decision grain. This is a browser state projection defect. | Browser test starts with two sections, switches among saved/empty headings, verifies textarea content and prompt preview follow the selected heading, and verifies dirty text cannot be silently transferred. |
| **V-01** setup, workflow map, Creation-first route app-carried | Fresh `/tmp/worldloom-field-build/dead-air-earth.worldloom.sqlite` created through setup UI; workflow map marked Creation active and later flows locked with reasons. Evidence: `field-build-02-09`. | No-action validation plus coverage evidence | `docs/methodology-coverage.md`; setup/workflow browser evidence | Preserve setup/open and Creation-first routing as validated. Do not re-specify this unless world-switch reset touches setup/open. | Existing workflow map and setup specs cover the behavior. Field evidence confirms it for a fresh start. | Existing setup/open tests remain green; a new world-switch regression test covers the edge not covered by V-01. |
| **F-01** same-session world switch shows stale Creation state | Header/API pointed to Dead Air world, but visible Creation still showed Brindlemark flow, `SEE-1`, `FAC-1`, and prompt packet. API truth for Dead Air was empty. Evidence: `field-build-02-10`. | App conformance/code fix; blocker; test/evidence change; narrow spec acceptance amendment | `packages/web/src/main.tsx`; possible `active-world-session`/setup route loading boundary review; `packages/web/src/setup-open-world.test.tsx`; `docs/specs/workflow-map-and-navigation.md`; `docs/methodology-coverage.md` | Add a world-scoped reset boundary. On successful create/open of a different world, clear flow IDs, selected records, Admission/Creation decision payloads, queue selections, kernel draft buffers, prompt step/status, advisory loaded status, decomposition state, errors, and destination-local caches before rendering the new world. A page reload is acceptable only as a deliberately chosen safe boundary. | T-1/T-7 and ADR 0001/0002 make one local SQLite file canonical; ADR 0009 makes browser workflow state a decision surface. Rendering old decision material under a new world identity is a state-invariant failure, not a docs problem. | Regression test opens world A with Creation state, switches to world B in same session, and asserts no old world IDs/titles/prompts appear before or after the new world map/destination renders. Playwright evidence must show the same. |
| **R-01** clean Creation required second Start/Resume before saving premise | Steward could type premise, but `Save kernel step` stayed disabled until clicking `Start or Resume Creation`; text survived and then saved. Evidence: `field-build-02-12`, `-13`. | App conformance/code fix; friction | `packages/web/src/main.tsx`; `packages/web/src/creation-decision-surface.test.tsx`; possibly `workflow-shell.tsx` if destination entry should auto-resume | Either auto start/resume when entering Creation for a new world, or keep authoring fields disabled until a flow/kernel record exists with copy explaining the required start/resume. Do not allow a write-capable-looking textarea with no save path. | Creation spec says starting the flow creates/resumes the in-progress flow instance; guided usability requires visible current decision and blockers. The problem is affordance sequencing. | Browser test enters new-world Creation and verifies either auto-started save-enabled authoring or disabled fields with a start/resume blocker until flow exists. |
| **V-02** world-premise prompt-out pressure works cold | Proposal refused for premise as expected; pressure prompt carried selected section material, `KER-1`, source manifest, omissions, advisory warning, forbidden moves; cold LLM stayed in bounds. Evidence: `field-build-02-13`. | No-action validation; evidence update | `docs/methodology-coverage.md`; prompt-out walkthrough evidence | Preserve as validation for Creation selected-section pressure prompt. Do not reopen API integration or automatic generation. | Existing Prompt-out spec and canon-sovereignty principle already define advisory clipboard-mediated prompt-out. The field evidence supports the current path. | Coverage ledger records Creation world-premise pressure as field-use evidence, while still noting proposal/paste-in breadth remains honestly limited. |
| **V-03** Creation carries full kernel and first seed parking | All nine kernel sections saved; consequence mode stored as `mixed`; `FAC-1 Broadcast ratings allocate survival support` parked as `Objective canon`/`proposed`; Creation handoff displayed. Evidence: `field-build-02-14`, `-15`. | No-action validation plus evidence update | `docs/methodology-coverage.md`; Creation handoff evidence | Preserve the Creation-to-proposed-seed path as app-carried, subject to state hardening. | Existing Creation/admission boundary is correct: Creation parks proposed material; Admission owns first canon standing. | Browser evidence shows all nine sections persisted, seed parked, and Admission handoff with read-side trail. |
| **F-02** Admission UI exposes queue but not Admission decision | UI showed only Admission flow shell and `FAC-1` queue row; missing severity/work-scale, seed audit, prompt controls, accept/reject/defer, method card, read trail, and start/resume. API decision endpoint had full contract. Evidence: `field-build-02-16`. | App conformance/code fix; primary blocker; test/evidence change | `packages/web/src/main.tsx`; `packages/web/src/workflow-shell.tsx` if shell support needed; `packages/web/src/admission-decision-surface.test.tsx`; `packages/web/src/workflow-shell.test.tsx`; `packages/server/test/app.test.ts` as contract guard | Render the selected queued record’s server-owned Admission decision point in the routed Admission destination. Queue selection must call/use `decisionPointHref`, set active decision, and render obligations, blockers, severity vocabulary, seed audit, prompt-out preview/actions, write intent, close preview, and read-side trail. | `docs/specs/admission-flow.md`, ADR 0006, and ADR 0009 already require this. The browser is failing to project an existing server-owned contract. | Browser test starts from workflow map/Admission destination with one queue row, selects it, and sees active decision controls without relying on `initialAdmissionDecision` props. Playwright evidence proves a docs-closed steward can perform the first Admission decision. |
| **P-01** Admission prompt preview assumes minor ledger before severity | Decision payload had `admissionLevel: null`, `workScale: null`, and unavailable gate depth, but prompt preview used `Method card: admission.minor-ledger` and minor-ledger doctrine. | App conformance/code fix; blocker; server test; narrow downstream spec precision | `packages/server/src/admission-flow.ts`; `packages/server/src/prompt-out.ts`; `packages/server/src/prompt-out-defaults.ts`; `packages/server/test/app.test.ts`; `packages/server/test/prompt-out.test.ts`; `docs/specs/admission-flow.md` for explicit queue/severity prompt-template naming | Add a pre-severity Admission prompt path. When severity is undeclared, `promptOutFor` must select a queue/severity template/step such as `admission_queue_severity` / `admission:queue-severity`, map it to method card `admission.queue-severity`, and frame proposal/pressure around severity prerequisites, uncertainty, dependencies, and information needed to choose `admission_level` and `work_scale`. It must not mention minor ledger or full gate as the current method card until severity is saved. Add a small spec precision amendment because `admission-flow.md` names queue/severity as a decision and `method-cards.md` owes a queue/severity card, while its fixed prompt-template list currently names only prerequisite-audit and constraint-challenge defaults. | Server code already chooses method card `admission.queue-severity` for the decision, but prompt assembly treats `gate === null` as minor. The core failure is implementation binding; the spec amendment just removes ambiguity in default prompt-template coverage. | Server tests assert undeclared severity decision returns queue-severity method card, queue-severity prompt template, no minor-ledger method card, and no premature minor-ledger completion instruction. Browser test verifies the preview shown in UI matches. |
| **P-02** loaded prompt-out status outlives active decision | After loading Ordinary-life proposal prompt-out, then parking a seed, active preview moved to seed decomposition but footer still reported prior loaded Creation Prompt-out step. | App conformance/code fix; test/evidence change; narrow prompt-status acceptance refinement | `packages/web/src/main.tsx`; `packages/web/src/prompt-out-lifecycle.test.tsx`; `packages/web/src/creation-decision-surface.test.tsx`; optionally `docs/specs/prompt-out-context-assembly.md` or `browser-visible-guidance-acceptance.md` | Bind loaded prompt status to exact `worldPath`, `flowKey`, `flowId`, `recordId`, `stepKey`, `mode`, and decision identity/version. Clear it when active decision changes, or render it as stale with origin labels and no implication that it matches current copy-out material. | Prompt-out spec already requires screen context and prompt packet context to be the same assembly. A stale loaded-status label breaks that equivalence at the browser status layer. | Test loads one prompt, transitions decision, verifies status clears or shows exact stale origin. Accessibility/status text should include enough context for screen readers and visual users. |

---

## 3. Primary change package: Admission queue-selection and decision-point projection

### Problem statement

Field Build 02 reached the first proposed fact in Admission. The map and queue did their job: `FAC-1 Broadcast ratings allocate survival support` appeared in Admission after Creation parked it as `proposed`. The failure is that the routed Admission destination did not let a docs-closed steward perform the Admission decision. The server already has most of the missing material in `/api/admission/records/:id/decision-point`; the browser did not render it as the active guided surface.

This violates the existing authority stack:

- `docs/worldbuilding-system/06_canon_fact_admission_protocol.md` and `checklists/canon_fact_gate.md` define governed admission and severity-scaled evidence.
- `docs/specs/admission-flow.md` already requires queue selection, explicit `admission_level` and `work_scale`, frontloaded seed audit, skip records, prompt-out, close preview, read-side trail, and doctrine at point of use.
- ADR 0006 makes Admission a server-side module boundary. Browser code consumes server-owned Admission policy; it does not invent local policy.
- ADR 0009 says the browser workflow layer must expose the method’s decision sequence. Generic record forms and thin queue shells are substrate, not guided-flow conformance.
- `docs/specs/workflow-map-and-navigation.md` says guided-flow destinations keep their decision-point interiors, blockers, prompt-out affordances, write previews, and read-side trails.

### Repository evidence

The target-commit server seam confirms the right shape exists but is not fully projected:

- `packages/server/src/admission-flow.ts` builds an `admissionDecisionPoint` with selected record context, severity declarations, blockers, method card, seed audit, prompt-out, write intent, close preview, and read-side trail.
- `packages/server/src/http/admission-routes.ts` exposes queue and decision-point routes.
- `packages/web/src/main.tsx` contains an `AdmissionDecisionPoint` type rich enough to carry the server contract and generic `DecisionContractPanel` rendering machinery, but Field Build 02 shows the routed Admission destination did not load/render the active payload after queue selection.
- `packages/web/src/admission-decision-surface.test.tsx` is too fixture-driven: it proves rendering when an `initialAdmissionDecision` is injected, not the real routed path from queue row to server decision payload.

### Intended changes

#### 3.1 Admission destination state machine

Implement the routed Admission destination as a server-bound decision surface, not a static queue list.

Minimum state:

```ts
type AdmissionDestinationState =
  | { status: 'idle'; queue: AdmissionQueueItem[]; selectedRecordId?: number }
  | { status: 'loading-decision'; queue: AdmissionQueueItem[]; selectedRecordId: number }
  | { status: 'decision-ready'; queue: AdmissionQueueItem[]; selectedRecordId: number; decision: AdmissionDecisionPoint }
  | { status: 'action-pending'; queue: AdmissionQueueItem[]; selectedRecordId: number; decision: AdmissionDecisionPoint; action: string }
  | { status: 'error'; queue: AdmissionQueueItem[]; selectedRecordId?: number; message: string };
```

The exact type shape can differ, but the invariant cannot: **a selected queue row must resolve to a server-owned decision payload before the steward is asked to act.**

#### 3.2 Queue row behavior

Every Admission queue item should render:

- short ID and title;
- record type and current canon status;
- truth layer;
- existing severity fields if already declared;
- origin/source links where the server provides them;
- whether it has a `decisionPointHref`;
- a clear “Open Admission decision” action.

Clicking the queue row or action must fetch/use the exact server decision endpoint and replace the destination body with the decision surface. It must not merely mark a row selected locally.

#### 3.3 Active decision surface

The active surface must render, at point of use:

- local decision: “which proposed fact enters Admission now” / severity declaration / gate path as returned by the server;
- selected record body and provenance;
- current `admission_level` and `work_scale`, including null/undeclared state;
- vocabulary definitions for both severity facets;
- blockers and obligations;
- seed audit offered/declined/run state;
- skip affordances where allowed;
- prompt-out proposal/pressure availability, preview, source manifest, omissions, advisory warning, and copy/load controls;
- write intent and close preview;
- read-side trail links;
- start/resume/safe exit state.

A generic panel can remain as a component, but the Admission route must supply Admission-specific controls and labels. Do not close this on a JSON-ish payload dump.

#### 3.4 Severity controls

Before a gate exists, the surface owes two explicit steward inputs:

- `admission_level`;
- `work_scale`.

Rules:

- no defaults;
- no inference from text;
- no “recommended” setting from the app;
- definitions visible next to the controls;
- save action names exactly what it writes;
- after save, reload the server decision and allow the server to choose minor/moderate/full/severe/catastrophic obligations.

#### 3.5 Admission prompt binding fix

Server-side prompt assembly must not treat `gate === null` as minor ledger. In `packages/server/src/admission-flow.ts`, the observed pattern is:

```ts
const fullGate = gate?.path === "full_gate";
const templateKey = fullGate
  ? "admission_constraint_challenge"
  : "admission_prerequisite_audit";
```

When `gate` is `null` because severity is undeclared, this selects the prerequisite/minor path too early. The decision method card already says queue severity; prompt-out must follow that same decision.

Add an explicit branch:

```ts
if (!severityDeclared) {
  templateKey = "admission_queue_severity";
  stepKey = "admission:queue-severity";
  role = "Admission severity classifier";
  methodCard = "admission.queue-severity";
} else if (gate.path === "full_gate") {
  ...
} else {
  ...
}
```

Names can vary if the project has a stronger naming convention, but the decision separation cannot. `packages/server/src/prompt-out.ts` must map the new queue/severity Admission template to `admission.queue-severity`. `packages/server/src/prompt-out-defaults.ts` must define default text for that template.

The new prompt should ask a cold model to pressure or propose **classification prerequisites**: uncertainties, dependencies, missing context, likely severity considerations, and questions for the steward. It must not ask the model to complete the admission ledger or choose final labels.

#### 3.6 Seed audit and skips

The Admission surface must expose server-owned seed audit state before first admission. Declining the audit remains legal and writes a governed skip when the server says it should. The UI should show that seed audit does not mutate seed truth layer, canon status, severity, or operations.

#### 3.7 Close actions

Do not add accept/reject/defer buttons until the decision payload says blockers are cleared. When actions are shown, their labels must name the actual transition or result, not generic “save.”

### Acceptance package

Server acceptance:

1. Undeclared severity decision returns method card `admission.queue-severity`.
2. Undeclared severity prompt-out returns queue/severity template and step key.
3. Undeclared severity prompt preview does not contain `admission.minor-ledger`, `admission_constraint_challenge`, or minor-ledger completion language.
4. Declared minor and declared full-gate records still select the correct existing prompt templates.
5. Seed audit offer/decline/run paths are unchanged and still server-owned.

Browser acceptance:

1. From workflow map, choose Admission after a parked proposed seed.
2. See queue with `FAC-1`.
3. Open `FAC-1` decision.
4. See severity/work-scale controls and definitions.
5. See queue-severity prompt preview and source manifest.
6. Save severity facets.
7. See server-selected gate path update.
8. See seed-audit offer and skip/run behavior.
9. See write intent, close preview, and read-side trail.
10. Close proof with a Playwright/browser screenshot sequence, not fixture-only React tests.

---

## 4. Secondary hardening package

### 4.1 World-switch state reset

#### Problem

Field Build 02 exposed a hard trust failure: after switching from Brindlemark to Dead Air in the same browser session, visible Creation state still belonged to Brindlemark while the active world path/API had changed to Dead Air.

#### Intended invariant

At any render time:

```text
visible world path == world file used by all visible flow records, prompt state, queue state, and draft buffers
```

A violation is a blocker, even if the canonical SQLite data is safe on disk, because the browser becomes a misleading decision surface.

#### Implementation direction

Add one world-scoped reset boundary around create/open success in `packages/web/src/main.tsx`.

The boundary should clear or re-key at least:

- active destination-local state;
- `creationDecision`;
- Creation `flowId`, `kernelRecordId`, selected kernel section, kernel body draft, consequence-mode draft, decomposition state;
- Admission queue selection and `admissionDecision`;
- prompt preview state;
- loaded prompt status;
- prompt lifecycle/advisory UI state;
- flow errors/action errors;
- any cached workflow-shell destination payloads;
- any test-only initial-prop state that could survive a world change.

Prefer a helper with a hard name such as `resetWorldScopedUiState()` so future flows join the reset explicitly. A stronger implementation is to key the whole workspace subtree by `activeWorldPath` so React remounts destination state automatically. If remounting is used, still keep explicit reset tests so future refactors do not regress.

A full page reload can be an acceptable temporary safe boundary, but it is less desirable than deliberate reset because it masks which state is world-scoped.

#### Tests

Add a same-session test that:

1. opens world A and loads Creation with `SEE-1`/`FAC-1`/prompt state;
2. creates or opens world B without refreshing the test runtime;
3. asserts old short IDs, old world-specific titles, old prompt status, old section draft, and old decision payload are absent;
4. asserts the workspace shows world B’s actual fresh state.

### 4.2 Creation section hydration and dirty guard

#### Problem

Creation now carries the kernel, but the selected section UI can lie. It can display blank text for a saved section or retain one section’s text while the selected heading changes. That can cause cross-section writes.

#### Intended invariant

```text
selected section heading + visible textarea body + prompt preview selected-section context + save target
must describe the same kernel section.
```

#### Implementation direction

Use a section-keyed draft model:

```ts
type KernelSectionDraftKey = `${kernelRecordId}:${heading}`;
```

When selected heading changes:

1. if current draft is dirty, block the switch with “Save/discard current section first” or store it under its current key and visibly mark it unsaved;
2. load saved body for the new heading from the server decision payload;
3. if no saved body exists, set textarea to `""` and show explicit “No saved section text yet” copy;
4. update prompt preview context from the same selected-section object;
5. save only to the selected heading that owns the visible body.

Avoid a single unkeyed `kernelBody` variable that outlives heading changes.

#### Tests

Browser tests must cover:

- selecting saved heading A hydrates A;
- selecting empty heading B clears the textarea;
- typing dirty text in A then switching to B is blocked or safely drafts A without transferring text;
- prompt preview and save payload use the selected heading.

### 4.3 Unsaved consequence-mode readiness

#### Problem

The server correctly blocks decomposition until the consequence-mode facet exists, but the browser allows a selected dropdown value to look applied before save. This is a status-copy bug and possibly a state-shape bug.

#### Preferred behavior

Keep the server distinction between explicit saved facet and unsaved draft. The browser should show:

```text
Consequence mode: mixed (unsaved draft)
Save kernel step to apply this consequence mode before decomposition.
```

Then, after save:

```text
Consequence mode: mixed (saved)
Seed decomposition readiness: consequence mode satisfied.
```

Auto-saving on selection is allowed only if it still creates an explicit steward-authored event and handles errors honestly. The safer first slice is to make draft vs saved visible and keep save explicit.

### 4.4 Clean Creation start/resume before authoring

#### Problem

In a clean world, the steward could type a premise before a flow/kernel existed, but save remained disabled until Start/Resume was clicked.

#### Intended behavior

Choose one:

- **Auto-start on destination entry:** when Creation is the primary active route for a new world, entering the destination creates/resumes the flow and hydrates the decision before text fields are enabled.
- **Explicit start gate:** text fields remain disabled until Start/Resume succeeds, and the visible blocker says why.

The first is more fluent for Creation because a new world’s first productive action is expected to be Creation. The second is safer if the team wants every flow instance to require an explicit start act. Either is acceptable; the current half-enabled state is not.

### 4.5 Loaded prompt status binding

#### Problem

A loaded prompt status can outlive the decision that produced it. Field Build 02 saw the active prompt preview move to seed decomposition while the page footer still described a previously loaded Ordinary-life proposal prompt.

#### Intended invariant

Loaded prompt status must either match the active decision or declare its exact stale origin.

Recommended shape:

```ts
type LoadedPromptStatus = {
  worldPath: string;
  flowKey: string;
  flowId?: number;
  recordId?: number;
  stepKey: string;
  mode: 'proposal' | 'pressure';
  decisionLabel: string;
  createdAt: string;
  packetHash?: string;
};
```

On active decision change, world switch, record switch, step switch, or prompt packet change:

- clear the status; or
- show “Loaded prompt from previous decision: Creation / Ordinary-life anchor / Proposal” with a safe action to return or clear.

For accessibility, the status element should carry enough context to be equivalent to the visual experience. W3C’s ARIA status guidance notes that status messages should present application status updates without moving focus and that atomic status content should include the context necessary for assistive technology users.

---

## 5. Docs/spec implications

### 5.1 No methodology/package amendment

Do **not** change `docs/worldbuilding-system/` for Field Build 02.

Rationale:

- The report’s own methodology section says no methodology-source finding was found.
- The full package read did not reveal a conflict requiring package amendment.
- The app failures are in downstream projection: Admission UI, server prompt binding, browser world-scoped state, and local Creation state.
- Rewriting method doctrine to accommodate a thin UI would invert the authority order in `docs/principles/README.md`.

### 5.2 Principles and ADRs should not change

Do **not** amend the principles or ADRs for this slice.

They are already strong enough:

- P-2/W-1: steward sovereignty and advisory prompt-out.
- W-2: severity scaling as core conditional dimension.
- W-3: sweeps/Creation propose; only Admission admits.
- W-8/W-9: guided flows must be decision-point surfaces and replacement-grade guidance.
- T-1/T-7: one SQLite world file as canonical; browser storage never canonical.
- T-8: honest coverage.
- ADR 0006: Admission module boundary.
- ADR 0007: Prompt-out module seam.
- ADR 0008: flow-owned persistence.
- ADR 0009: browser guided-flow boundary.

Changing these would be ceremony without solving the bug.

### 5.3 Specs already sufficient

The following specs already require the central behavior and should be treated as authority for conformance work, not rewritten as if they were missing:

- `docs/specs/admission-flow.md` — queue selection, severity declaration, frontloaded seed audit, prompt-out, skip records, browser decision-point UI.
- `docs/specs/creation-flow.md` — selected-section kernel grain, explicit consequence-mode facet, decomposition readiness, seed parking at `proposed`, Admission handoff.
- `docs/specs/prompt-out-context-assembly.md` — screen context and prompt packet context are one assembly; omissions explicit; advisory/canon warning.
- `docs/specs/workflow-map-and-navigation.md` — one destination at a time, server-owned state refresh, guided-flow interiors, Admission foregrounding after parked proposed seeds.
- `docs/specs/browser-visible-guidance-acceptance.md` — browser-visible proof for guidance claims.

### 5.4 Narrow downstream doc amendments recommended

#### Amendment A: world-switch invariant

**Home:** `docs/specs/workflow-map-and-navigation.md` or `docs/specs/browser-visible-guidance-acceptance.md`.

Add a downstream acceptance rule, not a principle:

> A successful create/open of a different world must clear or remount all world-scoped guided-flow state before rendering the workspace. No visible flow record, prompt packet, loaded prompt status, draft buffer, queue selection, or decision payload may belong to a prior world path.

Why here: this is a navigation/browser evidence invariant. It enforces T-1/T-7 and ADR 0009 without changing them.

#### Amendment B: loaded prompt status identity

**Home:** `docs/specs/prompt-out-context-assembly.md` or `docs/specs/browser-visible-guidance-acceptance.md`.

Add a small status rule:

> Loaded/copied prompt status must identify the exact prompt packet origin and must clear or mark stale when the active decision context changes.

Why here: the prompt packet itself is governed by the existing spec; this amendment covers the browser status layer that can misrepresent packet identity.

#### Amendment C: Admission queue/severity prompt template precision

**Home:** `docs/specs/admission-flow.md`.

Add one precise downstream line to the Admission prompt section:

> Before severity is declared, Admission Prompt-out uses a queue/severity prompt template bound to the queue/severity method card. Prerequisite-audit and constraint-challenge templates are used only after the steward has declared `admission_level` and `work_scale` and the server has selected the corresponding gate path.

Why here: the existing step map and method-card spec already owe queue/severity guidance, so this is not new doctrine. It resolves a downstream spec wording ambiguity where the fixed prompt-template list names only the later prerequisite/constraint templates.

#### Amendment D: coverage ledger caveats

**Home:** `docs/methodology-coverage.md`.

Update the ledger to reflect Field Build 02 honestly:

- Creation kernel-to-first-seed happy path field-validated after Field Build 01 repairs.
- Creation residual caveats: section hydration, unsaved consequence-mode readability, clean-start authoring affordance.
- Admission server contract exists, but browser active decision projection blocked first field use.
- Prompt-out Creation pressure path validated on world premise; Admission pre-severity prompt binding requires repair.
- Same-session world switching has a blocking state trust caveat.

### 5.5 Docs not to change

Do not add LLM API integration, automatic canonization, “AI decides severity,” or automatic parsing of pasted responses. These would contradict P-2/W-1 and ADR 0007.

Do not weaken the requirement that Admission owns first canon standing. Creation’s success in parking a seed is validation of the boundary, not evidence that Creation should admit facts.

Do not broaden claims for unrelated flows. Field Build 02 only reached setup/open, workflow map, Creation kernel/decomposition/handoff, prompt-out pressure for a Creation section, and the first Admission queue. It did not validate propagation, temporal, contradiction, institutional/economic/suppression, QA, MVW, or schema-only surfaces in this run.

---

## 6. Code seams and test seams to change

### 6.1 Server seams

#### `packages/server/src/admission-flow.ts`

Change `promptOutFor` or its caller so pre-severity Admission uses the queue/severity prompt path. Do not infer from `gate?.path` alone because `gate === null` has two meanings today:

1. severity is undeclared, so no gate path exists;
2. a non-full path is active after severity declaration.

Those must be distinct states.

Also make sure the returned decision payload carries enough fields for the browser to render:

- selected record context;
- severity vocabulary definitions;
- explicit blocker saying both facets must be declared;
- prompt-out modes and preview for queue severity;
- seed audit offer state;
- write intent and close preview.

#### `packages/server/src/prompt-out.ts`

Add mapping from the new Admission queue/severity template to `admission.queue-severity`. The existing mapping of `admission_prerequisite_audit` to `admission.minor-ledger` can remain for declared minor/moderate paths if correct.

#### `packages/server/src/prompt-out-defaults.ts`

Add default template text for pre-severity Admission. It should:

- name the decision as severity/work-scale classification readiness;
- include the proposed fact text, truth layer, source/origin, current canon status;
- include vocabulary definitions and doctrine excerpts;
- ask for risks, dependencies, missing information, uncertainty, and candidate questions;
- forbid final canon status, final labels, hidden assumptions, and automatic admission;
- preserve advisory/canon warning.

#### `packages/server/src/decision-point-contract.ts`

A contract version bump is likely unnecessary if existing discriminants can carry the new template/step. Add tests if the contract currently assumes Admission has only prerequisite/constraint prompt steps.

#### `packages/server/src/http/admission-routes.ts`

Ensure routes support:

- fetch queue;
- fetch selected decision;
- save severity facets;
- start/resume Admission record if distinct from decision fetch;
- seed audit run/decline;
- skip routes;
- close actions only after blockers clear.

Do not add browser-owned policy to fill gaps. If the browser needs information, expose it in the server decision payload.

### 6.2 Browser seams

#### `packages/web/src/main.tsx`

This is the highest-change browser seam.

Implement:

- world-scoped reset helper or workspace subtree remount by active world path;
- Admission queue row -> decision fetch -> active decision projection;
- severity/work-scale controls wired to server routes;
- seed audit controls;
- prompt-out controls and previews for Admission;
- loaded prompt identity/staleness binding;
- Creation section keyed drafts and hydration;
- unsaved consequence-mode status copy;
- clean-start Creation start/resume gating.

Keep generic `DecisionContractPanel` only as substrate/diagnostic or as a subcomponent. It must not be the only UI if it fails to expose Admission actions.

#### `packages/web/src/workflow-shell.tsx`

The shell’s one-visible-destination design is correct. Change it only if Admission needs a better destination slot for action panels, loading states, or server-refresh hooks. Do not move Admission policy into the shell.

#### `packages/server/src/active-world-session.ts`

Review for setup/open identity behavior, but do not treat it as the root cause unless tests prove server state is stale. Field Build 02 says API truth pointed to the new empty world; the visible stale material was browser state.

### 6.3 Test seams

#### Server tests

Add to `packages/server/test/app.test.ts`:

- proposed fact with undeclared severity returns decision method card `admission.queue-severity`;
- prompt-out preview/template is queue/severity, not minor ledger;
- severity save changes gate path and prompt template appropriately;
- seed audit decline/run still works.

Add to `packages/server/test/prompt-out.test.ts`:

- queue/severity Admission template maps to `admission.queue-severity`;
- generated packet contains severity vocabulary and advisory warning;
- generated packet forbids final canon labels and admission decisions.

Keep existing Creation flow tests; add only if server payload needs a saved/draft consequence distinction.

#### Browser tests

Add to `packages/web/src/admission-decision-surface.test.tsx`:

- start with queue only, not `initialAdmissionDecision`;
- open a queue item via `decisionPointHref`;
- assert active decision controls render;
- assert undeclared severity prompt preview is queue/severity;
- save severity and see gate refresh.

Add to `packages/web/src/workflow-shell.test.tsx`:

- route from workflow map to Admission destination;
- render one active destination only;
- verify Admission destination can host the decision-point surface, not only queue shell.

Add to `packages/web/src/setup-open-world.test.tsx`:

- same-session switch from world A with flow/prompt state to world B;
- old flow IDs, short IDs, prompts, and loaded statuses disappear.

Add to `packages/web/src/creation-decision-surface.test.tsx`:

- saved section hydrates;
- empty section clears;
- dirty section switch is guarded;
- unsaved consequence-mode selection is visibly draft and does not satisfy readiness;
- saved consequence mode satisfies readiness.

Add/update `packages/web/src/prompt-out-lifecycle.test.tsx`:

- loaded prompt status is keyed to decision identity;
- transition clears or marks stale;
- world switch clears loaded prompt state.

---

## 7. Suggested PRD/issue slicing

### PRD A — Admission decision projection and pre-severity prompt binding

**Type:** blocker-first PRD.  
**Findings covered:** F-02, P-01.  
**Why first:** Field Build 02 frontier is blocked at Admission. Creation can now park a seed; the next real work is first canon standing.

Scope:

1. Render Admission queue row as active decision selector.
2. Fetch/render `/api/admission/records/:id/decision-point` in routed Admission destination.
3. Add severity/work-scale controls and definitions.
4. Expose seed audit offer/decline/run state.
5. Expose prompt-out proposal/pressure preview and actions.
6. Fix server pre-severity prompt binding.
7. Add server and browser tests.
8. Produce browser evidence from Dead Air-like path: Creation seed -> Admission queue -> open decision -> queue-severity prompt -> severity save.

Out of scope:

- completing all full-gate action forms;
- LLM API integration;
- automatic canonization;
- redesign of non-Admission flows.

### PRD B — World-scoped state reset and prompt status identity

**Type:** blocker hardening PRD.  
**Findings covered:** F-01, P-02.  
**Why second:** It protects trust across setup/open and prevents prompt misattribution. It can be developed in parallel if staffing allows.

Scope:

1. Define and implement world-scoped UI reset/remount boundary.
2. Clear all destination-local flow state on world switch.
3. Key loaded prompt status by world and decision identity.
4. Clear or mark stale loaded prompt status on decision changes.
5. Add same-session world-switch tests and prompt-status tests.
6. Produce browser evidence showing no old world content under new world path.

Out of scope:

- multi-world tabs;
- collaboration/branch UI;
- moving canonical state into browser storage.

### PRD C — Creation state hardening

**Type:** friction PRD, but high trust value.  
**Findings covered:** R-REG-01, R-REG-02, R-01.  
**Why third:** Creation is no longer the main blocker, but these issues can cause accidental writes and false readiness.

Scope:

1. Section-keyed draft/hydration model.
2. Dirty switch guard or saved per-section drafts.
3. Unsaved vs saved consequence-mode display.
4. Clean-start authoring guard or auto start/resume.
5. Browser tests for section switching and readiness.
6. Browser evidence from a two-section switch and consequence-mode save.

Out of scope:

- changing the nine kernel-section methodology;
- auto-generating kernel prose;
- admitting seeds from Creation.

### PRD D — Evidence and coverage ledger update

**Type:** docs/evidence PRD.  
**Findings covered:** V-REG-01, V-01, V-02, V-03 plus caveats from F/R/P findings.  
**Why fourth:** Do this after implementation proofs exist so the ledger remains honest.

Scope:

1. Update `docs/methodology-coverage.md` with Field Build 02 validations and caveats.
2. Add narrow acceptance amendments for world-switch and loaded prompt status if accepted.
3. Archive/link Playwright evidence for PRD A-C.
4. Avoid broad claims for untouched flows.

Out of scope:

- package amendments;
- principle rewrites;
- ADR rewrites.

---

## 8. Browser/field evidence required to prove the fix

The closeout must include browser evidence, not only unit tests.

### Evidence sequence A: Admission first decision

1. Start with a fresh world or a fixture world equivalent to Dead Air after Creation parks one proposed seed.
2. Navigate from workflow map to Admission.
3. Show queue row for the proposed fact.
4. Open the row.
5. Show active Admission decision with:
   - selected fact;
   - severity/work-scale controls and definitions;
   - queue-severity method card;
   - queue-severity prompt preview;
   - blockers;
   - seed audit offer;
   - write intent and read-side trail.
6. Save severity facets.
7. Show server-refreshed path and prompt binding after declaration.

### Evidence sequence B: world switch reset

1. Open world A and load Creation/Admission/prompt state.
2. Create/open world B in the same browser session.
3. Show world B path and workspace.
4. Verify no world A record IDs, seed titles, prompt statuses, or draft content remain visible.
5. Enter Creation/Admission and show world B’s server state only.

### Evidence sequence C: Creation section/draft safety

1. Save text under one kernel section.
2. Switch to an empty section.
3. Show textarea clears and prompt preview changes to the new section.
4. Enter dirty text, attempt switch, and show guard or safe draft handling.
5. Save consequence-mode selection and show readiness changes only after saved state.

### Evidence sequence D: prompt status binding

1. Load/copy a prompt for Creation section A.
2. Transition to seed decomposition or another section.
3. Show loaded status clears or declares stale origin.
4. Switch worlds and show loaded status clears.

### Field rerun frontier

After PRD A/B/C, rerun the Dead Air frontier from Field Build 02:

- resume at `FAC-1 Broadcast ratings allocate survival support` in Admission;
- classify severity/work scale from the UI;
- run or decline seed audit;
- use queue-severity prompt-out if needed;
- proceed to the correct minor/full path;
- verify no stale prompt/world state appears.

---

## 9. Risks, big-change justification, and non-goals

### Risks

#### Risk: hiding complexity by over-simplifying Admission

Admission is complex because the method is complex. Progressive disclosure is useful, but only if the initial display contains the current task’s essential controls. NN/g’s progressive-disclosure guidance says advanced or rare features can be deferred to secondary screens, but the initial display should foreground the important options and reduce error. In Worldloom terms, severity declaration and queue selection are not advanced options; they are the current Admission decision.

Mitigation: make queue selection and severity declaration primary; defer full-gate sections until the server says severity requires them.

#### Risk: browser state reset erases useful drafts

World-scoped reset must not destroy unsaved text without warning in the same world. But on a world switch, keeping old flow state visible is worse. Local-first software values user ownership and control over local files; rendering another world’s material under a new world path undermines that ownership model.

Mitigation: warn about unsaved current-world drafts before switching; after successful switch, reset/remount all world-scoped state.

#### Risk: prompt status becomes noisy

A fully keyed prompt status can become verbose. But a stale status that implies the wrong prompt is active is dangerous.

Mitigation: compact status with expandable detail: “Loaded prompt: Creation / Ordinary-life / Proposal” when current; “Previous prompt loaded” with origin when stale.

#### Risk: tests overfit field data

Using Dead Air labels directly in tests can overfit. The functional tests should use small fixture worlds. Playwright/field evidence can use Dead Air-like names.

Mitigation: unit/browser tests assert invariants; field walkthrough asserts narrative realism.

### Big-change justification

Admission UI projection is a big change, but it is not scope creep. It is exactly what W-8/W-9 and ADR 0009 require: the app must be the guided decision surface. A queue-only Admission page is a false finish line because it proves routing but not steward-operable governance.

World-switch reset is also a big change because it cuts across flow state. It is justified because one-file-per-world is foundational. The app cannot claim local-first canonical file trust while letting the browser commingle flow records across worlds.

### Non-goals

Do not do these in response to Field Build 02:

- add direct LLM API integration;
- allow an LLM to choose severity, truth layer, canon status, or admission result;
- parse pasted advisory responses into canon fields;
- let Creation admit facts;
- replace server-owned Admission policy with browser logic;
- rewrite methodology package doctrine;
- rewrite principles or ADRs;
- claim Propagation, Temporal, Contradiction, Institutional/Economic/Suppression, QA, MVW, or schema-only surfaces are field-validated by this run;
- use `/tmp` screenshot or world files as fetchable repository evidence.

---

## 10. Open assumptions or contradictions

1. **Authoring-time equivalence:** The brief states that a targeted diff over the named seam paths from Field Build 02’s app commit `ed372a5` to the fetch baseline `dd04bbd1447f98817b9545651e4043dc326a72de` produced no output. This report uses the fetch baseline as the inspected source tree and treats the named seam files as unchanged for this task only. It does not generalize that equivalence to unrelated files.

2. **Screenshot/world-file evidence:** Field Build 02 screenshot filenames and `/tmp` world paths are used as report evidence labels only. They were not in the manifest and were not fetched.

3. **Admission completion depth:** This plan intentionally focuses on getting to a performable first Admission decision. It does not require implementing every possible full-gate close path if the first slice can honestly stop at severity declaration plus correct path reveal. However, the UI must not pretend a close action exists until blockers are cleared.

4. **Consequence-mode persistence choice:** The plan prefers explicit save with draft/saved distinction. Auto-save on selection is acceptable only if the team wants that UX and still records an explicit steward-authored change with error handling. The contradiction to avoid is visible “selected” state being treated as saved readiness when the server does not agree.

5. **Contract versioning:** I did not identify a necessary decision-point contract version bump from the read. If implementation reveals that template/step discriminants are exhaustively typed in a way that excludes queue-severity prompt-out, update tests and types. Do not use versioning as a reason to keep the premature minor-ledger prompt.

---

## Appendix A: Required authority groups read

- `docs/worldbuilding-system/` — 58 files: package root files, checklists, templates, manifest, operating card.
- `docs/principles/` — 7 files.
- `docs/adr/` — 9 files.
- `docs/specs/` — 16 files.
- Evidence reports: Field Build 02, Field Build 01, Field Build 01 change spec, PRD #222 walkthrough, workflow usability doc overhaul report.
- Primary code seams: Admission, Creation, Prompt-out, active world session, app setup, web main/workflow shell, and named tests.
- Nearby exploration: prompt-out tests/lifecycle, workflow-map tests, route registry tests, setup/open tests, CSS/package seams where relevant.

## Appendix B: External research used

External research was used only for design framing, not for target-repository facts.

- Nielsen Norman Group, “Progressive Disclosure” — supports foregrounding the current essential decision while deferring secondary complexity. URL: `https://www.nngroup.com/articles/progressive-disclosure/`.
- Ink & Switch, “Local-first software: You own your data, in spite of the cloud” — supports treating local file ownership and visible data identity as a hard trust property. URL: `https://www.inkandswitch.com/essay/local-first/`.
- W3C WAI, ARIA22 “Using role=status to present status messages” — supports status messages that include enough context for application-status updates, relevant to loaded prompt status. URL: `https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22`.
- NIST AI Risk Management Framework overview — background support for risk-managed AI assistance, but not a driver of any repository-state claim. URL: `https://www.nist.gov/itl/ai-risk-management-framework`.

## Appendix C: Final evidence-ledger pointer

The complete exact-commit acquisition ledger is provided separately as:

```text
field-build-02-acquisition-ledger.txt
```

It includes the requested repository, target commit, fetch method, provenance result, and every exact repository-file URL fetched for this analysis.
