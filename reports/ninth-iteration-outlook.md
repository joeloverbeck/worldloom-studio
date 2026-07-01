# Ninth-Iteration Outlook — Causal Canon Worldbuilding System

*Written 2026-07-02 by the session that performed the eighth iteration (Claude Code, Fable model, working from HEAD `4b9356e`, leaving the version-0.8 working tree uncommitted). Because the author is also the executor, this outlook is written adversarially against its own pass: the question is not "was effort spent" but "what would a hostile reviewer find, and what is actually left to do."*

## 1. Warnings and weaknesses of the eighth iteration

### 1.1 Every fix in this pass is unvalidated by use — including the big three

Iteration 8 was the first evidence-bounded pass: the field trial's ledgers set the work list, and every substantive change traces to a logged finding. That is a real improvement in epistemic hygiene over iterations 1–7. But it creates a subtler problem: **the trial that motivated these fixes cannot validate them.** The steward who hit F-01 can no longer hit it naively; the routing repairs, the operating card, and the admission ledger have zero field use. The three largest changes are structural bets placed on a single data point:

- **The record-lifecycle doctrine (`03`)** answers F-13/Q-06 exactly as the trial recommended, and its design is simple (cards = present tense, updated in place; reports = unedited audit trail; history notes carry superseded wording). But its central claim — that without it, stale cards compound over a world's lifetime — is an *extrapolation* from one repair in one young world. No world has yet lived long enough under this package to observe the compounding, or to reveal whether the history-note mechanism scales past a handful of supersessions or becomes its own bureaucracy.
- **The operating card** is a derived document, and derived documents drift. It condenses the label-separation table, severity map, path, and minimal-use paths from four parent files; every future edit to those parents can silently de-sync it. The "parents govern on conflict" rule bounds the damage but does not prevent it. A hostile reviewer should treat the operating card as the package's newest maintenance liability, accepted deliberately because the trial's measured onboarding cost (~4,400 lines before a first stable world) justified it.
- **The admission ledger** codifies one steward's improvisation, one trial deep. Its Promotions rule (rows become cards when facts turn load-bearing) is my addition — the trial's structure implied it but never stated or tested it.

### 1.2 The fixes I am least confident in

- **Kernel template additions vs. its trial-validated proportion (V-03).** The trial praised the kernel template because "every section earned its place." This pass added three prompts to it (starting scale, primary pressures, the ordinary-life anchor) to close F-04. Each is individually justified — they reconcile the template with `05` Phase 1 — but collectively they push against the very proportion the trial validated. If the next trial's steward reports kernel bloat, the right move is to thin `05`'s list, not re-thin the template.
- **Keeping the ordinary-life anchor person at all.** Trial rec 4 offered "cut it" as an equally valid disposition. I kept it and wired it to `05` Phase 6 because Phase 6 already asks for an ordinary person's day, making the anchor genuinely load-bearing rather than orphaned. But this was the no-downgrade-safe choice, not the evidence-forced one; a steward who finds the anchor prompt dead weight has a legitimate case the trial log would support.
- **The QA renumbering (P1/P2).** Moving tests 29–30 into a package self-audit subsection answers Q-05 cleanly, but I renumbered them rather than keeping 29/30, so external material that says "30 core tests" (older reports, the user's memory of the package) is now stale. The content is intact and relocated whole; the *frame* changed. This was a judgment call the trial did not ask for in that specific form.
- **The Q-03 disposal is doctrine-by-declaration.** "Aesthetic promises are admitted as kernel commitments and checked at QA; load-bearing aesthetic rules get a card" matches what the trial steward did and validates their deferral retroactively. But the trial's world was material-mode primary. A lyrical- or sacred-primary world, where aesthetic promises *are* the load-bearing facts, might genuinely need a gate station this pass declined to build. The disposal sentence is correct for the evidence we have; it may be under-built for modes the trial did not exercise.
- **The division-of-labor rule (F-07)** likewise canonizes one steward's split (fact card = governance, capability card = causal analysis). It is a sensible split and it worked, but alternative splits were never tried.

### 1.3 Findings deliberately declined, and honored deprioritizations

- **Severity-scale unification: declined,** per trial rec 8 and V-06. Only the field labels were fixed (propagation report per F-11; contradiction report as an argued consistency extension). The package still carries two severity vocabularies with an explicit mapping — permanently, unless a future trial shows the mapping failing in use.
- **Reinforcement-tail weaving: declined,** per rec 8 — no trial evidence of need. The iteration-7 outlook's observation that the package "reads unified more than it is unified" remains true and remains benign on current evidence.
- **S-03 (specialized passes sampled, not run): no package change** — this is trial scope, not a defect, but it defines the biggest coverage gap below.

### 1.4 Coverage gaps: what remains field-untested

- **Protocols `09`–`12` and `14`–`17`** have never been run in anger — the trial sampled one specialized pass (constraint composition, which passed brilliantly). The QA 2-scores in the trial world are precisely the debt these passes would resolve; nobody has yet resolved them using the package.
- **`15` (branching/collaboration) and every multi-steward mechanism** — the governance board, workflow roles, dispute handling, decision records — have zero field exposure. A multi-contributor trial is a different failure surface entirely (contested authority, not solo confusion).
- **The new 0.8 material** — operating card, admission ledger, record lifecycle, records-lifecycle example, all the routing — is exactly as untested as the rest of the package was before the first trial.
- **`16` and `20`** remain the least battle-tested reference documents, unchanged since iteration 7 flagged them.

### 1.5 Agnosticism risks

The hosting repository is a web app, and iteration 8 held the line: no storage/software/API coupling was introduced, no package file cites a repository path, and the records-lifecycle example was adapted into the package fully self-contained. Standing risks going forward: (a) `manifest.json` remains grandfathered software-shaped inventory — resist growing it into a schema; (b) the **operating card** is the file most likely to be "productized" into an app onboarding screen — if that happens, keep the methodology card and the product UI as separate artifacts; (c) **Saltmarrow now exists twice** — as frozen trial evidence in the repository's reports area and as an adapted, self-contained example inside `19`. These will diverge if the package example is ever edited; the package copy is canonical *for the package*, and the trial artifacts are immutable evidence. A future maintainer should not "sync" them.

### 1.6 Tensions the fixes created

- **Card upkeep is now mandatory** (`13` triage step 11) — for stewards working with paragraph-equivalents rather than formal cards, this creates an obligation whose instrument they have declined. The doctrine's own "lightest instrument" escape applies, but nothing says so at the point of obligation.
- **The fact card gained a History section** that most young worlds will leave empty. `21`'s "leave fields empty if they do not apply" covers this, but the card is now longer, and template length was a trial-adjacent complaint (F-03).
- **The README path grew from nine steps to nine steps plus a coda** — the shape survived (V-01), but step 6 now carries four instruments and a conditional; it is the path's densest step and the most likely to be misread by a first-time steward.

## 2. Convergence re-assessment

Re-scoring the four "converged / 1.0-ready" criteria from the eighth-iteration outlook §2:

1. **A full iteration passes with doctrine (`01`–`04`) untouched.** **Not met — by a deliberate margin.** `01`, `02`, and `04` are byte-identical this pass, but `03` was amended twice (record lifecycle; operation composition). Both amendments are additive, use only existing vocabulary, and were demanded by field evidence — which is exactly the healthy direction for a doctrine change — but the criterion as written is unmet. If the next pass leaves `01`–`04` alone, this criterion is satisfied.
2. **At least one end-to-end field trial whose friction log produces only minor edits.** **Met, for the paths exercised.** The trial happened; its verdict ("fixable with sentences, not sections") was borne out — this pass was overwhelmingly sentences, plus two small files. The caveat is scope: the trial ran the core pipeline and one specialized pass. The criterion is *not* met for `09`–`12`, `14`–`17`, or any collaborative path.
3. **The severity question settled by use.** **Met.** V-06 validated the two-scale mapping under field conditions; unification was dropped on the trial's own recommendation; only cosmetic field labels needed fixing. This criterion is closed unless a future trial reopens it.
4. **An on-ramp shaped by observed need.** **Met in design, unvalidated in use.** The operating card exists and is built from the exact tables and paths the trial steward reached for at the exact moments of hesitation — it is evidence-shaped, not armchair-shaped, which is what the criterion demanded. But no steward has yet entered the package through it, so "shaped by observed need" is only half-proven: the need was observed; the shape has not been.

**What blocks 1.0 today:** the repairs themselves. Version 0.8 is the package's first version whose newest content is *entirely* unvalidated by the mechanism (field use) that the versioning now trusts. Criterion 2 is satisfied only for exercised paths; criteria 1 and 4 are near-misses of different kinds. A defensible 1.0 gate: **a second field trial, run cold on 0.8, whose friction log demands no structural change and confirms the 0.8 additions carry their weight.** The 1.0 call remains the user's.

## 3. Verdict: is a ninth iteration warranted?

**As another document-editing pass: no — more firmly than before.** Iteration 7's outlook argued editing had hit diminishing returns; iteration 8 then consumed the entire backlog of evidence-backed edits. A ninth editing pass would have *no evidence to spend* — it would be self-derived diagnosis again, the mode two consecutive outlooks have now retired. Do not run one.

**As a second field trial: yes — and that is the recommendation.** The highest-value ninth iteration is a **cold-start trial on version 0.8** with a deliberately different shape from the first:

1. **Cold entry through the new on-ramp.** A steward with no authorship stake (and ideally no memory of the first trial) builds a new small world following the 0.8 README path literally, operating card in hand. This is the only way to validate the routing repairs, the ledger, the kernel reconciliation, and the card — the exact deliverables of iteration 8. Measure the same things trial 1 measured: frictions, skips, unanswered questions, onboarding cost.
2. **Exercise at least two specialized passes trial 1 skipped** — the strongest candidates are the temporal and institutional/suppression passes, because the first trial's QA profile left named debt exactly there, and resolving *inherited* debt with the package is itself an untested workflow. (Running them on Saltmarrow's frozen artifacts would also work, but a fresh world plus fresh passes tests more surface per unit of effort.)
3. **Force at least one supersession chain two repairs deep**, so the record-lifecycle doctrine faces the accumulation scenario it was written for, not just the single-repair case it was derived from.

Then, as before: make only the changes that log demands. If the second log is near-empty of structural findings — small wording fixes only — the convergence criteria are effectively all satisfied and the 1.0 decision is ripe. If the second log finds new structural gaps, the package was less converged than two same-author outlooks believed, and that would itself be the most valuable possible finding.

**Deferred but real:** a multi-steward/collaboration trial (`15`, the governance roles, dispute handling) is the last major untested tier. It is deferred, not dismissed — it only becomes urgent when the package is actually used by more than one person, and it is a poor use of a solo trial's budget.

**The adversarial bottom line.** This pass implemented its work order faithfully and lost nothing it was bound to protect — but it graded its own homework, its three largest additions rest on one data point each, and the package's newest version is its least field-tested part. The correct response to that is not more writing; it is the second trial.
