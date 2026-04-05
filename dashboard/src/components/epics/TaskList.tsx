import type { ParsedTask, ReverseTaskIndex, PromptStatus } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';

interface TaskListProps {
  tasks: ParsedTask[];
  taskIndex: ReverseTaskIndex;
  onPromptClick: (promptId: string) => void;
}

export function TaskList({ tasks, taskIndex, onPromptClick }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="py-2 pl-8 text-xs text-gray-400" data-testid="no-tasks">
        No tasks defined
      </p>
    );
  }

  return (
    <ul className="space-y-1 py-1 pl-6" role="group" data-testid="task-list">
      {tasks.map((task, idx) => {
        const promptIds = taskIndex[task.taskId] ?? [];
        const isLast = idx === tasks.length - 1;
        const prefix = isLast ? '└─' : '├─';

        return (
          <li
            key={task.taskId}
            className="flex items-start gap-2 text-sm"
            data-testid={`task-item-${task.taskId}`}
          >
            <span className="font-mono text-gray-300 select-none" aria-hidden="true">
              {prefix}
            </span>
            <div className="flex flex-1 items-center gap-2 min-w-0">
              <StatusBadge status={task.status as PromptStatus} size="sm" />
              <span className="font-medium text-gray-700 truncate">
                {task.taskId}
              </span>
              <span className="text-gray-500 truncate">{task.title}</span>
            </div>
            {promptIds.length > 0 && (
              <div className="flex gap-1 flex-shrink-0">
                {promptIds.map((pid) => (
                  <button
                    key={pid}
                    onClick={() => onPromptClick(pid)}
                    className="text-xs text-blue-600 hover:underline"
                    data-testid={`prompt-link-${pid}`}
                  >
                    {pid}
                  </button>
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
