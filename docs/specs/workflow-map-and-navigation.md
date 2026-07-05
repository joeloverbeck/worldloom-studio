# Workflow Map and Navigation Spec

This spec defines the cross-flow orientation grammar for guided workflows. It is downstream of `docs/principles/guided-workflow-usability.md`, `docs/principles/workflow-principles.md`, `docs/principles/data-principles.md`, and the flow specs.

The workflow map is not a gamified dashboard and not a project-management layer. It is a compact answer to: where am I in the method, why am I here, what blocks me, and what happens next?

## Setup/Open-World Entry

Before a world is open, the browser renders setup work only: server status, catalog status, create/open world-file controls, recently opened worlds, and setup/open errors. It does not render workflow panels, search, snapshot/export, generic record/link tools, Prompt-out, Canon Workbench work, or method step content as competing inactive surfaces.

The setup shell has no manual token input and does not require a copied terminal token. Health, catalog, create, and open are normal local app dependencies. If server or catalog readiness fails, the browser reports that state instead of showing blank catalog-backed controls as if the method has no vocabulary.

Create/open policy remains server-owned. The browser shows server-returned path, wrong-file, future-schema, migration/backup, integrity, filesystem, and open/create failures next to the setup controls while preserving the entered path for correction. A successful create/open names the world file, updates recent worlds, and reveals the workspace.

After a world is open, setup controls become secondary. A world with no `world_kernel` foregrounds Creation start/resume as the primary active guided path; unrelated flows show prerequisite or not-yet-ready states until the kernel prerequisite exists. A world that has just parked Creation seeds foregrounds the Creation-to-Admission handoff: parked proposed seeds, seed-decomposition report, source links, granularity rationale, optional decomposition Prompt-out, and Admission queue route. Unrelated advanced flows remain available as substrate or later work, but they are visually secondary to the immediate handoff where this state is in scope.

## Standard Affordances

Every guided flow browser surface exposes:

- current flow, step, and run state;
- completed, current, blocked, optional, and skippable steps;
- declared severity path and why that path changes obligations;
- active source record or debt item;
- open blockers and substance validations returned by the server;
- available prompt-out step and advisory status;
- skips, canon debt, surfaced proposals, and unresolved follow-up work created in this run;
- safe exit/resume affordance;
- next step and why it is next;
- read-side trail to reports, records, advisory artifacts, skip records, debt, and Audit Trail context once they exist.

## Cross-Flow Handoffs

- A new world with no `world_kernel` foregrounds Creation start/resume as the primary active guided path; unrelated flows show prerequisites or not-yet-ready states until the kernel prerequisite exists.
- Creation parks seeds at `proposed`; Admission owns first canon standing.
- After seed parking, the active handoff names the seed-decomposition report, derived-from links, current/next/resume state, prompt-out state or governed skip, and read-side trail before steering the steward to Admission.
- Sweeps and specialized passes propose facts; Admission admits.
- Propagation, contradiction, institutional/economic/suppression, and QA may mint canon debt; debt appears in the relevant queue without changing canon standing.
- Read-side workbench views link back to flow artifacts but do not mutate them.

## Server Policy Boundary

The browser renders server-returned step maps, blockers, severity paths, prompt-out availability, and close readiness. It may improve presentation and keyboard flow, but it does not duplicate canon mutation, admission, repair, skip, advisory, or close policy locally.

## Acceptance

A browser workflow slice that changes navigation must show:

- a start/resume path;
- a visible current decision point;
- at least one next-step or blocker state;
- an exit/resume path;
- the resulting read-side trail or explicit reason none exists yet.
- for setup/open-world changes, a walkthrough from no-world setup through create/open success and the empty-world Creation prerequisite state.
- for Creation-to-Admission handoff changes, a walkthrough from open early-world state through seed parking, prompt preview or governed skip, and Admission handoff, with unrelated advanced flows presented as not-current or prerequisite surfaces where the slice touches them.

## Principles

Touches `docs/worldbuilding-system/05_creation_protocol.md`, `docs/worldbuilding-system/06_canon_fact_admission_protocol.md`, `docs/worldbuilding-system/20_ai_assisted_workflow.md`, `docs/specs/creation-flow.md`, `docs/specs/prompt-out-context-assembly.md`, `docs/specs/browser-visible-guidance-acceptance.md`, `guided-workflow-usability.md` W-8, `workflow-principles.md` P-5/W-2/W-3/W-4/W-7, `data-principles.md` P-6/W-5/W-6, `charter.md` v1 scope and T-8, `domain-fidelity.md` P-1/T-2, ADR 0007, ADR 0009, PRD #150, PRD #158, and PRD #165. It affirms non-contradiction.
