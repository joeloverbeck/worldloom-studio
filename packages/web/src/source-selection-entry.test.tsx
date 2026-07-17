// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GuidedFlowSourceSelection } from "@worldloom/shared";
import {
  SourceSelectionEntry,
  sourceIdentityDiscontinuity,
  sourceSelectionDraftFromSelection,
  type SourceSelectionDraft
} from "./source-selection-entry.js";

const baseDraft: SourceSelectionDraft = {
  sourceType: "fact",
  recordId: "3",
  sectionHeading: "",
  materialTitle: "",
  materialBody: ""
};

const destinations = [
  { passKey: "temporal_timeline", destinationKey: "temporal", label: "Temporal/Timeline", startLabel: "Start or Resume Temporal" },
  { passKey: "constraint_composition", destinationKey: "constraint", label: "Constraint Composition", startLabel: "Start or Resume Constraint Composition" },
  { passKey: "institutional_economic_suppression", destinationKey: "stage12", label: "Institutional / Economic / Suppression", startLabel: "Start or Resume Stage-12" }
] as const;

const resolvedSelection = (destination: {
  passKey: GuidedFlowSourceSelection["destination"]["passKey"];
  destinationKey: string;
  label: string;
}): GuidedFlowSourceSelection => ({
  contract: "Source-selected guided-flow run entry",
  destination: {
    ...destination,
    packageSources: [
      "docs/worldbuilding-system/08_constraint_composition.md",
      "docs/worldbuilding-system/09_temporal_and_timeline_protocol.md",
      "docs/worldbuilding-system/12_institutional_economic_and_suppression_protocol.md"
    ]
  },
  request: { sourceType: "fact", recordId: 3, sectionHeading: null, materialTitle: "", materialBody: "" },
  validation: {
    state: "resolved",
    valid: true,
    blocker: null,
    remediation: null,
    substanceRule: "The resolved canon_fact is compatible with this server-owned source mode."
  },
  identity: {
    stableRecordId: 3,
    shortId: "FAC-3",
    title: "Foundational chrononaut access",
    recordTypeKey: "canon_fact",
    canonStatus: "accepted",
    truthLayer: "Objective canon"
  },
  selectedMaterial: null,
  binding: {
    valid: true,
    passKey: destination.passKey,
    passLabel: destination.label,
    obligation: { stableRecordId: 12, shortId: "CPO-1", title: "Specialized pass owed", recordTypeKey: "conditional_pass_obligation", canonStatus: "accepted", truthLayer: "Objective canon" },
    sourceFact: { stableRecordId: 3, shortId: "FAC-3", title: "Foundational chrononaut access", recordTypeKey: "canon_fact", canonStatus: "accepted", truthLayer: "Objective canon" },
    propagationReport: { stableRecordId: 9, shortId: "PRP-1", title: "Foundational propagation", recordTypeKey: "propagation_report", canonStatus: "accepted", truthLayer: "Objective canon" },
    destinationKey: destination.destinationKey,
    disposition: "outstanding",
    doctrine: `${destination.label} is owed because FAC-3 has an outstanding Conditional-pass obligation from PRP-1.`
  },
  storedRunIdentity: null,
  doctrine: {
    selectedSource: "FAC-3 · Foundational chrononaut access",
    validity: "The server resolved this current source.",
    conditionalPassReason: `${destination.label} is owed because FAC-3 remains outstanding after PRP-1.`,
    stableIdentity: "Stable record id 3 preserves continuity while descriptive fields may refresh."
  },
  fieldClassifications: {
    required: ["stable record id", "validation state"],
    optional: ["record-section heading"],
    skippable: ["governed Conditional-pass deferral with written rationale"],
    severityDependent: []
  },
  orientation: {
    current: `${destination.label} source selection resolved`,
    next: "Start or resume against this same authoritative stable identity.",
    resume: "Return to a freshly loaded Workflow map to choose another route.",
    safeReturnHref: "/api/workflow-map"
  },
  action: { startOrResumeAvailable: true }
});

const renderEntry = (overrides: Partial<React.ComponentProps<typeof SourceSelectionEntry>> = {}) => {
  const props: React.ComponentProps<typeof SourceSelectionEntry> = {
    idPrefix: "test-source",
    draft: baseDraft,
    sourceModes: [
      { value: "fact", label: "fact" },
      { value: "material", label: "selected material" },
      { value: "pass_report", label: "pass report" }
    ],
    selection: resolvedSelection({ passKey: "temporal_timeline", destinationKey: "temporal", label: "Temporal/Timeline" }),
    discontinuity: null,
    resolving: false,
    disabled: false,
    startLabel: "Start or Resume Temporal",
    onDraftChange: vi.fn(),
    onResolve: vi.fn(),
    onStart: vi.fn(),
    onSafeReturn: vi.fn(),
    ...overrides
  };
  return { ...render(<SourceSelectionEntry {...props} />), props };
};

afterEach(cleanup);

describe("Source-selected guided-flow run entry", () => {
  it("compares only server-returned stable identity and accepts refreshed descriptive fields", () => {
    const approved = resolvedSelection({ passKey: "temporal_timeline", destinationKey: "temporal", label: "Temporal/Timeline" });
    const renamed = resolvedSelection({ passKey: "temporal_timeline", destinationKey: "temporal", label: "Temporal/Timeline" });
    renamed.identity!.title = "Renamed current title";
    expect(sourceIdentityDiscontinuity(approved, renamed)).toBeNull();

    renamed.identity!.stableRecordId = 17;
    renamed.identity!.shortId = "FAC-17";
    expect(sourceIdentityDiscontinuity(approved, renamed)).toEqual({
      continuityKind: "selected source",
      approvedHumanLabel: "FAC-3 · Foundational chrononaut access · stable id 3",
      returnedHumanLabel: "FAC-17 · Renamed current title · stable id 17"
    });

    const approvedReport = resolvedSelection({ passKey: "temporal_timeline", destinationKey: "temporal", label: "Temporal/Timeline" });
    approvedReport.identity!.stableRecordId = 22;
    approvedReport.identity!.shortId = "TPR-22";
    approvedReport.storedRunIdentity = { ...approvedReport.identity!, stableRecordId: 3, shortId: "FAC-3" };
    const returnedReport = structuredClone(approvedReport);
    returnedReport.storedRunIdentity = { ...returnedReport.storedRunIdentity!, stableRecordId: 17, shortId: "FAC-17", title: "Different stored source" };
    expect(sourceIdentityDiscontinuity(approvedReport, returnedReport)).toEqual({
      continuityKind: "stored run source",
      approvedHumanLabel: "FAC-3 · Foundational chrononaut access · stable id 3",
      returnedHumanLabel: "FAC-17 · Different stored source · stable id 17"
    });

    const returnedMaterial = structuredClone(approved);
    returnedMaterial.request.sourceType = "material";
    returnedMaterial.request.materialTitle = "Different mode";
    returnedMaterial.identity = null;
    expect(sourceIdentityDiscontinuity(approved, returnedMaterial)).toEqual({
      continuityKind: "source mode",
      approvedHumanLabel: "fact",
      returnedHumanLabel: "material"
    });
  });

  it("derives a coherent pass-report entry draft from the server selection request", () => {
    const selection = resolvedSelection({ passKey: "constraint_composition", destinationKey: "constraint", label: "Constraint Composition" });
    selection.request.sourceType = "pass_report";
    selection.request.recordId = 22;
    selection.identity = { ...selection.identity!, stableRecordId: 22, shortId: "CPR-22", recordTypeKey: "pass_report" };
    selection.storedRunIdentity = { ...selection.identity, stableRecordId: 3, shortId: "FAC-3", recordTypeKey: "canon_fact" };

    expect(sourceSelectionDraftFromSelection(selection)).toEqual({
      sourceType: "pass_report",
      recordId: "22",
      sectionHeading: "",
      materialTitle: "",
      materialBody: ""
    });
  });

  it.each(destinations)("renders the same server-owned resolved contract for $passKey", ({ passKey, destinationKey, label, startLabel }) => {
    const onStart = vi.fn();
    renderEntry({ selection: resolvedSelection({ passKey, destinationKey, label }), onStart, startLabel });

    expect(screen.getByRole("group", { name: new RegExp(`Source-selected guided-flow run entry.*FAC-3.*${label.replaceAll("/", "\\/")}.*resolved`, "i") })).toBeTruthy();
    expect(screen.getByRole("textbox", { name: /source or report stable id.*FAC-3.*Foundational chrononaut access.*validation state resolved/i })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "FAC-3 · Foundational chrononaut access" })).toBeTruthy();
    expect(screen.getByText("Stable record id").parentElement?.textContent).toContain("3");
    expect(screen.getByText("Record type").parentElement?.textContent).toContain("canon_fact");
    expect(screen.getByText("Canon status").parentElement?.textContent).toContain("accepted");
    expect(screen.getByText(`${label} · outstanding`)).toBeTruthy();
    expect(screen.getByText(/CPO-1 · Specialized pass owed/)).toBeTruthy();
    expect(screen.getByText(/PRP-1 · Foundational propagation/)).toBeTruthy();
    expect(screen.getByRole("region", { name: "Conditional-pass provenance" }).textContent).toContain("FAC-3");
    expect(screen.getByText(/09_temporal_and_timeline_protocol/)).toBeTruthy();
    const start = screen.getByRole("button", { name: startLabel });
    expect((start as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(start);
    expect(onStart).toHaveBeenCalledOnce();
  });

  it.each(destinations.flatMap((destination) => ([
    "empty",
    "missing",
    "incompatible_source_type",
    "unavailable_standing",
    "stale_binding",
    "mismatched_binding"
  ] as const).map((state) => ({ ...destination, state }))))("announces $state for $passKey, preserves correction input, focuses it, and blocks start", async ({ passKey, destinationKey, label, startLabel, state }) => {
    const invalid = resolvedSelection({ passKey, destinationKey, label });
    invalid.validation = {
      state,
      valid: false,
      blocker: `Exact ${state} blocker from the server.`,
      remediation: `Exact ${state} remediation from the server.`,
      substanceRule: `Exact ${state} substance validation.`
    };
    invalid.action.startOrResumeAvailable = false;
    renderEntry({ selection: invalid, draft: { ...baseDraft, recordId: "999" }, startLabel });

    const input = screen.getByRole("textbox", { name: new RegExp(`source or report stable id.*validation state ${state}`, "i") }) as HTMLInputElement;
    expect(input.value).toBe("999");
    expect(screen.getByRole("alert").textContent).toContain(`Exact ${state} blocker`);
    expect(screen.getByText(`Exact ${state} remediation from the server.`)).toBeTruthy();
    expect(screen.getByText(`Exact ${state} substance validation.`)).toBeTruthy();
    expect((screen.getByRole("button", { name: startLabel }) as HTMLButtonElement).disabled).toBe(true);
    await waitFor(() => expect(document.activeElement).toBe(input));
  });

  it.each(destinations)("renders an understandable resolving state for $passKey without enabling the action", ({ startLabel }) => {
    renderEntry({ selection: null, resolving: true, startLabel });
    expect(screen.getByRole("status").textContent).toMatch(/resolving.*server/i);
    expect(screen.getByRole("textbox", { name: /source or report stable id.*validation state resolving/i })).toBeTruthy();
    expect((screen.getByRole("button", { name: startLabel }) as HTMLButtonElement).disabled).toBe(true);
  });

  it.each(destinations)("keeps selected material identity without fabricated record metadata for $passKey", ({ passKey, destinationKey, label, startLabel }) => {
    const selected = resolvedSelection({ passKey, destinationKey, label });
    selected.request = { sourceType: "material", recordId: null, sectionHeading: null, materialTitle: "Bridge scene", materialBody: "Merchants contest the neurological toll." };
    selected.identity = null;
    selected.binding = null;
    selected.selectedMaterial = { title: "Bridge scene", body: "Merchants contest the neurological toll." };
    renderEntry({
      draft: { ...baseDraft, sourceType: "material", recordId: "", materialTitle: "Bridge scene", materialBody: "Merchants contest the neurological toll." },
      selection: selected,
      startLabel
    });

    expect(screen.getByRole("heading", { name: "Selected material · Bridge scene" })).toBeTruthy();
    expect(screen.getByRole("region", { name: "Resolved selected material" }).textContent).toContain("Merchants contest the neurological toll.");
    expect(screen.queryByText("Stable record id")).toBeNull();
    expect(screen.queryByText("Record type")).toBeNull();
  });

  it.each(destinations)("connects draft correction, resolution, classifications, orientation, and safe return for $passKey", ({ passKey, destinationKey, label, startLabel }) => {
    const onDraftChange = vi.fn();
    const onResolve = vi.fn();
    const onSafeReturn = vi.fn();
    renderEntry({ selection: resolvedSelection({ passKey, destinationKey, label }), onDraftChange, onResolve, onSafeReturn, startLabel });

    fireEvent.change(screen.getByRole("textbox", { name: /source or report stable id/i }), { target: { value: "17" } });
    expect(onDraftChange).toHaveBeenCalledWith({ ...baseDraft, recordId: "17" });
    fireEvent.click(screen.getByRole("button", { name: "Resolve source" }));
    expect(onResolve).toHaveBeenCalledOnce();
    expect(screen.getByText("Required: stable record id · validation state")).toBeTruthy();
    expect(screen.getByText("Optional: record-section heading")).toBeTruthy();
    expect(screen.getByText(new RegExp(`Current: ${label.replaceAll("/", "\\/")} source selection resolved`))).toBeTruthy();
    expect(screen.getByText(/Next: Start or resume against this same authoritative stable identity/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Return to fresh Workflow map" }));
    expect(onSafeReturn).toHaveBeenCalledOnce();
  });

  it.each(destinations)("adopts renamed human fields and renders stored-run resume identity for $passKey", ({ passKey, destinationKey, label, startLabel }) => {
    const selection = resolvedSelection({ passKey, destinationKey, label });
    selection.identity!.title = "Foundational chrononaut access (renamed)";
    selection.storedRunIdentity = { ...selection.identity!, title: "Stored foundational chrononaut access" };
    renderEntry({ selection, startLabel });

    expect(screen.getByRole("heading", { name: "FAC-3 · Foundational chrononaut access (renamed)" })).toBeTruthy();
    expect(screen.getByText((_, element) => element?.tagName === "P" && element.textContent === "Stored run source: FAC-3 · Stored foundational chrononaut access · stable id 3")).toBeTruthy();
    expect((screen.getByRole("button", { name: startLabel }) as HTMLButtonElement).disabled).toBe(false);
  });

  it.each(destinations)("reports a true stable-identity discontinuity for $passKey without replacing the approved selection", ({ passKey, destinationKey, label, startLabel }) => {
    const selection = resolvedSelection({ passKey, destinationKey, label });
    renderEntry({
      selection,
      startLabel,
      discontinuity: {
        continuityKind: "selected source",
        approvedHumanLabel: "FAC-3 · Foundational chrononaut access · stable id 3",
        returnedHumanLabel: "FAC-17 · Different source · stable id 17"
      }
    });

    expect(screen.getByRole("status").textContent).toContain("identity discontinuity");
    expect(screen.getByRole("alert").textContent).toContain("different selected source: FAC-17 · Different source · stable id 17");
    expect(screen.getByRole("heading", { name: "FAC-3 · Foundational chrononaut access" })).toBeTruthy();
    expect((screen.getByRole("button", { name: startLabel }) as HTMLButtonElement).disabled).toBe(true);
  });

});
