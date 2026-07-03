import React from "react";
import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./main";

describe("Canon Workbench web surface", () => {
  it("renders the read-only workbench entry point, filters, empty states, synchronized views, and detail pane", () => {
    const html = renderToString(<App
      initialOpenWorld="/tmp/canon-workbench.sqlite"
      initialCanonCurrent={[{
        id: 1,
        shortId: "FAC-1",
        title: "Bridge law",
        recordTypeKey: "canon_fact",
        recordTypeLabel: "Canon fact",
        truthLayer: "Objective canon",
        canonStatus: "accepted",
        continuityScope: "main continuity",
        relationshipMarkers: {
          hasOpenDebt: true,
          hasAdvisoryUse: true,
          typedLinkTypes: ["requires_follow_up", "cites_advisory_artifact"]
        }
      }]}
      initialCanonAudit={[{
        record: { id: 2, shortId: "PRP-1", title: "Bridge report", recordTypeKey: "propagation_report", mutationRegime: "report" },
        authoredAt: "2026-07-03T00:00:00.000Z",
        attachments: {
          recordHistory: [{ id: 1 }],
          sectionHistory: [],
          skipRecords: [],
          canonDebtEvents: [],
          advisoryArtifacts: [],
          standingRulings: [],
          advisoryDispositions: [],
          jurisdictionEvents: [],
          typedLinkCreations: [{ id: 3, linkTypeKey: "derived_from" }],
          flowRelationships: []
        },
        affectedCurrentRecords: [{ id: 1, shortId: "FAC-1", title: "Bridge law", canonStatus: "accepted" }]
      }]}
      initialCanonDetail={{
        record: {
          id: 1,
          shortId: "FAC-1",
          title: "Bridge law",
          recordTypeKey: "canon_fact",
          recordTypeLabel: "Canon fact",
          truthLayer: "Objective canon",
          canonStatus: "accepted",
          continuityScope: "main continuity",
          body: "Bridge law body",
          createdAt: "2026-07-03T00:00:00.000Z",
          updatedAt: "2026-07-03T00:00:00.000Z"
        },
        facets: [{ id: 1, vocabulary: "consequence_mode", term: "weird", position: 1 }],
        sections: [{ id: 1, heading: "Fact statement", body: "Bridge law body", position: 1 }],
        outgoingLinks: [],
        incomingLinks: [],
        recordHistory: [],
        sectionHistory: [],
        relatedReports: [{ id: 2, shortId: "PRP-1", title: "Bridge report", recordTypeKey: "propagation_report" }],
        canonDebt: [{ id: 3, shortId: "DEB-1", title: "Bridge debt" }],
        skipRecords: [],
        advisoryArtifacts: [],
        standingRulings: [],
        advisoryDispositions: [],
        exportAffordance: { method: "GET", href: "/api/records/1/export/markdown" }
      }}
    />);

    expect(html).toContain("Canon Workbench");
    expect(html).toContain("Current Canon");
    expect(html).toContain("Audit Trail");
    expect(html).toContain("Canon Workbench text query");
    expect(html).toContain("Canon status filter");
    expect(html).toContain("Continuity scope filter");
    expect(html).toContain("Open canon debt");
    expect(html).toContain("Bridge law");
    expect(html).toContain("Open debt");
    expect(html).toContain("Advisory use");
    expect(html).toContain("Report spine");
    expect(html).toContain("Affected current records");
    expect(html).toContain("Detail pane");
    expect(html).toContain("Export Markdown");

    const emptyHtml = renderToString(<App />);
    expect(emptyHtml).toContain("No world is open");
  });

  it("consumes Canon Workbench API shapes instead of duplicating server read policy", () => {
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(source).toContain("/api/canon-workbench/current");
    expect(source).toContain("/api/canon-workbench/audit");
    expect(source).toContain("/api/canon-workbench/records/");
    expect(source).toContain("selectCurrentCanonRow");
    expect(source).toContain("selectAuditTrailItem");
    expect(source).toContain("affectedCurrentRecords");
    expect(source).not.toContain("force-directed");
  });
});
