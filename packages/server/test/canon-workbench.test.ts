import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

let tempDirs: string[] = [];

const tempPath = (name: string) => {
  const dir = mkdtempSync(join(tmpdir(), "worldloom-canon-workbench-"));
  tempDirs.push(dir);
  return join(dir, name);
};

const json = async <T,>(response: Response): Promise<T> => response.json() as Promise<T>;

const postJson = (app: ReturnType<typeof createApp>, path: string, payload?: unknown) =>
  app.request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload)
  });

const patchJson = (app: ReturnType<typeof createApp>, path: string, payload: unknown) =>
  app.request(path, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

const putJson = (app: ReturnType<typeof createApp>, path: string, payload: unknown) =>
  app.request(path, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

const fullGateSections = async (app: ReturnType<typeof createApp>, recordId: number, context: string) => {
  const response = await app.request(`/api/admission/records/${recordId}/gate`);
  expect(response.status).toBe(200);
  const payload = await json<{
    decisionPoint: {
      fullGateContract: {
        sections: Array<{ key: string; label: string; quietDomain: boolean }>;
      };
    };
  }>(response);
  return payload.decisionPoint.fullGateContract.sections.map((section) => ({
    key: section.key,
    substance: `${section.label} substance for ${context}.`,
    ...(section.quietDomain ? { quietDomainDeclaration: `No quiet-domain omission for ${context}.` } : {})
  }));
};

const createWorld = async (app: ReturnType<typeof createApp>, name = "canon-workbench.sqlite") => {
  const response = await postJson(app, "/api/worlds/create", { path: tempPath(name) });
  expect(response.status).toBe(201);
};

const createRecord = async (
  app: ReturnType<typeof createApp>,
  input: {
    recordTypeKey?: string;
    title: string;
    body?: string;
    truthLayer?: string;
    canonStatus?: string;
  }
) => {
  const response = await postJson(app, "/api/records", {
    recordTypeKey: input.recordTypeKey ?? "canon_fact",
    title: input.title,
    body: input.body ?? `${input.title} body`,
    truthLayer: input.truthLayer ?? "Objective canon",
    canonStatus: input.canonStatus ?? "accepted"
  });
  expect(response.status, input.title).toBe(201);
  return (await json<{ record: { id: number; shortId: string; recordTypeKey: string; title: string } }>(response)).record;
};

const createLink = async (
  app: ReturnType<typeof createApp>,
  fromRecordId: number,
  toRecordId: number,
  linkTypeKey: string,
  note = ""
) => {
  const response = await postJson(app, "/api/links", { fromRecordId, toRecordId, linkTypeKey, note });
  expect(response.status, `${fromRecordId} ${linkTypeKey} ${toRecordId}`).toBe(201);
  return json<{ link: { id: number } }>(response);
};

const mutationSnapshot = async (app: ReturnType<typeof createApp>, recordId: number) => {
  const [records, links, debt, history, sectionHistory, detail] = await Promise.all([
    json<{ records: Array<{ id: number; updatedAt: string; canonStatus: string }> }>(await app.request("/api/records")),
    json<{ links: unknown[] }>(await app.request("/api/links")),
    json<{ debt: Array<{ id: number; canonStatus: string }> }>(await app.request("/api/canon-debt?open=true")),
    json<{ history: unknown[] }>(await app.request(`/api/records/${recordId}/history`)),
    json<{ history: unknown[] }>(await app.request(`/api/records/${recordId}/section-history`)),
    json<{ advisoryDispositions: unknown[] }>(await app.request(`/api/canon-workbench/records/${recordId}`))
  ]);
  return {
    records: records.records.map((record) => ({ id: record.id, updatedAt: record.updatedAt, canonStatus: record.canonStatus })),
    linkCount: links.links.length,
    openDebt: debt.debt.map((row) => ({ id: row.id, canonStatus: row.canonStatus })),
    historyCount: history.history.length,
    sectionHistoryCount: sectionHistory.history.length,
    advisoryDispositionCount: detail.advisoryDispositions.length
  };
};

afterEach(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs = [];
});

describe("Canon Workbench HTTP API", () => {
  it("returns Current Canon defaults, explicit filters, branch gating, scan fields, and no writes", async () => {
    const app = createApp();
    await createWorld(app);

    const standing = await createRecord(app, {
      title: "Standing bridge law",
      body: "Bridge law stands today.",
      canonStatus: "accepted"
    });
    const constrained = await createRecord(app, {
      recordTypeKey: "capability",
      title: "Debt bells",
      body: "Debt bells work under price constraints.",
      canonStatus: "accepted with constraints"
    });
    const proposed = await createRecord(app, {
      title: "Proposed bridge rumor",
      canonStatus: "proposed"
    });
    const rejected = await createRecord(app, {
      title: "Rejected bridge rumor",
      canonStatus: "rejected"
    });
    const branchOnly = await createRecord(app, {
      title: "Branch bridge law",
      truthLayer: "branch canon",
      canonStatus: "branch-only"
    });
    await postJson(app, `/api/records/${standing.id}/facets`, {
      vocabulary: "consequence_mode",
      term: "weird"
    });
    const debt = (await json<{ debt: { id: number } }>(await postJson(app, "/api/canon-debt", {
      name: "Bridge law propagation debt",
      scope: "propagation",
      assignee: "steward"
    }))).debt;
    const advisory = (await json<{ record: { id: number } }>(await postJson(app, "/api/prompt-out/advisory-artifacts", {
      flowKey: "admission",
      stepKey: "canon-workbench-test",
      promptText: "Pressure the bridge law.",
      responseText: "Keep bridge costs visible."
    }))).record;
    await postJson(app, `/api/prompt-out/advisory-artifacts/${advisory.id}/dispositions`, {
      disposition: "standing ruling",
      note: "Bridge costs must remain visible.",
      standingRuling: true
    });
    await createLink(app, standing.id, debt.id, "requires_follow_up", "Open debt marker");
    await createLink(app, standing.id, advisory.id, "cites_advisory_artifact", "Advisory marker");
    await createLink(app, standing.id, constrained.id, "depends_on", "Important typed link");

    const before = await mutationSnapshot(app, standing.id);
    const current = await json<{
      rows: Array<{
        id: number;
        title: string;
        shortId: string;
        recordTypeKey: string;
        recordTypeLabel: string;
        truthLayer: string;
        canonStatus: string;
        continuityScope: string;
        relationshipMarkers: { hasOpenDebt: boolean; hasAdvisoryUse: boolean; typedLinkTypes: string[] };
      }>;
      filters: { defaultStatuses: string[]; branchOnlyIncluded: boolean };
    }>(await app.request("/api/canon-workbench/current"));
    const titles = current.rows.map((row) => row.title);
    expect(titles).toEqual(expect.arrayContaining(["Standing bridge law", "Debt bells"]));
    expect(titles).not.toEqual(expect.arrayContaining(["Proposed bridge rumor", "Rejected bridge rumor", "Branch bridge law"]));
    expect(current.filters.defaultStatuses).toEqual(["accepted", "accepted with constraints", "localized", "contested"]);
    expect(current.rows.find((row) => row.id === standing.id)).toMatchObject({
      shortId: standing.shortId,
      recordTypeKey: "canon_fact",
      recordTypeLabel: "Canon fact",
      truthLayer: "Objective canon",
      canonStatus: "accepted",
      continuityScope: "main continuity",
      relationshipMarkers: {
        hasOpenDebt: true,
        hasAdvisoryUse: true,
        typedLinkTypes: expect.arrayContaining(["requires_follow_up", "cites_advisory_artifact", "depends_on"])
      }
    });

    expect((await json<{ rows: Array<{ id: number }> }>(await app.request("/api/canon-workbench/current?canonStatus=proposed"))).rows.map((row) => row.id)).toEqual([proposed.id]);
    expect((await json<{ rows: Array<{ id: number }> }>(await app.request("/api/canon-workbench/current?canonStatus=rejected"))).rows.map((row) => row.id)).toEqual([rejected.id]);
    expect((await json<{ rows: Array<{ id: number }> }>(await app.request("/api/canon-workbench/current?recordType=capability"))).rows.map((row) => row.id)).toEqual([constrained.id]);
    expect((await json<{ rows: Array<{ id: number }> }>(await app.request("/api/canon-workbench/current?truthLayer=Objective%20canon&consequenceMode=weird"))).rows.map((row) => row.id)).toEqual([standing.id]);
    expect((await json<{ rows: Array<{ id: number }> }>(await app.request("/api/canon-workbench/current?openCanonDebt=true"))).rows.map((row) => row.id)).toEqual([standing.id]);
    expect((await json<{ rows: Array<{ id: number }> }>(await app.request("/api/canon-workbench/current?q=bridge%20law"))).rows.map((row) => row.id)).toContain(standing.id);
    expect((await json<{ rows: Array<{ id: number }>; filters: { branchOnlyIncluded: boolean } }>(await app.request("/api/canon-workbench/current?continuityScope=main%20continuity")))).toMatchObject({
      rows: expect.arrayContaining([expect.objectContaining({ id: branchOnly.id })]),
      filters: { branchOnlyIncluded: true }
    });
    expect((await json<{ rows: Array<{ id: number }> }>(await app.request("/api/canon-workbench/current?canonStatus=branch-only"))).rows.map((row) => row.id)).toEqual([branchOnly.id]);

    expect(await mutationSnapshot(app, standing.id)).toEqual(before);
  });

  it("returns report-spine Audit Trail attachments, record detail context, export affordance, and no writes", async () => {
    const app = createApp();
    await createWorld(app, "canon-workbench-audit.sqlite");

    const fact = await createRecord(app, {
      title: "Bridge law under audit",
      body: "Bridge tolls bind living and dead.",
      canonStatus: "proposed"
    });
    await postJson(app, `/api/admission/records/${fact.id}/severity`, {
      admissionLevel: "3",
      workScale: "major"
    });
    const factGate = await postJson(app, "/api/admission/gate/complete", {
      recordId: fact.id,
      truthLayer: "Objective canon",
      canonStatus: "accepted",
      operations: ["accept"],
      consequenceText: "Bridge tolls now affect legal access.",
      sections: await fullGateSections(app, fact.id, "bridge law audit"),
      notApplicableReasons: ["No branch implication."],
      quietDomainDeclarations: ["No spatial spread yet."]
    });
    expect(factGate.status).toBe(201);
    expect((await putJson(app, `/api/records/${fact.id}/sections`, {
      sections: [{ heading: "Fact statement", body: "Old bridge wording.", position: 1 }]
    })).status).toBe(200);
    expect((await putJson(app, `/api/records/${fact.id}/sections`, {
      sections: [{ heading: "Fact statement", body: "Current bridge wording.", position: 1 }]
    })).status).toBe(200);
    await patchJson(app, `/api/records/${fact.id}`, {
      body: "Bridge tolls bind living, dead, and courts."
    });
    await postJson(app, `/api/records/${fact.id}/facets`, {
      vocabulary: "consequence_mode",
      term: "weird"
    });
    const report = await createRecord(app, {
      recordTypeKey: "propagation_report",
      title: "Bridge law propagation report",
      body: "Report spine for bridge law.",
      canonStatus: "accepted"
    });
    const skip = (await json<{ record: { id: number } }>(await postJson(app, "/api/admission/skip", {
      recordId: fact.id,
      stepKey: "canon-workbench-skip",
      admissionLevel: "1",
      workScale: "minor"
    }))).record;
    const debt = (await json<{ debt: { id: number } }>(await postJson(app, "/api/canon-debt", {
      name: "Bridge court debt",
      scope: "propagation",
      assignee: "steward"
    }))).debt;
    const advisory = (await json<{ record: { id: number } }>(await postJson(app, "/api/prompt-out/advisory-artifacts", {
      flowKey: "propagation",
      flowId: 7,
      stepKey: "canon-workbench-audit",
      promptText: "Pressure bridge court effects.",
      responseText: "Name the court's toll office."
    }))).record;
    await postJson(app, `/api/prompt-out/advisory-artifacts/${advisory.id}/dispositions`, {
      disposition: "standing ruling",
      note: "Name institutions concretely.",
      standingRuling: true
    });
    const proposed = await createRecord(app, {
      title: "Bridge court proposal",
      canonStatus: "proposed"
    });
    await postJson(app, `/api/admission/records/${proposed.id}/severity`, {
      admissionLevel: "3",
      workScale: "major"
    });
    const gate = await json<{ gateResult: { id: number } }>(await postJson(app, "/api/admission/gate/complete", {
      recordId: proposed.id,
      truthLayer: "Objective canon",
      canonStatus: "accepted",
      operations: ["accept"],
      consequenceText: "Court tolls now affect legal access.",
      sections: await fullGateSections(app, proposed.id, "bridge court proposal"),
      notApplicableReasons: ["No branch implication."],
      quietDomainDeclarations: ["No spatial spread yet."]
    }));

    await createLink(app, report.id, fact.id, "derived_from", "Report affects fact");
    await createLink(app, report.id, skip.id, "covers", "Skip in context");
    await createLink(app, report.id, debt.id, "requires_follow_up", "Debt in context");
    await createLink(app, report.id, advisory.id, "cites_advisory_artifact", "Advisory in context");
    await createLink(app, fact.id, debt.id, "requires_follow_up", "Detail debt");
    await createLink(app, advisory.id, fact.id, "cites_advisory_artifact", "Detail advisory");
    await createLink(app, gate.gateResult.id, fact.id, "derived_from", "Gate affected current fact");

    const before = await mutationSnapshot(app, fact.id);
    const audit = await json<{
      spine: Array<{
        record: { id: number; title: string; mutationRegime: string };
        attachments: {
          recordHistory: unknown[];
          sectionHistory: unknown[];
          skipRecords: Array<{ id: number }>;
          canonDebtEvents: Array<{ record: { id: number }; history: unknown[] }>;
          advisoryArtifacts: Array<{ record: { id: number }; dispositions: unknown[] }>;
          standingRulings: unknown[];
          advisoryDispositions: unknown[];
          jurisdictionEvents: unknown[];
          typedLinkCreations: Array<{ linkTypeKey: string }>;
          flowRelationships: unknown[];
        };
        affectedCurrentRecords: Array<{ id: number; title: string }>;
      }>;
    }>(await app.request("/api/canon-workbench/audit"));

    expect(audit.spine.map((item) => item.record.mutationRegime)).toEqual(audit.spine.map(() => "report"));
    expect(audit.spine.map((item) => item.record.title)).toEqual(expect.arrayContaining(["Bridge law propagation report"]));
    const reportItem = audit.spine.find((item) => item.record.id === report.id);
    expect(reportItem).toBeTruthy();
    expect(reportItem?.affectedCurrentRecords).toEqual(expect.arrayContaining([expect.objectContaining({ id: fact.id, title: "Bridge law under audit" })]));
    expect(reportItem?.attachments.recordHistory.length).toBeGreaterThan(0);
    expect(reportItem?.attachments.sectionHistory.length).toBeGreaterThan(0);
    expect(reportItem?.attachments.skipRecords).toEqual(expect.arrayContaining([expect.objectContaining({ id: skip.id })]));
    expect(reportItem?.attachments.canonDebtEvents).toEqual(expect.arrayContaining([expect.objectContaining({ record: expect.objectContaining({ id: debt.id }) })]));
    expect(reportItem?.attachments.advisoryArtifacts).toEqual(expect.arrayContaining([expect.objectContaining({ record: expect.objectContaining({ id: advisory.id }), dispositions: expect.any(Array) })]));
    expect(reportItem?.attachments.standingRulings.length).toBeGreaterThan(0);
    expect(reportItem?.attachments.advisoryDispositions.length).toBeGreaterThan(0);
    expect(reportItem?.attachments.jurisdictionEvents.length).toBeGreaterThan(0);
    expect(reportItem?.attachments.typedLinkCreations.map((link) => link.linkTypeKey)).toEqual(expect.arrayContaining(["derived_from", "covers", "requires_follow_up", "cites_advisory_artifact"]));

    const detail = await json<{
      record: { id: number; shortId: string; title: string; recordTypeKey: string; truthLayer: string; canonStatus: string; continuityScope: string };
      facets: Array<{ vocabulary: string; term: string }>;
      sections: Array<{ heading: string; body: string }>;
      outgoingLinks: Array<{ linkTypeKey: string; target: { id: number; shortId: string; title: string }; note: string }>;
      incomingLinks: Array<{ linkTypeKey: string; source: { id: number; shortId: string; title: string }; note: string }>;
      recordHistory: unknown[];
      sectionHistory: unknown[];
      relatedReports: Array<{ id: number; title: string }>;
      canonDebt: Array<{ id: number; title: string }>;
      skipRecords: Array<{ id: number }>;
      advisoryArtifacts: Array<{ record: { id: number }; dispositions: unknown[] }>;
      standingRulings: unknown[];
      advisoryDispositions: unknown[];
      exportAffordance: { method: "GET"; href: string };
    }>(await app.request(`/api/canon-workbench/records/${fact.id}`));
    expect(detail.record).toMatchObject({
      id: fact.id,
      shortId: fact.shortId,
      recordTypeKey: "canon_fact",
      truthLayer: "Objective canon",
      canonStatus: "accepted",
      continuityScope: "main continuity"
    });
    expect(detail.facets).toEqual(expect.arrayContaining([expect.objectContaining({ vocabulary: "consequence_mode", term: "weird" })]));
    expect(detail.sections).toEqual([expect.objectContaining({ heading: "Fact statement", body: "Current bridge wording." })]);
    expect(detail.outgoingLinks).toEqual(expect.arrayContaining([expect.objectContaining({ linkTypeKey: "requires_follow_up", target: expect.objectContaining({ id: debt.id }) })]));
    expect(detail.incomingLinks).toEqual(expect.arrayContaining([
      expect.objectContaining({ linkTypeKey: "derived_from", source: expect.objectContaining({ id: report.id }) }),
      expect.objectContaining({ linkTypeKey: "cites_advisory_artifact", source: expect.objectContaining({ id: advisory.id }) })
    ]));
    expect(detail.recordHistory.length).toBeGreaterThan(0);
    expect(detail.sectionHistory.length).toBeGreaterThan(0);
    expect(detail.relatedReports).toEqual(expect.arrayContaining([expect.objectContaining({ id: report.id })]));
    expect(detail.canonDebt).toEqual(expect.arrayContaining([expect.objectContaining({ id: debt.id })]));
    expect(detail.skipRecords).toEqual(expect.arrayContaining([expect.objectContaining({ id: skip.id })]));
    expect(detail.advisoryArtifacts).toEqual(expect.arrayContaining([expect.objectContaining({ record: expect.objectContaining({ id: advisory.id }), dispositions: expect.any(Array) })]));
    expect(detail.standingRulings.length).toBeGreaterThan(0);
    expect(detail.advisoryDispositions.length).toBeGreaterThan(0);
    expect(detail.exportAffordance).toEqual({ method: "GET", href: `/api/records/${fact.id}/export/markdown` });

    await app.request("/api/canon-workbench/current");
    await app.request("/api/canon-workbench/audit");
    await app.request(`/api/canon-workbench/records/${fact.id}`);
    expect(await mutationSnapshot(app, fact.id)).toEqual(before);
  });
});
