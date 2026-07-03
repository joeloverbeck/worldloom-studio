export interface DeclaredSeverity {
  admissionLevel: string | null;
  workScale: string | null;
}

const MAJOR_OR_HIGHER_LEVELS = new Set(["3", "4", "5"]);
const FOUNDATIONAL_LEVELS = new Set(["4", "5"]);

const MAJOR_OR_HIGHER_WORK_SCALES = new Set(["major", "severe", "catastrophic"]);
const FOUNDATIONAL_WORK_SCALES = new Set(["severe", "catastrophic"]);

export const isMajorOrHigher = (severity: DeclaredSeverity): boolean =>
  MAJOR_OR_HIGHER_LEVELS.has(severity.admissionLevel ?? "") || MAJOR_OR_HIGHER_WORK_SCALES.has(severity.workScale ?? "");

export const isFoundationalSeverity = (severity: DeclaredSeverity): boolean =>
  FOUNDATIONAL_LEVELS.has(severity.admissionLevel ?? "") || FOUNDATIONAL_WORK_SCALES.has(severity.workScale ?? "");

export const isCatastrophicSeverity = (severity: DeclaredSeverity): boolean =>
  severity.admissionLevel === "5" || severity.workScale === "catastrophic";

export const requiresSkipReason = (severity: DeclaredSeverity): boolean => isMajorOrHigher(severity);
