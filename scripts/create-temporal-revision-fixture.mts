import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { emitFoundationalObligations } from "../packages/server/src/conditional-pass-obligations.ts";
import { intakeProposedFact } from "../packages/server/src/admission-flow.ts";
import { WorldFile } from "../packages/server/src/world-file.ts";

const path = resolve(process.argv[2] ?? "/tmp/worldloom-issue-384-temporal.sqlite");
if (existsSync(path)) throw new Error(`refusing to replace existing fixture: ${path}`);

const world = WorldFile.create(path);
const source = world.createRecord({
  recordTypeKey: "canon_fact",
  title: "The Salt Bell names a death three days early",
  body: "In Jon Urena, the Salt Bell tolls the name of a resident three days before that resident dies.",
  truthLayer: "Objective canon",
  canonStatus: "accepted"
});
world.addFacet(source.id, { vocabulary: "admission_level", term: "5" });
world.addFacet(source.id, { vocabulary: "work_scale", term: "catastrophic" });

const propagation = world.createRecord({
  recordTypeKey: "propagation_report",
  title: "Final Salt Bell shock cone",
  body: "Gate result: passed. The final shock cone preserves false positives, ward courts, funeral insurance, and an owed Temporal correction pass.",
  truthLayer: "Objective canon",
  canonStatus: "accepted"
});
world.createLinkIfMissing(propagation.id, source.id, "derived_from", "Final Propagation report for the Temporal source fact");
world.createLinkIfMissing(source.id, propagation.id, "digest_of", "Source fact points to its final Propagation audit");
const obligations = emitFoundationalObligations(world, { sourceFactRecordId: source.id, propagationReportRecordId: propagation.id });

const admission = intakeProposedFact(world, {
  origin: "future-flow",
  candidate: {
    title: "Ward courts preserve failed Salt Bell hearings",
    body: "Proposed archive practice awaits independent Admission review.",
    truthLayer: "Objective canon",
    canonStatus: "proposed"
  },
  sourceLinks: [{ recordId: source.id, note: "Admission queue context for the Salt Bell" }],
  provenanceFlowStep: "fixture:admission-context"
}).record;
const debt = world.createCanonDebt({
  name: "Define Salt Bell false-positive jurisdiction",
  scope: "temporal-timeline",
  assignee: "steward",
  body: "The correction must preserve unresolved false-positive jurisdiction."
});
world.createLinkIfMissing(source.id, debt.id, "requires_follow_up", "Open Temporal debt");
const boundary = world.createRecord({
  recordTypeKey: "mystery_ledger_entry",
  title: "Salt Bell author-secret cause",
  body: "Observable recurrence and failed hearings are public; the originating cause is forbidden to solve.",
  truthLayer: "author-secret canon",
  canonStatus: "accepted"
});
world.createLinkIfMissing(source.id, boundary.id, "preserves_boundary_for", "Protected Temporal mystery boundary");
const kernel = world.createRecord({
  recordTypeKey: "world_kernel",
  title: "Jon Urena kernel",
  body: "Premise: warnings create institutions before certainty. Protected effect: dread without solved causation.",
  truthLayer: "Objective canon",
  canonStatus: "accepted"
});

const prior = world.createRecord({
  recordTypeKey: "pass_report",
  title: `Temporal/Timeline pass: ${source.shortId} ${source.title}`,
  body: [
    "Flow key: temporal_timeline",
    "Flow id: pending",
    "Status: in progress",
    "Source type: fact",
    `Source record id: ${source.id}`,
    "Material title: ",
    `Material body: ${source.body}`,
    `Audited subject: ${source.shortId} ${source.title}`,
    `Source summary: ${source.shortId} ${source.title}`,
    "Trigger recommendation: the catastrophic source owes a full Temporal audit."
  ].join("\n"),
  truthLayer: "Objective canon",
  canonStatus: "accepted"
});
const coverage = {
  temporalQuestions: "The Salt Bell became true after the foundry breach, was noticed after three deaths, and immediately produced a ward ordinance.",
  firstTrueOrRelativeSequence: "The foundry breach precedes the first toll, three deaths, public proof, and an immediate ordinance.",
  firstKnownOrReason: "Archivists recognize the recurrence after three matched deaths and publish it in the same week.",
  dateTypesAndGranularity: "Event, discovery, public, institutional, ordinary-life, mythic, and authorial revision dates stay separate at season granularity.",
  latency: "The ward court regulates the bell immediately after public proof.",
  residueByTimescale: "Days bring panic, years bring licenses, and generations preserve bell offices and funeral calendars.",
  sequenceIntegrity: "The ordinance follows public proof, with no intermediate institutional resistance recorded.",
  retrospectiveInsertion: "Earlier scenes gain rumors, price boards, and one archived false-positive case.",
  temporalMysteryBoundaries: "The recurrence and false positives are observable while the cause remains author-secret and forbidden to solve.",
  outcomeDecision: "Correct any implausible legal latency before final close; new facts remain routed through Admission."
};
world.replaceSections(prior.id, [{
  heading: "Coverage lenses",
  position: 2,
  body: [
    `Temporal questions: ${coverage.temporalQuestions}`,
    `First true or relative sequence: ${coverage.firstTrueOrRelativeSequence}`,
    `First known date or reason: ${coverage.firstKnownOrReason}`,
    `Date types and granularity: ${coverage.dateTypesAndGranularity}`,
    `Latency: ${coverage.latency}`,
    `Residue by timescale: ${coverage.residueByTimescale}`,
    `Sequence integrity: ${coverage.sequenceIntegrity}`,
    `Retrospective insertion: ${coverage.retrospectiveInsertion}`,
    `Temporal mystery boundaries: ${coverage.temporalMysteryBoundaries}`,
    `Outcome decision: ${coverage.outcomeDecision}`
  ].join("\n")
}]);
const advisory = world.createRecord({
  recordTypeKey: "advisory_artifact",
  title: "Current Pressure identifies the missing hearing",
  body: "Pressure: the ordinance arrives implausibly fast. Add a failed hearing and another season of legal delay; preserve the false-positive archive.",
  truthLayer: "disputed claim",
  canonStatus: "proposed"
});
world.createLinkIfMissing(prior.id, advisory.id, "cites_advisory_artifact", "Current Temporal Pressure available at the legacy frontier");
world.db.prepare("INSERT INTO advisory_dispositions (advisory_record_id, disposition, note) VALUES (?, 'selected', ?)").run(advisory.id, "Use the failed-hearing pressure only after steward revision.");
const flow = world.createFlowInstance({ flowKey: "temporal_timeline", currentStep: `temporal:report:${prior.id}:coverage` });
world.createLinkIfMissing(prior.id, source.id, "derived_from", "Temporal/Timeline pass audits this source");

const frozenIdentity = createHash("sha256").update(JSON.stringify({ record: world.getRecord(prior.id), sections: world.listSections(prior.id) })).digest("hex");
const output = {
  path,
  flowId: Number(flow.id),
  sourceRecordId: source.id,
  sourceShortId: source.shortId,
  propagationReportRecordId: propagation.id,
  priorReportRecordId: prior.id,
  priorReportFrozenSha256: frozenIdentity,
  admissionRecordId: admission.id,
  debtRecordId: debt.id,
  boundaryRecordId: boundary.id,
  kernelRecordId: kernel.id,
  advisoryRecordId: advisory.id,
  siblingObligations: obligations.map((obligation) => ({ passKey: obligation.passKey, id: obligation.id, recordId: obligation.record.id, disposition: obligation.disposition })),
  weakLenses: ["firstTrueOrRelativeSequence", "latency", "residueByTimescale", "sequenceIntegrity"]
};
world.close();
process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
