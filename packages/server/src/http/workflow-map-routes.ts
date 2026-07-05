import * as WorkflowMap from "../workflow-map.js";
import { withWorld, type RouteApp, type RouteDependencies } from "./route-support.js";

export const registerWorkflowMapRoutes = (app: RouteApp, dependencies: RouteDependencies): void => {
  app.get("/api/workflow-map", (c) => withWorld(c, dependencies, (world) =>
    c.json(WorkflowMap.workflowMap(world))
  ));
};
