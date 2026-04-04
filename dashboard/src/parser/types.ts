// ============================================================================
// Parser Module — TypeScript Interfaces
//
// Single source of truth for all parser types.
// Defined per ADR-002, data contract, and technical tasks (9.0.1).
// Re-exported via src/types/index.ts for UI consumption.
// ============================================================================

// --- Status types ---

export type PromptStatus =
  | 'draft'
  | 'ready'
  | 'in_progress'
  | 'in_review'
  | 'blocked'
  | 'done'
  | 'superseded'
  | 'cancelled';

// --- Parser warning/error ---

export interface ParseWarning {
  /** Relative path to the source file (from repo root) */
  file: string;
  /** Optional line number where the issue was detected */
  line?: number;
  /** Machine-readable warning code (see warning taxonomy) */
  code: string;
  /** Human-readable description of the issue */
  message: string;
  /** Severity level */
  severity: 'error' | 'warning' | 'info';
}

// --- Warning codes (aligned with business rules Section 4.5) ---

export const WARNING_CODES = {
  E_NO_FRONTMATTER: 'E_NO_FRONTMATTER',
  E_MISSING_REQUIRED: 'E_MISSING_REQUIRED',
  E_INDEX_MISSING: 'E_INDEX_MISSING',
  E_INVALID_YAML: 'E_INVALID_YAML',
  W_OPTIONAL_MISSING: 'W_OPTIONAL_MISSING',
  W_UNKNOWN_STATUS: 'W_UNKNOWN_STATUS',
  W_PREREQ_NOT_FOUND: 'W_PREREQ_NOT_FOUND',
  W_DONE_NO_HANDOFF: 'W_DONE_NO_HANDOFF',
  W_FILE_NOT_IN_INDEX: 'W_FILE_NOT_IN_INDEX',
  W_INDEX_NO_FILE: 'W_INDEX_NO_FILE',
  W_DUPLICATE_PROMPT: 'W_DUPLICATE_PROMPT',
  W_INVALID_DATE: 'W_INVALID_DATE',
  W_EPIC_PARSE_FAIL: 'W_EPIC_PARSE_FAIL',
  I_PARSED_OK: 'I_PARSED_OK',
} as const;

export type WarningCode = (typeof WARNING_CODES)[keyof typeof WARNING_CODES];

// --- Parsed entities ---

export interface ParsedPrompt {
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

  // Lifecycle fields (ADR-002 Condition 4, data contract 1.1)
  sessionHandoff: string;
  supersedes: string;
  supersededBy: string;
  insertReason: string;
  completedAt: string;
  archivedAt: string;

  /** Markdown content after frontmatter */
  body: string;
  /** File path relative to repo root */
  sourcePath: string;
}

export interface ParsedHandoff {
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

export interface ParsedEpic {
  epicId: string;
  title: string;
  status: string;
  stories: ParsedStory[];
}

export interface ParsedStory {
  storyId: string;
  epicId: string;
  title: string;
  status: string;
  acceptanceCriteria: string[];
  tasks: ParsedTask[];
}

export interface ParsedTask {
  taskId: string;
  storyId: string;
  epicId: string;
  title: string;
  status: string;
}

// --- Dashboard state ---

export interface ProjectSummary {
  /** Extracted from prompts/index.md heading */
  projectName: string;
  /** Absolute path to the repo root */
  repoPath: string;
  /** ISO 8601 timestamp of this parse run */
  lastParsedAt: string;
  totalEpics: number;
  totalStories: number;
  totalTasks: number;
  totalPrompts: number;
  totalHandoffs: number;
  /** Health computed per business rules Section 9.1 */
  healthStatus: 'on_track' | 'at_risk' | 'blocked' | 'not_started';
}

export interface SummaryMetrics {
  /** Prompt status counts (business rules Section 1.1) */
  promptsByStatus: Record<PromptStatus, number>;

  /** (done_tasks / (total_tasks - cancelled_tasks)) × 100 */
  scopeCompletionPercent: number;
  /** (done_prompts / (total_prompts - superseded - cancelled)) × 100 */
  executionCompletionPercent: number;

  /** Epic completion percentages (business rules Section 2.3) */
  epicCompletionPercents: Record<string, number>;

  activePrompts: number;
  completedPrompts: number;
  blockedPrompts: number;
  supersededPrompts: number;
  cancelledPrompts: number;

  /** Grouped by handoff ended_at dates (business rules Section 6.1) */
  completionTimeline: TimelineDataPoint[];

  /** Message when no prompts are eligible, null otherwise */
  noEligibleRationale: string | null;
}

export interface TimelineDataPoint {
  /** ISO 8601 date (YYYY-MM-DD) */
  date: string;
  /** Cumulative done prompts at this date */
  cumulativeCompleted: number;
  /** Total - cumulative done at this date */
  remainingPrompts: number;
}

export interface NextPromptInfo {
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
  /** Human-readable rationale string per BR Section 3.3 */
  rationale: string;
  /** Full prompt markdown content */
  body: string;
}

export interface ReverseTaskIndex {
  /** Maps task ID to array of prompt IDs that reference it */
  [taskId: string]: string[];
}

export interface DashboardState {
  project: ProjectSummary;
  summary: SummaryMetrics;
  nextPrompt: NextPromptInfo | null;
  epics: ParsedEpic[];
  prompts: ParsedPrompt[];
  sessions: ParsedHandoff[];
  warnings: ParseWarning[];
  taskIndex: ReverseTaskIndex;
}
