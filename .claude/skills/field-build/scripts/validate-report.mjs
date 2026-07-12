#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const usage =
  "Usage: node .claude/skills/field-build/scripts/validate-report.mjs <report.md> <live-log.md> [--no-prior-report]";

const REQUIRED_REPORT_HEADINGS = [
  "## Findings",
  "## Decision-point log (evidence)",
  "## For the app (PRD seeds)",
  "## For the methodology",
  "## Frontier"
];

const REQUIRED_METADATA = [
  { label: "Date", pattern: /\*\*Date:\*\*\s*\S+/i },
  { label: "App commit", pattern: /\*\*App commit:\*\*\s*\S+/i },
  { label: "Method version", pattern: /\*\*Method version:\*\*\s*\S+/i },
  { label: "Essence", pattern: /\*\*Essence \(user seed\):\*\*\s*\S+/i },
  { label: "World file", pattern: /\*\*World file:\*\*\s*\S+/i },
  { label: "Path walked", pattern: /\*\*Path walked:\*\*\s*\S+/i },
  { label: "Evidence", pattern: /\*\*Evidence:\*\*\s*\S+/i },
  { label: "Prior-art frame", pattern: /\*\*Prior-art frame:\*\*\s*\S+/i }
];

const REQUIRED_FINDING_FIELDS = [
  "Severity",
  "Where",
  "What happened",
  "What the methodology requires",
  "The snag",
  "Fix direction",
  "Touches"
];

const ALLOWED_SEVERITIES = {
  P: new Set(["blocking", "friction", "cosmetic"]),
  R: new Set(["blocking", "friction", "cosmetic"]),
  M: new Set(["blocking", "friction", "cosmetic"]),
  F: new Set(["blocking", "friction", "cosmetic"]),
  V: new Set(["validation"]),
  Q: new Set(["question"])
};

const ALLOWED_DISPOSITIONS = new Set(["confirming", "extending", "new"]);
const ALLOWED_UX_SCOPES = new Set(["local polish", "redesign", "n/a - not ux"]);
const FINAL_TARGET_STATES = /^(satisfied|blocked|probe unavailable|not exercised - .+)$/i;

const METADATA_AUDIT_COLUMNS = [
  "Date",
  "App commit",
  "Method version",
  "Essence",
  "World file",
  "Path walked",
  "Evidence",
  "Prior-art frame",
  "P/R/F cluster prior-art disposition"
];

const FINDING_AUDIT_COLUMNS = [
  "finding",
  ...REQUIRED_FINDING_FIELDS,
  "Repro",
  "Design verdict",
  "Recommendation"
];

const WORKTREE_AUDIT_COLUMNS = [
  "path",
  "baseline state",
  "final state",
  "field-build-owned?",
  "final note wording"
];

const FINDING_HEADING = /^###\s+([PRMFVQ]-\d+)(?:\s+\((proposal|pressure)\))?\s+[-—]\s+(.+)$/i;
const FINDING_LIKE_HEADING = /^###\s+[PRMFVQ]-\d+\b/i;

const normalize = (value) =>
  value
    .replace(/[`*_]/g, "")
    .replace(/[—–]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

const sectionBody = (body, headingPattern) => {
  const lines = body.split(/\r?\n/);
  const start = lines.findIndex((line) => headingPattern.test(line));
  if (start < 0) return "";
  const endOffset = lines.slice(start + 1).findIndex((line) => /^##\s+/.test(line));
  const end = endOffset < 0 ? lines.length : start + 1 + endOffset;
  return lines.slice(start + 1, end).join("\n");
};

const subsections = (body) => {
  const lines = body.split(/\r?\n/);
  const starts = lines.flatMap((line, index) => (/^###\s+/.test(line) ? [index] : []));
  return starts.map((start, index) => ({
    heading: lines[start],
    body: lines.slice(start + 1, starts[index + 1] ?? lines.length).join("\n")
  }));
};

const fieldValue = (body, label) => {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return body.match(new RegExp(`^- ${escaped}:\\s*(.*)$`, "im"))?.[1]?.trim() ?? "";
};

const validValue = (value) => value.length > 0 && !/^<.*>$/.test(value);

const markdownTableAfter = (body, label) => {
  const lines = body.split(/\r?\n/);
  const labelIndex = lines.findIndex((line) => line.trim() === label);
  if (labelIndex < 0) return null;
  const tableStartOffset = lines.slice(labelIndex + 1).findIndex((line) => line.trim().startsWith("|"));
  if (tableStartOffset < 0) return { columns: [], rows: [] };
  const tableStart = labelIndex + 1 + tableStartOffset;
  const tableLines = [];
  for (const line of lines.slice(tableStart)) {
    if (!line.trim().startsWith("|")) break;
    tableLines.push(line);
  }

  const cells = (line) => line.split("|").slice(1, -1).map((cell) => cell.trim());
  const columns = cells(tableLines[0] ?? "");
  const rows = tableLines.slice(2).map(cells);
  return { columns, rows };
};

const columnsMatch = (actual, expected) =>
  actual.length === expected.length && actual.every((column, index) => column === expected[index]);

const auditState = (value) => /^(present(?:\s*\(.+\))?|N\/A - .+)$/i.test(value);

const findingSections = (report, errors) => {
  const findingsBody = sectionBody(report, /^## Findings\s*$/i);
  if (!findingsBody) return [];

  const parsed = [];
  for (const section of subsections(findingsBody)) {
    if (!FINDING_LIKE_HEADING.test(section.heading)) continue;
    const match = section.heading.match(FINDING_HEADING);
    if (!match) {
      errors.push(`unparsed finding heading: ${section.heading}`);
      continue;
    }
    parsed.push({
      id: match[1].toUpperCase(),
      type: match[1][0].toUpperCase(),
      mode: match[2]?.toLowerCase() ?? null,
      title: match[3].trim(),
      body: section.body
    });
  }
  return parsed;
};

const validateFindings = (report, errors) => {
  const findings = findingSections(report, errors);
  if (findings.length === 0) errors.push("Findings section contains no parsed finding rows");

  const seen = new Set();
  for (const finding of findings) {
    if (seen.has(finding.id)) errors.push(`duplicate finding id: ${finding.id}`);
    seen.add(finding.id);

    if (finding.type === "P" && !finding.mode) {
      errors.push(`${finding.id} must declare proposal or pressure mode in its heading`);
    }

    for (const label of REQUIRED_FINDING_FIELDS) {
      if (!validValue(fieldValue(finding.body, label))) {
        errors.push(`${finding.id} missing required field: ${label}`);
      }
    }

    const severity = normalize(fieldValue(finding.body, "Severity"));
    if (!ALLOWED_SEVERITIES[finding.type].has(severity)) {
      errors.push(`${finding.id} has invalid severity for ${finding.type}: ${severity || "(empty)"}`);
    }

    if (severity === "blocking" && !validValue(fieldValue(finding.body, "Repro"))) {
      errors.push(`${finding.id} is blocking but has no concrete Repro`);
    }

    const structural = /\bstructural\b|\bredesign candidate\b|missing or incorrect screen structure/i.test(
      finding.body
    );
    if ((finding.type === "R" || structural) && !validValue(fieldValue(finding.body, "Design verdict"))) {
      errors.push(`${finding.id} requires Design verdict`);
    }
    if ((finding.type === "R" || structural) && !validValue(fieldValue(finding.body, "Recommendation"))) {
      errors.push(`${finding.id} requires Recommendation`);
    }
  }

  return findings;
};

const validateRegression = ({ report, noPriorReport, errors }) => {
  const regression = sectionBody(report, /^## Regression of prior findings\s*$/i);
  if (!noPriorReport && !regression) {
    errors.push("missing required heading: ## Regression of prior findings");
    return;
  }
  if (!regression) return;

  const entries = regression.split(/\n(?=-\s+\S)/);
  for (const [index, entry] of entries.entries()) {
    const verdictLine = entry.split(/\r?\n/, 1)[0];
    const declaresFixed = /:\s*fixed(?:\s*(?:->|→)|\s*[.;]|\s*$)/i.test(verdictLine);
    if (!declaresFixed) continue;

    const namesBoundary =
      /boundary-state|closed-report boundary|ownership boundary|pre-(?:boundary|close)|after-(?:boundary|close)|negative control/i.test(
        entry
      );
    if (!namesBoundary) continue;

    const proof = entry.match(/^\s+- Boundary proof:\s*(.+)$/im)?.[1] ?? "";
    const prePassed = /pre-(?:boundary|close)[^.;\n]*(?:pass|succeed)/i.test(proof);
    const afterPassed = /(?:after-(?:boundary|close)|negative control)[^.;\n]*(?:pass|succeed)/i.test(proof);
    const admitsMissingProof =
      /defer|not reached|unreachable|unavailable|remaining[^.\n]*(?:blocked|cannot)/i.test(entry);
    if (!prePassed || !afterPassed || admitsMissingProof) {
      const missing = [!prePassed && "pre-boundary pass", !afterPassed && "after-boundary negative-control pass"]
        .filter(Boolean)
        .join(" and ");
      errors.push(
        `Regression entry ${index + 1} declares a boundary fixed without ${missing || "complete two-sided proof"}; use not-reverifiable-this-run when either side is unreachable`
      );
    }
  }
};

const validateDecisionPoints = (report, errors) => {
  const decisionLog = sectionBody(report, /^## Decision-point log \(evidence\)\s*$/i);
  if (!decisionLog) return;
  const points = subsections(decisionLog);
  if (points.length === 0) errors.push("Decision-point log contains no decision points");
  for (const point of points) {
    for (const label of ["Stage / decision point", "Prompt-out coverage", "UX/style verdict", "Obsolescence verdict"]) {
      if (!validValue(fieldValue(point.body, label))) {
        errors.push(`${point.heading} missing required field: ${label}`);
      }
    }
  }
};

const validateAppSeeds = (report, findings, errors) => {
  const appSection = sectionBody(report, /^## For the app \(PRD seeds\)\s*$/i);
  if (!appSection) return;
  const seeds = subsections(appSection).filter(({ heading }) => /^###\s+App Seed\b/i.test(heading));
  const productFindings = findings.filter(({ type }) => "PRF".includes(type));

  if (productFindings.length > 0 && seeds.length === 0) {
    errors.push("P/R/F findings exist but For the app contains no App Seed cluster");
  }
  if (productFindings.length === 0 && seeds.length > 0) {
    errors.push("App Seed clusters require at least one P/R/F finding; M and operational Q findings stay separate");
  }
  if (productFindings.length === 0 && seeds.length === 0 && !/No new PRD seed/i.test(appSection)) {
    errors.push("report without P/R/F findings must say No new PRD seed");
  }

  for (const seed of seeds) {
    const disposition = normalize(fieldValue(seed.body, "Disposition")).split(" ")[0];
    if (!ALLOWED_DISPOSITIONS.has(disposition)) {
      errors.push(`${seed.heading} has invalid or missing Disposition`);
    }
    if (!validValue(fieldValue(seed.body, "Likely spec/component"))) {
      errors.push(`${seed.heading} missing Likely spec/component`);
    }
    const uxScope = normalize(fieldValue(seed.body, "UX scope"));
    if (!ALLOWED_UX_SCOPES.has(uxScope)) {
      errors.push(`${seed.heading} has invalid or missing UX scope: ${uxScope || "(empty)"}`);
    }
  }
};

const validateLiveLog = ({ liveLog, findings, reportPath, errors }) => {
  for (const label of [
    "Closeout run sheet",
    "Report-metadata audit:",
    "Finding-field audit:",
    "Worktree delta audit:"
  ]) {
    if (!liveLog.includes(label)) errors.push(`live log missing required closeout label: ${label}`);
  }

  const metadataAudit = markdownTableAfter(liveLog, "Report-metadata audit:");
  if (!metadataAudit || !columnsMatch(metadataAudit.columns, METADATA_AUDIT_COLUMNS)) {
    errors.push("live log missing exact Report-metadata audit header");
  } else if (metadataAudit.rows.length !== 1) {
    errors.push(`Report-metadata audit must contain exactly one data row; found ${metadataAudit.rows.length}`);
  } else {
    if (metadataAudit.rows[0].length !== METADATA_AUDIT_COLUMNS.length) {
      errors.push("Report-metadata audit data row has the wrong number of cells");
    }
    metadataAudit.rows[0].forEach((value, index) => {
      if (!auditState(value)) errors.push(`Report-metadata audit has invalid ${METADATA_AUDIT_COLUMNS[index]} state`);
    });
    const dispositionState = metadataAudit.rows[0][METADATA_AUDIT_COLUMNS.length - 1] ?? "";
    const hasProductFinding = findings.some(({ type }) => "PRF".includes(type));
    if (hasProductFinding && !/^present\b/i.test(dispositionState)) {
      errors.push("Report-metadata audit must mark P/R/F cluster prior-art disposition present");
    }
    if (!hasProductFinding && !/^N\/A - /i.test(dispositionState)) {
      errors.push("Report-metadata audit must mark P/R/F cluster prior-art disposition N/A when no P/R/F exists");
    }
  }

  const findingAudit = markdownTableAfter(liveLog, "Finding-field audit:");
  if (!findingAudit || !columnsMatch(findingAudit.columns, FINDING_AUDIT_COLUMNS)) {
    errors.push("live log missing exact Finding-field audit header");
  } else {
    for (const finding of findings) {
      const rows = findingAudit.rows.filter(([id]) => id?.toUpperCase() === finding.id);
      if (rows.length !== 1) {
        errors.push(`Finding-field audit must contain exactly one row for ${finding.id}; found ${rows.length}`);
        continue;
      }
      const row = rows[0];
      if (row.length !== FINDING_AUDIT_COLUMNS.length) {
        errors.push(`Finding-field audit ${finding.id} row has the wrong number of cells`);
      }
      row.slice(1).forEach((value, index) => {
        if (!auditState(value)) {
          errors.push(`Finding-field audit ${finding.id} has invalid ${FINDING_AUDIT_COLUMNS[index + 1]} state`);
        }
      });
      for (const label of REQUIRED_FINDING_FIELDS) {
        const value = row[FINDING_AUDIT_COLUMNS.indexOf(label)];
        if (!/^present\b/i.test(value)) errors.push(`Finding-field audit ${finding.id} must mark ${label} present`);
      }
      const severity = normalize(fieldValue(finding.body, "Severity"));
      if (severity === "blocking" && !/^present\b/i.test(row[FINDING_AUDIT_COLUMNS.indexOf("Repro")])) {
        errors.push(`Finding-field audit ${finding.id} must mark Repro present`);
      }
      const structural = /\bstructural\b|\bredesign candidate\b|missing or incorrect screen structure/i.test(
        finding.body
      );
      if (finding.type === "R" || structural) {
        for (const label of ["Design verdict", "Recommendation"]) {
          if (!/^present\b/i.test(row[FINDING_AUDIT_COLUMNS.indexOf(label)])) {
            errors.push(`Finding-field audit ${finding.id} must mark ${label} present`);
          }
        }
      }
    }

    const reportFindingIds = new Set(findings.map(({ id }) => id));
    for (const [id] of findingAudit.rows) {
      if (/^[PRMFVQ]-\d+$/i.test(id ?? "") && !reportFindingIds.has(id.toUpperCase())) {
        errors.push(`Finding-field audit contains ${id.toUpperCase()} but the report Findings section does not`);
      }
    }
  }

  const worktreeAudit = markdownTableAfter(liveLog, "Worktree delta audit:");
  if (!worktreeAudit || !columnsMatch(worktreeAudit.columns, WORKTREE_AUDIT_COLUMNS)) {
    errors.push("live log missing exact Worktree delta audit header");
  } else {
    worktreeAudit.rows.forEach((row, index) => {
      if (row.length !== WORKTREE_AUDIT_COLUMNS.length) {
        errors.push(`Worktree delta audit row ${index + 1} has the wrong number of cells`);
      }
    });
  }

  const reportName = reportPath.split(/[\\/]/).at(-1);
  if (!reportName || !worktreeAudit?.rows.some(([path]) => path?.includes(reportName))) {
    errors.push("Worktree delta audit does not name the field-build report path");
  }

  const targetMatch = liveLog.match(/^- User-directed evidence targets:\s*(.*)$/im);
  const targetSummary = targetMatch?.[1]?.trim();
  if (!targetMatch || !validValue(targetSummary ?? "")) {
    errors.push("live log User-directed evidence targets must name targets or say none");
  }
  const hasTargets = targetSummary && !/^(none|N\/A(?: - .+)?)$/i.test(targetSummary);
  if (hasTargets) {
    const initial = markdownTableAfter(liveLog, "## User-directed evidence checklist (initial)");
    const final = markdownTableAfter(liveLog, "## Final user-directed evidence checklist");
    const targetColumns = ["target", "state", "evidence / reason"];
    if (!initial || !columnsMatch(initial.columns, targetColumns)) {
      errors.push("user-directed targets require the exact initial evidence checklist");
    }
    if (!final || !columnsMatch(final.columns, targetColumns)) {
      errors.push("user-directed targets require the exact final evidence checklist");
    }
    if (initial && final && columnsMatch(initial.columns, targetColumns) && columnsMatch(final.columns, targetColumns)) {
      const initialTargets = initial.rows.map(([target]) => target);
      const finalTargets = final.rows.map(([target]) => target);
      if (initial.rows.length === 0) errors.push("initial user-directed evidence checklist has no targets");
      if (initial.rows.some((row) => normalize(row[1] ?? "") !== "pending")) {
        errors.push("every initial user-directed evidence target must be pending");
      }
      if (initial.rows.some((row) => !validValue(row[0] ?? "") || !validValue(row[2] ?? ""))) {
        errors.push("initial user-directed evidence checklist has an empty target or evidence/reason cell");
      }
      if (JSON.stringify(finalTargets) !== JSON.stringify(initialTargets)) {
        errors.push("final user-directed evidence checklist must repeat initial targets in the same order");
      }
      for (const row of final.rows) {
        if (!FINAL_TARGET_STATES.test(row[1] ?? "")) {
          errors.push(`invalid final user-directed evidence state for ${row[0] || "unnamed target"}`);
        }
        if (!validValue(row[2] ?? "")) {
          errors.push(`final user-directed evidence target ${row[0] || "unnamed target"} has no evidence/reason`);
        }
      }
    }
  }
};

export const validateFieldBuild = ({ report, liveLog, reportPath = "report.md", noPriorReport = false }) => {
  const errors = [];

  if (!/^# Field Build \d+\s+[-—]\s+.+$/m.test(report)) {
    errors.push("missing or malformed Field Build report title");
  }
  for (const heading of REQUIRED_REPORT_HEADINGS) {
    if (!report.includes(heading)) errors.push(`missing required heading: ${heading}`);
  }
  for (const field of REQUIRED_METADATA) {
    if (!field.pattern.test(report)) errors.push(`missing required metadata: ${field.label}`);
  }

  const findings = validateFindings(report, errors);
  validateRegression({ report, noPriorReport, errors });
  validateDecisionPoints(report, errors);
  validateAppSeeds(report, findings, errors);
  validateLiveLog({ liveLog, findings, reportPath, errors });

  return {
    errors,
    summary: {
      findings: findings.length,
      appSeeds: subsections(sectionBody(report, /^## For the app \(PRD seeds\)\s*$/i)).filter(({ heading }) =>
        /^###\s+App Seed\b/i.test(heading)
      ).length,
      priorReportExpected: !noPriorReport
    }
  };
};

const isCli = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isCli) {
  const args = process.argv.slice(2);
  const unknownOptions = args.filter((arg) => arg.startsWith("--") && arg !== "--no-prior-report");
  const noPriorReport = args.includes("--no-prior-report");
  const paths = args.filter((arg) => !arg.startsWith("--"));

  if (unknownOptions.length > 0 || paths.length !== 2) {
    console.error(usage);
    process.exit(2);
  }

  try {
    const [reportPath, liveLogPath] = paths.map((path) => resolve(path));
    const result = validateFieldBuild({
      report: readFileSync(reportPath, "utf8"),
      liveLog: readFileSync(liveLogPath, "utf8"),
      reportPath,
      noPriorReport
    });
    console.log(JSON.stringify(result.summary, null, 2));
    for (const error of result.errors) console.error(`error: ${error}`);
    if (result.errors.length > 0) process.exit(1);
    console.log("Field-build report structure validated.");
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
