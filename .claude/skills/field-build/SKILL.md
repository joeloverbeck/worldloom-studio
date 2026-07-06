---
name: field-build
description: "End-to-end field build — author a real world from the user's seed by walking the operating-card new-world path start to finish while driving the running web app in lockstep, holding the methodology docs open only as the yardstick, exercising both prompt-out modes at every decision point through a cold-LLM subagent, and reporting every place the app still leans on the docs so it can be driven toward fully encoding the methodology (obsoleting the docs) in reports/*."
disable-model-invocation: true
---

# Field Build

The goal state is the app **alone**: a steward building a world with the worldbuilding-system docs *closed*, because the app has fully encoded them. Today it hasn't — so this skill measures the distance to that goal and drives it down. You build a real world from the user's seed with the docs open in one hand **only as the standard** — the yardstick every screen is checked against, never a permanent part of the loop — and the app in the other, walking the operating-card new-world path from kernel to QA. Every place the app fails to make the docs unnecessary is the finding; one report drives the app toward doc-obsolescence and keeps the source of truth itself clean.

It is the **sighted** cousin of `parity-field-trial`. That skill drives the app *blind* to find where a docs-naive steward gets stranded, and stops at one PRD's worth. This one holds the docs open **as the standard** — not because the loop needs them, but to catch every way the app still falls short of fully encoding them. The question is not "can a blind steward cross this?" but "if the docs vanished tomorrow, what would this steward have lost — what does the app still fail to carry?" It walks the **entire** new-world path, not one PRD scope.

The **cold LLM** is the load-bearing probe. At each decision point the app generates a self-contained prompt packet; you hand that packet — and nothing else — to a fresh subagent. If a context-free subagent answers it well, the packet carries the right context (`docs/specs/prompt-out-context-assembly.md`'s cold-LLM test). If it answers badly, the packet is the finding.

Three roles, kept honest:

- **steward-author** — reads the governing protocol *as the standard* and authors each decision from your own judgment first, faithful to the file and to the user's essence, never to memory.
- **app-driver** — drives the running UI through browser automation (Puppeteer or Chrome DevTools MCP). Parity is settled in the running UI, never inferred from source or tests — the trap issues #109–#113 caught.
- **cold LLM** — a fresh subagent handed ONLY the app's generated prompt text. It never sees the world, the docs, or this conversation. Its answer is raw candidate material, never a decision.

## Step 1 — Take the seed and set up

- **Get the essence.** The user's world seed *is* the world's essence — the generating tension the world exists to explore (`05` Phase 1). If the invocation carried no seed, ask for one before anything else; a one-line premise is enough (e.g. "sentient humanoid animals; a skill-and-grit sport resolves the disputes war doesn't"). Never proposal-mode the essence — `20` reserves it to the steward and the app refuses proposal on the kernel World premise; you author it from the user's words.
- **Read the frontier.** If a prior `reports/field-build-*.md` or its live log exists for this seed, read it: the world's name, which stages are walked, where to resume. No prior run ⇒ this is run `01`, a cold start.
- **Baseline the worktree.** Run `git status --short` before the walk and record existing dirt in the live log, so you never later claim it.
- **Start or reuse the app.** If no repo-root dev server answers, run `pnpm dev` in the background (builds `@worldloom/shared`, Hono API on `127.0.0.1:4173`, Vite UI on `127.0.0.1:5173` with `/api` proxied); `pnpm install --frozen-lockfile` first if deps are missing. Reuse a running server only after verifying UI and API answer, and record the reuse and observed URLs. If Vite drifts off `5173`, use and log the actual URL. If the server prints healthy URLs but the browser or `curl` context cannot reach them, treat it as a local binding/sandbox-visibility blocker: log the printed and observed URLs, restart or reuse the server from a context visible to browser automation with approval as needed, then continue.
- **Open browser automation** at the live Vite URL and screenshot the entry screen.
- **Open a live log** at `/tmp/worldloom-field-build/build-log.md` (or the scratchpad): append-only, raw. It is the build's evidence trail and its resume point, not the deliverable — polish belongs in the report.
- **Create or reopen the world.** There is no URL routing and no separate "world name" field — a world is a local SQLite file identified by its path. On the setup panel, type a stable path (e.g. `…/<world-slug>.worldloom.sqlite`) into **World file path** and click **Create world** (run 01) or **Open world** (resume); record the path — resumes must reopen the same file. On success the app switches to the Workflow-map home.
- **Handle setup blockers honestly.** If world creation/opening or port visibility blocks reaching methodology work, screenshot, capture the console/network/disk evidence that explains it, log it as a finding, and — if the build cannot start at all — go straight to the report.

**Complete when:** app answering on the live Vite URL, browser on the workflow-map home with the world open, essence in hand, frontier known, baseline recorded, live log open.

## Step 2 — Build the world, one decision point at a time

Follow the operating-card **new-world path** (crosswalk below) in order: kernel → seed decomposition → seed audit → admission → propagation → the specialized passes each admitted fact actually triggers → QA. Read the doctrine files (`01`, `03`) so you author faithfully; the reference files (`02`, `19`, `21`–`23`) are consulted, not walked.

A **decision point** is one coherent block of material the method asks you to author — W-1's prompt grain and the app's `decision-point/v1` unit, not a single naked field. For the kernel, treat the World premise as its own essence decision. The remaining kernel sections may be worked as one coherent kernel-authoring block unless the live app exposes section-specific decision-point packets; if it does, test those sections separately. If the app keeps a generic packet while a section is selected, one representative cold-LLM test is enough to log the binding gap instead of exploding the kernel into artificial single-field tests. At each decision point, run this beat and log every line of it:

1. **Author (docs-first).** Read the governing protocol for this decision point. Author the material yourself from the essence and the current world state — your draft, *before* the app says anything. This is the steward judgment the whole loop serves.
2. **Propose.** In the app, reach this decision point and find its prompt-out. Generate the **proposal** prompt (draft-candidate mode). *Confirm the preview renders* — the `Prompt-out preview` panel showing the packet text (anchor `pre.prompt-packet-text`, or the admin panel's textarea). **No visible preview is an app failure — log P.** Copy the packet verbatim, hand it to a **cold LLM** subagent (only the packet, no other context), and read the answer: fitting for *this* world's current state, or generic/off-tone? Then, as steward, select/edit/discard and author the surviving material into the real field — adoption is authorship; never paste a raw answer into a canon field. *(Essence exception: at the kernel World premise the app refuses proposal — that refusal is correct; log it a V and go to Pressure.)*
3. **Pressure.** With the field now authored, generate the **pressure** prompt (challenge mode) on that material and confirm its preview. Hand the packet to a fresh cold LLM. Read the challenge — missing prerequisites, contradictions, off-tone drift, mystery damage — and revise the field where the challenge earns it. If the app offers no pressure mode where authored material exists, log P.
4. **Present.** Compare the screen to the protocol: does the app surface *exactly* the material this decision needs — no less (missing guidance or fields) and no more (dumping the whole protocol) — and present it attractively and in a followable order? Snags here are R.
5. **Source.** Ask of the *markdown itself*: at this decision point, is there something the methodology should let you do but can't, or that confused you as its reader? Methodology-source friction is M.
6. **Log.** Write the decision point to the live log: your docs-first draft, the cold LLM's proposal answer, the cold LLM's pressure answer, the final field content you committed, each typed finding with its screenshot/DOM evidence, and the **obsolescence verdict** — could a steward with the docs *closed* have authored this decision as well from the app screens alone? If yes, the point is doc-obsolete (a V); if no, name exactly what the open docs supplied that the app didn't — that gap *is* the P/R/F finding.
7. **Advance** to the next decision point.

**Drive the UI; never infer a flow works from its code or tests.** Screenshot each screen; name shots `field-build-<NN>-<slug>` and record the names in the log. **Cold-LLM subagents get the packet and nothing else** — that isolation *is* the packet-context test; leaking world or doc context into them destroys the finding. If a true fresh subagent/tool is unavailable, do not simulate the probe with the main agent's context; mark the prompt test blocked, log Q if the packet exists but the probe is unavailable, log P if the app failed to supply the packet, and carry that limitation into the report.

### The new-world-path crosswalk (verify against the live app + `docs/specs/workflow-map-and-navigation.md`)

| Stage | Protocol | App destination | Flow spec | Prompt-out access |
|---|---|---|---|---|
| Kernel (premise, promise, scale, tone, foundational facts/constraints, mysteries, pressures, ordinary-life) | `05` Ph.1 | Creation | `creation-flow.md` | in-flow preview; premise refuses proposal (essence) |
| Seed decomposition · seed audit · MVW checkpoint | `05` + `checklists/frontloaded_seed_audit.md` | Creation (MVW checkpoint is a sub-section) | `creation-flow.md` | in-flow preview |
| Admission | `06` + `checklists/canon_fact_gate.md` | Admission | `admission-flow.md` | in-flow preview |
| Propagation | `07` + `04` | Propagation | `propagation-flow.md` | generic Prompt-out substrate/admin panel |
| Constraint composition | `08` | Constraint Composition | `constraint-composition-flow.md` | in-flow preview |
| Temporal / timeline | `09` | Temporal/Timeline | `temporal-timeline-flow.md` | in-flow preview |
| Institutional / economic / suppression | `12` | Institutional (Stage 12) | `institutional-economic-suppression-flow.md` | generic admin panel |
| Contradiction / retcon / mystery | `13` | Contradiction (Stage 13) | `contradiction-retcon-mystery-flow.md` | generic admin panel |
| QA | `18` | QA | `qa-flow.md` | generic admin panel |
| Read / browse canon | — | Canon Workbench | `canon-workbench.md` | — |
| Export | — | Markdown export | `markdown-export.md` | — |

Passes `10` spatial, `11` agent/psychology, `14` uncertainty, `15` branching, `16` extraction, `17` aesthetic run only where an admitted fact triggers them and have **no dedicated destination yet** — walk them where the fact applies and log the missing home as a finding. A flow whose prompt-out lives only in the generic admin panel, not an in-flow preview, is itself likely an R/F finding — note it, don't wave it through as parity.

### Finding types

Every P, R, and F marks a place the app still needs the docs open; every V marks a place it no longer does — that ratio is the distance left to doc-obsolescence. Number within type as you log: `P-01`, `R-01`, … Tag each P with its mode (proposal | pressure).

| Type | Axis it guards | Fires when |
|---|---|---|
| **P** prompt-out | the app generates a self-contained, useful prompt in both modes | preview missing; a mode absent where it's owed; the packet omits needed context or drags in noise; a cold LLM answers it poorly |
| **R** presentation | the app shows exactly the decision's material, attractively and followably | the screen shows too much or too little versus the protocol, or is hard to follow / unattractive |
| **M** methodology-source | the markdown methodology itself is complete and actionable | you want to do something the docs should support but can't, or the source confused you |
| **F** friction | building through the app runs without snags | filling, saving, or navigating snags; a bug; a broken affordance |
| **V** validation | — | the app carried the whole decision — the docs, though open, added nothing (the obsolescence signal; record it — the report isn't all-negative) |
| **Q** question | — | a genuine unknown the build couldn't resolve |

**The walk ends when** the new-world path reaches a stable first version: kernel, seeds, and audit done; every seed fact admitted; every high-pressure consequence propagated or explicitly scoped, debted, or protected; every specialized pass an admitted fact triggered walked; and QA (`18`) run. A full build is large and may span sessions — when you must pause, leave the frontier in the live log (world file path, last decision point committed, next stage) and stop; the next invocation reopens the world and resumes. A pass skipped for a real reason is logged as a visible skip, never silently omitted.

## Step 3 — Write the report

When the walk ends (or the user halts it), consolidate the live log into `reports/field-build-<NN>-<world-slug>.md`. Carry **every** finding and **every** decision point — the log is the evidence a later `/to-prd` (app) or methodology-revision session lifts from without re-building.

Preserve cold-LLM raw outputs verbatim in the live log or a named scratch evidence artifact. The report may inline short raw answers; for long answers, include a faithful excerpt or summary plus the artifact path. The report must expose the disposition and enough evidence to lift the finding later, but it does not need to paste every long token block inline.

```
# Field Build <NN> — <world name>

**Date:** <date>  ·  **App commit:** <short sha>  ·  **Method version:** worldbuilding-system 1.1
**Essence (user seed):** <one line>
**World:** <name> — <premise>.  **World file:** <path>.
**Path walked:** <stages reached>.  **Prior runs:** <links or none>.

## Findings
For each `[P/R/M/F/V/Q]-NN` — one-line title. Severity: blocking | friction | cosmetic. P also names its mode.
- Where: <app destination / protocol §>
- What happened: <what you saw / what the cold LLM returned> — cite the screenshot + DOM/packet excerpt
- What the methodology requires: <doc § reference>
- The snag: <the break, one line>
- Fix direction: <app spec/component, or methodology file/wording>
- Touches: <docs/specs/… , principle W-# , doc file, or issue #>

## Decision-point log (evidence)
Per decision point, in walk order:
- Stage / decision point:
- Docs-first draft: <what you authored before the app>
- Cold LLM (proposal): <raw answer when short; otherwise faithful excerpt/summary + artifact path, or "refused — essence">
- Cold LLM (pressure): <raw challenge when short; otherwise faithful excerpt/summary + artifact path>
- Committed: <final field content>
- Obsolescence verdict: <docs-obsolete (V) — app carried it | docs still needed: what the app failed to carry → finding IDs>

## For the app (PRD seeds)
Cluster the P/R/F findings into fixable scopes; name the likeliest spec/component; flag principle-reinforcement candidates (W-#).

## For the methodology
Cluster the M findings; name the doc file and the wording to revise. This is the field evidence the README's untested surfaces owe — `10`, `11`, `14`, `15`, `16`, `17`, and the proposal mode of `20`.

## Frontier
- Walked to: …
- Next run resumes at: … (world file path, last committed decision point)
- World state: …
```

At closeout, stop any dev server started solely for this build unless the user asked to keep it running; close or release cold-subagent sessions; and record any intentionally running server in the final note.

**Complete when:** report written under `reports/field-build-<NN>-<world-slug>.md`, every live-log finding and decision point carried in, the Frontier block set, closeout cleanup handled, and `git status --short` shows no newly introduced repo dirt except the report (the world SQLite file lives at its recorded path, uncommitted unless the user asks).

## Guardrails

- **The cold LLM stays cold.** Its only input is the app's generated packet. The moment world context, the docs, or this conversation leak in, the packet-context finding vanishes and the report lies. If you cannot get a genuinely cold subagent, mark the probe blocked rather than answering it yourself.
- **Adoption is authorship.** A cold-LLM answer is candidate material; keep only what you'd defend as your own and author it in your own wording into the real field. Never paste a raw answer into a canon field, and never let the essence be proposal-generated.
- **Drive, don't infer.** Parity and prompt-out are settled in the running UI, never from source or tests.
- **Build for real; drive toward doc-obsolescence.** The world is the vehicle; the report's job is to close the gap between the app today and an app that makes the docs unnecessary — and to keep the standard itself clean, since a flawed source can't be faithfully encoded. Log methodology-source friction (M) as seriously as app friction (F).
- **Report, don't fix.** This skill produces one report and a real world in the app, then stops. Fixing the app or editing the docs happens later, from the report. Do not edit app source, `docs/`, or `.claude/skills/` during the build.
- **Mutates only `reports/`, the live log, and the app's own world data.** Never `docs/`, source, or skills.
- **Extend, don't duplicate.** Check findings against issues #109–#113, PRDs #201/#202/#204/#205–#210, and prior `reports/*field*` / `*parity*` reports; frame each as confirming, extending, or new.
