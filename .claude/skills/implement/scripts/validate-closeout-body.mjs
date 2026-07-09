#!/usr/bin/env node

import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const file = args.find((arg) => !arg.startsWith("--"));
const flags = new Set(args.filter((arg) => arg.startsWith("--")));

const usage = `Usage: node .claude/skills/implement/scripts/validate-closeout-body.mjs <body.md> [--closing] [--principles] [--local-only] [--fixed-child | --fixed-child-pending] [--review-fallback]`;

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

requireText("Final SHA:");
requireMatch(/(^|\n)(#{1,6}\s*)?Verification\b:?/i, "verification evidence");
requireMatch(/TDD evidence gate passed:|N\/A because no tdd skill was invoked/i, "TDD evidence or explicit N/A");
requireMatch(/Review:|Review fallback:/, "review evidence");
requireMatch(/Browser evidence:|browser evidence|browser smoke/i, "browser evidence or N/A");
requireMatch(/Console state:|Browser console state:|browser console state recorded/i, "browser console state or N/A");
requireMatch(/Final freshness delta|Browser\/manual evidence freshness|final browser\/manual freshness/i, "final browser/manual freshness");
requireText("| Issue | Acceptance criterion or conformance check | Evidence | Status |", "audit table header");
requireText("Closeout body check passed:", "closeout body check line");
requireText("Closeout gate passed: audit sink", "closeout gate line");

if (flags.has("--principles")) {
  requireText("Principles/ADR conformance:");
}

if (flags.has("--local-only")) {
  requireMatch(
    /^Local-only SHA: .+ is not remote-reachable because .+; local-only closeout is acceptable because .+\.$/m,
    "copy-ready Local-only SHA sentence"
  );
  forbidMatch(/^Local-only SHA status:/m, "Local-only SHA status paraphrase");
}

if (flags.has("--fixed-child") && flags.has("--fixed-child-pending")) {
  errors.push("use only one of --fixed-child or --fixed-child-pending");
}

if (flags.has("--fixed-child")) {
  requireText("Fixed child inline close comment:");
  requireMatch(/Completed by [0-9a-f]{7,40}\. Evidence: https:\/\/github\.com\/\S+/i, "exact fixed child inline close comment with real URL");
}

if (flags.has("--fixed-child-pending")) {
  requireText("Fixed child inline close comment:");
  requireMatch(
    /^Fixed child inline close comment: .*this parent rollup comment URL/im,
    "fixed child inline close comment with stable self-referential parent URL wording"
  );
  forbidMatch(/^Fixed child inline close comment: .*parent URL pending/im, "posted fixed child pending placeholder");
  forbidMatch(/^Fixed child inline close comment: .*pending parent rollup URL/im, "posted fixed child pending placeholder");
}

if (flags.has("--review-fallback")) {
  for (const token of [
    "Review frame:",
    "fixed point resolved SHA",
    "reviewed HEAD SHA",
    "## Standards",
    "## Spec",
    "Smell baseline applied:",
    "Review fallback gate passed: frame",
    "Review fallback:"
  ]) {
    requireText(token);
  }
}

forbidMatch(/PARENT_ROLLUP_URL|<parent-rollup-url pending>|<sha>|<reason>|<issue>|<parent>|<child>/, "unresolved placeholder");

const lines = body.split(/\r?\n/);
const statusRows = [];
const auditHeader = "| Issue | Acceptance criterion or conformance check | Evidence | Status |";

for (let index = 0; index < lines.length; index += 1) {
  if (lines[index].trim() !== auditHeader) continue;
  for (let row = index + 2; row < lines.length; row += 1) {
    const line = lines[row].trim();
    if (!line.startsWith("|")) break;
    if (/^\|\s*#\d+/.test(line)) {
      statusRows.push(line.split("|").map((cell) => cell.trim()).filter(Boolean));
    }
  }
}

if (!statusRows.length) errors.push("audit table has no issue rows");

for (const cells of statusRows) {
  const status = cells.at(-1);
  if (!["satisfied", "blocked", "not done"].includes(status)) {
    errors.push(`invalid audit status "${status}" in row: | ${cells.join(" | ")} |`);
  }
  if (flags.has("--closing") && status !== "satisfied") {
    errors.push(`closing gate row is not satisfied: | ${cells.join(" | ")} |`);
  }
}

if (errors.length) {
  console.error(`Closeout body validation failed for ${file}:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Closeout body validation passed: ${file}`);
