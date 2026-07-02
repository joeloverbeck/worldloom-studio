# Data Principles

*Altitude: architectural principles. Durable, but may evolve with field evidence from app use. Deliberately engine-agnostic — the engine choice lives in `docs/adr/0001-sqlite-file-per-world.md` so these principles survive even if that ADR is revisited.*

## P-6. Local-first; the data outlives the app

One world = one visible database file at a steward-chosen path, copyable, backed up by copying, readable in decades. Browser-private storage (OPFS/IndexedDB) is never the canonical store. Export to markdown — rendering records into the package's own instrument forms — is a first-class ownership guarantee, but **export is a view; the database is the record**.

## W-5. Record once, view anywhere

One canonical record; every other surface renders a live digest or link. The propagation report is the master record of the shock cone; the fact card's shock-cone summary is a digest of or pointer to it; capability and fact cards divide labor and cross-reference rather than duplicate. The file-versus-record mismatch dissolves: **the record is the unit; files exist only at export.**

## W-6. The record lifecycle is the data model

`03`'s two mutation regimes are enforced at the storage layer:

- **Living cards** state the present tense and are updated in place; every supersession automatically writes a history entry carrying the outgoing wording verbatim, its retirement status, a sequence marker, and a link to the retiring report.
- **Reports and ledgers** are the audit trail and are append-only — never edited; a correction is a new record.

History is owed to outgoing wording only; additive amendments carry none (`03`, `19`). The two query modes the package names are the app's two primary read surfaces: *what is canon today?* (the live cards) and *how did canon get here?* (the reports in order). The W-3 status machine — 11 canon statuses, sweeps propose / admission admits, jurisdiction-bounded operations — is enforced here, not in UI convention.

## T-3. Identifiers are the app's job; content is never a key

The package defines no ID scheme; both trials show stewards hand-minting IDs and hand-maintaining pointers that dangled. The app mints stable surrogate identifiers and global sequence/timestamps for every record. Fact statements and titles are mutable display fields — they are *expected* to be reworded in place. Cross-references are **typed link records with enforced referential integrity**, link types seeded from the templates catalog's edge map (retired-by, digest-of, promoted-to, constrains, opposes, decomposes, …). Human-facing short IDs may be generated for citation in prose and export.

## T-4. Prose fidelity first; structure only where the package structures

Roughly 80% of template fields are open prose under fixed headings, and the templates declare themselves human reasoning instruments, not schemas. Therefore: prose sections are stored as prose (sectioned, searchable, exportable); typed columns are reserved for the controlled vocabularies and lifecycle fields; the app does not invent structure the package lacks (the five-facet working scope stays a prose bundle; a timeline event's up-to-seven date facets at variable granularity are never collapsed into one timestamp). Form sections are optional and collapsible; "leave fields empty if they do not apply" (`21`) is respected.

## T-5. Provenance mechanism

Actors, activities (flow-step executions), advisory artifacts, and derivation links — PROV-shaped, informally. Every record and mutation carries who, when, and in which flow step; v1 has exactly one steward, but the actor field exists. The advisory-record doctrine lives in `canon-sovereignty.md`.

## T-6. The branch and collaboration door: open in the schema, closed in the UI

Every fact carries a continuity scope with the single default "main continuity"; the `15` record types and vocabularies exist in the schema; provenance already records an actor per decision. v1 builds no branching UI and no multi-steward mechanics. Details in `docs/adr/0003-branch-and-collaboration-schema-door.md`. **[untested surface `15` — schema-level only, per charter T-8]**

## Lifecycle behaviors any engine must support

The field trials exercised these; they are requirements, not options (report §5.1/§5.3):

- supersession chains of arbitrary depth with genealogical links between repairs;
- ledger-row → card **promotion** preserving identity, leaving a tombstone pointer on the row;
- status transitions across the 11-status machine;
- ledger batches appended from any context (the universal admission queue, W-3);
- canon-debt and skip records with open/closed state (W-4);
- append-only enforcement for the report regime, automatic history writes for the card regime (W-6);
- full-text search over prose combined with structured facet filters;
- whole-world backup as a single-file copy; faithful markdown export of every record type.
