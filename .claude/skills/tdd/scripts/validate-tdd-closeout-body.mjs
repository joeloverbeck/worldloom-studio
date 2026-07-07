#!/usr/bin/env node

import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const file = args.find((arg) => !arg.startsWith("--"));
const flags = new Set(args.filter((arg) => arg.startsWith("--")));

const usage = `Usage: node .claude/skills/tdd/scripts/validate-tdd-closeout-body.mjs <body.md> [--parent-rollup]`;

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

const compactHeader =
  "| Issue | CONTEXT.md status | ADRs/principles/docs status | Seam | Red command/failure | Green command or evidence | Acceptance covered | Review fix / red-first skip reason |";
const compactSeparator = "|---|---|---|---|---|---|---|---|";
const summaryHeader = "| Issue | Seam | Red-first status | Green verification |";
const gatePrefix = "TDD evidence gate passed:";
const requiredGateLabels = [
  "durable sink",
  "compact table/header",
  "seams accounted for",
  "CONTEXT.md status",
  "ADRs/principles/docs status",
  "partial-red / red-first skip reasons",
  "evidence-only rows"
];
const equivalentFieldLabels = [
  "Issue",
  "CONTEXT.md status",
  "ADRs/principles/docs status",
  "Seam",
  "Red command/failure",
  "Green command or evidence",
  "Acceptance covered"
];
const reviewFixEquivalentLabels = [
  "Finding:",
  "Intended red command/failure:",
  "Green command/evidence:",
  "Updated TDD table row:",
  "Browser/manual freshness:"
];

const requireText = (needle, label = needle) => {
  if (!body.includes(needle)) errors.push(`missing ${label}`);
};

const forbidText = (needle, label = needle) => {
  if (body.includes(needle)) errors.push(`forbidden ${label}`);
};

const requireGateLine = () => {
  const line = body
    .split(/\r?\n/)
    .map((candidate) => candidate.trim())
    .find((candidate) => candidate.startsWith(gatePrefix));

  if (!line) {
    errors.push("missing TDD evidence gate line");
    return "";
  }

  for (const label of requiredGateLabels) {
    if (!line.includes(label)) errors.push(`gate line missing ${label}`);
  }

  if (/TDD evidence gate passed:\s*yes\b/i.test(line)) {
    errors.push("gate line uses forbidden shorthand yes");
  }

  return line;
};

const splitTableRow = (line) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

const compactRows = [];
const lines = body.split(/\r?\n/);

for (let index = 0; index < lines.length; index += 1) {
  if (lines[index].trim() !== compactHeader) continue;
  for (let rowIndex = index + 2; rowIndex < lines.length; rowIndex += 1) {
    const line = lines[rowIndex].trim();
    if (!line.startsWith("|")) break;
    const cells = splitTableRow(line);
    if (/^#\d+/.test(cells[0] ?? "")) {
      compactRows.push({ lineNumber: rowIndex + 1, cells });
    }
  }
}

const hasConcreteRedEvidence = (cell) => {
  const normalized = cell.replace(/\s+/g, " ").trim();

  if (/^(N\/A|not applicable)\b.+\bbecause\b/i.test(normalized)) return true;
  if (/\bred-first skipped\b.+\bbecause\b/i.test(normalized)) return true;
  if (/\bpartial red - wrong reason:/i.test(normalized)) return true;
  if (/\bcoverage-only review fix\b/i.test(normalized)) return true;
  if (/\bexisting contract-change expectation\b/i.test(normalized)) return true;
  if (/\b(shared[- ]red[- ]command|same red command as|linked shared red command)\b/i.test(normalized)) return true;

  return /`[^`]+`/.test(normalized) && /\b(fail(?:ed|ing|ure)?|expected failure|assertion|error|exit code|no test files|red)\b/i.test(normalized);
};

const reviewCellNeedsAddendum = (cell) => {
  const normalized = cell.replace(/\s+/g, " ").trim();
  if (!normalized || /^N\/A\b/i.test(normalized)) return false;
  if (/\bexisting-test contract-change expectation\b/i.test(normalized)) return false;
  return /\b(review[- ]fix|finding fixed|coverage-only|partial-red|red-first skip)\b/i.test(normalized);
};

const gateLine = requireGateLine();
const hasCompactHeader = body.includes(compactHeader);
const hasCompactSeparator = body.includes(compactSeparator);
const hasSummaryHeader = body.includes(summaryHeader);
const claimsCompact =
  /compact table\/header\s+present(?:\s+after\s+structural\s+check)?/i.test(gateLine);
const claimsEquivalent =
  /equivalent fields present(?:\s+after\s+structural\s+check)?/i.test(gateLine);

requireText("TDD closeout preflight");

if (claimsCompact) {
  if (!hasCompactHeader) errors.push("claims compact table/header present but exact compact TDD header is missing");
  if (!hasCompactSeparator) errors.push("claims compact table/header present but exact compact TDD separator is missing");
}

if (hasSummaryHeader && claimsCompact && !hasCompactHeader) {
  errors.push("four-column summary table cannot satisfy compact table/header present");
}

if (flags.has("--parent-rollup")) {
  if (!hasCompactHeader) errors.push("--parent-rollup requires exact parent-rollup-ready compact TDD table header");
  if (!hasCompactSeparator) errors.push("--parent-rollup requires exact compact TDD table separator");
  if (claimsEquivalent && !hasCompactHeader) {
    errors.push("--parent-rollup cannot rely on equivalent fields without a linked compact table");
  }
}

if (!hasCompactHeader) {
  if (!claimsEquivalent) {
    errors.push("missing compact table header and gate line does not claim equivalent fields present");
  }
  for (const label of equivalentFieldLabels) {
    if (!body.includes(label)) errors.push(`equivalent-field body missing ${label}`);
  }
  if (hasSummaryHeader) {
    errors.push("four-column summary table is not equivalent fields; add missing per-row fields or the compact table");
  }
}

if (hasCompactHeader && !compactRows.length) {
  errors.push("compact TDD table has no issue rows");
}

const reviewFixRows = [];

for (const { lineNumber, cells } of compactRows) {
  if (cells.length < 8) {
    errors.push(`compact TDD row ${lineNumber} has ${cells.length} cells; expected 8`);
    continue;
  }

  const redCell = cells[4];
  if (!hasConcreteRedEvidence(redCell)) {
    errors.push(
      `compact TDD row ${lineNumber} red command/failure is not concrete: ${redCell}`
    );
  }

  if (reviewCellNeedsAddendum(cells[7])) {
    reviewFixRows.push(lineNumber);
  }
}

const hasReviewFixSignal =
  reviewFixRows.length > 0 ||
  /TDD\/review-fix evidence|Review-fix red evidence|TDD review-fix addendum:/i.test(body);
const hasReviewFixAddendum = body.includes("TDD review-fix addendum:");
const hasReviewFixEquivalent = reviewFixEquivalentLabels.every((label) => body.includes(label));

if (hasReviewFixSignal && !hasReviewFixAddendum && !hasReviewFixEquivalent) {
  errors.push(
    "review fix evidence must include TDD review-fix addendum or equivalent Finding/Intended red/Green/Updated row/Browser freshness fields"
  );
}

forbidText("TDD evidence gate passed: yes", "TDD evidence gate shorthand");

if (errors.length) {
  console.error(`TDD closeout body validation failed for ${file}:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`TDD closeout body validation passed: ${file}`);
