import React from "react";
import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./main";

describe("QA flow web surface", () => {
  it("renders QA scorecard controls and routes score interactions through the server", () => {
    const html = renderToString(<App initialOpenWorld="/tmp/qa.sqlite" />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(html).toContain("QA flow");
    expect(html).toContain("QA decision contract");
    expect(html).toContain("Prompt modes");
    expect(html).toContain("Write intent");
    expect(html).toContain("Next/resume");
    expect(html).toContain("Subject type");
    expect(html).toContain("Start QA Pass");
    expect(html).toContain("28-test scorecard");
    expect(html).toContain("N/A reason");
    expect(html).toContain("Save QA Score");
    expect(html).toContain("Repeatable high-impact capability");
    expect(html).toContain("No institution or mode-equivalent response");
    expect(html).toContain("Finalize QA Pass");
    expect(source).toContain("/api/qa/passes/start");
    expect(source).toContain("/api/qa/scores");
    expect(source).toContain("conditions: qaFloorConditions");
    expect(source).not.toContain("repeatableHighImpactCapability: true");
    expect(source).toContain("/api/qa/repairs");
    expect(source).toContain("setQaBand(payload.band)");
  });

  it("offers QA Prompt-out without duplicating Prompt-out storage routes", () => {
    const html = renderToString(<App initialOpenWorld="/tmp/qa.sqlite" />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(html).toContain("<option value=\"qa\">QA</option>");
    expect(source).toContain("templateKey: promptTemplateKey");
    expect(source).toContain("/api/prompt-out/steps");
    expect(source).toContain("promptStep.actions.generate.href");
    expect(source).toContain("promptStep.actions.storeAdvisory.href");
    expect(source).toContain("promptStep.actions.skip.href");
    expect(source).not.toContain("/api/prompt-out/advisory-artifacts");
  });

  it("echoes Minimal Viable World checkpoint state read-only in whole-world QA", () => {
    const scorecard = {
      tests: [],
      subjectMode: null,
      methodCard: { decisionPoint: "QA scorecard", decision: "Assess stability", operativeRule: "Read-only QA", why: "stability", goodMaterial: "scored tests", derivationVersion: "method-card/v1", packageSources: ["docs/worldbuilding-system/18_quality_assurance_tests.md"] },
      decisionPoint: {
        sharedContract: {
          flow: { key: "qa", runState: "in_progress" },
          step: { key: "qa:start", localDecision: "Assess the whole world.", packageSource: "docs/worldbuilding-system/18_quality_assurance_tests.md", why: "stability" },
          obligations: { required: [], optional: [], skippable: [], severityDependent: [] },
          bearingContext: { displayed: ["Minimal Viable World checkpoint PAS-1"], sourceManifest: ["Minimal Viable World checkpoint report: PAS-1"], omissions: [] },
          promptOut: { serverOwned: true, modes: [] },
          blockers: [],
          writeIntent: { willWrite: ["qa_pass scores"], willLink: [], willQueue: [], willRouteOnward: [], willLeaveUntouched: ["QA echoes Minimal Viable World state read-only and does not write checkpoint records"] },
          nextOrResumeState: { currentStep: "qa:start", nextStep: "score tests", safeExit: "Return to QA." },
          readSideTrail: []
        }
      },
      minimalViableWorldEcho: {
        status: "present",
        route: "/api/flows/creation/minimal-viable-world",
        report: { id: 12, shortId: "PAS-1", title: "Minimal Viable World checkpoint", recordTypeKey: "pass_report", body: "checkpoint", truthLayer: "Objective canon", canonStatus: "accepted", updatedAt: "now" },
        dispositions: [],
        coverageSignalSummary: [{ key: "core_promise", label: "core promise", status: "present", evidence: [], reason: "kernel" }],
        unresolvedDeferrals: [{ seedRecordId: 2, dimensionKey: "path_dependence", disposition: "deferred", substance: "Timeline later", evidenceRecordIds: [] }],
        protectedMysteryEvidence: [],
        openCanonDebt: [{ id: 15, shortId: "DEB-1", title: "Bell compact timeline debt", recordTypeKey: "canon_debt", body: "", truthLayer: "Objective canon", canonStatus: "under review", updatedAt: "now" }],
        admissionProposals: [{ id: 16, shortId: "FAC-9", title: "Bell-tax exemption proposal", recordTypeKey: "canon_fact", body: "", truthLayer: "Objective canon", canonStatus: "proposed", updatedAt: "now" }],
        advisoryArtifacts: [],
        readSideTrail: [{ label: "checkpoint report PAS-1", href: "/api/canon-workbench/records/12", recordId: 12 }]
      },
      doctrine: { redFlags: [], modeBenchmarks: [], repairLoop: [] }
    };
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const html = renderToString(<App
      initialOpenWorld="/tmp/qa.sqlite"
      initialQaScorecard={scorecard as any}
    />);

    expect(html).toContain("Minimal Viable World echo");
    expect(html).toContain("PAS-1");
    expect(html).toMatch(/Deferrals.*1/);
    expect(html).toMatch(/Debt.*1/);
    expect(html).toMatch(/Proposals.*1/);
    expect(html).toContain("core promise");
    const echoStart = html.indexOf("Minimal Viable World echo");
    const echoEnd = html.indexOf("Subject type", echoStart);
    const echoPanel = html.slice(echoStart, echoEnd);
    expect(echoPanel).not.toContain("Record Checkpoint Disposition");
    expect(echoPanel).not.toContain("Route Checkpoint Proposal");
    expect(html).toContain("QA echoes Minimal Viable World state read-only");
    expect(source).toContain("minimalViableWorldEcho");
  });
});
