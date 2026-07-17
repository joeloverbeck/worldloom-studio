import * as InstitutionalFlow from "../institutional-flow.js";
import type { ResolveSourceSelectionInput } from "../guided-flow-source-selection.js";
import { readJson, tryRoute, withWorld, type RouteApp, type RouteDependencies } from "./route-support.js";

export const registerStage12Routes = (app: RouteApp, dependencies: RouteDependencies): void => {
  app.post("/api/institutional/source-selection/resolve", async (c) => withWorld(c, dependencies, async (world) =>
    c.json(InstitutionalFlow.resolveStage12SourceSelection(world, await readJson<ResolveSourceSelectionInput>(c)))
  ));

  app.post("/api/institutional/runs/start", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(InstitutionalFlow.startStage12Run(world, await readJson<InstitutionalFlow.StartStage12RunInput>(c)), 201)
  )));

  app.get("/api/institutional/runs/:id", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json(InstitutionalFlow.getStage12Run(world, Number(c.req.param("id"))))
  )));

  app.post("/api/institutional/coverage", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(InstitutionalFlow.saveStage12Coverage(world, await readJson<{ flowId: number; lensKey: string; body: string }>(c)), 201)
  )));

  app.post("/api/institutional/cards", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(InstitutionalFlow.createOrLinkStage12Card(world, await readJson<{
      flowId: number;
      cardTypeKey: "action_arena" | "institution" | "counter_institution";
      existingRecordId?: number;
      title?: string;
      body?: string;
      lensKey?: string;
      relation?: string;
      advisoryRecordId?: number;
    }>(c)), 201)
  )));

  app.post("/api/institutional/proposals", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(InstitutionalFlow.proposeFactFromStage12(world, await readJson<{
      flowId: number;
      lensKey: string;
      title: string;
      body: string;
      truthLayer: string;
      advisoryRecordId?: number;
    }>(c)), 201)
  )));

  app.post("/api/institutional/debt", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(InstitutionalFlow.mintStage12Debt(world, await readJson<{
      flowId: number;
      lensKey: string;
      name: string;
      reason: string;
      severityOrConsequenceMode?: string;
      advisoryRecordId?: number;
    }>(c)), 201)
  )));

  app.post("/api/institutional/advisory-artifacts", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(InstitutionalFlow.storeStage12Advisory(world, await readJson<{
      flowId: number;
      stepKey: string;
      promptText: string;
      responseText: string;
    }>(c)), 201)
  )));

  app.post("/api/institutional/skips", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(InstitutionalFlow.skipStage12Step(world, await readJson<{
      flowId: number;
      stepKey: string;
      admissionLevel?: string;
      workScale?: string;
      reason?: string;
      unresolved?: boolean;
      debtName?: string;
      existingDebtRecordId?: number;
    }>(c)), 201)
  )));

  app.post("/api/institutional/runs/:id/close", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json(InstitutionalFlow.closeStage12Run(world, Number(c.req.param("id"))), 201)
  )));
};
