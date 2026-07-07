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

describe("setup/open-world browser shell", () => {
  it("renders a token-free setup-only shell before a world is open", () => {
    const html = renderToString(<App
      initialSetupError={{
        action: "open",
        path: "/tmp/not-a-world.sqlite",
        kind: "wrong_file",
        message: "This is not a Worldloom world file",
        recovery: "Choose a Worldloom world file, or create a new one at a different path."
      }}
      initialRecentWorlds={[{ path: "/tmp/recent-world.sqlite", openedAt: "2026-07-05T00:00:00.000Z" }]}
    />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(html).toContain("Setup/open world");
    expect(html).toContain("Server status");
    expect(html).toContain("Catalog status");
    expect(html).toContain("Create world");
    expect(html).toContain("Open world");
    expect(html).toContain("/tmp/recent-world.sqlite");
    expect(html).toContain("This is not a Worldloom world file");
    expect(html).toContain("/tmp/not-a-world.sqlite");
    expect(html).not.toContain("Worldloom token");
    expect(html).not.toContain("server token");
    expect(html).not.toContain("New record");
    expect(html).not.toContain("Admission flow");
    expect(html).not.toContain("Creation decision point");
    expect(source).not.toContain("worldloom-token");
    expect(source).not.toContain("x-worldloom-token");
  });

  it("reveals the workspace only after a world is open and foregrounds Creation for an empty world", () => {
    const html = renderToString(<App initialOpenWorld="/tmp/empty-world.sqlite" />);

    expect(html).toContain("World open");
    expect(html).toContain("/tmp/empty-world.sqlite");
    expect(html).toContain("Setup controls");
    expect(html).toContain("Setup method card: Open world");
    expect(html).toContain("Create or open the visible world file that owns the canon store.");
    expect(html).toContain("Creation decision point");
    expect(html).toContain("Primary active path for a new world");
    expect(html).toContain("Server-returned method-card provenance loads after the Creation flow starts.");
    expect(html).toContain("Prerequisites before other flows");
    expect(html).toContain("New record");
    expect(html).toContain("Canon Workbench");
  });

  it("routes successful world switches through one world-scoped browser reset boundary", () => {
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const resetBoundary = snippetBetween(source, "const resetWorldScopedBrowserState = () =>", "const createOrOpen = async");
    const createOrOpen = snippetBetween(source, "const createOrOpen = async", "const resetRecordForm = () =>");
    const failureHandler = snippetBetween(createOrOpen, "} catch (error) {", "  };\n");

    expect(resetBoundary).toContain("setWorkflowMap(null)");
    expect(resetBoundary).toContain("setAdmissionDecision(null)");
    expect(resetBoundary).toContain("setAdmissionQueue([])");
    expect(resetBoundary).toContain("setCreationDecision(null)");
    expect(resetBoundary).toContain("setMinimalViableWorld(null)");
    expect(resetBoundary).toContain("setPromptStep(null)");
    expect(resetBoundary).toContain("setPromptText(\"\")");
    expect(resetBoundary).toContain("setLoadedPromptStatus(null)");
    expect(resetBoundary).toContain("setFlowId(null)");
    expect(resetBoundary).toContain("setKernelRecordId(null)");
    expect(resetBoundary).toContain("setKernelBody(\"\")");
    expect(resetBoundary).toContain("setKernelSectionDrafts({})");
    expect(resetBoundary).toContain("setSeedBody(\"\")");
    expect(resetBoundary).toContain("setDecompositionError(null)");
    expect(resetBoundary).toContain("setStage12Run(null)");
    expect(resetBoundary).toContain("setConstraintRun(null)");
    expect(resetBoundary).toContain("setTemporalRun(null)");
    expect(resetBoundary).toContain("setStage13Run(null)");
    expect(resetBoundary).toContain("setQaScorecard(null)");
    expect(resetBoundary).toContain("setCanonDetail(null)");

    expect(createOrOpen).toContain("hasUnsavedWorldScopedBrowserBuffers()");
    expect(createOrOpen).toContain("window.confirm");
    expect(createOrOpen.indexOf("resetWorldScopedBrowserState()")).toBeGreaterThanOrEqual(0);
    expect(createOrOpen.indexOf("resetWorldScopedBrowserState()")).toBeLessThan(createOrOpen.indexOf("setOpenWorld(payload.path)"));
    expect(createOrOpen.indexOf("resetWorldScopedBrowserState()")).toBeLessThan(createOrOpen.indexOf("await loadWorldData()"));
    expect(failureHandler).not.toContain("resetWorldScopedBrowserState");
  });
});
