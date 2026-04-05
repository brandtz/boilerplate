import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { PromptStatus } from '@/types';

describe('StatusBadge', () => {
  const statuses: { status: PromptStatus; label: string }[] = [
    { status: 'draft', label: 'Draft' },
    { status: 'ready', label: 'Ready' },
    { status: 'in_progress', label: 'In Progress' },
    { status: 'in_review', label: 'In Review' },
    { status: 'blocked', label: 'Blocked' },
    { status: 'done', label: 'Done' },
    { status: 'superseded', label: 'Superseded' },
    { status: 'cancelled', label: 'Cancelled' },
  ];

  it.each(statuses)('renders $label for status $status', ({ status, label }) => {
    render(<StatusBadge status={status} />);
    const badge = screen.getByTestId('status-badge');
    expect(badge).toHaveTextContent(label);
    expect(badge).toHaveAttribute('aria-label', `Status: ${label}`);
  });

  it('applies line-through for superseded status', () => {
    render(<StatusBadge status="superseded" />);
    expect(screen.getByTestId('status-badge').className).toContain('line-through');
  });

  it('applies line-through for cancelled status', () => {
    render(<StatusBadge status="cancelled" />);
    expect(screen.getByTestId('status-badge').className).toContain('line-through');
  });

  it('does not apply line-through for done status', () => {
    render(<StatusBadge status="done" />);
    expect(screen.getByTestId('status-badge').className).not.toContain('line-through');
  });

  it('renders sm size by default', () => {
    render(<StatusBadge status="ready" />);
    expect(screen.getByTestId('status-badge').className).toContain('text-xs');
  });

  it('renders md size when specified', () => {
    render(<StatusBadge status="ready" size="md" />);
    expect(screen.getByTestId('status-badge').className).toContain('text-sm');
  });
});
