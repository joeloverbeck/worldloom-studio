import * as TemporalFlow from "../temporal-flow.js";
import type { ResolveSourceSelectionInput } from "../guided-flow-source-selection.js";
import { readJson, tryRoute, withWorld, type RouteApp, type RouteDependencies } from "./route-support.js";

export const registerTemporalRoutes = (app: RouteApp, dependencies: RouteDependencies): void => {
  app.post("/api/temporal/source-selection/resolve", async (c) => withWorld(c, dependencies, async (world) =>
    c.json(TemporalFlow.resolveTemporalSourceSelection(world, await readJson<ResolveSourceSelectionInput>(c)))
  ));

  app.post("/api/temporal/runs/start", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(TemporalFlow.startTemporalRun(world, await readJson<TemporalFlow.StartTemporalRunInput>(c)), 201)
  )));

  app.get("/api/temporal/runs/:id", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json(TemporalFlow.getTemporalRun(world, Number(c.req.param("id"))))
  )));

  app.post("/api/temporal/coverage", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(TemporalFlow.saveTemporalCoverage(world, await readJson<TemporalFlow.SaveTemporalCoverageInput>(c)), 201)
  )));

  app.post("/api/temporal/runs/:id/revisions", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(TemporalFlow.reviseTemporalCoverage(world, {
      ...(await readJson<Omit<TemporalFlow.ReviseTemporalCoverageInput, "flowId">>(c)),
      flowId: Number(c.req.param("id"))
    }), 201)
  )));

  app.post("/api/temporal/runs/:id/preview", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json(TemporalFlow.previewTemporalClose(world, Number(c.req.param("id"))))
  )));

  app.post("/api/temporal/runs/:id/recover", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json(TemporalFlow.recoverTemporalRun(world, Number(c.req.param("id"))))
  )));

  app.post("/api/temporal/cards", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(TemporalFlow.createOrLinkTemporalCard(world, await readJson<{
      flowId: number;
      existingRecordId?: number;
      title?: string;
      body?: string;
      truthLayer?: string;
      canonStatus?: string;
      relation?: string;
      advisoryRecordId?: number;
    }>(c)), 201)
  )));

  app.post("/api/temporal/proposals", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(TemporalFlow.proposeFactFromTemporalRun(world, await readJson<{
      flowId: number;
      sourceStep: string;
      title: string;
      body: string;
      truthLayer?: string;
      advisoryRecordId?: number;
    }>(c)), 201)
  )));

  app.post("/api/temporal/debt", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(TemporalFlow.mintTemporalDebt(world, await readJson<{
      flowId: number;
      sourceStep: string;
      name: string;
      reason: string;
      advisoryRecordId?: number;
    }>(c)), 201)
  )));

  app.post("/api/temporal/runs/:id/close", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json(TemporalFlow.closeTemporalRun(world, Number(c.req.param("id"))), 201)
  )));
};
