# Localhost native process serving a browser UI

The app runs as a local native process — a localhost server with native SQLite — serving a web UI the steward opens in their own browser. Browser-private storage (OPFS/IndexedDB, wasm-SQLite) is never the canonical store: it fails data-location transparency (P-6) and its documented failure modes include un-synced work lost when browser data is cleared (LegendKeeper's own changelog; report §10). This keeps the world a visible file, with native performance and integrity.

**Language: TypeScript** (decided — the steward's implementation language). **Frontend: React + Vite is the working lean, not yet decided.** The remaining stack choices (server framework, SQLite binding, migration tooling, test setup) are owed a dedicated stack ADR before the first implementation ticket; the selection criteria there: quality of the native SQLite binding (STRICT/FTS5/trigger support), migration ergonomics, and decade-scale maintenance burden for a solo steward.

## Considered options

- **Desktop wrapper from day one** — deferred. Adds a packaging toolchain and update story to v1 for no capability gain, and the storage layer is identical either way. If ever wrapped: Tauri-class, not Electron-class, on footprint grounds. A wasm-SQLite browser edition remains a known escape hatch (Logseq's DB version demonstrates one schema serving both).
- **Browser-canonical storage** — rejected, as above.

## Consequences

- v1 UX is "start the process, open the browser" — acceptable for the single steward on WSL2, where a Linux desktop wrapper would be more awkward than a browser tab, not less.
- The server/browser split means the UI must treat the local server as the single writer; no state of record lives in the browser.
