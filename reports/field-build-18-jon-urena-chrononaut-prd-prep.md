# Field Build 18 - PRD-Ready Determination

Source report path: `reports/field-build-18-jon-urena-chrononaut.md`
Selected report sections: Findings (V-01, V-02, V-03, F-03, Q-01), Regression of prior findings, Decision-point log, For the app, For the methodology, Frontier.
Source durability status: pending local publication. The report is untracked in the working tree (`?? reports/field-build-18-jon-urena-chrononaut.md`), so it is not tracked, not clean, and not visible from a publication ref. The later PRD must summarize its conclusions rather than cite it as a durable source, exactly as PRD #348 did for the Field Build 15 report.
Authored-artifact durability: new/untracked. This determination file is created by this run and is not yet committed, so it is also pending local publication.
Primary evidence: the source report; live GitHub tracker reads; read-only source inspection of `packages/server/src/workflow-map.ts`, `packages/server/src/propagation-flow.ts`, and `packages/server/src/minimal-viable-world.ts`; durable authorities under `docs/worldbuilding-system/`, `docs/specs/`, and `docs/principles/`; and a read-only query of the field-build world file under the machine-local field-build root (summarized, not cited).
Live checkout snapshot: branch `main`, HEAD `767405a`. The report names app commit `767405a`, so the product and authority tree is unchanged since the run: `same product/authority tree`. Baseline worktree dirt is skill-only plus the untracked report (three modified files under `.claude/skills/field-build/`), and none of it touches product or authority paths.
Tracker freshness: refreshed this session. `gh issue list --state open` returned zero open issues, so the backlog is fully closed and no open issue owns any finding here. Closed work read for comparison: #348 (PRD body and acceptance), #349, #350, #351, #352, #308, #364, #368, #369, #370, #371, and #209.
Deliverable status: PRD-ready determination only. No code, spec, tracker, PRD publication, or `/to-prd` seam checkpoint happened.

## Reassessment Verdict

**Field Build 18 closes three prior defects and leaves exactly one product problem, which prep evidence proves is larger than the report recorded.** V-01, V-02, and V-03 confirm that #369's canonical final-Pressure identity, the #353/#357/#368 staging-to-append-only-report lifecycle, and PRD #364/#368's compact Propagation workspace all hold against the exact foundational world. Nothing in those three needs product work.

The one live product problem is F-03: after a foundational Propagation run closes, the workflow map routes the steward to `Work Admission queue` while the source fact's specialized passes remain owed. Read-only source inspection confirms the report's symptom and exposes two further defects at the same seam that the report did not name:

1. **Priority.** In `workflow-map.ts`, the `nextDecision` ladder ranks `admissionQueue.length > 0` above the conditional-pass/temporal branch, so a queued proposal always outranks an owed pass once Propagation debt is closed.
2. **Provenance (prep discovery).** The `Conditional passes` owed signal is derived from a prose regex over canon-debt title and body (`/\btemporal\b|\btimeline\b/i`). In the Field Build 18 world the only matching record is a Creation seed-family debt titled "Protected temporal mechanism mystery", which has nothing to do with FAC-3. The owed signal the steward sees is therefore a false positive from keyword matching, and it would equally miss a real obligation whose prose lacks those words.
3. **Absence (prep discovery).** Propagation close writes the append-only report and closes the owed debt, but emits no record of the source fact's triggered specialized passes. FAC-3's owed passes exist only as Canon Workbench gate prose, so no server-owned state could bind `nextDecision` to them even if the priority order were fixed.

These three are one defect family at one seam, so they package as one PRD.

First operational action: none is blocking. There is no verification/reopen candidate and no open tracker item to reconcile, so the recommended first new PRD *is* the first action. One optional durability step precedes citation: committing the Field Build 18 report would let the PRD cite it as a durable source; otherwise the PRD summarizes it.

Recommended first new PRD: **Workflow map post-Propagation conditional-pass handoff — source-linked owed passes before further Admission.**

Follow-ons: none carried as product scope. Every remaining item is coverage-only.

Coverage-only work: Q-01's cold-packet handoff proof (field-build harness, not app scope), and six unreverified prior findings that stayed behind the resumed frontier.

Supporting-skill result: the `mgrep` skill was invoked as the mandated search path but returned HTTP 429 (monthly quota exhausted), so local search fell back to ripgrep. No search coverage was lost.

## Evidence Checked

| Finding or candidate | Status | Evidence | PRD impact |
| --- | --- | --- | --- |
| V-01 - Final Propagation Pressure shares the active disposition-step identity | validated/no product scope | Report proves a one-click current packet with matching origin step and live decision; issue #369 is closed. | None. Preserve as regression coverage. |
| V-02 - Propagation close crosses cleanly from editable staging to one append-only report | validated/no product scope | Report proves close returned HTTP 201, PRP-1 was written, DEB-7 closed, and the post-close negative control found no edit/retract controls; #353/#357/#368 closed. The world file confirms record 17 is `propagation_report` "Propagation report: FAC-3" and debt 16 carries `State: closed`. | None. Preserve as regression coverage. |
| V-03 - Compact Propagation workspace removes the always-expanded edit wall | validated/no product scope | Report proves compact browse state on the exact foundational-density world; PRD #364 and issue #368 are closed. | None. Preserve as regression coverage. |
| F-03 - Workflow map advances to Admission while FAC-3's specialized passes remain owed | fresh product scope | Confirmed in current source. `workflow-map.ts` ranks the Admission queue above the conditional-pass branch in `nextDecision`; the conditional-passes owed signal comes from a prose regex over canon-debt text that matches only an unrelated Creation seed-family debt; and `propagation-flow.ts` close emits no specialized-pass obligation. No closed issue's acceptance covers this state. | The recommended first PRD. |
| Q-01 - Session dispatch cannot prove exact cold-packet handoff | coverage follow-up | The app-side packet is proven current, exportable, and hash-identified. The unproven link is the field-build harness's dispatch to a fresh worker, which is skill/tooling coverage. The report itself scopes Q-01 outside app PRD scope. | None. Coverage-only. |
| App Seed 1 - Source-specific specialized-pass handoff after foundational Propagation | fresh product scope | Same seam and evidence as F-03; the seed is F-03's product statement. | The recommended first PRD. |
| Validation-only completed seeds | validated/no product scope | V-01, V-02, and V-03 record completed work with no residual product scope; Q-01 is explicitly not an app seed. | None. |
| For the methodology | validated/no product scope | The report records "None", and authority review agrees: `07_propagation_engine.md`, `09_temporal_and_timeline_protocol.md`, and `03_truth_layers_and_canon_governance.md` already require the triggered passes and explicit stopping states. The gap is the app's route priority, not missing doctrine. | None. Spec updates ride the PRD; no methodology change is owed. |
| Regression: Field Build 17 P-03 (final packet born stale) | validated/no product scope | Fixed; replayed on its exact recorded repro and promoted to V-01. | None. |
| Regression: Field Build 16 F-03 (pre-close lifecycle boundary) | validated/no product scope | Fixed; the previously unreachable after-close side now passes and is promoted to V-02. | None. |
| Regression: Field Build 17 R-01 (always-expanded editors) | validated/no product scope | Fixed; replayed on its exact browse-state repro and promoted to V-03. | None. |
| Regression: Field Build 17 F-01 (duplicate blocker keys) | coverage follow-up | Not reverifiable this run; the resumed world had zero blockers. Issue #370 is closed and the console was clean, but the exact repro was not reconstructed. | None unless replay disproves the fix. |
| Regression: Field Build 17 F-02 (answered rationale dropped) | coverage follow-up | Not reverifiable this run; no re-disposition occurred. Issue #371 is closed and the `Disposition rationale` control was visible, but save/readback was not repeated. | None unless replay disproves the fix. |
| Regression: Field Build 16 P-01 (foundational Proposal atlas) | coverage follow-up | Not reverifiable; Proposal stayed behind the final-Pressure frontier. | None. |
| Regression: Field Build 14 F-01 (punctuation search) | coverage follow-up | Not reverifiable; search stayed outside the resumed Propagation frontier. | None. |
| Regression: Field Build 11 P-01 (Creation packet currentness) | coverage follow-up | Not reverifiable; Creation correction stayed behind the frontier. | None. |
| Regression: Field Build 11 F-02 (duplicate Creation correction) | coverage follow-up | Not reverifiable; no Creation correction mutation was attempted. | None. |
| Frontier: Walked to | validated/no product scope | Records the reached state: Propagation complete, PRP-1 written, post-close controls absent, final map captured. Corroborated by the world file. | None. |
| Frontier: Next run resumes at | coverage follow-up | Defines the next field-build entry: confirm report 17 and zero owed Propagation, then enter Temporal/Timeline for FAC-3 rather than the map's Admission route. | None directly; it is the replay that would prove the PRD's fix. |
| Frontier: App-reported next | fresh product scope | `Work Admission queue` with Admission 1, owed Propagation 0, conditional passes owed. This is exactly the state the PRD must change. | Supplies the PRD's acceptance precondition. |
| Frontier: Methodology-required next | fresh product scope | FAC-3's specialized passes or an explicit deferral, beginning with Temporal/Timeline. The docs/app disagreement is F-03. | Supplies the PRD's expected outcome. |
| Frontier: Carried-open findings | coverage follow-up | F-03 is carried as the PRD; the six unreverified prior findings and Q-01 remain coverage-only. | None beyond the PRD. |
| Frontier: World state | validated/no product scope | FAC-3 accepted with constraints and unchanged, PRP-1 append-only, DEB-7 closed, FAC-2 proposed, six Creation seed-family debts open, no canon mutation. Confirmed by direct read of the world file. | Supplies the PRD's seeded fixture state. |

Prior art and code-surface checks that shaped the candidate set:

- **Closed PRD #348** (Workflow map Propagation-debt arbitration) is the nearest neighbor and the decisive comparison. Its accepted scenario is *open, routeable Propagation debt coexisting with a queued proposal*, and it deliberately scoped itself narrowly: user story 13 asks that "unrelated owed-destination ordering" be preserved so the fix does "not silently redesign the rest of the method journey". Field Build 18's state is the opposite side of that boundary — Propagation debt is **closed**, so `routeablePropagationCollision` cannot fire — which is why this is `fresh product scope` and not a reopen of #348.
- **Closed #349/#350/#351/#352** implemented #348's spec contract, server priority, browser rendering, and field-build closeout. They establish the house pattern this PRD should follow: correct server-owned map priority without redesigning the map.
- **Closed PRD #308** established the same pattern earlier for the pre-Admission handoff.
- **Minimal Viable World** (`minimal-viable-world.ts`) is the strongest in-repo seam analogy for the deferral half of this PRD. It already models a server-owned obligation ledger with steward dispositions (`covered`, `deferred`, `protected_mystery`), deferral inputs, close-readiness blockers, and an `owedQueueCount` that feeds the workflow map. Conditional passes need the same treatment; the vocabulary should be reused rather than reinvented.
- **`workflow-map.ts`** contains all three confirmed defects: the `nextDecision` ladder, the prose-regex temporal-debt derivation, and the absence of any source-linked pass obligation.
- **`propagation-flow.ts`** close path confirms it queues "only canon debt explicitly chosen by the steward" and never records triggered passes.
- **Shared record-type vocabulary** has `propagation_report` but no record type modelling a conditional-pass obligation, so the PRD introduces the first one.

## Authority Findings

No methodology change is owed. The doctrine is already correct and already stricter than the app:

- `docs/worldbuilding-system/07_propagation_engine.md` requires the specialized passes for a foundational fact and routes sweep-generated facts back through admission.
- `docs/worldbuilding-system/09_temporal_and_timeline_protocol.md` owns the Temporal/Timeline trigger recommendation the map's own code comment already defers to.
- `docs/worldbuilding-system/03_truth_layers_and_canon_governance.md` says unmanaged canon debt should not silently become the foundation for another major fact — which is precisely what routing to Admission does here.
- `docs/principles/guided-workflow-usability.md` W-9 (replacement-grade guidance: the app is the method surface) is the principle F-03 violates most directly. The report's own words — "the docs are still needed to choose the next stage" — are a W-9 failure. W-10 (the workflow map is the home surface) is the surface that must carry the fix.
- `docs/principles/workflow-principles.md` W-4 keeps canon debt a warning rather than a hard block, which constrains the fix: the handoff must be a non-blocking recommendation with a governed deferral, never a gate on Admission.

Spec changes **are** owed, but through the future PRD, not as edits already made:

- `docs/specs/workflow-map-and-navigation.md` needs the conditional-pass state grammar and the post-close arbitration rule. Its current cross-queue section describes exactly one narrow rule (Admission versus routeable Propagation) and its state-grammar entry for conditional passes still says "when facts apply" without any owed-obligation contract.
- `docs/specs/propagation-flow.md` needs the close-time obligation emission contract.
- `docs/specs/browser-visible-guidance-acceptance.md` needs the cognitive-walkthrough entry for the new seam, matching the pattern it already carries for Admission-versus-routeable-Propagation arbitration.

## Recommended First PRD

### Workflow map post-Propagation conditional-pass handoff — source-linked owed passes before further Admission

**Purpose.** Make the app carry the steward from a closed foundational Propagation run into the specialized passes that close created, instead of silently routing past them into more dependency-bearing Admission.

**Sources.** Field Build 18 (F-03 and App Seed 1), summarized rather than cited because the report is pending local publication. Prep-confirmed source inspection of the workflow-map, propagation-flow, and minimal-viable-world modules. Closed prior art #348/#349/#350/#351/#352, #308, and the Minimal Viable World checkpoint family.

**Problem.** When a foundational Propagation run closes, the app writes the append-only report and closes the owed debt, then names `Work Admission queue` as the steward's primary next decision. The method requires the opposite: `07` owes FAC-3 its triggered temporal, constraint, and institutional/economic/suppression passes, and those obligations must be worked or explicitly deferred before the fact is relied on for more major canon. Three coupled causes produce the wrong route:

1. The map's `nextDecision` ladder ranks a non-empty Admission queue above every conditional-pass branch. Once Propagation debt is closed, the #348 arbitration no longer fires and nothing else outranks Admission.
2. The `Conditional passes` owed state is inferred from a prose keyword match over canon-debt title and body rather than from typed provenance. In the field-build world it fires off an unrelated Creation seed-family debt about a protected temporal mystery, so the one owed signal the steward can see is a false positive — and a real obligation phrased without those keywords would be invisible.
3. Propagation close never records which specialized passes the closed run triggered. The obligations exist only as Canon Workbench gate prose, so there is no server-owned state for the map to route on, name, or let the steward defer.

**Recommended product rule or seam.** Propagation close becomes the point where the source fact's triggered specialized-pass obligations are recorded as server-owned, source-linked state, bound to the source fact and the propagation report. The workflow map then derives both the `Conditional passes` stage state and its `nextDecision` from those typed obligations instead of from canon-debt prose. After a foundational or major Propagation run closes with obligations outstanding, the primary next decision names the first owed pass together with its source fact and report, ahead of the Admission queue. The steward may govern any obligation as worked or as an explicit deferral with rationale, reusing the Minimal Viable World disposition vocabulary; Admission is elevated to primary only once every obligation is worked or governed as deferred.

This is orientation only, in the same shape #348 established. It does not block Admission, change canon standing, close debt, admit facts, or start a pass run on the steward's behalf, and it introduces no new map architecture or navigation destination — every pass destination already exists.

**Scope.**

- Server: emit source-linked conditional-pass obligations at Propagation close, derived from the source fact's domain and the `09`/`08`/`12` trigger recommendations.
- Server: a disposition surface for governing an obligation as worked or deferred-with-rationale.
- Server: derive the `Conditional passes` stage state and the `nextDecision` arbitration from those obligations, and retire the prose-regex temporal-debt derivation.
- Browser: render the post-close handoff, the named source fact and report, the remaining pass ledger, and the governed-deferral control.
- Specs: `workflow-map-and-navigation.md`, `propagation-flow.md`, and the browser-visible guidance acceptance walkthrough.

**Acceptance.**

1. Given the Field Build 18 state — accepted foundational FAC-3, a closed Propagation run with report PRP-1, Admission queue 1, zero owed Propagation — the map's primary next decision names FAC-3/PRP-1's first owed conditional pass (Temporal/Timeline) and not `Work Admission queue`, and its reason explains the closed run's outstanding obligations.
2. The `Conditional passes` stage state is derived from source-linked obligations. A Creation seed-family canon debt whose prose merely contains "temporal" or "timeline" no longer, on its own, drives conditional-passes `owed` or a Temporal next decision.
3. After the steward works or deferral-governs every owed pass for FAC-3, the map elevates `Work Admission queue` as primary and the deferred obligations remain visible as governed rather than disappearing.
4. Throughout, Admission stays visible, its queue count stays truthful, and it stays directly navigable; the map performs no write.
5. Regression: #348's Admission-versus-routeable-Propagation arbitration and Creation seed-family coverage precedence are unchanged.

**Likely issue slices.**

1. Spec contract: conditional-pass obligation state grammar, post-close arbitration rule, and deferral vocabulary.
2. Server: close-time obligation emission with typed source-fact and report links.
3. Server: obligation disposition and governed deferral.
4. Server: map derivation and `nextDecision` arbitration; retire the prose regex.
5. Browser: post-close handoff and deferral rendering.
6. Field-build replay and closeout against the Field Build 18 world.

**Out of scope.** A new workflow-map architecture or new navigation destinations; implementing the specialized passes themselves; any change to canon standing or admission policy; hard-blocking Admission; a generalized cross-queue priority framework beyond this seam; and Q-01's cold-handoff tooling.

## Follow-On Candidates

None. Every non-validated item from Field Build 18 resolved to coverage-only work, so no product or docs scope is being deferred out of the first PRD. If the user later wants the prose-regex retirement split from the arbitration change, that is a slice boundary inside this PRD rather than a separate PRD, because both share the same route, seam, and acceptance proof.

## Coverage Follow-Up

- **Q-01, cold-packet handoff proof.** The field-build harness cannot prove which bytes a fresh worker received, so cold-prompt usefulness stays unmeasured. This becomes product work only if the missing capability turns out to require an app-side export or digest affordance; the current evidence says the app side is already proven and the gap is in the dispatch tooling.
- **Field Build 17 F-01 and F-02.** Issues #370 and #371 are closed and this run saw no contradiction, but neither exact repro was replayed. A future run that reconstructs multi-blocker friction and a re-disposition save/readback would either confirm the fixes or reopen them.
- **Field Build 16 P-01, Field Build 14 F-01, Field Build 11 P-01 and F-02.** All stayed behind the resumed frontier. They need a run that walks those surfaces rather than resuming at Propagation.
- **Field Build 19 replay.** The Frontier's next-run entry doubles as the acceptance replay for the recommended PRD: confirm report 17 and zero owed Propagation, then verify the map routes to Temporal/Timeline for FAC-3 instead of Admission.

## Rejected Or No-Op Alternatives

- **Reopen #348 instead of a new PRD.** Rejected. #348's accepted scenario requires *open* routeable Propagation debt, and it explicitly preserved unrelated owed-destination ordering. Field Build 18's failure occurs after that debt closes, which is outside #348's acceptance and outside its code path. Filing this as a reopen would misattribute a new gap to delivered work.
- **Reorder the `nextDecision` ladder only, lifting the existing temporal branch above Admission.** Rejected. It would promote a signal that prep proved is a false positive: in the field-build world the temporal branch fires off an unrelated Creation seed-family debt, so the map would confidently route the steward to the wrong pass. It also leaves FAC-3's real obligations with no representation at all.
- **Keep deriving conditional-pass state from canon-debt prose and just improve the regex.** Rejected. #348's own maintainer story 15 already forbids exactly this — "no title parsing or prose convention becomes identity" — and a keyword rule cannot name a source fact, enumerate a remaining pass ledger, or support a governed deferral.
- **Hard-block Admission until the passes are worked.** Rejected. `workflow-principles.md` W-4 keeps canon debt a warning, not a gate, and #348 deliberately shipped a non-blocking recommendation. The fix is guidance, not a lock.
- **Treat F-03 as a methodology gap.** Rejected. The report and the authority review agree the doctrine is already correct and already stricter than the app; nothing in `07`, `09`, or `03` needs changing.
- **Fold Q-01 into the PRD.** Rejected. It is field-build harness coverage, not app behavior, and the report scopes it outside app PRD scope.
- **Multi-PRD program.** Rejected. The three confirmed defects share one active route, one decision point, one seam, and one acceptance proof, which is the repo's stated bar for a single PRD.

## PRD Publication Inputs

Suggested title: `PRD: Workflow map post-Propagation conditional-pass handoff — source-linked owed passes before further Admission`
Publication package: one PRD, with the six slices above as likely child issues. No deferred follow-on PRDs.
Recommended testing seams and seam checkpoint: server-side `workflowMap()` payload assertions over a seeded world reproducing the Field Build 18 state (`packages/server/test/workflow-map.test.ts`), Propagation close obligation-emission tests alongside the existing propagation server tests, and a browser component-render test for the handoff and deferral surface (`packages/web/src/workflow-shell.test.tsx`). This mirrors the server-plus-browser split #350/#351 used for the #348 arbitration. The seam checkpoint is still owed and must be ratified in the `/to-prd` session; this prep does not ratify it.
`/to-prd` consultation status: consulted for house style only. No draft, staging, publication, labelling, or seam checkpoint occurred.
Likely label and downgrades: `enhancement` plus `ready-for-agent`, matching current exemplar metadata on closed #348/#349/#350/#351. Downgrade to `needs-triage` if the user leaves the obligation-derivation mechanism open (new record type versus typed link versus derived-from-gate), leaves the deferral vocabulary open rather than reusing the Minimal Viable World dispositions, or narrows the ask to a priority-only reorder — any of which leaves the PRD not AFK-actionable.
Issue-tracker and triage-label docs consulted: `docs/agents/issue-tracker.md` and `docs/agents/triage-labels.md`. The triage-label doc requires checking the browser-visible guidance acceptance checklist before applying `ready-for-agent` to a guided-flow issue, which applies here.
Authorities to cite: `docs/worldbuilding-system/07_propagation_engine.md`, `09_temporal_and_timeline_protocol.md`, `08_constraint_composition.md`, `12_institutional_economic_and_suppression_protocol.md`, and `03_truth_layers_and_canon_governance.md`; `docs/specs/workflow-map-and-navigation.md`, `docs/specs/propagation-flow.md`, `docs/specs/temporal-timeline-flow.md`, and `docs/specs/browser-visible-guidance-acceptance.md`; `docs/principles/guided-workflow-usability.md` W-9/W-10 and `docs/principles/workflow-principles.md` W-4; and PRDs and issues #348, #349, #350, #351, #352, #308, #364, #368, #369, and the #205-#210 workflow-map family.
Browser-visible guidance checklist needs: required, because this is a guided-flow change. Run the cognitive walkthrough from `docs/specs/browser-visible-guidance-acceptance.md`, and add a walkthrough that starts after a foundational Propagation close with a proposal still queued, reloads the map, identifies the owed conditional pass as primary with FAC-3/PRP-1 provenance visible, confirms Admission remains navigable with a truthful count, governs one obligation as a deferral with rationale, refreshes the map, confirms Admission becomes primary while the deferral stays visible, and returns safely to a freshly reloaded map.
Canonical gates for the PRD implementation: `pnpm test`, `pnpm typecheck`, and `pnpm build`, since the change spans shared, server, and web.
Focused implementation gates if a slice is narrow: `pnpm --filter @worldloom/server test` and `pnpm --filter @worldloom/web test`.
Evidence expectations: server payload readback of stages, queues, destinations, and `nextDecision` for the Field Build 18 state; a browser capture of the post-close handoff and the governed-deferral control; and a Field Build 19 replay confirming the map routes to Temporal/Timeline for FAC-3 rather than Admission. Cold-LLM evidence is not expected for this seam.
Source durability warnings and temporary-path handling: the Field Build 18 report is untracked, so the PRD must summarize its conclusions rather than cite it as durable, exactly as PRD #348 handled the Field Build 15 report. The field-build world file, build log, screenshots, and Pressure export live under a machine-local temporary root and are summarized for prep provenance only; the PRD must not cite them as stable sources.

## Completion Self-Check

- `/to-prd` consulted for house style only: yes; publication, issue creation, and the seam checkpoint were not invoked.
- Source artifact posture: pending local publication (untracked); temporary field-build paths are summarized, not cited.
- Authored-artifact posture: new/untracked.
- Tracker freshness: refreshed; zero open issues; closed #348/#349/#350/#351/#352, #308, #364, #368, #369, #370, #371, and #209 were read.
- Selected first PRD: the post-Propagation conditional-pass handoff, with no blocking first operational action.
- Follow-on candidates: none. Coverage-only work: Q-01, six unreverified prior findings, and the Field Build 19 acceptance replay.
- Recommended testing seam: server map-payload plus close-emission tests and a browser render test; the seam checkpoint remains owed to `/to-prd`.
- Likely publication label: `enhancement` plus `ready-for-agent`, with the downgrade conditions recorded above.
- Issue-tracker and triage-label docs consulted: yes, both.
- Canonical gates and focused gates: recorded above as expectations for the future PRD's implementation, not as gates run by this prep.
- Validator: `node .claude/skills/field-build-prd-prep/scripts/validate-prd-prep.mjs` reported 5 findings, 2 app seeds, 9 regressions, 6 frontier items, and 23 evidence rows, with no structural errors and no warnings.
- Manual leakage and stale-phrasing scan: completed. The full machine-local path pattern and all four stale publication-language patterns from the skill's preflight were searched across this artifact and returned no hits. References to the field-build world file, screenshots, and Pressure export are described generically as a machine-local temporary root, with no absolute path reproduced, and are marked summarized-not-cited.

## Freshness And Boundaries

Refreshed in this session: the source report in full; the live tracker (zero open issues, plus the closed comparison set); read-only source inspection of `workflow-map.ts`, `propagation-flow.ts`, `minimal-viable-world.ts`, and the shared record-type vocabulary; the relevant methodology, principles, and spec authorities; and a read-only query of the field-build world file that confirmed the report's world state and exposed the false-positive conditional-pass signal.

Not done: no code, spec, tracker, PRD, or label mutation; no `/to-prd` invocation beyond house-style reference; no issue was created, edited, or closed.

Product tests and app runs skipped: the canonical `pnpm test`, `pnpm typecheck`, and `pnpm build` gates were not run, and the app was not launched. This prep changes no product, workflow, package, or build surface, so those gates are not owed here; the three confirmed defects were established by read-only source inspection and a read-only world-file query, which is sufficient to distinguish `covered` from `fresh product scope`. The browser was not driven, so every browser-visible claim above is an expectation for the future PRD rather than proof from this run.

Pre-existing worktree dirt, carried from a prior session and not adopted by this prep: `.claude/skills/field-build/SKILL.md`, `.claude/skills/field-build/scripts/validate-report.mjs`, and `.claude/skills/field-build/scripts/validate-report.test.mjs`, all modified. The source report `reports/field-build-18-jon-urena-chrononaut.md` was already untracked at baseline and remains untracked.

Files this prep intentionally added: `reports/field-build-18-jon-urena-chrononaut-prd-prep.md` only.
