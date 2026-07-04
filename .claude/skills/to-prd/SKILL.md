---
name: to-prd
description: Turn the current conversation into a PRD and publish it to the project issue tracker — no requirements interview, just synthesis of what you've already discussed; the seam confirmation is the sole checkpoint.
disable-model-invocation: true
---

This skill takes the current conversation context and codebase understanding and produces a PRD. Do NOT interview the user about requirements — synthesize what you already know; the Step 2 seam confirmation is the sole sanctioned checkpoint.

The issue tracker and triage label vocabulary should have been provided to you — run `/setup-matt-pocock-skills` if not. Before publishing, read the project's issue-tracker and triage-label docs (per `CLAUDE.md`) if you haven't this session.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Run `git status --short` during intake. If dirty files are unrelated to the PRD and are not cited by it, continue and mention them in final reporting; if a dirty or untracked file is cited by the PRD, apply the durability rule in Step 3 before publishing. Use the project's domain glossary vocabulary throughout the PRD, and respect any ADRs in the area you're touching. Fetch the most recent published PRD issue(s) of the same kind/shape (e.g. feature-flow vs. architecture-seam vs. doc-pack) and match their house style — title format, provenance preamble, story phrasing, and cross-referencing conventions. The tracker mixes PRD kinds, so the most recent PRD overall may be a different shape than what you're writing; when it is, fall back to the most recent same-kind PRD for house style. Start with a compact issue list that fetches only small fields such as number, title, state, URL, labels, and updated time; do not include full bodies in a broad PRD list. Broad issue search can match issue bodies or backlog notes, so filter exemplar candidates to issue titles that start with `PRD:` before selecting the same-kind PRDs to emulate. Then fetch the one or two relevant PRDs by number with `gh issue view`.

2. Sketch out the seams at which you're going to test the feature. Existing seams should be preferred to new ones. Use the highest seam possible. If new seams are needed, propose them at the highest point you can. The fewer seams across the codebase, the better - the ideal number is one.

When the PRD's scope includes non-code deliverables (ADRs, specs, doc packs), sketch seams for the implementation surface only, and state in Testing Decisions which deliverables are covered by review/conformance mechanisms rather than tests.

When the PRD is a behavior-preserving refactor or architecture-seam hardening — a first-class PRD kind here, and often the dominant one — the seam sketch is usually not new seams at all: reuse the existing seams unchanged, treat the existing tests as the specification, and make behavior preservation the acceptance bar. State that explicitly rather than inventing new test seams. Such a sketch introduces no new seam, so it proceeds even if the seam confirmation times out.

Check with the user that these seams match their expectations. This is a mandatory Step 2 checkpoint unless the current conversation already contains an explicit same-session ratification of the exact testing seams and the user asks to publish or create the intended PRD. In that answered case, record `## Testing Decisions` and `## Further Notes` as answered with the ratified seams. Otherwise, ask the seam-confirmation question and wait. If that actual prompt goes unanswered — or the session is explicitly autonomous/away — proceed only when the sketch reuses existing seams unchanged, and record in Further Notes that seam confirmation timed out and the seams are open to veto. If the sketch proposes any new seam, stop without publishing and leave the sketch as the turn's deliverable.

3. Write the PRD using the template below, then publish it to the project issue tracker. Title the issue `PRD: <name> — <key mechanisms>`, matching prior PRDs. The issue title is set via `--title`; the body (or `--body-file`) begins at the preamble and must not repeat the title as an H1 heading.

Before publishing, sweep the whole PRD for ephemeral local paths (for example `/tmp/...`, temp files, or machine-local scratchpads); durable PRDs should summarize those artifacts' relevant conclusions or first archive the artifact somewhere durable before citing it. When the user cited a temporary report or scratch artifact, preserve the selected finding/title and a short "temporary source summarized, not cited" note in the preamble or Further Notes instead of publishing the local path. Temporary body files are fine as local staging, but sweep the PRD body itself and never cite the staging path in the published issue.

When the PRD cites a local ADR, spec, principle, methodology document, or issue/PR that was created or modified in this session — or ratified this session as a decision to author later but not yet written — check its repo durability before publishing. If a cited local document is untracked or otherwise not yet durable, do not silently present it as a stable published artifact: either summarize its ratified conclusion without durable-citation wording, or record in Further Notes that the artifact is pending local repo publication (for a ratified-but-unwritten artifact, note it as pending authoring and publication, not merely publication). Do not add a second user checkpoint for this; the seam confirmation remains the sole checkpoint.

Before creating the issue, run a template-conformance pass over the body, not just a section-presence scan:

- The body starts with an untitled provenance preamble and does not repeat the title as an H1.
- `## User Stories` is a numbered list, and each story follows `As an <actor>, I want <feature>, so that <benefit>` rather than a looser bullet or `I can` format.
- `## Testing Decisions` states the external-behavior testing rule, names the tested modules or surfaces, names prior-art tests descriptively rather than by file path, and records the seam-confirmation outcome.
- `## Principles` names the touched principle documents and ADRs, affirms non-contradiction with them, and flags any deliberate exception before implementation.
- `## Further Notes` records the seam-confirmation outcome: answered with the ratified seams, or timed out with the seams open to veto.

For a staged body file, a compact local validation pass can check the same shape before `gh issue create`:

```sh
BODY_FILE=path/to/prd-body.md
node -e 'const fs=require("fs"); const b=fs.readFileSync(process.argv[1],"utf8"); const checks={startsUntitled:!b.startsWith("#"),hasProblem:b.includes("## Problem Statement"),hasSolution:b.includes("## Solution"),hasStories:b.includes("## User Stories"),hasImplementation:b.includes("## Implementation Decisions"),hasTesting:b.includes("## Testing Decisions"),hasPrinciples:b.includes("## Principles"),hasOutOfScope:b.includes("## Out of Scope"),hasFurtherNotes:b.includes("## Further Notes"),hasSeam:b.includes("Seam confirmation"),hasNoTmp:!b.includes("/tmp"),hasNoHome:!b.includes("/home/"),hasNoH1:!/^# /m.test(b),storyCount:[...b.matchAll(/^[0-9]+\. As an? .+, I want .+, so that .+$/gm)].length}; console.log(JSON.stringify(checks,null,2)); if(Object.entries(checks).some(([k,v])=>k!=="storyCount"&&!v)||checks.storyCount<1) process.exit(1);' "$BODY_FILE"
```

If any item fails, edit the body before publishing. After publication, if the verification query shows a section exists but the section is malformed or incomplete under this checklist, edit the issue and re-run verification before final reporting.

Choose the publication label from the PRD's decision status before creating the issue. If no provisional, unratified, timed-out, or open-to-veto decisions remain, verify the `ready-for-agent` label exists (create it per the project's triage-label doc if absent; a verification earlier in the same session suffices), then apply it — no additional triage is needed. If any provisional, unratified, timed-out, or open-to-veto decision remains, do not apply `ready-for-agent`; apply `needs-triage` instead, verify that label exists the same way, and record in the final report that the PRD is not AFK-ready until those decisions are ratified. A current `gh issue list` or `gh issue view` response from the same repo that shows the exact chosen label is sufficient label-existence verification; use `gh label list` only when no current issue metadata has shown it or label creation may be needed. After creation, verify the published issue with `gh issue view`: confirm the title, body, chosen label, state, URL, every required PRD section, seam-confirmation note, template-conformance checklist, and absence of machine-local path leakage before final reporting. Prefer a compact verification query that checks key fields and body sections instead of dumping the full body, for example:

```sh
gh issue view <number> --json number,title,body,labels,state,url --jq '{number,title,state,url,labels:[.labels[].name],hasReady:(any(.labels[].name; . == "ready-for-agent")),hasNeedsTriage:(any(.labels[].name; . == "needs-triage")),hasProblem:(.body | contains("## Problem Statement")),hasSolution:(.body | contains("## Solution")),hasStories:(.body | contains("## User Stories")),hasImplementation:(.body | contains("## Implementation Decisions")),hasTesting:(.body | contains("## Testing Decisions")),hasPrinciples:(.body | contains("## Principles")),hasOutOfScope:(.body | contains("## Out of Scope")),hasFurtherNotes:(.body | contains("## Further Notes")),hasSeam:(.body | contains("Seam confirmation")),hasNoTmp:((.body | contains("/tmp")) | not),hasNoHome:((.body | contains("/home/")) | not),hasNoH1:((.body | test("(?m)^# ")) | not),storyCount:([.body | scan("(?m)^[0-9]+\\. As an? .+, I want .+, so that .+$")] | length)}'
```

Remove any temporary body file you created, run `git status --short`, and include only remaining pre-existing or intentional dirty files in the final report.

<prd-template>

[Preamble — an untitled paragraph before the first section: provenance (which session or decision determined this PRD), what prior PRD or commitment it follows or discharges, and the ratification status of its decisions.]

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

Do NOT include specific file paths, code snippets, or volatile code symbols (function, variable, or private-helper names). They may end up being outdated very quickly. Stable data-model identifiers, by contrast, are acceptable and expected — schema table and column names, controlled-vocabulary names, link-type and record-type keys, and route/endpoint names — since they match house style (prior flow PRDs cite them freely) and are themselves conformance anchors. Citations of principle, ADR, spec, prior issue/PR, and methodology-module documents are exempt — they are stable identifiers and are themselves the conformance mechanism.

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

Any further notes about the feature. When the synthesized requirements rest on provisional or unratified decisions (e.g., an interview the user never answered), say so here and mark them open to veto before grooming — and record the seam-confirmation outcome either way (answered: name the seams ratified; timed out: open to veto), so a groomer can tell which parts of the PRD stand ratified and which do not.

</prd-template>
