import React from "react";
import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { App } from "./main";

const workflowMap = {
  readOnly: true,
  world: { path: "/tmp/admission-decision.sqlite" },
  stages: [
    { key: "creation", label: "Creation", state: "complete", summary: "Creation has parked seed material.", destinationKey: "creation" },
    { key: "admission", label: "Admission", state: "active", summary: "Admission queue has proposed facts.", destinationKey: "admission" }
  ],
  queues: [
    { key: "admission", label: "Admission queue", count: 1, destinationKey: "admission", href: "/api/admission/queue", summary: "Proposed facts awaiting governance." }
  ],
  nextDecision: {
    destinationKey: "admission",
    label: "Open Admission",
    reason: "A proposed seed is waiting for severity classification.",
    href: "/api/admission/queue"
  },
  destinations: [
    { key: "creation", label: "Creation", kind: "guided-flow", summary: "Create and park seeds.", state: "complete" },
    { key: "admission", label: "Admission", kind: "guided-flow", summary: "Govern proposed facts.", state: "active" },
    { key: "substrate", label: "Substrate", kind: "substrate", summary: "Generic record, link, search, draft, and Prompt-out admin tools.", state: "available" }
  ]
};

const preSeverityAdmissionDecision = {
  methodCard: {
    key: "admission.queue-severity",
    flowKey: "admission",
    decisionPoint: "Admission queue severity classification",
    decision: "Choose and classify the proposed fact before Admission changes canon standing.",
    operativeRule: "Admission cannot choose a gate path until the steward declares both admission_level and work_scale.",
    why: "Severity scales the evidence owed while leaving canon judgment with the steward.",
    goodMaterial: "Good classification material names risk, dependencies, missing information, uncertainty, and questions before labels are chosen.",
    guidanceDepth: "standard",
    derivationVersion: "method-card/v1",
    packageSources: ["docs/worldbuilding-system/06_canon_fact_admission_protocol.md"]
  },
  flow: { key: "admission", runState: "not_started" },
  currentStep: "record:7:queue-selection",
  nextOrResumeState: {
    currentStep: "record:7:queue-selection",
    nextStep: "Severity declaration",
    safeExit: "Leave the record at proposed; resume from the same Admission record."
  },
  localDecision: "Choose and classify the proposed fact before Admission changes canon standing.",
  packageAuthority: {
    primary: "docs/worldbuilding-system/06_canon_fact_admission_protocol.md",
    why: "Admission is the only flow that changes canon standing.",
    citations: [
      "docs/worldbuilding-system/06_canon_fact_admission_protocol.md",
      "docs/worldbuilding-system/20_ai_assisted_workflow.md"
    ]
  },
  selectedRecord: {
    id: 7,
    shortId: "FAC-7",
    recordTypeKey: "canon_fact",
    title: "Toll bell law",
    body: "The toll bell binds bridge crossings.",
    truthLayer: "Objective canon",
    canonStatus: "proposed",
    createdAt: "2026-07-04T00:00:00.000Z",
    updatedAt: "2026-07-04T00:00:00.000Z",
    admissionLevel: null,
    workScale: null,
    constraintTags: [],
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
    admissionLevel: null,
    workScale: null,
    gatePath: null,
    definitions: [
      { key: "admission_level", term: "0", definition: "Trivial or bookkeeping admission.", source: "docs/worldbuilding-system/06_canon_fact_admission_protocol.md" },
      { key: "work_scale", term: "minor", definition: "Small local fact.", source: "docs/worldbuilding-system/06_canon_fact_admission_protocol.md" }
    ],
    obligations: ["Declare admission_level", "Declare work_scale"]
  },
  work: {
    required: ["Select a proposed fact", "Declare admission_level", "Declare work_scale"],
    optional: ["Prompt-out advisory pressure after steward-authored material exists"],
    skippable: ["Frontloaded seed audit can be declined with a governed skip record"],
    severityDependent: ["Gate depth is unavailable until severity is declared"]
  },
  doctrineCitations: [
    "docs/worldbuilding-system/06_canon_fact_admission_protocol.md",
    "docs/worldbuilding-system/20_ai_assisted_workflow.md"
  ],
  blockers: [
    { key: "severity_required", label: "Severity declaration", message: "Admission cannot choose a path until the steward declares both severity facets.", requires: "admission_level and work_scale" }
  ],
  skipRule: {
    offered: true,
    reasonRequired: false,
    reasonThreshold: "major-or-higher Admission work",
    belowThresholdNote: "Reason not collected below major-fact threshold.",
    recordType: "skip_record"
  },
  seedAudit: {
    offered: true,
    doctrine: [
      "docs/worldbuilding-system/05_creation_protocol.md",
      "docs/worldbuilding-system/checklists/frontloaded_seed_audit.md"
    ],
    runWrites: "Running seed audit writes a gate_result linked to audited seeds.",
    declineWrites: "Declining seed audit writes a governed skip_record.",
    nonMutation: "Seed audit does not mutate seed truth layer, canon status, tags, severity, or operations."
  },
  promptOut: {
    advisory: "optional",
    templateKey: "admission_queue_severity",
    stepKey: "admission:queue-severity",
    role: "Severity classification readiness",
    modes: [
      { mode: "proposal", label: "Proposal mode", available: true, availability: "available", blocker: null, framing: "Ask for risks, dependencies, missing information, uncertainty, and candidate questions.", outputLabels: ["risk", "dependency", "missing information", "question"], stepRequest: { method: "POST", href: "/api/prompt-out/steps", body: {} } },
      { mode: "pressure", label: "Pressure mode", available: true, availability: "available", blocker: null, framing: "Challenge steward-authored classification material.", outputLabels: ["risk", "dependency", "missing information", "question"], stepRequest: { method: "POST", href: "/api/prompt-out/steps", body: {} } }
    ],
    stepRequest: {
      method: "POST",
      href: "/api/prompt-out/steps",
      body: {
        flowKey: "admission",
        templateKey: "admission_queue_severity",
        recordId: 7,
        stepKey: "admission:queue-severity",
        label: "Severity classification readiness"
      }
    },
    preview: {
      currentDecision: "Choose and classify the proposed fact before Admission changes canon standing.",
      promptText: "Queue/severity classification readiness. Ask for risks, dependencies, missing information, uncertainty, and candidate questions. Do not complete the minor ledger.",
      sourceManifest: ["Record FAC-7: Toll bell law", "Prompt template: admission_queue_severity", "Method card: admission.queue-severity (method-card/v1)"],
      contextPreview: "FAC-7 Toll bell law",
      omissions: ["Minor ledger completion omitted until severity is declared."],
      advisoryCanonWarning: "Pasted responses remain advisory artifacts and are not admitted canon."
    }
  },
  writeIntent: {
    willWrite: ["No canon mutation until the steward completes Admission"],
    willLink: ["Read-side trail links expose Current Canon, Audit Trail, record detail, advisory artifacts, skip records, canon debt, and export"],
    willQueue: [],
    willLeaveUntouched: ["Seed audit does not mutate seed truth layer, canon status, tags, severity, or operations"],
    willRouteOnward: ["minor ledger or full gate after severity declaration"]
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

const admissionDecision = {
  methodCard: {
    key: "admission.full-gate",
    flowKey: "admission",
    decisionPoint: "Full canon fact gate",
    decision: "Complete the full canon fact gate with written substance.",
    operativeRule: "Major-or-higher work owes written consequences, ordered admission operations, n/a reasons, quiet-domain declarations, and follow-up debt where appropriate.",
    why: "Load-bearing canon changes should expose their costs before they become accepted world truth.",
    goodMaterial: "Good full-gate material names dependencies, costs, access limits, shock-cone summary, contradiction or mystery risk, and follow-up obligations in steward wording.",
    guidanceDepth: "full",
    derivationVersion: "method-card/v1",
    packageSources: [
      "docs/worldbuilding-system/06_canon_fact_admission_protocol.md",
      "docs/worldbuilding-system/checklists/canon_fact_gate.md"
    ]
  },
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
      sourceManifest: ["Record FAC-7: Toll bell law", "Method card: admission.full-gate (method-card/v1)", "Package source: docs/worldbuilding-system/06_canon_fact_admission_protocol.md"],
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
  fullGateContract: {
    sections: [
      {
        key: "fact_statement",
        label: "Fact statement",
        required: true,
        canMarkNotApplicable: false,
        quietDomain: false,
        guidance: "State the smallest precise version the world must answer."
      },
      {
        key: "dependencies",
        label: "Dependencies",
        required: true,
        canMarkNotApplicable: true,
        quietDomain: false,
        guidance: "Name hard, soft, social, economic, epistemic, temporal, spatial, or aesthetic dependencies."
      },
      {
        key: "institutions_or_quiet_domain_declaration",
        label: "Institutions or quiet-domain declaration",
        required: true,
        canMarkNotApplicable: false,
        quietDomain: true,
        guidance: "Record affected institutions or explicitly declare the domain quiet."
      },
      {
        key: "branch_implications",
        label: "Branch implications",
        required: false,
        canMarkNotApplicable: true,
        quietDomain: false,
        guidance: "Name branch implications or give an n/a reason."
      }
    ],
    allowedNextCanonStatuses: ["under review", "accepted", "accepted with constraints", "localized", "contested", "quarantined", "branch-only", "rejected"],
    operationOptions: ["accept", "constrain", "price"],
    constraintTagOptions: ["cost-bound", "seasonal"],
    validationErrors: [
      { key: "dependencies", message: "Dependencies require steward-authored substance." }
    ],
    completionAction: { method: "POST", href: "/api/admission/gate/complete" },
    advisoryArtifacts: [
      { id: 12, shortId: "ADV-12", title: "Advisory artifact: admission:constraints", stepKey: "admission:constraints" }
    ]
  },
  readSideTrail: [
    { label: "Current Canon", href: "/api/canon-workbench/current" },
    { label: "Audit Trail", href: "/api/canon-workbench/audit" },
    { label: "Record detail", href: "/api/canon-workbench/records/7" },
    { label: "Export", href: "/api/records/7/export/markdown" }
  ]
};

describe("Admission decision-point browser surface", () => {
  it("renders queue, severity, seed audit, Prompt-out, close preview, and read-side trail from the routed workflow destination", () => {
    const html = renderToString(<App
      initialOpenWorld="/tmp/admission-decision.sqlite"
      initialWorkflowMap={workflowMap as any}
      initialDestination="admission"
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
      initialAdmissionDecision={preSeverityAdmissionDecision as any}
      initialRecords={[preSeverityAdmissionDecision.selectedRecord as any]}
    />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(html).toContain("Back to workflow map");
    expect(html).toContain("Decision point");
    expect(html).toContain("Choose and classify the proposed fact before Admission changes canon standing.");
    expect(html).toContain("Only Admission changes canon standing");
    expect(html).toContain("canon_fact · Objective canon · proposed");
    expect(html).toContain("Queue source or origin");
    expect(html).toContain("Open canon debt warning context");
    expect(html).toContain("No severity is selected by default");
    expect(html).toContain("admission_level");
    expect(html).toContain("work_scale");
    expect(html).toContain("Severity path: undeclared");
    expect(html).toContain("Admission cannot choose a path until the steward declares both severity facets.");
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
    expect(html).toContain("Reason required: no");
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
    expect(html).toContain("admission_queue_severity");
    expect(html).toContain("Method card: admission.queue-severity");
    expect(html).not.toContain("Complete Gate");
    expect(html).not.toContain("Admit Minor Row");

    expect(source).toContain("/api/admission/records/");
    expect(source).toContain("decision-point");
    expect(source).toContain("decisionPointHref");
    expect(source).toContain("setAdmissionDecision");
    expect(source).toContain("admissionDecision.promptOut.stepRequest");
    expect(source).not.toContain("admissionGatePolicy(");
    expect(source).not.toContain("requiresSkipReason(");
  });

  it("keeps the legacy stacked workspace from rendering a competing Admission decision surface", () => {
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
        sourceLinks: [],
        decisionPointHref: "/api/admission/records/7/decision-point"
      }]}
      initialAdmissionDecision={admissionDecision as any}
      initialRecords={[admissionDecision.selectedRecord as any]}
    />);

    expect(html).not.toContain("Declare Severity");
    expect(html).not.toContain("Complete Gate");
    expect(html).not.toContain("Admit Minor Row");
    expect(html).not.toContain("Run Seed Audit");
    expect(html).not.toContain("Load Admission Prompt-out Step");
  });

  it("renders an executable full-gate form, advisory-use selector, write preview, and server errors on the routed surface", () => {
    const html = renderToString(<App
      initialOpenWorld="/tmp/admission-decision.sqlite"
      initialWorkflowMap={workflowMap as any}
      initialDestination="admission"
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
        sourceLinks: [],
        decisionPointHref: "/api/admission/records/7/decision-point"
      }]}
      initialAdmissionDecision={admissionDecision as any}
      initialRecords={[admissionDecision.selectedRecord as any]}
    />);
    const source = readFileSync(new URL("./main.tsx", import.meta.url), "utf8");

    expect(html).toContain("Full-gate completion form");
    expect(html).toContain("Fact statement");
    expect(html).toContain("Dependencies");
    expect(html).toContain("required");
    expect(html).toContain("optional");
    expect(html).toContain("Fact statement substance");
    expect(html).toContain("Mark Dependencies not applicable");
    expect(html).toContain("Dependencies not-applicable reason");
    expect(html).toContain("Institutions or quiet-domain declaration quiet-domain declaration");
    expect(html).toContain("Primary admission operation order");
    expect(html).toContain("Allowed canon status target");
    expect(html).toContain("Constraint tags for full gate");
    expect(html).toContain("Follow-up debt for full gate");
    expect(html).toContain("Review exact full-gate payload");
    expect(html).toContain("Final review required before completion");
    expect(html).toContain("Complete and update canon standing");
    expect(html).toContain("Hold under review");
    expect(html).toContain("Reject through Admission");
    expect(html).toContain("Advisory use");
    expect(html).toContain("ADV-12 · Advisory artifact: admission:constraints");
    expect(html).toContain("No advisory-use link selected");
    expect(html).toContain("Full-gate validation errors");
    expect(html).toContain("Dependencies require steward-authored substance.");
    expect(html).toContain("Section failures preserve entered text and selections.");
    expect(html).toContain("gate_result report");
    expect(html).toContain("Selected advisory-use link: none");
    expect(html).toContain("Read-side trail");

    expect(source).toContain("/api/admission/gate/complete");
    expect(source).toContain("sections:");
    expect(source).toContain("advisoryRecordId");
    expect(source).toContain("admissionDraftIdentityFor");
    expect(source).toContain("resetAdmissionFullGateDraftState");
    expect(source).toContain("buildAdmissionGateCompletionPayload");
    expect(source).toContain("buildAdmissionFullGateDraftPayload");
    expect(source).toContain("buildAdmissionFullGateReview");
    expect(source).toContain("setGateFinalReview(null)");
    expect(source).toContain("applyAdmissionDecision(payload.decisionPoint);\n      setAdmissionCompletionReadback(payload.readback ?? null);");
    expect(source).toContain("gateFinalReview?.identity === admissionDraftIdentity");
    expect(source).not.toContain("admissionGatePolicy(");
  });
});
