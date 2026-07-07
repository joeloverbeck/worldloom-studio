# PRD #231 Admission First-Decision Walkthrough

Date: 2026-07-07

Scope: PRD #231 and issues #234-#239. This is a browser-backed walkthrough of the routed Admission destination after the queue/severity Prompt-out binding, first-decision contract hardening, and legacy-surface retirement.

## Fixture

- Dev server: `pnpm dev`
- Browser URL: `http://127.0.0.1:5173/`
- Temp world: `/tmp/worldloom-prd231-admission-1783393066200.sqlite`
- Seeded records:
  - `KER-1 Bridge kernel`
  - `FAC-1 Seed: Toll bell law`, a `canon_fact` at `proposed`, truth layer `Objective canon`
  - `FAC-1` linked to `KER-1` by `derived_from` with note `Creation seed source`

## Walkthrough

1. Opened the temp world from the browser's Recent worlds list. The workflow map loaded as the home surface and showed `Work Admission queue` as the next decision, with Admission queue count `1`.
2. Entered Admission through the workflow map's `Go to decision` action. The routed destination showed the queue row with source/origin context and open canon debt warning context. Before row selection, severity stayed undeclared and `Declare Severity` was disabled.
3. Selected `FAC-1` from the routed Admission queue. The decision surface loaded `admission.queue-severity`, the local decision "Choose and classify the proposed fact before Admission changes canon standing", all `admission_level` and `work_scale` definitions, and the blocker requiring both severity facets.
4. Verified pre-severity Prompt-out binding. The prompt packet used `admission_queue_severity`, `admission:queue-severity`, role `Severity classification readiness`, and source manifest entries for the record, source link, prompt template, method card, `06`, seed audit, `20`, and guided workflow usability. The prompt asked for risks, dependencies, missing information, uncertainty, and questions, while warning that pasted responses remain advisory.
5. Declared `admission_level=1` and `work_scale=minor` from the routed controls. The surface reloaded as the minor ledger path: method card `admission.minor-ledger`, severity path `minor_ledger`, required minor-ledger work, minor-path write intent, and Prompt-out binding switched to `admission_prerequisite_audit`.
6. Ran the frontloaded seed audit from the routed surface with steward-authored findings. The surface showed `GAT-1 Frontloaded seed audit` as a linked source without mutating the selected fact's truth layer, canon status, or severity facets.
7. Clicked `Record Skip` from the same routed surface to exercise the governed decline path. The app wrote `SKP-1 Skip: web_admission_instrument` with no reason required below the major threshold.
8. Opened the routed `Substrate` destination as a negative check. It showed generic record/search/link and Prompt-out substrate/admin surfaces, plus the resulting records. It did not show a competing Admission decision panel or the old Admission mutation controls.

## Evidence

- Screenshot: `output/playwright/prd231-admission-first-decision.png`
- API readback after the browser run:
  - Gate result: `GAT-1 Frontloaded seed audit`, status `proposed`
  - Skip: `SKP-1 Skip: web_admission_instrument`, status `proposed`
  - Links from `FAC-1`: `Creation seed source` to `KER-1`, `Frontloaded seed audit report` to `GAT-1`
  - Link from `SKP-1`: `Admission instrument declined` to `FAC-1`
  - Facets on `FAC-1`: `admission_level=1`, `work_scale=minor`

## Naive-Steward Notes

- The route starts at the workflow map, not a hidden panel. A steward sees why Admission is next before entering the flow.
- Before severity declaration, the visible decision is classification readiness, not completion. The surface exposes no `Complete Gate` or `Admit Minor Row` controls in the routed Admission destination.
- The queue/severity prompt packet names its source manifest and omissions, and it forbids advisory output from assigning canon standing, truth layer, status, severity, or admission operations.
- After severity declaration, the app reveals the minor path and switches to the post-severity prerequisite-audit prompt template. This is the expected boundary: queue/severity prompt first, prerequisite/constraint prompt only after path selection.
- Seed audit and decline are visible as governed instruments. Running the audit writes a linked `gate_result`; declining writes a `skip_record`. Neither path admits or mutates the seed.

## Caveats

- This walkthrough proves the first-decision and seed-audit path. It intentionally does not complete a minor ledger row or full gate, because PRD #231 keeps close/admit/reject/defer completion controls out of the first-decision surface.
- The browser smoke used local API seeding to create a deterministic world fixture before interacting through the UI.
