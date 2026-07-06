---
name: code-review
description: Review the changes since a fixed point (commit, branch, tag, or merge-base) along two axes — Standards (does the code follow this repo's documented coding standards?) and Spec (does the code match what the originating issue/PRD asked for?). Prefers parallel sub-agents when policy permits, otherwise runs a local two-axis fallback. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to "review since X".
---

Two-axis review of the diff between `HEAD` and a fixed point the user supplies:

- **Standards** — does the code conform to this repo's documented coding standards?
- **Spec** — does the code faithfully implement the originating issue / PRD / spec?

Both axes should run as **parallel sub-agents** when the available tool policy permits it, so they don't pollute each other's context. Tool availability alone is not permission: if the sub-agent tool policy requires explicit user authorization and the user did not grant it, treat sub-agents as policy-blocked. If sub-agents are unavailable or policy-blocked, run both axes locally in separate sections and document the deviation.

The issue tracker should have been provided to you — run `/setup-matt-pocock-skills` if `docs/agents/issue-tracker.md` is missing.

## Process

### 1. Pin the fixed point

Whatever the user said is the fixed point — a commit SHA, branch name, tag, `main`, `HEAD~5`, etc. If they didn't specify one, ask for it.

Exception: when invoked as part of implementation closeout after the implementation has already been committed locally, default to `HEAD~1` unless the user or calling skill supplied a different fixed point.

If review findings are fixed in one or more follow-up commits, keep the original fixed point for any final or residual implementation-closeout review. Use the new `HEAD~1` only when explicitly reviewing just the follow-up fix commit; otherwise it drops the original implementation diff from the review frame.

Capture the diff command once: `git diff <fixed-point>...HEAD` (three-dot, so the comparison is against the merge-base). Also note the list of commits via `git log <fixed-point>..HEAD --oneline`.

Run `git status --short` before fixing the review inputs. If the worktree is dirty, state whether the review covers only the committed diff or also staged/unstaged work. The default implementation-closeout review covers committed changes only; label dirty files as excluded unless the user asked for a work-in-progress review. For work-in-progress review, add `git diff --cached` and `git diff` as explicit inputs to both axes, alongside the committed diff when relevant.

Before going further, confirm the fixed point resolves (`git rev-parse <fixed-point>`) and the diff is non-empty. A bad ref or empty diff should fail here — not inside two parallel sub-agents.

### 2. Identify the spec source

Look for the originating spec, in this order:

1. Issue references in the commit messages (`#123`, `Closes #45`, GitLab `!67`, etc.) — fetch via the workflow in `docs/agents/issue-tracker.md`.
2. When invoked as part of implementation closeout, the originating PRD/issues already resolved by the implementation workflow count as the spec source; cite those issue numbers and any created spec file.
3. A path the user passed as an argument.
4. A PRD/spec file under `docs/specs/`, `docs/`, or `.scratch/` matching the branch name or feature.
5. If nothing is found, ask the user where the spec is. If they say there isn't one, the **Spec** sub-agent will skip and report "no spec available".

If the chosen issue, PRD, or spec has a `## Principles` section, read `docs/principles/README.md` for the authority order and conformance rule, then read any named principle documents and ADRs needed to judge the change. Treat those principle and ADR references as part of the Spec axis: they are conformance requirements, not optional background. If the diff contradicts one, flag it explicitly in the review using the repo's contradiction wording.

### 3. Identify the standards sources

Anything in the repo that documents how code should be written, such as `CODING_STANDARDS.md` or `CONTRIBUTING.md`.

Also include root agent instructions such as `CLAUDE.md` or `AGENTS.md`, plus repo agent docs they point to, when they define coding, review, tracker, or verification conventions. Principle documents identified in step 2 belong to the Spec axis unless they also state a coding or workflow convention.

On top of whatever the repo documents, the Standards axis always carries the **smell baseline** below — a fixed set of Fowler code smells (_Refactoring_, ch.3) that applies even when a repo documents nothing. Two rules bind it:

- **The repo overrides.** A documented repo standard always wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation — and, like any standard here, skip anything tooling already enforces.

Each smell reads *what it is* → *how to fix*; match it against the diff:

- **Mysterious Name** — a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code** — the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- **Feature Envy** — a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps** — the same few fields or params keep travelling together (a type wanting to be born). → bundle them into one type, pass that.
- **Primitive Obsession** — a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches** — the same `switch`/`if`-cascade on the same type recurs across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery** — one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- **Divergent Change** — one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality** — abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains** — long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man** — a class or function that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest** — a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.

### 4. Run both review axes

Use the available sub-agent mechanism, if permitted, with two independent read-only review tasks. Prefer running the axes in parallel; if the tool surface uses different role names, choose the closest general read-only reviewer role. If sub-agent tools may be deferred or lazy-loaded, perform the minimal tool-discovery check needed to inspect the surfaced sub-agent policy before deciding. If the discovered policy requires explicit user authorization to spawn agents and the user did not grant it, record `policy-blocked` and do not spawn. If the discovered policy says spawning agents requires explicit user authorization and the user did not explicitly ask for sub-agents, delegation, parallel agents, or parallel agent work, the discovery check is complete: record `policy-blocked`, skip sub-agent prompt inspection/preparation, and proceed directly to local fallback. If sub-agents are unavailable or policy-blocked, run both axes locally against the same fixed point, keep the analysis separated under the same headings, and state that the fallback path was used.

**Local fallback checklist** — use this when sub-agents cannot run:

- State why fallback was used, such as unavailable tooling or policy-blocked delegation.
- Reuse the same Standards and Spec inputs below, including standards-source files, spec sources, principle/ADR material, the diff command or WIP diff inputs, commit list, and the smell baseline.
- Keep the outputs separated under `## Standards` and `## Spec`.
- For PRD child issue families, include the compact per-child coverage table `Issue | Acceptance source | Evidence reviewed | Findings/residuals` before reporting zero residual Spec findings.
- When a child issue, PRD criterion, or acceptance source contains a named list of required items, enumerate those items in the `Acceptance source` cell or split them into multiple rows before reporting zero residual Spec findings. A single child row is not enough if it hides partial list coverage.
- Cite the concrete standards/spec sources used for each axis.
- Source lists must name exact files, issue numbers, or other concrete authorities. Do not use generic placeholders such as `relevant principles/ADRs` or `named principle/ADR sources`; put Principles/ADRs on the Standards axis only when the named source states a coding, review, tracker, or verification convention.
- Apply the smell baseline as judgement-call heuristics, not hard violations, and let documented repo standards override it.
- In the Standards output, include a dedicated `Smell baseline applied: <yes / skipped because ...>.` line before findings, so a zero-finding fallback still proves the baseline was considered.
- End with the required axis summary: `Standards <count/worst>, Spec <count/worst>`.
- If any finding is fixed before closeout, distinguish `Findings found` from `Residual findings` in the fallback report or immediate-fix block. The final axis count may be zero residual, but the found-and-fixed item must remain visible.
- Before leaving local fallback, perform a fallback shape hard stop: confirm the output contains the review frame, `## Standards`, `## Spec`, `Smell baseline applied:`, the PRD child coverage table when reviewing a child-issue family, the axis summary, and the exact `Review fallback:` closeout-ready line when invoked by `implement`. If any required piece is missing, stop and fill it before moving to the implementation pre-close audit or issue closeout.
- Emit this literal gate line after the hard stop: `Review fallback gate passed: frame <yes/no>; Standards <yes/no>; Spec <yes/no>; child table <yes/N/A>; smell baseline <yes/no>; found-vs-residual <yes/N/A>; closeout line <yes/N/A>; verification/browser freshness <yes/N/A>.`
- When invoked by `implement`, the full mandatory fallback block must be embedded in the durable closeout artifact, or placed in an adjacent durable sink with an explicit link from the closeout artifact. The one-line `Review fallback:` closeout-ready evidence line is still required, but it does not substitute for the full fallback block.

Mandatory local fallback output — paste this shape even when both axes have zero findings:

```markdown
Review frame: fixed point <ref>; diff command `git diff <fixed-point>...HEAD`; commits <git log <fixed-point>..HEAD --oneline>; worktree scope <committed diff only / WIP inputs included>, excluded dirty files <none / paths>; spec source <issues/spec paths>.

## Standards

Fallback used: <unavailable tooling / policy-blocked delegation / other reason>.
Sources reviewed: <exact standards-source files or issue numbers; root agent instructions; smell baseline; named Principles/ADRs only when they state coding/workflow conventions>.
Smell baseline applied: <yes / skipped because ...>.
Findings: <none / bullets with file+hunk and standard or smell label>.

## Spec

Sources reviewed: <exact issue/PRD/spec files, named Principles/ADRs when applicable>.

| Issue | Acceptance source | Evidence reviewed | Findings/residuals |
|---|---|---|---|
| #N | <issue/spec/criterion; enumerate named list items when present> | <diff/tests/docs reviewed> | <none / finding> |

Findings: <none / bullets with quoted spec line>.

Axis summary: Standards <count/worst>, Spec <count/worst>

Review fallback gate passed: frame <yes/no>; Standards <yes/no>; Spec <yes/no>; child table <yes/N/A>; smell baseline <yes/no>; found-vs-residual <yes/N/A>; closeout line <yes/N/A>; verification/browser freshness <yes/N/A>.
Review fallback: <required when invoked by implement: why code-review could not run; standards/spec result <...>; fixes <none / SHA ...>; verification rerun <commands> / N/A when not invoked by implement>.
```

When invoked by the repo `implement` skill, also emit one closeout-ready review evidence line after the two-axis report, matching the caller's format:

- `Review: code-review against <fixed point>; outcome <no findings / findings fixed in SHA ...>; verification rerun <commands>.`
- `Review fallback: <why code-review could not run>; standards/spec result <...>; fixes <none / SHA ...>; verification rerun <commands>.`

If fallback was used, the closeout-ready line must start `Review fallback:` exactly. Do not use `Review:` for fallback reviews.

If review reports no findings and no files change after review, `verification rerun` may state that no rerun was needed after review because the unchanged final tree already passed named gates. In that case, cite those gates explicitly and keep the implementation commit SHA as the reviewed SHA.

**Standards sub-agent prompt** — include:

- The full diff command and commit list.
- Any staged/unstaged WIP diff inputs captured in step 1.
- The list of standards-source files you found in step 3, **plus the smell baseline from step 3** pasted in full — the sub-agent has no other access to it.
- The brief: "Report — per file/hunk where relevant — (a) every place the diff violates a documented standard: cite the standard (file + the rule); and (b) any baseline smell you spot: name it and quote the hunk. Distinguish hard violations from judgement calls — documented-standard breaches can be hard, but baseline smells are always judgement calls, and a documented repo standard overrides the baseline. Skip anything tooling enforces. Under 400 words."

**Spec sub-agent prompt** — include:

- The diff command and commit list.
- Any staged/unstaged WIP diff inputs captured in step 1.
- The path(s), issue number(s), or fetched contents for every spec source.
- If the spec source is a PRD child issue family, require a compact per-child coverage table: `Issue | Acceptance source | Evidence reviewed | Findings/residuals`. Every child issue under review should have a row before reporting zero residual Spec findings.
- If a child issue, PRD criterion, or acceptance source contains a named list of required items, require the `Acceptance source` cell to enumerate those items or split them into multiple rows before reporting zero residual Spec findings.
- Any `## Principles` section from the spec source, plus `docs/principles/README.md` and named principle/ADR docs read in step 2.
- The brief: "Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote the spec line for each finding. Under 400 words."

If the spec is missing, skip the Spec sub-agent and note this in the final report.

### 5. Aggregate

Present the two reports under `## Standards` and `## Spec` headings, verbatim or lightly cleaned. Do **not** merge or rerank findings — the two axes are deliberately separate (see _Why two axes_). Do not omit these two-axis headings just because findings were fixed immediately; if time is short, use compact content under `## Standards` and `## Spec`.

If local fallback was used during implementation closeout, emit the mandatory local fallback block from step 4 before the implementation pre-close audit. The pre-close audit may duplicate review evidence, but it does not substitute for `## Standards`, `## Spec`, and the PRD child-family coverage table required by this skill.

If the review resumes, compacts, or is interrupted before final reporting, revalidate the review frame before presenting results: rerun fixed-point resolution, `git status --short`, the non-empty diff check, and the commit list, then confirm the standards-source and spec-source lists are still present in context. If any source list is missing or stale, reconstruct it before reporting.

End with a one-line summary: total findings per axis, and the worst issue _within each axis_ (if any). Don't pick a single winner across axes — that's the reranking the separation exists to prevent.

When this review is part of implementation closeout, report findings first. If fixes are made immediately, rerun the relevant verification, state whether the commit was amended or followed by a new commit, and include the review outcome in the implementation closeout evidence. When a finding requires a behavior change, invoke the repo `tdd` skill where possible: add or adjust the smallest assertion first and run it red before fixing. If the code was already fixed to protect the tree or unblock verification, record that red-first was skipped and why. For behavior-changing review fixes, generic wording such as `fixed and covered` is not enough; the closeout must include the red command/failure or an explicit `red-first skipped because ...` reason. If a review finding is missing proof or coverage only, add the smallest assertion and run it; if it passes without code changes, record `coverage-only review fix; red-first N/A because behavior already existed and no code changed`; if it fails, treat the finding as missing behavior and use the normal TDD red-green path. If a review fix touches UI, route handlers, browser-consumed API shapes, fixtures, or an action path covered by earlier browser/manual evidence, rerun that evidence on the final tree or record an explicit blocked/stale reason.

For immediate-fix closeout, use this compact shape after the two axis reports:

- **Findings found**: `<count and short titles, or none>`
- **Fixes made**: `<files/behavior changed, proof/coverage added, or none>`
- **TDD/review-fix evidence**: `<red command/failure per behavior-changing fix, coverage-only review fix reason, or explicit red-first skipped because ...>`
- **Verification rerun**: `<commands and browser/manual checks>`
- **Browser/manual evidence freshness**: `<rerun evidence on final tree, not affected, or explicit blocked/stale reason>`
- **Commit handling**: `<unchanged implementation commit SHA / amended commit SHA / follow-up commit SHA / no commit yet>`
- **Residual findings**: `<remaining Standards and Spec findings, or none>`
- **Axis summary**: `Standards <count/worst>, Spec <count/worst>`

## Why two axes

A change can pass one axis and fail the other:

- Code that follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Code that does exactly what the issue asked but breaks the project's conventions → **Spec pass, Standards fail.**

Reporting them separately stops one axis from masking the other.
