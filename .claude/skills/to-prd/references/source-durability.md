# Source Durability

Read this file in full during Step 3 of [`to-prd`](../SKILL.md) before staging or publishing any intended PRD. Run the durability gate both before creation and after published-body readback.

## Ephemeral sources and staged bodies

Before publishing, sweep the whole PRD for ephemeral local paths (for example `/tmp/...`, temp files, or machine-local scratchpads); durable PRDs should summarize those artifacts' relevant conclusions or first archive the artifact somewhere durable before citing it. When the user cited a temporary report or scratch artifact, preserve the selected finding/title and a short "temporary source summarized, not cited" note in the preamble or Further Notes instead of publishing the local path. Temporary body files are fine as local staging, but sweep the PRD body itself and never cite the staging path in the published issue.

For staged issue bodies, prefer an outside-worktree path such as `/tmp/worldloom-prd-<slug>.md` when the active environment permits creating it safely. If the active editing rules forbid shell write tricks or make outside-worktree editing awkward, use a clearly temporary repo-local hidden file such as `reports/.tmp-prd-<slug>.md`, create and delete it with the environment-approved edit mechanism, and verify cleanup before final reporting. In Codex-style sessions, create and delete both `/tmp` and repo-local staged body files with the environment-approved edit mechanism (`apply_patch` when available) rather than shell redirection, heredocs, or unapproved `rm`.

## Local source citations

When the PRD cites a local ADR, spec, principle, methodology document, report, research brief, field-trial report, issue/PR, or other source artifact that was created or modified in this session — or ratified this session as a decision to author later but not yet written — check its repo durability before publishing. If a cited local document or source artifact is untracked or otherwise not yet durable, do not silently present it as a stable published artifact: either summarize its ratified conclusion without durable-citation wording, or record in Further Notes that the artifact is pending local repo publication (for a ratified-but-unwritten artifact, note it as pending authoring and publication, not merely publication). Do not add a second user checkpoint for this; the seam confirmation remains the sole checkpoint.

For staged bodies, run a repo-local artifact sweep before the template check. Extract local-looking source paths, decide which are actual source citations rather than examples, and verify each cited artifact is tracked or otherwise durable. The extractor recognizes sources under `docs/`, `reports/`, and `archive/`, plus cited root authority files `CONTEXT.md`, `CONTEXT-MAP.md`, `CLAUDE.md`, and `AGENTS.md`:

```sh
BODY_FILE=path/to/prd-body.md
node .claude/skills/to-prd/scripts/validate-prd-body.mjs "$BODY_FILE" --extract-sources
```

For each emitted path considered for ordinary `approvedSources` citation, run `git ls-files --error-unmatch <path>` or an equivalent repo-durability check before publishing. Tracked-ness alone is not durability: also intersect the cited paths with `git status --porcelain` — a cited file that is modified, staged, or untracked carries content no commit contains yet, and when the citation leans on that session-authored content, it gets the same treatment as an untracked artifact. Also verify publication-ref visibility for every tracked/clean cited source path: resolve the repository publication ref, normally `origin/main` or the default branch remote ref, and run `git ls-tree -r --name-only <publication-ref> -- <paths>`.

Path visibility is not content durability. A clean tracked file may come from a local commit that the publication ref does not contain, while an older file still exists at the same path on the ref. Evaluate content identity only after both tracked and publication-ref-visible checks succeed. When either prerequisite fails, record content identity as `N/A - no publication-ref blob`; do not interpret a successful `git diff --quiet` result for an untracked or ref-absent path as a match, because Git may have no compared blob for that working-tree path. For a tracked, visible cited path, run `git diff --quiet <publication-ref> -- <path>` (or an equivalent blob-identity comparison) against the live working-tree content the PRD actually consulted. Exit status `0` then proves the content matches; exit status `1` means the cited content differs from the publication ref and is pending local publication even when `git status` is clean and `git ls-tree` finds the path. If a cited artifact is missing from the publication ref or its relied-on content differs, replace the citation with a conclusion summary plus "pending local publication" wording, deliberately consult the publication-ref version under the bounded mode below, or stop before publishing when the PRD cannot be accurate without a stable source citation. If a cited artifact fails any tracked, clean, publication-ref path, or publication-ref content check and does not qualify for that bounded mode, replace the citation with a conclusion summary plus "temporary source summarized, not cited" wording, or record that the artifact is pending authoring/commit/publication as appropriate.

## Deliberate publication-ref consultation

When a needed source is locally drifted but the relied-on authority already exists on the publication ref, the PRD may cite the path only by deliberately consulting that ref's blob rather than the worktree file. Read it with `git show <publication-ref>:<path>`, and make no claim that depends on worktree-only wording. This is a distinct source-policy class, not a way to mark a dirty worktree source as ordinary durable content.

Add one `publicationRefSources` policy entry per such path. Each entry contains the path and one or more exact Markdown heading lines that uniquely bound the portions relied on:

```json
{
  "path": "docs/specs/example.md",
  "anchors": [
    "## Entry Contract",
    "## Handoff Contract"
  ]
}
```

Before staged validation and again after published-body readback, prove that the path exists on the named publication ref and that every anchor occurs exactly once in that ref blob. Derive the entries from the policy file rather than retyping them. The validator proves that each policy path is cited, belongs to no other policy class, and has well-formed unique anchor declarations; the direct Git gate proves blob visibility and anchor uniqueness:

```sh
PUBLICATION_REF=origin/main
PUBLICATION_REF_ENTRIES="$(jq -c '.publicationRefSources[]' "$POLICY_FILE")" || exit 1

while IFS= read -r entry; do
  test -n "$entry" || continue
  path="$(printf '%s\n' "$entry" | jq -r '.path')"
  ref_blob="$(git show "$PUBLICATION_REF:$path")" || exit 1

  while IFS= read -r anchor; do
    matches="$(printf '%s\n' "$ref_blob" | rg -Fxc -- "$anchor" || true)"
    test "$matches" = 1 || {
      printf 'publication-ref anchor is not unique: %s :: %s (%s matches)\n' "$path" "$anchor" "$matches" >&2
      exit 1
    }
  done < <(printf '%s\n' "$entry" | jq -r '.anchors[]')
done <<< "$PUBLICATION_REF_ENTRIES"
```

Record this proof separately from ordinary worktree-content durability:

| Path | Consulted version | Visible on publication ref | Declared anchors unique |
|---|---|---|---|
| `<source path>` | `<publication-ref>` | `yes/no` | `yes/no` |

Any missing blob, zero-match anchor, repeated anchor, body claim that cannot be bounded by the declared headings, or reliance on local-only wording is a verification failure. Move the source to summarized/disallowed posture or stop before publication; never silently fall back to the worktree file.

## Durability gate

Use direct repo commands for the durability proof rather than wrapping `git` calls inside a helper that can fail under the active sandbox. After path extraction and ADR shorthand resolution, classify every staged-body source in the policy manifest. For entries in `approvedSources`, run the tracked, status, and publication-ref path checks and run the content comparison only when tracked and publication-ref-visible. For `publicationRefSources`, run the deliberate ref-blob and anchor gate above instead. After the published validator readback, repeat the appropriate ordered gate for each emitted `localSourcePaths` and `resolvedAdrPaths` entry:

```sh
git status --porcelain -- <paths>
git ls-files --error-unmatch <paths>
git ls-tree -r --name-only <publication-ref> -- <paths>
# only after the tracked and publication-ref path checks above succeed:
git diff --quiet <publication-ref> -- <path>
```

A clean status, tracked-path readback, publication-ref path readback, and a zero-exit content comparison together are the ordinary worktree-content durable-citation proof. Run the content comparison separately or inspect its exit status explicitly; a quiet command with no captured status is not proof. The publication ref is normally `origin/main`; if it is not, substitute the resolved default branch ref and name it in the final report.

Record the ordinary proof as a labeled ledger with one row per `approvedSources` source or resolved ADR, and use the separate publication-ref ledger above for each `publicationRefSources` entry. Unlabeled bulk output, an unexplained empty status command, or grouped path counts do not prove that the same path set passed every check:

| Path | Clean | Tracked | Visible on publication ref | Content matches ref |
|---|---|---|---|---|
| `<source path>` | `yes/no` | `yes/no` | `yes/no` | `yes/no` |

Derive the durability path set mechanically from the validator extractor rather than retyping its paths. Re-run this derivation after every staged-body edit and from the exact published-body validation or extraction output before the published durability ledger; never carry a remembered array across a body change.

```sh
EXTRACTED_SOURCES="$(
  node .claude/skills/to-prd/scripts/validate-prd-body.mjs "$BODY_FILE" --extract-sources
)" || {
  printf 'source extraction failed\n' >&2
  exit 1
}
SOURCE_PATH_LINES="$(
  printf '%s\n' "$EXTRACTED_SOURCES" \
    | jq -r '[.localSourcePaths[], .resolvedAdrPaths[]] | unique[]'
)" || {
  printf 'source extraction returned invalid JSON\n' >&2
  exit 1
}
SOURCE_PATHS=()
if test -n "$SOURCE_PATH_LINES"; then
  mapfile -t SOURCE_PATHS <<< "$SOURCE_PATH_LINES"
fi
```

After the policy manifest exists, mechanically select its ordinary `approvedSources` subset for the inline run sheet; do not run worktree-content comparison on `publicationRefSources` entries:

```sh
APPROVED_PATH_LINES="$(jq -r '.approvedSources[]' "$POLICY_FILE")" || exit 1
APPROVED_PATHS=()
if test -n "$APPROVED_PATH_LINES"; then
  mapfile -t APPROVED_PATHS <<< "$APPROVED_PATH_LINES"
fi
```

This inline run-sheet pattern consumes that approved subset, keeps the required checks as direct Git commands, and makes every result auditable:

```sh
PUBLICATION_REF=origin/main

for path in "${APPROVED_PATHS[@]}"; do
  clean=no
  test -z "$(git status --porcelain -- "$path")" && clean=yes

  tracked=no
  git ls-files --error-unmatch "$path" >/dev/null 2>&1 && tracked=yes

  visible=no
  git ls-tree -r --name-only "$PUBLICATION_REF" -- "$path" | rg -Fx -- "$path" >/dev/null && visible=yes

  content_match="N/A - no publication-ref blob"
  if test "$tracked" = yes && test "$visible" = yes; then
    content_match=no
    git diff --quiet "$PUBLICATION_REF" -- "$path" && content_match=yes
  fi

  printf '| `%s` | %s | %s | %s | %s |\n' "$path" "$clean" "$tracked" "$visible" "$content_match"
done
```

Every ordinary durability prerequisite must be `yes` before the path may remain in `approvedSources`. `N/A - no publication-ref blob` is explicit proof that the content comparison was inapplicable and the path is non-durable, not a passing cell. A path may instead remain in `publicationRefSources` only when its separate ref-blob ledger passes and the PRD relied exclusively on that version. Preserve the completed ledgers for both the staged and published durability runs; do not infer the second run from the first.

Also scan for ADR shorthand such as `ADR 0006`, `ADR 0008`, or `ADR 0009`. Resolve each unique shorthand reference to exactly one `docs/adr/<number>-*.md` file and classify that resolved path under the same policy rules: ordinary tracked/clean/content proof for `approvedSources`, or deliberate ref-blob/anchor proof for `publicationRefSources`. If no ADR file resolves, or more than one file resolves, treat the shorthand as unresolved and either cite a durable explicit path, summarize the decision without a stable citation, or stop before publishing if the PRD cannot be accurate without it.
