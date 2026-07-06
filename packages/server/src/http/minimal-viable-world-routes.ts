import * as MinimalViableWorld from "../minimal-viable-world.js";
import { readJson, tryRoute, withWorld, type RouteApp, type RouteDependencies } from "./route-support.js";

export const registerMinimalViableWorldRoutes = (app: RouteApp, dependencies: RouteDependencies): void => {
  app.get("/api/flows/creation/minimal-viable-world", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json(MinimalViableWorld.checkpointState(world))
  )));

  app.post("/api/flows/creation/minimal-viable-world/dispositions", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(MinimalViableWorld.recordDispositions(world, await readJson<{
      reportId?: number;
      dispositions: MinimalViableWorld.MinimalViableWorldDispositionInput[];
    }>(c)), 201)
  )));

  app.post("/api/flows/creation/minimal-viable-world/admission-proposals", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(MinimalViableWorld.routeAdmissionProposal(world, await readJson<{
      reportId: number;
      seedRecordId?: number;
      title: string;
      body: string;
      truthLayer: string;
      advisoryRecordId?: number;
    }>(c)), 201)
  )));
};
