import * as CanonDebt from "../canon-debt.js";
import { readJson, tryRoute, withWorld, type RouteApp, type RouteDependencies } from "./route-support.js";

const registerCanonDebtSurface = (app: RouteApp, pathPrefix: "/api/canon-debt" | "/api/admission/debt", dependencies: RouteDependencies): void => {
  app.get(pathPrefix, (c) => withWorld(c, dependencies, (world) =>
    c.json({ debt: CanonDebt.listCanonDebt(world, c.req.query("open") === "true") })
  ));

  app.post(pathPrefix, async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ debt: CanonDebt.createCanonDebt(world, await readJson<{ name: string; scope: string; assignee: string; body?: string }>(c)) }, 201)
  )));

  app.post(`${pathPrefix}/:id/close`, (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json({ debt: CanonDebt.closeCanonDebt(world, Number(c.req.param("id"))) })
  )));
};

export const registerCanonDebtRoutes = (app: RouteApp, dependencies: RouteDependencies): void => {
  registerCanonDebtSurface(app, "/api/canon-debt", dependencies);
  registerCanonDebtSurface(app, "/api/admission/debt", dependencies);
};
