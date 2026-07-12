// @vitest-environment jsdom

import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PropagationWorkspace, type PropagationWorkspaceProps } from "./propagation-workspace.js";

afterEach(cleanup);

const domainNames = [
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
] as const;

const provenance = (flowStep: string) => ({
  created: { actor: { id: 1, name: "steward" }, timestamp: "2026-07-12T10:00:00.000Z", flowStep },
  retired: null
});

const workspaceProps = (): PropagationWorkspaceProps => ({
  runState: "in_progress",
  decisionName: "Pre-close Propagation revision and finalization",
  packageSources: ["docs/worldbuilding-system/07_propagation_engine.md", "docs/worldbuilding-system/20_ai_assisted_workflow.md"],
  obligations: {
    required: ["Restore active-only coverage"],
    optional: ["Revise any active row"],
    skippable: ["Fresh Pressure may use the governed skip"],
    severityDependent: ["Major work requires a skip reason"]
  },
  orders: [{ key: "first", label: "First-order: direct effects" }],
  domainNames: [...domainNames],
  consequences: [{
    id: 52,
    orderKey: "first",
    orderLabel: "First-order: direct effects",
    domainName: "Economy, trade, and scarcity",
    body: "Only courthouse markets close.",
    pressure: "high",
    lineageId: "lineage-bell",
    version: 2,
    lifecycleState: "active",
    priorVersionId: 51,
    revisionReason: "Pressure narrowed the market claim.",
    provenance: provenance("propagation:consequence-revision")
  }],
  domains: domainNames.map((domainName, index) => ({
    id: 100 + index,
    domainName,
    triage: index % 2 === 0 ? "direct" : "reaction",
    declaration: `${domainName} remains governed.`,
    lineageId: `domain-${index + 1}`,
    version: 1,
    lifecycleState: "active",
    priorVersionId: null,
    revisionReason: null,
    provenance: provenance("propagation:domain-atlas")
  })),
  dispositions: [{
    id: 71,
    flowId: 41,
    consequenceId: 52,
    disposition: "answered",
    note: "Governed at the courthouse boundary.",
    active: true
  }],
  blockers: [{
    key: "fresh-pressure-or-skip-owed",
    label: "Fresh Pressure or skip owed",
    message: "Load current Pressure or record the governed skip."
  }],
  onReviseConsequence: vi.fn(async () => undefined),
  onRetractConsequence: vi.fn(async () => undefined),
  onReviseDomain: vi.fn(async () => undefined),
  onRetractDomain: vi.fn(async () => undefined)
});

describe("compact Pre-close Propagation workspace", () => {
  it("begins with every active consequence and all fourteen domains as compact summaries", () => {
    render(<PropagationWorkspace {...workspaceProps()} />);

    expect(screen.getByRole("heading", { name: "Active consequence #52" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Pre-close Propagation revision and finalization compact workspace" })).toBeTruthy();
    expect(screen.getByText("Governing package sources: docs/worldbuilding-system/07_propagation_engine.md · docs/worldbuilding-system/20_ai_assisted_workflow.md")).toBeTruthy();
    expect(screen.getByText("Only courthouse markets close.")).toBeTruthy();
    expect(screen.getByText("Active · lineage lineage-bell · version 2")).toBeTruthy();
    expect(screen.getByText("Disposition: answered")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /^Edit domain/ })).toHaveLength(14);
    expect(screen.getByRole("button", { name: "Edit consequence #52" }).getAttribute("aria-expanded")).toBe("false");
    expect(screen.getByRole("button", { name: "Retract consequence #52" }).getAttribute("aria-expanded")).toBe("false");
    expect(screen.getByRole("button", { name: `Retract domain: ${domainNames[0]}` }).getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("textbox", { name: "Steward revision reason" })).toBeNull();
  });

  it("keeps exactly one cross-family editor open while preserving each row draft and restoring focus on cancel", () => {
    render(<PropagationWorkspace {...workspaceProps()} />);

    const consequenceControl = screen.getByRole("button", { name: "Edit consequence #52" });
    fireEvent.click(consequenceControl);
    const consequenceReason = screen.getByRole("textbox", { name: "Steward revision reason for consequence #52" });
    expect(screen.getByText("Required: Restore active-only coverage")).toBeTruthy();
    expect(screen.getByText("Optional: Revise any active row")).toBeTruthy();
    expect(screen.getByText("Skippable: Fresh Pressure may use the governed skip")).toBeTruthy();
    expect(screen.getByText("Severity-dependent: Major work requires a skip reason")).toBeTruthy();
    fireEvent.change(consequenceReason, { target: { value: "Keep the courthouse boundary." } });
    fireEvent.change(screen.getByRole("textbox", { name: "Replacement consequence #52" }), { target: { value: "Courthouse markets close at noon." } });
    expect(screen.getAllByRole("region", { name: /^Edit (consequence|domain)/ })).toHaveLength(1);

    const domainControl = screen.getByRole("button", { name: `Edit domain: ${domainNames[0]}` });
    fireEvent.click(domainControl);
    fireEvent.change(screen.getByRole("textbox", { name: `Steward revision reason for domain ${domainNames[0]}` }), { target: { value: "Clarify the metaphysical boundary." } });
    expect(screen.queryByRole("region", { name: "Edit consequence #52" })).toBeNull();
    expect(screen.getAllByRole("region", { name: /^Edit (consequence|domain)/ })).toHaveLength(1);

    fireEvent.click(consequenceControl);
    expect((screen.getByRole("textbox", { name: "Steward revision reason for consequence #52" }) as HTMLInputElement).value).toBe("Keep the courthouse boundary.");
    expect((screen.getByRole("textbox", { name: "Replacement consequence #52" }) as HTMLTextAreaElement).value).toBe("Courthouse markets close at noon.");

    fireEvent.click(screen.getByRole("button", { name: "Cancel editing consequence #52" }));
    expect(screen.queryByRole("region", { name: "Edit consequence #52" })).toBeNull();
    expect(document.activeElement).toBe(consequenceControl);

    fireEvent.click(consequenceControl);
    expect((screen.getByRole("textbox", { name: "Steward revision reason for consequence #52" }) as HTMLInputElement).value).toBe("");
    expect((screen.getByRole("textbox", { name: "Replacement consequence #52" }) as HTMLTextAreaElement).value).toBe("Only courthouse markets close.");
  });

  it("preserves every value with adjacent remediation after failure and clears the draft only after refreshed success", async () => {
    const props = workspaceProps();
    const revise = vi.fn<PropagationWorkspaceProps["onReviseConsequence"]>()
      .mockRejectedValueOnce(new Error("Replacement is stale; refresh active set 9."))
      .mockResolvedValueOnce(undefined);
    props.onReviseConsequence = revise;
    render(<PropagationWorkspace {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Edit consequence #52" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Steward revision reason for consequence #52" }), { target: { value: "Narrow after Pressure." } });
    fireEvent.change(screen.getByRole("combobox", { name: "Replacement domain for consequence #52" }), { target: { value: "Governance, law, and bureaucracy" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Replacement pressure for consequence #52" }), { target: { value: "normal" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Replacement consequence #52" }), { target: { value: "Only licensed courthouse markets close." } });
    fireEvent.click(screen.getByRole("button", { name: "Save replacement consequence #52" }));

    expect((await screen.findByRole("alert")).textContent).toContain("Replacement is stale; refresh active set 9.");
    expect(screen.getByRole("alert").textContent).toContain("Your reason, replacement text, order, domain, and pressure are preserved");
    expect((screen.getByRole("textbox", { name: "Steward revision reason for consequence #52" }) as HTMLInputElement).value).toBe("Narrow after Pressure.");
    expect((screen.getByRole("combobox", { name: "Replacement domain for consequence #52" }) as HTMLSelectElement).value).toBe("Governance, law, and bureaucracy");
    expect((screen.getByRole("combobox", { name: "Replacement pressure for consequence #52" }) as HTMLSelectElement).value).toBe("normal");
    expect((screen.getByRole("textbox", { name: "Replacement consequence #52" }) as HTMLTextAreaElement).value).toBe("Only licensed courthouse markets close.");

    fireEvent.click(screen.getByRole("button", { name: "Save replacement consequence #52" }));
    await waitFor(() => expect(screen.queryByRole("region", { name: "Edit consequence #52" })).toBeNull());
    expect(revise).toHaveBeenLastCalledWith(props.consequences[0], {
      reason: "Narrow after Pressure.",
      orderKey: "first",
      domainName: "Governance, law, and bureaucracy",
      body: "Only licensed courthouse markets close.",
      pressure: "normal"
    });

    fireEvent.click(screen.getByRole("button", { name: "Edit consequence #52" }));
    expect((screen.getByRole("textbox", { name: "Steward revision reason for consequence #52" }) as HTMLInputElement).value).toBe("");
    expect((screen.getByRole("textbox", { name: "Replacement consequence #52" }) as HTMLTextAreaElement).value).toBe("Only courthouse markets close.");
  });

  it("recounts refreshed lineage and restores focus after successful replacement and retraction", async () => {
    const props = workspaceProps();
    let rerender!: ReturnType<typeof render>["rerender"];
    props.onReviseConsequence = async (row) => {
      props.consequences = [
        {
          ...row,
          lifecycleState: "superseded",
          provenance: {
            ...row.provenance,
            retired: { actor: { id: 1, name: "steward" }, timestamp: "2026-07-12T11:00:00.000Z", flowStep: "propagation:consequence-revision" }
          }
        },
        {
          ...row,
          id: 53,
          version: 3,
          priorVersionId: row.id,
          body: "Only licensed courthouse markets close.",
          provenance: provenance("propagation:consequence-revision")
        }
      ];
      rerender(<PropagationWorkspace {...props} />);
    };
    props.onRetractDomain = async (row) => {
      props.domains = props.domains.map((candidate) => candidate.id === row.id ? {
        ...candidate,
        lifecycleState: "retracted",
        revisionReason: "The domain no longer changes.",
        provenance: {
          ...candidate.provenance,
          retired: { actor: { id: 1, name: "steward" }, timestamp: "2026-07-12T11:05:00.000Z", flowStep: "propagation:domain-retraction" }
        }
      } : candidate);
      rerender(<PropagationWorkspace {...props} />);
    };
    ({ rerender } = render(<PropagationWorkspace {...props} />));

    expect(screen.getByRole("button", { name: "Retired consequence lineage (0)" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Edit consequence #52" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Steward revision reason for consequence #52" }), { target: { value: "Refresh the active lineage." } });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Save replacement consequence #52" })));

    expect(screen.getByRole("button", { name: "Retired consequence lineage (1)" })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Edit consequence #53" }));

    const domainName = domainNames[0];
    fireEvent.click(screen.getByRole("button", { name: `Retract domain: ${domainName}` }));
    fireEvent.change(screen.getByRole("textbox", { name: `Steward revision reason for domain ${domainName}` }), { target: { value: "The domain no longer changes." } });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: `Confirm retraction of domain: ${domainName}` })));

    expect(screen.getByRole("button", { name: "Retired domain lineage (1)" })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Retired domain lineage (1)" }));
  });

  it("collapses retired consequence and domain lineage behind accurate accessible counts and complete audit detail", () => {
    const props = workspaceProps();
    props.consequences.unshift({
      ...props.consequences[0],
      id: 51,
      body: "Every market closes.",
      version: 1,
      lifecycleState: "superseded",
      priorVersionId: 40,
      provenance: {
        created: { actor: { id: 1, name: "steward" }, timestamp: "2026-07-12T09:00:00.000Z", flowStep: "propagation:first" },
        retired: { actor: { id: 1, name: "steward" }, timestamp: "2026-07-12T10:00:00.000Z", flowStep: "propagation:consequence-revision" }
      }
    });
    props.domains.push({
      ...props.domains[0],
      id: 150,
      declaration: "Every metaphysical rule changes.",
      version: 1,
      lifecycleState: "retracted",
      priorVersionId: 149,
      revisionReason: "The broad declaration was unsupported.",
      provenance: {
        created: { actor: { id: 1, name: "steward" }, timestamp: "2026-07-12T09:05:00.000Z", flowStep: "propagation:domain-atlas" },
        retired: { actor: { id: 1, name: "steward" }, timestamp: "2026-07-12T10:05:00.000Z", flowStep: "propagation:domain-retraction" }
      }
    });
    props.dispositions.push({
      id: 70,
      flowId: 41,
      consequenceId: 51,
      disposition: "answered",
      note: "Historical answer",
      active: false
    });
    render(<PropagationWorkspace {...props} />);

    const consequenceDisclosure = screen.getByRole("button", { name: "Retired consequence lineage (1)" });
    const domainDisclosure = screen.getByRole("button", { name: "Retired domain lineage (1)" });
    expect(consequenceDisclosure.getAttribute("aria-expanded")).toBe("false");
    expect(domainDisclosure.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("Every market closes.")).toBeNull();
    expect(screen.queryByText("Every metaphysical rule changes.")).toBeNull();

    fireEvent.click(consequenceDisclosure);
    expect(consequenceDisclosure.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("heading", { name: "Superseded consequence #51" })).toBeTruthy();
    expect(screen.getByText("Superseded · lineage lineage-bell · version 1 · prior version 40")).toBeTruthy();
    expect(screen.getByText("Every market closes.")).toBeTruthy();
    expect(screen.getByText("Revision reason: Pressure narrowed the market claim.")).toBeTruthy();
    expect(screen.getByText("Created by steward (#1) · propagation:first · 2026-07-12T09:00:00.000Z")).toBeTruthy();
    expect(screen.getByText("Retired by steward (#1) · propagation:consequence-revision · 2026-07-12T10:00:00.000Z")).toBeTruthy();
    expect(screen.getByText("Historical disposition: answered · Historical answer")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Superseded consequence #51" }).closest("article")?.className).toContain("lifecycle-superseded");
    fireEvent.click(consequenceDisclosure);
    expect(document.activeElement).toBe(consequenceDisclosure);
    expect(screen.queryByText("Every market closes.")).toBeNull();

    fireEvent.click(domainDisclosure);
    expect(screen.getByRole("heading", { name: `Retracted domain: ${domainNames[0]}` })).toBeTruthy();
    expect(screen.getByText("Retracted · lineage domain-1 · version 1 · prior version 149")).toBeTruthy();
    expect(screen.getByText("Every metaphysical rule changes.")).toBeTruthy();
    expect(screen.getByText("Revision reason: The broad declaration was unsupported.")).toBeTruthy();
    expect(screen.getByText("Retired by steward (#1) · propagation:domain-retraction · 2026-07-12T10:05:00.000Z")).toBeTruthy();
    expect(screen.getByRole("heading", { name: `Retracted domain: ${domainNames[0]}` }).closest("article")?.className).toContain("lifecycle-retracted");
  });
});
