#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const auditHeader = "| Issue | Acceptance criterion or conformance check | Evidence | Status |";
const usage = "Usage: node .claude/skills/implement/scripts/verify-split-closeout-family.mjs --full-manifest <manifest.json> --compact-body <body.md> --chunk <subset.json> <body.md> <stable-url> [--chunk <subset.json> <body.md> <stable-url> ...]";

const normalizeCriterion = (value) =>
  value.replaceAll("&#124;", "|").replace(/\s+/g, " ").trim().toLowerCase();

const manifestEntries = (manifest, label) => {
  if (manifest?.version !== 1 || !Array.isArray(manifest.issues) || !manifest.issues.length) {
    throw new Error(`${label} must have version 1 and a non-empty issues array`);
  }

  const entries = [];
  const seenIssues = new Set();
  for (const issue of manifest.issues) {
    if (!Number.isInteger(issue?.number) || !Array.isArray(issue?.checks) || !issue.checks.length) {
      throw new Error(`${label} issue requires an integer number and non-empty checks array`);
    }
    if (seenIssues.has(issue.number)) {
      throw new Error(`${label} contains duplicate issue #${issue.number}`);
    }
    seenIssues.add(issue.number);

    const seenChecks = new Set();
    for (const check of issue.checks) {
      if (typeof check?.id !== "string" || !check.id || typeof check?.text !== "string") {
        throw new Error(`${label} issue #${issue.number} contains an invalid check`);
      }
      if (seenChecks.has(check.id)) {
        throw new Error(`${label} issue #${issue.number} contains duplicate check ${check.id}`);
      }
      seenChecks.add(check.id);
      entries.push({
        key: `${issue.number}:${check.id}`,
        issueNumber: issue.number,
        checkId: check.id,
        criterion: normalizeCriterion(`${check.id} - ${check.text}`)
      });
    }
  }
  return entries;
};

const auditRows = (body) => {
  const lines = body.split(/\r?\n/);
  const rows = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].trim() !== auditHeader) continue;
    if (!/^\|(?:\s*:?-{3,}:?\s*\|)+$/.test(lines[index + 1]?.trim() ?? "")) continue;
    for (let row = index + 2; row < lines.length; row += 1) {
      const line = lines[row].trim();
      if (!line.startsWith("|")) break;
      const cells = line.slice(1, -1).split("|").map((cell) => cell.trim());
      if (/^#\d+$/.test(cells[0] ?? "")) rows.push(cells);
    }
  }
  return rows;
};

const isStableUrl = (value) => {
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol) && Boolean(parsed.hostname);
  } catch {
    return false;
  }
};

export const verifySplitCloseoutFamily = ({ fullManifest, compactBody, chunks }) => {
  if (!Array.isArray(chunks) || !chunks.length) {
    throw new Error("at least one split closeout chunk is required");
  }

  const errors = [];
  const fullEntries = manifestEntries(fullManifest, "full manifest");
  const fullByKey = new Map(fullEntries.map((entry) => [entry.key, entry]));
  const coveredByKey = new Map();
  const chunkCheckCounts = [];

  const compactRows = auditRows(compactBody);
  if (!compactRows.length) {
    errors.push("compact body has no acceptance audit rows");
  }
  for (const row of compactRows) {
    const issueNumber = Number((row[0] ?? "").slice(1));
    const criterion = normalizeCriterion(row[1] ?? "");
    const entry = fullEntries.find(
      (candidate) => candidate.issueNumber === issueNumber && candidate.criterion === criterion
    );
    if (!entry) {
      errors.push(`compact body contains an audit row absent from the full manifest: ${row[0]} ${row[1]}`);
      continue;
    }
    if (coveredByKey.has(entry.key)) {
      errors.push(`${entry.key} appears more than once in the compact body`);
      continue;
    }
    coveredByKey.set(entry.key, "compact body");
    if (row[3] !== "satisfied") {
      errors.push(`compact body row ${entry.key} is not satisfied`);
    }
  }

  for (const [index, chunk] of chunks.entries()) {
    const chunkNumber = index + 1;
    const label = `chunk ${chunkNumber}`;
    const entries = manifestEntries(chunk.manifest, `${label} manifest`);
    const rows = auditRows(chunk.body);
    const expectedRows = new Set(
      entries.map((entry) => `${entry.issueNumber}:${entry.criterion}`)
    );
    chunkCheckCounts.push(entries.length);

    if (!isStableUrl(chunk.url)) {
      errors.push(`${label} URL is not a stable HTTP(S) URL: ${chunk.url}`);
    } else if (!compactBody.includes(chunk.url)) {
      errors.push(`compact body does not cite ${label} URL ${chunk.url}`);
    }

    for (const entry of entries) {
      const fullEntry = fullByKey.get(entry.key);
      if (!fullEntry) {
        errors.push(`${label} contains ${entry.key}, which is absent from the full manifest`);
      } else if (fullEntry.criterion !== entry.criterion) {
        errors.push(`${label} criterion for ${entry.key} does not match the full manifest`);
      }
      if (coveredByKey.has(entry.key)) {
        errors.push(`${entry.key} appears in both ${coveredByKey.get(entry.key)} and ${label}`);
      } else {
        coveredByKey.set(entry.key, label);
      }

      const matches = rows.filter(
        (row) => row[0] === `#${entry.issueNumber}` && normalizeCriterion(row[1] ?? "") === entry.criterion
      );
      if (matches.length !== 1) {
        errors.push(`${label} body requires exactly one exact audit row for ${entry.key}; found ${matches.length}`);
      } else if (matches[0][3] !== "satisfied") {
        errors.push(`${label} body row ${entry.key} is not satisfied`);
      }
    }

    for (const row of rows) {
      const issueNumber = Number((row[0] ?? "").slice(1));
      const rowKey = `${issueNumber}:${normalizeCriterion(row[1] ?? "")}`;
      if (!expectedRows.has(rowKey)) {
        errors.push(`${label} body contains an audit row outside its subset: ${row[0]} ${row[1]}`);
      }
    }
  }

  for (const entry of fullEntries) {
    if (!coveredByKey.has(entry.key)) {
      errors.push(`full-manifest check ${entry.key} is missing from every chunk`);
    }
  }

  if (errors.length) {
    throw new Error(errors.join("\n- "));
  }

  return {
    fullCheckCount: fullEntries.length,
    compactCheckCount: compactRows.length,
    chunkCount: chunks.length,
    chunkCheckCounts
  };
};

export const parseSplitCloseoutArgs = (args) => {
  const valueFor = (flag) => {
    const index = args.indexOf(flag);
    return index < 0 ? undefined : args[index + 1];
  };
  const fullManifestPath = valueFor("--full-manifest");
  const compactBodyPath = valueFor("--compact-body");
  if (!fullManifestPath || fullManifestPath.startsWith("--")) {
    throw new Error("--full-manifest requires a path");
  }
  if (!compactBodyPath || compactBodyPath.startsWith("--")) {
    throw new Error("--compact-body requires a path");
  }

  const chunks = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] !== "--chunk") continue;
    const [manifestPath, bodyPath, url] = args.slice(index + 1, index + 4);
    if (!manifestPath || !bodyPath || !url || [manifestPath, bodyPath, url].some((value) => value.startsWith("--"))) {
      throw new Error("--chunk requires subset manifest path, body path, and stable URL");
    }
    chunks.push({ manifestPath, bodyPath, url });
    index += 3;
  }
  if (!chunks.length) throw new Error("at least one --chunk tuple is required");

  return { fullManifestPath, compactBodyPath, chunks };
};

const isCli = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isCli) {
  const args = process.argv.slice(2);
  if (args.includes("--help")) {
    console.error(usage);
    process.exit(0);
  }

  try {
    const parsed = parseSplitCloseoutArgs(args);
    const result = verifySplitCloseoutFamily({
      fullManifest: JSON.parse(readFileSync(parsed.fullManifestPath, "utf8")),
      compactBody: readFileSync(parsed.compactBodyPath, "utf8"),
      chunks: parsed.chunks.map((chunk) => ({
        manifest: JSON.parse(readFileSync(chunk.manifestPath, "utf8")),
        body: readFileSync(chunk.bodyPath, "utf8"),
        url: chunk.url
      }))
    });
    const chunkLabel = `${result.chunkCount} chunk${result.chunkCount === 1 ? "" : "s"}`;
    console.log(
      `Split closeout family verification passed: ${result.fullCheckCount} checks across compact body (${result.compactCheckCount}) plus ${chunkLabel} (${result.chunkCheckCounts.join("+")}); compact body cites every stable chunk URL.`
    );
  } catch (error) {
    console.error(`Split closeout family verification failed:\n- ${error.message}`);
    console.error(usage);
    process.exit(1);
  }
}
