import { render, screen } from '@testing-library/react';
import { EpicCompletionChart } from '@/components/overview/EpicCompletionChart';

describe('EpicCompletionChart', () => {
  it('renders chart with epic data', () => {
    render(
      <EpicCompletionChart epicCompletionPercents={{ E1: 80, E2: 40, E3: 0 }} />,
    );

    expect(screen.getByTestId('epic-completion-chart')).toBeInTheDocument();
    expect(screen.getByText('Epic Completion')).toBeInTheDocument();
  });

  it('passes correct data to Bar chart', () => {
    render(
      <EpicCompletionChart epicCompletionPercents={{ E1: 80, E2: 40 }} />,
    );

    const chart = screen.getByTestId('mock-bar-chart');
    const data = JSON.parse(chart.getAttribute('data-chart-data')!);

    expect(data.labels).toEqual(['E1', 'E2']);
    expect(data.datasets[0].data).toEqual([80, 40]);
  });

  it('renders empty state when no epic data', () => {
    render(<EpicCompletionChart epicCompletionPercents={{}} />);

    expect(
      screen.getByTestId('epic-completion-chart-empty'),
    ).toBeInTheDocument();
    expect(screen.getByText('No epic data available')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(
      <EpicCompletionChart epicCompletionPercents={{ E1: 100, E2: 50 }} />,
    );

    expect(container).toMatchSnapshot();
  });

  it('matches empty snapshot', () => {
    const { container } = render(
      <EpicCompletionChart epicCompletionPercents={{}} />,
    );

    expect(container).toMatchSnapshot();
  });
});
