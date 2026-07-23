import assert from "node:assert/strict";
import test from "node:test";
import { validatePrdPrep } from "./validate-prd-prep.mjs";

const artifactWithRows = (rows, { verdict = "no-new" } = {}) => `
Source artifact: \`reports/source.md\`.
Existing same-stem prep artifact classification: missing at intake.
Source durability: durable.
Authored-artifact durability: new and untracked.
Tracker freshness: refreshed live.
Deliverable status: PRD-ready determination only.

## Reassessment Verdict

First operational action: none - no separate tracker or verification action applies.
${verdict === "recommended"
    ? "Recommended first new PRD: Example lifecycle repair."
    : "No-new-PRD verdict: no new PRD recommended."}

## Evidence Checked

| Finding or candidate | Status | Evidence and PRD impact |
|---|---|---|
${rows.map((row) => {
  const entry = typeof row === "string" ? { label: row, status: "covered", evidence: "Covered." } : row;
  return `| ${entry.label} | ${entry.status} | ${entry.evidence ?? "Covered."} |`;
}).join("\n")}

## Authority Findings

No authority changes.

## Recommended First PRD

No new PRD recommended.

## Follow-On Candidates

None.

## Coverage Follow-Up

None.

## Rejected Or No-Op Alternatives

None.

## PRD Publication Inputs

Suggested title: None.
Publication package: no new PRD.
Recommended testing seam: existing seams.
\`/to-prd\` consultation status: house style only.
Likely label and downgrades: none.
Browser-visible guidance checklist mapping: N/A.
Canonical implementation gates: none.
Focused implementation gates: none.
Evidence expectations: none.

## Completion Self-Check

Complete.

## Freshness And Boundaries

Current.
`;

test("accepts an explicit recommended-first-PRD decision handoff", () => {
  const result = validatePrdPrep({
    source: "",
    artifact: artifactWithRows([{ label: "Example candidate", status: "fresh product scope" }], { verdict: "recommended" })
  });

  assert.deepEqual(result.errors, []);
});

test("accepts an explicit no-new-PRD decision handoff", () => {
  const result = validatePrdPrep({
    source: "",
    artifact: artifactWithRows([{ label: "Example validation", status: "validated/no product scope" }])
  });

  assert.deepEqual(result.errors, []);
});

test("requires the existing-prep classification and first operational action fields", () => {
  const missingPrepClassification = validatePrdPrep({
    source: "",
    artifact: artifactWithRows([]).replace(/^Existing same-stem prep artifact classification:.*\n/m, "")
  });
  assert.match(missingPrepClassification.errors.join("\n"), /missing required field: existing same-stem prep artifact classification/);

  const missingFirstAction = validatePrdPrep({
    source: "",
    artifact: artifactWithRows([]).replace(/^First operational action:.*\n/m, "")
  });
  assert.match(missingFirstAction.errors.join("\n"), /missing required field: first operational action/);
});

test("requires exactly one decision verdict field", () => {
  const missingVerdict = validatePrdPrep({
    source: "",
    artifact: artifactWithRows([]).replace(/^No-new-PRD verdict:.*\n/m, "")
  });
  assert.match(missingVerdict.errors.join("\n"), /exactly one decision verdict field.*found 0/);

  const duplicateVerdict = validatePrdPrep({
    source: "",
    artifact: artifactWithRows([]).replace(
      /^No-new-PRD verdict:.*$/m,
      "No-new-PRD verdict: no new PRD recommended.\nRecommended first new PRD: duplicate verdict."
    )
  });
  assert.match(duplicateVerdict.errors.join("\n"), /exactly one decision verdict field.*found 2/);
});

test("recognizes supported finding heading separators", () => {
  const source = `
## Findings

### V-01 - Validation

### P-01 (proposal) — Proposal context

### P-02 (pressure) – Pressure context
`;
  const result = validatePrdPrep({
    source,
    artifact: artifactWithRows(["V-01 Validation", "P-01 Proposal context", "P-02 Pressure context"])
  });

  assert.deepEqual(result.errors, []);
  assert.equal(result.summary.findings, 3);
});

test("fails closed on an unparsed finding-like heading", () => {
  const source = `
## Findings

### P-01: Unsupported separator
`;
  const result = validatePrdPrep({ source, artifact: artifactWithRows([]) });

  assert.equal(result.summary.findings, 0);
  assert.match(result.errors.join("\n"), /unparsed finding heading: ### P-01: Unsupported separator/);
});

test("recognizes and deduplicates bullet and table regression identities", () => {
  const source = `
## Regression of prior findings

- Field Build 15 P-01 (workflow routing): covered.
- Repro replayed: exact route passed.
| Prior finding | Status |
|---|---|
| Field Build 14 F-01 search punctuation | covered |
| Field Build 15 P-01 workflow routing | covered |
`;
  const result = validatePrdPrep({
    source,
    artifact: artifactWithRows([
      "Field Build 15 P-01 workflow routing",
      "Field Build 14 F-01 search punctuation"
    ])
  });

  assert.deepEqual(result.errors, []);
  assert.equal(result.summary.regressions, 2);
});

test("recognizes compact and grouped table regression identities", () => {
  const source = `
## Regression of prior findings

| Prior finding | This run |
|---|---|
| FB19 P-01 | fixed |
| FB17 F-01/F-02 | fixed |
| FB11 P-01/F-02 | fixed |
`;
  const result = validatePrdPrep({
    source,
    artifact: artifactWithRows([
      "Field Build 19 P-01",
      "Field Build 17 F-01",
      "Field Build 17 F-02",
      "Field Build 11 P-01",
      "Field Build 11 F-02"
    ])
  });

  assert.deepEqual(result.errors, []);
  assert.equal(result.summary.regressions, 5);
});

test("requires every identity expanded from a grouped regression cell", () => {
  const source = `
## Regression of prior findings

| Prior finding | This run |
|---|---|
| FB17 F-01/F-02 | fixed |
`;
  const result = validatePrdPrep({
    source,
    artifact: artifactWithRows(["Field Build 17 F-01"])
  });

  assert.match(result.errors.join("\n"), /regression Field Build 17 F-02 must map to exactly one Evidence Checked row; found 0/);
  assert.equal(result.summary.regressions, 2);
});

test("fails closed on a finding-like regression entry with no run identity", () => {
  const source = `
## Regression of prior findings

| Prior finding | This run |
|---|---|
| Prior run P-01 | fixed |
`;
  const result = validatePrdPrep({ source, artifact: artifactWithRows([]) });

  assert.match(result.errors.join("\n"), /unparsed regression identity: Prior run P-01/);
  assert.equal(result.summary.regressions, 0);
});

test("accepts coverage follow-up as a classified evidence status", () => {
  const result = validatePrdPrep({
    source: "",
    artifact: artifactWithRows([{ label: "Replay current close frontier", status: "coverage follow-up" }])
  });

  assert.deepEqual(result.errors, []);
});

test("rejects an unknown evidence status", () => {
  const result = validatePrdPrep({
    source: "",
    artifact: artifactWithRows([{ label: "Replay current close frontier", status: "coverage-only" }])
  });

  assert.match(result.errors.join("\n"), /invalid or missing status: coverage-only/);
});

test("requires one dedicated evidence row for every top-level Frontier item", () => {
  const source = `
## Frontier

- Walked to: active-set revision 26.
- Next run resumes at: final current Pressure.
`;
  const result = validatePrdPrep({
    source,
    artifact: artifactWithRows([
      "Frontier: Walked to",
      { label: "Frontier: Next run resumes at", status: "coverage follow-up" }
    ])
  });

  assert.deepEqual(result.errors, []);
  assert.equal(result.summary.frontierItems, 2);
});

test("fails when one top-level Frontier item is not classified", () => {
  const source = `
## Frontier

- Walked to: active-set revision 26.
- Next run resumes at: final current Pressure.
`;
  const result = validatePrdPrep({
    source,
    artifact: artifactWithRows(["Frontier: Walked to"])
  });

  assert.match(result.errors.join("\n"), /frontier item Next run resumes at must map to exactly one Evidence Checked row; found 0/);
  assert.equal(result.summary.frontierItems, 2);
});
