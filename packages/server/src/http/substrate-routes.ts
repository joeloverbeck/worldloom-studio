import type { Context } from "hono";
import { APP_VERSION, LINK_TYPES, RECORD_TYPES, type HealthPayload } from "@worldloom/shared";
import type { ActiveWorldSession } from "../active-world-session.js";
import * as PromptOut from "../prompt-out.js";
import type { FacetInput, RecordInput } from "../world-file.js";
import { readJson, tryRoute, withWorld, type RouteApp, type RouteDependencies } from "./route-support.js";

type SetupErrorKind =
  | "missing_path"
  | "wrong_file"
  | "future_schema"
  | "integrity_failure"
  | "migration_or_backup_failure"
  | "filesystem_failure"
  | "open_failed";

const setupStatus = (activeWorldSession: ActiveWorldSession) => ({
  server: { reachable: true, version: APP_VERSION },
  catalog: { ready: true, recordTypeCount: RECORD_TYPES.length, linkTypeCount: LINK_TYPES.length },
  world: activeWorldSession.current
    ? { open: true as const, path: activeWorldSession.current.path }
    : { open: false as const },
  recentWorlds: activeWorldSession.recentWorlds()
});

const errorMessage = (error: unknown): string => error instanceof Error ? error.message : String(error);

const setupErrorKind = (message: string): SetupErrorKind => {
  if (/path is required|does not exist/i.test(message)) return "missing_path";
  if (/not a Worldloom world file/i.test(message)) return "wrong_file";
  if (/newer than this app/i.test(message)) return "future_schema";
  if (/integrity check failed|database disk image is malformed|file is not a database/i.test(message)) return "integrity_failure";
  if (/migration|backup|VACUUM INTO/i.test(message)) return "migration_or_backup_failure";
  if (/EACCES|EPERM|ENOENT|SQLITE_CANTOPEN|unable to open database|permission|directory/i.test(message)) return "filesystem_failure";
  return "open_failed";
};

const recoveryFor = (kind: SetupErrorKind): string => {
  switch (kind) {
    case "missing_path":
      return "Correct the path or choose a Worldloom world file that already exists.";
    case "wrong_file":
      return "Choose a Worldloom world file, or create a new one at a different path.";
    case "future_schema":
      return "Open this file with the newer app version that created it; do not migrate it with this version.";
    case "integrity_failure":
      return "Choose a backup copy before continuing; the selected file failed SQLite integrity checks.";
    case "migration_or_backup_failure":
      return "Check that the world file and its directory are writable before trying again.";
    case "filesystem_failure":
      return "Check the directory, file permissions, and path spelling before retrying.";
    case "open_failed":
      return "Correct the world-file prerequisite shown here, then retry create or open.";
  }
};

const setupFailure = (
  c: Context,
  activeWorldSession: ActiveWorldSession,
  action: "create" | "open",
  path: string,
  error: unknown
) => {
  const message = errorMessage(error);
  const kind = setupErrorKind(message);
  return c.json({
    error: message,
    setupError: {
      action,
      path,
      kind,
      message,
      recovery: recoveryFor(kind)
    },
    setupStatus: setupStatus(activeWorldSession)
  }, 400);
};

export const registerSubstrateRoutes = (app: RouteApp, dependencies: RouteDependencies): void => {
  const { activeWorldSession } = dependencies;

  app.get("/api/health", (c) => c.json({ ok: true, version: APP_VERSION } satisfies HealthPayload));
  app.get("/api/catalog", (c) => c.json({ recordTypes: RECORD_TYPES, linkTypes: LINK_TYPES }));
  app.get("/api/recent-worlds", (c) => c.json({ recentWorlds: activeWorldSession.recentWorlds() }));
  app.get("/api/setup/status", (c) => c.json(setupStatus(activeWorldSession)));

  app.post("/api/worlds/create", async (c) => {
    const input = await readJson<{ path: string }>(c);
    try {
      const worldFile = activeWorldSession.create(input.path);
      return c.json({
        path: worldFile.path,
        world: { open: true, path: worldFile.path },
        records: worldFile.listRecords(),
        setupStatus: setupStatus(activeWorldSession)
      }, 201);
    } catch (error) {
      return setupFailure(c, activeWorldSession, "create", input.path, error);
    }
  });

  app.post("/api/worlds/open", async (c) => {
    const input = await readJson<{ path: string }>(c);
    try {
      const worldFile = activeWorldSession.open(input.path);
      return c.json({
        path: worldFile.path,
        world: { open: true, path: worldFile.path },
        records: worldFile.listRecords(),
        setupStatus: setupStatus(activeWorldSession)
      });
    } catch (error) {
      return setupFailure(c, activeWorldSession, "open", input.path, error);
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
