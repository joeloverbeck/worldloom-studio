---
name: research-brief
description: "Use when you need to hand a research task to a separate deep-research executor — ChatGPT-Pro (remote-fetch) or another Claude/Claude Code session with direct repo access (local-session) — and want the comprehensive prompt authored here, with full repo access, instead of reconstructing it in a throwaway session. Interviews you to ~95% confidence, then emits a self-contained, paste-ready requirements prompt and (remote-fetch executor only) refreshes the upload manifest. Triggers: needing a next spec/feature, a thorny fix, a hardening pass, or a foundational/doc overhaul deep-researched in another session. Produces: reports/<topic>-research-brief.md + (remote-fetch) a refreshed reports/manifest_<date>_<shortsha>.txt. Mutates: only reports/ on user approval."
user-invocable: true
arguments:
  - name: research_target
    description: "What the deep-research executor (ChatGPT-Pro, or a named local session) should produce — the thing to be deep-researched (string). A sentence is fine; the skill sharpens it through exploration and interview."
    required: true
  - name: reference_path
    description: "Optional path to a report, finding-set, or analysis to fold into the brief as established context."
    required: false
---

# Research Brief

Author the comprehensive, paste-ready prompt for a **separate deep-research session** — ChatGPT-Pro by default, or another Claude/Claude Code session — here, where Claude has direct access to the whole repository, instead of reconstructing it interactively in the consuming session.

This skill replaces **"Session 1"** of a two-stage routine:

- **Session 1 (replaced by this skill)**: explore the repo, interview the user to ~95% confidence about their *actual* intent, then author a requirements-style prompt.
- **Session 2 (the actual deep researcher — ChatGPT-Pro by default)**: receives the emitted prompt (plus, remote-fetch, the uploaded manifest), explores and researches online as deeply as needed, and **produces the deliverable directly** — it does not re-interview.

The emitted brief is **self-contained**: Session 2 has none of this session's context, so everything it needs must live in the prompt plus the uploaded manifest (remote-fetch) or the repository itself (local-session).

**Executor channels.** ChatGPT-Pro is the default consumer (**remote-fetch executor**: uploads the manifest, fetches every file from a pinned commit). When the target names a **local-session executor** — another Claude/Claude Code session with direct repo read/write access — the same flow applies with the channel adaptations in `references/brief-template.md` §C: no manifest upload, live-tree instead of pinned-fetch semantics, and adjusted Step 6/7 handling. "Session 2" throughout this skill means the executing session, whichever channel it is.

<HARD-GATE>
Do NOT Write the brief file or refresh the manifest until BOTH hold:
(a) confidence has reached ~95% — via the interview, OR via an early-exit — explicit ("just go") or implicit (user unavailable; Step 4 §Early exit) — with remaining gaps written into the brief as explicit, labeled assumptions, OR because scope arrived pre-settled from exploration alone (Step 4 §Interview-skip; carry any residual gaps as labeled assumptions); AND
(b) the Step 5 brief outline + settled-intentions summary has been presented in chat and the user has approved it (silence on a section while answering other questions counts as approval; an explicit objection re-opens that section and requires re-presenting the correction first). If the user is unavailable — an `AskUserQuestion` timeout, or an autonomous run where blocking is not an option — (b) converts from a blocking request into a record: still present the outline in chat, proceed without approval, and flag every unapproved assumption prominently in the Step 7 summary so the user can correct it before using the brief. On such runs the mid-turn outline text may never render to the user — the outline's substance must be recoverable without it: the brief's §3 plus the Step 7 summary must together carry every settled intention, assumption, and flag the outline presented.
The skill mutates only `reports/`. It NEVER edits `docs/`, `specs/`, `.claude/skills/`, or source code.
</HARD-GATE>

## Invocation

```
/research-brief "<what Session 2 should deep-research>"   [reference_path]
```

## Step 1: Classify the research target

First, read `references/brief-template.md` in full — §A is the canonical brief anatomy you author to in Step 6, and §B is the target-type→reads map you apply in this step. Read the template directly so the brief is anchored to the canonical anatomy.

Then read `research_target` (and `reference_path` in full if given). Classify into one type — this selects the load-bearing "read in full" set for Session 2 (the type→reads map is §B of `references/brief-template.md`):

- **new-spec / new-feature** — what to build/create next for the repo.
- **thorny-fix** — diagnose and resolve a stubborn defect or design knot.
- **hardening** — strengthen an existing system against drift, regression, or weak proof.
- **foundational / doc-overhaul** — overhaul a doc/design tier (or the cascade from an upstream change).
- **other** — anything else; build the read set from exploration alone.

Announce the classification on its own line as your **first user-facing output** — after reading the template but **before any Step 2 repo-content exploration** — emit `Classification: <type>` so the audit trail records it. (The template read is the prerequisite for classifying and is exempt. Read-only baseline git calls — `git rev-parse`, `git status`, `date` — are setup, not repo-content exploration, and may run before the line. Read-only **path/tree listing** for orientation — `git ls-tree`, `find`, `glob` — is likewise setup, not exploration; the gate is reading file *contents*, not enumerating paths. Reading the **seed/reference file itself** — the positional `reference_path` or a file cited by path inside `research_target` — is also exempt.) When ambiguous, give a one-sentence justification.

A target may carry a **dominant type plus a secondary** (e.g. a hardening pass whose deliverable is a new spec). When so, classify by the dominant type to pick the primary read-set, union in the secondary type's load-bearing reads, and name both: `Classification: <dominant> (secondary: <type>)`. When exploration later surfaces a secondary the first announcement could not have named, you may emit a single `Classification refined: …` line once, after the relevant Step 2 reads and before the Step 5 gate. Refine at most once.

**Executor classification.** Alongside the target type, classify the brief's consumer: **remote-fetch** (default — a ChatGPT-Pro deep-research session that uploads the manifest and fetches every file from a pinned commit) or **local-session** (the target names an executor with direct repo access — e.g. "you in another session", a Claude Code session on a named model). Announce a non-default executor on the Classification line: `Classification: <type> (executor: local-session)`. The executor selects the channel adaptations for the brief's anatomy (`references/brief-template.md` §C), the Step 6 manifest handling, and the Step 7 handoff wording; everything else — exploration, interview, gate, locked/no-questions — is channel-independent.

## Step 2: Explore the repo to ground the brief

The point of authoring here is that Claude can read the repo directly — so the *user never types out what the researcher should read*. Build, from exploration:

- the **authority-ordered read list**. If the repo defines an explicit authority order among its docs, order §2 by it; otherwise infer a sensible root→detail order (README / overview → architecture / design → specs / roadmap → reference), then relevant `reports/`, `specs/`, `archive/`. Each entry gets a one-line reason it is load-bearing for *this* target.
- the **relevant code seams** Session 2 should inspect (name files/modules, don't paste them — Session 2 reads them itself);
- any **prior report / spec / archived work** that already bears on the target, so the brief frames the task as a delta rather than a cold start. When the target is a follow-up to an earlier brief, name the predecessor `reports/<...>-research-brief.md` explicitly and state what it already delivered (see `references/brief-template.md` §1) so Session 2 does not re-commission completed work.

Launch Explore agents for broad surveys; read individual files directly. Verify any repo claim in `research_target` or `reference_path` against the actual tree; flag contradictions prominently.

**Greenfield note.** This repo may have little or no code/docs yet. When the read list would be near-empty, say so plainly in the brief and lean §5's exploration/online-research mandate harder — the brief then commissions *design from first principles* grounded in the repo's stated purpose (its README), not a delta over existing structure.

## Step 3: Light online research (optional)

Only to **sharpen scope and interview questions** — surface the named techniques, prior art, or decision axes the interview should resolve. The *deep* research is Session 2's job; do not do it here. Announce run-or-skip as a one-liner (e.g. "Online research: skipped — repo-internal realignment" / "Online research: run — sharpening prior-art on continuity graphs"). **The research is optional; the run-or-skip announcement is not** — emit it either way, as a peer of the Step 1 `Classification:` line.

The announcement is a binary `run`/`skip` **committed at emit time**, never a hedge. If you cannot commit at Step 3, emit nothing yet and defer the line until after exploration, then emit the committed line — but it must precede the Step 5 gate. ✗ "will decide after exploration" ✓ "skipped — repo-internal" / "run — sharpening prior art".

## Step 4: Interview to ~95% confidence

Reach **~95% confidence about what the user actually wants** — not what they think they should want — before drafting. Display this block after each answer. When sending a batched `AskUserQuestion`, emit the block immediately before the batch and again after the answers (the after-block is subsumed only when the answers reach threshold, in which case the "95% — drafting the brief" announcement replaces it):

```
Confidence: X%
Gaps: [specific remaining unknowns]
```

**Which path (pick before drafting):** (a) *Full discovery interview* — scope is open; ask sequential/batched questions to 95%. (b) *Tight bounded round* — scope is largely pre-settled but residual decisions still materially shape the deliverable; pre-settle what is fixed and ask only those decisions as one `AskUserQuestion` batch. (c) *Skip straight to the Step 5 gate* — scope is fully pre-settled and no shaping decision remains. The Step 5 present-and-approve gate fires regardless of path. A blend is normal.

Rules: ask one *conceptual* question at a time when probing motivation or uncertainty sequentially, where each answer reshapes the next; but batch independent, already-scoped bounded choices into a single `AskUserQuestion` call (≤4 questions). A reshaping conceptual question may ride in a batch with bounded ones only when the bounded options stay valid across every plausible answer to it (with recommendations supplied); otherwise ask the reshaping question standalone first. Prefer bounded multiple-choice. Probe motivation before solution; challenge premature specificity; name uncertainty specifically; respect demonstrated expertise and "you decide" delegation (re-evaluate and recommend, don't re-ask). Confidence rises from both answers and exploration findings; note which gaps each closes. Between every two consecutive question rounds, re-display the `Confidence / Gaps` block first. Announce "95% — drafting the brief" when reached.

**Early exit — explicit**: if the user says "just go," announce current confidence by re-displaying the `Confidence / Gaps` block one final time, and carry the remaining gaps into the brief as labeled assumptions (`assumption: X`) so Session 2 — which will not ask — treats them as decisions the user can later correct.

**Early exit — implicit (user unavailable)**: if an `AskUserQuestion` times out or the run is autonomous and blocking is not an option, do not stall the run and do not re-ask. Adopt your own recommended answers, convert every unresolved gap and adopted recommendation into labeled `assumption:` lines, re-display the `Confidence / Gaps` block one final time, and proceed to Step 5 — where the outline is presented as record rather than as a blocking request (HARD-GATE (b)). Flag the unapproved assumptions prominently in the Step 7 summary so the user can correct them before using the brief.

**Interview-skip (exploration-settled).** When exploration alone brings confidence to ≥95% before any question, skip the discovery interview: announce the confidence level on its own line (e.g. `Confidence: 95% — drafting the brief`), carry any residual gaps as labeled assumptions, and proceed straight to the Step 5 outline gate. Re-confirm only a gap that materially changes the deliverable's shape, and do so inside the Step 5 outline. The Step 5 present-and-approve gate still fires and remains the real checkpoint; skipping the interview never skips it.

## Step 5: Present the brief outline (HARD-GATE)

Before writing, present in chat:

1. the **settled intentions** — the resolved decisions the interview produced (these become §3 of the brief and are what make Session 2 "locked");
2. the **deliverable spec** — exactly which downloadable markdown docs Session 2 must produce (replace vs. new, filenames); for *determination-plus-conditional* targets ("decide if X is needed, and if so produce X"), state both the required verdict and which of the three production modes governs the artifact (see `references/brief-template.md` §7);
3. the **read-in-full list** (authority-ordered, with the one-line reasons). **Large-package economy:** when the read list is large (e.g. a full replacement package of dozens of files), you need not enumerate every entry with its reason in chat — present it by **authority tier + the flagged/priority targets + the boundary-awareness group** (reasons stated once per group), and defer the full per-file one-line reasons to the written §2. Full enumeration stays the default for small lists.

Before presenting, confirm both audit-trail announcements were emitted earlier this run: the Step 1 `Classification:` line and the Step 3 online-research run-or-skip one-liner. If either was missed, emit it now. Also confirm every path in the read-in-full list resolves at the fetch-baseline commit (`git ls-tree <baseline> <path>` / `git cat-file -e <baseline>:<path>`): drop or correct any that don't, so the list you present is the list Session 2 can actually fetch.

**Equivalence check (run it, don't paraphrase it).** When a seed or predecessor pins a **different commit** than the fetch baseline and you carry its findings forward (seam maps, `file:line` citations), run `git diff --stat <seed-commit> <baseline> -- <the §2 seam paths>` and write the carry-forward/equivalence sentence **directly from that output** — never from memory. An empty diff is the clean result: state plainly the seam files are unchanged across the range, and scope any carried claim to the files the diff confirms unchanged. If the diff is non-empty, scope the carried claim to the unchanged files and flag the rest. **Reused descriptive prose counts as carry-forward.** In a stable-slug iterative overhaul the predecessor brief's §2 read-list and §6 doctrine prose are reused near-verbatim while the package's files were changed *in place* between the predecessor's commit and the new baseline (same paths, new contents) — so any content-describing claim you inherit (counts like "N truth layers / N laws", per-file one-line summaries, "the 13-layer order") is itself a carry-forward subject to this check. Spot-verify each against the new baseline with a direct Read of the changed file — do not trust the predecessor's wording, and do not reflexively *hedge* it (dropping a still-correct "13" to a vague "the layers" is a needless precision loss, the mirror failure of propagating a stale count). A **same-baseline authoritative record** — e.g. a changelog's retention audit that directly asserts the carried claim, committed at the baseline you pin — satisfies the spot-verify *when the brief names it as the source*; fall back to a direct Read of the changed file when the record predates the baseline, is itself carried forward, or the claim is load-bearing enough that a wrong value would misdirect Session 2 before its own reads would catch it.

Get approval (per the HARD-GATE). Revise on pushback before writing. On an implicit early exit (user unavailable), the presentation stands as record and the run proceeds without approval — per HARD-GATE (b).

## Step 6: Write the brief and refresh the manifest

On approval (or on an implicit early exit, after presenting the outline as record), do BOTH — except that a **local-session executor skips item 2 by default**, see the local-session note below:

1. **Write the brief** to `reports/<topic>-research-brief.md`, following the canonical anatomy in `references/brief-template.md` §A (read in Step 1). `<topic>` is a short kebab-case slug of the target. Mind the one-word gap from the deliverable: the brief you write now is `<topic>-research-brief.md`, while the §7 deliverable Session 2 writes is often `<topic>-research-report.md` (same slug, `brief` vs. `report`). Do not conflate them when choosing the file path you Write, the §1 manifest pointer, or §7. Create `reports/` if it does not exist.
2. **Refresh the manifest**: write the current repository path inventory to `reports/manifest_<today>_<shortsha>.txt`, where `<today>` is the real current date (`date +%F`), `<shortsha>` is the fetch-baseline commit's short hash (`git rev-parse --short HEAD`), and the inventory is that exact commit's tree — `git ls-tree -r --name-only HEAD` (use the same `<baseline>` you pin in the brief's §1, not `git ls-files`, so the manifest provably equals the commit Session 2 fetches from). Name this exact file in the brief's §1 manifest pointer so Session 2 uploads the matching inventory. Leave older manifests in place for the user to clean; regenerate only when one already exists for this exact `<today>_<shortsha>`.

**Local-session executor: no upload bundle.** A local-session executor reads the repository directly, so the manifest has no consumer — skip the refresh by default and write only the brief; generate a manifest only if the user asks for a baseline snapshot. The brief's §1 then pins the baseline as the *authored-against* commit (with a verify-HEAD / work-from-live-tree instruction), not a fetch-from commit — see `references/brief-template.md` §C. The §2-completeness check below still applies (a dangling §2 path is broken in any channel); the fetch-oriented clauses of the baseline-commit rule apply only to remote-fetch.

**Baseline-commit rule (remote-fetch).** The brief instructs Session 2 to fetch every file from one exact commit, so the manifest must list exactly that commit's tree. Derive the fetch-baseline commit from verified repo HEAD (`git rev-parse HEAD`) at manifest-refresh time, and generate the manifest from that same commit (`git ls-tree -r --name-only HEAD`) — do NOT use `git ls-files`, which reflects the staged index and silently diverges from HEAD under any uncommitted add/delete/rename. If you do fall back to `git ls-files`, first confirm `git status --porcelain` is clean (or reconcile every listed delta) and note the check in the Step 7 summary. NEVER adopt a commit string copied from a report, doc, or `research_target` without confirming it contains every file in the §2 read-in-full list (`git ls-tree <commit> <path>` / `git cat-file -e <commit>:<path>`) — a "commit of record" cited inside a report is that report's *own* baseline and often predates later work. If a referenced source cites a different commit, call out the divergence inside the brief rather than propagating it.

**§2-completeness check.** Confirm every file in the §2 read-in-full list — including files discovered transitively, e.g. a predecessor report's own cross-references — actually exists at the baseline before presenting the list (Step 5) and before writing. A path present in your working tree but absent at the baseline (never committed, or cleaned up in an earlier commit) would ship as a dangling §2 reference and break Session 2's fetch — self-containment is the contract. Drop or correct any that do not resolve, and flag the contradiction. **Untracked load-bearing input:** a §2 path that is *untracked* (`??` in `git status`, fails `git cat-file -e HEAD:<path>`) cannot be fetched from the baseline. Do not reflexively drop it: if it is load-bearing (e.g. the seed the brief triages), reproduce it **verbatim inline in the brief** (an appendix) so it travels with the pasted prompt, and note in §1/§2 that it is inlined-because-untracked; if it is non-essential, drop it or ask the user to commit it and re-baseline.

Resolve both paths against the worktree root if in a worktree. Do NOT commit.

**Re-baseline vs. new iteration (both start from an existing brief + moved HEAD).** These two cases share a trigger — a brief already exists and HEAD has moved since it was written — but demand opposite actions, so decide which you are in *before* reaching for the shortcut below. A **mechanical re-baseline** is a re-issue of the *same ask*: the settled intentions still hold and only the baseline drifted (the user committed/merged/pushed under an unchanged request). A **new iteration** re-uses the same stable slug but carries *new* intentions — a fresh overhaul pass, a changed deliverable, reversed or added decisions. In this repo's iterative-overhaul workflow every pass matches the trigger (each iteration is committed, moving HEAD, before the next brief), yet most are new iterations, not re-baselines. When the intentions have changed at all, run the normal Step 1–4 flow and overwrite per the repeat-run rule below; the re-baseline shortcut does **not** apply.

**Re-baseline an existing brief (HEAD moved).** When a brief must be re-issued because HEAD has since changed (the user committed, merged, or pushed) — whether it was authored earlier this session **or by a prior run/session** — do **not** re-run the Step 1–4 interview if the settled intentions still hold; reuse them verbatim. Instead: (a) regenerate the manifest at the new HEAD (new `<shortsha>` → new filename, so it never overwrites the old one); (b) replace every commit string in the brief's §1, §7, and §8 with the new baseline; (c) re-resolve every §2 path against the new baseline (a committed rename may have relocated files; a previously-untracked inlined input may now be fetchable — add it as a normal §2 read); (d) re-run the §2-completeness check and grep the brief for the stale shortsha; (e) leave the superseded manifest in place.

**Repeat-run brief already at the target path.** When `reports/<topic>-research-brief.md` already exists from an earlier run or session (a stable-slug iterative deliverable overwrites its own predecessor), you must `Read` the existing file before writing — the Write validator rejects an unread overwrite. This is expected on any re-issue; recover by reading then overwriting, and see `references/brief-template.md` §1 for how to record the overwritten predecessor's lineage.

**Disambiguating multiple candidate predecessors.** When more than one prior brief in `reports/` could be the slug predecessor (e.g. `<topic>-research-brief.md` *and* `<topic>-overhaul-research-brief.md` both plausibly continue the line), do not guess — and keep two distinct roles separate, because they can point at different files:

- *File to overwrite* = the file whose slug **this run will write**. That is the only file this run's Write replaces.
- *Lineage seed* = the record that frames the delta. For a **stable-slug iterative overhaul** the lineage seed is the repo's own changelog (e.g. `00_overhaul_notes.md`) plus any durable companion outlook report the prior pass left in `reports/`, regardless of which brief is freshest — see the stable-slug note in `references/brief-template.md` §1; otherwise it is the freshest prior brief in the chain.

When the *slug to write* is itself ambiguous across candidates, resolve it by pairing each candidate brief with its manifest (mtime + the `manifest_<date>_<shortsha>.txt` baseline it names) and picking the most recent lineage step. Overwrite the slug file; surface any orphaned sibling brief explicitly in the Step 7 summary (so it is not left as a false lineage cue), and do not treat it as a second predecessor to reconcile.

## Step 7: Summarize

Report:

- the written files — remote-fetch: brief + refreshed manifest, the **upload bundle** for ChatGPT-Pro Session 2; local-session: the brief alone. When a local-session run's slug line previously ran remote-fetch, also name any manifest left over from that channel (especially one at the same baseline) as **now-orphaned** — the user can clean it or keep it deliberately, rather than a future reader taking it as a live workflow cue;
- a one-line reminder that Session 2 is **locked / no-questions** — remote-fetch: paste the brief, upload the manifest, and ChatGPT-Pro should produce the deliverable directly; local-session: start a fresh session and point it at the brief file;
- any labeled assumptions carried from an early exit, so the user can correct them before handing off — and, on an **implicit** early exit, a prominent flag that the outline was presented as record only and never approved;
- any point where the written brief deviates from the presented Step 5 outline (a label, filename, or decision the authoring itself revised) — name each divergence explicitly so the brief never silently contradicts its own presented record; on an interactive run, prefer re-presenting the correction before writing instead;
- the `reports/` files you just wrote always leave `git status` dirty (one or two new/modified `reports/` files — the manifest is a new untracked file, and the brief is untracked on a first run but shows as **modified** when a repeat run overwrites an existing brief at the same slug); this is **benign** and does **not** invalidate the §1 baseline — the manifest is `git ls-tree HEAD`, which excludes untracked files, so it still equals the pinned commit. Only a later commit/merge/push that moves HEAD does;
- if `git status` is otherwise dirty at write time — pending moves/renames affecting §2 paths, an untracked load-bearing input reproduced inline, or any other uncommitted change (pre-existing or appeared mid-session) — proactively warn the user that committing (or merging/pushing) will move HEAD and invalidate the §1 baseline, triggering the **re-baseline** sequence in Step 6.

This is an inline-completion deliverable — no next-steps menu. Surface any adjacent improvement spotted during exploration as a flagged note with a concrete trigger, not as scope creep.

## Guardrails

- **Self-containment is the contract.** Session 2 has none of this session's context. Every path, decision, constraint, and acceptance check it needs lives in the brief plus the uploaded manifest (remote-fetch) or the repository itself (local-session) — never implied.
- **This session authors; Session 2 researches.** Don't perform the deep research here. The brief *commissions* it — whichever executor channel consumes it.
- **Locked, no questions.** The emitted brief instructs Session 2 to produce directly and NOT interview or ask clarifying questions — the interview already happened here.
- **Mutates only `reports/`.** Never touch `docs/`, `specs/`, `.claude/skills/`, or source.
- **No scope inflation.** The brief commissions what was asked. Resist "while we're at it" additions to the deliverable spec.
- **Ground constraints in this repo, not a template.** Derive §6 doctrine & constraints from what exploration actually finds (this repo's own authority docs, invariants, conventions) — do not import constraints from another project.
