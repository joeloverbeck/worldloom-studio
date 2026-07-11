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

## Packet Rendering

The 10-section content list above is unchanged. PRD #204 and `reports/prompt-structure-research-report.md` change the packet's rendering, ordering, and elicitation structure only. The renderer applies recommendations R1-R10 from that report with the caveats recorded there: end-only task placement is not claimed as academically proven, delimiter ranking is phrased as "choose one, be consistent," named-axis diversity is trial-testable practice rather than confirmed academic fact, and named roles are stance/scope devices rather than accuracy claims.

Every generated packet renders as a sandwich:

1. **Compact top block** — mode, one-sentence role or decision stance, advisory/canon warning, compact forbidden-move summary, and output-label names.
2. **Tagged context middle** — the shared context assembly, rendered in consistent XML-style tags rather than JSON. The standard tags are `<context_packet>`, `<bearing_context>`, `<package_doctrine>`, `<decision_material>`, `<source_records>`, `<standing_rulings>`, `<omissions>`, and `<source_manifest>`.
3. **Full bottom block** — the current decision restated adjacent to the task, the complete mode request, quote-grounding pre-step, forbidden moves with rationales and positive restatements, output-label definitions, exactly one compact structural skeleton example for the active mode, the default prompt derivation, and the anchor phrase "Based on the material above...".

Source records render inside `<documents>` as one `<document>` per record or flow artifact. Each document contains `<source>` metadata with the source-manifest provenance identifier and `<document_content>` with the excerpted content. Context must not be wrapped in JSON. Output labels may remain Markdown/plain text because the research report leaves chat-UI rendering of XML output labels as a field-trial open question.

Section-local micro-instructions sit next to the material they govern:

- advisory, pasted, proposed, or under-review material is labeled as such directly atop the decision material;
- package doctrine is labeled as excerpted or app-owned derivation directly atop the doctrine block;
- omissions are listed where the packet reader can see why missing context is unavailable or irrelevant.

The quote-grounding pre-step appears before the main answer in both modes: the external model is asked to quote the canon, doctrine, or source-record lines its candidates or critiques rest on before answering. Proposal mode asks for alternatives that differ along named axes such as premise, mechanism, and consequence; this is a practice-informed trial criterion, not a proven academic claim. Pressure mode keeps challenge, risks, alternatives, and questions separate from final canon authorship.

Forbidden moves render twice: a compact summary near the top and the full set near the bottom. The full set uses prohibition, rationale, and positive restatement, for example: "do not assign canon standing; only Admission and the steward can change canon standing; label every proposal as a candidate for steward review." The standard forbidden set covers final canon wording, canon standing, truth layer, status, separated package labels, hidden assumptions, and automatic adoption.

Each packet contains exactly one compact structural skeleton example for the active mode. Skeletons are label/whitespace exemplars only; they use content-light placeholders so proposal packets do not anchor all candidates to one content pattern.

Current in-scope Prompt-out surfaces are Creation kernel, Creation seed decomposition, Minimal Viable World checkpoint, Admission prerequisite/constraint prompts, Propagation consequence scout, Constraint Composition challenger, Temporal/Timeline spatial-temporal analyst, Stage 12 institution/economy analyst, Stage 13 repair challenge and boundary guard, and QA red team.

## Inclusion Rules

- Include only context that can affect the current decision point.
- Prefer targeted excerpts with source identifiers over whole-world dumps.
- Include standing rulings when the same advisory pattern, vocabulary, or forbidden move has been disposed before.
- Include open canon debt, skipped instruments, and unresolved contradictions when they can affect the requested mode.
- Include source manifests even for short prompts so cold external sessions can assess provenance.
- For Creation Prompt-out, the general rule means the packet includes the current Creation decision, current kernel or decomposition material, source kernel when available, `05_creation_protocol.md` Phase 1 or Phase 2 as applicable, `templates/world_kernel.md` where kernel authoring is in scope, `20` mode framing, advisory warning, and omission reasons. The normal in-flow Creation path is pre-bound and does not ask the steward for a raw record id.
- Creation kernel packets use the selected kernel section as the local decision grain when a section is selected. The current decision identifies the selected heading; decision material and doctrine carry the selected section's prose or empty state and template prompt; proposal mode requests candidates for that section; pressure mode challenges that section's authored material; and omission reasons name any uncarried section context. A packet must not silently degrade to generic kernel help while a section is selected unless the surface explicitly marks a full-kernel pass.
- Creation `decomposition_pressure` remains the regression anchor and an instance of the general rule. After seed parking, the material under pressure is the seed-decomposition report and parked seed records, not the world kernel alone. The packet includes the report title/body/sections, parked seed short IDs and titles, seed bodies, truth layers, current `proposed` status, granularity rationale or confirmation, Admission intent when supplied, supporting kernel summary, derived-from links to the kernel and report, standing rulings when relevant, source manifest, explicit omissions, advisory/canon warning, and requested pressure analyst role.
- When Creation seed-family coverage inventory exists for the kernel or seed-decomposition report, Creation seed-decomposition Proposal and Pressure packets include decision-bearing coverage context: unresolved rows, covered rows with linked parked proposed seeds, deferred rows with seed-debt or equivalent rationale, out-of-scope rows with rationale, row label or summary, source kernel context, relevant kernel/report provenance, and current proposed status for linked seeds. If the coverage inventory is missing after parked seeds exist, the packet does not ask whether the parked seeds are ready for Admission. Proposal mode names the current task as creating or confirming seed-family coverage rows, asks for candidate coverage row labels, source kernel context, required/optional judgment prompts, and possible disposition rationale questions. Pressure mode refuses premature Admission-readiness framing and challenges missing seed families, false equivalences, unjustified deferrals, unsupported out-of-scope claims, and premature handoff language. Both modes identify the inventory as missing in the source manifest and omissions while preserving the advisory/canon boundary and non-mutation guardrails.
- Open canon debt is included only when it affects the decomposition decision. Frontloaded seed audit results and Admission gate results are included only when they exist; otherwise the omission is explicit because Admission owns those instruments.
- For Temporal/Timeline Prompt-out, the packet includes the current Temporal decision, source record or selected material, pass report, steward-authored coverage, date facets, first-true and first-known timing, latency, residue, sequence-integrity and retrospective-insertion answers, temporal mystery boundaries, existing timeline cards, routed proposals, canon debt, skips, advisory dispositions, `09` doctrine, source manifest, explicit omissions, and advisory/canon warning.
- For Propagation Prompt-out, the packet includes the source fact and owed debt when present, declared severity, active consequences and domain declarations, their stable lineage/version identities, current active dispositions, active-only blockers and close preview, relevant retired-version audit context, and the server-owned active-set identity. Superseded or retracted material is labeled as history and never presented as active decision material.

### Foundational Propagation packet context

PRD #358 deepens the existing Propagation packet at three decision points: foundational Proposal at run entry and the domain-atlas sweep, related-world Pressure before close, and the packet review that precedes copy-out. The governing package sources are `docs/worldbuilding-system/04_domain_atlas.md`, `docs/worldbuilding-system/07_propagation_engine.md`, and `docs/worldbuilding-system/20_ai_assisted_workflow.md`.

A foundational Proposal packet carries the complete atlas in this canonical order, with the compact app-owned decision prompt shown after each name:

1. **Physics, metaphysics, and cosmology** — what is possible or impossible, who knows the rules, how rules vary, and what practices or exploits follow?
2. **Geography, climate, and infrastructure** — where can people live or move, which routes and places matter, and what hazards or barriers shape infrastructure?
3. **Ecology, food, disease, and nonhuman life** — what sustains settlement, what eats or sickens whom, and how the fact changes species, defenses, and ecological cycles?
4. **Population, demography, and household life** — who lives with and depends on whom, and how the fact changes care, reproduction, aging, death, inheritance, or migration?
5. **Production, labor, and technology/magic** — what can be made, by whom, with which scarce skills, tools, maintenance, licensing, or failure modes?
6. **Economy, trade, and scarcity** — what becomes scarce, abundant, cheap, costly, profitable, taxable, insurable, rationed, smuggled, or hoarded?
7. **Governance, law, and bureaucracy** — what needs jurisdiction, records, rights, evidence, regulation, public provision, punishment, or bureaucratic legibility?
8. **War, coercion, and security** — how do attack, defense, force, espionage, detention, doctrine, deterrence, and routine countermeasures change?
9. **Religion, ritual, myth, and meaning** — how is the fact interpreted, ritualized, sanctified, condemned, doubted, or made part of daily spiritual practice?
10. **Culture, custom, language, and identity** — what speech, signs, customs, education, class markers, art, humor, honor, or shame make the fact socially lived?
11. **Knowledge, education, science, and records** — who knows, teaches, certifies, records, proves, censors, inherits, classifies, or sells knowledge of the fact?
12. **History, memory, and path dependence** — what past events, residues, institutions, compromises, traumas, ruins, or revisions should exist if the fact is old?
13. **Daily life and material residue** — what does an ordinary person, child, worker, house, market, routine, object, or small luxury reveal before explanation?
14. **Aesthetics, tone, and narrative use** — how does the fact affect genre, mood, symbolic language, wonder, horror, beauty, scale, focus, and the world's emotional promise?

The packet explains the four-way atlas triage: **direct** domains are where the fact acts first; **dependency** domains contain what must already exist; **reaction** domains show adaptation by people, institutions, ecologies, markets, or symbols; **negative** domains look unaffected but would be contradictory or suspiciously quiet without an explanation. Foundational severity owes the full atlas because `07` requires the full domain, temporal, spatial, agent, institution/economy, mystery, branch, aesthetic, and QA passes at foundational pressure. Minor and ordinary major packets retain their proportionate severity-derived coverage and do not inherit a mandatory atlas dump.

Pressure starts with the PRD #353 active packet context: source fact; owed debt when present; declared severity; active consequences, domains, dispositions, and blockers; close preview; active-set identity; and relevant retired-version audit context. It then selects related-world context through bounded structural relationships only:

- targeted active world-kernel commitments bearing on premise, tone, consequence mode, constraints, or protected effects;
- records directly linked to the source fact or active Propagation material through existing typed links; and
- records sharing the source fact's immediate kernel, seed-family, decomposition-report, or other direct derivation origin.

Selection does not traverse outward from a selected sibling, infer semantic relevance, rank with a model, synthesize a relationship, or add link vocabulary. Dependency-bearing proposed, under-review, contested, localized, branch, and other non-current-canon records may be included only with their standing visibly intact; inclusion never promotes or admits them. Superseded or inactive records are excluded from current support unless explicitly labeled as history.

Every included related record carries stable identity, title, record type, canon status, truth layer when present, the structural relationship that made it eligible, a role-specific inclusion reason, and whether it is active support or historical context. Its targeted excerpt is at most 2,000 Unicode characters. Related-world excerpts share a 12,000-Unicode-character aggregate budget; the source fact, active run material, and compact atlas doctrine are outside that budget. Deterministic priority is kernel, direct current canon, shared-origin current canon, then visibly proposed or contested siblings after mandatory source/run context.

Every identifiable considered candidate appears exactly once as an included record or a record-specific omission. Omission reasons distinguish unavailable content, inactive or superseded current-support status, Pressure-role irrelevance, exclusion by the bounded relationship shapes (including second-hop records), and packet-budget trimming. Kernel sections outside premise, tone, consequence mode, constraints, or protected effects receive specific omission reasons rather than being silently dropped or dumped wholesale.

The server returns the atlas doctrine, selected records, standing labels, relationships, inclusion reasons, omissions, blockers, packet identity, current/next/resume state, and governed recovery. The browser renders that authoritative assembly without reselecting, reclassifying, budgeting, hashing, or inventing omissions. Generation, preview, and copy are read-only: they create or change no record, link, status, debt, skip, advisory artifact, disposition, flow state, or world-file content. The shared sandwich renderer, source documents and manifest, output labels, advisory warning, optional/skippable lifecycle, packet hashes, and PRD #353 stale/current behavior remain unchanged.

## Assistance Modes

Proposal mode and pressure mode follow `docs/worldbuilding-system/20_ai_assisted_workflow.md` version 1.1.

- **Proposal mode** asks a cold external LLM to draft labeled candidate material for the current decision. The request carries the decision, the relevant world context, doctrine text, output labels, advisory/canon boundary, and forbidden moves. The response may recommend and label assumptions; it may not assign canon standing or any separated package label.
- **Pressure mode** asks for challenge on steward-authored material. Pressure packets name the pressure role, the authored material under pressure, risks/alternatives/questions framing, and the same advisory/canon boundary.
- **Adoption remains authorship.** A pasted response is advisory material. The steward selects, edits, discards, or adopts with revision, then authors any surviving material into the governed record in their own wording.
- **Essence exception.** Proposal mode is refused for the Creation kernel World premise section only, with a server-owned blocker naming `05_creation_protocol.md` Phase 1 and `20`'s essence rule. Other kernel sections and later Creation decision points may offer proposal mode.

PRD #173 completes the shared-contract rollout of these two modes across already-guided flows, and PRD #201 adds the same shared lifecycle to Temporal/Timeline. Creation, Admission, Constraint Composition, Temporal/Timeline, Propagation, Stage 12, Stage 13, and QA expose proposal/pressure availability through the `decision-point/v1` contract; the flow specs' Step Map tables are the authority for the local decision, dependency-bearing status, severity path, and pressure role at each step.

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

## Loaded Prompt Status Identity

A loaded or copied Prompt-out status is scoped to the exact prompt packet origin, not merely to the fact that a prompt was loaded somewhere in the browser. The status carries enough identity to compare it with the active decision: world path, flow key, flow/run identifier where available, selected record identifier where available, step key, mode, decision label, and creation time or packet hash where useful. Admission status also carries the severity context that can change the active packet, such as `admission_level` and `work_scale`.

The loaded status remains current only while that origin matches the active decision and packet identity. It clears or renders as stale with its prior-decision origin when the active decision changes, the selected record changes, the step changes, the prompt mode changes to a different packet, the prompt packet changes, Creation seed parking moves the active preview to decomposition, a Propagation consequence/domain/disposition mutation changes the active-set identity, or the world switches. A stale status labels the prior origin and offers a safe clear or return action; it must not silently imply that the old loaded packet matches the current copy-out material. The status text must carry equivalent context for visual and assistive-technology users without relying on screen position alone.

## Propagation Active-Set Currentness

Propagation packet identity includes the flow id and the server-owned active-set identity in addition to the common origin fields. Consequence revision/retraction, domain revision/retraction, and disposition mutation advance that identity. The server returns the changed row or revision and a human-readable stale reason so recovery never depends on comparing hashes.

Packet-bound copy, advisory storage, advisory disposition, advisory-use, and other actions that claim current packet status are refused when their submitted identity no longer matches the open run. Refusal is atomic and returns the current packet route plus current blockers and active-set identity. The safe recovery action loads a new Proposal or Pressure packet over the active set; it does not reinterpret the old packet as current.

If a Pressure packet was used and a later substantive revision changes the active set, the Propagation decision state marks Pressure support owed again. The steward may load and use a fresh Pressure packet or record the governed Prompt-out skip. The existing severity rule applies: major-or-higher work owes a steward reason for the skip; lower-severity work may skip without one. This is a currentness and audit obligation, not an external-LLM requirement.

## Cold External LLM Test

A proposal packet passes when a model with no prior world or repository context can draft labeled candidate material with alternatives and assumptions while still respecting the advisory/canon boundary and forbidden labels. A pressure packet passes when that same model can give useful pressure, risks, alternatives, or questions without being asked to author final canon. Both tests fail if the steward must manually add doctrine, source records, vocabulary guardrails, output-label rules, or advisory/canon boundaries before the prompt is usable.

For decomposition pressure, the prompt passes only when the external model can inspect the exact parked seeds, report rationale, governance status, Creation seed-family coverage inventory when present, missing-inventory state and coverage-row task framing when absent, coverage omissions, and Creation-to-Admission boundary without opening repository files or asking the steward for missing seed context.

Structural criteria are part of the cold test and are checkable at the server prompt-generation seam:

- sandwich placement is present: compact top block, tagged context middle, and full bottom block;
- XML-style tags are consistent and source records use `<documents>/<document>/<source>/<document_content>`;
- source identifiers from the source manifest are visible in the document metadata;
- no JSON context wrapper is used;
- section-local micro-instructions appear next to advisory/proposed material and excerpted doctrine;
- quote-grounding is requested before the main answer;
- forbidden moves are rationalized and positively restated, with summary near the top and full set near the bottom;
- exactly one structural skeleton example appears for the active mode;
- proposal alternatives are asked to differ along named axes such as premise, mechanism, and consequence;
- pressure output keeps challenge, risks, alternatives, and questions separate from authoring final canon;
- the current decision is adjacent to the closing task and anchor phrase.

## Field-Trial Prompt Evaluation

The field trial's isolated-subagent prompt evaluation inherits the research report's open questions instead of treating them as settled implementation facts:

- whether named-analyst framing improves critique quality or only stance/tone;
- which single-turn diversity device works best for proposal alternatives;
- whether long-context placement effects matter below roughly 20k tokens;
- whether chat UIs handle XML-tagged output labels well enough or should keep output labels in Markdown/plain text.

The Prompt-out maturity row in `docs/methodology-coverage.md` should remain below field-validated until a real field trial exercises proposal and pressure packets across real worldbuilding work. This PRD hardens structure; it does not create field-use evidence by itself.

## Principles

Touches `docs/worldbuilding-system/05_creation_protocol.md`, `docs/worldbuilding-system/06_canon_fact_admission_protocol.md`, `docs/worldbuilding-system/07_propagation_engine.md`, `docs/worldbuilding-system/09_temporal_and_timeline_protocol.md`, `docs/worldbuilding-system/20_ai_assisted_workflow.md` version 1.1, `docs/specs/creation-flow.md`, `docs/specs/propagation-flow.md`, `docs/specs/temporal-timeline-flow.md`, `canon-sovereignty.md` P-2/W-1/T-5, `guided-workflow-usability.md` W-8/W-9, `workflow-principles.md` W-1/W-3/W-4/W-7, `domain-fidelity.md` P-1/T-2, `data-principles.md` W-5/W-6/T-5, ADR 0007, ADR 0009, PRD #150, PRD #158, PRD #165, PRD #201, and PRD #353. It affirms non-contradiction: Prompt-out owns shared packet lifecycle and Propagation supplies only active-set context and flow-specific aftermath; external assistance remains optional and advisory.
