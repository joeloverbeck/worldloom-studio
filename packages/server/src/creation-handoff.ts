import { methodCard, methodCardDoctrineSlots } from "./method-cards.js";
import type { LinkRow, RecordRow, SectionRow, WorldFile } from "./world-file.js";

export interface HandoffRecordSummary {
  id: number;
  shortId: string;
  title: string;
  recordTypeKey: string;
  body: string;
  truthLayer: string | null;
  canonStatus: string | null;
}

export interface HandoffSourceLink {
  label: string;
  href: string;
  recordId: number;
  shortId: string;
  title: string;
  recordTypeKey: string;
  linkTypeKey: string;
  note: string;
}

export interface HandoffCorrectionAction {
  key: string;
  label: string;
  available: boolean;
  blocker: string | null;
  preview: string;
}

export interface HandoffCorrectionContract {
  availability: "correctable" | "late_admission" | "not_current";
  directMutationBlocked: boolean;
  originalSeedWording: string;
  correctionContext: string;
  actions: HandoffCorrectionAction[];
  writeIntent: {
    willWrite: string[];
    willLink: string[];
    willQueue: string[];
    willLeaveUntouched: string[];
  };
  nextOrResumeState: {
    currentStep: string;
    nextStep: string;
    safeExit: string;
  };
}

export interface HandoffParkedSeed extends HandoffRecordSummary {
  sourceLinks: HandoffSourceLink[];
  correction: HandoffCorrectionContract;
}

export interface CreationHandoffContext {
  seedDecompositionReport: HandoffRecordSummary | null;
  reportSections: SectionRow[];
  parkedSeeds: HandoffParkedSeed[];
  supportingKernel: HandoffRecordSummary | null;
  kernelSections: SectionRow[];
  granularityRationale: string | null;
  admissionIntent: string | null;
  admissionQueueRoute: "/api/admission/queue";
  currentStatus: "proposed" | "not parked";
  nextStep: "Admission queue selection" | "complete seed decomposition";
  sourceLinks: HandoffSourceLink[];
  doctrineAtPointOfUse: string[];
}

export const CREATION_HANDOFF_DOCTRINE = methodCardDoctrineSlots(methodCard("creation.seed-decomposition"));

const toSummary = (record: RecordRow): HandoffRecordSummary => ({
  id: record.id,
  shortId: record.shortId,
  title: record.title,
  recordTypeKey: record.recordTypeKey,
  body: record.body,
  truthLayer: record.truthLayer,
  canonStatus: record.canonStatus
});

const safeRecord = (worldFile: WorldFile, recordId: number): RecordRow | null => {
  try {
    return worldFile.getRecord(recordId);
  } catch {
    return null;
  }
};

export const sourceLinksForRecord = (worldFile: WorldFile, recordId: number): HandoffSourceLink[] =>
  worldFile.listLinks(recordId)
    .filter((link) => link.fromRecordId === recordId && link.linkTypeKey === "derived_from")
    .flatMap((link) => {
      const target = safeRecord(worldFile, link.toRecordId);
      if (!target) return [];
      return [{
        label: `${target.recordTypeKey === "world_kernel" ? "Kernel" : target.recordTypeKey === "seed_decomposition" ? "Seed decomposition report" : "Source record"} ${target.shortId}: ${target.title}`,
        href: `/api/canon-workbench/records/${target.id}`,
        recordId: target.id,
        shortId: target.shortId,
        title: target.title,
        recordTypeKey: target.recordTypeKey,
        linkTypeKey: link.linkTypeKey,
        note: link.note
      }];
    });

const admissionWorkStarted = (worldFile: WorldFile, seed: RecordRow): boolean => {
  if (seed.canonStatus === "under review") return true;
  if (worldFile.listFacets(seed.id).some((facet) => facet.vocabulary === "admission_level" || facet.vocabulary === "work_scale")) return true;
  const row = worldFile.db.prepare(`
    SELECT 1
    FROM flow_instances
    WHERE flow_key = 'admission'
      AND state = 'in_progress'
      AND current_step LIKE ?
    LIMIT 1
  `).get(`record:${seed.id}:%`);
  return Boolean(row);
};

export const correctionContractForSeed = (worldFile: WorldFile, seed: RecordRow): HandoffCorrectionContract => {
  const late = admissionWorkStarted(worldFile, seed);
  const correctable = seed.recordTypeKey === "canon_fact" && seed.canonStatus === "proposed" && !late;
  if (late) {
    return {
      availability: "late_admission",
      directMutationBlocked: true,
      originalSeedWording: seed.body,
      correctionContext: "Admission work has begun; Creation cannot directly mutate the in-flight proposed fact.",
      actions: [
        {
          key: "superseding",
          label: "Superseding proposal",
          available: true,
          blocker: null,
          preview: "Route a superseding proposed fact without changing the in-flight Admission record."
        },
        {
          key: "re_proposal",
          label: "Re-proposal",
          available: true,
          blocker: null,
          preview: "Create a new proposed fact for later Admission handling."
        },
        {
          key: "admission_facing_note",
          label: "Admission-facing note",
          available: true,
          blocker: null,
          preview: "Carry caution into Admission without changing canon standing."
        }
      ],
      writeIntent: {
        willWrite: ["late-correction context only if the steward chooses an Admission-facing route"],
        willLink: ["in-flight Admission seed remains the governed target"],
        willQueue: ["new proposals must be routed separately"],
        willLeaveUntouched: ["Creation does not mutate an in-flight Admission record"]
      },
      nextOrResumeState: {
        currentStep: "decomposition:complete",
        nextStep: "continue in Admission or route a superseding proposal",
        safeExit: "Return to Admission; the Creation handoff keeps the late-correction reason visible."
      }
    };
  }
  if (!correctable) {
    return {
      availability: "not_current",
      directMutationBlocked: true,
      originalSeedWording: seed.body,
      correctionContext: "This parked seed is no longer a current proposed seed before Admission.",
      actions: [
        {
          key: "read_history",
          label: "Read correction history",
          available: true,
          blocker: null,
          preview: "Review the original wording, correction links, and read-side trail."
        }
      ],
      writeIntent: {
        willWrite: [],
        willLink: [],
        willQueue: [],
        willLeaveUntouched: ["non-current seed wording and correction history remain read-only from Creation"]
      },
      nextOrResumeState: {
        currentStep: "decomposition:complete",
        nextStep: "review corrected proposed facts or Admission queue",
        safeExit: "Return to the Creation handoff or read-side trail without mutating this seed."
      }
    };
  }
  return {
    availability: "correctable",
    directMutationBlocked: false,
    originalSeedWording: seed.body,
    correctionContext: "Creation can repair this proposed seed before Admission work begins.",
    actions: [
      {
        key: "split",
        label: "Split into sibling proposed facts",
        available: true,
        blocker: null,
        preview: "Write steward-authored sibling canon_fact records at proposed and preserve the original seed wording."
      },
      {
        key: "retract_and_rewrite",
        label: "Retract and rewrite",
        available: true,
        blocker: null,
        preview: "Mark the original proposed seed no longer current and write replacement wording at proposed."
      },
      {
        key: "replace",
        label: "Replace with corrected proposed fact",
        available: true,
        blocker: null,
        preview: "Route a corrected proposed fact and link it as superseding the original parked seed."
      },
      {
        key: "admission_narrowing_note",
        label: "Carry Admission narrowing note",
        available: true,
        blocker: null,
        preview: "Record steward-authored caution for Admission intake without changing canon standing."
      }
    ],
    writeIntent: {
      willWrite: ["correction context report", "corrected canon_fact records at proposed"],
      willLink: ["original parked seed", "seed-decomposition report", "world kernel", "correction context"],
      willQueue: ["corrected proposed facts remain visible in the Admission queue"],
      willLeaveUntouched: ["Creation does not admit canon or assign Admission severity", "pasted advisory material is not parsed into facts"]
    },
    nextOrResumeState: {
      currentStep: "decomposition:complete",
      nextStep: "repair parked seed before Admission",
      safeExit: "Safe exit keeps the Creation handoff, original wording, entered correction material, and Admission route visible."
    }
  };
};

const sectionBody = (sections: SectionRow[], heading: string): string | null =>
  sections.find((section) => section.heading === heading)?.body.trim() || null;

const admissionIntentFrom = (sections: SectionRow[]): string | null => {
  const thinStart = sectionBody(sections, "Thin-start boundary");
  if (!thinStart) return null;
  const line = thinStart.split(/\r?\n/).find((item) => item.trim().startsWith("Admission intent:"));
  return line?.replace("Admission intent:", "").trim() || null;
};

const incomingDerivedLinks = (worldFile: WorldFile, recordId: number): LinkRow[] =>
  worldFile.listLinks(recordId).filter((link) => link.toRecordId === recordId && link.linkTypeKey === "derived_from");

const seedRecordsForReport = (worldFile: WorldFile, reportId: number): RecordRow[] =>
  incomingDerivedLinks(worldFile, reportId)
    .flatMap((link) => {
      const record = safeRecord(worldFile, link.fromRecordId);
      return record?.recordTypeKey === "canon_fact" ? [record] : [];
    })
    .sort((left, right) => left.id - right.id);

const latestReportForKernel = (worldFile: WorldFile, kernelRecordId: number): RecordRow | null => {
  const reports = new Map<number, RecordRow>();
  for (const link of incomingDerivedLinks(worldFile, kernelRecordId)) {
    const seed = safeRecord(worldFile, link.fromRecordId);
    if (seed?.recordTypeKey !== "canon_fact") continue;
    for (const seedLink of sourceLinksForRecord(worldFile, seed.id)) {
      if (seedLink.recordTypeKey !== "seed_decomposition") continue;
      const report = safeRecord(worldFile, seedLink.recordId);
      if (report) reports.set(report.id, report);
    }
  }
  return [...reports.values()].sort((left, right) => right.id - left.id)[0] ?? null;
};

const kernelForReport = (worldFile: WorldFile, report: RecordRow, seeds: RecordRow[]): RecordRow | null => {
  for (const seed of seeds) {
    for (const link of sourceLinksForRecord(worldFile, seed.id)) {
      if (link.recordTypeKey === "world_kernel") return safeRecord(worldFile, link.recordId);
    }
  }
  const sourceText = sectionBody(worldFile.listSections(report.id), "Kernel source");
  if (!sourceText) return null;
  return worldFile.listRecords().find((record) => record.recordTypeKey === "world_kernel" && sourceText.includes(record.shortId)) ?? null;
};

export const creationHandoffContext = (
  worldFile: WorldFile,
  kernel: RecordRow | null,
  output: { report?: RecordRow; records?: RecordRow[] } = {}
): CreationHandoffContext => {
  const report = output.report ?? (kernel ? latestReportForKernel(worldFile, kernel.id) ?? undefined : undefined);
  const records = output.records ?? (report ? seedRecordsForReport(worldFile, report.id) : []);
  const supportingKernel = kernel ?? (report ? kernelForReport(worldFile, report, records) : null);
  const reportSections = report ? worldFile.listSections(report.id) : [];
  const parkedSeeds = records.map((record) => ({
    ...toSummary(record),
    sourceLinks: sourceLinksForRecord(worldFile, record.id),
    correction: correctionContractForSeed(worldFile, record)
  }));
  const reportLink = report
    ? [{
        label: `Seed decomposition report ${report.shortId}: ${report.title}`,
        href: `/api/canon-workbench/records/${report.id}`,
        recordId: report.id,
        shortId: report.shortId,
        title: report.title,
        recordTypeKey: report.recordTypeKey,
        linkTypeKey: "derived_from",
        note: "Creation handoff report"
      }]
    : [];
  const kernelLink = supportingKernel
    ? [{
        label: `Kernel ${supportingKernel.shortId}: ${supportingKernel.title}`,
        href: `/api/canon-workbench/records/${supportingKernel.id}`,
        recordId: supportingKernel.id,
        shortId: supportingKernel.shortId,
        title: supportingKernel.title,
        recordTypeKey: supportingKernel.recordTypeKey,
        linkTypeKey: "derived_from",
        note: "Creation handoff kernel"
      }]
    : [];
  return {
    seedDecompositionReport: report ? toSummary(report) : null,
    reportSections,
    parkedSeeds,
    supportingKernel: supportingKernel ? toSummary(supportingKernel) : null,
    kernelSections: supportingKernel ? worldFile.listSections(supportingKernel.id) : [],
    granularityRationale: sectionBody(reportSections, "Granularity decisions"),
    admissionIntent: admissionIntentFrom(reportSections),
    admissionQueueRoute: "/api/admission/queue",
    currentStatus: parkedSeeds.length > 0 ? "proposed" : "not parked",
    nextStep: parkedSeeds.length > 0 ? "Admission queue selection" : "complete seed decomposition",
    sourceLinks: [
      ...kernelLink,
      ...reportLink,
      ...parkedSeeds.flatMap((seed) => seed.sourceLinks)
    ],
    doctrineAtPointOfUse: CREATION_HANDOFF_DOCTRINE
  };
};

export const resolveCreationDecompositionHandoff = (
  worldFile: WorldFile,
  recordId?: number
): CreationHandoffContext => {
  if (recordId == null) {
    throw new Error("decomposition prompt requires a seed-decomposition report and parked seeds");
  }
  const selected = worldFile.getRecord(recordId);
  const report = selected.recordTypeKey === "seed_decomposition"
    ? selected
    : selected.recordTypeKey === "world_kernel"
      ? latestReportForKernel(worldFile, selected.id)
      : sourceLinksForRecord(worldFile, selected.id)
        .map((link) => safeRecord(worldFile, link.recordId))
        .find((record) => record?.recordTypeKey === "seed_decomposition") ?? null;
  if (!report) {
    throw new Error("decomposition prompt requires a seed-decomposition report and parked seeds");
  }
  const seeds = seedRecordsForReport(worldFile, report.id);
  if (!seeds.length) {
    throw new Error("decomposition prompt requires a seed-decomposition report and parked seeds");
  }
  return creationHandoffContext(worldFile, kernelForReport(worldFile, report, seeds), { report, records: seeds });
};
