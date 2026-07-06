import { intakeProposedFact } from "./admission-flow.js";
import { ADVISORY_OUTPUT_LABELS, promptMode, withPromptModeSummaries, type DecisionPointPromptMode, type DecisionPointSharedContract } from "./decision-point-contract.js";
import { methodCard, methodCardDoctrineSlots, methodCardSourceManifest } from "./method-cards.js";
import * as PromptOut from "./prompt-out.js";
import type { AdmissionQueueRow, RecordRow, WorldFile } from "./world-file.js";

type SignalStatus = "present" | "absent" | "deferred" | "protected" | "unknown" | "not_applicable";
type DispositionValue = "covered" | "deferred" | "protected_mystery";
type DeferralInput = { kind: "skip"; stepKey?: string } | { kind: "canon_debt"; debtName: string };
type RecordedDisposition = MinimalViableWorldDispositionInput & { evidenceRecordIds: number[] };

interface DimensionDefinition {
  key: string;
  label: string;
  doctrine: string;
  evidenceRecordTypes: string[];
  keywords: string[];
  protectedMysteryAllowed?: boolean;
}

export interface MinimalViableWorldDispositionInput {
  seedRecordId: number;
  dimensionKey: string;
  disposition: DispositionValue;
  substance: string;
  evidenceRecordIds?: number[];
  protectedRecordId?: number;
  deferral?: DeferralInput;
}

const FLOW_KEY = "creation";
const TEMPLATE_KEY = "minimal_viable_world_checkpoint";
const CHECKPOINT_REPORT_MARKER = "Minimal Viable World checkpoint";
const CHECKPOINT_ROUTE = "/api/flows/creation/minimal-viable-world";
const PROTOCOL_SOURCE = "docs/worldbuilding-system/05_creation_protocol.md";
const PROMPT_SOURCE = "docs/worldbuilding-system/20_ai_assisted_workflow.md";

const ADMITTED_STATUSES = new Set(["accepted", "accepted with constraints", "localized", "contested", "branch-only"]);

const DIMENSIONS: DimensionDefinition[] = [
  {
    key: "ordinary_life",
    label: "ordinary-life residue",
    doctrine: "Phase 6 asks what ordinary people fear, carry, obey, work around, misunderstand, and joke about.",
    evidenceRecordTypes: ["canon_fact", "admission_ledger_row", "pass_report"],
    keywords: ["ordinary-life", "ordinary life", "routine", "household", "breakfast", "work", "joke", "daily"]
  },
  {
    key: "adapted_institution",
    label: "adapted institution or custom",
    doctrine: "Phase 4 requires at least one institution that has adapted; phase 7 asks what older problem created it.",
    evidenceRecordTypes: ["institution", "counter_institution", "action_arena", "canon_fact"],
    keywords: ["institution", "custom", "guild", "court", "law", "office", "bureaucracy", "license"]
  },
  {
    key: "factional_disagreement",
    label: "factional disagreement or mode-equivalent pressure",
    doctrine: "Phase 8 asks factions to be different answers to the same world pressure, not aesthetic labels.",
    evidenceRecordTypes: ["counter_institution", "institution", "canon_fact"],
    keywords: ["faction", "disagreement", "resent", "rejects", "opposes", "pressure", "counter-institution"]
  },
  {
    key: "path_dependence",
    label: "historical/path-dependence residue",
    doctrine: "Phase 7 asks what older compromise, disaster, beneficiary, or residue still constrains the present.",
    evidenceRecordTypes: ["temporal_timeline", "canon_fact", "pass_report"],
    keywords: ["path dependence", "historical", "history", "older compromise", "residue", "disaster", "fossil"]
  },
  {
    key: "mystery_boundary",
    label: "governed contradiction or mystery boundary",
    doctrine: "Phase 4 needs one mystery or unknown; protected mystery requires a governed boundary, not generic n/a.",
    evidenceRecordTypes: ["mystery_ledger_entry", "contradiction_report", "canon_fact"],
    keywords: ["mystery", "protected", "unknown", "boundary", "contradiction"],
    protectedMysteryAllowed: true
  },
  {
    key: "aesthetic_rule",
    label: "aesthetic rule or residue",
    doctrine: "Phase 4 asks for one aesthetic rule; QA later checks whether residue is causal rather than decorative.",
    evidenceRecordTypes: ["aesthetic_coherence", "canon_fact", "pass_report"],
    keywords: ["aesthetic", "symbol", "ritual", "song", "rule", "residue", "motif"]
  },
  {
    key: "pressure_line",
    label: "pressure line for expansion",
    doctrine: "Phase 5 permits expansion only when existing facts force a geography, history, institution, faction, or other pressure line.",
    evidenceRecordTypes: ["canon_fact", "world_kernel", "pass_report", "canon_debt"],
    keywords: ["pressure line", "pressure", "forces", "forced", "adapt", "expansion"]
  }
];

const DIMENSION_BY_KEY = new Map(DIMENSIONS.map((dimension) => [dimension.key, dimension]));

const recordBodyWithSections = (world: WorldFile, record: RecordRow): string => [
  record.title,
  record.body,
  ...world.listSections(record.id).map((section) => `${section.heading}\n${section.body}`)
].filter(Boolean).join("\n");

const lowerRecordText = (world: WorldFile, record: RecordRow): string => recordBodyWithSections(world, record).toLowerCase();

const matchesDimension = (world: WorldFile, record: RecordRow, dimension: DimensionDefinition): boolean => {
  const text = lowerRecordText(world, record);
  const strongTypeMatch = dimension.evidenceRecordTypes
    .filter((recordType) => !["canon_fact", "pass_report", "world_kernel"].includes(recordType))
    .includes(record.recordTypeKey);
  if (strongTypeMatch) return true;
  return dimension.keywords.some((keyword) => text.includes(keyword));
};

const acceptedSeedFacts = (world: WorldFile): RecordRow[] =>
  {
    const acceptedFacts = world.listRecords()
      .filter((record) => record.recordTypeKey === "canon_fact" && ADMITTED_STATUSES.has(record.canonStatus ?? ""))
      .sort((left, right) => left.id - right.id);
    const creationLinkedSeeds = acceptedFacts.filter((record) =>
      linkedRecords(world, record.id).some((linked) => linked.recordTypeKey === "world_kernel" || linked.recordTypeKey === "seed_decomposition")
    );
    return creationLinkedSeeds.length ? creationLinkedSeeds : acceptedFacts;
  };

const checkpointReports = (world: WorldFile): RecordRow[] =>
  world.listRecords()
    .filter((record) => record.recordTypeKey === "pass_report" && record.body.includes(CHECKPOINT_REPORT_MARKER))
    .sort((left, right) => right.id - left.id);

const latestCheckpointReport = (world: WorldFile): RecordRow | null => checkpointReports(world)[0] ?? null;

const linkedRecords = (world: WorldFile, recordId: number): RecordRow[] => {
  const linkedIds = new Set<number>();
  for (const link of world.listLinks(recordId)) {
    if (link.fromRecordId === recordId) linkedIds.add(link.toRecordId);
    if (link.toRecordId === recordId) linkedIds.add(link.fromRecordId);
  }
  return [...linkedIds].map((id) => world.getRecord(id));
};

const perSeedEvidenceCandidates = (world: WorldFile, seed: RecordRow): RecordRow[] =>
  [seed, ...linkedRecords(world, seed.id)].filter((record) => record.recordTypeKey !== "world_kernel" && record.recordTypeKey !== "pass_report");

const relatedEvidence = (world: WorldFile, seed: RecordRow, dimension: DimensionDefinition): RecordRow[] => {
  const related = perSeedEvidenceCandidates(world, seed);
  return related.filter((record) => matchesDimension(world, record, dimension));
};

const deferredEvidence = (world: WorldFile, seed: RecordRow, dimension: DimensionDefinition): RecordRow[] =>
  perSeedEvidenceCandidates(world, seed).filter((record) =>
    (record.recordTypeKey === "canon_debt" || record.recordTypeKey === "skip_record")
    && lowerRecordText(world, record).includes(dimension.key.replaceAll("_", " "))
  );

const signalForDimension = (world: WorldFile, seed: RecordRow, dimension: DimensionDefinition) => {
  const deferred = deferredEvidence(world, seed, dimension);
  if (deferred.length) {
    return {
      key: dimension.key,
      label: dimension.label,
      status: "deferred" as SignalStatus,
      evidence: deferred.map(evidenceRef),
      reason: "A linked skip record or canon debt carries this checkpoint dimension."
    };
  }

  const evidence = relatedEvidence(world, seed, dimension);
  if (dimension.protectedMysteryAllowed) {
    const protectedEvidence = evidence.filter((record) =>
      record.recordTypeKey === "mystery_ledger_entry"
      || record.truthLayer === "mystery boundary"
      || /\b(mystery|protected|boundary)\b/i.test(recordBodyWithSections(world, record))
    );
    if (protectedEvidence.length) {
      return {
        key: dimension.key,
        label: dimension.label,
        status: "protected" as SignalStatus,
        evidence: protectedEvidence.map(evidenceRef),
        reason: "A linked mystery-boundary/protected-effect record exists."
      };
    }
  }

  return {
    key: dimension.key,
    label: dimension.label,
    status: evidence.length ? "present" as SignalStatus : "absent" as SignalStatus,
    evidence: evidence.map(evidenceRef),
    reason: evidence.length
      ? "Existing linked records or source prose contain checkpoint evidence."
      : "No linked or source evidence found for this dimension."
  };
};

const evidenceRef = (record: RecordRow) => ({
  id: record.id,
  shortId: record.shortId,
  title: record.title,
  recordTypeKey: record.recordTypeKey,
  canonStatus: record.canonStatus
});

const firstKernel = (world: WorldFile): RecordRow | null =>
  world.listRecords().filter((record) => record.recordTypeKey === "world_kernel").sort((left, right) => left.id - right.id)[0] ?? null;

const textFromWorld = (world: WorldFile): string =>
  world.listRecords().map((record) => recordBodyWithSections(world, record)).join("\n").toLowerCase();

const wholeWorldSignals = (world: WorldFile, seeds: RecordRow[]) => {
  const kernel = firstKernel(world);
  const allText = textFromWorld(world);
  return [
    {
      key: "core_promise",
      label: "core promise",
      status: kernel && /core promise|promise/.test(lowerRecordText(world, kernel)) ? "present" as SignalStatus : "absent" as SignalStatus,
      evidence: kernel ? [evidenceRef(kernel)] : [],
      reason: "Derived from the world kernel core-promise material."
    },
    {
      key: "admitted_seed_count",
      label: "two to five admitted seed facts",
      status: seeds.length >= 2 && seeds.length <= 5 ? "present" as SignalStatus : "absent" as SignalStatus,
      evidence: seeds.map(evidenceRef),
      reason: `${seeds.length} admitted seed fact(s) found.`
    },
    {
      key: "pressure_line",
      label: "pressure line for expansion",
      status: /pressure line|primary pressures|pressure/.test(allText) ? "present" as SignalStatus : "absent" as SignalStatus,
      evidence: kernel ? [evidenceRef(kernel)] : [],
      reason: "Derived from kernel pressure prose or linked evidence."
    },
    {
      key: "automatic_verdict",
      label: "automatic pass/fail verdict",
      status: "not_applicable" as SignalStatus,
      evidence: [],
      reason: "The app does not compute, store, or imply a Minimal Viable World verdict."
    }
  ];
};

const dispositionLines = (world: WorldFile, reportId: number): string[] =>
  world.listSections(reportId).find((section) => section.heading === "Coverage lenses")?.body
    .split("\n")
    .filter((line) => line.startsWith("MVW_DISPOSITION "))
  ?? [];

const parseDispositionLine = (line: string): (MinimalViableWorldDispositionInput & { evidenceRecordIds: number[] }) | null => {
  try {
    const parsed = JSON.parse(line.replace(/^MVW_DISPOSITION\s+/, "")) as MinimalViableWorldDispositionInput & { evidenceRecordIds?: number[] };
    return { ...parsed, evidenceRecordIds: parsed.evidenceRecordIds ?? [] };
  } catch {
    return null;
  }
};

const dispositionsForReport = (world: WorldFile, report: RecordRow | null) =>
  report == null ? [] : dispositionLines(world, report.id).map(parseDispositionLine).filter((row): row is MinimalViableWorldDispositionInput & { evidenceRecordIds: number[] } => row != null);

const reportSection = (heading: string, body: string, position: number) => ({ heading, body, position });

const renderCoverageSignalSummary = (world: WorldFile): string => {
  const seeds = acceptedSeedFacts(world);
  const wholeWorld = wholeWorldSignals(world, seeds)
    .map((signal) => `- Whole world ${signal.label}: ${signal.status}`)
    .join("\n");
  const perSeed = seeds.flatMap((seed) =>
    DIMENSIONS.map((dimension) => {
      const signal = signalForDimension(world, seed, dimension);
      const evidence = signal.evidence.map((record) => record.shortId).join(", ") || "no evidence";
      return `- ${seed.shortId} ${dimension.label}: ${signal.status} (${evidence})`;
    })
  ).join("\n");
  return [wholeWorld, perSeed].filter(Boolean).join("\n") || "No checkpoint coverage signals available.";
};

const closeReadinessFromDispositions = (world: WorldFile, rows: RecordedDisposition[]) => {
  const completed = new Set(rows.map(dispositionKey));
  const blockers = acceptedSeedFacts(world).flatMap((seed) =>
    DIMENSIONS
      .filter((dimension) => !completed.has(`${seed.id}:${dimension.key}`))
      .map((dimension) => ({
        key: `${seed.id}:${dimension.key}`,
        label: `${seed.shortId} ${dimension.label}`,
        message: `Disposition required for ${seed.shortId} ${dimension.label}.`
      }))
  );
  return { status: blockers.length ? "blocked" : "ready", blockers };
};

const createCheckpointReport = (
  world: WorldFile,
  snapshot: {
    dispositions?: RecordedDisposition[];
    skips?: RecordRow[];
    debt?: RecordRow[];
    proposals?: RecordRow[];
    advisoryArtifacts?: RecordRow[];
    previousReport?: RecordRow | null;
  } = {}
): RecordRow => {
  const seeds = acceptedSeedFacts(world);
  const dispositions = snapshot.dispositions ?? [];
  const skips = snapshot.skips ?? [];
  const debt = snapshot.debt ?? [];
  const proposals = snapshot.proposals ?? [];
  const advisoryArtifacts = snapshot.advisoryArtifacts ?? [];
  const readiness = closeReadinessFromDispositions(world, dispositions);
  const coverageBody = renderCoverageSignalSummary(world);
  const dispositionBody = dispositions.map((row) => renderDispositionLine(row)).join("\n") || "No steward dispositions recorded yet.";
  const skipLines = skips.map((skip) => `- Skip ${skip.shortId}: ${skip.title}`).join("\n");
  const debtLines = debt.map((debtRecord) => `- Debt ${debtRecord.shortId}: ${debtRecord.title}`).join("\n");
  const proposalLines = proposals.map((proposal) => `- Proposal ${proposal.shortId}: ${proposal.title}`).join("\n");
  const advisoryLines = advisoryArtifacts.map((advisory) => `- Advisory ${advisory.shortId}: ${advisory.title}`).join("\n");
  const report = world.createRecord({
    recordTypeKey: "pass_report",
    title: "Minimal Viable World checkpoint",
    body: [
      CHECKPOINT_REPORT_MARKER,
      "Flow key: creation",
      `Status: ${readiness.status}`,
      "The app clerks coverage signals and routes; the steward owns dispositions."
    ].join("\n"),
    truthLayer: "Objective canon",
    canonStatus: "accepted"
  });
  world.replaceSections(report.id, [
    reportSection("Source and run", `Checkpoint opened from ${CHECKPOINT_ROUTE}.\nAdmitted seeds: ${seeds.map((seed) => `${seed.shortId} ${seed.title}`).join("; ") || "none"}.`, 1),
    reportSection("Coverage lenses", `Coverage signals:\n${coverageBody}\n\nSteward dispositions:\n${dispositionBody}`, 2),
    reportSection("Admission proposals", proposalLines || "No checkpoint proposals routed yet.", 4),
    reportSection("Canon debt", debtLines || "No checkpoint canon debt recorded yet.", 5),
    reportSection("Prompt-out and skips", [advisoryLines, skipLines].filter(Boolean).join("\n") || "No checkpoint advisory artifacts or governed skips recorded yet.", 6),
    reportSection("Close readiness", readiness.blockers.length ? "Required dimensions remain unresolved." : "All required checkpoint dimensions have steward dispositions.", 7)
  ]);
  for (const seed of seeds) {
    world.createLinkIfMissing(report.id, seed.id, "derived_from", "Minimal Viable World checkpoint reads this admitted seed fact");
  }
  for (const row of dispositions) {
    for (const evidenceId of row.evidenceRecordIds ?? []) {
      world.createLinkIfMissing(report.id, evidenceId, "derived_from", `Minimal Viable World ${row.dimensionKey} evidence`);
    }
    if (row.protectedRecordId != null) {
      world.createLinkIfMissing(report.id, row.protectedRecordId, "preserves_boundary_for", "Minimal Viable World protected mystery disposition");
    }
  }
  for (const skip of skips) {
    world.createLinkIfMissing(skip.id, report.id, "derived_from", "Checkpoint deferral or Prompt-out skip belongs to this pass report");
  }
  for (const debtRecord of debt) {
    world.createLinkIfMissing(report.id, debtRecord.id, "requires_follow_up", "Checkpoint deferral creates canon debt");
  }
  for (const proposal of proposals) {
    world.createLinkIfMissing(report.id, proposal.id, "derived_from", "Minimal Viable World checkpoint routed this proposal");
  }
  for (const advisory of advisoryArtifacts) {
    world.createLinkIfMissing(report.id, advisory.id, "cites_advisory_artifact", "Minimal Viable World checkpoint consulted this advisory artifact");
  }
  if (snapshot.previousReport) {
    world.createLinkIfMissing(report.id, snapshot.previousReport.id, "derived_from", "Minimal Viable World checkpoint snapshot supersedes earlier snapshot");
  }
  return report;
};

const ensureCheckpointReport = (world: WorldFile, reportId?: number): RecordRow => {
  if (reportId != null) {
    const report = world.getRecord(reportId);
    if (report.recordTypeKey !== "pass_report" || !report.body.includes(CHECKPOINT_REPORT_MARKER)) {
      throw new Error("Minimal Viable World actions require a checkpoint pass_report");
    }
    return report;
  }
  return latestCheckpointReport(world) ?? createCheckpointReport(world);
};

const dispositionKey = (row: MinimalViableWorldDispositionInput): string => `${row.seedRecordId}:${row.dimensionKey}`;

const renderDispositionLine = (row: MinimalViableWorldDispositionInput): string =>
  `MVW_DISPOSITION ${JSON.stringify({
    seedRecordId: row.seedRecordId,
    dimensionKey: row.dimensionKey,
    disposition: row.disposition,
    substance: row.substance,
    evidenceRecordIds: row.evidenceRecordIds ?? [],
    protectedRecordId: row.protectedRecordId ?? null
  })}`;

const validateDisposition = (world: WorldFile, input: MinimalViableWorldDispositionInput): void => {
  const seed = world.getRecord(input.seedRecordId);
  if (seed.recordTypeKey !== "canon_fact" || !ADMITTED_STATUSES.has(seed.canonStatus ?? "")) {
    throw new Error("Minimal Viable World dispositions require an admitted seed fact");
  }
  const dimension = DIMENSION_BY_KEY.get(input.dimensionKey);
  if (!dimension) throw new Error(`Unknown Minimal Viable World dimension: ${input.dimensionKey}`);
  if (!input.substance?.trim()) throw new Error("checkpoint dispositions require written substance");
  if (input.disposition === "protected_mystery") {
    if (!dimension.protectedMysteryAllowed) throw new Error("protected mystery disposition is only valid for the mystery-boundary dimension");
    if (input.protectedRecordId == null) throw new Error("protected mystery disposition requires a linked mystery-boundary record");
    const protectedRecord = world.getRecord(input.protectedRecordId);
    if (
      protectedRecord.recordTypeKey !== "mystery_ledger_entry"
      && protectedRecord.truthLayer !== "mystery boundary"
      && !/\b(mystery|protected|boundary)\b/i.test(recordBodyWithSections(world, protectedRecord))
    ) {
      throw new Error("protected mystery requires an existing or linked mystery-boundary/protected-effect record");
    }
  }
  for (const evidenceId of input.evidenceRecordIds ?? []) world.getRecord(evidenceId);
};

export const closeReadiness = (world: WorldFile, report: RecordRow | null) => {
  const rows = report == null ? [] : dispositionsForReport(world, report);
  return closeReadinessFromDispositions(world, rows);
};

const linkedCheckpointRecords = (world: WorldFile, report: RecordRow | null, predicate: (record: RecordRow) => boolean): RecordRow[] => {
  if (!report) return [];
  const linked = linkedRecords(world, report.id);
  return linked.filter(predicate).sort((left, right) => left.id - right.id);
};

export const coverageSignals = (world: WorldFile) => {
  const seeds = acceptedSeedFacts(world);
  return {
    admittedSeeds: seeds.map((seed) => ({
      ...evidenceRef(seed),
      dimensions: DIMENSIONS.map((dimension) => signalForDimension(world, seed, dimension))
    })),
    wholeWorld: wholeWorldSignals(world, seeds)
  };
};

const checkpointBlockers = (world: WorldFile) => {
  const seeds = acceptedSeedFacts(world);
  const blockers: DecisionPointSharedContract["blockers"] = [];
  if (!seeds.length) {
    blockers.push({
      key: "no_admitted_seed_facts",
      label: "Admitted seed facts",
      message: "The Minimal Viable World checkpoint waits for admitted seed evidence; parked proposed seeds alone do not count.",
      requires: "admitted seed facts"
    });
  }
  if (seeds.length === 1 || seeds.length > 5) {
    blockers.push({
      key: "admitted_seed_count",
      label: "Admitted seed count",
      message: "The checkpoint minimum is two to five admitted seed facts.",
      requires: "two to five admitted seed facts"
    });
  }
  return blockers;
};

const promptModes = (world: WorldFile, report: RecordRow | null): DecisionPointPromptMode[] => {
  const seeds = acceptedSeedFacts(world);
  const proposalRecordId = report?.id ?? seeds[0]?.id;
  const dispositionRows = dispositionsForReport(world, report);
  const pressureAvailable = report != null && dispositionRows.length > 0;
  const commonBody = {
    flowKey: FLOW_KEY,
    templateKey: TEMPLATE_KEY,
    stepKey: "minimal_viable_world:coverage_review",
    recordId: pressureAvailable ? report?.id : proposalRecordId
  };
  return withPromptModeSummaries([
    promptMode({
      mode: "proposal",
      label: "Proposal mode",
      available: proposalRecordId != null,
      blocker: proposalRecordId == null ? "Proposal prompts need admitted seed context before copy-out." : null,
      framing: "Request labeled candidate residues, institutions, factional pressures, boundaries, aesthetic residue, pressure lines, and debt phrasing.",
      role: "Minimal Viable World proposal",
      templateKey: TEMPLATE_KEY,
      stepKey: "minimal_viable_world:coverage_review",
      outputLabels: ADVISORY_OUTPUT_LABELS,
      stepRequest: proposalRecordId == null ? null : {
        method: "POST",
        href: "/api/prompt-out/steps",
        body: { ...commonBody, mode: "proposal", label: "Minimal Viable World proposal" }
      }
    }),
    promptMode({
      mode: "pressure",
      label: "Pressure mode",
      available: pressureAvailable,
      blocker: pressureAvailable ? null : "Pressure prompts require steward-authored checkpoint evidence or dispositions.",
      framing: "Challenge backdrop-shaped gaps, silent deferrals, weak pressure lines, unsupported faction labels, and unguided mystery.",
      role: "Minimal Viable World pressure",
      templateKey: TEMPLATE_KEY,
      stepKey: "minimal_viable_world:coverage_review",
      outputLabels: ADVISORY_OUTPUT_LABELS,
      stepRequest: pressureAvailable ? {
        method: "POST",
        href: "/api/prompt-out/steps",
        body: { ...commonBody, mode: "pressure", label: "Minimal Viable World pressure" }
      } : null
    })
  ]);
};

const readSideTrail = (report: RecordRow | null, seeds: RecordRow[]) => [
  ...(report ? [{ label: `checkpoint report ${report.shortId}`, href: `/api/canon-workbench/records/${report.id}`, recordId: report.id }] : []),
  ...seeds.map((seed) => ({ label: `admitted seed ${seed.shortId}`, href: `/api/canon-workbench/records/${seed.id}`, recordId: seed.id })),
  { label: "Admission queue", href: "/api/admission/queue" },
  { label: "QA", href: "/api/qa/passes/start" },
  { label: "Audit Trail", href: "/api/canon-workbench/audit" }
];

const decisionPoint = (world: WorldFile, report: RecordRow | null): { sharedContract: DecisionPointSharedContract } => {
  const cardValue = methodCard("creation.minimal-viable-world");
  const seeds = acceptedSeedFacts(world);
  const blockers = checkpointBlockers(world);
  const signalSummary = coverageSignals(world);
  const displayed = [
    `${CHECKPOINT_REPORT_MARKER}: ${report ? `${report.shortId} ${report.title}` : "no report yet"}`,
    `Admitted seed facts: ${seeds.map((seed) => `${seed.shortId} ${seed.title}`).join("; ") || "none"}`,
    ...signalSummary.wholeWorld.map((signal) => `${signal.label}: ${signal.status}`)
  ];
  return {
    sharedContract: {
      contractVersion: "decision-point/v1",
      methodCard: cardValue,
      flow: { key: FLOW_KEY, runState: blockers.length ? "checkpoint_blocked" : report ? "checkpoint_in_progress" : "checkpoint_owed" },
      step: {
        key: "minimal_viable_world:coverage_review",
        localDecision: "Judge whether admitted seeds form a Minimal Viable World, dimension by dimension.",
        packageSource: PROTOCOL_SOURCE,
        why: "Phases 4-8 test whether the world is a pressure field rather than a backdrop or lore pile."
      },
      obligations: {
        required: [
          "Review per-seed coverage signals",
          "Record covered, deferred with reason, or protected mystery dispositions",
          "Route fact-shaped follow-up to Admission as proposed"
        ],
        optional: ["Proposal Prompt-out for candidate residue or debt phrasing", "Pressure Prompt-out after steward material exists"],
        skippable: ["Offered checkpoint Prompt-out can be declined with a skip_record"],
        severityDependent: ["Deferral reason depth follows the package's skip/debt substance rule"]
      },
      skipRule: {
        offered: true,
        reasonRequired: false,
        reasonThreshold: "major-or-higher checkpoint work",
        recordType: "skip_record"
      },
      doctrine: {
        slots: methodCardDoctrineSlots(cardValue),
        packageSources: [PROTOCOL_SOURCE, PROMPT_SOURCE, "docs/worldbuilding-system/21_templates_index.md", "docs/specs/creation-flow.md"]
      },
      bearingContext: {
        displayed,
        sourceManifest: [
          ...(report ? [`Minimal Viable World checkpoint report: ${report.shortId} ${report.title}`] : []),
          ...seeds.map((seed) => `Admitted seed: ${seed.shortId} ${seed.title}`),
          ...methodCardSourceManifest(cardValue)
        ],
        omissions: [
          "The app does not infer missing content or emit a pass/fail verdict.",
          "Prompt-out responses stay advisory until separately disposed and authored."
        ]
      },
      promptOut: { serverOwned: true, modes: promptModes(world, report) },
      blockers,
      substanceValidations: [
        "Covered and deferred dispositions require written substance.",
        "Protected mystery dispositions require an existing or linked mystery-boundary/protected-effect record."
      ],
      writeIntent: {
        willWrite: ["pass_report disposition sections, skip_record, canon_debt, advisory_artifact, or proposed canon_fact only when the steward acts"],
        willLink: ["checkpoint report to admitted seeds, evidence records, skip records, debt, proposals, protected mystery records, and advisory artifacts where present"],
        willQueue: ["fact-shaped follow-up material routes to Admission as proposed"],
        willRouteOnward: ["QA first whole-world pass consumes the checkpoint echo read-only"],
        willLeaveUntouched: [
          "the checkpoint does not admit facts, change canon standing, or compute a pass/fail verdict",
          "source records remain unchanged unless another governed flow changes them"
        ]
      },
      nextOrResumeState: {
        currentStep: "minimal_viable_world:coverage_review",
        nextStep: report ? "continue dispositions or review close readiness" : "record first checkpoint dispositions",
        safeExit: "Return to the workflow map; checkpoint state is recomputed from the world file and checkpoint report."
      },
      readSideTrail: readSideTrail(report, seeds)
    }
  };
};

export const checkpointState = (world: WorldFile) => {
  const report = latestCheckpointReport(world);
  const seeds = acceptedSeedFacts(world);
  const blockers = checkpointBlockers(world);
  const debt = linkedCheckpointRecords(world, report, (record) => record.recordTypeKey === "canon_debt");
  const admissionProposals = linkedCheckpointRecords(world, report, (record) => record.recordTypeKey === "canon_fact" && record.canonStatus === "proposed");
  const advisoryArtifacts = linkedCheckpointRecords(world, report, (record) => record.recordTypeKey === "advisory_artifact");
  return {
    checkpoint: {
      owed: seeds.length > 0,
      report,
      route: CHECKPOINT_ROUTE,
      blockers,
      coverageSignals: coverageSignals(world),
      dispositions: dispositionsForReport(world, report),
      closeReadiness: closeReadiness(world, report),
      unresolvedDeferrals: dispositionsForReport(world, report).filter((row) => row.disposition === "deferred"),
      openCanonDebt: debt,
      admissionProposals,
      advisoryArtifacts
    },
    decisionPoint: decisionPoint(world, report)
  };
};

export const recordDispositions = (
  world: WorldFile,
  input: { reportId?: number; dispositions: MinimalViableWorldDispositionInput[] }
) => {
  for (const disposition of input.dispositions) validateDisposition(world, disposition);
  return world.atomicWrite(() => {
    const previousReport = input.reportId == null ? latestCheckpointReport(world) : ensureCheckpointReport(world, input.reportId);
    const current = new Map(dispositionsForReport(world, previousReport).map((row) => [dispositionKey(row), row]));
    const skips: RecordRow[] = [];
    const debt: RecordRow[] = [];
    for (const row of input.dispositions) {
      current.set(dispositionKey(row), { ...row, evidenceRecordIds: row.evidenceRecordIds ?? [] });
      if (row.deferral?.kind === "skip") {
        const skip = PromptOut.recordPromptOutSkip(world, {
          flowKey: FLOW_KEY,
          stepKey: row.deferral.stepKey ?? `minimal_viable_world:${row.dimensionKey}`,
          reason: row.substance
        });
        skips.push(skip);
      }
      if (row.deferral?.kind === "canon_debt") {
        const debtRecord = world.createCanonDebt({
          name: row.deferral.debtName,
          scope: `Minimal Viable World ${row.dimensionKey}`,
          assignee: "steward",
          body: row.substance
        });
        debt.push(debtRecord);
      }
    }
    const existingSkips = linkedCheckpointRecords(world, previousReport, (record) => record.recordTypeKey === "skip_record");
    const existingDebt = linkedCheckpointRecords(world, previousReport, (record) => record.recordTypeKey === "canon_debt");
    const existingProposals = linkedCheckpointRecords(world, previousReport, (record) => record.recordTypeKey === "canon_fact" && record.canonStatus === "proposed");
    const existingAdvisory = linkedCheckpointRecords(world, previousReport, (record) => record.recordTypeKey === "advisory_artifact");
    const report = createCheckpointReport(world, {
      dispositions: [...current.values()],
      skips: [...existingSkips, ...skips],
      debt: [...existingDebt, ...debt],
      proposals: existingProposals,
      advisoryArtifacts: existingAdvisory,
      previousReport
    });
    for (const row of input.dispositions) {
      for (const evidenceId of row.evidenceRecordIds ?? []) {
        world.createLinkIfMissing(report.id, evidenceId, "derived_from", `Minimal Viable World ${row.dimensionKey} evidence`);
      }
      if (row.protectedRecordId != null) {
        world.createLinkIfMissing(report.id, row.protectedRecordId, "preserves_boundary_for", "Minimal Viable World protected mystery disposition");
      }
    }
    for (const skip of [...existingSkips, ...skips]) {
      world.createLinkIfMissing(skip.id, report.id, "derived_from", "Checkpoint deferral skip belongs to this pass report");
    }
    for (const debtRecord of [...existingDebt, ...debt]) {
      world.createLinkIfMissing(report.id, debtRecord.id, "requires_follow_up", "Checkpoint deferral creates canon debt");
    }
    for (const proposal of existingProposals) {
      world.createLinkIfMissing(report.id, proposal.id, "derived_from", "Minimal Viable World checkpoint routed this proposal");
    }
    return {
      report: world.getRecord(report.id),
      dispositions: dispositionsForReport(world, report),
      skips: skips.map((record) => ({ record })),
      debt: debt.map((record) => ({ record })),
      readSideTrail: readSideTrail(report, acceptedSeedFacts(world)),
      closeReadiness: closeReadiness(world, report)
    };
  });
};

export const routeAdmissionProposal = (
  world: WorldFile,
  input: { reportId: number; seedRecordId?: number; title: string; body: string; truthLayer: string; advisoryRecordId?: number }
): { record: RecordRow; queue: AdmissionQueueRow[]; report: RecordRow; readSideTrail: ReturnType<typeof readSideTrail> } => {
  const previousReport = ensureCheckpointReport(world, input.reportId);
  if (!input.title.trim() || !input.body.trim() || !input.truthLayer.trim()) throw new Error("checkpoint proposal requires title, body, and truth layer");
  return world.atomicWrite(() => {
    const proposal = intakeProposedFact(world, {
      origin: "future-flow",
      candidate: { title: input.title, body: input.body, truthLayer: input.truthLayer, canonStatus: "proposed" },
      sourceLinks: [
        { recordId: previousReport.id, note: "Fact-shaped material routed from Minimal Viable World checkpoint" },
        ...(input.seedRecordId == null ? [] : [{ recordId: input.seedRecordId, note: "Checkpoint proposal is scoped to this admitted seed" }])
      ],
      provenanceFlowStep: "minimal_viable_world:admission-proposal"
    });
    const advisoryArtifacts = linkedCheckpointRecords(world, previousReport, (record) => record.recordTypeKey === "advisory_artifact");
    if (input.advisoryRecordId != null) {
      PromptOut.linkExplicitAdvisoryUse(world, proposal.record.id, input.advisoryRecordId, {
        derivedFromNote: "Checkpoint proposal used disposed advisory material",
        citationNote: "Disposed checkpoint advisory artifact consulted"
      });
      advisoryArtifacts.push(world.getRecord(input.advisoryRecordId));
    }
    const report = createCheckpointReport(world, {
      dispositions: dispositionsForReport(world, previousReport),
      skips: linkedCheckpointRecords(world, previousReport, (record) => record.recordTypeKey === "skip_record"),
      debt: linkedCheckpointRecords(world, previousReport, (record) => record.recordTypeKey === "canon_debt"),
      proposals: [
        ...linkedCheckpointRecords(world, previousReport, (record) => record.recordTypeKey === "canon_fact" && record.canonStatus === "proposed"),
        proposal.record
      ],
      advisoryArtifacts,
      previousReport
    });
    return {
      ...proposal,
      report: world.getRecord(report.id),
      readSideTrail: readSideTrail(report, acceptedSeedFacts(world))
    };
  });
};

export const skipPromptOut = (
  world: WorldFile,
  input: { stepKey: string; reason?: string; unresolved?: boolean; debtName?: string; admissionLevel?: string | null; workScale?: string | null }
): { record: RecordRow; debt: RecordRow | null; report: RecordRow; readSideTrail: ReturnType<typeof readSideTrail> } =>
  world.atomicWrite(() => {
    const previousReport = latestCheckpointReport(world) ?? createCheckpointReport(world);
    const skip = PromptOut.recordPromptOutSkip(world, {
      flowKey: FLOW_KEY,
      stepKey: input.stepKey,
      reason: input.reason,
      admissionLevel: input.admissionLevel,
      workScale: input.workScale
    });
    const debt = input.unresolved
      ? world.createCanonDebt({
        name: input.debtName?.trim() || "Minimal Viable World declined Prompt-out follow-up",
        scope: "Minimal Viable World Prompt-out",
        assignee: "steward",
        body: input.reason?.trim() || "Checkpoint Prompt-out was declined while follow-up pressure remains owed."
      })
      : null;
    const report = createCheckpointReport(world, {
      dispositions: dispositionsForReport(world, previousReport),
      skips: [
        ...linkedCheckpointRecords(world, previousReport, (record) => record.recordTypeKey === "skip_record"),
        skip
      ],
      debt: [
        ...linkedCheckpointRecords(world, previousReport, (record) => record.recordTypeKey === "canon_debt"),
        ...(debt ? [debt] : [])
      ],
      proposals: linkedCheckpointRecords(world, previousReport, (record) => record.recordTypeKey === "canon_fact" && record.canonStatus === "proposed"),
      advisoryArtifacts: linkedCheckpointRecords(world, previousReport, (record) => record.recordTypeKey === "advisory_artifact"),
      previousReport
    });
    return {
      record: skip,
      debt,
      report: world.getRecord(report.id),
      readSideTrail: readSideTrail(report, acceptedSeedFacts(world))
    };
  });

export const qaEcho = (world: WorldFile) => {
  const state = checkpointState(world).checkpoint;
  return {
    status: state.report ? "present" : "missing",
    route: CHECKPOINT_ROUTE,
    report: state.report,
    dispositions: state.dispositions,
    coverageSignalSummary: state.coverageSignals.wholeWorld,
    unresolvedDeferrals: state.unresolvedDeferrals,
    protectedMysteryEvidence: state.coverageSignals.admittedSeeds.flatMap((seed) => seed.dimensions.filter((dimension) => dimension.key === "mystery_boundary" && dimension.status === "protected")),
    openCanonDebt: state.openCanonDebt,
    admissionProposals: state.admissionProposals,
    advisoryArtifacts: state.advisoryArtifacts,
    readSideTrail: state.report ? readSideTrail(state.report, acceptedSeedFacts(world)) : [{ label: "Creation checkpoint", href: CHECKPOINT_ROUTE }]
  };
};

export const owedQueueCount = (world: WorldFile): number =>
  acceptedSeedFacts(world).length > 0 && closeReadiness(world, latestCheckpointReport(world)).status !== "ready" ? 1 : 0;

export const hasCheckpointReport = (world: WorldFile): boolean =>
  latestCheckpointReport(world) != null;
