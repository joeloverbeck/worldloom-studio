# Field Build 04 Aftershock PRD Prep

**Source artifact reassessed:** `reports/field-build-04-aftershock-doc-change-plan.md`
**Primary field evidence:** `reports/field-build-04-aftershock-imposter-earth.md`
**Live checkout checked:** `016c07631c17ecddedfe7a17b0f8c23474bde824` (`016c076 Fourth field build.`)
**Tracker freshness:** `gh issue list --state open --limit 200` returned no open issues during this reassessment.
**Deliverable status:** PRD-ready prep only. No PRDs, issues, code patches, or `docs/*` edits have been created from this report.

## Reassessment Verdict

ChatGPT-Pro's main conclusion is valid and useful: Field Build 04 is not a `docs/worldbuilding-system/` methodology-package failure. It is a downstream app/spec/proof-honesty failure exposed by stricter field use after representative PRD closeouts. The package, principles, and ADRs already say enough to condemn the failures: guided flows must be decision-point surfaces, Prompt-out packets must match the screen context, Admission owns canon standing, Prompt-out remains advisory, and browser route shells or generic substrate controls do not close field-tested protocols.

Changes are warranted, but at lower altitude:

- `docs/methodology-coverage.md` needs caveats or demotions for Admission full-gate trust, Prompt-out active-route trust, Creation non-premise Proposal active-route proof, and Propagation active-destination maturity.
- `docs/specs/browser-visible-guidance-acceptance.md` and probably `docs/specs/guided-flow-spec-template.md` should gain a field-build regression closure pattern so later PRD proof reports cannot overstate narrow walkthrough evidence.
- `docs/specs/prompt-out-context-assembly.md` needs a concrete Admission full-gate draft-context rule.
- `docs/specs/admission-flow.md` mostly already has the right rule. It says a completed major gate writes a `gate_result` and updates the living card in place. The next PRD should enforce that existing policy rather than re-open the living-card-body decision by default.
- `docs/specs/propagation-flow.md` and `docs/specs/workflow-map-and-navigation.md` are already directionally correct, but the active-destination acceptance rule should be sharpened around owed debt identity routing and working controls in the routed destination.
- `docs/specs/creation-flow.md` already contains the intended non-premise Proposal behavior; Field Build 04 reopens implementation/proof, not the rule.

Decision: RATIFIED PRD-ready scope and artifact home -> create `reports/field-build-04-aftershock-prd-prep.md` with five PRD-ready candidates and explicit no-change verdicts for package/principles/ADRs; rationale: this preserves ChatGPT-Pro's valid findings while separating immediate PRD inputs from ratified specs or tracker publication.

Supporting skill result: Domain model unchanged - no new app-layer domain terms and no ADR-worthy decision were resolved. Terms used here are either existing app terms from `CONTEXT.md` (`World file`, `Admission flow`, `Prompt-out step`, `Decision point`, `Prompt packet`, `Workflow map`) or documentation/process labels that do not belong in the glossary.

## Evidence Findings

| Field Build 04 item | Reassessment | PRD impact |
|---|---|---|
| V-REG-01 full-gate controls render and submit | Valid no-action validation, but only proves primitives. It does not prove trustworthy full-gate execution. | Preserve as control evidence inside the Admission PRD; update coverage caveat. |
| P-01 Prompt-out mode/status/body disagreement | Valid regression against the PRD #250 proof. The live spec already has identity language, but the active route still needs regression hardening and proof. | PRD 3: Prompt-out active identity regression. |
| P-02 non-premise empty Creation Proposal blocked | Valid field contradiction against PRD #251. The Creation spec is already correct; this is active-route implementation/proof drift. | PRD 4: Creation non-premise Proposal active-route regression. |
| F-01 full-gate execution unsafe | Valid and high benefit. Code shows draft buffers are not keyed/cleared by full-gate identity, labels remain generic, and final review is not an exact submit/readback contract. | PRD 2: Admission full-gate trust and readback. |
| P-03 full-gate prompt ignores filled gate substance | Valid. `PromptGenerationInput` has no full-gate draft payload, and generic Admission prompt generation uses selected-record context as decision material. | Include in PRD 2, with Prompt-out spec/code seams. |
| V-01 frontloaded seed audit writes and preserves seed standing | Valid no-action validation. | Keep as closed control evidence. |
| V-02 Admission writes status/tags/operation/gate result/debt | Valid no-action validation with F-01 caveat. | Preserve as primitive-write evidence; do not claim field-trust until readback matches. |
| F-02 Propagation entry starts but active workflow shell cannot work sweep | Valid. Active routed Propagation destination shows manual IDs and a light shell; fuller controls exist elsewhere in the page, not as the active destination Field Build 04 used. | PRD 5: Propagation active destination. |
| V-03 Propagation queue/run entry exist | Valid no-action validation with F-02 caveat. | Preserve server/run-entry evidence, but demote active browser maturity. |
| Regression notes | Valid. Later field evidence should qualify prior narrow PRD proofs. | PRD 1: evidence discipline and coverage honesty. |
| Frontier state | Useful PRD seed. The Aftershock world has unsafe Admission artifacts and stopped at Propagation flow entry. | Use as proof target, but prefer a clean replay if unsafe canon state cannot be repaired clearly. |

## Authority Verdicts

**No methodology-package amendment now.** Field Build 04 found that the docs were actionable. The failures are app encoding, routed surface, state reset, prompt context, and proof honesty. Adding React state, DOM uniqueness, packet identity, or PRD proof standards to `docs/worldbuilding-system/` would put app mechanics into a storage/software-agnostic method package.

**No principles amendment now.** `guided-workflow-usability.md` already says API/store existence is not enough and that prompt packets and screen context are one assembly. `workflow-principles.md` already says gates demand substance, prompt-out belongs at decision points, and Admission is the admitting flow. `canon-sovereignty.md` already preserves advisory boundaries. `domain-fidelity.md` already puts app-specific implementation downstream of the package.

**No ADR amendment now.** ADR 0006, 0007, 0008, and 0009 already assign responsibility correctly: Admission owns server policy, Prompt-out is step-oriented and advisory, durable flow state belongs to flow-owned persistence, and browser workflow state must expose the guided decision sequence.

**Specs and coverage need work.** The strongest doc change is not a new doctrine statement, but an evidence discipline update plus targeted spec clarifications where the current language is too easy to satisfy narrowly.

## Reconciliation With Closed PRDs

Open tracker overlap is currently none. Relevant closed tracker context:

- PRD #249 and children #252-#256 proved executable full-gate primitives. Field Build 04 narrows that to "form and primitive writes exist"; it reopens final trust, state isolation, exact review/readback, label uniqueness, living-card update fidelity, and full-gate prompt context.
- PRD #250 and children #257-#261 proved packet identity in representative surfaces. Field Build 04 reopens active-route currentness across section, step, mode, seed parking, Admission, duplicate packet nodes, and world transitions.
- PRD #251 and children #262-#265 proved selected-but-unsaved non-premise Proposal in a controlled path. Field Build 04 shows the exact field route can still bind to a stale premise/pressure blocker.
- PRD #173 and children #193-#199 proved shared decision contract visibility for Propagation and sibling flows. Field Build 04 shows contract visibility is not the same as a working active Propagation destination.
- PRDs #231-#233 remain useful context and are not globally reopened. Field Build 04 extends their proof caveats: world-switch reset did not cover full-gate draft buffers; Creation state hardening did not fully prove later prompt transitions.

## PRD Candidate Set

Recommended publication shape: five PRDs, sequenced below. PRD 1 may be published first as a small docs/evidence hardening PRD, or folded as a documentation workstream into PRDs 2-5 if the steward wants fewer parent PRDs. Do not skip its content.

### PRD 1 - Field-Build Regression Evidence And Coverage Honesty

**Purpose:** Prevent representative proof reports from overstating field usability after later field-build evidence contradicts them.

**Sources:** `reports/field-build-04-aftershock-doc-change-plan.md`, `reports/field-build-04-aftershock-imposter-earth.md`, `docs/specs/browser-visible-guidance-acceptance.md`, `docs/specs/guided-flow-spec-template.md`, `docs/methodology-coverage.md`.

**Problem:** The coverage ledger still presents PRD #249/#250/#251/#173 as closed maturity evidence without Field Build 04 caveats. The acceptance spec asks for useful browser proof, but it does not yet require a regression mapping table when a PRD claims to close a field-build blocker.

**Scope:**

- Add a field-build regression closure pattern to `docs/specs/browser-visible-guidance-acceptance.md`: original field finding, exact active route, representative fixture, state transitions, browser evidence, API/readback evidence, Prompt-out cold-packet evidence when relevant, and remaining caveats.
- Optionally add one line to `docs/specs/guided-flow-spec-template.md` Browser Acceptance Scenarios: retrofit/field-blocker closeouts need regression replay plus negative stale-state proof, not only a success path.
- Update `docs/methodology-coverage.md` caveats for:
  - World-scoped browser state trust: PRD #232 did not prove Admission full-gate draft buffers.
  - Creation non-premise Proposal targeting: Field Build 04 contradicted PRD #251 on the active field route.
  - Admission and canon fact gate: PRD #249 proves primitives, not full-gate trust/readback.
  - Prompt-out and target-heading refinement: PRD #250/#251 are not global active-route field validation.
  - Propagation/domain atlas: current app is contract-visible/run-entry-visible, active sweep field-blocked.

**Out of scope:** Any methodology-package, principle, or ADR amendment; any code fix.

**Acceptance:** Diff shows the caveats and regression proof pattern. No maturity row claims field-validated or field-usable status for the contradicted active routes until the corresponding PRD proof lands.

### PRD 2 - Admission Full-Gate Trust, Readback, And Draft Prompt Context

**Purpose:** Make severe/foundational Admission full-gate execution trustworthy after the form appears.

**Sources:** Field Build 04 F-01/P-03/V-REG-01/V-02; `docs/specs/admission-flow.md`; `docs/specs/prompt-out-context-assembly.md`; ADR 0006/0007/0008/0009; `packages/server/src/admission-flow.ts`; `packages/server/src/prompt-out.ts`; `packages/web/src/main.tsx`; Admission/prompt tests.

**Problem:** The current UI can submit a full gate, but local gate draft state can leak across worlds/records, quiet-domain labels are ambiguous, there is no exact final payload review, and the resulting current-canon record/gate result/prompt packet can diverge from the steward-filled gate substance.

**Important narrowing of ChatGPT-Pro proposal:** Do not make "does full-gate fact statement rewrite the living card body?" a fresh product decision by default. `docs/specs/admission-flow.md` already says completed major gates update the living card in place. The PRD should enforce that existing spec. Only reopen the policy if the steward explicitly wants non-rewrite behavior.

**Scope:**

- Browser full-gate draft identity keyed by world path, selected record, Admission flow/decision origin, severity path, and contract section keys. Reset or rehydrate when any key changes.
- Clear full-gate buffers in the world-scoped reset boundary and when selecting a different Admission record/full-gate contract.
- Unique accessible labels for every gate section and quiet-domain control. Quiet-domain labels must include the parent section identity.
- Exact final review before completion: submitted living record title/body/truth layer/status, operation, tags, section substance, N/A reasons, quiet-domain declarations, written consequence, advisory-use link, and follow-up debt.
- Server validation/readback: section-key payloads are authoritative, missing/unknown/mismatched keys fail, and successful completion updates the living card body according to the existing spec while preserving prior wording in history.
- Gate result report sections must read back under the correct section keys/headings.
- Full-gate Prompt-out pressure must include current gate draft context. If draft state is still local before submit, the Prompt-out step request must carry a typed draft payload to server-side prompt assembly, labeled as current unsaved gate draft.
- Coverage ledger caveat closes only after the exact readback proof lands.

**Likely issue slices:**

- Full-gate draft identity/reset and world-switch clearing.
- Full-gate labels and section-key field wiring.
- Exact final review and living-card update/readback.
- Server validation for keyed sections and gate-result readback.
- Admission full-gate draft context in Prompt-out.
- Browser/API/coverage closeout.

**Acceptance:** Same-runtime two-world browser proof; no prior-world gate text; unique accessible queries; final review equals submitted payload; current canon, gate result, tags, links, debt, and audit trail match readback; full-gate pressure packet contains the filled gate draft; intentionally mismatched payloads are refused or produce explicit non-rewrite policy only if that policy is separately ratified.

### PRD 3 - Prompt-Out Active Identity Regression

**Purpose:** Restore trust that the copyable active prompt packet is the current mode/section/record/step/world packet.

**Sources:** Field Build 04 P-01; PRD #250; `docs/specs/prompt-out-context-assembly.md`; `packages/server/src/prompt-out.ts`; `packages/web/src/main.tsx`; prompt lifecycle tests.

**Problem:** PRD #250 hardened representative packet identity, but Field Build 04 still observed active mode/body/status disagreement and duplicate `pre.prompt-packet-text` nodes in the route used by the steward.

**Scope:**

- Treat prompt body, loaded status, copy/store/export affordances, mode selector, and packet heading as one current `PromptPacketIdentity`.
- Clear or mark stale packet body on flow, world, record, section, step, mode, template, seed parking, Admission severity/gate transition, and selected run changes.
- The active route must expose exactly one current copyable packet body. Prior packet bodies may remain only as clearly labeled non-current evidence with copy/store disabled.
- Tests must query DOM-level current packet targets, not only visible text.
- Coverage ledger remains caveated until active-route field replay passes.

**Out of scope:** Adding gate draft substance to the packet belongs to PRD 2; Creation target-heading Proposal belongs to PRD 4.

**Acceptance:** Browser tests and a field replay through Creation kernel, section switches, seed decomposition, Admission queue/severity/full-gate entry, and world switch. At every step, mode/status/body/copy/store agree, stale bodies cannot be copied or stored as current, and no duplicate current packet body exists.

### PRD 4 - Creation Non-Premise Proposal Active-Route Regression

**Purpose:** Close the Field Build 04 contradiction where a selected empty non-premise kernel section still could not load Proposal.

**Sources:** Field Build 04 P-02; PRD #251; `docs/specs/creation-flow.md`; `docs/specs/prompt-out-context-assembly.md`; Creation and prompt tests.

**Problem:** The Creation spec already says Proposal mode is available for empty non-premise selected kernel sections, while World premise Proposal is refused and Pressure remains blocked until steward-authored material exists. Field Build 04 shows the active route can still bind to stale World premise/Pressure blocker state.

**Scope:**

- Audit selected-heading request flow end to end in the active routed Creation destination after prior saved World premise, stale prior packet, section switch, and selected-but-unsaved Core promise.
- Ensure Proposal request carries the selected heading to the server and loaded packet identity.
- Ensure World premise Proposal is refused by selected/requested heading and Pressure is blocked for empty non-premise sections.
- Clear/stale prior packet state after heading or mode change.
- Add coverage ledger caveat closeout only after replay of the contradicted field sequence.

**Out of scope:** New Creation methodology rule; app-generated canon; any package amendment.

**Acceptance:** Fresh-world browser replay: save World premise, select unsaved Core promise, load Proposal, verify packet identity/body names Core promise and empty-state context, then switch to Pressure and World premise to verify blockers and stale guards.

### PRD 5 - Propagation Active Destination

**Purpose:** Make the routed Propagation destination the actual working shock-cone/domain sweep surface, not just a decision-contract shell.

**Sources:** Field Build 04 F-02/V-03; PRD #173; `docs/specs/propagation-flow.md`; `docs/specs/workflow-map-and-navigation.md`; `packages/server/src/propagation-flow.ts`; `packages/web/src/main.tsx`; Propagation tests.

**Problem:** The active routed Propagation destination in `packages/web/src/main.tsx` shows manual fact/debt/flow ID inputs, contract panel, start/resume, close, and payload counts. The fuller consequence/order/domain/disposition/proposal controls exist elsewhere in the page, but the active workflow-shell destination Field Build 04 used could not work the sweep. It also could report no blockers before severity-derived coverage existed.

**Scope:**

- Route owed propagation queue entries into the active destination with fact/debt identity carried by server/map payloads. A docs-closed steward must not type `factId` or `debtId`.
- Move/render working controls in the active routed destination: consequence text, shock-cone order, domain attribution, domain sweep states, negative-domain declarations, disposition, debt/boundary text, surfaced proposal, prompt-out, skip, close/result preview, and read-side trail.
- Server and browser close blockers must show severity-derived missing coverage before content exists. "No server-returned blockers" must not appear when full domain-atlas coverage is owed and empty.
- Propagation Prompt-out controls must be available at the active decision point with context preview.
- Coverage ledger demotes/splits Propagation from decision-guided to contract/run-entry visible until active sweep replay passes.

**Out of scope:** Changing the Propagation method, automatic consequence generation, Admission behavior, or generic substrate record editing.

**Acceptance:** Field path from Admission-created `canon_debt` to Propagation: choose owed debt without manual IDs, start/resume run, author at least one consequence, mark domain coverage, record disposition, see blockers clear only as owed coverage is met, load a current Propagation prompt packet, preview close/result, and verify report/read-side trail.

## Rejected Or No-Op Alternatives

- **Rewrite `docs/worldbuilding-system/`.** Rejected. Field Build 04 says the package was actionable, and the package is intentionally app/storage agnostic.
- **Add a new principle.** Rejected. Existing W-8/W-9/W-10/W-1/W-7/P-2/P-5 language is sufficient.
- **Add or amend an ADR.** Rejected for now. The failures are under-implementations of ADR 0006/0007/0008/0009, not architectural reversals.
- **Treat PRD #249/#250/#251/#173 as still fully closed.** Rejected. Later field evidence is stronger for active-route usability than representative proof reports.
- **Close Propagation through API-only work or generic record editing.** Rejected by ADR 0009 and `guided-workflow-usability.md`.
- **Add direct LLM integration or automatic canonization.** Rejected by canon sovereignty and out of scope.
- **Patch code immediately from this reassessment.** Deferred. The requested stopping point is PRD-ready preparation, not implementation.

## PRD Publication Inputs

Use these common fields when turning this into PRDs:

- **Principles section:** Every PRD should cite `docs/principles/README.md`, `guided-workflow-usability.md` W-8/W-9/W-10 as applicable, `workflow-principles.md` W-1/W-2/W-3/W-7 as applicable, `canon-sovereignty.md` P-2/W-1 for Prompt-out/advisory boundaries, and `domain-fidelity.md` P-1/T-2 for package fidelity.
- **Relevant ADRs:** Admission PRD cites ADR 0006, 0007, 0008, 0009. Prompt-out PRD cites ADR 0007/0009. Propagation PRD cites ADR 0008/0009 and any existing propagation flow-store boundary if introduced later.
- **Canonical gates:** `pnpm test`, `pnpm typecheck`, `pnpm build` for broad workflow/spec/code changes. Narrow issue slices may run relevant package tests first, but parent closeout should run all three.
- **Browser evidence:** Existing repo has no committed e2e hard gate. PRDs should require targeted browser-visible proof, component render, screenshot, or manual walkthrough per `browser-visible-guidance-acceptance.md`, without falsely reporting a global e2e gate.
- **Cold LLM evidence:** When Prompt-out packet completeness is in scope, use a cold external LLM packet check if available. If unavailable, state blocked evidence honestly and do not claim prompt-context-complete or field-validated status.
- **Tracker state:** No open issues existed at reassessment time. Relevant closed context: #173, #231, #232, #233, #249, #250, #251 and child issues #234-#265.

## Freshness And Boundaries

This reassessment refreshed live HEAD, open issue state, relevant closed PRD bodies, specs, ADRs, principles, coverage ledger, and implementation seams in the current checkout. It did not independently inspect `/tmp/worldloom-field-build` screenshots/world files/cold-LLM artifacts. It did not independently revalidate ChatGPT-Pro's external research links; this prep relies on repo authorities and the field report for the PRD-ready verdict.

Existing worktree dirt before this file was created:

- Modified: `.claude/skills/research-brief/SKILL.md`
- Untracked: `reports/field-build-04-aftershock-doc-change-plan-research-brief.md`
- Untracked: `reports/field-build-04-aftershock-doc-change-plan.md`
- Untracked: `reports/manifest_2026-07-07_016c076.txt`

This report adds only `reports/field-build-04-aftershock-prd-prep.md`.
