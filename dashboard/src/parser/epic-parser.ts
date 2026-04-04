import type { ParseWarning, ParsedEpic, ParsedStory, ParsedTask } from './types';
import { createWarning } from './warnings';

const EPIC_RE = /^## Epic (E\d+):\s*(.+)$/;
const STORY_RE = /^### (E\d+-S\d+)\s+(.+)$/;
const TASK_RE = /^- (E\d+-S\d+-T\d+):\s*(.+)$/;
const STATUS_RE = /^\*\*Status:\*\*\s*(\w+)/;

/**
 * Parse a combined markdown epic file into structured epic/story/task hierarchy.
 */
export function parseEpicFile(filePath: string, content: string): { epics: ParsedEpic[]; warnings: ParseWarning[] } {
  const warnings: ParseWarning[] = [];
  const epics: ParsedEpic[] = [];
  const lines = content.split(/\r?\n/);

  let currentEpic: ParsedEpic | null = null;
  let currentStory: ParsedStory | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Check for epic heading
    const epicMatch = line.match(EPIC_RE);
    if (epicMatch) {
      // Save previous story to epic
      if (currentStory && currentEpic) {
        currentEpic.stories.push(currentStory);
        currentStory = null;
      }
      // Save previous epic
      if (currentEpic) {
        epics.push(currentEpic);
      }

      currentEpic = {
        epicId: epicMatch[1],
        title: epicMatch[2].trim(),
        status: 'draft',
        stories: [],
      };
      continue;
    }

    // Check for story heading
    const storyMatch = line.match(STORY_RE);
    if (storyMatch) {
      // Save previous story to current epic
      if (currentStory && currentEpic) {
        currentEpic.stories.push(currentStory);
      }

      if (!currentEpic) {
        warnings.push(createWarning(filePath, 'W_EPIC_PARSE_FAIL', `Story ${storyMatch[1]} found outside of an epic`, 'warning', lineNum));
        continue;
      }

      const storyId = storyMatch[1];
      const epicPrefix = storyId.replace(/-S\d+$/, '');

      currentStory = {
        storyId,
        epicId: epicPrefix,
        title: storyMatch[2].trim(),
        status: 'draft',
        acceptanceCriteria: [],
        tasks: [],
      };
      continue;
    }

    // Check for status line
    const statusMatch = line.match(STATUS_RE);
    if (statusMatch && currentStory) {
      currentStory.status = statusMatch[1].toLowerCase();
      continue;
    }

    // Check for task line
    const taskMatch = line.match(TASK_RE);
    if (taskMatch) {
      if (!currentStory) {
        warnings.push(createWarning(filePath, 'W_EPIC_PARSE_FAIL', `Task ${taskMatch[1]} found outside of a story`, 'warning', lineNum));
        continue;
      }

      const taskId = taskMatch[1];
      const storyPrefix = taskId.replace(/-T\d+$/, '');
      const epicPrefix = storyPrefix.replace(/-S\d+$/, '');

      currentStory.tasks.push({
        taskId,
        storyId: storyPrefix,
        epicId: epicPrefix,
        title: taskMatch[2].trim(),
        status: 'draft',
      });
      continue;
    }

    // Check for acceptance criteria
    if (currentStory && /^- AC-\d+:/.test(line)) {
      currentStory.acceptanceCriteria.push(line.replace(/^- /, '').trim());
    }
  }

  // Push last story and epic
  if (currentStory && currentEpic) {
    currentEpic.stories.push(currentStory);
  }
  if (currentEpic) {
    epics.push(currentEpic);
  }

  // Derive epic status from stories
  for (const epic of epics) {
    if (epic.stories.length === 0) {
      epic.status = 'draft';
    } else {
      const allDone = epic.stories.every(s => s.status === 'done');
      const anyInProgress = epic.stories.some(s => s.status === 'in_progress');
      if (allDone) {
        epic.status = 'done';
      } else if (anyInProgress) {
        epic.status = 'in_progress';
      } else {
        epic.status = 'ready';
      }
    }
  }

  return { epics, warnings };
}
