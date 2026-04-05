import type { ParsedStory, ReverseTaskIndex, PromptStatus } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { TaskList } from './TaskList';

function computeCompletion(tasks: { status: string }[]): number {
  const total = tasks.length;
  const cancelled = tasks.filter((t) => t.status === 'cancelled').length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const denominator = total - cancelled;
  if (denominator <= 0) return 0;
  return Math.round((done / denominator) * 100);
}

function collectPromptIds(
  tasks: { taskId: string }[],
  taskIndex: ReverseTaskIndex,
): string[] {
  const ids = new Set<string>();
  for (const t of tasks) {
    for (const pid of taskIndex[t.taskId] ?? []) {
      ids.add(pid);
    }
  }
  return Array.from(ids);
}

interface StoryRowProps {
  story: ParsedStory;
  taskIndex: ReverseTaskIndex;
  isExpanded: boolean;
  onToggle: () => void;
  onPromptClick: (promptId: string) => void;
}

export function StoryRow({
  story,
  taskIndex,
  isExpanded,
  onToggle,
  onPromptClick,
}: StoryRowProps) {
  const completion = computeCompletion(story.tasks);
  const promptIds = collectPromptIds(story.tasks, taskIndex);
  const storyContentId = `story-content-${story.storyId}`;

  return (
    <div
      className="border-l-2 border-gray-200 ml-4 pl-3"
      data-testid={`story-row-${story.storyId}`}
    >
      <button
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        aria-expanded={isExpanded}
        aria-controls={storyContentId}
        className="flex w-full items-center gap-3 py-2 text-left text-sm hover:bg-gray-50 rounded transition-colors"
        data-testid={`story-toggle-${story.storyId}`}
      >
        <span className="text-gray-400" aria-hidden="true">
          {isExpanded ? '▼' : '▶'}
        </span>
        <span className="font-medium text-gray-800">
          {story.storyId}: {story.title}
        </span>
        <span className="text-xs text-gray-500">
          Tasks: {story.tasks.length} | Prompts: {promptIds.length}
        </span>
        <StatusBadge status={story.status as PromptStatus} size="sm" />
        <span className="ml-auto text-xs text-gray-600">{completion}%</span>
      </button>

      {/* Completion bar */}
      <div className="ml-6 mb-1">
        <div
          className="h-1 w-32 rounded-full bg-gray-200"
          role="progressbar"
          aria-valuenow={completion}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${story.storyId} completion: ${completion}%`}
        >
          <div
            className="h-1 rounded-full bg-green-500 transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div id={storyContentId} data-testid={`story-content-${story.storyId}`}>
          <TaskList
            tasks={story.tasks}
            taskIndex={taskIndex}
            onPromptClick={onPromptClick}
          />
        </div>
      )}
    </div>
  );
}
