# 21. Templates Index

Templates and checklists are thinking instruments. They are not mandatory forms, software records, database tables, schemas, API contracts, or implementation plans. Use the lightest instrument that catches the danger.

A good template entry answers a question. A bad one merely fills a blank. Leave fields empty if they do not apply. Mark “not yet known” only when uncertainty itself matters.

## Template families

### Seed and fact templates

- `templates/world_kernel.md` — the lean world premise and initial constraints.
- `templates/canon_fact_card.md` — a single canon fact, its truth layer, status, constraint tags, consequences, and evidence.
- `templates/capability_card.md` — a repeated power, technology, magic, skill, species trait, tool, or action permission.
- `templates/constraint_card.md` — a limit, bottleneck, taboo, cost, or failure mode that keeps a fact from flattening the world.

### Domain templates

- `templates/institution_card.md` — an institution, formal or informal.
- `templates/action_arena_card.md` — a recurring situation where actors interact under rules and incentives.
- `templates/counter_institution_card.md` — underground, rival, suppressive, unofficial, or black-market institution.
- `templates/temporal_timeline_card.md` — era, event, latency, residue, branch chronology.
- `templates/spatial_region_card.md` — region, terrain, routes, diffusion, local variation.
- `templates/agent_character_card.md` — actor psychology, motive, identity, belief, capability, pressure.
- `templates/uncertainty_evidence_card.md` — claim, source, confidence, evidence, dispute, belief ecology.
- `templates/aesthetic_coherence_card.md` — tone, symbols, language, motifs, sensory residue.

### Change and repair templates

- `templates/canon_change_proposal.md` — proposed change and admission decision path.
- `templates/propagation_report.md` — shock-cone consequences across domains.
- `templates/contradiction_report.md` — contradiction classification and repair operation.
- `templates/mystery_ledger_entry.md` — protected unknowns and reveal boundaries.
- `templates/canon_branch_diff.md` — branch divergence and continuity comparison.
- `templates/collaboration_decision_record.md` — human governance record.

## Checklist families

### Entry gates

- `checklists/frontloaded_seed_audit.md` — used by `05_creation_protocol.md` and `templates/world_kernel.md` so seed facts do not bypass propagation.
- `checklists/canon_fact_gate.md` — used by `06_canon_fact_admission_protocol.md` before treating any proposal as active canon.

### Propagation and domain sweeps

- `checklists/propagation_sweep.md` — used by `07_propagation_engine.md` after a fact passes the gate.
- `checklists/constraint_composition_sweep.md` — used by `08_constraint_composition.md` when multiple limits govern the same fact.
- `checklists/temporal_timeline_sweep.md` — used by `09_temporal_and_timeline_protocol.md` for causality, latency, fossils, branch chronology, and retcon risk.
- `checklists/spatial_geographic_sweep.md` — used by `10_spatial_and_geographic_propagation.md` for routes, barriers, diffusion, regional variation, and negative space.
- `checklists/agent_character_sweep.md` — used by `11_agent_character_psychology.md` for bounded agency, identity, motive, and character pressure.
- `checklists/institutional_economic_suppression_sweep.md` — used by `12_institutional_economic_and_suppression_protocol.md` for action arenas, transaction costs, black markets, suppression, and counter-institutions.
- `checklists/uncertainty_evidence_sweep.md` — used by `14_uncertainty_belief_and_evidence.md` for sources, confidence, proof standards, belief ecology, and protected unknowns.
- `checklists/aesthetic_coherence_sweep.md` — used by `17_aesthetic_coherence_and_semiosis.md` for tone, signs, language, sensory texture, and aesthetic residue.

### Governance sweeps

- `checklists/mystery_preservation.md` — used by `13_contradiction_retcon_and_mystery.md` when contradiction repair, retcon, reveal, or adaptation risks collapsing a protected unknown.
- `checklists/branching_collaboration_sweep.md` — used by `15_branching_versioning_and_collaboration.md` when branch, merge, dispute, retirement, or multi-contributor governance is involved.

## Minimal use paths

### Tiny local detail

Use only:

- `templates/canon_fact_card.md` or a paragraph equivalent;
- `checklists/canon_fact_gate.md`.

### Major capability

Use:

- `templates/canon_change_proposal.md`;
- `checklists/canon_fact_gate.md`;
- `templates/canon_fact_card.md`;
- `templates/capability_card.md`;
- `templates/constraint_card.md`;
- `checklists/constraint_composition_sweep.md` if limits interact;
- `templates/propagation_report.md`;
- `checklists/propagation_sweep.md`;
- relevant domain templates and sweeps.

### Contradiction or retcon

Use:

- `templates/contradiction_report.md`;
- repair operations from `13_contradiction_retcon_and_mystery.md`;
- `templates/canon_change_proposal.md` if a new fact or governance decision is admitted;
- `templates/canon_branch_diff.md` if more than one continuity survives;
- `checklists/mystery_preservation.md` if protected unknowns are touched.

### Mystery

Use:

- `templates/mystery_ledger_entry.md`;
- `templates/uncertainty_evidence_card.md` for public claims and sources;
- `checklists/mystery_preservation.md`.

### Collaboration dispute

Use:

- `templates/canon_change_proposal.md`;
- `templates/collaboration_decision_record.md`;
- `checklists/branching_collaboration_sweep.md`;
- `templates/canon_branch_diff.md` if compromise becomes branch.

## Field discipline

Do not turn the system into paperwork. Fill only the fields that prevent world damage, preserve a decision, or reveal a consequence worth keeping.
