# Field Build 09 PRD-Ready Determination: Creation Prompt-out Currentness

Source artifact: `reports/field-build-09-the-bloom.md`

Selected source sections: `Findings` entries `P-01` and `R-01`, plus the prior-art regression gate and evidence index.

Source durability status: untracked local report. The report is present in this checkout but is not known to git and is not visible on `origin/main`. Later PRD publication should summarize this report's conclusions rather than cite it as a stable published source unless it has been committed and publication-ref checked first. The `/tmp/worldloom-field-build/` screenshots, SQLite world, prompt packets, and cold-LLM files are temp-only evidence and must be summarized, not cited by local path, in a published PRD.

Authored artifact status: new untracked PRD-ready determination artifact. This file is a local prep artifact until tracked, committed, and publication-ref visible.

Live checkout snapshot: branch `main`, HEAD `819fc3d`. Pre-write worktree dirt was `.claude/skills/field-build/SKILL.md` modified and `reports/field-build-09-the-bloom.md` untracked; those were treated as pre-existing artifacts for this prep.

Tracker freshness: current open issue list was empty on 2026-07-09. Relevant closed tracker work inspected: PRD #297 and children #298-#301 for active Prompt-out packet ownership; PRD #308 and children #309-#312 for workflow-map pre-Admission handoff; PRD #269 for Creation selected-heading Proposal active-route replay; PRD #312 for Field Build 08 replay closeout.

Deliverable status: PRD-ready determination only. No code, tracker, methodology, principle, ADR, or domain glossary mutation happened in this prep.

External research: skipped. The task is repo/report determination and all governing facts are local repo authorities plus GitHub tracker state.

Decision: RATIFIED artifact home and selected first scope -> write `reports/field-build-09-the-bloom-prd-prep.md` with `P-01` as the selected first PRD and `R-01` as a follow-on; rationale: the user approved the recommended artifact home and scope after the report, authorities, implementation surface, and tracker overlap were inspected.

## Reassessment Verdict

Field Build 09 validates that the prior Field Build 08 blockers are fixed: late Admission blocks Creation mutation, and the kernel-only workflow map state now keeps Creation active for seed decomposition rather than marking Admission complete. It also validates setup, kernel authoring, server readback, and cold Prompt-out packet usability for the captured World premise pressure packet.

The remaining codebase-wide product work is not a broad Creation rebuild. The first PRD should target Creation Prompt-out currentness for kernel section and mode changes: after the steward changes the selected kernel section or Prompt-out mode, the preview, active packet identity, and load-button state must immediately follow the active decision or explicitly mark the prior packet as stale. A no-op save must not be required to make a loadable packet current.

Recommended first PRD seam: existing Creation Prompt-out browser surface plus server Prompt-out step/generation identity. Use the current HTTP Prompt-out step lifecycle and browser current/stale packet guards; do not introduce a new architecture seam.

Follow-on candidate: Minimal Viable World checkpoint foregrounding inside Creation. The checkpoint state is now correct, but the not-yet-earned checkpoint panel still dominates the active Creation path before seed decomposition. That is presentation/ordering friction, not the first correctness PRD.

Supporting skill result: Domain model unchanged - no new app-layer terms, no glossary edits owed, and no ADR-worthy trade-off was resolved by this prep.

## Evidence Checked

| Finding or candidate | Status | PRD impact |
|---|---|---|
| `V-01` setup and workflow-map entry | Validated | No product scope. Setup/open-world path carried the method without docs. |
| `V-02` late-Admission mutation block | Fixed validation | No product scope. PRD #302 behavior held in Field Build 09. |
| `V-03` kernel-only workflow-map state | Fixed validation | No product scope for workflow-map state. PRD #308 behavior held in Field Build 09. |
| `V-04` kernel authoring and server readback | Validated | No product scope. Creation kernel authoring carried all nine sections and explicit consequence mode. |
| `V-05` cold Prompt-out packet usability | Validated for captured packet | No product scope for packet content structure. The captured World premise pressure packet was usable cold. |
| `P-01` kernel Prompt-out preview can stay bound to previous section after section switch | Fresh product defect | Selected first PRD. The active decision and prompt packet can diverge until a no-op save refreshes the state. |
| `R-01` not-yet-earned Minimal Viable World checkpoint dominates early Creation | Real presentation friction | Defer as follow-on. State is correct but active-work ordering is noisy. |

Live source checks:

- `packages/web/src/main.tsx` contains the Creation kernel heading state, Prompt-out mode state, preview selection, current-origin comparison, load action, and Minimal Viable World panel ordering that Field Build 09 exercised.
- `packages/web/src/creation-decision-surface.test.tsx` already checks Creation Prompt-out selection and Minimal Viable World rendering, but the inspected assertions do not prove the observed stale-preview/load-button transition after switching from a saved last section to another saved section and changing mode.
- `docs/specs/creation-flow.md` already states that Creation kernel Prompt-out uses the selected kernel section as packet grain and that the browser previews the selected-section packet.
- `docs/specs/prompt-out-context-assembly.md` already states that prompt packets and decision surfaces are two renderings of one context assembly, and that loaded Prompt-out status becomes stale when active decision, selected record, step, prompt mode, packet body, or world changes.
- `docs/principles/guided-workflow-usability.md` W-8/W-9 and `docs/principles/workflow-principles.md` W-1 require Prompt-out at the current decision point, with the preview and packet reflecting the actual decision.

Tracker overlap:

- No open issues existed at inspection time.
- PRD #297 is closed and already covered active Prompt-out packet ownership, stale-route guards, exact export, and Admission mode selection. Field Build 09 happened after that work and exposes a narrower remaining or regressed Creation kernel section/mode transition.
- PRD #269 is closed and covered unsaved non-premise Creation Proposal active-route replay. Field Build 09 differs: all kernel sections were saved, the selected section was switched back from `Ordinary-life promise` to `World premise`, and Pressure mode preview/loadability remained stale until re-saving.
- PRD #308 is closed and covered workflow-map pre-Admission handoff. Field Build 09 validated that state-level fix and only found visual ordering friction around the not-yet-earned Minimal Viable World checkpoint.

## Authority Findings

No methodology, principle, ADR, or domain glossary change is owed before the next PRD.

Existing authorities already require the selected scope:

- `docs/worldbuilding-system/05_creation_protocol.md` governs Creation kernel authoring and seed decomposition.
- `docs/worldbuilding-system/20_ai_assisted_workflow.md` defines Proposal and Pressure modes, including the World premise essence exception and authored-material pressure precondition.
- `docs/specs/creation-flow.md` makes the selected kernel section the Creation kernel Prompt-out grain.
- `docs/specs/prompt-out-context-assembly.md` requires screen/packet parity, explicit stale identity, and cold-packet usability.
- `docs/specs/browser-visible-guidance-acceptance.md` requires active-route replay when closing a field-build blocker and prompt packet preview/source manifest/advisory warning when Prompt-out is in scope.
- `docs/principles/canon-sovereignty.md` P-2/W-1, `docs/principles/workflow-principles.md` W-1, and `docs/principles/guided-workflow-usability.md` W-8/W-9 all support fixing active prompt currentness without moving authorship, Prompt-out policy, or packet assembly into browser-only behavior.
- ADR 0007 keeps Prompt-out as a server-side step lifecycle seam consumed by flow modules and the browser.
- ADR 0009 keeps browser guided-flow surfaces as renderers of server-owned flow policy.

Spec changes are optional for the first PRD. The tracked specs already state the required behavior. If implementation discovers the specs are ambiguous about saved-section switching or load-button stale states, the PRD may include a narrow spec clarification, but no doctrine amendment is expected.

## Recommended First PRD

### Creation Prompt-out preview currentness after kernel section or mode changes

Purpose: eliminate the active-surface mismatch Field Build 09 found in Creation kernel Prompt-out. The steward should never see selected section `World premise` while the preview and load state are still bound to `Ordinary-life promise`, nor need to re-save already-saved text to refresh a prompt packet.

Sources:

- Field Build 09 `P-01`, summarized from `reports/field-build-09-the-bloom.md`.
- Closed PRDs #269, #297, and #308 as prior context.
- `docs/specs/creation-flow.md`.
- `docs/specs/prompt-out-context-assembly.md`.
- `docs/specs/browser-visible-guidance-acceptance.md`.
- `docs/principles/canon-sovereignty.md`, `workflow-principles.md`, and `guided-workflow-usability.md`.
- ADR 0007 and ADR 0009.

Problem:

Creation kernel authoring lets the steward save multiple sections, then switch the selected kernel section and Prompt-out mode. Field Build 09 showed that the visible selected-section state can change while the prompt preview and load button remain bound to the previous selected section until the steward performs a no-op save. That violates screen/packet parity and makes exact prompt-out evidence depend on hidden refresh behavior.

Recommended product rule:

The Creation Prompt-out preview, mode availability, load-button state, loaded/current status, and source manifest are derived from the active selected kernel section and selected prompt mode. When either changes, the active preview refreshes immediately from server-returned or locally valid request state. Any prior packet body/status becomes stale and names its prior section/mode. A prompt cannot be loaded, copied, exported, or represented as current if the active selected section, mode, step, packet identity, or body disagree.

Scope:

- Creation kernel Prompt-out only, including saved-section switching and Proposal/Pressure mode changes.
- Saved sections as well as unsaved section/draft cases, because Field Build 09 observed a saved-section switch.
- Active route browser behavior and server Prompt-out step/generation identity.
- Load-button availability and visible stale-state copy.
- Active-route replay for the exact Field Build 09 sequence: save all kernel sections, last selected section is `Ordinary-life promise`, switch back to `World premise`, choose Pressure, verify preview/loadability follows `World premise` without re-save.

Acceptance:

- Switching `Kernel step` immediately updates the Prompt-out preview current decision, context preview, source manifest, availability/blocker text, and load-button state to the selected section.
- Switching Prompt-out mode immediately updates the preview and load-button state for the selected section and does not reuse a prior mode packet as current.
- A previously loaded or previewed packet is stale when selected section or mode changes; it names its prior section/mode and disables current copy/download/store actions.
- The World premise essence exception and Pressure authored-material blocker remain correct for the selected/requested target heading.
- Saved non-premise sections can load Pressure when they have saved steward-authored material, and empty/unsaved non-premise sections keep the existing Proposal/Pressure rules.
- No no-op save is needed to make the selected section's loadable packet current.
- Prompt-out loading does not mutate kernel prose, flow step, canon records, advisory artifacts, or canon standing.
- Browser evidence maps Field Build 09 `P-01` to the exact active route, not only a source-level or component fixture.

Likely issue slices:

1. Creation Prompt-out active-section/mode contract and test fixtures.
2. Browser currentness, stale preview, and loadability update on section/mode change.
3. Active-route replay and closeout for Field Build 09 `P-01`.

Out of scope:

- Full Prompt-out architecture redesign.
- Direct LLM integration or API calls.
- New Prompt-out record types.
- Changes to Proposal/Pressure doctrine, the World premise essence exception, or advisory/canon separation.
- Seed decomposition packet parity beyond regressions needed to preserve PRD #297/#269 behavior.
- Minimal Viable World checkpoint presentation ordering, except as a follow-on.

## Follow-On Candidates

### Creation Minimal Viable World checkpoint foregrounding before seed evidence exists

Purpose: reduce early Creation reading friction after kernel completion but before seed decomposition.

Sources: Field Build 09 `R-01`, PRD #308, `docs/specs/creation-flow.md`, and `docs/specs/workflow-map-and-navigation.md`.

Problem: the workflow map now correctly states that seed decomposition is owed and Admission is not earned, but the Creation destination still renders the full Minimal Viable World checkpoint panel before Kernel authoring and Seed decomposition. It is labeled `not owed`, but its disabled controls and contract text occupy the primary path before the currently owed decision.

Recommended rule or open design point: not-yet-earned checkpoint details should be collapsed, summarized, or moved below active kernel/seed-decomposition surfaces until admitted seed evidence exists or the checkpoint becomes owed. The UI should still preserve discoverability and current state, but not make non-current work dominate the active Creation path.

Scope:

- Creation destination presentation ordering for Minimal Viable World checkpoint when `checkpoint.owed` is false and no admitted seed evidence exists.
- Browser-visible orientation and cognitive walkthrough.
- No server state-machine change unless the payload lacks enough state to distinguish not-yet-earned from owed.

Acceptance:

- In kernel-complete/no-seed state, seed decomposition is visually foregrounded before not-yet-earned Minimal Viable World details.
- The checkpoint still names its state (`not owed`) and unlock condition, but disabled controls do not dominate the active path.
- When admitted seed evidence exists and the checkpoint is owed, the full checkpoint surface remains available and foregrounded per the existing spec.
- No Creation, Admission, QA, or checkpoint write behavior changes.

### Coverage-only replay

Purpose: after the first PRD lands, rerun a field-build or focused browser replay to verify the Field Build 09 prompt-out mismatch is closed before opening broader Creation presentation work.

What would turn it into product work: if replay still finds active preview/load mismatch, stale packet affordance, or no exact export path after the first PRD, reopen as product scope rather than coverage-only closeout.

## Rejected Or No-Op Alternatives

- Treat Field Build 09 as fully covered by PRD #297. Rejected because #297 is closed, Field Build 09 ran at HEAD after that closure, and the observed active-section preview mismatch still happened.
- Treat Field Build 09 as fully covered by PRD #269. Rejected because #269 focused on unsaved non-premise Proposal after saved World premise; Field Build 09 found a saved-section switch and Pressure-mode loadability mismatch after all kernel sections existed.
- Reopen workflow-map PRD #308 for `R-01`. Rejected because Field Build 09 validated #308's state-level fix. The remaining checkpoint issue is local Creation presentation ordering, not map readiness or Admission completion state.
- Bundle `P-01` and `R-01` into one PRD. Rejected for sequencing. `P-01` is a correctness defect in Prompt-out packet identity and loadability; `R-01` is presentation friction. Pairing them would widen acceptance and obscure the cold-packet correctness bar.
- Patch docs first. Rejected because durable authorities already require screen/packet parity and active decision-point Prompt-out. The first PRD should implement behavior and replay proof, with only narrow spec clarification if implementation discovers ambiguity.
- Ignore the issue because re-saving is a workaround. Rejected because prompt-out correctness cannot rely on hidden no-op saves; the methodology requires exact current packets at each decision point.

## PRD Publication Inputs

Suggested title:

`PRD: Creation Prompt-out preview currentness - selected-section refresh, mode changes, and stale packet guard`

Publication package: one PRD first, plus deferred follow-ons for Minimal Viable World checkpoint foregrounding and coverage replay if needed.

Recommended testing seam: existing server Prompt-out step/generation HTTP seam plus existing web Creation guided-flow Prompt-out surface. The later `/to-prd` pass still owes its seam checkpoint. Recommended seam wording: reuse existing seams unchanged; no new architecture seam.

`/to-prd` usage: consulted for house style only during this prep. It was not invoked, and no issue was published.

Likely label: `ready-for-agent` after `/to-prd` seam confirmation, if the PRD body maps the browser-visible guidance checklist and no open decisions remain. Downgrade to `needs-triage` if the seam is changed, if the first PRD bundles `R-01`, or if source-report durability is mishandled.

Principles, ADRs, specs, and prior PRDs to cite:

- `docs/specs/creation-flow.md`
- `docs/specs/prompt-out-context-assembly.md`
- `docs/specs/browser-visible-guidance-acceptance.md`
- `docs/specs/workflow-map-and-navigation.md` as context for the deferred `R-01`
- `docs/worldbuilding-system/05_creation_protocol.md`
- `docs/worldbuilding-system/20_ai_assisted_workflow.md`
- `docs/principles/README.md`
- `docs/principles/canon-sovereignty.md`
- `docs/principles/workflow-principles.md`
- `docs/principles/guided-workflow-usability.md`
- `docs/principles/data-principles.md`
- `docs/principles/domain-fidelity.md`
- ADR 0007
- ADR 0009
- PRD #269
- PRD #297
- PRD #308

Browser-visible guidance checklist mapping requirements:

| Checklist item | Future PRD home |
|---|---|
| package source cited | Preamble and Principles should name Creation, Prompt-out context assembly, AI-assisted workflow, browser-visible guidance, ADRs, and prior PRDs. |
| decision-point contract named | Problem/Solution/Implementation should name Creation kernel section Prompt-out as the affected decision point. |
| required, optional, skippable, and severity-dependent fields visible where relevant | In scope for selected section, selected mode, World premise Proposal refusal, Pressure authored-material blocker, current/stale packet state, and no-mutation preview/load behavior. Severity is N/A for kernel authoring. |
| doctrine at the actual decision point | PRD should require selected-section guidance and mode doctrine at the Prompt-out preview, not only source paths. |
| prompt packet preview, source manifest, and cold external LLM test | In scope. The closeout should capture preview/source manifest and run a cold packet probe where available, or explicitly record why unavailable. |
| advisory/canon separation visible | In scope. Loading or exporting Prompt-out remains advisory and must not mutate kernel/canon state. |
| skip path and reason storage | N/A unless implementation changes Prompt-out skip behavior; it should not. |
| blockers/substance validation | In scope for World premise essence blocker, Pressure authored-material blocker, and stale/inconsistent packet export blockers. |
| current, next, and resume state | In scope for selected section/mode changes and stale packet currentness; no workflow-map state-machine change expected. |
| read-side audit or provenance link | N/A for Prompt-out load-only behavior unless storing advisory artifacts is exercised; non-mutation should be explicit. |
| cognitive walkthrough | In scope. Use the Field Build 09 sequence as the naive-steward path. |

Canonical gates:

- `pnpm test`
- `pnpm typecheck`
- `pnpm build`

Focused likely gates:

- web Creation decision-surface tests;
- web Prompt-out lifecycle/currentness tests;
- server Prompt-out generation tests;
- server Creation-flow tests preserving selected-heading, essence exception, and no-mutation behavior.

Browser/cold-LLM evidence expectations:

- Active browser replay of the Bloom-like sequence: create/open world, save all kernel sections, leave the last selected section as `Ordinary-life promise`, switch to `World premise`, select Pressure, verify preview/load state names `World premise` without re-save, load packet, export/copy exact packet if supported, and verify stale prior packet affordances are disabled.
- Console check with zero errors/warnings or explicit triage.
- Cold external LLM probe using the exact current packet if tool availability permits; otherwise record honest blocked status.

Source durability warnings and temporary-path handling:

- `reports/field-build-09-the-bloom.md` is untracked in this checkout at prep time. A published PRD should say the Field Build 09 source report is a local untracked source summarized for the PRD unless it is committed and publication-ref visible before publication.
- Do not cite `/tmp/worldloom-field-build/...` paths in the published PRD. Summarize the evidence and, if a durable report is needed, archive or track a cleaned evidence report first.
- This prep file is also new/untracked until committed and publication-ref visible. If `/to-prd` cites this file before that happens, it must mark it pending local publication or summarize it without durable-citation wording.

## Completion Self-Check

- `/to-prd` consulted for house style only: yes.
- Source artifact posture recorded: yes, `reports/field-build-09-the-bloom.md` is untracked/local and `/tmp` evidence is temp-only.
- Authored artifact posture recorded: yes, new untracked prep artifact.
- Tracker freshness recorded: yes, no open issues and relevant closed PRDs/issues named.
- Selected first PRD recorded: yes, Creation Prompt-out preview currentness after kernel section or mode changes.
- Follow-on candidates recorded: yes, Minimal Viable World checkpoint foregrounding and coverage replay.
- Recommended testing seam recorded: yes, existing server Prompt-out step/generation seam plus existing web Creation Prompt-out surface.
- Likely label and downgrade conditions recorded: yes.
- Canonical and focused gates recorded: yes.
- Durability warnings recorded: yes.

## Freshness And Boundaries

Refreshed in this session:

- Field Build 09 source report contents.
- Git branch, HEAD, and worktree status.
- Source durability and `origin/main` visibility for the Field Build 09 report.
- Open tracker list and relevant closed PRDs/issues.
- Creation, Prompt-out, workflow-map, and browser-visible guidance authorities.
- Relevant browser implementation and tests around Creation Prompt-out and Minimal Viable World rendering.

Not done:

- No code implementation.
- No issue or PRD publication.
- No tracker mutation.
- No root tests, app server, browser replay, or cold LLM rerun.
- No domain glossary, ADR, principle, or methodology edits.

Out-of-scope boundaries:

- Do not reopen fixed Field Build 08 blockers unless a replay disproves them.
- Do not broaden the first PRD into a general Creation redesign.
- Do not treat local temp evidence as durable publication input.
- Do not add a repo-wide browser/e2e hard gate.

Files intentionally added or changed by this prep:

- Added `reports/field-build-09-the-bloom-prd-prep.md`.

Pre-existing worktree dirt to preserve:

- `.claude/skills/field-build/SKILL.md` modified before this artifact write.
- `reports/field-build-09-the-bloom.md` untracked before this artifact write.
