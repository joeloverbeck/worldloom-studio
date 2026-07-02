import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { RECORD_TYPES } from "@worldloom/shared";
import { createApp } from "../src/app.js";

let tempDirs: string[] = [];

const tempPath = (name: string) => {
  const dir = mkdtempSync(join(tmpdir(), "worldloom-api-"));
  tempDirs.push(dir);
  return join(dir, name);
};

const explicitJudgment = {
  truthLayer: "Objective canon",
  canonStatus: "proposed"
};

const json = async <T,>(response: Response): Promise<T> => response.json() as Promise<T>;

afterEach(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs = [];
});

describe("HTTP API", () => {
  it("serves typed health data and requires explicit judgment fields for records", async () => {
    const app = createApp();
    const health = await app.request("/api/health");
    expect(await json(health)).toMatchObject({ ok: true, version: "0.0.0" });

    const path = tempPath("api-world.sqlite");
    expect((await app.request("/api/worlds/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path })
    })).status).toBe(201);

    const missingJudgment = await app.request("/api/records", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ recordTypeKey: "canon_fact", title: "Glass road", body: "Visible only at noon" })
    });
    expect(missingJudgment.status).toBe(400);
    expect(await json(missingJudgment)).toMatchObject({ error: expect.stringContaining("explicit steward choices") });

    const failedOpen = await app.request("/api/worlds/open", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: tempPath("missing.sqlite") })
    });
    expect(failedOpen.status).toBe(400);
    expect((await app.request("/api/records")).status).toBe(409);
  });

  it("creates every generic record type, edits cards, preserves reports, links, traverses, searches, promotes, and snapshots", async () => {
    const app = createApp();
    const path = tempPath("api-world.sqlite");
    const snapshotPath = tempPath("api-snapshot.sqlite");

    const created = await app.request("/api/worlds/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path })
    });
    expect(created.status).toBe(201);

    const catalog = await json<{ recordTypes: typeof RECORD_TYPES }> (await app.request("/api/catalog"));
    expect(catalog.recordTypes.map((recordType) => recordType.key)).toEqual(RECORD_TYPES.map((recordType) => recordType.key));

    const createdRecords: Array<{ id: number; recordTypeKey: string; shortId: string }> = [];
    for (const recordType of RECORD_TYPES) {
      const response = await app.request("/api/records", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          recordTypeKey: recordType.key,
          title: recordType.key === "canon_fact" ? `${recordType.label} Glass road` : `${recordType.label} surface`,
          body: recordType.key === "canon_fact" ? "Visible only at noon" : "Methodology surface",
          ...explicitJudgment
        })
      });
      expect(response.status, recordType.key).toBe(201);
      createdRecords.push((await json<{ record: { id: number; recordTypeKey: string; shortId: string } }>(response)).record);
    }

    const firstJson = { record: createdRecords.find((record) => record.recordTypeKey === "canon_fact")! };
    const secondJson = { record: createdRecords.find((record) => record.recordTypeKey === "constraint")! };
    const reportJson = { record: createdRecords.find((record) => record.recordTypeKey === "propagation_report")! };

    const edited = await app.request(`/api/records/${firstJson.record.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body: "Glass road renamed into the noon bridge" })
    });
    expect(edited.status).toBe(200);

    const reportEdit = await app.request(`/api/records/${reportJson.record.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body: "Changed report" })
    });
    expect(reportEdit.status).toBe(400);
    expect(await json(reportEdit)).toMatchObject({ error: expect.stringContaining("append-only") });

    const link = await app.request("/api/links", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fromRecordId: secondJson.record.id, toRecordId: firstJson.record.id, linkTypeKey: "constrains" })
    });
    expect(link.status).toBe(201);

    const chain = await app.request("/api/links", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fromRecordId: reportJson.record.id, toRecordId: secondJson.record.id, linkTypeKey: "constrains" })
    });
    expect(chain.status).toBe(201);

    const traversal = await app.request(`/api/links/traverse?recordId=${reportJson.record.id}&linkTypeKey=constrains`);
    expect(await json(traversal)).toMatchObject({ links: [{ depth: 1 }, { depth: 2 }] });

    const search = await app.request("/api/search?q=Glass");
    expect(search.status).toBe(200);
    expect(await search.json()).toMatchObject({ records: [{ id: firstJson.record.id }] });

    const promoted = await app.request(`/api/records/${secondJson.record.id}/promote`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ recordTypeKey: "canon_fact" })
    });
    expect(promoted.status).toBe(200);
    expect(await json(promoted)).toMatchObject({ record: { id: secondJson.record.id, recordTypeKey: "canon_fact" } });

    const snapshot = await app.request("/api/worlds/snapshot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ destinationPath: snapshotPath })
    });
    expect(snapshot.status).toBe(200);
    expect(await snapshot.json()).toMatchObject({ path: snapshotPath });

    const reopened = await app.request("/api/worlds/open", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: snapshotPath })
    });
    expect(reopened.status).toBe(200);
    expect(await json(reopened)).toMatchObject({ records: expect.arrayContaining([expect.objectContaining({ id: firstJson.record.id })]) });
  });
});
