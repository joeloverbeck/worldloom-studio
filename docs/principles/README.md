# Foundational Principles — Index

*Altitude: index. This file owns the authority order and the conformance rule; the principles themselves live in the documents below.*

These documents are the ratified foundational principles of Worldloom Studio, first iteration (2026-07-02). They were ratified from the analysis in [`archive/reports/foundational-principles-research-report.md`](../../archive/reports/foundational-principles-research-report.md) (archived after exploitation; still the citation target), which remains the full evidentiary argument — roots in package doctrine, field-trial evidence, and external research are cited there and not restated here.

## Authority order

1. **The methodology package** — `docs/worldbuilding-system/` is upstream of everything in this folder. Nothing here restates package content; these documents cite it by file. Conflicts are resolved in the package's favor or routed as package amendments (see `domain-fidelity.md`, P-1).
2. **`charter.md`** — constitution altitude. Identity, differentiator, scope. Changes require an explicit steward decision.
3. **`canon-sovereignty.md`** and **`domain-fidelity.md`** — constitution altitude.
4. **`workflow-principles.md`** and **`data-principles.md`** — architectural principles. Durable, but may evolve with field evidence from app use.
5. **ADRs** in `docs/adr/` — concrete decisions, revisable with stated cost.

## Conformance rule

Every spec, and every issue groomed to implementable (`ready-for-agent` / `ready-for-human`), carries a **"Principles" section** naming which principle documents it touches and affirming non-contradiction. Any deliberate exception is flagged to the steward before implementation. Raw triage-stage issues and quick observations do not owe this section until they are groomed — filing a note must stay cheap.

When output contradicts a principle or an ADR, surface it explicitly (the same convention as `docs/agents/domain.md`'s ADR-conflict rule): *"Contradicts canon-sovereignty.md P-2 — but worth reopening because…"*

## Methodology coverage

The living coverage ledger is [`../methodology-coverage.md`](../methodology-coverage.md). It records which `docs/worldbuilding-system/` chapters have guided flows, sweep-only coverage, schema-only T-8 coverage, or explicit UI non-goals, and it is updated when a flow ships or a deferral changes.

## Principle identifiers

The report's identifiers are formal as of this ratification. Principles are cited as `<document> <ID>` (e.g., "canon-sovereignty.md P-2"). New principles take the next free number in whichever series fits (P = product, W = workflow, T = technical); retired numbers are never reused.

| ID | Principle | Document |
|---|---|---|
| P-1 | The methodology is upstream and fixed | `domain-fidelity.md` |
| P-2 | User sovereignty over canon is structural, not advisory | `canon-sovereignty.md` |
| P-3 | The app is the mechanized continuity clerk | `charter.md` (identity), `workflow-principles.md` (division of labor) |
| P-4 | Continuity-and-causality is the differentiator; the wiki is the anti-model | `charter.md` |
| P-5 | Regimented flows, with an ungated margin | `workflow-principles.md` |
| P-6 | Local-first; the data outlives the app | `data-principles.md` |
| W-1 | Prompt-out at every dependency-bearing step; paste-in is advisory | `canon-sovereignty.md` (boundary), `workflow-principles.md` (step mapping) |
| W-2 | Severity scaling is the app's core conditional dimension | `workflow-principles.md` |
| W-3 | Sweeps propose; only admission admits | `workflow-principles.md` (invariant), `data-principles.md` (status machine) |
| W-4 | Skips are first-class records | `workflow-principles.md` |
| W-5 | Record once, view anywhere | `data-principles.md` |
| W-6 | The record lifecycle is the data model | `data-principles.md` |
| W-7 | Gates demand substance, not clicks | `workflow-principles.md` |
| T-1 | SQLite, one file per world, is the canonical store | `docs/adr/0001` (decision), `data-principles.md` (invariants) |
| T-2 | The label separations are schema facets, never flattened | `domain-fidelity.md` |
| T-3 | Identifiers are the app's job; content is never a key | `data-principles.md` |
| T-4 | Prose fidelity first; structure only where the package structures | `data-principles.md` |
| T-5 | Provenance is captured at authorship time, per record | `canon-sovereignty.md` (advisory record), `data-principles.md` (mechanism) |
| T-6 | The branch/collaboration door: open in the schema, closed in the UI | `data-principles.md`, `docs/adr/0003` |
| T-7 | Web UI served by a local native process; browser storage never canonical | `docs/adr/0002` |
| T-8 | Honest coverage flows into scope | `charter.md` |

## What is deliberately not in this folder

Specs, schema files, prompt texts, UI designs — those are downstream artifacts checked *against* this folder. And no package content: `docs/worldbuilding-system/` remains the single source of domain truth.
