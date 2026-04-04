import { render, screen } from '@testing-library/react';
import { SummaryCard } from '@/components/overview/SummaryCard';

describe('SummaryCard', () => {
  it('renders label and value', () => {
    render(<SummaryCard label="Epics" value={6} />);

    expect(screen.getByText('Epics')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('has correct ARIA attributes', () => {
    render(<SummaryCard label="Tasks" value={42} />);

    const card = screen.getByRole('status');
    expect(card).toHaveAttribute('aria-label', 'Tasks count: 42');
  });

  it('handles zero values', () => {
    render(<SummaryCard label="Blocked" value={0} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Blocked count: 0',
    );
  });

  it('renders with scope variant by default', () => {
    render(<SummaryCard label="Epics" value={3} />);

    const card = screen.getByRole('status');
    expect(card.className).toContain('border-l-blue-500');
  });

  it('renders with execution variant', () => {
    render(<SummaryCard label="Done" value={5} variant="execution" />);

    const card = screen.getByRole('status');
    expect(card.className).toContain('border-l-emerald-500');
  });

  it('renders data-testid with normalized label', () => {
    render(<SummaryCard label="In Progress" value={2} />);

    expect(screen.getByTestId('summary-card-in-progress')).toBeInTheDocument();
  });
});
