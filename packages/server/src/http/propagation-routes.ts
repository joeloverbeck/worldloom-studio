import * as PropagationFlow from "../propagation-flow.js";
import { readJson, tryRoute, withWorld, type RouteApp, type RouteDependencies } from "./route-support.js";

export const registerPropagationRoutes = (app: RouteApp, dependencies: RouteDependencies): void => {
  app.get("/api/propagation/queue", (c) => withWorld(c, dependencies, (world) =>
    c.json({ queue: PropagationFlow.propagationQueue(world) })
  ));

  app.get("/api/propagation/records/:id/plan", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json({ plan: PropagationFlow.propagationPlan(world, Number(c.req.param("id"))) })
  )));

  app.post("/api/propagation/runs/start", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ flow: PropagationFlow.startPropagationRun(world, await readJson<{ factRecordId?: number; debtRecordId?: number }>(c)) }, 201)
  )));

  app.get("/api/propagation/runs/:id", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json(PropagationFlow.getPropagationRun(world, Number(c.req.param("id"))))
  )));

  app.post("/api/propagation/consequences", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ consequence: PropagationFlow.addPropagationConsequence(world, await readJson<{ flowId: number; orderKey: string; domainName?: string; body: string; pressure?: "normal" | "high" }>(c)) }, 201)
  )));

  app.post("/api/propagation/domains", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ domain: PropagationFlow.recordPropagationDomain(world, await readJson<{ flowId: number; domainName: string; triage: "direct" | "dependency" | "reaction" | "negative"; declaration?: string }>(c)) }, 201)
  )));

  app.post("/api/propagation/dispositions", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ disposition: PropagationFlow.dispositionPropagationConsequence(world, await readJson<{ consequenceId: number; disposition: string; note?: string; debtName?: string; preservationBoundary?: string }>(c)) }, 201)
  )));

  app.post("/api/propagation/propose-fact", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(PropagationFlow.proposeFactFromPropagation(world, await readJson<{ flowId: number; title: string; body: string; truthLayer: string }>(c)), 201)
  )));

  app.post("/api/propagation/skip", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ record: PropagationFlow.skipPropagationStep(world, await readJson<{ flowId?: number; stepKey: string; admissionLevel?: string; workScale?: string; reason?: string }>(c)) }, 201)
  )));

  app.post("/api/propagation/runs/:id/close", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json(PropagationFlow.closePropagationRun(world, Number(c.req.param("id"))), 201)
  )));

  app.post("/api/propagation/reports/:id/corrections", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ report: PropagationFlow.correctPropagationReport(world, { originalReportId: Number(c.req.param("id")), ...(await readJson<{ title?: string; body: string }>(c)) }) }, 201)
  )));
};
