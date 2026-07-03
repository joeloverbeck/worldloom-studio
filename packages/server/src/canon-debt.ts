import type { RecordRow, WorldFile } from "./world-file.js";

export const listCanonDebt = (worldFile: WorldFile, openOnly = false): RecordRow[] =>
  worldFile.listCanonDebt(openOnly);

export const createCanonDebt = (
  worldFile: WorldFile,
  input: { name: string; scope: string; assignee: string; body?: string }
): RecordRow =>
  worldFile.createCanonDebt(input);

export const closeCanonDebt = (worldFile: WorldFile, id: number): RecordRow =>
  worldFile.closeCanonDebt(id);
