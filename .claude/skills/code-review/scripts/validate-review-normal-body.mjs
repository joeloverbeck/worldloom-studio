#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { validateTddCloseoutBody } from "../../tdd/scripts/validate-tdd-closeout-body.mjs";

const usage =
  "Usage: node .claude/skills/code-review/scripts/validate-review-normal-body.mjs <body.md> [--immediate-fix] [--parent-prd] [--browser] [--tdd] [--tdd-parent-rollup]";

const fieldPattern = (label) => {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^\\s*[-*]?\\s*(?:\\*\\*)?${escaped}(?:\\*\\*)?:\\s*(.+)$`, "im");
};

const fieldValue = (text, label) => text.match(fieldPattern(label))?.[1]?.trim() ?? "";

const unresolvedValue = (value) =>
  !value ||
  /^<.*>$/.test(value) ||
  /\b(?:TBD|TODO|pending|unknown)\b/i.test(value) ||
  /<[^>]+>/.test(value);

const validateRevisitTrigger = (value) => {
  if (unresolvedValue(value)) return "is empty or unresolved";
  if (/^N\/A\b/i.test(value) && !/^N\/A because permanently accepted judgement\b/i.test(value)) {
    return "must use 'N/A because permanently accepted judgement' for a permanent decision";
  }
  if (/^(?:later|future|if needed|when needed|none)$/i.test(value)) {
    return "must name a concrete reopening condition";
  }
  return "";
};

const acceptedResidualRecords = (body) => {
  const lines = body.split(/\r?\n/);
  const starts = [];

  for (let index = 0; index < lines.length; index += 1) {
    if (/^\s*[-*]?\s*(?:\*\*)?Accepted residual(?:\*\*)?:/i.test(lines[index])) {
      starts.push(index);
    }
  }

  return starts.map((start, index) => {
    const end = starts[index + 1] ?? lines.length;
    return lines.slice(start, end).join("\n");
  });
};

export const validateAcceptedResiduals = (body, errors) => {
  const claimsAcceptedResiduals = /\baccepted residuals?\b/i.test(body);
  const records = acceptedResidualRecords(body);

  if (claimsAcceptedResiduals && records.length === 0) {
    errors.push("accepted residuals require one structured Accepted residual record per finding");
    return;
  }

  for (const [index, record] of records.entries()) {
    const number = index + 1;
    const title = fieldValue(record, "Accepted residual");
    const axis = fieldValue(record, "Axis");
    const source = fieldValue(record, "Source");
    const rationale = fieldValue(record, "Rationale");
    const revisitTrigger = fieldValue(record, "Revisit trigger");

    if (unresolvedValue(title)) errors.push(`accepted residual ${number} has no concrete title`);
    if (!/^(?:Standards|Spec)$/i.test(axis)) {
      errors.push(`accepted residual ${number} Axis must be Standards or Spec`);
    }
    if (unresolvedValue(source)) errors.push(`accepted residual ${number} has no concrete Source`);
    if (unresolvedValue(rationale)) errors.push(`accepted residual ${number} has no concrete Rationale`);

    const triggerError = validateRevisitTrigger(revisitTrigger);
    if (triggerError) errors.push(`accepted residual ${number} Revisit trigger ${triggerError}`);
  }

  if (records.length && !/unhandled findings\s+none beyond accepted residuals/i.test(body)) {
    errors.push("accepted residuals require 'unhandled findings none beyond accepted residuals'");
  }
};

const validateSubagentStatuses = (value, errors, options = {}) => {
  if (unresolvedValue(value)) {
    errors.push("Review subagents is empty or unresolved");
    return;
  }
  if (/\b(?:running|pending|active|still-running|cleanup failed)\b/i.test(value)) {
    errors.push("Review subagents includes a non-terminal or failed-cleanup status");
  }

  for (const [axis, otherAxis] of [["Standards", "Spec"], ["Spec", "Standards"]]) {
    const start = value.search(new RegExp(`\\b${axis}\\b`, "i"));
    const otherStart = start < 0 ? -1 : value.slice(start + axis.length).search(new RegExp(`\\b${otherAxis}\\b`, "i"));
    const end = otherStart < 0 ? value.length : start + axis.length + otherStart;
    const axisBlock = start < 0 ? "" : value.slice(start, end);
    if (!/\b(?:completed|complete|closed|done)\b/i.test(axisBlock)) {
      errors.push(`Review subagents must name the ${axis} reviewer and a terminal final status`);
    }
    if (options.requireFinal && !/\bfinal\b.+\b(?:completed|complete|closed|done)\b/i.test(axisBlock)) {
      errors.push(`Review subagents must name the final ${axis} reviewer and terminal status after fixes`);
    }
  }
};

const validateFreshnessValue = (value) => {
  if (unresolvedValue(value)) return "is empty or unresolved";
  if (/^N\/A\b.+\bbecause\b.+\bno browser\/manual evidence was used\b/i.test(value)) return "";
  if (/\b(?:reran|re-ran|rerun|smoke)\b.+\b(?:passed|observed|result|artifact|screenshot)\b/i.test(value)) {
    return "";
  }
  if (/\b(?:blocked|stale)\b.+\b(?:because|reason|unable|cannot)\b/i.test(value)) return "";
  if (
    /\bnot affected because\b/i.test(value) &&
    /(?:`[^`]+`|[\w@.-]+\.(?:ts|tsx|js|mjs|md|json))/.test(value) &&
    /\b(?:targeted proof|diff inspected|git diff HEAD)\b/i.test(value)
  ) {
    return "";
  }
  return "must state final-tree rerun proof, a justified not-affected path with proof, a blocked/stale reason, or N/A because no browser/manual evidence was used";
};

const validateConsoleStateValue = (value) => {
  if (unresolvedValue(value)) return "is empty or unresolved";
  if (/^N\/A\b.+\bbecause\b.+\bno browser\/manual evidence was used\b/i.test(value)) return "";
  if (/\b0 errors?\b.+\b0 warnings?\b/i.test(value) || /\bno console (?:errors?|warnings?)\b/i.test(value)) {
    return "";
  }
  if (/\bclassified unrelated\b.+\b(?:evidence|because|source|reason)\b/i.test(value)) return "";
  if (/\b(?:blocked|unavailable)\b.+\b(?:because|reason|unable|cannot)\b/i.test(value)) return "";
  return "must state a clean console, classified unrelated output, a blocked reason, or N/A because no browser/manual evidence was used";
};

const validateRegressionDurability = (body, errors) => {
  const intendedRed = fieldValue(body, "Intended red command/failure");
  if (!intendedRed || !/\b(?:browser|Playwright|waitForResponse|manual probe|page\.)\b/i.test(intendedRed)) return;

  const durability = fieldValue(body, "Regression durability");
  if (unresolvedValue(durability)) {
    errors.push("transient browser/manual intended red requires Regression durability");
    return;
  }
  if (/^N\/A\b/i.test(durability)) {
    errors.push("Regression durability cannot be N/A for a transient browser/manual intended red");
  }
};

export const validateReviewNormalBody = (body, options = {}) => {
  const flags = new Set(options.flags ?? []);
  const errors = [];
  const requireText = (needle, label = needle) => {
    if (!body.includes(needle)) errors.push(`missing ${label}`);
  };
  const requireMatch = (regex, label) => {
    if (!regex.test(body)) errors.push(`missing ${label}`);
  };
  const requireField = (label) => {
    const value = fieldValue(body, label);
    if (unresolvedValue(value)) errors.push(`${label} is empty or unresolved`);
    return value;
  };

  requireText("## Standards");
  requireText("## Spec");
  requireMatch(/^\s*[-*]?\s*Review:\s+code-review against\s+\S.+$/im, "normal Review: evidence line");
  if (/^\s*[-*]?\s*Review fallback:/im.test(body) || body.includes("Review fallback gate passed:")) {
    errors.push("normal review body contains fallback evidence or labeling");
  }

  const immediateFix = flags.has("--immediate-fix") || fieldPattern("Findings found").test(body);
  validateSubagentStatuses(requireField("Review subagents"), errors, { requireFinal: immediateFix });
  const axisSummary = requireField("Axis summary");
  if (!/^Standards\s+.+?,\s*Spec\s+.+/i.test(axisSummary)) {
    errors.push("Axis summary must report Standards and Spec separately");
  }

  const residualFindings = requireField("Residual findings");
  const hasAcceptedResiduals = /\baccepted residuals?\b/i.test(body);
  if (!/^none\b/i.test(residualFindings) && !hasAcceptedResiduals) {
    errors.push("Residual findings must be none or fully recorded as accepted residuals");
  }
  validateAcceptedResiduals(body, errors);

  if (flags.has("--parent-prd")) {
    const parentCoverage = requireField("Parent PRD coverage");
    if (/^N\/A\b/i.test(parentCoverage)) {
      errors.push("Parent PRD coverage cannot be N/A when --parent-prd is used");
    }
  }

  if (immediateFix) {
    for (const label of [
      "Initial Standards outcome",
      "Initial Spec outcome",
      "Final Standards outcome",
      "Final Spec outcome",
      "Findings found",
      "Fixes made",
      "TDD/review-fix evidence",
      "TDD closeout gate",
      "Verification rerun",
      "Browser/manual evidence freshness",
      "Browser/manual console state",
      "Commit handling"
    ]) {
      requireField(label);
    }
    requireMatch(/^\s*[-*]?\s*Review:\s+.+\boutcome\s+findings fixed\b/im, "immediate-fix Review: outcome");
  }

  if (flags.has("--browser") || immediateFix) {
    const freshnessValue = fieldValue(body, "Browser/manual evidence freshness");
    const freshnessError = validateFreshnessValue(freshnessValue);
    if (freshnessError) errors.push(`Browser/manual evidence freshness ${freshnessError}`);
    const consoleValue = fieldValue(body, "Browser/manual console state");
    const consoleError = validateConsoleStateValue(consoleValue);
    if (consoleError) errors.push(`Browser/manual console state ${consoleError}`);
    if (flags.has("--browser") && (/^N\/A\b/i.test(freshnessValue) || /^N\/A\b/i.test(consoleValue))) {
      errors.push("--browser requires current browser/manual freshness and console evidence, not N/A");
    }
  }

  validateRegressionDurability(body, errors);

  const shouldRunTddValidator =
    flags.has("--tdd") || flags.has("--tdd-parent-rollup") || body.includes("TDD evidence gate passed:");
  if (shouldRunTddValidator) {
    const tddFlags = flags.has("--tdd-parent-rollup") ? ["--parent-rollup"] : [];
    const tddErrors = validateTddCloseoutBody(body, { flags: tddFlags });
    if (tddErrors.length) {
      errors.push(`TDD validator failed:\n${tddErrors.map((error) => `- ${error}`).join("\n")}`);
    }
  }

  if (/<(?:fixed point|count\/worst|commands|title|Standards \/ Spec|reviewer finding)[^>]*>/i.test(body)) {
    errors.push("body contains unresolved normal-review placeholders");
  }

  return errors;
};

const isCli = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isCli) {
  const args = process.argv.slice(2);
  const file = args.find((arg) => !arg.startsWith("--"));
  const flags = args.filter((arg) => arg.startsWith("--"));

  if (flags.includes("--help")) {
    console.error(usage);
    process.exit(0);
  }
  if (!file) {
    console.error(usage);
    process.exit(2);
  }

  const errors = validateReviewNormalBody(readFileSync(file, "utf8"), { flags });
  if (errors.length) {
    console.error(`Normal review body validation failed for ${file}:`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`Normal review body validation passed: ${file}`);
}
