import type { ReactNode } from "react";
import type { MethodCard, WorkflowMapPayload } from "@worldloom/shared";

interface WorkflowShellProps {
  workflowMap: WorkflowMapPayload;
  activeDestination: string;
  setupControls: ReactNode;
  surfaces: Record<string, ReactNode>;
  status?: ReactNode;
  onNavigate: (destinationKey: string) => void;
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

export function WorkflowMapHome({ workflowMap, onNavigate }: Pick<WorkflowShellProps, "workflowMap" | "onNavigate">) {
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

export function WorkflowShell({ workflowMap, activeDestination, setupControls, surfaces, status, onNavigate }: WorkflowShellProps) {
  const surface = activeDestination === "map" ? null : surfaces[activeDestination] ?? surfaces.substrate;

  return (
    <section className="workspace workflow-shell">
      <aside className="sidebar">
        {setupControls}
        <SurfaceNavigation workflowMap={workflowMap} activeDestination={activeDestination} onNavigate={onNavigate} />
      </aside>
      <section className="editor">
        {activeDestination === "map" ? (
          <WorkflowMapHome workflowMap={workflowMap} onNavigate={onNavigate} />
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
