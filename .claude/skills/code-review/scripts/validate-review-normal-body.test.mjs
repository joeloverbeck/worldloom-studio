import assert from "node:assert/strict";
import test from "node:test";
import { validateReviewNormalBody } from "./validate-review-normal-body.mjs";

const noFixBody = `## Standards

Findings: none.

## Spec

Findings: none.

- **Review subagents**: Standards reviewer standards-1 completed; Spec reviewer spec-1 completed
- **Axis summary**: Standards 0/none, Spec 0/none
- **Residual findings**: none
- **Parent PRD coverage**: parent PRD row present
- **Browser/manual evidence freshness**: N/A because no browser/manual evidence was used
- **Browser/manual console state**: N/A because no browser/manual evidence was used
- **Review evidence line**: Review: code-review against abc1234; outcome no findings; verification rerun pnpm test.

Review: code-review against abc1234; outcome no findings; verification rerun pnpm test.
`;

const immediateFixBody = `## Standards

Initial finding was fixed.

## Spec

Initial finding was fixed.

- **Initial Standards outcome**: 1/Medium before fixes
- **Initial Spec outcome**: 1/High before fixes
- **Final Standards outcome**: 0/none after re-review
- **Final Spec outcome**: 0/none after re-review
- **Findings found**: two review findings
- **Fixes made**: packages/web/src/main.tsx corrected and proof added
- **Review subagents**: Standards initial reviewer standards-1 completed, final reviewer standards-2 completed; Spec initial reviewer spec-1 completed, final reviewer spec-2 completed
- **TDD/review-fix evidence**: red-first skipped because Standards-only fix did not change behavior
- **TDD closeout gate**: N/A because the tdd skill was not invoked
- **Verification rerun**: pnpm test passed
- **Browser/manual evidence freshness**: N/A because no browser/manual evidence was used
- **Browser/manual console state**: N/A because no browser/manual evidence was used
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
  assert.deepEqual(validateReviewNormalBody(noFixBody, { flags: ["--parent-prd"] }), []);
  const errors = validateReviewNormalBody(noFixBody.replace(/^- \*\*Parent PRD coverage.*\n/m, ""), {
    flags: ["--parent-prd"]
  });
  assert.ok(errors.some((error) => error.includes("Parent PRD coverage")));

  const nAErrors = validateReviewNormalBody(
    noFixBody.replace("parent PRD row present", "N/A because child coverage exists"),
    { flags: ["--parent-prd"] }
  );
  assert.ok(nAErrors.some((error) => error.includes("cannot be N/A")));
});

test("rejects non-terminal review subagent status", () => {
  const errors = validateReviewNormalBody(noFixBody.replace("Spec reviewer spec-1 completed", "Spec reviewer spec-1 running"));
  assert.ok(errors.some((error) => error.includes("non-terminal")));
  assert.ok(errors.some((error) => error.includes("Spec reviewer")));
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
    );
  assert.deepEqual(validateReviewNormalBody(browserBody, { flags: ["--browser"] }), []);
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

test("rejects fallback labeling in a normal body", () => {
  const errors = validateReviewNormalBody(`${noFixBody}\nReview fallback: policy-blocked.\n`);
  assert.ok(errors.some((error) => error.includes("fallback evidence")));
});
