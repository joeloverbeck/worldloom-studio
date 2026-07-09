import type { RecordRow, WorldFile } from "./world-file.js";

export type CreationCoverageDisposition = "unresolved" | "covered" | "deferred" | "out_of_scope";

export interface CreationCoverageValidationIssue {
  key: string;
  message: string;
}

export class CreationCoverageValidationError extends Error {
  validationErrors: CreationCoverageValidationIssue[];
  attemptedInput: unknown;

  constructor(message: string, validationErrors: CreationCoverageValidationIssue[], attemptedInput: unknown) {
    super(message);
    this.name = "CreationCoverageValidationError";
    this.validationErrors = validationErrors;
    this.attemptedInput = attemptedInput;
  }
}

export interface CreationCoverageConfirmationRow {
  label: string;
  sourceKernelContext?: string;
  required?: boolean;
}

export interface CreationCoverageConfirmInput {
  kernelRecordId: number;
  seedDecompositionReportId?: number | null;
  rows: CreationCoverageConfirmationRow[];
}

export interface CreationCoverageLinkInput {
  rowId: number;
  seedRecordIds: number[];
  seedDecompositionReportId?: number | null;
  expectedDisposition?: CreationCoverageDisposition;
  rationale?: string;
}

export interface CreationCoverageDispositionInput {
  rowId: number;
  rationale: string;
  expectedDisposition?: CreationCoverageDisposition;
}

export interface CreationCoverageRecordSummary {
  id: number;
  shortId: string;
  title: string;
  recordTypeKey: string;
  body: string;
  truthLayer: string | null;
  canonStatus: string | null;
}

export interface CreationCoverageLinkedSeed extends CreationCoverageRecordSummary {
  note: string;
}

export interface CreationCoverageRow {
  id: number;
  kernelRecordId: number;
  label: string;
  sourceKernelContext: string;
  required: boolean;
  disposition: CreationCoverageDisposition;
  dispositionRationale: string | null;
  outOfScopeRationale: string | null;
  seedDecompositionReport: CreationCoverageRecordSummary | null;
  linkedSeeds: CreationCoverageLinkedSeed[];
  debtRecord: CreationCoverageRecordSummary | null;
  actions: {
    link: { method: "POST"; href: "/api/flows/creation/coverage/link" };
    defer: { method: "POST"; href: "/api/flows/creation/coverage/defer" };
    outOfScope: { method: "POST"; href: "/api/flows/creation/coverage/out-of-scope" };
  };
}

export interface CreationCoverageInventory {
  kernel: CreationCoverageRecordSummary | null;
  state: {
    status: "missing_inventory" | "blocked" | "resolved";
    completionBlocked: boolean;
    summary: string;
    blockers: Array<{ key: string; label: string; message: string; requires: string }>;
  };
  createOrConfirmPath: {
    method: "POST";
    href: "/api/flows/creation/coverage";
    body: { kernelRecordId: number };
  } | null;
  rows: CreationCoverageRow[];
}

interface CoverageRowDb {
  id: number;
  kernel_record_id: number;
  seed_decomposition_report_id: number | null;
  label: string;
  source_kernel_context: string;
  required: number;
  disposition: CreationCoverageDisposition;
  disposition_rationale: string;
  debt_record_id: number | null;
  out_of_scope_rationale: string;
}

const summary = (record: RecordRow): CreationCoverageRecordSummary => ({
  id: record.id,
  shortId: record.shortId,
  title: record.title,
  recordTypeKey: record.recordTypeKey,
  body: record.body,
  truthLayer: record.truthLayer,
  canonStatus: record.canonStatus
});

const safeRecord = (world: WorldFile, id: number | null | undefined): RecordRow | null => {
  if (id == null) return null;
  try {
    return world.getRecord(id);
  } catch {
    return null;
  }
};

const rowToRecord = (row: Record<string, unknown>): RecordRow => ({
  id: Number(row.id),
  shortId: String(row.short_id),
  recordTypeKey: String(row.record_type_key),
  title: String(row.title),
  body: String(row.body ?? ""),
  truthLayer: row.truth_layer == null ? null : String(row.truth_layer),
  canonStatus: row.canon_status == null ? null : String(row.canon_status),
  createdAt: String(row.created_at),
  updatedAt: String(row.updated_at)
});

const latestKernelRecord = (world: WorldFile): RecordRow | null => {
  const flow = world.db.prepare(`
    SELECT kernel_record_id
    FROM flow_instances
    WHERE flow_key = 'creation'
      AND kernel_record_id IS NOT NULL
    ORDER BY id DESC
    LIMIT 1
  `).get() as { kernel_record_id: number } | undefined;
  if (flow) return safeRecord(world, flow.kernel_record_id);
  const row = world.db.prepare(`
    SELECT id
    FROM records
    WHERE record_type_key = 'world_kernel'
    ORDER BY id DESC
    LIMIT 1
  `).get() as { id: number } | undefined;
  return row ? safeRecord(world, row.id) : null;
};

const latestReportForKernel = (world: WorldFile, kernelRecordId: number): RecordRow | null => {
  const row = world.db.prepare(`
    SELECT DISTINCT report.id
    FROM records seed
    JOIN record_links kernel_link
      ON kernel_link.from_record_id = seed.id
      AND kernel_link.to_record_id = @kernelRecordId
      AND kernel_link.link_type_key = 'derived_from'
    JOIN record_links report_link
      ON report_link.from_record_id = seed.id
      AND report_link.link_type_key = 'derived_from'
    JOIN records report
      ON report.id = report_link.to_record_id
      AND report.record_type_key = 'seed_decomposition'
    WHERE seed.record_type_key = 'canon_fact'
    ORDER BY report.id DESC
    LIMIT 1
  `).get({ kernelRecordId }) as { id: number } | undefined;
  return row ? safeRecord(world, row.id) : null;
};

const parkedCreationSeedsForKernel = (world: WorldFile, kernelRecordId: number): RecordRow[] =>
  (world.db.prepare(`
    SELECT DISTINCT seed.*
    FROM records seed
    JOIN record_links kernel_link
      ON kernel_link.from_record_id = seed.id
      AND kernel_link.to_record_id = @kernelRecordId
      AND kernel_link.link_type_key = 'derived_from'
    JOIN record_links report_link
      ON report_link.from_record_id = seed.id
      AND report_link.link_type_key = 'derived_from'
    JOIN records report
      ON report.id = report_link.to_record_id
      AND report.record_type_key = 'seed_decomposition'
    WHERE seed.record_type_key = 'canon_fact'
      AND seed.canon_status = 'proposed'
    ORDER BY seed.id
  `).all({ kernelRecordId }) as Array<Record<string, unknown>>).map((row) => ({
    ...rowToRecord(row)
  }));

const coverageRows = (world: WorldFile, kernelRecordId: number): CoverageRowDb[] =>
  world.db.prepare(`
    SELECT *
    FROM creation_seed_family_coverage
    WHERE kernel_record_id = ?
    ORDER BY id
  `).all(kernelRecordId) as CoverageRowDb[];

const coverageRowById = (world: WorldFile, rowId: number): CoverageRowDb => {
  const row = world.db.prepare("SELECT * FROM creation_seed_family_coverage WHERE id = ?").get(rowId) as CoverageRowDb | undefined;
  if (!row) {
    throw new CreationCoverageValidationError("coverage row not found", [{ key: "rowId", message: "Coverage row not found." }], { rowId });
  }
  return row;
};

const linkedSeedsForRow = (world: WorldFile, rowId: number): CreationCoverageLinkedSeed[] =>
  (world.db.prepare(`
    SELECT seed.*, link.note
    FROM creation_seed_family_coverage_links link
    JOIN records seed ON seed.id = link.seed_record_id
    WHERE link.coverage_row_id = ?
    ORDER BY seed.id
  `).all(rowId) as Array<Record<string, unknown>>).map((row) => ({
    ...rowToRecord(row),
    note: String(row.note ?? "")
  }));

const toCoverageRow = (world: WorldFile, row: CoverageRowDb): CreationCoverageRow => ({
  id: Number(row.id),
  kernelRecordId: Number(row.kernel_record_id),
  label: row.label,
  sourceKernelContext: row.source_kernel_context,
  required: Number(row.required) === 1,
  disposition: row.disposition,
  dispositionRationale: row.disposition_rationale.trim() || null,
  outOfScopeRationale: row.out_of_scope_rationale.trim() || null,
  seedDecompositionReport: summaryOrNull(safeRecord(world, row.seed_decomposition_report_id)),
  linkedSeeds: linkedSeedsForRow(world, row.id),
  debtRecord: summaryOrNull(safeRecord(world, row.debt_record_id)),
  actions: {
    link: { method: "POST", href: "/api/flows/creation/coverage/link" },
    defer: { method: "POST", href: "/api/flows/creation/coverage/defer" },
    outOfScope: { method: "POST", href: "/api/flows/creation/coverage/out-of-scope" }
  }
});

const summaryOrNull = (record: RecordRow | null): CreationCoverageRecordSummary | null =>
  record ? summary(record) : null;

const stateForRows = (rows: CreationCoverageRow[]): CreationCoverageInventory["state"] => {
  if (rows.length === 0) {
    return {
      status: "missing_inventory",
      completionBlocked: true,
      summary: "Creation seed-family coverage inventory has not been created or confirmed.",
      blockers: [{
        key: "coverage_inventory",
        label: "Coverage inventory",
        message: "create or confirm Creation seed-family coverage rows before Admission handoff.",
        requires: "steward-confirmed seed-family coverage inventory"
      }]
    };
  }
  const unresolved = rows.filter((row) => row.required && row.disposition === "unresolved");
  if (unresolved.length) {
    return {
      status: "blocked",
      completionBlocked: true,
      summary: `${unresolved.length} required seed-family coverage row(s) remain unresolved.`,
      blockers: unresolved.map((row) => ({
        key: `coverage:${row.id}`,
        label: row.label,
        message: `${row.label} still needs disposition before Admission handoff.`,
        requires: "covered, deferred, or out of scope with rationale"
      }))
    };
  }
  return {
    status: "resolved",
    completionBlocked: false,
    summary: "Creation seed-family coverage is resolved for Admission handoff.",
    blockers: []
  };
};

export const creationCoverageInventory = (
  world: WorldFile,
  input: { kernelRecordId?: number | null } = {}
): CreationCoverageInventory => {
  const kernel = input.kernelRecordId == null ? latestKernelRecord(world) : safeRecord(world, input.kernelRecordId);
  if (!kernel) {
    return {
      kernel: null,
      state: {
        status: "missing_inventory",
        completionBlocked: true,
        summary: "No world kernel exists for Creation seed-family coverage.",
        blockers: [{
          key: "coverage_kernel",
          label: "World kernel",
          message: "Create the world kernel before confirming seed-family coverage.",
          requires: "world_kernel"
        }]
      },
      createOrConfirmPath: null,
      rows: []
    };
  }
  const rows = coverageRows(world, kernel.id).map((row) => toCoverageRow(world, row));
  return {
    kernel: summary(kernel),
    state: stateForRows(rows),
    createOrConfirmPath: {
      method: "POST",
      href: "/api/flows/creation/coverage",
      body: { kernelRecordId: kernel.id }
    },
    rows
  };
};

const assertKernel = (world: WorldFile, kernelRecordId: number): RecordRow => {
  const kernel = world.getRecord(kernelRecordId);
  if (kernel.recordTypeKey !== "world_kernel") {
    throw new CreationCoverageValidationError("coverage inventory requires a world kernel", [{ key: "kernelRecordId", message: "Coverage inventory must be attached to a world_kernel record." }], { kernelRecordId });
  }
  return kernel;
};

const assertReport = (world: WorldFile, reportId: number | null | undefined): RecordRow | null => {
  if (reportId == null) return null;
  const report = world.getRecord(reportId);
  if (report.recordTypeKey !== "seed_decomposition") {
    throw new CreationCoverageValidationError("coverage report must be a seed_decomposition record", [{ key: "seedDecompositionReportId", message: "Seed decomposition report id must reference a seed_decomposition record." }], { seedDecompositionReportId: reportId });
  }
  return report;
};

const assertExpectedDisposition = (
  row: CoverageRowDb,
  expectedDisposition: CreationCoverageDisposition | undefined,
  input: unknown
): void => {
  if (expectedDisposition && row.disposition !== expectedDisposition) {
    throw new CreationCoverageValidationError(
      "coverage row changed before this action",
      [{ key: "stale_row_identity", message: `Coverage row disposition is ${row.disposition}, not ${expectedDisposition}. Refresh the inventory before acting.` }],
      input
    );
  }
};

export const confirmCoverageRows = (world: WorldFile, input: CreationCoverageConfirmInput): CreationCoverageInventory =>
  world.atomicWrite(() => {
    assertKernel(world, input.kernelRecordId);
    const report = assertReport(world, input.seedDecompositionReportId);
    const validationErrors: CreationCoverageValidationIssue[] = [];
    if (!input.rows?.length) {
      validationErrors.push({ key: "rows", message: "At least one seed-family coverage row is required." });
    }
    input.rows?.forEach((row, index) => {
      if (!row.label?.trim()) validationErrors.push({ key: `rows[${index}].label`, message: "Coverage row label is required." });
    });
    if (validationErrors.length) throw new CreationCoverageValidationError("coverage inventory is invalid", validationErrors, input);
    const insert = world.db.prepare(`
      INSERT INTO creation_seed_family_coverage (
        kernel_record_id,
        seed_decomposition_report_id,
        label,
        source_kernel_context,
        required,
        disposition,
        flow_step
      )
      VALUES (@kernelRecordId, @seedDecompositionReportId, @label, @sourceKernelContext, @required, 'unresolved', 'decomposition:coverage')
      ON CONFLICT(kernel_record_id, label) DO UPDATE SET
        seed_decomposition_report_id = COALESCE(excluded.seed_decomposition_report_id, creation_seed_family_coverage.seed_decomposition_report_id),
        source_kernel_context = excluded.source_kernel_context,
        required = excluded.required
    `);
    for (const row of input.rows) {
      insert.run({
        kernelRecordId: input.kernelRecordId,
        seedDecompositionReportId: report?.id ?? latestReportForKernel(world, input.kernelRecordId)?.id ?? null,
        label: row.label.trim(),
        sourceKernelContext: row.sourceKernelContext?.trim() ?? "",
        required: row.required === false ? 0 : 1
      });
    }
    refreshCreationCoverageFlowState(world, input.kernelRecordId);
    return creationCoverageInventory(world, { kernelRecordId: input.kernelRecordId });
  });

const seedBelongsToKernel = (world: WorldFile, seedRecordId: number, kernelRecordId: number): boolean => {
  const row = world.db.prepare(`
    SELECT 1
    FROM record_links kernel_link
    JOIN record_links report_link
      ON report_link.from_record_id = kernel_link.from_record_id
      AND report_link.link_type_key = 'derived_from'
    JOIN records report
      ON report.id = report_link.to_record_id
      AND report.record_type_key = 'seed_decomposition'
    WHERE kernel_link.from_record_id = @seedRecordId
      AND kernel_link.to_record_id = @kernelRecordId
      AND kernel_link.link_type_key = 'derived_from'
    LIMIT 1
  `).get({ seedRecordId, kernelRecordId });
  return Boolean(row);
};

export const linkCoverageRowToSeeds = (world: WorldFile, input: CreationCoverageLinkInput): CreationCoverageInventory =>
  world.atomicWrite(() => {
    const row = coverageRowById(world, input.rowId);
    assertExpectedDisposition(row, input.expectedDisposition, input);
    const report = assertReport(world, input.seedDecompositionReportId ?? row.seed_decomposition_report_id);
    const validationErrors: CreationCoverageValidationIssue[] = [];
    if (!input.seedRecordIds?.length) {
      validationErrors.push({ key: "seedRecordIds", message: "At least one parked proposed seed record is required." });
    }
    for (const seedRecordId of input.seedRecordIds ?? []) {
      const seed = safeRecord(world, seedRecordId);
      if (!seed || seed.recordTypeKey !== "canon_fact" || seed.canonStatus !== "proposed" || !seedBelongsToKernel(world, seed.id, row.kernel_record_id)) {
        validationErrors.push({ key: "seedRecordIds", message: "Coverage links can only target parked proposed Creation seed records for this kernel." });
        break;
      }
    }
    if (validationErrors.length) throw new CreationCoverageValidationError("coverage link is invalid", validationErrors, input);
    const insert = world.db.prepare(`
      INSERT OR IGNORE INTO creation_seed_family_coverage_links (coverage_row_id, seed_record_id, seed_decomposition_report_id, note)
      VALUES (?, ?, ?, ?)
    `);
    for (const seedRecordId of input.seedRecordIds) {
      insert.run(row.id, seedRecordId, report?.id ?? row.seed_decomposition_report_id, input.rationale?.trim() ?? "Linked parked proposed seed covers this family.");
    }
    world.db.prepare(`
      UPDATE creation_seed_family_coverage
      SET disposition = 'covered',
          disposition_rationale = @rationale,
          seed_decomposition_report_id = COALESCE(@reportId, seed_decomposition_report_id)
      WHERE id = @rowId
    `).run({
      rowId: row.id,
      rationale: input.rationale?.trim() ?? "Linked parked proposed seed covers this family.",
      reportId: report?.id ?? null
    });
    refreshCreationCoverageFlowState(world, row.kernel_record_id);
    return creationCoverageInventory(world, { kernelRecordId: row.kernel_record_id });
  });

export const deferCoverageRow = (world: WorldFile, input: CreationCoverageDispositionInput): CreationCoverageInventory =>
  world.atomicWrite(() => {
    const row = coverageRowById(world, input.rowId);
    assertExpectedDisposition(row, input.expectedDisposition, input);
    if (!input.rationale?.trim()) {
      throw new CreationCoverageValidationError("coverage deferral requires rationale", [{ key: "rationale", message: "Deferring seed-family coverage requires steward rationale." }], input);
    }
    const kernel = world.getRecord(row.kernel_record_id);
    const debt = row.debt_record_id == null
      ? world.createCanonDebt({
          name: `Creation seed-family coverage: ${row.label}`,
          scope: "creation seed-family coverage",
          assignee: "steward",
          body: [
            `Kernel: ${kernel.shortId} ${kernel.title}`,
            `Coverage row: ${row.label}`,
            `Rationale: ${input.rationale.trim()}`
          ].join("\n")
        })
      : world.getRecord(row.debt_record_id);
    world.createLinkIfMissing(debt.id, kernel.id, "derived_from", "Creation coverage deferral preserves kernel provenance");
    world.db.prepare(`
      UPDATE creation_seed_family_coverage
      SET disposition = 'deferred',
          disposition_rationale = ?,
          debt_record_id = ?
      WHERE id = ?
    `).run(input.rationale.trim(), debt.id, row.id);
    refreshCreationCoverageFlowState(world, row.kernel_record_id);
    return creationCoverageInventory(world, { kernelRecordId: row.kernel_record_id });
  });

export const markCoverageRowOutOfScope = (world: WorldFile, input: CreationCoverageDispositionInput): CreationCoverageInventory =>
  world.atomicWrite(() => {
    const row = coverageRowById(world, input.rowId);
    assertExpectedDisposition(row, input.expectedDisposition, input);
    if (!input.rationale?.trim()) {
      throw new CreationCoverageValidationError("out-of-scope coverage requires rationale", [{ key: "rationale", message: "Marking seed-family coverage out of scope requires steward rationale." }], input);
    }
    world.db.prepare(`
      UPDATE creation_seed_family_coverage
      SET disposition = 'out_of_scope',
          disposition_rationale = ?,
          out_of_scope_rationale = ?
      WHERE id = ?
    `).run(input.rationale.trim(), input.rationale.trim(), row.id);
    refreshCreationCoverageFlowState(world, row.kernel_record_id);
    return creationCoverageInventory(world, { kernelRecordId: row.kernel_record_id });
  });

export const hasParkedCreationSeeds = (world: WorldFile, kernelRecordId?: number | null): boolean => {
  const kernel = kernelRecordId == null ? latestKernelRecord(world) : safeRecord(world, kernelRecordId);
  return kernel ? parkedCreationSeedsForKernel(world, kernel.id).length > 0 : false;
};

export const latestCreationKernelRecord = latestKernelRecord;

export const refreshCreationCoverageFlowState = (world: WorldFile, kernelRecordId: number): void => {
  const flow = world.db.prepare(`
    SELECT *
    FROM flow_instances
    WHERE flow_key = 'creation'
      AND kernel_record_id = ?
    ORDER BY id DESC
    LIMIT 1
  `).get(kernelRecordId) as Record<string, unknown> | undefined;
  if (!flow || !hasParkedCreationSeeds(world, kernelRecordId)) return;
  const inventory = creationCoverageInventory(world, { kernelRecordId });
  const flowId = Number(flow.id);
  if (inventory.state.completionBlocked) {
    world.updateFlowInstance(flowId, { currentStep: "decomposition:coverage", state: "in_progress" });
    return;
  }
  const currentStep = String(flow.current_step);
  if (currentStep.startsWith("decomposition")) {
    world.updateFlowInstance(flowId, { currentStep: "decomposition:complete", state: "complete" });
  }
};

export const coverageContextForPrompt = (
  world: WorldFile,
  input: { kernelRecordId?: number | null; seedDecompositionReportId?: number | null } = {}
): {
  lines: string[];
  sourceDocuments: Array<{ source: string; content: string }>;
  sourceManifest: string[];
  omissions: string[];
} => {
  const kernel = input.kernelRecordId == null ? latestKernelRecord(world) : safeRecord(world, input.kernelRecordId);
  if (!kernel) {
    const omission = "Creation seed-family coverage inventory omitted: no linked world kernel was found.";
    return { lines: [omission], sourceDocuments: [], sourceManifest: [`Omission: ${omission}`], omissions: [omission] };
  }
  const inventory = creationCoverageInventory(world, { kernelRecordId: kernel.id });
  if (inventory.rows.length === 0) {
    const omission = "Creation seed-family coverage inventory omitted: inventory has not been created or confirmed yet.";
    return {
      lines: [
        "Creation seed-family coverage inventory: missing",
        omission
      ],
      sourceDocuments: [],
      sourceManifest: [`Omission: ${omission}`],
      omissions: [omission]
    };
  }
  const rowLines = inventory.rows.flatMap((row) => [
    `Coverage row: ${row.label}`,
    `Required: ${row.required ? "yes" : "no"}`,
    `Disposition: ${row.disposition}`,
    `Source kernel context: ${row.sourceKernelContext || "(empty)"}`,
    row.dispositionRationale ? `Disposition rationale: ${row.dispositionRationale}` : "",
    row.outOfScopeRationale ? `Out-of-scope rationale: ${row.outOfScopeRationale}` : "",
    row.debtRecord ? `Deferred debt: ${row.debtRecord.shortId} ${row.debtRecord.title}` : "",
    ...row.linkedSeeds.flatMap((seed) => [
      `Linked proposed seed ${seed.shortId}: ${seed.title}`,
      `Truth layer: ${seed.truthLayer ?? "unset"}`,
      `Canon status: ${seed.canonStatus ?? "unset"}`,
      seed.body
    ])
  ].filter(Boolean));
  return {
    lines: [
      "Creation seed-family coverage inventory",
      `Coverage state: ${inventory.state.status}`,
      inventory.state.summary,
      ...rowLines
    ],
    sourceDocuments: [{
      source: "creation_seed_family_coverage_inventory",
      content: [
        `Source record: Creation coverage inventory for ${kernel.shortId} ${kernel.title}`,
        ...rowLines
      ].join("\n")
    }],
    sourceManifest: [
      "Source record: Creation coverage inventory",
      ...inventory.rows.map((row) => `Creation coverage row: ${row.label} (${row.disposition})`)
    ],
    omissions: inventory.state.completionBlocked
      ? ["Creation seed-family coverage has unresolved rows; do not treat the decomposition as handed to Admission."]
      : []
  };
};
