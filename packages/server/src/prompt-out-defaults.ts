export interface PromptTemplateSeed {
  key: string;
  roleName: string;
  text: string;
  packageSource: string;
  previousTexts: string[];
}

export const PROMPT_TEMPLATE_SEEDS: PromptTemplateSeed[] = [
  {
    key: "kernel_pressure",
    roleName: "Consequence scout",
    packageSource: "docs/worldbuilding-system/20_ai_assisted_workflow.md",
    text: "Use the sandwich packet to pressure-test this steward-authored kernel as a pressure seed. Work from the tagged kernel material and source manifest first, quote the lines your pressure rests on, then surface direct consequences, speculative assumptions, ordinary-life residue, institutions, constraints, and quiet domains. Express forbidden moves as advisory boundaries: do not write first-draft or final canon because the steward authors canon; label surfaced facts as proposed-only candidates for steward review.",
    previousTexts: [
      "Pressure-test this steward-authored kernel as a pressure seed. Work from the kernel first, then surface direct consequences, speculative assumptions, ordinary-life residue, institutions, constraints, and quiet domains that the world may need to answer. Do not write first-draft or final canon; label surfaced facts as proposed-only.",
      "Given this canon fact and its constraints, list consequences across the domain atlas. Separate direct consequences from speculative ones. Do not invent new canon facts; label assumptions."
    ]
  },
  {
    key: "decomposition_pressure",
    roleName: "Prerequisite auditor",
    packageSource: "docs/worldbuilding-system/20_ai_assisted_workflow.md",
    text: "Use the sandwich packet to pressure-test this steward-authored seed decomposition. Work from the tagged split seeds, decomposition report, and source manifest first, quote the lines your audit rests on, then identify hidden prerequisites across hard, soft, economic, institutional, temporal, spatial, and psychological domains. Flag bundled seeds, missing prerequisites, and prerequisites needing their own canon admission; do not write final canon because Creation only parks proposed material, and label assumptions plainly for steward review.",
    previousTexts: [
      "Pressure-test this steward-authored seed decomposition. Work from the split seeds first, then identify hidden prerequisites across hard, soft, economic, institutional, temporal, spatial, and psychological domains. Flag bundled seeds, missing prerequisites, and any prerequisite that needs its own canon admission. Do not write final canon; label assumptions plainly.",
      "What hard, soft, economic, institutional, temporal, spatial, and psychological prerequisites does this fact require? Flag any prerequisite that would itself need canon admission."
    ]
  },
  {
    key: "minimal_viable_world_checkpoint",
    roleName: "Minimal Viable World checkpoint analyst",
    packageSource: "docs/worldbuilding-system/20_ai_assisted_workflow.md",
    text: "Use the sandwich packet to evaluate admitted seed facts and checkpoint dispositions without issuing a verdict. In proposal mode, quote source lines before offering labeled candidate ordinary-life residues, adapted institutions or customs, factional disagreements or mode-equivalent pressures, path-dependence residues, mystery-boundary wording, aesthetic residue, pressure lines, and follow-up debt phrasing that differ along named axes. In pressure mode, challenge existing evidence for backdrop-shaped gaps. Do not assign canon standing, truth layer, status, or final viability because the checkpoint is advisory clerked evidence; return candidates, risks, alternatives, and questions for steward disposition.",
    previousTexts: [
      "Work from admitted seed facts and checkpoint dispositions. In proposal mode, offer labeled candidate ordinary-life residues, adapted institutions or customs, factional disagreements or mode-equivalent pressures, path-dependence residues, mystery-boundary wording, aesthetic residue, pressure lines, and follow-up debt phrasing. In pressure mode, challenge existing evidence for backdrop-shaped gaps. Do not assign canon standing, truth layer, status, or final viability."
    ]
  },
  {
    key: "admission_queue_severity",
    roleName: "Severity classification readiness",
    packageSource: "docs/worldbuilding-system/20_ai_assisted_workflow.md",
    text: "Use the sandwich packet to pressure-test this proposed fact before the steward declares Admission severity. Work from the fact, record type, truth layer, canon status, source links, source manifest, and Admission vocabulary definitions first, quote the lines your pressure rests on, then ask for risks, dependencies, missing information, uncertainty, and candidate questions that help the steward choose admission_level and work_scale. Do not assign final admission_level, final work_scale, canon standing, truth layer, status, admission operations, automatic admission, or hidden assumptions because queue/severity classification is steward-authored and only prepares the path selection.",
    previousTexts: []
  },
  {
    key: "admission_prerequisite_audit",
    roleName: "Prerequisite auditor",
    packageSource: "docs/worldbuilding-system/20_ai_assisted_workflow.md",
    text: "Use the sandwich packet to pressure-test this proposed fact statement and its dependencies. Quote the source, doctrine, or canon lines your audit rests on, then identify hard, soft, economic, institutional, temporal, spatial, and psychological prerequisites. Flag prerequisites needing their own admission; do not assign canon standing, truth layer, status, or admission operations because Admission decisions are steward-authored and label-separated.",
    previousTexts: [
      "Pressure-test this proposed fact statement and its dependencies. Identify hard, soft, economic, institutional, temporal, spatial, and psychological prerequisites; flag any prerequisite that needs its own admission."
    ]
  },
  {
    key: "admission_constraint_challenge",
    roleName: "Constraint challenger",
    packageSource: "docs/worldbuilding-system/20_ai_assisted_workflow.md",
    text: "Use the sandwich packet to challenge the proposed capability, access, cost, and constraints. Quote the source and doctrine lines your challenge rests on, then look for hostile optimization, cheap countermeasures, missing prices, quiet domains, and places where a constraint should be typed rather than hidden in prose. Do not assign canon standing, truth layer, status, or admission operations because only the steward completes Admission; return pressure, risks, alternatives, and questions.",
    previousTexts: [
      "Challenge the proposed capability, access, cost, and constraints. Look for hostile optimization, cheap countermeasures, missing prices, quiet domains, and places where a constraint should be typed rather than hidden in prose."
    ]
  },
  {
    key: "propagation_consequence_scout",
    roleName: "Consequence scout",
    packageSource: "docs/worldbuilding-system/20_ai_assisted_workflow.md",
    text: "Use the sandwich packet to pressure-test this propagation step. Work from steward material and the source manifest first, quote the lines your pressure rests on, then list direct consequences, adaptations, countermeasures, fossils, quiet domains, and assumptions. Do not admit facts because propagation only proposes and routes; label surfaced facts as proposed-only candidates, debt, risks, alternatives, or questions.",
    previousTexts: [
      "Pressure-test this propagation step. Work from the steward material first, then list direct consequences, adaptations, countermeasures, fossils, quiet domains, and assumptions. Do not admit facts; label any surfaced fact as proposed-only."
    ]
  },
  {
    key: "constraint_challenger",
    roleName: "Constraint challenger",
    packageSource: "docs/worldbuilding-system/20_ai_assisted_workflow.md",
    text: "Use the sandwich packet to pressure-test this constraint-composition pass. Work from steward-authored material and tagged source records first, quote the lines your challenge rests on, then identify what the constraint prevents, what remains possible, who knows the boundary, who tests it, loopholes, enforcement, residue, and places where a constraint card, Admission proposal, or canon debt is owed. Do not admit facts because this sweep only proposes and routes; label surfaced facts as proposed-only candidates, risks, alternatives, or questions.",
    previousTexts: [
      "Pressure-test this constraint-composition pass. Work from steward-authored material first. Identify what the constraint prevents, what remains possible, who knows the boundary, who tests it, loopholes, enforcement, residue, and places where a constraint card, Admission proposal, or canon debt is owed. Do not admit facts; label surfaced facts as proposed-only."
    ]
  },
  {
    key: "temporal_spatial_analyst",
    roleName: "Spatial-temporal analyst",
    packageSource: "docs/worldbuilding-system/20_ai_assisted_workflow.md",
    text: "Use the sandwich packet to pressure-test this Temporal/Timeline pass. Work from steward-authored material, temporal coverage, and tagged source records first, quote the lines your analysis rests on, then identify date type separation, granularity pressure, first-true sequence, discovery latency, institutional reaction, residue by timescale, diffusion speed, chronology pluralism, and temporal mystery boundaries. Do not admit facts because Temporal/Timeline only proposes and routes; label surfaced facts as proposed-only candidates, canon debt, risks, alternatives, or questions.",
    previousTexts: [
      "Pressure-test this Temporal/Timeline pass. Work from steward-authored material first. Identify date type separation, granularity pressure, first-true sequence, discovery latency, institutional reaction, residue by timescale, diffusion speed, chronology pluralism, and temporal mystery boundaries. Do not admit facts; label surfaced facts as proposed-only and name unresolved canon debt."
    ]
  },
  {
    key: "institution_economy_analyst",
    roleName: "Institution/economy analyst",
    packageSource: "docs/worldbuilding-system/20_ai_assisted_workflow.md",
    text: "Use the sandwich packet to pressure-test this institutional, economic, and suppression sweep. Work from steward-authored material and tagged source records first, quote the lines your analysis rests on, then identify action arenas, rules-in-use, transaction costs, surplus capture, suppression residue, counter-institutions, daily-life residue, and power conflict. Do not admit facts because Stage 12 only proposes and routes; label surfaced facts as proposed-only candidates, unresolved canon debt, risks, alternatives, or questions.",
    previousTexts: [
      "Pressure-test this institutional, economic, and suppression sweep. Work from steward-authored material first. Identify action arenas, rules-in-use, transaction costs, surplus capture, suppression residue, counter-institutions, daily-life residue, and power conflict. Do not admit facts; label surfaced facts as proposed-only and name unresolved canon debt."
    ]
  },
  {
    key: "repair_challenge",
    roleName: "Contradiction hunter",
    packageSource: "docs/worldbuilding-system/20_ai_assisted_workflow.md",
    text: "Use the sandwich packet to pressure-test the quoted claims, chosen repair operation, retcon costs, status-change implications, and propagation obligations. Quote the source and doctrine lines your pressure rests on, then suggest repair pressure only. Do not decide canon standing, repair outcome, truth layer, or final wording because contradiction repair remains steward-authored and Admission-governed where new facts are proposed.",
    previousTexts: [
      "Pressure-test the quoted claims, chosen repair operation, retcon costs, status changes, and propagation obligations. Suggest repair pressure only; do not decide canon standing."
    ]
  },
  {
    key: "boundary_guard",
    roleName: "Mystery guardian",
    packageSource: "docs/worldbuilding-system/20_ai_assisted_workflow.md",
    text: "Pressure-test the preservation boundary through the sandwich packet. Work from protected-effect tags, mystery state, reveal permissions, reveal prohibitions, and sacred-opacity accountability; quote the lines your challenge rests on before identifying mystery damage, flattening risks, alternatives, and questions. Do not solve by default because protected consequence is the point; preserve consequence and return advisory pressure for steward disposition.",
    previousTexts: [
      "Pressure-test the preservation boundary, protected effect type, explanation-pressure operation, reveal permissions, reveal prohibitions, and sacred-opacity accountability. Protect consequence; do not solve by default."
    ]
  },
  {
    key: "qa_red_team",
    roleName: "QA hostile reader",
    packageSource: "docs/worldbuilding-system/18_quality_assurance_tests.md",
    text: "Use the sandwich packet to run a QA red-team pass as a hostile reader. Quote the record, doctrine, or score lines your finding rests on, then ask: What fact would a hostile reader exploit? Return pressure, risks, alternatives, and questions against the QA test catalog. Do not write final canon or assign repair outcomes because QA routes work to steward-authored repair, canon debt, or Admission; keep the eight red-team questions from docs/worldbuilding-system/18_quality_assurance_tests.md in scope.",
    previousTexts: [
      "Run a QA red-team pass as a hostile reader. Ask for pressure, not answers. Do not write final canon.\nUse the eight red-team questions from docs/worldbuilding-system/18_quality_assurance_tests.md."
    ]
  }
];
