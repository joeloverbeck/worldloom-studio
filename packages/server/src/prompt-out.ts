import { requiresSkipReason } from "./severity-policy.js";
import { resolveCreationDecompositionHandoff } from "./creation-handoff.js";
import { methodCard, methodCardDoctrineSlots, methodCardSourceManifest, maybeMethodCard } from "./method-cards.js";
import { PROMPT_TEMPLATE_SEEDS } from "./prompt-out-defaults.js";
import type { PromptMode } from "./decision-point-contract.js";
import type { MethodCard } from "@worldloom/shared";
import type { RecordInput, RecordRow, WorldFile } from "./world-file.js";
import { createHash } from "node:crypto";

export type PromptOutFlowKey = "creation" | "admission" | "propagation" | "contradiction" | "qa" | string;

export interface PromptTemplateRow {
  key: string;
  role_name: string;
  original_text: string;
  package_source: string;
  current_version: number;
  current_text: string;
}

const BUILT_IN_PROMPT_TEMPLATES: PromptTemplateRow[] = PROMPT_TEMPLATE_SEEDS.map((template) => ({
  key: template.key,
  role_name: template.roleName,
  original_text: template.text,
  package_source: template.packageSource,
  current_version: 1,
  current_text: template.text
}));

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
  selectedSectionHeading?: string | null;
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
  selectedSectionHeading?: string | null;
  admissionLevel?: string | null;
  workScale?: string | null;
}

export interface PromptPacketIdentity {
  flowKey: PromptOutFlowKey | null;
  flowId: number | null;
  stepKey: string;
  mode: PromptMode;
  templateKey: string;
  recordId: number | null;
  recordShortId: string | null;
  recordTypeKey: string | null;
  selectedSectionHeading: string | null;
  admissionLevel: string | null;
  workScale: string | null;
  decisionLabel: string;
  generatedAt: string | null;
  packetHash: string | null;
}

type PromptIdentityRecord = Pick<RecordRow, "id" | "shortId" | "recordTypeKey" | "title">;

export interface PromptGenerationResult {
  prompt: string;
  promptOut: {
    flowKey: PromptOutFlowKey | null;
    flowId: number | null;
    stepKey: string;
    mode: PromptMode;
    templateKey: string;
    recordId: number | null;
    packetIdentity: PromptPacketIdentity;
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

const contextLines = (input: { flowKey?: PromptOutFlowKey; flowId?: number; stepKey: string; selectedSectionHeading?: string | null }): string[] => [
  ...(input.flowKey ? [`Flow: ${input.flowKey}`] : []),
  ...(input.flowId == null ? [] : [`Flow id: ${input.flowId}`]),
  ...(input.selectedSectionHeading ? [`Selected section heading: ${input.selectedSectionHeading}`] : []),
  `Step: ${input.stepKey}`
];

const modeLine = (mode?: PromptMode): string[] => mode ? [`Mode: ${mode}`] : [];

interface PromptDocument {
  source: string;
  content: string;
}

interface PromptPacketInput {
  mode: PromptMode;
  roleName: string;
  templateText: string;
  currentDecision: string;
  modeRequest: string;
  bearingContext: string[];
  packageDoctrine: string[];
  decisionMaterial: string[];
  sourceDocuments: PromptDocument[];
  standingRulings: string[];
  omissions: string[];
  sourceManifest: string[];
  advisoryWarning: string;
  outputLabels?: string[];
}

const DEFAULT_OUTPUT_LABELS = [
  "selected",
  "deleted",
  "challenged",
  "ignored",
  "standing ruling",
  "adopted with steward revision",
  "rejected"
];

const compact = (lines: string[]): string =>
  lines.map((line) => line.trim()).filter(Boolean).join("\n");

const tagBlock = (tag: string, body: string): string =>
  [`<${tag}>`, body.trim() || "(none)", `</${tag}>`].join("\n");

const inlineTag = (tag: string, body: string): string =>
  `<${tag}>${body.trim() || "(none)"}</${tag}>`;

const renderList = (lines: string[]): string =>
  lines.length ? lines.map((line) => `- ${line}`).join("\n") : "- none";

const renderDocuments = (documents: PromptDocument[]): string =>
  tagBlock("documents", documents.map((document) => tagBlock("document", [
    inlineTag("source", document.source),
    tagBlock("document_content", document.content || "(empty)")
  ].join("\n"))).join("\n\n") || "(none)");

const packetHash = (prompt: string): string =>
  createHash("sha256").update(prompt).digest("hex");

const quoteGrounding = "Quote-grounding pre-step: first quote the specific canon, doctrine, or source-record lines your candidates or critiques rest on before the main answer.";

const topForbiddenSummary = "Forbidden-move summary: no canon standing, no truth layer or status assignment, no separated package-label assignment, no final canon wording, no hidden assumptions, and no automatic adoption.";

const forbiddenMoves = (mode: PromptMode): string[] => [
  "Prohibition: do not assign canon standing. Rationale: only Admission and the steward can change canon standing. Positive restatement: label every proposal as a candidate for steward review.",
  "Prohibition: do not assign truth layer, status, constraint tag, admission operation, repair operation, consequence mode, or preservation boundary. Rationale: the methodology keeps these as separated steward judgments. Positive restatement: name any recommended label as a recommendation with reasons.",
  "Prohibition: do not write final canon. Rationale: the steward authors surviving material in their own wording. Positive restatement: return challenge, risks, alternatives, and questions for steward disposition.",
  "Prohibition: do not hide invented facts or borrowed assumptions. Rationale: cold prompt-out only works when provenance and assumptions are auditable. Positive restatement: mark assumptions and provenance gaps plainly.",
  mode === "proposal"
    ? "Prohibition: do not collapse proposal alternatives into one safe answer. Rationale: proposal mode needs real steward choice. Positive restatement: offer alternatives that differ along named axes: premise, mechanism, and consequence."
    : "Prohibition: do not turn pressure mode into a rewrite. Rationale: pressure mode exists to challenge steward-authored material. Positive restatement: keep challenge, risks, alternatives, and questions separate from final canon authorship."
];

const structuralSkeleton = (mode: PromptMode): string => mode === "proposal"
  ? [
      "Structural skeleton example (proposal mode)",
      "Grounding quotes:",
      "- \"<short source or doctrine quote>\" — <source id>",
      "",
      "Candidate A — <axis difference: premise | mechanism | consequence>",
      "Candidate material: <content-light candidate wording>",
      "Assumptions: <labeled assumptions or none>",
      "Risks: <advisory risks>",
      "Questions: <steward decisions owed>"
    ].join("\n")
  : [
      "Structural skeleton example (pressure mode)",
      "Grounding quotes:",
      "- \"<short source or doctrine quote>\" — <source id>",
      "",
      "Challenge: <what breaks or goes unsupported>",
      "Risk: <canon, mystery, causality, or fidelity risk>",
      "Alternative: <non-final option the steward may consider>",
      "Question: <decision the steward must answer>"
    ].join("\n");

const roleStance = (mode: PromptMode, roleName: string): string =>
  mode === "proposal"
    ? `Role stance (not an accuracy claim): ${roleName} frames candidate generation for the current decision.`
    : `Role stance (not an accuracy claim): ${roleName} frames pressure, risks, alternatives, and questions.`;

const renderPromptPacket = (input: PromptPacketInput): string => {
  const outputLabels = input.outputLabels ?? DEFAULT_OUTPUT_LABELS;
  const modeTitle = input.mode === "proposal" ? "Proposal mode" : "Pressure mode";
  const modeRequest = input.mode === "proposal"
    ? `${input.modeRequest} Require alternatives that differ along named axes: premise, mechanism, and consequence.`
    : input.modeRequest;
  const compactTop = tagBlock("compact_top_block", compact([
    `Mode: ${modeTitle}`,
    roleStance(input.mode, input.roleName),
    `Advisory/canon warning: ${input.advisoryWarning}`,
    topForbiddenSummary,
    `Output-label names: ${outputLabels.join("; ")}`
  ]));
  const contextPacket = tagBlock("context_packet", [
    "Context preview:",
    tagBlock("bearing_context", compact([
      "Micro-instruction: use this as decision-bearing context only; omissions are listed with reasons.",
      ...input.bearingContext
    ])),
    tagBlock("package_doctrine", compact([
      "Micro-instruction: these are excerpts or app-owned derivations at point of use; omissions are listed separately.",
      ...input.packageDoctrine
    ])),
    tagBlock("decision_material", compact([
      "Micro-instruction: treat steward-authored material as material under review and pasted/proposed material as advisory until the steward acts.",
      ...input.decisionMaterial
    ])),
    tagBlock("source_records", renderDocuments(input.sourceDocuments)),
    tagBlock("standing_rulings", renderList(input.standingRulings)),
    tagBlock("omissions", renderList(input.omissions)),
    tagBlock("source_manifest", compact(["Source manifest:", renderList(input.sourceManifest)]))
  ].join("\n\n"));
  const bottom = [
    "Current decision:",
    input.currentDecision,
    "",
    "Mode request:",
    modeRequest,
    "",
    quoteGrounding,
    "",
    "Forbidden moves with rationales and positive restatements:",
    ...forbiddenMoves(input.mode),
    "",
    "Output label definitions:",
    ...outputLabels.map((label) => `- ${label}: advisory label for steward disposition; not canon status.`),
    "",
    structuralSkeleton(input.mode),
    "",
    `Default prompt derivation: ${input.templateText}`,
    "",
    `Based on the material above, answer only for the current decision in ${input.mode} mode and keep every claim traceable to the quoted packet material.`
  ].join("\n");
  return [compactTop, contextPacket, bottom].join("\n\n");
};

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
  const versionRow = world.db.prepare("SELECT COALESCE(MAX(version), 0) + 1 AS next FROM prompt_template_versions WHERE template_key = ?").get(key) as { next: number };
  const nextVersion = versionRow.next;
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

const CREATION_SECTION_PROMPTS: Record<string, string> = {
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

const creationSelectedKernelSection = (world: WorldFile, input: PromptGenerationInput, record: RecordRow): { heading: string; prompt: string; body: string } => {
  const flow = input.flowId == null ? null : world.getFlowInstance(input.flowId, "creation");
  const currentStep = typeof flow?.current_step === "string" ? flow.current_step : "";
  const requestedHeading = input.selectedSectionHeading?.trim();
  if (requestedHeading && !(requestedHeading in CREATION_SECTION_PROMPTS)) {
    throw new Error(`Unknown Creation kernel target heading: ${requestedHeading}`);
  }
  const heading = requestedHeading || (currentStep.startsWith("kernel:") ? currentStep.slice("kernel:".length) : "World premise");
  const body = world.listSections(record.id).find((section) => section.heading === heading)?.body.trim() ?? "";
  return {
    heading,
    prompt: CREATION_SECTION_PROMPTS[heading] ?? "Use the world-kernel template and keep prose steward-authored.",
    body
  };
};

export const promptPacketIdentity = (
  world: WorldFile,
  input: PromptGenerationInput,
  options: {
    mode?: PromptMode;
    stepKey?: string;
    record?: PromptIdentityRecord | null;
    selectedSectionHeading?: string | null;
    decisionLabel?: string;
    generatedAt?: string | null;
    packetHash?: string | null;
  } = {}
): PromptPacketIdentity => {
  const stepKey = options.stepKey ?? input.stepKey ?? input.templateKey;
  const mode = options.mode ?? input.mode ?? "pressure";
  const record = options.record === undefined
    ? (input.recordId == null ? null : world.getRecord(input.recordId))
    : options.record;
  const selectedSectionHeading = options.selectedSectionHeading !== undefined
    ? options.selectedSectionHeading
    : input.selectedSectionHeading !== undefined
      ? input.selectedSectionHeading
      : input.flowKey === "creation" && input.templateKey === "kernel_pressure" && record?.recordTypeKey === "world_kernel"
        ? creationSelectedKernelSection(world, input, world.getRecord(record.id)).heading
        : null;
  return {
    flowKey: input.flowKey ?? null,
    flowId: input.flowId ?? null,
    stepKey,
    mode,
    templateKey: input.templateKey,
    recordId: record?.id ?? input.recordId ?? null,
    recordShortId: record?.shortId ?? null,
    recordTypeKey: record?.recordTypeKey ?? null,
    selectedSectionHeading: selectedSectionHeading ?? null,
    admissionLevel: input.admissionLevel ?? null,
    workScale: input.workScale ?? null,
    decisionLabel: options.decisionLabel ?? selectedSectionHeading ?? record?.title ?? stepKey,
    generatedAt: options.generatedAt ?? null,
    packetHash: options.packetHash ?? null
  };
};

const generatedPacketIdentity = (
  world: WorldFile,
  input: PromptGenerationInput,
  prompt: string,
  options: Parameters<typeof promptPacketIdentity>[2] = {}
): PromptPacketIdentity =>
  promptPacketIdentity(world, input, {
    ...options,
    generatedAt: new Date().toISOString(),
    packetHash: packetHash(prompt)
  });

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
    if (input.templateKey === "admission_queue_severity") return methodCard("admission.queue-severity");
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

  const prompt = renderPromptPacket({
      mode: "pressure",
      roleName: template.role_name,
      templateText: template.current_text,
      currentDecision: `Flow ${input.flowKey ?? "creation"}, step ${stepKey}: decide whether the seed decomposition is ready to hand to Admission.`,
      modeRequest: "Provide pressure, risks, alternatives, and questions that help the steward decide whether the decomposition is ready for Admission.",
      bearingContext: [
        ...contextLines({ flowKey: input.flowKey, flowId: input.flowId, stepKey }),
        `Granularity rationale: ${handoff.granularityRationale ?? "Each parked seed is independently rejectable without destroying its siblings."}`,
        ...(handoff.admissionIntent ? [`Admission intent: ${handoff.admissionIntent}`] : []),
        kernelContext
      ],
      packageDoctrine: [
        ...methodCardDoctrineSlots(cardValue),
        "Vocabulary guardrail: label whether any suggestion touches truth layer, canon status, constraint tag, admission decision operation, repair operation, consequence mode, or preservation boundary. Do not blur those categories."
      ],
      decisionMaterial: [
        `Seed decomposition report ${report.shortId}: ${report.title}`,
        report.body,
        reportSections,
        "Parked seeds:",
        seedContext
      ],
      sourceDocuments: [
        {
          source: `seed_decomposition_report:${report.shortId}`,
          content: [`${report.shortId} ${report.title}`, report.body, reportSections].filter(Boolean).join("\n\n")
        },
        ...handoff.parkedSeeds.map((seed) => ({
          source: `parked_seed:${seed.shortId}`,
          content: [
            `${seed.shortId} ${seed.title}`,
            `Truth layer: ${seed.truthLayer ?? "unset"}`,
            `Canon status: ${seed.canonStatus ?? "unset"}`,
            seed.body,
            `Derived-from links: ${seed.sourceLinks.map((link) => `${link.shortId} ${link.title} (${link.note})`).join("; ")}`
          ].join("\n")
        })),
        ...(handoff.supportingKernel
          ? [{
              source: `supporting_kernel:${handoff.supportingKernel.shortId}`,
              content: kernelContext
            }]
          : [])
      ],
      standingRulings: rulings.map((row) => `${row.disposition}: ${row.note}`),
      omissions,
      sourceManifest,
      advisoryWarning: "This prompt asks for optional pressure only. Pasted responses stay advisory artifacts until the steward authors and admits canon through the governed flow.",
      outputLabels: ["bundled seed", "missing prerequisite", "admission concern", "risk", "alternative", "question", "standing-ruling candidate", "irrelevant omission"]
    });

  return {
    prompt,
    promptOut: {
      flowKey: input.flowKey ?? null,
      flowId: input.flowId ?? null,
      stepKey,
      mode: "pressure",
      templateKey: input.templateKey,
      recordId: report.id,
      packetIdentity: generatedPacketIdentity(world, { ...input, recordId: report.id, mode: "pressure", stepKey }, prompt, {
        mode: "pressure",
        stepKey,
        record: report,
        selectedSectionHeading: null,
        decisionLabel: report.title
      })
    }
  };
};

const creationKernelPrompt = (
  world: WorldFile,
  input: PromptGenerationInput,
  template: PromptTemplateRow,
  stepKey: string,
  mode: PromptMode,
  selectedRecord: RecordRow
): PromptGenerationResult => {
  const cardValue = methodCard("creation.kernel");
  const rulings = standingRulingRows(world);
  const section = creationSelectedKernelSection(world, input, selectedRecord);
  if (mode === "proposal" && section.heading === "World premise") {
    throw new Error("Proposal prompts are refused for the World premise essence; select a non-premise kernel section or author the premise as steward-owned material.");
  }
  if (mode === "pressure" && !section.body.trim()) {
    throw new Error(`Pressure prompts require steward-authored material for selected Creation kernel section ${section.heading}.`);
  }
  const sections = world.listSections(selectedRecord.id);
  const fullKernelContext = [
    `${selectedRecord.shortId} ${selectedRecord.title}`,
    selectedRecord.body,
    ...sections.map((row) => `${row.heading}: ${row.body || "(empty)"}`)
  ].filter(Boolean).join("\n");
  const selectedMaterial = [
    `Current kernel section: ${section.heading}`,
    `Selected section prompt: ${section.prompt}`,
    `Selected section material: ${section.body || "(empty)"}`,
    ...(section.body
      ? []
      : ["Selected section empty-state context: no saved text exists yet; proposal may request candidates, while pressure remains unavailable until steward-authored material is saved."])
  ];
  const omissions = [
    "Frontloaded seed audit and first canon standing are omitted because Admission owns them.",
    "No silent kernel-only fallback: selected section context is carried when a kernel section is selected.",
    "Open canon debt omitted unless it affects this kernel decision."
  ];
  const sourceManifest = [
    `Selected kernel section: ${section.heading}`,
    `Section prompt: ${section.prompt}`,
    `Source record: world kernel ${selectedRecord.shortId} ${selectedRecord.title}`,
    `Prompt template: ${template.key} (${template.package_source})`,
    ...methodCardSourceManifest(cardValue),
    ...omissions.map((omission) => `Omission: ${omission}`)
  ];

  const prompt = renderPromptPacket({
      mode,
      roleName: mode === "proposal" ? "Decision proposal" : template.role_name,
      templateText: template.current_text,
      currentDecision: `Flow ${input.flowKey ?? "creation"}, selected kernel section ${section.heading}: work only on this local kernel decision.`,
      modeRequest: mode === "proposal"
        ? `Draft labeled candidate material for the selected ${section.heading} section. Recommend alternatives with assumptions; do not assign truth layer, canon status, consequence mode, or any separated label.`
        : `Provide pressure, risks, alternatives, and questions on the selected ${section.heading} section's steward-authored material.`,
      bearingContext: [
        ...modeLine(mode),
        ...contextLines({ flowKey: input.flowKey, flowId: input.flowId, stepKey, selectedSectionHeading: section.heading }),
        "Kernel authoring is a composite decision point; the active local unit is the selected section."
      ],
      packageDoctrine: [
        ...methodCardDoctrineSlots(cardValue),
        `Selected section obligation: ${section.prompt}`,
        "World premise essence exception: proposal mode is refused only for the World premise section; other sections may request proposal candidates.",
        "Vocabulary guardrail: label whether any suggestion touches truth layer, canon status, constraint tag, admission decision operation, repair operation, consequence mode, or preservation boundary. Do not blur those categories."
      ],
      decisionMaterial: [
        ...selectedMaterial,
        "",
        "Full kernel context for orientation only:",
        fullKernelContext
      ],
      sourceDocuments: [
        {
          source: `selected_kernel_section:${section.heading}`,
          content: selectedMaterial.join("\n")
        },
        {
          source: `world_kernel:${selectedRecord.shortId}`,
          content: fullKernelContext
        }
      ],
      standingRulings: rulings.map((row) => `${row.disposition}: ${row.note}`),
      omissions,
      sourceManifest,
      advisoryWarning: "This prompt is optional advisory support. Pasted responses stay advisory artifacts until the steward authors and admits canon through the governed flow.",
      outputLabels: ["candidate", "assumption", "risk", "alternative", "question", "standing-ruling candidate", "off-section"]
    });

  return {
    prompt,
    promptOut: {
      flowKey: input.flowKey ?? null,
      flowId: input.flowId ?? null,
      stepKey,
      mode,
      templateKey: input.templateKey,
      recordId: selectedRecord.id,
      packetIdentity: generatedPacketIdentity(world, { ...input, mode, stepKey, recordId: selectedRecord.id }, prompt, {
        mode,
        stepKey,
        record: selectedRecord,
        selectedSectionHeading: section.heading,
        decisionLabel: section.heading
      })
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
  const selectedRecord = input.recordId == null ? null : world.getRecord(input.recordId);
  if (input.flowKey === "creation" && input.templateKey === "kernel_pressure" && selectedRecord?.recordTypeKey === "world_kernel") {
    return creationKernelPrompt(world, input, template, stepKey, mode, selectedRecord);
  }
  const recordContext = selectedRecord == null ? "No record context selected." : promptRecordContext(world, selectedRecord.id);
  const rulings = standingRulingRows(world);
  const cardValue = promptMethodCard(input);
  const doctrineLines = cardValue ? methodCardDoctrineSlots(cardValue) : [];
  const flowContext = temporalPromptContext(world, input);
  const sourceManifest = [
    `Prompt template: ${template.key} (${template.package_source})`,
    ...(cardValue ? methodCardSourceManifest(cardValue) : []),
    ...flowContext.sourceManifest,
    selectedRecord == null ? "Selected record: none" : `Selected record: ${selectedRecord.shortId} ${selectedRecord.title}`,
    `Standing rulings: ${rulings.length}`,
    "Omissions: no hidden repository context; unavailable world context must be named before copy-out."
  ];
  const omissions = [
    ...(selectedRecord == null ? ["Selected record omitted: no record context was provided."] : []),
    "No hidden repository context is available to the external LLM.",
    "Unavailable world context must be named before copy-out rather than silently omitted."
  ];
  const advisoryWarning = "This prompt is optional advisory support. Pasted responses stay advisory artifacts until the steward authors and admits canon through the governed flow.";

  const prompt = renderPromptPacket({
    mode,
    roleName: template.role_name,
    templateText: template.current_text,
    currentDecision: `Flow ${input.flowKey ?? "unspecified"}, step ${stepKey}; selected record ${selectedRecord ? `${selectedRecord.shortId} ${selectedRecord.title}` : "none"}.`,
    modeRequest: mode === "proposal"
      ? "Draft labeled candidate material with alternatives, assumptions, risks, and questions. Recommend with reasons, never assign canon standing or separated labels."
      : "Provide pressure, risks, alternatives, and questions on steward-authored material. Do not author final canon.",
    bearingContext: [
      ...modeLine(mode),
      ...contextLines({ flowKey: input.flowKey, flowId: input.flowId, stepKey }),
      ...(flowContext.lines.length ? flowContext.lines : [])
    ],
    packageDoctrine: [
      ...doctrineLines,
      "Vocabulary guardrail: label whether any suggestion touches truth layer, canon status, constraint tag, admission decision operation, repair operation, consequence mode, or preservation boundary. Do not blur those categories.",
      "Label assumptions instruction: separate direct consequences from speculative assumptions and mark unadmitted assumptions plainly."
    ],
    decisionMaterial: ["Record context:", recordContext],
    sourceDocuments: [
      ...(selectedRecord
        ? [{ source: `selected_record:${selectedRecord.shortId}`, content: recordContext }]
        : []),
      ...(flowContext.lines.length
        ? [{ source: `flow_context:${input.flowKey ?? "unspecified"}:${stepKey}`, content: flowContext.lines.join("\n\n") }]
        : [])
    ],
    standingRulings: rulings.map((row) => `${row.disposition}: ${row.note}`),
    omissions,
    sourceManifest,
    advisoryWarning
  });

  return {
    prompt,
    promptOut: {
      flowKey: input.flowKey ?? null,
      flowId: input.flowId ?? null,
      stepKey,
      mode,
      templateKey: input.templateKey,
      recordId: input.recordId ?? null,
      packetIdentity: generatedPacketIdentity(world, { ...input, mode, stepKey }, prompt, {
        mode,
        stepKey,
        record: selectedRecord,
        selectedSectionHeading: null,
        decisionLabel: selectedRecord?.title ?? stepKey
      })
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
