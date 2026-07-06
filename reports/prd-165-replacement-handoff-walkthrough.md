# PRD 165 Replacement Handoff Walkthrough

**Date:** 2026-07-05
**World file:** `/tmp/worldloom-prd165-browser.sqlite`
**Route:** `http://127.0.0.1:5173/`
**Scope:** Issues #166-#169 for PRD #165.

## Browser Evidence

The walkthrough started from an open early-world state created through the
setup shell. The browser showed the world open at
`/tmp/worldloom-prd165-browser.sqlite`, the setup controls secondary, and
Creation available as the active frontier before advanced work.

Steward actions:

1. Started Creation from the open world.
2. Saved `World premise` as `Mourningweather turns public grief into literal storms.`
3. Set consequence mode to `weird`.
4. Parked seed `Public mourning produces local weather` with body
   `Public mourning changes local weather, and unmourned losses become floods, droughts, or corrosive fog.`
5. Set truth layer to `Objective canon`.
6. Recorded granularity rationale
   `Each seed can be rejected without rewriting its siblings.`
7. Recorded Admission intent
   `Audit during Admission for institutional cost.`
8. Loaded the in-flow Creation Prompt-out step and generated
   `decomposition_pressure`.

Observed handoff text included:

- `Creation-to-Admission handoff`
- `Not current: work from the Creation handoff before starting unrelated advanced flows.`
- `File paths and package sources are provenance, not primary operating instructions.`
- `Creation parks proposed seeds; Admission owns first canon standing.`
- `FAC-1 · Public mourning produces local weather`
- `Truth layer: Objective canon · Current canon status: proposed`
- `Seed decomposition report SEE-1: Seed decomposition`
- `Granularity rationale: Each seed can be rejected without rewriting its siblings.`
- `Admission intent: Audit during Admission for institutional cost.`
- `Admission route: /api/admission/queue`
- read-side links for the kernel, seed-decomposition report, parked seed, and
  Admission queue.

Prompt generation produced a 4528-character packet. Content checks passed for:

- seed-decomposition report material;
- parked seed title, body, truth layer, and `proposed` status;
- granularity rationale and Admission intent;
- supporting kernel summary;
- derived-from source links;
- focused doctrine text, including Creation/Admission boundary;
- source manifest;
- explicit omissions;
- advisory/canon warning;
- requested analyst role and output labels.

The local browser screenshot for the session was saved at
`.playwright-cli/page-2026-07-05T14-54-25-195Z.png`.

## Cold-Context Prompt Check

The generated prompt was inspected as a standalone packet, with no reliance on
repository files or hidden world context. It contains enough material for a cold
LLM session to ask useful pressure questions, including:

- whether the weather-producing mourning seed is still bundled with institutional
  cost, ecological effect, and social response;
- what prerequisites Admission must audit before any canon standing changes;
- whether unmourned losses becoming floods, droughts, or corrosive fog needs
  separate seeds or constraints;
- which risks belong to proposed-only Creation material versus admitted canon.

No external network LLM call was used. The recorded test is the PRD's cold
external LLM standard applied to the generated prompt packet: useful pressure,
risks, alternatives, or questions are possible from the packet alone, and the
packet does not ask the model to author final canon.

## Advisory And Skip Evidence

The browser-visible prompt packet and handoff state both warn that Prompt-out is
optional advisory pressure and that pasted responses remain advisory artifacts
unless the steward explicitly uses them. The walkthrough exercised prompt
generation, not pasted advisory storage. Existing Prompt-out lifecycle tests
continue to cover governed skip records and advisory artifact immutability.

## Naive-Steward Walkthrough

| Check | Result |
|---|---|
| Can identify the decision | Pass: the foreground surface is `Creation-to-Admission handoff` after parking. |
| Can see why the package asks for it | Pass: the Phase 2 independent-rejection rule and thin-start boundary are visible in app wording. |
| Can distinguish required, optional, and skippable work | Pass: seed fields and granularity are the completed required work; Prompt-out is labelled optional advisory pressure. |
| Can understand Prompt-out as advisory pressure | Pass: the handoff and prompt packet state no final canon and no automatic mutation. |
| Can predict writes, routes, and non-mutations | Pass: Creation writes `SEE-1` and `FAC-1` at `proposed`, then routes to Admission; Admission owns first canon standing. |
| Can understand blockers | Pass: server tests cover the missing-context blocker for kernel-only decomposition prompts. |
| Can exit and resume | Pass: the handoff names current/next state and read-side links for kernel, report, parked seed, and Admission queue. |
| Can distinguish provenance from guidance | Pass: primary guidance carries method text; file paths/package sources are named as provenance. |

## Coverage Decision

Creation remains `walkthrough-passed` overall because later Creation phases are
still outside this PRD. The Creation phases 1-2 handoff and
`decomposition_pressure` prompt path now have prompt-context-complete evidence.
Prompt-out (`20`) is not promoted globally because other dependency-bearing
prompt paths still need the same cold-context proof.
