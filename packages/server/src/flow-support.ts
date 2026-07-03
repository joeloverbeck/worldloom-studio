import type { RecordRow, WorldFile } from "./world-file.js";

export const createSkipRecord = (
  worldFile: WorldFile,
  input: { stepKey: string; reason?: string }
): RecordRow =>
  worldFile.createRecord({
    recordTypeKey: "skip_record",
    title: `Skip: ${input.stepKey}`,
    body: input.reason ? `Step: ${input.stepKey}\nReason: ${input.reason}` : `Step: ${input.stepKey}\nReason not collected below major-fact threshold.`,
    truthLayer: "Objective canon",
    canonStatus: "proposed"
  });
