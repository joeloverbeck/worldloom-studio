import type { MethodCard } from "@worldloom/shared";

export type PromptMode = "proposal" | "pressure";
export type PromptAvailability = "available" | "blocked";

export interface DecisionPointPromptMode {
  mode: PromptMode;
  label: string;
  availability: PromptAvailability;
  available: boolean;
  blocker: string | null;
  framing: string;
  role?: string;
  templateKey: string;
  stepKey: string;
  outputLabels: string[];
  stepRequest: {
    method: "POST";
    href: "/api/prompt-out/steps";
    body: Record<string, unknown>;
  } | null;
}

export interface DecisionPointPromptModeSummary {
  mode: PromptMode;
  label: string;
  framing: string;
  available: boolean;
  blocker: string | null;
}

export interface DecisionPointSharedContract {
  contractVersion: "decision-point/v1";
  methodCard?: MethodCard;
  flow: {
    key: string;
    runState: string;
  };
  step: {
    key: string;
    localDecision: string;
    packageSource: string;
    why: string;
  };
  obligations: {
    required: string[];
    optional: string[];
    skippable: string[];
    severityDependent: string[];
  };
  skipRule?: {
    offered: boolean;
    reasonRequired: boolean;
    reasonThreshold: string;
    recordType: "skip_record";
  };
  doctrine: {
    slots: string[];
    packageSources: string[];
  };
  bearingContext: {
    displayed: string[];
    sourceManifest: string[];
    omissions: string[];
  };
  promptOut: {
    serverOwned: true;
    modes: DecisionPointPromptMode[];
  };
  blockers: Array<{ key: string; label?: string; message: string; requires?: string; classification?: string; consequenceId?: number }>;
  substanceValidations: string[];
  writeIntent: {
    willWrite: string[];
    willLink: string[];
    willQueue: string[];
    willRouteOnward: string[];
    willLeaveUntouched: string[];
  };
  nextOrResumeState: {
    currentStep: string;
    nextStep: string;
    safeExit: string;
  };
  readSideTrail: Array<{ label: string; href: string; recordId?: number }>;
}

export const ADVISORY_OUTPUT_LABELS = [
  "selected",
  "deleted",
  "challenged",
  "ignored",
  "standing ruling",
  "adopted with steward revision",
  "rejected"
];

export const promptMode = (input: Omit<DecisionPointPromptMode, "availability" | "available"> & { available: boolean }): DecisionPointPromptMode => ({
  ...input,
  availability: input.available ? "available" : "blocked",
  available: input.available
});

export const promptModeSummaries = (modes: DecisionPointPromptMode[]): DecisionPointPromptModeSummary[] =>
  modes.map(({ mode, label, framing, available, blocker }) => ({ mode, label, framing, available, blocker }));

export const withPromptModeSummaries = (modes: DecisionPointPromptMode[]): DecisionPointPromptMode[] => {
  const availableModes = promptModeSummaries(modes);
  return modes.map((mode) => mode.stepRequest
    ? {
        ...mode,
        stepRequest: {
          ...mode.stepRequest,
          body: { ...mode.stepRequest.body, availableModes }
        }
      }
    : mode);
};

export const splitDisplayedContext = (value: string): string[] =>
  value
    .split(/\n{2,}|\n/)
    .map((line) => line.trim())
    .filter(Boolean);
