---
name: to-issues
description: Break a plan, spec, or PRD into independently-grabbable issues on the project issue tracker using tracer-bullet vertical slices.
disable-model-invocation: true
---

# To Issues

Break a plan into independently-grabbable issues using vertical slices (tracer bullets).

The issue tracker and triage label vocabulary live in the repo's label-mapping doc — `docs/agents/triage-labels.md` here; more generally, the issue-tracker config named in the project `CLAUDE.md`. If no mapping doc exists, run `/setup-matt-pocock-skills`.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. An in-context body satisfies the body read when the issue was authored or fetched this session. But when the argument names a tracker issue, always fetch its comments fresh before drafting — they may carry corrections or vetoes newer than the context. If the referenced issue is not in context at all, fetch its full body and comments.

If the source body or comments name sibling PRDs/issues, program-sequence entries, coordination notes, "in flight" caveats, or related tracker items whose state could affect dependency wording, fetch those exact related items before Step 4. At minimum confirm their title, state, labels, and fresh comments, then classify them in the proposal as hard blockers, current context, or coordination-only. Do not rely on stale sequence comments when a sibling may already be implemented, closed, or materially changed.

Keep related-item fetches compact when exact issue or PRD numbers are already known. Prefer exact `gh issue view <n>` queries that project only title, state, labels, URL, comment count, and short comment excerpts through `--jq`; fetch full bodies only for the source issue and the few prior child issues needed for house style. Avoid broad `gh issue list` calls that include bodies or comments unless discovery is genuinely needed, because they are easy to truncate and then must be redone.

Scan the source body and fresh comments for decisions marked provisional, unratified, timed out, open to veto, or otherwise awaiting steward confirmation. Treat those as unresolved decisions, even if the source issue already carries `ready-for-agent`. Carry the unresolved-decision list into the Step 4 approval checkpoint; do not publish `ready-for-agent` child issues from those assumptions until the checkpoint explicitly ratifies or revises them. If they remain unresolved after the checkpoint, either stop before publication or publish only `needs-triage` child issues and state that they are not AFK-ready.

Also scan for decisions the source explicitly delegates to grooming, issue breakdown, or later implementer judgment — phrases such as "grooming decision", "leading candidate", "record shape", "TBD", or "open design question". Treat these as structural decisions owed by the breakdown unless the source or fresh comments already ratified them. Carry them into the Step 4 approval checkpoint; either ask the steward to ratify the decision as encoded in the slices, route the decision into a first spec/document blocker before code-bearing slices depend on it, or leave affected children `needs-triage`.

If the maintainer asks whether an existing issue or PRD should be split, treat that as an assessment request first. Fetch the source issue and comments, run the granularity check, and decide whether child issues would reduce implementation risk. If the right answer is **do not split** — because the work is already a single coherent document/process issue, narrow bug fix, or one complete vertical slice — report that rationale and stop before house-style lookup, quiz, or publication. Do not create a no-op child issue just to exercise this skill.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code. Issue titles and descriptions should use the project's domain glossary vocabulary, and respect ADRs in the area you're touching.

Keep code exploration bounded. Start from exact source/exemplar terms and likely files, prefer `rg --files` plus targeted symbol or phrase searches, constrain globs and output budgets, and rerun narrower if a result truncates. Broad repo-wide greps are a fallback only when discovery genuinely needs them.

Run `git status --short` during intake. Leave unrelated, uncited changes untouched and mention them in final reporting. If the source plan cites dirty or untracked local doctrine, reports, research briefs, field-trial reports, or other source artifacts, route them through the document-blocker/durability rule below before code-bearing slices depend on them.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the easy change."

### 3. Draft vertical slices

Break the plan into **tracer bullet** issues. Each code-bearing issue is a thin vertical slice that cuts through all affected integration layers end-to-end, NOT a horizontal slice of one layer.

<vertical-slice-rules>

- Each code-bearing slice delivers a narrow but COMPLETE path through every affected layer (schema, API, UI, tests)
- If the source plan explicitly excludes a layer, such as "no schema change" or "server boundary first; no browser redesign", do not invent work in that layer. Instead, make the slice's acceptance criteria assert the excluded layer remains unchanged or consumes existing behavior through compatibility checks.
- A behavior-preserving refactor or architecture-seam relocation may legitimately be a single code-bearing slice (plus any document blocker): touch the affected layers and assert the untouched ones remain unchanged via acceptance criteria. Do not manufacture multiple slices where splitting would only leave the code in a half-migrated intermediate state (for example, the same methods living in two modules at once). A genuinely divisible refactor still splits — the granularity quiz below is where that call is made. More broadly, a small plan — a narrow bug fix, or a feature touching a single path — may legitimately reduce to one vertical slice; aim for the smallest set of complete slices, not a minimum count, and let the granularity quiz catch over-splitting as readily as under-splitting.
- A completed slice is demoable or verifiable on its own
- When the repo's architecture makes a sub-application seam (for example an HTTP app or server-boundary seam) the demoable integration boundary — and the fetched house style confirms it, e.g. prior flows shipped verified at that seam with the browser as a later or absent consumer — a slice may complete at that seam rather than the browser. Deliver the UI as a distinct consumer slice whose acceptance criteria assert it consumes server-returned shapes and duplicates no server policy. This is the sanctioned exception to the one-layer caution above: verifiable-at-the-seam satisfies "demoable," and the UI-consumer slice is not the drift the rule guards against. When a user story spans the seam pair, state which half each slice covers (for example "the server derivations; their browser rendering lands in <consumer slice title>") and cross-reference the counterpart by slice title in both bodies.
- Any prefactoring should be done before the code-bearing slices it eases
- Plan items that are documents (ADRs, specs) become ordinary blocker issues verified by review/conformance mechanisms, not vertical slices — only code-bearing items owe the all-layers rule
- For docs-only PRDs, split a standard, policy, or template update from its application to a coverage ledger or downstream doc when the application should depend on the newly durable standard. Keep the work as one issue when the document change is a single coherent review unit and a split would only duplicate conformance review.
- When a slice's behavior is deliberately completed by a later slice, state the handoff explicitly in both issue bodies (what this slice leaves open, which slice closes it), so neither implementer duplicates or drops the seam

</vertical-slice-rules>

Before finalizing the breakdown, check whether the source plan cites local ADRs, specs, context/glossary files, reports, research briefs, field-trial reports, other source artifacts, or other doctrine documents that were created or modified in this session — or that were ratified or decided this session but not yet authored (a planned ADR, spec, report, or source artifact that does not yet exist as a file). If a cited local document or source artifact is untracked, unwritten, or otherwise not yet durable in the repo, make a first document blocker issue for publishing/reviewing that doctrine or artifact before code-bearing slices depend on it. Make this document blocker even when the source plan lists that doctrine or artifact's own authoring as out of scope: the plan's out-of-scope governs its code layers, not the durability blocker the breakdown owes. The same duty extends to doctrine the breakdown itself introduces: when the slices will cite a named artifact the source plan never mentions (a governing spec for a new layer, a coverage list), that artifact is owed a first document blocker too — check prior breakdowns for the house precedent and surface the decision in the Step 4 quiz.

Treat a source-plan note such as "temporary source summarized, not cited," "summarized rather than cited," "pending local repo publication," "pending authoring/publication," or equivalent wording as the same durability trigger even when the source omits an exact local path. If code-bearing slices depend on that summarized finding, create the document blocker first so the durable source or issue-linked summary exists before implementation depends on it. Before creating that blocker, verify the note's currency against the repo: such notes can go stale between the source's authoring and the breakdown. If the cited doctrine or artifact is now tracked and committed (for example, confirmed via git earlier in the session), record that verification in the Step 4 proposal and skip the blocker — a stale note does not owe a no-op issue.

When the parent issue body itself contains the ratified conclusions from an otherwise untracked or temporary source at enough detail for child issues to cite the parent plus tracked docs, treat the parent as the durable issue-linked summary. In that case, do not create a separate "publish the temporary source" blocker just to duplicate the parent body; instead, surface the decision in the Step 4 approval checkpoint and include it in the optional parent ledger. Still create a document blocker when code-bearing slices depend on details absent from both the parent body and tracked repo docs, or when a downstream tracked spec/ledger must absorb the conclusion before implementation can safely proceed.

Use this sufficiency test before skipping the blocker: every material child acceptance criterion must be traceable to the parent issue body, fresh parent comments, or tracked repo docs. If an implementation-critical detail exists only in untracked reports, local notes, chat, or temporary artifacts, create a document blocker or move the missing detail into a durable tracker note before publishing code-bearing children. Name the sufficiency decision in the Step 4 proposal and, when posted, the parent ledger.

When a source cites doctrine by stable identifier, number, or title rather than exact file path (for example `ADR 0008`), resolve it against the relevant repo directory by identifier and title before declaring it missing or creating a blocker. List or search the relevant doctrine directory first, then open the resolved path; do not synthesize filenames from remembered title wording. Prefer exact tracked paths once resolved, but treat stable identifiers as valid citations when they resolve unambiguously to tracked doctrine.

Resolve stable identifiers to exact tracked paths before including them in aggregate tracked/durability checks; otherwise a guessed filename can make unrelated durable sources look suspect.

The mirror hazard is durable doctrine the source plan *contradicts* rather than one that is missing: a PRD or plan whose cited spec, ADR, or principle exists and is tracked, but whose proposed names, roles, or behavior conflict with it — a source may even claim non-contradiction while contradicting. Do not slice such a plan as written. Correct the source's assumptions first per the authority order in `docs/principles/README.md` (the methodology package outranks specs, which outrank ADRs), present the conflict and your proposed correction as an explicit decision in the Step 4 quiz — the resolution is the user's call — and encode the corrected version in the slices with the deviation named in each affected issue body. The correction lives in the child issues; never edit the parent.

When a slice's correctness hinges on a *derivation* a cited spec or ADR made — a choice it reached by analogy or judgment, not one the upstream authority dictates — confirm that derivation against the upstream named in the authority order before encoding it, and flag it to the steward as a judgment call. Affirming non-contradiction with the top of the authority order (the methodology package) is already owed, so a spec faithfully "respected" can still violate the higher authority if the spec itself drifted; if the derivation proves unsound, route the fix as a doctrine-correction (above) rather than propagating it into slices.

Fetch one or two child issues of a prior breakdown from the tracker and match their house style — title pattern, body voice, section order, and acceptance-criteria conventions. Prefer a narrow lookup: query recent issue titles/numbers first, identify a prior PRD child set, then fetch one or two exact child issue bodies by default instead of pulling broad full-body lists. Usually stop at three exact child issue bodies; fetch one additional exact child body per materially distinct domain surface only when needed to cover both current house style and domain-specific precedent, and keep each read compact. The issue template below defines required sections, not a mandatory order; preserve fetched house-style section order unless repo docs explicitly require a different order.

When the breakdown is likely to create multiple issues and Step 4 will offer a parent child-map ledger comment, also fetch or inspect one recent same-repo parent child-map comment before the approval checkpoint when available. Use it to learn the ledger heading/table style and whether the repo uses a stable disclaimer. If no parent-ledger precedent or disclaimer requirement is found, say that in the approval checkpoint rather than discovering it only during publication.

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each slice, show:

- **Title**: short descriptive name
- **Blocked by**: which other slices (if any) must complete first
- **User stories covered**: which user stories this addresses (if the source material has them)

Use this proposal item shape so the approval checkpoint is mechanically complete:

```markdown
1. **Title**: <short descriptive name>
   - **Blocked by**: <none, or slice numbers/titles>
   - **User stories covered**: <US numbers, temporary ordinals, quoted story refs, or N/A - source has no stories>
```

Before asking for approval, self-check that every proposed slice has all three fields. If the source has numbered stories, no proposed slice may omit `User stories covered`; either list the covered story numbers or explicitly explain why story coverage is N/A for that slice.

If the source user stories are unnumbered, assign temporary story ordinals in source order (`US1`, `US2`, etc.) for the proposal. Either include a one-line mapping or quote enough of each covered story that the references are unambiguous; the ordinals are proposal aids, not published requirement IDs unless the source already uses them.

Include a one-line prefactoring verdict for the whole breakdown ("Prefactoring: none needed because …", or a prefactor slice placed before all code-bearing slices — position 1, or immediately after any document blockers), so the reader can tell the check ran.

When any proposed `ready-for-agent` / `ready-for-human` slice touches guided-flow, Prompt-out, Canon Workbench provenance, or browser workflow navigation behavior, include a compact checklist-mapping table before the approval question. Use this shape so the browser-visible guidance gate is concrete before publication:

```markdown
| Slice | Checklist item | Covered by staged AC | N/A reason |
|---|---|---|---|
| <slice title> | <package source / decision-point contract / prompt packet preview / etc.> | AC <n> or "<short staged criterion excerpt>" | - |
```

For unaffected slices, include one row with `Checklist item` set to `browser-visible guidance checklist` and a specific `N/A reason` such as `server metadata seam only; browser consumer slice covers the checklist`. This Step 4 table can stay in the approval checkpoint or draft notes; do not publish it as a required issue-body section unless house style already does. If full issue bodies are not drafted before the approval checkpoint, the `Covered by staged AC` entries may use provisional AC numbers or concise coverage labels, but after drafting the actual issue bodies and before applying `ready-for-agent`, rerun the checklist mapping against the final acceptance-criteria bullets and revise the staged body or label if any checklist item no longer maps cleanly. The final pre-publication mapping must cite the staged acceptance-criterion ordinal or a short excerpt from the staged criterion; a generic acceptance criterion that merely says `Browser-visible guidance checklist mapped` is useful as an issue-body summary but does not satisfy the local mapping by itself. A bare `yes` is only acceptable in the final ledger after that concrete mapping has already been performed.

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any slices be merged or split further?
- When intake surfaced a doctrine conflict or correction (Step 3), does the user accept the correction and how it was resolved?
- When intake surfaced provisional, timed-out, unratified, or open-to-veto decisions, does the user ratify the listed decisions as encoded in the slices, revise them, or leave them unresolved?
- For multi-issue publication, should the optional parent child-map ledger comment be posted after creation, assuming tracker docs or house style allow it?
- If the optional parent ledger is declined while the breakdown has ratified structural, durability, coordination, dependency, or story-coverage decisions that would otherwise live only in chat, should a concise "Breakdown decisions" note go in the first relevant child issue body before publication, or should that rationale intentionally remain out of the tracker?

For multi-issue breakdowns, end the checkpoint with an explicit publication sentence: "If you approve, I will publish these N child issues in the dependency order shown, apply labels <labels>, and <post/skip> the parent child-map ledger as specified." Adjust the ledger clause when the parent comment decision is still open.

If the user approves publication but delegates optional ledger judgment to you, default to posting the parent child-map ledger when the breakdown ratified structural, durability, coordination, dependency, or story-coverage decisions that future implementers would otherwise have to reconstruct from chat. Skip the ledger only when the user explicitly declines it, tracker docs or house precedent forbid it, or the breakdown has no durable rationale beyond the issue map; state that decision in the final report.

If the user approves publication and explicitly declines the parent ledger without answering the fallback-rationale question, default to adding a concise `## Breakdown decisions` note to the first relevant child issue body when the breakdown ratified structural, durability, coordination, dependency, or story-coverage decisions future implementers would otherwise have to reconstruct from chat. State that default before publishing. If the user explicitly says to leave the rationale out of the tracker, do that and state the choice in the final report.

When the proposed breakdown is a single no-blocker issue, a compact approval question is enough, but make it explicit that approval covers the one-slice granularity, no dependencies, and publication. For example: "Does this one-slice/no-blocker breakdown feel right, and should I publish it as the child issue?"

Iterate until the user approves the breakdown. If the environment provides a timed approval mechanism and the approval question times out with no response, weigh re-asking once before proceeding — especially right after a long context dump (the user may have been reading rather than away) or when publishing is consequential (creating several real issues at once). Only on a second timeout (the user is away) proceed with the proposed breakdown, state in the conversation that it was applied unapproved, and offer post-hoc adjustment (merge/split/re-wire, closing issues if needed) when the user returns. If no timed approval mechanism is available, ask a plain-text approval question and stop before publishing unless the user has explicitly pre-authorized publication; do not treat tool unavailability as a timeout.

### 5. Publish the issues to the issue tracker

For each approved slice, publish a new issue to the issue tracker. Use the issue body template below. Choose the triage label per slice before creation. Match the full label set of the fetched house-style child issues, including whether they carry a category label alongside the triage label; when house style omits a label that a sibling skill's hygiene rules expect (for example a category role), follow the house precedent and note the divergence in the final report so the maintainer can settle the doctrine once instead of every run re-deciding. A slice gets `ready-for-agent` only when it is fully specified for an AFK agent: its dependencies are explicit, no provisional/timed-out/unratified/open-to-veto decision remains, and any repo-specific implementability checklist passes. If any unresolved decision remains, or the slice cannot yet satisfy the repo's implementable-issue checklist, publish it with `needs-triage` instead and state in the final ledger why it is not AFK-ready.

Before applying `ready-for-agent` or `ready-for-human` to any guided-flow, Prompt-out, Canon Workbench provenance, or browser workflow navigation issue, read the project's issue-tracker doc and apply its browser-visible guidance acceptance checklist. The child issue must include acceptance criteria for the applicable checklist items — package source, decision-point contract, required/optional/skippable/severity-dependent fields, doctrine at point of use, prompt packet preview/source manifest/cold external LLM test when Prompt-out is in scope, advisory/canon separation when advisory material is in scope, skip path and reason storage, blockers/substance validation, current/next/resume state, read-side audit/provenance links for writes, and cognitive walkthrough when browser task grammar changes. If the checklist does not apply, note that during drafting; if it applies and is not satisfied, revise the issue before `ready-for-agent` publication or use `needs-triage`. Before applying `ready-for-agent`, self-check that each applicable checklist item above maps to at least one acceptance criterion in the slice; this is a manual check, since the compact verification query confirms section presence, not checklist-item coverage.

Make that self-check visible before publication. For every affected `ready-for-agent` or `ready-for-human` issue, keep a mandatory local checklist run sheet before creation that marks each applicable checklist item as `covered by AC <n>` or `covered by "<short staged criterion excerpt>"`, or `N/A - <reason>`. Use a concrete table or equivalent row set shaped as `slice | checklist item | covered by final AC ordinal/excerpt | N/A reason`; do not rely on a single generic `Browser-visible guidance checklist mapped` acceptance criterion as the mapping. Do not publish the mapping as a required issue-body section unless house style already does; the point is to force a concrete coverage pass before the label is applied. In the final ledger or verification report, include `checklist mapped: yes` for each affected issue, or `checklist mapped: N/A - <reason>` for unaffected issues, so checklist coverage is not silently replaced by section/placeholder readback; that final `yes` is a summary of the concrete local mapping, not a substitute for it.

Verify the chosen label exists before creating the first issue with that label (create it per the project's triage-label doc if absent; a verification earlier in the same session suffices). Prefer current same-repo issue metadata when it already shows the exact chosen label; use `gh label list` only when no current issue metadata has shown it or label creation may be needed. If label-listing is temporarily unavailable, exact label presence on an issue from the same repo is acceptable verification.

Before staging or creating child issues, run an exact-title duplicate guard for every approved child title. Prefer one compact query per title:

```sh
gh issue list --state all --search '"<child title>" in:title' --json number,title,state,url,labels --limit 10
```

Treat exact-title matches as existing work: stop and ask whether to reuse, link, or skip them unless the approval already explicitly allows duplicate issue creation. If the query returns only fuzzy or partial-title matches, record that no exact duplicate exists and continue. On resumed runs, use the same guard to avoid recreating children already published earlier in the run.

Temporary issue-body files are acceptable as local transport for `gh issue create --body-file`; use the least-permission mechanism available to create and remove them. Prefer an outside-worktree path such as `/tmp/worldloom-issues-<parent-or-slug>-<slice>.md` when the active environment permits safe creation and cleanup. If shell writes or `rm` are constrained, or outside-worktree editing is awkward, use clearly temporary repo-local hidden files such as `reports/.tmp-<parent-or-slug>-issue-<n>.md`, create and delete them with the environment-approved edit mechanism, and verify cleanup with `test ! -e` plus the final `git status --short`. In Codex-style sessions, create and delete both outside-worktree (`/tmp/...`) and repo-local staged body/comment files with the environment-approved edit mechanism (`apply_patch` when available) rather than shell redirection, heredocs, or unapproved/destructive cleanup commands. The published issue body must not cite the staging path or any machine-local artifact. Before running the first `gh issue create`, sweep every staged body assembled from local notes or temp files for machine-local paths; when sweeping temp files, use a content-only check such as `rg --no-filename` so the temp file path itself is not reported as a false positive. Rerun the sweep after placeholder substitution or body edits. Treat leak and placeholder sweeps as hard serial gates: do not run `gh issue create` in the same parallel batch as those checks; create only after the relevant sweeps complete cleanly.

Mandatory final checklist run sheet for affected ready-labelled issues:

```markdown
| Slice | Checklist item | Covered by final AC ordinal/excerpt | N/A reason |
|---|---|---|---|
| <slice title> | package source cited | AC <n> or "<short staged criterion excerpt>" | - |
| <slice title> | decision-point contract named | AC <n> or "<short staged criterion excerpt>" | - |
| <slice title> | required/optional/skippable/severity-dependent fields visible where relevant | AC <n> or "<short staged criterion excerpt>" | N/A - <reason> |
```

Publishing with `ready-for-agent` or `ready-for-human` is blocked until every applicable browser-visible guidance item has a final AC ordinal/excerpt in this run sheet, or a specific `N/A - <reason>`. A generic body criterion such as `Browser-visible guidance checklist mapped` may summarize the result, but it never substitutes for this concrete row-by-row mapping.

Publication safety gates before every `gh issue create`:

1. Sweep the staged body for machine-local paths and run-specific placeholder tokens.
2. For any `ready-for-agent` / `ready-for-human` issue subject to the browser-visible guidance checklist, rerun the final checklist mapping against the staged acceptance criteria and record each applicable item as `covered by AC <n>`, `covered by "<short staged criterion excerpt>"`, or `N/A - <reason>` in the mandatory local checklist run sheet. Treat a generic checklist-summary acceptance criterion as insufficient unless each applicable checklist item also maps to a specific staged criterion or explicit N/A reason.
3. For any staged body that names a same-run child issue number, run a prose sanity pass against the approved dependency plan and the issue's current state. Check relationship and tense words such as `blocked by`, `depends on`, `sibling`, `consumes`, `closed`, `completed`, `implemented`, `open`, and `ready`; fix wording like "closed #<new child>" when the child was only just created or is a non-blocking sibling.
4. Confirm the sweep returns zero actionable hits, any required final checklist mapping is clean, and any same-run reference wording matches the approved dependency plan. If the mapping or relationship wording does not cleanly land, revise the body or publish with a non-ready label before creating the issue.
5. Only then create the issue.

A compact local staged-body check can make gate 1 reproducible before each create/comment. Adjust the variables per slice or ledger: `EXPECT_PARENT` is the parent token, `EXPECT_BLOCKERS` is a comma-separated list of issue refs that must appear, `EXPECT_NO_BLOCKER=1` requires the house-style no-blocker phrase, `EXPECT_STORIES=1` requires the story-coverage section, and `EXPECT_LEDGER=1` switches from child-issue sections to parent-ledger checks.

```sh
BODY_FILE=path/to/staged-body.md
EXPECT_PARENT="PRD #<parent>"
EXPECT_BLOCKERS="#<blocker-1>,#<blocker-2>"
EXPECT_NO_BLOCKER=0
EXPECT_STORIES=0
EXPECT_LEDGER=0
PLACEHOLDER_RE="#SLICE|PLACEHOLDER"
export EXPECT_PARENT EXPECT_BLOCKERS EXPECT_NO_BLOCKER EXPECT_STORIES EXPECT_LEDGER PLACEHOLDER_RE
node -e '
const fs = require("fs");
const body = fs.readFileSync(process.argv[1], "utf8");
const blockers = (process.env.EXPECT_BLOCKERS || "").split(",").map(s => s.trim()).filter(Boolean);
const placeholderRe = new RegExp(process.env.PLACEHOLDER_RE || "#SLICE|PLACEHOLDER");
const ledger = process.env.EXPECT_LEDGER === "1";
const checks = {
  noTmp: !body.includes("/tmp"),
  noHome: !body.includes("/home/"),
  noPatchMarkers: !/\*\*\* (Begin|End) Patch/.test(body),
  noPlaceholders: !placeholderRe.test(body),
  hasParent: !process.env.EXPECT_PARENT || body.includes(process.env.EXPECT_PARENT),
  hasBlockers: blockers.every(ref => body.includes(ref))
};
if (ledger) {
  Object.assign(checks, {
    hasChildMap: body.includes("Child Issue Map"),
    hasBreakdownDecisions: body.includes("Breakdown decisions"),
    hasStoryCoverage: body.includes("Story coverage")
  });
} else {
  Object.assign(checks, {
    hasWhat: body.includes("## What to build"),
    hasAcceptance: body.includes("## Acceptance criteria"),
    hasBlockedBy: body.includes("## Blocked by"),
    hasPrinciples: body.includes("## Principles"),
    hasStoryCoverage: process.env.EXPECT_STORIES !== "1" || body.includes("## User stories covered"),
    hasNoBlocker: process.env.EXPECT_NO_BLOCKER !== "1" || body.includes("None - can start immediately")
  });
}
console.log(JSON.stringify(checks, null, 2));
if (Object.values(checks).some(v => !v)) process.exit(1);
' "$BODY_FILE"
```

Do not batch the sweep/checklist mapping/same-run reference sanity checks and create commands in the same parallel tool call. When a substitution changes the body, rerun the gates before creating the next dependent issue.

For multi-issue publications, an optional run sheet can keep the serial gates legible. When any child is subject to the browser-visible guidance checklist and will be published `ready-for-agent` or `ready-for-human`, the checklist portion of the run sheet is mandatory even if the rest remains optional. Keep it local-only and advisory; it is not a required output. Useful columns: `slice`, `body file`, `placeholder tokens`, `final checklist mapping`, `checklist item`, `covered by final AC ordinal/excerpt`, `N/A reason`, `same-run reference sanity`, `blocked by`, `created issue`, `sweep ok`, `verify ok`, and `substituted into`.

Publish issues in dependency order (blockers first) so you can reference real issue identifiers in the "Blocked by" field. The paved path is placeholder substitution: write bodies with placeholder tokens for backward references, chain creation to stop on first failure, substitute each real returned number into dependent bodies before creating them, and verify the published references afterward. An equivalent serial path is to create a blocker issue first, then draft each dependent body only after the real blocker number exists; still run the same leak and placeholder sweeps before each create. After each substitution, sweep staged bodies for the exact placeholder tokens used in that run and run the same-run reference sanity pass for any newly inserted issue numbers; after publication, verify the published body has the expected real blocker and no leftover placeholder token. Batch publishing with predicted identifiers is a fallback, acceptable only when references point strictly backward, creation is chained to stop on first failure, and each returned number is verified against its prediction — correct via issue edits on any mismatch; otherwise create one at a time. Forward references — a handoff naming the later slice that closes it — are written by slice *title*, never identifier: titles are stable within the breakdown and need no post-publication edits; identifiers are reserved for backward references like "Blocked by".

After publishing, verify every created issue with `gh issue view`: confirm title, body, triage label, state, parent reference, and blocker references. If verification finds a defect, fix it with the issue tracker edit command and re-verify the corrected issue before final reporting. Before final reporting, produce a compact ledger mapping each approved slice number/title to the created issue number and URL, and confirm the created count equals the approved count. The final ledger or summary should include, per created issue, the issue URL, label/state proof, parent and blocker check, placeholder/path sweep result, and `checklist mapped: yes` or `checklist mapped: N/A - <reason>`. Optionally post that ledger as a comment on the parent issue — starting with the tracker's AI disclaimer where the repo requires one — so the parent carries a consolidated child map; a comment does not violate the parent guardrail below. Use the repo's established disclaimer string verbatim even if its wording names a different activity (for example triage) — string stability beats wording accuracy; note the mismatch to the maintainer once if it hasn't been settled. If tracker docs are silent on disclaimer requirements, use the parent-ledger/comment precedent fetched before the approval checkpoint or state that no disclaimer requirement was found; do not invent a disclaimer. Include in the ledger comment a line or two for any quiz-ratified structural decisions — dependency shape, placement judgment calls, verified-stale durability notes — so the parent carries the rationale, not just the map. When the source had numbered or temporary user-story coverage and house style kept the mapping out of child bodies, include an optional compact story-coverage section or table in the parent ledger so the approved mapping remains durable. If the optional parent ledger comment was not posted, say so in the final report.

Before posting any parent ledger/comment body assembled from local notes or temporary files, run the same publication safety gate used for issue bodies: sweep the staged comment body for machine-local paths and run-specific placeholder tokens, run the same-run reference sanity pass when it names child issue numbers from this publication, confirm zero actionable hits and clean relationship wording, and only then run `gh issue comment`. Parent ledgers may use `gh issue comment <parent> --body-file <file>` after that gate. Use a content-only sweep for temp files so the staging path itself is not reported as a false positive. If placeholder substitution changes the comment body, rerun the sweep and same-run reference sanity pass before posting.

If the parent ledger is declined after ratifying structural, durability, coordination, dependency, or story-coverage decisions, use the fallback approved in Step 4 or the Step 4 partial-response default before publishing: either include a concise `## Breakdown decisions` note in the first relevant child issue body, or leave the rationale out of the tracker and state that choice in the final report. Do not silently drop a durability or coordination rationale that future implementers need to understand the dependency shape.

Remove any temporary issue-body or ledger/comment body files you created with the same environment-approved edit/removal mechanism used to create them, run `git status --short`, and include only remaining pre-existing or intentional dirty files in the final report. For OS-temp body files outside the repository, verify cleanup with file checks such as `test ! -e <path>` or an equivalent existence check; do not path-scope `git status --short` to those temp files, because Git treats paths outside the repo as invalid. Run that final `git status --short` from the repository root (or with `git -C <repo-root>`): temp cleanup typically leaves the shell cwd outside the repo, where the bare command fails with "not a git repository".

Final Response Blocker: before sending the final answer after publication, check the final ledger against the verified tracker readbacks. Do not summarize publication as complete unless the final answer includes: the approved-created count match; one row or compact bullet per created issue with issue URL, state/label proof, parent check, blocker or no-blocker check, placeholder/path sweep result, and `checklist mapped: yes` or `checklist mapped: N/A - <reason>`; parent ledger posted/skipped with the reason; temp-file cleanup result; and final `git status --short` with unrelated or intentional dirty files called out. If interrupted, resumed, or compacted after publication begins and before final reporting, rerun any Final Response Blocker checks whose outputs are not present in current context before reporting completion. If a parent ledger comment carries these details, the final answer may link it, but still include enough per-issue proof for the user to see the tracker verification without opening GitHub.

For compact child-issue verification, prefer a query shaped like this, adjusting `hasParent` to the fetched house-style parent token (for example `#<parent>` or `PRD #<parent>`), adjusting `hasBlocker` for the expected blocker reference or replacing it with a no-blocker check, adjusting `hasNoPlaceholders` to the placeholder tokens used during staging, checking `hasStoryCoverage` when the source had numbered stories and the fetched house-style bodies carry the coverage section, and adding one boolean per expected non-triage label from house style (for example `hasEnhancement`) — drop `hasStoryCoverage` when house style omits that section:

For issues with multiple blockers, add one boolean per expected blocker reference (for example `hasBlocker166`, `hasBlocker167`, `hasBlocker168`) and keep the placeholder-leak check. Do not collapse several blockers into one broad contains check unless the expected references are still individually visible in the final report.

```sh
gh issue view <number> --json number,title,body,labels,state,url --jq '{number,title,state,url,labels:[.labels[].name],isOpen:(.state == "OPEN"),hasReady:(any(.labels[].name; . == "ready-for-agent")),hasNeedsTriage:(any(.labels[].name; . == "needs-triage")),hasCategoryLabel:(any(.labels[].name; . == "<category-label>")),hasParent:(.body | contains("PRD #<parent>")),hasWhat:(.body | contains("## What to build")),hasStoryCoverage:(.body | contains("## User stories covered")),hasAcceptance:(.body | contains("## Acceptance criteria")),hasPrinciples:(.body | contains("## Principles")),hasBlocker:(.body | contains("#<blocker>")),hasNoPlaceholders:((.body | test("#SLICE|PLACEHOLDER")) | not),hasNoTmp:((.body | contains("/tmp")) | not),hasNoHome:((.body | contains("/home/")) | not)}'
```

<issue-template>
## Parent

A reference to the parent issue on the issue tracker (if the source was an existing issue, otherwise omit this section).

## What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation.

Avoid specific file paths or code snippets — they go stale fast. Citations of principle, ADR, and spec documents are exempt — they are stable identifiers and are themselves the conformance mechanism. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it here and note briefly that it came from a prototype. Trim to the decision-rich parts — not a working demo, just the important bits.

## User stories covered

When the source had numbered or temporary user-story references, preserve the approved coverage mapping for this slice. If the source had no user stories, omit this section. If the source has user stories but the fetched house-style children omit this section, follow house style: omit it from the bodies and keep the approved coverage mapping in the Step 4 proposal only — the "match house style" directive outranks this template default, and `hasStoryCoverage` is dropped from the verification query for that run.

## Acceptance criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Blocked by

- A reference to the blocking ticket (if any)

Or "None - can start immediately" if no blockers.

## Principles

The conformance-rule section this repo requires of every implementable issue (`docs/principles/README.md`): name the principle documents and ADRs this slice touches, affirm non-contradiction with them, and flag any deliberate exception to the steward before implementation.

</issue-template>

Do NOT close or modify any parent issue (labels, body, or state). Posting the optional ledger comment on the parent is permitted — a comment is an addition, not a modification.
