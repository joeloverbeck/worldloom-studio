# Field Build 03 Change Plan

**Target repository:** `joeloverbeck/worldloom-studio`  
**Target commit analyzed:** `cde63eeb750ff7572e277e594b86c5b8f99018e3`  
**Field evidence under triage:** `reports/field-build-03-twentyfall-frontier.md`  
**Report date:** 2026-07-07  
**Deliverable type:** recommendation/change-plan report, not ratified spec text and not implementation code

---

> ## ⚠ Auditor's corrections — 2026-07-07 (verified against HEAD `cde63ee` with direct repo access)
>
> This plan was reassessed against the live codebase. **Its analysis is directionally sound and worth implementing, but three classes of defect were found. Read this before acting on any section below.**
>
> 1. **All `R-*:Lxxxx` line numbers are unreliable.** Every checked citation points *past the end of the file it names* (e.g. `admission-flow.ts:L3946` in a 1048-line file; `admission-routes.ts:L459` in an 80-line file; `admission-decision-surface.test.tsx:L1671` in a 425-line file). The **substance** of every code claim was verified true, but navigate by symbol name, not line number. Real anchors: `completeAdmissionGate` at `admission-flow.ts:950` (validations 969–973); the `/api/admission/gate/complete` route at `admission-routes.ts:43`; server completion tests at `app.test.ts:622–712`; prompt-out step actions at `prompt-out-step-actions.ts:65–191`.
>
> 2. **P-02 is mis-diagnosed** (corrected in place at §4.2, §5.6, §6.1, Issue 4). The server does **not** refuse non-premise empty-section Proposal — it already allows it (`creation-flow.ts:448-449`, essence-scoped at `:211`). The field block is a **client** selection-sync gate (`main.tsx:1760-1762`) that is *mode-agnostic* and fires on a heading/`current_step` mismatch, plus the server deriving the target section solely from persisted `current_step`. The fix is web-layer + server section-plumbing, not "correct server mode availability."
>
> 3. **The browser already holds scaffolding this plan treats as greenfield.** `completeAdmission`/`admitMinorBatch` handlers and the gate-field state exist in `main.tsx` but are **orphaned** — never rendered or wired to any control (the true shape of F-01). `LoadedPromptOrigin` + `promptOriginsMatch` + a stale/current status panel also already exist (`main.tsx:906, 1043, 1069-1096, 1841-1862`). So Issue 1 is largely *wiring*, and Issue 3 / §4.1 is *binding the copyable body to the existing identity* — not introducing new machinery.
>
> Also corrected in place: the §6.4 test guidance (do not delete the existing `not.toContain` assertions) and doc-amendment B (§5.5, mostly redundant). All spec/principle/ADR **content** attributions were independently verified accurate.

---

## Provenance and evidence lanes

This report analyzes the user-supplied target commit only. It does **not** independently verify whether `cde63eeb750ff7572e277e594b86c5b8f99018e3` is the current `main`.

Repository evidence was acquired only from exact commit URLs rooted at:

```text
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/cde63eeb750ff7572e277e594b86c5b8f99018e3/
```

Acquisition summary:

```text
Requested repository: joeloverbeck/worldloom-studio
Target commit: cde63eeb750ff7572e277e594b86c5b8f99018e3
Freshness claim: user-supplied target commit only; not independently verified as latest main
Manifest role: path inventory only
Repository metadata used: no
Default-branch lookup used: no
Branch-name file fetch used: no
Target-repository code search used: no
Clone used: no
URL fetch method: web.run open with full raw.githubusercontent.com exact-commit URLs
Requested file count: 129
Successfully verified file count: 129
Fetch-provenance contamination observed: no
Foreign-repository references inside fetched file contents: permitted; not a provenance check
Connector/tool namespace trusted as evidence: no
External research lane: separate from repository evidence
```

The companion acquisition ledger is `field-build-03-acquisition-ledger.txt`. It lists every exact repository-file URL fetched. Repository paths and line references below refer to those verified exact-commit files. External sources are marked separately and never establish target-repository state.

## Source labels used in this report

Repository evidence labels:

- **R-FB03** — `reports/field-build-03-twentyfall-frontier.md`; primary field evidence. Key lines: V-REG/V/P/F findings at L3-L25; app and methodology recommendations at L34-L37; frontier state at L38-L39.
- **R-FB02-Plan** — `reports/field-build-02-change-plan.md`; predecessor blocker plan.
- **R-FB02-Report** — `reports/field-build-02-dead-air-earth.md`; prior field-build evidence replayed by Field Build 03.
- **R-FB01-Spec** and **R-FB01-Report** — earlier creation/admission lineage evidence.
- **R-PRD231**, **R-PRD232**, **R-PRD233** — walkthrough evidence that Field Build 03 validates or pressure-tests.
- **R-WorkflowPrinciples** — `docs/principles/workflow-principles.md`; browser completion and prompt-out principles.
- **R-GuidedUsability** — `docs/principles/guided-workflow-usability.md`; Decision-Point Contract and browser evidence standard.
- **R-CanonSovereignty** — `docs/principles/canon-sovereignty.md`; advisory/canon boundary and advisory artifact provenance.
- **R-AdmissionSpec** — `docs/specs/admission-flow.md`; Admission queue, severity, full gate, prompt-out, and browser contract.
- **R-PromptOutSpec** — `docs/specs/prompt-out-context-assembly.md`; prompt packet identity, modes, lifecycle, and loaded status.
- **R-CreationSpec** — `docs/specs/creation-flow.md`; Creation kernel section grain, seed parking, and handoff contract.
- **R-ADR0006** — `docs/adr/0006-admission-flow-module-boundary.md`; Admission server-side ownership.
- **R-ADR0007** — `docs/adr/0007-prompt-out-step-module-seam.md`; Prompt-out server-side lifecycle.
- **R-ADR0008** — `docs/adr/0008-flow-owned-persistence-stores.md`; durable flow state in world file.
- **R-ADR0009** — `docs/adr/0009-browser-guided-flow-boundary.md`; browser guided-flow boundary.
- **R-AdmissionFlow.ts** — `packages/server/src/admission-flow.ts`; Admission server policy/completion implementation.
- **R-AdmissionRoutes.ts** — `packages/server/src/http/admission-routes.ts`; Admission HTTP route shape.
- **R-AppTest** — `packages/server/test/app.test.ts`; server HTTP seam evidence.
- **R-AdmissionBrowserTest** — `packages/web/src/admission-decision-surface.test.tsx`; routed browser Admission evidence.
- **R-PromptStepActions.ts** — `packages/server/src/prompt-out-step-actions.ts`; Prompt-out step lifecycle actions.
- **R-main.tsx** — `packages/web/src/main.tsx`; browser state/projection seam.

External research labels:

- **EXT-NNG-Status** — Nielsen Norman Group, “Visibility of System Status.”
- **EXT-GOVUK-Errors** — GOV.UK Design System, “Error message”; GOV.UK Service Manual, “Validation.”
- **EXT-W3C-Status** — W3C WCAG 2.2 Success Criterion 4.1.3, “Status Messages,” and WAI-ARIA status role technique.
- **EXT-NIST-AIRMF** — NIST AI Risk Management Framework 1.0.

External research sharpened UI acceptance and advisory-governance proof only. It did not change the authority order of the repository.

---

# 1. Executive verdict

Field Build 03 is not a methodology failure. The field run found the method actionable, and the full authority read supports that: the worldbuilding package, principles, ADRs, and specs already say the right high-altitude thing. The remaining failures are app encoding and browser projection failures.

The blocker is narrower and more damning than “Admission full gate not implemented.” The backend already has a full-gate completion path:

- `completeAdmissionGate` exists in the Admission module and accepts record identity, truth layer, canon status, constraint tags, ordered operations, written consequence text, n/a reasons, quiet-domain declarations, follow-up debt, and optional advisory artifact link input. It refuses no-operation completion, refuses missing written consequence on full gates, refuses blank n/a reasons, and refuses blank quiet-domain declarations. **R-AdmissionFlow.ts:L3946-L3990**
- `/api/admission/gate/complete` is registered and delegates to `completeAdmissionGate`, returning a refreshed decision point. **R-AdmissionRoutes.ts:L459-L496**
- Server tests exercise failed full-gate completion for missing written consequence and successful completion that writes a `gate_result`, changes canon status, surfaces warnings, marks the flow complete, and returns read-side trails. **R-AppTest:L3305-L3316; L3354-L3413**

The routed browser surface is where the governed work stops. Field Build 03 reports that the app shows the full-gate contract but provides no authoring fields, status/operation selector, constraint tag controls, n/a or quiet-domain controls, follow-up debt composer, or full-gate completion control. **R-FB03:L19-L22** The browser test reinforces that: the routed Admission destination is tested for decision-point information and prompt preview, but it explicitly asserts the rendered HTML does **not** contain `Complete Gate`, `Admit Minor Row`, or other mutation controls. **R-AdmissionBrowserTest:L1671-L1817; L1860-L1867**

So F-01 is a **routed browser executability gap plus legacy/routed surface drift**, not a missing backend route. The codebase has server-side Admission capability and server tests; it lacks a guided, browser-visible, route-owned form that lets the steward perform the full gate from the active Admission decision point.

Prompt-out has two separate failures:

1. **Mode/body atomicity failure.** Field Build 03 saw visible controls and visible/extracted packet bodies disagree across Creation and seed decomposition. **R-FB03:L9-L12** This violates the prompt-out spec’s loaded-status identity rule: loaded status must be scoped to world, flow, run/record, step, mode, decision label, and packet identity, and must clear or visibly become stale when section, record, step, mode, packet, or world changes. **R-PromptOutSpec:L29-L32**
2. **Lifecycle exposure failure at the active full gate.** Prompt-out step actions exist server-side: `generate`, `storeAdvisory`, `disposition`, and `skip` URLs are returned by the step DTO, and storage/disposition handlers exist. **R-PromptStepActions.ts:L1009-L1017; L1227-L1234; L1259-L1354** Field Build 03 says the active Admission full gate shows only loaded pressure status, not in-place mode switching, response paste/store, disposition, or advisory-use link selection. **R-FB03:L23-L25**

The right change plan is blocker-first:

1. **Implement executable Admission full gate in the routed guided browser destination.** Render a server-owned full-gate draft form from the Admission decision contract, preserve recovery on errors, submit to the existing completion route, and prove complete/hold/reject/defer paths from the browser.
2. **Harden Prompt-out packet identity and lifecycle.** Make selected mode, visible body, extracted/copyable body, loaded status, and advisory controls one atomic packet state across Creation and Admission.
3. **Fix non-premise empty-section Proposal mode.** Continue refusing Proposal for the World premise essence exception, but allow Proposal packets for non-premise empty kernel sections such as Core promise.
4. **Update downstream specs and coverage only narrowly.** Do not amend the methodology package, principles, or ADRs. Add narrow spec clarifications and update `docs/methodology-coverage.md` after implementation, with no maturity promotion until browser-visible field evidence closes the blocker.

This is a medium-to-large browser and contract slice, not a cosmetic UI bug. A generic record form or hidden legacy stacked workspace would not close it. The repository’s own principles say a flow is not complete merely because records, routes, stores, and server validations exist; it is complete only when the browser-visible Decision-Point Contract lets the steward see the decision, obligations, prompt-out support, write intent, next step, and read-side trail. **R-WorkflowPrinciples:L5; R-GuidedUsability:L1-L3; R-ADR0009:L0-L4**

---

# 2. Evidence classification table

| Finding | Field Build 03 evidence | Classification | Target home | Intended change | Acceptance/proof |
|---|---|---|---|---|---|
| **V-REG-01 — same-session world switch fixed** | Opening Brindlemark, then creating Twentyfall in the same browser session reset header, workflow map, queues, and Creation surface with no stale IDs. **R-FB03:L3-L4** | No-action validation; evidence/coverage note | `docs/methodology-coverage.md`; regression test inventory | Mark Field Build 02 world-switch state leak as fixed for the walked path. Do not reopen PRD-232 unless a new path shows stale state. | Existing PRD-232 walkthrough plus Field Build 03 screenshot evidence; retain setup/open world-switch test as regression. |
| **V-REG-02 — Admission queue selection and severity rendered** | Admission exposed queue selection, selected-record context, severity controls, definitions, blockers, seed audit controls, prompt preview, close preview, read-side trail, and resume state. **R-FB03:L4-L5** | No-action validation; evidence/coverage note | Coverage ledger; browser regression tests | Treat Field Build 02 Admission first-decision projection blocker as fixed for pre-severity queue/severity selection. | Routed browser test should stay but must be extended to executable full-gate actions rather than treating projection alone as completion. |
| **V-REG-03 — Admission prompt-out no longer assumes minor ledger before severity** | Queue selection loaded `record:3:queue-selection` and prompt preview/direct payload were bound to `admission_queue_severity` / `admission:queue-severity` with unset severity and severity blocker. **R-FB03:L5-L6** | No-action validation; app conformance confirmed | Admission prompt-out tests; coverage ledger | Keep the server binding: pre-severity Admission prompt-out stays on queue-severity template/card; post-severity full gate uses constraint challenge. | Regression test must ensure `admission_constraint_challenge` is not selected until after severity chooses full gate. |
| **V-01 — setup, workflow map, Creation-first route app-carried** | New Twentyfall world creation worked; Creation opened as earned active route; other routes stayed visible but locked/not-earned. **R-FB03:L7-L8** | No-action validation | Coverage ledger; workflow-map tests | Preserve current workflow-map entry grammar. No methodology or spec change. | Existing setup/open and workflow-shell tests stay as regressions. |
| **V-02 — World-premise pressure prompt-out works cold** | World premise Proposal was refused; Pressure produced self-contained packet; cold subagent stayed in-bounds and challenged overloaded mysteries and premise issues. **R-FB03:L8-L9** | No-action validation plus Prompt-out coverage caveat | Creation prompt-out tests; coverage ledger | Preserve World premise Proposal refusal. Preserve Pressure availability after steward premise material exists. Do not infer global Prompt-out maturity from one successful pressure packet. | Browser/cold-LLM evidence for premise pressure remains valid; add packet identity regression so mode mismatch cannot contaminate future evidence. |
| **P-01 — mode controls and packet body disagree** | Packet body stayed pressure while dropdown appeared Proposal; later Pressure selections for Ordinary-life and seed decomposition left Proposal packet visible/extractable. **R-FB03:L9-L12** | App conformance/code defect; test/evidence change; PRD slice | `packages/web/src/main.tsx`; Prompt-out lifecycle browser tests; `docs/specs/prompt-out-context-assembly.md` acceptance clarification | Make prompt mode, visible packet, extracted/copyable packet, loaded status, and action buttons one atomic packet origin. Clear or mark stale on section, record, step, mode, packet, or world changes. | Browser tests reproduce mode flips and assert stale packet cannot be copied as current; server/browser state carries packet identity; field evidence includes mode/body/status screenshots and copied packet text. |
| **P-02 — non-premise empty kernel sections cannot use Proposal mode** | Core promise Proposal disabled with “waits for selected section to be saved,” while stale World premise pressure packet remained visible. **R-FB03:L12-L14** | App conformance/code defect; narrow docs/spec clarification | Creation prompt-out server generation; browser mode availability; `docs/specs/creation-flow.md` erratum; tests | Proposal mode must remain refused for World premise essence only. Non-premise empty kernel sections must generate Proposal packets for candidate section material. Pressure remains blocked until authored material exists. | Server test and browser test for empty Core promise Proposal success; World premise Proposal refusal still tested; cold Proposal packet has selected-section context and advisory boundary. |
| **V-03 — Creation carries complete kernel and saved consequence mode** | All nine kernel sections saved; consequence mode persisted as `mixed`; selected-section hydration failure did not recur once material existed. **R-FB03:L14-L15** | No-action validation; evidence/coverage note | Creation tests; coverage ledger | Do not reopen Field Build 01 Creation hydration blockers. Continue guarding explicit consequence-mode facet and section persistence. | Existing Creation tests plus field screenshot evidence. |
| **V-04 — Seed decomposition and Creation-to-Admission handoff work** | `POST /api/flows/creation/decompose` returned 201, created `SEE-1` and proposed `FAC-1`, then showed Admission handoff. **R-FB03:L15-L16** | No-action validation | Creation handoff tests; coverage ledger | Preserve seed parking at `proposed` and Admission handoff. Do not recommend Creation admission behavior. | Server and browser tests must keep Creation from admitting seeds. |
| **V-05 — Severe Admission classification opens full-gate contract** | After pressure, `admission_level=4` and `work_scale=severe` switched to full gate, method card `admission.full-gate`, template `admission_constraint_challenge`, path `full_gate`, and obligation list. **R-FB03:L16-L18** | No-action validation; partial app conformance | Admission server/browser tests; coverage ledger | Treat severity selection/path routing as fixed. Next work starts after full-gate contract is visible. | Browser test should keep path routing but extend from projection into form execution. |
| **V-06 — Frontloaded seed audit writes and links gate result** | Seed audit returned 201 and `FAC-1` listed `GAT-1 Frontloaded seed audit` in source/origin links. **R-FB03:L18-L19** | No-action validation; test/evidence note | Admission tests; coverage ledger | Preserve first-seed audit reachability, non-mutation, and link behavior. No methodology change. | Existing seed audit HTTP test plus browser evidence that audit is reachable before full-gate completion and does not mutate seed standing. |
| **F-01 — full canon fact gate visible but not executable** | App lists full-gate obligations and blockers but provides no authoring fields, operation/status controls, constraint tags, n/a/quiet controls, follow-up debt composer, or completion control. Steward cannot admit/hold/reject through governed UI. **R-FB03:L19-L22** | Blocking app conformance/code defect; browser evidence failure; PRD slice | `packages/web/src/main.tsx`; Admission decision contract; `packages/server/src/admission-flow.ts`; `packages/server/src/http/admission-routes.ts`; `packages/server/test/app.test.ts`; browser tests; coverage ledger | Build executable routed Admission full-gate form from server-owned decision contract. Use existing server route where sufficient; deepen payload/decision contract if structured gate item proof needs more than current fields. | End-to-end browser walkthrough from severe proposed fact through invalid-error recovery and valid completion/hold/reject/defer. Server tests verify validation and writes; browser tests verify real action path, not fixture-only projection. |
| **P-03 — full-gate prompt-out loads only pressure status** | Load wrote status for admission full-gate pressure step, but no in-place mode switch, response paste/store, disposition, or advisory-use link selection appeared. **R-FB03:L23-L25** | Prompt-out app conformance/code defect; test/evidence change; PRD slice | Prompt-out step lifecycle browser surface; Admission full-gate form; advisory-use link controls; Prompt-out lifecycle tests | Expose prompt-out lifecycle inside active Admission full gate: mode switch, packet preview, copy, paste/store response, disposition, skip, and explicit advisory-use link selector. Never infer advisory use from pasted response. | Browser test stores an advisory artifact, records disposition, then completes gate with explicit advisory artifact ID and verifies link/read-side trail. |

---

# 3. Primary change package: executable Admission full gate

## 3.1 Diagnosis

The backend and route exist. The browser decision point is the stop.

Repository facts:

- The server function `completeAdmissionGate` exists and performs core completion work. **R-AdmissionFlow.ts:L3946-L4040**
- The route `/api/admission/gate/complete` is registered. **R-AdmissionRoutes.ts:L459-L496**
- Server tests cover missing consequence failure and successful completion. **R-AppTest:L3305-L3316; L3354-L3413**
- The routed browser Admission surface test currently proves projection, not execution, and explicitly checks that mutation controls are absent. **R-AdmissionBrowserTest:L1779-L1817; L1860-L1867** (Auditor note: this `not.toContain` assertion is on the *pre-severity* fixture and is correct there — see the §6.4 correction.)
- Field Build 03 reached severe full gate after seed audit but could not complete the gate. **R-FB03:L19-L22; L32-L33**
- **Auditor addition:** the browser already contains *orphaned* completion scaffolding — `completeAdmission` (`main.tsx:2909`) and `admitMinorBatch` (`main.tsx:2927`) handlers plus gate-field state (`gateConsequence` / `admissionOperation` / `gateNotApplicable` / `gateQuietDomain`, `main.tsx:1671-1674`) are defined but **never rendered or wired to any control**. F-01 is therefore a *wiring + rendering* gap over existing (thin, single-value) state, not a from-scratch build.

This is exactly the difference `workflow-principles.md` and `guided-workflow-usability.md` warn about: a flow is incomplete if the browser does not expose the decision contract, even when server policy and route validation exist. **R-WorkflowPrinciples:L5; R-GuidedUsability:L1-L3**

## 3.2 Intended product behavior

When a selected Admission record has declared major-or-higher severity and the server decision point says the path is `full_gate`, the routed Admission destination must render an executable full-gate form in the active decision point. It must not force the steward into a generic record editor, hidden admin surface, substrate CRUD, or a legacy stacked workspace.

The form should be driven by server-returned policy and write intent. The browser may own local draft state and accessibility affordances, but it must not duplicate gate policy. ADR 0006 says the browser consumes server-returned queue, gate, warning, skip, and coverage shapes and must not duplicate Admission policy. **R-ADR0006:L0-L3** ADR 0009 says generic record forms are substrate, not a substitute for field-tested guided protocols. **R-ADR0009:L0-L4**

Minimum full-gate browser controls:

1. **Record identity and proposed material**
   - selected record short ID/title/body;
   - truth layer;
   - current canon status;
   - source/origin links;
   - severity facets and definitions;
   - seed audit status/link when present.

2. **Steward admission decision**
   - final canon status selector: accepted, accepted with constraints, localized, contested, quarantined, branch-only, rejected, or any status allowed by server status-transition policy;
   - ordered admission operations selector/reorder control;
   - optional title/body edits if the gate permits steward wording repair before admission;
   - explicit “hold/defer” behavior that parks the record at `under review` without pretending gate completion happened.

3. **Written full-gate substance**
   - consequence text, required for full gate;
   - dependencies/prerequisites summary;
   - costs/access/bottlenecks;
   - shock-cone summary;
   - evidence/belief note;
   - contradiction risk;
   - mystery risk / protected mystery boundary;
   - temporal/spatial pass notes for severe work;
   - branch implication note;
   - aesthetic/method residue note;
   - QA follow-up note.

4. **N/A and quiet-domain declarations**
   - named gate items that can be marked not applicable only with reasons;
   - quiet domains that can be declared quiet only with explicit declaration;
   - no checkbox-only “done” states.

5. **Constraint tags and follow-up debt**
   - constraint tag add/remove controls;
   - follow-up debt composer scoped to propagation or the relevant method domain;
   - debt preview in write intent.

6. **Prompt-out advisory loop**
   - mode switch and prompt packet preview within the same active decision;
   - copy/export current packet only when packet identity matches current mode/record/step;
   - paste/store advisory response;
   - disposition controls;
   - explicit advisory-use selection for completion;
   - no inferred use from pasted responses.

7. **Close preview and recovery**
   - before-submit write preview: card status change, gate result, operation events, constraint facets, advisory-use links, debt, flow completion/resume state;
   - after-submit read-side trail: Current Canon, Audit Trail, record detail, advisory artifacts, skip records, canon debt, export;
   - invalid submit errors rendered at/near fields with entered material preserved.

The complete button should read in steward language, not internal transport language. Example labels: “Complete full gate and update canon standing,” “Hold under review,” “Reject through Admission,” and “Save gate draft” if draft persistence is implemented.

## 3.3 Server contract change: small path vs better path

The current server completion payload is serviceable for a first executable route, but it is thin relative to the field-observed full-gate obligations. It captures consequence text, operations, n/a reasons, quiet-domain declarations, follow-up debt, constraint tags, status, and advisory ID. **R-AdmissionFlow.ts:L3950-L3975** It serializes a compact `gate_result` body with those items. **R-AdmissionFlow.ts:L4015-L4036**

That can close the immediate “no button exists” failure, but it risks converting a rich gate into a single prose blob plus arrays. The better implementation is still not a methodology change; it is a server contract refinement:

### Recommended contract shape

Add a server-owned `fullGate` block to `AdmissionDecisionPayload` and to the gate endpoint response:

```ts
fullGate: {
  path: "full_gate";
  recordId: number;
  action: { method: "POST"; href: "/api/admission/gate/complete" };
  draft?: AdmissionFullGateDraft;
  sections: AdmissionFullGateSection[];
  allowedStatuses: CanonStatusOption[];
  allowedOperations: AdmissionOperationOption[];
  validations: AdmissionGateValidationRule[];
  writePreview: AdmissionGateWritePreview;
}
```

Where `AdmissionFullGateSection` names the actual gate decisions and whether each is required, optional, severity-dependent, n/a-capable, quiet-domain-capable, or advisory-only. The browser renders from that structure. The server validates by the same structure.

Do **not** let the browser hard-code “severe means these sections” or determine which quiet domains are owed. It can render local state, but server policy owns gate path and blockers.

### Persistence options

There are two viable implementation depths:

1. **Minimal executable slice:** keep current schema and route shape, add browser fields, submit to existing route, and serialize additional gate sections into `consequenceText` or `body` while retaining explicit arrays for n/a/quiet/follow-up. This closes field blocking fastest but gives weaker resumption and audit granularity.
2. **Preferred hardening slice:** introduce structured gate response sections inside the server payload and persist them in the `gate_result` record body as a stable sectioned report. No new record type is required because `R-AdmissionSpec` already says no new record types are needed and full gate completion writes a `gate_result`. **R-AdmissionSpec:L9-L17** If durable draft/resume is needed before completion, use `flow_instances.state` or a flow-owned store, not browser storage, because ADR 0008 and the data principles keep durable flow state in the world file. **R-ADR0008:L0-L4; L8-L11**

Strong opinion: choose the preferred hardening slice unless implementation time is truly constrained. Field Build 03 is the first severe gate frontier. If the app encodes the full gate as a single textarea and a few arrays, the next field build will likely hit “gate technically executable but not replacement-grade.” The browser must make the method easy enough to perform, not merely post a JSON payload.

## 3.4 Validation and error recovery

Server validation must remain authoritative. Browser validation may preflight but must not be the source of truth.

Validation rules required before close:

- reject empty ordered operations;
- reject missing written consequence for full gate;
- reject blank n/a reasons;
- reject blank quiet-domain declarations;
- reject illegal status transition;
- reject final completion when a required gate section is empty and not explicitly n/a with reason;
- reject advisory-use link IDs that do not refer to advisory artifacts in the same world/step or that the steward did not explicitly select.

UI recovery should follow the external validation research: validation errors should explain what went wrong and how to fix it, be associated with the failed input, and preserve what the user already entered. **EXT-GOVUK-Errors** Dynamic status changes such as “packet stale,” “advisory stored,” or “gate completed” should be visible without relying only on layout position; accessible status messages should be available to assistive technologies without moving focus unnecessarily. **EXT-W3C-Status** This external guidance supports the repository’s own W-8 requirement that blockers and action failures be visible at the decision point. **R-GuidedUsability:L3-L6; R-CreationSpec:L24-L24**

## 3.5 Acceptance/proof for the primary package

Close this package only when all of the following are true:

1. **Server proof**
   - route rejects missing full-gate substance;
   - route accepts a valid severe gate;
   - route writes a `gate_result` report;
   - route updates canon status through legal transition only;
   - route records ordered Admission operation events;
   - route writes constraint tags;
   - route creates follow-up debt when supplied;
   - route links selected advisory artifact only when explicitly named;
   - route completes or parks the Admission flow as appropriate.

2. **Browser proof**
   - routed Admission destination renders the full-gate form after severe classification and seed audit;
   - invalid submit shows field-specific errors and preserves entered text;
   - complete/hold/reject paths are reachable without leaving the guided destination;
   - no generic record editor is needed;
   - read-side trail is shown after completion;
   - legacy stacked workspace does not compete with the routed decision point.

3. **Field proof**
   - a fresh-world walkthrough reaches the same frontier as Field Build 03 and completes at least one severe full gate through the browser;
   - screenshots cover before validation, validation failure, valid completion, resulting record detail/current canon/audit trail, and linked gate result;
   - the exported/copyable evidence packet names the exact advisory artifact, if one was used;
   - coverage ledger records the capability honestly without promoting global Admission maturity beyond the exercised severe-gate path.

---

# 4. Separate prompt-out hardening package

Prompt-out hardening should be a separate package from executable full gate, but the full-gate blocker must include a minimum advisory loop because P-03 happens at the same active decision. The clean slicing is:

- **Package A:** Full-gate executable form with minimum in-place Prompt-out lifecycle.
- **Package B:** Cross-flow Prompt-out atomicity and Creation non-premise Proposal semantics.

## 4.1 Mode/body atomicity

### Diagnosis

Field Build 03 could not trust what it was copying out. The selected mode, visible packet body, and extracted packet did not move together. **R-FB03:L9-L12** That corrupts field evidence: the steward thinks they are sending a pressure request but may send a stale proposal request, or vice versa.

The prompt-out spec already states the correct rule. A loaded/copied prompt status is scoped to exact packet origin, including world path, flow key, run/record, step key, mode, decision label, and creation time or packet hash. It must clear or render as stale when the active decision, selected record, step, mode, packet, seed parking state, or world changes. **R-PromptOutSpec:L29-L32**

### Intended change

> **Auditor correction:** the browser already has this identity object — `LoadedPromptOrigin` (`main.tsx:906`), compared via `promptOriginsMatch` (`main.tsx:1043`), driving a stale/current status panel (`main.tsx:1069-1096, 1841-1862`). The gap is narrower than "introduce identity": the copyable **body** (`promptText`, a standalone global at `main.tsx:1635`, rendered at `main.tsx:1019`/`5016`) is **not bound** to that identity, so the status can read "stale" while the body and copy still serve the prior packet. Read `PromptPacketIdentity` below as "extend/enforce `LoadedPromptOrigin`," and the real deliverable as: make the visible/extractable body and the copy affordance derive from the existing origin and clear/disable on mismatch.

Extend the existing browser-side origin (`LoadedPromptOrigin`) into the single source of truth for:

- selected mode;
- visible packet body;
- extracted/copyable packet body;
- loaded status text;
- copy button enabled/disabled state;
- advisory paste/store action context;
- disposition action context;
- explicit advisory-use selection.

Minimum identity fields:

```ts
interface PromptPacketIdentity {
  worldPath: string;
  flowKey: string;
  flowId?: number;
  selectedRecordId?: number;
  selectedSectionHeading?: string;
  stepKey: string;
  mode: "proposal" | "pressure";
  templateKey: string;
  decisionLabel: string;
  admissionLevel?: string;
  workScale?: string;
  packetHash: string;
  createdAt: string;
}
```

Rules:

- Changing mode clears the existing packet body unless the new packet has already been generated for the exact identity.
- Changing selected section clears or marks stale every packet tied to the prior section.
- Changing record clears or marks stale every packet tied to the prior record.
- Changing severity clears or marks stale Admission packets whose severity context changed.
- Changing world clears all prompt packet state.
- Copy/export is disabled when the visible packet identity does not match the active controls.
- The stale state must name the prior origin: “Loaded packet is from World premise / pressure / KER-1 / 10:42; current decision is Core promise / proposal.”

This is not just “reset state on dropdown change.” It is packet provenance in the UI.

### Tests

- Browser test: select World premise pressure, generate/copy; switch to Core promise proposal; assert old body is gone or visibly stale and cannot be copied as current.
- Browser test: select Ordinary-life proposal; generate; switch to Pressure; assert proposal body cannot be copied under pressure controls.
- Browser test: after seed parking, decomposition pressure cannot show kernel-only or prior section packet as current.
- Browser test: switch world; assert no prompt loaded status survives.
- Server test: generated packet metadata includes enough identity to support these comparisons.

Use visible status updates in the UI. Nielsen Norman’s system-status heuristic is a useful external acceptance lens: users need timely feedback about system state. **EXT-NNG-Status** W3C status-message guidance sharpens how those updates should be exposed accessibly. **EXT-W3C-Status**

## 4.2 Non-premise empty-section Proposal mode

### Diagnosis

Field Build 03 selected Core promise and Proposal mode before authoring material, but loading was disabled with a message that the section must be saved first; stale World premise pressure remained visible. **R-FB03:L12-L14**

The repository authority says this should not happen:

- Proposal prompts are available at every decision point except the world essence / World premise exception. **R-CanonSovereignty:L3-L6**
- Prompt-out spec explicitly says the essence exception refuses Proposal for the Creation kernel World premise only; other kernel sections and later Creation decision points may offer Proposal mode. **R-PromptOutSpec:L23-L26**
- Creation flow says selected-section prompt grain carries the selected heading and that proposal mode asks for candidates for that section; pressure challenges authored material. **R-CreationSpec:L29-L30**

> **Auditor correction — the root cause is client-side, not the server.** The server already permits Proposal for non-premise sections: `proposalAvailable = !proposalBlockedByEssence && promptRecordId != null` (`creation-flow.ts:448-449`), with the essence refusal correctly scoped to `kernel:World premise` only (`creation-flow.ts:211`). Emptiness of the selected section never enters that condition. The field block ("waits for the selected section to be saved") is a **client** gate, `creationPromptOutBlockedByLocalSection` (`main.tsx:1760-1762`): it is *mode-agnostic* (it blocks pressure too) and fires when the locally-picked heading differs from the server's persisted `current_step`-derived section (or an unsaved held draft exists) — not because Proposal is refused. Compounding it, the server derives the target section solely from persisted `flow.current_step` (advanced only on save), so a *selected-but-unsaved* Core promise resolves on the server to the last-saved section (World premise) — which would then trip the essence refusal. So "Core promise Proposal before save" needs (1) loosening the client gate for proposal and (2) the server accepting a target section from the request instead of only `current_step`; this plan should name that decoupling explicitly.

There is also one genuine downstream *doc* ambiguity: the sentence at `creation-flow.md:L54` ("Prompt-out is offered ... only after steward-authored material exists or with a blocker") is correct for pressure and the World premise essence blocker, but misreads onto non-premise proposal. Clarify it downstream (§5.6). The package and principle layer do not need amendment. Note the doc fix alone does **not** close P-02 — the code fixes above must ship with it.

### Intended change

> **Auditor correction:** the "Server mode availability" rows below already describe *current* server behavior (proposal allowed for non-premise, essence refused, pressure gated on material). Treat them as the invariant to preserve — the server needs no availability change *except* to accept a target section from the request (§6.1). Put the actual fix in the **web layer** (the `creationPromptOutBlockedByLocalSection` gate) plus that server section-plumbing. Also note current pressure gating keys on *whole-kernel* material (`creation-flow.ts:208-209`), not the selected section.

- Server mode availability:
  - World premise + Proposal + empty/authored: refuse with essence exception blocker.
  - Non-premise kernel section + Proposal + empty: allow generation.
  - Non-premise kernel section + Pressure + empty: block with “pressure requires steward-authored material.”
  - Non-premise kernel section + Pressure + authored: allow generation.
- Packet content for empty non-premise Proposal:
  - selected section heading;
  - app-owned section obligation/template prompt;
  - kernel summary if available;
  - explicit statement that the selected section is empty;
  - request for labeled candidates with alternatives/assumptions;
  - forbidden moves and advisory boundary;
  - no canon standing/truth-layer assignment.
- Browser behavior:
  - mode selector shows Proposal available for Core promise, Starting scale, Genre/tone/consequence-mode commitments, Foundational facts, constraints, mysteries, pressures, and Ordinary-life promise before section authoring;
  - Pressure disabled until authored body exists;
  - stale packet body cleared immediately.

### Tests

- Server Creation prompt generation: Core promise + Proposal + empty returns packet.
- Server Creation prompt generation: World premise + Proposal returns blocker naming essence exception.
- Server/browser: Core promise + Pressure + empty returns blocker and no stale packet.
- Browser: generated Core promise Proposal packet contains selected heading and advisory warning.
- Cold LLM smoke: proposal packet can draft candidates for the selected non-premise section while respecting advisory/canon boundary.

## 4.3 Loaded status identity

Loaded status must be treated as a packet-state object, not a sentence. The existing `main.tsx` type already sketches a `LoadedPromptOrigin` with fields like world path, flow key, flow id, record id, step key, mode, template key, decision label, created time, and severity facets; the bug is that the active UI state can still show stale body/status combinations. The fix is to enforce origin comparison everywhere the body, status, and copy button render.

Acceptance:

- Current loaded status includes mode, flow, record/section, step, template, severity if Admission, and packet hash or generated timestamp.
- Stale status labels prior origin and is not styled as current.
- Copy action uses only the current packet object, never a global `promptText` that can outlive its origin.
- Assistive status text announces current/stale transitions.

## 4.4 Full-gate advisory artifact loop

### Diagnosis

The app tells the steward pasted responses remain advisory artifacts, but the active full-gate decision does not expose the response capture loop. **R-FB03:L23-L25** The server Prompt-out step lifecycle exists: actions include generate, store advisory, disposition, and skip; store/dispose handlers exist. **R-PromptStepActions.ts:L1009-L1017; L1227-L1234; L1259-L1354** ADR 0007 says Prompt-out owns the lifecycle and never infers advisory use from pasted response existence. **R-ADR0007:L0-L10**

### Intended change

Inside the active Admission full-gate decision point:

1. Show available modes and blockers.
2. Generate/load the current packet with full packet identity.
3. Provide copy/export current packet.
4. Provide paste response textarea tied to current packet identity.
5. Store pasted response through `storeAdvisory` action and render returned advisory artifact short ID.
6. Provide disposition selector using output labels.
7. Provide “Use this advisory in gate decision” checkbox or selector that supplies `advisoryRecordId` to full-gate completion.
8. Make advisory use explicit: artifact existence alone never links it to gate completion.
9. In write preview, show whether advisory-use link will be written.
10. In read-side trail, show advisory artifact and `cites_advisory_artifact` / equivalent derivation link.

This directly implements `R-CanonSovereignty`: pasted LLM responses are immutable advisory artifacts, type-separate from canon records; explicit steward use creates provenance links; the app never parses pasted response into a canon field. **R-CanonSovereignty:L1-L14**

NIST AI RMF’s govern/map/measure/manage framing is useful external support for this provenance loop: AI-assisted decisions need repeatable governance and accountability artifacts, but the repo’s canon-sovereignty principle is the stronger local authority. **EXT-NIST-AIRMF**

---

# 5. Docs/spec implications

## 5.1 Methodology package: no change

Do **not** amend `docs/worldbuilding-system/` for Field Build 03.

Reason:

- Field Build 03 explicitly says “No methodology-source finding”; the method was actionable and the remaining blockers are app encoding and prompt-out state projection. **R-FB03:L37-L39**
- The package’s canon admission protocol, truth/canon governance, AI-assisted workflow, canon fact gate checklist, frontloaded seed audit checklist, and templates already require the kind of governed substance the app failed to expose.
- The failures are downstream: the browser cannot execute the already-known full gate, and Prompt-out state can lie about which packet is current.

Change altitude: app/spec/code, not package doctrine.

## 5.2 Principles: no change

Do **not** amend principles. They already cover the case:

- W-7 says gates demand substance, not clicks. **R-WorkflowPrinciples:L10-L11**
- W-8 says guided flows are decision-point surfaces, not naked forms or route existence. **R-GuidedUsability:L1-L4**
- W-1 says Prompt-out is part of the decision point and proposal is available except the world-essence decision. **R-WorkflowPrinciples:L12-L14; R-CanonSovereignty:L3-L6**
- P-2/T-5 says advisory artifacts are immutable, separate from canon, and explicit use must be linked. **R-CanonSovereignty:L1-L14**

Field Build 03 is an implementation conformance failure against these principles, not a contradiction in them.

## 5.3 ADRs: no change

Do **not** amend ADRs. The current ADRs are exactly the right boundary:

- ADR 0006: server-side Admission owns gate policy; browser consumes server shapes. **R-ADR0006:L0-L7**
- ADR 0007: Prompt-out lifecycle is server-side and step-oriented; no inferred advisory use. **R-ADR0007:L0-L10**
- ADR 0008: durable flow state belongs in the world file / flow-owned stores, not browser storage. **R-ADR0008:L0-L11**
- ADR 0009: browser guided-flow surface must expose the method’s decision sequence; generic CRUD cannot close a guided-flow issue. **R-ADR0009:L0-L4**

Implementation should conform to these ADRs. No architecture exception is needed.

## 5.4 Admission spec: narrow amendment after design

`docs/specs/admission-flow.md` is already mostly sufficient. It requires severity facets, full gate path, written substance validation, full gate result, prompts, doctrine at point of use, full gate browser contract, and tests. **R-AdmissionSpec:L5-L7; L9-L16; L20-L27**

Recommended narrow amendment:

- Add a concrete “Executable full-gate browser form” acceptance clause under the Decision-Point UI Contract.
- State that browser projection of obligations is not enough; the routed Admission destination must expose the server-returned complete action and all required full-gate draft controls.
- State that invalid server responses render at/near fields and preserve draft state.
- State that full-gate advisory artifact use is selectable only from stored artifacts and is never inferred.

This is downstream spec precision, not methodology change.

## 5.5 Prompt-out context spec: no doctrinal change, but acceptance tightening

`docs/specs/prompt-out-context-assembly.md` already contains the exact loaded-status identity rule needed for P-01. **R-PromptOutSpec:L29-L32** It already defines proposal/pressure modes, lifecycle, advisory artifacts, dispositions, explicit advisory-use links, and the essence exception. **R-PromptOutSpec:L23-L28**

Recommended narrow amendment:

- Add browser acceptance language: visible packet body, extracted/copyable packet body, loaded status, and action URLs must all derive from the same packet identity object.
- Add explicit anti-pattern: changing mode while retaining a prior packet body as copyable current content is a defect.
- Add full-gate example: changing Admission severity or moving from queue selection to full gate invalidates prior queue-severity packet status.

> **Auditor note:** most of this is already doctrine at `prompt-out-context-assembly.md:L93-95` (loaded status is scoped to packet identity and "clears or renders as stale ... [when] the prompt mode changes to a different packet"). The only genuinely *new* element is naming **action URLs** as part of the shared identity object; the anti-pattern and severity/full-gate example are illustrations of the existing rule. Keep the amendment minimal (or skip it) — the value here is implementing/testing the existing rule, which this section already concedes.

Do not change Prompt-out doctrine. Implement and test it.

## 5.6 Creation spec: narrow clarification for Proposal availability

`docs/specs/prompt-out-context-assembly.md` clearly says only the World premise essence section refuses Proposal and other kernel sections may offer Proposal. **R-PromptOutSpec:L25-L26** `docs/specs/creation-flow.md` says selected-section proposal asks for candidates for that section. **R-CreationSpec:L29-L30**

But the sentence at `creation-flow.md:L54` (the plan's `R-CreationSpec:L29`) can be misread as “Prompt-out only after steward-authored material exists,” which is true for pressure but false for non-premise proposal. Add one clarifying sentence:

> For kernel authoring, the steward-authored-material precondition applies to pressure mode and to the World premise essence exception. Proposal mode is available for empty non-premise kernel sections and requests labeled candidate material for the selected section.

This is a downstream spec clarification to prevent another implementation reading from reproducing P-02. **Auditor note:** this doc clarification is *necessary but not sufficient* — the observed P-02 block is code (the client selection-sync gate plus server section-derivation, §4.2/§6.1), which must be fixed alongside the sentence.

## 5.7 Methodology coverage ledger

Update `docs/methodology-coverage.md` only after implementation/evidence, and be conservative.

Suggested ledger treatment after this plan but before implementation:

- Field Build 03 validates: setup/open reset, Admission pre-severity decision projection, queue-severity prompt binding, Creation kernel persistence, seed decomposition/handoff, severe classification/full-gate contract projection, frontloaded seed audit write/link.
- Field Build 03 blocks: executable Admission full-gate completion in routed browser.
- Field Build 03 prompt-out caveats: mode/body atomicity failure, non-premise empty-section Proposal block, full-gate advisory loop incomplete.
- Do not promote Admission full-gate maturity or global Prompt-out maturity from server tests or representative prompt packets alone. The prompt-out spec itself says maturity should remain below field-validated until real field trials exercise proposal and pressure across real worldbuilding work. **R-PromptOutSpec:L36-L37**

---

# 6. Code seams and test seams to change

## 6.1 Server code seams

### `packages/server/src/admission-flow.ts`

Current capability exists, but deepen the decision contract.

Changes:

- Extend `AdmissionDecisionPayload` with full-gate executable action metadata and structured full-gate sections when `gatePath === "full_gate"`.
- Make full-gate blockers reference section keys that the browser can render beside fields.
- If retaining current `completeAdmissionGate` payload, accept richer section body fields and serialize into `gate_result` consistently.
- Validate server-side:
  - operations non-empty;
  - consequence required;
  - n/a reasons non-empty;
  - quiet-domain declarations non-empty;
  - required section content or explicit n/a reason;
  - allowed status transition;
  - advisory artifact ID belongs to same world and is explicitly provided.
- Return structured validation errors, not only one string, so browser can map failures to fields.

### `packages/server/src/http/admission-routes.ts`

Current route exists. **R-AdmissionRoutes.ts:L459-L496**

Changes:

- Keep `/api/admission/gate/complete` as the canonical complete route unless route versioning becomes necessary.
- Return typed validation error payloads with field keys.
- Ensure `/api/admission/records/:id/gate` returns both `gate` and `decisionPoint.fullGate` executable shape.
- Keep server-generated action URLs in the decision payload; browser should not synthesize them from route knowledge except as a fallback.

### `packages/server/src/prompt-out-step-actions.ts`

Current step actions exist. **R-PromptStepActions.ts:L1009-L1017; L1227-L1234; L1259-L1354**

Changes:

- Ensure action DTOs include packet identity or enough context for browser comparison.
- Ensure `storeAdvisory` records mode, step, flow, record/section context, prompt hash, and prompt text.
- Ensure disposition and advisory-use link validations reject wrong-world/wrong-step artifacts where practical.

### `packages/server/src/prompt-out.ts` and `packages/server/src/prompt-out-defaults.ts`

Changes:

- Generate non-premise empty-section Proposal packets.
- Keep World premise Proposal blocker.
- Include selected section heading and empty-state marker in packet metadata and prompt text.
- Ensure generated packet result includes a stable packet hash or equivalent identity.

### `packages/server/src/creation-flow.ts`

> **Auditor correction:** proposal availability is already correct here (`proposalAvailable`, `creation-flow.ts:448-449`; essence-scoped at `:211`). Do **not** "correct mode availability" — it is not broken.

Changes:

- Accept a **target section from the request** so proposal/pressure can address a section the steward selected but has not yet saved, instead of deriving the section solely from persisted `flow.current_step` (the coupling that makes a selected-but-unsaved Core promise resolve to the last-saved section). This is the real server-side enabler for "Proposal before save."
- Ensure selected-section prompt grain does not fall back to prior section or full-kernel packet silently.
- (Optional) Consider scoping the pressure precondition to the selected section; today `materialPresent` keys on whole-kernel material (`creation-flow.ts:208-209`).

### `packages/server/src/world-file.ts` and `packages/server/src/schema.ts`

Likely no new record type. Possible changes only if you choose durable gate drafts or structured full-gate section persistence beyond the `gate_result` body.

If you add draft persistence:

- store it in `flow_instances.state` or a flow-owned Admission store;
- migrate carefully;
- do not use browser storage as canonical state.

## 6.2 Browser code seams

### `packages/web/src/main.tsx`

Primary browser seam.

Changes:

- Add routed Admission full-gate form component under active Admission decision point.
- Render from server `decisionPoint.fullGate`, not browser-hard-coded severity policy.
- Add local draft state keyed by record/world/step.
- Add submit handler using returned complete action route.
- Add validation error rendering and field preservation.
- Add Prompt-out packet identity store.
- Replace central/global `promptText` behavior with packet-scoped state, or wrap it so it cannot render/copy without matching identity.
- Add in-place full-gate Prompt-out lifecycle controls: mode, generate, copy, paste/store, disposition, skip, advisory-use selection.
- Clear prompt state on world switch, selected section change, selected record change, step change, mode change, severity change, and packet regeneration.

### `packages/web/src/workflow-shell.tsx`

Changes only if needed to support full-gate route/destination state and status messages. Do not move Admission policy into shell.

### `packages/web/src/styles.css`

Only presentation and accessibility support:

- field error styling;
- stale/current prompt status styling;
- grouped full-gate sections;
- status-message region styling.

## 6.3 Server tests

### `packages/server/test/app.test.ts`

Extend existing HTTP coverage:

- missing operations fails;
- missing consequence fails;
- blank n/a reason fails;
- blank quiet-domain declaration fails;
- illegal status transition fails;
- severe gate valid completion writes gate result/status/operations/tags/debt/flow complete;
- valid completion with `advisoryRecordId` writes explicit advisory-use link;
- pasted advisory artifact without explicit `advisoryRecordId` does not create use link;
- `GET /api/admission/records/:id/gate` includes executable action metadata and structured blockers.

### `packages/server/test/world-file.test.ts`

Add direct invariant checks if payload expands:

- record status transition history/card history;
- `gate_result` append-only behavior;
- source/advisory/debt links;
- flow completion state.

### `packages/server/test/prompt-out-lifecycle.test.ts`

Add:

- prompt packet identity includes mode, step, record/section, severity context;
- store advisory preserves prompt text and response text;
- disposition writes label/note;
- explicit advisory-use link only when named.

### `packages/server/test/prompt-out.test.ts`

Add:

- non-premise empty-section Proposal packet;
- World premise Proposal refusal;
- pressure blocked for empty non-premise section;
- packet hash changes when section/mode/record/severity changes.

### `packages/server/test/creation-flow.test.ts`

Add selected-section Proposal availability and pressure blocker cases.

## 6.4 Browser tests

### `packages/web/src/admission-decision-surface.test.tsx`

This test must stop proving only projection. It should prove execution.

Add tests that render the routed Admission destination with a severe full-gate decision and assert:

- full-gate form controls exist;
- `Complete Gate` or equivalent current label exists;
- invalid submit errors render and preserve entries;
- valid submit calls `/api/admission/gate/complete` or returned action URL with expected payload;
- returned decision point marks flow complete or updates state;
- read-side trail is visible;
- legacy stacked workspace remains non-competing.

> **Auditor correction:** do **not** remove the existing `not.toContain("Complete Gate")` assertions. They sit on the **pre-severity** routed fixture (`admission-decision-surface.test.tsx:384`) and on the **legacy** fixture (`:419`) — both places the control *should* be absent (a gate button must not appear before severity is declared, nor in the legacy stacked workspace). Instead, **add** a new routed render test that mounts the existing full-gate fixture (`admissionDecision`, `admission-decision-surface.test.tsx:170-313`, severity `severe` / `gatePath: full_gate`) at `initialDestination="admission"` and asserts the full-gate form controls and a completion control *are* present. Execution is proven by the new positive test; the two negatives stay as guards. Removing them would let a gate button silently leak into the pre-severity or legacy surfaces.

### `packages/web/src/prompt-out-lifecycle.test.tsx`

Add:

- mode/body mismatch regression;
- stale packet status on mode/section/record/world changes;
- full-gate store advisory and disposition controls;
- explicit advisory-use selector.

### `packages/web/src/creation-decision-surface.test.tsx`

Add:

- Core promise Proposal before save generates current packet;
- World premise Proposal remains refused;
- Core promise Pressure before save blocked;
- mode switching clears stale packet.

### `packages/web/src/workflow-shell.test.tsx`

Add only routing/status assertions if full-gate form changes destination state.

### `packages/web/src/setup-open-world.test.tsx`

Keep as regression for V-REG-01; add Prompt-out state reset assertion if packet identity state lives globally.

---

# 7. Suggested PRD/issue slicing in blocker-first order

## PRD/Issue 1 — Executable Admission full gate in routed browser destination

**Classification:** app conformance/code fix; browser evidence change; blocker.  
**Target home:** `packages/web/src/main.tsx`, Admission decision contract, Admission routes/tests, browser tests.  
**Evidence anchor:** F-01. **R-FB03:L19-L22**

> **Auditor note:** the completion handler (`completeAdmission`, `main.tsx:2909`) and gate-field state already exist but are orphaned (never rendered/wired). This issue is primarily *rendering the routed form and wiring it to the existing handler/route*, plus deepening the thin single-value state into the structured gate — not a from-scratch backend or route build.

Scope:

- render full-gate form controls from server decision payload;
- submit to existing complete route;
- preserve invalid input and show field errors;
- update decision point/read-side trail after completion;
- add server and browser tests.

Acceptance:

- severe fact can be accepted/held/rejected/deferred through routed guided Admission without docs or generic CRUD;
- all required blockers enforced server-side;
- browser walkthrough proves it.

## PRD/Issue 2 — Minimum full-gate Prompt-out advisory loop

**Classification:** prompt-out app conformance/code fix; may be bundled into Issue 1 if needed to close P-03.  
**Target home:** Admission full-gate decision point; Prompt-out step actions; advisory-use link handling.  
**Evidence anchor:** P-03. **R-FB03:L23-L25**

Scope:

- in-place mode switch;
- current packet preview/copy;
- paste/store advisory;
- disposition;
- explicit advisory-use selector;
- link advisory artifact on gate completion only when selected.

Acceptance:

- browser test stores advisory, disposes it, completes full gate with explicit link, and verifies link/read-side trail;
- pasted-only advisory creates no use link.

## PRD/Issue 3 — Cross-flow Prompt-out packet identity and stale-state guard

**Classification:** app conformance/code fix; test/evidence change.  
**Target home:** browser Prompt-out state, server packet metadata, Prompt-out lifecycle tests.  
**Evidence anchor:** P-01. **R-FB03:L9-L12**

> **Auditor note:** `LoadedPromptOrigin` / `promptOriginsMatch` / a stale-vs-current status panel already exist (`main.tsx:906, 1043, 1069-1096, 1841-1862`). Scope is binding the copyable/extractable body (`promptText`, `main.tsx:1635`) and the copy affordance to that existing identity — not introducing a new identity object.

Scope:

- packet identity object;
- stale/current comparison;
- copy disabled on mismatch;
- status messaging;
- reset on world/flow/record/section/step/mode/severity changes.

Acceptance:

- impossible to copy a packet whose body does not match selected mode and active decision;
- browser tests prove stale body cannot masquerade as current.

## PRD/Issue 4 — Creation non-premise empty-section Proposal mode

**Classification:** app conformance/code fix plus narrow spec clarification.  
**Target home (corrected):** primarily `packages/web/src/main.tsx` (the `creationPromptOutBlockedByLocalSection` gate, `:1760-1762`) plus `packages/server/src/creation-flow.ts` / `prompt-out.ts` **section-selection plumbing** (accept the target section from the request); Creation browser tests; `docs/specs/creation-flow.md`. It is **not** a server mode-availability fix — the server already allows non-premise proposal (`creation-flow.ts:448-449`).  
**Evidence anchor:** P-02. **R-FB03:L12-L14**

> **Auditor correction:** the block is the client selection-sync gate plus the server deriving the section from persisted `current_step`, not a server proposal refusal (see §4.2 / §6.1).

Scope:

- allow the steward to load a Proposal packet for a **selected-but-unsaved** non-premise kernel section (loosen the client gate for proposal; have the server take the target section from the request);
- keep World premise essence Proposal refusal;
- pressure blocked until authored material exists;
- selected-section empty-state packet context.

Acceptance:

- Core promise Proposal works before save;
- World premise Proposal refused;
- stale packet cleared;
- cold packet can draft candidates without violating advisory boundary.

## PRD/Issue 5 — Coverage ledger update after evidence

**Classification:** docs/evidence change.  
**Target home:** `docs/methodology-coverage.md`; possibly walkthrough report.  
**Evidence anchors:** all V findings plus F/P fixes after implementation.

Scope:

- record Field Build 03 validations;
- record pre-fix blockers/frictions;
- after implementation, add full-gate browser evidence;
- do not promote global maturity beyond evidence.

Acceptance:

- ledger distinguishes server capability, browser projection, executable browser flow, and field-run evidence.

---

# 8. Browser/field evidence required to prove the fix

The next field build should be a direct resumption of the Field Build 03 frontier or a fresh equivalent world. It must prove the app can complete the severe full gate without opening docs or using generic CRUD.

Required walkthrough:

1. **Setup/open and route state**
   - create/open a world;
   - workflow map shows Creation active and Admission not yet earned until seeds exist;
   - verify no stale world state.

2. **Creation kernel and prompt-out**
   - World premise Proposal refusal still visible;
   - World premise Pressure packet current and copyable;
   - Core promise empty Proposal packet generates and is current;
   - mode switch stale guard shown or no stale body remains;
   - all nine kernel sections saved;
   - consequence mode saved.

3. **Seed decomposition and handoff**
   - seed decomposition writes report and proposed seed;
   - Admission handoff visible;
   - decomposition pressure packet identity current after seed parking.

4. **Admission queue/severity**
   - selected record context;
   - severity definitions;
   - `admission_level=4`, `work_scale=severe`;
   - full-gate contract appears.

5. **Frontloaded seed audit**
   - audit offered after severity;
   - audit completion writes linked `gate_result` and does not mutate seed canon standing.

6. **Full-gate validation failure**
   - attempt completion missing required consequence or n/a reason;
   - browser shows field-level errors;
   - text already entered remains;
   - status message is visible/accessibility-friendly.

7. **Full-gate Prompt-out loop**
   - generate/load full-gate pressure packet;
   - copy packet;
   - paste a cold LLM response;
   - store advisory artifact;
   - record disposition;
   - explicitly select advisory artifact for use or explicitly leave unselected;
   - write preview reflects selected choice.

8. **Full-gate completion**
   - fill written consequence, operations, status, tags, n/a reasons, quiet declarations, follow-up debt, and required severe-gate notes;
   - submit through guided Admission;
   - receive success;
   - record status updates through legal transition;
   - `gate_result` exists;
   - operation events exist;
   - follow-up debt exists when supplied;
   - advisory-use link exists only if selected;
   - flow state closes or resumes correctly.

9. **Read-side trail**
   - Current Canon, Audit Trail, record detail, advisory artifact, debt, and export are reachable as read-side views;
   - read-side views do not become mutation workflows.

Required artifacts:

- screenshots for each decision point and validation state;
- copied prompt packets for World premise Pressure, Core promise Proposal, and Admission full-gate Pressure;
- stored advisory artifact ID(s);
- exported markdown for admitted/held/rejected fact and gate result;
- coverage ledger update;
- test run output.

Do not use `/tmp` artifact files as repository evidence unless they are later tracked in the repo or uploaded as separate user-supplied evidence. Field Build 03 filenames may be evidence labels only.

---

# 9. Big-change justification, risks, non-goals, and open assumptions

## 9.1 Big-change justification

A small patch that merely adds a button to call `/api/admission/gate/complete` is tempting and wrong.

The method’s full gate is a severity-scaled decision surface. The visible app currently lists the contract but does not let the steward perform it. The repository principles explicitly reject “records, routes, stores, and server validations exist” as sufficient flow completion. **R-WorkflowPrinciples:L5; R-GuidedUsability:L1-L3** ADR 0009 rejects generic CRUD as a closure criterion for guided flows. **R-ADR0009:L0-L4**

The correct fix is bigger because it must make full-gate work executable, recoverable, auditable, and advisory-safe in the browser. That means a server-owned action contract, a structured browser form, explicit validation recovery, and integrated Prompt-out artifact handling.

This is still not a rewrite. It is an implementation of already-ratified boundaries:

- Admission owns gate policy. **R-ADR0006:L0-L7**
- Prompt-out owns advisory lifecycle. **R-ADR0007:L0-L10**
- Durable flow state belongs in the world file. **R-ADR0008:L0-L11**
- Browser guided-flow state is a first-class decision surface. **R-ADR0009:L0-L4**

## 9.2 Risks

1. **Overfitting to one severe fact.**
   - Mitigation: render from server gate sections and severity policy, not hard-coded Twentyfall facts.

2. **Turning full gate into ritual.**
   - Mitigation: require written substance, n/a reasons, quiet-domain declarations, and follow-up debt where owed; no checkbox-only completion. **R-WorkflowPrinciples:L10-L11; R-AdmissionSpec:L6-L7**

3. **Browser policy duplication.**
   - Mitigation: server decision payload owns gate shape and validation keys; browser renders and preserves local draft only.

4. **Prompt-out advisory/canon leakage.**
   - Mitigation: pasted responses stay advisory artifacts; use links are explicit; no parsing into canon fields. **R-CanonSovereignty:L1-L14; R-ADR0007:L3-L9**

5. **State explosion in `main.tsx`.**
   - Mitigation: extract full-gate and Prompt-out packet-state components once behavior stabilizes; tests should target behavior, not component names.

6. **Inaccessible dynamic state.**
   - Mitigation: use visible status text and accessible status regions for stale/current packet state and submission feedback. **EXT-W3C-Status**

7. **Coverage overclaiming.**
   - Mitigation: coverage ledger must distinguish projection, server completion, browser execution, and field evidence; no global maturity promotion from representative tests.

## 9.3 Non-goals

- No LLM API integration.
- No API keys, vendor coupling, or background model calls.
- No automatic canonization of generated text.
- No parsing pasted advisory responses into canon fields.
- No browser-owned Admission severity/gate policy.
- No generic record editor as the full-gate completion path.
- No methodology package rewrite.
- No principle or ADR amendment unless future implementation reveals a true contradiction.
- No claim that the analyzed commit is latest `main`.

## 9.4 Open assumptions

1. The browser can submit to `/api/admission/gate/complete` from the active guided destination without requiring a new route. If typed validation errors require a route response change, keep the same route and shape it better rather than adding a parallel browser-only endpoint.
2. No new record type is needed for gate result; structured gate sections can live inside the `gate_result` report body or flow state. If resumeable full-gate drafts become necessary, persist draft state in the world file, not browser storage.
3. `packages/web/src/main.tsx` may remain the initial seam, but if implementation expands substantially, extracting `AdmissionFullGatePanel` and `PromptOutPacketPanel` is likely healthier.
4. The next field build should resume the Twentyfall frontier if available, but repository evidence must not depend on `/tmp` world files or screenshots unless uploaded/tracked separately.
5. The current prompt-out spec is strong enough; only downstream acceptance wording needs tightening.

---

# Recommended close criteria

The plan is closed only when a steward can complete this sentence truthfully from the browser:

> I selected a proposed severe fact, declared its severity, completed the seed audit, filled the full canon fact gate with written substance, optionally used and linked a stored advisory artifact, chose the canon standing and ordered Admission operations, submitted the gate, and then followed the read-side trail to verify the resulting record, gate result, audit trail, debt, advisory links, and export — without opening methodology docs or using generic record CRUD.

Until that is true, Admission full-gate maturity must remain below browser-field-validated.

---

# External references

- **EXT-NNG-Status:** Nielsen Norman Group, “Visibility of System Status,” https://www.nngroup.com/articles/visibility-system-status/
- **EXT-GOVUK-Errors:** GOV.UK Design System, “Error message,” https://design-system.service.gov.uk/components/error-message/; GOV.UK Service Manual, “Validation,” https://www.gov.uk/service-manual/design/form-validation
- **EXT-W3C-Status:** W3C WCAG 2.2, Success Criterion 4.1.3 “Status Messages,” https://www.w3.org/TR/WCAG22/#status-messages; W3C WAI technique for `role="status"`, https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22
- **EXT-NIST-AIRMF:** NIST, “Artificial Intelligence Risk Management Framework (AI RMF 1.0),” https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf
