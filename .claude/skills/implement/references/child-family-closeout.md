# Child-Family Closeout

Read this whenever implementation scope includes parent PRDs, 2+ child issues,
fixed-template child closeout comments, or a parent rollup URL that child issues
will cite.

## Parent Rollup Choice

Small child-family parent rollup: a parent PRD rollup is allowed for 2-3 child issues when it is the clearest durable sink for shared evidence, such as local-only SHA rationale, TDD evidence, review fallback evidence, or parent closeout. Use the validator matrix in [tracker-closeout-gates.md](tracker-closeout-gates.md) according to the evidence shape: `--child-family` when review fallback covers a PRD child family, `--tdd-parent-rollup` when TDD evidence uses the parent-rollup compact table, and `--fixed-child-pending` or `--fixed-child` according to the fixed-child state below. Still keep the ledger and audit rows per issue.

Closeout execution order for 4+ in-scope child issues defaults to: post the parent PRD rollup/audit comment first, capture its URL or exact comment reference, cite that rollup from each child closeout comment, close child issues, verify child states by exact issue number, then close the parent. Use per-child full audit comments instead only when no parent rollup is used.

For 4+ in-scope child issues, follow this command sequence unless you explicitly choose and state a different durable audit sink:

1. Draft the parent rollup/audit body under `/tmp`.
2. Inspect that exact parent body and confirm it contains the audit table, final SHA, verification evidence, TDD evidence or N/A, review evidence, `Principles/ADR conformance:`, the full `Local-only SHA: <sha> is not remote-reachable because <reason>; local-only closeout is acceptable because <reason>.` sentence when applicable, browser evidence or N/A/blocked wording with browser console state and the final post-commit freshness delta, and a child state snapshot before child closeout.
3. Post the parent rollup with `gh issue comment <parent> --body-file <parent-body>`.
4. Capture the returned parent comment URL.
5. Draft or patch every child closeout body so it cites the parent rollup URL.
6. Inspect every child body before posting.
7. Post each child closeout with `gh issue comment <child> --body-file <child-body>`, capture the returned child comment URL, then close with `gh issue close <child> --reason completed --comment "Completed; evidence: <child-comment-url>"`. Never use `--comment-file` with `gh issue close`; this GitHub command accepts inline `--comment` only.
8. Verify each child state by exact issue number, then comment on or patch the parent rollup with post-child closure verification before closing the parent.

## Fixed-Template Child Closeout

Fixed-template child closeout alternate: if every child closeout is the same short inline comment that only cites an inspected parent rollup URL, separate child body files and child comment URLs are not required. Inspecting a body file does not count unless that exact text is posted unchanged. Use this explicit sequence instead:

1. Before the parent rollup is posted, draft and inspect the inline `--comment` template. Use stable parent-body wording that is true before and after posting, for example `Fixed child inline close comment: Completed by <sha>. Evidence: this parent rollup comment URL`. Use `parent URL pending` only in a local scratchpad that will not be posted; if pending wording is posted by mistake, patch the posted parent comment with the real URL and rerun validation with `--fixed-child` before closing children.
2. After the parent rollup is posted and the real URL is captured, substitute the URL and inspect the exact final inline `--comment` string once before the first child close command. Prefer assigning it to a shell variable and echoing that variable before use so the inspected text is the posted text; otherwise paste the exact final text into the durable sink before using it.
3. The inspection artifact must be the exact child close comment text with the real parent URL. A sentence such as "child comments should cite the parent rollup URL" is not inspection and does not satisfy this gate.
4. Close each child with `gh issue close <child> --reason completed --comment "<inspected exact inline string>"`; do not shorten, reword, or replace it at the command line.
5. Verify each child state by exact issue number before commenting on or closing the parent.
6. For small child-family fixed-template closeout, record the post-child closure verification in a parent rollup patch, a follow-up parent comment, or the parent close comment. The durable text must name exact issue numbers and CLOSED states before the parent is considered ready to close.

Any child-specific evidence, wording, or variation still needs its own inspected child body or full inline comment before posting.

## Parent Rollup URL Handling

Self-referential parent rollup URL path: if the parent rollup body itself needs to contain the final child inline close comment with the parent rollup comment URL, choose one of these approaches before the first child close command:

- Prefer wording in the body that is true before posting and after posting, such as `Evidence: this parent rollup comment URL`, then use the captured real URL in child close comments.
- Or post the parent body with a unique placeholder, capture the returned parent comment URL, replace the placeholder in the local body, verify no placeholder remains, and patch the posted comment with `gh api repos/{owner}/{repo}/issues/comments/<comment-id> --method PATCH -F body=@<body-file>`. After patching, run the body-check grep or validator again against the patched local body using `--fixed-child` when that flag applies, and inspect the exact child inline comment with the real URL.
- Do not leave `parent URL pending`, `pending parent rollup URL`, `<parent-rollup-url pending>`, or similar placeholder wording in a posted parent rollup. If placeholder wording was posted, patch the posted comment and rerun the validator with `--fixed-child` before child or parent closure.

Fixed-child validator state:

- Pending state: before the parent rollup URL exists for an unposted local body, or when the parent body uses stable self-referential wording such as `Evidence: this parent rollup comment URL`, validate the inspected body with `--fixed-child-pending`; the body must not contain posted-placeholder wording such as `parent URL pending`. After posting, capture the real URL and inspect the exact final inline child close comment before the first child close command.
- Final-body state: when the body contains the exact final child inline close comment with the real parent rollup URL, validate with `--fixed-child`.
- Placeholder state: when a placeholder was posted first, patch the posted parent comment with the real URL, verify no placeholder remains, rerun the body-check grep or validator with `--fixed-child`, and inspect the exact child inline comment with the real URL.
