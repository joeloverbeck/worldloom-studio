# Branch and collaboration: door open in the schema, closed in the UI

`15_branching_versioning_and_collaboration.md` is out of v1 product scope and has zero field exposure **[untested surface]** — but its record semantics are cheap to honor now and expensive to retrofit. The schema therefore includes, from the first migration:

- a **continuity scope** on every fact, with the single default "main continuity" (the package's truth layers `branch canon`, status `branch-only`, and tag `branch-bound` all presuppose it);
- the **canon branch diff** and **collaboration decision record** types with their vocabularies (branch status, merge expectation, the eight workflow roles), shaped by `templates/canon_branch_diff.md` and `templates/collaboration_decision_record.md`;
- an **actor** on every provenance entry (v1 has exactly one steward; the field exists).

v1 builds no branching UI and no multi-steward mechanics — this is door-keeping grounded in the package's actual record shapes, not speculation about features. Reversing the *deployment* assumption (hosted, multi-steward) would still be a material architectural change (sync engine, auth, conflict semantics); this ADR only ensures the *data* won't have to be re-modeled when that day comes.
