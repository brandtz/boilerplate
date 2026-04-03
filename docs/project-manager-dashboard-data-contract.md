# Project Manager Dashboard Data Contract

## Purpose

Define the machine-readable structure that prompts, handoffs, epics, and stories must follow so the dashboard can derive state reliably.

## 1. Prompt File Contract

Every prompt markdown file must begin with YAML frontmatter.

```yaml
prompt_id: "16.0.2"
title: "Review account dashboard defect follow-up"
phase: "validation"
status: "ready"
epic_id: "E13"
story_id: "E13-S4"
task_ids:
  - "E13-S4-T1"
owner_role: "QA Automation Engineer"
prerequisites:
  - "16.0.1"
required_reading:
  - "agents/README.md"
  - "agents/epics/epic-13.md"
  - "agents/handoffs/2026-04-03-E13-S4-T1.md"
downstream_prompts:
  - "17.0.1"
inserted_after: "16.0.1"
affects_prompts:
  - "17.0.1"
review_required:
  - "QA Manager"
  - "Product Manager"
session_handoff: ""
supersedes: ""
superseded_by: ""
insert_reason: ""
created_at: "2026-04-03T12:00:00Z"
updated_at: "2026-04-03T12:00:00Z"
completed_at: ""
archived_at: ""
```

### 1.1 Lifecycle Fields

| Field | Type | Description |
|---|---|---|
| `owner_role` | string | Agent role responsible for executing this prompt |
| `session_handoff` | string | Path to the session handoff file (set on completion) |
| `supersedes` | string | Prompt ID this prompt replaces (blank if not a replacement) |
| `superseded_by` | string | Prompt ID that replaces this prompt (blank if still active) |
| `insert_reason` | string | Reason for insertion (blank for original prompts) |
| `completed_at` | ISO 8601 | Timestamp when execution completed |
| `archived_at` | ISO 8601 | Timestamp when moved to `prompts/archive/` |

### 1.2 Prompt File Locations

| Folder | Contains |
|---|---|
| `prompts/active/` | Prompts with status `ready`, `in_progress`, `blocked`, `draft` |
| `prompts/archive/` | Prompts with status `done`, `superseded`, `cancelled` |
| `prompts/templates/` | Reusable prompt authoring templates |
| `prompts/generated/` | Auto-generated prompts before triage |
| `prompts/draft/` | Incomplete or unapproved prompts |

### 1.3 Canonical Inventory

`prompts/index.md` is the source of truth for prompt scope. The parser must read this file first. Folder contents supplement but do not override the inventory.

## 2. Session Handoff Contract

Every completed or partially completed prompt session must create a matching handoff file.

```yaml
session_id: "S-2026-04-03-001"
prompt_id: "16.0.2"
role: "QA Automation Engineer"
status_outcome: "complete"
completion_percent: 100
started_at: "2026-04-03T12:00:00Z"
ended_at: "2026-04-03T12:24:00Z"
changed_files:
  - "apps/dashboard/src/components/PromptTable.tsx"
  - "agents/handoffs/2026-04-03-16.0.2.md"
blockers: []
next_recommended_prompts:
  - "17.0.1"
summary: "Validated prompt insertion rendering and updated dependency recalculation tests."
```

## 3. Epic Contract

```yaml
epic_id: "E3"
title: "Dashboard Progress and Inventory Views"
status: "in_progress"
owner_role: "Product Manager"
```

## 4. Story Contract

```yaml
story_id: "E3-S2"
epic_id: "E3"
title: "Prompt inventory table and detail drawer"
status: "ready"
```

## 5. Task Contract

```yaml
task_id: "E3-S2-T4"
story_id: "E3-S2"
epic_id: "E3"
title: "Render prompt detail drawer with linked handoffs"
status: "draft"
```

## 6. Derived Metrics Rules

### 6.1 Counting Rules
- Total epics = number of active epic definitions
- Total stories = number of active story definitions
- Total tasks = number of active task definitions
- Total prompts = number of prompt entries in `prompts/index.md` with valid frontmatter (includes archived prompts)
- Completed prompts = prompts with status `done` (whether in `active/` or `archive/`)
- Archived prompts count toward totals and completion percentages
- Superseded or cancelled prompts are excluded from completion numerators but included in scope totals

### 6.2 Completion Rollups
- Story completion = done tasks / active tasks
- Epic completion = done stories / active stories
- Project completion can be computed from weighted tasks or prompts
- Prefer prompt completion as operational progress and tasks/stories as scope progress

### 6.3 Recommended Dashboard Dual-Metric Model
The dashboard should display both:
- **Scope completion**: based on tasks/stories/epics
- **Execution completion**: based on prompt sessions

## 7. Next Prompt Selection Rules

Pick the next prompt by:
1. prompt is located in `prompts/active/` (not `archive/`)
2. status is `ready`
3. all prerequisites are done
4. not blocked
5. lowest natural sort sequence among eligible prompts
6. optionally prefer prompts with unblocked downstream chains

## 8. Prompt Dependency Update Rule

When a new inserted prompt is created that changes prerequisite flow:
- update the inserted prompt frontmatter
- update affected downstream prompts frontmatter
- mark impacted prompts as `needs_rebase` in generated state if required
- include rationale in handoff notes

## 9. Recommended Generated State

A parser should emit normalized JSON for the UI to consume. Example schema is included in `schemas/dashboard-state.example.json`.
