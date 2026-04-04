import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

export default function TasksPage() {
  return (
    <ErrorBoundary viewName="Tasks">
      <div data-testid="view-tasks">
        <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
        <p className="mt-2 text-gray-500">
          Epic → Story → Task tree with status badges will appear here.
        </p>
      </div>
    </ErrorBoundary>
  );
}
