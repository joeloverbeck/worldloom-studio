import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { buildAcceptanceManifest, buildAuditScaffold } from "./build-acceptance-manifest.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const validator = resolve(here, "validate-closeout-body.mjs");
const builder = resolve(here, "build-acceptance-manifest.mjs");
const skillRoot = resolve(here, "..");
const normalReviewValidator = resolve(skillRoot, "../code-review/scripts/validate-review-normal-body.mjs");

const issueInput = [
  {
    number: 359,
    title: "First slice",
    body: `## Acceptance criteria

- [ ] First exact behavior
- [x] Second exact behavior
  with a continuation

## Principles

- Follow the named principle.
`
  }
];

const evidence =
  "atoms: atomic; proof surfaces: focused test; sequence: N/A because criterion is not sequence-sensitive";

const closeoutBody = (rows) => `Implementation closeout

Final SHA: abcdef0123456789
Verification:
- node --test: passed
N/A because no tdd skill was invoked
Review: code-review against abcdef0; outcome no findings; verification rerun node --test.
Browser evidence: N/A because process-only work changed no browser-consumed surface
Console state: N/A because browser evidence is N/A
Final freshness delta: N/A because browser evidence is N/A
Evidence identity refresh:
- Current evidence identities: fixture paths none; browser sessions none; packet paths/hashes none; active revisions none; artifacts none
- Historical red identities retained: none
- Superseded evidence identities: fixture paths none; browser sessions none; packet paths/hashes none; active revisions none; artifacts none
- Superseded-token sweep: N/A because every superseded category is none

| Issue | Acceptance criterion or conformance check | Evidence | Status |
|---|---|---|---|
${rows.join("\n")}

Closeout body check passed: exact fields inspected.
Closeout gate passed: audit sink local test body.
`;

const runValidator = (body, manifest) => {
  const directory = mkdtempSync(join(tmpdir(), "implement-closeout-test-"));
  const bodyPath = join(directory, "body.md");
  const manifestPath = join(directory, "manifest.json");
  writeFileSync(bodyPath, body);
  writeFileSync(manifestPath, JSON.stringify(manifest));
  const result = spawnSync(
    process.execPath,
    [validator, bodyPath, "--closing", "--acceptance-manifest", manifestPath],
    { encoding: "utf8" }
  );
  rmSync(directory, { recursive: true, force: true });
  return result;
};

test("buildAcceptanceManifest preserves source order and adds Principles", () => {
  const manifest = buildAcceptanceManifest(issueInput);

  assert.deepEqual(manifest.issues[0].checks, [
    { id: "AC1", kind: "acceptance", text: "First exact behavior" },
    { id: "AC2", kind: "acceptance", text: "Second exact behavior with a continuation" },
    { id: "Principles", kind: "principles", text: "Principles/ADR conformance for #359" }
  ]);
  assert.match(buildAuditScaffold(manifest), /\| #359 \| AC2 - Second exact behavior with a continuation \|/);
});

test("buildAcceptanceManifest keeps an empty Principles heading as a required check", () => {
  const manifest = buildAcceptanceManifest({
    number: 360,
    body: "## Acceptance criteria\n\n- [ ] One behavior\n\n## Principles\n"
  });

  assert.equal(manifest.issues[0].checks.at(-1).id, "Principles");
});

test("manifest CLI writes JSON and audit scaffold from saved issue output", () => {
  const directory = mkdtempSync(join(tmpdir(), "implement-manifest-test-"));
  const inputPath = join(directory, "issues.json");
  const manifestPath = join(directory, "manifest.json");
  const auditPath = join(directory, "audit.md");
  writeFileSync(inputPath, JSON.stringify({ issues: issueInput }));

  const result = spawnSync(
    process.execPath,
    [builder, inputPath, "--output", manifestPath, "--audit-output", auditPath],
    { encoding: "utf8" }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(readFileSync(manifestPath, "utf8")).issues[0].checks.length, 3);
  assert.match(readFileSync(auditPath, "utf8"), /\| #359 \| Principles - Principles\/ADR conformance/);
  rmSync(directory, { recursive: true, force: true });
});

test("closeout validator accepts exact one-to-one manifest coverage", () => {
  const manifest = buildAcceptanceManifest(issueInput);
  const result = runValidator(
    closeoutBody([
      `| #359 | AC1 - First exact behavior | ${evidence} | satisfied |`,
      `| #359 | AC2 - Second exact behavior with a continuation | ${evidence} | satisfied |`,
      `| #359 | Principles - Principles/ADR conformance for #359 | ${evidence} | satisfied |`
    ]),
    manifest
  );

  assert.equal(result.status, 0, result.stderr);
});

test("closeout validator rejects missing manifest coverage", () => {
  const manifest = buildAcceptanceManifest(issueInput);
  const result = runValidator(
    closeoutBody([
      `| #359 | AC1 - First exact behavior | ${evidence} | satisfied |`,
      `| #359 | Principles - Principles/ADR conformance for #359 | ${evidence} | satisfied |`
    ]),
    manifest
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /#359 AC2 requires exactly one audit row with exact criterion text; found 0/);
});

test("closeout validator rejects a matching ID with substituted criterion text", () => {
  const manifest = buildAcceptanceManifest(issueInput);
  const result = runValidator(
    closeoutBody([
      `| #359 | AC1 - Nearby behavior instead | ${evidence} | satisfied |`,
      `| #359 | AC2 - Second exact behavior with a continuation | ${evidence} | satisfied |`,
      `| #359 | Principles - Principles/ADR conformance for #359 | ${evidence} | satisfied |`
    ]),
    manifest
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /#359 AC1 requires exactly one audit row with exact criterion text; found 0/);
});

test("closeout validator rejects incomplete satisfied-row evidence", () => {
  const manifest = buildAcceptanceManifest(issueInput);
  const result = runValidator(
    closeoutBody([
      "| #359 | AC1 - First exact behavior | focused test only | satisfied |",
      `| #359 | AC2 - Second exact behavior with a continuation | ${evidence} | satisfied |`,
      `| #359 | Principles - Principles/ADR conformance for #359 | ${evidence} | satisfied |`
    ]),
    manifest
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /missing atoms:/);
  assert.match(result.stderr, /missing proof surfaces:/);
  assert.match(result.stderr, /missing sequence:/);
});

test("closeout validator rejects unresolved satisfied-row evidence", () => {
  const manifest = buildAcceptanceManifest(issueInput);
  const unresolvedEvidence =
    "atoms: TODO; proof surfaces: focused test; sequence: N/A because criterion is not sequence-sensitive";
  const result = runValidator(
    closeoutBody([
      `| #359 | AC1 - First exact behavior | ${unresolvedEvidence} | satisfied |`,
      `| #359 | AC2 - Second exact behavior with a continuation | ${evidence} | satisfied |`,
      `| #359 | Principles - Principles/ADR conformance for #359 | ${evidence} | satisfied |`
    ]),
    manifest
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /contains an unresolved value/);
});

test("closeout validator rejects a superseded inventory without a no-hit sweep", () => {
  const manifest = buildAcceptanceManifest(issueInput);
  const body = closeoutBody([
    `| #359 | AC1 - First exact behavior | ${evidence} | satisfied |`,
    `| #359 | AC2 - Second exact behavior with a continuation | ${evidence} | satisfied |`,
    `| #359 | Principles - Principles/ADR conformance for #359 | ${evidence} | satisfied |`
  ])
    .replace(
      "Superseded evidence identities: fixture paths none; browser sessions none",
      "Superseded evidence identities: fixture paths old.json; browser sessions old-session"
    )
    .replace(
      "Superseded-token sweep: N/A because every superseded category is none",
      "Superseded-token sweep: checked the body"
    );
  const result = runValidator(body, manifest);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /superseded-token sweep must report no hits/);
});

test("closeout validator rejects unresolved current evidence identities", () => {
  const manifest = buildAcceptanceManifest(issueInput);
  const body = closeoutBody([
    `| #359 | AC1 - First exact behavior | ${evidence} | satisfied |`,
    `| #359 | AC2 - Second exact behavior with a continuation | ${evidence} | satisfied |`,
    `| #359 | Principles - Principles/ADR conformance for #359 | ${evidence} | satisfied |`
  ]).replace("Current evidence identities: fixture paths none", "Current evidence identities: fixture paths TODO");
  const result = runValidator(body, manifest);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /evidence identity refresh contains an unresolved value/);
});

test("normal-review template and validator matrix use the normal contract", () => {
  const template = readFileSync(resolve(skillRoot, "references/closeout-templates.md"), "utf8");
  const gates = readFileSync(resolve(skillRoot, "references/tracker-closeout-gates.md"), "utf8");

  assert.match(template, /The review portion above is the normal `code-review` path/);
  assert.doesNotMatch(template, /Review fallback: <fallback line, or N\/A because code-review ran normally>/);
  assert.match(template, /## Standards[\s\S]+## Spec/);
  assert.match(template, /\| Issue \| Acceptance source \| Evidence reviewed \| Findings\/residuals \|/);
  assert.match(template, /--child-family --acceptance-manifest \/tmp\/worldloom-acceptance-manifest\.json/);
  assert.match(gates, /validate-review-normal-body\.mjs/);
  assert.match(gates, /--child-family/);
  assert.match(gates, /--acceptance-manifest <path>/);
  for (const line of gates.split(/\r?\n/).filter((candidate) =>
    candidate.includes("validate-review-fallback-body.mjs") && candidate.includes("--child-family")
  )) {
    assert.match(line, /--acceptance-manifest/);
  }
});

test("documented normal-review fields satisfy the normal-review validator", () => {
  const directory = mkdtempSync(join(tmpdir(), "implement-normal-review-test-"));
  const bodyPath = join(directory, "normal-review.md");
  const manifestPath = join(directory, "acceptance-manifest.json");
  writeFileSync(manifestPath, JSON.stringify(buildAcceptanceManifest(issueInput)));
  writeFileSync(
    bodyPath,
    `Review: code-review against abcdef0; outcome no findings; verification rerun node --test.
Review subagents: Standards reviewer-1 completed; Spec reviewer-2 completed
Review subagent cleanup: Standards closed; Spec closed

## Standards

Sources reviewed: AGENTS.md
Findings: none

## Spec

Sources reviewed: issue #359
Findings: none

| Issue | Acceptance source | Evidence reviewed | Findings/residuals |
|---|---|---|---|
| #359 | issue #359 AC1, AC2, Principles; sequence: N/A because these criteria are not sequence-sensitive | validator integration test | none |

Axis summary: Standards 0/none, Spec 0/none
Residual findings: none
Backend process currentness: N/A because no browser/manual evidence was used
Evidence identity refresh:
- Current evidence identities: fixture paths none; browser sessions none; packet paths/hashes none; active revisions none; artifacts none
- Historical red identities retained: none
- Superseded evidence identities: fixture paths none; browser sessions none; packet paths/hashes none; active revisions none; artifacts none
- Superseded-token sweep: N/A because every superseded category is none
`
  );

  const result = spawnSync(
    process.execPath,
    [normalReviewValidator, bodyPath, "--child-family", "--acceptance-manifest", manifestPath],
    { encoding: "utf8" }
  );
  rmSync(directory, { recursive: true, force: true });
  assert.equal(result.status, 0, result.stderr);
});
