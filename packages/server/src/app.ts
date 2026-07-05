import { Hono } from "hono";
import { cors } from "hono/cors";
import { ActiveWorldSession } from "./active-world-session.js";
import { registerAdmissionRoutes } from "./http/admission-routes.js";
import { registerCanonDebtRoutes } from "./http/canon-debt-routes.js";
import { registerCanonWorkbenchRoutes } from "./http/canon-workbench-routes.js";
import { registerConstraintCompositionRoutes } from "./http/constraint-composition-routes.js";
import { registerContradictionRoutes } from "./http/contradiction-routes.js";
import { registerCreationRoutes } from "./http/creation-routes.js";
import { registerPromptOutRoutes } from "./http/prompt-out-routes.js";
import { registerPropagationRoutes } from "./http/propagation-routes.js";
import { registerQaRoutes } from "./http/qa-routes.js";
import { registerStage12Routes } from "./http/stage-12-routes.js";
import { registerSubstrateRoutes } from "./http/substrate-routes.js";
import { registerWorkflowMapRoutes } from "./http/workflow-map-routes.js";
import type { RouteDependencies } from "./http/route-support.js";

interface AppOptions {
  token?: string;
}

const localDevelopmentOrigins = [
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "http://127.0.0.1:5174",
  "http://localhost:5174"
];

export const createApp = (_options: AppOptions = {}) => {
  const activeWorldSession = new ActiveWorldSession();
  const app = new Hono();
  app.use("*", cors({ origin: localDevelopmentOrigins }));

  const dependencies: RouteDependencies = { activeWorldSession };

  registerSubstrateRoutes(app, dependencies);
  registerWorkflowMapRoutes(app, dependencies);
  registerPromptOutRoutes(app, dependencies);
  registerCreationRoutes(app, dependencies);
  registerAdmissionRoutes(app, dependencies);
  registerCanonDebtRoutes(app, dependencies);
  registerCanonWorkbenchRoutes(app, dependencies);
  registerPropagationRoutes(app, dependencies);
  registerStage12Routes(app, dependencies);
  registerConstraintCompositionRoutes(app, dependencies);
  registerContradictionRoutes(app, dependencies);
  registerQaRoutes(app, dependencies);

  return app;
};
