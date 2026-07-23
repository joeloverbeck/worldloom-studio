#!/usr/bin/env node

import { readFileSync } from "node:fs";

const usage = `Usage:
  git status --porcelain=v1 -z --untracked-files=all | node .claude/skills/to-prd/scripts/worktree-baseline.mjs capture --branch <branch> --head <sha>
  git status --porcelain=v1 -z --untracked-files=all | node .claude/skills/to-prd/scripts/worktree-baseline.mjs compare --baseline-file <path> --branch <branch> --head <sha> [options]

Compare options:
  --intentional-path <path>  Classify a path owned by this run; repeat as needed.
  --concurrent-path <path>   Classify a path changed outside this run; repeat as needed.
  --snapshot-path <path>     Exclude the temporary baseline artifact itself.
  --help                     Show this help.`;

function failUsage(message) {
  if (message) console.error(message);
  console.error(usage);
  process.exit(2);
}

function parseArgs(argv) {
  const command = argv[0];
  if (command === "--help" || command == null) {
    console.log(usage);
    process.exit(command == null ? 2 : 0);
  }
  if (command !== "capture" && command !== "compare") failUsage(`Unknown command: ${command}`);

  const options = {
    baselineFile: null,
    branch: null,
    command,
    concurrentPaths: [],
    head: null,
    intentionalPaths: [],
    snapshotPath: null,
  };
  const valueOptions = new Map([
    ["--baseline-file", "baselineFile"],
    ["--branch", "branch"],
    ["--head", "head"],
    ["--intentional-path", "intentionalPaths"],
    ["--concurrent-path", "concurrentPaths"],
    ["--snapshot-path", "snapshotPath"],
  ]);

  for (let index = 1; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help") {
      console.log(usage);
      process.exit(0);
    }
    const destination = valueOptions.get(argument);
    if (!destination) failUsage(`Unknown option: ${argument}`);
    const value = argv[index + 1];
    if (value == null || value.length === 0 || value.startsWith("--")) {
      failUsage(`${argument} requires a value.`);
    }
    if (Array.isArray(options[destination])) options[destination].push(value);
    else if (options[destination] != null) failUsage(`Provide ${argument} only once.`);
    else options[destination] = value;
    index += 1;
  }

  if (!options.branch || !options.head) failUsage("Both --branch and --head are required.");
  if (command === "capture" && (options.baselineFile || options.snapshotPath || options.intentionalPaths.length || options.concurrentPaths.length)) {
    failUsage("Capture accepts only --branch and --head.");
  }
  if (command === "compare" && !options.baselineFile) failUsage("Compare requires --baseline-file.");
  return options;
}

function parsePorcelain(buffer) {
  const records = buffer.toString("utf8").split("\0");
  if (records.at(-1) === "") records.pop();
  const rows = [];

  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    if (record.length < 4 || record[2] !== " ") {
      throw new Error(`Malformed porcelain-v1 -z record at index ${index}.`);
    }
    const status = record.slice(0, 2);
    const path = record.slice(3);
    const row = { path, status };
    if (/[RC]/.test(status)) {
      const originalPath = records[index + 1];
      if (originalPath == null) throw new Error(`Rename/copy record for ${JSON.stringify(path)} has no original path.`);
      row.originalPath = originalPath;
      index += 1;
    }
    rows.push(row);
  }

  return rows.sort((left, right) => left.path.localeCompare(right.path) || left.status.localeCompare(right.status));
}

function readBaseline(path) {
  let baseline;
  try {
    baseline = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    failUsage(`Cannot read worktree baseline ${path}: ${error.message}`);
  }
  if (
    baseline == null ||
    typeof baseline !== "object" ||
    baseline.schemaVersion !== 1 ||
    typeof baseline.branch !== "string" ||
    !baseline.branch ||
    typeof baseline.head !== "string" ||
    !baseline.head ||
    !Array.isArray(baseline.rows)
  ) {
    failUsage("Worktree baseline must be a schemaVersion 1 capture document.");
  }
  for (const row of baseline.rows) {
    if (
      row == null ||
      typeof row !== "object" ||
      typeof row.path !== "string" ||
      !row.path ||
      typeof row.status !== "string" ||
      row.status.length !== 2 ||
      (row.originalPath != null && typeof row.originalPath !== "string")
    ) {
      failUsage("Worktree baseline contains a malformed porcelain row.");
    }
  }
  return baseline;
}

function rowMatches(left, right) {
  return left.status === right.status && left.originalPath === right.originalPath;
}

function compare(baseline, currentRows, options) {
  const intentional = new Set(options.intentionalPaths);
  const concurrent = new Set(options.concurrentPaths);
  const failures = [];
  const overlap = [...intentional].filter((path) => concurrent.has(path));
  if (overlap.length > 0) failures.push(`Paths cannot be both intentional and concurrent: ${overlap.join(", ")}`);
  if (baseline.rows.some((row) => row.path === options.snapshotPath)) {
    failures.push("The snapshot path was already present in the intake baseline and cannot be self-excluded.");
  }

  const baselineByPath = new Map(baseline.rows.map((row) => [row.path, row]));
  const currentByPath = new Map(
    currentRows.filter((row) => row.path !== options.snapshotPath).map((row) => [row.path, row]),
  );
  if (baselineByPath.size !== baseline.rows.length || currentByPath.size !== currentRows.filter((row) => row.path !== options.snapshotPath).length) {
    failures.push("Porcelain rows must contain at most one row per final path.");
  }

  const paths = [...new Set([...baselineByPath.keys(), ...currentByPath.keys()])].sort();
  const rows = paths.map((path) => {
    const before = baselineByPath.get(path) ?? null;
    const after = currentByPath.get(path) ?? null;
    const delta = before == null ? "added" : after == null ? "removed" : rowMatches(before, after) ? "unchanged" : "changed";
    let classification = "unclassified";
    let ownership = "classification required";
    if (intentional.has(path) && !concurrent.has(path)) {
      classification = "intentional";
      ownership = "owned by this run";
    } else if (concurrent.has(path) && !intentional.has(path)) {
      classification = "concurrent";
      ownership = "appeared or changed outside this run after intake";
    } else if (delta === "unchanged" && !intentional.has(path) && !concurrent.has(path)) {
      classification = "pre-existing";
      ownership = "not changed by this run";
    }
    return {
      path,
      finalStatus: after?.status ?? null,
      originalPath: after?.originalPath ?? null,
      intakeStatus: before?.status ?? null,
      delta,
      classification,
      ownership,
    };
  });

  const knownPaths = new Set(paths);
  const unusedDeclarations = [...new Set([...intentional, ...concurrent])].filter((path) => !knownPaths.has(path));
  if (unusedDeclarations.length > 0) failures.push(`Declared paths are absent from both intake and final status: ${unusedDeclarations.join(", ")}`);
  const unclassifiedDeltas = rows.filter((row) => row.classification === "unclassified");
  if (unclassifiedDeltas.length > 0) {
    failures.push(`Every changed, added, or removed path needs an intentional or concurrent classification.`);
  }
  if (baseline.branch !== options.branch) failures.push(`Branch changed from ${baseline.branch} to ${options.branch}.`);
  if (baseline.head !== options.head) failures.push(`HEAD changed from ${baseline.head} to ${options.head}.`);

  return {
    mode: "compare",
    baselineFile: options.baselineFile,
    snapshotPath: options.snapshotPath,
    intake: { branch: baseline.branch, head: baseline.head },
    final: { branch: options.branch, head: options.head },
    rows,
    unclassifiedDeltas,
    failures,
  };
}

const options = parseArgs(process.argv.slice(2));
let currentRows;
try {
  currentRows = parsePorcelain(readFileSync(0));
} catch (error) {
  console.error(error.message);
  process.exit(2);
}

if (options.command === "capture") {
  console.log(JSON.stringify({ schemaVersion: 1, branch: options.branch, head: options.head, rows: currentRows }, null, 2));
  process.exit(0);
}

const report = compare(readBaseline(options.baselineFile), currentRows, options);
console.log(JSON.stringify(report, null, 2));
if (report.failures.length > 0) process.exit(1);
