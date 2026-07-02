# TypeScript, Hono, React, and better-sqlite3 stack

Worldloom Studio uses TypeScript throughout, with a pnpm workspace split into `packages/shared`, `packages/server`, and `packages/web`.

The local native process is a Hono server running on Node via `@hono/node-server`. The browser UI is React + Vite. The canonical store is SQLite through `better-sqlite3`. Tests use Vitest in every package.

This promotes ADR 0002's React + Vite working lean to decided through ADR 0002's own named revision path, and discharges ADR 0002's owed stack ADR before implementation starts.

## Decisions

- **Language:** TypeScript for shared schema/catalog definitions, server code, tests, and UI. One language keeps the solo-maintained type surface small while still letting record kinds, vocabulary names, link types, and API payloads live once in `packages/shared`.
- **SQLite binding:** `better-sqlite3`, because its synchronous single-writer API matches the local one-process model and exposes the SQLite capabilities ADR 0001 requires: STRICT tables, triggers, FTS5, `PRAGMA user_version`, `VACUUM INTO`, WAL, and foreign-key enforcement. It satisfies ADR 0002's native-binding criterion now instead of making the first world-file layer prove feature support through a weaker abstraction.
- **Future SQLite escape hatch:** `node:sqlite` is the preferred zero-dependency successor once its API is stable and this project has verified FTS5, trigger behavior, `VACUUM INTO`, WAL, foreign-key enforcement, and migration backup ergonomics against real world files. The switch condition is feature parity for ADR 0001's guarantees, not merely availability in Node.
- **Server:** Hono with the Node adapter, because the v1 server is a small localhost JSON API plus static frontend host. It keeps routing and testing lightweight, works directly in TypeScript, and does not impose an application framework lifecycle that would become solo-maintenance drag.
- **Frontend:** React + Vite, because the UI needs generic record editing surfaces now and later flow-specific screens without adding a desktop wrapper. Vite keeps the browser shell cheap to build, and React gives enough component structure for repeated record/facet editors without deciding a larger app framework.
- **Test runner:** Vitest, so the same runner covers server HTTP seams, world-file behavior, shared type/catalog checks, and web components. This avoids maintaining separate unit and browser-era runners before the app has enough surface area to justify them.
- **Workspace:** pnpm workspace with `packages/server`, `packages/web`, and `packages/shared`. pnpm's workspace model gives deterministic local package links with low tool weight, and the package split matches ADR 0002's server/browser boundary plus the W-5 type-level single-source requirement.
- **Migration runner:** bespoke, in repo. Migrations are numbered, immutable, forward-only SQL scripts applied via `PRAGMA user_version`; each migration runs in a transaction; every open of an older world creates a pre-migration backup first with `VACUUM INTO`; and the runner must tolerate arbitrarily old world files.

## Considered options

- **`node:sqlite` immediately** — attractive because it would remove the native npm dependency, but rejected for v1 until it is stable and the project has verified the exact SQLite features ADR 0001 binds: STRICT tables, FTS5 external-content indexes, triggers, `PRAGMA user_version`, WAL, foreign keys, and `VACUUM INTO`. It remains the named successor because it would reduce decade-scale dependency risk once it satisfies those guarantees.
- **Async SQLite wrappers or ORM/migration stacks** — rejected for the first implementation slice. Worldloom needs SQLite's own integrity surface, not an ORM-shaped domain model, and ADR 0001's migration rule is specific: numbered immutable forward-only SQL, transactional application, `PRAGMA user_version`, and a `VACUUM INTO` backup before migration. A third-party migration table would add ceremony while bypassing the file's native version signal.
- **Express/Fastify instead of Hono** — viable for a small JSON API, but Hono is the smaller fit for a localhost-only server that mainly exposes typed handlers and static assets. The maintenance criterion favors the least framework surface that still has a plain Node adapter and testable request handling.
- **A heavier frontend framework or desktop wrapper from build start** — rejected by ADR 0002's scope. React + Vite is the smallest promotion of the existing lean that can support generic editors and later guided flows while keeping browser storage non-canonical and desktop packaging deferred.
- **Separate test runners per package** — rejected. The ratified seams are HTTP API behavior and world-file behavior; Vitest can exercise both against real temp files and also cover shared/web code, so multiple runners would only raise maintenance cost at this stage.

## World-file open posture

Opening a world file performs a defensive sequence:

1. Open the SQLite file with foreign keys enabled.
2. Check `PRAGMA integrity_check`.
3. Check `PRAGMA application_id` when the file is not empty.
4. Before applying any migration, create a timestamped sibling backup with `VACUUM INTO`.
5. Apply only forward migrations; unknown future schema versions are rejected plainly.

Corruption, wrong-application files, and future schema versions are reported as open failures before any migration writes occur. The server does not attempt repair without a future explicit repair flow.

## Backup cadence

The walking skeleton supports on-demand snapshots while the app is running. Automatic backups occur before every migration. Periodic background backup is deferred until real editing cadence exists; adding it must preserve the same single-file ownership story and cannot write outside a steward-approved app data directory or chosen backup path.

## Localhost exposure

The server binds to `127.0.0.1` by default. It does not bind `0.0.0.0`.

The server issues a per-process bearer token at startup. Browser API calls include the token; requests without it are rejected. This is not a multi-user auth model. It only reduces accidental access from other local processes and keeps ADR 0002's browser UI from becoming a network-exposed surface.

## Consequences

- Native dependency rebuilds are accepted for now in exchange for SQLite feature completeness.
- The schema and migrations are owned by the app, not a third-party migration table.
- Shared record catalogs live in `packages/shared`, making record kinds, vocabularies, and link types a type-level single source.
- A future desktop wrapper can reuse the same server and store layers.

## Principles

Touches `charter.md` (P-3, P-4, T-8), `canon-sovereignty.md` (P-2), `domain-fidelity.md` (P-1, T-2), `workflow-principles.md` (W-3, W-6), `data-principles.md` (P-6, W-5, W-6, T-1, T-3, T-4, T-6), and ADRs 0001-0003. This ADR affirms non-contradiction with them.
