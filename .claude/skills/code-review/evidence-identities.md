# Review evidence identity refresh

Use one shared identity block for normal and fallback reviews, whether or not TDD ran. Refresh it after every review fix or evidence rerun so current proof cannot silently retain superseded fixture, browser-session, packet, revision, or artifact identifiers.

```markdown
Evidence identity refresh:
- Current evidence identities: fixture paths <paths/none>; browser sessions <names/none>; packet paths/hashes <paths and hashes/none>; active revisions <IDs/none>; artifacts <paths/IDs/none>
- Historical red identities retained: <fixture paths ...; browser sessions ...; packet paths/hashes ...; active revisions ...; artifacts ... / none>
- Superseded evidence identities: fixture paths <paths/none>; browser sessions <names/none>; packet paths/hashes <paths and hashes/none>; active revisions <IDs/none>; artifacts <paths/IDs/none>
- Superseded-token sweep: <command/result showing no active-proof hits, with historical-red occurrences classified / N/A because every superseded category is none>
```

Keep historical red identities only when they are explicitly classified as earlier failing evidence. Use literal `none` when there are no historical red identities; otherwise enumerate all five categories just like the current and superseded inventories. If any superseded category is not `none`, run `rg` or `grep` for every superseded value and record that there are no active-proof hits plus how any historical-red hits were classified; do not use the all-none N/A.
