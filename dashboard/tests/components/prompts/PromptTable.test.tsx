import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ParsedPrompt } from '@/types';
import { PromptTable, type SortColumn, type SortDirection } from '@/components/prompts/PromptTable';

function makePrompt(id: string, overrides?: Partial<ParsedPrompt>): ParsedPrompt {
  return {
    promptId: id,
    title: `Prompt ${id}`,
    phase: 'implementation',
    status: 'ready',
    epicId: 'E1',
    storyId: 'E1-S1',
    taskIds: [],
    role: 'Engineer',
    prerequisites: [],
    requiredReading: [],
    downstreamPrompts: [],
    insertedAfter: null,
    affectsPrompts: [],
    reviewRequired: [],
    createdAt: '2026-04-03T00:00:00Z',
    updatedAt: '2026-04-03T00:00:00Z',
    sessionHandoff: '',
    supersedes: '',
    supersededBy: '',
    insertReason: '',
    completedAt: '',
    archivedAt: '',
    body: '',
    sourcePath: `prompts/active/${id}.md`,
    ...overrides,
  };
}

const defaultProps = {
  sortColumn: 'promptId' as SortColumn,
  sortDirection: 'asc' as SortDirection,
  onSort: jest.fn(),
  onRowClick: jest.fn(),
  currentPage: 1,
  pageSize: 25,
  onPageChange: jest.fn(),
};

describe('PromptTable', () => {
  it('renders rows for each prompt', () => {
    const prompts = [makePrompt('1.0.1'), makePrompt('2.0.1'), makePrompt('3.0.1')];
    render(<PromptTable {...defaultProps} prompts={prompts} />);

    expect(screen.getByTestId('prompt-row-1.0.1')).toBeInTheDocument();
    expect(screen.getByTestId('prompt-row-2.0.1')).toBeInTheDocument();
    expect(screen.getByTestId('prompt-row-3.0.1')).toBeInTheDocument();
  });

  it('shows empty state when no prompts', () => {
    render(<PromptTable {...defaultProps} prompts={[]} />);
    expect(screen.getByTestId('prompt-table-empty')).toHaveTextContent(
      'No prompts match your filters',
    );
  });

  it('calls onSort when column header is clicked', async () => {
    const user = userEvent.setup();
    const onSort = jest.fn();
    render(
      <PromptTable
        {...defaultProps}
        prompts={[makePrompt('1.0.1')]}
        onSort={onSort}
      />,
    );

    await user.click(screen.getByTestId('sort-header-status'));
    expect(onSort).toHaveBeenCalledWith('status');
  });

  it('shows sort indicator on active column', () => {
    render(
      <PromptTable
        {...defaultProps}
        prompts={[makePrompt('1.0.1')]}
        sortColumn="promptId"
        sortDirection="asc"
      />,
    );
    expect(screen.getByTestId('sort-header-promptId')).toHaveTextContent('# ↑');
  });

  it('shows descending indicator', () => {
    render(
      <PromptTable
        {...defaultProps}
        prompts={[makePrompt('1.0.1')]}
        sortColumn="promptId"
        sortDirection="desc"
      />,
    );
    expect(screen.getByTestId('sort-header-promptId')).toHaveTextContent('# ↓');
  });

  it('sorts by promptId in natural tuple order', () => {
    const prompts = [
      makePrompt('16.0.1'),
      makePrompt('2.0.1'),
      makePrompt('1.0.1'),
    ];
    render(
      <PromptTable
        {...defaultProps}
        prompts={prompts}
        sortColumn="promptId"
        sortDirection="asc"
      />,
    );

    const rows = screen.getAllByRole('row').slice(1); // skip header
    expect(rows[0]).toHaveTextContent('1.0.1');
    expect(rows[1]).toHaveTextContent('2.0.1');
    expect(rows[2]).toHaveTextContent('16.0.1');
  });

  it('sorts by status with blocked first', () => {
    const prompts = [
      makePrompt('1.0.1', { status: 'done' }),
      makePrompt('2.0.1', { status: 'blocked' }),
      makePrompt('3.0.1', { status: 'ready' }),
    ];
    render(
      <PromptTable
        {...defaultProps}
        prompts={prompts}
        sortColumn="status"
        sortDirection="asc"
      />,
    );

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('2.0.1');
  });

  it('calls onRowClick when row is clicked', async () => {
    const user = userEvent.setup();
    const onRowClick = jest.fn();
    render(
      <PromptTable
        {...defaultProps}
        prompts={[makePrompt('3.0.1')]}
        onRowClick={onRowClick}
      />,
    );

    await user.click(screen.getByTestId('prompt-row-3.0.1'));
    expect(onRowClick).toHaveBeenCalledWith('3.0.1');
  });

  it('calls onRowClick on Enter key', async () => {
    const user = userEvent.setup();
    const onRowClick = jest.fn();
    render(
      <PromptTable
        {...defaultProps}
        prompts={[makePrompt('3.0.1')]}
        onRowClick={onRowClick}
      />,
    );

    const row = screen.getByTestId('prompt-row-3.0.1');
    row.focus();
    await user.keyboard('{Enter}');
    expect(onRowClick).toHaveBeenCalledWith('3.0.1');
  });

  it('applies muted styling to archived prompts', () => {
    const prompts = [makePrompt('1.0.1', { archivedAt: '2026-04-04' })];
    render(<PromptTable {...defaultProps} prompts={prompts} />);

    const row = screen.getByTestId('prompt-row-1.0.1');
    expect(row.className).toContain('opacity-60');
  });

  it('applies line-through to superseded prompt titles', () => {
    const prompts = [makePrompt('1.0.1', { status: 'superseded' })];
    render(<PromptTable {...defaultProps} prompts={prompts} />);

    const row = screen.getByTestId('prompt-row-1.0.1');
    const titleCell = row.querySelectorAll('td')[1];
    expect(titleCell?.className).toContain('line-through');
  });

  it('shows location "arc" for archived prompts', () => {
    const prompts = [makePrompt('1.0.1', { archivedAt: '2026-04-04' })];
    render(<PromptTable {...defaultProps} prompts={prompts} />);
    expect(screen.getByTestId('prompt-row-1.0.1')).toHaveTextContent('arc');
  });

  it('paginates with 30 prompts and pageSize 25', () => {
    const prompts = Array.from({ length: 30 }, (_, i) =>
      makePrompt(`${i + 1}.0.1`),
    );
    render(<PromptTable {...defaultProps} prompts={prompts} pageSize={25} />);

    // Should show first 25 rows
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows).toHaveLength(25);

    // Pagination should be visible
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  it('shows prompt count', () => {
    const prompts = [makePrompt('1.0.1'), makePrompt('2.0.1')];
    render(<PromptTable {...defaultProps} prompts={prompts} />);
    expect(screen.getByTestId('prompt-count')).toHaveTextContent(
      'Showing 2 of 2 prompts',
    );
  });

  it('has correct aria-sort on sorted column', () => {
    render(
      <PromptTable
        {...defaultProps}
        prompts={[makePrompt('1.0.1')]}
        sortColumn="title"
        sortDirection="desc"
      />,
    );
    expect(screen.getByTestId('sort-header-title')).toHaveAttribute(
      'aria-sort',
      'descending',
    );
    expect(screen.getByTestId('sort-header-promptId')).toHaveAttribute(
      'aria-sort',
      'none',
    );
  });
});
