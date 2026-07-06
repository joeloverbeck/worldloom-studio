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

describe("Creation decision-point web surface", () => {
  it("renders Creation as the new-world decision surface and consumes server policy shapes", () => {
    const html = renderToString(<App initialOpenWorld="/tmp/creation.sqlite" />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const decomposeAction = snippetBetween(source, "const decompose = async () =>", "const proposeRecord = async");
    const creationPanel = snippetBetween(source, "<h2>Creation decision point</h2>", "{message &&");

    expect(html).toContain("Creation decision point");
    expect(html).toContain("Primary active path for a new world");
    expect(html).toContain("governing kernel or pressure seed");
    expect(html).toContain("Provenance");
    expect(html).toContain("Server-returned method-card provenance loads after the Creation flow starts.");
    expect(html).toContain("Required");
    expect(html).toContain("Allowed-empty");
    expect(html).toContain("Consequence mode is steward judgment");
    expect(html).toContain("Prompt-out preview");
    expect(html).toContain("Source manifest");
    expect(html).toContain("Pasted responses remain advisory artifacts");
    expect(html).toContain("Seed decomposition decision");
    expect(html).toContain("Actual current status: proposed");
    expect(html).toContain("Granularity confirmation");
    expect(html).toContain("Write preview");
    expect(html).toContain("Admission handoff");
    expect(html).toContain("Read-side trail");
    expect(html).toContain("Safe exit/resume");
    expect(html).toContain("Naive steward walkthrough");

    expect(source).toContain("CreationDecisionPoint");
    expect(source).toContain("setCreationDecision");
    expect(source).toContain("payload.decisionPoint");
    expect(source).toContain("creationDecision.promptOut.stepRequest");
    expect(source).toContain("granularityConfirmed");
    expect(source).toContain("seedTruthLayer");
    expect(decomposeAction).not.toContain("recordForm.canonStatus");
    expect(creationPanel).not.toContain("recordForm.canonStatus");
  });

  it("renders Minimal Viable World checkpoint coverage, dispositions, proposals, and Prompt-out wiring", () => {
    const minimalViableWorld = {
      checkpoint: {
        owed: true,
        report: { id: 12, shortId: "PAS-1", title: "Minimal Viable World checkpoint", recordTypeKey: "pass_report", body: "Minimal Viable World checkpoint", truthLayer: "Objective canon", canonStatus: "accepted", updatedAt: "now" },
        route: "/api/flows/creation/minimal-viable-world",
        blockers: [],
        coverageSignals: {
          admittedSeeds: [{
            id: 2,
            shortId: "FAC-1",
            title: "Bell testimony is accepted",
            recordTypeKey: "canon_fact",
            canonStatus: "accepted",
            dimensions: [
              { key: "ordinary_life", label: "ordinary-life residue", status: "present", evidence: [{ id: 4, shortId: "FAC-2", title: "Morning bell routine", recordTypeKey: "canon_fact", canonStatus: "accepted" }], reason: "linked evidence" },
              { key: "mystery_boundary", label: "governed contradiction or mystery boundary", status: "protected", evidence: [], reason: "protected" }
            ]
          }],
          wholeWorld: [
            { key: "core_promise", label: "core promise", status: "present", evidence: [], reason: "kernel" },
            { key: "automatic_verdict", label: "automatic pass/fail verdict", status: "not_applicable", evidence: [], reason: "no verdict" }
          ]
        },
        dispositions: [],
        closeReadiness: { status: "blocked", blockers: [{ key: "2:ordinary_life", label: "FAC-1 ordinary-life residue", message: "Disposition required." }] },
        unresolvedDeferrals: [],
        openCanonDebt: [],
        admissionProposals: [],
        advisoryArtifacts: []
      },
      decisionPoint: {
        sharedContract: {
          flow: { key: "creation", runState: "checkpoint_owed" },
          step: { key: "minimal_viable_world:coverage_review", localDecision: "Judge Minimal Viable World coverage.", packageSource: "docs/worldbuilding-system/05_creation_protocol.md", why: "phases 4-8" },
          obligations: { required: [], optional: [], skippable: [], severityDependent: [] },
          bearingContext: { displayed: ["Minimal Viable World checkpoint"], sourceManifest: ["Admitted seed: FAC-1"], omissions: ["No verdict"] },
          promptOut: { serverOwned: true, modes: [{ mode: "proposal", label: "Proposal mode", availability: "available", blocker: null, framing: "candidate residue", stepRequest: { method: "POST", href: "/api/prompt-out/steps", body: { flowKey: "creation", templateKey: "minimal_viable_world_checkpoint", stepKey: "minimal_viable_world:coverage_review", recordId: 12, mode: "proposal" } } }] },
          blockers: [],
          writeIntent: { willWrite: ["pass_report disposition sections"], willLink: ["evidence links"], willQueue: ["Admission proposals"], willRouteOnward: ["QA echo"], willLeaveUntouched: ["the checkpoint does not admit facts"] },
          nextOrResumeState: { currentStep: "minimal_viable_world:coverage_review", nextStep: "record first checkpoint dispositions", safeExit: "Return to the workflow map." },
          readSideTrail: [{ label: "checkpoint report PAS-1", href: "/api/canon-workbench/records/12", recordId: 12 }]
        }
      }
    };
    const html = renderToString(<App initialOpenWorld="/tmp/creation.sqlite" initialMinimalViableWorld={minimalViableWorld as any} />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(html).toContain("Minimal Viable World checkpoint");
    expect(html).toContain("Minimal Viable World decision contract");
    expect(html).toContain("ordinary-life residue");
    expect(html).toContain("automatic pass/fail verdict");
    expect(html).toContain("Record Checkpoint Disposition");
    expect(html).toContain("Route Checkpoint Proposal");
    expect(html).toContain("Load Checkpoint Prompt-out Step");
    const activeCheckpointStart = html.indexOf("Minimal Viable World checkpoint");
    const activeCheckpointEnd = html.indexOf("Kernel authoring", activeCheckpointStart);
    const activeCheckpointPanel = html.slice(activeCheckpointStart, activeCheckpointEnd);
    expect(activeCheckpointPanel).toContain("Protected record id");
    expect(activeCheckpointPanel).toContain("Deferral");
    expect(activeCheckpointPanel).toContain("Debt name");
    expect(activeCheckpointPanel).toContain("Proposal seed");
    expect(activeCheckpointPanel).toContain("Truth layer");
    const activeCheckpointSourceStart = source.indexOf('<section className="subpanel minimal-viable-world-checkpoint">');
    const activeCheckpointSourceEnd = source.indexOf('<section className="subpanel">', activeCheckpointSourceStart + 1);
    const activeCheckpointSource = source.slice(activeCheckpointSourceStart, activeCheckpointSourceEnd);
    expect(activeCheckpointSource).toContain("minimalProtectedRecordId");
    expect(activeCheckpointSource).toContain("minimalDeferralKind");
    expect(activeCheckpointSource).toContain("minimalDebtName");
    expect(activeCheckpointSource).toContain("minimalProposalSeedRecordId");
    expect(activeCheckpointSource).toContain("minimalProposalTruthLayer");
    expect(source).toContain("/api/flows/creation/minimal-viable-world/dispositions");
    expect(source).toContain("/api/flows/creation/minimal-viable-world/admission-proposals");
    expect(source).toContain("minimal_viable_world_checkpoint");
    expect(source).toContain("recordMinimalViableWorldDisposition");
    expect(source).toContain("routeMinimalViableWorldProposal");
  });

  it("renders the post-decomposition handoff from server-owned policy without turning source paths into guidance", () => {
    const handoffDecision = {
      flow: { key: "creation", runState: "complete" },
      currentStep: "decomposition:complete",
      localDecision: "Split broad steward material into smaller seed facts that can be independently rejected.",
      packageAuthority: {
        primary: "docs/worldbuilding-system/05_creation_protocol.md",
        why: "Phase 2 owns seed decomposition, granularity, and the boundary before Admission.",
        citations: ["docs/worldbuilding-system/05_creation_protocol.md#phase-2-seed-decomposition"]
      },
      currentKernel: { id: 1, shortId: "KER-1", title: "World kernel" },
      sectionPrompts: [],
      work: {
        required: ["Seed title", "Seed body", "Truth layer"],
        optional: ["Admission intent note for future review"],
        allowedEmpty: [],
        skippable: ["Prompt-out advisory pressure can be declined with a skip_record"]
      },
      blockers: [],
      promptOut: {
        available: true,
        blocker: null,
        templateKey: "decomposition_pressure",
        stepKey: "creation:decomposition_prompt",
        role: "Prerequisite auditor",
        stepRequest: {
          method: "POST",
          href: "/api/prompt-out/steps",
          body: {
            flowKey: "creation",
            flowId: 1,
            recordId: 3,
            templateKey: "decomposition_pressure",
            stepKey: "creation:decomposition_prompt",
            label: "Prerequisite auditor"
          }
        },
        preview: {
          currentDecision: "Split broad steward material into smaller seed facts that can be independently rejected.",
          promptText: "Seed decomposition report SEE-1\nParked seed FAC-1\nCreation parks proposed seeds; Admission owns first canon standing.",
          contextPreview: "Seed decomposition report SEE-1\nParked seed FAC-1: Echo court testimony\nCanon status: proposed",
          sourceManifest: [
            "Seed decomposition report: SEE-1 Seed decomposition",
            "Parked seed: FAC-1 Echo court testimony",
            "Doctrine excerpt: Phase 2 granularity rule"
          ],
          omissions: ["Frontloaded seed audit results omitted: Admission owns that instrument and no result exists yet."],
          advisoryCanonWarning: "Prompt-out is optional advisory pressure. Pasted responses remain advisory artifacts and are not admitted canon."
        }
      },
      writeIntent: {
        willWrite: ["seed_decomposition report", "canon_fact records fixed at proposed"],
        willLink: ["derived_from links from parked seeds to the kernel and decomposition report"],
        willQueue: ["parked seeds appear in the Admission queue"],
        willRouteOnward: ["Admission flow"],
        willLeaveUntouched: ["canon standing is not admitted inside Creation", "pasted advisory text does not alter canon fields"]
      },
      nextOrResumeState: {
        currentStep: "decomposition:complete",
        nextStep: "Admission queue selection",
        safeExit: "Safe exit keeps the completed handoff visible from the world file."
      },
      readSideTrail: [
        { label: "Kernel record", href: "/api/canon-workbench/records/1", recordId: 1 },
        { label: "Seed decomposition report", href: "/api/canon-workbench/records/3", recordId: 3 },
        { label: "Parked seed FAC-1", href: "/api/canon-workbench/records/4", recordId: 4 },
        { label: "Admission queue", href: "/api/admission/queue" }
      ],
      handoffs: ["seed decomposition surface", "browser evidence/coverage closeout"],
      handoff: {
        seedDecompositionReport: { id: 3, shortId: "SEE-1", title: "Seed decomposition", recordTypeKey: "seed_decomposition", body: "Kernel KER-1", truthLayer: "Objective canon", canonStatus: "proposed" },
        reportSections: [],
        parkedSeeds: [{
          id: 4,
          shortId: "FAC-1",
          title: "Echo court testimony",
          recordTypeKey: "canon_fact",
          body: "Courts accept echo testimony under conditions.",
          truthLayer: "Objective canon",
          canonStatus: "proposed",
          sourceLinks: [
            { label: "Kernel KER-1: World kernel", href: "/api/canon-workbench/records/1", recordId: 1, shortId: "KER-1", title: "World kernel", recordTypeKey: "world_kernel", linkTypeKey: "derived_from", note: "Seed decomposed from world kernel" },
            { label: "Seed decomposition report SEE-1: Seed decomposition", href: "/api/canon-workbench/records/3", recordId: 3, shortId: "SEE-1", title: "Seed decomposition", recordTypeKey: "seed_decomposition", linkTypeKey: "derived_from", note: "Seed recorded by decomposition report" }
          ]
        }],
        supportingKernel: { id: 1, shortId: "KER-1", title: "World kernel", recordTypeKey: "world_kernel", body: "A city hears its dead.", truthLayer: "Objective canon", canonStatus: "proposed" },
        kernelSections: [],
        granularityRationale: "Each seed can be rejected without rewriting its siblings.",
        admissionIntent: "Audit during Admission for institutional cost.",
        admissionQueueRoute: "/api/admission/queue",
        currentStatus: "proposed",
        nextStep: "Admission queue selection",
        sourceLinks: [
          { label: "Kernel KER-1: World kernel", href: "/api/canon-workbench/records/1", recordId: 1, shortId: "KER-1", title: "World kernel", recordTypeKey: "world_kernel", linkTypeKey: "derived_from", note: "Creation handoff kernel" },
          { label: "Seed decomposition report SEE-1: Seed decomposition", href: "/api/canon-workbench/records/3", recordId: 3, shortId: "SEE-1", title: "Seed decomposition", recordTypeKey: "seed_decomposition", linkTypeKey: "derived_from", note: "Creation handoff report" }
        ],
        doctrineAtPointOfUse: [
          "Phase 2 granularity rule: split until each seed could be independently rejected without destroying its siblings.",
          "Creation parks proposed seeds; Admission owns first canon standing.",
          "Prompt-out is optional advisory pressure after steward-authored material."
        ]
      }
    };

    const html = renderToString(<App
      initialOpenWorld="/tmp/creation.sqlite"
      initialRecords={[
        { id: 1, shortId: "KER-1", title: "World kernel", recordTypeKey: "world_kernel", body: "", truthLayer: "Objective canon", canonStatus: "proposed", updatedAt: "now" },
        { id: 4, shortId: "FAC-1", title: "Echo court testimony", recordTypeKey: "canon_fact", body: "Courts accept echo testimony under conditions.", truthLayer: "Objective canon", canonStatus: "proposed", updatedAt: "now" }
      ]}
      initialCreationDecision={handoffDecision as any}
    />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(html).toContain("Creation-to-Admission handoff");
    expect(html).toContain("FAC-1 · Echo court testimony");
    expect(html).toContain("Courts accept echo testimony under conditions.");
    expect(html).toContain("Current canon status: proposed");
    expect(html).toContain("Admission intent: Audit during Admission for institutional cost.");
    expect(html).toContain("Creation parks proposed seeds; Admission owns first canon standing.");
    expect(html).toContain("File paths and package sources are provenance, not primary operating instructions.");
    expect(html).toContain("Seed decomposition report SEE-1");
    expect(html).toContain("Admission queue selection");
    expect(html).toContain("Prompt-out substrate/admin");
    expect(html).toContain("Generic Prompt-out is secondary to the in-flow Creation Prompt-out path.");
    expect(html).toContain("Not current: work from the Creation handoff before starting unrelated advanced flows.");
    expect(source).toContain("creationDecision.handoff");
    expect(source).toContain("displayedCreationDecision.handoff.parkedSeeds");
  });

  it("renders routed Creation controls for selected-section guidance, readiness, and inline recovery", () => {
    const workflowMap = {
      readOnly: true,
      world: { path: "/tmp/creation.sqlite" },
      stages: [
        { key: "creation", label: "Creation", state: "active", summary: "Start with the world kernel.", destinationKey: "creation" },
        { key: "admission", label: "Admission", state: "not_yet_earned", summary: "Admission waits for proposed seeds.", unlockReason: "Park proposed seeds.", destinationKey: "admission" }
      ],
      queues: [],
      nextDecision: { destinationKey: "creation", label: "Start Creation", reason: "No world kernel exists yet.", href: "/api/flows/creation/start" },
      destinations: [
        { key: "creation", label: "Creation", kind: "guided-flow", summary: "Create the world kernel.", state: "active" },
        { key: "substrate", label: "Substrate", kind: "substrate", summary: "Generic record, link, search, draft, and Prompt-out admin tools.", state: "available" }
      ]
    };
    const html = renderToString(<App
      initialOpenWorld="/tmp/creation.sqlite"
      initialWorkflowMap={workflowMap as any}
      initialDestination="creation"
    />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const routedCreation = snippetBetween(source, '<h2>{"Creation decision point"}</h2>', "      admission:");

    expect(html).toContain("Pre-submit readiness");
    expect(html).toContain("Inline recovery");
    expect(html).toContain("Truth layer is steward-supplied judgment");
    expect(html).toContain("Consequence mode is steward judgment; the app does not infer, default, or silently reuse it.");
    expect(html).toContain("Prompt mode");
    expect(html).toContain("Selected mode:");
    expect(html).toContain("Loaded mode:");
    expect(routedCreation).toContain("value={consequenceMode}");
    expect(routedCreation).toContain("value={creationPromptMode}");
    expect(routedCreation).toContain("setCreationPromptMode");
    expect(routedCreation).toContain("selectedCreationPromptMode?.stepRequest");
    expect(source).toContain("payload.step.mode");
    expect(routedCreation).toContain("value={seedTruthLayer}");
    expect(routedCreation).toContain("decompositionError");
    expect(routedCreation).toContain("decompositionReadiness");
    expect(routedCreation).toContain("section.prompt");
  });
});
