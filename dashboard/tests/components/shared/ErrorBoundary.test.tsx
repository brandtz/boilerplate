import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div data-testid="child">OK</div>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for expected errors
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary viewName="Test">
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('child')).toHaveTextContent('OK');
  });

  it('renders fallback UI when child throws', () => {
    render(
      <ErrorBoundary viewName="Test View">
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/something went wrong in Test View/i)).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary viewName="Test" fallback={<div data-testid="custom-fallback">Custom</div>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
  });

  it('renders retry button that resets error state', async () => {
    const user = userEvent.setup();

    // Use a variable to control throwing so we can stop after retry
    let shouldThrow = true;

    function ConditionalThrower() {
      if (shouldThrow) throw new Error('Retry test');
      return <div data-testid="recovered">Recovered</div>;
    }

    render(
      <ErrorBoundary viewName="Retry Test">
        <ConditionalThrower />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

    // Stop throwing, then retry
    shouldThrow = false;
    await user.click(screen.getByText('Retry'));

    expect(screen.getByTestId('recovered')).toHaveTextContent('Recovered');
  });
});
