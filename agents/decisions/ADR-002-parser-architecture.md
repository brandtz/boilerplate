# ADR-002: Parser Architecture

## Status
Proposed

## Context
The dashboard must parse YAML frontmatter from markdown files across multiple directories (epics, prompts, handoffs) and produce a normalized in-memory graph model that the UI consumes. The parser must handle malformed files gracefully, support 250+ prompt files, and emit normalized JSON.

## Decision

### Architecture: Three-Layer Parser Pipeline

```
┌─────────────────────────────────────────────────────┐
│  Layer 1: File Scanner                              │
│  - Walks directory tree for known paths             │
│  - Filters for .md and .json files                  │
│  - Returns file path + raw content pairs            │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  Layer 2: Frontmatter Extractor & Validator         │
│  - Uses gray-matter to extract YAML frontmatter     │
│  - Validates against schema contracts               │
│  - Emits structured warnings for malformed files    │
│  - Returns typed objects (Prompt, Handoff, Epic...) │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  Layer 3: Graph Builder & Eligibility Engine        │
│  - Builds parent-child graph (epic→story→task)      │
│  - Links prompts to stories/tasks by ID             │
│  - Links handoffs to prompts by prompt_id           │
│  - Computes completion rollups                      │
│  - Resolves dependencies and next-prompt selection  │
│  - Emits normalized JSON state                      │
└─────────────────────────────────────────────────────┘
```

### Directory Scanning Conventions

| Content Type | Scanned Path | File Pattern |
|---|---|---|
| Epics | `agents/epics/` | `*.md` |
| Prompts | `prompts/` | `*.md` (with YAML frontmatter) |
| Handoffs | `agents/handoffs/` | `*.md` (with YAML frontmatter) |
| Context | `agents/context/` | `*.md` |
| Schemas | `schemas/` | `*.json` |

### Key Design Rules
1. **Graceful degradation:** Malformed files produce warnings, never crashes
2. **Deterministic:** Same repo state always produces identical JSON output
3. **Stateless:** Parser has no cache or memory between runs (each run is fresh)
4. **Sandboxed:** All file operations restricted to the repo root — no path traversal
5. **Typed:** All intermediate models are TypeScript interfaces
6. **Testable:** Each layer is independently testable with fixtures

### Core TypeScript Interfaces

```typescript
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

interface DashboardState {
  project: ProjectSummary;
  summary: SummaryMetrics;
  nextPrompt: NextPromptInfo | null;
  epics: ParsedEpic[];
  prompts: ParsedPrompt[];
  sessions: ParsedHandoff[];
  warnings: ParseWarning[];
}
```

## Consequences
- Parser is a standalone TypeScript module, usable by CLI or imported by the UI
- CLI entry point: `npx dashboard-parse --repo <path> --output <json-path>`
- UI calls parser on mount and on refresh/file-watch events
- Warnings surface in the Blockers & Warnings panel of the dashboard
