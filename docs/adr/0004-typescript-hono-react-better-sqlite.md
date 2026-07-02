# TypeScript, Hono, React, and better-sqlite3 stack

Worldloom Studio uses TypeScript throughout, with a pnpm workspace split into `packages/shared`, `packages/server`, and `packages/web`.

The local native process is a Hono server running on Node via `@hono/node-server`. The browser UI is React + Vite. The canonical store is SQLite through `better-sqlite3`. Tests use Vitest in every package.

This promotes ADR 0002's React + Vite working lean to decided, and discharges ADR 0002's owed stack ADR before implementation starts.

## Decisions

- **Language:** TypeScript for shared schema/catalog definitions, server code, tests, and UI.
- **SQLite binding:** `better-sqlite3`, because its synchronous single-writer API matches the local one-process model and exposes the SQLite capabilities ADR 0001 requires: STRICT tables, triggers, FTS5, `PRAGMA user_version`, `VACUUM INTO`, WAL, and foreign-key enforcement.
- **Future SQLite escape hatch:** `node:sqlite` is the preferred zero-dependency successor once its API, FTS5 behavior, and backup ergonomics are stable enough for this app's file-longevity guarantees.
- **Server:** Hono with the Node adapter, because the v1 server is a small localhost JSON API plus static frontend host.
- **Frontend:** React + Vite, because the UI needs generic record editing surfaces now and later flow-specific screens without adding a desktop wrapper.
- **Test runner:** Vitest, so the same runner covers server, world-file, shared, and web seams.
- **Migration runner:** bespoke, in repo. Migrations are numbered, immutable, forward-only SQL scripts applied via `PRAGMA user_version`; each migration runs in a transaction and every open of an older world creates a pre-migration backup first.

## World-file open posture

Opening a world file performs a defensive sequence:

1. Open the SQLite file with foreign keys enabled.
2. Check `PRAGMA integrity_check`.
3. Check `PRAGMA application_id` when the file is not empty.
4. Before applying any migration, create a timestamped sibling backup with `VACUUM INTO`.
5. Apply only forward migrations; unknown future schema versions are rejected plainly.

Corruption, wrong-application files, and future schema versions are reported as open failures. The server does not attempt repair without a future explicit repair flow.

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
