#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { validateTddCloseoutBody } from "./validate-tdd-closeout-body.mjs";

const usage = "Usage: node .claude/skills/tdd/scripts/verify-split-tdd-closeout-family.mjs --full-manifest <manifest.json> --compact <subset.json> <body.md> --carrier <subset.json> <body.md> <stable-url> --expected-final-sha <sha> [--chunk <subset.json> <body.md> <stable-url> ...]";

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
    if (seenIssues.has(issue.number)) throw new Error(`${label} contains duplicate issue #${issue.number}`);
    seenIssues.add(issue.number);

    const seenChecks = new Set();
    for (const check of issue.checks) {
      const id = typeof check?.id === "string" ? check.id.trim() : "";
      if (!id || typeof check?.text !== "string") {
        throw new Error(`${label} issue #${issue.number} contains an invalid check`);
      }
      const normalizedId = id.toLowerCase();
      if (seenChecks.has(normalizedId)) {
        throw new Error(`${label} issue #${issue.number} contains duplicate check ${id}`);
      }
      seenChecks.add(normalizedId);
      entries.push({
        key: `${issue.number}:${normalizedId}`,
        issueNumber: issue.number,
        id,
        signature: JSON.stringify({ id, kind: check.kind ?? "", text: check.text })
      });
    }
  }
  return entries;
};

const isStableUrl = (value) => {
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol) && Boolean(parsed.hostname);
  } catch {
    return false;
  }
};

const issueNumberFromStableCommentUrl = (value) => {
  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname) return undefined;
    if (!/^#issuecomment-\d+$/.test(parsed.hash)) return undefined;
    const match = parsed.pathname.match(/\/issues\/(\d+)\/?$/);
    return match ? Number(match[1]) : undefined;
  } catch {
    return undefined;
  }
};

export const verifySplitTddCloseoutFamily = ({
  fullManifest,
  compact,
  carrier,
  chunks = [],
  expectedFinalSha
}) => {
  if (!compact?.manifest || typeof compact?.body !== "string") {
    throw new Error("compact manifest and body are required");
  }
  if (!carrier?.manifest || typeof carrier?.body !== "string") {
    throw new Error("carrier manifest and body are required");
  }
  if (!Array.isArray(chunks)) {
    throw new Error("later supplemental TDD chunks must be an array");
  }
  if (typeof expectedFinalSha !== "string" || !/^[0-9a-f]{7,40}$/i.test(expectedFinalSha.trim())) {
    throw new Error("expectedFinalSha must be a concrete 7-40 character hexadecimal commit SHA");
  }

  const errors = [];
  const fullEntries = manifestEntries(fullManifest, "full manifest");
  const fullByKey = new Map(fullEntries.map((entry) => [entry.key, entry]));
  const coveredByKey = new Map();
  const chunkCheckCounts = [];

  const verifyPart = (part, label, { closing = false } = {}) => {
    const entries = manifestEntries(part.manifest, `${label} manifest`);
    const validationErrors = validateTddCloseoutBody(part.body, {
      flags: closing ? ["--parent-rollup", "--closing"] : ["--parent-rollup"],
      acceptanceManifest: part.manifest,
      expectedFinalSha: closing ? expectedFinalSha.trim() : undefined
    });
    for (const error of validationErrors) errors.push(`${label} TDD validation: ${error}`);

    for (const entry of entries) {
      const fullEntry = fullByKey.get(entry.key);
      if (!fullEntry) {
        errors.push(`${label} contains ${entry.key}, which is absent from the full manifest`);
      } else if (entry.signature !== fullEntry.signature) {
        errors.push(`${label} check ${entry.key} does not exactly match the full manifest`);
      }

      if (coveredByKey.has(entry.key)) {
        errors.push(`${entry.key} appears in both ${coveredByKey.get(entry.key)} and ${label}`);
      } else {
        coveredByKey.set(entry.key, label);
      }
    }
    return entries.length;
  };

  const compactCheckCount = verifyPart(compact, "compact body");
  const carrierEntries = manifestEntries(carrier.manifest, "carrier manifest");
  const laterEntries = chunks.flatMap((chunk, index) => manifestEntries(chunk.manifest, `chunk ${index + 1} manifest`));
  const carrierIssueNumbers = [...new Set(carrierEntries.map((entry) => entry.issueNumber))];
  const lowestSupplementalIssue = Math.min(
    ...carrierEntries.map((entry) => entry.issueNumber),
    ...laterEntries.map((entry) => entry.issueNumber)
  );
  if (!carrierIssueNumbers.includes(lowestSupplementalIssue)) {
    errors.push(`carrier must contain the lowest-numbered supplemental issue #${lowestSupplementalIssue}`);
  }

  const carrierCheckCount = verifyPart(carrier, "carrier", { closing: true });
  if (!isStableUrl(carrier.url)) {
    errors.push(`carrier URL is not a stable HTTP(S) URL: ${carrier.url}`);
  } else if (!compact.body.includes(carrier.url)) {
    errors.push(`compact body does not cite carrier URL ${carrier.url}`);
  }
  const carrierUrlIssueNumber = issueNumberFromStableCommentUrl(carrier.url);
  if (carrierUrlIssueNumber !== lowestSupplementalIssue) {
    errors.push(
      `carrier URL must target lowest-numbered supplemental issue #${lowestSupplementalIssue} with a stable issue-comment URL`
    );
  }

  for (const [index, chunk] of chunks.entries()) {
    const label = `chunk ${index + 1}`;
    chunkCheckCounts.push(verifyPart(chunk, label));
    if (!isStableUrl(chunk.url)) {
      errors.push(`${label} URL is not a stable HTTP(S) URL: ${chunk.url}`);
    } else if (!compact.body.includes(chunk.url)) {
      errors.push(`compact body does not cite ${label} URL ${chunk.url}`);
    }
  }

  for (const entry of fullEntries) {
    if (!coveredByKey.has(entry.key)) {
      errors.push(`full-manifest check ${entry.issueNumber}:${entry.id} is missing from every body`);
    }
  }

  if (errors.length) throw new Error(errors.join("\n- "));

  return {
    fullCheckCount: fullEntries.length,
    compactCheckCount,
    carrierCheckCount,
    chunkCount: chunks.length,
    chunkCheckCounts
  };
};

export const parseSplitTddCloseoutArgs = (args) => {
  const fullIndex = args.indexOf("--full-manifest");
  const fullManifestPath = fullIndex >= 0 ? args[fullIndex + 1] : undefined;
  if (!fullManifestPath || fullManifestPath.startsWith("--")) {
    throw new Error("--full-manifest requires a path");
  }

  const compactIndex = args.indexOf("--compact");
  const compactValues = compactIndex >= 0 ? args.slice(compactIndex + 1, compactIndex + 3) : [];
  if (compactValues.length !== 2 || compactValues.some((value) => !value || value.startsWith("--"))) {
    throw new Error("--compact requires subset manifest path and body path");
  }

  const carrierIndex = args.indexOf("--carrier");
  const carrierValues = carrierIndex >= 0 ? args.slice(carrierIndex + 1, carrierIndex + 4) : [];
  if (carrierValues.length !== 3 || carrierValues.some((value) => !value || value.startsWith("--"))) {
    throw new Error("--carrier requires subset manifest path, body path, and stable URL");
  }

  const shaIndex = args.indexOf("--expected-final-sha");
  const expectedFinalSha = shaIndex >= 0 ? args[shaIndex + 1] : undefined;
  if (!expectedFinalSha || expectedFinalSha.startsWith("--")) {
    throw new Error("--expected-final-sha requires a commit SHA");
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
  return {
    fullManifestPath,
    compact: { manifestPath: compactValues[0], bodyPath: compactValues[1] },
    carrier: { manifestPath: carrierValues[0], bodyPath: carrierValues[1], url: carrierValues[2] },
    expectedFinalSha,
    chunks
  };
};

const isCli = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isCli) {
  const args = process.argv.slice(2);
  if (args.includes("--help")) {
    console.error(usage);
    process.exit(0);
  }

  try {
    const parsed = parseSplitTddCloseoutArgs(args);
    const readManifest = (path) => JSON.parse(readFileSync(path, "utf8"));
    const result = verifySplitTddCloseoutFamily({
      fullManifest: readManifest(parsed.fullManifestPath),
      compact: {
        manifest: readManifest(parsed.compact.manifestPath),
        body: readFileSync(parsed.compact.bodyPath, "utf8")
      },
      carrier: {
        manifest: readManifest(parsed.carrier.manifestPath),
        body: readFileSync(parsed.carrier.bodyPath, "utf8"),
        url: parsed.carrier.url
      },
      expectedFinalSha: parsed.expectedFinalSha,
      chunks: parsed.chunks.map((chunk) => ({
        manifest: readManifest(chunk.manifestPath),
        body: readFileSync(chunk.bodyPath, "utf8"),
        url: chunk.url
      }))
    });
    const chunkLabel = `${result.chunkCount} later chunk${result.chunkCount === 1 ? "" : "s"}`;
    const chunkCounts = result.chunkCount ? ` (${result.chunkCheckCounts.join("+")})` : "";
    console.log(
      `Split TDD closeout family verification passed: ${result.fullCheckCount} checks across compact body (${result.compactCheckCount}), carrier (${result.carrierCheckCount}), plus ${chunkLabel}${chunkCounts}; carrier passed closing validation and compact body cites every stable supplemental URL.`
    );
  } catch (error) {
    console.error(`Split TDD closeout family verification failed:\n- ${error.message}`);
    console.error(usage);
    process.exit(1);
  }
}
