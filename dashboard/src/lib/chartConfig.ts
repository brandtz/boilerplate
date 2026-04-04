import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';

// Register all required Chart.js components
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
);

/**
 * Canonical status color map aligned with WCAG AA contrast requirements.
 * Referenced in ADR-003 and docs/dashboard-ux-wireframes.md.
 */
export const STATUS_COLORS: Record<string, string> = {
  draft: '#9CA3AF',       // gray-400
  ready: '#3B82F6',       // blue-500
  in_progress: '#F59E0B', // amber-500
  in_review: '#8B5CF6',   // violet-500
  blocked: '#EF4444',     // red-500
  done: '#10B981',        // emerald-500
  superseded: '#6B7280',  // gray-500
  cancelled: '#D1D5DB',   // gray-300
};

/** Default chart options for consistent look and feel. */
export const defaultBarOptions: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: { callback: (value) => `${value}%` },
    },
  },
};

export const defaultDoughnutOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { padding: 12, usePointStyle: true },
    },
  },
};

export const defaultLineOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { usePointStyle: true },
    },
  },
  scales: {
    y: { beginAtZero: true },
  },
};
