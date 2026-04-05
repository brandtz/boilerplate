import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionCard } from '@/components/sessions/SessionCard';
import type { ParsedHandoff } from '@/types';

function makeSession(overrides?: Partial<ParsedHandoff>): ParsedHandoff {
  return {
    sessionId: 'S-2026-04-03-005',
    promptId: '2.0.1',
    role: 'Business Systems Analyst',
    statusOutcome: 'complete',
    completionPercent: 100,
    startedAt: '2026-04-03T08:00:00Z',
    endedAt: '2026-04-03T09:00:00Z',
    changedFiles: ['docs/business-rules.md', 'agents/epics/epics.md', 'prompts/index.md'],
    blockers: [],
    nextRecommendedPrompts: ['3.0.1'],
    summary: 'Refined acceptance criteria for all epics with detailed story breakdowns and task definitions.',
    sourcePath: 'agents/handoffs/S-2026-04-03-005.md',
    ...overrides,
  };
}

describe('SessionCard', () => {
  const defaultProps = {
    session: makeSession(),
    isExpanded: false,
    onToggle: jest.fn(),
    onPromptClick: jest.fn(),
  };

  afterEach(() => jest.clearAllMocks());

  it('renders session ID, prompt, and role', () => {
    render(<SessionCard {...defaultProps} />);
    expect(screen.getByTestId('session-id')).toHaveTextContent('S-2026-04-03-005');
    expect(screen.getByTestId('session-prompt-info')).toHaveTextContent('2.0.1');
    expect(screen.getByTestId('session-prompt-info')).toHaveTextContent('Business Systems Analyst');
  });

  it('shows status outcome badge', () => {
    render(<SessionCard {...defaultProps} />);
    expect(screen.getByTestId('session-outcome')).toHaveTextContent('complete');
  });

  it('displays changed file count', () => {
    render(<SessionCard {...defaultProps} />);
    expect(screen.getByTestId('session-changed-count')).toHaveTextContent('Files changed: 3');
  });

  it('shows truncated summary when collapsed', () => {
    const longSummary = 'A'.repeat(200);
    render(
      <SessionCard
        {...defaultProps}
        session={makeSession({ summary: longSummary })}
      />,
    );
    const truncated = screen.getByTestId('session-summary-truncated');
    expect(truncated.textContent!.length).toBeLessThan(200);
    expect(truncated.textContent).toContain('…');
  });

  it('shows full summary when expanded', () => {
    const longSummary = 'A'.repeat(200);
    render(
      <SessionCard
        {...defaultProps}
        isExpanded={true}
        session={makeSession({ summary: longSummary })}
      />,
    );
    expect(screen.getByTestId('session-summary-full')).toHaveTextContent(longSummary);
  });

  it('shows expand button when collapsed', () => {
    render(<SessionCard {...defaultProps} />);
    const toggle = screen.getByTestId('session-toggle');
    expect(toggle).toHaveTextContent('▼ Expand Details');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows collapse button when expanded', () => {
    render(<SessionCard {...defaultProps} isExpanded={true} />);
    const toggle = screen.getByTestId('session-toggle');
    expect(toggle).toHaveTextContent('▲ Collapse');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('calls onToggle when toggle button is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    render(<SessionCard {...defaultProps} onToggle={onToggle} />);
    await user.click(screen.getByTestId('session-toggle'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('calls onToggle on Enter key', async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    render(<SessionCard {...defaultProps} onToggle={onToggle} />);
    screen.getByTestId('session-toggle').focus();
    await user.keyboard('{Enter}');
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders SessionDetail when expanded', () => {
    render(<SessionCard {...defaultProps} isExpanded={true} />);
    expect(screen.getByTestId('session-detail')).toBeInTheDocument();
  });

  it('does not render SessionDetail when collapsed', () => {
    render(<SessionCard {...defaultProps} />);
    expect(screen.queryByTestId('session-detail')).not.toBeInTheDocument();
  });

  it('shows changed files list in detail', () => {
    render(<SessionCard {...defaultProps} isExpanded={true} />);
    const filesList = screen.getByTestId('changed-files-list');
    expect(filesList.children).toHaveLength(3);
  });

  it('shows "View Prompt" link in detail', async () => {
    const user = userEvent.setup();
    const onPromptClick = jest.fn();
    render(
      <SessionCard {...defaultProps} isExpanded={true} onPromptClick={onPromptClick} />,
    );
    await user.click(screen.getByTestId('view-prompt-link'));
    expect(onPromptClick).toHaveBeenCalledWith('2.0.1');
  });

  it('shows next recommended prompts in detail', async () => {
    const user = userEvent.setup();
    const onPromptClick = jest.fn();
    render(
      <SessionCard {...defaultProps} isExpanded={true} onPromptClick={onPromptClick} />,
    );
    await user.click(screen.getByTestId('next-prompt-link-3.0.1'));
    expect(onPromptClick).toHaveBeenCalledWith('3.0.1');
  });

  it('shows handoff source path in detail', () => {
    render(<SessionCard {...defaultProps} isExpanded={true} />);
    expect(screen.getByTestId('handoff-source-path')).toHaveTextContent(
      'agents/handoffs/S-2026-04-03-005.md',
    );
  });

  it('shows blockers when present in detail', () => {
    render(
      <SessionCard
        {...defaultProps}
        isExpanded={true}
        session={makeSession({ blockers: ['Waiting on API key'] })}
      />,
    );
    expect(screen.getByText('Waiting on API key')).toBeInTheDocument();
  });

  it('shows partial outcome styling', () => {
    render(
      <SessionCard
        {...defaultProps}
        session={makeSession({ statusOutcome: 'partial' })}
      />,
    );
    expect(screen.getByTestId('session-outcome')).toHaveTextContent('partial');
  });

  it('has role="listitem"', () => {
    render(<SessionCard {...defaultProps} />);
    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });
});
