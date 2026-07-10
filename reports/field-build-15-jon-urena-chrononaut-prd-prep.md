# Field Build 15 PRD-Ready Determination: Propagation Debt Before Further Admission

Source artifact: `reports/field-build-15-jon-urena-chrononaut.md`.

Selected source sections: `Findings` entries `V-01` through `V-04` and `P-01`; `Regression of prior findings`; the complete `Decision-point log`; `For the app (PRD seeds)`; `For the methodology`; and `Frontier`.

Existing same-stem prep artifact classification: none. The default same-stem path was missing at intake.

Source durability: pending local publication. The source report is untracked. Its recorded app commit `bb82150` matches current `HEAD` and `origin/main`, but the report file itself is not tracked or publication-ref-visible. A later PRD may summarize the report's conclusions, but it must not present this report or its machine-local field artifacts as durable citations until the report is committed and visible on the publication ref.

Authored artifact durability: new and untracked. This determination artifact was created by the prep run and is pending local publication.

Primary evidence summarized: the Field Build 15 report; the current server workflow-map policy and its focused HTTP tests; current Admission full-gate, Prompt-out-currentness, and Propagation routeability source/tests; focused server and web test runs; live GitHub issue searches; exact readbacks for relevant closed workflow-map, Admission-to-Propagation, Prompt-out, search, and Creation-correction work; and durable methodology, principle, spec, ADR, domain, tracker, and triage authorities.

Live checkout snapshot: refreshed on 2026-07-10 on branch `main` at `bb82150`. `HEAD` and `origin/main` are identical. Intake dirt was pre-existing: modified `.claude/skills/field-build-prd-prep/SKILL.md`, modified `.claude/skills/field-build/SKILL.md`, modified `reports/field-build-14-jon-urena-chrononaut-prd-prep.md`, and untracked source report `reports/field-build-15-jon-urena-chrononaut.md`. No `apps/` or `packages/` path was dirty at intake.

Tracker freshness: refreshed live on 2026-07-10. The open-issue list returned `[]`. Searches for workflow-map/Propagation/Admission/canon-debt priority, fresh propagation debt, foregrounded owed propagation, and next-decision overlap found no open issue. Relevant closed work includes #171, #182, #270, #286, #292, #295, #308, #328, #336-#338, #343-#347. Same-kind PRD house-style exemplars #308 and #292 were read directly.

Deliverable status: PRD-ready determination only. This run did not change product code, specs, principles, ADRs, methodology documents, issue state, issue labels, or published PRDs. It did not run `/to-prd`'s seam checkpoint.

## Reassessment Verdict

Field Build 15 validates the full-gate route that Field Build 14 left at the frontier and exposes one fresh codebase-wide product gap.

Fixed or validated:

1. The existing Jon world resumes at the intended `FAC-3` full-gate frontier.
2. Severe/foundational Admission exposes the required 17-section full-gate contract.
3. Admission Proposal and Pressure Prompt-out packets are current, self-contained, and stale-aware.
4. Full-gate completion persists `FAC-3` as `accepted with constraints`, preserves the narrower accepted fact text, and creates source-linked, routeable Propagation debt.
5. Field Build 14 Admission pre-load Prompt-out currentness is covered by closed #343/#344/#345 and is validated on the active full-gate route.
6. The carried search, Creation current-packet, and narrowing-note families are covered by closed tracker work and current source even though this field route did not replay them.

Remaining product work: when a routeable open Propagation debt and an Admission queue coexist, the server-owned workflow map makes Admission the primary next decision. Current code and a focused test explicitly preserve that ordering. The map therefore under-prioritizes a governed shock-cone obligation that was just created by accepting a severe/foundational fact.

Recommended first PRD: **Workflow Map Propagation-Debt Arbitration**. It should make routeable owed Propagation the primary recommendation before further Admission while leaving Admission visible and available. This is guidance priority, not a hard canon-governance block.

Publication package: one intended PRD plus deferred verification/reopen and coverage follow-up. No multi-PRD program is warranted by this report.

Follow-ons: active-route replay of the changed both-queues state; continued field building through `DEB-7`; and verification/reopen only if the covered search, Creation current-packet, or narrowing-note routes regress.

Coverage-only work: the `V-*` findings and the completed Admission/Propagation persistence path remain validation evidence. They do not need duplicate product issues.

Supporting-skill result: no supporting product-design or domain-modeling skill was needed. Existing vocabulary and architecture provide a single clear seam.

External research: not needed. This is a repo-authority, live-source, and tracker reconciliation.

## Evidence Checked

| Finding or candidate | Status | Evidence and PRD impact |
|---|---|---|
| `V-01` existing Jon world reopens at the `FAC-3` frontier | validated/no product scope | Same-commit field evidence proves continuation and queue-state resume. Keep as field-build coverage only. |
| `V-02` `FAC-3` exposes the required 17-section decision | validated/no product scope | Current Admission policy composes 13 full-gate sections plus four foundational sections, and current server/web tests preserve the contract and non-current pre-load warning. No new gate PRD. |
| `V-03` full-gate Prompt-out packets are current, self-contained, and stale-aware | validated/no product scope | Same-commit field hashes and current Prompt-out/currentness source support the claim. Preserve as active-route validation, not new scope. |
| `V-04` full-gate completion persists accepted-with-constraints canon and creates Propagation debt | validated/no product scope | Current Admission completion creates the accepted living record plus a typed `derived_from` debt link; current Propagation queue tests prove non-null source identity and a start/resume route. This validates closed #292/#295. |
| `P-01` Workflow map routes to Admission while fresh `FAC-3` Propagation debt waits | fresh product scope | Current server policy checks a nonempty Admission queue before Propagation, and the focused workflow-map test asserts Admission when both queues are nonempty. Select as the first PRD. |
| App Seed 1 - Workflow map should arbitrate fresh Propagation debt before more major Admission | fresh product scope | Same scope as `P-01`; package once, not as a second issue family. |
| Field Build 14 `R-01` pre-load Admission Prompt-out currentness | covered | Closed #343/#344/#345 plus `V-02` active-route proof and current pre-load source. Reopen only if a future Admission replay contradicts current state. |
| Field Build 14 `F-01` search endpoint failure on short-ID punctuation | covered | Closed #346/#347 plus current HTTP/store tests for `FAC-`, exact short IDs, punctuation, quotes, prose, and empty input. This field run not reaching search does not create new scope. |
| Field Build 11 `P-01` stale secondary Creation Prompt-out preview | covered | Closed #336/#337/#338 plus current web current-packet identity tests. Admission stale/current success is adjacent evidence, not a substitute replay. |
| Field Build 11 `F-02` duplicate narrowing-note correction contexts | covered | Closed #328 plus current idempotent narrowing-note source and server/web readback tests. Historical duplicate provenance is not evidence of a current mutation defect. |
| `For the methodology` - no source change proposed | validated/no product scope | The package already requires Propagation after Level 2+ facts and prevents unmanaged canon debt from silently becoming a foundation. The gap is app routing. |
| Frontier - resume at routeable `DEB-7` before dependency-bearing Admission work | validated/no product scope | This is the correct world-authoring and replay frontier. It supplies acceptance evidence for `P-01` but is not a second product feature. |
| Frontier - `FAC-2` remains proposed and `DEB-1` through `DEB-7` remain open | validated/no product scope | Live field state explains why both queues coexist. The PRD should change recommendation priority without reclassifying or mutating those records. |

The decision-point log contains no independent product candidate beyond `P-01`: setup, selection, Proposal, Pressure, completion, and persistence all map to `V-01` through `V-04`; only post-completion routing maps to the fresh gap.

### Live Source And Test Findings

- The report's app commit `bb82150` is current `HEAD` and `origin/main`, so there is no post-report code drift to explain away `P-01`.
- The server map computes the active destination as Admission whenever the Admission queue is nonempty after Creation coverage clears.
- The server map computes `nextDecision` in the same order: Creation coverage, Admission queue, owed boundaries, then owed Propagation.
- The focused server workflow-map fixture intentionally creates a proposed fact, a major accepted fact, routeable Propagation debt, and an owed boundary at the same time; it asserts that both Admission and Propagation are visible but the primary next decision is Admission.
- The Propagation queue already resolves a typed source fact and start/resume route. The gap is not data loss, missing debt, or a dead route.
- The browser workflow-map home renders the server-returned next-decision label, reason, and destination; it does not own priority policy.
- Focused verification passed at current `HEAD`: server workflow-map plus Propagation active-route tests, 10 tests; web workflow-shell tests, 3 tests.

### Live Tracker Findings

- No open issues existed at refresh time.
- Closed #171/#182 established the map as home, its server-owned payload, queue counts, and a next-decision pointer, but did not define the both-queues arbitration exposed here.
- Closed #270/#286 established the routed Propagation destination and owed-debt active route.
- Closed #292/#295 established accepted standing, source-linked Admission-created Propagation debt, queue routeability, and owed-Propagation foregrounding when that work is the available paved path. They did not accept the remaining-Admission-queue case now proven by Field Build 15.
- Closed #308 is the nearest same-kind workflow-map priority PRD: it corrected one state where the map's primary guidance diverged from methodology order while preserving server ownership, read-only behavior, and other routes.
- Closed #343/#344/#345, #346/#347, #336/#337/#338, and #328 consume the carried Admission currentness, search, Creation current-packet, and narrowing-note candidates.

## Authority Findings

### Methodology And Vocabulary

No methodology or glossary change is owed.

- `docs/worldbuilding-system/03_truth_layers_and_canon_governance.md` says canon debt must be named, scoped, assigned, and not concealed, and that unmanaged canon debt should not become the foundation for another major fact.
- `docs/worldbuilding-system/07_propagation_engine.md` requires the Propagation sweep after any Level 2+ fact and after lower-level facts that unexpectedly create a shock cone.
- `docs/worldbuilding-system/checklists/propagation_sweep.md` defines the completed sweep evidence: shock-cone summary, relevant domain ripples, stop condition, and canon debt.
- `docs/worldbuilding-system/22_glossary.md` already defines `canon debt` and `Propagation`; `CONTEXT.md` already defines `Admission queue`, `decision point`, `Prompt packet`, and `Workflow map`. No new domain term is needed for priority or arbitration.

### Principles

No principle amendment is owed.

- `guided-workflow-usability.md` W-10 requires the map to show the most likely next decision and why it is next.
- `workflow-principles.md` W-4 says open canon debt surfaces as a warning, not a hard block. The selected rule therefore changes the primary recommendation while preserving steward access to Admission.
- `workflow-principles.md` W-2/W-3/W-7 remain intact: severity scales obligations, Propagation never admits, and the full gate's substantive follow-up stays visible.
- `domain-fidelity.md` P-1/T-2 and `canon-sovereignty.md` P-2 remain non-contradicted. No label, status, operation, or steward judgment is inferred.

### Specs

A future PRD should update stable specs as implementation scope.

- `docs/specs/workflow-map-and-navigation.md` currently lists Admission before owed Propagation in its foregrounding order and current server behavior follows that order. It needs an explicit both-queues rule: after Creation-owned prerequisites clear, routeable owed Propagation for an accepted shock-cone-bearing fact is the primary recommendation before further Admission, while Admission stays visible and available.
- `docs/specs/propagation-flow.md` already says owed debt is the paved path rather than a gate. It may receive a narrow cross-reference clarifying map priority, but its flow interior and persistence contract do not need redesign.
- `docs/specs/browser-visible-guidance-acceptance.md` already supplies the active-route and cognitive-walkthrough proof standard.
- Admission and Prompt-out specs do not need product changes for this PRD.

### ADRs And Architecture

No ADR change is owed.

- ADR 0006 keeps Admission canon-standing and Admission-specific policy server-owned; this PRD does not change Admission jurisdiction.
- ADR 0008 permits behavior-owned policy to stay with the relevant flow/module while shared world-file invariants remain unchanged; no persistence migration is expected.
- ADR 0009 requires the browser to render server-owned guided-flow policy. Arbitration belongs in the server workflow-map policy, with the web surface rendering the returned state.

### Tracker Conventions

`docs/agents/issue-tracker.md` and `docs/agents/triage-labels.md` were consulted. The later PRD touches browser workflow navigation, so it owes the browser-visible guidance checklist before `ready-for-agent` or `ready-for-human` is appropriate.

All stable authority paths cited above are tracked, clean, and visible on `origin/main` at refresh time.

## Recommended First PRD

### Workflow Map Propagation-Debt Arbitration

Purpose: make the map's primary guidance honor a routeable Propagation obligation created by accepted canon before steering the steward into more Admission work.

Sources: Field Build 15 `P-01` and App Seed 1, summarized from the pending-local-publication report; durable methodology chapters `03` and `07`; the Propagation sweep checklist; workflow-map, Propagation, and browser-guidance specs; W-4 and W-10; ADR 0009; closed #171/#182, #270/#286, #292/#295, and #308; current map/queue source and tests.

Problem: the app can correctly accept a severe/foundational fact, mint source-linked Propagation debt, and expose a working Propagation route, yet still recommend Admission solely because another proposed fact remains queued. A steward following the one primary map action can continue major governance before working or deliberately declining the newly owed shock cone.

Recommended product rule or seam:

1. Preserve all current Creation-owned prerequisites and coverage blockers ahead of downstream work.
2. Once those prerequisites clear, when the competing primary recommendation would otherwise be Admission, an open, routeable Propagation debt tied to an accepted fact that owes shock-cone work becomes the primary `nextDecision` before the remaining Admission queue. Preserve the relative order of other owed destinations unless separate evidence changes it.
3. Keep Admission visible, active when its queue has work, and directly navigable. The Propagation recommendation is a warning-backed priority, not a hard block or a canon-status restriction.
4. Explain the recommendation with server-owned reason text that names the owed Propagation condition and why it precedes more dependency-bearing Admission work.
5. Reuse #295's existing Propagation-destination missing-source blocker: the new priority predicate selects only a routeable item and never turns debt with missing source identity or route into a startable map decision.
6. Keep queue counts, stage states, destination states, next decision, and safe return behavior mutually consistent after refresh.
7. Keep the browser policy-free: it renders the returned priority and routes but does not recompute debt severity, source identity, or queue arbitration.

Scope:

- Server-owned workflow-map arbitration over existing Admission and Propagation queue payloads.
- Existing `nextDecision`, stage, queue, and destination behavior; introduce no new shared contract field unless the existing label/reason/destination shape cannot make the rule truthful.
- Workflow-map/navigation spec clarification for the both-queues state.
- Browser-visible next-decision reason and both-queue orientation.
- Focused server and web regression coverage.
- One active-route replay from accepted major-or-higher Admission completion with follow-up debt and another proposed fact still queued.

Acceptance:

1. A world with cleared Creation prerequisites, a nonempty Admission queue, and routeable owed Propagation from an accepted Level 2+/major-or-higher fact returns Propagation as the primary next decision.
2. The same payload still shows the Admission queue count and an available Admission destination; no new hard block, status transition, or record write occurs.
3. The primary reason explains that routeable Propagation debt is waiting before more dependency-bearing Admission work.
4. Returning to the map after Admission completion refreshes to this state without browser-side inference.
5. Entering the recommended destination reaches the existing owed Propagation item with source fact, debt identity, severity, and start/resume route from #292/#295.
6. An unrouteable Propagation debt cannot masquerade as a working map next decision; the existing missing-source blocker remains visible in the Propagation destination.
7. Existing no-kernel, kernel/no-seed, unresolved Creation coverage, Admission-only, owed-boundary, Minimal Viable World, and no-owed-work states remain regression-green.
8. The map remains read-only.
9. A naive-steward walkthrough proves that, after completing a major full gate while another proposal remains queued, the steward sees why Propagation is primary, can still find Admission, can enter the owed run, and can return with orientation intact.

Likely issue slices:

1. Server workflow-map arbitration, spec clarification, and focused HTTP regressions for the both-queues state.
2. Browser-visible both-queues guidance, active-route replay, and closeout evidence against the exact Field Build 15 frontier.

Out of scope:

- Changing Admission full-gate fields, Prompt-out packets, canon-status transitions, debt creation, or Propagation run internals.
- Hard-blocking Admission while debt is open.
- Automatically inferring whether a proposed fact depends on the debt source.
- Adding a new debt-deferral state, workflow engine, scheduling system, or generalized priority framework.
- Reordering owed boundaries, Temporal/Timeline debt, or other downstream destinations relative to each other; this PRD resolves only the proven Admission-versus-routeable-Propagation collision.
- Reopening the covered search, Creation current-packet, narrowing-note, or Admission pre-load-currentness families.
- Changing the methodology package, glossary, principles, or ADRs.

## Follow-On Candidates

These are deferred verification/reopen candidates, not part of the first PRD.

### Verification/Reopen Candidate: Search Punctuation Active-Route Replay

Purpose: verify the old Field Build 14 `FAC-` failure only if field work returns to search or a current API replay fails.

Sources: Field Build 14 `F-01`, closed #346/#347, current server search source, and current store/HTTP punctuation tests.

Problem: Field Build 15 did not revisit search, but live source and closed tracker work say the defect is fixed.

Recommended rule or open design point: reopen only on a current failure for short-ID prefixes or malformed punctuation; do not publish duplicate scope from not-reached evidence.

Scope if triggered: exact failing query, HTTP/store parity, read-only preservation, and focused punctuation regression.

Acceptance if triggered: the current API repro fails before the fix and passes afterward without narrowing ordinary prose search.

### Verification/Reopen Candidate: Creation Current-Packet Replay

Purpose: recheck Field Build 11 `P-01` only if a future Creation correction/mode-switch route shows the stale secondary preview again.

Sources: closed #336/#337/#338 and current Creation web current-packet tests.

Problem: Field Build 15 validated Admission packet currentness, not the exact Creation route.

Recommended rule or open design point: keep the family closed unless the exact Creation active route contradicts the closed replay.

Scope if triggered: selected section, mode, correction state, packet identity, stale preview suppression, and current copy/export/store actions.

Acceptance if triggered: exact active-route browser replay plus packet-origin readback.

### Verification/Reopen Candidate: Narrowing-Note Retry Safety

Purpose: recheck Field Build 11 `F-02` only if a current retry creates a second correction context for identical narrowing-note substance.

Sources: closed #328 and current idempotence/readback source and tests.

Problem: historical duplicate contexts remain visible, but no current mutation failure was exercised in Field Build 15.

Recommended rule or open design point: distinguish historical provenance from a newly reproducible idempotence failure.

Scope if triggered: exact retry payload, correction-context identity, typed links, applied-note readback, and no duplicate record creation.

Acceptance if triggered: same-substance retry returns the existing context and one durable link set.

## Coverage Follow-Up

The first implementation closeout should replay the exact Field Build 15 post-completion state rather than only a representative queue fixture:

- complete a major-or-higher Admission gate with follow-up Propagation debt while another proposed fact remains queued;
- return to a freshly loaded workflow map;
- verify Propagation is the primary recommendation with an explanatory reason;
- verify Admission remains visible and navigable;
- enter the owed Propagation item and confirm existing source/debt/severity/start state;
- verify the map and route perform no unintended mutation;
- record browser console state and server/API readback appropriate to the active route.

Continued field building should then work `DEB-7` through the Propagation flow before treating `FAC-3` as support for more major/foundational work. New product scope should open only if that run exposes a distinct blocker in the active Propagation flow, report closeout, surfaced-proposal handoff, or return-to-map state.

The carried search, Creation current-packet, and narrowing-note families need no mandatory replay in this PRD. They become product work only on a current failing repro.

## Rejected Or No-Op Alternatives

- **No new PRD.** Rejected because current source and focused tests reproduce the report's both-queues priority gap at the same commit; this is not stale report evidence.
- **Reopen #292/#295 wholesale.** Rejected because source-linked debt, routeability, start/resume identity, and the Propagation destination work. The missing behavior is narrower cross-queue arbitration.
- **Hard-block Admission until every Propagation debt closes.** Rejected because W-4 makes canon debt a warning rather than a hard block and the steward retains judgment.
- **Infer cross-record dependency before routing.** Rejected for the first PRD because the app already has a machine-readable owed Propagation item and the methodology says to run the sweep after Level 2+ facts. A new dependency analyzer would widen the seam without evidence.
- **Add an explicit debt-deferral record or general scheduler now.** Rejected because existing queue state and primary recommendation can fix the observed route. Add persistence only if implementation proves the current contract cannot represent an honest non-blocking priority.
- **Bundle the covered Prompt-out, search, or narrowing-note regressions.** Rejected because those families have separate closed PRDs/issues and current source coverage.
- **Amend the methodology, glossary, principles, or ADRs.** Rejected because existing authorities already specify the obligation, non-blocking posture, map responsibility, and server/browser boundary.

## PRD Publication Inputs

Suggested title: **PRD: Workflow map Propagation-debt arbitration — routeable owed work before further Admission**

Publication package: one intended PRD plus deferred verification/reopen and coverage follow-up. Publish only the workflow-map arbitration PRD unless the user later requests additional independently proven scope.

Recommended testing seam:

- Primary: existing server workflow-map HTTP seam over temp-file world databases, using the natural Admission-created debt link and Propagation queue route. Assert external payload behavior and read-only preservation.
- Secondary: existing web workflow-map render seam, asserting visible primary reason, both queue signals, and navigation destinations from a server-shaped payload.
- Closeout evidence: one targeted browser-visible active-route replay from Admission completion through refreshed map to owed Propagation start.
- No new seam is recommended. `/to-prd` must still run its seam-confirmation checkpoint before publication.

`/to-prd` consultation status: consulted for house style only. This prep reused its source-durability rule, publication-package taxonomy, title/body expectations, seam-input requirements, label posture, and browser-visible checklist mapping. No PRD body was drafted or staged, no issue was published or verified, and no `/to-prd` checkpoint was run.

Same-kind house style: use closed #308 for workflow-map state/priority framing and closed #292 for Admission-to-Propagation handoff terminology and active-route evidence. Preserve `PRD: <name> — <key mechanisms>`, an untitled provenance preamble, extensive numbered user stories, stable domain identifiers rather than volatile code symbols, explicit testing decisions, Principles, Out of Scope, and Further Notes.

Likely label and downgrades:

- Before the later `/to-prd` seam checkpoint and scope ratification, use `needs-triage`.
- If the user ratifies the recommended existing seams, the PRD maps every applicable browser-visible checklist item, and no new contract/deferral decision emerges, `ready-for-agent` plus the same-kind `enhancement` type label is likely appropriate.
- Downgrade or keep `needs-triage` if implementation requires a new shared priority contract, generalized scheduler, persisted deferral semantics, unresolved behavior for unrouteable debt, or an open choice between hard blocking and non-blocking guidance.

Authorities to cite:

- `docs/worldbuilding-system/03_truth_layers_and_canon_governance.md`
- `docs/worldbuilding-system/07_propagation_engine.md`
- `docs/worldbuilding-system/checklists/propagation_sweep.md`
- `docs/worldbuilding-system/22_glossary.md`
- `CONTEXT.md`
- `docs/specs/workflow-map-and-navigation.md`
- `docs/specs/propagation-flow.md`
- `docs/specs/browser-visible-guidance-acceptance.md`
- `docs/principles/README.md`
- `docs/principles/workflow-principles.md`
- `docs/principles/guided-workflow-usability.md`
- `docs/principles/domain-fidelity.md`
- `docs/principles/canon-sovereignty.md`
- ADR 0006, ADR 0008, and ADR 0009
- closed #171/#182, #270/#286, #292/#295, and #308

Do not cite the pending-local-publication Field Build 15 report or its machine-local evidence paths as stable sources. Summarize `P-01`, the same-commit both-queues observation, and the selected product rule in the PRD provenance preamble until the report is durable.

### Browser-Visible Guidance Checklist Mapping

| Checklist item | Required PRD home |
|---|---|
| package source cited | Preamble and Principles cite methodology `03`/`07`, the Propagation checklist, workflow-map/Propagation specs, W-4/W-10, ADR 0009, and relevant closed PRDs. |
| decision-point contract named | Problem, Solution, Implementation Decisions, and Testing Decisions name the workflow-map next-decision arbitration and owed-Propagation run-entry handoff. |
| required, optional, skippable, and severity-dependent fields visible | N/A - the map adds no authoring fields. The PRD must still show the severity/owed condition that activates priority and preserve existing destination availability. |
| doctrine at the actual decision point | Solution and browser acceptance require app-owned reason text explaining why routeable Propagation debt is primary before further dependency-bearing Admission. |
| prompt packet preview, source manifest, and cold external LLM test | N/A - Prompt-out packet assembly and copyability are outside scope. Existing Propagation Prompt-out remains unchanged after route entry. |
| advisory/canon separation visible | N/A - no advisory material is created, displayed, or disposed by map arbitration. |
| skip path and reason storage | N/A - the workflow map is not a skippable instrument and performs no write. Admission remains available as the non-blocked alternative. |
| blockers/substance validation | Implementation and Testing Decisions preserve visible blocked handling for unrouteable debt and prevent a missing source/route from appearing startable. |
| current, next, and resume state | Core scope: both queue states, primary next decision, reason, destination, safe return, and refreshed post-Admission state must agree. |
| read-side audit or provenance link | The map remains read-only; the visible owed item must retain its existing source fact/debt identity and route from #292/#295. |
| cognitive walkthrough scenario | Testing Decisions require the exact post-full-gate, another-proposal-waiting, return-to-map, enter-Propagation, and Admission-still-available scenario. |

Canonical implementation gates:

- `pnpm test`
- `pnpm typecheck`
- `pnpm build`

Focused implementation gates:

- server workflow-map HTTP tests;
- server Propagation active-route tests when natural debt routeability is part of the fixture;
- web workflow-shell/map rendering tests;
- targeted active-route browser replay.

Evidence expectations:

- Server readback for accepted source fact, source-linked open Propagation debt, nonempty Admission queue, routeable Propagation queue item, stage/queue/destination state, primary next decision, and read-only record count.
- Browser-visible map proof with the Propagation primary reason, both queue counts/routes, Admission availability, entry into the owed item, safe return, and no console errors.
- Field replay closeout mapping directly back to Field Build 15 `P-01`; representative fixtures may support but not replace the exact active route.
- No cold-LLM evidence is required because the PRD does not change Prompt-out.

## Completion Self-Check

- `/to-prd` consulted for house style only: yes.
- Source artifact posture recorded: yes; pending local publication because untracked.
- Machine-local field evidence handling recorded: yes; summarized, not cited, with paths excluded.
- Authored artifact posture recorded: yes; new/untracked and pending local publication.
- Tracker freshness recorded: yes; live open list, overlap searches, and exact relevant closed issues checked.
- Every `V`, `P`, app seed, methodology seed, regression item, and frontier item classified: yes.
- Selected first PRD recorded: yes; Workflow Map Propagation-Debt Arbitration.
- Publication package recorded: yes; one intended PRD plus deferred verification/reopen and coverage follow-up.
- Recommended testing seam and owed seam checkpoint recorded: yes.
- Likely label and downgrade conditions recorded: yes.
- Issue-tracker and triage-label docs consulted: yes.
- Browser-visible checklist mapping recorded: yes.
- Canonical and focused gates recorded: yes.
- No code, tracker, PRD, label, methodology, principle, ADR, or spec mutation claimed: yes.
- Post-write machine-local path and stale-publication-language sweep completed: yes; no accidental machine-local source path or stale publication-gate phrasing remains.

## Freshness And Boundaries

Refreshed in this session:

- branch, `HEAD`, `origin/main`, baseline worktree dirt, source-report status, and missing same-stem artifact proof;
- the complete Field Build 15 report and relevant Field Build 14 prep context;
- current workflow-map, Admission, Propagation, Prompt-out-currentness, search, and Creation-correction source/test surfaces;
- methodology, glossary, domain vocabulary, principles, specs, ADRs, issue-tracker, and triage-label authorities;
- live tracker overlap and exact relevant closed issue state;
- same-kind PRD house style from #308 and #292;
- focused server and web tests at current `HEAD`.

Not done:

- no product implementation or refactor;
- no methodology, principle, ADR, spec, or domain-doc edit;
- no issue/PRD draft, staging, publication, label, comment, closure, or verification;
- no `/to-prd` seam confirmation;
- no live browser or app-server run, because same-commit field evidence plus current focused source/tests were sufficient for prep; the browser replay is an implementation closeout requirement;
- no root canonical gates, because this prep changed only a report artifact and did not change product, package, workflow, or build configuration.

Pre-existing worktree dirt left untouched: modified `.claude/skills/field-build-prd-prep/SKILL.md`, modified `.claude/skills/field-build/SKILL.md`, modified `reports/field-build-14-jon-urena-chrononaut-prd-prep.md`, and untracked `reports/field-build-15-jon-urena-chrononaut.md`.

Files intentionally added by this prep: `reports/field-build-15-jon-urena-chrononaut-prd-prep.md` only.
