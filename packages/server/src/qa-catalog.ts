export interface QaCatalogEntry {
  number: number;
  name: string;
  cluster: string;
  packageSource: string;
  failureSmell: string;
  anchors: {
    weak: string;
    adequate: string;
    strong: string;
  };
  modeBenchmark: string;
}

export const QA_PACKAGE_SOURCE = "docs/worldbuilding-system/18_quality_assurance_tests.md";

export const QA_TEST_CATALOG: QaCatalogEntry[] = [
  {
    number: 1,
    name: "Consequence test",
    cluster: "Consequence",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "The fact sounds cool but nothing changes.",
    anchors: {
      weak: "Broken promises become birds, but only one villain is exposed; no one else changes behavior.",
      adequate: "The village avoids public vows and has shame songs about promise-birds, but implications for marriage, trade, and children are sketchy.",
      strong: "The fact reshapes courtship rites, bedtime stories, oath formulas, dawn routines, comic insults, sacred taboos, and accumulated false-vow storms."
    },
    modeBenchmark: "A non-naturalistic fact scores strongly when recurrence, ritual, taboo, dread, comedy, or symbolic residue makes consequence auditable."
  },
  {
    number: 2,
    name: "Prerequisite test",
    cluster: "Prerequisite",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "A capability appears without materials, training, ecology, history, or authority.",
    anchors: {
      weak: "Ghost witnesses testify without any account of how ghosts persist or communicate.",
      adequate: "The dead can testify only near their grave for seven days, but the origin of the rule is broad.",
      strong: "Burial custom, binding advocates, corpse treatment, memory decay, theology, and courtroom procedure all support why testimony is possible and limited."
    },
    modeBenchmark: "Mythic or sacred prerequisites may be rites, lineage, taboo, recurrence, or boundary conditions rather than material supply chains."
  },
  {
    number: 3,
    name: "Constraint test",
    cluster: "Constraint",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "The fact should dominate the world but does not.",
    anchors: {
      weak: "Teleportation is rare because the author says so.",
      adequate: "Teleportation requires paired gates and licensed seals.",
      strong: "Gate pairing, seal forgery, fatigue, customs control, sabotage risk, weather interference, and sacred no-gate zones constrain use."
    },
    modeBenchmark: "Mode-equivalent constraints may be prohibitions, ritual costs, comic reversal, dread boundary, or recurring symbolic condition."
  },
  {
    number: 4,
    name: "Cost test",
    cluster: "Constraint",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "Powerful things are free.",
    anchors: {
      weak: "Healing magic has no price, but the poor remain sick.",
      adequate: "Healing consumes rare herbs and trained time.",
      strong: "Healing transfers pain to kin, creates debt rites, triage guilds, black-market poultices, lotteries, and fights over whose suffering counts."
    },
    modeBenchmark: "Cost can be sacrifice, shame, curse, sacred prohibition, comic cost, dread exposure, or symbolic exchange."
  },
  {
    number: 5,
    name: "Distribution test",
    cluster: "Distribution",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "The fact is everywhere or nowhere by accident.",
    anchors: {
      weak: "A miracle crop is in one valley for no reason.",
      adequate: "The crop needs volcanic soil and a pollinator.",
      strong: "Soil, pollinator migration, seed taboos, smuggling routes, dialect names, failed plantations, and cuisine changes explain uneven spread."
    },
    modeBenchmark: "Distribution can follow ritual geography, taboo boundaries, recurring motifs, dread zones, or symbolic access."
  },
  {
    number: 6,
    name: "Enemy test",
    cluster: "Distribution",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "Enemies never steal, counter, imitate, sabotage, regulate, or mythologize the capability.",
    anchors: {
      weak: "Enemies ignore the invisibility cloak.",
      adequate: "Guards use bells and flour to detect invisible intruders.",
      strong: "Enemies change architecture, law, hostage protocols, scent training, theater jokes, scams, and religious suspicion of unseen bodies."
    },
    modeBenchmark: "Opposition may adapt through taboos, helper/opponent roles, ritual counterplay, comic reversal, or dread avoidance."
  },
  {
    number: 7,
    name: "Institution or mode-equivalent test",
    cluster: "Institution/economy",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "The fact creates no courts, rites, jokes, recurring patterns, or declared mode-equivalent response.",
    anchors: {
      weak: "Visible lies create no courts, rites, jokes, or recurring patterns.",
      adequate: "Courts require witnesses to speak under clear lamps.",
      strong: "Realist worlds gain lamp courts and taxes; fairy-tale worlds gain recurring moths, counting rhymes, and wedding jars."
    },
    modeBenchmark: "Dream, mythic, comic, sacred, horror, and lyrical modes need rigorous recurrence or symbolic governance instead of institutional realism."
  },
  {
    number: 8,
    name: "Economic or value-pressure test",
    cluster: "Institution/economy",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "Scarcity, price, labor, risk, taboo, sacrifice, or symbolic exchange do not respond.",
    anchors: {
      weak: "Dragon scales are priceless but no one mines, hoards, substitutes, steals, or sanctifies them.",
      adequate: "Scales are scarce armor material controlled by nobles.",
      strong: "Prices, theft, funerary reuse, counterfeit scales, guild exams, resentment, battlefield salvage, and sacred prohibitions respond."
    },
    modeBenchmark: "Non-naturalistic value pressure can be sacrifice, taboo, blessing, curse, shame, comic cost, or symbolic exchange."
  },
  {
    number: 9,
    name: "Timeline test",
    cluster: "Timeline/spatial",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "The fact appears in the wrong causal order or leaves no age-appropriate residue.",
    anchors: {
      weak: "The empire uses printing before paper, literacy, or ink supply exist.",
      adequate: "Printing follows rag-paper mills and temple literacy.",
      strong: "Prototype seals, scribal resistance, training lags, archival reforms, cheap pamphlet jokes, and old manuscript prestige appear in order."
    },
    modeBenchmark: "Mythic and dream timelines still need recurrence order, origin residue, ritual age, or associative return."
  },
  {
    number: 10,
    name: "Spatial test",
    cluster: "Timeline/spatial",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "Distance, terrain, routes, borders, or regional variation vanish when inconvenient.",
    anchors: {
      weak: "News crosses mountains overnight because the plot needs it.",
      adequate: "Signal towers explain fast news along one route.",
      strong: "Towerless valleys, border fog, pilgrimage roads, songs, decrees, and sacred no-signal peaks all vary spatially."
    },
    modeBenchmark: "Space can be ritual, dream-associative, sacred, horrific, or symbolic, but it still constrains recurrence and access."
  },
  {
    number: 11,
    name: "Character agency test",
    cluster: "Agency",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "Actors respond identically or ignore motive, knowledge, fear, role, and memory.",
    anchors: {
      weak: "Everyone reacts to the curse with the same panic.",
      adequate: "Priests, thieves, parents, and soldiers respond differently.",
      strong: "Each response follows motive, class, fear, ignorance, oath, shame, trauma, role, and local knowledge."
    },
    modeBenchmark: "Even symbolic or comic actors need mode-local incentives, roles, fears, patterns, or reversal logic."
  },
  {
    number: 12,
    name: "Truth-layer test",
    cluster: "Truth/evidence",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "Objective canon, secret canon, branch canon, claim, belief, propaganda, error, and mystery are confused.",
    anchors: {
      weak: "A rumor is treated as objective canon when convenient.",
      adequate: "The rumor is marked as public belief while the truth remains author-secret.",
      strong: "Objective canon, author-secret canon, public belief, elite belief, propaganda, branch canon, and mystery boundary each have distinct consequences and records."
    },
    modeBenchmark: "Mythic truth and sacred opacity still need clear separation from claim, belief, objective canon, and mystery boundary."
  },
  {
    number: 13,
    name: "Evidence test",
    cluster: "Truth/evidence",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "Claims have no habitat for who knows, how they know, why they believe, or what would change their mind.",
    anchors: {
      weak: "People believe the moon chose the queen because everyone knows.",
      adequate: "The belief rests on temple records and eclipse witnesses.",
      strong: "Temple ledgers, midwife songs, forged charts, elite skepticism, rural omens, and disproof standards all differ."
    },
    modeBenchmark: "Horror and sacred modes can keep partial knowledge while tracking witnesses, artifacts, absences, bodily memory, and rumor ecology."
  },
  {
    number: 14,
    name: "Mystery / wonder preservation test",
    cluster: "Mystery/contradiction",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "Mystery language excuses missing propagation or protected effects lack boundaries and consequences.",
    anchors: {
      weak: "The tower is mysterious, but there is no question, boundary, awe, dread, or effect.",
      adequate: "The tower origin is author-secret and pilgrims feel awe; reveal is delayed.",
      strong: "Origin mystery and sacred opacity are separated; clues constrain theories, measurement is profanation, shadow changes speech, and reveal cannot reduce it to machinery."
    },
    modeBenchmark: "Sacred, horror, and lyrical excess score strongly only when refused explanation is precise and non-explanatory consequences remain auditable."
  },
  {
    number: 15,
    name: "Contradiction test",
    cluster: "Mystery/contradiction",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "Contradictions are hidden by style instead of classified and repaired.",
    anchors: {
      weak: "A dragon is both dead and alive in the same year with no branch or explanation.",
      adequate: "One account is propaganda and one is objective canon.",
      strong: "The conflict is triaged by layer, scope, witness, branch, audience intention, repair operation, and propagated consequences."
    },
    modeBenchmark: "Non-naturalistic contradiction still needs layer, scope, protected-effect boundary, or mode-specific repair rather than hand-wave."
  },
  {
    number: 16,
    name: "Branch test",
    cluster: "Branch/collaboration",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "Continuity variants leak without divergence, scope, or merge expectations.",
    anchors: {
      weak: "A campaign version leaks into the novel continuity unnoticed.",
      adequate: "The campaign branch is named and isolated.",
      strong: "Divergence point, unchanged anchors, timeline/spatial/institutional/aesthetic differences, merge expectations, and leakage warnings are recorded."
    },
    modeBenchmark: "Single-continuity worlds may mark this n/a with a reason; hybrid or adaptation-heavy work needs branch accountability."
  },
  {
    number: 17,
    name: "Collaboration test",
    cluster: "Branch/collaboration",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "Human contributors govern by taste alone without proposal, challenge, approval, branch, retirement, or records.",
    anchors: {
      weak: "A contributor vetoes a change because it feels wrong.",
      adequate: "The team names doctrine at stake and records the decision.",
      strong: "Proposer, steward, domain reviewer, contradiction challenger, mystery/wonder guardian, audience advocate, decider, dissent, and follow-up records constrain the outcome."
    },
    modeBenchmark: "Solo work may mark this n/a with a reason; collaborative or transmedia work needs role and decision records."
  },
  {
    number: 18,
    name: "Aesthetic residue test",
    cluster: "Aesthetic/medium",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "Tone, naming, symbol, language, costume, architecture, or motif show no consequence.",
    anchors: {
      weak: "The plague has no effect on naming, clothing, architecture, symbol, smell, or speech.",
      adequate: "Survivors wear pale scarves and avoid certain songs.",
      strong: "Names, door lintels, nursery rhymes, saint icons, market colors, jokes, forbidden instruments, and regional variations carry residue."
    },
    modeBenchmark: "Lyrical and symbolic worlds score strongly when motifs alter attention, language, gesture, memory, and audience expectation."
  },
  {
    number: 19,
    name: "Ordinary-life test",
    cluster: "Aesthetic/medium",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "Daily routines, jokes, taboos, work, law, risk, family, worship, or money are unchanged when they should respond.",
    anchors: {
      weak: "Everyone can speak with animals, but meals, pets, hunting, farming, and childhood are unchanged.",
      adequate: "Butchers use legal translators and children learn apology rhymes.",
      strong: "Diet, labor, animal testimony, lullabies, insults, inheritance, slaughter rites, pet grief, and pest politics all change."
    },
    modeBenchmark: "Ordinary life can mean rite, motif, dread habit, comic routine, or symbolic gesture when institutional realism is not the mode."
  },
  {
    number: 20,
    name: "Fossil test",
    cluster: "Timeline/spatial",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "Longstanding facts leave no ruins, laws, songs, names, scars, tools, borders, or traditions.",
    anchors: {
      weak: "An ancient sky-war left no ruins, laws, idioms, scars, calendars, or tools.",
      adequate: "Ruined towers and a veterans' holiday remain.",
      strong: "Ruins, border shapes, inherited disabilities, taboo metals, children's games, obsolete ranks, tax exemptions, and weather prayers fossilize the event."
    },
    modeBenchmark: "Absurd, mythic, dream, and sacred facts can fossilize as idioms, gestures, inherited routines, taboos, or defensive jokes."
  },
  {
    number: 21,
    name: "Suppression test",
    cluster: "Institution/economy",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "Powerful groups do not bury, distort, monopolize, censor, mythologize, or weaponize inconvenient facts.",
    anchors: {
      weak: "The crown hides resurrection with no censors, incentives, murders, rumors, or leaks.",
      adequate: "The crown controls graveyards and licenses priests.",
      strong: "Censorship, informants, counterfeit rites, black-market exhumers, martyr cults, coded songs, border leaks, and bureaucratic contradictions show suppression."
    },
    modeBenchmark: "Suppression can be taboo enforcement, sacred concealment, comic avoidance, dream resistance, or dread quarantine."
  },
  {
    number: 22,
    name: "Counter-institution test",
    cluster: "Institution/economy",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "Official failures create no underground, rival, informal, criminal, sacred, or mutual-aid response.",
    anchors: {
      weak: "Official healing fails the poor, but no informal alternative appears.",
      adequate: "Street healers sell risky charms.",
      strong: "Mutual-aid kitchens, shrine nurses, charm forgers, debt collectors, gangs, trust marks, turf violence, and reform politics emerge."
    },
    modeBenchmark: "Mode-equivalent counter-institutions may be rites, helper networks, taboo workarounds, comic scams, or dread cults."
  },
  {
    number: 23,
    name: "Medium test",
    cluster: "Aesthetic/medium",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "Adaptation loses invariant anchors, sacred consequence, agency, clue visibility, or audience knowledge.",
    anchors: {
      weak: "A game adaptation turns prophecy into a collectible hint and loses all sacred consequence.",
      adequate: "The prophecy remains a branch-specific quest constraint.",
      strong: "Prose, tabletop, screen, and game versions preserve invariant anchors while changing presentation, agency, pacing, clue visibility, and audience knowledge appropriately."
    },
    modeBenchmark: "Medium changes can preserve mythic, dream, sacred, horror, comic, or lyrical consequence through mode-appropriate anchors."
  },
  {
    number: 24,
    name: "Game repeatability test",
    cluster: "Aesthetic/medium",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "Repeatable player actions have no world response.",
    anchors: {
      weak: "Players can cast infinite resurrection with no world response.",
      adequate: "Resurrection consumes rare incense and creates a cooldown.",
      strong: "Repeated use changes churches, battle tactics, inheritance law, grief rituals, enemy counterplay, black markets, and campaign economy."
    },
    modeBenchmark: "Prose-only work may mark this n/a with a reason; games need repeated-use consequence."
  },
  {
    number: 25,
    name: "Scale test",
    cluster: "Scale/asymmetry",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "The fact is analyzed at the wrong scale.",
    anchors: {
      weak: "A cosmic law is treated like a village custom.",
      adequate: "The law is checked at household, town, and kingdom scale.",
      strong: "Household habit, village rite, regional ecology, imperial policy, species history, mythic order, and cosmic exception receive scale-appropriate treatment."
    },
    modeBenchmark: "Modes still have scale: household rite, village taboo, mythic order, dream layer, horror ecology, or symbolic cosmos."
  },
  {
    number: 26,
    name: "Asymmetry test",
    cluster: "Scale/asymmetry",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "All groups adapt identically despite class, region, species, faith, age, profession, language, disability, or access differences.",
    anchors: {
      weak: "The curse affects everyone identically.",
      adequate: "Nobles hire curse-readers while peasants rely on taboo.",
      strong: "Class, region, language, disability, age, faith, profession, species, gender, access, and stigma produce different adaptations and resentments."
    },
    modeBenchmark: "Asymmetry may be ritual role, taboo access, symbolic attention, dread vulnerability, or comic position."
  },
  {
    number: 27,
    name: "Negative-space test",
    cluster: "Consequence",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "Expected consequences are absent without suppression, novelty, cost, taboo, bottleneck, failure, secrecy, geography, or branch scope.",
    anchors: {
      weak: "There are no airships in a world with cheap levitation, and no one says why.",
      adequate: "Levitation fails above water.",
      strong: "Water failure, bird attacks, sky-rights law, pilot trauma, failed wars, sacred cloud taboos, and a ruined airship industry explain the absence."
    },
    modeBenchmark: "Negative space can be protected by taboo, ritual boundary, dream association, dread avoidance, or symbolic prohibition."
  },
  {
    number: 28,
    name: "Load-bearing vocabulary test",
    cluster: "Truth/evidence",
    packageSource: QA_PACKAGE_SOURCE,
    failureSmell: "Controlled vocabulary is used inconsistently or separations collapse.",
    anchors: {
      weak: "Canon, truth, status, constraint, and branch are used interchangeably.",
      adequate: "Main docs use terms correctly, but templates drift.",
      strong: "Docs, examples, checklists, templates, and glossary use shared terms consistently, including consequence mode and preservation boundary."
    },
    modeBenchmark: "Mode-aware language must not blur truth layer, status, constraint tag, decision operation, repair operation, consequence mode, or preservation boundary."
  }
];

export const QA_RED_FLAGS = [
  "Nobody thought of that.",
  "It only works for the protagonist.",
  "The government never noticed in a realist world, or the motif never recurs in a mythic/dream world.",
  "It is secret without a secrecy institution.",
  "It is rare without a bottleneck.",
  "It is expensive without a price ecology.",
  "It is ancient without fossils.",
  "It is local without geography.",
  "It is taboo without punishment, ritual, or temptation.",
  "It is mysterious, sacred, dreamlike, or symbolic without protected boundaries and observable consequence.",
  "It is magic without social, ritual, symbolic, sacred, comic, dread, or ordinary-life consequence.",
  "It is gameplay without world response."
];

export const QA_SCORE_GUIDANCE = {
  "0": "absent: not considered or clearly broken",
  "1": "weak: noticed but underdeveloped, hand-waved, or inconsistent",
  "2": "functional: works for current needs, with known gaps",
  "3": "strong: causally rich, internally coherent, and usable under pressure",
  na: "not applicable with a required reason"
} as const;

export const QA_MODE_BENCHMARKS = [
  "Mythic / ritual: recurring calendar pressure, cost, lineage residue, origin scars, and profanation consequences.",
  "Fairy-tale / folktale: prohibition, violation, helper, test, transformation, and recognition logic recur.",
  "Absurd comedy: repetition escalates, reversals tighten the trap, and the final state exposes the impossible structure.",
  "Dream logic: condensation, displacement, image-return, false coherence, and emotional trigger conditions are legible enough to audit.",
  "Sacred / horror: explanation is protected, but cost, recurrence, ritual boundary, dread ecology, evidence, and contradiction repair remain testable.",
  "Lyrical / symbolic excess: motifs exceed paraphrase while altering attention, language, gesture, memory, and audience expectation."
];

export const QA_REPAIR_LOOP = [
  "Pick the lowest load-bearing score.",
  "Name the smallest repair that would raise it.",
  "Check whether the repair creates a bigger contradiction.",
  "Propagate only as far as necessary.",
  "Record the result.",
  "Stop before the world becomes more explained than alive."
];

export const QA_RED_TEAM_PROMPT_TEXT = [
  "Run a QA red-team pass as a hostile reader. Ask for pressure, not answers. Do not write final canon.",
  "Use these eight questions:",
  "1. What fact would a hostile reader exploit to break the world?",
  "2. What fact would a ruthless state monopolize first?",
  "3. What fact would poor or excluded people use differently from elites?",
  "4. What fact would create a black market even if the author does not want one?",
  "5. What secret would leak through price, slang, ritual, disease, migration, or architecture?",
  "6. What beautiful detail has no cause?",
  "7. What mystery is doing the work of an omitted constraint?",
  "8. What branch difference is being smuggled into main continuity?"
].join("\n");
