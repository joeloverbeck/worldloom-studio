import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

let tempDirs: string[] = [];

const tempPath = (name: string) => {
  const dir = mkdtempSync(join(tmpdir(), "worldloom-prompt-step-"));
  tempDirs.push(dir);
  return join(dir, name);
};

const explicitJudgment = {
  truthLayer: "Objective canon",
  canonStatus: "proposed"
};

const json = async <T,>(response: Response): Promise<T> => response.json() as Promise<T>;

const postJson = (app: ReturnType<typeof createApp>, path: string, payload?: unknown) =>
  app.request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload)
  });

interface PromptOutStepDto {
  id: string;
  label: string;
  templateKey: string;
  context: {
    flowKey: string | null;
    flowId: number | null;
    stepKey: string;
  };
  selectedRecord: {
    id: number;
    shortId: string;
    title: string;
    recordTypeKey: string;
  } | null;
  severity: {
    admissionLevel: string | null;
    workScale: string | null;
  };
  packetIdentity: {
    flowKey: string | null;
    flowId: number | null;
    stepKey: string;
    mode: string;
    templateKey: string;
    recordId: number | null;
    recordShortId: string | null;
    recordTypeKey: string | null;
    selectedSectionHeading: string | null;
    admissionLevel: string | null;
    workScale: string | null;
    decisionLabel: string;
    generatedAt: string | null;
    packetHash: string | null;
  };
  currentState: {
    promptText: string | null;
    advisoryRecordId: number | null;
    disposition: string | null;
  };
  actions: Record<"generate" | "storeAdvisory" | "disposition" | "skip", { method: "POST"; href: string }>;
}

afterEach(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs = [];
});

describe("Prompt-out step lifecycle", () => {
  it("returns server-owned step actions that preserve Prompt-out mechanics and flow aftermath", async () => {
    const app = createApp();
    expect((await postJson(app, "/api/worlds/create", { path: tempPath("prompt-step.sqlite") })).status).toBe(201);
    const fact = await json<{ record: { id: number; shortId: string } }>(await postJson(app, "/api/records", {
      recordTypeKey: "canon_fact",
      title: "Toll ghosts",
      body: "Ghosts testify over bridge tolls.",
      ...explicitJudgment
    }));

    const admissionStep = await json<{ step: PromptOutStepDto }>(await postJson(app, "/api/prompt-out/steps", {
      flowKey: "admission",
      templateKey: "admission_prerequisite_audit",
      recordId: fact.record.id,
      stepKey: "admission:dependencies",
      label: "Admission dependencies",
      admissionLevel: "1",
      workScale: "minor"
    }));

    expect(admissionStep.step).toMatchObject({
      id: "admission:admission:dependencies",
      label: "Admission dependencies",
      templateKey: "admission_prerequisite_audit",
      context: { flowKey: "admission", flowId: null, stepKey: "admission:dependencies" },
      selectedRecord: { id: fact.record.id, title: "Toll ghosts", recordTypeKey: "canon_fact" },
      severity: { admissionLevel: "1", workScale: "minor" },
      packetIdentity: {
        flowKey: "admission",
        flowId: null,
        stepKey: "admission:dependencies",
        mode: "pressure",
        templateKey: "admission_prerequisite_audit",
        recordId: fact.record.id,
        recordShortId: fact.record.shortId,
        recordTypeKey: "canon_fact",
        selectedSectionHeading: null,
        admissionLevel: "1",
        workScale: "minor",
        decisionLabel: "Toll ghosts",
        generatedAt: null,
        packetHash: null
      },
      currentState: { promptText: null, advisoryRecordId: null, disposition: null }
    });
    expect(admissionStep.step.actions.generate.href).toContain("/api/prompt-out/steps/actions/generate?");
    expect(admissionStep.step.actions.storeAdvisory.href).toContain("/api/prompt-out/steps/actions/store-advisory?");
    expect(admissionStep.step.actions.disposition.href).toContain("/api/prompt-out/steps/actions/disposition?");
    expect(admissionStep.step.actions.skip.href).toContain("/api/prompt-out/steps/actions/skip?");

    const generated = await json<{ prompt: string; promptOut: { flowKey: string; stepKey: string; recordId: number; packetIdentity: PromptOutStepDto["packetIdentity"] } }>(
      await postJson(app, admissionStep.step.actions.generate.href)
    );
    expect(generated.promptOut).toMatchObject({ flowKey: "admission", stepKey: "admission:dependencies", recordId: fact.record.id });
    expect(generated.promptOut.packetIdentity).toMatchObject({
      ...admissionStep.step.packetIdentity,
      generatedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      packetHash: expect.stringMatching(/^[a-f0-9]{64}$/)
    });
    expect(generated.prompt).toContain("Prerequisite auditor");
    expect(generated.prompt).toContain("Toll ghosts");

    const advisory = await json<{ record: { id: number; recordTypeKey: string; body: string } }>(
      await postJson(app, admissionStep.step.actions.storeAdvisory.href, {
        promptText: generated.prompt,
        responseText: "Name the enforcement office."
      })
    );
    expect(advisory.record.recordTypeKey).toBe("advisory_artifact");
    expect(advisory.record.body).toContain("Flow: admission");
    expect(advisory.record.body).toContain("Step: admission:dependencies");
    expect((await postJson(app, admissionStep.step.actions.disposition.href, {
      advisoryRecordId: advisory.record.id,
      disposition: "standing ruling",
      note: "Keep enforcement offices named.",
      standingRuling: true
    })).status).toBe(201);

    const admissionSkip = await json<{ record: { id: number } }>(await postJson(app, admissionStep.step.actions.skip.href, {}));
    expect(await json(await app.request(`/api/links?recordId=${admissionSkip.record.id}`))).toMatchObject({
      links: expect.arrayContaining([expect.objectContaining({ toRecordId: fact.record.id, linkTypeKey: "derived_from" })])
    });

    const stage12Run = await json<{ flow: { id: number }; report: { id: number } }>(await postJson(app, "/api/institutional/runs/start", {
      sourceType: "fact",
      recordId: fact.record.id
    }));
    const stage12Step = await json<{ step: PromptOutStepDto }>(await postJson(app, "/api/prompt-out/steps", {
      flowKey: "institutional_economic_suppression",
      flowId: stage12Run.flow.id,
      templateKey: "institution_economy_analyst",
      recordId: fact.record.id,
      stepKey: "stage12:analysis",
      label: "Stage 12 analysis",
      workScale: "major"
    }));

    expect(stage12Step.step.actions.storeAdvisory.href).not.toContain("/api/institutional/advisory-artifacts");
    const stage12Generated = await json<{ prompt: string }>(await postJson(app, stage12Step.step.actions.generate.href));
    const stage12Advisory = await json<{ record: { id: number }; advisories: unknown[]; closeReadiness: { status: string } }>(
      await postJson(app, stage12Step.step.actions.storeAdvisory.href, {
        promptText: stage12Generated.prompt,
        responseText: "The toll office suppresses free ghost testimony."
      })
    );
    expect(stage12Advisory.record.id).toBeGreaterThan(0);
    expect(stage12Advisory.advisories).toHaveLength(1);

    const stage12Skip = await json<{ record: { id: number }; debt: { id: number }; skips: unknown[]; closeReadiness: { status: string } }>(
      await postJson(app, stage12Step.step.actions.skip.href, {
        reason: "Black-market details need a later scene pass.",
        unresolved: true,
        debtName: "Stage-12 black-market follow-up"
      })
    );
    expect(stage12Skip.debt.id).toBeGreaterThan(0);
    expect(stage12Skip.skips).toHaveLength(1);
    expect(await json(await app.request(`/api/institutional/runs/${stage12Run.flow.id}`))).toMatchObject({
      advisories: expect.arrayContaining([expect.objectContaining({ record: expect.objectContaining({ id: stage12Advisory.record.id }) })]),
      skips: expect.arrayContaining([expect.objectContaining({ record: expect.objectContaining({ id: stage12Skip.record.id }) })])
    });
  });

  it("keeps compatibility routes as thin adapters instead of route-level flow switches", () => {
    const source = readFileSync(new URL("../src/http/prompt-out-routes.ts", import.meta.url), "utf8");
    const routeStart = source.indexOf('app.post("/api/prompt-out/skip"');
    expect(routeStart).toBeGreaterThanOrEqual(0);
    const skipRoute = source.slice(routeStart);

    expect(skipRoute).toContain("runPromptOutSkipAction");
    expect(skipRoute).not.toContain('input.flowKey === "creation"');
    expect(skipRoute).not.toContain('input.flowKey === "admission"');
    expect(skipRoute).not.toContain('input.flowKey === "propagation"');
    expect(skipRoute).not.toContain('input.flowKey === "contradiction"');
    expect(skipRoute).not.toContain('input.flowKey === "qa"');
    expect(skipRoute).not.toContain("InstitutionalFlow.FLOW_KEY");
  });
});
