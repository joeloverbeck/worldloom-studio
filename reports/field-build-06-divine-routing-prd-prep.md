# Field Build 06 Divine Routing PRD Prep

**Source artifact reassessed:** `reports/field-build-06-divine-routing.md` (pending local repo publication at prep time; the source report was untracked when this prep was written).
**Primary field evidence:** Field Build 06 report summary, world file and captures under `/tmp/worldloom-field-build/`, prompt packets and cold outputs under `/tmp/worldloom-field-build/cold-llm/field-build-06-*`, and prior repair evidence from `reports/prd-292-admission-propagation-handoff-replay.md`.
**Live checkout checked:** `main` on 2026-07-08. Existing worktree dirt before this prep: modified `.claude/skills/field-build/SKILL.md`; untracked `reports/field-build-06-divine-routing.md`.
**Tracker freshness:** `gh issue list --state open --limit 200 --json number,title,labels,state,url` returned `[]` on 2026-07-08.
**Deliverable status:** PRD-ready determination only. No PRDs, issues, product-code patches, spec patches, or tracker changes have been created from this prep.

## Reassessment Verdict

Field Build 06 is post-closeout evidence against the Field Build 05 blocker repair. The two prior blocking failures are fixed in the live app path:

- Field Build 05 `F-01` is closed: after severe Admission full-gate completion, `FAC-1` current living body matches the narrowed accepted gate statement while broader proposal wording remains history/provenance.
- Field Build 05 `F-02` is closed: Admission-created `DEB-1` now returns a non-null source fact and start route from the active Propagation queue, and the active UI can start `Flow 2`.

No blocking product finding remains from Field Build 06. The remaining codebase-wide product work is concentrated in prompt-out ownership and extraction:

- Stale prompt packets are safe but still visually prominent after route changes.
- A Creation seed-decomposition packet can look internally mis-bound in the visible loaded panel even when the network response body is correct.
- Admission advertises Proposal and Pressure modes but does not let the steward select Proposal from the active surface.
- Draft-aware Admission pressure packets can be visible and current in the browser, but exact extraction is fragile and direct server regeneration can produce a plausible non-equivalent packet when draft payload is absent.

Recommended first PRD seam: **Prompt-Out Active Packet Ownership, Exact Export, and Admission Mode Selection**. Treat active packet identity, stale/current display, exact packet export, and Admission prompt mode selection as one contract across the server prompt-out assembly surface and the browser guided-flow prompt preview.

Recommended follow-on PRD: **Creation Post-Park Seed Correction**. Keep it separate because it changes Creation correction behavior and provenance semantics, not just prompt packet ownership.

Recommended coverage follow-up: resume the next field build at Propagation entry and exercise Proposal/Pressure for the first shock-cone or domain decision before authoring consequences. Do not make this a product PRD unless that run finds a failure.

Supporting skill result: Domain model unchanged. No new app-layer terms are owed to `CONTEXT.md`; the terms here are existing app or package vocabulary (`Prompt-out step`, `Prompt packet`, `Admission flow`, `Creation flow`, `Propagation flow`, `canon fact`, `gate result`, `canon debt`, `shock cone`, `domain atlas`). No ADR-worthy decision is resolved by this prep; current ADRs already assign the relevant module boundaries.

External research: skipped. This prep used repo authorities, live GitHub tracker state, prior local reports, current specs, and source-tree inspection from the same session.

## Evidence Checked

Field Build 06 findings read and classified:

| Finding | Status | PRD impact |
|---|---|---|
| `V-01` setup/open world | validation | No PRD. Preserve setup/open path. |
| `V-02` premise essence refusal and pressure | validation with extraction friction | Covered by prompt-out exact export. |
| `V-03` kernel save/readback | validation | No PRD. |
| `V-04` seed decomposition writes `SEE-1` / `FAC-1` | validation with identity friction | Write path is fine; identity friction goes into first PRD. |
| `V-05` seed audit preserves standing | validation | No PRD. |
| `V-REG-01` accepted standing fixed | validation | Preserve as regression acceptance. |
| `V-REG-02` Admission debt start fixed | validation | Preserve as regression acceptance. |
| `P-01` stale prompt packets prominent | prompt-out friction | First PRD. |
| `P-02` Creation packet visible identity mis-bound | prompt-out friction | First PRD. |
| `P-03` Admission modes not selectable | prompt-out friction | First PRD. |
| `P-04` exact draft-aware packet extraction fragile | prompt-out friction | First PRD. |
| `Q-01` Propagation prompt coverage bounded | coverage question | Next field-build coverage, not product PRD yet. |
| `F-03` Creation post-park correction not reverified | carried friction | Follow-on PRD. |

Prior-art and closeout artifacts checked:

- `reports/field-build-05-affect-ledger-prd-prep.md` selected the now-fixed Admission standing and Propagation handoff blocker PRD first, leaving prompt-out active-region cleanup, Admission mode selection, Creation correction, and coverage audit as follow-ons.
- `reports/prd-292-admission-propagation-handoff-replay.md` closed the Field Build 05 blockers and explicitly excluded stale prompt-out cleanup, Admission mode selection, Creation correction, and full Propagation closeout.
- `reports/prd-268-active-packet-identity-walkthrough.md` established a prior active-packet identity contract across routed Creation and Admission, but Field Build 06 shows the contract still needs sharper UI ownership, response-derived loaded identity, Admission mode reachability, and exact draft-aware export.
- `reports/prd-269-creation-non-premise-proposal-active-route-walkthrough.md` and `reports/prd-270-propagation-active-route-replay.md` remain useful prior art for browser-visible active-route proof, but do not close the Field Build 06 prompt-out findings.

Live tracker overlap checked:

- Open GitHub issues: none at prep time.
- Relevant closed context includes PRD #267 through PRD #270 and PRD #292. The next PRD should not reopen the fixed Admission standing or debt-start blockers except as regression acceptance.

## Authority Findings

No methodology-package amendment is warranted. The Field Build 06 report says the methodology was actionable and the remaining gaps are app encoding, prompt-out identity/export, Admission mode reachability, and next-step Propagation coverage. `docs/worldbuilding-system/20_ai_assisted_workflow.md` already distinguishes Proposal and Pressure, reserves essence to the steward, and keeps AI advisory. `docs/worldbuilding-system/05_creation_protocol.md` already supplies the seed granularity rule that supports the later Creation correction PRD. `docs/worldbuilding-system/07_propagation_engine.md` already defines the Propagation frontier that `Q-01` should exercise next.

No principles amendment is warranted. Current principles are enough:

- `canon-sovereignty.md` W-1 requires prompt-out/paste-in, self-contained packets, proposal mode at ordinary decision points, and reviewable advisory material without adding an LLM API.
- `workflow-principles.md` W-1 says available prompt modes should be part of the decision point, not hidden behind manual API calls.
- `guided-workflow-usability.md` W-8 and W-9 say guided screens and prompt packets are two renderings of the same decision context; if the packet omits material visible on screen, or the UI makes the active packet ambiguous, the app has not replaced the docs.
- `data-principles.md` W-5, W-6, T-3, and T-5 support exact provenance, current/read-side clarity, and app-owned identifiers.
- `domain-fidelity.md` P-1 and T-2 require package terms and separated labels to stay exact.

No ADR amendment is warranted. ADR 0006 keeps Admission as the governance transition boundary; ADR 0007 keeps Prompt-out as the cross-flow step-oriented advisory module; ADR 0008 keeps flow-specific persistence with the owning flow modules; ADR 0009 makes browser guided-flow state a first-class surface over server-owned policy. The needed changes live inside those boundaries.

Specs should change through PRD work:

- `docs/specs/prompt-out-context-assembly.md` should define active packet ownership as a single identity tuple covering flow, world, record, section, step, mode, template, packet hash, body hash, and draft digest where applicable.
- `docs/specs/prompt-out-context-assembly.md` should require route/decision changes to clear the active prompt region or collapse prior packets into prior-origin disclosure with copy/export/store disabled.
- `docs/specs/prompt-out-context-assembly.md` should require exact visible-packet copy/download for current packets, including packet hash and draft digest/omission state.
- `docs/specs/prompt-out-context-assembly.md` should require direct generation to reject or explicitly mark missing draft payload for draft-aware pressure packets rather than returning a plausible incomplete packet.
- `docs/specs/admission-flow.md` should require a visible Admission prompt mode selector wherever Proposal and Pressure are both advertised.
- `docs/specs/creation-flow.md` should require loaded seed-decomposition prompt status to come from the generated response identity, not from stale selected-section UI state.
- `docs/specs/browser-visible-guidance-acceptance.md` should remain the checklist source for the PRD's browser-visible guidance mapping.

## Recommended First PRD

### PRD - Prompt-Out Active Packet Ownership, Exact Export, And Admission Mode Selection

**Purpose:** Make the active guided-flow prompt packet a trustworthy, extractable, mode-selectable object across Creation, Admission, and Propagation.

**Sources:** Field Build 06 `P-01`, `P-02`, `P-03`, and `P-04`; Field Build 05 carried `P-01` and `P-04`; PRD #268; PRD #292 closeout exclusions; `docs/specs/prompt-out-context-assembly.md`; `docs/specs/admission-flow.md`; `docs/specs/creation-flow.md`; `docs/specs/browser-visible-guidance-acceptance.md`; `docs/worldbuilding-system/20_ai_assisted_workflow.md`; ADR 0007; ADR 0009.

**Problem:** The app prevents some unsafe stale-packet use, but it still makes the steward do too much identity auditing by hand:

- A stale Admission packet can remain visually dominant after the active route changes to Propagation.
- Creation seed-decomposition prompt status can show a contradictory mix of decomposition step identity and prior kernel-section identity.
- Admission exposes available Proposal/Pressure modes in data but gives the active user only one load action that picks Pressure.
- Draft-aware Admission pressure packets can be correct in the browser but hard to extract exactly, and direct regeneration can silently drop draft fields.

**Recommended product rule:** A guided-flow screen has at most one active current prompt packet. That packet is current only when its displayed body and loaded status come from the same generated response identity and match the active flow, world, record, step, section, mode, template, packet hash, body hash, and draft digest. Prior-origin packets may be retained as evidence, but not as the active packet body and not as copyable/exportable current material.

**Scope:**

- Update prompt-out specs so active packet identity, stale ownership, exact copy/download, and draft-aware generation semantics are explicit.
- Update Admission specs so Proposal and Pressure are both user-selectable from the active Admission surface whenever both are advertised.
- Update Creation specs so seed-decomposition prompt status is response-derived and internally consistent.
- Update the web prompt preview so route, record, section, step, mode, template, hash, body, and draft digest changes clear the active region or collapse prior packets into prior-origin disclosure.
- Update the web prompt preview so stale, unbound, or internally inconsistent packets cannot be copied, downloaded, stored, or presented as current.
- Add `Copy packet` and `Download packet` affordances for the exact currently displayed packet. The copied/downloaded body should include a small manifest naming flow, record, step, mode, template, packet hash, body hash, and draft digest/omission state.
- Add an Admission prompt mode selector parallel to Creation and Propagation. The selected mode must drive the active prompt-out step request and generated packet identity, and the UI must show selected mode, loaded mode, source record, template, and packet hash beside the load action.
- Tighten server-side prompt-out generation so draft-aware Admission pressure requests without the required draft payload reject or return an explicit incomplete-draft marker, never a plausible pressure packet that looks equivalent to the current browser packet.
- Preserve Field Build 06 validations for accepted standing and Propagation start as regression proof, but do not rebuild those fixed contracts.

**Acceptance:**

- Browser replay starts from a fresh world or equivalent fixture and walks Creation kernel, seed decomposition, Admission full gate, and Propagation entry.
- Creation seed-decomposition Proposal loads with loaded status and body identity both naming `creation`, the decomposition step, the selected seed-decomposition record, Proposal mode, and the same packet hash. It does not display a prior kernel section as the packet's active section.
- Navigating from Admission to Propagation clears the active prompt body or collapses the prior Admission packet behind prior-origin disclosure. The prior packet remains labeled stale and is not copyable, downloadable, storable, or shown as the active Propagation packet.
- Admission full gate exposes a visible Proposal/Pressure selector when both modes are advertised.
- Loading Admission Proposal and Admission Pressure from the selector produces packets whose visible source manifest, mode, template, source record, and hash match the selected mode.
- The exact visible current Admission pressure packet can be copied and downloaded without browser devtools or network-response scraping.
- Copied/downloaded packet material includes packet hash and draft digest or explicit draft omission state.
- A direct server prompt-out request for a draft-aware Admission pressure packet without required draft payload rejects or marks the packet incomplete rather than generating a plausible non-equivalent packet.
- Current copy/download controls are disabled for stale, unbound, incomplete, or internally inconsistent packets.
- Browser-visible guidance checklist mapping is present in the PRD body before publication, because this PRD touches guided flows, prompt-out, browser workflow navigation, advisory/canon separation, and record-writing readback indirectly.
- Parent closeout runs the canonical root gates: `pnpm test`, `pnpm typecheck`, and `pnpm build`. Narrow slices may use focused package gates first, but parent closeout should run all three.

**Likely issue slices:**

- Spec update for active packet ownership, exact export, Admission mode selection, and draft-aware direct generation semantics.
- Browser active-packet ownership and stale/prior-origin display cleanup.
- Creation seed-decomposition loaded-status identity fix.
- Admission prompt mode selector and source manifest.
- Exact current packet copy/download, with manifest metadata and stale/unbound disablement.
- Server draft-aware prompt generation hardening.
- Browser/API replay report proving the Field Build 06 path and preserving Field Build 05 blocker regressions.

**Out of scope:**

- Built-in LLM API calls, automatic AI adoption, or any change to prompt-out/paste-in doctrine.
- Reworking the already-fixed Admission standing text or Admission-created Propagation debt start contract, beyond regression proof.
- Creation split/retract/rewrite after parking.
- Completing Propagation shock-cone or domain-atlas authoring.
- Methodology, principle, or ADR amendments.

## Follow-On PRD Candidate

### Candidate 2 - Creation Post-Park Seed Correction

**Purpose:** Let the steward respond when prompt-out critique reveals an over-bundled or poorly shaped seed after Creation has already parked it as proposed material.

**Sources:** Field Build 06 carried `F-03`; Field Build 05 `F-03`; `docs/specs/creation-flow.md`; `docs/specs/admission-flow.md`; `docs/worldbuilding-system/05_creation_protocol.md`; prior Creation work around PRD #269.

**Problem:** Creation can park a proposed seed and hand it to Admission, but if prompt-out critique later reveals that the seed should have been split, retracted, or narrowed, the active app does not yet provide a first-class correction path.

**Recommended product rule:** After a seed is parked, Creation should still offer governed correction actions when critique reveals bad granularity. The correction must preserve provenance and must not silently change canon standing; Admission still owns first canon acceptance.

**Scope:**

- Add explicit actions after parked-seed critique:
  - split the parked seed into sibling proposed facts;
  - retract or rewrite the parked proposed fact before Admission begins;
  - carry a named Admission narrowing note when the steward intentionally defers narrowing to Admission.
- Preserve provenance from kernel, original seed-decomposition report, parked fact, replacement or sibling facts, correction report, and Admission queue entries.
- Keep correction readback visible in Creation handoff and Admission intake.

**Recommended default for the future PRD:** Use an append-only seed-decomposition correction report plus history-preserving proposed fact updates before Admission work has begun. If Admission has already begun, prefer superseding/re-proposing rather than mutating the in-flight fact.

**Acceptance:** A prompt-out critique that flags bundling lets the steward split, retract/rewrite, or carry an Admission narrowing note. Split facts appear as sibling proposed facts in the Admission queue with source links. Retracted/rewritten material remains auditable. Narrowing notes stay advisory until Admission acts.

## Coverage Follow-Up

### Field-Build Coverage - Propagation Prompt Coverage From Flow 2

**Purpose:** Resolve Field Build 06 `Q-01` by continuing from the Propagation entry frontier.

**Scope:** Resume at the Propagation owed run created from `FAC-1` / `DEB-1`, verify source fact, owed debt, shock-cone orders, and domain-atlas obligations, then exercise Proposal and Pressure for the first shock-cone or domain decision before authoring consequences.

**Acceptance:** The next field-build report states whether Propagation Proposal and Pressure packets are self-contained, correctly bound, source-manifested, copy/exportable, and useful to a cold LLM. Product work should be opened only for failures found there.

## Rejected Or No-Op Alternatives

- **Reopen the Admission standing and Propagation debt blocker PRD.** Rejected. Field Build 06 validates both blocker repairs. Preserve them as regression acceptance only.
- **Amend the methodology package.** Rejected. The report names no methodology-source finding; the package was actionable.
- **Add a new principle.** Rejected. Existing prompt-out, workflow, guided-usability, data, and domain-fidelity principles already cover the behavior.
- **Add or amend an ADR.** Rejected. The current Admission, Prompt-out, persistence, and browser-flow ADR boundaries are sufficient.
- **Split P-01 through P-04 into four unrelated PRDs.** Rejected. They share the same active packet ownership and exact extraction contract; splitting would let UI mode selection, stale display, and draft export drift independently again.
- **Fold Creation correction into the first PRD.** Rejected. Creation correction changes fact/provenance behavior after parking; it should not be hidden inside prompt packet infrastructure work.
- **Treat direct `/api/prompt-out/generate` as a substitute for active UI export.** Rejected. Field Build 06 showed direct regeneration can be non-equivalent for browser-local draft state.
- **Add direct LLM integration.** Rejected. The charter and canon-sovereignty principles require prompt-out/paste-in rather than built-in LLM API calls.
- **Patch code immediately from this prep.** Deferred. The requested stopping point is PRD-ready determination for a later `/to-prd` pass.

## PRD Publication Inputs

Use these common fields when turning the recommended first PRD into a published PRD:

- **Suggested title:** `PRD: Prompt-Out Active Packet Ownership - Exact Export and Admission Mode Selection`
- **Publication package:** one intended PRD now, with Creation correction and Propagation prompt coverage recorded as deferred follow-ons. Do not publish the whole program unless explicitly requested.
- **Recommended testing seam:** reuse the existing prompt-out context assembly and guided-flow active screen seams. The PRD should test externally visible behavior at the server prompt-out API and browser guided-flow prompt preview, not private helper names. No new architecture seam is needed.
- **Seam checkpoint for `/to-prd`:** confirm the user accepts the existing prompt-out API plus browser guided-flow surface as the test seam.
- **Likely label after `/to-prd`:** `ready-for-agent` if product scope and seam are ratified and the PRD body includes the browser-visible guidance checklist mapping; otherwise `needs-triage`.
- **Principles section:** cite `docs/principles/README.md`, `canon-sovereignty.md` W-1/P-2, `workflow-principles.md` W-1/W-2/W-3, `guided-workflow-usability.md` W-8/W-9/W-10, `data-principles.md` W-5/W-6/T-3/T-5, and `domain-fidelity.md` P-1/T-2.
- **Relevant ADRs:** ADR 0007 and ADR 0009 are primary. ADR 0006 and ADR 0008 may be cited as boundary confirmations where Admission and flow persistence are touched.
- **Relevant specs:** `docs/specs/prompt-out-context-assembly.md`, `docs/specs/admission-flow.md`, `docs/specs/creation-flow.md`, `docs/specs/propagation-flow.md` only for stale Propagation-route proof, `docs/specs/browser-visible-guidance-acceptance.md`, and `docs/specs/workflow-map-and-navigation.md`.
- **Browser-visible guidance checklist mapping:** owed before `ready-for-agent` because the PRD touches guided flows, prompt-out, browser workflow navigation, advisory material, and read-side packet provenance. The PRD should explicitly map package source, decision-point contract, visible mode/required fields, doctrine at the decision point, prompt packet preview/source manifest/cold LLM relevance, advisory/canon separation, current/next/resume state, read-side provenance, and cognitive walkthrough scenario.
- **Canonical gates:** `pnpm test`, `pnpm typecheck`, and `pnpm build` at parent closeout. Package-level tests are acceptable for narrow child slices during implementation.
- **Browser evidence:** targeted browser replay is required; there is no committed global e2e hard gate yet.
- **Cold LLM evidence:** required only for packet completeness/usefulness claims. The first PRD should at least make exact packet export possible; if no cold executor is available during implementation, say so rather than claiming cold success.
- **Durability warning:** `reports/field-build-06-divine-routing.md` was untracked when this prep was written. A published PRD should either wait until that source report is durable or summarize its findings without stable-citation wording. Do not publish `/tmp` paths as durable sources; summarize their conclusions instead.
- **Tracker state:** no open issues existed at prep time. Relevant closed context: PRD #267 through PRD #270 and PRD #292.

## Freshness And Boundaries

This prep refreshed live worktree status, branch, open issue state, prior Field Build 05 prep, Field Build 06 report content, tracker guidance, triage labels, principles, ADRs, specs, methodology files needed for prompt-out/Creation/Propagation interpretation, and prior closeout reports.

This prep did not run product tests, start the app, create issues, publish a PRD, mutate tracker state, or patch product code/specs. It relies on Field Build 06's recorded evidence for the live app behavior and on same-session source review for code-surface orientation.

Existing worktree dirt before this file was created:

- Modified: `.claude/skills/field-build/SKILL.md`
- Untracked: `reports/field-build-06-divine-routing.md`

This prep adds only `reports/field-build-06-divine-routing-prd-prep.md`.
