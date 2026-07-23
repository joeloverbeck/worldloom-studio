import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

import {
  parseSplitTddCloseoutArgs,
  verifySplitTddCloseoutFamily
} from "./verify-split-tdd-closeout-family.mjs";

const verifier = fileURLToPath(new URL("./verify-split-tdd-closeout-family.mjs", import.meta.url));
const checks = (prefix) => [
  { id: `${prefix}1`, kind: "acceptance", text: `${prefix} first behavior` },
  { id: `${prefix}2`, kind: "acceptance", text: `${prefix} second behavior` }
];
const fullManifest = {
  version: 1,
  issues: [
    {
      number: 396,
      title: "Parent",
      checks: [
        { id: "Parent-Solution", kind: "parent-prd-section", text: "Parent solution" },
        { id: "US1", kind: "user-story", text: "Parent first story" }
      ]
    },
    { number: 397, title: "Carrier child", checks: checks("AC") },
    { number: 398, title: "Later child", checks: checks("AC") }
  ]
};
const compactManifest = { version: 1, issues: [fullManifest.issues[0]] };
const carrierManifest = { version: 1, issues: [fullManifest.issues[1]] };
const laterManifest = { version: 1, issues: [fullManifest.issues[2]] };
const carrierUrl = "https://github.com/owner/repo/issues/397#issuecomment-1001";
const laterUrl = "https://github.com/owner/repo/issues/398#issuecomment-1002";
const expectedFinalSha = "abcdef0123456789";

const tddBody = (manifest, suffix = "") => {
  const rows = manifest.issues.map((issue) => {
    const ids = issue.checks.map((check) => check.id).join(", ");
    const atoms = issue.checks.map((check) => check.text).join(" + ");
    return `| #${issue.number} | read | ADR 0001 read | no-runnable contract | N/A because this fixture verifies a document contract | \`node --test verifier\` passed | ${ids}; atoms: ${atoms}; proof surfaces: .claude/skills/tdd/scripts/verify-split-tdd-closeout-family.test.mjs; sequence: N/A because these criteria are not sequence-sensitive | N/A |`;
  });
  return `TDD evidence

Final SHA: ${expectedFinalSha}

| Issue | CONTEXT.md status | ADRs/principles/docs status | Seam | Red command/failure | Green command or evidence | Acceptance covered | Review fix / red-first skip reason |
|---|---|---|---|---|---|---|---|
${rows.join("\n")}

Verification command ledger:
| Exact command | Observed result/counts | Run count | Represented SHA/tree |
|---|---|---|---|
| \`node --test verifier\` | passed: 1 file and 4 tests; exit 0 | 1 | abcdef0123456789 |

Existing-test contract-change rows: none

TDD closeout preflight:
- Durable sink/body inspected: test fixture
- Compact table/header: present after structural check
- Rows accounted for: all in-scope issues and seams listed
- Pre-red recovery status: N/A - pre-red preflight/table was visible before first red
- CONTEXT.md status: present
- ADRs/principles/docs status: present
- Acceptance atom map: all rows list exact criteria plus authoritative atoms and proof surfaces
- Acceptance sequence map: all rows use justified sequence N/A
- Partial-red / red-first skip reasons: listed
- Evidence-only rows freshness: none
- Evidence-only proof server preflight: N/A because no browser/manual evidence-only rows
- Evidence-only backend process currentness: N/A because no browser/manual evidence-only rows
- Proof-process finalization: N/A because no proof-owned process or session was started
- Evidence identity refresh: same-sink current/historical-red/superseded identity block inspected
- Existing-test contract-change rows: none

Evidence identity refresh:
- Current evidence identities: fixture paths none; browser sessions none; packet paths/hashes none; active revisions none; artifacts none
- Historical red identities retained: none
- Superseded evidence identities: fixture paths none; browser sessions none; packet paths/hashes none; active revisions none; artifacts none
- Superseded-token sweep: N/A because every superseded category is none

TDD evidence gate passed: durable sink test fixture; compact table/header present after structural check; seams accounted for all listed; CONTEXT.md status present; ADRs/principles/docs status present; sequence evidence N/A; evidence identities present; partial-red / red-first skip reasons listed; evidence-only rows none; proof server preflight N/A; proof-process finalization N/A; existing-test contract-change rows none.
${suffix}
`;
};

const completeInput = () => ({
  fullManifest,
  compact: { manifest: compactManifest, body: tddBody(compactManifest, `${carrierUrl}\n${laterUrl}`) },
  carrier: { manifest: carrierManifest, body: tddBody(carrierManifest), url: carrierUrl },
  chunks: [{ manifest: laterManifest, body: tddBody(laterManifest), url: laterUrl }],
  expectedFinalSha
});

test("verifySplitTddCloseoutFamily accepts an exact validated partition with a closing carrier", () => {
  assert.deepEqual(verifySplitTddCloseoutFamily(completeInput()), {
    fullCheckCount: 6,
    compactCheckCount: 2,
    carrierCheckCount: 2,
    chunkCount: 1,
    chunkCheckCounts: [2]
  });
});

test("verifySplitTddCloseoutFamily rejects missing and duplicate checks", () => {
  const missing = completeInput();
  const partial = { version: 1, issues: [{ ...laterManifest.issues[0], checks: [checks("AC")[0]] }] };
  missing.chunks[0] = { manifest: partial, body: tddBody(partial), url: laterUrl };
  assert.throws(
    () => verifySplitTddCloseoutFamily(missing),
    /full-manifest check 398:AC2 is missing from every body/
  );

  const duplicate = completeInput();
  duplicate.chunks.push({
    manifest: laterManifest,
    body: tddBody(laterManifest),
    url: "https://github.com/owner/repo/issues/398#issuecomment-1003"
  });
  duplicate.compact.body += "https://github.com/owner/repo/issues/398#issuecomment-1003";
  assert.throws(
    () => verifySplitTddCloseoutFamily(duplicate),
    /398:ac1 appears in both chunk 1 and chunk 2/
  );
});

test("verifySplitTddCloseoutFamily rejects uncited supplemental bodies and invalid later chunks", () => {
  const uncited = completeInput();
  uncited.compact.body = tddBody(compactManifest);
  assert.throws(
    () => verifySplitTddCloseoutFamily(uncited),
    /compact body does not cite carrier URL/
  );

  const invalid = completeInput();
  invalid.chunks[0].body = invalid.chunks[0].body.replace(
    "atoms: AC first behavior + AC second behavior",
    "atoms: exact adjacent #398 audit rows below"
  );
  assert.throws(
    () => verifySplitTddCloseoutFamily(invalid),
    /chunk 1 TDD validation: compact TDD row .* uses a circular atom/
  );
});

test("verifySplitTddCloseoutFamily validates the carrier as closing before mutation", () => {
  const input = completeInput();
  input.carrier.body = input.carrier.body.replace(`Final SHA: ${expectedFinalSha}\n`, "");

  assert.throws(
    () => verifySplitTddCloseoutFamily(input),
    /carrier TDD validation: closing validation requires a concrete Final SHA field/
  );
});

test("verifySplitTddCloseoutFamily requires the lowest-numbered supplemental issue as carrier", () => {
  const input = completeInput();
  input.carrier = { manifest: laterManifest, body: tddBody(laterManifest), url: laterUrl };
  input.chunks = [{ manifest: carrierManifest, body: tddBody(carrierManifest), url: carrierUrl }];

  assert.throws(
    () => verifySplitTddCloseoutFamily(input),
    /carrier must contain the lowest-numbered supplemental issue #397/
  );
});

test("verifySplitTddCloseoutFamily requires the carrier URL to target the lowest issue", () => {
  const input = completeInput();
  const wrongIssueUrl = "https://github.com/owner/repo/issues/398#issuecomment-1004";
  input.carrier.url = wrongIssueUrl;
  input.compact.body = input.compact.body.replace(carrierUrl, wrongIssueUrl);

  assert.throws(
    () => verifySplitTddCloseoutFamily(input),
    /carrier URL must target lowest-numbered supplemental issue #397/
  );
});

test("verifySplitTddCloseoutFamily permits a multi-issue carrier containing the lowest issue", () => {
  const carrier = {
    version: 1,
    issues: [fullManifest.issues[1], fullManifest.issues[2]]
  };
  const input = {
    fullManifest,
    compact: { manifest: compactManifest, body: tddBody(compactManifest, carrierUrl) },
    carrier: { manifest: carrier, body: tddBody(carrier), url: carrierUrl },
    chunks: [],
    expectedFinalSha
  };

  assert.deepEqual(verifySplitTddCloseoutFamily(input), {
    fullCheckCount: 6,
    compactCheckCount: 2,
    carrierCheckCount: 4,
    chunkCount: 0,
    chunkCheckCounts: []
  });
});

test("split TDD closeout verifier CLI accepts a carrier and later chunk tuples", () => {
  const directory = mkdtempSync(join(tmpdir(), "tdd-split-family-test-"));
  const fullPath = join(directory, "full.json");
  const compactManifestPath = join(directory, "compact.json");
  const compactBodyPath = join(directory, "compact.md");
  const carrierManifestPath = join(directory, "carrier.json");
  const carrierBodyPath = join(directory, "carrier.md");
  const laterManifestPath = join(directory, "later.json");
  const laterBodyPath = join(directory, "later.md");
  writeFileSync(fullPath, JSON.stringify(fullManifest));
  writeFileSync(compactManifestPath, JSON.stringify(compactManifest));
  writeFileSync(compactBodyPath, tddBody(compactManifest, `${carrierUrl}\n${laterUrl}`));
  writeFileSync(carrierManifestPath, JSON.stringify(carrierManifest));
  writeFileSync(carrierBodyPath, tddBody(carrierManifest));
  writeFileSync(laterManifestPath, JSON.stringify(laterManifest));
  writeFileSync(laterBodyPath, tddBody(laterManifest));

  const args = [
    "--full-manifest",
    fullPath,
    "--compact",
    compactManifestPath,
    compactBodyPath,
    "--carrier",
    carrierManifestPath,
    carrierBodyPath,
    carrierUrl,
    "--expected-final-sha",
    expectedFinalSha,
    "--chunk",
    laterManifestPath,
    laterBodyPath,
    laterUrl
  ];
  assert.equal(parseSplitTddCloseoutArgs(args).carrier.url, carrierUrl);
  assert.equal(parseSplitTddCloseoutArgs(args).chunks.length, 1);
  const result = spawnSync(process.execPath, [verifier, ...args], { encoding: "utf8" });
  rmSync(directory, { recursive: true, force: true });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /6 checks across compact body \(2\), carrier \(2\), plus 1 later chunk \(2\)/);
});
