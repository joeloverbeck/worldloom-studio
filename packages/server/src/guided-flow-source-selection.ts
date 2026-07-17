import type {
  ConditionalPassKey,
  GuidedFlowSourceSelection,
  SourceSelectionRecordIdentity,
  SourceSelectionValidationState
} from "@worldloom/shared";
import type { RecordRow, WorldFile } from "./world-file.js";

export const SOURCE_SELECTION_CONTRACT = "Source-selected guided-flow run entry" as const;

export interface ResolveSourceSelectionInput {
  sourceType: string;
  recordId?: number;
  reportRecordId?: number;
  sectionHeading?: string;
  materialTitle?: string;
  materialBody?: string;
  conditionalPassObligationId?: number;
  propagationReportRecordId?: number;
}

export interface SourceSelectionFlowAdapter {
  storedRunForReport: (
    world: WorldFile,
    report: RecordRow
  ) => { flowId: number; sourceRecordId: number | null } | null;
  conditionalPassBindingForFact: (
    world: WorldFile,
    fact: RecordRow
  ) => { flowId: number; obligationId: number; propagationReportRecordId: number } | null;
}

interface FlowDefinition {
  passKey: ConditionalPassKey;
  destinationKey: string;
  label: string;
  allowedRecordTypes: Record<string, string[]>;
}

const PACKAGE_SOURCES = [
  "docs/worldbuilding-system/08_constraint_composition.md",
  "docs/worldbuilding-system/09_temporal_and_timeline_protocol.md",
  "docs/worldbuilding-system/12_institutional_economic_and_suppression_protocol.md"
];

const FLOW_DEFINITIONS: Record<ConditionalPassKey, FlowDefinition> = {
  temporal_timeline: {
    passKey: "temporal_timeline",
    destinationKey: "temporal",
    label: "Temporal/Timeline",
    allowedRecordTypes: {
      fact: ["canon_fact"],
      capability: ["capability"],
      canon_debt: ["canon_debt"],
      pass_report: ["pass_report"]
    }
  },
  constraint_composition: {
    passKey: "constraint_composition",
    destinationKey: "constraint",
    label: "Constraint Composition",
    allowedRecordTypes: {
      fact: ["canon_fact"],
      capability: ["capability"],
      constraint_card: ["constraint"],
      canon_debt: ["canon_debt"],
      record_section: ["canon_fact", "capability", "constraint", "canon_debt"],
      pass_report: ["pass_report"]
    }
  },
  institutional_economic_suppression: {
    passKey: "institutional_economic_suppression",
    destinationKey: "stage12",
    label: "Institutional / Economic / Suppression",
    allowedRecordTypes: {
      fact: ["canon_fact"],
      under_review_fact: ["canon_fact"],
      canon_debt: ["canon_debt"],
      record_section: ["canon_fact", "canon_debt"],
      pass_report: ["pass_report"]
    }
  }
};

const UNAVAILABLE_STANDINGS = new Set(["superseded", "deprecated", "rejected"]);

const identityFor = (record: RecordRow): SourceSelectionRecordIdentity => ({
  stableRecordId: record.id,
  shortId: record.shortId,
  title: record.title,
  recordTypeKey: record.recordTypeKey,
  canonStatus: record.canonStatus,
  truthLayer: record.truthLayer
});

const recordOrNull = (world: WorldFile, recordId: number): RecordRow | null => {
  try {
    return world.getRecord(recordId);
  } catch (error) {
    if (error instanceof Error && error.message === `Record not found: ${recordId}`) return null;
    throw error;
  }
};

const invalid = (
  definition: FlowDefinition,
  request: GuidedFlowSourceSelection["request"],
  state: Exclude<SourceSelectionValidationState, "resolved" | "resolving">,
  blocker: string,
  remediation: string,
  substanceRule: string,
  identity: SourceSelectionRecordIdentity | null = null
): GuidedFlowSourceSelection => ({
  contract: SOURCE_SELECTION_CONTRACT,
  destination: {
    passKey: definition.passKey,
    destinationKey: definition.destinationKey,
    label: definition.label,
    packageSources: [...PACKAGE_SOURCES]
  },
  request,
  validation: { state, valid: false, blocker, remediation, substanceRule },
  identity,
  selectedMaterial: null,
  binding: null,
  storedRunIdentity: null,
  doctrine: {
    selectedSource: "Resolve a current server-owned source before starting or resuming this guided flow.",
    validity: `The server checks whether the selected record type and standing can enter ${definition.label}.`,
    conditionalPassReason: null,
    stableIdentity: "The stable numeric record id preserves continuity; short ID and title remain human-readable context and never replace it as identity."
  },
  fieldClassifications: fieldClassificationsFor(request),
  orientation: {
    current: `${definition.label} source selection`,
    next: remediation,
    resume: "Return to the Workflow map or correct the preserved source selection.",
    safeReturnHref: "/api/workflow-map"
  },
  action: { startOrResumeAvailable: false }
});

const requestFor = (input: ResolveSourceSelectionInput): GuidedFlowSourceSelection["request"] => ({
  sourceType: input.sourceType,
  recordId: input.sourceType === "pass_report" ? input.reportRecordId ?? input.recordId ?? null : input.recordId ?? null,
  sectionHeading: input.sectionHeading?.trim() || null,
  materialTitle: input.materialTitle ?? "",
  materialBody: input.materialBody ?? ""
});

const fieldClassificationsFor = (
  request: GuidedFlowSourceSelection["request"],
  hasConditionalPassBinding = false
): GuidedFlowSourceSelection["fieldClassifications"] => ({
  required: request.sourceType === "material"
    ? ["selected-material title and body", "requested source type", "validation state"]
    : [
        "stable record id",
        "short ID",
        "title",
        "record type",
        "canon status",
        "requested source type",
        "validation state",
        ...(request.sourceType === "record_section" ? ["record-section heading"] : []),
        ...(hasConditionalPassBinding ? ["Conditional-pass obligation and final Propagation-report binding"] : [])
      ],
  optional: [],
  skippable: hasConditionalPassBinding ? ["governed Conditional-pass deferral with written rationale"] : [],
  severityDependent: []
});

const obligationBinding = (
  world: WorldFile,
  definition: FlowDefinition,
  input: ResolveSourceSelectionInput,
  source: RecordRow
): GuidedFlowSourceSelection["binding"] | GuidedFlowSourceSelection => {
  if (input.conditionalPassObligationId == null && input.propagationReportRecordId == null) return null;
  const request = requestFor(input);
  if (input.conditionalPassObligationId == null || input.propagationReportRecordId == null) {
    return invalid(
      definition,
      request,
      "mismatched_binding",
      "Conditional-pass entry requires one obligation and its final Propagation report together.",
      "Reload the Workflow map and use the complete server-returned source-selected route.",
      "The obligation, source fact, final Propagation report, and destination pass must identify one governed selection.",
      identityFor(source)
    );
  }
  const row = world.db.prepare(`
    SELECT obligation.*, record.id AS obligation_record_id
    FROM conditional_pass_obligations obligation
    JOIN records record ON record.id = obligation.record_id
    WHERE obligation.id = ?
  `).get(input.conditionalPassObligationId) as {
    id: number;
    record_id: number;
    source_fact_record_id: number;
    propagation_report_record_id: number;
    pass_key: string;
    disposition: string;
  } | undefined;
  if (!row) {
    return invalid(
      definition,
      request,
      "mismatched_binding",
      "The selected Conditional-pass obligation no longer exists.",
      "Reload the Workflow map and use the matching server-returned obligation, source fact, report, and destination.",
      "One Conditional-pass obligation may discharge work only for its own pass, source fact, and final Propagation report.",
      identityFor(source)
    );
  }
  const mismatch = row.pass_key !== definition.passKey
    ? "Conditional-pass destination pass key does not match the selected obligation."
    : row.source_fact_record_id !== source.id
      ? "Conditional-pass destination source fact does not match the selected obligation."
      : row.propagation_report_record_id !== input.propagationReportRecordId
        ? "Conditional-pass destination Propagation report does not match the selected obligation."
        : null;
  if (mismatch != null) {
    return invalid(
      definition,
      request,
      "mismatched_binding",
      mismatch,
      "Reload the Workflow map and use the matching server-returned obligation, source fact, report, and destination.",
      "One Conditional-pass obligation may discharge work only for its own pass, source fact, and final Propagation report.",
      identityFor(source)
    );
  }
  if (row.disposition !== "outstanding") {
    return invalid(
      definition,
      request,
      "stale_binding",
      `The Conditional-pass route is stale because the obligation is now ${row.disposition}.`,
      "Reload the Workflow map and follow the current server-returned disposition and route.",
      "Only an outstanding Conditional-pass obligation can start or resume its source-selected destination.",
      identityFor(source)
    );
  }
  const obligation = world.getRecord(row.record_id);
  const report = world.getRecord(row.propagation_report_record_id);
  return {
    valid: true,
    passKey: definition.passKey,
    passLabel: definition.label,
    obligation: identityFor(obligation),
    sourceFact: identityFor(source),
    propagationReport: identityFor(report),
    destinationKey: definition.destinationKey,
    disposition: "outstanding",
    doctrine: `${definition.label} is owed because ${source.shortId} has an outstanding Conditional-pass obligation from final Propagation report ${report.shortId}.`
  };
};

export const resolveGuidedFlowSourceSelection = (
  world: WorldFile,
  passKey: ConditionalPassKey,
  input: ResolveSourceSelectionInput,
  flowAdapter?: SourceSelectionFlowAdapter
): GuidedFlowSourceSelection => {
  const definition = FLOW_DEFINITIONS[passKey];
  const request = requestFor(input);
  if (input.sourceType === "material") {
    if (!request.materialTitle.trim() || !request.materialBody.trim()) {
      return invalid(
        definition,
        request,
        "empty",
        "Selected-material entry requires a title and body.",
        "Enter both selected-material fields before starting or resuming.",
        "Selected material keeps its author-entered title and body and does not acquire fabricated record identity."
      );
    }
    return {
      ...invalid(definition, request, "empty", "", "", ""),
      validation: {
        state: "resolved",
        valid: true,
        blocker: null,
        remediation: null,
        substanceRule: "Selected material requires a non-empty title and body; it remains non-record source material."
      },
      selectedMaterial: { title: request.materialTitle, body: request.materialBody },
      doctrine: {
        selectedSource: `Selected material: ${request.materialTitle}`,
        validity: `${definition.label} accepts selected material through its existing title/body path.`,
        conditionalPassReason: null,
        stableIdentity: "Selected material is not assigned a fabricated record id, canon status, or Conditional-pass binding."
      },
      fieldClassifications: fieldClassificationsFor(request),
      orientation: {
        current: `${definition.label} selected-material source resolved`,
        next: "Start or resume using this selected material.",
        resume: "Safe return reloads the Workflow map without fabricating record identity for this material.",
        safeReturnHref: "/api/workflow-map"
      },
      action: { startOrResumeAvailable: true }
    };
  }
  if (request.recordId == null || !Number.isInteger(request.recordId) || request.recordId <= 0) {
    return invalid(
      definition,
      request,
      "empty",
      "Record-backed entry requires a stable numeric record id.",
      `Enter a record id supported by ${definition.label}, or use selected material where available.`,
      "A record-backed source must resolve to a current server-owned record before start or resume."
    );
  }
  const record = recordOrNull(world, request.recordId);
  if (!record) {
    return invalid(
      definition,
      request,
      "missing",
      `No current record has stable id ${request.recordId}.`,
      "Correct the preserved record id or choose selected material where supported.",
      "The entered stable id must resolve to a current record in the open World file."
    );
  }
  const allowedTypes = definition.allowedRecordTypes[input.sourceType];
  if (!allowedTypes || !allowedTypes.includes(record.recordTypeKey)) {
    return invalid(
      definition,
      request,
      "incompatible_source_type",
      `${definition.label} source type ${input.sourceType} does not accept record type ${record.recordTypeKey}.`,
      `Use ${allowedTypes?.join(" or ") || "one of the flow's supported source modes"}, or change the preserved source type.`,
      "The requested source mode must match a record type already supported by the owning flow.",
      identityFor(record)
    );
  }
  if (record.canonStatus != null && UNAVAILABLE_STANDINGS.has(record.canonStatus)) {
    return invalid(
      definition,
      request,
      "unavailable_standing",
      `${record.shortId} has unavailable canon standing ${record.canonStatus}.`,
      "Choose a current non-terminal record or resolve its standing through the owning governance flow before retrying.",
      "Superseded, deprecated, and rejected records cannot become a new guided-flow source.",
      identityFor(record)
    );
  }
  const storedRun = input.sourceType === "pass_report"
    ? flowAdapter?.storedRunForReport(world, record) ?? null
    : null;
  if (input.sourceType === "pass_report" && storedRun == null) {
    return invalid(
      definition,
      request,
      "mismatched_binding",
      `${record.shortId} is not owned by an in-progress ${definition.label} run.`,
      `Choose a pass report owned by an in-progress ${definition.label} run, or resolve a supported source directly.`,
      "Pass-report resume must recover the report's stored run and authoritative source identity.",
      identityFor(record)
    );
  }
  if (input.sourceType === "record_section") {
    if (!request.sectionHeading) {
      return invalid(
        definition,
        request,
        "empty",
        "Record-section entry requires a section heading.",
        "Enter a section heading from the selected record before starting or resuming.",
        "The selected section heading must exist on the resolved record.",
        identityFor(record)
      );
    }
    if (!world.listSections(record.id).some((section) => section.heading === request.sectionHeading)) {
      return invalid(
        definition,
        request,
        "missing",
        `Section ${request.sectionHeading} does not exist on ${record.shortId}.`,
        "Correct the preserved section heading using a current section on the selected record.",
        "The selected section heading must exist on the resolved record.",
        identityFor(record)
      );
    }
  }
  const binding = obligationBinding(world, definition, input, record);
  if (binding && "contract" in binding) return binding;
  const existingRunBinding = input.sourceType === "fact" && binding != null
    ? flowAdapter?.conditionalPassBindingForFact(world, record) ?? null
    : null;
  if (existingRunBinding != null && (
    existingRunBinding.obligationId !== input.conditionalPassObligationId
    || existingRunBinding.propagationReportRecordId !== input.propagationReportRecordId
  )) {
    return invalid(
      definition,
      request,
      "stale_binding",
      `${record.shortId} already has an existing run bound to a different Conditional-pass obligation or Propagation report.`,
      "Resume the existing run from its original route on the Workflow map, or complete it before using this obligation.",
      "An in-progress guided-flow run keeps its original Conditional-pass obligation and final Propagation-report binding.",
      identityFor(record)
    );
  }
  const identity = identityFor(record);
  return {
    contract: SOURCE_SELECTION_CONTRACT,
    destination: {
      passKey: definition.passKey,
      destinationKey: definition.destinationKey,
      label: definition.label,
      packageSources: [...PACKAGE_SOURCES]
    },
    request,
    validation: {
      state: "resolved",
      valid: true,
      blocker: null,
      remediation: null,
      substanceRule: `The resolved ${record.recordTypeKey} is compatible with ${definition.label} source mode ${input.sourceType}.`
    },
    identity,
    selectedMaterial: null,
    binding,
    storedRunIdentity: storedRun?.sourceRecordId == null ? null : identityFor(world.getRecord(storedRun.sourceRecordId)),
    doctrine: {
      selectedSource: `${record.shortId} · ${record.title}`,
      validity: input.sourceType === "pass_report"
        ? `${record.shortId} is owned by in-progress ${definition.label} run ${storedRun!.flowId}; resume restores that run's stored source identity.`
        : `${record.recordTypeKey} with ${record.canonStatus ?? "unset"} standing is valid for ${definition.label} source mode ${input.sourceType}.`,
      conditionalPassReason: binding?.doctrine ?? null,
      stableIdentity: "The stable numeric record id preserves continuity; short ID and title remain human-readable context and never replace it as identity."
    },
    fieldClassifications: fieldClassificationsFor(request, binding != null),
    orientation: {
      current: `${definition.label} source selection resolved`,
      next: "Start or resume against this same authoritative stable identity.",
      resume: "An existing run resumes only with its stored source identity; safe return reloads the Workflow map.",
      safeReturnHref: "/api/workflow-map"
    },
    action: { startOrResumeAvailable: true }
  };
};

export const requireResolvedSourceSelection = (selection: GuidedFlowSourceSelection): GuidedFlowSourceSelection => {
  if (selection.validation.valid) return selection;
  throw Object.assign(new Error(selection.validation.blocker ?? "Source selection is not valid."), {
    remediation: selection.validation.remediation,
    authoritativeState: selection
  });
};
