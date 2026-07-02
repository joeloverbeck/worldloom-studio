import { parkCreationSeedForAdmission } from "./admission-flow.js";
import { createSkipRecord } from "./flow-support.js";
import type { RecordRow, WorldFile } from "./world-file.js";

type AdmissionSeedInput = { title: string; body: string; truthLayer: string; canonStatus: string };

export const startCreationFlow = (worldFile: WorldFile): unknown => {
  const row = worldFile.findLatestInProgressFlow("creation");
  if (row) return row;
  return worldFile.createFlowInstance({ flowKey: "creation", currentStep: "kernel:World premise" });
};

export const saveKernelStep = (
  worldFile: WorldFile,
  input: { flowId: number; heading: string; body: string; consequenceMode?: string }
): unknown =>
  worldFile.atomicWrite(() => {
    const flow = worldFile.getFlowInstance(input.flowId, "creation") as { kernel_record_id: number | null };
    const kernelId = flow.kernel_record_id ?? worldFile.createRecord({
      recordTypeKey: "world_kernel",
      title: "World kernel",
      body: "",
      truthLayer: "Objective canon",
      canonStatus: "proposed"
    }).id;
    if (!flow.kernel_record_id) {
      worldFile.updateFlowInstance(input.flowId, { kernelRecordId: kernelId });
    }
    const heading = worldFile.sectionHeadings("world_kernel").find((row) => String((row as { heading: string }).heading) === input.heading) as { position: number } | undefined;
    if (!heading) throw new Error(`Unknown kernel step: ${input.heading}`);
    worldFile.replaceSections(kernelId, [{ heading: input.heading, body: input.body, position: Number(heading.position) }]);
    if (input.consequenceMode) {
      const existing = worldFile.listFacets(kernelId).filter((facet) => facet.vocabulary === "consequence_mode");
      for (const facet of existing) worldFile.removeFacet(kernelId, facet.id);
      worldFile.addFacet(kernelId, { vocabulary: "consequence_mode", term: input.consequenceMode, position: 1 });
    }
    const updatedFlow = worldFile.updateFlowInstance(input.flowId, { currentStep: `kernel:${input.heading}` });
    return { flow: updatedFlow, kernel: worldFile.getRecord(kernelId), sections: worldFile.listSections(kernelId), facets: worldFile.listFacets(kernelId) };
  });

export const recordCreationSkip = (
  worldFile: WorldFile,
  input: { flowId?: number; stepKey: string; reason?: string }
): RecordRow => createSkipRecord(worldFile, input);

export const decomposeSeeds = (
  worldFile: WorldFile,
  input: { flowId: number; kernelRecordId: number; draftIds?: number[]; seeds: AdmissionSeedInput[] }
): unknown => {
  const kernel = worldFile.getRecord(input.kernelRecordId);
  const drafts = (input.draftIds ?? []).map((id) => worldFile.getDraft(id));
  return worldFile.atomicWrite(() => {
    const report = worldFile.createRecord({
      recordTypeKey: "seed_decomposition",
      title: "Seed decomposition",
      body: `Kernel ${kernel.shortId}; drafts consumed: ${drafts.map((draft) => draft.title).join(", ") || "none"}`,
      truthLayer: "Objective canon",
      canonStatus: "proposed"
    });
    worldFile.replaceSections(report.id, [
      { heading: "Kernel source", body: `${kernel.shortId} ${kernel.title}`, position: 1 },
      { heading: "Drafts consumed", body: drafts.map((draft) => `${draft.title}\n${draft.body}`).join("\n\n"), position: 2 },
      { heading: "Granularity decisions", body: "Each parked seed is independently rejectable without destroying its siblings.", position: 3 },
      { heading: "Parked seeds", body: input.seeds.map((seed) => seed.title).join("\n"), position: 4 },
      { heading: "Thin-start boundary", body: "No seed is admitted by this flow; admission is deferred to the admission flow.", position: 5 }
    ]);
    const records = input.seeds.map((seed) => parkCreationSeedForAdmission(worldFile, seed, kernel.id, report.id));
    for (const draft of drafts) worldFile.discardDraft(draft.id);
    const flow = worldFile.updateFlowInstance(input.flowId, { currentStep: "decomposition:complete", state: "complete" });
    return { report, records, flow };
  });
};
