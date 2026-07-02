---
name: implement
description: "Implement a piece of work based on a PRD or set of issues."
disable-model-invocation: true
---

Implement the work described by the user in the PRD or issues.

## 1. Resolve the real scope

Before editing code, identify the authoritative work items.

- If the user names a PRD issue, fetch the PRD and also list related open child issues, blockers, and linked implementation tickets from the issue tracker.
- Treat the child issues as the implementation checklist unless the user explicitly says to implement only the parent PRD text.
- If the user names a set of issues, fetch each issue body and comments.
- Build a progress ledger with one row per issue: issue number, title, dependencies/blockers, acceptance criteria, planned evidence, test seams, and closeout state.
- Do not silently collapse multiple issues into a smaller "skeleton" or "first slice" when the user asked for the issues.

## 2. Work issue-by-issue

Use /tdd where possible, at pre-agreed seams.

For each issue:

- Identify the issue's acceptance criteria and required proof seams before coding.
- Write or update tests for the acceptance criteria where a test seam is available.
- Keep the issue open if required seam tests or other required proof are missing.
- Mark blockers explicitly in the ledger instead of skipping the issue.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

## 3. Review before commit

Once done, use /code-review to review the work.

The repo's code-review skill expects a fixed point. Use one of these routes:

- Commit the completed implementation locally, then run /code-review against `HEAD~1` or another fixed point before pushing or closing issues.
- If committing first would be inappropriate, run an explicit pre-commit review against `git diff HEAD` and say that you are adapting the review because no committed fixed point exists yet.

Commit your work to the current branch.

## 4. Completion audit and issue closeout

Before declaring completion, closing issues, or closing a parent PRD:

- Produce a per-issue audit: every acceptance criterion mapped to concrete evidence, with status `satisfied`, `blocked`, or `not done`.
- Close only issues whose criteria are all satisfied, using a comment that includes the commit SHA and verification evidence.
- Leave parent PRD issues open while any related child issue remains open, unless the tracker explicitly defines the parent as independently closable.
- If a parent issue was split into child issues, do not close it merely because a broad skeleton exists.
- If the issue breakdown is wrong, comment with the proposed tracker correction instead of closing mismatched issues.
