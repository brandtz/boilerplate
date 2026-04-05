'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { EpicAccordion, FilterBar } from '@/components/epics';
import { useDashboard } from '@/hooks/useDashboard';
import type { ParsedEpic } from '@/types';

function matchesSearch(epic: ParsedEpic, query: string): boolean {
  const q = query.toLowerCase();
  if (epic.epicId.toLowerCase().includes(q)) return true;
  if (epic.title.toLowerCase().includes(q)) return true;
  for (const story of epic.stories) {
    if (story.storyId.toLowerCase().includes(q)) return true;
    if (story.title.toLowerCase().includes(q)) return true;
  }
  return false;
}

export default function EpicsPage() {
  const { state } = useDashboard();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEpics = useMemo(() => {
    let epics = state?.epics ?? [];
    if (statusFilter) {
      epics = epics.filter((e) => e.status === statusFilter);
    }
    if (searchQuery) {
      epics = epics.filter((e) => matchesSearch(e, searchQuery));
    }
    return epics;
  }, [state?.epics, statusFilter, searchQuery]);

  const handlePromptClick = useCallback(
    (promptId: string) => {
      router.push(`/prompts?id=${encodeURIComponent(promptId)}`);
    },
    [router],
  );

  return (
    <ErrorBoundary viewName="Epics">
      <div data-testid="view-epics" className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Epics</h2>

        <FilterBar
          onStatusChange={setStatusFilter}
          onSearchChange={setSearchQuery}
        />

        <EpicAccordion
          epics={filteredEpics}
          epicCompletionPercents={state?.summary.epicCompletionPercents ?? {}}
          taskIndex={state?.taskIndex ?? {}}
          prompts={state?.prompts ?? []}
          sessions={state?.sessions ?? []}
          onPromptClick={handlePromptClick}
        />
      </div>
    </ErrorBoundary>
  );
}
