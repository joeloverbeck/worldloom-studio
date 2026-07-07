# Browser-Visible Guidance Acceptance

This document defines reusable acceptance evidence for browser guidance. It is not a PRD and not a test framework; it tells reviewers what proof to ask for when a guided-flow issue claims completion.

## Required Evidence Patterns

For a guided-flow browser slice, acceptance should include the smallest useful set of:

- screenshot, Playwright smoke, or component-render evidence showing the task card or equivalent decision-point surface;
- selected record, draft, debt item, or report example that starts the flow;
- severity path example when severity changes obligations;
- source doctrine visible at the decision point as app-owned rule text, checklist text, template expectation, or operating-card excerpt, with file paths kept as provenance/detail rather than the only guidance;
- required/optional/skippable fields visible in the same step context;
- blocker example showing substance validation, not checkbox completion;
- action-failure/server-blocker example for any browser slice that can submit a guided-flow action: the server-returned error appears at or near the action, the entered fields/selections are preserved, remediation text or route is visible, and the steward does not need console or network tooling to recover;
- skip example showing recorded skip behavior and reason threshold when offered;
- prompt packet preview with source manifest and advisory/canon warning when prompt-out is in scope;
- resulting record, report, link, queue entry, advisory artifact, debt item, or explicit non-mutation;
- read-side trail in Current Canon, Audit Trail, record detail, export, or a stated deferral.

When the slice touches provenance, reviewers should be able to distinguish primary instructions from provenance. Source paths, package filenames, issue numbers, and markdown anchors may appear in manifests or expandable detail, but the visible decision point still carries the current obligation, blocker, write intent, prompt role, and next step in wording a docs-naive steward can act on.

For setup/open-world browser slices, acceptance should include:

- first-load evidence with no token field, server status, catalog status, create/open controls, recent worlds, and no workflow panels competing before a world is open;
- an inline create/open failure with the entered path preserved and the server-returned recovery text visible near the setup controls;
- a successful create/open that names the open world, updates recent worlds, and reveals the workspace only after success;
- an empty-world state that foregrounds Creation as the primary next path while unrelated flows show prerequisites or unavailable states;
- confirmation that Prompt-out, Admission, Propagation, QA, Canon Workbench work, search, snapshot/export, and generic record/link tools are hidden or blocked before a world is open.

## Field-Build Regression Closure Pattern

When a PRD or issue claims to close a blocker found during a field build, acceptance evidence should map the original finding to proof of the exact active route that failed. A representative fixture, lower-level contract, generic substrate panel, legacy panel, or nearby controlled path can support the proof, but it does not by itself promote the active route to field-ready maturity.

The closeout evidence should name:

- the original field-build finding and the durable PRD or issue that summarizes it, without treating local session reports or temporary artifacts as stable citations;
- the exact active route and action sequence that failed for the steward;
- any representative fixture, controlled path, or component render used, plus what it proves and what it does not prove;
- browser-visible state transitions on the active route, including current/stale state, blockers, entered material preservation, selected record or debt identity, and route-owned copy/store/export affordances when relevant;
- API or readback proof when the fix writes or reads durable state, including the resulting record, report, queue entry, operation event, audit trail, or explicit non-mutation;
- Prompt-out packet proof when the blocker involves Prompt-out: packet mode, status, visible body, copyable body, source manifest, omission text, advisory/canon warning, and cold external LLM packet relevance where that proof is in scope;
- remaining caveats, follow-up PRDs, or intentionally unproven routes when the fix is partial.

Coverage-ledger promotion should wait for corresponding active-route replay evidence. If a slice proves only a primitive, server contract, representative fixture, or API readback, the ledger should preserve that value while keeping active-route caveats explicit.

This field-build closure pattern is additive reviewer guidance. It does not create a repo-wide browser automation gate, require a specific browser tool, introduce direct LLM integration, or amend the methodology package, principles, or ADRs.

## Cognitive Walkthrough Checklist

For learnability-sensitive changes, run a lightweight naive-steward walkthrough:

1. The steward can identify what decision is being made.
2. The steward can see why the package asks for that decision.
3. The steward can distinguish required, optional, skipped, and severity-dependent work.
4. The steward can see prompt-out as advisory pressure, not canon generation.
5. The steward can predict what the app will write, link, route, or leave untouched.
6. The steward can exit and resume without losing orientation.
7. The steward can tell which file paths are provenance and which visible text is the operating instruction.
8. When the slice includes a guided-flow write action, the steward can recover after one failed action with their entered material still present.

Record failures as follow-up work unless they block the issue's own acceptance criteria.

For setup/open-world changes, also record that the steward can start without copying a token, distinguish server/catalog readiness from world-file failures, recover from one create/open failure without retyping the path, and arrive at Creation as the first empty-world guided path.

This action-failure pattern is reviewer guidance, not a test-framework policy. It does not create a repo-wide browser/e2e hard gate; browser-visible proof can be a targeted component render, Playwright smoke, screenshot, or concise manual observation appropriate to the slice.

## Principles

Touches `docs/worldbuilding-system/05_creation_protocol.md`, `docs/worldbuilding-system/06_canon_fact_admission_protocol.md`, `docs/worldbuilding-system/20_ai_assisted_workflow.md`, `docs/worldbuilding-system/operating_card.md`, `docs/specs/creation-flow.md`, `docs/specs/prompt-out-context-assembly.md`, `docs/specs/workflow-map-and-navigation.md`, `guided-workflow-usability.md` W-8, `workflow-principles.md` W-2/W-3/W-4/W-7, `canon-sovereignty.md` P-2/W-1/T-5, `domain-fidelity.md` P-1/T-2, `data-principles.md` P-6/W-5/W-6/T-5, ADR 0007, ADR 0009, PRD #150, PRD #158, and PRD #165. It affirms non-contradiction.
