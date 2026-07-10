# Field Build 14 PRD-Ready Determination: Covered Admission Currentness And Search Hardening

Source artifact: `reports/field-build-14-jon-urena-chrononaut.md`

Selected source sections: `Findings` entries `V-01` through `V-05`, `R-01`, and `F-01`; `Regression of prior findings`; `Decision-point log`; `For the app (PRD seeds)`; `For the methodology`; and `Frontier`.

Existing same-stem prep artifact classification: superseded and partially consumed. The previous version selected two independent candidates: first Admission pre-load Prompt-out preview currentness and second substrate search punctuation hardening. Live tracker and source now show both candidates were published and closed. This update replaces the stale publication recommendation with a covered/no-new-PRD determination.

Source durability status: durable local report. Current-session checks showed the source report is tracked, clean, and visible on `origin/main`. The report still summarizes machine-local field-build evidence, screenshots, prompt packets, API readbacks, cold-LLM outputs, and a world file; a future tracker artifact may summarize those conclusions but must not cite machine-local paths as stable sources.

Authored artifact status: this prep file was tracked, clean, and visible on `origin/main` before this update. This update intentionally makes the authored artifact dirty and pending local publication until committed and visible on the publication ref.

Primary evidence summarized: Field Build 14 report, current source around Admission Prompt-out pre-load currentness and substrate search, focused server/web tests present in the repo, exact GitHub issue readbacks for #328, #336, #338, #343, #344, #345, #346, and #347, and open-overlap searches for Field Build 14 Admission/search terms.

Live checkout snapshot: branch `main`, HEAD `bb82150`. Intake worktree status was clean. The Field Build 14 report itself records app commit `4487ce5`; this prep reconciles that older field-build observation against current HEAD.

Tracker freshness: refreshed on 2026-07-10. Open overlap search for Admission pre-load Prompt-out/currentness, Field Build 14, search punctuation, FTS5, and `FAC-` terms returned no open issues. Exact tracker readbacks show #343, #344, #345, #346, and #347 are closed; adjacent Field Build 11 coverage issues #328, #336, and #338 are also closed.

Deliverable status: PRD-ready determination only. No code, tracker issue, label, PRD publication, `/to-prd` seam checkpoint, methodology, principle, ADR, spec, or domain glossary mutation happened in this prep run.

External research: skipped. This is a repo/report/tracker reconciliation task; governing facts are local repo authorities plus GitHub tracker state.

## Reassessment Verdict

Field Build 14 is now coverage and validation, not a source of fresh product scope.

The report's five validation findings still stand as no-product-scope evidence:

1. The existing Jon world reopens at the Admission frontier.
2. Admission queue selection carries the governance boundary.
3. `FAC-3` queue/severity Prompt-out packets are self-contained in both modes after explicit load.
4. Severity declaration persists without admitting canon.
5. The prior loaded packet is clearly marked stale after severity changes the active decision.

The two app seeds from the report are now covered:

1. `R-01` / App Seed 1, Admission pre-load Prompt-out preview currentness, was published as PRD #343 with children #344 and #345. The issues are closed, and current source now renders pre-load Admission packet text as explicitly non-current with current packet actions disabled.
2. `F-01` / App Seed 2, search query punctuation hardening, was published as PRD #346 with child #347. The issues are closed, and current source now handles short-ID prefixes and safe FTS tokenization with focused server tests for `FAC-`, exact short IDs, punctuation, quotes, ordinary prose, empty input, and read-only preservation.

Recommended publication package: no new PRD now. A later `/to-prd` pass should not publish the old two-candidate package from this prep unless fresh replay proves a current regression. If replay contradicts the current source/tracker claims, reopen or publish only the contradicted scope.

Follow-on posture: verification/reopen candidates only. The Jon Urena full-gate frontier remains the next field-build work, but it is world-authoring frontier work rather than a product PRD seed from this report.

Supporting skill result: domain model unchanged. This prep uses the existing terms `Admission flow`, `Admission queue`, `Prompt-out step`, `Prompt packet`, `decision point`, `World file`, `short ID`, and read-side search from `CONTEXT.md` and repo authorities.

## Evidence Checked

| Finding or candidate | Status | PRD impact |
|---|---|---|
| `V-01` existing Jon world reopens at Admission frontier | validated/no product scope | Preserve as field-build evidence practice; no product issue. |
| `V-02` Admission queue selection carries governance boundary | validated/no product scope | Preserve no-default severity, source/origin links, and canon-debt warning. |
| `V-03` `FAC-3` queue/severity Prompt-out packets are self-contained | validated/no product scope | No packet-content PRD; explicit Proposal and Pressure load worked in the report. |
| `V-04` severity declaration persists without admitting canon | validated/no product scope | Preserve severity declaration as gate-depth selection only. |
| `V-05` stale prior packet is clearly marked after severity changes the decision | validated/no product scope | Acceptance baseline for closed #343/#344/#345; no remaining scope. |
| `R-01` selected Admission record shows pressure packet preview before explicit mode load | covered | Covered by closed #343/#344/#345 and current Admission source. No new PRD unless active-route replay contradicts current behavior. |
| `F-01` search endpoint 500s on `FAC-` | covered | Covered by closed #346/#347 and current search source/tests. No new PRD unless API replay contradicts current behavior. |
| App Seed 1 - Admission pre-load prompt preview currentness polish | covered | Same covered scope as `R-01`; old first-PRD recommendation is consumed. |
| App Seed 2 - Search query punctuation hardening | covered | Same covered scope as `F-01`; old follow-on recommendation is consumed. |
| Field Build 11 `P-01` stale secondary Prompt-out preview after correction/mode switch | covered | Closed #336/#337/#338 targeted and closed this Creation current-packet replay family. |
| Field Build 11 `F-02` duplicate narrowing-note correction contexts | covered | Closed #328/#329/#330 targeted and closed the correction-note visibility/idempotence family. |
| Field Build 13 open findings | validated/no product scope | Report says none; no reopening from Field Build 14. |
| `For the methodology` | validated/no product scope | No methodology source change proposed by Field Build 14 and no contradiction found in current authorities. |
| Frontier: resume at `FAC-3` full gate before `FAC-2` | coverage follow-up | Field-build/world-authoring frontier only; not a product PRD seed by itself. |

Current source checks:

- `packages/server/src/admission-flow.ts` now builds pre-load Admission prompt text with "No selected-mode Admission Prompt packet is loaded yet" and an explicit non-current warning. The preview currentness state is `not_loaded`, loaded mode is `null`, current packet actions are disabled, and the load action tells the steward to choose Proposal or Pressure then load the step.
- `packages/web/src/main.tsx` renders `preview.currentness` beside selected/loaded mode information and still renders packet/source manifest/context/advisory warning through the shared prompt preview component.
- `packages/web/src/main.tsx` still derives `admissionPromptStepRequest` from the selected Admission prompt mode and binds loaded Admission packet identity to `flowKey: "admission"` plus the active step key.
- `packages/server/src/world-file.ts` now recognizes short-ID-like queries with a short-ID pattern, uses exact or prefix lookup for those, tokenizes other search text to quoted FTS tokens, and returns an empty result for punctuation-only input that has no safe FTS tokens.
- `packages/server/src/http/substrate-routes.ts` continues to expose `/api/search` through the world search operation; the hardened behavior lives below the route.
- `packages/server/test/world-file.test.ts` and `packages/server/test/app.test.ts` include coverage for `FAC-`, `FAC-1`, missing short-ID prefixes, empty and whitespace queries, punctuation-only input, dangling quotes, ordinary prose, title/body/report search, and read-only preservation.

Tracker overlap and consumption:

- #343 `PRD: Admission pre-load Prompt-out preview currentness` is closed. Its child issue map names #344 and #345. Its closeout records final SHA `bcfaa7b...`, focused server/web tests, `pnpm test`, `pnpm typecheck`, and `pnpm build`.
- #344 `Admission pre-load Prompt-out currentness guard` is closed and owns the implementation guard plus focused tests for pre-load/current/stale states.
- #345 `Field Build 14 Admission Prompt-out active-route replay and closeout` is closed and owns active-route proof for the Field Build 14 Admission path.
- #346 `PRD: Substrate search punctuation hardening` is closed. Its closeout records final SHA `efc9c75...`, focused server search tests, server package test/typecheck/build, `pnpm test`, and `pnpm typecheck`.
- #347 `Substrate search punctuation and short-ID prefix hardening` is closed and owns the server/API search behavior behind #346.
- #328 is closed and covers Field Build 11 duplicate narrowing-note correction contexts.
- #336 and #338 are closed and cover Field Build 11 current-packet active-route replay.
- Open overlap search for Field Build 14 Admission/search terms returned `[]`, so there is no current open duplicate found by the checked terms.

## Authority Findings

No upstream methodology, principle, ADR, spec, domain glossary, or tracker-convention change is owed from this prep.

Existing authorities that continue to govern the covered Admission currentness family:

- `CONTEXT.md` defines `Admission flow`, `Admission queue`, `Prompt-out step`, `decision point`, and `Prompt packet`; the closed work uses those terms without needing a glossary change.
- `docs/specs/admission-flow.md` binds queue selection to `admission_queue_severity` / `admission.queue-severity`, says severity is undeclared until steward declaration, and says Admission prompts must not assign final severity, canon standing, truth layer, status, operations, or automatic admission.
- `docs/specs/prompt-out-context-assembly.md` says the prompt packet and screen context are two renderings of one assembly, and loaded Prompt-out status is scoped to exact packet origin including flow, step, mode, selected record, and Admission severity context.
- `docs/specs/browser-visible-guidance-acceptance.md` requires active-route proof for field-build blockers, including current/stale state, prompt packet proof, source manifest, advisory/canon warning, and explicit non-mutation when Prompt-out is involved.
- `docs/principles/canon-sovereignty.md` W-1 keeps Prompt-out optional and advisory, with Proposal and Pressure modes and no automatic canon adoption.
- `docs/principles/workflow-principles.md` W-1 says Prompt-out is part of the decision point, with available modes, role/framing, packet preview, advisory/canon warning, and context omissions before copy-out.
- `docs/principles/guided-workflow-usability.md` W-8/W-9 require the browser decision surface and prompt packet to carry the current decision without forcing hidden API inspection.
- ADR 0006 keeps Admission policy server-owned; ADR 0007 keeps Prompt-out mechanics server-owned; ADR 0009 keeps the browser as a renderer of server-owned guided-flow policy.

Existing authorities that continue to govern the covered search hardening family:

- `docs/specs/schema-v1.md` defines app-minted short IDs such as `FAC-1` and includes full-text search in the walking skeleton acceptance surface.
- `docs/principles/data-principles.md` W-5 keeps records viewable across read surfaces, and T-3 says identifiers are the app's job; short-ID-like lookup text is ordinary app input.
- ADR 0001 owns SQLite/FTS5 as the world-file search substrate.
- ADR 0004 owns the TypeScript/Hono/React/better-sqlite3 stack and Vitest testing surface.

No new ADR is warranted. The current covered behavior affirms the existing boundaries rather than changing them.

## Recommended First PRD

### No New PRD Recommended

Purpose: avoid duplicate tracker work after Field Build 14's two app seeds have already been converted into PRDs/issues and closed.

Sources:

- Field Build 14 report, now durable as a tracked/clean/origin-visible repo file.
- Current source checks listed above.
- Closed #343/#344/#345 for Admission pre-load Prompt-out currentness.
- Closed #346/#347 for substrate search punctuation and short-ID prefix hardening.
- Closed #328/#336/#338 for carried Field Build 11 context.
- Repo authorities listed in `Authority Findings`.

Problem:

The previous same-stem prep artifact was accurate for its earlier moment, but it is stale now. Leaving a first-PRD recommendation in place would invite `/to-prd` to republish already-closed work.

Recommended product rule or seam:

No product rule change is recommended from this report at current HEAD. Treat Field Build 14 `R-01` and `F-01` as closed unless a new replay shows current source diverges from the closed issue acceptance.

Scope:

- Preserve this updated determination as the current same-stem prep posture.
- Do not publish a duplicate Admission pre-load Prompt-out PRD.
- Do not publish a duplicate substrate search punctuation PRD.
- If future evidence contradicts current source/tracker claims, open a verification/reopen candidate against only the contradicted route.

Acceptance for this prep:

- Every Field Build 14 finding and seed has a status.
- The stale prior recommendation is explicitly superseded.
- Tracker freshness names the exact closed issues and the no-open-overlap search.
- Source durability and authored-artifact posture are recorded.
- A later `/to-prd` pass can see that no new PRD is currently recommended without rereading the entire report.

Likely issue slices: none.

Out of scope:

- Code changes.
- Tracker issue creation, labels, comments, or closures.
- `/to-prd` seam confirmation.
- Replaying the app or rerunning product tests.
- Reopening closed issues without fresh contradictory evidence.
- Admission full-gate world authoring for `FAC-3`; that remains field-build frontier work, not a PRD seed by itself.

## Follow-On Candidates

### Verification/Reopen Candidate: Admission Currentness Replay

Purpose: use only if a future active-route replay shows the current Admission route still exposes a wrong-current pre-load packet or regresses stale prior-origin handling.

Sources: Field Build 14 `R-01`, closed #343/#344/#345, current Admission source, and `docs/specs/browser-visible-guidance-acceptance.md`.

Problem: no current problem is confirmed. This candidate exists only to avoid reopening closed work from stale prep text.

Recommended rule or open design point: if replay fails, target the exact failing Admission route and currentness state. Do not reopen Prompt-out architecture broadly unless the failure crosses routes.

Scope: active routed Admission decision surface, selected Admission record, selected mode, loaded mode, pre-load currentness state, Proposal and Pressure load, severity declaration, stale prior-origin state, advisory/canon warning, source manifest, and explicit non-mutation.

Acceptance: replay either confirms current source and leaves no issue, or captures a current failing route with enough evidence to triage a focused reopen.

### Verification/Reopen Candidate: Search Punctuation API Replay

Purpose: use only if a current API replay shows `/api/search?q=FAC-` or other recoverable punctuation input still returns an unstable failure.

Sources: Field Build 14 `F-01`, closed #346/#347, current search source and tests, `docs/specs/schema-v1.md`, and `docs/principles/data-principles.md`.

Problem: no current problem is confirmed. Current source and tests cover the reported failure.

Recommended rule or open design point: if replay fails, target route/search behavior for the failing input class while preserving read-only behavior and ordinary prose search.

Scope: `/api/search`, short-ID prefix/exact lookup, safe FTS tokenization, malformed punctuation handling, stable response shape, and read-only preservation.

Acceptance: replay either confirms stable non-500 responses and leaves no issue, or captures the current failing input plus response/log evidence for a focused reopen.

## Coverage Follow-Up

Field-build continuation should resume the Jon Urena world at Admission `FAC-3` full gate before `FAC-2`. That is methodology/world-authoring frontier coverage, not product scope from this prep.

Useful coverage checks before opening more product scope:

- Active-route Admission replay confirms pre-load state is non-current or suppressed, Proposal and Pressure produce current packets, and severity transition still marks the prior packet stale.
- Search API replay confirms `FAC-`, `FAC-1`, missing prefixes, empty input, punctuation-only input, dangling quote text, and ordinary prose return stable read-only results.
- Full-gate field build records whether the app now carries enough method guidance for `FAC-3` without relying on external docs.

These checks become product work only when they expose current behavior that contradicts closed issue acceptance or repo authorities.

## Rejected Or No-Op Alternatives

- Publish the old Admission first PRD recommendation. Rejected because #343/#344/#345 are closed and current source reflects the non-current pre-load guard.
- Publish the old search follow-on recommendation. Rejected because #346/#347 are closed and current source/tests cover the reported `FAC-` failure class.
- Bundle Admission currentness and search hardening into a new PRD. Rejected because they were independent scopes and are both already closed.
- Reopen #343 or #346 from stale prep text alone. Rejected because exact tracker readbacks and current source support covered status; reopen needs fresh contradictory replay.
- Treat all Field Build 14 findings as product work. Rejected because `V-01` through `V-05` are validation evidence and the report's methodology section proposes no docs change.
- Add methodology, principle, ADR, or glossary changes. Rejected because existing authorities already govern the behavior and no contradiction was found.
- Cite machine-local field-build evidence in a future PRD. Rejected because machine-local evidence should be summarized, not cited as durable source material.

## PRD Publication Inputs

Suggested title: none. No new PRD is recommended at current HEAD.

Publication package: no package now. The previous "first PRD plus deferred follow-on" package is consumed by closed #343/#344/#345 and #346/#347.

Recommended testing seam and seam checkpoint:

- No `/to-prd` seam checkpoint is owed because no PRD publication is recommended.
- If Admission currentness reopens, reuse existing server Admission/Prompt-out decision-point seams, the routed web Admission decision surface, and active-route browser evidence for the Field Build 14 route.
- If search hardening reopens, reuse server HTTP/API route tests against temp-file worlds plus focused world-file search tests where fallback/tokenization lives.

`/to-prd` usage: consulted for house style only during this prep. It was not invoked, no body was drafted, no issue was staged or published, and no seam checkpoint was run.

Likely label and downgrades:

- No label now because no issue is recommended.
- A future Admission reopen could be `ready-for-agent` only if current failing evidence is concrete, the browser-visible guidance checklist is mapped, and the fix reuses existing seams. Downgrade to `needs-triage` if the failure implies a broader Prompt-out architecture decision or the evidence is ambiguous.
- A future search reopen could be `ready-for-agent` only if the failing input/response is concrete and the desired fallback/validation behavior is specified. Downgrade to `needs-triage` if the product behavior choice is unresolved.

Issue-tracker and triage-label docs consulted: `docs/agents/issue-tracker.md` and `docs/agents/triage-labels.md`. The browser-visible checklist applies to any future guided-flow/Prompt-out Admission reopen and is generally N/A for server-only substrate search unless browser search behavior changes.

Authorities to cite if reopened:

- Admission currentness: `docs/specs/admission-flow.md`, `docs/specs/prompt-out-context-assembly.md`, `docs/specs/browser-visible-guidance-acceptance.md`, `docs/worldbuilding-system/20_ai_assisted_workflow.md`, `docs/principles/README.md`, `docs/principles/canon-sovereignty.md`, `docs/principles/workflow-principles.md`, `docs/principles/guided-workflow-usability.md`, `docs/principles/data-principles.md`, `docs/principles/domain-fidelity.md`, ADR 0006, ADR 0007, ADR 0009, and closed #343/#344/#345.
- Search hardening: `docs/specs/schema-v1.md`, `docs/principles/README.md`, `docs/principles/data-principles.md`, `docs/principles/domain-fidelity.md`, ADR 0001, ADR 0004, and closed #346/#347.

Browser-visible guidance checklist needs:

- Admission reopen: package source cited; decision-point contract named; selected/loaded/currentness fields visible; doctrine at point of use; prompt packet preview and source manifest; advisory/canon separation; blockers/currentness validation; current/next/resume state; read-side/provenance or explicit non-mutation; and a cognitive walkthrough of selecting a proposed Admission record, loading modes, declaring severity, and seeing stale prior-origin state.
- Search reopen: N/A unless browser task grammar or validation copy changes. If it changes, add stable recovery-text acceptance and read-only proof.

Canonical gates for any future implementation:

- `pnpm test`
- `pnpm typecheck`
- `pnpm build`

Focused likely gates if reopened:

- Admission currentness: focused server Admission/Prompt-out tests, focused web Admission decision-surface tests, active-route browser evidence, and root gates before closeout because the work crosses server/web behavior.
- Search hardening: focused server route/world-file tests and server typecheck/build; root gates before closeout if workflow/package or cross-package surfaces change.

Evidence expectations:

- Admission currentness: active browser route proof, selected record, selected mode, loaded mode, current/non-current/stale state, packet body/source manifest/omissions/advisory warning, current actions disabled/enabled as appropriate, explicit non-mutation, and console state.
- Search hardening: API readbacks for exact failing inputs, stable status/shape, returned short-ID records where expected, ordinary search preservation, and read-only table/record-count preservation where relevant.

Source durability warnings and temporary-path handling:

- `reports/field-build-14-jon-urena-chrononaut.md` is durable in the current checkout, but its embedded machine-local evidence remains summarized, not cited.
- This updated prep artifact is dirty/pending local publication until committed and visible on the publication ref.
- Future PRD bodies should cite durable specs, principles, ADRs, and issue numbers rather than machine-local field-build artifacts.

## Completion Self-Check

- `/to-prd` consulted for house style only: yes.
- Source artifact posture recorded: yes; source report is tracked, clean, and publication-ref visible, with embedded machine-local evidence summarized only.
- Authored artifact posture recorded: yes; this update is pending local publication until committed and visible on the publication ref.
- Existing same-stem prep artifact classified: yes; superseded and partially consumed.
- Tracker freshness recorded: yes; no open overlap by checked terms, and exact closed issues named.
- Every finding and report seed assigned a status: yes.
- Selected first PRD or verdict recorded: yes; no new PRD recommended now.
- Follow-on candidates recorded: yes; verification/reopen candidates only.
- Recommended testing seams recorded for future reopen only: yes.
- Likely labels and downgrade conditions recorded for future reopen only: yes.
- Issue-tracker and triage-label docs consulted: yes.
- Canonical and focused gates recorded: yes.
- Browser-visible checklist mapping recorded for future Admission reopen and N/A posture for search: yes.
- Machine-local path leakage avoided except summarized durability warnings: yes.

## Freshness And Boundaries

Refreshed in this session:

- `reports/field-build-14-jon-urena-chrononaut.md`.
- The pre-existing `reports/field-build-14-jon-urena-chrononaut-prd-prep.md`.
- `.claude/skills/field-build-prd-prep/SKILL.md`.
- `.claude/skills/to-prd/SKILL.md` for house style only.
- `.claude/skills/grilling/references/prd-ready-determination-artifact.md`.
- `docs/agents/issue-tracker.md` and `docs/agents/triage-labels.md`.
- `CONTEXT.md` and `docs/agents/domain.md`.
- `docs/principles/README.md` and relevant principle files.
- `docs/specs/admission-flow.md`, `docs/specs/prompt-out-context-assembly.md`, `docs/specs/browser-visible-guidance-acceptance.md`, and `docs/specs/schema-v1.md`.
- ADR 0001, ADR 0004, ADR 0006, ADR 0007, and ADR 0009.
- Current implementation surfaces in Admission flow, Prompt-out preview rendering, substrate search route, world-file search, and focused tests.
- GitHub tracker state for open overlap and exact closed issues #328, #336, #338, #343, #344, #345, #346, and #347.

Not done:

- No app run, Playwright replay, product test, or cold-LLM rerun was performed during this prep. The task was PRD-ready determination from the report plus live repo/tracker reconciliation.
- No GitHub issue was created, edited, labeled, commented on, or closed.
- No code or spec was changed.
- No methodology package, principle, ADR, or domain glossary edit was made.
- No `/to-prd` seam checkpoint happened.

Pre-existing worktree dirt at intake: none.

Intentional file change:

- Updated `reports/field-build-14-jon-urena-chrononaut-prd-prep.md`.
