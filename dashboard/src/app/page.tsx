'use client';

import { useCallback } from 'react';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useDashboard } from '@/hooks/useDashboard';
import {
  SummaryCardsGrid,
  EpicCompletionChart,
  PromptStatusChart,
  SessionThroughputChart,
  BlockersWarningsPanel,
  NextPromptWidget,
} from '@/components/overview';

export default function OverviewPage() {
  const { state, isLoading, error } = useDashboard();

  const handlePromptClick = useCallback((promptId: string) => {
    window.location.href = `/prompts?id=${encodeURIComponent(promptId)}`;
  }, []);

  const handleViewSource = useCallback((promptId: string) => {
    window.location.href = `/prompts?id=${encodeURIComponent(promptId)}`;
  }, []);

  return (
    <ErrorBoundary viewName="Overview">
      <div data-testid="view-overview">
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>

        {isLoading && (
          <div
            data-testid="loading-indicator"
            className="mt-4 flex items-center gap-2 text-gray-500"
            role="status"
            aria-label="Loading dashboard data"
          >
            <span className="animate-spin">↻</span>
            <span>Loading dashboard data…</span>
          </div>
        )}

        {error && !isLoading && (
          <div
            data-testid="error-banner"
            role="alert"
            className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {state && !isLoading && (
          <>
            {/* Summary Cards */}
            <div className="mt-6">
              <SummaryCardsGrid
                summary={state.summary}
                project={state.project}
              />
            </div>

            {/* Charts — 2×2 grid */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <EpicCompletionChart
                epicCompletionPercents={state.summary.epicCompletionPercents}
              />
              <PromptStatusChart
                promptsByStatus={state.summary.promptsByStatus}
              />
              <SessionThroughputChart
                completionTimeline={state.summary.completionTimeline}
              />
            </div>

            {/* Blockers & Warnings */}
            <div className="mt-8">
              <BlockersWarningsPanel
                prompts={state.prompts}
                warnings={state.warnings}
                onPromptClick={handlePromptClick}
              />
            </div>

            {/* Next Prompt */}
            <div className="mt-8">
              <NextPromptWidget
                nextPrompt={state.nextPrompt}
                noEligibleRationale={state.summary.noEligibleRationale}
                onViewSource={handleViewSource}
              />
            </div>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
