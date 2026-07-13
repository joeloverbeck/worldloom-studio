// @vitest-environment jsdom
import React, { useState } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  TemporalRevisionWorkspace,
  type TemporalCoverageDraft,
  type TemporalRevisionStateView
} from "./temporal-revision-workspace";

afterEach(cleanup);

const authoritative: TemporalCoverageDraft = {
  temporalQuestions: "The bell became true after the foundry accident and was understood after the third death.",
  firstTrueOrRelativeSequence: "The accident precedes the bell, three deaths, public proof, and the first ordinance.",
  firstKnownOrReason: "Archivists identify the recurrence after three deaths and publish it one season later.",
  dateTypesAndGranularity: "Event, discovery, public, institutional, ordinary-life, mythic, and authorial dates stay separate by season.",
  latency: "Proof takes three deaths and regulation takes one further season.",
  residueByTimescale: "Panic appears in days, licensing in years, and inherited bell offices in generations.",
  sequenceIntegrity: "No ordinance predates public proof of the third death.",
  retrospectiveInsertion: "Earlier scenes gain rumors and price movement but no settled regulation.",
  temporalMysteryBoundaries: "False positives remain observable while the bell's cause stays author-secret.",
  outcomeDecision: "Close only after current support or a governed skip."
};

const revisionState: TemporalRevisionStateView = {
  lifecycleState: "open",
  active: {
    id: 41,
    lineageId: "temporal-coverage:lineage",
    version: 1,
    lifecycleState: "active",
    priorVersionId: null,
    revisionReason: null,
    values: authoritative,
    provenance: { actor: "steward", timestamp: "2026-07-13T00:00:00Z", flowStep: "temporal:coverage:first-save" },
    retirementProvenance: null
  },
  lineage: [],
  activeSet: { revision: 1, identity: "temporal:7:1:41", changedRevisionId: 41, changedReason: "first save", pressureUsedRevision: 1, pressureOwedRevision: null, pressureSkipRevision: null }
};
revisionState.lineage = [revisionState.active!];

function Harness({ onRevise }: { onRevise: (input: { expectedRevisionId: number; reason: string; coverage: TemporalCoverageDraft }) => Promise<void> }) {
  const [coverage, setCoverage] = useState(authoritative);
  return <TemporalRevisionWorkspace
    runId={7}
    revisionState={revisionState}
    coverage={coverage}
    blockers={[{ key: "pressure_currentness", label: "Current Pressure or governed skip", message: "Load current Pressure or record the governed skip." }]}
    preview={null}
    onCoverageChange={setCoverage}
    onSave={vi.fn()}
    onRevise={onRevise}
    onRecover={async () => authoritative}
    onPreview={async () => undefined}
    onClose={async () => undefined}
  />;
}

describe("TemporalRevisionWorkspace", () => {
  it("preserves a refused four-lens draft, announces adjacent remediation, then discards to authoritative state with predictable focus", async () => {
    const onRevise = vi.fn(async () => {
      throw Object.assign(new Error("revision refused"), { payload: { error: "Revision target is stale.", remediation: "Refresh the active revision and save again." } });
    });
    render(<Harness onRevise={onRevise} />);

    const changes: Array<[string, string]> = [
      ["First True or Relative Sequence", "The accident precedes the bell, three deaths, proof, a failed hearing, and the ordinance."],
      ["Latency and Residue", "A failed hearing adds a second season before regulation."],
      ["Residue by Timescale", "Hearing transcripts join licenses and inherited bell offices."],
      ["Sequence Integrity", "Public proof precedes the failed hearing, which precedes the ordinance."]
    ];
    for (const [label, value] of changes) fireEvent.change(screen.getByRole("textbox", { name: label }), { target: { value } });
    fireEvent.change(screen.getByRole("textbox", { name: "Revision reason" }), { target: { value: "Pressure exposed the missing hearing." } });
    fireEvent.click(screen.getByRole("button", { name: "Save Material Revision" }));

    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Revision target is stale."));
    expect(screen.getByRole("alert").textContent).toContain("Refresh the active revision and save again.");
    expect(document.activeElement).toBe(screen.getByRole("alert"));
    for (const [label, value] of changes) expect((screen.getByRole("textbox", { name: label }) as HTMLTextAreaElement).value).toBe(value);
    expect(screen.getByText(/State: failed/)).toBeTruthy();
    expect(onRevise).toHaveBeenCalledWith(expect.objectContaining({ expectedRevisionId: 41, reason: "Pressure exposed the missing hearing.", coverage: expect.objectContaining({ latency: changes[1][1], sequenceIntegrity: changes[3][1] }) }));

    fireEvent.click(screen.getByRole("button", { name: "Discard unsaved changes" }));
    await waitFor(() => expect(screen.getByRole("status").textContent).toContain("authoritative active revision restored"));
    expect(document.activeElement).toBe(screen.getByRole("status"));
    for (const [label] of changes) {
      const key = label === "First True or Relative Sequence" ? "firstTrueOrRelativeSequence" : label === "Latency and Residue" ? "latency" : label === "Residue by Timescale" ? "residueByTimescale" : "sequenceIntegrity";
      expect((screen.getByRole("textbox", { name: label }) as HTMLTextAreaElement).value).toBe(authoritative[key]);
    }
  });

  it("renders server lineage, blocker, currentness, report doctrine, and keyboard-operable finalization controls", () => {
    render(<Harness onRevise={async () => undefined} />);
    expect(screen.getByText(/temporal:7:1:41/)).toBeTruthy();
    expect(screen.getByText(/Current Pressure or governed skip/)).toBeTruthy();
    expect(screen.getByText(/append-only final or correction report/)).toBeTruthy();
    expect(screen.getByText(/Revision lineage/)).toBeTruthy();
    expect((screen.getByRole("button", { name: "Finalize Active Temporal Revision" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByText(/Revision lineage/));
    expect(screen.getByText(/temporal:coverage:first-save/)).toBeTruthy();
  });

  it("restores a server-persisted failed draft and its close blocker after remount", async () => {
    const attempted = { ...authoritative, latency: "short", sequenceIntegrity: "Proof, failed hearing, ordinance." };
    const failedState: TemporalRevisionStateView = {
      ...revisionState,
      draftState: {
        status: "failed",
        dirty: true,
        failed: true,
        attemptedInput: { ...attempted, reason: "Persist this failed attempt." },
        error: "Latency requires steward-authored substance.",
        remediation: "Save again or discard to the authoritative active revision."
      }
    };
    render(<TemporalRevisionWorkspace
      runId={7}
      revisionState={failedState}
      coverage={attempted}
      blockers={[{ key: "failed_revision_attempt", label: "Failed revision attempt", message: "Save again or discard before close." }]}
      preview={null}
      onCoverageChange={vi.fn()}
      onSave={vi.fn()}
      onRevise={vi.fn()}
      onRecover={async () => authoritative}
      onPreview={async () => undefined}
      onClose={vi.fn()}
    />);

    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Latency requires steward-authored substance."));
    expect((screen.getByRole("textbox", { name: "Latency and Residue" }) as HTMLTextAreaElement).value).toBe("short");
    expect((screen.getByRole("textbox", { name: "Revision reason" }) as HTMLInputElement).value).toBe("Persist this failed attempt.");
    expect(screen.getByText(/Failed revision attempt: Save again or discard before close/)).toBeTruthy();
    expect((screen.getByRole("button", { name: "Finalize Active Temporal Revision" }) as HTMLButtonElement).disabled).toBe(true);
  });
});
