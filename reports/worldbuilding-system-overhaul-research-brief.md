# Deep-Research Brief — Causal Canon Worldbuilding System: Second-Iteration Overhaul

*Paste this entire document into a fresh ChatGPT-Pro deep-research session and upload the manifest named below. You (the researcher) have none of the context in which this brief was authored; everything you need is in this prompt plus the uploaded manifest. Produce the deliverables directly — do not interview or ask clarifying questions.*

---

## 1. Context

The uploaded manifest (`reports/manifest_2026-07-01_1bf6689.txt`) is the exact path inventory of the `joeloverbeck/worldloom-studio` repository — a web app "to create and maintain fictional worlds from a continuity and causality perspective." **Fetch every file you read from commit `1bf66899004c24e3d737c2daaa70ef30fb524f21` (short `1bf6689`); the uploaded manifest reflects that exact tree.**

The subject of this overhaul is the documentation package under **`docs/worldbuilding-system/`** — a self-contained, storage-agnostic worldbuilding methodology titled the **"Causal Canon Worldbuilding System."** It is a 32-file set (~5,160 lines): a 16-document numbered spine plus `README.md`, `manifest.json`, a `templates/` folder (9 reusable Markdown card/report schemas), and a `checklists/` folder (5 operational checklists).

**This is the second iteration of the package's authoring** — the docs already exist and are mature; you are overhauling them, not creating them from scratch. There is **no prior research brief** on this line (this is the first externally-commissioned research pass), so treat the *existing docs themselves* as the seed you are improving, not a delta over earlier research.

Authority order within the package (root → detail): the package `README.md` (overview + recommended-use flow) governs orientation; `01_core_theory.md` states the philosophy and operating laws that everything else must serve; the numbered spine `02`–`16` moves from conceptual model → protocols → QA → examples → workflow → reference; `templates/` and `checklists/` are the operational instruments that instantiate the spine. The repo-root `README.md` (two lines) establishes only that this package will *eventually* underpin a software app — but see the hard constraint in §3.1: **the package itself must stay agnostic of that fact.**

## 2. Read in full (authority order)

Read every file below completely before producing anything. The **entire package is load-bearing** because the deliverable replaces the whole set; there are no boundary-awareness-only reads here.

```
README.md                                                    — repo identity: this is the app repo, but the package stays app-agnostic (see §3.1).
docs/worldbuilding-system/README.md                          — package overview, recommended-use flow (new world / existing world), package map, "most important rule."
docs/worldbuilding-system/manifest.json                      — file inventory + version/created metadata to regenerate.
docs/worldbuilding-system/01_core_theory.md                  — philosophy + 10 operating laws + the Causal Canon cycle + smell tests. The doctrine all other docs serve.
docs/worldbuilding-system/02_world_model.md                  — the conceptual primitives (entity, actor, institution, capability, constraint, event, process, resource, claim, source, consequence, mystery), relation verbs, dependency classes, world-state health.
docs/worldbuilding-system/03_truth_layers_and_canon_governance.md — truth-layer ontology, canon-status labels, governance roles. The classification backbone.
docs/worldbuilding-system/04_domain_atlas.md                 — the 14 world domains facts ripple through + priority sweep order.
docs/worldbuilding-system/05_creation_protocol.md            — 10-phase world-bootstrap pipeline from kernel to factional coherence; antipatterns.
docs/worldbuilding-system/06_canon_fact_admission_protocol.md — the 18-step gate every new fact passes; fact types, severity levels, accept/constrain/branch/quarantine/reject decisions.
docs/worldbuilding-system/07_propagation_engine.md          — the shock-cone ripple algorithm, propagation mechanisms, branch types, stopping rules, the "why not everywhere / why not enemies / where are the fossils" tests.
docs/worldbuilding-system/08_institutional_and_economic_ripple_protocol.md — dual institutional + economic analysis protocol (Ostrom IAD + institutional economics), action arenas, synthesis sentence.
docs/worldbuilding-system/09_contradiction_retcon_and_mystery.md — contradiction taxonomy, repair operations, retcon types, mystery ledger.
docs/worldbuilding-system/10_narrative_and_game_extraction.md — deriving conflict types, character roles, and game mechanics from world facts without breaking the world.
docs/worldbuilding-system/11_quality_assurance_tests.md     — 22 QA tests with 0–3 scoring + green/yellow/red rubric.
docs/worldbuilding-system/12_worked_examples.md             — 4 full worked examples (raider-robots, dead-witnesses, alien visitation, cheap teleportation).
docs/worldbuilding-system/13_ai_assisted_workflow.md        — 8 AI analyst roles + prompt templates + failure-mode checklist (AI as proposer, never canonizer).
docs/worldbuilding-system/14_templates_index.md             — how the 9 templates fit together; field lists.
docs/worldbuilding-system/15_glossary.md                    — ~40 shared-terminology entries.
docs/worldbuilding-system/16_research_notes_and_bibliography.md — research provenance (systems thinking, institutional analysis/economics, social-ecological systems, storyworld theory, knowledge representation/belief revision, magic-system & game-design craft), exemplar settings, research→system translation rules.
docs/worldbuilding-system/templates/world_kernel.md         — world seed schema.
docs/worldbuilding-system/templates/canon_fact_card.md      — per-fact record.
docs/worldbuilding-system/templates/capability_card.md      — capability record.
docs/worldbuilding-system/templates/institution_card.md     — institution record.
docs/worldbuilding-system/templates/action_arena_card.md    — Ostrom action-arena record.
docs/worldbuilding-system/templates/propagation_report.md   — canonical propagation output.
docs/worldbuilding-system/templates/contradiction_report.md — contradiction record.
docs/worldbuilding-system/templates/mystery_ledger_entry.md — mystery record.
docs/worldbuilding-system/templates/canon_change_proposal.md — change-proposal record.
docs/worldbuilding-system/checklists/frontloaded_seed_audit.md      — ensures seed facts propagate as deeply as later facts.
docs/worldbuilding-system/checklists/canon_fact_gate.md             — quick fact-admission gate.
docs/worldbuilding-system/checklists/propagation_sweep.md           — propagation completeness sweep.
docs/worldbuilding-system/checklists/institutional_economic_sweep.md — institution/economy sweep.
docs/worldbuilding-system/checklists/mystery_preservation.md        — mystery-protection sweep.
```

## 3. Settled intentions (final — do not re-open)

These decisions are fixed. They pre-empt every clarifying question you might otherwise ask.

**3.1 — Storage- and software-agnostic (HARD, NEGATIVE constraint).** The package must remain *completely* agnostic of the fact that it will later underpin a software app. **Do not** introduce data schemas, database tables, JSON/YAML data models, class diagrams, state machines, formal grammars, ID/primary-key conventions, API surfaces, or any formalization aimed at software implementation. The many controlled vocabularies already present (truth layers, canon statuses, fact types, domains, contradiction/retcon/mystery types, propagation branch types, relation verbs, AI roles, etc.) **stay exactly as what they already are — conceptual thinking-tools expressed in prose/lists**, not typed enums for a program. Software formalization is a deliberately deferred, *separate future pass*; this overhaul must not pre-empt or bias it. When you improve rigor, improve it as **worldbuilding craft and theory**, never as software specification. (The current package already models this stance — e.g. `02_world_model.md`: "These are not database tables"; `01_core_theory.md`: "It does not require software. It does not require an LLM." Preserve that stance.)

**3.2 — Full restructuring authorized.** You may renumber, merge, split, re-partition, delete, and add files across the whole set; regenerate `manifest.json` and the package `README.md` to match. You are not bound to the current 16-doc numbering or file boundaries — reorganize wherever it produces a cleaner, more coherent, more complete system. (This is latitude, not an obligation to churn: restructure where it genuinely improves the set, not for its own sake.)

**3.3 — Add new subsystem docs for genuine gaps.** Where your reading and external research reveal a real, load-bearing gap, author new documents to fill it. The survey of the current set flags these thin/absent areas as strong candidates (treat as leads to evaluate, not a mandated list): **temporal/timeline modeling** (no dedicated timeline/era-branching/causality-ordering protocol); **spatial/geographic propagation** (terrain → settlement → institution; spatial diffusion; regional variation); **character/agent psychology** (no character card or individual-psychology propagation guidance to complement institution-level modeling); **canon versioning & branching mechanics** (branch canon is a repair option but has no branch-tracking/continuity-diff protocol); **multi-author collaboration governance** (only AI workflow is addressed; no human propose/approve/dispute/merge-conflict process); **probability/uncertainty** (qualitative "disputed"/binary mystery only — no credence/degree-of-belief treatment); **aesthetic-coherence propagation** (Domain 14 is the thinnest; tone/genre/mood coherence is heuristic); **constraint composition semantics** (can constraints compose, conflict, chain?); **transmedial/context adaptation** (fiction vs. RPG vs. tabletop propagation differences); **counter-institution / suppression politics** (how factions actively distort or bury canon facts). Add only what earns its place; each new doc must serve `01_core_theory.md`'s doctrine.

**3.4 — Retention guarantee (HARD constraint).** Every piece of *valid* content in the originals must survive into the new set — preserved verbatim, relocated, or merged — never silently dropped or degraded. If you judge some content genuinely wrong or obsolete and remove it, that is allowed, but it must be *named and justified* in the changelog (§7). Ambiguous cases default to retention.

**3.5 — Maximize completeness & comprehensiveness.** The explicit goal is the most complete, comprehensive version of this system achievable, grounded in deep external research. Expand depth, close gaps, sharpen protocols, enrich examples, and strengthen the bibliography — while keeping the package usable (see §6 on not drowning craft in bureaucracy).

**3.6 — Reconcile known internal drift.** The survey found low-severity terminology drift to fix without losing meaning: (a) canon-status labels vs. repair/decision operations diverge across `03` (statuses incl. "revised"/"deprecated"), `06` (accept/constrain/branch/quarantine/reject), and `09` (repair ops incl. "split"/"diffuse unevenly") — unify the vocabulary or explicitly relate the vocabularies; (b) the glossary defines "shock cone" but the term appears nowhere else though the *concept* (propagation orders) is used throughout — either adopt the term across the propagation docs or retire it; (c) truth-layer ordering differs between `03` and `06` Step 3 — pick one canonical ordering; (d) the "accepted as local/rare/recent/secret/misunderstood" status proliferation reads as constraint-variants rather than distinct statuses — resolve the categorical redundancy. Fixing drift must not erase any distinction that is actually meaningful.

## 4. The task

This is a **foundational / doc-overhaul** pass. Analyze the entire Causal Canon Worldbuilding System package, then **produce a new, complete, self-consistent replacement for `docs/worldbuilding-system/**`** that is as correct, comprehensive, deep, and internally coherent as you can make it — retaining all valid original content, closing the gaps in §3.3, reconciling the drift in §3.6, and enriching the whole with deep external research into worldbuilding theory, comparable systems, and relevant scholarship. The result must stay a **storage- and software-agnostic worldbuilding methodology** (§3.1): a better version of what it already is, not a software spec.

## 5. Exploration + online-research mandate

Explore the repository as deeply as needed beyond the files listed above. **Research online as deeply as needed** — worldbuilding craft literature, comparable methodologies and toolkits (fiction bibles, RPG setting-design frameworks, wiki/canon-management practices), and the academic traditions the package already leans on and adjacent ones (systems thinking, institutional analysis & economics, social-ecological systems, storyworld/possible-worlds theory, narratology, knowledge representation & belief revision, historical anthropology, sociolinguistics/semiotics, game design). Bring in prior art and research papers wherever they sharpen a protocol, close a gap, or correct a claim. **Cite sources** for any external claim that shapes content (the current `16_research_notes_and_bibliography.md` is strong but has incomplete citations and is thin on linguistics/semiotics — improve it). Keep all research in service of worldbuilding craft, per §3.1.

## 6. Doctrine & constraints

- **Authority flows from `01_core_theory.md`.** Its premise ("once the world says a thing is possible, the rest of the world must respond"), its 10 operating laws, and "the most important rule" ("If this has been true, why is the world not already different?") govern the whole set. No new or revised content may weaken or contradict that doctrine; if research suggests amending the doctrine itself, do so explicitly and propagate the change downward, never design against it silently.
- **The package's self-description is a constraint**, not just prose: storage-agnostic, does not require realism / exhaustive simulation / a map before a story / hard magic / software / an LLM. It "requires consequences." Preserve this identity (§3.1).
- **Coherence over completeness-for-its-own-sake.** `01`'s Law 10 ("Coherence is not maximal explanation") applies to the *methodology itself*: added rigor and new docs must not bloat the system into unusable bureaucracy. Every protocol should stay a disciplined way to ask a living world's questions. Comprehensiveness (§3.5) means *covering what matters well*, not maximal formalism.
- **Internal consistency is mandatory.** Cross-references (docs cite each other by number/filename; templates and checklists reference protocols) must all resolve in the new set. Controlled vocabularies must be used consistently across every doc that references them.
- **Retention is auditable** (§3.4): the changelog must let a reader confirm nothing valid was lost.

## 7. Deliverable specification

Produce, as **downloadable files**, a **complete replacement set** for the `docs/worldbuilding-system/` package — i.e. the full overhauled system, ready to drop in wholesale. This is a **full replacement set**, not a recommendation report: author finished documents, not "suggested edits."

The set must include:

1. **The full document spine** — every numbered/topic document of the overhauled system, as downloadable Markdown, corrected + expanded + restructured per §3. You choose the final file names, numbering, and partition (§3.2); keep names descriptive and the numbering (if retained) contiguous.
2. **New subsystem documents** for the gaps you decide to fill (§3.3), as downloadable Markdown.
3. **The `templates/` set and `checklists/` set** — preserved and extended (add templates/checklists for any new subsystem docs, e.g. a character/agent card, a timeline/era entry, a branch-tracking or collaboration-decision record, if you author those subsystems).
4. **A regenerated `README.md`** (package overview, package map, recommended-use flow) reflecting the new structure, and a **regenerated `manifest.json`** listing every file in the new set with updated `version` and a `created`/`updated` date. (Bump `version` from `0.1`; keep the field set compatible with the existing manifest shape. Note: the manifest is JSON, everything else Markdown — this JSON file is a permitted, expected exception to "Markdown," not a violation of §3.1, since it is package metadata, not a software data model.)
5. **A changelog / old→new mapping document** (`CHANGELOG.md` or `00_overhaul_notes.md` — you choose) that makes the **retention guarantee auditable**: for each original file, where its content went in the new set; every merge, split, rename, addition, and (justified) deletion; and a short rationale for each significant structural or substantive change, with citations for research-driven changes. This is the artifact that proves §3.4 was honored.

Deliver the files so they can be downloaded and committed directly into `docs/worldbuilding-system/`.

**Locked / no-questions instruction:** Produce the deliverables directly as downloadable documents. Do not interview, do not ask clarifying questions — the requirements above are final. If a genuine contradiction makes a requirement impossible, state it inside the changelog and proceed with the most faithful interpretation.

## 8. Self-check (run against your own output before returning)

- [ ] Every file listed in §2 was read in full from commit `1bf6689`, and every piece of valid original content is preserved, relocated, or merged into the new set — with the changelog documenting where each went (§3.4).
- [ ] No introduced content assumes or specifies a software implementation: no schemas, tables, JSON/YAML data models, state machines, IDs/enums-for-code, or APIs. The package still reads as a storage- and software-agnostic worldbuilding methodology (§3.1). (The regenerated `manifest.json` is package metadata, not a data model — permitted.)
- [ ] The overhaul honors `01_core_theory.md`'s doctrine; any doctrine change is explicit and propagated downward, not silent (§6).
- [ ] The §3.6 drift items are reconciled (canon-status vs. repair vocab; "shock cone"; truth-layer ordering; "accepted as X" proliferation) without erasing any meaningful distinction.
- [ ] New subsystem docs (§3.3) each earn their place and serve the core doctrine; the system did not bloat into unusable bureaucracy (§6, Law 10).
- [ ] Every cross-reference between docs, templates, and checklists resolves in the new set; controlled vocabularies are used consistently across all docs.
- [ ] Every external claim that shaped content is cited; the bibliography is expanded and its citations completed.
- [ ] `README.md` and `manifest.json` are regenerated to match the new file set exactly; the changelog/mapping document is present and complete.
- [ ] The deliverable set matches this §7 exactly and is downloadable.
