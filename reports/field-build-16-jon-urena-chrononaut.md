# Field Build 16 - Jon Urena Chrononaut

**Date:** 2026-07-10 | **App commit:** 945c626 | **Method version:** worldbuilding-system 1.1

**Essence (user seed):** Jon Urena is a biologically anomalous, immortal, invulnerable time traveler whose private obsessions keep colliding with history.

**World:** Jon Urena Chrononaut - a modern-Earth world where one anomalous person's non-deployable temporal access stresses history, evidence, institutions, and ordinary life. **World file:** /tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite.

**Path walked:** setup/open existing world -> Field Build 15 routing regression -> Propagation DEB-7 run entry -> Proposal probe -> six shock-cone orders -> six stopping-state dispositions -> full fourteen-domain atlas -> Pressure probe -> substantive revision blocker -> safe return to Workflow map.

**Prior runs:** reports/field-build-15-jon-urena-chrononaut.md and earlier Jon Urena runs 10-14.

**Evidence:** screenshots at /tmp/worldloom-field-build/screenshots/field-build-16-*.png; prompt packets, cold outputs, console evidence, and API readbacks at /tmp/worldloom-field-build/cold-llm/field-build-16-*; live log at /tmp/worldloom-field-build/build-log.md.

**Prior-art frame:** Live GitHub reads reached closed issues #109-#113, PRDs #201/#202/#204/#205-#210, and closed PRD #348. V-01 directly validates #348. The Propagation prompt-context cluster P-01/P-02 extends PRD #204's packet-structure/context hardening into foundational domain-atlas coverage. F-01/F-02/F-03 are new relative to those checked tracker surfaces and local prior field/parity report searches: the earlier reports validate Propagation route/contract coverage but do not report duplicate blocker identity, dropped answered rationale, or the missing pressure-revision lifecycle.

## Findings

### V-01 - Field Build 15 routing gap is fixed across both sides of the boundary

- Severity: validation
- Where: Workflow map, Propagation, and Admission after reopening the Jon world.
- What happened: With Admission queue 1 and source-linked routeable Propagation debt 1, the map foregrounded Work owed propagation with the accepted-canon shock-cone reason. It routed to DEB-7, safely returned to a freshly loaded map, and left Admission directly usable. Evidence: /tmp/worldloom-field-build/screenshots/field-build-16-02-workflow-map-resume.png, field-build-16-03-propagation-route-from-map.png, field-build-16-04-workflow-map-safe-return.png, field-build-16-05-admission-remains-direct.png, and /tmp/worldloom-field-build/cold-llm/field-build-16-workflow-map-resume.json.
- What the methodology requires: Routeable owed Propagation from accepted major/foundational canon should be primary before further dependency-bearing Admission, without hard-blocking Admission or mutating on map reads.
- The snag: N/A - prior Field Build 15 P-01 is fixed.
- Design verdict: N/A - validation
- Recommendation: Preserve server-owned pairwise arbitration, truthful queue counts, direct Admission access, and safe return refresh.
- Repro: Open the Jon world with FAC-2 proposed and DEB-7 routeable; inspect the map's primary next decision; enter DEB-7; return safely; open Admission directly.
- Fix direction: N/A - validation
- Touches: issue #348, docs/specs/workflow-map-and-navigation.md, docs/specs/propagation-flow.md.

### V-02 - Foundational Propagation contract enforces and persists six orders plus the full atlas

- Severity: validation
- Where: Propagation run 2 for FAC-3 / DEB-7.
- What happened: The run loaded severity 4 / severe, refused close until all six shock-cone orders and all fourteen atlas domains were recorded, persisted every verified mutation, required explicit high-pressure dispositions, and cleared blockers only after complete readback. Evidence: /tmp/worldloom-field-build/screenshots/field-build-16-06-deb7-run-started.png, field-build-16-10-orders-complete.png, field-build-16-11-atlas-complete-before-pressure.png, /tmp/worldloom-field-build/cold-llm/field-build-16-deb7-orders-complete-readback.json, and field-build-16-deb7-atlas-complete-readback.json.
- What the methodology requires: Foundational facts owe zeroth through fifth orders, full domain-atlas coverage, and governed stopping states without changing source canon standing.
- The snag: N/A - contract and persistence validated; close was withheld for F-03.
- Design verdict: N/A - validation
- Recommendation: Preserve severity-derived coverage, single-mutation readbacks, source/debt identity, and non-admission write intent.
- Repro: Start DEB-7; add fewer than six orders or fourteen domains and inspect blockers; complete each owed row and inspect GET /api/propagation/runs/2 after every mutation.
- Fix direction: N/A - validation
- Touches: docs/worldbuilding-system/07_propagation_engine.md, docs/worldbuilding-system/04_domain_atlas.md, docs/specs/propagation-flow.md, W-2/W-3/W-7/W-8.

### V-03 - Current Pressure packet exposes exact assumption and mystery overreach

- Severity: validation
- Where: Propagation run 2, current Pressure packet at propagation:domain-atlas.
- What happened: The hash-validated packet carried every authored consequence, domain declaration, and disposition with no stale blocker state. A cold LLM isolated uniqueness leakage, hidden temporal-mechanics assumptions, ungated institutional/fossil claims, and medical-system pressure without writing final canon. Evidence: /tmp/worldloom-field-build/screenshots/field-build-16-12-deb7-pressure-loaded.png, /tmp/worldloom-field-build/cold-llm/field-build-16-deb7-propagation-pressure-prompt.md, and field-build-16-deb7-propagation-pressure.md.
- What the methodology requires: Pressure mode must challenge steward material, preserve advisory/canon separation, and make earned revision visible.
- The snag: N/A for challenge quality; revision is blocked separately by F-03 and context breadth is qualified by P-02.
- Design verdict: N/A - validation
- Recommendation: Preserve current-packet identity, exact authored-material inclusion, advisory framing, and assumption labeling.
- Repro: Complete six orders, fourteen domains, and six dispositions; load Pressure; compare body hash 3a14dd6573882570e4b33bf0538b13c49298216811e6e7e131f0eb96f57701f1; cold-probe the saved packet.
- Fix direction: N/A - validation
- Touches: docs/specs/prompt-out-context-assembly.md, docs/specs/propagation-flow.md, W-1.

### P-01 (proposal) - Foundational Propagation proposal packet names full-atlas duty but omits the atlas

- Severity: friction
- Where: Propagation run 2, propagation:entry, Proposal mode.
- What happened: The active packet states Required coverage: full domain-atlas sweep but supplies neither the fourteen domain names nor their decision prompts. The cold proposal explicitly warned that the atlas was unavailable and could only offer provisional headings rather than a complete sweep. Evidence: /tmp/worldloom-field-build/cold-llm/field-build-16-deb7-propagation-proposal-prompt.md, field-build-16-deb7-propagation-proposal.md, and /tmp/worldloom-field-build/screenshots/field-build-16-07-deb7-proposal-loaded.png.
- What the methodology requires: A foundational Propagation proposal packet must be self-contained enough for a cold LLM to help across the full required atlas without hidden access to 04_domain_atlas.md; Proposal mode should offer real candidate choice at the current decision.
- The snag: The packet announces the coverage obligation but withholds the decision vocabulary needed to satisfy it.
- Design verdict: N/A - prompt-context assembly rather than browser layout
- Recommendation: Include the ordered fourteen-domain inventory with compact direct/dependency/reaction/negative prompts and the full-atlas severity reason; omit long prose only with named reasons.
- Repro: Start a severity 4/severe Propagation run; load Proposal at propagation:entry; hand only the active packet to a cold LLM. It must report that the full atlas is unavailable.
- Fix direction: Propagation Prompt-out bearing-context assembly for foundational entry packets.
- Touches: docs/specs/prompt-out-context-assembly.md, docs/specs/propagation-flow.md, PRD #204, W-1/W-8/W-9.

### P-02 (pressure) - Propagation pressure packet omits related canon and kernel tone needed to classify assumptions

- Severity: friction
- Where: Propagation run 2, propagation:domain-atlas, Pressure mode.
- What happened: The packet faithfully includes all six consequences and fourteen domain declarations, but world context contains only FAC-3 and run material. Cold pressure flags Jon alone, return/carriage/forecast mechanics, and lonely, obsession-driven tone as unsupported because FAC-2, the kernel, and other related records are absent; it cannot distinguish unsupported invention from upstream governed context. Evidence: /tmp/worldloom-field-build/cold-llm/field-build-16-deb7-propagation-pressure-prompt.md, field-build-16-deb7-propagation-pressure.md, and /tmp/worldloom-field-build/screenshots/field-build-16-12-deb7-pressure-loaded.png.
- What the methodology requires: Pressure packets must carry the selected fact plus relevant world context, source records, standing rulings, and explicit record-specific omissions so a cold LLM can test contradiction, mystery, and aesthetic fidelity without repo access.
- The snag: Pressure can identify provenance gaps but cannot determine which challenged material is already supported elsewhere.
- Design verdict: N/A - prompt-context assembly rather than browser layout
- Recommendation: Assemble source-linked nearby canon, the active kernel's premise/tone/consequence-mode commitments, and dependency-bearing proposed records as clearly non-canon context; when excluded, name the exact record and reason.
- Repro: Complete a foundational Propagation draft that invokes world tone or a sibling proposed fact; load Pressure; inspect source records. Only the selected source fact and run context are present.
- Fix direction: Propagation pressure-context graph selection and explicit omission manifest.
- Touches: docs/specs/prompt-out-context-assembly.md, docs/specs/propagation-flow.md, PRD #204, W-1/W-9.

### F-01 - Duplicate React blocker keys after multiple undispositioned high-pressure consequences

- Severity: friction
- Where: Propagation run 2 after adding consequence ids 2 and 3 as high pressure without dispositions.
- What happened: Persisted run state remained correct, but the browser console emitted the React duplicate-key error for key undispositioned-high-pressure twice at first and six times total across subsequent rerenders; React warned that children may duplicate or disappear. Evidence: /tmp/worldloom-field-build/cold-llm/field-build-16-console-undispositioned-key-error.txt, field-build-16-console-final.txt, .playwright-cli/console-2026-07-10T18-05-55-937Z.log#L2-L7, and /tmp/worldloom-field-build/screenshots/field-build-16-08-three-consequences-console-key-error.png.
- What the methodology requires: The guided Propagation flow must render every close blocker and substance validation reliably; each high-pressure consequence stays individually owed until dispositioned.
- The snag: Repeated blocker rows share a non-unique React key, so blocker presentation is not structurally reliable when more than one high-pressure consequence is open.
- Design verdict: local polish - list identity is local; the decision model and persisted data are correct.
- Recommendation: Key each undispositioned blocker by stable consequence id and retain the specific consequence label.
- Repro: Start foundational Propagation; add two high-pressure consequences; leave both undispositioned; inspect browser console and close blockers.
- Fix direction: Propagation browser close-blocker list rendering / blocker identifier mapping.
- Touches: docs/specs/propagation-flow.md, W-7/W-8, React Propagation surface.

### F-02 - Answered disposition silently drops the visible optional rationale

- Severity: friction
- Where: Propagation run 2, disposition for consequence id 3.
- What happened: The steward entered and visibly verified an answered rationale, saved once, then read back disposition id 1 with note empty. The mutation was not retried. Evidence: /tmp/worldloom-field-build/cold-llm/field-build-16-deb7-disposition-1-rationale-mismatch.json and /tmp/worldloom-field-build/screenshots/field-build-16-09-answered-rationale-dropped.png.
- What the methodology requires: A stopping-state ruling must retain enough rationale to audit or resume; the active UI describes answered as governed here with optional rationale.
- The snag: The UI accepts a rationale for answered but the persisted read model drops it silently.
- Design verdict: local polish - the controlled disposition and consequence link persist; the optional note mapping or label is broken.
- Recommendation: Expose a dedicated optional rationale mapped to disposition note for answered/scoped-out states; keep debt/boundary inputs conditional and show the saved note in readback.
- Repro: Add a consequence; choose answered; type a rationale in Debt or boundary; verify; save once; GET /api/propagation/runs/2 returns the disposition with note empty.
- Fix direction: Propagation disposition browser payload and server/read-model note mapping.
- Touches: docs/specs/propagation-flow.md, W-7/W-8, Propagation consequence-disposition UI.

### F-03 - Pressure finds substantive errors after append-only staging, but the active run has no revision path

- Severity: blocking
- Where: Propagation run 2 after current Pressure output, before Close Run.
- What happened: Cold pressure found that consequence 1 imports still-proposed uniqueness, consequences 2/5 assume temporal mechanics, and several institutional/fossil statements need conditional gating. The active surface offers only Add Consequence, Record Domain, Save Disposition, and Close Run; recorded rows have no edit, retract, supersede, or replace action. Diagnostic route inspection likewise exposes only POST /api/propagation/consequences for consequence writes. The server reports zero blockers and closePreview.status ready, but closing would freeze an append-only report containing material the required Pressure beat invalidated. Evidence: /tmp/worldloom-field-build/screenshots/field-build-16-13-revision-blocked-no-edit.png, the Pressure artifacts above, /tmp/worldloom-field-build/cold-llm/field-build-16-deb7-pressure-blocked-frontier.json, and packages/server/src/http/propagation-routes.ts.
- What the methodology requires: Pressure is upstream of completion; substantive challenges require steward revision and a fresh Pressure packet before the decision completes. Append-only applies to the closed propagation report, not to an uncorrectable pre-close draft.
- The snag: The app can detect earned revisions but cannot apply them without appending contradictory rows or closing known-bad material.
- Design verdict: redesign candidate - local copy or one extra button is insufficient; the pre-close staging lifecycle, disposition invalidation, packet staleness, and final append-only boundary must change together.
- Recommendation: Make pre-close consequence/domain rows mutable or explicitly supersedable/retractable; invalidate affected dispositions and close readiness on revision; mark the packet stale; require refreshed current Pressure after substantive edits; preserve append-only semantics once the report closes.
- Repro: Start severity 4/severe FAC-3 Propagation; add/disposition six orders and fourteen domains; load current Pressure; identify Jon alone as substantive overreach; attempt to revise consequence 1. No edit/retract/supersede action exists while Close Run remains enabled.
- Fix direction: Propagation draft lifecycle in server routes/store plus browser row actions and pressure-revision state.
- Touches: docs/specs/propagation-flow.md, docs/specs/prompt-out-context-assembly.md, W-1/W-7/W-8/W-9, report append-only boundary.

## Regression of prior findings

**Replay gate:** Field Build 15 app commit bb82150 -> current commit 945c626. HEAD advanced; bootstrap had no apps/, packages/, or other worktree dirt.

- Field Build 15 P-01 (Workflow-map Propagation-debt arbitration): fixed -> V-01.
  - Repro replayed: Opened the exact Jon world state with FAC-2 queued and routeable DEB-7; the map foregrounded Propagation, routed to the owed item, safely refreshed, and left Admission directly usable. Evidence: screenshots field-build-16-02 through field-build-16-05 and workflow-map/progression/admission API readbacks.
- Field Build 14 F-01 (search endpoint 500 on FAC-): not-reverifiable-this-run.
  - Repro replayed: Not replayed; search is behind and outside the resumed DEB-7 Propagation frontier. Carried unchanged.
- Field Build 11 P-01 (stale secondary Creation Prompt-out after correction/mode switch): not-reverifiable-this-run.
  - Repro replayed: Not replayed; Creation correction is behind the same-seed resume frontier. Current Propagation staleness worked, but it is not the same surface. Carried unchanged.
- Field Build 11 F-02 (duplicate narrowing-note correction contexts): not-reverifiable-this-run.
  - Repro replayed: Not replayed; no Creation correction mutation was attempted. Historical duplicate provenance remains outside this run. Carried unchanged.

## Decision-point log (evidence)

### Setup, reopen, and routing regression

- Stage / decision point: Setup/open existing world and Workflow-map arbitration.
- Docs-first draft: Reopen the Field Build 15 world, resolve routeable DEB-7 before more dependency-bearing Admission, and prove the non-blocking sibling route.
- Prompt-out coverage: proposal=N/A; pressure=N/A.
- Cold LLM (proposal): N/A.
- Cold LLM (pressure): N/A.
- Committed: No world mutation during regression replay.
- UX/style verdict: ok - the map names the decision and reason calmly, shows both queues, and keeps both destinations usable.
- Obsolescence verdict: docs-obsolete for this routing seam -> V-01.

### DEB-7 run entry and Proposal

- Stage / decision point: Propagation run entry for FAC-3 / DEB-7.
- Docs-first draft: Govern FAC-3 as current-horizon non-deployable institutional access; preserve mechanism, ultimate reproducibility, diagnostics, and secret modeling; work all six orders and fourteen domains; do not change canon standing.
- Prompt-out coverage: proposal=active exercised; prompt=/tmp/worldloom-field-build/cold-llm/field-build-16-deb7-propagation-proposal-prompt.md; output=/tmp/worldloom-field-build/cold-llm/field-build-16-deb7-propagation-proposal.md; subagent=/root/fb16_prop_proposal; pressure=deferred until steward material existed.
- Cold LLM (proposal): Distinguished institutional pressure through Jon, institutional quiet without actionable evidence, and two explicitly undecided branches (diagnostics and partial modeling). It also said the full atlas was unavailable -> P-01.
- Cold LLM (pressure): N/A at entry.
- Committed: Started flow 2 linked to source FAC-3 and debt DEB-7; no canon standing changed.
- UX/style verdict: ok for route, identity, severity, blockers, and write intent.
- Obsolescence verdict: docs still needed for full atlas candidate coverage -> P-01.

### Shock-cone orders and stopping states

- Stage / decision point: Zeroth through fifth-order consequences and disposition.
- Docs-first draft: Work definition, direct effects, adaptation, institutionalization, historical/ordinary residue, and identity pressure with awareness-gated institutional consequences and preserved unknowns.
- Prompt-out coverage: proposal already exercised at entry; pressure deferred until all steward rows existed.
- Cold LLM (proposal): The awareness gradient was adopted in steward wording; diagnostics/modeling remained unadmitted.
- Cold LLM (pressure): Later challenged uniqueness, temporal-mechanics assumptions, institutional thresholds, fossils, and medicalization.
- Committed: Consequences 1-6 and dispositions 1-6 persisted in run 2; report not closed.
- UX/style verdict: local F - repeated open blockers emit duplicate React keys (F-01), and answered rationale is silently dropped (F-02).
- Obsolescence verdict: app carries order/severity/stopping coverage, but the docs and cold Pressure were still needed to detect embedded overreach.

### Full domain-atlas sweep

- Stage / decision point: All fourteen domain declarations.
- Docs-first draft: Direct pressure in metaphysics, governance, coercion, knowledge, history; dependency pressure in geography; reaction pressure in household, economy, religion, culture, ordinary life, aesthetics; explicit negative bounds in ecology and production.
- Prompt-out coverage: proposal entry packet exercised but lacked atlas list (P-01); pressure active exercised after all domains.
- Cold LLM (proposal): Could not claim complete atlas coverage from the packet alone.
- Cold LLM (pressure): Preserved quiet domains while challenging medical-system reaction, institutional awareness, duration, and fossil thresholds.
- Committed: Domain rows 1-14 persisted; no close blockers remained mechanically.
- UX/style verdict: ok - the long screen remains followable through order cards, domain cards, readbacks, and blocker summary.
- Obsolescence verdict: docs still needed because the Proposal packet omitted atlas doctrine and Pressure lacked related-world context -> P-01/P-02.

### Pressure and revision frontier

- Stage / decision point: Current Pressure review before Propagation close.
- Docs-first draft: Close only if pressure earns no substantive revision; otherwise revise affected staged rows, reload a current packet, and pressure again.
- Prompt-out coverage: pressure=active exercised; prompt=/tmp/worldloom-field-build/cold-llm/field-build-16-deb7-propagation-pressure-prompt.md; output=/tmp/worldloom-field-build/cold-llm/field-build-16-deb7-propagation-pressure.md; subagent=/root/fb16_prop_pressure; body hash=3a14dd6573882570e4b33bf0538b13c49298216811e6e7e131f0eb96f57701f1.
- Cold LLM (proposal): N/A at this point.
- Cold LLM (pressure): Found substantive errors and unsupported assumptions; see V-03 and P-02.
- Committed: No close. Flow 2 remains in progress; DEB-7 remains open; safe return parked the run.
- UX/style verdict: redesign candidate - Pressure succeeds but the active app cannot revise the material it challenges -> F-03.
- Obsolescence verdict: docs not obsolete; the app cannot complete the required pressure-revision loop.

## For the app (PRD seeds)

### App Seed 1 - Pre-close Propagation revision lifecycle

- Disposition: new relative to issues #109-#113, PRDs #201/#202/#204/#205-#210/#348, and searched prior field/parity reports.
- Likely spec/component: docs/specs/propagation-flow.md; packages/server/src/http/propagation-routes.ts; Propagation staging store; packages/web/src/main.tsx Propagation rows.
- UX scope: redesign

F-03 is one coherent product seam: Pressure cannot be meaningful if the run cannot revise, retract, or supersede pre-close consequence/domain rows. Add an explicit staging lifecycle, invalidate dependent dispositions/readiness, refresh packet identity, and keep append-only semantics at the closed-report boundary.

### App Seed 2 - Foundational Propagation packet context

- Disposition: extending relative to PRD #204 and prior Prompt-out context/currentness work.
- Likely spec/component: docs/specs/prompt-out-context-assembly.md; Propagation Prompt-out bearing-context/source graph assembly.
- UX scope: N/A - not UX

P-01/P-02 show complementary omissions: Proposal lacks the required atlas vocabulary, while Pressure lacks related canon and kernel/tone provenance. Make the packets self-contained with compact atlas doctrine, relevant linked records, and record-specific omission reasons.

### App Seed 3 - Propagation blocker and disposition integrity polish

- Disposition: new relative to checked tracker and prior report surfaces.
- Likely spec/component: Propagation close-blocker identifiers/rendering; browser disposition payload; server/read-model note mapping.
- UX scope: local polish

F-01/F-02 are narrow but evidence-bearing: blocker rows need stable per-consequence identity, and optional answered rationale must persist or the field must stop claiming it will.

### Validation-only prior seed

Closed PRD #348 is validated by V-01. No further routing PRD seed is needed.

## For the methodology

None. The methodology was clear: foundational facts owe full propagation, every high-pressure consequence needs a stopping state, and substantive Pressure requires revision before completion. The blocking gap is the app's pre-close lifecycle, not source doctrine.

## Frontier

- Walked to: DEB-7 Propagation flow 2 with six orders, fourteen domain declarations, six answered dispositions, current Proposal and Pressure cold probes, and a substantive revision verdict. The report was deliberately not closed.
- Next run resumes at: /tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite, Propagation flow 2 / DEB-7. First re-verify F-03 after app changes. Then revise or supersede consequence 1's Jon alone wording, condition consequences 2/5 and affected domains on governed return/carriage/exposure facts, review medical-system and institutional-duration gates, invalidate/re-author affected dispositions, load a fresh current Pressure packet, run a new cold probe, and close only when that pressure earns no substantive change.
- App-reported state: Mechanical close preview is ready and Workflow map still foregrounds owed Propagation; do not use Close Run until F-03 is fixed and the earned revisions are applied.
- Carried-open findings: blocking F-03; friction P-01, P-02, F-01, F-02; Field Build 14 F-01 and Field Build 11 P-01/F-02 remain not-reverifiable-this-run. V-01/V-02/V-03 are closed validations.
- World state: FAC-3 remains accepted with constraints; FAC-2 remains proposed; DEB-7 remains open; Propagation flow 2 remains in_progress; no propagation_report was created; no surfaced proposal, new canon debt, protected boundary, skip, or canon-standing mutation was added.
