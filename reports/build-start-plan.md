# Build-Start Plan — Worldloom Studio

*Written 2026-07-02, from the grilling session that followed `reports/principles-third-iteration-outlook.md`'s build-readiness verdict. Baseline: the iteration-3 ratification commit (`3a41567`). Decisions marked **ratified** were confirmed by the steward in-session; decisions marked **PROVISIONAL** were applied per the session's recommended answers after the steward went AFK, and are open to veto — vetoing one reshapes only its own step, not the sequence.*

## Verdict this plan executes

Per the outlook §1: spec-writing can start now; implementation is blocked only on the stack ADR that ADR 0002 owes. The sequence below discharges that precondition first, then walks the evidence-ordered pipeline.

## Ratified decisions

1. **Ratify before building.** The iteration-3 edits were committed (`3a41567`) before any build-start artifact, so every downstream artifact cites a fixed principles baseline. *(Done.)*
2. **Sequence: stack ADR → schema spec.** ADR 0004 is small and unblocks implementation; the schema spec is the first real spec and owns the outlook §5.3 decisions.
3. **Stack picks decided in-session** (not via research brief) — ADR 0002 §criteria plus outlook §5.2 already consolidate the selection criteria. The concrete picks are the PROVISIONAL block below.
4. **Deliverable of the session is this plan doc.**

## PROVISIONAL decisions (open to veto)

| # | Decision | Pick | Rationale |
|---|---|---|---|
| 5 | SQLite binding | **better-sqlite3** | Synchronous single-writer API (matches ADR 0002's no-pooling model); bundles current SQLite with FTS5; `.backup()`, triggers, STRICT, `PRAGMA user_version` all exercisable — every binding item in ADR 0001. Cost: native rebuilds on Node major bumps. ADR 0004 should name `node:sqlite` as the zero-dependency successor once it stabilizes and its FTS5 support is verified; the APIs are close enough that migration is cheap. |
| 6 | Server framework | **Hono + @hono/node-server** | TypeScript-first, zero runtime dependencies — the decade-scale solo-maintenance criterion. The server's needs are modest: JSON API plus serving the built frontend to localhost. |
| 7 | Migration tooling | **Bespoke in-repo runner** | ADR 0001 mandates numbered, immutable, forward-only scripts via `PRAGMA user_version`, each transactional, with `VACUUM INTO` pre-backup. Mainstream tools (Drizzle/Knex/Atlas) keep their own migration tables and don't honor `user_version`; adopting one would force an ADR 0001 amendment. The runner is ~100 lines and is itself W-6 enforcement surface. |
| 8 | Test setup | **Vitest** | One test runner for server and web (couples to Vite); schema behavior tests (append-only triggers, history writes, jurisdiction CHECKs) run against real temp-file SQLite databases, per outlook §5.2's "those triggers *are* W-3/W-6 enforcement." |
| 9 | Repo layout | **pnpm workspace: `packages/server`, `packages/web`, `packages/shared`** | Shared record types in one source package serves W-5 (record once, view anywhere) at the type level. |
| 10 | Frontend | **Ratify React + Vite in ADR 0004** | Promotes ADR 0002's working lean to decided; the test-setup pick already couples to Vite. |
| 11 | Spec home | **`docs/specs/`** *(steward correction: these are durable specifications, not local PRDs or ticket queues)* | Every spec carries the conformance rule's "Principles" section (`docs/principles/README.md`). |
| 12 | W-4 scoping | **Accept as edited; no revert** | Outlook §3.4 offers a revert if the stricter form was deliberate hardening; the evidence (no ratified exception flag anywhere, which domain-fidelity would require) says drift. |
| 13 | Conformance tightening | **Not adopted** | Principle-ID citations stay optional, per the outlook's own default: no process hardening without a felt failure. |

## The sequence

### Step 0 — Ratification commit ✅

Done (`3a41567`). The `.claude/skills/research-brief` working-tree edits predate the pass and were left uncommitted.

### Step 1 — ADR 0004: the stack

`docs/adr/0004-*.md`, recording picks 5–10 above with ADR 0002's criteria. Per outlook §5.2, the same ADR should also settle the engineering posture questions iteration 1 was never asked: corruption/error handling on world-file open, backup cadence automation, and the localhost server's binding/exposure posture (bind `127.0.0.1` only; decide whether a port lock or token guards against other local processes).

### Step 2 — The schema spec

`docs/specs/` — the first spec, with a Principles section. It owns, explicitly (outlook §5.3, so nothing is guessed silently):

1. **Vocabulary seed appendix** — every controlled vocabulary enumerated, each cited to its defining package file; the §5.1 divergences seeded per the outlook's interim rules (fact-type from the fact card's own list; ledger columns govern the "five items"; constraint tags from `03` with `22`'s extras as pre-seeded "other" rows; contradiction types from the report template's 10).
2. **Record-type enumeration** — wider than the 19 templates: gate results, pass reports, ledger rows, seed decompositions, QA scorecards; each assigned its mutation regime per W-6 post-edit.
3. **ID semantics** — surrogate keys app-minted and content-free (T-3); per-world scoping; human-facing short IDs namespace-hygienic (the T-1/T1 collision from trial 2); hierarchical derivation imitable for display but never load-bearing.
4. **Record:fact cardinality** — 1:N is normal; typed links get covers/bundles types.
5. **Kernel regime** — assign the kernel a mutation regime (natural reading: card regime, history on outgoing wording).
6. **Typed-link enumeration** — the app-side synthesis T-3 post-edit assigns here, each link type cited to the instrument that names the relationship.

### Step 3 — Walking skeleton (first implementation tickets)

After ADR 0004 exists: workspace scaffold; world-file create/open with the migration runner and schema v1 (STRICT, WAL, `application_id`, seeded vocabularies, triggers); the "recently opened worlds" registry (ADR 0001 consequence); generic record-editing surfaces over all record types — which is also how the untested protocols (`10`, `11`, `14`–`17`) get their T-8 schema-level coverage from day one; FTS5 search. Tickets go through the issue tracker and carry Principles sections once groomed.

### Step 4 — Flow specs in evidence order (T-8)

One spec per flow, each deciding its own prompt-context assembly (W-1) and doctrine-surfacing derivations (P-5), in the field-tested pipeline's order: creation (`05`) → admission (`06`) → propagation (`07`) → contradiction/retcon/mystery (`13`) → QA (`18`). QA is sequenced last but is v1 scope (charter). Draft space, admission queue, and prompt-out/advisory-artifact plumbing enter with the first flow that needs them (creation/admission).

## Standing cautions carried forward

- Trial artifacts are **evidence, not conformance examples**; importing them is not a v1 goal (outlook §3.4).
- Five of eleven canon statuses have zero field exposure; flows routing through them operate on doctrine alone — flag per T-8's convention.
- The archive-§6 horizon: once the first flow specs exist, revisit whether a maintained flows overview should retire archive §6 to pure evidence (outlook §5.4).
- Package amendments in outlook §5.1 are flagged, not performed; the schema spec's vocabulary appendix records the divergences and the interim seeding choices.
