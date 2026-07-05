import React from "react";
import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./main";

describe("Constraint Composition web surface", () => {
  it("renders the guided decision surface and consumes server policy shapes", () => {
    const html = renderToString(<App initialOpenWorld="/tmp/constraint.sqlite" />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(html).toContain("Constraint Composition flow");
    expect(html).toContain("Start or Resume Constraint Composition");
    expect(html).toContain("Doctrine, checklist, and template");
    expect(html).toContain("Current decision");
    expect(html).toContain("Server close blockers");
    expect(html).toContain("Constraint Inventory");
    expect(html).toContain("Composition Testing");
    expect(html).toContain("Leakage and Residue");
    expect(html).toContain("Create or Link Constraint Card");
    expect(html).toContain("Route Admission Proposal");
    expect(html).toContain("Mint Constraint Debt");
    expect(html).toContain("Record Governed Skip");
    expect(html).toContain("Prompt-out preview");
    expect(html).toContain("Read-side trail");
    expect(html).toContain("Naive steward walkthrough");
    expect(source).toContain("/api/constraint-composition/runs/start");
    expect(source).toContain("/api/constraint-composition/inventory");
    expect(source).toContain("/api/constraint-composition/composition");
    expect(source).toContain("/api/constraint-composition/leakage");
    expect(source).toContain("/api/constraint-composition/residue");
    expect(source).toContain("/api/constraint-composition/cards");
    expect(source).toContain("/api/constraint-composition/proposals");
    expect(source).toContain("/api/constraint-composition/debt");
    expect(source).toContain("/api/constraint-composition/runs/");
    expect(source).toContain("constraintRun.closeReadiness.blockers");
    expect(source).not.toContain("const CONSTRAINT_REQUIRED_COVERAGE");
  });

  it("offers Constraint challenger Prompt-out through the shared prompt lifecycle", () => {
    const html = renderToString(<App />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(html).toContain("<option value=\"constraint_composition\">Constraint Composition</option>");
    expect(source).toContain("constraint_challenger");
    expect(source).toContain("/api/prompt-out/steps");
    expect(source).toContain("promptStep.actions.storeAdvisory.href");
    expect(source).not.toContain("/api/constraint-composition/advisory-artifacts");
  });
});
