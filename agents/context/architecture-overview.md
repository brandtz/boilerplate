# Architecture Overview

> **Last updated:** 2026-04-06 — Release Documentation (Prompt 29.0.1)
> **Status:** Implementation complete; v1 released. ADRs approved; all conditions resolved.

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

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Framework | Next.js (React) | 16.2.2 (React 19) | SPA with static export (`output: "export"`) and local dev server |
| Language | TypeScript | 5.x (strict) | Type-safe contracts between parser and UI |
| YAML Parsing | gray-matter + js-yaml | 4.0.3 (v4 safe schema) | Frontmatter extraction from markdown files |
| Charts | Chart.js + react-chartjs-2 | 4.5.1 / 5.3.1 | Lightweight charting (~60KB gzipped) |
| Markdown | react-markdown + remark-gfm | 10.1.0 / 4.0.1 | XSS-safe markdown rendering (no rehype-raw) |
| Styling | Tailwind CSS | v4 | Utility-first CSS via `@tailwindcss/postcss` |
| File Watching | chokidar | v5 | Local dev mode auto-refresh (followSymlinks: false) |
| Testing | Jest + Testing Library | 30.3 / 16.3 | Unit, component, integration, security tests |
| CLI Runtime | tsx | 4.21 | TypeScript execution for CLI entry point |

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

// Note: All interfaces fully specified. See dashboard/src/parser/types.ts
// for complete definitions including ReverseTaskIndex, TimelineDataPoint,
// and all lifecycle fields.
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

- **Path traversal prevention:** Scanner sandboxes all file operations to repo root; `repoDetection.ts` rejects `..`, null bytes, non-printable chars; `path.resolve()` + prefix check (R6 — Mitigated)
- **XSS protection:** react-markdown with remark-gfm only (no rehype-raw); link protocol sanitizer blocks `javascript:`, `data:`, and protocol-relative URLs; CSP meta tag restricts script/style sources (R15 — Mitigated)
- **Prototype pollution prevention:** Frontmatter extractor rejects `__proto__`, `constructor`, `prototype` keys (R17 — Mitigated)
- **Symlink traversal prevention:** Scanner and chokidar set `followSymlinks: false`; `lstat` for symlink detection (R18 — Mitigated)
- **YAML injection prevention:** gray-matter + js-yaml v4 safe schema; 1MB file size limit; try-catch wrapping (MED-001 — Mitigated)
- **Clickjacking prevention:** CSP includes `frame-ancestors 'none'`
- **No external API calls:** Dashboard is fully local, no network requests in v1
- **Read-only:** Dashboard never modifies repo files (C8)
- **Security test suite:** 43 dedicated security tests in `tests/security/security-audit.test.ts`
- **Known limitation:** `script-src 'unsafe-inline'` required by Next.js static export for hydration

## Performance

- **Parser benchmark:** 81ms for 310 prompts + 260 handoffs + 10 epics (6,220 prompts/sec)
- **UI render benchmark:** 17ms initial render from parsed state
- **Memory usage:** Well under 100MB threshold at maximum scale
- **Thresholds:** Parser <2s for 300 prompts; UI render <3s; memory <100MB
- **File watcher debounce:** Escalating — 500ms single file, 3s batch (>3 files)
- **Build size:** Within 500KB gzipped budget; Chart.js lazy-loaded via dynamic import
- **Performance tests:** 13 benchmarks in `tests/perf/` (excluded from `npm test`, run via `npm run test:perf`)

## Resolved Design Gaps

All gaps identified during architecture review have been resolved:

- `ProjectSummary`, `SummaryMetrics`, `NextPromptInfo` — defined in prompt 9.0.1, implemented in `types.ts`
- Epic/story/task parsing schema — formalized in 9.0.1, implemented in `epic-parser.ts`
- `docs/business-rules.md` — authored in prompt 2.0.1
- Health badge algorithm — implemented in `graph-builder.ts`
- Prompt numbering grammar — implemented in `sorting.ts`
- Repo capability detection — implemented in `repoDetection.ts`
- `ParsedPrompt` lifecycle fields — 6 fields added per ADR-002 Condition 4
- `ParseWarning` interface — defined with 14 warning codes

## ADR References

| ADR | Title | Status | Review Date |
|---|---|---|---|
| [ADR-001](../decisions/ADR-001-stack-selection.md) | Technology Stack Selection | **Accepted** | 2026-04-03 |
| [ADR-002](../decisions/ADR-002-parser-architecture.md) | Parser Architecture | **Accepted** (all 6 conditions resolved) | 2026-04-03 |
| [ADR-003](../decisions/ADR-003-ui-architecture.md) | UI Architecture and View Layout | **Accepted** | 2026-04-03 |

## Constraint and Assumption References

- [Constraints](constraints.md) — 10 hard constraints (C1–C10)
- [Assumptions](assumptions.md) — 15 working assumptions (A1–A15)
- [Risk Register](risk-register.md) — Active risk tracking
