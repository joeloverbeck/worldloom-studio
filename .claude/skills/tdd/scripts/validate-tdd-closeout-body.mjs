#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const usage = `Usage: node .claude/skills/tdd/scripts/validate-tdd-closeout-body.mjs <body.md> [--parent-rollup]`;

export const validateTddCloseoutBody = (body, options = {}) => {
  const flags = new Set(options.flags ?? []);
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
    "evidence-only rows",
    "existing-test contract-change rows"
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
  const requiredPreflightLabels = [
    "TDD closeout preflight:",
    "Durable sink/body inspected:",
    "Compact table/header:",
    "Rows accounted for:",
    "Pre-red recovery status:",
    "CONTEXT.md status:",
    "ADRs/principles/docs status:",
    "Partial-red / red-first skip reasons:",
    "Evidence-only rows freshness:",
    "Existing-test contract-change rows:"
  ];

  const requireText = (needle, label = needle) => {
    if (!body.includes(needle)) errors.push(`missing ${label}`);
  };

  const forbidText = (needle, label = needle) => {
    if (body.includes(needle)) errors.push(`forbidden ${label}`);
  };

  const forbidMatch = (regex, label) => {
    if (regex.test(body)) errors.push(`forbidden ${label}`);
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
  const firstLineMatching = (regex) =>
    lines.map((candidate) => candidate.trim()).find((candidate) => regex.test(candidate)) ?? "";

  const extractFieldValue = (label) => {
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = body.match(new RegExp(`^\\s*-?\\s*(?:\\*\\*)?${escapedLabel}(?:\\*\\*)?:\\s*(.+)$`, "im"));
    return match?.[1]?.trim() || "";
  };

  const validateFreshnessValue = (value) => {
    const normalized = value.replace(/\s+/g, " ").trim();
    if (!normalized) return "is empty";
    if (/^<.*>$/.test(normalized)) return "is unresolved placeholder";
    if (/^none\b/i.test(normalized)) return "";
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
    const isCommitMetadataOnly = /\b(?:git )?commit metadata only\b/i.test(normalized);
    const hasNoTrackedContentChange =
      /\bno tracked (?:file )?content changed\b/i.test(normalized) ||
      /\bno tracked files? changed\b/i.test(normalized) ||
      /\bno file content changed\b/i.test(normalized) ||
      /\bno content changes?\b/i.test(normalized) ||
      /\bsame\b.+\bcontent\b/i.test(normalized);
    const hasCommitMetadataProof = hasTargetedProof || /\bgit diff HEAD\b/i.test(normalized);
    const isNonSemantic =
      /\b(non-semantic|formatting|formatting-only|indentation|indentation-only|comment wording|docs?-only|documentation-only|closeout-text-only)\b/i.test(
        normalized
      );
    const hasNonSemanticProof =
      /\bdiff inspected\b|\btargeted proof\b|\btargeted .*passed\b|\bgit diff --check\b|\broot gates? (?:re)?ran\b|\bpnpm (test|typecheck|build)\b/i.test(
        normalized
      );

    if (isCommitMetadataOnly) {
      if (hasNoTrackedContentChange && namesUnaffectedEvidence && hasCommitMetadataProof) return "";
      return "uses commit-metadata-only freshness without no-tracked-content-change statement, unaffected evidence route/action/API/fixture, and git diff proof";
    }

    if (/\bnot affected\b/i.test(normalized)) {
      if (namesChangedPath && namesUnaffectedEvidence && hasTargetedProof) return "";
      if (isNonSemantic && namesChangedPath && namesUnaffectedEvidence && hasNonSemanticProof) return "";
      return "uses not affected without changed path, unaffected evidence route/action/API/fixture, and targeted proof";
    }

    if (isNonSemantic) {
      if (namesChangedPath && namesUnaffectedEvidence && hasNonSemanticProof) return "";
      return "uses non-semantic freshness without changed path, unaffected evidence route/action/API/fixture, and proof";
    }

    return "must state rerun proof, justified not affected, blocked/stale reason, non-semantic proof, N/A because, or none";
  };

  const validateConsoleStateValue = (value) => {
    const normalized = value.replace(/\s+/g, " ").trim();
    if (!normalized) return "is empty";
    if (/^<.*>$/.test(normalized)) return "is unresolved placeholder";
    if (/^none\b/i.test(normalized)) return "";
    if (/^N\/A\b.+\bbecause\b/i.test(normalized)) return "";
    if (/\b0 errors?\b.+\b0 warnings?\b/i.test(normalized)) return "";
    if (/\bno console (errors?|warnings?)\b/i.test(normalized)) return "";
    if (/\bclassified unrelated\b.+\b(evidence|because|source|reason)\b/i.test(normalized)) return "";
    if (/\brerun clean session\b.+\b(HMR|hot reload|reused session|agent-induced setup\/request error|tainted proof)\b/i.test(normalized)) {
      return "";
    }
    if (/\bclean browser session\b.+\b(passed|0 errors?|0 warnings?|observed)\b/i.test(normalized)) return "";
    if (/\b(blocked|unavailable|not available)\b.+\b(because|reason|unable|cannot)\b/i.test(normalized)) return "";
    return "must state clean console, classified unrelated output, clean-session rerun, blocked/unavailable reason, N/A because, or none";
  };

  const validatePreRedRecoveryStatusValue = (value) => {
    const normalized = value.replace(/\s+/g, " ").trim();
    if (!normalized) return "is empty";
    if (/^<.*>$/.test(normalized)) return "is unresolved placeholder";
    if (/^N\/A\b(?:\s*[-:]\s*|\s+because\s+).*pre-red preflight\/table was visible before first red/i.test(normalized)) {
      return "";
    }
    if (/^N\/A\b.+\bno red commands? (?:were )?run\b/i.test(normalized)) return "";
    if (/^N\/A\b.+\bno tdd skill was invoked\b/i.test(normalized)) return "";
    if (/\blisted with TDD recovery addendum\b/i.test(normalized)) return "";
    if (/\bblocked\b.+\b(because|reason|unable|cannot)\b/i.test(normalized)) return "";
    return "must state N/A because the pre-red preflight/table was visible before first red, listed with TDD recovery addendum, N/A because no red commands were run, or blocked because";
  };

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
    if (/\bcoverage-only existing behavior\b.+\bred-first N\/A because behavior already existed\b/i.test(normalized)) {
      return true;
    }
    if (/\bexisting contract-change expectation\b/i.test(normalized)) return true;
    if (/\b(shared[- ]red[- ]command|same red command as|linked shared red command)\b/i.test(normalized)) return true;

    return /`[^`]+`/.test(normalized) && /\b(fail(?:ed|ing|ure)?|expected failure|assertion|error|exit code|no test files|red)\b/i.test(normalized);
  };

  const reviewCellNeedsAddendum = (cell) => {
    const normalized = cell.replace(/\s+/g, " ").trim();
    if (!normalized || /^N\/A\b/i.test(normalized)) return false;
    if (/\bexisting-test contract-change expectation\b/i.test(normalized)) return false;
    if (/\bcoverage-only existing behavior\b/i.test(normalized)) return false;
    return /\b(review[- ]fix|finding fixed|coverage-only|partial-red|red-first skip)\b/i.test(normalized);
  };

  const gateLine = requireGateLine();
  const existingTestRowsField = firstLineMatching(/^-?\s*Existing-test contract-change rows:/i);
  const hasCompactHeader = body.includes(compactHeader);
  const hasCompactSeparator = body.includes(compactSeparator);
  const hasSummaryHeader = body.includes(summaryHeader);
  const claimsCompact =
    /compact table\/header\s+present(?:\s+after\s+structural\s+check)?/i.test(gateLine);
  const claimsEquivalent =
    /equivalent fields present(?:\s+after\s+structural\s+check)?/i.test(gateLine);

  for (const label of requiredPreflightLabels) {
    requireText(label, `fielded preflight label ${label}`);
  }
  requireText("Existing-test contract-change rows:", "existing-test contract-change rows field");
  forbidMatch(/\bpending tracker URL\b/i, "pending tracker URL placeholder");

  const evidenceFreshnessValue = extractFieldValue("Evidence-only rows freshness");
  const evidenceFreshnessError = validateFreshnessValue(evidenceFreshnessValue);
  if (evidenceFreshnessError) {
    errors.push(`Evidence-only rows freshness ${evidenceFreshnessError}`);
  }

  if (body.includes("Pre-red recovery status:")) {
    const preRedRecoveryStatusValue = extractFieldValue("Pre-red recovery status");
    const preRedRecoveryStatusError = validatePreRedRecoveryStatusValue(preRedRecoveryStatusValue);
    if (preRedRecoveryStatusError) {
      errors.push(`Pre-red recovery status ${preRedRecoveryStatusError}`);
    }
  }

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
  const existingTestRows = [];
  const browserManualEvidenceRows = [];

  for (const { lineNumber, cells } of compactRows) {
    if (cells.length < 8) {
      errors.push(`compact TDD row ${lineNumber} has ${cells.length} cells; expected 8`);
      continue;
    }

    const redCell = cells[4];
    if (!hasConcreteRedEvidence(redCell)) {
      errors.push(
        `compact TDD row ${lineNumber} red command/failure is not concrete: ${redCell}; for expectation rewrites use \`existing contract-change expectation in <test file> because ...\`, not \`existing-test contract-change expectation\``
      );
    }

    if (reviewCellNeedsAddendum(cells[7])) {
      reviewFixRows.push(lineNumber);
    }

    if ((cells[3] ?? "").trim() === "existing contract-change expectation") {
      existingTestRows.push(lineNumber);
    }

    const seamCell = cells[3] ?? "";
    const rowText = cells.join(" ");
    if (
      /\b(evidence-only|browser evidence|manual|walkthrough|screenshot)\b/i.test(seamCell) &&
      /\b(browser|manual|screenshot|walkthrough|route|action|Playwright|DOM|page)\b/i.test(rowText)
    ) {
      browserManualEvidenceRows.push(lineNumber);
    }
  }

  const consoleStateValue = extractFieldValue("Evidence-only browser console state");
  if (browserManualEvidenceRows.length && !consoleStateValue) {
    errors.push(
      `browser/manual evidence-only row(s) ${browserManualEvidenceRows.join(", ")} require Evidence-only browser console state`
    );
  }
  const consoleStateClaimsNoBrowserRows =
    /^none\b/i.test(consoleStateValue) ||
    /^N\/A\b.+no browser\/manual evidence-only rows\b/i.test(consoleStateValue);
  if (browserManualEvidenceRows.length && consoleStateClaimsNoBrowserRows) {
    errors.push(
      `browser/manual evidence-only row(s) ${browserManualEvidenceRows.join(", ")} cannot use Evidence-only browser console state ${consoleStateValue}`
    );
  }
  if (consoleStateValue) {
    const consoleStateError = validateConsoleStateValue(consoleStateValue);
    if (consoleStateError) {
      errors.push(`Evidence-only browser console state ${consoleStateError}`);
    }
  }

  const gateClaimsExistingTestsListed =
    /existing-test contract-change rows\s+(?!none\b)[^.;]+/i.test(gateLine);
  const gateClaimsExistingTestsNone =
    /existing-test contract-change rows\s+none\b/i.test(gateLine);
  const fieldClaimsExistingTestsNone = /:\s*none\b/i.test(existingTestRowsField);
  const fieldClaimsExistingTestsListed = existingTestRowsField !== "" && !fieldClaimsExistingTestsNone;

  if ((gateClaimsExistingTestsListed || fieldClaimsExistingTestsListed) && !existingTestRows.length) {
    errors.push(
      "listed existing-test contract-change rows require a compact table row with Seam `existing contract-change expectation`"
    );
  }

  if (existingTestRows.length && gateClaimsExistingTestsNone) {
    errors.push("gate line says existing-test contract-change rows none but compact table has existing contract-change expectation row(s)");
  }

  if (existingTestRows.length && fieldClaimsExistingTestsNone) {
    errors.push("preflight says Existing-test contract-change rows none but compact table has existing contract-change expectation row(s)");
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

  if (hasReviewFixSignal) {
    const browserFreshnessValue = extractFieldValue("Browser/manual freshness");
    const browserFreshnessError = validateFreshnessValue(browserFreshnessValue);
    if (browserFreshnessError) {
      errors.push(`Browser/manual freshness ${browserFreshnessError}`);
    }
  }

  forbidText("TDD evidence gate passed: yes", "TDD evidence gate shorthand");

  return errors;
};

const isCli = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isCli) {
  const args = process.argv.slice(2);
  const file = args.find((arg) => !arg.startsWith("--"));
  const flags = new Set(args.filter((arg) => arg.startsWith("--")));

  if (flags.has("--help")) {
    console.error(usage);
    process.exit(0);
  }

  if (!file) {
    console.error(usage);
    process.exit(2);
  }

  const body = readFileSync(file, "utf8");
  const errors = validateTddCloseoutBody(body, { flags });

  if (errors.length) {
    console.error(`TDD closeout body validation failed for ${file}:`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`TDD closeout body validation passed: ${file}`);
}
