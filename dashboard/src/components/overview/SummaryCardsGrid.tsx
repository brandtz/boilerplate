import type { SummaryMetrics, ProjectSummary } from '@/types';
import { SummaryCard } from './SummaryCard';
import { HealthBadge } from './HealthBadge';
import { OverallProgressBar } from './OverallProgressBar';

interface SummaryCardsGridProps {
  summary: SummaryMetrics;
  project: ProjectSummary;
}

export function SummaryCardsGrid({ summary, project }: SummaryCardsGridProps) {
  return (
    <section data-testid="summary-cards-grid" aria-label="Project summary">
      {/* Row 1 — Scope counts */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label="Epics" value={project.totalEpics} variant="scope" />
        <SummaryCard label="Stories" value={project.totalStories} variant="scope" />
        <SummaryCard label="Tasks" value={project.totalTasks} variant="scope" />
        <SummaryCard label="Prompts" value={project.totalPrompts} variant="scope" />
      </div>

      {/* Row 2 — Execution counts */}
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard
          label="Done"
          value={summary.completedPrompts}
          variant="execution"
        />
        <SummaryCard
          label="In Progress"
          value={summary.promptsByStatus.in_progress}
          variant="execution"
        />
        <SummaryCard
          label="Blocked"
          value={summary.blockedPrompts}
          variant="execution"
        />
        <SummaryCard
          label="Ready"
          value={summary.promptsByStatus.ready}
          variant="execution"
        />
      </div>

      {/* Progress + Health */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <OverallProgressBar
            scopePercent={summary.scopeCompletionPercent}
            executionPercent={summary.executionCompletionPercent}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Health:</span>
          <HealthBadge status={project.healthStatus} />
        </div>
      </div>
    </section>
  );
}
