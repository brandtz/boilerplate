'use client';

import type { NextPromptInfo } from '@/types';
import { CopyButton } from '@/components/shared/CopyButton';

interface NextPromptWidgetProps {
  nextPrompt: NextPromptInfo | null;
  noEligibleRationale: string | null;
  onViewSource?: (promptId: string) => void;
}

export function NextPromptWidget({
  nextPrompt,
  noEligibleRationale,
  onViewSource,
}: NextPromptWidgetProps) {
  if (!nextPrompt) {
    return (
      <section
        className="rounded-lg border border-gray-200 bg-white p-4"
        data-testid="next-prompt-widget"
        aria-label="Next prompt"
      >
        <h3 className="text-lg font-semibold text-gray-900">Next Prompt</h3>
        <p
          className="mt-3 text-sm text-gray-500"
          data-testid="no-eligible-message"
        >
          {noEligibleRationale ?? 'No eligible prompts at this time.'}
        </p>
      </section>
    );
  }

  return (
    <section
      className="rounded-lg border border-gray-200 bg-white p-4"
      data-testid="next-prompt-widget"
      aria-label="Next prompt"
    >
      {/* Header */}
      <h3
        className="text-lg font-semibold text-gray-900"
        data-testid="next-prompt-header"
      >
        ▶ Next: {nextPrompt.promptId} — {nextPrompt.title}
      </h3>

      {/* Role */}
      <p className="mt-1 text-sm text-gray-600" data-testid="next-prompt-role">
        Role: {nextPrompt.ownerRole}
      </p>

      {/* Rationale */}
      <p
        className="mt-2 text-sm italic text-gray-500"
        data-testid="next-prompt-rationale"
      >
        {nextPrompt.rationale}
      </p>

      {/* Prerequisites */}
      <div className="mt-3" data-testid="next-prompt-prerequisites">
        <p className="text-sm font-medium text-gray-700">
          Prerequisites ({nextPrompt.prerequisitesMet}/{nextPrompt.totalPrerequisites} met):
        </p>
        {nextPrompt.totalPrerequisites > 0 ? (
          <p className="mt-1 text-sm text-gray-600">
            {nextPrompt.prerequisitesMet === nextPrompt.totalPrerequisites ? (
              <span className="text-green-700">
                ✅ All {nextPrompt.totalPrerequisites} prerequisites met
              </span>
            ) : (
              <span className="text-yellow-700">
                {nextPrompt.prerequisitesMet} met, {nextPrompt.totalPrerequisites - nextPrompt.prerequisitesMet} pending
              </span>
            )}
          </p>
        ) : (
          <p className="mt-1 text-sm text-gray-500">No prerequisites</p>
        )}
      </div>

      {/* Scrollable prompt body */}
      <div
        className="mt-4 max-h-64 overflow-y-auto rounded-md border border-gray-200 bg-gray-50 p-3"
        tabIndex={0}
        role="region"
        aria-label="Prompt content"
        data-testid="next-prompt-body"
      >
        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
          {nextPrompt.body}
        </pre>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-3">
        <CopyButton content={nextPrompt.body} label="📋 Copy to Clipboard" />
        <button
          onClick={() => onViewSource?.(nextPrompt.promptId)}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          data-testid="view-source-button"
          aria-label={`View source file for prompt ${nextPrompt.promptId}`}
        >
          📄 {nextPrompt.sourcePath}
        </button>
      </div>
    </section>
  );
}
