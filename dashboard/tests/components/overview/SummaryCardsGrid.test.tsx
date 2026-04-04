import { screen, waitFor } from '@testing-library/react';
import { SummaryCardsGrid } from '@/components/overview/SummaryCardsGrid';
import { renderWithProviders, createMockState } from '../test-utils';

describe('SummaryCardsGrid', () => {
  const state = createMockState();

  it('renders the grid container', () => {
    renderWithProviders(
      <SummaryCardsGrid summary={state.summary} project={state.project} />,
    );

    expect(screen.getByTestId('summary-cards-grid')).toBeInTheDocument();
  });

  it('renders all 8 summary cards', () => {
    renderWithProviders(
      <SummaryCardsGrid summary={state.summary} project={state.project} />,
    );

    // Scope row
    expect(screen.getByTestId('summary-card-epics')).toBeInTheDocument();
    expect(screen.getByTestId('summary-card-stories')).toBeInTheDocument();
    expect(screen.getByTestId('summary-card-tasks')).toBeInTheDocument();
    expect(screen.getByTestId('summary-card-prompts')).toBeInTheDocument();
    // Execution row
    expect(screen.getByTestId('summary-card-done')).toBeInTheDocument();
    expect(screen.getByTestId('summary-card-in-progress')).toBeInTheDocument();
    expect(screen.getByTestId('summary-card-blocked')).toBeInTheDocument();
    expect(screen.getByTestId('summary-card-ready')).toBeInTheDocument();
  });

  it('renders correct scope values from project', () => {
    renderWithProviders(
      <SummaryCardsGrid summary={state.summary} project={state.project} />,
    );

    // project.totalEpics = 2, totalStories = 5, totalTasks = 10, totalPrompts = 8
    const epicCard = screen.getByTestId('summary-card-epics');
    expect(epicCard).toHaveTextContent('2');

    const storyCard = screen.getByTestId('summary-card-stories');
    expect(storyCard).toHaveTextContent('5');

    const taskCard = screen.getByTestId('summary-card-tasks');
    expect(taskCard).toHaveTextContent('10');

    const promptCard = screen.getByTestId('summary-card-prompts');
    expect(promptCard).toHaveTextContent('8');
  });

  it('renders correct execution values from summary', () => {
    renderWithProviders(
      <SummaryCardsGrid summary={state.summary} project={state.project} />,
    );

    // summary: completedPrompts = 5, in_progress = 1, blocked = 0, ready = 2
    const doneCard = screen.getByTestId('summary-card-done');
    expect(doneCard).toHaveTextContent('5');

    const inProgressCard = screen.getByTestId('summary-card-in-progress');
    expect(inProgressCard).toHaveTextContent('1');

    const blockedCard = screen.getByTestId('summary-card-blocked');
    expect(blockedCard).toHaveTextContent('0');

    const readyCard = screen.getByTestId('summary-card-ready');
    expect(readyCard).toHaveTextContent('2');
  });

  it('renders progress bars', () => {
    renderWithProviders(
      <SummaryCardsGrid summary={state.summary} project={state.project} />,
    );

    expect(screen.getByTestId('overall-progress')).toBeInTheDocument();
  });

  it('renders health badge', () => {
    renderWithProviders(
      <SummaryCardsGrid summary={state.summary} project={state.project} />,
    );

    expect(screen.getByTestId('health-badge')).toBeInTheDocument();
    expect(screen.getByText('On Track')).toBeInTheDocument();
  });

  it('handles all-zero metrics', () => {
    const zeroState = createMockState({
      project: {
        ...state.project,
        totalEpics: 0,
        totalStories: 0,
        totalTasks: 0,
        totalPrompts: 0,
        healthStatus: 'not_started',
      },
      summary: {
        ...state.summary,
        promptsByStatus: {
          draft: 0,
          ready: 0,
          in_progress: 0,
          in_review: 0,
          blocked: 0,
          done: 0,
          superseded: 0,
          cancelled: 0,
        },
        completedPrompts: 0,
        blockedPrompts: 0,
        scopeCompletionPercent: 0,
        executionCompletionPercent: 0,
      },
    });

    renderWithProviders(
      <SummaryCardsGrid
        summary={zeroState.summary}
        project={zeroState.project}
      />,
    );

    // All cards should render with 0
    const statusElements = screen.getAllByRole('status');
    expect(statusElements).toHaveLength(8);
    expect(screen.getByText('Not Started')).toBeInTheDocument();
  });

  it('has accessible section label', () => {
    renderWithProviders(
      <SummaryCardsGrid summary={state.summary} project={state.project} />,
    );

    expect(
      screen.getByRole('region', { name: /project summary/i }),
    ).toBeInTheDocument();
  });
});
