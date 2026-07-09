# PRD-Ready Determination Artifact

Use this skeleton when `grilling` is asked to get a report-cited or determination run ready for `/to-prd`. Prefer repo-local prior art when it is more specific, but preserve the intent of each section so the publication pass does not have to reconstruct provenance from chat history.

## Quick Path For Report-Cited Prep

Before filling the skeleton:

- Classify the run as determination/recommendation, diagnostic/audit, or report-cited stress-test. If no plan exists yet, survey broadly enough to assemble the candidate set before asking the root candidate/scope question.
- Reconcile the cited report's date, commit, and freshness claims against current source plus relevant open and closed tracker work. If live evidence contradicts a reported finding, classify it as covered unless replay disproves it, or as a verification/reopen candidate, rather than fresh product scope.
- Resolve scope boundary and artifact home. One artifact-home prompt may name both the selected scope and target path; if scope was already confirmed in a prior question, ask only artifact home next. In both cases, the artifact-home confirmation is the terminal downstream-artifact checkpoint unless new user-owned scope appears.
- Include a "recap only, no file" option in the artifact-home prompt.
- For prep-only requests that name a later `/to-prd` pass, consult `/to-prd` for house style only. Do not invoke publication, issue creation, or `/to-prd`'s seam checkpoint.

## Header

Include:

- Source artifact path or identifier, plus selected section/title when applicable.
- Source durability status: durable, dirty, untracked, or temp-only.
- Authored artifact status: for the determination file being written, state whether it is new/untracked, dirty, tracked-clean, or publication-ref-visible as applicable.
- Primary evidence summarized from local files, tracker state, reports, issue IDs, screenshots, or runtime captures.
- Live checkout or freshness snapshot, including branch and relevant worktree dirt.
- Tracker freshness, including the command or issue IDs checked.
- Deliverable status: PRD-ready determination only, with no tracker/code/spec mutation unless that actually happened.

If a source is dirty, untracked, or temp-only, do not describe it as a stable published citation. Use "pending local publication" for repo files not yet durable, or "summarized, not cited" for temporary paths.

## Reassessment Verdict

State the short verdict first:

- What is fixed, validated, or closed by the evidence.
- What remains as codebase-wide product work.
- The recommended first PRD seam.
- Follow-on candidates and coverage-only items.
- Supporting-skill result when a supporting skill was in play.
- External research status when applicable.

## Evidence Checked

Classify the findings or candidates in a table when there is more than one. Include:

- Finding or candidate ID/title.
- Status.
- PRD impact.

Then list prior-art reports, closed PRDs, open tracker overlap, relevant closed issue IDs, code-surface checks, or other evidence that shaped the candidate set.

## Authority Findings

Record whether methodology, principles, ADRs, specs, domain docs, or tracker conventions require changes.

If no change is owed, say that directly and name the existing authorities that already cover the behavior.

If spec or doc changes are owed through the future PRD, list them as PRD scope, not as edits already made.

## Recommended First PRD

Use a subsection headed with the candidate PRD name. Include:

- Purpose.
- Sources.
- Problem.
- Recommended product rule or seam.
- Scope.
- Acceptance.
- Likely issue slices, if useful.
- Out of scope.

Keep file paths out of implementation details unless they are stable source citations or the repo's house style expects them.

## Follow-On Candidates

For each deferred candidate, include:

- Purpose.
- Sources.
- Problem.
- Recommended rule or open design point.
- Scope.
- Acceptance.

Make clear that deferred candidates are not part of the first PRD unless the user explicitly asks for a multi-PRD program.

## Coverage Follow-Up

Use this section for field-build, audit, test, or research work that should happen before more product scope is opened. State what would turn it into product work.

## Rejected Or No-Op Alternatives

List the major alternatives that were considered and rejected, including no-op doc, principle, ADR, tracker, implementation, or scope-packaging options. Each item should say why it was rejected.

## PRD Publication Inputs

Include the details a later `/to-prd` pass needs:

- Suggested title.
- Publication package: one PRD, multi-PRD program, or first PRD plus deferred follow-ons.
- Recommended testing seam and the seam checkpoint still owed.
- Whether `/to-prd` was consulted for house style only, when applicable.
- Likely label and what would downgrade it.
- Principles, ADRs, specs, tracker IDs, and prior PRDs to cite.
- Browser-visible guidance checklist mapping requirements when applicable.
- Canonical gates and focused gates.
- Browser, cold-LLM, or field replay evidence expectations.
- Source durability warnings and temporary-path handling.

## Completion Self-Check

Before closing or writing the final summary, scan the drafted artifact for these fields:

- `/to-prd` consulted for house style only, or skipped with reason.
- Source artifact posture and temporary-path handling.
- Authored artifact posture: new/untracked, dirty, tracked-clean, or publication-ref-visible as applicable.
- Tracker freshness and relevant open/closed issue IDs.
- Selected first PRD or verdict.
- Follow-on candidates and coverage-only work.
- Recommended testing seam and seam checkpoint still owed.
- Likely publication label and what would downgrade it.
- Canonical gates and focused gates.
- Source and authored-artifact durability warnings.

## Freshness And Boundaries

Close with:

- What was refreshed in the current session.
- What was not done.
- Product tests or app runs skipped, with reason.
- Pre-existing worktree dirt.
- Files this prep intentionally added or changed.
