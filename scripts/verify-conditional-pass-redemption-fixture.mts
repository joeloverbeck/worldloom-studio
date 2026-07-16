import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { WorldFile } from "../packages/server/src/world-file.ts";

const metadataPath = resolve(process.argv[2] ?? "/tmp/worldloom-issue-395-redemption.json");
const mode = process.argv[3] ?? "baseline";
const metadata = JSON.parse(readFileSync(metadataPath, "utf8")) as {
  fixtureId: string;
  worldPath: string;
  historicalPath: string;
  temporalObligationId: number;
  constraintObligationId: number;
  stage12ObligationId: number;
  directCoverageDeferralReason: string;
  protectedRecordIds: number[];
  protectedLinkIds: number[];
  baselineProtectedFingerprint: string;
  obligationBaseline: Array<Record<string, unknown>>;
  eventBaseline: Array<Record<string, unknown>>;
};

const hashJson = (value: unknown): string =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

const recordIdentity = (world: WorldFile, recordId: number) => {
  const record = world.getRecord(recordId);
  return {
    id: record.id,
    shortId: record.shortId,
    recordTypeKey: record.recordTypeKey,
    title: record.title,
    body: record.body,
    truthLayer: record.truthLayer,
    canonStatus: record.canonStatus,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };
};

const obligationRows = (world: WorldFile) => world.db.prepare(`
  SELECT id, record_id, source_fact_record_id, propagation_report_record_id,
         pass_key, ordinal, disposition, rationale, covering_report_record_id,
         actor_id, flow_step, created_at, updated_at
  FROM conditional_pass_obligations
  ORDER BY ordinal
`).all() as Array<Record<string, unknown>>;

const eventRows = (world: WorldFile) => world.db.prepare(`
  SELECT id, obligation_id, action_key, prior_disposition, resulting_disposition,
         rationale, evidence_record_id, actor_id, flow_step, created_at
  FROM conditional_pass_obligation_events
  ORDER BY id
`).all() as Array<Record<string, unknown>>;

const assert = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

const verifyProtected = (world: WorldFile) => {
  const protectedRecords = metadata.protectedRecordIds.map((recordId) => recordIdentity(world, recordId));
  const allLinks = world.listLinks();
  const protectedLinks = metadata.protectedLinkIds.map((linkId) => {
    const link = allLinks.find((candidate) => candidate.id === linkId);
    if (!link) throw new Error(`missing protected link ${linkId}`);
    return link;
  });
  const fingerprint = hashJson({ protectedRecords, protectedLinks });
  assert(
    fingerprint === metadata.baselineProtectedFingerprint,
    `protected-state fingerprint changed: expected ${metadata.baselineProtectedFingerprint}, found ${fingerprint}`
  );
  return fingerprint;
};

const current = WorldFile.open(metadata.worldPath);
let currentResult: Record<string, unknown>;
try {
  const protectedFingerprint = verifyProtected(current);
  const obligations = obligationRows(current);
  const events = eventRows(current);
  assert(obligations.length === 3, `expected exactly 3 obligations, found ${obligations.length}`);
  assert(
    obligations.map((row) => row.ordinal).join(",") === "1,2,3",
    "Conditional-pass obligation order changed"
  );

  if (mode === "baseline") {
    assert(JSON.stringify(obligations) === JSON.stringify(metadata.obligationBaseline), "baseline obligation rows changed");
    assert(JSON.stringify(events) === JSON.stringify(metadata.eventBaseline), "baseline event rows changed");
  } else if (mode === "final") {
    const temporal = obligations.find((row) => row.id === metadata.temporalObligationId)!;
    const constraint = obligations.find((row) => row.id === metadata.constraintObligationId)!;
    const stage12 = obligations.find((row) => row.id === metadata.stage12ObligationId)!;
    assert(temporal.disposition === "covered", "Temporal obligation is not covered");
    assert(temporal.covering_report_record_id != null, "Temporal obligation has no covering report");
    assert(constraint.disposition === "outstanding", "Constraint sibling did not remain outstanding");
    assert(constraint.covering_report_record_id == null, "Constraint sibling gained covering evidence");
    assert(stage12.disposition === "covered", "Stage-12 deferred obligation is not covered");
    assert(stage12.covering_report_record_id != null, "Stage-12 obligation has no covering report");

    const temporalEvents = events.filter((event) => event.obligation_id === metadata.temporalObligationId);
    const stage12Events = events.filter((event) => event.obligation_id === metadata.stage12ObligationId);
    assert(temporalEvents.filter((event) => event.action_key === "deferred").length >= 2, "Temporal history lacks two deferrals");
    assert(temporalEvents.filter((event) => event.action_key === "reinstated").length >= 2, "Temporal history lacks two reinstatements");
    assert(
      temporalEvents.some((event) =>
        event.action_key === "covered"
        && event.prior_disposition === "outstanding"
        && event.evidence_record_id === temporal.covering_report_record_id
      ),
      "Temporal history lacks outstanding-to-covered evidence"
    );
    assert(
      stage12Events.some((event) =>
        event.action_key === "deferred"
        && event.rationale === metadata.directCoverageDeferralReason
      ),
      "Stage-12 history lost its deferral rationale"
    );
    assert(
      stage12Events.some((event) =>
        event.action_key === "covered"
        && event.prior_disposition === "deferred"
        && event.evidence_record_id === stage12.covering_report_record_id
      ),
      "Stage-12 history lacks deferred-to-covered evidence"
    );
    assert(
      !stage12Events.some((event) => event.action_key === "reinstated"),
      "Stage-12 direct coverage fabricated a reinstatement"
    );
  } else {
    throw new Error(`unknown verification mode: ${mode}`);
  }

  currentResult = {
    mode,
    schemaVersion: current.schemaVersion(),
    protectedFingerprint,
    obligations,
    events
  };
} finally {
  current.close();
}

const historical = WorldFile.open(metadata.historicalPath);
let historicalResult: Record<string, unknown>;
try {
  const historicalObligations = obligationRows(historical);
  const historicalEvents = eventRows(historical);
  assert(JSON.stringify(historicalObligations) === JSON.stringify(metadata.obligationBaseline), "historical migration rewrote obligation rows");
  assert(JSON.stringify(historicalEvents) === JSON.stringify(metadata.eventBaseline), "historical migration rewrote event content or order");
  historicalResult = {
    schemaVersion: historical.schemaVersion(),
    protectedFingerprint: verifyProtected(historical),
    obligations: historicalObligations,
    events: historicalEvents
  };
} finally {
  historical.close();
}

process.stdout.write(`${JSON.stringify({
  fixtureId: metadata.fixtureId,
  current: currentResult,
  historical: historicalResult
}, null, 2)}\n`);
