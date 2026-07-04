import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string): string => readFileSync(new URL(path, import.meta.url), "utf8");

describe("HTTP route registry ownership", () => {
  it("keeps substrate route declarations in the substrate route module", () => {
    const appSource = source("../src/app.ts");
    const substrateSource = source("../src/http/substrate-routes.ts");

    expect(appSource).toContain("registerSubstrateRoutes(app, dependencies)");
    expect(substrateSource).toContain('app.post("/api/worlds/create"');
    expect(substrateSource).toContain('app.get("/api/records"');
    expect(substrateSource).toContain('app.get("/api/search"');
    expect(substrateSource).toContain('app.post("/api/links"');

    expect(appSource).not.toContain('app.post("/api/worlds/create"');
    expect(appSource).not.toContain('app.get("/api/records"');
    expect(appSource).not.toContain('app.get("/api/search"');
    expect(appSource).not.toContain('app.post("/api/links"');
  });

  it("keeps Prompt-out, canon-debt, and Canon Workbench route declarations in owning modules", () => {
    const appSource = source("../src/app.ts");
    const promptOutSource = source("../src/http/prompt-out-routes.ts");
    const canonDebtSource = source("../src/http/canon-debt-routes.ts");
    const canonWorkbenchSource = source("../src/http/canon-workbench-routes.ts");

    expect(appSource).toContain("registerPromptOutRoutes(app, dependencies)");
    expect(appSource).toContain("registerCanonDebtRoutes(app, dependencies)");
    expect(appSource).toContain("registerCanonWorkbenchRoutes(app, dependencies)");

    expect(promptOutSource).toContain('app.get("/api/prompt-templates"');
    expect(promptOutSource).toContain('app.post("/api/prompt-out/skip"');
    expect(canonDebtSource).toContain('registerCanonDebtSurface(app, "/api/canon-debt"');
    expect(canonDebtSource).toContain('registerCanonDebtSurface(app, "/api/admission/debt"');
    expect(canonWorkbenchSource).toContain('app.get("/api/canon-workbench/current"');

    expect(appSource).not.toContain('app.get("/api/prompt-templates"');
    expect(appSource).not.toContain('app.post("/api/prompt-out/skip"');
    expect(appSource).not.toContain('app.get("/api/canon-debt"');
    expect(appSource).not.toContain('app.get("/api/admission/debt"');
    expect(appSource).not.toContain('app.get("/api/canon-workbench/current"');
  });

  it("keeps Flow route declarations in owning route modules and app registration explicit", () => {
    const appSource = source("../src/app.ts");
    const creationSource = source("../src/http/creation-routes.ts");
    const admissionSource = source("../src/http/admission-routes.ts");
    const propagationSource = source("../src/http/propagation-routes.ts");
    const stage12Source = source("../src/http/stage-12-routes.ts");
    const contradictionSource = source("../src/http/contradiction-routes.ts");
    const qaSource = source("../src/http/qa-routes.ts");

    const registrationOrder = [
      "registerSubstrateRoutes(app, dependencies)",
      "registerPromptOutRoutes(app, dependencies)",
      "registerCreationRoutes(app, dependencies)",
      "registerAdmissionRoutes(app, dependencies)",
      "registerCanonDebtRoutes(app, dependencies)",
      "registerCanonWorkbenchRoutes(app, dependencies)",
      "registerPropagationRoutes(app, dependencies)",
      "registerStage12Routes(app, dependencies)",
      "registerContradictionRoutes(app, dependencies)",
      "registerQaRoutes(app, dependencies)"
    ];
    const indexes = registrationOrder.map((call) => appSource.indexOf(call));
    expect(indexes.every((index) => index >= 0)).toBe(true);
    expect([...indexes].sort((a, b) => a - b)).toEqual(indexes);

    expect(creationSource).toContain('app.post("/api/flows/creation/start"');
    expect(admissionSource).toContain('app.get("/api/admission/queue"');
    expect(propagationSource).toContain('app.get("/api/propagation/queue"');
    expect(stage12Source).toContain('app.post("/api/institutional/runs/start"');
    expect(contradictionSource).toContain('app.post("/api/contradiction/runs/start"');
    expect(qaSource).toContain('app.post("/api/qa/passes/start"');

    expect(appSource).not.toContain('app.post("/api/flows/creation/start"');
    expect(appSource).not.toContain('app.get("/api/admission/queue"');
    expect(appSource).not.toContain('app.get("/api/propagation/queue"');
    expect(appSource).not.toContain('app.post("/api/institutional/runs/start"');
    expect(appSource).not.toContain('app.post("/api/contradiction/runs/start"');
    expect(appSource).not.toContain('app.post("/api/qa/passes/start"');
  });
});
