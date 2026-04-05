import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ParsedPrompt, ParseWarning } from '@/types';
import { BlockersWarningsPanel, aggregateBlockers } from '@/components/overview/BlockersWarningsPanel';

function makePrompt(overrides: Partial<ParsedPrompt> = {}): ParsedPrompt {
  return {
    promptId: '1.0.1',
    title: 'Test Prompt',
    phase: 'implementation',
    status: 'ready',
    epicId: 'E1',
    storyId: '',
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
    sourcePath: 'prompts/active/1.0.1-test.md',
    ...overrides,
  };
}

function makeWarning(overrides: Partial<ParseWarning> = {}): ParseWarning {
  return {
    file: 'test.md',
    code: 'W_DONE_NO_HANDOFF',
    message: 'No handoff found',
    severity: 'warning',
    ...overrides,
  };
}

describe('aggregateBlockers', () => {
  it('returns empty array when no blockers or warnings', () => {
    const result = aggregateBlockers([], []);
    expect(result).toEqual([]);
  });

  it('returns blocked prompts as blocker items', () => {
    const prompts = [
      makePrompt({ promptId: '3.0.1', title: 'Blocked One', status: 'blocked' }),
      makePrompt({ promptId: '4.0.1', title: 'Blocked Two', status: 'blocked' }),
    ];
    const result = aggregateBlockers(prompts, []);
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('blocker');
    expect(result[0].promptId).toBe('3.0.1');
    expect(result[1].promptId).toBe('4.0.1');
  });

  it('returns error-level warnings as error items', () => {
    const warnings = [
      makeWarning({ severity: 'error', code: 'E_INVALID_YAML', message: 'Invalid YAML' }),
    ];
    const result = aggregateBlockers([], warnings);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('error');
  });

  it('returns W_DONE_NO_HANDOFF as warning items', () => {
    const warnings = [
      makeWarning({ code: 'W_DONE_NO_HANDOFF', message: 'Done but no handoff' }),
    ];
    const result = aggregateBlockers([], warnings);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('warning');
  });

  it('aggregates mixed blockers, errors, and warnings', () => {
    const prompts = [makePrompt({ status: 'blocked' })];
    const warnings = [
      makeWarning({ severity: 'error', code: 'E_MISSING_REQUIRED', message: 'Missing field' }),
      makeWarning({ code: 'W_PREREQ_NOT_FOUND', message: 'Prereq missing' }),
    ];
    const result = aggregateBlockers(prompts, warnings);
    expect(result).toHaveLength(3);
    expect(result.filter((i) => i.type === 'blocker')).toHaveLength(1);
    expect(result.filter((i) => i.type === 'error')).toHaveLength(1);
    expect(result.filter((i) => i.type === 'warning')).toHaveLength(1);
  });

  it('ignores info-level warnings', () => {
    const warnings = [
      makeWarning({ severity: 'info', code: 'I_PARSED_OK', message: 'OK' }),
    ];
    const result = aggregateBlockers([], warnings);
    expect(result).toHaveLength(0);
  });
});

describe('BlockersWarningsPanel', () => {
  it('shows "No issues found" when empty', () => {
    render(<BlockersWarningsPanel prompts={[]} warnings={[]} />);
    expect(screen.getByTestId('no-issues')).toHaveTextContent('No issues found');
  });

  it('renders blocked prompts as blocker items', () => {
    const prompts = [
      makePrompt({ promptId: '3.0.1', status: 'blocked' }),
      makePrompt({ promptId: '4.0.1', status: 'blocked' }),
    ];
    render(<BlockersWarningsPanel prompts={prompts} warnings={[]} />);
    expect(screen.getByTestId('blocker-item-0')).toBeInTheDocument();
    expect(screen.getByTestId('blocker-item-1')).toBeInTheDocument();
  });

  it('renders error warnings', () => {
    const warnings = [
      makeWarning({ severity: 'error', code: 'E_INVALID_YAML', message: 'Bad YAML in file.md' }),
    ];
    render(<BlockersWarningsPanel prompts={[]} warnings={warnings} />);
    expect(screen.getByText(/Bad YAML in file\.md/)).toBeInTheDocument();
  });

  it('renders W_DONE_NO_HANDOFF as warning items', () => {
    const warnings = [
      makeWarning({ code: 'W_DONE_NO_HANDOFF', message: 'Done but no handoff' }),
    ];
    render(<BlockersWarningsPanel prompts={[]} warnings={warnings} />);
    expect(screen.getByTestId('warning-item-0')).toBeInTheDocument();
    expect(screen.getByText(/Done but no handoff/)).toBeInTheDocument();
  });

  it('lists errors before warnings', () => {
    const prompts = [makePrompt({ promptId: '5.0.1', status: 'blocked' })];
    const warnings = [
      makeWarning({ code: 'W_PREREQ_NOT_FOUND', message: 'Missing prereq' }),
    ];
    render(<BlockersWarningsPanel prompts={prompts} warnings={warnings} />);

    // blocker-item-0 should appear before warning-item-0
    const blockerItem = screen.getByTestId('blocker-item-0');
    const warningItem = screen.getByTestId('warning-item-0');
    expect(blockerItem.compareDocumentPosition(warningItem)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('calls onPromptClick when blocker item is clicked', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    const prompts = [makePrompt({ promptId: '7.0.1', status: 'blocked' })];
    render(
      <BlockersWarningsPanel prompts={prompts} warnings={[]} onPromptClick={onClick} />,
    );

    await user.click(screen.getByTestId('blocker-item-0'));
    expect(onClick).toHaveBeenCalledWith('7.0.1');
  });

  it('has correct aria-label on blocker items', () => {
    const prompts = [makePrompt({ promptId: '2.0.1', status: 'blocked' })];
    render(<BlockersWarningsPanel prompts={prompts} warnings={[]} />);

    const item = screen.getByTestId('blocker-item-0');
    expect(item).toHaveAttribute('aria-label', expect.stringContaining('Blocker'));
  });

  it('shows count in header when items exist', () => {
    const prompts = [makePrompt({ status: 'blocked' })];
    const warnings = [
      makeWarning({ code: 'W_DONE_NO_HANDOFF', message: 'No handoff' }),
    ];
    render(<BlockersWarningsPanel prompts={prompts} warnings={warnings} />);
    expect(screen.getByText('(2)')).toBeInTheDocument();
  });
});
