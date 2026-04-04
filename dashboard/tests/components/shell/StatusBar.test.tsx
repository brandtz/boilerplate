import { screen, waitFor } from '@testing-library/react';
import { StatusBar } from '@/components/shell/StatusBar';
import { renderWithProviders, createMockState } from '../test-utils';

describe('StatusBar', () => {
  it('renders last-parsed time', async () => {
    renderWithProviders(<StatusBar />);
    await waitFor(() => {
      expect(screen.getByTestId('status-parsed')).toHaveTextContent(/Last parsed:/);
    });
  });

  it('renders prompt count', async () => {
    const state = createMockState({
      project: { ...createMockState().project, totalPrompts: 42 },
    });
    renderWithProviders(<StatusBar />, { state });

    await waitFor(() => {
      expect(screen.getByTestId('status-prompts')).toHaveTextContent('42 prompts');
    });
  });

  it('renders warning count', async () => {
    renderWithProviders(<StatusBar />);
    await waitFor(() => {
      expect(screen.getByTestId('status-warnings')).toHaveTextContent('0 warnings');
    });
  });

  it('renders error count when there are errors', async () => {
    const state = createMockState({
      warnings: [
        { file: 'test.md', code: 'E_TEST', message: 'Test error', severity: 'error' },
        { file: 'test2.md', code: 'W_TEST', message: 'Test warning', severity: 'warning' },
      ],
    });
    renderWithProviders(<StatusBar />, { state });

    await waitFor(() => {
      expect(screen.getByTestId('status-errors')).toHaveTextContent('1 error');
      expect(screen.getByTestId('status-warnings')).toHaveTextContent('2 warnings');
    });
  });

  it('has status role for accessibility', () => {
    renderWithProviders(<StatusBar />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
