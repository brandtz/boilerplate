import { render, type RenderOptions } from '@testing-library/react';
import { type ReactElement } from 'react';
import { DashboardProvider } from '@/context/DashboardContext';
import type { DashboardState } from '@/types';

/**
 * Minimal valid DashboardState for testing purposes.
 */
export function createMockState(overrides?: Partial<DashboardState>): DashboardState {
  return {
    project: {
      projectName: 'Test Project',
      repoPath: '/tmp/test-repo',
      lastParsedAt: '2026-04-04T12:00:00Z',
      totalEpics: 2,
      totalStories: 5,
      totalTasks: 10,
      totalPrompts: 8,
      totalHandoffs: 3,
      healthStatus: 'on_track',
    },
    summary: {
      promptsByStatus: {
        draft: 0,
        ready: 2,
        in_progress: 1,
        in_review: 0,
        blocked: 0,
        done: 5,
        superseded: 0,
        cancelled: 0,
      },
      scopeCompletionPercent: 60,
      executionCompletionPercent: 62,
      epicCompletionPercents: { E1: 80, E2: 0 },
      activePrompts: 3,
      completedPrompts: 5,
      blockedPrompts: 0,
      supersededPrompts: 0,
      cancelledPrompts: 0,
      completionTimeline: [],
      noEligibleRationale: null,
    },
    nextPrompt: null,
    epics: [],
    prompts: [],
    sessions: [],
    warnings: [],
    taskIndex: {},
    ...overrides,
  };
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  state?: DashboardState | null;
  parseFn?: (repoPath: string) => Promise<DashboardState>;
}

/**
 * Render a component wrapped with DashboardProvider.
 * Optionally inject a mock state via parseFn.
 */
export function renderWithProviders(
  ui: ReactElement,
  { state, parseFn, ...options }: RenderWithProvidersOptions = {},
) {
  const mockState = state ?? createMockState();
  const defaultParseFn = async () => mockState;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <DashboardProvider parseFn={parseFn ?? defaultParseFn}>
        {children}
      </DashboardProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
