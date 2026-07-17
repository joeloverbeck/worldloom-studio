# Issue 405 source-selection production replay

## Scope and fixed fixture

- Replay date: 2026-07-17.
- Production route: Vite `http://127.0.0.1:5173/` with `/api` proxied to the Hono server on `http://127.0.0.1:4173/`.
- Temporary World file: `/tmp/worldloom-405-final-avKFdj/field-build-20.sqlite`.
- Contract: **Source-selected guided-flow run entry**.
- Methodology provenance shown at the decision boundary:
  - `docs/worldbuilding-system/08_constraint_composition.md`
  - `docs/worldbuilding-system/09_temporal_and_timeline_protocol.md`
  - `docs/worldbuilding-system/12_institutional_economic_and_suppression_protocol.md`
- Source: `FAC-3 · Non-reproducible neurological access`, stable record id `3`, `canon_fact`, accepted.
- Final Propagation report: `PRP-1 · Propagation report: FAC-3`, stable record id `4`.
- Temporal obligation: `CPO-1 · Temporal/Timeline owed for FAC-3 after PRP-1`, stable record id `5`, obligation id `1`, outstanding.
- Conflicting-binding fixture report: `PRP-2 · Propagation report: FAC-3`, stable record id `9`; its Temporal obligation is `CPO-4`, stable record id `10`, obligation id `4`, outstanding.
- Production handoff: Workflow map `Follow source-selected pass` -> Temporal route -> `POST /api/temporal/source-selection/resolve` -> `POST /api/temporal/runs/start`.

The fixture was created through production HTTP. It contains two earlier facts only to make the exercised source deterministically `FAC-3`; the first foundational Propagation pass produced `PRP-1` and the three ordered Conditional-pass obligations. The expanded replay added one valid `Fact statement` section to `FAC-3` through production HTTP so the unchanged record-section path could be exercised. The final Spec-review replay then completed a second production Propagation pass for the same source, producing `PRP-2` and three new obligations so an existing-run binding conflict could be observed without synthetic database edits.

## Browser evidence

1. The fresh Workflow map named `FAC-3`, `PRP-1`, `CPO-1`, the three outstanding passes, `Current: Temporal/Timeline`, `Next: Constraint Composition`, the fresh-map resume instruction, and the fact that Admission remains directly available. See [Workflow map handoff](evidence/issue-405-source-selection/workflow-map-handoff.png).
2. Following the server-returned Temporal handoff rendered human identity before start: `FAC-3 · Non-reproducible neurological access`, stable id `3`, `canon_fact`, accepted, resolved, plus the obligation, final Propagation report, destination, valid binding, why the pass is owed, exact substance rule, package provenance, field classifications, and current/next/resume orientation. See [Temporal resolved entry](evidence/issue-405-source-selection/temporal-resolved.png).
3. Keyboard recovery replaced the id with `999999`, tabbed to `Resolve source`, and activated it with Enter. The preserved input remained `999999`; focus returned to `Source or report stable id`; the live status announced `missing`; the adjacent alert said `No current record has stable id 999999`; exact remediation and the stable-id substance validation were visible; start remained disabled. See [Temporal invalid recovery](evidence/issue-405-source-selection/temporal-invalid-recovery.png).
4. Correcting the same input to `3` and resolving restored the server-returned model without browser reconstruction. The existing Temporal flow remained flow `2` against source record `3`, obligation `1`, and Propagation report `4`.
5. The source title was explicitly refreshed to `Non-reproducible neurological access (verified)`. Resolution and resume retained stable id `3`, short ID `FAC-3`, flow id `2`, obligation `1`, and report id `4`, while adopting the refreshed title. The second start/resume produced no database change.
6. An attempted retarget to existing fact id `1` preserved the entered id and binding, announced `mismatched_binding`, displayed `Conditional-pass destination source fact does not match the selected obligation`, showed the exact fresh-map remediation, disabled start, and produced no database change.
7. `Return to fresh Workflow map` waited for the fresh `/api/workflow-map` response; current, next, resume, all three outstanding obligations, and Admission orientation remained visible.
8. Selected-material mode retained the author-entered title and body, fabricated no record identity, classified only the material fields, requested mode, and validation state as required, showed `Optional: none`, and supplied an exact next/resume path. See [Selected-material guidance](evidence/issue-405-source-selection/selected-material-guidance.png).
9. Constraint Composition record-section mode resolved `FAC-3` plus `Fact statement`, classified the heading as required rather than optional, and started flow `3` with pass report `PAS-1` / stable id `8`. See [Record-section resolved entry](evidence/issue-405-source-selection/record-section-resolved.png).
10. Resolving and resuming by pass report `8` kept the browser draft coherent after the real start response: source type `pass_report`, textbox `8`, human summary `PAS-1`, stored run source `FAC-3` stable id `3`, and flow id `3`. The resume did not duplicate the run or mutate the database. See [Pass-report resume](evidence/issue-405-source-selection/pass-report-resume.png).
11. One real pass-report resume response was tampered in transit after the server returned it, changing only `storedRunIdentity` from `FAC-3` / stable id `3` to `FAC-2` / stable id `2`. The production browser refused the response, retained `pass_report` and textbox `8`, preserved the approved `FAC-3` selection, focused the correctable input, announced `identity discontinuity`, rendered the exact returned/approved stable identities and remediation, and disabled start/resume. The underlying real resume stayed read-only. See [Identity-discontinuity refusal](evidence/issue-405-source-selection/identity-discontinuity-refusal.png).
12. Constraint Composition and Institutional / Economic / Suppression fact mode each rendered the same named control, resolved human identity, stable numeric provenance, validation, obligation/report context, package sources, corrected mode-specific classifications, and current/next/resume grammar. See [Constraint resolved entry](evidence/issue-405-source-selection/constraint-resolved.png) and [Stage-12 resolved entry](evidence/issue-405-source-selection/stage12-resolved.png).
13. Following the Workflow-map route for the second Temporal obligation (`CPO-4` / `PRP-2`) while Temporal flow `2` remained bound to `CPO-1` / `PRP-1` rendered authoritative `stale_binding` before any start attempt. The group and textbox accessible names included `FAC-3`, record type, canon standing, destination, and validation state; the blocker named the existing run's different obligation/report binding; the remediation directed the steward to the original Workflow-map route; Start/Resume was disabled. Activating `Resolve source` returned the same refusal and left the post-setup database fingerprint unchanged. See [Existing-run binding refusal](evidence/issue-405-source-selection/stale-binding.png).

## Accessibility observations

- The accessibility tree exposed one `group` per destination whose name includes `Source-selected guided-flow run entry`, the human source identity, destination, and validation state.
- `Source type` was a named combobox; the stable-id textbox name included source type, short ID, title, record type, canon status, and validation state, and remained connected to the live validation and blocker descriptions.
- Resolved identity and Conditional-pass provenance were named regions; the human label was a heading.
- Validation changes used a polite atomic `status`; the blocker used `alert`.
- Invalid recovery returned focus to the correctable textbox and did not require pointer input.
- Start/resume was disabled for missing, mismatched, and stale existing-run binding states and enabled only for the server-returned resolved state.
- The pass-report group and textbox retained report identity while the named stored-run line exposed the authoritative source identity; discontinuity state named both stable IDs in the live status and alert.
- Safe return was a keyboard-operable named button.

## Console and request evidence

- Console errors: `0`.
- Console warnings: `0`.
- One informational React development message recommended React DevTools; it is unrelated to source selection.
- The production request ledger recorded successful fresh Workflow-map reads, Temporal fact/missing/material/stale-binding resolver calls, Constraint fact/record-section/pass-report resolver calls, one approved record-section start, two idempotent pass-report resumes, the second Propagation setup, and sibling-route navigation. No application request failed.
- Four automation-only locator mistakes (an unscoped status, the initial section-label assumption, an over-broad stored-source text matcher, and a non-exact Workflow-map button) produced no browser console entry or failed application request. Each assertion was rerun with a scoped accessible locator before evidence capture.

## World-file fingerprints and write boundary

Fingerprints are SHA-256 values of a full deterministic SQLite `.dump`.

| Boundary | Fingerprint | Interpretation |
|---|---|---|
| Fixture before expanded final replay | `80188ea4bc2d5be5f43b664d749b50831675356adbba5a1da75015eaebdfccdb` | Baseline after the earlier final Temporal proof and explicit title refresh. |
| After the explicit record-section fixture setup | `c1f103d8046bbe5a96e5a06019d97b85d936cbb5a043fdf21230c28585c868ed` | Expected `FAC-3` section write through production HTTP. |
| After Workflow-map, Temporal fact/missing recovery, selected-material resolution, Constraint fact navigation, and record-section resolution | `c1f103d8046bbe5a96e5a06019d97b85d936cbb5a043fdf21230c28585c868ed` | Navigation, resolution, invalid recovery, and selected-material proof were read-only. |
| After the separately approved record-section Constraint start | `47b51ac051c68b6838bbdb6dc53fe704fde1c788ca9fd38c111726eb3fd6d928` | Expected flow `3`, pass report `PAS-1` / stable id `8`, source row, and derived-from link. |
| After pass-report resolution and real resume | `47b51ac051c68b6838bbdb6dc53fe704fde1c788ca9fd38c111726eb3fd6d928` | Existing-run resume used report id `8`, returned flow `3`, retained stored source id `3`, and did not duplicate the run. |
| After tampered-response discontinuity refusal, fresh-map return, Stage-12 fact navigation, and console capture | `47b51ac051c68b6838bbdb6dc53fe704fde1c788ca9fd38c111726eb3fd6d928` | Browser refusal, real server resume, and sibling navigation were read-only. |
| After the explicit second foundational Propagation setup | `1b4c55f25c9635afcf942def2ccbdbe2c749c26dc647be3fb593cc4c2fb046bc` | Expected production writes created flow `4`, `PRP-2`, and obligations `4`-`6` for the same `FAC-3` source. |
| After Workflow-map stale-binding handoff, dedicated Temporal resolution, screenshot, and console capture | `1b4c55f25c9635afcf942def2ccbdbe2c749c26dc647be3fb593cc4c2fb046bc` | Both authoritative pre-start surfaces refused `CPO-4` because flow `2` remains bound to `CPO-1`; Start/Resume stayed disabled and the refusal path was read-only. |

Final fixture inventory confirms the write boundary: twelve records, one record-history row from the earlier explicit title refresh, seventeen sections, seventeen links, four total flows (two completed Propagation plus in-progress Temporal and Constraint), one Temporal run, one Constraint source row, one Conditional-pass flow binding, one `pass_report`, two `propagation_report` records, zero canon debt, zero skip records, zero advisory artifacts, and zero non-accepted facts. Temporal flow `2` remains at `temporal:entry`, source type `fact`, source record `3`, active-set revision `0`, with no final report and binding to obligation `1` / report `4`. Constraint flow `3` remains at `constraint:entry`, source type `record_section`, source record `3`, section `Fact statement`, pass report `8`; both pass-report resumes returned flow `3` without writes. Completed Propagation flow `4` owns the explicit review fixture setup that produced report `9` and obligations `4`-`6`.

## Bounded conclusion

This replay closes only the three-consumer source-selection entry frontier. It does not continue Field Build 20, complete the Temporal pass, change Prompt-out or canon policy, reopen earlier PRDs, or claim broader methodology coverage.
