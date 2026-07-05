# Charter

*Altitude: constitution — the most durable document in this folder. Changes require an explicit steward decision.*

## Mission

Worldloom Studio is a web app to create and maintain fictional worlds from a continuity and causality perspective. It implements the Causal Canon Worldbuilding System (`docs/worldbuilding-system/`, version 1.1) for a single steward on their own machine.

**The app replaces the package files in normal use.** A steward works the entire method in the browser with `docs/worldbuilding-system/` closed: every decision point carries the method instruction it needs, self-contained and app-owned. Package file paths may appear as provenance and audit detail; they are never the steward's operating instructions (`guided-workflow-usability.md` W-9).

## Identity (P-3): the mechanized continuity clerk

The division of labor is fixed: **the steward judges; the app remembers, routes, and checks.** Everything the field trials showed humans doing badly under load is the app's job — identifier minting, cross-reference integrity, ledger bookkeeping, status tracking, master-record/digest discipline, "what is canon today?" views, canon-debt and skip ledgers. Everything the package reserves to human judgment — truth layer, canon status, constraint tags, decision operations, preservation boundaries, final wording — the app must never compute, default, or infer.

Continuity governance of this kind exists in industry only as salaried roles (Lucasfilm's Holocron keeper, Blizzard's historians, CD Projekt's Lore Master) and in fandom only as human-enforced policy. No consumer tool distinguishes a fact *proposed* from a fact *admitted*. Worldloom mechanizes the clerk so a solo steward gets what only franchises could previously afford.

## Differentiator and anti-model (P-4)

Every surveyed worldbuilding tool models a world as linked articles — presentational structure with no semantics, and documented failure modes (bibles drifting from the work, orphaned pages, the tool becoming its own project). Worldloom models a world as `02_world_model.md` describes it: a **dependency graph of typed facts** whose admission is gated (`06`), whose consequences are propagated (`07`), and whose conflicts are governed (`13`).

Features earn their place by serving consequence and governance, not by accumulating modules. The package's anti-automation rule — do not fill every template for every fact — applies to the app's feature surface as much as to its prompts.

## v1 scope

- **Single steward.** No accounts, no auth, no hosted service, no multi-steward mechanics.
- **Main continuity only.** Branching remains method-level doctrine; the schema keeps the door open (T-6, ADR 0003), the UI builds none of it.
- **Local-first.** The world is a visible file on the steward's disk (P-6).
- **Strictly prompt-out/paste-in.** The app never calls LLM APIs, holds no API keys, and has no vendor coupling. The steward copies generated prompts out and pastes responses back (see `canon-sovereignty.md`).
- **QA is in scope.** The per-test scorecard, repair loop, and canon-debt gating (`18`) are part of what v1 *is* — both field trials treat QA as what makes a world stable, and the skip/debt ledgers (W-4) exist to be read by it. Build order may sequence it last; scope includes it.

## Non-goals and doors

- **LLM API integration is out of v1, but not ruled out forever.** The inviolable principle is sovereignty (P-2), which is transport-independent. Any future bring-your-own-key convenience layer is an ADR-level decision, off by default, and can never bypass the advisory store or the admission gate.
- **Multi-steward collaboration and branching UI** — future possibilities behind the schema door, nothing more.
- **A wiki, an encyclopedia skin, a module bazaar** — never. That is the anti-model.

## Evidence-led scope (T-8)

The package's coverage statement (`00_overhaul_notes.md`) names its field-tested surfaces and its honestly untested ones (`10`, `11`, `14`, `15`, `16`, `17`; `19`/`20` under a naive steward). The app's build order follows the evidence: v1 flows implement the field-tested pipeline end-to-end; untested protocols are covered at the *schema* level with generic record-editing surfaces, until use generates the evidence to design guided flows well. Specs that touch an untested surface flag it, carrying the report's flagging convention forward.
