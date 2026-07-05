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
import type { RouteDependencies } from "./http/route-support.js";

interface AppOptions {
  token?: string;
}

const activeWorldSession = new ActiveWorldSession();

export const createApp = (options: AppOptions = {}) => {
  const app = new Hono();
  app.use("*", cors());

  app.use("/api/*", async (c, next) => {
    if (options.token && c.req.header("x-worldloom-token") !== options.token) {
      return c.json({ error: "Missing or invalid Worldloom token" }, 401);
    }
    await next();
  });

  const dependencies: RouteDependencies = { activeWorldSession };

  registerSubstrateRoutes(app, dependencies);
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
