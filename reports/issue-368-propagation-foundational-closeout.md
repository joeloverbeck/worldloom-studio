# Issue #368 foundational-density Propagation closeout

Implementation closeout evidence for #368 and parent PRD #364.

## Result

The production Propagation route was replayed end to end against a newly created temporary world at foundational density. The replay exercised six active consequences, all fourteen active domain sweeps, consequence and domain revision history, single-editor draft continuity, keyboard and focus behavior, an adjacent stale-target failure, exact current Pressure copy/export, a context-isolated cold LLM pass, safe exit/resume, close preview, successful close, append-only report readback, and post-close write refusal. No production code or test expectation changed; this issue closes the evidence and coverage seam delivered by children #365-#367 and the conformance fixes #369-#371.

Methodology-coverage status is unchanged. The production packet proved current and useful, but its explicit omission list means this run does not establish full methodology-context completeness.

## Evidence fixture and identities

- Fixture: `/tmp/worldloom-issue-368-1783823891512.sqlite`, created through production APIs from an empty temporary SQLite database; no stateful fixture was copied.
- World: `issue-368-foundational-world`; flow `1`; source fact `FAC-1` (`The Meridian Archive can hear every oath ever sworn`).
- Final frontier: active-set revision `28`, six active consequences, fourteen active domains, five retired audit rows, no close blockers, flow state `complete`, step `propagation:complete`.
- Canon isolation: unrelated `FAC-2` retained its original body and accepted status before and after close.
- Close writes: exactly one accepted propagation report, `PRP-1` / record `4`; one proposed advisory artifact, `ADV-1` / record `3`.
- Packet identity: packet hash `c2a23962d202a493c11bafc7c7f5d31b3e84ea0bf52c2730344f7b77c2d0e7d1`; body hash `0ca00b690eaa7cec36e0d3460fa8d705ff4c3df701467561f0ebd4aa3ed3ec28`; source-manifest hash `156e0384641b4cb0a5204a1f7dd4077c7a0e9d5ffcdd70173ebf7f95bfbca186`; exported file SHA-256 `743fa0c03508a7c8f439ca0262b8f101a69c3ec5f716e5200993b75241fd604f`.
- Safe-resume digest: canonical records SHA-256 `ac02129fcb1c06c6330ec8fbd7ac96f78ee40b128cc0d3b6b6e3898077cd5ef3` before and after exit/resume; serialized payload byte-identical.
- Browser sessions: `issue368-final` retained the expected stale-target HTTP 400 evidence and was superseded for clean-close proof; `issue368-close-clean` produced the final pre-close and post-close proof with zero console errors and zero warnings.
- Backend: attached to the pre-existing `pnpm dev` process tree (parent PID 23056, Vite PID 23114 on 5173, server PID 23137 on 4173). The server is non-watch `tsx src/index.ts`; no backend/UI source changed after process start. Expected Propagation API fields and behavior were probed before evidence capture.

## Durable artifacts

- `output/playwright/issue-368/01-foundational-compact-workspace.png`
- `output/playwright/issue-368/02-finalization-landmark.png`
- `output/playwright/issue-368/03-adjacent-failure-recovery.png`
- `output/playwright/issue-368/04-expanded-domain-lineage.png`
- `output/playwright/issue-368/05-expanded-consequence-lineage.png`
- `output/playwright/issue-368/06-current-pressure-identity-copy-export.png`
- `output/playwright/issue-368/07-clean-preclose-finalization.png`
- `output/playwright/issue-368/08-postclose-report-readback.png`
- `output/playwright/issue-368/current-pressure-packet.txt`
- `output/playwright/issue-368/cold-pressure-response.md`
- `output/playwright/issue-368/cold-pressure-store.json`

## TDD evidence

| Issue | CONTEXT.md status | ADRs/principles/docs status | Seam | Red command/failure | Green command or evidence | Acceptance covered | Review fix / red-first skip reason |
|---|---|---|---|---|---|---|---|
| #368 | read | Principles README, workflow, guided usability, canon sovereignty, data principles, ADRs 0007-0009, methodology 07 and 20, and Propagation/prompt-out/browser-guidance specs read | coverage-only existing React behavior | coverage-only existing behavior; red-first N/A because behavior already existed and no production code changed | `pnpm --filter @worldloom/web exec vitest run src/propagation-workspace.test.tsx src/propagation-flow.test.tsx` passed 10 tests | AC4-AC9, AC11-AC13, AC16-AC17; atoms: compact summaries, one editor, drafts, cancel/success/failure outcomes, keyboard/focus, lineage, finalization doctrine, safe resume, docs-naive orientation; proof surfaces: existing React tests and screenshots 01-08; sequence: open consequence, draft, switch to domain, recover both drafts, cancel, trigger/recover stale failure, revise, expand lineage, exit/resume, close | N/A - coverage-only existing behavior; no production or test expectation changed |
| #368 | read | Same sources read; no deliberate exception | coverage-only existing server behavior | coverage-only existing behavior; red-first N/A because behavior already existed and no production code changed | `pnpm --filter @worldloom/server exec vitest run test/propagation-active-route.test.ts test/prompt-out-lifecycle.test.ts` passed 16 tests | AC3, AC6, AC9-AC15; atoms: foundational active set, blockers/currentness, revision recovery, Pressure identity, close preview/write intent, append-only report, post-close refusal; proof surfaces: focused server tests and API before/after probes; sequence: create fixture, mutate active set, load current packet, preview close, close once, read report, reject later revision | N/A - coverage-only existing behavior; no production or test expectation changed |
| #368 | read | Same sources read; no deliberate exception | evidence-only browser and API replay | N/A because the criterion requires production-route observational evidence, not a new behavior seam | Browser sessions and screenshots 01-08; final clean session had 0 errors and 0 warnings | AC3-AC17; atoms: all named foundational density, workspace, draft, failure, accessibility, lineage, finalization, Pressure, obligation, preview, resume, report, contract, console, and cognitive-walkthrough outcomes; proof surfaces: rendered UI, network/API readbacks, screenshots 01-08, canonical digest and report sections; sequence: create via API, navigate blind through UI, edit/recover/revise, inspect lineage/finalization, copy/export, exit/resume, close, read report, probe post-close refusal | N/A - evidence-only production replay |
| #368 | read | Prompt-out context assembly spec and methodology 20 read; advisory/canon boundary preserved | evidence-only cold Pressure probe | N/A because cold-LLM quality and boundary proof cannot be produced by a deterministic unit red | Exported packet and verbatim cold response; stored as proposed `ADV-1`, never accepted canon | AC10; atoms: preview, manifest, omissions, labels, warning, decision identity, copy/export, cold run, advisory storage; proof surfaces: screenshot 06, exact packet, cold response, store JSON and API readback; sequence: load current packet, record identity, copy, export, give only exported packet to context-isolated agent, inspect response, store exact output as proposed advisory | N/A - evidence-only cold observation |
| #368 | read | All cited principles/ADRs/specs read; no methodology-coverage expansion | evidence-only closeout mapping and gates | N/A because acceptance mapping and repository verification are closeout evidence rather than a behavior seam | Focused commands plus `pnpm test`, `pnpm typecheck`, and `pnpm build` passed; audit and child/US maps below | AC1-AC2, AC18 and Principles; atoms: prerequisite issue state, clean close route, all child and US mappings, focused/root gates, conservative methodology claim; proof surfaces: live issue readbacks, tests, this report and artifact inventory; sequence: verify #369/#370 closed, replay, run focused/root gates, audit all criteria, review, then close child and parent | N/A - evidence-only closeout seam |
| #364 | read | Parent Principles section, all cited principles/ADRs/specs read; no deliberate exception | parent closeout evidence | N/A because parent PRD maps already-tested child seams rather than adding a new behavior seam | Child rows #365-#368 and root gates passed | US1-US28 and parent Principles; atoms: inherited compact-workspace, lineage/finalization, route replay, and closeout responsibilities; proof surfaces: closed child issues plus this report's child and US maps; sequence: #365 specifies, #366 implements compact editing, #367 implements lineage/finalization, #368 replays and closes the production route | N/A - parent mapping row |

Existing-test contract-change rows: none.

TDD review-fix addendum: N/A because review has not created TDD review-fix evidence.

TDD closeout preflight:
- Durable sink/body inspected: `reports/issue-368-propagation-foundational-closeout.md`
- Compact table/header: present after structural check
- Rows accounted for: #368 React, server, browser/API, cold-LLM, closeout seams and #364 parent mapping
- Pre-red recovery status: N/A - pre-red preflight/table was visible before first red; no red commands were run
- CONTEXT.md status: present
- ADRs/principles/docs status: present
- Acceptance atom map: all rows list exact criterion ranges plus authoritative atoms and proof surfaces
- Acceptance sequence map: all rows list ordered proof, including same-instance edit/recovery/resume/close continuity
- Partial-red / red-first skip reasons: coverage-only existing behavior and evidence-only browser/cold/closeout seams listed; setup-only wrong metadata-field and regenerated-packet identity probes were classified and were not behavior reds
- Evidence-only rows freshness: not affected because changed paths `reports/issue-368-propagation-foundational-closeout.md` and `output/playwright/issue-368/` leave the production route, browser actions, API, and fixture untouched; targeted proof from the focused web/server commands and all three root gates passed
- Evidence-only browser console state: final `issue368-close-clean` session recorded 0 errors and 0 warnings; the earlier expected stale-target HTTP 400 was retained only in `issue368-final` and screenshot 03
- Evidence-only backend process currentness: server command `pnpm dev`; watch/reload mode Vite watch plus non-watch `tsx src/index.ts`; process ownership attached pre-existing parent PID 23056, Vite PID 23114 on port 5173 and server PID 23137 on port 4173; restart/reload proof N/A because no consumed backend/UI source changed after that process started; expected API field probe covered Propagation identity and shapes and the API behavior probe covered packet currentness, blockers and close; fixture created through production APIs and not copied
- Evidence identity refresh: same-sink current/historical-red/superseded identity block below inspected
- Existing-test contract-change rows: none

Evidence identity refresh:
- Current evidence identities: fixture paths `/tmp/worldloom-issue-368-1783823891512.sqlite`; browser sessions `issue368-close-clean`; packet paths/hashes `output/playwright/issue-368/current-pressure-packet.txt`, packet `c2a23962d202a493c11bafc7c7f5d31b3e84ea0bf52c2730344f7b77c2d0e7d1`, body `0ca00b690eaa7cec36e0d3460fa8d705ff4c3df701467561f0ebd4aa3ed3ec28`, manifest `156e0384641b4cb0a5204a1f7dd4077c7a0e9d5ffcdd70173ebf7f95bfbca186`, file `743fa0c03508a7c8f439ca0262b8f101a69c3ec5f716e5200993b75241fd604f`; active revisions `28`; artifacts screenshots 01-08, `PRP-1` record 4 and `ADV-1` record 3
- Historical red identities retained: fixture paths `/tmp/worldloom-issue-368-1783823891512.sqlite`; browser sessions `issue368-final`; packet paths/hashes none; active revisions `24`, `25`; artifacts screenshot 03 and classified HTTP 400 response
- Superseded evidence identities: fixture paths none; browser sessions `issue368-final`; packet paths/hashes `a7018f20fc62d2f9a6d6337862d8cd90769d5d5be70ce59ac5ad2fe524c845f9`; active revisions `24, 25, 26, 27`; artifacts `generic report-detail 404`
- Superseded-token sweep: `rg` searched `issue368-final`, `a7018f20fc62d2f9a6d6337862d8cd90769d5d5be70ce59ac5ad2fe524c845f9`, `24, 25, 26, 27`, and `generic report-detail 404` in this report and `output/playwright/issue-368`; no active-proof hits; historical-red hits classified as the earlier expected HTTP 400/session and setup revisions, while the regenerated packet and generic 404 remain superseded setup identities

TDD evidence gate passed: durable sink `reports/issue-368-propagation-foundational-closeout.md`; compact table/header present after structural check; seams accounted for all listed; CONTEXT.md status present; ADRs/principles/docs status present; sequence evidence present; evidence identities present; partial-red / red-first skip reasons listed; evidence-only rows listed; existing-test contract-change rows none.

## Child delivery map

| Child | Delivered responsibility | Closeout evidence |
|---|---|---|
| #365 | Canonical compact-workspace, revision, lineage, finalization, and acceptance specification | Closed; its contract is exercised by the #366/#367 surfaces and this replay |
| #366 | Compact active summaries, one-editor discipline, draft continuity, cancel/success/failure recovery, keyboard and focus behavior | Closed; screenshots 01 and 03 plus the edit/switch/recover sequence |
| #367 | Retired lineage disclosure, finalization landmark, doctrine, Pressure controls, close preview and report boundary | Closed; screenshots 02, 04-06 and the preview/readback probes |
| #368 | Foundational production-route replay, cold Pressure probe, safe resume, close/report readback and parent rollup | This report and screenshots 01-08 |

## Parent #364 user-story map

| Parent stories | Evidence |
|---|---|
| US1-US5 | Compact consequence/domain rows expose identity, active version, lifecycle, material, pressure and applicable actions in screenshot 01 and the finalization route. |
| US6-US8 | One editor at a time, consequence/domain draft preservation across deliberate switching, and cancel-to-authority were observed in one browser instance. |
| US9-US11 | Successful domain replacement, consequence retraction, blocker recovery, and an adjacent stale-target error preserved the full draft and remediation. |
| US12-US13 | Keyboard activation entered the editor/lineage controls and focus returned predictably to the initiating row control; failure used a role alert. |
| US14-US16 | Collapsed counts and expanded consequence/domain lineage showed active, superseded and retracted distinctions with reason, version, disposition, actor, timestamp and flow step. |
| US17-US19 | The finalization landmark remained reachable and rendered server blockers/currentness, doctrine, Pressure state and current/next/resume orientation. |
| US20-US23 | Required/optional/skippable support, staging/report boundaries, close preview writes/links/queues/untouched state, and non-mandatory LLM doctrine remained visible. |
| US24 | Report and lineage readbacks preserve source and revision provenance through actors, timestamps, flow steps and derived/digest links. |
| US25 | The docs-naive walkthrough identified the current decision, governing doctrine, work obligations, recovery, next action, close boundary, provenance and safe exit from the UI alone. |
| US26 | Before/after API probes showed the browser consumed existing lifecycle, blocker, packet, recovery, write-intent and close response shapes without a new client policy seam. |
| US27 | Focused web/server suites and all canonical repository gates passed without expectation changes. |
| US28 | This foundational-density replay closed one live flow, wrote exactly one report, retained proposed advisory output, preserved unrelated canon and refused post-close revisions. |

## Verification

- `pnpm --filter @worldloom/web exec vitest run src/propagation-workspace.test.tsx src/propagation-flow.test.tsx`: passed, 2 files / 10 tests.
- `pnpm --filter @worldloom/server exec vitest run test/propagation-active-route.test.ts test/prompt-out-lifecycle.test.ts`: passed, 2 files / 16 tests.
- `pnpm test`: passed, 36 files / 175 tests.
- `pnpm typecheck`: passed for shared, server and web.
- `pnpm build`: passed for shared, server and web.
- Browser close/readback: `issue368-close-clean`, 0 console errors, 0 console warnings.

## Review evidence

Review frame: fixed point input `HEAD~1`; fixed point resolved SHA `af6a3ad2cc417795f32154ea08207668ddbfefa9`; reviewed HEAD SHA `5894149506fa2ed2748d8189039122af41268bb2`; diff command `git diff af6a3ad2cc417795f32154ea08207668ddbfefa9...HEAD`; commits `5894149 docs: record propagation foundational closeout`; worktree scope committed diff only; excluded dirty files none; spec source issues #368 and #364, child family #365-#368, related conformance #369-#371, and the named Propagation/principle/ADR sources.

Review: code-review against `af6a3ad2cc417795f32154ea08207668ddbfefa9`; outcome no findings; verification rerun not needed before the review result because the unchanged implementation tree already passed focused web/server tests plus `pnpm test`, `pnpm typecheck`, and `pnpm build`.

Review subagents: Standards final reviewer `/root/review_standards` completed; Spec final reviewer `/root/review_spec` completed.

Review subagent cleanup: Standards close operation unavailable after terminal completion; Spec close operation unavailable after terminal completion.

Axis summary: Standards 0/worst none, Spec 0/worst none.

Residual findings: none.

Parent PRD coverage: parent #364 row present below and same-sink exact #364 Principles, child map, and US1-US28 rows cited.

Browser/manual N/A checked: N/A because browser/manual proof was required and is present.

Browser/manual evidence freshness: not affected because git commit metadata only at the reviewed SHA; no tracked file content changed after the proof; earlier evidence route/action/API/fixture Propagation workspace edits, Pressure export, safe resume, close/report readback, production API and temporary API-created fixture is untouched; targeted proof `git diff HEAD -- packages` passed and was empty.

Browser/manual console state: final clean session recorded 0 errors and 0 warnings.

Backend process currentness: server command `pnpm dev`; watch/reload mode Vite watch plus non-watch `tsx src/index.ts`; process ownership parent PID 23056, Vite PID 23114 on port 5173 and server PID 23137 on port 4173; restart/reload proof N/A because no consumed backend/UI source changed after process start; expected API field probe covered Propagation identity and shapes and API behavior probe covered packet currentness, blockers and close; N/A because no stateful fixture was copied; stateful fixture snapshot method N/A; snapshot source N/A; expected-state probe direct production API counts, revision, blocker, packet and report readbacks.

Spec sequence coverage: sequence: API-create foundational fixture, enter production route, edit/switch/recover/fail/revise, expand lineage, load/copy/export Pressure, cold-probe and store proposed advice, exit/resume, preview, close, read append-only report and observe post-close refusal; browser DOM, API readbacks, screenshots and artifact identities observe the order.

## Standards

Sources reviewed: root AGENTS.md instructions, `docs/agents/issue-tracker.md`, `docs/principles/README.md`, the evidence-only diff, and the complete code-review smell baseline.

Findings: none. The report uses canonical pnpm gates, does not invent a lint/e2e gate, records Principles/ADR conformance, and preserves advisory/canon separation. Repeated identities and mappings are required evidence cross-references rather than code smells. The TDD validator passed; packet file/body hashes matched; screenshots 03, 06 and 08 showed no narrative contradiction.

## Spec

Sources reviewed: issues #368 and #364, child family #365-#368, related conformance #369-#371, `CONTEXT.md`, the named principles/ADRs, methodology 07/20, Propagation/prompt-out/browser-guidance specs, and every artifact in this report.

| Issue | Acceptance source | Evidence reviewed | Findings/residuals |
|---|---|---|---|
| #368 | Exact same-sink audit rows AC1-AC18 and Principles. Composite coverage is explicit in those rows: prerequisite/currentness/foundational density; compact editing/recovery/accessibility/lineage/finalization; cold Pressure/advisory boundary; obligations/preview/resume; append-only report/contracts/console/cognitive walkthrough; mappings/gates/conservative coverage. sequence: every cited audit row records ordered production actions ending with close, report readback and refusal. | Report, screenshots 01-08, exported packet/hashes, context-isolated cold response, proposed `ADV-1`, six-consequence/fourteen-domain/five-retired-row identity, safe-resume digest, clean console, `PRP-1`, focused tests and root gates. | none |
| #364 | Exact #364 Principles acceptance audit row below plus the separate Parent user stories US1-US28 map and Child delivery map #365-#368 above. sequence: #365 specification is followed by #366 compact-editing delivery, then #367 lineage/finalization delivery, then #368 browser/API evidence observes foundational replay, close and report readback. | Child/story maps, authority readback, route artifacts, accepted report, proposed-only advice, unrelated `FAC-2` preservation and unchanged methodology-coverage result. | none |

Findings: none. Exact acceptance is proven on the production action path rather than inferred from component or nearby evidence; no product code, contract, policy, or methodology claim widened.

## Acceptance audit

| Issue | Acceptance criterion or conformance check | Evidence | Status |
|---|---|---|---|
| #364 | Principles - Principles/ADR conformance for #364 | atoms: workflow guidance, steward sovereignty, canonical server ownership, durable provenance, no methodology-coverage overclaim; proof surfaces: CONTEXT.md, principles, ADRs 0007-0009, specs, this replay and conservative coverage result; sequence: read authority before replay, exercise existing ownership seams, confirm append-only report and untouched canon, retain advisory output as proposed | satisfied |
| #368 | AC1 - Live tracker evidence records #369 as closed, and production-route readback proves the final Pressure packet is current, copyable, and exportable under the active decision identity before this replay proceeds. | atoms: #369 closed, current packet, copy, export, active identity; proof surfaces: live #369 readback, screenshot 06, exported packet and recorded hashes; sequence: verify #369 closed, load current packet at revision 28, inspect identity, copy, export | satisfied |
| #368 | AC2 - Live tracker evidence records #370 as closed, so the foundational-density close-blocker list can produce a clean console rather than duplicate-key errors. | atoms: #370 closed and clean foundational close-blocker render; proof surfaces: live #370 readback, screenshot 07, final clean console; sequence: verify #370 closed, load foundational finalization, inspect blockers, observe 0 errors and 0 warnings | satisfied |
| #368 | AC3 - A recreatable temporary world reaches an open foundational Pre-close Propagation decision with at least six active consequences, all fourteen active domains, retired consequence or domain lineage, and server-returned blockers/currentness/close context. | atoms: temporary world, open pre-close, six consequences, fourteen domains, retired lineage, server context; proof surfaces: API-created SQLite fixture, screenshots 01-02, API counts/readbacks; sequence: create world through API, build active/retired frontier, open route, read finalization context | satisfied |
| #368 | AC4 - The initial browser state presents compact active consequence and domain summaries with stable identity, active version, current material, lifecycle state, and applicable disposition or blocker information. | atoms: compact summaries, identity, version, material, lifecycle, actions/blockers; proof surfaces: screenshot 01 and rendered row controls; sequence: open workflow map, choose Propagation, inspect initial collapsed workspace before editing | satisfied |
| #368 | AC5 - The steward opens one consequence editor, enters an unsaved draft, deliberately switches to one domain editor, and proves exactly one editor is visible while both row drafts remain recoverable. | atoms: consequence draft, domain switch, one editor, both drafts recoverable; proof surfaces: live DOM inspection in `issue368-final`; sequence: keyboard-open consequence 5, draft, switch to Economy, draft, switch back and recover consequence, switch again and recover Economy | satisfied |
| #368 | AC6 - Cancel, successful replacement or retraction, and one failed revise or retract action demonstrate their distinct draft outcomes; failure preserves every value and presents adjacent server error and remediation. | atoms: cancel, success, retraction/replacement, failed action, preserved values, adjacent error/remediation; proof surfaces: browser DOM, screenshot 03, API revision history; sequence: cancel authoritative draft, induce stale-target failure, inspect preserved draft/role alert, save Economy replacement, retract consequence 4, add replacement order | satisfied |
| #368 | AC7 - Keyboard-only operation and focus evidence covers editor and lineage disclosure activation, focus entry, predictable restoration, and accessible failure announcement. | atoms: keyboard activation, focus entry, restoration, lineage disclosure, accessible failure; proof surfaces: browser focus/DOM observations, screenshot 03-05; sequence: activate controls by keyboard, observe heading/editor focus, complete/cancel/fail actions, observe initiating-control restoration and role alert | satisfied |
| #368 | AC8 - Retired lineage begins collapsed with accurate counts and, when expanded, preserves reason, provenance, version, historical disposition, and clear active/superseded/retracted distinction. | atoms: collapsed counts, reason, provenance, version, disposition, lifecycle distinctions; proof surfaces: screenshots 04-05, API audit rows and report sections; sequence: observe collapsed counts, expand domain lineage, inspect superseded row, expand consequence lineage, inspect superseded and retracted rows | satisfied |
| #368 | AC9 - The finalization landmark remains reachable while moving among rows and renders server-authored blockers, packet currentness, fresh Pressure or governed skip, close preview, staging/report doctrine, and current/next/resume state. | atoms: reachable landmark, blockers, packet currentness, Pressure/skip, preview, doctrine, orientation; proof surfaces: screenshots 02, 06-07 and server finalization payload; sequence: move among editors/lineage, return to landmark, repair blocker, load current Pressure, inspect preview and close orientation | satisfied |
| #368 | AC10 - Current Pressure evidence includes packet preview, source manifest, omissions, output labels, advisory/canon warning, active-set and decision identity, valid copy/export, and one cold external LLM Pressure run whose output remains advisory. | atoms: preview, manifest, omissions, labels, warning, active/decision identity, copy/export, cold run, advisory status; proof surfaces: screenshot 06, exported packet, cold response and store JSON; sequence: load current packet, inspect every identity/doctrine surface, copy/export, pass only packet to cold agent, store exact output as proposed ADV-1 | satisfied |
| #368 | AC11 - Required, optional, skippable, and severity-dependent obligations remain visible, and any governed skip records the server-required reason without implying external LLM use is mandatory. | atoms: all obligation classes, governed reason, LLM optionality; proof surfaces: finalization UI and packet doctrine in screenshot 02/06; sequence: inspect obligations before Pressure, load Pressure, confirm support remains optional and no skip or external LLM is required to close | satisfied |
| #368 | AC12 - Close preview identifies final active material, retained revision audit, writes, links, queues, and untouched state before the steward confirms close. | atoms: active material, audit, writes, links, queues, untouched state before confirmation; proof surfaces: screenshot 07 and server close-preview payload; sequence: reach ready revision 28, inspect preview categories, then click Review and Close Run | satisfied |
| #368 | AC13 - Safe exit and resume before close reload the same revision frontier, drafts behave according to the documented browser boundary, and read/navigation actions do not mutate persisted world state. | atoms: safe exit/resume, same frontier, draft boundary, read-only navigation; proof surfaces: revision/count snapshots and byte-identical canonical digest; sequence: resolve drafts, record revision 28/digest, exit to map, resume same flow, compare payload/digest and continue | satisfied |
| #368 | AC14 - Successful close writes one append-only propagation report; report and read-side evidence distinguish the final active shock cone, retired lineage audit, provenance, and untouched canon or unrelated records. | atoms: one report, final active cone, retired audit, provenance, untouched canon; proof surfaces: PRP-1 record 4, eight report sections, link readback, FAC-1/FAC-2 comparison, post-close refusal; sequence: close once, render report, inspect sections/links/provenance, compare canon, attempt and reject later revision | satisfied |
| #368 | AC15 - Before/after API evidence proves the browser consumed existing lifecycle, blocker, packet, recovery, write-intent, and close shapes without introducing browser policy or changing the server response contract. | atoms: lifecycle, blockers, packet, recovery, write intent, close shapes, no contract change; proof surfaces: API probes, focused existing tests, zero production diff; sequence: capture route/API shapes, drive browser against them, close/read back, confirm repository diff contains evidence only | satisfied |
| #368 | AC16 - Browser evidence records route, actions, outcomes, screenshots or equivalent durable artifacts, and a clean or fully classified console with no duplicate-key, focus, or unhandled-action regression. | atoms: route/actions/outcomes, artifacts, classified/clean console, no named regressions; proof surfaces: screenshots 01-08, this action ledger, expected 400 classification, clean final session; sequence: retain expected failure session, rerun final close/readback in clean session, observe 0 errors and 0 warnings | satisfied |
| #368 | AC17 - A docs-naive cognitive walkthrough identifies the current decision, governing doctrine, required work, optional or skippable support, failure recovery, next action, close boundary, provenance trail, and safe exit without opening repository docs. | atoms: all nine orientation/recovery/boundary concepts without docs; proof surfaces: rendered workspace/finalization/report screenshots and browser text; sequence: enter from workflow map, infer current work from UI, perform/recover action, inspect next/close/provenance, exit/resume | satisfied |
| #368 | AC18 - Closeout maps all four child issues and US1-US28 to evidence, runs focused web and server tests plus pnpm test, pnpm typecheck, and pnpm build, and changes methodology-coverage claims only when the production-route and cold-packet evidence supports them. | atoms: four-child map, US1-US28 map, focused/root gates, evidence-bound coverage claim; proof surfaces: maps and verification section above, exact packet/cold artifacts, unchanged methodology status; sequence: complete replay/cold proof, run focused then root gates, map children/stories, retain conservative methodology conclusion | satisfied |
| #368 | Principles - Principles/ADR conformance for #368 | atoms: local-first steward control, server-owned workflow policy, additive reports/provenance, explicit advisory boundary, guided usability; proof surfaces: principles/ADRs/specs, UI/API replay, PRP-1 accepted and ADV-1 proposed; sequence: read authority, exercise production contract, verify no browser policy/contract change, close explicitly and inspect durable provenance | satisfied |

## Principles and ADR conformance

No deliberate exceptions. The evidence confirms the existing server-owned lifecycle and close contract, explicit steward confirmation, append-only report/provenance trail, canon/advisory separation, recoverable UI failure behavior, and local-first state. The replay does not promote cold output to canon and does not expand methodology-coverage claims beyond what the packet and its omission list support.
