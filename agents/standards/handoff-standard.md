# Standard: Handoff

## Purpose
Preserve continuity between agent sessions and phases.

## Every handoff must include
- work packet or phase name
- author role
- date
- objective completed
- artifacts created or changed
- key decisions made
- unresolved issues
- risks introduced or discovered
- validation performed
- recommended next role
- required reading for the next role

## Handoff rules
- keep it concise
- link exact file paths
- separate facts from recommendations
- do not hide blockers
- identify any stop conditions encountered

## Review gate finding propagation
- All review gate findings (low, medium, or info) are pre-approved for implementation
- The review gate agent MUST update the immediate downstream prompt to include findings as actionable tasks, or create an inserted prompt (N.0.2+) if the scope warrants separation
- Findings must never be left as untracked recommendations in a handoff — they must appear as explicit scope items in the next prompt
- The downstream agent should work review findings before or alongside the prompt's original scope

## Handoff quality test
The next agent should be able to start with minimal ambiguity after reading the handoff and required files.
