import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RepoSelector } from '@/components/shell/RepoSelector';

// Mock recentProjects module
const mockGetRecent = jest.fn().mockReturnValue([]);
const mockSaveRecent = jest.fn();
const mockRemoveRecent = jest.fn();
const mockClearRecent = jest.fn();

jest.mock('@/lib/recentProjects', () => ({
  getRecentProjects: () => mockGetRecent(),
  saveRecentPath: (...args: unknown[]) => mockSaveRecent(...args),
  removeRecentPath: (...args: unknown[]) => mockRemoveRecent(...args),
  clearRecentProjects: () => mockClearRecent(),
}));

describe('RepoSelector', () => {
  const defaultProps = {
    currentPath: '/projects/Boilerplate',
    onSelectPath: jest.fn().mockResolvedValue(undefined),
  };

  afterEach(() => {
    jest.clearAllMocks();
    mockGetRecent.mockReturnValue([]);
  });

  it('renders current repo basename', () => {
    render(<RepoSelector {...defaultProps} />);
    expect(screen.getByTestId('repo-selector-trigger')).toHaveTextContent('Boilerplate');
  });

  it('opens dropdown on click', async () => {
    const user = userEvent.setup();
    render(<RepoSelector {...defaultProps} />);

    await user.click(screen.getByTestId('repo-selector-trigger'));
    expect(screen.getByTestId('repo-selector-dropdown')).toBeInTheDocument();
  });

  it('shows path input in dropdown', async () => {
    const user = userEvent.setup();
    render(<RepoSelector {...defaultProps} />);

    await user.click(screen.getByTestId('repo-selector-trigger'));
    expect(screen.getByTestId('repo-path-input')).toBeInTheDocument();
  });

  it('calls onSelectPath when path is submitted', async () => {
    const user = userEvent.setup();
    const onSelectPath = jest.fn().mockResolvedValue(undefined);
    render(<RepoSelector {...defaultProps} onSelectPath={onSelectPath} />);

    await user.click(screen.getByTestId('repo-selector-trigger'));
    await user.type(screen.getByTestId('repo-path-input'), '/projects/new-repo');
    await user.click(screen.getByTestId('repo-path-submit'));

    expect(onSelectPath).toHaveBeenCalledWith('/projects/new-repo');
  });

  it('shows recent projects list', async () => {
    const user = userEvent.setup();
    mockGetRecent.mockReturnValue(['/projects/alpha', '/projects/beta']);
    render(<RepoSelector {...defaultProps} />);

    await user.click(screen.getByTestId('repo-selector-trigger'));
    expect(screen.getByTestId('recent-item-alpha')).toBeInTheDocument();
    expect(screen.getByTestId('recent-item-beta')).toBeInTheDocument();
  });

  it('calls onSelectPath when recent item is clicked', async () => {
    const user = userEvent.setup();
    const onSelectPath = jest.fn().mockResolvedValue(undefined);
    mockGetRecent.mockReturnValue(['/projects/alpha']);
    render(<RepoSelector {...defaultProps} onSelectPath={onSelectPath} />);

    await user.click(screen.getByTestId('repo-selector-trigger'));
    await user.click(screen.getByText('alpha'));

    expect(onSelectPath).toHaveBeenCalledWith('/projects/alpha');
  });

  it('removes recent item when × is clicked', async () => {
    const user = userEvent.setup();
    mockGetRecent.mockReturnValue(['/projects/alpha']);
    render(<RepoSelector {...defaultProps} />);

    await user.click(screen.getByTestId('repo-selector-trigger'));
    await user.click(screen.getByTestId('remove-recent-alpha'));

    expect(mockRemoveRecent).toHaveBeenCalledWith('/projects/alpha');
  });

  it('clears all recent items when Clear History is clicked', async () => {
    const user = userEvent.setup();
    mockGetRecent.mockReturnValue(['/projects/alpha', '/projects/beta']);
    render(<RepoSelector {...defaultProps} />);

    await user.click(screen.getByTestId('repo-selector-trigger'));
    await user.click(screen.getByTestId('clear-recent'));

    expect(mockClearRecent).toHaveBeenCalledTimes(1);
  });

  it('shows no recent message when empty', async () => {
    const user = userEvent.setup();
    render(<RepoSelector {...defaultProps} />);

    await user.click(screen.getByTestId('repo-selector-trigger'));
    expect(screen.getByTestId('no-recent')).toHaveTextContent('No recent projects');
  });

  it('shows error when onSelectPath rejects', async () => {
    const user = userEvent.setup();
    const onSelectPath = jest.fn().mockRejectedValue(new Error('Not compatible'));
    render(<RepoSelector {...defaultProps} onSelectPath={onSelectPath} />);

    await user.click(screen.getByTestId('repo-selector-trigger'));
    await user.type(screen.getByTestId('repo-path-input'), '/bad/path');
    await user.click(screen.getByTestId('repo-path-submit'));

    expect(await screen.findByTestId('repo-selector-error')).toHaveTextContent('Not compatible');
  });

  it('has aria-expanded on trigger button', async () => {
    const user = userEvent.setup();
    render(<RepoSelector {...defaultProps} />);

    const trigger = screen.getByTestId('repo-selector-trigger');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('has accessible input label', async () => {
    const user = userEvent.setup();
    render(<RepoSelector {...defaultProps} />);

    await user.click(screen.getByTestId('repo-selector-trigger'));
    expect(screen.getByLabelText('Repository path')).toBeInTheDocument();
  });

  it('handles Windows-style backslash paths', () => {
    render(<RepoSelector {...defaultProps} currentPath="C:\\Projects\\Boilerplate" />);
    expect(screen.getByTestId('repo-selector-trigger')).toHaveTextContent('Boilerplate');
  });
});
