# ADR-002: Parser Architecture

## Status
Approved with Conditions (Architect Review — 2026-04-03)

## Architect Review Notes

**Verdict: Approved with Conditions**

The three-layer parser pipeline (File Scanner → Frontmatter Extractor & Validator → Graph Builder & Eligibility Engine) is architecturally sound and directly maps to the data contract requirements. Key strengths:

1. **Layer separation** enables independent testing with fixtures (Key Design Rule 6), which is critical for E6-S1 validation coverage.
2. **Graceful degradation** (Rule 1) directly satisfies constraint C6 (malformed frontmatter → warn, don't crash).
3. **Determinism** (Rule 2) satisfies constraint C3 and enables snapshot testing.
4. **Sandboxing** (Rule 4) mitigates risk R6 (path traversal).
5. **Core interfaces** (`ParsedPrompt`, `ParsedHandoff`, `ParsedEpic`, etc.) align well with the data contract sections 1–5.

**Conditions that must be addressed before implementation:**

1. **`prompts/index.md` as canonical source:** The data contract (Section 1.3) specifies that `prompts/index.md` is the source of truth for prompt scope, and the parser must read it first. The ADR's directory scanning conventions table lists only `prompts/` with `*.md` pattern — this must be updated to reflect the two-phase approach: (a) parse `prompts/index.md` for the canonical registry, (b) scan `prompts/active/` and `prompts/archive/` for frontmatter details. Folder contents supplement but do not override the inventory.

2. **`ParseWarning` interface undefined:** The `DashboardState` interface references `ParseWarning[]` but this type is never defined. It must be specified before implementation. Recommended shape:
   ```
   ParseWarning { file: string; line?: number; code: string; message: string; severity: 'error' | 'warning' | 'info' }
   ```

3. **Missing interfaces:** `ProjectSummary`, `SummaryMetrics`, and `NextPromptInfo` are referenced in `DashboardState` but not defined in the ADR. These must be specified during technical task generation (prompt 9.0.1).

4. **Prompt lifecycle fields:** The `ParsedPrompt` interface is missing several fields from the data contract (Section 1.1): `sessionHandoff`, `supersedes`, `supersededBy`, `insertReason`, `completedAt`, `archivedAt`. These are required for FR-6 (prompt inventory) and FR-7 (prompt detail drawer).

5. **Derived metrics computation:** The data contract (Section 6) defines specific counting and rollup rules. The Graph Builder layer should document which metrics it computes vs. which are deferred to the UI layer.

6. **Epic/story/task parsing format:** Assumption A11 states these are in a "combined markdown file" but no parsing rules are provided. The parser needs a defined schema for extracting epic/story/task structures from `agents/epics/*.md` files.

**Recommendation:** Address conditions 1, 2, and 4 as amendments to this ADR before implementation begins. Conditions 3, 5, and 6 can be resolved during technical task generation (prompt 9.0.1).

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
