import { APP_VERSION, LINK_TYPES, RECORD_TYPES, type HealthPayload } from "@worldloom/shared";
import * as PromptOut from "../prompt-out.js";
import type { FacetInput, RecordInput } from "../world-file.js";
import { badRequest, readJson, tryRoute, withWorld, type RouteApp, type RouteDependencies } from "./route-support.js";

export const registerSubstrateRoutes = (app: RouteApp, dependencies: RouteDependencies): void => {
  const { activeWorldSession } = dependencies;

  app.get("/api/health", (c) => c.json({ ok: true, version: APP_VERSION } satisfies HealthPayload));
  app.get("/api/catalog", (c) => c.json({ recordTypes: RECORD_TYPES, linkTypes: LINK_TYPES }));
  app.get("/api/recent-worlds", (c) => c.json({ recentWorlds: activeWorldSession.recentWorlds() }));

  app.post("/api/worlds/create", async (c) => {
    const input = await readJson<{ path: string }>(c);
    try {
      const worldFile = activeWorldSession.create(input.path);
      return c.json({ path: worldFile.path, records: worldFile.listRecords() }, 201);
    } catch (error) {
      return badRequest(c, error);
    }
  });

  app.post("/api/worlds/open", async (c) => {
    const input = await readJson<{ path: string }>(c);
    try {
      const worldFile = activeWorldSession.open(input.path);
      return c.json({ path: worldFile.path, records: worldFile.listRecords() });
    } catch (error) {
      return badRequest(c, error);
    }
  });

  app.post("/api/worlds/snapshot", async (c) => withWorld(c, dependencies, async (world) => {
    const input = await readJson<{ destinationPath?: string }>(c);
    return c.json({ path: world.snapshot(input.destinationPath) });
  }));

  app.post("/api/worlds/export/markdown", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () => {
    const input = await readJson<{ destinationPath: string }>(c);
    return c.json(world.exportWorldMarkdown(input.destinationPath));
  })));

  app.get("/api/vocabularies", (c) => withWorld(c, dependencies, (world) => c.json({ terms: world.vocabularies() })));

  app.get("/api/records", (c) => withWorld(c, dependencies, (world) => c.json({ records: world.listRecords() })));

  app.post("/api/records", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () => {
    const input = await readJson<RecordInput & { advisoryRecordId?: number }>(c);
    const { advisoryRecordId, ...recordInput } = input;
    return c.json({ record: PromptOut.createRecordWithExplicitAdvisoryUse(world, recordInput, advisoryRecordId) }, 201);
  })));

  app.patch("/api/records/:id", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ record: world.updateRecord(Number(c.req.param("id")), await readJson<Partial<RecordInput>>(c)) })
  )));

  app.post("/api/records/:id/promote", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () => {
    const input = await readJson<{ recordTypeKey: string }>(c);
    return c.json({ record: world.promoteRecord(Number(c.req.param("id")), input.recordTypeKey) });
  })));

  app.get("/api/records/:id/history", (c) => withWorld(c, dependencies, (world) =>
    c.json({ history: world.history(Number(c.req.param("id"))) })
  ));

  app.get("/api/records/:id/export/markdown", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json({ markdown: world.exportRecordMarkdown(Number(c.req.param("id"))) })
  )));

  app.get("/api/records/:id/facets", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () =>
    c.json({ facets: world.listFacets(Number(c.req.param("id"))) })
  )));

  app.post("/api/records/:id/facets", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ facet: world.addFacet(Number(c.req.param("id")), await readJson<FacetInput>(c)) }, 201)
  )));

  app.delete("/api/records/:id/facets/:facetId", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () => {
    world.removeFacet(Number(c.req.param("id")), Number(c.req.param("facetId")));
    return c.json({ ok: true });
  })));

  app.get("/api/section-headings", (c) => withWorld(c, dependencies, (world) =>
    c.json({ headings: world.sectionHeadings(c.req.query("recordTypeKey") || undefined) })
  ));

  app.get("/api/records/:id/sections", (c) => withWorld(c, dependencies, (world) =>
    c.json({ sections: world.listSections(Number(c.req.param("id"))) })
  ));

  app.put("/api/records/:id/sections", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () => {
    const input = await readJson<{ sections: Array<{ heading: string; body?: string; position: number }> }>(c);
    return c.json({ sections: world.replaceSections(Number(c.req.param("id")), input.sections) });
  })));

  app.get("/api/records/:id/section-history", (c) => withWorld(c, dependencies, (world) =>
    c.json({ history: world.sectionHistory(Number(c.req.param("id"))) })
  ));

  app.get("/api/drafts", (c) => withWorld(c, dependencies, (world) => c.json({ drafts: world.listDrafts() })));

  app.post("/api/drafts", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ draft: world.createDraft(await readJson<{ title: string; body?: string }>(c)) }, 201)
  )));

  app.patch("/api/drafts/:id", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ draft: world.updateDraft(Number(c.req.param("id")), await readJson<{ title?: string; body?: string }>(c)) })
  )));

  app.delete("/api/drafts/:id", (c) => withWorld(c, dependencies, (world) => tryRoute(c, () => {
    world.discardDraft(Number(c.req.param("id")));
    return c.json({ ok: true });
  })));

  app.post("/api/drafts/:id/convert", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () =>
    c.json({ record: world.convertDraft(Number(c.req.param("id")), await readJson<Omit<RecordInput, "title" | "body"> & { title?: string }>(c)) }, 201)
  )));

  app.get("/api/search", (c) => withWorld(c, dependencies, (world) =>
    c.json({ records: world.search(c.req.query("q") ?? "") })
  ));

  app.get("/api/links", (c) => withWorld(c, dependencies, (world) => {
    const recordId = c.req.query("recordId");
    return c.json({ links: world.listLinks(recordId ? Number(recordId) : undefined) });
  }));

  app.get("/api/links/traverse", (c) => withWorld(c, dependencies, (world) => {
    const recordId = Number(c.req.query("recordId"));
    const linkTypeKey = c.req.query("linkTypeKey") || undefined;
    return c.json({ links: world.traverse(recordId, linkTypeKey) });
  }));

  app.post("/api/links", async (c) => withWorld(c, dependencies, (world) => tryRoute(c, async () => {
    const input = await readJson<{ fromRecordId: number; toRecordId: number; linkTypeKey: string; note?: string }>(c);
    return c.json({ link: world.createLink(input.fromRecordId, input.toRecordId, input.linkTypeKey, input.note) }, 201);
  })));
};
