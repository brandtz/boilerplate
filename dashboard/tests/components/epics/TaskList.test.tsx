import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ParsedTask, ReverseTaskIndex } from '@/types';
import { TaskList } from '@/components/epics/TaskList';

function makeTasks(): ParsedTask[] {
  return [
    { taskId: 'E1-S1-T1', storyId: 'E1-S1', epicId: 'E1', title: 'Define schema', status: 'done' },
    { taskId: 'E1-S1-T2', storyId: 'E1-S1', epicId: 'E1', title: 'Validate fields', status: 'ready' },
    { taskId: 'E1-S1-T3', storyId: 'E1-S1', epicId: 'E1', title: 'Write tests', status: 'blocked' },
  ];
}

const taskIndex: ReverseTaskIndex = {
  'E1-S1-T1': ['12.0.1', '13.0.1'],
  'E1-S1-T3': ['14.0.1'],
};

describe('TaskList', () => {
  it('renders all tasks', () => {
    render(
      <TaskList tasks={makeTasks()} taskIndex={taskIndex} onPromptClick={jest.fn()} />,
    );
    expect(screen.getByTestId('task-item-E1-S1-T1')).toBeInTheDocument();
    expect(screen.getByTestId('task-item-E1-S1-T2')).toBeInTheDocument();
    expect(screen.getByTestId('task-item-E1-S1-T3')).toBeInTheDocument();
  });

  it('shows task ID and title', () => {
    render(
      <TaskList tasks={makeTasks()} taskIndex={taskIndex} onPromptClick={jest.fn()} />,
    );
    expect(screen.getByTestId('task-item-E1-S1-T1')).toHaveTextContent('E1-S1-T1');
    expect(screen.getByTestId('task-item-E1-S1-T1')).toHaveTextContent('Define schema');
  });

  it('renders status badges for each task', () => {
    render(
      <TaskList tasks={makeTasks()} taskIndex={taskIndex} onPromptClick={jest.fn()} />,
    );
    const badges = screen.getAllByTestId('status-badge');
    expect(badges).toHaveLength(3);
    expect(badges[0]).toHaveTextContent('Done');
    expect(badges[1]).toHaveTextContent('Ready');
    expect(badges[2]).toHaveTextContent('Blocked');
  });

  it('renders prompt links for tasks with associated prompts', () => {
    render(
      <TaskList tasks={makeTasks()} taskIndex={taskIndex} onPromptClick={jest.fn()} />,
    );
    expect(screen.getByTestId('prompt-link-12.0.1')).toBeInTheDocument();
    expect(screen.getByTestId('prompt-link-13.0.1')).toBeInTheDocument();
    expect(screen.getByTestId('prompt-link-14.0.1')).toBeInTheDocument();
  });

  it('does not render prompt links for tasks without associated prompts', () => {
    render(
      <TaskList tasks={makeTasks()} taskIndex={taskIndex} onPromptClick={jest.fn()} />,
    );
    // E1-S1-T2 has no entry in taskIndex
    const taskItem = screen.getByTestId('task-item-E1-S1-T2');
    expect(taskItem.querySelectorAll('[data-testid^="prompt-link-"]')).toHaveLength(0);
  });

  it('calls onPromptClick when prompt link is clicked', async () => {
    const user = userEvent.setup();
    const onPromptClick = jest.fn();
    render(
      <TaskList tasks={makeTasks()} taskIndex={taskIndex} onPromptClick={onPromptClick} />,
    );

    await user.click(screen.getByTestId('prompt-link-14.0.1'));
    expect(onPromptClick).toHaveBeenCalledWith('14.0.1');
  });

  it('shows tree line prefixes', () => {
    render(
      <TaskList tasks={makeTasks()} taskIndex={taskIndex} onPromptClick={jest.fn()} />,
    );
    // Last task should have └─, others ├─
    expect(screen.getByTestId('task-item-E1-S1-T1')).toHaveTextContent('├─');
    expect(screen.getByTestId('task-item-E1-S1-T3')).toHaveTextContent('└─');
  });

  it('shows empty state when no tasks', () => {
    render(
      <TaskList tasks={[]} taskIndex={{}} onPromptClick={jest.fn()} />,
    );
    expect(screen.getByTestId('no-tasks')).toHaveTextContent('No tasks defined');
  });
});
