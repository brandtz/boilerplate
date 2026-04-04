/**
 * Mock for react-chartjs-2 chart components.
 * In jsdom, canvas is not available so we mock chart rendering
 * to validate that correct data/options are passed.
 */

import type { ReactElement } from 'react';

function createMockChart(displayName: string) {
  function MockChart(props: Record<string, unknown>): ReactElement {
    return (
      <div
        data-testid={`mock-${displayName.toLowerCase()}-chart`}
        data-chart-data={JSON.stringify(props.data)}
        data-chart-options={JSON.stringify(props.options)}
      />
    );
  }
  MockChart.displayName = displayName;
  return MockChart;
}

export const Bar = createMockChart('Bar');
export const Doughnut = createMockChart('Doughnut');
export const Line = createMockChart('Line');
export const Pie = createMockChart('Pie');
