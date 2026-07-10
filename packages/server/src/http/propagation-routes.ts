import * as PropagationFlow from "../propagation-flow.js";
import { readJson, tryRoute, withWorld, type RouteApp, type RouteDependencies } from "./route-support.js";

export const registerPropagationRoutes = (app: RouteApp, dependencies: RouteDependencies): void => {
  app.get("/api/propagation/queue", (c) => withWorld(c, dependencies, (world) =>
    c.json({ queue: PropagationFlow.propagationQueue(world) })
  ));

  app.get("/api/propagation/records/:id/plan", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json({ plan: PropagationFlow.propagationPlan(world, Number(c.req.param("id"))) })
  )));

  app.post("/api/propagation/runs/start", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () => {
    const flow = PropagationFlow.startPropagationRun(world, await readJson<{ factRecordId?: number; debtRecordId?: number }>(c)) as { id: number };
    return c.json(PropagationFlow.getPropagationRun(world, flow.id), 201);
  })));

  app.get("/api/propagation/runs/active", (c) => withWorld(c, dependencies, (world) =>
    c.json({ run: PropagationFlow.getActivePropagationRun(world) })
  ));

  app.get("/api/propagation/runs/:id", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json(PropagationFlow.getPropagationRun(world, Number(c.req.param("id"))))
  )));

  app.post("/api/propagation/consequences", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () => {
    const input = await readJson<{ flowId: number; orderKey: string; domainName?: string; body: string; pressure?: "normal" | "high" }>(c);
    const consequence = PropagationFlow.addPropagationConsequence(world, input);
    return c.json({ ...(PropagationFlow.getPropagationRun(world, input.flowId) as Record<string, unknown>), consequence }, 201);
  })));

  app.post("/api/propagation/consequences/:id/revisions", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(PropagationFlow.revisePropagationConsequence(world, {
      consequenceId: Number(c.req.param("id")),
      ...(await readJson<{ flowId: number; reason: string; orderKey: string; domainName?: string; body: string; pressure?: "normal" | "high" }>(c))
    }), 201)
  )));

  app.post("/api/propagation/consequences/:id/retract", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(PropagationFlow.retractPropagationConsequence(world, {
      consequenceId: Number(c.req.param("id")),
      ...(await readJson<{ flowId: number; reason: string }>(c))
    }), 201)
  )));

  app.post("/api/propagation/domains", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () => {
    const input = await readJson<{ flowId: number; domainName: string; triage: "direct" | "dependency" | "reaction" | "negative"; declaration?: string }>(c);
    const domain = PropagationFlow.recordPropagationDomain(world, input);
    return c.json({ ...(PropagationFlow.getPropagationRun(world, input.flowId) as Record<string, unknown>), domain }, 201);
  })));

  app.post("/api/propagation/domains/:id/revisions", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(PropagationFlow.revisePropagationDomain(world, {
      domainId: Number(c.req.param("id")),
      ...(await readJson<{ flowId: number; reason: string; triage: "direct" | "dependency" | "reaction" | "negative"; declaration?: string }>(c))
    }), 201)
  )));

  app.post("/api/propagation/domains/:id/retract", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(PropagationFlow.retractPropagationDomain(world, {
      domainId: Number(c.req.param("id")),
      ...(await readJson<{ flowId: number; reason: string }>(c))
    }), 201)
  )));

  app.post("/api/propagation/dispositions", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () => {
    const input = await readJson<{ consequenceId: number; disposition: string; note?: string; debtName?: string; preservationBoundary?: string }>(c);
    const disposition = PropagationFlow.dispositionPropagationConsequence(world, input);
    return c.json({ ...(PropagationFlow.getPropagationRun(world, disposition.flowId) as Record<string, unknown>), disposition }, 201);
  })));

  app.post("/api/propagation/propose-fact", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () => {
    const input = await readJson<{ flowId: number; title: string; body: string; truthLayer: string }>(c);
    const result = PropagationFlow.proposeFactFromPropagation(world, input);
    return c.json({ ...(PropagationFlow.getPropagationRun(world, input.flowId) as Record<string, unknown>), ...result }, 201);
  })));

  app.post("/api/propagation/skip", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () => {
    const input = await readJson<{ flowId?: number; stepKey: string; mode?: "proposal" | "pressure"; activeSetRevision?: number; admissionLevel?: string; workScale?: string; reason?: string }>(c);
    const record = PropagationFlow.skipPropagationStep(world, input);
    return c.json(input.flowId == null
      ? { record }
      : { ...(PropagationFlow.getPropagationRun(world, input.flowId) as Record<string, unknown>), record }, 201);
  })));

  app.post("/api/propagation/runs/:id/close", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () => {
    const flowId = Number(c.req.param("id"));
    const result = PropagationFlow.closePropagationRun(world, flowId);
    return c.json({ ...(PropagationFlow.getPropagationRun(world, flowId) as Record<string, unknown>), ...result }, 201);
  })));

  app.post("/api/propagation/reports/:id/corrections", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ report: PropagationFlow.correctPropagationReport(world, { originalReportId: Number(c.req.param("id")), ...(await readJson<{ title?: string; body: string }>(c)) }) }, 201)
  )));
};
