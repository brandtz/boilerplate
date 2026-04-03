# Architecture Overview

## Current State
Project is in intake/planning phase. Architecture proposals (ADRs) have been drafted and are pending formal architect review.

## Target State
A local-first single-page dashboard application that parses repo artifacts (markdown with YAML frontmatter) and renders a project management cockpit.

## Major Components

### 1. Parser Module (TypeScript, standalone)
- **File Scanner**: Walks repo directories for markdown files
- **Frontmatter Extractor**: Uses gray-matter to parse YAML frontmatter
- **Validator**: Checks frontmatter against data contracts, emits structured warnings
- **Graph Builder**: Constructs epic → story → task → prompt → handoff model
- **Eligibility Engine**: Resolves dependencies, selects next-runnable prompt
- **JSON Emitter**: Serializes normalized state to JSON; also available as CLI

### 2. UI Application (Next.js + React + TypeScript)
- **App Shell**: Header, sidebar nav, main content, status bar
- **Overview View**: Summary cards, charts (Chart.js), blockers panel, next-prompt widget
- **Epics View**: Epic table, story drill-down, task tree with status badges
- **Prompt Inventory View**: Sortable/filterable table, detail drawer with markdown rendering
- **Session History View**: Chronological timeline of session handoffs
- **Refresh & Multi-Project**: File watcher (chokidar), repo selector, local storage persistence

### 3. Data Layer
- React Context + useReducer for global DashboardState
- Parser runs on mount and on refresh/file-watch events
- No external database — all state derived from repo artifacts

## Key Interfaces
- `DashboardState`: Top-level state object consumed by all views
- `ParsedPrompt`, `ParsedHandoff`, `ParsedEpic`, `ParsedStory`, `ParsedTask`: Core model types
- CLI: `npx dashboard-parse --repo <path> --output <json-path>`

## Data Boundaries
- Input: Markdown files with YAML frontmatter in agents/, prompts/, schemas/
- Output: Rendered dashboard views; optional JSON state file
- All file operations sandboxed to repo root (no path traversal)

## Operational Notes
- Local-only in v1 (no deployment infrastructure required)
- Static export mode via Next.js for distribution
- File watcher optional and configurable
- Styling via Tailwind CSS (no component library dependency)

## ADR References
- `agents/decisions/ADR-001-stack-selection.md` — Next.js + TypeScript + Chart.js
- `agents/decisions/ADR-002-parser-architecture.md` — Three-layer parser pipeline
- `agents/decisions/ADR-003-ui-architecture.md` — View layout and component architecture
