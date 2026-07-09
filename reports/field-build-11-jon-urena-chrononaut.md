# Field Build 11: Jon Urena Chrononaut

Date: 2026-07-09  
App commit under test: `efc9d1f`  
World file: `/tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite`  
Continuation source: `reports/field-build-10-jon-urena-chrononaut.md`

This run continued the Jon Urena world from Field Build 10 instead of starting a new idea. The walked path was Setup -> Workflow map -> Creation seed decomposition for the temporal-access seed family -> Creation correction -> Prompt-out proposal and pressure probes -> Workflow map frontier.

## Findings

### V-01 - Existing world resume preserved local-first setup and map state

- Where: Setup/open world and Workflow map.
- What happened: Reopening `/tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite` brought the steward back to the existing world, with the server-owned world path visible and the map routing to Creation seed decomposition.
- What the methodology requires: The local world file remains the source of truth across field-build sessions; browser storage is not canon.
- The snag: None.
- Fix direction: None.
- Touches: setup/open world, workflow map.
- Repro: Open the existing Jon world file from setup.
- Design verdict: Validation.
- Recommendation: Keep this behavior.
- Evidence: `/tmp/worldloom-field-build/screenshots/field-build-11-01-entry-setup.png`, `/tmp/worldloom-field-build/screenshots/field-build-11-02-workflow-map-resume.png`.

### V-02 - Field Build 10 `R-01` is fixed on the Creation entry surface

- Where: Creation entry, before seed decomposition authoring.
- What happened: The Minimal Viable World checkpoint no longer dominates early Creation. It is compact, labeled not current/not owed, and sits below the active Creation work instead of taking over the page.
- What the methodology requires: Not-yet-earned checkpoints should remain visible without displacing the current method decision.
- The snag: None for the previously reported `R-01`.
- Fix direction: None.
- Touches: Creation entry, Minimal Viable World checkpoint presentation.
- Repro: Open the Jon world and enter Creation before admitting any seed.
- Design verdict: Validation of the prior report's open regression.
- Recommendation: Close out the Field Build 10 `R-01` thread if no separate tracker item remains open.
- Evidence: `/tmp/worldloom-field-build/screenshots/field-build-11-03-creation-seed-decomposition-entry.png`, `/tmp/worldloom-field-build/screenshots/field-build-11-04-creation-resume-after-start.png`.

### V-03 - Proposed-only seed correction preserved provenance and Admission ownership

- Where: Creation seed decomposition and post-park correction.
- What happened: The first parked seed, `FAC-1 Private neurological time travel`, was rejected after the cold proposal probe showed it bundled multiple claims. The app wrote `CCP-1`, then created `FAC-2 Only-known repeat temporal actor` and `FAC-3 Non-reproducible neurological access` at `proposed`. The Admission queue contains the corrected proposed facts, not the rejected original.
- What the methodology requires: Creation may park and correct proposed material, but Admission owns first canon standing, severity, gate results, and admission outcomes.
- The snag: None for this split-correction path.
- Fix direction: None.
- Touches: Creation correction, record provenance, Admission queue.
- Repro: Park a seed, use post-park correction `Split into sibling proposed facts`, then inspect records and Admission queue.
- Design verdict: Validation.
- Recommendation: Keep the proposed-only correction contract and provenance links.
- Evidence: `/tmp/worldloom-field-build/screenshots/field-build-11-08-seed-correction-split-corrected-before-submit.png`, `/tmp/worldloom-field-build/screenshots/field-build-11-09-seed-correction-split-applied.png`, `/tmp/worldloom-field-build/cold-llm/field-build-11-records-after-correction.json`, `/tmp/worldloom-field-build/cold-llm/field-build-11-admission-queue-after-correction.json`.

### V-04 - Seed decomposition Prompt-out packets were useful in both modes

- Where: Creation seed decomposition Prompt-out.
- What happened: Proposal mode helped find that `FAC-1` was too bundled. Pressure mode then judged `FAC-2` ready and flagged `FAC-3` for an Admission narrowing note. Both cold probes stayed advisory and did not assign canon standing.
- What the methodology requires: Prompt-out should sharpen steward judgment without mutating canon or replacing Admission.
- The snag: None in the generated current packets themselves.
- Fix direction: None for packet content.
- Touches: Prompt-out context assembly, Creation seed decomposition.
- Repro: Generate proposal and pressure packets for the seed-decomposition decision point after parking/correcting seed material.
- Design verdict: Validation with separate presentation findings below.
- Recommendation: Keep the step-specific packet contract.
- Evidence: `/tmp/worldloom-field-build/cold-llm/field-build-11-seed-decomposition-proposal-prompt.md`, `/tmp/worldloom-field-build/cold-llm/field-build-11-seed-decomposition-proposal.md`, `/tmp/worldloom-field-build/cold-llm/field-build-11-seed-decomposition-pressure-prompt.md`, `/tmp/worldloom-field-build/cold-llm/field-build-11-seed-decomposition-pressure.md`. Proposal prompt hash: `3e321760210bb6a0a4bfb8cf0f1df890ce8b54d97a81145e878ae36feed37414`. Pressure prompt hash: `b5cf555fca890f5ad82d4d94999eec1d2861e5ddd2d1b4951e54ce3d3958d486`.

### F-01 - Creation can mark seed decomposition done after one seed family

- Where: Workflow map and Creation handoff after parking/correcting one seed family.
- What happened: After decomposing only the temporal-access family, the workflow map marked `Creation` as `done`, marked `Admission` as `active`, and set the next decision to `Work Admission queue`. The Jon kernel still has undecomposed seed families: anti-aging chemistry/subjective age, future spinal implant/invulnerability boundary, obsessive intervention pattern, and ordinary-life/institutional/evidence pressure.
- What the methodology requires: Creation seed decomposition should account for the kernel's foundational facts before the app routes the steward as if Creation is done, unless the steward explicitly records remaining seed debt or intentional deferral.
- The snag: A docs-free steward can be routed into Admission while major kernel seed families are still only implicit in the kernel.
- Fix direction: Add a kernel seed coverage inventory to Creation. Completion should require explicit steward confirmation that every kernel seed family is parked, deferred as debt, or intentionally out of scope for this pass.
- Touches: Creation state machine, workflow-map next-decision logic, seed-decomposition UI.
- Repro: In the Jon world, park and correct only the temporal-access seed family, then inspect `/api/workflow-map`.
- Design verdict: Structural workflow-state gap; PRD-worthy.
- Recommendation: Treat this as a new PRD seed before relying on app-only Creation completion.
- Evidence: `/tmp/worldloom-field-build/cold-llm/field-build-11-workflow-map-after-fac3-note.json`, `/tmp/worldloom-field-build/screenshots/field-build-11-13-workflow-map-after-partial-decomposition.png`.

### P-01 - Correct current pressure packet is shown beside a stale secondary preview

- Where: Creation seed decomposition Prompt-out after a correction split and mode switch.
- What happened: After switching to Pressure mode, the secondary `prompt-packet-preview-text` still showed Proposal mode and `FAC-1` only. Loading the step produced a correct current packet containing Pressure mode plus `FAC-1`, `FAC-2`, and `FAC-3`, but the stale preview remained on screen.
- What the methodology requires: A Prompt-out surface should make the current packet identity unambiguous, especially when the steward is copying or cold-probing exact packet text.
- The snag: The app can show two packet bodies at once, one current and one stale. The current packet is correct, but the stale preview is easy to copy by mistake.
- Fix direction: Replace or clearly retire the preview when the loaded current packet changes. If historical previews are kept, label them as stale/non-current and remove copy affordances.
- Touches: Prompt-out UI state, Creation decision surface.
- Repro: Park `FAC-1`, split it into `FAC-2`/`FAC-3`, switch to Pressure mode, then click `Load Creation Prompt-out Step`.
- Design verdict: Local presentation/state-sync defect.
- Recommendation: Fix alongside any prompt-out packet identity hardening.
- Evidence: `/tmp/worldloom-field-build/screenshots/field-build-11-10-pressure-mode-after-correction-preview.png`, `/tmp/worldloom-field-build/screenshots/field-build-11-11-pressure-load-stale-preview.png`, `/tmp/worldloom-field-build/cold-llm/field-build-11-seed-decomposition-pressure-prompt.md`.

### F-02 - Admission narrowing notes can be duplicated after submit because the card still looks actionable

- Where: Post-park correction, `Carry Admission narrowing note`.
- What happened: The browser submit created `CCP-2`, but the `FAC-3` correction card still looked editable and did not surface the applied note in place. Replaying the same correction payload through `/api/flows/creation/corrections` returned `201` and created duplicate `CCP-3`. The Admission queue still contains only `FAC-2` and `FAC-3`, but `FAC-3` now links to two identical proposed correction contexts.
- What the methodology requires: A steward-authored correction should be visibly recorded once and should not silently duplicate if the steward retries after ambiguous feedback.
- The snag: The UI does not make the applied narrowing note visible on the seed card, and the API accepts repeated identical narrowing-note corrections.
- Fix direction: Show applied narrowing notes on the seed card or correction history, disable/rescope the same correction action after submit, and make repeated identical narrowing-note payloads idempotent or warn before creating another context.
- Touches: Creation correction UI, correction history/read-side trail, `correctParkedSeed` idempotence.
- Repro: On `FAC-3`, submit `Carry Admission narrowing note`; then submit the same payload again through the form or `/api/flows/creation/corrections`.
- Design verdict: Mutation visibility and idempotence defect.
- Recommendation: Include in the same PRD family as Creation correction hardening.
- Evidence: `/tmp/worldloom-field-build/screenshots/field-build-11-12-fac3-narrowing-note-before-submit.png`, `/tmp/worldloom-field-build/cold-llm/field-build-11-fac3-narrowing-note-response.json`, `/tmp/worldloom-field-build/cold-llm/field-build-11-records-after-fac3-note.json`, `/tmp/worldloom-field-build/cold-llm/field-build-11-admission-queue-after-fac3-note.json`.

## Regression of prior findings

- Mandatory blocking regression set: none from Field Build 10.
- Opportunistic prior finding rechecked: Field Build 10 `R-01`, "not-yet-owed Minimal Viable World checkpoint dominates early Creation", is fixed. See `V-02`.
- Related prior prompt finding: Field Build 10 already validated the older kernel section stale-preview case as fixed. This run's `P-01` is distinct: it is a corrected seed-decomposition preview/current-packet conflict after mode switch and load.

## Decision-point log (evidence)

| Decision point | Steward action | Prompt-out proposal | Prompt-out pressure | Cold probe | Evidence |
|---|---|---|---|---|---|
| Setup/open world | Reopened the existing Jon world file. | N/A | N/A | N/A | `field-build-11-01-entry-setup.png`, `field-build-11-02-workflow-map-resume.png` |
| Creation seed decomposition entry | Entered Creation from the workflow map and rechecked Field Build 10 `R-01`. | N/A | N/A | N/A | `field-build-11-03-creation-seed-decomposition-entry.png`, `field-build-11-04-creation-resume-after-start.png` |
| Seed decomposition, first pass | Parked `FAC-1 Private neurological time travel` as proposed with granularity rationale and Admission intent. | Active preview exercised; diagnostic exercised via `/api/prompt-out/steps` and `/api/prompt-out/steps/actions/generate`; prompt path `/tmp/worldloom-field-build/cold-llm/field-build-11-seed-decomposition-proposal-prompt.md`. | Deferred until after correction. | `019f4733-0e19-7a43-a74c-797854fa4db2`; output `/tmp/worldloom-field-build/cold-llm/field-build-11-seed-decomposition-proposal.md`. | `field-build-11-05-seed-private-time-travel-before-park.png`, `field-build-11-06-seed-private-time-travel-parked.png`, `field-build-11-records-after-seed-01.json` |
| Creation correction split | Split `FAC-1` into `FAC-2` and `FAC-3`; `FAC-1` became rejected; `CCP-1` recorded rationale. | Used proposal probe as advisory input; no automatic mutation from cold output. | N/A | N/A | `field-build-11-08-seed-correction-split-corrected-before-submit.png`, `field-build-11-09-seed-correction-split-applied.png`, `field-build-11-records-after-correction.json` |
| Seed decomposition after correction | Loaded current pressure packet after split. | Already exercised. | Active current packet exercised; diagnostic exercised via `/api/prompt-out/steps/actions/generate`; prompt path `/tmp/worldloom-field-build/cold-llm/field-build-11-seed-decomposition-pressure-prompt.md`. Secondary preview stale; see `P-01`. | `019f473a-300f-7232-9330-48f6efb872bc`; output `/tmp/worldloom-field-build/cold-llm/field-build-11-seed-decomposition-pressure.md`. | `field-build-11-10-pressure-mode-after-correction-preview.png`, `field-build-11-11-pressure-load-stale-preview.png` |
| FAC-3 narrowing note | Carried pressure probe caveat into Admission-facing correction context. | N/A | Used pressure probe as advisory input; no Admission mutation. | N/A | `field-build-11-12-fac3-narrowing-note-before-submit.png`, `field-build-11-records-after-fac3-note.json` |
| Workflow map frontier | Reopened/refreshed the world and inspected the map. | N/A | N/A | N/A | `field-build-11-workflow-map-after-fac3-note.json`, `field-build-11-13-workflow-map-after-partial-decomposition.png` |

Prompt-out extraction notes:

- Proposal route: visible copy/export not used; rendered preview was exercised; direct automation extraction attempts hung; diagnostic route produced the saved packet and response. The saved proposal prompt hash matched the active preview hash.
- Pressure route: the current loaded packet was exercised and hash-validated; diagnostic route produced the saved packet and response. The stale secondary preview is tracked as `P-01`.

Console notes:

- Browser console log contained React DevTools informational messages only; no browser console errors or warnings were observed in the captured log.

## For the app (PRD seeds)

1. Seed-decomposition coverage gate

   Add a Creation coverage model that tracks kernel seed families against parked facts, explicit deferrals, or seed debts. Workflow map should not mark Creation `done` or route to Admission as the next decision merely because at least one proposed fact exists.

2. Prompt-out current-packet clarity

   When a current packet is loaded, retire or clearly label any preview packet that no longer matches mode, record set, or prompt identity. The screen should have one obvious packet to copy/cold-probe.

3. Correction-note visibility and idempotence

   After `Carry Admission narrowing note`, show the applied note/correction context on the seed card or correction history, and prevent identical repeated submissions from creating duplicate proposed contexts without an explicit confirmation.

## For the methodology

- The app now carries enough of seed correction and Prompt-out behavior that the docs were mostly used as a yardstick rather than a working surface during the temporal-access seed pass.
- The docs were still needed to recognize that the remaining Jon kernel seed families were not accounted for even though the app marked Creation done. That is the strongest doc-obsolescence gap from this run.
- The field-build process should keep the explicit seed-family coverage table until the app has its own kernel-to-seed inventory.

## Frontier

Stable frontier: Creation seed decomposition is partially advanced, not complete in the methodological sense.

Current world state:

- `KER-1` exists from Field Build 10.
- `SEE-1` exists for seed decomposition.
- `FAC-1 Private neurological time travel` is rejected.
- `FAC-2 Only-known repeat temporal actor` is proposed and in the Admission queue.
- `FAC-3 Non-reproducible neurological access` is proposed and in the Admission queue.
- `CCP-1` records the split correction for `FAC-1`.
- `CCP-2` and `CCP-3` are duplicate narrowing-note contexts for `FAC-3`, created by the repeat-submit ambiguity in `F-02`.
- Workflow map currently says `Creation=done`, `Admission=active`, next decision `Work Admission queue`, queue count `2`.

Next run should resume at `/tmp/worldloom-field-build/worlds/jon-urena-chrononaut.worldloom.sqlite`. The app will offer Admission, but the method frontier should first account for the remaining kernel seed families or deliberately record their deferral/debt:

- anti-aging compound and subjective age;
- future spinal implant and invulnerability boundary;
- obsessive intervention pattern and accountability pressure;
- ordinary-life, institutional, evidence, and historical pressure from Jon's interventions.

## Closeout checks

Heading check target:

- `## Findings`
- `## Regression of prior findings`
- `## Decision-point log (evidence)`
- `## For the app (PRD seeds)`
- `## For the methodology`
- `## Frontier`

Finding-field audit:

| finding ID | Where | What happened | What methodology requires | Snag | Fix direction | Touches | Repro | Design verdict | Recommendation |
|---|---|---|---|---|---|---|---|---|---|
| V-01 | present | present | present | present | present | present | present | present | present |
| V-02 | present | present | present | present | present | present | present | present | present |
| V-03 | present | present | present | present | present | present | present | present | present |
| V-04 | present | present | present | present | present | present | present | present | present |
| F-01 | present | present | present | present | present | present | present | present | present |
| P-01 | present | present | present | present | present | present | present | present | present |
| F-02 | present | present | present | present | present | present | present | present | present |

