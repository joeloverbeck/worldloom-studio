#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const file = args.find((arg) => !arg.startsWith("--"));
const flags = new Set(args.filter((arg) => arg.startsWith("--")));

const usage = `Usage: node .claude/skills/code-review/scripts/validate-review-fallback-body.mjs <body.md> [--implement] [--child-family] [--immediate-fix] [--tdd] [--tdd-parent-rollup]`;

if (flags.has("--help")) {
  console.error(usage);
  process.exit(0);
}

if (!file) {
  console.error(usage);
  process.exit(2);
}

const body = readFileSync(file, "utf8");
const errors = [];

const requireText = (needle, label = needle) => {
  if (!body.includes(needle)) errors.push(`missing ${label}`);
};

const requireMatch = (regex, label) => {
  if (!regex.test(body)) errors.push(`missing ${label}`);
};

const forbidMatch = (regex, label) => {
  if (regex.test(body)) errors.push(`forbidden ${label}`);
};

const requireGateLine = () => {
  const line = body
    .split(/\r?\n/)
    .map((candidate) => candidate.trim())
    .find((candidate) => candidate.startsWith("Review fallback gate passed:"));

  if (!line) {
    errors.push("missing Review fallback gate passed line");
    return "";
  }

  for (const label of [
    "frame",
    "delegation policy source",
    "Standards",
    "Spec",
    "child table",
    "smell baseline",
    "found-vs-residual",
    "closeout line",
    "immediate-fix block",
    "tdd fielded closeout gate",
    "verification/browser freshness"
  ]) {
    if (!line.includes(label)) errors.push(`gate line missing ${label}`);
  }

  return line;
};

const shellQuote = (value) => {
  if (/^[A-Za-z0-9_./:=+-]+$/.test(value)) return value;
  return `'${value.replace(/'/g, "'\\''")}'`;
};

const formatCommand = (command, args) => [command, ...args].map(shellQuote).join(" ");

const formatNestedResult = (label, command, args, result) => {
  const stdout = (result.stdout || "").trim();
  const stderr = (result.stderr || "").trim();
  return [
    `${label} failed`,
    `command: ${formatCommand(command, args)}`,
    `status: ${result.status ?? "null"}`,
    `signal: ${result.signal ?? "none"}`,
    `error: ${result.error ? String(result.error) : "none"}`,
    `stdout:\n${stdout || "<empty>"}`,
    `stderr:\n${stderr || "<empty>"}`
  ].join("\n");
};

const extractFieldValue = (label) => {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = body.match(new RegExp(`^\\s*-?\\s*(?:\\*\\*)?${escapedLabel}(?:\\*\\*)?:\\s*(.+)$`, "im"));
  return match?.[1]?.trim() || "";
};

const validateFreshnessValue = (value) => {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return "is empty";
  if (/^<.*>$/.test(normalized)) return "is unresolved placeholder";

  if (/^N\/A\b.+\bbecause\b/i.test(normalized)) return "";
  if (/\b(blocked|stale)\b.+\b(because|reason|unable|cannot)\b/i.test(normalized)) return "";
  if (
    /\b(passed on final tree|passed after|smoke rerun .*passed|browser smoke .*passed)\b/i.test(normalized) ||
    /\b(re-?ran|rerun|re-run)\b.+\b(passed|result|artifact|screenshot|observed|command)\b/i.test(normalized)
  ) {
    return "";
  }

  if (/\bnot affected\b/i.test(normalized)) {
    const namesChangedPath = /\bchanged (path|file|surface)\b|`[^`]+`/.test(normalized);
    const namesUnaffectedEvidence = /\b(route|action|API|fixture|browser-consumed)\b/i.test(normalized);
    const hasTargetedProof = /\btargeted proof\b|\btargeted .*passed\b|\bfocused .*passed\b|\breran targeted\b/i.test(normalized);
    if (namesChangedPath && namesUnaffectedEvidence && hasTargetedProof) return "";
    return "uses not affected without changed path, unaffected evidence path/API/fixture, and targeted proof";
  }

  return "must state rerun proof, justified not affected, blocked/stale reason, or N/A because no browser/manual evidence was used";
};

requireText("Review frame:");
requireText("fixed point resolved SHA");
requireText("reviewed HEAD SHA");
requireText("diff command");
requireText("commits");
requireText("worktree scope");
requireText("spec source");
requireText("## Standards");
requireText("Fallback used:");
requireText("Delegation policy source:");
requireText("Sources reviewed:");
requireText("Smell baseline applied:");
requireText("## Spec");
requireText("Findings:");
requireMatch(/Axis summary:\s*Standards\s+.+?,\s*Spec\s+.+/i, "axis summary");

const gateLine = requireGateLine();
const gateSaysChildFamily = /\bchild table\s+yes\b/i.test(gateLine);
const gateSaysImmediateFix = /\bimmediate-fix block\s+yes\b/i.test(gateLine);
const gateSaysCloseoutLine = /\bcloseout line\s+yes\b/i.test(gateLine);
const gateSaysTddYes = /\btdd fielded closeout gate\s+yes\b/i.test(gateLine);
const shouldRequireImplementLine = flags.has("--implement") || gateSaysCloseoutLine;
const shouldRequireChildFamily = flags.has("--child-family") || gateSaysChildFamily;
const shouldRequireImmediateFix = flags.has("--immediate-fix") || gateSaysImmediateFix;
const shouldRunTddValidator = flags.has("--tdd") || flags.has("--tdd-parent-rollup") || gateSaysTddYes;

if (shouldRequireImplementLine) {
  requireMatch(/^Review fallback:\s+\S.+$/m, "exact Review fallback closeout-ready line");
}

if (shouldRequireChildFamily) {
  requireText("| Issue | Acceptance source | Evidence reviewed | Findings/residuals |", "PRD child coverage table header");
  requireText("|---|---|---|---|", "PRD child coverage table separator");
}

if (shouldRequireImmediateFix) {
  for (const token of [
    "Findings found",
    "Fixes made",
    "TDD/review-fix evidence",
    "TDD closeout gate",
    "Verification rerun",
    "Browser/manual evidence freshness",
    "Commit handling",
    "Residual findings"
  ]) {
    requireText(token);
  }

  const freshnessValue = extractFieldValue("Browser/manual evidence freshness");
  const freshnessError = validateFreshnessValue(freshnessValue);
  if (freshnessError) {
    errors.push(`Browser/manual evidence freshness ${freshnessError}`);
  }
}

if (shouldRunTddValidator) {
  requireText("TDD closeout gate");
  requireText("TDD evidence gate passed:");

  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const tddValidator = resolve(scriptDir, "../../tdd/scripts/validate-tdd-closeout-body.mjs");
  if (!existsSync(tddValidator)) {
    errors.push(`missing TDD validator at ${tddValidator}`);
  } else {
    const tddArgs = [tddValidator, file];
    if (flags.has("--tdd-parent-rollup")) tddArgs.push("--parent-rollup");
    const result = spawnSync(process.execPath, tddArgs, { encoding: "utf8" });
    if (result.status !== 0) {
      errors.push(formatNestedResult("TDD validator", process.execPath, tddArgs, result));
    }
  }
}

forbidMatch(/<ref>|<sha>|<issues\/spec paths>|<yes\/no>|<commands>|<count and short titles>/, "unresolved fallback placeholder");

if (errors.length) {
  console.error(`Review fallback body validation failed for ${file}:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Review fallback body validation passed: ${file}`);
