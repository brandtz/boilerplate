import type { ParsedPrompt, ParsedHandoff, ReverseTaskIndex } from '@/types';

interface UpdateInfo {
  date: string;
  summary: string;
}

/**
 * Resolve the latest handoff update for an entity (epic, story, or task).
 */
export function resolveLastUpdate(
  entityId: string,
  entityType: 'epic' | 'story' | 'task',
  prompts: ParsedPrompt[],
  sessions: ParsedHandoff[],
  taskIndex: ReverseTaskIndex,
  epicStoryTaskIds?: string[],
): UpdateInfo | null {
  let promptIds: string[] = [];

  if (entityType === 'task') {
    promptIds = taskIndex[entityId] ?? [];
  } else {
    // For story/epic, use pre-computed task IDs to find associated prompts
    const taskIds = epicStoryTaskIds ?? [];
    const idSet = new Set<string>();
    for (const tid of taskIds) {
      for (const pid of taskIndex[tid] ?? []) {
        idSet.add(pid);
      }
    }
    promptIds = Array.from(idSet);
  }

  if (promptIds.length === 0) return null;

  const promptIdSet = new Set(promptIds);
  const relevantSessions = sessions.filter(
    (s) => promptIdSet.has(s.promptId) && s.endedAt,
  );

  if (relevantSessions.length === 0) return null;

  relevantSessions.sort(
    (a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime(),
  );

  const latest = relevantSessions[0];
  return {
    date: latest.endedAt,
    summary: latest.summary,
  };
}

interface UpdateSummaryProps {
  date: string | null;
  summary: string | null;
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const currentYear = new Date().getFullYear();
  if (d.getFullYear() !== currentYear) {
    return `${month} ${day}, ${d.getFullYear()}`;
  }
  return `${month} ${day}`;
}

export function UpdateSummary({ date, summary }: UpdateSummaryProps) {
  if (!date) {
    return (
      <span className="text-xs text-gray-400" data-testid="update-summary">
        No updates yet
      </span>
    );
  }

  const formatted = formatDate(date);
  const maxLen = 80;
  const truncated = summary && summary.length > maxLen;
  const displaySummary = truncated
    ? summary!.slice(0, maxLen) + '…'
    : summary;

  return (
    <span
      className="text-xs text-gray-500"
      data-testid="update-summary"
      title={truncated ? summary! : undefined}
    >
      Last update: {formatted}
      {displaySummary && ` — ${displaySummary}`}
    </span>
  );
}
