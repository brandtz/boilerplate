'use client';

import type { ParsedHandoff } from '@/types';

interface SessionDetailProps {
  session: ParsedHandoff;
  onPromptClick: (promptId: string) => void;
}

export function SessionDetail({ session, onPromptClick }: SessionDetailProps) {
  return (
    <div className="border-t border-gray-100 pt-3 mt-3 space-y-3 text-sm" data-testid="session-detail">
      {/* Changed Files */}
      <div>
        <h4 className="font-medium text-gray-700 mb-1">Changed Files</h4>
        {session.changedFiles.length > 0 ? (
          <ul className="list-disc list-inside text-gray-600 space-y-0.5" data-testid="changed-files-list">
            {session.changedFiles.map((f) => (
              <li key={f} className="font-mono text-xs">{f}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No files changed</p>
        )}
      </div>

      {/* Blockers */}
      {session.blockers.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-1">Blockers</h4>
          <ul className="list-disc list-inside text-gray-600 space-y-0.5">
            {session.blockers.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Recommended */}
      {session.nextRecommendedPrompts.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-1">Next Recommended</h4>
          <div className="flex flex-wrap gap-2">
            {session.nextRecommendedPrompts.map((pid) => (
              <button
                key={pid}
                onClick={() => onPromptClick(pid)}
                className="text-blue-600 hover:underline text-xs"
                data-testid={`next-prompt-link-${pid}`}
              >
                → {pid}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Links */}
      <div className="flex items-center gap-4 pt-2">
        <span className="text-xs text-gray-400" data-testid="handoff-source-path">
          Handoff: {session.sourcePath}
        </span>
        <button
          onClick={() => onPromptClick(session.promptId)}
          className="text-xs text-blue-600 hover:underline"
          data-testid="view-prompt-link"
        >
          View Prompt →
        </button>
      </div>
    </div>
  );
}
