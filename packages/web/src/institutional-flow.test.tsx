import React from "react";
import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./main";

describe("Institutional, Economic, and Suppression web surface", () => {
  it("renders the stage-12 guided-flow controls and consumes server policy shapes", () => {
    const html = renderToString(<App initialOpenWorld="/tmp/stage12.sqlite" />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(html).toContain("Institutional, Economic, and Suppression flow");
    expect(html).toContain("Stage-12 decision contract");
    expect(html).toContain("Prompt modes");
    expect(html).toContain("Write intent");
    expect(html).toContain("Next/resume");
    expect(html).toContain("Start or Resume Stage-12");
    expect(html).toContain("Method guidance");
    expect(html).toContain("Start or resume a stage-12 run to load server-returned method guidance.");
    expect(html).toContain("Close blockers");
    expect(html).toContain("Coverage lens");
    expect(html).toContain("Create or Link Card");
    expect(html).toContain("Route Proposal");
    expect(html).toContain("Mint Stage-12 Debt");
    expect(html).toContain("Record Governed Skip");
    expect(html).toContain("Close Stage-12 Run");
    expect(source).toContain("/api/institutional/runs/start");
    expect(source).toContain("/api/institutional/coverage");
    expect(source).toContain("/api/institutional/cards");
    expect(source).toContain("/api/institutional/proposals");
    expect(source).toContain("/api/institutional/debt");
    expect(source).toContain("/api/institutional/skips");
    expect(source).toContain("/api/institutional/runs/");
    expect(source).toContain("closeReadiness.blockers");
    expect(source).not.toContain("const STAGE12_REQUIRED_LENSES");
  });

  it("keeps the coverage editor on the routed stage-12 destination", () => {
    const html = renderToString(
      <App
        initialOpenWorld="/tmp/stage12.sqlite"
        initialDestination="stage12"
        initialWorkflowMap={{
          readOnly: true,
          world: { path: "/tmp/stage12.sqlite" },
          stages: [],
          queues: [],
          nextDecision: {
            destinationKey: "stage12",
            label: "Resume Stage 12",
            reason: "A Stage 12 run is in progress.",
            href: "/api/institutional/runs/start"
          },
          destinations: [
            {
              key: "stage12",
              label: "Institutional / Economic / Suppression",
              kind: "guided-flow",
              summary: "Work the source-selected institutional pass.",
              state: "active"
            }
          ]
        }}
      />
    );

    expect(html).toContain("Institutional / Economic / Suppression flow");
    expect(html).toContain("Coverage lens");
    expect(html).toContain("Coverage or outcome prose");
    expect(html).toContain("Save Coverage");
  });

  it("offers stage-12 Prompt-out through the shared prompt lifecycle", () => {
    const html = renderToString(<App initialOpenWorld="/tmp/stage12.sqlite" />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(html).toContain("<option value=\"institutional_economic_suppression\">Institutional / economic / suppression</option>");
    expect(source).toContain("institution_economy_analyst");
    expect(source).toContain("/api/prompt-out/steps");
    expect(source).toContain("promptStep.actions.storeAdvisory.href");
    expect(source).not.toContain("/api/institutional/advisory-artifacts");
  });
});
