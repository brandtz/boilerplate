import { render, screen } from '@testing-library/react';
import type { ParsedPrompt, ParsedHandoff, ReverseTaskIndex } from '@/types';
import { UpdateSummary, resolveLastUpdate } from '@/components/epics/UpdateSummary';

describe('resolveLastUpdate', () => {
  const sessions: ParsedHandoff[] = [
    {
      sessionId: 'S-001',
      promptId: '12.0.1',
      role: 'Engineer',
      statusOutcome: 'completed',
      completionPercent: 100,
      startedAt: '2026-04-03T10:00:00Z',
      endedAt: '2026-04-03T12:00:00Z',
      changedFiles: [],
      blockers: [],
      nextRecommendedPrompts: [],
      summary: 'Implemented frontmatter parser',
      sourcePath: 'agents/handoffs/S-001.md',
    },
    {
      sessionId: 'S-002',
      promptId: '13.0.1',
      role: 'Engineer',
      statusOutcome: 'completed',
      completionPercent: 100,
      startedAt: '2026-04-04T10:00:00Z',
      endedAt: '2026-04-04T14:00:00Z',
      changedFiles: [],
      blockers: [],
      nextRecommendedPrompts: [],
      summary: 'Built sorting engine',
      sourcePath: 'agents/handoffs/S-002.md',
    },
  ];

  const taskIndex: ReverseTaskIndex = {
    'E1-S1-T1': ['12.0.1'],
    'E1-S1-T2': ['13.0.1'],
    'E1-S2-T1': ['14.0.1'],
  };

  it('returns latest handoff for a task', () => {
    const result = resolveLastUpdate(
      'E1-S1-T1',
      'task',
      [],
      sessions,
      taskIndex,
    );
    expect(result).toEqual({
      date: '2026-04-03T12:00:00Z',
      summary: 'Implemented frontmatter parser',
    });
  });

  it('returns null for task with no associated prompts', () => {
    const result = resolveLastUpdate(
      'E1-S3-T1',
      'task',
      [],
      sessions,
      taskIndex,
    );
    expect(result).toBeNull();
  });

  it('returns latest handoff for story (aggregates child tasks)', () => {
    const result = resolveLastUpdate(
      'E1-S1',
      'story',
      [],
      sessions,
      taskIndex,
      ['E1-S1-T1', 'E1-S1-T2'],
    );
    expect(result).toEqual({
      date: '2026-04-04T14:00:00Z',
      summary: 'Built sorting engine',
    });
  });

  it('returns latest handoff for epic (aggregates all task IDs)', () => {
    const result = resolveLastUpdate(
      'E1',
      'epic',
      [],
      sessions,
      taskIndex,
      ['E1-S1-T1', 'E1-S1-T2', 'E1-S2-T1'],
    );
    // Latest is S-002 (Apr 4)
    expect(result?.date).toBe('2026-04-04T14:00:00Z');
  });

  it('returns null when no sessions match', () => {
    const result = resolveLastUpdate(
      'E1-S2-T1',
      'task',
      [],
      [], // no sessions
      taskIndex,
    );
    expect(result).toBeNull();
  });
});

describe('UpdateSummary', () => {
  it('shows "No updates yet" when date is null', () => {
    render(<UpdateSummary date={null} summary={null} />);
    expect(screen.getByTestId('update-summary')).toHaveTextContent('No updates yet');
  });

  it('shows formatted date and summary', () => {
    render(
      <UpdateSummary date="2026-04-03T12:00:00Z" summary="Parser completed" />,
    );
    expect(screen.getByTestId('update-summary')).toHaveTextContent(
      'Last update: Apr 3 — Parser completed',
    );
  });

  it('truncates long summaries to 80 chars with ellipsis', () => {
    const longSummary = 'A'.repeat(100);
    render(
      <UpdateSummary date="2026-04-03T12:00:00Z" summary={longSummary} />,
    );
    const el = screen.getByTestId('update-summary');
    expect(el).toHaveTextContent('A'.repeat(80) + '…');
    expect(el).toHaveAttribute('title', longSummary);
  });

  it('does not add title attribute when summary is short', () => {
    render(
      <UpdateSummary date="2026-04-03T12:00:00Z" summary="Short" />,
    );
    expect(screen.getByTestId('update-summary')).not.toHaveAttribute('title');
  });

  it('shows year for non-current year dates', () => {
    render(
      <UpdateSummary date="2025-12-25T12:00:00Z" summary="Old update" />,
    );
    expect(screen.getByTestId('update-summary')).toHaveTextContent('Dec 25, 2025');
  });
});
