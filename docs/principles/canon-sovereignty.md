# Canon Sovereignty

*Altitude: constitution. Changes require an explicit steward decision.*

This document exists because the prior app failed exactly here: AI-decided content the steward disagreed with was painful to remove and cascaded through subsequent canon. Its principles operationalize `docs/worldbuilding-system/20_ai_assisted_workflow.md` ("AI is never canon authority"; "every AI-generated idea remains proposed until admitted by human review") as architecture rather than norm.

## P-2. User sovereignty over canon is structural, not advisory

The steward writes or explicitly approves every final word that enters the world. **There is no code path by which generated text becomes canon without deliberate steward admission.** Pasted LLM responses land in an advisory store that is type-separate from canon records; nothing copies from it into a card, ledger row, or report except a steward-performed act that the UI frames as authorship, not acceptance.

The friction this creates is the feature working — deliberate human acts before accepting machine output measurably reduce uncritical over-reliance (report §4.1, P-2 research grounding). The mitigation is severity scaling (W-2), never a bypass.

## W-1. Prompt-out at every dependency-bearing step; paste-in is advisory material

Every step whose output later steps depend on offers a generated prompt the steward **may** (not must) run in any external LLM. The prompts operationalize `20`'s ten analyst roles; the step-to-role mapping lives in `workflow-principles.md`.

Every prompt-out step preserves `20`'s invariant sequence: **human writes → AI challenges → human deletes/selects → human decides → AI summarizes → human records.** No flow step opens with generation — the steward's own material always comes first, and the AI is asked for pressure on it, never for the first draft.

- Every prompt embeds or explicitly omits with reason: the current flow, step, and decision point; the selected record or draft context; relevant dependencies and source links; current-canon or world-kernel summary where applicable; governing package doctrine; `20`'s vocabulary guardrail; label-assumptions instruction; standing rulings and relevant prior advisory dispositions; open canon debt, skips, or unresolved contradictions that bear on the step; the requested analyst role; the instruction to provide pressure, risks, alternatives, and questions rather than final canon; and the advisory/canon warning.
- Prompts must be **fully self-contained** — the receiving model is assumed to have never seen the world.
- Prompt packets are reviewable before copy-out. The steward can see why each context item was included, and large prompts prefer a source manifest plus targeted excerpts over whole-world dumping.
- Pasted responses are stored **verbatim as immutable advisory artifacts** attached to the step that generated the prompt. The app never parses a pasted response into a canon field.
- The steward disposes of advisory material using `20`'s output labels; dispositions persist and steer future prompts.
- Every prompt-out step is skippable — `20`'s anti-automation rule governs.

The prompt-out/paste-in transport is a reasoned design, not an externally evidenced pattern: the archived report's §10 records a negative finding — no published study of deliberately API-less, clipboard-mediated LLM integration was found. App field use is its first real evaluation; specs building on W-1 inherit that honesty (charter T-8), not a claim of validated practice. Sovereignty itself (P-2) does not rest on this evidence — its roots are the prior app's failure and `20`'s doctrine, independently sufficient.

A prompt passes the W-1 quality bar when it is useful in a cold external LLM session without hidden project context and still makes the steward's authority unmistakable.

## Default prompt texts

The app ships **elaborated defaults**, derived from `20`'s ready prompts and roles, with the `20` originals always visible as the doctrinal source. Fidelity is preserved by derivation, not quotation — the same relationship the schema has to the templates (T-4). Defaults are versioned app content: when `20` changes upstream, every derivation is re-checked (P-1). Prompts are steward-editable; app defaults are versioned so edits are reversible.

## Advisory-artifact retention

Advisory artifacts are **retained verbatim, forever**. They are what makes P-2 demonstrable rather than asserted: "the steward authored this, with that material on the table" is only checkable while the material exists. v1 ships no purge affordance. If a real need ever emerges, the decision is ADR-level and the design is a **tombstone purge** — a record of what was destroyed, when, and why — never silent deletion.

## Provenance of advisory input (T-5, advisory half)

Every record and mutation carries provenance: who, when, in which flow step, and — where advisory material was consulted — which prompt was generated and which pasted response was on the table, verbatim. The shape follows W3C PROV informally: the fact *was derived from* the advisory artifact but *was attributed to* the steward. Authorship time is the only trustworthy capture point — post-hoc AI-text attribution is unreliable. The storage mechanism is in `data-principles.md`.

## The API door

v1 is strictly prompt-out/paste-in: no LLM API calls, no API keys, no vendor coupling. This boundary is a *scope* decision (charter), not the sovereignty invariant itself — sovereignty is transport-independent. Any future integration routes through the same advisory store and admission gate, without exception.
