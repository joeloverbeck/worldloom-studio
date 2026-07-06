# PRD 171 Map-First Walkthrough

Date: 2026-07-05

Scope: PRD #171, issues #180-#184.

## Evidence

- Component tests: `packages/web/src/workflow-shell.test.tsx` covers map home rendering from server-owned shapes and one-destination routing for Creation and Substrate.
- HTTP tests: `packages/server/test/workflow-map.test.ts` covers the read-only workflow-map payload, queue counts, next-decision selection, and no-write behavior over temp-file worlds.
- Browser smoke: local app at `http://127.0.0.1:5173/`, temp world `/tmp/worldloom-map-first-prd171.sqlite`.
- Screenshot artifact: `output/playwright/prd171-map-first-admission.png`.

## Browser Walkthrough

1. Setup/no-world entry showed `Setup/open world`, server readiness, catalog readiness, create/open controls, recent worlds, and no workflow panels.
2. Creating `/tmp/worldloom-map-first-prd171.sqlite` landed on `Workflow map`, not the stacked workspace.
3. The map showed `Start Creation`, the reason `No world kernel exists yet; create the world kernel first.`, stage state, unlock reasons, and queue counts for Admission, owed propagation, owed boundaries, canon debt, and skips.
4. Entering Creation showed one destination: `Creation decision point`, operating-card context, blockers, Prompt-out preview, seed-decomposition decision, write preview, read-side trail, safe exit/resume, and `Back to workflow map`.
5. Returning with `Back to workflow map` restored the map with live stage state, queue counts, and next decision.
6. Entering Admission showed one destination: `Admission flow`, queue state, and `Back to workflow map`.

## Naive-Steward Walkthrough

- Position in the method: the map names the current world state and makes Creation active for an empty world.
- Why here: the next-decision reason explains that no `world_kernel` exists.
- What is owed: queue cards show zero-count owed work explicitly, so the steward can see no hidden Admission, propagation, boundary, debt, or skip work is waiting.
- What happens next: `Start Creation` routes to the Creation decision point, while unearned stages state their unlock reasons.
- Way back: guided destinations expose `Back to workflow map`.

## Coverage Ledger Result

`docs/methodology-coverage.md` gains a W-10 workflow-map/navigation row with `walkthrough-passed` maturity. Individual flow maturities do not change from this evidence; the walkthrough proves navigation grammar and map-first orientation, not full decision-guided maturity for Propagation, Stage 12, Contradiction, QA, or global Prompt-out.

## Follow-Ups

No PRD #171 blocking walkthrough failures were found.

## Code Review Fallback

Review frame: fixed point `HEAD~1` (`3a781210c7c36b8de8b27d3ca2fdee6006b06604`); diff command `git diff HEAD~1...HEAD`; commits current implementation commit `Implement map-first workflow shell`; worktree scope committed diff only, excluded dirty files `.claude/skills/code-review/SKILL.md`, `.claude/skills/domain-modeling/ADR-FORMAT.md`, `.claude/skills/domain-modeling/SKILL.md`, `.claude/skills/grilling/SKILL.md`, `.claude/skills/implement/SKILL.md`, `.claude/skills/tdd/SKILL.md`, `.claude/skills/to-issues/SKILL.md`, `.claude/skills/to-prd/SKILL.md`; spec source issues #180, #181, #182, #183, #184, parent PRD #171, `docs/specs/workflow-map-and-navigation.md`, `docs/specs/browser-visible-guidance-acceptance.md`.

### Standards

Fallback used: policy-blocked delegation; the available sub-agent tool requires explicit user authorization for delegation, and the user did not ask for sub-agents.

Sources reviewed: root `AGENTS.md` instructions, `docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md`, `docs/agents/domain.md`, root verification commands, and the smell baseline from the code-review skill.

Smell baseline applied: yes.

Findings found: none.

Residual findings: none.

### Spec

Sources reviewed: issues #180-#184, parent PRD #171, `docs/specs/workflow-map-and-navigation.md`, `docs/specs/browser-visible-guidance-acceptance.md`, `docs/principles/README.md`, `docs/principles/guided-workflow-usability.md`, `docs/principles/workflow-principles.md`, `docs/principles/charter.md`, `docs/principles/domain-fidelity.md`, `docs/principles/data-principles.md`, ADR 0006, ADR 0007, ADR 0008, ADR 0009, and `docs/worldbuilding-system/operating_card.md`.

| Issue | Acceptance source | Evidence reviewed | Findings/residuals |
|---|---|---|---|
| #180 | workflow-map shell spec upgrade | `docs/specs/workflow-map-and-navigation.md` journey model, map-as-home rule, state grammar, queues, destinations, Prompt-out classification, propagation-before-boundaries rule, and acceptance update | none |
| #181 | browser surface extraction/preservation | `packages/web/src/workflow-shell.tsx`, retained legacy render path, full web test suite | none |
| #182 | server-owned workflow map payload | `packages/shared/src/index.ts`, `packages/server/src/workflow-map.ts`, `packages/server/src/http/workflow-map-routes.ts`, `packages/server/test/workflow-map.test.ts` | none |
| #183 | routed shell with map home | `packages/web/src/main.tsx`, `packages/web/src/workflow-shell.tsx`, `packages/web/src/workflow-shell.test.tsx`, browser smoke | none |
| #184 | walkthrough evidence and coverage closeout | this report, `docs/methodology-coverage.md`, screenshot artifact `output/playwright/prd171-map-first-admission.png` | none |

Findings found: one pre-commit spec risk was found and fixed: the initial WIP used a browser-side fallback map that computed empty-world readiness before the server payload arrived, contradicting ADR 0009/server-owned readiness. Fix: removed the local fallback map and render `Loading server-owned workflow map.` until `/api/workflow-map` returns.

Residual findings: none.

Axis summary: Standards 0/worst none, Spec 0/worst none.

Review fallback gate passed: frame yes; Standards yes; Spec yes; child table yes; smell baseline yes; found-vs-residual yes; closeout line yes; verification/browser freshness yes.

Review fallback: policy-blocked delegation; standards/spec result 0 residual findings after one pre-commit spec risk fixed; fixes in amended implementation commit; verification rerun `pnpm test`, `pnpm typecheck`, `pnpm build`, plus browser smoke on `http://127.0.0.1:5173/`.
