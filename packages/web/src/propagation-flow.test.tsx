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

  it("renders the active owed-debt route without normal-path manual identifiers", () => {
    const sourceFact = {
      id: 11,
      shortId: "FAC-11",
      recordTypeKey: "canon_fact",
      title: "Noon bridge testimony",
      body: "Dead witnesses can charge living merchants at the noon bridge.",
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    };
    const owedDebt = {
      id: 12,
      shortId: "DEB-12",
      recordTypeKey: "canon_debt",
      title: "Propagation owed for noon bridge",
      body: "Scope: propagation",
      truthLayer: "Objective canon",
      canonStatus: "under review"
    };
    const contract = {
      flow: { key: "propagation", runState: "in_progress" },
      step: {
        key: "propagation:entry",
        localDecision: "Work the shock cone for the selected owed debt.",
        packageSource: "docs/worldbuilding-system/07_propagation_engine.md",
        why: "Accepted facts become world pressure only when their consequences are worked."
      },
      obligations: { required: [], optional: [], skippable: [], severityDependent: [] },
      bearingContext: {
        displayed: ["Source fact: FAC-11 Noon bridge testimony"],
        sourceManifest: ["Propagation owed debt: DEB-12 Propagation owed for noon bridge"],
        omissions: ["Close blocker: missing-shock-cone-orders"]
      },
      promptOut: {
        serverOwned: true,
        modes: [{
          mode: "proposal",
          label: "Proposal mode",
          availability: "available",
          available: true,
          blocker: null,
          framing: "Request labeled propagation candidates.",
          outputLabels: [],
          stepRequest: {
            method: "POST",
            href: "/api/prompt-out/steps",
            body: {
              flowKey: "propagation",
              flowId: 21,
              recordId: 11,
              templateKey: "propagation_consequence_scout",
              stepKey: "propagation:entry",
              mode: "proposal"
            }
          }
        }]
      },
      blockers: [{ key: "missing-shock-cone-orders", message: "Major work needs multiple shock-cone orders." }],
      writeIntent: { willWrite: ["propagation consequence"], willLink: [], willQueue: [], willRouteOnward: [], willLeaveUntouched: ["Propagation never admits facts"] },
      nextOrResumeState: { currentStep: "propagation:entry", nextStep: "continue shock cone", safeExit: "Return to the workflow map." },
      readSideTrail: [{ label: "Source fact", href: "/api/canon-workbench/records/11", recordId: 11 }]
    };
    const run = {
      flow: { id: 21, state: "in_progress", current_step: "propagation:entry", propagation_fact_record_id: 11, propagation_debt_record_id: 12 },
      sourceFact,
      owedDebt,
      severityPath: { admissionLevel: "3", workScale: "major" },
      closeReadiness: { status: "blocked", blockers: contract.blockers },
      plan: {
        requiredCoverage: "multiple orders and direct/dependency/reaction domains",
        requiredDomainCount: 3,
        orders: [
          { key: "zeroth", label: "Zeroth-order: definition" },
          { key: "first", label: "First-order: direct effects" },
          { key: "fifth", label: "Fifth-order: identity and metaphysics" }
        ],
        domains: ["Economy, trade, and scarcity"],
        orderControls: [
          { key: "zeroth", label: "Zeroth-order: definition", doctrine: "Work the ordered consequences.", severityExpectation: "Major-or-higher facts owe multiple orders.", consequenceCount: 0, pressureLevels: [] },
          { key: "fifth", label: "Fifth-order: identity and metaphysics", doctrine: "Work the ordered consequences.", severityExpectation: "Major-or-higher facts owe multiple orders.", consequenceCount: 0, pressureLevels: [] }
        ],
        domainAtlas: [
          { name: "Economy, trade, and scarcity", state: "unswept", declaration: "", doctrine: "Domain declarations explain the relationship." }
        ],
        decisionPoint: { sharedContract: contract },
        doctrine: { signatureTests: ["why not everywhere?"], stoppingRules: ["answered", "assigned as canon debt"] }
      },
      decisionPoint: { sharedContract: contract },
      consequences: [],
      domainSweeps: [],
      dispositions: [],
      closePreview: {
        willWrite: ["append-only propagation report", "source fact digest link"],
        existingRecords: [],
        willLeaveUntouched: ["source canon standing remains unchanged", "proposed facts remain proposed until Admission works them"],
        readSideTrail: [{ label: "Source fact", href: "/api/canon-workbench/records/11", recordId: 11 }]
      },
      readSideTrail: [{ label: "Source fact", href: "/api/canon-workbench/records/11", recordId: 11 }]
    };

    const html = renderToString(
      <App
        initialOpenWorld="/tmp/propagation.sqlite"
        initialWorkflowMap={{
          readOnly: true,
          world: { path: "/tmp/propagation.sqlite" },
          stages: [],
          queues: [],
          nextDecision: { destinationKey: "propagation", label: "Work owed propagation", reason: "Propagation-scoped canon debt is open.", href: "/api/propagation/queue" },
          destinations: [{ key: "propagation", label: "Propagation", kind: "guided-flow", summary: "Work shock cones.", state: "owed" }],
          methodCards: {}
        } as any}
        initialDestination="propagation"
        initialPropagationQueue={[{
          ...owedDebt,
          updatedAt: "2026-07-08T00:00:00.000Z",
          createdAt: "2026-07-08T00:00:00.000Z",
          scope: "propagation",
          state: "open",
          owedItem: owedDebt,
          sourceFact,
          route: { method: "POST", href: "/api/propagation/runs/start", body: { factRecordId: 11, debtRecordId: 12 } }
        } as any, {
          id: 13,
          shortId: "DEB-13",
          recordTypeKey: "canon_debt",
          title: "Propagation owed without source",
          body: "No typed source link exists.",
          truthLayer: "Objective canon",
          canonStatus: "under review",
          updatedAt: "2026-07-08T00:00:00.000Z",
          createdAt: "2026-07-08T00:00:00.000Z",
          scope: "propagation",
          state: "open",
          owedItem: { id: 13, shortId: "DEB-13", recordTypeKey: "canon_debt", title: "Propagation owed without source", body: "No typed source link exists.", truthLayer: "Objective canon", canonStatus: "under review" },
          sourceFact: null,
          route: null
        } as any]}
        initialPropagationRun={run as any}
      />
    );

    expect(html).toContain("Propagation owed for noon bridge");
    expect(html).toContain("Noon bridge testimony");
    expect(html).toContain("Propagation owed without source");
    expect(html).toContain("Missing source fact link");
    expect(html).toContain("Start is blocked until this canon debt has a derived_from source fact link.");
    expect(html).toContain("Start/Resume Owed Run");
    expect(html).toContain("Substrate/admin identifiers");
    expect(html).toContain("Zeroth-order: definition");
    expect(html).toContain("Fifth-order: identity and metaphysics");
    expect(html).toContain("Economy, trade, and scarcity");
    expect(html).toContain("unswept");
    expect(html).toContain("missing-shock-cone-orders");
    expect(html).toContain("Load Propagation Prompt-out Step");
    expect(html).toContain("Close/result preview");
    expect(html).toContain("append-only propagation report");
    expect(html).toContain("source canon standing remains unchanged");
    expect(html).toContain("Read-side trail");
    expect(html).toContain("Source fact");
  });
});
