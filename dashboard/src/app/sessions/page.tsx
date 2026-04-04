import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

export default function SessionsPage() {
  return (
    <ErrorBoundary viewName="Sessions">
      <div data-testid="view-sessions">
        <h2 className="text-2xl font-bold text-gray-900">Sessions</h2>
        <p className="mt-2 text-gray-500">
          Chronological session timeline with handoff details will appear here.
        </p>
      </div>
    </ErrorBoundary>
  );
}
