import { ErrorBoundary } from '@/components/shared/ErrorBoundary';

export default function PromptsPage() {
  return (
    <ErrorBoundary viewName="Prompts">
      <div data-testid="view-prompts">
        <h2 className="text-2xl font-bold text-gray-900">Prompts</h2>
        <p className="mt-2 text-gray-500">
          Sortable, filterable prompt inventory table with detail drawer will appear here.
        </p>
      </div>
    </ErrorBoundary>
  );
}
