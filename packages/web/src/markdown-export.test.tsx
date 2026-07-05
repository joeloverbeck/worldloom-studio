import React from "react";
import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./main";

describe("markdown export web surface", () => {
  it("renders whole-world and per-record markdown export controls", () => {
    const html = renderToString(<App initialRecords={[{
      id: 1,
      shortId: "FAC-1",
      recordTypeKey: "canon_fact",
      title: "Bridge law",
      body: "Bridge law body",
      truthLayer: "Objective canon",
      canonStatus: "proposed",
      updatedAt: "2026-07-02T00:00:00.000Z"
    }]} initialOpenWorld="/tmp/markdown.sqlite" />);

    expect(html).toContain("Markdown export directory");
    expect(html).toContain("Export World Markdown");
    expect(html).toContain("Export Markdown");
    expect(html).toContain("Markdown export");
  });

  it("renders server-owned Prompt-out controls and uses returned action URLs", () => {
    const html = renderToString(<App initialOpenWorld="/tmp/prompt.sqlite" />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(html).toContain("Prompt context");
    expect(html).toContain("Load Prompt Step");
    expect(source).toContain("/api/prompt-out/steps");
    expect(source).toContain("promptStep.actions.generate.href");
    expect(source).toContain("promptStep.actions.skip.href");
    expect(source).not.toContain("/api/flows/creation/skip");
  });
});
