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
- When the user names a child issue range and asks to close a parent PRD, list all related children, including children outside the requested range; mark out-of-range children as already closed, blocking, or intentionally excluded before closing the parent.
- Do not silently collapse multiple issues into a smaller "skeleton" or "first slice" when the user asked for the issues.

Use this compact ledger shape unless the issue set needs more detail:

| Issue | Blockers | Acceptance | Evidence | Test seam | Status | Closeout comment |
|---|---|---|---|---|---|---|
| #N | ... | ... | ... | ... | planned / in progress / satisfied / blocked / not done | ... |

Post the ledger to the conversation before the first edit. Update it when dependencies, blockers, evidence, or closeout state changes materially.

## 2. Work issue-by-issue

Use /tdd where possible, at pre-agreed seams.

Default to one issue at a time. If child issues are technically inseparable and an integrated implementation pass is the safer route, say so in the ledger, keep the ledger/audit per issue, and make the closeout evidence map each issue's criteria to the shared implementation and tests.

For each issue:

- Identify the issue's acceptance criteria and required proof seams before coding.
- Write or update tests for the acceptance criteria where a test seam is available.
- Keep the issue open if required seam tests or other required proof are missing.
- Mark blockers explicitly in the ledger instead of skipping the issue.
- When the issue body, PRD text, acceptance criteria, or implementation includes UI/browser-visible behavior, run a real browser smoke or record why it is blocked; include the route, action path, and observed outcome in the closeout evidence.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

## 3. Review before commit

Once done, use /code-review to review the work.

The repo's code-review skill expects a fixed point. Use one of these routes:

- Commit the completed implementation locally, then run /code-review against `HEAD~1` or another fixed point before pushing or closing issues.
- If committing first would be inappropriate, run an explicit pre-commit review against `git diff HEAD` and say that you are adapting the review because no committed fixed point exists yet.
- If /code-review cannot run because a required mechanism is unavailable, including when sub-agents or other review tools are unavailable or policy-blocked, run a local two-axis review against the fixed point: standards/conventions and spec/acceptance. Document the deviation and its reason, fix any findings, rerun the relevant gates, and include the review outcome in closeout evidence.

Before staging or committing, rerun `git status --short`, identify unrelated existing changes, and stage only files owned by the implementation. Leave unrelated dirty files untouched and report them in the final response.

Commit your work to the current branch.

## 4. Completion audit and issue closeout

Before declaring completion, closing issues, or closing a parent PRD:

- Produce a pre-close per-issue audit before closing any issue: every acceptance criterion mapped to concrete evidence, with status `satisfied`, `blocked`, or `not done`.
- Close only issues whose criteria are all satisfied, using a comment that includes the commit SHA and verification evidence.
- If review found or fixed issues, or if a review fallback path was used, include the review outcome in each affected issue's closeout comment or in a clearly linked parent rollup.
- Leave parent PRD issues open while any related child issue remains open, unless the tracker explicitly defines the parent as independently closable.
- If a parent issue was split into child issues, do not close it merely because a broad skeleton exists.
- Before closing a parent PRD, verify related child issue states by exact issue numbers, not only by broad issue-search output.
- If the issue breakdown is wrong, comment with the proposed tracker correction instead of closing mismatched issues.
- Run a final `git status --short`. For untracked verification artifacts, either remove them if safe, stage them if they are intended evidence, or explicitly report them in the final response.

Use this compact pre-close audit shape unless the issue set needs more detail:

| Issue | Acceptance criterion | Evidence | Status |
|---|---|---|---|
| #N | ... | commit/tests/browser route/store seam/etc. | satisfied / blocked / not done |

Do not close an issue until its audit rows are posted or otherwise captured in the conversation, and every row for that issue is `satisfied`.
