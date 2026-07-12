import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test, { after } from "node:test";
import { spawnSync } from "node:child_process";

const directory = mkdtempSync(join(tmpdir(), "worldloom-review-fallback-"));
const script = fileURLToPath(new URL("./validate-review-fallback-body.mjs", import.meta.url));
const manifestPath = join(directory, "manifest.json");
const siblingManifestPath = join(directory, "sibling-manifest.json");
let sequence = 0;

writeFileSync(
  manifestPath,
  JSON.stringify({
    version: 1,
    issues: [{ number: 359, title: "Review child", checks: [{ id: "AC1", kind: "acceptance", text: "Behavior" }] }]
  })
);

writeFileSync(
  siblingManifestPath,
  JSON.stringify({
    version: 1,
    issues: [
      {
        number: 369,
        title: "First sibling",
        checks: [
          { id: "AC1", kind: "acceptance", text: "First" },
          { id: "AC2", kind: "acceptance", text: "Second" },
          { id: "AC3", kind: "acceptance", text: "Third" }
        ]
      },
      { number: 370, title: "Second sibling", checks: [{ id: "AC2", kind: "acceptance", text: "Second" }] }
    ]
  })
);

const identityBlock = `Evidence identity refresh:
- Current evidence identities: fixture paths none; browser sessions none; packet paths/hashes none; active revisions none; artifacts none
- Historical red identities retained: none
- Superseded evidence identities: fixture paths none; browser sessions none; packet paths/hashes none; active revisions none; artifacts none
- Superseded-token sweep: N/A because every superseded category is none
`;

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
Spec sequence coverage: sequence: N/A because the reviewed acceptance is not sequence-sensitive

Residual findings: none.
Browser/manual evidence freshness: N/A because no browser/manual evidence was used
Browser/manual console state: N/A because no browser/manual evidence was used
Backend process currentness: N/A because no browser/manual evidence was used
${identityBlock}
Axis summary: Standards 0/none, Spec 0/none

Review fallback gate passed: frame yes; delegation policy source yes; Standards yes; Spec yes; child table N/A; smell baseline yes; evidence identities yes; found-vs-residual N/A; closeout line N/A; immediate-fix block N/A; tdd fielded closeout gate N/A; verification/browser freshness N/A.
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

  const copiedFixtureBody = browserBody
    .replace(
      "Current evidence identities: fixture paths none; browser sessions none",
      "Current evidence identities: fixture paths /tmp/review.sqlite; browser sessions none"
    )
    .replace(
      "expected API field probe returned created",
      "expected API field probe returned created; stateful fixture snapshot method sqlite .backup; snapshot source /srv/source.sqlite; expected-state probe GET /api/records returned record 42"
    );
  const copiedFixture = runValidator(copiedFixtureBody, ["--browser"]);
  assert.equal(copiedFixture.status, 0, copiedFixture.stderr);

  const missingSnapshot = runValidator(
    copiedFixtureBody.replace(
      "; stateful fixture snapshot method sqlite .backup; snapshot source /srv/source.sqlite; expected-state probe GET /api/records returned record 42",
      ""
    ),
    ["--browser"]
  );
  assert.notEqual(missingSnapshot.status, 0);
  assert.match(missingSnapshot.stderr, /stateful fixture snapshot/);

  const noStatefulCopy = runValidator(
    copiedFixtureBody.replace(
      "stateful fixture snapshot method sqlite .backup; snapshot source /srv/source.sqlite; expected-state probe GET /api/records returned record 42",
      "N/A because no stateful fixture was copied"
    ),
    ["--browser"]
  );
  assert.equal(noStatefulCopy.status, 0, noStatefulCopy.stderr);
});

test("requires exact sequence-aware child coverage when --child-family is used", () => {
  const missingManifest = runValidator(baseBody, ["--child-family"]);
  assert.notEqual(missingManifest.status, 0);
  assert.match(missingManifest.stderr, /acceptance manifest/);

  const childFlags = ["--child-family", "--acceptance-manifest", manifestPath];
  const missing = runValidator(baseBody, childFlags);
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /PRD child coverage table header/);

  const childFamilyBody = baseBody
    .replace("child table N/A", "child table yes")
    .replace(
      "Spec sequence coverage: sequence: N/A because the reviewed acceptance is not sequence-sensitive\n\nResidual findings",
      `Spec sequence coverage: sequence: N/A because the reviewed acceptance is not sequence-sensitive

| Issue | Acceptance source | Evidence reviewed | Findings/residuals |
|---|---|---|---|
| #359 | issue #359 AC1; sequence: N/A because AC1 is not sequence-sensitive | validator test | none |

Residual findings`
    );
  const complete = runValidator(childFamilyBody, childFlags);
  assert.equal(complete.status, 0, complete.stderr);

  const noSequence = runValidator(
    childFamilyBody.replace("; sequence: N/A because AC1 is not sequence-sensitive", ""),
    childFlags
  );
  assert.notEqual(noSequence.status, 0);
  assert.match(noSequence.stderr, /sequence:/);
});

test("requires exact sibling coverage when --issue-set is used", () => {
  const issueSetFlags = ["--issue-set", "--acceptance-manifest", siblingManifestPath];
  const issueSetBody = baseBody
    .replace("child table N/A", "child table yes")
    .replace(
      "Spec sequence coverage: sequence: N/A because the reviewed acceptance is not sequence-sensitive\n\nResidual findings",
      `Spec sequence coverage: sequence: N/A because the reviewed acceptance is not sequence-sensitive

| Issue | Acceptance source | Evidence reviewed | Findings/residuals |
|---|---|---|---|
| #369 | issue #369 AC1-AC3; sequence: prepare -> validate and observe output | validator test | none |
| #370 | issue #370 AC2; sequence: N/A because AC2 is not sequence-sensitive | validator test | none |

Residual findings`
    );

  const missingManifest = runValidator(issueSetBody, ["--issue-set"]);
  assert.notEqual(missingManifest.status, 0);
  assert.match(missingManifest.stderr, /acceptance manifest/);

  const complete = runValidator(issueSetBody, issueSetFlags);
  assert.equal(complete.status, 0, complete.stderr);

  const missingSibling = runValidator(issueSetBody.replace(/^\| #370 .*\n/m, ""), issueSetFlags);
  assert.notEqual(missingSibling.status, 0);
  assert.match(missingSibling.stderr, /missing issue #370/);

  const unexpectedSibling = runValidator(
    issueSetBody.replace(
      "| #370 | issue #370 AC2; sequence: N/A because AC2 is not sequence-sensitive | validator test | none |",
      `| #370 | issue #370 AC2; sequence: N/A because AC2 is not sequence-sensitive | validator test | none |
| #371 | issue #371 AC1; sequence: N/A because AC1 is not sequence-sensitive | validator test | none |`
    ),
    issueSetFlags
  );
  assert.notEqual(unexpectedSibling.status, 0);
  assert.match(unexpectedSibling.stderr, /unexpected issue #371/);

  const missingCheck = runValidator(
    issueSetBody.replace(
      "issue #370 AC2; sequence: N/A because AC2 is not sequence-sensitive",
      "issue #370 criterion 2; sequence: N/A because criterion 2 is not sequence-sensitive"
    ),
    issueSetFlags
  );
  assert.notEqual(missingCheck.status, 0);
  assert.match(missingCheck.stderr, /missing acceptance source AC2/);
});

test("forwards --closing to nested TDD validation", () => {
  const body = `${baseBody}
TDD closeout gate: nested TDD evidence follows
TDD evidence gate passed: durable sink /tmp/review-closeout.md; compact table/header present after structural check; seams accounted for all listed; CONTEXT.md status present; ADRs/principles/docs status present; sequence evidence N/A; evidence identities present; partial-red / red-first skip reasons listed; evidence-only rows none; existing-test contract-change rows none.
`;
  const withoutClosing = runValidator(body, ["--tdd"]);
  assert.doesNotMatch(withoutClosing.stderr, /published TDD closeout field/);

  const withClosing = runValidator(body, ["--tdd", "--closing"]);
  assert.notEqual(withClosing.status, 0);
  assert.match(withClosing.stderr, /published TDD closeout field/);
});

test("requires sequence disposition for an ordinary zero-finding Spec review", () => {
  const result = runValidator(
    baseBody.replace("Spec sequence coverage: sequence: N/A because the reviewed acceptance is not sequence-sensitive\n", "")
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Spec sequence coverage/);
});

test("requires review-native evidence identity reconciliation", () => {
  const result = runValidator(baseBody.replace(identityBlock, ""));
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Evidence identity refresh/);
});

test("accepts the cross-validator-safe superseded-token sweep", () => {
  const body = baseBody
    .replace(
      "Historical red identities retained: none",
      "Historical red identities retained: fixture paths red.json; browser sessions none; packet paths/hashes none; active revisions none; artifacts none"
    )
    .replace(
      "Superseded evidence identities: fixture paths none; browser sessions none; packet paths/hashes none; active revisions none; artifacts none",
      "Superseded evidence identities: fixture paths old.json; browser sessions none; packet paths/hashes none; active revisions none; artifacts none"
    )
    .replace(
      "Superseded-token sweep: N/A because every superseded category is none",
      "Superseded-token sweep: rg old.json body.md found no hits outside classified identity/history lines and no active-proof hits; historical-red red.json classified as failing history"
    );

  const result = runValidator(body);
  assert.equal(result.status, 0, result.stderr);
});
