import { Hono } from "hono";
import { cors } from "hono/cors";
import { LINK_TYPES, RECORD_TYPES } from "@worldloom/shared";
import { rememberWorld, listRecentWorlds } from "./recent-worlds.js";
import { WorldStore, type RecordInput } from "./world-store.js";

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

  app.get("/api/health", (c) => c.json({ ok: true }));
  app.get("/api/catalog", (c) => c.json({ recordTypes: RECORD_TYPES, linkTypes: LINK_TYPES }));
  app.get("/api/recent-worlds", (c) => c.json({ recentWorlds: listRecentWorlds() }));

  app.post("/api/worlds/create", async (c) => {
    const input = await body<{ path: string }>(c);
    activeWorld?.close();
    activeWorld = WorldStore.create(input.path);
    rememberWorld(activeWorld.path);
    return c.json({ path: activeWorld.path, records: activeWorld.listRecords() }, 201);
  });

  app.post("/api/worlds/open", async (c) => {
    const input = await body<{ path: string }>(c);
    activeWorld?.close();
    activeWorld = WorldStore.open(input.path);
    rememberWorld(activeWorld.path);
    return c.json({ path: activeWorld.path, records: activeWorld.listRecords() });
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
      return c.json({ record: activeWorld.createRecord(await body<RecordInput>(c)) }, 201);
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

  app.get("/api/records/:id/history", (c) => {
    if (!activeWorld) return c.json({ error: "No world is open" }, 409);
    return c.json({ history: activeWorld.history(Number(c.req.param("id"))) });
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
