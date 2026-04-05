'use client';

import { useMemo } from 'react';
import type { ParsedHandoff } from '@/types';
import { useAccordion } from '@/hooks/useAccordion';
import { Pagination } from '@/components/shared/Pagination';
import { SessionCard } from './SessionCard';

interface SessionTimelineProps {
  sessions: ParsedHandoff[];
  onPromptClick: (promptId: string) => void;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  /** Optional session ID to auto-expand (deep-linking). */
  expandedSessionId?: string | null;
}

/** Format ISO date string to display date, e.g. "Apr 4, 2026". */
function formatDateHeader(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Extract YYYY-MM-DD from ISO date string for grouping. */
function dateKey(iso: string): string {
  return iso.slice(0, 10);
}

interface DateGroup {
  date: string;
  label: string;
  sessions: ParsedHandoff[];
}

export function SessionTimeline({
  sessions,
  onPromptClick,
  currentPage,
  pageSize,
  onPageChange,
  expandedSessionId,
}: SessionTimelineProps) {
  const initialExpanded = expandedSessionId ? [expandedSessionId] : [];
  const { isExpanded, toggle } = useAccordion(initialExpanded);

  // Sort newest first
  const sorted = useMemo(
    () => [...sessions].sort((a, b) => b.endedAt.localeCompare(a.endedAt)),
    [sessions],
  );

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize);
  const pageStart = (currentPage - 1) * pageSize;
  const pageSlice = sorted.slice(pageStart, pageStart + pageSize);

  // Group by date
  const groups: DateGroup[] = useMemo(() => {
    const map = new Map<string, DateGroup>();
    for (const s of pageSlice) {
      const key = dateKey(s.endedAt);
      if (!map.has(key)) {
        map.set(key, { date: key, label: formatDateHeader(s.endedAt), sessions: [] });
      }
      map.get(key)!.sessions.push(s);
    }
    return Array.from(map.values());
  }, [pageSlice]);

  if (sessions.length === 0) {
    return (
      <div
        className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-400"
        data-testid="sessions-empty"
      >
        No sessions completed yet
      </div>
    );
  }

  return (
    <div data-testid="session-timeline">
      <div role="list" className="space-y-6">
        {groups.map((group) => (
          <div key={group.date}>
            <h3
              className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700"
              data-testid={`date-header-${group.date}`}
            >
              <span className="text-blue-500">●</span> {group.label}
            </h3>
            <div className="space-y-3 pl-4">
              {group.sessions.map((session) => (
                <SessionCard
                  key={session.sessionId}
                  session={session}
                  isExpanded={isExpanded(session.sessionId)}
                  onToggle={() => toggle(session.sessionId)}
                  onPromptClick={onPromptClick}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      <p className="text-center text-xs text-gray-400 mt-2" data-testid="session-count">
        {sessions.length} session{sessions.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
