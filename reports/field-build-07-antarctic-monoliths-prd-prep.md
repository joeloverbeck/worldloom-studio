# Field Build 07 Antarctic Monoliths PRD Prep

**Source artifact reassessed:** `reports/field-build-07-antarctic-monoliths.md` (pending local repo publication at prep time; the source report was untracked when this prep was written).
**Selected section:** Findings `P-01`, `P-04`, `P-05`, `F-03`, and `Q-01`, plus "For the app (PRD seeds)".
**Primary field evidence summarized:** Field Build 07 report summary, prior Field Build 06 baseline, current source inspection, focused server prompt-out and Creation tests, and live GitHub issue readback for relevant closed PRDs.
**Live checkout checked:** `main` at `defd3f8` on 2026-07-09. Existing worktree dirt before this prep: modified repo-local skill files, untracked `.claude/skills/grilling/references/`, untracked Field Build 06 reports, and untracked `reports/field-build-07-antarctic-monoliths.md`.
**Tracker freshness:** `gh issue list --state open --limit 80 --json number,title,labels,url` returned `[]` during this prep. Relevant closed tracker readback included PRDs/issues `#112`, `#113`, `#165`, `#202`, `#204`, `#222`, `#250`, `#268`, `#269`, `#297`, and `#299`.
**Deliverable status:** PRD-ready determination only. No tracker, product-code, spec, methodology, principle, or ADR mutation has been performed by this prep.

## Reassessment Verdict

Field Build 07 validates the main Creation phases 1-2 write path but reopens one Creation product gap and one prompt-packet mode-parity gap:

- Setup/open, World-premise essence refusal, kernel save/readback, seed-decomposition report creation, proposed seed parking, and Admission handoff are app-carried.
- The exact packet export and packet-ownership complaints in `P-04` are mostly covered by closed PRD #297 and its children, especially #299 for Creation seed-decomposition identity. Current code exposes current-packet copy/download controls, export manifests, and current/stale/unbound/incomplete/inconsistent states.
- The stale-packet visual hierarchy complaint in `P-01` remains plausible as a verification/re-open candidate against PRD #297 rather than a fresh first PRD, because current code still renders stale packet bodies as visible stale-body panels even though current-packet actions are disabled.
- The fresh product blocker is `F-03`: after a seed is parked, Creation has no governed correction loop when prompt-out critique reveals the seed is still bundled. The app points onward to Admission, but does not offer split, retract/rewrite, replace, or explicit Admission narrowing-note actions.
- The fresh prompt-packet gap is `P-05`: Creation seed-decomposition Proposal packets do not consistently use the same parked-seed/report/kernel context assembly as pressure packets. Source inspection found the specialized Creation decomposition packet builder is only selected for pressure mode; proposal mode can fall back to generic selected-record context.
- `Q-01` remains a coverage item, not product scope. The next field build should resume after the correction path exists and exercise corrected seed-decomposition pressure plus Admission/Propagation prompt modes.

Recommended first PRD: **Creation Post-Park Seed Correction And Decomposition Prompt Mode Parity**.

Supporting skill result: Domain model unchanged. This prep uses existing app and package vocabulary: Creation flow, seed decomposition, Prompt-out step, Prompt packet, Proposal mode, Pressure mode, Admission flow, proposed canon fact, truth layer, canon status, advisory artifact, standing ruling, and Admission queue. No new app-layer term is owed to `CONTEXT.md`, and no ADR-worthy decision is resolved here; current ADRs already assign the relevant module boundaries.

External research: skipped. Repo authorities, live tracker state, current source inspection, and field-build evidence were sufficient.

## Evidence Checked

Field Build 07 findings read and classified:

| Finding | Status | PRD impact |
|---|---|---|
| `V-01` setup/open world | validation | No PRD. Preserve setup/open path. |
| `V-02` World-premise essence refusal and pressure | validation | No PRD. Preserve essence exception and pressure availability. |
| `V-03` full kernel save/readback | validation | No PRD. |
| `V-04` seed decomposition writes `SEE-1` and `FAC-1` | validation with correction caveat | Preserve write/readback; add post-park correction loop. |
| `P-01` stale packet bodies visually dominate after section changes | prompt-out friction | Verification/re-open candidate against PRD #297; not first PRD unless fresh replay disproves #297 closeout. |
| `P-04` exact packet export fragile | mostly already covered by PRD #297 | Treat as already covered unless fresh active-route replay disproves current copy/download/export controls. |
| `P-05` seed-decomposition Proposal packet omits parked seed body and full kernel context | product prompt-packet gap | Include in first PRD as Proposal/Pressure context parity. |
| `F-03` post-park critique has no split/retract/recompose path | blocking | Include in first PRD as the primary product behavior. |
| `Q-01` bounded prompt coverage | coverage question | Next field-build coverage, not product PRD yet. |

Current code and tests checked:

- Creation handoff code summarizes the seed-decomposition report, parked seed bodies, truth layers, current `proposed` status, source links, granularity rationale, Admission intent, supporting kernel, Admission queue route, and point-of-use doctrine.
- Creation flow code renders post-decomposition handoff and previews decomposition context, but completing decomposition marks the flow complete and routes onward to Admission. It does not expose post-park split/retract/rewrite/replace/narrowing-note actions.
- Prompt-out code has a specialized Creation seed-decomposition packet builder for pressure mode. Generic prompt generation still handles Creation decomposition proposal mode, which is the likely source of Field Build 07 `P-05`.
- Web Prompt-out code exposes `Copy Current Packet` and `Download Current Packet` controls gated by current packet identity; stale/unbound/incomplete/inconsistent packets cannot be used as current.
- Focused verification run during prep: `pnpm --filter @worldloom/server exec vitest run test/creation-flow.test.ts test/prompt-out.test.ts` passed with 2 files and 13 tests.

Tracker overlap checked:

- Open GitHub issues: none during prep.
- Closed PRD #165 already specified replacement-grade Creation-to-Admission handoff and decomposition prompt packets.
- Closed PRD #222 repaired kernel-to-decomposition controls, inline recovery, selected-section prompt binding, and coverage honesty.
- Closed PRD #204 hardened prompt packet rendering and cold-packet criteria.
- Closed PRD #250 and PRD #268 addressed packet identity and stale-state guards.
- Closed PRD #297 and child #299 addressed active packet ownership, exact export, and Creation seed-decomposition packet identity binding at commit `defd3f8`.
- No closed PRD found that implements the post-park correction actions Field Build 07 `F-03` requires.

## Authority Findings

No methodology-package amendment is warranted. `docs/worldbuilding-system/05_creation_protocol.md` already states the seed granularity rule: split until each seed can be independently rejected without destroying siblings, bounded by thin-start discipline. `docs/worldbuilding-system/20_ai_assisted_workflow.md` already distinguishes Proposal and Pressure mode, preserves stewardship of final wording, and keeps AI advisory. The Field Build 07 report also states there was no methodology-source finding.

No principles amendment is warranted. Current principles already require the needed behavior:

- `canon-sovereignty.md` P-2 and W-1 keep Prompt-out optional, advisory, self-contained, and mode-explicit.
- `workflow-principles.md` P-5, W-1, W-3, W-4, and W-7 support guided, resumable flows, prompt modes at decision points, Admission as the canon gate, governed skips, and substance over clicks.
- `guided-workflow-usability.md` W-8 and W-9 require the active browser surface to tell the steward what decision is owed, what the app will write or leave untouched, what prompt context is available, and what happens next without opening package docs.
- `data-principles.md` W-5, W-6, T-3, and T-5 support one durable world-file record, append-only reports, stable app-minted identifiers, typed links, and provenance captured at authorship time.
- `domain-fidelity.md` P-1 and T-2 require the app to preserve package vocabulary and separated labels.

No ADR amendment is warranted. ADR 0006 keeps Admission as the canon-standing boundary; ADR 0007 keeps Prompt-out as a cross-flow step lifecycle; ADR 0008 supports flow-owned persistence stores; ADR 0009 requires browser guided-flow surfaces over server-owned policy. The recommended PRD fits inside those boundaries.

Spec changes should be part of the future PRD:

- `docs/specs/creation-flow.md` should add a post-park correction contract for parked seed critique before Admission work begins.
- `docs/specs/creation-flow.md` should define what happens when Admission work has already begun, likely requiring superseding/re-proposal rather than silent mutation.
- `docs/specs/prompt-out-context-assembly.md` should require Creation seed-decomposition Proposal and Pressure packets to share the same decomposition context assembly: report body/sections, parked seed title/body/truth layer/proposed status, granularity rationale, Admission intent, supporting kernel excerpts, derived-from links, standing rulings, source manifest, explicit omissions, and advisory/canon warning.
- `docs/specs/browser-visible-guidance-acceptance.md` remains the checklist source for active-route proof and field-build blocker closeout evidence.
- `docs/methodology-coverage.md` should be updated or explicitly confirmed no-change after implementation, with active-route replay evidence if maturity claims change.

## Recommended First PRD

### PRD - Creation Post-Park Seed Correction And Decomposition Prompt Mode Parity

**Purpose:** Let Creation recover when prompt-out critique finds that a parked seed is still bundled, while making both Creation decomposition prompt modes carry the exact same decision-bearing context.

**Sources:** Field Build 07 `F-03` and `P-05`; carried Field Build 05/06 `F-03`; closed PRDs #165, #204, #222, #297, and #299; `docs/worldbuilding-system/05_creation_protocol.md`; `docs/worldbuilding-system/20_ai_assisted_workflow.md`; `docs/specs/creation-flow.md`; `docs/specs/prompt-out-context-assembly.md`; `docs/specs/browser-visible-guidance-acceptance.md`; ADR 0006, ADR 0007, ADR 0008, and ADR 0009.

**Problem:** Creation can park a proposed seed and generate prompt-out critique after the handoff, but if the critique shows bad granularity, the active flow gives the steward no governed correction path. The steward must either push a known-bundled seed into Admission or improvise through generic record surfaces. At the same time, Proposal mode for Creation seed decomposition can omit the parked seed body and supporting kernel context that Pressure mode needs, so the cold LLM cannot audit the exact seed it is supposed to help repair.

**Recommended product rule:** Parked Creation seeds remain proposed and correctable until Admission work begins. When prompt-out critique reveals bad granularity, the Creation handoff offers governed correction actions: split into sibling proposed facts, retract/rewrite the parked seed, replace it with a corrected proposed seed, or carry an explicit Admission narrowing note. Every correction preserves provenance and readback. If Admission work has already begun, Creation does not silently mutate in-flight Admission material; it routes the correction as superseding/re-proposal or an Admission-facing narrowing note.

**Scope:**

- Add a post-park correction panel to the Creation handoff surface when parked seeds exist.
- Add actions for split, retract/rewrite, replace, and carry Admission narrowing note.
- Preserve provenance through typed links from original kernel, original seed-decomposition report, original parked seed, correction report or correction event, sibling/replacement proposed facts, and Admission queue entries.
- Keep corrected facts at `proposed`; Creation must not admit canon or assign Admission outcomes.
- Make correction readback visible in Creation handoff, Canon Workbench/read-side trail, and Admission intake.
- Add server-owned policy for when correction is allowed before Admission work begins and when later correction must become superseding/re-proposal or an Admission narrowing note.
- Make Creation decomposition Proposal and Pressure packets use the same decomposition context assembly after seed parking, with mode-specific task framing only.
- Ensure Proposal packets after seed parking include parked seed title/body, truth layer, current `proposed` status, granularity rationale or confirmation, Admission intent, supporting kernel excerpts, derived-from links, standing rulings, source manifest, explicit omissions, advisory/canon warning, and output labels.
- Preserve current exact packet export/currentness behavior from PRD #297 and child #299 as regression constraints.

**Acceptance:**

- Starting from a completed Creation handoff with one parked proposed seed, the browser surfaces a correction panel at the point of use.
- A prompt-out critique that flags bundling can be recorded or referenced as advisory context without automatically mutating canon.
- Split action creates sibling proposed facts, each with steward-authored title/body/truth layer, source links to the original kernel/report/seed/correction context, and Admission queue entries.
- Retract/rewrite action preserves the original parked seed wording in audit/history, writes steward-authored replacement wording or status, and keeps all resulting material proposed.
- Replace action creates a corrected proposed seed and marks the original proposed seed as superseded, retracted, or otherwise no-longer-current according to package vocabulary and existing status-machine legality.
- Admission narrowing note action carries explicit guidance into Admission without changing current canon status or pretending narrowing has already happened.
- If Admission work has already begun for the seed, Creation blocks direct mutation and offers a route that preserves Admission-owned governance.
- Creation handoff readback shows original seed, correction action, corrected/sibling seeds, links, Admission queue route, next/resume state, and what remains untouched.
- Creation seed-decomposition Proposal and Pressure packets both include the parked seed body and supporting decomposition context. They differ in task framing, not in decision-bearing context.
- A cold external LLM receiving the Proposal packet can critique or propose split candidates without the steward manually adding the parked seed body or kernel context.
- A cold external LLM receiving the Pressure packet can challenge the exact seed granularity without opening repository files.
- Browser-visible closeout maps the original Field Build 07 `F-03` and `P-05` findings to active-route replay evidence.
- Parent closeout runs the canonical root gates: `pnpm test`, `pnpm typecheck`, and `pnpm build`. Focused package tests are acceptable during child slices before parent closeout.

**Likely issue slices:**

- Spec update for post-park correction and decomposition prompt mode parity.
- Server correction policy and correction write/readback model for parked proposed seeds.
- Browser post-park correction panel with split, retract/rewrite, replace, and Admission narrowing-note actions.
- Admission intake and read-side trail display for corrected/sibling/replacement proposed seeds.
- Prompt-out context assembly update so Creation decomposition Proposal and Pressure share the same context assembly.
- Active-route browser replay and cold-packet evidence for Field Build 07 `F-03` and `P-05`.

**Out of scope:**

- Built-in LLM API calls, automatic critique parsing, automatic split decisions, automatic canon adoption, or automatic Admission decisions.
- Rebuilding setup/open, kernel authoring, consequence-mode controls, truth-layer controls, or the seed parking write path that Field Build 07 validated.
- Reopening PRD #297 exact export and active packet ownership unless fresh replay disproves current behavior.
- Global stale-packet visual hierarchy cleanup outside the Creation correction path.
- Running full Admission gate, Propagation, MVW, QA, or downstream flows beyond readback/queue regression proof.
- Methodology, principle, or ADR amendments.

## Follow-On Candidates

### Candidate 2 - Prompt-Out Prior-Origin Visual Collapse Verification

**Purpose:** Decide whether Field Build 07 `P-01` is already closed by PRD #297 or needs a small re-open PRD.

**Sources:** Field Build 07 `P-01`; closed PRD #297 and children #298-#301; current web source showing stale packet bodies still render as visible stale-body panels.

**Problem:** Current packet actions are guarded, but stale packet bodies may remain too visually prominent after decision changes.

**Recommended rule or open design point:** Re-run the active route after `defd3f8`. If stale prior-origin bodies still occupy the primary route region after navigation or section change, re-open a narrow UI hierarchy PRD that collapses stale bodies behind disclosure by prior origin while preserving stale-state accessibility and no-copy controls.

**Scope:** Verification first. Product work only if replay contradicts #297's stale-collapse acceptance.

**Acceptance:** Replay shows either the stale visual dominance is gone, or a fresh issue/PRD records the exact active route and acceptance for collapse/disclosure.

### Candidate 3 - Propagation Prompt Coverage Field Replay

**Purpose:** Resolve Field Build 07 `Q-01` by continuing field coverage beyond Creation.

**Sources:** Field Build 07 `Q-01`; Field Build 06 Propagation frontier; closed PRD #270 and #292.

**Problem:** Prompt coverage remains representative rather than exhaustive for reached decision points.

**Recommended rule or open design point:** Resume the field build after the Creation correction path exists, then exercise corrected seed-decomposition pressure and Admission/Propagation Proposal and Pressure modes at the first reached decision points.

**Scope:** Field-build coverage only unless the replay finds a product defect.

**Acceptance:** The next field-build report states which prompt modes were exercised, which were skipped with explicit frontier/tooling reasons, and whether cold packets were self-contained.

## Coverage Follow-Up

Before opening broader product scope from `Q-01`, run a field replay after the recommended first PRD lands:

- Recreate or resume a world at Creation post-park critique.
- Exercise split/retract/rewrite/replace/narrowing-note paths where relevant.
- Load and export both seed-decomposition Proposal and Pressure packets.
- Run at least one cold external LLM check against each packet if a cold executor is available; otherwise record that cold execution was unavailable and verify packet completeness through source/body inspection.
- Continue to Admission or Propagation only far enough to prove corrected proposed facts arrive with provenance and route identity.

This remains coverage work unless it finds a new defect.

## Rejected Or No-Op Alternatives

- **Publish a broad multi-PRD program now.** Rejected. The user asked to get ready for a later `/to-prd`; the ratified scope is one first PRD plus deferred candidates.
- **Treat exact packet export as fresh first-PRD scope.** Rejected for now. Closed PRD #297/#299 and current code already provide current-packet copy/download and identity guards. Reopen only after fresh replay disproves them.
- **Fold stale-body visual collapse into the first PRD.** Rejected as first scope. It is plausible follow-up work, but the blocking product gap is post-park correction plus decomposition mode parity.
- **Amend the methodology package.** Rejected. `05` already supplies the granularity rule and `20` already supplies prompt-mode doctrine.
- **Amend foundational principles.** Rejected. Existing W-1/W-8/W-9/P-2/P-5/W-3/W-6/T-5 rules already require the behavior.
- **Write a new ADR.** Rejected. The relevant boundaries are already recorded by ADR 0006 through ADR 0009.
- **Use generic record editing as the correction path.** Rejected. Field-build evidence is about active guided flow. Generic substrate editing can support repair/admin work, but it does not satisfy W-8 for the field-tested Creation path.
- **Let Admission handle all post-park correction.** Rejected as a complete answer. Admission owns first canon standing, but Creation owns the seed-decomposition handoff and must provide a governed way to avoid knowingly pushing a bundled seed onward.
- **Automatically parse LLM critique into split facts.** Rejected. Pasted responses remain advisory artifacts; the steward authors and chooses correction material.
- **Patch code or specs immediately from this prep.** Rejected. The requested stopping point is PRD-ready preparation.

## PRD Publication Inputs

Use these fields when the later `/to-prd` pass creates the PRD:

- **Suggested title:** `PRD: Creation Post-Park Seed Correction - Governed Split, Rewrite, Narrowing Note, And Prompt Mode Parity`
- **Publication package:** one intended PRD now, with stale visual-collapse verification and Propagation prompt coverage recorded as deferred follow-ons. Do not publish a multi-PRD program unless explicitly requested.
- **Recommended testing seam:** reuse existing server HTTP/API behavior over real temp-file world databases plus existing web React/browser-surface guided-flow tests and one targeted browser replay. No new architecture seam is needed.
- **Seam checkpoint still owed to `/to-prd`:** confirm the user accepts the existing Creation flow API plus browser guided-flow surface as the test seam, with prompt-out generation tests at the server prompt assembly boundary.
- **Likely label after `/to-prd`:** `ready-for-agent` if product scope and seams are ratified and the PRD body includes the browser-visible guidance checklist mapping; otherwise `needs-triage`.
- **Principles to cite:** `docs/principles/README.md`, `docs/principles/canon-sovereignty.md` P-2/W-1/T-5, `docs/principles/workflow-principles.md` P-5/W-1/W-3/W-4/W-7, `docs/principles/guided-workflow-usability.md` W-8/W-9/W-10, `docs/principles/data-principles.md` P-6/W-5/W-6/T-3/T-5, and `docs/principles/domain-fidelity.md` P-1/T-2.
- **Relevant ADRs:** ADR 0006, ADR 0007, ADR 0008, and ADR 0009.
- **Relevant specs:** `docs/specs/creation-flow.md`, `docs/specs/prompt-out-context-assembly.md`, `docs/specs/browser-visible-guidance-acceptance.md`, `docs/specs/workflow-map-and-navigation.md`, and `docs/specs/admission-flow.md` for handoff/intake boundary readback.
- **Relevant tracker IDs:** closed PRDs/issues #112, #113, #165, #202, #204, #222, #250, #268, #269, #297, and #299. Avoid treating them as open blockers; use them as prior-art context and regression constraints.
- **Browser-visible guidance checklist mapping:** owed before `ready-for-agent` because the PRD touches guided flow browser behavior, prompt-out, advisory/canon separation, write/readback, Admission queue routing, and read-side trail. The PRD should explicitly map package source, decision-point contract, required/optional/skippable fields, doctrine at point of use, prompt preview/source manifest/cold-packet relevance, advisory/canon separation, blocker/substance validation, write/readback/provenance, current/next/resume state, and naive-steward walkthrough.
- **Canonical gates:** `pnpm test`, `pnpm typecheck`, and `pnpm build` at parent closeout. Focused package tests are acceptable during implementation slices.
- **Focused gates to expect:** server Creation flow and Prompt-out generation tests; web Creation decision-surface and Prompt-out lifecycle tests; targeted browser replay for post-park correction.
- **Browser evidence:** required for field-build blocker closeout; no committed global e2e hard gate exists yet.
- **Cold LLM evidence:** desirable for Proposal/Pressure packet usefulness. If unavailable during implementation, the closeout should say so and prove packet completeness through exact exported body/source-manifest inspection.
- **Durability warning:** `reports/field-build-07-antarctic-monoliths.md` was untracked when this prep was written. A published PRD should either wait until that source report is durable or summarize the findings without stable-citation wording. Do not publish machine-local `/tmp` evidence paths as durable citations.
- **Template-conformance warning:** the future PRD user stories must use the repo's exact `As a/an <actor>, I want..., so that...` shape.

## Freshness And Boundaries

This prep refreshed live worktree status, branch, HEAD, open issue state, relevant closed tracker bodies, current Creation/Prompt-out source surfaces, domain glossary routing, principles, ADRs, specs, methodology files needed for Creation and Prompt-out interpretation, and prior Field Build 06 prep/report shape.

This prep did not start the app, run browser automation, create tracker issues, publish a PRD, patch product code, patch specs, update methodology docs, update principles, update ADRs, or alter domain glossary files. It did run a focused server verification command: `pnpm --filter @worldloom/server exec vitest run test/creation-flow.test.ts test/prompt-out.test.ts`, which passed.

Pre-existing worktree dirt before this prep was written:

- Modified repo-local skill files under `.claude/skills/`.
- Untracked `.claude/skills/grilling/references/`.
- Untracked `reports/field-build-06-divine-routing.md`.
- Untracked `reports/field-build-06-divine-routing-prd-prep.md`.
- Untracked `reports/field-build-07-antarctic-monoliths.md`.

This prep intentionally adds only `reports/field-build-07-antarctic-monoliths-prd-prep.md`.
