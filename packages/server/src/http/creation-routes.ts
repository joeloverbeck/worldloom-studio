import * as CreationFlow from "../creation-flow.js";
import { readJson, tryRoute, withWorld, type RouteApp, type RouteDependencies } from "./route-support.js";

export const registerCreationRoutes = (app: RouteApp, dependencies: RouteDependencies): void => {
  app.post("/api/flows/creation/start", (c) => withWorld(c, dependencies, (world) =>
    c.json({ flow: CreationFlow.startCreationFlow(world) }, 201)
  ));

  app.post("/api/flows/creation/kernel-step", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(CreationFlow.saveKernelStep(world, await readJson<{ flowId: number; heading: string; body: string; consequenceMode?: string }>(c)))
  )));

  app.post("/api/flows/creation/skip", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ record: CreationFlow.recordCreationSkip(world, await readJson<{ flowId?: number; stepKey: string; reason?: string }>(c)) }, 201)
  )));

  app.post("/api/flows/creation/decompose", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(CreationFlow.decomposeSeeds(world, await readJson<{ flowId: number; kernelRecordId: number; draftIds?: number[]; seeds: Array<{ title: string; body: string; truthLayer: string; canonStatus: string }> }>(c)), 201)
  )));
};
