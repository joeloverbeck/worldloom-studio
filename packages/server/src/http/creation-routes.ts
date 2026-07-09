import * as CreationFlow from "../creation-flow.js";
import * as CreationCoverage from "../creation-coverage.js";
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

  app.get("/api/flows/creation/coverage", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () => {
    const kernelRecordId = c.req.query("kernelRecordId");
    return c.json({
      coverage: CreationCoverage.creationCoverageInventory(world, {
        kernelRecordId: kernelRecordId ? Number(kernelRecordId) : undefined
      })
    });
  })));

  app.post("/api/flows/creation/coverage", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ coverage: CreationFlow.confirmCoverageRows(world, await readJson<CreationFlow.CreationCoverageConfirmInput>(c)) }, 201)
  )));

  app.post("/api/flows/creation/coverage/link", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ coverage: CreationFlow.linkCoverageRowToSeeds(world, await readJson<CreationFlow.CreationCoverageLinkInput>(c)) })
  )));

  app.post("/api/flows/creation/coverage/defer", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ coverage: CreationFlow.deferCoverageRow(world, await readJson<CreationFlow.CreationCoverageDispositionInput>(c)) })
  )));

  app.post("/api/flows/creation/coverage/out-of-scope", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ coverage: CreationFlow.markCoverageRowOutOfScope(world, await readJson<CreationFlow.CreationCoverageDispositionInput>(c)) })
  )));

  app.post("/api/flows/creation/corrections", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(CreationFlow.correctParkedSeed(world, await readJson<CreationFlow.CreationCorrectionInput>(c)), 201)
  )));
};
