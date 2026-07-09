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
});
