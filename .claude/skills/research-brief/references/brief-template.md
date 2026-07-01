# Brief template & target-type reads

This file defines (A) the canonical anatomy of the emitted ChatGPT-Pro prompt and (B) the
research-target → load-bearing-reads map. The SKILL.md flow references both.

---

## A. Canonical brief anatomy

The emitted file `reports/<topic>-research-brief.md` is the *prompt the user pastes into
ChatGPT-Pro Session 2*. It is self-contained: Session 2 sees only this prompt plus the
uploaded manifest. Use these eight sections, in order. Scale each to the target; omit a
section only when genuinely N/A and say so.

### 1. Context

One or two sentences. Begin with the manifest pointer, then repo identity, then the **exact
fetch-baseline commit** Session 2 must read every file from (the verified repo HEAD per the
SKILL.md Step 6 baseline-commit rule — never a commit string copied from a report without
confirming it contains the §2 read-list). Example shape:

> The uploaded manifest is the path inventory of the `<owner>/worldloom-studio` repo — a web
> app to create and maintain fictional worlds from a continuity and causality perspective.
> [State the repo's authority order among docs if one exists; otherwise: root README →
> architecture/design → specs/roadmap → reference.] Fetch every file from commit `<HEAD>` —
> the manifest reflects that tree. (If a referenced report cites a different "commit of
> record," note the divergence here and use the verified HEAD, not the report's string. If you
> then reassure Session 2 that a predecessor's findings carry forward *because the target files
> are unchanged between the report's commit and the new baseline*, that is a factual claim —
> verify it with `git diff --stat` before writing it, per the Step 6 baseline-commit rule,
> never assert it from memory.)

If this brief **continues a prior one** (a follow-up to earlier research), name the predecessor
`reports/<...>-research-brief.md` and state what it already delivered, so Session 2 treats this
as a *delta* — not a cold start — and does not re-commission completed work. If the campaign
chains several prior sessions, name each, state what each delivered, and identify which is the
**freshest / most-specific seed** for this pass.

Distinguish a **lineage predecessor** (a prior brief on the *same* line, framing the delta —
name it here in §1) from a **structural precedent** (a prior brief reused only as the *shape
model* — list it in §2 as a structural-model read, not a delta seed). A single pass can carry
both; keep their roles separate.

**Stable-slug iterations overwrite their own predecessor.** When the deliverable is an iterative
overhaul whose topic slug is stable (e.g. `<topic>-research-brief.md` re-issued each iteration),
this run's Write *overwrites* the prior brief — so there is no distinct predecessor file left to
name. In that case the durable lineage record is the **repo's own changelog/overhaul doc** (e.g.
a package's `00_overhaul_notes.md`) that captures what the last iteration delivered; cite *that*
in §1 as the delta seed, not a prior brief filename that no longer exists after this write.

**Greenfield / cold-start.** When the repo has little existing structure, say so plainly here
and frame the task as *design from first principles* grounded in the repo's stated purpose (its
README) rather than a delta over prior work. There is no shame in a short §2 — lean §5's
mandate harder instead.

### 2. Read in full (authority order)

An explicit, ordered path list — every file Session 2 must read before producing — each with a
one-line reason it is load-bearing *for this target*. Built from Step 2 exploration. Order by
the repo's own authority tier if it defines one; otherwise root→detail (overview → architecture
→ specs → reference). Example shape:

```
Read these in full, in this order:

README.md — repo purpose and scope.
docs/<overview> — the design intent this target extends.
docs/<architecture-or-design file> — the subsystem contract this target depends on.
src/<module> — the code seam this target touches (name it; Session 2 reads it).
reports/<report> — prior finding-set this target builds on.
```

**Boundary-awareness reads.** When a scoped target must read adjacent docs *only* to know what
is **out** of scope, mark those entries as *boundary-awareness (read to bound scope, not a
conformance target)* — distinct from *primary (load-bearing)* entries. This stops Session 2
from auditing or "correcting" code the scope intentions exclude. Call out the primary entries
explicitly; group the rest with the boundary-awareness purpose stated once.

### 3. Settled intentions

The decisions the interview resolved — the heart of why Session 2 is *locked*. State each as a
committed decision, not an option. This section pre-empts every clarifying question Session 2
might otherwise ask. Carry any early-exit gaps here as `assumption: <X>` lines so they read as
defaults the user can override, not as open questions.

When the interview settles a dimension **out of scope** — a decision the user has already made
elsewhere — state it as a *negative* settled intention: name the dimension, cite what settled
it, and instruct Session 2 not to re-open it; reinforce it in §6 as a scope guard. A locked
Session 2 will otherwise re-raise exactly what a prior pass flagged, so the exclusion must be
explicit, never implied by silence.

### 4. The task

A precise statement of what Session 2 must achieve — the goal behind the deliverable. One tight
paragraph. Name the target type (new spec/feature / thorny fix / hardening / overhaul).

### 5. Exploration + online-research mandate

Authorize depth explicitly:

> Explore the repository as deeply as needed beyond the files listed above. Research online as
> deeply as needed — similar implementations, research papers, prior art — wherever it sharpens
> the deliverable. Cite sources for any external claim that shapes a decision.

### 6. Doctrine & constraints

Pointers Session 2 must honor — **derived from this repo's own exploration, not imported from a
template.** Typical shapes (include only those the target actually engages):

- If the repo defines an authority order among its docs, state it: higher-tier docs govern
  lower ones; a genuine divergence requires amending the higher tier first, never designing
  against it silently.
- If the repo has an invariants / constitution / design-principles doc, name it and state that
  every product-behavior decision must satisfy it.
- Domain constraints the target engages (for this repo, e.g. continuity and causal consistency
  of the fictional-world model) — stated as this repo actually frames them, not assumed.
- Engineering constraints in force (e.g. no backwards-compatibility shims in new work, test
  coverage expectations) — only if the repo establishes them.

Trim to the constraints the target actually engages. If exploration finds no established
doctrine yet (greenfield), say so and let §5's mandate carry the design rationale instead of
manufacturing constraints.

### 7. Deliverable specification

Exactly what Session 2 outputs — leave no ambiguity:

- each **downloadable markdown document**, by filename and whether it **replaces** an existing
  file or is **new**;
- for replacements, name the file being replaced and what must be preserved vs. changed;
- if the deliverable is a **numbered/indexed spec**, derive its number/path from the repo's live
  spec index or roadmap (not from an archive), continue the visible sequence, and carry any
  residual placement ambiguity as a labeled `assumption:` line rather than asserting it;
- for an **iterative-overhaul line**, a companion outlook/assessment report's filename increments
  with the iteration number (e.g. `sixth-iteration-outlook.md` → `seventh-iteration-outlook.md`);
  name the incremented file and still carry it as a labeled `assumption:` line so the user can rename;
- the **locked / no-questions** instruction, verbatim intent:

> Produce the deliverables directly as downloadable markdown documents. Do not interview, do not
> ask clarifying questions — the requirements above are final. If a genuine contradiction makes
> a requirement impossible, state it in the deliverable and proceed with the most faithful
> interpretation.

**Determination-plus-conditional targets.** When the research target is "decide whether X is
needed, and *if so* produce X" (common for hardening passes), the deliverable is contingent on a
judgment Session 2 must make first. Do not leave the contingency implicit. The brief must (a)
instruct Session 2 to produce a clearly labeled, evidence-based **determination / verdict** ("is
X warranted, and why"), and (b) state — as a settled intention resolved in the interview — which
of **three** modes governs the artifact: (i) **unconditionally** (one always-produced document
with the verdict embedded as a section); (ii) **only if the verdict is positive** (nothing
authored on a negative verdict — the reasoned verdict is still surfaced as Session 2's response,
but no file); or (iii) **always produce, form follows the verdict** (one document is always
produced, but its *shape* depends on the verdict — e.g. a full spec if warranted, a standalone
rationale report if clean; this mode needs both Branch A / Branch B shapes specified in §7).
Prefer (i) when the artifact's value survives a negative verdict (it locks already-correct
properties); choose (iii) when a negative verdict still warrants a substantial document in a
*different form*; reserve (ii) for when a negative verdict means there is genuinely nothing to
author.

**Analysis / recommendation report (not a ratified artifact).** When the deliverable is a
consolidated report of *recommended changes* rather than a ratified spec/doc — the recurring
output of a doc-overhaul pass or a hardening pass whose ask is "what to change + where" — say so
explicitly, and specify the report(s) by filename, **new** (not a replacement). Direct Session 2
to deliver **substance + home, not ratified text**: for each finding, *what the target doc must
own* (Session 2's own prose, at the right altitude) and *which file* it lands in (new section /
addition / correction) — explicitly **without** final paste-ready wording or invented
identifiers, which remain the repo's own reassess/amend process. Carry a labeled `assumption:`
line if the report's filename or placement is not pinned in the interview.

### 8. Self-check

A short acceptance checklist Session 2 runs against its own output before returning — e.g. every
replacement preserves the load-bearing content of the original; no new doctrine weakens an
upstream doc tier; every external claim is cited; the deliverable set matches §7 exactly; the §1
fetch-baseline commit contains every file named in the §2 read-in-full list.

---

## B. Target-type → load-bearing reads

A starting map for §2; always refine against Step 2 exploration. This repo has no fixed doc
taxonomy — describe the *kinds* of reads to seek out and resolve them against the actual tree.
`README.md` (and any repo-wide invariants/design-principles doc) is load-bearing for every type.

| Target type | Load-bearing reads to seek out (beyond README) |
|---|---|
| **new-spec / new-feature** | the architecture/design doc for the touched area; any spec index, roadmap, or ledger; sibling specs/features; the existing code seams for that area. |
| **thorny-fix** | the design contract for the affected area; the relevant code seams; any report/issue notes touching the defect; the tests covering it and the acceptance the fix must still satisfy. |
| **hardening** | the invariants / constraints the system must uphold; the subsystem's design + code seams; prior hardening notes or reports; the validation / test coverage. A hardening pass can deliver *either* a recommendation report or a numbered implementation spec — the ask decides (§7); for a spec deliverable, union in the **new-spec** row's reads via a `(secondary: new-spec)` classification. |
| **foundational / doc-overhaul** | the doc tier being overhauled plus every tier above it in the repo's authority order (authority flows downward); the doc index / authority map; cross-references in lower tiers that the overhaul will invalidate (read as **boundary-awareness** to run the tier-fit test — what belongs at this altitude vs. elsewhere — and route out-of-scope findings forward rather than amending them here). |
| **other** | derive entirely from exploration; default to README plus whatever the target names. |
