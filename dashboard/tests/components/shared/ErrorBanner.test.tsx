import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBanner } from '@/components/shared/ErrorBanner';

describe('ErrorBanner', () => {
  const defaultProps = {
    message: 'Failed to parse repository',
    onRetry: jest.fn(),
  };

  afterEach(() => jest.clearAllMocks());

  it('renders error message', () => {
    render(<ErrorBanner {...defaultProps} />);
    expect(screen.getByTestId('error-message')).toHaveTextContent('Failed to parse repository');
  });

  it('has alert role', () => {
    render(<ErrorBanner {...defaultProps} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders retry button', () => {
    render(<ErrorBanner {...defaultProps} />);
    expect(screen.getByTestId('error-retry')).toHaveTextContent('Retry');
  });

  it('calls onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();
    render(<ErrorBanner {...defaultProps} onRetry={onRetry} />);

    await user.click(screen.getByTestId('error-retry'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
