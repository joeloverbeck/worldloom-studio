import { Hono } from "hono";
import { cors } from "hono/cors";
import { APP_VERSION, LINK_TYPES, RECORD_TYPES, type HealthPayload } from "@worldloom/shared";
import { ActiveWorldSession } from "./active-world-session.js";
import type { FacetInput, RecordInput } from "./world-file.js";
import * as AdmissionFlow from "./admission-flow.js";
import * as CanonWorkbench from "./canon-workbench.js";
import * as CanonDebt from "./canon-debt.js";
import * as ContradictionFlow from "./contradiction-flow.js";
import * as CreationFlow from "./creation-flow.js";
import * as InstitutionalFlow from "./institutional-flow.js";
import * as PromptOut from "./prompt-out.js";
import * as PropagationFlow from "./propagation-flow.js";
import * as QaFlow from "./qa-flow.js";

interface AppOptions {
  token?: string;
}

const activeWorldSession = new ActiveWorldSession();

const body = async <T>(c: { req: { json: () => Promise<T> } }): Promise<T> => c.req.json();

const listQuery = (value?: string): string[] =>
  value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];

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
  app.get("/api/recent-worlds", (c) => c.json({ recentWorlds: activeWorldSession.recentWorlds() }));

  app.post("/api/worlds/create", async (c) => {
    const input = await body<{ path: string }>(c);
    try {
      const worldFile = activeWorldSession.create(input.path);
      return c.json({ path: worldFile.path, records: worldFile.listRecords() }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/worlds/open", async (c) => {
    const input = await body<{ path: string }>(c);
    try {
      const worldFile = activeWorldSession.open(input.path);
      return c.json({ path: worldFile.path, records: worldFile.listRecords() });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/worlds/snapshot", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    const input = await body<{ destinationPath?: string }>(c);
    return c.json({ path: activeWorldSession.current.snapshot(input.destinationPath) });
  });

  app.post("/api/worlds/export/markdown", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      const input = await body<{ destinationPath: string }>(c);
      return c.json(activeWorldSession.current.exportWorldMarkdown(input.destinationPath));
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/vocabularies", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    return c.json({ terms: activeWorldSession.current.vocabularies() });
  });

  app.get("/api/records", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    return c.json({ records: activeWorldSession.current.listRecords() });
  });

  app.post("/api/records", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      const input = await body<RecordInput & { advisoryRecordId?: number }>(c);
      const { advisoryRecordId, ...recordInput } = input;
      return c.json({ record: PromptOut.createRecordWithExplicitAdvisoryUse(activeWorldSession.current, recordInput, advisoryRecordId) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.patch("/api/records/:id", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ record: activeWorldSession.current.updateRecord(Number(c.req.param("id")), await body<Partial<RecordInput>>(c)) });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/records/:id/promote", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      const input = await body<{ recordTypeKey: string }>(c);
      return c.json({ record: activeWorldSession.current.promoteRecord(Number(c.req.param("id")), input.recordTypeKey) });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/records/:id/history", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    return c.json({ history: activeWorldSession.current.history(Number(c.req.param("id"))) });
  });

  app.get("/api/records/:id/export/markdown", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ markdown: activeWorldSession.current.exportRecordMarkdown(Number(c.req.param("id"))) });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/records/:id/facets", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ facets: activeWorldSession.current.listFacets(Number(c.req.param("id"))) });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/records/:id/facets", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ facet: activeWorldSession.current.addFacet(Number(c.req.param("id")), await body<FacetInput>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.delete("/api/records/:id/facets/:facetId", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      activeWorldSession.current.removeFacet(Number(c.req.param("id")), Number(c.req.param("facetId")));
      return c.json({ ok: true });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/section-headings", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    return c.json({ headings: activeWorldSession.current.sectionHeadings(c.req.query("recordTypeKey") || undefined) });
  });

  app.get("/api/records/:id/sections", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    return c.json({ sections: activeWorldSession.current.listSections(Number(c.req.param("id"))) });
  });

  app.put("/api/records/:id/sections", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      const input = await body<{ sections: Array<{ heading: string; body?: string; position: number }> }>(c);
      return c.json({ sections: activeWorldSession.current.replaceSections(Number(c.req.param("id")), input.sections) });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/records/:id/section-history", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    return c.json({ history: activeWorldSession.current.sectionHistory(Number(c.req.param("id"))) });
  });

  app.get("/api/drafts", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    return c.json({ drafts: activeWorldSession.current.listDrafts() });
  });

  app.post("/api/drafts", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ draft: activeWorldSession.current.createDraft(await body<{ title: string; body?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.patch("/api/drafts/:id", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ draft: activeWorldSession.current.updateDraft(Number(c.req.param("id")), await body<{ title?: string; body?: string }>(c)) });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.delete("/api/drafts/:id", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      activeWorldSession.current.discardDraft(Number(c.req.param("id")));
      return c.json({ ok: true });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/drafts/:id/convert", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ record: activeWorldSession.current.convertDraft(Number(c.req.param("id")), await body<Omit<RecordInput, "title" | "body"> & { title?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/prompt-templates", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    return c.json({ templates: PromptOut.listPromptTemplates(activeWorldSession.current) });
  });

  app.patch("/api/prompt-templates/:key", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      const input = await body<{ text: string }>(c);
      return c.json({ template: PromptOut.updatePromptTemplate(activeWorldSession.current, c.req.param("key"), input.text) });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/prompt-templates/:key/revert", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ template: PromptOut.revertPromptTemplate(activeWorldSession.current, c.req.param("key")) });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/prompts/generate", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      const result = PromptOut.generatePrompt(activeWorldSession.current, await body<{ templateKey: string; recordId?: number; stepKey?: string }>(c));
      return c.json({ prompt: result.prompt });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/advisory-artifacts", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ record: PromptOut.storeAdvisoryResponse(activeWorldSession.current, await body<{ stepKey: string; promptText: string; responseText: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/advisory-artifacts/:id/dispositions", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ disposition: PromptOut.disposeAdvisoryArtifact(activeWorldSession.current, Number(c.req.param("id")), await body<{ disposition: string; note?: string; standingRuling?: boolean }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/prompt-out/generate", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(PromptOut.generatePrompt(activeWorldSession.current, await body<{
        flowKey?: string;
        flowId?: number;
        templateKey: string;
        recordId?: number;
        stepKey?: string;
      }>(c)));
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/prompt-out/advisory-artifacts", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ record: PromptOut.storeAdvisoryResponse(activeWorldSession.current, await body<{
        flowKey?: string;
        flowId?: number;
        stepKey: string;
        promptText: string;
        responseText: string;
      }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/prompt-out/advisory-artifacts/:id/dispositions", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ disposition: PromptOut.disposeAdvisoryArtifact(activeWorldSession.current, Number(c.req.param("id")), await body<{ disposition: string; note?: string; standingRuling?: boolean }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/prompt-out/skip", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      const input = await body<{
        flowKey: string;
        flowId?: number;
        recordId?: number;
        stepKey: string;
        admissionLevel?: string;
        workScale?: string;
        reason?: string;
      }>(c);
      if (input.flowKey === "creation") {
        return c.json({ record: CreationFlow.recordCreationSkip(activeWorldSession.current, input) }, 201);
      }
      if (input.flowKey === "admission") {
        return c.json({ record: AdmissionFlow.declineAdmissionInstrument(activeWorldSession.current, input) }, 201);
      }
      if (input.flowKey === "propagation") {
        return c.json({ record: PropagationFlow.skipPropagationStep(activeWorldSession.current, input) }, 201);
      }
      if (input.flowKey === "contradiction") {
        return c.json({ record: ContradictionFlow.skipContradictionStep(activeWorldSession.current, input) }, 201);
      }
      if (input.flowKey === "qa") {
        return c.json({ record: QaFlow.skipQaStep(activeWorldSession.current, input) }, 201);
      }
      if (input.flowKey === InstitutionalFlow.FLOW_KEY) {
        return c.json(InstitutionalFlow.skipStage12Step(activeWorldSession.current, { ...input, flowId: input.flowId ?? 0 }), 201);
      }
      return c.json({ record: PromptOut.recordPromptOutSkip(activeWorldSession.current, input) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/flows/creation/start", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    return c.json({ flow: CreationFlow.startCreationFlow(activeWorldSession.current) }, 201);
  });

  app.post("/api/flows/creation/kernel-step", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(CreationFlow.saveKernelStep(activeWorldSession.current, await body<{ flowId: number; heading: string; body: string; consequenceMode?: string }>(c)));
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/flows/creation/skip", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ record: CreationFlow.recordCreationSkip(activeWorldSession.current, await body<{ flowId?: number; stepKey: string; reason?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/flows/creation/decompose", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(CreationFlow.decomposeSeeds(activeWorldSession.current, await body<{ flowId: number; kernelRecordId: number; draftIds?: number[]; seeds: Array<{ title: string; body: string; truthLayer: string; canonStatus: string }> }>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/admission/queue", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    return c.json({ queue: AdmissionFlow.admissionQueue(activeWorldSession.current) });
  });

  app.post("/api/admission/propose-draft/:id", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(AdmissionFlow.proposeDraftToAdmission(activeWorldSession.current, Number(c.req.param("id")), await body<{ title?: string; truthLayer: string }>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/admission/propose-record/:id", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(AdmissionFlow.proposeRecordToAdmission(activeWorldSession.current, Number(c.req.param("id"))), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/admission/records/:id/severity", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(AdmissionFlow.declareAdmissionSeverity(activeWorldSession.current, Number(c.req.param("id")), await body<{ admissionLevel: string; workScale: string }>(c)));
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/admission/records/:id/gate", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ gate: AdmissionFlow.gateComposition(activeWorldSession.current, Number(c.req.param("id"))) });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/admission/minor-batch", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(AdmissionFlow.admitMinorBatch(activeWorldSession.current, await body<{ source?: string; rows: Array<{ title: string; fact: string; scope: string; truthLayer: string; status: string; constraintTags?: string[]; operations: string[]; consequenceCheck: string }> }>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/admission/records/:id/start", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ flow: AdmissionFlow.startAdmissionGate(activeWorldSession.current, Number(c.req.param("id"))) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/admission/gate/complete", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(AdmissionFlow.completeAdmissionGate(activeWorldSession.current, await body<{
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
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(AdmissionFlow.runSeedAudit(activeWorldSession.current, await body<{ seedRecordIds: number[]; findings: string; decision: string }>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/admission/skip", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ record: AdmissionFlow.declineAdmissionInstrument(activeWorldSession.current, await body<{ recordId?: number; stepKey: string; admissionLevel?: string; workScale?: string; reason?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/canon-debt", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    return c.json({ debt: CanonDebt.listCanonDebt(activeWorldSession.current, c.req.query("open") === "true") });
  });

  app.post("/api/canon-debt", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ debt: CanonDebt.createCanonDebt(activeWorldSession.current, await body<{ name: string; scope: string; assignee: string; body?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/canon-debt/:id/close", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ debt: CanonDebt.closeCanonDebt(activeWorldSession.current, Number(c.req.param("id"))) });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/admission/debt", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    return c.json({ debt: CanonDebt.listCanonDebt(activeWorldSession.current, c.req.query("open") === "true") });
  });

  app.post("/api/admission/debt", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ debt: CanonDebt.createCanonDebt(activeWorldSession.current, await body<{ name: string; scope: string; assignee: string; body?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/admission/debt/:id/close", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ debt: CanonDebt.closeCanonDebt(activeWorldSession.current, Number(c.req.param("id"))) });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/canon-workbench/current", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    return c.json(CanonWorkbench.currentCanon(activeWorldSession.current, {
      recordTypes: listQuery(c.req.query("recordType")),
      truthLayers: listQuery(c.req.query("truthLayer")),
      canonStatuses: listQuery(c.req.query("canonStatus")),
      consequenceModes: listQuery(c.req.query("consequenceMode")),
      continuityScope: c.req.query("continuityScope")?.trim() || undefined,
      openCanonDebt: c.req.query("openCanonDebt") === "true",
      q: c.req.query("q") ?? undefined,
      branchRelevant: c.req.query("branchRelevant") === "true"
    }));
  });

  app.get("/api/canon-workbench/audit", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    return c.json(CanonWorkbench.auditTrail(activeWorldSession.current));
  });

  app.get("/api/canon-workbench/records/:id", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(CanonWorkbench.recordDetail(activeWorldSession.current, Number(c.req.param("id"))));
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/propagation/queue", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    return c.json({ queue: PropagationFlow.propagationQueue(activeWorldSession.current) });
  });

  app.get("/api/propagation/records/:id/plan", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ plan: PropagationFlow.propagationPlan(activeWorldSession.current, Number(c.req.param("id"))) });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/propagation/runs/start", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ flow: PropagationFlow.startPropagationRun(activeWorldSession.current, await body<{ factRecordId: number; debtRecordId?: number }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/propagation/runs/:id", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(PropagationFlow.getPropagationRun(activeWorldSession.current, Number(c.req.param("id"))));
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/propagation/consequences", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ consequence: PropagationFlow.addPropagationConsequence(activeWorldSession.current, await body<{ flowId: number; orderKey: string; domainName?: string; body: string; pressure?: "normal" | "high" }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/propagation/domains", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ domain: PropagationFlow.recordPropagationDomain(activeWorldSession.current, await body<{ flowId: number; domainName: string; triage: "direct" | "dependency" | "reaction" | "negative"; declaration?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/propagation/dispositions", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ disposition: PropagationFlow.dispositionPropagationConsequence(activeWorldSession.current, await body<{ consequenceId: number; disposition: string; note?: string; debtName?: string; preservationBoundary?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/propagation/propose-fact", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(PropagationFlow.proposeFactFromPropagation(activeWorldSession.current, await body<{ flowId: number; title: string; body: string; truthLayer: string }>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/propagation/skip", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ record: PropagationFlow.skipPropagationStep(activeWorldSession.current, await body<{ flowId?: number; stepKey: string; admissionLevel?: string; workScale?: string; reason?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/propagation/runs/:id/close", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(PropagationFlow.closePropagationRun(activeWorldSession.current, Number(c.req.param("id"))), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/propagation/reports/:id/corrections", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ report: PropagationFlow.correctPropagationReport(activeWorldSession.current, { originalReportId: Number(c.req.param("id")), ...(await body<{ title?: string; body: string }>(c)) }) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/institutional/runs/start", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(InstitutionalFlow.startStage12Run(activeWorldSession.current, await body<InstitutionalFlow.StartStage12RunInput>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/institutional/runs/:id", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(InstitutionalFlow.getStage12Run(activeWorldSession.current, Number(c.req.param("id"))));
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/institutional/coverage", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(InstitutionalFlow.saveStage12Coverage(activeWorldSession.current, await body<{ flowId: number; lensKey: string; body: string }>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/institutional/cards", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(InstitutionalFlow.createOrLinkStage12Card(activeWorldSession.current, await body<{
        flowId: number;
        cardTypeKey: "action_arena" | "institution" | "counter_institution";
        existingRecordId?: number;
        title?: string;
        body?: string;
        lensKey?: string;
        relation?: string;
        advisoryRecordId?: number;
      }>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/institutional/proposals", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(InstitutionalFlow.proposeFactFromStage12(activeWorldSession.current, await body<{
        flowId: number;
        lensKey: string;
        title: string;
        body: string;
        truthLayer: string;
        advisoryRecordId?: number;
      }>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/institutional/debt", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(InstitutionalFlow.mintStage12Debt(activeWorldSession.current, await body<{
        flowId: number;
        lensKey: string;
        name: string;
        reason: string;
        severityOrConsequenceMode?: string;
        advisoryRecordId?: number;
      }>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/institutional/advisory-artifacts", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(InstitutionalFlow.storeStage12Advisory(activeWorldSession.current, await body<{
        flowId: number;
        stepKey: string;
        promptText: string;
        responseText: string;
      }>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/institutional/skips", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(InstitutionalFlow.skipStage12Step(activeWorldSession.current, await body<{
        flowId: number;
        stepKey: string;
        admissionLevel?: string;
        workScale?: string;
        reason?: string;
        unresolved?: boolean;
        debtName?: string;
        existingDebtRecordId?: number;
      }>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/institutional/runs/:id/close", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(InstitutionalFlow.closeStage12Run(activeWorldSession.current, Number(c.req.param("id"))), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/contradiction/runs/start", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ flow: ContradictionFlow.startContradictionRun(activeWorldSession.current, await body<{ sourceRecordId?: number; implicatedRecordIds?: number[]; title?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/contradiction/runs/:id", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(ContradictionFlow.getContradictionRun(activeWorldSession.current, Number(c.req.param("id"))));
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/contradiction/triage", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ triage: ContradictionFlow.recordContradictionTriage(activeWorldSession.current, await body<{ flowId: number; stepKey: string; body: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/contradiction/scale", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ scale: ContradictionFlow.declareContradictionWorkScale(activeWorldSession.current, await body<{ flowId: number; workScale: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/contradiction/disposition", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ disposition: ContradictionFlow.setContradictionDisposition(activeWorldSession.current, await body<{ flowId: number; disposition: string; note?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/contradiction/repairs", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ repairs: ContradictionFlow.recordContradictionRepair(activeWorldSession.current, await body<{ flowId: number; operations: string[]; repairText: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/contradiction/repair-targets", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ target: ContradictionFlow.addContradictionRepairTarget(activeWorldSession.current, await body<{ flowId: number; recordId: number; nextCanonStatus: string; newTitle?: string; newBody?: string; note?: string; advisoryRecordId?: number }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/contradiction/propose-fact", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(ContradictionFlow.proposeFactFromContradiction(activeWorldSession.current, await body<{ flowId: number; title: string; body: string; truthLayer: string }>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/contradiction/retcon-costs", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ costs: ContradictionFlow.recordContradictionRetconCosts(activeWorldSession.current, await body<{ flowId: number; retconType: string; costs: Array<{ cost: string; text: string }> }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/contradiction/repair-propagation", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ propagation: ContradictionFlow.setContradictionRepairPropagation(activeWorldSession.current, await body<{ flowId: number; action: "assign" | "decline"; debtName?: string; body?: string; admissionLevel?: string; workScale?: string; reason?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/contradiction/owed-boundaries", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    return c.json({ queue: ContradictionFlow.owedBoundariesQueue(activeWorldSession.current) });
  });

  app.post("/api/contradiction/mystery-ledgers", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(ContradictionFlow.createMysteryLedgerEntry(activeWorldSession.current, await body<{
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
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ checklist: ContradictionFlow.completeMysteryPreservationChecklist(activeWorldSession.current, await body<{ flowId?: number; ledgerRecordId?: number; protectedRecordId?: number; operation: string; effectType: string; body: string; sacredGuardBody?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/contradiction/skip", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json({ record: ContradictionFlow.skipContradictionStep(activeWorldSession.current, await body<{ flowId?: number; stepKey: string; admissionLevel?: string; workScale?: string; reason?: string }>(c)) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/contradiction/runs/:id/close", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(ContradictionFlow.closeContradictionRun(activeWorldSession.current, Number(c.req.param("id"))), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/qa/passes/start", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(QaFlow.startQaPass(activeWorldSession.current, await body<{
        subjectType: "record" | "world";
        subjectRecordId?: number;
        title?: string;
      }>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/qa/passes/:id", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(QaFlow.getQaPass(activeWorldSession.current, Number(c.req.param("id"))));
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/qa/scores", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(QaFlow.recordQaScore(activeWorldSession.current, await body<{
        flowId: number;
        testNumber: number;
        score: "0" | "1" | "2" | "3" | "na";
        naReason?: string;
        notes?: string;
        requiredRepair?: string;
        loadBearing?: boolean;
        repairRouted?: boolean;
      }>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/qa/profile", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(QaFlow.recordQaProfile(activeWorldSession.current, await body<{
        flowId: number;
        fields: QaFlow.QaProfileFields;
        recordLinkIds?: number[];
        debtLinkIds?: number[];
      }>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/qa/floor", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(QaFlow.recordQaFloor(activeWorldSession.current, await body<{
        flowId: number;
        conditions: QaFlow.QaFloorConditions;
        override?: boolean;
        overrideReason?: string;
        admissionLevel?: string;
        workScale?: string;
      }>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/qa/repairs", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(QaFlow.routeQaRepair(activeWorldSession.current, await body<{
        flowId: number;
        testNumber: number;
        repairKind: "fact" | "canon_debt";
        repairText: string;
        debtKind?: string;
        debtName?: string;
        candidate?: { title: string; body: string; truthLayer: string };
      }>(c)), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.post("/api/qa/passes/:id/finalize", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      return c.json(QaFlow.finalizeQaPass(activeWorldSession.current, Number(c.req.param("id"))), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  app.get("/api/search", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    return c.json({ records: activeWorldSession.current.search(c.req.query("q") ?? "") });
  });

  app.get("/api/links", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    const recordId = c.req.query("recordId");
    return c.json({ links: activeWorldSession.current.listLinks(recordId ? Number(recordId) : undefined) });
  });

  app.get("/api/links/traverse", (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    const recordId = Number(c.req.query("recordId"));
    const linkTypeKey = c.req.query("linkTypeKey") || undefined;
    return c.json({ links: activeWorldSession.current.traverse(recordId, linkTypeKey) });
  });

  app.post("/api/links", async (c) => {
    if (!activeWorldSession.current) return c.json({ error: "No world is open" }, 409);
    try {
      const input = await body<{ fromRecordId: number; toRecordId: number; linkTypeKey: string; note?: string }>(c);
      return c.json({ link: activeWorldSession.current.createLink(input.fromRecordId, input.toRecordId, input.linkTypeKey, input.note) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : String(error) }, 400);
    }
  });

  return app;
};
