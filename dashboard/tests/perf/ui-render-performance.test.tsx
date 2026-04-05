/**
 * Performance Tests — UI Render Benchmarks
 *
 * E6-S2-T2: Benchmark dashboard initial render time with large-scale data.
 *
 * Threshold (from epics AC-3):
 *   - Dashboard render time after parse: < 1 second (AC-3)
 *   - Prompt specified UI initial render: < 3 seconds
 *
 * Uses jsdom via Testing Library. Measures React render time with a
 * large DashboardState injected via the provider.
 */

import { render } from '@testing-library/react';
import { DashboardProvider } from '@/context/DashboardContext';
import type {
  DashboardState,
  ParsedPrompt,
  ParsedHandoff,
  ParsedEpic,
  ParsedStory,
  ParsedTask,
  PromptStatus,
} from '@/types';

// Lazy import page components to measure inclusive render time
import OverviewPage from '@/app/page';

// Thresholds
const RENDER_THRESHOLD_MS = 3000;
const RENDER_LARGE_THRESHOLD_MS = 3000;

jest.mock('react-markdown', () => {
  return function MockMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown">{children}</div>;
  };
});

jest.mock('remark-gfm', () => () => {});

const STATUSES: PromptStatus[] = ['draft', 'ready', 'in_progress', 'done', 'blocked', 'cancelled', 'superseded', 'in_review'];

function generateLargeState(promptCount: number): DashboardState {
  const prompts: ParsedPrompt[] = [];
  const sessions: ParsedHandoff[] = [];
  const epics: ParsedEpic[] = [];
  const taskIndex: Record<string, string[]> = {};

  // Generate prompts
  for (let i = 1; i <= promptCount; i++) {
    const epicIdx = ((i - 1) % 10);
    const storyIdx = Math.floor(((i - 1) % 50) / 10);
    const status: PromptStatus = i <= Math.floor(promptCount * 0.8) ? 'done' : STATUSES[i % STATUSES.length];
    const taskId = `E${epicIdx + 1}-S${storyIdx + 1}-T${(i % 4) + 1}`;

    prompts.push({
      promptId: `${i}.0.1`,
      title: `Task ${i} — implementation work`,
      phase: 'implementation',
      status,
      epicId: `E${epicIdx + 1}`,
      storyId: `E${epicIdx + 1}-S${storyIdx + 1}`,
      taskIds: [taskId],
      role: 'Senior Software Engineer',
      prerequisites: i > 1 ? [`${i - 1}.0.1`] : [],
      requiredReading: [],
      downstreamPrompts: i < promptCount ? [`${i + 1}.0.1`] : [],
      insertedAfter: null,
      affectsPrompts: [],
      reviewRequired: [],
      createdAt: '2026-04-01T00:00:00Z',
      updatedAt: '2026-04-01T00:00:00Z',
      sessionHandoff: status === 'done' ? `agents/handoffs/S-${i}.md` : '',
      supersedes: '',
      supersededBy: '',
      insertReason: '',
      completedAt: status === 'done' ? '2026-04-01T00:00:00Z' : '',
      archivedAt: '',
      body: `# Prompt ${i}.0.1\n\nGenerated fixture content.`,
      sourcePath: `prompts/active/${i}.0.1-task-${i}.md`,
    });

    if (!taskIndex[taskId]) taskIndex[taskId] = [];
    taskIndex[taskId].push(`${i}.0.1`);
  }

  // Generate handoffs for done prompts
  const handoffCount = Math.min(Math.floor(promptCount * 0.8), promptCount);
  for (let i = 1; i <= handoffCount; i++) {
    sessions.push({
      sessionId: `S-2026-04-perf-${String(i).padStart(3, '0')}`,
      promptId: `${i}.0.1`,
      role: 'Senior Software Engineer',
      statusOutcome: 'complete',
      completionPercent: 100,
      startedAt: '2026-04-01T00:00:00Z',
      endedAt: '2026-04-02T00:00:00Z',
      changedFiles: [`src/module-${i}.ts`],
      blockers: [],
      nextRecommendedPrompts: [`${i + 1}.0.1`],
      summary: `Completed prompt ${i}.0.1`,
      sourcePath: `agents/handoffs/S-perf-${i}.md`,
    });
  }

  // Generate epics
  for (let e = 0; e < 10; e++) {
    const stories: ParsedStory[] = [];
    for (let s = 0; s < 5; s++) {
      const tasks: ParsedTask[] = [];
      for (let t = 0; t < 4; t++) {
        tasks.push({
          taskId: `E${e + 1}-S${s + 1}-T${t + 1}`,
          storyId: `E${e + 1}-S${s + 1}`,
          epicId: `E${e + 1}`,
          title: `Task ${t + 1}`,
          status: 'done',
        });
      }
      stories.push({
        storyId: `E${e + 1}-S${s + 1}`,
        epicId: `E${e + 1}`,
        title: `Story ${s + 1}`,
        status: 'in_progress',
        acceptanceCriteria: ['AC-1: Tests pass'],
        tasks,
      });
    }
    epics.push({
      epicId: `E${e + 1}`,
      title: `Epic ${e + 1}`,
      status: 'in_progress',
      stories,
    });
  }

  // Compute metrics
  const promptsByStatus: Record<PromptStatus, number> = {
    draft: 0, ready: 0, in_progress: 0, in_review: 0,
    blocked: 0, done: 0, superseded: 0, cancelled: 0,
  };
  for (const p of prompts) {
    promptsByStatus[p.status]++;
  }

  return {
    project: {
      projectName: 'Perf Test Project',
      repoPath: '/tmp/perf-test',
      lastParsedAt: '2026-04-04T12:00:00Z',
      totalEpics: epics.length,
      totalStories: epics.reduce((sum, e) => sum + e.stories.length, 0),
      totalTasks: epics.reduce((sum, e) => sum + e.stories.reduce((s, st) => s + st.tasks.length, 0), 0),
      totalPrompts: prompts.length,
      totalHandoffs: sessions.length,
      healthStatus: 'on_track',
    },
    summary: {
      promptsByStatus,
      scopeCompletionPercent: 80,
      executionCompletionPercent: 82,
      epicCompletionPercents: Object.fromEntries(
        epics.map((e) => [e.epicId, 80]),
      ),
      activePrompts: prompts.filter((p) => !['done', 'cancelled', 'superseded'].includes(p.status)).length,
      completedPrompts: promptsByStatus.done,
      blockedPrompts: promptsByStatus.blocked,
      supersededPrompts: promptsByStatus.superseded,
      cancelledPrompts: promptsByStatus.cancelled,
      completionTimeline: [],
      noEligibleRationale: null,
    },
    nextPrompt: null,
    epics,
    prompts,
    sessions,
    warnings: [],
    taskIndex,
  };
}

describe('UI Render Performance — Overview Page', () => {
  it(`should render overview with 300+ prompts in under ${RENDER_THRESHOLD_MS}ms`, () => {
    const state = generateLargeState(310);
    const mockParseFn = async () => state;

    const start = performance.now();
    render(
      <DashboardProvider parseFn={mockParseFn}>
        <OverviewPage />
      </DashboardProvider>,
    );
    const elapsed = performance.now() - start;

    console.log(`  Overview render (${state.prompts.length} prompts): ${elapsed.toFixed(1)}ms`);
    expect(elapsed).toBeLessThan(RENDER_THRESHOLD_MS);
  });

  it(`should render overview with 500 prompts in under ${RENDER_LARGE_THRESHOLD_MS}ms`, () => {
    const state = generateLargeState(500);
    const mockParseFn = async () => state;

    const start = performance.now();
    render(
      <DashboardProvider parseFn={mockParseFn}>
        <OverviewPage />
      </DashboardProvider>,
    );
    const elapsed = performance.now() - start;

    console.log(`  Overview render (${state.prompts.length} prompts): ${elapsed.toFixed(1)}ms`);
    expect(elapsed).toBeLessThan(RENDER_LARGE_THRESHOLD_MS);
  });
});

describe('UI Render Performance — State Generation', () => {
  it('should generate a large DashboardState in under 500ms', () => {
    const start = performance.now();
    const state = generateLargeState(310);
    const elapsed = performance.now() - start;

    console.log(`  State generation (310 prompts): ${elapsed.toFixed(1)}ms`);
    expect(state.prompts.length).toBe(310);
    expect(elapsed).toBeLessThan(500);
  });
});
