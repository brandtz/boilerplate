'use client';

import { useDashboard } from '@/hooks/useDashboard';

export function StatusBar() {
  const { state, isLoading } = useDashboard();

  const promptCount = state?.project.totalPrompts ?? 0;
  const warningCount = state?.warnings.length ?? 0;
  const errorCount = state?.warnings.filter((w) => w.severity === 'error').length ?? 0;
  const lastParsed = state?.project.lastParsedAt
    ? new Date(state.project.lastParsedAt).toLocaleTimeString()
    : '—';

  return (
    <footer
      className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500"
      role="status"
      aria-label="Dashboard status"
      data-testid="status-bar"
    >
      <div className="flex items-center gap-4">
        <span data-testid="status-parsed">Last parsed: {lastParsed}</span>
        <span data-testid="status-prompts">{promptCount} prompts</span>
      </div>
      <div className="flex items-center gap-4">
        {isLoading && (
          <span className="text-blue-600" data-testid="status-loading">
            Parsing…
          </span>
        )}
        {errorCount > 0 && (
          <span className="text-red-600" data-testid="status-errors">
            {errorCount} error{errorCount !== 1 ? 's' : ''}
          </span>
        )}
        <span
          className={warningCount > 0 ? 'text-yellow-600' : ''}
          data-testid="status-warnings"
        >
          {warningCount} warning{warningCount !== 1 ? 's' : ''}
        </span>
      </div>
    </footer>
  );
}
