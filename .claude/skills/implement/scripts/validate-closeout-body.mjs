#!/usr/bin/env node

import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const acceptanceManifestFlag = args.indexOf("--acceptance-manifest");
const acceptanceManifestPath = acceptanceManifestFlag >= 0 ? args[acceptanceManifestFlag + 1] : undefined;
const acceptanceManifestValueIndex = acceptanceManifestFlag >= 0 ? acceptanceManifestFlag + 1 : -1;
const file = args.find(
  (arg, index) => !arg.startsWith("--") && index !== acceptanceManifestValueIndex
);
const flags = new Set(args.filter((arg) => arg.startsWith("--")));
const auditOnly = flags.has("--audit-only");
const reviewEntry = flags.has("--review-entry");

const usage = `Usage: node .claude/skills/implement/scripts/validate-closeout-body.mjs <body.md> [--audit-only [--review-entry] | --closing] [--principles] [--local-only] [--fixed-child | --fixed-child-pending] [--review-fallback] [--acceptance-manifest <manifest.json>]`;

if (flags.has("--help")) {
  console.error(usage);
  process.exit(0);
}

if (!file) {
  console.error(usage);
  process.exit(2);
}

if (acceptanceManifestFlag >= 0 && (!acceptanceManifestPath || acceptanceManifestPath.startsWith("--"))) {
  console.error("--acceptance-manifest requires a manifest path");
  console.error(usage);
  process.exit(2);
}

if (auditOnly && !acceptanceManifestPath) {
  console.error("--audit-only requires --acceptance-manifest");
  console.error(usage);
  process.exit(2);
}

if (reviewEntry && !auditOnly) {
  console.error("--review-entry requires --audit-only");
  console.error(usage);
  process.exit(2);
}

const auditOnlyIncompatibleFlags = [
  "--closing",
  "--principles",
  "--local-only",
  "--fixed-child",
  "--fixed-child-pending",
  "--review-fallback"
].filter((flag) => flags.has(flag));
if (auditOnly && auditOnlyIncompatibleFlags.length) {
  console.error(`--audit-only cannot be combined with ${auditOnlyIncompatibleFlags.join(", ")}`);
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

const valuesForField = (label) => {
  const escaped = label.replace(/[.*+?^{}$()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `^\\s*[-*]?\\s*(?:\\*\\*)?${escaped}(?:\\*\\*)?:\\s*(.+)$`,
    "gim"
  );
  return [...body.matchAll(pattern)].map((match) => match[1].trim());
};

const allowedHtmlTags = new Set([
  "br",
  "code",
  "details",
  "em",
  "li",
  "ol",
  "p",
  "pre",
  "strong",
  "summary",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "ul"
]);

const isAllowedAngleToken = (token) => {
  if (/^<https?:\/\/[^>\s]+>$/i.test(token)) return true;
  if (/^<mailto:[^>\s]+>$/i.test(token)) return true;

  const htmlTag = token.match(/^<\/?([a-z][a-z0-9-]*)(?:\s[^<>]*)?\/?>$/i);
  return htmlTag ? allowedHtmlTags.has(htmlTag[1].toLowerCase()) : false;
};

requireText("| Issue | Acceptance criterion or conformance check | Evidence | Status |", "audit table header");

if (!auditOnly) {
  requireText("Final SHA:");
  requireMatch(/(^|\n)(#{1,6}\s*)?Verification\b:?/i, "verification evidence");
  requireMatch(/TDD evidence gate passed:|N\/A because no tdd skill was invoked/i, "TDD evidence or explicit N/A");
  requireMatch(/Review:|Review fallback:/, "review evidence");
  requireMatch(/Browser evidence:|browser evidence|browser smoke/i, "browser evidence or N/A");
  requireMatch(/Console state:|Browser console state:|browser console state recorded/i, "browser console state or N/A");
  requireMatch(/Final freshness delta|Browser\/manual evidence freshness|final browser\/manual freshness/i, "final browser/manual freshness");
  requireText("Evidence identity refresh:");
  requireMatch(
    /^\s*[-*]?\s*Current evidence identities:\s+.*fixture paths.+browser sessions.+packet paths\/hashes.+active revisions.+artifacts/im,
    "current evidence identity categories"
  );
  requireMatch(
    /^\s*[-*]?\s*Superseded evidence identities:\s+.*fixture paths.+browser sessions.+packet paths\/hashes.+active revisions.+artifacts/im,
    "superseded evidence identity categories"
  );
  requireMatch(/^\s*[-*]?\s*Superseded-token sweep:\s+\S.+$/im, "superseded-token sweep result");
  const currentIdentities = body.match(
    /^\s*[-*]?\s*Current evidence identities:\s+(.+)$/im
  )?.[1] ?? "";
  const supersededIdentities = body.match(
    /^\s*[-*]?\s*Superseded evidence identities:\s+(.+)$/im
  )?.[1] ?? "";
  const supersededSweep = body.match(/^\s*[-*]?\s*Superseded-token sweep:\s+(.+)$/im)?.[1] ?? "";
  const allSupersededCategoriesNone = [
    /fixture paths\s+none(?:;|$)/i,
    /browser sessions\s+none(?:;|$)/i,
    /packet paths\/hashes\s+none(?:;|$)/i,
    /active revisions\s+none(?:;|$)/i,
    /artifacts\s+none(?:;|$)/i
  ].every((pattern) => pattern.test(supersededIdentities));
  if (/\b(?:TODO|TBD|pending|unknown)\b/i.test(`${currentIdentities} ${supersededIdentities} ${supersededSweep}`)) {
    errors.push("evidence identity refresh contains an unresolved value");
  }
  if (!allSupersededCategoriesNone && !/\b(?:no hits?|zero matches|0 matches|absent)\b/i.test(supersededSweep)) {
    errors.push("superseded-token sweep must report no hits for listed superseded identities");
  }
  if (allSupersededCategoriesNone && /^N\/A\b/i.test(supersededSweep) && !/because/i.test(supersededSweep)) {
    errors.push("superseded-token sweep N/A must include 'because'");
  }
  requireText("Closeout body check passed:", "closeout body check line");
  requireText("Closeout gate passed: audit sink", "closeout gate line");
}

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

if (flags.has("--closing")) {
  const localAbsolutePath = /(?:^|[\s\x60("'=])((?:\/(?!\/)|[A-Za-z]:\\)[^\s\x60"'),;]+)/;
  const publishableSinkValues = [
    ...["Durable sink/body inspected", "Audit sink", "Body file(s) inspected"]
      .flatMap((label) => valuesForField(label).map((value) => ({ label, value }))),
    ...body
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.startsWith("Closeout gate passed: audit sink"))
      .map((value) => ({ label: "Closeout gate passed", value }))
  ];

  for (const { label, value } of publishableSinkValues) {
    const match = value.match(localAbsolutePath);
    if (match) {
      errors.push(
        `published closeout field ${label} contains local staging path ${match[1]}; use a stable issue/comment reference and keep local inspection paths private`
      );
    }
  }
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

for (const match of body.matchAll(/<[^>\n]{1,120}>/g)) {
  const token = match[0];
  if (!isAllowedAngleToken(token)) {
    errors.push(`forbidden unresolved angle-token placeholder ${token}`);
  }
}

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
  const evidence = cells[2] ?? "";
  const status = cells.at(-1);
  if (!["satisfied", "blocked", "not done"].includes(status)) {
    errors.push(`invalid audit status "${status}" in row: | ${cells.join(" | ")} |`);
  }
  if (status === "satisfied") {
    for (const label of ["atoms:", "proof surfaces:", "sequence:"]) {
      if (!evidence.includes(label)) {
        errors.push(`satisfied audit row Evidence is missing ${label} | ${cells.join(" | ")} |`);
      }
    }
    if (/\b(?:TODO|TBD|pending|unknown)\b/i.test(evidence)) {
      errors.push(`satisfied audit row Evidence contains an unresolved value: | ${cells.join(" | ")} |`);
    }
    for (const label of ["atoms", "proof surfaces", "sequence"]) {
      const emptyLabel = new RegExp(`${label}:\\s*(?:;|$)`, "i");
      if (emptyLabel.test(evidence)) {
        errors.push(`satisfied audit row Evidence has an empty ${label}: value | ${cells.join(" | ")} |`);
      }
    }
    if (/sequence:\s*N\/A\s*(?:;|$)/i.test(evidence)) {
      errors.push(`satisfied audit row sequence N/A must include 'because': | ${cells.join(" | ")} |`);
    }
    if (/sequence:\s*$/i.test(evidence)) {
      errors.push(`satisfied audit row sequence is empty: | ${cells.join(" | ")} |`);
    }
  }
  if (flags.has("--closing") && status !== "satisfied") {
    errors.push(`closing gate row is not satisfied: | ${cells.join(" | ")} |`);
  }
  if (reviewEntry && status !== "satisfied") {
    errors.push(`review-entry gate row is not satisfied: | ${cells.join(" | ")} |`);
  }
}

if (acceptanceManifestPath) {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(acceptanceManifestPath, "utf8"));
  } catch (error) {
    errors.push(`cannot read acceptance manifest ${acceptanceManifestPath}: ${error.message}`);
  }

  if (manifest) {
    if (manifest.version !== 1 || !Array.isArray(manifest.issues)) {
      errors.push("acceptance manifest must have version 1 and an issues array");
    } else {
      const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const normalizeCriterion = (value) =>
        value.replaceAll("&#124;", "|").replace(/\s+/g, " ").trim().toLowerCase();
      const seenIssueNumbers = new Set();
      for (const issue of manifest.issues) {
        if (!Number.isInteger(issue.number) || !Array.isArray(issue.checks)) {
          errors.push("acceptance manifest issue requires an integer number and checks array");
          continue;
        }
        if (seenIssueNumbers.has(issue.number)) {
          errors.push(`acceptance manifest contains duplicate issue #${issue.number}`);
          continue;
        }
        seenIssueNumbers.add(issue.number);
        if (!issue.checks.length) {
          errors.push(`acceptance manifest #${issue.number} has no checks`);
          continue;
        }

        const issueRows = statusRows.filter((cells) => cells[0] === `#${issue.number}`);
        const knownIds = new Set(issue.checks.map((check) => check.id));
        if (knownIds.size !== issue.checks.length) {
          errors.push(`acceptance manifest #${issue.number} contains duplicate check IDs`);
        }

        for (const check of issue.checks) {
          if (!check || typeof check.id !== "string" || typeof check.text !== "string") {
            errors.push(`acceptance manifest #${issue.number} has an invalid check`);
            continue;
          }
          const idPattern = new RegExp(`(^|\\W)${escapeRegex(check.id)}(?=\\W|$)`, "i");
          const expectedText = normalizeCriterion(check.text);
          const matches = issueRows.filter((cells) => {
            const criterion = cells[1] ?? "";
            return idPattern.test(criterion) && normalizeCriterion(criterion).includes(expectedText);
          });
          if (matches.length !== 1) {
            errors.push(
              `acceptance manifest #${issue.number} ${check.id} requires exactly one audit row with exact criterion text; found ${matches.length}`
            );
          }
        }

        for (const cells of issueRows) {
          for (const id of (cells[1] ?? "").match(/\bAC\d+\b/gi) ?? []) {
            if (![...knownIds].some((knownId) => knownId.toLowerCase() === id.toLowerCase())) {
              errors.push(`audit row for #${issue.number} contains unknown acceptance ID ${id}`);
            }
          }
        }
      }
    }
  }
}

if (errors.length) {
  console.error(`Closeout body validation failed for ${file}:`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`${auditOnly ? "Acceptance audit" : "Closeout body"} validation passed: ${file}`);
