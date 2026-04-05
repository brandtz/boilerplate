'use client';

import { Suspense, useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import {
  SessionTimeline,
  SessionFilterBar,
  type SessionFilters,
} from '@/components/sessions';
import { useDashboard } from '@/hooks/useDashboard';
import type { ParsedHandoff } from '@/types';

const PAGE_SIZE = 25;

function filterSessions(
  sessions: ParsedHandoff[],
  filters: SessionFilters,
): ParsedHandoff[] {
  return sessions.filter((s) => {
    if (filters.status !== 'All' && s.statusOutcome !== filters.status) return false;
    if (filters.role !== 'All' && s.role !== filters.role) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const fields = [s.sessionId, s.promptId, s.role, s.summary];
      if (!fields.some((f) => f.toLowerCase().includes(q))) return false;
    }
    return true;
  });
}

export default function SessionsPage() {
  return (
    <Suspense>
      <SessionsPageContent />
    </Suspense>
  );
}

function SessionsPageContent() {
  const { state } = useDashboard();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read initial filter state from URL
  const initialFilters = useMemo<SessionFilters>(() => ({
    status: searchParams.get('status') || 'All',
    role: searchParams.get('role') || 'All',
    search: searchParams.get('search') || '',
  }), []); // eslint-disable-line react-hooks/exhaustive-deps

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SessionFilters>(initialFilters);

  // Deep-linking: URL ?id=S-xxx expands that session
  const expandedSessionId = searchParams.get('id') ?? null;

  const handlePromptClick = useCallback(
    (promptId: string) => {
      router.push(`/prompts?id=${promptId}`);
    },
    [router],
  );

  const handleFilterChange = useCallback((next: SessionFilters) => {
    setFilters(next);
    setCurrentPage(1);

    // Sync non-default filter values to URL
    const params = new URLSearchParams();
    const id = searchParams.get('id');
    if (id) params.set('id', id);
    if (next.status !== 'All') params.set('status', next.status);
    if (next.role !== 'All') params.set('role', next.role);
    if (next.search) params.set('search', next.search);
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '/sessions');
  }, [searchParams, router]);

  const filteredSessions = useMemo(
    () => filterSessions(state?.sessions ?? [], filters),
    [state?.sessions, filters],
  );

  const uniqueRoles = useMemo(() => {
    const roles = new Set((state?.sessions ?? []).map((s) => s.role));
    return Array.from(roles).sort();
  }, [state?.sessions]);

  return (
    <ErrorBoundary viewName="Sessions">
      <div data-testid="view-sessions" className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Sessions</h2>

        <SessionFilterBar
          roles={uniqueRoles}
          onChange={handleFilterChange}
          initialFilters={initialFilters}
        />

        <SessionTimeline
          sessions={filteredSessions}
          onPromptClick={handlePromptClick}
          currentPage={currentPage}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
          expandedSessionId={expandedSessionId}
        />
      </div>
    </ErrorBoundary>
  );
}
