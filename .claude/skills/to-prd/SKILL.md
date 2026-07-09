---
name: to-prd
description: Turn the current conversation into a PRD and publish it to the project issue tracker — no requirements interview, just synthesis of what you've already discussed; the seam confirmation is the sole checkpoint.
disable-model-invocation: true
---

This skill takes the current conversation context and codebase understanding and produces a PRD — or, when the invocation covers a ratified program of several, one PRD per program entry (see the Program of PRDs note in Step 3). Do NOT interview the user about requirements — synthesize what you already know; the Step 2 seam confirmation is the sole sanctioned checkpoint.

The issue tracker and triage label vocabulary should have been provided to you — run `/setup-matt-pocock-skills` if not. Before publishing, read the project's issue-tracker and triage-label docs (per `CLAUDE.md` or `AGENTS.md`) if you haven't this session.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Run `git status --short` during intake. If dirty files are unrelated to the PRD and are not cited by it, continue and mention them in final reporting; if a dirty or untracked file is cited by the PRD, apply the durability rule in Step 3 before publishing. If repo entrypoint guidance (`CLAUDE.md` or `AGENTS.md`) is not already loaded this session, read it and follow it to the domain vocabulary source, relevant ADRs, principles authority, issue tracker docs, and triage-label docs before drafting. When a source artifact, exemplar, or entrypoint names an ADR by number, resolve the exact `docs/adr/<number>-*.md` path with the uniqueness rule in Step 3 before opening it; do not guess ADR filenames. Before drafting, make the intake state explicit in your working notes: `git status` checked; entrypoint guidance read or still in context; domain vocabulary source read or intentionally N/A; domain workflow doc named by the entrypoint read or N/A; issue-tracker and triage-label docs read; relevant ADRs and principles authority read; source artifact loaded; and same-kind PRD exemplars fetched. If an entrypoint-named item does not exist, record it as absent rather than silently skipping it. Use the project's domain glossary vocabulary throughout the PRD, and respect any ADRs in the area you're touching. Fetch the most recent published PRD issue(s) of the same kind/shape (e.g. feature-flow vs. architecture-seam vs. doc-pack) and match their house style — title format, provenance preamble, story phrasing, and cross-referencing conventions. The tracker mixes PRD kinds, so the most recent PRD overall may be a different shape than what you're writing; when it is, fall back to the most recent same-kind PRD for house style. Start with a compact issue list that fetches only small fields such as number, title, state, URL, labels, and updated time; do not include full bodies in a broad PRD list. Broad issue search can match issue bodies or backlog notes, so filter exemplar candidates to issue titles that start with `PRD:` before selecting the same-kind PRDs to emulate. Then fetch the one or two relevant PRDs by number with `gh issue view`; for very large exemplars, start with compact metadata plus a bounded body slice or named key sections, and fetch the full body only if house style remains unclear.

2. Sketch out the seams at which you're going to test the feature. Existing seams should be preferred to new ones. Use the highest seam possible. If new seams are needed, propose them at the highest point you can. The fewer seams across the codebase, the better - the ideal number is one.

When the PRD's scope includes non-code deliverables (ADRs, specs, doc packs), sketch seams for the implementation surface only, and state in Testing Decisions which deliverables are covered by review/conformance mechanisms rather than tests.

When the PRD is a behavior-preserving refactor or architecture-seam hardening — a first-class PRD kind here, and often the dominant one — the seam sketch is usually not new seams at all: reuse the existing seams unchanged, treat the existing tests as the specification, and make behavior preservation the acceptance bar. State that explicitly rather than inventing new test seams. Such a sketch introduces no new seam, so it proceeds even if the seam confirmation times out.

Check with the user that these seams match their expectations. This is a mandatory Step 2 checkpoint unless the current conversation already contains an explicit same-session ratification of the exact testing seams and the user asks to publish or create the intended PRD. In that answered case, record `## Testing Decisions` and `## Further Notes` as answered with the ratified seams. Otherwise, ask the seam-confirmation question and wait. If that actual prompt goes unanswered — or the session is explicitly autonomous/away — proceed only when the sketch reuses existing seams unchanged, and record in Further Notes that seam confirmation timed out and the seams are open to veto. If the sketch proposes any new seam, stop without publishing and leave the sketch as the turn's deliverable.

If `/to-prd` follows a same-session determination that selected an intended PRD but marked product-scope decisions provisional, treat the user's explicit request to create or publish that intended PRD as ratification of the selected product scope unless they ask only for a draft, keep named decisions open, or revise the recommendation. This does not replace the seam checkpoint above: seams still need same-session ratification, timeout handling, or the unchanged-existing-seam exception.

Before drafting, classify the publication package as one of: a single intended PRD, a ratified multi-PRD program, or a first PRD plus deferred follow-on candidates. If a source artifact names follow-on PRD candidates but also selects a recommended first PRD, publish only that first PRD unless the user explicitly asks to publish the whole program; record the deferred candidates in Out of Scope or Further Notes so they are not silently ratified.

3. Write the PRD using the template below, then publish it to the project issue tracker. Title the issue `PRD: <name> — <key mechanisms>`, matching prior PRDs. The issue title is set via `--title`; the body (or `--body-file`) begins at the preamble and must not repeat the title as an H1 heading.

Program of PRDs: when the invocation or its source determination covers several sequenced PRDs (for example "create PRDs as necessary" over a ratified program), the per-PRD workflow in this step applies to each body — every body gets its own artifact sweep, template validation, publication, and verification. Publication packaging (how many issues now, their sequence and dependencies, and — when the label is not fully determined by decision status — the publication label) rides the Step 2 checkpoint as one additional question in the same call — still the sole checkpoint. Bodies drafted before issue numbers exist reference siblings generically ("the first program PRD"); after creation, resolve those references to concrete numbers via a sequence comment on each issue or a body edit, stating each PRD's position and any label flip condition. If sequence comments are used, post the same concrete sequence comment to every issue in the program and verify each issue with `gh issue view --json comments` that the comment is present and names the concrete issue numbers. If body edits are used instead, verify each edited body contains the concrete sibling numbers before final reporting.

Before publishing, sweep the whole PRD for ephemeral local paths (for example `/tmp/...`, temp files, or machine-local scratchpads); durable PRDs should summarize those artifacts' relevant conclusions or first archive the artifact somewhere durable before citing it. When the user cited a temporary report or scratch artifact, preserve the selected finding/title and a short "temporary source summarized, not cited" note in the preamble or Further Notes instead of publishing the local path. Temporary body files are fine as local staging, but sweep the PRD body itself and never cite the staging path in the published issue.

For staged issue bodies, prefer an outside-worktree path such as `/tmp/worldloom-prd-<slug>.md` when the active environment permits creating it safely. If the active editing rules forbid shell write tricks or make outside-worktree editing awkward, use a clearly temporary repo-local hidden file such as `reports/.tmp-prd-<slug>.md`, create and delete it with the environment-approved edit mechanism, and verify cleanup before final reporting. In Codex-style sessions, create and delete both `/tmp` and repo-local staged body files with the environment-approved edit mechanism (`apply_patch` when available) rather than shell redirection, heredocs, or unapproved `rm`.

When the PRD cites a local ADR, spec, principle, methodology document, report, research brief, field-trial report, issue/PR, or other source artifact that was created or modified in this session — or ratified this session as a decision to author later but not yet written — check its repo durability before publishing. If a cited local document or source artifact is untracked or otherwise not yet durable, do not silently present it as a stable published artifact: either summarize its ratified conclusion without durable-citation wording, or record in Further Notes that the artifact is pending local repo publication (for a ratified-but-unwritten artifact, note it as pending authoring and publication, not merely publication). Do not add a second user checkpoint for this; the seam confirmation remains the sole checkpoint.

For staged bodies, run a repo-local artifact sweep before the template check. Extract local-looking source paths, decide which are actual source citations rather than examples, and verify each cited artifact is tracked or otherwise durable. A compact helper can list likely paths:

```sh
BODY_FILE=path/to/prd-body.md
node -e 'const fs=require("fs"); const b=fs.readFileSync(process.argv[1],"utf8"); const paths=[...new Set([...b.matchAll(/(?:^|[\s([`])((?:docs|reports|archive)\/[A-Za-z0-9._/-]+)/g)].map(m=>m[1].replace(/[).,;:`]+$/,"")))]; console.log(paths.join("\n"));' "$BODY_FILE"
```

For each emitted path that the PRD relies on as a source citation, run `git ls-files --error-unmatch <path>` or an equivalent repo-durability check before publishing. Tracked-ness alone is not durability: also intersect the cited paths with `git status --porcelain` — a cited file that is modified, staged, or untracked carries content no commit contains yet, and when the citation leans on that session-authored content, it gets the same treatment as an untracked artifact. Also verify publication-ref visibility for every tracked/clean cited source path: resolve the repository publication ref, normally `origin/main` or the default branch remote ref, and run `git ls-tree -r --name-only <publication-ref> -- <paths>`. If a cited artifact is missing from the publication ref, replace the citation with a conclusion summary plus "pending local publication" wording, or stop before publishing when the PRD cannot be accurate without a stable source citation. If a cited artifact fails any tracked, clean, or publication-ref check, replace the citation with a conclusion summary plus "temporary source summarized, not cited" wording, or record that the artifact is pending authoring/commit/publication as appropriate.

Use direct repo commands for the durability proof rather than wrapping `git` calls inside a helper that can fail under the active sandbox: after path extraction and ADR shorthand resolution, run `git status --porcelain -- <paths>`, `git ls-files --error-unmatch <paths>`, and `git ls-tree -r --name-only origin/main -- <paths>`. A clean status, tracked-path readback, and publication-ref readback together are the durable-citation proof; if the publication ref is not `origin/main`, substitute the resolved default branch ref and name it in the final report.

Also scan for ADR shorthand such as `ADR 0006`, `ADR 0008`, or `ADR 0009`. Resolve each unique shorthand reference to exactly one `docs/adr/<number>-*.md` file and run the same tracked/dirty durability checks on that resolved path. If no ADR file resolves, or more than one file resolves, treat the shorthand as unresolved and either cite a durable explicit path, summarize the decision without a stable citation, or stop before publishing if the PRD cannot be accurate without it.

Before creating the issue, run a template-conformance pass over the body, not just a section-presence scan:

- The body starts with an untitled provenance preamble and does not repeat the title as an H1.
- `## User Stories` is a numbered list, and each story follows `As an <actor>, I want <feature>, so that <benefit>` rather than a looser bullet or `I can` format.
- `## Testing Decisions` states the external-behavior testing rule, names the tested modules or surfaces, names prior-art tests descriptively rather than by file path, and records the seam-confirmation outcome.
- `## Principles` names the touched principle documents and ADRs, affirms non-contradiction with them, and flags any deliberate exception before implementation.
- `## Further Notes` records the seam-confirmation outcome: answered with the ratified seams, or timed out with the seams open to veto.

For a staged body file, a compact local validation pass can check the same shape before `gh issue create`. Set `EXPECT_CHECKLIST=1` for PRDs subject to the browser-visible guidance checklist gate:

```sh
BODY_FILE=path/to/prd-body.md
node -e '
const fs=require("fs");
const b=fs.readFileSync(process.argv[1],"utf8");
const expectsChecklist=process.env.EXPECT_CHECKLIST==="1";
const storyRe=/^[0-9]+\. As an? .+, I want .+, so that .+$/;
const storyLines=[...b.matchAll(/^[0-9]+\. As .+$/gm)].map(m=>m[0]);
const badStories=storyLines.filter(s=>!storyRe.test(s));
const checklistItems=[
  "package source cited",
  "decision-point contract named",
  "required, optional, skippable, and severity-dependent fields visible",
  "doctrine at the actual decision point",
  "prompt packet preview, source manifest, and cold external LLM test",
  "advisory/canon separation visible",
  "skip path and reason storage",
  "blockers/substance validation",
  "current, next, and resume state",
  "read-side audit or provenance link",
  "cognitive walkthrough scenario"
];
const lines=b.split(/\r?\n/);
const checklistMissing=expectsChecklist?checklistItems.filter(item=>!lines.some(line=>line.includes(item)&&(/N\/A - .+/.test(line)||/(preamble|Problem Statement|Solution|User Stories|Implementation Decisions|Testing Decisions|Principles|Further Notes|covered|covers|home)/i.test(line)))):[];
const checks={startsUntitled:!b.startsWith("#"),hasProblem:b.includes("## Problem Statement"),hasSolution:b.includes("## Solution"),hasStories:b.includes("## User Stories"),hasImplementation:b.includes("## Implementation Decisions"),hasTesting:b.includes("## Testing Decisions"),hasPrinciples:b.includes("## Principles"),hasOutOfScope:b.includes("## Out of Scope"),hasFurtherNotes:b.includes("## Further Notes"),hasSeam:b.includes("Seam confirmation"),hasChecklist:b.includes("Browser-visible guidance checklist mapping"),hasChecklistItems:!expectsChecklist||checklistMissing.length===0,hasNoTmp:!b.includes("/tmp"),hasNoHome:!b.includes("/home/"),hasNoH1:!/^# /m.test(b),storyCount:storyLines.length-badStories.length};
console.log(JSON.stringify({...checks,checklistMissing},null,2));
if(badStories.length){console.log("Non-conforming stories:"); badStories.forEach(s=>{const why=[]; if(!/^[0-9]+\. As an? /.test(s))why.push("As a/As an prefix"); if(s.indexOf(", I want ")<0)why.push("comma before I want"); if(s.indexOf("so that ")<0)why.push("missing so-that benefit clause"); else if(s.indexOf(", so that ")<0)why.push("comma before so that"); console.log("  "+s+"  [missing: "+(why.join(", ")||"clause order/format")+"]");});}
if(checklistMissing.length){console.log("Missing checklist rows/items:"); checklistMissing.forEach(item=>console.log("  "+item));}
const requiredFailures=Object.entries(checks).filter(([k,v])=>!["storyCount","hasChecklist","hasChecklistItems"].includes(k)&&!v);
if(expectsChecklist&&!checks.hasChecklist) requiredFailures.push(["hasChecklist",false]);
if(expectsChecklist&&!checks.hasChecklistItems) requiredFailures.push(["hasChecklistItems",false]);
if(requiredFailures.length||checks.storyCount<1||badStories.length) process.exit(1);
' "$BODY_FILE"
```

If any item fails, edit the body before publishing. With `EXPECT_CHECKLIST=1`, `checklistMissing` must be empty: every current issue-tracker checklist item must have a row or stable anchor in the PRD body, and each row must identify a covering PRD home or `N/A - <reason>`. After publication, if the verification query shows a section exists but the section is malformed or incomplete under this checklist, edit the issue and re-run verification before final reporting.

Choose the publication label from the PRD's decision status before creating the issue. Label proof order: first use current same-kind exemplar metadata or exact issue metadata that already shows the chosen labels; call `gh label list` only when no current issue metadata proves the exact labels or label creation may be needed. For this label decision, the explicit create/publish request described in Step 2 ratifies only the selected product scope; unresolved seam decisions, draft-only requests, named open decisions, or revised recommendations still count as unresolved. Distinguish a blocking open decision — an unresolved scope or seam choice that leaves the PRD not AFK-actionable — from a recommended-default note, a specified implementation direction the body records as open to groomer refinement: a recommended-default note does not by itself force `needs-triage` when product scope and seams are ratified and an AFK agent could implement the specified direction as written. If the user makes an explicit label choice at the Step 2 publication/packaging checkpoint, that choice governs the label and is recorded as ratification. If no provisional, unratified, timed-out, or open-to-veto decisions remain, verify the `ready-for-agent` label exists (create it per the project's triage-label doc if absent; a verification earlier in the same session suffices), then apply it — no additional triage round-trip is needed, but pre-label acceptance checks the project's issue-tracker doc imposes still apply: in this repo, a PRD touching a guided flow, prompt-out, Canon Workbench provenance, or browser workflow navigation must satisfy the issue-tracker doc's browser-visible guidance acceptance checklist before `ready-for-agent` is applied. Treat this as a checked gate, not a self-assertion: before applying `ready-for-agent`, enumerate the issue-tracker doc's acceptance items and confirm each maps to a PRD section that carries it (the provenance preamble, Problem Statement/Solution, User Stories, Implementation Decisions, Testing Decisions, or Principles — package-source and doctrine citations typically live in the preamble and Principles), applying the same mechanized rigor as the template-conformance and post-publication checks. For every PRD subject to this gate, add an explicit body paragraph or table headed with the exact marker `Browser-visible guidance checklist mapping` before publication; for each checklist item, record the PRD home that covers it or `N/A - <reason>`. For staged bodies subject to this gate, check that the marker is present before publication, and include a `hasChecklist` or equivalent body readback check after publication. Distinguish an item whose trigger condition is absent from an item that applies but is unhomed: many issue-tracker acceptance items are conditional ("where relevant", "when prompt-out is in scope", "when the slice writes records", "when an instrument can be declined", "when the browser task grammar changes"), and an item whose condition does not hold is N/A — record it and move on; it does not force `needs-triage`. Only an item that applies but has no home in the body is unmet; if any applicable item is unmet, apply `needs-triage` instead and name the unmet items in the final report. If any provisional, unratified, timed-out, or open-to-veto decision remains, do not apply `ready-for-agent`; apply `needs-triage` instead, verify that label exists the same way, and record in the final report that the PRD is not AFK-ready until those decisions are ratified. A third case is sequencing, not ratification: a fully-ratified PRD whose start is blocked by an unclosed predecessor may carry `needs-triage` (or the repo's blocked-equivalent label) with the flip condition recorded on the issue itself; report it as sequenced, not as unratified. A current `gh issue list` or `gh issue view` response from the same repo that shows the exact chosen label is sufficient label-existence verification; use `gh label list` only when no current issue metadata has shown it or label creation may be needed. Apply the chosen triage label alongside whatever non-triage type label the same-kind exemplar PRDs carry (for example `enhancement`), confirmed from the exemplar's fetched metadata rather than assumed. After creation, verify the published issue with `gh issue view`: confirm the title, body, chosen label, state, URL, every required PRD section, seam-confirmation note, template-conformance checklist, browser-visible checklist mapping when applicable, and absence of machine-local path leakage before final reporting. Mirror the pre-publication source-path sweep against the published body: extract `docs/`, `reports/`, and `archive/` paths from the issue body and compare them with the staged body's approved durable citation list. When an untracked, dirty, temp-only, or publication-ref-missing source was summarized rather than cited, explicitly verify that its local path did not leak into the published body. Prefer a compact verification query that checks key fields and body sections and exposes local-source paths for comparison instead of dumping the full body, for example:

```sh
gh issue view <number> --json number,title,body,labels,state,url --jq '(.body) as $body | (["package source cited","decision-point contract named","required, optional, skippable, and severity-dependent fields visible","doctrine at the actual decision point","prompt packet preview, source manifest, and cold external LLM test","advisory/canon separation visible","skip path and reason storage","blockers/substance validation","current, next, and resume state","read-side audit or provenance link","cognitive walkthrough scenario"]) as $checklistItems | {number,title,state,url,labels:[.labels[].name],hasReady:(any(.labels[].name; . == "ready-for-agent")),hasNeedsTriage:(any(.labels[].name; . == "needs-triage")),hasProblem:($body | contains("## Problem Statement")),hasSolution:($body | contains("## Solution")),hasStories:($body | contains("## User Stories")),hasImplementation:($body | contains("## Implementation Decisions")),hasTesting:($body | contains("## Testing Decisions")),hasPrinciples:($body | contains("## Principles")),hasOutOfScope:($body | contains("## Out of Scope")),hasFurtherNotes:($body | contains("## Further Notes")),hasSeam:($body | contains("Seam confirmation")),hasChecklist:($body | contains("Browser-visible guidance checklist mapping")),hasChecklistItems:(($checklistItems | map(. as $item | select(($body | contains($item)) | not)) | length) == 0),checklistMissing:($checklistItems | map(. as $item | select(($body | contains($item)) | not))),hasNoTmp:(($body | contains("/tmp")) | not),hasNoHome:(($body | contains("/home/")) | not),hasNoH1:(($body | test("(?m)^# ")) | not),localSourcePaths:([$body | scan("(?m)(?:docs|reports|archive)/[A-Za-z0-9._/-]+")]),storyCount:([$body | scan("(?m)^[0-9]+\\. As an? .+, I want .+, so that .+$")] | length)}'
```

If interrupted, resumed, or compacted after issue creation begins, first recover the issue number without creating a duplicate. When the number is unknown, do not retry `gh issue create` until you have searched by exact title with `gh issue list --state all --search '"<title>" in:title' --json number,title,state,url,labels,updatedAt --limit 10`; use the single exact-title match, stop and report if multiple matches exist, and retry creation only after proving no matching issue was created. Then re-run the compact `gh issue view` verification, re-check the published body's local-source paths against the approved durable citation list, check whether any temporary body file still exists and remove it if needed, then re-run `git status --short` before final reporting.

Remove any temporary body file you created using the environment-approved edit/removal mechanism, run `git status --short`, and include only remaining pre-existing or intentional dirty files in the final report. For temporary body files outside the repository, verify cleanup with direct existence checks such as `test ! -e <path>`; repo-local Git status cannot prove cleanup of files outside the worktree.

<prd-template>

[Preamble — an untitled paragraph before the first section: provenance (which session or decision determined this PRD), what prior PRD or commitment it follows or discharges, and the ratification status of its decisions.]

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

Keep a literal comma directly before `so that` (and before `I want`) — an em-dash, semicolon, or other punctuation in place of that comma fails the staged-body story-conformance check even when the sentence reads fine.

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
