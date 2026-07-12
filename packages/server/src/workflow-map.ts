import type { WorkflowMapDestination, WorkflowMapPayload, WorkflowMapQueue, WorkflowMapStage } from "@worldloom/shared";
import * as AdmissionFlow from "./admission-flow.js";
import * as CanonDebt from "./canon-debt.js";
import * as ContradictionFlow from "./contradiction-flow.js";
import * as CreationCoverage from "./creation-coverage.js";
import * as ConditionalPassObligations from "./conditional-pass-obligations.js";
import * as MinimalViableWorld from "./minimal-viable-world.js";
import { workflowMapMethodCards } from "./method-cards.js";
import * as PropagationFlow from "./propagation-flow.js";
import type { FlowInstanceRow, RecordRow, WorldFile } from "./world-file.js";

const flowDestination = (flowKey: string): string => {
  switch (flowKey) {
    case "creation":
      return "creation";
    case "admission":
      return "admission";
    case "propagation":
      return "propagation";
    case "institutional_economic_suppression":
      return "stage12";
    case "constraint_composition":
      return "constraint";
    case "temporal_timeline":
      return "temporal";
    case "contradiction":
      return "contradiction";
    case "qa":
      return "qa";
    default:
      return "substrate";
  }
};

const inProgressFlows = (world: WorldFile): FlowInstanceRow[] =>
  world.db.prepare("SELECT * FROM flow_instances WHERE state = 'in_progress' ORDER BY id DESC").all() as FlowInstanceRow[];

const hasInProgressFlow = (flows: FlowInstanceRow[], flowKey: string): boolean =>
  flows.some((flow) => flow.flow_key === flowKey);

const acceptedOrUnderReviewRecords = (records: RecordRow[]): RecordRow[] =>
  records.filter((record) =>
    record.recordTypeKey !== "world_kernel" &&
    (record.canonStatus === "accepted" || record.canonStatus === "under review" || record.canonStatus === "accepted with constraints")
  );

const admittedCanonStatuses = new Set(["accepted", "accepted with constraints", "localized", "contested", "branch-only"]);

const stage = (
  key: string,
  label: string,
  state: WorkflowMapStage["state"],
  summary: string,
  destinationKey: string,
  unlockReason?: string
): WorkflowMapStage => ({
  key,
  label,
  state,
  summary,
  destinationKey,
  ...(unlockReason ? { unlockReason } : {})
});

const queue = (
  key: string,
  label: string,
  count: number,
  destinationKey: string,
  href: string,
  summary: string
): WorkflowMapQueue => ({ key, label, count, destinationKey, href, summary });

const destinationState = (
  key: string,
  activeDestination: string | null,
  owedDestinations: Set<string>,
  stageStates: Map<string, WorkflowMapStage["state"]>
): WorkflowMapDestination["state"] => {
  if (owedDestinations.has(key)) return "owed";
  if (activeDestination === key) return "active";
  return stageStates.get(key) ?? "not_yet_earned";
};

const destinations = (
  activeDestination: string | null,
  owedDestinations: Set<string>,
  stageStates: Map<string, WorkflowMapStage["state"]>
): WorkflowMapDestination[] => [
  { key: "creation", label: "Creation", kind: "guided-flow", summary: "Kernel, seed decomposition, and the Minimal Viable World checkpoint.", state: destinationState("creation", activeDestination, owedDestinations, stageStates) },
  { key: "admission", label: "Admission", kind: "guided-flow", summary: "Govern proposed facts into canon standing.", state: destinationState("admission", activeDestination, owedDestinations, stageStates) },
  { key: "propagation", label: "Propagation", kind: "guided-flow", summary: "Work shock cones and consequence dispositions.", state: destinationState("propagation", activeDestination, owedDestinations, stageStates) },
  { key: "constraint", label: "Constraint Composition", kind: "guided-flow", summary: "Compose constraints where facts apply.", state: destinationState("constraint", activeDestination, owedDestinations, stageStates) },
  { key: "temporal", label: "Temporal/Timeline", kind: "guided-flow", summary: "Conditional `09` pass for first appearance, discovery, institutional reaction, retcon, inheritance, war, migration, law, aging, or evidence implications.", state: destinationState("temporal", activeDestination, owedDestinations, stageStates) },
  { key: "stage12", label: "Institutional / Economic / Suppression", kind: "guided-flow", summary: "Run conditional institutional, economic, and suppression passes.", state: destinationState("stage12", activeDestination, owedDestinations, stageStates) },
  { key: "contradiction", label: "Contradiction/Retcon/Mystery", kind: "guided-flow", summary: "Repair conflicts and protect owed mystery boundaries.", state: destinationState("contradiction", activeDestination, owedDestinations, stageStates) },
  { key: "qa", label: "QA", kind: "guided-flow", summary: "Score stability before calling the world stable.", state: destinationState("qa", activeDestination, owedDestinations, stageStates) },
  { key: "canon-workbench", label: "Canon Workbench", kind: "read-side", summary: "Read current canon and audit trail.", state: "available" },
  { key: "markdown-export", label: "Markdown export", kind: "read-side", summary: "Export record views without mutating the world.", state: "available" },
  { key: "substrate", label: "Substrate", kind: "substrate", summary: "Generic records, links, search, draft space, and Prompt-out admin.", state: "available" }
];

export const workflowMap = (world: WorldFile): WorkflowMapPayload => {
  const records = world.listRecords();
  const flows = inProgressFlows(world);
  const creationKernel = CreationCoverage.latestCreationKernelRecord(world);
  const hasKernel = creationKernel != null;
  const worldHasCanonMaterial = acceptedOrUnderReviewRecords(records).length > 0;
  const admissionQueue = AdmissionFlow.admissionQueue(world);
  const creationCoverage = creationKernel
    ? CreationCoverage.creationCoverageInventory(world, { kernelRecordId: creationKernel.id })
    : null;
  const coverageBlocksAdmission = Boolean(
    creationKernel &&
    admissionQueue.length > 0 &&
    CreationCoverage.hasParkedCreationSeeds(world, creationKernel.id) &&
    creationCoverage?.state.completionBlocked
  );
  const preAdmissionSeedDecompositionOwed = hasKernel && admissionQueue.length === 0 && !worldHasCanonMaterial;
  const propagationQueue = PropagationFlow.propagationQueue(world);
  const owedBoundaries = ContradictionFlow.owedBoundariesQueue(world);
  const openCanonDebt = CanonDebt.listCanonDebt(world, true);
  const skipCount = records.filter((record) => record.recordTypeKey === "skip_record").length;
  const conditionalPassObligations = ConditionalPassObligations.listConditionalPassObligations(world);
  const outstandingConditionalPasses = conditionalPassObligations.filter((obligation) => obligation.disposition === "outstanding");
  const firstOutstandingConditionalPass = outstandingConditionalPasses[0] ?? null;
  const minimalViableWorldOwed = MinimalViableWorld.owedQueueCount(world);
  const routeablePropagationCollision =
    hasKernel &&
    !coverageBlocksAdmission &&
    admissionQueue.length > 0 &&
    propagationQueue.some((item) =>
      item.sourceFact != null &&
      item.route != null &&
      admittedCanonStatuses.has(item.sourceFact.canonStatus ?? "")
    ) &&
    owedBoundaries.length === 0;

  const activeDestination =
    coverageBlocksAdmission ? "creation"
      : routeablePropagationCollision ? "propagation"
      : firstOutstandingConditionalPass ? firstOutstandingConditionalPass.destination.destinationKey
      : admissionQueue.length > 0 ? "admission"
      : !hasKernel || preAdmissionSeedDecompositionOwed ? "creation"
        : flows[0] ? flowDestination(String(flows[0].flow_key)) : null;
  const owedDestinations = new Set<string>([
    ...(propagationQueue.length > 0 ? ["propagation"] : []),
    ...(owedBoundaries.length > 0 ? ["contradiction"] : []),
    ...outstandingConditionalPasses.map((obligation) => obligation.destination.destinationKey),
    ...(minimalViableWorldOwed > 0 ? ["creation"] : [])
  ]);
  const creationState: WorkflowMapStage["state"] = !hasKernel
    ? "active"
    : preAdmissionSeedDecompositionOwed || coverageBlocksAdmission
      ? hasInProgressFlow(flows, "creation") ? "active" : "owed"
      : hasInProgressFlow(flows, "creation") ? "active" : "done";
  const admissionState: WorkflowMapStage["state"] = !hasKernel || preAdmissionSeedDecompositionOwed
    ? "not_yet_earned"
    : coverageBlocksAdmission
      ? "blocked"
    : admissionQueue.length > 0 || hasInProgressFlow(flows, "admission") ? "active" : "done";
  const admissionUnlockReason = !hasKernel
    ? "Create a world_kernel or park proposed seeds before Admission has work."
    : preAdmissionSeedDecompositionOwed
      ? "Park proposed seeds through Creation seed decomposition before Admission has work."
      : coverageBlocksAdmission
        ? "Resolve unresolved seed-family coverage rows before Admission becomes the primary path."
      : undefined;

  const stages: WorkflowMapStage[] = [
    stage(
      "creation",
      "Creation",
      creationState,
      coverageBlocksAdmission
        ? creationCoverage?.state.summary ?? "Creation seed-family coverage is unresolved before Admission handoff."
        : preAdmissionSeedDecompositionOwed
        ? "Seed decomposition is owed before Admission has proposed-seed work."
        : "World kernel and seed decomposition start the journey.",
      "creation"
    ),
    stage(
      "admission",
      "Admission",
      admissionState,
      coverageBlocksAdmission
        ? "Admission queue is visible, but Creation seed-family coverage remains primary before handoff."
        : preAdmissionSeedDecompositionOwed
        ? "Admission queue work begins after Creation parks proposed seeds."
        : "Admission is the only path from proposed fact to canon standing.",
      "admission",
      admissionUnlockReason
    ),
    stage(
      "propagation",
      "Propagation",
      propagationQueue.length > 0 ? "owed" : hasInProgressFlow(flows, "propagation") ? "active" : worldHasCanonMaterial ? "blocked" : "not_yet_earned",
      "Major facts owe a shock cone and stopping-rule dispositions.",
      "propagation",
      worldHasCanonMaterial ? "Admit a major fact or open propagation-scoped canon debt." : "Admission must create canon material before propagation is earned."
    ),
    stage(
      "conditional-passes",
      "Conditional passes",
      hasInProgressFlow(flows, "institutional_economic_suppression") || hasInProgressFlow(flows, "constraint_composition") || hasInProgressFlow(flows, "temporal_timeline") ? "active" : outstandingConditionalPasses.length > 0 ? "owed" : worldHasCanonMaterial ? "blocked" : "not_yet_earned",
      "Constraint, Temporal/Timeline, and institutional/economic/suppression passes run when facts apply.",
      firstOutstandingConditionalPass?.destination.destinationKey ?? "stage12",
      worldHasCanonMaterial ? "Run these passes when the fact's domain or `09` trigger recommendation makes them relevant." : "Canon material must exist before conditional passes apply."
    ),
    stage(
      "contradiction",
      "Contradiction/Retcon/Mystery",
      owedBoundaries.length > 0 ? "owed" : hasInProgressFlow(flows, "contradiction") ? "active" : worldHasCanonMaterial ? "blocked" : "not_yet_earned",
      "Repairs and protected boundaries are worked after pressure exposes them.",
      "contradiction",
      worldHasCanonMaterial ? "Contradiction pressure or protected propagation boundaries create this work." : "Propagation or canon pressure must expose a repair or boundary."
    ),
    stage(
      "minimal-viable-world",
      "Minimal Viable World",
      minimalViableWorldOwed > 0 ? "owed" : worldHasCanonMaterial ? "blocked" : "not_yet_earned",
      "Minimal Viable World checks whether admitted seeds form a pressure field with ordinary life, institutions, factional answers, path dependence, mystery, aesthetic residue, and pressure lines.",
      "creation",
      worldHasCanonMaterial ? "Work this checkpoint when Creation is otherwise ready to close around admitted seed evidence." : "Admitted seed evidence must exist before the checkpoint is earned."
    ),
    stage(
      "qa",
      "QA",
      hasInProgressFlow(flows, "qa") ? "active" : worldHasCanonMaterial ? "blocked" : "not_yet_earned",
      "QA checks stability before calling a world version stable.",
      "qa",
      worldHasCanonMaterial ? "Run QA once enough world material exists to assess." : "World material must exist before QA can assess it."
    )
  ];
  const stateForStage = (key: string): WorkflowMapStage["state"] =>
    stages.find((item) => item.key === key)?.state ?? "not_yet_earned";
  const conditionalState = stateForStage("conditional-passes");
  const stageStates = new Map<string, WorkflowMapStage["state"]>([
    ["creation", stateForStage("creation")],
    ["admission", stateForStage("admission")],
    ["propagation", stateForStage("propagation")],
    ["constraint", outstandingConditionalPasses.some((item) => item.passKey === "constraint_composition") ? "owed" : conditionalState],
    ["temporal", outstandingConditionalPasses.some((item) => item.passKey === "temporal_timeline") ? "owed" : conditionalState],
    ["stage12", outstandingConditionalPasses.some((item) => item.passKey === "institutional_economic_suppression") ? "owed" : conditionalState],
    ["contradiction", stateForStage("contradiction")],
    ["qa", stateForStage("qa")]
  ]);

  const queues = [
    queue(
      "admission",
      "Admission queue",
      admissionQueue.length,
      "admission",
      "/api/admission/queue",
      coverageBlocksAdmission
        ? "Proposed seeds are visible as secondary work, but unresolved Creation seed-family coverage is primary."
        : preAdmissionSeedDecompositionOwed
        ? "Admission queue is 0 because no proposed seeds exist yet; seed decomposition unlocks Admission work."
        : "Proposed or under-review facts awaiting governance."
    ),
    queue("owed-propagation", "Owed propagation", propagationQueue.length, "propagation", "/api/propagation/queue", "Propagation-scoped debt and owed shock cones."),
    queue(
      "conditional-passes",
      "Conditional passes",
      outstandingConditionalPasses.length,
      firstOutstandingConditionalPass?.destination.destinationKey ?? "temporal",
      "/api/conditional-pass-obligations",
      "Source-linked specialized passes still owed after completed Propagation."
    ),
    queue("owed-boundaries", "Owed boundaries", owedBoundaries.length, "contradiction", "/api/contradiction/owed-boundaries", "Protected consequences that still need mystery-ledger governance."),
    queue("minimal-viable-world", "Minimal Viable World checkpoint", minimalViableWorldOwed, "creation", "/api/flows/creation/minimal-viable-world", "Creation phases 4-8 checkpoint owed after admitted seed evidence exists."),
    queue("canon-debt", "Canon debt", openCanonDebt.length, "substrate", "/api/canon-debt?open=true", "Open canon debt across flows."),
    queue("skips", "Skips", skipCount, "substrate", "/api/search?q=skip_record", "Recorded skipped instruments and their reason duties.")
  ];

  const nextDecision = coverageBlocksAdmission
    ? {
        destinationKey: "creation",
        label: "Resolve seed-family coverage",
        reason: creationCoverage?.state.blockers.length
          ? `${creationCoverage.state.blockers.map((blocker) => blocker.label).join(", ")} still needs disposition before Admission handoff.`
          : creationCoverage?.state.summary ?? "Creation seed-family coverage must be resolved before Admission handoff.",
        href: "/api/flows/creation/start"
      }
    : routeablePropagationCollision
      ? {
          destinationKey: "propagation",
          label: "Work owed propagation",
          reason: "Accepted canon has an owed shock cone that should be worked before further dependency-bearing Admission.",
          href: "/api/propagation/queue"
        }
    : firstOutstandingConditionalPass
      ? {
          destinationKey: firstOutstandingConditionalPass.destination.destinationKey,
          label: `Work ${firstOutstandingConditionalPass.passLabel} for ${firstOutstandingConditionalPass.sourceFact.shortId} after ${firstOutstandingConditionalPass.propagationReport.shortId}`,
          reason: "A completed foundational Propagation run still owes specialized work before further dependency-bearing Admission; Admission remains directly available.",
          href: firstOutstandingConditionalPass.destination.href
        }
    : admissionQueue.length > 0
    ? { destinationKey: "admission", label: "Work Admission queue", reason: "Proposed facts are waiting for governance.", href: "/api/admission/queue" }
    : owedBoundaries.length > 0
      ? { destinationKey: "contradiction", label: "Work owed boundaries", reason: "A protected propagation consequence needs mystery-ledger governance.", href: "/api/contradiction/owed-boundaries" }
      : propagationQueue.length > 0
        ? { destinationKey: "propagation", label: "Work owed propagation", reason: "Propagation-scoped canon debt is open.", href: "/api/propagation/queue" }
        : minimalViableWorldOwed > 0
            ? { destinationKey: "creation", label: "Work Minimal Viable World checkpoint", reason: "Admitted seed evidence exists and no earlier owed queue is foregrounded.", href: "/api/flows/creation/minimal-viable-world" }
          : !hasKernel
            ? { destinationKey: "creation", label: "Start Creation", reason: "No world kernel exists yet; create the world kernel first.", href: "/api/flows/creation/start" }
            : preAdmissionSeedDecompositionOwed
              ? { destinationKey: "creation", label: "Seed decomposition owed", reason: "The world kernel is saved, but Creation must park proposed seeds before Admission has work.", href: "/api/flows/creation/start" }
              : { destinationKey: "qa", label: "Review stability", reason: "No owed queue is currently foregrounded; QA is the next stability check when enough material exists.", href: "/api/qa/passes/start" };

  return {
    readOnly: true,
    world: { path: world.path },
    stages,
    queues,
    nextDecision,
    destinations: destinations(activeDestination, owedDestinations, stageStates),
    conditionalPasses: {
      readOnly: true,
      doctrine: "The foundational full-pass rule owes Temporal/Timeline, Constraint Composition, and Institutional / Economic / Suppression in that order; Admission remains available and is not a hard gate.",
      outstandingCount: outstandingConditionalPasses.length,
      governedCount: conditionalPassObligations.length - outstandingConditionalPasses.length,
      obligations: conditionalPassObligations,
      nextOrResumeState: {
        current: firstOutstandingConditionalPass?.passLabel ?? null,
        next: outstandingConditionalPasses[1]?.passLabel ?? null,
        resume: "Return safely to a fresh workflow-map response after every conditional-pass or deferral action."
      }
    },
    methodCards: workflowMapMethodCards()
  };
};
