# Prompt-Structure Research Report — evidence for the prompt-packet standard

**Date:** 2026-07-06 · **Session:** `/grill-with-docs` trial-readiness audit (see `reports/trial-readiness-program.md`) · **Consumer:** PRD-G (prompt-packet structure hardening)
**Method:** deep-research harness — 5 search angles (vendor-guidance, academic long-context, empirical format-sensitivity, contrarian persona-efficacy, creative-diversity/constraints), 24 sources fetched, 119 claims extracted, top 25 adversarially verified by 3-vote panels (22 confirmed, 3 refuted, 0 unverified), synthesized to 12 findings.

## Question

How should a fully self-contained prompt be structured for maximum output quality when a steward pastes it into a cold LLM chat session (any vendor), for the app's two prompt families — **proposal** prompts (draft labeled candidate worldbuilding material with alternatives and assumptions, grounded in a supplied context packet) and **pressure** prompts (named-analyst critique of steward-authored material: risks, alternatives, questions — not rewrites)?

## Executive summary

Vendor guidance and verified research converge on a **sandwich architecture** for long, self-contained chat prompts: critical instructions, role framing, and hard constraints stated briefly at the top; the bulk context packet (canon, doctrine, source records) in the middle, wrapped in consistent XML-style tags with per-document source metadata; and the task/mode request plus a restatement of constraints and output labels at the bottom, anchored with a phrase referring back to the material above. This structure directly counters documented lost-in-the-middle and multi-needle retrieval degradation, whose best-verified mitigations are repeating instructions adjacent to the material they govern (+16 points in peer-reviewed testing) and a quote-grounding step before the main task. Delimiter format matters less than consistency — XML and Markdown both work; JSON performs poorly as a context wrapper. Negative constraints ("forbidden moves") stick best when phrased positively and paired with an explicit rationale the model can generalize from. A compact labeled exemplar is the strongest lever for labeled-output compliance in a chat paste, but exemplars anchor output patterns — the main documented risk for proposal-prompt diversity. Named-role framing is vendor-endorsed for stance and tone even at one sentence, though no verified evidence shows it improves critique *accuracy*.

## Confirmed findings

### F1 — Cross-vendor "sandwich" structure (HIGH; derived from seven 3-0 claims)

All three major vendors converge on a both-ends structure for long prompts: critical instructions/constraints/role at the top, bulk context in the middle, task query plus restated key instructions at the bottom. "Both-ends" is a synthesis across three separately-verified vendor directives, not any vendor's phrase; the one edge conflict (once-only placement: OpenAI says above wins for GPT-4.1, Anthropic/Google say below) is sidestepped entirely by stating instructions at both ends.
Sources: OpenAI GPT-4.1 prompting guide; Anthropic long-context tips; Google Gemini prompting-strategies and long-context docs; R&R paper (arXiv 2403.05004).

### F2 — OpenAI: both-ends beats either alone (HIGH; 3-0)

Verified verbatim: "ideally place your instructions at both the beginning and end of the provided context, as we found this to perform better than only above or below." OpenAI's published skeleton orders Role/Objective → Instructions → Reasoning Steps → Output Format → Examples → Context → final instruction. Caveat: unquantified internal finding; the once-only "above beats below" half is GPT-4.1-specific.

### F3 — Anthropic: longform data at top, query at end (HIGH; 3-0)

For 20k+ token prompts, put longform data at the top, above query/instructions/examples; "Queries at the end can improve response quality by up to 30% in tests, especially with complex, multi-document inputs." The 30% figure is vendor-reported without published methodology. Verified on platform.claude.com (live 2026-07-06).

### F4 — Google: context first, instructions at the very end; behavioral constraints at the very beginning (HIGH; 3-0)

"Supply all the context first. Place your specific instructions or questions at the very end of the prompt"; separately, "Place essential behavioral constraints, role definitions (persona), and output format requirements in the System Instruction or at the very beginning" — jointly implying both-ends. Includes the "Based on the information above…" anchor-phrase advice.

### F5 — Delimiters: XML or Markdown, chosen once and used consistently; JSON poor as context wrapper (HIGH; 3-0, four claims merged)

Anthropic recommends XML tags for prompts mixing instructions/context/examples/inputs, with multi-document packets as `<documents>` → `<document>` → `<source>` + `<document_content>`. OpenAI recommends Markdown titles as default, reports good XML adherence, and reports JSON "performed particularly poorly" as a document wrapper in long-context testing. Google: "XML-style tags… or Markdown headings are effective. Choose one format and use it consistently." Verifier caveat: format effects are model-dependent (arXiv 2411.10541: GPT-3.5 favored JSON, GPT-4 Markdown) — read as "pick one, be consistent," not a universal ranking.

### F6 — Lost-in-the-middle and multi-needle degradation are real and hit the packet's exact regime (HIGH; 3-0)

The U-shaped position curve (Liu et al.) persists in 2025–2026 evaluations; newest models near-perfect *single*-needle recall, but degradation concentrates in multi-fact tasks — the regime a multi-section worldbuilding packet occupies. Google's own long-context doc admits multi-needle retrieval "can vary to a wide degree."

### F7 — Verified mitigation: instruction repetition adjacent to governed material (+16 points) (HIGH; 3-0)

R&R (Findings of EMNLP 2024, code released): periodically repeating prompt instructions through long context improved QA accuracy by 16 points on average (GPT-4 Turbo, Claude-2.1, ≤80k tokens); mechanism is reduced token distance between instruction and relevant context. A reminder adjacent to the relevant passage beat both uniform repetition and beginning-only placement (PubMed 99.2% vs 94.8%; beginning-only far worse: SQuAD 70.4% vs 88.0%). Caveat: 2023-era models; effect size likely shrinks on current models, direction consistent with all vendor guidance. Packet implication: end-restated mode request and forbidden moves are evidence-backed; section-local micro-instructions (e.g., "treat the following as unverified" atop source records) are supported by the adjacency result.

### F8 — Quote-grounding before the main task (MEDIUM; 3-0, single-vendor)

Anthropic: ask the model to first extract relevant quotes from supplied documents (e.g., into `<quotes>` tags) before performing the task, to cut through noise. Single-vendor efficacy assertion; also doubles as provenance discipline for proposal prompts (assumptions traceable to sources).

### F9 — Role/persona framing: stance and tone, not proven accuracy (MEDIUM)

Anthropic: a role "focuses Claude's behavior and tone… Even a single sentence makes a difference." Google: persona at top/system position. But the persona-accuracy literature (incl. Zheng et al., EMNLP Findings 2024; Wharton GAIL Report 4, arXiv 2512.05858) finds personas do not reliably improve objective-task accuracy and can occasionally hurt. Implication: keep the named-analyst role, position it first, treat it as a stance/scope device — not an accuracy booster.

### F10 — Negative constraints: positive phrasing plus rationale (MEDIUM; 3-0 twice, single-vendor)

Anthropic: tell the model what to do instead of what not to do, and attach an explicit motivation to hard prohibitions — "Claude is smart enough to generalize from the explanation." Packet implication: pair each forbidden move with its reason ("never assign canon status — only the steward can canonize; your output is advisory input to that decision") and restate the required behavior positively ("label every proposal as a candidate"). Adherence further helped by both-ends placement (F1, F7).

### F11 — Few-shot exemplars are the strongest labeled-output lever in chat, used sparingly (HIGH; four 3-0 claims)

Anthropic: examples are "one of the most reliable ways to steer output format, tone, and structure" — 3–5 relevant, deliberately diverse, in `<example>` tags. Google: prompts without few-shot examples "are likely to be less effective"; exact structural/whitespace consistency across examples required. Caveat: newest-model commentary suggests fewer/lighter examples suffice; a single structural skeleton may beat 3–5 full exemplars in an already-long packet where exemplar content would anchor proposals.

### F12 — Proposal diversity / mode collapse: only indirect confirmed evidence (MEDIUM)

Both vendors document that exemplars anchor output patterns (Anthropic: examples must "vary enough that Claude doesn't pick up unintended patterns"; Google: too many examples cause overfitting). No confirmed claim established a direct, quantified single-turn technique for eliciting genuinely diverse creative alternatives. Verification surfaced 2025–2026 homogenization research (arXiv 2501.00273, 2502.12700) and the search phase surfaced Verbalized Sampling (arXiv 2510.01171: ask for K distinct tagged candidates each with a verbalized probability), but none passed this pipeline's confirmation votes. Defensible implications from confirmed evidence: keep exemplars structural, few, and varied; instruct that alternatives must differ along named axes (premise, mechanism, consequence) rather than relying on "give 3 alternatives" alone — the named-axis device is practice-informed, not claim-confirmed.

## Refuted claims (0-3 in adversarial verification)

1. *"LLMs suffer 'instruction forgetting' when the task instruction precedes a long input, because self-attention models locality"* — the mechanistic framing did not survive verification (aclanthology 2024.findings-acl.693).
2. *"Post-instruction placement consistently outperforms instruction-first across model scales and tasks"* — refuted as stated; end-only task placement rests on vendor guidance plus the R&R adjacency mechanism, not on proven academic generality.
3. *"LLMs cannot follow relative-position attention instructions ('focus on the middle')"* — refuted as stated (arXiv 2406.17095 shows adaptation capacity).

## Caveats

1. All vendor effect sizes are unaudited self-reports (Anthropic "up to 30%", OpenAI "performed better", OpenAI's format rankings); only the R&R +16 is peer-reviewed, on 2023-era models with stronger positional bias than current models.
2. Guidance is vendor-scoped and conflicts at the once-only placement edge; the both-ends sandwich is the only placement all three endorse.
3. Delimiter-format effects are model-dependent; read as "pick XML or Markdown and be consistent."
4. Anthropic guidance verified on platform.claude.com (legacy console.anthropic.com URLs redirect) — cite platform.claude.com going forward.
5. Anthropic's 20k+ threshold means placement effects at smaller packet sizes — the likely regime for most Worldloom packets — are less certain; the sandwich is still the safe default since no evidence says it hurts short prompts.
6. End-only task placement should not be presented as academically proven (see refuted claims).
7. Quote-grounding and negative-constraint findings are single-vendor without independent quantitative corroboration.
8. Coverage gaps: no direct evidence on labeled-output compliance rates in chat UIs specifically; no confirmed quantitative creative-diversity technique.

## Open questions (candidates for the field-trial's subagent prompt evaluation)

1. Does named-analyst framing improve *critique quality* in pressure-style red-teaming, or only stance/tone? (The persona literature covers objective QA, not adversarial critique.)
2. What single-turn technique reliably elicits genuinely diverse creative alternatives — named-axis differentiation, forced-persona-per-candidate, verbalized sampling, or "reject your first idea" scaffolds?
3. Do the long-context placement effects hold below the 20k-token threshold where most packets will live?
4. Do markdown-rendered chat surfaces mangle XML-tagged *output* labels — favoring Markdown-labeled output sections even inside an XML-delimited packet?

## Mapping to the 10-section packet standard (recommendations for PRD-G)

The current standard (`docs/specs/prompt-out-context-assembly.md`) orders: current decision, decision material, source records, bearing context, package doctrine, mode request, forbidden moves, output labels, advisory warning, source manifest. The evidence recommends re-*rendering* (content unchanged — W-1's list stands):

- **R1 (F1–F4, high):** Render as a sandwich. Top block, compact: role/mode header (one line each: requested mode, analyst role for pressure, advisory warning, forbidden-move summary, output-label names). Middle: the context packet — bearing context, package doctrine, decision material, source records, source manifest — as tagged document blocks. Bottom block, full: the current decision restated adjacent to the task, the complete mode request, forbidden moves with rationales, output-label definitions, and an anchor phrase ("Based on the material above…").
- **R2 (F5, high):** Wrap context sections in consistent XML-style tags; source records as `<documents>/<document>/<source>/<document_content>` with the manifest's provenance identifiers as source metadata. Never wrap context in JSON. Output-label formatting may stay Markdown (see open question 4).
- **R3 (F7, high):** Add section-local micro-instructions adjacent to the material they govern (e.g., the advisory/unverified status note directly atop pasted or proposed material; the "these are excerpts, omissions listed" note directly atop the doctrine block).
- **R4 (F8, medium):** Add a pre-output quote-grounding step: "first quote the specific canon/doctrine/source-record lines your candidates (or critiques) rest on." Doubles as provenance discipline the steward can audit at disposition time.
- **R5 (F10, medium):** Rewrite each forbidden move as prohibition + rationale + positive restatement, and keep the full set in the bottom block with a summary at top.
- **R6 (F11, high; F12 caveat):** Include exactly one compact, fully-labeled structural skeleton example of the expected output (a labeled candidate for proposal mode; a labeled finding for pressure mode) with exact whitespace consistency — structural, content-light, to avoid anchoring proposal content.
- **R7 (F9, medium):** Keep the named analyst role, one sentence, first in the packet; do not claim accuracy benefits in spec wording — it is a stance/scope device.
- **R8 (F12, medium; practice-informed):** In proposal mode, require alternatives to differ along named axes (premise, mechanism, consequence) rather than only asking for N candidates. Flag as trial-testable.
- **R9 (spec conformance):** The existing excerpt-over-dump inclusion rule is consistent with the multi-needle evidence (F6) and stands unchanged.
- **R10 (evidence discipline):** The cold-LLM test gains structural criteria (sandwich present, tags consistent, constraints rationalized, skeleton example present) — checkable at the server prompt-generation seam. Open questions 1–4 route to the field trial's isolated-subagent prompt evaluation.

## Sources (24 fetched; primary unless noted)

Vendor: OpenAI GPT-4.1 prompting guide (developers.openai.com/cookbook); Anthropic long-context tips + XML-tags pages (platform.claude.com); Google Gemini prompting-strategies + long-context (ai.google.dev).
Academic long-context: arXiv 2403.05004 (R&R, EMNLP 2024 Findings); aclanthology 2024.findings-acl.693; arXiv 2406.17095; arXiv 2406.16008; arXiv 2406.17588; arXiv 2307.03172 (Lost in the Middle); techxplore.com 2025 summary (secondary).
Format sensitivity: arXiv 2411.10541 (NAACL 2025); arXiv 2408.02442; arXiv 2310.11324; arXiv 2510.05152.
Persona efficacy: arXiv 2512.05858 (Wharton GAIL Report 4); arXiv 2311.10054 (Zheng et al.); arXiv 2408.08631; arXiv 2508.19764; arXiv 2605.29420; learnprompting.org role-prompting (secondary).
Creative diversity/constraints: arXiv 2510.01171 (Verbalized Sampling); arXiv 2601.08070; github.com/CHATS-lab/verbalized-sampling.

## Principles

This report is evidence, not doctrine. Its consumer is PRD-G, which lands at spec altitude per the session's ratified decision: `docs/specs/prompt-out-context-assembly.md` and the versioned default prompt texts change; `docs/principles/*` and `docs/worldbuilding-system/20_ai_assisted_workflow.md` (v1.1) do not. W-1's content list (what packets must carry) is untouched; only rendering, ordering, and elicitation structure are in scope.
