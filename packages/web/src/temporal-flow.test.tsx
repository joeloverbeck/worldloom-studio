import React from "react";
import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./main";

describe("Temporal/Timeline web surface", () => {
  it("renders the workflow-map destination and Temporal decision surface from server policy shapes", () => {
    const html = renderToString(<App initialOpenWorld="/tmp/temporal.sqlite" />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(html).toContain("Temporal/Timeline");
    expect(html).toContain("Temporal/Timeline flow");
    expect(html).toContain("Start or Resume Temporal");
    expect(html).toContain("trigger recommendation");
    expect(html).toContain("Current decision");
    expect(html).toContain("Server close blockers");
    expect(html).toContain("Temporal Questions");
    expect(html).toContain("Date Types and Granularity");
    expect(html).toContain("Latency and Residue");
    expect(html).toContain("Sequence Integrity");
    expect(html).toContain("Retrospective Insertion");
    expect(html).toContain("Temporal Mystery Boundaries");
    expect(html).toContain("Temporal coverage revision and finalization");
    expect(html).toContain("Editable staging");
    expect(html).toContain("Revision reason");
    expect(html).toContain("Active revision");
    expect(html).toContain("Discard unsaved changes");
    expect(html).toContain("Preview Finalization");
    expect(html).toContain("Create or Link Temporal Timeline Card");
    expect(html).toContain("Route Admission Proposal");
    expect(html).toContain("Mint Temporal Debt");
    expect(html).toContain("Record Governed Skip");
    expect(html).toContain("Prompt-out preview");
    expect(html).toContain("Read-side trail");
    expect(html).toContain("Naive steward walkthrough");
    expect(source).toContain("/api/temporal/runs/start");
    expect(source).toContain("/api/temporal/coverage");
    expect(source).toContain("/api/temporal/runs/${temporalFlowId}/revisions");
    expect(source).toContain("/api/temporal/runs/${temporalFlowId}/recover");
    expect(source).toContain("/api/temporal/runs/${temporalFlowId}/preview");
    expect(source).toContain("/api/temporal/cards");
    expect(source).toContain("/api/temporal/proposals");
    expect(source).toContain("/api/temporal/debt");
    expect(source).toContain("/api/temporal/runs/");
    expect(source).toContain("temporalRun.closeReadiness.blockers");
    const cardPayloadSource = source.slice(
      source.indexOf("const createOrLinkTemporalCard"),
      source.indexOf("const routeTemporalProposal")
    );
    const proposalPayloadSource = source.slice(
      source.indexOf("const routeTemporalProposal"),
      source.indexOf("const mintTemporalDebt")
    );
    expect(cardPayloadSource).not.toContain('truthLayer: recordForm.truthLayer || "Objective canon"');
    expect(cardPayloadSource).not.toContain('canonStatus: recordForm.canonStatus || "accepted"');
    expect(proposalPayloadSource).not.toContain('truthLayer: recordForm.truthLayer || "Objective canon"');
    expect(source).not.toContain("const TEMPORAL_REQUIRED_COVERAGE");
  });

  it("offers Spatial-temporal analyst Prompt-out through the shared prompt lifecycle", () => {
    const html = renderToString(<App initialOpenWorld="/tmp/temporal.sqlite" />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(html).toContain("<option value=\"temporal_timeline\">Temporal/Timeline</option>");
    expect(source).toContain("temporal_spatial_analyst");
    expect(source).toContain("/api/prompt-out/steps");
    expect(source).toContain("promptStep.actions.storeAdvisory.href");
    expect(source).not.toContain("/api/temporal/advisory-artifacts");
    expect(html).toContain("Load Current Proposal Packet");
    expect(html).toContain("Load Current Pressure Packet");
    expect(html).toContain("Pressure skip reason (required for major-or-higher Temporal work)");
    expect(html).toContain("Temporal packet identity");
    expect(html).toContain("Temporal source documents");
    expect(html).toContain("Temporal source manifest");
    expect(html).toContain("Temporal omissions");
    expect(html).toContain("Temporal output labels");
    expect(html).toContain("Recover Current Temporal Packet");
    expect(source).toContain("TemporalPromptOutPanel");
    expect(source).toContain("loadTemporalPromptStep");
    expect(source).toContain("temporalPromptMode");
    expect(source).toContain('if (origin.flowKey === "temporal_timeline") return promptText');
    expect(source).toContain('"Prompt packet manifest"');
    expect(source).not.toContain('promptFlowKey === "temporal_timeline" ? "temporal:spatial-temporal-analysis"');
    const temporalPromptLifecycleSource = source.slice(
      source.indexOf("const loadTemporalPromptStep"),
      source.indexOf("const temporalStartPayload")
    );
    expect(temporalPromptLifecycleSource).toContain("request.body");
    expect(temporalPromptLifecycleSource).toContain("generated.promptOut.temporalContext");
    expect(temporalPromptLifecycleSource).not.toContain("/api/links");
    expect(temporalPromptLifecycleSource).not.toContain("linkTypeKey");
    expect(temporalPromptLifecycleSource).not.toContain("createHash");
    expect(temporalPromptLifecycleSource).not.toContain("sourceManifest:");
    const storeAdvisorySource = source.slice(
      source.indexOf("const storeAdvisory"),
      source.indexOf("const applyCreationDecisionPayload")
    );
    expect(storeAdvisorySource).toContain('promptStep.context.flowKey === "temporal_timeline"');
    expect(storeAdvisorySource).toContain("refreshTemporalRun(temporalFlowId)");
  });

});
