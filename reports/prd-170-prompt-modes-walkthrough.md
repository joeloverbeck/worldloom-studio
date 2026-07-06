# PRD 170 Prompt Modes Walkthrough

**Date:** 2026-07-05
**World file:** `/tmp/worldloom-prd170-browser.sqlite`
**Route:** `http://127.0.0.1:5173/`
**Scope:** Issues #174-#179 for PRD #170.

## Browser Evidence

The walkthrough started from a newly created world file at
`/tmp/worldloom-prd170-browser.sqlite`. The browser showed the world open, the
Creation decision point as the primary active path, and the setup controls as
secondary.

Steward actions:

1. Started Creation from the open world.
2. Observed the empty `World premise` decision point.
3. Saved `World premise` as
   `Mourningweather turns public grief into literal storms.`
4. Set consequence mode to `weird`.
5. Saved `Starting scale` as
   `Begin with one harbor district and its mourning courts.`
6. Loaded the in-flow Creation Prompt-out step from the server-returned mode
   request.
7. Generated a proposal-mode prompt packet.
8. Pasted an advisory response and selected `adopted with steward revision`.
9. Stored the advisory artifact.
10. Loaded the generic pressure-mode prompt step and used the single
    `Skip Prompt` action.

Observed browser text included:

- `Proposal mode`
- `Pressure mode`
- `Proposal prompts are refused for the world's essence`
- `Request labeled candidates with alternatives and assumptions`
- `Ask for challenge, risks, alternatives, and questions`
- `Output labels: selected, deleted, challenged, ignored, standing ruling, adopted with steward revision, rejected`
- `Advisory/canon warning`
- `Pasted responses remain advisory artifacts and are not admitted canon`
- `Record KER-1: World kernel`
- `World premise: Mourningweather turns public grief into literal storms.`
- `Starting scale: Begin with one harbor district and its mourning courts.`
- `Proposal mode · creation:kernel_prompt`
- `Mode: proposal`
- `ADV-1 · Advisory artifact: creation:kernel_prompt`
- `SKP-1 · Skip: kernel_pressure`

The final browser screenshot is saved at
`output/playwright/prd170-prompt-modes-walkthrough.png`.

## Cold-Context Prompt Check

The generated proposal packet was inspected as a standalone prompt. The stored
advisory artifact body is 3176 characters and contains:

- proposal-mode framing;
- the current Creation decision;
- source doctrine from `05_creation_protocol.md`,
  `templates/world_kernel.md`, and `20_ai_assisted_workflow.md`;
- output labels, including `adopted with steward revision`;
- a source manifest naming `kernel_pressure`;
- explicit omission text;
- the selected `KER-1` record, truth layer, canon status, and both displayed
  kernel sections;
- the advisory/canon warning.

This packet is sufficient for a cold external LLM session to propose candidate
material for the Starting scale decision without hidden repository context, and
it forbids canon-standing, truth-layer, or status assignments.

## Advisory And Skip Evidence

Database verification against `/tmp/worldloom-prd170-browser.sqlite`:

```text
ADV-1|advisory_artifact|Mode: proposal|adopted with steward revision
SKP-1|skip_record|Skip: kernel_pressure|Reason not collected below major-fact threshold.
```

The stored records after the walkthrough were:

```text
KER-1|World kernel|Objective canon|proposed
ADV-1|Advisory artifact: creation:kernel_prompt|disputed claim|proposed
SKP-1|Skip: kernel_pressure|Objective canon|proposed
```

No current canon row was affected by the advisory paste. The read-side trail
showed `ADV-1` and `SKP-1` as audit records, with the kernel record still
separate.

## Closeout Fix

The first browser pass found a #179 blocker: loading the in-flow Creation prompt
step displayed the success message `Loaded Creation Prompt-out step Proposal
mode`, but the shared Prompt-out tool immediately cleared the loaded
server-owned step after prompt context state changed.

The fix updates the Admission and Creation prompt-step loaders to set prompt
context state before fetching and storing the server step, so the cleanup effect
runs before the new step is stored. The React regression asserts that the
Creation loader sets the prompt context before `setPromptStep(payload.step)`.

## Naive-Steward Walkthrough

| Check | Result |
|---|---|
| Can identify the decision | Pass: the Creation decision point names the kernel decision and shows `kernel:Starting scale` after resume. |
| Can see why the package asks for it | Pass: the page shows Phase 1 authority and world-kernel doctrine as operating text, with paths as provenance. |
| Can tell the modes apart | Pass: Proposal is candidates, alternatives, and assumptions; pressure is challenge, risks, alternatives, and questions. |
| Can predict what paste does | Pass: the page says pasted responses stay advisory and do not mutate kernel sections, seed records, reports, or proposals. |
| Can find the essence exception | Pass: `World premise` refuses proposal prompts with the world's-essence reason. |
| Can find the skip path | Pass: `Skip Prompt` is one action and produced `SKP-1`. |
| Can follow the read-side trail | Pass: Audit Trail shows `ADV-1`, `SKP-1`, and the kernel remains available as `KER-1`. |

## Coverage Decision

Creation remains `walkthrough-passed`, not field-validated. PRD #170 upgrades
only the proven Creation kernel prompt-mode path: World premise essence blocker,
Starting scale proposal packet, advisory disposition, pressure skip, and
read-side trail. Prompt-out (`20`) is still not promoted globally because other
dependency-bearing prompt paths and proposal mode have not been field-tested in
real app use.
