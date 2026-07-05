# Workflow Map and Navigation Spec

This spec defines the cross-flow orientation grammar for guided workflows. It is downstream of `docs/principles/guided-workflow-usability.md`, `docs/principles/workflow-principles.md`, `docs/principles/data-principles.md`, and the flow specs.

The workflow map is not a gamified dashboard and not a project-management layer. It is a compact answer to: where am I in the method, why am I here, what blocks me, and what happens next?

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

## Principles

Touches `guided-workflow-usability.md` W-8, `workflow-principles.md` P-5/W-2/W-3/W-4/W-7, `data-principles.md` W-5/W-6, and `canon-sovereignty.md` W-1 where prompt-out appears. It affirms non-contradiction.
