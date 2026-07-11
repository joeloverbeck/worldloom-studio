import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test, { after } from "node:test";
import { spawnSync } from "node:child_process";

const directory = mkdtempSync(join(tmpdir(), "worldloom-review-fallback-"));
const script = fileURLToPath(new URL("./validate-review-fallback-body.mjs", import.meta.url));
let sequence = 0;

after(() => rmSync(directory, { recursive: true, force: true }));

const runValidator = (body, flags = []) => {
  sequence += 1;
  const bodyPath = join(directory, `body-${sequence}.md`);
  writeFileSync(bodyPath, body);
  return spawnSync(process.execPath, [script, bodyPath, ...flags], { encoding: "utf8" });
};

const baseBody = `Review frame: fixed point input HEAD~1; fixed point resolved SHA abc1234; reviewed HEAD SHA def5678; diff command git diff abc1234...HEAD; commits abc1234 review target; worktree scope committed diff only; spec source issue #355.

## Standards

Fallback used: policy-blocked delegation.
Delegation policy source: collaboration policy inspected.
Sources reviewed: AGENTS.md and smell baseline.
Smell baseline applied: yes.
Findings: none.

## Spec

Sources reviewed: issue #355.
Findings: none.

Residual findings: none.
Browser/manual evidence freshness: N/A because no browser/manual evidence was used
Browser/manual console state: N/A because no browser/manual evidence was used
Backend process currentness: N/A because no browser/manual evidence was used
Axis summary: Standards 0/none, Spec 0/none

Review fallback gate passed: frame yes; delegation policy source yes; Standards yes; Spec yes; child table N/A; smell baseline yes; found-vs-residual N/A; closeout line N/A; immediate-fix block N/A; tdd fielded closeout gate N/A; verification/browser freshness N/A.
`;

const browserBody = baseBody
  .replace("N/A because no browser/manual evidence was used", "browser smoke rerun passed on final tree with observed result loaded workflow")
  .replace("N/A because no browser/manual evidence was used", "0 errors and 0 warnings in the clean browser session")
  .replace(
    "N/A because no browser/manual evidence was used",
    "server command pnpm dev; watch/reload mode watch; process or port ownership PID 123 on port 4173; restart/reload proof server restarted; expected API field probe returned created"
  )
  .replace("verification/browser freshness N/A", "verification/browser freshness yes");

test("accepts explicit no-browser fallback evidence", () => {
  const result = runValidator(baseBody);
  assert.equal(result.status, 0, result.stderr);
});

test("accepts current backend evidence when --browser is used", () => {
  const result = runValidator(browserBody, ["--browser"]);
  assert.equal(result.status, 0, result.stderr);
});

test("rejects no-browser and stale backend claims when --browser is used", () => {
  const noBrowser = runValidator(baseBody, ["--browser"]);
  assert.notEqual(noBrowser.status, 0);
  assert.match(noBrowser.stderr, /--browser requires current browser\/manual freshness/);

  const stale = runValidator(
    browserBody.replace(
      "server command pnpm dev; watch/reload mode watch; process or port ownership PID 123 on port 4173; restart/reload proof server restarted; expected API field probe returned created",
      "server reachable on port 4173"
    ),
    ["--browser"]
  );
  assert.notEqual(stale.status, 0);
  assert.match(stale.stderr, /Backend process currentness/);
});
