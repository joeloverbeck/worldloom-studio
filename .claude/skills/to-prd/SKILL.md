---
name: to-prd
description: Turn the current conversation into a PRD and publish it to the project issue tracker — no requirements interview, just synthesis of what you've already discussed; the seam confirmation is the sole checkpoint.
disable-model-invocation: true
---

This skill takes the current conversation context and codebase understanding and produces a PRD. Do NOT interview the user about requirements — synthesize what you already know; the Step 2 seam confirmation is the sole sanctioned checkpoint.

The issue tracker and triage label vocabulary should have been provided to you — run `/setup-matt-pocock-skills` if not.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Use the project's domain glossary vocabulary throughout the PRD, and respect any ADRs in the area you're touching.

2. Sketch out the seams at which you're going to test the feature. Existing seams should be preferred to new ones. Use the highest seam possible. If new seams are needed, propose them at the highest point you can. The fewer seams across the codebase, the better - the ideal number is one.

When the PRD's scope includes non-code deliverables (ADRs, specs, doc packs), sketch seams for the implementation surface only, and state in Testing Decisions which deliverables are covered by review/conformance mechanisms rather than tests.

Check with the user that these seams match their expectations. If the confirmation goes unanswered (the user is away), proceed only when the sketch reuses existing seams unchanged — and record in Further Notes that seam confirmation timed out and the seams are open to veto. If the sketch proposes any new seam, stop without publishing and leave the sketch as the turn's deliverable.

3. Write the PRD using the template below, then publish it to the project issue tracker. Verify the `ready-for-agent` label exists before creating the issue (create it per the project's triage-label doc if absent), then apply it - no need for additional triage.

<prd-template>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list of user stories should be extremely extensive and cover all aspects of the feature.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly. Citations of principle, ADR, and spec documents are exempt — they are stable identifiers and are themselves the conformance mechanism.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype. Trim to the decision-rich parts — not a working demo, just the important bits.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested
- Prior art for the tests (i.e. similar types of tests in the codebase), named descriptively (package + kind of test) rather than by file path, consistent with the Implementation Decisions rule

## Principles

The conformance-rule section this repo requires of every implementable issue (`docs/principles/README.md`): name the principle documents and ADRs this PRD touches, affirm non-contradiction with them, and flag any deliberate exception to the steward before implementation.

## Out of Scope

A description of the things that are out of scope for this PRD.

## Further Notes

Any further notes about the feature. When the synthesized requirements rest on provisional or unratified decisions (e.g., an interview the user never answered), say so here and mark them open to veto before grooming.

</prd-template>