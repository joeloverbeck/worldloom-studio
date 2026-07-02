# Foundational Principles of the Worldloom Studio App — Research Report

Date: 2026-07-02
Commissioned by: `reports/foundational-principles-research-brief.md`
Authored against: commit `b317f2a6298a8df61afa65f438f24564e6f94edf` — verified by `git rev-parse HEAD` at start of pass; **no divergence** (HEAD matches the brief's pinned baseline exactly).
Executor: Claude Code session (model: Fable / claude-fable-5), direct read access to the working tree; online research performed as commissioned by the brief's §5.
Working-tree note: at start of pass the tree already carried modifications to `.claude/skills/research-brief/SKILL.md` and `.claude/skills/research-brief/references/brief-template.md`, plus the untracked brief itself. These pre-existed this session and were not touched. This session wrote exactly one file — this report — and committed nothing.

Status: **analysis / recommendation report, not a ratified artifact.** Principle identifiers below (P-1, W-1, T-1, …) are provisional labels for cross-reference within this report only; formal identifiers belong to the future ratification pass.

---

## 1. Executive summary

Worldloom Studio is a local-first, single-steward web app that implements the Causal Canon Worldbuilding System 1.0 (`docs/worldbuilding-system/`, 58 files) — a validated, storage-agnostic methodology in which a canon fact is an intervention into a living system, admitted through a gate, propagated through a shock cone, and governed through a record lifecycle of living cards and an unedited audit trail. The app's job is not to amend that methodology but to remove the toil its two field trials measured — manual IDs, hand-maintained cross-references that dangled, shock cones written three times, ledger bookkeeping that broke under batch pressure — while making two things impossible by construction: silent canon change, and AI-authored canon.

The core recommendations:

1. **Product identity.** The app is the mechanized continuity clerk. Deep research found that fact admission, truth layers, and consequence propagation exist today only as salaried humans (Lucasfilm's Holocron keeper, Blizzard's historians, CD Projekt's Lore Master) or as social policy documents (Wookieepedia's canon-precedence rules); no consumer tool occupies the structured-governed-canon + local-first quadrant. That quadrant is Worldloom's.
2. **Sovereignty architecture.** AI participates only through prompt-out/paste-in: the app generates a prompt per analytical step (operationalizing `20_ai_assisted_workflow.md`'s ten analyst roles), the steward runs it anywhere, and the pasted response is stored as an immutable advisory artifact that no code path can write into canon. Admission is a deliberate, substantive human act — a cognitive forcing function, which the HCI literature shows reduces uncritical acceptance and preserves ownership.
3. **Storage.** SQLite, one database file per world: STRICT tables for the controlled vocabularies, prose sections stored as prose (JSON-structured where sectioned), a typed link table with enforced referential integrity, recursive CTEs for supersession chains, trigger-protected append-only tables for reports and ledgers, FTS5 for search, `user_version` forward-only migrations, and markdown export as the ownership guarantee. This is the shape Anki, Zotero, Calibre, and Actual Budget converged on for decade-lived personal databases, and SQLite is the only candidate with an institutional longevity guarantee (Library of Congress recommended format; support pledged through 2050).
4. **Workflow.** The package's paths (new world / single idea / contradiction repair / QA) become regimented, severity-scaled flows in which the app enforces exactly the invariants the trials saw humans break — sweeps propose but only admission admits, every skip is recorded with a reason, one record is written once and viewed everywhere — while a separate ungated draft space and cheap repair flows answer the creativity-support literature's warning about premature commitment.
5. **Documentation.** A `docs/principles/` folder of five short constitution-altitude documents plus ADRs under `docs/adr/` for the concrete technology decisions, with a stated conformance rule for every future spec and ticket.

No genuine impossibility was found: nothing in the package prevents a faithful app. Two near-tensions (the package's warning against "software-ish categories," and its insistence that templates are not schemas) are addressed head-on in §8; neither requires a package amendment.

---

## 2. Method and provenance

**Read in full (this session, main context):** repo `README.md`; package `README.md`; `00_overhaul_notes.md`; `01_core_theory.md`; `03_truth_layers_and_canon_governance.md`; `05_creation_protocol.md`; `06_canon_fact_admission_protocol.md`; `07_propagation_engine.md`; `13_contradiction_retcon_and_mystery.md`; `20_ai_assisted_workflow.md`; `21_templates_index.md`; `22_glossary.md`; `operating_card.md`; `docs/agents/domain.md`; `docs/agents/issue-tracker.md`; `docs/agents/triage-labels.md`.

**Read in full (delegated sub-agents, structured extracts returned to this session):** the remaining package files — `02`, `04`, `08`–`12`, `14`–`19`, `23`, `manifest.json`, all 12 `checklists/*`, all 19 `templates/*` — plus both field-trial logs (`reports/eighth-iteration-field-trial.md`, `reports/ninth-iteration-field-trial.md`) and **every file** in both artifact directories: all 11 files of `reports/field-trial-world/` (Saltmarrow) and all 13 files of `reports/field-trial-world-2/` (Carillon). Every artifact type present was therefore sampled from a real filled instance: kernels, seed decompositions, frontloaded seed audits, admission ledgers (both the improvised v0.7 one and the templated v0.8 one), canon fact cards, capability cards, constraint cards, propagation reports, pass reports, contradiction reports (all three), mystery ledger entries (all three), and QA regression profiles (both). All 58 package files were read in full across the pass.

**Online research (three delegated threads):** worldbuilding/campaign tools and professional continuity practice; storage engines and local-first architecture; mixed-initiative HCI, narrative-consistency, and provenance literature. Sources for every claim that shaped a recommendation are in §10.

**Evidence-strength convention.** Where a recommendation leans on a package surface the coverage statement of record (`00_overhaul_notes.md`) names as honestly untested — spatial (`10`), agent/psychology (`11`), uncertainty/evidence (`14`), branching/collaboration (`15`), extraction (`16`), aesthetic (`17`), and `19`/`20` under a genuinely naive steward — that is flagged inline as **[untested surface]**. Where an external finding is practitioner-grade rather than peer-reviewed, it is flagged **[thin evidence]**.

---

## 3. Assumptions adopted

These restate the brief's `assumption:` items verbatim in substance, so the user can reverse any of them cheaply. They are treated as committed defaults throughout this report; none is re-opened as a question.

1. **Local-first, single-steward deployment.** The app runs on the user's machine for one steward; no accounts, no auth, no hosted service in v1. Multi-steward collaboration and the mechanisms of `15_branching_versioning_and_collaboration.md` remain method-level doctrine, out of v1 app scope. Schema-level door-keeping for them is recommended (§5.3.7) and costs almost nothing now; reversing this assumption later would change the architecture materially (sync engine, auth, conflict semantics — see the Linear sync-engine write-up cited in §10 for the scale of that tax).
2. **Strictly prompt-out/paste-in.** The app never calls LLM APIs, holds no API keys, and has no vendor coupling. The user copies a generated prompt out, runs it wherever they choose, and pastes the result back. §4.2 (P-2, W-1) and §6.6 are designed to stand entirely without any API integration. A bring-your-own-key convenience layer is noted as a flagged future possibility in §9 (Q-6) — the foundational principles do not depend on it.
3. **Deliverable is the report only, left uncommitted.** This pass wrote one new report and did not author the future `docs/` principles folder, did not touch `docs/worldbuilding-system/`, and did not commit.

---

## 4. Recommended foundational principles

Format: each principle gives its **substance** (foundational-altitude prose, implementation-guiding but not spec-level), its **root** (package doctrine file, prior-app failure, field-trial evidence, or research finding — kept distinct as the brief requires), and its **home** (which future document in §7 should own it).

### 4.1 Product principles

**P-1. The methodology is upstream and fixed.**
The app implements the Causal Canon Worldbuilding System 1.0 and does not amend it. The package's authority order governs the app's domain model: `01` and `03` over protocols, protocols over instruments. When app design uncovers a place where no faithful implementation is possible, the finding is routed as a proposed package amendment through the package's own change process (`00_overhaul_notes.md` is its changelog; its evidence discipline is trial-driven) — never designed around silently. Specs and tickets cite the package file they implement.
*Root:* settled intention (brief §3.1); package `README.md` authority order.
*Home:* `docs/principles/domain-fidelity.md`.

**P-2. User sovereignty over canon is structural, not advisory.**
The steward writes or explicitly approves every final word that enters the world. There is **no code path by which generated text becomes canon without deliberate user admission**: pasted LLM responses land in an advisory store that is type-separate from canon records; nothing copies from it into a card, ledger row, or report except a steward-performed act that the UI frames as authorship, not acceptance. This operationalizes `20_ai_assisted_workflow.md`'s doctrine ("AI is never canon authority"; "every AI-generated idea remains proposed until admitted by human review") as an architectural invariant rather than a norm. The prior app failed exactly here: AI-decided content the user disagreed with was painful to remove and cascaded through subsequent canon. Research grounds the design: perceived ownership of text tracks the writer's degree of influence and control (the "AI Ghostwriter Effect," Draxler et al. 2024), and interposing a deliberate human act before accepting machine output — a cognitive forcing function — measurably reduces uncritical over-reliance (Buçinca et al. 2021). The same research predicts the friction will be felt; the friction is the feature working, and the mitigation is severity scaling (W-2), not a bypass.
*Root:* prior-app failure (brief §3.3) **and** `20` doctrine — both roots, independently sufficient; research corroboration as cited.
*Home:* `docs/principles/canon-sovereignty.md`.

**P-3. The app is the mechanized continuity clerk.**
The division of labor is: the steward judges; the app remembers, routes, and checks. Everything the field trials show humans doing badly under load is the app's job — identifier minting and sequencing, cross-reference integrity, ledger bookkeeping appendable from any context, status tracking, master-record/digest discipline, "what is canon today?" views, canon-debt ledgers with open/closed state, and skip records. Everything the package reserves to human judgment — truth layer, canon status, constraint tags, admission decision operations, repair operations, preservation boundaries, final wording — the app must never compute, default, or infer. Prior art confirms the gap is real: continuity governance exists in industry only as dedicated salaried roles (Lucasfilm's Holocron database plus its full-time keeper; Blizzard's historian team; CD Projekt Red's posted "Lore Master" role) and in fandom only as human-enforced policy (Wookieepedia's canon-precedence rules); no consumer tool has any concept of a fact being proposed versus admitted, and the only automated propagation found anywhere in the market is a single one-hop reciprocal-relationship update (Fantasia Archive). Worldloom mechanizes the clerk so a solo steward gets what only franchises could previously afford.
*Root:* field-trial friction ledgers (both trials); prior-art research (§10, Thread A/B).
*Home:* `docs/principles/charter.md` (identity statement) and `docs/principles/workflow-principles.md` (the division-of-labor rule).

**P-4. Continuity-and-causality is the differentiator; the wiki is the anti-model.**
The repo's mission is "a web app to create and maintain fictional worlds from a continuity and causality perspective." Every surveyed tool models worlds as linked articles — structure that is presentational, not semantic; auto-linking builds a reference graph but attaches no meaning to it, and documented failure modes follow (bibles drifting from the work, orphaned pages, "the tool becomes its own project to manage"). Worldloom models a world the way `02_world_model.md` describes it: a dependency graph of typed facts whose admission is gated (`06`), whose consequences are propagated (`07`), and whose conflicts are governed (`13`). Features earn their place by serving consequence and governance, not by accumulating modules — the package's own anti-automation rule ("do not ask AI to fill every template for every fact; that creates bureaucracy and false confidence") applies to the app's feature surface as much as to its prompts, and World Anvil's documented user attrition from feature overwhelm is the cautionary tale.
*Root:* repo `README.md`; `01` core premise; prior-art failure-mode research.
*Home:* `docs/principles/charter.md`.

**P-5. Regimented flows, with an ungated margin.**
The app exists to make the package's protocols "guided flows rather than files the user hand-edits" (brief §3.4). Fact admission and contradiction repair fit the profile the design literature assigns to wizard-style flows — high-stakes, dependency-laden, error-prone when freeform **[thin evidence — practitioner-grade design literature]**. But the creativity-support literature warns, with stronger evidence, that regimentation costs *premature commitment* and *viscosity* (Green & Petre's cognitive dimensions; Resnick/Shneiderman's creativity-support principles: support exploration, many paths, iterate-then-refine). The reconciliation, and the principle: **commitment happens only at admission.** The app provides a draft/sketch space with no gates — proposals, notes, pasted advisory material, half-formed seeds — and the regimented flows begin where the package's own jurisdiction begins: when something is proposed for canon. Repair must be cheap (`13`'s retcon kindness rule expects change), the steward is a repeat expert so flows need accelerators (batch admission per the admission ledger, per-cluster gate runs as the trials did, keyboard-driven paths), and severity scaling (W-2) keeps ceremony proportional. The package itself licenses this shape: canon statuses `proposed` and `under review` exist precisely so material can live in governance without being admitted.
*Root:* settled intention (brief §3.4); `03` statuses; `21` field discipline; research (Green & Petre 1996; Resnick et al. 2005; Haynes 2009 / Urbach 2014 checklist evidence — see W-7).
*Home:* `docs/principles/workflow-principles.md`.

**P-6. Local-first; the data outlives the app.**
One world = one visible database file at a user-chosen path, copyable, backed up by copying, and readable in decades. This satisfies the ownership ideals of the local-first literature (Ink & Switch: "the Long Now," data location transparency, no spinners, network optional) and is why browser-private storage (OPFS/IndexedDB) is rejected as the canonical store — LegendKeeper's own changelog documents the failure modes (un-synced changes lost when browser data is cleared; local-DB secrets datamined). Export to markdown (and other formats) is a first-class, lossless-as-practical ownership guarantee — the package is storage-agnostic, so its instrument forms are a natural export rendering — but export is a *view*; the database is the record.
*Root:* assumption 1 (§3); brief §3.5 (structured storage settled); research (Ink & Switch local-first essay; SQLite longevity evidence in §5).
*Home:* `docs/principles/data-principles.md`; concrete engine choice in `docs/adr/`.

### 4.2 Workflow principles

**W-1. Prompt-out at every dependency-bearing step; paste-in is advisory material.**
Every distinct step whose output later steps depend on produces a generated prompt the steward may (not must) run in any external LLM. The prompts are the app's operationalization of `20_ai_assisted_workflow.md`: its ten analyst roles (consequence scout, prerequisite auditor, constraint challenger, institution/economy analyst, contradiction hunter, mystery guardian, character-pressure analyst, aesthetic-residue analyst, spatial-temporal analyst, collaboration secretary) map to specific flow steps (§6.6), each prompt carries `20`'s vocabulary guardrail (require the AI to label whether it proposes a truth layer, canon status, constraint tag, admission decision operation, or repair operation) and its prompt discipline ("ask for pressure, not answers"). Pasted responses are stored verbatim as immutable advisory artifacts attached to the step that generated the prompt, and the steward disposes of them using `20`'s output labels (useful consequence / possible but unadmitted assumption / contradiction risk / mystery risk / off-tone / too broad / too generic / needs human decision / rejected). The app never parses a pasted response into a canon field. Prompt templates are steward-editable — co-writing studies found writers want to author their own controls (Wordcraft) — with the app's defaults versioned so edits are reversible. Research notes both supports and honest gaps: staged, step-scoped LLM assistance is the configuration professionals found controllable (Dramatron); asking for multiple divergent options counteracts documented homogenization effects (Anderson et al. 2024; Doshi & Hauser 2024); and no academic study of deliberately clipboard-mediated LLM integration exists — the pattern is a reasoned design, not an evidenced one **[thin evidence on the clipboard pattern itself]**. `20` itself is honestly untested under a naive steward **[untested surface]**.
*Root:* settled intention (brief §3.2); `20` in full; research as cited.
*Home:* `docs/principles/canon-sovereignty.md` (the boundary) and `docs/principles/workflow-principles.md` (the step mapping).

**W-2. Severity scaling is the app's core conditional dimension.**
The package runs everything through two mapped severity vocabularies — admission levels 0–5 (what kind of fact) and the work scale minor/moderate/major/foundational/catastrophic (what work it owes, `06`) — and the trials' verdict is that this proportionality is what kept the method humane (a whole small world needed "roughly ten instruments… because the severity scale, not habit, decided which facts owed cards," `19`). The app renders forms, required records, prompts, and gate depth from the declared severity: a minor fact is one admission-ledger row with the five items minor work owes; a Level 3 capability is the full gate, fact card + capability card with their division of labor, constraint records, and a propagation report; Level 5 changes owe the contradiction report and its propagation, with a decision record only at the catastrophic band. The app surfaces `21`'s minimal use paths ("the lightest instrument that catches the danger") as the recommendation engine the first trial explicitly wished for at admission time (F-16), and `06`'s classification guidance (e.g., classify a law by the scope of what it structures) inside the severity picker (F2-03).
*Root:* `06` severity-scaled evidence; `21` minimal paths; field-trial evidence (F-08, F-16, F2-03).
*Home:* `docs/principles/workflow-principles.md`.

**W-3. Sweeps propose; only admission admits.**
Any fact born anywhere — a propagation sweep, a specialized pass, a contradiction repair, a QA repair, a pasted advisory response — enters canon only through the admission flow (`06`), at its own severity, exactly as version 1.0's F2-01 fix states for the method. In the app this is a single universal affordance: an "propose this fact" action available from every context, feeding one admission queue. Checklist runs may never change canon status, constraint tags, or operations (the sweeps' own red flag); repair operations and admission decision operations never compose across their jurisdiction boundary (`03`, `13`). This is a state-machine invariant, cheap to enforce in software and demonstrated in the field: Carillon's repair-created institutions each re-entered through gated ledger rows, and the second contradiction was *found by* the first repair's mandated propagation — the lifecycle generates its own error detection when the routing is honored.
*Root:* `03` decision jurisdiction; `07`/`09`/`12`/`13` routing statements; Carillon trial (V2-18).
*Home:* `docs/principles/workflow-principles.md` (invariant) and `docs/principles/data-principles.md` (status machine).

**W-4. Skips are first-class records.**
"Skipping an instrument is allowed. Silent skipping is not" (`21`). In both trials every skip was recorded, reasoned, licensed by a rule, and later rediscovered by QA as the world's 2-scores and named canon debt — skips are data, not absences. The app records for every offered-but-declined instrument: what was skipped, the stated reason, the licensing rule, and the resulting canon debt if any; QA reads this ledger. The same machinery carries canon debt generally (`03`): named, scoped, assigned, with open/closed state — Carillon's D-1…D-6 debts were opened in the audit, carried through cards, and explicitly closed with dispositions, entirely by hand; the app makes debt a tracked entity whose open items gate what `03` says they gate ("a fact with unmanaged canon debt should not become a foundation for another major fact" — surfaced as a warning, not a hard block, since the judgment is the steward's).
*Root:* `21` instrument skipping rule; `03` canon debt; both trials' skip ledgers.
*Home:* `docs/principles/workflow-principles.md`.

**W-5. Record once, view anywhere.**
The package's master-record/digest discipline — the propagation report is the master record of the shock cone, the fact card's shock-cone summary is a digest of or pointer to it, the capability card and fact card divide labor and cross-reference rather than duplicate — is a rendering problem software solves outright. One canonical record; every other surface renders a live digest or link. This kills the trials' worst toil (Saltmarrow's steward wrote one shock cone three times, F-10) and the worst integrity failures (the ledger rows recorded "conceptually" inside other documents that never reached the actual ledger; the double-entered temporal rows). Corollary: the file-versus-record mismatch dissolves — both trials bundled cards into shared files "for trial convenience" against the one-fact-per-card rule; in the app the record is the unit and files exist only at export.
*Root:* `06`/`07` digest rules; field-trial evidence (F-07, F-10, phantom-row failures).
*Home:* `docs/principles/data-principles.md`.

**W-6. The record lifecycle is the data model: living cards, unedited reports.**
`03`'s record lifecycle — cards state the present tense and are updated in place with outgoing wording moved to a history note carrying its retirement status and a pointer to the retiring report; reports are the audit trail and are never edited, a correction being a new record — is the load-bearing answer to the first trial's most important structural finding ("the package governs *changes* meticulously and *state* not at all," F-13) and was validated under a supersession chain two repairs deep in the second trial. The app enforces both halves: mutable card bodies whose supersessions automatically write history entries linked to the governing report, and report/ledger records that are append-only at the storage layer (§5.3.4). The two query modes the package names — "what is canon today?" (the live cards) and "how did canon get here?" (the reports in order) — are the app's two primary read surfaces. The additive-amendment distinction is honored: history is owed to outgoing wording only (`03`, `19`).
*Root:* `03` record lifecycle; `13` triage step 11; field trials (F-13/Q-06 and its validated fix, V2-18/V2-19/V2-20).
*Home:* `docs/principles/data-principles.md`.

**W-7. Gates demand substance, not clicks.**
The checklist evidence is two-sided: forcing-function checklists cut surgical complications when genuinely performed (Haynes et al. 2009) and showed no benefit when mandated into ritual compliance (Urbach et al. 2014). The design consequence: a gate item is satisfied by content, not by a checkbox — the canon fact gate's consequence check requires a written consequence ("must say something the world must now answer, not restate the fact," the admission ledger's own rule); an n/a requires a reason (`18`'s convention); a quiet domain requires a declaration. Software can enforce performance of the check in a way institutional mandates could not; that is the strongest version of the checklist argument, and it must be balanced against W-2 so trivial facts stay trivial.
*Root:* `18` n/a convention and red flags; checklists' completion rules; research (Haynes 2009; Urbach 2014).
*Home:* `docs/principles/workflow-principles.md`.

### 4.3 Technical principles

**T-1. SQLite, one file per world, is the canonical store.**
Full recommendation and grounding in §5. The principle at foundational altitude: the world lives in a single, visible, user-owned database file whose engine carries an institutional longevity guarantee, whose schema enforces the package's referential and lifecycle invariants, and which is trivially backed up and exported.
*Root:* brief §3.5 (structured storage settled; SQLite the leading candidate — confirmed by research, §5); research citations in §5/§10.
*Home:* `docs/adr/` (the decision); `docs/principles/data-principles.md` (the invariants it must uphold).

**T-2. The label separations are schema facets, never flattened.**
The six concepts the package forbids blurring — canon status, constraint tag, admission decision operation, repair operation, consequence mode, preservation boundary — plus truth layer and the work scale, are stored as separate, separately-typed fields drawn from separately-seeded vocabulary tables, using the package's exact terms (`22_glossary.md` is authoritative; the templates catalog yields 29 controlled vocabularies in total, several deliberately open via "other"). Operations are *ordered multi-valued* ("primary first, others as component moves") and composition never crosses the admission/repair jurisdiction boundary — a CHECK-level rule, and the schema-level enforcement of what QA test P2 checks by hand. The UI never invents synonyms ("shadow market" for black market is the glossary's own example of drift).
*Root:* package `README.md` six-concept separation; `03` label-separation and jurisdiction tables; `20`'s failure-mode warning; `22`.
*Home:* `docs/principles/domain-fidelity.md`.

**T-3. Identifiers are the app's job; content is never a key.**
A key finding of the template catalog: the package defines no ID scheme anywhere — records are identified by content, pointers are prose, and history entries carry deliberately loose "date or sequence markers." Both trials show stewards hand-minting ID schemes (S1a…, SF-1…, C-1/C-2, "trial sequence marker T1/T2") and hand-maintaining pointers that then dangled. The app mints stable surrogate identifiers and global sequence/timestamps for every record; fact statements and titles are mutable display fields (they are *expected* to be reworded in place); cross-references are typed link records with enforced integrity (§5.3.3). Human-facing short IDs may be generated for citation in prose and export.
*Root:* templates catalog (no identifier conventions); field-trial toil evidence.
*Home:* `docs/principles/data-principles.md`.

**T-4. Prose fidelity first; structure only where the package structures.**
Roughly 80% of template fields are open prose under fixed headings; the templates declare themselves "human reasoning instruments, not database schemas." The schema therefore stores prose sections as prose (sectioned, searchable, exportable), reserves typed columns for the controlled vocabularies and lifecycle fields, and resists inventing structure the package does not have (e.g., the five-facet working scope stays a prose bundle, not five foreign keys; a timeline event's up-to-seven date facets at variable granularity are never collapsed into one timestamp column). Templates also tolerate field-collapsing at small scale (Carillon's second mystery entry merged headings) — form sections are optional/collapsible, and "leave fields empty if they do not apply" (`21`) is respected by the UI.
*Root:* `21` (instruments are thinking instruments); `23` translation rule 5; template catalog; trial record shapes.
*Home:* `docs/principles/data-principles.md`.

**T-5. Provenance is captured at authorship time, per record.**
Every record and every mutation carries provenance: who (the steward — v1 has exactly one, but the field exists), when, in which flow step, and — where advisory material was consulted — which prompt was generated and which pasted response was on the table, stored verbatim. The shape maps cleanly onto W3C PROV (fact = Entity; flow step = Activity; steward and "external LLM (advisory)" = Agents; the final fact `wasDerivedFrom` the advisory artifact but `wasAttributedTo` the steward), which the package's own bibliography already cites. Research shows this is not bureaucratic overhead: interaction-provenance tooling *increased* writers' sense of control and ownership and their willingness to disclose AI use (HaLLMark, CHI 2024), and post-hoc human/AI attribution is technically unreliable (OpenAI withdrew its own detector for low accuracy; detectors show severe bias) — the moment of authorship is the only trustworthy capture point. Provenance also future-proofs disclosure needs if worlds are ever published.
*Root:* `03` audit-trail doctrine and `23` (ISO 15489, W3C PROV citations); prior-app failure (untraceable AI-authored canon); research (HaLLMark; detector-unreliability sources).
*Home:* `docs/principles/canon-sovereignty.md` (the AI-advisory record) and `docs/principles/data-principles.md` (the mechanism).

**T-6. The branch and collaboration door is kept open in the schema, closed in the UI.**
`15` is out of v1 product scope and has zero field exposure **[untested surface]** — but its record semantics are cheap to honor now and expensive to retrofit: every fact carries a continuity scope with a single default "main continuity" (the package's truth layers `branch canon`, status `branch-only`, and tag `branch-bound` all presuppose it); the branch-diff and collaboration-decision-record types exist in the schema with their vocabularies (branch status, merge expectation, the eight workflow roles); provenance already records an actor per decision. v1 builds no branching UI and no multi-steward mechanics. This is door-keeping as the brief invites, not scope creep: the recommendation is grounded in the record shapes of `templates/canon_branch_diff.md` and `templates/collaboration_decision_record.md`, not in speculation about future features.
*Root:* brief §3.6 (door-keeping invited); `15` record semantics; `03` governance minimum for collaboration.
*Home:* `docs/principles/data-principles.md`; the scope boundary in `docs/principles/charter.md`.

**T-7. The web UI is served by a local native process; browser storage is never canonical.**
Architecture: a localhost server with native SQLite serving the browser UI. This keeps the database a visible file (P-6), gets native performance and integrity, and avoids OPFS/wasm fragility and opacity. An optional desktop wrapper (Tauri-class, not Electron-class, on footprint grounds) can come later without changing the storage layer; a wasm-SQLite browser edition remains a known escape hatch (Logseq's DB version demonstrates one schema serving both). Stack specifics beyond this shape are deliberately left to an ADR — the repo is greenfield and the brief forbids constraints from habit.
*Root:* research (local-first architecture thread, §10); P-6.
*Home:* `docs/adr/`.

**T-8. Honest coverage flows into scope.**
The package's coverage statement names its field-tested surfaces (the core pipeline twice over; `08`, `09`, `12`; the record lifecycle under accumulation; batch admission with promotion; QA at per-test granularity) and its honestly untested ones (`10`, `11`, `14`, `15`, `16`, `17`; `19`/`20` under a naive steward). The app's build order should follow the evidence: v1 flows implement the field-tested pipeline end-to-end; the untested protocols are covered at the *schema* level (their record types and vocabularies exist, so nothing is lost) with generic record-editing surfaces rather than bespoke guided flows, until use generates the evidence to design those flows well. Where this report's recommendations lean on untested surfaces, they are flagged; the flagging convention itself should carry into specs.
*Root:* `00_overhaul_notes.md` coverage statement of record; brief §6 honest-coverage constraint.
*Home:* `docs/principles/charter.md` (scope) and each spec that touches an untested surface.

---

## 5. Storage and data-model recommendation

### 5.1 Requirements, derived from the actual record shapes

From the full templates/checklists catalog and the filled trial artifacts, the storage layer must represent, without loss:

- **19 record types** (the templates) plus **12 checklist-run types**, plus the sanctioned **pass report** container (`21`) and the QA scorecard/regression profile (`18`) — each a fixed section skeleton of mostly prose with a small set of controlled-vocabulary facets;
- **29 controlled vocabularies** with exact package values (11 canon statuses, 13 truth layers, 17 fact types, 9 consequence modes, 16 constraint tags, 12 admission decision operations, 12 repair operations, 7 explanation-pressure/preservation operations, 5 work-scale severities, 10 contradiction types, 7 contradiction dispositions, 6 protected effect types, 8 confidence bands, 14 domains, branch vocabularies, etc.), several open via "other";
- **ordered multi-valued operations** ("primary first, components after"), jurisdiction-bounded;
- **two mutation regimes**: living cards/ledger rows updated in place with append-only history entries (each history entry: outgoing wording verbatim, retirement status `superseded`/`deprecated`, sequence marker, pointer to the retiring report), versus immutable reports (propagation, contradiction, change proposal, decision record, pass report, checklist run);
- **lifecycle behaviors the trials exercised**: a supersession chain two repairs deep with genealogical links (C-2 *created by* C-1's repair); ledger-row → card **promotion** preserving identity and leaving a tombstone pointer on the row; status transitions across the 11-status machine; addendum batches appended to a ledger from three different contexts; canon-debt open/close; skip records;
- **typed cross-references** as the connective tissue (the catalog's edge map: retired-by, digest-of, promoted-to, constrains, opposes, decomposes, parent-continuity, protects, …) — currently prose pointers that demonstrably dangle under manual maintenance;
- **semi-structured awkwardness**: multi-date events at seven granularities; conditional sections (sacred-opacity accountability required iff the effect type includes sacred opacity); sentinel values ("none", "not applicable"); hybrid/multi values; user-extensible enums;
- **full-text search** over prose plus structured filters in one query; **audit trail** everywhere; **single-file backup**; **markdown export**.

Scale: thousands of records per world (Saltmarrow: ~30 facts and ~11 instruments for a whole small stable world), not millions.

### 5.2 Recommendation

**SQLite, one database file per world.** Configuration and shape:

- **STRICT tables**, `PRAGMA foreign_keys=ON` per connection, NOT NULL keys, WAL mode, `application_id` set — the documented discipline that neutralizes SQLite's known quirks (flexible typing, FK-off default).
- **Typed columns for the vocabularies**, seeded from the package's 29 lists into vocabulary tables (user-extensible rows where the package says "other"); ordered multi-valued operations as position-indexed rows in an operations table, with the admission/repair jurisdiction enforced by CHECK/trigger.
- **Prose sections as prose** — a sections table (record, section-key, ordinal, markdown text) or JSONB column per record; FTS5 external-content index over it (BM25 ranking, per-column weighting so names/titles outrank body prose, `snippet()` for results), kept in sync by triggers.
- **A first-class typed link table** `links(from_record, to_record, link_type, note)` with FK integrity — the app's answer to the trials' dangling prose pointers; link types seeded from the catalog's edge map. Recursive CTEs traverse supersession chains and dependency paths; at this cardinality, join tables outperform any dedicated graph engine and carry none of the longevity risk (the leading embedded graph store, Kùzu, was archived in 2025 after acquisition; Cozo is dormant; SurrealDB is BSL-licensed and young). If graph queries ever outgrow SQL, the precedent is Calibre's: keep SQLite canonical and build an in-memory graph projection in the app layer — never a second persistent engine.
- **Append-only enforcement** for report-regime records and ledger history: `BEFORE UPDATE`/`BEFORE DELETE` triggers that raise on report tables; card mutations automatically write history rows (the proven trigger-based history pattern; SQL:2011 temporal tables don't exist in SQLite and aren't needed — the admission ledger and supersession chain are *domain objects*, modeled directly, with a generic trigger-history table as backstop for card fields).
- **Promotion** modeled as identity-preserving upgrade: the fact record persists; its record-kind and owed-instrument set change; the ledger row gains a promotion link (tombstone pointer), exactly as Carillon's S4a → Card 6 worked by hand.
- **Continuity scoping** on facts (default "main continuity") and the `15` record types present but UI-dormant (T-6).
- **Provenance tables** (T-5): actors, activities (flow-step executions), advisory artifacts (generated prompt text + pasted response verbatim + the analyst role that framed it), and derivation links — PROV-shaped, informally.
- **Migrations**: `PRAGMA user_version`, numbered immutable forward-only scripts each in a transaction, pre-migration `VACUUM INTO` backup — the pattern of the decade-lived personal databases (Anki, Zotero, Calibre all store a schema version and upgrade on open).
- **Backup/export**: whole world = copy one file; online `.backup`/`VACUUM INTO` for snapshots; markdown export renders records into the package's own template forms (a faithful rendering exists by construction, since the schema is derived from the templates).

**Why SQLite over the alternatives** (full comparison in the research; citations §10): document stores (PouchDB/RxDB/LiteDB) trade away enforced referential integrity — the one property the trial evidence shows this data most needs — to buy replication that v1 explicitly doesn't want, and RxDB's production tier is open-core paid; DuckDB is an OLAP engine by its own positioning; embedded graph stores carry acute abandonment/licensing risk (above) and solve a traversal problem that doesn't exist at 10³–10⁴ rows; raw KV stores (LMDB) make every requirement bespoke application code. SQLite is the only candidate with an institutional longevity story — the US Library of Congress lists it as a recommended storage format alongside XML/JSON/CSV, and its developers pledge format stability and support through 2050 — which is precisely the "Long Now" property a personal creative archive needs. The closest analog applications (Anki, Zotero, Calibre, Actual Budget, Logseq's DB version) all converged on this same shape.

### 5.3 Coverage demonstration

Checking the recommendation against every record type and every exercised lifecycle behavior, as the brief requires:

| Package record / behavior | Storage representation |
|---|---|
| World kernel (singleton root; mode commitments; seed list) | Record of kind `world_kernel`; consequence-mode facets; links `decomposes-into` → seed facts. Mode revision is a governed change (event row + history). |
| Canon fact card (17 fact types, all facets, shock-cone digest, history) | `fact` record: vocabulary facets (type, mode, truth layer, status, tags[], operations[]); prose sections; `digest-of` link → propagation report; history rows with retirement status + `retired-by` link. |
| Admission ledger (batch context, rows, addenda, promotions) | Ledger = a batch record; rows = minor-severity fact records linked to it; addendum batches from any context (W-3's universal queue); promotion per §5.2. The trials' overloaded consequence-check cell decomposes into its real parts: consequence text + debt link + promotion link + status note. |
| Capability / constraint cards; division of labor | Companion records linked `analyzes` / `constrains` to their fact; W-5 renders shared context, never duplicates it. Constraint↔constraint composition edges (strengthen/gate/conflict/…) as typed links. |
| Institution / counter-institution / action-arena / agent / spatial-region / temporal-timeline / uncertainty-evidence / aesthetic-coherence cards | Records with their catalog field inventories; `opposes`, `origin`, `pressures`, `varies-in`, multi-date facets (event/discovery/public/institutional/ordinary-life dates at 7 granularities as typed date rows, never one column), confidence bands, belief-community links, mystery-boundary links. **[untested surfaces `10`/`11`/`14`/`17`: schema-level per T-8]** |
| Mystery ledger entry (protected effects; nullable puzzle question; conditional sacred-opacity block) | Record with protected-effect-type facet, sentinel-aware fields, conditional section gated by effect type, preservation-operation facet; links to the facts/cards it protects. |
| Canon change proposal / propagation report / contradiction report / collaboration decision record / pass report / checklist runs | Report-regime records: append-only by trigger; contradiction reports carry type, work-scale severity, ordered repair operations, terminal disposition (7 values), and the mutation instruction that fires the card's history write. Checklist runs store item states + the mandatory completion-artifact text + skip-justification (W-4). |
| Canon branch diff | Present per T-6: parent-continuity link (recursive), divergence point, changed-fact links, invariant anchors, merge expectation, branch status, leakage warnings. **[untested surface `15`]** |
| QA scorecard / regression profile | Per-test rows (28 tests; score 0–3 or n/a-with-reason), subject link, regression-profile fields; open canon debt gates per W-4. |
| Supersession chain two deep | History rows + `retired-by` links + genealogical `created-by-repair-of` link between contradiction reports (C-1 → C-2), traversed by recursive CTE. |
| Ledger-row promotion | §5.2; identity preserved, tombstone link, trigger condition ("other facts depend on it") is literally countable via the links table — surfaced as a suggestion, decided by the steward (P-3). |
| Cross-references / audit trail | Links table with FK integrity; provenance tables; append-only enforcement; global sequence — the trials' invented "trial sequence markers" come free. |

### 5.4 What the schema must *not* do

Per T-2/T-4 and §8: no field the package assigns to steward judgment is computed or defaulted (no auto-severity, no auto-status, no inferred truth layer); no vocabulary is renamed into developer idiom; prose is not decomposed beyond the package's own section structure; and the schema treats the package's instrument forms as the export rendering, not as the storage contract — the package explicitly blesses any medium, so a database that can re-render the instruments faithfully is inside the method's own terms.

---

## 6. Workflow architecture recommendation

### 6.1 General shape

Each package path becomes a **flow**: an ordered, resumable sequence of steps over the record store, where each step (a) shows the relevant doctrine at point of use (the trials' routing frictions F-01…F-05 were all "the right sentence wasn't at hand"), (b) offers its prompt-out affordance (W-1), (c) collects the steward's substantive input (W-7), and (d) commits records with provenance. The operating card becomes persistent UI chrome — the second trial used the physical card as "persistent working memory that prevented re-reads"; the app pins its content (label-separation table, severity map, records rule) permanently. Flows are resumable and interleavable — worldbuilding is not a single session — and every flow can be exited with state parked at `proposed`/`under review` (P-5).

### 6.2 New world flow (README path, `05` phases)

1. **Kernel** — guided form for the nine kernel elements with inline vocabulary help (F-02) and the thin-start rule surfaced (Q-01); mode declaration prominent, its later revision routed as a governed change.
2. **Seed decomposition** — workspace splitting kernel facts into atomic seeds with the granularity rule embedded ("split until each seed could be independently rejected," Q-02); parent-child links to kernel facts kept automatically; the ordinary-life anchor wired forward to Phase 6 (F-04's silent drop becomes impossible).
3. **Frontloaded seed audit** — runs once, after decomposition and before any admission (the timing the state machine enforces, F-05); seeds auto-set `proposed` with an intended-post-admission-status field (F-06); ends in the audit's five-way kernel decision.
4. **Seed admission queue** — seeds ordered by `05`'s admission order (constraints → capabilities → resources → institutions → traumas → mysteries → aesthetic promises); severity picker with guidance (W-2); minor seeds flow into ledger rows in batch (gate per fact or per coherent cluster, as the package allows); major seeds get full gate + cards; aesthetic promises get their sanctioned disposal (kernel commitments now, records only when load-bearing — Q-03).
5. **Propagation** — for gate-passing facts at Level 2+: the propagation report as master record, the 14-domain pass with per-domain state (including declared-quiet-with-reason and negative-domain flags from `04`), stopping rule required, follow-ups named (no TBD) and materialized as queue items.
6. **Specialized passes** — offered only where the fact applies (`README` step 8); each produces one pass report bundling sweep outputs and domain cards; pass-surfaced facts route to the admission queue (W-3).
7. **QA** — per-test scorecard, n/a-with-reason, regression profile, repair loop; QA repairs that touch protected effects fire the mystery-preservation checklist automatically (its trigger is mechanical).
The `05` "first playable world" minimum renders as a completion meter for the flow.

### 6.3 Single new idea flow (README quick path)

Change proposal (when alternatives/review/recorded decision are needed — the solo-steward skip license of `21` surfaced) → canon fact gate at declared severity → admission decision (ordered multi-operation, F-09) → propagation if more-than-local pressure → QA touch. For a burst of small ideas: straight to a ledger batch. This is the flow the steward lives in daily; it gets the accelerators (P-5).

### 6.4 Contradiction / mystery / retcon flow (`13`)

Triage wizard walking the 11 steps (quote both claims — as links to the actual records, not re-typed text; layers; scopes; who can notice; classify from the 10-type taxonomy; authority; mystery check; repair operations ordered-multi, F-12; propagate; card mutation). Disposition (7 values) is mandatory to close. The card mutation is transactional: new present-tense wording, history entry with retirement status and pointer, report frozen — the app performs mechanically what F-13 found humans cannot sustain. Repair-created facts route to admission (W-3). Any touch on a protected effect fires `checklists/mystery_preservation.md`; retcons collect their cost ledger and (per `09`) the declaration of which dimension of truth changed. Mystery governance uses the mystery ledger entry even when the puzzle question is "none," with the sacred-opacity accountability block conditionally required.

### 6.5 QA flow (`18`)

Scorecard of record is per-test (F2-02's fix); the nine-row triage view is a computed rollup, never a second artifact. Scores calibrate against the mode-appropriate anchors chosen by the world's declared consequence mode. The repair loop is a sub-flow that can fire other flows (a repair is an admission or a `13` repair, never an in-place QA edit). Red-team prompts are prompt-out items. The regression profile persists and its named canon debt joins the debt ledger.

### 6.6 Where prompt-out sits: the human-decides sequence

`20`'s eleven-step workflow is the template for every analytical step, and its structure is invariant: **human writes → AI challenges → human deletes/selects → human decides → AI summarizes → human records.** The app's step-to-role mapping:

| Flow step | `20` analyst role(s) offered |
|---|---|
| Fact statement / dependencies (gate steps 1–4) | Prerequisite auditor |
| Capability / access / cost / constraints (gate steps 5–8) | Constraint challenger |
| Actor sweep | Character-pressure analyst |
| Institutional / economic sweeps | Institution/economy analyst |
| Temporal / spatial sweeps | Spatial-temporal analyst |
| Domain propagation | Consequence scout |
| Contradiction sweep / triage | Contradiction hunter |
| Mystery checks / preservation | Mystery guardian |
| Residue steps / aesthetic pass | Aesthetic-residue analyst |
| Change-package / report assembly | Collaboration secretary (summarizes; adds nothing) |

Every prompt embeds: the relevant record context (the app assembles it — this is drudgery the steward currently does by hand), the role's ask-for-pressure framing, the vocabulary guardrail, and the instruction to label assumptions. Every step is skippable (`20`'s anti-automation rule: "use AI where it finds pressure the human might miss; stop when the world has enough consequence to live"). Pasted responses attach to the step as advisory artifacts; disposal uses `20`'s output labels; the steward's dispositions persist, so later prompts can carry prior rulings as context (the one design suggestion research adds — Patchview's finding that persisted corrections should steer future assistance — implemented here without any API: the *generated prompt* includes the steward's standing rulings).

`20`'s risk-band table maps to UI emphasis: low-risk uses (generating questions) are one click; high-risk uses (contradiction resolution, new canon) get the full labeled-disposal treatment.

### 6.7 The toil ledger, closed

For traceability, the affordances above close every numbered friction in both trials: F-01…F-05 (routing/vocabulary at point of use, schema lineage, enforced timing), F-06 (status lifecycle), F-07/F-10 (division of labor + record-once), F-08 (ledger batch UI), F-09/F-12 (ordered multi-operations), F-11 (two named severity fields with the mapping computed), F-13/Q-06 (living cards + history + current-canon view), F-15 (n/a first-class), F-16 (instrument recommendation from `21`), Q-01…Q-05, F2-01 (universal admission routing), F2-02 (per-test scorecard, computed triage), F2-03 (severity guidance), Q2-01 (pass-report record type), Q2-02 (records-owed checklist per severity), plus the unnumbered toil: ID minting, sequence markers, cross-reference integrity, single-entry records.

---

## 7. Proposed structure of the future `docs/` principles folder

Constraints honored: the repo's existing conventions (`docs/agents/domain.md`) expect system-wide ADRs in `docs/adr/` and lazily-created `CONTEXT.md`/`CONTEXT-MAP.md` via domain-modeling — the principles folder complements both and conflicts with neither. Documents are few and short; each states its altitude and its conformance rule.

```
docs/principles/
  README.md               — index, authority order, and the conformance rule
  charter.md              — mission, differentiator, scope, non-goals
  canon-sovereignty.md    — the AI boundary and the prompt-out/paste-in doctrine
  domain-fidelity.md      — the package relationship and vocabulary discipline
  workflow-principles.md  — how protocols become flows
  data-principles.md      — how records live in software
docs/adr/
  NNNN-sqlite-per-world-storage.md
  NNNN-localhost-native-process-architecture.md
  NNNN-branch-and-collaboration-schema-door.md
  (further ADRs as concrete decisions are made: stack, export format, …)
```

**`README.md`** — *Altitude: index.* Owns the authority order within the folder (charter > sovereignty/fidelity > workflow/data > ADRs) and the conformance rule: **every spec and ticket names, in a "Principles" section, which principle documents it touches and affirms non-contradiction; any deliberate exception is flagged to the user before implementation.** This gives review (human or agent) a mechanical check, in the same spirit as the package's own traceability doctrine and the repo's existing ADR-conflict-flagging convention.

**`charter.md`** — *Altitude: constitution (most durable; changes require explicit user decision).* Owns P-3 (identity), P-4 (differentiator/anti-model), T-8 (evidence-led scope), and the v1 scope boundary (single steward, main continuity, prompt-out only). One page.

**`canon-sovereignty.md`** — *Altitude: constitution.* Owns P-2, W-1, T-5's advisory-record half: the structural impossibility of AI-authored canon, the advisory-artifact store, the prompt/role system as the operationalization of `20`, the output-label disposal, provenance of advisory input. This is the document that exists because the prior app failed; it should say so.

**`domain-fidelity.md`** — *Altitude: constitution.* Owns P-1 and T-2: methodology-upstream, the amendment-routing rule, the authority order, the glossary as naming authority for schema/UI/code identifiers, the label separations as schema facets, the jurisdiction boundaries. Includes (or references) the vocabulary inventory as the single seeded source.

**`workflow-principles.md`** — *Altitude: architectural principles (durable; may evolve with field evidence from app use).* Owns P-5, W-2, W-3, W-4, W-7, the flow shapes of §6, the draft-space/canon boundary, and the accelerator obligations.

**`data-principles.md`** — *Altitude: architectural principles.* Owns P-6, W-5, W-6, T-3, T-4, T-6, and the invariants any storage implementation must uphold (two mutation regimes, typed links, append-only reports, promotion semantics, provenance, export). Deliberately engine-agnostic — the engine choice lives in the ADR so the principle survives even if the ADR is ever revisited.

**ADRs** — *Altitude: decisions (revisable with stated cost).* SQLite-per-world (§5.2's full configuration), the localhost architecture (T-7), the schema door (T-6), and future concrete choices. Context-scoped ADRs move under `src/<context>/docs/adr/` if/when the domain-modeling conventions create contexts.

What is deliberately **not** in the folder: specs, schema files, prompt texts, UI designs — those are downstream artifacts checked *against* the folder. And nothing in the folder restates package content; it cites `docs/worldbuilding-system/` by file, so the package remains the single source of domain truth.

---

## 8. Package tensions examined — no amendments required

The brief requires genuine impossibilities to be flagged as proposed package amendments. None was found. Three near-tensions deserve explicit resolution so no future spec trips on them:

1. **"Templates are not database schemas."** Nearly every template disclaims being a schema, and `21` says instruments are "not mandatory forms, software records, database tables, schemas, API contracts." Resolution: the package is *storage-agnostic*, not storage-hostile — its own README blesses "paper, notebooks, cards, documents, wikis, spreadsheets… or any other medium." A database is a medium. The obligation the disclaimers actually impose is T-4: represent the records without pretending the template prescribed the representation, keep prose primary, keep fields skippable, and keep the exported rendering faithful. No amendment needed.
2. **"Converting craft vocabulary into software-ish categories"** (`20`'s failure-mode checklist) and translation rule 5 (`23`: "do not turn controlled vocabularies into programming constructs"). Resolution: the warning is against *replacing* craft distinctions with software abstractions (e.g., collapsing status/tag/operation into one "state" enum, or renaming truth layers into developer idiom). Storing the vocabularies verbatim, separately faceted (T-2), is the opposite move — it is what preserves the distinctions under load. The line to hold: the app may *store and check* the vocabularies; it may not *redefine, merge, or auto-assign* them. No amendment needed.
3. **The severity levels' judgment calls.** The app can suggest severities and surface `06`'s guidance, but classification is a steward decision (both trials record judgment calls here). Any temptation to auto-classify should be resisted as a P-3 violation, not solved by asking the package for crisper rules. No amendment needed.

One observation is worth *offering* (not owing) to the package's next evidence cycle: the app will mechanically enforce invariants the package states as discipline (report immutability, routing, history notes). If field use of the app reveals places where the discipline was load-bearing *because* it was manual (a steward learning by doing the bookkeeping), that would be genuine evidence for the package's naive-steward question — worth logging when the app itself gets field-tested.

---

## 9. Open questions for the user

Genuinely user-owned decisions that doctrine and research could not settle. None blocks the principles above; each names a default so ratification can proceed if the user simply concurs.

- **Q-1. Packaging for v1.** Localhost process + your own browser (default, per T-7), or wrapped as a double-clickable desktop app (Tauri-class) from day one? The storage layer is identical either way; this is a convenience/effort trade only you can price.
- **Q-2. World-file granularity.** One SQLite file per world (default, per §5.2 — cleanest backup/share/archive story), or one application database holding all worlds (slightly simpler app code, muddier ownership story)? Affects backup UX more than architecture.
- **Q-3. Implementation stack.** The research motivates the *shape* (native SQLite behind a localhost server, browser UI) but deliberately not the language/framework — the repo is greenfield and the brief forbids constraints from habit. Do you have a stack preference, or should a dedicated ADR pass weigh options?
- **Q-4. Default prompt wording ownership.** Prompts are steward-editable (W-1). Should the app's *default* prompt texts quote `20`'s ready prompts verbatim (maximum fidelity, but the package's prompts are terse) or ship elaborated versions that embed record context and guardrails (recommended default), with the `20` originals always visible as the doctrinal source?
- **Q-5. Advisory-artifact retention.** Default: pasted LLM responses are retained verbatim forever (they are the provenance record, and local disk is cheap). Do you want a purge affordance (e.g., for pasted material you consider disposable), accepting the provenance gap it creates?
- **Q-6. Bring-your-own-key convenience layer.** The principles stand entirely without it (assumption 2). Research found the BYO-model pattern well-established practitioner-side **[thin evidence]**. Should a *flagged, off-by-default* BYO-key integration be kept on the long-term roadmap (never bypassing the advisory store or admission gate), or ruled out of the charter entirely?
- **Q-7. QA surface in v1.** The per-test scorecard is field-validated and cheap to build; the question is priority: is QA (with the repair loop and debt gating) a v1 requirement alongside the admission/propagation/contradiction flows (recommended — both trials treat QA as what makes a world "stable"), or a fast-follow?
- **Q-8. Naming.** "Worldloom Studio" is the repo's name for the app; the package is the "Causal Canon Worldbuilding System." Should app-facing UI adopt the package's craft vocabulary wholesale (steward, admission, shock cone — recommended for fidelity) or introduce any friendlier surface labels (which T-2/`22` would constrain to display-only synonyms, a risk in itself)?

---

## 10. Research appendix

External sources whose claims shaped a recommendation. Grouped by thread; each entry notes what it supports. Package-internal citations (`01`–`23`, templates, checklists, trial logs) are given inline throughout and not repeated here.

### Storage and local-first architecture

- SQLite long-term support pledge (format stability and support through 2050): https://sqlite.org/lts.html — longevity basis for T-1/P-6.
- US Library of Congress recommended storage format status: https://www.sqlite.org/locrsf.html (referencing https://www.loc.gov/preservation/digital/formats/fdd/fdd000461.shtml) — archival-grade claim.
- SQLite as application file format; backup API; single-writer suitability: https://www.sqlite.org/whentouse.html.
- FTS5 (BM25, external content, snippets): https://www.sqlite.org/fts5.html — search recommendation.
- Recursive CTEs: https://sqlite.org/lang_with.html — supersession-chain traversal.
- JSON/JSONB support: https://fedoramagazine.org/json-and-jsonb-support-in-sqlite-3-45-0 — semi-structured fields.
- SQLite quirks (flexible typing, FK default-off, ALTER limits): https://www.sqlite.org/quirks.html — the STRICT/pragma discipline in §5.2.
- `user_version` migration pattern: https://levlaz.org/sqlite-db-migrations-with-pragma-user_version; https://sqlite.org/pragma.html — migration recommendation.
- Trigger-based history/audit patterns: https://simonwillison.net/2023/Apr/15/sqlite-history/; https://til.simonwillison.net/sqlite/json-audit-log; absence of SQL:2011 temporal tables: https://www.bytefish.de/blog/sqlite_logging_changes.html — audit-trail mechanism.
- Decade-lived personal-database precedents: Anki (https://github.com/ankidroid/Anki-Android/wiki/Database-Structure), Zotero (https://www.zotero.org/support/dev/client_coding/direct_sqlite_database_access), Calibre (https://manual.calibre-ebook.com/faq.html; https://github.com/kovidgoyal/calibre/blob/master/resources/metadata_sqlite.sql) — "SQLite as durable file format" pattern.
- Ink & Switch, "Local-first software": https://www.inkandswitch.com/essay/local-first/ — P-6 ideals; also grounds the no-API argument (W-1).
- OPFS/wasm-SQLite trade-offs: https://rxdb.info/articles/localstorage-indexeddb-cookies-opfs-sqlite-wasm.html — rejection of browser-canonical storage (T-7).
- Tauri vs Electron footprint: https://dev.to/raftlabs/tauri-vs-electron-23d1 — T-7 wrapper preference.
- Actual Budget local SQLite file: https://github.com/Timoteohss/actual-sync; Logseq DB version (one schema, native + wasm): https://openapps.pro/apps/logseq; Linear sync engine complexity (the multi-user tax): https://www.fujimon.com/blog/linear-sync-engine — assumption-1 reversal cost.
- Graph/document alternatives: Kùzu archived post-acquisition: https://github.com/kuzudb/kuzu (with https://grokipedia.com/page/Kuzu_graph_database); Cozo dormancy: https://github.com/cozodb/cozo; SurrealDB BSL license: https://github.com/surrealdb/license; Neo4j licensing: https://neo4j.com/licensing/; RxDB open-core: https://www.rxdb.info/; LiteDB (.NET): https://www.litedb.org/; DuckDB OLAP positioning: https://duckdb.org/why_duckdb.html — §5.2 rejections.

### Worldbuilding tools and professional continuity practice

- World Anvil features/templates: https://www.worldanvil.com/; https://grokipedia.com/page/World_Anvil (tertiary; cross-checked against worldanvil.com); complaint aggregation: https://inkwarden.app/blog/world-anvil-alternative-inkwarden (competitor source — treated as quote aggregation, corroborated by https://www.trustpilot.com/review/worldanvil.com) — P-4 anti-model evidence.
- LegendKeeper architecture and limitations: https://www.legendkeeper.com/changelog/legendkeeper-0-9-0-0-hydra/; https://litrpgreads.com/blog/rpg/rpg-tools-interview-adam-waselnuk-at-legendkeeper — P-6 browser-storage caution.
- Kanka entities/relations: https://kanka.io/use-cases/game-masters; https://blog.kanka.io/2020/08/16/release-0-40-timelines-and-new-text-editor/ — data-model pattern survey.
- Campfire modules: https://www.campfirewriting.com/worldbuilding-tools; Plottr series bible: https://plottr.com/series-bible-software/; Obsidian TTRPG stacks and DIY continuity hygiene: https://publish.obsidian.md/hub/02%2B-%2BCommunity%2BExpansions/02.01%2BPlugins%2Bby%2BCategory/Plugins%2Bfor%2BTTRPG; https://vault.tjtrewin.com/how-i-use-obsidian — hand-rolled status/orphan detection (P-3 gap evidence).
- Story-bible drift (writer reports): https://www.reddit.com/r/writing/comments/1rk2t3n/how_do_you_actually_track_continuity_across_a/ (secondary/community).
- Wookieepedia canon policy (social truth-layering): https://starwars.fandom.com/wiki/Wookieepedia:Canon_policy — requirements document for machine-readable truth layers (P-3/P-4).
- Lucasfilm Holocron and Leland Chee: https://www.starwars.com/news/what-is-the-holocron; canon tiers and post-2014 breaks: https://en.wikipedia.org/wiki/Star_Wars_canon — hierarchy-without-enforcement failure (P-3, W-7).
- Marvel Handbook / continuity-editor role: https://en.wikipedia.org/wiki/Official_Handbook_of_the_Marvel_Universe; DC Crisis propagation failures: https://en.wikipedia.org/wiki/Crisis_on_Infinite_Earths (individual post-Crisis incidents corroborated via community synthesis, https://www.reddit.com/r/comicbooks/comments/1mx42h6/ — secondary) — "retcon without propagation cascades," the historical argument for the shock cone.
- Script coordinator role: https://scriptation.com/blog/whats-a-script-coordinator/; soap continuity decay without an archivist: https://home-and-away-soap-opera.fandom.com/wiki/Continuity_Errors (fan-compiled; used only for the role-absence observation).
- Blizzard historian team: https://gameinformer.com/2018/08/14/a-look-inside-how-blizzard-maintains-world-of-warcrafts-lore; https://www.engadget.com/2013-09-12-a-day-in-the-life-of-blizzard-historian-sean-copeland.html; CDPR Lore Master posting: https://sportstechjobs.com/lore-master-cd-projekt-red/68caf3c6baf58edd9ca0d95a (cached; original delisted) — the salaried-role evidence behind P-3.
- Destiny Grimoire lesson (lore detached from point of use): https://www.pcgamer.com/destiny-2-will-not-use-grimoire-cards-to-tell-its-story/ — §6.1 doctrine-at-point-of-use.
- Nearest neighbors: Novelcrafter Codex (time-scoped "Progressions"): https://www.novelcrafter.com/features/codex; Sudowrite Story Bible: https://docs.sudowrite.com/using-sudowrite/1ow1qkGqof9rtcyGnrWUBS/what-is-story-bible/jmWepHcQdJetNrE991fjJC; Fantasia Archive two-way relations: https://fantasiaarchive.com/ — the "closest attempts" register (P-4).

### Mixed-initiative, ownership, consistency, provenance, and process literature

- Horvitz, "Principles of Mixed-Initiative User Interfaces," CHI 1999: http://erichorvitz.com/chi99horvitz.pdf — framing for W-1's zero-proactive-initiative stance.
- Yannakakis, Liapis & Alexopoulos, "Mixed-Initiative Co-Creativity," FDG 2014: http://www.fdg2014.org/papers/fdg2014_paper_37.pdf; Liapis et al. (Sentient Sketchbook): https://antoniosliapis.com/papers/can_computers_foster_human_users_creativity.pdf — AI-as-stimulus without write access (P-2/W-1).
- Yuan et al., "Wordcraft," IUI 2022: https://dl.acm.org/doi/10.1145/3490099.3511105; Ippolito et al., arXiv:2211.05030 — ownership survives assistance when the human transforms; user-authored controls (W-1 editable prompts).
- Mirowski et al., "Dramatron," CHI 2023: https://dl.acm.org/doi/10.1145/3544548.3581225 — staged, human-vetted decomposition (W-1, §6.6).
- Anderson, Shah & Kreminski, C&C 2024: https://dl.acm.org/doi/10.1145/3635636.3656204; Doshi & Hauser, *Science Advances* 2024: https://www.science.org/doi/10.1126/sciadv.adn5290 — homogenization and reduced felt responsibility (P-2; divergent-options prompt design).
- Buçinca, Malaya & Gajos, CHI 2021: https://www.eecs.harvard.edu/~kgajos/papers/2021/bucinca21trust.pdf — cognitive forcing functions reduce over-reliance; users dislike them (P-2, W-2 friction calibration).
- Draxler et al., "The AI Ghostwriter Effect," TOCHI 2024: https://dl.acm.org/doi/10.1145/3637875 — ownership tracks influence/control (P-2 mechanism).
- Amershi et al., "Guidelines for Human-AI Interaction," CHI 2019: https://dl.acm.org/doi/10.1145/3290605.3300233 — standard vocabulary for dismissal/correction affordances (W-1).
- Sarkar, "AI Should Challenge, Not Obey," CACM: https://cacm.acm.org/opinion/ai-should-challenge-not-obey/ **[opinion piece]** — converges with `20`'s ask-for-pressure discipline.
- Li et al., "ContraDoc," NAACL 2024: https://aclanthology.org/2024.naacl-long.362/ — LLMs useful-but-unreliable at contradiction detection (advisory-only contradiction hunter, §6.6); "ConStory" long-form consistency benchmark, arXiv:2603.05890 **[recent preprint]** — error accumulation with corpus size (argument for admission-time propagation).
- Ammanabrolu & Riedl, KG world models: arXiv:2106.09608; Riedl, Automated Story Director: https://faculty.cc.gatech.edu/~riedl/pubs/tidse06a.pdf — drama management as architectural ancestor of propagation, with the automated intervenor deliberately replaced by the steward.
- Chung & Kreminski, "Patchview," UIST 2024: https://dl.acm.org/doi/10.1145/3654777.3676352 — persisted user corrections should steer future assistance (implemented via prompt context, §6.6).
- W3C PROV-DM: https://www.w3.org/TR/prov-dm/ — T-5 provenance shape (also cited by the package's own `23`).
- Hoque et al., "The HaLLMark Effect," CHI 2024: https://dl.acm.org/doi/10.1145/3613904.3641895 — provenance visualization increases control/ownership (T-5).
- Post-hoc AI-text detection unreliability: OpenAI classifier withdrawal and detector bias coverage: https://technicaeditorial.com/the-unseen-biases-of-ai-text-detection-software/ — capture-at-authorship argument (T-5).
- Haynes et al., NEJM 2009: https://www.nejm.org/doi/full/10.1056/NEJMsa0810119; Urbach et al., NEJM 2014: https://www.nejm.org/doi/full/10.1056/NEJMsa1308261 — the two-sided checklist evidence behind W-7.
- Resnick et al., "Design Principles for Tools to Support Creative Thinking," 2005: https://www.cs.umd.edu/hcil/CST/Papers/designprinciples.pdf; Blackwell & Green, Cognitive Dimensions: https://www.cl.cam.ac.uk/~afb21/publications/BlackwellGreen-CDsChapter.pdf — premature-commitment/viscosity tension and P-5's draft-space resolution.
- Wizards vs. forms (practitioner): https://www.uxmatters.com/mt/archives/2011/09/wizards-versus-forms.php **[thin evidence]** — flow-shape fit, flagged as such in P-5.
- BYO-model practitioner pattern: https://www.memexlab.ai/blog/bring-your-own-llm; https://www.techradar.com/pro/your-ai-your-rules-why-byo-llm-bring-your-own-llm-is-the-future **[thin evidence]** — Q-6 context only; no recommendation rests on it.

*Negative finding, reportable:* no academic study of deliberately clipboard-mediated (API-less) LLM integration was found. The prompt-out/paste-in architecture appears novel as a studied pattern; its justification in this report is design reasoning from the sovereignty requirement plus the local-first ideals, and it is an evaluation opportunity once the app exists.

---

## Self-check against the brief

- Every §2 path read: both READMEs, all 58 package files, both trial logs, **all** artifacts in both trial-world directories (sampled-files inventory in §2), and the three `docs/agents/` files. ✔
- `git rev-parse HEAD` run at start; no divergence from `b317f2a6…`; pre-existing working-tree changes surfaced, not owned. ✔
- No recommendation contradicts `01`, `03`, or `20`; the three near-tensions are resolved without amendment in §8; no amendment owed. ✔
- All §3 settled intentions honored; the three `assumption:` items restated in §3 of this report; none re-opened. ✔
- No code path by which LLM-generated text becomes canon without explicit admission (P-2, W-1, §5.3 advisory store); no LLM APIs or vendor coupling anywhere in the principles. ✔
- Storage recommendation covers all 19 template record types, the checklist runs, the pass report, the QA scorecard, and every trial-exercised lifecycle behavior (§5.3 table). ✔
- Every external claim shaping a decision carries a citation (§10), with evidence-strength flags. ✔
- Glossary vocabulary used throughout; the six-concept separation preserved as schema facets (T-2), never flattened. ✔
- This session wrote exactly one file (this report), modified nothing else, committed nothing. ✔
