import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const helperPath = fileURLToPath(new URL("./worktree-baseline.mjs", import.meta.url));

const runHelper = (input, args) => {
  const result = spawnSync(process.execPath, [helperPath, ...args], { encoding: "utf8", input });
  return { ...result, report: result.stdout.trim() ? JSON.parse(result.stdout) : null };
};

const capture = (input = "") => runHelper(input, ["capture", "--branch", "main", "--head", "abc123"]);

test("captures exact NUL-delimited porcelain rows including renames and unusual paths", () => {
  const input = " M docs/a.md\0?? reports/new\nline.md\0R  docs/new name.md\0docs/old name.md\0";
  const result = capture(input);

  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.report, {
    schemaVersion: 1,
    branch: "main",
    head: "abc123",
    rows: [
      { path: "docs/a.md", status: " M" },
      { path: "docs/new name.md", status: "R ", originalPath: "docs/old name.md" },
      { path: "reports/new\nline.md", status: "??" },
    ],
  });
});

test("classifies every final path and lets intentional ownership override an unchanged status row", () => {
  const directory = mkdtempSync(join(tmpdir(), "worldloom-worktree-baseline-"));
  const baselineFile = join(directory, "baseline.json");
  try {
    writeFileSync(baselineFile, JSON.stringify(capture(" M docs/a.md\0?? reports/old.md\0").report));
    const result = runHelper(" M docs/a.md\0?? reports/old.md\0?? reports/new.md\0?? reports/.tmp-baseline.json\0", [
      "compare",
      "--baseline-file", baselineFile,
      "--branch", "main",
      "--head", "abc123",
      "--intentional-path", "docs/a.md",
      "--concurrent-path", "reports/new.md",
      "--snapshot-path", "reports/.tmp-baseline.json",
    ]);

    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(
      result.report.rows.map(({ path, classification, delta }) => ({ path, classification, delta })),
      [
        { path: "docs/a.md", classification: "intentional", delta: "unchanged" },
        { path: "reports/new.md", classification: "concurrent", delta: "added" },
        { path: "reports/old.md", classification: "pre-existing", delta: "unchanged" },
      ],
    );
    assert.deepEqual(result.report.unclassifiedDeltas, []);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("fails closed on unclassified additions, changes, and removals", () => {
  const directory = mkdtempSync(join(tmpdir(), "worldloom-worktree-baseline-"));
  const baselineFile = join(directory, "baseline.json");
  try {
    writeFileSync(baselineFile, JSON.stringify(capture(" M docs/changed.md\0?? reports/removed.md\0").report));
    const result = runHelper("M  docs/changed.md\0?? reports/added.md\0", [
      "compare",
      "--baseline-file", baselineFile,
      "--branch", "main",
      "--head", "abc123",
    ]);

    assert.equal(result.status, 1);
    assert.deepEqual(
      result.report.unclassifiedDeltas.map(({ path, delta }) => ({ path, delta })),
      [
        { path: "docs/changed.md", delta: "changed" },
        { path: "reports/added.md", delta: "added" },
        { path: "reports/removed.md", delta: "removed" },
      ],
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("fails when repository identity changes", () => {
  const directory = mkdtempSync(join(tmpdir(), "worldloom-worktree-baseline-"));
  const baselineFile = join(directory, "baseline.json");
  try {
    writeFileSync(baselineFile, JSON.stringify(capture().report));
    const result = runHelper("", [
      "compare",
      "--baseline-file", baselineFile,
      "--branch", "feature",
      "--head", "def456",
    ]);

    assert.equal(result.status, 1);
    assert.match(result.report.failures.join("\n"), /Branch changed from main to feature/);
    assert.match(result.report.failures.join("\n"), /HEAD changed from abc123 to def456/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
