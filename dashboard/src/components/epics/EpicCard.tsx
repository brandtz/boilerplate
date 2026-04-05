import type {
  ParsedEpic,
  ParsedPrompt,
  ParsedHandoff,
  ReverseTaskIndex,
  PromptStatus,
} from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { StoryRow } from './StoryRow';
import { UpdateSummary, resolveLastUpdate } from './UpdateSummary';

interface EpicCardProps {
  epic: ParsedEpic;
  completionPercent: number;
  promptCount: number;
  isExpanded: boolean;
  onToggle: () => void;
  taskIndex: ReverseTaskIndex;
  prompts: ParsedPrompt[];
  sessions: ParsedHandoff[];
  isStoryExpanded: (storyId: string) => boolean;
  onStoryToggle: (storyId: string) => void;
  onPromptClick: (promptId: string) => void;
}

export function EpicCard({
  epic,
  completionPercent,
  promptCount,
  isExpanded,
  onToggle,
  taskIndex,
  prompts,
  sessions,
  isStoryExpanded,
  onStoryToggle,
  onPromptClick,
}: EpicCardProps) {
  const storyCount = epic.stories.length;
  const taskCount = epic.stories.reduce((sum, s) => sum + s.tasks.length, 0);
  const epicContentId = `epic-content-${epic.epicId}`;

  // Collect all task IDs for update resolution
  const allTaskIds = epic.stories.flatMap((s) =>
    s.tasks.map((t) => t.taskId),
  );
  const lastUpdate = resolveLastUpdate(
    epic.epicId,
    'epic',
    prompts,
    sessions,
    taskIndex,
    allTaskIds,
  );

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white"
      data-testid={`epic-card-${epic.epicId}`}
    >
      {/* Epic header — clickable */}
      <button
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        aria-expanded={isExpanded}
        aria-controls={epicContentId}
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-gray-50 rounded-t-lg transition-colors"
        data-testid={`epic-toggle-${epic.epicId}`}
      >
        <span className="text-gray-400" aria-hidden="true">
          {isExpanded ? '▼' : '▶'}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900">
              {epic.epicId}: {epic.title}
            </span>
            <StatusBadge status={epic.status as PromptStatus} size="sm" />
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Stories: {storyCount} | Tasks: {taskCount} | Prompts: {promptCount}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-sm font-medium text-gray-700">
            {completionPercent}%
          </span>
        </div>
      </button>

      {/* Progress bar */}
      <div className="px-4 pb-2">
        <div
          className="h-2 w-full rounded-full bg-gray-200"
          role="progressbar"
          aria-valuenow={completionPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${epic.epicId} completion: ${completionPercent}%`}
        >
          <div
            className="h-2 rounded-full bg-green-500 transition-all"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <div className="mt-1">
          <UpdateSummary
            date={lastUpdate?.date ?? null}
            summary={lastUpdate?.summary ?? null}
          />
        </div>
      </div>

      {/* Expanded stories */}
      {isExpanded && (
        <div
          id={epicContentId}
          className="border-t border-gray-100 px-4 pb-4 pt-2"
          data-testid={`epic-content-${epic.epicId}`}
        >
          {epic.stories.length === 0 ? (
            <p className="text-sm text-gray-400">No stories defined</p>
          ) : (
            <div className="space-y-1">
              {epic.stories.map((story) => (
                <StoryRow
                  key={story.storyId}
                  story={story}
                  taskIndex={taskIndex}
                  isExpanded={isStoryExpanded(story.storyId)}
                  onToggle={() => onStoryToggle(story.storyId)}
                  onPromptClick={onPromptClick}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
