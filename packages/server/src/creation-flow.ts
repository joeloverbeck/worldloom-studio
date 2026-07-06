import { parkCreationSeedForAdmission } from "./admission-flow.js";
import { creationHandoffContext, type CreationHandoffContext } from "./creation-handoff.js";
import { ADVISORY_OUTPUT_LABELS, promptMode, splitDisplayedContext, withPromptModeSummaries, type DecisionPointPromptMode, type DecisionPointSharedContract } from "./decision-point-contract.js";
import * as PromptOut from "./prompt-out.js";
import type { FlowInstanceRow, RecordRow, SectionRow, WorldFile } from "./world-file.js";

type AdmissionSeedInput = {
  title: string;
  body: string;
  truthLayer: string;
  canonStatus?: string;
  granularityConfirmed?: boolean;
};

type CreationFlowRow = FlowInstanceRow & {
  id: number;
  flow_key: string;
  current_step: string;
  state: string;
  kernel_record_id: number | null;
};

export interface CreationBlocker {
  key: string;
  label: string;
  message: string;
  requires: string;
}

interface CreationDecisionPayload {
  flow: {
    key: "creation";
    runState: string;
  };
  currentStep: string;
  localDecision: string;
  packageAuthority: {
    primary: string;
    why: string;
    citations: string[];
  };
  currentKernel: {
    id: number;
    shortId: string;
    title: string;
  } | null;
  sectionPrompts: Array<{
    heading: string;
    prompt: string;
    obligation: "required" | "optional" | "allowed-empty";
  }>;
  work: {
    required: string[];
    optional: string[];
    allowedEmpty: string[];
    skippable: string[];
  };
  blockers: CreationBlocker[];
  promptOut: {
    available: boolean;
    blocker: string | null;
    templateKey: "kernel_pressure" | "decomposition_pressure";
    stepKey: "creation:kernel_prompt" | "creation:decomposition_prompt";
    role: string;
    modes: DecisionPointPromptMode[];
    stepRequest: {
      method: "POST";
      href: "/api/prompt-out/steps";
      body: {
        flowKey: "creation";
        flowId: number;
        recordId: number;
        templateKey: "kernel_pressure" | "decomposition_pressure";
        stepKey: "creation:kernel_prompt" | "creation:decomposition_prompt";
        mode?: "proposal" | "pressure";
        label: string;
      };
    } | null;
    preview: {
      currentDecision: string;
      promptText: string;
      contextPreview: string;
      sourceManifest: string[];
      omissions: string[];
      advisoryCanonWarning: string;
    };
  };
  writeIntent: {
    willWrite: string[];
    willLink: string[];
    willQueue: string[];
    willRouteOnward: string[];
    willLeaveUntouched: string[];
  };
  nextOrResumeState: {
    currentStep: string;
    nextStep: string;
    safeExit: string;
  };
  readSideTrail: Array<{ label: string; href: string; recordId?: number }>;
  handoffs: string[];
  handoff: CreationHandoffContext;
  sharedContract: DecisionPointSharedContract;
}

export class CreationFlowBlockedError extends Error {
  decisionPoint: CreationDecisionPayload;

  constructor(message: string, decisionPoint: CreationDecisionPayload) {
    super(message);
    this.name = "CreationFlowBlockedError";
    this.decisionPoint = decisionPoint;
  }
}

const REQUIRED_KERNEL_SECTIONS = new Set([
  "World premise",
  "Starting scale",
  "Genre, tone, and consequence-mode commitments",
  "Foundational facts",
  "Primary pressures and initial domains"
]);

const OPTIONAL_KERNEL_SECTIONS = new Set([
  "Core promise",
  "Foundational constraints",
  "Initial mysteries and protected effects",
  "Ordinary-life promise"
]);

const SECTION_PROMPTS: Record<string, string> = {
  "World premise": "What is the world, in one or two sentences?",
  "Core promise": "What experience should the world reliably create?",
  "Starting scale": "Name where the world starts; scale expands only when a fact forces it.",
  "Genre, tone, and consequence-mode commitments": "Name genre, tone, primary consequence mode, secondary modes, tonal boundaries, and what the world must never become by accident.",
  "Foundational facts": "List the few seed facts everything else must answer to.",
  "Foundational constraints": "Name limits that keep the premise from becoming shapeless.",
  "Initial mysteries and protected effects": "Name what is intentionally unknown, sacred, terrifying, or protected from flattening.",
  "Primary pressures and initial domains": "Name three to seven forces that drive adaptation and the domains they touch first.",
  "Ordinary-life promise": "Name everyday residue and one ordinary-life anchor touched by the core pressures."
};

const flowRow = (row: FlowInstanceRow): CreationFlowRow => ({
  ...row,
  id: Number(row.id),
  flow_key: String(row.flow_key),
  current_step: String(row.current_step),
  state: String(row.state ?? "in_progress"),
  kernel_record_id: row.kernel_record_id == null ? null : Number(row.kernel_record_id)
});

const hasText = (value: string | null | undefined): boolean => Boolean(value?.trim());

const consequenceMode = (worldFile: WorldFile, kernelRecordId: number | null): string | null => {
  if (kernelRecordId == null) return null;
  return worldFile.listFacets(kernelRecordId).find((facet) => facet.vocabulary === "consequence_mode")?.term ?? null;
};

const sectionRows = (worldFile: WorldFile, kernelRecordId: number | null): SectionRow[] =>
  kernelRecordId == null ? [] : worldFile.listSections(kernelRecordId);

const kernelText = (sections: SectionRow[]): string =>
  sections.map((section) => `${section.heading}: ${section.body}`).filter((line) => /\S/.test(line)).join("\n");

const kernelMaterialPresent = (kernel: RecordRow | null, sections: SectionRow[]): boolean =>
  hasText(kernel?.body) || sections.some((section) => hasText(section.body));

const isWorldPremiseStep = (currentStep: string): boolean => currentStep === "kernel:World premise";

const sectionPrompts = (worldFile: WorldFile): CreationDecisionPayload["sectionPrompts"] =>
  worldFile.sectionHeadings("world_kernel").map((row) => {
    const heading = String((row as { heading: string }).heading);
    return {
      heading,
      prompt: SECTION_PROMPTS[heading] ?? "Use the world-kernel template and keep prose steward-authored.",
      obligation: REQUIRED_KERNEL_SECTIONS.has(heading)
        ? "required"
        : OPTIONAL_KERNEL_SECTIONS.has(heading)
          ? "allowed-empty"
          : "optional"
    };
  });

const trail = (kernel: RecordRow | null, report?: RecordRow, records: RecordRow[] = []): CreationDecisionPayload["readSideTrail"] => [
  { label: "Current Canon", href: "/api/canon-workbench/current" },
  { label: "Audit Trail", href: "/api/canon-workbench/audit" },
  ...(kernel ? [{ label: "Kernel record", href: `/api/canon-workbench/records/${kernel.id}`, recordId: kernel.id }] : []),
  ...(report ? [{ label: "Seed decomposition report", href: `/api/canon-workbench/records/${report.id}`, recordId: report.id }] : []),
  ...records.map((record) => ({ label: `Parked seed ${record.shortId}`, href: `/api/canon-workbench/records/${record.id}`, recordId: record.id })),
  { label: "Admission queue", href: "/api/admission/queue" }
];

export const creationDecisionPoint = (
  worldFile: WorldFile,
  flowInput: FlowInstanceRow,
  output: { report?: RecordRow; records?: RecordRow[] } = {}
): CreationDecisionPayload => {
  const flow = flowRow(flowInput);
  const kernel = flow.kernel_record_id == null ? null : worldFile.getRecord(flow.kernel_record_id);
  const sections = sectionRows(worldFile, flow.kernel_record_id);
  const mode = consequenceMode(worldFile, flow.kernel_record_id);
  const materialPresent = kernelMaterialPresent(kernel, sections);
  const currentStep = flow.current_step;
  const decompositionStep = currentStep.startsWith("decomposition");
  const handoff = creationHandoffContext(worldFile, kernel, output);
  const decompositionPromptReady = Boolean(handoff.seedDecompositionReport && handoff.parkedSeeds.length);
  const localDecision = decompositionStep
    ? "Split broad steward material into smaller seed facts that can be independently rejected."
    : "Define the world's first governing kernel or pressure seed.";
  const blockers: CreationBlocker[] = [];
  if (!materialPresent) {
    blockers.push({
      key: "kernel_material",
      label: "Kernel material",
      message: "Creation Prompt-out and seed decomposition wait for steward-authored kernel material.",
      requires: "steward-authored kernel material"
    });
  }
  if (!mode) {
    blockers.push({
      key: "consequence_mode",
      label: "Consequence mode",
      message: "Seed decomposition cannot proceed until the steward explicitly selects consequence mode.",
      requires: "explicit consequence mode"
    });
  }

  const templateKey = decompositionStep ? "decomposition_pressure" : "kernel_pressure";
  const stepKey = decompositionStep ? "creation:decomposition_prompt" : "creation:kernel_prompt";
  const role = decompositionStep ? "Prerequisite auditor" : "Consequence scout";
  const promptAvailable = decompositionStep ? decompositionPromptReady : materialPresent && kernel != null;
  const promptRecordId = decompositionStep ? handoff.seedDecompositionReport?.id : kernel?.id;
  const contextPreview = decompositionStep && decompositionPromptReady
    ? [
        handoff.seedDecompositionReport ? `Seed decomposition report ${handoff.seedDecompositionReport.shortId}: ${handoff.seedDecompositionReport.title}` : "",
        handoff.granularityRationale ? `Granularity rationale: ${handoff.granularityRationale}` : "",
        handoff.admissionIntent ? `Admission intent: ${handoff.admissionIntent}` : "",
        ...handoff.parkedSeeds.map((seed) => [
          `Parked seed ${seed.shortId}: ${seed.title}`,
          `Truth layer: ${seed.truthLayer ?? "unset"}`,
          `Canon status: ${seed.canonStatus ?? "unset"}`,
          seed.body
        ].filter(Boolean).join("\n")),
        handoff.supportingKernel ? `Supporting kernel ${handoff.supportingKernel.shortId}: ${handoff.supportingKernel.title}` : ""
      ].filter(Boolean).join("\n\n")
    : [
        kernel ? `${kernel.shortId} ${kernel.title}` : "No kernel record yet.",
        kernelText(sections)
      ].filter(Boolean).join("\n");
  const sourceManifest = decompositionStep && decompositionPromptReady
    ? [
        `Seed decomposition report: ${handoff.seedDecompositionReport?.shortId} ${handoff.seedDecompositionReport?.title}`,
        ...handoff.parkedSeeds.map((seed) => `Parked seed: ${seed.shortId} ${seed.title} (${seed.truthLayer ?? "unset"} / ${seed.canonStatus ?? "unset"})`),
        ...(handoff.supportingKernel ? [`Supporting kernel: ${handoff.supportingKernel.shortId} ${handoff.supportingKernel.title}`] : []),
        "Doctrine excerpt: Phase 2 granularity rule - split until each seed can be independently rejected without destroying its siblings.",
        "Doctrine excerpt: thin-start boundary - stop before facts become too small to owe consequences.",
        "Doctrine excerpt: Creation parks proposed seeds; Admission owns first canon standing.",
        "Omissions: Frontloaded seed audit and Admission gate results do not exist inside Creation."
      ]
    : [
        ...(kernel ? [`Record ${kernel.shortId}: ${kernel.title}`] : []),
        "Doctrine: docs/worldbuilding-system/05_creation_protocol.md Phase 1",
        "Doctrine: docs/worldbuilding-system/05_creation_protocol.md Phase 2",
        "Doctrine: docs/worldbuilding-system/templates/world_kernel.md",
        "Doctrine: docs/worldbuilding-system/20_ai_assisted_workflow.md",
        "Omissions: no Admission gate results exist inside Creation."
      ];
  const omissions = decompositionStep && decompositionPromptReady
    ? [
        "Frontloaded seed audit results omitted: Admission owns that instrument and no result exists yet.",
        "Admission gate results omitted: Admission has not selected severity or run a gate yet.",
        "Open canon debt omitted unless it directly affects this decomposition decision."
      ]
    : [
        ...(!materialPresent ? ["Current kernel material is absent until the steward writes it."] : []),
        "Frontloaded seed audit and first canon standing are omitted because Admission owns them."
      ];
  const pressureRequestBody = {
    flowKey: "creation",
    flowId: flow.id,
    recordId: promptRecordId ?? kernel?.id,
    templateKey,
    stepKey,
    mode: "pressure",
    label: role
  };
  const pressureStepRequest = promptAvailable && pressureRequestBody.recordId != null
    ? {
        method: "POST" as const,
        href: "/api/prompt-out/steps" as const,
        body: pressureRequestBody as {
          flowKey: "creation";
          flowId: number;
          recordId: number;
          templateKey: "kernel_pressure" | "decomposition_pressure";
          stepKey: "creation:kernel_prompt" | "creation:decomposition_prompt";
          mode: "pressure";
          label: string;
        }
      }
    : null;
  const proposalBlockedByEssence = !decompositionStep && isWorldPremiseStep(currentStep);
  const proposalAvailable = !proposalBlockedByEssence && promptRecordId != null;
  const proposalStepRequest = proposalAvailable
    ? {
        method: "POST" as const,
        href: "/api/prompt-out/steps" as const,
        body: {
          flowKey: "creation",
          flowId: flow.id,
          recordId: promptRecordId,
          templateKey,
          stepKey,
          mode: "proposal",
          label: "Proposal mode"
        }
      }
    : null;
  const modes: DecisionPointPromptMode[] = withPromptModeSummaries([
    promptMode({
      mode: "proposal",
      label: "Proposal mode",
      available: proposalAvailable,
      blocker: proposalAvailable
        ? null
        : proposalBlockedByEssence
          ? "Proposal prompts are refused for the world's essence; docs/worldbuilding-system/20_ai_assisted_workflow.md reserves the World premise to the steward."
          : "Proposal prompts need the server-owned decision context and current record before copy-out.",
      framing: "Request labeled candidates with alternatives and assumptions; adoption remains steward authorship.",
      role: "Decision proposal",
      templateKey,
      stepKey,
      outputLabels: ADVISORY_OUTPUT_LABELS,
      stepRequest: proposalStepRequest
    }),
    promptMode({
      mode: "pressure",
      label: "Pressure mode",
      available: promptAvailable,
      blocker: promptAvailable
        ? null
        : decompositionStep
          ? "Pressure prompts require a seed-decomposition report and parked seed records."
          : "Pressure prompts require steward-authored kernel material.",
      framing: "Ask for challenge, risks, alternatives, and questions on steward-authored material.",
      role,
      templateKey,
      stepKey,
      outputLabels: ADVISORY_OUTPUT_LABELS,
      stepRequest: pressureStepRequest
    })
  ]);
  const packageCitations = [
    "docs/worldbuilding-system/05_creation_protocol.md#phase-1-world-kernel",
    "docs/worldbuilding-system/05_creation_protocol.md#phase-2-seed-decomposition",
    "docs/worldbuilding-system/templates/world_kernel.md",
    "docs/worldbuilding-system/20_ai_assisted_workflow.md",
    "docs/specs/creation-flow.md",
    "docs/specs/prompt-out-context-assembly.md"
  ];
  const displayedContext = splitDisplayedContext(contextPreview);
  const sharedContract: DecisionPointSharedContract = {
    contractVersion: "decision-point/v1",
    flow: { key: "creation", runState: flow.state },
    step: {
      key: currentStep,
      localDecision,
      packageSource: "docs/worldbuilding-system/05_creation_protocol.md",
      why: decompositionStep
        ? "Phase 2 owns seed decomposition, granularity, and the boundary before Admission."
        : "Phase 1 owns the world kernel as a pressure seed, not an encyclopedia."
    },
    obligations: {
      required: [
        "Write steward-authored kernel material",
        "For decomposition, provide seed title, body, truth layer, and granularity confirmation"
      ],
      optional: [
        "Allowed-empty kernel sections may remain thin",
        "Creation Prompt-out advisory pressure after steward-authored material exists",
        "Admission intent note for future review"
      ],
      skippable: ["Prompt-out advisory pressure can be declined with a skip_record"],
      severityDependent: ["Explicitly select consequence mode before seed decomposition"]
    },
    doctrine: {
      slots: decompositionStep ? handoff.doctrineAtPointOfUse : ["05 Creation Protocol", "world-kernel template", "20 AI-assisted workflow"],
      packageSources: packageCitations
    },
    bearingContext: {
      displayed: displayedContext,
      sourceManifest,
      omissions
    },
    promptOut: {
      serverOwned: true,
      modes
    },
    blockers,
    substanceValidations: [
      "Seed decomposition requires at least one seed.",
      "Seed decomposition requires granularity rationale or confirmation.",
      "Seed title, body, and truth layer are steward-authored."
    ],
    writeIntent: {
      willWrite: [
        kernel ? "section update on one living world_kernel record" : "one living world_kernel record",
        "seed_decomposition report",
        "canon_fact records fixed at proposed"
      ],
      willLink: [
        kernel ? `kernel read-side trail for ${kernel.shortId}` : "read-side trail placeholders until records exist",
        "derived_from links from parked seeds to the kernel and decomposition report"
      ],
      willQueue: ["parked seeds appear in the Admission queue"],
      willRouteOnward: [
        "Seed decomposition after explicit consequence mode",
        "Seed decomposition once seed material, truth layer, consequence mode, and granularity confirmation are present",
        "Admission flow"
      ],
      willLeaveUntouched: [
        "canon standing is not admitted inside Creation",
        "truth layer remains steward-supplied judgment",
        "pasted advisory text does not alter kernel, seed, report, or proposal fields without explicit steward use"
      ]
    },
    nextOrResumeState: {
      currentStep,
      nextStep: mode && materialPresent ? "seed decomposition" : "continue kernel authoring",
      safeExit: "Safe exit leaves the Creation flow in progress and resumable from the same world file."
    },
    readSideTrail: trail(kernel, output.report ?? (handoff.seedDecompositionReport ? worldFile.getRecord(handoff.seedDecompositionReport.id) : undefined), output.records ?? handoff.parkedSeeds.map((seed) => worldFile.getRecord(seed.id)))
  };

  return {
    flow: {
      key: "creation",
      runState: flow.state
    },
    currentStep,
    localDecision,
    packageAuthority: {
      primary: "docs/worldbuilding-system/05_creation_protocol.md",
      why: decompositionStep
        ? "Phase 2 owns seed decomposition, granularity, and the boundary before Admission."
        : "Phase 1 owns the world kernel as a pressure seed, not an encyclopedia.",
      citations: [
        ...packageCitations
      ]
    },
    currentKernel: kernel ? { id: kernel.id, shortId: kernel.shortId, title: kernel.title } : null,
    sectionPrompts: sectionPrompts(worldFile),
    work: {
      required: [
        "Write steward-authored kernel material",
        "Explicitly select consequence mode before seed decomposition",
        "For decomposition, provide seed title, body, truth layer, and granularity confirmation"
      ],
      optional: [
        "Allowed-empty kernel sections may remain thin",
        "Creation Prompt-out advisory pressure after steward-authored material exists",
        "Admission intent note for future review"
      ],
      allowedEmpty: ["Core promise", "Foundational constraints", "Initial mysteries and protected effects", "Ordinary-life promise"],
      skippable: ["Prompt-out advisory pressure can be declined with a skip_record"]
    },
    blockers,
    promptOut: {
      available: promptAvailable,
      blocker: promptAvailable
        ? null
        : decompositionStep
          ? "Creation decomposition Prompt-out requires a seed-decomposition report and parked seed records."
          : "Creation Prompt-out requires steward-authored kernel material and a current kernel record.",
      templateKey,
      stepKey,
      role,
      modes,
      stepRequest: pressureStepRequest,
      preview: {
        currentDecision: localDecision,
        promptText: [
          `Role framing (${role}): ask for pressure, not answers.`,
          `Current decision: ${localDecision}`,
          contextPreview,
          ...(decompositionStep ? handoff.doctrineAtPointOfUse : ["Doctrine excerpts: 05 Creation Protocol, world-kernel template, and 20 AI-assisted workflow."]),
          "Advisory/canon warning: pasted responses remain advisory artifacts and never mutate canon fields automatically."
        ].filter(Boolean).join("\n\n"),
        contextPreview,
        sourceManifest,
        omissions,
        advisoryCanonWarning: "Prompt-out is optional advisory pressure. Pasted responses remain advisory artifacts and are not admitted canon."
      }
    },
    writeIntent: {
      willWrite: [
        kernel ? "section update on one living world_kernel record" : "one living world_kernel record",
        "seed_decomposition report",
        "canon_fact records fixed at proposed"
      ],
      willLink: [
        kernel ? `kernel read-side trail for ${kernel.shortId}` : "read-side trail placeholders until records exist",
        "derived_from links from parked seeds to the kernel and decomposition report"
      ],
      willQueue: ["parked seeds appear in the Admission queue"],
      willRouteOnward: [
        "Seed decomposition after explicit consequence mode",
        "Seed decomposition once seed material, truth layer, consequence mode, and granularity confirmation are present",
        "Admission flow"
      ],
      willLeaveUntouched: [
        "canon standing is not admitted inside Creation",
        "truth layer remains steward-supplied judgment",
        "pasted advisory text does not alter kernel, seed, report, or proposal fields without explicit steward use"
      ]
    },
    nextOrResumeState: {
      currentStep,
      nextStep: mode && materialPresent ? "seed decomposition" : "continue kernel authoring",
      safeExit: "Safe exit leaves the Creation flow in progress and resumable from the same world file."
    },
    readSideTrail: sharedContract.readSideTrail,
    handoffs: [
      "new-world navigation",
      "kernel decision surface",
      "Creation-bound Prompt-out",
      "seed decomposition surface",
      "browser evidence/coverage closeout"
    ],
    handoff,
    sharedContract
  };
};

export const startCreationFlow = (worldFile: WorldFile): FlowInstanceRow => {
  const row = worldFile.findLatestInProgressFlow("creation");
  if (row) return row;
  return worldFile.createFlowInstance({ flowKey: "creation", currentStep: "kernel:World premise" });
};

export const saveKernelStep = (
  worldFile: WorldFile,
  input: { flowId: number; heading: string; body: string; consequenceMode?: string }
): unknown =>
  worldFile.atomicWrite(() => {
    const flow = worldFile.getFlowInstance(input.flowId, "creation") as { kernel_record_id: number | null };
    const kernelId = flow.kernel_record_id ?? worldFile.createRecord({
      recordTypeKey: "world_kernel",
      title: "World kernel",
      body: "",
      truthLayer: "Objective canon",
      canonStatus: "proposed"
    }).id;
    if (!flow.kernel_record_id) {
      worldFile.updateFlowInstance(input.flowId, { kernelRecordId: kernelId });
    }
    const heading = worldFile.sectionHeadings("world_kernel").find((row) => String((row as { heading: string }).heading) === input.heading) as { position: number } | undefined;
    if (!heading) throw new Error(`Unknown kernel step: ${input.heading}`);
    worldFile.replaceSections(kernelId, [{ heading: input.heading, body: input.body, position: Number(heading.position) }]);
    if (input.consequenceMode) {
      const existing = worldFile.listFacets(kernelId).filter((facet) => facet.vocabulary === "consequence_mode");
      for (const facet of existing) worldFile.removeFacet(kernelId, facet.id);
      worldFile.addFacet(kernelId, { vocabulary: "consequence_mode", term: input.consequenceMode, position: 1 });
    }
    const updatedFlow = worldFile.updateFlowInstance(input.flowId, { currentStep: `kernel:${input.heading}` });
    return {
      flow: updatedFlow,
      kernel: worldFile.getRecord(kernelId),
      sections: worldFile.listSections(kernelId),
      facets: worldFile.listFacets(kernelId),
      decisionPoint: creationDecisionPoint(worldFile, updatedFlow)
    };
  });

export const recordCreationSkip = (
  worldFile: WorldFile,
  input: { flowId?: number; stepKey: string; admissionLevel?: string; workScale?: string; reason?: string }
): RecordRow => PromptOut.recordPromptOutSkip(worldFile, { flowKey: "creation", ...input });

export const decomposeSeeds = (
  worldFile: WorldFile,
  input: { flowId: number; kernelRecordId: number; draftIds?: number[]; seeds: AdmissionSeedInput[]; granularityRationale?: string; admissionIntent?: string }
): unknown => {
  const flowBefore = flowRow(worldFile.getFlowInstance(input.flowId, "creation"));
  const preflightDecision = creationDecisionPoint(worldFile, flowBefore);
  if (flowBefore.kernel_record_id == null) {
    throw new CreationFlowBlockedError("seed decomposition requires the active Creation flow kernel", preflightDecision);
  }
  if (flowBefore.kernel_record_id !== input.kernelRecordId) {
    throw new CreationFlowBlockedError("seed decomposition kernel must match the active Creation flow", preflightDecision);
  }
  const mode = consequenceMode(worldFile, flowBefore.kernel_record_id);
  if (!mode) {
    throw new CreationFlowBlockedError("seed decomposition requires explicit consequence mode", preflightDecision);
  }
  if (!input.seeds.length) {
    throw new CreationFlowBlockedError("seed decomposition requires at least one seed", preflightDecision);
  }
  if (!input.granularityRationale?.trim() && !input.seeds.every((seed) => seed.granularityConfirmed)) {
    throw new CreationFlowBlockedError("seed decomposition requires granularity rationale or confirmation", preflightDecision);
  }
  for (const seed of input.seeds) {
    if (!seed.title?.trim()) throw new CreationFlowBlockedError("seed decomposition requires seed title", preflightDecision);
    if (!seed.body?.trim()) throw new CreationFlowBlockedError("seed decomposition requires seed body", preflightDecision);
    if (!seed.truthLayer?.trim()) throw new CreationFlowBlockedError("seed decomposition requires truth layer", preflightDecision);
  }
  const kernel = worldFile.getRecord(flowBefore.kernel_record_id);
  const drafts = (input.draftIds ?? []).map((id) => worldFile.getDraft(id));
  return worldFile.atomicWrite(() => {
    const report = worldFile.createRecord({
      recordTypeKey: "seed_decomposition",
      title: "Seed decomposition",
      body: `Kernel ${kernel.shortId}; drafts consumed: ${drafts.map((draft) => draft.title).join(", ") || "none"}`,
      truthLayer: "Objective canon",
      canonStatus: "proposed"
    });
    worldFile.replaceSections(report.id, [
      { heading: "Kernel source", body: `${kernel.shortId} ${kernel.title}`, position: 1 },
      { heading: "Drafts consumed", body: drafts.map((draft) => `${draft.title}\n${draft.body}`).join("\n\n"), position: 2 },
      { heading: "Granularity decisions", body: input.granularityRationale?.trim() || "Each parked seed is independently rejectable without destroying its siblings.", position: 3 },
      { heading: "Parked seeds", body: input.seeds.map((seed) => seed.title).join("\n"), position: 4 },
      { heading: "Thin-start boundary", body: ["No seed is admitted by this flow; admission is deferred to the admission flow.", input.admissionIntent ? `Admission intent: ${input.admissionIntent}` : ""].filter(Boolean).join("\n"), position: 5 }
    ]);
    const records = input.seeds.map((seed) => parkCreationSeedForAdmission(worldFile, { ...seed, canonStatus: "proposed" }, kernel.id, report.id));
    for (const draft of drafts) worldFile.discardDraft(draft.id);
    const flow = worldFile.updateFlowInstance(input.flowId, { currentStep: "decomposition:complete", state: "complete" });
    return { report, records, flow, decisionPoint: creationDecisionPoint(worldFile, flow, { report, records }) };
  });
};
