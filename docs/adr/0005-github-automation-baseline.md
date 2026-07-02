# GitHub automation baseline

Worldloom Studio starts GitHub automation with a narrow baseline: one Node 24 CI workflow on Ubuntu that installs pnpm dependencies with the frozen lockfile, then runs the existing root gates `pnpm test`, `pnpm typecheck`, and `pnpm build`. CI runs on pull requests, pushes to `main`, and manual dispatch; the Node policy is also recorded in `.node-version`.

CodeQL runs as a separate JavaScript/TypeScript workflow on pull requests, pushes to `main`, manual dispatch, and a weekly schedule. Dependabot checks the pnpm workspace through the `npm` ecosystem and checks GitHub Actions versions weekly.

Lint, format, browser/e2e, multi-OS, multi-Node, and hard audit gates are deliberately deferred until local scripts and policies exist. The first automation surface should prove real app gates without inventing unratified standards.
