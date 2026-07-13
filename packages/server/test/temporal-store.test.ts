import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import * as TemporalStore from "../src/temporal-store.js";
import { WorldFile } from "../src/world-file.js";

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs.length = 0;
});

const createWorld = () => {
  const dir = mkdtempSync(join(tmpdir(), "worldloom-temporal-store-"));
  tempDirs.push(dir);
  return WorldFile.create(join(dir, "world.sqlite"));
};

const values: TemporalStore.TemporalCoverageValues = {
  temporalQuestions: "The bell became true after the foundry accident and was understood after the third death.",
  firstTrueOrRelativeSequence: "The accident precedes the bell, three deaths, public proof, and the first ordinance.",
  firstKnownOrReason: "Archivists identify the recurrence after three deaths and publish it one season later.",
  dateTypesAndGranularity: "Event, discovery, public, institutional, ordinary-life, mythic, and authorial dates stay separate by season.",
  latency: "Proof takes three deaths and regulation takes one further season.",
  residueByTimescale: "Panic appears in days, licensing in years, and inherited bell offices in generations.",
  sequenceIntegrity: "No ordinance predates public proof of the third death.",
  retrospectiveInsertion: "Earlier scenes gain rumors and price movement but no settled regulation.",
  temporalMysteryBoundaries: "False positives remain observable while the bell's cause stays author-secret.",
  outcomeDecision: "Close only after current support or a governed skip."
};

describe("Temporal flow-owned store", () => {
  it("enforces lineage, rollback, one-active uniqueness, retired immutability, and finalization freeze in SQLite", () => {
    const world = createWorld();
    const source = world.createRecord({
      recordTypeKey: "canon_fact",
      title: "The salt bell predicts a death",
      body: "A salt bell rings before a named citizen dies.",
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    });
    const flow = world.createFlowInstance({ flowKey: "temporal_timeline", currentStep: "temporal:entry" });
    TemporalStore.createRun(world, {
      flowId: Number(flow.id),
      sourceType: "fact",
      sourceRecordId: source.id,
      materialTitle: "",
      materialBody: source.body,
      auditedSubject: `${source.shortId} ${source.title}`,
      sourceSummary: `${source.shortId} ${source.title}`
    });
    const first = TemporalStore.insertFirstRevision(world, Number(flow.id), values);

    expect(() => world.db.prepare(`
      INSERT INTO temporal_coverage_revisions (
        flow_id, lineage_id, version, lifecycle_state, flow_step,
        temporal_questions, first_true_or_relative_sequence, first_known_or_reason,
        date_types_and_granularity, latency, residue_by_timescale, sequence_integrity,
        retrospective_insertion, temporal_mystery_boundaries, outcome_decision
      )
      SELECT flow_id, 'illegal-second-lineage', 1, 'active', 'test:illegal',
        temporal_questions, first_true_or_relative_sequence, first_known_or_reason,
        date_types_and_granularity, latency, residue_by_timescale, sequence_integrity,
        retrospective_insertion, temporal_mystery_boundaries, outcome_decision
      FROM temporal_coverage_revisions WHERE id = ?
    `).run(first.id)).toThrow(/UNIQUE/);

    expect(() => world.atomicWrite(() => {
      TemporalStore.replaceActiveRevision(world, {
        flowId: Number(flow.id),
        expectedRevisionId: first.id,
        reason: "Pressure exposed a longer legal delay.",
        values: { ...values, latency: "A failed hearing adds a second season before regulation." }
      });
      throw new Error("inject replacement failure");
    })).toThrow("inject replacement failure");
    expect(TemporalStore.revisionState(world, Number(flow.id))).toMatchObject({
      active: { id: first.id, version: 1, lifecycleState: "active", values },
      lineage: [{ id: first.id }],
      activeSet: { revision: 1 }
    });

    const replacement = world.atomicWrite(() => TemporalStore.replaceActiveRevision(world, {
      flowId: Number(flow.id),
      expectedRevisionId: first.id,
      reason: "Pressure exposed a longer legal delay.",
      values: { ...values, latency: "A failed hearing adds a second season before regulation." }
    }));
    expect(() => world.db.prepare("UPDATE temporal_coverage_revisions SET revision_reason = 'tampered' WHERE id = ?").run(first.id)).toThrow(/immutable/);

    const report = world.createRecord({
      recordTypeKey: "pass_report",
      title: "Final Temporal report",
      body: "Immutable final report body",
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    });
    TemporalStore.finalizeRun(world, Number(flow.id), report.id);
    expect(() => world.db.prepare(`
      UPDATE temporal_coverage_revisions
      SET lifecycle_state = 'superseded', retired_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), retired_actor_id = 1, retired_flow_step = 'test:post-close'
      WHERE id = ?
    `).run(replacement.id)).toThrow(/closed Temporal staging cannot be revised/);
    expect(TemporalStore.revisionState(world, Number(flow.id))).toMatchObject({
      lifecycleState: "finalized",
      active: { id: replacement.id, lifecycleState: "active" },
      activeSet: { revision: 2 }
    });
    world.close();
  });
});
