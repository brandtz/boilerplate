/**
 * Parser Module — Public API Entry Point
 *
 * Exports the main parse() function and all types.
 */

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
