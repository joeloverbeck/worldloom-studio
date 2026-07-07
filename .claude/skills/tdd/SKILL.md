---
name: tdd
description: Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
---

# Test-Driven Development

TDD is the red → green loop. This skill is the reference that makes that loop produce tests worth keeping: what a good test is, where tests go, the anti-patterns, and the rules of the loop. Every section applies on every cycle — consult them before and during the loop, not after.

When exploring the codebase, read `CONTEXT.md` (if it exists) so test names and interface vocabulary match the project's domain language, and respect ADRs in the area you're touching.

Before the first red test, record whether `CONTEXT.md` exists and was read, and note any ADRs or principle docs that shape the test vocabulary or seam choice.

Use this preflight before writing the first red test:

```markdown
TDD preflight:
- CONTEXT.md status: <read / absent / N/A>
- ADRs/principles/docs status: <ADRs/principles/docs read or N/A>
- Agreed seams: <issue/PRD-stated seams restated / user-confirmed seams / confirmation needed>
- Row plan: <red-first seams>; <no-runnable criteria>; <evidence-only browser/manual seams>
- Shared-boundary table stub: <created before first red test / N/A>; <every in-scope issue has a row or exceptions named>
- User confirmation needed: <yes/no, and why>
```

Shared-boundary pre-red hard stop: when the work covers multiple issues, one PRD with child issues, or one implementation boundary shared by several acceptance rows, paste the compact evidence table immediately below the preflight before any red command. A prose row plan is not enough. Mark each row as `red-first`, `existing contract-change expectation`, `static contract check + browser evidence`, `no-runnable`, or `evidence-only`; if the table is genuinely N/A, name the exception in the `Shared-boundary table stub` field before proceeding.

For shared-boundary issue families, paste this compact evidence table stub before the first red test; do not substitute a prose-only row plan. The red and green cells can be `TBD` while work is still in progress, but every in-scope issue and agreed seam must already have a row with a `red-first`, `no-runnable`, or `evidence-only` classification.

```markdown
| Issue | CONTEXT.md status | ADRs/principles/docs status | Seam | Red command/failure | Green command or evidence | Acceptance covered | Review fix / red-first skip reason |
|---|---|---|---|---|---|---|---|
| #N | <read / absent / N/A> | <ADRs/principles/docs read or N/A> | <red-first / existing contract-change expectation / static contract check + browser evidence / no-runnable / evidence-only seam> | <command plus expected failure / partial red - wrong reason / N/A / explicit skip reason / TBD> | <passing command / browser route-action-result / artifact path / N/A / TBD> | <criterion or checkbox> | <N/A / review-fix evidence / partial-red follow-up / red-first skip reason> |
```

When the repo `implement` skill owns the surrounding workflow, keep this table or equivalent fields in the implementation ledger before review and carry them into the final closeout sink before tracker mutation. Do not wait until closeout pressure to reconstruct TDD evidence from prose-only command notes.

When the TDD evidence is being drafted in a file, run `node .claude/skills/tdd/scripts/validate-tdd-closeout-body.mjs <body.md>` before review, pre-close audit, or tracker mutation. Add `--parent-rollup` for 4+ child issues using a parent PRD rollup. If the evidence exists only in conversation or a tracker UI, apply the same checks manually and say the validator was N/A because no local body file existed.

Non-bypassable TDD closeout gate:

- Before handing work to review, inspect an interim durable audit sink that preserves TDD evidence for review. This can be the conversation, implementation ledger, or a body draft if the final parent rollup or closeout body cannot exist yet.
- Before a pre-close audit, issue closure, parent PRD closeout, or the repo `implement` skill's closeout gate, inspect the final durable closeout sink or body that will be posted or linked.
- Both the interim and final durable sinks must contain the compact table below or equivalent explicit fields: issue(s), `CONTEXT.md` status, ADRs/principles/docs status, seam, red command/failure or skip reason, green command/evidence, and acceptance covered.
- Structural table check: report `compact table/header present` only when the exact compact TDD table header is present in the sink. Report `equivalent fields present` only when every in-scope issue/seam entry explicitly carries the same minimum fields: issue(s), `CONTEXT.md` status, ADRs/principles/docs status, seam, red command/failure or skip reason, green command/evidence, and acceptance covered. Keyword hits alone do not satisfy this check.
- Row-content check: every `Red command/failure` cell must contain a concrete red command plus failure signal, an explicit `N/A because ...` or `red-first skipped because ...` reason, `partial red - wrong reason: ...`, `coverage-only review fix ...`, `existing contract-change expectation`, or a named shared-red-command reference. Summaries such as "covered by lifecycle assertions" or "initial tests failed before the feature existed" are not red evidence unless they cite the exact failing command or linked shared command.
- Four-column summary tables are not compact TDD evidence. A table like `| Issue | Seam | Red-first status | Green verification |` is a summary only; it cannot justify `compact table/header present`, and it is not `equivalent fields present` unless every row separately carries the missing `CONTEXT.md` status, ADRs/principles/docs status, red command/failure or skip reason, and acceptance-covered fields. For 4+ child issues using a parent PRD rollup, use the parent-rollup-ready eight-column table below in the final rollup or link an adjacent durable sink that contains it.
- Make the literal `TDD evidence gate passed:` line visible in the conversation, implementation ledger, or durable audit sink. If any field is missing or only implied, stop and add it before leaving the TDD loop.
- Do not write or accept the shorthand `TDD evidence gate passed: yes`. The gate line must be the full fielded sentence shown below, including `durable sink`, `compact table/header`, `seams accounted for`, `CONTEXT.md status`, `ADRs/principles/docs status`, partial-red or skip-reason status, and evidence-only row status. Do not write `compact table/header present` unless the structural table check above is true.
- Body-check token sweep: before declaring the gate satisfied, grep or visually verify that the durable sink contains `TDD closeout preflight`, `TDD evidence gate passed: durable sink`, `compact table/header`, `seams accounted for`, `CONTEXT.md status`, `ADRs/principles/docs status`, `partial-red / red-first skip reasons`, and `evidence-only rows`; then perform the structural table check. The token sweep is a locating aid, not proof by itself. When a local body file exists, run the validator command above and fix any reported structural error before declaring the gate satisfied.
- When `implement` owns the surrounding workflow, copy or link the interim TDD evidence into the same final parent rollup, issue comment, or body file that carries implementation closeout evidence before the pre-close audit, issue closure, or parent PRD closeout. A verification section that lists red/green commands is not equivalent unless it also names the issue/seam rows, `CONTEXT.md` status, ADRs/principles/docs status, skip or partial-red reasons, and evidence-only freshness.

Tracker mutation hard stop: before any issue closure, parent PRD closeout, or the repo `implement` skill's closeout gate, inspect the final body that will be posted or linked. Stop unless it passes the structural table check and contains the exact full `TDD evidence gate passed: durable sink ...` line with `CONTEXT.md status`, `ADRs/principles/docs status`, partial-red / red-first skip reasons, and evidence-only rows.

## What a good test is

Tests verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't. A good test reads like a specification — "user can checkout with valid cart" tells you exactly what capability exists — and survives refactors because it doesn't care about internal structure.

See [tests.md](tests.md) for examples and [mocking.md](mocking.md) for mocking guidelines.

## Seams — where tests go

A **seam** is the public boundary you test at: the interface where you observe behavior without reaching inside. Tests live at seams, never against internals.

**Test only at pre-agreed seams.** Before writing any test, write down the seams under test and confirm them with the user. No test is written at an unconfirmed seam. You can't test everything — agreeing the seams up front is how testing effort lands on the critical paths and complex logic instead of every edge case.

If a PRD or issue explicitly names proof seams, those count as pre-agreed after you restate them in the implementation ledger. Ask the user only when the seam is absent, ambiguous, or conflicts with the codebase's actual public interfaces.

When seam confirmation is needed, ask: "What's the public interface, and which seams should we test?"

Static/source-level contract checks are exceptional. Use them only when an explicit acceptance criterion names a forbidden or required source contract, such as a route string, import, schema key, or generated artifact path. Label the evidence as a static contract check, keep the expected value tied to the spec, and pair it with a public behavior test or browser smoke when the feature is user-visible.

Do not use source-file string checks merely to automate browser-visible UI acceptance. For visible UI behavior, use a public UI/rendered DOM test or evidence-only browser smoke unless the acceptance criterion names a source-level contract.

When writing a static contract check, target the smallest source construct that proves the contract. Avoid whole-file regex spans that can cross unrelated regions or match incidental text. After the red run, confirm the failure names the intended forbidden or required contract rather than a broader accidental match.

When a static contract check is paired with browser proof, label the compact-table `Seam` cell as `static contract check + browser evidence`. Put the failing source-level contract command in `Red command/failure`, and put both the passing focused command and the browser route/action/artifact in `Green command or evidence`.

## Anti-patterns

- **Implementation-coupled** — mocks internal collaborators, tests private methods, or verifies through a side channel (querying the database instead of using the interface). The tell: the test breaks when you refactor but behavior hasn't changed.
- **Tautological** — the assertion recomputes the expected value the way the code does (`expect(add(a, b)).toBe(a + b)`, a snapshot derived by hand the same way, a constant asserted equal to itself), so it passes by construction and can never disagree with the code. Expected values must come from an independent source of truth — a known-good literal, a worked example, the spec.
- **Horizontal slicing** — writing all tests first, then all implementation. Bulk tests verify _imagined_ behavior: you test the _shape_ of things rather than user-facing behavior, the tests go insensitive to real changes, and you commit to test structure before understanding the implementation. Work in **vertical slices** instead — one test → one implementation → repeat, each test a **tracer bullet** that responds to what the last cycle taught you.

Shared-boundary red-command hard stop: for shared-boundary issue families, do not run the first broad or shared-boundary red command until the compact evidence table stub is visible in the conversation, implementation ledger, or durable scratchpad. The stub must have one row per in-scope issue and agreed seam, or an explicit exception/clarification for each missing seam. A prose-only row plan is not enough.

## Rules of the loop

- **Red before green.** Write the failing test first, then only enough code to pass it. Don't anticipate future tests or add speculative features.
- **Bootstrap red is not behavior red.** A focused command that fails only because the intended test file does not exist (for example, `no test files found`) can seed the loop only as `bootstrap red`. Before implementing behavior, follow it with the smallest failing assertion for the agreed seam, or record an explicit red-first skip reason if a true assertion red is impossible. Do not report a missing-test-file failure as proof that the behavior contract went red.
- **Review findings restart the loop.** If review reveals missing behavior after the implementation is already green, add or adjust the smallest assertion first and run it red before fixing. If the code was already fixed to protect the tree or unblock verification, record that red-first was skipped and why. A review-fix evidence row that says only `fixed and covered` is not enough; it must include the red command/failure or an explicit `red-first skipped because ...` reason.
- **Wrong-reason red is only partial red.** If a red command for a review fix fails because of a missing file, a generic invariant, an unrelated assertion, or any reason that does not prove the intended behavior is wrong, record `partial red - wrong reason: <reason>`, then add or adjust the smallest assertion that fails for the intended behavior before patching. If no intended-behavior red is possible, record an explicit `red-first skipped because ...` reason.
- **Unexpected green can be wrong-surface coverage.** If a new or adjusted assertion passes before the intended behavior fix, pause before counting it as proof. Verify the assertion observes the intended public route, panel, action, or source construct, not a legacy surface, nearby component, broad HTML/source span, or incidental text. If the assertion was too broad, tighten it and run again until it fails for the intended missing behavior; record `coverage-only review fix` only after confirming the behavior already truly exists.
- **Coverage-only review fixes are different from behavior fixes.** If review reveals missing proof or coverage, but the behavior already exists, add the smallest assertion and run it. If it passes without a code change, record `coverage-only review fix; red-first N/A because behavior already existed and no code changed`. If it fails, treat the finding as missing behavior and restart the red → green loop.
- **TDD review-fix addendum.** When review creates a TDD row or changes an existing one, paste this compact addendum into the implementation ledger, review fallback block, or final closeout sink. Equivalent fields are acceptable only when the same durable sink explicitly contains all five field labels below (`Finding:`, `Intended red command/failure:`, `Green command/evidence:`, `Updated TDD table row:`, and `Browser/manual freshness:`) and links or names the updated compact-table row.

  ```markdown
  TDD review-fix addendum:
  - Finding: <review finding title/source>
  - Intended red command/failure: <command and failure / partial red - wrong reason plus follow-up intended red / red-first skipped because ... / coverage-only review fix because ...>
  - Green command/evidence: <passing command / browser/manual evidence / artifact>
  - Updated TDD table row: <issue/seam row updated or linked>
  - Browser/manual freshness: <rerun result / not affected because changed path is outside the evidence-only route/action/API/fixture and targeted proof for changed path passed / N/A because no UI/routes/browser-consumed API/fixtures/action path changed / blocked because ...>
  ```

- **Evidence freshness after review fixes.** After review fixes or any later edit, compare the final changed files against evidence-only browser/manual rows before closeout. If a changed file touches a route, UI action, browser-consumed API shape, fixture, or data setup covered by one of those rows, rerun that evidence on the final tree. If a behavior-changing UI edit is outside the evidence-only route/action path, record `Evidence freshness: not affected because ...` only when you name the changed path, explain why the evidence-only route/action path and browser-consumed API/fixtures were untouched, and rerun targeted proof for the changed path. Record `Evidence freshness: <rerun command/artifact/result>`, `Evidence freshness: not affected because ...`, or `Evidence freshness: N/A because ...`; stale or blocked evidence must be explicit.
- **Record the loop.** For each slice, keep lightweight evidence of the red command and expected failure, then the green command. If red-first is skipped, say why. For focused commands, check the output confirms the intended file, seam, or assertion actually ran; if a package script does not forward file arguments cleanly, invoke the underlying runner directly.
- **Existing-test failures after intended contract changes are regression evidence.** If an existing test fails after an intended behavior, schema, route, or artifact contract changes, record the failing command before editing the test. Update the expectation only when the spec, issue, or worked example authorizes the new behavior; otherwise fix the implementation. Rerun the focused command and any broader gate that exposed the failure. In the compact evidence table, put the failing existing-test command in `Red command/failure` for the affected seam, or use a dedicated `existing contract-change expectation` row when the failure spans several acceptance rows. Reserve `Review fix / red-first skip reason` for review findings, coverage-only review fixes, and explicit red-first skips.
- **Docs-only and no-runnable criteria stay explicit.** If an acceptance criterion is a document deliverable, review/conformance claim, or otherwise has no runnable public seam, do not invent a test seam. Record red and green as `N/A`, cite the review/conformance evidence, and carry the no-runnable reason in the compact evidence table.
- **Browser/manual evidence can be evidence-only.** If acceptance requires browser-visible, manual, screenshot, walkthrough, or other evidence that is not itself a red-first automated seam, record it as an evidence-only row instead of forcing a fake failing test. Set red to `N/A` or an explicit red-first skip reason, and record the browser route, action path, observed outcome, artifact path, or walkthrough result in the green/evidence field. For dense app screens or long single-page snapshots, keep evidence bounded: prefer targeted DOM/text assertions, concise excerpts, and screenshots over full-page snapshot dumps. If later edits touch a route, UI action, browser-consumed API shape, fixture, or data setup covered by an evidence-only row, rerun the evidence on the final tree or record an explicit stale/blocked reason before closeout. If a later behavior-changing UI edit is outside the evidence-only route/action path, `not affected` is acceptable only when the closeout names the changed path, explains why the evidence route/action path and browser-consumed API/fixtures were untouched, and reruns targeted proof for the changed path.
- **One slice at a time.** One seam, one test, one minimal implementation per cycle. When a vertical slice legitimately spans several public seams, write the smallest tracer-bullet test at each seam, keep the issue/audit mapping explicit, and avoid bulk tests that are not tied to an acceptance criterion.
- **Shared-boundary issue families still need tracer bullets.** When PRD child issues share one implementation boundary and separate red-green cycles would be artificial, write the smallest red tracer at each agreed seam, record the red failures by seam and issue, then implement the shared boundary while keeping the acceptance mapping explicit.
- **Inventory shared-boundary seams before broad red tests.** Before writing the first broad tracer for a shared-boundary issue family, list every agreed seam and mark each one as `red-first`, `no-runnable`, or `evidence-only`. Instantiate the compact evidence table stub before the first red test: one row per in-scope issue and agreed seam, with `TBD` allowed only in command/evidence cells that cannot exist yet. Use that inventory as the row plan for the compact evidence table; if a seam cannot be classified, stop and clarify the seam before writing tests.
- **Shared-boundary closeout hard stop.** Do not enter closeout for a shared-boundary issue family until the compact evidence table below has one row per agreed seam, or an explicit red-first skip reason is recorded for each seam that could not reasonably go red first.
- **Implementation closeout consumes the TDD table.** When the repo `implement` skill owns the surrounding workflow, preserve the compact TDD evidence table in the implementation ledger or another interim durable sink before review, then carry the same fields into the pre-close audit or final closeout sink before tracker mutation. Immediately before the pre-close audit, either post a short `TDD evidence` block or explicitly carry the TDD fields into the audit evidence. Put that table or block in the same durable sink as the pre-close audit, or directly adjacent to it with an explicit link or citation; do not rely on earlier prose-only red/green notes surviving context compaction. The minimum evidence is: issue or issues, `CONTEXT.md` status or `N/A`, ADRs/principles/docs status or `N/A`, seam, red command and expected failure or skip reason, and green command or evidence. If a seam has no row, add the explicit red-first skip reason before leaving the TDD loop.
- **TDD evidence artifact stop.** Before the pre-close audit, issue closure, or parent PRD closeout, inspect the actual durable closeout body that will be posted or linked. It satisfies this skill only when it contains the compact table header row below, or when every entry explicitly carries the same minimum fields: issue(s), `CONTEXT.md` status, ADRs/principles/docs status, seam, red command/failure or skip reason, green command/evidence, and acceptance covered. Prose-only red/green bullet lists do not satisfy this stop, even if the commands are present.
- **TDD closeout preflight.** Before handing off to review, fill and paste this block in the conversation, implementation ledger, or other interim durable sink. Before a pre-close audit, issue closure, or parent PRD closeout, paste or update it in the final closeout audit or body. This block is only the checklist for the gate; it is not the compact evidence table. Do not proceed until the compact table or equivalent per-row fields are adjacent or explicitly linked, and the `TDD evidence gate passed:` line is present immediately under the preflight.

  ```markdown
  TDD closeout preflight:
  - Durable sink/body inspected: <conversation/comment URL/issue reference/body file inspected pending tracker URL>
  - Compact table/header: <present after structural check/equivalent fields present after structural check/missing>
  - Rows accounted for: <all in-scope issues and seams listed / exceptions named>
  - CONTEXT.md status: <present/absent/N/A>
  - ADRs/principles/docs status: <present/N/A>
  - Partial-red / red-first skip reasons: <none/listed>
  - Evidence-only rows freshness: <none/listed with Evidence freshness rerun/not affected/blocked result>
  ```

- **TDD evidence gate line.** After inspecting the current interim sink or final closeout body and before leaving the TDD loop for review or closeout, write this literal line in the conversation, implementation ledger, or closeout audit:

  `TDD evidence gate passed: durable sink <conversation/comment URL/issue reference/body file inspected pending tracker URL>; compact table/header <present after structural check/equivalent fields present after structural check>; seams accounted for <all listed / exceptions named>; CONTEXT.md status <present/absent/N/A>; ADRs/principles/docs status <present/N/A>; partial-red / red-first skip reasons <none/listed>; evidence-only rows <none/listed>.`

- **Literal gate validation.** Before reporting the TDD evidence gate as passed, inspect the exact durable sink or body and verify the literal line above is present with these field labels: `durable sink`, `compact table/header`, `seams accounted for`, `CONTEXT.md status`, `ADRs/principles/docs status`, `partial-red / red-first skip reasons`, and `evidence-only rows`. A paraphrase such as "includes red-first evidence, focused green evidence, and browser evidence" is not the TDD evidence gate. If the compact table header is absent, the line must say `equivalent fields present after structural check` only after checking every row carries the minimum fields.

- **Parent-rollup-ready TDD evidence fragment.** For 4+ child issues using a parent PRD rollup, paste or adapt this block into the final rollup, or link an adjacent durable sink that contains it:

  ```markdown
  TDD evidence

  | Issue | CONTEXT.md status | ADRs/principles/docs status | Seam | Red command/failure | Green command or evidence | Acceptance covered | Review fix / red-first skip reason |
  |---|---|---|---|---|---|---|---|
  | #N | <read / absent / N/A> | <ADRs/principles/docs read or N/A> | <red-first / existing contract-change expectation / static contract check + browser evidence / no-runnable / evidence-only seam> | <command plus expected failure / partial red - wrong reason / N/A / explicit skip reason> | <passing command / browser route-action-result / artifact path / N/A> | <criterion or checkbox> | <N/A / review-fix evidence / partial-red follow-up / red-first skip reason> |

  Existing-test contract-change row(s): <N/A / listed in the table above with the failing existing-test command and the focused or broader green rerun>
  Example existing-test row:
  | #N | <read / absent / N/A> | <ADRs/principles/docs read or N/A> | existing contract-change expectation | <existing focused/root command and assertion failure before expectation update> | <focused rerun plus broader gate that exposed or protects the change> | <criterion or checkbox authorizing the changed expectation> | N/A - existing-test contract-change expectation, not a review fix |

  TDD review-fix addendum:
  - Finding: <review finding title/source / N/A>
  - Intended red command/failure: <command and failure / partial red - wrong reason plus follow-up intended red / red-first skipped because ... / coverage-only review fix because ... / N/A>
  - Green command/evidence: <passing command / browser/manual evidence / artifact / N/A>
  - Updated TDD table row: <issue/seam row updated or linked / N/A>
  - Browser/manual freshness: <rerun result / not affected because changed path is outside the evidence-only route/action/API/fixture and targeted proof for changed path passed / N/A because no UI/routes/browser-consumed API/fixtures/action path changed / blocked because ...>

  TDD closeout preflight:
  - Durable sink/body inspected: <conversation/comment URL/issue reference/body file inspected pending tracker URL/final body file>
  - Compact table/header: <present after structural check/equivalent fields present after structural check/missing>
  - Rows accounted for: <all in-scope issues and seams listed / exceptions named>
  - CONTEXT.md status: <present/absent/N/A>
  - ADRs/principles/docs status: <present/N/A>
  - Partial-red / red-first skip reasons: <none/listed>
  - Evidence-only rows freshness: <none/listed with Evidence freshness rerun/not affected/blocked result>

  TDD evidence gate passed: durable sink <conversation/comment URL/issue reference/body file inspected pending tracker URL>; compact table/header <present after structural check/equivalent fields present after structural check>; seams accounted for <all listed / exceptions named>; CONTEXT.md status <present/absent/N/A>; ADRs/principles/docs status <present/N/A>; partial-red / red-first skip reasons <none/listed>; evidence-only rows <none/listed>.
  ```

- **Refactoring is not part of the loop.** Incidental cleanup belongs to the review stage (see the `code-review` skill), not the red → green implementation cycle. When the requested work is itself a behavior-preserving refactor with observable or static acceptance criteria, the loop can use a red tracer for the required contract plus behavior-preservation tests at the agreed seams.

For shared-boundary issue families, this compact evidence shape is enough unless the repo asks for more detail:

| Issue | CONTEXT.md status | ADRs/principles/docs status | Seam | Red command/failure | Green command or evidence | Acceptance covered | Review fix / red-first skip reason |
|---|---|---|---|---|---|---|---|
| #N | `CONTEXT.md` read / absent / N/A | ADRs / principles / docs read or N/A | public interface under test, `existing contract-change expectation`, `static contract check + browser evidence`, no-runnable reason, or evidence-only browser/manual seam | command plus expected failure, failing existing-test command, `partial red - wrong reason: <reason>`, `N/A`, or explicit skip reason | command that passed, browser route/action/result, artifact path, walkthrough result, or `N/A` | criterion or checkbox | finding fixed with red-first evidence, partial-red follow-up assertion, coverage-only review fix reason, existing-test contract-change expectation, or why red-first was skipped |
