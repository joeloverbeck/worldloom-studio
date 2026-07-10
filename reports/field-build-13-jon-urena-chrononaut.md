# Field Build 13 - Jon Urena Chrononaut

**Date:** 2026-07-10 | **App commit:** 8fa2e54 | **Method version:** worldbuilding-system 1.1

**Seed / world:** Jon Urena is a biologically anomalous, immortal, invulnerable time traveler whose private obsessions keep colliding with history.

**Continuation source:** `reports/field-build-12-jon-urena-chrononaut.md`

**World file:** `/tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite`

**Path walked:** setup/open existing world -> workflow-map regression replay -> Creation seed-family coverage entry -> Prompt-out proposal and pressure probes -> coverage row bootstrap -> row dispositions -> Admission handoff.

**Prior-art frame:** I verified the prior field-build reports, `reports/prd-339-creation-coverage-bootstrap-replay.md`, and GitHub surfaces #109-#113, #201/#202/#204/#205-#210, #321, and #339. PRD #339 is the direct implementation prior art for this run. This report validates that fix against the existing Jon Urena world rather than a throwaway replay fixture.

**Evidence root:** `/tmp/worldloom-field-build/`

## Findings

### V-01 - Existing Jon world reopens at the Field Build 12 frontier

**Where:** Setup and Workflow map after opening `/tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite`.

**What happened:** The visible world-path textbox was filled with the Field Build 12 world path and read back exactly before `Open world`. The app opened the Workflow map with next decision `Resolve seed-family coverage`, Creation active/owed, and Admission blocked.

**What the methodology requires:** A continuation run must preserve the existing world and resume from the prior frontier instead of starting a new seed.

**The snag:** None. This is validation evidence.

**Fix direction:** N/A.

**Touches:** Continuation setup, local-first world open, workflow-map resume state.

**Repro:** Open the app at `http://127.0.0.1:5173/`, enter `/tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite`, click `Open world`, and inspect the Workflow map.

**Design verdict:** Validation.

**Recommendation:** Keep the explicit world-path readback in future field builds; it preserved the continuation boundary.

**Evidence:** `/tmp/worldloom-field-build/screenshots/field-build-13-01-entry-setup.png`, `/tmp/worldloom-field-build/screenshots/field-build-13-02-workflow-map-resume.png`, `/tmp/worldloom-field-build/cold-llm/field-build-13-workflow-map-resume.json`.

### V-02 - Field Build 12 F-01 is fixed: empty coverage inventory has active controls

**Where:** Creation `decomposition:coverage`, after `Go to decision` and `Start or Resume Creation`.

**What happened:** The app rendered empty-state controls for seed-family coverage: row labels, source context, required-row setting, `Add another coverage row`, and `Confirm coverage rows`. I authored eight required rows through visible controls and submitted them. The server readback then showed eight required unresolved rows and `completionBlocked=true`.

**What the methodology requires:** `05_creation_protocol.md` requires broad seed material to be split or explicitly accounted for before Admission. `docs/specs/creation-flow.md` requires steward-confirmed coverage rows and resolved dispositions before Admission primary path.

**The snag:** None for the original Field Build 12 blocker. The UI can now satisfy the empty-inventory gate through active controls.

**Fix direction:** N/A.

**Touches:** Creation coverage UI, coverage create/confirm path, server coverage readback.

**Repro:** Reopen the world, enter Creation coverage, fill row labels and source context, click `Confirm coverage rows`, then read `/api/flows/creation/coverage`.

**Design verdict:** Validation of the prior active-surface blocker fix.

**Recommendation:** Preserve the empty-state row controls and server validation behavior; this is the path that prevents hidden API-only coverage work.

**Evidence:** `/tmp/worldloom-field-build/screenshots/field-build-13-03-creation-coverage-entry.png`, `/tmp/worldloom-field-build/screenshots/field-build-13-05-coverage-bootstrap-filled.png`, `/tmp/worldloom-field-build/screenshots/field-build-13-06-coverage-rows-created.png`, `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-entry.json`, `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-after-create.json`.

### V-03 - Field Build 12 P-01 is fixed: Proposal packet answers the coverage decision

**Where:** Creation Prompt-out while the active step is `decomposition:coverage`, Proposal mode.

**What happened:** Loading Proposal mode produced a packet whose body says the current decision is to "create or confirm seed-family coverage rows before Admission handoff." The visible loaded body hash matched the diagnostic response hash `54a11646db05bc5423c494b9cd398fb44f96f34f282580cfc4cd433a0dcfb9dd`. A cold subagent given only the saved packet proposed coverage candidates for repeated bodily travel, non-deployable access, institutional followability, finite actor limits, friction/residue, and protected mechanism mystery.

**What the methodology requires:** Prompt-out must outsource the current decision point. At `decomposition:coverage`, Proposal mode should help draft coverage rows and disposition questions without mutating canon or treating parked seeds as admitted.

**The snag:** None for the prior blocker. The route still uses `stepKey=creation:decomposition_prompt` and `templateKey=decomposition_pressure`, but the packet body and cold output were coverage-specific and usable for the active decision.

**Fix direction:** N/A.

**Touches:** Prompt-out packet content, coverage context assembly, cold-LLM advisory route.

**Repro:** With the world at Creation coverage, choose Proposal mode, click `Load Creation Prompt-out Step`, inspect the current packet body, and run a cold read of the saved packet.

**Design verdict:** Validation of the prior wrong-decision Proposal packet fix.

**Recommendation:** Keep the coverage-specific body and missing-inventory source manifest. If the packet label is later polished, ensure the body hash/content behavior remains unchanged.

**Evidence:** `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-proposal-identity.json`, `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-proposal-response.json`, `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-proposal-prompt.md`, `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-proposal.md`.

### V-04 - Field Build 12 P-02 is fixed: Pressure packet attacks missing coverage

**Where:** Creation Prompt-out while the active step is `decomposition:coverage`, Pressure mode.

**What happened:** Loading Pressure mode produced a packet whose mode request says not to evaluate Admission readiness while coverage inventory is missing. The visible loaded body hash matched the diagnostic response hash `1772be456de83df89813d8199864f0cb67ec4e6b26f9b2f0aa5aa331904c9039`. A cold subagent given only the saved packet challenged missing rows for known exclusivity, mechanism mystery boundary, institutional followability, finite actor limits, and premature Admission language.

**What the methodology requires:** Pressure mode should attack the active coverage decision: missing seed families, false equivalences, unjustified deferrals, unsupported out-of-scope claims, and premature handoff.

**The snag:** None for the prior blocker. The cold answer pressured coverage instead of re-answering the old seed-decomposition handoff question.

**Fix direction:** N/A.

**Touches:** Prompt-out pressure packet content, coverage source manifest, cold-LLM advisory route.

**Repro:** With the world at Creation coverage, choose Pressure mode, click `Load Creation Prompt-out Step`, inspect the current packet body, and run a cold read of the saved packet.

**Design verdict:** Validation of the prior wrong-decision Pressure packet fix.

**Recommendation:** Preserve the explicit refusal to evaluate Admission readiness before coverage is resolved.

**Evidence:** `/tmp/worldloom-field-build/screenshots/field-build-13-04-coverage-pressure-loaded.png`, `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-pressure-identity.json`, `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-pressure-response.json`, `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-pressure-prompt.md`, `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-pressure.md`.

### V-05 - Coverage dispositions resolve Creation without admitting canon

**Where:** Creation seed-family coverage rows after bootstrap.

**What happened:** I linked `Known repeated bodily time traveler` to `FAC-2` and `Non-technological, non-deployable temporal access` to `FAC-3`. I deferred six remaining kernel seed families as governed seed debt: protected mechanism mystery (`DEB-1`), finite actor limits (`DEB-2`), anti-aging/subjective age (`DEB-3`), spinal implant/invulnerability boundary (`DEB-4`), intervention/accountability pressure (`DEB-5`), and ordinary-life/institutional/evidence residue (`DEB-6`). Final coverage state was `resolved` and `completionBlocked=false`; `FAC-2` and `FAC-3` remained proposed.

**What the methodology requires:** Creation may record coverage dispositions, seed links, and governed debt, but Admission owns canon standing and severity.

**The snag:** None. The app let the steward resolve coverage without silently admitting facts.

**Fix direction:** N/A.

**Touches:** Coverage row dispositions, seed links, canon debt creation, canon status separation.

**Repro:** From unresolved coverage rows, enter parked seed IDs `5` and `6` for the first two rows, defer the remaining rows with rationale, and read `/api/flows/creation/coverage`.

**Design verdict:** Validation of the coverage ledger and truth/status separation.

**Recommendation:** Keep deferred rows as explicit debt records; do not collapse them into the temporal-access Admission work.

**Evidence:** `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-after-link-row1-fac2.json`, `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-after-link-row2-fac3.json`, `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-after-defer-row8-ordinary-residue.json`, `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-final-resolved.json`, `/tmp/worldloom-field-build/cold-llm/field-build-13-final-coverage.json`.

### V-06 - Workflow map unlocks Admission after coverage resolution

**Where:** Workflow map after final coverage disposition.

**What happened:** After all required coverage rows were covered or deferred, `/api/workflow-map` reported Creation `done`, Admission `active`, and next decision `Work Admission queue`. `/api/admission/queue` contained `FAC-3` and `FAC-2`, both still `proposed`.

**What the methodology requires:** Admission should become the primary next route only after Creation coverage is resolved; proposed facts should remain proposed until admitted.

**The snag:** None. This is the expected handoff frontier.

**Fix direction:** N/A.

**Touches:** Workflow map, Admission queue, Creation-to-Admission handoff.

**Repro:** Resolve all required coverage rows, return to the Workflow map, and read `/api/workflow-map` plus `/api/admission/queue`.

**Design verdict:** Validation of the fixed handoff behavior.

**Recommendation:** Resume the next field build at Admission queue work for `FAC-2` and `FAC-3`; keep `DEB-1` through `DEB-6` as Creation debt, not Admission shortcuts.

**Evidence:** `/tmp/worldloom-field-build/screenshots/field-build-13-07-coverage-resolved-before-map.png`, `/tmp/worldloom-field-build/screenshots/field-build-13-08-workflow-map-after-coverage-resolved.png`, `/tmp/worldloom-field-build/cold-llm/field-build-13-workflow-map-after-coverage-resolved.json`, `/tmp/worldloom-field-build/cold-llm/field-build-13-final-workflow-map.json`, `/tmp/worldloom-field-build/cold-llm/field-build-13-final-admission-queue.json`.

## Regression of prior findings

**Replay gate:** Field Build 12 app commit `8421fc9` -> current commit `8fa2e54`.

| Prior finding | Status in Field Build 13 | Evidence |
|---|---|---|
| Field Build 12 `F-01` - seed-family coverage inventory has no active create/confirm controls | Fixed. Empty-state coverage controls were visible, usable, and persisted eight rows through the active UI. | V-02 |
| Field Build 12 `P-01` - Coverage Proposal prompt is bound to seed decomposition, not coverage | Fixed for packet content and cold behavior. Proposal body and cold output answered the coverage inventory task. | V-03 |
| Field Build 12 `P-02` - Coverage Pressure prompt is bound to seed decomposition, not coverage | Fixed for packet content and cold behavior. Pressure body challenged missing coverage and premature Admission readiness. | V-04 |
| Field Build 11 `P-01` - stale secondary Prompt-out preview after correction/mode switch | Not re-verifiable this run. The correction/mode-switch surface was not re-entered because the run moved from Creation coverage to Admission handoff. | Carry as not-reached, not as fixed. |
| Field Build 11 `F-02` - repeatable duplicate narrowing-note correction contexts | Not re-verifiable this run. The narrowing-note correction surface was not re-entered. Existing duplicate `CCP-2`/`CCP-3` remain prior evidence artifacts. | Carry as not-reached, not as fixed. |

## Decision-point log (evidence)

### Setup and reopen

**Decision:** Continue the existing Jon Urena world from Field Build 12.

**App route used:** Setup world-path textbox and `Open world`.

**Evidence:** `/tmp/worldloom-field-build/screenshots/field-build-13-01-entry-setup.png`, `/tmp/worldloom-field-build/screenshots/field-build-13-02-workflow-map-resume.png`, `/tmp/worldloom-field-build/cold-llm/field-build-13-workflow-map-resume.json`.

**Committed to world:** No new authoring mutation.

### Creation coverage entry

**Decision owed by methodology:** Account for each kernel seed family before Admission handoff.

**App result:** Active step `decomposition:coverage`; API readback showed missing inventory and create/confirm path; visible UI now exposed empty-state row controls.

**Evidence:** `/tmp/worldloom-field-build/screenshots/field-build-13-03-creation-coverage-entry.png`, `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-entry.json`.

**Committed to world:** No mutation at entry.

### Prompt-out Proposal

**Decision owed by methodology:** Get external help drafting candidate coverage rows and disposition questions.

**Route exercised:** Rendered preview/current packet, visible active surface, diagnostic route `/api/prompt-out/steps/actions/generate`, visible hash validation, and cold subagent. Visible copy/export controls were present but not used; the prompt body was captured from the rendered packet and diagnostic response.

**Generated identity:** `flowKey=creation`, `stepKey=creation:decomposition_prompt`, `templateKey=decomposition_pressure`, `recordId=2`, `record=SEE-1`, `mode=proposal`, body hash `54a11646db05bc5423c494b9cd398fb44f96f34f282580cfc4cd433a0dcfb9dd`.

**Cold subagent:** `019f49fc-6b8f-7ce0-8982-17db5bfa1f74`, with `fork_context=false`.

**Cold result:** The response proposed coverage rows and explicitly treated Admission-gate omissions as irrelevant to the Creation coverage decision.

**Evidence:** `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-proposal-identity.json`, `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-proposal-prompt.md`, `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-proposal.md`.

**Committed to world:** No mutation.

### Prompt-out Pressure

**Decision owed by methodology:** Pressure-test missing coverage before row creation.

**Route exercised:** Rendered preview/current packet, visible active surface, diagnostic route `/api/prompt-out/steps/actions/generate`, visible hash validation, and cold subagent. Visible copy/export controls were present but not used.

**Generated identity:** `flowKey=creation`, `stepKey=creation:decomposition_prompt`, `templateKey=decomposition_pressure`, `recordId=2`, `record=SEE-1`, `mode=pressure`, body hash `1772be456de83df89813d8199864f0cb67ec4e6b26f9b2f0aa5aa331904c9039`.

**Cold subagent:** `019f4a08-eac6-77a1-9b8e-4c74626770d0`, with `fork_context=false`.

**Cold result:** The response challenged missing coverage rows and warned against treating `FAC-2`/`FAC-3` as a complete Creation handoff.

**Evidence:** `/tmp/worldloom-field-build/screenshots/field-build-13-04-coverage-pressure-loaded.png`, `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-pressure-identity.json`, `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-pressure-prompt.md`, `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-pressure.md`.

**Committed to world:** No mutation.

### Coverage row bootstrap

**Decision owed by methodology:** Create coverage inventory rows for the broad kernel seed families before Admission handoff.

**Rows created through visible UI:**

| Row | Label | Initial status |
|---|---|---|
| 1 | Known repeated bodily time traveler | unresolved |
| 2 | Non-technological, non-deployable temporal access | unresolved |
| 3 | Protected temporal mechanism mystery | unresolved |
| 4 | Finite actor limits under repeat access | unresolved |
| 5 | Anti-aging compound and subjective age | unresolved |
| 6 | Future spinal implant and invulnerability boundary | unresolved |
| 7 | Intervention pattern and accountability pressure | unresolved |
| 8 | Ordinary-life, institutional, and evidence residue | unresolved |

**App result:** Server readback showed eight required rows, all unresolved, with `completionBlocked=true`.

**Evidence:** `/tmp/worldloom-field-build/screenshots/field-build-13-05-coverage-bootstrap-filled.png`, `/tmp/worldloom-field-build/screenshots/field-build-13-06-coverage-rows-created.png`, `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-after-create.json`.

**Committed to world:** Eight Creation coverage rows.

### Coverage dispositions

**Decision owed by methodology:** Resolve coverage rows by linking parked proposed seed records, deferring as governed debt, or marking out of scope with rationale.

| Row | Disposition | Linked seed / debt |
|---|---|---|
| Known repeated bodily time traveler | covered | `FAC-2` |
| Non-technological, non-deployable temporal access | covered | `FAC-3` |
| Protected temporal mechanism mystery | deferred | `DEB-1` |
| Finite actor limits under repeat access | deferred | `DEB-2` |
| Anti-aging compound and subjective age | deferred | `DEB-3` |
| Future spinal implant and invulnerability boundary | deferred | `DEB-4` |
| Intervention pattern and accountability pressure | deferred | `DEB-5` |
| Ordinary-life, institutional, and evidence residue | deferred | `DEB-6` |

**App result:** Final coverage readback showed `resolved`, no blockers, and `completionBlocked=false`.

**Evidence:** Per-action readbacks under `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-after-*.json`; final readbacks `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-final-resolved.json` and `/tmp/worldloom-field-build/cold-llm/field-build-13-final-coverage.json`.

**Committed to world:** Two coverage links and six canon-debt records.

### Workflow-map handoff

**Decision owed by methodology:** Confirm the app only unlocks Admission after Creation coverage is resolved.

**App result:** Creation became `done`; Admission became `active`; next decision became `Work Admission queue`; Admission queue contained proposed `FAC-3` and `FAC-2`.

**Evidence:** `/tmp/worldloom-field-build/screenshots/field-build-13-08-workflow-map-after-coverage-resolved.png`, `/tmp/worldloom-field-build/cold-llm/field-build-13-workflow-map-after-coverage-resolved.json`, `/tmp/worldloom-field-build/cold-llm/field-build-13-final-workflow-map.json`, `/tmp/worldloom-field-build/cold-llm/field-build-13-final-admission-queue.json`.

**Committed to world:** No additional mutation after coverage resolution.

## Seed-family coverage table

| Kernel seed family | Field Build 13 state | Records | Prompt packet path(s) | Cold output path(s) | Cold subagent id(s) | Deferral / note |
|---|---|---|---|---|---|---|
| Known repeated bodily time traveler | covered | `FAC-2` | `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-proposal-prompt.md`; `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-pressure-prompt.md` | `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-proposal.md`; `/tmp/worldloom-field-build/cold-llm/field-build-13-coverage-pressure.md` | `019f49fc-6b8f-7ce0-8982-17db5bfa1f74`; `019f4a08-eac6-77a1-9b8e-4c74626770d0` | Field Build 11 already decomposed this family as `FAC-2`. |
| Non-technological, non-deployable temporal access | covered | `FAC-3` | same | same | same | Field Build 11 already decomposed this family as `FAC-3`. |
| Protected temporal mechanism mystery | deferred | `DEB-1` | same | same | same | Protected mechanism and historical resistance/incorporation remain governed Creation seed debt. |
| Finite actor limits under repeat access | deferred | `DEB-2` | same | same | same | Finite attention, memory, social trust, and one-place limits need later decomposition. |
| Anti-aging compound and subjective age | deferred | `DEB-3` | same | same | same | Anti-aging chemistry and subjective age remain undecomposed seed families. |
| Future spinal implant and invulnerability boundary | deferred | `DEB-4` | same | same | same | Implant/invulnerability boundary remains undecomposed seed family. |
| Intervention pattern and accountability pressure | deferred | `DEB-5` | same | same | same | Rescue ethics, collateral damage, and accountability need separate decomposition. |
| Ordinary-life, institutional, and evidence residue | deferred | `DEB-6` | same | same | same | Residue, institutions, evidence, folklore, and ordinary life need separate decomposition. |

## For the app (PRD seeds)

No new PRD seed is proposed from Field Build 13. The direct PRD #339 behavior validated in a preserved-world run:

- Empty coverage inventory controls are visible and usable.
- Coverage Proposal and Pressure packets answer the active coverage task.
- Coverage dispositions resolve Creation while preserving proposed canon status.
- Workflow map unlocks Admission only after coverage resolution.

The only residual note is non-blocking: the prompt route still reports `stepKey=creation:decomposition_prompt` and `decisionLabel=Seed decomposition` while the body is coverage-specific. This did not impair the steward or cold-output result in this run, so I am not raising it as a new finding.

## For the methodology

No methodology-source change is proposed. The docs and specs were sufficient to decide the coverage rows and debt posture; this run validates app encoding of that methodology.

## Frontier

**Stop reason:** Stable handoff frontier. Field Build 13 replayed and validated the Field Build 12 fixes, created and resolved coverage inventory through visible active controls, and reached Admission active with no half-filled Creation form.

**Walked to:** Creation coverage resolved; Workflow map next decision is Admission queue.

**Next run resumes at:** `/tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite`, Admission queue for `FAC-2` and `FAC-3`.

**World state:** `FAC-2` and `FAC-3` remain proposed in the Admission queue. Creation coverage rows are resolved. `DEB-1` through `DEB-6` record governed debt for remaining kernel seed families. `CCP-2` and `CCP-3` remain duplicate correction-context evidence artifacts from Field Build 11.

**Open Field Build 13 findings:** None.

**Carried but not re-reached from Field Build 11:** `P-01` stale secondary Prompt-out preview after correction/mode switch; `F-02` duplicate narrowing-note correction contexts.

**Console check:** Final browser console check had 3 info messages, 0 errors, and 0 warnings.

**Final readbacks:** `/tmp/worldloom-field-build/cold-llm/field-build-13-final-workflow-map.json`, `/tmp/worldloom-field-build/cold-llm/field-build-13-final-coverage.json`, `/tmp/worldloom-field-build/cold-llm/field-build-13-final-admission-queue.json`.

## Closeout checks

- Heading check: `rg -n "^(#|##) " reports/field-build-13-jon-urena-chrononaut.md` includes `## Findings`, `## Regression of prior findings`, `## Decision-point log (evidence)`, `## For the app (PRD seeds)`, `## For the methodology`, and `## Frontier`.
- Report metadata: date `2026-07-10`; app commit `8fa2e54`; method version `worldbuilding-system 1.1`; world file `/tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite`; continuation source `reports/field-build-12-jon-urena-chrononaut.md`; evidence root `/tmp/worldloom-field-build/`.
- Browser console final check: 3 total messages, 0 errors, 0 warnings.
- Report path: `reports/field-build-13-jon-urena-chrononaut.md`.

Finding-field audit:

| finding ID | Where | What happened | What the methodology requires | The snag | Fix direction | Touches | Repro | Design verdict | Recommendation |
|---|---|---|---|---|---|---|---|---|---|
| V-01 | present | present | present | present | present | present | present | present | present |
| V-02 | present | present | present | present | present | present | present | present | present |
| V-03 | present | present | present | present | present | present | present | present | present |
| V-04 | present | present | present | present | present | present | present | present | present |
| V-05 | present | present | present | present | present | present | present | present | present |
| V-06 | present | present | present | present | present | present | present | present | present |
