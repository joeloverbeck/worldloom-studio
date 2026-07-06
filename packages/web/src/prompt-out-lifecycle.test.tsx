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
    expect(creationPromptButton).toContain("promptOut.modes?.some((mode) => mode.stepRequest)");
    expect(promptLoader).toContain("mode.stepRequest");
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
});
