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

const workflowMap = {
  readOnly: true,
  world: { path: "/tmp/prompt-identity.sqlite" },
  stages: [
    { key: "creation", label: "Creation", state: "active", summary: "Start with the world kernel.", destinationKey: "creation" }
  ],
  queues: [],
  nextDecision: {
    destinationKey: "creation",
    label: "Start Creation",
    reason: "No world kernel exists yet.",
    href: "/api/flows/creation/start"
  },
  destinations: [
    { key: "creation", label: "Creation", kind: "guided-flow", summary: "Create the world kernel.", state: "active" },
    { key: "admission", label: "Admission", kind: "guided-flow", summary: "Govern proposed facts.", state: "not_yet_earned" },
    { key: "substrate", label: "Substrate", kind: "substrate", summary: "Generic record, link, search, draft, and Prompt-out admin tools.", state: "available" }
  ]
};

const sectionContract = (heading: string) => ({
  heading,
  prompt: `${heading} prompt.`,
  obligation: "required",
  savedBody: `${heading} saved body.`,
  hasSavedBody: true,
  emptyState: { kind: "saved_section_text", message: `Saved text is available for ${heading}.` },
  saveTarget: { flowId: 1, heading }
});

const creationDecision = (options: {
  currentStep?: string;
  selectedHeading?: string;
  promptStepKey?: string;
  templateKey?: string;
  recordId?: number;
  decisionLabel?: string;
} = {}) => {
  const currentStep = options.currentStep ?? "kernel:World premise";
  const selectedHeading = options.selectedHeading ?? "World premise";
  const promptStepKey = options.promptStepKey ?? "creation:kernel_prompt";
  const templateKey = options.templateKey ?? "kernel_pressure";
  const recordId = options.recordId ?? 1;
  const decisionLabel = options.decisionLabel ?? selectedHeading;
  const sections = [sectionContract("World premise"), sectionContract("Core promise")];
  const selectedSection = sections.find((section) => section.heading === selectedHeading) ?? sections[0];

  return {
    flow: { key: "creation", runState: "in_progress" },
    currentStep,
    localDecision: decisionLabel,
    packageAuthority: {
      primary: "docs/worldbuilding-system/05_creation_protocol.md",
      why: "Creation owns the active packet decision grain.",
      citations: ["docs/worldbuilding-system/20_ai_assisted_workflow.md"]
    },
    currentKernel: { id: 1, shortId: "KER-1", title: "World kernel", recordTypeKey: "world_kernel" },
    sectionPrompts: sections,
    selectedSection,
    consequenceMode: { saved: "weird", status: "saved", source: "record facet: consequence_mode", blocker: null },
    work: { required: [], optional: [], allowedEmpty: [], skippable: [] },
    blockers: [],
    decompositionReadiness: [],
    promptOut: {
      available: true,
      blocker: null,
      templateKey,
      stepKey: promptStepKey,
      role: "Consequence scout",
      stepRequest: {
        method: "POST",
        href: "/api/prompt-out/steps",
        body: {
          flowKey: "creation",
          flowId: 1,
          recordId,
          templateKey,
          stepKey: promptStepKey,
          mode: "proposal",
          label: "Proposal mode"
        }
      },
      modes: [
        {
          mode: "proposal",
          label: "Proposal mode",
          available: true,
          blocker: null,
          framing: "Request labeled candidates with alternatives and assumptions.",
          outputLabels: ["selected", "adopted with steward revision", "rejected"],
          stepRequest: {
            method: "POST",
            href: "/api/prompt-out/steps",
            body: { flowKey: "creation", flowId: 1, recordId, templateKey, stepKey: promptStepKey, mode: "proposal", label: "Proposal mode" }
          }
        },
        {
          mode: "pressure",
          label: "Pressure mode",
          available: true,
          blocker: null,
          framing: "Request challenge, risks, alternatives, and questions.",
          outputLabels: ["challenged", "standing ruling"],
          stepRequest: {
            method: "POST",
            href: "/api/prompt-out/steps",
            body: { flowKey: "creation", flowId: 1, recordId, templateKey, stepKey: promptStepKey, mode: "pressure", label: "Pressure mode" }
          }
        }
      ],
      preview: {
        currentDecision: decisionLabel,
        promptText: "Creation packet preview with source manifest.",
        contextPreview: "World kernel section context.",
        sourceManifest: ["Source record: KER-1 World kernel", `Selected section: ${selectedHeading}`],
        omissions: ["Admission gate results do not exist inside Creation."],
        advisoryCanonWarning: "Pasted responses remain advisory artifacts and are not admitted canon."
      }
    },
    writeIntent: { willWrite: [], willLink: [], willQueue: [], willRouteOnward: [], willLeaveUntouched: [] },
    nextOrResumeState: { currentStep, nextStep: "continue", safeExit: "Safe exit." },
    readSideTrail: [],
    handoffs: [],
    handoff: {
      seedDecompositionReport: null,
      reportSections: [],
      parkedSeeds: [],
      supportingKernel: null,
      kernelSections: [],
      granularityRationale: null,
      admissionIntent: null,
      admissionQueueRoute: "/api/admission/queue",
      currentStatus: "proposed",
      nextStep: "continue",
      sourceLinks: [],
      doctrineAtPointOfUse: []
    }
  };
};

const admissionDecision = (options: {
  recordId?: number;
  shortId?: string;
  title?: string;
  stepKey?: string;
  templateKey?: string;
  mode?: "proposal" | "pressure";
  admissionLevel?: string | null;
  workScale?: string | null;
  decisionLabel?: string;
} = {}) => {
  const recordId = options.recordId ?? 7;
  const shortId = options.shortId ?? "FAC-7";
  const title = options.title ?? "Toll bell law";
  const stepKey = options.stepKey ?? "admission:queue-severity";
  const templateKey = options.templateKey ?? "admission_queue_severity";
  const mode = options.mode ?? "proposal";
  const admissionLevel = options.admissionLevel ?? null;
  const workScale = options.workScale ?? null;
  const decisionLabel = options.decisionLabel ?? "Choose and classify the proposed fact before Admission changes canon standing.";

  return {
    flow: { key: "admission", runState: "not_started" },
    currentStep: `record:${recordId}:queue-selection`,
    nextOrResumeState: { currentStep: `record:${recordId}:queue-selection`, nextStep: "Severity declaration", safeExit: "Resume from the selected Admission record." },
    localDecision: decisionLabel,
    packageAuthority: {
      primary: "docs/worldbuilding-system/06_canon_fact_admission_protocol.md",
      why: "Admission owns canon-standing decisions.",
      citations: ["docs/worldbuilding-system/20_ai_assisted_workflow.md"]
    },
    selectedRecord: {
      id: recordId,
      shortId,
      recordTypeKey: "canon_fact",
      title,
      body: "The toll bell binds bridge crossings.",
      truthLayer: "Objective canon",
      canonStatus: admissionLevel ? "under review" : "proposed",
      createdAt: "2026-07-04T00:00:00.000Z",
      updatedAt: "2026-07-04T00:00:00.000Z",
      admissionLevel,
      workScale,
      constraintTags: [],
      sourceLinks: []
    },
    severity: {
      admissionLevel,
      workScale,
      gatePath: admissionLevel === "4" ? "full_gate" : null,
      definitions: [],
      obligations: []
    },
    work: { required: [], optional: ["Prompt-out advisory pressure after steward-authored material exists"], skippable: [], severityDependent: [] },
    doctrineCitations: ["docs/worldbuilding-system/06_canon_fact_admission_protocol.md", "docs/worldbuilding-system/20_ai_assisted_workflow.md"],
    blockers: [],
    skipRule: { offered: true, reasonRequired: false, reasonThreshold: "major-or-higher Admission work", belowThresholdNote: "Reason not collected below major-fact threshold.", recordType: "skip_record" },
    seedAudit: { offered: true, doctrine: [], runWrites: "Running seed audit writes a gate_result.", declineWrites: "Declining seed audit writes a governed skip_record.", nonMutation: "Seed audit does not mutate canon standing." },
    promptOut: {
      advisory: "optional",
      templateKey,
      stepKey,
      role: "Severity classification readiness",
      modes: [
        { mode: "proposal", label: "Proposal mode", available: true, availability: "available", blocker: null, framing: "Ask for risks and candidate questions.", outputLabels: ["risk"], stepRequest: { method: "POST", href: "/api/prompt-out/steps", body: { flowKey: "admission", templateKey, recordId, stepKey, mode, admissionLevel, workScale } } },
        { mode: "pressure", label: "Pressure mode", available: true, availability: "available", blocker: null, framing: "Challenge steward-authored classification material.", outputLabels: ["risk"], stepRequest: { method: "POST", href: "/api/prompt-out/steps", body: { flowKey: "admission", templateKey, recordId, stepKey, mode: "pressure", admissionLevel, workScale } } }
      ],
      stepRequest: {
        method: "POST",
        href: "/api/prompt-out/steps",
        body: { flowKey: "admission", templateKey, recordId, stepKey, mode, label: "Admission prompt", admissionLevel, workScale }
      },
      preview: {
        currentDecision: decisionLabel,
        promptText: "Admission packet preview with source manifest.",
        sourceManifest: [`Record ${shortId}: ${title}`, `Prompt template: ${templateKey}`],
        contextPreview: `${shortId} ${title}`,
        omissions: ["Minor ledger completion omitted until severity is declared."],
        advisoryCanonWarning: "Pasted responses remain advisory artifacts and are not admitted canon."
      }
    },
    writeIntent: { willWrite: ["No canon mutation until the steward completes Admission"], willLink: [], willQueue: [], willLeaveUntouched: ["Prompt-out advisory text is not canon"], willRouteOnward: [] },
    closePreview: { beforeCompletion: [], afterCompletion: [] },
    readSideTrail: []
  };
};

const loadedOrigin = (overrides: Record<string, unknown> = {}) => ({
  worldPath: "/tmp/prompt-identity.sqlite",
  flowKey: "creation",
  flowId: 1,
  recordId: 1,
  recordShortId: "KER-1",
  recordTypeKey: "world_kernel",
  selectedSectionHeading: "World premise",
  stepKey: "creation:kernel_prompt",
  mode: "proposal",
  templateKey: "kernel_pressure",
  decisionLabel: "World premise",
  createdAt: "2026-07-07T00:00:00.000Z",
  admissionLevel: null,
  workScale: null,
  packetHash: "packet-hash-one",
  ...overrides
});

describe("Prompt-out lifecycle web surface", () => {
  it("renders server-returned Prompt-out steps and submits returned action URLs", () => {
    const html = renderToString(<App initialOpenWorld="/tmp/prompt-step.sqlite" />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const generatePrompt = snippetBetween(source, "const generatePrompt = async () =>", "const savePromptTemplate = async () =>");
    const storeAdvisory = snippetBetween(source, "const storeAdvisory = async () =>", "const startFlow = async () =>");
    const skipPrompt = snippetBetween(source, "const skipPrompt = async () =>", "const decompose = async () =>");

    expect(html).toContain("Load Prompt Step");
    expect(html).toContain("Server-owned step");
    expect(source).toContain("/api/prompt-out/steps");
    expect(generatePrompt).toContain("promptStep.actions.generate.href");
    expect(storeAdvisory).toContain("promptStep.actions.storeAdvisory.href");
    expect(storeAdvisory).toContain("promptStep.actions.disposition.href");
    expect(skipPrompt).toContain("promptStep.actions.skip.href");
    expect(storeAdvisory).not.toContain("/api/institutional/advisory-artifacts");
    expect(generatePrompt).not.toContain('"/api/prompt-out/generate"');
    expect(storeAdvisory).not.toContain('"/api/prompt-out/advisory-artifacts"');
    expect(skipPrompt).not.toContain('"/api/prompt-out/skip"');
    expect(generatePrompt).not.toContain("flowKey:");
    expect(storeAdvisory).not.toContain("flowKey:");
    expect(skipPrompt).not.toContain("flowKey:");
  });

  it("renders server-returned prompt modes, essence blockers, and disposition labels without local availability policy", () => {
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const creationPromptPanel = snippetBetween(source, "<p>{displayedCreationDecision.promptOut.role}", "<button onClick={loadCreationPromptStep}");
    const creationPromptButton = snippetBetween(source, "<button onClick={loadCreationPromptStep}", "</button>");
    const promptLoader = snippetBetween(source, "const loadCreationPromptStep = async () =>", "const ensurePromptStep = async");
    const html = renderToString(<App
      initialOpenWorld="/tmp/prompt-modes.sqlite"
      initialCreationDecision={{
        flow: { key: "creation", runState: "in_progress" },
        currentStep: "kernel:Starting scale",
        localDecision: "Name where the world starts.",
        packageAuthority: {
          primary: "docs/worldbuilding-system/05_creation_protocol.md",
          why: "Phase 1 owns the world kernel.",
          citations: ["docs/worldbuilding-system/20_ai_assisted_workflow.md"]
        },
        currentKernel: { id: 1, shortId: "KER-1", title: "World kernel" },
        sectionPrompts: [
          {
            heading: "World premise",
            prompt: "What is the world, in one or two sentences?",
            obligation: "required",
            savedBody: "A harbor district where broadcast control allocates power.",
            hasSavedBody: true,
            emptyState: { kind: "saved_section_text", message: "Saved text is available for World premise." },
            saveTarget: { flowId: 1, heading: "World premise" }
          }
        ],
        selectedSection: {
          heading: "World premise",
          prompt: "What is the world, in one or two sentences?",
          obligation: "required",
          savedBody: "A harbor district where broadcast control allocates power.",
          hasSavedBody: true,
          emptyState: { kind: "saved_section_text", message: "Saved text is available for World premise." },
          saveTarget: { flowId: 1, heading: "World premise" }
        },
        consequenceMode: { saved: "weird", status: "saved", source: "record facet: consequence_mode", blocker: null },
        work: { required: [], optional: [], allowedEmpty: [], skippable: [] },
        blockers: [],
        promptOut: {
          available: true,
          blocker: null,
          templateKey: "kernel_pressure",
          stepKey: "creation:kernel_prompt",
          role: "Consequence scout",
          stepRequest: {
            method: "POST",
            href: "/api/prompt-out/steps",
            body: {
              flowKey: "creation",
              flowId: 1,
              recordId: 1,
              templateKey: "kernel_pressure",
              stepKey: "creation:kernel_prompt",
              label: "Pressure mode"
            }
          },
          modes: [
            {
              mode: "proposal",
              label: "Proposal mode",
              available: true,
              blocker: null,
              framing: "Request labeled candidates with alternatives and assumptions.",
              outputLabels: ["selected", "adopted with steward revision", "rejected"],
              stepRequest: {
                method: "POST",
                href: "/api/prompt-out/steps",
                body: {
                  mode: "proposal",
                  flowKey: "creation",
                  flowId: 1,
                  recordId: 1,
                  templateKey: "kernel_pressure",
                  stepKey: "creation:kernel_prompt",
                  label: "Proposal mode"
                }
              }
            },
            {
              mode: "pressure",
              label: "Pressure mode",
              available: false,
              blocker: "Proposal is refused for the world's essence only; pressure waits for steward-authored material.",
              framing: "Ask for challenge, risks, alternatives, and questions.",
              outputLabels: ["challenged", "standing ruling"],
              stepRequest: null
            }
          ],
          preview: {
            currentDecision: "Name where the world starts.",
            promptText: "Proposal mode packet preview",
            contextPreview: "Starting scale: harbor district",
            sourceManifest: ["Source record: KER-1 World kernel"],
            omissions: ["World essence proposal blocker shown only for World premise."],
            advisoryCanonWarning: "Pasted responses remain advisory artifacts and are not admitted canon."
          }
        },
        writeIntent: { willWrite: [], willLink: [], willQueue: [], willRouteOnward: [], willLeaveUntouched: [] },
        nextOrResumeState: { currentStep: "kernel:Starting scale", nextStep: "continue kernel authoring", safeExit: "Safe exit." },
        readSideTrail: [],
        handoffs: [],
        handoff: {
          seedDecompositionReport: null,
          reportSections: [],
          parkedSeeds: [],
          supportingKernel: null,
          kernelSections: [],
          granularityRationale: null,
          admissionIntent: null,
          admissionQueueRoute: "/api/admission/queue",
          currentStatus: "proposed",
          nextStep: "complete seed decomposition",
          sourceLinks: [],
          doctrineAtPointOfUse: []
        }
      } as any}
    />);

    expect(html).toContain("Proposal mode");
    expect(html).toContain("Request labeled candidates with alternatives and assumptions.");
    expect(html).toContain("adopted with steward revision");
    expect(html).toContain("Pressure mode");
    expect(html).toContain("challenge, risks, alternatives, and questions");
    expect(html).toContain("world&#x27;s essence");
    expect(html).toContain("Pasted responses remain advisory artifacts");
    expect(creationPromptPanel).toContain("promptOut.modes");
    expect(html).toContain("Prompt mode");
    expect(html).toContain("Selected mode: Proposal mode - available");
    expect(creationPromptButton).toContain("!canLoadCreationPromptStep");
    expect(source).toContain("value={creationPromptMode}");
    expect(source).toContain("setCreationPromptMode");
    expect(source).toContain("selectedCreationPromptMode?.stepRequest");
    expect(source).toContain("serverCreationPromptRequest = selectedCreationPromptMode?.available");
    expect(source).toContain("creationPromptStepRequest");
    expect(promptLoader).toContain("mode.stepRequest");
    expect(promptLoader).toContain("mode.mode === creationPromptMode");
    expect(promptLoader).toContain("const request = creationPromptStepRequest");
    expect(promptLoader.indexOf("setPromptFlowKey(\"creation\")")).toBeLessThan(promptLoader.indexOf("setPromptStep(payload.step)"));
    expect(promptLoader.indexOf("setPromptRecordId(String(request.body.recordId ?? \"\"))")).toBeLessThan(promptLoader.indexOf("setPromptStep(payload.step)"));
    expect(promptLoader).not.toContain('mode.mode === "proposal"');
    expect(promptLoader).not.toContain("currentStep.includes");
  });

  it("renders a server-provided sandwich packet preview with manifest, omissions, labels, and structural cues", () => {
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const html = renderToString(<App
      initialOpenWorld="/tmp/prompt-preview.sqlite"
      initialCreationDecision={{
        flow: { key: "creation", runState: "in_progress" },
        currentStep: "kernel:Starting scale",
        localDecision: "Name where the world starts.",
        packageAuthority: {
          primary: "docs/worldbuilding-system/05_creation_protocol.md",
          why: "Phase 1 owns the world kernel.",
          citations: ["docs/worldbuilding-system/20_ai_assisted_workflow.md"]
        },
        currentKernel: { id: 1, shortId: "KER-1", title: "World kernel" },
        sectionPrompts: [],
        work: { required: [], optional: [], allowedEmpty: [], skippable: [] },
        blockers: [],
        promptOut: {
          available: true,
          blocker: null,
          templateKey: "kernel_pressure",
          stepKey: "creation:kernel_prompt",
          role: "Consequence scout",
          stepRequest: {
            method: "POST",
            href: "/api/prompt-out/steps",
            body: {
              flowKey: "creation",
              flowId: 1,
              recordId: 1,
              templateKey: "kernel_pressure",
              stepKey: "creation:kernel_prompt",
              label: "Pressure mode"
            }
          },
          modes: [
            {
              mode: "proposal",
              label: "Proposal mode",
              available: true,
              blocker: null,
              framing: "Request labeled candidates with alternatives and assumptions.",
              outputLabels: ["selected", "adopted with steward revision", "rejected"],
              stepRequest: {
                method: "POST",
                href: "/api/prompt-out/steps",
                body: {
                  mode: "proposal",
                  flowKey: "creation",
                  flowId: 1,
                  recordId: 1,
                  templateKey: "kernel_pressure",
                  stepKey: "creation:kernel_prompt",
                  label: "Proposal mode"
                }
              }
            }
          ],
          preview: {
            currentDecision: "Name where the world starts.",
            promptText: [
              "<compact_top_block>",
              "Mode: proposal",
              "Output-label names: selected; adopted with steward revision; rejected",
              "</compact_top_block>",
              "<context_packet>",
              "<documents>",
              "<document>",
              "<source>selected_record:KER-1</source>",
              "<document_content>Starting scale: harbor district.</document_content>",
              "</document>",
              "</documents>",
              "</context_packet>",
              "Quote-grounding pre-step: first quote the source lines.",
              "Structural skeleton example (proposal mode)",
              "Based on the material above, return candidates."
            ].join("\n"),
            contextPreview: "Starting scale: harbor district",
            sourceManifest: ["Source record: KER-1 World kernel", "Prompt template: kernel_pressure"],
            omissions: ["Omission: Admission gate results do not exist inside Creation."],
            advisoryCanonWarning: "Pasted responses remain advisory artifacts and are not admitted canon."
          }
        },
        writeIntent: { willWrite: [], willLink: [], willQueue: [], willRouteOnward: [], willLeaveUntouched: [] },
        nextOrResumeState: { currentStep: "kernel:Starting scale", nextStep: "continue kernel authoring", safeExit: "Safe exit." },
        readSideTrail: [],
        handoffs: [],
        handoff: {
          seedDecompositionReport: null,
          reportSections: [],
          parkedSeeds: [],
          supportingKernel: null,
          kernelSections: [],
          granularityRationale: null,
          admissionIntent: null,
          admissionQueueRoute: "/api/admission/queue",
          currentStatus: "proposed",
          nextStep: "complete seed decomposition",
          sourceLinks: [],
          doctrineAtPointOfUse: []
        }
      } as any}
    />);

    expect(html).toContain("prompt-packet-text");
    expect(html).toContain("&lt;compact_top_block&gt;");
    expect(html).toContain("&lt;documents&gt;");
    expect(html).toContain("Quote-grounding pre-step");
    expect(html).toContain("Structural skeleton example (proposal mode)");
    expect(html).toContain("Source record: KER-1 World kernel");
    expect(html).toContain("Omission: Admission gate results do not exist inside Creation.");
    expect(html).toContain("adopted with steward revision");
    expect(html).toContain("Pasted responses remain advisory artifacts");
    expect(source).toContain("PromptPacketPreview");
    expect(source).toContain("promptOut.preview.promptText");
    expect(source).not.toContain("promptOut.preview.promptText.split");
  });

  it("binds loaded Prompt-out status to exact origin identity and marks prior decisions stale", () => {
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const creationPromptLoader = snippetBetween(source, "const loadCreationPromptStep = async () =>", "const ensurePromptStep = async");
    const admissionPromptLoader = snippetBetween(source, "const loadAdmissionPromptStep = async () =>", "const loadCreationPromptStep = async");
    const currentOrigin = snippetBetween(source, "const currentLoadedPromptOrigin = useMemo", "const loadedPromptStatusView");
    const promptPacketView = snippetBetween(source, "const promptPacketView = useMemo", "const loadedPromptStatusPanel");
    const storeAdvisory = snippetBetween(source, "const storeAdvisory = async () =>", "const applyCreationDecisionPayload");
    const staleOrigin = {
      worldPath: "/tmp/prompt-identity.sqlite",
      flowKey: "creation",
      flowId: 1,
      recordId: 1,
      recordShortId: "KER-1",
      recordTypeKey: "world_kernel",
      selectedSectionHeading: "World premise",
      stepKey: "creation:kernel_prompt",
      mode: "proposal",
      templateKey: "kernel_pressure",
      decisionLabel: "Name where the world starts.",
      createdAt: "2026-07-07T00:00:00.000Z",
      admissionLevel: null,
      workScale: null,
      packetHash: "stale-kernel-packet-hash"
    };
    const html = renderToString(<App
      initialOpenWorld="/tmp/prompt-identity.sqlite"
      initialWorkflowMap={workflowMap as any}
      initialDestination="creation"
      initialLoadedPromptStatus={{
        origin: staleOrigin
      }}
      initialPromptText="STALE WORLD PREMISE PACKET"
      initialPromptPacketOrigin={staleOrigin}
      initialCreationDecision={{
        flow: { key: "creation", runState: "in_progress" },
        currentStep: "decomposition",
        localDecision: "Park decomposed seeds.",
        packageAuthority: {
          primary: "docs/worldbuilding-system/05_creation_protocol.md",
          why: "Phase 2 owns seed decomposition.",
          citations: ["docs/worldbuilding-system/20_ai_assisted_workflow.md"]
        },
        currentKernel: { id: 1, shortId: "KER-1", title: "World kernel" },
        sectionPrompts: [],
        work: { required: [], optional: [], allowedEmpty: [], skippable: [] },
        blockers: [],
        decompositionReadiness: [],
        promptOut: {
          available: true,
          blocker: null,
          templateKey: "decomposition_pressure",
          stepKey: "creation:decomposition_prompt",
          role: "Decomposition pressure",
          stepRequest: {
            method: "POST",
            href: "/api/prompt-out/steps",
            body: {
              flowKey: "creation",
              flowId: 1,
              recordId: 2,
              templateKey: "decomposition_pressure",
              stepKey: "creation:decomposition_prompt",
              mode: "pressure",
              label: "Decomposition pressure"
            }
          },
          modes: [],
          preview: {
            currentDecision: "Park decomposed seeds.",
            promptText: "Seed decomposition packet",
            contextPreview: "Seed FAC-2",
            sourceManifest: ["Seed FAC-2"],
            omissions: [],
            advisoryCanonWarning: "Pasted responses remain advisory."
          }
        },
        writeIntent: { willWrite: [], willLink: [], willQueue: [], willRouteOnward: [], willLeaveUntouched: [] },
        nextOrResumeState: { currentStep: "decomposition", nextStep: "Admission queue", safeExit: "Safe exit." },
        readSideTrail: [],
        handoffs: [],
        handoff: {
          seedDecompositionReport: null,
          reportSections: [],
          parkedSeeds: [],
          supportingKernel: null,
          kernelSections: [],
          granularityRationale: null,
          admissionIntent: null,
          admissionQueueRoute: "/api/admission/queue",
          currentStatus: "proposed",
          nextStep: "Admission queue selection",
          sourceLinks: [],
          doctrineAtPointOfUse: []
        }
      } as any}
    />);

    expect(creationPromptLoader).toContain("setLoadedPromptAndPacket");
    expect(admissionPromptLoader).toContain("setLoadedPromptAndPacket");
    expect(admissionPromptLoader).toContain("buildAdmissionFullGateDraftPayload");
    expect(admissionPromptLoader).toContain("admissionFullGateDraft");
    expect(admissionPromptLoader).toContain("/api/prompt-out/generate");
    expect(currentOrigin).toContain("worldPath: openWorld");
    expect(currentOrigin).toContain("flowKey: \"creation\"");
    expect(currentOrigin).toContain("flowKey: \"admission\"");
    expect(currentOrigin).toContain("admissionDecision.selectedRecord.id");
    expect(currentOrigin).toContain("admissionDecision.selectedRecord.shortId");
    expect(currentOrigin).toContain("admissionDecision.severity.admissionLevel");
    expect(currentOrigin).toContain("admissionDecision.severity.workScale");
    expect(currentOrigin).toContain("admissionDraftHash");
    expect(currentOrigin).toContain("admissionSectionKeys");
    expect(currentOrigin).toContain("selectedSectionHeading");
    expect(currentOrigin).toContain("displayedCreationDecision.promptOut.stepKey");
    expect(source).toContain("sameStringList");
    expect(promptPacketView).toContain("loadedPromptStatusView?.state === \"current\"");
    expect(promptPacketView).toContain("samePromptPacketOrigin");
    expect(storeAdvisory).toContain("canUseCurrentPromptPacket");
    expect(source).toContain("disabled={!canUseCurrentPromptPacket");
    expect(source).toContain("Copy Current Packet");
    expect(html).toContain("Loaded Prompt-out status");
    expect(html).toContain("Stale prior decision origin");
    expect(html).toContain("Stale prompt packet body");
    expect(html).toContain("STALE WORLD PREMISE PACKET");
    expect(html).toContain("creation:kernel_prompt");
    expect(html).toContain("record short id KER-1");
    expect(html).toContain("section World premise");
    expect(html).toContain("Name where the world starts.");
    expect(html).toContain("Current decision changed to Park decomposed seeds.");
    expect(html).toContain("Clear loaded status");
    expect(html).not.toContain("looks current");
  });

  it("keeps Creation packet bodies current only for the matching mode, section, step, and world identity", () => {
    const currentOrigin = loadedOrigin();
    const currentHtml = renderToString(<App
      initialOpenWorld="/tmp/prompt-identity.sqlite"
      initialWorkflowMap={workflowMap as any}
      initialDestination="creation"
      initialLoadedPromptStatus={{ origin: currentOrigin as any }}
      initialPromptText="CURRENT CREATION PACKET"
      initialPromptPacketOrigin={currentOrigin as any}
      initialCreationDecision={creationDecision() as any}
    />);

    expect(currentHtml).toContain("Current prompt packet body");
    expect(currentHtml).toContain("CURRENT CREATION PACKET");
    expect(currentHtml).toContain("section World premise");
    expect(currentHtml).toContain("record short id KER-1");

    const staleCases = [
      {
        label: "mode changed",
        openWorld: "/tmp/prompt-identity.sqlite",
        origin: loadedOrigin({ mode: "pressure", packetHash: "pressure-hash" }),
        decision: creationDecision(),
        expected: ["mode pressure", "packet pressure-hash", "Current decision changed to World premise."]
      },
      {
        label: "selected section changed",
        openWorld: "/tmp/prompt-identity.sqlite",
        origin: loadedOrigin({ selectedSectionHeading: "World premise", decisionLabel: "World premise", packetHash: "section-hash" }),
        decision: creationDecision({ selectedHeading: "Core promise", decisionLabel: "Core promise" }),
        expected: ["section World premise", "packet section-hash", "No active decision identity is available for the loaded prompt."]
      },
      {
        label: "seed decomposition replaced kernel",
        openWorld: "/tmp/prompt-identity.sqlite",
        origin: loadedOrigin({ packetHash: "kernel-hash" }),
        decision: creationDecision({ currentStep: "decomposition", promptStepKey: "creation:decomposition_prompt", templateKey: "decomposition_pressure", recordId: 3, decisionLabel: "Park decomposed seeds." }),
        expected: ["step creation:kernel_prompt", "packet kernel-hash", "Current decision changed to Park decomposed seeds."]
      },
      {
        label: "world changed",
        openWorld: "/tmp/other-world.sqlite",
        origin: loadedOrigin({ packetHash: "prior-world-hash" }),
        decision: creationDecision(),
        expected: ["world /tmp/prompt-identity.sqlite", "packet prior-world-hash", "Current decision changed to World premise."]
      }
    ];

    for (const staleCase of staleCases) {
      const html = renderToString(<App
        initialOpenWorld={staleCase.openWorld}
        initialWorkflowMap={workflowMap as any}
        initialDestination="creation"
        initialLoadedPromptStatus={{ origin: staleCase.origin as any }}
        initialPromptText={`STALE CREATION PACKET: ${staleCase.label}`}
        initialPromptPacketOrigin={staleCase.origin as any}
        initialCreationDecision={staleCase.decision as any}
      />);

      expect(html).toContain("Stale prompt packet body");
      expect(html).toContain(`STALE CREATION PACKET: ${staleCase.label}`);
      expect(html).toContain("This prompt packet body belongs to a prior origin and cannot be copied");
      for (const expected of staleCase.expected) expect(html).toContain(expected);
      expect(html).not.toContain("Current prompt packet body");
    }
  });

  it("keeps Admission packet bodies current only for the matching record, mode, severity, step, and world identity", () => {
    const baseAdmissionOrigin = loadedOrigin({
      flowKey: "admission",
      flowId: null,
      recordId: 7,
      recordShortId: "FAC-7",
      recordTypeKey: "canon_fact",
      selectedSectionHeading: null,
      stepKey: "admission:queue-severity",
      mode: "proposal",
      templateKey: "admission_queue_severity",
      decisionLabel: "Choose and classify the proposed fact before Admission changes canon standing.",
      admissionLevel: null,
      workScale: null,
      packetHash: "admission-current-hash"
    });
    const admissionWorkflowMap = {
      ...workflowMap,
      stages: [
        { key: "admission", label: "Admission", state: "active", summary: "Admission queue has proposed facts.", destinationKey: "admission" }
      ],
      destinations: [
        { key: "admission", label: "Admission", kind: "guided-flow", summary: "Govern proposed facts.", state: "active" }
      ]
    };
    const currentHtml = renderToString(<App
      initialOpenWorld="/tmp/prompt-identity.sqlite"
      initialWorkflowMap={admissionWorkflowMap as any}
      initialDestination="admission"
      initialLoadedPromptStatus={{ origin: baseAdmissionOrigin as any }}
      initialPromptText="CURRENT ADMISSION PACKET"
      initialPromptPacketOrigin={baseAdmissionOrigin as any}
      initialAdmissionDecision={admissionDecision() as any}
    />);

    expect(currentHtml).toContain("Current prompt packet body");
    expect(currentHtml).toContain("CURRENT ADMISSION PACKET");
    expect(currentHtml).toContain("record short id FAC-7");
    expect(currentHtml).toContain("admission_level none");

    const staleCases = [
      {
        label: "mode changed",
        openWorld: "/tmp/prompt-identity.sqlite",
        origin: loadedOrigin({ ...baseAdmissionOrigin, mode: "pressure", packetHash: "admission-pressure-hash" }),
        decision: admissionDecision(),
        expected: ["mode pressure", "record short id FAC-7", "packet admission-pressure-hash"]
      },
      {
        label: "record changed",
        openWorld: "/tmp/prompt-identity.sqlite",
        origin: baseAdmissionOrigin,
        decision: admissionDecision({ recordId: 8, shortId: "FAC-8", title: "Bridge toll oath" }),
        expected: ["record 7", "record short id FAC-7", "Current decision changed to Choose and classify the proposed fact before Admission changes canon standing."]
      },
      {
        label: "severity and full gate changed",
        openWorld: "/tmp/prompt-identity.sqlite",
        origin: baseAdmissionOrigin,
        decision: admissionDecision({
          stepKey: "admission:constraints",
          templateKey: "admission_constraint_challenge",
          admissionLevel: "4",
          workScale: "severe",
          decisionLabel: "Complete the full canon fact gate with written substance."
        }),
        expected: ["step admission:queue-severity", "admission_level none", "Current decision changed to Complete the full canon fact gate with written substance."]
      },
      {
        label: "world changed",
        openWorld: "/tmp/other-world.sqlite",
        origin: loadedOrigin({ ...baseAdmissionOrigin, packetHash: "admission-prior-world-hash" }),
        decision: admissionDecision(),
        expected: ["world /tmp/prompt-identity.sqlite", "record short id FAC-7", "packet admission-prior-world-hash"]
      }
    ];

    for (const staleCase of staleCases) {
      const html = renderToString(<App
        initialOpenWorld={staleCase.openWorld}
        initialWorkflowMap={admissionWorkflowMap as any}
        initialDestination="admission"
        initialLoadedPromptStatus={{ origin: staleCase.origin as any }}
        initialPromptText={`STALE ADMISSION PACKET: ${staleCase.label}`}
        initialPromptPacketOrigin={staleCase.origin as any}
        initialAdmissionDecision={staleCase.decision as any}
      />);

      expect(html).toContain("Stale prompt packet body");
      expect(html).toContain(`STALE ADMISSION PACKET: ${staleCase.label}`);
      expect(html).toContain("This prompt packet body belongs to a prior origin and cannot be copied");
      for (const expected of staleCase.expected) expect(html).toContain(expected);
      expect(html).not.toContain("Current prompt packet body");
    }
  });

  it("invalidates packet identity when the steward manually edits the prompt body", () => {
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");
    const promptBodyEditor = snippetBetween(source, "<textarea rows={7} value={promptText}", "<label>Pasted response");

    expect(promptBodyEditor).toContain("setPromptText(event.target.value)");
    expect(promptBodyEditor).toContain("setPromptPacketOrigin(null)");
    expect(promptBodyEditor).not.toContain("if (!event.target.value)");
    expect(source).toContain("disabled={!canUseCurrentPromptPacket");
  });
});
