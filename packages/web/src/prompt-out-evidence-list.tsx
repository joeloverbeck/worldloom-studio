import React from "react";

export interface PromptEvidenceItemView {
  id: string;
  displayText: string;
  kind: "source" | "omission";
  candidateIdentity: string | null;
  ruleIdentity: string;
  standing: { truthLayer: string | null; canonStatus: string | null } | null;
  relationship: string | null;
  decisionMeaning: string | null;
  provenanceReferences: string[];
  aggregatePathCount: number | null;
}

export function PromptOutEvidenceList({
  label,
  items,
  emptyText
}: {
  label: string;
  items: PromptEvidenceItemView[];
  emptyText: string;
}) {
  return (
    <ul className="prompt-out-evidence-list" aria-label={label}>
      {items.length === 0 ? <li>{emptyText}</li> : items.map((item) => (
        <li key={item.id} data-prompt-evidence-id={item.id}>
          <strong>{item.displayText}</strong>
          <div className="meta prompt-out-evidence-metadata">
            {item.aggregatePathCount == null ? null : <span>{item.aggregatePathCount} equivalent paths</span>}
            {item.candidateIdentity == null ? null : <span>Candidate: {item.candidateIdentity}</span>}
            <span>Rule: {item.ruleIdentity}</span>
            {item.standing == null ? null : <span>Standing: {item.standing.truthLayer ?? "unspecified truth layer"} · {item.standing.canonStatus ?? "unspecified canon status"}</span>}
            {item.relationship == null ? null : <span>Relationship: {item.relationship}</span>}
            {item.decisionMeaning == null ? null : <span>Decision: {item.decisionMeaning}</span>}
            <span>Provenance: {item.provenanceReferences.join(" → ") || "none supplied"}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
