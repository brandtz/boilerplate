# Prompt: <TITLE>

## Sequence Position

## Phase

## Objective

## Dependencies

## Prerequisites

## Context for the Agent

## Required Reading

<!-- Always include governance references so any agent (local or cloud) knows the close-out rules -->
- `agents/standards/prompt-lifecycle-standard.md`
- `agents/standards/handoff-standard.md`

## Scope

## Constraints

## Validation Expectations

## Handoff Instructions

## Session Close-Out Checklist

Before committing, the executing agent MUST complete ALL of the following steps.
This checklist is mandatory for both local and cloud agents.

1. **Create session handoff** using `agents/templates/session-handoff-template.md`
   - Save to `agents/handoffs/S-<date>-<seq>-<slug>.md`

2. **Update this prompt's frontmatter:**
   - Set `status: "done"`
   - Set `session_handoff` to the handoff file path created in step 1
   - Set `completed_at` to the current ISO-8601 timestamp
   - Set `updated_at` to the current ISO-8601 timestamp

3. **Update `prompts/index.md`:**
   - Change this prompt's row: status → `done`, add handoff path, set completed date, add summary note
   - Update the summary counts (decrement ready, increment done)

4. **Update `agents/context/status-dashboard.md`:**
   - Add this prompt to Active Work Packets as **DONE** with a brief note
   - Update Metrics counts (Prompts Completed, ready/done tallies)
   - Update Next Suggested Action to the next prompt in sequence
   - Update Awaiting Review if any items were resolved or added

5. **Update `agents/context/decision-log.md`:**
   - Add a row for each decision made during this session

6. **Commit and push:**
   ```bash
   git add -A
   git commit -m "Complete prompt <prompt_id>: <title>"
   git push
   ```

## Downstream Consumers

## Stop Conditions
