# Prompt-Out Context Assembly Spec

This spec defines the cross-flow prompt packet standard for prompt-out/paste-in. It is downstream of `docs/worldbuilding-system/20_ai_assisted_workflow.md`, `docs/principles/canon-sovereignty.md`, `docs/principles/guided-workflow-usability.md`, `docs/principles/workflow-principles.md`, ADR 0007, and the flow specs that offer prompt-out.

Prompt-out remains external and optional. This spec does not add LLM API calls, API keys, vendor coupling, automatic canonization, or parsing of pasted responses.

## Common Prompt Packet

Every dependency-bearing prompt-out step assembles a self-contained prompt packet with these sections, omitting a section only when the prompt preview states why it is not applicable:

1. **Current decision** — flow, step, local decision, severity path, and intended package role.
2. **Steward material** — the steward-authored fact, draft, report section, score, repair, or consequence under pressure.
3. **Source records** — selected records and links needed for the role, with short IDs and source paths where available.
4. **Current-canon context** — the smallest relevant world-kernel, current-canon, debt, contradiction, skip, or standing-ruling context needed for the pressure task.
5. **Package doctrine** — governing protocol, checklist, template, operating-card, and vocabulary excerpts.
6. **Role request** — one of `20_ai_assisted_workflow.md`'s analyst roles or a flow-specific derivation.
7. **Forbidden moves** — no final canon, no hidden assumptions, no auto-admission, no unlabelled invented facts.
8. **Output labels** — the advisory disposition labels or flow-specific labels the steward will use.
9. **Advisory warning** — the steward decides; pasted responses remain immutable advisory artifacts.
10. **Source manifest** — records, doctrine excerpts, standing rulings, and omissions with reasons.

## Inclusion Rules

- Include only context that can affect the current decision point.
- Prefer targeted excerpts with source identifiers over whole-world dumps.
- Include standing rulings when the same advisory pattern, vocabulary, or forbidden move has been disposed before.
- Include open canon debt, skipped instruments, and unresolved contradictions when they can affect the requested pressure.
- Include source manifests even for short prompts so cold external sessions can assess provenance.
- For Creation Prompt-out, include the current Creation decision, current kernel or decomposition material, source kernel when available, `05_creation_protocol.md` Phase 1 or Phase 2 as applicable, `templates/world_kernel.md` where kernel authoring is in scope, `20` role framing, advisory warning, and omission reasons. The normal in-flow Creation path is pre-bound and does not ask the steward for a raw record id.

## Omission Rules

When relevant context is unavailable, too large, or intentionally excluded, the prompt preview must state the omission and why the prompt is still useful. Silent omission is allowed only for context that is irrelevant to the role.

## Lifecycle

1. The steward authors or selects material first.
2. The app previews the prompt packet and source manifest.
3. The steward may copy the prompt or skip the prompt-out step.
4. A skip writes a `skip_record` under `workflow-principles.md` W-4.
5. A pasted response is stored verbatim as an immutable `advisory_artifact`.
6. The steward records an advisory disposition.
7. Only explicit steward use creates `cites_advisory_artifact` or equivalent derivation links.
8. Canon-changing material still routes through Admission.

## Cold External LLM Test

A prompt packet passes when a model with no prior world or repository context can give useful pressure, risks, alternatives, or questions without being asked to author final canon. The test fails if the steward must manually add doctrine, source records, vocabulary guardrails, or advisory/canon boundaries before the prompt is usable.

## Principles

Touches `canon-sovereignty.md` P-2/W-1/T-5, `guided-workflow-usability.md` W-8, `workflow-principles.md` W-1/W-4/W-7, `domain-fidelity.md` P-1/T-2, `data-principles.md` T-5, and ADR 0007. It affirms non-contradiction.
