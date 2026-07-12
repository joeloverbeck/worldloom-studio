// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WorkflowMapHome } from "./workflow-shell.js";

const obligation = {
  id: 1,
  record: { id: 10, shortId: "CPO-1", recordTypeKey: "conditional_pass_obligation", title: "Temporal owed", body: "Structured identity.", canonStatus: "accepted" },
  sourceFact: { id: 3, shortId: "FAC-3", recordTypeKey: "canon_fact", title: "Foundational chrononaut", body: "Source.", canonStatus: "accepted" },
  propagationReport: { id: 9, shortId: "PRP-1", recordTypeKey: "propagation_report", title: "Chrononaut shock cone", body: "Report.", canonStatus: "accepted" },
  passKey: "temporal_timeline",
  passLabel: "Temporal/Timeline",
  ordinal: 1,
  disposition: "outstanding",
  rationale: null,
  coveringEvidence: null,
  doctrine: "Foundational Propagation owes this pass.",
  blocker: null,
  destination: { destinationKey: "temporal", label: "Temporal/Timeline", method: "POST", href: "/api/temporal/runs/start", body: { sourceType: "fact", recordId: 3 } },
  provenance: { actor: "steward", timestamp: "2026-07-12T10:00:00.000Z", flowStep: "propagation:close", sourceFact: { id: 3, shortId: "FAC-3" }, propagationReport: { id: 9, shortId: "PRP-1" } },
  history: [],
  readSideTrail: [],
  action: { method: "POST", href: "/api/conditional-pass-obligations/1/defer", requiredRationale: true, body: { disposition: "deferred", passKey: "temporal_timeline", sourceFactRecordId: 3, propagationReportRecordId: 9 }, proposedWrite: "Defer Temporal/Timeline.", willLeaveUntouched: ["source fact", "report", "Admission queue"] }
} as const;

const workflowMap = {
  readOnly: true,
  world: { path: "/tmp/conditional.sqlite" },
  stages: [],
  queues: [],
  destinations: [],
  nextDecision: { destinationKey: "temporal", label: "Work Temporal/Timeline", reason: "Typed obligation is first.", href: "/api/temporal/runs/start" },
  conditionalPasses: {
    readOnly: true,
    doctrine: "Full-pass doctrine; Admission remains available.",
    outstandingCount: 1,
    governedCount: 0,
    obligations: [obligation],
    nextOrResumeState: { current: "Temporal/Timeline", next: null, resume: "Return to a fresh map." }
  }
} as any;

afterEach(cleanup);

describe("post-Propagation conditional-pass handoff", () => {
  it("preserves the steward's rationale and renders an adjacent server blocker after failed deferral", async () => {
    const onDefer = vi.fn().mockRejectedValue(new Error("Conditional-pass deferral requires a non-empty written rationale"));
    render(<WorkflowMapHome
      workflowMap={workflowMap}
      onNavigate={() => undefined}
      onFollowConditionalPass={() => undefined}
      onDeferConditionalPass={onDefer}
    />);

    const rationale = screen.getByLabelText("Deferral rationale") as HTMLTextAreaElement;
    fireEvent.change(rationale, { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Defer with rationale" }));

    await waitFor(() => expect(screen.getByText("Conditional-pass deferral requires a non-empty written rationale")).toBeTruthy());
    expect(rationale.value).toBe("   ");
    expect(onDefer).toHaveBeenCalledWith(expect.objectContaining({ id: 1, passKey: "temporal_timeline" }), "   ");
  });

  it("passes the exact server-returned obligation to source-selected navigation", () => {
    const onFollow = vi.fn();
    render(<WorkflowMapHome
      workflowMap={workflowMap}
      onNavigate={() => undefined}
      onFollowConditionalPass={onFollow}
      onDeferConditionalPass={async () => undefined}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Follow source-selected pass" }));
    expect(onFollow).toHaveBeenCalledWith(obligation);
  });
});
