# Architecture Overview

> **Last updated:** 2026-04-03 — Architect Review (Prompt 4.0.1)
> **Status:** ADRs approved; architecture baselined for implementation.

## System Purpose

A local-first single-page dashboard application that parses boilerplate repo artifacts (markdown files with YAML frontmatter) and renders a project management cockpit. The dashboard gives the human sponsor real-time visibility into agentic AI software projects without requiring agents to report status manually.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Browser (SPA)                                │
│                                                                 │
│  ┌──────────┐  ┌──────────────────────────────────────────────┐│
│  │ Sidebar   │  │  Main Content Area                          ││
│  │ Nav       │  │                                             ││
│  │           │  │  ┌─────────┐ ┌──────────┐ ┌─────────────┐  ││
│  │ Overview  │  │  │Overview │ │Epics     │ │Prompts      │  ││
│  │ Epics     │  │  │View    │ │View      │ │View         │  ││
│  │ Prompts   │  │  └────┬────┘ └────┬─────┘ └──────┬──────┘  ││
│  │ Sessions  │  │       │           │               │         ││
│  │ Tasks     │  │  ┌────┴───────────┴───────────────┴──────┐  ││
│  └──────────┘  │  │     React Context (DashboardState)     │  ││
│                │  └────────────────┬───────────────────────┘  ││
│                └──────────────────┬┘                           │
│                                   │                            │
│  ┌────────────────────────────────▼──────────────────────────┐│
│  │              Parser Module (TypeScript)                    ││
│  │                                                           ││
│  │  Layer 1: File Scanner                                    ││
│  │    ↓ file paths + raw content                             ││
│  │  Layer 2: Frontmatter Extractor & Validator               ││
│  │    ↓ typed objects + ParseWarning[]                       ││
│  │  Layer 3: Graph Builder & Eligibility Engine              ││
│  │    ↓ DashboardState (normalized JSON)                     ││
│  └───────────────────────────────────────────────────────────┘│
│                         │                                      │
│  ┌──────────────────────▼────────────────────────────────────┐│
│  │              File System (Read-Only)                       ││
│  │  prompts/index.md  →  Canonical prompt registry           ││
│  │  prompts/active/   →  Active prompt files                 ││
│  │  prompts/archive/  →  Completed/superseded prompts        ││
│  │  agents/epics/     →  Epic/story/task definitions         ││
│  │  agents/handoffs/  →  Session handoff files               ││
│  │  agents/context/   →  Context documents                   ││
│  │  schemas/          →  JSON schema definitions             ││
│  └───────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐│
│  │  chokidar File Watcher (optional, local dev mode)         ││
│  │  - Monitors repo directories for changes                  ││
│  │  - 500ms debounce before triggering re-parse              ││
│  │  - Triggers full parser pipeline → state update           ││
│  └───────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack (ADR-001 — Approved)

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js (React) | SPA with static export and local dev server |
| Language | TypeScript | Type-safe contracts between parser and UI |
| YAML Parsing | gray-matter | Frontmatter extraction from markdown files |
| Charts | Chart.js + react-chartjs-2 | Lightweight charting (~60KB gzipped) |
| Markdown | react-markdown + remark-gfm | XSS-safe markdown rendering |
| Styling | Tailwind CSS | Utility-first CSS, no component library |
| File Watching | chokidar | Local dev mode auto-refresh |

## Major Components

### 1. Parser Module (ADR-002 — Approved with Conditions)

A standalone TypeScript module usable both as a library (imported by the UI) and as a CLI tool.

#### Layer 1: File Scanner
- Walks repo directories for known paths (see Directory Scanning table below)
- Filters for `.md` and `.json` files
- Returns file path + raw content pairs
- All paths sandboxed to repo root (no path traversal — mitigates R6)

#### Layer 2: Frontmatter Extractor & Validator
- Uses `gray-matter` to extract YAML frontmatter
- Validates against data contract schemas (Sections 1–5)
- Emits structured `ParseWarning[]` for malformed or missing fields
- Returns typed objects (`ParsedPrompt`, `ParsedHandoff`, `ParsedEpic`, etc.)

#### Layer 3: Graph Builder & Eligibility Engine
- Builds parent-child graph: epic → story → task → prompt → handoff
- Links prompts to stories/tasks by ID
- Links handoffs to prompts by `prompt_id`
- Computes completion rollups per data contract Section 6
- Resolves dependencies and determines next-prompt selection (data contract Section 7)
- Emits normalized `DashboardState` JSON

#### Directory Scanning Conventions

| Content Type | Scanned Path | File Pattern | Parse Order |
|---|---|---|---|
| Prompt Registry | `prompts/index.md` | Single file | **First** (canonical source of truth) |
| Active Prompts | `prompts/active/` | `*.md` | Second (supplements registry) |
| Archived Prompts | `prompts/archive/` | `*.md` | Second (supplements registry) |
| Epics | `agents/epics/` | `*.md` | Parallel |
| Handoffs | `agents/handoffs/` | `*.md` | Parallel |
| Context | `agents/context/` | `*.md` | Parallel |
| Schemas | `schemas/` | `*.json` | Parallel |

**Critical:** `prompts/index.md` is parsed first to build the canonical prompt registry. Folder contents supplement but do not override the inventory (data contract Section 1.3).

#### Key Design Rules
1. **Graceful degradation:** Malformed files produce warnings, never crashes (C6)
2. **Deterministic:** Same repo state → identical JSON output (C3)
3. **Stateless:** No cache or memory between runs; each run is fresh
4. **Sandboxed:** All file operations restricted to repo root (R6 mitigation)
5. **Typed:** All intermediate models are TypeScript interfaces
6. **Testable:** Each layer is independently testable with fixtures

### 2. UI Application (ADR-003 — Approved)

A Next.js + React + TypeScript SPA with five primary views.

#### Application Shell
- **Header:** Project name, repo selector, refresh button
- **Sidebar:** Navigation to five views (Overview, Epics, Prompts, Sessions, Tasks)
- **Main Content:** View-specific content area
- **Status Bar:** Last parsed timestamp, file count, warning count

#### View Architecture

| View | Route | Purpose | Key Components |
|---|---|---|---|
| Overview | `/` | Project summary dashboard | Metric cards, charts (Chart.js), blockers panel, next-prompt widget |
| Epics | `/epics` | Epic/story hierarchy | Epic table with progress bars, expandable story breakdown |
| Prompts | `/prompts` | Full prompt inventory | Sortable/filterable table, detail drawer with markdown rendering |
| Sessions | `/sessions` | Session handoff timeline | Chronological timeline, expandable session detail cards |
| Tasks | `/tasks` | Task graph | Epic → Story → Task tree, status badges, completion rollups |

#### Cross-Cutting UI Concerns
- **Error boundaries:** Each view wrapped in React error boundary to isolate rendering failures
- **Loading states:** Skeleton screens during parser execution
- **Empty states:** Meaningful messaging when no data exists (new project, no sessions)
- **Accessibility:** WCAG 2.1 AA compliance (keyboard nav, focus management, ARIA labels)
- **Status badge theme:** Centralized `STATUS_THEME` constant mapping canonical statuses to colors

### 3. State Management

- **Global state:** `DashboardState` object in React Context + `useReducer`
- **State flow:** Parser output → Context Provider → view components consume via hooks
- **Refresh triggers:** Manual button, file watcher events, initial mount
- **No external state library in v1** — Context + useReducer sufficient for single-user read-only model
- **v2 migration path:** Zustand or Redux if state complexity grows

### 4. Data Layer

- No external database — all state derived from repo artifacts (C1)
- Parser runs in-browser on mount and on refresh/file-watch events
- Optional: CLI can pre-generate JSON for faster startup
- CLI entry point: `npx dashboard-parse --repo <path> --output <json-path>`
- File watcher (chokidar) triggers re-parse with 500ms debounce (E5-S2)

## Core TypeScript Interfaces

```typescript
// Parser output types (ADR-002)
interface ParsedPrompt {
  promptId: string;
  title: string;
  phase: string;
  status: PromptStatus;
  epicId: string;
  storyId: string;
  taskIds: string[];
  role: string;
  prerequisites: string[];
  requiredReading: string[];
  downstreamPrompts: string[];
  insertedAfter: string | null;
  affectsPrompts: string[];
  reviewRequired: string[];
  createdAt: string;
  updatedAt: string;
  sessionHandoff: string;       // Path to handoff file (data contract 1.1)
  supersedes: string;           // Prompt ID this replaces
  supersededBy: string;         // Prompt ID that replaces this
  insertReason: string;         // Reason for insertion
  completedAt: string;          // ISO 8601
  archivedAt: string;           // ISO 8601
  body: string;
  sourcePath: string;
}

interface ParsedHandoff {
  sessionId: string;
  promptId: string;
  role: string;
  statusOutcome: string;
  completionPercent: number;
  startedAt: string;
  endedAt: string;
  changedFiles: string[];
  blockers: string[];
  nextRecommendedPrompts: string[];
  summary: string;
  sourcePath: string;
}

interface ParsedEpic {
  epicId: string;
  title: string;
  status: string;
  stories: ParsedStory[];
}

interface ParsedStory {
  storyId: string;
  epicId: string;
  title: string;
  status: string;
  tasks: ParsedTask[];
}

interface ParsedTask {
  taskId: string;
  storyId: string;
  epicId: string;
  title: string;
  status: string;
}

// Warning type for parser diagnostics
interface ParseWarning {
  file: string;
  line?: number;
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// Top-level state consumed by all views
interface DashboardState {
  project: ProjectSummary;
  summary: SummaryMetrics;
  nextPrompt: NextPromptInfo | null;
  epics: ParsedEpic[];
  prompts: ParsedPrompt[];
  sessions: ParsedHandoff[];
  warnings: ParseWarning[];
}

// Note: ProjectSummary, SummaryMetrics, and NextPromptInfo
// interfaces to be fully specified during technical task
// generation (prompt 9.0.1).
```

## Canonical Status Model

All prompts, stories, tasks, and reviews use these 8 statuses (PRD Section 12):

| Status | Badge Color | Description |
|---|---|---|
| `draft` | Gray | Not yet ready for execution |
| `ready` | Blue | All prerequisites met, eligible for execution |
| `in_progress` | Yellow | Currently being executed |
| `in_review` | Purple | Execution complete, awaiting review |
| `blocked` | Red | Cannot proceed due to dependency or issue |
| `done` | Green | Completed and verified |
| `superseded` | Strikethrough | Replaced by another prompt |
| `cancelled` | Strikethrough | Removed from scope |

## Data Flow

```
1. User opens dashboard or clicks Refresh
2. Parser Layer 1 scans filesystem (starting with prompts/index.md)
3. Parser Layer 2 extracts frontmatter, validates, emits warnings
4. Parser Layer 3 builds graph, computes rollups, resolves next prompt
5. DashboardState dispatched to React Context
6. All views re-render from new state
7. Warnings surface in Blockers & Warnings panel
```

## Security Considerations

- **Path traversal prevention:** Parser sandboxes all file operations to repo root (R6)
- **XSS protection:** react-markdown configured to sanitize HTML by default
- **No external API calls:** Dashboard is fully local, no network requests in v1
- **Read-only:** Dashboard never modifies repo files (C8)
- **Input validation:** All frontmatter validated before graph construction

## Performance Constraints

- Must handle repos with 10+ epics, 100+ stories, 300+ tasks, 250+ prompts (C7)
- Parser must be benchmarked early (R5); incremental parsing or caching if needed
- File watcher debounce: 500ms minimum between re-parse triggers (E5-S2)
- Bundle size target: <500KB gzipped total
- Chart.js lazy-loaded only when chart views are visible

## Known Gaps (to be resolved before or during implementation)

| Gap | Resolution Path | Target Prompt |
|---|---|---|
| `ProjectSummary`, `SummaryMetrics`, `NextPromptInfo` interfaces undefined | Define during technical task generation | 9.0.1 |
| Epic/story/task markdown parsing schema (A11) | Formalize combined markdown format rules | 9.0.1 |
| `docs/business-rules.md` referenced but not created | Author or replace references with inline specs | Pre-implementation |
| Health badge calculation algorithm | Define "On Track / At Risk / Blocked / Not Started" logic | 9.0.1 |
| Prompt numbering formal grammar (BNF) | Specify validation rules for `major.branch.revision` | 9.0.1 |
| Repo capability detection algorithm | Formalize "dashboard-capable" checks (FR-1) | 9.0.1 |

## ADR References

| ADR | Title | Status | Review Date |
|---|---|---|---|
| [ADR-001](../decisions/ADR-001-stack-selection.md) | Technology Stack Selection | **Approved** | 2026-04-03 |
| [ADR-002](../decisions/ADR-002-parser-architecture.md) | Parser Architecture | **Approved with Conditions** | 2026-04-03 |
| [ADR-003](../decisions/ADR-003-ui-architecture.md) | UI Architecture and View Layout | **Approved** | 2026-04-03 |

## Constraint and Assumption References

- [Constraints](constraints.md) — 10 hard constraints (C1–C10)
- [Assumptions](assumptions.md) — 15 working assumptions (A1–A15)
- [Risk Register](risk-register.md) — Active risk tracking
