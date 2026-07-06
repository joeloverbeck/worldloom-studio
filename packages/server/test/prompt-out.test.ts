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
      current_text: "Custom kernel pressure"
    });
    expect(PromptOut.revertPromptTemplate(store, "kernel_pressure")).toMatchObject({
      current_text: expect.stringContaining("steward-authored kernel")
    });

    const prompt = PromptOut.generatePrompt(store, {
      templateKey: "kernel_pressure",
      recordId: fact.id,
      stepKey: "creation:kernel"
    }).prompt;
    expect(prompt).toContain("Role stance (not an accuracy claim)");
    expect(prompt).toContain("Vocabulary guardrail");
    expect(prompt).toContain("Label assumptions instruction");
    expect(prompt).toContain("<standing_rulings>");
    expect(prompt).toContain("- none");
    expect(prompt).toContain("Step: creation:kernel");
    expect(prompt).toContain("Bell courts");

    store.close();
  });

  it("renders proposal packets with the research-backed sandwich contract", () => {
    const store = WorldFile.create(tempPath("sandwich-proposal.sqlite"));
    const fact = store.createRecord({
      recordTypeKey: "canon_fact",
      title: "Bell courts",
      body: "Bridge courts hear debt bells.",
      ...explicitJudgment
    });

    const prompt = PromptOut.generatePrompt(store, {
      flowKey: "admission",
      templateKey: "admission_prerequisite_audit",
      recordId: fact.id,
      stepKey: "admission:dependencies",
      mode: "proposal"
    }).prompt;

    expect(prompt).toContain("<compact_top_block>");
    expect(prompt).toContain("<context_packet>");
    expect(prompt).toContain("<bearing_context>");
    expect(prompt).toContain("<package_doctrine>");
    expect(prompt).toContain("<decision_material>");
    expect(prompt).toContain("<documents>");
    expect(prompt).toContain("<document>");
    expect(prompt).toContain("<source>selected_record:");
    expect(prompt).toContain("<document_content>");
    expect(prompt).toContain("Quote-grounding pre-step");
    expect(prompt).toContain("alternatives that differ along named axes: premise, mechanism, and consequence");
    expect(prompt).toContain("Prohibition: do not assign canon standing");
    expect(prompt).toContain("Rationale: only Admission and the steward can change canon standing");
    expect(prompt).toContain("Positive restatement: label every proposal as a candidate for steward review");
    expect(prompt).toContain("Output-label names");
    expect(prompt).toContain("Structural skeleton example (proposal mode)");
    expect(prompt.match(/Structural skeleton example/g)).toHaveLength(1);
    expect(prompt).toMatch(/Current decision[\s\S]*Based on the material above/);
    expect(prompt).not.toContain("```json");
    expect(prompt).not.toContain("<json>");

    store.close();
  });

  it("renders decomposition pressure packets with source documents, rationalized constraints, and one skeleton", () => {
    const store = WorldFile.create(tempPath("sandwich-decomposition.sqlite"));
    const kernel = store.createRecord({
      recordTypeKey: "world_kernel",
      title: "Echo city kernel",
      body: "A city built on echoes.",
      ...explicitJudgment
    });
    const decomposition = store.createRecord({
      recordTypeKey: "seed_decomposition",
      title: "Echo seed split",
      body: "Echo laws split into testimony, cost, and enforcement seeds.",
      ...explicitJudgment
    });
    store.replaceSections(decomposition.id, [
      { heading: "Kernel source", body: "KER-1 World kernel", position: 1 },
      { heading: "Granularity decisions", body: "Each seed can be rejected independently.", position: 2 },
      { heading: "Parked seeds", body: "FAC-1 Echo court testimony", position: 3 },
      { heading: "Thin-start boundary", body: "Admission intent: audit in Admission.", position: 4 }
    ]);
    const seed = store.createRecord({
      recordTypeKey: "canon_fact",
      title: "Echo court testimony",
      body: "Courts accept echo testimony under conditions.",
      ...explicitJudgment
    });
    store.createLink(seed.id, kernel.id, "derived_from", "Seed decomposed from world kernel");
    store.createLink(seed.id, decomposition.id, "derived_from", "Seed recorded by decomposition report");

    const prompt = PromptOut.generatePrompt(store, {
      flowKey: "creation",
      templateKey: "decomposition_pressure",
      recordId: decomposition.id,
      stepKey: "creation:decomposition_prompt",
      mode: "pressure"
    }).prompt;

    expect(prompt).toContain("<compact_top_block>");
    expect(prompt).toContain("<source>seed_decomposition_report:");
    expect(prompt).toContain("<source>parked_seed:");
    expect(prompt).toContain("<source>supporting_kernel:");
    expect(prompt).toContain("Quote-grounding pre-step");
    expect(prompt).toContain("Prohibition: do not write final canon");
    expect(prompt).toContain("Positive restatement: return challenge, risks, alternatives, and questions");
    expect(prompt).toContain("Structural skeleton example (pressure mode)");
    expect(prompt.match(/Structural skeleton example/g)).toHaveLength(1);
    expect(prompt).toContain("Based on the material above");

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
