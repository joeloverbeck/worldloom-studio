import React from "react";
import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./main";

const snippetBetween = (source: string, startMarker: string, endMarker: string) => {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  return source.slice(start, end);
};

describe("Creation decision-point web surface", () => {
  it("renders Creation as the new-world decision surface and consumes server policy shapes", () => {
    const html = renderToString(<App initialOpenWorld="/tmp/creation.sqlite" />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const decomposeAction = snippetBetween(source, "const decompose = async () =>", "const proposeRecord = async");
    const creationPanel = snippetBetween(source, "<h2>Creation decision point</h2>", "{message &&");

    expect(html).toContain("Creation decision point");
    expect(html).toContain("Primary active path for a new world");
    expect(html).toContain("governing kernel or pressure seed");
    expect(html).toContain("docs/worldbuilding-system/05_creation_protocol.md");
    expect(html).toContain("docs/worldbuilding-system/templates/world_kernel.md");
    expect(html).toContain("Required");
    expect(html).toContain("Allowed-empty");
    expect(html).toContain("Consequence mode is steward judgment");
    expect(html).toContain("Prompt-out preview");
    expect(html).toContain("Source manifest");
    expect(html).toContain("Pasted responses remain advisory artifacts");
    expect(html).toContain("Seed decomposition decision");
    expect(html).toContain("Actual current status: proposed");
    expect(html).toContain("Granularity confirmation");
    expect(html).toContain("Write preview");
    expect(html).toContain("Admission handoff");
    expect(html).toContain("Read-side trail");
    expect(html).toContain("Safe exit/resume");
    expect(html).toContain("Naive steward walkthrough");

    expect(source).toContain("CreationDecisionPoint");
    expect(source).toContain("setCreationDecision");
    expect(source).toContain("payload.decisionPoint");
    expect(source).toContain("creationDecision.promptOut.stepRequest");
    expect(source).toContain("granularityConfirmed");
    expect(source).toContain("seedTruthLayer");
    expect(decomposeAction).not.toContain("recordForm.canonStatus");
    expect(creationPanel).not.toContain("recordForm.canonStatus");
  });
});
