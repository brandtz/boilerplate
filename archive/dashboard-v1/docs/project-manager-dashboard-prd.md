# Product Requirements Document: Human Master Dashboard

## 1. Product Name

Project Manager Dashboard

## 2. Product Summary

Build a dashboard that gives the human sponsor a **holistic, self-service, always-current view** of the state of an Agentic AI software project. The dashboard must work consistently across projects created from the boilerplate repository and must read its state from the repository itself.

The dashboard is the operational cockpit for a human managing an AI-driven SDLC. It must remove the need to ask agents what happened, what is next, what is blocked, or how much work remains.

## 3. Problem Statement

In an agentic workflow, work is distributed across many prompt sessions, role identities, reviews, and handoffs. Without a consistent monitoring surface, the human operator loses visibility into:

- total scope
- current completion status
- session-by-session outcomes
- prompt inventory and readiness
- defects, inserted follow-up prompts, and scope changes
- next recommended agent action

This creates overhead, reduces trust, and forces the human to reconstruct project state from scattered markdown files and memory.

## 4. Goals

1. Provide a single dashboard that summarizes project state from repository artifacts.
2. Show progress by epic, story, task, and prompt session.
3. Show what was done in each prompt session without opening many files manually.
4. Surface the exact next prompt to run, with a one-click copy action.
5. Stay dynamic as the project evolves, including inserted prompts and revised prerequisites.
6. Support multiple projects created from the same boilerplate pattern.
7. Require minimal manual upkeep beyond normal agent handoff discipline.

## 5. Non-Goals

1. The dashboard is not a replacement for GitHub Issues, PRs, or CI.
2. The dashboard is not the authoritative editor for epics or prompts in v1.
3. The dashboard does not need direct integration with Copilot usage APIs in v1.
4. The dashboard does not manage billing, staffing, or chat transcripts.

## 6. Primary Users

### 6.1 Human Sponsor / Operator
- Starts projects from the boilerplate
- Runs prompts in Copilot sessions
- Needs rapid visibility and next-action control

### 6.2 Master Agent / Orchestrator
- Updates structured files consumed by the dashboard
- Uses the dashboard state to determine next workflow steps

### 6.3 Specialist Agents
- Produce handoffs and status artifacts that feed dashboard views

## 7. Core User Stories

### 7.1 Project Progress Visibility
As the human sponsor, I want to see total epics, stories, tasks, and prompts so I can understand project scale and remaining work.

### 7.2 Progress by Hierarchy
As the human sponsor, I want completion percentages by epic, story, and task so I can identify where the project is stalled or nearly finished.

### 7.3 Session Inventory
As the human sponsor, I want a list of all prompt sessions and their status so I can see what has run, what is pending, and what was inserted later.

### 7.4 Session History
As the human sponsor, I want to click a prompt and read structured notes describing what changed, what was reviewed, what files were modified, and what blockers remain so I can self-serve project management.

### 7.5 Next Prompt Launcher
As the human sponsor, I want the dashboard to display the exact next prompt text and let me copy it quickly so I can launch the next agent session with minimal friction.

### 7.6 Dynamic Scope Handling
As the human sponsor, I want inserted prompts like `16.0.2` to fit naturally into sequencing so I can handle defects, review loops, or scope additions without renumbering the universe.

### 7.7 Multi-Project Support
As the human sponsor, I want to switch between compatible repos and see each dashboard state so the same cockpit works across all boilerplate-derived projects.

## 8. Functional Requirements

### FR-1: Repository Discovery
The dashboard must detect whether a repository is "dashboard-capable" by checking for required files and folders.

Required minimum structure:
- `agents/epics/`
- `prompts/active/` (active prompt files) and optionally `prompts/archive/` (completed/superseded prompts)
- `prompts/index.md` (canonical prompt inventory — source of truth for prompt scope and status)
- `agents/handoffs/` or equivalent handoff folder
- `agents/context/status-dashboard.md` or machine-readable dashboard state files

The parser must read `prompts/index.md` first to build the prompt registry, then scan `prompts/active/` and `prompts/archive/` for frontmatter details.

### FR-2: Project Summary Metrics
The dashboard must display:
- total epics
- total stories
- total technical tasks
- total prompts
- total completed prompts
- percent complete at project level
- blocked count
- in-review count
- ready count

### FR-3: Epic Breakdown
For each epic, the dashboard must show:
- epic ID and title
- total stories
- total tasks
- total prompts mapped to the epic
- completed vs remaining work
- percent complete
- status summary
- blockers if present

### FR-4: Story Breakdown
For each story, the dashboard must show:
- story ID and title
- parent epic
- total tasks
- total prompts mapped to the story
- completion percentage
- current status
- latest session update

### FR-5: Task Breakdown
For each task, the dashboard must show:
- task ID and title
- parent story and epic
- status
- completion percentage
- last changed date
- latest related prompt/session

### FR-6: Prompt Inventory
The dashboard must show a full prompt inventory with:
- prompt number
- title
- epic/story/task mapping
- current status (`draft`, `ready`, `in_progress`, `done`, `blocked`, `superseded`, `cancelled`)
- location (`active` or `archive`)
- inserted/derived status
- prerequisites
- downstream prompts affected
- last updated timestamp
- archived date (if applicable)

The inventory must be derived from `prompts/index.md` as the canonical source. Archived prompts must appear in totals and completion metrics but are visually distinguished from active prompts.

### FR-7: Prompt Detail Drawer / Page
When the human clicks a prompt, the dashboard must display:
- prompt metadata
- raw prompt body
- current prerequisites and required reading
- session notes / summary
- changed files
- tests run
- blockers
- next recommended prompts
- linked handoff files
- linked session handoff (if completed)
- archived date and archive reason (if archived)
- supersedes / superseded-by links (if applicable)

### FR-8: Next Prompt Widget
The dashboard must show the current best next prompt with:
- prompt number and title
- rationale for why it is next
- prerequisite check result
- scrollable text box containing the full prompt content
- copy-to-clipboard action
- link to source file

The widget must only surface prompts located in `prompts/active/` with `status: ready`. Archived, superseded, and cancelled prompts must never appear as next candidates.

### FR-9: Session Handoff Timeline
The dashboard must show a timeline of sessions with:
- session identifier
- prompt number
- role/agent identity
- date/time
- short summary
- changed files count
- status outcome (`complete`, `partial`, `blocked`, `review_requested`)

### FR-10: Dynamic Recalculation
When new prompts, stories, or tasks are added, the dashboard must recalculate metrics without manual code changes.

### FR-11: Inserted Prompt Support
The system must support fractional/insertion numbering such as:
- `16.0.1`
- `16.0.2`
- `16.1.1`
- `17.0.1`

Inserted prompts must be sortable, displayed in natural sequence, and allowed to supersede or prepend later prompts.

### FR-12: Dependency Awareness
If an inserted prompt changes prerequisites or required reading for downstream prompts, the system must reflect that in dashboard data and mark impacted prompts as needing review or regeneration.

### FR-13: Charting
The dashboard must render charts for:
- project completion by epic
- project completion by prompt status
- remaining prompts over time
- completed sessions over time

### FR-14: Filtering and Search
The dashboard must support filtering by:
- epic
- story
- prompt status
- blocked items
- changed recently
- role/agent

### FR-15: Multi-Repo Selector
The dashboard should support a repository selector for compatible projects, with each project maintaining its own state.

### FR-16: Refresh Model
The dashboard must support a refresh action and ideally auto-refresh on file changes when run locally.

## 9. Data Source Requirements

The dashboard must be powered primarily by repository artifacts, not freeform chat memory.

Required source types:
- epics markdown
- stories/tasks markdown
- prompt markdown files with structured frontmatter
- handoff markdown files with structured frontmatter
- optional generated JSON state files for speed

## 10. Machine-Readable Contract Requirement

Every prompt and every handoff must contain required frontmatter fields so the dashboard can parse them deterministically.

Freeform markdown alone is not enough.

## 11. Dashboard Views

### 11.1 Overview
- project title
- summary counters
- overall percent complete
- chart panels
- blockers panel
- next prompt widget
- recent session timeline

### 11.2 Epics View
- epic cards or table
- progress bars
- expandable story breakdown

### 11.3 Prompt Inventory View
- prompt table
- sorting by sequence, status, epic, updated date
- prompt detail panel

### 11.4 Session History View
- timeline or table of session handoffs
- click into session notes

### 11.5 Task Graph View
- epic > story > task tree
- status badges
- completion rollups

## 12. Status Model

Canonical statuses for prompts, stories, tasks, and reviews:
- `draft`
- `ready`
- `in_progress`
- `in_review`
- `blocked`
- `done`
- `superseded`
- `cancelled`

## 13. Completion Rules

### 13.1 Task Completion
A task is done when:
- implementation notes indicate complete
- validation results are present if required
- no unresolved blockers remain

### 13.2 Story Completion
A story is done when all non-cancelled tasks are done and all mandatory reviews have passed.

### 13.3 Epic Completion
An epic is done when all active stories are done.

### 13.4 Prompt Completion
A prompt is done when:
- a matching handoff exists
- status is marked `done` or `complete`
- downstream required updates were applied

## 14. Review and Sign-Off Requirements

The dashboard project itself must be built using the swarm workflow with explicit review from:
- Product Manager
- BSA
- Architect
- DevOps / Platform
- DevSecOps / Security
- QA / SDET
- UX / Product Design

## 15. Suggested v1 Architecture

### Frontend
- React or Vue single-page app
- local filesystem-backed or repo-root-backed data loading
- chart library
- markdown rendering for prompt and handoff details

### Backend / Parsing Layer
- local service or static generation step that parses markdown frontmatter and emits normalized JSON
- file watcher for local development
- deterministic sorting and dependency graph resolution

### Optional Persistence
- lightweight local cache for normalized state

## 16. Risks

- weak markdown discipline will produce bad dashboard state
- inconsistent prompt file shapes will reduce trust
- inserted prompt ordering can become chaotic without a numbering standard
- manual edits to prerequisites may drift from actual repo state

## 17. Required Companion Standards

This project depends on:
- prompt numbering standard
- prompt session template
- session handoff template
- review sign-off contract
- repo capability detection standard

## 18. Acceptance Criteria

1. The dashboard can parse a project with at least 10 epics, 100 stories, 300 tasks, and 250 prompts without code changes.
2. The dashboard can display hierarchical completion metrics derived from repo files.
3. The dashboard can show a next prompt with copy-to-clipboard.
4. The dashboard can show session notes for any completed prompt.
5. Inserting a new prompt like `16.0.2` updates sequencing and affected prerequisite views.
6. Adding new prompts or tasks causes the dashboard to reflect updated totals after refresh.
7. The dashboard can switch between at least two compatible repos.
