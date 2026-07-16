import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { intakeProposedFact } from "../packages/server/src/admission-flow.ts";
import {
  deferConditionalPassObligation,
  emitFoundationalObligations
} from "../packages/server/src/conditional-pass-obligations.ts";
import {
  saveStage12Coverage,
  startStage12Run
} from "../packages/server/src/institutional-flow.ts";
import {
  saveTemporalCoverage,
  startTemporalRun
} from "../packages/server/src/temporal-flow.ts";
import { WorldFile } from "../packages/server/src/world-file.ts";

const worldPath = resolve(process.argv[2] ?? "/tmp/worldloom-issue-395-redemption.sqlite");
const metadataPath = resolve(process.argv[3] ?? "/tmp/worldloom-issue-395-redemption.json");
const historicalPath = resolve(process.argv[4] ?? "/tmp/worldloom-issue-395-redemption-v13.sqlite");

for (const path of [worldPath, metadataPath, historicalPath]) {
  if (existsSync(path)) throw new Error(`refusing to replace existing fixture artifact: ${path}`);
}

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

const world = WorldFile.create(worldPath);
const kernel = world.createRecord({
  recordTypeKey: "world_kernel",
  title: "Jon Urena chrononaut redemption kernel",
  body: "A chrononaut city keeps every reversal as governed history while Admission remains a deliberate alternative.",
  truthLayer: "Objective canon",
  canonStatus: "accepted"
});
const source = world.createRecord({
  recordTypeKey: "canon_fact",
  title: "The chrononaut archive licenses causal crossings",
  body: "Every legal crossing is bound to a named archive entry, its final shock-cone report, and the specialized work that report still owes.",
  truthLayer: "Objective canon",
  canonStatus: "accepted"
});
world.addFacet(source.id, { vocabulary: "admission_level", term: "5" });
world.addFacet(source.id, { vocabulary: "work_scale", term: "catastrophic" });
const propagation = world.createRecord({
  recordTypeKey: "propagation_report",
  title: "Final chrononaut archive shock cone",
  body: "The final foundational report preserves temporal licensing, constraint enforcement, institutional suppression, and the exact post-Propagation Conditional-pass handoff.",
  truthLayer: "Objective canon",
  canonStatus: "accepted"
});
world.createLinkIfMissing(source.id, propagation.id, "digest_of", "Source fact points to its final Propagation report");
world.createLinkIfMissing(propagation.id, source.id, "derived_from", "Final Propagation report audits this source fact");

const obligations = emitFoundationalObligations(world, {
  sourceFactRecordId: source.id,
  propagationReportRecordId: propagation.id
});
const temporal = obligations.find((item) => item.passKey === "temporal_timeline")!;
const constraint = obligations.find((item) => item.passKey === "constraint_composition")!;
const stage12 = obligations.find((item) => item.passKey === "institutional_economic_suppression")!;
const directCoverageDeferralReason = "Keep the institutional route deferred while the steward completes its already-valid in-progress pass.";
deferConditionalPassObligation(world, {
  obligationId: stage12.id,
  reason: directCoverageDeferralReason,
  passKey: stage12.passKey,
  sourceFactRecordId: source.id,
  propagationReportRecordId: propagation.id
});

const admission = intakeProposedFact(world, {
  origin: "future-flow",
  candidate: {
    title: "Archive clerks mark crossing-license appeals",
    body: "This proposal remains queued and directly navigable while the specialized obligations are governed.",
    truthLayer: "Objective canon",
    canonStatus: "proposed"
  },
  sourceLinks: [{ recordId: source.id, note: "Admission remains a truthful alternative during Conditional-pass work" }],
  provenanceFlowStep: "fixture:conditional-pass-admission"
}).record;
const debt = world.createCanonDebt({
  name: "Unrelated archive signage debt",
  scope: "aesthetic residue",
  assignee: "steward",
  body: "This unrelated debt must survive every redemption transition unchanged."
});
const unrelated = world.createRecord({
  recordTypeKey: "institution",
  title: "Night ferry registry",
  body: "The ferry registry is unrelated to chrononaut obligation redemption.",
  truthLayer: "Objective canon",
  canonStatus: "accepted"
});
world.createLinkIfMissing(
  debt.id,
  unrelated.id,
  "requires_follow_up",
  "Unrelated fixture state"
);
const unrelatedLink = world.listLinks(debt.id).find((link) =>
  link.fromRecordId === debt.id
  && link.toRecordId === unrelated.id
  && link.linkTypeKey === "requires_follow_up"
);

const temporalRun = startTemporalRun(world, {
  sourceType: "fact",
  recordId: source.id,
  auditedSubject: `${source.shortId} ${source.title}`
});
saveTemporalCoverage(world, {
  flowId: Number(temporalRun.flow.id),
  temporalQuestions: "When do crossing licenses become true, known, regulated, inherited, and historically visible?",
  firstTrueOrRelativeSequence: "The archive predates the first legal crossing, which precedes public proof and formal licensing.",
  firstKnownOrReason: "Clerks recognize the rule after three recorded crossings and publish it before the first appeal.",
  dateTypesAndGranularity: "Event, discovery, public, institutional, ordinary-life, mythic, and authorial dates remain distinct at season granularity.",
  latency: "Public proof precedes licensing by two seasons and household adaptation by one year.",
  residueByTimescale: "Days create queue rituals, years create appeal offices, and generations inherit registry surnames.",
  sequenceIntegrity: "Appeal offices cannot predate the public crossing registry.",
  retrospectiveInsertion: "Earlier scenes retain one rumor board and one sealed clerk memorandum.",
  temporalMysteryBoundaries: "The origin of crossing remains author-secret while recurrence and licensing consequences stay observable.",
  outcomeDecision: "Close the source-linked Temporal pass only after the steward follows the restored route."
});

const stage12Run = startStage12Run(world, { sourceType: "fact", recordId: source.id });
const deferredLens = stage12Run.doctrine.lenses.at(-1)!;
for (const lens of stage12Run.doctrine.lenses.slice(0, -1)) {
  saveStage12Coverage(world, {
    flowId: Number(stage12Run.flow.id),
    lensKey: lens.key,
    body: `${lens.label} produces concrete archive rules, costs, resistance, ordinary-life residue, and suppression pressure.`
  });
}

const protectedRecords = [kernel.id, source.id, propagation.id, admission.id, debt.id, unrelated.id]
  .map((recordId) => recordIdentity(world, recordId));
const protectedLinks = [
  world.listLinks(source.id).find((link) =>
    link.fromRecordId === source.id
    && link.toRecordId === propagation.id
    && link.linkTypeKey === "digest_of"
  ),
  unrelatedLink
].filter(Boolean);
const baselineProtectedFingerprint = hashJson({ protectedRecords, protectedLinks });
const obligationBaseline = world.db.prepare(`
  SELECT id, record_id, source_fact_record_id, propagation_report_record_id,
         pass_key, ordinal, disposition, rationale, covering_report_record_id,
         actor_id, flow_step, created_at, updated_at
  FROM conditional_pass_obligations
  ORDER BY ordinal
`).all();
const eventBaseline = world.db.prepare(`
  SELECT id, obligation_id, action_key, prior_disposition, resulting_disposition,
         rationale, evidence_record_id, actor_id, flow_step, created_at
  FROM conditional_pass_obligation_events
  ORDER BY id
`).all();

world.snapshot(historicalPath);
world.close();

const historical = WorldFile.open(historicalPath);
historical.db.exec(`
  DROP TABLE conditional_pass_flow_bindings;
  DROP TRIGGER conditional_pass_events_emission_shape;
  DROP TRIGGER conditional_pass_events_deferral_shape;
  DROP TRIGGER conditional_pass_events_deferral_reason;
  DROP TRIGGER conditional_pass_events_reinstatement_shape;
  DROP TRIGGER conditional_pass_events_reinstatement_reason;
  DROP TRIGGER conditional_pass_events_coverage_shape;
  DROP TRIGGER conditional_pass_events_coverage_evidence;
  DROP TRIGGER conditional_pass_events_coverage_rationale;
  ALTER TABLE conditional_pass_obligation_events RENAME TO conditional_pass_obligation_events_v14;
  CREATE TABLE conditional_pass_obligation_events (
    id INTEGER PRIMARY KEY,
    obligation_id INTEGER NOT NULL REFERENCES conditional_pass_obligations(id) ON DELETE CASCADE,
    action_key TEXT NOT NULL CHECK (action_key IN ('emitted', 'reconciled', 'deferred', 'covered')),
    prior_disposition TEXT CHECK (prior_disposition IN ('outstanding', 'covered', 'deferred')),
    resulting_disposition TEXT NOT NULL CHECK (resulting_disposition IN ('outstanding', 'covered', 'deferred')),
    rationale TEXT,
    evidence_record_id INTEGER REFERENCES records(id) ON DELETE RESTRICT,
    actor_id INTEGER NOT NULL DEFAULT 1 REFERENCES actors(id),
    flow_step TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    UNIQUE (obligation_id, action_key, resulting_disposition, evidence_record_id)
  ) STRICT;
  INSERT INTO conditional_pass_obligation_events
  SELECT * FROM conditional_pass_obligation_events_v14 ORDER BY id;
  DROP TABLE conditional_pass_obligation_events_v14;
  PRAGMA user_version = 13;
`);
historical.close();

const metadata = {
  fixtureId: "worldloom-issue-395-conditional-pass-redemption",
  worldPath,
  historicalPath,
  sourceRecordId: source.id,
  sourceShortId: source.shortId,
  propagationReportRecordId: propagation.id,
  propagationReportShortId: propagation.shortId,
  kernelRecordId: kernel.id,
  admissionRecordId: admission.id,
  debtRecordId: debt.id,
  unrelatedRecordId: unrelated.id,
  temporalObligationId: temporal.id,
  constraintObligationId: constraint.id,
  stage12ObligationId: stage12.id,
  temporalFlowId: Number(temporalRun.flow.id),
  stage12FlowId: Number(stage12Run.flow.id),
  stage12DeferredLens: deferredLens,
  directCoverageDeferralReason,
  protectedRecordIds: protectedRecords.map((record) => record.id),
  protectedLinkIds: protectedLinks.map((link) => link!.id),
  baselineProtectedFingerprint,
  obligationBaseline,
  eventBaseline,
  currentWorldSha256: createHash("sha256").update(readFileSync(worldPath)).digest("hex"),
  historicalWorldSha256: createHash("sha256").update(readFileSync(historicalPath)).digest("hex")
};
writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ ...metadata, metadataPath }, null, 2)}\n`);
