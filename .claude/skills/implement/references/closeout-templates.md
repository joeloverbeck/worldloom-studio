# Closeout Templates

Read this before drafting parent rollups, child-family audit bodies, `/tmp`
body files, closeout preflight scratchpads, or final body-check commands.

## Large Tracker Body Workflow

Large tracker body workflow: for long parent rollups or child-family audits, compose the body in a temporary file under `/tmp`, inspect the exact file contents before posting, post with the tracker CLI's `--body-file` option, capture the resulting issue/comment URL or exact reference, and keep the staging path out of the published body. Use an interactive editor when available; when no editor is available or shell writes are constrained, create the `/tmp` body with the environment-approved file-edit mechanism, keep it outside the repo, and still inspect the exact file before posting. For GitHub, `gh issue close` only accepts an inline `--comment`, not `--body-file`; post long evidence first with `gh issue comment --body-file <file>`, capture that comment URL, then close with a short inline pointer to the evidence comment. Use this pattern for parent rollups and any long child comment; reserve inline `--body` for short child comments only.

For large bodies in constrained editors or Codex sessions, build the `/tmp` file in bounded sections. After construction, verify the file exists and has the expected rough shape with `test -f "$body"`, `wc -l "$body"`, targeted `sed -n` ranges, a placeholder sweep for unresolved angle-token placeholders such as `<context>` or `<parent-rollup-url pending>`, and the applicable validators before any tracker mutation. If creation output, inspection output, or context compaction makes completeness uncertain, treat the body as untrusted: first rerun `test -f`, `wc -l`, targeted excerpts for the header, TDD/review/browser sections, audit table, and closeout gate lines, then rerun the placeholder sweep and every applicable validator before posting or closing.

Long parent rollup or child-family audit bodies must include this table shape, either inline or by linking an already-posted durable audit sink:

| Issue | Acceptance criterion or conformance check | Evidence | Status |
|---|---|---|---|
| #N | ... | commit/tests/browser route/store seam/etc. | satisfied / blocked / not done |

For parent PRD rollups, including 4+ child issues and small child families that choose a parent rollup as the durable sink, start from this body shape unless the issue set needs a richer audit:

```markdown
Implementation closeout for #<parent>

Final SHA: <sha>
Local-only SHA: <sha> is not remote-reachable because <reason>; local-only closeout is acceptable because <user request/repo policy>. / N/A because <remote branch contains sha>
Verification:
- `<command>`: <passed/failed/blocked and relevant scope>
TDD evidence:
TDD closeout preflight:
Durable sink/body inspected: <inspected body file path before tracker URL exists / comment URL / N/A because no tdd skill was invoked>
Compact table/header: <present after structural check / N/A because no tdd skill was invoked>
Rows accounted for: <issue numbers / N/A because no tdd skill was invoked>
Pre-red recovery status: <N/A - pre-red preflight/table was visible before first red / listed with TDD recovery addendum / N/A because no red commands were run / N/A because no tdd skill was invoked / blocked because ...>
CONTEXT.md status: <present/absent/N/A>
ADRs/principles/docs status: <present/N/A>
Partial-red / red-first skip reasons: <none/listed>
Evidence-only rows freshness: <none/listed with freshness reason>
Evidence-only browser console state: <none / listed with 0 errors and 0 warnings, classified unrelated output with evidence, rerun clean session because HMR, reused session, or agent-induced setup/request error tainted proof, or N/A because no browser/manual evidence-only rows>
Existing-test contract-change rows: <none/listed expectation-rewrite rows>

| Issue | CONTEXT.md status | ADRs/principles/docs status | Seam | Red command/failure | Green command or evidence | Acceptance covered | Review fix / red-first skip reason |
|---|---|---|---|---|---|---|---|
| #N | <present/absent/N/A> | <present/N/A> | <seam or evidence-only row> | <red command/failure or N/A because ...> | <green command or evidence> | <acceptance criteria covered> | <N/A / review-fix red-first skip reason> |

For an existing-test contract-change row, use validator-exact wording:

| #N | <present/absent/N/A> | <present/N/A> | existing contract-change expectation | existing contract-change expectation in `<test file>` because <old expected behavior no longer satisfied the issue/spec contract> | `<green command>` passed | <acceptance criteria covered> | N/A |

TDD evidence gate passed: durable sink <inspected body file path before tracker URL exists / comment URL>; compact table/header <present after structural check>; seams accounted for <all listed / exceptions named>; CONTEXT.md status <present/absent/N/A>; ADRs/principles/docs status <present/N/A>; partial-red / red-first skip reasons <none/listed>; evidence-only rows <none/listed>; existing-test contract-change rows <none/listed expectation-rewrite rows>.
Review evidence:
- Review: <code-review fixed point/outcome/verification rerun>
- Review fallback: <fallback line, or N/A because code-review ran normally>
- Normal review findings fixed: N/A because review had no findings / findings found <count and source>; fixes made <files/SHA>; final Standards re-review <outcome>; final Spec re-review <outcome>; verification rerun <commands>
- Full review fallback block: <embedded below or linked adjacent durable sink; N/A because code-review ran normally>
- TDD closeout gate: <copy the code-review fallback block's TDD closeout gate field when both TDD and local review fallback were used, including the full TDD evidence gate reference; N/A because no tdd skill was invoked or code-review ran normally>
Principles/ADR conformance: <no deliberate exceptions / approved exception / N/A>
Browser evidence:
- Route/action/outcome: <route and observed result / N/A because ... / blocked because ...>
- Console state: <0 errors and 0 warnings / classified unrelated output with evidence / rerun clean session because HMR, reused session, or agent-induced setup/request error tainted proof / N/A because browser evidence is N/A or blocked>
- Final freshness delta: files touched since the last browser/manual smoke after final commit and verification edits <paths or none>; affects UI/routes/browser-consumed API/fixtures/action path <yes/no per path/group and why>; smoke freshness <rerun / not affected because changed path <path or group> leaves the evidence route/action/API/fixture <route/action/API/fixture> untouched and targeted proof <command> passed / blocked because ...>
Fixed child inline close comment: <exact final text inspected / stable self-referential parent rollup wording inspected / local pending-parent template inspected and later patched / N/A>
Fixed child final inline close comment inspected: <exact `Completed by <sha>. Evidence: <parent rollup comment URL>` line after parent URL captured / N/A before parent URL exists or non-fixed-template closeout>
Child state snapshot before child closeout: <exact issue numbers and states before closing children / N/A>
Post-child closure verification before parent closeout: <exact issue numbers and CLOSED states, or pending later parent rollup patch/follow-up parent comment/parent close comment before parent closeout>

| Issue | Acceptance criterion or conformance check | Evidence | Status |
|---|---|---|---|
| #N | ... | commit/tests/browser route/store seam/etc. | satisfied / blocked / not done |

Closeout preflight:
- Audit sink: <conversation/comment URL/issue reference/body file inspected>
- Body file(s) inspected: <paths or N/A>
- Parent rollup URL: <URL / pending because first tracker mutation has not posted it yet / N/A>
- Fixed child inline close comment: <stable self-referential parent rollup wording inspected / local pending-parent template inspected and later patched / exact final text inspected once after parent URL captured / N/A>
- Fixed child final inline close comment inspected: <exact `Completed by <sha>. Evidence: <parent rollup comment URL>` line after parent URL captured / N/A before parent URL exists or non-fixed-template closeout>
- Final SHA: <sha>
- Remote reachability: <remote branch contains sha / no remote branch contains sha>
- Principles/ADR conformance: <present/N/A>
- Local-only SHA: <full explanatory sentence present/N/A>
- TDD evidence: <present/N/A because no tdd skill was invoked>
- Review evidence: <Review:/Review fallback: line or reference>
- Browser console state: <0 errors and 0 warnings / classified unrelated output with evidence / rerun clean session because HMR, reused session, or agent-induced setup/request error tainted proof / N/A because browser evidence is N/A or blocked>
- Browser evidence freshness: <files touched since smoke; affects UI/routes/browser-consumed API/fixtures/action path yes/no and why; rerun / not affected because changed path <path or group> leaves the evidence route/action/API/fixture <route/action/API/fixture> untouched and targeted proof <command> passed / blocked because ...>
- Final post-commit freshness delta: <files touched since last browser/manual proof after final commit and verification edits; rerun / not affected because changed path <path or group> leaves the evidence route/action/API/fixture <route/action/API/fixture> untouched and targeted proof <command> passed / blocked because ...>
- Child states verified: <yes/N/A, exact issue numbers>

Closeout gate passed: audit sink <conversation/comment URL/issue reference/inspected body file path before parent URL exists>; review evidence <line/reference>; TDD evidence <present/N/A>; final SHA <sha>; Principles/ADR conformance <present/N/A>; Local-only SHA sentence <full explanatory sentence present/N/A>; child states verified <yes/N/A>; browser evidence <present/N/A/blocked>.

Closeout body check passed: audit table columns exact; every acceptance checkbox or conformance check named; every status literal satisfied/blocked/not done; final SHA present; verification evidence present; TDD evidence present or N/A; review evidence present; Principles/ADR conformance string present or N/A; full Local-only SHA explanatory sentence present or N/A; browser evidence present/N/A/blocked; browser console state recorded when browser evidence is present or N/A/blocked; final browser/manual freshness delta present/N/A; exact fixed child inline comment inspected <yes/N/A>.
```

After the parent rollup URL is captured and before the first fixed-template child close command, inspect the exact final inline child comment with the real URL. Paste or echo this exact string in the conversation or durable audit sink:

```markdown
Fixed child final inline close comment inspected: Completed by <sha>. Evidence: <parent rollup comment URL>
```

This mini-gate complements, and does not replace, the fixed-template sequence in [child-family-closeout.md](child-family-closeout.md).

Then inspect the exact body before posting:

```bash
body="/tmp/worldloom-closeout-<issue-or-prd>.md"
$EDITOR "$body"
# If no interactive editor is available, create the body with the environment-approved file-edit mechanism instead.
# If the body is large or creation output was truncated, verify existence and shape before validation.
test -f "$body"
wc -l "$body"
sed -n '1,80p' "$body"
sed -n '81,160p' "$body"
sed -n '161,240p' "$body"
# Run the applicable validator commands before posting; omit commands whose evidence type is N/A and drop only flags whose conditions do not apply.
node .claude/skills/tdd/scripts/validate-tdd-closeout-body.mjs "$body" --parent-rollup
node .claude/skills/code-review/scripts/validate-review-fallback-body.mjs "$body" --implement --child-family --tdd-parent-rollup
node .claude/skills/implement/scripts/validate-closeout-body.mjs "$body" --closing --principles --local-only --fixed-child-pending --review-fallback
rg -n "<[^>\n]{1,120}>" "$body"
rg -n "Closeout gate passed: audit sink|Closeout body check passed|Final SHA:|Verification:|Review:|Review fallback:|TDD evidence gate passed|Principles/ADR conformance:|Local-only SHA:" "$body"
rg -n "Acceptance criterion or conformance check|Status|satisfied|blocked|not done" "$body"
rg -n "browser smoke|browser evidence|Console state|Browser console state|Final freshness delta|Fixed child inline close comment|Fixed child final inline close comment inspected" "$body"
# If any inspection output is truncated, treat it as not inspected. Split the check into bounded token sweeps and short table/status excerpts before posting or closing.
comment_url="$(gh issue comment <issue> --body-file "$body")"
gh issue close <issue> --reason completed --comment "Completed; evidence: $comment_url"
```

Validator-safe active browser rerun freshness example: if browser/manual proof was rerun on the final tree after the last content change, prefer wording that says the rerun passed and names the route/action/API/fixture. Example wording:

> Final freshness delta: files touched since the last browser/manual proof after final commit and verification edits: <paths or none>; browser smoke rerun passed on final tree for route/action/API/fixture <route/action/API/fixture> with observed outcome <outcome>.

Post-smoke content-change without rerun example: if tracked files changed after browser/manual proof and the proof was not rerun, keep the route/action/outcome evidence historical. Do not say the smoke passed on the final tree. Use `Final freshness delta` to justify not-affected or blocked freshness for the changed paths. Example wording:

> Final freshness delta: files touched since the last browser/manual proof after final commit and verification edits: <paths>; not affected because changed path <path or group> leaves the evidence route/action/API/fixture <route/action/API/fixture> untouched and targeted proof `<command>` passed. / blocked because changed path <path or group> may affect the evidence route/action/API/fixture <route/action/API/fixture> and browser/manual proof was not rerun.

Post-smoke commit-only freshness example: if the final browser/manual proof ran on the same file content that was later committed, and the only post-smoke change was creating the commit metadata/SHA, write the freshness fields as content-unchanged proof rather than forcing a fake rerun. Example wording:

> Final freshness delta: files touched since the last browser/manual proof after final commit and verification edits: git commit metadata only; not affected because no tracked file content changed after the smoke, the evidence route/action/API/fixture <route/action/API/fixture> is untouched, and targeted proof `git diff HEAD -- <owned files>` is empty.

Do not leave temporary body files in the repo unless they are intentional committed evidence.

## Blocked Closeout Handoff

Use this when implementation made progress but one or more issue criteria remain `blocked` or `not done`, so tracker closeout must not run. Post it in the conversation or a durable issue comment only when it is useful for the next session; otherwise keep it in the final response.

```markdown
Blocked closeout handoff for #<parent-or-issue>

Tracker state readback:
- #<issue>: <OPEN/CLOSED> - <reason it remains open or closed>

Implementation state:
- In-scope files changed: <paths>
- Verification run: <commands and pass/fail/blocked result>
- Report/artifact paths: <paths or N/A>
- Dev/browser cleanup: <stopped / intentionally left running with reason / N/A>

Satisfied evidence:
| Issue | Acceptance criterion or conformance check | Evidence | Status |
|---|---|---|---|
| #N | <criterion exactly named> | <tests/browser/report/readback> | satisfied |

Blocked or not-done criteria:
| Issue | Acceptance criterion or conformance check | Missing proof or blocker | Next action | Status |
|---|---|---|---|---|
| #N | <criterion exactly named> | <external service/cold probe/commit/SHA/etc.> | <field test, authorization, commit, rerun, or implementation follow-up> | blocked / not done |

Commit/SHA decision:
- <final SHA and reachability, or `no implementation commit; tracker closeout blocked because no final SHA represents the verified tree`>

Review evidence:
- <Review:/Review fallback: line, or N/A because tracker closeout is blocked before review>

Next session priority:
1. <exact proof or implementation step needed>
2. <exact tracker closeout prerequisite>
```

Do not use this template as a substitute for successful closeout. Any row with status `blocked` or `not done` keeps that issue and any dependent parent PRD open.

## Closeout Preflight Scratchpad

Before any `gh issue comment`, `gh issue close`, `glab issue close`, or equivalent closeout command, fill this in the conversation or durable audit sink and make the `Closeout gate passed:` line visible:

```markdown
Closeout preflight:
- Audit sink: <conversation/comment URL/issue reference/body file inspected>
- Body file(s) inspected: <paths or N/A>
- Parent rollup URL: <URL / pending because first tracker mutation has not posted it yet / N/A>
- Fixed child inline close comment: <stable self-referential parent rollup wording inspected / local pending-parent template inspected and later patched / exact final text inspected once after parent URL captured / N/A>
- Fixed child final inline close comment inspected: <exact `Completed by <sha>. Evidence: <parent rollup comment URL>` line after parent URL captured / N/A before parent URL exists or non-fixed-template closeout>
- Final SHA: <sha>
- Remote reachability: <remote branch contains sha / no remote branch contains sha>
- Principles/ADR conformance: <present/N/A>
- Local-only SHA: <full explanatory sentence present/N/A>
- TDD evidence: <present/N/A because no tdd skill was invoked>
- Review evidence: <Review:/Review fallback: line or reference>
- Browser console state: <0 errors and 0 warnings / classified unrelated output with evidence / rerun clean session because HMR, reused session, or agent-induced setup/request error tainted proof / N/A because browser evidence is N/A or blocked>
- Browser evidence freshness: <files touched since smoke; affects UI/routes/browser-consumed API/fixtures/action path yes/no and why; rerun / N/A because ... / not affected because changed path <path or group> leaves the evidence route/action/API/fixture <route/action/API/fixture> untouched and targeted proof <command> passed / blocked because ...>
- Final post-commit freshness delta: <files touched since last browser/manual proof after final commit and verification edits; rerun / not affected because changed path <path or group> leaves the evidence route/action/API/fixture <route/action/API/fixture> untouched and targeted proof <command> passed / blocked because ...>
- Child states verified: <yes/N/A, exact issue numbers>

Closeout gate passed: audit sink <conversation/comment URL/issue reference/inspected body file path before parent URL exists>; review evidence <line/reference>; TDD evidence <present/N/A>; final SHA <sha>; Principles/ADR conformance <present/N/A>; Local-only SHA sentence <full explanatory sentence present/N/A>; child states verified <yes/N/A>; browser evidence <present/N/A/blocked>.
```
