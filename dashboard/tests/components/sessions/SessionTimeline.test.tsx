import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionTimeline } from '@/components/sessions/SessionTimeline';
import type { ParsedHandoff } from '@/types';

function makeSession(overrides: Partial<ParsedHandoff> & { sessionId: string }): ParsedHandoff {
  return {
    promptId: '1.0.1',
    role: 'Senior Software Engineer',
    statusOutcome: 'complete',
    completionPercent: 100,
    startedAt: '2026-04-03T08:00:00Z',
    endedAt: '2026-04-03T09:00:00Z',
    changedFiles: ['src/index.ts'],
    blockers: [],
    nextRecommendedPrompts: [],
    summary: 'Completed the task successfully',
    sourcePath: 'agents/handoffs/S-001.md',
    ...overrides,
  };
}

const defaultProps = {
  onPromptClick: jest.fn(),
  currentPage: 1,
  pageSize: 25,
  onPageChange: jest.fn(),
};

describe('SessionTimeline', () => {
  it('renders empty state when no sessions', () => {
    render(<SessionTimeline sessions={[]} {...defaultProps} />);
    expect(screen.getByTestId('sessions-empty')).toHaveTextContent('No sessions completed yet');
  });

  it('renders session cards for each session', () => {
    const sessions = [
      makeSession({ sessionId: 'S-001' }),
      makeSession({ sessionId: 'S-002', endedAt: '2026-04-03T10:00:00Z' }),
      makeSession({ sessionId: 'S-003', endedAt: '2026-04-04T09:00:00Z' }),
    ];
    render(<SessionTimeline sessions={sessions} {...defaultProps} />);

    expect(screen.getByTestId('session-card-S-001')).toBeInTheDocument();
    expect(screen.getByTestId('session-card-S-002')).toBeInTheDocument();
    expect(screen.getByTestId('session-card-S-003')).toBeInTheDocument();
  });

  it('sorts sessions newest first', () => {
    const sessions = [
      makeSession({ sessionId: 'S-001', endedAt: '2026-04-01T09:00:00Z' }),
      makeSession({ sessionId: 'S-003', endedAt: '2026-04-03T09:00:00Z' }),
      makeSession({ sessionId: 'S-002', endedAt: '2026-04-02T09:00:00Z' }),
    ];
    render(<SessionTimeline sessions={sessions} {...defaultProps} />);

    const cards = screen.getAllByRole('listitem');
    expect(within(cards[0]).getByTestId('session-id')).toHaveTextContent('S-003');
    expect(within(cards[1]).getByTestId('session-id')).toHaveTextContent('S-002');
    expect(within(cards[2]).getByTestId('session-id')).toHaveTextContent('S-001');
  });

  it('groups sessions by date with date headers', () => {
    const sessions = [
      makeSession({ sessionId: 'S-001', endedAt: '2026-04-03T09:00:00Z' }),
      makeSession({ sessionId: 'S-002', endedAt: '2026-04-03T10:00:00Z' }),
      makeSession({ sessionId: 'S-003', endedAt: '2026-04-04T09:00:00Z' }),
    ];
    render(<SessionTimeline sessions={sessions} {...defaultProps} />);

    expect(screen.getByTestId('date-header-2026-04-04')).toBeInTheDocument();
    expect(screen.getByTestId('date-header-2026-04-03')).toBeInTheDocument();
  });

  it('displays session count', () => {
    const sessions = [
      makeSession({ sessionId: 'S-001' }),
      makeSession({ sessionId: 'S-002', endedAt: '2026-04-03T10:00:00Z' }),
    ];
    render(<SessionTimeline sessions={sessions} {...defaultProps} />);
    expect(screen.getByTestId('session-count')).toHaveTextContent('2 sessions');
  });

  it('shows pagination for sessions exceeding pageSize', () => {
    const sessions = Array.from({ length: 30 }, (_, i) =>
      makeSession({
        sessionId: `S-${String(i + 1).padStart(3, '0')}`,
        endedAt: `2026-04-${String(Math.floor(i / 5) + 1).padStart(2, '0')}T${String(9 + (i % 5)).padStart(2, '0')}:00:00Z`,
      }),
    );
    render(
      <SessionTimeline sessions={sessions} {...defaultProps} pageSize={25} />,
    );
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  it('expands a session when expandedSessionId is provided', () => {
    const sessions = [
      makeSession({ sessionId: 'S-001' }),
      makeSession({ sessionId: 'S-002', endedAt: '2026-04-03T10:00:00Z' }),
    ];
    render(
      <SessionTimeline sessions={sessions} {...defaultProps} expandedSessionId="S-001" />,
    );
    expect(screen.getByTestId('session-detail')).toBeInTheDocument();
  });

  it('has role="list" on timeline container', () => {
    const sessions = [makeSession({ sessionId: 'S-001' })];
    render(<SessionTimeline sessions={sessions} {...defaultProps} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });
});
