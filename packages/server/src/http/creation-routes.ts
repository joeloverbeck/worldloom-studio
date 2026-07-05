import * as CreationFlow from "../creation-flow.js";
import { readJson, tryRoute, withWorld, type RouteApp, type RouteDependencies } from "./route-support.js";

export const registerCreationRoutes = (app: RouteApp, dependencies: RouteDependencies): void => {
  app.post("/api/flows/creation/start", (c) => withWorld(c, dependencies, (world) => {
    const flow = CreationFlow.startCreationFlow(world);
    return c.json({ flow, decisionPoint: CreationFlow.creationDecisionPoint(world, flow) }, 201);
  }));

  app.post("/api/flows/creation/kernel-step", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(CreationFlow.saveKernelStep(world, await readJson<{ flowId: number; heading: string; body: string; consequenceMode?: string }>(c)))
  )));

  app.post("/api/flows/creation/skip", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ record: CreationFlow.recordCreationSkip(world, await readJson<{ flowId?: number; stepKey: string; reason?: string }>(c)) }, 201)
  )));

  app.post("/api/flows/creation/decompose", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(CreationFlow.decomposeSeeds(world, await readJson<{
      flowId: number;
      kernelRecordId: number;
      draftIds?: number[];
      granularityRationale?: string;
      admissionIntent?: string;
      seeds: Array<{ title: string; body: string; truthLayer: string; canonStatus?: string; granularityConfirmed?: boolean }>;
    }>(c)), 201)
  )));
};
