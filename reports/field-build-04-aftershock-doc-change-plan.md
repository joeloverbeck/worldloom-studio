# Field Build 04 Aftershock Doc Change Plan

**Target repository:** `joeloverbeck/worldloom-studio`  
**Target commit analyzed:** `016c07631c17ecddedfe7a17b0f8c23474bde824`  
**Freshness claim:** user-supplied target commit only; this report does **not** independently verify that the commit is the current `main`.  
**Primary pressure evidence:** `reports/field-build-04-aftershock-imposter-earth.md` at the target commit.  
**Report type:** recommendation/change-plan report; not ratified repo prose, not code patches, not published issues.

## Provenance and evidence lanes

Repository evidence in this report comes only from manifest-listed paths fetched through exact raw GitHub URLs containing the repository owner, repository name, full target commit, and exact manifest path. The uploaded manifest was used only as a path inventory. It was not used as a substitute for file contents.

External research is kept separate and is used only to shape recommendations about browser decision support, accessible form behavior, local-first state isolation, and AI-risk/advisory artifact handling. External sources are not used to assert what exists in the target repository.

The Field Build 04 report names screenshots, a world file, and cold-LLM artifacts under `/tmp/worldloom-field-build/`. Those were not in the manifest and were not fetched. Their filenames are treated only as evidence labels recorded inside the fetched report.

### Acquisition ledger summary

```text
Requested repository: joeloverbeck/worldloom-studio
Target commit: 016c07631c17ecddedfe7a17b0f8c23474bde824
Freshness claim: user-supplied target commit only; not independently verified as latest main
Manifest role: path inventory only
Repository metadata used: no
Default-branch lookup used: no
Branch-name file fetch used: no
Target-repository code search used: no
Clone used: no
URL fetch method: web.run open with full raw.githubusercontent.com exact-commit URLs
Requested file count: 136
Successfully verified file count: 136
Fetch-provenance contamination observed: no
Foreign-repository references inside fetched file contents: permitted; not a provenance check
Connector/tool namespace trusted as evidence: no
External research lane: separate from repository evidence
```

The complete URL ledger is appended at the end of this document.

---

## 1. Executive verdict

Field Build 04 is not a methodology-package failure. The pressure evidence says the source docs were actionable, and the authority sweep supports that verdict. The upstream package already says the steward owns canon judgment, propagation is a disciplined sweep rather than an automatic truth machine, AI assistance is advisory, and canon admission must remain governed. The browser failures are downstream: active-route conformance, state reset, final-review/readback trust, prompt identity, and coverage-ledger honesty.

The highest-priority change is **not** to rewrite `docs/worldbuilding-system/`. It is to stop letting representative PRD proofs overstate browser readiness after a later field run finds active-route contradictions. The documentation system should encode the distinction between:

1. **contract-visible**: the app displays a decision contract, prompt mode availability, or route shell;
2. **walkthrough-passed**: one controlled browser path completed;
3. **field-usable with docs closed**: a steward can run the actual active route without manual IDs, hidden panels, stale prompt bodies, stale form state, or console/API inspection;
4. **field-validated**: real app use has exercised the flow and its prompt/advisory artifacts without reopening blockers.

Field Build 04 reopens or reframes five items:

- **P-01:** Prompt-out packet identity remains non-atomic in active browser transitions. The fix belongs in the Prompt-out spec acceptance language and web state code, not in the package.
- **P-02:** Non-premise empty Creation Proposal remains blocked in the field path despite PRD #251 proof. The spec already says this should work; the gap is active-route code/proof, with a coverage-ledger caveat.
- **F-01:** Admission full gate can now render and submit, but it can leak stale state across worlds, expose ambiguous labels, and commit a gate result/living card pair the steward cannot trust. This is an Admission spec clarification plus app/test hardening problem.
- **P-03:** Admission full-gate pressure prompts ignore filled gate substance. This violates the existing Prompt-out rule that packet context and screen context are two renderings of one assembly; add a concrete Admission full-gate prompt requirement and implement it.
- **F-02:** Propagation queue/run entry exists, but the active workflow-shell is not the working sweep. This is a Propagation active-destination conformance gap and should demote/qualify the coverage ledger until the controls and blockers are visible in the routed destination.

The strongest documentation change is therefore a **downstream evidence-discipline update**: specs and the coverage ledger must require field-build regression mapping after representative browser proofs, especially when later pressure evidence contradicts a PRD closeout. Do not promote or leave unqualified global Prompt-out, Admission full-gate, Creation non-premise Proposal, or Propagation maturity from narrow proof artifacts.

---

## 2. Evidence classification table

| Field Build 04 item | Evidence anchor | Classification | Target home | Intended change | Correct altitude | Acceptance/proof before closure |
|---|---|---|---|---|---|---|
| **V-REG-01** full-gate controls now render and submit | Regression replay: severe full-gate form renders textareas/selectors/tags/debt/errors and completion writes status/tags/gate result | No-action validation, with caveat | `docs/methodology-coverage.md`; Admission proof notes | Preserve the validation, but describe it as partial: form existence and server completion are no longer the blocker; trustworthy final canon/audit state remains open under F-01 | Coverage ledger, not package or ADR, because this changes proof status not method doctrine | Browser test showing form renders, invalid submission preserves input, valid submission writes expected records; separately prove F-01 trust before claiming field-usable full gate |
| **P-01** Prompt-out mode/status/body disagreement | Creation kernel and seed-decomposition showed active packet body beginning with Proposal while controls/status said Pressure; Admission DOM had two packet text nodes | App conformance/code defect; spec acceptance clarification; test/evidence gap | `docs/specs/prompt-out-context-assembly.md`, `docs/specs/browser-visible-guidance-acceptance.md`, `packages/web/src/main.tsx`, prompt lifecycle tests | Make active prompt identity atomic: dropdown, loaded status, visible body, copy/store affordances, and packet hash must derive from the same active origin. Clear or mark stale packet text on world/flow/record/section/step/mode/template changes. No active route may expose more than one copyable current packet body | Prompt-out spec and browser tests, because upstream `20` already defines advisory roles; the bug is UI identity/currentness | Playwright path that changes Creation section, mode, kernel→seed step, seed parking, Admission record/severity, and world, asserting exactly one current packet body, no stale copy/store affordance, and status/body/mode agreement |
| **P-02** non-premise empty Creation Proposal blocked | Empty `Core promise` Proposal still disabled and preview/status bound to World premise pressure blocker | App conformance/code defect; coverage-ledger caveat; no package change | `packages/web/src/main.tsx`, Creation prompt-out lifecycle/generation tests, `docs/methodology-coverage.md` | Ensure Proposal refusal is limited to `World premise`/essence by selected target heading. Non-premise empty selected headings must load Proposal with empty-state context; Pressure remains blocked until steward material exists | Creation spec already says this; the active route failed to honor it. The package should not be amended because the method’s essence rule is still right | Field path from fresh world: save only World premise, select unsaved Core promise, load Proposal, verify packet identity/body names Core promise, then switch to Pressure and World premise to verify blockers/stale guards |
| **F-01** unsafe full-gate execution after form appears | Cross-world stale textareas, ambiguous quiet-domain labels, living card body stayed broad, gate result mapped fact statement to institutions text | Blocking app conformance/code defect; Admission spec clarification; accessibility/test gap; coverage-ledger caveat | `docs/specs/admission-flow.md`, `docs/specs/browser-visible-guidance-acceptance.md`, `packages/web/src/main.tsx`, `packages/server/src/admission-flow.ts`, Admission/web tests | Treat full gate as a final-write contract, not just a form. Browser state must reset by world/record/flow/contract identity. Every field label must be unique and associated. Completion must present exact payload preview. The living card rewrite policy must be explicit. Server must reject or warn when final fact body and gate fact statement diverge unsafely. Gate result sections must be keyed and read back under the correct heading | Admission spec because it owns canon admission write semantics; browser-visible acceptance because the steward must verify exact final payload; code/tests because current route can write untrustworthy state | Same-session two-world Playwright proof; accessible queries are unique; final preview equals submitted payload; API readback of current canon and gate result matches preview; intentionally wrong/mismatched payload is refused or clearly non-rewriting by policy |
| **P-03** full-gate pressure prompt ignores filled gate substance | After full-gate fields were filled, `admission_constraint_challenge` packet still contained only original broad `FAC-1` body | Prompt-out spec gap/clarification plus Admission code defect | `docs/specs/prompt-out-context-assembly.md`, `docs/specs/admission-flow.md`, `packages/server/src/admission-flow.ts`, `packages/web/src/main.tsx`, prompt tests | Full-gate pressure packets must include the current gate draft: fact statement, scope, status, operation, tags, section substance/N/A/quiet declarations, written consequence, follow-up debt, selected advisory artifacts, omissions, and whether values are saved or unsaved draft | Prompt-out spec because packet context must match decision context; Admission spec because the full gate owns the draft material | Server unit and browser tests where filled unsaved gate draft appears in packet preview/body; cold external LLM check verifies the copied packet pressures the filled gate, not the original proposal |
| **V-01** frontloaded seed audit writes and preserves seed standing | Seed audit wrote `GAT-1` linked to `FAC-1`; `FAC-1` remained proposed until gate completion | No-action validation | Coverage ledger and Admission proof notes | Keep the seed-audit validation as closed for this path | This confirms existing Admission first-decision/seed-audit work; no new doctrine | Browser/API proof stays in regression suite; no reopening unless later field use contradicts |
| **V-02** Admission can write status/tags/operation/gate result/debt | Completion produced `accepted with constraints`, tags, `GAT-2`, empty queue, `DEB-1` propagation debt | No-action validation with blocking caveat | Coverage ledger; Admission tests | Preserve write-path validation but do not claim full-gate field trust until F-01 is fixed | The write primitives work; final payload trust does not | API readback must include both the primitive writes and the exact steward-authored substance once F-01 is fixed |
| **F-02** Propagation entry exists but active workflow-shell cannot work sweep | Owed queue existed and manual IDs started flow; active destination lacked consequence/order/domain/disposition/proposal/prompt controls and reported no blockers before coverage existed | Blocking app conformance/code defect; Propagation/workflow-map spec clarification; coverage-ledger demotion/caveat | `docs/specs/propagation-flow.md`, `docs/specs/workflow-map-and-navigation.md`, `packages/web/src/main.tsx`, `packages/server/src/propagation-flow.ts`, Propagation tests | Port working sweep controls into active routed destination; add owed-debt selection; route fact/debt identity from queue; show severity-derived close blockers before content exists; expose prompt-out controls at the active decision | Downstream specs already require much of this, but active-route proof standard needs explicit “contract panel is insufficient” language | Field path from Admission-created debt to Propagation: select owed debt without manual IDs, author consequence/order/domain/disposition, surface proposal/debt/boundary, see blockers clear only when coverage owed by severity is met |
| **V-03** Propagation queue and run entry exist | `/api/propagation/queue` had `DEB-1`; run exposed coverage, six orders, fourteen domains, prompt modes | No-action validation with F-02 caveat | Coverage ledger and Propagation proof notes | Keep queue/run-entry validation; do not call active sweep decision-guided | Server contract exists, but W-8 browser surface is incomplete | API and browser entry proof remains; active-sweep closure requires F-02 acceptance |
| **Regression notes** | F-01 partially fixed; P-01 partly improved but still broken; P-02 still broken | Test/evidence change; coverage honesty | `docs/specs/browser-visible-guidance-acceptance.md`, `docs/methodology-coverage.md` | Require future PRD closeouts that address field-build blockers to include a regression mapping table: original finding, claimed proof, active-route field rerun, what remains open | Evidence discipline, not package doctrine | Closeout reports include replay evidence under the same active route, not only representative fixture proof |
| **Decision-point log verdicts** | Setup/open ok; premise mostly ok; remaining sections blocked by Prompt-out; decomposition mostly ok; severity/audit ok; full gate unsafe; propagation shell blocked | Mixed no-action validations and blocker classifications | Coverage ledger; PRD slicing | Preserve closed validations while reopening only prompt/full-gate/propagation work. Avoid resetting the whole app maturity claim | Prevents churn and avoids reopening fixed work | Regression suite includes setup/open, kernel save, seed parking, severity, audit as controls while testing open blockers |
| **Frontier state** | World stopped at Propagation flow 2; `FAC-1` accepted with constraints but living body broad; `GAT-2` unsafe; `DEB-1` open; no consequences/domains/dispositions/report | PRD/issue seed; field evidence target | PRD slicing and next field run | Next field run should resume only after F-01/P-01/P-03/F-02 are addressed or the world is rebuilt to avoid unsafe canon/audit state | This is operational planning, not methodology | New proof should either repair/replay Aftershock with corrected canon/audit state or start a clean world with the same pressure pattern |

---

## 3. Reconciliation against recent proof reports

### PRD #249 — Admission full-gate completion

**What remains valid:** PRD #249 proved the routed Admission full-gate form can render a server-owned executable contract, show keyed validation, preserve input after failed validation, let the steward explicitly cite an advisory artifact, update canon standing, create a gate result, and link records in one controlled browser path.

**What was too narrow:** It did not prove same-session cross-world reset for full-gate draft buffers; unique accessible labels for every full-gate field; exact final payload preview; living-card body rewrite policy; or section-key readback correctness after ambiguous field interaction. Field Build 04 does not erase PRD #249’s value, but it downgrades it from “full-gate trust is closed” to “full-gate primitives exist; trustworthy field execution remains open.”

**Reopened/reframed work:** F-01 should become an Admission full-gate trust PRD. The scope is not “add form fields.” The form exists. The scope is state isolation, accessibility, exact final review, living-card/gate-result consistency, and readback proof.

### PRD #250 — Prompt packet identity

**What remains valid:** PRD #250 added packet identity metadata and browser guards that can render current/stale packet bodies and disable copy/store for stale bodies in representative Creation and Admission surfaces.

**What was too narrow:** The real field path still produced active mode/body/status disagreement after multiple step transitions and exposed multiple packet text nodes. That means the identity guard exists but is not atomic across the whole active route. A proof that one packet is current in a fresh route is not enough if stale active DOM/body state can remain after section, step, flow, mode, or world changes.

**Reopened/reframed work:** P-01 should become a Prompt-out active-identity PRD. It must prove a single source of truth for mode, status, body, copy/store, and packet hash across Creation kernel, seed decomposition, Admission queue/severity, Admission full gate, and world switch.

### PRD #251 — Creation non-premise Proposal

**What remains valid:** The repo now contains a Creation spec rule that Proposal mode is available for empty non-premise selected kernel sections, while World premise remains refused and Pressure remains blocked until steward-authored material exists. PRD #251 also records a controlled browser path where empty Core promise Proposal loaded and did not auto-save or advance the flow.

**What was too narrow or contradictory:** Field Build 04 reports the active field route still left empty Core promise Proposal disabled and still bound to World premise pressure blocker state. Because the fetched baseline contains the PRD #251 proof and the Field Build 04 contradiction, the honest reconciliation is: the intended spec is right; the active-route implementation or state synchronization still has a field-path bug, or the proof did not cover the transition sequence Field Build 04 used.

**Reopened/reframed work:** P-02 should not reopen the methodology package. It should reopen browser active-route selection synchronization, auto-start/resume, stale prompt-state clearing, and proof coverage for selected-but-unsaved target headings.

### PRD #173 — Shared decision-point contract for Propagation and adopted flows

**What remains valid:** PRD #173 proved the routed browser shell can expose a shared `decision-point/v1` contract for Propagation, Stage 12, Stage 13, and QA, including current decision, prompt modes, write intent, next/resume, close blockers, and prompt preview/source manifest.

**What was too narrow:** Field Build 04 tested whether Propagation was merely contract-visible or actually workable. It found the active Propagation destination showed a contract and IDs but did not expose the actual sweep controls. A contract panel without consequence/domain/disposition/proposal/prompt controls is not a guided flow under W-8.

**Reopened/reframed work:** F-02 should become an active Propagation destination PRD. The correct acceptance target is “docs-closed steward can work the shock-cone/domain sweep from the active route,” not “the route displays a contract.”

### PRD #231, #232, #233 context

PRD #231 remains useful for routed Admission first-decision and seed-audit proof, and Field Build 04 validates those paths. PRD #232 remains useful for same-runtime world-switch reset of Creation drafts and loaded Prompt-out status, but Field Build 04 shows full-gate local state was not covered by that reset boundary. PRD #233 remains useful for Creation kernel hardening, but P-01/P-02 show that prompt state and selected target heading still need active-route regression across later transitions.

---

## 4. Documentation impact by authority tier

### 4.1 `docs/worldbuilding-system/` package

**Verdict: no package amendment now.**

The package should not absorb app-specific browser behavior. The method is storage/software-agnostic, and Field Build 04 did not find a methodological contradiction. The package already supplies the relevant obligations:

- `06_canon_fact_admission_protocol.md` and `checklists/canon_fact_gate.md` explain why a severe fact needs substantive gate work, not checkbox completion.
- `07_propagation_engine.md` and the propagation checklist/template define the shock-cone/domain sweep and stopping/disposition logic.
- `20_ai_assisted_workflow.md` keeps AI output advisory and reserves essence/premise authorship to the steward.
- Templates such as `world_kernel.md` and `propagation_report.md` remain valid source material.

**Do not add:** React state reset rules, DOM uniqueness requirements, packet hash identity mechanics, route-shell behavior, SQLite readback policy, or PRD proof standards to package files. Those are app/spec/evidence concerns.

**P-02 nuance:** Field Build 04 listed `20_ai_assisted_workflow.md` as touched because the essence exception matters. The correct action is to respect it downstream: Proposal remains refused for World premise/essence, but non-premise sections can receive advisory candidate material. That distinction belongs in `creation-flow.md` and Prompt-out app behavior, not as a package amendment.

### 4.2 `docs/principles/`

**Verdict: no principle amendment now.**

The existing principles already condemn the failures:

- `guided-workflow-usability.md` says a guided flow is incomplete unless the browser decision point shows the decision, package authority, obligations, prompt support, blockers, writes, next step, and read-side trail.
- `workflow-principles.md` says the app remembers/routes/checks while the steward judges, and that a flow is not complete merely because records/routes/stores/server validations exist.
- `canon-sovereignty.md` keeps Prompt-out advisory and forbids automatic canonization.
- `data-principles.md` allows guided surfaces to differ from stored record shape but does not allow generic/substrate editing to count as a field-tested protocol.
- `domain-fidelity.md` says the app implements the package and may feed field evidence upstream only through disciplined package amendment.

Field Build 04 does not require a new principle. It requires stricter conformance to existing W-8/W-10/P-5 expectations and better coverage-ledger honesty when a later field run contradicts representative proof.

### 4.3 `docs/adr/`

**Verdict: no ADR amendment now.**

The relevant ADRs already assign responsibility correctly:

- ADR 0006: Admission policy is server-owned; browser consumes server-returned queue/gate/severity shapes.
- ADR 0007: Prompt-out is a server-side cross-flow module; prompts are optional/advisory and pasted responses are not inferred as used.
- ADR 0008: durable flow state belongs in flow-owned persistence stores; UI state is not the canon source.
- ADR 0009: browser workflow state is a first-class guided decision surface over server-owned flow policy; generic record forms are substrate.

The defects are violations or under-implementations of those decisions, not architecture decisions needing reversal.

### 4.4 `docs/specs/`

#### `docs/specs/admission-flow.md`

**Change type:** spec clarification, not new doctrine.

Add a full-gate trust subsection under the full-gate contract / result behavior:

- The browser full-gate draft state is keyed by exact world, selected record, flow instance, severity path, and contract version; it must reset or explicitly rehydrate from the server when any key changes.
- Every gate field has a stable section key and an unambiguous accessible name. Quiet-domain declarations must include the section identity in their label, for example “Institutions and economics quiet-domain declaration,” not a generic duplicate.
- Completion shows an exact final review of the payload that will be written: living record title/body policy, truth layer/status, operation, tags, section substance, N/A reasons, quiet-domain declarations, written consequence, advisory artifact use, and debt.
- The spec must state whether the full-gate fact statement rewrites the living canon card body. If it does, the payload preview and readback must match. If it does not, the non-rewrite must be visible and the original body must remain safe for current-canon use.
- Gate result sections are keyed by server contract keys; server readback must not depend on DOM label text or textarea order.

#### `docs/specs/prompt-out-context-assembly.md`

**Change type:** spec clarification and acceptance hardening.

The current spec already says screen context and prompt packet context are one assembly. Field Build 04 shows where to make that executable:

- A rendered active packet has one active identity: world, flow/run, record, selected section, step, mode, template, severity/gate context, generated timestamp, and packet hash where applicable.
- The mode dropdown, loaded status, packet heading/body, copy button, store-advisory button, and disposition affordance must all read the same identity. If they disagree, copy/store must be unavailable and the UI must show a stale/unbound state.
- Active route DOM must not expose multiple copyable current packet bodies. Stale bodies may be visible only as clearly labeled non-copyable prior-origin evidence.
- Admission full-gate pressure context must include the gate draft, not only selected-record prose. This includes unsaved browser drafts where the steward is actively filling the gate, with clear labeling of draft-vs-saved status and omissions.
- Cold external LLM proof for prompt-out closeout must inspect the exact body copied from the active route after representative route transitions, not a separately assembled packet.

#### `docs/specs/creation-flow.md`

**Change type:** no new spec rule required; add only an acceptance note if desired.

The fetched spec already states the intended behavior: Proposal mode is available for empty non-premise selected sections, Pressure requires authored material, World premise keeps the essence exception, the selected target heading is request/decision context rather than stored flow state, and loading Proposal must not auto-save or advance state.

The change should therefore be in browser implementation and evidence, not in the rule. A small acceptance note can be added if maintainers want stronger proof wording: “The active routed Creation destination must prove this after at least one prior saved section, one stale prior packet, and one selected-but-unsaved target heading.”

#### `docs/specs/propagation-flow.md`

**Change type:** spec clarification plus active-route acceptance.

The spec already requires owed queue, run entry, shock-cone orders, domain atlas sweep, dispositions, surfaced proposals, close/result preview, prompt-out, and close blockers. Add a line making the field standard explicit:

- The routed Propagation destination must be the working surface. A contract panel that names prompt modes, IDs, counts, or close action is not sufficient unless the same active destination exposes consequence prose entry, order selection, domain sweep states, negative-domain declarations, disposition controls, surfaced-proposal routing, prompt-out controls, close-readiness blockers, and read-side preview.
- Close blockers must be meaningful before content exists. When severity-derived coverage demands a full domain-atlas sweep, the active route must say which orders/domains/dispositions are missing rather than “No server-returned blockers.”

#### `docs/specs/workflow-map-and-navigation.md`

**Change type:** small spec clarification.

Add/clarify that owed Propagation queue entries route the selected debt/fact identity into the Propagation destination. A docs-closed steward should not have to manually type `factId` or `debtId` after the map/queue already knows the owed item.

Also preserve the PRD #232 world-switch reset language but add a note that guided-flow local draft buffers include full-gate section drafts, validation/error state, and selected record/run state. Creation Prompt-out reset proof alone does not cover Admission full-gate reset.

#### `docs/specs/browser-visible-guidance-acceptance.md`

**Change type:** evidence-standard amendment.

Add a “field-build regression closure” pattern:

- When a field-build finding names a blocker, a later PRD proof must include a regression mapping table: original finding, exact active route used, representative fixture, state transitions exercised, browser evidence, API/readback evidence, cold external LLM packet evidence when Prompt-out is in scope, and remaining caveats.
- A PRD closeout that proves one fresh controlled path must explicitly state which field routes it does **not** prove.
- For data-changing canon/governance submissions, acceptance should include final review/readback evidence: the steward sees the exact payload before committing and can compare it with resulting records without console/network inspection.
- For Prompt-out, acceptance should include a negative stale-state proof: old packet bodies are not copyable after mode/section/record/step/world changes.

This is the most important documentation-system change.

#### `docs/specs/guided-flow-spec-template.md`

**Change type:** optional template refinement.

Add to Browser Acceptance Scenarios: “For retrofits closing field-build blockers, include regression replay and negative stale-state proof, not only a success-path smoke.” This prevents future specs from declaring a flow done merely because a contract is visible.

### 4.5 `docs/methodology-coverage.md`

**Verdict: update now with Field Build 04 caveats.**

Recommended ledger edits:

1. **World-scoped browser state trust row:** keep `walkthrough-passed`, but add a caveat: PRD #232 did not cover Admission full-gate section draft state; Field Build 04 found cross-world full-gate textarea leakage.
2. **Creation non-premise Proposal targeting row:** keep the PRD #251 controlled proof, but add “Field Build 04 contradicted this on the active field route; treat as field-blocked until active-route selected-heading regression passes.” Do not promote.
3. **Admission (`06`) row:** replace any broad “full-gate completion is trustworthy” implication with: “PRD #249 proves full-gate form and primitive writes; Field Build 04 opens a full-gate trust caveat for stale local state, labels, final record/gate-result divergence, and prompt context.” Maturity should remain no higher than walkthrough-passed with an open field blocker; do not call full gate field-validated.
4. **Canon fact gate and admission ledger row:** add the same F-01 caveat and specifically require exact final review/readback before full-gate field trust is claimed.
5. **Prompt-out (`20`) row:** keep `browser-exposed`; add P-01/P-03 caveats. PRD #250’s identity proof is not global active-route field validation. Global Prompt-out remains below prompt-context-complete/field-validated.
6. **Prompt-out target-heading refinement row:** add the Field Build 04 contradiction and require a rerun of the exact active route before closure.
7. **Propagation (`07`) and domain atlas (`04`) row:** demote or split the maturity. Recommended wording: “decision-contract visible / browser-exposed, active sweep field-blocked.” The PRD #173 contract panel remains evidence, but active routed Propagation is not decision-guided until a steward can work orders/domains/dispositions/proposals/close blockers from that destination.
8. **Package chapter matrix for `07` and `04`:** change field-use status from “field-tested as part of core propagation path” if it implies the current app active route is usable. Better: “method field-tested in package/system trials; current app active Propagation route has Field Build 04 blocker F-02.”

---

## 5. App/code implications needed to make the documentation concrete

### 5.1 Admission full-gate state, review, and readback

**Code seams:** `packages/web/src/main.tsx`, `packages/server/src/admission-flow.ts`, `packages/server/src/http/admission-routes.ts`, `packages/server/src/world-file.ts`.

Required implementation direction:

- Introduce a full-gate draft identity key: `worldPath`, `recordId`, `flowId` or decision-point origin, severity path, and contract section-key list. If the key changes, reset the draft or rehydrate from a server-owned draft store. Do not retain prior world/record section text.
- Generate field IDs and labels from section keys. For quiet-domain sections, the quiet declaration label must name the parent section and purpose.
- Add a final review object returned from the server or assembled from the exact submit payload and server contract. The review must be visible before “Complete and update canon standing.”
- Decide living-card body policy. Strong recommendation: for full-gate completion, require a final fact statement field that rewrites the living card body, while preserving the prior proposed body in history. If maintainers choose non-rewrite, the browser must say so and require the original body to be safe as the current canon statement.
- Server validation should treat section-key payloads as authoritative and reject missing/mismatched section keys. It should also reject ambiguous final-record/gate fact divergence unless explicitly marked as non-rewrite and policy-compliant.

### 5.2 Prompt-out packet identity and full-gate prompt context

**Code seams:** `packages/server/src/prompt-out.ts`, `packages/server/src/prompt-out-defaults.ts`, `packages/server/src/prompt-out-step-actions.ts`, `packages/server/src/admission-flow.ts`, `packages/server/src/creation-flow.ts`, `packages/web/src/main.tsx`.

Required implementation direction:

- Treat prompt body as a derived artifact of a single `PromptPacketIdentity`. Do not let dropdown state, loaded status, and body be maintained by independent local states.
- Clear current packet text on any change that invalidates identity. Stale prior packets can remain only in a labeled prior-origin panel with disabled copy/store.
- Ensure `pre.prompt-packet-text` or equivalent copy targets cannot appear multiple times as current. Test by DOM query, not just visible text.
- Extend Admission full-gate prompt generation to include gate draft state. If drafts remain local before submit, the prompt-out request must carry a typed draft payload to the server so the generated packet is still server-shaped and auditable. Label the payload as “current unsaved gate draft” in the packet.
- Keep advisory storage explicit. Do not infer advisory use from paste or prompt generation.

### 5.3 Creation Proposal availability

**Code seams:** `packages/server/src/creation-flow.ts`, `packages/server/src/prompt-out-step-actions.ts`, `packages/web/src/main.tsx`, `packages/web/src/creation-decision-surface.test.tsx`, `packages/web/src/prompt-out-lifecycle.test.tsx`.

Required implementation direction:

- Proposal availability must be keyed to selected/requested heading, not persisted `current_step` alone.
- Empty non-premise selected headings must enable Proposal load with empty-state context.
- Pressure must remain blocked for empty sections.
- World premise/essence Proposal must remain refused by selected/requested heading.
- Switching selected heading or mode after loading a packet must make the prior packet stale and non-copyable.

### 5.4 Propagation active destination

**Code seams:** `packages/server/src/propagation-flow.ts`, `packages/server/src/http/propagation-routes.ts`, `packages/server/src/workflow-map.ts`, `packages/web/src/main.tsx`, `packages/web/src/workflow-shell.tsx`.

Required implementation direction:

- The map/queue should let the steward choose `DEB-1` or an owed item and carry its fact/debt identity into the run start/resume call. Manual `factId`/`debtId` entry is not an acceptable guided path.
- The active Propagation destination must expose controls for: consequence text, shock-cone order, domain attribution, domain sweep marking, negative-domain declarations, consequence disposition, protected boundary text, assigned-debt creation, surfaced fact proposal, prompt-out load/store/disposition, skip where offered, and close/result preview.
- Server decision contract should include initial close blockers for severity-derived missing coverage before any consequences/domains/dispositions exist.
- Browser should render coverage debts as specific missing work, not “No server-returned blockers.”

### 5.5 Tests and browser evidence

Add or harden tests at these seams:

- `packages/web/src/admission-decision-surface.test.tsx`: cross-world full-gate reset, unique labels, invalid field preservation scoped to current identity, final review/readback text.
- `packages/server/test/app.test.ts`: full-gate completion rejects mismatched/missing section keys and produces keyed gate result readback.
- `packages/server/test/prompt-out.test.ts`: Admission full-gate draft appears in prompt packet; omissions label unsaved/saved state.
- `packages/web/src/prompt-out-lifecycle.test.tsx`: exactly one current packet body across mode/section/record/step/world changes; stale body non-copyable.
- `packages/web/src/creation-decision-surface.test.tsx`: active-route empty Core promise Proposal after saved World premise and stale prior packet.
- `packages/web/src/propagation-flow.test.tsx`: owed debt selection, active controls, coverage blockers before content, prompt-out controls, consequence/domain/disposition write path.
- `packages/web/src/workflow-shell.test.tsx`: map-to-destination identity carrying and no manual ID requirement for owed Propagation.

---

## 6. Suggested PRD/issue slicing in blocker-first order

### PRD A — Admission full-gate trust and readback

**Blocks:** trustworthy canon admission for severe/foundational facts.  
**Includes:** F-01 plus Admission half of P-03.  
**Issues:**

1. Full-gate draft identity/reset across world/record/flow.
2. Unique accessible field labels and stable section-key wiring.
3. Exact final review and living-card body policy.
4. Server validation/readback for keyed sections and body/gate consistency.
5. Browser/API proof and coverage-ledger caveat update.

### PRD B — Prompt-out active identity and full-gate context

**Blocks:** cold-LLM prompt trust across Creation and Admission.  
**Includes:** P-01 and Prompt-out half of P-03.  
**Issues:**

1. Single active prompt identity state machine in the browser.
2. Clear/stale behavior for route transitions and mode changes.
3. No multiple current packet bodies or stale copy/store affordance.
4. Admission full-gate draft context in `admission_constraint_challenge` packet.
5. Cold external LLM packet check after final browser route, if tooling is available; otherwise record blocked evidence honestly.

### PRD C — Creation non-premise Proposal active-route regression

**Blocks:** Proposal mode for empty non-premise kernel sections.  
**Includes:** P-02.  
**Issues:**

1. Selected-heading request path audited end-to-end.
2. Auto-start/resume and local selection synchronization.
3. Empty non-premise Proposal enabled; World premise refused; Pressure blocked for empty material.
4. Stale prior packet guard after heading/mode change.
5. Coverage-ledger update acknowledging Field Build 04 contradiction until proof passes.

### PRD D — Propagation active destination

**Blocks:** continuation beyond Admission into shock-cone work.  
**Includes:** F-02 with V-03 preserved.  
**Issues:**

1. Owed debt selection and map/queue identity routing.
2. Consequence/order/domain controls in active workflow-shell destination.
3. Disposition/debt/boundary/surfaced-proposal controls.
4. Prompt-out controls and context preview in active Propagation step.
5. Severity-derived close blockers and close/result preview.
6. Browser field proof and methodology-coverage demotion/caveat update.

### PRD E — Evidence discipline and coverage-ledger hardening

**Blocks:** future false closure.  
**Includes:** spec/ledger changes after or alongside PRDs A-D.  
**Issues:**

1. Amend `browser-visible-guidance-acceptance.md` with field-build regression closure pattern.
2. Amend `guided-flow-spec-template.md` optional retrofit proof line.
3. Update `methodology-coverage.md` rows/caveats for Field Build 04.
4. Add closeout template requirement: “what this proof does not prove.”

---

## 7. Browser and field evidence required to prove the fix

A successful closeout should include a docs-closed walkthrough that does not require source docs, console inspection, network inspection, manual SQL, or raw API manipulation except as separate readback evidence.

### Required walkthrough path

1. Open a new world in the same browser runtime after another world has existing Admission full-gate draft state.
2. Create a kernel and seed enough material to reach a severe Admission full gate.
3. Verify non-premise empty Creation Proposal can load before save; verify World premise Proposal refuses and Pressure for empty section blocks.
4. Verify Prompt-out mode/status/body/copy/store all agree after kernel completion, selected-section switches, seed parking, Admission severity, and full-gate entry.
5. Fill full-gate sections, including quiet-domain declaration, consequence, tags, operation, status, advisory artifact, and debt.
6. Load Admission full-gate pressure prompt and verify the packet contains the filled gate draft, not just original proposed prose.
7. Complete the full gate only after an exact final review.
8. Compare browser final review, living current-canon record, gate result sections, links, tags, status, and debt readback.
9. Enter Propagation from the owed debt queue without manual IDs.
10. Work at least one consequence, domain sweep item, disposition, and close blocker cycle in the active Propagation destination.

### Negative evidence required

- No prior-world full-gate draft text appears after world switch.
- No duplicate accessible labels for gate controls.
- No multiple current prompt packet bodies are present in the active DOM.
- Stale prompt bodies cannot be copied or stored as current.
- Propagation does not say “No server-returned blockers” while severity-derived coverage is missing.
- Generic substrate/API-only work does not count as a guided flow closeout.

### Cold external LLM evidence

When Prompt-out is in scope, the copied packet should be pasted into a cold external LLM session. The evidence should record whether the model could correctly identify:

- the current decision and mode;
- the selected section or gate draft under pressure;
- the advisory/canon boundary;
- forbidden moves;
- source records and omissions;
- the requested output labels.

If no cold LLM tool is available, the closeout should state that explicitly and avoid claiming prompt-context-complete evidence.

---

## 8. Online research findings shaping the recommendations

These sources shaped the browser/evidence recommendations. They are external evidence, not repository state.

1. **Accessible form labels:** W3C WAI form guidance says controls need labels that identify their purpose and that explicit label associations help browsers and assistive technologies present the right control identity. This directly supports the recommendation that “Quiet-domain declaration” labels must be unique and section-specific.  
   Source: W3C WAI, “Labeling Controls,” https://www.w3.org/WAI/tutorials/forms/labels/

2. **Error identification:** WCAG Understanding SC 3.3.1 explains that when an input error is detected, the item in error should be identified and described in text; merely redisplaying a form is insufficient. This supports keyed, near-field full-gate validation and recovery text.  
   Source: W3C WAI, “Understanding Success Criterion 3.3.1: Error Identification,” https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html

3. **Final review for important data changes:** WCAG Understanding SC 3.3.4 says data-changing submissions should be reversible, checked with an opportunity to correct, or confirmed through review before finalizing. Worldloom canon/gate writes are not legal/financial transactions, but they are important user-controlled data mutations; the same pattern strongly supports an exact final review before full-gate completion.  
   Source: W3C WAI, “Understanding SC 3.3.4: Error Prevention,” https://www.w3.org/WAI/WCAG21/Understanding/error-prevention-legal-financial-data.html

4. **Local-first state isolation:** The local-first literature emphasizes user ownership/control and local data agency. In a file-per-world app, this strengthens the expectation that browser-local buffers must not leak between world files.  
   Source: Martin Kleppmann, Adam Wiggins, Peter van Hardenberg, Mark McGranaghan, “Local-first software,” Ink & Switch, 2019, https://www.inkandswitch.com/essay/local-first/

5. **AI risk management:** NIST’s AI RMF is intended to help incorporate trustworthiness considerations into AI system design, development, use, and evaluation. For Worldloom, this supports retaining Prompt-out as explicit, inspectable, advisory artifact flow rather than adding hidden automatic canonization or inferred advisory use.  
   Source: NIST, “AI Risk Management Framework,” https://www.nist.gov/itl/ai-risk-management-framework

---

## 9. Risks, non-goals, and assumptions

### Risks

- **False maturity risk:** Leaving the coverage ledger unchanged after Field Build 04 would let future planning treat contract-visible or walkthrough-passed routes as field-ready.
- **Over-correction risk:** Moving app-specific state/reset rules into the methodology package would pollute the method with UI implementation detail.
- **Prompt trust risk:** A stale or mixed-mode packet is worse than no prompt because it gives the steward a false sense of currentness.
- **Canon trust risk:** A full-gate form that writes mismatched living card and gate report state damages the Current Canon read-side and makes later propagation work ungrounded.
- **Propagation proof risk:** API-only or lower/legacy panel propagation could accidentally bypass the exact active-route failure Field Build 04 found.

### Non-goals

- No LLM API integration.
- No automatic canonization.
- No automatic severity, truth-layer, status, operation, tag, disposition, or admission inference.
- No generic record editor as a substitute for guided flow closure.
- No direct code patch in this document.
- No final ratified replacement prose for package/spec files.

### Assumptions

- The field report’s app commit `dd5bf2a` is treated as field-run provenance; the remote-fetch baseline `016c07631c17ecddedfe7a17b0f8c23474bde824` is the repository source tree inspected for this report.
- The authoring-time seam statement in the brief is accepted only for the named seams; it is not generalized to unrelated files.
- `/tmp/worldloom-field-build/...` artifacts are not fetched; only their names and descriptions inside the report are used.
- A later implementation may choose a different living-card body policy, but it must be explicit and prove safe readback.

---

## 10. Self-check

- Required evidence and proof reports were acquired from the exact target commit.
- All requested authority groups were acquired: `docs/worldbuilding-system/` package files, `docs/principles/`, `docs/adr/`, `docs/specs/`, and `docs/methodology-coverage.md`.
- `/tmp` screenshots, cold-LLM artifacts, and world files were not treated as fetchable inputs.
- Every Field Build 04 finding and validation is classified, including regression replay, decision-point log verdicts, and frontier state.
- Methodology/package defects are separated from downstream principle, ADR, spec, coverage-ledger, app conformance, test/evidence, and PRD slicing work.
- Recent PRD proof reports are reconciled as narrow evidence, not treated as automatic closure.
- The authority order in `docs/principles/README.md` is preserved.
- No recommendation bypasses Prompt-out advisory storage, steward sovereignty, or Admission governance.
- External research claims are listed separately and used only to shape browser/evidence recommendations.

---

## Appendix A — Complete exact-commit URL ledger

```text
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/reports/field-build-04-aftershock-imposter-earth.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/reports/field-build-03-change-plan.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/reports/field-build-03-twentyfall-frontier.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/reports/prd-249-full-gate-walkthrough.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/reports/prd-250-packet-identity-walkthrough.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/reports/prd-251-non-premise-proposal-walkthrough.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/reports/prd-173-adoption-walkthrough.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/reports/prd-231-admission-first-decision-walkthrough.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/reports/prd-232-world-state-reset-walkthrough.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/reports/prd-233-creation-kernel-hardening-walkthrough.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/README.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/CONTEXT.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/methodology-coverage.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/00_overhaul_notes.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/01_core_theory.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/02_world_model.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/03_truth_layers_and_canon_governance.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/04_domain_atlas.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/05_creation_protocol.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/06_canon_fact_admission_protocol.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/07_propagation_engine.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/08_constraint_composition.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/09_temporal_and_timeline_protocol.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/10_spatial_and_geographic_propagation.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/11_agent_character_psychology.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/12_institutional_economic_and_suppression_protocol.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/13_contradiction_retcon_and_mystery.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/14_uncertainty_belief_and_evidence.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/15_branching_versioning_and_collaboration.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/16_narrative_game_and_transmedia_extraction.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/17_aesthetic_coherence_and_semiosis.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/18_quality_assurance_tests.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/19_worked_examples.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/20_ai_assisted_workflow.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/21_templates_index.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/22_glossary.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/23_research_notes_and_bibliography.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/README.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/checklists/aesthetic_coherence_sweep.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/checklists/agent_character_sweep.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/checklists/branching_collaboration_sweep.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/checklists/canon_fact_gate.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/checklists/constraint_composition_sweep.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/checklists/frontloaded_seed_audit.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/checklists/institutional_economic_suppression_sweep.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/checklists/mystery_preservation.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/checklists/propagation_sweep.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/checklists/spatial_geographic_sweep.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/checklists/temporal_timeline_sweep.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/checklists/uncertainty_evidence_sweep.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/manifest.json
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/operating_card.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/templates/action_arena_card.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/templates/admission_ledger.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/templates/aesthetic_coherence_card.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/templates/agent_character_card.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/templates/canon_branch_diff.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/templates/canon_change_proposal.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/templates/canon_fact_card.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/templates/capability_card.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/templates/collaboration_decision_record.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/templates/constraint_card.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/templates/contradiction_report.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/templates/counter_institution_card.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/templates/institution_card.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/templates/mystery_ledger_entry.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/templates/propagation_report.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/templates/spatial_region_card.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/templates/temporal_timeline_card.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/templates/uncertainty_evidence_card.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/worldbuilding-system/templates/world_kernel.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/principles/README.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/principles/canon-sovereignty.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/principles/charter.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/principles/data-principles.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/principles/domain-fidelity.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/principles/guided-workflow-usability.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/principles/workflow-principles.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/adr/0001-sqlite-file-per-world.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/adr/0002-localhost-native-process.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/adr/0003-branch-and-collaboration-schema-door.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/adr/0004-typescript-hono-react-better-sqlite.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/adr/0005-github-automation-baseline.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/adr/0006-admission-flow-module-boundary.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/adr/0007-prompt-out-step-module-seam.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/adr/0008-flow-owned-persistence-stores.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/adr/0009-browser-guided-flow-boundary.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/specs/admission-flow.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/specs/browser-visible-guidance-acceptance.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/specs/canon-workbench.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/specs/constraint-composition-flow.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/specs/contradiction-retcon-mystery-flow.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/specs/creation-flow.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/specs/guided-flow-spec-template.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/specs/institutional-economic-suppression-flow.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/specs/markdown-export.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/specs/method-cards.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/specs/prompt-out-context-assembly.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/specs/propagation-flow.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/specs/qa-flow.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/specs/schema-v1.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/specs/temporal-timeline-flow.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/docs/specs/workflow-map-and-navigation.md
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/server/src/admission-flow.ts
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/server/src/http/admission-routes.ts
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/server/src/creation-flow.ts
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/server/src/prompt-out.ts
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/server/src/prompt-out-defaults.ts
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/server/src/prompt-out-step-actions.ts
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/server/src/propagation-flow.ts
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/server/src/http/propagation-routes.ts
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/server/src/world-file.ts
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/server/src/workflow-map.ts
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/server/src/decision-point-contract.ts
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/server/src/method-cards.ts
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/server/src/schema.ts
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/web/src/main.tsx
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/web/src/workflow-shell.tsx
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/server/test/app.test.ts
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/server/test/prompt-out-lifecycle.test.ts
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/server/test/prompt-out.test.ts
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/server/test/creation-flow.test.ts
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/server/test/decision-point-contract.test.ts
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/server/test/method-cards.test.ts
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/server/test/world-file.test.ts
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/web/src/admission-decision-surface.test.tsx
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/web/src/prompt-out-lifecycle.test.tsx
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/web/src/creation-decision-surface.test.tsx
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/web/src/propagation-flow.test.tsx
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/web/src/workflow-shell.test.tsx
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/server/test/route-registry.test.ts
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/server/test/setup-open-world.test.ts
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/server/test/temporal-flow.test.ts
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/server/test/workflow-map.test.ts
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/web/src/setup-open-world.test.tsx
https://raw.githubusercontent.com/joeloverbeck/worldloom-studio/016c07631c17ecddedfe7a17b0f8c23474bde824/packages/web/src/temporal-flow.test.tsx

```
