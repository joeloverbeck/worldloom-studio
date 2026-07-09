# Field Build 11 PRD-Ready Determination: Creation Seed-Family Coverage Gate

Source artifact: `reports/field-build-11-jon-urena-chrononaut.md`

Selected source sections: `Findings` entries `F-01`, `P-01`, and `F-02`, with validation findings `V-01` through `V-04`, the prior-finding regression notes, and `For the app (PRD seeds)` used as supporting evidence.

Source durability status: untracked local report. The report is present in this checkout but is not known to git and is not publication-ref visible. Later PRD publication should summarize this report's conclusions rather than cite it as a stable published source unless it has been committed and publication-ref checked first. The screenshots, SQLite world file, prompt packets, readbacks, and cold-LLM outputs under `/tmp/worldloom-field-build/` are temp-only evidence and must be summarized, not cited by local path, in a published PRD.

Authored artifact status: new untracked PRD-ready determination artifact. This file is a local prep artifact until tracked, committed, and publication-ref visible.

Live checkout snapshot: branch `main`, HEAD `efc9d1f`. Pre-write worktree dirt was `.claude/skills/code-review/SKILL.md`, `.claude/skills/field-build/SKILL.md`, `.claude/skills/implement/SKILL.md`, `.claude/skills/implement/references/closeout-templates.md`, `.claude/skills/implement/references/implementation-evidence.md`, `.claude/skills/implement/references/review-evidence.md`, `.claude/skills/implement/references/tracker-closeout-gates.md`, and `.claude/skills/tdd/SKILL.md` modified, plus untracked `reports/field-build-11-jon-urena-chrononaut.md`. Those were treated as pre-existing artifacts for this prep.

Tracker freshness: current open issue readback returned no open issues on 2026-07-09. Targeted overlap searches for seed-family coverage, kernel seed inventory, narrowing-note duplication, idempotence, stale secondary preview, and prompt packet preview currentness found no open duplicate. Relevant closed tracker work inspected: PRD #222/#223 for the earlier kernel-to-first-seed coverage-honesty repair, PRD #302/#303-#307 for Creation post-park correction and prompt mode parity, PRD #308/#309-#312 for the pre-Admission handoff/no-seeds workflow-map repair, PRD #313/#314-#316 for Creation Prompt-out preview currentness, and PRD #317/#318-#320 for the Minimal Viable World foregrounding repair.

Deliverable status: PRD-ready determination only. No code, tracker, methodology, principle, ADR, spec, or domain glossary mutation happened in this prep.

External research: skipped. The task is repo/report determination and all governing facts are local repo authorities plus GitHub tracker state.

Decision: RATIFIED artifact home and selected first scope -> write `reports/field-build-11-jon-urena-chrononaut-prd-prep.md` with Creation seed-family coverage gating as the selected first PRD; rationale: the user approved the recommended artifact home after the report, authorities, implementation surface, and tracker overlap were inspected.

## Reassessment Verdict

Field Build 11 validates several important surfaces. Existing-world resume works, the Field Build 10 Minimal Viable World foregrounding issue is fixed on the Creation entry surface, proposed-only seed correction preserves provenance and Admission ownership, and the current seed-decomposition Prompt-out packets are useful in both proposal and pressure modes.

The remaining codebase-wide product work is structural: Creation can mark seed decomposition complete and route the steward to Admission after only one kernel seed family is parked or corrected. In the Jon Urena world, the temporal-access family was decomposed, but anti-aging chemistry, future implant/invulnerability boundaries, obsessive intervention/accountability pressure, and ordinary-life/institutional/evidence pressure remained only implicit in the kernel. The app had no steward-visible coverage inventory that required those families to be parked, deferred as debt, or intentionally scoped out before Creation became `done`.

Recommended first PRD: Creation seed-family coverage gate. Creation needs a server-owned coverage model and browser decision surface that lets the steward account for kernel seed families before the workflow map treats Creation as complete or routes Admission as the primary next decision.

Follow-on candidates:

- `P-01` Prompt-out current-packet clarity after correction/mode switch. The current loaded packet is correct, but a stale secondary preview can remain visible.
- `F-02` Creation correction-note visibility and idempotence. Admission narrowing notes are recorded but not surfaced on the card, and repeated identical submissions can create duplicate correction contexts.

Coverage-only items:

- `V-01` through `V-04` require no new product scope.
- Field Build 10 `R-01` is fixed by the closed MVW foregrounding work and should not be reopened from this report.

Supporting skill result: Domain model unchanged - this prep uses existing app and methodology language. `kernel seed family` and `seed-family coverage inventory` are PRD-scope product terms until ratified by the future PRD; no `CONTEXT.md` or glossary edit is owed by this prep.

## Evidence Checked

| Finding or candidate | Status | PRD impact |
|---|---|---|
| `V-01` existing-world resume | Validated | No product scope. Local-first world reopening and workflow-map resume held. |
| `V-02` Field Build 10 `R-01` MVW foregrounding | Fixed validation | No product scope. Closed PRD #317 behavior held on Creation entry. |
| `V-03` proposed-only split correction | Validated | No product scope for split correction. Provenance and Admission ownership held. |
| `V-04` seed-decomposition Prompt-out packets | Validated with separate presentation finding | No packet-content PRD. Proposal and pressure packets were useful and advisory. |
| `F-01` Creation can mark seed decomposition done after one seed family | Fresh product scope | Selected first PRD. Structural state and guidance gap across Creation, workflow map, server persistence, browser surface, and Prompt-out context. |
| `P-01` stale secondary preview beside correct current pressure packet | Fresh follow-on | Defer. Local Prompt-out presentation/currentness hardening, not part of first seed-coverage PRD unless explicitly bundled later. |
| `F-02` duplicate Admission narrowing notes and unclear applied state | Fresh follow-on | Defer. Correction visibility and idempotence hardening, likely same family as Creation correction reliability. |

Live source checks:

- `packages/server/src/workflow-map.ts` treats a world with any Admission queue item as ready to foreground Admission and can mark Creation `done`. It has a no-kernel/no-seeds and kernel/no-seeds guard, but no partial seed-family coverage state once at least one proposed seed exists.
- `packages/server/src/creation-flow.ts` completes seed decomposition after a non-empty seed parking request. It writes a `seed_decomposition` report and proposed seed records, then marks the Creation flow step complete without recording kernel seed-family coverage, deferral, or debt.
- `packages/server/src/creation-flow.ts` also creates a new correction context for every valid `admission_narrowing_note` payload before linking it to the seed. Because the context is new each time, identical retries can create duplicate proposed correction contexts.
- `packages/server/src/creation-handoff.ts` builds Creation handoff state from reports and seed records, but does not expose a kernel seed-family inventory, remaining-coverage blocker, applied narrowing notes, or a correction-history summary that would make `F-02` visibly resolved after submit.
- `packages/web/src/main.tsx` renders the Creation correction card as still actionable after an Admission narrowing note submit and does not surface the applied note on the seed card. It also keeps a secondary prompt preview surface that can diverge from the loaded current packet body after correction and mode switch.
- Existing tests cover the earlier kernel/no-seeds workflow-map state, Creation correction paths, selected-section Prompt-out currentness, and seed-decomposition packet binding. They do not cover partial kernel seed-family coverage after one seed family exists, duplicate narrowing-note retries, or the stale secondary preview after correction/mode switch.

Tracker overlap:

- No matching open issues existed at refresh time.
- PRD #222/#223 fixed the earlier kernel-to-first-seed handoff: consequence mode, truth layer, selected-section packet grain, inline recovery, and coverage honesty for the first parked seed. It does not own a continuing inventory of remaining kernel seed families after the first seed family is parked.
- PRD #302/#303-#307 added governed post-park correction, including narrowing-note behavior and prompt mode parity. It does not establish duplicate-note idempotence or applied-note visibility after submit.
- PRD #308/#309-#312 fixed the kernel-complete/no-seed workflow-map state: Creation stays active and Admission is unavailable when no proposed seeds exist. It does not cover the partial-decomposition state where some proposed seeds exist but the kernel still has undecomposed seed families.
- PRD #313/#314-#316 fixed selected-section/mode preview currentness for an earlier Prompt-out path. It does not cover the secondary preview/current-packet conflict after a seed correction split and pressure-mode load.
- PRD #317/#318-#320 fixed the not-yet-earned MVW checkpoint foregrounding problem from Field Build 10. Field Build 11 validates that fix and does not reopen it.

## Authority Findings

No upstream methodology, principle, ADR, or domain glossary change is owed before the next PRD.

Existing authorities require the selected first PRD:

- `docs/worldbuilding-system/05_creation_protocol.md` says Creation starts from a world kernel and then decomposes broad seed facts until they are independently rejectable before downstream Admission work becomes the next method step.
- `docs/specs/creation-flow.md` says a saved kernel alone does not complete Creation phases 1-2, and that seed decomposition splits steward material into parked seed records. It currently says completing decomposition marks the flow complete, but does not define what completion means when only one seed family has been accounted for.
- `docs/specs/workflow-map-and-navigation.md` defines the early-world grammar for no kernel, kernel in progress, kernel saved/no seeds, seed parked/under review, and post-correction proposed material. It lacks a partial-decomposition state where some proposed seeds exist and other kernel seed families remain unaccounted for.
- `docs/specs/prompt-out-context-assembly.md` governs current packet identity and stale loaded status. It should be cited by the follow-on preview-currentness PRD, and the selected first PRD may need to add seed-family coverage inventory to the seed-decomposition packet context.
- `docs/principles/guided-workflow-usability.md` W-8/W-9/W-10 require the app to carry the current method decision and workflow-map orientation, not depend on the steward keeping the docs open to know that Creation is only partially complete.
- `docs/principles/workflow-principles.md` W-1/W-3/W-7 support Prompt-out as advisory, Creation as proposed material only, and guided flow progress based on substance rather than accidental record existence.
- ADR 0006 keeps Admission as the canon-entry boundary. The first PRD must not make Creation admit facts; it only makes Creation account for seed-family coverage before handing off.
- ADR 0007 keeps Prompt-out mechanics in the shared Prompt-out step. If the first PRD adds coverage inventory to Prompt-out packets, it should do so through the existing packet assembly seam.
- ADR 0008 keeps flow-specific persistence with the flow module and the WorldFile as substrate. A coverage inventory is Creation flow state, not a generic browser-only checklist.
- ADR 0009 says browser workflow state is a first-class guided decision surface over server-owned flow policy. The browser should render a server-owned coverage payload rather than infer remaining kernel seed families on its own.

Spec changes are part of the future PRD. `docs/specs/creation-flow.md` should define seed-family coverage inventory, allowed dispositions, completion rules, browser decision-surface obligations, and Prompt-out context expectations. `docs/specs/workflow-map-and-navigation.md` should add a partial-decomposition state and next-decision rule. `docs/specs/browser-visible-guidance-acceptance.md` should be mapped for the future browser evidence. `docs/methodology-coverage.md` should be updated only after implementation evidence changes the maturity claim.

## Recommended First PRD

### Creation Seed-Family Coverage Gate Before Admission Handoff

Purpose: make Creation completion honest after seed decomposition begins. A steward should not be routed as if Creation is done merely because one proposed seed family exists; remaining kernel seed families must be parked, deferred as seed debt, or declared out of scope for the current pass.

Sources:

- Field Build 11 `F-01`, summarized from `reports/field-build-11-jon-urena-chrononaut.md`.
- Field Build 10 report and prep as prior context for the same Jon world.
- Closed PRDs #222, #302, #308, #313, and #317 as adjacent prior art.
- `docs/worldbuilding-system/05_creation_protocol.md`.
- `docs/specs/creation-flow.md`.
- `docs/specs/workflow-map-and-navigation.md`.
- `docs/specs/prompt-out-context-assembly.md`.
- `docs/specs/browser-visible-guidance-acceptance.md`.
- `docs/methodology-coverage.md`.
- `docs/principles/guided-workflow-usability.md`, `workflow-principles.md`, `canon-sovereignty.md`, `data-principles.md`, and `domain-fidelity.md`.
- ADR 0006, ADR 0007, ADR 0008, and ADR 0009.

Problem:

The current app has a binary practical threshold for Creation seed decomposition: once at least one proposed seed exists, the workflow-map logic can mark Creation `done` and route the steward to Admission. That is enough for the kernel/no-seeds case fixed by PRD #308, but not enough for a real kernel that contains multiple seed families. The Jon Urena field build decomposed temporal access while leaving several other foundational families implicit. The app had no inventory, no blocker, no debt/deferral control, and no out-of-scope declaration that would let the steward or workflow map distinguish "seed decomposition complete" from "one family parked."

Recommended product rule:

Creation owns a server-persisted seed-family coverage inventory for the current world kernel. Each coverage row represents a steward-recognized cluster of kernel material that must be accounted for before Creation can be complete. A row is complete only when it is linked to parked proposed seed records, explicitly deferred as seed debt with rationale, or marked intentionally out of scope for this pass with rationale. The workflow map must not mark Creation `done` or make Admission the primary next decision while any required coverage row is unresolved.

The app should not infer all seed families automatically from prose. The steward remains responsible for naming or confirming the inventory. The app provides the structure, completion gate, visibility, and Prompt-out context so the docs no longer have to carry the coverage table outside the product.

Scope:

- Harden `docs/specs/creation-flow.md` with a seed-family coverage inventory contract, row dispositions, completion rule, and browser decision-surface expectations.
- Harden `docs/specs/workflow-map-and-navigation.md` with the partial-decomposition state: some proposed seeds exist, but Creation remains active/owed because seed-family coverage is unresolved.
- Add Creation-owned persistence for the coverage inventory and row dispositions. The exact representation is a future implementation choice, but it should live behind the Creation flow/server policy boundary rather than in browser-only state.
- Change seed decomposition completion so parking one or more seed records does not automatically complete Creation unless the coverage inventory is complete.
- Change workflow-map next-decision logic so unresolved coverage keeps Creation active/owed ahead of Admission as the primary next decision. Admission queue visibility may remain, but the primary method frontier stays Creation until coverage is resolved or deliberately deferred.
- Add browser Creation controls to create, review, and resolve coverage rows; link rows to parked proposed seeds; record deferral/debt or out-of-scope rationale; and show why Creation is or is not complete.
- Add Prompt-out context for coverage inventory in seed-decomposition proposal and pressure packets, so external advisory pressure can see which kernel seed families are parked, unresolved, deferred, or scoped out.
- Preserve Admission sovereignty. Creation may park proposed facts and record coverage/debt/out-of-scope decisions, but it does not admit facts or assign first canon standing.
- Add closeout evidence that updates `docs/methodology-coverage.md` only when the implementation proves the app now carries this part of the method.

Acceptance:

- A world with a kernel and no coverage inventory rows cannot silently become Creation `done`; the Creation surface guides the steward to create or confirm the inventory.
- A world with one parked proposed seed family and unresolved coverage rows keeps Creation active/owed. The workflow map does not route Admission as the primary next decision until coverage is resolved or deliberately deferred/out-scoped.
- Each coverage row has a steward-visible label or summary, source kernel reference or rationale, and one of the accepted dispositions: parked/covered by proposed seed records, deferred as seed debt, or intentionally out of scope for this pass.
- Parked coverage links identify the proposed seed records and any relevant seed-decomposition report without changing their canon status.
- Deferred and out-of-scope dispositions require steward rationale and remain visible in the Creation handoff/frontier state.
- The browser shows current, next, and resume state for unresolved coverage without relying on methodology docs beside the app.
- Seed-decomposition Prompt-out proposal and pressure packets carry the coverage inventory and omission reasons for any coverage context not included.
- Admission queue count may be visible when proposed seeds exist, but it does not make the method frontier look complete while coverage is unresolved.
- Existing PRD #308 behavior remains true: a kernel-complete/no-seed world stays in Creation seed decomposition and Admission is not earned.
- Existing PRD #317 behavior remains true: not-yet-earned MVW checkpoint stays compact and does not dominate early Creation.
- Existing proposed-only correction behavior from PRD #302 remains true: Creation corrections preserve provenance and route proposed material to Admission without admitting it.
- Browser evidence includes a field-build-grade replay on the Jon Urena scenario or an equivalent fixture with multiple kernel seed families, proving one parked family does not complete Creation until remaining rows are resolved.

Likely issue slices:

1. Creation and workflow-map specs for partial seed-family coverage state.
2. Server Creation coverage inventory model, persistence, and seed-decomposition completion rule.
3. Workflow-map next-decision logic for unresolved coverage ahead of Admission handoff.
4. Browser Creation coverage inventory surface and handoff/frontier readback.
5. Prompt-out packet context for seed-family coverage proposal and pressure modes.
6. Field-build-grade replay, coverage-ledger closeout, and regression proof for PRD #308/#317.

Out of scope:

- Automatic NLP extraction of seed families from kernel prose.
- Admission gate, severity, first canon standing, or accepted-fact behavior.
- Changing canon status semantics for proposed seeds.
- Correction-note idempotence and applied-note visibility from `F-02`, unless the user explicitly bundles the follow-on.
- Stale secondary Prompt-out preview cleanup from `P-01`, unless the user explicitly bundles the follow-on.
- Minimal Viable World checkpoint behavior beyond regression proof that PRD #317 remains fixed.
- Direct LLM integration or automatic advisory parsing.
- Upstream methodology edits to `docs/worldbuilding-system/05_creation_protocol.md`.
- A new ADR unless implementation discovers a contradiction with ADR 0006, 0007, 0008, or 0009.

## Follow-On Candidates

### Prompt-Out Current-Packet Clarity After Correction And Mode Switch

Purpose: make the copyable/current packet unambiguous when Creation seed decomposition changes after correction.

Sources: Field Build 11 `P-01`, PRD #313/#314-#316, `docs/specs/prompt-out-context-assembly.md`, ADR 0007, and the Prompt-out lifecycle tests.

Problem: after a seed correction split and switch to pressure mode, the loaded current packet was correct, but the secondary `prompt-packet-preview-text` still showed the earlier proposal packet for `FAC-1` only. A steward could copy the stale preview by mistake.

Recommended rule or open design point: when a current packet is loaded or becomes stale, the screen should expose one obvious current packet body. Any historical or stale preview must be clearly labeled non-current and must not have copy/export affordance that can be mistaken for the current packet.

Scope:

- Creation Prompt-out preview/current-body state sync.
- Stale labeling or retirement for secondary previews.
- Tests covering seed correction split, mode switch, load current packet, and stale preview retirement.

Acceptance:

- The current packet body and any preview cannot disagree without an explicit stale/non-current label.
- Copy/export affordances target only the current packet unless the user deliberately opens historical packet details.
- Existing selected-section and mode currentness behavior from PRD #313 remains fixed.

### Creation Correction-Note Visibility And Idempotence

Purpose: make Admission narrowing notes visibly recorded once and safe to retry.

Sources: Field Build 11 `F-02`, PRD #302/#303-#307, ADR 0006, and Creation correction tests.

Problem: after `Carry Admission narrowing note`, the correction card still looked actionable, the applied note was not surfaced on the seed card, and an identical retry through `/api/flows/creation/corrections` returned `201` with a duplicate correction context.

Recommended rule or open design point: repeated identical narrowing-note payloads should be idempotent or explicitly require confirmation before a new context is created. The browser should surface the applied note or correction history on the affected seed and should not present the same action as if nothing happened.

Scope:

- Server duplicate detection or idempotent response for same seed/action/rationale/note payload.
- Browser applied-note readback on seed card or correction history.
- Correction action state after successful submit.
- Read-side trail and Admission queue provenance confirmation.

Acceptance:

- Submitting the same narrowing note twice does not silently create duplicate proposed correction contexts.
- The affected seed visibly shows the applied note or correction history after submit.
- The Admission queue still contains the corrected proposed seed, not a duplicate seed, and Admission remains the first canon-standing gate.

## Coverage Follow-Up

After the first PRD lands, resume the Jon Urena field build or a synthetic equivalent at partial Creation seed decomposition. The replay should prove that the app itself carries the seed-family coverage table that the field-build process had to keep manually:

- temporal-access family parked/corrected;
- anti-aging chemistry/subjective-age family unresolved or deliberately disposed;
- future implant/invulnerability-boundary family unresolved or deliberately disposed;
- obsessive intervention/accountability-pressure family unresolved or deliberately disposed;
- ordinary-life/institutional/evidence-pressure family unresolved or deliberately disposed.

If that replay still requires methodology docs to know which kernel seed families remain unaccounted for, the PRD should not be closed as replacement-grade.

## Rejected Or No-Op Alternatives

- Treat Field Build 11 as fully covered by PRD #308. Rejected because #308 fixed the no-proposed-seeds state. Field Build 11 is the next state: some proposed seeds exist, but kernel coverage is incomplete.
- Treat `F-01` as a pure docs issue. Rejected because the report demonstrates an app routing and completion-state gap. The docs already make the method frontier visible; the app fails to encode it.
- Automatically infer all seed families from kernel prose. Rejected as too strong for the current local-first app and contrary to steward-authored governance. The app should structure and gate steward-confirmed coverage rather than silently classify prose.
- Bundle `F-01`, `P-01`, and `F-02` into one broad Creation hardening PRD. Rejected for the first pass because the findings touch independent seams: workflow-state coverage, Prompt-out preview/currentness, and correction idempotence/readback.
- Reopen PRD #302. Rejected because #302 delivered governed correction actions. The new issue is duplicate retry behavior and applied-note visibility after that path exists.
- Reopen PRD #313. Rejected because #313 fixed an earlier selected-section/mode preview-currentness path. Field Build 11 found a distinct corrected seed-decomposition preview conflict.
- Reopen PRD #317. Rejected because Field Build 11 validates its MVW foregrounding fix.
- Change Admission to handle remaining kernel seed families. Rejected because Creation owns seed decomposition and Admission owns first canon standing for proposed facts, not discovery of undisposed kernel families.
- Add an upstream methodology amendment before product work. Rejected because the methodology already supplies the rule; the product gap is that the app cannot carry it without the docs.
- Skip a written prep artifact. Rejected by user approval; this file is the agreed PRD-ready determination home.

## PRD Publication Inputs

Suggested title:

`PRD: Creation seed-family coverage gate - explicit kernel coverage before Admission handoff`

Publication package: one first PRD plus two deferred follow-ons. Do not publish `P-01` or `F-02` as part of the first PRD unless the user explicitly asks for a multi-PRD program or bundled scope.

Recommended testing seam: server Creation flow and workflow-map behavior through the existing HTTP/API seam against real temp-file world databases, plus React/browser-surface tests for the Creation decision surface and Prompt-out packet context tests if coverage inventory enters packets. The later `/to-prd` pass still owes its seam checkpoint. Recommended seam wording: reuse existing Creation, workflow-map, Prompt-out, and browser decision-surface seams; add direct store/persistence tests only if the implementation introduces a new persistent representation that cannot be verified through the HTTP/API seam.

`/to-prd` usage: consulted for house style only during this prep. It was not invoked, and no issue was published.

Likely label: `ready-for-agent` after `/to-prd` seam confirmation, if the PRD body maps the browser-visible guidance checklist and leaves no open design decision about coverage dispositions. Downgrade to `needs-triage` if the PRD requires a new ADR, automatic seed-family inference, a disputed persistence model, or a bundled multi-finding program.

Principles, ADRs, specs, and prior PRDs to cite:

- `docs/worldbuilding-system/05_creation_protocol.md`
- `docs/specs/creation-flow.md`
- `docs/specs/workflow-map-and-navigation.md`
- `docs/specs/prompt-out-context-assembly.md`
- `docs/specs/browser-visible-guidance-acceptance.md`
- `docs/methodology-coverage.md`
- `docs/principles/README.md`
- `docs/principles/guided-workflow-usability.md`
- `docs/principles/workflow-principles.md`
- `docs/principles/canon-sovereignty.md`
- `docs/principles/data-principles.md`
- `docs/principles/domain-fidelity.md`
- ADR 0006
- ADR 0007
- ADR 0008
- ADR 0009
- PRD #222/#223
- PRD #302/#303-#307
- PRD #308/#309-#312
- PRD #313/#314-#316 as closed adjacent Prompt-out currentness context
- PRD #317/#318-#320 as closed MVW foregrounding context

Browser-visible guidance checklist mapping requirements:

| Checklist item | Future PRD home |
|---|---|
| package source cited | Preamble and Principles should cite Creation protocol, Creation flow spec, workflow-map spec, Prompt-out context spec, browser-visible guidance, and ADRs 0006-0009. |
| decision-point contract named | Problem/Solution/Implementation should name Creation seed decomposition coverage as the current decision point after the kernel exists. |
| required, optional, skippable, and severity-dependent fields visible where relevant | In scope for coverage rows, dispositions, rationale, linked seed records, and unresolved blockers. Severity is N/A; deferral/debt/out-of-scope rationale is required when chosen. |
| doctrine at the actual decision point | In scope. The app should explain why unresolved kernel seed families keep Creation active before Admission handoff. |
| prompt packet preview, source manifest, and cold external LLM test | In scope if coverage inventory is added to seed-decomposition Prompt-out packets. Cold-LLM pressure should see unresolved and disposed rows. |
| advisory/canon separation visible | In scope. Coverage and Prompt-out remain advisory/proposed; Admission remains the canon gate. |
| skip path and reason storage | In scope only as coverage dispositions: deferred seed debt and out-of-scope rationale. Do not add generic skip machinery unless needed. |
| blockers/substance validation | In scope. Unresolved coverage rows block Creation completion and should name the remediation path. |
| current, next, and resume state | In scope. Creation remains active/owed while coverage is unresolved, even if Admission queue has proposed seeds. |
| read-side audit or provenance link | In scope for coverage row links to seed records, decomposition reports, and deferral/debt records if created. |
| cognitive walkthrough | In scope. Use Jon Urena's partial-decomposition path or equivalent multi-family fixture. |

Canonical gates:

- `pnpm test`
- `pnpm typecheck`
- `pnpm build`

Focused likely gates:

- server Creation flow tests for coverage inventory, row disposition, and decomposition completion;
- server workflow-map tests for partial-decomposition state and Admission priority;
- server Prompt-out tests if coverage inventory enters packet context;
- web Creation decision-surface tests for coverage inventory controls, unresolved blockers, row dispositions, and resume state;
- web workflow shell tests preserving PRD #308 and #317 behavior;
- active browser replay for a multi-seed-family Creation route.

Browser/cold-LLM evidence expectations:

- Active browser replay from the Jon Urena world or equivalent fixture with one seed family parked and at least two unresolved kernel seed families.
- Workflow map readback showing Creation active/owed before Admission handoff while coverage is unresolved.
- Browser proof that the steward can mark remaining rows as parked, deferred as debt, or out of scope with rationale, then see Creation complete only after all rows are disposed.
- Owed-state regression proof that Admission remains reachable after coverage completion and proposed seeds are still in the Admission queue.
- Prompt-out packet proof, including cold external LLM pressure, if packet context changes.
- Console check with zero errors/warnings or explicit triage.

Source durability warnings and temporary-path handling:

- `reports/field-build-11-jon-urena-chrononaut.md` is untracked in this checkout at prep time. A published PRD should say the Field Build 11 source report is a local untracked source summarized for the PRD unless it is committed and publication-ref visible before publication.
- `reports/field-build-10-jon-urena-chrononaut.md` and `reports/field-build-10-jon-urena-chrononaut-prd-prep.md` are prior local evidence; publication should verify their tracked/published state before citing them as durable.
- Do not cite `/tmp/worldloom-field-build/...` paths in the published PRD. Summarize the evidence and, if durable evidence is needed, archive or track a cleaned evidence report first.

## Completion Self-Check

- `/to-prd` consulted for house style only.
- Source artifact posture recorded as untracked local report.
- Authored artifact posture recorded as new untracked prep artifact.
- Tracker freshness recorded with no open issues and relevant closed issue IDs.
- Selected first PRD recorded: Creation seed-family coverage gate before Admission handoff.
- Follow-on candidates recorded: Prompt-out current-packet clarity and Creation correction-note visibility/idempotence.
- Recommended testing seam recorded, with `/to-prd` seam checkpoint still owed.
- Likely publication label and downgrade conditions recorded.
- Canonical gates and focused gates recorded.
- Source and authored-artifact durability warnings recorded.

## Freshness And Boundaries

Refreshed in this session:

- `reports/field-build-11-jon-urena-chrononaut.md`.
- `reports/field-build-10-jon-urena-chrononaut-prd-prep.md` for prior-art style.
- Relevant domain, tracker, principle, spec, methodology, and ADR authorities.
- Relevant server and browser implementation surfaces.
- Current branch, HEAD, and worktree dirt.
- Current open tracker readback plus focused all-state overlap searches and closed adjacent PRDs.

Not done:

- No code implementation.
- No spec, methodology, principle, ADR, or domain glossary edit.
- No issue creation, issue comment, label change, or tracker publication.
- No app run, browser replay, or product test run; this was a determination/prep artifact, not an implementation closeout.

Pre-existing worktree dirt was left untouched. This prep intentionally added only `reports/field-build-11-jon-urena-chrononaut-prd-prep.md`.
