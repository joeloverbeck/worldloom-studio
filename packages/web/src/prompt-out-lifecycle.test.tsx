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

describe("Prompt-out lifecycle web surface", () => {
  it("renders server-returned Prompt-out steps and submits returned action URLs", () => {
    const html = renderToString(<App initialOpenWorld="/tmp/prompt-step.sqlite" />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const generatePrompt = snippetBetween(source, "const generatePrompt = async () =>", "const savePromptTemplate = async () =>");
    const storeAdvisory = snippetBetween(source, "const storeAdvisory = async () =>", "const startFlow = async () =>");
    const skipPrompt = snippetBetween(source, "const skipPrompt = async () =>", "const decompose = async () =>");

    expect(html).toContain("Load Prompt Step");
    expect(html).toContain("Server-owned step");
    expect(source).toContain("/api/prompt-out/steps");
    expect(generatePrompt).toContain("promptStep.actions.generate.href");
    expect(storeAdvisory).toContain("promptStep.actions.storeAdvisory.href");
    expect(storeAdvisory).toContain("promptStep.actions.disposition.href");
    expect(skipPrompt).toContain("promptStep.actions.skip.href");
    expect(storeAdvisory).not.toContain("/api/institutional/advisory-artifacts");
    expect(generatePrompt).not.toContain('"/api/prompt-out/generate"');
    expect(storeAdvisory).not.toContain('"/api/prompt-out/advisory-artifacts"');
    expect(skipPrompt).not.toContain('"/api/prompt-out/skip"');
    expect(generatePrompt).not.toContain("flowKey:");
    expect(storeAdvisory).not.toContain("flowKey:");
    expect(skipPrompt).not.toContain("flowKey:");
  });
});
