import { requiresSkipReason } from "./severity-policy.js";
import type { RecordInput, RecordRow, WorldFile } from "./world-file.js";

export type PromptOutFlowKey = "creation" | "admission" | "propagation" | "contradiction" | "qa" | string;

export interface PromptTemplateRow {
  key: string;
  role_name: string;
  original_text: string;
  package_source: string;
  current_version: number;
  current_text: string;
}

export interface AdvisoryDispositionRow {
  id: number;
  advisory_record_id: number;
  disposition: string;
  note: string;
  standing_ruling: number;
  created_at: string;
}

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

const rowToPromptTemplate = (row: Record<string, unknown>): PromptTemplateRow => ({
  key: String(row.key),
  role_name: String(row.role_name),
  original_text: String(row.original_text),
  package_source: String(row.package_source),
  current_version: Number(row.current_version),
  current_text: String(row.current_text)
});

const rowToAdvisoryDisposition = (row: Record<string, unknown>): AdvisoryDispositionRow => ({
  id: Number(row.id),
  advisory_record_id: Number(row.advisory_record_id),
  disposition: String(row.disposition),
  note: String(row.note ?? ""),
  standing_ruling: Number(row.standing_ruling),
  created_at: String(row.created_at)
});

const promptTemplateRows = (world: WorldFile): PromptTemplateRow[] =>
  world.db.prepare(`
    SELECT pt.*, ptv.text AS current_text
    FROM prompt_templates pt
    JOIN prompt_template_versions ptv ON ptv.template_key = pt.key AND ptv.version = pt.current_version
    ORDER BY pt.key
  `).all().map((row) => rowToPromptTemplate(row as Record<string, unknown>));

const promptTemplateRow = (world: WorldFile, key: string): PromptTemplateRow => {
  const row = world.db.prepare(`
    SELECT pt.*, ptv.text AS current_text
    FROM prompt_templates pt
    JOIN prompt_template_versions ptv ON ptv.template_key = pt.key AND ptv.version = pt.current_version
    WHERE pt.key = ?
  `).get(key) as Record<string, unknown> | undefined;
  if (!row) throw new Error(`Prompt template not found: ${key}`);
  return rowToPromptTemplate(row);
};

const appendPromptTemplateVersion = (world: WorldFile, key: string, text: string): PromptTemplateRow => {
  const current = world.db.prepare("SELECT * FROM prompt_templates WHERE key = ?").get(key) as { current_version: number } | undefined;
  if (!current) throw new Error(`Prompt template not found: ${key}`);
  const nextVersion = current.current_version + 1;
  world.atomicWrite(() => {
    world.db.prepare("INSERT INTO prompt_template_versions (template_key, version, text) VALUES (?, ?, ?)").run(key, nextVersion, text);
    world.db.prepare("UPDATE prompt_templates SET current_version = ? WHERE key = ?").run(nextVersion, key);
  });
  return promptTemplateRow(world, key);
};

const promptRecordContext = (world: WorldFile, recordId: number): string => {
  const record = world.getRecord(recordId);
  const sections = world.listSections(recordId);
  return [
    `${record.shortId} ${record.title}`,
    `Type: ${record.recordTypeKey}`,
    `Truth layer: ${record.truthLayer ?? "unset"}`,
    `Canon status: ${record.canonStatus ?? "unset"}`,
    record.body,
    ...sections.map((section) => `## ${section.heading}\n${section.body}`)
  ].filter(Boolean).join("\n");
};

const standingRulingRows = (world: WorldFile): Array<{ disposition: string; note: string }> =>
  world.db.prepare("SELECT disposition, note FROM advisory_dispositions WHERE standing_ruling = 1 ORDER BY id")
    .all()
    .map((row) => {
      const values = row as Record<string, unknown>;
      return { disposition: String(values.disposition), note: String(values.note ?? "") };
    });

const insertAdvisoryDisposition = (
  world: WorldFile,
  advisoryRecordId: number,
  input: { disposition: string; note?: string; standingRuling?: boolean }
): AdvisoryDispositionRow => {
  world.getRecord(advisoryRecordId);
  world.assertVocabularyTerm("advisory_disposition", input.disposition);
  const result = world.db.prepare(`
    INSERT INTO advisory_dispositions (advisory_record_id, disposition, note, standing_ruling)
    VALUES (?, ?, ?, ?)
  `).run(advisoryRecordId, input.disposition, input.note ?? "", input.standingRuling ? 1 : 0);
  return rowToAdvisoryDisposition(world.db.prepare("SELECT * FROM advisory_dispositions WHERE id = ?").get(result.lastInsertRowid) as Record<string, unknown>);
};

export const listPromptTemplates = (world: WorldFile): PromptTemplateRow[] =>
  promptTemplateRows(world);

export const updatePromptTemplate = (world: WorldFile, key: string, text: string): PromptTemplateRow =>
  appendPromptTemplateVersion(world, key, text);

export const revertPromptTemplate = (world: WorldFile, key: string): PromptTemplateRow => {
  const template = promptTemplateRow(world, key);
  return appendPromptTemplateVersion(world, key, template.original_text);
};

export const generatePrompt = (world: WorldFile, input: PromptGenerationInput): PromptGenerationResult => {
  const template = promptTemplateRow(world, input.templateKey);
  const stepKey = input.stepKey ?? input.templateKey;
  const recordContext = input.recordId == null ? "No record context selected." : promptRecordContext(world, input.recordId);
  const rulings = standingRulingRows(world);

  return {
    prompt: [
      `Role framing (${template.role_name}): ask for pressure, not answers. The steward's material comes first; do not write final canon.`,
      `Default prompt derivation (${template.package_source}): ${template.current_text}`,
      "Vocabulary guardrail: label whether any suggestion touches truth layer, canon status, constraint tag, admission decision operation, repair operation, consequence mode, or preservation boundary. Do not blur those categories.",
      "Label assumptions instruction: separate direct consequences from speculative assumptions and mark unadmitted assumptions plainly.",
      `Standing rulings: ${rulings.length ? rulings.map((row) => `${row.disposition}: ${row.note}`).join("; ") : "none"}.`,
      ...contextLines({ flowKey: input.flowKey, flowId: input.flowId, stepKey }),
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

export const storeAdvisoryResponse = (world: WorldFile, input: AdvisoryResponseInput): RecordRow =>
  world.createRecord({
    recordTypeKey: "advisory_artifact",
    title: `Advisory artifact: ${input.stepKey}`,
    body: [...contextLines(input), `Prompt:`, input.promptText, `Response:`, input.responseText].join("\n\n"),
    truthLayer: "disputed claim",
    canonStatus: "proposed"
  });

export const disposeAdvisoryArtifact = (
  world: WorldFile,
  advisoryRecordId: number,
  input: { disposition: string; note?: string; standingRuling?: boolean }
): AdvisoryDispositionRow => {
  const advisory = world.getRecord(advisoryRecordId);
  if (advisory.recordTypeKey !== "advisory_artifact") {
    throw new Error("advisory disposition target must be an advisory artifact");
  }
  return insertAdvisoryDisposition(world, advisoryRecordId, input);
};

export const linkExplicitAdvisoryUse = (
  world: WorldFile,
  stewardAuthoredRecordId: number,
  advisoryRecordId: number,
  notes: { derivedFromNote: string; citationNote: string }
): void => {
  world.getRecord(stewardAuthoredRecordId);
  const advisory = world.getRecord(advisoryRecordId);
  if (advisory.recordTypeKey !== "advisory_artifact") {
    throw new Error(`Consulted advisory target must be an advisory artifact: ${advisoryRecordId}`);
  }
  world.createLinkIfMissing(stewardAuthoredRecordId, advisoryRecordId, "derived_from", notes.derivedFromNote);
  world.createLinkIfMissing(stewardAuthoredRecordId, advisoryRecordId, "cites_advisory_artifact", notes.citationNote);
};

export const createRecordWithExplicitAdvisoryUse = (
  world: WorldFile,
  input: RecordInput,
  advisoryRecordId?: number
): RecordRow =>
  world.atomicWrite(() => {
    const record = world.createRecord(input);
    if (advisoryRecordId != null) {
      linkExplicitAdvisoryUse(world, record.id, advisoryRecordId, {
        derivedFromNote: "Steward authored with advisory material on the table",
        citationNote: "Verbatim advisory artifact consulted"
      });
    }
    return record;
  });

export const recordPromptOutSkip = (world: WorldFile, input: PromptOutStepContext): RecordRow => {
  if (requiresSkipReason({ admissionLevel: input.admissionLevel ?? null, workScale: input.workScale ?? null }) && !input.reason?.trim()) {
    throw new Error("major prompt-out skips require a reason");
  }
  return world.createRecord({
    recordTypeKey: "skip_record",
    title: `Skip: ${input.stepKey}`,
    body: input.reason
      ? [...contextLines(input), `Reason: ${input.reason}`].join("\n")
      : [...contextLines(input), "Reason not collected below major-fact threshold."].join("\n"),
    truthLayer: "Objective canon",
    canonStatus: "proposed"
  });
};
