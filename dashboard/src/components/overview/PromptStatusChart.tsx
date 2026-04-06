'use client';

import { Doughnut } from 'react-chartjs-2';
import '@/lib/chartConfig';
import { defaultDoughnutOptions, STATUS_COLORS } from '@/lib/chartConfig';
import type { PromptStatus } from '@/types';

interface PromptStatusChartProps {
  promptsByStatus: Record<PromptStatus, number>;
}

export function PromptStatusChart({
  promptsByStatus,
}: PromptStatusChartProps) {
  const entries = Object.entries(promptsByStatus).filter(
    ([, count]) => count > 0,
  );

  if (entries.length === 0) {
    return (
      <div
        data-testid="prompt-status-chart-empty"
        className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm text-gray-400"
      >
        No prompt data available
      </div>
    );
  }

  const labels = entries.map(([status]) => status.replace(/_/g, ' '));
  const values = entries.map(([, count]) => count);
  const colors = entries.map(([status]) => STATUS_COLORS[status] ?? '#9CA3AF');

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: colors,
        borderWidth: 1,
        borderColor: '#fff',
      },
    ],
  };

  return (
    <figure
      role="img"
      aria-label={`Prompt status doughnut chart. ${labels.map((l, i) => `${l}: ${values[i]}`).join(', ')}`}
      className="rounded-lg border border-gray-200 bg-white p-4"
      data-testid="prompt-status-chart"
    >
      <h3 className="mb-3 text-sm font-semibold text-gray-700">
        Prompt Status Distribution
      </h3>
      <div className="h-64" aria-hidden="true">
        <Doughnut data={data} options={defaultDoughnutOptions} />
      </div>
      <table className="sr-only">
        <caption>Prompt status distribution</caption>
        <thead><tr><th>Status</th><th>Count</th></tr></thead>
        <tbody>
          {labels.map((l, i) => (
            <tr key={l}><td>{l}</td><td>{values[i]}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
