# worldloom-studio

## Agent skills

### Issue tracker

Issues and PRDs live in this repo's GitHub Issues, managed via the `gh` CLI; external pull requests are also treated as a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary — `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context layout — `CONTEXT-MAP.md` at the root points to per-context `CONTEXT.md` files. See `docs/agents/domain.md`.

### Foundational principles

App-level principles live in `docs/principles/`; read `docs/principles/README.md` for the authority order and the conformance rule (specs and implementable issues carry a "Principles" section). System-wide ADRs live in `docs/adr/`. The worldbuilding methodology in `docs/worldbuilding-system/` is upstream of both.

## Verification

Use Node 24 and pnpm 10.33.0; `.node-version` and the root `packageManager` field are the local runtime hints. The canonical root gates are `pnpm test`, `pnpm typecheck`, and `pnpm build`; GitHub CI runs those after `pnpm install --frozen-lockfile`. For narrow edits, run the relevant subset; before workflow, package, cross-package, or closeout changes, run all three. There is no committed lint, browser/e2e, or hard audit gate yet, so do not report one as satisfied unless a task adds that script and policy.
