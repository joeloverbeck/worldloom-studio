import type { Context, Hono } from "hono";
import type { ActiveWorldSession } from "../active-world-session.js";
import type { WorldFile } from "../world-file.js";

export type RouteApp = Hono;

export interface RouteDependencies {
  activeWorldSession: ActiveWorldSession;
}

export const readJson = async <T>(c: Context): Promise<T> => c.req.json() as Promise<T>;

export const listQuery = (value?: string): string[] =>
  value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];

export const badRequest = (c: Context, error: unknown): Response =>
  c.json({
    error: error instanceof Error ? error.message : String(error),
    ...(
      typeof error === "object" && error !== null && "decisionPoint" in error
        ? { decisionPoint: (error as { decisionPoint: unknown }).decisionPoint }
        : {}
    ),
    ...(
      typeof error === "object" && error !== null && "validationErrors" in error
        ? { validationErrors: (error as { validationErrors: unknown }).validationErrors }
        : {}
    ),
    ...(
      typeof error === "object" && error !== null && "attemptedInput" in error
        ? { attemptedInput: (error as { attemptedInput: unknown }).attemptedInput }
        : {}
    ),
    ...(
      typeof error === "object" && error !== null && "correctionContract" in error
        ? { correctionContract: (error as { correctionContract: unknown }).correctionContract }
        : {}
    ),
    ...(
      typeof error === "object" && error !== null && "authoritativeState" in error
        ? { authoritativeState: (error as { authoritativeState: unknown }).authoritativeState }
        : {}
    ),
    ...(
      typeof error === "object" && error !== null && "remediation" in error
        ? { remediation: (error as { remediation: unknown }).remediation }
        : {}
    )
  }, 400);

export const withWorld = (
  c: Context,
  dependencies: RouteDependencies,
  route: (world: WorldFile) => Response | Promise<Response>
): Response | Promise<Response> => {
  if (!dependencies.activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
  return route(dependencies.activeWorldSession.current);
};

export const tryRoute = async (
  c: Context,
  route: () => Response | Promise<Response>
): Promise<Response> => {
  try {
    return await route();
  } catch (error) {
    return badRequest(c, error);
  }
};
