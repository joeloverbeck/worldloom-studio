import { useState, type ReactNode } from "react";
import type { MethodCard, WorkflowMapConditionalPassObligation, WorkflowMapPayload } from "@worldloom/shared";

interface WorkflowShellProps {
  workflowMap: WorkflowMapPayload;
  activeDestination: string;
  setupControls: ReactNode;
  surfaces: Record<string, ReactNode>;
  status?: ReactNode;
  onNavigate: (destinationKey: string) => void;
  onFollowConditionalPass: (obligation: WorkflowMapConditionalPassObligation) => void;
  onDeferConditionalPass: (obligation: WorkflowMapConditionalPassObligation, rationale: string) => Promise<void>;
}

interface DestinationSurfaceProps {
  destinationKey: string;
  workflowMap: WorkflowMapPayload;
  children: ReactNode;
  onNavigate: (destinationKey: string) => void;
}

const stateLabel = (state: string): string => state.replaceAll("_", " ");

function WorkflowMethodCard({ card }: { card?: MethodCard }) {
  if (!card) return null;
  return (
    <section className="subpanel method-card">
      <h3>Method card: {card.decisionPoint}</h3>
      <p><strong>Decision</strong>: {card.decision}</p>
      <p><strong>Operative rule</strong>: {card.operativeRule}</p>
      <p><strong>Why the method asks</strong>: {card.why}</p>
      <p><strong>What good material looks like</strong>: {card.goodMaterial}</p>
      <details>
        <summary>Provenance</summary>
        <div className="chips">
          <span>{card.derivationVersion}</span>
          {card.packageSources.map((source) => <span key={source}>{source}</span>)}
        </div>
      </details>
    </section>
  );
}

export function SurfaceNavigation({ workflowMap, activeDestination, onNavigate }: Pick<WorkflowShellProps, "workflowMap" | "activeDestination" | "onNavigate">) {
  return (
    <nav className="surface-navigation" aria-label="Workflow destinations">
      <button className={activeDestination === "map" ? "active" : ""} onClick={() => onNavigate("map")}>Workflow map</button>
      {workflowMap.destinations.map((destination) => (
        <button
          key={destination.key}
          className={activeDestination === destination.key ? "active" : ""}
          onClick={() => onNavigate(destination.key)}
        >
          {destination.label}
        </button>
      ))}
    </nav>
  );
}

function ConditionalPassHandoff({
  workflowMap,
  onFollowConditionalPass,
  onDeferConditionalPass
}: Pick<WorkflowShellProps, "workflowMap" | "onFollowConditionalPass" | "onDeferConditionalPass">) {
  const [rationales, setRationales] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<Record<number, string | null>>({});
  const [pendingId, setPendingId] = useState<number | null>(null);
  const handoff = workflowMap.conditionalPasses;
  if (!handoff || handoff.obligations.length === 0) return null;

  const submitDeferral = async (obligation: WorkflowMapConditionalPassObligation) => {
    setPendingId(obligation.id);
    setErrors((current) => ({ ...current, [obligation.id]: null }));
    try {
      await onDeferConditionalPass(obligation, rationales[obligation.id] ?? "");
    } catch (error) {
      setErrors((current) => ({ ...current, [obligation.id]: error instanceof Error ? error.message : String(error) }));
    } finally {
      setPendingId(null);
    }
  };

  return (
    <section className="panel conditional-pass-handoff" aria-labelledby="conditional-pass-handoff-heading">
      <h2 id="conditional-pass-handoff-heading">Post-Propagation conditional-pass handoff</h2>
      <p>{handoff.doctrine}</p>
      <div className="chips">
        <span>{handoff.outstandingCount} outstanding</span>
        <span>{handoff.governedCount} governed</span>
        <span>Current: {handoff.nextOrResumeState.current ?? "fully governed"}</span>
        <span>Next: {handoff.nextOrResumeState.next ?? "return to Admission ordering"}</span>
      </div>
      <p className="meta">{handoff.nextOrResumeState.resume}</p>
      <div className="grid">
        {handoff.obligations.map((obligation) => (
          <article className={`subpanel conditional-pass-row ${obligation.disposition}`} key={obligation.id}>
            <div className="row">
              <h3>{obligation.ordinal}. {obligation.passLabel}</h3>
              <span className="pill">{stateLabel(obligation.disposition)}</span>
            </div>
            <p>{obligation.doctrine}</p>
            <p><strong>Source fact</strong>: {obligation.sourceFact.shortId} · {obligation.sourceFact.title}</p>
            <p><strong>Propagation report</strong>: {obligation.propagationReport.shortId} · {obligation.propagationReport.title}</p>
            <p><strong>Destination</strong>: {obligation.destination.label} · {obligation.destination.href}</p>
            {obligation.blocker && <p className="error">{obligation.blocker}</p>}
            {obligation.coveringEvidence && <p><strong>Coverage evidence</strong>: {obligation.coveringEvidence.shortId} · {obligation.coveringEvidence.title}</p>}
            {obligation.rationale && <p><strong>Deferral rationale</strong>: {obligation.rationale}</p>}
            <details>
              <summary>Provenance and governed history</summary>
              <p>{obligation.provenance.actor} · {obligation.provenance.timestamp} · {obligation.provenance.flowStep}</p>
              {obligation.history.map((event, index) => (
                <p key={`${event.action}:${event.timestamp}:${index}`}>{event.action}: {event.priorState ?? "emitted"} → {event.resultingState} · {event.actor} · {event.timestamp} · {event.flowStep}</p>
              ))}
            </details>
            <button onClick={() => onFollowConditionalPass(obligation)} disabled={obligation.disposition !== "outstanding"}>
              Follow source-selected pass
            </button>
            {obligation.action && (
              <section className="subpanel conditional-pass-deferral">
                <h4>Preview governed deferral</h4>
                <p>{obligation.action.proposedWrite}</p>
                <p className="meta">Leaves untouched: {obligation.action.willLeaveUntouched.join(" · ")}</p>
                <label>Deferral rationale<textarea
                  rows={3}
                  value={rationales[obligation.id] ?? ""}
                  onChange={(event) => setRationales((current) => ({ ...current, [obligation.id]: event.target.value }))}
                /></label>
                {errors[obligation.id] && <p className="error">{errors[obligation.id]}</p>}
                <button onClick={() => void submitDeferral(obligation)} disabled={pendingId === obligation.id}>Defer with rationale</button>
              </section>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export function WorkflowMapHome({ workflowMap, onNavigate, onFollowConditionalPass, onDeferConditionalPass }: Pick<WorkflowShellProps, "workflowMap" | "onNavigate" | "onFollowConditionalPass" | "onDeferConditionalPass">) {
  return (
    <section className="workflow-map-home" aria-labelledby="workflow-map-heading">
      <div className="panel">
        <h2 id="workflow-map-heading">Workflow map</h2>
        <p className="status">Where am I in the method</p>
        <WorkflowMethodCard card={workflowMap.methodCards?.workflowMap} />
        <section className="subpanel next-decision">
          <h3>{workflowMap.nextDecision.label}</h3>
          <p>{workflowMap.nextDecision.reason}</p>
          <button onClick={() => onNavigate(workflowMap.nextDecision.destinationKey)}>Go to decision</button>
        </section>
      </div>

      <section className="panel">
        <h2>Method stages</h2>
        <div className="grid compact-grid">
          {workflowMap.stages.map((stage) => (
            <article key={stage.key} className={`subpanel stage-state ${stage.state}`}>
              <div className="row">
                <h3>{stage.label}</h3>
                <span className="pill">{stateLabel(stage.state)}</span>
              </div>
              <p>{stage.summary}</p>
              {stage.unlockReason && <p className="meta">{stage.unlockReason}</p>}
              <button onClick={() => onNavigate(stage.destinationKey)}>Open</button>
            </article>
          ))}
        </div>
      </section>

      <ConditionalPassHandoff
        workflowMap={workflowMap}
        onFollowConditionalPass={onFollowConditionalPass}
        onDeferConditionalPass={onDeferConditionalPass}
      />

      <section className="panel">
        <h2>Queues</h2>
        <div className="grid compact-grid">
          {workflowMap.queues.map((queue) => (
            <article key={queue.key} className="subpanel queue-state">
              <div className="row">
                <h3>{queue.label}</h3>
                <span className="pill">{queue.count}</span>
              </div>
              <p>{queue.summary}</p>
              <p className="meta">{queue.href}</p>
              <button onClick={() => onNavigate(queue.destinationKey)}>Open queue</button>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Destinations</h2>
        <div className="grid compact-grid">
          {workflowMap.destinations.map((destination) => (
            <article key={destination.key} className={`subpanel destination-state ${destination.kind}`}>
              <div className="row">
                <h3>{destination.label}</h3>
                <span className="pill">{stateLabel(destination.state)}</span>
              </div>
              <p>{destination.summary}</p>
              <button onClick={() => onNavigate(destination.key)}>Open</button>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

export function DestinationSurface({ destinationKey, workflowMap, children, onNavigate }: DestinationSurfaceProps) {
  const destination = workflowMap.destinations.find((item) => item.key === destinationKey);

  return (
    <section className="destination-surface" aria-labelledby="destination-heading">
      <div className="surface-heading">
        <div>
          <h2 id="destination-heading">{destination?.label ?? "Workflow destination"}</h2>
          {destination?.summary && <p>{destination.summary}</p>}
        </div>
        <button onClick={() => onNavigate("map")}>Back to workflow map</button>
      </div>
      {children}
    </section>
  );
}

export function WorkflowShell({ workflowMap, activeDestination, setupControls, surfaces, status, onNavigate, onFollowConditionalPass, onDeferConditionalPass }: WorkflowShellProps) {
  const surface = activeDestination === "map" ? null : surfaces[activeDestination] ?? surfaces.substrate;

  return (
    <section className="workspace workflow-shell">
      <aside className="sidebar">
        {setupControls}
        <SurfaceNavigation workflowMap={workflowMap} activeDestination={activeDestination} onNavigate={onNavigate} />
      </aside>
      <section className="editor">
        {activeDestination === "map" ? (
          <WorkflowMapHome
            workflowMap={workflowMap}
            onNavigate={onNavigate}
            onFollowConditionalPass={onFollowConditionalPass}
            onDeferConditionalPass={onDeferConditionalPass}
          />
        ) : (
          <DestinationSurface destinationKey={activeDestination} workflowMap={workflowMap} onNavigate={onNavigate}>
            {surface}
          </DestinationSurface>
        )}
        {status}
      </section>
    </section>
  );
}
