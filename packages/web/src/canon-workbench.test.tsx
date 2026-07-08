import React from "react";
import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./main";

const workflowMap = {
  readOnly: true,
  world: { path: "/tmp/canon-workbench.sqlite" },
  stages: [
    { key: "creation", label: "Creation", state: "complete", summary: "Creation has parked seed material.", destinationKey: "creation" },
    { key: "admission", label: "Admission", state: "complete", summary: "Admission has accepted canon standing.", destinationKey: "admission" }
  ],
  queues: [],
  nextDecision: {
    destinationKey: "canon-workbench",
    label: "Read current canon",
    reason: "Current standing and provenance are available.",
    href: "/api/canon-workbench/current"
  },
  destinations: [
    { key: "canon-workbench", label: "Canon Workbench", kind: "read-side", summary: "Read current canon and audit trail.", state: "available" }
  ]
};

const currentRow = {
  id: 1,
  shortId: "FAC-1",
  title: "Bridge law",
  recordTypeKey: "canon_fact",
  recordTypeLabel: "Canon fact",
  truthLayer: "Objective canon",
  canonStatus: "accepted",
  continuityScope: "main continuity",
  currentLivingText: "Bridge law current standing",
  gateProvenance: {
    hasGateResult: true,
    hasProposalHistory: true,
    hasLinkedDebt: true
  },
  relationshipMarkers: {
    hasOpenDebt: true,
    hasAdvisoryUse: true,
    typedLinkTypes: ["requires_follow_up", "cites_advisory_artifact"]
  }
};

const auditItem = {
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
};

const detail = {
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
  standingProvenance: {
    currentLivingText: "Bridge law current standing",
    proposalHistoryText: "Bridge law original proposal",
    gateAuditText: "Fact statement: Bridge law current standing",
    admissionOperation: "constrain",
    constraintTags: ["cost-bound"],
    linkedPropagationDebt: [{ id: 3, shortId: "DEB-1", title: "Bridge debt", recordTypeKey: "canon_debt", sourceRelationship: "derived_from" }],
    typedLinkTrail: [{ linkTypeKey: "derived_from", note: "Admission-created propagation debt source fact" }]
  },
  skipRecords: [],
  advisoryArtifacts: [],
  standingRulings: [],
  advisoryDispositions: [],
  exportAffordance: { method: "GET", href: "/api/records/1/export/markdown" }
};

describe("Canon Workbench web surface", () => {
  it("renders the read-only workbench entry point, filters, empty states, synchronized views, and detail pane", () => {
    const html = renderToString(<App
      initialOpenWorld="/tmp/canon-workbench.sqlite"
      initialCanonCurrent={[currentRow]}
      initialCanonAudit={[auditItem]}
      initialCanonDetail={detail}
    />);

    expect(html).toContain("Canon Workbench");
    expect(html).toContain("Current Canon");
    expect(html).toContain("Audit Trail");
    expect(html).toContain("Canon Workbench text query");
    expect(html).toContain("Canon status filter");
    expect(html).toContain("Continuity scope filter");
    expect(html).toContain("Open canon debt");
    expect(html).toContain("Bridge law");
    expect(html).toContain("Current living text");
    expect(html).toContain("Bridge law current standing");
    expect(html).toContain("Gate provenance");
    expect(html).toContain("proposal history");
    expect(html).toContain("Open debt");
    expect(html).toContain("Advisory use");
    expect(html).toContain("Report spine");
    expect(html).toContain("Affected current records");
    expect(html).toContain("Detail pane");
    expect(html).toContain("Proposal/source history");
    expect(html).toContain("Gate audit text");
    expect(html).toContain("Admission operation");
    expect(html).toContain("Linked propagation debt");
    expect(html).toContain("Bridge law original proposal");
    expect(html).toContain("Export Markdown");

    const emptyHtml = renderToString(<App />);
    expect(emptyHtml).toContain("Setup/open world");
    expect(emptyHtml).toContain("No world open");
  });

  it("renders current standing provenance on the routed Workbench destination", () => {
    const html = renderToString(<App
      initialOpenWorld="/tmp/canon-workbench.sqlite"
      initialWorkflowMap={workflowMap as any}
      initialDestination="canon-workbench"
      initialCanonCurrent={[currentRow]}
      initialCanonAudit={[auditItem]}
      initialCanonDetail={detail}
    />);

    expect(html).toContain("Current living text");
    expect(html).toContain("Bridge law current standing");
    expect(html).toContain("Gate provenance");
    expect(html).toContain("Standing provenance");
    expect(html).toContain("Proposal/source history");
    expect(html).toContain("Linked propagation debt");
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
