import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '@/components/shell/Sidebar';

// Mock next/navigation
const mockPathname = jest.fn().mockReturnValue('/');
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

describe('Sidebar', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/');
  });

  it('renders all five navigation items', () => {
    render(<Sidebar />);
    expect(screen.getByTestId('nav-overview')).toBeInTheDocument();
    expect(screen.getByTestId('nav-epics')).toBeInTheDocument();
    expect(screen.getByTestId('nav-prompts')).toBeInTheDocument();
    expect(screen.getByTestId('nav-sessions')).toBeInTheDocument();
    expect(screen.getByTestId('nav-tasks')).toBeInTheDocument();
  });

  it('shows labels when not collapsed', () => {
    render(<Sidebar collapsed={false} />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Epics')).toBeInTheDocument();
    expect(screen.getByText('Prompts')).toBeInTheDocument();
    expect(screen.getByText('Sessions')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
  });

  it('hides labels when collapsed', () => {
    render(<Sidebar collapsed={true} />);
    expect(screen.queryByText('Overview')).not.toBeInTheDocument();
    expect(screen.queryByText('Epics')).not.toBeInTheDocument();
  });

  it('highlights the active route with aria-current', () => {
    mockPathname.mockReturnValue('/');
    render(<Sidebar />);
    const overviewLink = screen.getByTestId('nav-overview');
    expect(overviewLink).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('nav-epics')).not.toHaveAttribute('aria-current');
  });

  it('highlights /epics route correctly', () => {
    mockPathname.mockReturnValue('/epics');
    render(<Sidebar />);
    expect(screen.getByTestId('nav-epics')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('nav-overview')).not.toHaveAttribute('aria-current');
  });

  it('has navigation landmark role', () => {
    render(<Sidebar />);
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
  });

  it('calls onToggle when toggle button is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();
    render(<Sidebar onToggle={onToggle} />);

    const toggleButton = screen.getByTestId('sidebar-toggle');
    await user.click(toggleButton);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('does not render toggle button when onToggle is not provided', () => {
    render(<Sidebar />);
    expect(screen.queryByTestId('sidebar-toggle')).not.toBeInTheDocument();
  });
});
