# PRD 172 Method-Card Guidance Walkthrough

Date: 2026-07-06

Scope: PRD #172, issues #186-#191.

## Evidence

- Spec and card catalog test: `packages/server/test/method-cards.test.ts` covers `docs/specs/method-cards.md`, required card fields, derivation versioning, severity depth, setup/workflow-map/operating cards, T-8 excluded package sources, representative HTTP payloads, and prompt-packet source-manifest placement.
- Existing HTTP tests: `packages/server/test/creation-flow.test.ts`, `packages/server/test/decision-point-contract.test.ts`, `packages/server/test/constraint-composition-flow.test.ts`, `packages/server/test/institutional-flow.test.ts`, `packages/server/test/qa-flow.test.ts`, and `packages/server/test/workflow-map.test.ts`.
- Existing web render tests: `packages/web/src/creation-decision-surface.test.tsx`, `packages/web/src/admission-decision-surface.test.tsx`, `packages/web/src/constraint-composition-flow.test.tsx`, `packages/web/src/institutional-flow.test.tsx`, `packages/web/src/workflow-shell.test.tsx`, and `packages/web/src/qa-flow.test.tsx`.
- Browser smoke: local app at `http://127.0.0.1:5174/`, API at `http://127.0.0.1:4173`, temp world `/tmp/worldloom-prd172-method-card.sqlite`.
- Screenshot artifact: `output/playwright/prd172-method-card-creation.png`.

## Cognitive Walkthrough

Representative flow: Creation kernel decision in the routed workflow shell.

1. The steward can identify the decision: the route `Setup/open world -> Workflow map -> Go to decision -> Start or Resume Creation` renders `Method card: World kernel` and states the kernel decision in plain language.
2. The steward can see why the method asks: the method card renders `Why the method asks` beside the decision and operative rule.
3. The steward can distinguish work types: required, optional, allowed-empty, skippable, and server blockers remain visible in the same step context.
4. The steward can see Prompt-out as advisory pressure: the prompt preview keeps the advisory/canon warning and source manifest separate from card instruction.
5. The steward can predict writes and non-mutations: write preview names kernel/report/seed writes, Admission handoff, and canon-standing non-mutation.
6. The steward can exit and resume: the read-side trail and safe-exit/resume text remain on the decision surface.
7. The steward can tell instruction from provenance: card prose is primary; package file paths appear in provenance details and source manifests.

## Coverage Ledger Result

`docs/methodology-coverage.md` gains a W-9 method-card guidance-layer row. Individual flow maturities do not change from this evidence; PRD #172 proves the shared guidance-content layer and one representative walkthrough, not field validation for each flow interior.

## T-8 Exclusion Check

The method-card catalog has no cards whose package sources are the honestly untested surfaces named by charter T-8: spatial/geographic propagation, agent/character psychology, uncertainty/belief/evidence, narrative/game/transmedia extraction, and aesthetic coherence. This is asserted by `packages/server/test/method-cards.test.ts`.

## Follow-Ups

No PRD #172 blocking walkthrough failures were found.

## Browser Smoke

Route: `http://127.0.0.1:5174/`.

Action path: create/open `/tmp/worldloom-prd172-method-card.sqlite`, inspect setup method card, inspect workflow-map method card, choose `Go to decision`, click `Start or Resume Creation`, inspect the Creation method card and prompt source manifest.

Observed outcome: setup and workflow-map cards rendered decision, operative rule, why, what-good-looks-like, and provenance affordances. Creation rendered `Method card: World kernel` with the same four card fields; package paths appeared under provenance/source manifest, not as the primary instruction. Browser console errors: 0.
