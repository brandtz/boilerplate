# Prompt: Implement Prompt Lifecycle, Archival, and Dashboard-Aware Prompt Governance

We need to upgrade the boilerplate repository so that prompt management is durable, dashboard-friendly, and scalable across future projects.

This is not a feature build for the dashboard UI yet. This is a repository governance and structure update so that all prompts going forward are managed consistently.

## Objective

Modify the repository structure, standards, templates, and dashboard-related project documents so that:
- completed prompts are moved to an archive location
- active prompts remain separate from completed prompts
- the dashboard knows that archived prompts still count toward project scope and completion metrics
- prompt numbering supports insertions such as `16.0.2`
- downstream prompts are updated when inserted or superseding prompts change prerequisites or required reading
- session handoffs remain the durable record of what happened in each agent session

## First Step

Before making changes:
1. inspect the current repo structure
2. identify all existing prompt-related standards, prompt files, templates, and dashboard docs
3. summarize the proposed change plan
4. then implement the changes

## Required Reading

Read all existing relevant materials before changing anything, including at minimum:

```text
README.md
prompts/
agents/standards/
agents/templates/
docs/project-manager-dashboard-prd.md
docs/project-manager-dashboard-data-contract.md
docs/agentic-ai-team-factory-blueprint.md
```

Also read any existing files that define:
- prompt authoring
- handoffs
- project state tracking
- dashboard data structures
- workflow phases

## Changes to Implement

### 1. Prompt Folder Structure

Ensure the repo uses this structure:

```text
prompts/
  README.md
  index.md
  active/
  archive/
  templates/
  generated/
  draft/
```

If prompt files currently exist directly under `prompts/`, reconcile them into the correct lifecycle folders.

### 2. Prompt Lifecycle Standard

Create or update a standard file under:

```text
agents/standards/prompt-lifecycle-standard.md
```

It must define:
- allowed prompt statuses
- when prompts belong in active versus archive
- archival prerequisites
- relationship between prompt files and session handoffs
- prompt inventory as canonical source of truth
- dashboard handling for archived prompts
- insertion and superseding rules
- downstream synchronization requirements

### 3. Prompt Inventory

Create or update:

```text
prompts/index.md
```

This file must become the canonical inventory for all prompts in the project.

It must include, for each prompt:
- prompt_id
- title
- status
- phase
- epic_id
- story_id
- task_ids
- file location
- prerequisites
- downstream prompts
- session handoff path
- created date
- completed date
- archived date
- notes

### 4. Prompt Metadata Standardization

Update prompt templates and standards so every prompt file contains structured frontmatter metadata for dashboard parsing.

Required metadata should include at minimum:
- prompt_id
- title
- status
- phase
- epic_id
- story_id
- task_ids
- prerequisites
- required_reading
- downstream_prompts
- session_handoff
- created_at
- completed_at
- archived_at
- inserted_after
- insert_reason
- supersedes
- superseded_by
- owner_role

### 5. Prompt Numbering and Insertion Rules

Create or update the prompt numbering standard so that:
- numbering supports insertion without global renumbering
- examples such as `16.0.2` are explicitly documented
- superseded prompts are handled cleanly
- downstream prompts must be reviewed when inserted prompts change dependencies

Update any existing numbering standard rather than creating conflicting guidance.

### 6. Session Handoff Template

Create or update a template under:

```text
agents/templates/session-handoff-template.md
```

The template must support dashboard self-service by including:
- prompt_id
- role used
- summary of work completed
- files created/modified/removed
- tests run
- validation results
- decisions made
- blockers
- open risks
- downstream impacts
- recommended next prompt

### 7. Prompt Session Template

Create or update a template under:

```text
agents/templates/prompt-session-template.md
```

The template must include the new frontmatter metadata and standardized sections for:
- sequence position
- prerequisites
- required reading
- implementation scope
- constraints
- validation commands
- handoff instructions
- downstream consumers
- stop conditions

### 8. Dashboard Spec Alignment

Update the dashboard PRD and data contract so the dashboard explicitly knows:
- prompts may live in active or archive folders
- archived prompts still count toward totals and completion percentages
- the prompt inventory is the primary source of truth
- prompt detail pages should link to handoffs
- the next-prompt widget should only surface active ready prompts
- superseded prompts and stale downstream dependencies should be representable in UI and data

### 9. README / Usage Guidance

Update the relevant README or prompt README to explain the new lifecycle and archival process in plain operational terms.

## Constraints

- Do not build the dashboard UI in this prompt.
- Do not remove historical information.
- Do not create duplicate standards when an existing one should be updated.
- Preserve backward compatibility where reasonable, but prefer one canonical standard.
- Keep everything markdown-first and agent-readable.
- Assume the dashboard will parse repo artifacts and not rely on memory.

## Acceptance Criteria

Success means:
1. prompt lifecycle folders exist
2. a prompt lifecycle standard exists
3. prompt numbering rules explicitly support insertion and superseding
4. prompt inventory exists and is treated as canonical
5. templates support frontmatter metadata and handoff traceability
6. dashboard specs acknowledge archived prompts and inventory-driven state
7. usage guidance explains the lifecycle clearly

## Final Output Required

At the end, provide:
1. the files created or modified
2. the final prompt lifecycle structure
3. any migrated prompt files and where they were moved
4. any unresolved ambiguities
5. the recommended next prompt after this governance update
