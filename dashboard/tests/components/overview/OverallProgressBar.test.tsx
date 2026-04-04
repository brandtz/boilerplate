import { render, screen } from '@testing-library/react';
import { OverallProgressBar } from '@/components/overview/OverallProgressBar';

describe('OverallProgressBar', () => {
  it('renders both scope and execution bars', () => {
    render(<OverallProgressBar scopePercent={60} executionPercent={40} />);

    expect(screen.getByTestId('progress-scope')).toBeInTheDocument();
    expect(screen.getByTestId('progress-execution')).toBeInTheDocument();
  });

  it('displays correct percentages', () => {
    render(<OverallProgressBar scopePercent={75} executionPercent={50} />);

    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('has correct ARIA attributes for scope bar', () => {
    render(<OverallProgressBar scopePercent={60} executionPercent={30} />);

    const scopeBar = screen.getByRole('progressbar', { name: /scope: 60%/i });
    expect(scopeBar).toHaveAttribute('aria-valuenow', '60');
    expect(scopeBar).toHaveAttribute('aria-valuemin', '0');
    expect(scopeBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('has correct ARIA attributes for execution bar', () => {
    render(<OverallProgressBar scopePercent={60} executionPercent={30} />);

    const execBar = screen.getByRole('progressbar', {
      name: /execution: 30%/i,
    });
    expect(execBar).toHaveAttribute('aria-valuenow', '30');
  });

  it('clamps values above 100', () => {
    render(<OverallProgressBar scopePercent={150} executionPercent={200} />);

    const percentTexts = screen.getAllByText('100%');
    expect(percentTexts).toHaveLength(2);
    const bars = screen.getAllByRole('progressbar');
    bars.forEach((bar) => {
      expect(Number(bar.getAttribute('aria-valuenow'))).toBeLessThanOrEqual(100);
    });
  });

  it('clamps values below 0', () => {
    render(<OverallProgressBar scopePercent={-10} executionPercent={-5} />);

    const bars = screen.getAllByRole('progressbar');
    bars.forEach((bar) => {
      expect(Number(bar.getAttribute('aria-valuenow'))).toBeGreaterThanOrEqual(0);
    });
  });
});
