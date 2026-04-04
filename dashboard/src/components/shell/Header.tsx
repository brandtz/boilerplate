'use client';

import { useDashboard } from '@/hooks/useDashboard';

export function Header() {
  const { state, isLoading, lastParsedAt, refresh } = useDashboard();

  const projectName = state?.project.projectName ?? 'Project Manager Dashboard';
  const formattedTime = lastParsedAt
    ? new Date(lastParsedAt).toLocaleTimeString()
    : '—';

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-gray-900">{projectName}</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500" data-testid="last-parsed">
          Last parsed: {formattedTime}
        </span>
        <button
          onClick={() => void refresh()}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          aria-label="Refresh dashboard"
          data-testid="refresh-button"
        >
          <span className={isLoading ? 'animate-spin' : ''}>↻</span>
          Refresh
        </button>
      </div>
    </header>
  );
}
