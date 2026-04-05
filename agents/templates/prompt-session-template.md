# Prompt Session Template

```yaml
prompt_id: ""
title: ""
phase: ""
status: "draft"
epic_id: ""
story_id: ""
task_ids: []
owner_role: ""
prerequisites: []
required_reading: []
downstream_prompts: []
inserted_after: null
insert_reason: null
affects_prompts: []
supersedes: []
superseded_by: []
review_required: []
session_handoff: null
created_at: ""
updated_at: ""
completed_at: null
archived_at: null
```

# Prompt <prompt_id>: <title>

## Sequence Position

- Prompt: 
- Epic: 
- Story: 
- Tasks: 
- Phase: 

## Prerequisites

- 

## Context for the Agent

Describe the exact objective and why this session exists.

## Required Reading

```text
agents/README.md
```

## Scope

- 

## Constraints

- 

## Validation Commands

```bash
```

## Handoff Instructions

Create handoff notes using `agents/templates/session-handoff-template.md`.

**Close-out requirements (mandatory):**
1. Complete every item in the Close-Out Checklist in the handoff template.
2. Any findings, gaps, or rework identified during close-out MUST either:
   - Create a new prompt (N.0.2+) with the finding as explicit scope, OR
   - Edit the next downstream prompt to include the finding as a scope item.
3. Untracked findings left only as prose in the handoff are a close-out defect.

## Commit and Push

After completing all work and creating the session handoff, stage, commit, and push all changes:

```bash
git add -A
git commit -m "Complete prompt <prompt_id>: <title> — <one-line summary of work>"
git push
```

## Downstream Consumers

- 

## Stop Conditions

- STOP if 
