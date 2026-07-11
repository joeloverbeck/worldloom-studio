# Local fallback evidence

Use this reference only when the sub-agent review path is unavailable or policy-blocked. It owns the complete local fallback contract for the two review axes and any handoff to `implement`.

Non-bypassable review fallback gate:

- When local fallback is used during repo `implement` closeout, the full mandatory fallback block below must be present in the durable closeout sink, or in an explicitly linked adjacent durable sink, before the implementation pre-close audit or any tracker closeout.
- The one-line `Review fallback:` evidence line is not enough by itself. The durable sink must also include the review frame, delegation policy source, `## Standards`, `## Spec`, `Smell baseline applied:`, the PRD child coverage table when applicable, the immediate-fix block when findings were fixed before closeout, the axis summary, and the literal `Review fallback gate passed:` line.
- If a behavior-changing review fix invokes the repo `tdd` skill, re-read [the canonical TDD closeout contract](../tdd/closeout-evidence.md). The same durable sink must include or explicitly link its `TDD closeout preflight`, compact rows, review-fix addendum, and full fielded `TDD evidence gate passed:` line. That line must include `durable sink <conversation/comment URL/issue reference/inspected body file path before tracker URL exists>`, `compact table/header <present after structural check/equivalent fields present after structural check>`, `seams accounted for`, `CONTEXT.md status`, `ADRs/principles/docs status`, `partial-red / red-first skip reasons`, `evidence-only rows`, and `existing-test contract-change rows` fields, with any listed existing-test rows limited to expectation rewrites. The TDD preflight must include `Pre-red recovery status:`, `Acceptance atom map:`, and `Evidence-only backend process currentness:`; each compact row must include `atoms:` and `proof surfaces:`; the review-fix addendum must include `Backend process currentness:`; and browser/manual evidence-only rows must include `Evidence-only browser console state:`. The `TDD/review-fix evidence` row or linked TDD review-fix addendum records the review fix; it is not a substitute for the TDD closeout gate.
- Treat `tdd fielded closeout gate <yes>` as valid only when the included or linked TDD gate line has been inspected and its `compact table/header` field passed the TDD structural table check. Keyword hits for `TDD evidence gate passed`, `compact table/header`, or command names are not enough. When the TDD evidence is in a local body file, run `node .claude/skills/tdd/scripts/validate-tdd-closeout-body.mjs <body.md>` and use `--parent-rollup` when the evidence uses the parent-rollup compact table; only write `tdd fielded closeout gate yes after structural check` if that validator passes.
- If any fallback field is missing or only implied, stop and fill it before handing back to `implement` closeout.

**Local fallback checklist** — use this when sub-agents cannot run:

- State why fallback was used, such as unavailable tooling or policy-blocked delegation, and name the policy/tool source inspected when delegation is policy-blocked.
- Reuse the same Standards and Spec inputs below, including standards-source files, spec sources, principle/ADR material, the diff command or WIP diff inputs, commit list, and the smell baseline.
- Keep the outputs separated under `## Standards` and `## Spec`.
- For PRD child issue families, include the compact per-child coverage table `Issue | Acceptance source | Evidence reviewed | Findings/residuals` before reporting zero residual Spec findings.
- If the review is part of implementation closeout and the parent PRD itself will be closed, include a parent PRD row in that table, or cite exact same-sink audit rows that cover the parent PRD's solution, implementation decisions, testing decisions, principles, and child map. Do not let child rows alone stand in for parent closeout coverage.
- When a child issue, parent PRD row, PRD criterion, or acceptance source contains a named list of required items, enumerate those items in the `Acceptance source` cell or split them into multiple rows before reporting zero residual Spec findings. A single child or parent PRD row is not enough if it hides partial list coverage. A row satisfies exact-acceptance only when `Acceptance source` lists concrete items such as `AC1`, `criterion 2`, or checklist IDs, or cites an adjacent exact acceptance table/range in the same durable sink; broad parent or child summaries such as `parent PRD solution`, `server contract`, `active-route replay`, or `context parity` are not enough for zero residual Spec findings.
- When an acceptance source uses a composite term, resolve it through authoritative parent/child definitions, implementation decisions, glossaries, or named contracts. Enumerate its atoms and required proof surfaces in the `Acceptance source` cell or an adjacent keyed map before reporting zero residual Spec findings. For example, `provenance` may mean `actor + timestamp + flow step` across `API + report + browser`; the umbrella noun alone is not exact acceptance evidence.
- For routed, guided-flow, or multi-surface UI acceptance, verify the requirement on the production route and action path the user actually reaches. Do not count legacy, adjacent, inactive, or full-workspace-only surfaces as satisfying a routed active-surface requirement.
- When an issue or PRD acceptance item explicitly declares browser/manual proof N/A, verify the diff does not change browser contract, routes, rendered behavior, validation response, fixtures, or action path. If any such browser-consumed surface changed, require browser/manual evidence or report a Spec residual finding instead of accepting the N/A label.
- Before reporting zero residual Spec findings, run an exact-acceptance challenge: each acceptance item must map to evidence for the exact condition the source names. Reject broad labels such as `equivalent`, `representative`, `active-route replay`, or nearby-surface proof unless the spec explicitly permits substitution.
- For cold external LLM, fresh subagent, packet-read, credentialed service, or other nonlocal proof requirements, verify the exact proof artifact, result, blocker, or same-sink per-criterion audit row before reporting zero residual Spec findings. Repo-local tests, generated packets, or browser screenshots do not satisfy this class of acceptance unless the spec explicitly says they are a substitute.
- Cite the concrete standards/spec sources used for each axis.
- Source lists must name exact files, issue numbers, or other concrete authorities. Do not use generic placeholders such as `relevant principles/ADRs` or `named principle/ADR sources`; put Principles/ADRs on the Standards axis only when the named source states a coding, review, tracker, or verification convention.
- Apply the smell baseline as judgement-call heuristics, not hard violations, and let documented repo standards override it.
- In the Standards output, include a dedicated `Smell baseline applied: <yes / skipped because ...>.` line before findings, so a zero-finding fallback still proves the baseline was considered.
- End with the required axis summary: `Standards <count/worst>, Spec <count/worst>`.
- If any finding is fixed before closeout, distinguish `Findings found` from `Residual findings` in the fallback report or immediate-fix block. The final axis count may be zero residual, but the found-and-fixed item must remain visible.
- If a finding is intentionally accepted, record it separately with `Accepted residual:`, `Axis:`, `Source:`, `Rationale:`, and `Revisit trigger:` fields. The trigger must name a concrete condition that reopens the decision, or say `N/A because permanently accepted judgement`; also state that no unhandled findings remain beyond accepted residuals.
- Before leaving local fallback, perform a fallback shape hard stop: confirm the output contains the review frame, delegation policy source, `## Standards`, `## Spec`, `Smell baseline applied:`, the PRD child coverage table when reviewing a child-issue family, the axis summary, the immediate-fix block when findings were fixed before closeout, the full fielded TDD closeout gate line or link when the repo `tdd` skill was invoked, and the exact `Review fallback:` closeout-ready line when invoked by `implement`. The TDD closeout gate line or link counts only after the structural table check passes. If any required piece is missing, stop and fill it before moving to the implementation pre-close audit or issue closeout.
- The passed gate line is a pass/fail assertion, not a status dashboard: by emission time, use `yes` for required fields and `N/A` only for genuinely out-of-scope optional fields. If any field would be `no`, stop and repair the fallback body instead of emitting the line.
- Emit this literal gate line after the hard stop: `Review fallback gate passed: frame <yes>; delegation policy source <yes>; Standards <yes>; Spec <yes>; child table <yes/N/A>; smell baseline <yes>; found-vs-residual <yes/N/A>; closeout line <yes/N/A>; immediate-fix block <yes/N/A>; tdd fielded closeout gate <yes after structural check/N/A>; verification/browser freshness <yes/N/A>.`
- Before handing back to `implement`, inspect the final durable body or linked sink directly. Body-check token sweep: verify `Review frame:`, `fixed point resolved SHA`, `reviewed HEAD SHA`, `## Standards`, `## Spec`, `Smell baseline applied:`, `Review fallback gate passed: frame`, `closeout line`, `verification/browser freshness`, `Browser/manual evidence freshness`, `Browser/manual console state`, `Backend process currentness`, and the exact `Review fallback:` closeout-ready line when invoked by `implement`; also verify the diff command uses the resolved fixed-point SHA, not only a relative/name ref, and that no fallback review line is labeled `Review:`. For PRD child families also verify the child table header and exact child acceptance sources; for immediate fixes also verify `Findings found`, `TDD/review-fix evidence`, `TDD closeout gate`, and `Residual findings`. The token sweep is a locating aid, not proof by itself: if the literal gate line omits or renames a required field, if browser/manual freshness is blank or vague, if browser/manual console state is blank or vague, if backend currentness is blank or vague, or if `not affected` does not name the changed path, explain why the earlier evidence route/action/API/fixtures were untouched, and cite targeted proof for the changed path; for non-semantic fixes, also state the formatting/comment/docs/closeout-text reason and that the diff was inspected. Stop and rewrite the closeout if any required freshness detail is missing.
- When the fallback sink is a local body file, run `node .claude/skills/code-review/scripts/validate-review-fallback-body.mjs <body.md>` before handing back. Add `--implement` when invoked by `implement`, `--child-family` for PRD child issue families, `--immediate-fix` when review findings were fixed before closeout, `--browser` when browser/manual evidence was used, `--tdd` when local fallback evidence includes normal TDD closeout evidence, and `--tdd-parent-rollup` when TDD evidence uses the parent-rollup compact table. The local validator calls the TDD validation logic in-process; if an older or external copy reports a nested TDD validator `EPERM`/spawn failure, run `node .claude/skills/tdd/scripts/validate-tdd-closeout-body.mjs <body.md>` directly with the matching TDD flag and record that direct result before treating the body as valid or invalid. If the sink is not a local file, apply the same validator checks manually and say the script was N/A because no local body file existed.
- When invoked by `implement`, the full mandatory fallback block must be embedded in the durable closeout artifact, or placed in an adjacent durable sink with an explicit link from the closeout artifact. The one-line `Review fallback:` closeout-ready evidence line is still required, but it does not substitute for the full fallback block.

Mandatory local fallback output — paste this shape even when both axes have zero findings:

```markdown
Review frame: fixed point input <ref>; fixed point resolved SHA <sha>; reviewed HEAD SHA <sha>; diff command `git diff <resolved-fixed-point-sha>...HEAD` with the resolved SHA, not only `HEAD~1...HEAD` or another relative/name ref; commits <git log <resolved-fixed-point-sha>..HEAD --oneline>; worktree scope <committed diff only / WIP inputs included>, excluded dirty files <none / paths>; spec source <issues/spec paths>.

## Standards

Fallback used: <unavailable tooling / policy-blocked delegation / other reason>.
Delegation policy source: <tool metadata/policy inspected / no sub-agent surface found / N/A because fallback was not delegation-related>.
Sources reviewed: <exact standards-source files or issue numbers; root agent instructions; smell baseline; named Principles/ADRs only when they state coding/workflow conventions>.
Smell baseline applied: <yes / skipped because ...>.
Findings: <none / bullets with file+hunk and standard or smell label>.

## Spec

Sources reviewed: <exact issue/PRD/spec files, named Principles/ADRs when applicable>.

| Issue | Acceptance source | Evidence reviewed | Findings/residuals |
|---|---|---|---|
| #N | <issue/spec/criterion; enumerate named list items; for composite terms enumerate atoms and proof surfaces or cite an adjacent keyed map; otherwise cite adjacent exact acceptance table rows/range> | <diff/tests/docs reviewed> | <none / finding> |

Findings: <none / bullets with quoted spec line>.

Residual findings: <none / accepted residual records below; no unhandled findings beyond accepted residuals>.

When a finding is intentionally accepted, add one record per finding:

- **Accepted residual**: <title>
  - **Axis**: <Standards / Spec>
  - **Source**: <reviewer finding plus file/hunk or acceptance source>
  - **Rationale**: <why closeout is allowed without a fix>
  - **Revisit trigger**: <concrete condition / N/A because permanently accepted judgement>

TDD closeout gate: <canonical TDD closeout preflight, compact rows, review-fix addendum, and full fielded gate from ../tdd/closeout-evidence.md present or explicitly linked; includes `Pre-red recovery status:`, `Acceptance atom map:`, per-row `atoms:` and `proof surfaces:`, `Evidence-only backend process currentness:`, `Backend process currentness:` for review fixes, and `Evidence-only browser console state:` when browser/manual evidence-only rows exist: TDD evidence gate passed: durable sink <conversation/comment URL/issue reference/inspected body file path before tracker URL exists>; compact table/header <present after structural check/equivalent fields present after structural check>; seams accounted for <all listed / exceptions named>; CONTEXT.md status <present/absent/N/A>; ADRs/principles/docs status <present/N/A>; partial-red / red-first skip reasons <none/listed>; evidence-only rows <none/listed>; existing-test contract-change rows <none / listed expectation-rewrite rows> / N/A because no tdd skill was invoked>.

Browser/manual evidence freshness: <browser smoke rerun passed on final tree for route/action/API/fixture <route/action/API/fixture> with observed outcome <outcome> / rerun evidence on final tree / not affected because changed path <path> is outside the earlier evidence route/action/API/fixture <route/action/API/fixture> and targeted proof <command> passed / not affected because changed path <path> is non-semantic formatting, comment wording, documentation, or closeout text; earlier evidence route/action/API/fixture <route/action/API/fixture> is untouched; diff inspected and targeted proof <command> passed / not affected because git commit metadata only; no tracked file content changed after the proof; earlier evidence route/action/API/fixture <route/action/API/fixture> is untouched; targeted proof git diff HEAD -- <owned files> passed or was empty / explicit blocked or stale reason / N/A because no browser/manual evidence was used>
Browser/manual console state: <0 errors and 0 warnings / classified unrelated output with evidence / rerun clean session because HMR, reused session, or agent-induced setup/request error tainted proof / N/A because no browser/manual evidence was used>
Backend process currentness: <server command and watch/reload mode; process or port ownership; restart/reload proof; expected API field/behavior probe / N/A because browser proof has no backend/API dependency / N/A because no browser/manual evidence was used / blocked because ...>

If findings were fixed before closeout, include this block before the axis summary:

- **Findings found**: `<count and short titles>`
- **Fixes made**: `<files/behavior changed, proof/coverage added>`
- **TDD/review-fix evidence**: `<red command/failure per behavior-changing fix, partial red - wrong reason: <reason> plus follow-up intended red if applicable, coverage-only review fix reason, red-first skipped because Standards-only/conformance-only fix did not change behavior, explicit red-first skipped because ..., or linked TDD review-fix addendum>`
- **Verification rerun**: `<commands and browser/manual checks>`
- **Commit handling**: `<unchanged implementation commit SHA / amended commit SHA / follow-up commit SHA / no commit yet>`
- **Residual findings**: `<remaining Standards and Spec findings after affected/full-axis re-review against the original fixed point through final HEAD, or none; when accepted, state no unhandled findings remain beyond accepted residuals>`
- **Accepted residual**: `<title>` when a finding is intentionally accepted
  - **Axis**: `<Standards / Spec>`
  - **Source**: `<reviewer finding plus file/hunk or acceptance source>`
  - **Rationale**: `<why closeout is allowed without a fix>`
  - **Revisit trigger**: `<concrete condition / N/A because permanently accepted judgement>`

Axis summary: Standards <count/worst>, Spec <count/worst>

Review fallback gate passed: frame <yes>; delegation policy source <yes>; Standards <yes>; Spec <yes>; child table <yes/N/A>; smell baseline <yes>; found-vs-residual <yes/N/A>; closeout line <yes/N/A>; immediate-fix block <yes/N/A>; tdd fielded closeout gate <yes after structural check/N/A>; verification/browser freshness <yes/N/A>.
Review fallback: <required when invoked by implement: why code-review could not run; standards/spec result <...>; fixes <none / SHA ...>; verification rerun <commands> / N/A when not invoked by implement>.
```

Caller handoff stop for `implement`: before emitting or returning the closeout-ready evidence line below, confirm the full mandatory local fallback output above is already embedded in the durable closeout artifact or explicitly linked from it. If it is missing, paste or link the full block first; do not hand back only the one-line `Review fallback:` summary.
