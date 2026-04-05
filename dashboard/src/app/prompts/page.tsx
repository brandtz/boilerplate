'use client';

import { Suspense, useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import {
  PromptTable,
  PromptDetailDrawer,
  PromptFilterBar,
  type SortColumn,
  type SortDirection,
  type PromptFilters,
} from '@/components/prompts';
import { useDashboard } from '@/hooks/useDashboard';
import { useDrawer } from '@/hooks/useDrawer';
import type { ParsedPrompt } from '@/types';

const PAGE_SIZE = 25;

function filterPrompts(
  prompts: ParsedPrompt[],
  filters: PromptFilters,
): ParsedPrompt[] {
  return prompts.filter((p) => {
    if (filters.status !== 'All' && p.status !== filters.status) return false;
    if (filters.epic !== 'All' && p.epicId !== filters.epic) return false;
    if (filters.location === 'active' && p.archivedAt) return false;
    if (filters.location === 'archive' && !p.archivedAt) return false;
    if (filters.role !== 'All' && p.role !== filters.role) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const fields = [p.promptId, p.title, p.epicId, p.storyId, p.role];
      if (!fields.some((f) => f.toLowerCase().includes(q))) return false;
    }
    return true;
  });
}

export default function PromptsPage() {
  return (
    <Suspense>
      <PromptsPageContent />
    </Suspense>
  );
}

function PromptsPageContent() {
  const { state } = useDashboard();
  const searchParams = useSearchParams();
  const { isOpen, selectedId, open, close, drawerRef } = useDrawer();

  const [sortColumn, setSortColumn] = useState<SortColumn>('promptId');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<PromptFilters>({
    status: 'All',
    epic: 'All',
    location: 'active',
    role: 'All',
    search: '',
  });

  // Deep-linking: URL ?id=X opens drawer
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) open(id);
  }, [searchParams, open]);

  const handleSort = useCallback(
    (column: SortColumn) => {
      if (column === sortColumn) {
        setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortColumn(column);
        setSortDirection('asc');
      }
      setCurrentPage(1);
    },
    [sortColumn],
  );

  const handleFilterChange = useCallback((next: PromptFilters) => {
    setFilters(next);
    setCurrentPage(1);
  }, []);

  const filteredPrompts = useMemo(
    () => filterPrompts(state?.prompts ?? [], filters),
    [state?.prompts, filters],
  );

  const uniqueRoles = useMemo(() => {
    const roles = new Set((state?.prompts ?? []).map((p) => p.role));
    return Array.from(roles).sort();
  }, [state?.prompts]);

  const selectedPrompt = useMemo(
    () => state?.prompts.find((p) => p.promptId === selectedId) ?? null,
    [state?.prompts, selectedId],
  );

  const matchingHandoffs = useMemo(
    () => state?.sessions.filter((s) => s.promptId === selectedId) ?? [],
    [state?.sessions, selectedId],
  );

  const prerequisiteStatuses = useMemo(
    () =>
      selectedPrompt?.prerequisites.map((preId) => ({
        promptId: preId,
        status:
          state?.prompts.find((p) => p.promptId === preId)?.status ?? 'draft' as const,
      })) ?? [],
    [selectedPrompt, state?.prompts],
  );

  const handlePromptNavigate = useCallback(
    (promptId: string) => {
      open(promptId);
    },
    [open],
  );

  return (
    <ErrorBoundary viewName="Prompts">
      <div data-testid="view-prompts" className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Prompts</h2>

        <PromptFilterBar
          epics={state?.epics ?? []}
          roles={uniqueRoles}
          onChange={handleFilterChange}
        />

        <PromptTable
          prompts={filteredPrompts}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          onRowClick={open}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />

        <PromptDetailDrawer
          prompt={selectedPrompt}
          handoffs={matchingHandoffs}
          prerequisiteStatuses={prerequisiteStatuses}
          isOpen={isOpen}
          onClose={close}
          onPromptNavigate={handlePromptNavigate}
          drawerRef={drawerRef}
        />
      </div>
    </ErrorBoundary>
  );
}
