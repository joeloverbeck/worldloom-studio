---
name: field-build-prd-prep
description: Analyze a field-build report in reports/*, reconcile it against live repo and tracker state, and write a PRD-ready determination artifact for a later /to-prd pass.
disable-model-invocation: true
---

# Field Build PRD Prep

Turn a `.claude/skills/field-build` report into a PRD-ready determination artifact. The stopping point is a written prep artifact for a later `/to-prd` run, normally `reports/<field-build-report-stem>-prd-prep.md`; do not implement code, publish tracker issues, apply labels, or run `/to-prd`'s seam checkpoint.

## Inputs

- Require one canonical field-build report path or unambiguous glob under `reports/`, such as `reports/field-build-14-jon-urena-chrononaut.md`.
- Treat `reports/field-build-<digits>-<slug>.md` as the canonical run report shape. Exclude derivative files such as `*-prd-prep.md`, `*-change-spec*`, and research briefs unless the user explicitly selects one as additional context.
- If no report is named, ask for the report path before proceeding. If the named path does not resolve, run a narrow case-insensitive filename search under `reports/`; proceed only when exactly one source report resolves.

Complete intake only when the source report path, any existing same-stem prep artifact, baseline branch, and baseline worktree dirt are known.

## Process

### 1. Establish Freshness

1. Run `git status --short` and `git branch --show-current`, and retain the exact outputs as the baseline snapshot. Treat pre-existing dirty files as user or prior-session state unless the requested prep explicitly adopts them.
2. Read the source report carefully. For long reports, start with `wc -l` and a heading search, then read targeted slices around `Findings`, `Regression of prior findings`, `Decision-point log`, `For the app`, `For the methodology`, `Frontier`, and any addenda. Do not carry conclusions from truncated reads.
3. If the report names an app commit, resolve it and compare that commit with current `HEAD` plus relevant worktree changes over the product and authority paths discovered from repo guidance. Classify the result as `same product/authority tree`, `relevant committed drift`, `relevant uncommitted drift`, or `unavailable - <reason>`. A different `HEAD` is not itself product drift: use a bounded path diff such as `git diff --name-only <report-commit>..HEAD -- <relevant paths>` and the baseline status, keeping report-only or skill-only changes separate from product/authority changes.
4. Check the default same-stem prep path with a proofable readback, such as `if test -e <path>; then echo "exists"; else echo "missing"; fi` or `ls -l <path>`. Always record `Existing same-stem prep artifact classification:` in the output header, using `missing at intake` when no prior artifact exists. If `reports/<field-build-report-stem>-prd-prep.md` exists, read it and classify it as current, partially consumed, stale, superseded, or not relevant.

   For a partially consumed or stale prep, build a prior-recommendation consumption ledger in working notes before reusing any conclusion. Give the previous first operational action, selected first PRD or program, every follow-on, and every coverage item its own row; mark each `consumed`, `still live`, or `rejected` from current source and tracker evidence, naming consumed tracker IDs when they exist. Preserve only the still-live candidates, and summarize the ledger in the existing-prep classification and reassessment verdict instead of treating the old recommendation or sequencing as current.
5. Read repo entrypoint guidance if it is not already in context. Follow it to relevant domain vocabulary, methodology, principles, ADRs, specs, issue-tracker docs, and triage-label docs as needed.
6. Consult `/to-prd` for house style only: use its reference-only expectations for PRD-ready inputs, source durability, publication package, seam input, likely label, and browser-visible checklist mapping. Do not draft, stage, publish, label, or verify a PRD issue.
7. Before writing the prep artifact, read the output skeleton at [`../grilling/references/prd-ready-determination-artifact.md`](../grilling/references/prd-ready-determination-artifact.md).

Complete this step only when the report, relevant authorities, current implementation surface, tracker overlap, prior PRD/issue context, and output skeleton have all been checked or explicitly marked unavailable.

### 2. Reconcile Findings

For every `P`, `R`, `F`, `M`, `Q`, and `V` finding, plus every item in `For the app`, `For the methodology`, regression sections, and frontier notes, assign exactly one status:

- `validated/no product scope`: the report proves current behavior is acceptable or only records coverage.
- `covered`: current source or closed tracker work already appears to address it.
- `verification/reopen candidate`: the report conflicts with current source or tracker claims, and replay would be needed before opening new product scope.
- `fresh product scope`: codebase-wide app behavior should change.
- `methodology/docs scope`: future work should change doctrine, specs, principles, ADRs, or glossary rather than app behavior.
- `coverage follow-up`: non-product replay, test, audit, or evidence work; it may justify a later reopen or fresh scope only if the current proof fails.
- `follow-on candidate`: real product or docs scope, but not part of the recommended first PRD.
- `no-op/rejected`: not worth carrying forward, with reason.

Check current source and tracker state before preserving a reported blocker. Search narrowly from report terms, app destinations, IDs, and spec names; fetch exact GitHub issues or PRDs when the report or search results name them. If tracker refresh is unavailable, record the limitation and avoid claiming `ready-for-agent` certainty from stale tracker state.

Use a compact tracker-read ladder. First fetch exact number, title, state, labels, close/update time, and URL for named issues or search candidates. Then read full bodies only for likely scope owners, and extract the acceptance clauses or closeout comments needed for comparison one issue or a small related family at a time. Do not batch several full issue bodies and comment histories into one read when compact metadata or targeted acceptance excerpts will answer the question.

Project the metadata sweep instead of dumping it. A raw `gh issue list --json number,title,state,labels` returns fully nested label objects for every issue and spends the tool-result budget on fields you will not read; shape it with `--jq` to the columns the comparison needs, such as `gh issue list --state open --json number,title,labels --jq '.[] | "\(.number)\t\(.title)"'`. Reserve unprojected bodies for the likely scope owners this ladder already isolates.

When a closeout body or comment names an implementation commit, check whether that SHA is reachable from current `HEAD` or the publication ref before relying on it. A non-ancestor SHA is not by itself evidence that the fix disappeared: compare the accepted scenario with the current product/authority tree and focused tests, using a bounded diff or equivalent source comparison when useful. Classify the closeout evidence as `reachable current`, `rebased/equivalent current`, `dropped/regressed`, or `unavailable - <reason>`, and record that classification in the affected evidence row. Do not infer either coverage or regression from reachability alone.

When a finding overlaps closed work, compare the report's exact preconditions, active route, action, and resulting state with the closed issue's acceptance scenario and current tests. Classify an exact accepted-scenario contradiction as `verification/reopen candidate`; classify a currently reproducible state combination outside the closed acceptance as `fresh product scope`; classify matching implemented behavior as `covered`. Record one sentence explaining why the adjacent closed work does or does not consume the reported scenario.

Use read-only source and test inspection by default. Run focused tests only when they materially distinguish `covered`, `verification/reopen candidate`, and `fresh product scope`, and when they can run without changing product or tracker state. Root gates are not expected for a report-only prep unless the run also changes product, workflow, package, or build surfaces. Record the focused evidence that ran and the broader gates or app/browser runs that were skipped; do not describe a skill-local helper as a canonical repo gate.

Read the run's own artifacts too, not only source and tracker. Every field-build report names a world file and cites evidence such as a live log, screenshots, and prompt exports. When a status turns on what the app actually computed or persisted for that world, query the world file read-only rather than inferring it from the report's prose. This is often the only way to separate a correct owed-state signal from a keyword or prose false positive — the app can report work as owed for a reason unrelated to the fact the report is about — and that distinction is exactly the `covered` versus `fresh product scope` boundary this step exists to settle. Never mutate the world or its artifacts, and carry them as temp-only evidence: they may inform the determination and be summarized for provenance, but they stay `summarized, not cited` under step 4.

Complete reconciliation only when every finding, app/methodology item, regression item, and frontier note has a status, evidence, PRD impact, and no uncategorized blocker remains.

### 3. Determine The Codebase-Wide Change

Translate symptoms into product rules and seams. Prefer a codebase-wide behavior statement over a one-screen fix when several findings share an active route, decision point, persistence boundary, prompt-out contract, or acceptance proof.

Package candidates with these rules:

- Bundle findings into one PRD only when they share the same active route, decision point, seam, and acceptance proof.
- Use a multi-PRD program only when findings are independently implementable product outcomes or a sequenced program.
- Treat `verification/reopen candidate` as a tracker/conformance action and `coverage follow-up` as evidence work, not as new-PRD candidates.
- When a blocking reopen coexists with fresh PRD-scale scope, record the **first operational action** separately from the **recommended first new PRD**. Sequence the new PRD's implementation or acceptance proof behind the reopen only when the dependency is real; that sequence is not a multi-PRD program.
- Among `fresh product scope` and `methodology/docs scope` candidates, pick the first new PRD by blocker severity, guided-flow or methodology-conformance risk, direct field-build frontier, dependency order, then proof readiness.
- Preserve follow-ons, coverage-only items, and rejected alternatives explicitly so `/to-prd` does not have to reconstruct them from chat.

When an existing prep is partially consumed or stale, apply these packaging rules to the still-live rows from the prior-recommendation consumption ledger alongside any newly discovered candidates. Reclassify them against current evidence and re-run the normal priority order; do not preserve the prior first-PRD choice, follow-on status, dependency sequence, or no-new-PRD verdict merely because it appeared in the earlier artifact.

If no report finding or seed remains as `fresh product scope` or `methodology/docs scope`, select a `no new PRD recommended` verdict instead of forcing a first PRD, even when verification/reopen candidates, coverage follow-up, or deferred follow-ons remain. Record `First operational action: none - <reason>` when no separate tracker or verification action applies, plus the closed tracker work or current source that consumed each candidate, the verification/reopen triggers that would justify future scope, the rejected duplicate-publication alternatives, and every coverage follow-up.

If multiple first-PRD choices remain user-owned after evidence is exhausted, ask one scope/artifact-home question. Otherwise write the prep artifact at the default same-stem path and mark the recommendation as evidence-driven.

Complete this step only when there is a selected first new PRD, explicit multi-PRD program, or no-new-PRD verdict, plus an explicit first operational action value, named follow-ons or verification/reopen candidates, coverage follow-up, and rejected/no-op alternatives.

### 4. Write The PRD-Ready Artifact

Write or update `reports/<field-build-report-stem>-prd-prep.md` unless the user selected another durable path or asked for recap only. Use the skeleton from `grilling` as the output contract, adapting headings only when repo-local prior art is stronger.

The artifact must include:

- source report path, selected report sections, existing same-stem prep artifact classification, source durability, authored-artifact durability, live checkout snapshot, tracker freshness, and deliverable status;
- reassessment verdict, including what is fixed or validated, what remains as product work or why none remains, an explicit first operational action value, recommended first new PRD or no-new-PRD verdict, follow-ons, coverage-only work, and supporting-skill results when applicable;
- evidence checked, with one row per finding or candidate when there is more than one. The validator maps every source item to exactly one row by that row's label, so give each kind the label it expects: finding rows start with the bare finding ID (`F-03`, optionally followed by a title); `For the app` seed rows start with the seed's `App Seed <n>` prefix, or the full heading when the heading carries no seed number; each regression row contains the literal `Field Build <n> <ID>` identity string; `For the methodology` gets its own row; and each top-level Frontier bullet gets a dedicated row labelled `Frontier: <text before the first colon>`;
- authority findings over methodology, principles, ADRs, specs, domain docs, and tracker conventions;
- recommended first PRD or no-new-PRD verdict with purpose, sources, problem, product rule or seam, scope, acceptance, likely issue slices if useful, and out of scope;
- follow-on candidates and coverage follow-up;
- rejected or no-op alternatives;
- PRD publication inputs: suggested title, publication package, recommended testing seam, `/to-prd` house-style consultation status, likely label and downgrades, authorities to cite, browser-visible checklist needs, gates, and evidence expectations;
- completion self-check and freshness/boundaries.

Write the header fields, decision-handoff fields, and PRD-publication-input fields as bare line-start `Key: value` lines. The decision handoff always includes `First operational action:`, using `none - <reason>` when no separate action applies, and exactly one of `Recommended first new PRD:` or `No-new-PRD verdict:`. The validator anchors each required field to the start of a line, so a field wrapped in a bullet or in bold (`- **Source report path:**`) fails the check even though the `grilling` skeleton presents these fields as bulleted lists. The skeleton governs which fields appear and in what section order; this line shape governs how the required fields themselves are written.

Classify local source artifacts as durable only after tracked, clean, publication-ref path-visible, and publication-ref content-identical proof. Evaluate content identity only after both tracked and publication-ref-visible checks succeed. When either prerequisite fails, record content identity as `N/A - no publication-ref blob`, classify the artifact as non-durable, and do not interpret a successful `git diff --quiet` result for that untracked or ref-absent path as a content match. For a tracked, visible path, run `git diff --quiet <publication-ref> -- <path>` or an equivalent blob comparison and inspect its exit status. Otherwise write `pending local publication` or `summarized, not cited`. Temp-only evidence and machine-local paths may be summarized for prep provenance, but the later PRD must not cite them as stable sources.

Complete writing only when a later `/to-prd` pass could draft without re-reading the whole field-build report to recover provenance, scope, seam recommendation, label posture, or deferred work.

### 5. Preflight And Close

Before final reporting:

1. Run `node .claude/skills/field-build-prd-prep/scripts/validate-prd-prep.mjs <source-report> <prep-artifact>`. Fix structural errors and inspect every warning. The helper checks coverage and output shape only; it does not decide whether a finding's semantic classification or recommended scope is correct. If the helper rejects source-report syntax rather than artifact structure, do not edit the source report or this skill during the prep. Confirm the source remains unchanged, compare the rejected form with the current canonical field-build report grammar, run the helper unit tests plus a read-only compatibility probe, and classify the failure as `artifact defect` or `validator defect`. Fix artifact defects in the prep. For a validator defect, record the canonical failure and diagnostic probe in the completion self-check, route the helper repair through `skill-audit`, and continue only when the read-only probe proves the artifact's coverage and shape.
2. Re-scan the prep artifact for accidental machine-local source leakage and stale publication phrasing. Inspect `/tmp`, `/home`, `should be checked`, `must be checked before publication`, `if the body passes`, and `TBD before publication` hits; keep only intentional durability warnings or open future decisions. The validator reports these hits, but this manual intent check remains required.
3. Record the validator summary and the completed manual-scan result in `Completion Self-Check` or `Freshness And Boundaries`. Use completed-state wording; do not leave a future-tense reminder to run either check. Refer to the patterns listed in item 2 above by name and never reproduce the literal scan tokens in the artifact: the validator greps the artifact for those same strings, so quoting them makes the record trip the very warning it is reporting as clear. Write the result as `the machine-local path and stale-publication-language patterns from this preflight returned no hits`, not as a list of the tokens. Report the validator's warning count as it actually came back; a clean run has none, and claiming a warning that did not fire is itself a defect.
4. Re-run `git status --short` and `git branch --show-current`, compare them with the retained baseline, and classify every remaining path as `intentional prep output`, `pre-existing`, or `concurrent/unowned`. Never adopt or clean concurrent/unowned paths.
5. If the final delta changes the artifact's live-checkout or boundary wording, update the artifact, rerun steps 1-4 of this preflight, and take one last status/branch snapshot after the final artifact edit. Do not report an earlier status snapshot as final.
6. Verify the `.agents/skills/<skill-name>` mirror exists when the run edited this skill itself; otherwise normal PRD prep does not edit skill files.

Final reporting must state the source report, prep artifact path or recap-only result, the explicit first operational action value, selected first new PRD, program, or no-new-PRD verdict, follow-ons, tracker freshness limitation if any, source/artifact durability posture, files intentionally changed, and every remaining dirty path with its classification. Also state that no code, tracker, PRD publication, or `/to-prd` seam checkpoint happened unless the user explicitly requested and the run actually did it.
