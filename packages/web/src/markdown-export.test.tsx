import React from "react";
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
    }]} />);

    expect(html).toContain("Markdown export directory");
    expect(html).toContain("Export World Markdown");
    expect(html).toContain("Export Markdown");
    expect(html).toContain("Markdown export");
  });
});
