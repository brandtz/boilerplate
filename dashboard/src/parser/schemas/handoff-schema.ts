import type { ParseWarning, ParsedHandoff } from '../types';
import { createWarning } from '../warnings';

const REQUIRED_FIELDS = ['session_id', 'prompt_id', 'status_outcome'] as const;

const DATE_FIELDS = ['started_at', 'ended_at'] as const;

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

export interface HandoffValidationResult {
  valid: boolean;
  handoff: Partial<ParsedHandoff> | null;
  warnings: ParseWarning[];
}

export function validateHandoffFrontmatter(
  data: Record<string, unknown>,
  filePath: string,
): HandoffValidationResult {
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
    return { valid, handoff: null, warnings };
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

  // Validate completion_percent
  const completionPercent = Number(data.completion_percent ?? 0);
  if (data.completion_percent !== undefined && data.completion_percent !== null) {
    if (isNaN(completionPercent) || completionPercent < 0 || completionPercent > 100) {
      warnings.push(createWarning(filePath, 'W_OPTIONAL_MISSING', `Field 'completion_percent' should be 0-100, got '${data.completion_percent}'`, 'warning'));
    }
  }

  const handoff: Partial<ParsedHandoff> = {
    sessionId: ensureString(data.session_id),
    promptId: ensureString(data.prompt_id),
    role: ensureString(data.role),
    statusOutcome: ensureString(data.status_outcome),
    completionPercent: isNaN(completionPercent) ? 0 : completionPercent,
    startedAt: ensureString(data.started_at),
    endedAt: ensureString(data.ended_at),
    changedFiles: ensureStringArray(data.changed_files),
    blockers: ensureStringArray(data.blockers),
    nextRecommendedPrompts: ensureStringArray(data.next_recommended_prompts),
    summary: ensureString(data.summary),
  };

  return { valid: true, handoff, warnings };
}
