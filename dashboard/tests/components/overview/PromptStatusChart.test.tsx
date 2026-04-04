import { render, screen } from '@testing-library/react';
import { PromptStatusChart } from '@/components/overview/PromptStatusChart';
import type { PromptStatus } from '@/types';

describe('PromptStatusChart', () => {
  const defaultStatus: Record<PromptStatus, number> = {
    draft: 0,
    ready: 5,
    in_progress: 2,
    in_review: 1,
    blocked: 0,
    done: 10,
    superseded: 0,
    cancelled: 0,
  };

  it('renders chart with status data', () => {
    render(<PromptStatusChart promptsByStatus={defaultStatus} />);

    expect(screen.getByTestId('prompt-status-chart')).toBeInTheDocument();
    expect(screen.getByText('Prompt Status Distribution')).toBeInTheDocument();
  });

  it('passes correct data to Doughnut chart (filters zero counts)', () => {
    render(<PromptStatusChart promptsByStatus={defaultStatus} />);

    const chart = screen.getByTestId('mock-doughnut-chart');
    const data = JSON.parse(chart.getAttribute('data-chart-data')!);

    // Only non-zero statuses: ready(5), in_progress(2), in_review(1), done(10)
    expect(data.labels).toHaveLength(4);
    expect(data.datasets[0].data).toEqual([5, 2, 1, 10]);
  });

  it('renders empty state when all counts are zero', () => {
    const zeroStatus: Record<PromptStatus, number> = {
      draft: 0,
      ready: 0,
      in_progress: 0,
      in_review: 0,
      blocked: 0,
      done: 0,
      superseded: 0,
      cancelled: 0,
    };

    render(<PromptStatusChart promptsByStatus={zeroStatus} />);

    expect(
      screen.getByTestId('prompt-status-chart-empty'),
    ).toBeInTheDocument();
    expect(screen.getByText('No prompt data available')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(
      <PromptStatusChart promptsByStatus={defaultStatus} />,
    );

    expect(container).toMatchSnapshot();
  });

  it('matches empty snapshot', () => {
    const zeroStatus: Record<PromptStatus, number> = {
      draft: 0,
      ready: 0,
      in_progress: 0,
      in_review: 0,
      blocked: 0,
      done: 0,
      superseded: 0,
      cancelled: 0,
    };

    const { container } = render(
      <PromptStatusChart promptsByStatus={zeroStatus} />,
    );

    expect(container).toMatchSnapshot();
  });
});
