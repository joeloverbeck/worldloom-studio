// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TemporalPromptOutPanel } from "./temporal-prompt-out-panel";

afterEach(cleanup);

describe("Temporal Prompt-out in-flow review", () => {
  it("reviews one current packet in-flow and invokes explicit Proposal, Pressure, copy, and download actions", () => {
    const packetBody = "Temporal packet body\n<source_manifest>FAC-1</source_manifest>";
    const onLoadMode = vi.fn();
    const onCopy = vi.fn();
    const onDownload = vi.fn();
    render(<TemporalPromptOutPanel
      modes={[
        { mode: "proposal", label: "Proposal mode", available: true, availability: "available", blocker: null, framing: "Candidates", stepRequest: { method: "POST", href: "/api/prompt-out/steps", body: { mode: "proposal" } } },
        { mode: "pressure", label: "Pressure mode", available: true, availability: "available", blocker: null, framing: "Challenge", stepRequest: { method: "POST", href: "/api/prompt-out/steps", body: { mode: "pressure" } } }
      ]}
      selectedMode="proposal"
      packet={{
        promptText: packetBody,
        identity: { flowKey: "temporal_timeline", flowId: 41, stepKey: "temporal:spatial-temporal-analysis", mode: "proposal", recordId: 3, activeSetRevision: 7, packetHash: "packet-hash", bodyHash: "body-hash", sourceManifestHash: "manifest-hash" },
        context: {
          serverOwned: true,
          mode: "proposal",
          flowKey: "temporal_timeline",
          stepKey: "temporal:spatial-temporal-analysis",
          packageSources: ["docs/worldbuilding-system/09_temporal_and_timeline_protocol.md", "docs/worldbuilding-system/20_ai_assisted_workflow.md"],
          completeness: { status: "complete", blockers: [] },
          coverage: [{ key: "latency", label: "Latency", value: "Two seasons" }],
          selectedSource: { id: 3, shortId: "FAC-1", title: "Salt bell" },
          sourceDocuments: [{ source: "canon_fact:FAC-1", content: "Salt bell source content" }],
          sourceManifest: ["FAC-1 Salt bell; standing accepted; relationship selected"],
          omissions: ["Second-hop record omitted by bounded relationship rule"],
          outputLabels: ["useful consequence", "adopted with steward revision"],
          advisoryCanonWarning: "Optional advisory support; only Admission changes canon standing.",
          recovery: { method: "POST", href: "/api/prompt-out/steps", body: { mode: "proposal" } },
          orientation: { current: "Temporal coverage", next: "Outcome", resume: "Resume report", safeExit: "Return to workflow map" },
          readOnlyGuarantee: "Preview, copy, and download mutate no world state."
        }
      }}
      error={null}
      copyDownloadControls={<><button onClick={() => onCopy(packetBody)}>Copy Current Packet</button><button onClick={() => onDownload(packetBody)}>Download Current Packet</button></>}
      advisoryControls={<button>Store Current Temporal Advisory</button>}
      onLoadMode={onLoadMode}
      onRecover={() => undefined}
    />);

    expect(screen.getByText((_, element) => element?.matches("pre[data-temporal-packet-body]") === true && element.textContent === packetBody)).toBeTruthy();
    expect(screen.getByText("canon_fact:FAC-1")).toBeTruthy();
    expect(screen.getByText("FAC-1 Salt bell; standing accepted; relationship selected")).toBeTruthy();
    expect(screen.getByText("Second-hop record omitted by bounded relationship rule")).toBeTruthy();
    expect(screen.getByText("useful consequence · adopted with steward revision")).toBeTruthy();
    expect(screen.getByText("Optional advisory support; only Admission changes canon standing.")).toBeTruthy();
    expect(screen.getByText(/temporal_timeline · flow 41 · step temporal:spatial-temporal-analysis · mode proposal/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Load Current Proposal Packet" }));
    fireEvent.click(screen.getByRole("button", { name: "Load Current Pressure Packet" }));
    expect(onLoadMode.mock.calls).toEqual([["proposal"], ["pressure"]]);
    fireEvent.click(screen.getByRole("button", { name: "Copy Current Packet" }));
    fireEvent.click(screen.getByRole("button", { name: "Download Current Packet" }));
    expect(onCopy).toHaveBeenCalledWith(packetBody);
    expect(onDownload).toHaveBeenCalledWith(packetBody);
    expect(screen.getByRole("button", { name: "Store Current Temporal Advisory" })).toBeTruthy();
  });

  it("announces the exact server failure beside preserved Pressure mode and invokes current recovery", () => {
    const onRecover = vi.fn();
    render(<TemporalPromptOutPanel
      modes={[
        { mode: "proposal", label: "Proposal mode", available: true, blocker: null, framing: "Candidates", stepRequest: { method: "POST", href: "/api/prompt-out/steps", body: { mode: "proposal" } } },
        { mode: "pressure", label: "Pressure mode", available: true, blocker: null, framing: "Challenge", stepRequest: { method: "POST", href: "/api/prompt-out/steps", body: { mode: "pressure" } } }
      ]}
      selectedMode="pressure"
      packet={null}
      error={{
        message: "stale Temporal packet identity (submitted revision 6; current revision 7)",
        remediation: "Preserve the selected Temporal mode, refresh the run, and invoke its server-provided current-packet recovery action."
      }}
      copyDownloadControls={<><button disabled>Copy Current Packet</button><button disabled>Download Current Packet</button></>}
      onLoadMode={() => undefined}
      onRecover={onRecover}
    />);

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("stale Temporal packet identity (submitted revision 6; current revision 7)");
    expect(alert.textContent).toContain("Preserve the selected Temporal mode");
    expect(screen.getByRole("button", { name: "Load Current Pressure Packet" }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Recover Current Temporal Packet" }));
    expect(onRecover).toHaveBeenCalledOnce();
  });

  it("announces a stale loaded body and enables recovery without requiring a failed request", () => {
    const onRecover = vi.fn();
    render(<TemporalPromptOutPanel
      modes={[
        { mode: "pressure", label: "Pressure mode", available: true, blocker: null, framing: "Challenge", stepRequest: { method: "POST", href: "/api/prompt-out/steps", body: { mode: "pressure", activeSetRevision: 8 } } }
      ]}
      selectedMode="pressure"
      packet={null}
      packetState="stale"
      packetStateReason="The selected source changed; the loaded packet belongs to revision 7."
      error={null}
      copyDownloadControls={<><button disabled>Copy Current Packet</button><button disabled>Download Current Packet</button></>}
      onLoadMode={() => undefined}
      onRecover={onRecover}
    />);

    expect(screen.getByRole("status").textContent).toContain("stale");
    expect(screen.getByRole("status").textContent).toContain("selected source changed");
    const recovery = screen.getByRole("button", { name: "Recover Current Temporal Packet" });
    expect(recovery.hasAttribute("disabled")).toBe(false);
    fireEvent.click(recovery);
    expect(onRecover).toHaveBeenCalledOnce();
  });

  it("preserves Pressure mode and server orientation while announcing incomplete-context recovery", () => {
    const onRecover = vi.fn();
    render(<TemporalPromptOutPanel
      modes={[
        { mode: "proposal", label: "Proposal mode", available: true, blocker: null, framing: "Candidates", stepRequest: { method: "POST", href: "/api/prompt-out/steps", body: { mode: "proposal" } } },
        { mode: "pressure", label: "Pressure mode", available: true, blocker: null, framing: "Challenge", stepRequest: { method: "POST", href: "/api/prompt-out/steps", body: { mode: "pressure" } } }
      ]}
      selectedMode="pressure"
      packet={{
        promptText: "Previously current Temporal packet",
        identity: { flowKey: "temporal_timeline", flowId: 41, stepKey: "temporal:spatial-temporal-analysis", mode: "proposal", recordId: 3, activeSetRevision: 7, packetHash: "packet-hash", bodyHash: "body-hash", sourceManifestHash: "manifest-hash" },
        context: {
          serverOwned: true,
          mode: "proposal",
          flowKey: "temporal_timeline",
          stepKey: "temporal:spatial-temporal-analysis",
          packageSources: ["docs/worldbuilding-system/09_temporal_and_timeline_protocol.md", "docs/worldbuilding-system/20_ai_assisted_workflow.md"],
          completeness: { status: "complete", blockers: [] },
          coverage: [],
          selectedSource: { id: 3, shortId: "FAC-1", title: "Salt bell" },
          sourceDocuments: [],
          sourceManifest: [],
          omissions: [],
          outputLabels: [],
          advisoryCanonWarning: "Optional advisory support.",
          recovery: { method: "POST", href: "/api/prompt-out/steps", body: { mode: "proposal" } },
          orientation: {
            current: "Review saved Temporal coverage",
            next: "Repair missing outcome decision",
            resume: "Resume pass report PAS-1",
            safeExit: "Return to the workflow map"
          },
          readOnlyGuarantee: "No world mutation."
        }
      }}
      error={{
        message: "Temporal Prompt-out incomplete context: Pressure requires all ten saved Temporal coverage lenses",
        remediation: "Preserve the selected mode, repair the named Temporal context, refresh the run, and use its server-provided current-packet recovery action."
      }}
      copyDownloadControls={<><button>Copy Current Packet</button><button>Download Current Packet</button></>}
      onLoadMode={() => undefined}
      onRecover={onRecover}
    />);

    expect(screen.getByRole("button", { name: "Load Current Pressure Packet" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("alert").textContent).toContain("incomplete context");
    expect(screen.getByText("Current: Review saved Temporal coverage")).toBeTruthy();
    expect(screen.getByText("Next: Repair missing outcome decision")).toBeTruthy();
    expect(screen.getByText("Resume: Resume pass report PAS-1")).toBeTruthy();
    expect(screen.getByText("Safe exit: Return to the workflow map")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Recover Current Temporal Packet" }));
    expect(onRecover).toHaveBeenCalledOnce();
  });
});
