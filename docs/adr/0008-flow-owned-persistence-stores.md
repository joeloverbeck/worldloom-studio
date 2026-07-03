# Flow-owned persistence stores

Flow-specific persistence lives with the flow module that owns the behavior. A flow's store is a free-function module over `WorldFile`: exported module functions take the world file, run SQL for the flow-specific tables and reads they alone need, and compose shared core operations for records, facets, sections, drafts, typed links, atomic writes, migrations, snapshots, search, export, and status/provenance invariants.

`WorldFile` is the shared core substrate. It owns the SQLite connection, the one-transaction write boundary, world-file open/migration/snapshot behavior, shared record and link operations, and the invariants every flow must obey. It does not keep single-caller SQL merely because the SQL touches the world database. When only one flow consumes a persistence operation, that SQL belongs in that flow's store unless moving it would break a core invariant or duplicate shared behavior.

Prompt-out validates the convention first. Its prompt-template reads and version appends, prompt record-context assembly, standing-ruling reads, and advisory-disposition inserts are Prompt-out persistence. The Prompt-out module uses the world file's connection for that SQL, calls core record and link operations for advisory artifacts, skip records, explicit advisory-use links, and selected record reads, and wraps multi-statement prompt-template version appends in `WorldFile.atomicWrite`. The module's public step-lifecycle interface remains stable while its private persistence moves closer to the behavior it serves.

The naming convention is structural, not app-domain vocabulary. `store` means flow-owned persistence. `core` or `substrate` means the narrowed `WorldFile`. Within a flow-owned store module, the `WorldFile` parameter is named `world` so `store` is not overloaded. These names are implementation-structure terms, so they are not added to the app glossary or root context. The existing domain term **World file** remains the single database file that is one world's canonical store.

This ADR introduces no schema migration, new table, new record type, new vocabulary, browser redesign, route contract change, response shape change, prompt wording change, or steward-visible behavior change. It records an ownership boundary for persistence code. The heavier contradiction, propagation, QA, and neutral canon-debt store extractions follow as separate slices that copy this convention after the prompt-out slice proves it.

## Considered Options

- Keep all flow SQL on `WorldFile`. Rejected because it leaves `WorldFile` as a broad substrate interface with many single-caller methods and makes each flow's data behavior harder to understand in one place.
- Create store classes or adapters. Rejected because the current module pattern is already a free-function module over `WorldFile`; adding object lifecycle would add ceremony without deepening the boundary.
- Split every flow's store into a separate file immediately. Rejected for now. A merged module can own its SQL until size or cohesion pressure justifies a separate store file.
- Add glossary entries for store/core/world. Rejected because they are code-structure terms, not methodology or app-layer domain concepts.
- Move shared record, link, migration, and invariant behavior out of `WorldFile`. Rejected because those are exactly the core substrate responsibilities every flow composes.

## Consequences

- `WorldFile` narrows over time toward shared core behavior and invariants instead of accumulating flow-specific methods.
- A flow module may prepare SQL through `world.db` for persistence it alone owns.
- A flow module must still call core operations for shared behavior, including record creation, record reads, typed-link creation, and atomic-write spans.
- Multi-statement flow-owned writes use `WorldFile.atomicWrite`; flow stores do not open raw transactions on the connection.
- Prompt-out-specific row types and row mapping live in the Prompt-out module; shared core row types remain with `WorldFile`.
- Future flow-store slices should remove their own single-caller `WorldFile` methods without changing steward-visible behavior.

## Principles

Touches `charter.md` (P-3), `canon-sovereignty.md` (P-2, W-1, T-5), `domain-fidelity.md` (P-1, T-2), `workflow-principles.md` (W-1, W-4), `data-principles.md` (P-6, W-5, W-6, T-1, T-3, T-4), and ADRs 0001/0002/0004/0006/0007. This ADR affirms non-contradiction.

It complements ADR 0006 by letting flow policy deepen without bloating `WorldFile`. It discharges ADR 0007's consequence that `WorldFile` can shed prompt-template, prompt-generation, advisory-disposition, and advisory-link orchestration from its public flow-facing surface over time; advisory-link creation itself remains a shared core operation. It preserves P-2/W-1 because Prompt-out behavior, advisory artifact immutability, disposition vocabulary, standing rulings, skip records, and provenance links are unchanged. It preserves P-6/T-1 because the SQLite world file remains the canonical local-first store.
