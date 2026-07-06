import React from "react";
import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./main";

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
});
