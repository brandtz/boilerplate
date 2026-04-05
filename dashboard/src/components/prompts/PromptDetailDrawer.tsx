'use client';

import type { ParsedPrompt, ParsedHandoff, PromptStatus } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CopyButton } from '@/components/shared/CopyButton';
import { MarkdownRenderer } from './MarkdownRenderer';

interface PrerequisiteStatus {
  promptId: string;
  status: PromptStatus;
}

interface PromptDetailDrawerProps {
  prompt: ParsedPrompt | null;
  handoffs: ParsedHandoff[];
  prerequisiteStatuses: PrerequisiteStatus[];
  isOpen: boolean;
  onClose: () => void;
  onPromptNavigate: (promptId: string) => void;
  drawerRef: React.RefObject<HTMLDivElement | null>;
}

export function PromptDetailDrawer({
  prompt,
  handoffs,
  prerequisiteStatuses,
  isOpen,
  onClose,
  onPromptNavigate,
  drawerRef,
}: PromptDetailDrawerProps) {
  if (!isOpen || !prompt) return null;

  const isArchived = !!prompt.archivedAt;
  const isSuperseded = prompt.status === 'superseded';
  const isDone = prompt.status === 'done';
  const hasHandoff = handoffs.length > 0;
  const latestHandoff = hasHandoff ? handoffs[handoffs.length - 1] : null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        data-testid="drawer-overlay"
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="fixed right-0 top-0 z-50 h-full w-full max-w-lg overflow-y-auto bg-white shadow-xl border-l border-gray-200 motion-safe:animate-slide-in-right"
        data-testid="prompt-detail-drawer"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <h2
              id="drawer-title"
              className="text-lg font-semibold text-gray-900"
              data-testid="drawer-title"
            >
              Prompt {prompt.promptId}
            </h2>
            <p className="text-sm text-gray-600">{prompt.title}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close drawer"
            data-testid="drawer-close"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Metadata */}
          <section data-testid="drawer-metadata">
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={prompt.status} size="md" />
              <span className="text-sm text-gray-500">{prompt.phase}</span>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <dt className="text-gray-500">Epic</dt>
              <dd className="text-gray-800">{prompt.epicId || '—'}</dd>
              <dt className="text-gray-500">Story</dt>
              <dd className="text-gray-800">{prompt.storyId || '—'}</dd>
              <dt className="text-gray-500">Tasks</dt>
              <dd className="text-gray-800">
                {prompt.taskIds.length > 0 ? prompt.taskIds.join(', ') : '—'}
              </dd>
              <dt className="text-gray-500">Owner</dt>
              <dd className="text-gray-800">{prompt.role}</dd>
              <dt className="text-gray-500">Location</dt>
              <dd className="text-gray-800">{isArchived ? 'archive' : 'active'}</dd>
            </dl>
          </section>

          {/* Warning states */}
          {isSuperseded && prompt.supersededBy && (
            <div
              className="rounded-md bg-gray-50 border border-gray-200 p-3 text-sm"
              data-testid="superseded-notice"
            >
              Superseded by:{' '}
              <button
                onClick={() => onPromptNavigate(prompt.supersededBy)}
                className="text-blue-600 hover:underline"
                data-testid="superseded-link"
              >
                → {prompt.supersededBy}
              </button>
            </div>
          )}
          {isArchived && (
            <div
              className="rounded-md bg-gray-50 border border-gray-200 p-3 text-sm text-gray-500"
              data-testid="archived-notice"
            >
              Archived: {prompt.archivedAt}
            </div>
          )}
          {isDone && !hasHandoff && (
            <div
              className="rounded-md bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-800"
              data-testid="missing-handoff-warning"
            >
              ⚠ Handoff missing for this completed prompt
            </div>
          )}

          {/* Prerequisites */}
          <section data-testid="drawer-prerequisites">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Prerequisites
            </h3>
            {prerequisiteStatuses.length === 0 ? (
              <p className="text-sm text-gray-400">None</p>
            ) : (
              <ul className="space-y-1">
                {prerequisiteStatuses.map((pre) => {
                  const isMet = pre.status === 'done';
                  return (
                    <li key={pre.promptId} className="flex items-center gap-2 text-sm">
                      <span>{isMet ? '✅' : '❌'}</span>
                      <button
                        onClick={() => onPromptNavigate(pre.promptId)}
                        className="text-blue-600 hover:underline"
                        data-testid={`prereq-link-${pre.promptId}`}
                      >
                        {pre.promptId}
                      </button>
                      <StatusBadge status={pre.status} size="sm" />
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Required Reading */}
          {prompt.requiredReading.length > 0 && (
            <section data-testid="drawer-required-reading">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Required Reading
              </h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-0.5">
                {prompt.requiredReading.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Downstream Prompts */}
          {prompt.downstreamPrompts.length > 0 && (
            <section data-testid="drawer-downstream">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Downstream Prompts
              </h3>
              <div className="flex flex-wrap gap-2">
                {prompt.downstreamPrompts.map((dp) => (
                  <button
                    key={dp}
                    onClick={() => onPromptNavigate(dp)}
                    className="text-sm text-blue-600 hover:underline"
                    data-testid={`downstream-link-${dp}`}
                  >
                    → {dp}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Prompt Body */}
          <section data-testid="drawer-body">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Prompt Body
            </h3>
            <div className="max-h-96 overflow-y-auto rounded-md border border-gray-200 bg-gray-50 p-4">
              <MarkdownRenderer content={prompt.body} />
            </div>
            <div className="mt-2">
              <CopyButton content={prompt.body} label="📋 Copy Prompt" />
            </div>
          </section>

          {/* Session Handoff */}
          {latestHandoff && (
            <section data-testid="drawer-handoff">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Session Handoff
              </h3>
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm space-y-1">
                <p>
                  <span className="text-gray-500">Summary:</span>{' '}
                  {latestHandoff.summary}
                </p>
                <p>
                  <span className="text-gray-500">Changed files:</span>{' '}
                  {latestHandoff.changedFiles.length}
                </p>
                <p>
                  <span className="text-gray-500">Session:</span>{' '}
                  {latestHandoff.sessionId}
                </p>
              </div>
            </section>
          )}

          {/* Source Path */}
          <section data-testid="drawer-source" className="pb-4">
            <p className="text-xs text-gray-400">
              Source: {prompt.sourcePath}
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
