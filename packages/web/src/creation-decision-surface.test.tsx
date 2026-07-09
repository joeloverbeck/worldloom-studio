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

const indexAfter = (html: string, startMarker: string, needle: string) => {
  const start = html.indexOf(startMarker);
  expect(start).toBeGreaterThanOrEqual(0);
  const index = html.indexOf(needle, start);
  expect(index).toBeGreaterThan(start);
  return index;
};

const normalizeRenderedText = (html: string) => html.replace(/<!-- -->/g, "");

const workflowMap = {
  readOnly: true,
  world: { path: "/tmp/creation.sqlite" },
  stages: [
    { key: "creation", label: "Creation", state: "active", summary: "Start with the world kernel.", destinationKey: "creation" },
    { key: "admission", label: "Admission", state: "not_yet_earned", summary: "Admission waits for proposed seeds.", unlockReason: "Park proposed seeds.", destinationKey: "admission" },
    { key: "minimal-viable-world", label: "Minimal Viable World", state: "not_yet_earned", summary: "Checkpoint waits for admitted seed evidence.", unlockReason: "Admitted seed evidence unlocks the checkpoint.", destinationKey: "creation" }
  ],
  queues: [
    { key: "admission", label: "Admission queue", count: 0, destinationKey: "admission", href: "/api/admission/queue", summary: "No proposed seeds exist yet." },
    { key: "minimal-viable-world", label: "Minimal Viable World checkpoint", count: 0, destinationKey: "creation", href: "/api/flows/creation/minimal-viable-world", summary: "Admitted seed evidence must exist before the checkpoint is earned." }
  ],
  nextDecision: { destinationKey: "creation", label: "Start Creation", reason: "No world kernel exists yet.", href: "/api/flows/creation/start" },
  destinations: [
    { key: "creation", label: "Creation", kind: "guided-flow", summary: "Create the world kernel.", state: "active" },
    { key: "admission", label: "Admission", kind: "guided-flow", summary: "Govern proposed facts.", state: "not_yet_earned" },
    { key: "substrate", label: "Substrate", kind: "substrate", summary: "Generic record, link, search, draft, and Prompt-out admin tools.", state: "available" }
  ]
};

const notCurrentMinimalViableWorld = {
  checkpoint: {
    owed: false,
    report: null,
    route: "/api/flows/creation/minimal-viable-world",
    blockers: [{
      key: "no_admitted_seed_facts",
      label: "Admitted seed facts",
      message: "The Minimal Viable World checkpoint waits for admitted seed evidence; parked proposed seeds alone do not count.",
      requires: "admitted seed facts"
    }],
    coverageSignals: {
      admittedSeeds: [],
      wholeWorld: [{ key: "admitted_seed_count", label: "admitted seed evidence", status: "absent", evidence: [], reason: "No admitted seed evidence exists yet." }]
    },
    dispositions: [],
    closeReadiness: { status: "blocked", blockers: [] },
    unresolvedDeferrals: [],
    openCanonDebt: [],
    admissionProposals: [],
    advisoryArtifacts: []
  },
  decisionPoint: {
    sharedContract: {
      flow: { key: "creation", runState: "checkpoint_blocked" },
      step: { key: "minimal_viable_world:coverage_review", localDecision: "Wait for admitted seed evidence before working the Minimal Viable World checkpoint.", packageSource: "docs/worldbuilding-system/05_creation_protocol.md", why: "Phases 4-8 are future work until seed evidence is admitted." },
      obligations: { required: [], optional: [], skippable: [], severityDependent: [] },
      bearingContext: { displayed: ["No admitted seed evidence exists yet."], sourceManifest: [], omissions: ["Full checkpoint detail is not current before admitted seed evidence."] },
      promptOut: { serverOwned: true, modes: [{ mode: "proposal", label: "Proposal mode", availability: "blocked", blocker: "Proposal prompts need admitted seed context before copy-out.", framing: "future checkpoint proposals", stepRequest: null }] },
      blockers: [{
        key: "no_admitted_seed_facts",
        label: "Admitted seed facts",
        message: "The Minimal Viable World checkpoint waits for admitted seed evidence; parked proposed seeds alone do not count.",
        requires: "admitted seed facts"
      }],
      writeIntent: { willWrite: [], willLink: [], willQueue: [], willRouteOnward: [], willLeaveUntouched: ["not-current checkpoint presentation writes no records"] },
      nextOrResumeState: { currentStep: "minimal_viable_world:not_current", nextStep: "admit seed evidence before checkpoint work", safeExit: "Return to active Creation work." },
      readSideTrail: []
    }
  }
};

const kernelCompleteNoSeedDecision = {
  flow: { key: "creation", runState: "in_progress" },
  currentStep: "decomposition:seed-facts",
  localDecision: "Split broad steward material into seed facts that can be independently rejected.",
  packageAuthority: {
    primary: "docs/worldbuilding-system/05_creation_protocol.md",
    why: "Phase 2 owns seed decomposition before Admission has work.",
    citations: ["docs/worldbuilding-system/05_creation_protocol.md#phase-2-seed-decomposition"]
  },
  currentKernel: { id: 1, shortId: "KER-1", title: "World kernel", recordTypeKey: "world_kernel" },
  sectionPrompts: [],
  selectedSection: null,
  consequenceMode: { saved: "weird", status: "saved", source: "record facet: consequence_mode", blocker: null },
  work: { required: ["Seed title", "Seed body", "Truth layer", "Granularity confirmation"], optional: ["Admission intent note"], allowedEmpty: [], skippable: ["Prompt-out advisory pressure can be declined with a skip_record"] },
  blockers: [{ key: "proposed_seeds", label: "Proposed seeds", message: "Seed decomposition must park proposed seeds before Admission has work.", requires: "parked proposed seeds" }],
  decompositionReadiness: [{ key: "seed_body", label: "Seed body", status: "blocked", message: "Seed parking is blocked until the steward enters seed body material.", remediation: "Enter the seed body." }],
  promptOut: {
    available: false,
    blocker: "Decomposition Prompt-out waits for seed material.",
    templateKey: "decomposition_pressure",
    stepKey: "creation:decomposition_prompt",
    role: "Prerequisite auditor",
    stepRequest: null,
    preview: { currentDecision: "Split broad steward material into seed facts that can be independently rejected.", promptText: "", contextPreview: "", sourceManifest: [], omissions: [], advisoryCanonWarning: "Pasted responses remain advisory artifacts and are not admitted canon." }
  },
  writeIntent: { willWrite: ["seed_decomposition report", "canon_fact records fixed at proposed"], willLink: ["derived_from links"], willQueue: ["Admission queue"], willRouteOnward: ["Admission flow"], willLeaveUntouched: ["Creation does not admit canon"] },
  nextOrResumeState: { currentStep: "decomposition:seed-facts", nextStep: "park proposed seeds", safeExit: "Safe exit keeps seed decomposition visible from Creation." },
  readSideTrail: [{ label: "Kernel KER-1", href: "/api/canon-workbench/records/1", recordId: 1 }],
  handoffs: [],
  handoff: {
    seedDecompositionReport: null,
    reportSections: [],
    parkedSeeds: [],
    supportingKernel: { id: 1, shortId: "KER-1", title: "World kernel", recordTypeKey: "world_kernel", body: "A saved kernel.", truthLayer: "Objective canon", canonStatus: "proposed" },
    kernelSections: [],
    granularityRationale: null,
    admissionIntent: null,
    admissionQueueRoute: "/api/admission/queue",
    currentStatus: "not parked",
    nextStep: "park proposed seeds",
    sourceLinks: [],
    doctrineAtPointOfUse: ["Phase 2 granularity rule"]
  }
};

const emptyWorldCreationDecision = {
  ...kernelCompleteNoSeedDecision,
  currentStep: "kernel:World premise",
  localDecision: "Define the world's first governing kernel section: World premise.",
  packageAuthority: {
    primary: "docs/worldbuilding-system/05_creation_protocol.md",
    why: "Phase 1 owns the world kernel as a pressure seed, not an encyclopedia.",
    citations: ["docs/worldbuilding-system/05_creation_protocol.md#phase-1-world-kernel"]
  },
  currentKernel: null,
  sectionPrompts: [{
    heading: "World premise",
    prompt: "Name the governing premise in steward-authored wording.",
    obligation: "required",
    savedBody: "",
    hasSavedBody: false,
    emptyState: {
      kind: "no_saved_section_text",
      message: "No saved text exists yet for World premise; the field should start empty for this section."
    },
    saveTarget: { flowId: 1, heading: "World premise" }
  }],
  selectedSection: {
    heading: "World premise",
    prompt: "Name the governing premise in steward-authored wording.",
    obligation: "required",
    savedBody: "",
    hasSavedBody: false,
    emptyState: {
      kind: "no_saved_section_text",
      message: "No saved text exists yet for World premise; the field should start empty for this section."
    },
    saveTarget: { flowId: 1, heading: "World premise" }
  },
  consequenceMode: {
    saved: null,
    status: "missing_saved_facet",
    source: "record facet: consequence_mode",
    blocker: "Save the kernel step with an explicit steward-selected consequence mode before decomposition can treat it as applied."
  },
  blockers: [
    {
      key: "kernel_material",
      label: "Kernel material",
      message: "Creation Prompt-out and seed decomposition wait for steward-authored kernel material.",
      requires: "steward-authored kernel material"
    },
    {
      key: "consequence_mode",
      label: "Consequence mode",
      message: "Seed decomposition cannot proceed until the steward saves an explicit consequence mode.",
      requires: "saved explicit consequence mode"
    }
  ],
  promptOut: {
    available: false,
    blocker: "Creation Prompt-out requires a current kernel record; Proposal needs a non-premise target, and Pressure requires steward-authored kernel material.",
    templateKey: "kernel_pressure",
    stepKey: "creation:kernel_prompt",
    role: "Consequence scout",
    modes: [
      {
        mode: "proposal",
        label: "Proposal mode",
        availability: "blocked",
        blocker: "Proposal prompts are refused for the world's essence; the AI-assisted workflow reserves the World premise to the steward.",
        framing: "Request labeled candidates with alternatives and assumptions; adoption remains steward authorship.",
        role: "Decision proposal",
        templateKey: "kernel_pressure",
        stepKey: "creation:kernel_prompt",
        outputLabels: [],
        stepRequest: null
      },
      {
        mode: "pressure",
        label: "Pressure mode",
        availability: "blocked",
        blocker: "Pressure prompts require steward-authored material for World premise.",
        framing: "Ask for challenge, risks, alternatives, and questions on steward-authored material.",
        role: "Consequence scout",
        templateKey: "kernel_pressure",
        stepKey: "creation:kernel_prompt",
        outputLabels: [],
        stepRequest: null
      }
    ],
    stepRequest: null,
    preview: {
      currentDecision: "Define the world's first governing kernel section: World premise.",
      promptText: "Role framing (Consequence scout): ask for pressure, not answers.",
      contextPreview: "Selected kernel section: World premise\nSelected section material: (empty)\nNo kernel record yet.",
      sourceManifest: ["Selected kernel section: World premise", "Package source: docs/worldbuilding-system/05_creation_protocol.md"],
      omissions: ["Current kernel material is absent until the steward writes it."],
      advisoryCanonWarning: "Prompt-out is optional advisory pressure. Pasted responses remain advisory artifacts and are not admitted canon."
    }
  },
  writeIntent: {
    willWrite: ["one living world_kernel record", "seed_decomposition report", "canon_fact records fixed at proposed"],
    willLink: ["read-side trail placeholders until records exist", "derived_from links from parked seeds to the kernel and decomposition report"],
    willQueue: ["parked seeds appear in the Admission queue"],
    willRouteOnward: ["Seed decomposition after explicit consequence mode", "Seed decomposition once seed material, truth layer, consequence mode, and granularity confirmation are present", "Admission flow"],
    willLeaveUntouched: ["canon standing is not admitted inside Creation", "truth layer remains steward-supplied judgment", "pasted advisory text does not alter kernel, seed, report, or proposal fields without explicit steward use"]
  },
  nextOrResumeState: {
    currentStep: "kernel:World premise",
    nextStep: "continue kernel authoring",
    safeExit: "Safe exit leaves the Creation flow in progress and resumable from the same world file."
  },
  readSideTrail: [],
  handoff: {
    ...kernelCompleteNoSeedDecision.handoff,
    supportingKernel: null,
    sourceLinks: []
  }
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
    expect(source).toContain("creationPromptStepRequest");
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

  it("foregrounds empty-world Creation work before compact not-current Minimal Viable World status", () => {
    const html = renderToString(<App
      initialOpenWorld="/tmp/creation.sqlite"
      initialWorkflowMap={workflowMap as any}
      initialDestination="creation"
      initialCreationDecision={emptyWorldCreationDecision as any}
      initialMinimalViableWorld={notCurrentMinimalViableWorld as any}
    />);

    const normalizedHtml = normalizeRenderedText(html);
    const kernelIndex = indexAfter(normalizedHtml, "Creation decision point", "Kernel authoring");
    const decompositionIndex = indexAfter(normalizedHtml, "Creation decision point", "Seed decomposition decision");
    const nextIndex = indexAfter(normalizedHtml, "Creation decision point", "Next: continue kernel authoring");
    const checkpointIndex = indexAfter(normalizedHtml, "Creation decision point", "Minimal Viable World checkpoint is not current");
    expect(kernelIndex).toBeLessThan(checkpointIndex);
    expect(decompositionIndex).toBeLessThan(checkpointIndex);
    expect(nextIndex).toBeLessThan(checkpointIndex);
    expect(html).toContain("admitted seed evidence unlocks this checkpoint");
    expect(html).toContain("Unavailable future work, not completed work.");
    const compactPanel = normalizedHtml.slice(checkpointIndex);
    expect(compactPanel).not.toContain("Minimal Viable World decision contract");
    expect(compactPanel).not.toContain("Record Checkpoint Disposition");
    expect(compactPanel).not.toContain("Route Checkpoint Proposal");
    expect(compactPanel).not.toContain("Load Checkpoint Prompt-out Step");
  });

  it("foregrounds kernel-complete seed decomposition before compact not-current Minimal Viable World status", () => {
    const html = renderToString(<App
      initialOpenWorld="/tmp/creation.sqlite"
      initialWorkflowMap={workflowMap as any}
      initialDestination="creation"
      initialCreationDecision={kernelCompleteNoSeedDecision as any}
      initialMinimalViableWorld={notCurrentMinimalViableWorld as any}
    />);

    const normalizedHtml = normalizeRenderedText(html);
    const seedDecisionIndex = indexAfter(normalizedHtml, "Creation decision point", "Seed decomposition decision");
    const readinessIndex = indexAfter(normalizedHtml, "Creation decision point", "Pre-submit readiness");
    const nextIndex = indexAfter(normalizedHtml, "Creation decision point", "Next: park proposed seeds");
    const resumeIndex = indexAfter(normalizedHtml, "Creation decision point", "Safe exit/resume");
    const checkpointIndex = indexAfter(normalizedHtml, "Creation decision point", "Minimal Viable World checkpoint is not current");
    expect(seedDecisionIndex).toBeLessThan(checkpointIndex);
    expect(readinessIndex).toBeLessThan(checkpointIndex);
    expect(nextIndex).toBeLessThan(checkpointIndex);
    expect(resumeIndex).toBeLessThan(checkpointIndex);
    expect(html).toContain("Seed decomposition must park proposed seeds before Admission has work.");
    expect(html).toContain("parked proposed seeds alone do not count");
    const compactPanel = normalizedHtml.slice(checkpointIndex);
    expect(compactPanel).not.toContain("Protected record id");
    expect(compactPanel).not.toContain("Proposal seed");
    expect(compactPanel).not.toContain("Debt name");
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
        parkedSeeds: [
          {
            id: 4,
            shortId: "FAC-1",
            title: "Echo court testimony",
            recordTypeKey: "canon_fact",
            body: "Courts accept echo testimony under conditions.",
            truthLayer: "Objective canon",
            canonStatus: "proposed",
            correction: {
              availability: "correctable",
              directMutationBlocked: false,
              originalSeedWording: "Courts accept echo testimony under conditions.",
              correctionContext: "Creation can repair this proposed seed before Admission work begins.",
              actions: [
                { key: "split", label: "Split into sibling proposed facts", available: true, blocker: null, preview: "Write sibling proposed facts." },
                { key: "retract_and_rewrite", label: "Retract and rewrite", available: true, blocker: null, preview: "Preserve the original wording and write replacement wording." },
                { key: "replace", label: "Replace with corrected proposed fact", available: true, blocker: null, preview: "Route a corrected proposed fact." },
                { key: "admission_narrowing_note", label: "Carry Admission narrowing note", available: true, blocker: null, preview: "Carry caution into Admission without admitting canon." }
              ],
              writeIntent: {
                willWrite: ["correction context report", "corrected canon_fact records at proposed"],
                willLink: ["original parked seed", "seed-decomposition report", "world kernel", "correction context"],
                willQueue: ["corrected proposed facts remain visible in the Admission queue"],
                willLeaveUntouched: ["Creation does not admit canon or assign Admission severity"]
              },
              nextOrResumeState: {
                currentStep: "decomposition:complete",
                nextStep: "repair parked seed before Admission",
                safeExit: "Safe exit keeps the Creation handoff visible."
              }
            },
            sourceLinks: [
              { label: "Kernel KER-1: World kernel", href: "/api/canon-workbench/records/1", recordId: 1, shortId: "KER-1", title: "World kernel", recordTypeKey: "world_kernel", linkTypeKey: "derived_from", note: "Seed decomposed from world kernel" },
              { label: "Seed decomposition report SEE-1: Seed decomposition", href: "/api/canon-workbench/records/3", recordId: 3, shortId: "SEE-1", title: "Seed decomposition", recordTypeKey: "seed_decomposition", linkTypeKey: "derived_from", note: "Seed recorded by decomposition report" }
            ]
          },
          {
            id: 5,
            shortId: "FAC-2",
            title: "Late echo testimony",
            recordTypeKey: "canon_fact",
            body: "Admission has already started reviewing this seed.",
            truthLayer: "Objective canon",
            canonStatus: "under review",
            correction: {
              availability: "late_admission",
              directMutationBlocked: true,
              originalSeedWording: "Admission has already started reviewing this seed.",
              correctionContext: "Admission work has begun; Creation cannot directly mutate the in-flight proposed fact.",
              actions: [
                { key: "superseding", label: "Superseding proposal", available: true, blocker: null, preview: "Route a superseding proposed fact without changing the in-flight Admission record." },
                { key: "re_proposal", label: "Re-proposal", available: true, blocker: null, preview: "Create a new proposed fact for later Admission handling." },
                { key: "admission_facing_note", label: "Admission-facing note", available: true, blocker: null, preview: "Carry caution into Admission without changing canon standing." }
              ],
              writeIntent: {
                willWrite: ["late-correction context only if the steward chooses an Admission-facing route"],
                willLink: ["in-flight Admission seed remains the governed target"],
                willQueue: ["new proposals must be routed separately"],
                willLeaveUntouched: ["Creation does not mutate an in-flight Admission record"]
              },
              nextOrResumeState: {
                currentStep: "decomposition:complete",
                nextStep: "continue in Admission or route a superseding proposal",
                safeExit: "Return to Admission; the Creation handoff keeps the late-correction reason visible."
              }
            },
            sourceLinks: [
              { label: "Seed decomposition report SEE-1: Seed decomposition", href: "/api/canon-workbench/records/3", recordId: 3, shortId: "SEE-1", title: "Seed decomposition", recordTypeKey: "seed_decomposition", linkTypeKey: "derived_from", note: "Seed recorded by decomposition report" }
            ]
          }
        ],
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
        { id: 4, shortId: "FAC-1", title: "Echo court testimony", recordTypeKey: "canon_fact", body: "Courts accept echo testimony under conditions.", truthLayer: "Objective canon", canonStatus: "proposed", updatedAt: "now" },
        { id: 5, shortId: "FAC-2", title: "Late echo testimony", recordTypeKey: "canon_fact", body: "Admission has already started reviewing this seed.", truthLayer: "Objective canon", canonStatus: "under review", updatedAt: "now" }
      ]}
      initialCreationDecision={handoffDecision as any}
    />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(html).toContain("Creation-to-Admission handoff");
    expect(html).toContain("FAC-1 · Echo court testimony");
    expect(html).toContain("Courts accept echo testimony under conditions.");
    expect(html).toContain("Current canon status: proposed");
    expect(html).toContain("Post-park correction");
    expect(html).toContain("Original seed wording");
    expect(html).toContain("Split into sibling proposed facts");
    expect(html).toContain("Retract and rewrite");
    expect(html).toContain("Replace with corrected proposed fact");
    expect(html).toContain("Carry Admission narrowing note");
    expect(html).toContain("Correction rationale");
    expect(html).toContain("Replacement title");
    expect(html).toContain("Sibling title");
    expect(html).toContain("Narrowing note");
    expect(html).toContain("Submit Correction");
    expect(html).toContain("corrected canon_fact records at proposed");
    expect(html).toContain("Creation does not admit canon or assign Admission severity");
    expect(html).toContain("repair parked seed before Admission");
    expect(html).toContain("Admission work has begun; Creation cannot directly mutate the in-flight proposed fact.");
    expect(html).toContain("Superseding proposal");
    expect(html).toContain("Re-proposal");
    expect(html).toContain("Admission-facing note");
    expect(html).toContain("Creation does not mutate an in-flight Admission record");
    expect(html).toContain("continue in Admission or route a superseding proposal");
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
    expect(source).toContain("/api/flows/creation/corrections");
    expect(source).toContain("setCorrectionError");
    expect(source).toContain("payload.validationErrors");
    expect(source).toContain("setAdmissionQueue(payload.admissionQueue");
  });

  it("renders Creation seed-family coverage controls and unresolved Admission-secondary guidance", () => {
    const coverageDecision = {
      ...kernelCompleteNoSeedDecision,
      currentStep: "decomposition:coverage",
      localDecision: "Account for kernel seed families before Admission handoff.",
      blockers: [
        { key: "coverage:2", label: "Unresolved coverage", message: "Anti-aging chemistry still needs disposition before Admission handoff.", requires: "covered, deferred, or out of scope with rationale" }
      ],
      writeIntent: {
        willWrite: ["coverage row dispositions", "canon_debt records for deferred seed families"],
        willLink: ["coverage rows to parked proposed seeds"],
        willQueue: ["Admission queue remains visible but secondary"],
        willRouteOnward: ["Admission after coverage is resolved"],
        willLeaveUntouched: ["Creation does not admit canon or assign Admission severity"]
      },
      nextOrResumeState: {
        currentStep: "decomposition:coverage",
        nextStep: "resolve seed-family coverage before Admission handoff",
        safeExit: "Return to the workflow map; coverage rows remain visible from Creation."
      },
      coverageInventory: {
        state: {
          status: "blocked",
          completionBlocked: true,
          blockers: [{ key: "coverage:2", label: "Anti-aging chemistry", message: "Coverage row is unresolved.", requires: "disposition" }]
        },
        createOrConfirmPath: { method: "POST", href: "/api/flows/creation/coverage", body: { kernelRecordId: 1 } },
        rows: [
          {
            id: 1,
            label: "Temporal access",
            sourceKernelContext: "Temporal-access seed family.",
            required: true,
            disposition: "covered",
            linkedSeeds: [{ id: 4, shortId: "FAC-1", title: "Temporal access tool", canonStatus: "proposed" }],
            dispositionRationale: null,
            debtRecord: null,
            outOfScopeRationale: null,
            actions: {
              link: { method: "POST", href: "/api/flows/creation/coverage/link" },
              defer: { method: "POST", href: "/api/flows/creation/coverage/defer" },
              outOfScope: { method: "POST", href: "/api/flows/creation/coverage/out-of-scope" }
            }
          },
          {
            id: 2,
            label: "Anti-aging chemistry",
            sourceKernelContext: "Chemistry and subjective-age material remains implicit.",
            required: true,
            disposition: "unresolved",
            linkedSeeds: [],
            dispositionRationale: null,
            debtRecord: null,
            outOfScopeRationale: null,
            actions: {
              link: { method: "POST", href: "/api/flows/creation/coverage/link" },
              defer: { method: "POST", href: "/api/flows/creation/coverage/defer" },
              outOfScope: { method: "POST", href: "/api/flows/creation/coverage/out-of-scope" }
            }
          }
        ]
      }
    };
    const workflowMapWithSecondaryAdmission = {
      ...workflowMap,
      queues: [{ key: "admission", label: "Admission queue", count: 1, destinationKey: "admission", href: "/api/admission/queue", summary: "Proposed seeds are visible, but unresolved Creation seed-family coverage is primary." }],
      nextDecision: { destinationKey: "creation", label: "Resolve seed-family coverage", reason: "Anti-aging chemistry still needs disposition.", href: "/api/flows/creation/start" }
    };

    const html = renderToString(<App
      initialOpenWorld="/tmp/creation.sqlite"
      initialWorkflowMap={workflowMapWithSecondaryAdmission as any}
      initialDestination="creation"
      initialCreationDecision={coverageDecision as any}
    />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(html).toContain("Seed-family coverage");
    expect(html).toContain("Account for kernel seed families before Admission handoff.");
    expect(html).toContain("Anti-aging chemistry still needs disposition before Admission handoff.");
    expect(html).toContain("Temporal access");
    expect(html).toContain("Disposition: covered");
    expect(html).toContain("Linked proposed seed FAC-1");
    expect(html).toContain("Anti-aging chemistry");
    expect(html).toContain("Disposition: unresolved");
    expect(html).toContain("Link parked proposed seeds");
    expect(html).toContain("Defer as seed debt");
    expect(html).toContain("Mark out of scope");
    expect(html).toContain("Disposition rationale");
    expect(html).toContain("Admission queue remains visible but secondary");
    expect(html).toContain("Creation does not admit canon or assign Admission severity");
    expect(html).toContain("Return to the workflow map; coverage rows remain visible from Creation.");
    expect(source).toContain("/api/flows/creation/coverage/link");
    expect(source).toContain("/api/flows/creation/coverage/defer");
    expect(source).toContain("/api/flows/creation/coverage/out-of-scope");
    expect(source).toContain("coverageInventory");
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
    expect(html).toContain("Creation must start or resume before kernel fields can be saved.");
    expect(html).toContain("Consequence mode draft/saved state");
    expect(html).toContain("No saved consequence mode yet.");
    expect(html).toContain("Selected section state");
    expect(html).toContain("No saved text exists yet");
    expect(html).toContain("Prompt mode");
    expect(html).toContain("Selected mode:");
    expect(html).toContain("Loaded mode:");
    expect(routedCreation).toContain("value={consequenceMode}");
    expect(routedCreation).toContain("creationAuthoringDisabled");
    expect(routedCreation).toContain("consequenceModeDraftState");
    expect(routedCreation).toContain("selectedSectionContract");
    expect(source).toContain("kernelSectionDrafts");
    expect(routedCreation).toContain("handleKernelHeadingChange");
    expect(routedCreation).toContain("held under its own heading key");
    expect(routedCreation).toContain("disabled={creationAuthoringDisabled}");
    expect(routedCreation).toContain("value={creationPromptMode}");
    expect(routedCreation).toContain("setCreationPromptMode");
    expect(source).toContain("selectedCreationPromptMode?.stepRequest");
    expect(routedCreation).toContain("creationPromptModeStatus");
    expect(routedCreation).toContain("creationPromptModesForDisplay");
    expect(routedCreation).toContain("creationPromptPreviewForDisplay");
    expect(source).toContain("Pressure Prompt-out waits for the selected section to be saved");
    expect(source).toContain("!creationPromptOutBlockedByLocalSection");
    expect(source).toContain("payload.step.mode");
    expect(source).toContain("setKernelSectionDrafts({})");
    expect(source).toContain("autoStartCreationFlow");
    expect(routedCreation).toContain("value={seedTruthLayer}");
    expect(routedCreation).toContain("decompositionError");
    expect(routedCreation).toContain("decompositionReadiness");
    expect(routedCreation).toContain("section.prompt");
  });

  it("allows local Proposal and saved-section Pressure targeting while keeping guarded cases blocked", () => {
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const promptSelection = snippetBetween(source, "const selectedCreationPromptMode =", "const loadedCreationPromptMode");
    const currentOrigin = snippetBetween(source, "const currentLoadedPromptOrigin = useMemo", "const loadedPromptStatusView");
    const creationPromptLoader = snippetBetween(source, "const loadCreationPromptStep = async () =>", "const ensurePromptStep = async");
    const routedCreation = snippetBetween(source, '<h2>{"Creation decision point"}</h2>', "      admission:");

    expect(promptSelection).toContain("creationPromptMode === \"proposal\"");
    expect(promptSelection).toContain("kernelHeading !== \"World premise\"");
    expect(promptSelection).toContain("creationLocalProposalRequest");
    expect(promptSelection).toContain("creationPromptBaseRequest");
    expect(promptSelection).toContain("creationSelectedSectionHasSavedMaterial");
    expect(promptSelection).toContain("creationLocalPressureRequest");
    expect(promptSelection).toContain("creationLocalPromptRequest");
    expect(promptSelection).toContain("selectedSectionHeading: kernelHeading");
    expect(promptSelection).toContain("&& !creationLocalPromptRequest");
    expect(promptSelection).toContain("creationPromptModesForDisplay");
    expect(promptSelection).toContain("creationPromptCurrentDecision");
    expect(source).toContain("creationPromptPreviewForDisplay");
    expect(promptSelection).toContain("available for selected");
    expect(promptSelection).toContain("Proposal prompts are refused for the world's essence");
    expect(currentOrigin).toContain("creationPromptStepRequest?.body");
    expect(currentOrigin).toContain("selectedSectionHeading: typeof request.selectedSectionHeading === \"string\"");
    expect(currentOrigin).toContain("decisionLabel: creationPromptCurrentDecision");
    expect(creationPromptLoader).toContain("const request = creationPromptStepRequest");
    expect(creationPromptLoader).toContain("request.body.selectedSectionHeading");
    expect(creationPromptLoader).toContain("decisionLabel: creationPromptCurrentDecision");
    expect(routedCreation).toContain("Load Creation Prompt-out Step");
    expect(routedCreation).toContain("creationPromptModeStatus");
  });
});
