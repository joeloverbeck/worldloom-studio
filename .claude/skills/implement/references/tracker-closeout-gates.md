# Tracker Closeout Gates

Read this before declaring completion, before drafting issue closeout evidence,
and immediately before any tracker mutation such as `gh issue comment`,
`gh issue close`, `glab issue close`, or equivalent.

For child-family sequencing, fixed-template child comments, and parent rollup URL
handling, also read [child-family-closeout.md](child-family-closeout.md).
For long body files and copy-ready body templates, also read
[closeout-templates.md](closeout-templates.md).

## Contents

- [Final Tracker Mutation Gate](#final-tracker-mutation-gate)
- [Tracker Mutation Hard-Stop Checklist](#tracker-mutation-hard-stop-checklist)
- [Non-Bypassable Closeout Gate](#non-bypassable-closeout-gate)
- [General Closeout Rules](#general-closeout-rules)
- [Local-Only SHA and Body Checks](#local-only-sha-and-body-checks)
- [Closeout Command Gate](#closeout-command-gate)

## Final Tracker Mutation Gate

Before declaring completion, closing issues, or closing a parent PRD:

- Immediately before the first `gh issue comment`, `gh issue close`, `glab issue close`, or equivalent tracker mutation, produce the exact `Closeout preflight:` block and exact `Closeout gate passed: audit sink ...` line from this section in the conversation or durable audit sink. This is required even when the detailed audit is in a parent rollup body.
- If the final SHA is not remote-reachable, the durable rollup or closeout comment must contain a line that starts exactly `Local-only SHA:` and follows the full copy-ready sentence. Reject `Local-only SHA status:`, `local-only reachability note`, or any other paraphrase.
- Run the closeout body validators that apply when a local checkout has them available, then still visually inspect grouped criteria and literal statuses.

Closeout validator matrix:

| Closeout mode | Validator | Flags |
|---|---|---|
| Any implement closeout body | `node .claude/skills/implement/scripts/validate-closeout-body.mjs "$body"` | Add `--closing` for bodies used to close issues, `--principles` when any in-scope issue or parent PRD has a `## Principles` section, `--local-only` when the final SHA is not remote-reachable, and `--review-fallback` when local code-review fallback was used. |
| Fixed-template child closeout before the parent rollup URL exists | `node .claude/skills/implement/scripts/validate-closeout-body.mjs "$body"` | Add `--fixed-child-pending`; do not combine it with `--fixed-child`. |
| Fixed-template child closeout after the parent rollup URL is known and the body contains the exact child inline close comment with the real URL | `node .claude/skills/implement/scripts/validate-closeout-body.mjs "$body"` | Add `--fixed-child`; do not combine it with `--fixed-child-pending`. |
| TDD evidence in a parent PRD rollup | `node .claude/skills/tdd/scripts/validate-tdd-closeout-body.mjs "$body"` | Add `--parent-rollup` so the compact parent-rollup TDD table is enforced. |
| Local code-review fallback evidence | `node .claude/skills/code-review/scripts/validate-review-fallback-body.mjs "$body"` | Add `--implement`; add `--child-family` for child-family/parent-rollup closeout; add `--immediate-fix` when review findings were fixed before closeout or the fallback gate says `immediate-fix block yes`; add `--tdd` when TDD evidence is present, or `--tdd-parent-rollup` when TDD evidence is in a parent-rollup compact table. |

Everything-active closeout recipe: for 4+ child issues using a parent PRD rollup, a local-only final SHA, invoked TDD, local code-review fallback, fixed-template child comments, and browser/manual proof, validate the inspected parent body before the first tracker mutation with:

```bash
node .claude/skills/tdd/scripts/validate-tdd-closeout-body.mjs "$body" --parent-rollup
node .claude/skills/code-review/scripts/validate-review-fallback-body.mjs "$body" --implement --child-family --tdd-parent-rollup
node .claude/skills/implement/scripts/validate-closeout-body.mjs "$body" --closing --principles --local-only --fixed-child-pending --review-fallback
```

If review fallback findings were fixed before closeout, or the fallback gate says
`immediate-fix block yes`, use this code-review validator command instead:

```bash
node .claude/skills/code-review/scripts/validate-review-fallback-body.mjs "$body" --implement --child-family --tdd-parent-rollup --immediate-fix
```

Drop only the flags whose conditions do not apply. After the parent rollup URL is known and the local body has been patched to contain the exact final child inline close comment with that real URL, rerun the implement validator with `--fixed-child` instead of `--fixed-child-pending` before relying on the patched body. Passing validators are aids, not substitutes for checking that every acceptance checkbox is named explicitly.

## Tracker Mutation Hard-Stop Checklist

- Exact pre-close audit exists in an allowed durable sink or inspected body, with columns `Acceptance criterion or conformance check` and `Status`.
- Every acceptance checkbox or conformance check is named explicitly; no row hides multiple unnamed criteria.
- Every row for the issue being closed uses the literal status `satisfied`; any `blocked` or `not done` row keeps that issue open.
- Acceptance exactness challenge passed: compare each `satisfied` row against the original issue/PRD wording and ensure the evidence proves the exact required condition. Reject softened or substituted proof such as `equivalent`, `representative`, `nearby`, `legacy surface`, `API-only`, `same data`, or `same session class` unless the acceptance criterion itself permits that substitution. If exact evidence is missing, mark the row `blocked` or `not done` and keep the issue open.
- Placeholder sweep passed: the closeout body has no unresolved placeholder-like angle tokens such as `<context>`, `<sha>`, `<reason>`, `<issue>`, `<parent>`, `<child>`, or `<parent-rollup-url pending>` in evidence rows, URLs, final comments, or preflight fields. Use prose or a filled concrete value instead. URL autolinks and common Markdown/HTML tags are allowed only when intentional.
- Final SHA is known and matches the tree that passed required verification.
- Verification evidence is present.
- TDD evidence is present when the repo `tdd` skill was invoked, including the `Pre-red recovery status:` closeout preflight field, the full fielded `TDD evidence gate passed: durable sink ...` line, or an explicit `N/A because no tdd skill was invoked`.
- Review evidence is present as `Review:` or `Review fallback:`, and local fallback includes or links the full fallback block from [review-evidence.md](review-evidence.md).
- `Principles/ADR conformance:` is present when any affected issue or parent PRD has a `## Principles` section; otherwise it is explicitly N/A.
- Local-only commits use the full `Local-only SHA: <sha> is not remote-reachable because <reason>; local-only closeout is acceptable because <reason>.` sentence before tracker closeout.
- Browser evidence is present, N/A with reason, or blocked with reason. `browser smoke N/A` is acceptable for docs/process-only work that only inventories or cites UI/browser behavior without changing browser-consumed surfaces, or when exact issue/PRD acceptance explicitly declares browser/manual proof N/A because the browser contract, routes, rendered behavior, validation response, fixtures, and action path are unchanged. Console state is recorded when browser evidence is present or explicitly N/A/blocked, and freshness has been checked against files touched after the smoke.
- Browser/manual freshness is checked after the final commit and final verification edits, not just after the last behavior edit. If files changed after the last browser/manual proof, list each path or group, classify whether it affects UI/routes/browser-consumed API/fixtures/action path, and record rerun/not-affected/blocked in the closeout body.
- For an active browser/manual rerun on the final tree, use validator-safe wording from [closeout-templates.md](closeout-templates.md), such as `browser smoke rerun passed on final tree`, and name the route/action/API/fixture plus observed outcome.
- For fixed-template child closeout, the exact inline child close comment has been inspected once before the first child close command, after the parent rollup URL is available when the comment cites a parent rollup.
- For fixed-template child closeout after a parent rollup URL is captured, the conversation or durable audit sink contains this exact line before the first child close command: `Fixed child final inline close comment inspected: Completed by <sha>. Evidence: <parent rollup comment URL>`.

If any checklist item is false or only implied, stop and repair the audit body or preflight before any `gh issue comment`, `gh issue close`, `glab issue close`, or equivalent command.

## Non-Bypassable Closeout Gate

- Before any `gh issue comment`, `gh issue close`, `glab issue close`, or equivalent closeout command, fill in the closeout preflight scratchpad in [closeout-templates.md](closeout-templates.md) and make the literal `Closeout gate passed:` line visible in the conversation or durable audit sink.
- This gate applies even when a parent rollup will carry the detailed audit. The rollup URL is not a substitute for the visible gate line; it is the audit sink named by that line.
- For parent-rollup closeout, the pre-post audit sink may be the inspected `/tmp` body path before the tracker comment URL exists. After posting the parent rollup, capture the returned URL and use that URL for every child closeout reference.
- If any required preflight field is unknown, missing, or only implied, stop and fill it before posting comments or closing issues.
- For fixed-template child closeout, the first parent rollup comment may be posted before the real parent rollup URL exists, but after that URL is captured and before the first child close command, make this exact line visible in the conversation or durable audit sink: `Fixed child final inline close comment inspected: Completed by <sha>. Evidence: <parent rollup comment URL>`. The command-line `--comment` text must match the inspected line's `Completed by ... Evidence: ...` text exactly.
- Literal-token validation hard stop: immediately before the first tracker mutation, inspect the exact body or linked durable rollup and the visible preflight line for the exact labels `Principles/ADR conformance:`, `Local-only SHA:` when the SHA is local-only, and `Closeout gate passed: audit sink`. Do not accept paraphrases such as "local-only reachability note present" or "closeout gate passed" without the copy-ready line. If the issue has no Principles section, the exact `Principles/ADR conformance:` label still appears in the preflight or body with `N/A`.
- Before first tracker mutation hard stop: write both exact headings/lines below in the conversation or durable audit sink before the first `gh issue comment`, `gh issue close`, `glab issue close`, or equivalent command. Do not paraphrase them.
  - `Closeout preflight:`
  - `Closeout gate passed: audit sink <conversation/comment URL/issue reference/inspected body file path before parent URL exists>; review evidence <line/reference>; TDD evidence <present/N/A>; final SHA <sha>; Principles/ADR conformance <present/N/A>; Local-only SHA sentence <full explanatory sentence present/N/A>; child states verified <yes/N/A>; browser evidence <present/N/A/blocked>.`

Last stop before tracker mutation: immediately before the first `gh issue comment`, `gh issue close`, `glab issue close`, or equivalent tracker command, pause and prove the implement closeout gate itself passed. Passing the TDD validator and the code-review fallback validator is not sufficient; the implement validator and the visible closeout gate lines are separate requirements.

For the common all-active parent-rollup closeout, run the implement validator against the exact inspected body before the first tracker mutation:

```bash
node .claude/skills/implement/scripts/validate-closeout-body.mjs "$body" --closing --principles --local-only --fixed-child-pending --review-fallback
```

Drop only flags whose conditions do not apply. If the parent rollup URL has already been captured and the body contains the exact final child inline close comment with that real URL, use `--fixed-child` instead of `--fixed-child-pending`. Then make both visible lines present in the conversation or durable audit sink, exactly:

- `Closeout preflight:`
- `Closeout gate passed: audit sink <conversation/comment URL/issue reference/inspected body file path before parent URL exists>; review evidence <line/reference>; TDD evidence <present/N/A>; final SHA <sha>; Principles/ADR conformance <present/N/A>; Local-only SHA sentence <full explanatory sentence present/N/A>; child states verified <yes/N/A>; browser evidence <present/N/A/blocked>.`

## General Closeout Rules

- Produce a pre-close per-issue audit before closing any issue: every acceptance criterion and required principles/ADR conformance check mapped to concrete evidence, with status `satisfied`, `blocked`, or `not done`. Default to one row per acceptance criterion or conformance check; do not group acceptance checkboxes into one prose row unless the row names each checkbox explicitly. Capture the audit in one durable sink before closeout: the conversation, a tracker comment on the issue or parent PRD, or another durable tracker artifact. For large child-issue families where the explicit row table would be unwieldy in conversation, prefer one parent PRD tracker comment when practical, then link or cite that durable audit sink from each child closeout comment. If the audit is not in the conversation, each affected closeout comment must link the durable audit sink.
- Before drafting the final closeout audit, confirm the current context contains every in-scope issue's exact acceptance criteria and Principles/ADR checks. If compaction, interruption, or a summary leaves any criterion implicit, re-fetch the exact issue bodies/comments or use a preserved audit table before writing rows; do not reconstruct acceptance text from memory or broad issue summaries.
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

## Local-Only SHA and Body Checks

Local-only SHA preflight: if the final SHA is not reachable from the intended remote branch, paste the copy-ready `Local-only SHA:` sentence below into the durable rollup or closeout comment before any close command. A bare `Local-only SHA: <sha>` line is not enough. The sentence must state both why the SHA is not remote-reachable and why local-only closeout is acceptable.

The preflight scratchpad keeps the exact `Local-only SHA:` label because the body validators and literal-token checks need it. The visible `Closeout gate passed:` line calls that field `Local-only SHA sentence` so the full copy-ready sentence can be pasted without producing `Local-only SHA Local-only SHA: ...`.

Do not embed the final SHA inside a durable artifact that is being committed in that same final commit. Amending the commit changes the SHA and makes the artifact stale. In that case, identify the implementation by fixed point and subject inside the committed artifact, then put the final SHA in tracker closeout comments and the final response.

Mechanical audit-shape stop: before entering the closeout command gate, inspect the posted audit table. If it lacks both `Acceptance criterion or conformance check` and `Status` columns, if any status uses `PASS`, `OK`, `done`, checkmarks, or prose instead of the literal `satisfied`, `blocked`, or `not done`, or if any issue row summarizes multiple acceptance checkboxes without naming each one, stop and expand the audit before running any issue-close command.

Mandatory closeout self-check before any `gh issue close`, `glab issue close`, or equivalent: the audit table must have exact `Acceptance criterion or conformance check` and `Status` columns, every acceptance checkbox or conformance check must be named explicitly, and every row for the issue being closed must be `satisfied`.

Closeout artifact body check: before running any closeout command, inspect the exact body that will be posted to the issue or the exact linked durable rollup body that the issue comment will cite. The body must contain the final SHA, verification evidence, TDD evidence or N/A, review evidence, any required Principles/ADR conformance phrase or approved exception, browser console state or N/A/blocked, final browser/manual freshness delta or N/A, and, when the SHA is local-only, the full `Local-only SHA: <sha> is not remote-reachable because <reason>; local-only closeout is acceptable because <reason>.` sentence. When any in-scope issue or parent PRD has a `## Principles` section, grep or visually verify that the closeout body or linked durable rollup contains the exact string `Principles/ADR conformance:` before running any close command. If one durable parent rollup covers several child issues, verify this once against that rollup and cite it from each child closeout comment. If using fixed-template child closeout, also verify that the exact final inline child close comment text with the real parent URL has been inspected; a summary that child comments will cite the rollup is not enough.

Copy-ready closeout lines:

- `Principles/ADR conformance: no deliberate exceptions.`
- `Principles/ADR conformance: deliberate steward-approved exception: <exception and approval source>.`
- `Local-only SHA: <sha> is not remote-reachable because <reason>; local-only closeout is acceptable because <user request/repo policy>.`

Last body-check before first tracker mutation: immediately before the first `gh issue comment`, `gh issue close`, `glab issue close`, or equivalent closeout command, inspect the exact body or linked durable rollup one final time and write this line in the conversation or durable audit sink:

`Closeout body check passed: audit table columns exact; every acceptance checkbox or conformance check named; every status literal satisfied/blocked/not done; final SHA present; verification evidence present; TDD evidence present or N/A; review evidence present; Principles/ADR conformance string present or N/A; full Local-only SHA explanatory sentence present or N/A; browser evidence present/N/A/blocked; browser console state recorded when browser evidence is present or N/A/blocked; final browser/manual freshness delta present/N/A; exact fixed child inline comment inspected <yes/N/A>.`

Use targeted greps plus visual inspection. These commands are starting points, not substitutes for checking grouped criteria and literal status values:

```bash
rg -n "<[^>\n]{1,120}>" "$body"
rg -n "Closeout gate passed: audit sink|Closeout body check passed|Final SHA:|Verification:|Review:|Review fallback:|TDD evidence gate passed|Principles/ADR conformance:|Local-only SHA:" "$body"
rg -n "Acceptance criterion or conformance check|Status|satisfied|blocked|not done" "$body"
rg -n "browser smoke|browser evidence|Console state|Browser console state|Final freshness delta|Fixed child inline close comment|Fixed child final inline close comment inspected" "$body"
```

If any inspection output is truncated, treat that output as not inspected. Split the check into bounded token sweeps and targeted excerpts before any tracker mutation, for example one command for gate/evidence labels, one command for the audit table header and status literals, and a short table excerpt around the affected issue rows. The body-check line is valid only after an untruncated inspection plus visual confirmation of grouped criteria and literal statuses.

If the body uses `Complete`, `PASS`, `OK`, checkmarks, or prose instead of literal `satisfied`, `blocked`, or `not done`, if any row hides multiple acceptance checkboxes without naming them, if an affected issue or parent PRD has a `## Principles` section but the body lacks the exact string `Principles/ADR conformance:`, if local-only closeout lacks the exact `Local-only SHA:` label and full explanatory sentence, if the visible gate line lacks `Closeout gate passed: audit sink`, or if an unresolved placeholder-like angle token remains, stop and repair the body before any tracker mutation.

## Closeout Command Gate

Do not run `gh issue close`, `glab issue close`, or equivalent until all of these are true:

- The pre-close audit table has been posted or otherwise captured, and every row for the issue being closed is `satisfied`.
- Review evidence from [review-evidence.md](review-evidence.md) is present, either as `code-review` output or an explicit fallback record.
- TDD evidence is present when the repo `tdd` skill was invoked, including the `Pre-red recovery status:` closeout preflight field and the full fielded `TDD evidence gate passed: durable sink ...` line, or the closeout evidence explicitly says it is N/A because no `tdd` skill was invoked.
- The final commit SHA is known and matches the tree that passed required verification.
- If any affected issue or parent PRD has a `## Principles` section, the closeout comment or linked durable audit sink includes `Principles/ADR conformance: no deliberate exceptions` or names the deliberate steward-approved exception.
- For remote tracker closeout that cites a commit, the final SHA is reachable from the intended remote branch, or closeout evidence includes the full `Local-only SHA: <sha> is not remote-reachable because <reason>; local-only closeout is acceptable because <reason>.` sentence. Local-only closeout is acceptable only when the user requested implementation/tracker closeout without push/PR and no repo policy requires remote-linked commits; in that case, the closeout comments and final response must explicitly say the SHA is not remote-reachable. If the user requested push/PR/publish or repo policy requires remote-linked commits, push before closeout.
- If the issue body, PRD text, acceptance criteria, or implementation includes UI/browser-visible behavior, closeout evidence includes a real browser smoke with route, action path, and observed outcome, an explicit blocked note explaining why that smoke could not run, `browser smoke N/A` for docs/process-only work that only inventories or cites UI/browser behavior without changing browser-consumed surfaces, or `browser smoke N/A` when exact issue/PRD acceptance explicitly declares browser/manual proof N/A because the browser contract, routes, rendered behavior, validation response, fixtures, and action path are unchanged. For browser-consumed API-only changes without that explicit issue-level N/A, browser-executed `fetch` evidence with observed status/JSON is acceptable; for localhost APIs, use a same-origin localhost page rather than `data:` or `about:blank`.
- For parent PRD closure, exact related child issue states have been verified by issue number, including any children beyond the requested scope noted in the ledger.
- For fixed-template child closeout, after the parent rollup URL is captured and before the first child close command, this exact line has been written in the conversation or durable audit sink: `Fixed child final inline close comment inspected: Completed by <sha>. Evidence: <parent rollup comment URL>`, and each child close command uses the same inspected `Completed by ... Evidence: ...` text.

After checking every gate, write this literal line in the conversation or closeout audit before the first close command:

`Closeout gate passed: audit sink <conversation/comment URL/issue reference/inspected body file path before parent URL exists>; review evidence <line/reference>; TDD evidence <present/N/A>; final SHA <sha>; Principles/ADR conformance <present/N/A>; Local-only SHA sentence <full explanatory sentence present/N/A>; child states verified <yes/N/A>; browser evidence <present/N/A/blocked>.`

Use this compact pre-close audit shape unless the issue set needs more detail:

| Issue | Acceptance criterion or conformance check | Evidence | Status |
|---|---|---|---|
| #N | ... | commit/tests/browser route/store seam/etc. | satisfied / blocked / not done |

Do not close an issue until its audit rows are posted or otherwise captured in an allowed durable sink, and every row for that issue is `satisfied`.
