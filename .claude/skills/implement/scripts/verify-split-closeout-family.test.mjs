import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

import {
  parseSplitCloseoutArgs,
  verifySplitCloseoutFamily
} from "./verify-split-closeout-family.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const verifier = resolve(here, "verify-split-closeout-family.mjs");

const fullManifest = {
  version: 1,
  issues: [
    {
      number: 396,
      checks: [
        { id: "Parent-Solution", text: "Parent PRD solution" },
        { id: "Principles", text: "Principles/ADR conformance for #396" }
      ]
    },
    {
      number: 397,
      checks: [
        { id: "AC1", text: "First child behavior" },
        { id: "AC2", text: "Second child behavior" }
      ]
    }
  ]
};

const subset = (...entries) => ({
  version: 1,
  issues: entries.map(([number, checks]) => ({ number, checks }))
});

const parentSubset = subset([
  396,
  [
    { id: "Parent-Solution", text: "Parent PRD solution" },
    { id: "Principles", text: "Principles/ADR conformance for #396" }
  ]
]);
const childSubset = subset([
  397,
  [
    { id: "AC1", text: "First child behavior" },
    { id: "AC2", text: "Second child behavior" }
  ]
]);

const auditBody = (manifest, statuses = {}) => {
  const rows = manifest.issues.flatMap((issue) => issue.checks.map((check) =>
    `| #${issue.number} | ${check.id} - ${check.text} | atoms: exact; proof surfaces: node --test verifier; sequence: N/A because criterion is not sequence-sensitive | ${statuses[`${issue.number}:${check.id}`] ?? "satisfied"} |`
  ));
  return `| Issue | Acceptance criterion or conformance check | Evidence | Status |
|---|---|---|---|
${rows.join("\n")}
`;
};

const childUrl = "https://github.com/owner/repo/issues/396#issuecomment-1002";
const completeInput = () => ({
  fullManifest,
  compactBody: `${auditBody(parentSubset)}\nDurable audit sink: ${childUrl}`,
  chunks: [
    { manifest: childSubset, body: auditBody(childSubset), url: childUrl }
  ]
});

test("verifySplitCloseoutFamily accepts an exact disjoint and cited partition", () => {
  assert.deepEqual(verifySplitCloseoutFamily(completeInput()), {
    fullCheckCount: 4,
    compactCheckCount: 2,
    chunkCount: 1,
    chunkCheckCounts: [2]
  });
});

test("verifySplitCloseoutFamily rejects missing and duplicated checks", () => {
  const missing = completeInput();
  const partialChild = subset([397, [{ id: "AC1", text: "First child behavior" }]]);
  missing.chunks[0] = { manifest: partialChild, body: auditBody(partialChild), url: childUrl };
  assert.throws(
    () => verifySplitCloseoutFamily(missing),
    /full-manifest check 397:AC2 is missing from every chunk/
  );

  const duplicate = completeInput();
  duplicate.chunks.push({
    manifest: subset([396, [{ id: "Parent-Solution", text: "Parent PRD solution" }]]),
    body: auditBody(subset([396, [{ id: "Parent-Solution", text: "Parent PRD solution" }]])),
    url: "https://github.com/owner/repo/issues/396#issuecomment-1003"
  });
  duplicate.compactBody += " https://github.com/owner/repo/issues/396#issuecomment-1003";
  assert.throws(
    () => verifySplitCloseoutFamily(duplicate),
    /396:Parent-Solution appears in both compact body and chunk 2/
  );
});

test("verifySplitCloseoutFamily rejects uncited URLs and non-satisfied exact bodies", () => {
  const uncited = completeInput();
  uncited.compactBody = auditBody(parentSubset);
  assert.throws(
    () => verifySplitCloseoutFamily(uncited),
    /compact body does not cite chunk 1 URL/
  );

  const blocked = completeInput();
  blocked.chunks[0].body = auditBody(childSubset, { "397:AC2": "blocked" });
  assert.throws(
    () => verifySplitCloseoutFamily(blocked),
    /chunk 1 body row 397:AC2 is not satisfied/
  );
});

test("split closeout verifier CLI accepts repeated three-value chunk tuples", () => {
  const directory = mkdtempSync(join(tmpdir(), "implement-split-family-test-"));
  const fullPath = join(directory, "full.json");
  const compactPath = join(directory, "compact.md");
  const childManifestPath = join(directory, "child.json");
  const childBodyPath = join(directory, "child.md");
  writeFileSync(fullPath, JSON.stringify(fullManifest));
  writeFileSync(compactPath, `${auditBody(parentSubset)}\n${childUrl}\n`);
  writeFileSync(childManifestPath, JSON.stringify(childSubset));
  writeFileSync(childBodyPath, auditBody(childSubset));

  const args = [
    "--full-manifest",
    fullPath,
    "--compact-body",
    compactPath,
    "--chunk",
    childManifestPath,
    childBodyPath,
    childUrl
  ];
  assert.equal(parseSplitCloseoutArgs(args).chunks.length, 1);
  const result = spawnSync(process.execPath, [verifier, ...args], { encoding: "utf8" });
  rmSync(directory, { recursive: true, force: true });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /4 checks across compact body \(2\) plus 1 chunk \(2\)/);
});
