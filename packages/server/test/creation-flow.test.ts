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
      expect.objectContaining({ key: "consequence_mode", requires: "explicit consequence mode" })
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
