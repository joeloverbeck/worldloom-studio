import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./main";

describe("Propagation web surface", () => {
  it("renders Propagation as a shared decision-point surface", () => {
    const html = renderToString(<App initialOpenWorld="/tmp/propagation.sqlite" />);

    expect(html).toContain("Propagation flow");
    expect(html).toContain("Propagation decision contract");
    expect(html).toContain("Current decision");
    expect(html).toContain("Prompt modes");
    expect(html).toContain("Write intent");
    expect(html).toContain("Next/resume");
    expect(html).toContain("Close blockers");
    expect(html).toContain("Prompt preview with source manifest");
  });
});
