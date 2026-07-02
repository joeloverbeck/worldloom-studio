import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

let tempDirs: string[] = [];

const tempPath = (name: string) => {
  const dir = mkdtempSync(join(tmpdir(), "worldloom-api-"));
  tempDirs.push(dir);
  return join(dir, name);
};

afterEach(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs = [];
});

describe("HTTP API", () => {
  it("creates a world, edits generic records, links them, searches, and snapshots", async () => {
    const app = createApp();
    const path = tempPath("api-world.sqlite");

    const created = await app.request("/api/worlds/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path })
    });
    expect(created.status).toBe(201);

    const first = await app.request("/api/records", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ recordTypeKey: "canon_fact", title: "Glass road", body: "Visible only at noon" })
    });
    expect(first.status).toBe(201);
    const firstJson = await first.json() as { record: { id: number } };

    const second = await app.request("/api/records", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ recordTypeKey: "constraint", title: "Noon crossing", body: "The road closes at dusk" })
    });
    expect(second.status).toBe(201);
    const secondJson = await second.json() as { record: { id: number } };

    const link = await app.request("/api/links", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fromRecordId: secondJson.record.id, toRecordId: firstJson.record.id, linkTypeKey: "constrains" })
    });
    expect(link.status).toBe(201);

    const search = await app.request("/api/search?q=Glass");
    expect(search.status).toBe(200);
    expect(await search.json()).toMatchObject({ records: [{ id: firstJson.record.id }] });

    const snapshot = await app.request("/api/worlds/snapshot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}"
    });
    expect(snapshot.status).toBe(200);
    expect(await snapshot.json()).toMatchObject({ path: expect.stringContaining("snapshot") });
  });
});
