import React, { useEffect, useMemo, useRef, useState } from "react";

export interface TemporalCoverageDraft {
  temporalQuestions: string;
  firstTrueOrRelativeSequence: string;
  firstKnownOrReason: string;
  dateTypesAndGranularity: string;
  latency: string;
  residueByTimescale: string;
  sequenceIntegrity: string;
  retrospectiveInsertion: string;
  temporalMysteryBoundaries: string;
  outcomeDecision: string;
}

export interface TemporalRevisionView {
  id: number;
  lineageId: string;
  version: number;
  lifecycleState: "active" | "superseded";
  priorVersionId: number | null;
  revisionReason: string | null;
  values: TemporalCoverageDraft;
  provenance: { actor: string; timestamp: string; flowStep: string };
  retirementProvenance: { actor: string; timestamp: string; flowStep: string } | null;
}

export interface TemporalRevisionStateView {
  lifecycleState: "open" | "finalized";
  active: TemporalRevisionView | null;
  lineage: TemporalRevisionView[];
  draftState?: {
    status: "current" | "failed";
    dirty: boolean;
    failed: boolean;
    attemptedInput: (Partial<TemporalCoverageDraft> & { reason?: string }) | null;
    error: string | null;
    remediation: string | null;
  };
  activeSet: {
    revision: number;
    identity: string;
    changedRevisionId: number | null;
    changedReason: string | null;
    pressureUsedRevision: number | null;
    pressureOwedRevision: number | null;
    pressureSkipRevision: number | null;
  };
}

export interface TemporalFinalizationPreview {
  decisionContract: { name: string; packageSources: string[]; stagingDoctrine: string };
  activeRevision: TemporalRevisionView | null;
  revisionAudit: TemporalRevisionView[];
  outcomes: Array<{ kind: string; recordId: number; shortId: string; title: string; linkTypeKey: string; note: string }>;
  reportRelationship: { type: "final" | "correction"; retainedPriorReportRecordId: number | null };
  writeIntent: { willWrite: string[]; willLink: string[]; willLeaveUntouched: string[] };
  closeReadiness: { status: string; blockers: Array<{ key: string; label: string; message: string }> };
  orientation: { current: string; next: string; resume: string };
}

const labels: Array<[keyof TemporalCoverageDraft, string]> = [
  ["temporalQuestions", "Temporal Questions"],
  ["firstTrueOrRelativeSequence", "First True or Relative Sequence"],
  ["firstKnownOrReason", "First Known Date or Reason"],
  ["dateTypesAndGranularity", "Date Types and Granularity"],
  ["latency", "Latency and Residue"],
  ["residueByTimescale", "Residue by Timescale"],
  ["sequenceIntegrity", "Sequence Integrity"],
  ["retrospectiveInsertion", "Retrospective Insertion"],
  ["temporalMysteryBoundaries", "Temporal Mystery Boundaries"],
  ["outcomeDecision", "Outcome Decision"]
];

const errorDetail = (error: unknown) => {
  const payload = typeof error === "object" && error !== null && "payload" in error
    ? (error as { payload?: { error?: string; remediation?: string; authoritativeState?: { closeReadiness?: { blockers?: Array<{ key: string; label: string; message: string }> } } } }).payload
    : undefined;
  return {
    message: payload?.error ?? (error instanceof Error ? error.message : String(error)),
    remediation: payload?.remediation ?? "Keep the entered values, resolve the named blocker, and save again or discard to authoritative state.",
    blockers: payload?.authoritativeState?.closeReadiness?.blockers ?? []
  };
};

export function TemporalRevisionWorkspace({
  runId,
  revisionState,
  coverage,
  blockers,
  preview,
  onCoverageChange,
  onSave,
  onRevise,
  onRecover,
  onPreview,
  onClose
}: {
  runId: number | null;
  revisionState: TemporalRevisionStateView | null;
  coverage: TemporalCoverageDraft;
  blockers: Array<{ key: string; label: string; message: string }>;
  preview: TemporalFinalizationPreview | null;
  onCoverageChange: (coverage: TemporalCoverageDraft) => void;
  onSave: (coverage: TemporalCoverageDraft) => Promise<void>;
  onRevise: (input: { expectedRevisionId: number; reason: string; coverage: TemporalCoverageDraft }) => Promise<void>;
  onRecover: () => Promise<TemporalCoverageDraft | null>;
  onPreview: () => Promise<void>;
  onClose: () => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [failure, setFailure] = useState<{ message: string; remediation: string; blockers: Array<{ key: string; label: string; message: string }> } | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const failureRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const active = revisionState?.active ?? null;
  const dirty = useMemo(() => active == null
    ? Object.values(coverage).some((value) => value.trim().length > 0)
    : JSON.stringify(coverage) !== JSON.stringify(active.values), [active, coverage]);
  const finalized = revisionState?.lifecycleState === "finalized";
  const displayedBlockers = failure?.blockers.length ? failure.blockers : blockers;

  useEffect(() => {
    if (active && !revisionState?.draftState?.failed) onCoverageChange(active.values);
  }, [active?.id, revisionState?.draftState?.failed]);

  useEffect(() => {
    const draft = revisionState?.draftState;
    if (!draft?.failed || !draft.attemptedInput) return;
    const attempted = draft.attemptedInput;
    if (labels.every(([key]) => typeof attempted[key] === "string")) {
      onCoverageChange(Object.fromEntries(labels.map(([key]) => [key, attempted[key]])) as unknown as TemporalCoverageDraft);
    }
    setReason(attempted.reason ?? "");
    setFailure({
      message: draft.error ?? "Temporal revision save failed.",
      remediation: draft.remediation ?? "Save again or discard to the authoritative active revision.",
      blockers
    });
  }, [revisionState?.draftState?.failed, active?.id]);

  useEffect(() => {
    if (failure) failureRef.current?.focus();
  }, [failure]);

  useEffect(() => {
    if (announcement && !failure) statusRef.current?.focus();
  }, [announcement, failure]);

  const submit = async () => {
    setFailure(null);
    try {
      if (active) await onRevise({ expectedRevisionId: active.id, reason, coverage });
      else await onSave(coverage);
      setReason("");
      setAnnouncement(active ? "Temporal revision saved; returned active revision loaded." : "First active Temporal revision saved.");
    } catch (error) {
      setFailure(errorDetail(error));
      setAnnouncement("Temporal save failed; entered values remain unsaved.");
    }
  };

  const discard = async () => {
    const authoritative = await onRecover();
    if (authoritative) onCoverageChange(authoritative);
    setReason("");
    setFailure(null);
    setAnnouncement("Unsaved Temporal changes discarded; authoritative active revision restored.");
  };

  return (
    <section className="temporal-revision-workspace" aria-labelledby="temporal-revision-heading">
      <header className="subpanel">
        <h3 id="temporal-revision-heading">Temporal coverage revision and finalization</h3>
        <p><strong>Editable staging</strong> keeps all ten lenses revisable while this run is open. Finalization writes one append-only final or correction report.</p>
        <p className="meta">Governing package sources: docs/worldbuilding-system/03_truth_layers_and_canon_governance.md · docs/worldbuilding-system/09_temporal_and_timeline_protocol.md · docs/worldbuilding-system/20_ai_assisted_workflow.md</p>
        <div className="chips" aria-label="Temporal lifecycle states">
          <span>Active revision: {active ? `${active.id} · v${active.version}` : "none yet"}</span>
          <span>Active-set identity: {revisionState?.activeSet.identity ?? "load server state"}</span>
          <span>State: {finalized ? "finalized" : failure ? "failed" : dirty ? "dirty" : active ? "current" : "incomplete"}</span>
          <span>Superseded revisions: {revisionState?.lineage.filter((revision) => revision.lifecycleState === "superseded").length ?? 0}</span>
        </div>
      </header>

      {failure ? <div className="subpanel inline-recovery" role="alert" tabIndex={-1} ref={failureRef}><h4>Failed save · unsaved material preserved</h4><p>{failure.message}</p><p>{failure.remediation}</p><p>Close remains blocked until you save again or discard to authoritative state.</p></div> : null}
      <p className="status" role="status" tabIndex={-1} ref={statusRef}>{announcement || "Current, dirty, failed, superseded, blocked, and finalized state is announced here."}</p>

      <div className="grid two">
        {labels.map(([key, label]) => (
          <label key={key}>{label}<textarea aria-label={label} rows={2} value={coverage[key]} disabled={finalized} onChange={(event) => onCoverageChange({ ...coverage, [key]: event.target.value })} /></label>
        ))}
      </div>
      <label>Revision reason<input value={reason} disabled={finalized || active == null} onChange={(event) => setReason(event.target.value)} /></label>
      <div className="row">
        <button onClick={() => void submit()} disabled={runId == null || finalized || (active != null && (!dirty || !reason.trim()))}>{active ? "Save Material Revision" : "Save First Active Revision"}</button>
        <button onClick={() => void submit()} disabled={runId == null || finalized || !failure || (active != null && !reason.trim())}>Save Again</button>
        <button onClick={() => void discard()} disabled={runId == null || finalized || (!dirty && !failure)}>Discard unsaved changes</button>
      </div>

      <section className="subpanel">
        <h4>Server close blockers</h4>
        {displayedBlockers.length ? <ul>{displayedBlockers.map((blocker) => <li key={blocker.key}>{blocker.label}: {blocker.message}</li>)}</ul> : <p>No server-returned blockers.</p>}
      </section>

      <details className="subpanel">
        <summary>Revision lineage · {revisionState?.lineage.length ?? 0} revision(s)</summary>
        {(revisionState?.lineage ?? []).map((revision) => <article key={revision.id}><h4>{revision.lifecycleState} revision {revision.id} · v{revision.version}</h4><p>{revision.revisionReason ?? "First or migrated revision; no fabricated reason."}</p><p>Created: {revision.provenance.actor} · {revision.provenance.timestamp} · {revision.provenance.flowStep}</p>{revision.retirementProvenance ? <p>Retired: {revision.retirementProvenance.actor} · {revision.retirementProvenance.timestamp} · {revision.retirementProvenance.flowStep}</p> : null}</article>)}
      </details>

      <section className="subpanel temporal-finalization-preview">
        <h4>Finalization preview</h4>
        <button onClick={() => void onPreview()} disabled={runId == null}>Preview Finalization</button>
        <p>{preview?.reportRelationship.type === "correction" ? `Correction report supersedes retained report ${preview.reportRelationship.retainedPriorReportRecordId}.` : "Close will create the single final report."}</p>
        <h5>Staged outcomes</h5>
        {preview?.outcomes.length ? <ul>{preview.outcomes.map((outcome) => <li key={`${outcome.recordId}:${outcome.linkTypeKey}`}>{outcome.kind}: {outcome.shortId} {outcome.title} · {outcome.linkTypeKey} · {outcome.note}</li>)}</ul> : <p>No staged outcomes returned.</p>}
        <div className="grid compact-grid"><section><h5>Will write</h5><ul>{(preview?.writeIntent.willWrite ?? ["Load server preview"]).map((item) => <li key={item}>{item}</li>)}</ul></section><section><h5>Will link</h5><ul>{(preview?.writeIntent.willLink ?? ["Load server preview"]).map((item) => <li key={item}>{item}</li>)}</ul></section><section><h5>Will leave untouched</h5><ul>{(preview?.writeIntent.willLeaveUntouched ?? ["Load server preview"]).map((item) => <li key={item}>{item}</li>)}</ul></section></div>
        <p>Current: {preview?.orientation.current ?? "load the active revision"}</p><p>Next: {preview?.orientation.next ?? "resolve blockers or finalize"}</p><p>Resume: {preview?.orientation.resume ?? "return safely to this Temporal run"}</p>
        <button onClick={() => void onClose()} disabled={runId == null || finalized || dirty || displayedBlockers.length > 0}>Finalize Active Temporal Revision</button>
      </section>
    </section>
  );
}
