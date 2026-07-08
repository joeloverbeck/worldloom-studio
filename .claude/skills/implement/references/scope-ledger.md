# Scope and Progress Ledger

Read this before the first edit whenever implementation work is based on a PRD,
issue, issue range, or related tracker family.

## Resolve the Real Scope

Before editing code, identify the authoritative work items.

- Run `git status --short` before the first edit. Record unrelated dirty files in the ledger or progress note, leave them untouched, and do not edit or stage them unless they become in-scope.
- If the user names a PRD issue, fetch the PRD and also list related open child issues, blockers, and linked implementation tickets from the issue tracker.
- Treat the child issues as the implementation checklist unless the user explicitly says to implement only the parent PRD text.
- If the user names a set of issues, fetch each issue body and comments.
- For GitHub issue intake, use exact issue lookups with comments and structured fields, for example `gh issue view <n> --comments --json number,title,state,body,comments,labels,closed,closedAt,url`. For broad child or related-issue discovery, query compact fields first, then fetch exact bodies/comments only for the PRD and implementation issues that are in scope.
- For GitHub PRD child discovery, search all issue states for explicit parent references, for example `gh issue list --state all --search "#<parent>" --json number,title,state,labels,url`, then exact-view each candidate body/comments to confirm whether it is a child, blocker, linked implementation ticket, or merely mentions the parent. Do not infer parent closeout readiness from search output alone.
- If any fetched PRD or issue has a `## Principles` section, read `docs/principles/README.md` for the authority order and conformance rule, then read named principle and ADR docs as needed before coding.
- Build a progress ledger with one row per issue: issue number, title, dependencies/blockers, acceptance criteria, principles/ADR obligations or exceptions, planned evidence, test seams, and closeout state.
- When the requested scope is a child issue, child issue range, or single implementation issue and related tracker items are discovered, classify every related item outside the requested scope before editing. For parent PRD closeout, list all related children, including any children beyond the requested scope; mark those children as already closed, enabling prerequisites, blocking, contextual/non-blocking backlog, intentionally excluded, or not actually related.
- If a related item outside the requested scope blocks an in-scope issue, promote it to an explicit enabling-prerequisite row in the ledger before editing. Implement and close that prerequisite only when its own acceptance criteria and conformance checks are satisfied and the user did not explicitly exclude it; otherwise leave the dependent issue or parent open and explain the blocker.
- Do not silently collapse multiple issues into a smaller "skeleton" or "first slice" when the user asked for the issues.

Use this compact ledger shape unless the issue set needs more detail:

If related tracker items exist outside the requested scope, include this line immediately before the table. Omit zero-count categories, and omit the whole line when no true related items exist outside scope:

`Related tracker items outside requested scope: #N closed / #N enabling prerequisite / #N blocking / #N contextual non-blocking backlog / #N intentionally excluded / #N not actually related because ...`

| Issue | Blockers | Acceptance | Principles | Evidence | Test seam | Status | Closeout comment |
|---|---|---|---|---|---|---|---|
| #N | ... | ... | touched docs/ADRs or N/A | ... | ... | planned / in progress / satisfied / blocked / not done | ... |

Post the ledger to the conversation before the first edit. Update it when dependencies, blockers, evidence, or closeout state changes materially.
