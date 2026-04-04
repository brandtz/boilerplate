import { render, screen } from '@testing-library/react';
import { SessionThroughputChart } from '@/components/overview/SessionThroughputChart';
import type { TimelineDataPoint } from '@/types';

describe('SessionThroughputChart', () => {
  const timeline: TimelineDataPoint[] = [
    { date: '2026-04-01', cumulativeCompleted: 4, remainingPrompts: 26 },
    { date: '2026-04-02', cumulativeCompleted: 8, remainingPrompts: 22 },
    { date: '2026-04-03', cumulativeCompleted: 16, remainingPrompts: 14 },
  ];

  it('renders chart with timeline data', () => {
    render(<SessionThroughputChart completionTimeline={timeline} />);

    expect(
      screen.getByTestId('session-throughput-chart'),
    ).toBeInTheDocument();
    expect(screen.getByText('Session Throughput')).toBeInTheDocument();
  });

  it('passes correct data to Line chart', () => {
    render(<SessionThroughputChart completionTimeline={timeline} />);

    const chart = screen.getByTestId('mock-line-chart');
    const data = JSON.parse(chart.getAttribute('data-chart-data')!);

    expect(data.labels).toEqual(['2026-04-01', '2026-04-02', '2026-04-03']);
    expect(data.datasets).toHaveLength(2);
    expect(data.datasets[0].label).toBe('Cumulative Completed');
    expect(data.datasets[0].data).toEqual([4, 8, 16]);
    expect(data.datasets[1].label).toBe('Remaining');
    expect(data.datasets[1].data).toEqual([26, 22, 14]);
  });

  it('renders empty state when no timeline data', () => {
    render(<SessionThroughputChart completionTimeline={[]} />);

    expect(
      screen.getByTestId('session-throughput-chart-empty'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('No session timeline data available'),
    ).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(
      <SessionThroughputChart completionTimeline={timeline} />,
    );

    expect(container).toMatchSnapshot();
  });

  it('matches empty snapshot', () => {
    const { container } = render(
      <SessionThroughputChart completionTimeline={[]} />,
    );

    expect(container).toMatchSnapshot();
  });
});
