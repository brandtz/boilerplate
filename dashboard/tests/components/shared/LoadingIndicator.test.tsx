import { render, screen } from '@testing-library/react';
import { LoadingIndicator } from '@/components/shared/LoadingIndicator';

describe('LoadingIndicator', () => {
  it('renders when isLoading is true', () => {
    render(<LoadingIndicator isLoading={true} />);
    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });

  it('does not render when isLoading is false', () => {
    render(<LoadingIndicator isLoading={false} />);
    expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
  });

  it('has progressbar role', () => {
    render(<LoadingIndicator isLoading={true} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('has accessible label', () => {
    render(<LoadingIndicator isLoading={true} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'Loading dashboard data');
  });
});
