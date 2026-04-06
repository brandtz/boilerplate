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
    <figure
      role="img"
      aria-label={`Epic completion bar chart. ${labels.map((l, i) => `${l}: ${values[i]}%`).join(', ')}`}
      className="rounded-lg border border-gray-200 bg-white p-4"
      data-testid="epic-completion-chart"
    >
      <h3 className="mb-3 text-sm font-semibold text-gray-700">
        Epic Completion
      </h3>
      <div className="h-64" aria-hidden="true">
        <Bar data={data} options={defaultBarOptions} />
      </div>
      <table className="sr-only">
        <caption>Epic completion percentages</caption>
        <thead><tr><th>Epic</th><th>Completion %</th></tr></thead>
        <tbody>
          {labels.map((l, i) => (
            <tr key={l}><td>{l}</td><td>{values[i]}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
