# Domain Fidelity

*Altitude: constitution. Changes require an explicit steward decision.*

## P-1. The methodology is upstream and fixed

The app implements the Causal Canon Worldbuilding System 1.0 (`docs/worldbuilding-system/`) and does not amend it. The package's authority order — the five tiers of its `README.md` "Authority order" section — governs the app's domain model: doctrine (`01`, `03`) over everything, protocols (`05`–`17`) over instruments, and on any protocol/instrument conflict the protocol wins and the instrument is repaired.

- When app design uncovers a place where no faithful implementation is possible, the finding is routed as a **proposed package amendment** through the package's own change process (`00_overhaul_notes.md` is its changelog; its evidence discipline is trial-driven) — never designed around silently.
- Every spec and ticket cites the package file it implements.
- Fidelity includes the package's order of use, not only its vocabulary and record shapes. A schema-faithful record editor can still be methodology-unfaithful if it hides the reasoning order, severity path, or decision sequence the package requires.
- App content derived from the package (elaborated prompts, vocabulary seeds, export renderings) is re-checked against upstream when the package changes.
- **Evidence flows back upstream, not only amendments.** The app mechanically enforces invariants the package states as manual discipline (report immutability, routing, history notes), so field use of the app is itself evidence for the package's open questions — e.g., whether that discipline was load-bearing *because* it was manual (the naive-steward question). Such findings are logged and offered to the package's evidence cycle.

## The glossary is the naming authority — everywhere

`22_glossary.md` governs **UI strings, schema identifiers, code identifiers, and documentation** verbatim: shock cone, canon debt, truth layer, admission ledger, living record, and the rest. A handful of pervasive package terms have no glossary heading — *steward* above all — and for these, consistent package usage governs; they are package terms, not app-layer terms. No display-synonym layer exists — synonym layers are the drift mechanism the glossary itself warns about ("shadow market" for black market is its own example). Any deviation is a flagged exception requiring a recorded decision. This keeps fidelity mechanically checkable: a reviewer can grep UI strings against the glossary, and against package usage for the unheaded terms.

If a concept the app needs appears nowhere in the package — neither as a glossary entry nor in consistent package usage — it is an *app-layer* term and belongs in the root `CONTEXT.md`, which defers to the package glossary for everything the package defines.

## T-2. The label separations are schema facets, never flattened

The six concepts the package forbids blurring — **canon status, constraint tag, admission decision operation, repair operation, consequence mode, preservation boundary** — plus truth layer and the work scale, are stored as separate, separately-typed fields drawn from separately-seeded vocabulary tables, using the package's exact terms. The instruments carry roughly thirty controlled vocabularies in total — the package states no count, and the exact tally depends on counting judgments (reuses, semi-open lists), so **the schema spec owns the enumerated seed list**, each vocabulary cited to the package file that defines it. Several are deliberately open via "other" (user-extensible rows), and the package files remain the single seeded source — the lists are not restated here or anywhere else.

- Operations are **ordered multi-valued** — "record the primary operation first and the others as component moves" (`03`).
- Composition never crosses the admission/repair jurisdiction boundary (`03`, `13`) — enforced at the schema level, mechanizing what QA test P2 checks by hand.

## The line the app must hold

The package warns against "converting craft vocabulary into software-ish categories" (`20`) and against turning controlled vocabularies into programming constructs (`23`, translation rule 5). The resolution (report §8): the warning is against *replacing* craft distinctions with software abstractions. Storing the vocabularies verbatim, separately faceted, is the opposite move — it preserves the distinctions under load.

**The app may *store and check* the vocabularies; it may never *redefine, merge, or auto-assign* them.** No auto-severity, no auto-status, no inferred truth layer: classification is steward judgment (P-3), and any temptation to auto-classify is a principle violation, not a package deficiency.
