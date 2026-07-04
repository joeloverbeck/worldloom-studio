import * as CanonWorkbench from "../canon-workbench.js";
import { listQuery, tryRoute, withWorld, type RouteApp, type RouteDependencies } from "./route-support.js";

export const registerCanonWorkbenchRoutes = (app: RouteApp, dependencies: RouteDependencies): void => {
  app.get("/api/canon-workbench/current", (c) => withWorld(c, dependencies, (world) =>
    c.json(CanonWorkbench.currentCanon(world, {
      recordTypes: listQuery(c.req.query("recordType")),
      truthLayers: listQuery(c.req.query("truthLayer")),
      canonStatuses: listQuery(c.req.query("canonStatus")),
      consequenceModes: listQuery(c.req.query("consequenceMode")),
      continuityScope: c.req.query("continuityScope")?.trim() || undefined,
      openCanonDebt: c.req.query("openCanonDebt") === "true",
      q: c.req.query("q") ?? undefined,
      branchRelevant: c.req.query("branchRelevant") === "true"
    }))
  ));

  app.get("/api/canon-workbench/audit", (c) => withWorld(c, dependencies, (world) =>
    c.json(CanonWorkbench.auditTrail(world))
  ));

  app.get("/api/canon-workbench/records/:id", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json(CanonWorkbench.recordDetail(world, Number(c.req.param("id"))))
  )));
};
