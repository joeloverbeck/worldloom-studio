import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, describe, expect, it } from "vitest";
import * as PromptOut from "../src/prompt-out.js";
import * as CreationFlow from "../src/creation-flow.js";
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

  it("returns packet identity metadata for Creation and Admission generated packets", () => {
    const store = WorldFile.create(tempPath("packet-identity.sqlite"));
    const kernel = store.createRecord({
      recordTypeKey: "world_kernel",
      title: "Broadcast harbor kernel",
      body: "A harbor city whose bells govern power.",
      ...explicitJudgment
    });
    store.replaceSections(kernel.id, [
      { heading: "World premise", body: "Bells govern power allocation.", position: 1 },
      { heading: "Core promise", body: "Every public act has a visible cost.", position: 2 }
    ]);
    const creationFlow = store.createFlowInstance({
      flowKey: "creation",
      currentStep: "kernel:Core promise",
      kernelRecordId: kernel.id
    });

    const creation = PromptOut.generatePrompt(store, {
      flowKey: "creation",
      flowId: Number(creationFlow.id),
      templateKey: "kernel_pressure",
      recordId: kernel.id,
      stepKey: "creation:kernel_prompt",
      mode: "proposal"
    });

    expect(creation.promptOut.packetIdentity).toMatchObject({
      worldPath: store.path,
      flowKey: "creation",
      flowId: Number(creationFlow.id),
      stepKey: "creation:kernel_prompt",
      mode: "proposal",
      templateKey: "kernel_pressure",
      recordId: kernel.id,
      recordShortId: kernel.shortId,
      recordTypeKey: "world_kernel",
      selectedSectionHeading: "Core promise",
      admissionLevel: null,
      workScale: null,
      admissionDraftState: "not_applicable",
      decisionLabel: "Core promise"
    });
    expect(creation.promptOut.packetIdentity.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(creation.promptOut.packetIdentity.packetHash).toMatch(/^[a-f0-9]{64}$/);
    expect(creation.promptOut.packetIdentity.bodyHash).toMatch(/^[a-f0-9]{64}$/);
    const repeatedCreation = PromptOut.generatePrompt(store, {
      flowKey: "creation",
      flowId: Number(creationFlow.id),
      templateKey: "kernel_pressure",
      recordId: kernel.id,
      stepKey: "creation:kernel_prompt",
      mode: "proposal"
    });
    expect(repeatedCreation.promptOut.packetIdentity.packetHash).toBe(creation.promptOut.packetIdentity.packetHash);
    expect(repeatedCreation.promptOut.packetIdentity.bodyHash).toBe(creation.promptOut.packetIdentity.bodyHash);

    const fact = store.createRecord({
      recordTypeKey: "canon_fact",
      title: "Bell tax",
      body: "Every bridge crossing rings a tax bell.",
      ...explicitJudgment
    });
    const admission = PromptOut.generatePrompt(store, {
      flowKey: "admission",
      templateKey: "admission_constraint_challenge",
      recordId: fact.id,
      stepKey: "admission:full_gate",
      mode: "pressure",
      admissionLevel: "4",
      workScale: "severe"
    });

    expect(admission.promptOut.packetIdentity).toMatchObject({
      worldPath: store.path,
      flowKey: "admission",
      flowId: null,
      stepKey: "admission:full_gate",
      mode: "pressure",
      templateKey: "admission_constraint_challenge",
      recordId: fact.id,
      recordShortId: fact.shortId,
      recordTypeKey: "canon_fact",
      selectedSectionHeading: null,
      admissionLevel: "4",
      workScale: "severe",
      admissionDraftState: "missing_required",
      admissionDraftHash: null,
      decisionLabel: fact.title
    });
    expect(admission.promptOut.packetIdentity.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(admission.promptOut.packetIdentity.packetHash).toMatch(/^[a-f0-9]{64}$/);
    expect(admission.promptOut.packetIdentity.bodyHash).toMatch(/^[a-f0-9]{64}$/);
    expect(admission.promptOut.packetIdentity.packetHash).not.toBe(creation.promptOut.packetIdentity.packetHash);
    expect(admission.prompt).toContain("Admission full-gate draft omitted: required draft payload was not provided");

    const admissionWithDraft = PromptOut.generatePrompt(store, {
      flowKey: "admission",
      templateKey: "admission_constraint_challenge",
      recordId: fact.id,
      stepKey: "admission:full_gate",
      mode: "pressure",
      admissionLevel: "4",
      workScale: "severe",
      admissionFullGateDraft: {
        saved: false,
        sectionKeys: ["fact_statement", "dependencies", "institutions_or_quiet_domain_declaration", "branch_implications"],
        sections: [
          { key: "fact_statement", label: "Fact statement", substance: "The toll bell charges every bridge crossing." },
          { key: "dependencies", label: "Dependencies", substance: "Bridge charter, toll collectors, and bell maintenance." },
          { key: "institutions_or_quiet_domain_declaration", label: "Institutions or quiet-domain declaration", quietDomainDeclaration: "The bridge ward is in scope; outer markets stay quiet." },
          { key: "branch_implications", label: "Branch implications", notApplicableReason: "No branch implication in the current continuity." }
        ],
        consequenceText: "Markets now price crossings by bell debt.",
        operations: ["constrain", "price"],
        targetCanonStatus: "accepted with constraints",
        constraintTags: ["cost-bound"],
        followUpDebt: "Propagate bridge-toll economics.",
        advisoryRecordId: 42
      }
    });
    expect(admissionWithDraft.prompt).toContain("Admission full-gate draft status: current unsaved steward draft, not canon.");
    expect(admissionWithDraft.prompt).toContain("Fact statement: The toll bell charges every bridge crossing.");
    expect(admissionWithDraft.prompt).toContain("Dependencies: Bridge charter, toll collectors, and bell maintenance.");
    expect(admissionWithDraft.prompt).toContain("Institutions or quiet-domain declaration quiet-domain declaration: The bridge ward is in scope; outer markets stay quiet.");
    expect(admissionWithDraft.prompt).toContain("Branch implications N/A reason: No branch implication in the current continuity.");
    expect(admissionWithDraft.prompt).toContain("Operation order draft: constrain, price");
    expect(admissionWithDraft.prompt).toContain("Target canon status draft: accepted with constraints");
    expect(admissionWithDraft.prompt).toContain("Constraint tags draft: cost-bound");
    expect(admissionWithDraft.prompt).toContain("Follow-up debt draft: Propagate bridge-toll economics.");
    expect(admissionWithDraft.prompt).toContain("Advisory-use selection draft: advisory record 42");
    expect(admissionWithDraft.prompt).toContain("Omission: Missing full-gate draft substance: Branch implications");
    expect(admissionWithDraft.promptOut.packetIdentity).toMatchObject({
      admissionDraftState: "incomplete",
      admissionDraftHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      admissionSectionKeys: ["fact_statement", "dependencies", "institutions_or_quiet_domain_declaration", "branch_implications"]
    });
    expect(admissionWithDraft.promptOut.packetIdentity.bodyHash).toMatch(/^[a-f0-9]{64}$/);

    const completeAdmissionWithDraft = PromptOut.generatePrompt(store, {
      flowKey: "admission",
      templateKey: "admission_constraint_challenge",
      recordId: fact.id,
      stepKey: "admission:full_gate",
      mode: "pressure",
      admissionLevel: "4",
      workScale: "severe",
      admissionFullGateDraft: {
        saved: false,
        sectionKeys: ["fact_statement", "dependencies"],
        sections: [
          { key: "fact_statement", label: "Fact statement", substance: "The toll bell charges every bridge crossing." },
          { key: "dependencies", label: "Dependencies", substance: "Bridge charter, toll collectors, and bell maintenance." }
        ],
        consequenceText: "Markets now price crossings by bell debt.",
        operations: ["constrain", "price"],
        targetCanonStatus: "accepted with constraints",
        constraintTags: ["cost-bound"]
      }
    });
    expect(completeAdmissionWithDraft.promptOut.packetIdentity).toMatchObject({
      admissionDraftState: "represented",
      admissionDraftHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      bodyHash: expect.stringMatching(/^[a-f0-9]{64}$/)
    });

    store.close();
  });

  it("threads Creation seed-family coverage inventory into decomposition Proposal and Pressure packets", () => {
    const store = WorldFile.create(tempPath("creation-coverage-prompt.sqlite"));
    const flow = CreationFlow.startCreationFlow(store) as { id: number };
    const saved = CreationFlow.saveKernelStep(store, {
      flowId: flow.id,
      heading: "Foundational facts",
      body: "Temporal access, anti-aging chemistry, and spinal implant boundaries.",
      consequenceMode: "hard speculative"
    }) as { kernel: { id: number } };
    const decomposed = CreationFlow.decomposeSeeds(store, {
      flowId: flow.id,
      kernelRecordId: saved.kernel.id,
      granularityRationale: "Temporal access is independently rejectable.",
      seeds: [{ title: "Temporal access tool", body: "A device opens one-way temporal access windows.", truthLayer: "Objective canon", granularityConfirmed: true }]
    }) as { report: { id: number }; records: Array<{ id: number }> };
    const confirmed = CreationFlow.confirmCoverageRows(store, {
      kernelRecordId: saved.kernel.id,
      seedDecompositionReportId: decomposed.report.id,
      rows: [
        { label: "Temporal access", sourceKernelContext: "The temporal-access seed family.", required: true },
        { label: "Anti-aging chemistry", sourceKernelContext: "Chemistry remains implicit in the kernel.", required: true },
        { label: "Spinal implant boundaries", sourceKernelContext: "Implant limits remain intentionally out of scope.", required: true }
      ]
    });
    CreationFlow.linkCoverageRowToSeeds(store, { rowId: confirmed.rows[0]!.id, seedRecordIds: [decomposed.records[0]!.id], seedDecompositionReportId: decomposed.report.id });
    CreationFlow.deferCoverageRow(store, { rowId: confirmed.rows[1]!.id, rationale: "Chemistry is seed debt for the next Creation pass." });
    CreationFlow.markCoverageRowOutOfScope(store, { rowId: confirmed.rows[2]!.id, rationale: "Implant boundaries are excluded from this pass." });
    const recordsBeforePrompt = store.listRecords();
    const linksBeforePrompt = store.listLinks();
    const coverageRowsBeforePrompt = store.db.prepare("SELECT * FROM creation_seed_family_coverage ORDER BY id").all();
    const coverageLinksBeforePrompt = store.db.prepare("SELECT * FROM creation_seed_family_coverage_links ORDER BY id").all();

    const proposal = PromptOut.generatePrompt(store, {
      flowKey: "creation",
      templateKey: "decomposition_pressure",
      recordId: decomposed.report.id,
      stepKey: "creation:decomposition_prompt",
      mode: "proposal"
    }).prompt;
    const pressure = PromptOut.generatePrompt(store, {
      flowKey: "creation",
      templateKey: "decomposition_pressure",
      recordId: decomposed.report.id,
      stepKey: "creation:decomposition_prompt",
      mode: "pressure"
    }).prompt;

    for (const prompt of [proposal, pressure]) {
      expect(prompt).toContain("Creation seed-family coverage inventory");
      expect(prompt).toContain("Coverage row: Temporal access");
      expect(prompt).toContain("Disposition: covered");
      expect(prompt).toContain("Linked proposed seed");
      expect(prompt).toContain("Coverage row: Anti-aging chemistry");
      expect(prompt).toContain("Disposition: deferred");
      expect(prompt).toContain("Chemistry is seed debt");
      expect(prompt).toContain("Coverage row: Spinal implant boundaries");
      expect(prompt).toContain("Disposition: out_of_scope");
      expect(prompt).toContain("Implant boundaries are excluded");
      expect(prompt).toContain("Source record: Creation coverage inventory");
      expect(prompt).toContain("Canon status: proposed");
      expect(prompt).toContain("no automatic coverage disposition");
      expect(prompt).toContain("no automatic seed creation");
    }
    expect(proposal).toContain("Draft labeled candidate split material");
    expect(pressure).toContain("Provide pressure, risks, alternatives, and questions");
    expect(store.listRecords()).toEqual(recordsBeforePrompt);
    expect(store.listLinks()).toEqual(linksBeforePrompt);
    expect(store.db.prepare("SELECT * FROM creation_seed_family_coverage ORDER BY id").all()).toEqual(coverageRowsBeforePrompt);
    expect(store.db.prepare("SELECT * FROM creation_seed_family_coverage_links ORDER BY id").all()).toEqual(coverageLinksBeforePrompt);

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

    const pressure = PromptOut.generatePrompt(store, {
      flowKey: "creation",
      templateKey: "decomposition_pressure",
      recordId: decomposition.id,
      stepKey: "creation:decomposition_prompt",
      mode: "pressure"
    });
    const prompt = pressure.prompt;

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

    const proposal = PromptOut.generatePrompt(store, {
      flowKey: "creation",
      templateKey: "decomposition_pressure",
      recordId: decomposition.id,
      stepKey: "creation:decomposition_prompt",
      mode: "proposal"
    });
    expect(proposal.promptOut.packetIdentity).toMatchObject({
      flowKey: "creation",
      worldPath: store.path,
      recordId: decomposition.id,
      recordShortId: decomposition.shortId,
      recordTypeKey: "seed_decomposition",
      selectedSectionHeading: null,
      stepKey: "creation:decomposition_prompt",
      mode: "proposal",
      templateKey: "decomposition_pressure",
      decisionLabel: "Echo seed split",
      packetHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      bodyHash: expect.stringMatching(/^[a-f0-9]{64}$/)
    });
    expect(proposal.prompt).toContain("Flow creation, step creation:decomposition_prompt: decide whether the seed decomposition is ready to hand to Admission.");
    expect(proposal.prompt).toContain("Seed decomposition report");
    expect(proposal.prompt).toContain("Parked seeds:");
    expect(proposal.prompt).toContain("Draft labeled candidate split material");
    expect(proposal.prompt).toContain("Method card: creation.seed-decomposition");
    expect(proposal.prompt).not.toContain("Flow creation, step creation:decomposition_prompt; selected record");

    store.close();
  });

  it("keeps Creation decomposition Proposal and Pressure packets on the same post-park context", () => {
    const store = WorldFile.create(tempPath("decomposition-parity.sqlite"));
    const kernel = store.createRecord({
      recordTypeKey: "world_kernel",
      title: "Echo city kernel",
      body: "The city courts debts through seven-day echoes.",
      ...explicitJudgment
    });
    store.replaceSections(kernel.id, [
      { heading: "World premise", body: "The dead leave seven-day legal echoes.", position: 1 },
      { heading: "Primary pressures and initial domains", body: "Courts, mortuary advocates, and poor households feel pressure first.", position: 8 }
    ]);
    const decomposition = store.createRecord({
      recordTypeKey: "seed_decomposition",
      title: "Echo seed split",
      body: "Echo laws split into testimony, cost, and enforcement seeds.",
      ...explicitJudgment
    });
    store.replaceSections(decomposition.id, [
      { heading: "Kernel source", body: `${kernel.shortId} ${kernel.title}`, position: 1 },
      { heading: "Granularity decisions", body: "Identity testing and court admissibility can be rejected independently.", position: 2 },
      { heading: "Parked seeds", body: "Echo court testimony", position: 3 },
      { heading: "Thin-start boundary", body: "Admission intent: audit jurisdiction and cost before first standing.", position: 4 }
    ]);
    const seed = store.createRecord({
      recordTypeKey: "canon_fact",
      title: "Echo court testimony",
      body: "Harbor courts accept echo testimony only after identity testing.",
      truthLayer: "Objective canon",
      canonStatus: "proposed"
    });
    store.createLink(seed.id, kernel.id, "derived_from", "Seed decomposed from world kernel");
    store.createLink(seed.id, decomposition.id, "derived_from", "Seed recorded by decomposition report");

    const proposal = PromptOut.generatePrompt(store, {
      flowKey: "creation",
      templateKey: "decomposition_pressure",
      recordId: decomposition.id,
      stepKey: "creation:decomposition_prompt",
      mode: "proposal"
    });
    const pressure = PromptOut.generatePrompt(store, {
      flowKey: "creation",
      templateKey: "decomposition_pressure",
      recordId: decomposition.id,
      stepKey: "creation:decomposition_prompt",
      mode: "pressure"
    });

    const sharedDecisionBearingMarkers = [
      "Echo seed split",
      "Echo laws split into testimony, cost, and enforcement seeds.",
      "Identity testing and court admissibility can be rejected independently.",
      "Admission intent: audit jurisdiction and cost before first standing.",
      "Echo court testimony",
      "Harbor courts accept echo testimony only after identity testing.",
      "Truth layer: Objective canon",
      "Canon status: proposed",
      "Supporting kernel context",
      "The dead leave seven-day legal echoes.",
      "Courts, mortuary advocates, and poor households feel pressure first.",
      "Frontloaded seed audit results omitted: Admission owns that instrument and no result exists yet.",
      "Admission gate results omitted: Admission has not selected severity or run a gate yet.",
      "Source record: parked seed",
      "Source record: supporting kernel",
      "Pasted responses stay advisory artifacts"
    ];
    for (const marker of sharedDecisionBearingMarkers) {
      expect(proposal.prompt).toContain(marker);
      expect(pressure.prompt).toContain(marker);
    }
    expect(proposal.promptOut.packetIdentity).toMatchObject({
      mode: "proposal",
      recordId: decomposition.id,
      recordTypeKey: "seed_decomposition",
      decisionLabel: "Echo seed split"
    });
    expect(pressure.promptOut.packetIdentity).toMatchObject({
      mode: "pressure",
      recordId: decomposition.id,
      recordTypeKey: "seed_decomposition",
      decisionLabel: "Echo seed split"
    });
    expect(proposal.prompt).toContain("Draft labeled candidate split material");
    expect(proposal.prompt).toContain("Structural skeleton example (proposal mode)");
    expect(pressure.prompt).toContain("Provide pressure, risks, alternatives, and questions");
    expect(pressure.prompt).toContain("Structural skeleton example (pressure mode)");
    expect(proposal.prompt).not.toContain("Flow creation, step creation:decomposition_prompt; selected record");
    expect(pressure.prompt).not.toContain("Flow creation, step creation:decomposition_prompt; selected record");

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
