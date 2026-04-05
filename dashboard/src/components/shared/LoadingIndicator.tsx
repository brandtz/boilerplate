'use client';

interface LoadingIndicatorProps {
  isLoading: boolean;
}

export function LoadingIndicator({ isLoading }: LoadingIndicatorProps) {
  if (!isLoading) return null;

  return (
    <div
      className="h-1 w-full overflow-hidden bg-blue-100"
      role="progressbar"
      aria-label="Loading dashboard data"
      data-testid="loading-indicator"
    >
      <div className="h-full w-1/3 animate-[slide_1.5s_ease-in-out_infinite] bg-blue-600 rounded" />
    </div>
  );
}
