import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { unresolvedValue as reviewUnresolvedValue } from "../../code-review/scripts/review-evidence-contract.mjs";
import { validateTddCloseoutBody } from "./validate-tdd-closeout-body.mjs";

const bodyWith = ({
  acceptance =
    "AC1 exact workflow; atoms: proposal + staging + pressure; proof surfaces: production browser; sequence: Proposal -> staging -> Pressure observed in one browser session",
  current = "fixture paths none; browser sessions issue-1; packet paths/hashes proposal.txt abc123; active revisions run-2; artifacts proof.png",
  historical = "fixture FAC-17 retained in the red row",
  superseded = "fixture paths none; browser sessions none; packet paths/hashes none; active revisions none; artifacts none",
  sweep = "N/A because every superseded category is none"
} = {}) => `TDD evidence

| Issue | CONTEXT.md status | ADRs/principles/docs status | Seam | Red command/failure | Green command or evidence | Acceptance covered | Review fix / red-first skip reason |
|---|---|---|---|---|---|---|---|
| #1 | read | ADR 0001 read | red-first public workflow | \`pnpm test -- workflow-order\` failed because Pressure appeared before staging | \`pnpm test -- workflow-order\` passed and production browser observed Proposal then staging then Pressure | ${acceptance} | N/A |

Existing-test contract-change rows: none

TDD closeout preflight:
- Durable sink/body inspected: test fixture
- Compact table/header: present after structural check
- Rows accounted for: all in-scope issues and seams listed
- Pre-red recovery status: N/A - pre-red preflight/table was visible before first red
- CONTEXT.md status: present
- ADRs/principles/docs status: present
- Acceptance atom map: all rows list authoritative atoms and proof surfaces
- Acceptance sequence map: all rows list ordered proof or justified sequence N/A
- Partial-red / red-first skip reasons: none
- Evidence-only rows freshness: none
- Evidence-only backend process currentness: N/A because no browser/manual evidence-only rows
- Evidence identity refresh: same-sink current/historical-red/superseded identity block inspected
- Existing-test contract-change rows: none

Evidence identity refresh:
- Current evidence identities: ${current}
- Historical red identities retained: ${historical}
- Superseded evidence identities: ${superseded}
- Superseded-token sweep: ${sweep}

TDD evidence gate passed: durable sink test fixture; compact table/header present after structural check; seams accounted for all listed; CONTEXT.md status present; ADRs/principles/docs status present; sequence evidence present; evidence identities present; partial-red / red-first skip reasons none; evidence-only rows none; existing-test contract-change rows none.
`;

test("accepts sequence evidence and reconciled evidence identities", () => {
  assert.deepEqual(validateTddCloseoutBody(bodyWith()), []);
});

test("closing rejects local staging paths while interim validation permits them", () => {
  const body = bodyWith().replaceAll("test fixture", "`/tmp/tdd-closeout.md`");

  assert.deepEqual(validateTddCloseoutBody(body), []);
  const closingErrors = validateTddCloseoutBody(body, { flags: ["--closing"] });
  assert.ok(
    closingErrors.some((error) =>
      error.includes("published TDD closeout field Durable sink/body inspected contains local staging path")
    )
  );
  assert.ok(
    closingErrors.some((error) =>
      error.includes("published TDD closeout field TDD evidence gate contains local staging path")
    )
  );
});

test("closing permits local fixture paths outside publishable sink fields", () => {
  const body = bodyWith({
    current:
      "fixture paths /tmp/worldloom-proof.sqlite; browser sessions issue-1; packet paths/hashes proposal.txt abc123; active revisions run-2; artifacts proof.png"
  });

  assert.deepEqual(validateTddCloseoutBody(body, { flags: ["--closing"] }), []);
});

test("rejects a compact row without sequence evidence", () => {
  const body = bodyWith({
    acceptance: "AC1 exact workflow; atoms: proposal + staging + pressure; proof surfaces: production browser"
  });

  assert.ok(validateTddCloseoutBody(body).some((error) => error.includes("must include atoms:, proof surfaces:, and sequence:")));
});

test("rejects sequence N/A without a reason", () => {
  const body = bodyWith({
    acceptance:
      "AC1 exact workflow; atoms: atomic; proof surfaces: focused test; sequence: N/A"
  });

  assert.ok(validateTddCloseoutBody(body).some((error) => error.includes("sequence N/A must include 'because'")));
});

test("rejects an empty sequence value", () => {
  const body = bodyWith({
    acceptance: "AC1 exact workflow; atoms: atomic; proof surfaces: focused test; sequence:"
  });

  assert.ok(validateTddCloseoutBody(body).some((error) => error.includes("empty sequence: value")));
});

test("rejects superseded identities without an active-proof sweep", () => {
  const body = bodyWith({
    superseded:
      "fixture paths old.sqlite; browser sessions old-session; packet paths/hashes old.txt deadbeef; active revisions run-1; artifacts old.png",
    sweep: "checked the body"
  });

  assert.ok(validateTddCloseoutBody(body).some((error) => error.includes("no active-proof hits")));
});

test("accepts cross-validator-safe sweep wording with classified historical red identities", () => {
  const body = bodyWith({
    historical: "FAC-17 retained only in the red command for row #1",
    superseded:
      "fixture paths old.sqlite; browser sessions old-session; packet paths/hashes old.txt deadbeef; active revisions run-1; artifacts old.png",
    sweep:
      "rg checked every exact superseded value; no hits outside classified identity/history lines and no active-proof hits; historical FAC-17 occurrence classified in row #1"
  });

  assert.deepEqual(validateTddCloseoutBody(body), []);
});

test("rejects unresolved evidence identity placeholders", () => {
  const body = bodyWith({
    current:
      "fixture paths <paths>; browser sessions none; packet paths/hashes none; active revisions none; artifacts none"
  });

  assert.ok(validateTddCloseoutBody(body).some((error) => error.includes("identity fields are empty or unresolved")));
});

test("downstream review validation rejects HTML-like angle tokens in compact values", () => {
  assert.equal(reviewUnresolvedValue("document `<body>` response evidence"), true);
  assert.equal(reviewUnresolvedValue("document body response evidence"), false);
});

test("guidance carries sink, snapshot, exactness, and shared closeout contracts", () => {
  const skill = readFileSync(new URL("../SKILL.md", import.meta.url), "utf8");
  const testsGuide = readFileSync(new URL("../tests.md", import.meta.url), "utf8");
  const closeout = readFileSync(new URL("../closeout-evidence.md", import.meta.url), "utf8");

  assert.match(closeout, /Add `--closing` when the exact body will be posted/);
  assert.doesNotMatch(closeout, /inspected body file path before tracker URL exists/);
  assert.match(skill, /two independent snapshots or server renders are not equivalent/);
  assert.match(skill, /every named value unless the source explicitly permits/);
  assert.match(skill, /Dependency state is a precondition, not a behavior red/);
  assert.match(skill, /Published current evidence survives cleanup truthfully/);
  assert.match(testsGuide, /SQLite `.backup`/);
  assert.match(closeout, /copied stateful fixture snapshot method\/source and expected-state probe/);
  assert.match(closeout, /Nested-validator angle-token check/);
  assert.match(closeout, /no hits outside classified identity\/history lines and no active-proof hits/);
  assert.match(closeout, /published current artifact is not safe to remove until closeout is complete/);
  assert.equal(
    closeout.match(/no hits outside classified identity\/history lines and no active-proof hits/g)?.length,
    3
  );
});
