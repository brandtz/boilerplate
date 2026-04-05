import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ParsedEpic, ParsedPrompt, ParsedHandoff, ReverseTaskIndex } from '@/types';
import { EpicAccordion } from '@/components/epics/EpicAccordion';

function makeEpic(id: string, title: string, storyCount: number = 1): ParsedEpic {
  const stories = Array.from({ length: storyCount }, (_, i) => ({
    storyId: `${id}-S${i + 1}`,
    epicId: id,
    title: `Story ${i + 1}`,
    status: 'ready' as const,
    acceptanceCriteria: [],
    tasks: [
      {
        taskId: `${id}-S${i + 1}-T1`,
        storyId: `${id}-S${i + 1}`,
        epicId: id,
        title: `Task 1 of story ${i + 1}`,
        status: 'done',
      },
      {
        taskId: `${id}-S${i + 1}-T2`,
        storyId: `${id}-S${i + 1}`,
        epicId: id,
        title: `Task 2 of story ${i + 1}`,
        status: 'ready',
      },
    ],
  }));

  return { epicId: id, title, status: 'in_progress', stories };
}

const defaultProps = {
  epicCompletionPercents: { E1: 50, E2: 75 } as Record<string, number>,
  taskIndex: {
    'E1-S1-T1': ['12.0.1'],
    'E1-S1-T2': ['13.0.1'],
    'E2-S1-T1': ['16.0.1'],
  } as ReverseTaskIndex,
  prompts: [] as ParsedPrompt[],
  sessions: [] as ParsedHandoff[],
  onPromptClick: jest.fn(),
};

describe('EpicAccordion', () => {
  it('renders empty state when no epics', () => {
    render(<EpicAccordion {...defaultProps} epics={[]} />);
    expect(screen.getByTestId('epics-empty-state')).toHaveTextContent('No epics defined');
  });

  it('renders all epic cards', () => {
    const epics = [makeEpic('E1', 'Parser'), makeEpic('E2', 'UI Shell')];
    render(<EpicAccordion {...defaultProps} epics={epics} />);

    expect(screen.getByTestId('epic-card-E1')).toBeInTheDocument();
    expect(screen.getByTestId('epic-card-E2')).toBeInTheDocument();
  });

  it('displays epic title, story count, task count', () => {
    const epics = [makeEpic('E1', 'Parser', 2)];
    render(<EpicAccordion {...defaultProps} epics={epics} />);

    expect(screen.getByTestId('epic-card-E1')).toHaveTextContent('E1: Parser');
    expect(screen.getByTestId('epic-card-E1')).toHaveTextContent('Stories: 2');
    expect(screen.getByTestId('epic-card-E1')).toHaveTextContent('Tasks: 4');
  });

  it('shows completion percentage from epicCompletionPercents', () => {
    const epics = [makeEpic('E1', 'Parser')];
    render(<EpicAccordion {...defaultProps} epics={epics} />);
    expect(screen.getByTestId('epic-card-E1')).toHaveTextContent('50%');
  });

  it('clicking epic toggle reveals stories', async () => {
    const user = userEvent.setup();
    const epics = [makeEpic('E1', 'Parser')];
    render(<EpicAccordion {...defaultProps} epics={epics} />);

    // Initially collapsed
    expect(screen.queryByTestId('epic-content-E1')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('epic-toggle-E1'));
    expect(screen.getByTestId('epic-content-E1')).toBeInTheDocument();
    expect(screen.getByTestId('story-row-E1-S1')).toBeInTheDocument();
  });

  it('clicking story toggle reveals tasks', async () => {
    const user = userEvent.setup();
    const epics = [makeEpic('E1', 'Parser')];
    render(<EpicAccordion {...defaultProps} epics={epics} />);

    // Expand epic
    await user.click(screen.getByTestId('epic-toggle-E1'));
    // Expand story
    await user.click(screen.getByTestId('story-toggle-E1-S1'));

    expect(screen.getByTestId('story-content-E1-S1')).toBeInTheDocument();
    expect(screen.getByTestId('task-item-E1-S1-T1')).toBeInTheDocument();
    expect(screen.getByTestId('task-item-E1-S1-T2')).toBeInTheDocument();
  });

  it('has correct aria-expanded attributes', async () => {
    const user = userEvent.setup();
    const epics = [makeEpic('E1', 'Parser')];
    render(<EpicAccordion {...defaultProps} epics={epics} />);

    const toggle = screen.getByTestId('epic-toggle-E1');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('keyboard Enter toggles epic expansion', async () => {
    const user = userEvent.setup();
    const epics = [makeEpic('E1', 'Parser')];
    render(<EpicAccordion {...defaultProps} epics={epics} />);

    const toggle = screen.getByTestId('epic-toggle-E1');
    toggle.focus();
    await user.keyboard('{Enter}');

    expect(screen.getByTestId('epic-content-E1')).toBeInTheDocument();
  });

  it('two epics can be expanded simultaneously', async () => {
    const user = userEvent.setup();
    const epics = [makeEpic('E1', 'Parser'), makeEpic('E2', 'UI')];
    render(<EpicAccordion {...defaultProps} epics={epics} />);

    await user.click(screen.getByTestId('epic-toggle-E1'));
    await user.click(screen.getByTestId('epic-toggle-E2'));

    expect(screen.getByTestId('epic-content-E1')).toBeInTheDocument();
    expect(screen.getByTestId('epic-content-E2')).toBeInTheDocument();
  });

  it('calls onPromptClick when prompt link is clicked', async () => {
    const user = userEvent.setup();
    const onPromptClick = jest.fn();
    const epics = [makeEpic('E1', 'Parser')];
    render(
      <EpicAccordion
        {...defaultProps}
        epics={epics}
        onPromptClick={onPromptClick}
      />,
    );

    // Expand epic → story → see task with prompt link
    await user.click(screen.getByTestId('epic-toggle-E1'));
    await user.click(screen.getByTestId('story-toggle-E1-S1'));
    await user.click(screen.getByTestId('prompt-link-12.0.1'));

    expect(onPromptClick).toHaveBeenCalledWith('12.0.1');
  });

  it('shows status badge on each epic', () => {
    const epics = [makeEpic('E1', 'Parser')];
    render(<EpicAccordion {...defaultProps} epics={epics} />);

    const badges = screen.getAllByTestId('status-badge');
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });

  it('shows progress bar with correct aria attributes', () => {
    const epics = [makeEpic('E1', 'Parser')];
    render(<EpicAccordion {...defaultProps} epics={epics} />);

    const progressBar = screen.getByRole('progressbar', {
      name: /E1 completion/,
    });
    expect(progressBar).toHaveAttribute('aria-valuenow', '50');
  });

  it('displays prompt count based on taskIndex', () => {
    const epics = [makeEpic('E1', 'Parser')];
    render(<EpicAccordion {...defaultProps} epics={epics} />);
    // E1-S1-T1 → 12.0.1, E1-S1-T2 → 13.0.1 = 2 unique prompts
    expect(screen.getByTestId('epic-card-E1')).toHaveTextContent('Prompts: 2');
  });
});
