import assert from "node:assert/strict";
import test from "node:test";
import { verifyPublishedFamily } from "./verify-published-family.mjs";

const body = ({ blocker = null } = {}) => `
## Parent

PRD #353

## What to build

Build the slice.

## User stories covered

US1.

## Acceptance criteria

- [ ] Observable behavior.

## Blocked by

${blocker == null ? "None - can start immediately" : `- ${blocker} - Prior slice`}

## Principles

No exception.
`;

const ledgerBody = `
# Child Issue Map for PRD #353 - Issues #354-#355

| Slice | Issue |
|---|---|
| Contract | #354 |
| Server | #355 |
`;

const manifest = {
  approvedCount: 2,
  runSheet: "run-sheet.md",
  parent: {
    number: 353,
    token: "PRD #353",
    ledger: {
      status: "posted",
      commentUrl: "https://example.test/issues/353#comment-1",
      bodyFile: "ledger.md",
    },
  },
  children: [
    {
      number: 354,
      title: "Contract",
      bodyFile: "354.md",
      slice: "Contract",
      labels: ["enhancement", "ready-for-agent"],
      blockers: [],
      noBlockerPhrase: "None - can start immediately",
      checklistMapped: "yes",
    },
    {
      number: 355,
      title: "Server",
      bodyFile: "355.md",
      slice: "Server",
      labels: ["enhancement", "ready-for-agent"],
      blockers: ["#354"],
      checklistMapped: "yes",
    },
  ],
};

const stagedBodies = new Map([
  [354, body()],
  [355, body({ blocker: "#354" })],
]);

const childPayloads = new Map([
  [354, {
    number: 354,
    title: "Contract",
    body: stagedBodies.get(354).trimEnd(),
    labels: [{ name: "enhancement" }, { name: "ready-for-agent" }],
    state: "OPEN",
    url: "https://example.test/issues/354",
  }],
  [355, {
    number: 355,
    title: "Server",
    body: stagedBodies.get(355).trimEnd(),
    labels: [{ name: "enhancement" }, { name: "ready-for-agent" }],
    state: "OPEN",
    url: "https://example.test/issues/355",
  }],
]);

const parentPayload = {
  number: 353,
  state: "OPEN",
  url: "https://example.test/issues/353",
  comments: [{
    url: manifest.parent.ledger.commentUrl,
    body: ledgerBody.trimEnd(),
  }],
};

test("verifies an approved published family and ledger", () => {
  const report = verifyPublishedFamily({
    manifest,
    childPayloads,
    stagedBodies,
    parentPayload,
    ledgerBody,
    checklistVerified: true,
  });

  assert.deepEqual(report.failedChecks, []);
  assert.equal(report.checks.approvedCreatedCount, true);
  assert.equal(report.children[1].checks.blockersMatch, true);
  assert.equal(report.parent.checks.ledgerChildrenPresent, true);
});

test("fails the family when a published blocker differs from the manifest", () => {
  const wrongBodies = new Map(stagedBodies);
  wrongBodies.set(355, body({ blocker: "#999" }));
  const wrongPayloads = new Map(childPayloads);
  wrongPayloads.set(355, {
    ...wrongPayloads.get(355),
    body: wrongBodies.get(355),
  });

  const report = verifyPublishedFamily({
    manifest,
    childPayloads: wrongPayloads,
    stagedBodies: wrongBodies,
    parentPayload,
    ledgerBody,
    checklistVerified: true,
  });

  assert.equal(report.children[1].checks.blockersMatch, false);
  assert.equal(report.checks.childrenPass, false);
  assert.deepEqual(report.failedChecks, ["childrenPass"]);
});
