import { screen, waitFor } from '@testing-library/react';
import OverviewPage from '@/app/page';
import { renderWithProviders, createMockState } from '../test-utils';

describe('OverviewPage', () => {
  it('renders the overview heading', async () => {
    renderWithProviders(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });
  });

  it('renders SummaryCardsGrid when state is loaded', async () => {
    const state = createMockState();
    renderWithProviders(<OverviewPage />, { state });

    await waitFor(() => {
      expect(screen.getByTestId('summary-cards-grid')).toBeInTheDocument();
    });
  });

  it('renders all chart panels when state is loaded', async () => {
    const state = createMockState({
      summary: {
        ...createMockState().summary,
        epicCompletionPercents: { E1: 80, E2: 40 },
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
        completionTimeline: [
          { date: '2026-04-01', cumulativeCompleted: 5, remainingPrompts: 25 },
        ],
      },
    });

    renderWithProviders(<OverviewPage />, { state });

    await waitFor(() => {
      expect(screen.getByTestId('epic-completion-chart')).toBeInTheDocument();
      expect(screen.getByTestId('prompt-status-chart')).toBeInTheDocument();
      expect(
        screen.getByTestId('session-throughput-chart'),
      ).toBeInTheDocument();
    });
  });

  it('shows loading indicator when isLoading is true', async () => {
    // Provide a parseFn that never resolves to keep isLoading true
    const neverResolve = () => new Promise<never>(() => {});
    renderWithProviders(<OverviewPage />, {
      parseFn: neverResolve,
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });
    expect(screen.getByText('Loading dashboard data…')).toBeInTheDocument();
  });

  it('shows error banner when error is non-null', async () => {
    const failParseFn = async () => {
      throw new Error('Parse failed');
    };

    renderWithProviders(<OverviewPage />, { parseFn: failParseFn });

    await waitFor(() => {
      expect(screen.getByTestId('error-banner')).toBeInTheDocument();
    });
    expect(screen.getByText('Parse failed')).toBeInTheDocument();
  });

  it('propagates metric values correctly from state', async () => {
    const state = createMockState({
      project: {
        ...createMockState().project,
        totalEpics: 6,
        totalStories: 24,
        totalTasks: 87,
        totalPrompts: 30,
      },
    });

    renderWithProviders(<OverviewPage />, { state });

    await waitFor(() => {
      expect(screen.getByTestId('summary-card-epics')).toHaveTextContent('6');
      expect(screen.getByTestId('summary-card-stories')).toHaveTextContent(
        '24',
      );
      expect(screen.getByTestId('summary-card-tasks')).toHaveTextContent('87');
      expect(screen.getByTestId('summary-card-prompts')).toHaveTextContent(
        '30',
      );
    });
  });

  it('renders data-testid for the overview container', () => {
    renderWithProviders(<OverviewPage />);
    expect(screen.getByTestId('view-overview')).toBeInTheDocument();
  });
});
