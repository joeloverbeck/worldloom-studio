import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { buildAcceptanceManifest, buildAuditScaffold } from "./build-acceptance-manifest.mjs";
import { buildCloseoutBodyScaffold, validateAuditInput } from "./build-closeout-body.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const builder = resolve(here, "build-closeout-body.mjs");

const manifest = buildAcceptanceManifest([
  {
    number: 364,
    title: "Parent PRD",
    body: `## Acceptance criteria

- [ ] Parent behavior

## Principles
`
  },
  {
    number: 368,
    title: "Replay child",
    body: `## Acceptance criteria

- [ ] Replay the production route
`
  }
]);

test("buildCloseoutBodyScaffold emits selected normal-review closeout fields", () => {
  const body = buildCloseoutBodyScaffold(manifest, {
    parentIssue: 364,
    reviewMode: "normal",
    tddParentRollup: true,
    browser: true,
    principles: true,
    localOnly: true,
    fixedChildMode: "pending"
  });

  assert.match(body, /^Implementation closeout for #364/m);
  assert.match(body, /Scaffold status: incomplete/);
  assert.match(body, /Local-only SHA: <final SHA> is not remote-reachable/);
  assert.match(body, /TDD closeout preflight:/);
  assert.match(body, /Review: code-review against <resolved fixed point>/);
  assert.match(body, /## Standards[\s\S]+## Spec/);
  assert.match(body, /Browser evidence:\n- Route\/action\/outcome:/);
  assert.match(body, /Fixed child inline close comment: Completed by <final SHA>\. Evidence: this parent rollup comment URL/);
  assert.match(body, /\| #364 \| AC1 - Parent behavior \|/);
  assert.match(body, /\| #368 \| AC1 - Replay the production route \|/);
  assert.doesNotMatch(body, /\| satisfied \|/);
  assert.doesNotMatch(body, /Review fallback:/);
});

test("buildCloseoutBodyScaffold preserves a completed exact audit input", () => {
  const audit = buildAuditScaffold(manifest)
    .replaceAll("atoms: TODO", "atoms: exact")
    .replaceAll("proof surfaces: TODO", "proof surfaces: focused test")
    .replaceAll(
      "sequence: TODO or N/A because criterion is not sequence-sensitive",
      "sequence: N/A because criterion is not sequence-sensitive"
    )
    .replaceAll("| not done |", "| satisfied |");
  const body = buildCloseoutBodyScaffold(manifest, {
    parentIssue: 364,
    audit,
    reviewMode: "normal"
  });

  assert.equal(body.split(audit.trim()).length - 1, 1);
  assert.equal(validateAuditInput(manifest, audit), audit.trim());
});

test("validateAuditInput rejects missing exact manifest coverage", () => {
  const audit = buildAuditScaffold(manifest).replace(
    /^\| #368 \| AC1 - Replay the production route .*\n/m,
    ""
  );

  assert.throws(
    () => validateAuditInput(manifest, audit),
    /#368 AC1 requires exactly one exact audit row; found 0/
  );
});

test("buildCloseoutBodyScaffold emits fallback and explicit N/A branches", () => {
  const body = buildCloseoutBodyScaffold(manifest, {
    parentIssue: 364,
    reviewMode: "fallback",
    fixedChildMode: "none"
  });

  assert.match(body, /Review fallback gate passed:/);
  assert.match(body, /Review fallback: <why code-review could not run>/);
  assert.match(body, /TDD evidence: N\/A because no tdd skill was invoked/);
  assert.match(body, /Browser evidence: N\/A because <reason no browser\/manual evidence applies>/);
  assert.match(body, /Principles\/ADR conformance: N\/A because no in-scope issue has a Principles section/);
  assert.match(body, /Fixed child inline close comment: N\/A because no fixed-template child closeout applies/);
});

test("closeout scaffold CLI writes a deterministic body", () => {
  const directory = mkdtempSync(join(tmpdir(), "implement-closeout-scaffold-test-"));
  const manifestPath = join(directory, "manifest.json");
  const auditPath = join(directory, "audit.md");
  const outputPath = join(directory, "closeout.md");
  writeFileSync(manifestPath, JSON.stringify(manifest));
  writeFileSync(auditPath, buildAuditScaffold(manifest));

  const args = [
    builder,
    manifestPath,
    "--audit-input",
    auditPath,
    "--output",
    outputPath,
    "--parent",
    "364",
    "--review",
    "normal",
    "--tdd-parent-rollup",
    "--browser",
    "--principles",
    "--local-only",
    "--fixed-child",
    "pending"
  ];
  const first = spawnSync(process.execPath, args, { encoding: "utf8" });
  const firstBody = readFileSync(outputPath, "utf8");
  const second = spawnSync(process.execPath, args, { encoding: "utf8" });
  const secondBody = readFileSync(outputPath, "utf8");
  rmSync(directory, { recursive: true, force: true });

  assert.equal(first.status, 0, first.stderr);
  assert.equal(second.status, 0, second.stderr);
  assert.equal(secondBody, firstBody);
});
