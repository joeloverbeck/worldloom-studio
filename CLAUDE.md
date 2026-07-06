# worldloom-studio

Worldloom Studio is a local-first, single-steward app for maintaining fictional worlds from a continuity and causality perspective.

## Runtime

Use Node 24 and pnpm 10.33.0. `.node-version` and the root `packageManager` field are the local runtime hints; install with `pnpm install --frozen-lockfile` when dependencies are not present or the lockfile changes.

## App

Run the app with `pnpm dev` from the repo root. That builds `@worldloom/shared`, starts the Hono API on `http://127.0.0.1:4173`, and starts the Vite web UI on `http://127.0.0.1:5173` with `/api` proxied to the server.

## Verification

Canonical root gates:

- `pnpm test`
- `pnpm typecheck`
- `pnpm build`

GitHub CI runs those after `pnpm install --frozen-lockfile`. For narrow edits, run the relevant package subset; before workflow, package, cross-package, or closeout changes, run all three. There is no committed lint, browser/e2e, or hard audit gate yet, so do not report one as satisfied unless a task adds that script and policy.

Useful package-level commands:

- `pnpm --filter @worldloom/shared test|typecheck|build`
- `pnpm --filter @worldloom/server test|typecheck|build`
- `pnpm --filter @worldloom/web test|typecheck|build`

## Agent Workflow

Issues and PRDs live in this repo's GitHub Issues, managed via the `gh` CLI; external pull requests are also a triage surface. See `docs/agents/issue-tracker.md`.

Default triage labels are `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

Domain vocabulary starts in root `CONTEXT.md`; if a future `CONTEXT-MAP.md` exists, use it to find the relevant context files. Follow `docs/agents/domain.md` and read relevant ADRs under `docs/adr/` before work that touches architectural decisions.

App-level principles live in `docs/principles/`; read `docs/principles/README.md` for the authority order and the conformance rule. Specs and implementable issues carry a `Principles` section. The worldbuilding methodology in `docs/worldbuilding-system/` is upstream of both principles and ADRs.
