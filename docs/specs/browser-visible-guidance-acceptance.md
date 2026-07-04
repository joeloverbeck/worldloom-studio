# Browser-Visible Guidance Acceptance

This document defines reusable acceptance evidence for browser guidance. It is not a PRD and not a test framework; it tells reviewers what proof to ask for when a guided-flow issue claims completion.

## Required Evidence Patterns

For a guided-flow browser slice, acceptance should include the smallest useful set of:

- screenshot, Playwright smoke, or component-render evidence showing the task card or equivalent decision-point surface;
- selected record, draft, debt item, or report example that starts the flow;
- severity path example when severity changes obligations;
- source doctrine visible at the decision point;
- required/optional/skippable fields visible in the same step context;
- blocker example showing substance validation, not checkbox completion;
- skip example showing recorded skip behavior and reason threshold when offered;
- prompt packet preview with source manifest and advisory/canon warning when prompt-out is in scope;
- resulting record, report, link, queue entry, advisory artifact, debt item, or explicit non-mutation;
- read-side trail in Current Canon, Audit Trail, record detail, export, or a stated deferral.

## Cognitive Walkthrough Checklist

For learnability-sensitive changes, run a lightweight naive-steward walkthrough:

1. The steward can identify what decision is being made.
2. The steward can see why the package asks for that decision.
3. The steward can distinguish required, optional, skipped, and severity-dependent work.
4. The steward can see prompt-out as advisory pressure, not canon generation.
5. The steward can predict what the app will write, link, route, or leave untouched.
6. The steward can exit and resume without losing orientation.

Record failures as follow-up work unless they block the issue's own acceptance criteria.

## Principles

Touches `guided-workflow-usability.md` W-8, `workflow-principles.md` W-2/W-4/W-7, `canon-sovereignty.md` P-2/W-1/T-5, and `data-principles.md` W-5/W-6. It affirms non-contradiction.
