'use client';

import { Line } from 'react-chartjs-2';
import '@/lib/chartConfig';
import { defaultLineOptions } from '@/lib/chartConfig';
import type { TimelineDataPoint } from '@/types';

interface SessionThroughputChartProps {
  completionTimeline: TimelineDataPoint[];
}

export function SessionThroughputChart({
  completionTimeline,
}: SessionThroughputChartProps) {
  if (completionTimeline.length === 0) {
    return (
      <div
        data-testid="session-throughput-chart-empty"
        className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm text-gray-400"
      >
        No session timeline data available
      </div>
    );
  }

  const labels = completionTimeline.map((dp) => dp.date);

  const data = {
    labels,
    datasets: [
      {
        label: 'Cumulative Completed',
        data: completionTimeline.map((dp) => dp.cumulativeCompleted),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Remaining',
        data: completionTimeline.map((dp) => dp.remainingPrompts),
        borderColor: '#6B7280',
        backgroundColor: 'rgba(107, 114, 128, 0.1)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return (
    <figure
      role="img"
      aria-label="Session throughput line chart showing cumulative completed and remaining prompts over time"
      className="rounded-lg border border-gray-200 bg-white p-4"
      data-testid="session-throughput-chart"
    >
      <h3 className="mb-3 text-sm font-semibold text-gray-700">
        Session Throughput
      </h3>
      <div className="h-64" aria-hidden="true">
        <Line data={data} options={defaultLineOptions} />
      </div>
      <table className="sr-only">
        <caption>Session throughput data</caption>
        <thead><tr><th>Date</th><th>Cumulative Completed</th><th>Remaining</th></tr></thead>
        <tbody>
          {completionTimeline.map((dp) => (
            <tr key={dp.date}><td>{dp.date}</td><td>{dp.cumulativeCompleted}</td><td>{dp.remainingPrompts}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
