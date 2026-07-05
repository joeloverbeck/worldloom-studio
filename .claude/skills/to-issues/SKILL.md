---
name: to-issues
description: Break a plan, spec, or PRD into independently-grabbable issues on the project issue tracker using tracer-bullet vertical slices.
disable-model-invocation: true
---

# To Issues

Break a plan into independently-grabbable issues using vertical slices (tracer bullets).

The issue tracker and triage label vocabulary should have been provided to you — run `/setup-matt-pocock-skills` if not.

## Process

### 1. Gather context

Work from whatever is already in the conversation context. An in-context body satisfies the body read when the issue was authored or fetched this session. But when the argument names a tracker issue, always fetch its comments fresh before drafting — they may carry corrections or vetoes newer than the context. If the referenced issue is not in context at all, fetch its full body and comments.

Scan the source body and fresh comments for decisions marked provisional, unratified, timed out, open to veto, or otherwise awaiting steward confirmation. Treat those as unresolved decisions, even if the source issue already carries `ready-for-agent`. Carry the unresolved-decision list into the Step 4 approval checkpoint; do not publish `ready-for-agent` child issues from those assumptions until the checkpoint explicitly ratifies or revises them. If they remain unresolved after the checkpoint, either stop before publication or publish only `needs-triage` child issues and state that they are not AFK-ready.

If the maintainer asks whether an existing issue or PRD should be split, treat that as an assessment request first. Fetch the source issue and comments, run the granularity check, and decide whether child issues would reduce implementation risk. If the right answer is **do not split** — because the work is already a single coherent document/process issue, narrow bug fix, or one complete vertical slice — report that rationale and stop before house-style lookup, quiz, or publication. Do not create a no-op child issue just to exercise this skill.

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code. Issue titles and descriptions should use the project's domain glossary vocabulary, and respect ADRs in the area you're touching.

Run `git status --short` during intake. Leave unrelated, uncited changes untouched and mention them in final reporting. If the source plan cites dirty or untracked local doctrine, route it through the document-blocker/durability rule below before code-bearing slices depend on it.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the easy change."

### 3. Draft vertical slices

Break the plan into **tracer bullet** issues. Each code-bearing issue is a thin vertical slice that cuts through all affected integration layers end-to-end, NOT a horizontal slice of one layer.

<vertical-slice-rules>

- Each code-bearing slice delivers a narrow but COMPLETE path through every affected layer (schema, API, UI, tests)
- If the source plan explicitly excludes a layer, such as "no schema change" or "server boundary first; no browser redesign", do not invent work in that layer. Instead, make the slice's acceptance criteria assert the excluded layer remains unchanged or consumes existing behavior through compatibility checks.
- A behavior-preserving refactor or architecture-seam relocation may legitimately be a single code-bearing slice (plus any document blocker): touch the affected layers and assert the untouched ones remain unchanged via acceptance criteria. Do not manufacture multiple slices where splitting would only leave the code in a half-migrated intermediate state (for example, the same methods living in two modules at once). A genuinely divisible refactor still splits — the granularity quiz below is where that call is made. More broadly, a small plan — a narrow bug fix, or a feature touching a single path — may legitimately reduce to one vertical slice; aim for the smallest set of complete slices, not a minimum count, and let the granularity quiz catch over-splitting as readily as under-splitting.
- A completed slice is demoable or verifiable on its own
- When the repo's architecture makes a sub-application seam (for example an HTTP app or server-boundary seam) the demoable integration boundary — and the fetched house style confirms it, e.g. prior flows shipped verified at that seam with the browser as a later or absent consumer — a slice may complete at that seam rather than the browser. Deliver the UI as a distinct consumer slice whose acceptance criteria assert it consumes server-returned shapes and duplicates no server policy. This is the sanctioned exception to the one-layer caution above: verifiable-at-the-seam satisfies "demoable," and the UI-consumer slice is not the drift the rule guards against.
- Any prefactoring should be done before the code-bearing slices it eases
- Plan items that are documents (ADRs, specs) become ordinary blocker issues verified by review/conformance mechanisms, not vertical slices — only code-bearing items owe the all-layers rule
- When a slice's behavior is deliberately completed by a later slice, state the handoff explicitly in both issue bodies (what this slice leaves open, which slice closes it), so neither implementer duplicates or drops the seam

</vertical-slice-rules>

Before finalizing the breakdown, check whether the source plan cites local ADRs, specs, context/glossary files, or other doctrine documents that were created or modified in this session — or that were ratified or decided this session but not yet authored (a planned ADR or spec that does not yet exist as a file). If a cited local document is untracked, unwritten, or otherwise not yet durable in the repo, make a first document blocker issue for publishing/reviewing that doctrine before code-bearing slices depend on it. Make this document blocker even when the source plan lists that doctrine's own authoring as out of scope: the plan's out-of-scope governs its code layers, not the durability blocker the breakdown owes.

When a source cites doctrine by stable identifier, number, or title rather than exact file path (for example `ADR 0008`), resolve it against the relevant repo directory by identifier and title before declaring it missing or creating a blocker. Prefer exact tracked paths once resolved, but treat stable identifiers as valid citations when they resolve unambiguously to tracked doctrine.

The mirror hazard is durable doctrine the source plan *contradicts* rather than one that is missing: a PRD or plan whose cited spec, ADR, or principle exists and is tracked, but whose proposed names, roles, or behavior conflict with it — a source may even claim non-contradiction while contradicting. Do not slice such a plan as written. Correct the source's assumptions first per the authority order in `docs/principles/README.md` (the methodology package outranks specs, which outrank ADRs), present the conflict and your proposed correction as an explicit decision in the Step 4 quiz — the resolution is the user's call — and encode the corrected version in the slices with the deviation named in each affected issue body. The correction lives in the child issues; never edit the parent.

When a slice's correctness hinges on a *derivation* a cited spec or ADR made — a choice it reached by analogy or judgment, not one the upstream authority dictates — confirm that derivation against the upstream named in the authority order before encoding it, and flag it to the steward as a judgment call. Affirming non-contradiction with the top of the authority order (the methodology package) is already owed, so a spec faithfully "respected" can still violate the higher authority if the spec itself drifted; if the derivation proves unsound, route the fix as a doctrine-correction (above) rather than propagating it into slices.

Fetch one or two child issues of a prior breakdown from the tracker and match their house style — title pattern, body voice, section order, and acceptance-criteria conventions. Prefer a narrow lookup: query recent issue titles/numbers first, identify a prior PRD child set, then fetch one or two exact child issue bodies by default instead of pulling broad full-body lists. Fetch up to three exact child issue bodies when needed to cover both current house style and domain-specific precedent. The issue template below defines required sections, not a mandatory order; preserve fetched house-style section order unless repo docs explicitly require a different order.

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

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any slices be merged or split further?
- When intake surfaced a doctrine conflict or correction (Step 3), does the user accept the correction and how it was resolved?
- When intake surfaced provisional, timed-out, unratified, or open-to-veto decisions, does the user ratify the listed decisions as encoded in the slices, revise them, or leave them unresolved?

When the proposed breakdown is a single no-blocker issue, a compact approval question is enough, but make it explicit that approval covers the one-slice granularity, no dependencies, and publication. For example: "Does this one-slice/no-blocker breakdown feel right, and should I publish it as the child issue?"

Iterate until the user approves the breakdown. If the environment provides a timed approval mechanism and the approval question times out with no response, weigh re-asking once before proceeding — especially right after a long context dump (the user may have been reading rather than away) or when publishing is consequential (creating several real issues at once). Only on a second timeout (the user is away) proceed with the proposed breakdown, state in the conversation that it was applied unapproved, and offer post-hoc adjustment (merge/split/re-wire, closing issues if needed) when the user returns. If no timed approval mechanism is available, ask a plain-text approval question and stop before publishing unless the user has explicitly pre-authorized publication; do not treat tool unavailability as a timeout.

### 5. Publish the issues to the issue tracker

For each approved slice, publish a new issue to the issue tracker. Use the issue body template below. Choose the triage label per slice before creation. A slice gets `ready-for-agent` only when it is fully specified for an AFK agent: its dependencies are explicit, no provisional/timed-out/unratified/open-to-veto decision remains, and any repo-specific implementability checklist passes. If any unresolved decision remains, or the slice cannot yet satisfy the repo's implementable-issue checklist, publish it with `needs-triage` instead and state in the final ledger why it is not AFK-ready.

Before applying `ready-for-agent` or `ready-for-human` to any guided-flow, Prompt-out, Canon Workbench provenance, or browser workflow navigation issue, read the project's issue-tracker doc and apply its browser-visible guidance acceptance checklist. The child issue must include acceptance criteria for the applicable checklist items — package source, decision-point contract, required/optional/skippable/severity-dependent fields, doctrine at point of use, prompt packet preview/source manifest/cold external LLM test when Prompt-out is in scope, advisory/canon separation when advisory material is in scope, skip path and reason storage, blockers/substance validation, current/next/resume state, read-side audit/provenance links for writes, and cognitive walkthrough when browser task grammar changes. If the checklist does not apply, note that during drafting; if it applies and is not satisfied, revise the issue before `ready-for-agent` publication or use `needs-triage`.

Verify the chosen label exists before creating the first issue with that label (create it per the project's triage-label doc if absent; a verification earlier in the same session suffices). If label-listing is temporarily unavailable, exact label presence on an issue from the same repo is acceptable verification.

Temporary issue-body files are acceptable as local transport for `gh issue create --body-file`; use the least-permission mechanism available to create and remove them. In sandboxed Codex-style environments, adding and later deleting temp files under `/tmp` with `apply_patch` is acceptable when shell writes or `rm` are constrained. The published issue body must not cite the staging path or any machine-local artifact. Before running the first `gh issue create`, sweep every staged body assembled from local notes or temp files for machine-local paths; when sweeping temp files, use a content-only check such as `rg --no-filename` so the temp file path itself is not reported as a false positive. Rerun the sweep after placeholder substitution or body edits. Treat leak and placeholder sweeps as hard serial gates: do not run `gh issue create` in the same parallel batch as those checks; create only after the relevant sweeps complete cleanly.

Publish issues in dependency order (blockers first) so you can reference real issue identifiers in the "Blocked by" field. The paved path is placeholder substitution: write bodies with placeholder tokens for backward references, chain creation to stop on first failure, substitute each real returned number into dependent bodies before creating them, and verify the published references afterward. After each substitution, sweep staged bodies for the exact placeholder tokens used in that run; after publication, verify the published body has the expected real blocker and no leftover placeholder token. Batch publishing with predicted identifiers is a fallback, acceptable only when references point strictly backward, creation is chained to stop on first failure, and each returned number is verified against its prediction — correct via issue edits on any mismatch; otherwise create one at a time. Forward references — a handoff naming the later slice that closes it — are written by slice *title*, never identifier: titles are stable within the breakdown and need no post-publication edits; identifiers are reserved for backward references like "Blocked by".

After publishing, verify every created issue with `gh issue view`: confirm title, body, triage label, state, parent reference, and blocker references. If verification finds a defect, fix it with the issue tracker edit command and re-verify the corrected issue before final reporting. Before final reporting, produce a compact ledger mapping each approved slice number/title to the created issue number and URL, and confirm the created count equals the approved count.

Remove any temporary issue-body files you created, run `git status --short`, and include only remaining pre-existing or intentional dirty files in the final report.

For compact child-issue verification, prefer a query shaped like this, adjusting `hasParent` to the fetched house-style parent token (for example `#<parent>` or `PRD #<parent>`), adjusting `hasBlocker` for the expected blocker reference or replacing it with a no-blocker check, and adjusting `hasNoPlaceholders` to the placeholder tokens used during staging:

```sh
gh issue view <number> --json number,title,body,labels,state,url --jq '{number,title,state,url,labels:[.labels[].name],isOpen:(.state == "OPEN"),hasReady:(any(.labels[].name; . == "ready-for-agent")),hasNeedsTriage:(any(.labels[].name; . == "needs-triage")),hasParent:(.body | contains("PRD #<parent>")),hasWhat:(.body | contains("## What to build")),hasAcceptance:(.body | contains("## Acceptance criteria")),hasPrinciples:(.body | contains("## Principles")),hasBlocker:(.body | contains("#<blocker>")),hasNoPlaceholders:((.body | test("#SLICE|PLACEHOLDER")) | not),hasNoTmp:((.body | contains("/tmp")) | not),hasNoHome:((.body | contains("/home/")) | not)}'
```

<issue-template>
## Parent

A reference to the parent issue on the issue tracker (if the source was an existing issue, otherwise omit this section).

## What to build

A concise description of this vertical slice. Describe the end-to-end behavior, not layer-by-layer implementation.

Avoid specific file paths or code snippets — they go stale fast. Citations of principle, ADR, and spec documents are exempt — they are stable identifiers and are themselves the conformance mechanism. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it here and note briefly that it came from a prototype. Trim to the decision-rich parts — not a working demo, just the important bits.

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

Do NOT close or modify any parent issue.
