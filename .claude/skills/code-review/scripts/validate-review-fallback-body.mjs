#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { validateTddCloseoutBody } from "../../tdd/scripts/validate-tdd-closeout-body.mjs";

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

const gateLabels = [
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
];

const normalizeGateLabel = (label) => label.toLowerCase();

const parseGateFields = (line) => {
  const fields = new Map();
  const body = line.replace(/^Review fallback gate passed:\s*/i, "");

  for (const segment of body.split(";")) {
    const trimmed = segment.trim().replace(/\.$/, "");

    for (const label of gateLabels) {
      const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const match = trimmed.match(new RegExp(`^${escapedLabel}\\s+(.+)$`, "i"));
      if (match) {
        fields.set(normalizeGateLabel(label), match[1].trim());
        break;
      }
    }
  }

  return fields;
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

  for (const label of gateLabels) {
    if (!line.includes(label)) errors.push(`gate line missing ${label}`);
  }

  return line;
};

const requireGateValue = (fields, label, allowedValues, allowedDescription) => {
  const value = fields.get(normalizeGateLabel(label));

  if (!value) {
    errors.push(`gate line missing value for ${label}`);
    return;
  }

  if (!allowedValues.some((regex) => regex.test(value))) {
    errors.push(`gate line ${label} must be ${allowedDescription}; got ${value}`);
  }
};

const extractFieldValue = (label) => {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = body.match(new RegExp(`^\\s*-?\\s*(?:\\*\\*)?${escapedLabel}(?:\\*\\*)?:\\s*(.+)$`, "im"));
  return match?.[1]?.trim() || "";
};

const extractLooseValue = (label) => {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = body.match(new RegExp(`\\b${escapedLabel}\\b\\s*:?\\s*([^\\n;]+)`, "i"));
  return match?.[1]?.trim().replace(/[.`]+$/g, "") || "";
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

  const namesChangedPath =
    /\bchanged (path|file|surface)s?\b/i.test(normalized) ||
    /`[^`]+`/.test(normalized) ||
    /(?:^|[\s(])(?:\.{0,2}\/)?[\w@.-]+(?:\/[\w@.-]+)+(?:[:),;.]|$)/.test(normalized) ||
    /\b[\w@.-]+\.(?:ts|tsx|js|mjs|md|json|sqlite|png)\b/.test(normalized);
  const namesUnaffectedEvidence = /\b(route|action|API|fixture|browser-consumed|UI)\b/i.test(normalized);
  const hasTargetedProof = /\btargeted proof\b|\btargeted .*passed\b|\bfocused .*passed\b|\breran targeted\b/i.test(normalized);
  const isNonSemantic =
    /\b(non-semantic|formatting|formatting-only|indentation|indentation-only|comment wording|docs?-only|documentation-only|closeout-text-only)\b/i.test(
      normalized
    );
  const hasNonSemanticProof =
    /\bdiff inspected\b|\btargeted proof\b|\btargeted .*passed\b|\bgit diff --check\b|\broot gates? (?:re)?ran\b|\bpnpm (test|typecheck|build)\b/i.test(
      normalized
    );

  if (/\bnot affected\b/i.test(normalized)) {
    if (namesChangedPath && namesUnaffectedEvidence && hasTargetedProof) return "";
    if (isNonSemantic && namesChangedPath && namesUnaffectedEvidence && hasNonSemanticProof) return "";
    return "uses not affected without changed path, unaffected evidence route/action/API/fixture, and targeted proof";
  }

  if (isNonSemantic) {
    if (namesChangedPath && namesUnaffectedEvidence && hasNonSemanticProof) return "";
    return "uses non-semantic freshness without changed path, unaffected evidence route/action/API/fixture, and proof";
  }

  return "must state rerun proof, justified not affected, blocked/stale reason, non-semantic proof, or N/A because no browser/manual evidence was used";
};

const validateConsoleStateValue = (value) => {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return "is empty";
  if (/^<.*>$/.test(normalized)) return "is unresolved placeholder";
  if (/^N\/A\b.+\bbecause\b/i.test(normalized)) return "";
  if (/\b0 errors?\b.+\b0 warnings?\b/i.test(normalized)) return "";
  if (/\bno console (errors?|warnings?)\b/i.test(normalized)) return "";
  if (/\bclassified unrelated\b.+\b(evidence|because|source|reason)\b/i.test(normalized)) return "";
  if (/\brerun clean session\b.+\b(HMR|hot reload|reused session|tainted proof)\b/i.test(normalized)) return "";
  if (/\bclean browser session\b.+\b(passed|0 errors?|0 warnings?|observed)\b/i.test(normalized)) return "";
  if (/\b(blocked|unavailable|not available)\b.+\b(because|reason|unable|cannot)\b/i.test(normalized)) return "";
  return "must state clean console, classified unrelated output, clean-session rerun, blocked/unavailable reason, or N/A because no browser/manual evidence was used";
};

const splitMarkdownTableRow = (row) => row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());

const sourceEnumeratesAcceptanceItems = (source) =>
  /\b(?:AC|A)\s*#?\d+\b/i.test(source) ||
  /\b(?:acceptance item|acceptance criterion|criterion|criteria|checkbox|checklist item|user story|story)\s*#?\d+\b/i.test(source);

const sourceCitesExactAcceptanceRows = (source) =>
  /\b(?:exact\s+)?(?:acceptance|criterion|checkbox|audit|closeout)\s+(?:table|rows?)\b/i.test(source) &&
  /\b(?:row|rows?|range|below|above|adjacent|#\d+)\b/i.test(source);

const cellClaimsNoResidualFindings = (cell) =>
  /\b(?:no findings|none|no residuals?|residuals?\s+none|0 residuals?)\b/i.test(cell);

const findRowsAfterTableHeader = (header) => {
  const lines = body.split(/\r?\n/);
  const headerIndex = lines.findIndex((line) => line.trim() === header);
  if (headerIndex === -1) return [];

  const rows = [];
  for (const line of lines.slice(headerIndex + 2)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) break;
    rows.push(trimmed);
  }
  return rows;
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

const fixedPointSha = extractLooseValue("fixed point resolved SHA").match(/\b[0-9a-f]{7,40}\b/i)?.[0] || "";
const diffCommandValue = extractLooseValue("diff command");
if (fixedPointSha && diffCommandValue && !diffCommandValue.includes(fixedPointSha)) {
  errors.push(
    `diff command must use resolved fixed-point SHA ${fixedPointSha}; relative refs such as HEAD~1 are fixed-point input only`
  );
}

const gateLine = requireGateLine();
const gateFields = parseGateFields(gateLine);
const gateSaysChildFamily = /\bchild table\s+yes\b/i.test(gateLine);
const gateSaysImmediateFix = /\bimmediate-fix block\s+yes\b/i.test(gateLine);
const gateSaysCloseoutLine = /\bcloseout line\s+yes\b/i.test(gateLine);
const gateSaysTddYes = /\btdd fielded closeout gate\s+yes\b/i.test(gateLine);
const shouldRequireImplementLine = flags.has("--implement") || gateSaysCloseoutLine;
const shouldRequireChildFamily = flags.has("--child-family") || gateSaysChildFamily;
const shouldRequireImmediateFix = flags.has("--immediate-fix") || gateSaysImmediateFix;
const shouldRunTddValidator = flags.has("--tdd") || flags.has("--tdd-parent-rollup") || gateSaysTddYes;

const yesOnly = [/^yes$/i];
const yesOrNA = [/^yes$/i, /^N\/A$/i];
const tddYesAfterStructuralCheck = [/^yes after structural check$/i];
const tddYesAfterStructuralCheckOrNA = [/^yes after structural check$/i, /^N\/A$/i];

requireGateValue(gateFields, "frame", yesOnly, "yes");
requireGateValue(gateFields, "delegation policy source", yesOnly, "yes");
requireGateValue(gateFields, "Standards", yesOnly, "yes");
requireGateValue(gateFields, "Spec", yesOnly, "yes");
requireGateValue(
  gateFields,
  "child table",
  flags.has("--child-family") ? yesOnly : yesOrNA,
  flags.has("--child-family") ? "yes when --child-family is used" : "yes or N/A"
);
requireGateValue(gateFields, "smell baseline", yesOnly, "yes");
requireGateValue(gateFields, "found-vs-residual", yesOrNA, "yes or N/A");
requireGateValue(
  gateFields,
  "closeout line",
  flags.has("--implement") ? yesOnly : yesOrNA,
  flags.has("--implement") ? "yes when --implement is used" : "yes or N/A"
);
requireGateValue(
  gateFields,
  "immediate-fix block",
  flags.has("--immediate-fix") ? yesOnly : yesOrNA,
  flags.has("--immediate-fix") ? "yes when --immediate-fix is used" : "yes or N/A"
);
requireGateValue(
  gateFields,
  "tdd fielded closeout gate",
  flags.has("--tdd") || flags.has("--tdd-parent-rollup") ? tddYesAfterStructuralCheck : tddYesAfterStructuralCheckOrNA,
  flags.has("--tdd") || flags.has("--tdd-parent-rollup")
    ? "yes after structural check when TDD validation is requested"
    : "yes after structural check or N/A"
);
requireGateValue(gateFields, "verification/browser freshness", yesOrNA, "yes or N/A");

if (shouldRequireImplementLine) {
  requireMatch(/^Review fallback:\s+\S.+$/m, "exact Review fallback closeout-ready line");
  forbidMatch(/^\s*-?\s*Review:\s+.*\bfallback\b/im, "fallback review evidence labeled Review: instead of Review fallback:");
}

if (shouldRequireChildFamily) {
  const childTableHeader = "| Issue | Acceptance source | Evidence reviewed | Findings/residuals |";
  requireText(childTableHeader, "PRD child coverage table header");
  requireText("|---|---|---|---|", "PRD child coverage table separator");

  const childRows = findRowsAfterTableHeader(childTableHeader);
  const childIssueRows = childRows.filter((row) => {
    const cells = splitMarkdownTableRow(row);
    return cells.length >= 4 && /^#\d+\b/.test(cells[0]);
  });

  if (!childIssueRows.length) {
    errors.push("PRD child coverage table has no issue rows");
  }

  const rowsByIssue = new Map();
  for (const row of childIssueRows) {
    const [issue] = splitMarkdownTableRow(row);
    rowsByIssue.set(issue, (rowsByIssue.get(issue) ?? 0) + 1);
  }

  for (const row of childIssueRows) {
    const cells = splitMarkdownTableRow(row);
    const [issue, acceptanceSource, , findingsCell] = cells;
    const isSplitAcrossRows = (rowsByIssue.get(issue) ?? 0) > 1;
    if (
      cellClaimsNoResidualFindings(findingsCell ?? "") &&
      !isSplitAcrossRows &&
      !sourceEnumeratesAcceptanceItems(acceptanceSource ?? "") &&
      !sourceCitesExactAcceptanceRows(acceptanceSource ?? "")
    ) {
      errors.push(
        `PRD child coverage row ${issue} acceptance source is too broad for zero residual Spec findings; enumerate exact acceptance items or cite adjacent exact acceptance table rows: ${acceptanceSource}`
      );
    }
  }
}

if (shouldRequireImmediateFix) {
  for (const token of [
    "Findings found",
    "Fixes made",
    "TDD/review-fix evidence",
    "TDD closeout gate",
    "Verification rerun",
    "Browser/manual evidence freshness",
    "Browser/manual console state",
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

  const consoleStateValue = extractFieldValue("Browser/manual console state");
  const consoleStateError = validateConsoleStateValue(consoleStateValue);
  if (consoleStateError) {
    errors.push(`Browser/manual console state ${consoleStateError}`);
  }
}

if (shouldRunTddValidator) {
  requireText("TDD closeout gate");
  requireText("TDD evidence gate passed:");

  const tddFlags = flags.has("--tdd-parent-rollup") ? ["--parent-rollup"] : [];
  const tddErrors = validateTddCloseoutBody(body, { flags: tddFlags });
  if (tddErrors.length) {
    errors.push(`TDD validator failed:\n${tddErrors.map((error) => `- ${error}`).join("\n")}`);
  }
}

forbidMatch(/<ref>|<sha>|<issues\/spec paths>|<yes\/no>|<commands>|<count and short titles>/, "unresolved fallback placeholder");

if (errors.length) {
  console.error(`Review fallback body validation failed for ${file}:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Review fallback body validation passed: ${file}`);
