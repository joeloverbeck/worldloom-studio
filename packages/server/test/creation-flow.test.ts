import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

let tempDirs: string[] = [];

const tempPath = (name: string) => {
  const dir = mkdtempSync(join(tmpdir(), "worldloom-creation-"));
  tempDirs.push(dir);
  return join(dir, name);
};

const json = async <T,>(response: Response): Promise<T> => response.json() as Promise<T>;

afterEach(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs = [];
});

const openWorld = async () => {
  const app = createApp();
  const path = tempPath("creation.sqlite");
  expect((await app.request("/api/worlds/create", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ path })
  })).status).toBe(201);
  return app;
};

describe("Creation decision-point HTTP surface", () => {
  it("starts or resumes Creation with a server-owned decision-point payload", async () => {
    const app = await openWorld();

    const response = await app.request("/api/flows/creation/start", { method: "POST" });
    expect(response.status).toBe(201);
    const payload = await json<{
      flow: { id: number; flow_key: string; current_step: string; state: string };
      decisionPoint: {
        flow: { key: string; runState: string };
        currentStep: string;
        localDecision: string;
        packageAuthority: { primary: string; citations: string[] };
        work: { required: string[]; optional: string[]; allowedEmpty: string[]; skippable: string[] };
        blockers: Array<{ key: string; message: string; requires: string }>;
        promptOut: { available: boolean; blocker: string | null; stepRequest: unknown; preview: { omissions: string[] } };
        writeIntent: { willWrite: string[]; willLink: string[]; willRouteOnward: string[]; willLeaveUntouched: string[] };
        nextOrResumeState: { currentStep: string; nextStep: string; safeExit: string };
        readSideTrail: Array<{ label: string; href: string }>;
        handoffs: string[];
      };
    }>(response);

    expect(payload.flow).toMatchObject({ flow_key: "creation", current_step: "kernel:World premise", state: "in_progress" });
    expect(payload.decisionPoint).toMatchObject({
      flow: { key: "creation", runState: "in_progress" },
      currentStep: "kernel:World premise",
      localDecision: expect.stringContaining("governing kernel"),
      packageAuthority: {
        primary: "docs/worldbuilding-system/05_creation_protocol.md",
        citations: expect.arrayContaining([
          "docs/worldbuilding-system/05_creation_protocol.md#phase-1-world-kernel",
          "docs/worldbuilding-system/templates/world_kernel.md"
        ])
      },
      work: {
        required: expect.arrayContaining(["Write steward-authored kernel material", "Explicitly select consequence mode before seed decomposition"]),
        optional: expect.arrayContaining(["Allowed-empty kernel sections may remain thin"]),
        allowedEmpty: expect.arrayContaining(["Core promise", "Initial mysteries and protected effects"]),
        skippable: expect.arrayContaining(["Prompt-out advisory pressure can be declined with a skip_record"])
      },
      promptOut: {
        available: false,
        blocker: expect.stringContaining("steward-authored kernel material"),
        stepRequest: null,
        preview: { omissions: expect.arrayContaining(["Current kernel material is absent until the steward writes it."]) }
      },
      writeIntent: {
        willWrite: expect.arrayContaining(["one living world_kernel record"]),
        willLink: expect.arrayContaining(["read-side trail placeholders until records exist"]),
        willRouteOnward: expect.arrayContaining(["Seed decomposition after explicit consequence mode"]),
        willLeaveUntouched: expect.arrayContaining(["canon standing is not admitted inside Creation"])
      },
      handoffs: expect.arrayContaining([
        "new-world navigation",
        "kernel decision surface",
        "Creation-bound Prompt-out",
        "seed decomposition surface",
        "browser evidence/coverage closeout"
      ])
    });
    expect(payload.decisionPoint.blockers).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "kernel_material", requires: "steward-authored kernel material" }),
      expect.objectContaining({ key: "consequence_mode", requires: "saved explicit consequence mode" })
    ]));
    expect(payload.decisionPoint.readSideTrail).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: "Current Canon" }),
      expect.objectContaining({ label: "Audit Trail" })
    ]));
  });

  it("returns Creation-bound prompt availability and write intent after kernel material exists", async () => {
    const app = await openWorld();
    const start = await json<{ flow: { id: number } }>(await app.request("/api/flows/creation/start", { method: "POST" }));

    const saved = await json<{
      kernel: { id: number; shortId: string };
      decisionPoint: {
        currentStep: string;
        promptOut: {
          available: boolean;
          templateKey: string;
          stepKey: string;
          modes: Array<{ mode: string; availability: string; blocker: string | null; stepRequest: unknown }>;
          stepRequest: { method: string; href: string; body: { flowKey: string; flowId: number; recordId: number; templateKey: string; stepKey: string } };
          preview: { currentDecision: string; contextPreview: string; sourceManifest: string[]; advisoryCanonWarning: string; omissions: string[] };
        };
        blockers: Array<{ key: string }>;
        writeIntent: { willWrite: string[]; willRouteOnward: string[] };
      };
    }>(await app.request("/api/flows/creation/kernel-step", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        flowId: start.flow.id,
        heading: "World premise",
        body: "Mourningweather turns public grief into literal storms.",
        consequenceMode: "weird"
      })
    }));

    expect(saved.decisionPoint.currentStep).toBe("kernel:World premise");
    expect(saved.decisionPoint.blockers).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "consequence_mode" })
    ]));
    expect(saved.decisionPoint.promptOut).toMatchObject({
      available: true,
      templateKey: "kernel_pressure",
      stepKey: "creation:kernel_prompt",
      stepRequest: {
        method: "POST",
        href: "/api/prompt-out/steps",
        body: {
          flowKey: "creation",
          flowId: start.flow.id,
          recordId: saved.kernel.id,
          templateKey: "kernel_pressure",
          stepKey: "creation:kernel_prompt"
        }
      },
      preview: {
        currentDecision: expect.stringContaining("governing kernel"),
        contextPreview: expect.stringContaining("Mourningweather turns public grief"),
        sourceManifest: expect.arrayContaining([
          expect.stringContaining(saved.kernel.shortId),
          "Method card: creation.kernel (method-card/v1)",
          "Package source: docs/worldbuilding-system/05_creation_protocol.md",
          "Package source: docs/worldbuilding-system/templates/world_kernel.md",
          "Package source: docs/worldbuilding-system/20_ai_assisted_workflow.md"
        ]),
        advisoryCanonWarning: expect.stringContaining("advisory artifacts"),
        omissions: expect.not.arrayContaining([expect.stringContaining("Selected record: none")])
      }
    });
    expect(saved.decisionPoint.promptOut.modes).toEqual(expect.arrayContaining([
      expect.objectContaining({
        mode: "proposal",
        availability: "blocked",
        blocker: expect.stringContaining("World premise"),
        stepRequest: null
      }),
      expect.objectContaining({
        mode: "pressure",
        availability: "available",
        blocker: null
      })
    ]));
    expect(saved.decisionPoint.writeIntent).toMatchObject({
      willWrite: expect.arrayContaining(["section update on one living world_kernel record"]),
      willRouteOnward: expect.arrayContaining(["Seed decomposition once seed material, truth layer, consequence mode, and granularity confirmation are present"])
    });

    const step = await json<{ step: { actions: { generate: { method: "POST"; href: string } } } }>(await app.request(saved.decisionPoint.promptOut.stepRequest.href, {
      method: saved.decisionPoint.promptOut.stepRequest.method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(saved.decisionPoint.promptOut.stepRequest.body)
    }));
    const generated = await json<{ prompt: string; promptOut: { flowKey: string; recordId: number } }>(await app.request(step.step.actions.generate.href, {
      method: step.step.actions.generate.method
    }));
    expect(generated.promptOut).toMatchObject({ flowKey: "creation", recordId: saved.kernel.id });
    expect(generated.prompt).toContain("Mourningweather turns public grief");
    expect(generated.prompt).toContain("Operative rule: Start lean");
    expect(generated.prompt).toContain("Method card: creation.kernel (method-card/v1)");
    expect(generated.prompt).toContain("Package source: docs/worldbuilding-system/05_creation_protocol.md");
    expect(generated.prompt).toContain("Package source: docs/worldbuilding-system/templates/world_kernel.md");
    expect(generated.prompt).toContain("Package source: docs/worldbuilding-system/20_ai_assisted_workflow.md");
    expect(generated.prompt).not.toContain("Selected record: none");
  });

  it("assembles selected-section kernel packets and input-specific decomposition readiness", async () => {
    const app = await openWorld();
    const start = await json<{ flow: { id: number } }>(await app.request("/api/flows/creation/start", { method: "POST" }));
    const saved = await json<{
      kernel: { id: number };
      decisionPoint: {
        currentStep: string;
        decompositionReadiness: Array<{ key: string; status: string; remediation: string }>;
        promptOut: {
          modes: Array<{ mode: string; availability: string; blocker: string | null; stepRequest: { method: "POST"; href: string; body: Record<string, unknown> } | null }>;
          preview: { currentDecision: string; contextPreview: string; sourceManifest: string[]; omissions: string[] };
        };
      };
    }>(await app.request("/api/flows/creation/kernel-step", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        flowId: start.flow.id,
        heading: "Starting scale",
        body: "One river city and its drowned courthouse.",
        consequenceMode: "weird"
      })
    }));

    expect(saved.decisionPoint.currentStep).toBe("kernel:Starting scale");
    expect(saved.decisionPoint.promptOut.preview).toMatchObject({
      currentDecision: expect.stringContaining("Starting scale"),
      contextPreview: expect.stringContaining("Selected kernel section: Starting scale"),
      sourceManifest: expect.arrayContaining([
        "Selected kernel section: Starting scale",
        "Section prompt: Name where the world starts; scale expands only when a fact forces it."
      ]),
      omissions: expect.not.arrayContaining([expect.stringContaining("generic kernel")])
    });
    expect(saved.decisionPoint.decompositionReadiness).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "consequence_mode", status: "satisfied" }),
      expect.objectContaining({ key: "seed_title", status: "blocked" }),
      expect.objectContaining({ key: "seed_body", status: "blocked" }),
      expect.objectContaining({ key: "truth_layer", status: "blocked" }),
      expect.objectContaining({ key: "granularity_confirmation", status: "blocked" })
    ]));

    const proposalMode = saved.decisionPoint.promptOut.modes.find((mode) => mode.mode === "proposal");
    expect(proposalMode).toMatchObject({ availability: "available", blocker: null });
    const step = await json<{ step: { actions: { generate: { method: "POST"; href: string } } } }>(await app.request(proposalMode?.stepRequest?.href ?? "", {
      method: proposalMode?.stepRequest?.method ?? "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(proposalMode?.stepRequest?.body)
    }));
    const generated = await json<{ prompt: string }>(await app.request(step.step.actions.generate.href, {
      method: step.step.actions.generate.method
    }));
    expect(generated.prompt).toContain("Current kernel section: Starting scale");
    expect(generated.prompt).toContain("Selected section prompt: Name where the world starts; scale expands only when a fact forces it.");
    expect(generated.prompt).toContain("Selected section material: One river city and its drowned courthouse.");
    expect(generated.prompt).toContain("Draft labeled candidate material");
    expect(generated.prompt).not.toContain("Flow creation, step creation:kernel_prompt; selected record");

    const pressureMode = saved.decisionPoint.promptOut.modes.find((mode) => mode.mode === "pressure");
    expect(pressureMode).toMatchObject({ availability: "available", blocker: null });
    const pressureStep = await json<{ step: { actions: { generate: { method: "POST"; href: string } } } }>(await app.request(pressureMode?.stepRequest?.href ?? "", {
      method: pressureMode?.stepRequest?.method ?? "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(pressureMode?.stepRequest?.body)
    }));
    const generatedPressure = await json<{ prompt: string }>(await app.request(pressureStep.step.actions.generate.href, {
      method: pressureStep.step.actions.generate.method
    }));
    expect(generatedPressure.prompt).toContain("Current kernel section: Starting scale");
    expect(generatedPressure.prompt).toContain("Selected section material: One river city and its drowned courthouse.");
    expect(generatedPressure.prompt).toContain("Provide pressure, risks, alternatives, and questions on the selected Starting scale section");
    expect(generatedPressure.prompt).toContain("Structural skeleton example (pressure mode)");
    expect(generatedPressure.prompt).not.toContain("Flow creation, step creation:kernel_prompt; selected record");

    const blocked = await app.request("/api/flows/creation/decompose", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        flowId: start.flow.id,
        kernelRecordId: saved.kernel.id,
        granularityRationale: "",
        seeds: [{ title: "Echo court testimony", body: "", truthLayer: "", granularityConfirmed: false }]
      })
    });
    expect(blocked.status).toBe(400);
    const blockedPayload = await json<{
      error: string;
      decisionPoint: { decompositionReadiness: Array<{ key: string; status: string; remediation: string }> };
    }>(blocked);
    expect(blockedPayload.error).toContain("seed body");
    expect(blockedPayload.decisionPoint.decompositionReadiness).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "seed_title", status: "satisfied" }),
      expect.objectContaining({ key: "seed_body", status: "blocked", remediation: expect.stringContaining("body") }),
      expect.objectContaining({ key: "truth_layer", status: "blocked", remediation: expect.stringContaining("truth layer") }),
      expect.objectContaining({ key: "granularity_confirmation", status: "blocked", remediation: expect.stringContaining("granularity") })
    ]));
  });

  it("generates Creation proposal packets for an explicit unsaved non-premise target while preserving essence and pressure gates", async () => {
    const app = await openWorld();
    const start = await json<{ flow: { id: number } }>(await app.request("/api/flows/creation/start", { method: "POST" }));
    const savedPremise = await json<{
      kernel: { id: number };
      decisionPoint: {
        currentStep: string;
        promptOut: {
          stepRequest: { method: "POST"; href: string; body: Record<string, unknown> };
          modes: Array<{ mode: string; availability: string; blocker: string | null; stepRequest: unknown }>;
        };
      };
    }>(await app.request("/api/flows/creation/kernel-step", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        flowId: start.flow.id,
        heading: "World premise",
        body: "Harbor law is enforced by bells that wake the dead.",
        consequenceMode: "weird"
      })
    }));

    expect(savedPremise.decisionPoint.currentStep).toBe("kernel:World premise");
    expect(savedPremise.decisionPoint.promptOut.stepRequest.body).toMatchObject({
      flowKey: "creation",
      flowId: start.flow.id,
      recordId: savedPremise.kernel.id,
      templateKey: "kernel_pressure",
      stepKey: "creation:kernel_prompt",
      selectedSectionHeading: "World premise"
    });
    expect(savedPremise.decisionPoint.promptOut.modes.find((mode) => mode.mode === "proposal")).toMatchObject({
      availability: "blocked",
      blocker: expect.stringContaining("World premise")
    });

    const coreProposalStep = await json<{
      step: {
        packetIdentity: { selectedSectionHeading: string | null; decisionLabel: string };
        actions: { generate: { method: "POST"; href: string } };
      };
    }>(await app.request(savedPremise.decisionPoint.promptOut.stepRequest.href, {
      method: savedPremise.decisionPoint.promptOut.stepRequest.method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...savedPremise.decisionPoint.promptOut.stepRequest.body,
        mode: "proposal",
        label: "Proposal mode",
        selectedSectionHeading: "Core promise"
      })
    }));
    expect(coreProposalStep.step.packetIdentity).toMatchObject({
      selectedSectionHeading: "Core promise",
      decisionLabel: "Core promise"
    });
    const coreProposal = await json<{
      prompt: string;
      promptOut: { packetIdentity: { selectedSectionHeading: string | null; decisionLabel: string } };
    }>(await app.request(coreProposalStep.step.actions.generate.href, {
      method: coreProposalStep.step.actions.generate.method
    }));
    expect(coreProposal.promptOut.packetIdentity).toMatchObject({
      selectedSectionHeading: "Core promise",
      decisionLabel: "Core promise"
    });
    expect(coreProposal.prompt).toContain("Current kernel section: Core promise");
    expect(coreProposal.prompt).toContain("Selected section material: (empty)");
    expect(coreProposal.prompt).toContain("Selected section empty-state context: no saved text exists yet");
    expect(coreProposal.prompt).toContain("Draft labeled candidate material for the selected Core promise section.");
    expect(coreProposal.prompt).not.toContain("selected kernel section World premise");

    const worldPremiseProposal = await app.request(savedPremise.decisionPoint.promptOut.stepRequest.href, {
      method: savedPremise.decisionPoint.promptOut.stepRequest.method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...savedPremise.decisionPoint.promptOut.stepRequest.body,
        mode: "proposal",
        label: "Proposal mode",
        selectedSectionHeading: "World premise"
      })
    });
    expect(worldPremiseProposal.status).toBe(200);
    const worldPremiseStep = await json<{ step: { actions: { generate: { method: "POST"; href: string } } } }>(worldPremiseProposal);
    const refused = await app.request(worldPremiseStep.step.actions.generate.href, {
      method: worldPremiseStep.step.actions.generate.method
    });
    expect(refused.status).toBe(400);
    expect(await json<{ error: string }>(refused)).toMatchObject({
      error: expect.stringContaining("World premise")
    });

    const corePressureStep = await json<{ step: { actions: { generate: { method: "POST"; href: string } } } }>(await app.request(savedPremise.decisionPoint.promptOut.stepRequest.href, {
      method: savedPremise.decisionPoint.promptOut.stepRequest.method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...savedPremise.decisionPoint.promptOut.stepRequest.body,
        mode: "pressure",
        label: "Consequence scout",
        selectedSectionHeading: "Core promise"
      })
    }));
    const pressureBlocked = await app.request(corePressureStep.step.actions.generate.href, {
      method: corePressureStep.step.actions.generate.method
    });
    expect(pressureBlocked.status).toBe(400);
    expect(await json<{ error: string }>(pressureBlocked)).toMatchObject({
      error: expect.stringContaining("Pressure prompts require steward-authored material")
    });

    const compatibilityStep = await json<{ step: { actions: { generate: { method: "POST"; href: string } } } }>(await app.request(savedPremise.decisionPoint.promptOut.stepRequest.href, {
      method: savedPremise.decisionPoint.promptOut.stepRequest.method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(savedPremise.decisionPoint.promptOut.stepRequest.body)
    }));
    const compatibility = await json<{ prompt: string; promptOut: { packetIdentity: { selectedSectionHeading: string | null } } }>(await app.request(compatibilityStep.step.actions.generate.href, {
      method: compatibilityStep.step.actions.generate.method
    }));
    expect(compatibility.promptOut.packetIdentity.selectedSectionHeading).toBe("World premise");
    expect(compatibility.prompt).toContain("Current kernel section: World premise");
  });

  it("exposes saved consequence mode and selected-section contracts without browser-side inference", async () => {
    const app = await openWorld();
    const start = await json<{
      flow: { id: number };
      decisionPoint: {
        consequenceMode: { saved: string | null; status: string; source: string; blocker: string | null };
        selectedSection: { heading: string; savedBody: string; hasSavedBody: boolean; emptyState: { kind: string; message: string }; saveTarget: { flowId: number; heading: string } };
      };
    }>(await app.request("/api/flows/creation/start", { method: "POST" }));

    expect(start.decisionPoint.consequenceMode).toMatchObject({
      saved: null,
      status: "missing_saved_facet",
      source: "record facet: consequence_mode",
      blocker: expect.stringContaining("Save the kernel step")
    });
    expect(start.decisionPoint.selectedSection).toMatchObject({
      heading: "World premise",
      savedBody: "",
      hasSavedBody: false,
      emptyState: {
        kind: "no_saved_section_text",
        message: expect.stringContaining("No saved text exists yet")
      },
      saveTarget: { flowId: start.flow.id, heading: "World premise" }
    });

    const savedScale = await json<{
      kernel: { id: number };
      sections: Array<{ heading: string; body: string }>;
      decisionPoint: {
        consequenceMode: { saved: string | null; status: string; blocker: string | null };
        selectedSection: { heading: string; savedBody: string; hasSavedBody: boolean; emptyState: { kind: string; message: string }; saveTarget: { flowId: number; heading: string } };
        sectionPrompts: Array<{ heading: string; savedBody: string; hasSavedBody: boolean; emptyState: { kind: string; message: string }; saveTarget: { flowId: number; heading: string } }>;
        decompositionReadiness: Array<{ key: string; status: string; message: string; remediation: string }>;
      };
    }>(await app.request("/api/flows/creation/kernel-step", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        flowId: start.flow.id,
        heading: "Starting scale",
        body: "One river city and its drowned courthouse.",
        consequenceMode: "weird"
      })
    }));

    expect(savedScale.decisionPoint.consequenceMode).toMatchObject({
      saved: "weird",
      status: "saved",
      blocker: null
    });
    expect(savedScale.decisionPoint.selectedSection).toMatchObject({
      heading: "Starting scale",
      savedBody: "One river city and its drowned courthouse.",
      hasSavedBody: true,
      saveTarget: { flowId: start.flow.id, heading: "Starting scale" }
    });
    expect(savedScale.decisionPoint.decompositionReadiness).toEqual(expect.arrayContaining([
      expect.objectContaining({
        key: "consequence_mode",
        status: "satisfied",
        message: expect.stringContaining("Saved")
      })
    ]));
    expect(savedScale.decisionPoint.sectionPrompts).toEqual(expect.arrayContaining([
      expect.objectContaining({
        heading: "Core promise",
        savedBody: "",
        hasSavedBody: false,
        emptyState: expect.objectContaining({
          kind: "no_saved_section_text",
          message: expect.stringContaining("No saved text exists yet")
        }),
        saveTarget: { flowId: start.flow.id, heading: "Core promise" }
      })
    ]));

    const savedCorePromise = await json<{
      sections: Array<{ heading: string; body: string }>;
      decisionPoint: {
        selectedSection: { heading: string; savedBody: string; hasSavedBody: boolean; emptyState: { kind: string } };
        sectionPrompts: Array<{ heading: string; savedBody: string; hasSavedBody: boolean }>;
      };
    }>(await app.request("/api/flows/creation/kernel-step", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        flowId: start.flow.id,
        heading: "Core promise",
        body: ""
      })
    }));

    expect(savedCorePromise.sections).toEqual(expect.arrayContaining([
      expect.objectContaining({ heading: "Starting scale", body: "One river city and its drowned courthouse." }),
      expect.objectContaining({ heading: "Core promise", body: "" })
    ]));
    expect(savedCorePromise.decisionPoint.selectedSection).toMatchObject({
      heading: "Core promise",
      savedBody: "",
      hasSavedBody: false,
      emptyState: { kind: "no_saved_section_text" }
    });
    expect(savedCorePromise.decisionPoint.sectionPrompts).toEqual(expect.arrayContaining([
      expect.objectContaining({
        heading: "Starting scale",
        savedBody: "One river city and its drowned courthouse.",
        hasSavedBody: true
      })
    ]));
  });

  it("blocks decomposition until required steward choices are visible and parks seeds at proposed", async () => {
    const app = await openWorld();
    const start = await json<{ flow: { id: number } }>(await app.request("/api/flows/creation/start", { method: "POST" }));
    const savedWithoutMode = await json<{ kernel: { id: number } }>(await app.request("/api/flows/creation/kernel-step", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        flowId: start.flow.id,
        heading: "World premise",
        body: "A city hears its dead."
      })
    }));

    const blocked = await app.request("/api/flows/creation/decompose", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        flowId: start.flow.id,
        kernelRecordId: savedWithoutMode.kernel.id,
        seeds: [{ title: "Echo court testimony", body: "Courts accept echo testimony under conditions", truthLayer: "Objective canon", granularityConfirmed: true }]
      })
    });
    expect(blocked.status).toBe(400);
    expect(await json<{ error: string; decisionPoint: { blockers: Array<{ key: string; message: string }> } }>(blocked)).toMatchObject({
      error: expect.stringContaining("consequence mode"),
      decisionPoint: { blockers: expect.arrayContaining([expect.objectContaining({ key: "consequence_mode" })]) }
    });

    await app.request("/api/flows/creation/kernel-step", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        flowId: start.flow.id,
        heading: "Genre, tone, and consequence-mode commitments",
        body: "Weird civic horror with grief-weather consequences.",
        consequenceMode: "weird"
      })
    });
    const emptySeeds = await app.request("/api/flows/creation/decompose", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        flowId: start.flow.id,
        kernelRecordId: savedWithoutMode.kernel.id,
        granularityRationale: "Each seed can be rejected independently.",
        seeds: []
      })
    });
    expect(emptySeeds.status).toBe(400);
    expect(await json<{ error: string }>(emptySeeds)).toMatchObject({
      error: expect.stringContaining("at least one seed")
    });

    const unrelatedKernel = await json<{ record: { id: number } }>(await app.request("/api/records", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        recordTypeKey: "world_kernel",
        title: "Unrelated kernel",
        body: "Another kernel",
        truthLayer: "Objective canon",
        canonStatus: "proposed"
      })
    }));
    await app.request(`/api/records/${unrelatedKernel.record.id}/facets`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ vocabulary: "consequence_mode", term: "weird", position: 1 })
    });
    const mismatchedKernel = await app.request("/api/flows/creation/decompose", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        flowId: start.flow.id,
        kernelRecordId: unrelatedKernel.record.id,
        granularityRationale: "Each seed can be rejected independently.",
        seeds: [{ title: "Wrong kernel seed", body: "Should not attach", truthLayer: "Objective canon", granularityConfirmed: true }]
      })
    });
    expect(mismatchedKernel.status).toBe(400);
    expect(await json<{ error: string }>(mismatchedKernel)).toMatchObject({
      error: expect.stringContaining("active Creation flow")
    });

    const decomposed = await app.request("/api/flows/creation/decompose", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        flowId: start.flow.id,
        kernelRecordId: savedWithoutMode.kernel.id,
        granularityRationale: "Each seed can be rejected without rewriting its siblings.",
        admissionIntent: "Audit during Admission for institutional cost.",
        seeds: [{ title: "Echo court testimony", body: "Courts accept echo testimony under conditions", truthLayer: "Objective canon", canonStatus: "accepted", granularityConfirmed: true }]
      })
    });
    expect(decomposed.status).toBe(201);
    const decomposedPayload = await json<{
      report: { id: number; shortId: string; title: string };
      records: Array<{ id: number; shortId: string; title: string; body: string; truthLayer: string; canonStatus: string }>;
      decisionPoint: {
        currentStep: string;
        handoff: {
          seedDecompositionReport: { id: number; shortId: string; title: string };
          parkedSeeds: Array<{ id: number; shortId: string; title: string; body: string; truthLayer: string; canonStatus: string; sourceLinks: unknown[] }>;
          granularityRationale: string;
          admissionIntent: string | null;
          admissionQueueRoute: string;
          currentStatus: string;
          nextStep: string;
          sourceLinks: unknown[];
          doctrineAtPointOfUse: string[];
        };
        promptOut: {
          available: boolean;
          blocker: string | null;
          stepRequest: { method: "POST"; href: string; body: { flowKey: string; flowId: number; recordId: number; templateKey: string; stepKey: string } };
          preview: { contextPreview: string; sourceManifest: string[]; omissions: string[]; advisoryCanonWarning: string };
        };
        writeIntent: { willWrite: string[]; willRouteOnward: string[] };
        readSideTrail: Array<{ label: string }>;
      };
    }>(decomposed);
    expect(decomposedPayload).toMatchObject({
      records: [{ canonStatus: "proposed", truthLayer: "Objective canon" }],
      decisionPoint: {
        currentStep: "decomposition:complete",
        handoff: {
          seedDecompositionReport: { id: decomposedPayload.report.id, shortId: decomposedPayload.report.shortId },
          parkedSeeds: [expect.objectContaining({
            shortId: decomposedPayload.records[0]?.shortId,
            title: "Echo court testimony",
            body: "Courts accept echo testimony under conditions",
            truthLayer: "Objective canon",
            canonStatus: "proposed",
            sourceLinks: expect.arrayContaining([
              expect.objectContaining({ linkTypeKey: "derived_from" })
            ])
          })],
          granularityRationale: "Each seed can be rejected without rewriting its siblings.",
          admissionIntent: "Audit during Admission for institutional cost.",
          admissionQueueRoute: "/api/admission/queue",
          currentStatus: "proposed",
          nextStep: "Admission queue selection",
          sourceLinks: expect.arrayContaining([
            expect.objectContaining({ label: expect.stringContaining("Kernel") }),
            expect.objectContaining({ label: expect.stringContaining("Seed decomposition report") })
          ]),
          doctrineAtPointOfUse: expect.arrayContaining([
            expect.stringContaining("independently rejected"),
            expect.stringContaining("proposed for Admission"),
            expect.stringContaining("Admission owns first canon standing")
          ])
        },
        promptOut: {
          available: true,
          blocker: null,
          stepRequest: {
            body: {
              flowKey: "creation",
              flowId: start.flow.id,
              recordId: decomposedPayload.report.id,
              templateKey: "decomposition_pressure",
              stepKey: "creation:decomposition_prompt"
            }
          },
          preview: {
            contextPreview: expect.stringContaining("Echo court testimony"),
            sourceManifest: expect.arrayContaining([
              expect.stringContaining("Seed decomposition report"),
              expect.stringContaining("Parked seed"),
              "Method card: creation.seed-decomposition (method-card/v1)",
              "Package source: docs/worldbuilding-system/05_creation_protocol.md",
              "Package source: docs/worldbuilding-system/06_canon_fact_admission_protocol.md",
              "Package source: docs/worldbuilding-system/20_ai_assisted_workflow.md"
            ]),
            omissions: expect.arrayContaining([
              expect.stringContaining("Frontloaded seed audit"),
              expect.stringContaining("Admission gate results")
            ]),
            advisoryCanonWarning: expect.stringContaining("advisory artifacts")
          }
        },
        writeIntent: {
          willWrite: expect.arrayContaining(["seed_decomposition report", "canon_fact records fixed at proposed"]),
          willRouteOnward: expect.arrayContaining(["Admission flow"])
        },
        readSideTrail: expect.arrayContaining([
          expect.objectContaining({ label: "Seed decomposition report" }),
          expect.objectContaining({ label: "Admission queue" })
        ])
      }
    });

    const promptStep = await json<{ step: { actions: { generate: { method: "POST"; href: string } } } }>(await app.request(
      decomposedPayload.decisionPoint.promptOut.stepRequest.href,
      {
        method: decomposedPayload.decisionPoint.promptOut.stepRequest.method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(decomposedPayload.decisionPoint.promptOut.stepRequest.body)
      }
    ));
    const generated = await json<{ prompt: string; promptOut: { flowKey: string; recordId: number; templateKey: string } }>(await app.request(
      promptStep.step.actions.generate.href,
      { method: promptStep.step.actions.generate.method }
    ));
    expect(generated.promptOut).toMatchObject({
      flowKey: "creation",
      recordId: decomposedPayload.report.id,
      templateKey: "decomposition_pressure"
    });
    expect(generated.prompt).toContain("Seed decomposition report");
    expect(generated.prompt).toContain(decomposedPayload.report.shortId);
    expect(generated.prompt).toContain("Echo court testimony");
    expect(generated.prompt).toContain("Courts accept echo testimony under conditions");
    expect(generated.prompt).toContain("Truth layer: Objective canon");
    expect(generated.prompt).toContain("Canon status: proposed");
    expect(generated.prompt).toContain("Granularity rationale: Each seed can be rejected without rewriting its siblings.");
    expect(generated.prompt).toContain("Admission intent: Audit during Admission for institutional cost.");
    expect(generated.prompt).toContain("Supporting kernel context");
    expect(generated.prompt).toContain("Operative rule: Decompose until each seed can be rejected without destroying its siblings, then park it as proposed for Admission.");
    expect(generated.prompt).toContain("Why the method asks: Creation finds workable pressure seeds; Admission owns first canon standing.");
    expect(generated.prompt).toContain("Frontloaded seed audit results omitted: Admission owns that instrument and no result exists yet.");
    expect(generated.prompt).toContain("Provide pressure, risks, alternatives, and questions");
    expect(generated.prompt).not.toContain("Record context:\nKER-");
  });

  it("does not generate a kernel-only decomposition prompt when decomposition material is missing", async () => {
    const app = await openWorld();
    const start = await json<{ flow: { id: number } }>(await app.request("/api/flows/creation/start", { method: "POST" }));
    const saved = await json<{ kernel: { id: number } }>(await app.request("/api/flows/creation/kernel-step", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        flowId: start.flow.id,
        heading: "World premise",
        body: "A city hears its dead.",
        consequenceMode: "weird"
      })
    }));

    const generated = await app.request(`/api/prompt-out/steps/actions/generate?flowKey=creation&flowId=${start.flow.id}&templateKey=decomposition_pressure&recordId=${saved.kernel.id}&stepKey=creation:decomposition_prompt`, {
      method: "POST"
    });

    expect(generated.status).toBe(400);
    expect(await json<{ error: string }>(generated)).toMatchObject({
      error: expect.stringContaining("decomposition prompt requires a seed-decomposition report and parked seeds")
    });
  });
});
