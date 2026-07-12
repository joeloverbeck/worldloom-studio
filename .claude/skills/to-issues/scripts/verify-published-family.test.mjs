import assert from "node:assert/strict";
import test from "node:test";
import { validateManifest, verifyPublishedFamily } from "./verify-published-family.mjs";

const body = ({ blocker = null, externalBlocker = null } = {}) => `
## Parent

PRD #353

## What to build

Build the slice.

## User stories covered

US1.

## Acceptance criteria

- [ ] Observable behavior.

## Blocked by

${blocker != null
  ? `- ${blocker} - Prior slice`
  : externalBlocker != null
    ? `- ${externalBlocker}`
    : "None - can start immediately"}

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
      labels: ["enhancement", "needs-triage"],
      blockers: [],
      externalBlockers: [],
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
      externalBlockers: [],
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
    labels: [{ name: "enhancement" }, { name: "needs-triage" }],
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

test("verifies an exact external blocker for a checklist-mapped needs-triage child", () => {
  const externalBlocker = "P-03 conformance repair with a current active-route packet";
  const externalManifest = structuredClone(manifest);
  externalManifest.children[0].externalBlockers = [externalBlocker];
  delete externalManifest.children[0].noBlockerPhrase;
  const externalBodies = new Map(stagedBodies);
  externalBodies.set(354, body({ externalBlocker }));
  const externalPayloads = new Map(childPayloads);
  externalPayloads.set(354, {
    ...externalPayloads.get(354),
    body: externalBodies.get(354),
  });

  const report = verifyPublishedFamily({
    manifest: externalManifest,
    childPayloads: externalPayloads,
    stagedBodies: externalBodies,
    parentPayload,
    ledgerBody,
    checklistVerified: true,
  });

  assert.deepEqual(report.children[0].actualBlockers, []);
  assert.deepEqual(report.children[0].actualExternalBlockers, [externalBlocker]);
  assert.equal(report.children[0].checks.externalBlockersMatch, true);
  assert.equal(report.children[0].checks.checklistMapped, true);
  assert.deepEqual(report.failedChecks, []);
});

test("manifest validation reserves noBlockerPhrase for a truly unblocked child", () => {
  const externalManifest = structuredClone(manifest);
  externalManifest.children[0].externalBlockers = ["P-03 conformance repair"];
  delete externalManifest.children[0].noBlockerPhrase;
  assert.deepEqual(validateManifest(externalManifest), []);

  externalManifest.children[0].noBlockerPhrase = "None - can start immediately";
  assert.equal(
    validateManifest(externalManifest).includes(
      "children[0].noBlockerPhrase is valid only when tracker and external blockers are empty"),
    true,
  );
});

test("fails the family when an external blocker differs from the manifest", () => {
  const externalManifest = structuredClone(manifest);
  externalManifest.children[0].externalBlockers = ["P-03 conformance repair"];
  delete externalManifest.children[0].noBlockerPhrase;
  const wrongBodies = new Map(stagedBodies);
  wrongBodies.set(354, body({ externalBlocker: "F-01 conformance repair" }));
  const wrongPayloads = new Map(childPayloads);
  wrongPayloads.set(354, {
    ...wrongPayloads.get(354),
    body: wrongBodies.get(354),
  });

  const report = verifyPublishedFamily({
    manifest: externalManifest,
    childPayloads: wrongPayloads,
    stagedBodies: wrongBodies,
    parentPayload,
    ledgerBody,
    checklistVerified: true,
  });

  assert.equal(report.children[0].checks.externalBlockersMatch, false);
  assert.equal(report.checks.childrenPass, false);
  assert.deepEqual(report.failedChecks, ["childrenPass"]);
});
