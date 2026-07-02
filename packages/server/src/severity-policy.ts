export interface DeclaredSeverity {
  admissionLevel: string | null;
  workScale: string | null;
}

export type AdmissionGatePath = "minor_ledger" | "full_gate";

export interface AdmissionGatePolicy {
  path: AdmissionGatePath;
  doctrine: string[];
  steps: string[];
}

export interface AdmissionQueueSortKey {
  workScaleRank: number;
  admissionLevelRank: number;
}

export type PropagationRequiredDomainCount = number | "all";

export interface PropagationCoveragePolicy {
  requiredCoverage: string;
  requiredDomainCount: PropagationRequiredDomainCount;
}

const FULL_GATE_LEVELS = new Set(["3", "4", "5"]);
const FOUNDATIONAL_LEVELS = new Set(["4", "5"]);

const FULL_GATE_WORK_SCALES = new Set(["major", "severe", "catastrophic"]);
const FOUNDATIONAL_WORK_SCALES = new Set(["severe", "catastrophic"]);

const WORK_SCALE_QUEUE_RANK: Record<string, number> = {
  catastrophic: 1,
  severe: 2,
  major: 3,
  moderate: 4,
  minor: 5
};

const MINOR_LEDGER_STEPS = [
  "fact statement",
  "scope",
  "truth layer",
  "canon status",
  "constraint tags",
  "admission operations",
  "one consequence check"
];

const FULL_GATE_STEPS = [
  "fact statement",
  "scope",
  "type",
  "truth layer",
  "canon status",
  "constraint tags",
  "dependencies",
  "costs/access/bottlenecks",
  "shock-cone summary",
  "institutions or quiet-domain declaration",
  "evidence/belief note",
  "contradiction and mystery risk",
  "follow-up debt"
];

const FOUNDATIONAL_GATE_STEPS = [
  "temporal/spatial passes",
  "branch implications",
  "mystery/aesthetic checks",
  "QA follow-up"
];

const CATASTROPHIC_GATE_STEPS = [
  "explicit decision record",
  "rollback/branch plan"
];

const isFullGateSeverity = (severity: DeclaredSeverity): boolean =>
  FULL_GATE_LEVELS.has(severity.admissionLevel ?? "") || FULL_GATE_WORK_SCALES.has(severity.workScale ?? "");

const isFoundationalSeverity = (severity: DeclaredSeverity): boolean =>
  FOUNDATIONAL_LEVELS.has(severity.admissionLevel ?? "") || FOUNDATIONAL_WORK_SCALES.has(severity.workScale ?? "");

const isCatastrophicSeverity = (severity: DeclaredSeverity): boolean =>
  severity.admissionLevel === "5" || severity.workScale === "catastrophic";

export const admissionQueueSortKey = (severity: DeclaredSeverity): AdmissionQueueSortKey => {
  const admissionLevelRank = severity.admissionLevel == null ? -1 : Number.parseInt(severity.admissionLevel, 10);
  return {
    workScaleRank: WORK_SCALE_QUEUE_RANK[severity.workScale ?? ""] ?? 6,
    admissionLevelRank: Number.isNaN(admissionLevelRank) ? 0 : admissionLevelRank
  };
};

export const admissionGatePolicy = (severity: DeclaredSeverity): AdmissionGatePolicy => {
  const fullGate = isFullGateSeverity(severity);
  const foundational = isFoundationalSeverity(severity);
  const catastrophic = isCatastrophicSeverity(severity);
  const steps = fullGate
    ? [
        ...FULL_GATE_STEPS,
        ...(foundational ? FOUNDATIONAL_GATE_STEPS : []),
        ...(catastrophic ? CATASTROPHIC_GATE_STEPS : [])
      ]
    : [...MINOR_LEDGER_STEPS];

  return {
    path: fullGate ? "full_gate" : "minor_ledger",
    doctrine: [
      "docs/worldbuilding-system/06_canon_fact_admission_protocol.md",
      fullGate ? "docs/worldbuilding-system/checklists/canon_fact_gate.md" : "docs/worldbuilding-system/templates/admission_ledger.md"
    ],
    steps
  };
};

export const requiresSkipReason = (severity: DeclaredSeverity): boolean => isFullGateSeverity(severity);

export const propagationCoveragePolicy = (severity: DeclaredSeverity): PropagationCoveragePolicy => {
  if (isFoundationalSeverity(severity)) {
    return {
      requiredCoverage: "full domain-atlas sweep",
      requiredDomainCount: "all"
    };
  }
  if (isFullGateSeverity(severity)) {
    return {
      requiredCoverage: "multiple orders and direct/dependency/reaction domains",
      requiredDomainCount: 3
    };
  }
  return {
    requiredCoverage: "immediate effects and one ordinary-life residue when relevant",
    requiredDomainCount: 1
  };
};

export const warnsForOpenCanonDebt = (severity: DeclaredSeverity): boolean => isFoundationalSeverity(severity);
