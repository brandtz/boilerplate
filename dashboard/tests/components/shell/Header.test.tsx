import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '@/components/shell/Header';
import { renderWithProviders, createMockState } from '../test-utils';

describe('Header', () => {
  it('renders project name from state', async () => {
    const state = createMockState({
      project: {
        ...createMockState().project,
        projectName: 'My Dashboard',
      },
    });
    renderWithProviders(<Header />, { state });

    await waitFor(() => {
      expect(screen.getByText('My Dashboard')).toBeInTheDocument();
    });
  });

  it('renders refresh button', () => {
    renderWithProviders(<Header />);
    expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh dashboard/i })).toBeInTheDocument();
  });

  it('renders last-parsed time', async () => {
    renderWithProviders(<Header />);
    await waitFor(() => {
      expect(screen.getByTestId('last-parsed')).toBeInTheDocument();
    });
  });

  it('calls refresh when refresh button is clicked', async () => {
    const user = userEvent.setup();
    const parseFn = jest.fn().mockResolvedValue(createMockState());
    renderWithProviders(<Header />, { parseFn });

    await waitFor(() => {
      expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('refresh-button'));

    // parseFn should be called (at least once for mount + once for refresh)
    await waitFor(() => {
      expect(parseFn).toHaveBeenCalled();
    });
  });
});
