import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Database from "better-sqlite3";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

let tempDirs: string[] = [];

const tempPath = (name: string) => {
  const dir = mkdtempSync(join(tmpdir(), "worldloom-source-selection-"));
  tempDirs.push(dir);
  return join(dir, name);
};

const json = async <T,>(response: Response): Promise<T> => response.json() as Promise<T>;

const postJson = (app: ReturnType<typeof createApp>, path: string, payload: unknown) =>
  app.request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

const putJson = (app: ReturnType<typeof createApp>, path: string, payload: unknown) =>
  app.request(path, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

const patchJson = (app: ReturnType<typeof createApp>, path: string, payload: unknown) =>
  app.request(path, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

const createRecord = async (
  app: ReturnType<typeof createApp>,
  input: { recordTypeKey: string; title: string; body?: string; canonStatus?: string }
) => (await json<{ record: { id: number; shortId: string; title: string; recordTypeKey: string } }>(await postJson(app, "/api/records", {
  body: `${input.title} has durable source-selection substance.`,
  truthLayer: "Objective canon",
  canonStatus: "accepted",
  ...input
}))).record;

const worldFingerprint = (path: string): string => {
  const db = new Database(path, { readonly: true });
  try {
    const tables = (db.prepare(`
      SELECT name
      FROM sqlite_master
      WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all() as Array<{ name: string }>).map((row) => row.name);
    const snapshot = tables.map((table) => {
      const safeName = table.replaceAll('"', '""');
      const rows = db.prepare(`SELECT * FROM "${safeName}"`).all();
      return [table, rows.map((row) => JSON.stringify(row)).sort()];
    });
    return createHash("sha256").update(JSON.stringify(snapshot)).digest("hex");
  } finally {
    db.close();
  }
};

const canonicalDomainNames = [
  "Physics, metaphysics, and cosmology",
  "Geography, climate, and infrastructure",
  "Ecology, food, disease, and nonhuman life",
  "Population, demography, and household life",
  "Production, labor, and technology/magic",
  "Economy, trade, and scarcity",
  "Governance, law, and bureaucracy",
  "War, coercion, and security",
  "Religion, ritual, myth, and meaning",
  "Culture, custom, language, and identity",
  "Knowledge, education, science, and records",
  "History, memory, and path dependence",
  "Daily life and material residue",
  "Aesthetics, tone, and narrative use"
];

const closeFoundationalPropagation = async (
  app: ReturnType<typeof createApp>,
  factId: number,
  options: { declareSeverity?: boolean } = {}
) => {
  if (options.declareSeverity !== false) {
    expect((await postJson(app, `/api/records/${factId}/facets`, { vocabulary: "admission_level", term: "5" })).status).toBe(201);
    expect((await postJson(app, `/api/records/${factId}/facets`, { vocabulary: "work_scale", term: "catastrophic" })).status).toBe(201);
  }
  const started = await json<{ flow: { id: number } }>(await postJson(app, "/api/propagation/runs/start", { factRecordId: factId }));
  for (const orderKey of ["zeroth", "first", "second", "third", "fourth", "fifth"]) {
    expect((await postJson(app, "/api/propagation/consequences", {
      flowId: started.flow.id,
      orderKey,
      body: `${orderKey} order source-selection consequence with durable substance.`,
      pressure: "normal"
    })).status).toBe(201);
  }
  for (const domainName of canonicalDomainNames) {
    expect((await postJson(app, "/api/propagation/domains", {
      flowId: started.flow.id,
      domainName,
      triage: "direct",
      declaration: `${domainName} is governed in this source-selection fixture.`
    })).status).toBe(201);
  }
  const response = await postJson(app, `/api/propagation/runs/${started.flow.id}/close`, {});
  expect(response.status).toBe(201);
  return json<any>(response);
};

afterEach(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs = [];
});

describe("Source-selected guided-flow run entry HTTP contract", () => {
  it("keeps flow-owned persistence lookup out of the shared selection assembler", () => {
    const source = readFileSync(new URL("../src/guided-flow-source-selection.ts", import.meta.url), "utf8");
    expect(source).not.toMatch(/temporal_runs|constraint_run_sources|stage12_run_sources/);
    expect(source).not.toContain("resolveHref");
  });

  it("resolves current Temporal source identity without mutating the World file", async () => {
    const app = createApp();
    expect((await postJson(app, "/api/worlds/create", { path: tempPath("temporal-resolution.sqlite") })).status).toBe(201);
    const fact = (await json<{ record: { id: number; shortId: string; title: string } }>(await postJson(app, "/api/records", {
      recordTypeKey: "canon_fact",
      title: "Non-reproducible neurological access",
      body: "Chrononaut access depends on a neurological condition that cannot be manufactured.",
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    }))).record;
    const before = await json<unknown>(await app.request("/api/records"));

    const response = await postJson(app, "/api/temporal/source-selection/resolve", {
      sourceType: "fact",
      recordId: fact.id
    });

    expect(response.status).toBe(200);
    expect(await json<unknown>(response)).toMatchObject({
      contract: "Source-selected guided-flow run entry",
      destination: { passKey: "temporal_timeline", destinationKey: "temporal" },
      request: { sourceType: "fact", recordId: fact.id },
      validation: { state: "resolved", valid: true, blocker: null, remediation: null },
      identity: {
        stableRecordId: fact.id,
        shortId: fact.shortId,
        title: fact.title,
        recordTypeKey: "canon_fact",
        canonStatus: "accepted"
      },
      binding: null,
      action: { startOrResumeAvailable: true }
    });
    expect(await json<unknown>(await app.request("/api/records"))).toEqual(before);
  });

  it("carries the same authoritative resolution from the Workflow map into Temporal entry", async () => {
    const app = createApp();
    expect((await postJson(app, "/api/worlds/create", { path: tempPath("map-resolution.sqlite") })).status).toBe(201);
    const fact = (await json<{ record: { id: number; shortId: string } }>(await postJson(app, "/api/records", {
      recordTypeKey: "canon_fact",
      title: "Non-reproducible neurological access",
      body: "Chrononaut access is neurologically gated and cannot be manufactured.",
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    }))).record;
    await closeFoundationalPropagation(app, fact.id);
    const before = await json<unknown>(await app.request("/api/records"));
    const map = await json<{
      conditionalPasses: {
        obligations: Array<{
          passKey: string;
          destination: { body: Record<string, unknown> };
          sourceSelection?: unknown;
        }>;
      };
    }>(await app.request("/api/workflow-map"));
    const temporal = map.conditionalPasses.obligations.find((item) => item.passKey === "temporal_timeline");
    expect(temporal).toBeTruthy();

    const direct = await json<unknown>(await postJson(app, "/api/temporal/source-selection/resolve", temporal!.destination.body));
    expect(temporal!.sourceSelection).toEqual(direct);
    expect(direct).toMatchObject({
      identity: { stableRecordId: fact.id, shortId: fact.shortId },
      binding: {
        valid: true,
        passKey: "temporal_timeline",
        sourceFact: { stableRecordId: fact.id, shortId: fact.shortId },
        propagationReport: { recordTypeKey: "propagation_report" },
        destinationKey: "temporal",
        disposition: "outstanding"
      }
    });
    expect(await json<unknown>(await app.request("/api/records"))).toEqual(before);
  });

  it("resolves pass-report resume only through its stored run identity", async () => {
    const app = createApp();
    expect((await postJson(app, "/api/worlds/create", { path: tempPath("pass-report-resolution.sqlite") })).status).toBe(201);
    const fact = (await json<{ record: { id: number; shortId: string } }>(await postJson(app, "/api/records", {
      recordTypeKey: "canon_fact",
      title: "Neurological access gate",
      body: "Access remains constrained by a stable source condition.",
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    }))).record;
    const unrelated = (await json<{ record: { id: number } }>(await postJson(app, "/api/records", {
      recordTypeKey: "pass_report",
      title: "Unowned pass report",
      body: "This report is not an in-progress Temporal run.",
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    }))).record;

    const refused = await json<any>(await postJson(app, "/api/temporal/source-selection/resolve", {
      sourceType: "pass_report",
      reportRecordId: unrelated.id
    }));
    expect(refused).toMatchObject({
      request: { sourceType: "pass_report", recordId: unrelated.id },
      validation: { state: "mismatched_binding", valid: false },
      identity: { stableRecordId: unrelated.id, recordTypeKey: "pass_report" },
      storedRunIdentity: null,
      action: { startOrResumeAvailable: false }
    });
    expect(refused.validation.remediation).toMatch(/in-progress Temporal\/Timeline run/i);

    const started = await json<any>(await postJson(app, "/api/constraint-composition/runs/start", {
      sourceType: "fact",
      recordId: fact.id
    }));
    const resolved = await json<any>(await postJson(app, "/api/constraint-composition/source-selection/resolve", {
      sourceType: "pass_report",
      reportRecordId: started.report.id
    }));
    expect(resolved).toMatchObject({
      validation: { state: "resolved", valid: true },
      identity: { stableRecordId: started.report.id, recordTypeKey: "pass_report" },
      storedRunIdentity: { stableRecordId: fact.id, shortId: fact.shortId },
      action: { startOrResumeAvailable: true }
    });
  });

  it("preserves every existing source mode across the three flow-aware resolvers", async () => {
    const app = createApp();
    const path = tempPath("source-mode-matrix.sqlite");
    expect((await postJson(app, "/api/worlds/create", { path })).status).toBe(201);
    const fact = await createRecord(app, { recordTypeKey: "canon_fact", title: "Fact source" });
    const capability = await createRecord(app, { recordTypeKey: "capability", title: "Capability source" });
    const constraint = await createRecord(app, { recordTypeKey: "constraint", title: "Constraint source" });
    const debt = await createRecord(app, { recordTypeKey: "canon_debt", title: "Debt source" });
    expect((await putJson(app, `/api/records/${fact.id}/sections`, {
      sections: [{ heading: "Fact statement", body: "A named pressure point anchors this section.", position: 1 }]
    })).status).toBe(200);
    const before = worldFingerprint(path);

    const cases = [
      ["/api/temporal/source-selection/resolve", { sourceType: "fact", recordId: fact.id }],
      ["/api/temporal/source-selection/resolve", { sourceType: "capability", recordId: capability.id }],
      ["/api/temporal/source-selection/resolve", { sourceType: "canon_debt", recordId: debt.id }],
      ["/api/temporal/source-selection/resolve", { sourceType: "material", materialTitle: "Temporal fragment", materialBody: "A steward-selected fragment with a clear sequence." }],
      ["/api/constraint-composition/source-selection/resolve", { sourceType: "fact", recordId: fact.id }],
      ["/api/constraint-composition/source-selection/resolve", { sourceType: "capability", recordId: capability.id }],
      ["/api/constraint-composition/source-selection/resolve", { sourceType: "constraint_card", recordId: constraint.id }],
      ["/api/constraint-composition/source-selection/resolve", { sourceType: "canon_debt", recordId: debt.id }],
      ["/api/constraint-composition/source-selection/resolve", { sourceType: "record_section", recordId: fact.id, sectionHeading: "Fact statement" }],
      ["/api/constraint-composition/source-selection/resolve", { sourceType: "material", materialTitle: "Constraint fragment", materialBody: "A selected fragment naming a durable limit." }],
      ["/api/institutional/source-selection/resolve", { sourceType: "fact", recordId: fact.id }],
      ["/api/institutional/source-selection/resolve", { sourceType: "under_review_fact", recordId: fact.id }],
      ["/api/institutional/source-selection/resolve", { sourceType: "canon_debt", recordId: debt.id }],
      ["/api/institutional/source-selection/resolve", { sourceType: "record_section", recordId: fact.id, sectionHeading: "Fact statement" }],
      ["/api/institutional/source-selection/resolve", { sourceType: "material", materialTitle: "Institutional fragment", materialBody: "A selected fragment naming actors, costs, and suppression." }]
    ] as const;
    for (const [route, input] of cases) {
      const selection = await json<any>(await postJson(app, route, input));
      expect(selection.validation, `${route}: ${input.sourceType}`).toMatchObject({ state: "resolved", valid: true });
      expect(selection.action.startOrResumeAvailable).toBe(true);
      if (input.sourceType === "material") {
        expect(selection).toMatchObject({ identity: null, selectedMaterial: { title: input.materialTitle, body: input.materialBody } });
        expect(selection.fieldClassifications).toMatchObject({
          required: ["selected-material title and body", "requested source type", "validation state"],
          optional: []
        });
        expect(selection.orientation.next).toBe("Start or resume using this selected material.");
      } else if (input.sourceType === "record_section") {
        expect(selection.fieldClassifications.required).toContain("record-section heading");
        expect(selection.fieldClassifications.optional).not.toContain("record-section heading");
        expect(selection.fieldClassifications.optional).not.toContain("selected-material title and body");
        expect(selection.orientation.next).toBe("Start or resume against this same authoritative stable identity.");
      } else {
        expect(selection.fieldClassifications.optional).not.toContain("record-section heading");
        expect(selection.fieldClassifications.optional).not.toContain("selected-material title and body");
      }
    }
    expect(worldFingerprint(path)).toBe(before);
  });

  it("returns deterministic correctable invalid states and never mutates on resolution", async () => {
    const app = createApp();
    const path = tempPath("invalid-state-matrix.sqlite");
    expect((await postJson(app, "/api/worlds/create", { path })).status).toBe(201);
    const capability = await createRecord(app, { recordTypeKey: "capability", title: "Wrong fact type" });
    const unavailable = await createRecord(app, {
      recordTypeKey: "canon_fact",
      title: "Retired source",
      canonStatus: "superseded"
    });
    const before = worldFingerprint(path);
    const cases = [
      [{ sourceType: "fact" }, "empty", /enter a record id supported/i],
      [{ sourceType: "fact", recordId: 999_999 }, "missing", /correct the preserved record id/i],
      [{ sourceType: "fact", recordId: capability.id }, "incompatible_source_type", /change the preserved source type/i],
      [{ sourceType: "fact", recordId: unavailable.id }, "unavailable_standing", /choose a current non-terminal record/i],
      [{ sourceType: "material", materialTitle: "Preserved title", materialBody: "" }, "empty", /enter both selected-material fields/i]
    ] as const;
    for (const [input, state, remediation] of cases) {
      const selection = await json<any>(await postJson(app, "/api/temporal/source-selection/resolve", input));
      expect(selection.request.sourceType).toBe(input.sourceType);
      expect(selection.validation).toMatchObject({ state, valid: false, blocker: expect.any(String), substanceRule: expect.any(String) });
      expect(selection.validation.remediation).toMatch(remediation);
      expect(selection.action.startOrResumeAvailable).toBe(false);
      if (input.sourceType === "material") {
        expect(selection.fieldClassifications).toMatchObject({
          required: ["selected-material title and body", "requested source type", "validation state"],
          optional: []
        });
      }
    }
    expect(worldFingerprint(path)).toBe(before);
  });

  it("refuses partial, mismatched, and stale Conditional-pass bindings without writes", async () => {
    const app = createApp();
    const path = tempPath("binding-state-matrix.sqlite");
    expect((await postJson(app, "/api/worlds/create", { path })).status).toBe(201);
    const fact = await createRecord(app, { recordTypeKey: "canon_fact", title: "Bound fact" });
    const otherFact = await createRecord(app, { recordTypeKey: "canon_fact", title: "Other fact" });
    await closeFoundationalPropagation(app, fact.id);
    const map = await json<any>(await app.request("/api/workflow-map"));
    const temporal = map.conditionalPasses.obligations.find((item: any) => item.passKey === "temporal_timeline");
    expect(temporal).toBeTruthy();
    const validInput = temporal.destination.body;

    let before = worldFingerprint(path);
    const partial = await json<any>(await postJson(app, "/api/temporal/source-selection/resolve", {
      sourceType: "fact",
      recordId: fact.id,
      conditionalPassObligationId: validInput.conditionalPassObligationId
    }));
    expect(partial.validation).toMatchObject({ state: "mismatched_binding", valid: false });
    expect(partial.validation.remediation).toMatch(/complete server-returned source-selected route/i);
    const mismatch = await json<any>(await postJson(app, "/api/temporal/source-selection/resolve", {
      ...validInput,
      recordId: otherFact.id
    }));
    expect(mismatch.validation).toMatchObject({ state: "mismatched_binding", valid: false });
    expect(mismatch.validation.remediation).toMatch(/matching server-returned obligation/i);
    expect(worldFingerprint(path)).toBe(before);

    expect((await postJson(app, `/api/conditional-pass-obligations/${validInput.conditionalPassObligationId}/defer`, {
      rationale: "This pass is deliberately deferred until the steward supplies a governed calendar boundary."
    })).status).toBe(201);
    before = worldFingerprint(path);
    const stale = await json<any>(await postJson(app, "/api/temporal/source-selection/resolve", validInput));
    expect(stale.validation).toMatchObject({ state: "stale_binding", valid: false });
    expect(stale.validation.remediation).toMatch(/reload the Workflow map/i);
    expect(worldFingerprint(path)).toBe(before);
  });

  it("refuses an existing run's conflicting Conditional-pass binding before start across all destinations", async () => {
    const app = createApp();
    const path = tempPath("existing-run-binding-matrix.sqlite");
    expect((await postJson(app, "/api/worlds/create", { path })).status).toBe(201);
    const fact = await createRecord(app, { recordTypeKey: "canon_fact", title: "Repeated binding source" });
    const firstClose = await closeFoundationalPropagation(app, fact.id);
    const secondClose = await closeFoundationalPropagation(app, fact.id, { declareSeverity: false });
    const cases = [
      ["temporal_timeline", "/api/temporal/source-selection/resolve", "/api/temporal/runs/start"],
      ["constraint_composition", "/api/constraint-composition/source-selection/resolve", "/api/constraint-composition/runs/start"],
      ["institutional_economic_suppression", "/api/institutional/source-selection/resolve", "/api/institutional/runs/start"]
    ] as const;

    for (const [passKey, resolveRoute, startRoute] of cases) {
      const first = firstClose.obligations.find((item: any) => item.passKey === passKey);
      const second = secondClose.obligations.find((item: any) => item.passKey === passKey);
      expect(first).toBeTruthy();
      expect(second).toBeTruthy();
      const firstInput = {
        sourceType: "fact",
        recordId: fact.id,
        conditionalPassObligationId: first.id,
        propagationReportRecordId: firstClose.report.id
      };
      const secondInput = {
        sourceType: "fact",
        recordId: fact.id,
        conditionalPassObligationId: second.id,
        propagationReportRecordId: secondClose.report.id
      };
      expect((await postJson(app, startRoute, firstInput)).status).toBe(201);
      const before = worldFingerprint(path);

      const map = await json<any>(await app.request("/api/workflow-map"));
      const mapSelection = map.conditionalPasses.obligations.find((item: any) => item.id === second.id)?.sourceSelection;
      expect(mapSelection).toMatchObject({
        validation: { state: "stale_binding", valid: false },
        action: { startOrResumeAvailable: false }
      });

      const conflicting = await json<any>(await postJson(app, resolveRoute, secondInput));

      expect(conflicting).toMatchObject({
        request: { sourceType: "fact", recordId: fact.id },
        identity: { stableRecordId: fact.id },
        validation: { state: "stale_binding", valid: false },
        action: { startOrResumeAvailable: false }
      });
      expect(conflicting.validation.blocker).toMatch(/existing run.*different Conditional-pass obligation/i);
      expect(conflicting.validation.remediation).toMatch(/resume.*original.*Workflow map/i);
      expect(worldFingerprint(path)).toBe(before);
    }
  });

  it("revalidates start and resume while preserving stable identity and refreshing titles", async () => {
    const app = createApp();
    const path = tempPath("start-resume-continuity.sqlite");
    expect((await postJson(app, "/api/worlds/create", { path })).status).toBe(201);
    const fact = await createRecord(app, { recordTypeKey: "canon_fact", title: "Original source title" });
    const approved = await json<any>(await postJson(app, "/api/temporal/source-selection/resolve", {
      sourceType: "fact",
      recordId: fact.id
    }));
    const startedResponse = await postJson(app, "/api/temporal/runs/start", { sourceType: "fact", recordId: fact.id });
    expect(startedResponse.status).toBe(201);
    const started = await json<any>(startedResponse);
    expect(started.sourceSelection).toEqual(approved);

    expect((await patchJson(app, `/api/records/${fact.id}`, { title: "Refreshed source title" })).status).toBe(200);
    const beforeResume = worldFingerprint(path);
    const resumed = await json<any>(await postJson(app, "/api/temporal/runs/start", { sourceType: "fact", recordId: fact.id }));
    expect(resumed.flow.id).toBe(started.flow.id);
    expect(resumed.sourceSelection).toMatchObject({
      request: { recordId: fact.id },
      identity: { stableRecordId: fact.id, shortId: fact.shortId, title: "Refreshed source title" },
      validation: { state: "resolved", valid: true }
    });
    expect(worldFingerprint(path)).toBe(beforeResume);

    const constraint = await json<any>(await postJson(app, "/api/constraint-composition/runs/start", {
      sourceType: "fact",
      recordId: fact.id
    }));
    const reportSelection = await json<any>(await postJson(app, "/api/constraint-composition/source-selection/resolve", {
      sourceType: "pass_report",
      reportRecordId: constraint.report.id
    }));
    const beforeReportResume = worldFingerprint(path);
    const reportResume = await json<any>(await postJson(app, "/api/constraint-composition/runs/start", {
      sourceType: "pass_report",
      reportRecordId: constraint.report.id
    }));
    expect(reportResume.flow.id).toBe(constraint.flow.id);
    expect(reportResume.sourceSelection).toEqual(reportSelection);
    expect(reportResume.sourceSelection.storedRunIdentity).toMatchObject({ stableRecordId: fact.id, title: "Refreshed source title" });
    expect(worldFingerprint(path)).toBe(beforeReportResume);

    const institutional = await json<any>(await postJson(app, "/api/institutional/runs/start", {
      sourceType: "material",
      materialTitle: "Institutional scene",
      materialBody: "Merchants and magistrates contest the cost of neurological access."
    }));
    expect(institutional.sourceSelection).toMatchObject({
      validation: { state: "resolved", valid: true },
      identity: null,
      selectedMaterial: { title: "Institutional scene" }
    });
  });

  it("resumes record-backed runs by stable identity after mutable source content changes", async () => {
    const app = createApp();
    expect((await postJson(app, "/api/worlds/create", { path: tempPath("mutable-content-resume.sqlite") })).status).toBe(201);
    const fact = await createRecord(app, { recordTypeKey: "canon_fact", title: "Stable source" });
    const cases = [
      ["/api/temporal/runs/start", { sourceType: "fact", recordId: fact.id }],
      ["/api/constraint-composition/runs/start", { sourceType: "fact", recordId: fact.id }],
      ["/api/institutional/runs/start", { sourceType: "fact", recordId: fact.id }]
    ] as const;
    const started: any[] = [];
    for (const [route, input] of cases) {
      const response = await postJson(app, route, input);
      expect(response.status).toBe(201);
      started.push(await json<any>(response));
    }

    expect((await patchJson(app, `/api/records/${fact.id}`, {
      body: "The same stable source now has refreshed mutable content with durable detail."
    })).status).toBe(200);

    for (const [index, [route, input]] of cases.entries()) {
      const resumed = await json<any>(await postJson(app, route, input));
      expect(resumed.flow.id, route).toBe(started[index].flow.id);
      expect(resumed.sourceSelection.identity.stableRecordId, route).toBe(fact.id);
    }

    expect((await putJson(app, `/api/records/${fact.id}/sections`, {
      sections: [{ heading: "Fact statement", body: "Original section prose with durable substance.", position: 1 }]
    })).status).toBe(200);
    const sectionCases = [
      ["/api/constraint-composition/runs/start", { sourceType: "record_section", recordId: fact.id, sectionHeading: "Fact statement" }],
      ["/api/institutional/runs/start", { sourceType: "record_section", recordId: fact.id, sectionHeading: "Fact statement" }]
    ] as const;
    const sectionRuns = [] as any[];
    for (const [route, input] of sectionCases) sectionRuns.push(await json<any>(await postJson(app, route, input)));
    expect((await putJson(app, `/api/records/${fact.id}/sections`, {
      sections: [{ heading: "Fact statement", body: "Refreshed section prose retains the same selected heading identity.", position: 1 }]
    })).status).toBe(200);
    for (const [index, [route, input]] of sectionCases.entries()) {
      expect((await json<any>(await postJson(app, route, input))).flow.id, route).toBe(sectionRuns[index].flow.id);
    }

    const materialCases = [
      ["/api/temporal/runs/start", { sourceType: "material", materialTitle: "Material identity", materialBody: "Exact selected material body." }],
      ["/api/constraint-composition/runs/start", { sourceType: "material", materialTitle: "Material identity", materialBody: "Exact selected material body." }],
      ["/api/institutional/runs/start", { sourceType: "material", materialTitle: "Material identity", materialBody: "Exact selected material body." }]
    ] as const;
    for (const [route, input] of materialCases) {
      const first = await json<any>(await postJson(app, route, input));
      const same = await json<any>(await postJson(app, route, input));
      const changed = await json<any>(await postJson(app, route, { ...input, materialBody: `${input.materialBody} Changed.` }));
      expect(same.flow.id, route).toBe(first.flow.id);
      expect(changed.flow.id, route).not.toBe(first.flow.id);
    }
  });

  it("rejects invalid start or binding retarget attempts with authoritative state and no partial writes", async () => {
    const app = createApp();
    const path = tempPath("rejected-start-fingerprint.sqlite");
    expect((await postJson(app, "/api/worlds/create", { path })).status).toBe(201);
    const fact = await createRecord(app, { recordTypeKey: "canon_fact", title: "Bound start fact" });
    const otherFact = await createRecord(app, { recordTypeKey: "canon_fact", title: "Retarget attempt" });
    await closeFoundationalPropagation(app, fact.id);
    const map = await json<any>(await app.request("/api/workflow-map"));
    const temporal = map.conditionalPasses.obligations.find((item: any) => item.passKey === "temporal_timeline");
    expect(temporal).toBeTruthy();

    let before = worldFingerprint(path);
    const missing = await postJson(app, "/api/temporal/runs/start", { sourceType: "fact", recordId: 999_999 });
    expect(missing.status).toBe(400);
    expect(await json<any>(missing)).toMatchObject({
      authoritativeState: { validation: { state: "missing", valid: false }, request: { recordId: 999_999 } },
      remediation: expect.stringContaining("Correct the preserved record id")
    });
    expect(worldFingerprint(path)).toBe(before);

    before = worldFingerprint(path);
    const retarget = await postJson(app, "/api/temporal/runs/start", {
      ...temporal.destination.body,
      recordId: otherFact.id
    });
    expect(retarget.status).toBe(400);
    expect(await json<any>(retarget)).toMatchObject({
      authoritativeState: { validation: { state: "mismatched_binding", valid: false }, request: { recordId: otherFact.id } },
      remediation: expect.stringContaining("matching server-returned obligation")
    });
    expect(worldFingerprint(path)).toBe(before);
  });
});
