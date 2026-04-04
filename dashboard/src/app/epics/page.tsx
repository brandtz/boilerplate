import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

export default function EpicsPage() {
  return (
    <ErrorBoundary viewName="Epics">
      <div data-testid="view-epics">
        <h2 className="text-2xl font-bold text-gray-900">Epics</h2>
        <p className="mt-2 text-gray-500">
          Epic → Story → Task hierarchy with completion rollups will appear here.
        </p>
      </div>
    </ErrorBoundary>
  );
}
