import assert from "node:assert/strict";
import test from "node:test";
import { validateReviewNormalBody } from "./validate-review-normal-body.mjs";

const identityBlock = `Evidence identity refresh:
- Current evidence identities: fixture paths none; browser sessions none; packet paths/hashes none; active revisions none; artifacts none
- Historical red identities retained: none
- Superseded evidence identities: fixture paths none; browser sessions none; packet paths/hashes none; active revisions none; artifacts none
- Superseded-token sweep: N/A because every superseded category is none
`;

const acceptanceManifest = {
  version: 1,
  issues: [
    {
      number: 359,
      title: "Review child",
      checks: [
        { id: "AC1", kind: "acceptance", text: "First behavior" },
        { id: "AC2", kind: "acceptance", text: "Second behavior" }
      ]
    }
  ]
};

const noFixBody = `## Standards

Findings: none.

## Spec

Findings: none.
Spec sequence coverage: sequence: N/A because the reviewed acceptance is not sequence-sensitive

- **Review subagents**: Standards reviewer standards-1 completed; Spec reviewer spec-1 completed
- **Review subagent cleanup**: Standards close operation unavailable after terminal completion; Spec close operation unavailable after terminal completion
- **Axis summary**: Standards 0/none, Spec 0/none
- **Residual findings**: none
- **Parent PRD coverage**: parent PRD row present
- **Browser/manual evidence freshness**: N/A because no browser/manual evidence was used
- **Browser/manual console state**: N/A because no browser/manual evidence was used
- **Backend process currentness**: N/A because no browser/manual evidence was used
${identityBlock}
- **Review evidence line**: Review: code-review against abc1234; outcome no findings; verification rerun pnpm test.

Review: code-review against abc1234; outcome no findings; verification rerun pnpm test.
`;

const immediateFixBody = `## Standards

Initial finding was fixed.

## Spec

Initial finding was fixed.
Spec sequence coverage: sequence: N/A because the reviewed acceptance is not sequence-sensitive

- **Initial Standards outcome**: 1/Medium before fixes
- **Initial Spec outcome**: 1/High before fixes
- **Final Standards outcome**: 0/none after re-review
- **Final Spec outcome**: 0/none after re-review
- **Findings found**: two review findings
- **Fixes made**: packages/web/src/main.tsx corrected and proof added
- **Review subagents**: Standards initial reviewer standards-1 completed, final reviewer standards-2 completed; Spec initial reviewer spec-1 completed, final reviewer spec-2 completed
- **Review subagent cleanup**: Standards close operation unavailable after terminal completion; Spec close operation unavailable after terminal completion
- **TDD/review-fix evidence**: red-first skipped because Standards-only fix did not change behavior
- **TDD closeout gate**: N/A because the tdd skill was not invoked
- **Verification rerun**: pnpm test passed
- **Browser/manual evidence freshness**: N/A because no browser/manual evidence was used
- **Browser/manual console state**: N/A because no browser/manual evidence was used
- **Backend process currentness**: N/A because no browser/manual evidence was used
${identityBlock}
- **Commit handling**: amended commit abc1234
- **Residual findings**: none
- **Axis summary**: Standards 0/none, Spec 0/none
- **Review evidence line**: Review: code-review against abc1234; outcome findings fixed in SHA def5678; verification rerun pnpm test.

Review: code-review against abc1234; outcome findings fixed in SHA def5678; verification rerun pnpm test.
`;

test("accepts a complete normal no-fix body", () => {
  assert.deepEqual(validateReviewNormalBody(noFixBody), []);
});

test("requires parent PRD coverage only when requested", () => {
  const parentBody = noFixBody.replace(
    "Spec sequence coverage: sequence: N/A because the reviewed acceptance is not sequence-sensitive\n\n- **Review subagents**",
    `Spec sequence coverage: sequence: N/A because the reviewed acceptance is not sequence-sensitive

| Issue | Acceptance source | Evidence reviewed | Findings/residuals |
|---|---|---|---|
| #359 | issue #359 AC1, AC2; sequence: N/A because these criteria are not sequence-sensitive | validator test | none |

- **Review subagents**`
  );
  assert.deepEqual(
    validateReviewNormalBody(parentBody, { flags: ["--parent-prd"], acceptanceManifest }),
    []
  );
  const errors = validateReviewNormalBody(parentBody.replace(/^- \*\*Parent PRD coverage.*\n/m, ""), {
    flags: ["--parent-prd"],
    acceptanceManifest
  });
  assert.ok(errors.some((error) => error.includes("Parent PRD coverage")));

  const nAErrors = validateReviewNormalBody(
    parentBody.replace("parent PRD row present", "N/A because child coverage exists"),
    { flags: ["--parent-prd"], acceptanceManifest }
  );
  assert.ok(nAErrors.some((error) => error.includes("cannot be N/A")));
});

test("requires exact sequence-aware child coverage when --child-family is used", () => {
  const missingManifest = validateReviewNormalBody(noFixBody, { flags: ["--child-family"] });
  assert.ok(missingManifest.some((error) => error.includes("acceptance manifest")));

  const missing = validateReviewNormalBody(noFixBody, {
    flags: ["--child-family"],
    acceptanceManifest
  });
  assert.ok(missing.some((error) => error.includes("PRD child coverage table header")));

  const childFamilyBody = noFixBody.replace(
    "Spec sequence coverage: sequence: N/A because the reviewed acceptance is not sequence-sensitive\n\n- **Review subagents**",
    `Spec sequence coverage: sequence: N/A because the reviewed acceptance is not sequence-sensitive

| Issue | Acceptance source | Evidence reviewed | Findings/residuals |
|---|---|---|---|
| #359 | issue #359 AC1, AC2; sequence: N/A because these criteria are not sequence-sensitive | validator test | none |

- **Review subagents**`
  );
  assert.deepEqual(
    validateReviewNormalBody(childFamilyBody, { flags: ["--child-family"], acceptanceManifest }),
    []
  );

  const ordered = childFamilyBody.replace(
    "sequence: N/A because these criteria are not sequence-sensitive",
    "sequence: Proposal -> staging -> Pressure observed by validator test"
  );
  assert.deepEqual(
    validateReviewNormalBody(ordered, { flags: ["--child-family"], acceptanceManifest }),
    []
  );

  const broad = validateReviewNormalBody(
    childFamilyBody.replace(
      "issue #359 AC1, AC2; sequence: N/A because these criteria are not sequence-sensitive",
      "issue #359 server contract; sequence: N/A because the criterion is not sequence-sensitive"
    ),
    { flags: ["--child-family"], acceptanceManifest }
  );
  assert.ok(broad.some((error) => error.includes("too broad")));

  const missingAcceptance = validateReviewNormalBody(
    childFamilyBody.replace("AC1, AC2", "AC1"),
    { flags: ["--child-family"], acceptanceManifest }
  );
  assert.ok(missingAcceptance.some((error) => error.includes("missing acceptance source AC2")));

  const missingChild = validateReviewNormalBody(childFamilyBody, {
    flags: ["--child-family"],
    acceptanceManifest: {
      ...acceptanceManifest,
      issues: [
        ...acceptanceManifest.issues,
        { number: 360, title: "Missing child", checks: [{ id: "AC1", kind: "acceptance", text: "Third behavior" }] }
      ]
    }
  });
  assert.ok(missingChild.some((error) => error.includes("missing issue #360")));

  const duplicatedBroad = validateReviewNormalBody(
    childFamilyBody.replace(
      "| #359 | issue #359 AC1, AC2; sequence: N/A because these criteria are not sequence-sensitive | validator test | none |",
      `| #359 | issue #359 AC1; sequence: N/A because AC1 is not sequence-sensitive | validator test | none |
| #359 | issue #359 server contract; sequence: N/A because the criterion is not sequence-sensitive | validator test | none |`
    ),
    { flags: ["--child-family"], acceptanceManifest }
  );
  assert.ok(duplicatedBroad.some((error) => error.includes("too broad")));

  const noSequence = validateReviewNormalBody(
    childFamilyBody.replace("; sequence: N/A because these criteria are not sequence-sensitive", ""),
    { flags: ["--child-family"], acceptanceManifest }
  );
  assert.ok(noSequence.some((error) => error.includes("sequence:")));
});

test("requires sequence disposition for an ordinary zero-finding Spec review", () => {
  const missing = validateReviewNormalBody(
    noFixBody.replace("Spec sequence coverage: sequence: N/A because the reviewed acceptance is not sequence-sensitive\n", "")
  );
  assert.ok(missing.some((error) => error.includes("Spec sequence coverage")));

  const ordered = noFixBody.replace(
    "sequence: N/A because the reviewed acceptance is not sequence-sensitive",
    "sequence: Proposal -> staging -> Pressure observed by validator test"
  );
  assert.deepEqual(validateReviewNormalBody(ordered), []);

  const noFindingsWording = noFixBody
    .replace(
      "## Spec\n\nFindings: none.",
      "## Spec\n\nFindings: no findings"
    )
    .replace("Axis summary**: Standards 0/none, Spec 0/none", "Axis summary**: Standards 0/none, Spec no findings")
    .replace("Spec sequence coverage: sequence: N/A because the reviewed acceptance is not sequence-sensitive\n", "");
  const wordingErrors = validateReviewNormalBody(noFindingsWording);
  assert.ok(wordingErrors.some((error) => error.includes("Spec sequence coverage")));
});

test("requires review-native evidence identity reconciliation", () => {
  const errors = validateReviewNormalBody(noFixBody.replace(identityBlock, ""));
  assert.ok(errors.some((error) => error.includes("Evidence identity refresh")));

  const missingCategory = validateReviewNormalBody(
    noFixBody.replace("; artifacts none\n- Historical red identities", "\n- Historical red identities")
  );
  assert.ok(missingCategory.some((error) => error.includes("must enumerate artifacts")));

  const emptyCategories = validateReviewNormalBody(
    noFixBody.replace(
      "Current evidence identities: fixture paths none; browser sessions none; packet paths/hashes none; active revisions none; artifacts none",
      "Current evidence identities: fixture paths; browser sessions; packet paths/hashes; active revisions; artifacts"
    )
  );
  assert.ok(emptyCategories.some((error) => error.includes("fixture paths requires a value")));

  const invalidSweep = validateReviewNormalBody(
    noFixBody.replace(
      "Superseded evidence identities: fixture paths none; browser sessions none; packet paths/hashes none; active revisions none; artifacts none",
      "Superseded evidence identities: fixture paths old.json; browser sessions none; packet paths/hashes none; active revisions none; artifacts none"
    )
  );
  assert.ok(invalidSweep.some((error) => error.includes("may be N/A only")));

  const vagueHistorical = validateReviewNormalBody(
    noFixBody.replace("Historical red identities retained: none", "Historical red identities retained: FAC-17")
  );
  assert.ok(vagueHistorical.some((error) => error.includes("Historical red identities retained must enumerate")));

  const weakSweep = validateReviewNormalBody(
    noFixBody
      .replace(
        "Superseded evidence identities: fixture paths none; browser sessions none; packet paths/hashes none; active revisions none; artifacts none",
        "Superseded evidence identities: fixture paths old.json; browser sessions none; packet paths/hashes none; active revisions none; artifacts none"
      )
      .replace(
        "Superseded-token sweep: N/A because every superseded category is none",
        "Superseded-token sweep: command clean"
      )
  );
  assert.ok(weakSweep.some((error) => error.includes("must name rg/grep")));

  const strongSweep = noFixBody
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
      "Superseded-token sweep: rg old.json body.md found no active-proof hits; historical-red red.json classified as failing history"
    );
  assert.deepEqual(validateReviewNormalBody(strongSweep), []);
});

test("rejects non-terminal review subagent status", () => {
  const errors = validateReviewNormalBody(noFixBody.replace("Spec reviewer spec-1 completed", "Spec reviewer spec-1 running"));
  assert.ok(errors.some((error) => error.includes("non-terminal")));
  assert.ok(errors.some((error) => error.includes("Spec reviewer")));
});

test("requires a terminal cleanup disposition for both review axes", () => {
  const missing = validateReviewNormalBody(noFixBody.replace(/^- \*\*Review subagent cleanup.*\n/m, ""));
  assert.ok(missing.some((error) => error.includes("Review subagent cleanup")));

  const ambiguous = validateReviewNormalBody(
    noFixBody.replace(
      "Standards close operation unavailable after terminal completion; Spec close operation unavailable after terminal completion",
      "Standards completed; Spec completed"
    )
  );
  assert.ok(ambiguous.some((error) => error.includes("Standards reviewer cleanup disposition")));
  assert.ok(ambiguous.some((error) => error.includes("Spec reviewer cleanup disposition")));
});

test("accepts complete immediate-fix evidence and rejects a missing final outcome", () => {
  assert.deepEqual(validateReviewNormalBody(immediateFixBody, { flags: ["--immediate-fix"] }), []);
  const errors = validateReviewNormalBody(
    immediateFixBody.replace(/^- \*\*Final Spec outcome.*\n/m, ""),
    { flags: ["--immediate-fix"] }
  );
  assert.ok(errors.some((error) => error.includes("Final Spec outcome")));
});

test("requires current freshness and console evidence when --browser is used", () => {
  const nAErrors = validateReviewNormalBody(noFixBody, { flags: ["--browser"] });
  assert.ok(nAErrors.some((error) => error.includes("--browser requires")));

  const browserBody = noFixBody
    .replace(
      "N/A because no browser/manual evidence was used",
      "browser smoke rerun passed on final tree with observed result loaded workflow",
    )
    .replace(
      "N/A because no browser/manual evidence was used",
      "0 errors and 0 warnings in the clean browser session",
    )
    .replace(
      "N/A because no browser/manual evidence was used",
      "server command pnpm dev; watch/reload mode watch; process or port ownership PID 123 on port 4173; restart/reload proof server restarted; expected API field probe returned created",
    );
  assert.deepEqual(validateReviewNormalBody(browserBody, { flags: ["--browser"] }), []);

  const staleBackend = validateReviewNormalBody(
    browserBody.replace(
      "server command pnpm dev; watch/reload mode watch; process or port ownership PID 123 on port 4173; restart/reload proof server restarted; expected API field probe returned created",
      "server reachable on port 4173"
    ),
    { flags: ["--browser"] }
  );
  assert.ok(staleBackend.some((error) => error.includes("Backend process currentness")));
});

test("requires a structured accepted residual with a revisit trigger", () => {
  const accepted = noFixBody
    .replace(
      "- **Residual findings**: none",
      `- **Residual findings**: accepted residuals below; unhandled findings none beyond accepted residuals
- **Accepted residual**: duplicated admitted-status set
  - **Axis**: Standards
  - **Source**: standards reviewer at packages/web/src/main.tsx
  - **Rationale**: extracting a shared abstraction would widen the narrow fix
  - **Revisit trigger**: when a third admitted-status consumer is added`
    )
    .replace(
      /Review: code-review against abc1234; outcome no findings; verification rerun pnpm test\./g,
      "Review: code-review against abc1234; outcome accepted residuals recorded 1; unhandled findings none beyond accepted residuals; verification rerun pnpm test."
    );

  assert.deepEqual(validateReviewNormalBody(accepted), []);
  const errors = validateReviewNormalBody(accepted.replace(/\n  - \*\*Revisit trigger.*$/m, ""));
  assert.ok(errors.some((error) => error.includes("Revisit trigger")));
});

test("accepts the exact permanent-judgement trigger and rejects vague N/A", () => {
  const accepted = noFixBody
    .replace(
      "- **Residual findings**: none",
      `- **Residual findings**: accepted residuals below; unhandled findings none beyond accepted residuals
- **Accepted residual**: intentional one-off
  - **Axis**: Spec
  - **Source**: issue criterion 2
  - **Rationale**: the exception is part of the authored contract
  - **Revisit trigger**: N/A because permanently accepted judgement`
    )
    .replace(
      /Review: code-review against abc1234; outcome no findings; verification rerun pnpm test\./g,
      "Review: code-review against abc1234; outcome accepted residuals recorded 1; unhandled findings none beyond accepted residuals; verification rerun pnpm test."
    );

  assert.deepEqual(validateReviewNormalBody(accepted), []);
  const errors = validateReviewNormalBody(
    accepted.replace("N/A because permanently accepted judgement", "N/A because accepted for now")
  );
  assert.ok(errors.some((error) => error.includes("permanently accepted judgement")));
});

test("requires durability for a transient browser intended red", () => {
  const withBrowserRed = immediateFixBody.replace(
    "- **TDD/review-fix evidence**:",
    "- **Intended red command/failure**: Playwright waitForResponse timed out\n- **TDD/review-fix evidence**:"
  );
  const errors = validateReviewNormalBody(withBrowserRed, { flags: ["--immediate-fix"] });
  assert.ok(errors.some((error) => error.includes("Regression durability")));

  const durable = withBrowserRed.replace(
    "- **TDD/review-fix evidence**:",
    "- **Regression durability**: durable test added at packages/web/src/main.test.tsx\n- **TDD/review-fix evidence**:"
  );
  assert.deepEqual(validateReviewNormalBody(durable, { flags: ["--immediate-fix"] }), []);
});

test("delegates --tdd bodies to the TDD closeout validator", () => {
  const errors = validateReviewNormalBody(immediateFixBody, { flags: ["--immediate-fix", "--tdd"] });
  assert.ok(errors.some((error) => error.startsWith("TDD validator failed:")));
});

test("accepts a complete immediate-fix body with current nested TDD evidence", () => {
  const body = `${immediateFixBody.replace(
    "- **TDD closeout gate**: N/A because the tdd skill was not invoked",
    "- **TDD closeout gate**: canonical TDD evidence below passed the nested validator"
  )}
TDD evidence

| Issue | CONTEXT.md status | ADRs/principles/docs status | Seam | Red command/failure | Green command or evidence | Acceptance covered | Review fix / red-first skip reason |
|---|---|---|---|---|---|---|---|
| #355 | read | ADR 0008 read | typed public contract | red-first skipped because Standards-only/conformance-only fix did not change behavior | pnpm typecheck passed | AC1; atoms: atomic; proof surfaces: server type contract; sequence: N/A because criterion is not sequence-sensitive | review-fix evidence |

Existing-test contract-change rows: none

TDD review-fix addendum:
- Finding: typed public contract ownership
- Intended red command/failure: red-first skipped because Standards-only/conformance-only fix did not change behavior
- Green command/evidence: pnpm typecheck passed
- Updated TDD table row: #355 typed public contract
- Regression durability: N/A because the intended red was not a transient browser/manual probe
- Browser/manual freshness: N/A because no UI/routes/browser-consumed API/fixtures/action path changed
- Backend process currentness: N/A because no browser/manual proof was used
- Evidence identity refresh: same-sink identity block inspected

TDD closeout preflight:
- Durable sink/body inspected: test fixture
- Compact table/header: present after structural check
- Rows accounted for: all in-scope issues and seams listed
- Pre-red recovery status: N/A - pre-red preflight/table was visible before first red
- CONTEXT.md status: present
- ADRs/principles/docs status: present
- Acceptance atom map: all rows list authoritative atoms and proof surfaces
- Acceptance sequence map: all rows list justified sequence N/A
- Partial-red / red-first skip reasons: listed
- Evidence-only rows freshness: none
- Evidence-only backend process currentness: N/A because no browser/manual evidence-only rows
- Evidence identity refresh: same-sink identity block inspected
- Existing-test contract-change rows: none

Evidence identity refresh:
- Current evidence identities: fixture paths none; browser sessions none; packet paths/hashes none; active revisions none; artifacts none
- Historical red identities retained: none
- Superseded evidence identities: fixture paths none; browser sessions none; packet paths/hashes none; active revisions none; artifacts none
- Superseded-token sweep: N/A because every superseded category is none

TDD evidence gate passed: durable sink test fixture; compact table/header present after structural check; seams accounted for all listed; CONTEXT.md status present; ADRs/principles/docs status present; sequence evidence N/A; evidence identities present; partial-red / red-first skip reasons listed; evidence-only rows none; existing-test contract-change rows none.
`;

  assert.deepEqual(validateReviewNormalBody(body, { flags: ["--immediate-fix", "--tdd"] }), []);
});

test("rejects fallback labeling in a normal body", () => {
  const errors = validateReviewNormalBody(`${noFixBody}\nReview fallback: policy-blocked.\n`);
  assert.ok(errors.some((error) => error.includes("fallback evidence")));
});
