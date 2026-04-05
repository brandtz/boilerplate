# Session Handoff Template

```yaml
session_id: ""
prompt_id: ""
role: ""
status_outcome: "complete"
completion_percent: 0
started_at: ""
ended_at: ""
changed_files: []
files_removed: []
tests_run: []
validation_results: []
decisions_made: []
blockers: []
open_risks: []
downstream_impacts: []
next_recommended_prompts: []
summary: ""
```

# Session Handoff: <prompt_id>

## Objective

## Summary of Work Completed

## Files Created or Modified

## Files Removed

## Tests Run

## Validation Results

## Decisions Made

## Open Issues / Blockers

## Open Risks

## Downstream Impacts

## Required Follow-Up

<!-- For EACH item below, state the action: "created prompt N.0.2" or "added to prompt X.0.1 scope" or "N/A" -->

## Close-Out Checklist
<!-- Complete ALL items before committing. Any 'NO' or gap must produce a follow-up prompt or scope edit. -->
- [ ] Scope audit: all prompt scope items and ACs addressed
- [ ] Warning/error audit: `npm run prebuild` shows 0 errors, 0 actionable warnings
- [ ] Cross-layer data flow verified (if applicable)
- [ ] Production smoke test passed (build + serve)
- [ ] Downstream impact scan: affected prompts/components listed and updated
- [ ] Findings propagation: all recommendations/risks converted to prompt scope
- [ ] Handoff frontmatter uses `---` delimiters and correct field names

## Recommended Next Prompt(s)

## Notes for Human Sponsor
