#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { buildAuditScaffold } from "./build-acceptance-manifest.mjs";

export const DEFAULT_CLOSEOUT_BODY_MAX_BYTES = 65_536;

const usage = `Usage: node .claude/skills/implement/scripts/build-closeout-body.mjs <manifest.json> --output <body.md> --parent <issue> --review <normal|fallback> [--audit-input <audit.md>] [--tdd-parent-rollup] [--browser] [--principles] [--local-only] [--fixed-child <none|pending|final>] [--max-bytes <positive integer>]`;

export const assertCloseoutBodySize = (body, maxBytes = DEFAULT_CLOSEOUT_BODY_MAX_BYTES) => {
  if (!Number.isInteger(maxBytes) || maxBytes <= 0) {
    throw new Error("max bytes must be a positive integer");
  }

  const bodyBytes = Buffer.byteLength(body, "utf8");
  if (bodyBytes > maxBytes) {
    throw new Error(
      `closeout body is ${bodyBytes} bytes; maximum is ${maxBytes} bytes. Shorten concrete evidence or split it into separately validated durable tracker sinks before publication`
    );
  }

  return body;
};

const tableText = (value) => value.replaceAll("|", "&#124;").replaceAll("\n", " ").trim();

const requireManifest = (manifest) => {
  if (!Array.isArray(manifest?.issues) || manifest.issues.length === 0) {
    throw new Error("manifest must contain a non-empty issues array");
  }

  for (const issue of manifest.issues) {
    if (!Number.isInteger(issue?.number) || !Array.isArray(issue?.checks) || issue.checks.length === 0) {
      throw new Error("each manifest issue must contain an integer number and non-empty checks array");
    }
    for (const check of issue.checks) {
      if (typeof check?.id !== "string" || !check.id || typeof check?.text !== "string") {
        throw new Error(`manifest issue #${issue.number} contains an invalid check`);
      }
    }
  }
};

const exactAuditKey = (issue, check) =>
  `| #${issue.number} | ${check.id} - ${tableText(check.text)} |`;

export const validateAuditInput = (manifest, audit) => {
  const header = "| Issue | Acceptance criterion or conformance check | Evidence | Status |";
  if (!audit.includes(header)) throw new Error("audit input is missing the exact audit table header");

  for (const issue of manifest.issues) {
    for (const check of issue.checks) {
      const key = exactAuditKey(issue, check);
      const count = audit.split(key).length - 1;
      if (count !== 1) {
        throw new Error(`#${issue.number} ${check.id} requires exactly one exact audit row; found ${count}`);
      }
    }
  }

  return audit.trim();
};

const acceptanceIds = (issue) => issue.checks.map((check) => check.id).join(", ");

const tddBlock = (manifest) => {
  const rows = manifest.issues.map(
    (issue) =>
      `| #${issue.number} | <CONTEXT.md status> | <ADRs/principles/docs status> | <seam> | <red command/failure or skip reason> | <green command/evidence with passing result> | ${acceptanceIds(issue)}; atoms: <authoritative atoms>; proof surfaces: <surface for each atom>; sequence: <ordered proof or justified N/A> | <review fix / red-first skip reason> |`
  );

  return `TDD evidence

| Issue | CONTEXT.md status | ADRs/principles/docs status | Seam | Red command/failure | Green command or evidence | Acceptance covered | Review fix / red-first skip reason |
|---|---|---|---|---|---|---|---|
${rows.join("\n")}

Existing-test contract-change rows: <none or listed expectation-rewrite rows>

TDD review-fix addendum: <review-fix evidence or N/A because review made no fixes>

Browser/manual freshness: <rerun, justified not affected, blocked, or N/A>

TDD closeout preflight:
- Durable sink/body inspected: <stable issue reference>
- Compact table/header: <present after structural check>
- Rows accounted for: <all issues and seams>
- Pre-red recovery status: <status>
- CONTEXT.md status: <present, absent, or N/A>
- ADRs/principles/docs status: <present or N/A>
- Acceptance atom map: <all rows list exact criteria, atoms, and proof surfaces>
- Acceptance sequence map: <all rows list ordered proof or justified N/A>
- Partial-red / red-first skip reasons: <none or listed>
- Evidence-only rows freshness: <none or freshness result>
- Evidence-only browser console state: <state or N/A>
- Evidence-only proof server preflight: <configured ports/owner-check/isolation/proxy/cleanup proof or N/A>
- Evidence-only backend process currentness: <currentness proof or N/A>
- Evidence identity refresh: <same-sink identity block inspected>
- Existing-test contract-change rows: <none or listed>

TDD evidence gate passed: durable sink <stable issue reference>; compact table/header <present after structural check>; seams accounted for <all listed>; CONTEXT.md status <present, absent, or N/A>; ADRs/principles/docs status <present or N/A>; sequence evidence <present or N/A>; evidence identities <present>; partial-red / red-first skip reasons <none or listed>; evidence-only rows <none or listed>; proof server preflight <present or N/A>; existing-test contract-change rows <none or listed>.`;
};

const reviewRows = (manifest) => manifest.issues.map(
  (issue) =>
    `| #${issue.number} | ${acceptanceIds(issue)}; sequence: <ordered events and observing proof or justified N/A> | <diff, tests, docs, and artifacts reviewed> | <none or finding> |`
).join("\n");

const normalReviewBlock = (manifest) => `Review frame: fixed point input <ref>; fixed point resolved SHA <sha>; reviewed HEAD SHA <sha>; diff command \`git diff <resolved SHA>...HEAD\`; commits <commit list>; worktree scope <scope>; excluded dirty files <none or paths>; spec source <issues and specs>.

Review: code-review against <resolved fixed point>; outcome <no findings, findings fixed, or accepted residuals>; verification rerun <commands>.

Review subagents: Standards final reviewer <ID> completed; Spec final reviewer <ID> completed

Review subagent cleanup: Standards <disposition>; Spec <disposition>

## Standards

Sources reviewed: <standards sources and smell baseline>

Findings: <none or findings>

## Spec

Sources reviewed: <issues, PRD, principles, ADRs, and specs>

| Issue | Acceptance source | Evidence reviewed | Findings/residuals |
|---|---|---|---|
${reviewRows(manifest)}

Findings: <none or findings>

Axis summary: Standards <count/worst>, Spec <count/worst>

Residual findings: <none or accepted residual records>

Parent PRD coverage: <parent row present, exact audit rows cited, or N/A>

Spec sequence coverage: sequence: <ordered events and observing proof or justified N/A>`;

const fallbackReviewBlock = (manifest) => `Review frame: fixed point input <ref>; fixed point resolved SHA <sha>; reviewed HEAD SHA <sha>; diff command \`git diff <resolved SHA>...HEAD\`; commits <commit list>; worktree scope <scope>; excluded dirty files <none or paths>; spec source <issues and specs>.

## Standards

Fallback used: <unavailable tooling, policy-blocked delegation, partial-axis fallback, or other reason>.

Delegation policy source: <policy source or unavailable surface>

Sources reviewed: <standards sources and smell baseline>

Smell baseline applied: <yes or justified skip>

Findings: <none or findings>

## Spec

Sources reviewed: <issues, PRD, principles, ADRs, and specs>

| Issue | Acceptance source | Evidence reviewed | Findings/residuals |
|---|---|---|---|
${reviewRows(manifest)}

Findings: <none or findings>

TDD closeout gate: <fielded TDD closeout gate or N/A because no tdd skill was invoked>

Axis summary: Standards <count/worst>, Spec <count/worst>

Residual findings: <none or accepted residual records>

Review fallback gate passed: frame <yes>; delegation policy source <yes>; Standards <yes>; Spec <yes>; child table <yes or N/A>; smell baseline <yes>; evidence identities <yes>; found-vs-residual <yes or N/A>; closeout line <yes>; immediate-fix block <yes or N/A>; tdd fielded closeout gate <yes or N/A>; verification/browser freshness <yes or N/A>.

Review fallback: <why code-review could not run>; standards/spec result <result>; fixes <none or SHA>; verification rerun <commands>.`;

const browserBlock = (browser) => browser
  ? `Browser evidence:
- Route/action/outcome: <production route, action path, and observed result>
- Console state: <0 errors and 0 warnings, classified output, or blocked>
- Backend process currentness: <server command, watch/reload mode, ownership, restart/reload proof, and API probe>
- Final freshness delta: <files touched since smoke and rerun/not-affected/blocked result>`
  : `Browser evidence: N/A because <reason no browser/manual evidence applies>
Console state: N/A because browser evidence is N/A
Backend process currentness: N/A because no browser/manual evidence was used
Final freshness delta: N/A because browser evidence is N/A`;

const identityBlock = `Evidence identity refresh:
- Current evidence identities: fixture paths <paths, none, or structured withheld identity>; browser sessions <names or none>; packet paths/hashes <paths and hashes or none>; active revisions <IDs or none>; artifacts <paths/IDs or none>
- Historical red identities retained: <all five categories or none>
- Superseded evidence identities: fixture paths <paths or none>; browser sessions <names or none>; packet paths/hashes <paths and hashes or none>; active revisions <IDs or none>; artifacts <paths/IDs or none>
- Superseded-token sweep: <rg/grep command and classified result, or N/A because every superseded category is none>`;

const fixedChildBlock = (mode) => {
  if (mode === "pending") {
    return `Fixed child inline close comment: Completed by <final SHA>. Evidence: this parent rollup comment URL
Fixed child final inline close comment inspected: N/A before parent URL exists`;
  }
  if (mode === "final") {
    return `Fixed child inline close comment: Completed by <final SHA>. Evidence: <parent rollup comment URL>
Fixed child final inline close comment inspected: Completed by <final SHA>. Evidence: <parent rollup comment URL>`;
  }
  return `Fixed child inline close comment: N/A because no fixed-template child closeout applies
Fixed child final inline close comment inspected: N/A because no fixed-template child closeout applies`;
};

export const buildCloseoutBodyScaffold = (manifest, options) => {
  requireManifest(manifest);
  const {
    parentIssue,
    audit,
    reviewMode,
    tddParentRollup = false,
    browser = false,
    principles = false,
    localOnly = false,
    fixedChildMode = "none",
    maxBytes = DEFAULT_CLOSEOUT_BODY_MAX_BYTES
  } = options;

  if (!Number.isInteger(parentIssue) || parentIssue <= 0) throw new Error("parent issue must be a positive integer");
  if (!["normal", "fallback"].includes(reviewMode)) throw new Error("review mode must be normal or fallback");
  if (!["none", "pending", "final"].includes(fixedChildMode)) {
    throw new Error("fixed child mode must be none, pending, or final");
  }

  const auditText = validateAuditInput(manifest, audit ?? buildAuditScaffold(manifest));
  const review = reviewMode === "normal" ? normalReviewBlock(manifest) : fallbackReviewBlock(manifest);
  const tdd = tddParentRollup ? tddBlock(manifest) : "TDD evidence: N/A because no tdd skill was invoked.";
  const localSha = localOnly
    ? "Local-only SHA: <final SHA> is not remote-reachable because <reason>; local-only closeout is acceptable because <user request or repo policy>."
    : "Local-only SHA: N/A because <remote branch contains final SHA>.";
  const principlesLine = principles
    ? "Principles/ADR conformance: <no deliberate exceptions or approved exception>."
    : "Principles/ADR conformance: N/A because no in-scope issue has a Principles section.";

  const body = `Implementation closeout for #${parentIssue}

Scaffold status: incomplete — replace every angle-bracket placeholder and validate before publication.

Final SHA: <final SHA>

${localSha}

Verification:
- \`<exact command>\`: <passed, failed, or blocked with scope>

${tdd}

${review}

${browserBlock(browser)}

${identityBlock}

## Acceptance audit

${auditText}

${principlesLine}

${fixedChildBlock(fixedChildMode)}

Child state snapshot before child closeout: <exact issue states or N/A>

Post-child closure verification before parent closeout: <exact issue states or pending follow-up>

Closeout preflight:
- Audit sink: <stable issue reference>
- Body file(s) inspected: <local body inspected privately or N/A>
- Parent rollup URL: <this comment URL, real URL, or N/A>
- Fixed child inline close comment: <inspection status or N/A>
- Fixed child final inline close comment inspected: <exact final text or N/A>
- Final SHA: <final SHA>
- Remote reachability: <remote branch contains SHA or no remote branch contains SHA>
- Principles/ADR conformance: <present or N/A>
- Local-only SHA: <full explanatory sentence present or N/A>
- TDD evidence: <present or N/A>
- Review evidence: <Review or Review fallback reference>
- Evidence identity refresh: <current/historical/superseded inventory and sweep present>
- Browser console state: <state or N/A>
- Browser evidence freshness: <rerun, not affected, blocked, or N/A>
- Final post-commit freshness delta: <delta and disposition>
- Child states verified: <exact states or N/A>

Closeout gate passed: audit sink <stable issue reference>; review evidence <line or reference>; TDD evidence <present or N/A>; final SHA <sha>; Principles/ADR conformance <present or N/A>; Local-only SHA sentence <full explanatory sentence present or N/A>; child states verified <yes or N/A>; browser evidence <present, N/A, or blocked>.

Closeout body check passed: audit table columns exact; every acceptance checkbox or conformance check named; every satisfied Evidence cell contains atoms/proof surfaces/sequence; every status literal satisfied/blocked/not done; final SHA present; verification evidence present; TDD evidence present or N/A; review evidence present; evidence identity refresh and superseded-token sweep present; Principles/ADR conformance string present or N/A; full Local-only SHA explanatory sentence present or N/A; browser evidence present/N/A/blocked; browser console state recorded when browser evidence is present or N/A/blocked; final browser/manual freshness delta present/N/A; exact fixed child inline comment inspected <yes or N/A>.
`;

  return assertCloseoutBodySize(body, maxBytes);
};

const isCli = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isCli) {
  const args = process.argv.slice(2);
  const valueFlags = ["--output", "--audit-input", "--parent", "--review", "--fixed-child", "--max-bytes"];
  const valueFor = (flag) => {
    const index = args.indexOf(flag);
    return index < 0 ? undefined : args[index + 1];
  };
  const valueIndexes = new Set(
    valueFlags
      .map((flag) => args.indexOf(flag))
      .filter((index) => index >= 0)
      .map((index) => index + 1)
  );
  const manifestPath = args.find((arg, index) => !arg.startsWith("--") && !valueIndexes.has(index));

  if (args.includes("--help")) {
    console.error(usage);
    process.exit(0);
  }

  try {
    if (!manifestPath) throw new Error("manifest path is required");
    const outputPath = valueFor("--output");
    const parentText = valueFor("--parent");
    const reviewMode = valueFor("--review");
    const fixedChildMode = valueFor("--fixed-child") ?? "none";
    for (const flag of ["--output", "--parent", "--review"]) {
      const value = valueFor(flag);
      if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value`);
    }
    if (args.includes("--audit-input")) {
      const value = valueFor("--audit-input");
      if (!value || value.startsWith("--")) throw new Error("--audit-input requires a path");
    }
    if (args.includes("--fixed-child") && (!fixedChildMode || fixedChildMode.startsWith("--"))) {
      throw new Error("--fixed-child requires a value");
    }
    if (args.includes("--max-bytes")) {
      const value = valueFor("--max-bytes");
      if (!value || value.startsWith("--")) throw new Error("--max-bytes requires a value");
    }

    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const auditPath = valueFor("--audit-input");
    const body = buildCloseoutBodyScaffold(manifest, {
      parentIssue: Number(parentText),
      audit: auditPath ? readFileSync(auditPath, "utf8") : undefined,
      reviewMode,
      tddParentRollup: args.includes("--tdd-parent-rollup"),
      browser: args.includes("--browser"),
      principles: args.includes("--principles"),
      localOnly: args.includes("--local-only"),
      fixedChildMode,
      maxBytes: valueFor("--max-bytes") === undefined
        ? DEFAULT_CLOSEOUT_BODY_MAX_BYTES
        : Number(valueFor("--max-bytes"))
    });
    writeFileSync(outputPath, body);
  } catch (error) {
    console.error(`Closeout body scaffold build failed: ${error.message}`);
    console.error(usage);
    process.exit(1);
  }
}
