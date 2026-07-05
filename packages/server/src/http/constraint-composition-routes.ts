import * as ConstraintFlow from "../constraint-composition-flow.js";
import { readJson, tryRoute, withWorld, type RouteApp, type RouteDependencies } from "./route-support.js";

export const registerConstraintCompositionRoutes = (app: RouteApp, dependencies: RouteDependencies): void => {
  app.post("/api/constraint-composition/runs/start", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(ConstraintFlow.startConstraintRun(world, await readJson<ConstraintFlow.StartConstraintRunInput>(c)), 201)
  )));

  app.get("/api/constraint-composition/runs/:id", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json(ConstraintFlow.getConstraintRun(world, Number(c.req.param("id"))))
  )));

  app.post("/api/constraint-composition/inventory", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(ConstraintFlow.saveConstraintInventory(world, await readJson<ConstraintFlow.SaveConstraintInventoryInput>(c)), 201)
  )));

  app.post("/api/constraint-composition/composition", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(ConstraintFlow.saveConstraintComposition(world, await readJson<{ flowId: number; analysisType: string; body: string }>(c)), 201)
  )));

  app.post("/api/constraint-composition/leakage", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(ConstraintFlow.saveConstraintLeakage(world, await readJson<ConstraintFlow.SaveConstraintLeakageInput>(c)), 201)
  )));

  app.post("/api/constraint-composition/residue", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(ConstraintFlow.saveConstraintResidue(world, await readJson<ConstraintFlow.SaveConstraintResidueInput>(c)), 201)
  )));

  app.post("/api/constraint-composition/cards", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(ConstraintFlow.createOrLinkConstraintCard(world, await readJson<{
      flowId: number;
      existingRecordId?: number;
      inventoryId?: number;
      title?: string;
      body?: string;
      relation?: string;
      advisoryRecordId?: number;
    }>(c)), 201)
  )));

  app.post("/api/constraint-composition/proposals", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(ConstraintFlow.proposeFactFromConstraintRun(world, await readJson<{
      flowId: number;
      sourceStep: string;
      title: string;
      body: string;
      truthLayer: string;
      advisoryRecordId?: number;
    }>(c)), 201)
  )));

  app.post("/api/constraint-composition/debt", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(ConstraintFlow.mintConstraintDebt(world, await readJson<{
      flowId: number;
      sourceStep: string;
      name: string;
      reason: string;
      severityOrConsequenceMode?: string;
      advisoryRecordId?: number;
    }>(c)), 201)
  )));

  app.post("/api/constraint-composition/runs/:id/close", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json(ConstraintFlow.closeConstraintRun(world, Number(c.req.param("id"))), 201)
  )));
};
