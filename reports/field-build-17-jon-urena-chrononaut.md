# Field Build 17 - Jon Urena Chrononaut

**Date:** 2026-07-11 | **App commit:** 73752c1 | **Method version:** worldbuilding-system 1.1

**Essence (user seed):** Jon Urena is a biologically anomalous, immortal, invulnerable time traveler whose private obsessions keep colliding with history.

**World:** Jon Urena Chrononaut - a modern-Earth world where one anomalous person's non-deployable temporal access stresses history, evidence, institutions, and ordinary life. **World file:** /tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite.

**Path walked:** setup/open exact Field Build 16 world -> Workflow-map resume -> mandatory pre-close revision regression -> six consequence revisions -> six domain revisions -> stopping-state restoration -> current Pressure packet/context regression -> user-directed capacity retry -> five final steward refinements -> three replacement dispositions -> blocked final current Pressure packet.

**Prior runs:** reports/field-build-16-jon-urena-chrononaut.md and earlier Jon Urena runs 10-15.

**Evidence:** live log at /tmp/worldloom-field-build/build-log-17-jon-urena-chrononaut.md; screenshots at /tmp/worldloom-field-build/screenshots/field-build-17-*.png; prompt packets, unverified retry output, console evidence, and API readbacks at /tmp/worldloom-field-build/cold-llm/field-build-17-*.

**Prior-art frame:** Live GitHub reads reached closed issues #109-#113, PRDs #201/#202/#204/#205-#210, closed revision-lifecycle PRD #353, and closed packet-context PRD #358. V-01 confirms #353's pre-close lifecycle against the exact blocked Field Build 16 world. V-02 confirms #358 and extends #204's context work into a real foundational packet. P-03 extends #353/#358: their two seams disagree on the final decision-step identity after replacement dispositions. F-01/F-02 confirm Field Build 16's narrow bugs, which #358 explicitly left outside its packet-context scope. R-01 extends #353 from functional lifecycle coverage into presentation density. Local prior field/parity reports were available; no checked prior surface recorded P-03 or R-01.

## Findings

### V-01 - Pre-close Propagation revision lifecycle now preserves lineage and invalidates dependent decisions

- Severity: validation
- Where: Propagation flow 2, FAC-3 / DEB-7, pre-close revision and finalization.
- What happened: The exact Field Build 16 rows now expose revise/retract controls before close. Six consequence and nine domain lineages were revised through the UI across two pressure-review rounds. Each replacement preserved its prior version, steward reason, creator/retirement provenance, and active-only identity. Consequence replacement invalidated the historical disposition and produced a row-specific close blocker until the new active row was dispositioned. A missing reason returned one HTTP 400 without mutating or clearing the prepared replacement; adding the reason recovered on the same row. Evidence: /tmp/worldloom-field-build/screenshots/field-build-17-04-f03-revision-control-consequence1.png, field-build-17-06-consequence1-superseded-history.png, field-build-17-08-consequence2-missing-reason-recovery.png, and /tmp/worldloom-field-build/cold-llm/field-build-17-final-preclose-readback.json.
- What the methodology requires: Pressure-earned substantive changes must revise staged consequence/domain material before close; affected dispositions and packet identity must be invalidated; append-only ownership begins at the closed report, not while staging remains open.
- The snag: N/A - Field Build 16 F-03's recorded pre-close repro is fixed. The after-close negative control was not reached because P-03 blocks a method-safe close.
- Design verdict: N/A - validation
- Recommendation: Preserve row-local revision, lineage, atomic required-field recovery, active-only blockers, and the append-only report boundary.
- Repro: Open flow 2 at active-set revision 0; revise consequence #1; revise #2 once without a reason and once with it; inspect GET /api/propagation/runs/2 after each action; repeat through another consequence and a domain; re-disposition active replacements.
- Fix direction: N/A - validation
- Touches: issue #353, docs/specs/propagation-flow.md, docs/specs/prompt-out-context-assembly.md, W-1/W-7/W-8/W-9.

### V-02 - Foundational Pressure packet now carries related-world standing, relationships, and omissions

- Severity: validation
- Where: Propagation flow 2 current Pressure packet, active-set revisions 16 and 17.
- What happened: The active packet included KER-1 as proposed/non-canon kernel context, the accepted gate, direct-link Creation records, proposed shared-origin FAC-2, open related seed debt, stable identities, standing, relationship and inclusion reasons, bounded excerpts, and record-specific omissions. It distinguished governed FAC-3 support from proposed known-exclusivity/tone context and absent mechanics. The revision-17 direct download contained an exact 56,137-byte body matching visible hash `ac27cc09c9bc20ba0e5903bcedb9711ee8fa9b859855c0912c6bc1ea71ebd2f7`. Evidence: /tmp/worldloom-field-build/screenshots/field-build-17-11-pressure-kernel-context.png, field-build-17-12-pressure-fac2-noncanon-context.png, field-build-17-14-current-pressure-revision17.png, and /tmp/worldloom-field-build/cold-llm/field-build-17-deb7-final-pressure-prompt-download.txt.
- What the methodology requires: A cold Pressure packet must carry selected material, relevant world context, standing, relationships, source records, and explicit omissions without silently promoting proposed support.
- The snag: N/A - Field Build 16 P-02 is fixed for packet assembly. Countable cold-answer coverage remains unavailable under Q-01, and the later revision-26 active packet is blocked separately by P-03.
- Design verdict: N/A - validation
- Recommendation: Preserve typed related-world selection, non-canon labels, deterministic budgets, record-specific reasons, and visible packet identity.
- Repro: At flow 2 revision 17, click Load current Pressure packet; inspect structured related-world context and download; verify the body slice against the visible body hash.
- Fix direction: N/A - validation
- Touches: issue #358, PRD #204, docs/specs/prompt-out-context-assembly.md, W-1/W-9.

### P-03 (pressure) - Final disposition step makes the current Pressure packet immediately stale

- Severity: blocking
- Where: Propagation flow 2 after final replacement disposition, active-set revision 26.
- What happened: The run reports `current_step=propagation:disposition`, no blockers, and mechanical close readiness. One click on Load current Pressure packet returned HTTP 200 and a revision-26 packet, but the action requested origin step `propagation:pre-close-revision`. The UI immediately rendered `Stale prompt packet body` and disabled copy/export because that origin does not match the active decision. Visible packet identity: packet `67f570dee1dbbd54fc26a86512f92ede0ad28b3700b0b6110239edf1735eaa8f`, body `eace243c063397c9926190d1b9616205fd4ade263d4feb64df6a5262847c4d3a`, manifest `0325b9f0f7146aa622a2b1ac6095d4063971fa8a9134e4533a3a6a50801104c4`. Evidence: /tmp/worldloom-field-build/screenshots/field-build-17-16-revision26-stale-packet-panel.png and /tmp/worldloom-field-build/cold-llm/field-build-17-blocked-frontier-readback.json.
- What the methodology requires: After substantive revision and replacement dispositions, the steward must reload a current Pressure packet, exercise the pressure decision, and only then close if no new substantive issue remains.
- The snag: The app's load action and its currentness comparator disagree on which step owns the final Pressure decision, so the required packet cannot become current even though close is enabled.
- Design verdict: local polish - the lifecycle and screen hierarchy are sound; one canonical decision-step identity must be shared by packet generation, currentness validation, and post-disposition recovery.
- Recommendation: Generate the packet against the run's actual current decision step, or define one canonical pre-close Pressure step that survives disposition mutations and is used consistently by both generation and currentness checks. Keep Close Run unavailable whenever the required final packet is stale.
- Repro: Open the recorded world; resume Propagation flow 2 at revision 26 with `current_step=propagation:disposition`; click Load current Pressure packet once. Request #203 uses `stepKey=propagation:pre-close-revision`; the returned packet is rendered stale and has no Copy/Download action.
- Fix direction: Propagation Prompt-out action binding and currentness identity; close-readiness ownership between propagation-flow and prompt-out context assembly.
- Touches: issues #353/#358, docs/specs/propagation-flow.md, docs/specs/prompt-out-context-assembly.md, W-1/W-7/W-9.

### F-01 - Duplicate React blocker keys still fire for multiple active high-pressure blockers

- Severity: friction
- Where: Propagation flow 2 while two or more replacement high-pressure consequences await disposition.
- What happened: The server returned distinct consequence-specific blockers, but React reused key `undispositioned-high-pressure`. The console accumulated duplicate-key errors on every controlled-input rerender; the same fault re-fired during both revision rounds. Persisted blocker state remained correct. Evidence: /tmp/worldloom-field-build/screenshots/field-build-17-09-two-blockers-duplicate-key.png and /tmp/worldloom-field-build/cold-llm/field-build-17-console-after-two-undispositioned.txt.
- What the methodology requires: Every owed high-pressure consequence must remain individually visible and stable until it reaches a stopping state.
- The snag: Repeated list keys make blocker presentation structurally unreliable during the exact multi-blocker state the workflow requires.
- Design verdict: local polish - server identity and decision semantics are correct; rendered list identity is not.
- Recommendation: Key blocker rows by semantic key plus stable consequence id, while retaining the semantic key as classification.
- Repro: Leave active high-pressure consequences #13 and #14 undispositioned; edit any controlled field; inspect close blockers and browser console.
- Fix direction: Propagation close-blocker rendering.
- Touches: Field Build 16 F-01, docs/specs/propagation-flow.md, W-7/W-8.

### F-02 - Answered disposition still drops the visible rationale

- Severity: friction
- Where: Propagation flow 2, answered disposition for active consequence #8.
- What happened: Before a single save, the visible Debt or boundary control contained `Separately governed incidents gate claims and traces; conventional control does not establish control over temporal access.` Raw DOM readback matched. Persisted disposition #7 returned `note: ""`; no retry occurred. Evidence: /tmp/worldloom-field-build/screenshots/field-build-17-10-disposition8-rationale-dropped.png and /tmp/worldloom-field-build/cold-llm/field-build-17-after-disposition8-with-rationale.json.
- What the methodology requires: A stopping-state ruling should retain enough rationale to audit or resume; the UI must not solicit material it silently discards.
- The snag: The shared control accepts rationale for `answered` but does not map it to the saved note.
- Design verdict: local polish - consequence/disposition identity persists; the conditional field/payload mapping is wrong.
- Recommendation: Expose a true optional answered/scoped-out rationale mapped to `note`, or hide/disable the debt/boundary control for states that do not retain it; show the saved note in readback.
- Repro: Select `answered`; type a rationale into Debt or boundary; verify the control; save once; GET /api/propagation/runs/2 returns the active disposition with an empty note.
- Fix direction: Propagation disposition form and server/read-model note mapping.
- Touches: Field Build 16 F-02, docs/specs/propagation-flow.md, W-7/W-8.

### R-01 - Always-expanded row editors turn revision into a many-screen targeting task

- Severity: friction
- Where: Propagation pre-close revision surface with six active consequences, fourteen active domains, and retired history.
- What happened: Every active row simultaneously renders a reason field, replacement selectors/text, Revise, and Retract. After multiple revisions the active and retired material produces an exceptionally long surface, separating blockers/currentness/close state from the row being judged. The controls work, but scanning and target acquisition dominate the task. Evidence: /tmp/worldloom-field-build/screenshots/field-build-17-03-propagation-resume-revision-controls.png and field-build-17-04-f03-revision-control-consequence1.png.
- What the methodology requires: The steward should see exactly the current decision material, lineage, pressure obligation, and local action without losing orientation in repeated controls.
- The snag: The lifecycle is encoded, but its presentation makes a real foundational revision pass exhausting and error-prone.
- Design verdict: redesign candidate - spacing or copy cannot solve twenty simultaneous edit forms plus accumulating history.
- Recommendation: Keep active rows compact; reveal one explicit row-local edit/retract form at a time; collapse retired lineage by default with counts; keep blockers, current packet state, and close summary sticky or locally repeated.
- Repro: Open flow 2 with six consequences and fourteen domain rows; inspect the page before and after several revisions; all eligible edit forms remain expanded simultaneously.
- Fix direction: Propagation pre-close row composition and navigation hierarchy.
- Touches: issue #353, docs/specs/propagation-flow.md, W-7/W-8.

### Q-01 - Session dispatch cannot prove exact cold-packet handoff

- Severity: question
- Where: External cold-LLM handoff for the revision-17 Pressure packet.
- What happened: The app supplied and hash-validated the exact packet. The only fresh-worker dispatcher accepts an opaque message and returns a handle, but exposes no submitted-payload digest/readback. After the user said to insist following model capacity, `/root/fb17_pressure_retry` completed and its 19,765-byte answer was saved, but the worker required a path/slice instruction and the submitted bytes remain unprovable. The answer was therefore treated only as unverified advisory material. Evidence: /tmp/worldloom-field-build/cold-llm/field-build-17-deb7-final-pressure-prompt-download.txt and field-build-17-deb7-final-pressure-unverified-retry.md.
- What the methodology requires: Active packet bytes, saved artifact bytes, and submitted worker bytes must form a verified identity chain; otherwise the result cannot test packet self-containment.
- The snag: It is unknown whether a future session/tool surface can expose a fresh worker with submitted-payload digest/readback.
- Design verdict: N/A - execution-environment limitation, not app presentation
- Recommendation: Expose a dispatch surface that accepts the captured bytes directly and returns submitted SHA-256/length or exact readback; until then record `probe unavailable - exact handoff unverified`.
- Repro: N/A - inspect the session's fresh-worker dispatch contract; it accepts only an opaque message string and returns no payload proof.
- Fix direction: Field-build execution/tooling surface, not Worldloom app source.
- Touches: docs/specs/prompt-out-context-assembly.md cold-LLM test; field-build cold-handoff rule.

## Regression of prior findings

**Replay gate:** Field Build 16 app commit 945c626 -> current commit 73752c1. HEAD advanced; bootstrap had no uncommitted app-source or other worktree dirt.

- Field Build 16 F-03 (no pre-close revision path): fixed -> V-01. The recorded repro and adjacent required-field, sibling consequence, domain-entry, lineage, invalidation, currentness, and stopping-state probes passed. The after-close negative control is deferred because P-03 prevents a method-safe close; it is the first action after P-03 is repaired.
- Field Build 16 P-02 (Pressure omitted related world/kernel): fixed -> V-02. Revisions 16/17 carried typed related-world context, standing, relationships, budgets, and omissions.
- Field Build 16 F-01 (duplicate blocker keys): still-broken -> carried as F-01. It re-fired with two through five blockers and again during final replacement disposition.
- Field Build 16 F-02 (answered rationale dropped): still-broken -> carried as F-02. A visibly verified rationale persisted as an empty note.
- Field Build 16 P-01 (foundational Proposal omitted the fourteen-domain atlas): not-reverifiable-this-run. Proposal is behind this same-seed resume frontier; no new Proposal packet was generated.
- Field Build 14 F-01 (punctuation search failure): not-reverifiable-this-run. Search remained behind and outside the resumed Propagation frontier.
- Field Build 11 P-01 (stale secondary Creation packet): not-reverifiable-this-run. Creation correction is behind the resume frontier; P-03 is a different Propagation currentness seam.
- Field Build 11 F-02 (duplicate narrowing-note corrections): not-reverifiable-this-run. No Creation correction mutation was attempted.

## Decision-point log (evidence)

### Exact-world reopen and mandatory regression entry

- Stage / decision point: Setup, Workflow map, and Propagation flow 2 resume.
- Docs-first draft: Reopen the Field Build 16 world, work DEB-7 before further Admission, and revise pressure-invalidated staging without changing FAC-3 standing.
- Prompt-out coverage: proposal=N/A; pressure=deferred until revised current material.
- Cold LLM: N/A.
- Committed: No mutation during reopen; FAC-3 accepted with constraints, FAC-2 proposed, DEB-7 open, report absent.
- UX/style verdict: ok - the map foregrounded owed Propagation and returned to the exact in-progress run.
- Obsolescence verdict: docs-obsolete for setup, route, run identity, and revision-entry contract.

### Pre-close consequence/domain revision and stopping states

- Stage / decision point: Apply the Field Build 16 pressure-earned corrections across six orders and the affected atlas domains.
- Docs-first draft: Preserve current-horizon non-deployability; remove universal uniqueness, ungoverned diagnostics/biometrics/return mechanics, guaranteed fossils, ungated medical/institutional responses, and control-of-person equals control-of-access implications.
- Prompt-out coverage: proposal=`deferred because frontier moved`; pressure=`deferred until revised active material existed`.
- Cold LLM: N/A during the mandatory replay.
- Committed: Six consequence v2 rows, six initial domain revisions, five restored answered dispositions, then one production refinement; every mutation read back before advancing.
- UX/style verdict: redesign candidate - R-01. Functional row recovery is strong; simultaneous editors/history are overwhelming.
- Obsolescence verdict: lifecycle docs-obsolete -> V-01; authored judgment still appropriately belongs to the steward.

### Current related-world Pressure and capacity retry

- Stage / decision point: Pressure over revisions 16 and 17.
- Docs-first draft: Verify current identity and related-world provenance; do not complete from stale material; treat any external answer as advisory.
- Prompt-out coverage: proposal=`deferred because frontier moved`; pressure=`active exercised for capture, probe unavailable for exact handoff`. Revision-17 prompt=/tmp/worldloom-field-build/cold-llm/field-build-17-deb7-final-pressure-prompt-download.txt; raw body hash/length=`ac27cc09c9bc20ba0e5903bcedb9711ee8fa9b859855c0912c6bc1ea71ebd2f7:56137`; artifact hash/length=`d057807041e83221b6c3f17f222150d028f1264cbbc77a371bfd26e795864201:56887`; submitted hash=`unavailable`; unverified output=/tmp/worldloom-field-build/cold-llm/field-build-17-deb7-final-pressure-unverified-retry.md; subagent=`/root/fb17_pressure_retry` (not countable cold evidence).
- Cold LLM (pressure): The capacity retry returned grounded pressure, but the opaque handoff fails the identity-chain rule -> Q-01. Independent steward review nevertheless found and authored five justified refinements.
- Committed: Consequence lineages 2/4/5 advanced to v3; production to v3; coercion and aesthetics to v2; active replacement dispositions restored. Final pre-close active-set revision 26.
- UX/style verdict: ok for structured packet review; the expanded revision surface remains R-01.
- Obsolescence verdict: related-world context assembly docs-obsolete -> V-02; cold usefulness not proven -> Q-01.

### Final current Pressure and blocked close

- Stage / decision point: Required current Pressure after final replacement dispositions.
- Docs-first draft: Load/export the revision-26 packet, perform the final pressure beat, and close only if it earns no substantive change.
- Prompt-out coverage: proposal=`deferred because frontier moved`; pressure=`blocked by app`; active packet path=N/A; output=N/A; subagent=N/A. The rendered stale packet has body hash `eace243c063397c9926190d1b9616205fd4ade263d4feb64df6a5262847c4d3a`, but active copy/export is forbidden because the origin step mismatches the current run step.
- Cold LLM: N/A - no valid current packet artifact could be handed off.
- Committed: No close. Flow 2 remains in progress; DEB-7 remains open; no propagation report exists.
- UX/style verdict: ok - the UI clearly labels the packet stale; P-03 is a functional decision-identity mismatch rather than a presentation-quality failure.
- Obsolescence verdict: docs not obsolete at final Pressure/close ownership; the app reports mechanical readiness while blocking methodology readiness.

## For the app (PRD seeds)

### App Seed 1 - Canonical final Pressure identity across disposition and close

- Disposition: extending relative to #353/#358; the integration failure itself is new.
- Likely spec/component: docs/specs/propagation-flow.md; docs/specs/prompt-out-context-assembly.md; Propagation current-packet action; prompt-origin currentness comparator; close readiness.
- UX scope: local polish

P-03 is the blocking seam. The final disposition changes the run's current step, while Load current Pressure packet still generates against a pre-close-revision step. Give generation/currentness/close one canonical decision identity and ensure mechanical close readiness cannot outrun the required current packet.

### App Seed 2 - Propagation blocker and disposition integrity

- Disposition: confirming relative to Field Build 16 F-01/F-02; outside #358's completed packet-context scope.
- Likely spec/component: close-blocker row identity; disposition form payload; server/read-model note mapping.
- UX scope: local polish

F-01/F-02 remain narrow but evidence-bearing: each blocker needs stable consequence identity, and visible answered rationale must persist or cease to be solicited.

### App Seed 3 - Compact pre-close revision workspace

- Disposition: extending relative to #353's functional lifecycle into presentation quality.
- Likely spec/component: Propagation active/retired row composition, disclosure state, and close/currentness summary placement.
- UX scope: redesign

R-01 calls for a compact browse state plus one explicit editor at a time, collapsed lineage history, and persistent local orientation. The lifecycle works; its current full expansion does not scale to foundational coverage.

### Validation-only completed seeds

#353 is validated for the open-run revision lifecycle by V-01. #358 is validated for foundational related-world packet context by V-02. Neither validation closes P-03 at their integration seam.

## For the methodology

None. The methodology clearly required revisable pre-close staging, active-only stopping states, explicit related-world standing, and a fresh Pressure beat after substantive changes. The stop is caused by the app's decision-identity mismatch and the session's unprovable cold dispatch, not missing source doctrine.

## Frontier

- Walked to: FAC-3 / DEB-7 Propagation flow 2, active-set revision 26, with six active consequences, fourteen active domains, five active answered dispositions, eighteen retired revision-audit rows, and mechanical close readiness.
- Next run resumes at: /tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite, Propagation flow 2 / DEB-7. First replay P-03 without mutating: load the current Pressure packet at revision 26 and prove it is copy/export eligible under the active decision identity. Capture and cold-probe it if a verifiable dispatcher exists. If no substantive issue remains, click Close Run once, read back the append-only report/debt/route transition, then return and prove revision controls are absent or refused after close to finish the F-03 boundary negative control.
- App-reported state: Flow `in_progress`; current step `propagation:disposition`; close preview `ready`; report id null. Workflow map next decision remains Work owed propagation; Admission queue 1, owed Propagation 1, conditional passes owed, canon debt 7.
- Methodology-required state: blocked before close by P-03; the final revision-26 Pressure packet is immediately stale and cannot be exported.
- Carried-open findings: blocking P-03; friction Field Build 16 P-01 (not reverified), F-01, F-02, R-01; Field Build 14 F-01 and Field Build 11 P-01/F-02 remain not-reverifiable-this-run; Q-01 keeps cold usefulness coverage unavailable. V-01/V-02 are validations.
- World state: FAC-3 remains accepted with constraints and unchanged; FAC-2 remains proposed; DEB-7 remains open; no propagation report, surfaced proposal, new canon debt, protected boundary, or skip was created.
