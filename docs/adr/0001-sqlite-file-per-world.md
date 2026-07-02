# SQLite, one database file per world

The canonical store for a world is a single SQLite database file at a steward-chosen path. This is the engine decision behind `docs/principles/data-principles.md` (T-1); the full argument is report §5 (`reports/foundational-principles-research-report.md`).

SQLite is the only candidate with an institutional longevity story (Library of Congress recommended format; format stability pledged through 2050) — the property a decades-lived personal creative archive needs most — and the decade-lived personal-database precedents (Anki, Zotero, Calibre, Actual Budget) all converged on this shape. One file *per world* (rather than one app database for all worlds) makes the world the unit of ownership: share, archive, or retire a world by copying a file; a corrupted file or botched migration costs one world, not the archive. Worlds are genuinely independent — no cross-world references exist in the package's record types — so a shared database buys nothing. Local precedent: the steward's story-creation repo uses one database file per story and it has worked well.

## Configuration (binding on the schema spec)

- STRICT tables; `PRAGMA foreign_keys=ON` per connection; NOT NULL keys; WAL mode; `application_id` set.
- The 29 controlled vocabularies seeded into vocabulary tables from the package files (user-extensible rows where the package says "other"); ordered multi-valued operations as position-indexed rows; the admission/repair jurisdiction boundary enforced by CHECK/trigger.
- Prose sections stored as prose (sections table or JSONB); FTS5 external-content index, trigger-synced, per-column weighting so names/titles outrank body prose.
- A first-class typed link table with FK integrity; recursive CTEs for supersession chains and dependency paths. If graph queries ever outgrow SQL, build an in-memory graph projection in the app layer (Calibre's pattern) — never a second persistent engine.
- `BEFORE UPDATE`/`BEFORE DELETE` triggers raise on report-regime tables; card mutations automatically write history rows.
- Promotion as identity-preserving upgrade: record persists, record-kind and owed-instrument set change, the ledger row gains a tombstone link.
- Migrations via `PRAGMA user_version`: numbered, immutable, forward-only scripts, each in a transaction, with a pre-migration `VACUUM INTO` backup. Each world file carries its own schema version and migrates on open.
- Snapshots via online `.backup`/`VACUUM INTO`; markdown export renders records into the package's instrument forms.

## Considered options

- **Document stores (PouchDB/RxDB/LiteDB)** — trade away enforced referential integrity (the property the trials' dangling-pointer evidence shows this data most needs) to buy replication v1 doesn't want; RxDB's production tier is open-core paid.
- **Embedded graph stores (Kùzu, Cozo, SurrealDB)** — acute abandonment/licensing risk, solving a traversal problem that doesn't exist at 10³–10⁴ rows.
- **DuckDB** — OLAP engine by its own positioning. **LMDB/KV** — every requirement becomes bespoke application code.
- **One app database for all worlds** — slightly simpler app code, muddier ownership story; rejected for the reasons above.

## Consequences

- The app needs a small "recently opened worlds" registry (app-level config, not a database).
- Migration code must tolerate meeting arbitrarily old world files.
- Any future cross-world feature (shared vocabulary extensions, steward-level settings) needs an explicitly designed home — none exists by default.
