import * as ConditionalPassObligations from "../conditional-pass-obligations.js";
import { readJson, tryRoute, withWorld, type RouteApp, type RouteDependencies } from "./route-support.js";

export const registerConditionalPassObligationRoutes = (app: RouteApp, dependencies: RouteDependencies): void => {
  app.get("/api/conditional-pass-obligations", (c) => withWorld(c, dependencies, (world) =>
    c.json({ obligations: ConditionalPassObligations.listConditionalPassObligations(world) })
  ));

  app.post("/api/conditional-pass-obligations/:id/defer", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () => {
    const result = ConditionalPassObligations.deferConditionalPassObligation(world, {
      obligationId: Number(c.req.param("id")),
      ...(await readJson<{
        reason?: string;
        rationale?: string;
        disposition?: string;
        expectedDisposition?: string;
        passKey?: string;
        sourceFactRecordId?: number;
        propagationReportRecordId?: number;
      }>(c))
    });
    return c.json({ obligation: result.obligation }, result.created ? 201 : 200);
  })));

  app.post("/api/conditional-pass-obligations/:id/reinstate", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () => {
    const result = ConditionalPassObligations.reinstateConditionalPassObligation(world, {
      obligationId: Number(c.req.param("id")),
      ...(await readJson<{
        reason: string;
        disposition?: string;
        expectedDisposition?: string;
        passKey?: string;
        sourceFactRecordId?: number;
        propagationReportRecordId?: number;
      }>(c))
    });
    return c.json({ obligation: result.obligation }, result.created ? 201 : 200);
  })));
};
