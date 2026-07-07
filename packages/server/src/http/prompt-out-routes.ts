import * as PromptOut from "../prompt-out.js";
import {
  buildPromptOutStep,
  promptOutActionContextFromQuery,
  runPromptOutDispositionAction,
  runPromptOutGenerateAction,
  runPromptOutSkipAction,
  runPromptOutStoreAdvisoryAction
} from "../prompt-out-step-actions.js";
import { readJson, tryRoute, withWorld, type RouteApp, type RouteDependencies } from "./route-support.js";

export const registerPromptOutRoutes = (app: RouteApp, dependencies: RouteDependencies): void => {
  app.get("/api/prompt-templates", (c) => withWorld(c, dependencies, (world) =>
    c.json({ templates: PromptOut.listPromptTemplates(world) })
  ));

  app.patch("/api/prompt-templates/:key", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () => {
    const input = await readJson<{ text: string }>(c);
    return c.json({ template: PromptOut.updatePromptTemplate(world, c.req.param("key"), input.text) });
  })));

  app.post("/api/prompt-templates/:key/revert", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json({ template: PromptOut.revertPromptTemplate(world, c.req.param("key")) })
  )));

  app.post("/api/prompts/generate", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () => {
    const result = PromptOut.generatePrompt(world, await readJson<{
      templateKey: string;
      recordId?: number;
      stepKey?: string;
      selectedSectionHeading?: string;
      admissionLevel?: string;
      workScale?: string;
    }>(c));
    return c.json({ prompt: result.prompt });
  })));

  app.post("/api/advisory-artifacts", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ record: PromptOut.storeAdvisoryResponse(world, await readJson<{ stepKey: string; promptText: string; responseText: string }>(c)) }, 201)
  )));

  app.post("/api/advisory-artifacts/:id/dispositions", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ disposition: PromptOut.disposeAdvisoryArtifact(world, Number(c.req.param("id")), await readJson<{ disposition: string; note?: string; standingRuling?: boolean }>(c)) }, 201)
  )));

  app.post("/api/prompt-out/steps", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ step: buildPromptOutStep(world, await readJson<{
      flowKey?: string;
      flowId?: number;
      templateKey: string;
      recordId?: number;
      stepKey: string;
      mode?: "proposal" | "pressure";
      selectedSectionHeading?: string;
      label?: string;
      admissionLevel?: string;
      workScale?: string;
    }>(c)) })
  )));

  app.post("/api/prompt-out/steps/actions/generate", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json(runPromptOutGenerateAction(world, promptOutActionContextFromQuery((key) => c.req.query(key))))
  )));

  app.post("/api/prompt-out/steps/actions/store-advisory", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(runPromptOutStoreAdvisoryAction(
      world,
      promptOutActionContextFromQuery((key) => c.req.query(key)),
      await readJson<{ promptText: string; responseText: string }>(c)
    ), 201)
  )));

  app.post("/api/prompt-out/steps/actions/disposition", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(runPromptOutDispositionAction(world, await readJson<{
      advisoryRecordId: number;
      disposition: string;
      note?: string;
      standingRuling?: boolean;
    }>(c)), 201)
  )));

  app.post("/api/prompt-out/steps/actions/skip", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(runPromptOutSkipAction(
      world,
      promptOutActionContextFromQuery((key) => c.req.query(key)),
      await readJson<{ reason?: string; unresolved?: boolean; debtName?: string; existingDebtRecordId?: number }>(c)
    ), 201)
  )));

  app.post("/api/prompt-out/generate", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(PromptOut.generatePrompt(world, await readJson<{
      flowKey?: string;
      flowId?: number;
      templateKey: string;
      recordId?: number;
      stepKey?: string;
      selectedSectionHeading?: string;
      admissionLevel?: string;
      workScale?: string;
    }>(c)))
  )));

  app.post("/api/prompt-out/advisory-artifacts", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ record: PromptOut.storeAdvisoryResponse(world, await readJson<{
      flowKey?: string;
      flowId?: number;
      stepKey: string;
      promptText: string;
      responseText: string;
    }>(c)) }, 201)
  )));

  app.post("/api/prompt-out/advisory-artifacts/:id/dispositions", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ disposition: PromptOut.disposeAdvisoryArtifact(world, Number(c.req.param("id")), await readJson<{ disposition: string; note?: string; standingRuling?: boolean }>(c)) }, 201)
  )));

  app.post("/api/prompt-out/skip", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () => {
    const input = await readJson<{
      flowKey: string;
      flowId?: number;
      recordId?: number;
      stepKey: string;
      selectedSectionHeading?: string;
      admissionLevel?: string;
      workScale?: string;
      reason?: string;
      unresolved?: boolean;
      debtName?: string;
      existingDebtRecordId?: number;
    }>(c);
    return c.json(runPromptOutSkipAction(world, input, input), 201);
  })));
};
