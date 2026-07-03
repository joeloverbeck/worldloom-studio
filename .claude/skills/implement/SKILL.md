---
name: implement
description: "Implement a piece of work based on a PRD or set of issues."
disable-model-invocation: true
---

Implement the work described by the user in the PRD or issues.

## 1. Resolve the real scope

Before editing code, identify the authoritative work items.

- Run `git status --short` before the first edit. Record unrelated dirty files in the ledger or progress note, leave them untouched, and do not edit or stage them unless they become in-scope.
- If the user names a PRD issue, fetch the PRD and also list related open child issues, blockers, and linked implementation tickets from the issue tracker.
- Treat the child issues as the implementation checklist unless the user explicitly says to implement only the parent PRD text.
- If the user names a set of issues, fetch each issue body and comments.
- For GitHub issue intake, use exact issue lookups with comments and structured fields, for example `gh issue view <n> --comments --json number,title,state,body,comments,labels,closed,closedAt,url`. For broad child or related-issue discovery, query compact fields first, then fetch exact bodies/comments only for the PRD and implementation issues that are in scope.
- If any fetched PRD or issue has a `## Principles` section, read `docs/principles/README.md` for the authority order and conformance rule, then read named principle and ADR docs as needed before coding.
- Build a progress ledger with one row per issue: issue number, title, dependencies/blockers, acceptance criteria, principles/ADR obligations or exceptions, planned evidence, test seams, and closeout state.
- When the user names a child issue range and asks to close a parent PRD, list all related children, including children outside the requested range; mark out-of-range children as already closed, blocking, or intentionally excluded before closing the parent.
- Do not silently collapse multiple issues into a smaller "skeleton" or "first slice" when the user asked for the issues.

Use this compact ledger shape unless the issue set needs more detail:

If related tracker items exist outside the requested range, include this line immediately before the table:

`Related tracker items outside requested range: #N closed / #N blocking / #N intentionally excluded / #N not actually a child because ...`

| Issue | Blockers | Acceptance | Principles | Evidence | Test seam | Status | Closeout comment |
|---|---|---|---|---|---|---|---|
| #N | ... | ... | touched docs/ADRs or N/A | ... | ... | planned / in progress / satisfied / blocked / not done | ... |

Post the ledger to the conversation before the first edit. Update it when dependencies, blockers, evidence, or closeout state changes materially.

## 2. Work issue-by-issue

Invoke the repo `tdd` skill where possible, at pre-agreed seams.

Default to one issue at a time. If child issues are technically inseparable and an integrated implementation pass is the safer route, say so in the ledger, keep the ledger/audit per issue, and make the closeout evidence map each issue's criteria to the shared implementation and tests.

For each issue:

- Identify the issue's acceptance criteria, required principles/ADR conformance checks, and required proof seams before coding.
- Write or update tests for the acceptance criteria where a test seam is available.
- Keep the issue open if required seam tests or other required proof are missing.
- Mark blockers explicitly in the ledger instead of skipping the issue.
- If implementation would contradict a named principle or ADR, stop and surface the exception before continuing.
- When the issue body, PRD text, acceptance criteria, or implementation includes UI/browser-visible behavior, run a real browser smoke or record why it is blocked; include the route, action path, and observed outcome in the closeout evidence.
- If any later edit touches the UI, route handlers, browser-consumed API shapes, fixture/data setup, or action path covered by a browser/manual smoke, treat the earlier smoke as preliminary and rerun it on the final tree before closeout, or record why rerun is blocked.

Run typechecking regularly and single test files regularly. Before closeout, read the root verification guidance and run the canonical gates required for the work's blast radius. In this repo, workflow, package, cross-package, or closeout-scale changes require `pnpm test`, `pnpm typecheck`, and `pnpm build`; do not report a lint, browser/e2e, or hard-audit gate as satisfied unless the repo adds that script and policy.

Before committing, draft the pre-close audit row-by-row against each in-scope issue's acceptance criteria and Principles/ADR checks. Patch any row that would be `blocked` or `not done` before entering review, unless the right outcome is to leave that issue open.

## 3. Review before commit

Once done, invoke the repo `code-review` skill to review the work.

The repo's code-review skill expects a fixed point. Use one of these routes:

- Commit the completed implementation locally, then run the `code-review` skill against `HEAD~1` or another fixed point before pushing or closing issues.
- If committing first would be inappropriate, run an explicit pre-commit review against `git diff HEAD` and say that you are adapting the review because no committed fixed point exists yet.
- If the `code-review` skill cannot run because a required mechanism is unavailable, including when sub-agents or other review tools are unavailable or policy-blocked, run a local two-axis review against the fixed point: standards/conventions and spec/acceptance. Document the deviation and its reason, fix any findings, rerun the relevant gates, and include the review outcome in closeout evidence.
- If review fixes happen after the implementation commit, stage only implementation-owned files and intentionally either amend the implementation commit or create a follow-up commit. Refresh the final SHA after the last commit, rerun required gates on the final tree, and use that final SHA in closeout comments.

Review evidence is a closeout hard stop. Before running any issue-close command, record one of these lines in the conversation or closeout audit:

- `Review: code-review against <fixed point>; outcome <no findings / findings fixed in SHA ...>; verification rerun <commands>.`
- `Review fallback: <why code-review could not run>; standards/spec result <...>; fixes <none / SHA ...>; verification rerun <commands>.`

Before staging or committing, rerun `git status --short`, identify unrelated existing changes, and stage only files owned by the implementation. Leave unrelated dirty files untouched and report them in the final response.

Commit your work to the current branch.

## 4. Completion audit and issue closeout

Before declaring completion, closing issues, or closing a parent PRD:

- Produce a pre-close per-issue audit before closing any issue: every acceptance criterion and required principles/ADR conformance check mapped to concrete evidence, with status `satisfied`, `blocked`, or `not done`. Default to one row per acceptance criterion or conformance check; do not group acceptance checkboxes into one prose row unless the row names each checkbox explicitly.
- Close only issues whose criteria are all satisfied, using a comment that includes the commit SHA and verification evidence.
- If review found or fixed issues, or if a review fallback path was used, include the review outcome in each affected issue's closeout comment or in a clearly linked parent rollup.
- If the issue or parent PRD has a `## Principles` section, include the conformance result or deliberate steward-approved exception in the closeout evidence.
- Leave parent PRD issues open while any related child issue remains open, unless the tracker explicitly defines the parent as independently closable.
- If a parent issue was split into child issues, do not close it merely because a broad skeleton exists.
- Before closing a parent PRD, verify related child issue states by exact issue numbers, not only by broad issue-search output.
- After closing child issues or a parent PRD, verify the live tracker state again by exact issue numbers before final response.
- If the session resumes, compacts, or is interrupted after closeout work but before the final response, rerun exact issue-state checks, final commit-SHA lookup, and `git status --short` before reporting completion.
- If the issue breakdown is wrong, comment with the proposed tracker correction instead of closing mismatched issues.
- Run a final `git status --short`. For untracked verification artifacts, either remove them if safe, stage them if they are intended evidence, or explicitly report them in the final response.

Mechanical audit-shape stop: before entering the closeout command gate, inspect the posted audit table. If it lacks both `Acceptance criterion or conformance check` and `Status` columns, or if any issue row summarizes multiple acceptance checkboxes without naming each one, stop and expand the audit before running any issue-close command.

Mandatory closeout self-check before any `gh issue close`, `glab issue close`, or equivalent: the audit table must have exact `Acceptance criterion or conformance check` and `Status` columns, every acceptance checkbox or conformance check must be named explicitly, and every row for the issue being closed must be `satisfied`.

Closeout command gate: do not run `gh issue close`, `glab issue close`, or equivalent until all of these are true:

- The pre-close audit table has been posted or otherwise captured, and every row for the issue being closed is `satisfied`.
- Review evidence from section 3 is present, either as `code-review` output or an explicit fallback record.
- The final commit SHA is known and matches the tree that passed required verification.
- If the issue body, PRD text, acceptance criteria, or implementation includes UI/browser-visible behavior, closeout evidence includes a real browser smoke with route, action path, and observed outcome, or an explicit blocked note explaining why that smoke could not run.
- For parent PRD closure, exact related child issue states have been verified by issue number, including any out-of-range children noted in the ledger.

Use this compact pre-close audit shape unless the issue set needs more detail:

| Issue | Acceptance criterion or conformance check | Evidence | Status |
|---|---|---|---|
| #N | ... | commit/tests/browser route/store seam/etc. | satisfied / blocked / not done |

Do not close an issue until its audit rows are posted or otherwise captured in the conversation, and every row for that issue is `satisfied`.
