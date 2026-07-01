# 13. AI-Assisted Workflow

This document describes how to use AI without letting it become the canon authority.

The human decides canon. The AI proposes, audits, branches, and pressure-tests.

## Core rule

Never ask an AI to silently update the world.

Ask it to produce change proposals.

A proposal should contain:

- proposed fact;
- assumptions;
- consequences;
- contradictions;
- repair options;
- questions;
- recommended decision;
- rejected branches;
- confidence.

The human accepts, rejects, edits, or branches the proposal.

## AI roles

### Canon Clerk

Checks continuity, names, dates, locations, timelines, and prior decisions.

### Causal Analyst

Finds direct and indirect consequences.

### Institutional Economist

Focuses on power, rules, incentives, labor, scarcity, access, black markets, and adoption.

### Domain Cartographer

Runs the domain atlas.

### Mystery Guardian

Protects unknowns, mythic ambiguity, and author-secret canon.

### Contradiction Court

Classifies conflicts and proposes repairs.

### Branch Generator

Offers several coherent ways the world could adapt.

### QA Auditor

Scores facts against the quality tests.

## Recommended prompt: canon admission

```text
You are assisting with a fictional world using the Causal Canon Worldbuilding System.

Do not canonize anything. Produce a canon-change proposal only.

Proposed fact:
[FACT]

Known world context:
[CONTEXT]

Tasks:
1. Restate the fact in the smallest precise form.
2. Classify the fact.
3. Assign possible truth layers.
4. Identify prerequisites.
5. Identify capability effects.
6. Identify access constraints, costs, risks, and countermeasures.
7. Propagate first-, second-, third-, and fourth-order consequences.
8. Focus especially on causal, institutional, and economic ripple effects.
9. Identify daily-life and historical residues.
10. Identify contradictions with existing canon.
11. Offer at least three coherent branches.
12. Recommend accept, accept-with-constraints, localize, historicize, reinterpret, branch, quarantine, or reject.
13. List unresolved questions.

Output as a proposal. Do not rewrite canon directly.
```

## Recommended prompt: hostile optimization

```text
Assume a competent hostile actor wants to exploit this canon fact.

Fact:
[FACT]

World context:
[CONTEXT]

Analyze:
1. Most effective hostile uses.
2. Required access and bottlenecks.
3. Why hostile actors have or have not already done this.
4. Likely countermeasures.
5. Institutional and economic consequences.
6. Repairs if the fact makes enemies too powerful.
```

## Recommended prompt: institutional economist

```text
Analyze the institutional and economic consequences of this fact.

Fact:
[FACT]

For each affected action arena, identify:
- participants;
- stakes;
- formal rules;
- rules-in-use;
- information asymmetries;
- enforcement;
- payoffs;
- winners;
- losers;
- externalities;
- black markets;
- professions;
- daily-life residues.

Return concise but specific consequences.
```

## Recommended prompt: mystery guardian

```text
Review this proposed fact for mystery damage.

Fact:
[FACT]

Protected mysteries:
[MYSTERIES]

Tasks:
1. Identify what the fact risks overexplaining.
2. Identify what can remain unknown while effects stay consistent.
3. Propose mystery boundaries.
4. Identify false beliefs and competing interpretations.
5. Identify forbidden uses of the mystery.
6. Recommend accept, constrain, move to claim, branch, or reject.
```

## Recommended prompt: frontloaded seed audit

```text
The following facts were part of the initial world premise. Treat each one as if it were newly added canon.

Seed facts:
[LIST]

For each:
1. Decompose into atomic facts.
2. Identify capabilities.
3. Propagate causal, institutional, economic, daily-life, and historical consequences.
4. Identify contradictions between seeds.
5. Recommend constraints and open questions.

Do not summarize the world. Audit the seeds.
```

## AI output discipline

AI output should be separated into:

- factual restatement;
- assumptions;
- inferences;
- proposals;
- questions;
- decisions needed from human.

The AI should never blur these.

## Human decision record

After reviewing AI proposals, record:

- accepted;
- rejected;
- modified;
- branch-only;
- reason;
- consequences to add;
- questions left open.

## Common AI failure modes

### Lore inflation

The AI invents names, factions, and history without causal need.

Counter: demand pressure-line expansion only.

### Consequence shallowness

The AI says "this affects trade and politics" without specifying how.

Counter: require winners, losers, institutions, prices, and daily residues.

### Generic fantasy/sci-fi drift

The AI defaults to familiar tropes.

Counter: restate world essence and forbidden easy answers.

### Over-resolution of mystery

The AI explains what should remain numinous.

Counter: use the mystery guardian prompt.

### Silent retcon

The AI edits canon to fit its answer.

Counter: require a proposal, never direct modification.

### Equal-weight everything

The AI produces long checklists without prioritizing.

Counter: ask for necessary, likely, optional, and rejected consequences.

## AI acceptance checklist

Before accepting AI-suggested changes:

- Did it identify access constraints?
- Did it name institutions?
- Did it name economic winners and losers?
- Did it generate daily-life residue?
- Did it preserve truth layers?
- Did it identify contradictions?
- Did it avoid canonizing assumptions?
- Did it offer branches?
- Did it deepen the world’s identity?
