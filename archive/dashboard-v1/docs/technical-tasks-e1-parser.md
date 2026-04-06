# Technical Task Specifications — Epic E1: Repo Data Contracts and Parsing Foundation

> **Author Role:** Solution Architect
> **Prompt:** 9.0.1
> **Date:** 2026-04-04
> **Status:** Complete
> **Epic:** E1
> **Stories:** E1-S1 through E1-S6
> **Total Tasks Specified:** 21

---

## Table of Contents

1. [Parser Module Structure](#1-parser-module-structure)
2. [ADR-002 Conditions Resolution](#2-adr-002-conditions-resolution)
3. [TypeScript Interface Definitions](#3-typescript-interface-definitions)
4. [E1-S1: Define and Validate Prompt Frontmatter Contract](#4-e1-s1-define-and-validate-prompt-frontmatter-contract)
5. [E1-S2: Define and Validate Session Handoff Contract](#5-e1-s2-define-and-validate-session-handoff-contract)
6. [E1-S3: Build Markdown Frontmatter Parser](#6-e1-s3-build-markdown-frontmatter-parser)
7. [E1-S4: Build Natural Prompt Sequence Sorting](#7-e1-s4-build-natural-prompt-sequence-sorting)
8. [E1-S5: Build Dependency Graph and Eligibility Engine](#8-e1-s5-build-dependency-graph-and-eligibility-engine)
9. [E1-S6: Build JSON State Emitter and CLI](#9-e1-s6-build-json-state-emitter-and-cli)
10. [CLI Entry Point Specification](#10-cli-entry-point-specification)
11. [Cross-Cutting Concerns](#11-cross-cutting-concerns)
12. [Test Fixture Requirements](#12-test-fixture-requirements)

---

## 1. Parser Module Structure

All parser code resides in `dashboard/src/parser/` within the dashboard project directory. The parser is a standalone TypeScript module usable both as a library (imported by the UI) and as a CLI tool.

```
dashboard/
├── src/
│   ├── parser/
│   │   ├── index.ts                  # Public API entry point — exports parse()
│   │   ├── types.ts                  # All TypeScript interfaces
│   │   ├── scanner.ts                # Layer 1: File Scanner
│   │   ├── extractor.ts              # Layer 2: Frontmatter Extractor & Validator
│   │   ├── graph-builder.ts          # Layer 3: Graph Builder & Eligibility Engine
│   │   ├── index-parser.ts           # prompts/index.md two-phase parser
│   │   ├── epic-parser.ts            # Combined markdown epic/story/task extractor
│   │   ├── sorting.ts                # Natural tuple sorting for prompt IDs
│   │   ├── eligibility.ts            # Next-prompt selection algorithm
│   │   ├── metrics.ts                # Completion rollup and derived metrics
│   │   ├── warnings.ts               # Warning/error creation helpers and codes
│   │   └── schemas/
│   │       ├── prompt-schema.ts      # Prompt frontmatter validation schema
│   │       ├── handoff-schema.ts     # Handoff frontmatter validation schema
│   │       └── epic-schema.ts        # Epic markdown parsing schema/rules
│   └── types/
│       └── index.ts                  # Re-exports from parser/types.ts for UI
├── tests/
│   ├── parser/
│   │   ├── scanner.test.ts
│   │   ├── extractor.test.ts
│   │   ├── graph-builder.test.ts
│   │   ├── index-parser.test.ts
│   │   ├── epic-parser.test.ts
│   │   ├── sorting.test.ts
│   │   ├── eligibility.test.ts
│   │   ├── metrics.test.ts
│   │   └── warnings.test.ts
│   └── fixtures/
│       ├── valid/                    # Conformant test data
│       ├── malformed/                # Missing fields, bad YAML
│       ├── adversarial/              # Injection attempts, path traversal
│       ├── edge-case/                # Empty files, 250+ prompts, unicode
│       ├── epics/                    # Combined markdown format test files
│       └── index-md/                 # prompts/index.md format test files
└── bin/
    └── dashboard-parse.ts            # CLI entry point
```

---

## 2. ADR-002 Conditions Resolution

### Condition 1: `prompts/index.md` as Canonical Source (ADR-002 §1)

**Resolution: Two-Phase Parsing Approach**

The parser implements a two-phase prompt discovery process as mandated by data contract Section 1.3 and business rules Section 4.1:

**Phase 1 — Parse `prompts/index.md`:**
- Read and parse `prompts/index.md` to extract the canonical prompt registry
- Parse each row of the prompt inventory tables to produce a `Map<promptId, IndexEntry>` where `IndexEntry` contains: `promptId`, `title`, `status`, `phase`, `location`, `epicId`, `storyId`, `taskIds`, `prerequisites`, `downstreamPrompts`, `sessionHandoff`, `createdAt`, `completedAt`, `archivedAt`, `notes`
- This map defines the complete set of prompts the dashboard tracks — any prompt not listed in `index.md` is ignored by the dashboard
- If `prompts/index.md` is missing, emit an error-level `ParseWarning` with code `E_INDEX_MISSING` and halt prompt parsing

**Phase 2 — Scan folder frontmatter:**
- Scan `prompts/active/*.md` and `prompts/archive/*.md` for files with YAML frontmatter
- For each scanned file, match its `prompt_id` frontmatter field against the Phase 1 registry
- If a match exists: merge the full frontmatter fields (all lifecycle fields, body content, etc.) into the prompt record. The index.md entry provides the canonical status, location, and scope; the file provides the full frontmatter detail
- If a scanned file has no match in the index: emit a warning-level `ParseWarning` with code `W_FILE_NOT_IN_INDEX` — the file is included in warnings but does **not** create a new prompt entry
- If an index entry has no matching file: emit a warning-level `ParseWarning` with code `W_INDEX_NO_FILE` — the prompt appears in the inventory with metadata from the index only (status, title, etc.) but with empty body and default values for detailed fields

**Conflict Resolution:**
- `prompts/index.md` is authoritative for: prompt scope (which prompts exist), status, location
- Folder files are authoritative for: full YAML frontmatter fields, markdown body content
- If both provide a value for the same field and they conflict, the index.md value takes precedence for `status` and `location`; the file frontmatter takes precedence for all other fields

**Implementation file:** `dashboard/src/parser/index-parser.ts`

---

### Condition 2: `ParseWarning` Interface (ADR-002 §2)

**Resolution: Defined with Warning Code Taxonomy**

The `ParseWarning` interface is defined in `dashboard/src/parser/types.ts`:

```typescript
interface ParseWarning {
  file: string;        // Relative path to the source file (from repo root)
  line?: number;       // Optional line number where the issue was detected
  code: string;        // Machine-readable warning code (see taxonomy below)
  message: string;     // Human-readable description of the issue
  severity: 'error' | 'warning' | 'info';
}
```

**Warning Code Taxonomy** (aligned with business rules Section 4.5):

| Code | Severity | Condition | Reference |
|---|---|---|---|
| `E_NO_FRONTMATTER` | error | File has no YAML frontmatter at all | BR 4.5 row 1 |
| `E_MISSING_REQUIRED` | error | Required field missing (`prompt_id`, `status` for prompts; `session_id`, `prompt_id`, `status_outcome` for handoffs) | BR 4.5 row 2 |
| `E_INDEX_MISSING` | error | `prompts/index.md` not found | BR 4.1 step 1 |
| `E_INVALID_YAML` | error | YAML frontmatter is syntactically invalid | BR 4.5 row 1 |
| `W_OPTIONAL_MISSING` | warning | Optional field missing from frontmatter | BR 4.5 row 3 |
| `W_UNKNOWN_STATUS` | warning | Unrecognized status value | BR 4.5 row 4 |
| `W_PREREQ_NOT_FOUND` | warning | Prerequisite references non-existent prompt | BR 4.5 row 5 |
| `W_DONE_NO_HANDOFF` | warning | `done` prompt has no matching handoff | BR 4.5 row 6 |
| `W_FILE_NOT_IN_INDEX` | warning | Scanned file not listed in `prompts/index.md` | Condition 1 |
| `W_INDEX_NO_FILE` | warning | Index entry has no matching file in active/archive | Condition 1 |
| `W_DUPLICATE_PROMPT` | warning | Multiple files claim the same `prompt_id` | Data integrity |
| `W_INVALID_DATE` | warning | Date field is not valid ISO 8601 | Data contract 1.1 |
| `W_EPIC_PARSE_FAIL` | warning | Could not parse epic/story/task from epics markdown | Condition 6 |
| `I_PARSED_OK` | info | File parsed successfully | BR 4.5 row 7 |

**Helper module:** `dashboard/src/parser/warnings.ts` — exports factory functions:
- `createWarning(file, code, message, severity, line?): ParseWarning`
- `isError(w: ParseWarning): boolean`
- `isWarning(w: ParseWarning): boolean`

---

### Condition 3: Missing `DashboardState` Interfaces (ADR-002 §3, Risk R12)

**Resolution: Three Interfaces Defined**

All interfaces defined in `dashboard/src/parser/types.ts`:

```typescript
interface ProjectSummary {
  projectName: string;           // Extracted from prompts/index.md heading
  repoPath: string;              // Absolute path to the repo root
  lastParsedAt: string;          // ISO 8601 timestamp of this parse run
  totalEpics: number;            // Count of parsed epic definitions
  totalStories: number;          // Count of parsed story definitions
  totalTasks: number;            // Count of parsed task definitions
  totalPrompts: number;          // Count of prompts in index.md registry
  totalHandoffs: number;         // Count of parsed handoff files
  healthStatus: 'on_track' | 'at_risk' | 'blocked' | 'not_started';
  // Health computed per business rules Section 9.1
}
```

```typescript
interface SummaryMetrics {
  // Prompt status counts (business rules Section 1.1)
  promptsByStatus: Record<PromptStatus, number>;
  // { draft: 0, ready: 26, in_progress: 0, in_review: 0,
  //   blocked: 0, done: 8, superseded: 0, cancelled: 0 }

  // Dual completion metrics (business rules Section 2.4)
  scopeCompletionPercent: number;
  // (done_tasks / (total_tasks - cancelled_tasks)) × 100
  executionCompletionPercent: number;
  // (done_prompts / (total_prompts - superseded - cancelled)) × 100

  // Epic completion percentages (business rules Section 2.3)
  epicCompletionPercents: Record<string, number>;
  // { "E1": 0, "E2": 0, ... }

  // Counters for overview cards
  activePrompts: number;         // Non-terminal prompts
  completedPrompts: number;      // done status
  blockedPrompts: number;        // blocked status
  supersededPrompts: number;     // superseded status
  cancelledPrompts: number;      // cancelled status

  // Time-series derived data (business rules Section 6.1)
  completionTimeline: TimelineDataPoint[];
  // Grouped by handoff ended_at dates
}

interface TimelineDataPoint {
  date: string;                  // ISO 8601 date (YYYY-MM-DD)
  cumulativeCompleted: number;   // Cumulative done prompts at this date
  remainingPrompts: number;      // Total - cumulative done at this date
}
```

```typescript
interface NextPromptInfo {
  promptId: string;              // The selected next prompt ID
  title: string;                 // Prompt title
  ownerRole: string;             // Agent role responsible
  epicId: string;                // Associated epic
  storyId: string;               // Associated story
  sourcePath: string;            // Path to the prompt file
  prerequisitesMet: number;      // Count of met prerequisites
  totalPrerequisites: number;    // Total prerequisite count
  eligibleCount: number;         // Number of eligible prompts
  downstreamCount: number;       // Prompts this unblocks
  rationale: string;             // Human-readable rationale string
  // Format per business rules Section 3.3:
  // "Prompt {id} is next because: all {n} prerequisites are met,
  //  it has the lowest sequence number among {m} eligible prompts,
  //  and it unblocks {k} downstream prompt(s)."
  body: string;                  // Full prompt markdown content
}
```

**When no prompt is eligible**, `DashboardState.nextPrompt` is `null` and a `noEligibleRationale` field on `SummaryMetrics` provides the message:

```typescript
// Added to SummaryMetrics:
noEligibleRationale: string | null;
// Format per business rules Section 3.3:
// "No prompts are currently eligible. {n} prompt(s) are blocked,
//  {m} are awaiting prerequisite completion."
```

**Resolves Risk R12.**

---

### Condition 4: Prompt Lifecycle Fields (ADR-002 §4, Risk R10)

**Resolution: Six Fields Added to ParsedPrompt**

The `ParsedPrompt` interface in `dashboard/src/parser/types.ts` includes all lifecycle fields from data contract Section 1.1:

```typescript
interface ParsedPrompt {
  // --- Existing fields (from ADR-002) ---
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

  // --- Lifecycle fields (ADR-002 Condition 4, data contract 1.1) ---
  sessionHandoff: string;     // Path to the session handoff file (set on completion)
  supersedes: string;         // Prompt ID this prompt replaces (empty if not a replacement)
  supersededBy: string;       // Prompt ID that replaces this prompt (empty if still active)
  insertReason: string;       // Reason for insertion (empty for original prompts)
  completedAt: string;        // ISO 8601 timestamp when execution completed
  archivedAt: string;         // ISO 8601 timestamp when moved to prompts/archive/
}
```

**Frontmatter mapping** (YAML field name → TypeScript property):

| YAML Field | TypeScript Property | Required? | Default |
|---|---|---|---|
| `session_handoff` | `sessionHandoff` | No | `""` |
| `supersedes` | `supersedes` | No | `""` |
| `superseded_by` | `supersededBy` | No | `""` |
| `insert_reason` | `insertReason` | No | `""` |
| `completed_at` | `completedAt` | No | `""` |
| `archived_at` | `archivedAt` | No | `""` |

All six fields are optional. Missing fields default to empty string `""`. The validator emits `W_OPTIONAL_MISSING` for any of these that are absent on a `done` prompt where the field would be expected (e.g., `completed_at` missing on a done prompt).

**Resolves Risk R10.**

---

### Condition 5: Derived Metrics Computation (ADR-002 §5)

**Resolution: Clear Layer Responsibility Split**

The following table documents which metrics are computed by the Graph Builder (parser Layer 3) and which are deferred to the UI layer:

| Metric | Computed By | Business Rule Reference | Notes |
|---|---|---|---|
| Prompt status counts | **Graph Builder** | BR 2.4 | Iterate all prompts, count per status |
| Story completion % | **Graph Builder** | BR 2.2 | `done_tasks / (total_tasks - cancelled_tasks) × 100` |
| Epic completion % | **Graph Builder** | BR 2.3 | `done_stories / (total_stories - cancelled_stories) × 100` |
| Scope completion % | **Graph Builder** | BR 2.4 | `done_tasks / (total_tasks - cancelled_tasks) × 100` |
| Execution completion % | **Graph Builder** | BR 2.4 | `done_prompts / (total_prompts - superseded - cancelled) × 100` |
| Superseded/cancelled exclusion | **Graph Builder** | BR 2.5 | Excluded from denominator, included in scope totals |
| Completion timeline | **Graph Builder** | BR 6.1 | Group handoffs by `ended_at` date → cumulative counts |
| Next-prompt selection | **Graph Builder** | BR 3.1–3.2 | Eligibility filter + sort + select |
| Next-prompt rationale | **Graph Builder** | BR 3.3 | Generate human-readable rationale string |
| Project health status | **Graph Builder** | BR 9.1 | Blocked count + most recent handoff date |
| Reverse task→prompt index | **Graph Builder** | BR 4.3 | `Map<taskId, promptId[]>` |
| Chart rendering | **UI Layer** | BR 6.2 | Receives computed data, renders visuals |
| Filtering and search | **UI Layer** | BR 7.1–7.2 | Client-side keyword/status/epic filtering |
| Pagination | **UI Layer** | — | Client-side page management |
| Sorting display | **UI Layer** | — | UI sort controls use pre-sorted data |
| Status badge colors | **UI Layer** | Arch Overview | `STATUS_THEME` constant in UI layer |

**Principle:** The Graph Builder computes all data-derived metrics so the output JSON is a complete, self-contained snapshot. The UI layer performs only display-oriented transformations (filtering, pagination, chart rendering).

**Implementation file:** `dashboard/src/parser/metrics.ts`

---

### Condition 6: Epic/Story/Task Parsing Schema (ADR-002 §6, Risk R11)

**Resolution: Formal Parsing Rules for Combined Markdown Format**

The parser extracts epic/story/task hierarchy from `agents/epics/*.md` files using the combined markdown format specified in business rules Section 4.2:

**Parsing Rules:**

1. **Epic detection:**
   - Pattern: `## Epic E{n}: {title}` heading (H2)
   - Regex: `/^## Epic (E\d+):\s*(.+)$/m`
   - Extracts: `epicId` = capture group 1 (e.g., `"E1"`), `title` = capture group 2

2. **Story detection:**
   - Pattern: `### E{n}-S{n} {title}` heading (H3) under an epic
   - Regex: `/^### (E\d+-S\d+)\s+(.+)$/m`
   - Extracts: `storyId` = capture group 1 (e.g., `"E1-S1"`), `title` = capture group 2
   - `epicId` derived from the story ID prefix (characters before the last `-S{n}`)

3. **Task detection:**
   - Pattern: `- E{n}-S{n}-T{n}: {description}` list item under a `#### Tasks` heading
   - Regex: `/^- (E\d+-S\d+-T\d+):\s*(.+)$/m`
   - Extracts: `taskId` = capture group 1 (e.g., `"E1-S1-T1"`), `title` = capture group 2
   - `storyId` derived from the task ID prefix (characters before the last `-T{n}`)
   - `epicId` derived from the story ID prefix

4. **Status extraction:**
   - Pattern: `**Status:** {status}` line following a story heading
   - Regex: `/^\*\*Status:\*\*\s*(\w+)/m`
   - Validates status against the canonical status vocabulary (business rules Section 1.1)
   - If no status line found for a story, default to `"draft"`
   - Epic status derived from child story statuses (all done → done; any in_progress → in_progress; otherwise → ready)

5. **Acceptance criteria extraction:**
   - Pattern: Content following `**Acceptance Criteria:**` line until the next heading or `#### Tasks` section
   - Each line starting with `- AC-{n}:` is an individual acceptance criterion
   - Stored as string array on the story object for reference (not used in graph computation)

**Section boundaries:**
- An epic section spans from its `## Epic` heading to the next `## Epic` heading or end of file
- A story section spans from its `### E{n}-S{n}` heading to the next `###` heading or `## Epic` heading
- Tasks are list items under the `#### Tasks` heading within a story section

**Error handling:**
- If an epic heading is malformed, emit `W_EPIC_PARSE_FAIL` and skip to the next heading
- If a story or task ID does not match the expected format, emit `W_EPIC_PARSE_FAIL` with the line number
- Duplicate IDs within the same file emit `W_DUPLICATE_PROMPT` (repurposed code) with context

**Implementation file:** `dashboard/src/parser/epic-parser.ts`

**Resolves Risk R11.**

---

## 3. TypeScript Interface Definitions

All interfaces are defined in `dashboard/src/parser/types.ts`. This is the single source of truth for parser types. The `dashboard/src/types/index.ts` file re-exports all types for UI consumption.

### Complete Type Definitions

```typescript
// --- Status types ---

type PromptStatus =
  | 'draft'
  | 'ready'
  | 'in_progress'
  | 'in_review'
  | 'blocked'
  | 'done'
  | 'superseded'
  | 'cancelled';

// --- Parser warning/error ---

interface ParseWarning {
  file: string;
  line?: number;
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// --- Parsed entities ---

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
  sessionHandoff: string;
  supersedes: string;
  supersededBy: string;
  insertReason: string;
  completedAt: string;
  archivedAt: string;
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
  acceptanceCriteria: string[];
  tasks: ParsedTask[];
}

interface ParsedTask {
  taskId: string;
  storyId: string;
  epicId: string;
  title: string;
  status: string;
}

// --- Dashboard state ---

interface ProjectSummary {
  projectName: string;
  repoPath: string;
  lastParsedAt: string;
  totalEpics: number;
  totalStories: number;
  totalTasks: number;
  totalPrompts: number;
  totalHandoffs: number;
  healthStatus: 'on_track' | 'at_risk' | 'blocked' | 'not_started';
}

interface SummaryMetrics {
  promptsByStatus: Record<PromptStatus, number>;
  scopeCompletionPercent: number;
  executionCompletionPercent: number;
  epicCompletionPercents: Record<string, number>;
  activePrompts: number;
  completedPrompts: number;
  blockedPrompts: number;
  supersededPrompts: number;
  cancelledPrompts: number;
  completionTimeline: TimelineDataPoint[];
  noEligibleRationale: string | null;
}

interface TimelineDataPoint {
  date: string;
  cumulativeCompleted: number;
  remainingPrompts: number;
}

interface NextPromptInfo {
  promptId: string;
  title: string;
  ownerRole: string;
  epicId: string;
  storyId: string;
  sourcePath: string;
  prerequisitesMet: number;
  totalPrerequisites: number;
  eligibleCount: number;
  downstreamCount: number;
  rationale: string;
  body: string;
}

interface ReverseTaskIndex {
  // Maps task ID to array of prompt IDs that reference it
  [taskId: string]: string[];
}

interface DashboardState {
  project: ProjectSummary;
  summary: SummaryMetrics;
  nextPrompt: NextPromptInfo | null;
  epics: ParsedEpic[];
  prompts: ParsedPrompt[];
  sessions: ParsedHandoff[];
  warnings: ParseWarning[];
  taskIndex: ReverseTaskIndex;
}
```

---

## 4. E1-S1: Define and Validate Prompt Frontmatter Contract

### E1-S1-T1: Define the Canonical YAML Schema for Prompt Frontmatter

**File:** `dashboard/src/parser/schemas/prompt-schema.ts`

**Input:** Raw YAML frontmatter object (from gray-matter extraction)

**Output:** Validation result — `{ valid: boolean; errors: ParseWarning[]; warnings: ParseWarning[] }`

**Specification:**

Define a schema object that classifies each frontmatter field as required or optional:

| Field | Required? | Type | Default if Missing |
|---|---|---|---|
| `prompt_id` | **Yes** | string | — (error) |
| `title` | **Yes** | string | — (error) |
| `status` | **Yes** | string (PromptStatus) | — (error) |
| `phase` | No | string | `""` |
| `epic_id` | No | string | `""` |
| `story_id` | No | string | `""` |
| `task_ids` | No | string[] | `[]` |
| `owner_role` | No | string | `""` |
| `prerequisites` | No | string[] | `[]` |
| `required_reading` | No | string[] | `[]` |
| `downstream_prompts` | No | string[] | `[]` |
| `inserted_after` | No | string \| null | `null` |
| `affects_prompts` | No | string[] | `[]` |
| `review_required` | No | string[] | `[]` |
| `created_at` | No | string (ISO 8601) | `""` |
| `updated_at` | No | string (ISO 8601) | `""` |
| `session_handoff` | No | string | `""` |
| `supersedes` | No | string | `""` |
| `superseded_by` | No | string | `""` |
| `insert_reason` | No | string | `""` |
| `completed_at` | No | string (ISO 8601) | `""` |
| `archived_at` | No | string (ISO 8601) | `""` |

**Validation rules:**
- If `prompt_id` missing → emit `E_MISSING_REQUIRED`
- If `status` missing → emit `E_MISSING_REQUIRED`
- If `title` missing → emit `E_MISSING_REQUIRED`
- If `status` is not in the canonical status list → emit `W_UNKNOWN_STATUS`
- If any optional field is missing → emit `W_OPTIONAL_MISSING`
- If a date field is present but not valid ISO 8601 → emit `W_INVALID_DATE`
- If `status` is `done` and `completed_at` is empty → emit `W_OPTIONAL_MISSING` with context

**Exports:**
- `validatePromptFrontmatter(data: Record<string, unknown>, filePath: string): { valid: boolean; prompt: Partial<ParsedPrompt> | null; warnings: ParseWarning[] }`

**Test requirements:**
- Valid prompt with all fields → returns valid, zero warnings
- Prompt missing `prompt_id` → returns invalid, `E_MISSING_REQUIRED` error
- Prompt missing `status` → returns invalid, `E_MISSING_REQUIRED` error
- Prompt missing optional field → returns valid, `W_OPTIONAL_MISSING` warning
- Prompt with unknown status → returns valid, `W_UNKNOWN_STATUS` warning
- Done prompt missing `completed_at` → returns valid, `W_OPTIONAL_MISSING`
- Invalid date format → returns valid, `W_INVALID_DATE` warning

---

### E1-S1-T2: Implement a Frontmatter Validator that Returns Structured Errors/Warnings

**File:** `dashboard/src/parser/extractor.ts` (validation section)

**Input:** Raw file content (string), file path (string)

**Output:** `{ prompt: ParsedPrompt | null; warnings: ParseWarning[] }`

**Specification:**

1. Use `gray-matter` to extract YAML frontmatter from markdown content
2. If no frontmatter delimiters found → emit `E_NO_FRONTMATTER`, return null prompt
3. If YAML parse fails → emit `E_INVALID_YAML`, return null prompt
4. Pass extracted data to `validatePromptFrontmatter()` from prompt-schema
5. Map YAML snake_case fields to TypeScript camelCase properties
6. Return the typed `ParsedPrompt` object and all collected warnings

**Field mapping function:**
- `mapPromptFrontmatter(data: Record<string, unknown>, body: string, filePath: string): ParsedPrompt`
- Converts: `prompt_id` → `promptId`, `task_ids` → `taskIds`, `owner_role` → `role`, `session_handoff` → `sessionHandoff`, etc.
- Sets `body` to the markdown content after frontmatter
- Sets `sourcePath` to the file path relative to repo root

**Test requirements:**
- File with valid frontmatter → returns ParsedPrompt with correct field mapping
- File with no `---` delimiters → returns null, `E_NO_FRONTMATTER`
- File with malformed YAML → returns null, `E_INVALID_YAML`
- Field mapping correctness: all snake_case → camelCase conversions verified
- Body extraction: markdown after frontmatter is correctly captured

---

### E1-S1-T3: Create 3+ Example Prompt Files that Conform to the Contract

**Directory:** `tests/fixtures/valid/`

**Specification:**

Create at minimum 3 fixture prompt files and 2 warning-producing files:

1. **`tests/fixtures/valid/prompt-complete.md`** — A prompt with all fields populated, status `ready`, all lifecycle fields present
2. **`tests/fixtures/valid/prompt-done.md`** — A prompt with status `done`, `completed_at` set, `session_handoff` set, `archived_at` set
3. **`tests/fixtures/valid/prompt-minimal.md`** — A prompt with only required fields (`prompt_id`, `title`, `status`)
4. **`tests/fixtures/malformed/prompt-missing-optional.md`** — A prompt missing several optional fields (should parse with warnings)
5. **`tests/fixtures/malformed/prompt-no-frontmatter.md`** — A markdown file with no YAML frontmatter at all

**Test requirements:**
- Files 1–3 pass validation with zero errors and zero warnings
- File 4 passes validation with zero errors and ≥1 warnings
- File 5 fails validation with `E_NO_FRONTMATTER` error

---

## 5. E1-S2: Define and Validate Session Handoff Contract

### E1-S2-T1: Define the Canonical YAML Schema for Handoff Frontmatter

**File:** `dashboard/src/parser/schemas/handoff-schema.ts`

**Input:** Raw YAML frontmatter object

**Output:** Validation result — `{ valid: boolean; errors: ParseWarning[]; warnings: ParseWarning[] }`

**Specification:**

| Field | Required? | Type | Default if Missing |
|---|---|---|---|
| `session_id` | **Yes** | string | — (error) |
| `prompt_id` | **Yes** | string | — (error) |
| `status_outcome` | **Yes** | string | — (error) |
| `role` | No | string | `""` |
| `completion_percent` | No | number | `0` |
| `started_at` | No | string (ISO 8601) | `""` |
| `ended_at` | No | string (ISO 8601) | `""` |
| `changed_files` | No | string[] | `[]` |
| `blockers` | No | string[] | `[]` |
| `next_recommended_prompts` | No | string[] | `[]` |
| `summary` | No | string | `""` |

**Validation rules:**
- If `session_id` missing → emit `E_MISSING_REQUIRED`
- If `prompt_id` missing → emit `E_MISSING_REQUIRED`
- If `status_outcome` missing → emit `E_MISSING_REQUIRED`
- If `completion_percent` is not a number 0–100 → emit `W_OPTIONAL_MISSING` with context
- Date fields validated as ISO 8601

**Exports:**
- `validateHandoffFrontmatter(data: Record<string, unknown>, filePath: string): { valid: boolean; handoff: Partial<ParsedHandoff> | null; warnings: ParseWarning[] }`

**Test requirements:**
- Valid handoff with all fields → returns valid, zero warnings
- Handoff missing `session_id` → returns invalid, `E_MISSING_REQUIRED`
- Handoff missing optional fields → returns valid with warnings
- Completion percent outside 0–100 → returns valid with warning

---

### E1-S2-T2: Implement a Handoff Frontmatter Validator

**File:** `dashboard/src/parser/extractor.ts` (handoff validation section)

**Input:** Raw file content (string), file path (string)

**Output:** `{ handoff: ParsedHandoff | null; warnings: ParseWarning[] }`

**Specification:**

Same extraction pattern as prompt validation:
1. Extract frontmatter via gray-matter
2. Validate via `validateHandoffFrontmatter()`
3. Map snake_case to camelCase
4. Return typed `ParsedHandoff` and warnings

**Field mapping:**
- `session_id` → `sessionId`
- `prompt_id` → `promptId`
- `status_outcome` → `statusOutcome`
- `completion_percent` → `completionPercent`
- `started_at` → `startedAt`
- `ended_at` → `endedAt`
- `changed_files` → `changedFiles`
- `next_recommended_prompts` → `nextRecommendedPrompts`

**Test requirements:**
- Valid handoff file → correct ParsedHandoff with all fields mapped
- Malformed YAML → null handoff, `E_INVALID_YAML`
- No frontmatter → null handoff, `E_NO_FRONTMATTER`

---

### E1-S2-T3: Create 2+ Example Handoff Files that Conform to the Contract

**Directory:** `tests/fixtures/valid/`

**Specification:**

1. **`tests/fixtures/valid/handoff-complete.md`** — A handoff with all fields populated, `status_outcome: "complete"`, `completion_percent: 100`
2. **`tests/fixtures/valid/handoff-partial.md`** — A handoff with `status_outcome: "partial"`, `completion_percent: 50`, non-empty `blockers`
3. **`tests/fixtures/malformed/handoff-missing-required.md`** — A handoff missing `session_id` (should fail validation)

**Test requirements:**
- Files 1–2 pass validation with zero errors
- File 3 fails validation with `E_MISSING_REQUIRED` error
- Handoff-to-prompt linking: File 1's `prompt_id` matches a prompt fixture's `prompt_id`

---

## 6. E1-S3: Build Markdown Frontmatter Parser

### E1-S3-T1: Implement YAML Frontmatter Extraction from Markdown Files

**File:** `dashboard/src/parser/extractor.ts`

**Input:** `{ filePath: string; content: string }` (from scanner)

**Output:** `{ entity: ParsedPrompt | ParsedHandoff | null; warnings: ParseWarning[] }`

**Specification:**

The extractor is the central Layer 2 component:

1. Accept a file path and raw content string
2. Determine file type from path:
   - `prompts/active/*.md` or `prompts/archive/*.md` → prompt extraction
   - `agents/handoffs/*.md` → handoff extraction
   - `agents/epics/*.md` → delegate to epic-parser (E1-S3-T3)
3. Use `gray-matter(content)` to extract frontmatter and body
4. Dispatch to appropriate validator based on file type
5. Return typed entity and collected warnings

**Exports:**
- `extractFrontmatter(filePath: string, content: string): { entity: ParsedPrompt | ParsedHandoff | null; entityType: 'prompt' | 'handoff'; warnings: ParseWarning[] }`

**Error handling:**
- gray-matter throws on malformed YAML → catch, emit `E_INVALID_YAML`, return null
- No frontmatter delimiters → emit `E_NO_FRONTMATTER`, return null
- Never throw from this function; all errors become ParseWarning entries

**Test requirements:**
- Prompt file → returns ParsedPrompt entity
- Handoff file → returns ParsedHandoff entity
- File with invalid YAML → returns null, `E_INVALID_YAML`
- File with no frontmatter → returns null, `E_NO_FRONTMATTER`
- gray-matter exception is caught, not propagated

---

### E1-S3-T2: Implement Directory Scanner for Epics, Prompts, and Handoffs Folders

**File:** `dashboard/src/parser/scanner.ts`

**Input:** `repoRoot: string` (absolute path to the repo root directory)

**Output:** `{ files: ScannedFile[]; warnings: ParseWarning[] }`

```typescript
interface ScannedFile {
  filePath: string;   // Absolute path
  relativePath: string; // Relative to repo root
  content: string;    // Raw file content
  category: 'prompt' | 'handoff' | 'epic' | 'index' | 'context' | 'schema';
}
```

**Specification:**

The scanner walks the repo directory tree following the discovery order from business rules Section 4.1:

1. **Check required paths exist** (business rules Section 5.1):
   - `prompts/index.md` — Required (emit `E_INDEX_MISSING` if absent)
   - `prompts/active/` — Required (emit error if absent)
   - `agents/epics/` — Required (emit error if absent)
   - `agents/handoffs/` — Required (emit error if absent)
   - `prompts/archive/` — Optional (emit info if absent)

2. **Scan in discovery order:**
   - Read `prompts/index.md` → category `index`
   - Read `prompts/active/*.md` → category `prompt`
   - Read `prompts/archive/*.md` → category `prompt`
   - Read `agents/epics/*.md` → category `epic`
   - Read `agents/handoffs/*.md` → category `handoff`

3. **Path security (R6, R18 mitigation):**
   - Canonicalize all paths with `path.resolve()`
   - Verify all resolved paths start with `repoRoot` prefix
   - Reject paths containing `..` or null bytes
   - Do not follow symlinks (set `followSymlinks: false` in directory listing options)

4. **File filtering:**
   - Only include `.md` files (and `.json` files from `schemas/`)
   - Skip files starting with `.` (hidden files)
   - Skip `prompts/templates/`, `prompts/generated/`, `prompts/draft/` directories

**Exports:**
- `scanRepository(repoRoot: string): Promise<{ files: ScannedFile[]; warnings: ParseWarning[] }>`
- `validateRepoStructure(repoRoot: string): Promise<{ capable: boolean; missingRequired: string[]; missingOptional: string[]; warnings: string[] }>`

**Test requirements:**
- Valid repo structure → returns all expected files in correct categories
- Missing `prompts/index.md` → returns `E_INDEX_MISSING` error
- Missing required directory → returns error warning
- Missing optional directory → returns info warning
- Path traversal attempt (e.g., `../../etc/passwd`) → rejected, warning emitted
- Symlink in scanned directory → not followed
- Empty directory → returns empty file list, no crash
- 250+ files → completes without error (performance fixture)

---

### E1-S3-T3: Build Normalized Graph Model (Epic → Story → Task → Prompt → Handoff)

**File:** `dashboard/src/parser/graph-builder.ts`

**Input:** Arrays of parsed entities: `ParsedPrompt[]`, `ParsedHandoff[]`, `ParsedEpic[]`

**Output:** `DashboardState`

**Specification:**

The graph builder is Layer 3 — it assembles all parsed entities into the normalized `DashboardState`:

1. **Build prompt map:** `Map<promptId, ParsedPrompt>`
2. **Build handoff map:** `Map<promptId, ParsedHandoff[]>` (multiple handoffs per prompt possible, per data contract Section 4.4)
3. **Build reverse task index:** Iterate all prompts → for each `taskId` in `prompt.taskIds`, add to `Map<taskId, promptId[]>` (business rules Section 4.3)
4. **Link handoffs to prompts:** Match `handoff.promptId` to `prompt.promptId` — emit `W_DONE_NO_HANDOFF` for done prompts with no matching handoff
5. **Compute metrics:** Delegate to `metrics.ts` for all rollup computations
6. **Select next prompt:** Delegate to `eligibility.ts` for next-prompt selection
7. **Compute project summary:** Build `ProjectSummary` with counts and health status
8. **Assemble DashboardState:** Combine all computed data into the final output object

**Exports:**
- `buildDashboardState(prompts: ParsedPrompt[], handoffs: ParsedHandoff[], epics: ParsedEpic[], repoPath: string): DashboardState`

**Test requirements:**
- Empty input → returns DashboardState with zero counts, null nextPrompt
- Single prompt + single handoff → correctly linked
- Done prompt with no handoff → `W_DONE_NO_HANDOFF` warning
- Multiple handoffs for same prompt → all preserved in sessions array
- Reverse task index: prompt with `taskIds: ["E1-S1-T1"]` → task index maps T1 → [promptId]
- Epic completion rollup: 3 tasks (2 done, 1 cancelled) → 100% completion
- Health status: no completions → `not_started`; recent completion → `on_track`

---

### E1-S3-T4: Add Graceful Error Handling for Malformed Files

**File:** `dashboard/src/parser/extractor.ts`, `dashboard/src/parser/graph-builder.ts`

**Specification:**

This task ensures the parser never crashes regardless of input:

1. **Extractor level:**
   - Wrap all gray-matter calls in try-catch → emit `E_INVALID_YAML` on exception
   - Validate all field types (e.g., `task_ids` should be array; if string, coerce to single-element array with warning)
   - Handle null, undefined, and unexpected types gracefully
   - Prototype pollution prevention: reject frontmatter keys matching `__proto__`, `constructor`, `prototype` (R17)

2. **Graph builder level:**
   - Handle missing cross-references gracefully (e.g., prompt references non-existent epic → warning, not crash)
   - Handle circular prerequisites → emit warning, skip cycle
   - Handle duplicate prompt IDs → keep first occurrence, emit `W_DUPLICATE_PROMPT`

3. **Scanner level:**
   - File read errors (permissions, encoding) → emit error warning, skip file
   - Binary files → skip, no warning
   - Files exceeding 1MB → skip, emit warning (potential large non-prompt file)

**Test requirements:**
- YAML with `__proto__` key → key rejected, warning emitted
- Array field containing non-string elements → coerced or warned
- Circular prerequisite chain → warning, no infinite loop
- Duplicate prompt IDs → first wins, warning emitted
- Unreadable file → skipped, error warning
- Binary file in prompts directory → skipped gracefully

---

### E1-S3-T5: Write Unit Tests for Parser with Valid and Invalid Inputs

**File:** `tests/parser/extractor.test.ts`, `tests/parser/graph-builder.test.ts`

**Specification:**

This task covers the comprehensive test suite for E1-S3:

**Extractor tests:**
- At least 3 valid prompt fixtures → correct ParsedPrompt output
- At least 2 valid handoff fixtures → correct ParsedHandoff output
- At least 3 malformed fixtures → correct error/warning codes
- At least 2 adversarial fixtures → no crash, appropriate warnings
- All 14 warning codes exercised at least once

**Graph builder tests:**
- Empty state → valid DashboardState with zeros
- Full state (prompts + handoffs + epics) → all links correct
- Partial state (prompts only, no handoffs) → warnings for done prompts
- Edge case: 250+ prompts fixture → completes in <2 seconds

**Coverage target:** ≥90% line coverage for parser modules (per test strategy)

---

## 7. E1-S4: Build Natural Prompt Sequence Sorting

### E1-S4-T1: Implement Numeric Tuple Comparison for Prompt IDs

**File:** `dashboard/src/parser/sorting.ts`

**Input:** Array of `ParsedPrompt` objects (or just prompt ID strings)

**Output:** Sorted array

**Specification:**

1. **Parse prompt ID to tuple:**
   - Split on `.` to get parts
   - Attempt `parseInt()` on each part
   - If all parts are numeric → tuple = `[major, branch, revision]` (e.g., `"16.0.2"` → `[16, 0, 2]`)
   - If any part is non-numeric (e.g., `"00_bootstrap"`) → mark as non-numeric

2. **Sort order:**
   - Non-numeric IDs sort **before** all numeric IDs (alphabetical among themselves)
   - Numeric IDs sort by tuple comparison: compare major, then branch, then revision
   - Stable sort: equal IDs retain original order

3. **Comparison function:**
   - `comparePromptIds(a: string, b: string): number` — returns -1, 0, or 1

4. **Sort function:**
   - `sortPrompts(prompts: ParsedPrompt[]): ParsedPrompt[]` — returns new sorted array (does not mutate input)

**Exports:**
- `parsePromptIdTuple(id: string): { numeric: boolean; tuple: number[]; raw: string }`
- `comparePromptIds(a: string, b: string): number`
- `sortPrompts(prompts: ParsedPrompt[]): ParsedPrompt[]`

**Test requirements:**
- `"1.0.1"` < `"2.0.1"` < `"16.0.2"` → correct order
- `"16.0.1"` < `"16.0.2"` < `"16.1.1"` < `"17.0.1"` → inserted prompt ordering
- `"00_bootstrap"` < `"1.0.1"` → non-numeric before numeric
- `"00_bootstrap"` < `"00_kickoff"` → alphabetical among non-numeric
- Stable sort: two prompts with same ID retain original order
- Empty array → returns empty array
- Single element → returns same element

---

### E1-S4-T2: Write Sort Tests with Edge Cases

**File:** `tests/parser/sorting.test.ts`

**Specification:**

Comprehensive edge case tests:

| Test Case | Input | Expected Output |
|---|---|---|
| Basic ordering | `["2.0.1", "1.0.1", "3.0.1"]` | `["1.0.1", "2.0.1", "3.0.1"]` |
| Insertion ordering | `["16.0.1", "16.0.2", "16.1.1", "17.0.1"]` | Same (already sorted) |
| Mixed non-numeric | `["1.0.1", "00_bootstrap", "2.0.1"]` | `["00_bootstrap", "1.0.1", "2.0.1"]` |
| Branching | `["5.0.1", "5.1.1", "5.0.2"]` | `["5.0.1", "5.0.2", "5.1.1"]` |
| Large numbers | `["100.0.1", "99.0.1"]` | `["99.0.1", "100.0.1"]` |
| Empty | `[]` | `[]` |
| Single | `["1.0.1"]` | `["1.0.1"]` |
| Gaps | `["1.0.1", "5.0.1", "3.0.1"]` | `["1.0.1", "3.0.1", "5.0.1"]` |
| All non-numeric | `["02_prompt_builder", "00_bootstrap", "01_intake"]` | `["00_bootstrap", "01_intake", "02_prompt_builder"]` |

---

## 8. E1-S5: Build Dependency Graph and Eligibility Engine

### E1-S5-T1: Build Prerequisite Resolution Logic Against Prompt Status Map

**File:** `dashboard/src/parser/eligibility.ts`

**Input:** `Map<promptId, ParsedPrompt>`

**Output:** `{ eligible: ParsedPrompt[]; blocked: ParsedPrompt[]; waiting: ParsedPrompt[]; warnings: ParseWarning[] }`

**Specification:**

1. For each prompt in the map:
   - If `status` is terminal (`done`, `superseded`, `cancelled`) → skip (not eligible)
   - If `status` is not `ready` → skip (only `ready` prompts are eligible per BR 3.1)
   - If `sourcePath` is in `prompts/archive/` → skip (must be in `active/` per BR 3.1)
   - Check each `prerequisite`:
     - If prerequisite prompt exists and has `status: done` → prerequisite met
     - If prerequisite prompt does not exist → emit `W_PREREQ_NOT_FOUND`, treat as unmet
     - If prerequisite prompt exists but not done → prerequisite unmet
   - If all prerequisites met and prompt is not blocked → **eligible**
   - If prompt has unmet prerequisites → **waiting**
   - If prompt is `blocked` → **blocked**

2. Categorize all prompts into eligible, blocked, and waiting sets

**Exports:**
- `resolvePrerequisites(prompts: Map<string, ParsedPrompt>): { eligible: ParsedPrompt[]; blocked: ParsedPrompt[]; waiting: ParsedPrompt[]; warnings: ParseWarning[] }`
- `checkPrerequisites(prompt: ParsedPrompt, promptMap: Map<string, ParsedPrompt>): { met: boolean; metCount: number; totalCount: number; unmet: string[] }`

**Test requirements:**
- Prompt with all prerequisites done → eligible
- Prompt with one prerequisite not done → waiting
- Prompt with non-existent prerequisite → warning, not eligible
- Prompt in archive → not eligible regardless of status
- Prompt with status `in_progress` → not eligible
- Prompt with status `blocked` → in blocked set
- Empty prompt map → empty results, no crash

---

### E1-S5-T2: Implement Next-Prompt Selection Algorithm

**File:** `dashboard/src/parser/eligibility.ts`

**Input:** `eligible: ParsedPrompt[]` (from T1), full prompt map

**Output:** `NextPromptInfo | null`

**Specification:**

Per business rules Section 3.2:

1. Sort eligible prompts using `comparePromptIds()` from sorting module
2. Select the first prompt (lowest natural sort order)
3. **Tiebreaker:** If two prompts share the same tuple prefix, prefer the one with fewer unresolved downstream dependencies (i.e., the one that unblocks the most work)
4. Build `NextPromptInfo` object:
   - Count eligible prompts
   - Count downstream prompts the selection unblocks
   - Generate rationale string per BR 3.3 format
5. If no eligible prompts → return null and populate `noEligibleRationale` on SummaryMetrics

**Rationale string format:**
```
"Prompt {prompt_id} is next because: all {n} prerequisites are met,
it has the lowest sequence number among {m} eligible prompts,
and it unblocks {k} downstream prompt(s)."
```

**No-eligible format:**
```
"No prompts are currently eligible. {n} prompt(s) are blocked,
{m} are awaiting prerequisite completion."
```

**Exports:**
- `selectNextPrompt(eligible: ParsedPrompt[], promptMap: Map<string, ParsedPrompt>): NextPromptInfo | null`
- `generateRationale(prompt: ParsedPrompt, eligibleCount: number, promptMap: Map<string, ParsedPrompt>): string`
- `generateNoEligibleRationale(blockedCount: number, waitingCount: number): string`

**Test requirements:**
- 3 eligible prompts → selects lowest sort order
- No eligible prompts → returns null, generates no-eligible rationale
- Tiebreaker: two prompts with same prefix → one with more downstream selected
- Rationale string matches expected format exactly
- Single eligible prompt → selected with correct rationale

---

### E1-S5-T3: Implement Downstream Impact Detection for Inserted Prompts

**File:** `dashboard/src/parser/eligibility.ts`

**Input:** Full prompt map

**Output:** `Map<promptId, string[]>` — maps each prompt to the prompt IDs that depend on it (downstream)

**Specification:**

1. Build a downstream dependency map: for each prompt, collect all prompts that list it as a prerequisite
2. Detect insertion impacts: when a prompt has `insertedAfter` set, verify that downstream prompts still have correct prerequisite chains
3. Flag prompts whose prerequisites reference non-existent prompt IDs → emit `W_PREREQ_NOT_FOUND`

**Exports:**
- `buildDownstreamMap(prompts: Map<string, ParsedPrompt>): Map<string, string[]>`
- `detectInsertionImpacts(prompts: Map<string, ParsedPrompt>): ParseWarning[]`

**Test requirements:**
- Linear chain A→B→C → downstream map shows A unblocks B, B unblocks C
- Inserted prompt → correctly placed in chain
- Prerequisite referencing non-existent prompt → `W_PREREQ_NOT_FOUND`
- Prompt with no downstream → empty array in map

---

### E1-S5-T4: Write Integration Tests with a Multi-Prompt Dependency Graph

**File:** `tests/parser/eligibility.test.ts`

**Specification:**

Integration test scenarios (each uses a complete set of fixture prompts):

1. **Linear chain:** 5 prompts in sequence, first 2 done → prompt 3 is next
2. **Branching prerequisites:** Prompt requires 2 prerequisites, only 1 done → not eligible
3. **Inserted prompt:** Insert prompt 5.0.2 after 5.0.1 → verify sort order and downstream updates
4. **All blocked:** All remaining prompts are blocked → null next prompt, correct rationale
5. **Empty repo:** Zero prompts → null next prompt, "0 blocked, 0 waiting" rationale
6. **Complex graph:** 10+ prompts with branching and merging → correct next-prompt selection
7. **All done:** All prompts are done → null next prompt, no warnings

---

## 9. E1-S6: Build JSON State Emitter and CLI

### E1-S6-T1: Implement JSON Serialization of the Normalized Graph Model

**File:** `dashboard/src/parser/index.ts`

**Input:** `repoPath: string`

**Output:** `DashboardState` (as TypeScript object) or serialized JSON string

**Specification:**

The parser entry point orchestrates all three layers:

1. Call `scanRepository(repoPath)` → get scanned files
2. Call `extractFrontmatter()` for each scanned file → get typed entities
3. Parse `prompts/index.md` via `parseIndexMd()` → build canonical registry
4. Parse epic files via `parseEpicsFile()` → get epics/stories/tasks
5. Call `buildDashboardState()` → assemble final state
6. Return the `DashboardState` object

**Exports:**
- `parse(repoPath: string): Promise<DashboardState>` — main entry point
- `parseToJson(repoPath: string): Promise<string>` — serializes to JSON string

**JSON output contract:**
- All dates are ISO 8601 strings
- All arrays are present (never undefined; empty arrays for missing data)
- All string fields are present (never undefined; empty string for missing data)
- Numbers are never NaN or Infinity (use 0 as fallback)
- Output is deterministic: same input always produces identical JSON

**Test requirements:**
- Known fixture repo → snapshot test against expected JSON
- Empty repo → valid DashboardState with zeros
- Determinism: parse same repo twice → identical output
- JSON is valid (parseable by `JSON.parse()`)

---

### E1-S6-T2: Conform Output Schema to Dashboard State Interface

**File:** `dashboard/src/parser/index.ts`, `schemas/dashboard-state.example.json`

**Specification:**

1. The `DashboardState` TypeScript interface (defined in types.ts) is the normative specification for the output schema
2. The existing `schemas/dashboard-state.example.json` is demoted to a non-normative example
3. Add a comment at the top of the example JSON noting it is illustrative only
4. The parser must produce output that satisfies the `DashboardState` interface — this is enforced by TypeScript compilation
5. Add a runtime validation that the output object has all required top-level keys

**Test requirements:**
- Parser output conforms to DashboardState interface (TypeScript compilation check)
- All top-level keys present in output: `project`, `summary`, `nextPrompt`, `epics`, `prompts`, `sessions`, `warnings`, `taskIndex`
- No extra keys in output (strict interface conformance)

---

### E1-S6-T3: Add CLI Entry Point for State Generation

**File:** `dashboard/bin/dashboard-parse.ts`

**Input:** Command-line arguments

**Output:** JSON file or stdout

**Specification:**

CLI invocation: `npx dashboard-parse --repo <path> --output <json-path>`

**Arguments:**

| Argument | Required? | Description | Default |
|---|---|---|---|
| `--repo <path>` | No | Path to the repository root | Current working directory |
| `--output <path>` | No | Path to write JSON output | stdout |
| `--pretty` | No | Pretty-print JSON output | false |
| `--quiet` | No | Suppress info-level warnings | false |
| `--version` | No | Print version and exit | — |
| `--help` | No | Print usage and exit | — |

**Behavior:**
1. Parse command-line arguments (use a lightweight arg parser — `minimist` or built-in `node:util.parseArgs`)
2. Resolve `--repo` path to absolute path
3. Call `parse(repoPath)` to generate DashboardState
4. If `--output` provided → write JSON to file
5. If no `--output` → write JSON to stdout
6. If `--pretty` → indent JSON with 2 spaces
7. Print warning summary to stderr (count of errors, warnings, info)
8. Exit code: 0 if no errors; 1 if any error-level warnings exist

**Exports:**
- This file is a script entry point, not a library module
- Package.json `bin` field should map `dashboard-parse` to this file

**Test requirements:**
- `--help` prints usage, exits 0
- `--version` prints version, exits 0
- `--repo <valid-path>` → writes valid JSON to stdout
- `--repo <valid-path> --output <file>` → writes JSON to file
- `--repo <invalid-path>` → prints error to stderr, exits 1
- `--pretty` → output is indented JSON
- No arguments → uses cwd as repo path

---

### E1-S6-T4: Write Snapshot Tests Comparing Emitter Output Against Expected JSON

**File:** `tests/parser/snapshot.test.ts`

**Specification:**

1. Create a complete fixture repository in `tests/fixtures/snapshot-repo/` containing:
   - `prompts/index.md` with a known set of prompts
   - `prompts/active/` with 3–5 prompt files
   - `prompts/archive/` with 1–2 archived prompts
   - `agents/epics/` with 1 epics file
   - `agents/handoffs/` with 2–3 handoff files

2. Run the parser against this fixture repo
3. Compare output against a stored snapshot file `tests/fixtures/snapshots/expected-state.json`
4. Use Jest snapshot testing (`toMatchSnapshot()`) or exact JSON comparison

**Snapshot must verify:**
- Correct prompt count and status distribution
- Correct epic/story/task hierarchy
- Correct handoff-to-prompt linking
- Correct next-prompt selection and rationale
- Correct completion rollup percentages
- Correct warning list
- Correct reverse task index

**Update policy:** Snapshots are updated only when the parser specification changes. CI fails on snapshot mismatch.

**Test requirements:**
- Snapshot matches expected output exactly
- Adding a prompt to the fixture → snapshot must be updated
- Removing a prompt → snapshot must be updated
- Parser output is deterministic across runs

---

## 10. CLI Entry Point Specification

### Package Configuration

In `dashboard/package.json`:

```json
{
  "name": "project-manager-dashboard",
  "bin": {
    "dashboard-parse": "./bin/dashboard-parse.ts"
  },
  "scripts": {
    "parse": "tsx bin/dashboard-parse.ts",
    "parse:json": "tsx bin/dashboard-parse.ts --output dashboard-state.json --pretty"
  }
}
```

### Usage Examples

```bash
# Parse current directory, output to stdout
npx dashboard-parse

# Parse specific repo, write to file
npx dashboard-parse --repo /path/to/repo --output state.json

# Parse with pretty output
npx dashboard-parse --repo . --output state.json --pretty

# Parse quietly (suppress info warnings)
npx dashboard-parse --repo . --quiet
```

---

## 11. Cross-Cutting Concerns

### Security Requirements (from security review findings)

All parser modules must enforce:

1. **Path traversal prevention (HIGH-001, R6):**
   - All file paths canonicalized with `path.resolve()`
   - All resolved paths verified to start with `repoRoot`
   - Reject paths containing `..`, null bytes (`\0`)
   - Implemented in: `scanner.ts`

2. **Symlink traversal prevention (MED-002, R18):**
   - `fs.readdir()` and `fs.readFile()` calls must not follow symlinks
   - Use `lstat()` to check for symlinks before reading
   - Implemented in: `scanner.ts`

3. **Prototype pollution prevention (R17):**
   - Reject YAML keys matching `__proto__`, `constructor`, `prototype`
   - Use `Object.create(null)` for lookup maps
   - Implemented in: `extractor.ts`

4. **Input size limits:**
   - Skip files larger than 1MB
   - Limit total scanned files to 1000 (emit warning if exceeded)
   - Implemented in: `scanner.ts`

### Performance Requirements (from test strategy)

- Parser must handle 250+ prompt files in <2 seconds
- Performance benchmark test in `tests/parser/performance.test.ts`
- Use fixture generator to create 250+ prompt files for testing

### Determinism Requirement

- Same repo state → identical JSON output on every run
- No timestamps, random values, or non-deterministic ordering in output (except `lastParsedAt` which is the parse run timestamp)
- Sort all arrays deterministically before output

---

## 12. Test Fixture Requirements

### Fixture Categories (from test strategy)

| Category | Directory | Purpose |
|---|---|---|
| Valid | `tests/fixtures/valid/` | Conformant prompts, handoffs, epics |
| Malformed | `tests/fixtures/malformed/` | Missing fields, bad YAML |
| Adversarial | `tests/fixtures/adversarial/` | Path traversal, YAML injection, prototype pollution |
| Edge Case | `tests/fixtures/edge-case/` | Empty files, Unicode, very long fields |
| Epics | `tests/fixtures/epics/` | Combined markdown format test files |
| Index MD | `tests/fixtures/index-md/` | prompts/index.md format variations |
| Snapshot Repo | `tests/fixtures/snapshot-repo/` | Complete mini-repo for snapshot tests |
| Performance | `tests/fixtures/performance/` | Generated 250+ prompt files |

### Minimum Fixture Count

| Fixture Type | Minimum Count |
|---|---|
| Valid prompts | 5 |
| Valid handoffs | 3 |
| Malformed prompts | 5 |
| Malformed handoffs | 2 |
| Adversarial files | 4 |
| Edge case files | 4 |
| Epic format files | 3 |
| Index.md variations | 3 |

---

## Appendix: Task Summary

| Task ID | Story | Title | File(s) |
|---|---|---|---|
| E1-S1-T1 | E1-S1 | Define canonical YAML schema for prompt frontmatter | `schemas/prompt-schema.ts` |
| E1-S1-T2 | E1-S1 | Implement frontmatter validator | `extractor.ts` |
| E1-S1-T3 | E1-S1 | Create example prompt fixtures | `tests/fixtures/valid/`, `tests/fixtures/malformed/` |
| E1-S2-T1 | E1-S2 | Define canonical YAML schema for handoff frontmatter | `schemas/handoff-schema.ts` |
| E1-S2-T2 | E1-S2 | Implement handoff frontmatter validator | `extractor.ts` |
| E1-S2-T3 | E1-S2 | Create example handoff fixtures | `tests/fixtures/valid/`, `tests/fixtures/malformed/` |
| E1-S3-T1 | E1-S3 | Implement YAML frontmatter extraction | `extractor.ts` |
| E1-S3-T2 | E1-S3 | Implement directory scanner | `scanner.ts` |
| E1-S3-T3 | E1-S3 | Build normalized graph model | `graph-builder.ts` |
| E1-S3-T4 | E1-S3 | Add graceful error handling | `extractor.ts`, `graph-builder.ts` |
| E1-S3-T5 | E1-S3 | Write unit tests for parser | `tests/parser/*.test.ts` |
| E1-S4-T1 | E1-S4 | Implement numeric tuple comparison | `sorting.ts` |
| E1-S4-T2 | E1-S4 | Write sort tests with edge cases | `tests/parser/sorting.test.ts` |
| E1-S5-T1 | E1-S5 | Build prerequisite resolution logic | `eligibility.ts` |
| E1-S5-T2 | E1-S5 | Implement next-prompt selection algorithm | `eligibility.ts` |
| E1-S5-T3 | E1-S5 | Implement downstream impact detection | `eligibility.ts` |
| E1-S5-T4 | E1-S5 | Write integration tests for dependency graph | `tests/parser/eligibility.test.ts` |
| E1-S6-T1 | E1-S6 | Implement JSON serialization | `index.ts` |
| E1-S6-T2 | E1-S6 | Conform output to DashboardState interface | `index.ts` |
| E1-S6-T3 | E1-S6 | Add CLI entry point | `bin/dashboard-parse.ts` |
| E1-S6-T4 | E1-S6 | Write snapshot tests | `tests/parser/snapshot.test.ts` |
