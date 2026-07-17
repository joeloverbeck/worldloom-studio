// @vitest-environment jsdom

import React from "react";
import { readFileSync } from "node:fs";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PromptEvidenceItem } from "@worldloom/shared";
import { PromptOutEvidenceList } from "./prompt-out-evidence-list";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const sameDisplayItems: PromptEvidenceItem[] = [
  {
    id: "prompt-evidence-depends",
    displayText: "FAC-2 Clock tower excluded from bounded Temporal context",
    kind: "omission",
    candidateIdentity: "FAC-2",
    ruleIdentity: "temporal.bounded-second-hop",
    standing: { truthLayer: "Objective canon", canonStatus: "accepted" },
    relationship: "depends_on",
    decisionMeaning: "excluded from bounded Temporal context",
    provenanceReferences: ["canon_record:FAC-1", "link:11", "link:12", "link:13", "link:14"],
    aggregatePathCount: 4
  },
  {
    id: "prompt-evidence-opposes",
    displayText: "FAC-2 Clock tower excluded from bounded Temporal context",
    kind: "omission",
    candidateIdentity: "FAC-2",
    ruleIdentity: "temporal.bounded-second-hop",
    standing: { truthLayer: "Objective canon", canonStatus: "accepted" },
    relationship: "opposes",
    decisionMeaning: "excluded from bounded Temporal context",
    provenanceReferences: ["canon_record:FAC-1", "link:15"],
    aggregatePathCount: null
  }
];

describe("Prompt-out evidence list", () => {
  it("renders equivalent paths once while preserving same-text semantic distinctions and ordered provenance", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { rerender } = render(<PromptOutEvidenceList label="Temporal omissions" items={sameDisplayItems} emptyText="No omissions." />);

    expect(screen.getByRole("list", { name: "Temporal omissions" })).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getAllByText("FAC-2 Clock tower excluded from bounded Temporal context")).toHaveLength(2);
    expect(screen.getByText("4 equivalent paths")).toBeTruthy();
    expect(screen.getByText("Relationship: depends_on")).toBeTruthy();
    expect(screen.getByText("Relationship: opposes")).toBeTruthy();
    expect(screen.getByText("Provenance: canon_record:FAC-1 → link:11 → link:12 → link:13 → link:14")).toBeTruthy();

    rerender(<PromptOutEvidenceList label="Temporal omissions" items={[...sameDisplayItems]} emptyText="No omissions." />);
    expect(consoleError).not.toHaveBeenCalled();
    expect(consoleWarn).not.toHaveBeenCalled();
  });

  it("keys evidence rows only by the server-owned semantic identity", () => {
    const source = readFileSync("src/prompt-out-evidence-list.tsx", "utf8");
    expect(source).toContain("key={item.id}");
    expect(source).not.toContain("key={item.displayText}");
    expect(source).not.toContain("key={index}");
    expect(source).not.toContain("Math.random");
    expect(source).not.toContain(".sort(");
    expect(source).not.toContain("new Map");
    expect(source).not.toContain("new Set");
    expect(source).not.toContain("createHash");
    expect(source).not.toContain("fallback");
  });
});
