import * as QaFlow from "../qa-flow.js";
import { readJson, tryRoute, withWorld, type RouteApp, type RouteDependencies } from "./route-support.js";

export const registerQaRoutes = (app: RouteApp, dependencies: RouteDependencies): void => {
  app.post("/api/qa/passes/start", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(QaFlow.startQaPass(world, await readJson<{
      subjectType: "record" | "world";
      subjectRecordId?: number;
      title?: string;
    }>(c)), 201)
  )));

  app.get("/api/qa/passes/:id", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json(QaFlow.getQaPass(world, Number(c.req.param("id"))))
  )));

  app.post("/api/qa/scores", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(QaFlow.recordQaScore(world, await readJson<{
      flowId: number;
      testNumber: number;
      score: "0" | "1" | "2" | "3" | "na";
      naReason?: string;
      notes?: string;
      requiredRepair?: string;
      loadBearing?: boolean;
      repairRouted?: boolean;
    }>(c)), 201)
  )));

  app.post("/api/qa/profile", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(QaFlow.recordQaProfile(world, await readJson<{
      flowId: number;
      fields: QaFlow.QaProfileFields;
      recordLinkIds?: number[];
      debtLinkIds?: number[];
    }>(c)), 201)
  )));

  app.post("/api/qa/floor", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(QaFlow.recordQaFloor(world, await readJson<{
      flowId: number;
      conditions: QaFlow.QaFloorConditions;
      override?: boolean;
      overrideReason?: string;
      admissionLevel?: string;
      workScale?: string;
    }>(c)), 201)
  )));

  app.post("/api/qa/repairs", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(QaFlow.routeQaRepair(world, await readJson<{
      flowId: number;
      testNumber: number;
      repairKind: "fact" | "canon_debt";
      repairText: string;
      debtKind?: string;
      debtName?: string;
      candidate?: { title: string; body: string; truthLayer: string };
    }>(c)), 201)
  )));

  app.post("/api/qa/passes/:id/finalize", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json(QaFlow.finalizeQaPass(world, Number(c.req.param("id"))), 201)
  )));
};
