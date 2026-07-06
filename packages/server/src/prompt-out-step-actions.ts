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
  admissionLevel?: string;
  workScale?: string;
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
  mode: query("mode") === "proposal" ? "proposal" : "pressure",
  admissionLevel: query("admissionLevel"),
  workScale: query("workScale")
});

export const buildPromptOutStep = (world: WorldFile, input: PromptOutStepOfferInput): PromptOutStepDto => {
  const template = PromptOut.listPromptTemplates(world).find((row) => row.key === input.templateKey);
  if (!template) throw new Error(`Prompt template not found: ${input.templateKey}`);
  const mode = input.mode ?? "pressure";
  return {
    id: stepId(input),
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
      flowKey: input.flowKey ?? null,
      flowId: input.flowId ?? null,
      stepKey: input.stepKey
    },
    selectedRecord: selectedRecord(world, input.recordId),
    severity: {
      admissionLevel: input.admissionLevel ?? null,
      workScale: input.workScale ?? null
    },
    currentState: {
      promptText: null,
      advisoryRecordId: null,
      disposition: null
    },
    actions: {
      generate: { method: "POST", href: actionHref("generate", input) },
      storeAdvisory: { method: "POST", href: actionHref("store-advisory", input) },
      disposition: { method: "POST", href: actionHref("disposition", input) },
      skip: { method: "POST", href: actionHref("skip", input) }
    }
  };
};

export const runPromptOutGenerateAction = (world: WorldFile, input: PromptOutStepActionContext): PromptOut.PromptGenerationResult =>
  PromptOut.generatePrompt(world, {
    flowKey: input.flowKey,
    flowId: input.flowId,
    templateKey: input.templateKey ?? "",
    recordId: input.recordId,
    stepKey: input.stepKey,
    mode: input.mode
  });

export const runPromptOutStoreAdvisoryAction = (
  world: WorldFile,
  input: PromptOutStepActionContext,
  payload: PromptOutStoreAdvisoryBody
): { record: RecordRow } | ReturnType<typeof InstitutionalFlow.storeStage12Advisory> | ReturnType<typeof ConstraintFlow.storeConstraintAdvisory> | ReturnType<typeof TemporalFlow.storeTemporalAdvisory> => {
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
    return TemporalFlow.storeTemporalAdvisory(world, {
      flowId: input.flowId,
      stepKey: input.stepKey,
      mode: input.mode,
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
      promptText: payload.promptText,
      responseText: payload.responseText
    })
  };
};

export const runPromptOutDispositionAction = (
  world: WorldFile,
  payload: PromptOutDispositionBody
): { disposition: PromptOut.AdvisoryDispositionRow } => ({
  disposition: PromptOut.disposeAdvisoryArtifact(world, payload.advisoryRecordId, payload)
});

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
