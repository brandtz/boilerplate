import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppShell } from '@/components/shell/AppShell';
import { renderWithProviders } from '../test-utils';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('AppShell', () => {
  it('renders the full shell structure', async () => {
    renderWithProviders(
      <AppShell>
        <div data-testid="child-content">Hello</div>
      </AppShell>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    });
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
    expect(screen.getByTestId('status-bar')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('renders children in the main content area', async () => {
    renderWithProviders(
      <AppShell>
        <p>Test content</p>
      </AppShell>,
    );

    await waitFor(() => {
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });
  });

  it('has correct ARIA landmark for main content', () => {
    renderWithProviders(
      <AppShell>
        <p>Content</p>
      </AppShell>,
    );

    expect(screen.getByRole('main', { name: /main content/i })).toBeInTheDocument();
  });

  it('toggles sidebar collapsed state', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AppShell>
        <p>Content</p>
      </AppShell>,
    );

    const sidebar = screen.getByTestId('sidebar');
    // Initially expanded (w-48)
    expect(sidebar.className).toContain('w-48');

    // Click toggle
    const toggle = screen.getByTestId('sidebar-toggle');
    await user.click(toggle);

    // Now collapsed (w-14)
    expect(sidebar.className).toContain('w-14');
  });
});
