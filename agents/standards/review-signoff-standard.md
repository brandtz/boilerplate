# Standard: Review and Sign-Off

## Purpose
Create disciplined, role-specific reviews instead of vague approval language.

## Anti-Sycophancy Principles

Review gates exist to find problems, not to confirm success. The following rules counteract the natural tendency of AI agents to agree, approve, and wrap up cleanly:

1. **"Find three things wrong" rule** — Every reviewer MUST identify at least three items that could be improved, questioned, or challenged before issuing any approval. If the reviewer genuinely cannot find three, they must document their search process and what they looked for. "I found nothing wrong" is not an acceptable review output without evidence of rigorous examination.
2. **Challenge-first posture** — Reviewers must begin by looking for what is missing, broken, inconsistent, or deferred — not by confirming what is present and working. The default assumption is that issues exist until proven otherwise.
3. **No confirmatory language without evidence** — Reviews must not contain phrases like "faithfully implemented", "correctly follows", or "consistent with specification" without citing specific file paths, line numbers, or test output that proves the claim. Vague approval language is a review defect.
4. **Deferral skepticism** — When a prior gate accepted a deferral, the current reviewer must treat it as an open question, not a settled decision. Ask: "Is this still acceptable? Has the context changed? Would the sponsor approve this if asked directly?"
5. **Red team mindset for scope completeness** — The reviewer must independently verify task-to-prompt coverage by cross-referencing the epics file against the prompt index. Do not rely on the Orchestrator's claim that "all tasks are mapped."

## Session Isolation Requirement

Review gate prompts MUST be executed in a **separate conversation session** from the work they are reviewing. This prevents:
- Context-window bias (the agent has "seen" the work being built and is predisposed to approve it)
- Session-completion pressure (the agent wants to wrap up the session cleanly, creating incentive to approve rather than request rework)
- Anchoring on the author's framing (the reviewer inherits the author's mental model instead of forming their own)

A review gate handoff that was produced in the same session as the implementation work it reviews is a **process violation** and must be re-executed in an isolated session.

## Conflict of Interest Rules

1. **No self-review** — A role that produced work cannot review that same work at a review gate. The Orchestrator cannot review scope decisions it made. The Architect cannot approve ADR conditions it defined.
2. **No self-resolution** — A role that sets conditions, open risks, or action items cannot be the role that resolves and closes them. A different role must verify resolution.
3. **Reviewer independence verification** — Every review gate handoff must include a `## Reviewer Independence Declaration` section stating: (a) which role executed the review, (b) which roles produced the work under review, (c) confirmation that reviewer and author roles are different for each finding area.

## Review output structure
- scope reviewed
- files reviewed
- findings by severity
- missing information
- required changes
- advisory improvements
- **items challenged (minimum 3)** — what the reviewer questioned, investigated, or pushed back on
- **deferral re-evaluation** — for each previously deferred item: current assessment and recommendation
- **reviewer independence declaration**
- sign-off status

## Sign-off statuses
- Approved
- Approved with Notes
- Rework Required
- Blocked

## Severity levels
- Blocker
- High
- Medium
- Low

## Reviewer rules
- review from your own discipline
- avoid scope creep unless risk is material
- be explicit when information is missing
- state what would be needed for approval
- **actively look for reasons to NOT approve** before evaluating reasons to approve
- **verify claims independently** — do not accept the author's summary; read the actual files, run the actual commands
- **escalate uncomfortable truths** — if the honest assessment is "this isn't ready," say so even if it delays the project
- **never approve scope deferrals you haven't independently verified** against the original requirements

## Default blocker examples
- missing auth rules on protected flows
- untestable acceptance criteria
- no rollback for risky deployment
- known critical defect unresolved
- sensitive data flows unreviewed
