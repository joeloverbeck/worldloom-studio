import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { validateChild, validateRunSheet } from "./validate-publication.mjs";

const checklistItems = [
  "package source cited",
  "decision-point contract named",
  "required, optional, skippable, and severity-dependent fields visible where relevant",
  "doctrine at the actual decision point",
  "prompt packet preview, source manifest, and cold external LLM test",
  "advisory/canon separation visible",
  "skip path and reason storage",
  "blockers/substance validation",
  "current, next, and resume state",
  "read-side audit or provenance link",
  "cognitive walkthrough scenario",
];

const issueBody = (blocker = "None - can start immediately") => `
## Parent

PRD #1

## What to build

Build the slice.

## User stories covered

US1.

## Acceptance criteria

- [ ] Observable behavior.

## Blocked by

${blocker}

## Principles

No exception.
`;

const checklistRows = (slice) => checklistItems
  .map((item) => `| ${slice} | ${item} | AC 1 | - |`)
  .join("\n");

const options = (overrides = {}) => ({
  blockers: [],
  children: [],
  externalBlockers: [],
  expectAcCount: null,
  expectChecklistNa: false,
  expectNoBlocker: false,
  expectStories: false,
  onlySlices: [],
  parent: null,
  placeholderRe: "#SLICE|PLACEHOLDER",
  sliceBodies: [],
  unaffectedSlices: [],
  ...overrides,
});

test("run-sheet mode requires every represented slice by default", () => {
  const directory = mkdtempSync(join(tmpdir(), "to-issues-validator-"));
  try {
    const bodyA = join(directory, "a.md");
    const runSheet = join(directory, "run-sheet.md");
    writeFileSync(bodyA, issueBody());
    writeFileSync(runSheet, `
| Slice | Checklist item | Covered by final AC ordinal/excerpt | N/A reason |
|---|---|---|---|
${checklistRows("Slice A")}
${checklistRows("Slice B")}
`);

    const report = validateRunSheet(readFile(runSheet), options({
      sliceBodies: [{ slice: "Slice A", path: bodyA }],
    }));
    assert.deepEqual(report.unconfiguredSlices, ["Slice B"]);
    assert.equal(report.checks.hasNoUnconfiguredSlices, false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("--only-slice supports a serial check against a shared run sheet", () => {
  const directory = mkdtempSync(join(tmpdir(), "to-issues-validator-"));
  try {
    const bodyA = join(directory, "a.md");
    const runSheet = join(directory, "run-sheet.md");
    writeFileSync(bodyA, issueBody());
    writeFileSync(runSheet, `
| Slice | Checklist item | Covered by final AC ordinal/excerpt | N/A reason |
|---|---|---|---|
${checklistRows("Slice A")}
${checklistRows("Slice B")}
`);

    const report = validateRunSheet(readFile(runSheet), options({
      onlySlices: ["Slice A"],
      sliceBodies: [{ slice: "Slice A", path: bodyA }],
    }));
    assert.deepEqual(report.onlySlices, ["Slice A"]);
    assert.equal(report.selectedRowCount, 11);
    assert.deepEqual(report.unconfiguredSlices, []);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("run-sheet mode rejects placeholders in a configured affected child body", () => {
  const directory = mkdtempSync(join(tmpdir(), "to-issues-validator-"));
  try {
    const bodyA = join(directory, "a.md");
    const runSheet = join(directory, "run-sheet.md");
    writeFileSync(bodyA, issueBody().replace("Build the slice.", "Build #SLICE."));
    writeFileSync(runSheet, `
| Slice | Checklist item | Covered by final AC ordinal/excerpt | N/A reason |
|---|---|---|---|
${checklistRows("Slice A")}
`);

    const report = validateRunSheet(readFile(runSheet), options({
      sliceBodies: [{ slice: "Slice A", path: bodyA }],
    }));
    assert.equal(report.affected[0].checks.noPlaceholders, false);
    assert.equal(report.checks.affectedSlicesPass, false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("child output distinguishes an inactive no-blocker expectation", () => {
  const directory = mkdtempSync(join(tmpdir(), "to-issues-validator-"));
  try {
    const body = join(directory, "blocked.md");
    writeFileSync(body, issueBody("- #10 - Contract blocker"));

    const report = validateChild(readFile(body), options({
      blockers: ["#10"],
      expectAcCount: 1,
      expectStories: true,
      parent: "PRD #1",
    }));
    assert.deepEqual(report.actualBlockers, ["#10"]);
    assert.deepEqual(report.expectations, { noBlocker: false });
    assert.equal(report.checks.noBlockerExpectationPassed, true);
    assert.equal("hasNoBlocker" in report.checks, false);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("child validation treats an exact non-tracker prerequisite as an external blocker", () => {
  const externalBlocker = "P-03 conformance repair with a current active-route packet";
  const report = validateChild(issueBody(`- ${externalBlocker}`), options({
    externalBlockers: [externalBlocker],
    expectAcCount: 1,
    expectStories: true,
    parent: "PRD #1",
  }));

  assert.deepEqual(report.actualBlockers, []);
  assert.deepEqual(report.actualExternalBlockers, [externalBlocker]);
  assert.deepEqual(report.expectedExternalBlockers, [externalBlocker]);
  assert.equal(report.checks.hasExpectedExternalBlockers, true);
  assert.equal(report.checks.hasOnlyExpectedExternalBlockers, true);
});

test("child validation rejects an undeclared external blocker instead of treating it as no blocker", () => {
  const report = validateChild(issueBody("- P-03 conformance repair"), options({
    expectAcCount: 1,
    expectStories: true,
    parent: "PRD #1",
  }));

  assert.deepEqual(report.actualExternalBlockers, ["P-03 conformance repair"]);
  assert.equal(report.checks.hasOnlyExpectedExternalBlockers, false);
});

function readFile(path) {
  return readFileSync(path, "utf8");
}
