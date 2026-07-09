---
name: field-build
description: "End-to-end field build — author a real world from the user's seed by walking the operating-card new-world path start to finish while driving the running web app in lockstep, holding the methodology docs open only as the yardstick, exercising both prompt-out modes at every decision point through a cold-LLM subagent, and reporting every place the app still leans on the docs — and regression-checking that prior runs' blocking findings are fully fixed before advancing — so it can be driven toward fully encoding the methodology (obsoleting the docs) in reports/*."
disable-model-invocation: true
---

# Field Build

The goal state is the app **alone**: a steward building a world with the worldbuilding-system docs *closed*, because the app has fully encoded them. Today it hasn't — so this skill measures the distance to that goal and drives it down. You build a real world from the user's seed with the docs open in one hand **only as the standard** — the yardstick every screen is checked against, never a permanent part of the loop — and the app in the other, walking the operating-card new-world path from kernel to QA. Every place the app fails to make the docs unnecessary is the finding; one report drives the app toward doc-obsolescence and keeps the source of truth itself clean.

It is the **sighted** cousin of `parity-field-trial`. That skill drives the app *blind* to find where a docs-naive steward gets stranded, and stops at one PRD's worth. This one holds the docs open **as the standard** — not because the loop needs them, but to catch every way the app still falls short of fully encoding them. The question is not "can a blind steward cross this?" but "if the docs vanished tomorrow, what would this steward have lost — what does the app still fail to carry?" It walks the **entire** new-world path, not one PRD scope.

It also **closes the loop on itself.** Each run reads the latest canonical field-build run report, and where a prior run hit a **blocking** finding it replays that scenario against the current app to prove the fix fully landed before building further — a fix claimed in a PRD is only real once a **regression pass** confirms it in the running UI. Keep the *regression pass* distinct from the *Pressure* beat and the *pressure* prompt-out mode below, which challenge authored world material, not fixes.

The **cold LLM** is the load-bearing probe. At each decision point the app generates a self-contained prompt packet; you save that exact app-generated packet first, then hand that saved packet — and nothing else — to a fresh subagent. If a context-free subagent answers it well, the packet carries the right context (`docs/specs/prompt-out-context-assembly.md`'s cold-LLM test). If it answers badly, the packet is the finding. If you cannot extract the exact packet or cannot get a truly fresh subagent, the prompt test is not exercised; mark the coverage state `probe unavailable` rather than substituting a summary or your own answer.

Three roles, kept honest:

- **steward-author** — reads the governing protocol *as the standard* and authors each decision from your own judgment first, faithful to the file and to the user's essence, never to memory.
- **app-driver** — drives the running UI through browser automation exposed in the session, such as Playwright, Puppeteer, or Chrome DevTools MCP. Parity is settled in the running UI, never inferred from source or tests — the trap issues #109–#113 caught.
- **cold LLM** — a newly spawned, fresh subagent handed ONLY the app's generated prompt text saved for that exact decision and mode. It never sees the world, the docs, or this conversation. Its answer is raw candidate material, never a decision. Record the subagent id or tool limitation in the live log, save its answer, then close or release it immediately unless the tool model requires keeping it open; closeout still verifies no probe agents remain open.

**Cold-probe tooling rule:** if the session does not expose an obvious fresh-subagent tool, try the session's tool-discovery mechanism once before giving up. If discovery is unavailable, policy blocks subagents, or the available tool cannot create an uncontextualized worker, record `probe unavailable` with that operational reason. Do not simulate a cold probe with the main agent, an already-contextual subagent, or a self-authored answer.

**Prompt packet extraction ladder:** save the exact app-generated packet by the most direct reliable route available. Prefer a visible in-flow copy/export or the rendered preview text; if that fails, use the matching network response; if that fails, extract the rendered DOM/browser snapshot and validate it against the visible packet identity (flow, record, section/step, mode, template, and hash when available). If visible, network, and DOM routes all fail but a diagnostic app/API generation route can reproduce the same packet, you may use that route only after validating the full identity tuple and hash against the active visible packet; record it as diagnostic evidence, not active-surface parity, and still log the active-surface export/copy gap when the UI cannot reliably provide the exact packet. If a route creates an empty, truncated, or otherwise failed artifact, replace or ignore that artifact and do not cite it as evidence. Only mark the mode `probe unavailable` after every exact-packet route fails, or when the recovered text cannot be validated as the current packet.

Treat hung or permission-blocked capture tooling as failed route evidence, not as a reason to improvise silently: bound each capture attempt where the tool allows, interrupt stalled commands, mark the route `failed`, discard empty or partial artifacts, and move to the next ladder rung. If the diagnostic fetch is blocked by local sandbox or network permissions, request approval and rerun from a context that can reach the app; the diagnostic artifact still needs full tuple/hash validation before cold-probing.

Whenever packet capture uses anything beyond the visible active-surface copy/export path, add a route row to the live log before cold-probing so diagnostic success cannot be mistaken for workflow parity:

| visible copy/export | rendered preview | network response | DOM/browser snapshot | diagnostic route | identity/hash validated | active-surface state | final coverage state |
|---|---|---|---|---|---|---|---|
| `exercised` / `failed` / `not exposed` | `exercised` / `failed` / `not exposed` | `exercised` / `failed` / `not attempted` | `exercised` / `failed` / `not attempted` | route or `N/A` | hash/tuple or `N/A` | `exercised` / `blocked by app` / `probe unavailable` | `active=<state>; diagnostic=<state>; prompt=<path>; output=<path>; subagent=<id or N/A>` |

## Step 1 — Take the seed and set up

- **Get the essence.** The user's world seed *is* the world's essence — the generating tension the world exists to explore (`05` Phase 1). If the invocation carried no seed, ask for one before anything else; a one-line premise is enough (e.g. "sentient humanoid animals; a skill-and-grit sport resolves the disputes war doesn't"). Never proposal-mode the essence — `20` reserves it to the steward and the app refuses proposal on the kernel World premise; you author it from the user's words.
- **Extract user-directed evidence targets.** If the invocation names specific PRDs, regressions, probes, packets, or stop-frontier requirements, convert them into a small coverage checklist in the live log before broad exploration. Each target gets a final state: `satisfied`, `blocked`, `probe unavailable`, or `not exercised — why`. Satisfy those targets before optional end-to-end progression, and let them define a useful stable frontier when the user explicitly asked for targeted evidence rather than a full walk.
- **Read the frontier.** If a prior canonical field-build run report or its live log exists *for this seed*, read it: the world's name, which stages are walked, where to resume. Canonical run reports are `reports/field-build-<NN>-<world-slug>.md` where `<NN>` is all digits; exclude derivative artifacts such as `*-change-spec*`, `*-research-brief*`, and other files that reuse the prefix but are not run reports. No prior run for this seed ⇒ this is a cold start (a fresh world) — though it may still owe a regression pass against another seed's report (next bullet).
- **Load the regression set.** Read the *latest* canonical field-build run report — the highest `<NN>`, since `<NN>` is a global run counter across all seeds (Step 3) — of **any** seed; findings are app-level, so a fix proven in one world is owed a check here even when this run builds a different world. From it, take every open **blocking** finding into the *mandatory* regression set and note every open friction/cosmetic finding as the *opportunistic* set. Record that report's **App commit** and diff it against current HEAD (`git rev-parse --short HEAD`); the gate is HEAD **plus working-tree state**, because the app you drive serves the working tree, not committed HEAD. **HEAD unchanged since that report *and* no uncommitted app-source changes (`git status --short` clean of `apps/`/`packages/`) ⇒ no fix could have landed:** carry its open findings forward untouched and skip the hardened re-test — never silently drop them. **HEAD advanced, *or* the working tree carries uncommitted app-source changes ⇒ run the regression pass.** No prior report at all ⇒ empty regression set; note it. *(The **regression pass** replays a prior finding to see whether a fix holds; never call it a "pressure test" — that name belongs to the challenge-mode work on world material.)*
- **Load prior-art framing surfaces.** Before report writing, every P/R/F cluster must be framed as **confirming**, **extending**, or **new** against issues #109–#113, PRDs #201/#202/#204/#205–#210, and prior `reports/*field*` / `*parity*` reports. In setup, record which of those surfaces are available or unreachable so the final report's framing is deliberate rather than an afterthought.
- **Baseline the worktree.** Run `git status --short` before the walk and record existing dirt in the live log, so you never later claim it.
- **Start or reuse the app.** If no repo-root dev server answers, run `pnpm dev` in the background (builds `@worldloom/shared`, Hono API on `127.0.0.1:4173`, Vite UI on `127.0.0.1:5173` with `/api` proxied); `pnpm install --frozen-lockfile` first if deps are missing. Reuse a running server only after verifying UI and API answer, and record the reuse and observed URLs. If Vite drifts off `5173`, use and log the actual URL. If the server prints healthy URLs but the browser or `curl` context cannot reach them, treat it as a local binding/sandbox-visibility blocker: log the printed and observed URLs, restart or reuse the server from a context visible to browser automation with approval as needed, then continue.
- **Open a live log and evidence dirs** under `/tmp/worldloom-field-build/`: use `build-log.md` for the append-only raw log, `screenshots/` for browser screenshots, and `cold-llm/` for verbatim prompt packets and cold-subagent outputs. These scratch artifacts are the build's evidence trail and resume point, not the deliverable — polish belongs in the report. Keep screenshots and cold-LLM artifacts out of the repo unless the user explicitly asks to commit evidence. Initialize this log before the first browser action; do not drive the UI until it records the seed, baseline `git status --short`, current HEAD, chosen report number/slug if known, regression-set source, mandatory/opportunistic regression IDs, prior-art surfaces checked or unreachable, app/server URL plan, and user-directed evidence targets. After any resume, compaction, or interruption, append a resume checkpoint before continuing; before writing the final report, reconcile the live log through the final frontier so it names every resumed action, final decision point, and stop reason.

  Live-log bootstrap:

  ```md
  ## Bootstrap
  - Seed:
  - Baseline worktree:
  - Current HEAD:
  - Report number/slug:
  - Prior run for this seed:
  - Latest canonical report loaded:
  - Regression gate:
  - Mandatory regression set:
  - Opportunistic regression set:
  - Prior-art surfaces:
  - User-directed evidence targets:
  - App/API URLs:

  ## Resume checkpoints
  - <timestamp/context>: resumed from <last evidence>; verified <world path/server/browser/subagents>; next action <...>.
  ```
- **Open browser automation** at the live Vite URL and screenshot the entry screen into the screenshots evidence dir.
- **Create or reopen the world.** There is no URL routing and no separate "world name" field — a world is a local SQLite file identified by its path. On the setup panel, type a stable path (e.g. `…/<world-slug>.worldloom.sqlite`) into **World file path** and click **Create world** (new world) or **Open world** (resume); record the path — resumes must reopen the same file. On success the app switches to the Workflow-map home.
- **Handle setup blockers honestly.** If world creation/opening or port visibility blocks reaching methodology work, screenshot, capture the console/network/disk evidence that explains it, log it as a finding, and — if the build cannot start at all — go straight to the report.

**Complete when:** app answering on the live Vite URL, browser on the workflow-map home with the world open, essence in hand, frontier known, regression set loaded and its commit-gate computed, baseline recorded, live log and evidence dirs open.

## Step 2 — Build the world, one decision point at a time

Follow the operating-card **new-world path** (crosswalk below) in order: kernel → seed decomposition → seed audit → admission → propagation → the specialized passes each admitted fact actually triggers → QA. Read the doctrine files (`01`, `03`) so you author faithfully; the reference files (`02`, `19`, `21`–`23`) are consulted, not walked.

### The regression pass — verify prior fixes before rediscovery

Before the new-world walk, resolve the regression set loaded in Step 1. If the commit-gate says **HEAD is unchanged** since the latest report, record in the live log that no app change has landed and that its open findings are **carried forward unchanged**, then go straight to the walk. If **HEAD advanced**, run reproduce-then-probe on each **blocking** finding in the mandatory set — up front, or at the first moment the walk re-reaches that screen, whichever comes first:

1. **Reproduce.** Drive the app to the exact scenario the finding recorded — same inputs, same screen, same action — from its `Repro:` line (older reports without one: reconstruct from the finding's *What happened* plus its screenshot/network evidence). Confirm whether the recorded break still occurs.
2. **Probe.** If the happy path now succeeds, push the adjacent edge cases a shallow fix would miss — empty/invalid input, the neighbouring required field, the same action from another entry point — so a superficial fix cannot pass as complete.
3. **Verdict.** Record exactly one: **fixed** (repro succeeds and probes hold), **partially-fixed** (repro succeeds, a probe still breaks), **still-broken** (repro still breaks), or **not-reverifiable-this-run** (the flow can't be reached — say why). Cite screenshot/DOM/network evidence as for any finding.

**Friction and cosmetic** findings in the opportunistic set are not re-driven up front — re-verify each when the walk naturally re-reaches its screen and give it a verdict there. **On a same-seed resume the walk starts at the frontier and never re-walks completed stages**, so an opportunistic finding *behind* the resume point (e.g. a kernel finding when the resume sits at seed decomposition) would otherwise never be re-reached: either deliberately re-drive its screen up front alongside the mandatory set — you are already navigating there — or, if you defer it, record the deferral and carry the ID forward as **not-reverifiable-this-run**, never a silent drop. Every verdict feeds the report's *Regression of prior findings* section (Step 3): **fixed** becomes a fresh `V` citing the prior ID; **partially-fixed** / **still-broken** re-fire under the **same** finding ID, marked *carried* / *regressed*, and carry to the Frontier for the next run.

A **decision point** is one coherent block of material the method asks you to author — W-1's prompt grain and the app's `decision-point/v1` unit, not a single naked field. For the kernel, treat the World premise as its own essence decision. The remaining kernel sections may be worked as one coherent kernel-authoring block unless the live app exposes section-specific decision-point packets; if it does, test those sections separately. If section-specific packets are exposed, maintain a small kernel coverage table in the live log: each exposed kernel section gets `proposal` and `pressure` state, or an explicit `deferred because frontier moved` / `probe unavailable` reason before leaving Creation. If the app keeps a generic packet while a section is selected, one representative cold-LLM test is enough to log the binding gap instead of exploding the kernel into artificial single-field tests. If the run stops after a coherent kernel-complete frontier before exercising every section-specific mode, label the stop a partial prompt-out coverage frontier; the coverage table must list every deferred section/mode, and the report Frontier must state whether the next run must finish those deferred kernel prompt probes before seed decomposition or may proceed because the deferral reason has been accepted. Before leaving Creation, the live log must contain this kernel coverage table (or state that the app exposed only generic kernel packets):

| kernel section | packet grain (`section-specific` / `generic`) | proposal state | pressure state | prompt packet path(s) | cold output path(s) | cold subagent id(s) | deferral / probe-unavailable reason |
|---|---|---|---|---|---|---|---|
| World premise |  |  |  |  |  |  |  |
| Core promise |  |  |  |  |  |  |  |
| Starting scale |  |  |  |  |  |  |  |
| Genre, tone, and consequence-mode commitments |  |  |  |  |  |  |  |
| Foundational facts |  |  |  |  |  |  |  |
| Foundational constraints |  |  |  |  |  |  |  |
| Initial mysteries and protected effects |  |  |  |  |  |  |  |
| Primary pressures and initial domains |  |  |  |  |  |  |  |
| Ordinary-life promise |  |  |  |  |  |  |  |

Once seed decomposition begins, maintain a **seed-decomposition coverage table** in the live log. The rows are the kernel seed families the steward can identify from the current kernel, not just the facts already parked by the app. Each row gets a state: `parked`, `corrected`, `queued`, `deferred as debt`, `intentionally out of scope`, or `not yet decomposed`. Before leaving Creation seed decomposition, reconcile this table against the app's Workflow-map state: if the map routes onward while rows remain `not yet decomposed`, log that as a P/R/F finding instead of accepting the route as method-complete.

| kernel seed family | decomposition state | proposed/current records | prompt packet path(s) | cold output path(s) | cold subagent id(s) | deferral / debt / out-of-scope reason |
|---|---|---|---|---|---|---|
| <seed family from kernel> |  |  |  |  |  |  |

At each decision point, run this beat and log every line of it:

1. **Author (docs-first).** Read the governing protocol for this decision point. Author the material yourself from the essence and the current world state — your draft, *before* the app says anything. This is the steward judgment the whole loop serves.
2. **Propose.** In the app, reach this decision point and find its prompt-out. Generate the **proposal** prompt (draft-candidate mode). *Confirm the preview renders* — the `Prompt-out preview` panel showing the packet text (anchor `pre.prompt-packet-text`, or the admin panel's textarea). **No visible preview is an app failure — log P.** Copy the packet verbatim into `/tmp/worldloom-field-build/cold-llm/field-build-<NN>-<decision-slug>-proposal-prompt.md`; then hand that exact saved packet to a newly spawned **cold LLM** subagent (only the packet, no other context), record the subagent id in the live log, and read the answer: fitting for *this* world's current state, or generic/off-tone? Save the raw cold answer verbatim at `/tmp/worldloom-field-build/cold-llm/field-build-<NN>-<decision-slug>-proposal.md`, close or release the subagent once the output is saved, and cite both paths plus the subagent id in the live log. If the exact packet cannot be extracted, or a fresh subagent is unavailable, record `probe unavailable` with the reason instead of summarizing the packet yourself; if the app refuses proposal correctly, record `refused` instead of creating an artifact. Then, as steward, select/edit/discard and author the surviving material into the real field — adoption is authorship; never paste a raw answer into a canon field. *(Essence exception: at the kernel World premise the app refuses proposal — that refusal is correct; log it a V and go to Pressure.)*
3. **Pressure.** With the field now authored, generate the **pressure** prompt (challenge mode) on that material and confirm its preview. Save the packet verbatim at `/tmp/worldloom-field-build/cold-llm/field-build-<NN>-<decision-slug>-pressure-prompt.md`; then hand that exact saved packet to a newly spawned fresh cold LLM and record the subagent id. Save the raw cold answer verbatim at `/tmp/worldloom-field-build/cold-llm/field-build-<NN>-<decision-slug>-pressure.md`, close or release the subagent once the output is saved, and cite both paths plus the subagent id in the live log. Read the challenge — missing prerequisites, contradictions, off-tone drift, mystery damage — and revise the field where the challenge earns it. If the exact packet cannot be extracted or a fresh subagent is unavailable, record `probe unavailable` with the reason; if the app offers no pressure mode where authored material exists, log P and record `blocked by app` in the coverage ledger.
4. **Present.** Compare the screen to the protocol and to the steward's experience: does the app surface *exactly* the material this decision needs — no less (missing guidance or fields) and no more (dumping the whole protocol) — and present it attractively, calmly, and in a followable order? Judge style as part of the evidence, not as a side impression: if the surface feels unpleasant, confusing, overwhelming, confidence-eroding, visually noisy, tonally mismatched to the decision, or harder to use than the docs, log R. Distinguish **local polish** (copy, ordering, spacing, affordance clarity) from a **redesign candidate** (the screen's structure, hierarchy, or interaction model makes the decision hard even if individual controls work), and record why plus a recommendation.
5. **Source.** Ask of the *markdown itself*: at this decision point, is there something the methodology should let you do but can't, or that confused you as its reader? Methodology-source friction is M.
6. **Log.** Write the decision point to the live log: your docs-first draft, the cold LLM artifact paths or refusal/blocker states, the final field content you committed, each typed finding with its screenshot/DOM evidence, the required `UX/style verdict: ok | local R | redesign candidate — why + recommendation`, and the **obsolescence verdict** — could a steward with the docs *closed* have authored this decision as well from the app screens alone? If yes, the point is doc-obsolete (a V); if no, name exactly what the open docs supplied that the app didn't — that gap *is* the P/R/F finding.
7. **Advance** to the next decision point.

Maintain a **prompt-out coverage ledger** in the live log for every reached decision point: `proposal` and `pressure` each get exactly one active-surface state — `exercised`, `refused`, `blocked by app`, `probe unavailable`, or `deferred because frontier moved` — plus the prompt packet path, cold-output path, cold-subagent id, or one-line reason. When a mode is blocked in the active workflow but can be generated through a diagnostic route, record both facts in one entry, e.g. `active=blocked by app; diagnostic=exercised via /api/prompt-out/generate; prompt=<path>; output=<path>; subagent=<id>`. This keeps partial runs honest when a blocker stops the walk before every mode can be exercised, and keeps diagnostic packet success from being mistaken for active workflow parity.

When entering data through browser automation, prefer user-like typing and selection for active form controls. Before submitting a mutation, verify the visible control value or active DOM value matches the intended payload. If a synthetic fill or direct DOM mutation diverges from the controlled UI state, rerun with real typing before treating the result as app behavior; log the automation mismatch separately only when it affects the field-build evidence.

After every app action that claims to mutate world state, immediately perform a **post-mutation readback** before logging success or advancing. Read the affected app-owned truth through the active read-side surface when it exists, or through the app/API read endpoint when that endpoint is the only exposed read model, and compare the persisted state to the intended payload. Check the living card/report body, sections or facets, status/tags, links/history, debt or queue state, and any generated record the action should have touched. If the readback does not match, log the mismatch as a finding with the readback evidence; do not count the mutation as successful just because the UI accepted the click or returned a toast.

If a submit result is ambiguous — the card still looks actionable, the toast is unclear, the read-side trail did not visibly update, or automation may have missed the transition — do a fresh persisted readback before retrying the mutation. Do not replay a non-idempotent mutation endpoint as a diagnostic shortcut unless the explicit test is duplicate-submit behavior. When a deliberate retry creates duplicate world data, record the duplicate records/links as evidence contamination, stop relying on that world state as clean authoring material, and carry the caveat into the live log, report, and Frontier.

**Drive the UI; never infer a flow works from its code or tests.** Screenshot each screen into `/tmp/worldloom-field-build/screenshots/`; name shots `field-build-<NN>-<shot>-<slug>.png` so they do not collide across runs, and record the names in the log. **Cold-LLM subagents get the saved packet and nothing else** — that isolation *is* the packet-context test; leaking world or doc context into them destroys the finding. Do not use an already-contextual subagent for a later cold probe. If a true fresh subagent/tool is unavailable, do not simulate the probe with the main agent's context; mark the prompt test `probe unavailable`, log Q if the packet exists but the probe is unavailable, log P if the app failed to supply the packet, and carry that limitation into the report.

The driven surface is the **active, user-reachable workflow destination** named by the app navigation and flow specs. Hidden panels, legacy/full-workspace screens, source-only affordances, and direct API inspection can supply diagnostic evidence, but they do not satisfy parity for the workflow a steward actually reaches. If the active destination cannot carry the decision, stop continuing through an alternate surface as if the app passed; log the active-surface gap with the destination, the alternate surface you found, and whether the missing piece is P/R/F.

For boundary-state regressions, prove both sides of the boundary. Capture the pre-boundary affordances, drive the transition that transfers ownership or state, read back the new ownership/provenance, return to the earlier surface, and verify forbidden controls are absent or disabled while a still-eligible sibling path remains usable when one exists. Record the exact state transition and the negative-control assertion as the regression evidence.

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
| **R** presentation | the app shows exactly the decision's material, attractively and followably | the screen shows too much or too little versus the protocol, is hard to follow / unattractive, feels unpleasant, confusing, overwhelming, confidence-eroding, visually noisy, tonally mismatched, or looks like a redesign candidate rather than local polish |
| **M** methodology-source | the markdown methodology itself is complete and actionable | you want to do something the docs should support but can't, or the source confused you |
| **F** friction | building through the app runs without snags | filling, saving, or navigating snags; a bug; a broken affordance |
| **V** validation | — | the app carried the whole decision — the docs, though open, added nothing (the obsolescence signal; record it — the report isn't all-negative) |
| **Q** question | — | a genuine unknown the build couldn't resolve |

**The walk ends when** the new-world path reaches a stable first version: kernel, seeds, and audit done; every seed fact admitted; every high-pressure consequence propagated or explicitly scoped, debted, or protected; every specialized pass an admitted fact triggered walked; QA (`18`) run; and every mandatory-set regression finding carries a recorded verdict (or an explicit carried-forward note when the commit-gate skipped the pass). A full build is large and may span sessions, so a run may also stop at a stable, non-partial frontier after resolving the mandatory regression set or reaching a newly unblocked major stage, provided no half-authored app mutation is left hanging. When you pause or stop at a frontier, record the stop reason, world file path, last committed decision point, exact next checks, and next stage in the live log; the next invocation reopens the world and resumes. A pass skipped for a real reason is logged as a visible skip, never silently omitted.

## Step 3 — Write the report

When the walk ends (or the user halts it), consolidate the live log into `reports/field-build-<NN>-<world-slug>.md`. **`<NN>` is a global run counter across all seeds** — the highest existing canonical run report number plus one, so reports sort to a single unambiguous *latest* (the one Step 1 loads the regression set from); `<world-slug>` distinguishes the seed. Derivative artifacts may mention a field build, but they do not count when choosing `<NN>` or loading the regression set. Carry **every** finding and **every** decision point — the log is the evidence a later `/to-prd` (app) or methodology-revision session lifts from without re-building.

Preserve raw prompt packets and cold-LLM raw outputs verbatim in `/tmp/worldloom-field-build/cold-llm/`. The report may inline short raw answers; for long answers, include a faithful excerpt or summary plus the artifact path. The report must expose the disposition and enough evidence to lift the finding later, but it does not need to paste every long token block inline.

Write the report skeleton first, before prose polishing. Do not omit a section because it seems empty: write `none` / `N/A - <reason>` under required sections such as **For the methodology** when no findings landed there. The minimum heading skeleton is:

```md
# Field Build <NN> — <world name>
## Findings
## Regression of prior findings
## Decision-point log (evidence)
## For the app (PRD seeds)
## For the methodology
## Frontier
```

If no prior canonical report existed, omit `## Regression of prior findings` only after writing a one-line note in the live log explaining why the section is intentionally absent. Otherwise the heading is mandatory.

```
# Field Build <NN> — <world name>

**Date:** <date>  ·  **App commit:** <short sha>  ·  **Method version:** worldbuilding-system 1.1
**Essence (user seed):** <one line>
**World:** <name> — <premise>.  **World file:** <path>.
**Path walked:** <stages reached>.  **Prior runs:** <links or none>.
**Evidence:** screenshots at `/tmp/worldloom-field-build/screenshots/field-build-<NN>-*.png`; cold prompt packets and outputs at `/tmp/worldloom-field-build/cold-llm/field-build-<NN>-*.md` when any cold probes ran.
**Prior-art frame:** <P/R/F clusters are confirming/extending/new against issues #109-#113, PRDs #201/#202/#204/#205-#210, and prior field/parity reports; name unavailable surfaces explicitly.>

## Findings
For each `[P/R/M/F/V/Q]-NN` — one-line title. Severity is type-appropriate: P/R/M/F use `blocking | friction | cosmetic`; V may use `validation`; Q may use `question`. P also names its mode.
- Where: <app destination / protocol §>
- What happened: <what you saw / what the cold LLM returned> — cite the screenshot + DOM/packet excerpt
- What the methodology requires: <doc § reference>
- The snag: <the break, one line>
- Design verdict (required for R findings, redesign candidates, and structural F/P findings about missing or incorrect screen structure): <ok | local polish | redesign candidate> — <why the scope is local or structural>
- Recommendation (required for R findings, redesign candidates, and structural F/P findings about missing or incorrect screen structure): <specific copy/layout/interaction fix, or the redesign direction the evidence points to>
- Repro (required for blocking findings): <exact inputs / clicks / endpoint + payload that reproduce it, so a later run can replay it verbatim>
- Fix direction: <app spec/component, or methodology file/wording>
- Touches: <docs/specs/… , principle W-# , doc file, or issue #>

## Regression of prior findings
Only when a prior report existed. Head it with the gate: `<prior sha> → <current sha>` when HEAD advanced, or `no app change since field-build-<NN> — findings carried unchanged` when it did not. Then one line per prior open finding:
- `<prior ID>` (<what it guarded>): <fixed → V-NN | partially-fixed | still-broken | not-reverifiable-this-run>
  - Repro replayed: <what you drove> — <result + edge probes>; cite evidence.
Fixed findings also appear as a `V` in Findings; partially-fixed / still-broken re-fire under their original ID marked *carried* / *regressed* and go to the Frontier.

## Decision-point log (evidence)
Per decision point, in walk order:
- Stage / decision point:
- Docs-first draft: <what you authored before the app>
- Prompt-out coverage: proposal=<active-surface state + prompt path, output path, subagent id, or reason; include `diagnostic=exercised via <route>` when applicable>; pressure=<same>
- Cold LLM (proposal): <raw answer when short; otherwise faithful excerpt/summary + artifact path, or "refused — essence">
- Cold LLM (pressure): <raw challenge when short; otherwise faithful excerpt/summary + artifact path>
- Committed: <final field content>
- UX/style verdict: <ok | local R | redesign candidate — why + recommendation>
- Obsolescence verdict: <docs-obsolete (V) — app carried it | docs still needed: what the app failed to carry → finding IDs>

## For the app (PRD seeds)
Cluster the P/R/F findings into fixable scopes; name the likeliest spec/component; flag principle-reinforcement candidates (W-#). For every systemic R finding, repeated local R pattern, redesign candidate, or structural F/P finding about missing or incorrect screen structure, say whether the app work is local polish or redesign, and name the recommended UX direction before turning it into PRD seed material. For every P/R/F cluster, state whether it confirms, extends, or is new relative to the prior-art frame above.

## For the methodology
Cluster the M findings; name the doc file and the wording to revise. This is the field evidence the README's untested surfaces owe — `10`, `11`, `14`, `15`, `16`, `17`, and the proposal mode of `20`.

## Frontier
- Walked to: …
- Next run resumes at: … (world file path, last committed decision point)
- Carried-open findings: <prior IDs still partially-fixed / still-broken / not-reverifiable — the next run's mandatory regression set> or none
- World state: …
```

Before finalizing, run this checklist against the report. This is a hard closeout gate, not a reminder. Start with a heading check, then build the report-metadata and finding-field audit tables:

```bash
rg -n "^(#|##) " reports/field-build-<NN>-<world-slug>.md
```

Verify the heading output includes `## Findings`, `## Regression of prior findings` when a prior canonical report existed, `## Decision-point log (evidence)`, `## For the app (PRD seeds)`, `## For the methodology`, and `## Frontier`. If a required heading is missing, stop and revise the report before cleanup or final response.

Then build a report-metadata audit table in the live log before the finding-field table. Use one row with columns for **Date**, **App commit**, **Method version**, **Essence**, **World file**, **Path walked**, **Evidence**, **Prior-art frame**, and **P/R/F cluster prior-art disposition**. Mark each cell `present` or `N/A - <reason>`; if any required metadata cell is blank, or if any P/R/F cluster is not marked `confirming`, `extending`, or `new` against the prior-art frame, revise the report before cleanup or final response.

Then build a finding-field audit table in the live log with one row per finding ID and columns for every required label: **Where**, **What happened**, **What the methodology requires**, **The snag**, **Fix direction**, **Touches**, plus **Repro** for blocking findings and **Design verdict** / **Recommendation** for R findings, redesign candidates, and structural F/P findings about missing or incorrect screen structure. Mark each cell `present` or `N/A - <reason>`; if any required cell is blank, revise the report before cleanup or final response.

- **Findings** includes every P/R/M/F/V/Q from the live log.
- Every finding includes the template's mandatory fields: **Where**, **What happened**, **What the methodology requires**, **The snag**, **Fix direction**, and **Touches**. If a field is genuinely not applicable for a V/Q finding, write `N/A - <reason>` rather than omitting it.
- **Regression of prior findings** is present with this exact heading when a prior canonical report existed, or intentionally omitted only when none existed.
- **Prior-art frame** is present, and each P/R/F cluster in **For the app** is marked confirming, extending, or new against the named prior surfaces.
- Every blocking finding includes a concrete **Repro** line; if a blocking finding cannot be replayed, the line says exactly why.
- Every R finding, every redesign candidate, and every structural F/P finding about missing or incorrect screen structure includes **Design verdict** and **Recommendation** lines, and redesign candidates say why local polish is insufficient.
- **Decision-point log** includes every reached decision point, its prompt-out coverage ledger, and its required **UX/style verdict**.
- If section-specific kernel packets were exposed, the report or live log includes a row per kernel section with proposal and pressure state, artifact paths or explicit reasons; otherwise it states why the app was treated as generic-packet coverage.
- **For the app**, **For the methodology**, and **Frontier** are present.
- **Evidence paths** for screenshots, raw prompt packets, and cold-LLM outputs are cited when such artifacts exist.
- After any resume, compaction, or interruption, the live log has been reconciled through the final frontier and stop reason.

At closeout, stop any dev server started solely for this build unless the user asked to keep it running; close the browser automation session unless the user asked to keep it open; close or release cold-subagent sessions; and record any intentionally running server or browser session in the final note.

**Complete when:** report written under `reports/field-build-<NN>-<world-slug>.md`, every live-log finding and decision point carried in, the Regression of prior findings section resolved (or omitted when no prior canonical report existed), the Frontier block set, the live log reconciled through that frontier, screenshot, raw prompt packet, and cold-output evidence kept under `/tmp/worldloom-field-build/` and cited from the report, closeout cleanup handled, and `git status --short` shows no newly introduced repo dirt except the report (the world SQLite file lives at its recorded path, uncommitted unless the user asks).

## Guardrails

- **The cold LLM stays cold.** Its only input is the exact app-generated packet saved for that decision and mode. The moment world context, the docs, this conversation, a summary, or a pre-contextual subagent leaks in, the packet-context finding vanishes and the report lies. If you cannot extract the exact packet or cannot get a genuinely fresh subagent, mark the probe `probe unavailable` rather than answering it yourself.
- **Adoption is authorship.** A cold-LLM answer is candidate material; keep only what you'd defend as your own and author it in your own wording into the real field. Never paste a raw answer into a canon field, and never let the essence be proposal-generated.
- **Drive, don't infer.** Parity and prompt-out are settled in the running UI, never from source or tests.
- **Build for real; drive toward doc-obsolescence.** The world is the vehicle; the report's job is to close the gap between the app today and an app that makes the docs unnecessary — and to keep the standard itself clean, since a flawed source can't be faithfully encoded. Log methodology-source friction (M) as seriously as app friction (F).
- **Report, don't fix.** This skill produces one report and a real world in the app, then stops. Fixing the app or editing the docs happens later, from the report. Do not edit app source, `docs/`, or `.claude/skills/` during the build.
- **Mutates only `reports/`, `/tmp/worldloom-field-build/` evidence, and the app's own world data.** Never `docs/`, source, or skills.
- **Regression before rediscovery.** A prior **blocking** finding is not closed because the walk didn't happen to hit it — it is closed only by a recorded regression verdict against a moved commit. When HEAD hasn't advanced, carry it forward unchanged; when it has, replay it. Never let an unverified prior blocking finding silently drop.
- **Extend, don't duplicate.** Check findings against issues #109–#113, PRDs #201/#202/#204/#205–#210, and prior `reports/*field*` / `*parity*` reports; frame each as confirming, extending, or new.
