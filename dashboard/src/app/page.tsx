import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

export default function OverviewPage() {
  return (
    <ErrorBoundary viewName="Overview">
      <div data-testid="view-overview">
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <p className="mt-2 text-gray-500">
          Project summary, charts, blockers, and next prompt will appear here.
        </p>
      </div>
    </ErrorBoundary>
  );
}
