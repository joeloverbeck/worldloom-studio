# Field Build 20 — Jon Urena Chrononaut

**Date:** 2026-07-16  
**App commit:** `72325fd`  
**Method version:** worldbuilding-system 1.1  
**Essence (user seed):** Jon Urena is a biologically anomalous, immortal, invulnerable time traveler whose private obsessions keep colliding with history.  
**World:** Jon Urena Chrononaut — a modern-Earth world where one anomalous person's non-deployable temporal access stresses history, evidence, institutions, and ordinary life. **World file:** `/tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite`.  
**Path walked:** Field Build 19 same-world resume → carried regression copies → canonical Temporal migration and revision lifecycle → Proposal/Pressure cold loop through v4 → TIM-1 + DEB-8 → PAS-2 correction close → Workflow map frontier at Constraint Composition.  
**Prior run:** `reports/field-build-19-jon-urena-chrononaut.md`.
**Evidence:** run log at `/tmp/worldloom-field-build/build-log-20-jon-urena-chrononaut.md`; screenshots at `/tmp/worldloom-field-build/screenshots/field-build-20-*.png`; cold artifacts at `/tmp/worldloom-field-build/cold-llm/field-build-20-*`.  
**Prior-art frame:** GitHub issues #109-#113, PRDs #201/#202/#204/#205-#210, and #353/#357/#358/#364/#368/#372/#379/#380/#381-#384/#391 were reachable and CLOSED. V-01/V-02/V-03 confirm the #379-#384 Temporal work; V-04 confirms #391; V-05 confirms the older Creation/Propagation families. F-01 is a new renderer-level recurrence of the duplicate-key failure shape; R-01 extends PRD #372's mechanically correct but illegible source selection.

The blocking Temporal family from Field Build 19 is fixed end to end. The old PAS-1 was migrated into editable staging, an invalid revision remained visibly recoverable, four immutable revisions were retained, the active Proposal/Pressure surface carried the actual coverage to cold readers, and finalization wrote PAS-2 without rewriting PAS-1. CPO-1 is covered; CPO-2 and CPO-3 remain outstanding. Two non-blocking app defects remain: duplicate omission rows generate React key errors, and the source-selected entry field still shows bare record id `6`.

## Findings

### F-01 — Duplicate Temporal omission rows generate React key errors on every packet rerender

- Severity: friction
- Where: Temporal/Timeline Prompt-out preview, Proposal and Pressure.
- What happened: the packet carried `FAC-2 omitted by the bounded second-hop rule...` four times. The UI keys omission rows by their text, so every packet load, download, field edit, and outcome edit emitted six duplicate-key errors. The active packet still rendered and downloaded, but the console accumulated 194 React errors during the canonical walk.
- What the methodology requires: Prompt-out omissions must be explicit and inspectable; repeated omission provenance must not destabilize the review surface.
- The snag: packet assembly duplicates identical omission text and the renderer assumes text uniqueness.
- Design verdict: local polish.
- Recommendation: deduplicate identical omission entries in context assembly or key rendered rows by stable source/relation identity plus position.
- Repro: open canonical world → Temporal flow 3 → load Proposal or Pressure → inspect console; edit any Temporal field to rerender.
- Fix direction: Temporal Prompt-out omission assembly and omission-list rendering in `packages/web/src/main.tsx`.
- Touches: Field Build 17 F-01 failure shape, prompt-out context assembly, W-1.

### R-01 — Source-selected Temporal entry still renders the bare numeric id

- Severity: cosmetic
- Where: Workflow map → CPO-1 → `Follow source-selected pass`.
- What happened: the map names `FAC-3 · Non-reproducible neurological access`, but the destination field displays only `Source or report id = 6`. The run contract becomes readable after start, but the steward cannot verify the selection from the entry control itself.
- What the methodology requires: provenance should be visible at the decision boundary.
- The snag: source identity is mechanically selected but not human-readable.
- Design verdict: local polish.
- Recommendation: render `FAC-3 · Non-reproducible neurological access` beside or inside the selected control while retaining id 6 internally.
- Repro: Workflow map → first `Follow source-selected pass` → inspect the source field before starting.
- Fix direction: Temporal run-entry source-selected presentation.
- Touches: PRD #372 story 6, Field Build 19 R-01.

### V-01 — Temporal Prompt-out is reachable and current on the active surface

- Severity: validation
- Where: Temporal/Timeline Prompt-out decision.
- What happened: explicit Proposal and Pressure controls load current packets with readable tuple/hash identity, a full visible body, current/stale status, enabled Copy/Download, and recovery semantics. The Field Build 19 P-01/F-02 repro does not occur.
- What the methodology requires: both prompt modes must be exercisable at the decision point through a cold handoff.
- The snag: N/A.
- Fix direction: N/A — preserve the in-flow lifecycle.
- Touches: #379/#380/#381-#384, Field Build 19 P-01/F-02.

### V-02 — Temporal packets carry saved coverage and governing context

- Severity: validation
- Where: Temporal Proposal/Pressure packet assembly.
- What happened: packets carried all ten saved lenses, FAC-3, PRP-1, KER-1, doctrine, source manifest, and explicit omissions. The Proposal body was 47,755 bytes; v2/v3/v4 Pressure bodies were 46,807 / 41,737 / 42,782 bytes and changed with the active revision. Cold workers could identify supported claims, omissions, and concrete defects; Field Build 19 P-02's byte-insensitive empty-context packet does not recur.
- What the methodology requires: the cold-LLM test must succeed from the exported artifact alone.
- The snag: N/A.
- Fix direction: N/A — preserve active-revision-sensitive context.
- Touches: #204/#358/#380, Field Build 19 P-02, Field Build 16 P-01.

### V-03 — Temporal staging preserves failed attempts, revision lineage, and append-only finalization

- Severity: validation
- Where: Temporal coverage revision and finalization.
- What happened: PAS-1 migrated to active v1. A deliberately invalid edit produced a visible `Failed save · unsaved material preserved` alert, kept attempted values, and blocked close. `Save Again` created v2; cold pressure then earned v3 and v4. SQLite retains v1-v3 as superseded immutable rows and v4 as the finalized active revision. PAS-1 remained unchanged; finalization wrote PAS-2 and linked it as a correction/supersession.
- What the methodology requires: revisable pre-close material followed by one append-only final report.
- The snag: N/A.
- Fix direction: N/A — preserve failed-state recovery, lineage, and closed-stage triggers.
- Touches: #353/#357/#368/#379/#381-#384, Field Build 19 F-03/F-04.

### V-04 — Conditional-pass deferral is redeemable by reinstatement or direct coverage

- Severity: validation
- Where: Workflow-map Conditional-pass handoff.
- What happened: a copy proved empty refusal, rationale-bearing deferral, empty reinstatement refusal, and successful reinstatement with immutable history. A second pre-close copy proved `outstanding -> deferred -> covered` directly: finalizing Temporal wrote PAS-2 and covered CPO-1 without a fabricated reinstatement, while retaining the deferral rationale in event history. Canonical finalization covered outstanding CPO-1 with PAS-2.
- What the methodology requires: governed deferral must remain recoverable, and completed matching evidence must clear owed work.
- The snag: N/A.
- Fix direction: N/A — preserve both redemption paths.
- Touches: #391, Field Build 19 F-01.

### V-05 — Older Creation and Propagation regressions are fixed

- Severity: validation
- Where: disposable Creation and Propagation world copies.
- What happened: one valid Creation correction produced exactly one CCP-4 after a visible failed attempt; the secondary Creation preview self-marked stale and loaded a current Pressure packet. Propagation rendered distinct consequence controls without React key errors, preserved an answered rationale exactly, and its foundational Proposal packet carried all fourteen atlas domains through a byte-verified cold read.
- What the methodology requires: corrections and prompt-out must remain current, attributable, and complete.
- The snag: N/A.
- Fix direction: N/A.
- Touches: Field Build 11 P-01/F-02, Field Build 16 P-01, Field Build 17 F-01/F-02.

## Regression of prior findings

| Prior finding | This run | Evidence |
| --- | --- | --- |
| FB19 P-01 | fixed | active Proposal/Pressure preview, copy/download, tuple identity |
| FB19 P-02 | fixed | all ten lenses and governing context in revision-sensitive cold artifacts |
| FB19 F-03 | fixed | visible failed save, preserved attempt, save-again recovery |
| FB19 F-04 | fixed | v1→v4 staging lineage, PAS-1 retained, PAS-2 final |
| FB19 F-01 | fixed | reinstatement copy plus direct deferred-to-covered copy |
| FB19 F-02 | fixed with P-01 | analyst work is the in-flow Prompt-out lifecycle |
| FB19 R-01 | reproduced | entry still shows `6` |
| FB17 F-01/F-02 | fixed | copy replay |
| FB16 P-01 | fixed | full-atlas cold proposal |
| FB11 P-01/F-02 | fixed | copy replay |

## Decision-point log (evidence)

### Temporal recovery and cold loop

- Stage / decision point: Temporal/Timeline (`09`) for FAC-3 after PRP-1, migrated flow 3 through finalization.
- Prompt-out coverage: Proposal exercised once and Pressure exercised at v2, v3, and v4 through byte-verified cold artifacts; final v4 verdict non-blocking.
- UX/style verdict: workflow is method-complete and usable; duplicate omission keys are friction and bare numeric source identity is cosmetic.
- Obsolescence verdict: the app now encodes the Temporal revision/prompt/finalization method without relying on docs for mechanics; docs remain the methodology authority and cold-packet yardstick.
- Resumed flow 3 from PAS-1 as migrated open staging; v1 contained the original 7,454 lens characters.
- The inherited four corrections were saved as v2 after a deliberate failed-state probe.
- Proposal cold artifact: `7fad539d...`, 47,755 bytes; output `57e48bf...`, 24,535 bytes.
- v2 Pressure: `693ba407...`, 46,807 bytes; output `2a9ccb17...`, 22,150 bytes; it exposed unsupported onset, residue, ignorance, dismissal, response, and retcon claims.
- v3 Pressure: `cfa738c7...`, 41,737 bytes; output `a1cd4812...`, 15,420 bytes; it narrowed the remaining causal ambiguity.
- v4 Pressure: `1b86e9b2...`, 42,782 bytes; output `9d18ce9a...`, 6,156 bytes; verdict non-blocking.
- Created TIM-1 and DEB-8, previewed finalization, and wrote PAS-2 / record 24. CPO-1 is covered; the map now points to Constraint Composition.
- Screenshots: `field-build-20-08-temporal-migrated-revision.png`, `field-build-20-09-temporal-failed-revision-preserved.png`, `field-build-20-10-temporal-revision-v2.png`, `field-build-20-11-temporal-outcomes-ready.png`, `field-build-20-12-temporal-covered-map.png`.

## For the app (PRD seeds)

### App Seed 1 — Deduplicate Prompt-out omissions or give them stable render identity

- Disposition: new
- Likely spec/component: Prompt-out context omission assembly plus Temporal omission/source-manifest list rendering.
- UX scope: local polish

The repaired packet carries useful explicit omissions, but identical FAC-2 omission text is emitted four times and used as a React key. Deduplicate identical provenance or use a stable identity/position key so packet inspection does not flood the console or risk row reuse.

### App Seed 2 — Show the selected record identity at Temporal entry

- Disposition: extending
- Likely spec/component: Temporal run-entry source controls.
- UX scope: local polish

Keep id 6 internally, but show the same `FAC-3 · Non-reproducible neurological access` identity already available on the map and after run start.

## For the methodology

None. The methodology supplied the needed decision tests. The cold Proposal/Pressure loop corrected the steward's initial overclaims by enforcing the methodology's own separation of admitted facts, proposed historical mechanisms, uncertainty, causal order, and protected mystery. The remaining gaps are app presentation defects.

## Frontier

- **Walked to:** Temporal flow 3 finalized with PAS-2 / record 24; PAS-1 retained; TIM-1 accepted with constraints; DEB-8 open; CPO-1 covered.
- **Next run resumes at:** the same canonical world, Workflow map → `Work Constraint Composition for FAC-3 after PRP-1`.
- **App-reported next:** Constraint Composition, then Institutional / Economic / Suppression.
- **Carried-open findings:** F-01 friction (duplicate omission keys) and R-01 cosmetic (bare numeric source identity). No blocking finding remains from this run.
- **World state:** 24 records. FAC-3 and PRP-1 unchanged. Temporal revision v4 finalized; v1-v3 retained as superseded audit. CPO-2 and CPO-3 remain outstanding. FAC-2 remains in Admission. No fact was admitted by Temporal.

## Closeout run sheet

| Check | Result |
| --- | --- |
| Canonical world reopened after every copy probe | passed |
| Canonical SQLite integrity | `ok` |
| Prompt artifacts and cold outputs retained under `/tmp/worldloom-field-build/cold-llm/` | passed |
| Browser session run-owned | `fb20` |
| Dev server run-owned | `pnpm dev` session |
| Live log | `/tmp/worldloom-field-build/build-log-20-jon-urena-chrononaut.md` |

## Report-metadata audit

| Field | Value |
| --- | --- |
| Report number | 20 |
| Slug | `jon-urena-chrononaut` |
| App commit | `72325fd` |
| Prior report | `reports/field-build-19-jon-urena-chrononaut.md` |
| Canonical world | `/tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite` |
| User-directed targets | none |

## Finding-field audit

| Finding | Severity | Where | Method requirement | Snag | Verdict/recommendation | Repro/fix direction |
| --- | --- | --- | --- | --- | --- | --- |
| F-01 | yes | yes | yes | yes | yes | yes |
| R-01 | yes | yes | yes | yes | yes | yes |
| V-01 | yes | yes | yes | N/A | yes | yes |
| V-02 | yes | yes | yes | N/A | yes | yes |
| V-03 | yes | yes | yes | N/A | yes | yes |
| V-04 | yes | yes | yes | N/A | yes | yes |
| V-05 | yes | yes | yes | N/A | yes | yes |

## Worktree delta audit

| Path | Baseline | Closeout | Ownership |
| --- | --- | --- | --- |
| `reports/field-build-20-jon-urena-chrononaut.md` | absent | added | this run |
| all other repo paths | clean | unchanged | preserved |
