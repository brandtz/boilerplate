'use client';

import { Bar } from 'react-chartjs-2';
import '@/lib/chartConfig'; // registers Chart.js components
import { defaultBarOptions } from '@/lib/chartConfig';

interface EpicCompletionChartProps {
  epicCompletionPercents: Record<string, number>;
}

export function EpicCompletionChart({
  epicCompletionPercents,
}: EpicCompletionChartProps) {
  const labels = Object.keys(epicCompletionPercents);
  const values = Object.values(epicCompletionPercents);

  if (labels.length === 0) {
    return (
      <div
        data-testid="epic-completion-chart-empty"
        className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm text-gray-400"
      >
        No epic data available
      </div>
    );
  }

  const data = {
    labels,
    datasets: [
      {
        label: 'Completion %',
        data: values,
        backgroundColor: '#3B82F6',
        borderRadius: 4,
      },
    ],
  };

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-4"
      data-testid="epic-completion-chart"
    >
      <h3 className="mb-3 text-sm font-semibold text-gray-700">
        Epic Completion
      </h3>
      <div className="h-64">
        <Bar data={data} options={defaultBarOptions} />
      </div>
    </div>
  );
}
