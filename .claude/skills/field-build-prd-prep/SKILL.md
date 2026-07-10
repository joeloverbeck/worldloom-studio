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

1. Run `git status --short` and `git branch --show-current`. Treat pre-existing dirty files as user or prior-session state unless the requested prep explicitly adopts them.
2. Read the source report carefully. For long reports, start with `wc -l` and a heading search, then read targeted slices around `Findings`, `Regression of prior findings`, `Decision-point log`, `For the app`, `For the methodology`, `Frontier`, and any addenda. Do not carry conclusions from truncated reads.
3. If `reports/<field-build-report-stem>-prd-prep.md` already exists, read it and classify it as current, partially consumed, stale, superseded, or not relevant. Preserve unconsumed candidates rather than treating the prep as wholly current.
4. Read repo entrypoint guidance if it is not already in context. Follow it to relevant domain vocabulary, methodology, principles, ADRs, specs, issue-tracker docs, and triage-label docs as needed.
5. Consult `/to-prd` for house style only: use its reference-only expectations for PRD-ready inputs, source durability, publication package, seam input, likely label, and browser-visible checklist mapping. Do not draft, stage, publish, label, or verify a PRD issue.
6. Before writing the prep artifact, read the output skeleton at [`../grilling/references/prd-ready-determination-artifact.md`](../grilling/references/prd-ready-determination-artifact.md).

Complete this step only when the report, relevant authorities, current implementation surface, tracker overlap, prior PRD/issue context, and output skeleton have all been checked or explicitly marked unavailable.

### 2. Reconcile Findings

For every `P`, `R`, `F`, `M`, and `Q` finding, plus every item in `For the app`, `For the methodology`, regression sections, and frontier notes, assign exactly one status:

- `validated/no product scope`: the report proves current behavior is acceptable or only records coverage.
- `covered`: current source or closed tracker work already appears to address it.
- `verification/reopen candidate`: the report conflicts with current source or tracker claims, and replay would be needed before opening new product scope.
- `fresh product scope`: codebase-wide app behavior should change.
- `methodology/docs scope`: future work should change doctrine, specs, principles, ADRs, or glossary rather than app behavior.
- `follow-on candidate`: real but not part of the recommended first PRD.
- `no-op/rejected`: not worth carrying forward, with reason.

Check current source and tracker state before preserving a reported blocker. Search narrowly from report terms, app destinations, IDs, and spec names; fetch exact GitHub issues or PRDs when the report or search results name them. If tracker refresh is unavailable, record the limitation and avoid claiming `ready-for-agent` certainty from stale tracker state.

Complete reconciliation only when every finding and report seed has a status, evidence, PRD impact, and no uncategorized blocker remains.

### 3. Determine The Codebase-Wide Change

Translate symptoms into product rules and seams. Prefer a codebase-wide behavior statement over a one-screen fix when several findings share an active route, decision point, persistence boundary, prompt-out contract, or acceptance proof.

Package candidates with these rules:

- Bundle findings into one PRD only when they share the same active route, decision point, seam, and acceptance proof.
- Use a multi-PRD program only when findings are independently implementable product outcomes or a sequenced program.
- Pick the first PRD by blocker severity, guided-flow or methodology-conformance risk, direct field-build frontier, dependency order, then proof readiness.
- Preserve follow-ons, coverage-only items, and rejected alternatives explicitly so `/to-prd` does not have to reconstruct them from chat.

If multiple first-PRD choices remain user-owned after evidence is exhausted, ask one scope/artifact-home question. Otherwise write the prep artifact at the default same-stem path and mark the recommendation as evidence-driven.

Complete this step only when there is a selected first PRD or explicit multi-PRD program, plus named follow-ons and rejected/no-op alternatives.

### 4. Write The PRD-Ready Artifact

Write or update `reports/<field-build-report-stem>-prd-prep.md` unless the user selected another durable path or asked for recap only. Use the skeleton from `grilling` as the output contract, adapting headings only when repo-local prior art is stronger.

The artifact must include:

- source report path, selected report sections, source durability, authored-artifact durability, live checkout snapshot, tracker freshness, and deliverable status;
- reassessment verdict, including what is fixed or validated, what remains as product work, recommended first PRD, follow-ons, coverage-only work, and supporting-skill results when applicable;
- evidence checked, with one row per finding or candidate when there is more than one;
- authority findings over methodology, principles, ADRs, specs, domain docs, and tracker conventions;
- recommended first PRD with purpose, sources, problem, product rule or seam, scope, acceptance, likely issue slices if useful, and out of scope;
- follow-on candidates and coverage follow-up;
- rejected or no-op alternatives;
- PRD publication inputs: suggested title, publication package, recommended testing seam, `/to-prd` house-style consultation status, likely label and downgrades, authorities to cite, browser-visible checklist needs, gates, and evidence expectations;
- completion self-check and freshness/boundaries.

Classify local source artifacts as durable only after tracked, clean, and publication-ref-visible proof. Otherwise write `pending local publication` or `summarized, not cited`. Temp-only evidence and machine-local paths may be summarized for prep provenance, but the later PRD must not cite them as stable sources.

Complete writing only when a later `/to-prd` pass could draft without re-reading the whole field-build report to recover provenance, scope, seam recommendation, label posture, or deferred work.

### 5. Preflight And Close

Before final reporting:

1. Re-scan the prep artifact for accidental machine-local source leakage and stale publication phrasing. Inspect `/tmp`, `/home`, `should be checked`, `must be checked before publication`, `if the body passes`, and `TBD before publication` hits; keep only intentional durability warnings or open future decisions.
2. Re-run `git status --short` and `git branch --show-current`.
3. Verify the `.agents/skills/<skill-name>` mirror exists when the run edited this skill itself; otherwise normal PRD prep does not edit skill files.

Final reporting must state the source report, prep artifact path or recap-only result, selected first PRD or program, follow-ons, tracker freshness limitation if any, source/artifact durability posture, and files intentionally changed. Also state that no code, tracker, PRD publication, or `/to-prd` seam checkpoint happened unless the user explicitly requested and the run actually did it.
