import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import {
  METHOD_CARD_DERIVATION_VERSION,
  METHOD_CARDS,
  methodCard,
  methodCardDoctrineSlots,
  untestedSurfacePackageSources
} from "../src/method-cards.js";

let tempDirs: string[] = [];

const tempPath = (name: string) => {
  const dir = mkdtempSync(join(tmpdir(), "worldloom-method-cards-"));
  tempDirs.push(dir);
  return join(dir, name);
};

const json = async <T,>(response: Response): Promise<T> => response.json() as Promise<T>;

const postJson = (app: ReturnType<typeof createApp>, path: string, body: unknown) =>
  app.request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });

const createWorld = async () => {
  const app = createApp();
  expect((await postJson(app, "/api/worlds/create", { path: tempPath("method-cards.sqlite") })).status).toBe(201);
  return app;
};

const createRecord = async (
  app: ReturnType<typeof createApp>,
  body: { recordTypeKey: string; title: string; body: string; truthLayer?: string; canonStatus?: string }
) => {
  const response = await postJson(app, "/api/records", {
    truthLayer: "Objective canon",
    canonStatus: "proposed",
    ...body
  });
  expect(response.status).toBe(201);
  return json<{ record: { id: number; shortId: string; title: string; recordTypeKey: string } }>(response);
};

afterEach(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs = [];
});

describe("method-card guidance layer", () => {
  it("documents the method-card contract, coverage list, and untested-surface exclusion", () => {
    const spec = readFileSync(new URL("../../../docs/specs/method-cards.md", import.meta.url), "utf8");

    expect(spec).toContain("one coherent block of steward-authored material");
    expect(spec).toContain("upstream package sources");
    expect(spec).toContain("derivation version marker");
    expect(spec).toContain("re-check list");
    expect(spec).toContain("docs/worldbuilding-system/22_glossary.md");
    expect(spec).toContain("Package file paths are provenance");
    expect(spec).toContain("Guidance depth follows `docs/principles/workflow-principles.md` W-2");
    for (const surface of ["Creation", "Admission", "Constraint Composition", "Temporal/Timeline", "Stage 12", "Propagation", "Contradiction/Retcon/Mystery", "QA", "Setup and workflow map"]) {
      expect(spec).toContain(surface);
    }
    for (const excluded of ["spatial/geographic", "agent/character psychology", "uncertainty/belief/evidence", "narrative/game/transmedia extraction", "aesthetic coherence"]) {
      expect(spec).toContain(excluded);
    }
  });

  it("keeps every guided card versioned, sourced, and away from honestly untested package surfaces", () => {
    const requiredKeys = [
      "creation.kernel",
      "creation.seed-decomposition",
      "admission.queue-severity",
      "admission.minor-ledger",
      "admission.full-gate",
      "admission.seed-audit",
      "constraint.source-selection",
      "constraint.constrained-fact",
      "constraint.inventory",
      "constraint.composition",
      "constraint.leakage-residue",
      "constraint.outcomes",
      "constraint.prompt-out-skips",
      "constraint.close-preview",
      "constraint.read-side-trail",
      "temporal.run-entry",
      "temporal.questions",
      "temporal.date-type-granularity",
      "temporal.latency-residue",
      "temporal.sequence-retrospective",
      "temporal.mystery-boundaries",
      "temporal.outcomes",
      "temporal.prompt-out-skips",
      "temporal.close-preview",
      "temporal.read-side-trail",
      "stage12.entry",
      "stage12.lens",
      "stage12.outcomes",
      "stage12.close-readiness",
      "propagation.entry",
      "propagation.shock-cone-orders",
      "propagation.domain-atlas",
      "propagation.disposition",
      "propagation.proposals",
      "propagation.close",
      "contradiction.triage",
      "contradiction.work-scale",
      "contradiction.disposition",
      "contradiction.repair",
      "contradiction.retcon-cost",
      "contradiction.repair-propagation",
      "contradiction.mystery-preservation",
      "contradiction.close",
      "qa.entry",
      "qa.scorecard",
      "qa.regression-profile",
      "qa.pass-fail-floor",
      "qa.repair-routing",
      "qa.finalize",
      "setup.open-world",
      "workflow-map.orientation",
      "operating-card"
    ];

    expect(METHOD_CARDS.map((card) => card.key)).toEqual(expect.arrayContaining(requiredKeys));
    for (const card of METHOD_CARDS) {
      expect(card.derivationVersion).toBe(METHOD_CARD_DERIVATION_VERSION);
      expect(card.decision.trim()).not.toBe("");
      expect(card.operativeRule.trim()).not.toBe("");
      expect(card.why.trim()).not.toBe("");
      expect(card.goodMaterial.trim()).not.toBe("");
      expect(card.packageSources.length).toBeGreaterThan(0);
      expect(["lean", "standard", "full"]).toContain(card.guidanceDepth);
      expect(card.packageSources).not.toEqual(expect.arrayContaining(untestedSurfacePackageSources));
    }
    expect(methodCard("admission.minor-ledger").guidanceDepth).toBe("lean");
    expect(methodCard("admission.full-gate").guidanceDepth).toBe("full");
  });

  it("serves method cards through the current HTTP payload shapes", async () => {
    const app = await createWorld();
    const fact = await createRecord(app, {
      recordTypeKey: "canon_fact",
      title: "Bell toll law",
      body: "The city charges grief-tolls at every bridge.",
      canonStatus: "proposed"
    });

    const workflow = await json<{
      methodCards: {
        setup: { key: string; operativeRule: string };
        workflowMap: { key: string; operativeRule: string };
        operatingCard: { key: string; operativeRule: string; packageSources: string[] };
      };
    }>(await app.request("/api/workflow-map"));
    expect(workflow.methodCards.setup.key).toBe("setup.open-world");
    expect(workflow.methodCards.workflowMap.operativeRule).toContain("The map is the home surface");
    expect(workflow.methodCards.operatingCard).toMatchObject({
      key: "operating-card",
      packageSources: expect.arrayContaining(["docs/worldbuilding-system/operating_card.md"])
    });

    const creation = await json<{
      decisionPoint: {
        methodCard: { key: string; operativeRule: string };
        sharedContract: { methodCard: { key: string }; doctrine: { slots: string[]; packageSources: string[] } };
      };
    }>(await postJson(app, "/api/flows/creation/start", {}));
    expect(creation.decisionPoint.methodCard).toMatchObject({
      key: "creation.kernel",
      operativeRule: expect.stringContaining("Start lean")
    });
    expect(creation.decisionPoint.sharedContract).toMatchObject({
      methodCard: { key: "creation.kernel" },
      doctrine: {
        slots: expect.arrayContaining(methodCardDoctrineSlots(methodCard("creation.kernel"))),
        packageSources: expect.arrayContaining(["docs/worldbuilding-system/05_creation_protocol.md#phase-1-world-kernel"])
      }
    });

    const admission = await json<{ decisionPoint: { methodCard: { key: string; guidanceDepth: string }; sharedContract: { methodCard: { key: string } } } }>(
      await app.request(`/api/admission/records/${fact.record.id}/decision-point`)
    );
    expect(admission.decisionPoint.methodCard).toMatchObject({ key: "admission.queue-severity", guidanceDepth: "standard" });

    const minor = await json<{ decisionPoint: { methodCard: { key: string; guidanceDepth: string } } }>(
      await postJson(app, `/api/admission/records/${fact.record.id}/severity`, { admissionLevel: "1", workScale: "minor" })
    );
    expect(minor.decisionPoint.methodCard).toMatchObject({ key: "admission.minor-ledger", guidanceDepth: "lean" });

    const full = await json<{ decisionPoint: { methodCard: { key: string; guidanceDepth: string } } }>(
      await postJson(app, `/api/admission/records/${fact.record.id}/severity`, { admissionLevel: "4", workScale: "major" })
    );
    expect(full.decisionPoint.methodCard).toMatchObject({ key: "admission.full-gate", guidanceDepth: "full" });

    const constraint = await json<{ decisionPoint: { sharedContract: { methodCard: { key: string }; doctrine: { slots: string[] } } } }>(
      await postJson(app, "/api/constraint-composition/runs/start", {
        sourceType: "material",
        materialTitle: "Bridge toll constraints",
        materialBody: "Only licensed ferrymen can waive tolls.",
        constrainedSubject: "bridge tolls"
      })
    );
    expect(constraint.decisionPoint.sharedContract.methodCard.key).toBe("constraint.source-selection");
    expect(constraint.decisionPoint.sharedContract.doctrine.slots).toEqual(expect.arrayContaining(methodCardDoctrineSlots(methodCard("constraint.source-selection"))));

    const temporal = await json<{ decisionPoint: { sharedContract: { methodCard: { key: string }; doctrine: { slots: string[] } } }; methodCards: Array<{ key: string }> }>(
      await postJson(app, "/api/temporal/runs/start", {
        sourceType: "fact",
        recordId: fact.record.id
      })
    );
    expect(temporal.decisionPoint.sharedContract.methodCard.key).toBe("temporal.run-entry");
    expect(temporal.decisionPoint.sharedContract.doctrine.slots).toEqual(expect.arrayContaining(methodCardDoctrineSlots(methodCard("temporal.run-entry"))));
    expect(temporal.methodCards.map((card) => card.key)).toEqual(expect.arrayContaining(["temporal.questions", "temporal.outcomes", "temporal.read-side-trail"]));

    const stage12 = await json<{ methodCard: { key: string }; methodCards: Array<{ key: string }> }>(
      await postJson(app, "/api/institutional/runs/start", {
        sourceType: "material",
        materialTitle: "Toll office",
        materialBody: "The toll office prices mourning routes."
      })
    );
    expect(stage12.methodCard.key).toBe("stage12.entry");
    expect(stage12.methodCards.map((card) => card.key)).toEqual(expect.arrayContaining(["stage12.entry", "stage12.lens", "stage12.outcomes", "stage12.close-readiness"]));

    const propagationPlan = await json<{ plan: { methodCard: { key: string }; methodCards: Array<{ key: string }> } }>(
      await app.request(`/api/propagation/records/${fact.record.id}/plan`)
    );
    expect(propagationPlan.plan.methodCard.key).toBe("propagation.entry");
    expect(propagationPlan.plan.methodCards.map((card) => card.key)).toEqual(expect.arrayContaining(["propagation.entry", "propagation.disposition"]));

    const contradictionStart = await json<{ flow: { id: number } }>(
      await postJson(app, "/api/contradiction/runs/start", { title: "Bridge toll contradiction" })
    );
    const contradiction = await json<{ methodCard: { key: string }; methodCards: Array<{ key: string }> }>(
      await app.request(`/api/contradiction/runs/${contradictionStart.flow.id}`)
    );
    expect(contradiction.methodCard.key).toBe("contradiction.triage");
    expect(contradiction.methodCards.map((card) => card.key)).toContain("contradiction.mystery-preservation");

    const qa = await json<{ scorecard: { methodCard: { key: string }; methodCards: Array<{ key: string }> } }>(
      await postJson(app, "/api/qa/passes/start", { subjectType: "world", title: "Whole-world QA" })
    );
    expect(qa.scorecard.methodCard.key).toBe("qa.entry");
    expect(qa.scorecard.methodCards.map((card) => card.key)).toContain("qa.scorecard");
  });

  it("uses the same method-card words in prompt packets and confines package paths to the source manifest", async () => {
    const app = await createWorld();
    const kernel = await createRecord(app, {
      recordTypeKey: "world_kernel",
      title: "Mourningweather kernel",
      body: "Public grief becomes literal storms.",
      canonStatus: "proposed"
    });
    const generated = await json<{ prompt: string }>(await postJson(app, "/api/prompt-out/generate", {
      flowKey: "creation",
      templateKey: "kernel_pressure",
      recordId: kernel.record.id,
      stepKey: "creation:kernel_prompt"
    }));

    const kernelCard = methodCard("creation.kernel");
    expect(generated.prompt).toContain(`Operative rule: ${kernelCard.operativeRule}`);
    expect(generated.prompt).toContain(`Why the method asks: ${kernelCard.why}`);
    expect(generated.prompt).toContain(`What good material looks like: ${kernelCard.goodMaterial}`);
    expect(generated.prompt).toContain(`Method card: ${kernelCard.key} (${kernelCard.derivationVersion})`);

    const [primaryPromptText, sourceManifest] = generated.prompt.split("Source manifest:");
    expect(primaryPromptText).not.toContain("docs/worldbuilding-system/");
    expect(sourceManifest).toContain("Package source: docs/worldbuilding-system/05_creation_protocol.md");
    expect(sourceManifest).toContain("Package source: docs/worldbuilding-system/templates/world_kernel.md");
  });
});
