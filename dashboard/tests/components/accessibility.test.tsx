import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ParsedPrompt, ParsedEpic, ParsedHandoff, ReverseTaskIndex } from '@/types';
import { PromptTable, type SortColumn, type SortDirection } from '@/components/prompts/PromptTable';
import { EpicCompletionChart } from '@/components/overview/EpicCompletionChart';
import { PromptStatusChart } from '@/components/overview/PromptStatusChart';
import { SessionThroughputChart } from '@/components/overview/SessionThroughputChart';
import { RemainingPromptsChart } from '@/components/overview/RemainingPromptsChart';
import { SessionFilterBar } from '@/components/sessions/SessionFilterBar';
import { SessionDetail } from '@/components/sessions/SessionDetail';
import { SessionCard } from '@/components/sessions/SessionCard';
import { EpicAccordion } from '@/components/epics/EpicAccordion';
import { AppShell } from '@/components/shell/AppShell';
import { renderWithProviders } from './test-utils';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
}));

function makePrompt(id: string, overrides?: Partial<ParsedPrompt>): ParsedPrompt {
  return {
    promptId: id,
    title: `Prompt ${id}`,
    phase: 'implementation',
    status: 'ready',
    epicId: 'E1',
    storyId: 'E1-S1',
    taskIds: [],
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
    body: '',
    sourcePath: `prompts/active/${id}.md`,
    ...overrides,
  };
}

function makeHandoff(id: string, overrides?: Partial<ParsedHandoff>): ParsedHandoff {
  return {
    sessionId: id,
    promptId: '1.0.1',
    role: 'Engineer',
    statusOutcome: 'complete',
    completionPercent: 100,
    startedAt: '2026-04-03T10:00:00Z',
    endedAt: '2026-04-03T12:00:00Z',
    summary: 'Completed the work',
    changedFiles: ['src/foo.ts'],
    blockers: [],
    nextRecommendedPrompts: ['2.0.1'],
    sourcePath: `agents/handoffs/${id}.md`,
    ...overrides,
  };
}

function makeEpic(id: string, title: string): ParsedEpic {
  return {
    epicId: id,
    title,
    status: 'in_progress',
    stories: [{
      storyId: `${id}-S1`,
      epicId: id,
      title: 'Story 1',
      status: 'ready',
      acceptanceCriteria: [],
      tasks: [{
        taskId: `${id}-S1-T1`,
        storyId: `${id}-S1`,
        epicId: id,
        title: 'Task 1',
        status: 'done',
      }],
    }],
  };
}

const promptTableProps = {
  sortColumn: 'promptId' as SortColumn,
  sortDirection: 'asc' as SortDirection,
  onSort: jest.fn(),
  onRowClick: jest.fn(),
  currentPage: 1,
  pageSize: 25,
  onPageChange: jest.fn(),
};

describe('Accessibility – F1: Chart accessible alternatives', () => {
  it('EpicCompletionChart renders figure with role=img and sr-only data table', () => {
    render(<EpicCompletionChart epicCompletionPercents={{ E1: 80, E2: 40 }} />);
    const figure = screen.getByTestId('epic-completion-chart');
    expect(figure.tagName).toBe('FIGURE');
    expect(figure).toHaveAttribute('role', 'img');
    expect(figure).toHaveAttribute('aria-label', expect.stringContaining('E1: 80%'));
    // sr-only data table
    const table = figure.querySelector('table');
    expect(table).toBeInTheDocument();
    expect(table!.className).toContain('sr-only');
    expect(table!.querySelectorAll('tbody tr')).toHaveLength(2);
  });

  it('PromptStatusChart renders figure with role=img and sr-only data table', () => {
    render(<PromptStatusChart promptsByStatus={{
      draft: 0, ready: 2, in_progress: 1, in_review: 0,
      blocked: 0, done: 5, superseded: 0, cancelled: 0,
    }} />);
    const figure = screen.getByTestId('prompt-status-chart');
    expect(figure.tagName).toBe('FIGURE');
    expect(figure).toHaveAttribute('role', 'img');
    const table = figure.querySelector('table.sr-only');
    expect(table).toBeInTheDocument();
  });

  it('SessionThroughputChart renders figure with sr-only data table', () => {
    render(<SessionThroughputChart completionTimeline={[
      { date: '2026-04-01', cumulativeCompleted: 3, remainingPrompts: 7 },
      { date: '2026-04-02', cumulativeCompleted: 5, remainingPrompts: 5 },
    ]} />);
    const figure = screen.getByTestId('session-throughput-chart');
    expect(figure.tagName).toBe('FIGURE');
    expect(figure).toHaveAttribute('role', 'img');
    const rows = figure.querySelectorAll('table.sr-only tbody tr');
    expect(rows).toHaveLength(2);
  });

  it('RemainingPromptsChart renders figure with sr-only data table', () => {
    render(<RemainingPromptsChart completionTimeline={[
      { date: '2026-04-01', cumulativeCompleted: 3, remainingPrompts: 7 },
    ]} />);
    const figure = screen.getByTestId('remaining-prompts-chart');
    expect(figure.tagName).toBe('FIGURE');
    expect(figure).toHaveAttribute('role', 'img');
  });
});

describe('Accessibility – F2: Skip-to-content link', () => {
  it('AppShell main has id="main-content"', () => {
    renderWithProviders(<AppShell><p>Content</p></AppShell>);
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
  });
});

describe('Accessibility – F3: Keyboard sort headers', () => {
  it('sort headers are focusable and respond to Enter key', async () => {
    const user = userEvent.setup();
    const onSort = jest.fn();
    render(<PromptTable {...promptTableProps} prompts={[makePrompt('1.0.1')]} onSort={onSort} />);

    const header = screen.getByTestId('sort-header-status');
    expect(header).toHaveAttribute('tabIndex', '0');
    expect(header).toHaveAttribute('role', 'columnheader');
    expect(header).toHaveAttribute('aria-label', 'Sort by Status');

    header.focus();
    await user.keyboard('{Enter}');
    expect(onSort).toHaveBeenCalledWith('status');
  });

  it('sort headers respond to Space key', async () => {
    const user = userEvent.setup();
    const onSort = jest.fn();
    render(<PromptTable {...promptTableProps} prompts={[makePrompt('1.0.1')]} onSort={onSort} />);

    const header = screen.getByTestId('sort-header-title');
    header.focus();
    await user.keyboard(' ');
    expect(onSort).toHaveBeenCalledWith('title');
  });
});

describe('Accessibility – F5: RepoSelector no listbox', () => {
  // Verified by absence of role="option" — tested implicitly via RepoSelector.test.tsx
});

describe('Accessibility – F6: SessionFilterBar search label', () => {
  it('search input has aria-label', () => {
    render(<SessionFilterBar roles={['Engineer']} onChange={jest.fn()} />);
    const input = screen.getByTestId('filter-search');
    expect(input).toHaveAttribute('aria-label', 'Search sessions');
  });
});

describe('Accessibility – F7: SessionDetail button aria-labels', () => {
  it('next recommended links have descriptive aria-labels', () => {
    render(
      <SessionDetail
        session={makeHandoff('S-001')}
        onPromptClick={jest.fn()}
      />,
    );
    const link = screen.getByTestId('next-prompt-link-2.0.1');
    expect(link).toHaveAttribute('aria-label', 'Navigate to prompt 2.0.1');
  });

  it('view prompt link has descriptive aria-label', () => {
    render(
      <SessionDetail
        session={makeHandoff('S-001')}
        onPromptClick={jest.fn()}
      />,
    );
    const link = screen.getByTestId('view-prompt-link');
    expect(link).toHaveAttribute('aria-label', 'View prompt 1.0.1');
  });
});

describe('Accessibility – F9: Data refresh announcements', () => {
  it('AppShell has aria-live region', () => {
    renderWithProviders(<AppShell><p>Content</p></AppShell>);
    const liveRegion = screen.getByTestId('live-region');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    expect(liveRegion.className).toContain('sr-only');
  });
});

describe('Accessibility – F10: Accordion content panel roles', () => {
  it('epic content panel has role=region and aria-labelledby', async () => {
    const user = userEvent.setup();
    const epics = [makeEpic('E1', 'Parser')];
    render(
      <EpicAccordion
        epics={epics}
        epicCompletionPercents={{ E1: 50 }}
        taskIndex={{ 'E1-S1-T1': ['1.0.1'] } as ReverseTaskIndex}
        prompts={[]}
        sessions={[]}
        onPromptClick={jest.fn()}
      />,
    );

    await user.click(screen.getByTestId('epic-toggle-E1'));
    const content = screen.getByTestId('epic-content-E1');
    expect(content).toHaveAttribute('role', 'region');
    expect(content).toHaveAttribute('aria-labelledby', 'epic-trigger-E1');
  });
});

describe('Accessibility – F11: No redundant onKeyDown on buttons', () => {
  it('SessionCard toggle button works with keyboard natively', async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    render(
      <SessionCard
        session={makeHandoff('S-001')}
        isExpanded={false}
        onToggle={onToggle}
        onPromptClick={jest.fn()}
      />,
    );

    const toggle = screen.getByTestId('session-toggle');
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(onToggle).toHaveBeenCalled();
  });
});
