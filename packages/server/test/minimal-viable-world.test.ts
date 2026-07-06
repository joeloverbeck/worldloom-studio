import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

let tempDirs: string[] = [];

const tempPath = (name: string) => {
  const dir = mkdtempSync(join(tmpdir(), "worldloom-mvw-"));
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

const createWorld = async () => {
  const app = createApp();
  expect((await postJson(app, "/api/worlds/create", { path: tempPath("mvw.sqlite") })).status).toBe(201);
  return app;
};

const createRecord = async (
  app: ReturnType<typeof createApp>,
  input: { recordTypeKey: string; title: string; body: string; truthLayer?: string; canonStatus?: string }
) => {
  const response = await postJson(app, "/api/records", {
    truthLayer: "Objective canon",
    canonStatus: "accepted",
    ...input
  });
  expect(response.status).toBe(201);
  return json<{ record: { id: number; shortId: string; recordTypeKey: string; title: string; body: string; canonStatus: string } }>(response);
};

const link = async (app: ReturnType<typeof createApp>, fromRecordId: number, toRecordId: number, note: string) => {
  const response = await postJson(app, "/api/links", { fromRecordId, toRecordId, linkTypeKey: "derived_from", note });
  expect(response.status).toBe(201);
};

afterEach(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs = [];
});

describe("Minimal Viable World checkpoint HTTP seam", () => {
  it("computes server-owned checkpoint state, records governed dispositions, serves Prompt-out, and echoes read-only into QA", async () => {
    const app = await createWorld();

    const kernel = await createRecord(app, {
      recordTypeKey: "world_kernel",
      title: "Bell city kernel",
      body: "Core promise: a city where the dead can testify, but testimony strains ordinary life.\nPressure line: courts, families, and bell guilds must adapt."
    });
    await putJson(app, `/api/records/${kernel.record.id}/sections`, {
      sections: [
        { heading: "Core promise", body: "A city where the dead can testify, but testimony strains ordinary life.", position: 2 },
        { heading: "Primary pressures and initial domains", body: "Pressure line: courts, families, bell guilds, grief labor.", position: 8 },
        { heading: "Ordinary-life promise", body: "Breakfast routines bend around bell testimony.", position: 9 }
      ]
    });
    const seed = await createRecord(app, {
      recordTypeKey: "canon_fact",
      title: "Bell testimony is accepted",
      body: "Courts accept bell testimony under strict grief rules."
    });
    const secondSeed = await createRecord(app, {
      recordTypeKey: "canon_fact",
      title: "Grief bells are scarce",
      body: "Only licensed bell founders can cast grief bells."
    });
    await link(app, seed.record.id, kernel.record.id, "Seed admitted from world kernel");
    await link(app, secondSeed.record.id, kernel.record.id, "Seed admitted from world kernel");
    const ordinary = await createRecord(app, {
      recordTypeKey: "canon_fact",
      title: "Morning bell routine",
      body: "Ordinary-life residue: households pause breakfast until bell testimony quiets."
    });
    const institution = await createRecord(app, {
      recordTypeKey: "institution",
      title: "Bell court guild",
      body: "Adapted institution: clerks license bell testimony and collect fees."
    });
    const faction = await createRecord(app, {
      recordTypeKey: "counter_institution",
      title: "Mute bench faction",
      body: "Factional disagreement: the mute bench rejects testimony from grieving bells."
    });
    const temporal = await createRecord(app, {
      recordTypeKey: "temporal_timeline",
      title: "Old bell compact",
      body: "Historical residue and path dependence: an older compromise still shapes court bells."
    });
    const mystery = await createRecord(app, {
      recordTypeKey: "mystery_ledger_entry",
      title: "Who speaks through cracked bells",
      body: "Mystery boundary: the source of cracked-bell voices is protected."
    });
    const aesthetic = await createRecord(app, {
      recordTypeKey: "aesthetic_coherence",
      title: "Bellcloth rule",
      body: "Aesthetic rule and residue: court cloth must stay blue around witness bells."
    });
    for (const evidence of [ordinary, institution, faction, temporal, mystery, aesthetic]) {
      await link(app, seed.record.id, evidence.record.id, `Minimal Viable World evidence: ${evidence.record.title}`);
    }

    const proposedState = await json<{
      checkpoint: { owed: boolean; blockers: Array<{ key: string }>; coverageSignals: { admittedSeeds: unknown[] } };
      decisionPoint: {
        sharedContract: {
          promptOut: { modes: Array<{ mode: "proposal" | "pressure"; availability: string; stepRequest: { href: string; body: Record<string, unknown> } | null }> };
        };
      };
    }>(await app.request("/api/flows/creation/minimal-viable-world"));
    expect(proposedState.checkpoint.owed).toBe(true);
    expect(proposedState.checkpoint.coverageSignals.admittedSeeds).toHaveLength(2);
    expect(proposedState.checkpoint.blockers).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "no_admitted_seed_facts" })
    ]));
    expect(proposedState.decisionPoint.sharedContract.promptOut.modes).toEqual(expect.arrayContaining([
      expect.objectContaining({ mode: "proposal", availability: "available" }),
      expect.objectContaining({ mode: "pressure", availability: "blocked" })
    ]));
    const proposalMode = proposedState.decisionPoint.sharedContract.promptOut.modes.find((mode) => mode.mode === "proposal");
    const proposalStep = await json<{ step: { actions: { generate: { href: string } } } }>(await postJson(app, proposalMode!.stepRequest!.href, proposalMode!.stepRequest!.body));
    const proposalGenerated = await json<{ prompt: string; promptOut: { flowKey: string; mode: string; templateKey: string; recordId: number } }>(await postJson(app, proposalStep.step.actions.generate.href));
    expect(proposalGenerated.promptOut).toMatchObject({
      flowKey: "creation",
      mode: "proposal",
      templateKey: "minimal_viable_world_checkpoint",
      recordId: seed.record.id
    });
    expect(proposalGenerated.prompt).toContain("Proposal mode");
    expect(proposalGenerated.prompt).toContain("labeled candidate ordinary-life residues");
    expect(proposalGenerated.prompt).toContain("Advisory/canon warning");
    expect(proposedState).toMatchObject({
      checkpoint: {
        coverageSignals: {
          admittedSeeds: expect.arrayContaining([
            expect.objectContaining({
              id: seed.record.id,
              dimensions: expect.arrayContaining([
                expect.objectContaining({ key: "ordinary_life", status: "present" }),
                expect.objectContaining({ key: "adapted_institution", status: "present" }),
                expect.objectContaining({ key: "factional_disagreement", status: "present" }),
                expect.objectContaining({ key: "path_dependence", status: "present" }),
                expect.objectContaining({ key: "mystery_boundary", status: "protected" }),
                expect.objectContaining({ key: "aesthetic_rule", status: "present" }),
                expect.objectContaining({ key: "pressure_line", status: "present" })
              ])
            }),
            expect.objectContaining({
              id: secondSeed.record.id,
              dimensions: expect.arrayContaining([
                expect.objectContaining({ key: "ordinary_life", status: "absent" })
              ])
            })
          ]),
          wholeWorld: expect.arrayContaining([
            expect.objectContaining({ key: "core_promise", status: "present" }),
            expect.objectContaining({ key: "admitted_seed_count", status: "present" }),
            expect.objectContaining({ key: "automatic_verdict", status: "not_applicable" })
          ])
        }
      },
      decisionPoint: {
        sharedContract: {
          contractVersion: "decision-point/v1",
          flow: { key: "creation", runState: "checkpoint_owed" },
          step: {
            key: "minimal_viable_world:coverage_review",
            packageSource: "docs/worldbuilding-system/05_creation_protocol.md"
          },
          writeIntent: {
            willLeaveUntouched: expect.arrayContaining([
              "the checkpoint does not admit facts, change canon standing, or compute a pass/fail verdict"
            ])
          }
        }
      }
    });

    const mapBeforeDisposition = await json<{
      stages: Array<{ key: string; state: string; summary: string }>;
      queues: Array<{ key: string; count: number; destinationKey: string }>;
      nextDecision: { destinationKey: string; label: string; reason: string };
    }>(await app.request("/api/workflow-map"));
    expect(mapBeforeDisposition.stages).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "minimal-viable-world", state: "owed", summary: expect.stringContaining("Minimal Viable World") })
    ]));
    expect(mapBeforeDisposition.queues).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "minimal-viable-world", count: 1, destinationKey: "creation" })
    ]));
    expect(mapBeforeDisposition.nextDecision).toMatchObject({
      destinationKey: "creation",
      label: expect.stringContaining("Minimal Viable World")
    });

    const badProtected = await postJson(app, "/api/flows/creation/minimal-viable-world/dispositions", {
      dispositions: [
        {
          seedRecordId: seed.record.id,
          dimensionKey: "ordinary_life",
          disposition: "protected_mystery",
          substance: "Trying to protect a non-mystery dimension."
        }
      ]
    });
    expect(badProtected.status).toBe(400);
    expect(await json<{ error: string }>(badProtected)).toMatchObject({ error: expect.stringContaining("protected mystery") });

    const dispositionResponse = await postJson(app, "/api/flows/creation/minimal-viable-world/dispositions", {
      dispositions: [
        {
          seedRecordId: seed.record.id,
          dimensionKey: "ordinary_life",
          disposition: "covered",
          substance: "The morning bell routine shows daily household pressure.",
          evidenceRecordIds: [ordinary.record.id]
        },
        {
          seedRecordId: seed.record.id,
          dimensionKey: "adapted_institution",
          disposition: "deferred",
          substance: "A deeper fee schedule is intentionally skipped for the first pass.",
          deferral: { kind: "skip", stepKey: "minimal_viable_world:adapted_institution_depth" }
        },
        {
          seedRecordId: seed.record.id,
          dimensionKey: "path_dependence",
          disposition: "deferred",
          substance: "The old compact needs a later timeline pass.",
          deferral: { kind: "canon_debt", debtName: "Bell compact timeline debt" }
        },
        {
          seedRecordId: seed.record.id,
          dimensionKey: "mystery_boundary",
          disposition: "protected_mystery",
          substance: "The cracked-bell voice source is protected.",
          protectedRecordId: mystery.record.id
        }
      ]
    });
    expect(dispositionResponse.status).toBe(201);
    const dispositionPayload = await json<{
      report: { id: number; recordTypeKey: string; body: string };
      dispositions: Array<{ dimensionKey: string; disposition: string }>;
      skips: Array<{ record: { recordTypeKey: string; title: string } }>;
      debt: Array<{ record: { recordTypeKey: string; title: string } }>;
      readSideTrail: Array<{ label: string; recordId?: number }>;
      closeReadiness: { status: string; blockers: unknown[] };
    }>(dispositionResponse);
    expect(dispositionPayload.report.recordTypeKey).toBe("pass_report");
    expect(dispositionPayload.report.body).toContain("Minimal Viable World checkpoint");
    expect(dispositionPayload.dispositions).toEqual(expect.arrayContaining([
      expect.objectContaining({ dimensionKey: "ordinary_life", disposition: "covered" }),
      expect.objectContaining({ dimensionKey: "adapted_institution", disposition: "deferred" }),
      expect.objectContaining({ dimensionKey: "path_dependence", disposition: "deferred" }),
      expect.objectContaining({ dimensionKey: "mystery_boundary", disposition: "protected_mystery" })
    ]));
    expect(dispositionPayload.skips).toEqual(expect.arrayContaining([
      expect.objectContaining({ record: expect.objectContaining({ recordTypeKey: "skip_record" }) })
    ]));
    expect(dispositionPayload.debt).toEqual(expect.arrayContaining([
      expect.objectContaining({ record: expect.objectContaining({ recordTypeKey: "canon_debt", title: "Bell compact timeline debt" }) })
    ]));
    expect(dispositionPayload.readSideTrail).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: expect.stringContaining("checkpoint report"), recordId: dispositionPayload.report.id })
    ]));

    const mapPayload = await json<{
      stages: Array<{ key: string; state: string; summary: string }>;
      queues: Array<{ key: string; count: number; destinationKey: string }>;
    }>(await app.request("/api/workflow-map"));
    expect(mapPayload.stages).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "minimal-viable-world", state: "owed", summary: expect.stringContaining("Minimal Viable World") })
    ]));
    expect(mapPayload.queues).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "minimal-viable-world", count: 1, destinationKey: "creation" })
    ]));

    const refreshedState = await json<{
      checkpoint: { report: { id: number } | null };
      decisionPoint: {
        sharedContract: {
          promptOut: { modes: Array<{ mode: "proposal" | "pressure"; availability: string; stepRequest: { href: string; body: Record<string, unknown> } | null }> };
        };
      };
    }>(await app.request("/api/flows/creation/minimal-viable-world"));
    expect(refreshedState.checkpoint.report?.id).toBe(dispositionPayload.report.id);
    const pressureMode = refreshedState.decisionPoint.sharedContract.promptOut.modes.find((mode) => mode.mode === "pressure");
    expect(pressureMode).toMatchObject({ availability: "available" });
    expect(pressureMode?.stepRequest?.body).toMatchObject({
      flowKey: "creation",
      templateKey: "minimal_viable_world_checkpoint",
      recordId: dispositionPayload.report.id,
      mode: "pressure"
    });

    const step = await json<{
      step: {
        actions: {
          generate: { method: "POST"; href: string };
          storeAdvisory: { method: "POST"; href: string };
          disposition: { method: "POST"; href: string };
          skip: { method: "POST"; href: string };
        };
      };
    }>(await postJson(app, pressureMode!.stepRequest!.href, pressureMode!.stepRequest!.body));
    const generated = await json<{ prompt: string; promptOut: { flowKey: string; mode: string; templateKey: string; recordId: number } }>(await postJson(app, step.step.actions.generate.href));
    expect(generated.promptOut).toMatchObject({
      flowKey: "creation",
      mode: "pressure",
      templateKey: "minimal_viable_world_checkpoint",
      recordId: dispositionPayload.report.id
    });
    expect(generated.prompt).toContain("Minimal Viable World checkpoint");
    expect(generated.prompt).toContain("ordinary-life residue");
    expect(generated.prompt).toContain("Source manifest:");
    expect(generated.prompt).toContain("Advisory/canon warning");
    expect(generated.prompt).toContain("Do not assign canon standing");

    const advisory = await json<{ record: { id: number; shortId: string; recordTypeKey: string; body: string } }>(await postJson(app, step.step.actions.storeAdvisory.href, {
      promptText: generated.prompt,
      responseText: "Candidate: the bell tax exemption pressure should be routed as proposed, not admitted."
    }));
    expect(advisory.record.recordTypeKey).toBe("advisory_artifact");
    expect(advisory.record.body).toContain("Mode: pressure");
    expect((await postJson(app, step.step.actions.disposition.href, {
      advisoryRecordId: advisory.record.id,
      disposition: "selected",
      note: "Use only the bell-tax pressure as steward-authored proposal context."
    })).status).toBe(201);

    const skippedPrompt = await json<{
      record: { id: number; recordTypeKey: string; title: string };
      debt: { id: number; recordTypeKey: string; title: string } | null;
      report: { id: number; recordTypeKey: string };
    }>(await postJson(app, step.step.actions.skip.href, {
      reason: "The pressure packet was enough for this pass; revisit unresolved pressure after first QA.",
      unresolved: true,
      debtName: "Review Minimal Viable World pressure after first QA"
    }));
    expect(skippedPrompt.record).toMatchObject({ recordTypeKey: "skip_record", title: expect.stringContaining("minimal_viable_world:coverage_review") });
    expect(skippedPrompt.debt).toMatchObject({ recordTypeKey: "canon_debt", title: "Review Minimal Viable World pressure after first QA" });
    expect(skippedPrompt.report.recordTypeKey).toBe("pass_report");

    const proposed = await json<{
      record: { id: number; canonStatus: string };
      queue: Array<{ id: number }>;
      report: { id: number; recordTypeKey: string };
    }>(await postJson(app, "/api/flows/creation/minimal-viable-world/admission-proposals", {
      reportId: skippedPrompt.report.id,
      seedRecordId: seed.record.id,
      title: "Bell-tax exemption proposal",
      body: "Poor households may petition for bell-tax exemption.",
      truthLayer: "Objective canon",
      advisoryRecordId: advisory.record.id
    }));
    expect(proposed.record.canonStatus).toBe("proposed");
    expect(proposed.queue).toEqual(expect.arrayContaining([expect.objectContaining({ id: proposed.record.id })]));
    expect(proposed.report).toMatchObject({ recordTypeKey: "pass_report" });
    expect(proposed.report.id).not.toBe(dispositionPayload.report.id);

    const proposalLinks = await json<{ links: Array<{ fromRecordId: number; toRecordId: number; linkTypeKey: string }> }>(
      await app.request(`/api/links?recordId=${proposed.record.id}`)
    );
    expect(proposalLinks.links).toEqual(expect.arrayContaining([
      expect.objectContaining({ fromRecordId: proposed.record.id, toRecordId: advisory.record.id, linkTypeKey: "derived_from" }),
      expect.objectContaining({ fromRecordId: proposed.record.id, toRecordId: advisory.record.id, linkTypeKey: "cites_advisory_artifact" })
    ]));

    const proposalReportSections = await json<{ sections: Array<{ heading: string; body: string }> }>(
      await app.request(`/api/records/${proposed.report.id}/sections`)
    );
    expect(proposalReportSections.sections).toEqual(expect.arrayContaining([
      expect.objectContaining({ heading: "Coverage lenses", body: expect.stringContaining("Coverage signals:") }),
      expect.objectContaining({ heading: "Coverage lenses", body: expect.stringContaining("MVW_DISPOSITION") }),
      expect.objectContaining({ heading: "Admission proposals", body: expect.stringContaining("Bell-tax exemption proposal") }),
      expect.objectContaining({ heading: "Canon debt", body: expect.stringContaining("Review Minimal Viable World pressure after first QA") }),
      expect.objectContaining({ heading: "Prompt-out and skips", body: expect.stringContaining(advisory.record.shortId) }),
      expect.objectContaining({ heading: "Prompt-out and skips", body: expect.stringContaining("minimal_viable_world:coverage_review") })
    ]));

    const finalState = await json<{
      checkpoint: {
        report: { id: number } | null;
        openCanonDebt: Array<{ id: number; title: string }>;
        admissionProposals: Array<{ id: number }>;
        advisoryArtifacts: Array<{ id: number }>;
      };
    }>(await app.request("/api/flows/creation/minimal-viable-world"));
    expect(finalState.checkpoint.report?.id).toBe(proposed.report.id);
    expect(finalState.checkpoint.openCanonDebt).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: skippedPrompt.debt?.id, title: "Review Minimal Viable World pressure after first QA" })
    ]));
    expect(finalState.checkpoint.admissionProposals).toEqual(expect.arrayContaining([expect.objectContaining({ id: proposed.record.id })]));
    expect(finalState.checkpoint.advisoryArtifacts).toEqual(expect.arrayContaining([expect.objectContaining({ id: advisory.record.id })]));

    const qaPass = await json<{
      scorecard: {
        decisionPoint: {
          sharedContract: {
            bearingContext: { displayed: string[]; sourceManifest: string[] };
            writeIntent: { willLeaveUntouched: string[] };
          };
        };
        minimalViableWorldEcho: {
          status: string;
          report: { id: number } | null;
          unresolvedDeferrals: unknown[];
          openCanonDebt: unknown[];
          admissionProposals: unknown[];
          advisoryArtifacts: unknown[];
        };
      };
    }>(await postJson(app, "/api/qa/passes/start", { subjectType: "world", title: "First whole-world QA" }));
    expect(qaPass.scorecard.minimalViableWorldEcho).toMatchObject({
      status: "present",
      report: { id: proposed.report.id },
      unresolvedDeferrals: expect.any(Array),
      openCanonDebt: expect.arrayContaining([expect.objectContaining({ id: skippedPrompt.debt?.id })]),
      admissionProposals: expect.arrayContaining([expect.objectContaining({ id: proposed.record.id })]),
      advisoryArtifacts: expect.arrayContaining([expect.objectContaining({ id: advisory.record.id })])
    });
    expect(qaPass.scorecard.decisionPoint.sharedContract.bearingContext.displayed).toEqual(expect.arrayContaining([
      expect.stringContaining("Minimal Viable World checkpoint")
    ]));
    expect(qaPass.scorecard.decisionPoint.sharedContract.bearingContext.sourceManifest).toEqual(expect.arrayContaining([
      expect.stringContaining("Minimal Viable World checkpoint report")
    ]));
    expect(qaPass.scorecard.decisionPoint.sharedContract.writeIntent.willLeaveUntouched).toEqual(expect.arrayContaining([
      "QA echoes Minimal Viable World state read-only and does not write checkpoint records"
    ]));

    const missingCheckpointApp = await createWorld();
    const missingQa = await json<{ scorecard: { minimalViableWorldEcho: { status: string; report: null; route: string | null } } }>(
      await postJson(missingCheckpointApp, "/api/qa/passes/start", { subjectType: "world", title: "Missing checkpoint QA" })
    );
    expect(missingQa.scorecard.minimalViableWorldEcho).toMatchObject({
      status: "missing",
      report: null,
      route: "/api/flows/creation/minimal-viable-world"
    });

    const proposedOnlyApp = await createWorld();
    await createRecord(proposedOnlyApp, {
      recordTypeKey: "canon_fact",
      title: "Proposed bell rumor",
      body: "A parked rumor that should not earn the checkpoint.",
      canonStatus: "proposed"
    });
    const proposedOnlyState = await json<{ checkpoint: { owed: boolean; blockers: Array<{ key: string }> } }>(
      await proposedOnlyApp.request("/api/flows/creation/minimal-viable-world")
    );
    expect(proposedOnlyState.checkpoint).toMatchObject({
      owed: false,
      blockers: expect.arrayContaining([expect.objectContaining({ key: "no_admitted_seed_facts" })])
    });
  });
});
