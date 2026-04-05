'use client';

import { Line } from 'react-chartjs-2';
import '@/lib/chartConfig';
import { defaultLineOptions } from '@/lib/chartConfig';
import type { TimelineDataPoint } from '@/types';

interface RemainingPromptsChartProps {
  completionTimeline: TimelineDataPoint[];
}

export function RemainingPromptsChart({
  completionTimeline,
}: RemainingPromptsChartProps) {
  if (completionTimeline.length === 0) {
    return (
      <div
        data-testid="remaining-prompts-chart-empty"
        className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm text-gray-400"
      >
        No remaining prompts data available
      </div>
    );
  }

  const labels = completionTimeline.map((dp) => dp.date);

  const data = {
    labels,
    datasets: [
      {
        label: 'Remaining Prompts',
        data: completionTimeline.map((dp) => dp.remainingPrompts),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-4"
      data-testid="remaining-prompts-chart"
    >
      <h3 className="mb-3 text-sm font-semibold text-gray-700">
        Remaining Prompts Over Time
      </h3>
      <div className="h-64">
        <Line data={data} options={defaultLineOptions} />
      </div>
    </div>
  );
}
