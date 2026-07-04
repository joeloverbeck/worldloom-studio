import * as AdmissionFlow from "../admission-flow.js";
import { readJson, tryRoute, withWorld, type RouteApp, type RouteDependencies } from "./route-support.js";

export const registerAdmissionRoutes = (app: RouteApp, dependencies: RouteDependencies): void => {
  app.get("/api/admission/queue", (c) => withWorld(c, dependencies, (world) =>
    c.json({ queue: AdmissionFlow.admissionQueue(world) })
  ));

  app.post("/api/admission/propose-draft/:id", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(AdmissionFlow.proposeDraftToAdmission(world, Number(c.req.param("id")), await readJson<{ title?: string; truthLayer: string }>(c)), 201)
  )));

  app.post("/api/admission/propose-record/:id", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json(AdmissionFlow.proposeRecordToAdmission(world, Number(c.req.param("id"))), 201)
  )));

  app.post("/api/admission/records/:id/severity", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(AdmissionFlow.declareAdmissionSeverity(world, Number(c.req.param("id")), await readJson<{ admissionLevel: string; workScale: string }>(c)))
  )));

  app.get("/api/admission/records/:id/gate", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json({ gate: AdmissionFlow.gateComposition(world, Number(c.req.param("id"))) })
  )));

  app.post("/api/admission/minor-batch", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(AdmissionFlow.admitMinorBatch(world, await readJson<{ source?: string; rows: Array<{ title: string; fact: string; scope: string; truthLayer: string; status: string; constraintTags?: string[]; operations: string[]; consequenceCheck: string }> }>(c)), 201)
  )));

  app.post("/api/admission/records/:id/start", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json({ flow: AdmissionFlow.startAdmissionGate(world, Number(c.req.param("id"))) }, 201)
  )));

  app.post("/api/admission/gate/complete", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(AdmissionFlow.completeAdmissionGate(world, await readJson<{
      recordId: number;
      title?: string;
      body?: string;
      truthLayer: string;
      canonStatus: string;
      constraintTags?: string[];
      operations: string[];
      consequenceText?: string;
      notApplicableReasons?: string[];
      quietDomainDeclarations?: string[];
      followUpDebt?: string;
      advisoryRecordId?: number;
    }>(c)), 201)
  )));

  app.post("/api/admission/seed-audit", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json(AdmissionFlow.runSeedAudit(world, await readJson<{ seedRecordIds: number[]; findings: string; decision: string }>(c)), 201)
  )));

  app.post("/api/admission/skip", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ record: AdmissionFlow.declineAdmissionInstrument(world, await readJson<{ recordId?: number; stepKey: string; admissionLevel?: string; workScale?: string; reason?: string }>(c)) }, 201)
  )));
};
