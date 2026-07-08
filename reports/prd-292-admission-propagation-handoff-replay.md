# PRD 292 Admission-To-Propagation Handoff Replay

Date: 2026-07-08

Parent: #292
Children: #293, #294, #295, #296

## Replay World

- World file: `/tmp/worldloom-prd292/creation-admission-propagation-replay-1783512325811.sqlite`
- API evidence: `/tmp/worldloom-prd292/api-evidence-creation-admission-propagation.json`
- Browser artifacts:
  - `output/playwright/prd292-workflow-map.png`
  - `output/playwright/prd292-propagation-owed-run.png`
  - `output/playwright/prd292-canon-workbench-detail.png`
  - `output/playwright/prd292-canon-workbench-provenance.png`

The replay world was created fresh for this PRD. It uses the real Creation decomposition route to park a proposed seed, severe Admission full-gate completion to admit the seed, and the Propagation owed queue to start the source-linked run. There was no pre-existing Propagation run when the Admission-created debt was created.

## API Readback

The replay executed:

1. Create world.
2. Start Creation.
3. Save the world kernel and explicit consequence mode.
4. Decompose one Creation seed into proposed Admission material.
5. Declare severe full-gate Admission severity.
6. Read the server full-gate contract.
7. Complete Admission with a constrained `Fact statement`.
8. Read Canon Workbench current/detail.
9. Read Propagation queue.
10. Start Propagation from the queue row's route.
11. Read the active Propagation run and workflow map.

Key readback:

- Living fact `FAC-1` body: `Only the noon bridge oath transfers toll authority to ghost witnesses.`
- Accepted gate statement: `Only the noon bridge oath transfers toll authority to ghost witnesses.`
- Original proposal/source text: `The noon bridge oath transfers toll authority to ghost witnesses after a steward-facing vow.`
- Follow-up debt: `DEB-1`, linked by `derived_from: Admission-created propagation debt source fact: FAC-1`.
- Propagation queue route body: `{ "factRecordId": 3, "debtRecordId": 5 }`.
- Active Propagation run source fact and owed debt match the queue route.
- Workflow map next decision: `propagation`, reason `Propagation-scoped canon debt is open.`

The `gate_result` remains a report-regime audit record. Its body preserves accepted standing text, current living text, original proposal/source text, operations, consequence text, N/A reasons, quiet-domain declarations, all gate sections under stable headings, and follow-up debt.

## Browser Evidence

- Workflow map: `output/playwright/prd292-workflow-map.png` shows the fresh replay world, Creation done, Admission done, one owed Propagation item, and the map foregrounding `Work owed propagation`.
- Propagation route: `output/playwright/prd292-propagation-owed-run.png` shows `DEB-1 · Propagation owed for FAC-1`, source fact `FAC-1 · Field Build 05 bridge succession`, an active run `Flow 2`, severity `4 / severe`, source/debt read-side trail, blockers, consequence controls, domain-atlas controls, disposition controls, Prompt-out availability, and safe return.
- Canon Workbench: `output/playwright/prd292-canon-workbench-detail.png` shows the routed Workbench current row with current living text, gate provenance, open debt, and `derived_from`; `output/playwright/prd292-canon-workbench-provenance.png` shows detail provenance with current living text, proposal/source history, gate audit text, operation, tags, linked propagation debt, typed-link trail, related reports, and canon debt.
- Admission final-review labels are covered by browser-surface regression tests in `packages/web/src/admission-decision-surface.test.tsx`, including accepted standing text, intended current living text, original proposal/source text, and completion readback labels. The live replay used the API for Admission completion so that the same replay evidence file could capture the full server write/readback payload.

## Naive-Steward Walkthrough

- Current canon clarity: the Workbench current row names the operative living text directly, so the steward does not have to infer it from the original proposed body.
- Proposal/history distinction: Workbench detail distinguishes current living text, proposal/source history, and gate audit text.
- Owed Propagation route clarity: the workflow map and Propagation destination present the owed item as the next paved route, with source fact and debt identity together.
- Blocker/recovery visibility: the active Propagation run shows missing shock-cone/domain-atlas blockers; missing source-link recovery is covered by the browser-surface queue test.
- Read-side provenance: the Workbench detail names linked debt and the typed-link trail from Creation, Admission gate result, and Admission-created debt.
- Continuing without package docs: the browser route exposes the next decision, source/debt identity, blockers, write intent, prompt availability, and read-side trail. A steward can continue the shock cone without reopening the package docs beside the app.

## Issue Coverage

| Issue | Proof surface |
|---|---|
| #293 | Admission full gate defaults the living body to the accepted `Fact statement`; readback exposes accepted/current/original text; gate result keeps stable audit sections; browser-surface tests cover final-review/readback labels. |
| #294 | Canon Workbench API current/detail returns current living text, proposal/history, gate audit, operation, tags, linked debt, and typed links; routed browser Workbench renders current row and detail provenance. |
| #295 | Admission-created Propagation debt gets a typed `derived_from` source link; Propagation no longer parses debt prose for source fact recovery; queue rows with links are routeable and startable; missing-link rows are visibly blocked by tests. |
| #296 | Fresh replay records Creation seed parking, severe Admission completion, Canon Workbench readback, workflow-map owed Propagation, Propagation owed queue/start, API readback, browser artifacts, and this coverage update. |

## Scope Boundaries

This report does not promote Prompt-out stale-region cleanup, Admission prompt mode selection, Creation correction, direct LLM integration, global cold-LLM success, or full Propagation closeout. The replay proves the Admission-to-Propagation handoff and active owed-run entry, not completion of the whole Propagation sweep.
