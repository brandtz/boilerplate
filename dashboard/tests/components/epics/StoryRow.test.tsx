import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ParsedStory, ReverseTaskIndex } from '@/types';
import { StoryRow } from '@/components/epics/StoryRow';

function makeStory(overrides?: Partial<ParsedStory>): ParsedStory {
  return {
    storyId: 'E1-S1',
    epicId: 'E1',
    title: 'Define YAML schema',
    status: 'in_progress',
    acceptanceCriteria: [],
    tasks: [
      { taskId: 'E1-S1-T1', storyId: 'E1-S1', epicId: 'E1', title: 'Task A', status: 'done' },
      { taskId: 'E1-S1-T2', storyId: 'E1-S1', epicId: 'E1', title: 'Task B', status: 'done' },
      { taskId: 'E1-S1-T3', storyId: 'E1-S1', epicId: 'E1', title: 'Task C', status: 'ready' },
      { taskId: 'E1-S1-T4', storyId: 'E1-S1', epicId: 'E1', title: 'Task D', status: 'cancelled' },
    ],
    ...overrides,
  };
}

const taskIndex: ReverseTaskIndex = {
  'E1-S1-T1': ['12.0.1'],
  'E1-S1-T2': ['12.0.1', '13.0.1'],
};

describe('StoryRow', () => {
  const defaultProps = {
    story: makeStory(),
    taskIndex,
    isExpanded: false,
    onToggle: jest.fn(),
    onPromptClick: jest.fn(),
  };

  it('renders story ID, title, and task count', () => {
    render(<StoryRow {...defaultProps} />);
    expect(screen.getByTestId('story-row-E1-S1')).toHaveTextContent('E1-S1: Define YAML schema');
    expect(screen.getByTestId('story-row-E1-S1')).toHaveTextContent('Tasks: 4');
  });

  it('computes completion correctly (3 done+ready, 1 cancelled = 2/3 = 67%)', () => {
    render(<StoryRow {...defaultProps} />);
    // 4 total, 1 cancelled → denominator 3; 2 done → 2/3 = 67%
    expect(screen.getByTestId('story-row-E1-S1')).toHaveTextContent('67%');
  });

  it('shows deduplicated prompt count', () => {
    render(<StoryRow {...defaultProps} />);
    // E1-S1-T1 → 12.0.1; E1-S1-T2 → 12.0.1, 13.0.1 → 2 unique
    expect(screen.getByTestId('story-row-E1-S1')).toHaveTextContent('Prompts: 2');
  });

  it('calls onToggle when clicked', async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    render(<StoryRow {...defaultProps} onToggle={onToggle} />);

    await user.click(screen.getByTestId('story-toggle-E1-S1'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('shows tasks when expanded', () => {
    render(<StoryRow {...defaultProps} isExpanded={true} />);
    expect(screen.getByTestId('story-content-E1-S1')).toBeInTheDocument();
    expect(screen.getByTestId('task-item-E1-S1-T1')).toBeInTheDocument();
  });

  it('hides tasks when collapsed', () => {
    render(<StoryRow {...defaultProps} isExpanded={false} />);
    expect(screen.queryByTestId('story-content-E1-S1')).not.toBeInTheDocument();
  });

  it('has correct aria-expanded attribute', () => {
    const { rerender } = render(<StoryRow {...defaultProps} isExpanded={false} />);
    expect(screen.getByTestId('story-toggle-E1-S1')).toHaveAttribute('aria-expanded', 'false');

    rerender(<StoryRow {...defaultProps} isExpanded={true} />);
    expect(screen.getByTestId('story-toggle-E1-S1')).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows completion progress bar', () => {
    render(<StoryRow {...defaultProps} />);
    const bar = screen.getByRole('progressbar', { name: /E1-S1 completion/ });
    expect(bar).toHaveAttribute('aria-valuenow', '67');
  });

  it('shows status badge', () => {
    render(<StoryRow {...defaultProps} />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent('In Progress');
  });

  it('passes prompt clicks through', async () => {
    const user = userEvent.setup();
    const onPromptClick = jest.fn();
    render(<StoryRow {...defaultProps} isExpanded={true} onPromptClick={onPromptClick} />);

    const links = screen.getAllByTestId('prompt-link-12.0.1');
    await user.click(links[0]);
    expect(onPromptClick).toHaveBeenCalledWith('12.0.1');
  });
});
