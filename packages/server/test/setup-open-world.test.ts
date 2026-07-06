import { mkdtempSync, rmSync } from "node:fs";
import { readFileSync } from "node:fs";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import Database from "better-sqlite3";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { APPLICATION_ID } from "../src/schema.js";

let tempDirs: string[] = [];

const tempPath = (name: string) => {
  const dir = mkdtempSync(join(tmpdir(), "worldloom-setup-"));
  tempDirs.push(dir);
  return join(dir, name);
};

const json = async <T,>(response: Response): Promise<T> => response.json() as Promise<T>;

beforeEach(() => {
  process.env.WORLDLOOM_CONFIG_DIR = tempPath("config");
});

afterEach(() => {
  delete process.env.WORLDLOOM_CONFIG_DIR;
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs = [];
});

describe("setup/open-world HTTP API", () => {
  it("serves startup dependencies without requiring or advertising a browser token", async () => {
    const app = createApp({ token: "legacy-token" });

    expect((await app.request("/api/health")).status).toBe(200);
    expect((await app.request("/api/catalog", {
      headers: { "x-worldloom-token": "stale-browser-token" }
    })).status).toBe(200);

    const indexSource = readFileSync(new URL("../src/index.ts", import.meta.url), "utf8");
    expect(indexSource).not.toContain("WORLDLOOM_TOKEN");
    expect(indexSource).not.toContain("randomBytes");
    expect(indexSource).not.toContain("createApp({ token");
  });

  it("creates and opens worlds without a token while returning setup status and recent worlds", async () => {
    const app = createApp({ token: "legacy-token" });
    const path = tempPath("tokenless-world.sqlite");

    expect(await json(await app.request("/api/setup/status"))).toMatchObject({
      server: { reachable: true, version: "0.0.0" },
      catalog: { ready: true },
      world: { open: false },
      recentWorlds: []
    });

    const created = await app.request("/api/worlds/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path })
    });
    expect(created.status).toBe(201);
    expect(await json(created)).toMatchObject({
      path,
      world: { open: true, path },
      setupStatus: {
        world: { open: true, path },
        recentWorlds: [expect.objectContaining({ path })]
      }
    });

    const reopened = await app.request("/api/worlds/open", {
      method: "POST",
      headers: { "content-type": "application/json", "x-worldloom-token": "leftover-token" },
      body: JSON.stringify({ path })
    });
    expect(reopened.status).toBe(200);
    expect(await json(reopened)).toMatchObject({
      path,
      world: { open: true, path },
      setupStatus: {
        recentWorlds: [expect.objectContaining({ path })]
      }
    });
  });

  it("classifies recoverable setup failures without opening a world", async () => {
    const app = createApp();

    const blankPath = await app.request("/api/worlds/open", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: "   " })
    });
    expect(blankPath.status).toBe(400);
    expect(await json(blankPath)).toMatchObject({
      setupError: {
        kind: "missing_path",
        message: expect.stringContaining("path is required"),
        recovery: expect.stringContaining("Correct the path")
      },
      setupStatus: { world: { open: false } }
    });

    const missing = await app.request("/api/worlds/open", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: tempPath("missing.sqlite") })
    });
    expect(missing.status).toBe(400);
    expect(await json(missing)).toMatchObject({
      setupError: {
        kind: "missing_path",
        message: expect.stringContaining("does not exist"),
        recovery: expect.stringContaining("Correct the path")
      },
      setupStatus: { world: { open: false } }
    });

    const wrongFilePath = tempPath("wrong-app.sqlite");
    const wrongFile = new Database(wrongFilePath);
    wrongFile.pragma("application_id = 123");
    wrongFile.pragma("user_version = 1");
    wrongFile.exec("CREATE TABLE wrong_app_marker (value TEXT) STRICT;");
    wrongFile.close();
    const wrongFileResponse = await app.request("/api/worlds/open", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: wrongFilePath })
    });
    expect(wrongFileResponse.status).toBe(400);
    expect(await json(wrongFileResponse)).toMatchObject({
      setupError: {
        kind: "wrong_file",
        message: "This is not a Worldloom world file",
        recovery: expect.stringContaining("Choose a Worldloom world file")
      },
      setupStatus: { world: { open: false } }
    });

    const corruptPath = tempPath("corrupt.sqlite");
    writeFileSync(corruptPath, "not sqlite", "utf8");
    const corruptResponse = await app.request("/api/worlds/open", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: corruptPath })
    });
    expect(corruptResponse.status).toBe(400);
    expect(await json(corruptResponse)).toMatchObject({
      setupError: {
        kind: "integrity_failure",
        recovery: expect.stringContaining("backup copy")
      },
      setupStatus: { world: { open: false } }
    });

    const futurePath = tempPath("future.sqlite");
    const future = new Database(futurePath);
    future.pragma(`application_id = ${APPLICATION_ID}`);
    future.pragma("user_version = 99");
    future.close();
    const futureResponse = await app.request("/api/worlds/open", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: futurePath })
    });
    expect(futureResponse.status).toBe(400);
    expect(await json(futureResponse)).toMatchObject({
      setupError: {
        kind: "future_schema",
        message: expect.stringContaining("newer than this app"),
        recovery: expect.stringContaining("newer app version")
      },
      setupStatus: { world: { open: false } }
    });
  });
});
