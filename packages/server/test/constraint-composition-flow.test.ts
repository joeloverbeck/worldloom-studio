import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

let tempDirs: string[] = [];

const tempPath = (name: string) => {
  const dir = mkdtempSync(join(tmpdir(), "worldloom-constraint-"));
  tempDirs.push(dir);
  return join(dir, name);
};

const json = async <T,>(response: Response): Promise<T> => response.json() as Promise<T>;

const postJson = (app: ReturnType<typeof createApp>, path: string, payload?: unknown) =>
  app.request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload)
  });

const putJson = (app: ReturnType<typeof createApp>, path: string, payload: unknown) =>
  app.request(path, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });

afterEach(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs = [];
});

describe("Constraint Composition flow HTTP API", () => {
  it("drives the constraint pass lifecycle, outcomes, advisory use, skips, and read-side trail", async () => {
    const app = createApp();
    expect((await postJson(app, "/api/worlds/create", { path: tempPath("constraint.sqlite") })).status).toBe(201);

    const fact = (await json<{ record: { id: number; shortId: string } }>(await postJson(app, "/api/records", {
      recordTypeKey: "canon_fact",
      title: "Moon salt lets ferries cross dreams",
      body: "Ferries cross dreams when their pilots scatter moon salt over the oars.",
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    }))).record;
    const capability = (await json<{ record: { id: number } }>(await postJson(app, "/api/records", {
      recordTypeKey: "capability",
      title: "Dream ferrying",
      body: "Pilots can move passengers through sleeping rivers.",
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    }))).record;
    const existingConstraint = (await json<{ record: { id: number } }>(await postJson(app, "/api/records", {
      recordTypeKey: "constraint",
      title: "Moon salt license",
      body: "Only licensed pilots may carry moon salt.",
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    }))).record;
    const debt = (await json<{ debt: { id: number } }>(await postJson(app, "/api/canon-debt", {
      name: `Constraint work owed for ${fact.shortId}`,
      scope: "constraint composition",
      assignee: "steward",
      body: "Test dream ferry constraints."
    }))).debt;
    await putJson(app, `/api/records/${fact.id}/sections`, {
      sections: [{ heading: "Costs and limits", body: "Moon salt fails when river bells are cracked.", position: 5 }]
    });

    const factRun = await json<{
      flow: { id: number; state: string; current_step: string };
      report: { id: number; recordTypeKey: string };
      source: { sourceType: string; sourceRecordId: number | null; sourceSummary: string };
      doctrine: { flowKey: string; protocol: string; checklist: string; template: string; stepMap: Array<{ key: string }>; handoffs: string[] };
      closeReadiness: { status: string; blockers: Array<{ kind: string; key: string; classification: string }> };
      promptOut: { available: boolean; templateKey: string; coldUseEvidence: string };
    }>(await postJson(app, "/api/constraint-composition/runs/start", { sourceType: "fact", recordId: fact.id }));
    expect(factRun.source).toMatchObject({ sourceType: "fact", sourceRecordId: fact.id });
    expect(factRun.report).toMatchObject({ recordTypeKey: "pass_report" });
    expect(factRun.doctrine).toMatchObject({
      flowKey: "constraint_composition",
      protocol: "docs/worldbuilding-system/08_constraint_composition.md",
      checklist: "docs/worldbuilding-system/checklists/constraint_composition_sweep.md",
      template: "docs/worldbuilding-system/templates/constraint_card.md"
    });
    expect(factRun.doctrine.stepMap.map((step) => step.key)).toEqual([
      "source_selection",
      "constrained_fact",
      "constraint_inventory",
      "composition_testing",
      "leakage_residue",
      "outcomes",
      "prompt_out_skips",
      "close_preview",
      "read_side_trail"
    ]);
    expect(factRun.doctrine.handoffs).toEqual(expect.arrayContaining([
      "constraint inventory/composition/leakage/residue",
      "constraint cards and pass-report close assembly",
      "Admission proposals and canon debt",
      "Prompt-out/skips",
      "browser decision surface",
      "coverage closeout"
    ]));
    expect(factRun.closeReadiness.status).toBe("blocked");
    expect(factRun.closeReadiness.blockers).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "constraint_budget", classification: "missing_required_coverage" }),
      expect.objectContaining({ key: "loopholes", classification: "missing_required_coverage" }),
      expect.objectContaining({ key: "enforcement", classification: "missing_required_coverage" }),
      expect.objectContaining({ key: "residue", classification: "missing_required_coverage" })
    ]));
    expect(factRun.promptOut).toMatchObject({ available: false, templateKey: "constraint_challenger" });

    const resumed = await json<{ flow: { id: number }; report: { id: number } }>(await postJson(app, "/api/constraint-composition/runs/start", { sourceType: "fact", recordId: fact.id }));
    expect(resumed.flow.id).toBe(factRun.flow.id);
    expect(resumed.report.id).toBe(factRun.report.id);

    for (const startPayload of [
      { sourceType: "capability", recordId: capability.id },
      { sourceType: "constraint_card", recordId: existingConstraint.id },
      { sourceType: "canon_debt", recordId: debt.id },
      { sourceType: "material", materialTitle: "Ferry scene", materialBody: "The pilot runs out of moon salt mid-crossing." },
      { sourceType: "record_section", recordId: fact.id, sectionHeading: "Costs and limits" },
      { sourceType: "pass_report", reportRecordId: factRun.report.id }
    ]) {
      const response = await postJson(app, "/api/constraint-composition/runs/start", startPayload);
      expect(response.status, JSON.stringify(startPayload)).toBe(201);
    }

    const weakInventory = await postJson(app, "/api/constraint-composition/inventory", {
      flowId: factRun.flow.id,
      constrainedFact: "checked",
      constraintStatement: "checked",
      constraintType: "access",
      prevents: "none",
      allows: "none",
      boundaryKnowledge: "checked",
      bypassActors: "checked",
      causeOrMysteryBoundary: "checked",
      enforcement: "checked",
      residue: "checked"
    });
    expect(weakInventory.status).toBe(400);
    expect(await json(weakInventory)).toMatchObject({ error: expect.stringContaining("steward-authored substance") });

    const inventory = await json<{ inventory: Array<{ id: number; constraintType: string; prevents: string }>; promptOut: { available: boolean } }>(await postJson(app, "/api/constraint-composition/inventory", {
      flowId: factRun.flow.id,
      constrainedFact: "Dream ferrying with moon salt",
      constraintStatement: "Only licensed pilots can carry enough moon salt to cross inhabited dreams.",
      constraintType: "access",
      prevents: "It prevents every merchant from turning sleep into free travel.",
      allows: "Licensed crossings, emergency illegal crossings, and failed partial crossings still occur.",
      boundaryKnowledge: "Pilots, smugglers, river courts, and insomniac priests know the rule.",
      bypassActors: "Smugglers, desperate families, and rival ferry guilds test the boundary.",
      causeOrMysteryBoundary: "The river rejects unlabeled salt for reasons preserved as a sacred mystery.",
      enforcement: "River courts inspect salt brands and suspend pilots after public arrival traces.",
      residue: "Children play license court with white sand, and inns post cracked-bell warnings.",
      costOrObservable: "Forgery burns the user's hands and leaves blue grit under the nails."
    }));
    expect(inventory.inventory[0]).toMatchObject({ constraintType: "access", prevents: expect.stringContaining("free travel") });
    expect(inventory.promptOut.available).toBe(true);

    for (const analysisType of ["stacking", "gate", "tradeoff", "threshold", "sequential", "cancellation", "contradiction", "chain"]) {
      const response = await postJson(app, "/api/constraint-composition/composition", {
        flowId: factRun.flow.id,
        analysisType,
        body: `${analysisType} analysis shows how salt licenses create pressure without flattening dream travel.`
      });
      expect(response.status, analysisType).toBe(201);
    }

    expect((await postJson(app, "/api/constraint-composition/leakage", {
      flowId: factRun.flow.id,
      bottleneck: "Licensed moon-salt brands are the bottleneck.",
      loopholes: "Pilots can blend old brands with new salt during eclipse tides.",
      partialWorkarounds: "Short crossings work with counterfeit salt but leave passengers fevered.",
      falseBypasses: "Market stalls sell chalk as moon salt.",
      accidents: "Cracked bells expose false salt when a ferry returns full of waking echoes.",
      countermeasures: "River courts randomize brand marks every new moon.",
      boundaryTesters: "Smugglers, children, and elite dream doctors test the boundary."
    })).status).toBe(201);
    expect((await postJson(app, "/api/constraint-composition/residue", {
      flowId: factRun.flow.id,
      ordinaryLife: "Families budget for licensed crossings and sleep in shifts before market day.",
      institutionalEffects: "River courts license pilots and audit arrival traces.",
      economicEffects: "Moon-salt futures and counterfeit inspections shape ferry prices.",
      visibleTraces: "Blue grit, license bells, and cracked-oar shrines mark failed crossings.",
      expertise: "Pilots memorize salt-brand law.",
      resentment: "Unlicensed villages resent ferry courts.",
      crime: "Smugglers traffic chalk and stolen brand irons.",
      ritual: "Pilots wash oars in moon bowls.",
      markets: "Insurers price dream fever.",
      failureModes: "A failed crossing leaves passengers half-awake for a week."
    })).status).toBe(201);

    const ready = await json<{
      closeReadiness: { status: string; blockers: unknown[] };
      inventory: unknown[];
      composition: unknown[];
      leakage: unknown | null;
      residue: unknown | null;
      promptOut: { available: boolean };
    }>(await app.request(`/api/constraint-composition/runs/${factRun.flow.id}`));
    expect(ready.closeReadiness).toMatchObject({ status: "ready", blockers: [] });
    expect(ready.inventory).toHaveLength(1);
    expect(ready.composition).toHaveLength(8);
    expect(ready.leakage).toBeTruthy();
    expect(ready.residue).toBeTruthy();
    expect(ready.promptOut.available).toBe(true);

    const createdCard = await json<{ card: { id: number; recordTypeKey: string; body: string }; linkedCards: unknown[] }>(await postJson(app, "/api/constraint-composition/cards", {
      flowId: factRun.flow.id,
      inventoryId: inventory.inventory[0].id,
      title: "Moon salt licensing",
      relation: "load-bearing access constraint"
    }));
    expect(createdCard.card).toMatchObject({ recordTypeKey: "constraint", body: expect.stringContaining("Only licensed pilots") });
    const linkedCard = await json<{ card: { id: number } }>(await postJson(app, "/api/constraint-composition/cards", {
      flowId: factRun.flow.id,
      existingRecordId: existingConstraint.id,
      relation: "existing license constraint"
    }));
    expect(linkedCard.card.id).toBe(existingConstraint.id);

    const promptStep = await json<{ step: { actions: { generate: { href: string; method: "POST" }; storeAdvisory: { href: string; method: "POST" }; disposition: { href: string; method: "POST" }; skip: { href: string; method: "POST" } } } }>(await postJson(app, "/api/prompt-out/steps", {
      flowKey: "constraint_composition",
      flowId: factRun.flow.id,
      templateKey: "constraint_challenger",
      recordId: fact.id,
      stepKey: "constraint:challenge",
      label: "Constraint challenger"
    }));
    const prompt = await json<{ prompt: string }>(await postJson(app, promptStep.step.actions.generate.href));
    expect(prompt.prompt).toContain("Constraint challenger");
    expect(prompt.prompt).toContain("Source manifest:");
    expect(prompt.prompt).toContain("Advisory/canon warning");
    expect(prompt.prompt).toContain("Flow: constraint_composition");

    const advisory = await json<{ record: { id: number; recordTypeKey: string } }>(await postJson(app, promptStep.step.actions.storeAdvisory.href, {
      promptText: prompt.prompt,
      responseText: "The counterfeit salt market should create debt and enforcement residue."
    }));
    expect(advisory.record.recordTypeKey).toBe("advisory_artifact");
    const blockedProposal = await postJson(app, "/api/constraint-composition/proposals", {
      flowId: factRun.flow.id,
      sourceStep: "constraint:challenge",
      advisoryRecordId: advisory.record.id,
      title: "Counterfeit salt markets exist",
      body: "Counterfeit salt markets are prosecuted by river courts.",
      truthLayer: "Objective canon"
    });
    expect(blockedProposal.status).toBe(400);
    expect(await json(blockedProposal)).toMatchObject({ error: expect.stringContaining("explicit disposition") });
    expect((await postJson(app, promptStep.step.actions.disposition.href, {
      advisoryRecordId: advisory.record.id,
      disposition: "selected",
      note: "Use only the enforcement pressure."
    })).status).toBe(201);

    const proposal = await json<{ record: { id: number; canonStatus: string }; queue: Array<{ id: number }> }>(await postJson(app, "/api/constraint-composition/proposals", {
      flowId: factRun.flow.id,
      sourceStep: "constraint:challenge",
      advisoryRecordId: advisory.record.id,
      title: "Counterfeit salt markets exist",
      body: "Counterfeit salt markets are prosecuted by river courts.",
      truthLayer: "Objective canon"
    }));
    expect(proposal.record.canonStatus).toBe("proposed");
    expect(proposal.queue).toEqual(expect.arrayContaining([expect.objectContaining({ id: proposal.record.id })]));

    const followUpDebt = await json<{ debt: { id: number; recordTypeKey: string }; closeReadiness: { status: string } }>(await postJson(app, "/api/constraint-composition/debt", {
      flowId: factRun.flow.id,
      sourceStep: "leakage",
      name: "Resolve moon-salt counterfeit courts",
      reason: "The flow found enforcement pressure but not court procedure.",
      severityOrConsequenceMode: "major",
      advisoryRecordId: advisory.record.id
    }));
    expect(followUpDebt.debt.recordTypeKey).toBe("canon_debt");

    const majorSkip = await postJson(app, promptStep.step.actions.skip.href, {
      unresolved: true,
      debtName: "Skipped constraint branch follow-up",
      workScale: "major"
    });
    expect(majorSkip.status).toBe(400);
    const skip = await json<{ record: { id: number }; debt: { id: number } }>(await postJson(app, promptStep.step.actions.skip.href, {
      reason: "Branch-specific dream-ferry law needs Temporal/Timeline later.",
      unresolved: true,
      debtName: "Skipped constraint branch follow-up",
      workScale: "major"
    }));
    expect(skip.debt.id).toBeGreaterThan(0);

    const closed = await json<{ flow: { state: string; current_step: string }; report: { id: number } }>(await postJson(app, `/api/constraint-composition/runs/${factRun.flow.id}/close`));
    expect(closed.flow).toMatchObject({ state: "complete", current_step: "constraint:complete" });
    expect(closed.report.id).toBe(factRun.report.id);

    const reportSections = await json<{ sections: Array<{ heading: string; body: string }> }>(await app.request(`/api/records/${factRun.report.id}/sections`));
    expect(reportSections.sections).toEqual(expect.arrayContaining([
      expect.objectContaining({ heading: "Constraint source and run", body: expect.stringContaining("constraint_composition") }),
      expect.objectContaining({ heading: "Constraint coverage", body: expect.stringContaining("Dream ferrying with moon salt") }),
      expect.objectContaining({ heading: "Constraint cards", body: expect.stringContaining("Moon salt licensing") }),
      expect.objectContaining({ heading: "Constraint proposals", body: expect.stringContaining("Counterfeit salt markets exist") }),
      expect.objectContaining({ heading: "Constraint debt", body: expect.stringContaining("Skipped constraint branch follow-up") }),
      expect.objectContaining({ heading: "Constraint Prompt-out and skips", body: expect.stringContaining("Branch-specific dream-ferry law") })
    ]));

    const pureRun = await json<{ flow: { id: number }; report: { id: number } }>(await postJson(app, "/api/constraint-composition/runs/start", {
      sourceType: "material",
      materialTitle: "Barefoot river questions",
      materialBody: "The river answers only barefoot questions during flood prayers."
    }));
    await postJson(app, "/api/constraint-composition/inventory", {
      flowId: pureRun.flow.id,
      constrainedFact: "Barefoot river questions",
      constraintStatement: "Questions work only when the asker is barefoot in the flood channel.",
      constraintType: "ritual",
      prevents: "It prevents distant nobles from querying the river without bodily risk.",
      allows: "Local petitioners can still ask seasonal questions in public.",
      boundaryKnowledge: "Priests, children, and flood wardens know the rule.",
      bypassActors: "Nobles, thieves, and scared farmers try to fake contact.",
      causeOrMysteryBoundary: "The ritual boundary is sacred and not reduced to mechanism.",
      enforcement: "Flood wardens inspect footprints and public witnesses.",
      residue: "Barefoot question days reshape clothing, prayer, and bridge tolls.",
      costOrObservable: "The asker risks cuts, parasites, and public shame."
    });
    for (const analysisType of ["stacking", "gate", "tradeoff", "threshold", "sequential", "cancellation", "contradiction", "chain"]) {
      await postJson(app, "/api/constraint-composition/composition", {
        flowId: pureRun.flow.id,
        analysisType,
        body: `${analysisType} analysis creates enough ritual pressure for review.`
      });
    }
    await postJson(app, "/api/constraint-composition/leakage", {
      flowId: pureRun.flow.id,
      bottleneck: "Bare feet in flood water are the bottleneck.",
      loopholes: "Wax feet fail because the river rejects uninjured soles.",
      partialWorkarounds: "Proxy askers work only if named publicly.",
      falseBypasses: "Sellers offer fake river mud.",
      accidents: "Shoes lost in flood expose hidden questions.",
      countermeasures: "Wardens inspect soles afterward.",
      boundaryTesters: "Nobles and pranksters test the rule."
    });
    await postJson(app, "/api/constraint-composition/residue", {
      flowId: pureRun.flow.id,
      ordinaryLife: "Flood-prayer clothes are designed for fast barefoot entry.",
      institutionalEffects: "Wardens regulate access to public flood stones.",
      economicEffects: "Mud sellers and healers profit around question days.",
      visibleTraces: "Cut feet and washed bridges mark the ritual.",
      expertise: "Children learn which stones are safe.",
      resentment: "Nobles resent public exposure.",
      crime: "Thieves fake flood stones.",
      ritual: "Public washing opens every question day.",
      markets: "Healers sell sole salves.",
      failureModes: "A false question returns a fever answer."
    });
    await postJson(app, `/api/constraint-composition/runs/${pureRun.flow.id}/close`);
    const pureSections = await json<{ sections: Array<{ heading: string; body: string }> }>(await app.request(`/api/records/${pureRun.report.id}/sections`));
    expect(pureSections.sections).toEqual(expect.arrayContaining([
      expect.objectContaining({ heading: "Constraint proposals", body: expect.stringContaining("No Admission proposals.") }),
      expect.objectContaining({ heading: "Constraint debt", body: expect.stringContaining("No constraint-composition canon debt.") }),
      expect.objectContaining({ heading: "Constraint Prompt-out and skips", body: expect.stringContaining("No advisory artifacts or governed skips.") })
    ]));

    const detail = await json<{
      relatedReports: Array<{ id: number; recordTypeKey: string }>;
      canonDebt: Array<{ id: number }>;
      skipRecords: Array<{ id: number }>;
      advisoryArtifacts: Array<{ record: { id: number } }>;
    }>(await app.request(`/api/canon-workbench/records/${fact.id}`));
    expect(detail.relatedReports).toEqual(expect.arrayContaining([expect.objectContaining({ id: factRun.report.id, recordTypeKey: "pass_report" })]));
    expect(detail.canonDebt).toEqual(expect.arrayContaining([expect.objectContaining({ id: followUpDebt.debt.id })]));
    expect(detail.skipRecords).toEqual(expect.arrayContaining([expect.objectContaining({ id: skip.record.id })]));
    expect(detail.advisoryArtifacts).toEqual(expect.arrayContaining([expect.objectContaining({ record: expect.objectContaining({ id: advisory.record.id }) })]));

    const audit = await json<{ spine: Array<{ record: { id: number }; attachments: { flowRelationships: Array<{ kind: string }>; typedLinkCreations: Array<{ toRecordId: number; linkTypeKey: string }> } }> }>(await app.request("/api/canon-workbench/audit"));
    const item = audit.spine.find((entry) => entry.record.id === factRun.report.id);
    expect(item?.attachments.flowRelationships).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: "constraint_subject" }),
      expect.objectContaining({ kind: "constraint_linked_card" }),
      expect.objectContaining({ kind: "constraint_advisory_use" }),
      expect.objectContaining({ kind: "constraint_skip" })
    ]));
    expect(item?.attachments.typedLinkCreations).toEqual(expect.arrayContaining([
      expect.objectContaining({ toRecordId: createdCard.card.id, linkTypeKey: "covers" })
    ]));
  });
});
