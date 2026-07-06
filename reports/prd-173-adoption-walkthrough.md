# PRD 173 Adoption Walkthrough

**Date:** 2026-07-06
**Scope:** GitHub issues #193-#199 under parent PRD #173.
**World:** `/tmp/worldloom-prd173-1783336957210.sqlite`
**Seed record:** `1` — accepted `canon_fact` "Bridge ghosts sell toll testimony" with `admission_level=3` and `work_scale=major`.

This walkthrough proves the routed browser shell, not only server tests, exposes the shared `decision-point/v1` contract for the four adopted flows: Propagation, Stage 12, Stage 13, and QA. The browser opened the temp world through the Setup recent-worlds UI, navigated with the workflow destination sidebar, refreshed each seeded run, and captured one screenshot per flow.

## Browser Artifacts

| Flow | Browser artifact | Loaded run | Visible contract evidence |
|---|---|---:|---|
| Propagation | `output/playwright/prd173-propagation-contract.png` | 1 | `Propagation decision contract`; proposal and pressure modes available; high-pressure close blocker; write intent says surfaced facts route to Admission and Propagation never admits facts. |
| Stage 12 | `output/playwright/prd173-stage12-contract.png` | 2 | `Stage-12 decision contract`; proposal and pressure modes available; missing lens blockers including Action arena; write intent keeps new fact-shaped outcomes routed onward. |
| Stage 13 | `output/playwright/prd173-stage13-contract.png` | 3 | `Stage 13 decision contract`; proposal and pressure modes available; work-scale/disposition blockers; write intent routes fact-shaped repairs to Admission and keeps mystery boundaries governed. |
| QA | `output/playwright/prd173-qa-contract.png` | 4 | `QA decision contract`; proposal and pressure modes available; write intent names the QA scorecard/pass audit surface and states QA never changes canon standing directly. |

## Evidence Excerpts

Propagation returned `propagation · in_progress · propagation:first`, `Proposal mode: available`, `Pressure mode: available`, and `disposition high-pressure consequences`.

Stage 12 returned `institutional_economic_suppression · in_progress · stage12:entry`, both prompt modes available, and `complete missing Stage 12 lens evidence`.

Stage 13 returned `contradiction · in_progress · contradiction:entry`, both prompt modes available, and `clear Stage 13 close blockers`.

QA returned `qa · in_progress · qa:entry`, both prompt modes available, and `continue scoring, repair routing, or finalize`.

## Interpretation

The browser now shows the same contract concepts for each target flow: current decision, prompt modes, write intent, next/resume, close blockers, and prompt preview/source manifest. This is decision-guided evidence for the adopted flows, but not field validation of the full Prompt-out practice. `docs/methodology-coverage.md` therefore promotes the four flow interiors to `decision-guided` while keeping global Prompt-out below field-validated.

## Commands

- Focused server test: `pnpm --filter @worldloom/server exec vitest run test/decision-point-contract.test.ts`
- Focused web tests: `pnpm --filter @worldloom/web exec vitest run src/propagation-flow.test.tsx src/institutional-flow.test.tsx src/contradiction-flow.test.tsx src/qa-flow.test.tsx`
- Browser session: `pnpm dev`, then Playwright CLI via `bash /home/joeloverbeck/.codex/skills/playwright/scripts/playwright_cli.sh`
