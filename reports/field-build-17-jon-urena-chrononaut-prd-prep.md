# Field Build 17 PRD-Ready Determination: Compact Pre-Close Propagation Workspace

Source artifact: `reports/field-build-17-jon-urena-chrononaut.md`.

Selected source sections: all seven `Findings` entries (`V-01`, `V-02`, `P-03`, `F-01`, `F-02`, `R-01`, and `Q-01`); `Regression of prior findings`; the complete `Decision-point log`; `For the app (PRD seeds)`; `For the methodology`; and `Frontier`.

Existing same-stem prep artifact classification: none. The default same-stem path was missing at intake.

Source durability: durable. The source report is tracked, clean, and path/content-identical to publication ref `origin/main` at `f96255e`. Its field world, screenshots, prompt packets, cold output, console captures, and API readbacks are machine-local evidence summarized by the durable report rather than stable citation targets.

Authored-artifact durability: new and untracked. This determination is pending local publication until committed and visible with identical content on the publication ref.

Primary evidence summarized: the durable Field Build 17 report; current Propagation flow/currentness, Prompt-out identity, browser composition, and focused test surfaces; the committed delta from report app commit `73752c1` to current `HEAD`; live GitHub issue searches and exact closed-issue readbacks; durable Field Build 11, 14, and 16 determinations for carried findings; and current methodology, principle, spec, ADR, domain, tracker, and triage authorities.

Live checkout snapshot: refreshed on 2026-07-11 on branch `main` at `f96255e`, identical to `origin/main`. Intake `git status --short` was clean. The only committed change after report app commit `73752c1` is `f96255e`, which adds the Field Build 17 report and workflow-skill work; no `packages/`, `docs/`, or `CONTEXT.md` path changed, so current product and authority source is the implementation the report exercised. Concurrent uncommitted work appeared after intake: modified `.claude/skills/field-build/SKILL.md` plus untracked `.claude/skills/field-build/scripts/validate-report.mjs` and `validate-report.test.mjs`. Those paths are unrelated, excluded from this determination's authority set, and left untouched.

Tracker freshness: refreshed live on 2026-07-11. The complete open-issue read returned `[]`. Exact readbacks covered closed #109-#113, #201/#202/#204/#205-#210, #287/#288, #328, #336, #346/#347, #353-#363, with full or targeted acceptance reads for #287, #288, #353, #356, #357, and #358. The exact suggested-title search returned no match; a fuzzy workspace search returned only unrelated closed #358.

Deliverable status: PRD-ready determination only. This run changed no product code, specs, principles, ADRs, methodology documents, tracker issues, tracker labels, or published PRDs. It did not run `/to-prd`'s seam checkpoint.

## Reassessment Verdict

Field Build 17 validates the open-run revision lifecycle and foundational related-world Pressure context, exposes three already-accepted behaviors that still fail on the current active route, and proves one genuinely new browser-workspace problem.

Fixed or validated:

1. `V-01` validates pre-close consequence/domain revision, lineage, active-only calculation, dependent-disposition invalidation, atomic required-field recovery, and resume state. It does not validate the after-close negative control because `P-03` prevented close.
2. `V-02` validates #358's bounded foundational Pressure context with visible standing, relationships, inclusion reasons, omissions, and packet identity.
3. Field Build 16 Proposal atlas context, Field Build 14 punctuation-safe search, and Field Build 11 Creation currentness/narrowing-note carryovers are covered by closed tracker work and current source/tests.

Immediate conformance repair: `P-03` is an exact accepted-scenario contradiction against closed #353/#356/#357. Those issues require a disposition mutation to stale the old packet, a server-provided current Pressure recovery action, restored currentness, successful close, and post-close refusal. Current source still generates that recovery packet for `propagation:pre-close-revision` after disposition has moved the run to `propagation:disposition`; the shared comparator therefore rejects the just-generated packet. This belongs in verification/reopen handling, not a duplicate PRD.

Recommended first new PRD: **Compact Pre-Close Propagation Workspace** for `R-01`. It should keep the foundational revision surface readable by showing compact active rows, opening one explicit row editor at a time, collapsing retired lineage by default with counts, and keeping blockers, packet currentness, and finalization orientation persistently reachable. It is sequenced after the `P-03` conformance repair for full close-path evidence, but it is independently scoped product work.

Publication package: one first PRD plus deferred verification/reopen candidates. This is not a multi-PRD program. The first operational tracker action is the `P-03` reopen/conformance repair; the later `/to-prd` publication package contains only the compact-workspace PRD unless the steward explicitly changes the package.

Follow-ons: verify/reopen `P-03` against #353/#356/#357, `F-01` against #287's blocker family, and `F-02` against #288's disposition family. `Q-01` remains execution-tooling coverage outside Worldloom product scope.

Coverage-only work: finish #353's after-close negative control after `P-03` is repaired; re-run the exact current Pressure/close frontier; and preserve the already-covered Proposal, search, Creation currentness, and narrowing-note regressions as reopen triggers rather than duplicate scope.

Supporting-skill result: no supporting design, domain-modeling, or research skill was needed. The named PRD-prep workflow, current authorities, source, tracker history, and field evidence expose the separation between accepted-scenario repair and new workspace scope.

External research: not needed. The decisions are repo-local conformance and product-shape decisions governed by current field evidence and ratified authorities.

## Evidence Checked

| Finding or candidate | Status | Evidence and PRD impact |
|---|---|---|
| `V-01` pre-close Propagation revision lifecycle | validated/no product scope | The report proves open-run revision, lineage, invalidation, active-only blockers, recovery after one required-field failure, and resume. Preserve it as validation; keep the after-close negative control in coverage follow-up. |
| `V-02` foundational Pressure related-world context | validated/no product scope | The report validates the current #358 packet-context contract over a real foundational packet. No duplicate context PRD is warranted. |
| `P-03` final disposition makes current Pressure immediately stale | verification/reopen candidate | Closed #353/#356/#357 explicitly accepted load-current recovery after disposition and close. Current source still emits a pre-close-revision origin after the run's current step becomes disposition, matching the report's exact failure. Reopen the accepted family before defining new scope. |
| `F-01` duplicate React blocker keys | verification/reopen candidate | Multiple server blockers carry distinct consequence ids but repeat one semantic key; the top-level browser close list still keys only by that semantic key. Field Build 17 re-verifies the console failure. Reopen #287's blocker/browser family rather than publish a PRD. |
| `F-02` answered disposition drops visible rationale | verification/reopen candidate | #288 accepted rationale/note persistence. The browser labels one control `Debt or boundary` but sends the separate shared prose state as `note`; the reported one-save readback is empty. Reopen #288's disposition family. |
| `R-01` always-expanded row editors | fresh product scope | Current browser source unconditionally renders a full editor for every active consequence and domain, and existing focused coverage asserts presence rather than progressive disclosure. The six-consequence/fourteen-domain/eighteen-retired field state proves a new workspace-scale task-grammar problem. Select as the first new PRD. |
| `Q-01` exact cold-packet handoff cannot be proven | no-op/rejected | The app supplied and hash-validated the packet; the missing submitted-payload proof belongs to the session dispatch/tooling surface. Do not convert it into Worldloom product, methodology, or PRD scope. |
| Field Build 16 `F-03` no pre-close revision path | covered | `V-01`, closed #353-#357, and current source consume the original open-run repro. The broader post-close boundary proof remains coverage follow-up because `P-03` blocked the transition. |
| Field Build 16 `P-02` Pressure omitted related world/kernel | covered | `V-02`, closed #358/#361-#363, and current packet-selection source consume the reported omission class. |
| Field Build 16 `F-01` duplicate blocker keys | verification/reopen candidate | Same current failure as `F-01`; Field Build 17 supplies the requested active-route replay against closed #287. |
| Field Build 16 `F-02` answered rationale dropped | verification/reopen candidate | Same current failure as `F-02`; Field Build 17 supplies the requested active-route replay against closed #288. |
| Field Build 16 `P-01` Proposal omitted the fourteen-domain atlas | covered | Closed #358/#360/#363 and current foundational Proposal assembly/tests carry the ordered atlas. This run's inability to revisit Proposal does not reopen covered scope. |
| Field Build 14 `F-01` punctuation search failure | covered | Closed #346/#347 plus current store and HTTP tests cover short-ID prefixes, punctuation, quotes, empty input, and read-only behavior. |
| Field Build 11 `P-01` stale secondary Creation packet | covered | Closed #336-#338 and current Creation Prompt-out currentness coverage consume the exact correction/mode-switch class. |
| Field Build 11 `F-02` duplicate narrowing-note corrections | covered | Closed #328-#330 and current idempotent server/browser readback consume the exact retry class. |
| App Seed 1 canonical final Pressure identity | verification/reopen candidate | This is `P-03` repackaged. The product rule already exists in #353, the two current specs, and #356/#357 acceptance; repair conformance rather than publish it again. |
| App Seed 2 blocker and disposition integrity | verification/reopen candidate | This packages `F-01` and `F-02`, but their nearest accepted owners and proofs differ. Keep two narrow reopens, not one aggregate PRD. |
| App Seed 3 compact pre-close revision workspace | fresh product scope | This is the selected first new PRD. It changes browser composition and task grammar without changing the server lifecycle or packet contract. |
| Validation-only completed seeds | validated/no product scope | `V-01` validates #353's open-run side and `V-02` validates #358's Pressure context. Neither validation is allowed to hide the `P-03` contradiction or the deferred after-close proof. |
| For the methodology | validated/no product scope | The package already requires pressure, steward-authored revision, governed stopping states, and a fresh final support beat. No methodology, glossary, principle, or ADR amendment follows. |
| Decision point: exact-world reopen and regression entry | validated/no product scope | Workflow-map routing and exact in-progress-run resume worked without mutation; no separate product candidate emerged. |
| Decision point: consequence/domain revision and stopping states | fresh product scope | Lifecycle behavior maps to `V-01`; the only new product implication is `R-01`'s scalable revision-workspace composition. |
| Decision point: related-world Pressure and retry | validated/no product scope | Packet context maps to `V-02`; the opaque dispatch limitation maps to rejected app scope under `Q-01`. |
| Decision point: final current Pressure and blocked close | verification/reopen candidate | This is the exact `P-03` accepted-scenario contradiction and first operational repair target. |
| Frontier walked-to state | validated/no product scope | The recorded active-set revision, rows, dispositions, and open report state are evidence/fixture facts, not a new feature. |
| Frontier resume and after-close checks | follow-on candidate | Replay current Pressure after the conformance repair, close once if method-safe, inspect the report/read side, and attempt the required refused post-close revision. This is coverage, not another PRD. |
| Frontier carried-open findings | verification/reopen candidate | `P-03`, `F-01`, and `F-02` route to the reopens above; covered older findings retain explicit regression triggers; `R-01` routes to the selected PRD. |
| Frontier world state | validated/no product scope | Accepted/proposed/debt/report standing is preserved and supplies the next replay fixture without demanding a schema, status, or methodology change. |

### Live Source And Test Findings

- The committed product tree and relevant authorities are unchanged from report app commit `73752c1`; the report is a same-product-tree active-route repro rather than stale evidence against newer code.
- The server's current-packet recovery and fresh-Pressure action both use decision step `propagation:pre-close-revision`, while saving a disposition advances the run to `propagation:disposition`. The browser consumes the server-provided fresh-packet request, so the defect is in canonical decision identity/ownership rather than a second browser-generated route.
- Close readiness is calculated from server blockers, but current source can mark the newly generated packet used while the shared origin comparator rejects it. This is why mechanical readiness can outrun methodology-safe currentness.
- The server returns per-consequence blocker identity, but the top-level browser close-blocker list uses only the repeated semantic key. A row-local blocker rendering already composes consequence id plus semantic key, proving the narrow repair shape without a new policy seam.
- The server persists a supplied disposition `note`. The browser's visible `Debt or boundary` control is not the state sent as `note` for answered/scoped-out dispositions, matching `F-02`.
- Every active consequence and domain currently renders its full revision form. Retired rows also remain inline. The focused web coverage proves controls render but contains no compact-state, one-open-editor, disclosure, focus, or large-fixture assertion.
- No focused product tests were run for this report-only prep because current source plus a same-tree field repro and exact tracker acceptance distinguish all classifications. Canonical root gates and app/browser replay were skipped; they belong to implementation or coverage repair, not this artifact-only change.

### Live Tracker Findings

- The live open-issue set is empty, so no open issue currently owns `P-03`, `F-01`, `F-02`, or `R-01`.
- #353 says every consequence, domain, or disposition mutation stales the old packet and offers current-packet recovery. #356 requires the server-provided load-current action, fresh Pressure/skip, and current/next/resume state. #357 requires load-current or skip, successful close, and post-close refusal. `P-03` therefore contradicts accepted behavior exactly.
- #353 explicitly deferred `F-01` and `F-02` as verification/reopen candidates. #287 accepted server-derived blocker updates in the browser; #288 explicitly accepted steward-authored rationale for answered and intentionally-scoped-out dispositions.
- #358/#360-#363 consume Field Build 16 Proposal/Pressure context work and explicitly leave blocker/rationale defects outside their packet-context scope.
- #328-#330, #336-#338, and #346/#347 consume the older narrowing-note, Creation currentness, and search-punctuation carryovers.
- The suggested R-01 title has zero exact matches. Closed #353 and #358 establish the same-kind `enhancement` plus `ready-for-agent` label pattern after ratification and checklist completion.

## Authority Findings

### Methodology And Domain Vocabulary

No upstream methodology or domain-vocabulary change is owed.

- `docs/worldbuilding-system/07_propagation_engine.md` already requires the propagation loop, governed stopping states, and a report that records why propagation stops.
- `docs/worldbuilding-system/20_ai_assisted_workflow.md` already defines Pressure as challenge followed by steward selection/editing/authorship; it does not license closing known-bad staged material.
- `docs/worldbuilding-system/04_domain_atlas.md` already supplies the foundational sweep and pressure doctrine validated by `V-02`.
- `CONTEXT.md` already defines Flow, Prompt-out step, Decision point, Prompt packet, and Workflow map. Compact browse/edit disclosure introduces no new domain term.

### Principles

No principle amendment is owed.

- `workflow-principles.md` P-5/W-7 requires cheap repair and substance over clicks. One-at-a-time editing makes the existing repair lifecycle usable without weakening any obligation.
- `guided-workflow-usability.md` W-8 says a dense panel that technically contains all data but hides the local task does not satisfy the Decision-Point Contract. `R-01` is direct field evidence of that failure. W-9 requires the compact surface to retain app-owned method guidance and orientation.
- `canon-sovereignty.md` P-2/W-1 keeps Prompt-out optional/advisory and the steward responsible for final wording. The workspace PRD must preserve current packet/skip affordances without making external assistance mandatory.
- `data-principles.md` W-5/W-6/T-3/T-5 preserves stable lineage, active versus historical state, provenance, and the append-only report boundary. Collapsing history by default may not delete, flatten, or relabel it.

### Specs

The current specs already define `P-03`, `F-01`, and `F-02`'s required behavior; their fixes are conformance repairs rather than new product rules.

- `docs/specs/propagation-flow.md` requires active-set identity after disposition mutation, server-provided current Proposal/Pressure recovery, active-only blockers, row-local remediation, and successful finalization.
- `docs/specs/prompt-out-context-assembly.md` requires exact active decision/step identity and a safe new-packet recovery action after a disposition mutation.
- `docs/specs/browser-visible-guidance-acceptance.md` requires the active route through fresh Pressure/skip, close, readback, and post-close refusal.

The selected PRD should update the Propagation flow spec's Decision-Point UI Contract with one new presentation rule: at the pre-close revision/finalization decision, active rows default to a compact browse state, exactly one explicit editor is open at a time, retired lineage defaults collapsed with a visible count, and blocker/currentness/close orientation remains persistently reachable. The existing browser evidence contract already supplies the cognitive-walkthrough and active-route proof; it does not need a new testing framework or hard gate.

### ADRs And Architecture

No ADR change is owed.

- ADR 0007 keeps shared Prompt-out packet lifecycle/currentness in the Prompt-out module while Propagation supplies its flow-specific active decision and aftermath. `P-03` should restore that existing composition.
- ADR 0008 keeps Propagation persistence/policy with the owning flow over the shared World file. The workspace PRD introduces no persistence change.
- ADR 0009 keeps the browser as a renderer of server-owned lifecycle, blockers, currentness, and routes. Exclusive editor/disclosure state is presentation state; it must not become a second active-row, coverage, packet, or close policy engine.

### Tracker Conventions And Durability

`docs/agents/issue-tracker.md` and `docs/agents/triage-labels.md` were consulted. The selected PRD changes a guided-flow browser task grammar and keeps Prompt-out/currentness visible, so a later implementable body owes the explicit browser-visible guidance checklist mapping and a naive-steward cognitive walkthrough. Source and authority paths listed in this artifact were verified tracked, clean, publication-ref-visible, and content-identical to `origin/main`. Machine-local field evidence remains summarized through the durable report.

## Recommended First PRD

### Compact Pre-Close Propagation Workspace

Purpose: make the already-correct open-run revision lifecycle operable at foundational scale without hiding the current decision, active material, lineage, blockers, packet state, or close boundary.

Sources: Field Build 17 `R-01`, App Seed 3, and the pre-close revision decision log; durable Field Build 16/17 reports and prior determination; `docs/specs/propagation-flow.md`; `docs/specs/browser-visible-guidance-acceptance.md`; W-7/W-8/W-9 and W-5/W-6/T-3/T-5; ADR 0009; closed #353/#356; and current browser composition/tests.

Problem: a foundational run with six active consequences, fourteen active domains, and accumulated retired lineage renders every active revision form simultaneously. The controls function, but the steward must scan and scroll through many screens of repeated inputs to locate one target, compare lineage, check blockers/currentness, and return to finalization. The decision point contains the data yet obscures the task.

Recommended product rule or seam: the Propagation browser owns a compact presentation state over the unchanged server-owned lifecycle. Active rows first render as readable summaries with lifecycle identity, current content, disposition/blocker state, and one explicit edit/retract affordance. Exactly one consequence or domain editor is expanded at a time across the decision point. Retired lineage is collapsed by default behind counts and accessible disclosure. A persistent finalization landmark keeps blockers, current packet/skip state, and close preview reachable without traversing every form. Server state remains the only authority for active versions, coverage, blockers, currentness, write intent, and close readiness.

Scope:

- Compact browse-state composition for active consequence and domain rows.
- One-open-editor interaction across both row families, with explicit switching, focus placement, and per-row draft preservation so switching does not silently discard work.
- Collapsed-by-default retired lineage with counts, accessible disclosure, and unchanged reason/provenance/history content when expanded.
- A persistent or locally repeated finalization landmark for active blockers, packet currentness/fresh-Pressure-or-skip, close preview, safe exit/resume, and the append-only report boundary.
- Accessible disclosure/button semantics, keyboard reachability, focus return, and status/error association for the affected row.
- A narrow Propagation flow spec update plus focused browser tests and active-route evidence.
- Regression preservation for row-local server errors, input preservation, active-only state, packet preview/source manifest/advisory warning, and server-owned policy.

Acceptance:

1. A foundational fixture with at least six active consequences, fourteen active domains, and retired lineage initially shows compact summaries rather than twenty simultaneous edit forms.
2. The steward can open one consequence or domain editor at a time, switch targets explicitly, and retain per-row draft values until save, cancel, or successful replacement; no switch silently discards entered material.
3. Active, superseded, and retracted identities remain unambiguous. Retired lineage defaults closed with an accurate count and expands to the same reason/provenance/history data without presenting retired material as active.
4. Row-specific dispositions, blockers, and errors remain adjacent to the row. Failed revise/retract actions preserve input and return focus/remediation to that editor.
5. Blockers, packet currentness, fresh Pressure/skip, close preview, safe return/resume, and report-boundary guidance remain reachable through a stable landmark while moving among rows; the browser does not recalculate any of them.
6. Disclosure controls expose state to assistive technology, work from the keyboard, and preserve a predictable focus target when editors or history close.
7. No API, schema, lifecycle, disposition, packet-identity, close-readiness, or methodology rule changes. Source-policy checks show the browser still consumes server-returned state.
8. Focused React coverage proves compact/default/one-editor/history/error/focus states. One real active-route cognitive walkthrough at foundational density proves target acquisition, edit recovery, orientation, current packet/skip visibility, close prediction, safe return, and a clean or fully classified console.
9. Final implementation verification runs the focused web tests, relevant unchanged server consumer-contract regressions, and the canonical repository gates.

Likely issue slices:

1. Propagation compact-workspace spec and browser interaction contract.
2. Compact row/disclosure/finalization composition with focused React tests.
3. Foundational-density active-route walkthrough and closeout evidence after the `P-03` repair is available.

Out of scope:

- `P-03` decision-step/current-packet conformance repair.
- `F-01` blocker-key repair and `F-02` disposition-rationale repair.
- Server lifecycle, schema, active-set, report, or Prompt-out packet-context changes.
- A generalized cross-flow editor/disclosure framework.
- New methodology, principle, ADR, domain vocabulary, direct LLM integration, or dispatch tooling.
- Reworking the fourteen-domain doctrine, stopping-state vocabulary, or append-only report boundary.

## Follow-On Candidates

### Verification/Reopen: Final Pressure Decision Identity (`P-03`)

Purpose: restore the closed #353/#356/#357 current-packet and close contract before using the full finalization route as R-01 closeout evidence.

Sources: Field Build 17 `P-03` and final decision log; closed #353/#356/#357 acceptance; current Propagation and shared Prompt-out currentness source; current flow and prompt-context specs.

Problem: after final replacement disposition, the run's active step and the server-provided recovery packet's origin step disagree. The new packet is generated, then immediately rendered stale; copy/export is refused while close can appear mechanically ready.

Recommended rule: one canonical server-owned decision identity must be used by Propagation step state, current-packet generation, shared packet currentness, and close-readiness ownership. Do not reinterpret an actually old packet as current.

Scope and acceptance: from a real open run at the disposition frontier, load current Pressure once; verify the returned packet origin matches the active decision, is current/copyable/exportable, carries the active-set identity, and satisfies fresh-support state only after valid generation or governed skip. Then close once, inspect report/read-side state, and refuse a post-close revision. Treat this as a narrow reopen/conformance bug, not a new PRD.

### Verification/Reopen: Multi-Blocker Render Identity (`F-01`)

Purpose: close the exact current-route contradiction against #287's blocker surface.

Sources: Field Build 16/17 `F-01`, closed #287 and #353's deferral, current server blocker identities, current row-local and top-level browser blocker renderings.

Problem: multiple blockers are semantically the same class but belong to different consequence rows; top-level React identity collapses the class key and emits duplicate-key errors.

Recommended rule: render identity combines semantic blocker class with stable affected-row identity, while the semantic key remains the policy classification.

Scope and acceptance: exercise two through five active undispositioned high-pressure consequences, confirm every blocker remains visible/stable through controlled rerenders, and record a clean or fully classified console. No server policy or PRD is needed unless replay exposes wider behavior.

### Verification/Reopen: Answered/Scoped-Out Rationale Persistence (`F-02`)

Purpose: close the exact accepted scenario in #288.

Sources: Field Build 16/17 `F-02`, closed #288 and #353's deferral, current browser payload composition, and current server note persistence.

Problem: the UI advertises optional rationale for answered/scoped-out dispositions but the visible control is not mapped to the persisted note field.

Recommended rule: expose a disposition-appropriate rationale control mapped to `note`, show persisted readback, and keep debt-name and preservation-boundary inputs conditional to their own states.

Scope and acceptance: save answered and intentionally-scoped-out rationale once each, read the same text through API and browser state, verify debt/boundary validation remains conditional, and prove failed saves preserve all relevant inputs. Reopen #288's family rather than publish a PRD.

These candidates are deferred from the selected first new PRD. `P-03` is first operationally because it blocks the exact close frontier; `F-01` and `F-02` are independent narrow repairs.

## Coverage Follow-Up

1. After `P-03` repair, reopen the recorded Field Build 17 world at active-set revision 26 and load current Pressure without mutation first. A valid packet must be current and copy/export eligible under the active decision identity.
2. If no substantive issue remains after the valid Pressure beat or governed skip, close exactly once, inspect the append-only report/debt/route/read-side transition, and attempt one post-close revise/retract action. This finishes the boundary proof that `V-01` could not reach.
3. Preserve covered Field Build 16 Proposal atlas, Field Build 14 search, and Field Build 11 Creation currentness/narrowing-note families as replay triggers. A current active-route contradiction reopens their closed owner; absence from this run is not fresh scope.
4. Count a future cold external result only when the active packet, saved artifact, and submitted worker bytes have verifiable identity. Until such a dispatcher exists, record the limitation without converting it into an app defect.
5. After the compact-workspace implementation, run the foundational-density cognitive walkthrough through target selection, one failed edit, recovery, current packet/skip orientation, close prediction, safe exit/resume, and console classification.

Product scope opens from coverage only when a current replay demonstrates a state combination outside existing acceptance. Exact contradictions reopen their existing issue families.

## Rejected Or No-Op Alternatives

- **Publish a new PRD for `P-03`.** Rejected because current specs and #353/#356/#357 already require the exact behavior that fails. A new PRD would duplicate accepted scope and hide a closeout regression.
- **Bundle `P-03`, `F-01`, `F-02`, and `R-01`.** Rejected because they share a route but not one seam or acceptance proof: decision identity, React list identity, form payload mapping, and workspace composition are independently repairable.
- **Treat `R-01` as cosmetic spacing.** Rejected because the field state shows a task-grammar failure at foundational scale, and W-8 explicitly rejects dense surfaces that hide the local decision despite containing the data.
- **Select no new PRD.** Rejected because `R-01` is not consumed by closed #353; that PRD established lifecycle function, not compact browse/edit composition at accumulated scale.
- **Specify a global editor framework or exact sticky layout.** Rejected as premature architecture/UI prescription. The product rule is one active editor, collapsed history, and persistent orientation; implementation may choose the narrowest local composition that satisfies it.
- **Amend the methodology, principles, glossary, or ADRs.** Rejected because existing authorities already demand the behavior and define the ownership boundaries.
- **Turn `Q-01` into Worldloom direct-LLM integration.** Rejected because the limitation is external execution-tooling observability, while v1 deliberately remains prompt-out/paste-in.
- **Cite machine-local field artifacts in the later PRD.** Rejected because the durable report already summarizes them and the local paths are not stable publication sources.

## PRD Publication Inputs

Suggested title: `PRD: Compact Pre-Close Propagation Workspace — Focused Revision Editing and Persistent Finalization Context`.

Publication package: one intended PRD plus deferred verification/reopen candidates. Publish only the compact-workspace PRD in a later `/to-prd` pass. Sequence implementation and full active-route closeout after the `P-03` conformance repair; do not silently publish `P-03`, `F-01`, or `F-02` as sibling PRDs.

Recommended testing seam and seam checkpoint: reuse the existing browser Propagation active route over a temporary world database as the highest external-behavior seam, supported by focused React surface tests and unchanged server HTTP consumer-contract regressions. No new architecture seam is proposed. `/to-prd`'s exact seam confirmation remains owed.

`/to-prd` consultation status: consulted for house style only. Its PRD template, source-durability posture, package taxonomy, label rules, seam input, and browser-visible checklist expectations shaped this artifact; no body was drafted or staged, no issue was published or labeled, and no seam checkpoint ran.

Likely label and downgrades: current prep posture is `needs-triage` because product/seam ratification and `P-03` sequencing are still open in the later publication workflow. Upgrade to `ready-for-agent` after the steward ratifies the exact existing seams, the PRD maps every applicable browser-visible checklist item, and the issue records either a resolved `P-03` dependency or a concrete sequencing/label-flip condition. Downgrade or retain `needs-triage` if one-editor draft-switch behavior, finalization landmark behavior, accessibility acceptance, or the dependency order remains open to veto. Same-kind closed PRDs use `enhancement` as the non-triage label.

Authorities to cite: the durable Field Build 17 report; `CONTEXT.md`; `docs/worldbuilding-system/07_propagation_engine.md` and `20_ai_assisted_workflow.md`; `docs/specs/propagation-flow.md` and `browser-visible-guidance-acceptance.md`; `docs/principles/workflow-principles.md`, `guided-workflow-usability.md`, `canon-sovereignty.md`, and `data-principles.md`; ADRs 0007-0009; and closed #353/#356 as functional prior art. Cite `docs/specs/prompt-out-context-assembly.md` only for unchanged packet/currentness context. Machine-local evidence is summarized through the report, not cited.

Browser-visible guidance checklist needs: the later PRD body must contain the exact checklist marker and map package source; the Pre-close Propagation revision and finalization decision contract; required/optional/severity-dependent revision fields; app-owned staging/report doctrine; unchanged packet preview/source manifest/advisory warning; unchanged advisory/canon and skip behavior; row-local blockers/errors; current/next/resume and safe exit; lineage/read-side audit; and the required cognitive walkthrough. Prompt-out, skip, and write behavior are regression-preservation items rather than new policy, not unhomed requirements.

Canonical implementation gates: `pnpm test`, `pnpm typecheck`, and `pnpm build` for the future guided-flow/browser closeout. There is no canonical lint, broad browser/e2e, or hard audit gate to claim.

Focused implementation gates if published: focused `@worldloom/web` Propagation surface tests; relevant `@worldloom/server` Propagation/Prompt-out consumer-contract regressions if the response contract remains unchanged; and one real browser active-route walkthrough at foundational density after `P-03` is available.

Evidence expectations: external-behavior proof of compact initial state, one editor across both row families, per-row draft preservation, collapsed/expanded lineage, row-local error recovery, accessible disclosure/focus behavior, persistent server-owned finalization context, unchanged packet/advisory/skip behavior, safe exit/resume, close prediction, and final console classification. The replay must distinguish component evidence from the production active route and must not claim successful close while `P-03` remains unresolved.

Source durability warning: the Field Build 17 report and listed authorities are durable on `origin/main`; this new prep artifact is pending local publication. A later PRD may cite the report and durable authorities, but must summarize rather than cite machine-local world, image, packet, console, API, or cold-output artifacts.

## Completion Self-Check

- `/to-prd` was consulted for house style only; no publication or seam checkpoint occurred.
- The source report and all listed local authorities were proven tracked, clean, publication-ref-visible, and content-identical to `origin/main`.
- The authored artifact is new/untracked and explicitly pending local publication.
- Tracker freshness includes the empty open set, exact closed owner readbacks, and exact suggested-title duplicate result.
- The selected first new PRD is Compact Pre-Close Propagation Workspace; `P-03` is explicitly first operationally as a reopen/conformance repair.
- Follow-ons distinguish three verification/reopen candidates from coverage-only work and rejected app-tooling scope.
- The recommended existing testing seams and the still-owed `/to-prd` seam checkpoint are explicit.
- The current label posture, upgrade/downgrade conditions, browser-visible checklist needs, canonical gates, focused gates, and evidence expectations are explicit.
- Product tests, root gates, and browser replay were intentionally skipped for this report-only artifact; no unrun gate is claimed.
- Validator result: passed on 2026-07-11 with 7 findings, 4 app-seed headings, 8 regression identities, 28 classified evidence rows, zero structural errors, and zero warnings.
- Manual post-write scan: completed on 2026-07-11 with no machine-local path hits and no stale publication-language hits; every durability warning and open decision in the artifact is intentional.

## Freshness And Boundaries

Refreshed this session: branch, `HEAD`, `origin/main`, baseline and current worktree state; source and authority durability; committed product drift since report app commit; current Propagation/Prompt-out/browser/test source; durable prior determinations; live open tracker state; exact relevant closed issues and acceptance; exact suggested-title overlap; methodology, principles, specs, ADRs, domain vocabulary, tracker conventions, triage labels, `/to-prd` house style, and the PRD-ready artifact skeleton.

Not done: no product, test, spec, principle, ADR, methodology, domain, skill, or tracker mutation; no PRD body; no label; no issue publication; no `/to-prd` seam checkpoint; no app server or browser session.

Product tests and app runs skipped: current source is the same product tree as the field report, the report already supplies the exact active-route repro, and read-only source plus tracker acceptance distinguished covered, reopen, and fresh scope. Only the skill-local structural validator and manual artifact scan belong to this prep run.

Pre-existing worktree dirt: none at intake. Concurrent unowned dirt appeared afterward at `.claude/skills/field-build/SKILL.md` and two files under `.claude/skills/field-build/scripts/` (`validate-report.mjs` and `validate-report.test.mjs`); it is unrelated to this artifact, was inventoried only to classify the delta, was not used as durable authority, and was left untouched.

Files intentionally added or changed by this prep: `reports/field-build-17-jon-urena-chrononaut-prd-prep.md` only.
