import React, { useEffect, useRef } from "react";
import type { GuidedFlowSourceSelection } from "@worldloom/shared";

export interface SourceSelectionDraft {
  sourceType: string;
  recordId: string;
  sectionHeading: string;
  materialTitle: string;
  materialBody: string;
}

export interface SourceSelectionMode {
  value: string;
  label: string;
}

export const sourceSelectionDraftFromSelection = (
  selection: GuidedFlowSourceSelection
): SourceSelectionDraft => ({
  sourceType: selection.request.sourceType,
  recordId: selection.request.recordId == null ? "" : String(selection.request.recordId),
  sectionHeading: selection.request.sectionHeading ?? "",
  materialTitle: selection.request.materialTitle,
  materialBody: selection.request.materialBody
});

export interface SourceIdentityDiscontinuity {
  continuityKind: "source mode" | "selected source" | "selected material" | "stored run source";
  approvedHumanLabel: string;
  returnedHumanLabel: string;
}

export const sourceIdentityDiscontinuity = (
  approved: GuidedFlowSourceSelection | null,
  returned: GuidedFlowSourceSelection
): SourceIdentityDiscontinuity | null => {
  if (approved == null) return null;
  if (approved.request.sourceType !== returned.request.sourceType) {
    return {
      continuityKind: "source mode",
      approvedHumanLabel: approved.request.sourceType,
      returnedHumanLabel: returned.request.sourceType
    };
  }
  if (approved.request.sourceType === "material") {
    if (
      approved.request.materialTitle !== returned.request.materialTitle
      || approved.request.materialBody !== returned.request.materialBody
    ) {
      return {
        continuityKind: "selected material",
        approvedHumanLabel: approved.request.materialTitle || "untitled selected material",
        returnedHumanLabel: returned.request.materialTitle || "untitled selected material"
      };
    }
    return null;
  }
  if (approved?.identity != null) {
    if (returned.identity == null || approved.identity.stableRecordId !== returned.identity.stableRecordId) {
      return {
        continuityKind: "selected source",
        approvedHumanLabel: `${approved.identity.shortId} · ${approved.identity.title} · stable id ${approved.identity.stableRecordId}`,
        returnedHumanLabel: returned.identity == null
          ? "no returned record identity"
          : `${returned.identity.shortId} · ${returned.identity.title} · stable id ${returned.identity.stableRecordId}`
      };
    }
  } else if (returned.identity != null) {
    return {
      continuityKind: "selected source",
      approvedHumanLabel: "no approved record identity",
      returnedHumanLabel: `${returned.identity.shortId} · ${returned.identity.title} · stable id ${returned.identity.stableRecordId}`
    };
  }
  if (approved?.storedRunIdentity != null) {
    if (returned.storedRunIdentity == null || approved.storedRunIdentity.stableRecordId !== returned.storedRunIdentity.stableRecordId) {
      return {
        continuityKind: "stored run source",
        approvedHumanLabel: `${approved.storedRunIdentity.shortId} · ${approved.storedRunIdentity.title} · stable id ${approved.storedRunIdentity.stableRecordId}`,
        returnedHumanLabel: returned.storedRunIdentity == null
          ? "no returned stored-run source identity"
          : `${returned.storedRunIdentity.shortId} · ${returned.storedRunIdentity.title} · stable id ${returned.storedRunIdentity.stableRecordId}`
      };
    }
  } else if (returned.storedRunIdentity != null) {
    return {
      continuityKind: "stored run source",
      approvedHumanLabel: "no approved stored-run source identity",
      returnedHumanLabel: `${returned.storedRunIdentity.shortId} · ${returned.storedRunIdentity.title} · stable id ${returned.storedRunIdentity.stableRecordId}`
    };
  }
  return null;
};

export interface SourceSelectionEntryProps {
  idPrefix: string;
  draft: SourceSelectionDraft;
  sourceModes: SourceSelectionMode[];
  selection: GuidedFlowSourceSelection | null;
  discontinuity: SourceIdentityDiscontinuity | null;
  resolving: boolean;
  disabled: boolean;
  startLabel: string;
  onDraftChange: (draft: SourceSelectionDraft) => void;
  onResolve: () => void | Promise<void>;
  onStart: () => void | Promise<void>;
  onSafeReturn: () => void | Promise<void>;
}

const joined = (values: string[]): string => values.length === 0 ? "none" : values.join(" · ");

export const SourceSelectionEntry = ({
  idPrefix,
  draft,
  sourceModes,
  selection,
  discontinuity,
  resolving,
  disabled,
  startLabel,
  onDraftChange,
  onResolve,
  onStart,
  onSafeReturn
}: SourceSelectionEntryProps) => {
  const recordInput = useRef<HTMLInputElement>(null);
  const sectionInput = useRef<HTMLInputElement>(null);
  const materialTitleInput = useRef<HTMLInputElement>(null);
  const statusId = `${idPrefix}-status`;
  const validationId = `${idPrefix}-validation`;

  useEffect(() => {
    if (discontinuity == null && selection?.validation.valid !== false) return;
    if (draft.sourceType === "material") materialTitleInput.current?.focus();
    else if (draft.sourceType === "record_section" && selection?.validation.state === "missing") sectionInput.current?.focus();
    else recordInput.current?.focus();
  }, [discontinuity, draft.sourceType, selection]);

  const update = (changes: Partial<SourceSelectionDraft>) => onDraftChange({ ...draft, ...changes });
  const isMaterial = draft.sourceType === "material";
  const isSection = draft.sourceType === "record_section";
  const canStart = !disabled
    && !resolving
    && discontinuity == null
    && selection?.validation.valid === true
    && selection.action.startOrResumeAvailable;
  const validationState = discontinuity == null
    ? resolving ? "resolving" : selection?.validation.state ?? "empty"
    : "identity discontinuity";
  const humanIdentity = selection?.identity == null
    ? selection?.selectedMaterial == null
      ? "No resolved human identity"
      : `Selected material ${selection.selectedMaterial.title}`
    : `${selection.identity.shortId} ${selection.identity.title}, record type ${selection.identity.recordTypeKey}, canon status ${selection.identity.canonStatus ?? "unset"}`;
  const accessibleContext = `Source type ${draft.sourceType}. ${humanIdentity}. Validation state ${validationState}.`;
  const groupAccessibleName = `Source-selected guided-flow run entry. ${humanIdentity}. ${selection?.destination.label ?? "Destination unresolved"}. Validation state ${validationState}.`;
  const stateText = discontinuity
    ? `Validation state: identity discontinuity. Start or resume remains unavailable. Approved ${discontinuity.continuityKind}: ${discontinuity.approvedHumanLabel}; returned: ${discontinuity.returnedHumanLabel}.`
    : resolving
    ? "Resolving the preserved source selection with the server."
    : selection == null
      ? "No source has been resolved. Enter a source and ask the server to resolve it."
      : `Validation state: ${selection.validation.state}. ${selection.validation.valid ? "Start or resume is available." : "Start or resume remains unavailable."}`;

  return (
    <fieldset className="source-selection-entry" aria-label={groupAccessibleName} aria-describedby={`${statusId} ${validationId}`}>
      <legend>Source-selected guided-flow run entry</legend>
      <div className="grid">
        <label htmlFor={`${idPrefix}-type`}>Source type</label>
        <select
          id={`${idPrefix}-type`}
          value={draft.sourceType}
          onChange={(event) => update({ sourceType: event.target.value })}
          disabled={disabled || resolving}
        >
          {sourceModes.map((mode) => <option key={mode.value} value={mode.value}>{mode.label}</option>)}
        </select>
        {!isMaterial && (
          <>
            <label htmlFor={`${idPrefix}-record`}>Source or report stable id</label>
            <input
              ref={recordInput}
              id={`${idPrefix}-record`}
              aria-label={`Source or report stable id. ${accessibleContext}`}
              inputMode="numeric"
              value={draft.recordId}
              onChange={(event) => update({ recordId: event.target.value })}
              aria-describedby={`${statusId} ${validationId}`}
              disabled={disabled || resolving}
            />
          </>
        )}
        {isSection && (
          <>
            <label htmlFor={`${idPrefix}-section`}>Section heading</label>
            <input
              ref={sectionInput}
              id={`${idPrefix}-section`}
              value={draft.sectionHeading}
              onChange={(event) => update({ sectionHeading: event.target.value })}
              aria-describedby={`${statusId} ${validationId}`}
              disabled={disabled || resolving}
            />
          </>
        )}
      </div>
      {isMaterial && (
        <div className="grid">
          <label htmlFor={`${idPrefix}-material-title`}>Material title</label>
          <input
            ref={materialTitleInput}
            id={`${idPrefix}-material-title`}
            value={draft.materialTitle}
            onChange={(event) => update({ materialTitle: event.target.value })}
            aria-describedby={`${statusId} ${validationId}`}
            disabled={disabled || resolving}
          />
          <label htmlFor={`${idPrefix}-material-body`}>Material body</label>
          <textarea
            id={`${idPrefix}-material-body`}
            rows={3}
            value={draft.materialBody}
            onChange={(event) => update({ materialBody: event.target.value })}
            aria-describedby={`${statusId} ${validationId}`}
            disabled={disabled || resolving}
          />
        </div>
      )}

      <div className="row">
        <button type="button" onClick={() => void onResolve()} disabled={disabled || resolving}>Resolve source</button>
        <button type="button" onClick={() => void onStart()} disabled={!canStart} aria-describedby={`${statusId} ${validationId}`}>{startLabel}</button>
      </div>

      <p id={statusId} role="status" aria-live="polite" aria-atomic="true">{stateText}</p>
      <div id={validationId}>
        {discontinuity && (
          <div className="source-selection-blocker">
            <p role="alert">Start or resume returned a different {discontinuity.continuityKind}: {discontinuity.returnedHumanLabel}. You approved {discontinuity.approvedHumanLabel}; the displayed approved selection was not replaced.</p>
            <p><strong>Remediation:</strong> Return to a fresh Workflow map and resolve the intended source again before starting or resuming.</p>
            <p><strong>Substance validation:</strong> Stable record identity must remain continuous from displayed approval through the loaded run response.</p>
          </div>
        )}
        {selection?.validation.valid === false && (
          <div className="source-selection-blocker">
            <p role="alert">{selection.validation.blocker}</p>
            <p><strong>Remediation:</strong> {selection.validation.remediation}</p>
          </div>
        )}
        {selection && <p><strong>Substance validation:</strong> {selection.validation.substanceRule}</p>}
      </div>

      {selection?.identity && (
        <section className="subpanel source-selection-summary" aria-label="Resolved source identity">
          <h4>{selection.identity.shortId} · {selection.identity.title}</h4>
          <dl>
            <div><dt>Stable record id</dt><dd>{selection.identity.stableRecordId}</dd></div>
            <div><dt>Record type</dt><dd>{selection.identity.recordTypeKey}</dd></div>
            <div><dt>Canon status</dt><dd>{selection.identity.canonStatus ?? "unset"}</dd></div>
            <div><dt>Requested source type</dt><dd>{selection.request.sourceType}</dd></div>
            {selection.request.sectionHeading && <div><dt>Section heading</dt><dd>{selection.request.sectionHeading}</dd></div>}
          </dl>
        </section>
      )}

      {selection?.selectedMaterial && (
        <section className="subpanel source-selection-summary" aria-label="Resolved selected material">
          <h4>Selected material · {selection.selectedMaterial.title}</h4>
          <p>{selection.selectedMaterial.body}</p>
        </section>
      )}

      {selection?.storedRunIdentity && (
        <p><strong>Stored run source:</strong> {selection.storedRunIdentity.shortId} · {selection.storedRunIdentity.title} · stable id {selection.storedRunIdentity.stableRecordId}</p>
      )}

      {selection?.binding && (
        <section className="subpanel" aria-label="Conditional-pass provenance">
          <h4>{selection.binding.passLabel} · {selection.binding.disposition}</h4>
          <p><strong>Why this pass is owed:</strong> {selection.binding.doctrine}</p>
          <p><strong>Obligation:</strong> {selection.binding.obligation.shortId} · {selection.binding.obligation.title} · stable id {selection.binding.obligation.stableRecordId}</p>
          <p><strong>Source fact:</strong> {selection.binding.sourceFact.shortId} · {selection.binding.sourceFact.title} · stable id {selection.binding.sourceFact.stableRecordId}</p>
          <p><strong>Final Propagation report:</strong> {selection.binding.propagationReport.shortId} · {selection.binding.propagationReport.title} · stable id {selection.binding.propagationReport.stableRecordId}</p>
          <p><strong>Destination:</strong> {selection.destination.label} · binding valid</p>
        </section>
      )}

      {selection && (
        <section className="subpanel" aria-label="Source-selection guidance">
          <h4>App-owned guidance</h4>
          <p>{selection.doctrine.selectedSource}</p>
          <p>{selection.doctrine.validity}</p>
          <p>{selection.doctrine.stableIdentity}</p>
          <p>Required: {joined(selection.fieldClassifications.required)}</p>
          <p>Optional: {joined(selection.fieldClassifications.optional)}</p>
          <p>Skippable: {joined(selection.fieldClassifications.skippable)}</p>
          <p>Severity-dependent: {joined(selection.fieldClassifications.severityDependent)}</p>
          <p>Current: {selection.orientation.current}</p>
          <p>Next: {selection.orientation.next}</p>
          <p>Resume: {selection.orientation.resume}</p>
          <div className="chips">
            {selection.destination.packageSources.map((source) => <span key={source}>{source}</span>)}
          </div>
          <button type="button" onClick={() => void onSafeReturn()}>Return to fresh Workflow map</button>
        </section>
      )}
    </fieldset>
  );
};
