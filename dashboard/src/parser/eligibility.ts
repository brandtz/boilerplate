/**
 * Next-Prompt Selection Algorithm and Dependency Engine
 *
 * Filters eligible prompts (ready + prerequisites met + not archived),
 * sorts by sequence, selects the next prompt, generates rationale,
 * builds downstream dependency map, and detects insertion impacts.
 */

import type {
  ParsedPrompt,
  ParseWarning,
  NextPromptInfo,
} from './types';
import { createWarning } from './warnings';
import { comparePromptIds } from './sorting';

export interface PrerequisiteCheck {
  met: boolean;
  metCount: number;
  totalCount: number;
  unmet: string[];
}

export interface ResolvedPrompts {
  eligible: ParsedPrompt[];
  blocked: ParsedPrompt[];
  waiting: ParsedPrompt[];
  warnings: ParseWarning[];
}

const TERMINAL_STATUSES = new Set(['done', 'superseded', 'cancelled']);

/**
 * Check if all prerequisites for a single prompt are met.
 */
export function checkPrerequisites(
  prompt: ParsedPrompt,
  promptMap: Map<string, ParsedPrompt>,
): PrerequisiteCheck {
  const unmet: string[] = [];
  let metCount = 0;
  for (const prereqId of prompt.prerequisites) {
    const prereq = promptMap.get(prereqId);
    if (prereq && prereq.status === 'done') {
      metCount++;
    } else {
      unmet.push(prereqId);
    }
  }
  return {
    met: unmet.length === 0,
    metCount,
    totalCount: prompt.prerequisites.length,
    unmet,
  };
}

/**
 * Resolve all prompts into eligible, blocked, and waiting sets.
 * Only `ready` prompts in `prompts/active/` with all prerequisites done are eligible.
 */
export function resolvePrerequisites(
  prompts: Map<string, ParsedPrompt>,
): ResolvedPrompts {
  const eligible: ParsedPrompt[] = [];
  const blocked: ParsedPrompt[] = [];
  const waiting: ParsedPrompt[] = [];
  const warnings: ParseWarning[] = [];

  for (const prompt of prompts.values()) {
    // Terminal prompts are not eligible
    if (TERMINAL_STATUSES.has(prompt.status)) continue;

    // Only ready prompts are eligible per BR 3.1
    if (prompt.status === 'blocked') {
      blocked.push(prompt);
      continue;
    }

    if (prompt.status !== 'ready') continue;

    // Must be in active/ per BR 3.1
    if (prompt.sourcePath.includes('archive/')) continue;

    // Check prerequisites
    for (const prereqId of prompt.prerequisites) {
      if (!prompts.has(prereqId)) {
        warnings.push(createWarning(
          prompt.sourcePath,
          'W_PREREQ_NOT_FOUND',
          `Prerequisite '${prereqId}' not found for prompt '${prompt.promptId}'`,
          'warning',
        ));
      }
    }

    const check = checkPrerequisites(prompt, prompts);
    if (check.met) {
      eligible.push(prompt);
    } else {
      waiting.push(prompt);
    }
  }

  return { eligible, blocked, waiting, warnings };
}

/**
 * Count how many downstream prompts a given prompt unblocks.
 */
function countDownstream(promptId: string, promptMap: Map<string, ParsedPrompt>): number {
  let count = 0;
  for (const p of promptMap.values()) {
    if (p.prerequisites.includes(promptId)) {
      count++;
    }
  }
  return count;
}

/**
 * Select the next prompt from eligible prompts.
 * Picks the lowest natural sort order; tiebreaker: most downstream unblocks.
 */
export function selectNextPrompt(
  eligible: ParsedPrompt[],
  promptMap: Map<string, ParsedPrompt>,
): NextPromptInfo | null {
  if (eligible.length === 0) return null;

  // Sort eligible by prompt ID
  const sorted = [...eligible].sort((a, b) => comparePromptIds(a.promptId, b.promptId));

  // Tiebreaker: if first two share the same major prefix, pick the one with more downstream
  let selected = sorted[0];
  if (sorted.length > 1) {
    const aMajor = selected.promptId.split('.')[0];
    const bMajor = sorted[1].promptId.split('.')[0];
    if (aMajor === bMajor) {
      const aDown = countDownstream(selected.promptId, promptMap);
      const bDown = countDownstream(sorted[1].promptId, promptMap);
      if (bDown > aDown) {
        selected = sorted[1];
      }
    }
  }

  const check = checkPrerequisites(selected, promptMap);
  const downstreamCount = countDownstream(selected.promptId, promptMap);

  return {
    promptId: selected.promptId,
    title: selected.title,
    ownerRole: selected.role,
    epicId: selected.epicId,
    storyId: selected.storyId,
    sourcePath: selected.sourcePath,
    prerequisitesMet: check.metCount,
    totalPrerequisites: check.totalCount,
    eligibleCount: eligible.length,
    downstreamCount,
    rationale: generateRationale(selected, eligible.length, promptMap),
    body: selected.body,
  };
}

/**
 * Generate a human-readable rationale string for the selected next prompt.
 */
export function generateRationale(
  prompt: ParsedPrompt,
  eligibleCount: number,
  promptMap: Map<string, ParsedPrompt>,
): string {
  const check = checkPrerequisites(prompt, promptMap);
  const downstreamCount = countDownstream(prompt.promptId, promptMap);
  return `Prompt ${prompt.promptId} is next because: all ${check.totalCount} prerequisites are met, it has the lowest sequence number among ${eligibleCount} eligible prompts, and it unblocks ${downstreamCount} downstream prompt(s).`;
}

/**
 * Generate a rationale when no prompts are eligible.
 */
export function generateNoEligibleRationale(
  blockedCount: number,
  waitingCount: number,
): string {
  return `No prompts are currently eligible. ${blockedCount} prompt(s) are blocked, ${waitingCount} are awaiting prerequisite completion.`;
}

/**
 * Build a downstream dependency map: for each prompt, which prompts depend on it.
 */
export function buildDownstreamMap(
  prompts: Map<string, ParsedPrompt>,
): Map<string, string[]> {
  const downstream = new Map<string, string[]>();

  // Initialize all prompts with empty arrays
  for (const id of prompts.keys()) {
    downstream.set(id, []);
  }

  // Build reverse dependencies
  for (const prompt of prompts.values()) {
    for (const prereqId of prompt.prerequisites) {
      const list = downstream.get(prereqId);
      if (list) {
        list.push(prompt.promptId);
      } else {
        // prereq doesn't exist in map; create entry anyway
        downstream.set(prereqId, [prompt.promptId]);
      }
    }
  }

  return downstream;
}

/**
 * Detect insertion impacts: flag prompts whose prerequisites reference non-existent IDs
 * or where insertedAfter creates chain issues.
 */
export function detectInsertionImpacts(
  prompts: Map<string, ParsedPrompt>,
): ParseWarning[] {
  const warnings: ParseWarning[] = [];

  for (const prompt of prompts.values()) {
    // Check for missing prerequisites
    for (const prereqId of prompt.prerequisites) {
      if (!prompts.has(prereqId)) {
        warnings.push(createWarning(
          prompt.sourcePath,
          'W_PREREQ_NOT_FOUND',
          `Prerequisite '${prereqId}' not found for prompt '${prompt.promptId}'`,
          'warning',
        ));
      }
    }

    // Check insertedAfter references
    if (prompt.insertedAfter && !prompts.has(prompt.insertedAfter)) {
      warnings.push(createWarning(
        prompt.sourcePath,
        'W_PREREQ_NOT_FOUND',
        `insertedAfter reference '${prompt.insertedAfter}' not found for prompt '${prompt.promptId}'`,
        'warning',
      ));
    }
  }

  return warnings;
}
