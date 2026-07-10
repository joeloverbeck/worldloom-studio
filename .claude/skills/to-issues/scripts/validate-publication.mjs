#!/usr/bin/env node

import { readFileSync } from "node:fs";

const CHECKLIST_ITEMS = [
  "package source cited",
  "decision-point contract named",
  "required, optional, skippable, and severity-dependent fields visible where relevant",
  "doctrine at the actual decision point",
  "prompt packet preview, source manifest, and cold external LLM test",
  "advisory/canon separation visible",
  "skip path and reason storage",
  "blockers/substance validation",
  "current, next, and resume state",
  "read-side audit or provenance link",
  "cognitive walkthrough scenario",
];

const usage = `Usage:
  node .claude/skills/to-issues/scripts/validate-publication.mjs child <body-file> [options]
  node .claude/skills/to-issues/scripts/validate-publication.mjs ledger <body-file> [options]
  node .claude/skills/to-issues/scripts/validate-publication.mjs run-sheet <run-sheet-file> [options]

Child options:
  --parent <token>             Require a parent reference.
  --blocker <issue-ref>        Require exactly this blocker; repeat as needed.
  --expect-no-blocker          Require the house-style no-blocker phrase and zero blocker refs.
  --expect-stories             Require the user-story coverage section.
  --expect-checklist-na        Require a checklist N/A summary.
  --expect-ac-count <count>    Require an exact acceptance-criterion count.

Ledger options:
  --child <issue-ref>          Require a child reference; repeat as needed.

Run-sheet options:
  --slice-body <slice>=<path>  Require all canonical checklist rows for an affected slice.
  --unaffected-slice <slice>   Require one checklist-N/A row for an unaffected slice.

Shared options:
  --placeholder-re <pattern>   Placeholder regex; defaults to #SLICE|PLACEHOLDER.
  --help                       Show this help.`;

function failUsage(message) {
  if (message) console.error(message);
  console.error(usage);
  process.exit(2);
}

function requireValue(args, index, option) {
  const value = args[index + 1];
  if (!value || value.startsWith("--")) failUsage(`${option} requires a value.`);
  return value;
}

function parseSliceBody(value) {
  const separator = value.indexOf("=");
  if (separator < 1 || separator === value.length - 1) {
    failUsage("--slice-body requires <slice>=<path>.");
  }
  return { slice: value.slice(0, separator), path: value.slice(separator + 1) };
}

function parseArgs(argv) {
  if (argv.includes("--help")) {
    console.log(usage);
    process.exit(0);
  }
  const [mode, inputFile, ...args] = argv;
  if (!["child", "ledger", "run-sheet"].includes(mode) || !inputFile) failUsage();

  const options = {
    blockers: [],
    children: [],
    expectAcCount: null,
    expectChecklistNa: false,
    expectNoBlocker: false,
    expectStories: false,
    parent: null,
    placeholderRe: "#SLICE|PLACEHOLDER",
    sliceBodies: [],
    unaffectedSlices: [],
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--expect-no-blocker") options.expectNoBlocker = true;
    else if (argument === "--expect-stories") options.expectStories = true;
    else if (argument === "--expect-checklist-na") options.expectChecklistNa = true;
    else if (["--parent", "--blocker", "--child", "--expect-ac-count", "--placeholder-re", "--slice-body", "--unaffected-slice"].includes(argument)) {
      const value = requireValue(args, index, argument);
      if (argument === "--parent") options.parent = value;
      else if (argument === "--blocker") options.blockers.push(value);
      else if (argument === "--child") options.children.push(value);
      else if (argument === "--placeholder-re") options.placeholderRe = value;
      else if (argument === "--slice-body") options.sliceBodies.push(parseSliceBody(value));
      else if (argument === "--unaffected-slice") options.unaffectedSlices.push(value);
      else {
        const count = Number(value);
        if (!Number.isInteger(count) || count < 1) failUsage("--expect-ac-count requires a positive integer.");
        options.expectAcCount = count;
      }
      index += 1;
    } else failUsage(`Unknown option: ${argument}`);
  }

  if (mode === "child" && options.expectNoBlocker && options.blockers.length > 0) {
    failUsage("Use --expect-no-blocker or --blocker, not both.");
  }
  if (mode === "run-sheet" && options.sliceBodies.length === 0 && options.unaffectedSlices.length === 0) {
    failUsage("run-sheet mode requires --slice-body or --unaffected-slice.");
  }
  return { inputFile, mode, options };
}

function readText(path) {
  try {
    const text = readFileSync(path, "utf8");
    if (!text.trim()) throw new Error("file is empty");
    return text;
  } catch (error) {
    console.error(`Cannot read ${path}: ${error.message}`);
    process.exit(2);
  }
}

function unique(values) {
  return [...new Set(values)].sort();
}

function sectionBody(body, heading) {
  const start = body.indexOf(heading);
  if (start < 0) return "";
  const remainder = body.slice(start + heading.length);
  const nextHeading = remainder.search(/\n## /);
  return nextHeading < 0 ? remainder : remainder.slice(0, nextHeading);
}

function commonArtifactChecks(body, placeholderRe) {
  let placeholderPattern;
  try {
    placeholderPattern = new RegExp(placeholderRe);
  } catch (error) {
    failUsage(`Invalid --placeholder-re: ${error.message}`);
  }
  return {
    hasContent: body.trim().length > 0,
    noPatchMarkers: !/\*\*\* (Begin|End) Patch/.test(body),
    noPlaceholders: !placeholderPattern.test(body),
  };
}

function commonBodyChecks(body, placeholderRe) {
  return {
    ...commonArtifactChecks(body, placeholderRe),
    noHome: !body.includes("/home/"),
    noTmp: !body.includes("/tmp"),
  };
}

function acceptanceCount(body) {
  return (body.match(/^- \[ \] /gm) ?? []).length;
}

function validateChild(body, options) {
  const blockedBy = sectionBody(body, "## Blocked by");
  const actualBlockers = unique(blockedBy.match(/#\d+/g) ?? []);
  const expectedBlockers = unique(options.blockers);
  const count = acceptanceCount(body);
  const checks = {
    ...commonBodyChecks(body, options.placeholderRe),
    hasParent: options.parent == null || body.includes(options.parent),
    hasWhat: body.includes("## What to build"),
    hasAcceptance: body.includes("## Acceptance criteria"),
    hasAcceptanceItems: count > 0,
    hasBlockedBy: body.includes("## Blocked by"),
    hasPrinciples: body.includes("## Principles"),
    hasStoryCoverage: !options.expectStories || body.includes("## User stories covered"),
    hasChecklistNa:
      !options.expectChecklistNa || /(?:Browser-visible guidance checklist mapped|checklist mapped): N\/A/i.test(body),
    hasNoBlocker:
      !options.expectNoBlocker ||
      (body.includes("None - can start immediately") && actualBlockers.length === 0),
    hasExpectedBlockers:
      options.expectNoBlocker || expectedBlockers.every((reference) => actualBlockers.includes(reference)),
    hasOnlyExpectedBlockers:
      options.expectNoBlocker ||
      options.blockers.length === 0 ||
      actualBlockers.every((reference) => expectedBlockers.includes(reference)),
    hasExpectedAcceptanceCount: options.expectAcCount == null || count === options.expectAcCount,
  };
  return { acceptanceCount: count, actualBlockers, expectedBlockers, checks };
}

function validateLedger(body, options) {
  const checks = {
    ...commonBodyChecks(body, options.placeholderRe),
    hasChildMap: body.includes("Child Issue Map"),
    hasBreakdownDecisions: body.includes("Breakdown decisions"),
    hasStoryCoverage: body.includes("Story coverage"),
    hasChildren: options.children.every((reference) => body.includes(reference)),
  };
  return { expectedChildren: unique(options.children), checks };
}

function parseChecklistRows(body) {
  return body
    .split(/\r?\n/)
    .filter((line) => /^\|.*\|$/.test(line.trim()))
    .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
    .filter((cells) => cells.length === 4)
    .filter((cells) => cells[0].toLowerCase() !== "slice")
    .filter((cells) => !cells.every((cell) => /^-+$/.test(cell)));
}

function referencedAcceptanceOrdinals(coverage) {
  const ordinals = [];
  for (const match of coverage.matchAll(/\bAC\s+(\d+)(?:-(\d+))?/g)) {
    const start = Number(match[1]);
    const end = match[2] == null ? start : Number(match[2]);
    ordinals.push(start);
    if (match[2] != null) ordinals.push(end);
  }
  return ordinals;
}

function validateAffectedSlice(rows, slice, path) {
  const body = readText(path);
  const count = acceptanceCount(body);
  const sliceRows = rows.filter((row) => row[0] === slice);
  const actualItems = sliceRows.map((row) => row[1]);
  const missingItems = CHECKLIST_ITEMS.filter((item) => !actualItems.includes(item));
  const unexpectedItems = actualItems.filter((item) => !CHECKLIST_ITEMS.includes(item));
  const duplicateItems = unique(actualItems.filter((item, index) => actualItems.indexOf(item) !== index));
  const invalidCoverage = [];
  const invalidOrdinals = [];

  for (const [, item, coverage, reason] of sliceRows) {
    const hasNa = /^N\/A - .+/.test(reason);
    const hasCoverage = /\bAC\s+\d+/.test(coverage) || /"[^"]+"/.test(coverage);
    if (!hasNa && !hasCoverage) invalidCoverage.push(item);
    for (const ordinal of referencedAcceptanceOrdinals(coverage)) {
      if (ordinal < 1 || ordinal > count) invalidOrdinals.push({ item, ordinal });
    }
  }

  const checks = {
    hasAcceptanceItems: count > 0,
    hasExactRowCount: sliceRows.length === CHECKLIST_ITEMS.length,
    hasNoMissingItems: missingItems.length === 0,
    hasNoUnexpectedItems: unexpectedItems.length === 0,
    hasNoDuplicateItems: duplicateItems.length === 0,
    hasCoverageOrNa: invalidCoverage.length === 0,
    hasValidAcceptanceOrdinals: invalidOrdinals.length === 0,
  };
  return {
    acceptanceCount: count,
    checks,
    duplicateItems,
    invalidCoverage,
    invalidOrdinals,
    missingItems,
    path,
    slice,
    unexpectedItems,
  };
}

function validateUnaffectedSlice(rows, slice) {
  const sliceRows = rows.filter((row) => row[0] === slice);
  const expectedItem = "browser-visible guidance checklist";
  const checks = {
    hasSingleRow: sliceRows.length === 1,
    hasChecklistLabel: sliceRows[0]?.[1] === expectedItem,
    hasSpecificNaReason: /^N\/A - .+/.test(sliceRows[0]?.[3] ?? ""),
  };
  return { checks, rows: sliceRows, slice };
}

function validateRunSheet(body, options) {
  const rows = parseChecklistRows(body);
  const affected = options.sliceBodies.map(({ slice, path }) => validateAffectedSlice(rows, slice, path));
  const unaffected = options.unaffectedSlices.map((slice) => validateUnaffectedSlice(rows, slice));
  const configuredSlices = new Set([
    ...options.sliceBodies.map(({ slice }) => slice),
    ...options.unaffectedSlices,
  ]);
  const unconfiguredSlices = unique(rows.map((row) => row[0]).filter((slice) => !configuredSlices.has(slice)));
  const checks = {
    ...commonArtifactChecks(body, options.placeholderRe),
    hasRows: rows.length > 0,
    hasNoUnconfiguredSlices: unconfiguredSlices.length === 0,
    affectedSlicesPass: affected.every((report) => Object.values(report.checks).every(Boolean)),
    unaffectedSlicesPass: unaffected.every((report) => Object.values(report.checks).every(Boolean)),
  };
  return { affected, checklistItems: CHECKLIST_ITEMS, checks, rowCount: rows.length, unaffected, unconfiguredSlices };
}

const { inputFile, mode, options } = parseArgs(process.argv.slice(2));
const body = readText(inputFile);
const details =
  mode === "child"
    ? validateChild(body, options)
    : mode === "ledger"
      ? validateLedger(body, options)
      : validateRunSheet(body, options);
const failedChecks = Object.entries(details.checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);
const report = { mode, inputFile, ...details, failedChecks };

console.log(JSON.stringify(report, null, 2));
if (failedChecks.length > 0) process.exit(1);
