import assert from "node:assert/strict";
import test from "node:test";
import { validateFieldBuild, validateFieldBuildBootstrap } from "./validate-report.mjs";

const PACKET_SHA = "a".repeat(64);
const ARTIFACT_SHA = "b".repeat(64);
const HANDOFF_SHA = "c".repeat(64);

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

const decisionPointFixture = ({
  coverage = `proposal=active=exercised; prompt=/tmp/worldloom-field-build/cold-llm/field-build-17-propagation-proposal-prompt.md; raw=${PACKET_SHA}:123; artifact=none:${ARTIFACT_SHA}:123; handoff=${HANDOFF_SHA}:123; output=/tmp/worldloom-field-build/cold-llm/field-build-17-propagation-proposal.md; subagent=/root/proposal; pressure=active=blocked by app; reason=no active Pressure control`
} = {}) => `### Propagation decision

- Stage / decision point: Propagation.
- Docs-first draft: Steward draft.
- Prompt-out coverage: ${coverage}
- Cold LLM (proposal): Candidate summary plus canonical artifact path.
- Cold LLM (pressure): N/A - active surface blocked.
- Committed: Stable state.
- UX/style verdict: ok - clear.
- Obsolescence verdict: docs still needed -> P-01.`;

const reportFixture = ({
  regression = true,
  regressionLine = "- Field Build 16 F-03: still-broken.",
  seedDisposition = "extending relative to issue #1",
  findings = defaultFindings(),
  appSection,
  decisionPoint = decisionPointFixture()
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

${decisionPoint}

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
  priorArtAuditState = "present",
  includeCommandLedger = true,
  headingOutcome = "passed - all required headings present",
  preflightOutcome = "passed - Field-build report preflight validated."
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

${
  includeCommandLedger
    ? `Closeout command ledger:

| check | exact command | outcome |
|---|---|---|
| heading check | \`rg -n '^#{1,2} ' reports/field-build-17-example-world.md\` | ${headingOutcome} |
| preflight validator | \`node .claude/skills/field-build/scripts/validate-report.mjs reports/field-build-17-example-world.md /tmp/worldloom-field-build/build-log-17-example-world.md --preflight-closeout\` | ${preflightOutcome} |`
    : ""
}
`;

const bootstrapFixture = ({
  reportNumberSlug = "18/example-world",
  targetSummary = "none",
  targetTables = "",
  omit = ""
} = {}) => {
  const fields = {
    Seed: "A useful tension.",
    "Baseline worktree": "clean",
    "Current HEAD": "abc1234",
    "Report number/slug": reportNumberSlug,
    "Prior run for this seed": "reports/field-build-17-example-world.md",
    "Latest canonical report loaded": "reports/field-build-17-example-world.md",
    "Regression gate": "HEAD advanced",
    "Mandatory regression set": "P-01",
    "Opportunistic regression set": "R-01",
    "Prior-art surfaces": "issues and reports available",
    "User-directed evidence targets": targetSummary,
    "App/API URLs": "http://127.0.0.1:5173 and http://127.0.0.1:4173"
  };
  const rows = Object.entries(fields)
    .filter(([label]) => label !== omit)
    .map(([label, value]) => `- ${label}: ${value}`)
    .join("\n");
  return `## Bootstrap\n${rows}\n\n${targetTables}`;
};

test("accepts a complete field-build report and live log", () => {
  const result = validateFieldBuild({
    report: reportFixture(),
    liveLog: liveLogFixture(),
    reportPath: "reports/field-build-17-example-world.md"
  });

  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.summary, { findings: 3, appSeeds: 1, priorReportExpected: true });
});

test("requires every decision-point field", () => {
  const requiredLines = [
    ["Stage / decision point", "- Stage / decision point: Propagation.\n"],
    ["Docs-first draft", "- Docs-first draft: Steward draft.\n"],
    ["Prompt-out coverage", reportFixture().match(/^- Prompt-out coverage:.*\n/m)?.[0] ?? ""],
    ["Cold LLM (proposal)", "- Cold LLM (proposal): Candidate summary plus canonical artifact path.\n"],
    ["Cold LLM (pressure)", "- Cold LLM (pressure): N/A - active surface blocked.\n"],
    ["Committed", "- Committed: Stable state.\n"],
    ["UX/style verdict", "- UX/style verdict: ok - clear.\n"],
    ["Obsolescence verdict", "- Obsolescence verdict: docs still needed -> P-01.\n"]
  ];

  for (const [label, line] of requiredLines) {
    const result = validateFieldBuild({
      report: reportFixture().replace(line, ""),
      liveLog: liveLogFixture(),
      reportPath: "reports/field-build-17-example-world.md"
    });
    assert.match(result.errors.join("\n"), new RegExp(`missing required field: ${label.replace(/[()]/g, "\\$&")}`));
  }
});

test("requires complete evidence for exercised prompt coverage", () => {
  const result = validateFieldBuild({
    report: reportFixture({
      decisionPoint: decisionPointFixture({
        coverage: `proposal=active=exercised; prompt=/tmp/worldloom-field-build/cold-llm/field-build-17-propagation-proposal-prompt.md; raw=abc123:123; artifact=none:${ARTIFACT_SHA}:123; handoff=${HANDOFF_SHA}:123; output=/tmp/worldloom-field-build/cold-llm/field-build-17-propagation-proposal.md; subagent=pending; pressure=active=blocked by app; reason=no active Pressure control`
      })
    }),
    liveLog: liveLogFixture(),
    reportPath: "reports/field-build-17-example-world.md"
  });

  assert.match(result.errors.join("\n"), /requires cold subagent identity/);
  assert.match(result.errors.join("\n"), /requires full raw SHA-256 and byte length/);
});

test("requires a reason for non-exercised prompt coverage", () => {
  const result = validateFieldBuild({
    report: reportFixture({
      decisionPoint: decisionPointFixture({
        coverage: `proposal=active=exercised; prompt=/tmp/worldloom-field-build/cold-llm/field-build-17-propagation-proposal-prompt.md; raw=${PACKET_SHA}:123; artifact=none:${ARTIFACT_SHA}:123; handoff=${HANDOFF_SHA}:123; output=/tmp/worldloom-field-build/cold-llm/field-build-17-propagation-proposal.md; subagent=/root/proposal; pressure=active=blocked by app`
      })
    }),
    liveLog: liveLogFixture(),
    reportPath: "reports/field-build-17-example-world.md"
  });

  assert.match(result.errors.join("\n"), /blocked by app requires reason=<one line>/);
});

test("uses a preflight pass before requiring the closeout command ledger", () => {
  const preflight = validateFieldBuild({
    report: reportFixture(),
    liveLog: liveLogFixture({ includeCommandLedger: false }),
    reportPath: "reports/field-build-17-example-world.md",
    preflightCloseout: true
  });
  const final = validateFieldBuild({
    report: reportFixture(),
    liveLog: liveLogFixture({ includeCommandLedger: false }),
    reportPath: "reports/field-build-17-example-world.md"
  });

  assert.deepEqual(preflight.errors, []);
  assert.match(final.errors.join("\n"), /missing required closeout label: Closeout command ledger:/);
});

test("rejects closeout command ledger rows without observed successful output", () => {
  const result = validateFieldBuild({
    report: reportFixture(),
    liveLog: liveLogFixture({ preflightOutcome: "passed - validator returned zero" }),
    reportPath: "reports/field-build-17-example-world.md"
  });

  assert.match(result.errors.join("\n"), /does not record the successful output/);
});

test("validates the latest append-only closeout command ledger", () => {
  const correctedLedger = `Closeout command ledger:

| check | exact command | outcome |
|---|---|---|
| heading check | \`rg -n '^#{1,2} ' reports/field-build-17-example-world.md\` | passed - all required headings present |
| preflight validator | \`node .claude/skills/field-build/scripts/validate-report.mjs reports/field-build-17-example-world.md /tmp/worldloom-field-build/build-log-17-example-world.md --preflight-closeout\` | passed - Field-build report preflight validated. |`;
  const result = validateFieldBuild({
    report: reportFixture(),
    liveLog: `${liveLogFixture({ preflightOutcome: "failed - missing report field" })}\n${correctedLedger}`,
    reportPath: "reports/field-build-17-example-world.md"
  });

  assert.deepEqual(result.errors, []);
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

test("accepts natural two-sided boundary proof wording", () => {
  const variants = [
    "- Field Build 16 F-03 (closed-report boundary): fixed -> V-01.\n  - Boundary proof: pre-boundary origin was current and exportable; post-boundary flow completed and controls were disabled.",
    "- Field Build 16 F-03 (closed-report boundary): fixed -> V-01.\n  - Boundary proof: open staging retained active lineage before close; after close the report owned the trail and edit controls were absent."
  ];

  for (const regressionLine of variants) {
    const result = validateFieldBuild({
      report: reportFixture({ regressionLine }),
      liveLog: liveLogFixture(),
      reportPath: "reports/field-build-17-example-world.md"
    });
    assert.deepEqual(result.errors, []);
  }
});

test("rejects a post-close state that leaves controls visible", () => {
  const result = validateFieldBuild({
    report: reportFixture({
      regressionLine:
        "- Field Build 16 F-03 (closed-report boundary): fixed -> V-01.\n  - Boundary proof: open staging retained active lineage before close; after close the edit controls remained visible and usable."
    }),
    liveLog: liveLogFixture(),
    reportPath: "reports/field-build-17-example-world.md"
  });

  assert.match(result.errors.join("\n"), /after-boundary negative-control pass/);
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

test("accepts an explanatory no-target bootstrap summary", () => {
  const result = validateFieldBuild({
    report: reportFixture(),
    liveLog: liveLogFixture({ targetSummary: "none; same-world resume only" }),
    reportPath: "reports/field-build-17-example-world.md"
  });

  assert.deepEqual(result.errors, []);
});

test("preflights a complete append-only bootstrap", () => {
  const result = validateFieldBuildBootstrap({
    liveLog: bootstrapFixture({
      reportNumberSlug: "18/example-world; canonical report reports/field-build-18-example-world.md",
      targetSummary: "none - same-world resume only"
    })
  });

  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.summary, { bootstrapFields: 12, userDirectedTargets: "valid" });
});

test("bootstrap preflight accepts an initial target checklist without a final checklist", () => {
  const initialTargets = `## User-directed evidence checklist (initial)
| target | state | evidence / reason |
|---|---|---|
| Replay P-03 | pending | requested regression |
`;
  const result = validateFieldBuildBootstrap({
    liveLog: bootstrapFixture({ targetSummary: "Replay P-03", targetTables: initialTargets })
  });

  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.summary, { bootstrapFields: 12, userDirectedTargets: "valid" });
});

test("bootstrap preflight rejects missing fields, malformed identity, and a missing initial target table", () => {
  const result = validateFieldBuildBootstrap({
    liveLog: bootstrapFixture({
      reportNumberSlug: "field-build-18-example-world",
      targetSummary: "Replay P-03",
      omit: "Regression gate"
    })
  });

  assert.match(result.errors.join("\n"), /bootstrap missing required field: Regression gate/);
  assert.match(result.errors.join("\n"), /Report number\/slug must use/);
  assert.match(result.errors.join("\n"), /require the exact initial evidence checklist/);
  assert.doesNotMatch(result.errors.join("\n"), /require the exact final evidence checklist/);
});
