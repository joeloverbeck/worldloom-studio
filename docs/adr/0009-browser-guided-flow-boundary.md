# Browser guided-flow boundary

Browser workflow state is a first-class guided decision surface over server-owned flow policy, not an incidental rendering of records.

The browser consumes server-returned flow state, step maps, doctrine payloads, prompt-out lifecycle shapes, blockers, skip rules, severity paths, write intents, and read-side trail links. It presents them as decision points that satisfy `docs/principles/guided-workflow-usability.md` W-8. Generic record forms remain useful substrate, repair, and admin surfaces, but they are not the primary interface for field-tested package protocols.

This ADR complements ADR 0006, ADR 0007, and ADR 0008. Those ADRs made Admission, Prompt-out, and flow-owned persistence deeper module boundaries without requiring a steward-visible redesign. This ADR records the matching browser interpretation: the visible flow layer must expose the method's decision sequence, not only the world-file catalog.

## Considered Options

- Treat flow screens as generic record/detail forms with extra validation. Rejected because it hides the package's reasoning order and lets schema completeness masquerade as workflow completeness.
- Let each flow invent its own guidance grammar. Rejected because cross-flow handoffs, prompt-out, skips, blockers, and read-side trails need consistent browser expectations.
- Move all flow policy into the browser. Rejected because Admission, repair, skip, prompt-out, and close readiness are canon-governance policy and must remain server-owned.
- Make guided flows mandatory for every schema-only surface immediately. Rejected because charter T-8 requires honest evidence: untested surfaces can remain schema-only until field use licenses a dedicated guided flow.

## Consequences

- New guided-flow specs and major retrofits use `docs/specs/guided-flow-spec-template.md`.
- Browser slices that touch guided flows owe browser-visible acceptance evidence from `docs/specs/browser-visible-guidance-acceptance.md`.
- Prompt-out browser surfaces show prompt packet previews and source manifests rather than only a copy button.
- Canon Workbench and other read-side views link back to flow artifacts but do not become mutation workflows.
- Generic record editing remains allowed, but closing a field-tested flow issue on generic CRUD alone contradicts this ADR.

## Principles

Touches `charter.md` P-3/P-4/T-8, `canon-sovereignty.md` P-2/W-1/T-5, `domain-fidelity.md` P-1/T-2, `workflow-principles.md` P-5/W-1-W-4/W-7, `guided-workflow-usability.md` W-8, and `data-principles.md` P-6/W-5/W-6/T-3/T-4/T-5. It affirms non-contradiction.
