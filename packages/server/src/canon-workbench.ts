import type { WorldFile } from "./world-file.js";

type DbRow = Record<string, unknown>;

export interface CurrentCanonFilters {
  recordTypes?: string[];
  truthLayers?: string[];
  canonStatuses?: string[];
  consequenceModes?: string[];
  continuityScope?: string;
  openCanonDebt?: boolean;
  q?: string;
  branchRelevant?: boolean;
}

export interface RecordSummary {
  id: number;
  shortId: string;
  recordTypeKey: string;
  recordTypeLabel: string;
  mutationRegime: "card" | "report";
  title: string;
  body: string;
  truthLayer: string;
  canonStatus: string;
  continuityScope: string;
  createdAt: string;
  updatedAt: string;
}

interface FacetSummary {
  id: number;
  recordId: number;
  vocabulary: string;
  term: string;
  position: number;
}

interface SectionSummary {
  id: number;
  recordId: number;
  heading: string;
  body: string;
  position: number;
}

interface LinkSummary {
  id: number;
  fromRecordId: number;
  toRecordId: number;
  linkTypeKey: string;
  note: string;
  createdAt: string;
}

interface RecordHistorySummary {
  id: number;
  recordId: number;
  sequence: number;
  retiredTitle: string;
  retiredBody: string;
  retiredAt: string;
  retiringRecordId: number | null;
}

interface SectionHistorySummary {
  id: number;
  sectionId: number;
  recordId: number;
  sequence: number;
  retiredHeading: string;
  retiredBody: string;
  retiredPosition: number;
  retiredAt: string;
}

interface AdvisoryDispositionSummary {
  id: number;
  advisoryRecordId: number;
  disposition: string;
  note: string;
  standingRuling: boolean;
  createdAt: string;
}

const DEFAULT_CURRENT_STATUSES = ["accepted", "accepted with constraints", "localized", "contested"];
const EXPLICITLY_FILTERABLE_STATUSES = ["proposed", "under review", "quarantined", "superseded", "deprecated", "rejected", "branch-only"];
const CURRENT_STANDING_STATUSES = new Set([...DEFAULT_CURRENT_STATUSES, "branch-only"]);

const stringValue = (row: DbRow, key: string): string => String(row[key] ?? "");
const nullableNumber = (row: DbRow, key: string): number | null => row[key] == null ? null : Number(row[key]);

const listRecordsWithMeta = (world: WorldFile): RecordSummary[] =>
  world.db.prepare(`
    SELECT
      r.id,
      r.short_id AS shortId,
      r.record_type_key AS recordTypeKey,
      rt.label AS recordTypeLabel,
      rt.mutation_regime AS mutationRegime,
      r.title,
      r.body,
      r.truth_layer AS truthLayer,
      r.canon_status AS canonStatus,
      cs.name AS continuityScope,
      r.created_at AS createdAt,
      r.updated_at AS updatedAt
    FROM records r
    JOIN record_types rt ON rt.key = r.record_type_key
    JOIN continuity_scopes cs ON cs.id = r.continuity_scope_id
    ORDER BY r.updated_at DESC, r.id DESC
  `).all().map((row) => {
    const record = row as DbRow;
    return {
      id: Number(record.id),
      shortId: stringValue(record, "shortId"),
      recordTypeKey: stringValue(record, "recordTypeKey"),
      recordTypeLabel: stringValue(record, "recordTypeLabel"),
      mutationRegime: stringValue(record, "mutationRegime") as "card" | "report",
      title: stringValue(record, "title"),
      body: stringValue(record, "body"),
      truthLayer: stringValue(record, "truthLayer"),
      canonStatus: stringValue(record, "canonStatus"),
      continuityScope: stringValue(record, "continuityScope"),
      createdAt: stringValue(record, "createdAt"),
      updatedAt: stringValue(record, "updatedAt")
    };
  });

const listFacets = (world: WorldFile): FacetSummary[] =>
  world.db.prepare(`
    SELECT id, record_id AS recordId, vocabulary, term, position
    FROM record_facets
    ORDER BY record_id, vocabulary, position, id
  `).all().map((row) => {
    const facet = row as DbRow;
    return {
      id: Number(facet.id),
      recordId: Number(facet.recordId),
      vocabulary: stringValue(facet, "vocabulary"),
      term: stringValue(facet, "term"),
      position: Number(facet.position)
    };
  });

const listSections = (world: WorldFile): SectionSummary[] =>
  world.db.prepare(`
    SELECT id, record_id AS recordId, heading, body, position
    FROM record_sections
    ORDER BY record_id, position, id
  `).all().map((row) => {
    const section = row as DbRow;
    return {
      id: Number(section.id),
      recordId: Number(section.recordId),
      heading: stringValue(section, "heading"),
      body: stringValue(section, "body"),
      position: Number(section.position)
    };
  });

const listLinks = (world: WorldFile): LinkSummary[] =>
  world.db.prepare(`
    SELECT id, from_record_id AS fromRecordId, to_record_id AS toRecordId, link_type_key AS linkTypeKey, note, created_at AS createdAt
    FROM record_links
    ORDER BY id
  `).all().map((row) => {
    const link = row as DbRow;
    return {
      id: Number(link.id),
      fromRecordId: Number(link.fromRecordId),
      toRecordId: Number(link.toRecordId),
      linkTypeKey: stringValue(link, "linkTypeKey"),
      note: stringValue(link, "note"),
      createdAt: stringValue(link, "createdAt")
    };
  });

const listRecordHistory = (world: WorldFile): RecordHistorySummary[] =>
  world.db.prepare(`
    SELECT
      id,
      record_id AS recordId,
      sequence,
      retired_title AS retiredTitle,
      retired_body AS retiredBody,
      retired_at AS retiredAt,
      retiring_record_id AS retiringRecordId
    FROM record_history
    ORDER BY record_id, sequence, id
  `).all().map((row) => {
    const history = row as DbRow;
    return {
      id: Number(history.id),
      recordId: Number(history.recordId),
      sequence: Number(history.sequence),
      retiredTitle: stringValue(history, "retiredTitle"),
      retiredBody: stringValue(history, "retiredBody"),
      retiredAt: stringValue(history, "retiredAt"),
      retiringRecordId: nullableNumber(history, "retiringRecordId")
    };
  });

const listSectionHistory = (world: WorldFile): SectionHistorySummary[] =>
  world.db.prepare(`
    SELECT
      id,
      section_id AS sectionId,
      record_id AS recordId,
      sequence,
      retired_heading AS retiredHeading,
      retired_body AS retiredBody,
      retired_position AS retiredPosition,
      retired_at AS retiredAt
    FROM record_section_history
    ORDER BY record_id, section_id, sequence, id
  `).all().map((row) => {
    const history = row as DbRow;
    return {
      id: Number(history.id),
      sectionId: Number(history.sectionId),
      recordId: Number(history.recordId),
      sequence: Number(history.sequence),
      retiredHeading: stringValue(history, "retiredHeading"),
      retiredBody: stringValue(history, "retiredBody"),
      retiredPosition: Number(history.retiredPosition),
      retiredAt: stringValue(history, "retiredAt")
    };
  });

const listAdvisoryDispositions = (world: WorldFile): AdvisoryDispositionSummary[] =>
  world.db.prepare(`
    SELECT
      id,
      advisory_record_id AS advisoryRecordId,
      disposition,
      note,
      standing_ruling AS standingRuling,
      created_at AS createdAt
    FROM advisory_dispositions
    ORDER BY id
  `).all().map((row) => {
    const disposition = row as DbRow;
    return {
      id: Number(disposition.id),
      advisoryRecordId: Number(disposition.advisoryRecordId),
      disposition: stringValue(disposition, "disposition"),
      note: stringValue(disposition, "note"),
      standingRuling: Number(disposition.standingRuling) === 1,
      createdAt: stringValue(disposition, "createdAt")
    };
  });

const listJurisdictionEvents = (world: WorldFile) =>
  world.db.prepare(`
    SELECT
      id,
      record_id AS recordId,
      origin,
      admission_decision_operation AS admissionDecisionOperation,
      repair_operation AS repairOperation,
      created_at AS createdAt
    FROM jurisdiction_events
    ORDER BY id
  `).all().map((row) => {
    const event = row as DbRow;
    return {
      id: Number(event.id),
      recordId: Number(event.recordId),
      origin: stringValue(event, "origin"),
      admissionDecisionOperation: event.admissionDecisionOperation == null ? null : stringValue(event, "admissionDecisionOperation"),
      repairOperation: event.repairOperation == null ? null : stringValue(event, "repairOperation"),
      createdAt: stringValue(event, "createdAt")
    };
  });

const byRecordId = <T extends { recordId: number }>(rows: T[]): Map<number, T[]> => {
  const grouped = new Map<number, T[]>();
  for (const row of rows) {
    grouped.set(row.recordId, [...(grouped.get(row.recordId) ?? []), row]);
  }
  return grouped;
};

const unique = <T>(values: T[]): T[] => [...new Set(values)];

const touches = (link: LinkSummary, recordId: number): boolean => link.fromRecordId === recordId || link.toRecordId === recordId;

const relatedIdsFor = (links: LinkSummary[], recordId: number): Set<number> => {
  const ids = new Set<number>([recordId]);
  for (const link of links) {
    if (link.fromRecordId === recordId) ids.add(link.toRecordId);
    if (link.toRecordId === recordId) ids.add(link.fromRecordId);
  }
  return ids;
};

const recordSlim = (record: RecordSummary) => ({
  id: record.id,
  shortId: record.shortId,
  title: record.title,
  recordTypeKey: record.recordTypeKey,
  recordTypeLabel: record.recordTypeLabel,
  mutationRegime: record.mutationRegime,
  truthLayer: record.truthLayer,
  canonStatus: record.canonStatus,
  continuityScope: record.continuityScope
});

const linkWithRecords = (link: LinkSummary, recordsById: Map<number, RecordSummary>) => ({
  id: link.id,
  fromRecordId: link.fromRecordId,
  toRecordId: link.toRecordId,
  linkTypeKey: link.linkTypeKey,
  note: link.note,
  createdAt: link.createdAt,
  source: recordsById.has(link.fromRecordId) ? recordSlim(recordsById.get(link.fromRecordId)!) : null,
  target: recordsById.has(link.toRecordId) ? recordSlim(recordsById.get(link.toRecordId)!) : null
});

const openDebtRecordIds = (records: RecordSummary[], links: LinkSummary[]): Set<number> => {
  const openDebtIds = new Set(records
    .filter((record) => record.recordTypeKey === "canon_debt" && record.canonStatus !== "accepted")
    .map((record) => record.id));
  const related = new Set(openDebtIds);
  for (const link of links) {
    if (openDebtIds.has(link.fromRecordId)) related.add(link.toRecordId);
    if (openDebtIds.has(link.toRecordId)) related.add(link.fromRecordId);
  }
  return related;
};

const advisoryUseRecordIds = (records: RecordSummary[], links: LinkSummary[]): Set<number> => {
  const advisoryIds = new Set(records
    .filter((record) => record.recordTypeKey === "advisory_artifact")
    .map((record) => record.id));
  const related = new Set(advisoryIds);
  for (const link of links) {
    if (advisoryIds.has(link.fromRecordId)) related.add(link.toRecordId);
    if (advisoryIds.has(link.toRecordId)) related.add(link.fromRecordId);
  }
  return related;
};

const normalize = (value: string): string => value.trim().toLowerCase();

const matchesText = (record: RecordSummary, sections: SectionSummary[], query: string): boolean => {
  const needle = normalize(query);
  if (!needle) return true;
  const haystacks = [
    record.shortId,
    record.title,
    record.body,
    ...sections.filter((section) => section.recordId === record.id).flatMap((section) => [section.heading, section.body])
  ];
  return haystacks.some((haystack) => normalize(haystack).includes(needle));
};

const linkTouchesBoth = (link: LinkSummary, leftId: number, rightId: number): boolean =>
  touches(link, leftId) && touches(link, rightId);

const gateReportsFor = (records: RecordSummary[], links: LinkSummary[], recordId: number): RecordSummary[] =>
  records
    .filter((record) => record.recordTypeKey === "gate_result")
    .filter((record) => links.some((link) => linkTouchesBoth(link, record.id, recordId)))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id);

const linkedPropagationDebtFor = (records: RecordSummary[], links: LinkSummary[], recordId: number) =>
  records
    .filter((record) => record.recordTypeKey === "canon_debt")
    .map((record) => {
      const sourceLink = links.find((link) =>
        link.linkTypeKey === "derived_from" &&
        link.fromRecordId === record.id &&
        link.toRecordId === recordId
      );
      return sourceLink
        ? {
            ...recordSlim(record),
            sourceRelationship: `${sourceLink.linkTypeKey}: ${sourceLink.note}`.trim()
          }
        : null;
    })
    .filter((record): record is NonNullable<typeof record> => record != null);

const standingProvenanceFor = (
  record: RecordSummary,
  records: RecordSummary[],
  links: LinkSummary[],
  histories: RecordHistorySummary[],
  facets: FacetSummary[],
  jurisdictionEvents: ReturnType<typeof listJurisdictionEvents>
) => {
  const gateReport = gateReportsFor(records, links, record.id)[0] ?? null;
  const proposalHistory = histories
    .filter((history) => history.recordId === record.id)
    .sort((a, b) => a.sequence - b.sequence)[0] ?? null;
  const admissionOperation = jurisdictionEvents
    .filter((event) => event.recordId === record.id && event.admissionDecisionOperation)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id - b.id)
    .at(-1)?.admissionDecisionOperation ?? null;
  const constraintTags = facets
    .filter((facet) => facet.recordId === record.id && facet.vocabulary === "constraint_tag")
    .sort((a, b) => a.position - b.position || a.id - b.id)
    .map((facet) => facet.term);

  return {
    currentLivingText: record.body,
    proposalHistoryText: proposalHistory?.retiredBody ?? null,
    gateAuditText: gateReport?.body ?? null,
    admissionOperation,
    constraintTags,
    linkedPropagationDebt: linkedPropagationDebtFor(records, links, record.id),
    typedLinkTrail: links
      .filter((link) => touches(link, record.id))
      .map((link) => ({
        linkTypeKey: link.linkTypeKey,
        note: link.note,
        fromRecordId: link.fromRecordId,
        toRecordId: link.toRecordId
      }))
  };
};

export const currentCanon = (world: WorldFile, filters: CurrentCanonFilters = {}) => {
  const records = listRecordsWithMeta(world);
  const facets = listFacets(world);
  const sections = listSections(world);
  const links = listLinks(world);
  const histories = listRecordHistory(world);
  const openDebtIds = openDebtRecordIds(records, links);
  const advisoryUseIds = advisoryUseRecordIds(records, links);
  const facetGroups = byRecordId(facets);
  const selectedStatuses = filters.canonStatuses ?? [];
  const selectedTruthLayers = filters.truthLayers ?? [];
  const selectedRecordTypes = filters.recordTypes ?? [];
  const selectedConsequenceModes = filters.consequenceModes ?? [];
  const branchRelevant = Boolean(
    filters.branchRelevant ||
    filters.continuityScope ||
    selectedStatuses.includes("branch-only") ||
    selectedTruthLayers.includes("branch canon")
  );
  const allowedStatuses = selectedStatuses.length
    ? selectedStatuses
    : [...DEFAULT_CURRENT_STATUSES, ...(branchRelevant ? ["branch-only"] : [])];

  const rows = records
    .filter((record) => record.mutationRegime === "card")
    .filter((record) => allowedStatuses.includes(record.canonStatus))
    .filter((record) => record.canonStatus !== "branch-only" || branchRelevant)
    .filter((record) => !selectedRecordTypes.length || selectedRecordTypes.includes(record.recordTypeKey))
    .filter((record) => !selectedTruthLayers.length || selectedTruthLayers.includes(record.truthLayer))
    .filter((record) => !filters.continuityScope || record.continuityScope === filters.continuityScope)
    .filter((record) => !selectedConsequenceModes.length || (facetGroups.get(record.id) ?? []).some((facet) => facet.vocabulary === "consequence_mode" && selectedConsequenceModes.includes(facet.term)))
    .filter((record) => !filters.openCanonDebt || openDebtIds.has(record.id))
    .filter((record) => matchesText(record, sections, filters.q ?? ""))
    .map((record) => ({
      ...recordSlim(record),
      body: record.body,
      currentLivingText: record.body,
      gateProvenance: {
        hasGateResult: gateReportsFor(records, links, record.id).length > 0,
        hasProposalHistory: histories.some((history) => history.recordId === record.id),
        hasLinkedDebt: linkedPropagationDebtFor(records, links, record.id).length > 0
      },
      relationshipMarkers: {
        hasOpenDebt: openDebtIds.has(record.id),
        hasAdvisoryUse: advisoryUseIds.has(record.id),
        typedLinkTypes: unique(links.filter((link) => touches(link, record.id)).map((link) => link.linkTypeKey))
      }
    }));

  return {
    rows,
    filters: {
      defaultStatuses: DEFAULT_CURRENT_STATUSES,
      explicitlyFilterableStatuses: EXPLICITLY_FILTERABLE_STATUSES,
      branchOnlyIncluded: branchRelevant,
      applied: filters
    }
  };
};

const linkedRecordsOfType = (
  records: RecordSummary[],
  links: LinkSummary[],
  contextIds: Set<number>,
  recordTypeKey: string
): RecordSummary[] =>
  records.filter((record) => {
    if (record.recordTypeKey !== recordTypeKey) return false;
    if (contextIds.has(record.id)) return true;
    return links.some((link) =>
      (link.fromRecordId === record.id && contextIds.has(link.toRecordId)) ||
      (link.toRecordId === record.id && contextIds.has(link.fromRecordId))
    );
  });

const relatedReportsFor = (records: RecordSummary[], links: LinkSummary[], recordId: number): RecordSummary[] =>
  records.filter((record) =>
    record.mutationRegime === "report" &&
    links.some((link) => touches(link, recordId) && touches(link, record.id))
  );

const advisoryArtifactsFor = (
  records: RecordSummary[],
  links: LinkSummary[],
  dispositions: AdvisoryDispositionSummary[],
  contextIds: Set<number>
) => linkedRecordsOfType(records, links, contextIds, "advisory_artifact").map((record) => ({
  record: recordSlim(record),
  dispositions: dispositions.filter((disposition) => disposition.advisoryRecordId === record.id)
}));

const readFlowRelationships = (world: WorldFile, reportId: number) => {
  const flowInstances = world.db.prepare(`
    SELECT *
    FROM flow_instances
    WHERE propagation_report_record_id = @reportId
      OR contradiction_report_record_id = @reportId
      OR qa_pass_record_id = @reportId
  `).all({ reportId }).map((row) => ({ kind: "flow_instance", ...(row as DbRow) }));
  const propagation = world.db.prepare(`
    SELECT *
    FROM propagation_surfaced_proposals
    WHERE report_record_id = ?
  `).all(reportId).map((row) => ({ kind: "propagation_surfaced_proposal", ...(row as DbRow) }));
  const contradiction = world.db.prepare(`
    SELECT *
    FROM contradiction_repair_created_proposals
    WHERE report_record_id = ?
  `).all(reportId).map((row) => ({ kind: "contradiction_repair_created_proposal", ...(row as DbRow) }));
  const stage12Subject = world.db.prepare(`
    SELECT *
    FROM stage12_run_sources
    WHERE pass_report_record_id = ?
  `).all(reportId).map((row) => ({ kind: "stage12_subject", ...(row as DbRow) }));
  const stage12Cards = world.db.prepare(`
    SELECT *
    FROM stage12_linked_cards
    WHERE pass_report_record_id = ?
  `).all(reportId).map((row) => ({ kind: "stage12_linked_card", ...(row as DbRow) }));
  const stage12Proposals = world.db.prepare(`
    SELECT *
    FROM stage12_proposals
    WHERE pass_report_record_id = ?
  `).all(reportId).map((row) => ({ kind: "stage12_proposal", ...(row as DbRow) }));
  const stage12Debt = world.db.prepare(`
    SELECT *
    FROM stage12_debts
    WHERE pass_report_record_id = ?
  `).all(reportId).map((row) => ({ kind: "stage12_debt", ...(row as DbRow) }));
  const stage12Advisories = world.db.prepare(`
    SELECT *
    FROM stage12_advisories
    WHERE pass_report_record_id = ?
  `).all(reportId).map((row) => ({ kind: "stage12_advisory", ...(row as DbRow) }));
  const stage12AdvisoryUses = world.db.prepare(`
    SELECT *
    FROM stage12_advisory_uses
    WHERE pass_report_record_id = ?
  `).all(reportId).map((row) => ({ kind: "stage12_advisory_use", ...(row as DbRow) }));
  const stage12Skips = world.db.prepare(`
    SELECT *
    FROM stage12_skips
    WHERE pass_report_record_id = ?
  `).all(reportId).map((row) => ({ kind: "stage12_skip", ...(row as DbRow) }));
  const constraintSubject = world.db.prepare(`
    SELECT *
    FROM constraint_run_sources
    WHERE pass_report_record_id = ?
  `).all(reportId).map((row) => ({ kind: "constraint_subject", ...(row as DbRow) }));
  const constraintCards = world.db.prepare(`
    SELECT *
    FROM constraint_linked_cards
    WHERE pass_report_record_id = ?
  `).all(reportId).map((row) => ({ kind: "constraint_linked_card", ...(row as DbRow) }));
  const constraintProposals = world.db.prepare(`
    SELECT *
    FROM constraint_proposals
    WHERE pass_report_record_id = ?
  `).all(reportId).map((row) => ({ kind: "constraint_proposal", ...(row as DbRow) }));
  const constraintDebt = world.db.prepare(`
    SELECT *
    FROM constraint_debts
    WHERE pass_report_record_id = ?
  `).all(reportId).map((row) => ({ kind: "constraint_debt", ...(row as DbRow) }));
  const constraintAdvisories = world.db.prepare(`
    SELECT *
    FROM constraint_advisories
    WHERE pass_report_record_id = ?
  `).all(reportId).map((row) => ({ kind: "constraint_advisory", ...(row as DbRow) }));
  const constraintAdvisoryUses = world.db.prepare(`
    SELECT *
    FROM constraint_advisory_uses
    WHERE pass_report_record_id = ?
  `).all(reportId).map((row) => ({ kind: "constraint_advisory_use", ...(row as DbRow) }));
  const constraintSkips = world.db.prepare(`
    SELECT *
    FROM constraint_skips
    WHERE pass_report_record_id = ?
  `).all(reportId).map((row) => ({ kind: "constraint_skip", ...(row as DbRow) }));
  return [
    ...flowInstances,
    ...propagation,
    ...contradiction,
    ...stage12Subject,
    ...stage12Cards,
    ...stage12Proposals,
    ...stage12Debt,
    ...stage12Advisories,
    ...stage12AdvisoryUses,
    ...stage12Skips,
    ...constraintSubject,
    ...constraintCards,
    ...constraintProposals,
    ...constraintDebt,
    ...constraintAdvisories,
    ...constraintAdvisoryUses,
    ...constraintSkips
  ];
};

const flowAffectedRecordIds = (relationships: Array<Record<string, unknown>>): number[] => {
  const ids: number[] = [];
  for (const relationship of relationships) {
    for (const key of [
      "propagation_fact_record_id",
      "propagation_debt_record_id",
      "contradiction_source_record_id",
      "qa_subject_record_id",
      "proposal_record_id",
      "debt_record_id",
      "pass_report_record_id",
      "source_record_id",
      "card_record_id",
      "advisory_record_id",
      "skip_record_id",
      "outcome_record_id"
    ]) {
      if (relationship[key] != null) ids.push(Number(relationship[key]));
    }
  }
  return ids;
};

export const auditTrail = (world: WorldFile) => {
  const records = listRecordsWithMeta(world);
  const recordsById = new Map(records.map((record) => [record.id, record]));
  const links = listLinks(world);
  const histories = listRecordHistory(world);
  const sectionHistories = listSectionHistory(world);
  const dispositions = listAdvisoryDispositions(world);
  const jurisdictionEvents = listJurisdictionEvents(world);
  const reports = records
    .filter((record) => record.mutationRegime === "report")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id - b.id);

  return {
    spine: reports.map((report) => {
      const directLinks = links.filter((link) => touches(link, report.id));
      const flowRelationships = readFlowRelationships(world, report.id);
      const affectedIds = new Set<number>([
        ...directLinks.map((link) => link.fromRecordId === report.id ? link.toRecordId : link.fromRecordId),
        ...flowAffectedRecordIds(flowRelationships)
      ]);
      affectedIds.delete(report.id);
      const contextIds = new Set([report.id, ...affectedIds]);
      const advisoryArtifacts = advisoryArtifactsFor(records, links, dispositions, contextIds);
      const advisoryDispositions = advisoryArtifacts.flatMap((artifact) => artifact.dispositions);
      const debtRecords = linkedRecordsOfType(records, links, contextIds, "canon_debt");

      return {
        record: recordSlim(report),
        authoredAt: report.createdAt,
        affectedCurrentRecords: records
          .filter((record) => affectedIds.has(record.id))
          .filter((record) => record.mutationRegime === "card" && CURRENT_STANDING_STATUSES.has(record.canonStatus))
          .map(recordSlim),
        attachments: {
          recordHistory: histories.filter((history) => affectedIds.has(history.recordId) || history.retiringRecordId === report.id),
          sectionHistory: sectionHistories.filter((history) => affectedIds.has(history.recordId)),
          skipRecords: linkedRecordsOfType(records, links, contextIds, "skip_record").map(recordSlim),
          canonDebtEvents: debtRecords.map((record) => ({
            record: recordSlim(record),
            history: histories.filter((history) => history.recordId === record.id)
          })),
          advisoryArtifacts,
          advisoryDispositions,
          standingRulings: advisoryDispositions.filter((disposition) => disposition.standingRuling),
          jurisdictionEvents: jurisdictionEvents.filter((event) => affectedIds.has(event.recordId)),
          typedLinkCreations: links
            .filter((link) => contextIds.has(link.fromRecordId) || contextIds.has(link.toRecordId))
            .map((link) => linkWithRecords(link, recordsById)),
          flowRelationships
        }
      };
    })
  };
};

export const recordDetail = (world: WorldFile, recordId: number) => {
  const records = listRecordsWithMeta(world);
  const recordsById = new Map(records.map((record) => [record.id, record]));
  const record = recordsById.get(recordId);
  if (!record) throw new Error(`Record not found: ${recordId}`);

  const facets = listFacets(world).filter((facet) => facet.recordId === recordId);
  const sections = listSections(world).filter((section) => section.recordId === recordId);
  const links = listLinks(world);
  const histories = listRecordHistory(world);
  const sectionHistories = listSectionHistory(world);
  const dispositions = listAdvisoryDispositions(world);
  const jurisdictionEvents = listJurisdictionEvents(world);
  const contextIds = relatedIdsFor(links, recordId);
  const relatedReports = relatedReportsFor(records, links, recordId).map(recordSlim);
  const advisoryArtifacts = advisoryArtifactsFor(records, links, dispositions, contextIds);
  const advisoryDispositions = advisoryArtifacts.flatMap((artifact) => artifact.dispositions);

  return {
    record,
    facets,
    sections,
    outgoingLinks: links
      .filter((link) => link.fromRecordId === recordId)
      .map((link) => ({
        ...link,
        target: recordsById.has(link.toRecordId) ? recordSlim(recordsById.get(link.toRecordId)!) : null
      })),
    incomingLinks: links
      .filter((link) => link.toRecordId === recordId)
      .map((link) => ({
        ...link,
        source: recordsById.has(link.fromRecordId) ? recordSlim(recordsById.get(link.fromRecordId)!) : null
      })),
    standingProvenance: standingProvenanceFor(record, records, links, histories, facets, jurisdictionEvents),
    recordHistory: histories.filter((history) => history.recordId === recordId),
    sectionHistory: sectionHistories.filter((history) => history.recordId === recordId),
    relatedReports,
    canonDebt: linkedRecordsOfType(records, links, contextIds, "canon_debt").map(recordSlim),
    skipRecords: linkedRecordsOfType(records, links, contextIds, "skip_record").map(recordSlim),
    advisoryArtifacts,
    advisoryDispositions,
    standingRulings: advisoryDispositions.filter((disposition) => disposition.standingRuling),
    exportAffordance: { method: "GET" as const, href: `/api/records/${recordId}/export/markdown` }
  };
};
