import * as AdmissionFlow from "./admission-flow.js";
import * as ConstraintFlow from "./constraint-composition-flow.js";
import * as ContradictionFlow from "./contradiction-flow.js";
import * as CreationFlow from "./creation-flow.js";
import * as InstitutionalFlow from "./institutional-flow.js";
import * as MinimalViableWorld from "./minimal-viable-world.js";
import * as PromptOut from "./prompt-out.js";
import * as PropagationFlow from "./propagation-flow.js";
import * as QaFlow from "./qa-flow.js";
import * as TemporalFlow from "./temporal-flow.js";
import type { DecisionPointPromptModeSummary, PromptMode } from "./decision-point-contract.js";
import type { RecordRow, WorldFile } from "./world-file.js";

export interface PromptOutStepActionContext {
  flowKey?: string;
  flowId?: number;
  templateKey?: string;
  recordId?: number;
  stepKey: string;
  mode?: PromptMode;
  activeSetRevision?: number;
  selectedSectionHeading?: string | null;
  admissionLevel?: string;
  workScale?: string;
  admissionFullGateDraft?: PromptOut.AdmissionFullGateDraftPayload | null;
}

export interface PromptOutStepOfferInput extends PromptOutStepActionContext {
  templateKey: string;
  label?: string;
  availableModes?: DecisionPointPromptModeSummary[];
}

interface PromptOutStepAction {
  method: "POST";
  href: string;
}

export interface PromptOutStepDto {
  id: string;
  label: string;
  templateKey: string;
  mode: PromptMode;
  availableModes: DecisionPointPromptModeSummary[];
  context: {
    flowKey: string | null;
    flowId: number | null;
    stepKey: string;
  };
  selectedRecord: {
    id: number;
    shortId: string;
    title: string;
    recordTypeKey: string;
    truthLayer: string | null;
    canonStatus: string | null;
  } | null;
  severity: {
    admissionLevel: string | null;
    workScale: string | null;
  };
  packetIdentity: PromptOut.PromptPacketIdentity;
  currentState: {
    promptText: string | null;
    advisoryRecordId: number | null;
    disposition: string | null;
  };
  actions: {
    generate: PromptOutStepAction;
    storeAdvisory: PromptOutStepAction;
    disposition: PromptOutStepAction;
    skip: PromptOutStepAction;
  };
}

export interface PromptOutStoreAdvisoryBody {
  promptText: string;
  responseText: string;
}

export interface PromptOutDispositionBody {
  advisoryRecordId: number;
  disposition: string;
  note?: string;
  standingRuling?: boolean;
}

export interface PromptOutSkipBody {
  reason?: string;
  unresolved?: boolean;
  debtName?: string;
  existingDebtRecordId?: number;
  admissionLevel?: string;
  workScale?: string;
}

const actionBase = "/api/prompt-out/steps/actions";

const optionalNumber = (value?: string): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const actionHref = (action: "generate" | "store-advisory" | "disposition" | "skip", input: PromptOutStepActionContext & { templateKey?: string }): string => {
  const params = new URLSearchParams();
  const entries: Record<string, string | number | undefined> = {
    flowKey: input.flowKey,
    flowId: input.flowId,
    templateKey: input.templateKey,
    recordId: input.recordId,
    stepKey: input.stepKey,
    mode: input.mode,
    activeSetRevision: input.activeSetRevision,
    selectedSectionHeading: input.selectedSectionHeading ?? undefined,
    admissionLevel: input.admissionLevel,
    workScale: input.workScale
  };
  for (const [key, value] of Object.entries(entries)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const query = params.toString();
  return `${actionBase}/${action}${query ? `?${query}` : ""}`;
};

const stepId = (input: PromptOutStepActionContext): string =>
  [input.flowKey ?? "prompt-out", input.flowId, input.stepKey].filter((value) => value !== undefined && value !== null && value !== "").join(":");

const selectedRecord = (world: WorldFile, recordId?: number): PromptOutStepDto["selectedRecord"] => {
  if (recordId == null) return null;
  const record = world.getRecord(recordId);
  return {
    id: record.id,
    shortId: record.shortId,
    title: record.title,
    recordTypeKey: record.recordTypeKey,
    truthLayer: record.truthLayer,
    canonStatus: record.canonStatus
  };
};

export const promptOutActionContextFromQuery = (query: (key: string) => string | undefined): PromptOutStepActionContext => ({
  flowKey: query("flowKey"),
  flowId: optionalNumber(query("flowId")),
  templateKey: query("templateKey"),
  recordId: optionalNumber(query("recordId")),
  stepKey: query("stepKey") ?? "",
  mode: query("mode") === "proposal" ? "proposal" : query("mode") === "pressure" ? "pressure" : undefined,
  activeSetRevision: optionalNumber(query("activeSetRevision")),
  selectedSectionHeading: query("selectedSectionHeading"),
  admissionLevel: query("admissionLevel"),
  workScale: query("workScale")
});

export const buildPromptOutStep = (world: WorldFile, input: PromptOutStepOfferInput): PromptOutStepDto => {
  const template = PromptOut.listPromptTemplates(world).find((row) => row.key === input.templateKey);
  if (!template) throw new Error(`Prompt template not found: ${input.templateKey}`);
  if (input.flowKey === TemporalFlow.FLOW_KEY && input.mode == null) {
    throw new Error("Temporal Prompt-out requires an explicit Proposal or Pressure mode; omitted mode is never an implicit Pressure request");
  }
  const mode = input.mode ?? "pressure";
  const actionInput = input.flowKey === "propagation" && input.flowId != null
    ? { ...input, activeSetRevision: PropagationFlow.propagationActiveSet(world, input.flowId).revision }
    : input.flowKey === TemporalFlow.FLOW_KEY && input.flowId != null
      ? { ...input, activeSetRevision: PromptOut.temporalPacketRevision(world, input.flowId) }
      : input;
  return {
    id: stepId(actionInput),
    label: input.label?.trim() || template.role_name || input.stepKey,
    templateKey: input.templateKey,
    mode,
    availableModes: input.availableModes ?? [
      {
        mode: "proposal",
        label: "Proposal mode",
        framing: "Request labeled candidates with alternatives and assumptions; adoption remains steward authorship.",
        available: true,
        blocker: null
      },
      {
        mode: "pressure",
        label: "Pressure mode",
        framing: "Request challenge, risks, alternatives, and questions on steward-authored material.",
        available: true,
        blocker: null
      }
    ],
    context: {
      flowKey: actionInput.flowKey ?? null,
      flowId: actionInput.flowId ?? null,
      stepKey: actionInput.stepKey
    },
    selectedRecord: selectedRecord(world, input.recordId),
    severity: {
      admissionLevel: actionInput.admissionLevel ?? null,
      workScale: actionInput.workScale ?? null
    },
    packetIdentity: PromptOut.promptPacketIdentity(world, {
      flowKey: actionInput.flowKey,
      flowId: actionInput.flowId,
      templateKey: actionInput.templateKey,
      recordId: actionInput.recordId,
      stepKey: actionInput.stepKey,
      mode,
      activeSetRevision: actionInput.activeSetRevision,
      selectedSectionHeading: actionInput.selectedSectionHeading,
      admissionLevel: actionInput.admissionLevel,
      workScale: actionInput.workScale,
      admissionFullGateDraft: actionInput.admissionFullGateDraft
    }),
    currentState: {
      promptText: null,
      advisoryRecordId: null,
      disposition: null
    },
    actions: {
      generate: { method: "POST", href: actionHref("generate", actionInput) },
      storeAdvisory: { method: "POST", href: actionHref("store-advisory", actionInput) },
      disposition: { method: "POST", href: actionHref("disposition", actionInput) },
      skip: { method: "POST", href: actionHref("skip", actionInput) }
    }
  };
};

export const runPromptOutGenerateAction = (world: WorldFile, input: PromptOutStepActionContext): PromptOut.PromptGenerationResult => {
  if (input.flowKey === "propagation" && input.flowId != null) {
    PropagationFlow.assertPropagationPacketCurrent(world, input.flowId, input.activeSetRevision);
  }
  if (input.flowKey === TemporalFlow.FLOW_KEY && input.flowId != null) {
    PromptOut.assertTemporalPacketCurrent(world, input.flowId, input.activeSetRevision);
  }
  return PromptOut.generatePrompt(world, {
    flowKey: input.flowKey,
    flowId: input.flowId,
    templateKey: input.templateKey ?? "",
    recordId: input.recordId,
    stepKey: input.stepKey,
    mode: input.mode,
    activeSetRevision: input.activeSetRevision,
    selectedSectionHeading: input.selectedSectionHeading,
    admissionLevel: input.admissionLevel,
    workScale: input.workScale,
    admissionFullGateDraft: input.admissionFullGateDraft
  });
};

export const runPromptOutStoreAdvisoryAction = (
  world: WorldFile,
  input: PromptOutStepActionContext,
  payload: PromptOutStoreAdvisoryBody
): { record: RecordRow } | ReturnType<typeof InstitutionalFlow.storeStage12Advisory> | ReturnType<typeof ConstraintFlow.storeConstraintAdvisory> | ReturnType<typeof TemporalFlow.storeTemporalAdvisory> => {
  if (input.flowKey === "propagation" && input.flowId != null) {
    PropagationFlow.assertPropagationPacketCurrent(world, input.flowId, input.activeSetRevision);
    return world.atomicWrite(() => {
      const record = PromptOut.storeAdvisoryResponse(world, {
        flowKey: input.flowKey,
        flowId: input.flowId,
        stepKey: input.stepKey,
        mode: input.mode,
        activeSetRevision: input.activeSetRevision,
        promptText: payload.promptText,
        responseText: payload.responseText
      });
      if (input.mode === "pressure") PropagationFlow.markPropagationPressureUsed(world, input.flowId!, input.activeSetRevision);
      return { record };
    });
  }
  if (input.flowKey === InstitutionalFlow.FLOW_KEY) {
    if (input.flowId == null) throw new Error("Stage-12 Prompt-out actions require a flow id");
    return InstitutionalFlow.storeStage12Advisory(world, {
      flowId: input.flowId,
      stepKey: input.stepKey,
      promptText: payload.promptText,
      responseText: payload.responseText
    });
  }
  if (input.flowKey === ConstraintFlow.FLOW_KEY) {
    if (input.flowId == null) throw new Error("Constraint Composition Prompt-out actions require a flow id");
    return ConstraintFlow.storeConstraintAdvisory(world, {
      flowId: input.flowId,
      stepKey: input.stepKey,
      promptText: payload.promptText,
      responseText: payload.responseText
    });
  }
  if (input.flowKey === TemporalFlow.FLOW_KEY) {
    if (input.flowId == null) throw new Error("Temporal Prompt-out actions require a flow id");
    PromptOut.assertTemporalPacketCurrent(world, input.flowId, input.activeSetRevision);
    return TemporalFlow.storeTemporalAdvisory(world, {
      flowId: input.flowId,
      stepKey: input.stepKey,
      mode: input.mode,
      activeSetRevision: input.activeSetRevision,
      promptText: payload.promptText,
      responseText: payload.responseText
    });
  }
  return {
    record: PromptOut.storeAdvisoryResponse(world, {
      flowKey: input.flowKey,
      flowId: input.flowId,
      stepKey: input.stepKey,
      mode: input.mode,
      activeSetRevision: input.activeSetRevision,
      promptText: payload.promptText,
      responseText: payload.responseText
    })
  };
};

export const runPromptOutDispositionAction = (
  world: WorldFile,
  input: PromptOutStepActionContext,
  payload: PromptOutDispositionBody
): { disposition: PromptOut.AdvisoryDispositionRow } => {
  if (input.flowKey === "propagation" && input.flowId != null) {
    PropagationFlow.assertPropagationPacketCurrent(world, input.flowId, input.activeSetRevision);
  }
  if (input.flowKey === TemporalFlow.FLOW_KEY && input.flowId != null) {
    PromptOut.assertTemporalAdvisoryDispositionPacket(world, payload.advisoryRecordId, input.flowId, input.activeSetRevision);
  }
  return { disposition: PromptOut.disposeAdvisoryArtifact(world, payload.advisoryRecordId, payload) };
};

type SkipHandler = (world: WorldFile, input: PromptOutStepActionContext, payload: PromptOutSkipBody) => unknown;

const skipHandlers: Record<string, SkipHandler> = {
  creation: (world, input, payload) => ({
    ...(input.stepKey.startsWith("minimal_viable_world:")
      ? MinimalViableWorld.skipPromptOut(world, { ...input, ...payload, stepKey: input.stepKey })
      : { record: CreationFlow.recordCreationSkip(world, { ...input, ...payload, stepKey: input.stepKey }) })
  }),
  admission: (world, input, payload) => ({
    record: AdmissionFlow.declineAdmissionInstrument(world, { ...input, ...payload, stepKey: input.stepKey })
  }),
  propagation: (world, input, payload) => ({
    record: PropagationFlow.skipPropagationStep(world, { ...input, ...payload, stepKey: input.stepKey })
  }),
  contradiction: (world, input, payload) => ({
    record: ContradictionFlow.skipContradictionStep(world, { ...input, ...payload, stepKey: input.stepKey })
  }),
  qa: (world, input, payload) => ({
    record: QaFlow.skipQaStep(world, { ...input, ...payload, stepKey: input.stepKey })
  }),
  [InstitutionalFlow.FLOW_KEY]: (world, input, payload) => {
    if (input.flowId == null) throw new Error("Stage-12 Prompt-out skip actions require a flow id");
    return InstitutionalFlow.skipStage12Step(world, {
      ...input,
      ...payload,
      flowId: input.flowId,
      stepKey: input.stepKey
    });
  },
  [ConstraintFlow.FLOW_KEY]: (world, input, payload) => {
    if (input.flowId == null) throw new Error("Constraint Composition Prompt-out skip actions require a flow id");
    return ConstraintFlow.skipConstraintStep(world, {
      ...input,
      ...payload,
      flowId: input.flowId,
      stepKey: input.stepKey
    });
  },
  [TemporalFlow.FLOW_KEY]: (world, input, payload) => {
    if (input.flowId == null) throw new Error("Temporal Prompt-out skip actions require a flow id");
    return TemporalFlow.skipTemporalStep(world, {
      ...input,
      ...payload,
      flowId: input.flowId,
      stepKey: input.stepKey
    });
  }
};

export const runPromptOutSkipAction = (
  world: WorldFile,
  input: PromptOutStepActionContext,
  payload: PromptOutSkipBody = {}
): unknown => {
  if (input.flowKey === TemporalFlow.FLOW_KEY && input.flowId != null) {
    PromptOut.assertTemporalPacketCurrent(world, input.flowId, input.activeSetRevision);
  }
  const handler = input.flowKey ? skipHandlers[input.flowKey] : undefined;
  const mergedInput = {
    ...input,
    admissionLevel: payload.admissionLevel ?? input.admissionLevel,
    workScale: payload.workScale ?? input.workScale
  };
  if (handler) return handler(world, mergedInput, payload);
  return {
    record: PromptOut.recordPromptOutSkip(world, {
      flowKey: input.flowKey,
      flowId: input.flowId,
      stepKey: input.stepKey,
      admissionLevel: mergedInput.admissionLevel,
      workScale: mergedInput.workScale,
      reason: payload.reason
    })
  };
};
