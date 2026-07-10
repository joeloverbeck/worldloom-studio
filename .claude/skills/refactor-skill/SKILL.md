---
name: refactor-skill
description: Split and consolidate existing Agent Skills without losing battle-tested content. Use when the user names a skill whose SKILL.md or referenced files have grown too large, dense, duplicated, or hard to load, and wants it reorganized into progressively disclosed files.
---

# Refactor Skill

Refactor one existing skill folder into a smaller, navigable `SKILL.md` plus disclosed files, while preserving every live instruction unless it is deliberately pruned with a recorded reason.

## Inputs

The user should name one skill by folder, path, or skill name, for example:

```text
$refactor-skill .claude/skills/grilling
```

If the target is ambiguous, resolve by exact skill `name` first, then by folder name. Stop and ask only when multiple live targets remain plausible.

## Placement Standard

Default new extracted reference material to `references/<topic>.md`. This matches the current Agent Skills layout and keeps new detailed documentation distinct from `SKILL.md`.

Keep or create a top-level sibling markdown file only when one of these is true:

- The skill already has a sibling-file house form and preserving paths is less disruptive.
- The file is a short central reference that every branch may name directly, like `GLOSSARY.md`.
- The file is an output/template contract whose name is already part of the skill's vocabulary.

Keep disclosed files one level deep from `SKILL.md`. Do not create nested reference chains where `SKILL.md` points to file A and file A is the only path to file B; instead, make every disclosed file directly discoverable from `SKILL.md`.

## Workflow

### 1. Establish custody before editing

1. Read the repo's applicable root entrypoint instructions (`CLAUDE.md`, `AGENTS.md`, or both) if they are not already live in the current session. Record every verification gate that applies to skill or workflow changes; absence is normal, but do not assume it.
2. Check `git status --short` and note unrelated dirty files.
   - If files inside the target skill are already modified, treat the current working tree as the source of truth unless the user explicitly asks for a different baseline. Classify each target-local dirty file as in-scope, adjacent-but-untouched, or blocker before editing. Do not revert pre-existing target changes.
   - Before the first edit, capture a repo-external baseline snapshot of every target markdown file whose working-tree content is the source of truth. For each in-scope or adjacent non-markdown asset, record a content hash and capture a snapshot when later comparison requires the content. Record every snapshot path and hash in the custody ledger; do not stage, normalize, or otherwise alter the source while baselining it.
3. Resolve the target skill directory and its mirrored `.agents/skills/<name>` entry, if any. Edit the canonical source, usually `.claude/skills/<name>`, and verify whether `.agents/skills/<name>` is a symlink rather than a copy.
4. List every file in the skill folder. Read `SKILL.md` in full, then read every markdown file directly referenced by `SKILL.md`. Also read sibling markdown files in the skill folder even if the pointer is weak or missing.
   - Classify every non-markdown asset as in-scope, adjacent-but-untouched, or irrelevant. Read directly referenced or behavior-coupled scripts, configuration, templates, and other assets far enough to preserve their contract, and record the post-edit check that will prove it: content hash, syntax check, focused smoke test, or another contract-appropriate check.
5. Build a custody ledger before the first edit. Segment the current markdown into content atoms: headings with their body, numbered steps, bullet groups, code blocks, templates, gotchas, and frontmatter fields. For each atom, record:
   - source location;
   - atom label;
   - distinctive phrase to search during the preservation audit;
   - initial disposition;
   - provisional final home;
   - merge target or prune reason, when applicable.
   Assign exactly one initial disposition:
   - `inline`: stays in `SKILL.md`
   - `move`: moves to a named disclosed file
   - `merge`: consolidates with another named atom
   - `prune-candidate`: duplicate, no-op, stale, or outside the skill's job
6. Treat any atom without a disposition or provisional home as a blocker. Do not edit until every atom is accounted for.
7. For dense skills, multi-file splits, or any created/removed files, make the custody ledger visible before the first edit: post a compact ledger to the conversation or write a repo-external scratch ledger and report its path.

Done when the repo gates, target folder, mirror state, markdown sources, non-markdown assets, dirty-target baseline, and complete custody ledger with provisional homes are known.

### 2. Design the new information hierarchy

Treat the Step 1 homes as provisional. Use this step to finalize the information hierarchy, then update every atom's ledger row with its final home before the first edit.

Keep in `SKILL.md` only:

- the invocation contract and required inputs;
- the ordered steps every run must follow;
- gotchas the agent would not recognize early enough from a reference pointer;
- context pointers with clear trigger wording for disclosed files;
- final verification criteria.

Move out of `SKILL.md`:

- branch-specific details;
- long examples and templates;
- deep explanations of terms;
- mechanical checklists used only in one phase;
- reference material that is read only after a branch is selected.

Use these split triggers as prompts, not blind thresholds:

- `SKILL.md` approaches 500 lines, 5000 tokens, or becomes dense enough that a bounded read truncates.
- A disclosed file exceeds about 150 lines or covers multiple unrelated branches.
- A file over 100 lines lacks a table of contents.
- Two files explain the same rule or term in different words.

Prefer a move-first refactor: move live text close to verbatim, repair pointers, then prune or compress only after preservation is easy to verify.

Done when every atom has a final home, every new file has a direct pointer from `SKILL.md`, and every prune-candidate has a reason.

### 3. Split recursively

After the first split, inspect every remaining markdown file in the target skill:

1. Read the file end-to-end.
2. Decide whether it is now focused, too large, or carrying multiple branches.
3. If it is too large, split it by branch or concept into directly linked files.
4. If it is small but duplicated elsewhere, consolidate it into the single strongest home.
5. Update `SKILL.md` so no live disclosed file is discoverable only through another reference file.

Do not split a file merely because it is long if every branch truly needs it at once. In that case, keep it together, add a table of contents when useful, and make the pointer wording more precise.

Done when recursive reads find no oversized, duplicated, or weakly pointed disclosed file.

### 4. Consolidate across the whole skill

Read the final planned file set as one skill, not as isolated files. Search for repeated leading words, rules, warnings, output formats, and completion criteria.

Apply single-home discipline:

- Keep each rule in one authoritative place.
- Replace copies with pointers or shorter reminders.
- Merge scattered caveats into the file where the agent needs them.
- Keep a short inline reminder only when the step would otherwise be unsafe before the reference is loaded.

Prune only when the custody ledger names the reason:

- `duplicate`: same meaning now lives in the chosen home.
- `no-op`: does not change agent behavior versus the default.
- `stale`: contradicted by current local docs or current skill standards.
- `out-of-scope`: belongs in another skill or repo doc.

When unsure whether a battle-tested instruction is safe to prune, keep it and mark it for later audit rather than deleting it.

Done when every remaining repetition is intentional and every deletion has a recorded disposition.

### 5. Edit and repair pointers

Make the smallest file edits that realize the custody ledger.

Required pointer checks:

- Markdown links resolve from the file where they appear.
- Plain path references resolve or are rewritten.
- `SKILL.md` names when to read each disclosed file, not just that it exists.
- Existing inbound references from sibling skills or repo docs still point to the right target, or are updated.
- The `.agents/skills` mirror still resolves to the edited source.

Prefer `rg` for pointer sweeps. Search for old headings, old filenames, distinctive phrases from moved atoms, and the target skill name. When sweeping from repo root, include hidden skill roots with `rg --hidden --glob '!.git/*' ...` or pass explicit `.claude/skills/...` and `.agents/skills/...` paths, then verify both skill roots were in scope.

When a search phrase contains backticks, quotes, pipes, `$`, or other shell metacharacters, single-quote or escape the pattern, or pass the pattern as a separate argument so the shell cannot reinterpret it.

Done when every created, moved, or renamed file is reachable and no old pointer is left stale.

### 6. Prove preservation

Before final delivery, run a preservation audit:

1. Re-read the final `SKILL.md` and every final markdown file in the skill.
2. Re-run the recorded content-hash, syntax, smoke, or equivalent checks for every in-scope or adjacent-but-untouched non-markdown asset. Confirm that every change is intentional and ledgered.
3. Compare the final files against the custody ledger schema. Every source atom must be `inline`, `moved`, `merged`, or `pruned with reason`, and every final home must match the ledger or have an updated reason.
4. For moved or merged atoms, verify by searching each atom's distinctive phrase or by inspecting the final destination.
5. Inspect `git diff` for accidental deletion, frontmatter damage, broken code fences, broken numbering, and half-cut sentences. When the target started dirty, also compare each repo-external baseline snapshot with its final file using `git diff --no-index <snapshot> <final-file>` or an equivalent exact comparison; an ordinary diff against `HEAD` is not preservation proof for pre-existing working-tree content.
6. Run `git status --short <target-skill>` and explicitly account for every untracked created file. Inspect each created file directly; when useful, use `git diff --no-index /dev/null <file>` or an equivalent direct read because ordinary `git diff` does not show untracked file contents.
7. Discover and run the available skill validator if one exists. Use a bounded lookup such as `find . -name 'quick_validate.py' -o -name '*validate*skill*'`, run the repo-local validator when found, and report the lookup command when no validator exists. If validation fails because of a known repo-wide schema mismatch, report it separately from the refactor result.
8. Run every mandatory repo verification gate recorded during intake; these gates are separate from the skill validator. In this repo, skill and workflow changes require all three root gates: `pnpm test`, `pnpm typecheck`, and `pnpm build`. If a mandatory gate cannot run or fails, report the refactor as incomplete rather than claiming successful verification.

The preservation audit fails on unexplained deletion. Restore the atom, or record a deliberate prune reason and rerun the audit.

Done when the custody ledger, final markdown, non-markdown asset checks, and every mandatory repo gate agree and pass.

## Final Report

Report:

- target skill and canonical path edited;
- files created, changed, renamed, or removed;
- what stayed inline versus moved behind pointers;
- every pruned or consolidated item with its reason;
- pointer and mirror verification;
- dirty-target baseline comparison and non-markdown asset checks;
- validator result, or why no validator ran;
- every mandatory repo verification gate and its result;
- any battle-tested content intentionally kept because pruning was uncertain.
