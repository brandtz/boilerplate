import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from '@/components/shared/Pagination';

describe('Pagination', () => {
  it('renders nothing when totalPages is 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={jest.fn()} />,
    );
    expect(container.querySelector('nav')).toBeNull();
  });

  it('renders nothing when totalPages is 0', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={0} onPageChange={jest.fn()} />,
    );
    expect(container.querySelector('nav')).toBeNull();
  });

  it('renders page buttons for small page counts', () => {
    render(
      <Pagination currentPage={1} totalPages={3} onPageChange={jest.fn()} />,
    );
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-page-1')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-page-2')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-page-3')).toBeInTheDocument();
  });

  it('disables Previous button on first page', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={jest.fn()} />,
    );
    expect(screen.getByTestId('pagination-prev')).toBeDisabled();
  });

  it('disables Next button on last page', () => {
    render(
      <Pagination currentPage={5} totalPages={5} onPageChange={jest.fn()} />,
    );
    expect(screen.getByTestId('pagination-next')).toBeDisabled();
  });

  it('enables both buttons on a middle page', () => {
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={jest.fn()} />,
    );
    expect(screen.getByTestId('pagination-prev')).not.toBeDisabled();
    expect(screen.getByTestId('pagination-next')).not.toBeDisabled();
  });

  it('calls onPageChange with previous page when Previous is clicked', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={onChange} />,
    );

    await user.click(screen.getByTestId('pagination-prev'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with next page when Next is clicked', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={onChange} />,
    );

    await user.click(screen.getByTestId('pagination-next'));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('calls onPageChange with clicked page number', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={onChange} />,
    );

    await user.click(screen.getByTestId('pagination-page-2'));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('marks current page with aria-current', () => {
    render(
      <Pagination currentPage={2} totalPages={4} onPageChange={jest.fn()} />,
    );
    expect(screen.getByTestId('pagination-page-2')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('pagination-page-1')).not.toHaveAttribute('aria-current');
  });

  it('renders ellipsis for large page counts when on page 1', () => {
    render(
      <Pagination currentPage={1} totalPages={10} onPageChange={jest.fn()} />,
    );
    // Page 1 should show: 1, 2, ..., 10
    expect(screen.getByTestId('pagination-page-1')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-page-2')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-page-10')).toBeInTheDocument();
    // Middle pages hidden
    expect(screen.queryByTestId('pagination-page-5')).toBeNull();
    // Ellipsis present
    expect(screen.getByText('…')).toBeInTheDocument();
  });

  it('renders ellipsis on both sides when on middle page', () => {
    render(
      <Pagination currentPage={5} totalPages={10} onPageChange={jest.fn()} />,
    );
    // Should show: 1, ..., 4, 5, 6, ..., 10
    expect(screen.getByTestId('pagination-page-1')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-page-4')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-page-5')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-page-6')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-page-10')).toBeInTheDocument();
    // Two ellipses
    const ellipses = screen.getAllByText('…');
    expect(ellipses).toHaveLength(2);
  });

  it('renders ellipsis only on left when on last page', () => {
    render(
      <Pagination currentPage={10} totalPages={10} onPageChange={jest.fn()} />,
    );
    // Should show: 1, ..., 9, 10
    expect(screen.getByTestId('pagination-page-1')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-page-9')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-page-10')).toBeInTheDocument();
    expect(screen.getAllByText('…')).toHaveLength(1);
  });

  it('does not render ellipsis for 4 pages', () => {
    render(
      <Pagination currentPage={2} totalPages={4} onPageChange={jest.fn()} />,
    );
    expect(screen.getByTestId('pagination-page-1')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-page-2')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-page-3')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-page-4')).toBeInTheDocument();
    expect(screen.queryByText('…')).toBeNull();
  });

  it('has accessible label on nav element', () => {
    render(
      <Pagination currentPage={1} totalPages={3} onPageChange={jest.fn()} />,
    );
    expect(screen.getByLabelText('Pagination')).toBeInTheDocument();
  });

  it('page buttons have accessible labels', () => {
    render(
      <Pagination currentPage={1} totalPages={3} onPageChange={jest.fn()} />,
    );
    expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 3')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
  });

  it('handles two-page scenario correctly', () => {
    render(
      <Pagination currentPage={2} totalPages={2} onPageChange={jest.fn()} />,
    );
    expect(screen.getByTestId('pagination-page-1')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-page-2')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-prev')).not.toBeDisabled();
    expect(screen.getByTestId('pagination-next')).toBeDisabled();
  });
});
