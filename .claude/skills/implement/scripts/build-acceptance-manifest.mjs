#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const usage =
  "Usage: node .claude/skills/implement/scripts/build-acceptance-manifest.mjs <issues.json> [--output <manifest.json>] [--audit-output <audit.md>]";

const sectionLines = (body, heading) => {
  const lines = body.split(/\r?\n/);
  const start = lines.findIndex((line) => new RegExp(`^##\\s+${heading}\\s*$`, "i").test(line.trim()));
  if (start < 0) return [];

  const endOffset = lines.slice(start + 1).findIndex((line) => /^##\s+/.test(line.trim()));
  const end = endOffset < 0 ? lines.length : start + 1 + endOffset;
  return lines.slice(start + 1, end);
};

const hasSection = (body, heading) =>
  body.split(/\r?\n/).some((line) => new RegExp(`^##\\s+${heading}\\s*$`, "i").test(line.trim()));

const acceptanceCriteria = (body) => {
  const criteria = [];
  let current = null;

  for (const line of sectionLines(body, "Acceptance criteria")) {
    const checkbox = line.match(/^\s*[-*]\s+\[[ xX]\]\s+(.+?)\s*$/);
    if (checkbox) {
      current = checkbox[1];
      criteria.push(current);
      continue;
    }

    if (current && /^\s{2,}\S/.test(line) && !/^\s*[-*]\s+/.test(line)) {
      criteria[criteria.length - 1] = `${criteria.at(-1)} ${line.trim()}`;
      current = criteria.at(-1);
    } else if (line.trim()) {
      current = null;
    }
  }

  return criteria;
};

const normalizeIssues = (input) => {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input?.issues)) return input.issues;
  return [input];
};

export const buildAcceptanceManifest = (input) => {
  const seen = new Set();
  const issues = normalizeIssues(input).map((issue) => {
    if (!Number.isInteger(issue?.number) || typeof issue?.body !== "string") {
      throw new Error("each saved issue must contain an integer number and string body");
    }
    if (seen.has(issue.number)) throw new Error(`duplicate issue number ${issue.number}`);
    seen.add(issue.number);

    const checks = acceptanceCriteria(issue.body).map((text, index) => ({
      id: `AC${index + 1}`,
      kind: "acceptance",
      text
    }));

    if (hasSection(issue.body, "Principles")) {
      checks.push({
        id: "Principles",
        kind: "principles",
        text: `Principles/ADR conformance for #${issue.number}`
      });
    }

    if (checks.length === 0) {
      throw new Error(
        `issue #${issue.number} has no checkbox criteria under ## Acceptance criteria and no ## Principles section`
      );
    }

    return {
      number: issue.number,
      title: typeof issue.title === "string" ? issue.title : "",
      checks
    };
  });

  return { version: 1, issues };
};

const tableText = (value) => value.replaceAll("|", "&#124;").replaceAll("\n", " ").trim();

export const buildAuditScaffold = (manifest) => {
  const rows = [
    "| Issue | Acceptance criterion or conformance check | Evidence | Status |",
    "|---|---|---|---|"
  ];

  for (const issue of manifest.issues) {
    for (const check of issue.checks) {
      rows.push(
        `| #${issue.number} | ${check.id} - ${tableText(check.text)} | atoms: TODO; proof surfaces: TODO; sequence: TODO or N/A because criterion is not sequence-sensitive | not done |`
      );
    }
  }

  return `${rows.join("\n")}\n`;
};

const isCli = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isCli) {
  const args = process.argv.slice(2);
  const valueFor = (flag) => {
    const index = args.indexOf(flag);
    return index < 0 ? undefined : args[index + 1];
  };
  const valueIndexes = new Set(
    ["--output", "--audit-output"]
      .map((flag) => args.indexOf(flag))
      .filter((index) => index >= 0)
      .map((index) => index + 1)
  );
  const inputPath = args.find((arg, index) => !arg.startsWith("--") && !valueIndexes.has(index));

  if (args.includes("--help")) {
    console.error(usage);
    process.exit(0);
  }
  if (!inputPath) {
    console.error(usage);
    process.exit(2);
  }

  try {
    const manifest = buildAcceptanceManifest(JSON.parse(readFileSync(inputPath, "utf8")));
    const outputPath = valueFor("--output");
    const auditOutputPath = valueFor("--audit-output");
    const json = `${JSON.stringify(manifest, null, 2)}\n`;

    if (args.includes("--output") && (!outputPath || outputPath.startsWith("--"))) {
      throw new Error("--output requires a path");
    }
    if (args.includes("--audit-output") && (!auditOutputPath || auditOutputPath.startsWith("--"))) {
      throw new Error("--audit-output requires a path");
    }

    if (outputPath) writeFileSync(outputPath, json);
    else process.stdout.write(json);
    if (auditOutputPath) writeFileSync(auditOutputPath, buildAuditScaffold(manifest));
  } catch (error) {
    console.error(`Acceptance manifest build failed: ${error.message}`);
    process.exit(1);
  }
}
