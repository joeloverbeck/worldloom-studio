# 18. Quality Assurance Tests

Quality assurance is not paperwork. It is how the world catches lies it has accidentally told about itself.

Score each test from 0 to 3.

- **0 — absent:** not considered or clearly broken.
- **1 — weak:** noticed but underdeveloped, hand-waved, or inconsistent.
- **2 — functional:** works for current needs, with known gaps.
- **3 — strong:** causally rich, internally coherent, and usable under pressure.

## Interpreting scores

For a document, fact, region, institution, branch, or whole package:

- **Green:** mostly 2–3, no catastrophic 0 in a load-bearing area.
- **Yellow:** several 1s or one serious 0; usable with caution.
- **Red:** multiple load-bearing 0s or contradictions hidden by style.

Do not chase all 3s. Law 10 still applies: coherence is not maximal explanation.

## Core tests

### 1. Consequence test

If the fact has been true, the world is different because of it.

Failure smell: the fact sounds cool but nothing changes.

### 2. Prerequisite test

The world contains enough prior conditions for the fact to exist.

Failure smell: a capability appears without materials, training, ecology, history, or authority.

### 3. Constraint test

The fact has believable limits.

Failure smell: the fact should dominate the world but does not.

### 4. Cost test

Use, maintenance, knowledge, failure, access, concealment, and enforcement carry costs.

Failure smell: powerful things are free.

### 5. Distribution test

The fact is not everywhere or nowhere by accident. Its spread follows geography, institutions, class, secrecy, ecology, infrastructure, and incentives.

### 6. Enemy test

Opponents adapt.

Failure smell: enemies never steal, counter, imitate, sabotage, regulate, or mythologize the capability.

### 7. Institution test

The fact creates or alters rules-in-use, offices, rites, guilds, courts, markets, schools, taboos, or black markets.

### 8. Economic test

Scarcity, price, labor, risk, externality, substitution, and transaction costs respond.

### 9. Timeline test

The fact appears in the right causal order and leaves age-appropriate residue.

### 10. Spatial test

The fact respects distance, terrain, climate, borders, routes, settlement, and regional variation.

### 11. Character agency test

Actors respond according to motive, identity, bounded knowledge, incentives, relationships, fear, habit, and memory.

### 12. Truth-layer test

Objective canon, secret canon, branch canon, claim, belief, propaganda, error, and mystery are not confused.

### 13. Evidence test

Claims have evidence habitats: who knows, how they know, why they believe, what they ignore, and what would change their mind.

### 14. Mystery test

Mysteries are protected unknowns with consequences, not excuses for missing propagation.

### 15. Contradiction test

Contradictions are classified and repaired, not hidden.

### 16. Branch test

Continuity variants name their divergence, scope, and merge expectations.

### 17. Collaboration test

Human contributors can propose, challenge, approve, branch, retire, and record changes without relying on taste alone.

### 18. Aesthetic residue test

Tone, naming, symbol, language, costume, architecture, and motif show the fact’s consequences.

### 19. Ordinary-life test

The fact affects daily routines, jokes, taboos, work, law, risk, childhood, illness, food, family, travel, worship, or money where appropriate.

### 20. Fossil test

Longstanding facts leave historical residue: ruins, laws, songs, names, borders, obsolete tools, inherited inequalities, scars, traditions.

### 21. Suppression test

Powerful groups try to bury, distort, monopolize, censor, mythologize, or weaponize inconvenient facts.

### 22. Counter-institution test

Official failures create underground, rival, informal, criminal, sacred, or mutual-aid institutions.

### 23. Medium test

The fact’s consequences survive adaptation to prose, screen, tabletop, digital play, audio, or visual form.

### 24. Game repeatability test

If players can repeat an action, the world shows what repeated use implies.

### 25. Scale test

The fact is analyzed at proper scale: household, village, region, state, species, planet, cosmos, mythic order.

### 26. Asymmetry test

Not all groups adapt identically. Class, region, species, faith, gender, age, profession, language, disability, and access change impact.

### 27. Negative-space test

The absence of expected consequences is explained: suppression, novelty, cost, taboo, bottleneck, failure, secrecy, geography, or branch scope.

### 28. Load-bearing vocabulary test

Controlled vocabulary is used consistently: truth layer, status, decision operation, repair operation, constraint tag, shock cone, mystery boundary, branch.

### 29. Instrument wiring test

Score 0–3.

0: A protocol invokes no checklist or template even though one exists.

1: Instruments are mentioned but not tied to the workflow.

2: Most relevant instruments are referenced and usable.

3: Every load-bearing protocol names the sweep or template that operationalizes it, and no instrument contradicts its parent doctrine.

### 30. Vocabulary separation test

Score 0–3.

0: Truth layer, status, constraint tag, admission decision, and repair operation are confused.

1: Labels are mostly distinguishable but still drift in templates or examples.

2: The main docs separate them clearly.

3: The docs, templates, checklists, examples, and glossary all preserve the separation under stress.

## QA scorecard template

Use a simple worksheet:

| Test | Score 0–3 | Notes | Required repair |
|---|---:|---|---|
| Consequence |  |  |  |
| Prerequisite |  |  |  |
| Constraint |  |  |  |
| Distribution |  |  |  |
| Institution/economy |  |  |  |
| Timeline/spatial |  |  |  |
| Truth/evidence |  |  |  |
| Mystery/contradiction |  |  |  |
| Aesthetic/medium |  |  |  |

## Red-flag smells

- “Nobody thought of that.”
- “It only works for the protagonist.”
- “The government never noticed.”
- “It is secret” without a secrecy institution.
- “It is rare” without a bottleneck.
- “It is expensive” without a price ecology.
- “It is ancient” without fossils.
- “It is local” without geography.
- “It is taboo” without punishment, ritual, or temptation.
- “It is mysterious” without protected boundaries.
- “It is magic” without social consequence.
- “It is gameplay” without world response.

## QA repair loop

1. Pick the lowest load-bearing score.
2. Name the smallest repair that would raise it.
3. Check whether the repair creates a bigger contradiction.
4. Propagate only as far as necessary.
5. Record the result.
6. Stop before the world becomes more explained than alive.
