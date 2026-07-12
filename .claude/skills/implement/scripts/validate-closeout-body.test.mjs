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
  "atoms: atomic; proof surfaces: .claude/skills/implement/scripts/validate-closeout-body.test.mjs; sequence: N/A because criterion is not sequence-sensitive";

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

const auditBody = (rows) => `| Issue | Acceptance criterion or conformance check | Evidence | Status |
|---|---|---|---|
${rows.join("\n")}
`;

const runValidator = (body, manifest, modeFlags = ["--closing"]) => {
  const directory = mkdtempSync(join(tmpdir(), "implement-closeout-test-"));
  const bodyPath = join(directory, "body.md");
  const manifestPath = join(directory, "manifest.json");
  writeFileSync(bodyPath, body);
  writeFileSync(manifestPath, JSON.stringify(manifest));
  const result = spawnSync(
    process.execPath,
    [validator, bodyPath, ...modeFlags, "--acceptance-manifest", manifestPath],
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

test("audit-only validator accepts a review-ready audit without closeout fields", () => {
  const manifest = buildAcceptanceManifest(issueInput);
  const result = runValidator(
    auditBody([
      `| #359 | AC1 - First exact behavior | ${evidence} | satisfied |`,
      `| #359 | AC2 - Second exact behavior with a continuation | ${evidence} | satisfied |`,
      `| #359 | Principles - Principles/ADR conformance for #359 | ${evidence} | satisfied |`
    ]),
    manifest,
    ["--audit-only", "--review-entry"]
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Acceptance audit validation passed/);
});

test("audit-only validator permits truthful blocked rows until review entry", () => {
  const manifest = buildAcceptanceManifest(issueInput);
  const body = auditBody([
    `| #359 | AC1 - First exact behavior | atoms: behavior; proof surfaces: pending browser; sequence: N/A because criterion is not sequence-sensitive | blocked |`,
    `| #359 | AC2 - Second exact behavior with a continuation | ${evidence} | satisfied |`,
    `| #359 | Principles - Principles/ADR conformance for #359 | ${evidence} | satisfied |`
  ]);
  const working = runValidator(body, manifest, ["--audit-only"]);
  const reviewEntry = runValidator(body, manifest, ["--audit-only", "--review-entry"]);

  assert.equal(working.status, 0, working.stderr);
  assert.equal(reviewEntry.status, 1);
  assert.match(reviewEntry.stderr, /review-entry gate row is not satisfied/);
});

test("audit-only mode requires a manifest and rejects closeout flags", () => {
  const directory = mkdtempSync(join(tmpdir(), "implement-audit-flags-test-"));
  const bodyPath = join(directory, "audit.md");
  const manifestPath = join(directory, "manifest.json");
  writeFileSync(bodyPath, auditBody([
    `| #359 | AC1 - First exact behavior | ${evidence} | satisfied |`
  ]));
  writeFileSync(manifestPath, JSON.stringify(buildAcceptanceManifest(issueInput)));

  const missingManifest = spawnSync(process.execPath, [validator, bodyPath, "--audit-only"], {
    encoding: "utf8"
  });
  const incompatible = spawnSync(
    process.execPath,
    [validator, bodyPath, "--audit-only", "--closing", "--acceptance-manifest", manifestPath],
    { encoding: "utf8" }
  );
  rmSync(directory, { recursive: true, force: true });

  assert.equal(missingManifest.status, 2);
  assert.match(missingManifest.stderr, /--audit-only requires --acceptance-manifest/);
  assert.equal(incompatible.status, 2);
  assert.match(incompatible.stderr, /--audit-only cannot be combined with --closing/);
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
    "atoms: TODO; proof surfaces: .claude/skills/implement/scripts/validate-closeout-body.test.mjs; sequence: N/A because criterion is not sequence-sensitive";
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

test("closeout validator rejects circular satisfied-row evidence", () => {
  const manifest = buildAcceptanceManifest(issueInput);
  const circularEvidence =
    "atoms: exact named items in this criterion; proof surfaces: server lifecycle suite; sequence: N/A because criterion is not sequence-sensitive";
  const result = runValidator(
    closeoutBody([
      `| #359 | AC1 - First exact behavior | ${circularEvidence} | satisfied |`,
      `| #359 | AC2 - Second exact behavior with a continuation | ${evidence} | satisfied |`,
      `| #359 | Principles - Principles/ADR conformance for #359 | ${evidence} | satisfied |`
    ]),
    manifest
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /uses a circular atom or proof-surface reference/);
  assert.match(result.stderr, /proof surfaces must name a concrete test, command, path, route, URL, or tracker reference/);
});

test("closeout validator rejects an unanchored proof surface", () => {
  const manifest = buildAcceptanceManifest(issueInput);
  const unanchoredEvidence =
    "atoms: lifecycle start and stop; proof surfaces: server lifecycle suite; sequence: start then stop observed by the suite";
  const result = runValidator(
    closeoutBody([
      `| #359 | AC1 - First exact behavior | ${unanchoredEvidence} | satisfied |`,
      `| #359 | AC2 - Second exact behavior with a continuation | ${evidence} | satisfied |`,
      `| #359 | Principles - Principles/ADR conformance for #359 | ${evidence} | satisfied |`
    ]),
    manifest
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /proof surfaces must name a concrete test, command, path, route, URL, or tracker reference/);
});

test("closing validator rejects a body above the configured byte ceiling", () => {
  const manifest = buildAcceptanceManifest(issueInput);
  const result = runValidator(
    closeoutBody([
      `| #359 | AC1 - First exact behavior | ${evidence} | satisfied |`,
      `| #359 | AC2 - Second exact behavior with a continuation | ${evidence} | satisfied |`,
      `| #359 | Principles - Principles/ADR conformance for #359 | ${evidence} | satisfied |`
    ]),
    manifest,
    ["--closing", "--max-bytes", "100"]
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /maximum is 100 bytes/);
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

test("closing validator rejects a local staging path in publishable sink fields", () => {
  const manifest = buildAcceptanceManifest(issueInput);
  const body = closeoutBody([
    `| #359 | AC1 - First exact behavior | ${evidence} | satisfied |`,
    `| #359 | AC2 - Second exact behavior with a continuation | ${evidence} | satisfied |`,
    `| #359 | Principles - Principles/ADR conformance for #359 | ${evidence} | satisfied |`
  ]).replace(
    "Closeout gate passed: audit sink local test body.",
    "Durable sink/body inspected: `/tmp/worldloom-closeout-359.md`\nCloseout gate passed: audit sink local test body."
  );
  const result = runValidator(body, manifest);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /published closeout field Durable sink\/body inspected contains local staging path/);
  assert.match(result.stderr, /use a stable issue\/comment reference/);
});

test("closing validator permits local fixture paths outside publishable sink fields", () => {
  const manifest = buildAcceptanceManifest(issueInput);
  const body = closeoutBody([
    `| #359 | AC1 - First exact behavior | ${evidence} | satisfied |`,
    `| #359 | AC2 - Second exact behavior with a continuation | ${evidence} | satisfied |`,
    `| #359 | Principles - Principles/ADR conformance for #359 | ${evidence} | satisfied |`
  ]).replace(
    "Current evidence identities: fixture paths none",
    "Current evidence identities: fixture paths /tmp/worldloom-proof.sqlite"
  );
  const result = runValidator(body, manifest);

  assert.equal(result.status, 0, result.stderr);
});

test("closing validator accepts a complete authority-sensitive withheld fixture identity", () => {
  const manifest = buildAcceptanceManifest(issueInput);
  const hash = "a".repeat(64);
  const body = closeoutBody([
    `| #359 | AC1 - First exact behavior | ${evidence} | satisfied |`,
    `| #359 | AC2 - Second exact behavior with a continuation | ${evidence} | satisfied |`,
    `| #359 | Principles - Principles/ADR conformance for #359 | ${evidence} | satisfied |`
  ]).replace(
    "Current evidence identities: fixture paths none; browser sessions none",
    `Current evidence identities: fixture paths withheld because issue #359 forbids local path publication; logical fixture world-alpha; content SHA-256 ${hash}; provenance generated from issue #359 seed; browser sessions none`
  );
  const result = runValidator(body, manifest);

  assert.equal(result.status, 0, result.stderr);
});

test("closing validator rejects an incomplete withheld fixture identity", () => {
  const manifest = buildAcceptanceManifest(issueInput);
  const body = closeoutBody([
    `| #359 | AC1 - First exact behavior | ${evidence} | satisfied |`,
    `| #359 | AC2 - Second exact behavior with a continuation | ${evidence} | satisfied |`,
    `| #359 | Principles - Principles/ADR conformance for #359 | ${evidence} | satisfied |`
  ]).replace(
    "Current evidence identities: fixture paths none",
    "Current evidence identities: fixture paths withheld because issue #359 forbids local path publication"
  );
  const result = runValidator(body, manifest);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /withheld fixture identity must include reason, logical fixture, 64-character content SHA-256, and provenance/);
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

test("implementation guidance carries the audited staging, exactness, and sibling contracts", () => {
  const skill = readFileSync(resolve(skillRoot, "SKILL.md"), "utf8");
  const evidenceGuide = readFileSync(resolve(skillRoot, "references/implementation-evidence.md"), "utf8");
  const scopeGuide = readFileSync(resolve(skillRoot, "references/scope-ledger.md"), "utf8");
  const reviewGuide = readFileSync(resolve(skillRoot, "references/review-evidence.md"), "utf8");
  const template = readFileSync(resolve(skillRoot, "references/closeout-templates.md"), "utf8");
  const gates = readFileSync(resolve(skillRoot, "references/tracker-closeout-gates.md"), "utf8");

  assert.match(skill, /Implementation pre-stage gate passed:/);
  assert.match(skill, /Implementation commit gate passed: staged files scoped yes/);
  assert.match(skill, /Tracked implementation evidence and publishable closeout evidence are separate sinks/);
  assert.match(evidenceGuide, /two independent snapshots or server renders are not equivalent/);
  assert.match(evidenceGuide, /SQLite `.backup`/);
  assert.match(evidenceGuide, /package manifest or lockfile changes/);
  assert.match(evidenceGuide, /published current artifact is not safe to remove until closeout is complete/);
  assert.match(evidenceGuide, /Before starting or attaching to any proof server, inspect the configured API\/UI ports/);
  assert.match(evidenceGuide, /fixture paths withheld because <authority and reason>/);
  assert.match(scopeGuide, /save one canonical ordered JSON snapshot/);
  assert.match(scopeGuide, /capture-github-issues\.mjs <issue\.\.\.> --output \/tmp\/worldloom-issues\.json/);
  assert.match(template, /## Sibling-Issue Rollup/);
  assert.match(template, /capture-github-issues\.mjs 369 370 371/);
  assert.match(template, /build-closeout-body\.mjs/);
  assert.match(reviewGuide, /Two-sink boundary/);
  assert.match(reviewGuide, /Do not amend a tracked evidence report solely to append/);
  assert.match(template, /stable issue reference before tracker URL exists/);
  assert.match(template, /Review subagents: Standards final reviewer <ID> completed; Spec final reviewer <ID> completed/);
  assert.match(template, /no hits outside classified identity\/history lines and no active-proof hits/);
  assert.match(template, /Nested-validator angle-token rule/);
  assert.match(template, /65,536-byte maximum/);
  assert.match(template, /wc -c "\$body"/);
  assert.match(template, /Do not recover space with circular evidence/);
  assert.match(template, /Authority-sensitive alternative when local fixture paths must not be published/);
  assert.match(reviewGuide, /no hits outside classified identity\/history lines and no active-proof hits/);
  assert.doesNotMatch(template, /Durable sink\/body inspected: <inspected body file path/);
  assert.match(gates, /Working pre-review audit/);
  assert.match(gates, /--audit-only --acceptance-manifest/);
  assert.match(gates, /two or more sibling issues with no parent PRD/);
  assert.match(gates, /nested validator may classify the entire cell as unresolved/);
  assert.match(gates, /default hard stop is 65,536 bytes/);
  assert.match(gates, /atoms or surfaces point circularly/);
  assert.match(skill, /published `Current evidence identities:` inventory is not safe to remove/);
});

test("documented normal-review fields satisfy the normal-review validator", () => {
  const directory = mkdtempSync(join(tmpdir(), "implement-normal-review-test-"));
  const bodyPath = join(directory, "normal-review.md");
  const manifestPath = join(directory, "acceptance-manifest.json");
  writeFileSync(manifestPath, JSON.stringify(buildAcceptanceManifest(issueInput)));
  writeFileSync(
    bodyPath,
    `Review: code-review against abcdef0; outcome no findings; verification rerun node --test.
Review subagents: Standards final reviewer reviewer-1 completed; Spec final reviewer reviewer-2 completed
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
