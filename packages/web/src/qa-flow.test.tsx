import React from "react";
import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./main";

describe("QA flow web surface", () => {
  it("renders QA scorecard controls and routes score interactions through the server", () => {
    const html = renderToString(<App />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(html).toContain("QA flow");
    expect(html).toContain("Subject type");
    expect(html).toContain("Start QA Pass");
    expect(html).toContain("28-test scorecard");
    expect(html).toContain("N/A reason");
    expect(html).toContain("Save QA Score");
    expect(html).toContain("Repeatable high-impact capability");
    expect(html).toContain("No institution or mode-equivalent response");
    expect(html).toContain("Finalize QA Pass");
    expect(source).toContain("/api/qa/passes/start");
    expect(source).toContain("/api/qa/scores");
    expect(source).toContain("conditions: qaFloorConditions");
    expect(source).not.toContain("repeatableHighImpactCapability: true");
    expect(source).toContain("/api/qa/repairs");
    expect(source).toContain("setQaBand(payload.band)");
  });

  it("offers QA Prompt-out without duplicating Prompt-out storage routes", () => {
    const html = renderToString(<App />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(html).toContain("<option value=\"qa\">QA</option>");
    expect(source).toContain("templateKey: promptTemplateKey");
    expect(source).toContain("/api/prompt-out/steps");
    expect(source).toContain("promptStep.actions.generate.href");
    expect(source).toContain("promptStep.actions.storeAdvisory.href");
    expect(source).toContain("promptStep.actions.skip.href");
    expect(source).not.toContain("/api/prompt-out/advisory-artifacts");
  });
});
