import React from "react";

export interface TemporalPromptModeOffer {
  mode: "proposal" | "pressure";
  label: string;
  available: boolean;
  availability?: "available" | "blocked";
  blocker: string | null;
  framing: string;
  stepRequest: { method: "POST"; href: string; body: Record<string, unknown> } | null;
}

export interface TemporalPacketContextView {
  serverOwned: true;
  mode: "proposal" | "pressure";
  flowKey: "temporal_timeline";
  stepKey: string;
  packageSources: string[];
  completeness: { status: "complete" | "incomplete"; blockers: string[] };
  coverage: Array<{ key: string; label: string; value: string }>;
  selectedSource: { id: number; shortId: string; title: string } | null;
  sourceDocuments: Array<{ source: string; content: string }>;
  sourceManifest: string[];
  omissions: string[];
  outputLabels: string[];
  advisoryCanonWarning: string;
  recovery: { method: "POST"; href: string; body: Record<string, unknown> };
  orientation: { current: string; next: string; resume: string; safeExit: string };
  readOnlyGuarantee: string;
}

export interface TemporalPacketView {
  promptText: string;
  identity: {
    flowKey: string | null;
    flowId: number | null;
    stepKey: string;
    mode: string | null;
    recordId: number | null;
    packetHash: string | null;
    bodyHash: string | null;
    sourceManifestHash: string | null;
    activeSetRevision?: number | null;
  };
  context: TemporalPacketContextView;
}

export interface TemporalPromptError {
  message: string;
  remediation: string;
}

export function TemporalPromptOutPanel({
  modes,
  selectedMode,
  packet,
  error,
  packetState,
  packetStateReason,
  copyDownloadControls,
  advisoryControls,
  onLoadMode,
  onRecover
}: {
  modes: TemporalPromptModeOffer[];
  selectedMode: "proposal" | "pressure";
  packet: TemporalPacketView | null;
  error: TemporalPromptError | null;
  packetState?: "current" | "stale" | "unbound" | "incomplete" | "inconsistent";
  packetStateReason?: string;
  copyDownloadControls: React.ReactNode;
  advisoryControls?: React.ReactNode;
  onLoadMode: (mode: "proposal" | "pressure") => void;
  onRecover: () => void;
}) {
  const proposal = modes.find((mode) => mode.mode === "proposal") ?? null;
  const pressure = modes.find((mode) => mode.mode === "pressure") ?? null;
  const selected = modes.find((mode) => mode.mode === selectedMode) ?? null;
  return (
    <section className="subpanel temporal-prompt-out" aria-labelledby="temporal-prompt-out-heading">
      <h3 id="temporal-prompt-out-heading">Temporal Prompt-out decision</h3>
      <p>Proposal requests labeled timing candidates. Pressure challenges saved timing, latency, residue, sequence, and mystery boundaries. Both remain optional advisory support.</p>
      <div className="row">
        <button
          onClick={() => onLoadMode("proposal")}
          disabled={!proposal?.available || proposal.stepRequest == null}
          aria-pressed={selectedMode === "proposal"}
        >Load Current Proposal Packet</button>
        <button
          onClick={() => onLoadMode("pressure")}
          disabled={!pressure?.available || pressure.stepRequest == null}
          aria-pressed={selectedMode === "pressure"}
        >Load Current Pressure Packet</button>
      </div>
      <p className="status">Selected mode: {selected?.label ?? (selectedMode === "proposal" ? "Proposal mode" : "Pressure mode")} · {selected?.available ? "available" : selected?.blocker ?? "load the server contract"}</p>
      {error ? (
        <section className="subpanel action-error" role="alert" aria-live="assertive">
          <h4>Temporal packet load failed</h4>
          <p>{error.message}</p>
          <p>{error.remediation}</p>
        </section>
      ) : null}
      {packetState ? <p role="status" aria-live="polite">Packet state: {packetState}. {packetStateReason ?? "Use server-current recovery when this is not current."}</p> : null}
      <button onClick={onRecover} disabled={!error && (!packetState || packetState === "current")}>Recover Current Temporal Packet</button>

      <section className="subpanel">
        <h4>Temporal packet identity</h4>
        {packet ? (
          <p>{packet.identity.flowKey} · flow {packet.identity.flowId} · step {packet.identity.stepKey} · mode {packet.identity.mode} · record {packet.identity.recordId ?? "selected material"} · revision {packet.identity.activeSetRevision ?? "none"} · packet {packet.identity.packetHash} · body {packet.identity.bodyHash} · manifest {packet.identity.sourceManifestHash}</p>
        ) : <p>Load an explicit Proposal or Pressure packet to review its server-owned identity.</p>}
      </section>
      <section className="subpanel">
        <h4>Current Temporal packet body</h4>
        <pre className="prompt-preview" data-temporal-packet-body="true">{packet?.promptText ?? "No current Temporal packet loaded."}</pre>
        <div className="row">{copyDownloadControls}</div>
        {advisoryControls}
      </section>
      <section className="subpanel">
        <h4>Temporal packet doctrine and saved coverage</h4>
        <p>{packet?.context.packageSources.join(" · ") ?? "docs/worldbuilding-system/09_temporal_and_timeline_protocol.md · docs/worldbuilding-system/20_ai_assisted_workflow.md"}</p>
        <ul>{(packet?.context.coverage ?? []).map((item) => <li key={item.key}>{item.label}: {item.value || "not saved"}</li>)}</ul>
      </section>
      <section className="subpanel">
        <h4>Temporal source documents</h4>
        {packet?.context.sourceDocuments.length ? packet.context.sourceDocuments.map((document) => (
          <details key={document.source}><summary>{document.source}</summary><pre>{document.content}</pre></details>
        )) : <p>No source documents loaded.</p>}
      </section>
      <section className="subpanel">
        <h4>Temporal source manifest</h4>
        <ul>{(packet?.context.sourceManifest ?? ["No source manifest loaded."]).map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <section className="subpanel">
        <h4>Temporal omissions</h4>
        <ul>{(packet?.context.omissions ?? ["No omission list loaded."]).map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      <section className="subpanel">
        <h4>Temporal output labels</h4>
        <p>{packet?.context.outputLabels.join(" · ") ?? "Output labels load with the current packet."}</p>
        <p>{packet?.context.advisoryCanonWarning ?? "Advisory/canon warning loads with the current packet."}</p>
        <p>{packet?.context.readOnlyGuarantee ?? "Loading, preview, copy, and download are read-only."}</p>
      </section>
      <section className="subpanel">
        <h4>Current, next, resume, and safe exit</h4>
        <p>Current: {packet?.context.orientation.current ?? "Load the current packet."}</p>
        <p>Next: {packet?.context.orientation.next ?? "Follow the server-returned next action."}</p>
        <p>Resume: {packet?.context.orientation.resume ?? "Resume from the current Temporal pass report."}</p>
        <p>Safe exit: {packet?.context.orientation.safeExit ?? "Return to a fresh workflow map."}</p>
      </section>
    </section>
  );
}
