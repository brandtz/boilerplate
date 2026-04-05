'use client';

import type { ParsedHandoff } from '@/types';
import { SessionDetail } from './SessionDetail';

/** Maps session outcome strings to display styling. */
const OUTCOME_STYLE: Record<string, { icon: string; className: string }> = {
  complete: { icon: '✅', className: 'text-green-700' },
  partial: { icon: '⚠️', className: 'text-amber-700' },
  failed: { icon: '❌', className: 'text-red-700' },
};

interface SessionCardProps {
  session: ParsedHandoff;
  isExpanded: boolean;
  onToggle: () => void;
  onPromptClick: (promptId: string) => void;
}

export function SessionCard({
  session,
  isExpanded,
  onToggle,
  onPromptClick,
}: SessionCardProps) {
  const outcome = OUTCOME_STYLE[session.statusOutcome] ?? {
    icon: '●',
    className: 'text-gray-600',
  };

  const summaryTruncated =
    session.summary.length > 120
      ? session.summary.slice(0, 120) + '…'
      : session.summary;

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white p-4"
      data-testid={`session-card-${session.sessionId}`}
      role="listitem"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-semibold text-gray-900" data-testid="session-id">
              {session.sessionId}
            </span>
            <span className={`text-xs font-medium ${outcome.className}`} data-testid="session-outcome">
              {outcome.icon} {session.statusOutcome}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-700" data-testid="session-prompt-info">
            Prompt: {session.promptId} — <span className="text-gray-500">{session.role}</span>
          </p>
          <p className="mt-1 text-xs text-gray-500" data-testid="session-changed-count">
            Files changed: {session.changedFiles.length}
          </p>
          {!isExpanded && (
            <p className="mt-1 text-sm text-gray-600" data-testid="session-summary-truncated">
              {summaryTruncated}
            </p>
          )}
          {isExpanded && (
            <p className="mt-1 text-sm text-gray-600" data-testid="session-summary-full">
              {session.summary}
            </p>
          )}
        </div>

        <button
          onClick={onToggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggle();
            }
          }}
          aria-expanded={isExpanded}
          className="shrink-0 rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
          data-testid="session-toggle"
        >
          {isExpanded ? '▲ Collapse' : '▼ Expand Details'}
        </button>
      </div>

      {/* Expanded detail */}
      {isExpanded && (
        <SessionDetail session={session} onPromptClick={onPromptClick} />
      )}
    </div>
  );
}
