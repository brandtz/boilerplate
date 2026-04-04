import { render, screen } from '@testing-library/react';
import { HealthBadge } from '@/components/overview/HealthBadge';

describe('HealthBadge', () => {
  it('renders On Track label for on_track status', () => {
    render(<HealthBadge status="on_track" />);

    expect(screen.getByText('On Track')).toBeInTheDocument();
    expect(screen.getByTestId('health-badge')).toHaveAttribute(
      'aria-label',
      'Project health: On Track',
    );
  });

  it('renders At Risk label', () => {
    render(<HealthBadge status="at_risk" />);

    expect(screen.getByText('At Risk')).toBeInTheDocument();
  });

  it('renders Blocked label', () => {
    render(<HealthBadge status="blocked" />);

    expect(screen.getByText('Blocked')).toBeInTheDocument();
  });

  it('renders Not Started label', () => {
    render(<HealthBadge status="not_started" />);

    expect(screen.getByText('Not Started')).toBeInTheDocument();
  });

  it('applies green styles for on_track', () => {
    render(<HealthBadge status="on_track" />);

    const badge = screen.getByTestId('health-badge');
    expect(badge.className).toContain('bg-green-100');
    expect(badge.className).toContain('text-green-800');
  });

  it('applies yellow styles for at_risk', () => {
    render(<HealthBadge status="at_risk" />);

    const badge = screen.getByTestId('health-badge');
    expect(badge.className).toContain('bg-yellow-100');
  });

  it('applies red styles for blocked', () => {
    render(<HealthBadge status="blocked" />);

    const badge = screen.getByTestId('health-badge');
    expect(badge.className).toContain('bg-red-100');
  });

  it('applies gray styles for not_started', () => {
    render(<HealthBadge status="not_started" />);

    const badge = screen.getByTestId('health-badge');
    expect(badge.className).toContain('bg-gray-100');
  });
});
