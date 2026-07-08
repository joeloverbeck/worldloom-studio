# Closeout Templates

Read this before drafting parent rollups, child-family audit bodies, `/tmp`
body files, closeout preflight scratchpads, or final body-check commands.

## Large Tracker Body Workflow

Large tracker body workflow: for long parent rollups or child-family audits, compose the body in a temporary file under `/tmp`, inspect the exact file contents before posting, post with the tracker CLI's `--body-file` option, capture the resulting issue/comment URL or exact reference, and keep the staging path out of the published body. Use an interactive editor when available; when no editor is available or shell writes are constrained, create the `/tmp` body with the environment-approved file-edit mechanism, keep it outside the repo, and still inspect the exact file before posting. For GitHub, `gh issue close` only accepts an inline `--comment`, not `--body-file`; post long evidence first with `gh issue comment --body-file <file>`, capture that comment URL, then close with a short inline pointer to the evidence comment. Use this pattern for parent rollups and any long child comment; reserve inline `--body` for short child comments only.

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
CONTEXT.md status: <present/absent/N/A>
ADRs/principles/docs status: <present/N/A>
Partial-red / red-first skip reasons: <none/listed>
Evidence-only rows freshness: <none/listed with freshness reason>
Existing-test contract-change rows: <none/listed expectation-rewrite rows>

| Issue | CONTEXT.md status | ADRs/principles/docs status | Seam | Red command/failure | Green command or evidence | Acceptance covered | Review fix / red-first skip reason |
|---|---|---|---|---|---|---|---|
| #N | <present/absent/N/A> | <present/N/A> | <seam or evidence-only row> | <red command/failure or N/A because ...> | <green command or evidence> | <acceptance criteria covered> | <N/A / review-fix red-first skip reason> |

TDD evidence gate passed: durable sink <inspected body file path before tracker URL exists / comment URL>; compact table/header <present after structural check>; seams accounted for <all listed / exceptions named>; CONTEXT.md status <present/absent/N/A>; ADRs/principles/docs status <present/N/A>; partial-red / red-first skip reasons <none/listed>; evidence-only rows <none/listed>; existing-test contract-change rows <none/listed expectation-rewrite rows>.
Review evidence:
- Review: <code-review fixed point/outcome/verification rerun>
- Review fallback: <fallback line, or N/A because code-review ran normally>
- Full review fallback block: <embedded below or linked adjacent durable sink; N/A because code-review ran normally>
- TDD closeout gate: <copy the code-review fallback block's TDD closeout gate field when both TDD and local review fallback were used, including the full TDD evidence gate reference; N/A because no tdd skill was invoked or code-review ran normally>
Principles/ADR conformance: <no deliberate exceptions / approved exception / N/A>
Browser evidence:
- Route/action/outcome: <route and observed result / N/A because ... / blocked because ...>
- Final freshness delta: files touched since the last browser/manual smoke after final commit and verification edits <paths or none>; affects UI/routes/browser-consumed API/fixtures/action path <yes/no per path/group and why>; smoke freshness <rerun / not affected because changed path <path or group> leaves the evidence route/action/API/fixture <route/action/API/fixture> untouched and targeted proof <command> passed / blocked because ...>
Fixed child inline close comment: <exact final text inspected / stable self-referential parent rollup wording inspected / local pending-parent template inspected and later patched / N/A>
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
- Final SHA: <sha>
- Remote reachability: <remote branch contains sha / no remote branch contains sha>
- Principles/ADR conformance: <present/N/A>
- Local-only SHA: <full explanatory sentence present/N/A>
- TDD evidence: <present/N/A because no tdd skill was invoked>
- Review evidence: <Review:/Review fallback: line or reference>
- Browser evidence freshness: <files touched since smoke; affects UI/routes/browser-consumed API/fixtures/action path yes/no and why; rerun / not affected because changed path <path or group> leaves the evidence route/action/API/fixture <route/action/API/fixture> untouched and targeted proof <command> passed / blocked because ...>
- Final post-commit freshness delta: <files touched since last browser/manual proof after final commit and verification edits; rerun / not affected because changed path <path or group> leaves the evidence route/action/API/fixture <route/action/API/fixture> untouched and targeted proof <command> passed / blocked because ...>
- Child states verified: <yes/N/A, exact issue numbers>

Closeout gate passed: audit sink <conversation/comment URL/issue reference/inspected body file path before parent URL exists>; review evidence <line/reference>; TDD evidence <present/N/A>; final SHA <sha>; Principles/ADR conformance <present/N/A>; Local-only SHA sentence <full explanatory sentence present/N/A>; child states verified <yes/N/A>; browser evidence <present/N/A/blocked>.

Closeout body check passed: audit table columns exact; every acceptance checkbox or conformance check named; every status literal satisfied/blocked/not done; final SHA present; verification evidence present; TDD evidence present or N/A; review evidence present; Principles/ADR conformance string present or N/A; full Local-only SHA explanatory sentence present or N/A; browser evidence present/N/A/blocked; final browser/manual freshness delta present/N/A; exact fixed child inline comment inspected <yes/N/A>.
```

Then inspect the exact body before posting:

```bash
body="/tmp/worldloom-closeout-<issue-or-prd>.md"
$EDITOR "$body"
# If no interactive editor is available, create the body with the environment-approved file-edit mechanism instead.
# Run the applicable validator commands before posting; omit commands whose evidence type is N/A and drop only flags whose conditions do not apply.
node .claude/skills/tdd/scripts/validate-tdd-closeout-body.mjs "$body" --parent-rollup
node .claude/skills/code-review/scripts/validate-review-fallback-body.mjs "$body" --implement --child-family --tdd-parent-rollup
node .claude/skills/implement/scripts/validate-closeout-body.mjs "$body" --closing --principles --local-only --fixed-child-pending --review-fallback
sed -n '1,240p' "$body"
rg -n "Acceptance criterion or conformance check|Status|satisfied|blocked|not done|TDD evidence|TDD evidence gate passed|TDD closeout gate|Review:|Review fallback:|Principles/ADR conformance:|Local-only SHA:|not remote-reachable because|local-only closeout is acceptable because|browser smoke|browser evidence|Final freshness delta|Fixed child inline close comment|Closeout gate passed: audit sink" "$body"
# If any inspection output is truncated, treat it as not inspected. Split the check into bounded token sweeps and short table/status excerpts before posting or closing.
comment_url="$(gh issue comment <issue> --body-file "$body")"
gh issue close <issue> --reason completed --comment "Completed; evidence: $comment_url"
```

Do not leave temporary body files in the repo unless they are intentional committed evidence.

## Closeout Preflight Scratchpad

Before any `gh issue comment`, `gh issue close`, `glab issue close`, or equivalent closeout command, fill this in the conversation or durable audit sink and make the `Closeout gate passed:` line visible:

```markdown
Closeout preflight:
- Audit sink: <conversation/comment URL/issue reference/body file inspected>
- Body file(s) inspected: <paths or N/A>
- Parent rollup URL: <URL / pending because first tracker mutation has not posted it yet / N/A>
- Fixed child inline close comment: <stable self-referential parent rollup wording inspected / local pending-parent template inspected and later patched / exact final text inspected once after parent URL captured / N/A>
- Final SHA: <sha>
- Remote reachability: <remote branch contains sha / no remote branch contains sha>
- Principles/ADR conformance: <present/N/A>
- Local-only SHA: <full explanatory sentence present/N/A>
- TDD evidence: <present/N/A because no tdd skill was invoked>
- Review evidence: <Review:/Review fallback: line or reference>
- Browser evidence freshness: <files touched since smoke; affects UI/routes/browser-consumed API/fixtures/action path yes/no and why; rerun / N/A because ... / not affected because changed path <path or group> leaves the evidence route/action/API/fixture <route/action/API/fixture> untouched and targeted proof <command> passed / blocked because ...>
- Final post-commit freshness delta: <files touched since last browser/manual proof after final commit and verification edits; rerun / not affected because changed path <path or group> leaves the evidence route/action/API/fixture <route/action/API/fixture> untouched and targeted proof <command> passed / blocked because ...>
- Child states verified: <yes/N/A, exact issue numbers>

Closeout gate passed: audit sink <conversation/comment URL/issue reference/inspected body file path before parent URL exists>; review evidence <line/reference>; TDD evidence <present/N/A>; final SHA <sha>; Principles/ADR conformance <present/N/A>; Local-only SHA sentence <full explanatory sentence present/N/A>; child states verified <yes/N/A>; browser evidence <present/N/A/blocked>.
```
