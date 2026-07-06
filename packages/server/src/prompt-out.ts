import { requiresSkipReason } from "./severity-policy.js";
import { resolveCreationDecompositionHandoff } from "./creation-handoff.js";
import { methodCard, methodCardDoctrineSlots, methodCardSourceManifest, maybeMethodCard } from "./method-cards.js";
import type { PromptMode } from "./decision-point-contract.js";
import type { MethodCard } from "@worldloom/shared";
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

const BUILT_IN_PROMPT_TEMPLATES: PromptTemplateRow[] = [
  {
    key: "minimal_viable_world_checkpoint",
    role_name: "Minimal Viable World checkpoint analyst",
    original_text: "Work from admitted seed facts and checkpoint dispositions. In proposal mode, offer labeled candidate ordinary-life residues, adapted institutions or customs, factional disagreements or mode-equivalent pressures, path-dependence residues, mystery-boundary wording, aesthetic residue, pressure lines, and follow-up debt phrasing. In pressure mode, challenge existing evidence for backdrop-shaped gaps. Do not assign canon standing, truth layer, status, or final viability.",
    package_source: "docs/worldbuilding-system/20_ai_assisted_workflow.md",
    current_version: 1,
    current_text: "Work from admitted seed facts and checkpoint dispositions. In proposal mode, offer labeled candidate ordinary-life residues, adapted institutions or customs, factional disagreements or mode-equivalent pressures, path-dependence residues, mystery-boundary wording, aesthetic residue, pressure lines, and follow-up debt phrasing. In pressure mode, challenge existing evidence for backdrop-shaped gaps. Do not assign canon standing, truth layer, status, or final viability."
  }
];

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
  mode?: PromptMode;
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
  mode?: PromptMode;
}

export interface PromptGenerationResult {
  prompt: string;
  promptOut: {
    flowKey: PromptOutFlowKey | null;
    flowId: number | null;
    stepKey: string;
    mode: PromptMode;
    templateKey: string;
    recordId: number | null;
  };
}

export interface AdvisoryResponseInput {
  flowKey?: PromptOutFlowKey;
  flowId?: number;
  stepKey: string;
  mode?: PromptMode;
  promptText: string;
  responseText: string;
}

const contextLines = (input: { flowKey?: PromptOutFlowKey; flowId?: number; stepKey: string }): string[] => [
  ...(input.flowKey ? [`Flow: ${input.flowKey}`] : []),
  ...(input.flowId == null ? [] : [`Flow id: ${input.flowId}`]),
  `Step: ${input.stepKey}`
];

const modeLine = (mode?: PromptMode): string[] => mode ? [`Mode: ${mode}`] : [];

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

const promptTemplateRows = (world: WorldFile): PromptTemplateRow[] => {
  const rows = world.db.prepare(`
    SELECT pt.*, ptv.text AS current_text
    FROM prompt_templates pt
    JOIN prompt_template_versions ptv ON ptv.template_key = pt.key AND ptv.version = pt.current_version
    ORDER BY pt.key
  `).all().map((row) => rowToPromptTemplate(row as Record<string, unknown>));
  const existing = new Set(rows.map((row) => row.key));
  return [...rows, ...BUILT_IN_PROMPT_TEMPLATES.filter((row) => !existing.has(row.key))];
};

const promptTemplateRow = (world: WorldFile, key: string): PromptTemplateRow => {
  const row = world.db.prepare(`
    SELECT pt.*, ptv.text AS current_text
    FROM prompt_templates pt
    JOIN prompt_template_versions ptv ON ptv.template_key = pt.key AND ptv.version = pt.current_version
    WHERE pt.key = ?
  `).get(key) as Record<string, unknown> | undefined;
  if (!row) {
    const builtIn = BUILT_IN_PROMPT_TEMPLATES.find((template) => template.key === key);
    if (builtIn) return builtIn;
    throw new Error(`Prompt template not found: ${key}`);
  }
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
    ...sections.map((section) => `## ${section.heading}\n${section.body}\n${section.heading}: ${section.body}`)
  ].filter(Boolean).join("\n");
};

const standingRulingRows = (world: WorldFile): Array<{ disposition: string; note: string }> =>
  world.db.prepare("SELECT disposition, note FROM advisory_dispositions WHERE standing_ruling = 1 ORDER BY id")
    .all()
    .map((row) => {
      const values = row as Record<string, unknown>;
      return { disposition: String(values.disposition), note: String(values.note ?? "") };
    });

const promptMethodCard = (input: PromptGenerationInput): MethodCard | null => {
  if (input.flowKey === "creation") {
    if (input.templateKey === "minimal_viable_world_checkpoint") return methodCard("creation.minimal-viable-world");
    return methodCard(input.templateKey === "decomposition_pressure" ? "creation.seed-decomposition" : "creation.kernel");
  }
  if (input.flowKey === "admission") {
    return methodCard(input.templateKey === "admission_prerequisite_audit" ? "admission.minor-ledger" : "admission.full-gate");
  }
  if (input.flowKey === "constraint_composition") {
    const stepKey = input.stepKey ?? "";
    if (stepKey.includes("skip") || stepKey.includes("prompt") || stepKey.includes("advisory")) return methodCard("constraint.prompt-out-skips");
    return methodCard("constraint.outcomes");
  }
  if (input.flowKey === "temporal_timeline") {
    const stepKey = input.stepKey ?? "";
    if (stepKey.includes("date") || stepKey.includes("granularity")) return methodCard("temporal.date-type-granularity");
    if (stepKey.includes("latency") || stepKey.includes("residue")) return methodCard("temporal.latency-residue");
    if (stepKey.includes("sequence") || stepKey.includes("retrospective")) return methodCard("temporal.sequence-retrospective");
    if (stepKey.includes("mystery") || stepKey.includes("branch")) return methodCard("temporal.mystery-boundaries");
    if (stepKey.includes("skip") || stepKey.includes("prompt") || stepKey.includes("advisory")) return methodCard("temporal.prompt-out-skips");
    return methodCard("temporal.outcomes");
  }
  if (input.flowKey === "institutional_economic_suppression") return methodCard("stage12.outcomes");
  if (input.flowKey === "propagation") return methodCard("propagation.disposition");
  if (input.flowKey === "contradiction") return methodCard(input.templateKey === "boundary_guard" ? "contradiction.mystery-preservation" : "contradiction.repair");
  if (input.flowKey === "qa") return methodCard(input.templateKey === "qa_red_team" ? "qa.repair-routing" : "qa.scorecard");
  return maybeMethodCard(`${input.flowKey ?? ""}.${input.stepKey ?? input.templateKey}`);
};

const temporalReportIdFromStep = (step: string): number | null => {
  const match = step.match(/^temporal:report:(\d+):/);
  return match ? Number(match[1]) : null;
};

const temporalPromptContext = (world: WorldFile, input: PromptGenerationInput): { lines: string[]; sourceManifest: string[] } => {
  if (input.flowKey !== "temporal_timeline" || input.flowId == null) return { lines: [], sourceManifest: [] };
  const flow = world.getFlowInstance(input.flowId, "temporal_timeline");
  const reportId = temporalReportIdFromStep(String(flow.current_step));
  if (reportId == null) return { lines: ["Temporal pass report omitted: flow current step does not name a report."], sourceManifest: ["Omission: Temporal pass report not found in current step"] };
  const report = world.getRecord(reportId);
  const sections = world.listSections(report.id);
  return {
    lines: [
      `Temporal pass report: ${report.shortId} ${report.title}`,
      report.body,
      ...sections.map((section) => `### ${section.heading}\n${section.body}`)
    ],
    sourceManifest: [
      `Temporal pass report: ${report.shortId} ${report.title}`,
      ...sections.map((section) => `Temporal report section: ${section.heading}`)
    ]
  };
};

const creationDecompositionPrompt = (
  world: WorldFile,
  input: PromptGenerationInput,
  template: PromptTemplateRow,
  stepKey: string
): PromptGenerationResult => {
  const handoff = resolveCreationDecompositionHandoff(world, input.recordId);
  const cardValue = methodCard("creation.seed-decomposition");
  const rulings = standingRulingRows(world);
  const report = handoff.seedDecompositionReport;
  if (!report) throw new Error("decomposition prompt requires a seed-decomposition report and parked seeds");
  const reportSections = handoff.reportSections.map((section) => `### ${section.heading}\n${section.body || "(empty)"}`).join("\n\n");
  const seedContext = handoff.parkedSeeds.map((seed) => [
    `Seed ${seed.shortId}: ${seed.title}`,
    `Truth layer: ${seed.truthLayer ?? "unset"}`,
    `Canon status: ${seed.canonStatus ?? "unset"}`,
    `Body: ${seed.body}`,
    `Derived-from links: ${seed.sourceLinks.map((link) => `${link.shortId} ${link.title} (${link.note})`).join("; ")}`
  ].join("\n")).join("\n\n");
  const kernelContext = handoff.supportingKernel
    ? [
        `Supporting kernel context: ${handoff.supportingKernel.shortId} ${handoff.supportingKernel.title}`,
        handoff.supportingKernel.body,
        ...handoff.kernelSections.map((section) => `${section.heading}: ${section.body}`)
      ].filter(Boolean).join("\n")
    : "Supporting kernel context: omitted because no linked kernel was found.";
  const omissions = [
    "Frontloaded seed audit results omitted: Admission owns that instrument and no result exists yet.",
    "Admission gate results omitted: Admission has not selected severity or run a gate yet.",
    "Standing rulings omitted when none exist.",
    "Open canon debt omitted unless it affects the decomposition decision."
  ];
  const sourceManifest = [
    `Source record: seed-decomposition report ${report.shortId} ${report.title}`,
    ...handoff.parkedSeeds.map((seed) => `Source record: parked seed ${seed.shortId} ${seed.title}`),
    ...(handoff.supportingKernel ? [`Source record: supporting kernel ${handoff.supportingKernel.shortId} ${handoff.supportingKernel.title}`] : []),
    `Prompt template: ${template.key} (${template.package_source})`,
    ...methodCardSourceManifest(cardValue),
    ...omissions.map((omission) => `Omission: ${omission}`)
  ];

  return {
    prompt: [
      `Role framing (${template.role_name}): ask for pressure, not answers. The steward's material comes first; do not write final canon.`,
      `Default prompt derivation: ${template.current_text}`,
      `Current decision context: flow ${input.flowKey ?? "unspecified"}, step ${stepKey}.`,
      "Steward material under pressure:",
      `Seed decomposition report ${report.shortId}: ${report.title}`,
      report.body,
      reportSections,
      "Parked seeds:",
      seedContext,
      `Granularity rationale: ${handoff.granularityRationale ?? "Each parked seed is independently rejectable without destroying its siblings."}`,
      ...(handoff.admissionIntent ? [`Admission intent: ${handoff.admissionIntent}`] : []),
      kernelContext,
      "Method card at point of use:",
      ...methodCardDoctrineSlots(cardValue),
      "Forbidden moves: do not author final canon, do not admit canon inside Creation, do not flatten truth layer or canon status, and do not invent hidden world facts without labeling them as assumptions.",
      "Vocabulary guardrail: label whether any suggestion touches truth layer, canon status, constraint tag, admission decision operation, repair operation, consequence mode, or preservation boundary. Do not blur those categories.",
      "Output labels: bundled seed, missing prerequisite, admission concern, risk, alternative, question, standing-ruling candidate, irrelevant omission.",
      "Requested analyst role: Prerequisite auditor. Provide pressure, risks, alternatives, and questions that help the steward decide whether the decomposition is ready for Admission.",
      `Standing rulings: ${rulings.length ? rulings.map((row) => `${row.disposition}: ${row.note}`).join("; ") : "none"}.`,
      ...contextLines({ flowKey: input.flowKey, flowId: input.flowId, stepKey }),
      "Source manifest:",
      sourceManifest.join("\n"),
      "Omissions:",
      omissions.join("\n"),
      "Advisory/canon warning: this prompt asks for optional pressure only. Pasted responses stay advisory artifacts until the steward authors and admits canon through the governed flow."
    ].join("\n\n"),
    promptOut: {
      flowKey: input.flowKey ?? null,
      flowId: input.flowId ?? null,
      stepKey,
      mode: "pressure",
      templateKey: input.templateKey,
      recordId: report.id
    }
  };
};

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
  const mode: PromptMode = input.mode ?? "pressure";
  if (mode === "pressure" && input.flowKey === "creation" && input.templateKey === "decomposition_pressure") {
    return creationDecompositionPrompt(world, input, template, stepKey);
  }
  const recordContext = input.recordId == null ? "No record context selected." : promptRecordContext(world, input.recordId);
  const rulings = standingRulingRows(world);
  const cardValue = promptMethodCard(input);
  const doctrineLines = cardValue ? methodCardDoctrineSlots(cardValue) : [];
  const flowContext = temporalPromptContext(world, input);
  const sourceManifest = [
    `Prompt template: ${template.key} (${template.package_source})`,
    ...(cardValue ? methodCardSourceManifest(cardValue) : []),
    ...flowContext.sourceManifest,
    input.recordId == null ? "Selected record: none" : `Selected record id: ${input.recordId}`,
    `Standing rulings: ${rulings.length}`,
    "Omissions: no hidden repository context; unavailable world context must be named before copy-out."
  ].join("\n");

  return {
    prompt: [
      mode === "proposal"
        ? `Proposal mode (${template.role_name}): ask for labeled candidate material with alternatives and assumptions. The response may recommend, never assign canon standing or separated labels.`
        : `Role framing (${template.role_name}): ask for pressure, not answers. The steward's material comes first; do not write final canon.`,
      `Default prompt derivation: ${template.current_text}`,
      `Current decision context: flow ${input.flowKey ?? "unspecified"}, step ${stepKey}.`,
      mode === "proposal"
        ? "Proposal mode output discipline: return labeled candidates, alternatives, assumptions, risks, and questions; forbid canon-standing assignments, truth-layer assignments, status assignments, or unlabeled invented facts."
        : "Pressure mode output discipline: provide pressure, risks, alternatives, and questions; do not author final canon.",
      ...doctrineLines,
      "Vocabulary guardrail: label whether any suggestion touches truth layer, canon status, constraint tag, admission decision operation, repair operation, consequence mode, or preservation boundary. Do not blur those categories.",
      "Label assumptions instruction: separate direct consequences from speculative assumptions and mark unadmitted assumptions plainly.",
      "Output labels: selected, deleted, challenged, ignored, standing ruling, adopted with steward revision, rejected.",
      `Standing rulings: ${rulings.length ? rulings.map((row) => `${row.disposition}: ${row.note}`).join("; ") : "none"}.`,
      ...modeLine(mode),
      ...contextLines({ flowKey: input.flowKey, flowId: input.flowId, stepKey }),
      `Step: ${stepKey}`,
      "Source manifest:",
      sourceManifest,
      "Context preview:",
      ...(flowContext.lines.length ? ["Flow context:", flowContext.lines.join("\n\n")] : []),
      "Record context:",
      recordContext,
      "Advisory/canon warning: this prompt asks for optional pressure only. Pasted responses stay advisory artifacts until the steward authors and admits canon through the governed flow."
    ].join("\n\n"),
    promptOut: {
      flowKey: input.flowKey ?? null,
      flowId: input.flowId ?? null,
      stepKey,
      mode,
      templateKey: input.templateKey,
      recordId: input.recordId ?? null
    }
  };
};

export const storeAdvisoryResponse = (world: WorldFile, input: AdvisoryResponseInput): RecordRow =>
  world.createRecord({
    recordTypeKey: "advisory_artifact",
    title: `Advisory artifact: ${input.stepKey}`,
    body: [...contextLines(input), ...modeLine(input.mode), `Prompt:`, input.promptText, `Response:`, input.responseText].join("\n\n"),
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
