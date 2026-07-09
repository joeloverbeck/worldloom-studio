import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

let tempDirs: string[] = [];

const tempPath = (name: string) => {
  const dir = mkdtempSync(join(tmpdir(), "worldloom-map-"));
  tempDirs.push(dir);
  return join(dir, name);
};

const json = async <T,>(response: Response): Promise<T> => response.json() as Promise<T>;

const postJson = (app: ReturnType<typeof createApp>, path: string, body: unknown) =>
  app.request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });

const createWorld = async () => {
  const app = createApp();
  expect((await postJson(app, "/api/worlds/create", { path: tempPath("workflow-map.sqlite") })).status).toBe(201);
  return app;
};

afterEach(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs = [];
});

describe("workflow map HTTP payload", () => {
  it("foregrounds Creation for an empty world without mutating the world file", async () => {
    const app = await createWorld();
    const before = await json<{ records: unknown[] }>(await app.request("/api/records"));

    const response = await app.request("/api/workflow-map");
    expect(response.status).toBe(200);
    const payload = await json<{
      readOnly: true;
      stages: Array<{ key: string; state: string; unlockReason?: string }>;
      queues: Array<{ key: string; count: number }>;
      nextDecision: { destinationKey: string; reason: string };
      destinations: Array<{ key: string; kind: string }>;
    }>(response);

    expect(payload.readOnly).toBe(true);
    expect(payload.stages).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "creation", state: "active" }),
      expect.objectContaining({ key: "admission", state: "not_yet_earned", unlockReason: expect.stringContaining("world_kernel") }),
      expect.objectContaining({ key: "propagation", state: "not_yet_earned", unlockReason: expect.stringContaining("Admission") })
    ]));
    expect(payload.queues).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "admission", count: 0 }),
      expect.objectContaining({ key: "owed-propagation", count: 0 }),
      expect.objectContaining({ key: "owed-boundaries", count: 0 }),
      expect.objectContaining({ key: "canon-debt", count: 0 }),
      expect.objectContaining({ key: "skips", count: 0 })
    ]));
    expect(payload.nextDecision).toMatchObject({
      destinationKey: "creation",
      reason: expect.stringContaining("world kernel")
    });
    expect(payload.destinations).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "creation", kind: "guided-flow", state: "active" }),
      expect.objectContaining({ key: "admission", kind: "guided-flow", state: "not_yet_earned" }),
      expect.objectContaining({ key: "propagation", kind: "guided-flow", state: "not_yet_earned" }),
      expect.objectContaining({ key: "constraint", kind: "guided-flow", state: "not_yet_earned" }),
      expect.objectContaining({ key: "temporal", kind: "guided-flow", state: "not_yet_earned" }),
      expect.objectContaining({ key: "stage12", kind: "guided-flow", state: "not_yet_earned" }),
      expect.objectContaining({ key: "contradiction", kind: "guided-flow", state: "not_yet_earned" }),
      expect.objectContaining({ key: "qa", kind: "guided-flow", state: "not_yet_earned" }),
      expect.objectContaining({ key: "canon-workbench", kind: "read-side", state: "available" }),
      expect.objectContaining({ key: "markdown-export", kind: "read-side", state: "available" }),
      expect.objectContaining({ key: "substrate", kind: "substrate", state: "available" })
    ]));

    expect(await json(await app.request("/api/records"))).toEqual(before);
  });

  it("keeps a saved-kernel world in Creation until seed decomposition parks proposed seeds", async () => {
    const app = await createWorld();
    await postJson(app, "/api/records", {
      recordTypeKey: "world_kernel",
      title: "Bell city kernel",
      body: "The city hears testimony from bells.",
      truthLayer: "Objective canon",
      canonStatus: "proposed"
    });
    const before = await json<{ records: unknown[] }>(await app.request("/api/records"));

    const payload = await json<{
      stages: Array<{ key: string; state: string; summary: string; unlockReason?: string }>;
      queues: Array<{ key: string; count: number; summary: string }>;
      nextDecision: { destinationKey: string; label: string; reason: string; href: string };
      destinations: Array<{ key: string; state: string }>;
    }>(await app.request("/api/workflow-map"));

    expect(payload.stages).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "creation", state: expect.stringMatching(/active|owed/), summary: expect.stringMatching(/seed decomposition/i) }),
      expect.objectContaining({ key: "admission", state: expect.stringMatching(/not_yet_earned|blocked/), unlockReason: expect.stringContaining("proposed seed") }),
      expect.objectContaining({ key: "qa", state: "not_yet_earned" })
    ]));
    expect(payload.queues).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "admission", count: 0, summary: expect.stringContaining("no proposed seeds") })
    ]));
    expect(payload.nextDecision).toMatchObject({
      destinationKey: "creation",
      label: expect.stringContaining("Seed decomposition"),
      href: expect.stringContaining("/api/flows/creation")
    });
    expect(payload.nextDecision.reason).not.toMatch(/QA|review|stability/i);
    expect(payload.destinations).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "creation", state: expect.stringMatching(/active|owed/) }),
      expect.objectContaining({ key: "admission", state: expect.stringMatching(/not_yet_earned|blocked/) }),
      expect.objectContaining({ key: "qa", state: "not_yet_earned" })
    ]));
    expect(await json(await app.request("/api/records"))).toEqual(before);
  });

  it("surfaces admission, propagation, boundary, canon-debt, and skip queues from live world state", async () => {
    const app = await createWorld();
    await postJson(app, "/api/records", {
      recordTypeKey: "world_kernel",
      title: "Bell city kernel",
      body: "The city hears testimony from bells.",
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    });
    await postJson(app, "/api/records", {
      recordTypeKey: "canon_fact",
      title: "Bell testimony",
      body: "Courts can admit bell testimony.",
      truthLayer: "Objective canon",
      canonStatus: "proposed"
    });

    const accepted = await json<{ record: { id: number } }>(await postJson(app, "/api/records", {
      recordTypeKey: "canon_fact",
      title: "Noon bridge",
      body: "The bridge speaks at noon.",
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    }));
    await postJson(app, `/api/records/${accepted.record.id}/facets`, { vocabulary: "work_scale", term: "major" });
    const debt = await json<{ debt: { id: number } }>(await postJson(app, "/api/canon-debt", {
      name: "Propagation owed for Noon bridge",
      scope: "propagation",
      assignee: "steward",
      body: "Scope: propagation\nWork the noon-bridge shock cone."
    }));
    expect((await postJson(app, "/api/links", {
      fromRecordId: debt.debt.id,
      toRecordId: accepted.record.id,
      linkTypeKey: "derived_from",
      note: "Propagation debt source fact"
    })).status).toBe(201);
    const propagation = await json<{ flow: { id: number } }>(await postJson(app, "/api/propagation/runs/start", {
      factRecordId: accepted.record.id,
      debtRecordId: debt.debt.id
    }));
    const consequence = await json<{ consequence: { id: number } }>(await postJson(app, "/api/propagation/consequences", {
      flowId: propagation.flow.id,
      orderKey: "first",
      body: "Pilgrims reroute around noon.",
      pressure: "high"
    }));
    await postJson(app, "/api/propagation/dispositions", {
      consequenceId: consequence.consequence.id,
      disposition: "protected as a mystery boundary",
      preservationBoundary: "author-secret"
    });
    await postJson(app, "/api/propagation/skip", {
      flowId: propagation.flow.id,
      stepKey: "domain_atlas",
      admissionLevel: "1",
      workScale: "minor"
    });

    const payload = await json<{
      stages: Array<{ key: string; state: string }>;
      queues: Array<{ key: string; count: number; destinationKey: string }>;
      nextDecision: { destinationKey: string };
    }>(await app.request("/api/workflow-map"));

    expect(payload.queues).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "admission", count: 1, destinationKey: "admission" }),
      expect.objectContaining({ key: "owed-propagation", count: 1, destinationKey: "propagation" }),
      expect.objectContaining({ key: "owed-boundaries", count: 1, destinationKey: "contradiction" }),
      expect.objectContaining({ key: "canon-debt", count: 1, destinationKey: "substrate" }),
      expect.objectContaining({ key: "skips", count: 1, destinationKey: "substrate" })
    ]));
    expect(payload.stages).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "creation", state: "done" }),
      expect.objectContaining({ key: "admission", state: "active" }),
      expect.objectContaining({ key: "propagation", state: "owed" }),
      expect.objectContaining({ key: "contradiction", state: "owed" })
    ]));
    expect(payload.nextDecision.destinationKey).toBe("admission");
  });

  it("keeps Creation primary while parked proposed seeds have unresolved seed-family coverage", async () => {
    const app = await createWorld();
    const start = await json<{ flow: { id: number } }>(await app.request("/api/flows/creation/start", { method: "POST" }));
    const saved = await json<{ kernel: { id: number } }>(await postJson(app, "/api/flows/creation/kernel-step", {
      flowId: start.flow.id,
      heading: "Foundational facts",
      body: "Temporal access, anti-aging chemistry, and ordinary-life pressure.",
      consequenceMode: "hard speculative"
    }));
    const decomposed = await json<{ report: { id: number }; records: Array<{ id: number }> }>(await postJson(app, "/api/flows/creation/decompose", {
      flowId: start.flow.id,
      kernelRecordId: saved.kernel.id,
      granularityRationale: "Temporal access can be rejected without deleting the other seed families.",
      seeds: [{ title: "Temporal access tool", body: "A device opens one-way temporal windows.", truthLayer: "Objective canon", granularityConfirmed: true }]
    }));
    const confirmed = await json<{ coverage: { rows: Array<{ id: number; label: string }> } }>(await postJson(app, "/api/flows/creation/coverage", {
      kernelRecordId: saved.kernel.id,
      seedDecompositionReportId: decomposed.report.id,
      rows: [
        { label: "Temporal access", sourceKernelContext: "The parked temporal-access seed.", required: true },
        { label: "Anti-aging chemistry", sourceKernelContext: "Chemistry remains undecomposed.", required: true }
      ]
    }));
    const temporalCoverageRowId = confirmed.coverage.rows.find((row) => row.label === "Temporal access")?.id;
    const chemistryCoverageRowId = confirmed.coverage.rows.find((row) => row.label === "Anti-aging chemistry")?.id;
    expect(temporalCoverageRowId).toBeGreaterThan(0);
    expect(chemistryCoverageRowId).toBeGreaterThan(0);
    await postJson(app, "/api/flows/creation/coverage/link", {
      rowId: temporalCoverageRowId,
      seedRecordIds: [decomposed.records[0]?.id],
      seedDecompositionReportId: decomposed.report.id
    });
    const before = await json<{ records: unknown[] }>(await app.request("/api/records"));

    const unresolved = await json<{
      stages: Array<{ key: string; state: string; summary: string; unlockReason?: string }>;
      queues: Array<{ key: string; count: number; summary: string }>;
      nextDecision: { destinationKey: string; label: string; reason: string };
      destinations: Array<{ key: string; state: string }>;
    }>(await app.request("/api/workflow-map"));
    expect(unresolved.stages).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "creation", state: expect.stringMatching(/active|owed/), summary: expect.stringContaining("seed-family coverage") }),
      expect.objectContaining({ key: "admission", state: "blocked", unlockReason: expect.stringContaining("unresolved seed-family coverage") })
    ]));
    expect(unresolved.queues).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "admission", count: 1, summary: expect.stringContaining("secondary") })
    ]));
    expect(unresolved.nextDecision).toMatchObject({
      destinationKey: "creation",
      label: expect.stringContaining("coverage"),
      reason: expect.stringContaining("Anti-aging chemistry")
    });
    expect(unresolved.destinations).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "creation", state: expect.stringMatching(/active|owed/) }),
      expect.objectContaining({ key: "admission", state: "blocked" })
    ]));
    expect(await json(await app.request("/api/records"))).toEqual(before);

    await postJson(app, "/api/flows/creation/coverage/defer", {
      rowId: chemistryCoverageRowId,
      rationale: "Chemistry is explicit seed debt for a later pass."
    });
    const resolved = await json<{ nextDecision: { destinationKey: string; label: string }; stages: Array<{ key: string; state: string }> }>(await app.request("/api/workflow-map"));
    expect(resolved.nextDecision).toMatchObject({ destinationKey: "admission", label: expect.stringContaining("Admission") });
    expect(resolved.stages).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "creation", state: "done" }),
      expect.objectContaining({ key: "admission", state: "active" })
    ]));
  });
});
