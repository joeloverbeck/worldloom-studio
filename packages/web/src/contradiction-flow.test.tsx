import React from "react";
import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./main";

describe("Contradiction/Retcon/Mystery web surface", () => {
  it("renders Stage 13 entry, triage, scale, disposition, and close controls over server routes", () => {
    const html = renderToString(<App initialOpenWorld="/tmp/stage13.sqlite" />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(html).toContain("Contradiction/Retcon/Mystery flow");
    expect(html).toContain("Start or Resume Stage 13");
    expect(html).toContain("Refresh Stage 13");
    expect(html).toContain("Contradiction statement");
    expect(html).toContain("Truth layers");
    expect(html).toContain("Who can notice");
    expect(html).toContain("Work scale");
    expect(html).toContain("Contradiction disposition");
    expect(html).toContain("Attempt Stage 13 Close");
    expect(source).toContain("/api/contradiction/runs/start");
    expect(source).toContain("/api/contradiction/runs/");
    expect(source).toContain("/api/contradiction/triage");
    expect(source).toContain("/api/contradiction/scale");
    expect(source).toContain("/api/contradiction/disposition");
    expect(source).not.toContain("REPAIR_DISPOSITIONS");
    expect(source).not.toContain("mystery-preserving close requires");
  });

  it("wires repair operations, repair targets, Admission proposals, retcon costs, propagation, and skips without browser policy duplication", () => {
    const html = renderToString(<App initialOpenWorld="/tmp/stage13.sqlite" />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(html).toContain("Repair operations");
    expect(html).toContain("Repair operation order");
    expect(html).toContain("Add Repair Target");
    expect(html).toContain("Propose Repair-Created Fact to Admission");
    expect(html).toContain("Retcon costs");
    expect(html).toContain("continuity");
    expect(html).toContain("future");
    expect(html).toContain("Repair propagation");
    expect(html).toContain("Record Stage 13 Skip");
    expect(source).toContain("term.vocabulary === \"repair_operation\"");
    expect(source).toContain("term.vocabulary === \"retcon_type\"");
    expect(source).toContain("/api/contradiction/repairs");
    expect(source).toContain("/api/contradiction/repair-targets");
    expect(source).toContain("/api/contradiction/propose-fact");
    expect(source).toContain("/api/contradiction/retcon-costs");
    expect(source).toContain("/api/contradiction/repair-propagation");
    expect(source).toContain("/api/contradiction/skip");
    expect(source).not.toContain("requiresSkipReason");
  });

  it("renders owed-boundaries, mystery-ledger, and preservation-checklist wiring with vocabulary-backed controls", () => {
    const html = renderToString(<App initialOpenWorld="/tmp/stage13.sqlite" />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(html).toContain("Owed-boundaries queue");
    expect(html).toContain("Create or Update Mystery Ledger");
    expect(html).toContain("Protected effect type");
    expect(html).toContain("Puzzle question, if any");
    expect(html).toContain("What would break if solved or flattened");
    expect(html).toContain("Preservation checklist");
    expect(html).toContain("Sacred-opacity accountability");
    expect(source).toContain("term.vocabulary === \"protected_effect_type\"");
    expect(source).toContain("term.vocabulary === \"mystery_state\"");
    expect(source).toContain("term.vocabulary === \"preservation_boundary\"");
    expect(source).toContain("term.vocabulary === \"preservation_operation\"");
    expect(source).toContain("/api/contradiction/owed-boundaries");
    expect(source).toContain("/api/contradiction/mystery-ledgers");
    expect(source).toContain("/api/contradiction/preservation-checklists");
  });

  it("offers contradiction Prompt-out and a capstone source contract for the full Stage 13 panel", () => {
    const html = renderToString(<App initialOpenWorld="/tmp/stage13.sqlite" />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(html).toContain("<option value=\"contradiction\">Contradiction</option>");
    expect(html).toContain("repair_challenge");
    expect(html).toContain("boundary_guard");
    expect(source).toContain("promptFlowKey === \"contradiction\"");
    expect(source).toContain("stage13FlowId");
    expect(source).toContain("stage13SourceRecordId");
    expect(source).toContain("/api/prompt-out/generate");
    expect(source).toContain("/api/prompt-out/advisory-artifacts");
    expect(source).toContain("/api/prompt-out/skip");
    expect(source).toContain("stage13Run?.repairOperations");
    expect(source).toContain("stage13Run?.retconCosts");
    expect(source).toContain("stage13Run?.repairPropagation");
    expect(source).toContain("stage13Run?.proposals");
    expect(source).toContain("stage13Run?.checklists");
  });
});
