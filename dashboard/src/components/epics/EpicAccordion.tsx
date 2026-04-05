import type {
  ParsedEpic,
  ParsedPrompt,
  ParsedHandoff,
  ReverseTaskIndex,
} from '@/types';
import { useAccordion } from '@/hooks/useAccordion';
import { EpicCard } from './EpicCard';

interface EpicAccordionProps {
  epics: ParsedEpic[];
  epicCompletionPercents: Record<string, number>;
  taskIndex: ReverseTaskIndex;
  prompts: ParsedPrompt[];
  sessions: ParsedHandoff[];
  onPromptClick: (promptId: string) => void;
}

function countPromptsForEpic(
  epic: ParsedEpic,
  taskIndex: ReverseTaskIndex,
): number {
  const ids = new Set<string>();
  for (const story of epic.stories) {
    for (const task of story.tasks) {
      for (const pid of taskIndex[task.taskId] ?? []) {
        ids.add(pid);
      }
    }
  }
  return ids.size;
}

export function EpicAccordion({
  epics,
  epicCompletionPercents,
  taskIndex,
  prompts,
  sessions,
  onPromptClick,
}: EpicAccordionProps) {
  const {
    isExpanded: isEpicExpanded,
    toggle: toggleEpic,
  } = useAccordion();

  const {
    isExpanded: isStoryExpanded,
    toggle: toggleStory,
  } = useAccordion();

  if (epics.length === 0) {
    return (
      <div
        className="rounded-lg border border-gray-200 bg-white p-8 text-center"
        data-testid="epics-empty-state"
      >
        <p className="text-gray-500">No epics defined</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="epic-accordion">
      {epics.map((epic) => (
        <EpicCard
          key={epic.epicId}
          epic={epic}
          completionPercent={epicCompletionPercents[epic.epicId] ?? 0}
          promptCount={countPromptsForEpic(epic, taskIndex)}
          isExpanded={isEpicExpanded(epic.epicId)}
          onToggle={() => toggleEpic(epic.epicId)}
          taskIndex={taskIndex}
          prompts={prompts}
          sessions={sessions}
          isStoryExpanded={isStoryExpanded}
          onStoryToggle={toggleStory}
          onPromptClick={onPromptClick}
        />
      ))}
    </div>
  );
}
