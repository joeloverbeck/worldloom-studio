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
    expect(promptLoader).toContain("mode.stepRequest");
    expect(promptLoader).toContain("mode.mode === creationPromptMode");
    expect(promptLoader).toContain("selectedMode?.available");
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
    const html = renderToString(<App
      initialOpenWorld="/tmp/prompt-identity.sqlite"
      initialWorkflowMap={workflowMap as any}
      initialDestination="creation"
      initialLoadedPromptStatus={{
        origin: {
          worldPath: "/tmp/prompt-identity.sqlite",
          flowKey: "creation",
          flowId: 1,
          recordId: 1,
          stepKey: "creation:kernel_prompt",
          mode: "proposal",
          templateKey: "kernel_pressure",
          decisionLabel: "Name where the world starts.",
          createdAt: "2026-07-07T00:00:00.000Z",
          admissionLevel: null,
          workScale: null
        }
      }}
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

    expect(creationPromptLoader).toContain("setLoadedPromptStatus");
    expect(admissionPromptLoader).toContain("setLoadedPromptStatus");
    expect(currentOrigin).toContain("worldPath: openWorld");
    expect(currentOrigin).toContain("flowKey: \"creation\"");
    expect(currentOrigin).toContain("flowKey: \"admission\"");
    expect(currentOrigin).toContain("admissionDecision.selectedRecord.id");
    expect(currentOrigin).toContain("admissionDecision.severity.admissionLevel");
    expect(currentOrigin).toContain("admissionDecision.severity.workScale");
    expect(currentOrigin).toContain("displayedCreationDecision.promptOut.stepKey");
    expect(html).toContain("Loaded Prompt-out status");
    expect(html).toContain("Stale prior decision origin");
    expect(html).toContain("creation:kernel_prompt");
    expect(html).toContain("Name where the world starts.");
    expect(html).toContain("Current decision changed to Park decomposed seeds.");
    expect(html).toContain("Clear loaded status");
    expect(html).not.toContain("looks current");
  });
});
