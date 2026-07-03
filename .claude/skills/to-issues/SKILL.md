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

### 2. Explore the codebase (optional)

If you have not already explored the codebase, do so to understand the current state of the code. Issue titles and descriptions should use the project's domain glossary vocabulary, and respect ADRs in the area you're touching.

Look for opportunities to prefactor the code to make the implementation easier. "Make the change easy, then make the easy change."

### 3. Draft vertical slices

Break the plan into **tracer bullet** issues. Each code-bearing issue is a thin vertical slice that cuts through all affected integration layers end-to-end, NOT a horizontal slice of one layer.

<vertical-slice-rules>

- Each code-bearing slice delivers a narrow but COMPLETE path through every affected layer (schema, API, UI, tests)
- If the source plan explicitly excludes a layer, such as "no schema change" or "server boundary first; no browser redesign", do not invent work in that layer. Instead, make the slice's acceptance criteria assert the excluded layer remains unchanged or consumes existing behavior through compatibility checks.
- A completed slice is demoable or verifiable on its own
- Any prefactoring should be done before the code-bearing slices it eases
- Plan items that are documents (ADRs, specs) become ordinary blocker issues verified by review/conformance mechanisms, not vertical slices — only code-bearing items owe the all-layers rule
- When a slice's behavior is deliberately completed by a later slice, state the handoff explicitly in both issue bodies (what this slice leaves open, which slice closes it), so neither implementer duplicates or drops the seam

</vertical-slice-rules>

Before finalizing the breakdown, check whether the source plan cites local ADRs, specs, context/glossary files, or other doctrine documents that were created or modified in this session. If a cited local document is untracked or otherwise not yet durable in the repo, make a first document blocker issue for publishing/reviewing that doctrine before code-bearing slices depend on it.

Fetch one or two child issues of a prior breakdown from the tracker and match their house style — title pattern, body voice, section order, and acceptance-criteria conventions. Prefer a narrow lookup: query recent issue titles/numbers first, identify a prior PRD child set, then fetch one or two exact child issue bodies instead of pulling broad full-body lists. The issue template below defines required sections, not a mandatory order; preserve fetched house-style section order unless repo docs explicitly require a different order.

### 4. Quiz the user

Present the proposed breakdown as a numbered list. For each slice, show:

- **Title**: short descriptive name
- **Blocked by**: which other slices (if any) must complete first
- **User stories covered**: which user stories this addresses (if the source material has them)

Include a one-line prefactoring verdict for the whole breakdown ("Prefactoring: none needed because …", or a prefactor slice placed before all code-bearing slices — position 1, or immediately after any document blockers), so the reader can tell the check ran.

Ask the user:

- Does the granularity feel right? (too coarse / too fine)
- Are the dependency relationships correct?
- Should any slices be merged or split further?

Iterate until the user approves the breakdown. If the environment provides a timed approval mechanism and the approval question times out with no response (the user is away), proceed with the proposed breakdown, state in the conversation that it was applied unapproved, and offer post-hoc adjustment (merge/split/re-wire, closing issues if needed) when the user returns. If no timed approval mechanism is available, ask a plain-text approval question and stop before publishing unless the user has explicitly pre-authorized publication; do not treat tool unavailability as a timeout.

### 5. Publish the issues to the issue tracker

For each approved slice, publish a new issue to the issue tracker. Use the issue body template below. These issues are considered ready for AFK agents, so publish them with the correct triage label unless instructed otherwise. Verify the label exists before creating the first issue (create it per the project's triage-label doc if absent; a verification earlier in the same session suffices).

Temporary issue-body files are acceptable as local transport for `gh issue create --body-file`, but the published issue body must not cite the staging path or any machine-local artifact. Before running the first `gh issue create`, sweep every staged body assembled from local notes or temp files for machine-local paths; rerun the sweep after placeholder substitution or body edits.

Publish issues in dependency order (blockers first) so you can reference real issue identifiers in the "Blocked by" field. The paved path is placeholder substitution: write bodies with placeholder tokens for backward references, chain creation to stop on first failure, substitute each real returned number into dependent bodies before creating them, and verify the published references afterward. Batch publishing with predicted identifiers is a fallback, acceptable only when references point strictly backward, creation is chained to stop on first failure, and each returned number is verified against its prediction — correct via issue edits on any mismatch; otherwise create one at a time. Forward references — a handoff naming the later slice that closes it — are written by slice *title*, never identifier: titles are stable within the breakdown and need no post-publication edits; identifiers are reserved for backward references like "Blocked by".

After publishing, verify every created issue with `gh issue view`: confirm title, body, triage label, state, parent reference, and blocker references. If verification finds a defect, fix it with the issue tracker edit command and re-verify the corrected issue before final reporting. Before final reporting, produce a compact ledger mapping each approved slice number/title to the created issue number and URL, and confirm the created count equals the approved count.

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
