import type { FlowInstanceRow, WorldFile } from "./world-file.js";

export interface CreationNarrowingNoteCorrectionRow {
  id: number;
  seedRecordId: number;
  correctionContextRecordId: number;
  actionKey: "admission_narrowing_note";
  rationale: string;
  narrowingNote: string;
  createdAt: string;
}

const normalizedCreationCorrectionText = (value: string | undefined): string =>
  (value ?? "").replace(/\r\n/g, "\n").trim();

const narrowingNoteRow = (row: Record<string, unknown>): CreationNarrowingNoteCorrectionRow => ({
  id: Number(row.id),
  seedRecordId: Number(row.seedRecordId),
  correctionContextRecordId: Number(row.correctionContextRecordId),
  actionKey: "admission_narrowing_note",
  rationale: String(row.rationale),
  narrowingNote: String(row.narrowingNote),
  createdAt: String(row.createdAt)
});

export const creationNarrowingNoteCorrectionsForSeed = (
  world: WorldFile,
  seedRecordId: number
): CreationNarrowingNoteCorrectionRow[] =>
  world.db.prepare(`
    SELECT id,
           seed_record_id AS seedRecordId,
           correction_context_record_id AS correctionContextRecordId,
           action_key AS actionKey,
           rationale,
           narrowing_note AS narrowingNote,
           created_at AS createdAt
    FROM creation_narrowing_note_corrections
    WHERE seed_record_id = ?
    ORDER BY id
  `).all(seedRecordId).map((row) => narrowingNoteRow(row as Record<string, unknown>));

export const findCreationNarrowingNoteCorrection = (
  world: WorldFile,
  seedRecordId: number
): CreationNarrowingNoteCorrectionRow | null => {
  const row = world.db.prepare(`
    SELECT id,
           seed_record_id AS seedRecordId,
           correction_context_record_id AS correctionContextRecordId,
           action_key AS actionKey,
           rationale,
           narrowing_note AS narrowingNote,
           created_at AS createdAt
    FROM creation_narrowing_note_corrections
    WHERE seed_record_id = ?
      AND action_key = 'admission_narrowing_note'
    ORDER BY id
    LIMIT 1
  `).get(seedRecordId) as Record<string, unknown> | undefined;
  return row ? narrowingNoteRow(row) : null;
};

export const creationNarrowingNoteCorrectionMatchesInput = (
  row: CreationNarrowingNoteCorrectionRow,
  input: { rationale?: string; narrowingNote?: string }
): boolean =>
  row.rationale === normalizedCreationCorrectionText(input.rationale)
  && row.narrowingNote === normalizedCreationCorrectionText(input.narrowingNote);

export const recordCreationNarrowingNoteCorrection = (
  world: WorldFile,
  input: { seedRecordId: number; correctionContextRecordId: number; rationale?: string; narrowingNote?: string }
): void => {
  world.db.prepare(`
    INSERT INTO creation_narrowing_note_corrections (
      seed_record_id,
      correction_context_record_id,
      action_key,
      rationale,
      narrowing_note
    )
    VALUES (?, ?, 'admission_narrowing_note', ?, ?)
  `).run(
    input.seedRecordId,
    input.correctionContextRecordId,
    normalizedCreationCorrectionText(input.rationale),
    normalizedCreationCorrectionText(input.narrowingNote)
  );
};

export const findLatestCreationFlowByKernelRecord = (
  world: WorldFile,
  kernelRecordId: number
): FlowInstanceRow | null =>
  (world.db.prepare(`
    SELECT *
    FROM flow_instances
    WHERE flow_key = 'creation'
      AND kernel_record_id = ?
    ORDER BY id DESC
    LIMIT 1
  `).get(kernelRecordId) as FlowInstanceRow | undefined) ?? null;
