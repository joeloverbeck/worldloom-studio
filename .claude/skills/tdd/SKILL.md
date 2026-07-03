---
name: tdd
description: Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
---

# Test-Driven Development

TDD is the red → green loop. This skill is the reference that makes that loop produce tests worth keeping: what a good test is, where tests go, the anti-patterns, and the rules of the loop. Every section applies on every cycle — consult them before and during the loop, not after.

When exploring the codebase, read `CONTEXT.md` (if it exists) so test names and interface vocabulary match the project's domain language, and respect ADRs in the area you're touching.

Before the first red test, record whether `CONTEXT.md` exists and was read, and note any ADRs or principle docs that shape the test vocabulary or seam choice.

## What a good test is

Tests verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't. A good test reads like a specification — "user can checkout with valid cart" tells you exactly what capability exists — and survives refactors because it doesn't care about internal structure.

See [tests.md](tests.md) for examples and [mocking.md](mocking.md) for mocking guidelines.

## Seams — where tests go

A **seam** is the public boundary you test at: the interface where you observe behavior without reaching inside. Tests live at seams, never against internals.

**Test only at pre-agreed seams.** Before writing any test, write down the seams under test and confirm them with the user. No test is written at an unconfirmed seam. You can't test everything — agreeing the seams up front is how testing effort lands on the critical paths and complex logic instead of every edge case.

If a PRD or issue explicitly names proof seams, those count as pre-agreed after you restate them in the implementation ledger. Ask the user only when the seam is absent, ambiguous, or conflicts with the codebase's actual public interfaces.

Ask: "What's the public interface, and which seams should we test?"

Static/source-level contract checks are exceptional. Use them only when an explicit acceptance criterion names a forbidden or required source contract, such as a route string, import, schema key, or generated artifact path. Label the evidence as a static contract check, keep the expected value tied to the spec, and pair it with a public behavior test or browser smoke when the feature is user-visible.

When writing a static contract check, target the smallest source construct that proves the contract. Avoid whole-file regex spans that can cross unrelated regions or match incidental text. After the red run, confirm the failure names the intended forbidden or required contract rather than a broader accidental match.

## Anti-patterns

- **Implementation-coupled** — mocks internal collaborators, tests private methods, or verifies through a side channel (querying the database instead of using the interface). The tell: the test breaks when you refactor but behavior hasn't changed.
- **Tautological** — the assertion recomputes the expected value the way the code does (`expect(add(a, b)).toBe(a + b)`, a snapshot derived by hand the same way, a constant asserted equal to itself), so it passes by construction and can never disagree with the code. Expected values must come from an independent source of truth — a known-good literal, a worked example, the spec.
- **Horizontal slicing** — writing all tests first, then all implementation. Bulk tests verify _imagined_ behavior: you test the _shape_ of things rather than user-facing behavior, the tests go insensitive to real changes, and you commit to test structure before understanding the implementation. Work in **vertical slices** instead — one test → one implementation → repeat, each test a **tracer bullet** that responds to what the last cycle taught you.

## Rules of the loop

- **Red before green.** Write the failing test first, then only enough code to pass it. Don't anticipate future tests or add speculative features.
- **Review findings restart the loop.** If review reveals missing behavior after the implementation is already green, add or adjust the smallest assertion first and run it red before fixing. If the code was already fixed to protect the tree or unblock verification, record that red-first was skipped and why.
- **Record the loop.** For each slice, keep lightweight evidence of the red command and expected failure, then the green command. If red-first is skipped, say why. For focused commands, check the output confirms the intended file, seam, or assertion actually ran; if a package script does not forward file arguments cleanly, invoke the underlying runner directly.
- **Docs-only and no-runnable criteria stay explicit.** If an acceptance criterion is a document deliverable, review/conformance claim, or otherwise has no runnable public seam, do not invent a test seam. Record red and green as `N/A`, cite the review/conformance evidence, and carry the no-runnable reason in the compact evidence table.
- **One slice at a time.** One seam, one test, one minimal implementation per cycle. When a vertical slice legitimately spans several public seams, write the smallest tracer-bullet test at each seam, keep the issue/audit mapping explicit, and avoid bulk tests that are not tied to an acceptance criterion.
- **Shared-boundary issue families still need tracer bullets.** When PRD child issues share one implementation boundary and separate red-green cycles would be artificial, write the smallest red tracer at each agreed seam, record the red failures by seam and issue, then implement the shared boundary while keeping the acceptance mapping explicit.
- **Shared-boundary closeout hard stop.** Do not enter closeout for a shared-boundary issue family until the compact evidence table below has one row per agreed seam, or an explicit red-first skip reason is recorded for each seam that could not reasonably go red first.
- **Refactoring is not part of the loop.** Incidental cleanup belongs to the review stage (see the `code-review` skill), not the red → green implementation cycle. When the requested work is itself a behavior-preserving refactor with observable or static acceptance criteria, the loop can use a red tracer for the required contract plus behavior-preservation tests at the agreed seams.

For shared-boundary issue families, this compact evidence shape is enough unless the repo asks for more detail:

| Issue | Context / doctrine read | Seam | Red command/failure | Green command | Acceptance covered | Review fix / red-first skip reason |
|---|---|---|---|---|---|---|
| #N | `CONTEXT.md` / ADRs / principles read or N/A | public interface under test, or no-runnable reason | command plus expected failure, or `N/A` | command that passed, or `N/A` | criterion or checkbox | finding fixed with red-first evidence, or why red-first was skipped |
