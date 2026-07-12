import React, { useEffect, useRef, useState } from "react";

type PropagationLifecycleState = "active" | "superseded" | "retracted";

interface PropagationLifecycleView {
  lineageId: string;
  version: number;
  lifecycleState: PropagationLifecycleState;
  priorVersionId: number | null;
  revisionReason: string | null;
  provenance: {
    created: { actor: { id: number; name: string }; timestamp: string; flowStep: string };
    retired: { actor: { id: number; name: string }; timestamp: string; flowStep: string } | null;
  };
}

export interface PropagationWorkspaceConsequence extends PropagationLifecycleView {
  id: number;
  orderKey: string;
  orderLabel: string;
  domainName: string | null;
  body: string;
  pressure: "normal" | "high";
}

export interface PropagationWorkspaceDomain extends PropagationLifecycleView {
  id: number;
  domainName: string;
  triage: "direct" | "dependency" | "reaction" | "negative";
  declaration: string;
}

export interface PropagationWorkspaceDisposition {
  id: number;
  flowId: number;
  consequenceId: number;
  disposition: string;
  note?: string;
  active: boolean;
  debtRecordId?: number | null;
  preservationBoundary?: string | null;
}

export interface PropagationWorkspaceBlocker {
  key: string;
  label?: string;
  message: string;
  requires?: string;
  consequenceId?: number;
}

export interface ConsequenceRevisionInput {
  reason: string;
  orderKey: string;
  domainName: string;
  body: string;
  pressure: "normal" | "high";
}

export interface DomainRevisionInput {
  reason: string;
  triage: "direct" | "dependency" | "reaction" | "negative";
  declaration: string;
}

export interface PropagationWorkspaceProps {
  runState: string;
  decisionName: string;
  packageSources: string[];
  obligations: { required: string[]; optional: string[]; skippable: string[]; severityDependent: string[] };
  orders: Array<{ key: string; label: string }>;
  domainNames: string[];
  consequences: PropagationWorkspaceConsequence[];
  domains: PropagationWorkspaceDomain[];
  dispositions: PropagationWorkspaceDisposition[];
  blockers: PropagationWorkspaceBlocker[];
  onReviseConsequence: (row: PropagationWorkspaceConsequence, draft: ConsequenceRevisionInput) => Promise<void>;
  onRetractConsequence: (row: PropagationWorkspaceConsequence, reason: string) => Promise<void>;
  onReviseDomain: (row: PropagationWorkspaceDomain, draft: DomainRevisionInput) => Promise<void>;
  onRetractDomain: (row: PropagationWorkspaceDomain, reason: string) => Promise<void>;
}

type EditorTarget = { kind: "consequence" | "domain"; rowId: number };

const targetKey = (target: EditorTarget) => `${target.kind}:${target.rowId}`;

export function PropagationWorkspace(props: PropagationWorkspaceProps) {
  const [openEditor, setOpenEditor] = useState<EditorTarget | null>(null);
  const [consequenceDrafts, setConsequenceDrafts] = useState<Record<number, ConsequenceRevisionInput>>({});
  const [domainDrafts, setDomainDrafts] = useState<Record<number, DomainRevisionInput>>({});
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});
  const [consequenceLineageOpen, setConsequenceLineageOpen] = useState(false);
  const [domainLineageOpen, setDomainLineageOpen] = useState(false);
  const editorHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const rowControlRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const activeConsequences = props.consequences.filter((row) => row.lifecycleState === "active");
  const activeDomains = props.domains.filter((row) => row.lifecycleState === "active");
  const retiredConsequences = props.consequences.filter((row) => row.lifecycleState !== "active");
  const retiredDomains = props.domains.filter((row) => row.lifecycleState !== "active");

  useEffect(() => {
    if (openEditor) editorHeadingRef.current?.focus();
  }, [openEditor]);

  const consequenceDraft = (row: PropagationWorkspaceConsequence): ConsequenceRevisionInput => consequenceDrafts[row.id] ?? {
    reason: "",
    orderKey: row.orderKey,
    domainName: row.domainName ?? "",
    body: row.body,
    pressure: row.pressure
  };

  const domainDraft = (row: PropagationWorkspaceDomain): DomainRevisionInput => domainDrafts[row.id] ?? {
    reason: "",
    triage: row.triage,
    declaration: row.declaration
  };

  const cancelEditor = (target: EditorTarget) => {
    if (target.kind === "consequence") {
      setConsequenceDrafts((current) => {
        const next = { ...current };
        delete next[target.rowId];
        return next;
      });
    } else {
      setDomainDrafts((current) => {
        const next = { ...current };
        delete next[target.rowId];
        return next;
      });
    }
    setOpenEditor(null);
    rowControlRefs.current[targetKey(target)]?.focus();
  };

  const clearActionError = (target: EditorTarget) => {
    setActionErrors((current) => {
      const next = { ...current };
      delete next[targetKey(target)];
      return next;
    });
  };

  const finishSuccessfulAction = (target: EditorTarget) => {
    clearActionError(target);
    if (target.kind === "consequence") {
      setConsequenceDrafts((current) => {
        const next = { ...current };
        delete next[target.rowId];
        return next;
      });
    } else {
      setDomainDrafts((current) => {
        const next = { ...current };
        delete next[target.rowId];
        return next;
      });
    }
    setOpenEditor(null);
    rowControlRefs.current[targetKey(target)]?.focus();
  };

  const recordActionError = (target: EditorTarget, error: unknown) => {
    const message = error instanceof Error ? error.message : "The server refused this Propagation action.";
    setActionErrors((current) => ({ ...current, [targetKey(target)]: message }));
  };

  const submitConsequence = async (row: PropagationWorkspaceConsequence, target: EditorTarget, action: "revise" | "retract") => {
    const draft = consequenceDraft(row);
    clearActionError(target);
    try {
      if (action === "revise") await props.onReviseConsequence(row, draft);
      else await props.onRetractConsequence(row, draft.reason);
      finishSuccessfulAction(target);
    } catch (error) {
      recordActionError(target, error);
    }
  };

  const submitDomain = async (row: PropagationWorkspaceDomain, target: EditorTarget, action: "revise" | "retract") => {
    const draft = domainDraft(row);
    clearActionError(target);
    try {
      if (action === "revise") await props.onReviseDomain(row, draft);
      else await props.onRetractDomain(row, draft.reason);
      finishSuccessfulAction(target);
    } catch (error) {
      recordActionError(target, error);
    }
  };

  const editorGuidance = (
    <div className="doctrine propagation-editor-guidance">
      <strong>{props.decisionName}</strong>
      <span>Governing package sources: {props.packageSources.join(" · ")}</span>
      <span>Required: {props.obligations.required.join(" · ") || "none returned"}</span>
      <span>Optional: {props.obligations.optional.join(" · ") || "none returned"}</span>
      <span>Skippable: {props.obligations.skippable.join(" · ") || "none returned"}</span>
      <span>Severity-dependent: {props.obligations.severityDependent.join(" · ") || "none returned"}</span>
    </div>
  );

  return (
    <section className="propagation-workspace" aria-label="Compact Pre-close Propagation workspace">
      <header className="subpanel">
        <h3>{props.decisionName} compact workspace</h3>
        <p>Browse the active close set, then deliberately open one consequence or domain editor.</p>
        <p className="meta">Governing package sources: {props.packageSources.join(" · ")}</p>
      </header>
      <section aria-labelledby="active-propagation-consequences">
        <h4 id="active-propagation-consequences">Active consequence summaries</h4>
        <div className="compact-propagation-list">
          {activeConsequences.map((consequence) => {
            const target: EditorTarget = { kind: "consequence", rowId: consequence.id };
            const isOpen = openEditor?.kind === target.kind && openEditor.rowId === target.rowId;
            const draft = consequenceDraft(consequence);
            const disposition = props.dispositions.find((row) => row.active && row.consequenceId === consequence.id);
            const rowBlockers = props.blockers.filter((blocker) => blocker.consequenceId === consequence.id);
            return (
              <article className="compact-propagation-row lifecycle-active" key={consequence.id}>
                <h5>Active consequence #{consequence.id}</h5>
                <p className="meta">Active · lineage {consequence.lineageId} · version {consequence.version}</p>
                <p>{consequence.body}</p>
                <p className="meta">{consequence.orderLabel} · {consequence.pressure} pressure · {consequence.domainName ?? "no domain"}</p>
                <p>{disposition ? `Disposition: ${disposition.disposition}` : "Undispositioned active consequence"}</p>
                {rowBlockers.map((blocker) => <p className="status error" key={`${consequence.id}:${blocker.key}`}>{blocker.label ?? blocker.key}: {blocker.message}</p>)}
                {props.runState === "in_progress" && (
                  <div className="row">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`consequence-editor-${consequence.id}`}
                      ref={(element) => { rowControlRefs.current[targetKey(target)] = element; }}
                      onClick={() => setOpenEditor(target)}
                    >Edit consequence #{consequence.id}</button>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`consequence-editor-${consequence.id}`}
                      onClick={() => setOpenEditor(target)}
                    >Retract consequence #{consequence.id}</button>
                  </div>
                )}
                {isOpen && (
                  <section id={`consequence-editor-${consequence.id}`} role="region" aria-label={`Edit consequence #${consequence.id}`} className="propagation-row-editor">
                    <h6 ref={editorHeadingRef} tabIndex={-1}>Edit consequence #{consequence.id}</h6>
                    {editorGuidance}
                    <label>Steward revision reason for consequence #{consequence.id}<input
                      value={draft.reason}
                      onChange={(event) => setConsequenceDrafts((current) => ({ ...current, [consequence.id]: { ...draft, reason: event.target.value } }))}
                    /></label>
                    <label>Replacement order for consequence #{consequence.id}<select
                      value={draft.orderKey}
                      onChange={(event) => setConsequenceDrafts((current) => ({ ...current, [consequence.id]: { ...draft, orderKey: event.target.value } }))}
                    >{props.orders.map((order) => <option key={order.key} value={order.key}>{order.label}</option>)}</select></label>
                    <label>Replacement domain for consequence #{consequence.id}<select
                      value={draft.domainName}
                      onChange={(event) => setConsequenceDrafts((current) => ({ ...current, [consequence.id]: { ...draft, domainName: event.target.value } }))}
                    ><option value="">No domain</option>{props.domainNames.map((domainName) => <option key={domainName}>{domainName}</option>)}</select></label>
                    <label>Replacement pressure for consequence #{consequence.id}<select
                      value={draft.pressure}
                      onChange={(event) => setConsequenceDrafts((current) => ({ ...current, [consequence.id]: { ...draft, pressure: event.target.value as ConsequenceRevisionInput["pressure"] } }))}
                    ><option>normal</option><option>high</option></select></label>
                    <label>Replacement consequence #{consequence.id}<textarea
                      rows={3}
                      value={draft.body}
                      onChange={(event) => setConsequenceDrafts((current) => ({ ...current, [consequence.id]: { ...draft, body: event.target.value } }))}
                    /></label>
                    <div className="row">
                      <button type="button" onClick={() => void submitConsequence(consequence, target, "revise")}>Save replacement consequence #{consequence.id}</button>
                      <button type="button" onClick={() => void submitConsequence(consequence, target, "retract")}>Confirm retraction of consequence #{consequence.id}</button>
                      <button type="button" onClick={() => cancelEditor(target)}>Cancel editing consequence #{consequence.id}</button>
                    </div>
                    {actionErrors[targetKey(target)] && (
                      <p className="status error" role="alert">
                        {actionErrors[targetKey(target)]} Your reason, replacement text, order, domain, and pressure are preserved. Follow the server remediation and retry this row.
                      </p>
                    )}
                  </section>
                )}
              </article>
            );
          })}
        </div>
        <button
          type="button"
          aria-label={`Retired consequence lineage (${retiredConsequences.length})`}
          aria-expanded={consequenceLineageOpen}
          aria-controls="retired-consequence-lineage"
          onClick={(event) => {
            setConsequenceLineageOpen((current) => !current);
            event.currentTarget.focus();
          }}
        >{consequenceLineageOpen ? "Hide" : "Show"} retired consequence lineage ({retiredConsequences.length})</button>
        {consequenceLineageOpen && (
          <div id="retired-consequence-lineage" className="retired-propagation-lineage">
            {retiredConsequences.map((consequence) => {
              const stateLabel = consequence.lifecycleState === "superseded" ? "Superseded" : "Retracted";
              const disposition = props.dispositions.find((row) => row.consequenceId === consequence.id);
              return (
                <article className={`compact-propagation-row lifecycle-${consequence.lifecycleState}`} key={consequence.id}>
                  <h5>{stateLabel} consequence #{consequence.id}</h5>
                  <p className="meta">{stateLabel} · lineage {consequence.lineageId} · version {consequence.version}</p>
                  <p>{consequence.body}</p>
                  {consequence.revisionReason && <p>Revision reason: {consequence.revisionReason}</p>}
                  <p className="meta">Created by {consequence.provenance.created.actor.name} (#{consequence.provenance.created.actor.id}) · {consequence.provenance.created.flowStep} · {consequence.provenance.created.timestamp}</p>
                  {consequence.provenance.retired && <p className="meta">Retired by {consequence.provenance.retired.actor.name} (#{consequence.provenance.retired.actor.id}) · {consequence.provenance.retired.flowStep} · {consequence.provenance.retired.timestamp}</p>}
                  {disposition && <p>Historical disposition: {disposition.disposition}{disposition.note ? ` · ${disposition.note}` : ""}</p>}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section aria-labelledby="active-propagation-domains">
        <h4 id="active-propagation-domains">Active domain summaries</h4>
        <div className="compact-propagation-list">
          {activeDomains.map((domain) => (
            (() => {
              const target: EditorTarget = { kind: "domain", rowId: domain.id };
              const isOpen = openEditor?.kind === target.kind && openEditor.rowId === target.rowId;
              const draft = domainDraft(domain);
              return (
                <article className="compact-propagation-row lifecycle-active" key={domain.id}>
                  <h5>Active domain: {domain.domainName}</h5>
                  <p className="meta">Active · lineage {domain.lineageId} · version {domain.version}</p>
                  <p>{domain.declaration || "No declaration."}</p>
                  <p className="meta">Triage: {domain.triage}</p>
                  {props.runState === "in_progress" && (
                    <div className="row">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`domain-editor-${domain.id}`}
                        ref={(element) => { rowControlRefs.current[targetKey(target)] = element; }}
                        onClick={() => setOpenEditor(target)}
                      >Edit domain: {domain.domainName}</button>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`domain-editor-${domain.id}`}
                        onClick={() => setOpenEditor(target)}
                      >Retract domain: {domain.domainName}</button>
                    </div>
                  )}
                  {isOpen && (
                    <section id={`domain-editor-${domain.id}`} role="region" aria-label={`Edit domain: ${domain.domainName}`} className="propagation-row-editor">
                      <h6 ref={editorHeadingRef} tabIndex={-1}>Edit domain: {domain.domainName}</h6>
                      {editorGuidance}
                      <label>Steward revision reason for domain {domain.domainName}<input
                        value={draft.reason}
                        onChange={(event) => setDomainDrafts((current) => ({ ...current, [domain.id]: { ...draft, reason: event.target.value } }))}
                      /></label>
                      <label>Replacement triage for domain {domain.domainName}<select
                        value={draft.triage}
                        onChange={(event) => setDomainDrafts((current) => ({ ...current, [domain.id]: { ...draft, triage: event.target.value as DomainRevisionInput["triage"] } }))}
                      ><option>direct</option><option>dependency</option><option>reaction</option><option>negative</option></select></label>
                      <label>Replacement declaration for domain {domain.domainName}<textarea
                        rows={2}
                        value={draft.declaration}
                        onChange={(event) => setDomainDrafts((current) => ({ ...current, [domain.id]: { ...draft, declaration: event.target.value } }))}
                      /></label>
                      <div className="row">
                        <button type="button" onClick={() => void submitDomain(domain, target, "revise")}>Save replacement domain: {domain.domainName}</button>
                        <button type="button" onClick={() => void submitDomain(domain, target, "retract")}>Confirm retraction of domain: {domain.domainName}</button>
                        <button type="button" onClick={() => cancelEditor(target)}>Cancel editing domain: {domain.domainName}</button>
                      </div>
                      {actionErrors[targetKey(target)] && (
                        <p className="status error" role="alert">
                          {actionErrors[targetKey(target)]} Your reason, triage, and declaration are preserved. Follow the server remediation and retry this row.
                        </p>
                      )}
                    </section>
                  )}
                </article>
              );
            })()
          ))}
        </div>
        <button
          type="button"
          aria-label={`Retired domain lineage (${retiredDomains.length})`}
          aria-expanded={domainLineageOpen}
          aria-controls="retired-domain-lineage"
          onClick={(event) => {
            setDomainLineageOpen((current) => !current);
            event.currentTarget.focus();
          }}
        >{domainLineageOpen ? "Hide" : "Show"} retired domain lineage ({retiredDomains.length})</button>
        {domainLineageOpen && (
          <div id="retired-domain-lineage" className="retired-propagation-lineage">
            {retiredDomains.map((domain) => {
              const stateLabel = domain.lifecycleState === "superseded" ? "Superseded" : "Retracted";
              return (
                <article className={`compact-propagation-row lifecycle-${domain.lifecycleState}`} key={domain.id}>
                  <h5>{stateLabel} domain: {domain.domainName}</h5>
                  <p className="meta">{stateLabel} · lineage {domain.lineageId} · version {domain.version}</p>
                  <p>{domain.declaration || "No declaration."}</p>
                  <p className="meta">Historical triage: {domain.triage}</p>
                  {domain.revisionReason && <p>Revision reason: {domain.revisionReason}</p>}
                  <p className="meta">Created by {domain.provenance.created.actor.name} (#{domain.provenance.created.actor.id}) · {domain.provenance.created.flowStep} · {domain.provenance.created.timestamp}</p>
                  {domain.provenance.retired && <p className="meta">Retired by {domain.provenance.retired.actor.name} (#{domain.provenance.retired.actor.id}) · {domain.provenance.retired.flowStep} · {domain.provenance.retired.timestamp}</p>}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}
