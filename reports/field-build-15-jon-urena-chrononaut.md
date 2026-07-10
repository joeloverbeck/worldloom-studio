# Field Build 15 - Jon Urena Chrononaut

**Date:** 2026-07-10 | **App commit:** bb82150 | **Method version:** worldbuilding-system 1.1

**Essence (user seed):** Jon Urena is a biologically anomalous, immortal, invulnerable time traveler whose private obsessions keep colliding with history.

**World:** Jon Urena Chrononaut - a modern-Earth world where one anomalous person's non-deployable temporal access stresses history, evidence, institutions, and ordinary life. **World file:** `/tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite`.

**Path walked:** setup/open existing world -> Workflow map Admission handoff -> Admission full gate for `FAC-3` -> Proposal and Pressure Prompt-out probes -> steward-authored full-gate completion -> post-completion Admission/Propagation frontier.

**Prior runs:** `reports/field-build-14-jon-urena-chrononaut.md` and earlier Jon Urena runs 10-13.

**Evidence:** screenshots at `/tmp/worldloom-field-build/screenshots/field-build-15-*.png`; prompt packets and cold outputs at `/tmp/worldloom-field-build/cold-llm/field-build-15-*.md`; API readbacks at `/tmp/worldloom-field-build/cold-llm/field-build-15-*.json`; live log at `/tmp/worldloom-field-build/build-log.md`.

**Prior-art frame:** Checked current issue reachability for #109-#113 and #201/#202/#204/#205-#210; all returned closed. This run mainly validates the Field Build 14 full-gate frontier and Field Build 14 `R-01` pre-load Prompt-out currentness polish on the full-gate surface. The only new P/R/F cluster is workflow routing after fresh propagation debt.

## Findings

### V-01 - Existing Jon world reopens at the FAC-3 full-gate frontier

- Severity: validation.
- Where: Setup, Workflow map, and Admission after opening `/tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite`.
- What happened: The app reopened the existing Jon world. Workflow map readback showed Admission active with two proposed facts, six open canon-debt items, and `FAC-3` already carrying `admissionLevel=4` / `workScale=severe` from Field Build 14.
- What the methodology requires: Continuation runs must resume the same world file and decision frontier rather than restarting Creation.
- The snag: None. This is validation evidence.
- Fix direction: N/A - validation.
- Touches: Setup world open, Workflow map, Admission queue resume.
- Repro: Open the app, enter `/tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite`, click `Open world`, then inspect Workflow map and `/api/admission/queue`.
- Design verdict: N/A - validation.
- Recommendation: Keep explicit world-path readback and queue-state API visibility.
- Evidence: `/tmp/worldloom-field-build/screenshots/field-build-15-01-entry-setup.png`, `/tmp/worldloom-field-build/screenshots/field-build-15-02-workflow-map-resume.png`, `/tmp/worldloom-field-build/cold-llm/field-build-15-workflow-map-resume.json`, `/tmp/worldloom-field-build/cold-llm/field-build-15-admission-queue-resume.json`.

### V-02 - FAC-3 full-gate contract exposes the required 17-section decision

- Severity: validation.
- Where: Admission `FAC-3`, current step `record:6:severity-declared`.
- What happened: Selecting `FAC-3` loaded the full canon fact gate with 17 required sections, written consequence, operation order, target canon status, constraint tags, follow-up debt, and exact-payload review before completion. The pre-load prompt surface explicitly said no selected-mode packet was loaded and that the preview could not be copied/exported/stored as current.
- What the methodology requires: Severe/foundational Admission work owes full-gate substance, written consequences, explicit operations, constraints, and follow-up debt; current Prompt-out identity must not be ambiguous.
- The snag: None on this surface. This validates the Field Build 14 `R-01` recommendation for the full-gate state.
- Fix direction: N/A - validation.
- Touches: Admission full gate, Prompt-out currentness, W-1/W-3/W-8.
- Repro: From Workflow map, click `Go to decision`, select `FAC-3`, and inspect the full-gate contract before loading Prompt-out.
- Design verdict: N/A - validation.
- Recommendation: Preserve the non-current pre-load copy/export warning.
- Evidence: `/tmp/worldloom-field-build/screenshots/field-build-15-03-admission-full-gate-entry.png`, `/tmp/worldloom-field-build/screenshots/field-build-15-04-fac3-full-gate-selected.png`, `/tmp/worldloom-field-build/cold-llm/field-build-15-fac3-decision-point-resume.json`, `/tmp/worldloom-field-build/cold-llm/field-build-15-fac3-gate-resume.json`.

### V-03 - Full-gate Prompt-out packets are current, self-contained, and stale-aware

- Severity: validation.
- Where: Admission Prompt-out for `FAC-3`, step `admission:constraints`.
- What happened: Proposal mode loaded with body hash `89485ef1be8e698709be6d5a8f0f48a7a1c0cea919f041a2e3026e7fc796811c`. After steward edits, the app marked that packet stale. Pressure mode then loaded against the represented draft with body hash `9127d213a68e7c477c2be92b0f70e47b7fd5d7435fc409a72f22ddfc8b4b363c`; after pressure-driven revisions, refreshed Pressure packets loaded with hashes `b606b9151ba91975fa02be0be1f2680df8be391649f4d6c77e6d020f03dd1bc6` and final `dfefb0d83d501e58fa745cfebd26bd589ba0df4a8269a6c9e8847ef94832813b`. Diagnostic API responses matched the visible hashes.
- What the methodology requires: AI assistance must remain advisory, self-contained, source-manifested, and clearly separated from steward-authored canon.
- The snag: None. The capture route relied on diagnostic API calls for bounded artifact saves, but the body hashes matched the active UI packets.
- Fix direction: N/A - validation.
- Touches: Prompt-out context assembly, Admission full-gate prompt templates, stale packet identity.
- Repro: Load Proposal, edit full-gate fields, observe stale marking, load Pressure, compare visible loaded hashes with `/api/prompt-out/steps/actions/generate`.
- Design verdict: N/A - validation.
- Recommendation: Keep stale-state labeling and represented-draft packet identity.
- Evidence: `/tmp/worldloom-field-build/screenshots/field-build-15-05-fac3-full-gate-proposal-loaded.png`, `/tmp/worldloom-field-build/screenshots/field-build-15-07-fac3-full-gate-pressure-loaded.png`, `/tmp/worldloom-field-build/screenshots/field-build-15-08-fac3-full-gate-pressure-revised-loaded.png`, `/tmp/worldloom-field-build/screenshots/field-build-15-09-fac3-full-gate-final-pressure-loaded.png`, `/tmp/worldloom-field-build/cold-llm/field-build-15-fac3-full-gate-proposal.md`, `/tmp/worldloom-field-build/cold-llm/field-build-15-fac3-full-gate-pressure.md`, `/tmp/worldloom-field-build/cold-llm/field-build-15-fac3-full-gate-pressure-revised.md`.

### V-04 - FAC-3 full-gate completion persists accepted-with-constraints canon and creates propagation debt

- Severity: validation.
- Where: Admission full-gate completion for `FAC-3`.
- What happened: The steward-authored gate accepted `FAC-3` with constraints, operation `constrain`, and tags `access-bound`, `knowledge-bound`, `institution-bound`, `cost-bound`. The final record body narrows the admitted fact to non-deployable institutional access and explicitly preserves ultimate reproducibility, diagnostic detection, future extraordinary study, and secret partial modeling. Post-completion readback shows `FAC-3` `canonStatus=accepted with constraints`. The app created `DEB-7 Propagation owed for FAC-3` and exposed it in `/api/propagation/queue`.
- What the methodology requires: Admission is the only flow that changes canon standing; full gates must record consequence, constraint, operation, and follow-up debt before a major/foundational fact enters canon.
- The snag: None for persistence and debt creation.
- Fix direction: N/A - validation.
- Touches: Admission gate completion, canon standing, canon debt, Propagation queue.
- Repro: Fill all full-gate sections, review exact payload, click `Complete and update canon standing`, then read `/api/canon-workbench/records/6`, `/api/canon-debt?open=true`, and `/api/propagation/queue`.
- Design verdict: N/A - validation.
- Recommendation: Preserve the exact-payload review before final completion.
- Evidence: `/tmp/worldloom-field-build/screenshots/field-build-15-10-fac3-full-gate-review.png`, `/tmp/worldloom-field-build/screenshots/field-build-15-11-fac3-full-gate-completed.png`, `/tmp/worldloom-field-build/cold-llm/field-build-15-fac3-record-detail-after-complete.json`, `/tmp/worldloom-field-build/cold-llm/field-build-15-canon-debt-after-fac3-complete.json`, `/tmp/worldloom-field-build/cold-llm/field-build-15-propagation-queue-after-fac3-complete.json`.

### P-01 - Workflow map routes next to Admission while fresh FAC-3 propagation debt is waiting

- Severity: product gap, medium.
- Where: Workflow map after completing severe/foundational `FAC-3`.
- What happened: Post-completion readbacks show `FAC-3` accepted with constraints and `DEB-7` waiting in the Propagation queue. The Workflow map still reports next decision `Work Admission queue` because `FAC-2` remains proposed, even though `/api/propagation/queue` exposes the required `DEB-7` route.
- What the methodology requires: `07_propagation_engine.md` says to run the propagation sweep after any Level 2 or higher fact. `03_truth_layers_and_canon_governance.md` says a fact with unmanaged canon debt should not become a foundation for another major fact. `checklists/propagation_sweep.md` says a completed sweep must leave shock-cone summary, domain ripples, stop condition, and canon debt.
- The snag: A steward following only the map's primary next decision can move into another Admission before resolving or explicitly deferring the fresh propagation debt from a severe accepted fact.
- Fix direction: Workflow map routing/arbitration should prioritize fresh propagation debt from accepted Level 2+ facts, or present an explicit "Admission vs Propagation" decision with the debt and risk. If it still routes to Admission, it should warn that `DEB-7` must be resolved or intentionally deferred before using `FAC-3` as support for another major/foundational fact.
- Touches: Workflow map, Propagation queue, Admission queue, W-2/W-7/W-8.
- Repro: Complete `FAC-3` full gate with follow-up debt, then read `/api/workflow-map` and `/api/propagation/queue`.
- Design verdict: Routing priority gap, not data loss. The Propagation queue exists and is correct; the map's primary recommendation is the weak link.
- Recommendation: Add dependency-aware next-decision priority for propagation debt from accepted major/foundational facts.
- Evidence: `/tmp/worldloom-field-build/screenshots/field-build-15-12-workflow-map-after-fac3-complete.png`, `/tmp/worldloom-field-build/screenshots/field-build-15-13-propagation-queue-after-fac3-complete.png`, `/tmp/worldloom-field-build/screenshots/field-build-15-14-admission-queue-after-fac3-complete.png`, `/tmp/worldloom-field-build/cold-llm/field-build-15-workflow-map-after-fac3-complete.json`, `/tmp/worldloom-field-build/cold-llm/field-build-15-propagation-queue-after-fac3-complete.json`, `/tmp/worldloom-field-build/cold-llm/field-build-15-admission-queue-after-fac3-complete.json`.

## Regression of prior findings

**Replay gate:** Field Build 14 app commit `4487ce5` -> current commit `bb82150`. HEAD advanced. Bootstrap had no current `apps/` or `packages/` dirty paths; pre-existing dirty files were `.claude/skills/field-build-prd-prep/SKILL.md` and `reports/field-build-14-jon-urena-chrononaut-prd-prep.md`.

| Prior finding | Status in Field Build 15 | Evidence |
|---|---|---|
| Field Build 14 `R-01` - Admission pre-load prompt preview currentness polish | Fixed/validated on the FAC-3 full-gate surface. Before explicit load, the UI stated no selected-mode packet was loaded and that the preview was non-current and not copy/export/store eligible. | V-02, screenshot `field-build-15-04-fac3-full-gate-selected.png`. |
| Field Build 14 `F-01` - search endpoint 500s on `FAC-` | Not re-verifiable this run. Search was not part of the resumed full-gate path. | Carried as not-reached. |
| Field Build 11 `P-01` - stale secondary Creation Prompt-out preview after correction/mode switch | Not re-verifiable this run. Creation correction was not re-entered. Admission full-gate stale/current behavior worked, but it is not the same surface. | Carried as not-reached. |
| Field Build 11 `F-02` - duplicate narrowing-note correction contexts | Not re-verifiable this run. Duplicate historical `CCP-2`/`CCP-3` provenance remains visible; no current Creation correction mutation was attempted. | Carried as not-reached. |

## Decision-point log (evidence)

### Setup and reopen

- Stage / decision point: Setup/open existing world.
- Docs-first draft: Reopen the same SQLite file from Field Build 14 and verify `FAC-3` full-gate frontier before authoring.
- Prompt-out coverage: proposal=N/A; pressure=N/A.
- Cold LLM (proposal): N/A.
- Cold LLM (pressure): N/A.
- Committed: No world mutation.
- UX/style verdict: ok.
- Obsolescence verdict: docs-obsolete for setup; app carried path ownership and Workflow map handoff.

### FAC-3 full-gate selection

- Stage / decision point: Admission full-gate selection for `FAC-3`.
- Docs-first draft: Complete `FAC-3` before `FAC-2`; preserve mechanism mystery and avoid turning "non-reproducible" into a total metaphysical ruling.
- Prompt-out coverage: proposal=deferred until full-gate packet load; pressure=deferred until steward draft exists.
- Cold LLM (proposal): N/A.
- Cold LLM (pressure): N/A.
- Committed: Selected `FAC-3`; no mutation.
- UX/style verdict: ok; Field Build 14 pre-load currentness issue fixed on this surface.
- Obsolescence verdict: app carried the gate contract; docs still needed to judge propagation burden.

### FAC-3 proposal packet and first draft

- Stage / decision point: Admission full-gate authoring.
- Docs-first draft: Accept with constraints; operation `constrain`; tags `access-bound`, `knowledge-bound`, `institution-bound`, `cost-bound`; preserve exact mechanism and future-study uncertainty.
- Prompt-out coverage: proposal=`active=exercised; diagnostic matched body hash 89485ef1be8e698709be6d5a8f0f48a7a1c0cea919f041a2e3026e7fc796811c; prompt=/tmp/worldloom-field-build/cold-llm/field-build-15-fac3-full-gate-proposal-prompt.md; output=/tmp/worldloom-field-build/cold-llm/field-build-15-fac3-full-gate-proposal.md; subagent=019f4c17-1421-79d1-a93a-d879b9fda57d`.
- Cold LLM (proposal): Recommended accepting a constrained non-deployable access boundary, keeping Jon as bottleneck, and preserving mechanism mysteries; advised not to finalize hard "non-reproducible in principle" language.
- Cold LLM (pressure): N/A at this point.
- Committed: No canon mutation; steward draft filled.
- UX/style verdict: ok; prior Proposal packet became stale after draft edits.
- Obsolescence verdict: app provided useful proposal scaffolding, but docs/steward judgment still decided exact scope.

### FAC-3 pressure and revision

- Stage / decision point: Pressure on steward-authored full-gate draft.
- Docs-first draft: Challenge deployability, coercion, evidence thresholds, institutional consequences, diagnostics, branch mechanics, and adjacent mysteries before completion.
- Prompt-out coverage: initial pressure=`active=exercised; diagnostic matched body hash 9127d213a68e7c477c2be92b0f70e47b7fd5d7435fc409a72f22ddfc8b4b363c; output=/tmp/worldloom-field-build/cold-llm/field-build-15-fac3-full-gate-pressure.md; subagent=019f4c1e-94d6-7fd2-81f8-aad597a25be3`; revised pressure=`active=exercised; diagnostic matched body hash b606b9151ba91975fa02be0be1f2680df8be391649f4d6c77e6d020f03dd1bc6; output=/tmp/worldloom-field-build/cold-llm/field-build-15-fac3-full-gate-pressure-revised.md; subagent=019f4c23-e697-76b0-8b1b-6fd60cd30822`; final current packet=`active=exercised; diagnostic matched body hash dfefb0d83d501e58fa745cfebd26bd589ba0df4a8269a6c9e8847ef94832813b; prompt=/tmp/worldloom-field-build/cold-llm/field-build-15-fac3-full-gate-pressure-final-prompt.md`.
- Cold LLM (proposal): N/A.
- Cold LLM (pressure): First pressure pass pushed scope narrowing, coercion, diagnostics, evidence thresholds, and branch mechanics. Second pressure pass challenged title overreach, deployment-by-proxy, institutional failure modes, mundane systems, wrong explanations, and mystery bundling.
- Committed: Revised the draft, not canon yet.
- UX/style verdict: ok; each post-edit packet load cleared stale state and exposed a new hash.
- Obsolescence verdict: docs and cold pressure materially improved the steward-authored gate; app encoded the workflow and currentness checks.

### FAC-3 full-gate completion

- Stage / decision point: Exact payload review and Admission completion.
- Docs-first draft: Admit only the non-deployable institutional-access boundary; do not decide ultimate reproducibility, diagnostics, causal mechanics, or adjacent anti-aging/implant mysteries; create propagation debt.
- Prompt-out coverage: proposal and pressure both exercised before completion.
- Cold LLM (proposal): Helped frame the non-deployable access boundary.
- Cold LLM (pressure): Helped sharpen the final follow-up debt and preservation boundaries.
- Committed: `FAC-3` accepted with constraints; `DEB-7` propagation debt created.
- UX/style verdict: ok for gate review/completion.
- Obsolescence verdict: app now carries the resulting canon/debt state; docs still needed to decide the next frontier against Workflow map priority.

### Post-completion frontier

- Stage / decision point: Workflow map after `FAC-3` completion.
- Docs-first draft: Work `DEB-7` propagation before using `FAC-3` as support for more major/foundational Admission work.
- Prompt-out coverage: proposal=N/A; pressure=N/A.
- Cold LLM (proposal): N/A.
- Cold LLM (pressure): N/A.
- Committed: No additional mutation.
- UX/style verdict: local product gap - see `P-01`.
- Obsolescence verdict: docs not obsolete for routing priority; the app exposes both queues but primary next decision under-prioritizes propagation.

## For the app (PRD seeds)

### App Seed 1 - Workflow map should arbitrate fresh propagation debt before more major Admission

- Disposition: new relative to checked prior-art surfaces.
- Likely spec/component: Workflow map next-decision priority; Propagation queue; Admission queue.
- UX scope: workflow guidance and methodology encoding.

After accepting a severe/foundational fact with follow-up propagation debt, Workflow map still selects `Work Admission queue` as the primary next decision because `FAC-2` remains proposed. The Propagation queue route is present and correct, but the primary map recommendation can steer a steward away from `DEB-7`. Add dependency-aware routing or an explicit arbitration warning when accepted Level 2+ facts have fresh unmanaged propagation debt.

## For the methodology

No methodology-source change is proposed. The method is clear that Level 2+ facts need propagation and that unmanaged canon debt should not silently become a foundation for more major work. The gap is in app routing priority, not the documents.

## Frontier

- Walked to: `FAC-3` full gate completed; `FAC-3` is `accepted with constraints`.
- Next run should resume at: `/tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite`, Propagation queue item `DEB-7 Propagation owed for FAC-3`, before admitting any new major/foundational fact that depends on the accepted access boundary.
- App-reported next decision: Workflow map says `Work Admission queue` because `FAC-2` is still proposed. Treat this as the `P-01` routing gap; the stronger methodology frontier is `DEB-7`.
- World state: `FAC-3` accepted with constraints; `FAC-2` remains proposed with severity unset; `DEB-1` through `DEB-7` remain open; `/api/propagation/queue` contains `DEB-7` for source fact `FAC-3`.
- Carried-open findings: Field Build 14 `F-01` search punctuation remains not-reverified; Field Build 11 `P-01` and `F-02` remain not-reverified; Field Build 15 `P-01` is new.
