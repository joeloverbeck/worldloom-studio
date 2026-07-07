# Field Build 03 — PRD-ready plan

**Date:** 2026-07-07  ·  **Verified against HEAD:** `cde63ee`  ·  **Status:** decided, ready to create PRDs/issues
**Upstream evidence:** `reports/field-build-03-twentyfall-frontier.md`
**Analysis + auditor corrections:** `reports/field-build-03-change-plan.md` (read it for full diagnosis, code seams, and citations — line numbers in that file are unreliable; this plan uses verified anchors)

This plan turns the corrected change plan into three decided PRDs. Every scope item below was verified against the live codebase. No methodology, principle, or ADR change is required — all work is app-encoding of existing doctrine.

---

## Ratified decisions

1. **Full-gate depth → Structured-lite.** The server emits an enumerated gate-section descriptor list + allowed-next-statuses + field-keyed validation errors; the browser renders one input per section with per-section n/a; completion serializes the sections into the `gate_result` body. **No schema migration, no new record type, no durable-draft store.** Rationale: replacement-grade substance without a migration; conforms to ADR 0006 (browser renders server-owned shape); durable resumable drafts deferred.
2. **P-02 depth → Decouple.** Thread the selected section heading through the prompt-generate request; the server builds the proposal for the explicitly-selected section and runs the essence check on that heading (closing the latent gap where the generate path never enforces essence). No save-as-side-effect. Rationale: deepens rather than defeats the deliberate PRD #233 "block-until-saved" guard; the target heading becomes part of packet identity.
3. **Slicing → 3 PRDs, blocker-first.** Each PRD updates its own spec + coverage-ledger row at closeout (repo convention). Order **A → B → C** (B lightly before C).

---

## Verified baseline (what exists vs. what is missing)

**Already present (reuse, do not rebuild):**
- Backend `completeAdmissionGate` (`admission-flow.ts:950`), route `POST /api/admission/gate/complete` (`admission-routes.ts:43`), and server completion tests (`app.test.ts:622-712`).
- Prompt-out step actions `generate`/`storeAdvisory`/`disposition`/`skip` (`prompt-out-step-actions.ts:65-191`).
- `canon_status` (11) and `admission_decision_operation` (12) vocabularies, already rendered as browser selectors (`main.tsx:1703`, `:1711`).
- Full-gate section **names** as flat strings (`FULL_GATE_STEPS` + foundational + catastrophic, `admission-flow.ts:209-235`), surfaced via `severity.obligations` / `work.severityDependent` / `gateComposition.steps`.
- `LoadedPromptOrigin` + `promptOriginsMatch` + stale/current status panel (`main.tsx:906, 1043, 1069-1096, 1841-1862`).
- Orphaned browser scaffolding to wire up: `completeAdmission` (`main.tsx:2909`), `admitMinorBatch` (`:2927`), gate-field state (`gateConsequence`/`admissionOperation`/`gateNotApplicable`/`gateQuietDomain`, `:1671-1674`) — defined but never rendered/wired.
- Coverage ledger already honest: the Admission row "does not promote close/admit/reject/defer completion controls" (`methodology-coverage.md:78`); Prompt-out is `browser-exposed`, not field-validated (`:63`).

**Missing (the work):**
- Structured gate-section contract (per-section `key`/`label`/`required`/`naCapable`).
- Per-section content in `completeAdmissionGate` input + `gate_result` serialization.
- Exposed legal status-transition graph (currently private, `world-file.ts:1203`).
- Field-keyed validation errors (currently flat `{error}`, `route-support.ts:16`).
- Copyable packet **body** bound to `LoadedPromptOrigin` (the P-01 gap).
- A per-request target section heading threaded through prompt generation (the P-02 decouple).
- The routed full-gate form and in-place advisory loop in the browser.

---

## PRD A — Executable Admission full gate (structured-lite) + in-place advisory loop
**Classification:** app conformance / code fix; browser evidence change. **BLOCKER.** **Findings:** F-01, P-03.

**Problem.** The routed browser projects the full-gate contract (obligations, blockers) but exposes no authoring fields, no status/operation controls tied to a gate, and no completion control; the completion handler and gate state exist but are orphaned. The advisory loop is not exposed at the active gate (P-03).

**Child issues:**

- **A1 — Server full-gate contract.** Add a `fullGate` block to the `full_gate` decision payload (`admission-flow.ts` `admissionDecisionPoint`): `sections: [{ key, label, required | optional, naCapable, vocab? }]` (stable keys derived from the flat `FULL_GATE_STEPS`/foundational/catastrophic lists, tagged with a bound vocabulary where one applies — e.g. `type → fact_type`, `constraint tags → constraint_tag`); `allowedNextStatuses: string[]` derived from `assertAllowedStatusTransition`'s adjacency for the record's current `canonStatus`. Keep the existing 3 blockers. Ensure `GET /api/admission/records/:id/gate` returns `decisionPoint.fullGate`.
- **A2 — Expand completion write.** Extend `completeAdmissionGate` input to accept `sections: [{ key, content, notApplicable?, naReason? }]` alongside the existing `operations[]`/`constraintTags[]`/`followUpDebt`/`advisoryRecordId`. Serialize the sections into the `gate_result` body as structured, labeled text. Validation (server-authoritative): reject empty operations; reject a **required** section that is empty and not explicitly n/a-with-reason; keep the existing consequence/blank-n-a/blank-quiet/illegal-transition throws; advisory-use link must belong to the same world/step and be explicitly named. Return **field-keyed** errors (`{ errors: [{ sectionKey, message }] }`) — extend `route-support.ts` error shaping for this route.
- **A3 — Routed browser full-gate form.** In `main.tsx`, render one input per `fullGate.sections` (with a per-section n/a control) from the server shape — never hard-code "severe means these sections." Status selector from `fullGate.allowedNextStatuses`; operation selector from the existing `admission_decision_operation` vocabulary. Wire the orphaned `completeAdmission` handler to steward-language controls ("Complete full gate and update canon standing", "Hold under review", "Reject through Admission"); expand its payload to send per-section content. Render field-keyed errors at/near their inputs and preserve entered text on invalid submit.
- **A4 — In-place advisory loop.** At the active gate: mode switch, packet preview/copy (copy identity-guarded — depends on PRD B, but usable with the existing `LoadedPromptOrigin`), paste-response textarea → `storeAdvisory`, disposition selector, and an explicit "use this advisory in the gate decision" selector that supplies `advisoryRecordId` to completion. Advisory use is never inferred from a pasted response. Write-preview shows whether an advisory-use link will be written.
- **A5 — Spec + ledger + field evidence.** Add the "Executable full-gate browser form" acceptance clause to `docs/specs/admission-flow.md` (additive — the current L46 is projection-only). After the browser field walkthrough passes, promote the Admission full-gate completion row in `docs/methodology-coverage.md` (rows for `06`/"Canon fact gate" currently exclude completion controls); do not promote global Admission or Prompt-out maturity beyond the exercised path.

**Acceptance.**
- *Server:* rejects missing operations/consequence/blank-n-a/blank-quiet/illegal-transition and a required-empty-non-n/a section; a valid severe completion writes a `gate_result` with per-section content, transitions canon status legally, records ordered operation events, writes constraint tags + follow-up debt when supplied, links the advisory artifact only when explicitly named, and completes/parks the flow; errors are field-keyed; `/gate` returns the `fullGate` shape.
- *Browser (`admission-decision-surface.test.tsx`):* **ADD** a routed render test on the full-gate fixture (`admissionDecision`, severe/`full_gate`) asserting the section inputs and a completion control ARE present and calling `gate/complete` on valid submit; **KEEP** the pre-severity (`:384`) and legacy (`:419`) `not.toContain("Complete Gate")` negatives; invalid submit renders field errors and preserves entries; read-side trail visible after completion. Advisory-loop test stores an advisory, disposes it, completes with an explicit link, and verifies the link + read-side trail; a pasted-only advisory creates no use link.
- *Field:* a fresh-world walkthrough reaches the severe gate, completes it through the routed browser with per-section substance (no generic CRUD, no docs), optionally links a stored advisory, and follows the read-side trail; screenshots cover pre-validation, validation failure, valid completion, and resulting record/gate result/audit trail.

**Out of scope:** typed per-section persistence (facets/columns), durable resumable drafts, LLM API/keys/background calls, any new record type.

## PRD B — Cross-flow Prompt-out packet identity & stale-state guard
**Classification:** app conformance / code fix; test/evidence change. **Finding:** P-01.

**Problem.** `LoadedPromptOrigin`/`promptOriginsMatch` and a stale/current **status** panel already exist, but the copyable packet **body** (`promptText`, a standalone global at `main.tsx:1635`, rendered at `:1019`/`:5016`) is not bound to that identity — so the status can read "stale" while the visible/extractable body and the copy affordance still serve the prior packet, and the mode selector and body can disagree.

**Scope.**
- *Browser (`main.tsx`):* make the visible/extractable packet body and the copy/export affordance derive from the current packet identity; clear or mark-stale **and disable copy/export** when identity mismatches (mode, selected section, record, step, severity, or world change). Wrap/replace the global `promptText` so it cannot render or copy as current without matching `LoadedPromptOrigin`. Keep the existing stale-origin labelling (`describePromptOrigin`) and the accessible status region.
- *Server (`prompt-out.ts` / `prompt-out-step-actions.ts`):* ensure generated packet metadata carries enough identity to compare (mode, step, record/section, severity, and a packet hash) — add the hash/section fields if missing.

**Acceptance.** Browser tests (`prompt-out-lifecycle.test.tsx` + creation/admission surfaces): selecting a mode then switching → the prior body is gone or visibly stale and cannot be copied as current; switching selected section/record/world clears or marks stale; copy is disabled on mismatch. Server test: generated packet metadata includes the comparison identity.

**Docs:** optional one-line tightening in `docs/specs/prompt-out-context-assembly.md` naming action URLs as part of the shared packet identity (the core rule already exists at `L93-95`) — keep minimal or skip; implement/test the existing rule.

## PRD C — Creation non-premise Proposal via section-decouple
**Classification:** app conformance / code fix + narrow spec clarification. **Finding:** P-02.

**Problem.** The server already allows Proposal for non-premise kernel sections, but derives *which* section solely from persisted `flow.current_step`; the deliberate PRD #233 client guard (`creationPromptOutBlockedByLocalSection`, `main.tsx:1760`) blocks loading until the locally-selected section is saved — so Proposal for a selected-but-unsaved non-premise section (e.g. Core promise) is unreachable, and the essence check is `current_step`-derived rather than target-derived.

**Scope.**
- *Server:* add `sectionHeading?` to `PromptGenerationInput` (`prompt-out.ts:48`); `creationSelectedKernelSection` (`:315`) prefers the passed heading over `current_step`. Thread the heading through `PromptOutStepActionContext` (`prompt-out-step-actions.ts:14`), `actionHref`/`promptOutActionContextFromQuery` (generate-query (de)serialization), and the `POST /api/prompt-out/steps` + generate DTOs (`http/prompt-out-routes.ts`). Move the essence check onto the target heading (`creation-flow.ts:211,448`) **and add the currently-missing hard refusal** for `mode === "proposal" && heading === "World premise"` in the generate path (`creationKernelPrompt`/`generatePrompt`) so the server stays authoritative. The decision-point `stepRequest.body` (`creation-flow.ts:437-463`) carries the heading.
- *Client (`main.tsx`):* pass `kernelHeading` into the creation generate call and the packet identity (`loadCreationPromptStep`, `currentLoadedPromptOrigin`); drop `creationPromptOutBlockedByLocalSection` for proposal (retain for the true unsaved-held-draft/pressure case as needed).

**Acceptance.** Server (`creation-flow.test.ts`, `prompt-out.test.ts`): generate a Proposal for target heading X while `current_step` is Y; the essence refusal is keyed on the target heading (World premise refused even when `current_step` differs; non-premise allowed even when unsaved). Browser (`creation-decision-surface.test.tsx`): Proposal is reachable for a selected-but-unsaved non-premise section; World premise Proposal still refused; mode switch clears stale packet; update the source-assertion string currently asserting "waits for the selected section to be saved".

**Docs:** add the clarifying sentence to `docs/specs/creation-flow.md` (proposal available for empty non-premise sections; the steward-authored-material precondition applies to pressure and the World premise essence exception) — additive; the misreadable sentence is at `creation-flow.md:L54`. Ledger note at closeout.

---

## Ordering, dependencies, and cross-cutting non-goals

**Order:** A (blocker) → B → C. B lands lightly before C because C threads the target heading into the packet identity that B hardens; A's advisory-loop copy-guard benefits from B but can ship on the existing `LoadedPromptOrigin`.

**Docs change summary:**

| Doc | Change | When | Kind |
|---|---|---|---|
| `docs/specs/admission-flow.md` | Executable full-gate browser form acceptance clause | PRD A | additive |
| `docs/specs/creation-flow.md` | Proposal-availability clarifying sentence (at L54) | PRD C | additive |
| `docs/specs/prompt-out-context-assembly.md` | Optional: "action URLs derive from packet identity" | PRD B | mostly redundant (skip/minimal) |
| `docs/methodology-coverage.md` | Promote Admission full-gate + Prompt-out rows | A/B/C, **post-evidence** | ledger |
| `docs/worldbuilding-system/*`, `docs/principles/*`, `docs/adr/*` | **No change** | — | — |

**Cross-cutting non-goals (all PRDs):** no LLM API, keys, vendor coupling, or background model calls; no auto-canonization of generated text; no parsing pasted advisory responses into canon fields; no browser-owned Admission severity/gate policy; no generic record editor as the completion path; no methodology/principle/ADR amendment; no new record type; no claim that the analyzed commit is latest `main`.

**Domain model:** unchanged — no new `CONTEXT.md` term and no ADR-worthy decision; every change encodes existing doctrine.

---

## Close criterion (unchanged from the change plan)

The blocker is closed only when a steward can, from the browser, select a proposed severe fact, declare severity, run the seed audit, fill the full canon fact gate with per-section written substance, optionally use and explicitly link a stored advisory artifact, choose canon standing and ordered operations, submit the gate, and follow the read-side trail to verify the record, gate result, audit trail, debt, advisory links, and export — without opening methodology docs or using generic record CRUD. Until then, Admission full-gate maturity stays below browser-field-validated.
