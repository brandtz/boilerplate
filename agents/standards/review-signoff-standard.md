# Standard: Review and Sign-Off

## Purpose
Create disciplined, role-specific reviews instead of vague approval language.

## Review output structure
- scope reviewed
- files reviewed
- findings by severity
- missing information
- required changes
- advisory improvements
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

## Default blocker examples
- missing auth rules on protected flows
- untestable acceptance criteria
- no rollback for risky deployment
- known critical defect unresolved
- sensitive data flows unreviewed
