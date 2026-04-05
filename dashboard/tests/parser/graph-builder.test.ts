import { buildDashboardState } from '@/parser/graph-builder';
import type { ParsedPrompt, ParsedHandoff, ParsedEpic } from '@/parser/types';

function makePrompt(overrides: Partial<ParsedPrompt> = {}): ParsedPrompt {
  return {
    promptId: '1.0.1',
    title: 'Test Prompt',
    phase: 'implementation',
    status: 'ready',
    epicId: 'E1',
    storyId: 'E1-S1',
    taskIds: ['E1-S1-T1'],
    role: 'Engineer',
    prerequisites: [],
    requiredReading: [],
    downstreamPrompts: [],
    insertedAfter: null,
    affectsPrompts: [],
    reviewRequired: [],
    createdAt: '2026-04-03T00:00:00Z',
    updatedAt: '2026-04-03T00:00:00Z',
    sessionHandoff: '',
    supersedes: '',
    supersededBy: '',
    insertReason: '',
    completedAt: '',
    archivedAt: '',
    body: '# Test',
    sourcePath: 'prompts/active/1.0.1.md',
    ...overrides,
  };
}

function makeHandoff(overrides: Partial<ParsedHandoff> = {}): ParsedHandoff {
  return {
    sessionId: 'S-001',
    promptId: '1.0.1',
    role: 'Engineer',
    statusOutcome: 'complete',
    completionPercent: 100,
    startedAt: '2026-04-03T12:00:00Z',
    endedAt: '2026-04-03T12:30:00Z',
    changedFiles: [],
    blockers: [],
    nextRecommendedPrompts: [],
    summary: 'Done',
    sourcePath: 'agents/handoffs/S-001.md',
    ...overrides,
  };
}

function makeEpic(overrides: Partial<ParsedEpic> = {}): ParsedEpic {
  return {
    epicId: 'E1',
    title: 'Test Epic',
    status: 'ready',
    stories: [
      {
        storyId: 'E1-S1',
        epicId: 'E1',
        title: 'Test Story',
        status: 'ready',
        acceptanceCriteria: [],
        tasks: [
          { taskId: 'E1-S1-T1', storyId: 'E1-S1', epicId: 'E1', title: 'Task 1', status: 'done' },
          { taskId: 'E1-S1-T2', storyId: 'E1-S1', epicId: 'E1', title: 'Task 2', status: 'done' },
          { taskId: 'E1-S1-T3', storyId: 'E1-S1', epicId: 'E1', title: 'Task 3', status: 'cancelled' },
        ],
      },
    ],
    ...overrides,
  };
}

describe('graph-builder', () => {
  test('empty input returns DashboardState with zero counts', () => {
    const state = buildDashboardState([], [], [], '/repo');

    expect(state.project.totalPrompts).toBe(0);
    expect(state.project.totalHandoffs).toBe(0);
    expect(state.project.totalEpics).toBe(0);
    expect(state.project.healthStatus).toBe('not_started');
    expect(state.nextPrompt).toBeNull();
    expect(state.prompts).toHaveLength(0);
    expect(state.sessions).toHaveLength(0);
    expect(state.summary.executionCompletionPercent).toBe(0);
  });

  test('single prompt + single handoff linked correctly', () => {
    const prompt = makePrompt({ status: 'done', completedAt: '2026-04-03T12:30:00Z' });
    const handoff = makeHandoff({ promptId: '1.0.1' });

    const state = buildDashboardState([prompt], [handoff], [], '/repo');

    expect(state.prompts).toHaveLength(1);
    expect(state.sessions).toHaveLength(1);
    expect(state.summary.completedPrompts).toBe(1);
    expect(state.warnings.filter(w => w.code === 'W_DONE_NO_HANDOFF')).toHaveLength(0);
  });

  test('done prompt with no handoff emits W_DONE_NO_HANDOFF', () => {
    const prompt = makePrompt({ status: 'done', completedAt: '2026-04-03T12:30:00Z' });

    const state = buildDashboardState([prompt], [], [], '/repo');

    expect(state.warnings.some(w => w.code === 'W_DONE_NO_HANDOFF')).toBe(true);
  });

  test('multiple handoffs for same prompt are preserved', () => {
    const prompt = makePrompt({ status: 'done' });
    const h1 = makeHandoff({ sessionId: 'S-001', promptId: '1.0.1' });
    const h2 = makeHandoff({ sessionId: 'S-002', promptId: '1.0.1' });

    const state = buildDashboardState([prompt], [h1, h2], [], '/repo');

    expect(state.sessions).toHaveLength(2);
  });

  test('reverse task index maps correctly', () => {
    const p1 = makePrompt({ promptId: '1.0.1', taskIds: ['E1-S1-T1', 'E1-S1-T2'] });
    const p2 = makePrompt({ promptId: '2.0.1', taskIds: ['E1-S1-T1'], sourcePath: 'p2.md' });

    const state = buildDashboardState([p1, p2], [], [], '/repo');

    expect(state.taskIndex['E1-S1-T1']).toContain('1.0.1');
    expect(state.taskIndex['E1-S1-T1']).toContain('2.0.1');
    expect(state.taskIndex['E1-S1-T2']).toEqual(['1.0.1']);
  });

  test('duplicate prompt IDs keep first, emit W_DUPLICATE_PROMPT', () => {
    const p1 = makePrompt({ promptId: '1.0.1', title: 'First' });
    const p2 = makePrompt({ promptId: '1.0.1', title: 'Second', sourcePath: 'dup.md' });

    const state = buildDashboardState([p1, p2], [], [], '/repo');

    expect(state.prompts).toHaveLength(1);
    expect(state.prompts[0].title).toBe('First');
    expect(state.warnings.some(w => w.code === 'W_DUPLICATE_PROMPT')).toBe(true);
  });

  test('prerequisite referencing non-existent prompt emits W_PREREQ_NOT_FOUND', () => {
    const prompt = makePrompt({ prerequisites: ['999.0.1'] });

    const state = buildDashboardState([prompt], [], [], '/repo');

    expect(state.warnings.some(w => w.code === 'W_PREREQ_NOT_FOUND')).toBe(true);
  });

  test('epic completion rollup with cancelled tasks', () => {
    const epic = makeEpic();
    const state = buildDashboardState([], [], [epic], '/repo');

    // 2 done tasks, 1 cancelled → 2 / (3-1) = 100%
    expect(state.summary.scopeCompletionPercent).toBe(100);
  });

  test('prompt status counts are computed', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1', status: 'done', sourcePath: '1.md' }),
      makePrompt({ promptId: '2.0.1', status: 'ready', sourcePath: '2.md' }),
      makePrompt({ promptId: '3.0.1', status: 'ready', sourcePath: '3.md' }),
      makePrompt({ promptId: '4.0.1', status: 'blocked', sourcePath: '4.md' }),
    ];

    const state = buildDashboardState(prompts, [], [], '/repo');

    expect(state.summary.promptsByStatus.done).toBe(1);
    expect(state.summary.promptsByStatus.ready).toBe(2);
    expect(state.summary.promptsByStatus.blocked).toBe(1);
    expect(state.summary.activePrompts).toBe(3); // 2 ready + 1 blocked
  });

  test('completion timeline from handoff dates', () => {
    const h1 = makeHandoff({ sessionId: 'S-001', endedAt: '2026-04-01T12:00:00Z' });
    const h2 = makeHandoff({ sessionId: 'S-002', endedAt: '2026-04-02T12:00:00Z' });
    const h3 = makeHandoff({ sessionId: 'S-003', endedAt: '2026-04-02T15:00:00Z' });

    const state = buildDashboardState([], [h1, h2, h3], [], '/repo');

    expect(state.summary.completionTimeline).toHaveLength(2);
    expect(state.summary.completionTimeline[0].date).toBe('2026-04-01');
    expect(state.summary.completionTimeline[0].cumulativeCompleted).toBe(1);
    expect(state.summary.completionTimeline[1].date).toBe('2026-04-02');
    expect(state.summary.completionTimeline[1].cumulativeCompleted).toBe(3);
  });

  test('health status: blocked when 3+ blocked prompts', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1', status: 'blocked', sourcePath: '1.md' }),
      makePrompt({ promptId: '2.0.1', status: 'blocked', sourcePath: '2.md' }),
      makePrompt({ promptId: '3.0.1', status: 'blocked', sourcePath: '3.md' }),
    ];

    const state = buildDashboardState(prompts, [], [], '/repo');

    expect(state.project.healthStatus).toBe('blocked');
  });

  test('health status: on_track when done prompts exist and none blocked', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1', status: 'done', sourcePath: '1.md' }),
      makePrompt({ promptId: '2.0.1', status: 'ready', sourcePath: '2.md' }),
    ];

    const state = buildDashboardState(prompts, [], [], '/repo');

    expect(state.project.healthStatus).toBe('on_track');
  });

  test('execution completion excludes superseded and cancelled', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1', status: 'done', sourcePath: '1.md' }),
      makePrompt({ promptId: '2.0.1', status: 'superseded', sourcePath: '2.md' }),
      makePrompt({ promptId: '3.0.1', status: 'cancelled', sourcePath: '3.md' }),
      makePrompt({ promptId: '4.0.1', status: 'ready', sourcePath: '4.md' }),
    ];

    const state = buildDashboardState(prompts, [], [], '/repo');

    // 1 done / (4 - 1 superseded - 1 cancelled) = 1/2 = 50%
    expect(state.summary.executionCompletionPercent).toBe(50);
  });

  test('task status derived from linked prompt status', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1', status: 'done', taskIds: ['E1-S1-T1'], sourcePath: '1.md' }),
      makePrompt({ promptId: '2.0.1', status: 'in_progress', taskIds: ['E1-S1-T2'], sourcePath: '2.md' }),
    ];
    const epic = makeEpic({
      stories: [{
        storyId: 'E1-S1', epicId: 'E1', title: 'Story', status: 'draft',
        acceptanceCriteria: [],
        tasks: [
          { taskId: 'E1-S1-T1', storyId: 'E1-S1', epicId: 'E1', title: 'Task 1', status: 'draft' },
          { taskId: 'E1-S1-T2', storyId: 'E1-S1', epicId: 'E1', title: 'Task 2', status: 'draft' },
          { taskId: 'E1-S1-T3', storyId: 'E1-S1', epicId: 'E1', title: 'Task 3', status: 'draft' },
        ],
      }],
    });

    const state = buildDashboardState(prompts, [], [epic], '/repo');

    // T1 linked to done prompt → done; T2 linked to in_progress → in_progress; T3 unlinked → draft
    const tasks = state.epics[0].stories[0].tasks;
    expect(tasks[0].status).toBe('done');
    expect(tasks[1].status).toBe('in_progress');
    expect(tasks[2].status).toBe('draft');

    // Story has mix of done + in_progress + draft → in_progress
    expect(state.epics[0].stories[0].status).toBe('in_progress');
  });

  test('story and epic status derived as done when all tasks done', () => {
    const prompts = [
      makePrompt({ promptId: '1.0.1', status: 'done', taskIds: ['E1-S1-T1'], sourcePath: '1.md' }),
      makePrompt({ promptId: '2.0.1', status: 'done', taskIds: ['E1-S1-T2'], sourcePath: '2.md' }),
    ];
    const epic = makeEpic({
      stories: [{
        storyId: 'E1-S1', epicId: 'E1', title: 'Story', status: 'draft',
        acceptanceCriteria: [],
        tasks: [
          { taskId: 'E1-S1-T1', storyId: 'E1-S1', epicId: 'E1', title: 'Task 1', status: 'draft' },
          { taskId: 'E1-S1-T2', storyId: 'E1-S1', epicId: 'E1', title: 'Task 2', status: 'draft' },
        ],
      }],
    });

    const state = buildDashboardState(prompts, [], [epic], '/repo');

    expect(state.epics[0].stories[0].tasks[0].status).toBe('done');
    expect(state.epics[0].stories[0].tasks[1].status).toBe('done');
    expect(state.epics[0].stories[0].status).toBe('done');
    expect(state.epics[0].status).toBe('done');
  });
});
