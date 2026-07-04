import React from "react";
import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./main";

const admissionDecision = {
  flow: { key: "admission", runState: "not_started" },
  currentStep: "record:7:severity-declared",
  nextOrResumeState: {
    currentStep: "record:7:severity-declared",
    nextStep: "Full gate completion",
    safeExit: "Leave the record at under review and resume this Admission record."
  },
  localDecision: "Complete the full canon fact gate with written substance.",
  packageAuthority: {
    primary: "docs/worldbuilding-system/06_canon_fact_admission_protocol.md",
    why: "Admission is the only flow that changes canon standing.",
    citations: [
      "docs/worldbuilding-system/06_canon_fact_admission_protocol.md",
      "docs/worldbuilding-system/checklists/canon_fact_gate.md",
      "docs/principles/guided-workflow-usability.md"
    ]
  },
  selectedRecord: {
    id: 7,
    shortId: "FAC-7",
    recordTypeKey: "canon_fact",
    title: "Toll bell law",
    body: "The toll bell binds bridge crossings.",
    truthLayer: "Objective canon",
    canonStatus: "under review",
    createdAt: "2026-07-04T00:00:00.000Z",
    updatedAt: "2026-07-04T00:00:00.000Z",
    admissionLevel: "4",
    workScale: "severe",
    constraintTags: ["cost-bound"],
    sourceLinks: [{
      id: 1,
      fromRecordId: 7,
      toRecordId: 3,
      linkTypeKey: "derived_from",
      note: "Creation seed source",
      createdAt: "2026-07-04T00:00:00.000Z",
      target: { id: 3, shortId: "KER-1", title: "Bridge kernel", recordTypeKey: "world_kernel" }
    }]
  },
  severity: {
    admissionLevel: "4",
    workScale: "severe",
    gatePath: "full_gate",
    definitions: [
      { key: "admission_level", term: "4", definition: "Severe/foundational admission level.", source: "docs/worldbuilding-system/06_canon_fact_admission_protocol.md" },
      { key: "work_scale", term: "severe", definition: "Foundational change; open canon debt warns.", source: "docs/worldbuilding-system/06_canon_fact_admission_protocol.md" }
    ],
    obligations: ["fact statement", "shock-cone summary", "temporal/spatial passes"]
  },
  work: {
    required: ["Written consequence text", "Admission operation order"],
    optional: ["Prompt-out advisory pressure after steward-authored material exists"],
    skippable: ["Prompt-out can be declined through a skip_record"],
    severityDependent: ["temporal/spatial passes", "QA follow-up"]
  },
  doctrineCitations: [
    "docs/worldbuilding-system/06_canon_fact_admission_protocol.md",
    "docs/worldbuilding-system/checklists/canon_fact_gate.md",
    "docs/worldbuilding-system/20_ai_assisted_workflow.md"
  ],
  blockers: [
    { key: "written_consequence", label: "Written consequence", message: "Full gates refuse checkbox-only completion.", requires: "written consequence text" },
    { key: "quiet_domain_declaration", label: "Quiet domain declaration", message: "Quiet domains must be declared.", requires: "quiet-domain declaration" }
  ],
  skipRule: {
    offered: true,
    reasonRequired: true,
    reasonThreshold: "major-or-higher Admission work",
    belowThresholdNote: "Reason not collected below major-fact threshold.",
    recordType: "skip_record"
  },
  seedAudit: {
    offered: true,
    doctrine: [
      "docs/worldbuilding-system/05_creation_protocol.md",
      "docs/worldbuilding-system/06_canon_fact_admission_protocol.md",
      "docs/worldbuilding-system/checklists/frontloaded_seed_audit.md"
    ],
    runWrites: "Running seed audit writes a gate_result linked to audited seeds.",
    declineWrites: "Declining seed audit writes a governed skip_record.",
    nonMutation: "Seed audit does not mutate seed truth layer, canon status, tags, severity, or operations."
  },
  promptOut: {
    advisory: "optional",
    templateKey: "admission_constraint_challenge",
    stepKey: "admission:constraints",
    role: "Constraint challenger",
    stepRequest: {
      method: "POST",
      href: "/api/prompt-out/steps",
      body: {
        flowKey: "admission",
        templateKey: "admission_constraint_challenge",
        recordId: 7,
        stepKey: "admission:constraints",
        label: "Constraint challenger",
        admissionLevel: "4",
        workScale: "severe"
      }
    },
    preview: {
      currentDecision: "Complete the full canon fact gate with written substance.",
      promptText: "Role framing (Constraint challenger): ask for pressure, not answers.",
      sourceManifest: ["Record FAC-7: Toll bell law", "Doctrine: docs/worldbuilding-system/06_canon_fact_admission_protocol.md"],
      contextPreview: "FAC-7 Toll bell law",
      omissions: ["No hidden repository context is required."],
      advisoryCanonWarning: "Pasted responses remain advisory artifacts and are not admitted canon."
    }
  },
  writeIntent: {
    willWrite: ["gate_result report", "ordered admission operation events", "steward-selected canon status change on completion"],
    willLink: ["advisory-use links only when explicitly named"],
    willQueue: ["Follow-up propagation canon debt when supplied"],
    willLeaveUntouched: ["Seed audit does not mutate seed truth layer, canon status, tags, severity, or operations"],
    willRouteOnward: ["Read-side views remain read-only and do not gain Admission mutation controls"]
  },
  closePreview: {
    beforeCompletion: ["canon status change", "gate result", "skip records", "resume state"],
    afterCompletion: ["Current Canon", "Audit Trail", "record detail", "advisory artifacts", "skip records", "canon debt", "export"]
  },
  readSideTrail: [
    { label: "Current Canon", href: "/api/canon-workbench/current" },
    { label: "Audit Trail", href: "/api/canon-workbench/audit" },
    { label: "Record detail", href: "/api/canon-workbench/records/7" },
    { label: "Export", href: "/api/records/7/export/markdown" }
  ]
};

describe("Admission decision-point browser surface", () => {
  it("renders queue, severity, gate, seed audit, Prompt-out, close preview, and read-side trail from the server payload", () => {
    const html = renderToString(<App
      initialOpenWorld="/tmp/admission-decision.sqlite"
      initialAdmissionQueue={[{
        id: 7,
        shortId: "FAC-7",
        recordTypeKey: "canon_fact",
        title: "Toll bell law",
        body: "The toll bell binds bridge crossings.",
        truthLayer: "Objective canon",
        canonStatus: "under review",
        updatedAt: "2026-07-04T00:00:00.000Z",
        admissionLevel: "4",
        workScale: "severe",
        constraintTags: ["cost-bound"],
        sourceLinks: [{
          id: 1,
          fromRecordId: 7,
          toRecordId: 3,
          linkTypeKey: "derived_from",
          note: "Creation seed source",
          createdAt: "2026-07-04T00:00:00.000Z",
          target: { id: 3, shortId: "KER-1", title: "Bridge kernel", recordTypeKey: "world_kernel" }
        }],
        decisionPointHref: "/api/admission/records/7/decision-point"
      }]}
      initialAdmissionDecision={admissionDecision}
      initialRecords={[admissionDecision.selectedRecord]}
    />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(html).toContain("Decision point");
    expect(html).toContain("Complete the full canon fact gate with written substance.");
    expect(html).toContain("Only Admission changes canon standing");
    expect(html).toContain("canon_fact · Objective canon · under review");
    expect(html).toContain("Queue source or origin");
    expect(html).toContain("Open canon debt warning context");
    expect(html).toContain("No severity is selected by default");
    expect(html).toContain("admission_level");
    expect(html).toContain("work_scale");
    expect(html).toContain("Required work");
    expect(html).toContain("Optional work");
    expect(html).toContain("Skippable work");
    expect(html).toContain("Severity-dependent work");
    expect(html).toContain("Minor ledger path");
    expect(html).toContain("Full gate path");
    expect(html).toContain("Full gates refuse checkbox-only completion.");
    expect(html).toContain("Frontloaded seed audit");
    expect(html).toContain("docs/worldbuilding-system/05_creation_protocol.md");
    expect(html).toContain("docs/worldbuilding-system/checklists/frontloaded_seed_audit.md");
    expect(html).toContain("Reason required: yes");
    expect(html).toContain("Open canon debt warnings are non-blocking");
    expect(html).toContain("Prompt packet preview");
    expect(html).toContain("Source manifest");
    expect(html).toContain("Advisory/canon warning");
    expect(html).toContain("advisory_artifact");
    expect(html).toContain("Close preview");
    expect(html).toContain("What will be written");
    expect(html).toContain("Read-side trail");
    expect(html).toContain("Current Canon");
    expect(html).toContain("Read-side views stay read-only");

    expect(source).toContain("/api/admission/records/");
    expect(source).toContain("decision-point");
    expect(source).toContain("decisionPointHref");
    expect(source).toContain("setAdmissionDecision");
    expect(source).toContain("admissionDecision.promptOut.stepRequest");
    expect(source).not.toContain("admissionGatePolicy(");
    expect(source).not.toContain("requiresSkipReason(");
  });
});
