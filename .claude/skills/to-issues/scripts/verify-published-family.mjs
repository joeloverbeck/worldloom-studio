#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const usage = `Usage:
  node .claude/skills/to-issues/scripts/verify-published-family.mjs <manifest.json>

The manifest records the approved count, parent/ledger posture, shared run sheet,
and one entry per published child. See references/publication-protocol.md.`;

const readText = (path) => {
  try {
    return readFileSync(resolve(path), "utf8");
  } catch (error) {
    throw new Error(`Cannot read ${path}: ${error.message}`);
  }
};

const readJson = (path) => {
  try {
    return JSON.parse(readText(path));
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error(`Cannot parse ${path}: ${error.message}`);
    throw error;
  }
};

const unique = (values) => [...new Set(values)].sort();

const normalizeMarkdown = (value) => value.replace(/\r\n/g, "\n").trimEnd();

const sectionBody = (body, heading) => {
  const start = body.indexOf(heading);
  if (start < 0) return "";
  const remainder = body.slice(start + heading.length);
  const nextHeading = remainder.search(/\n## /);
  return nextHeading < 0 ? remainder : remainder.slice(0, nextHeading);
};

const blockerReferences = (body) => unique(sectionBody(body, "## Blocked by").match(/#\d+/g) ?? []);

const labelNames = (labels) => unique((labels ?? []).map((label) => typeof label === "string" ? label : label.name));

const allTrue = (checks) => Object.values(checks).every(Boolean);

const validateManifest = (manifest) => {
  const errors = [];
  if (!Number.isInteger(manifest.approvedCount) || manifest.approvedCount < 1) {
    errors.push("approvedCount must be a positive integer");
  }
  if (!manifest.parent || !Number.isInteger(manifest.parent.number) || !manifest.parent.token) {
    errors.push("parent.number and parent.token are required");
  }
  if (!manifest.runSheet) errors.push("runSheet is required");
  if (!Array.isArray(manifest.children) || manifest.children.length === 0) {
    errors.push("children must be a non-empty array");
  }
  const childNumbers = (manifest.children ?? []).map((child) => child.number);
  if (unique(childNumbers).length !== childNumbers.length) errors.push("children numbers must be unique");
  for (const [index, child] of (manifest.children ?? []).entries()) {
    const prefix = `children[${index}]`;
    if (!Number.isInteger(child.number)) errors.push(`${prefix}.number must be an integer`);
    if (!child.title) errors.push(`${prefix}.title is required`);
    if (!child.bodyFile) errors.push(`${prefix}.bodyFile is required`);
    if (!child.slice) errors.push(`${prefix}.slice is required`);
    if (!Array.isArray(child.labels) || child.labels.length === 0) errors.push(`${prefix}.labels is required`);
    if (!Array.isArray(child.blockers)) errors.push(`${prefix}.blockers must be an array`);
    if (!(child.checklistMapped === "yes" || /^N\/A - .+/.test(child.checklistMapped ?? ""))) {
      errors.push(`${prefix}.checklistMapped must be "yes" or "N/A - <reason>"`);
    }
    if ((child.blockers ?? []).length === 0 && !child.noBlockerPhrase) {
      errors.push(`${prefix}.noBlockerPhrase is required when blockers is empty`);
    }
  }
  const ledger = manifest.parent?.ledger;
  if (!ledger || !["posted", "skipped"].includes(ledger.status)) {
    errors.push("parent.ledger.status must be posted or skipped");
  } else if (ledger.status === "posted" && (!ledger.commentUrl || !ledger.bodyFile)) {
    errors.push("a posted parent ledger requires commentUrl and bodyFile");
  } else if (ledger.status === "skipped" && !ledger.reason) {
    errors.push("a skipped parent ledger requires a reason");
  }
  return errors;
};

export const verifyPublishedFamily = ({
  manifest,
  childPayloads,
  stagedBodies,
  parentPayload,
  ledgerBody = null,
  checklistVerified,
}) => {
  const children = manifest.children.map((expected) => {
    const actual = childPayloads.get(expected.number);
    const body = actual?.body ?? "";
    const actualBlockers = blockerReferences(body);
    const expectedBlockers = unique(expected.blockers);
    const actualLabels = labelNames(actual?.labels);
    const expectedBody = stagedBodies.get(expected.number) ?? "";
    const checks = {
      fetched: actual != null,
      titleMatches: actual?.title === expected.title,
      stateMatches: actual?.state === (expected.state ?? "OPEN"),
      labelsPresent: expected.labels.every((label) => actualLabels.includes(label)),
      parentPresent: body.includes(manifest.parent.token),
      stagedBodyMatches: normalizeMarkdown(body) === normalizeMarkdown(expectedBody),
      hasWhat: body.includes("## What to build"),
      hasAcceptance: body.includes("## Acceptance criteria"),
      hasPrinciples: body.includes("## Principles"),
      storyCoverageMatches: expected.expectStories === false || body.includes("## User stories covered"),
      blockersMatch:
        actualBlockers.length === expectedBlockers.length &&
        expectedBlockers.every((reference) => actualBlockers.includes(reference)),
      noBlockerPhraseMatches:
        expectedBlockers.length > 0 || body.includes(expected.noBlockerPhrase),
      noPlaceholders: !/#SLICE|PLACEHOLDER/.test(body),
      noHome: !body.includes("/home/"),
      noTmp: !body.includes("/tmp"),
      checklistMapped: checklistVerified && (expected.checklistMapped === "yes" || /^N\/A - .+/.test(expected.checklistMapped)),
    };
    return {
      actualBlockers,
      checks,
      expectedBlockers,
      labels: actualLabels,
      number: expected.number,
      state: actual?.state ?? null,
      title: actual?.title ?? expected.title,
      url: actual?.url ?? null,
    };
  });

  const ledger = manifest.parent.ledger;
  const comment = ledger.status === "posted"
    ? (parentPayload?.comments ?? []).find((candidate) => candidate.url === ledger.commentUrl)
    : null;
  const parentChecks = {
    fetched: parentPayload != null,
    numberMatches: parentPayload?.number === manifest.parent.number,
    stateMatches: parentPayload?.state === (manifest.parent.state ?? "OPEN"),
    ledgerPostureValid:
      ledger.status === "skipped"
        ? ledger.reason.trim().length > 0
        : comment != null && normalizeMarkdown(comment.body) === normalizeMarkdown(ledgerBody ?? ""),
    ledgerChildrenPresent:
      ledger.status === "skipped"
        ? true
        : manifest.children.every((child) => comment?.body.includes(`#${child.number}`)),
    ledgerNoPlaceholders:
      ledger.status === "skipped" || !/#SLICE|PLACEHOLDER/.test(comment?.body ?? ""),
    ledgerNoHome: ledger.status === "skipped" || !(comment?.body ?? "").includes("/home/"),
    ledgerNoTmp: ledger.status === "skipped" || !(comment?.body ?? "").includes("/tmp"),
  };

  const checks = {
    approvedCreatedCount:
      manifest.children.length === manifest.approvedCount &&
      children.filter((child) => child.checks.fetched).length === manifest.approvedCount,
    checklistVerified,
    childrenPass: children.every((child) => allTrue(child.checks)),
    parentPass: allTrue(parentChecks),
  };
  return {
    approvedCount: manifest.approvedCount,
    checks,
    children,
    failedChecks: Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name),
    mode: "published-family",
    parent: {
      checks: parentChecks,
      ledgerStatus: ledger.status,
      number: manifest.parent.number,
      state: parentPayload?.state ?? null,
      url: parentPayload?.url ?? null,
    },
  };
};

const fetchIssue = (number, includeComments = false) => {
  const fields = includeComments
    ? "number,title,body,labels,state,url,comments"
    : "number,title,body,labels,state,url";
  const output = execFileSync("gh", ["issue", "view", String(number), "--json", fields], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return JSON.parse(output);
};

const runChecklistValidation = (manifest) => {
  const validator = fileURLToPath(new URL("./validate-publication.mjs", import.meta.url));
  const args = [validator, "run-sheet", resolve(manifest.runSheet)];
  for (const child of manifest.children) {
    if (child.checklistMapped === "yes") {
      args.push("--slice-body", `${child.slice}=${resolve(child.bodyFile)}`);
    } else {
      args.push("--unaffected-slice", child.slice);
    }
  }
  const result = spawnSync(process.execPath, args, { encoding: "utf8" });
  let report = null;
  try {
    report = JSON.parse(result.stdout);
  } catch {
    report = { stderr: result.stderr, stdout: result.stdout };
  }
  return { passed: result.status === 0, report };
};

const main = () => {
  const [manifestFile, ...rest] = process.argv.slice(2);
  if (!manifestFile || rest.length > 0 || manifestFile === "--help") {
    console.log(usage);
    process.exit(manifestFile === "--help" ? 0 : 2);
  }

  try {
    const manifest = readJson(manifestFile);
    const manifestErrors = validateManifest(manifest);
    if (manifestErrors.length > 0) {
      console.error(JSON.stringify({ manifestErrors, mode: "published-family" }, null, 2));
      process.exit(2);
    }

    const checklist = runChecklistValidation(manifest);
    const stagedBodies = new Map(manifest.children.map((child) => [child.number, readText(child.bodyFile)]));
    const childPayloads = new Map(manifest.children.map((child) => [child.number, fetchIssue(child.number)]));
    const parentPayload = fetchIssue(manifest.parent.number, true);
    const ledgerBody = manifest.parent.ledger.status === "posted"
      ? readText(manifest.parent.ledger.bodyFile)
      : null;
    const report = verifyPublishedFamily({
      manifest,
      childPayloads,
      stagedBodies,
      parentPayload,
      ledgerBody,
      checklistVerified: checklist.passed,
    });
    report.checklistReport = checklist.report;
    console.log(JSON.stringify(report, null, 2));
    if (report.failedChecks.length > 0) process.exit(1);
  } catch (error) {
    console.error(JSON.stringify({ error: error.message, mode: "published-family" }, null, 2));
    process.exit(2);
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main();
