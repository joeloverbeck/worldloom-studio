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

afterEach(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs = [];
});

describe("Propagation active owed route server contract", () => {
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
});
