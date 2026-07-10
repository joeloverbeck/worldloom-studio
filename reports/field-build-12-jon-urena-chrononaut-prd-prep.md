# Field Build 12 PRD-Ready Determination: Creation Coverage Bootstrap And Coverage-Decision Prompt-Out

Source artifact: `reports/field-build-12-jon-urena-chrononaut.md`

Selected source sections: `Findings` entries `F-01`, `P-01`, and `P-02`; validation findings `V-01` and `V-02`; `Regression of prior findings`; `Decision-point log`; `For the app (PRD seeds)`; and `Frontier`.

Source durability status: durable. The source report is tracked, clean, and visible on `origin/main` at prep time. The field-build screenshots, SQLite world file, prompt packets, browser readbacks, and cold-LLM outputs referenced by the report are temp-only evidence. A later PRD may cite the tracked report, but should summarize those temp artifacts rather than cite machine-local paths from the report body.

Authored artifact status: new untracked PRD-ready determination artifact. This file is a local prep artifact until tracked, committed, and publication-ref visible.

Live checkout snapshot: branch `main`, HEAD `7f62226`. Pre-write worktree check was clean.

Tracker freshness: current open issue readback returned no open issues on 2026-07-10. Relevant closed tracker work inspected: PRD #321 and children #322-#327 for the Creation seed-family coverage gate, especially #325 browser coverage decision surface and #326 Creation Prompt-out coverage inventory context; PRD #328 and children #329-#330 for Field Build 11 correction-note visibility and idempotence; PRD #336 and children #337-#338 for Field Build 11 Prompt-out current-packet clarity; PRD #202 for Minimal Viable World checkpoint context; PRD #204 for prompt-packet structure hardening; and original issue #113 for the closed Creation prompt-out default/template bug.

Deliverable status: PRD-ready determination only. No code, tracker, methodology, principle, ADR, or domain glossary mutation happened in this prep.

External research: skipped. The task is repo/report determination and all governing facts are local repo authorities plus GitHub tracker state.

Decision: RATIFIED artifact home and selected scope -> write `reports/field-build-12-jon-urena-chrononaut-prd-prep.md` with one selected PRD, Creation coverage bootstrap and coverage-decision Prompt-out; rationale: the user accepted the recommendation after the report, current source, authorities, and tracker overlap were inspected.

## Reassessment Verdict

Field Build 12 validates two important fixes. The existing Jon world reopens cleanly, and Field Build 11's workflow-map handoff blocker is fixed: unresolved Creation coverage now keeps Creation owed and Admission blocked as the primary route. The Field Build 11 carryovers are not fresh PRD scope here: correction-note visibility and idempotence are covered by closed PRD #328, and stale current-packet clarity after correction is covered by closed PRD #336.

The remaining codebase-wide product work is one active-route frontier: the app can correctly block at Creation seed-family coverage, but the empty coverage inventory state is not authorable through the visible workflow, and both Prompt-out modes still outsource the older seed-decomposition handoff rather than the active coverage decision when no coverage rows exist.

Recommended first PRD: Creation coverage bootstrap and coverage-decision Prompt-out. It should make the `decomposition:coverage` decision usable when the inventory is empty: the browser must let the steward create or confirm the first coverage rows, and Proposal/Pressure packets must help with the coverage decision rather than asking whether already-parked seeds are ready for Admission.

Publication package: one PRD, not multiple. `F-01`, `P-01`, and `P-02` are coupled by the same current decision point and the same missing empty-inventory bootstrap state. Splitting them would produce a UI PRD blocked by a prompt-context PRD, or vice versa, even though the steward experiences them as one unusable coverage decision.

Supporting skill result: Domain model unchanged - this prep uses existing app and methodology language. `Seed-family coverage`, `coverage inventory`, `Prompt-out step`, `Prompt packet`, and `decision point` already exist in project vocabulary or governing specs. No `CONTEXT.md` or ADR update is owed by this prep.

## Evidence Checked

| Finding or candidate | Status | PRD impact |
|---|---|---|
| `V-01` existing Jon world reopens cleanly | Validated | No product scope. Keep world-path readback as field-build practice. |
| `V-02` Field Build 11 workflow-map handoff blocker | Fixed validation | No product scope. Preserve Creation owed / Admission blocked behavior as regression coverage. |
| `F-01` seed-family coverage inventory has no active create/confirm controls | Fresh product scope | Selected PRD. Empty inventory blocks the active route but cannot be satisfied through visible controls. |
| `P-01` Coverage Proposal prompt is bound to seed decomposition, not coverage | Fresh product scope | Selected PRD. Proposal mode must draft coverage rows/dispositions for the active coverage decision. |
| `P-02` Coverage Pressure prompt is bound to seed decomposition, not coverage | Fresh product scope | Selected PRD. Pressure mode must challenge missing seed families and coverage dispositions, not evaluate Admission readiness. |
| Field Build 11 `P-01` stale secondary Prompt-out preview after correction/mode switch | Covered by tracker | No fresh scope. Closed PRD #336 targeted and closed this follow-on. |
| Field Build 11 `F-02` duplicate narrowing-note correction contexts | Covered by tracker | No fresh scope. Closed PRD #328 targeted and closed this follow-on. |
| App Seed 3 - preserve fixed map handoff | Regression requirement | Include as acceptance, not as new product scope. |

Live source checks:

- `packages/web/src/main.tsx` renders the Creation coverage panel, the create/confirm API path, existing row disposition controls, and Admission-secondary copy. When `coverageInventory.rows.length === 0`, it renders only "No seed-family coverage rows have been confirmed yet." It has no empty-state row label, source context, required/optional, or submit controls for the first inventory rows.
- `packages/web/src/main.tsx` has mutation handlers for linking, deferring, and out-of-scope actions once a row exists. It does not have a visible `confirmCoverageRows` empty-state authoring path.
- `packages/server/src/creation-coverage.ts` exposes `confirmCoverageRows`, `creationCoverageInventory`, `createOrConfirmPath`, row dispositions, and coverage context for Prompt-out. The server primitive exists; the active routed browser path does not expose it for an empty inventory.
- `packages/server/src/creation-flow.ts` sets `currentStep` to `decomposition:coverage` and changes the local decision to "Account for kernel seed families before Admission handoff." However, the Prompt-out step identity remains `creation:decomposition_prompt` with `decomposition_pressure`, and the generated preview can still frame the older seed-decomposition handoff when coverage rows do not exist.
- `packages/server/test/prompt-out.test.ts` proves coverage context is included after coverage rows exist and cover/defer/out-of-scope dispositions have been made. It does not prove a coverage-specific Proposal or Pressure packet for missing inventory before rows exist.
- `packages/web/src/creation-decision-surface.test.tsx` proves rendering and controls for existing coverage rows. It does not prove an empty-state create/confirm form.

Tracker overlap:

- No open issues existed at refresh time.
- PRD #321 is closed and shipped the Creation coverage gate. Field Build 12 validates its workflow-map blocking behavior but narrows its browser and Prompt-out maturity: the gate can block correctly without being authorable from the empty-inventory active route.
- Closed #325 required the Creation destination to show "coverage inventory or create/confirm path." The current source and field evidence show that "path" is still not enough for a docs-closed steward; the active route needs form controls and action wiring.
- Closed #326 required coverage context when rows exist. Field Build 12 shows a gap before rows exist: the active coverage decision needs prompt packets that help create or pressure the inventory itself.
- Closed #328 and #336 cover the carried Field Build 11 findings and should not be reopened unless a later replay disproves them on current HEAD.

## Authority Findings

No upstream methodology, principle, ADR, or domain glossary change is owed before the next PRD.

Existing authorities require the selected PRD:

- `docs/worldbuilding-system/05_creation_protocol.md` Phase 2 requires broad seed material to be split and accounted for before Admission treats facts as proposed work.
- `docs/specs/creation-flow.md` already defines seed-family coverage as a dependency-bearing Creation decision point. It says the Creation destination shows the server-returned coverage inventory or a create/confirm-coverage path, but Field Build 12 proves the path alone is not a usable decision-point surface.
- `docs/specs/creation-flow.md` says seed-family coverage Proposal and Pressure modes use `decomposition_pressure` when packet context includes coverage rows. The active field route shows that the no-rows state needs stronger coverage-specific packet behavior, not just omission text.
- `docs/specs/prompt-out-context-assembly.md` says prompt packets and browser decision surfaces are two renderings of one context assembly. At `decomposition:coverage`, the packet must outsource the coverage decision, including missing inventory and proposed coverage-row candidates.
- `docs/specs/workflow-map-and-navigation.md` already owns the partial-decomposition state and correctly keeps Creation primary while coverage is unresolved. The future PRD should preserve this.
- `docs/specs/browser-visible-guidance-acceptance.md` explicitly names Creation coverage-gate proof: inventory or create/confirm path, unresolved rows, disposition controls, rationale fields, linked proposed seeds, Admission-secondary visibility, server-owned current/next/resume state, and read-side trail. Field Build 12 shows the create/confirm path is not yet browser-visible enough.
- `docs/principles/guided-workflow-usability.md` W-8 and W-9 require the app to be the method surface. A bare endpoint path does not satisfy the decision-point contract for a docs-naive steward.
- `docs/principles/workflow-principles.md` W-1 requires Prompt-out at every decision point in proposal and pressure modes. W-7 requires gates to demand substance, not clicks; the empty inventory needs steward-authored coverage substance, not a hidden API call.
- `docs/principles/canon-sovereignty.md` P-2/W-1 require Prompt-out to remain advisory and self-contained. The future PRD must not parse LLM output into coverage rows automatically.
- `docs/principles/data-principles.md` W-5/W-6 and ADR 0008 support keeping the coverage bootstrap as Creation-owned flow state over the world file, not browser-only state.
- ADR 0007 keeps Prompt-out assembly and lifecycle server-owned; the browser should consume server-owned current packet identity rather than assemble coverage prompts locally.
- ADR 0009 keeps browser guided-flow surfaces as renderers of server-owned policy and decision contracts.

Spec changes are part of the future PRD. `docs/specs/creation-flow.md` should clarify that an empty coverage inventory requires active browser controls for confirming row labels/source context and that the `decomposition:coverage` Prompt-out packet targets coverage inventory creation or pressure before rows exist. `docs/specs/prompt-out-context-assembly.md` should clarify missing-inventory packet behavior. `docs/specs/browser-visible-guidance-acceptance.md` may need a narrow clarification that "create/confirm path" means an actionable browser path, not a displayed endpoint string. `docs/methodology-coverage.md` should be updated only after active-route evidence proves the browser carries the empty-inventory coverage decision.

## Recommended First PRD

### Creation Coverage Bootstrap And Coverage-Decision Prompt-Out

Purpose: make the Creation `decomposition:coverage` decision usable at the stable frontier found by Field Build 12. A steward should be able to create or confirm the initial seed-family coverage inventory through the active browser route and use Proposal/Pressure Prompt-out packets that target the coverage decision before any rows exist.

Sources:

- Field Build 12 `F-01`, `P-01`, and `P-02`, from `reports/field-build-12-jon-urena-chrononaut.md`.
- Field Build 11 report and prep as prior context for PRD #321.
- Closed PRDs #321, #325, #326, #328, and #336.
- `docs/worldbuilding-system/05_creation_protocol.md`.
- `docs/specs/creation-flow.md`.
- `docs/specs/prompt-out-context-assembly.md`.
- `docs/specs/workflow-map-and-navigation.md`.
- `docs/specs/browser-visible-guidance-acceptance.md`.
- `docs/methodology-coverage.md`.
- `docs/principles/guided-workflow-usability.md`, `workflow-principles.md`, `canon-sovereignty.md`, `data-principles.md`, and `domain-fidelity.md`.
- ADR 0007, ADR 0008, and ADR 0009.

Problem:

PRD #321 made unresolved seed-family coverage block Creation completion. Field Build 12 proves the blocking state is correct, but the empty inventory state cannot be worked through the visible UI. The browser shows the server endpoint path and says no rows have been confirmed, then stops. The steward cannot record coverage rows for anti-aging chemistry, implant/invulnerability boundaries, intervention/accountability pressure, or ordinary-life/institutional/evidence pressure without leaving the app route and calling a hidden API.

Prompt-out then compounds the problem. The active step is `decomposition:coverage`, but Proposal and Pressure packets still ask about the older seed-decomposition handoff and whether existing proposed facts are ready for Admission. In the cold outputs captured by the report, the model treated missing coverage inventory as irrelevant because the packet had framed a narrower old decision.

Recommended product rule:

Creation coverage bootstrap is a first-class decision point. When coverage inventory is missing, the browser renders an empty-state create/confirm form for initial coverage rows, including row label or summary, source kernel context, required/optional state, and steward rationale where applicable. The server remains the authority for validation, persistence, completion blockers, current/next/resume state, and readback.

Prompt-out for `decomposition:coverage` targets the active coverage decision. Proposal mode asks for candidate coverage rows and disposition rationales over unresolved kernel seed families. Pressure mode refuses to evaluate Admission readiness while inventory is missing, then challenges missing families, false equivalences, unjustified deferrals, and out-of-scope claims. Both modes remain advisory and never create rows or dispositions automatically.

Scope:

- Add active browser controls for the empty coverage inventory state, using the server `createOrConfirmPath` rather than displaying it as inert endpoint text.
- Let the steward create or confirm one or more coverage rows with label/summary, source kernel context, required flag, and optional association to the current seed-decomposition report.
- Preserve validation for at least one row, required labels, stale row identity where applicable, and server-returned recovery messages near the action with entered material preserved.
- Refresh Creation decision state and workflow-map state after row confirmation so newly created rows immediately expose link/defer/out-of-scope controls.
- Make `decomposition:coverage` Prompt-out packets coverage-specific before rows exist. Proposal packets should draft candidate row labels/source contexts/disposition suggestions from the kernel and parked seeds. Pressure packets should challenge missing inventory and refuse premature Admission-readiness framing.
- Preserve existing #321 behavior for rows after they exist: link parked proposed seeds, defer as seed debt, mark out of scope, keep Admission secondary while unresolved, and hand off only after coverage is resolved or disposed.
- Preserve #328 correction-note behavior and #336 current-packet clarity as regression context.
- Update specs and methodology coverage only as warranted by implementation and active-route evidence.

Acceptance:

- In a world at Creation `decomposition:coverage` with missing inventory, the Creation destination shows an actionable empty-state coverage form, not only an endpoint path.
- The form lets the steward add multiple initial coverage rows with label/summary and source kernel context, and submit them through the server-owned coverage confirm route.
- Server validation failures for missing rows, missing labels, or invalid report/kernel identity render at or near the empty-state action and preserve entered material.
- After confirmation, the browser refreshes into the existing row-level coverage surface with link, defer, and out-of-scope controls.
- The workflow map remains in the fixed #321 state: Creation primary/owed and Admission secondary while coverage is missing or unresolved.
- Proposal mode at `decomposition:coverage` with missing inventory generates a coverage-specific packet that asks for candidate coverage rows and possible disposition rationales, not Admission readiness for the existing proposed seeds.
- Pressure mode at `decomposition:coverage` with missing inventory generates a coverage-specific packet that challenges missing seed families and says the inventory must exist before Admission readiness can be evaluated.
- Coverage packets include kernel context, parked proposed seeds, the seed-decomposition report where available, missing-inventory state, source manifest, omission reasons, advisory/canon warning, forbidden moves, and current decision identity.
- Prompt-out generation remains non-mutating: no coverage rows, links, seed facts, advisory artifacts, skips, flow completions, or canon-standing changes are written by loading, previewing, copying, or generating packets.
- Existing coverage-row packet behavior from #326 remains true after rows exist.
- Existing workflow-map partial-decomposition behavior from #321 remains true.
- Existing correction-note visibility/idempotence from #328 and current-packet clarity from #336 remain true.
- Browser evidence replays the Field Build 12 route or an equivalent fixture: open existing world, enter Creation `decomposition:coverage`, see empty inventory controls, confirm rows, load Proposal and Pressure packets for the active coverage decision, and record console state.
- Cold external LLM proof uses exact coverage-specific Proposal and Pressure packets when available and verifies that the packet makes missing inventory relevant without repo files or steward-added context.

Likely issue slices:

1. Spec and contract update for empty coverage inventory bootstrap and `decomposition:coverage` Prompt-out semantics.
2. Server Creation decision payload and Prompt-out packet context for missing inventory.
3. Browser Creation empty-inventory create/confirm controls and validation recovery.
4. Active-route replay, cold packet proof, regression checks, and methodology-coverage closeout.

Out of scope:

- Automatic NLP extraction of all seed families from kernel prose.
- Automatic creation of coverage rows from LLM output.
- Admission severity, frontloaded seed audit, gate results, first canon standing, or accepted-fact behavior.
- Changes to existing covered/deferred/out-of-scope row dispositions except as needed to refresh after initial row creation.
- Reopening PRD #321's workflow-map priority behavior.
- Reopening PRD #328 correction-note idempotence/readback.
- Reopening PRD #336 current-packet clarity after correction.
- Direct LLM integration, API keys, vendor coupling, or advisory parsing.
- Upstream methodology edits to `docs/worldbuilding-system/05_creation_protocol.md`.
- A new ADR unless implementation discovers a conflict with ADR 0007, ADR 0008, or ADR 0009.

## Follow-On Candidates

### Coverage Row Suggestion Quality Field Trial

Purpose: evaluate whether coverage-specific Proposal packets actually help a cold model identify the missing kernel seed families in real field use.

Sources: Field Build 12 `P-01`/`P-02`, future implementation packet artifacts, and later field-build replay.

Problem: the PRD can require correct context and task framing, but whether the candidate rows are good enough for steward use remains field evidence, not a product invariant.

Scope: field-build replay and cold-LLM evaluation only.

Acceptance: if the cold packet still misses obvious kernel families or reframes the task as Admission readiness after the PRD lands, open fresh product scope for packet wording/structure.

### Coverage Bootstrap Ergonomics After Real Use

Purpose: improve row-entry ergonomics only if the first implementation proves too slow or error-prone.

Problem: the first PRD should add the missing active path without overbuilding automatic extraction. A later field build may justify bulk row editing, row templates, duplicate-row detection, or seed-family candidate chips.

Scope: browser ergonomics, not state-machine or method semantics.

Acceptance: field evidence shows the steward can technically create rows but the interface creates avoidable transcription burden or duplicate rows.

## Coverage Follow-Up

After the selected PRD lands, resume the Jon Urena world or an equivalent fixture at Creation `decomposition:coverage` with missing inventory. The replay should prove:

- the empty coverage inventory can be authored from the active route;
- candidate rows can cover temporal access, anti-aging chemistry, implant/invulnerability boundaries, intervention/accountability pressure, and ordinary-life/institutional/evidence pressure;
- Proposal and Pressure packets address the active coverage decision before rows exist;
- after rows exist, existing #321 row disposition controls still work;
- Creation remains primary and Admission secondary until every required row is covered, deferred, or out of scope with rationale;
- no methodology docs are needed to discover the next app action.

If replay still requires hidden API calls or docs-open interpretation to create the first rows, the PRD should not be closed as replacement-grade.

## Rejected Or No-Op Alternatives

- Treat Field Build 12 as fully covered by PRD #321. Rejected because #321 fixed the blocking state and row-level controls, but the active empty-inventory authoring path is still missing.
- Treat `F-01` as an implementation bug only. Rejected because the needed behavior spans browser decision surface, server validation/readback, specs, Prompt-out semantics, and active-route evidence.
- Split UI bootstrap and Prompt-out coverage packets into separate PRDs. Rejected because both failures happen at the same active decision before rows exist. One PRD gives the later issue breakdown enough room to slice implementation without losing the product seam.
- Reopen #325. Rejected because #325 is closed and its issue body allowed "inventory or create/confirm path"; Field Build 12 provides a stronger acceptance requirement for actionable empty-state controls.
- Reopen #326. Rejected because #326 is closed and proves coverage context after rows exist; Field Build 12 exposes missing-inventory semantics before rows exist.
- Change Admission to handle missing kernel seed families. Rejected because Creation owns seed decomposition and coverage; Admission owns first canon standing after Creation hands off proposed facts.
- Automatically infer all coverage rows from kernel prose. Rejected because it assigns method interpretation to the app. The steward should confirm or author row labels and dispositions; Prompt-out can advise only.
- Make Prompt-out generate and submit coverage rows automatically. Rejected by canon-sovereignty and Prompt-out advisory boundaries.
- Treat the carried Field Build 11 findings as fresh scope. Rejected because #328 and #336 are closed and post-date those findings; carry them as regression checks only.
- Skip a written prep artifact. Rejected by user confirmation; this file is the agreed PRD-ready determination home.

## PRD Publication Inputs

Suggested title:

`PRD: Creation coverage bootstrap - empty inventory controls and coverage-specific Prompt-out`

Publication package: one PRD, with issue slices for spec/server/browser/replay work. Do not publish separate PRDs for `F-01`, `P-01`, and `P-02` unless the user explicitly revises this packaging.

Recommended testing seam: reuse existing seams. Primary server seams are Creation-flow HTTP/API behavior over real temp-file world databases and Prompt-out generation over server-owned packet assembly. Browser seams are the routed Creation decision surface and Prompt-out lifecycle/current-packet surface. Use direct SQL/store checks only for persistence invariants that cannot be proven through HTTP/API behavior. The later `/to-prd` pass still owes its seam checkpoint.

`/to-prd` usage: consulted for house style only during this prep. It was not invoked, and no issue was published.

Likely label: `ready-for-agent` after `/to-prd` seam confirmation if the PRD body maps the browser-visible guidance checklist and leaves no open design decision about automatic row inference. Downgrade to `needs-triage` if the PRD chooses automatic NLP extraction, a new architecture seam, new ADR, or a multi-PRD program.

Principles, ADRs, specs, and prior PRDs/issues to cite:

- `reports/field-build-12-jon-urena-chrononaut.md`
- `reports/field-build-11-jon-urena-chrononaut.md`
- `reports/field-build-11-jon-urena-chrononaut-prd-prep.md`
- `reports/prd-321-creation-coverage-active-route-replay.md`
- `docs/worldbuilding-system/05_creation_protocol.md`
- `docs/worldbuilding-system/20_ai_assisted_workflow.md`
- `docs/specs/creation-flow.md`
- `docs/specs/prompt-out-context-assembly.md`
- `docs/specs/workflow-map-and-navigation.md`
- `docs/specs/browser-visible-guidance-acceptance.md`
- `docs/methodology-coverage.md`
- `docs/principles/README.md`
- `docs/principles/guided-workflow-usability.md`
- `docs/principles/workflow-principles.md`
- `docs/principles/canon-sovereignty.md`
- `docs/principles/data-principles.md`
- `docs/principles/domain-fidelity.md`
- ADR 0007, ADR 0008, ADR 0009
- PRD #321, #325, #326, #328, #336

Browser-visible guidance checklist mapping requirements:

| Checklist item | Future PRD home |
|---|---|
| package source cited | Preamble and Principles should cite Creation protocol, AI-assisted workflow, Creation flow spec, Prompt-out context spec, workflow-map spec, browser-visible guidance, and prior PRDs. |
| decision-point contract named | Problem/Solution/Implementation should name Creation `decomposition:coverage` as the affected decision point. |
| required, optional, skippable, and severity-dependent fields visible | In scope for coverage row label/summary, source kernel context, required flag, rationale/disposition fields after rows exist, and Prompt-out advisory modes. Admission severity is N/A because Creation does not assign it. |
| doctrine at the actual decision point | In scope. Empty inventory guidance must explain why seed-family coverage exists before Admission handoff. |
| prompt packet preview, source manifest, and cold external LLM test | In scope. Proposal and Pressure packets for missing inventory require source manifest, omission text, advisory/canon warning, and cold LLM proof. |
| advisory/canon separation visible | In scope. Prompt-out remains advisory and cannot create rows/dispositions/canon facts automatically. |
| skip path and reason storage | N/A unless implementation changes Prompt-out skip behavior; it should not. |
| blockers/substance validation | In scope for missing inventory, missing row labels, invalid kernel/report identity, unresolved rows, and stale action recovery. |
| current, next, and resume state | In scope. Creation stays current/owed while inventory is missing or unresolved, with Admission secondary. |
| read-side audit or provenance link | In scope after row confirmation and disposition; empty-state confirmation should lead to row readback and later row provenance/read-side trail. |
| cognitive walkthrough scenario | In scope. Use Field Build 12 route: reopen Jon world, enter coverage, create rows, load coverage Proposal/Pressure, and return to map. |

Canonical gates:

- `pnpm test`
- `pnpm typecheck`
- `pnpm build`

Focused likely gates:

- server Creation-flow tests for missing inventory confirm route, validation, row readback, and non-mutating reads;
- server Prompt-out tests for `decomposition:coverage` missing-inventory Proposal and Pressure packets;
- web Creation decision-surface tests for empty-inventory controls and validation recovery;
- web Prompt-out lifecycle/current packet tests if packet identity or preview behavior changes;
- workflow-map tests preserving #321 partial-decomposition priority;
- browser active-route replay for the Field Build 12 frontier.

Browser/cold-LLM evidence expectations:

- Active browser replay of the existing-world or equivalent fixture from Workflow map to Creation `decomposition:coverage`.
- Evidence that the empty inventory form can create initial rows and refresh into row-level controls.
- Evidence that Proposal and Pressure packets are visible/copyable current packets for the coverage decision, with source manifest and advisory warning.
- Console check with zero errors/warnings or explicit triage.
- Cold external LLM proof using exact Proposal and Pressure packets, showing the model treats missing inventory as the active task.

Source durability warnings and temporary-path handling:

- `reports/field-build-12-jon-urena-chrononaut.md`, `reports/field-build-11-jon-urena-chrononaut.md`, `reports/field-build-11-jon-urena-chrononaut-prd-prep.md`, and `reports/prd-321-creation-coverage-active-route-replay.md` are tracked, clean, and visible on `origin/main` at prep time.
- Do not cite temp field-build evidence paths from the report body in a published PRD. Summarize their conclusions or cite the tracked report.
- This prep file is new/untracked until committed and publication-ref visible. If `/to-prd` cites this file before that happens, mark it pending local publication or summarize it without durable-citation wording.

## Completion Self-Check

- `/to-prd` consulted for house style only: yes.
- Source artifact posture recorded: yes, Field Build 12 source report is tracked/clean/publication-ref-visible; temp evidence should be summarized.
- Authored artifact posture recorded: yes, new untracked prep artifact.
- Tracker freshness recorded: yes, no open issues and relevant closed PRDs/issues named.
- Selected first PRD recorded: yes, Creation coverage bootstrap and coverage-decision Prompt-out.
- Follow-on candidates recorded: yes, coverage row suggestion quality field trial and bootstrap ergonomics after real use.
- Recommended testing seam recorded: yes, existing Creation-flow HTTP/API, Prompt-out generation, web Creation decision surface, and active-route browser replay.
- Likely label and downgrade conditions recorded: yes.
- Canonical and focused gates recorded: yes.
- Browser-visible checklist mapping recorded: yes.
- Domain-model result recorded: yes, unchanged.

## Freshness And Boundaries

Refreshed in this session:

- `reports/field-build-12-jon-urena-chrononaut.md`.
- Relevant prior prep/report artifacts for Field Build 11 and PRD #321.
- `docs/worldbuilding-system/05_creation_protocol.md`.
- `docs/specs/creation-flow.md`.
- `docs/specs/prompt-out-context-assembly.md`.
- `docs/specs/workflow-map-and-navigation.md`.
- `docs/specs/browser-visible-guidance-acceptance.md`.
- `docs/methodology-coverage.md`.
- `docs/principles/README.md` and relevant principle files.
- ADR 0007, ADR 0008, and ADR 0009.
- Issue tracker state for open issues and relevant closed PRDs/issues.
- Current implementation surfaces in server Creation coverage, server Creation flow, web Creation surface, and relevant tests.

Not done:

- No app run, Playwright replay, product test, or cold-LLM rerun was performed during this prep. The task was PRD-ready determination from the report plus live repo/tracker reconciliation.
- No GitHub issue was created.
- No code or spec was changed.
- No methodology package, principle, ADR, or domain glossary edit was made.

Intentional file change:

- Added `reports/field-build-12-jon-urena-chrononaut-prd-prep.md`.
