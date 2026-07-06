# Guided Flow Spec Template

This template is required for new guided-flow specs and major guided-flow retrofits. It is downstream of `docs/principles/guided-workflow-usability.md`, `docs/principles/workflow-principles.md`, `docs/principles/canon-sovereignty.md`, `docs/principles/domain-fidelity.md`, `docs/principles/data-principles.md`, and the relevant `docs/worldbuilding-system/` package files.

Use the smallest section that preserves the contract. A narrow bug fix may cite this template and state which sections are unchanged; a new flow owes the full shape.

## Package Authority

- Package source files:
- Templates, checklists, or operating-card excerpts:
- Controlled vocabularies or package terms:
- Known package divergences:

## Flow Purpose and Non-Goals

- Purpose:
- Steward-owned judgments:
- App-owned clerking:
- Explicit non-goals:

## Step Map

| Step | Package source | Decision point | Dependency-bearing | Severity path | Prompt-out modes and pressure role |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

## Decision-Point Contract

For each meaningful step, specify:

- local decision in plain language;
- package source and why the step exists;
- required, optional, and severity-dependent fields;
- relevant doctrine, checklist, template rule, or operating-card excerpt;
- source records, dependencies, standing rulings, open debt, skips, and contradictions shown;
- prompt packet role, preview, context sources, omissions, and advisory/canon warning;
- blockers and substance validations;
- skip rule, skip record, and reason threshold;
- writes, links, queue entries, reports, or explicit non-mutations;
- next step plus exit/resume behavior;
- read-side trail in Current Canon, Audit Trail, record detail, or export.

## Prompt-Out Requirements

- Per-decision-point mode coverage: proposal offered/refused/skipped, pressure offered/blocked/skipped, and the pressure role where pressure applies:
- Essence exception: if the decision is the Creation kernel World premise section, state the server-owned proposal blocker and package source:
- Proposal-mode framing: candidate material requested, alternatives/assumptions labeling, forbidden separated-label assignments, output labels, advisory/canon warning:
- Pressure-mode framing: steward-authored material required, analyst role or flow-specific pressure derivation, risks/alternatives/questions request:
- Context packet sections shared with the decision-point payload:
- Source manifest:
- Omission warnings:
- Cold external LLM test for proposal and pressure:
- Pasted-response storage:
- Advisory disposition and explicit-use links:

## Browser Acceptance Scenarios

At least one representative scenario must show:

- current flow, step, and local decision;
- source doctrine at the decision point;
- required/optional/severity-dependent obligations;
- blocker or skip behavior when in scope;
- prompt packet preview when prompt-out is in scope;
- resulting record, link, queue item, report, audit item, or explicit non-mutation.

## Naive-Steward Cognitive Walkthrough

State the task a new steward is trying to complete, then answer:

1. Can the steward identify the current decision?
2. Can the steward see why the package asks for it?
3. Can the steward distinguish required, optional, skippable, and severity-dependent work?
4. Can the steward predict what the app will write or route?
5. Can the steward recover after exit/resume?

## Field Evidence and Untested Surfaces

- Field-trial evidence:
- Real app-use evidence:
- Untested package surfaces:
- Coverage ledger update:

## Testing Seams

- API/server seam:
- Store/persistence seam:
- Browser seam:
- Acceptance artifacts:

## Principles

Name touched principle documents and affirm non-contradiction. Guided-flow specs normally touch `charter.md`, `canon-sovereignty.md`, `domain-fidelity.md`, `workflow-principles.md`, `guided-workflow-usability.md`, and `data-principles.md`.
