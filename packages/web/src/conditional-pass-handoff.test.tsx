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
  packageSources: [
    "docs/worldbuilding-system/03_truth_layers_and_canon_governance.md",
    "docs/worldbuilding-system/07_propagation_engine.md",
    "docs/worldbuilding-system/22_glossary.md"
  ],
  fieldClassifications: {
    required: ["reason"],
    optional: [],
    skippable: ["governed deferral with written rationale"],
    severityDependent: []
  },
  blocker: null,
  remediation: null,
  destination: {
    destinationKey: "temporal",
    label: "Temporal/Timeline",
    method: "POST",
    href: "/api/temporal/runs/start",
    available: true,
    blocker: null,
    body: { sourceType: "fact", recordId: 3, conditionalPassObligationId: 1, propagationReportRecordId: 9 }
  },
  provenance: { actor: "steward", timestamp: "2026-07-12T10:00:00.000Z", flowStep: "propagation:close", sourceFact: { id: 3, shortId: "FAC-3" }, propagationReport: { id: 9, shortId: "PRP-1" } },
  history: [],
  readSideTrail: [],
  action: {
    kind: "defer",
    label: "Defer with rationale",
    method: "POST",
    href: "/api/conditional-pass-obligations/1/defer",
    requiredReason: true,
    requiredRationale: true,
    reasonLabel: "Deferral rationale",
    identityGuards: ["passKey", "sourceFactRecordId", "propagationReportRecordId"],
    body: {
      disposition: "deferred",
      expectedDisposition: "outstanding",
      passKey: "temporal_timeline",
      sourceFactRecordId: 3,
      propagationReportRecordId: 9
    },
    proposedWrite: "Defer Temporal/Timeline.",
    willLeaveUntouched: ["source fact", "report", "Admission queue"]
  }
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
      onReinstateConditionalPass={async () => undefined}
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
      onReinstateConditionalPass={async () => undefined}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Follow source-selected pass" }));
    expect(onFollow).toHaveBeenCalledWith(obligation);
  });

  it("renders persisted governed readback after a successful deferral and fresh all-governed payload", async () => {
    const rationale = "Govern chronology in the next dedicated steward pass.";
    const onDefer = vi.fn().mockResolvedValue(undefined);
    const view = render(<WorkflowMapHome
      workflowMap={workflowMap}
      onNavigate={() => undefined}
      onFollowConditionalPass={() => undefined}
      onDeferConditionalPass={onDefer}
      onReinstateConditionalPass={async () => undefined}
    />);

    fireEvent.change(screen.getByLabelText("Deferral rationale"), { target: { value: rationale } });
    fireEvent.click(screen.getByRole("button", { name: "Defer with rationale" }));
    await waitFor(() => expect(onDefer).toHaveBeenCalledWith(obligation, rationale));

    view.rerender(<WorkflowMapHome
      workflowMap={{
        ...workflowMap,
        nextDecision: { destinationKey: "admission", label: "Work Admission queue", reason: "Proposed facts are waiting for governance.", href: "/api/admission/queue" },
        conditionalPasses: {
          ...workflowMap.conditionalPasses,
          outstandingCount: 0,
          governedCount: 1,
          nextOrResumeState: { current: null, next: null, resume: "Return to a fresh map." },
          obligations: [{ ...obligation, disposition: "deferred", rationale, action: null }]
        }
      } as any}
      onNavigate={() => undefined}
      onFollowConditionalPass={() => undefined}
      onDeferConditionalPass={onDefer}
      onReinstateConditionalPass={async () => undefined}
    />);

    expect(screen.getByText("Work Admission queue")).toBeTruthy();
    expect(screen.getByText("Current: fully governed")).toBeTruthy();
    expect(screen.getByText((_, element) => element?.tagName === "P" && element.textContent === `Deferral rationale: ${rationale}`)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Defer with rationale" })).toBeNull();
  });

  it("renders the server-owned reinstatement decision and preserves reason, focus, and remediation after refusal", async () => {
    const deferred = {
      ...obligation,
      disposition: "deferred",
      rationale: "Wait until the chrononaut archive is indexed.",
      destination: {
        ...obligation.destination,
        available: false,
        blocker: "The source-selected pass route is available only while the obligation is outstanding."
      },
      history: [
        {
          action: "deferred",
          priorState: "outstanding",
          resultingState: "deferred",
          rationale: "Wait until the chrononaut archive is indexed.",
          evidenceRecordId: null,
          actor: "steward",
          timestamp: "2026-07-12T10:05:00.000Z",
          flowStep: "conditional-pass-obligation:defer"
        }
      ],
      readSideTrail: [
        { label: "Source fact FAC-3", recordId: 3, href: "/api/canon-workbench/records/3" },
        { label: "Propagation report PRP-1", recordId: 9, href: "/api/canon-workbench/records/9" },
        { label: "Obligation CPO-1", recordId: 10, href: "/api/canon-workbench/records/10" }
      ],
      action: {
        kind: "reinstate",
        label: "Reinstate obligation",
        method: "POST",
        href: "/api/conditional-pass-obligations/1/reinstate",
        requiredReason: true,
        requiredRationale: true,
        reasonLabel: "Reinstatement reason",
        identityGuards: ["passKey", "sourceFactRecordId", "propagationReportRecordId"],
        body: {
          disposition: "outstanding",
          expectedDisposition: "deferred",
          passKey: "temporal_timeline",
          sourceFactRecordId: 3,
          propagationReportRecordId: 9
        },
        proposedWrite: "Reinstate Temporal/Timeline and restore its source-selected route.",
        willLeaveUntouched: ["source fact", "Propagation report", "prior events", "Admission queue"]
      }
    } as const;
    const onDefer = vi.fn();
    const onReinstate = vi.fn().mockRejectedValue(new Error(
      "Conditional-pass reinstatement requires a non-empty written reason. Remediation: Enter a substantive reinstatement reason and retry."
    ));
    render(<WorkflowMapHome
      workflowMap={{
        ...workflowMap,
        conditionalPasses: { ...workflowMap.conditionalPasses, outstandingCount: 0, governedCount: 1, obligations: [deferred] }
      } as any}
      onNavigate={() => undefined}
      onFollowConditionalPass={() => undefined}
      onDeferConditionalPass={onDefer}
      onReinstateConditionalPass={onReinstate}
    />);

    expect(screen.getByRole("heading", { name: "Preview governed reinstatement" })).toBeTruthy();
    expect(screen.getByText("Required fields: reason")).toBeTruthy();
    expect(screen.getByText("Optional fields: none")).toBeTruthy();
    expect(screen.getByText("Severity-dependent fields: none")).toBeTruthy();
    expect((screen.getByRole("button", { name: "Follow source-selected pass" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole("link", { name: "Source fact FAC-3" }).getAttribute("href")).toBe("/api/canon-workbench/records/3");

    const reason = screen.getByLabelText("Reinstatement reason") as HTMLTextAreaElement;
    fireEvent.change(reason, { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Reinstate obligation" }));

    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/reinstatement requires.*Remediation/i));
    expect(onDefer).not.toHaveBeenCalled();
    expect(onReinstate).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }), "   ");
    expect(reason.value).toBe("   ");
    expect(document.activeElement).toBe(reason);
    expect(screen.getByText(/deferred: outstanding → deferred.*Wait until the chrononaut archive is indexed/i)).toBeTruthy();
  });

  it("rerenders one active handoff from successful reinstatement to restored routing and complete history", async () => {
    const deferralReason = "Wait until the chrononaut archive is indexed.";
    const reinstatementReason = "The archive is indexed; Temporal work is owed again.";
    const deferred = {
      ...obligation,
      disposition: "deferred",
      rationale: deferralReason,
      destination: { ...obligation.destination, available: false, blocker: "Reinstate before following this route." },
      history: [{
        action: "deferred",
        priorState: "outstanding",
        resultingState: "deferred",
        rationale: deferralReason,
        evidenceRecordId: null,
        actor: "steward",
        timestamp: "2026-07-12T10:05:00.000Z",
        flowStep: "conditional-pass-obligation:defer"
      }],
      action: {
        ...obligation.action,
        kind: "reinstate",
        label: "Reinstate obligation",
        href: "/api/conditional-pass-obligations/1/reinstate",
        reasonLabel: "Reinstatement reason",
        body: {
          ...obligation.action.body,
          disposition: "outstanding",
          expectedDisposition: "deferred"
        },
        proposedWrite: "Reinstate Temporal/Timeline and restore its source-selected route."
      }
    } as const;
    const onReinstate = vi.fn().mockResolvedValue(undefined);
    const view = render(<WorkflowMapHome
      workflowMap={{
        ...workflowMap,
        conditionalPasses: { ...workflowMap.conditionalPasses, outstandingCount: 0, governedCount: 1, obligations: [deferred] }
      } as any}
      onNavigate={() => undefined}
      onFollowConditionalPass={() => undefined}
      onDeferConditionalPass={async () => undefined}
      onReinstateConditionalPass={onReinstate}
    />);

    fireEvent.change(screen.getByLabelText("Reinstatement reason"), { target: { value: reinstatementReason } });
    fireEvent.click(screen.getByRole("button", { name: "Reinstate obligation" }));
    await waitFor(() => expect(onReinstate).toHaveBeenCalledWith(deferred, reinstatementReason));

    const refreshed = {
      ...obligation,
      disposition: "outstanding",
      rationale: null,
      history: [
        ...deferred.history,
        {
          action: "reinstated",
          priorState: "deferred",
          resultingState: "outstanding",
          rationale: reinstatementReason,
          evidenceRecordId: null,
          actor: "steward",
          timestamp: "2026-07-12T10:10:00.000Z",
          flowStep: "conditional-pass-obligation:reinstate"
        }
      ]
    } as const;
    view.rerender(<WorkflowMapHome
      workflowMap={{
        ...workflowMap,
        queues: [{ key: "admission", label: "Admission queue", count: 1, destinationKey: "admission", href: "/api/admission/queue", summary: "Admission remains directly navigable." }],
        conditionalPasses: {
          ...workflowMap.conditionalPasses,
          outstandingCount: 1,
          governedCount: 0,
          nextOrResumeState: { current: "Temporal/Timeline", next: null, resume: "Return safely to a fresh map." },
          obligations: [refreshed]
        }
      } as any}
      onNavigate={() => undefined}
      onFollowConditionalPass={() => undefined}
      onDeferConditionalPass={async () => undefined}
      onReinstateConditionalPass={onReinstate}
    />);

    expect((screen.getByRole("button", { name: "Follow source-selected pass" }) as HTMLButtonElement).disabled).toBe(false);
    expect(screen.queryByRole("button", { name: "Reinstate obligation" })).toBeNull();
    expect(screen.getByRole("button", { name: "Defer with rationale" })).toBeTruthy();
    expect((screen.getByLabelText("Deferral rationale") as HTMLTextAreaElement).value).toBe("");
    expect(screen.getByLabelText("Temporal/Timeline current state: outstanding")).toBeTruthy();
    expect(screen.getByText(/reinstated: deferred → outstanding.*The archive is indexed/i)).toBeTruthy();
    expect(screen.getByText("Admission remains directly navigable.")).toBeTruthy();
  });

  it("renders direct deferred coverage as terminal current state without fabricating reinstatement", () => {
    const deferralReason = "Defer while matching Temporal work continues through another valid route.";
    const covered = {
      ...obligation,
      disposition: "covered",
      rationale: null,
      coveringEvidence: {
        id: 20,
        shortId: "PAS-1",
        recordTypeKey: "pass_report",
        title: "Completed Temporal pass",
        body: "Substantive matching evidence.",
        canonStatus: "accepted"
      },
      blocker: "Covered Conditional-pass obligations are terminal in this lifecycle.",
      remediation: "Correct completed work through the owning specialized flow.",
      destination: {
        ...obligation.destination,
        available: false,
        blocker: "The source-selected pass route is available only while the obligation is outstanding."
      },
      history: [
        {
          action: "deferred",
          priorState: "outstanding",
          resultingState: "deferred",
          rationale: deferralReason,
          evidenceRecordId: null,
          actor: "steward",
          timestamp: "2026-07-12T10:05:00.000Z",
          flowStep: "conditional-pass-obligation:defer"
        },
        {
          action: "covered",
          priorState: "deferred",
          resultingState: "covered",
          rationale: null,
          evidenceRecordId: 20,
          actor: "steward",
          timestamp: "2026-07-12T10:20:00.000Z",
          flowStep: "temporal:complete"
        }
      ],
      readSideTrail: [
        { label: "Covering report PAS-1", recordId: 20, href: "/api/canon-workbench/records/20" }
      ],
      action: null
    } as const;

    render(<WorkflowMapHome
      workflowMap={{
        ...workflowMap,
        conditionalPasses: { ...workflowMap.conditionalPasses, outstandingCount: 0, governedCount: 1, obligations: [covered] }
      } as any}
      onNavigate={() => undefined}
      onFollowConditionalPass={() => undefined}
      onDeferConditionalPass={async () => undefined}
      onReinstateConditionalPass={async () => undefined}
    />);

    expect(screen.getByLabelText("Temporal/Timeline current state: covered")).toBeTruthy();
    expect(screen.getByText((_, element) =>
      element?.tagName === "P"
      && element.textContent === "Coverage evidence: PAS-1 · Completed Temporal pass"
    )).toBeTruthy();
    expect(screen.getByText(/deferred: outstanding → deferred.*another valid route/i)).toBeTruthy();
    expect(screen.getByText(/covered: deferred → covered.*evidence record 20/i)).toBeTruthy();
    expect(screen.queryByText(/reinstated:/i)).toBeNull();
    expect(screen.queryByRole("button", { name: "Reinstate obligation" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Defer with rationale" })).toBeNull();
    expect(screen.getByRole("link", { name: "Covering report PAS-1" })).toBeTruthy();
  });
});
