import { Hono } from "hono";
import { cors } from "hono/cors";
import { APP_VERSION, LINK_TYPES, RECORD_TYPES, type HealthPayload } from "@worldloom/shared";
import { rememberWorld, listRecentWorlds } from "./recent-worlds.js";
import { WorldStore, type FacetInput, type RecordInput } from "./world-store.js";

interface AppOptions {
  token?: string;
}

let activeWorld: WorldStore | null = null;

const body = async <T>(c: { req: { json: () => Promise<T> } }): Promise<T> => c.req.json();

export const createApp = (options: AppOptions = {}) => {
  const app = new Hono();
  app.use("*", cors());

  app.use("/api/*", async (c, next) => {
    if (options.token && c.req.header("x-worldloom-token") !== options.token) {
      return c.json({ error: "Missing or invalid Worldloom token" }, 401);
    }
    await next();
  });

  app.get("/api/health", (c) => c.json({ ok: true, version: APP_VERSION } satisfies HealthPayload));
  app.get("/api/catalog", (c) => c.json({ recordTypes: RECORD_TYPES, linkTypes: LINK_TYPES }));
  app.get("/api/recent-worlds", (c) => c.json({ recentWorlds: listRecentWorlds() }));

  app.post("/api/worlds/create", async (c) => {
    const input = await body<{ path: string }>(c);
    try {
      activeWorld?.close();
      activeWorld = null;
      activeWorld = WorldStore.create(input.path);
      rememberWorld(activeWorld.path);
      return c.json({ path: activeWorld.path, records: activeWorld.listRecords() }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/worlds/open", async (c) => {
    const input = await body<{ path: string }>(c);
    try {
      activeWorld?.close();
      activeWorld = null;
      activeWorld = WorldStore.open(input.path);
      rememberWorld(activeWorld.path);
      return c.json({ path: activeWorld.path, records: activeWorld.listRecords() });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/worlds/snapshot", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    const input = await body<{ destinationPath?: string }>(c);
    return c.json({ path: activeWorld.snapshot(input.destinationPath) });
  });

  app.get("/api/vocabularies", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    return c.json({ terms: activeWorld.vocabularies() });
  });

  app.get("/api/records", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    return c.json({ records: activeWorld.listRecords() });
  });

  app.post("/api/records", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      const input = await body<RecordInput & { advisoryRecordId?: number }>(c);
      return c.json({ record: activeWorld.createRecordWithProvenance(input, input.advisoryRecordId) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.patch("/api/records/:id", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ record: activeWorld.updateRecord(Number(c.req.param("id")), await body<Partial<RecordInput>>(c)) });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/records/:id/promote", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      const input = await body<{ recordTypeKey: string }>(c);
      return c.json({ record: activeWorld.promoteRecord(Number(c.req.param("id")), input.recordTypeKey) });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/records/:id/history", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    return c.json({ history: activeWorld.history(Number(c.req.param("id"))) });
  });

  app.get("/api/records/:id/facets", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ facets: activeWorld.listFacets(Number(c.req.param("id"))) });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/records/:id/facets", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ facet: activeWorld.addFacet(Number(c.req.param("id")), await body<FacetInput>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.delete("/api/records/:id/facets/:facetId", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      activeWorld.removeFacet(Number(c.req.param("id")), Number(c.req.param("facetId")));
      return c.json({ ok: true });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/section-headings", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    return c.json({ headings: activeWorld.sectionHeadings(c.req.query("recordTypeKey") || undefined) });
  });

  app.get("/api/records/:id/sections", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    return c.json({ sections: activeWorld.listSections(Number(c.req.param("id"))) });
  });

  app.put("/api/records/:id/sections", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      const input = await body<{ sections: Array<{ heading: string; body?: string; position: number }> }>(c);
      return c.json({ sections: activeWorld.replaceSections(Number(c.req.param("id")), input.sections) });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/records/:id/section-history", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    return c.json({ history: activeWorld.sectionHistory(Number(c.req.param("id"))) });
  });

  app.get("/api/drafts", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    return c.json({ drafts: activeWorld.listDrafts() });
  });

  app.post("/api/drafts", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ draft: activeWorld.createDraft(await body<{ title: string; body?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.patch("/api/drafts/:id", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ draft: activeWorld.updateDraft(Number(c.req.param("id")), await body<{ title?: string; body?: string }>(c)) });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.delete("/api/drafts/:id", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      activeWorld.discardDraft(Number(c.req.param("id")));
      return c.json({ ok: true });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/drafts/:id/convert", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ record: activeWorld.convertDraft(Number(c.req.param("id")), await body<Omit<RecordInput, "title" | "body"> & { title?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/prompt-templates", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    return c.json({ templates: activeWorld.promptTemplates() });
  });

  app.patch("/api/prompt-templates/:key", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      const input = await body<{ text: string }>(c);
      return c.json({ template: activeWorld.updatePromptTemplate(c.req.param("key"), input.text) });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/prompt-templates/:key/revert", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ template: activeWorld.revertPromptTemplate(c.req.param("key")) });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/prompts/generate", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(activeWorld.generatePrompt(await body<{ templateKey: string; recordId?: number; stepKey?: string }>(c)));
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/advisory-artifacts", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ record: activeWorld.createAdvisoryArtifact(await body<{ stepKey: string; promptText: string; responseText: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/advisory-artifacts/:id/dispositions", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ disposition: activeWorld.disposeAdvisoryArtifact(Number(c.req.param("id")), await body<{ disposition: string; note?: string; standingRuling?: boolean }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/flows/creation/start", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    return c.json({ flow: activeWorld.startCreationFlow() }, 201);
  });

  app.post("/api/flows/creation/kernel-step", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(activeWorld.saveKernelStep(await body<{ flowId: number; heading: string; body: string; consequenceMode?: string }>(c)));
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/flows/creation/skip", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ record: activeWorld.recordSkip(await body<{ flowId?: number; stepKey: string; reason?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/flows/creation/decompose", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(activeWorld.decomposeSeeds(await body<{ flowId: number; kernelRecordId: number; draftIds?: number[]; seeds: Array<{ title: string; body: string; truthLayer: string; canonStatus: string }> }>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/admission/queue", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    return c.json({ queue: activeWorld.admissionQueue() });
  });

  app.post("/api/admission/propose-draft/:id", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(activeWorld.proposeDraftToAdmission(Number(c.req.param("id")), await body<{ title?: string; truthLayer: string }>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/admission/propose-record/:id", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(activeWorld.proposeRecordToAdmission(Number(c.req.param("id"))), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/admission/records/:id/severity", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(activeWorld.declareAdmissionSeverity(Number(c.req.param("id")), await body<{ admissionLevel: string; workScale: string }>(c)));
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/admission/records/:id/gate", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ gate: activeWorld.gateComposition(Number(c.req.param("id"))) });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/admission/minor-batch", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(activeWorld.admitMinorBatch(await body<{ source?: string; rows: Array<{ title: string; fact: string; scope: string; truthLayer: string; status: string; constraintTags?: string[]; operations: string[]; consequenceCheck: string }> }>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/admission/records/:id/start", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ flow: activeWorld.startAdmissionGate(Number(c.req.param("id"))) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/admission/gate/complete", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(activeWorld.completeAdmissionGate(await body<{
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
      }>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/admission/seed-audit", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(activeWorld.runSeedAudit(await body<{ seedRecordIds: number[]; findings: string; decision: string }>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/admission/skip", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ record: activeWorld.declineAdmissionInstrument(await body<{ recordId?: number; stepKey: string; admissionLevel?: string; workScale?: string; reason?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/admission/debt", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    return c.json({ debt: activeWorld.listCanonDebt(c.req.query("open") === "true") });
  });

  app.post("/api/admission/debt", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ debt: activeWorld.createCanonDebt(await body<{ name: string; scope: string; assignee: string; body?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/admission/debt/:id/close", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ debt: activeWorld.closeCanonDebt(Number(c.req.param("id"))) });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/propagation/queue", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    return c.json({ queue: activeWorld.propagationQueue() });
  });

  app.get("/api/propagation/records/:id/plan", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ plan: activeWorld.propagationPlan(Number(c.req.param("id"))) });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/propagation/runs/start", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ flow: activeWorld.startPropagationRun(await body<{ factRecordId: number; debtRecordId?: number }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/propagation/runs/:id", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(activeWorld.getPropagationRun(Number(c.req.param("id"))));
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/propagation/consequences", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ consequence: activeWorld.addPropagationConsequence(await body<{ flowId: number; orderKey: string; domainName?: string; body: string; pressure?: "normal" | "high" }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/propagation/domains", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ domain: activeWorld.recordPropagationDomain(await body<{ flowId: number; domainName: string; triage: "direct" | "dependency" | "reaction" | "negative"; declaration?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/propagation/dispositions", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ disposition: activeWorld.dispositionPropagationConsequence(await body<{ consequenceId: number; disposition: string; note?: string; debtName?: string; preservationBoundary?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/propagation/propose-fact", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(activeWorld.proposeFactFromPropagation(await body<{ flowId: number; title: string; body: string; truthLayer: string }>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/propagation/skip", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ record: activeWorld.skipPropagationStep(await body<{ flowId?: number; stepKey: string; admissionLevel?: string; workScale?: string; reason?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/propagation/runs/:id/close", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(activeWorld.closePropagationRun(Number(c.req.param("id"))), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/propagation/reports/:id/corrections", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ report: activeWorld.correctPropagationReport({ originalReportId: Number(c.req.param("id")), ...(await body<{ title?: string; body: string }>(c)) }) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/contradiction/runs/start", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ flow: activeWorld.startContradictionRun(await body<{ sourceRecordId?: number; implicatedRecordIds?: number[]; title?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/contradiction/runs/:id", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(activeWorld.getContradictionRun(Number(c.req.param("id"))));
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/contradiction/triage", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ triage: activeWorld.recordContradictionTriage(await body<{ flowId: number; stepKey: string; body: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/contradiction/scale", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ scale: activeWorld.declareContradictionWorkScale(await body<{ flowId: number; workScale: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/contradiction/disposition", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ disposition: activeWorld.setContradictionDisposition(await body<{ flowId: number; disposition: string; note?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/contradiction/repairs", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ repairs: activeWorld.recordContradictionRepair(await body<{ flowId: number; operations: string[]; repairText: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/contradiction/repair-targets", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ target: activeWorld.addContradictionRepairTarget(await body<{ flowId: number; recordId: number; nextCanonStatus: string; newTitle?: string; newBody?: string; note?: string; advisoryRecordId?: number }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/contradiction/propose-fact", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(activeWorld.proposeFactFromContradiction(await body<{ flowId: number; title: string; body: string; truthLayer: string }>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/contradiction/retcon-costs", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ costs: activeWorld.recordContradictionRetconCosts(await body<{ flowId: number; retconType: string; costs: Array<{ cost: string; text: string }> }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/contradiction/repair-propagation", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ propagation: activeWorld.setContradictionRepairPropagation(await body<{ flowId: number; action: "assign" | "decline"; debtName?: string; body?: string; admissionLevel?: string; workScale?: string; reason?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/contradiction/owed-boundaries", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    return c.json({ queue: activeWorld.owedBoundariesQueue() });
  });

  app.post("/api/contradiction/mystery-ledgers", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(activeWorld.createMysteryLedgerEntry(await body<{
        propagationDispositionId?: number;
        ledgerRecordId?: number;
        title: string;
        protectedRecordId: number;
        propagationReportRecordId?: number;
        effectType: string;
        mysteryState: string;
        preservationBoundary: string;
        sections: Record<string, string>;
      }>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/contradiction/preservation-checklists", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ checklist: activeWorld.completeMysteryPreservationChecklist(await body<{ flowId?: number; ledgerRecordId?: number; protectedRecordId?: number; operation: string; effectType: string; body: string; sacredGuardBody?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/contradiction/skip", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ record: activeWorld.skipContradictionStep(await body<{ flowId?: number; stepKey: string; admissionLevel?: string; workScale?: string; reason?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/contradiction/runs/:id/close", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(activeWorld.closeContradictionRun(Number(c.req.param("id"))), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/search", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    return c.json({ records: activeWorld.search(c.req.query("q") ?? "") });
  });

  app.get("/api/links", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    const recordId = c.req.query("recordId");
    return c.json({ links: activeWorld.listLinks(recordId ? Number(recordId) : undefined) });
  });

  app.get("/api/links/traverse", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    const recordId = Number(c.req.query("recordId"));
    const linkTypeKey = c.req.query("linkTypeKey") || undefined;
    return c.json({ links: activeWorld.traverse(recordId, linkTypeKey) });
  });

  app.post("/api/links", async (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    try {
      const input = await body<{ fromRecordId: number; toRecordId: number; linkTypeKey: string; note?: string }>(c);
      return c.json({ link: activeWorld.createLink(input.fromRecordId, input.toRecordId, input.linkTypeKey, input.note) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  return app;
};
