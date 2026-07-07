# PRD #267 Admission Full-Gate Trust Walkthrough

Date: 2026-07-08

Scope: issues #273-#278 for Admission full-gate draft identity, unique labels, server section-key validation/readback, exact final review, draft Prompt-out packets, and active replay closeout.

## Automated Evidence

- Red tests first failed on the intended gaps:
  - duplicate full-gate section keys were accepted;
  - Admission full-gate Prompt-out packets omitted current draft material;
  - the browser rendered duplicate/ambiguous labels and had no final-review gate;
  - Admission Prompt-out loading did not include draft identity.
- Focused green suites:
  - `pnpm --filter @worldloom/server exec vitest run test/app.test.ts test/prompt-out.test.ts`
  - `pnpm --filter @worldloom/web exec vitest run src/admission-decision-surface.test.tsx src/prompt-out-lifecycle.test.tsx`
- Package typechecks:
  - `pnpm --filter @worldloom/server typecheck`
  - `pnpm --filter @worldloom/web typecheck`

## Browser Replay

Dev server:

- API: `http://127.0.0.1:4173`
- Web: `http://127.0.0.1:5174`

Seed worlds:

- World A: `/tmp/worldloom-prd267-a2.sqlite`
- World B: `/tmp/worldloom-prd267-b2.sqlite`

Replay path:

1. Opened world A.
2. Entered Admission through Workflow map -> Go to decision.
3. Selected the queued severe Admission record.
4. Confirmed active full-gate controls expose unique parent-specific labels:
   `Fact statement substance`, `Mark Dependencies not applicable`, `Dependencies not-applicable reason`, `Institutions or quiet-domain declaration quiet-domain declaration`, `Primary admission operation order`, `Allowed canon status target`, and `Follow-up debt for full gate`.
5. Reviewed and submitted an incomplete draft. The server returned full-gate validation errors and the surface retained the failed-submit recovery copy.
6. Filled current full-gate draft fields with `A_MARKER` values.
7. Loaded Admission Prompt-out. The packet included current unsaved draft context, omissions, and the non-canon draft boundary.
8. Reviewed exact payload and completed Admission.
9. Confirmed completion readback comparison rendered current canon, operation events, debt, advisory slot, and history/audit evidence.
10. Switched to world B in the same browser runtime, entered Admission, selected the B record, and verified no `A_MARKER` text appeared under the active B surface.

Replay result:

```json
{
  "labelProof": true,
  "failedPreserved": true,
  "promptProof": true,
  "reviewProof": true,
  "readbackProof": true,
  "noActiveLeak": true,
  "bRecordVisible": true,
  "fullGateVisible": true
}
```

Browser replay found one issue during the first pass: successful completion returned readback from the server, but `applyAdmissionDecision` cleared the readback panel when the flow moved to `complete`. The implementation was corrected so `setAdmissionCompletionReadback` runs after the decision refresh, and the replay was rerun.

Artifact: `output/playwright/prd267-admission-full-gate-world-b.png`

## Cognitive Walkthrough

Naive-steward walkthrough result: pass for the PRD #267 routed Admission full-gate path.

- Full-gate decision identity was visible from the Workflow map entry, Admission queue selection, severity declaration, selected record, and full-gate form heading.
- Governing package context was visible through the Admission decision surface, full-gate blocker copy, section guidance, Prompt-out role line, advisory/canon warning, write preview, and read-side trail.
- Required, optional, not-applicable, quiet-domain, and severity-dependent obligations were visible at the point of use through section metadata, parent-specific labels, and validation copy.
- Prompt-out was framed as advisory pressure before copy-out, and the generated packet labeled unsaved gate draft material as non-canon context with omissions.
- Final write intent was reviewable before completion through exact final review, then comparable after completion through current canon, gate result, operation events, tags, debt, advisory slot, and audit/history readback.
- Failed-action recovery was visible because invalid submit kept the active full-gate decision open, preserved the typed draft, and rendered section-keyed server errors near the affected controls.
- Read-side proof was reachable through the returned read-side trail and completion readback without opening source docs beside the app.

## Cold LLM Evidence

Blocked: no external cold LLM execution tool is available in this local session. The packet itself was inspected in the active browser replay and server tests prove the filled current draft, omissions, unsaved/non-canon labels, operation order, target status, tags, follow-up debt, and advisory selection enter the Admission full-gate pressure packet.

## Coverage Ledger

Updated `docs/methodology-coverage.md` narrowly for PRD #267:

- Admission full-gate state isolation, final review/readback parity, unique labels, server section-key enforcement, and filled-draft Admission Prompt-out context are no longer caveated for this routed path.
- Global Prompt-out active-route trust and sibling PRDs #268-#270 remain caveated.
