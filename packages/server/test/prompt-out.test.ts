import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import * as PromptOut from "../src/prompt-out.js";
import { WorldFile } from "../src/world-file.js";

let tempDirs: string[] = [];

const tempPath = (name: string) => {
  const dir = mkdtempSync(join(tmpdir(), "worldloom-prompt-out-"));
  tempDirs.push(dir);
  return join(dir, name);
};

const explicitJudgment = {
  truthLayer: "Objective canon",
  canonStatus: "proposed"
};

afterEach(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  tempDirs = [];
});

describe("Prompt-out module", () => {
  it("owns prompt template listing, edit, revert, and prompt generation", () => {
    const store = WorldFile.create(tempPath("templates.sqlite"));
    const fact = store.createRecord({
      recordTypeKey: "canon_fact",
      title: "Bell courts",
      body: "Bridge courts hear debt bells.",
      ...explicitJudgment
    });

    expect(PromptOut.listPromptTemplates(store)).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: "kernel_pressure", current_text: expect.stringContaining("steward-authored kernel") })
    ]));
    expect(PromptOut.updatePromptTemplate(store, "kernel_pressure", "Custom kernel pressure")).toMatchObject({
      current_text: "Custom kernel pressure",
      current_version: 2
    });
    expect(PromptOut.revertPromptTemplate(store, "kernel_pressure")).toMatchObject({
      current_text: expect.stringContaining("steward-authored kernel"),
      current_version: 3
    });

    const prompt = PromptOut.generatePrompt(store, {
      templateKey: "kernel_pressure",
      recordId: fact.id,
      stepKey: "creation:kernel"
    }).prompt;
    expect(prompt).toContain("Role framing");
    expect(prompt).toContain("Vocabulary guardrail");
    expect(prompt).toContain("Label assumptions instruction");
    expect(prompt).toContain("Standing rulings: none");
    expect(prompt).toContain("Step: creation:kernel");
    expect(prompt).toContain("Bell courts");

    store.close();
  });

  it("owns advisory storage, disposition, standing-ruling reuse, and explicit advisory-use links", () => {
    const store = WorldFile.create(tempPath("advisory.sqlite"));
    const fact = store.createRecord({
      recordTypeKey: "canon_fact",
      title: "Debt witnesses",
      body: "The dead witness toll contracts.",
      ...explicitJudgment
    });
    const prompt = PromptOut.generatePrompt(store, {
      templateKey: "kernel_pressure",
      recordId: fact.id,
      stepKey: "creation:kernel"
    }).prompt;
    const advisory = PromptOut.storeAdvisoryResponse(store, {
      flowKey: "creation",
      flowId: 12,
      stepKey: "creation:kernel",
      promptText: prompt,
      responseText: "Ask who enforces the debt."
    });

    expect(advisory).toMatchObject({ recordTypeKey: "advisory_artifact", title: "Advisory artifact: creation:kernel" });
    expect(advisory.body).toContain("Flow: creation");
    expect(advisory.body).toContain("Flow id: 12");
    expect(advisory.body).toContain("Step: creation:kernel");
    expect(store.listLinks(fact.id)).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ toRecordId: advisory.id, linkTypeKey: "cites_advisory_artifact" })
    ]));
    expect(() => store.updateRecord(advisory.id, { body: "changed" })).toThrow(/append-only/);

    const disposition = PromptOut.disposeAdvisoryArtifact(store, advisory.id, {
      disposition: "standing ruling",
      note: "Keep enforcement concrete",
      standingRuling: true
    });
    expect(disposition).toMatchObject({ disposition: "standing ruling", standing_ruling: 1 });
    expect(PromptOut.generatePrompt(store, { templateKey: "kernel_pressure", recordId: fact.id }).prompt)
      .toContain("Keep enforcement concrete");

    expect(() => PromptOut.linkExplicitAdvisoryUse(store, fact.id, fact.id, {
      derivedFromNote: "Invalid advisory use",
      citationNote: "Invalid advisory citation"
    })).toThrow(/advisory artifact/);
    PromptOut.linkExplicitAdvisoryUse(store, fact.id, advisory.id, {
      derivedFromNote: "Steward authored with advisory material on the table",
      citationNote: "Verbatim advisory artifact consulted"
    });
    expect(store.listLinks(fact.id)).toEqual(expect.arrayContaining([
      expect.objectContaining({ fromRecordId: fact.id, toRecordId: advisory.id, linkTypeKey: "derived_from" }),
      expect.objectContaining({ fromRecordId: fact.id, toRecordId: advisory.id, linkTypeKey: "cites_advisory_artifact" })
    ]));

    store.close();
  });

  it("owns prompt-out skip records and major-or-higher reason enforcement", () => {
    const store = WorldFile.create(tempPath("skip.sqlite"));

    expect(() => PromptOut.recordPromptOutSkip(store, {
      stepKey: "admission:dependencies",
      admissionLevel: "3"
    })).toThrow(/major.*reason/i);

    const minor = PromptOut.recordPromptOutSkip(store, {
      flowKey: "admission",
      flowId: 7,
      stepKey: "admission:dependencies",
      workScale: "minor"
    });
    expect(minor).toMatchObject({ recordTypeKey: "skip_record", title: "Skip: admission:dependencies" });
    expect(minor.body).toContain("Flow: admission");
    expect(minor.body).toContain("Flow id: 7");
    expect(minor.body).toContain("Step: admission:dependencies");
    expect(minor.body).toContain("Reason not collected below major-fact threshold.");

    const major = PromptOut.recordPromptOutSkip(store, {
      flowKey: "contradiction",
      stepKey: "contradiction:boundary_guard",
      workScale: "major",
      reason: "Already covered by standing ruling"
    });
    expect(major.body).toContain("Already covered by standing ruling");

    store.close();
  });
});
