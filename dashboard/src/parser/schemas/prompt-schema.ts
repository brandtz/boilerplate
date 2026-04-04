import type { ParseWarning, ParsedPrompt, PromptStatus } from '../types';
import { createWarning } from '../warnings';

const VALID_STATUSES: PromptStatus[] = [
  'draft', 'ready', 'in_progress', 'in_review',
  'blocked', 'done', 'superseded', 'cancelled',
];

const REQUIRED_FIELDS = ['prompt_id', 'title', 'status'] as const;

const DATE_FIELDS = ['created_at', 'updated_at', 'completed_at', 'archived_at'] as const;

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;

function ensureString(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val);
}

function ensureStringArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(v => String(v));
  if (typeof val === 'string') return [val];
  return [];
}

export interface PromptValidationResult {
  valid: boolean;
  prompt: Partial<ParsedPrompt> | null;
  warnings: ParseWarning[];
}

export function validatePromptFrontmatter(
  data: Record<string, unknown>,
  filePath: string,
): PromptValidationResult {
  const warnings: ParseWarning[] = [];
  let valid = true;

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      warnings.push(createWarning(filePath, 'E_MISSING_REQUIRED', `Required field '${field}' is missing`, 'error'));
      valid = false;
    }
  }

  if (!valid) {
    return { valid, prompt: null, warnings };
  }

  const status = ensureString(data.status);

  // Validate status value
  if (!VALID_STATUSES.includes(status as PromptStatus)) {
    warnings.push(createWarning(filePath, 'W_UNKNOWN_STATUS', `Unknown status '${status}'`, 'warning'));
  }

  // Validate date fields
  for (const field of DATE_FIELDS) {
    const value = data[field];
    if (value !== undefined && value !== null && value !== '') {
      const strVal = String(value);
      if (!ISO_DATE_RE.test(strVal)) {
        warnings.push(createWarning(filePath, 'W_INVALID_DATE', `Field '${field}' is not valid ISO 8601: '${strVal}'`, 'warning'));
      }
    }
  }

  // Done prompt missing completed_at
  if (status === 'done' && (!data.completed_at || data.completed_at === '')) {
    warnings.push(createWarning(filePath, 'W_OPTIONAL_MISSING', `Done prompt is missing 'completed_at'`, 'warning'));
  }

  // Build partial prompt
  const prompt: Partial<ParsedPrompt> = {
    promptId: ensureString(data.prompt_id),
    title: ensureString(data.title),
    phase: ensureString(data.phase),
    status: status as PromptStatus,
    epicId: ensureString(data.epic_id),
    storyId: ensureString(data.story_id),
    taskIds: ensureStringArray(data.task_ids),
    role: ensureString(data.owner_role),
    prerequisites: ensureStringArray(data.prerequisites),
    requiredReading: ensureStringArray(data.required_reading),
    downstreamPrompts: ensureStringArray(data.downstream_prompts),
    insertedAfter: data.inserted_after != null ? ensureString(data.inserted_after) : null,
    affectsPrompts: ensureStringArray(data.affects_prompts),
    reviewRequired: ensureStringArray(data.review_required),
    createdAt: ensureString(data.created_at),
    updatedAt: ensureString(data.updated_at),
    sessionHandoff: ensureString(data.session_handoff),
    supersedes: ensureString(data.supersedes),
    supersededBy: ensureString(data.superseded_by),
    insertReason: ensureString(data.insert_reason),
    completedAt: ensureString(data.completed_at),
    archivedAt: ensureString(data.archived_at),
  };

  return { valid: true, prompt, warnings };
}
