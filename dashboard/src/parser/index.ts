/**
 * Parser Module — Public API Entry Point
 *
 * Exports the main parse() function and all types.
 */

import type { DashboardState, ParsedPrompt, ParsedHandoff, ParsedEpic, ParseWarning } from './types';
import { scanRepository } from './scanner';
import { extractPrompt, extractHandoff } from './extractor';
import { parseEpicFile } from './epic-parser';
import { buildDashboardState } from './graph-builder';

/**
 * Parse a repository and produce a complete DashboardState.
 * This is the main entry point for the parser pipeline.
 */
export async function parse(repoPath: string): Promise<DashboardState> {
  const scanResult = await scanRepository(repoPath);
  const allWarnings: ParseWarning[] = [...scanResult.warnings];

  const prompts: ParsedPrompt[] = [];
  const handoffs: ParsedHandoff[] = [];
  const epics: ParsedEpic[] = [];

  for (const file of scanResult.files) {
    if (file.category === 'prompt') {
      const result = extractPrompt(file.relativePath, file.content);
      allWarnings.push(...result.warnings);
      if (result.prompt) {
        prompts.push(result.prompt);
      }
    } else if (file.category === 'handoff') {
      const result = extractHandoff(file.relativePath, file.content);
      allWarnings.push(...result.warnings);
      if (result.handoff) {
        handoffs.push(result.handoff);
      }
    } else if (file.category === 'epic') {
      const result = parseEpicFile(file.relativePath, file.content);
      allWarnings.push(...result.warnings);
      epics.push(...result.epics);
    }
    // index and other categories are noted but not separately parsed in v1
  }

  const state = buildDashboardState(prompts, handoffs, epics, repoPath);

  // Merge scan-level warnings into the state
  state.warnings = [...allWarnings, ...state.warnings];

  return state;
}

/**
 * Parse a repository and return the DashboardState as a JSON string.
 * Output is deterministic: same input always produces identical JSON
 * (except for lastParsedAt timestamp).
 */
export async function parseToJson(repoPath: string, pretty = false): Promise<string> {
  const state = await parse(repoPath);
  return JSON.stringify(state, null, pretty ? 2 : undefined);
}

export type {
  PromptStatus,
  ParseWarning,
  ParsedPrompt,
  ParsedHandoff,
  ParsedEpic,
  ParsedStory,
  ParsedTask,
  ProjectSummary,
  SummaryMetrics,
  TimelineDataPoint,
  NextPromptInfo,
  ReverseTaskIndex,
  DashboardState,
} from './types';

export { WARNING_CODES } from './types';
export { scanRepository, validateRepoStructure } from './scanner';
export type { ScannedFile } from './scanner';
export { extractPrompt, extractHandoff, extractFrontmatter } from './extractor';
export { validatePromptFrontmatter } from './schemas/prompt-schema';
export { validateHandoffFrontmatter } from './schemas/handoff-schema';
export { parseEpicFile } from './epic-parser';
export { buildDashboardState } from './graph-builder';
export { createWarning, isError, isWarning } from './warnings';
export { parsePromptIdTuple, comparePromptIds, sortPrompts } from './sorting';
export type { PromptIdTuple } from './sorting';
export {
  checkPrerequisites,
  resolvePrerequisites,
  selectNextPrompt,
  generateRationale,
  generateNoEligibleRationale,
  buildDownstreamMap,
  detectInsertionImpacts,
} from './eligibility';
export type { PrerequisiteCheck, ResolvedPrompts } from './eligibility';
