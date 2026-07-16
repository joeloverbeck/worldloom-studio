# Browser-Visible Guidance Acceptance

This document defines reusable acceptance evidence for browser guidance. It is not a PRD and not a test framework; it tells reviewers what proof to ask for when a guided-flow issue claims completion. The post-Propagation Conditional-pass evidence contract is downstream of `docs/worldbuilding-system/03_truth_layers_and_canon_governance.md`, `docs/worldbuilding-system/07_propagation_engine.md`, and `docs/worldbuilding-system/22_glossary.md`.

## Required Evidence Patterns

For a guided-flow browser slice, acceptance should include the smallest useful set of:

- screenshot, Playwright smoke, or component-render evidence showing the task card or equivalent decision-point surface;
- selected record, draft, debt item, or report example that starts the flow;
- severity path example when severity changes obligations;
- source doctrine visible at the decision point as app-owned rule text, checklist text, template expectation, or operating-card excerpt, with file paths kept as provenance/detail rather than the only guidance;
- required/optional/skippable fields visible in the same step context;
- blocker example showing substance validation, not checkbox completion;
- action-failure/server-blocker example for any browser slice that can submit a guided-flow action: the server-returned error appears at or near the action, the entered fields/selections are preserved, remediation text or route is visible, and the steward does not need console or network tooling to recover;
- skip example showing recorded skip behavior and reason threshold when offered;
- prompt packet preview with source manifest and advisory/canon warning when prompt-out is in scope;
- resulting record, report, link, queue entry, advisory artifact, debt item, or explicit non-mutation;
- read-side trail in Current Canon, Audit Trail, record detail, export, or a stated deferral.

When the slice touches provenance, reviewers should be able to distinguish primary instructions from provenance. Source paths, package filenames, issue numbers, and markdown anchors may appear in manifests or expandable detail, but the visible decision point still carries the current obligation, blocker, write intent, prompt role, and next step in wording a docs-naive steward can act on.

For setup/open-world browser slices, acceptance should include:

- first-load evidence with no token field, server status, catalog status, create/open controls, recent worlds, and no workflow panels competing before a world is open;
- an inline create/open failure with the entered path preserved and the server-returned recovery text visible near the setup controls;
- a successful create/open that names the open world, updates recent worlds, and reveals the workspace only after success;
- an empty-world state that foregrounds Creation as the primary next path while unrelated flows show prerequisites or unavailable states;
- confirmation that Prompt-out, Admission, Propagation, QA, Canon Workbench work, search, snapshot/export, and generic record/link tools are hidden or blocked before a world is open.

## Field-Build Regression Closure Pattern

When a PRD or issue claims to close a blocker found during a field build, acceptance evidence should map the original finding to proof of the exact active route that failed. A representative fixture, lower-level contract, generic substrate panel, legacy panel, or nearby controlled path can support the proof, but it does not by itself promote the active route to field-ready maturity.

The closeout evidence should name:

- the original field-build finding and the durable PRD or issue that summarizes it, without treating local session reports or temporary artifacts as stable citations;
- the exact active route and action sequence that failed for the steward;
- any representative fixture, controlled path, or component render used, plus what it proves and what it does not prove;
- browser-visible state transitions on the active route, including current/stale state, blockers, entered material preservation, selected record or debt identity, and route-owned copy/store/export affordances when relevant;
- API or readback proof when the fix writes or reads durable state, including the resulting record, report, queue entry, operation event, audit trail, or explicit non-mutation;
- Prompt-out packet proof when the blocker involves Prompt-out: packet mode, status, visible body, copyable body, source manifest, omission text, advisory/canon warning, and cold external LLM packet relevance where that proof is in scope;
- Creation coverage-gate proof when the blocker involves seed-family coverage: coverage inventory or create/confirm path, unresolved rows, covered/deferred/out-of-scope disposition controls, rationale fields, linked proposed seeds, Admission queue secondary visibility, server-owned current/next/resume state, and read-side trail;
- remaining caveats, follow-up PRDs, or intentionally unproven routes when the fix is partial.

Coverage-ledger promotion should wait for corresponding active-route replay evidence. If a slice proves only a primitive, server contract, representative fixture, or API readback, the ledger should preserve that value while keeping active-route caveats explicit.

This field-build closure pattern is additive reviewer guidance. It does not create a repo-wide browser automation gate, require a specific browser tool, introduce direct LLM integration, or amend the methodology package, principles, or ADRs.

## Post-Propagation Conditional-Pass Handoff Evidence Pattern

When a slice claims the source-linked post-Propagation handoff, active-route evidence must show:

- a fresh foundational close or typed historical reconciliation yielding exactly three ordered obligations for one source fact and final Propagation report;
- browser/API agreement on Conditional-pass and destination state, Admission and Propagation counts, the ordered ledger, dispositions, source/report provenance, blockers, routes, read-only state, and `nextDecision`;
- Temporal/Timeline primary from typed obligation identity, with app-owned full-pass doctrine and no title/body/link-note keyword inference;
- Constraint Composition and Institutional / Economic / Suppression as remaining obligations, plus Admission as a truthful directly navigable alternative rather than a hidden or blocked path;
- each row's pass identity, source fact, report, destination, blocker, evidence or rationale, and outstanding/covered/deferred state, including governed history after disposition;
- source-selected entry into an existing guided-flow destination and safe return that awaits a fresh workflow-map response before rendering current/next/resume state;
- a deferral preview naming doctrine, obligation, source/report identity, proposed write, affected state, required rationale, provenance, and non-mutation guarantees;
- one invalid deferral whose server blocker is rendered beside preserved input and one valid deferral whose rationale and provenance survive refresh;
- matching completed-pass evidence for coverage, with mismatched fact/report/pass and incomplete-pass controls rejected;
- all obligations governed followed by fresh-map Admission elevation while the governed ledger remains inspectable;
- a negative control proving unrelated canon-debt prose containing `temporal` or `timeline` has no effect, plus a keyword-free typed obligation that remains effective;
- before/after fingerprints proving map/read-side reads, rendering, navigation, refresh, and safe return do not mutate source text/standing, append-only report content, debt history, Admission contents, obligation identity, sibling obligations, or unrelated world data; and
- separate browser console errors and warnings with zero unexplained entries, plus a docs-naive walkthrough that can identify what is owed, why, what deferral writes, where Admission remains available, and how to return safely.

Prompt-out packets and advisory material are N/A for this handoff. Package paths are provenance; the visible decision and doctrine remain sufficient without opening them.

### Redeemable deferral extension

When the post-Propagation Conditional-pass handoff supports redemption, active-route evidence must additionally show:

- app-owned doctrine at the handoff explaining outstanding work, governed deferral, rationale-bearing reinstatement, direct evidence-based coverage, covered terminality, and the append-only history boundary;
- current `outstanding`, `deferred`, and `covered` projections rendered as current state, visually and semantically distinct from emitted, reconciled, deferred, reinstated, and covered history; `reinstated` is never rendered as a fourth current disposition;
- only server-returned destination and transition actions, required, optional, skippable, and severity-dependent field classifications, blockers, remediation, request bodies, write previews, untouched-state guarantees, counts, order, routeability, and orientation, with no new optional or severity-dependent authoring field;
- separate deferral and reinstatement decision states, each with the server-declared required written reason, selected obligation and source/report/pass identity, proposed write, affected state, non-mutation boundary, and no silent decline or silent undo;
- one intentionally empty, stale, mismatched, rejected, or forced-failure reinstatement whose exact blocker and substance remediation remain adjacent to the action while the entered reason, row context, current authoritative state, keyboard focus, and screen-reader context are preserved for correction or safe return;
- a successful reinstatement that waits for a fresh workflow-map payload before rendering outstanding state, restored server-returned source-selected routing, refreshed outstanding/governed counts, stable order, primary next decision, current/next/resume orientation, safe return, Admission visibility, and complete deferral plus reinstatement history;
- following the restored pass and returning safely without substantive completion, proving navigation and map reads leave the obligation outstanding and create no coverage;
- completed matching work after reinstatement producing outstanding-to-covered history, completed-report evidence, complete prior history, fresh orientation, terminal covered state, and no stale transition action;
- an independent separate obligation covered directly from deferred state, retaining its deferral event and rationale, recording deferred-to-covered history and the completed report, and fabricating no reinstatement;
- exact browser/API blockers and remediation for incomplete work, wrong source fact, wrong pass key, wrong Propagation report, wrong report type, ambiguous matching, stale state, incompatible retry, and already-covered attempts, with no browser-selected target and no partial mutation;
- at least two complete defer/reinstate cycles with distinct ordered reasons and actor/timestamp/flow-step provenance, unchanged-target retries with no new event, and the same reason after an intervening transition producing a genuine new event;
- read-side links for source fact, final Propagation report, obligation, and covering report, with current rationale or evidence separated from complete immutable event history;
- covered obligations exposing and accepting neither deferral nor reinstatement;
- before/after fingerprints proving source fact text and standing, append-only reports, Admission contents and ordering, canon debt, sibling obligations, records, links, and unrelated flows remain unchanged except for the selected projection, approved events, covering evidence, and explicit specialized-pass outcomes; and
- a docs-naive cognitive walkthrough for both redemption paths, including route, action, outcome, required/optional/skippable/severity-dependent classifications, accessibility and focus behavior, screenshots or equivalent durable observations, safe return, and separate browser console errors and warnings with zero unexplained entries.

Focused React evidence supports this pattern by covering outstanding deferral, deferred reinstatement, invalid-action preservation and focus, successful fresh-payload routing, repeated history, direct deferred coverage, terminal covered state, Admission alternative, read-side links, and current/next/resume rendering. Source-policy checks may prove that the browser consumes returned transition, identity, doctrine, blocker, evidence, history, count, ordering, route, and orientation shapes, but they never replace the rendered production route.

## Propagation Pre-Close Revision Evidence Pattern

When a slice claims the Pre-close Propagation revision and finalization contract, active-route evidence should also show:

- the governing `07` and `20` package sources and an app-owned explanation of editable staging versus the append-only report boundary at the affected row and close control;
- active, superseded, and retracted consequence/domain versions with stable lineage, retired content, steward reason, and provenance, while making the exact active close set unambiguous;
- row-local revise and retract actions with required reason, replacement prose or domain triage/declaration, severity-dependent obligations, and no browser-invented coverage or currentness policy;
- a consequence replacement whose prior disposition remains visible as history, whose active replacement is visibly undispositioned when required, and whose row-specific blocker prevents close until remediated;
- active-only order/domain coverage, close blockers, and preview rendered from server responses, with “no blockers” shown only when the server reports readiness;
- a stale packet state that names the changed row/revision, visibly refuses stale copy/store/dispose/use actions, and offers the server-provided load-current-packet recovery action;
- current Proposal and Pressure preview, source manifest, omissions, output labels, active-set identity, and advisory/canon warning over the revised active set;
- after used Pressure and substantive revision, fresh Pressure or the governed skip path, including the severity-dependent reason rule and wording that external LLM use remains optional;
- one failed revise, retract, re-disposition, packet, or skip action with all entered values preserved, the server error adjacent to the affected action, and concrete remediation;
- write intent naming the final active rows and revision audit that will be written, source/debt links or queues affected, and source canon, Admission work, sibling proposals, unrelated debt, advisory material, and prior reports left untouched;
- safe exit/resume and read-side evidence that reload server-owned lifecycle, current/next/resume state, blockers, currentness, lineage, and report/audit distinction without a read mutation;
- successful close to one append-only report, a refused post-close revise/retract attempt, and correction through a new report rather than reopened staging;
- a docs-naive walkthrough from current Pressure through correction, invalidated readiness, remediation, fresh Pressure or skip, close, readback, safe return, and console review; and
- one exact current Pressure packet exercised in a cold external LLM session, with packet identity and relevance recorded. If unavailable, this row is blocked rather than inferred from tests.

Source-policy checks may support this evidence by proving that the browser consumes returned lifecycle, severity, blocker, currentness, and route shapes, but source checks cannot substitute for the rendered active route. Likewise, server/store tests support invariants but cannot substitute for failure recovery, cognitive walkthrough, console state, or cold-packet relevance.

## Temporal Pre-Close Revision Evidence Pattern

When a slice claims **Temporal coverage revision and finalization**, active-route evidence must show:

- the governing `03`, `09`, and `20` package sources and app-owned doctrine beside save and close explaining editable open-run staging versus append-only final or correction reports;
- all ten restored and editable Temporal lenses, the required material-revision reason, the exact active revision, and active, dirty, superseded, failed, blocked, and finalized states with stable accessible names;
- lineage disclosure preserving all retired values, stable revision/prior identities, reason, creator and retirement actor/timestamp/flow-step provenance, while retired or rejected prose is never presented as persisted current material;
- one refused material correction of at least four named lenses in which all values and selections remain in the same active surface, the exact server error and remediation are announced beside save, focus/context remain predictable, close is blocked, and save-again plus discard-to-authoritative recovery are available;
- one successful four-or-more-lens replacement with non-empty reason, refreshed active revision, active-set identity, lineage, blockers, and readiness consumed from the server rather than selected locally;
- an earlier packet made visibly stale by the changed revision, packet-bound actions refused, Proposal/Pressure selection and Temporal orientation preserved, and server-provided current-packet recovery offered;
- fresh current Pressure or the governed Prompt-out skip after previously used Pressure, including the existing reason threshold and explicit wording that external LLM use is optional;
- current packet body, source documents, manifest, omissions, output labels, advisory/canon warning, flow/step/mode/revision/packet identity, and exact preview/copy/download parity over the active revision;
- close preview naming active revision, retained lineage audit, outcomes, final or correction report, `supersedes` relationship, records/links to write, and source, Propagation, Admission, sibling obligations, debt, advisory material, and unrelated World-file state left untouched;
- an existing frozen-report run migrated without changing prior bytes, with all ten values restored and no fabricated reason/history; correction close/readback distinguishes restored staging, lineage, retained prior report, and corrected current result;
- successful close freezing staging, one refused post-close revision without partial mutation, and later correction described as a new governed run/report rather than reopening either report;
- safe exit, direct resume, current/next/resume readback, keyboard activation, focus movement/restoration, screen-reader announcements, screenshots or equivalent durable artifacts, and separate final console error and warning classification; and
- one exact current revised Pressure packet exercised in a fresh cold external session, with packet identity and relevant help recorded. If production-route or cold-session proof is unavailable, its row remains blocked rather than inferred from HTTP, SQL, component, or source-policy tests.

Before/after API and World-file fingerprints must prove that navigation, failed actions, migration, revision, Prompt-out recovery, and readback leave source fact standing/text, the source Propagation report, sibling obligations, Admission contents, existing debt, advisory artifacts, unrelated records/links, and unrelated flows unchanged except for approved Temporal staging, explicit outcomes, the final/correction report, and their governed links. Source-policy guards support this proof by showing the browser consumes returned revision, lineage, migration, blocker, currentness, report-relationship, close, and orientation shapes; they never replace the rendered active route.

### Compact Pre-Close workspace evidence

Slices implementing the compact **Pre-close Propagation revision and finalization** workspace additionally owe focused evidence that:

- every active consequence and all fourteen active domains begin as compact summaries carrying stable row or lineage identity, active version, current steward-authored material, lifecycle state, and the applicable server-returned triage, disposition, validation, or blocker state;
- eligible summaries expose explicit edit or retract controls and exactly one consequence-or-domain editor is expanded across both row families;
- deliberate cross-family switching preserves each row's unsaved text and selections under stable identity while moving focus into the newly opened editor;
- cancel discards only the selected draft and restores authoritative values, successful replacement or retraction clears the retired row's draft only after refreshed server state loads, and failure preserves every entered value with an accessible adjacent error and concrete remediation;
- any transition that cannot preserve entered material stops for an explicit steward choice rather than silently discarding it;
- editor and lineage controls expose expanded state and stable accessible names, accept keyboard activation, move focus to the opened editor heading or first action, and restore it to a predictable row control when closed;
- retired consequence and domain lineage is collapsed by default behind accurate counts that update after refreshed replacement or retraction state, and expanded history retains wording or declaration, lifecycle state, version chain, steward reason, creator and retirement provenance, and historical disposition;
- active, superseded, and retracted material remains visually and semantically distinct, so retired wording is never presented as current decision or canon material;
- a persistently reachable or locally repeated finalization landmark keeps server-returned row and close blockers, packet currentness, fresh Pressure or governed skip, severity-dependent reason rules, packet preview, source manifest, omissions, output labels, advisory/canon warning, active decision identity, close preview, write intent, read-side trail, and current/next/resume and safe-exit state available without prescribing sticky positioning;
- app-owned doctrine at the active editor and landmark names the governing `07_propagation_engine.md` and `20_ai_assisted_workflow.md` sources as provenance, explains required, optional, skippable, and severity-dependent work, and distinguishes editable staging from the append-only report boundary; and
- source-policy guards demonstrate that lifecycle identity, versions, dispositions, coverage, blockers, currentness, Pressure-or-skip recovery, write intent, close readiness, and provenance come from existing server responses rather than browser policy.

Focused React evidence should cover compact/default/open/switch/draft/cancel/success/failure/history/count/keyboard/focus/landmark states. A docs-naive component walkthrough should additionally show that the steward can locate one consequence and one domain, switch without losing either draft, recover from a failed action, inspect lineage, identify blockers and packet-or-skip state, predict the write boundary, and safely exit/resume. These focused proofs support the final foundational-density production-route replay; they do not claim successful close, cold external Pressure relevance, or a clean production console on behalf of issue #368. That final replay remains gated on issue #369's canonical decision-identity repair, issue #370's close-blocker render-identity repair, and the production-route readiness readback. The docs-only contract and focused browser-composition slices do not inherit that replay gate; issue #367's narrower #370 composition prerequisite is already satisfied.

## Foundational Propagation Packet-Context Evidence Pattern

When a slice claims the PRD #358 packet-context contract, active-route evidence must show:

- the `04`, `07`, and `20` package sources and the distinct foundational Proposal, related-world Pressure, packet-review, and steward-authorship decisions;
- all fourteen domains in canonical order with compact decision prompts, direct/dependency/reaction/negative triage, the foundational full-atlas rationale, and proportionate lower-severity behavior;
- Pressure's retained source fact, debt when present, severity, active consequence/domain/disposition set, blockers, close preview, active-set identity, and relevant retired audit context;
- selected kernel, direct-link, and shared-origin records with stable identity, title, record type, canon status, truth layer when present, structural relationship, inclusion reason, and active-versus-historical role, including visibly non-canon proposed or contested material;
- record-specific omissions for unavailable content, inactive or superseded support, role irrelevance, bounded second-hop exclusion, and budget trimming, plus visible 12,000-character aggregate and 2,000-character per-record bounds;
- exact parity among the visible context, source documents, source manifest, omission list, output labels, advisory warning, copied packet, and server packet identity;
- incomplete-context or substance failures rendered with concrete remediation while preserving selected flow and mode, rather than a falsely complete packet or console-only failure;
- current/stale refusal and server-provided recovery after an active-set change, plus current/next/resume state and safe exit/return;
- before/after API and world-file fingerprints proving preview and copy do not create or change records, links, standing, debt, skips, advisory artifacts, dispositions, flow state, or unrelated world data;
- source-policy proof that the browser consumes server-returned atlas, selection, standing, relationships, budgets, omissions, currentness, and recovery without local traversal, classification, hashing, or omission synthesis;
- one cold Proposal result that uses all fourteen domains without requesting hidden doctrine and one cold Pressure result that distinguishes governed support, visibly non-canon context, excluded or superseded material, and genuinely absent assumptions; and
- a docs-naive walkthrough covering decision identification, required/optional/skippable and severity-dependent context, doctrine, provenance and omissions, advisory separation, predicted non-mutation, stale recovery, safe resume, route/action outcome, screenshot or equivalent artifact, and final console error/warning classification.

If either cold session or the production route is unavailable, the corresponding evidence row remains blocked. Component tests, server tests, and static source-policy guards support but never replace this pattern.

## Cognitive Walkthrough Checklist

For learnability-sensitive changes, run a lightweight naive-steward walkthrough:

1. The steward can identify what decision is being made.
2. The steward can see why the package asks for that decision.
3. The steward can distinguish required, optional, skipped, and severity-dependent work.
4. The steward can see prompt-out as advisory pressure, not canon generation.
5. The steward can predict what the app will write, link, route, or leave untouched.
6. The steward can exit and resume without losing orientation.
7. The steward can tell which file paths are provenance and which visible text is the operating instruction.
8. When the slice includes a guided-flow write action, the steward can recover after one failed action with their entered material still present.

Record failures as follow-up work unless they block the issue's own acceptance criteria.

For setup/open-world changes, also record that the steward can start without copying a token, distinguish server/catalog readiness from world-file failures, recover from one create/open failure without retyping the path, and arrive at Creation as the first empty-world guided path.

This action-failure pattern is reviewer guidance, not a test-framework policy. It does not create a repo-wide browser/e2e hard gate; browser-visible proof can be a targeted component render, Playwright smoke, screenshot, or concise manual observation appropriate to the slice.

## Principles

Touches `docs/worldbuilding-system/05_creation_protocol.md`, `docs/worldbuilding-system/06_canon_fact_admission_protocol.md`, `docs/worldbuilding-system/07_propagation_engine.md`, `docs/worldbuilding-system/20_ai_assisted_workflow.md`, `docs/worldbuilding-system/operating_card.md`, `docs/specs/creation-flow.md`, `docs/specs/propagation-flow.md`, `docs/specs/prompt-out-context-assembly.md`, `docs/specs/schema-v1.md`, `docs/specs/workflow-map-and-navigation.md`, `guided-workflow-usability.md` W-8/W-9, `workflow-principles.md` W-2/W-3/W-4/W-7, `canon-sovereignty.md` P-2/W-1/T-5, `domain-fidelity.md` P-1/T-2, `data-principles.md` P-6/W-5/W-6/T-3/T-5, ADR 0007, ADR 0008, ADR 0009, PRD #150, PRD #158, PRD #165, and PRD #353. It affirms non-contradiction.
