# Business Rules — Project Manager Dashboard

**Author:** Business Systems Analyst
**Prompt:** 2.0.1
**Date:** 2026-04-03
**Authority:** This document is the canonical reference for status transitions, completion rollups, counting rules, next-prompt selection, and error taxonomy. The data contract and epics file defer to these rules where conflicts arise.

---

## 1. Status Model

### 1.1 Canonical Statuses

All entities (prompts, stories, tasks) use the same status vocabulary:

| Status | Terminal? | Description |
|---|---|---|
| `draft` | No | Created but not approved for work |
| `ready` | No | Approved and eligible for execution once prerequisites are met |
| `in_progress` | No | Work has begun |
| `in_review` | No | Work complete, awaiting review/sign-off |
| `blocked` | No | Cannot proceed due to an identified dependency or issue |
| `done` | Yes | Work completed and verified |
| `superseded` | Yes | Replaced by a newer entity; original is no longer active |
| `cancelled` | Yes | Abandoned; will not be executed |

### 1.2 Status Transition Rules

#### Prompts

| From | To | Conditions |
|---|---|---|
| `draft` | `ready` | All frontmatter fields populated; added to `prompts/index.md` |
| `ready` | `in_progress` | Agent has begun execution |
| `ready` | `blocked` | An upstream dependency or decision is unresolved |
| `in_progress` | `done` | Session handoff written; `completed_at` set; changes committed and pushed |
| `in_progress` | `blocked` | A blocking issue emerged during execution |
| `in_progress` | `in_review` | Work complete, awaiting human or cross-role review |
| `in_review` | `done` | Review passed; handoff written |
| `in_review` | `blocked` | Review identified blocking issues |
| `blocked` | `ready` | Blocking issue resolved |
| `done` | `superseded` | A replacement prompt is created; `superseded_by` set on original |
| Any non-terminal | `cancelled` | Human sponsor decides work is no longer needed |

**Illegal transitions:** No entity may transition from a terminal status (`done`, `superseded`, `cancelled`) to a non-terminal status. A superseded or cancelled prompt cannot be re-activated — create a new prompt instead.

#### Stories

| From | To | Conditions |
|---|---|---|
| `draft` | `ready` | Acceptance criteria defined; assigned to an epic |
| `ready` | `in_progress` | At least one child task has moved to `in_progress` |
| `in_progress` | `done` | All non-cancelled tasks are `done` and all mandatory reviews passed |
| `in_progress` | `blocked` | All remaining tasks are `blocked` |
| `blocked` | `in_progress` | At least one task is unblocked |

#### Tasks

| From | To | Conditions |
|---|---|---|
| `draft` | `ready` | Task description is sufficient for implementation |
| `ready` | `in_progress` | Work has started in a prompt session |
| `in_progress` | `done` | Implementation complete; validation results present (if required) |
| `in_progress` | `blocked` | External dependency prevents completion |
| `blocked` | `ready` | Blocking issue resolved |

---

## 2. Completion Rollup Rules

### 2.1 Task Completion

A task is `done` when:
1. Implementation is complete (evidenced by handoff artifacts)
2. Validation results exist if the task requires testing
3. No unresolved blockers remain
4. The task has not been cancelled

### 2.2 Story Completion

A story is `done` when:
1. All child tasks with non-terminal status (`draft`, `ready`, `in_progress`, `in_review`, `blocked`) have reached `done`
2. All mandatory reviews listed in `review_required` have passed
3. Cancelled tasks do not block completion (they are excluded from the denominator)

**Formula:** `story_completion_percent = (done_tasks / (total_tasks - cancelled_tasks)) × 100`

### 2.3 Epic Completion

An epic is `done` when:
1. All child stories with non-terminal status have reached `done`
2. Cancelled stories do not block completion

**Formula:** `epic_completion_percent = (done_stories / (total_stories - cancelled_stories)) × 100`

### 2.4 Project Completion (Dual-Metric)

The dashboard displays two completion metrics:

1. **Scope completion** = `(done_tasks / (total_tasks - cancelled_tasks)) × 100`
2. **Execution completion** = `(done_prompts / (total_prompts - superseded_prompts - cancelled_prompts)) × 100`

Both metrics exclude terminal-excluded entities (superseded, cancelled) from the denominator.

### 2.5 Superseded and Cancelled Counting

| Metric | Superseded | Cancelled |
|---|---|---|
| Scope total | Included | Included |
| Completion denominator | Excluded | Excluded |
| Completion numerator | Excluded | Excluded |
| Dashboard display | Shown with distinct styling | Shown with distinct styling |

**Clarification (resolves GAP-DC-04):** A project with 30 prompts, 2 superseded, and 1 cancelled has an effective denominator of 27. The project is 100% complete when all 27 non-excluded prompts are `done`.

---

## 3. Next-Prompt Selection Algorithm

The eligibility engine selects the next prompt to execute using the following deterministic algorithm:

### 3.1 Eligibility Filter

A prompt is **eligible** if all of the following are true:
1. Located in `prompts/active/` (not `archive/`)
2. `status` is `ready`
3. Every prompt listed in `prerequisites` has `status: done`
4. The prompt is not `blocked`

### 3.2 Selection Priority

Among eligible prompts, select the one with:
1. **Lowest natural sort order** using numeric tuple comparison on `prompt_id` (e.g., `[2,0,1]` < `[3,0,1]` < `[16,0,2]`)
2. **Tiebreaker:** If two prompts share the same tuple prefix, prefer the one with fewer unresolved downstream dependencies (i.e., the one that unblocks the most work)

### 3.3 Rationale Text Generation (resolves GAP-FR-06)

The next-prompt widget must display a human-readable rationale string. The format is:

```
"Prompt {prompt_id} is next because: all {n} prerequisites are met, 
it has the lowest sequence number among {m} eligible prompts, 
and it unblocks {k} downstream prompt(s)."
```

If no prompts are eligible, display:
```
"No prompts are currently eligible. {n} prompt(s) are blocked, 
{m} are awaiting prerequisite completion."
```

---

## 4. Parser Behavior Rules

### 4.1 File Discovery Order

1. Read `prompts/index.md` to build the canonical prompt registry
2. Scan `prompts/active/` for prompt file frontmatter
3. Scan `prompts/archive/` for archived prompt file frontmatter
4. Scan `agents/epics/` for epic/story/task definitions
5. Scan `agents/handoffs/` for session handoff files
6. Validate all entities and emit warnings for non-conformant files

### 4.2 Epics File Format (resolves GAP-DC-01, OQ-06)

The parser must support the **combined markdown format** as the primary format for v1:
- A single file (`agents/epics/<project-name>-epics.md`) contains all epics, stories, and tasks
- Epics are identified by `## Epic E{n}: {title}` headings
- Stories are identified by `### E{n}-S{n} {title}` headings
- Tasks are identified by `- E{n}-S{n}-T{n}: {description}` list items under a `#### Tasks` heading
- Status is extracted from `**Status:** {status}` lines
- Acceptance criteria are extracted from content under `**Acceptance Criteria:**` lines

The parser may also support individual YAML-headed files in a future version, but the combined format is authoritative for v1.

### 4.3 Reverse Index Construction

The parser must build a reverse index from tasks to prompts:
- For each prompt, read `task_ids` from frontmatter
- Build a `Map<task_id, prompt_id[]>` mapping
- When displaying a task, show all associated prompts (not just the latest)
- Sort associated prompts by natural sequence order

### 4.4 Handoff-to-Prompt Linking (resolves UA-02)

Handoffs are linked to prompts via the `prompt_id` field in the handoff frontmatter:
- The parser matches `handoff.prompt_id` to `prompt.prompt_id`
- Filename convention is not required for linking (frontmatter is authoritative)
- If multiple handoffs reference the same prompt_id, they are treated as multiple sessions (e.g., partial then complete)

### 4.5 Error and Warning Taxonomy (resolves NFR-03, OQ-01)

| Severity | Condition | Parser Behavior | Dashboard Display |
|---|---|---|---|
| **Error** | File has no YAML frontmatter at all | Skip file; emit error | Show in blockers panel |
| **Error** | Required field missing (`prompt_id`, `status`) | Skip file; emit error | Show in blockers panel |
| **Warning** | Optional field missing | Parse available fields; emit warning | Show in warnings panel |
| **Warning** | Unrecognized status value | Parse as-is; emit warning | Show in warnings panel |
| **Warning** | Prerequisite references non-existent prompt | Parse; emit warning | Show in blockers panel |
| **Warning** | `done` prompt has no matching handoff | Parse; emit warning | Show in warnings panel and prompt detail |
| **Info** | File parsed successfully | Normal operation | No display |

- Warnings are never silently swallowed — all are surfaced in the dashboard
- Errors and warnings are collected in a `validationResults[]` array in the JSON state
- The user can view and filter validation results in the warnings panel

---

## 5. Repository Capability Detection (resolves GAP-FR-01)

### 5.1 Required Structure for "Dashboard-Capable" Repo

| Path | Required? | Purpose |
|---|---|---|
| `prompts/index.md` | Required | Canonical prompt inventory |
| `prompts/active/` | Required | Active prompt files |
| `agents/epics/` | Required | Epic/story/task definitions |
| `agents/handoffs/` | Required | Session handoff files |
| `prompts/archive/` | Optional | Archived prompts |
| `agents/context/status-dashboard.md` | Optional | Human-readable status summary |
| `schemas/` | Optional | JSON schema examples |

### 5.2 Capability Detection Result

The detection function returns a structured result:

```
{
  "capable": true | false,
  "missingRequired": ["prompts/index.md", ...],
  "missingOptional": ["prompts/archive/", ...],
  "promptCount": 30,
  "epicCount": 6,
  "warnings": ["..."]
}
```

### 5.3 Dashboard Behavior on Detection Failure

| Scenario | Dashboard Behavior |
|---|---|
| Repo has all required paths | Load normally |
| Repo missing 1+ required paths | Show error screen listing missing paths; offer link to documentation |
| Repo has required paths but 0 parseable prompts | Show empty state: "This repo contains no prompts with valid frontmatter. See [prompts/README.md] for authoring instructions." |
| Repo has prompts but all are malformed | Show partial state with warnings panel prominently displayed |

---

## 6. Chart Data Source Rules (resolves GAP-FR-08, CONFLICT-01)

### 6.1 Time-Series Data Derivation

Since C1 prohibits external databases and C8 prohibits writing to the repo, time-series charts derive historical data from handoff timestamps:

- **Completed sessions over time:** Group handoff files by `ended_at` date → plot cumulative count
- **Remaining prompts over time:** Total prompts minus cumulative done prompts at each handoff date → plot declining count
- **Data limitation:** Only dates with handoffs appear as data points; gaps between sessions produce flat lines, not interpolation

### 6.2 Current-Snapshot Charts

These charts use only the current parsed state (no history needed):
- **Epic completion bar/donut:** Each epic's `completion_percent`
- **Prompt status distribution:** Count of prompts per status

---

## 7. Search and Filter Rules (resolves GAP-FR-09)

### 7.1 Search Scope

Search in the prompt inventory applies **keyword matching against metadata fields only** for v1:
- `prompt_id`, `title`, `epic_id`, `story_id`, `owner_role`
- Case-insensitive substring match
- No full-text search of prompt body (deferred to v2)

### 7.2 Filter Dimensions

| Filter | Values | Default |
|---|---|---|
| Status | `draft`, `ready`, `in_progress`, `in_review`, `blocked`, `done`, `superseded`, `cancelled` | All |
| Epic | Dynamic list from parsed epics | All |
| Story | Dynamic list from parsed stories (nested under epic filter) | All |
| Location | `active`, `archive` | `active` |
| Role | Dynamic list from `owner_role` values | All |
| Changed recently | Last 24h, 7d, 30d | Off |

---

## 8. Multi-Repo Selector Rules (resolves GAP-FR-10, OQ-03, CONFLICT-03)

### 8.1 v1 Scope

- **Local filesystem paths only** — no git remote URL support in v1
- Repo path provided via **text input with folder-browse button** (if OS dialog available) or plain text input
- Selector accessible from header/toolbar area, always visible

### 8.2 Validation on Selection

When a user selects a repo path:
1. Run capability detection (Section 5)
2. If capable → load and parse
3. If not capable → show error with missing paths listed
4. Save path to recent-projects list (local storage)

---

## 9. Project Health Signal (resolves GAP-US-03)

### 9.1 Health Indicator

The overview dashboard displays a project health badge:

| Health | Condition |
|---|---|
| **On Track** | No blockers; at least 1 prompt completed in the last 7 days |
| **At Risk** | 1-2 blocked prompts OR no prompt completed in 7-14 days |
| **Blocked** | 3+ blocked prompts OR no prompt completed in 14+ days |
| **Not Started** | No prompts have been completed |

### 9.2 Data Source

Health is computed from:
- Count of currently blocked prompts
- Most recent handoff `ended_at` timestamp vs current date

---

## 10. Auto-Refresh Scope (resolves GAP-FR-11)

- Auto-refresh via file watcher is a **dev-server feature only**
- When dashboard is deployed as a static export, manual refresh (button click) is the only option
- File watcher debounce: 500ms minimum between re-parse triggers
- This must be documented in the dashboard README
