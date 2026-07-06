# Prompt-Out Context Assembly Spec

This spec defines the cross-flow prompt packet standard for prompt-out/paste-in. It is downstream of `docs/worldbuilding-system/20_ai_assisted_workflow.md`, `docs/principles/canon-sovereignty.md`, `docs/principles/guided-workflow-usability.md`, `docs/principles/workflow-principles.md`, ADR 0007, and the flow specs that offer prompt-out.

Prompt-out remains external and optional. This spec does not add LLM API calls, API keys, vendor coupling, automatic canonization, or parsing of pasted responses.

## Common Prompt Packet

Every decision-point prompt-out step assembles a self-contained prompt packet from the same decision-point context assembly the browser surface displays. The packet carries every decision-relevant context item shown at the decision point, or names the omission explicitly with a reason. This is the general rule for every dependency-bearing decision point in every guided flow: packet context and screen context are two renderings of one assembly, not two separately queried context sets.

Each packet includes these sections, omitting a section only when the prompt preview states why it is not applicable:

1. **Current decision** — flow, step, local decision, severity path, and intended package role.
2. **Decision material** — the steward-authored fact, draft, report section, score, repair, consequence under pressure, or the material being requested in proposal mode.
3. **Source records** — selected records and links needed for the role, with short IDs and source paths where available as provenance.
4. **Bearing context** — the smallest relevant world-kernel, current-canon, debt, contradiction, skip, omission, or standing-ruling context needed for the decision.
5. **Package doctrine** — governing protocol, checklist, template, operating-card, and vocabulary excerpts. File paths may label provenance, but they do not substitute for the decision-relevant rule text.
6. **Mode request** — proposal mode or pressure mode, with the mode-appropriate framing. Proposal requests ask for labeled candidate material with alternatives and assumptions. Pressure requests ask for pressure, risks, alternatives, and questions through one of `20_ai_assisted_workflow.md`'s analyst roles or a flow-specific derivation.
7. **Forbidden moves** — no final canon, no hidden assumptions, no auto-admission, no unlabelled invented facts, and no assignment of canon standing, truth layer, status, or other separated labels.
8. **Output labels** — the advisory disposition labels, including `adopted with steward revision`, or flow-specific labels the steward will use.
9. **Advisory warning** — the steward decides; pasted responses remain immutable advisory artifacts.
10. **Source manifest** — records, doctrine excerpts, standing rulings, and omissions with reasons.

## Inclusion Rules

- Include only context that can affect the current decision point.
- Prefer targeted excerpts with source identifiers over whole-world dumps.
- Include standing rulings when the same advisory pattern, vocabulary, or forbidden move has been disposed before.
- Include open canon debt, skipped instruments, and unresolved contradictions when they can affect the requested mode.
- Include source manifests even for short prompts so cold external sessions can assess provenance.
- For Creation Prompt-out, the general rule means the packet includes the current Creation decision, current kernel or decomposition material, source kernel when available, `05_creation_protocol.md` Phase 1 or Phase 2 as applicable, `templates/world_kernel.md` where kernel authoring is in scope, `20` mode framing, advisory warning, and omission reasons. The normal in-flow Creation path is pre-bound and does not ask the steward for a raw record id.
- Creation `decomposition_pressure` remains the regression anchor and an instance of the general rule. After seed parking, the material under pressure is the seed-decomposition report and parked seed records, not the world kernel alone. The packet includes the report title/body/sections, parked seed short IDs and titles, seed bodies, truth layers, current `proposed` status, granularity rationale or confirmation, Admission intent when supplied, supporting kernel summary, derived-from links to the kernel and report, standing rulings when relevant, source manifest, explicit omissions, advisory/canon warning, and requested pressure analyst role.
- Open canon debt is included only when it affects the decomposition decision. Frontloaded seed audit results and Admission gate results are included only when they exist; otherwise the omission is explicit because Admission owns those instruments.

## Assistance Modes

Proposal mode and pressure mode follow `docs/worldbuilding-system/20_ai_assisted_workflow.md` version 1.1.

- **Proposal mode** asks a cold external LLM to draft labeled candidate material for the current decision. The request carries the decision, the relevant world context, doctrine text, output labels, advisory/canon boundary, and forbidden moves. The response may recommend and label assumptions; it may not assign canon standing or any separated package label.
- **Pressure mode** asks for challenge on steward-authored material. Pressure packets name the pressure role, the authored material under pressure, risks/alternatives/questions framing, and the same advisory/canon boundary.
- **Adoption remains authorship.** A pasted response is advisory material. The steward selects, edits, discards, or adopts with revision, then authors any surviving material into the governed record in their own wording.
- **Essence exception.** Proposal mode is refused for the Creation kernel World premise section only, with a server-owned blocker naming `05_creation_protocol.md` Phase 1 and `20`'s essence rule. Other kernel sections and later Creation decision points may offer proposal mode.

PRD #173 completes the shared-contract rollout of these two modes across already-guided flows. Creation, Admission, Constraint Composition, Propagation, Stage 12, Stage 13, and QA expose proposal/pressure availability through the `decision-point/v1` contract; the flow specs' Step Map tables are the authority for the local decision, dependency-bearing status, severity path, and pressure role at each step.

## Omission Rules

When relevant context is unavailable, too large, or intentionally excluded, the prompt preview must state the omission and why the prompt is still useful. Silent omission is allowed only for context that is irrelevant to the role.

For `decomposition_pressure`, missing or incomplete decomposition material is a blocker, not a reason to generate a kernel-only prompt. Required material is the seed-decomposition report plus at least one parked seed derived from it.

## Lifecycle

1. The steward fixes the current decision point and the app assembles its context.
2. The app previews the prompt packet and source manifest for the selected mode.
3. The steward may copy the proposal or pressure prompt, or skip the prompt-out step.
4. A skip writes a `skip_record` under `workflow-principles.md` W-4.
5. A pasted response is stored verbatim as an immutable `advisory_artifact`.
6. The steward records an advisory disposition.
7. Only explicit steward use creates `cites_advisory_artifact` or equivalent derivation links.
8. Canon-changing material still routes through Admission.

## Cold External LLM Test

A proposal packet passes when a model with no prior world or repository context can draft labeled candidate material with alternatives and assumptions while still respecting the advisory/canon boundary and forbidden labels. A pressure packet passes when that same model can give useful pressure, risks, alternatives, or questions without being asked to author final canon. Both tests fail if the steward must manually add doctrine, source records, vocabulary guardrails, output-label rules, or advisory/canon boundaries before the prompt is usable.

For decomposition pressure, the prompt passes only when the external model can inspect the exact parked seeds, report rationale, governance status, and Creation-to-Admission boundary without opening repository files or asking the steward for missing seed context.

## Principles

Touches `docs/worldbuilding-system/05_creation_protocol.md`, `docs/worldbuilding-system/06_canon_fact_admission_protocol.md`, `docs/worldbuilding-system/20_ai_assisted_workflow.md` version 1.1, `docs/specs/creation-flow.md`, `canon-sovereignty.md` P-2/W-1/T-5, `guided-workflow-usability.md` W-8/W-9, `workflow-principles.md` W-1/W-3/W-4/W-7, `domain-fidelity.md` P-1/T-2, `data-principles.md` W-5/T-5, ADR 0007, ADR 0009, PRD #150, PRD #158, and PRD #165. It affirms non-contradiction and introduces no code, schema, or behavior change by itself.
