import * as ContradictionFlow from "../contradiction-flow.js";
import { readJson, tryRoute, withWorld, type RouteApp, type RouteDependencies } from "./route-support.js";

export const registerContradictionRoutes = (app: RouteApp, dependencies: RouteDependencies): void => {
  app.post("/api/contradiction/runs/start", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ flow: ContradictionFlow.startContradictionRun(world, await readJson<{ sourceRecordId?: number; implicatedRecordIds?: number[]; title?: string }>(c)) }, 201)
  )));

  app.get("/api/contradiction/runs/:id", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json(ContradictionFlow.getContradictionRun(world, Number(c.req.param("id"))))
  )));

  app.post("/api/contradiction/triage", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ triage: ContradictionFlow.recordContradictionTriage(world, await readJson<{ flowId: number; stepKey: string; body: string }>(c)) }, 201)
  )));

  app.post("/api/contradiction/scale", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ scale: ContradictionFlow.declareContradictionWorkScale(world, await readJson<{ flowId: number; workScale: string }>(c)) }, 201)
  )));

  app.post("/api/contradiction/disposition", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ disposition: ContradictionFlow.setContradictionDisposition(world, await readJson<{ flowId: number; disposition: string; note?: string }>(c)) }, 201)
  )));

  app.post("/api/contradiction/repairs", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ repairs: ContradictionFlow.recordContradictionRepair(world, await readJson<{ flowId: number; operations: string[]; repairText: string }>(c)) }, 201)
  )));

  app.post("/api/contradiction/repair-targets", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ target: ContradictionFlow.addContradictionRepairTarget(world, await readJson<{ flowId: number; recordId: number; nextCanonStatus: string; newTitle?: string; newBody?: string; note?: string; advisoryRecordId?: number }>(c)) }, 201)
  )));

  app.post("/api/contradiction/propose-fact", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(ContradictionFlow.proposeFactFromContradiction(world, await readJson<{ flowId: number; title: string; body: string; truthLayer: string }>(c)), 201)
  )));

  app.post("/api/contradiction/retcon-costs", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ costs: ContradictionFlow.recordContradictionRetconCosts(world, await readJson<{ flowId: number; retconType: string; costs: Array<{ cost: string; text: string }> }>(c)) }, 201)
  )));

  app.post("/api/contradiction/repair-propagation", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ propagation: ContradictionFlow.setContradictionRepairPropagation(world, await readJson<{ flowId: number; action: "assign" | "decline"; debtName?: string; body?: string; admissionLevel?: string; workScale?: string; reason?: string }>(c)) }, 201)
  )));

  app.get("/api/contradiction/owed-boundaries", (c) => withWorld(c, dependencies, (world) =>
    c.json({ queue: ContradictionFlow.owedBoundariesQueue(world) })
  ));

  app.post("/api/contradiction/mystery-ledgers", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(ContradictionFlow.createMysteryLedgerEntry(world, await readJson<{
      propagationDispositionId?: number;
      ledgerRecordId?: number;
      title: string;
      protectedRecordId: number;
      propagationReportRecordId?: number;
      effectType: string;
      mysteryState: string;
      preservationBoundary: string;
      sections: Record<string, string>;
    }>(c)), 201)
  )));

  app.post("/api/contradiction/preservation-checklists", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ checklist: ContradictionFlow.completeMysteryPreservationChecklist(world, await readJson<{ flowId?: number; ledgerRecordId?: number; protectedRecordId?: number; operation: string; effectType: string; body: string; sacredGuardBody?: string }>(c)) }, 201)
  )));

  app.post("/api/contradiction/skip", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ record: ContradictionFlow.skipContradictionStep(world, await readJson<{ flowId?: number; stepKey: string; admissionLevel?: string; workScale?: string; reason?: string }>(c)) }, 201)
  )));

  app.post("/api/contradiction/runs/:id/close", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json(ContradictionFlow.closeContradictionRun(world, Number(c.req.param("id"))), 201)
  )));
};
