import assert from "node:assert/strict";
import test from "node:test";
import { validatePrdPrep } from "./validate-prd-prep.mjs";

const artifactWithRows = (rows) => `
Source artifact: \`reports/source.md\`.
Source durability: durable.
Authored-artifact durability: new and untracked.
Tracker freshness: refreshed live.
Deliverable status: PRD-ready determination only.

## Reassessment Verdict

Verdict.

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
