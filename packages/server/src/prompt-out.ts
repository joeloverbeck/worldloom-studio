import { requiresSkipReason } from "./severity-policy.js";
import type { AdvisoryDispositionRow, PromptTemplateRow, RecordInput, RecordRow, WorldFile } from "./world-file.js";

export type PromptOutFlowKey = "creation" | "admission" | "propagation" | "contradiction" | "qa" | string;

export interface PromptOutStepContext {
  flowKey?: PromptOutFlowKey;
  flowId?: number;
  stepKey: string;
  admissionLevel?: string | null;
  workScale?: string | null;
  reason?: string;
}

export interface PromptGenerationInput {
  flowKey?: PromptOutFlowKey;
  flowId?: number;
  templateKey: string;
  recordId?: number;
  stepKey?: string;
}

export interface PromptGenerationResult {
  prompt: string;
  promptOut: {
    flowKey: PromptOutFlowKey | null;
    flowId: number | null;
    stepKey: string;
    templateKey: string;
    recordId: number | null;
  };
}

export interface AdvisoryResponseInput {
  flowKey?: PromptOutFlowKey;
  flowId?: number;
  stepKey: string;
  promptText: string;
  responseText: string;
}

const contextLines = (input: { flowKey?: PromptOutFlowKey; flowId?: number; stepKey: string }): string[] => [
  ...(input.flowKey ? [`Flow: ${input.flowKey}`] : []),
  ...(input.flowId == null ? [] : [`Flow id: ${input.flowId}`]),
  `Step: ${input.stepKey}`
];

export const listPromptTemplates = (worldFile: WorldFile): PromptTemplateRow[] =>
  worldFile.promptTemplateRows();

export const updatePromptTemplate = (worldFile: WorldFile, key: string, text: string): PromptTemplateRow =>
  worldFile.appendPromptTemplateVersion(key, text);

export const revertPromptTemplate = (worldFile: WorldFile, key: string): PromptTemplateRow => {
  const template = worldFile.promptTemplateRow(key);
  return worldFile.appendPromptTemplateVersion(key, template.original_text);
};

export const generatePrompt = (worldFile: WorldFile, input: PromptGenerationInput): PromptGenerationResult => {
  const template = worldFile.promptTemplateRow(input.templateKey);
  const stepKey = input.stepKey ?? input.templateKey;
  const recordContext = input.recordId == null ? "No record context selected." : worldFile.promptRecordContext(input.recordId);
  const rulings = worldFile.standingRulingRows();

  return {
    prompt: [
      `Role framing (${template.role_name}): ask for pressure, not answers. The steward's material comes first; do not write final canon.`,
      `Default prompt derivation (${template.package_source}): ${template.current_text}`,
      "Vocabulary guardrail: label whether any suggestion touches truth layer, canon status, constraint tag, admission decision operation, repair operation, consequence mode, or preservation boundary. Do not blur those categories.",
      "Label assumptions instruction: separate direct consequences from speculative assumptions and mark unadmitted assumptions plainly.",
      `Standing rulings: ${rulings.length ? rulings.map((row) => `${row.disposition}: ${row.note}`).join("; ") : "none"}.`,
      `Step: ${stepKey}`,
      "Record context:",
      recordContext
    ].join("\n\n"),
    promptOut: {
      flowKey: input.flowKey ?? null,
      flowId: input.flowId ?? null,
      stepKey,
      templateKey: input.templateKey,
      recordId: input.recordId ?? null
    }
  };
};

export const storeAdvisoryResponse = (worldFile: WorldFile, input: AdvisoryResponseInput): RecordRow =>
  worldFile.createRecord({
    recordTypeKey: "advisory_artifact",
    title: `Advisory artifact: ${input.stepKey}`,
    body: [...contextLines(input), `Prompt:`, input.promptText, `Response:`, input.responseText].join("\n\n"),
    truthLayer: "disputed claim",
    canonStatus: "proposed"
  });

export const disposeAdvisoryArtifact = (
  worldFile: WorldFile,
  advisoryRecordId: number,
  input: { disposition: string; note?: string; standingRuling?: boolean }
): AdvisoryDispositionRow => {
  const advisory = worldFile.getRecord(advisoryRecordId);
  if (advisory.recordTypeKey !== "advisory_artifact") {
    throw new Error("advisory disposition target must be an advisory artifact");
  }
  return worldFile.insertAdvisoryDisposition(advisoryRecordId, input);
};

export const linkExplicitAdvisoryUse = (
  worldFile: WorldFile,
  stewardAuthoredRecordId: number,
  advisoryRecordId: number,
  notes: { derivedFromNote: string; citationNote: string }
): void => {
  worldFile.getRecord(stewardAuthoredRecordId);
  const advisory = worldFile.getRecord(advisoryRecordId);
  if (advisory.recordTypeKey !== "advisory_artifact") {
    throw new Error(`Consulted advisory target must be an advisory artifact: ${advisoryRecordId}`);
  }
  worldFile.createLinkIfMissing(stewardAuthoredRecordId, advisoryRecordId, "derived_from", notes.derivedFromNote);
  worldFile.createLinkIfMissing(stewardAuthoredRecordId, advisoryRecordId, "cites_advisory_artifact", notes.citationNote);
};

export const createRecordWithExplicitAdvisoryUse = (
  worldFile: WorldFile,
  input: RecordInput,
  advisoryRecordId?: number
): RecordRow =>
  worldFile.atomicWrite(() => {
    const record = worldFile.createRecord(input);
    if (advisoryRecordId != null) {
      linkExplicitAdvisoryUse(worldFile, record.id, advisoryRecordId, {
        derivedFromNote: "Steward authored with advisory material on the table",
        citationNote: "Verbatim advisory artifact consulted"
      });
    }
    return record;
  });

export const recordPromptOutSkip = (worldFile: WorldFile, input: PromptOutStepContext): RecordRow => {
  if (requiresSkipReason({ admissionLevel: input.admissionLevel ?? null, workScale: input.workScale ?? null }) && !input.reason?.trim()) {
    throw new Error("major prompt-out skips require a reason");
  }
  return worldFile.createRecord({
    recordTypeKey: "skip_record",
    title: `Skip: ${input.stepKey}`,
    body: input.reason
      ? [...contextLines(input), `Reason: ${input.reason}`].join("\n")
      : [...contextLines(input), "Reason not collected below major-fact threshold."].join("\n"),
    truthLayer: "Objective canon",
    canonStatus: "proposed"
  });
};
