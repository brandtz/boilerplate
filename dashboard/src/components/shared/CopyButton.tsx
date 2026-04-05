'use client';

import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

interface CopyButtonProps {
  content: string;
  label?: string;
  successLabel?: string;
}

export function CopyButton({
  content,
  label = 'Copy to Clipboard',
  successLabel = 'Copied!',
}: CopyButtonProps) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <button
      onClick={() => void copy(content)}
      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
        copied
          ? 'border-green-300 bg-green-50 text-green-700'
          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
      }`}
      aria-label={copied ? successLabel : label}
      data-testid="copy-button"
    >
      <span aria-hidden="true">{copied ? '✓' : '📋'}</span>
      <span aria-live="polite">{copied ? successLabel : label}</span>
    </button>
  );
}
