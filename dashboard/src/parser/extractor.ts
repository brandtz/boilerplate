import matter from 'gray-matter';
import type { ParseWarning, ParsedPrompt, ParsedHandoff } from './types';
import { createWarning } from './warnings';
import { validatePromptFrontmatter } from './schemas/prompt-schema';
import { validateHandoffFrontmatter } from './schemas/handoff-schema';

export type EntityType = 'prompt' | 'handoff';

export interface ExtractedPrompt {
  entity: ParsedPrompt;
  entityType: 'prompt';
  warnings: ParseWarning[];
}

export interface ExtractedHandoff {
  entity: ParsedHandoff;
  entityType: 'handoff';
  warnings: ParseWarning[];
}

export interface ExtractedNull {
  entity: null;
  entityType: EntityType;
  warnings: ParseWarning[];
}

export type ExtractionResult = ExtractedPrompt | ExtractedHandoff | ExtractedNull;

/** Keys that must be rejected to prevent prototype pollution (R17). */
const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];

/**
 * Check frontmatter data for prototype pollution keys.
 */
function checkPrototypePollution(data: Record<string, unknown>, filePath: string): ParseWarning[] {
  const warnings: ParseWarning[] = [];
  for (const key of Object.keys(data)) {
    if (DANGEROUS_KEYS.includes(key)) {
      warnings.push(createWarning(filePath, 'E_INVALID_YAML', `Dangerous key '${key}' rejected (prototype pollution prevention)`, 'error'));
      delete data[key];
    }
  }
  return warnings;
}

/**
 * Extract and validate a prompt file's frontmatter.
 */
export function extractPrompt(filePath: string, content: string): { prompt: ParsedPrompt | null; warnings: ParseWarning[] } {
  const warnings: ParseWarning[] = [];

  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(content);
  } catch {
    warnings.push(createWarning(filePath, 'E_INVALID_YAML', `Failed to parse YAML frontmatter`, 'error'));
    return { prompt: null, warnings };
  }

  // Check if frontmatter exists
  if (!parsed.data || Object.keys(parsed.data).length === 0) {
    // Check if the file has frontmatter delimiters at all
    if (!content.trimStart().startsWith('---')) {
      warnings.push(createWarning(filePath, 'E_NO_FRONTMATTER', `File has no YAML frontmatter`, 'error'));
      return { prompt: null, warnings };
    }
  }

  const data = parsed.data as Record<string, unknown>;

  // Prototype pollution check
  warnings.push(...checkPrototypePollution(data, filePath));

  // Validate against schema
  const result = validatePromptFrontmatter(data, filePath);
  warnings.push(...result.warnings);

  if (!result.valid || !result.prompt) {
    return { prompt: null, warnings };
  }

  // Build full ParsedPrompt with body and sourcePath
  const prompt: ParsedPrompt = {
    promptId: result.prompt.promptId ?? '',
    title: result.prompt.title ?? '',
    phase: result.prompt.phase ?? '',
    status: result.prompt.status ?? 'draft',
    epicId: result.prompt.epicId ?? '',
    storyId: result.prompt.storyId ?? '',
    taskIds: result.prompt.taskIds ?? [],
    role: result.prompt.role ?? '',
    prerequisites: result.prompt.prerequisites ?? [],
    requiredReading: result.prompt.requiredReading ?? [],
    downstreamPrompts: result.prompt.downstreamPrompts ?? [],
    insertedAfter: result.prompt.insertedAfter ?? null,
    affectsPrompts: result.prompt.affectsPrompts ?? [],
    reviewRequired: result.prompt.reviewRequired ?? [],
    createdAt: result.prompt.createdAt ?? '',
    updatedAt: result.prompt.updatedAt ?? '',
    sessionHandoff: result.prompt.sessionHandoff ?? '',
    supersedes: result.prompt.supersedes ?? '',
    supersededBy: result.prompt.supersededBy ?? '',
    insertReason: result.prompt.insertReason ?? '',
    completedAt: result.prompt.completedAt ?? '',
    archivedAt: result.prompt.archivedAt ?? '',
    body: parsed.content,
    sourcePath: filePath,
  };

  return { prompt, warnings };
}

/**
 * Extract and validate a handoff file's frontmatter.
 */
export function extractHandoff(filePath: string, content: string): { handoff: ParsedHandoff | null; warnings: ParseWarning[] } {
  const warnings: ParseWarning[] = [];

  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(content);
  } catch {
    warnings.push(createWarning(filePath, 'E_INVALID_YAML', `Failed to parse YAML frontmatter`, 'error'));
    return { handoff: null, warnings };
  }

  if (!parsed.data || Object.keys(parsed.data).length === 0) {
    if (!content.trimStart().startsWith('---')) {
      warnings.push(createWarning(filePath, 'E_NO_FRONTMATTER', `File has no YAML frontmatter`, 'error'));
      return { handoff: null, warnings };
    }
  }

  const data = parsed.data as Record<string, unknown>;

  // Prototype pollution check
  warnings.push(...checkPrototypePollution(data, filePath));

  const result = validateHandoffFrontmatter(data, filePath);
  warnings.push(...result.warnings);

  if (!result.valid || !result.handoff) {
    return { handoff: null, warnings };
  }

  const handoff: ParsedHandoff = {
    sessionId: result.handoff.sessionId ?? '',
    promptId: result.handoff.promptId ?? '',
    role: result.handoff.role ?? '',
    statusOutcome: result.handoff.statusOutcome ?? '',
    completionPercent: result.handoff.completionPercent ?? 0,
    startedAt: result.handoff.startedAt ?? '',
    endedAt: result.handoff.endedAt ?? '',
    changedFiles: result.handoff.changedFiles ?? [],
    blockers: result.handoff.blockers ?? [],
    nextRecommendedPrompts: result.handoff.nextRecommendedPrompts ?? [],
    summary: result.handoff.summary ?? '',
    sourcePath: filePath,
  };

  return { handoff, warnings };
}

/**
 * Extract frontmatter from a file, dispatching to correct validator by type.
 */
export function extractFrontmatter(filePath: string, content: string): ExtractionResult {
  // Determine type from path
  const normalizedPath = filePath.replace(/\\/g, '/');

  if (normalizedPath.includes('agents/handoffs/')) {
    const { handoff, warnings } = extractHandoff(filePath, content);
    if (handoff) {
      return { entity: handoff, entityType: 'handoff', warnings };
    }
    return { entity: null, entityType: 'handoff', warnings };
  }

  // Default to prompt extraction for prompts/active, prompts/archive, and other paths
  const { prompt, warnings } = extractPrompt(filePath, content);
  if (prompt) {
    return { entity: prompt, entityType: 'prompt', warnings };
  }
  return { entity: null, entityType: 'prompt', warnings };
}
