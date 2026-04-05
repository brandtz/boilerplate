import { render, screen } from '@testing-library/react';
import { RemainingPromptsChart } from '@/components/overview/RemainingPromptsChart';
import type { TimelineDataPoint } from '@/types';

describe('RemainingPromptsChart', () => {
  const timeline: TimelineDataPoint[] = [
    { date: '2026-04-01', cumulativeCompleted: 4, remainingPrompts: 26 },
    { date: '2026-04-02', cumulativeCompleted: 8, remainingPrompts: 22 },
    { date: '2026-04-03', cumulativeCompleted: 16, remainingPrompts: 14 },
  ];

  it('renders chart with timeline data', () => {
    render(<RemainingPromptsChart completionTimeline={timeline} />);

    expect(
      screen.getByTestId('remaining-prompts-chart'),
    ).toBeInTheDocument();
    expect(screen.getByText('Remaining Prompts Over Time')).toBeInTheDocument();
  });

  it('passes correct data to Line chart', () => {
    render(<RemainingPromptsChart completionTimeline={timeline} />);

    const chart = screen.getByTestId('mock-line-chart');
    const data = JSON.parse(chart.getAttribute('data-chart-data')!);

    expect(data.labels).toEqual(['2026-04-01', '2026-04-02', '2026-04-03']);
    expect(data.datasets).toHaveLength(1);
    expect(data.datasets[0].label).toBe('Remaining Prompts');
    expect(data.datasets[0].data).toEqual([26, 22, 14]);
  });

  it('renders empty state when no timeline data', () => {
    render(<RemainingPromptsChart completionTimeline={[]} />);

    expect(
      screen.getByTestId('remaining-prompts-chart-empty'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('No remaining prompts data available'),
    ).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(
      <RemainingPromptsChart completionTimeline={timeline} />,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches empty snapshot', () => {
    const { container } = render(
      <RemainingPromptsChart completionTimeline={[]} />,
    );
    expect(container).toMatchSnapshot();
  });
});
