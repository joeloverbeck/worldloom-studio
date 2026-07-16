import React from "react";
import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./main";

const workflowMap = {
  readOnly: true,
  world: { path: "/tmp/map-first.sqlite" },
  stages: [
    { key: "creation", label: "Creation", state: "active", summary: "Start with the world kernel.", destinationKey: "creation" },
    { key: "admission", label: "Admission", state: "not_yet_earned", summary: "Admission queue waits for proposed seeds.", unlockReason: "Create or park proposed seeds.", destinationKey: "admission" },
    { key: "propagation", label: "Propagation", state: "not_yet_earned", summary: "Propagation starts after admitted major facts.", unlockReason: "Admit a major fact.", destinationKey: "propagation" },
    { key: "contradiction", label: "Contradiction/Retcon/Mystery", state: "not_yet_earned", summary: "Repair or protect pressure after propagation.", unlockReason: "Propagation or contradiction pressure creates owed work.", destinationKey: "contradiction" },
    { key: "qa", label: "QA", state: "not_yet_earned", summary: "QA comes before calling the world stable.", unlockReason: "Work enough world material to assess.", destinationKey: "qa" }
  ],
  queues: [
    { key: "admission", label: "Admission queue", count: 0, destinationKey: "admission", href: "/api/admission/queue", summary: "Proposed facts awaiting governance." },
    { key: "owed-boundaries", label: "Owed boundaries", count: 0, destinationKey: "contradiction", href: "/api/contradiction/owed-boundaries", summary: "Protected consequences awaiting mystery ledgers." }
  ],
  nextDecision: {
    destinationKey: "creation",
    label: "Start Creation",
    reason: "No world kernel exists yet.",
    href: "/api/flows/creation/start"
  },
  destinations: [
    { key: "creation", label: "Creation", kind: "guided-flow", summary: "Create the world kernel.", state: "active" },
    { key: "admission", label: "Admission", kind: "guided-flow", summary: "Govern proposed facts.", state: "not_yet_earned" },
    { key: "canon-workbench", label: "Canon Workbench", kind: "read-side", summary: "Read current canon.", state: "available" },
    { key: "markdown-export", label: "Markdown export", kind: "read-side", summary: "Export records.", state: "available" },
    { key: "substrate", label: "Substrate", kind: "substrate", summary: "Generic record, link, search, draft, and Prompt-out admin tools.", state: "available" }
  ]
};

const preAdmissionWorkflowMap = {
  ...workflowMap,
  stages: [
    { key: "creation", label: "Creation", state: "owed", summary: "Seed decomposition is owed before Admission has proposed-seed work.", destinationKey: "creation" },
    { key: "admission", label: "Admission", state: "not_yet_earned", summary: "Admission queue work begins after Creation parks proposed seeds.", unlockReason: "Park proposed seeds through Creation seed decomposition before Admission has work.", destinationKey: "admission" },
    { key: "qa", label: "QA", state: "not_yet_earned", summary: "QA checks stability before calling the world stable.", unlockReason: "World material must exist before QA can assess it.", destinationKey: "qa" }
  ],
  queues: [
    { key: "admission", label: "Admission queue", count: 0, destinationKey: "admission", href: "/api/admission/queue", summary: "Admission queue is 0 because no proposed seeds exist yet; seed decomposition unlocks Admission work." }
  ],
  nextDecision: {
    destinationKey: "creation",
    label: "Seed decomposition owed",
    reason: "The world kernel is saved, but Creation must park proposed seeds before Admission has work.",
    href: "/api/flows/creation/start"
  },
  destinations: [
    { key: "creation", label: "Creation", kind: "guided-flow", summary: "Kernel, seed decomposition, and the Minimal Viable World checkpoint.", state: "active" },
    { key: "admission", label: "Admission", kind: "guided-flow", summary: "Govern proposed facts into canon standing.", state: "not_yet_earned" },
    { key: "qa", label: "QA", kind: "guided-flow", summary: "Score stability before calling the world stable.", state: "not_yet_earned" },
    { key: "substrate", label: "Substrate", kind: "substrate", summary: "Generic record, link, search, draft, and Prompt-out admin tools.", state: "available" }
  ]
};

const bothQueuesWorkflowMap = {
  ...workflowMap,
  world: { path: "/tmp/admission-propagation.sqlite" },
  stages: [
    { key: "creation", label: "Creation", state: "done", summary: "Creation prerequisites and seed-family coverage are clear.", destinationKey: "creation" },
    { key: "admission", label: "Admission", state: "active", summary: "Admission is the only path from proposed fact to canon standing.", destinationKey: "admission" },
    { key: "propagation", label: "Propagation", state: "owed", summary: "Major facts owe a shock cone and stopping-rule dispositions.", destinationKey: "propagation" }
  ],
  queues: [
    { key: "admission", label: "Admission queue", count: 1, destinationKey: "admission", href: "/api/admission/queue", summary: "Proposed or under-review facts awaiting governance." },
    { key: "owed-propagation", label: "Owed propagation", count: 1, destinationKey: "propagation", href: "/api/propagation/queue", summary: "Propagation-scoped debt and owed shock cones." }
  ],
  nextDecision: {
    destinationKey: "propagation",
    label: "Work owed propagation",
    reason: "Accepted canon has an owed shock cone that should be worked before further dependency-bearing Admission.",
    href: "/api/propagation/queue"
  },
  destinations: [
    { key: "admission", label: "Admission", kind: "guided-flow", summary: "Govern proposed facts into canon standing.", state: "active" },
    { key: "propagation", label: "Propagation", kind: "guided-flow", summary: "Work shock cones and consequence dispositions.", state: "owed" },
    { key: "substrate", label: "Substrate", kind: "substrate", summary: "Generic record, link, search, draft, and Prompt-out admin tools.", state: "available" }
  ]
};

const conditionalPassWorkflowMap = {
  ...bothQueuesWorkflowMap,
  world: { path: "/tmp/conditional-pass.sqlite" },
  stages: [
    { key: "admission", label: "Admission", state: "active", summary: "Admission remains a directly navigable steward choice.", destinationKey: "admission" },
    { key: "conditional-passes", label: "Conditional passes", state: "owed", summary: "Three source-linked passes remain owed.", destinationKey: "temporal" }
  ],
  queues: [
    { key: "admission", label: "Admission queue", count: 1, destinationKey: "admission", href: "/api/admission/queue", summary: "One proposed fact remains available." },
    { key: "conditional-passes", label: "Conditional passes", count: 3, destinationKey: "temporal", href: "/api/conditional-pass-obligations", summary: "Source-linked specialized passes remain owed." }
  ],
  nextDecision: {
    destinationKey: "temporal",
    label: "Work Temporal/Timeline for FAC-3 after PRP-1",
    reason: "A completed foundational Propagation run still owes specialized work before further dependency-bearing Admission; Admission remains directly available.",
    href: "/api/temporal/runs/start"
  },
  destinations: [
    { key: "admission", label: "Admission", kind: "guided-flow", summary: "Govern proposed facts into canon standing.", state: "active" },
    { key: "temporal", label: "Temporal/Timeline", kind: "guided-flow", summary: "Work the source-selected timing pass.", state: "owed" },
    { key: "constraint", label: "Constraint Composition", kind: "guided-flow", summary: "Work the source-selected constraint pass.", state: "owed" },
    { key: "stage12", label: "Institutional / Economic / Suppression", kind: "guided-flow", summary: "Work the source-selected institutional pass.", state: "owed" }
  ],
  conditionalPasses: {
    readOnly: true,
    doctrine: "The foundational full-pass rule owes all three passes; Admission remains available and is not a hard gate.",
    outstandingCount: 3,
    governedCount: 0,
    nextOrResumeState: { current: "Temporal/Timeline", next: "Constraint Composition", resume: "Return safely to a fresh workflow-map response." },
    obligations: [
      ["temporal_timeline", "Temporal/Timeline", 1, "temporal"],
      ["constraint_composition", "Constraint Composition", 2, "constraint"],
      ["institutional_economic_suppression", "Institutional / Economic / Suppression", 3, "stage12"]
    ].map(([passKey, passLabel, ordinal, destinationKey], index) => ({
      id: index + 1,
      record: { id: 10 + index, shortId: `CPO-${index + 1}`, recordTypeKey: "conditional_pass_obligation", title: `${passLabel} owed`, body: "Structured state owns identity.", canonStatus: "accepted" },
      sourceFact: { id: 3, shortId: "FAC-3", recordTypeKey: "canon_fact", title: "Foundational chrononaut", body: "Source fact body.", canonStatus: "accepted" },
      propagationReport: { id: 9, shortId: "PRP-1", recordTypeKey: "propagation_report", title: "Chrononaut shock cone", body: "Append-only report.", canonStatus: "accepted" },
      passKey,
      passLabel,
      ordinal,
      disposition: index === 1 ? "covered" : index === 2 ? "deferred" : "outstanding",
      rationale: index === 2 ? "Govern after institutional actors are named." : null,
      coveringEvidence: index === 1
        ? { id: 20, shortId: "PAS-1", recordTypeKey: "pass_report", title: "Constraint pass report", body: "Completed evidence.", canonStatus: "accepted" }
        : null,
      doctrine: "Foundational Propagation owes this specialized pass before further dependency-bearing Admission.",
      packageSources: [
        "docs/worldbuilding-system/03_truth_layers_and_canon_governance.md",
        "docs/worldbuilding-system/07_propagation_engine.md",
        "docs/worldbuilding-system/22_glossary.md"
      ],
      fieldClassifications: {
        required: index === 1 ? [] : ["reason"],
        optional: [],
        skippable: index === 1 ? [] : ["governed deferral with written rationale"],
        severityDependent: []
      },
      blocker: index === 1 ? "Covered Conditional-pass obligations are terminal in this lifecycle." : null,
      remediation: index === 1 ? "Correct completed work through the owning specialized flow." : null,
      destination: {
        destinationKey,
        label: passLabel,
        method: "POST",
        href: `/api/${destinationKey}/runs/start`,
        available: index === 0,
        blocker: index === 0 ? null : "The source-selected pass route is available only while the obligation is outstanding.",
        body: {
          sourceType: "fact",
          recordId: 3,
          conditionalPassObligationId: index + 1,
          propagationReportRecordId: 9
        }
      },
      provenance: { actor: "steward", timestamp: "2026-07-12T10:00:00.000Z", flowStep: "propagation:close:conditional-pass-handoff", sourceFact: { id: 3, shortId: "FAC-3" }, propagationReport: { id: 9, shortId: "PRP-1" } },
      history: index === 1
        ? [{ action: "covered", priorState: "outstanding", resultingState: "covered", rationale: null, evidenceRecordId: 20, actor: "steward", timestamp: "2026-07-12T10:20:00.000Z", flowStep: "constraint:complete" }]
        : index === 2
          ? [{ action: "deferred", priorState: "outstanding", resultingState: "deferred", rationale: "Govern after institutional actors are named.", evidenceRecordId: null, actor: "steward", timestamp: "2026-07-12T10:15:00.000Z", flowStep: "conditional-pass-obligation:defer" }]
          : [],
      readSideTrail: [
        { label: "Source fact FAC-3", recordId: 3, href: "/api/canon-workbench/records/3" },
        { label: "Propagation report PRP-1", recordId: 9, href: "/api/canon-workbench/records/9" }
      ],
      action: index === 0
        ? {
            kind: "defer",
            label: "Defer with rationale",
            method: "POST",
            href: `/api/conditional-pass-obligations/${index + 1}/defer`,
            requiredReason: true,
            requiredRationale: true,
            reasonLabel: "Deferral rationale",
            identityGuards: ["passKey", "sourceFactRecordId", "propagationReportRecordId"],
            body: { disposition: "deferred", expectedDisposition: "outstanding", passKey, sourceFactRecordId: 3, propagationReportRecordId: 9 },
            proposedWrite: `Defer ${passLabel} while preserving governed history.`,
            willLeaveUntouched: ["source fact", "Propagation report", "Admission queue"]
          }
        : index === 2
          ? {
              kind: "reinstate",
              label: "Reinstate obligation",
              method: "POST",
              href: `/api/conditional-pass-obligations/${index + 1}/reinstate`,
              requiredReason: true,
              requiredRationale: true,
              reasonLabel: "Reinstatement reason",
              identityGuards: ["passKey", "sourceFactRecordId", "propagationReportRecordId"],
              body: { disposition: "outstanding", expectedDisposition: "deferred", passKey, sourceFactRecordId: 3, propagationReportRecordId: 9 },
              proposedWrite: `Reinstate ${passLabel} and restore the source-selected route.`,
              willLeaveUntouched: ["source fact", "Propagation report", "prior events", "Admission queue"]
            }
          : null
    }))
  }
};

describe("workflow map shell", () => {
  it("opens an existing world on the workflow map rather than the stacked workspace", () => {
    const html = renderToString(<App initialOpenWorld="/tmp/map-first.sqlite" initialWorkflowMap={workflowMap as any} />);
    const shellSource = readFileSync(new URL("./workflow-shell.tsx", import.meta.url), "utf8");

    expect(html).toContain("Workflow map");
    expect(html).toContain("Where am I in the method");
    expect(html).toContain("Start Creation");
    expect(html).toContain("No world kernel exists yet.");
    expect(html).toContain("Admission queue");
    expect(html).toContain("Owed boundaries");
    expect(html).toContain("not yet earned");
    expect(html).toContain("available");
    expect(html).toContain("Canon Workbench");
    expect(html).toContain("Substrate");
    expect(html).not.toContain("New record");
    expect(html).not.toContain("QA flow");
    expect(shellSource).toContain("WorkflowMapHome");
    expect(shellSource).toContain("DestinationSurface");
    expect(shellSource).toContain("SurfaceNavigation");
  });

  it("shows one routed destination at a time with a safe return to the map", () => {
    const creationHtml = renderToString(<App
      initialOpenWorld="/tmp/map-first.sqlite"
      initialWorkflowMap={workflowMap as any}
      initialDestination="creation"
    />);

    expect(creationHtml).toContain("Creation decision point");
    expect(creationHtml).toContain("Back to workflow map");
    expect(creationHtml).not.toContain("Canon Workbench text query");
    expect(creationHtml).not.toContain("QA flow");

    const substrateHtml = renderToString(<App
      initialOpenWorld="/tmp/map-first.sqlite"
      initialWorkflowMap={workflowMap as any}
      initialDestination="substrate"
    />);

    expect(substrateHtml).toContain("Substrate");
    expect(substrateHtml).toContain("Prompt-out substrate/admin");
    expect(substrateHtml).toContain("New record");
    expect(substrateHtml).not.toContain("Creation decision point");
  });

  it("renders server-owned pre-Admission handoff state without local readiness policy", () => {
    const html = renderToString(<App initialOpenWorld="/tmp/pre-admission.sqlite" initialWorkflowMap={preAdmissionWorkflowMap as any} />);
    const shellSource = readFileSync(new URL("./workflow-shell.tsx", import.meta.url), "utf8");

    expect(html).toContain("Seed decomposition owed");
    expect(html).toContain("Creation must park proposed seeds before Admission has work");
    expect(html).toContain("Seed decomposition is owed before Admission has proposed-seed work.");
    expect(html).toContain("Park proposed seeds through Creation seed decomposition before Admission has work.");
    expect(html).toContain("Admission queue");
    expect(html).toContain("0");
    expect(html).toContain("no proposed seeds exist yet");
    expect(html).not.toContain("Review stability");
    expect(shellSource).not.toContain("world_kernel");
    expect(shellSource).not.toContain("admissionQueue");

    const creationHtml = renderToString(<App
      initialOpenWorld="/tmp/pre-admission.sqlite"
      initialWorkflowMap={preAdmissionWorkflowMap as any}
      initialDestination="creation"
    />);
    expect(creationHtml).toContain("Creation decision point");
    expect(creationHtml).toContain("Back to workflow map");
    expect(creationHtml).not.toContain("QA flow");
  });

  it("renders server-owned owed-Propagation priority while keeping Admission visible and routeable", () => {
    const html = renderToString(<App
      initialOpenWorld="/tmp/admission-propagation.sqlite"
      initialWorkflowMap={bothQueuesWorkflowMap as any}
    />);
    const shellSource = readFileSync(new URL("./workflow-shell.tsx", import.meta.url), "utf8");

    expect(html).toContain("Work owed propagation");
    expect(html).toContain("Accepted canon has an owed shock cone that should be worked before further dependency-bearing Admission.");
    expect(html).toContain("Admission queue");
    expect(html).toContain("Owed propagation");
    expect(html).toContain("Proposed or under-review facts awaiting governance.");
    expect(html).toContain("Propagation-scoped debt and owed shock cones.");
    expect(html).toContain("Govern proposed facts into canon standing.");
    expect(html).toContain("Work shock cones and consequence dispositions.");
    expect(html).toContain("Go to decision");
    expect(html.match(/>1</g)).toHaveLength(2);
    expect(shellSource).toContain("workflowMap.nextDecision.destinationKey");
    expect(shellSource).toContain("queue.destinationKey");
    expect(shellSource).not.toContain("work_scale");
    expect(shellSource).toContain("obligation.sourceFact.shortId");
    expect(shellSource).toContain("obligation.propagationReport.shortId");
    expect(shellSource).not.toContain("derived_from");
    expect(shellSource).not.toContain("canon_debt");
  });

  it("renders the server-owned post-Propagation handoff, governed ledger, and deferral contract", () => {
    const html = renderToString(<App
      initialOpenWorld="/tmp/conditional-pass.sqlite"
      initialWorkflowMap={conditionalPassWorkflowMap as any}
    />);
    const shellSource = readFileSync(new URL("./workflow-shell.tsx", import.meta.url), "utf8");
    const mainSource = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(html).toContain("Post-Propagation conditional-pass handoff");
    expect(html).toContain("Work Temporal/Timeline for FAC-3 after PRP-1");
    expect(html).toContain("The foundational full-pass rule owes all three passes");
    expect(html).toContain("Temporal/Timeline");
    expect(html).toContain("Constraint Composition");
    expect(html).toContain("Institutional / Economic / Suppression");
    expect(html).toContain("FAC-3");
    expect(html).toContain("Foundational chrononaut");
    expect(html).toContain("PRP-1");
    expect(html).toContain("Chrononaut shock cone");
    expect(html).toContain("outstanding");
    expect(html).toContain("covered");
    expect(html).toContain("deferred");
    expect(html).toContain("PAS-1");
    expect(html).toContain("Govern after institutional actors are named.");
    expect(html).toContain("Follow source-selected pass");
    expect(html).toContain("Deferral rationale");
    expect(html).toMatch(/Preview governed.*deferral/);
    expect(html).toContain("Reinstatement reason");
    expect(html).toMatch(/Preview governed.*reinstatement/);
    expect(html).toContain("docs/worldbuilding-system/03_truth_layers_and_canon_governance.md");
    expect(html).toContain("docs/worldbuilding-system/07_propagation_engine.md");
    expect(html).toContain("docs/worldbuilding-system/22_glossary.md");
    expect(html).toContain("Required fields");
    expect(html).toContain("Source fact FAC-3");
    expect(html).toContain("Admission queue");
    expect(html).toContain("One proposed fact remains available.");
    expect(shellSource).toContain("const handoff = workflowMap.conditionalPasses");
    expect(shellSource).toContain("handoff.obligations.map");
    expect(shellSource).toContain("disabled={!obligation.destination.available}");
    expect(shellSource).toContain("obligation.action.kind");
    expect(shellSource).not.toContain('obligation.disposition !== "outstanding"');
    expect(shellSource).not.toMatch(/title.*includes\(|body.*includes\(|temporal.*test\(/i);
    expect(mainSource).toContain("obligation.destination.body.conditionalPassObligationId");
    expect(mainSource).toContain("obligation.destination.body.propagationReportRecordId");
  });
});
