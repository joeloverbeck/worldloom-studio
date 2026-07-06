import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

let tempDirs: string[] = [];

const tempPath = (name: string) => {
  const dir = mkdtempSync(join(tmpdir(), "worldloom-decision-contract-"));
  tempDirs.push(dir);
  return join(dir, name);
};

const json = async <T,>(response: Response): Promise<T> => response.json() as Promise<T>;

const postJson = (app: ReturnType<typeof createApp>, path: string, payload?: unknown) =>
  app.request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload)
  });

const createWorld = async () => {
  const app = createApp();
  expect((await postJson(app, "/api/worlds/create", { path: tempPath("contract.sqlite") })).status).toBe(201);
  return app;
};

afterEach(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs = [];
});

describe("shared decision-point contract", () => {
  it("serves the W-8 shared contract for Creation, Admission, and Constraint Composition without moving flow policy", async () => {
    const app = await createWorld();

    const creation = await json<{
      decisionPoint: {
        sharedContract: {
          contractVersion: string;
          flow: { key: string; runState: string };
          step: { key: string; localDecision: string; packageSource: string; why: string };
          obligations: { required: string[]; optional: string[]; skippable: string[]; severityDependent: string[] };
          doctrine: { slots: string[]; packageSources: string[] };
          bearingContext: { displayed: string[]; sourceManifest: string[]; omissions: string[] };
          promptOut: {
            serverOwned: true;
            modes: Array<{ mode: "proposal" | "pressure"; availability: string; blocker: string | null; framing: string }>;
          };
          blockers: Array<{ key: string; message: string }>;
          writeIntent: { willWrite: string[]; willLeaveUntouched: string[] };
          nextOrResumeState: { nextStep: string; safeExit: string };
          readSideTrail: Array<{ label: string; href: string }>;
        };
      };
    }>(await postJson(app, "/api/flows/creation/start"));
    expect(creation.decisionPoint.sharedContract).toMatchObject({
      contractVersion: "decision-point/v1",
      flow: { key: "creation", runState: "in_progress" },
      step: {
        key: "kernel:World premise",
        localDecision: expect.stringContaining("governing kernel"),
        packageSource: "docs/worldbuilding-system/05_creation_protocol.md",
        why: expect.stringContaining("Phase 1")
      },
      obligations: {
        required: expect.arrayContaining(["Write steward-authored kernel material"]),
        optional: expect.arrayContaining(["Allowed-empty kernel sections may remain thin"]),
        skippable: expect.arrayContaining(["Prompt-out advisory pressure can be declined with a skip_record"]),
        severityDependent: expect.arrayContaining(["Explicitly select consequence mode before seed decomposition"])
      },
      doctrine: {
        packageSources: expect.arrayContaining([
          "docs/worldbuilding-system/05_creation_protocol.md#phase-1-world-kernel",
          "docs/worldbuilding-system/20_ai_assisted_workflow.md"
        ])
      },
      promptOut: {
        serverOwned: true,
        modes: expect.arrayContaining([
          expect.objectContaining({
            mode: "proposal",
            availability: "blocked",
            blocker: expect.stringContaining("world's essence")
          }),
          expect.objectContaining({
            mode: "pressure",
            availability: "blocked",
            blocker: expect.stringContaining("steward-authored kernel material")
          })
        ])
      },
      blockers: expect.arrayContaining([expect.objectContaining({ key: "kernel_material" })]),
      writeIntent: {
        willWrite: expect.arrayContaining(["one living world_kernel record"]),
        willLeaveUntouched: expect.arrayContaining(["canon standing is not admitted inside Creation"])
      },
      nextOrResumeState: { nextStep: "continue kernel authoring" },
      readSideTrail: expect.arrayContaining([expect.objectContaining({ label: "Current Canon" })])
    });
    expect(creation.decisionPoint.sharedContract.bearingContext.omissions).toEqual(expect.arrayContaining([
      expect.stringContaining("Current kernel material is absent")
    ]));

    const fact = await json<{ record: { id: number } }>(await postJson(app, "/api/records", {
      recordTypeKey: "canon_fact",
      title: "Bell courts",
      body: "Bell courts hear oaths from the dead.",
      truthLayer: "Objective canon",
      canonStatus: "proposed"
    }));
    const admission = await json<{
      decisionPoint: {
        sharedContract: {
          flow: { key: string };
          obligations: { required: string[]; severityDependent: string[] };
          promptOut: { modes: Array<{ mode: string; availability: string; blocker: string | null }> };
          writeIntent: { willRouteOnward: string[]; willLeaveUntouched: string[] };
        };
      };
    }>(await app.request(`/api/admission/records/${fact.record.id}/decision-point`));
    expect(admission.decisionPoint.sharedContract).toMatchObject({
      flow: { key: "admission" },
      obligations: {
        required: expect.arrayContaining(["Select a proposed fact", "Declare admission_level", "Declare work_scale"]),
        severityDependent: expect.arrayContaining(["Gate depth is unavailable until severity is declared"])
      },
      promptOut: {
        modes: expect.arrayContaining([
          expect.objectContaining({ mode: "proposal", availability: "available", blocker: null }),
          expect.objectContaining({ mode: "pressure", availability: "available", blocker: null })
        ])
      },
      writeIntent: {
        willRouteOnward: expect.arrayContaining(["minor ledger or full gate after severity declaration"]),
        willLeaveUntouched: expect.arrayContaining(["Admission does not infer truth layer, canon status, tags, or operations"])
      }
    });

    const constraint = await json<{
      decisionPoint: {
        sharedContract: {
          flow: { key: string };
          step: { localDecision: string; packageSource: string };
          obligations: { required: string[]; optional: string[] };
          promptOut: { modes: Array<{ mode: string; availability: string; blocker: string | null }> };
          blockers: Array<{ key: string }>;
        };
      };
    }>(await postJson(app, "/api/constraint-composition/runs/start", {
      sourceType: "fact",
      recordId: fact.record.id
    }));
    expect(constraint.decisionPoint.sharedContract).toMatchObject({
      flow: { key: "constraint_composition" },
      step: {
        localDecision: expect.stringContaining("source and constrained subject"),
        packageSource: "docs/worldbuilding-system/08_constraint_composition.md"
      },
      obligations: {
        required: expect.arrayContaining(["Constrained fact", "Constraint budget", "Loopholes", "Enforcement", "Residue"]),
        optional: expect.arrayContaining(["Constraint card", "Admission proposal", "Canon debt", "Prompt-out advisory pressure"])
      },
      promptOut: {
        modes: expect.arrayContaining([
          expect.objectContaining({ mode: "proposal", availability: "available", blocker: null }),
          expect.objectContaining({ mode: "pressure", availability: "blocked", blocker: expect.stringContaining("steward-authored material") })
        ])
      },
      blockers: expect.arrayContaining([expect.objectContaining({ key: "constraint_budget" })])
    });
  });

  it("uses the displayed context assembly for prompt packets and proposal-mode lifecycle actions", async () => {
    const app = await createWorld();
    const start = await json<{ flow: { id: number } }>(await postJson(app, "/api/flows/creation/start"));
    const savedPremise = await json<{
      kernel: { id: number };
      decisionPoint: {
        promptOut: {
          modes: Array<{
            mode: "proposal" | "pressure";
            available: boolean;
            blocker: string | null;
            stepRequest: { method: "POST"; href: string; body: Record<string, unknown> } | null;
          }>;
        };
        sharedContract: { promptOut: { modes: Array<{ mode: string; availability: string; blocker: string | null }> } };
      };
    }>(
      await postJson(app, "/api/flows/creation/kernel-step", {
        flowId: start.flow.id,
        heading: "World premise",
        body: "Mourningweather turns public grief into literal storms.",
        consequenceMode: "weird"
      })
    );
    expect(savedPremise.decisionPoint.sharedContract.promptOut.modes).toEqual(expect.arrayContaining([
      expect.objectContaining({ mode: "proposal", availability: "blocked", blocker: expect.stringContaining("world's essence") }),
      expect.objectContaining({ mode: "pressure", availability: "available", blocker: null })
    ]));
    const premisePressure = savedPremise.decisionPoint.promptOut.modes.find((mode) => mode.mode === "pressure");
    expect(premisePressure?.stepRequest).toBeTruthy();
    const premiseStep = await json<{ step: { availableModes: Array<{ mode: string; available: boolean; blocker: string | null }> } }>(
      await app.request(premisePressure!.stepRequest!.href, {
        method: premisePressure!.stepRequest!.method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(premisePressure!.stepRequest!.body)
      })
    );
    expect(premiseStep.step.availableModes).toEqual(expect.arrayContaining([
      expect.objectContaining({
        mode: "proposal",
        available: false,
        blocker: expect.stringContaining("world's essence")
      })
    ]));

    const savedScale = await json<{
      kernel: { id: number };
      decisionPoint: {
        promptOut: {
          modes: Array<{
            mode: "proposal" | "pressure";
            available: boolean;
            blocker: string | null;
            stepRequest: { method: "POST"; href: string; body: Record<string, unknown> } | null;
          }>;
        };
        sharedContract: { bearingContext: { displayed: string[]; sourceManifest: string[]; omissions: string[] } };
      };
    }>(await postJson(app, "/api/flows/creation/kernel-step", {
      flowId: start.flow.id,
      heading: "Starting scale",
      body: "Begin with one harbor district and its mourning courts.",
      consequenceMode: "weird"
    }));

    const proposal = savedScale.decisionPoint.promptOut.modes.find((mode) => mode.mode === "proposal");
    expect(proposal).toMatchObject({ available: true, blocker: null });
    expect(proposal?.stepRequest?.body).toMatchObject({ mode: "proposal", flowKey: "creation", recordId: savedScale.kernel.id });

    const step = await json<{ step: { mode: string; availableModes: unknown[]; actions: { generate: { method: "POST"; href: string }; storeAdvisory: { method: "POST"; href: string }; disposition: { method: "POST"; href: string } } } }>(
      await app.request(proposal!.stepRequest!.href, {
        method: proposal!.stepRequest!.method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(proposal!.stepRequest!.body)
      })
    );
    expect(step.step).toMatchObject({
      mode: "proposal",
      availableModes: expect.arrayContaining([
        expect.objectContaining({ mode: "proposal", label: expect.stringContaining("Proposal") }),
        expect.objectContaining({ mode: "pressure", label: expect.stringContaining("Pressure") })
      ])
    });

    const generated = await json<{ prompt: string; promptOut: { mode: string; flowKey: string; recordId: number } }>(
      await app.request(step.step.actions.generate.href, { method: step.step.actions.generate.method })
    );
    expect(generated.promptOut).toMatchObject({ mode: "proposal", flowKey: "creation", recordId: savedScale.kernel.id });
    for (const displayed of savedScale.decisionPoint.sharedContract.bearingContext.displayed.filter((item) => item.includes("harbor district"))) {
      expect(generated.prompt).toContain(displayed);
    }
    expect(generated.prompt).toContain("Proposal mode");
    expect(generated.prompt).toContain("labeled candidate");
    expect(generated.prompt).toContain("forbid");
    expect(generated.prompt).toContain("adopted with steward revision");
    expect(generated.prompt).toContain("Source manifest:");
    expect(generated.prompt).toContain("Advisory/canon warning");

    const advisory = await json<{ record: { id: number; recordTypeKey: string; body: string } }>(
      await app.request(step.step.actions.storeAdvisory.href, {
        method: step.step.actions.storeAdvisory.method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          promptText: generated.prompt,
          responseText: "Candidate A: Harbor mourners bottle rain in court jars."
        })
      })
    );
    expect(advisory.record.recordTypeKey).toBe("advisory_artifact");
    expect(advisory.record.body).toContain("Mode: proposal");
    expect(advisory.record.body).toContain("Candidate A");
    const disposition = await app.request(step.step.actions.disposition.href, {
      method: step.step.actions.disposition.method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        advisoryRecordId: advisory.record.id,
        disposition: "adopted with steward revision",
        note: "Kept rain jars, rewrote court details."
      })
    });
    expect(disposition.status).toBe(201);
  });
});
