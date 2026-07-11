import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const validatorPath = fileURLToPath(new URL("./validate-prd-body.mjs", import.meta.url));

const checklistItems = [
  "package source cited",
  "decision-point contract named",
  "required, optional, skippable, and severity-dependent fields visible",
  "doctrine at the actual decision point",
  "prompt packet preview, source manifest, and cold external LLM test",
  "advisory/canon separation visible",
  "skip path and reason storage",
  "blockers/substance validation",
  "current, next, and resume state",
  "read-side audit or provenance link",
  "cognitive walkthrough scenario",
];

const titleCase = (value) => value[0].toUpperCase() + value.slice(1);

const bodyWithChecklist = (items) => `Publication provenance was ratified in this session.

## Problem Statement

The publication body needs validation.

## Solution

Validate the body before publication.

## User Stories

1. As a steward, I want checklist validation, so that publication remains safe

## Implementation Decisions

### Browser-visible guidance checklist mapping

| Checklist item | PRD home |
|---|---|
${items.map((item) => `| ${item} | Implementation Decisions home |`).join("\n")}

## Testing Decisions

Seam confirmation was answered with the existing seam.

## Principles

The body affirms non-contradiction.

## Out of Scope

Runtime implementation.

## Further Notes

Seam confirmation was answered.
`;

const validate = (body) => {
  const result = spawnSync(process.execPath, [validatorPath, "--stdin", "--expect-checklist"], {
    encoding: "utf8",
    input: body,
  });
  return {
    ...result,
    report: JSON.parse(result.stdout),
  };
};

test("accepts lowercase browser checklist labels", () => {
  const result = validate(bodyWithChecklist(checklistItems));

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.report.checklistMissing, []);
});

test("accepts Title Case browser checklist labels", () => {
  const result = validate(bodyWithChecklist(checklistItems.map(titleCase)));

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.report.checklistMissing, []);
});

test("still rejects a genuinely missing browser checklist item", () => {
  const result = validate(bodyWithChecklist(checklistItems.slice(0, -1)));

  assert.equal(result.status, 1);
  assert.deepEqual(result.report.checklistMissing, ["cognitive walkthrough scenario"]);
});
