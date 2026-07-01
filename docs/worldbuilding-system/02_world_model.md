# 02. World Model

This document defines the conceptual objects used by the system. These are not database tables. They are worldbuilding primitives that can later be implemented in many forms.

## The world state

A world state is the current authorial model of what is true, believed, possible, disputed, hidden, or impossible.

A world state contains:

- entities;
- places;
- groups;
- institutions;
- actors;
- resources;
- capabilities;
- constraints;
- events;
- processes;
- claims;
- sources;
- truth layers;
- consequences;
- unresolved questions;
- mysteries.

The world state is best imagined as a dependency graph, not as a stack of lore articles. Facts depend on other facts and create pressure on other facts.

## Primitive objects

### Entity

A distinct thing in the world.

Examples:

- a person;
- a town;
- a god;
- a robot model;
- a plague;
- a language;
- a mountain pass;
- a spell;
- a treaty;
- a dynasty;
- a species;
- a machine;
- a secret society.

Minimum fields:

- name;
- type;
- truth layer;
- temporal scope;
- location or domain;
- known relationships;
- unresolved questions.

### Actor

An entity capable of goals, choices, strategies, or adaptation.

Actors may be individuals, households, clans, corporations, temples, armies, states, ecosystems, machine minds, gods, or alien intelligences.

Track:

- goals;
- fears;
- resources;
- capabilities;
- constraints;
- knowledge;
- incentives;
- rivals;
- legitimacy;
- adaptation style.

### Institution

A durable pattern that coordinates behavior.

Institutions include formal organizations and informal rules.

Track:

- problem it solves;
- actors it empowers;
- actors it excludes;
- formal rules;
- informal rules-in-use;
- enforcement;
- incentives;
- legitimacy story;
- resources controlled;
- failure modes;
- history;
- relation to capabilities.

### Capability

A repeatable ability to produce an effect.

Capabilities are the most dangerous facts in worldbuilding because they change what rational actors can do.

Track:

- effect;
- prerequisites;
- access;
- scarcity;
- cost;
- risk;
- skill;
- infrastructure;
- maintenance;
- rate;
- scale;
- portability;
- detectability;
- countermeasures;
- failure modes;
- legal status;
- religious or cultural interpretation;
- diffusion history;
- hostile uses;
- mundane substitutes.

### Constraint

A limit on what can happen or who can do something.

Constraints may be:

- physical;
- biological;
- magical;
- divine;
- legal;
- social;
- economic;
- informational;
- psychological;
- ecological;
- temporal;
- geographic;
- moral;
- narrative;
- epistemic.

Strong worlds often depend more on constraints than powers.

### Event

A bounded occurrence that changes the world state.

Track:

- date or relative sequence;
- location;
- participants;
- causes;
- immediate effects;
- long-term residues;
- witnesses;
- disputed versions;
- institutional response;
- economic impact;
- narrative relevance.

### Process

A recurring or ongoing causal pattern.

Examples:

- seasonal migration;
- imperial taxation;
- robot scavenging;
- dream infection;
- succession politics;
- desertification;
- demon pact enforcement;
- black-market spell trade;
- plague cycles.

Processes create depth because they imply life continues when the plot is absent.

### Resource

Anything scarce enough to shape behavior.

Resources include:

- food;
- water;
- land;
- metals;
- fuel;
- medicine;
- attention;
- divine favor;
- souls;
- memory;
- safe roads;
- trained experts;
- legal recognition;
- passwords;
- ritual purity;
- political legitimacy;
- computation;
- batteries.

Track extraction, renewal, ownership, trade, substitutes, theft, taxation, and bottlenecks.

### Claim

A statement made by a source inside or outside the world.

A claim is not automatically a fact. It has:

- speaker/source;
- audience;
- motive;
- evidence;
- truth layer;
- confidence;
- contradictions;
- political or religious consequences.

### Source

A channel through which a claim enters the authorial or diegetic world.

Examples:

- author note;
- narrator;
- ancient text;
- propaganda poster;
- witness;
- game rule;
- quest dialogue;
- oral tradition;
- dream;
- divine revelation;
- scientific report;
- forged ledger.

### Consequence

A required or likely change caused by a fact.

Consequences should be typed:

- necessary consequence;
- likely consequence;
- possible branch;
- rejected consequence;
- delayed consequence;
- hidden consequence;
- diegetically believed consequence;
- false inference made by characters.

### Mystery

A deliberately unresolved phenomenon.

A mystery must have:

- observable boundary;
- known effects;
- forbidden explanations;
- allowed interpretations;
- affected domains;
- continuity constraints;
- escalation risk;
- narrative purpose.

## Relationship types

Use these relation verbs to keep world logic visible:

- causes;
- enables;
- prevents;
- requires;
- consumes;
- produces;
- transforms;
- substitutes for;
- competes with;
- regulates;
- taxes;
- monopolizes;
- ritualizes;
- weaponizes;
- medicalizes;
- criminalizes;
- legitimizes;
- conceals;
- reveals;
- contradicts;
- depends on;
- diffuses through;
- concentrates power in;
- excludes;
- creates demand for;
- lowers cost of;
- raises risk of;
- leaves residue in.

A later app might encode these formally. For now, they are thinking tools.

## Fact granularity

A fact can be too large to propagate.

Bad fact:

> The empire has advanced robots.

Better split:

- certain pre-war industrial robots survived;
- most require proprietary maintenance tools;
- their firmware can be rewritten only with diagnostic stations;
- raider crews sometimes capture technicians;
- reprogrammed robots are unstable and power-hungry;
- settlements prize robot mechanics;
- robot cores are traded like weapons.

A good canon system prefers small, typed facts because small facts propagate cleanly.

## Dependency classes

When adding a fact, classify its dependencies.

### Hard dependency

The fact cannot be true unless this is true.

Example: robot reprogramming requires access to compatible robots, power, interface hardware, knowledge, and time.

### Soft dependency

The fact is much more plausible if this is true.

Example: raider robot programmers are more plausible if pre-war training manuals, kidnapped technicians, or intact terminals exist.

### Social dependency

The fact requires a pattern of knowledge, taboo, law, or cooperation.

Example: legal ghost testimony requires courts to accept some procedure for identity verification.

### Economic dependency

The fact requires scarcity, prices, labor, tools, supply chains, or opportunity costs.

Example: cheap teleportation requires a reason freight, smuggling, disease control, and border enforcement have not transformed beyond recognition.

### Epistemic dependency

The fact requires someone to know, misunderstand, conceal, or misremember something.

Example: alien visitation can remain local if witnesses are discredited, evidence decays, or state institutions suppress it.

## World-state health

A healthy world state has:

- visible dependencies;
- known truth layers;
- constrained capabilities;
- institutions that respond to recurring pressures;
- economic consequences for major powers;
- ordinary-life residues;
- historical scars;
- protected mysteries;
- no unmanaged contradictions.

An unhealthy world state has:

- isolated lore;
- protagonist-only powers;
- invented exceptions;
- timeless cultures;
- institutions that ignore obvious incentives;
- economies that do not respond to abundance or scarcity;
- magic or technology that solves problems only when the plot wants it to;
- secrets that should be impossible to keep;
- history that leaves no trace.
