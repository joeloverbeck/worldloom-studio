---
name: parity-field-trial
description: "Dual-track parity field trial — walk docs/worldbuilding-system/* as an author building a world from zero while driving the web app blind via browser automation as a docs-only steward; log every gap where the app can't deliver the methodology, stop at one PRD's worth, and write a report in reports/* for a later /to-prd session."
disable-model-invocation: true
---

# Parity Field Trial

The app's purpose is to let a steward follow the whole worldbuilding methodology with the `docs/worldbuilding-system/*` files closed. This skill measures how far short of that it falls, by running two tracks in lockstep through the new-world path:

- **Doc track** — you, holding the methodology, building a world from zero exactly as it prescribes.
- **App track** — a **blind** steward who has *only* the web app, no methodology files ever. You drive the app through browser automation tools such as Puppeteer or Chrome DevTools MCP and judge every screen by what a docs-naive steward would see. Record which tool produced screenshots, DOM snapshots, and network evidence.

A **parity gap** is any place the app track cannot reproduce — or reproduces only through friction, confusion, or overwhelm — what the doc track does. Parity gaps are the finding. The trial exists to surface them, cluster one PRD's worth, and report.

This is a **field trial** in the line of `reports/eighth-` and `reports/ninth-iteration-field-trial.md` — but those trialed the *methodology*; this trials *the app's fidelity to it*. It is **iterative**: each run resumes one persistent trial world, pushes the **frontier** forward one stretch, and stops at a natural PRD boundary. Run it repeatedly until the entire new-world path is walkable from the app with the docs closed.

You play three roles; keep them honest:

- **doc-track author** — reads the governing protocol and knows what each decision point requires. Faithful to the actual file, never to memory.
- **app-track steward** — **blind**. Uses ONLY what the current screen shows. Never lets doc knowledge leak into "they'd figure it out."
- **external LLM** — when the app generates a prompt-out, you answer it to produce the field content so the walk can proceed. This is also how you test prompt quality.

## Step 1 — Orient and set up

- **Read the frontier.** Read the latest `reports/app-parity-trial-*.md` if any exists: the trial world's name and premise, which stages are already walked, and where the last run said to resume. No prior report ⇒ this is run `01`.
- **Baseline the worktree.** Run `git status --short` before the walk and record any existing dirt in the live log. The report is the only repo file this skill should newly introduce; unrelated pre-existing dirt may remain.
- **Start the app.** Run `pnpm dev` in the background (builds `@worldloom/shared`, starts the Hono API on `127.0.0.1:4173` and normally starts the Vite web UI on `127.0.0.1:5173` with `/api` proxied). If deps are missing, `pnpm install --frozen-lockfile` first. Wait until the web server answers. If Vite chooses a different port because `5173` is occupied, use the logged Vite URL, record the port drift in the live log, and continue.
- **Open browser automation** at the live Vite URL and screenshot the entry screen — the blind steward's first impression.
- **Open a live log** at `/tmp/worldloom-parity-trial/parity-log.md` unless an existing scratchpad is already in use: raw, append-only observations during the walk. Polishing happens later, in the report — keep the walk fast. The scratch log is not the deliverable.
- **Resume or seed the trial world:**
  - Run 01: create one cold-start world *in the app*. Pick a premise deliberately distinct in **machinery** from the prior trials — Saltmarrow (material/capability) and Carillon (calendrical/institutional). Record its name and premise in the log.
  - Later runs: reopen the same world (the app is local-first; data persists). Inspect its current state in the UI. If a since-shipped fix reset or broke it, re-seed and note that.
- **Handle setup blockers honestly.** If auth, token entry, world-file creation/opening, port visibility, or another setup issue blocks reaching methodology work, screenshot and log it. Also capture the setup evidence that explains the blocker: visible token/path state, console errors, network request URL/status/headers that matter, response body, browser storage state, visible error placement, and whether the expected world file exists on disk. Stop if the docs-naive steward could not proceed at all. If a minimal setup-only workaround is needed to reach the methodology surface, record the workaround explicitly and do not count it as evidence that the UI setup path works.

**Complete when:** app answering on the live Vite URL, browser automation on the entry screen, frontier known, trial world resumed or seeded, baseline status recorded, live log open. If setup blocks world resume/seed, the alternate completion state is: app/browser evidence captured, blocker logged, baseline status recorded, frontier known, trial-world state recorded as not opened or not seeded, and the walk proceeds directly to the report.

## Step 2 — Walk the frontier stretch, one decision point at a time

Pick the next unwalked stretch of the operating-card new-world path (crosswalk below). Advance both tracks through it. At **each decision point** — each field or cluster of fields the methodology has the author fill — run this beat and log what you find:

1. **See** — screenshot the screen. As the blind steward: is it clear what this screen is *for* and what to do next, with no docs? Is it dumping too much at once? *(→ O)*
2. **Know** — as the doc-track author, read the governing protocol for what this decision point requires and which fields it fills. Faithful to the file.
3. **Decide** — can the blind steward make this decision from the UI alone? Does the app name the decision, explain the options, and gate on substance the way the methodology does? *(→ G)*
4. **Prompt-out** — does the app offer to generate a prompt for this decision point? Trigger it. Read the prompt: does it gather the *exact* world context this decision needs to be answered well in an external LLM — no more, no less? Then, as the external LLM, answer it to produce the field content. *(→ P)*
5. **Fill** — enter the content via browser automation. Any friction accepting or saving it? *(→ G)*
6. **Check fidelity** — did the app do what the methodology says, or diverge? Flag each divergence as justified or not. *(→ D)* A clean decision point earns a *V*.
7. **Advance** to the next decision point.

Log every finding as you go — typed, with the screenshot or DOM as evidence, never from assumption. Name screenshots `app-parity-<NN>-<short-slug>` and record those names in the live log; when screenshots are not durable file paths, capture a short DOM/text excerpt as supporting evidence. **Drive the UI; never infer a flow works from its code or tests.** The house trap is a flow "done" at the server/test layer but unreachable in the UI (issues #109–#113); only the running UI settles parity.

**Stop at the first of:**

- a **blocking** gap — the blind steward cannot proceed from the UI at all (a stage unreachable, a required field with no input, prompt-out absent where the methodology needs external help). One blocking gap is a PRD by itself.
- **saturation** — findings in this flow have stopped surprising you and cohere into one fixable scope.
- a **clean stretch** — fully walkable at parity. Record the validations; if the run already holds findings, stop, otherwise roll to the next stretch.

Do NOT walk past one coherent PRD scope into a second, unrelated problem area. **One PRD scope per run** — a stale, sprawling report is worse than a tight one.

### Finding types

Each maps to a requirement the app must meet. Number within type as you log: `G-01`, `P-01`, …

| Type | Requirement it guards | Fires when |
|---|---|---|
| **G** gap | follow the methodology without the docs; user-friendly | the steward can't do, or can only awkwardly do, what the author does |
| **P** prompt-out | a generated prompt gathers the exact world context for the decision | prompt-out is missing, or its prompt omits needed context / drags in noise |
| **D** divergence | faithful recreation of the methodology unless well-justified | the app does something the methodology doesn't say, or contradicts it |
| **O** overwhelm | not overwhelming; intuitively clear what to focus on | a screen shows too much at once, or the steward can't tell what matters |
| **V** validation | — | the app delivers parity cleanly (record it; the report isn't all-negative) |
| **Q** question | — | a genuine unknown the walk couldn't resolve |

### Starter crosswalk (verify against the live app + `docs/specs/workflow-map-and-navigation.md` — the app evolves)

| New-world stage | Protocol | App flow | Flow spec |
|---|---|---|---|
| Kernel · seed decomposition · seed audit · phases 4–8 | `05` | creation | `creation-flow.md` |
| Admission | `06` | admission / admission-decision-surface | `admission-flow.md` |
| Propagation | `07` | propagation | `propagation-flow.md` |
| Constraint composition | `08` | constraint-composition | `constraint-composition-flow.md` |
| Institutional / economic / suppression | `12` | institutional | `institutional-economic-suppression-flow.md` |
| Contradiction / retcon / mystery | `13` | contradiction | `contradiction-retcon-mystery-flow.md` |
| QA | `18` | qa | `qa-flow.md` |
| Read / browse canon | — | canon-workbench | `canon-workbench.md` |
| Prompt-out (cross-cutting, every decision point) | `20` | prompt-out lifecycle | `prompt-out-context-assembly.md` |
| Export | — | markdown-export | `markdown-export.md` |

**Frontier territory** — passes with likely *no* UI home yet, where faithful-recreation (D) gaps will be richest: `09` temporal (sweep-only, #111), `10` spatial, `11` agent/psychology, `14` uncertainty, `15` branching/collaboration, `16` extraction, `17` aesthetic.

## Step 3 — Write the report

When the walk stops, consolidate the live log into `reports/app-parity-trial-<NN>-<slug>.md` (`<slug>` names the stretch, e.g. `creation`). Carry **every** logged finding, cosmetic ones included — they cluster into the fix. Structure it so a later `/to-prd` session can lift a PRD without re-walking:

```
# App Parity Field Trial <NN> — <stretch>

**Date:** <date>  ·  **App commit:** <short sha>  ·  **Method version:** worldbuilding-system 1.0
**Trial world:** <name> — <one-line premise>. Machinery: <material/institutional/…>, distinct from Saltmarrow & Carillon.
**Stretch walked:** <flows / new-world-path steps>.  **Prior runs:** <links or none>.

## Findings
For each `[G/P/D/O/V/Q]-NN` — one-line title. Severity: blocking | friction | cosmetic.
- Screen: <where in the app>
- What the steward saw: <blind-view description, cite the screenshot and embed the essential DOM/text/network excerpt when the screenshot or scratch artifact is outside the repo>
- What the methodology requires: <doc § reference>
- The gap: <the parity break>
- Fix direction: <where it likely lands>
- Touches: <docs/specs/… , principle, or issue #>

## PRD seed
- Problem (steward's view): …
- Scope (one PRD): …
- Out of scope / deferred to later runs: …
- Extends / duplicates: issues #109–#113, research report R…/M… (don't re-report known work)

## Frontier
- Walked to: …
- Next run resumes at: …
- Trial-world state: …
```

**Complete when:** report written, every live-log finding carried in, the Frontier block tells the next run where to resume, and `git status --short` shows no newly introduced repo dirt except the report file (allowing pre-existing baseline dirt to remain unchanged).

Before final response, compare final `git status --short` to the baseline. If new unrelated dirt appeared during the trial and was not caused by the trial, report it as external/unowned and leave it alone. The trial's owned repo dirt remains limited to the report file.

## Guardrails

- **Blind discipline is the whole trial.** The moment you let doc knowledge stand in for a missing UI affordance, the finding vanishes and the report lies. When unsure, screenshot and ask: would a steward who has *never read the methodology* know what to do here?
- **Drive, don't infer.** Parity is settled in the running UI, never from source or tests. That confusion is exactly what issues #109–#113 caught.
- **Report, don't fix.** This skill produces one report and stops. Fixing happens in a later session, from the PRD. Do not edit app source during the walk.
- **Extend, don't duplicate.** Check findings against issues #109–#113 and the R/M items in `reports/workflow-usability-doc-overhaul-research-report.md`; frame each finding as confirming, extending, or new — not as a rediscovery.
- **Mutates only `reports/` and the app's own world data.** Never `docs/`, `.claude/skills/`, or source.
