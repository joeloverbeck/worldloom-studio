import React from "react";
import { renderToString } from "react-dom/server";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { App } from "./main";

describe("Propagation web surface", () => {
  it("keeps revision, coverage, packet, and close policy on the server-owned contract", () => {
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const skipCurrentPressure = source.slice(
      source.indexOf("const skipCurrentPropagationPressure = async () =>"),
      source.indexOf("const ensurePromptStep = async () =>")
    );

    expect(source).toContain("propagationRun?.revisionDecision");
    expect(source).toContain("propagationRun?.packetCurrentness");
    expect(source).toContain("propagationRun?.closeReadiness.blockers");
    expect(source).toContain("/api/propagation/consequences/${consequence.id}/revisions");
    expect(source).toContain("/api/propagation/domains/${domainRow.id}/revisions");
    expect(source).toContain("/api/propagation/runs/active");
    expect(source).toContain("Resolve the server-returned blockers below, then retry Close Run.");
    expect(source).toContain("Entered consequence id, disposition, debt or boundary, and note were preserved");
    expect(skipCurrentPressure).toContain("await loadPropagationRun(propagationRun.flow.id)");
    expect(skipCurrentPressure).not.toContain("payload.flow.id");
    expect(source).not.toContain("const propagationCloseReadiness");
    expect(source).not.toContain("const activePropagationConsequences");
    expect(source).not.toContain("requiredDomainStates");
  });

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

  it("renders server-owned revision lineage, row-local recovery, and packet currentness at the active decision point", () => {
    const sourceFact = {
      id: 31,
      shortId: "FAC-31",
      recordTypeKey: "canon_fact",
      title: "Bell testimony",
      body: "Ghost testimony is limited to one courthouse bell.",
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    };
    const contract = {
      flow: { key: "propagation", runState: "in_progress" },
      step: {
        key: "propagation:pre-close-revision",
        localDecision: "Revise the staged shock cone before finalization.",
        packageSource: "docs/worldbuilding-system/07_propagation_engine.md",
        why: "Pressure-earned corrections must enter the active set before close."
      },
      obligations: { required: ["Restore active-only coverage"], optional: [], skippable: ["Fresh Pressure may be skipped with governance"], severityDependent: ["Major work requires a reason"] },
      bearingContext: {
        displayed: ["Source fact: FAC-31 Bell testimony"],
        sourceManifest: ["docs/worldbuilding-system/07_propagation_engine.md", "docs/worldbuilding-system/20_ai_assisted_workflow.md"],
        omissions: ["No hidden repository context"]
      },
      promptOut: {
        serverOwned: true,
        modes: [{
          mode: "pressure",
          label: "Pressure mode",
          availability: "available",
          available: true,
          blocker: null,
          framing: "Pressure the revised active set.",
          outputLabels: ["contradiction risk", "needs human decision"],
          stepRequest: {
            method: "POST",
            href: "/api/prompt-out/steps",
            body: { flowKey: "propagation", flowId: 41, recordId: 31, templateKey: "propagation_consequence_scout", stepKey: "propagation:pre-close-revision", mode: "pressure" }
          }
        }]
      },
      blockers: [
        { key: "undispositioned-high-pressure", label: "Replacement needs disposition", message: "Active consequence #52 is undispositioned.", requires: "consequence disposition", consequenceId: 52 },
        { key: "fresh-pressure-or-skip-owed", label: "Fresh Pressure or skip owed", message: "Load current Pressure or record the governed skip.", requires: "current support" }
      ],
      writeIntent: { willWrite: ["final active shock cone", "revision audit"], willLink: ["report digest"], willQueue: [], willRouteOnward: [], willLeaveUntouched: ["source canon standing", "Admission work", "closed reports"] },
      nextOrResumeState: { currentStep: "propagation:pre-close-revision", nextStep: "Disposition active replacement", safeExit: "Return to the workflow map and resume this exact revision frontier." },
      readSideTrail: [{ label: "Audit Trail", href: "/api/canon-workbench/audit" }]
    };
    const run = {
      flow: { id: 41, state: "in_progress", current_step: "propagation:pre-close-revision", propagation_fact_record_id: 31, propagation_debt_record_id: null, propagation_active_set_revision: 8 },
      sourceFact,
      owedDebt: null,
      severityPath: { admissionLevel: "3", workScale: "major" },
      revisionDecision: {
        name: "Pre-close Propagation revision and finalization",
        packageSources: ["docs/worldbuilding-system/07_propagation_engine.md", "docs/worldbuilding-system/20_ai_assisted_workflow.md"],
        doctrine: {
          staging: "Consequences and domain declarations remain editable staging while this run is open.",
          reportBoundary: "Close freezes the active set into one append-only propagation report."
        },
        writeIntent: {
          willWrite: ["an active replacement or retraction audit", "the final active shock cone"],
          willLink: ["the final report digest"],
          willQueue: ["only steward-chosen debt"],
          willLeaveUntouched: ["source canon standing", "Admission work", "closed reports"]
        }
      },
      activeSet: { revision: 8, changedKind: "consequence-revision", changedRowId: 52, changedReason: "Pressure narrowed the market claim." },
      packetCurrentness: {
        status: "stale",
        activeSetRevision: 8,
        priorPressureRevision: 7,
        reason: "Consequence revision for row 52 made the prior packet stale.",
        recovery: { action: "load-current-packet", changedKind: "consequence-revision", changedRowId: 52, href: "/api/prompt-out/steps", body: { flowKey: "propagation", flowId: 41, mode: "pressure" } },
        pressure: {
          status: "owed",
          reasonRequired: true,
          externalLlmRequired: false,
          freshPacket: { method: "POST", href: "/api/prompt-out/steps", body: { flowKey: "propagation", flowId: 41, mode: "pressure" } },
          skip: { method: "POST", href: "/api/prompt-out/steps/actions/skip?flowKey=propagation&flowId=41&activeSetRevision=8" }
        }
      },
      closeReadiness: { status: "blocked", blockers: contract.blockers },
      plan: {
        requiredCoverage: "multiple orders and direct/dependency/reaction domains",
        requiredDomainCount: 3,
        orders: [{ key: "first", label: "First-order: direct effects" }],
        domains: ["Economy, trade, and scarcity"],
        orderControls: [{ key: "first", label: "First-order: direct effects", doctrine: "Work direct effects.", severityExpectation: "Major work owes multiple orders.", consequenceCount: 1, pressureLevels: ["high"] }],
        domainAtlas: [{ name: "Economy, trade, and scarcity", state: "direct", declaration: "Only courthouse markets pause.", doctrine: "Explain domain pressure." }],
        decisionPoint: { sharedContract: contract },
        doctrine: { signatureTests: ["why not everywhere?"], stoppingRules: ["answered"] }
      },
      decisionPoint: { sharedContract: contract },
      consequences: [
        { id: 51, orderKey: "first", orderLabel: "First-order: direct effects", domainName: "Economy, trade, and scarcity", body: "Every market closes.", pressure: "high", lineageId: "lineage-bell", version: 1, lifecycleState: "superseded", priorVersionId: null, revisionReason: "Pressure narrowed the market claim.", provenance: { created: { actor: { id: 1, name: "steward" }, timestamp: "2026-07-10T00:00:00.000Z", flowStep: "propagation:first" }, retired: { actor: { id: 1, name: "steward" }, timestamp: "2026-07-10T00:00:30.000Z", flowStep: "propagation:consequence-revision" } } },
        { id: 52, orderKey: "first", orderLabel: "First-order: direct effects", domainName: "Economy, trade, and scarcity", body: "Only courthouse markets close.", pressure: "high", lineageId: "lineage-bell", version: 2, lifecycleState: "active", priorVersionId: 51, revisionReason: "Pressure narrowed the market claim.", provenance: { created: { actor: { id: 1, name: "steward" }, timestamp: "2026-07-10T00:01:00.000Z", flowStep: "propagation:consequence-revision" }, retired: null } }
      ],
      domainSweeps: [
        { id: 61, domainName: "Economy, trade, and scarcity", triage: "reaction", declaration: "All markets react.", lineageId: "domain-bell", version: 1, lifecycleState: "retracted", priorVersionId: null, revisionReason: "The broad declaration was unsupported.", provenance: { created: { actor: { id: 1, name: "steward" }, timestamp: "2026-07-10T00:00:00.000Z", flowStep: "propagation:domain-atlas" }, retired: { actor: { id: 1, name: "steward" }, timestamp: "2026-07-10T00:02:00.000Z", flowStep: "propagation:domain-retraction" } } }
      ],
      dispositions: [{ id: 71, flowId: 41, consequenceId: 51, disposition: "answered", note: "Historical answer", active: false, debtRecordId: null, preservationBoundary: null, flowStep: "propagation:disposition", createdAt: "2026-07-10T00:00:30.000Z" }],
      closePreview: {
        willWrite: ["1 final active consequence version", "2 retired revision audit rows"],
        existingRecords: [{ kind: "active consequence", recordId: 52, title: "Only courthouse markets close." }],
        willLeaveUntouched: ["source canon standing remains unchanged", "Admission work and sibling proposals remain unchanged", "prior propagation reports remain append-only"],
        readSideTrail: contract.readSideTrail
      },
      readSideTrail: contract.readSideTrail
    };

    const html = renderToString(
      <App
        initialOpenWorld="/tmp/propagation-revision.sqlite"
        initialWorkflowMap={{
          readOnly: true,
          world: { path: "/tmp/propagation-revision.sqlite" },
          stages: [],
          queues: [],
          nextDecision: { destinationKey: "propagation", label: "Revise Propagation", reason: "Pressure found a correction.", href: "/api/propagation/runs/41" },
          destinations: [{ key: "propagation", label: "Propagation", kind: "guided-flow", summary: "Revise staged shock cone.", state: "active" }],
          methodCards: {}
        } as any}
        initialDestination="propagation"
        initialPropagationRun={run as any}
      />
    );

    expect(html).toContain("Pre-close Propagation revision and finalization");
    expect(html).toContain("Editable staging");
    expect(html).toContain("Append-only report boundary");
    expect(html).toContain("Active · lineage lineage-bell · version 2");
    expect(html).toContain("Superseded · lineage lineage-bell · version 1");
    expect(html).toContain("Pressure narrowed the market claim.");
    expect(html).toContain("Created by steward (#1) · propagation:first · 2026-07-10T00:00:00.000Z");
    expect(html).toContain("Retired by steward (#1) · propagation:consequence-revision · 2026-07-10T00:00:30.000Z");
    expect(html).toContain("Historical disposition: answered");
    expect(html).toContain("Active replacement is undispositioned");
    expect(html).toContain("Revise consequence #52");
    expect(html).toContain("Retract consequence #52");
    expect(html).toContain("Retracted · lineage domain-bell · version 1");
    expect(html).toContain("Stale Propagation packet");
    expect(html).toContain("Consequence revision for row 52 made the prior packet stale.");
    expect(html).toContain("Load current Pressure packet");
    expect(html).toContain("Fresh Pressure or governed skip");
    expect(html).toContain("External LLM use remains optional");
    expect(html).toContain("Disposition active replacement");
    expect(html).toContain("source canon standing");
    expect(html).toContain("Admission work");
    expect(html).toContain("closed reports");
  });
});
