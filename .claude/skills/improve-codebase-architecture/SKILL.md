---
name: improve-codebase-architecture
description: Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick.
disable-model-invocation: true
---

# Improve Codebase Architecture

Surface architectural friction and propose **deepening opportunities** — refactors that turn shallow modules into deep ones. The aim is testability and AI-navigability.

This command is _informed_ by the project's domain model and built on a shared design vocabulary:

- Run the `/codebase-design` skill for the architecture vocabulary (**module**, **interface**, **depth**, **seam**, **adapter**, **leverage**, **locality**) and its principles (the deletion test, "the interface is the test surface", "one adapter = hypothetical seam, two = real"). Use these terms exactly in every suggestion — don't drift into "component," "service," "API," or "boundary."
- The domain language in the repo's configured domain docs gives names to good seams; ADRs and foundational principles record decisions this command should not re-litigate.

## Process

### 1. Explore

Read the project's domain docs and architectural authorities before exploring code:

- If `docs/agents/domain.md` exists, follow it. Otherwise, read `CONTEXT-MAP.md` when present and then the relevant mapped `CONTEXT.md` files; fall back to root `CONTEXT.md` when there is no map. If any of these files are absent, proceed silently.
- Read ADRs that touch the area: `docs/adr/` for system-wide decisions, and context-scoped ADRs where the repo's domain-doc rules point to them.
- Read `docs/principles/README.md` if it exists, then any principle files relevant to the area you're reviewing. Use the authority order and conformance rule from that README when ranking candidates.

Then use the Agent tool with `subagent_type=Explore` to walk the codebase. If that tool or subagent is unavailable, do the exploration directly with the same questions and state in your notes that no Explore subagent was available. Don't follow rigid heuristics — explore organically and note where you experience friction:

- Where does understanding one concept require bouncing between many small modules?
- Where are modules **shallow** — interface nearly as complex as the implementation?
- Where have pure functions been extracted just for testability, but the real bugs hide in how they're called (no **locality**)?
- Where do tightly-coupled modules leak across their seams?
- Which parts of the codebase are untested, or hard to test through their current interface?

Apply the **deletion test** to anything you suspect is shallow: would deleting it concentrate complexity, or just move it? A "yes, concentrates" is the signal you want.

### 2. Present candidates as an HTML report

Write a self-contained HTML file to the OS temp directory so nothing lands in the repo. Resolve the temp dir from `$TMPDIR`, falling back to `/tmp` (or `%TEMP%` on Windows), and write to `<tmpdir>/architecture-review-<timestamp>.html` so each run gets a fresh file. Open it for the user when the environment allows — `xdg-open <path>` on Linux, `open <path>` on macOS, `start <path>` on Windows. Prefer a detached/background opener when the command would otherwise stay attached (for example, `xdg-open <path> >/dev/null 2>&1 &`). If the opener fails in a headless, sandboxed, or GUI-less environment, do not treat report generation as failed; tell the user the absolute path and the opener command that failed.

The report uses **Tailwind via CDN** for layout and styling, and **Mermaid via CDN** for diagrams where a graph/flow/sequence reliably communicates the structure. Mix Mermaid with hand-crafted CSS/SVG visuals — use Mermaid when relationships are graph-shaped (call graphs, dependencies, sequences), and hand-built divs/SVG when you want something more editorial (mass diagrams, cross-sections, collapse animations). Each candidate gets a **before/after visualisation**. Be visual.

For each candidate, render a card with:

- **Files** — which files/modules are involved
- **Problem** — why the current architecture is causing friction
- **Solution** — plain English description of what would change
- **Benefits** — explained in terms of locality and leverage, and how tests would improve
- **Before / After diagram** — side-by-side, custom-drawn, illustrating the shallowness and the deepening
- **Recommendation strength** — one of `Strong`, `Worth exploring`, `Speculative`, rendered as a badge
- **Principle / ADR conflict** — if applicable, one warning callout explaining why the conflict may still be worth reopening

End the report with a **Top recommendation** section: which candidate you'd tackle first and why.

**Use vocabulary from the relevant domain glossary, and the `/codebase-design` vocabulary for the architecture.** If the glossary defines "Order," talk about "the Order intake module" — not "the FooBarHandler," and not "the Order service."

**Principle / ADR conflicts**: if a candidate contradicts a foundational principle or an existing ADR, only surface it when the friction is real enough to warrant revisiting that authority. Mark it clearly in the card (e.g. a warning callout: _"contradicts ADR-0007 — but worth reopening because…"_). Don't list every theoretical refactor an ADR forbids.

See [HTML-REPORT.md](HTML-REPORT.md) for the full HTML scaffold, diagram patterns, and styling guidance.

Do NOT propose interfaces yet. After the file is written, ask the user: "Which of these would you like to explore?"

### 3. Grilling loop

Once the user picks a candidate, run the `/grilling` skill to walk the design tree with them — constraints, dependencies, the shape of the deepened module, what sits behind the seam, what tests survive.

Side effects happen inline as decisions crystallize — run the `/domain-modeling` skill to keep the domain model current as you go:

- **Naming a deepened module after a concept not in the relevant domain glossary?** Add the term to the relevant context's `CONTEXT.md`. If the repo uses `CONTEXT-MAP.md`, choose the mapped context first; if the right context is unclear, ask instead of writing to root `CONTEXT.md`. Create files lazily only when there is something concrete to write.
- **Sharpening a fuzzy term during the conversation?** Update the relevant context's `CONTEXT.md` right there.
- **User rejects the candidate with a load-bearing reason?** Offer an ADR, framed as: _"Want me to record this as an ADR so future architecture reviews don't re-suggest it?"_ Only offer when the reason would actually be needed by a future explorer to avoid re-suggesting the same thing — skip ephemeral reasons ("not worth it right now") and self-evident ones.
- **Want to explore alternative interfaces for the deepened module?** Run the `/codebase-design` skill and use its design-it-twice parallel sub-agent pattern.

### 4. Implementation handoff

If the user asks to implement the selected candidate after grilling, summarize the agreed decisions before editing:

- Selected candidate and target modules
- Relevant domain context/glossary and any domain-model updates already made
- Constraints and dependencies the user accepted
- Whether the change is behavior-preserving; default to behavior-preserving unless the user explicitly approved a behavior change
- Expected tests and docs to update

Then switch to the repo's implementation workflow (`/implement` when there is an issue or PRD, otherwise the local coding guidelines). Keep edits scoped to the agreed candidate. Verify with focused tests plus any relevant full gates, and include doc/ADR/principle checks when those authorities changed or were used to justify the design.
