# Validation and Closeout

Read this file in full during Step 3 of [`to-prd`](../SKILL.md) before validating, creating, or recovering an intended issue.

## Staged-body validator

For a staged body file, run the skill-local validator before `gh issue create`. Put the validation policy in one temporary JSON manifest: `expectChecklist`, `approvedSources`, `publicationRefSources`, and `disallowedSources`. Every cited local path belongs in exactly one permitted class: ordinary worktree content proven identical to the publication ref belongs in `approvedSources`; a deliberately consulted publication-ref blob belongs in `publicationRefSources` with its unique relied-on Markdown heading anchors. Any extracted local or root authority path omitted from those two allowlists fails validation. Every summarized, untracked, temp-only, publication-ref-missing, or otherwise non-citable source belongs in `disallowedSources`; a dirty or content-different source may be cited only through the bounded publication-ref mode. Set `expectChecklist` to `true` whenever the browser-visible guidance checklist gate applies.

Create the policy manifest with the environment-approved editing mechanism after source extraction, then reuse that same file for staged and published validation, including across fresh shells or resumed sessions. Use the mechanically derived source-path set from the [source-durability gate](source-durability.md#durability-gate) as the classification inventory: put each durable extracted path in `approvedSources` or `publicationRefSources`, keep every summarized or non-durable path in `disallowedSources`, and do not retype a separate durability array.

```json
{
  "expectChecklist": true,
  "approvedSources": [
    "docs/principles/example.md",
    "CONTEXT.md"
  ],
  "publicationRefSources": [
    {
      "path": "docs/specs/example.md",
      "anchors": ["## Entry Contract", "## Handoff Contract"]
    }
  ],
  "disallowedSources": [
    "reports/example-local-prep.md"
  ]
}
```

```sh
BODY_FILE=path/to/prd-body.md
POLICY_FILE=path/to/prd-body.policy.json
node .claude/skills/to-prd/scripts/validate-prd-body.mjs "$BODY_FILE" --policy-file "$POLICY_FILE"
```

If any item fails, edit the body before publishing. Set `expectChecklist` to `false` only when the gate does not apply; the validator rejects a checklist marker whose expectation was not declared. For a checklist-gated PRD, `checklistMissing` must be empty: every current issue-tracker checklist item must have a row or stable anchor in the PRD body, and each row must identify a covering PRD home or `N/A - <reason>`.

The validator also emits `localSourcePaths`, `unexpectedLocalSourcePaths`, `publicationRefSources`, `unusedPublicationRefSources`, `adrShorthands`, `resolvedAdrPaths`, and `unresolvedAdrShorthands`; its resolver and policy checks do not replace the direct Git blob/anchor or ordinary durability checks on the emitted paths. After publication, if validation shows a section is malformed or incomplete, edit the issue and re-run verification before final reporting.

## Final status-language pass

After all pre-create checks pass and before `gh issue create`, run a final status-language pass over the staged body. Completed intake, durability, template, checklist, label-existence, duplicate, and seam-confirmation gates should be recorded as facts, not future work: replace stale gate phrasing such as "should be checked", "must be checked before publication", or "if the body passes" with "was checked", "passed", or "is appropriate because..." when that proof has actually been gathered. Keep provisional language only for implementation decisions, sequenced follow-ons, or genuinely open decisions.

A compact sweep is useful before create; inspect hits rather than treating them as automatic failures:

```sh
BODY_FILE=path/to/prd-body.md
status_scan=0
rg -n "should be checked|must be checked before publication|if the body passes|pending publication|TBD before publication" "$BODY_FILE" || status_scan=$?
if [ "$status_scan" -eq 1 ]; then
  printf 'status-language scan: no matches\n'
elif [ "$status_scan" -ne 0 ]; then
  exit "$status_scan"
fi
```

`rg` exit `1` means the scan found no stale language and is a pass. Exit `0` leaves the matching lines visible for intent review; any other exit is a tool failure and must stop publication.

## Published-body readback

After creation, verify tracker metadata with `gh issue view`: the exact title, chosen labels, state, URL, and issue number. Compare the published body with the latest approved staged body, then run the same skill-local validator against the published body with `--stdin` and the exact staged policy manifest. This readback proves exact staged-to-published body identity after normalizing the expected final newline, then verifies the required PRD sections, seam note, browser-visible checklist when applicable, machine-local path exclusion, both local-source allowlist classes, disallowed-source exclusion, and ADR resolution.

```sh
gh issue view <number> --json number,title,labels,state,url \
  --jq '{number,title,state,url,labels:[.labels[].name]}'

test -f "$POLICY_FILE" || { printf 'validator policy manifest is missing\n' >&2; exit 1; }
published_body="$(gh issue view <number> --json body --jq '.body')" || {
  printf 'published-body tracker read failed\n' >&2
  exit 1
}
test -n "$published_body" || {
  printf 'published-body tracker read returned an empty body\n' >&2
  exit 1
}
cmp -s "$BODY_FILE" <(printf '%s\n' "$published_body") || {
  printf 'published body differs from the latest approved staged body\n' >&2
  exit 1
}
printf 'staged/published body identity: match\n'
printf '%s\n' "$published_body" \
  | node .claude/skills/to-prd/scripts/validate-prd-body.mjs --stdin --policy-file "$POLICY_FILE"
```

If the body fetch exits nonzero or returns an empty body, classify the attempt as a tracker-readback failure rather than a body-validation failure. Retry the same readback under the active environment's network and approval rules; do not edit the issue unless a successfully retrieved body then fails validation.

An identity mismatch is a published-body verification failure even when the published validator would still pass. If the body needs repair, edit the staged body file first, rerun staged validation and status-language checks, then update the issue from that file so it remains the latest approved comparison authority.

Use the published validator output only when exact body identity passes, the validator matches the staged configuration, and it returns no failures. Rerun the appropriate [source-durability gate](source-durability.md#durability-gate) for every emitted `localSourcePaths` and `resolvedAdrPaths` entry: ordinary worktree-content proof for `approvedSources`, and direct publication-ref blob/anchor proof for `publicationRefSources`. The validator does not replace either Git durability proof.

An unresolved or ambiguous ADR shorthand, unexpected local source, unused publication-ref policy entry, leaked disallowed source, untracked source, publication-ref-missing source, ordinary approved source whose consulted worktree content differs from the publication ref, non-unique declared anchor, or publication-ref source claim that relies on worktree-only wording is a verification failure. Repair the issue body or durability posture and rerun both the validator and the direct Git checks before final reporting.

## Interruption, recovery, and cleanup

A return from the sanctioned Step 2 seam/package checkpoint counts as a pre-create resume even though the pause was expected. On return — or after any other interruption, resume, or compaction before issue creation — do not rely on remembered pre-create state and do not recapture or overwrite the intake worktree-baseline artifact. Immediately re-run `git status --short`, the exact-title duplicate search, cited-source and resolved-ADR durability checks, and label proof. After the staged body exists, re-run its template/checklist/local-path validation and the final status-language pass. The complete bundle must pass before publishing.

If interrupted, resumed, or compacted after issue creation begins, first recover the issue number without creating a duplicate. When the number is unknown, do not retry `gh issue create` until you have rerun the failure-safe exact-title duplicate guard from [publication.md](publication.md#title-and-exact-title-duplicate-guard); use the single exact-title match, stop and report if multiple matches exist, and retry creation only after a successful tracker read proves no matching issue was created. Then re-run the compact `gh issue view` verification, re-check exact staged-to-published body identity, re-check the published body's local-source paths against both policy allowlist classes, resolve any published ADR shorthands and re-check the resolved ADR paths, remove any temporary body or policy file if needed, preserve the original baseline artifact, and continue through the mechanical comparison and cleanup below.

Remove every temporary body and validator-policy file you created using the environment-approved edit/removal mechanism. While the cleanup-owned baseline artifact still exists, pipe a fresh NUL-delimited status into the helper's `compare` command. Pass every run-owned remaining path as `--intentional-path`, every known outside change as `--concurrent-path`, and the artifact itself as `--snapshot-path`; the helper emits one classification row per baseline/final path and fails on every unclassified addition, removal, or status change. An intentional declaration is required even when this run edited an already-dirty path whose porcelain status code stayed unchanged.

```sh
git branch --show-current # use DETACHED when this emits an empty line
git rev-parse HEAD
git status --porcelain=v1 -z --untracked-files=all \
  | node .claude/skills/to-prd/scripts/worktree-baseline.mjs compare \
      --baseline-file reports/.tmp-prd-<slug>.worktree-baseline.json \
      --snapshot-path reports/.tmp-prd-<slug>.worktree-baseline.json \
      --branch <exact-current-branch-or-DETACHED> \
      --head <exact-current-sha> \
      --intentional-path <run-owned-path> \
      --concurrent-path <outside-run-path>
```

After a zero-exit comparison, preserve its rows for the final ledger, delete the baseline artifact with the environment-approved mechanism, verify that every temporary body, policy, and baseline artifact is absent, and run `git status --short` once more. If the final human-readable status differs from the helper input other than removal of the self-excluded baseline artifact, rerun comparison before reporting. For temporary files outside the repository, verify cleanup with direct existence checks such as `test ! -e <path>`; repo-local Git status cannot prove cleanup of files outside the worktree.

## Final closeout ledger

Before the final response, reconcile tracker proof, exact staged-to-published body identity, validator results, staged and published durability ledgers, seam/checklist outcome, deferred or sequenced work, and temporary-file cleanup. Reproduce the mechanically generated comparison rows for every remaining path, omitting only rows whose final status is `null` because a baseline path was removed and explicitly classified:

| Path | Final status | Class | Ownership |
|---|---|---|---|
| `<exact path>` | `<git status code>` | `pre-existing` / `concurrent` / `intentional` | `not changed by this run` / `appeared or changed outside this run after intake` / `<why this run owns it>` |

`pre-existing` means the exact path/status row was present in the intake baseline and this run did not own a change to it. `concurrent` means the row was absent from the intake baseline, or changed after intake outside this run's ownership. `intentional` means this run owns the final dirty state. Do not label a final-only path as pre-existing merely because it is present when closeout runs, and do not label an already-dirty path pre-existing when this run also edited it.

Do not collapse paths into counts or unnamed families. If the worktree is clean, record `clean` instead of inventing a row. The final answer must name the branch and publication ref separately; neither substitutes for the per-path ledger.
