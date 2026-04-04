import type {
  ParsedPrompt,
  ParsedHandoff,
  ParsedEpic,
  ParseWarning,
  DashboardState,
  ProjectSummary,
  SummaryMetrics,
  ReverseTaskIndex,
  PromptStatus,
} from './types';
import { createWarning } from './warnings';

const STATUS_KEYS: PromptStatus[] = [
  'draft', 'ready', 'in_progress', 'in_review',
  'blocked', 'done', 'superseded', 'cancelled',
];

/**
 * Build the complete DashboardState from parsed entities.
 */
export function buildDashboardState(
  prompts: ParsedPrompt[],
  handoffs: ParsedHandoff[],
  epics: ParsedEpic[],
  repoPath: string,
): DashboardState {
  const warnings: ParseWarning[] = [];

  // Deduplicate prompts by promptId (first wins)
  const promptMap = new Map<string, ParsedPrompt>();
  for (const prompt of prompts) {
    if (promptMap.has(prompt.promptId)) {
      warnings.push(createWarning(
        prompt.sourcePath,
        'W_DUPLICATE_PROMPT',
        `Duplicate prompt ID '${prompt.promptId}', keeping first occurrence`,
        'warning',
      ));
      continue;
    }
    promptMap.set(prompt.promptId, prompt);
  }
  const deduped = Array.from(promptMap.values());

  // Build handoff map: promptId → handoffs[]
  const handoffMap = new Map<string, ParsedHandoff[]>();
  for (const handoff of handoffs) {
    const existing = handoffMap.get(handoff.promptId) ?? [];
    existing.push(handoff);
    handoffMap.set(handoff.promptId, existing);
  }

  // Check done prompts have handoffs
  for (const prompt of deduped) {
    if (prompt.status === 'done') {
      const h = handoffMap.get(prompt.promptId);
      if (!h || h.length === 0) {
        warnings.push(createWarning(
          prompt.sourcePath,
          'W_DONE_NO_HANDOFF',
          `Done prompt '${prompt.promptId}' has no matching handoff`,
          'warning',
        ));
      }
    }
  }

  // Check prerequisite references
  for (const prompt of deduped) {
    for (const prereqId of prompt.prerequisites) {
      if (!promptMap.has(prereqId)) {
        warnings.push(createWarning(
          prompt.sourcePath,
          'W_PREREQ_NOT_FOUND',
          `Prerequisite '${prereqId}' not found for prompt '${prompt.promptId}'`,
          'warning',
        ));
      }
    }
  }

  // Build reverse task index
  const taskIndex: ReverseTaskIndex = {};
  for (const prompt of deduped) {
    for (const taskId of prompt.taskIds) {
      if (!taskIndex[taskId]) {
        taskIndex[taskId] = [];
      }
      taskIndex[taskId].push(prompt.promptId);
    }
  }

  // Compute metrics
  const promptsByStatus = {} as Record<PromptStatus, number>;
  for (const s of STATUS_KEYS) {
    promptsByStatus[s] = 0;
  }
  for (const prompt of deduped) {
    if (promptsByStatus[prompt.status] !== undefined) {
      promptsByStatus[prompt.status]++;
    }
  }

  const totalTasks = epics.reduce((sum, e) => sum + e.stories.reduce((s2, st) => s2 + st.tasks.length, 0), 0);
  const totalStories = epics.reduce((sum, e) => sum + e.stories.length, 0);

  const doneTasks = epics.reduce((sum, e) =>
    sum + e.stories.reduce((s2, st) =>
      s2 + st.tasks.filter(t => t.status === 'done').length, 0), 0);
  const cancelledTasks = epics.reduce((sum, e) =>
    sum + e.stories.reduce((s2, st) =>
      s2 + st.tasks.filter(t => t.status === 'cancelled').length, 0), 0);

  const denomTasks = totalTasks - cancelledTasks;
  const scopeCompletionPercent = denomTasks > 0 ? Math.round((doneTasks / denomTasks) * 100) : 0;

  const totalPrompts = deduped.length;
  const donePrompts = promptsByStatus.done;
  const supersededPrompts = promptsByStatus.superseded;
  const cancelledPrompts = promptsByStatus.cancelled;
  const denomPrompts = totalPrompts - supersededPrompts - cancelledPrompts;
  const executionCompletionPercent = denomPrompts > 0 ? Math.round((donePrompts / denomPrompts) * 100) : 0;

  // Epic completion percentages
  const epicCompletionPercents: Record<string, number> = {};
  for (const epic of epics) {
    const total = epic.stories.length;
    const done = epic.stories.filter(s => s.status === 'done').length;
    const cancelled = epic.stories.filter(s => s.status === 'cancelled').length;
    const denom = total - cancelled;
    epicCompletionPercents[epic.epicId] = denom > 0 ? Math.round((done / denom) * 100) : 0;
  }

  // Completion timeline from handoffs
  const timelineMap = new Map<string, number>();
  for (const handoff of handoffs) {
    if (handoff.endedAt) {
      const date = handoff.endedAt.substring(0, 10); // YYYY-MM-DD
      timelineMap.set(date, (timelineMap.get(date) ?? 0) + 1);
    }
  }
  const sortedDates = Array.from(timelineMap.keys()).sort();
  let cumulative = 0;
  const completionTimeline = sortedDates.map(date => {
    cumulative += timelineMap.get(date) ?? 0;
    return {
      date,
      cumulativeCompleted: cumulative,
      remainingPrompts: totalPrompts - cumulative,
    };
  });

  // Health status
  let healthStatus: ProjectSummary['healthStatus'] = 'not_started';
  if (donePrompts > 0 && promptsByStatus.blocked === 0) {
    healthStatus = 'on_track';
  } else if (promptsByStatus.blocked > 0) {
    healthStatus = promptsByStatus.blocked >= 3 ? 'blocked' : 'at_risk';
  } else if (totalPrompts > 0) {
    healthStatus = 'not_started';
  }

  const project: ProjectSummary = {
    projectName: 'Project Manager Dashboard',
    repoPath,
    lastParsedAt: new Date().toISOString(),
    totalEpics: epics.length,
    totalStories,
    totalTasks,
    totalPrompts,
    totalHandoffs: handoffs.length,
    healthStatus,
  };

  const summary: SummaryMetrics = {
    promptsByStatus,
    scopeCompletionPercent,
    executionCompletionPercent,
    epicCompletionPercents,
    activePrompts: promptsByStatus.ready + promptsByStatus.in_progress + promptsByStatus.in_review + promptsByStatus.blocked,
    completedPrompts: donePrompts,
    blockedPrompts: promptsByStatus.blocked,
    supersededPrompts,
    cancelledPrompts,
    completionTimeline,
    noEligibleRationale: null,
  };

  return {
    project,
    summary,
    nextPrompt: null, // Deferred to eligibility.ts (prompt 13.0.1)
    epics,
    prompts: deduped,
    sessions: handoffs,
    warnings,
    taskIndex,
  };
}
