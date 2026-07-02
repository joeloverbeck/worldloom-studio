---
name: grilling
description: Interview the user relentlessly about a plan or design. Use when the user wants to stress-test a plan before building, or uses any 'grill' trigger phrases.
---

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time, waiting for feedback on each question before continuing. Asking multiple questions at once is bewildering. A question may carry one tightly-coupled sub-decision when both share a single decision surface; never bundle independent branches. Ask each question via AskUserQuestion where available — recommended option first, labeled "(Recommended)"; fall back to a prose question otherwise. Keep the framing before a question to a few sentences — supporting detail can wait for the recap. If the first question times out right after a long context dump, the user may have been reading rather than away; weigh re-asking once before entering the fallback.

If a question times out with no response (the user is away), fall back once: batch the remaining decision branches into a single multi-question round of up to the question tool's limit (currently 4 questions), prioritizing the branches with the largest downstream impact — this is the sole exception to the no-bundling rule, since each retry costs a blocking wait. Branches that don't fit the round are resolved as if it had gone unanswered (recommended answer, PROVISIONAL), or by exploration where eligible. Phrase downstream questions in the batch conditionally on the recommended upstream answer; a vetoed upstream answer voids its dependent ledger lines. If the round also goes unanswered, apply your recommended answer, mark the ledger line PROVISIONAL, and continue. The closing recap must list provisional decisions separately as open to veto; proceed to the deliverable only if it was explicitly requested up front — otherwise stop at the recap. When the request asks for a determination or recommendation, the recap containing it satisfies the deliverable; producing downstream artifacts (documents, issues, code) still requires an explicit request.

If a question can be answered by exploring the codebase, explore the codebase instead.

As each question is resolved, append the ratified decision to a running ledger (one line: question, answer, rationale) and derive the closing recap from it. Keep the ledger in-conversation for short sessions; create a scratchpad file only when the branch count or session length makes in-context tracking unreliable.

When every branch is resolved, close with a recap of the ratified decisions (listing any PROVISIONAL ones separately) and the resulting deliverable, confirm it as the final question, then proceed.

If the session resumes after a provisional close, treat each veto as re-opening that ledger line plus every line that depended on it, then resume one-at-a-time questioning from the shallowest re-opened branch; untouched lines stand as ratified.