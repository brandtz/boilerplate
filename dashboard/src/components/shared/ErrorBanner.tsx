'use client';

interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div
      className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3"
      role="alert"
      data-testid="error-banner"
    >
      <div className="flex items-center gap-2 text-sm text-red-800">
        <span aria-hidden="true">⚠</span>
        <span data-testid="error-message">{message}</span>
      </div>
      <button
        onClick={onRetry}
        className="rounded-md border border-red-300 bg-white px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-50"
        data-testid="error-retry"
      >
        Retry
      </button>
    </div>
  );
}
