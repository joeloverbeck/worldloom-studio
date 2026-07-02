---
name: grilling
description: Interview the user relentlessly about a plan or design. Use when the user wants to stress-test a plan before building, or uses any 'grill' trigger phrases.
---

Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time, waiting for feedback on each question before continuing. Asking multiple questions at once is bewildering. A question may carry one tightly-coupled sub-decision when both share a single decision surface; never bundle independent branches.

If a question can be answered by exploring the codebase, explore the codebase instead.

As each question is resolved, append the ratified decision to a running ledger (one line: question, answer, rationale) — in the scratchpad for long sessions — and derive the closing recap from it.

When every branch is resolved, close with a recap of the ratified decisions and the resulting deliverable, confirm it as the final question, then proceed.