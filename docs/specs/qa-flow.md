# QA Flow Spec

This spec defines Worldloom Studio's fifth guided flow: `18_quality_assurance_tests.md`, with prompt-out support from `20_ai_assisted_workflow.md`. It is downstream of `docs/specs/schema-v1.md`, `docs/specs/admission-flow.md`, `docs/specs/propagation-flow.md`, `docs/specs/contradiction-retcon-mystery-flow.md`, `docs/worldbuilding-system/18_quality_assurance_tests.md`, `docs/worldbuilding-system/20_ai_assisted_workflow.md`, `docs/worldbuilding-system/22_glossary.md`, the foundational principles, ADRs 0001-0004, ADR 0006, and ADR 0007.

QA asks whether a record or world section is coherent under pressure. It renders doctrine, records steward-owned scores and repairs, routes proposed canon through Admission, mints visible canon debt, and leaves an append-only audit trail. It never scores for the steward, never repairs canon in place, and never admits material by a QA side door.

## Fixed Decisions

1. **QA pass subject.** A pass starts on either one steward-selected record or the whole world. Record-subject passes link the pass to the subject with the `assesses` link type; whole-world passes carry no subject link.
2. **Master scorecard/report.** The schema/export master record key for the QA report surface is `qa_scorecard`; existing runtime pass rows remain compatibility storage until a separate migration explicitly changes them. The master scorecard is report-regime, append-only, and carries subject type, score summary, regression profile, floor advisory, routed repairs, prompt-out audit, and close audit.
3. **Flow persistence.** QA uses existing `flow_instances` for resumable and interleavable work. A pass that has not been finalized remains parked with the flow.
4. **Seeded test catalog.** The app seeds the 28 core tests from `docs/worldbuilding-system/18_quality_assurance_tests.md` into `qa_test_catalog`. Each row records number, name, cluster, package source, failure smell, calibrated 1/2/3 anchors, and mode-aware benchmark text where applicable.
5. **Package self-audit exclusion.** P1 and P2 are package self-audit tests, not world-scorecard tests. They are not seeded into the world QA scorecard and are not rendered for a world steward.
6. **Per-test score rows.** `qa_test_scores` stores one row per scored test on a pass. The score is `0`, `1`, `2`, `3`, or `na`; `na` requires a reason. Notes and required repair stay prose-first.
7. **No automated judgment.** The app never scores, auto-marks n/a, or defaults a steward-owned judgment. The green/yellow/red band is derived only after steward-entered scores exist and is never stored as canon judgment.
8. **Doctrine at point of use.** The scorecard renders each test's failure smell, calibrated anchors, score interpretation, mode-aware scoring calibration, non-naturalistic benchmark anchors, red-flag smells, and "do not chase all 3s" guidance as versioned derivations of `18`.
9. **Mode-aware anchors.** If a record subject has a `consequence_mode` facet, QA returns that mode and the matching benchmark guidance. Whole-world passes return the general calibration text.
10. **Regression profile.** The pass captures nine prose fields: strongest domain, weakest domain, most dangerous under-propagated fact, most likely contradiction, most fragile mystery, most overloaded constraint, most suspicious absent institution/economy response, most at-risk aesthetic drift, and canon debt that must be resolved before new foundational facts are added.
11. **Typed profile links.** Regression-profile fields that name records use typed links from the pass to those records. Existing `derived_from` links carry record pointers; `requires_follow_up` links carry blocking canon debt.
12. **Pass/fail floor advisory.** The floor from `18` is surfaced as an advisory verdict when the steward marks the floor conditions present: repeatable high-impact capability with no limits, cost, countermeasure, actor adaptation, temporal residue, distribution, and institution/economy or mode-equivalent response. It warns only and never blocks.
13. **Floor override.** A steward may override the floor advisory. For major-or-higher work the override requires a reason; below that threshold a no-reason record is allowed by severity scaling.
14. **Repair loop.** For low load-bearing scores the steward records the smallest repair that would raise the score. QA shows the repair-loop doctrine: check whether the repair creates a bigger contradiction, propagate only as far as necessary, record the result, and stop before the world becomes more explained than alive.
15. **Admission routing.** Fact-shaped QA repairs route through Admission intake at `proposed`, linked `derived_from` the QA pass. QA does not create canon facts directly and does not alter canon standing.
16. **Canon debt routing.** Contradiction-shaped findings, mystery-shaped findings, and deferred repairs mint open `canon_debt`, scoped to QA and linked from the pass with `requires_follow_up`. This debt participates in the existing Admission foundational-open-debt warning; QA adds no new gate.
17. **Standing-change prohibition.** QA writes no `jurisdiction_events`, performs no repair operation, and exposes no route that changes a target record's canon status. Repairs are routed to Admission or canon debt only.
18. **Finalize coverage.** Finalize refuses unexplained n/a scores and refuses load-bearing low-score rows that are marked as routed but lack required-repair prose. It checks coverage and substance, never whether a score or repair is correct.
19. **Prompt template.** QA adds a `qa_red_team` default prompt template, steward-editable and versioned, derived from `18`'s eight red-team prompts and `20`'s hostile-reader pressure discipline.
20. **Prompt-out lifecycle.** QA prompt-out uses the existing Prompt-out step lifecycle from ADR 0007. It is offered and skippable, never required. Pasted responses are immutable advisory artifacts with standing rulings.
21. **Cluster prompts.** Existing role prompts map to QA clusters at dependency-bearing steps: constraint challenger, contradiction hunter, mystery guardian, consequence scout, and institution/economy analyst where relevant.
22. **Skip records.** Every declined QA instrument writes a `skip_record` under W-4. Reasons are required at major-or-higher and not collected below that threshold.
23. **Provenance.** QA mutations record actor, timestamp, flow step, and advisory derivation when advisory material was explicitly used. The v1 actor remains the steward.
24. **Browser policy boundary.** The browser consumes server-returned pass, scorecard, profile, floor, repair, prompt-out, debt, and queue shapes. It does not duplicate scoring, band, floor, finalize, admission-routing, or debt-warning policy.
25. **Terminology.** "QA pass", "pass report", "regression profile", "scorecard", and "consequence mode" are package terms from `18` and `22_glossary.md`. No new app-layer term is owed to `CONTEXT.md`.
26. **Standalone ADR deferral.** The QA module boundary is declared here instead of a standalone ADR. QA reads across reports and ledgers, writes only its pass reports and follow-up canon debt, and routes canon proposals through Admission intake under W-3 and ADR 0006. A dedicated ADR is deferred until QA logic leaks across modules.

## Step Map

| Step | Package source | Decision point | Dependency-bearing | Severity path | Prompt-out modes and pressure role |
|---|---|---|---|---|---|
| Pass entry | `18_quality_assurance_tests.md` | Choose a record or whole-world subject and open a QA scorecard/pass. | yes | QA itself does not infer severity; declared major-or-higher context affects floor override reasons and skip reasons. | Proposal and pressure modes use `qa_red_team`; pressure is QA red team over selected subject material. |
| Per-test scorecard | `18_quality_assurance_tests.md` | Score each applicable QA test, record n/a reasons, and name repair substance for weak load-bearing results. | yes | Finalize blocks unexplained n/a and routed weak load-bearing rows without repair prose. | Proposal mode can suggest labeled score/repair candidates; pressure mode challenges hidden contradictions, weak anchors, and missing repairs. |
| Regression profile | `18_quality_assurance_tests.md` | Record strongest/weakest domains, fragile mysteries, contradictions, overloaded constraints, absent institutions, and blocking debt. | yes | Profile fields remain steward-authored prose; typed links carry named records/debt. | Proposal and pressure modes use `qa_red_team`; pressure tests missing relationships and over-explained repairs. |
| Pass/fail floor | `18_quality_assurance_tests.md` | Surface the repeatable high-impact capability floor as an advisory warning, not a blocker. | yes | Major-or-higher overrides require a reason; below threshold no reason is collected. | Proposal mode can suggest floor evidence; pressure mode challenges missing limits, costs, distribution, adaptation, and institution response. |
| Repair routing | `18_quality_assurance_tests.md`, `06`, and `13` | Route fact-shaped repairs to Admission at `proposed` or contradiction/mystery/deferred findings to canon debt. | yes | Receiving flows own their own severity and repair obligations. | Proposal and pressure modes remain advisory; QA never changes canon standing directly. |
| Finalize/result | `18_quality_assurance_tests.md` and `21_templates_index.md` | Finalize the append-only QA scorecard/pass after substance blockers clear. | yes | Close blockers mirror unexplained n/a and missing required repair substance. | Prompt-out can be skipped with `skip_record`; advisory responses require disposition and explicit-use links before influence. |

## Decision-Point UI Contract

This flow must satisfy `guided-workflow-usability.md` W-8 and `guided-flow-spec-template.md`.

- **Pass entry:** the browser shows the decision to assess one record or the whole world, cites `18`, shows subject context, mode-aware calibration when available, and the fact that QA cannot change canon standing.
- **Score rows:** each rendered test shows the failure smell, anchors, score meaning, n/a rule, required repair field, prompt role where relevant, and blockers for unexplained n/a or routed low-score rows without repair prose.
- **Regression profile and floor:** the browser shows the profile fields as steward-authored judgments, typed-link affordances, floor advisory conditions, override reason threshold, and the warning/non-blocking distinction.
- **Repair routing:** proposed fixes show whether they become Admission proposals, canon debt, or no mutation; they never repair canon in place.
- **Finalize/result:** the browser previews the append-only QA pass, score rows, debt, Admission proposals, advisory-use links, skip records, and read-side trail.

## Core Test Catalog

The world QA catalog contains only the 28 core tests from `18`; each row cites `docs/worldbuilding-system/18_quality_assurance_tests.md`.

| Number | Test | Cluster | Citation |
|---:|---|---|---|
| 1 | Consequence test | Consequence | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 2 | Prerequisite test | Prerequisite | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 3 | Constraint test | Constraint | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 4 | Cost test | Constraint | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 5 | Distribution test | Distribution | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 6 | Enemy test | Distribution | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 7 | Institution or mode-equivalent test | Institution/economy | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 8 | Economic or value-pressure test | Institution/economy | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 9 | Timeline test | Timeline/spatial | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 10 | Spatial test | Timeline/spatial | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 11 | Character agency test | Agency | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 12 | Truth-layer test | Truth/evidence | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 13 | Evidence test | Truth/evidence | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 14 | Mystery / wonder preservation test | Mystery/contradiction | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 15 | Contradiction test | Mystery/contradiction | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 16 | Branch test | Branch/collaboration | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 17 | Collaboration test | Branch/collaboration | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 18 | Aesthetic residue test | Aesthetic/medium | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 19 | Ordinary-life test | Aesthetic/medium | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 20 | Fossil test | Timeline/spatial | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 21 | Suppression test | Institution/economy | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 22 | Counter-institution test | Institution/economy | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 23 | Medium test | Aesthetic/medium | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 24 | Game repeatability test | Aesthetic/medium | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 25 | Scale test | Scale/asymmetry | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 26 | Asymmetry test | Scale/asymmetry | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 27 | Negative-space test | Consequence | `docs/worldbuilding-system/18_quality_assurance_tests.md` |
| 28 | Load-bearing vocabulary test | Truth/evidence | `docs/worldbuilding-system/18_quality_assurance_tests.md` |

## Testing Seams

Primary seam: the localhost HTTP API against temp-file world databases for pass start on a record and whole world, scorecard rendering, scoring, n/a refusal and acceptance, live derived band, resume, regression profile capture, floor advisory and override, repair routing to Admission, debt minting, foundational warning feed, prompt generation, advisory paste, skip thresholds, and finalize.

Secondary seam: direct store/SQL assertions for forward migration with pre-migration backup, report-regime append-only enforcement, `qa_test_scores` enum and n/a-reason checks, seeded 28-row catalog, `assesses` link integrity, advisory immutability, skip records, and absence of QA jurisdiction events.

Browser seam: React tests for scorecard rendering and score/n/a interactions, plus a real browser smoke that starts a pass, scores a test, observes server refusal for unexplained n/a, sees the derived band/floor shapes, and confirms the created pass/scores/links/debt/queue entries match route behavior.

## Principles

Touches `docs/principles/README.md` and affirms non-contradiction with:

- `charter.md` P-3, P-4, T-8: QA is in v1 scope; the app clerks catalog rendering, coverage, links, debt, queue routing, provenance, and report assembly while the steward owns scores, n/a calls, repair prose, profile prose, and overrides.
- `canon-sovereignty.md` P-2, W-1, T-5: QA uses prompt-out/paste-in only; advisory artifacts remain immutable and type-separated; explicit advisory use is linked when the steward names it.
- `domain-fidelity.md` P-1, T-2: QA derives doctrine from `18`, keeps score/n/a/consequence-mode vocabulary separate, and does not redefine or infer package labels.
- `workflow-principles.md` P-5, W-1, W-2, W-3, W-4, W-7: QA is resumable, severity-scaled, skippable with records, coverage-gated by substance, and routes canon proposals through Admission.
- `guided-workflow-usability.md` W-8: QA browser work must expose each score, profile, floor, prompt-out, and repair routing point as a local decision.
- `data-principles.md` P-6, W-5, W-6, T-3, T-4, T-5: the QA `qa_scorecard`/pass report surface is the append-only audit record; score rows structure only what `18` structures; profile fields remain prose; typed links carry record/debt references; provenance is recorded at authorship time.
- ADRs 0001, 0002, 0003, 0004: no storage, deployment, branch/collaboration, or stack change; the migration remains forward-only and backup-first.
- ADR 0006: all QA fact repairs use Admission intake.
- ADR 0007: QA consumes Prompt-out lifecycle mechanics instead of reimplementing generate/store/dispose/skip.
- ADR 0009: QA presents server-owned policy as guided decision points in the browser.

No deliberate exceptions.
