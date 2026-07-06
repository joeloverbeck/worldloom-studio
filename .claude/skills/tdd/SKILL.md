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
- Context/doctrine read: <CONTEXT.md read / absent / N/A>; <ADRs/principles read or N/A>
- Agreed seams: <issue/PRD-stated seams restated / user-confirmed seams / confirmation needed>
- Row plan: <red-first seams>; <no-runnable criteria>; <evidence-only browser/manual seams>
- Shared-boundary table stub: <created before first red test / N/A>; <every in-scope issue has a row or exceptions named>
- User confirmation needed: <yes/no, and why>
```

For shared-boundary issue families, paste this compact evidence table stub before the first red test; do not substitute a prose-only row plan. The red and green cells can be `TBD` while work is still in progress, but every in-scope issue and agreed seam must already have a row with a `red-first`, `no-runnable`, or `evidence-only` classification.

```markdown
| Issue | Context / doctrine read | Seam | Red command/failure | Green command or evidence | Acceptance covered | Review fix / red-first skip reason |
|---|---|---|---|---|---|---|
| #N | <CONTEXT.md / ADRs / principles read or N/A> | <red-first / no-runnable / evidence-only seam> | <command plus expected failure / partial red - wrong reason / N/A / explicit skip reason / TBD> | <passing command / browser route-action-result / artifact path / N/A / TBD> | <criterion or checkbox> | <N/A / review-fix evidence / partial-red follow-up / red-first skip reason> |
```

Non-bypassable TDD closeout gate:

- Before handing work to review, a pre-close audit, issue closure, parent PRD closeout, or the repo `implement` skill's closeout gate, inspect the durable audit sink that will carry TDD evidence.
- The durable sink must contain the compact table below or equivalent explicit fields: issue(s), context/doctrine read status, seam, red command/failure or skip reason, green command/evidence, and acceptance covered.
- Make the literal `TDD evidence gate passed:` line visible in the conversation, implementation ledger, or durable audit sink. If any field is missing or only implied, stop and add it before leaving the TDD loop.
- Do not write or accept the shorthand `TDD evidence gate passed: yes`. The gate line must be the full fielded sentence shown below, including `durable sink`, `compact table/header`, `seams accounted for`, `context/doctrine read status`, partial-red or skip-reason status, and evidence-only row status.
- Body-check token sweep: before declaring the gate satisfied, grep or visually verify that the durable sink contains `TDD closeout preflight`, `TDD evidence gate passed: durable sink`, `compact table/header`, `seams accounted for`, `context/doctrine read status`, `partial-red / red-first skip reasons`, and `evidence-only rows`.
- When `implement` owns the surrounding workflow, the same parent rollup, issue comment, or body file that carries implementation closeout evidence must also carry the `TDD closeout preflight` block and the literal `TDD evidence gate passed:` line before review, pre-close audit, issue closure, or parent PRD closeout. A verification section that lists red/green commands is not equivalent unless it also names the issue/seam rows, context/doctrine status, skip or partial-red reasons, and evidence-only freshness.

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
- **Evidence freshness after review fixes.** After review fixes or any later edit, compare the final changed files against evidence-only browser/manual rows before closeout. If a changed file touches a route, UI action, browser-consumed API shape, fixture, or data setup covered by one of those rows, rerun that evidence on the final tree. Record `Evidence freshness: <rerun command/artifact/result>` or `Evidence freshness: N/A because ...`; stale or blocked evidence must be explicit.
- **Record the loop.** For each slice, keep lightweight evidence of the red command and expected failure, then the green command. If red-first is skipped, say why. For focused commands, check the output confirms the intended file, seam, or assertion actually ran; if a package script does not forward file arguments cleanly, invoke the underlying runner directly.
- **Existing-test failures after intended contract changes are regression evidence.** If an existing test fails after an intended behavior, schema, route, or artifact contract changes, record the failing command before editing the test. Update the expectation only when the spec, issue, or worked example authorizes the new behavior; otherwise fix the implementation. Rerun the focused command and any broader gate that exposed the failure. In the compact evidence table, put the failing existing-test command in `Red command/failure` for the affected seam, or use a dedicated `existing contract-change expectation` row when the failure spans several acceptance rows. Reserve `Review fix / red-first skip reason` for review findings, coverage-only review fixes, and explicit red-first skips.
- **Docs-only and no-runnable criteria stay explicit.** If an acceptance criterion is a document deliverable, review/conformance claim, or otherwise has no runnable public seam, do not invent a test seam. Record red and green as `N/A`, cite the review/conformance evidence, and carry the no-runnable reason in the compact evidence table.
- **Browser/manual evidence can be evidence-only.** If acceptance requires browser-visible, manual, screenshot, walkthrough, or other evidence that is not itself a red-first automated seam, record it as an evidence-only row instead of forcing a fake failing test. Set red to `N/A` or an explicit red-first skip reason, and record the browser route, action path, observed outcome, artifact path, or walkthrough result in the green/evidence field. For dense app screens or long single-page snapshots, keep evidence bounded: prefer targeted DOM/text assertions, concise excerpts, and screenshots over full-page snapshot dumps. If later edits touch a route, UI action, browser-consumed API shape, fixture, or data setup covered by an evidence-only row, rerun the evidence on the final tree or record an explicit stale/blocked reason before closeout.
- **One slice at a time.** One seam, one test, one minimal implementation per cycle. When a vertical slice legitimately spans several public seams, write the smallest tracer-bullet test at each seam, keep the issue/audit mapping explicit, and avoid bulk tests that are not tied to an acceptance criterion.
- **Shared-boundary issue families still need tracer bullets.** When PRD child issues share one implementation boundary and separate red-green cycles would be artificial, write the smallest red tracer at each agreed seam, record the red failures by seam and issue, then implement the shared boundary while keeping the acceptance mapping explicit.
- **Inventory shared-boundary seams before broad red tests.** Before writing the first broad tracer for a shared-boundary issue family, list every agreed seam and mark each one as `red-first`, `no-runnable`, or `evidence-only`. Instantiate the compact evidence table stub before the first red test: one row per in-scope issue and agreed seam, with `TBD` allowed only in command/evidence cells that cannot exist yet. Use that inventory as the row plan for the compact evidence table; if a seam cannot be classified, stop and clarify the seam before writing tests.
- **Shared-boundary closeout hard stop.** Do not enter closeout for a shared-boundary issue family until the compact evidence table below has one row per agreed seam, or an explicit red-first skip reason is recorded for each seam that could not reasonably go red first.
- **Implementation closeout consumes the TDD table.** When the repo `implement` skill owns the surrounding workflow, merge the compact TDD evidence table into the implementation ledger or pre-close audit before review and closeout. Immediately before the pre-close audit, either post a short `TDD evidence` block or explicitly carry the TDD fields into the audit evidence. Put that table or block in the same durable sink as the pre-close audit, or directly adjacent to it with an explicit link or citation; do not rely on earlier prose-only red/green notes surviving context compaction. The minimum evidence is: issue or issues, context/doctrine read status or `N/A`, seam, red command and expected failure or skip reason, and green command or evidence. If a seam has no row, add the explicit red-first skip reason before leaving the TDD loop.
- **TDD evidence artifact stop.** Before the pre-close audit, issue closure, or parent PRD closeout, inspect the actual durable closeout body that will be posted or linked. It satisfies this skill only when it contains the compact table header row below, or when every entry explicitly carries the same minimum fields: issue(s), context/doctrine read status, seam, red command/failure or skip reason, green command/evidence, and acceptance covered. Prose-only red/green bullet lists do not satisfy this stop, even if the commands are present.
- **TDD closeout preflight.** Before handing off to review, a pre-close audit, issue closure, or parent PRD closeout, fill and paste this block in the conversation, implementation ledger, or closeout audit. Do not proceed until the `TDD evidence gate passed:` line is present immediately under it.

  ```markdown
  TDD closeout preflight:
  - Durable sink/body inspected: <conversation/comment URL/issue reference>
  - Compact table/header: <present/equivalent fields present/missing>
  - Rows accounted for: <all in-scope issues and seams listed / exceptions named>
  - Context/doctrine read status: <present/N/A>
  - Partial-red / red-first skip reasons: <none/listed>
  - Evidence-only rows freshness: <none/listed with Evidence freshness result>
  ```

- **TDD evidence gate line.** After inspecting the durable closeout body and before leaving the TDD loop for review or closeout, write this literal line in the conversation, implementation ledger, or closeout audit:

  `TDD evidence gate passed: durable sink <conversation/comment URL/issue reference>; compact table/header <present/equivalent fields present>; seams accounted for <all listed / exceptions named>; context/doctrine read status <present/N/A>; partial-red / red-first skip reasons <none/listed>; evidence-only rows <none/listed>.`

- **Refactoring is not part of the loop.** Incidental cleanup belongs to the review stage (see the `code-review` skill), not the red → green implementation cycle. When the requested work is itself a behavior-preserving refactor with observable or static acceptance criteria, the loop can use a red tracer for the required contract plus behavior-preservation tests at the agreed seams.

For shared-boundary issue families, this compact evidence shape is enough unless the repo asks for more detail:

| Issue | Context / doctrine read | Seam | Red command/failure | Green command or evidence | Acceptance covered | Review fix / red-first skip reason |
|---|---|---|---|---|---|---|
| #N | `CONTEXT.md` / ADRs / principles read or N/A | public interface under test, no-runnable reason, or evidence-only browser/manual seam | command plus expected failure, `partial red - wrong reason: <reason>`, `N/A`, or explicit skip reason | command that passed, browser route/action/result, artifact path, walkthrough result, or `N/A` | criterion or checkbox | finding fixed with red-first evidence, partial-red follow-up assertion, coverage-only review fix reason, or why red-first was skipped |
