import assert from "node:assert/strict";
import test from "node:test";
import { validateFieldBuild } from "./validate-report.mjs";

const finding = ({ id, mode = "", severity, extra = "" }) => `
### ${id}${mode ? ` (${mode})` : ""} - ${id} title

- Severity: ${severity}
- Where: Guided flow.
- What happened: Observable evidence.
- What the methodology requires: Required behavior.
- The snag: Concrete snag.
- Design verdict: local polish - bounded change.
- Recommendation: Apply the bounded change.
${extra}- Fix direction: Target component.
- Touches: docs/specs/example.md, W-1.
`;

const defaultFindings = () => `
${finding({ id: "V-01", severity: "validation" })}
${finding({ id: "P-01", mode: "pressure", severity: "blocking", extra: "- Repro: Click the current packet action once.\n" })}
${finding({ id: "R-01", severity: "friction" })}`;

const defaultAppSeed = (seedDisposition) => `
### App Seed 1 - Packet identity

- Disposition: ${seedDisposition}
- Likely spec/component: docs/specs/example.md
- UX scope: local polish

Scope prose.`;

const reportFixture = ({
  regression = true,
  regressionLine = "- Field Build 16 F-03: still-broken.",
  seedDisposition = "extending relative to issue #1",
  findings = defaultFindings(),
  appSection
} = {}) => `
# Field Build 17 - Example World

**Date:** 2026-07-11 | **App commit:** abc1234 | **Method version:** worldbuilding-system 1.1
**Essence (user seed):** A useful tension.
**World:** Example. **World file:** /tmp/example.worldloom.sqlite.
**Path walked:** setup -> propagation.
**Evidence:** run log and screenshots.
**Prior-art frame:** Extends issue #1.

## Findings
${findings}
${
  regression
    ? `## Regression of prior findings

${regressionLine}
`
    : ""
}
## Decision-point log (evidence)

### Propagation decision

- Stage / decision point: Propagation.
- Docs-first draft: Steward draft.
- Prompt-out coverage: proposal=deferred; pressure=blocked.
- Cold LLM (proposal): N/A.
- Cold LLM (pressure): N/A.
- Committed: Stable state.
- UX/style verdict: ok - clear.
- Obsolescence verdict: docs still needed -> P-01.

## For the app (PRD seeds)
${appSection ?? defaultAppSeed(seedDisposition)}

## For the methodology

None.

## Frontier

- Walked to: stable propagation state.
- Next run resumes at: /tmp/example.worldloom.sqlite.
- Carried-open findings: P-01 and R-01.
- World state: flow open.
`;

const findingAuditRow = (id) => {
  const blocking = id === "P-01";
  const design = id.startsWith("R-");
  return `| ${id} | present | present | present | present | present | present | present | ${
    blocking ? "present" : "N/A - not blocking"
  } | ${design ? "present" : "N/A - not structural"} | ${design ? "present" : "N/A - not structural"} |`;
};

const liveLogFixture = ({
  findingIds = ["V-01", "P-01", "R-01"],
  targetSummary = "none",
  targetTables = "",
  priorArtAuditState = "present"
} = {}) => `
- User-directed evidence targets: ${targetSummary}

${targetTables}

## Closeout run sheet

Report-metadata audit:

| Date | App commit | Method version | Essence | World file | Path walked | Evidence | Prior-art frame | P/R/F cluster prior-art disposition |
|---|---|---|---|---|---|---|---|---|
| present | present | present | present | present | present | present | present | ${priorArtAuditState} |

Finding-field audit:

| finding | Severity | Where | What happened | What the methodology requires | The snag | Fix direction | Touches | Repro | Design verdict | Recommendation |
|---|---|---|---|---|---|---|---|---|---|---|
${findingIds.map(findingAuditRow).join("\n")}

Worktree delta audit:

| path | baseline state | final state | field-build-owned? | final note wording |
|---|---|---|---|---|
| reports/field-build-17-example-world.md | absent | untracked | yes | new field-build report |
`;

test("accepts a complete field-build report and live log", () => {
  const result = validateFieldBuild({
    report: reportFixture(),
    liveLog: liveLogFixture(),
    reportPath: "reports/field-build-17-example-world.md"
  });

  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.summary, { findings: 3, appSeeds: 1, priorReportExpected: true });
});

test("rejects fixed boundary regressions whose negative control is deferred", () => {
  const result = validateFieldBuild({
    report: reportFixture({
      regressionLine:
        "- Field Build 16 F-03: fixed -> V-01; the after-close negative control is deferred because P-02 blocked close."
    }),
    liveLog: liveLogFixture(),
    reportPath: "reports/field-build-17-example-world.md"
  });

  assert.match(result.errors.join("\n"), /declares a boundary fixed without/);
});

test("accepts a fixed boundary regression only with explicit two-sided proof", () => {
  const result = validateFieldBuild({
    report: reportFixture({
      regressionLine:
        "- Field Build 16 F-03 (closed-report boundary): fixed -> V-01.\n  - Boundary proof: pre-boundary revision passed; after-boundary negative control passed."
    }),
    liveLog: liveLogFixture(),
    reportPath: "reports/field-build-17-example-world.md"
  });

  assert.deepEqual(result.errors, []);
});

test("rejects invalid severity and a blocking finding without Repro", () => {
  const invalidSeverity = validateFieldBuild({
    report: reportFixture().replace("- Severity: blocking", "- Severity: high"),
    liveLog: liveLogFixture(),
    reportPath: "reports/field-build-17-example-world.md"
  });
  const missingRepro = validateFieldBuild({
    report: reportFixture().replace("- Repro: Click the current packet action once.\n", ""),
    liveLog: liveLogFixture(),
    reportPath: "reports/field-build-17-example-world.md"
  });

  assert.match(invalidSeverity.errors.join("\n"), /P-01 has invalid severity/);
  assert.match(missingRepro.errors.join("\n"), /P-01 is blocking but has no concrete Repro/);
});

test("rejects invalid App Seed disposition and missing finding audit row", () => {
  const result = validateFieldBuild({
    report: reportFixture({ seedDisposition: "related to issue #1" }),
    liveLog: liveLogFixture({ findingIds: ["V-01", "P-01"] }),
    reportPath: "reports/field-build-17-example-world.md"
  });

  assert.match(result.errors.join("\n"), /App Seed 1 .* invalid or missing Disposition/);
  assert.match(result.errors.join("\n"), /exactly one row for R-01; found 0/);
});

test("allows a first run to omit regression only with noPriorReport", () => {
  const report = reportFixture({ regression: false });
  const blocked = validateFieldBuild({
    report,
    liveLog: liveLogFixture(),
    reportPath: "reports/field-build-17-example-world.md"
  });
  const allowed = validateFieldBuild({
    report,
    liveLog: liveLogFixture(),
    reportPath: "reports/field-build-17-example-world.md",
    noPriorReport: true
  });

  assert.match(blocked.errors.join("\n"), /missing required heading: ## Regression of prior findings/);
  assert.deepEqual(allowed.errors, []);
});

test("keeps methodology findings out of app-seed requirements", () => {
  const report = reportFixture({
    findings: finding({ id: "M-01", severity: "friction" }),
    appSection: "\nNo new PRD seed."
  });
  const result = validateFieldBuild({
    report,
    liveLog: liveLogFixture({ findingIds: ["M-01"], priorArtAuditState: "N/A - no P/R/F cluster" }),
    reportPath: "reports/field-build-17-example-world.md"
  });

  assert.deepEqual(result.errors, []);
  assert.equal(result.summary.appSeeds, 0);
});

test("keeps operational questions out of app seeds", () => {
  const report = reportFixture({ findings: finding({ id: "Q-01", severity: "question" }) });
  const result = validateFieldBuild({
    report,
    liveLog: liveLogFixture({ findingIds: ["Q-01"], priorArtAuditState: "N/A - no P/R/F cluster" }),
    reportPath: "reports/field-build-17-example-world.md"
  });

  assert.match(result.errors.join("\n"), /App Seed clusters require at least one P\/R\/F finding/);
});

test("requires append-only initial and final user-directed target reconciliation", () => {
  const targetTables = `
## User-directed evidence checklist (initial)

| target | state | evidence / reason |
|---|---|---|
| Replay F-03 | pending | Awaiting regression. |

## Final user-directed evidence checklist

| target | state | evidence / reason |
|---|---|---|
| Replay F-03 | satisfied | Regression evidence recorded. |`;
  const accepted = validateFieldBuild({
    report: reportFixture(),
    liveLog: liveLogFixture({ targetSummary: "Replay F-03", targetTables }),
    reportPath: "reports/field-build-17-example-world.md"
  });
  const missingFinal = validateFieldBuild({
    report: reportFixture(),
    liveLog: liveLogFixture({
      targetSummary: "Replay F-03",
      targetTables: targetTables.split("## Final user-directed evidence checklist")[0]
    }),
    reportPath: "reports/field-build-17-example-world.md"
  });

  assert.deepEqual(accepted.errors, []);
  assert.match(missingFinal.errors.join("\n"), /require the exact final evidence checklist/);
});
