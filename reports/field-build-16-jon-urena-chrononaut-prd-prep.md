# Field Build 16 PRD-Ready Determination: Pre-Close Propagation Revision

Source artifact: `reports/field-build-16-jon-urena-chrononaut.md`.

Selected source sections: all eight `Findings` entries (`V-01` through `V-03`, `P-01` through `P-02`, and `F-01` through `F-03`); `Regression of prior findings`; the complete `Decision-point log`; `For the app (PRD seeds)`; `For the methodology`; and `Frontier`.

Existing same-stem prep artifact classification: none. The default same-stem path was missing at intake.

Source durability: durable. The source report is tracked, clean, and visible on `origin/main`; current `HEAD` and `origin/main` both resolve to `cb34ded`. Its machine-local world file, screenshots, prompt packets, cold outputs, and API readbacks are summarized by the durable report and are not stable citation targets for the later PRD.

Authored-artifact durability: new and untracked. This determination artifact is pending local publication until committed and visible on the publication ref.

Primary evidence summarized: the durable Field Build 16 report; current Propagation routes, flow policy, staging tables, Prompt-out assembly, browser controls, and focused test coverage; the diff from the report's app commit to current `HEAD`; live GitHub issue searches and exact closed-issue readbacks; prior durable Field Build 14 and 15 determinations for carried findings; and current methodology, principle, spec, ADR, domain, tracker, and triage authorities.

Live checkout snapshot: refreshed on 2026-07-10 on branch `main` at `cb34ded`, identical to `origin/main`. Intake `git status --short` was clean. The only commit after the report's app commit `945c626` changes the Field Build skill and adds the Field Build 16 report; no product, spec, principle, ADR, methodology, package, or app path changed after the reported run.

Tracker freshness: refreshed live on 2026-07-10. The open-issue list returned `[]`. Exact readbacks covered closed PRDs and children #29, #204, #270, #287-#291, #328-#330, #336-#338, #346-#348, and #349-#352, plus the report's prior-art set #109-#113, #201/#202, and #205-#210. Searches for Propagation revision, blocker identity, rationale persistence, atlas packet context, and related-world context found no open overlap.

Deliverable status: PRD-ready determination only. This run did not change product code, specs, principles, ADRs, methodology documents, tracker issues, tracker labels, or published PRDs. It did not run `/to-prd`'s seam checkpoint.

## Reassessment Verdict

Field Build 16 validates the repaired Admission-to-Propagation routing and the core foundational Propagation coverage contract, then proves one blocking product seam the app does not currently have: a steward cannot revise Pressure-challenged material before the append-only report is closed.

Fixed or validated:

1. Closed PRD #348 is validated on both sides of the route: routeable owed Propagation is primary, Admission remains directly usable, and safe return refreshes the map.
2. Six shock-cone orders, all fourteen atlas domains, high-pressure stopping states, persisted readback, and non-Admission write intent work at the foundational severity path.
3. Current Pressure can challenge the exact authored consequences and domains without becoming canon.
4. The carried search, Creation current-packet, and narrowing-note families are covered by closed #346/#347, #336-#338, and #328-#330 plus current source/tests, despite not being replayed in this field run.

Remaining product work: the active Propagation run has append-only consequence creation, upserted domain rows, immutable one-per-consequence dispositions, and no browser or HTTP action to revise, retract, or supersede a staged consequence. Close readiness is computed only from coverage and dispositions, so it can report `ready` after Pressure has exposed material the steward now knows should change.

Recommended first PRD: **Pre-Close Propagation Revision Lifecycle**. It should define an audit-safe active-row lifecycle before close, invalidate dependent stopping rulings and close readiness after revision, stale any packet that represented the old material, and preserve the propagation report's append-only boundary after close. Prompt-out remains optional: a substantive revision reopens the support beat, but the steward may use a fresh Pressure packet or the governed skip path rather than being forced to use an external LLM.

Publication package: one first PRD plus deferred follow-on and verification/reopen candidates. This is not yet a ratified multi-PRD program.

Follow-ons: a separate Foundational Propagation Packet Context PRD for `P-01`/`P-02`; active-route verification and likely reopen work against #287 for `F-01` and #288 for `F-02`; and a post-implementation field replay through revision, fresh Pressure, and close.

Coverage-only work: `V-01` through `V-03`, the validation-only routing seed, and the current DEB-7 world frontier are evidence and replay surfaces, not duplicate product scope.

Supporting-skill result: no supporting product-design, domain-modeling, or research skill was needed. Existing domain language and architecture expose a clear Propagation-owned seam.

External research: not needed. The product rule follows the repo's methodology, current code, live tracker, and field evidence.

## Evidence Checked

| Finding or candidate | Status | Evidence and PRD impact |
|---|---|---|
| `V-01` Field Build 15 routing gap is fixed across both sides of the boundary | validated/no product scope | The report replays the exact both-queues route fixed by #348/#349-#352. Current checkout has no later product drift. Preserve as closeout validation; do not publish another routing PRD. |
| `V-02` foundational Propagation enforces and persists six orders plus the full atlas | validated/no product scope | Current severity policy, blockers, stores, and report flow still encode all six orders and fourteen domains. This validates the core #270/#287-#291 contract, without resolving revision or packet-context gaps. |
| `V-03` current Pressure exposes assumption and mystery overreach | validated/no product scope | The field packet challenged exact staged material and current source assembles consequences, domains, dispositions, blockers, and omissions. Challenge quality is coverage evidence; revision remains `F-03` and context breadth remains `P-02`. |
| `P-01` foundational Proposal names full-atlas duty but omits the atlas | follow-on candidate | Current Prompt-out code uses the fourteen names only to compute a blocker, then emits a coverage label/count rather than the ordered inventory and decision prompts. #289 accepted domain-atlas state, not replacement-grade atlas doctrine; a focused packet-context PRD should deepen this separately from row revision. |
| `P-02` Propagation Pressure omits related canon and kernel tone | follow-on candidate | Current Propagation assembly selects the source fact, debt, run rows, dispositions, proposals, and blockers but no linked kernel, sibling canon, dependency-bearing proposed records, or record-specific graph omissions. #204 hardened rendering and #289 integrated the current run; neither defined this related-world selection rule. |
| `F-01` duplicate React blocker keys for multiple open high-pressure consequences | verification/reopen candidate | Current server blockers repeat the literal key `undispositioned-high-pressure` for every row, while the browser contract renders keyed blocker lists. This conflicts with #287's accepted multi-update blocker surface; replay on a fresh current world should lead to a narrow reopen/bug fix, not a new PRD by default. |
| `F-02` answered disposition drops the visible optional rationale | verification/reopen candidate | #288 explicitly accepted rationale for answered/scoped-out states. Current browser labels one input `Debt or boundary` but sends the separate shared prose field as `note`; the field run entered the visible rationale and read back an empty note. Replay should reopen the #288 family rather than publish duplicate product scope. |
| `F-03` Pressure finds errors but the active run has no revision path | fresh product scope | Current HTTP routes expose consequence create, domain upsert, disposition create, and close, but no consequence revision/retraction/supersession. Dispositions are unique and update-rejected, the browser has no row action, and close readiness ignores Pressure-earned revision. Select as the first PRD. |
| `App Seed 1` pre-close Propagation revision lifecycle | fresh product scope | Same seam as `F-03`; package once. It spans staged row lifecycle, dependent disposition invalidation, packet currentness, close readiness, browser actions, and the final report boundary. |
| `App Seed 2` foundational Propagation packet context | follow-on candidate | Same follow-on as `P-01`/`P-02`. Proposal and Pressure share one Propagation bearing-context/source-selection module and one cold-packet acceptance proof. |
| `App Seed 3` Propagation blocker and disposition integrity polish | verification/reopen candidate | Same accepted-scenario conflicts as `F-01`/`F-02`. Verify and reopen the nearest child families before considering a new aggregate PRD. |
| `Validation-only prior seed` closed PRD #348 | covered | Field Build 16 proves the routeable-debt priority, direct Admission alternative, and safe return that #348 accepted. No unconsumed routing scope remains. |
| Field Build 15 `P-01` Workflow-map Propagation-debt arbitration | covered | Closed #348/#349-#352 implemented the exact both-queues collision, and `V-01` replays its accepted route. |
| Field Build 14 `F-01` search endpoint failure on `FAC-` | covered | Closed #346/#347 and current HTTP/store tests cover short-ID prefixes, punctuation, quotes, prose, empty input, and read-only behavior. The Field Build 16 non-replay is not a new contradiction. |
| Field Build 11 `P-01` stale secondary Creation Prompt-out after correction/mode switch | covered | Closed #336/#337/#338 and current web current-packet tests cover the exact stale-secondary-preview family. Propagation packet currentness is adjacent, not the reason this is covered. |
| Field Build 11 `F-02` duplicate narrowing-note correction contexts | covered | Closed #328/#329/#330 and current idempotent narrowing-note lookup/readback tests consume the current mutation scenario. Historical duplicate records alone do not prove a present write defect. |
| `For the methodology` no doctrine change requested | validated/no product scope | The package already says Pressure material is selected, edited, or discarded by the steward; reports become append-only after the pass; and high-pressure consequences stop only when governed. The app lifecycle is the missing layer. |
| `Frontier` DEB-7 remains open before revision and close | validated/no product scope | The parked world state is the exact post-implementation replay target. It is summarized by the durable report, but its machine-local database is not a stable PRD citation or independent product feature. |

The decision-point log adds no independent scope. Setup/routing maps to `V-01`; orders and stopping states map to `V-02`, `F-01`, and `F-02`; the atlas sweep maps to `P-01`; and the Pressure frontier maps to `V-03`, `P-02`, and `F-03`.

### Live Source And Test Findings

- Current product files are identical to the report's app commit. The only later commit changes the Field Build skill and adds the report, so none of the reported Propagation behavior was consumed after the run.
- The server emits one close-blocker object per undispositioned high-pressure consequence but gives each the same public key. Existing contract coverage asserts one such blocker, not stable identity for several.
- Consequences are insert-only; domain declarations are upserted by flow/domain; dispositions are unique per consequence and protected by a no-update trigger. This is not a coherent draft revision lifecycle.
- The browser offers Add Consequence, Record Domain, Save Disposition, and Close Run. It shows recorded consequence identifiers but no revise, retract, replace, or supersede affordance.
- The browser's `Debt or boundary` field is not the payload's `note`; `note` comes from the shared consequence/declaration prose field. That explains the exact `F-02` readback without implying a server inability to store notes.
- Propagation Prompt-out assembly has the full domain-name list only inside blocker calculation. Its emitted context carries required coverage, row counts, authored rows, dispositions, and blockers, but no ordered atlas doctrine or linked-world context graph.
- Existing server tests cover run routing, coverage, disposition validation, prompt assembly, close, and append-only reports. Existing web tests cover the rendered active destination at a broad contract level. No current test covers a Pressure-earned pre-close revision loop.
- Focused product tests were not run for this report-only prep: the current source plus the no-product-drift proof already distinguishes the fresh, covered, and reopen classifications, while existing tests do not exercise the missing lifecycle. Canonical repo gates were also skipped because no product, workflow, package, or build surface changed.

### Live Tracker Findings

- No open issue existed at refresh time, and overlap searches found no unpublished Propagation revision or context family.
- Closed #29 established the append-only propagation report, resumable runs, consequence dispositions, and the existing HTTP/store seams. It did not define how a still-open run revises Pressure-challenged staged rows.
- Closed #270/#287-#291 made the Propagation destination active. #287 accepted blocker updates and browser recovery, #288 accepted answered/scoped-out rationale, #289 accepted current packet state, and #290/#291 accepted close/read-side/replay. `F-01` and `F-02` therefore belong first in verification/reopen handling, while `F-03` is outside those accepted lifecycle scenarios.
- Closed #204 changed packet rendering, ordering, and conformance while explicitly leaving the content list and inclusion/omission rules unchanged. It is adjacent to `P-01`/`P-02`, not consuming work.
- Closed #348/#349-#352 consumes the prior workflow-map routing gap and is directly validated by `V-01`.
- Closed #328-#330, #336-#338, and #346/#347 consume the three carried findings that Field Build 16 did not replay.

## Authority Findings

### Methodology And Domain Vocabulary

No methodology or glossary change is owed.

- `docs/worldbuilding-system/07_propagation_engine.md` makes the propagation report the master shock-cone record and says it is not edited after the pass; that does not require an open draft to be uncorrectable before the report exists.
- The same chapter says not to stop at the first convenient explanation and defines four governed stopping states for every high-pressure consequence.
- `docs/worldbuilding-system/20_ai_assisted_workflow.md` says Pressure challenges steward-authored material, after which the steward selects, edits, combines, or discards and writes surviving material in their own wording.
- `docs/worldbuilding-system/04_domain_atlas.md` already owns the fourteen domains and their decision prompts. Packet work should derive from it rather than add doctrine.
- `CONTEXT.md` already defines Flow, Decision point, Prompt-out step, Prompt packet, Advisory artifact, and Standing ruling. The PRD needs no new app-domain term; `staged`, `active`, `superseded`, or `retracted` may be stable lifecycle values, not glossary prose.

### Principles

No principle amendment is owed.

- `workflow-principles.md` P-5 requires resumable/interleavable flows and cheap repair; W-7 requires substantive gates. A ready close state after acknowledged bad material conflicts with those duties.
- `guided-workflow-usability.md` W-8 requires visible blockers, write intent, recovery, next/resume state, and relevant context at the decision point. W-9 requires the app to carry the method without hidden docs.
- `canon-sovereignty.md` P-2/W-1 requires steward authorship, self-contained packets, current context, and optional/skippable Prompt-out. The first PRD must not turn external LLM Pressure into a mandatory close dependency.
- `data-principles.md` W-5/W-6 keeps the closed propagation report as the master append-only record while allowing a distinct pre-close staging lifecycle. T-3/T-5 require stable row identity and provenance for revision rather than content-keyed or silent destructive changes.

### Specs

A future first PRD should update stable specs as implementation scope.

- `docs/specs/propagation-flow.md` should distinguish open-run staged rows from the closed append-only report, define active/revised/retracted row behavior, specify dependent disposition invalidation, and state close-readiness/currentness behavior after revision.
- `docs/specs/prompt-out-context-assembly.md` should state that a Propagation row revision changes packet identity and makes the represented packet stale. It should preserve the optional/skippable Prompt-out contract.
- `docs/specs/browser-visible-guidance-acceptance.md` already supplies action-failure recovery, current/stale packet, readback, and exact active-route replay proof. No change is required unless the PRD adds a reusable revision-specific evidence rule.
- `docs/specs/schema-v1.md` is in scope only if the selected audit-safe lifecycle adds stable row state, revision lineage, or invalidation fields. The PRD should state the behavior before selecting the minimal schema shape.

The deferred packet-context PRD should update `docs/specs/prompt-out-context-assembly.md` and the Propagation flow spec with ordered atlas doctrine, related-record selection, and record-specific omissions. It should not be smuggled into the first PRD's staging work.

### ADRs And Architecture

No new ADR is currently owed.

- ADR 0007 keeps shared Prompt-out lifecycle/currentness in the Prompt-out module while Propagation owns flow-specific aftermath. Row revision belongs to Propagation; packet invalidation composes with the shared Prompt-out seam.
- ADR 0008 places flow-specific persistence with the owning flow store over `WorldFile`. The implementation should keep revision, lineage, disposition invalidation, and close-readiness policy inside the Propagation module/store rather than broaden generic substrate behavior.
- ADR 0009 requires the browser to consume server-owned policy and show action failure/recovery. The browser may present row actions but must not infer invalidation, close readiness, or packet currentness.
- An ADR becomes necessary only if implementation proposes a generalized cross-flow draft/revision framework, changes the report/card mutation regimes, or moves canon-governance policy into the browser. Those expansions are out of scope.

### Tracker Conventions And Durability

`docs/agents/issue-tracker.md` and `docs/agents/triage-labels.md` were consulted. The first PRD touches a guided flow and Prompt-out, so its body must contain the explicit browser-visible guidance checklist mapping before any `ready-for-agent` label is appropriate.

The source report and cited methodology, principles, specs, ADRs, domain docs, tracker docs, and triage docs are tracked, clean, and visible on `origin/main`. The authored prep artifact is new/untracked and remains pending local publication.

## Recommended First PRD

### Pre-Close Propagation Revision Lifecycle

Purpose: let the steward correct the still-open shock cone that Proposal or Pressure exposes as wrong without corrupting the final audit boundary, losing provenance, or closing known-bad material.

Sources: Field Build 16 `F-03` and App Seed 1; durable report sections for the Pressure/revision frontier; `07_propagation_engine.md`, `20_ai_assisted_workflow.md`, and the Propagation report template; Propagation, Prompt-out, schema, and browser-guidance specs; P-5, P-2/W-1, W-7-W-9, W-5/W-6/T-3/T-5; ADRs 0007-0009; closed #29, #270, and #287-#291; current routes, staging tables, flow policy, prompt assembly, browser actions, and tests.

Problem: a run can become mechanically ready while its current Pressure packet identifies false assumptions or overreach. The steward cannot revise a consequence, cannot retire a now-invalid consequence, cannot replace a disposition, and cannot see a server-owned revision blocker. Adding a contradictory new consequence does not repair the active set, while closing freezes the bad material into the append-only master report.

Recommended product rule or seam:

1. Treat consequence rows and domain declarations as **pre-close staged material** while the run is open. The server owns which row version is active and which rows are superseded or retracted.
2. Give every revision action stable identity, provenance, and an explicit reason. Prefer replacement/supersession or another audit-safe representation over silent destructive overwrite; closed report records remain immutable.
3. Revising or retracting a consequence invalidates its existing disposition and any derived close-ready state. The server returns the specific owed disposition/remediation blocker for the active replacement set.
4. Revising a domain declaration updates the active atlas state, preserves its revision provenance, and re-runs severity coverage and close readiness.
5. Any row change after a packet was generated makes that packet stale through the existing packet-origin/currentness contract. Copy, store, and advisory-use actions remain guarded by current identity.
6. Prompt-out remains optional. When a substantive revision follows a used Pressure beat, the UI reopens the Pressure-or-governed-skip choice; the product must not require an external LLM as the only route to close.
7. Close serializes the final active consequences, domains, stopping states, and relevant revision trail into one append-only propagation report, then freezes the run's revision actions. Corrections after close use the existing new-report correction path rather than reopening staged rows.
8. The browser renders server-owned active/superseded/retracted state, affected blockers, stale/current packet state, write intent, and exact recovery. It preserves typed revision material after a rejected action.
9. Safe return and resume reload the same active revision frontier. Read-side evidence distinguishes draft lineage from the closed master report and leaves source canon standing untouched.

Scope:

- Propagation flow/spec contract for open-run staged rows, revision lineage, active-set calculation, dependent disposition invalidation, and the closed-report boundary.
- Minimal schema/persistence changes required for audit-safe consequence/domain revision and disposition replacement or invalidation.
- Server HTTP actions and response shapes for revise, retract, supersede/replace, blockers, packet currentness, close preview, and close refusal.
- Browser row actions and status/readback for consequences, domains, and affected dispositions.
- Propagation Prompt-out packet identity/currentness after row changes; no packet-context breadth expansion.
- Server HTTP, direct invariant, web surface, and exact active-route replay evidence.

Acceptance:

1. Given an open foundational Propagation run with six orders, all fourteen domains, governed high-pressure consequences, and a current Pressure packet, revising one consequence produces an audit-visible active replacement or equivalent governed revision and retires the old text from the active close set.
2. The prior disposition for the revised consequence no longer satisfies close; the server returns a consequence-specific blocker until the active replacement is dispositioned.
3. Retracting a consequence removes it from the active close/report set while preserving its identity, text, actor/time/step provenance, revision reason, and relationship to the run.
4. Revising a domain declaration recomputes active atlas coverage and close readiness without silently destroying its previous value.
5. Any consequence/domain/disposition change stales the previously current Proposal or Pressure packet. Stale packet copy/store/use actions remain refused, and the UI names the changed material and recovery path.
6. The steward can load a fresh Pressure packet over the revised active set or record the governed skip allowed by W-1/W-4. The browser does not make external LLM use mandatory.
7. Close is refused while revision-created coverage or disposition blockers remain; no blocker-free `ready` state is shown for invalidated material.
8. After blockers clear, close writes one append-only report whose active shock cone matches the revised set and whose audit sections preserve enough revision lineage to explain what was superseded or retracted.
9. After close, revision routes and browser actions refuse mutation; the existing new-report correction path remains the repair route.
10. The source fact's canon standing, sibling proposed facts, Admission queue, unrelated debt, and advisory artifacts remain unchanged except for explicit existing links/actions.
11. A failed revise/retract/disposition action renders the server error near the row action, preserves entered material and selection, and names how to recover without console or network tooling.
12. A fresh-world browser walkthrough reproduces the Field Build 16 frontier, applies one Pressure-earned correction, re-dispositions the active row, obtains a fresh packet or governed skip, closes successfully, reads the report/audit trail, safely returns, and records console state.

Likely issue slices:

1. Propagation revision and finalization spec contract, including schema-v1 consequences and browser-checklist mapping.
2. Server/store tracer: consequence replacement/retraction, domain revision, disposition invalidation, active-set close readiness, packet staleness, and closed-run refusal through the HTTP seam.
3. Browser tracer: row revision actions, active/retired state, action-failure recovery, stale/current packet guidance, close blockers, and safe resume.
4. Exact active-route replay and closeout evidence using a recreatable world fixture plus a cold Pressure packet.

Out of scope:

- Changing source canon standing, Admission behavior, severity classification, the fourteen-domain doctrine, stopping-state vocabulary, or surfaced-proposal jurisdiction.
- Editing an already-closed propagation report or weakening report append-only enforcement.
- A generalized revision engine for every guided flow.
- Direct LLM integration or mandatory external LLM use.
- The `P-01`/`P-02` atlas and related-world packet-context expansion.
- The `F-01` duplicate blocker-key and `F-02` browser rationale fixes until their closed-family replay/reopen checks complete.
- Reopening #348 routing or the covered search, Creation current-packet, and narrowing-note families.

## Follow-On Candidates

### Foundational Propagation Packet Context

Purpose: make Proposal and Pressure packets replacement-grade at the foundational Propagation decision points.

Sources: `P-01`, `P-02`, and App Seed 2; `04_domain_atlas.md`, `07_propagation_engine.md`, `20_ai_assisted_workflow.md`; W-1, W-8, W-9; Prompt-out and Propagation specs; closed #204 and #289; current Propagation context assembly.

Problem: Proposal announces a full-atlas obligation without the inventory/prompts needed to propose across it, while Pressure lacks linked kernel/tone and nearby canon needed to distinguish unsupported assumptions from governed upstream context.

Recommended rule: derive a compact ordered atlas decision pack for foundational Proposal; select source-linked nearby canon, active kernel commitments, standing rulings, and dependency-bearing proposed records for Pressure; classify non-canon context visibly; and emit one record-specific omission reason for every relevant candidate excluded from the packet.

Scope: Propagation bearing-context/source-graph selection, compact atlas doctrine, source documents/manifest/omissions, focused server tests, browser preview parity, and cold external Proposal/Pressure tests. It does not change row revision, report finalization, Admission, or methodology.

Acceptance: a cold Proposal can name and reason across all fourteen domains without repository access; a cold Pressure can classify whether challenged tone/mechanism claims are supported, proposed, or absent; both packets expose exact sources and omissions while preserving advisory/canon separation.

### Verification/Reopen: Multi-Blocker Identity

Purpose: determine whether `F-01` should reopen #287's blocker/browser family.

Sources: Field Build 16 `F-01`; closed #287; current repeated server blocker key; current browser decision-contract rendering.

Open design point: blocker identity should be stable and consequence-specific in the server contract, not repaired only by a presentation-index key if other consumers need identity.

Scope: reproduce two or more undispositioned high-pressure consequences on current `main`, inspect browser DOM/console and payload identity, then reopen or file one narrow bug only if the current active route still fails.

Acceptance: every blocker row renders once with stable consequence identity and label, no duplicate-key console error occurs across refresh/rerender, and the close policy remains server-owned.

### Verification/Reopen: Answered Rationale Persistence

Purpose: determine whether `F-02` should reopen #288's accepted rationale scenario.

Sources: Field Build 16 `F-02`; closed #288; current browser field/payload mismatch; current server note persistence.

Open design point: use a dedicated optional rationale field for answered/scoped-out dispositions, with debt name and preservation boundary shown only for the states that require them.

Scope: replay answered and intentionally scoped-out saves through the active browser, inspect request/readback, then reopen or file one narrow bug if the note still drops.

Acceptance: visible optional rationale maps to `note`, survives API/run/report/read-side readback, irrelevant debt/boundary inputs are not presented as rationale, and validation failure preserves entered text.

These candidates are deferred from the first PRD. The packet-context work is independently implementable; the two polish items are closed-family verification/reopen work, not automatically ratified new PRDs.

## Coverage Follow-Up

1. After the first PRD lands, replay the exact reported frontier on a recreatable current-tree world: revise the challenged first-order consequence, condition the temporal-mechanics rows, re-govern affected dispositions, load fresh Pressure or record a governed skip, close, and inspect the report and read-side trail.
2. Run one cold external LLM Pressure check on the fresh revised packet. This proves the revision/currentness loop, not the deferred related-world context breadth.
3. Reproduce `F-01` and `F-02` independently before tracker mutation. A current active-route failure turns each into a reopen/bug candidate; a passing replay turns it into `covered` and prevents duplicate publication.
4. Field-build continuation may resume the parked Jon world after the lifecycle fix, but its machine-local path remains provenance summarized by the report rather than a stable PRD source.
5. Reopen the carried search, Creation current-packet, or narrowing-note families only if a current replay contradicts their closed issue acceptance and current source/tests.
6. Do not promote Propagation or Prompt-out methodology-coverage maturity from implementation tests alone; active-route browser and cold-packet evidence remain the promotion gate.

## Rejected Or No-Op Alternatives

- **Bundle `F-03`, `P-01`/`P-02`, and `F-01`/`F-02` into one PRD.** Rejected because they have different seams and acceptance proofs: draft lifecycle/finalization, packet context selection, blocker identity, and browser payload mapping.
- **Fix `F-03` with one browser Edit button.** Rejected because the server/store must own active identity, lineage, disposition invalidation, packet staleness, close readiness, and closed-run refusal.
- **Append a contradictory consequence and leave the old one active.** Rejected because the close set remains ambiguous and the final report can preserve known-bad material as if it were governed truth.
- **Edit or reopen the closed propagation report.** Rejected because `07`, W-5/W-6, the Propagation spec, and #29 make the report the append-only audit record; post-close repair creates a new report.
- **Make Pressure via an external LLM mandatory after every revision.** Rejected because W-1 makes every Prompt-out step optional and skippable. Fresh Pressure is the field-evidence path; a governed skip must remain a product path.
- **Treat `P-01`/`P-02` as already covered by #204 or #289.** Rejected because current source and cold field evidence show missing atlas doctrine and related-world selection beyond those issues' delivered rendering/current-run context.
- **Publish new PRDs immediately for `F-01` and `F-02`.** Rejected because #287/#288 already accepted the adjacent behavior; verification/reopen avoids duplicate scope and preserves tracker history.
- **Publish another workflow-map routing PRD.** Rejected because #348/#349-#352 are closed and `V-01` validates their exact behavior.
- **Change methodology, principles, or glossary instead of the app.** Rejected because the authorities already require revision, stewardship, resumability, substantive gates, and append-only final reports.
- **Implement during prep.** Rejected by the named skill boundary; this artifact is the stopping point for a later `/to-prd` pass.

## PRD Publication Inputs

Suggested title: `PRD: Pre-Close Propagation Revision — Audit-Safe Staging, Dependent Invalidation, And Finalization`.

Publication package: one first PRD plus deferred follow-on and verification/reopen candidates. Publish only the revision-lifecycle PRD unless the steward explicitly ratifies a broader program.

Recommended testing seams and seam checkpoint: reuse the existing localhost HTTP app seam over real temporary world databases as the primary seam; use direct Propagation store/SQL assertions only for revision-lineage, invalidation, and append-only invariants; use focused React surface tests plus one real browser active-route walkthrough for the guided-flow contract. No new seam is recommended. The later `/to-prd` Step 2 seam checkpoint is still owed.

`/to-prd` consultation status: consulted for house style only. This prep used its PRD body shape, source-durability rules, publication-package taxonomy, seam input, label posture, and browser-visible checklist requirements. It did not draft, stage, validate, publish, label, or verify a PRD issue.

Likely label and downgrades: if published directly from this prep, use `enhancement` plus `needs-triage` because the steward has not yet ratified the audit-safe row-revision representation or the exact testing seams. After the later seam checkpoint ratifies the existing seams and the PRD fixes one action-ready revision representation, `ready-for-agent` is appropriate if every applicable browser checklist item has a body home. Any provisional row-lifecycle choice, new unratified seam, unhomed applicable checklist item, or unresolved source-durability failure keeps or downgrades the PRD to `needs-triage`.

Authorities to cite: `reports/field-build-16-jon-urena-chrononaut.md`; `docs/worldbuilding-system/04_domain_atlas.md`, `07_propagation_engine.md`, `20_ai_assisted_workflow.md`, and `templates/propagation_report.md`; `CONTEXT.md`; `docs/specs/propagation-flow.md`, `prompt-out-context-assembly.md`, `schema-v1.md`, and `browser-visible-guidance-acceptance.md`; `docs/principles/canon-sovereignty.md`, `workflow-principles.md`, `guided-workflow-usability.md`, and `data-principles.md`; ADRs 0007-0009; closed #29, #204, #270, #287-#291, and #348. Temporary field artifacts should be summarized through the durable report, not cited by machine-local path.

Browser-visible guidance checklist mapping:

| Checklist item | PRD body home or disposition |
|---|---|
| Package source cited | Provenance preamble and Principles cite `07`, `20`, Propagation spec, and report-template authority. |
| Decision-point contract named | Problem/Solution and Implementation Decisions name the pre-close Pressure/revision/finalization decision. |
| Required, optional, skippable, and severity-dependent fields | User Stories and Implementation Decisions distinguish required revision reason/affected row, optional Prompt-out, governed skip, and foundational coverage. |
| Doctrine at the actual decision point | Implementation Decisions require app-owned revision/finalization guidance beside row actions and close blockers, with paths only as provenance. |
| Prompt preview, manifest, and cold external LLM test | Testing Decisions and acceptance require stale/current preview, manifest, revised active-set packet, and one cold Pressure replay. |
| Advisory/canon separation | Solution, User Stories, and Principles preserve steward authorship, advisory artifacts, source canon standing, and Admission jurisdiction. |
| Skip path and reason storage | Implementation Decisions preserve W-1/W-4 governed skip when fresh external Pressure is declined, including the existing severity reason threshold. |
| Blockers and substance validation | Solution and acceptance require consequence-specific invalidation blockers, close refusal, server-owned remediation, and no checkbox-only readiness. |
| Current, next, and resume state | User Stories and acceptance require active/retired row state, current/stale packet state, safe return, resume, and post-close state. |
| Read-side audit or provenance link | Implementation Decisions and acceptance require revision lineage, actor/time/step provenance, final report/read-side trail, and explicit non-mutation of canon standing. |
| Cognitive walkthrough | Testing Decisions require a docs-naive browser route from open foundational run through failed action recovery, revision, re-disposition, fresh Pressure or skip, close, readback, and safe return. |

Canonical implementation gates for the future PRD: `pnpm test`, `pnpm typecheck`, and `pnpm build` because the change will span spec, schema/persistence, server routes/policy, browser workflow, and closeout evidence. No canonical gate was run by this report-only prep.

Focused implementation gates if the future PRD is built: server Propagation active-route, app HTTP, Prompt-out/currentness, decision-contract, and world-file/store tests; web Propagation-flow and Prompt-out-lifecycle surface tests; schema migration/open-existing-world checks when the data shape changes; and a targeted browser walkthrough. These are focused checks, not new canonical repo gates.

Evidence expectations: red/green HTTP proof for consequence/domain revision, dependent disposition invalidation, close refusal, packet staleness, final close, and closed-run refusal; direct database proof for lineage and append-only invariants; browser proof for row identity/actions, failure recovery, stale/current packet state, blockers, readback, safe resume, and console state; one cold external Pressure output over the revised packet; and a field-build replay mapping `F-03` to the exact active route. Root gates follow on the final implementation tree.

Source durability warning: the source report is durable on `origin/main`, but its embedded machine-local evidence locations are not. The later PRD may cite the report and summarize its conclusions; it must not cite those local paths as published sources. This prep artifact itself is pending local publication.

## Completion Self-Check

- `/to-prd` was consulted for house style only; no seam checkpoint or publication work occurred.
- Source artifact posture is durable: tracked, clean, and visible on `origin/main`; temporary field evidence is summarized through the report, not cited directly.
- Authored artifact posture is new/untracked and pending local publication.
- Tracker state was refreshed live; the open issue list was empty and relevant closed issues were read exactly.
- The selected first PRD is Pre-Close Propagation Revision Lifecycle.
- Deferred work is explicit: Foundational Propagation Packet Context plus verification/reopen of multi-blocker identity and answered-rationale persistence.
- Coverage-only work is explicit: `V-01` through `V-03`, closed #348 routing, the parked world frontier, and the three carried covered families.
- Recommended existing testing seams are named; the later `/to-prd` seam checkpoint remains owed.
- Likely publication labels and downgrade conditions are explicit.
- `docs/agents/issue-tracker.md` and `docs/agents/triage-labels.md` were consulted, and every browser-visible checklist item has a proposed PRD body home.
- Canonical and focused future implementation gates are named; none is misreported as run in this prep.
- Source and authored-artifact durability warnings are explicit.
- The post-write machine-local/stale-publication wording sweep completed with no hits.

## Freshness And Boundaries

Refreshed in this session: branch and clean-worktree baseline; source and authored-artifact existence; current `HEAD`/`origin/main`; report-to-current product diff; source-report durability; all report sections; current Propagation server/store/schema/browser/Prompt-out/test surfaces; relevant methodology, principles, specs, ADRs, domain vocabulary, tracker conventions, and triage labels; the live open-issue list; and exact adjacent closed issues.

Not done: product implementation, spec/ADR/principle/methodology edits, issue creation, issue comments, label changes, PRD drafting/publication, `/to-prd` seam confirmation, app launch, browser replay, cold-LLM execution, or root canonical gates.

Product tests and app/browser runs were skipped because this is a report-only prep, the current product tree is unchanged from the report's app commit, and source plus tracker evidence already distinguishes fresh scope from covered and reopen candidates. The future PRD's acceptance explicitly requires fresh tests and active-route proof.

The skill-local structure validator passed with 6 recognized finding headings, 4 app seeds, 18 classified evidence rows, and no structural errors or warnings. The manual machine-local-path and stale-publication-phrase scan returned no hits. This helper result is output-shape evidence, not a canonical repo gate or a semantic-scope verdict.

Pre-existing worktree dirt: none at intake.

Files intentionally added or changed by this prep: only `reports/field-build-16-jon-urena-chrononaut-prd-prep.md`.

Freshness boundary: tracker and checkout conclusions reflect the 2026-07-10 refresh. Re-run the open-issue search, exact overlap reads, publication-ref durability gate, branch/status check, and testing-seam ratification when `/to-prd` later publishes.
