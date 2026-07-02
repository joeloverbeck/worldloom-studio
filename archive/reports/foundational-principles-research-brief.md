# Research Brief — Foundational Principles of the Worldloom Studio App

You are a Claude Code session with direct read/write access to the working tree of the
`worldloom-studio` repository. You read files with your own tools; you fetch nothing and
upload nothing. This brief is your complete commission — the requirements interview has
already happened, and its outcomes are locked in §3.

## 1. Context

`worldloom-studio` is (per its root `README.md`) "a web app to create and maintain fictional
worlds from a continuity and causality perspective." Today the repository contains **no
application code** — no `src/`, no `package.json`. Its entire substance is the **Causal Canon
Worldbuilding System, version 1.0**, at `docs/worldbuilding-system/` (58 files): a storage-
and software-agnostic *methodology* for building worlds whose canon facts propagate through
the world instead of sitting as isolated lore. Version 1.0 was validated by two cold-start
end-to-end field trials (logs and full artifact sets live under `reports/`).

The repository now pivots from authoring the methodology to designing the app that
implements it. This pass commissions the **foundational principles** of that app: the
recommendations that will later be ratified into a `docs/` folder against which every future
spec and ticket must align, so the implementation never strays.

This brief was authored against commit `b317f2a6298a8df61afa65f438f24564e6f94edf` (clean
working tree). When you start, run `git rev-parse HEAD`; work from the **live working
tree**, and if HEAD has moved past the authored-against commit, note the divergence in your
deliverable. The pin exists for provenance, not for fetching.

This is a cold start for the *app* line — no predecessor brief exists on it. The
worldbuilding-system's own iteration lineage is recorded in
`docs/worldbuilding-system/00_overhaul_notes.md`; treat it as background provenance, not as
a delta seed for this task.

## 2. Read in full (authority order)

Read these before producing anything. Order follows the package's own declared authority
order (its `README.md` §"Authority order": `01`/`03` govern; `02`/`04` supply primitives;
`05`–`17` are protocols; `18`–`23` are quality control and reference; `checklists/` and
`templates/` operationalize the protocols).

**Tier 0 — repo identity and package index:**

- `README.md` — the repo's two-line purpose statement; the app's one-sentence mission.
- `docs/worldbuilding-system/README.md` — the package map, authority order, recommended-use
  paths (new world / existing world / single idea / contradiction / transmedia), and the six
  concepts that must never be blurred. This file is the skeleton your app-workflow analysis
  hangs on.

**Tier 1 — the entire worldbuilding-system package.** The user's instruction is explicit:
read *all* of `docs/worldbuilding-system/**` (58 files), including every file under
`checklists/` and `templates/`. Read them in the package's authority order. Within the
sweep, these carry the most weight for *this* target:

- `01_core_theory.md` — the 12 operating laws and the Causal Canon cycle; the philosophical
  ground every app principle must trace back to.
- `03_truth_layers_and_canon_governance.md` — truth layers, canon statuses, constraint tags,
  admission decision operations, repair operations, governance roles. **This is the core
  vocabulary a database schema must represent faithfully.**
- `06_canon_fact_admission_protocol.md` and `07_propagation_engine.md` — the fact gate,
  severity levels, and shock-cone propagation: the central workflow the app's step
  sequence will mirror.
- `20_ai_assisted_workflow.md` — AI as proposer/auditor/challenger, **never canon
  authority**; ten named analyst roles, each with a ready prompt; the step-by-step
  human-decides workflow; the AI failure-mode checklist. This file is the closest thing the
  package has to a spec for the app's LLM-prompt-producing steps — the app's prompt
  generation should be understood as *operationalizing this file*.
- `15_branching_versioning_and_collaboration.md` — branches, merges, supersession,
  human approval. Out of v1 product scope (§3), but its record semantics inform whether the
  schema keeps a door open.
- `21_templates_index.md` — how every instrument composes; the map from protocol to record.
- `22_glossary.md` — the authoritative vocabulary; your report must use these terms, not
  synonyms.
- `operating_card.md` — the one-page condensed path; a model for what a "regimented" UI
  flow looks like.
- `00_overhaul_notes.md` — 1.0 provenance, the coverage statement of record (which surfaces
  are field-tested and which are honestly untested).
- `templates/*` and `checklists/*` (all of them) — the record shapes (kernel, fact card,
  capability card, admission ledger, propagation report, contradiction report, mystery
  ledger entry, change proposal, sweeps, gates). **These are the ground truth for the data
  model**: whatever storage you recommend must be able to represent every one of these
  records and their lifecycle (supersession chains, promotions from ledger row to card,
  cross-references) without loss.

**Evidence tier — the system in real use:**

- `reports/eighth-iteration-field-trial.md` — first cold-start field trial (world:
  Saltmarrow); frictions, skips, and unanswered questions from a real build.
- `reports/ninth-iteration-field-trial.md` — second trial (world: Carillon); validates the
  full pipeline, the admission ledger, the supersession chain two repairs deep. The
  friction/skip ledgers in both logs are a map of exactly where an app can remove toil.
- Browse `reports/field-trial-world/` and `reports/field-trial-world-2/` — the complete
  artifact sets those trials produced (filled kernels, cards, ledgers, propagation reports,
  contradiction reports, pass reports). Real instances of everything the database must
  store. You need not read every file exhaustively; read enough of each artifact *type* to
  ground the schema recommendation in real shapes, and say which you sampled.

**Boundary-awareness (read to bound scope, not conformance targets):**

- `docs/agents/domain.md`, `docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md` —
  this repo's engineering-process conventions (lazy `CONTEXT-MAP.md`/`CONTEXT.md` creation,
  GitHub-Issues tracking, label vocabulary). Your report should not conflict with them, but
  they are not inputs to the foundational principles.

## 3. Settled intentions

These decisions are final. Do not re-open them; do not present them as open questions in
the report. Items marked `assumption:` were adopted when the user was unavailable at
interview time — treat them as committed defaults the user may later override, and restate
them in a clearly labeled "Assumptions adopted" section of the report so they are easy to
find and reverse.

1. **The methodology is upstream and fixed.** The app implements the Causal Canon
   Worldbuilding System 1.0; it does not amend it. If you find a genuine impossibility —
   a place where no app design can honor a package requirement — flag it in the report as
   a *proposed package amendment routed through the package's own change process*; never
   design against the package silently.
2. **Prompt-out, human-in workflow.** Every distinct step of the app (each step whose
   output later steps depend on) produces a **prompt the user may feed to any external LLM
   of their choice**. The LLM's response is advisory material. The prior implementation of
   this app failed because Claude Code skills created the world and wrote canon directly;
   that architecture is rejected.
3. **User sovereignty over canon — structural, not advisory.** The user writes or explicitly
   approves every final word that enters the world. In the prior app, AI-decided content the
   user disagreed with was painful to remove and, when left in, cascaded through every
   subsequent canon fact. The foundational principles must make AI-authored canon
   **impossible by construction** (there must be no code path by which generated text
   becomes canon without deliberate user admission), operationalizing what
   `20_ai_assisted_workflow.md` already states as doctrine: AI is never canon authority.
4. **It is a web app.** The prior app had no UI; this one exists to provide a clean,
   attractive, **regimented** way of creating and maintaining worlds — the package's
   protocols and severity-scaled paths becoming guided flows rather than files the user
   hand-edits.
5. **Structured storage, not markdown files.** The prior app stored world state as
   markdown; the user calls this a terrible idea and rejects it. The world lives in a
   database. SQLite is the user's leading candidate; the final recommendation is yours to
   make from research, and you are invited to suggest alternatives or hybrids — but "world
   state as a folder of markdown" is off the table. (Export *to* markdown or other formats
   is a separate, legitimate concern.)
6. `assumption:` **Local-first, single-steward deployment.** The app runs on the user's
   machine for one steward; no accounts, no auth, no hosted service in v1. Multi-steward
   collaboration and the mechanisms of `15` remain method-level doctrine, out of v1 app
   scope (schema-level door-keeping is permitted and worth a recommendation).
7. `assumption:` **Strictly prompt-out/paste-in.** The app never calls LLM APIs, holds no
   API keys, and has no vendor coupling. The user copies a generated prompt out, runs it
   wherever they choose, and brings the result back. If your research surfaces a strong
   case for an optional bring-your-own-key convenience layer, you may note it as a
   flagged future possibility — but the foundational principles must stand entirely
   without it.
8. `assumption:` **Deliverable is the report only, left uncommitted.** You write one new
   report (§7); you do not author the future `docs/` principles folder, you do not touch
   `docs/worldbuilding-system/`, and you do not commit.

## 4. The task

This is a **foundational** pass: derive and recommend the foundational principles of the
Worldloom Studio app from the worldbuilding system it implements. Produce a research-backed
recommendations report that (a) states the candidate principles — product, workflow, and
technical — each traced to the package doctrine or prior-app failure it answers; (b)
recommends the storage/data-model foundation; (c) proposes the structure of the future
`docs/` principles folder (each document named, its altitude and ownership stated) that
every future spec and ticket will align against; and (d) grounds contestable choices in
deep research — similar implementations, research papers, prior art — with citations.

## 5. Exploration + online-research mandate

Explore the repository as deeply as needed beyond the files listed above. Research online
as deeply as you consider beneficial — this is explicitly commissioned as deep research.
Directions worth pursuing (not an exhaustive list, and none mandatory if a better thread
appears):

- **Similar implementations**: worldbuilding and campaign-management tools (e.g. World
  Anvil, LegendKeeper, Kanka, Campfire, Obsidian-based worldbuilding stacks, wiki-based
  canon management), and how they model entities, relations, and canon; where they fail at
  continuity/causality, which is this app's differentiator.
- **Canon/continuity management prior art**: how writing rooms, game studios, and
  transmedia franchises manage bibles and continuity databases.
- **Research literature**: narrative consistency checking, knowledge graphs for fiction,
  human-in-the-loop AI authoring tools, provenance tracking, mixed-initiative creative
  interfaces.
- **Storage**: SQLite versus embedded document stores versus embedded graph stores for a
  local-first single-user app whose records are semi-structured, heavily cross-referenced,
  lifecycle-bearing (supersession, promotion), and must support audit trails; schema
  versioning/migration practice for long-lived personal databases; full-text search over
  world content; export/backup formats.
- **Local-first web-app architecture**: proven patterns for a single-user web UI over a
  local database.

Cite sources for any external claim that shapes a recommendation.

## 6. Doctrine & constraints

- **The package's authority order governs.** Within `docs/worldbuilding-system/`: `01` and
  `03` govern everything below; protocols govern instruments; on conflict the higher tier
  wins. Your recommended principles must be *derivable from* — and must never contradict —
  `01`, `03`, and `20`. Where a principle is motivated by the prior app's failure rather
  than package doctrine, say so explicitly; both are legitimate roots, but the report must
  keep them distinct.
- **The six-concept separation is load-bearing.** Canon status, constraint tag, admission
  decision operation, repair operation, consequence mode, preservation boundary — the
  package forbids blurring them, and `20`'s failure-mode checklist specifically warns
  against "converting craft vocabulary into software-ish categories." Any schema or UI
  vocabulary you recommend must preserve these distinctions rather than flattening them
  into generic CRUD concepts.
- **Use the glossary's vocabulary** (`22_glossary.md`) for every domain concept the report
  names; do not drift to synonyms.
- **The package stays untouched.** You may not edit anything under
  `docs/worldbuilding-system/`. Findings that would require package changes are flagged
  forward in the report, not applied.
- **Honest coverage.** `00_overhaul_notes.md` and the package README state which surfaces
  are field-tested and which are honestly untested (spatial `10`, agent `11`, uncertainty
  `14`, extraction `16`, aesthetic `17`, branching `15` among them). Where a foundational
  principle leans on an untested surface, note that its evidence base is thinner.
- **Greenfield engineering.** The repo establishes no tech stack, test regime, or coding
  standards yet — do not invent constraints from habit; let §5's research carry the
  rationale for every technical recommendation.

## 7. Deliverable specification

One file, **new**: `reports/foundational-principles-research-report.md`.

This is an **analysis / recommendation report, not a ratified artifact**. The user will
read it, correct it, and only then will its content be authored into a `docs/` principles
folder in a later pass. For every recommendation, deliver **substance + home, not ratified
text**: what the principle or decision *is* (your own prose, at foundational altitude —
durable, implementation-guiding, not spec-level detail) and *which future document* in the
proposed `docs/` folder should own it. Do not write the future documents themselves, and
do not invent formal identifiers (principle numbers may be provisional and labeled as
such).

The report must contain, in whatever structure serves it best:

1. an executive summary;
2. an **"Assumptions adopted"** section restating §3's `assumption:` items (deployment
   model, strict prompt-out/paste-in, report-only scope) so the user can reverse any of
   them cheaply;
3. the recommended **foundational principles**, each traced to its root (package doctrine
   file, prior-app failure, or research finding);
4. the **storage and data-model recommendation**, grounded in the actual record shapes in
   `templates/`, the lifecycle behaviors the field trials exercised (supersession chains,
   ledger-row promotion, cross-references, audit trails), and cited research;
5. the **workflow architecture recommendation**: how the package's paths (new world /
   single idea / contradiction repair / QA) become regimented app flows, and where in each
   flow the prompt-out/paste-in step sits, honoring `20`'s human-decides sequence;
6. the **proposed structure of the future `docs/` principles folder** — each document
   named, its altitude and ownership stated, and how specs/tickets will be checked against
   it;
7. a **research appendix** with sources cited for every external claim that shaped a
   decision;
8. **open questions for the user** — genuinely user-owned decisions you identified but
   could not settle from doctrine or research (this is the one place questions belong;
   never block on them).

Write the file; leave the working tree **uncommitted**. Touch nothing outside
`reports/foundational-principles-research-report.md`.

Produce the deliverable directly. Do not interview, do not ask clarifying questions — the
requirements above are final. If a genuine contradiction makes a requirement impossible,
state it in the deliverable and proceed with the most faithful interpretation.

## 8. Self-check

Before returning, verify against your own edit log (the tree is shared; surface — do not
own — any pre-existing or concurrent changes by other writers):

- [ ] Every §2 path was read: both READMEs, all 58 files of `docs/worldbuilding-system/**`,
      both field-trial logs, sampled artifacts from both `field-trial-world*` directories,
      and the three `docs/agents/` boundary files.
- [ ] `git rev-parse HEAD` was run at start; any divergence from
      `b317f2a6298a8df61afa65f438f24564e6f94edf` is noted in the report.
- [ ] No recommendation contradicts `01_core_theory.md`,
      `03_truth_layers_and_canon_governance.md`, or `20_ai_assisted_workflow.md`; any
      genuine tension is flagged as a proposed package amendment, not silently designed
      around.
- [ ] Every §3 settled intention is honored; every §3 `assumption:` item is restated in the
      report's "Assumptions adopted" section; none is re-opened as a question.
- [ ] There is no recommended code path by which LLM-generated text becomes canon without
      explicit user admission, and no recommended reliance on LLM APIs or vendor coupling.
- [ ] The storage recommendation demonstrably covers every record type in `templates/` and
      the lifecycle behaviors the field trials exercised (supersession, promotion,
      cross-reference, audit trail).
- [ ] Every external claim that shaped a decision carries a citation.
- [ ] Domain terms follow `22_glossary.md`; the six-concept separation is preserved in any
      proposed schema/UI vocabulary.
- [ ] This session wrote exactly one file
      (`reports/foundational-principles-research-report.md`), modified nothing else, and
      committed nothing.
