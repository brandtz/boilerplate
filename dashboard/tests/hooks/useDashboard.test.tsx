import { render, screen, act, waitFor } from '@testing-library/react';
import { DashboardProvider } from '@/context/DashboardContext';
import { useDashboard } from '@/hooks/useDashboard';
import type { DashboardState } from '@/types';
import { createMockState } from '../components/test-utils';

function TestConsumer() {
  const { state, isLoading, error } = useDashboard();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="error">{error ?? 'none'}</span>
      <span data-testid="project-name">{state?.project.projectName ?? 'null'}</span>
    </div>
  );
}

describe('DashboardContext', () => {
  it('provides state after successful parse', async () => {
    const mockState = createMockState();
    const parseFn = jest.fn().mockResolvedValue(mockState);

    render(
      <DashboardProvider parseFn={parseFn}>
        <TestConsumer />
      </DashboardProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('project-name')).toHaveTextContent('Test Project');
    });
  });

  it('shows error when parseFn rejects', async () => {
    const parseFn = jest.fn().mockRejectedValue(new Error('Parse failed'));

    render(
      <DashboardProvider parseFn={parseFn}>
        <TestConsumer />
      </DashboardProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Parse failed');
    });
  });

  it('shows error when no parseFn is provided', async () => {
    render(
      <DashboardProvider>
        <TestConsumer />
      </DashboardProvider>,
    );

    // Without parseFn, no auto-load happens, state stays null
    expect(screen.getByTestId('project-name')).toHaveTextContent('null');
  });

  it('throws when useDashboard is used outside provider', () => {
    // Suppress console.error for the expected error
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      'useDashboard must be used within a <DashboardProvider>',
    );

    spy.mockRestore();
  });

  it('calls parseFn on mount', async () => {
    const parseFn = jest.fn().mockResolvedValue(createMockState());

    render(
      <DashboardProvider parseFn={parseFn}>
        <TestConsumer />
      </DashboardProvider>,
    );

    await waitFor(() => {
      expect(parseFn).toHaveBeenCalledTimes(1);
    });
  });

  it('provides refresh function that re-calls parseFn', async () => {
    const parseFn = jest.fn().mockResolvedValue(createMockState());

    function RefreshTestConsumer() {
      const { refresh } = useDashboard();
      return (
        <button data-testid="refresh" onClick={() => void refresh()}>
          Refresh
        </button>
      );
    }

    const { getByTestId } = render(
      <DashboardProvider parseFn={parseFn}>
        <RefreshTestConsumer />
      </DashboardProvider>,
    );

    // Wait for initial load
    await waitFor(() => {
      expect(parseFn).toHaveBeenCalledTimes(1);
    });

    // Trigger refresh
    await act(async () => {
      getByTestId('refresh').click();
    });

    await waitFor(() => {
      expect(parseFn).toHaveBeenCalledTimes(2);
    });
  });
});
