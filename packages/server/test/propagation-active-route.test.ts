import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

let tempDirs: string[] = [];

const tempPath = (name: string) => {
  const dir = mkdtempSync(join(tmpdir(), "worldloom-propagation-active-"));
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

const createWorld = async () => {
  const app = createApp();
  expect((await postJson(app, "/api/worlds/create", { path: tempPath("propagation-active.sqlite") })).status).toBe(201);
  return app;
};

const acceptedFact = async (
  app: ReturnType<typeof createApp>,
  input: { title: string; body?: string; admissionLevel?: string; workScale?: string }
) => {
  const fact = await json<{ record: { id: number; shortId: string; title: string } }>(await postJson(app, "/api/records", {
    recordTypeKey: "canon_fact",
    title: input.title,
    body: input.body ?? `${input.title} is accepted canon.`,
    truthLayer: "Objective canon",
    canonStatus: "accepted"
  }));
  if (input.admissionLevel) {
    expect((await postJson(app, `/api/records/${fact.record.id}/facets`, {
      vocabulary: "admission_level",
      term: input.admissionLevel
    })).status).toBe(201);
  }
  if (input.workScale) {
    expect((await postJson(app, `/api/records/${fact.record.id}/facets`, {
      vocabulary: "work_scale",
      term: input.workScale
    })).status).toBe(201);
  }
  return fact.record;
};

const propagationDebtFor = async (app: ReturnType<typeof createApp>, factId: number, title = "Propagation owed") => {
  const debt = await json<{ debt: { id: number; title: string } }>(await postJson(app, "/api/canon-debt", {
    name: title,
    scope: "propagation",
    assignee: "steward",
    body: "Work this admitted fact's shock cone."
  }));
  expect((await postJson(app, "/api/links", {
    fromRecordId: debt.debt.id,
    toRecordId: factId,
    linkTypeKey: "derived_from",
    note: "Propagation debt preserves source fact"
  })).status).toBe(201);
  return debt.debt;
};

const createRecord = async (
  app: ReturnType<typeof createApp>,
  input: { recordTypeKey?: string; title: string; body?: string; truthLayer?: string; canonStatus?: string }
) => (await json<{ record: { id: number; shortId: string; title: string } }>(await postJson(app, "/api/records", {
  recordTypeKey: input.recordTypeKey ?? "canon_fact",
  title: input.title,
  body: input.body ?? `${input.title} body.`,
  truthLayer: input.truthLayer ?? "Objective canon",
  canonStatus: input.canonStatus ?? "accepted"
}))).record;

const linkRecords = async (
  app: ReturnType<typeof createApp>,
  fromRecordId: number,
  toRecordId: number,
  linkTypeKey: string,
  note: string
) => expect((await postJson(app, "/api/links", { fromRecordId, toRecordId, linkTypeKey, note })).status).toBe(201);

const fullGateSections = async (app: ReturnType<typeof createApp>, recordId: number, context: string) => {
  const payload = await json<{
    decisionPoint: { fullGateContract: { sections: Array<{ key: string; label: string; quietDomain: boolean }> } };
  }>(await app.request(`/api/admission/records/${recordId}/gate`));
  return payload.decisionPoint.fullGateContract.sections.map((section) => ({
    key: section.key,
    substance: `${section.label} substance for ${context}.`,
    ...(section.quietDomain ? { quietDomainDeclaration: `No quiet-domain omission for ${context}.` } : {})
  }));
};

const domain = {
  direct: "Economy, trade, and scarcity",
  dependency: "Governance, law, and bureaucracy",
  reaction: "Daily life and material residue",
  negative: "Aesthetics, tone, and narrative use"
};

const canonicalDomainNames = [
  "Physics, metaphysics, and cosmology",
  "Geography, climate, and infrastructure",
  "Ecology, food, disease, and nonhuman life",
  "Population, demography, and household life",
  "Production, labor, and technology/magic",
  "Economy, trade, and scarcity",
  "Governance, law, and bureaucracy",
  "War, coercion, and security",
  "Religion, ritual, myth, and meaning",
  "Culture, custom, language, and identity",
  "Knowledge, education, science, and records",
  "History, memory, and path dependence",
  "Daily life and material residue",
  "Aesthetics, tone, and narrative use"
];

afterEach(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs = [];
});

describe("Propagation active owed route server contract", () => {
  it("returns the latest open Propagation run for mutation-free browser resume", async () => {
    const app = await createWorld();

    const empty = await app.request("/api/propagation/runs/active");
    expect(empty.status).toBe(200);
    expect(await json<any>(empty)).toEqual({ run: null });

    const fact = await acceptedFact(app, {
      title: "Resume the courthouse shock cone",
      admissionLevel: "3",
      workScale: "major"
    });
    const started = await json<any>(await postJson(app, "/api/propagation/runs/start", { factRecordId: fact.id }));

    const firstRead = await json<any>(await app.request("/api/propagation/runs/active"));
    const secondRead = await json<any>(await app.request("/api/propagation/runs/active"));

    expect(firstRead.run).toMatchObject({
      flow: { id: started.flow.id, state: "in_progress" },
      activeSet: { revision: 0 },
      closeReadiness: { status: "blocked" }
    });
    expect(secondRead).toEqual(firstRead);
  });

  it("returns the pre-close revision contract and current server state from start and mutation actions", async () => {
    const app = await createWorld();
    const fact = await acceptedFact(app, {
      title: "Court-bell staging contract",
      body: "Court bells delimit when dead witnesses may speak.",
      admissionLevel: "3",
      workScale: "major"
    });
    const started = await json<any>(await postJson(app, "/api/propagation/runs/start", { factRecordId: fact.id }));
    expect(started).toMatchObject({
      flow: { id: expect.any(Number), state: "in_progress", propagation_active_set_revision: 0 },
      sourceFact: { id: fact.id },
      severityPath: { admissionLevel: "3", workScale: "major" },
      revisionDecision: {
        name: "Pre-close Propagation revision and finalization",
        packageSources: [
          "docs/worldbuilding-system/07_propagation_engine.md",
          "docs/worldbuilding-system/20_ai_assisted_workflow.md"
        ],
        doctrine: {
          staging: expect.stringMatching(/editable staging/i),
          reportBoundary: expect.stringMatching(/append-only/i)
        },
        writeIntent: {
          willWrite: expect.any(Array),
          willLeaveUntouched: expect.arrayContaining(["source canon standing", "Admission work", "closed reports"])
        }
      },
      activeSet: { revision: 0 },
      packetCurrentness: {
        status: "current",
        recovery: expect.objectContaining({ action: "load-current-packet" })
      },
      closeReadiness: { status: "blocked", blockers: expect.any(Array) },
      decisionPoint: {
        sharedContract: {
          nextOrResumeState: expect.objectContaining({ currentStep: "propagation:entry", safeExit: expect.any(String) })
        }
      }
    });

    const added = await json<any>(await postJson(app, "/api/propagation/consequences", {
      flowId: started.flow.id,
      orderKey: "first",
      domainName: domain.direct,
      body: "Court markets pause during testimony.",
      pressure: "high"
    }));
    expect(added).toMatchObject({
      consequence: {
        lifecycleState: "active",
        version: 1,
        lineageId: expect.any(String)
      },
      activeSet: { revision: 1, changedKind: "consequence-added" },
      revisionDecision: { name: "Pre-close Propagation revision and finalization" },
      closeReadiness: {
        blockers: expect.arrayContaining([expect.objectContaining({ key: "undispositioned-high-pressure" })])
      }
    });

    const swept = await json<any>(await postJson(app, "/api/propagation/domains", {
      flowId: started.flow.id,
      domainName: domain.direct,
      triage: "direct",
      declaration: "Court-market schedules change directly."
    }));
    expect(swept).toMatchObject({
      domain: { lifecycleState: "active", version: 1, lineageId: expect.any(String) },
      activeSet: { revision: 2, changedKind: "domain-added" }
    });

    const dispositioned = await json<any>(await postJson(app, "/api/propagation/dispositions", {
      consequenceId: added.consequence.id,
      disposition: "answered",
      note: "The court calendar absorbs the pause."
    }));
    expect(dispositioned).toMatchObject({
      disposition: { consequenceId: added.consequence.id, active: true },
      activeSet: { revision: 3, changedKind: "consequence-disposition" },
      revisionDecision: { name: "Pre-close Propagation revision and finalization" }
    });
  });

  it("does not recover owed source facts by parsing debt prose", async () => {
    const app = await createWorld();
    const fact = await acceptedFact(app, {
      title: "Parsed-source bridge",
      admissionLevel: "3",
      workScale: "major"
    });
    const debt = await json<{ debt: { id: number } }>(await postJson(app, "/api/canon-debt", {
      name: "Propagation owed with prose source only",
      scope: "propagation",
      assignee: "steward",
      body: `This prose says source fact id: ${fact.id}, but no typed link exists.`
    }));

    const queue = await json<{ queue: Array<any> }>(await app.request("/api/propagation/queue"));
    expect(queue.queue.find((row) => row.id === debt.debt.id)).toMatchObject({
      sourceFact: null,
      route: null
    });
    const start = await postJson(app, "/api/propagation/runs/start", {
      debtRecordId: debt.debt.id
    });
    expect(start.status).toBe(400);
    expect(await json<{ error: string }>(start)).toMatchObject({
      error: expect.stringMatching(/source fact/i)
    });
  });

  it("makes Admission-created propagation debt source-linked, routeable, and startable", async () => {
    const app = await createWorld();
    const proposed = await json<{ record: { id: number; title: string } }>(await postJson(app, "/api/records", {
      recordTypeKey: "canon_fact",
      title: "Admission-created bridge debt source",
      body: "Broad bridge debt proposal body.",
      truthLayer: "Objective canon",
      canonStatus: "proposed"
    }));
    await postJson(app, `/api/admission/records/${proposed.record.id}/severity`, {
      admissionLevel: "4",
      workScale: "severe"
    });
    const completed = await json<{ readback: { livingRecord: { body: string }; followUpDebt: { id: number; title: string } } }>(
      await postJson(app, "/api/admission/gate/complete", {
        recordId: proposed.record.id,
        truthLayer: "Objective canon",
        canonStatus: "accepted with constraints",
        operations: ["constrain"],
        consequenceText: "Bridge debt now affects court access.",
        sections: await fullGateSections(app, proposed.record.id, "admission-created propagation source"),
        notApplicableReasons: ["No branch implication."],
        quietDomainDeclarations: ["No spatial spread yet."],
        followUpDebt: "Work the constrained bridge debt shock cone."
      })
    );

    expect(completed.readback.livingRecord.body).toBe("Fact statement substance for admission-created propagation source.");
    const links = await json<{ links: Array<{ fromRecordId: number; toRecordId: number; linkTypeKey: string; note: string }> }>(
      await app.request(`/api/links?recordId=${completed.readback.followUpDebt.id}`)
    );
    expect(links.links).toEqual(expect.arrayContaining([
      expect.objectContaining({
        fromRecordId: completed.readback.followUpDebt.id,
        toRecordId: proposed.record.id,
        linkTypeKey: "derived_from",
        note: expect.stringContaining("Admission-created propagation debt")
      })
    ]));

    const queue = await json<{ queue: Array<any> }>(await app.request("/api/propagation/queue"));
    const item = queue.queue.find((row) => row.id === completed.readback.followUpDebt.id);
    expect(item).toMatchObject({
      sourceFact: {
        id: proposed.record.id,
        title: "Admission-created bridge debt source",
        body: "Fact statement substance for admission-created propagation source."
      },
      route: {
        method: "POST",
        href: "/api/propagation/runs/start",
        body: { factRecordId: proposed.record.id, debtRecordId: completed.readback.followUpDebt.id }
      }
    });

    const started = await json<{ flow: { propagation_fact_record_id: number; propagation_debt_record_id: number } }>(
      await postJson(app, item.route.href, item.route.body)
    );
    expect(started.flow).toMatchObject({
      propagation_fact_record_id: proposed.record.id,
      propagation_debt_record_id: completed.readback.followUpDebt.id
    });
  });

  it("carries owed source identity through queue, start, resume, and run readiness", async () => {
    const app = await createWorld();
    const fact = await acceptedFact(app, {
      title: "Noon bridge testimony",
      body: "Dead witnesses can charge living merchants at the noon bridge.",
      admissionLevel: "3",
      workScale: "major"
    });
    const debt = await propagationDebtFor(app, fact.id, "Propagation owed for noon bridge");

    const queue = await json<{ queue: Array<any> }>(await app.request("/api/propagation/queue"));
    expect(queue.queue).toHaveLength(1);
    expect(queue.queue[0]).toMatchObject({
      id: debt.id,
      scope: "propagation",
      state: "open",
      owedItem: { id: debt.id, title: "Propagation owed for noon bridge" },
      sourceFact: { id: fact.id, title: "Noon bridge testimony" },
      route: {
        method: "POST",
        href: "/api/propagation/runs/start",
        body: { factRecordId: fact.id, debtRecordId: debt.id }
      }
    });

    const started = await json<{ flow: { id: number; propagation_fact_record_id: number; propagation_debt_record_id: number } }>(
      await postJson(app, queue.queue[0].route.href, queue.queue[0].route.body)
    );
    expect(started.flow).toMatchObject({
      propagation_fact_record_id: fact.id,
      propagation_debt_record_id: debt.id
    });
    const resumed = await json<{ flow: { id: number } }>(await postJson(app, queue.queue[0].route.href, queue.queue[0].route.body));
    expect(resumed.flow.id).toBe(started.flow.id);

    const otherFact = await acceptedFact(app, { title: "Wrong bridge", admissionLevel: "1", workScale: "minor" });
    const mismatch = await postJson(app, "/api/propagation/runs/start", {
      factRecordId: otherFact.id,
      debtRecordId: debt.id
    });
    expect(mismatch.status).toBe(400);
    expect(await json<{ error: string }>(mismatch)).toMatchObject({
      error: expect.stringMatching(/source fact.*debt/i)
    });

    const nonPropagationDebt = await json<{ debt: { id: number } }>(await postJson(app, "/api/canon-debt", {
      name: "Constraint owed",
      scope: "constraint",
      assignee: "steward",
      body: "Not a propagation item."
    }));
    const rejected = await postJson(app, "/api/propagation/runs/start", {
      factRecordId: fact.id,
      debtRecordId: nonPropagationDebt.debt.id
    });
    expect(rejected.status).toBe(400);
    expect(await json<{ error: string }>(rejected)).toMatchObject({
      error: expect.stringMatching(/open propagation-scoped debt/i)
    });

    const run = await json<any>(await app.request(`/api/propagation/runs/${started.flow.id}`));
    expect(run).toMatchObject({
      sourceFact: { id: fact.id, title: "Noon bridge testimony" },
      owedDebt: { id: debt.id, title: "Propagation owed for noon bridge" },
      severityPath: { admissionLevel: "3", workScale: "major" },
      closeReadiness: {
        status: "blocked",
        blockers: expect.arrayContaining([
          expect.objectContaining({ key: "missing-shock-cone-orders" }),
          expect.objectContaining({ key: "missing-domain-direct" }),
          expect.objectContaining({ key: "missing-domain-dependency" }),
          expect.objectContaining({ key: "missing-domain-reaction" })
        ])
      },
      readSideTrail: expect.arrayContaining([
        expect.objectContaining({ label: "Source fact", recordId: fact.id })
      ])
    });
  });

  it("derives severity blockers, exposes sweep controls, and refuses close until required coverage is recorded", async () => {
    const app = await createWorld();
    const fact = await acceptedFact(app, {
      title: "Bridge ghosts sell toll testimony",
      admissionLevel: "3",
      workScale: "major"
    });
    const debt = await propagationDebtFor(app, fact.id, "Propagation owed for bridge ghosts");
    const started = await json<{ flow: { id: number } }>(await postJson(app, "/api/propagation/runs/start", {
      factRecordId: fact.id,
      debtRecordId: debt.id
    }));

    const initial = await json<any>(await app.request(`/api/propagation/runs/${started.flow.id}`));
    expect(initial.plan).toMatchObject({
      orderControls: expect.arrayContaining([
        expect.objectContaining({ key: "zeroth", doctrine: expect.any(String), severityExpectation: expect.any(String) }),
        expect.objectContaining({ key: "fifth", doctrine: expect.any(String), severityExpectation: expect.any(String) })
      ]),
      domainAtlas: expect.arrayContaining([
        expect.objectContaining({ name: domain.direct, state: "unswept" }),
        expect.objectContaining({ name: domain.negative, state: "unswept" })
      ])
    });
    expect(initial.closeReadiness.blockers.map((blocker: { key: string }) => blocker.key)).toEqual(expect.arrayContaining([
      "missing-shock-cone-orders",
      "missing-domain-direct",
      "missing-domain-dependency",
      "missing-domain-reaction"
    ]));

    const earlyClose = await postJson(app, `/api/propagation/runs/${started.flow.id}/close`);
    expect(earlyClose.status).toBe(400);
    expect(await json<{ error: string }>(earlyClose)).toMatchObject({ error: expect.stringMatching(/missing.*coverage/i) });

    const negativeWithoutDeclaration = await postJson(app, "/api/propagation/domains", {
      flowId: started.flow.id,
      domainName: domain.negative,
      triage: "negative"
    });
    expect(negativeWithoutDeclaration.status).toBe(400);
    expect(await json<{ error: string }>(negativeWithoutDeclaration)).toMatchObject({
      error: expect.stringMatching(/negative domains require/i)
    });

    await postJson(app, "/api/propagation/consequences", {
      flowId: started.flow.id,
      orderKey: "first",
      domainName: domain.direct,
      body: "Merchants route around noon testimony.",
      pressure: "normal"
    });
    await postJson(app, "/api/propagation/consequences", {
      flowId: started.flow.id,
      orderKey: "second",
      domainName: domain.dependency,
      body: "Guild contracts add dead-witness clauses.",
      pressure: "normal"
    });
    await postJson(app, "/api/propagation/domains", {
      flowId: started.flow.id,
      domainName: domain.direct,
      triage: "direct",
      declaration: "Toll prices change directly."
    });
    await postJson(app, "/api/propagation/domains", {
      flowId: started.flow.id,
      domainName: domain.dependency,
      triage: "dependency",
      declaration: "Governance depends on testimony handling."
    });
    await postJson(app, "/api/propagation/domains", {
      flowId: started.flow.id,
      domainName: domain.reaction,
      triage: "reaction",
      declaration: "Households avoid haunted bridge days."
    });

    const covered = await json<any>(await app.request(`/api/propagation/runs/${started.flow.id}`));
    expect(covered.closeReadiness).toMatchObject({ status: "ready", blockers: [] });
  });

  it("surfaces dispositions, Admission proposals, close preview, and read-side trail before and after close", async () => {
    const app = await createWorld();
    const fact = await acceptedFact(app, {
      title: "Whisper contracts bind witnesses",
      admissionLevel: "1",
      workScale: "minor"
    });
    const debt = await propagationDebtFor(app, fact.id, "Propagation owed for whisper contracts");
    const started = await json<{ flow: { id: number } }>(await postJson(app, "/api/propagation/runs/start", {
      factRecordId: fact.id,
      debtRecordId: debt.id
    }));
    const consequence = await json<{ consequence: { id: number } }>(await postJson(app, "/api/propagation/consequences", {
      flowId: started.flow.id,
      orderKey: "first",
      domainName: domain.direct,
      body: "Witnesses price whispered signatures.",
      pressure: "high"
    }));
    await postJson(app, "/api/propagation/domains", {
      flowId: started.flow.id,
      domainName: domain.direct,
      triage: "direct",
      declaration: "The economic effect is direct."
    });

    const missingDebt = await postJson(app, "/api/propagation/dispositions", {
      consequenceId: consequence.consequence.id,
      disposition: "assigned as canon debt"
    });
    expect(missingDebt.status).toBe(400);
    expect(await json<{ error: string }>(missingDebt)).toMatchObject({ error: expect.stringMatching(/named debt/i) });

    const disposition = await json<{ disposition: { debtRecordId: number } }>(await postJson(app, "/api/propagation/dispositions", {
      consequenceId: consequence.consequence.id,
      disposition: "assigned as canon debt",
      debtName: "Work whisper-contract price controls",
      note: "Track market controls in a later propagation pass."
    }));
    expect(disposition.disposition.debtRecordId).toBeGreaterThan(0);

    const proposal = await json<{ record: { id: number; canonStatus: string } }>(await postJson(app, "/api/propagation/propose-fact", {
      flowId: started.flow.id,
      title: "Witness-broker offices emerge",
      body: "Brokers sell whispered signatures near courts.",
      truthLayer: "Objective canon"
    }));
    expect(proposal.record).toMatchObject({ canonStatus: "proposed" });

    const preview = await json<any>(await app.request(`/api/propagation/runs/${started.flow.id}`));
    expect(preview.closePreview).toMatchObject({
      willWrite: expect.arrayContaining([
        expect.stringContaining("append-only propagation report"),
        expect.stringContaining("source fact digest link")
      ]),
      existingRecords: expect.arrayContaining([
        expect.objectContaining({ kind: "follow-up canon debt", recordId: disposition.disposition.debtRecordId }),
        expect.objectContaining({ kind: "surfaced proposal", recordId: proposal.record.id })
      ]),
      willLeaveUntouched: expect.arrayContaining([
        expect.stringContaining("source canon standing"),
        expect.stringContaining("proposed facts remain proposed")
      ])
    });

    const closed = await json<any>(await postJson(app, `/api/propagation/runs/${started.flow.id}/close`));
    expect(closed).toMatchObject({
      report: { id: expect.any(Number), recordTypeKey: "propagation_report" },
      closePreview: expect.any(Object),
      readSideTrail: expect.arrayContaining([
        expect.objectContaining({ label: "Propagation report", recordId: expect.any(Number) }),
        expect.objectContaining({ label: "Source fact digest link", recordId: fact.id }),
        expect.objectContaining({ label: "Surfaced proposal", recordId: proposal.record.id }),
        expect.objectContaining({ label: "Follow-up canon debt", recordId: disposition.disposition.debtRecordId })
      ])
    });
  });

  it("assembles Propagation Prompt-out packets from run, debt, coverage, blockers, and omissions", async () => {
    const app = await createWorld();
    const fact = await acceptedFact(app, {
      title: "Tide clocks govern marriages",
      body: "Marriage vows only bind when tide clocks strike silver noon.",
      admissionLevel: "3",
      workScale: "major"
    });
    const debt = await propagationDebtFor(app, fact.id, "Propagation owed for tide clocks");
    const started = await json<{ flow: { id: number } }>(await postJson(app, "/api/propagation/runs/start", {
      factRecordId: fact.id,
      debtRecordId: debt.id
    }));
    await postJson(app, "/api/propagation/consequences", {
      flowId: started.flow.id,
      orderKey: "first",
      domainName: domain.direct,
      body: "Wedding calendars cluster around silver-noon tides.",
      pressure: "normal"
    });

    const run = await json<any>(await app.request(`/api/propagation/runs/${started.flow.id}`));
    const proposalMode = run.decisionPoint.sharedContract.promptOut.modes.find((mode: { mode: string }) => mode.mode === "proposal");
    expect(proposalMode).toMatchObject({
      availability: "available",
      stepRequest: {
        body: expect.objectContaining({
          flowKey: "propagation",
          flowId: started.flow.id,
          recordId: fact.id,
          stepKey: run.flow.current_step,
          mode: "proposal"
        })
      }
    });
    const step = await json<{ step: any }>(await postJson(app, proposalMode.stepRequest.href, proposalMode.stepRequest.body));
    expect(step.step.packetIdentity).toMatchObject({
      flowKey: "propagation",
      flowId: started.flow.id,
      recordId: fact.id,
      mode: "proposal"
    });
    expect(step.step.actions.generate.href).toContain(`flowId=${started.flow.id}`);

    const generated = await json<{ prompt: string; promptOut: { packetIdentity: { packetHash: string; flowId: number } } }>(
      await postJson(app, step.step.actions.generate.href)
    );
    expect(generated.promptOut.packetIdentity).toMatchObject({
      flowId: started.flow.id,
      packetHash: expect.stringMatching(/^[a-f0-9]{64}$/)
    });
    expect(generated.prompt).toContain("Tide clocks govern marriages");
    expect(generated.prompt).toContain("Propagation owed for tide clocks");
    expect(generated.prompt).toContain(`Flow id: ${started.flow.id}`);
    expect(generated.prompt).toContain("Required coverage: multiple orders and direct/dependency/reaction domains");
    expect(generated.prompt).toContain("Wedding calendars cluster around silver-noon tides.");
    expect(generated.prompt).toContain("missing-domain-dependency");
    expect(generated.prompt).toContain("Advisory/canon warning");

    const skippedWithoutReason = await postJson(app, step.step.actions.skip.href);
    expect(skippedWithoutReason.status).toBe(400);
    const skipped = await json<{ record: { id: number; recordTypeKey: string; body: string } }>(await postJson(app, step.step.actions.skip.href, {
      reason: "External pressure would duplicate a recent workshop pass."
    }));
    expect(skipped.record).toMatchObject({ recordTypeKey: "skip_record" });
    expect(skipped.record.body).toContain("External pressure would duplicate");
  });

  it("generates an atlas-complete foundational Proposal while lower-severity packets stay proportionate", async () => {
    const app = await createWorld();
    const foundationalFact = await acceptedFact(app, {
      title: "The moon consumes one oath each month",
      body: "At the first moonrise of each month, one sworn oath loses its binding force.",
      admissionLevel: "4",
      workScale: "major"
    });
    const foundationalRun = await json<{ flow: { id: number } }>(await postJson(app, "/api/propagation/runs/start", {
      factRecordId: foundationalFact.id
    }));
    const foundationalStep = await json<{ step: { actions: { generate: { href: string } } } }>(await postJson(app, "/api/prompt-out/steps", {
      flowKey: "propagation",
      flowId: foundationalRun.flow.id,
      templateKey: "propagation_consequence_scout",
      recordId: foundationalFact.id,
      stepKey: "propagation:domain-atlas",
      mode: "proposal",
      label: "Foundational atlas Proposal"
    }));
    const foundational = await json<{ prompt: string; promptOut: { packetIdentity: { packetHash: string; sourceManifestHash: string }; propagationContext: any } }>(
      await postJson(app, foundationalStep.step.actions.generate.href)
    );

    let previousIndex = -1;
    for (const domainName of canonicalDomainNames) {
      expect(foundational.prompt.match(new RegExp(domainName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))).toHaveLength(1);
      const index = foundational.prompt.indexOf(domainName);
      expect(index).toBeGreaterThan(previousIndex);
      previousIndex = index;
    }
    expect(foundational.prompt).toContain("what is possible or impossible, who knows the rules");
    expect(foundational.prompt).toContain("what does an ordinary person, child, worker, house, market, routine, object, or small luxury reveal");
    expect(foundational.prompt).toContain("Direct domains are where the fact acts first");
    expect(foundational.prompt).toContain("Dependency domains contain what must already exist");
    expect(foundational.prompt).toContain("Reaction domains show adaptation");
    expect(foundational.prompt).toContain("Negative domains look unaffected but would be contradictory or suspiciously quiet");
    expect(foundational.prompt).toContain("Foundational severity owes the full fourteen-domain atlas");
    expect(foundational.prompt).toContain("docs/worldbuilding-system/04_domain_atlas.md");
    expect(foundational.prompt).toContain("docs/worldbuilding-system/07_propagation_engine.md");
    expect(foundational.prompt).toContain("docs/worldbuilding-system/20_ai_assisted_workflow.md");
    expect(foundational.promptOut.packetIdentity).toMatchObject({
      packetHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      sourceManifestHash: expect.stringMatching(/^[a-f0-9]{64}$/)
    });
    expect(foundational.promptOut.propagationContext).toMatchObject({
      serverOwned: true,
      mode: "proposal",
      decisionPoint: "propagation:domain-atlas",
      atlas: {
        required: true,
        domains: canonicalDomainNames.map((name) => expect.objectContaining({ name })),
        triage: expect.stringMatching(/direct.*dependency.*reaction.*negative/i),
        severityReason: expect.stringMatching(/foundational.*fourteen-domain.*lower-severity.*proportionate/i)
      },
      relatedWorld: { aggregateBudget: 12000, perRecordCap: 2000, selectedRecords: [] },
      sourceManifest: expect.arrayContaining([expect.stringContaining("04_domain_atlas.md")]),
      readOnlyGuarantee: expect.stringMatching(/create no record, link, status, debt, skip, advisory artifact, disposition, flow-state, or world-file mutation/i)
    });

    const minorFact = await acceptedFact(app, {
      title: "A single quay bell changes pitch",
      admissionLevel: "1",
      workScale: "minor"
    });
    const minorRun = await json<{ flow: { id: number } }>(await postJson(app, "/api/propagation/runs/start", {
      factRecordId: minorFact.id
    }));
    const minorStep = await json<{ step: { actions: { generate: { href: string } } } }>(await postJson(app, "/api/prompt-out/steps", {
      flowKey: "propagation",
      flowId: minorRun.flow.id,
      templateKey: "propagation_consequence_scout",
      recordId: minorFact.id,
      stepKey: "propagation:run-entry",
      mode: "proposal",
      label: "Minor Proposal"
    }));
    const minor = await json<{ prompt: string }>(await postJson(app, minorStep.step.actions.generate.href));
    expect(minor.prompt).toContain("Required coverage: immediate effects and one ordinary-life residue when relevant");
    expect(minor.prompt).not.toContain("Foundational severity owes the full fourteen-domain atlas");
    expect(minor.prompt).not.toContain(canonicalDomainNames[0]);
  });

  it("generates bounded related-world Pressure with standing, provenance, deterministic omissions, and zero read mutation", async () => {
    const app = await createWorld();
    const kernel = await createRecord(app, {
      recordTypeKey: "world_kernel",
      title: "Oath-eating moon kernel",
      body: "Premise: one moon eats an oath each month. Tone: sacred melancholy. Consequence mode: mythic recurrence. Constraint: only sworn oaths bind. Protected effect: why the moon hungers remains unknown."
    });
    const fact = await acceptedFact(app, {
      title: "The moon consumes one oath each month",
      body: "At first moonrise, one sworn oath loses its binding force.",
      admissionLevel: "4",
      workScale: "major"
    });
    await linkRecords(app, fact.id, kernel.id, "derived_from", "Source fact derives from the active world kernel");

    const direct = await createRecord(app, { title: "Moon-priest witness registry", body: "Accepted registries identify which sworn oaths were exposed to first moonrise." });
    await linkRecords(app, fact.id, direct.id, "depends_on", "Pressure-relevant direct dependency");
    const sharedAccepted = await createRecord(app, { title: "Silver calendar", body: "Accepted calendars mark each oath-eating moonrise." });
    await linkRecords(app, sharedAccepted.id, kernel.id, "derived_from", "Shared kernel origin");
    const sharedProposed = await createRecord(app, { title: "Oath hospice", body: "A proposed hospice helps households prepare for a binding oath to fail.", canonStatus: "proposed" });
    await linkRecords(app, sharedProposed.id, kernel.id, "derived_from", "Dependency-bearing shared kernel origin");
    const sharedContested = await createRecord(app, { title: "Moonless district", body: "Residents contest whether roofed districts avoid the moon's effect.", truthLayer: "disputed claim", canonStatus: "contested" });
    await linkRecords(app, sharedContested.id, kernel.id, "derived_from", "Contested shared kernel origin");
    const superseded = await createRecord(app, { title: "Retired triple-oath rule", body: "Old wording claimed that three oaths failed each month.", canonStatus: "superseded" });
    await linkRecords(app, superseded.id, kernel.id, "derived_from", "Inactive shared kernel origin");
    const missing = await createRecord(app, { title: "Unreadable quay archive", body: "" });
    await linkRecords(app, fact.id, missing.id, "soft_depends_on", "Direct candidate whose content is unavailable");
    const secondHop = await createRecord(app, { title: "Second-hop roof guild", body: "This guild is linked only through the direct registry." });
    await linkRecords(app, direct.id, secondHop.id, "depends_on", "Outside the one-hop boundary");
    const irrelevant = await createRecord(app, { recordTypeKey: "advisory_artifact", title: "Unrelated prior advisory", body: "A prior external response that is not governed support.", truthLayer: "disputed claim", canonStatus: "proposed" });
    await linkRecords(app, fact.id, irrelevant.id, "cites_advisory_artifact", "Artifact existence is not evidence of advisory use");

    const overflowRecords = [];
    for (let index = 1; index <= 7; index += 1) {
      const record = await createRecord(app, {
        title: `Accepted overflow sibling ${index}`,
        body: `Overflow sibling ${index} context. ${String(index).repeat(2_200)}`
      });
      await linkRecords(app, record.id, kernel.id, "derived_from", "Shared kernel origin used to exercise deterministic budget trimming");
      overflowRecords.push(record);
    }

    const started = await json<{ flow: { id: number } }>(await postJson(app, "/api/propagation/runs/start", { factRecordId: fact.id }));
    await postJson(app, "/api/propagation/consequences", {
      flowId: started.flow.id,
      orderKey: "first",
      domainName: domain.direct,
      body: "Households renegotiate marriage vows before the first moonrise.",
      pressure: "normal"
    });
    const activeMaterial = await json<{ record: { id: number; shortId: string } }>(await postJson(app, "/api/propagation/propose-fact", {
      flowId: started.flow.id,
      title: "Oath review circles emerge",
      body: "Households propose local circles to review vulnerable vows.",
      truthLayer: "Objective canon"
    }));
    const activeMaterialNeighbor = await createRecord(app, {
      title: "Court registry fee schedule",
      body: "Accepted fee schedules constrain how the proposed oath-review circles can access registries."
    });
    await linkRecords(app, activeMaterial.record.id, activeMaterialNeighbor.id, "depends_on", "Existing typed link from active Propagation material");

    const before = {
      records: await json(await app.request("/api/records")),
      links: await json(await app.request("/api/links")),
      run: await json(await app.request(`/api/propagation/runs/${started.flow.id}`))
    };
    const step = await json<{ step: { actions: { generate: { href: string } } } }>(await postJson(app, "/api/prompt-out/steps", {
      flowKey: "propagation",
      flowId: started.flow.id,
      templateKey: "propagation_consequence_scout",
      recordId: fact.id,
      stepKey: "propagation:pre-close-revision",
      mode: "pressure",
      label: "Related-world Pressure"
    }));
    const generated = await json<{ prompt: string; promptOut: { packetIdentity: { packetHash: string; sourceManifestHash: string; activeSetRevision: number }; propagationContext: any } }>(
      await postJson(app, step.step.actions.generate.href)
    );

    expect(generated.prompt).toContain(`Stable identity: ${kernel.shortId}`);
    expect(generated.prompt).toContain("Relationship: active world kernel");
    expect(generated.prompt).toContain("Inclusion reason: kernel support for premise, tone, consequence mode, constraints, and protected effects");
    expect(generated.prompt).toContain(`Stable identity: ${direct.shortId}`);
    expect(generated.prompt).toContain("Relationship: direct depends_on");
    expect(generated.prompt).toContain(`Stable identity: ${activeMaterialNeighbor.shortId}`);
    expect(generated.prompt).toContain(`relationship to active Propagation material ${activeMaterial.record.shortId}`);
    expect(generated.prompt).toContain(`Stable identity: ${sharedAccepted.shortId}`);
    expect(generated.prompt).toContain("Relationship: shared origin");
    expect(generated.prompt).toContain(`Stable identity: ${sharedProposed.shortId}`);
    expect(generated.prompt).toContain("Canon status: proposed (non-canon context)");
    expect(generated.prompt).toContain(`Stable identity: ${sharedContested.shortId}`);
    expect(generated.prompt).toContain("Truth layer: disputed claim");
    expect(generated.prompt).toContain("Active versus historical role: active context");
    expect(generated.prompt).toContain(`${superseded.shortId} ${superseded.title}: inactive or superseded current-support status`);
    expect(generated.prompt).toContain(`${missing.shortId} ${missing.title}: unavailable content`);
    expect(generated.prompt).toContain(`${secondHop.shortId} ${secondHop.title}: outside the bounded relationship shapes (second hop)`);
    expect(generated.prompt).toContain(`${irrelevant.shortId} ${irrelevant.title}: irrelevant to the active Pressure role`);
    expect(generated.prompt).toContain("trimmed by the 12,000-character related-world budget");
    expect(generated.prompt).toContain("Related-world budget: 12000 Unicode characters aggregate; 2000 per record");
    expect(generated.prompt).toContain("Close preview: 1 active consequence version(s), 0 active domain version(s)");
    expect(generated.prompt).toContain("Source document identifier:");
    expect(generated.prompt).toContain("Related-world selection is structural, deterministic, non-recursive, and read-only");
    expect(generated.promptOut.packetIdentity).toMatchObject({
      packetHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      sourceManifestHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      activeSetRevision: expect.any(Number)
    });
    expect(generated.promptOut.propagationContext).toMatchObject({
      serverOwned: true,
      mode: "pressure",
      relatedWorld: {
        aggregateBudget: 12000,
        perRecordCap: 2000,
        usedCharacters: expect.any(Number),
        completeness: {
          status: "incomplete",
          failures: expect.arrayContaining([expect.stringContaining(missing.shortId)])
        },
        selectedRecords: expect.arrayContaining([
          expect.objectContaining({ stableIdentity: kernel.shortId, relationship: "active world kernel", nonCanon: false }),
          expect.objectContaining({ stableIdentity: direct.shortId, relationship: "direct depends_on", nonCanon: false }),
          expect.objectContaining({ stableIdentity: activeMaterialNeighbor.shortId, relationship: "direct depends_on", nonCanon: false }),
          expect.objectContaining({ stableIdentity: sharedProposed.shortId, canonStatus: "proposed", nonCanon: true })
        ])
      },
      omissions: expect.arrayContaining([
        expect.stringContaining(superseded.shortId),
        expect.stringContaining(missing.shortId),
        expect.stringContaining(secondHop.shortId),
        expect.stringContaining(irrelevant.shortId),
        expect.stringContaining("trimmed by the 12,000-character related-world budget")
      ]),
      advisoryCanonWarning: expect.stringMatching(/optional advisory support/i),
      readOnlyGuarantee: expect.stringMatching(/create no record, link, status, debt, skip, advisory artifact, disposition, flow-state, or world-file mutation/i)
    });
    expect(overflowRecords.some((record) => generated.prompt.includes(`Stable identity: ${record.shortId}`))).toBe(true);
    expect(overflowRecords.some((record) => generated.prompt.includes(`${record.shortId} ${record.title}: trimmed by`))).toBe(true);

    const after = {
      records: await json(await app.request("/api/records")),
      links: await json(await app.request("/api/links")),
      run: await json(await app.request(`/api/propagation/runs/${started.flow.id}`))
    };
    expect(after).toEqual(before);
  });

  it("revises a dispositioned consequence, invalidates active readiness, and refuses the stale Pressure packet", async () => {
    const app = await createWorld();
    const fact = await acceptedFact(app, {
      title: "Bell-toll testimony",
      body: "Dead witnesses may testify only while the noon bell rings.",
      admissionLevel: "3",
      workScale: "major"
    });
    const started = await json<{ flow: { id: number } }>(await postJson(app, "/api/propagation/runs/start", {
      factRecordId: fact.id
    }));
    const consequence = await json<{ consequence: { id: number } }>(await postJson(app, "/api/propagation/consequences", {
      flowId: started.flow.id,
      orderKey: "first",
      domainName: domain.direct,
      body: "Every noon market must halt for ghost testimony.",
      pressure: "high"
    }));
    const disposition = await json<{ disposition: { id: number } }>(await postJson(app, "/api/propagation/dispositions", {
      consequenceId: consequence.consequence.id,
      disposition: "answered",
      note: "The market calendar absorbs the pause."
    }));

    const promptStep = await json<{ step: { actions: { generate: { href: string }; storeAdvisory: { href: string }; disposition: { href: string } } } }>(
      await postJson(app, "/api/prompt-out/steps", {
        flowKey: "propagation",
        flowId: started.flow.id,
        templateKey: "propagation_consequence_scout",
        recordId: fact.id,
        stepKey: "propagation:pre-close-revision",
        mode: "pressure",
        label: "Pressure revised active set",
        admissionLevel: "3",
        workScale: "major"
      })
    );
    const generated = await json<{ prompt: string; promptOut: { packetIdentity: { activeSetRevision: number } } }>(
      await postJson(app, promptStep.step.actions.generate.href)
    );
    expect(generated.promptOut.packetIdentity.activeSetRevision).toEqual(expect.any(Number));
    const advisory = await json<{ record: { id: number } }>(await postJson(app, promptStep.step.actions.storeAdvisory.href, {
      promptText: generated.prompt,
      responseText: "The bell schedule contradicts the source fact's limited testimony window."
    }));
    expect(advisory.record.id).toEqual(expect.any(Number));

    const revisedResponse = await postJson(app, `/api/propagation/consequences/${consequence.consequence.id}/revisions`, {
      flowId: started.flow.id,
      reason: "Pressure exposed that markets need not stop outside the courthouse.",
      orderKey: "first",
      domainName: domain.direct,
      body: "Only the courthouse market pauses during noon ghost testimony.",
      pressure: "high"
    });
    expect(revisedResponse.status).toBe(201);
    const revised = await json<any>(revisedResponse);
    expect(revised).toMatchObject({
      revision: {
        kind: "consequence-revision",
        reason: "Pressure exposed that markets need not stop outside the courthouse.",
        lineageId: expect.any(String),
        retired: {
          id: consequence.consequence.id,
          lifecycleState: "superseded",
          provenance: {
            created: {
              actor: { id: 1, name: "steward" },
              timestamp: expect.any(String),
              flowStep: "propagation:first"
            },
            retired: {
              actor: { id: 1, name: "steward" },
              timestamp: expect.any(String),
              flowStep: "propagation:consequence-revision"
            }
          }
        },
        active: {
          id: expect.any(Number),
          version: 2,
          lifecycleState: "active",
          body: "Only the courthouse market pauses during noon ghost testimony.",
          provenance: {
            created: {
              actor: { id: 1, name: "steward" },
              timestamp: expect.any(String),
              flowStep: "propagation:consequence-revision"
            },
            retired: null
          }
        },
        invalidatedDisposition: {
          id: disposition.disposition.id,
          active: false
        }
      },
      activeSet: {
        revision: expect.any(Number),
        changedKind: "consequence-revision",
        changedRowId: expect.any(Number)
      },
      packetCurrentness: {
        status: "stale",
        reason: expect.stringMatching(/consequence.*revis/i),
        pressure: {
          status: "owed",
          freshPacket: expect.objectContaining({ href: "/api/prompt-out/steps" }),
          skip: expect.objectContaining({ href: expect.stringContaining("/api/prompt-out/steps/actions/skip") })
        }
      },
      closeReadiness: {
        status: "blocked",
        blockers: expect.arrayContaining([
          expect.objectContaining({ key: "undispositioned-high-pressure", consequenceId: expect.any(Number) })
        ])
      }
    });
    expect(revised.activeSet.revision).toBeGreaterThan(generated.promptOut.packetIdentity.activeSetRevision);

    const staleStore = await postJson(app, promptStep.step.actions.storeAdvisory.href, {
      promptText: generated.prompt,
      responseText: "This response belongs to the retired active set."
    });
    expect(staleStore.status).toBe(400);
    expect(await json<{ error: string }>(staleStore)).toMatchObject({
      error: expect.stringMatching(/stale.*active set.*load.*current/i)
    });

    const staleDisposition = await postJson(app, promptStep.step.actions.disposition.href, {
      advisoryRecordId: advisory.record.id,
      disposition: "challenged",
      note: "This disposition belongs to a retired active set."
    });
    expect(staleDisposition.status).toBe(400);

    const staleUse = await postJson(app, "/api/records", {
      recordTypeKey: "canon_fact",
      title: "Stale advisory use must roll back",
      body: "This record must not survive the refused stale advisory-use action.",
      truthLayer: "Objective canon",
      canonStatus: "proposed",
      advisoryRecordId: advisory.record.id
    });
    expect(staleUse.status).toBe(400);
    expect(await json<{ error: string }>(staleUse)).toMatchObject({
      error: expect.stringMatching(/stale.*active set.*load.*current/i)
    });
    expect(await json<{ records: Array<{ title: string }> }>(await app.request("/api/records"))).toMatchObject({
      records: expect.not.arrayContaining([expect.objectContaining({ title: "Stale advisory use must roll back" })])
    });
  });

  it("keeps disposition-frontier Pressure on the active decision identity through close and post-close refusal", async () => {
    const app = await createWorld();
    const fact = await acceptedFact(app, {
      title: "Courthouse bell testimony frontier",
      body: "Dead witnesses may testify only while the courthouse bell rings.",
      admissionLevel: "1",
      workScale: "minor"
    });
    const started = await json<any>(await postJson(app, "/api/propagation/runs/start", {
      factRecordId: fact.id
    }));
    const consequence = await json<any>(await postJson(app, "/api/propagation/consequences", {
      flowId: started.flow.id,
      orderKey: "first",
      domainName: domain.direct,
      body: "The courthouse market pauses for testimony.",
      pressure: "high"
    }));
    await postJson(app, "/api/propagation/domains", {
      flowId: started.flow.id,
      domainName: domain.direct,
      triage: "direct",
      declaration: "Only the courthouse market changes its noon schedule."
    });
    await postJson(app, "/api/propagation/dispositions", {
      consequenceId: consequence.consequence.id,
      disposition: "answered",
      note: "The court calendar governs the first version."
    });

    const firstFrontier = await json<any>(await app.request(`/api/propagation/runs/${started.flow.id}`));
    const firstPressureStep = await json<any>(await postJson(app, "/api/prompt-out/steps", {
      flowKey: "propagation",
      flowId: started.flow.id,
      templateKey: "propagation_consequence_scout",
      recordId: fact.id,
      stepKey: firstFrontier.flow.current_step,
      mode: "pressure",
      label: "Pressure the first disposition frontier",
      admissionLevel: "1",
      workScale: "minor"
    }));
    const firstPressure = await json<any>(await postJson(app, firstPressureStep.step.actions.generate.href));
    await postJson(app, firstPressureStep.step.actions.storeAdvisory.href, {
      promptText: firstPressure.prompt,
      responseText: "The market pause should be limited to testimony hearings."
    });

    const revised = await json<any>(await postJson(app, `/api/propagation/consequences/${consequence.consequence.id}/revisions`, {
      flowId: started.flow.id,
      reason: "Pressure narrowed the market pause to active hearings.",
      orderKey: "first",
      domainName: domain.direct,
      body: "The courthouse market pauses only during active testimony hearings.",
      pressure: "high"
    }));
    expect(revised).toMatchObject({
      packetCurrentness: {
        status: "stale",
        recovery: {
          action: "load-current-packet",
          body: { stepKey: "propagation:pre-close-revision" }
        }
      },
      closeReadiness: {
        status: "blocked",
        blockers: expect.arrayContaining([
          expect.objectContaining({ key: "undispositioned-high-pressure", consequenceId: revised.revision.active.id }),
          expect.objectContaining({ key: "fresh-pressure-or-skip-owed" })
        ])
      }
    });
    await postJson(app, "/api/propagation/dispositions", {
      consequenceId: revised.revision.active.id,
      disposition: "answered",
      note: "The hearing calendar governs the replacement."
    });

    const dispositionFrontier = await json<any>(await app.request(`/api/propagation/runs/${started.flow.id}`));
    expect(dispositionFrontier.flow.current_step).toBe("propagation:disposition");
    expect(dispositionFrontier.decisionPoint.sharedContract.step.key).toBe(dispositionFrontier.flow.current_step);
    expect(dispositionFrontier.packetCurrentness.recovery.body.stepKey).toBe(dispositionFrontier.flow.current_step);
    expect(dispositionFrontier.packetCurrentness.pressure.freshPacket.body.stepKey).toBe(dispositionFrontier.flow.current_step);

    const currentStep = await json<any>(await postJson(
      app,
      dispositionFrontier.packetCurrentness.pressure.freshPacket.href,
      dispositionFrontier.packetCurrentness.pressure.freshPacket.body
    ));
    const currentPressure = await json<any>(await postJson(app, currentStep.step.actions.generate.href));
    expect(currentPressure.promptOut.packetIdentity).toMatchObject({
      flowKey: "propagation",
      flowId: started.flow.id,
      stepKey: dispositionFrontier.flow.current_step,
      activeSetRevision: dispositionFrontier.activeSet.revision
    });
    expect((await json<any>(await app.request(`/api/propagation/runs/${started.flow.id}`))).closeReadiness.blockers)
      .toEqual(expect.arrayContaining([expect.objectContaining({ key: "fresh-pressure-or-skip-owed" })]));

    await postJson(app, currentStep.step.actions.storeAdvisory.href, {
      promptText: currentPressure.prompt,
      responseText: "The narrowed hearing schedule is internally consistent."
    });
    const ready = await json<any>(await app.request(`/api/propagation/runs/${started.flow.id}`));
    expect(ready.packetCurrentness).toMatchObject({
      status: "current",
      activeSetRevision: dispositionFrontier.activeSet.revision,
      pressure: { status: "current-or-unused" }
    });
    expect(ready.closeReadiness).toEqual({ status: "ready", blockers: [] });

    const closed = await postJson(app, `/api/propagation/runs/${started.flow.id}/close`);
    expect(closed.status).toBe(201);
    const refusedRetraction = await postJson(app, `/api/propagation/consequences/${revised.revision.active.id}/retract`, {
      flowId: started.flow.id,
      reason: "This must be refused after close."
    });
    expect(refusedRetraction.status).toBe(400);
    expect(await json<{ error: string }>(refusedRetraction)).toMatchObject({
      error: expect.stringMatching(/closed.*refused/i)
    });
  });

  it("finalizes only the active foundational set with revision audit and refuses every post-close staging action", async () => {
    const app = await createWorld();
    const fact = await acceptedFact(app, {
      title: "Foundational bell testimony",
      body: "The dead may testify during one courthouse bell each day.",
      admissionLevel: "5",
      workScale: "catastrophic"
    });
    const untouched = await json<{ record: { id: number; title: string; body: string; canonStatus: string } }>(await postJson(app, "/api/records", {
      recordTypeKey: "canon_fact",
      title: "Unrelated orchard custom",
      body: "Orchards close on the first frost.",
      truthLayer: "Objective canon",
      canonStatus: "accepted"
    }));
    const started = await json<any>(await postJson(app, "/api/propagation/runs/start", { factRecordId: fact.id }));

    const orders = ["zeroth", "first", "second", "third", "fourth", "fifth"] as const;
    let highConsequence: { id: number } | null = null;
    for (const orderKey of orders) {
      const result = await json<any>(await postJson(app, "/api/propagation/consequences", {
        flowId: started.flow.id,
        orderKey,
        body: orderKey === "first"
          ? "Every market in the city closes during the courthouse bell."
          : `${orderKey} order bell-testimony consequence remains steward-authored.`,
        pressure: orderKey === "first" ? "high" : "normal"
      }));
      if (orderKey === "first") highConsequence = result.consequence;
    }
    expect(highConsequence).not.toBeNull();

    const domainRows: Array<{ id: number; domainName: string; triage: string }> = [];
    const triages = ["direct", "dependency", "reaction", "negative"] as const;
    for (const [index, domainName] of (started.plan.domains as string[]).entries()) {
      const triage = triages[index % triages.length]!;
      const result = await json<any>(await postJson(app, "/api/propagation/domains", {
        flowId: started.flow.id,
        domainName,
        triage,
        declaration: `${domainName} has an explicit ${triage} bell-testimony declaration.`
      }));
      domainRows.push(result.domain);
    }
    await postJson(app, "/api/propagation/dispositions", {
      consequenceId: highConsequence!.id,
      disposition: "answered",
      note: "The city calendar absorbs the market pause."
    });

    const pressureStep = await json<any>(await postJson(app, "/api/prompt-out/steps", {
      flowKey: "propagation",
      flowId: started.flow.id,
      templateKey: "propagation_consequence_scout",
      recordId: fact.id,
      stepKey: "propagation:pre-close-revision",
      mode: "pressure",
      label: "Pressure foundational active set",
      admissionLevel: "5",
      workScale: "catastrophic"
    }));
    const pressure = await json<any>(await postJson(app, pressureStep.step.actions.generate.href));
    const advisory = await json<any>(await postJson(app, pressureStep.step.actions.storeAdvisory.href, {
      promptText: pressure.prompt,
      responseText: "Only courthouse markets need pause; citywide closure overstates the consequence."
    }));
    expect(advisory.record.body).toContain("Active set revision:");

    const revised = await json<any>(await postJson(app, `/api/propagation/consequences/${highConsequence!.id}/revisions`, {
      flowId: started.flow.id,
      reason: "Cold Pressure exposed an over-broad market consequence.",
      orderKey: "first",
      body: "Only the courthouse market closes during the testimony bell.",
      pressure: "high"
    }));
    expect(revised.closeReadiness).toMatchObject({
      status: "blocked",
      blockers: expect.arrayContaining([
        expect.objectContaining({ key: "undispositioned-high-pressure", consequenceId: revised.revision.active.id }),
        expect.objectContaining({ key: "fresh-pressure-or-skip-owed" })
      ])
    });
    await postJson(app, "/api/propagation/dispositions", {
      consequenceId: revised.revision.active.id,
      disposition: "answered",
      note: "The courthouse calendar absorbs the narrower pause."
    });

    const revisedDomain = await json<any>(await postJson(app, `/api/propagation/domains/${domainRows[0]!.id}/revisions`, {
      flowId: started.flow.id,
      reason: "The active declaration needs a narrower direct-pressure explanation.",
      triage: "direct",
      declaration: "Bell testimony changes metaphysical access only inside the courthouse."
    }));
    expect(revisedDomain.revision).toMatchObject({
      kind: "domain-revision",
      retired: { id: domainRows[0]!.id, lifecycleState: "superseded", triage: domainRows[0]!.triage },
      active: { lifecycleState: "active", version: 2 }
    });

    const retractedDomain = await json<any>(await postJson(app, `/api/propagation/domains/${domainRows[1]!.id}/retract`, {
      flowId: started.flow.id,
      reason: "The geographic claim was unsupported and must leave the active atlas."
    }));
    expect(retractedDomain.revision).toMatchObject({
      kind: "domain-retraction",
      retired: { id: domainRows[1]!.id, lifecycleState: "retracted" },
      active: null
    });
    expect(retractedDomain.closeReadiness.blockers).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "missing-full-domain-atlas" })
    ]));
    const replacementDomain = await json<any>(await postJson(app, "/api/propagation/domains", {
      flowId: started.flow.id,
      domainName: domainRows[1]!.domainName,
      triage: "dependency",
      declaration: "Courthouse placement creates a bounded geographic dependency."
    }));
    expect(replacementDomain.domain).toMatchObject({ lifecycleState: "active", version: 1 });

    const beforeSkip = await json<any>(await app.request(`/api/propagation/runs/${started.flow.id}`));
    expect(beforeSkip.packetCurrentness.pressure.status).toBe("owed");
    const skipped = await json<any>(await postJson(app, beforeSkip.packetCurrentness.pressure.skip.href, {
      reason: "The exact revised packet is archived for the separate cold replay evidence."
    }));
    expect(skipped.record.body).toContain("The exact revised packet is archived");
    const ready = await json<any>(await app.request(`/api/propagation/runs/${started.flow.id}`));
    expect(ready.closeReadiness).toMatchObject({ status: "ready", blockers: [] });

    const closed = await json<any>(await postJson(app, `/api/propagation/runs/${started.flow.id}/close`));
    expect(closed.report).toMatchObject({ recordTypeKey: "propagation_report", canonStatus: "accepted" });
    const reportSections = await json<{ sections: Array<{ heading: string; body: string }> }>(
      await app.request(`/api/records/${closed.report.id}/sections`)
    );
    const shockCone = reportSections.sections.find((section) => section.heading === "Shock-cone orders")!.body;
    const consequenceAudit = reportSections.sections.find((section) => section.heading === "Consequences and dispositions")!.body;
    expect(shockCone).toContain("Only the courthouse market closes during the testimony bell.");
    expect(shockCone).not.toContain("Every market in the city closes");
    expect(consequenceAudit).toContain("Cold Pressure exposed an over-broad market consequence.");
    expect(consequenceAudit).toContain("Every market in the city closes");
    expect(consequenceAudit).toContain("superseded");
    expect(consequenceAudit).toContain("Created by steward (#1)");
    expect(consequenceAudit).toContain("Retired by steward (#1)");

    const postCloseRevision = await postJson(app, `/api/propagation/consequences/${revised.revision.active.id}/revisions`, {
      flowId: started.flow.id,
      reason: "This must be refused after close.",
      orderKey: "first",
      body: "Forbidden post-close replacement.",
      pressure: "high"
    });
    expect(postCloseRevision.status).toBe(400);
    expect(await json<{ error: string }>(postCloseRevision)).toMatchObject({ error: expect.stringMatching(/closed.*refused/i) });

    const originalBeforeCorrection = { id: closed.report.id, body: closed.report.body };
    const correction = await json<{ report: { id: number } }>(await postJson(app, `/api/propagation/reports/${closed.report.id}/corrections`, {
      body: "A later correction remains a new append-only report."
    }));
    expect(correction.report.id).not.toBe(closed.report.id);
    const records = await json<{ records: Array<{ id: number; title: string; body: string; canonStatus: string }> }>(await app.request("/api/records"));
    expect(records.records.find((record) => record.id === closed.report.id)).toMatchObject(originalBeforeCorrection);
    expect(records.records.find((record) => record.id === untouched.record.id)).toMatchObject(untouched.record);
    expect(records.records.find((record) => record.id === fact.id)).toMatchObject({
      id: fact.id,
      canonStatus: "accepted",
      body: "The dead may testify during one courthouse bell each day."
    });
  });

  it("keeps invalid revision and re-disposition actions atomic with row-specific recovery errors", async () => {
    const app = await createWorld();
    const fact = await acceptedFact(app, {
      title: "Atomic bell revision",
      admissionLevel: "3",
      workScale: "major"
    });
    const started = await json<any>(await postJson(app, "/api/propagation/runs/start", { factRecordId: fact.id }));
    const added = await json<any>(await postJson(app, "/api/propagation/consequences", {
      flowId: started.flow.id,
      orderKey: "first",
      body: "Markets pause during bell testimony.",
      pressure: "high"
    }));
    await postJson(app, "/api/propagation/dispositions", {
      consequenceId: added.consequence.id,
      disposition: "answered",
      note: "The calendar absorbs the pause."
    });
    const before = await json<any>(await app.request(`/api/propagation/runs/${started.flow.id}`));
    const beforeRecords = await json<{ records: Array<{ recordTypeKey: string }> }>(await app.request("/api/records"));

    const missingReason = await postJson(app, `/api/propagation/consequences/${added.consequence.id}/revisions`, {
      flowId: started.flow.id,
      reason: "   ",
      orderKey: "first",
      body: "This invalid replacement must not be stored.",
      pressure: "high"
    });
    expect(missingReason.status).toBe(400);
    expect(await json<{ error: string }>(missingReason)).toMatchObject({
      error: expect.stringMatching(/steward-authored reason/i)
    });

    const otherFact = await acceptedFact(app, { title: "Other atomic run", admissionLevel: "1", workScale: "minor" });
    const otherRun = await json<any>(await postJson(app, "/api/propagation/runs/start", { factRecordId: otherFact.id }));
    const crossRun = await postJson(app, `/api/propagation/consequences/${added.consequence.id}/revisions`, {
      flowId: otherRun.flow.id,
      reason: "A different run must not revise this row.",
      orderKey: "first",
      body: "Cross-run replacement must not be stored.",
      pressure: "high"
    });
    expect(crossRun.status).toBe(400);
    expect(await json<{ error: string }>(crossRun)).toMatchObject({
      error: expect.stringMatching(new RegExp(`consequence ${added.consequence.id}.*does not belong.*${otherRun.flow.id}`, "i"))
    });

    const redisposition = await postJson(app, "/api/propagation/dispositions", {
      consequenceId: added.consequence.id,
      disposition: "assigned as canon debt",
      note: "This debt must roll back with the refused re-disposition.",
      debtName: "Rolled-back duplicate disposition debt"
    });
    expect(redisposition.status).toBe(400);
    expect(await json<{ error: string }>(redisposition)).toMatchObject({
      error: expect.stringMatching(new RegExp(`consequence #?${added.consequence.id}.*already dispositioned.*revise`, "i"))
    });

    const after = await json<any>(await app.request(`/api/propagation/runs/${started.flow.id}`));
    expect(after.activeSet).toEqual(before.activeSet);
    expect(after.consequences).toEqual(before.consequences);
    expect(after.dispositions).toEqual(before.dispositions);
    const afterRecords = await json<{ records: Array<{ recordTypeKey: string; title: string }> }>(await app.request("/api/records"));
    expect(afterRecords.records.filter((record) => record.recordTypeKey === "canon_debt")).toHaveLength(
      beforeRecords.records.filter((record) => record.recordTypeKey === "canon_debt").length
    );
    expect(afterRecords.records).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ title: "Rolled-back duplicate disposition debt" })
    ]));
  });
});
