'use client';

import type { ParsedPrompt, ParseWarning } from '@/types';

export interface BlockerItem {
  promptId: string;
  title: string;
  type: 'blocker' | 'error' | 'warning';
  message: string;
  sourcePath?: string;
}

/**
 * Aggregate blockers, errors, and warnings from parsed state
 * for display in the Blockers & Warnings panel.
 */
export function aggregateBlockers(
  prompts: ParsedPrompt[],
  warnings: ParseWarning[],
): BlockerItem[] {
  const items: BlockerItem[] = [];

  // 1. Blocked prompts
  for (const p of prompts) {
    if (p.status === 'blocked') {
      items.push({
        promptId: p.promptId,
        title: p.title,
        type: 'blocker',
        message: `Prompt ${p.promptId} is blocked`,
        sourcePath: p.sourcePath,
      });
    }
  }

  // 2. Error-level warnings
  for (const w of warnings) {
    if (w.severity === 'error') {
      items.push({
        promptId: '',
        title: w.file,
        type: 'error',
        message: w.message,
        sourcePath: w.file,
      });
    }
  }

  // 3. Warnings (W_DONE_NO_HANDOFF, W_PREREQ_NOT_FOUND, W_UNKNOWN_STATUS, W_FILE_NOT_IN_INDEX)
  const warningCodes = new Set([
    'W_DONE_NO_HANDOFF',
    'W_PREREQ_NOT_FOUND',
    'W_UNKNOWN_STATUS',
    'W_FILE_NOT_IN_INDEX',
  ]);
  for (const w of warnings) {
    if (w.severity === 'warning' && warningCodes.has(w.code)) {
      items.push({
        promptId: '',
        title: w.file,
        type: 'warning',
        message: w.message,
        sourcePath: w.file,
      });
    }
  }

  return items;
}

interface BlockersWarningsPanelProps {
  prompts: ParsedPrompt[];
  warnings: ParseWarning[];
  onPromptClick?: (promptId: string) => void;
}

export function BlockersWarningsPanel({
  prompts,
  warnings,
  onPromptClick,
}: BlockersWarningsPanelProps) {
  const items = aggregateBlockers(prompts, warnings);
  const errorCount = items.filter((i) => i.type === 'error' || i.type === 'blocker').length;
  const warningCount = items.filter((i) => i.type === 'warning').length;
  const totalCount = items.length;

  const severityIcon = (type: BlockerItem['type']) => {
    switch (type) {
      case 'blocker':
        return '🔴';
      case 'error':
        return '🔴';
      case 'warning':
        return '🟡';
    }
  };

  return (
    <section
      className="rounded-lg border border-gray-200 bg-white p-4"
      data-testid="blockers-warnings-panel"
      aria-label={`Blockers and warnings: ${totalCount} items`}
    >
      <h3 className="text-lg font-semibold text-gray-900">
        Blockers &amp; Warnings{' '}
        {totalCount > 0 && (
          <span className="text-sm font-normal text-gray-500">({totalCount})</span>
        )}
      </h3>

      {totalCount === 0 ? (
        <p
          className="mt-3 text-sm text-green-700"
          data-testid="no-issues"
          aria-live="polite"
        >
          ✅ No issues found
        </p>
      ) : (
        <ul className="mt-3 space-y-2" aria-live="polite">
          {/* Errors and blockers first */}
          {items
            .filter((i) => i.type === 'blocker' || i.type === 'error')
            .map((item, idx) => (
              <li key={`err-${idx}`}>
                <button
                  onClick={() => item.promptId && onPromptClick?.(item.promptId)}
                  className="flex w-full items-start gap-2 rounded-md p-2 text-left text-sm hover:bg-red-50 transition-colors"
                  aria-label={`${item.type === 'blocker' ? 'Blocker' : 'Error'}: ${item.message}`}
                  data-testid={`blocker-item-${idx}`}
                >
                  <span aria-hidden="true">{severityIcon(item.type)}</span>
                  <span className="text-red-800">
                    {item.promptId && (
                      <span className="font-medium">{item.promptId}: </span>
                    )}
                    {item.message}
                  </span>
                </button>
              </li>
            ))}

          {/* Warnings */}
          {items
            .filter((i) => i.type === 'warning')
            .map((item, idx) => (
              <li key={`warn-${idx}`}>
                <button
                  onClick={() => item.promptId && onPromptClick?.(item.promptId)}
                  className="flex w-full items-start gap-2 rounded-md p-2 text-left text-sm hover:bg-yellow-50 transition-colors"
                  aria-label={`Warning: ${item.message}`}
                  data-testid={`warning-item-${idx}`}
                >
                  <span aria-hidden="true">{severityIcon(item.type)}</span>
                  <span className="text-yellow-800">{item.message}</span>
                </button>
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}
