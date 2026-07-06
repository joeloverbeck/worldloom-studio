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
- For GitHub PRD child discovery, search all issue states for explicit parent references, for example `gh issue list --state all --search "#<parent>" --json number,title,state,labels,url`, then exact-view each candidate body/comments to confirm whether it is a child, blocker, linked implementation ticket, or merely mentions the parent. Do not infer parent closeout readiness from search output alone.
- If any fetched PRD or issue has a `## Principles` section, read `docs/principles/README.md` for the authority order and conformance rule, then read named principle and ADR docs as needed before coding.
- Build a progress ledger with one row per issue: issue number, title, dependencies/blockers, acceptance criteria, principles/ADR obligations or exceptions, planned evidence, test seams, and closeout state.
- When the requested scope is a child issue, child issue range, or single implementation issue and related tracker items are discovered, classify every related item outside the requested scope before editing. For parent PRD closeout, list all related children, including any children beyond the requested scope; mark those children as already closed, enabling prerequisites, blocking, contextual/non-blocking backlog, intentionally excluded, or not actually related.
- If a related item outside the requested scope blocks an in-scope issue, promote it to an explicit enabling-prerequisite row in the ledger before editing. Implement and close that prerequisite only when its own acceptance criteria and conformance checks are satisfied and the user did not explicitly exclude it; otherwise leave the dependent issue or parent open and explain the blocker.
- Do not silently collapse multiple issues into a smaller "skeleton" or "first slice" when the user asked for the issues.

Use this compact ledger shape unless the issue set needs more detail:

If related tracker items exist outside the requested scope, include this line immediately before the table:

`Related tracker items outside requested scope: #N closed / #N enabling prerequisite / #N blocking / #N contextual non-blocking backlog / #N intentionally excluded / #N not actually related because ...`

| Issue | Blockers | Acceptance | Principles | Evidence | Test seam | Status | Closeout comment |
|---|---|---|---|---|---|---|---|
| #N | ... | ... | touched docs/ADRs or N/A | ... | ... | planned / in progress / satisfied / blocked / not done | ... |

Post the ledger to the conversation before the first edit. Update it when dependencies, blockers, evidence, or closeout state changes materially.

## 2. Work issue-by-issue

Invoke the repo `tdd` skill where possible, at pre-agreed seams. If the issue or PRD explicitly names proof seams, treat them as pre-agreed after restating them in the ledger or TDD evidence, unless they conflict with live architecture. If no seam has been pre-agreed, derive the conservative proposed seam from the acceptance criteria and existing architecture, announce it in the ledger or TDD evidence, follow the `tdd` skill's confirmation rule before writing tests at that seam, and keep it at the highest practical layer. For docs-only or no-runnable criteria, record that no runnable seam exists and use review/conformance evidence rather than inventing a test.

Default to one issue at a time. If child issues are technically inseparable and an integrated implementation pass is the safer route, say so in the ledger, keep the ledger/audit per issue, and make the closeout evidence map each issue's criteria to the shared implementation and tests.

For each issue:

- Identify the issue's acceptance criteria, required principles/ADR conformance checks, and required proof seams before coding.
- Write or update tests for the acceptance criteria where a test seam is available.
- Keep the issue open if required seam tests or other required proof are missing.
- Mark blockers explicitly in the ledger instead of skipping the issue.
- If implementation would contradict a named principle or ADR, stop and surface the exception before continuing.
- When the issue body, PRD text, acceptance criteria, or implementation includes UI/browser-visible behavior, run a real browser smoke or record why it is blocked; include the route, action path, and observed outcome in the closeout evidence.
- For guided-flow, workflow-routed, or multi-surface UI work, the browser smoke must exercise the production route and decision/action path the user actually reaches from navigation or workflow routing. When the same capability appears on multiple surfaces, verify each UI acceptance checkbox on the routed active surface, not only a legacy/full workspace, API seam, or nearby component.
- If the work is docs-only or process-only and mentions UI/browser behavior only as inventory, coverage, or citation without changing UI, routes, browser-consumed API shapes, fixtures, or action paths, record `browser smoke N/A` with that reason instead of running a smoke.
- For browser-consumed API-only changes with no rendered UI change, a real browser page executing the route sequence via `fetch` qualifies as the browser smoke when the evidence records the route, action path, observed HTTP status or JSON, and server/browser cleanup. When fetching localhost APIs from a browser page, navigate to a same-origin localhost route first, such as `/api/health` or the app shell; avoid `data:` or `about:blank` origins because browser private-network/CORS policy may block loopback fetches.
- When a UI browser smoke requires starting a dev server, record the server URL and whether the server was stopped or intentionally left running. Include that URL or cleanup note in closeout/final evidence so no background session is left ambiguous.
- For dense app screens or long single-page snapshots, keep browser-smoke evidence bounded: prefer targeted DOM/text assertions, concise excerpts, and screenshots over full-page snapshot dumps. The closeout still needs route, action path, and observed outcome; the raw browser transcript does not need to include the whole page.
- If any later edit touches the UI, route handlers, browser-consumed API shapes, fixture/data setup, or action path covered by a browser/manual smoke, treat the earlier smoke as preliminary and rerun it on the final tree before closeout, or record why rerun is blocked.

Run typechecking regularly and single test files regularly. After a focused test command, check the output confirms the intended file or seam actually ran. If a package script does not forward file arguments cleanly, invoke the underlying runner directly, for example `pnpm --filter <pkg> exec vitest run test/file.test.ts`.

Before closeout, read the root verification guidance and run the canonical gates required for the work's blast radius. In this repo, workflow, package, cross-package, or closeout-scale changes require `pnpm test`, `pnpm typecheck`, and `pnpm build`; do not report a lint, browser/e2e, or hard-audit gate as satisfied unless the repo adds that script and policy.

Before committing, draft the pre-close audit row-by-row against each in-scope issue's acceptance criteria and Principles/ADR checks. Patch any row that would be `blocked` or `not done` before entering review, unless the right outcome is to leave that issue open.

Implementation commit gate:

- Pre-close audit drafted with every in-scope criterion and Principles/ADR check mapped to evidence and status.
- Any `blocked` or `not done` rows are either fixed before review or explicitly justify leaving the issue open.
- `git status --short` has been rerun and unrelated dirty files are identified.
- Only implementation-owned files are staged for the implementation commit.

## 3. Review before closeout

Once the implementation is ready, invoke the repo `code-review` skill to review the work before pushing or closing issues.

The repo's code-review skill expects a fixed point. Use one of these routes:

- Commit the completed implementation locally, then run the `code-review` skill against `HEAD~1` or another fixed point before pushing or closing issues.
- If committing first would be inappropriate, run an explicit pre-commit review against `git diff HEAD` and say that you are adapting the review because no committed fixed point exists yet.
- If the `code-review` skill cannot run because a required mechanism is unavailable, including when sub-agents or other review tools are unavailable or policy-blocked, run a local two-axis review against the fixed point: standards/conventions and spec/acceptance. Defer to the `code-review` skill's fixed-point and tool-policy discovery rules before choosing fallback, and record whether fallback is due to unavailable tooling or policy-blocked delegation. Document the deviation and its reason, fix any findings, rerun the relevant gates, and include the review outcome in closeout evidence.
- If review finds no issues after the implementation commit, keep that commit as the final SHA; no second commit is needed. If review fixes happen after the implementation commit, stage only implementation-owned files and intentionally either amend the implementation commit or create a follow-up commit. Refresh the final SHA after the last commit, rerun required gates on the final tree, and use that final SHA in closeout comments.
- If review fixes create a follow-up commit instead of amending the implementation commit, keep the final review and closeout frame anchored at the original implementation fixed point through final `HEAD`. Do not default closeout review evidence to `HEAD~1` when that would cover only the review-fix commit.
- For behavior-changing review fixes, red-first evidence must fail for the intended review finding, not merely for a nearby or generic reason. If the first red command fails because of a missing test file, a generic invariant, an unrelated assertion, or any reason that does not prove the reviewed behavior is wrong, record it as `partial red - wrong reason: <reason>`, then add or adjust the smallest assertion that fails for the intended behavior and run that before patching. If a true intended-behavior red is impossible, record `red-first skipped because <specific reason>`.
- After any review-fix commit, decide whether the fix touches UI, route handlers, browser-consumed API shapes, fixture/data setup, or an action path covered by an earlier browser/manual smoke. If it does, rerun the smoke on the final tree before closeout, or record an explicit blocked reason in the closeout evidence.
- After any review-fix commit, complete this browser/manual freshness mini-gate before drafting closeout artifacts:
  - `Files touched since browser/manual smoke: <paths or none>`
  - `Affects UI/routes/browser-consumed API/fixtures/action path? <yes/no and why>`
  - `Smoke freshness: <rerun command + observed outcome / N/A because ... / blocked because ...>`

Review evidence is a closeout hard stop. Before running any issue-close command, record one of these lines in the conversation or closeout audit:

- `Review: code-review against <fixed point>; outcome <no findings / findings fixed in SHA ...>; verification rerun <commands>.`
- `Review fallback: <why code-review could not run>; standards/spec result <...>; fixes <none / SHA ...>; verification rerun <commands>.`

Before the implementation commit or any review-fix commit, rerun `git status --short`, identify unrelated existing changes, and stage only files owned by the implementation. Leave unrelated dirty files untouched and report them in the final response.

## 4. Completion audit and issue closeout

Before declaring completion, closing issues, or closing a parent PRD:

Non-bypassable closeout gate:

- Before any `gh issue comment`, `gh issue close`, `glab issue close`, or equivalent closeout command, fill in the closeout preflight scratchpad below and make the literal `Closeout gate passed:` line visible in the conversation or durable audit sink.
- This gate applies even when a parent rollup will carry the detailed audit. The rollup URL is not a substitute for the visible gate line; it is the audit sink named by that line.
- If any required preflight field is unknown, missing, or only implied, stop and fill it before posting comments or closing issues.
- Before first tracker mutation hard stop: write both exact headings/lines below in the conversation or durable audit sink before the first `gh issue comment`, `gh issue close`, `glab issue close`, or equivalent command. Do not paraphrase them.
  - `Closeout preflight:`
  - `Closeout gate passed: audit sink <conversation/comment URL/issue reference>; review evidence <line/reference>; final SHA <sha>; Principles/ADR conformance <present/N/A>; Local-only SHA <full explanatory sentence present/N/A>; child states verified <yes/N/A>; browser evidence <present/N/A/blocked>.`

- Closeout execution order for 4+ in-scope child issues defaults to: post the parent PRD rollup/audit comment first, capture its URL or exact comment reference, cite that rollup from each child closeout comment, close child issues, verify child states by exact issue number, then close the parent. Use per-child full audit comments instead only when no parent rollup is used.
- For 4+ in-scope child issues, follow this command sequence unless you explicitly choose and state a different durable audit sink:
  1. Draft the parent rollup/audit body under `/tmp`.
  2. Inspect that exact parent body and confirm it contains the audit table, final SHA, verification evidence, review evidence, `Principles/ADR conformance:`, the full `Local-only SHA: <sha> is not remote-reachable because <reason>; local-only closeout is acceptable because <reason>.` sentence when applicable, and browser evidence or N/A/blocked wording.
  3. Post the parent rollup with `gh issue comment <parent> --body-file <parent-body>`.
  4. Capture the returned parent comment URL.
  5. Draft or patch every child closeout body so it cites the parent rollup URL.
  6. Inspect every child body before posting.
  7. Post each child closeout with `gh issue comment <child> --body-file <child-body>`, capture the returned child comment URL, then close with `gh issue close <child> --reason completed --comment "Completed; evidence: <child-comment-url>"`. Never use `--comment-file` with `gh issue close`; this GitHub command accepts inline `--comment` only.
  8. Verify each child state by exact issue number, then comment on and close the parent.
- Fixed-template child closeout alternate: if every child closeout is the same short inline comment that only cites an inspected parent rollup URL, separate child body files and child comment URLs are not required. Inspecting a body file does not count unless that exact text is posted unchanged. Use this explicit sequence instead:
  1. Draft the exact inline `--comment` string in the closeout preflight, for example `Completed by <sha>. Evidence: <parent-rollup-url>`.
  2. Inspect and record that exact inline string once before the first child close command.
  3. Close each child with `gh issue close <child> --reason completed --comment "<inspected exact inline string>"`; do not shorten, reword, or replace it at the command line.
  4. Verify each child state by exact issue number before commenting on or closing the parent.
  Any child-specific evidence, wording, or variation still needs its own inspected child body or full inline comment before posting.
- Produce a pre-close per-issue audit before closing any issue: every acceptance criterion and required principles/ADR conformance check mapped to concrete evidence, with status `satisfied`, `blocked`, or `not done`. Default to one row per acceptance criterion or conformance check; do not group acceptance checkboxes into one prose row unless the row names each checkbox explicitly. Capture the audit in one durable sink before closeout: the conversation, a tracker comment on the issue or parent PRD, or another durable tracker artifact. For large child-issue families where the explicit row table would be unwieldy in conversation, prefer one parent PRD tracker comment when practical, then link or cite that durable audit sink from each child closeout comment. If the audit is not in the conversation, each affected closeout comment must link the durable audit sink.
- For 4+ in-scope child issues, choose and state the durable audit sink before closing any issue: conversation, parent PRD tracker comment, child issue comments, or another durable tracker artifact. If using a parent PRD tracker rollup, post that comment before child closeout, capture its URL or exact issue/comment reference, and cite it from each affected child closeout comment instead of relying on unstated conversation context.
- If a complete criterion-level audit was already posted before commit and no rows change after commit, review, or verification reruns, post a final addendum with the final SHA, review result, verification reruns, and a statement that all prior rows remain satisfied. Repost or expand only rows that changed, were incomplete, or were not preserved clearly enough after resume or compaction.
- Close only issues whose criteria are all satisfied, using a comment that includes the commit SHA and verification evidence.
- If review found or fixed issues, or if a review fallback path was used, include the review outcome in each affected issue's closeout comment or in a clearly linked parent rollup.
- If the issue or parent PRD has a `## Principles` section, include the conformance result or deliberate steward-approved exception in the closeout evidence.
- Leave parent PRD issues open while any related child issue remains open, unless the tracker explicitly defines the parent as independently closable.
- If a parent issue was split into child issues, do not close it merely because a broad skeleton exists.
- Before closing a parent PRD, verify related child issue states by exact issue numbers, not only by broad issue-search output.
- After closing child issues or a parent PRD, verify the live tracker state again by exact issue numbers before final response.
- If the session resumes, compacts, or is interrupted after closeout work but before the final response, rerun exact issue-state checks, final commit-SHA lookup, and `git status --short` before reporting completion.
- If the session resumes or compacts after the pre-close audit but before issue-close commands, treat the audit as still usable only when current context contains the original audit table or a compacted summary preserving issue, acceptance criterion or conformance check, evidence, status, and that every in-scope row is `satisfied`. If that shape is missing or ambiguous, repost or expand the audit before running any close command.
- If the issue breakdown is wrong, comment with the proposed tracker correction instead of closing mismatched issues.
- Run a final `git status --short`. For untracked verification artifacts, either remove them if safe, stage them if they are intended evidence, or explicitly report them in the final response.

Large tracker body workflow: for long parent rollups or child-family audits, compose the body in a temporary file under `/tmp`, inspect the exact file contents before posting, post with the tracker CLI's `--body-file` option, capture the resulting issue/comment URL or exact reference, and keep the staging path out of the published body. Use an interactive editor when available; when no editor is available or shell writes are constrained, create the `/tmp` body with the environment-approved file-edit mechanism, keep it outside the repo, and still inspect the exact file before posting. For GitHub, `gh issue close` only accepts an inline `--comment`, not `--body-file`; post long evidence first with `gh issue comment --body-file <file>`, capture that comment URL, then close with a short inline pointer to the evidence comment. Use this pattern for parent rollups and any long child comment; reserve inline `--body` for short child comments only.

Long parent rollup or child-family audit bodies must include this table shape, either inline or by linking an already-posted durable audit sink:

| Issue | Acceptance criterion or conformance check | Evidence | Status |
|---|---|---|---|
| #N | ... | commit/tests/browser route/store seam/etc. | satisfied / blocked / not done |

Then inspect the exact body before posting:

```bash
body="/tmp/worldloom-closeout-<issue-or-prd>.md"
$EDITOR "$body"
# If no interactive editor is available, create the body with the environment-approved file-edit mechanism instead.
sed -n '1,240p' "$body"
rg -n "Acceptance criterion or conformance check|Status|satisfied|blocked|not done|Review:|Review fallback:|Principles/ADR conformance:|Local-only SHA:|not remote-reachable because|local-only closeout is acceptable because|browser smoke|browser evidence" "$body"
comment_url="$(gh issue comment <issue> --body-file "$body")"
gh issue close <issue> --reason completed --comment "Completed; evidence: $comment_url"
```

Do not leave temporary body files in the repo unless they are intentional committed evidence.

Local-only SHA preflight: if the final SHA is not reachable from the intended remote branch, paste the copy-ready `Local-only SHA:` sentence below into the durable rollup or closeout comment before any close command. A bare `Local-only SHA: <sha>` line is not enough. The sentence must state both why the SHA is not remote-reachable and why local-only closeout is acceptable.

Do not embed the final SHA inside a durable artifact that is being committed in that same final commit. Amending the commit changes the SHA and makes the artifact stale. In that case, identify the implementation by fixed point and subject inside the committed artifact, then put the final SHA in tracker closeout comments and the final response.

Mechanical audit-shape stop: before entering the closeout command gate, inspect the posted audit table. If it lacks both `Acceptance criterion or conformance check` and `Status` columns, if any status uses `PASS`, `OK`, `done`, checkmarks, or prose instead of the literal `satisfied`, `blocked`, or `not done`, or if any issue row summarizes multiple acceptance checkboxes without naming each one, stop and expand the audit before running any issue-close command.

Mandatory closeout self-check before any `gh issue close`, `glab issue close`, or equivalent: the audit table must have exact `Acceptance criterion or conformance check` and `Status` columns, every acceptance checkbox or conformance check must be named explicitly, and every row for the issue being closed must be `satisfied`.

Closeout artifact body check: before running any closeout command, inspect the exact body that will be posted to the issue or the exact linked durable rollup body that the issue comment will cite. The body must contain the final SHA, verification evidence, review evidence, any required Principles/ADR conformance phrase or approved exception, and, when the SHA is local-only, the full `Local-only SHA: <sha> is not remote-reachable because <reason>; local-only closeout is acceptable because <reason>.` sentence. When any in-scope issue or parent PRD has a `## Principles` section, grep or visually verify that the closeout body or linked durable rollup contains the exact string `Principles/ADR conformance:` before running any close command. If one durable parent rollup covers several child issues, verify this once against that rollup and cite it from each child closeout comment.

Copy-ready closeout lines:

- `Principles/ADR conformance: no deliberate exceptions.`
- `Principles/ADR conformance: deliberate steward-approved exception: <exception and approval source>.`
- `Local-only SHA: <sha> is not remote-reachable because <reason>; local-only closeout is acceptable because <user request/repo policy>.`

Closeout preflight scratchpad: before any `gh issue comment`, `gh issue close`, `glab issue close`, or equivalent closeout command, fill this in the conversation or durable audit sink and make the `Closeout gate passed:` line visible:

```markdown
Closeout preflight:
- Audit sink: <conversation/comment URL/issue reference/body file inspected>
- Body file(s) inspected: <paths or N/A>
- Final SHA: <sha>
- Remote reachability: <remote branch contains sha / no remote branch contains sha>
- Principles/ADR conformance: <present/N/A>
- Local-only SHA: <full explanatory sentence present/N/A>
- Review evidence: <Review:/Review fallback: line or reference>
- Browser evidence freshness: <rerun/N/A/blocked, with route/action/outcome when applicable>
- Child states verified: <yes/N/A, exact issue numbers>

Closeout gate passed: audit sink <conversation/comment URL/issue reference>; review evidence <line/reference>; final SHA <sha>; Principles/ADR conformance <present/N/A>; Local-only SHA <full explanatory sentence present/N/A>; child states verified <yes/N/A>; browser evidence <present/N/A/blocked>.
```

Last body-check before first tracker mutation: immediately before the first `gh issue comment`, `gh issue close`, `glab issue close`, or equivalent closeout command, inspect the exact body or linked durable rollup one final time and write this line in the conversation or durable audit sink:

`Closeout body check passed: audit table columns exact; every acceptance checkbox or conformance check named; every status literal satisfied/blocked/not done; final SHA present; verification evidence present; review evidence present; Principles/ADR conformance string present or N/A; full Local-only SHA explanatory sentence present or N/A; browser evidence present/N/A/blocked; exact fixed child inline comment inspected <yes/N/A>.`

Use a targeted grep plus visual inspection. This command is a starting point, not a substitute for checking grouped criteria and literal status values:

```bash
rg -n "Acceptance criterion or conformance check|Status|satisfied|blocked|not done|Review:|Review fallback:|Principles/ADR conformance:|Local-only SHA:|not remote-reachable because|local-only closeout is acceptable because|browser smoke|browser evidence|Closeout body check passed" "$body"
```

If the body uses `Complete`, `PASS`, `OK`, checkmarks, or prose instead of literal `satisfied`, `blocked`, or `not done`, if any row hides multiple acceptance checkboxes without naming them, or if an affected issue or parent PRD has a `## Principles` section but the body lacks the exact string `Principles/ADR conformance:`, stop and repair the body before any tracker mutation.

Closeout command gate: do not run `gh issue close`, `glab issue close`, or equivalent until all of these are true:

- The pre-close audit table has been posted or otherwise captured, and every row for the issue being closed is `satisfied`.
- Review evidence from section 3 is present, either as `code-review` output or an explicit fallback record.
- The final commit SHA is known and matches the tree that passed required verification.
- If any affected issue or parent PRD has a `## Principles` section, the closeout comment or linked durable audit sink includes `Principles/ADR conformance: no deliberate exceptions` or names the deliberate steward-approved exception.
- For remote tracker closeout that cites a commit, the final SHA is reachable from the intended remote branch, or closeout evidence includes the full `Local-only SHA: <sha> is not remote-reachable because <reason>; local-only closeout is acceptable because <reason>.` sentence. Local-only closeout is acceptable only when the user requested implementation/tracker closeout without push/PR and no repo policy requires remote-linked commits; in that case, the closeout comments and final response must explicitly say the SHA is not remote-reachable. If the user requested push/PR/publish or repo policy requires remote-linked commits, push before closeout.
- If the issue body, PRD text, acceptance criteria, or implementation includes UI/browser-visible behavior, closeout evidence includes a real browser smoke with route, action path, and observed outcome, an explicit blocked note explaining why that smoke could not run, or `browser smoke N/A` for docs/process-only work that only inventories or cites UI/browser behavior without changing browser-consumed surfaces. For browser-consumed API-only changes, browser-executed `fetch` evidence with observed status/JSON is acceptable; for localhost APIs, use a same-origin localhost page rather than `data:` or `about:blank`.
- For parent PRD closure, exact related child issue states have been verified by issue number, including any children beyond the requested scope noted in the ledger.

After checking every gate, write this literal line in the conversation or closeout audit before the first close command:

`Closeout gate passed: audit sink <conversation/comment URL/issue reference>; review evidence <line/reference>; final SHA <sha>; Principles/ADR conformance <present/N/A>; Local-only SHA <full explanatory sentence present/N/A>; child states verified <yes/N/A>; browser evidence <present/N/A/blocked>.`

Use this compact pre-close audit shape unless the issue set needs more detail:

| Issue | Acceptance criterion or conformance check | Evidence | Status |
|---|---|---|---|
| #N | ... | commit/tests/browser route/store seam/etc. | satisfied / blocked / not done |

Do not close an issue until its audit rows are posted or otherwise captured in an allowed durable sink, and every row for that issue is `satisfied`.
