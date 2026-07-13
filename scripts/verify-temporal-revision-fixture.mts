import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { WorldFile } from "../packages/server/src/world-file.ts";

const path = resolve(process.argv[2] ?? "/tmp/worldloom-issue-384-temporal.sqlite");
const priorReportRecordId = Number(process.argv[3] ?? 11);
const world = WorldFile.open(path);
const priorReport = world.getRecord(priorReportRecordId);
const priorSections = world.listSections(priorReportRecordId);
const priorReportFrozenSha256 = createHash("sha256")
  .update(JSON.stringify({ record: priorReport, sections: priorSections }))
  .digest("hex");
const siblingObligations = world.db.prepare(`
  SELECT id, record_id, pass_key, ordinal, disposition, rationale,
         covering_report_record_id, created_at, updated_at
  FROM conditional_pass_obligations
  ORDER BY ordinal
`).all();
const protectedRecords = world.listRecords()
  .filter((record) => [1, 2, 4, 5, 6, 8, 9, 10, 12].includes(record.id))
  .map((record) => ({
    id: record.id,
    shortId: record.shortId,
    recordTypeKey: record.recordTypeKey,
    title: record.title,
    body: record.body,
    truthLayer: record.truthLayer,
    canonStatus: record.canonStatus,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  }));

world.close();
process.stdout.write(`${JSON.stringify({
  path,
  priorReport: { id: priorReport.id, shortId: priorReport.shortId, priorReportFrozenSha256 },
  siblingObligations,
  protectedRecords
}, null, 2)}\n`);
