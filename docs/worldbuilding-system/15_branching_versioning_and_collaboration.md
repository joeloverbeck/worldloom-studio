# 15. Branching, Versioning, and Collaboration

Branch canon is what happens when more than one continuity must be preserved. Collaboration governance is what happens when more than one human can change canon.

This document remains storage-agnostic. It does not prescribe tools, file names, identifiers, software workflows, or databases. It defines human decisions: what branch is active, what changed, who accepted it, what conflicts remain, and how the world pays the cost.

## When to create a branch

Create a branch only when the divergence earns its maintenance cost.

Good reasons:

- an adaptation needs different medium constraints;
- a campaign table made choices that contradict published continuity;
- an alternate history is artistically valuable;
- an old retcon should remain accessible;
- a regional canon differs by design;
- a mystery has mutually exclusive planned answers;
- a collaboration cannot resolve a dispute without destroying good material.

Weak reasons:

- avoiding hard editorial decisions;
- hiding a contradiction nobody wants to repair;
- keeping every draft forever;
- refusing to choose constraints;
- multiplying canon because labels feel tidy.

## Branch types

### Main continuity

The default active version of the world for the package’s current purpose.

### Adaptation branch

A version altered for novel, screenplay, game, tabletop campaign, comic, audio drama, or other medium.

### Historical branch

An older continuity preserved for reference, nostalgia, or legacy audience expectations.

### Campaign branch

A tabletop or interactive group’s lived continuity.

### Exploratory branch

A deliberately provisional branch used to test a high-pressure idea.

### Mystery-answer branch

A private branch exploring possible answers without collapsing the public mystery.

### Regional branch

A branch where different local canon applies by setting region, culture, jurisdiction, or era.

### Forked canon

A branch that is no longer expected to merge back.

## Branch record minimum

For any serious branch, record:

- branch name in plain language;
- parent continuity;
- reason for divergence;
- first divergence point;
- major changed facts;
- unchanged anchor facts;
- affected documents, examples, or works;
- audience status: public, private, table-only, draft, abandoned;
- merge expectation: likely, possible, unlikely, never;
- consequences unique to the branch;
- contradictions with the main continuity;
- what must not leak across branches.

## Continuity diff protocol

When a branch diverges, compare:

1. **Kernel:** premise, tone, genre promise, metaphysics.
2. **Timeline:** era order, births, deaths, wars, discoveries, dynasties.
3. **Geography:** borders, routes, resources, settlements, travel constraints.
4. **Institutions:** offices, laws, guilds, cults, markets, armies, schools.
5. **Capabilities:** what can be done, by whom, with what costs.
6. **Characters:** relationships, identities, loyalties, wounds, secrets.
7. **Truth layers:** what is objective, secret, believed, disputed, propaganda, mystery.
8. **Mysteries:** what is protected, solved, changed, or invalidated.
9. **Aesthetics:** tone, symbols, genre contract, motif, language texture.
10. **Audience promises:** what prior works teach the audience to expect.

## Merge protocol

Before merging branch material into another continuity:

1. Identify the exact fact being imported.
2. Identify which branch proves it works.
3. Check whether the parent continuity has prerequisites.
4. Run the canon admission protocol at appropriate severity.
5. Run shock-cone propagation.
6. Identify branch-only assumptions that cannot import.
7. Decide whether to accept, constrain, localize, reinterpret, or reject.
8. Update contradictions, mysteries, timeline, and templates.
9. Record the decision in a change proposal or collaboration decision record.

## Human canon governance

Canon changes need roles, not bureaucracy. In small worlds one person may fill every role; in a large collaboration, separate them.

### Proposer

Introduces a change and explains why it improves the world.

### Steward

Protects doctrine, vocabulary, and continuity.

### Domain reviewer

Checks a domain: timeline, language, economics, religion, ecology, character, military, etc.

### Contradiction challenger

Looks for breakage and second-order consequences.

### Mystery guardian

Protects deliberate unknowns.

### Audience advocate

Asks what the reader/player/viewer will infer.

### Decider

Accepts, constrains, branches, quarantines, or rejects.

### Recorder

Writes the final human-readable records.

## Approval levels

Match process to severity.

### Light change

Cosmetic, local, no broad implication.

A proposer may self-accept after a quick fact gate.

### Medium change

Touches recurring actors, local institutions, a known timeline point, a cultural practice, a rule, or a template.

Requires at least one challenger or steward review.

### Heavy change

Changes metaphysics, history, geography, a core faction, major institution, widespread capability, branch continuity, or mystery boundary.

Requires proposal, propagation report, contradiction scan, and explicit decision.

### Catastrophic change

Alters the world kernel, genre promise, foundational premise, main chronology, or audience contract.

Requires full review and may deserve a branch instead of a merge.

## Dispute handling

When contributors disagree:

1. State the worldbuilding question, not the personal preference.
2. Name the doctrine at stake.
3. Identify the consequence each option creates.
4. Identify the valid content each option preserves.
5. Test whether scope, branch, uncertainty, or mystery can hold both.
6. Reject compromises that preserve wording but destroy consequence.
7. Choose the option that makes the world more causal, not merely more comfortable.
8. Record dissent if it may matter later.

## Merge-conflict questions

- Which version better answers “why is the world not already different?”
- Which version creates richer institutions and ordinary-life residue?
- Which version protects the strongest mysteries?
- Which version demands fewer arbitrary exceptions?
- Which version better serves tone and medium?
- Which version preserves more valid prior content?
- Which version is easier to explain to a new collaborator without special pleading?

## Retirement and deprecation

Deprecated material is not trash. It may be:

- legacy reference;
- branch-only canon;
- myth inside the world;
- false belief;
- early draft;
- research note;
- incompatible but inspiring alternate.

When retiring a fact, state whether it is superseded, deprecated, rejected, or branch-only. Do not let old assumptions linger invisibly.

## Branching and collaboration instruments

Run `checklists/branching_collaboration_sweep.md` when a change creates a branch, compares continuities, involves multiple contributors, creates a dispute, retires material, or risks leakage between continuities.

Use `templates/canon_branch_diff.md` for branch comparison and `templates/collaboration_decision_record.md` for human governance decisions. These are accountability instruments, not software workflow states.

## Collaboration anti-patterns

- Treating approval as taste voting.
- Letting seniority overrule causality.
- Creating branches to avoid decisions.
- Accepting cool facts without institutional cost.
- Retconning mysteries because a contributor is impatient.
- Treating templates as paperwork rather than argument.
- Forgetting that a collaborator’s table, draft, or adaptation may be valid within its own branch.

## Version 0.4 reinforcement: invariant anchors

Before creating or merging a branch, name the invariants: the facts, tone, relationships, moral pressures, aesthetic signals, and mysteries that must remain recognizable for the world to still be itself.

Invariant anchors may include:

- one foundational constraint;
- one historical wound;
- one social bargain;
- one aesthetic promise;
- one mystery boundary;
- one relationship geometry;
- one domain of ordinary-life residue.

### Branch compatibility matrix

When comparing branches, classify each difference:

| Difference type | Merge risk |
|---|---|
| expression only | usually safe; no canon change. |
| viewpoint emphasis | safe if facts unchanged. |
| scope/localization | safe if constraints recorded. |
| timeline shift | medium risk; requires temporal card. |
| institution/economy change | high risk; requires propagation. |
| truth-layer change | high risk; can damage mystery/evidence. |
| foundational constraint change | branch-separating by default. |
| aesthetic contract change | may be branch-separating even if facts match. |

### Collaboration dissent

Open dissent is not disorder. Record dissent when it preserves a valid interpretation, warns about audience trust, identifies lost content, or protects a branch. Suppressed dissent often returns as continuity damage.
