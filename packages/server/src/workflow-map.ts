import type { WorkflowMapDestination, WorkflowMapPayload, WorkflowMapQueue, WorkflowMapStage } from "@worldloom/shared";
import * as AdmissionFlow from "./admission-flow.js";
import * as CanonDebt from "./canon-debt.js";
import * as ContradictionFlow from "./contradiction-flow.js";
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
  records.filter((record) => record.canonStatus === "accepted" || record.canonStatus === "under review" || record.canonStatus === "accepted with constraints");

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

const destinations = (activeDestination: string | null, owedDestinations: Set<string>): WorkflowMapDestination[] => [
  { key: "creation", label: "Creation", kind: "guided-flow", summary: "Kernel, seed decomposition, and the Minimal Viable World checkpoint.", state: owedDestinations.has("creation") ? "owed" : activeDestination === "creation" ? "active" : "available" },
  { key: "admission", label: "Admission", kind: "guided-flow", summary: "Govern proposed facts into canon standing.", state: activeDestination === "admission" ? "active" : "available" },
  { key: "propagation", label: "Propagation", kind: "guided-flow", summary: "Work shock cones and consequence dispositions.", state: owedDestinations.has("propagation") ? "owed" : activeDestination === "propagation" ? "active" : "available" },
  { key: "constraint", label: "Constraint Composition", kind: "guided-flow", summary: "Compose constraints where facts apply.", state: activeDestination === "constraint" ? "active" : "available" },
  { key: "temporal", label: "Temporal/Timeline", kind: "guided-flow", summary: "Conditional `09` pass for first appearance, discovery, institutional reaction, retcon, inheritance, war, migration, law, aging, or evidence implications.", state: owedDestinations.has("temporal") ? "owed" : activeDestination === "temporal" ? "active" : "available" },
  { key: "stage12", label: "Institutional / Economic / Suppression", kind: "guided-flow", summary: "Run conditional institutional, economic, and suppression passes.", state: activeDestination === "stage12" ? "active" : "available" },
  { key: "contradiction", label: "Contradiction/Retcon/Mystery", kind: "guided-flow", summary: "Repair conflicts and protect owed mystery boundaries.", state: owedDestinations.has("contradiction") ? "owed" : activeDestination === "contradiction" ? "active" : "available" },
  { key: "qa", label: "QA", kind: "guided-flow", summary: "Score stability before calling the world stable.", state: activeDestination === "qa" ? "active" : "available" },
  { key: "canon-workbench", label: "Canon Workbench", kind: "read-side", summary: "Read current canon and audit trail.", state: "available" },
  { key: "markdown-export", label: "Markdown export", kind: "read-side", summary: "Export record views without mutating the world.", state: "available" },
  { key: "substrate", label: "Substrate", kind: "substrate", summary: "Generic records, links, search, draft space, and Prompt-out admin.", state: "available" }
];

export const workflowMap = (world: WorldFile): WorkflowMapPayload => {
  const records = world.listRecords();
  const flows = inProgressFlows(world);
  const hasKernel = records.some((record) => record.recordTypeKey === "world_kernel");
  const worldHasCanonMaterial = acceptedOrUnderReviewRecords(records).length > 0;
  const admissionQueue = AdmissionFlow.admissionQueue(world);
  const propagationQueue = PropagationFlow.propagationQueue(world);
  const owedBoundaries = ContradictionFlow.owedBoundariesQueue(world);
  const openCanonDebt = CanonDebt.listCanonDebt(world, true);
  const skipCount = records.filter((record) => record.recordTypeKey === "skip_record").length;
  const temporalDebt = openCanonDebt.filter((debt) => /\btemporal\b|\btimeline\b/i.test(`${debt.title}\n${debt.body}`));
  const minimalViableWorldOwed = MinimalViableWorld.owedQueueCount(world);

  const activeDestination =
    admissionQueue.length > 0 ? "admission"
      : !hasKernel ? "creation"
        : flows[0] ? flowDestination(String(flows[0].flow_key)) : null;
  const owedDestinations = new Set<string>([
    ...(propagationQueue.length > 0 ? ["propagation"] : []),
    ...(owedBoundaries.length > 0 ? ["contradiction"] : []),
    ...(temporalDebt.length > 0 ? ["temporal"] : []),
    ...(minimalViableWorldOwed > 0 ? ["creation"] : [])
  ]);

  const stages: WorkflowMapStage[] = [
    stage(
      "creation",
      "Creation",
      !hasKernel ? "active" : hasInProgressFlow(flows, "creation") ? "active" : "done",
      "World kernel and seed decomposition start the journey.",
      "creation"
    ),
    stage(
      "admission",
      "Admission",
      !hasKernel ? "not_yet_earned" : admissionQueue.length > 0 || hasInProgressFlow(flows, "admission") ? "active" : "done",
      "Admission is the only path from proposed fact to canon standing.",
      "admission",
      !hasKernel ? "Create a world_kernel or park proposed seeds before Admission has work." : undefined
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
      hasInProgressFlow(flows, "institutional_economic_suppression") || hasInProgressFlow(flows, "constraint_composition") || hasInProgressFlow(flows, "temporal_timeline") ? "active" : temporalDebt.length > 0 ? "owed" : worldHasCanonMaterial ? "blocked" : "not_yet_earned",
      "Constraint, Temporal/Timeline, and institutional/economic/suppression passes run when facts apply.",
      temporalDebt.length > 0 ? "temporal" : "stage12",
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

  const queues = [
    queue("admission", "Admission queue", admissionQueue.length, "admission", "/api/admission/queue", "Proposed or under-review facts awaiting governance."),
    queue("owed-propagation", "Owed propagation", propagationQueue.length, "propagation", "/api/propagation/queue", "Propagation-scoped debt and owed shock cones."),
    queue("owed-boundaries", "Owed boundaries", owedBoundaries.length, "contradiction", "/api/contradiction/owed-boundaries", "Protected consequences that still need mystery-ledger governance."),
    queue("minimal-viable-world", "Minimal Viable World checkpoint", minimalViableWorldOwed, "creation", "/api/flows/creation/minimal-viable-world", "Creation phases 4-8 checkpoint owed after admitted seed evidence exists."),
    queue("canon-debt", "Canon debt", openCanonDebt.length, "substrate", "/api/canon-debt?open=true", "Open canon debt across flows."),
    queue("skips", "Skips", skipCount, "substrate", "/api/search?q=skip_record", "Recorded skipped instruments and their reason duties.")
  ];

  const nextDecision = admissionQueue.length > 0
    ? { destinationKey: "admission", label: "Work Admission queue", reason: "Proposed facts are waiting for governance.", href: "/api/admission/queue" }
    : owedBoundaries.length > 0
      ? { destinationKey: "contradiction", label: "Work owed boundaries", reason: "A protected propagation consequence needs mystery-ledger governance.", href: "/api/contradiction/owed-boundaries" }
      : propagationQueue.length > 0
        ? { destinationKey: "propagation", label: "Work owed propagation", reason: "Propagation-scoped canon debt is open.", href: "/api/propagation/queue" }
        : temporalDebt.length > 0
          ? { destinationKey: "temporal", label: "Work Temporal/Timeline debt", reason: "Open Temporal/Timeline canon debt needs sequence, latency, residue, or boundary work.", href: "/api/temporal/runs/start" }
          : minimalViableWorldOwed > 0
            ? { destinationKey: "creation", label: "Work Minimal Viable World checkpoint", reason: "Admitted seed evidence exists and no earlier owed queue is foregrounded.", href: "/api/flows/creation/minimal-viable-world" }
          : !hasKernel
            ? { destinationKey: "creation", label: "Start Creation", reason: "No world kernel exists yet; create the world kernel first.", href: "/api/flows/creation/start" }
            : { destinationKey: "qa", label: "Review stability", reason: "No owed queue is currently foregrounded; QA is the next stability check when enough material exists.", href: "/api/qa/passes/start" };

  return {
    readOnly: true,
    world: { path: world.path },
    stages,
    queues,
    nextDecision,
    destinations: destinations(activeDestination, owedDestinations),
    methodCards: workflowMapMethodCards()
  };
};
