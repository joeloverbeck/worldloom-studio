#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const usage = "Usage: node .claude/skills/field-build-prd-prep/scripts/validate-prd-prep.mjs <source-report.md> <prep-artifact.md>";

const ALLOWED_STATUSES = new Set([
  "validated/no product scope",
  "covered",
  "verification/reopen candidate",
  "fresh product scope",
  "methodology/docs scope",
  "coverage follow-up",
  "follow-on candidate",
  "no-op/rejected"
]);

const REQUIRED_HEADINGS = [
  "## Reassessment Verdict",
  "## Evidence Checked",
  "## Authority Findings",
  "## Recommended First PRD",
  "## Follow-On Candidates",
  "## Coverage Follow-Up",
  "## Rejected Or No-Op Alternatives",
  "## PRD Publication Inputs",
  "## Completion Self-Check",
  "## Freshness And Boundaries"
];

const REQUIRED_FIELDS = [
  { label: "source artifact", pattern: /^Source (?:artifact|report(?: path)?):/im },
  { label: "source durability", pattern: /^Source durability(?: status)?:/im },
  { label: "authored-artifact durability", pattern: /^Authored[- ]artifact (?:durability|status):/im },
  { label: "tracker freshness", pattern: /^Tracker freshness:/im },
  { label: "deliverable status", pattern: /^Deliverable status:/im },
  { label: "suggested title", pattern: /^Suggested title:/im },
  { label: "publication package", pattern: /^Publication package:/im },
  { label: "recommended testing seam", pattern: /^Recommended testing seams?(?: and seam checkpoint)?:/im },
  { label: "/to-prd consultation status", pattern: /^`?\/to-prd`? (?:consultation status|usage):/im },
  { label: "likely label and downgrades", pattern: /^Likely label and downgrades:/im },
  { label: "browser-visible checklist mapping", pattern: /Browser-visible guidance checklist (?:mapping|needs)/i },
  { label: "canonical implementation gates", pattern: /^Canonical (?:implementation )?gates(?: for [^:]+)?:/im },
  { label: "focused implementation gates", pattern: /^Focused (?:implementation|likely) gates(?: if [^:]+)?:/im },
  { label: "evidence expectations", pattern: /^Evidence expectations:/im }
];

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

const tableCells = (line) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

const evidenceRows = (artifact, errors) => {
  const section = sectionBody(artifact, /^## Evidence Checked\s*$/);
  if (!section) {
    errors.push("missing Evidence Checked section body");
    return [];
  }

  const rows = [];
  for (const [index, line] of section.split(/\r?\n/).entries()) {
    if (!line.trim().startsWith("|")) continue;
    const cells = tableCells(line);
    const label = cells[0] ?? "";
    const status = normalize(cells[1] ?? "");
    if (/^(finding or candidate|-+)$/i.test(label.replace(/\s+/g, " "))) continue;
    if (!ALLOWED_STATUSES.has(status)) {
      errors.push(`Evidence Checked table row ${index + 1} has invalid or missing status: ${cells[1] ?? "(empty)"}`);
      continue;
    }
    rows.push({ label, normalizedLabel: normalize(label), status });
  }

  if (rows.length === 0) errors.push("Evidence Checked table contains no classified rows");
  return rows;
};

const exactRowCount = (rows, predicate) => rows.filter(predicate).length;

const requireOneRow = (errors, rows, identity, predicate) => {
  const count = exactRowCount(rows, predicate);
  if (count !== 1) errors.push(`${identity} must map to exactly one Evidence Checked row; found ${count}`);
};

const FINDING_HEADING_PATTERN = /^###\s+([PRFMQV]-\d+)(?:\s+\([^)\r\n]+\))?\s+-\s+(.+)$/i;
const FINDING_LIKE_HEADING_PATTERN = /^###\s+[PRFMQV]-\d+\b/i;

const findingIdentities = (source) =>
  source
    .split(/\r?\n/)
    .flatMap((line) => {
      const match = line.match(FINDING_HEADING_PATTERN);
      return match ? [{ id: match[1].toUpperCase(), title: match[2] }] : [];
    });

const unparsedFindingHeadings = (source) =>
  source
    .split(/\r?\n/)
    .filter((line) => FINDING_LIKE_HEADING_PATTERN.test(line) && !FINDING_HEADING_PATTERN.test(line));

const appSeedIdentities = (source) => {
  const appSection = sectionBody(source, /^## For the app\b/i);
  return [...appSection.matchAll(/^###\s+(.+)$/gm)].map((match) => {
    const heading = match[1].trim();
    const prefix = heading.match(/^(.+?Seed\s+\d+)\b/i)?.[1] ?? heading;
    return { heading, prefix: normalize(prefix) };
  });
};

const regressionIdentities = (source) => {
  const regressionSection = sectionBody(source, /^## Regression of prior findings\s*$/i);
  const identities = new Map();
  for (const line of regressionSection.split(/\r?\n/)) {
    const trimmed = line.trim();
    const candidate = trimmed.startsWith("|")
      ? tableCells(line)[0] ?? ""
      : trimmed.match(/^(?:[-*+]|\d+\.)\s+(.+)$/)?.[1] ?? "";
    const match = candidate.match(/\b(field build\s+\d+\s+[prfmqv]-\d+)\b/i);
    if (match) identities.set(normalize(match[1]), match[1]);
  }
  return [...identities.values()];
};

const frontierIdentities = (source) => {
  const frontierSection = sectionBody(source, /^## Frontier\s*$/i);
  const identities = new Map();
  for (const line of frontierSection.split(/\r?\n/)) {
    const bullet = line.match(/^(?:[-*+]|\d+\.)\s+(.+)$/);
    const tableCandidate = line.trim().startsWith("|") ? tableCells(line)[0] ?? "" : "";
    const candidate = bullet?.[1] ?? tableCandidate;
    if (!candidate) continue;
    const label = (candidate.match(/^([^:]+):/)?.[1] ?? candidate).trim();
    if (!label || /^(?:frontier (?:item|note)|note|-+)$/i.test(label)) continue;
    identities.set(normalize(label), label);
  }
  return [...identities.entries()].map(([prefix, label]) => ({ label, prefix }));
};

const frontierRowIdentity = (label) => normalize(label).replace(/^frontier\s*:?\s*/, "");

const lineHits = (body, pattern) =>
  body
    .split(/\r?\n/)
    .map((line, index) => ({ line, lineNumber: index + 1 }))
    .filter(({ line }) => pattern.test(line));

export const validatePrdPrep = ({ source, artifact }) => {
  const errors = [];
  const warnings = [];

  for (const heading of REQUIRED_HEADINGS) {
    if (!artifact.includes(heading)) errors.push(`missing required heading: ${heading}`);
  }
  for (const field of REQUIRED_FIELDS) {
    if (!field.pattern.test(artifact)) errors.push(`missing required field: ${field.label}`);
  }
  for (const heading of unparsedFindingHeadings(source)) {
    errors.push(`unparsed finding heading: ${heading}`);
  }

  const rows = evidenceRows(artifact, errors);
  const findings = findingIdentities(source);
  const appSeeds = appSeedIdentities(source);
  const regressions = regressionIdentities(source);
  const frontierItems = frontierIdentities(source);

  for (const finding of findings) {
    const prefix = normalize(finding.id);
    requireOneRow(errors, rows, `finding ${finding.id}`, (row) => row.normalizedLabel === prefix || row.normalizedLabel.startsWith(`${prefix} `));
  }
  for (const seed of appSeeds) {
    requireOneRow(errors, rows, `app seed ${seed.heading}`, (row) => row.normalizedLabel === seed.prefix || row.normalizedLabel.startsWith(`${seed.prefix} `));
  }
  for (const regression of regressions) {
    const normalizedIdentity = normalize(regression);
    requireOneRow(errors, rows, `regression ${regression}`, (row) => row.normalizedLabel.includes(normalizedIdentity));
  }

  if (/^## For the methodology\s*$/im.test(source)) {
    requireOneRow(errors, rows, "For the methodology", (row) => row.normalizedLabel.includes("for the methodology"));
  }
  if (/^## Frontier\s*$/im.test(source)) {
    if (frontierItems.length === 0) {
      const frontierRows = rows.filter((row) => row.normalizedLabel.startsWith("frontier"));
      if (frontierRows.length === 0) errors.push("Frontier must map to at least one Evidence Checked row");
    }
    for (const item of frontierItems) {
      requireOneRow(errors, rows, `frontier item ${item.label}`, (row) => frontierRowIdentity(row.label) === item.prefix);
    }
  }

  const localPathHits = lineHits(artifact, /\/tmp(?:\/|\b)|\/home(?:\/|\b)/);
  if (localPathHits.length > 0) {
    warnings.push(`review machine-local path hits on lines ${localPathHits.map((hit) => hit.lineNumber).join(", ")}`);
  }
  const staleLanguageHits = lineHits(
    artifact,
    /should be checked|must be checked before publication|if the body passes|TBD before publication/i
  );
  if (staleLanguageHits.length > 0) {
    warnings.push(`review stale publication-language hits on lines ${staleLanguageHits.map((hit) => hit.lineNumber).join(", ")}`);
  }

  return {
    errors,
    warnings,
    summary: {
      findings: findings.length,
      appSeeds: appSeeds.length,
      regressions: regressions.length,
      frontierItems: frontierItems.length,
      evidenceRows: rows.length
    }
  };
};

const isCli = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isCli) {
  const [sourcePath, artifactPath, ...rest] = process.argv.slice(2);
  if (!sourcePath || !artifactPath || rest.length > 0) {
    console.error(usage);
    process.exit(2);
  }

  try {
    const result = validatePrdPrep({
      source: readFileSync(resolve(sourcePath), "utf8"),
      artifact: readFileSync(resolve(artifactPath), "utf8")
    });
    console.log(JSON.stringify(result.summary, null, 2));
    for (const warning of result.warnings) console.warn(`warning: ${warning}`);
    for (const error of result.errors) console.error(`error: ${error}`);
    if (result.errors.length > 0) process.exit(1);
    console.log("PRD-prep structure validated.");
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
