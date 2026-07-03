import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { RECORD_TYPES } from "@worldloom/shared";
import { createApp } from "../src/app.js";

let tempDirs: string[] = [];

const tempDir = () => {
  const dir = mkdtempSync(join(tmpdir(), "worldloom-export-"));
  tempDirs.push(dir);
  return dir;
};

const json = async <T,>(response: Response): Promise<T> => response.json() as Promise<T>;

const createWorld = async () => {
  const app = createApp();
  const dir = tempDir();
  const path = join(dir, "world.sqlite");
  expect((await app.request("/api/worlds/create", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ path })
  })).status).toBe(201);
  return { app, dir, path };
};

const createRecord = async (
  app: ReturnType<typeof createApp>,
  input: { recordTypeKey: string; title: string; body?: string; truthLayer?: string; canonStatus?: string }
) => {
  const response = await app.request("/api/records", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      truthLayer: "Objective canon",
      canonStatus: "proposed",
      body: "",
      ...input
    })
  });
  expect(response.status, input.recordTypeKey).toBe(201);
  return (await json<{ record: { id: number; shortId: string; recordTypeKey: string; title: string; updatedAt: string } }>(response)).record;
};

afterEach(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs = [];
});

describe("markdown export HTTP API", () => {
  it("renders card-regime record markdown with metadata, sections, facets, history, and no world-file writes", async () => {
    const { app, path } = await createWorld();
    const record = await createRecord(app, {
      recordTypeKey: "canon_fact",
      title: "Bridge law survives",
      body: "The bridge right survives the flood.",
      canonStatus: "accepted"
    });

    expect((await app.request(`/api/records/${record.id}/sections`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sections: [{ heading: "Fact statement", body: "Bridge law binds every ferry.", position: 1 }] })
    })).status).toBe(200);
    expect((await app.request(`/api/records/${record.id}/sections`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sections: [{ heading: "Fact statement", body: "Bridge law binds every chartered ferry.", position: 1 }] })
    })).status).toBe(200);
    expect((await app.request(`/api/records/${record.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body: "The bridge right survives through ferry charters." })
    })).status).toBe(200);
    expect((await app.request(`/api/records/${record.id}/facets`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ vocabulary: "admission_decision_operation", term: "accept" })
    })).status).toBe(201);

    const before = await json<{ records: unknown[] }>(await app.request("/api/records"));
    const exported = await app.request(`/api/records/${record.id}/export/markdown`);
    expect(exported.status).toBe(200);
    const payload = await json<{ markdown: string }>(exported);

    expect(payload.markdown).toContain(`# ${record.shortId} - Bridge law survives`);
    expect(payload.markdown).toContain(`Source world: ${path}`);
    expect(payload.markdown).toContain("Schema version: 4");
    expect(payload.markdown).toContain("Record type: Canon fact (`canon_fact`)");
    expect(payload.markdown).toContain("Package source: `docs/worldbuilding-system/templates/canon_fact_card.md`");
    expect(payload.markdown).toContain("Truth layer: Objective canon");
    expect(payload.markdown).toContain("Canon status: accepted");
    expect(payload.markdown).toContain("- admission_decision_operation: accept");
    expect(payload.markdown).toContain("## Fact statement\n\nBridge law binds every chartered ferry.");
    expect(payload.markdown).not.toContain("## Working scope\n\n##");
    expect(payload.markdown).toContain("## History notes");
    expect(payload.markdown).toContain("The bridge right survives the flood.");
    expect(payload.markdown).toContain("Bridge law binds every ferry.");

    const after = await json<{ records: unknown[] }>(await app.request("/api/records"));
    expect(after.records).toEqual(before.records);
  });

  it("renders report-regime and every record type with links, advisory artifacts, and no silent unsupported cases", async () => {
    const { app } = await createWorld();
    const records: Array<{ id: number; shortId: string; recordTypeKey: string; title: string }> = [];

    for (const recordType of RECORD_TYPES) {
      if (recordType.key === "advisory_artifact") continue;
      records.push(await createRecord(app, {
        recordTypeKey: recordType.key,
        title: `${recordType.label} export`,
        body: recordType.key === "propagation_report" ? "First report line\nSecond report line" : `${recordType.label} body`
      }));
    }

    const advisory = await json<{ record: { id: number; shortId: string; recordTypeKey: string; title: string } }>(await app.request("/api/advisory-artifacts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stepKey: "export:test", promptText: "Prompt text verbatim", responseText: "Response text verbatim" })
    }));
    expect((await app.request(`/api/advisory-artifacts/${advisory.record.id}/dispositions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ disposition: "standing ruling", note: "Disposition note verbatim", standingRuling: true })
    })).status).toBe(201);
    records.push(advisory.record);

    const fact = records.find((row) => row.recordTypeKey === "canon_fact")!;
    const report = records.find((row) => row.recordTypeKey === "propagation_report")!;
    expect((await app.request(`/api/records/${report.id}/sections`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sections: [
          { heading: "Fact and run", body: "Report section one", position: 1 },
          { heading: "Shock-cone orders", body: "Report section two", position: 2 }
        ]
      })
    })).status).toBe(200);
    expect((await app.request("/api/links", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fromRecordId: fact.id, toRecordId: report.id, linkTypeKey: "digest_of", note: "Shock cone digest" })
    })).status).toBe(201);

    for (const record of records) {
      const response = await app.request(`/api/records/${record.id}/export/markdown`);
      expect(response.status, record.recordTypeKey).toBe(200);
      const payload = await json<{ markdown: string }>(response);
      expect(payload.markdown, record.recordTypeKey).toContain(record.shortId);
      expect(payload.markdown, record.recordTypeKey).toContain(`\`${record.recordTypeKey}\``);
    }

    const reportMarkdown = (await json<{ markdown: string }>(await app.request(`/api/records/${report.id}/export/markdown`))).markdown;
    expect(reportMarkdown.indexOf("First report line")).toBeLessThan(reportMarkdown.indexOf("## Fact and run"));
    expect(reportMarkdown.indexOf("Report section one")).toBeLessThan(reportMarkdown.indexOf("Report section two"));

    const advisoryMarkdown = (await json<{ markdown: string }>(await app.request(`/api/records/${advisory.record.id}/export/markdown`))).markdown;
    expect(advisoryMarkdown).toContain("Prompt text verbatim");
    expect(advisoryMarkdown).toContain("Response text verbatim");
    expect(advisoryMarkdown).toContain("standing ruling: Disposition note verbatim");

    const factMarkdown = (await json<{ markdown: string }>(await app.request(`/api/records/${fact.id}/export/markdown`))).markdown;
    expect(factMarkdown).toContain(`outgoing digest_of -> ${report.shortId} - ${report.title}`);

    const reportLinkedMarkdown = (await json<{ markdown: string }>(await app.request(`/api/records/${report.id}/export/markdown`))).markdown;
    expect(reportLinkedMarkdown).toContain(`incoming digest_of <- ${fact.shortId} - ${fact.title}`);
  });

  it("writes a whole-world markdown directory with index, stable filenames, draft exclusion, and safe re-export cleanup", async () => {
    const { app, path } = await createWorld();
    const exportDir = join(tempDir(), "markdown-export");
    const fact = await createRecord(app, { recordTypeKey: "canon_fact", title: "Bridge Law", body: "Current bridge law" });
    const report = await createRecord(app, { recordTypeKey: "propagation_report", title: "Bridge Report", body: "Report body" });
    expect((await app.request("/api/drafts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Ungoverned draft", body: "Do not export" })
    })).status).toBe(201);

    const beforeFirstExport = await json<{ records: unknown[] }>(await app.request("/api/records"));
    const firstExport = await app.request("/api/worlds/export/markdown", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ destinationPath: exportDir })
    });
    expect(firstExport.status).toBe(200);
    const firstPayload = await json<{ directory: string; files: string[]; indexPath: string }>(firstExport);
    expect(firstPayload.directory).toBe(exportDir);
    expect(firstPayload.files).toEqual(expect.arrayContaining(["FAC-1-bridge-law.md", "PRP-1-bridge-report.md", "index.md"]));
    expect(existsSync(join(exportDir, "FAC-1-bridge-law.md"))).toBe(true);

    const index = readFileSync(firstPayload.indexPath, "utf8");
    expect(index).toContain(`# Worldloom Markdown Export`);
    expect(index).toContain(`Source world: ${path}`);
    expect(index).toContain("Schema version: 4");
    expect(index).toContain("## Canon fact");
    expect(index).toContain(`[${fact.shortId} - ${fact.title}](FAC-1-bridge-law.md)`);
    expect(index).not.toContain("Ungoverned draft");
    expect(await json<{ records: unknown[] }>(await app.request("/api/records"))).toEqual(beforeFirstExport);

    writeFileSync(join(exportDir, "keeper.md"), "do not remove");
    expect((await app.request(`/api/records/${fact.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Bridge Law Revised" })
    })).status).toBe(200);
    const beforeSecondExport = await json<{ records: unknown[] }>(await app.request("/api/records"));

    const secondExport = await app.request("/api/worlds/export/markdown", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ destinationPath: exportDir })
    });
    expect(secondExport.status).toBe(200);
    const secondPayload = await json<{ files: string[] }>(secondExport);
    expect(secondPayload.files).toEqual(expect.arrayContaining(["FAC-1-bridge-law-revised.md", "PRP-1-bridge-report.md", "index.md"]));
    expect(existsSync(join(exportDir, "FAC-1-bridge-law.md"))).toBe(false);
    expect(existsSync(join(exportDir, "keeper.md"))).toBe(true);
    expect(await json<{ records: unknown[] }>(await app.request("/api/records"))).toEqual(beforeSecondExport);
  });

  it("rejects export routes when no world is open", async () => {
    const app = createApp();
    await app.request("/api/worlds/open", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: join(tempDir(), "missing.sqlite") })
    });
    expect((await app.request("/api/records/1/export/markdown")).status).toBe(409);
    expect((await app.request("/api/worlds/export/markdown", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ destinationPath: tempDir() })
    })).status).toBe(409);
  });
});
