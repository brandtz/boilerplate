'use client';

import { useMemo, useCallback } from 'react';
import type { ParsedPrompt, PromptStatus } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Pagination } from '@/components/shared/Pagination';
import { comparePromptIds } from '@/parser/sorting';

export type SortColumn = 'promptId' | 'title' | 'epicId' | 'status' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';

interface PromptTableProps {
  prompts: ParsedPrompt[];
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  onSort: (column: SortColumn) => void;
  onRowClick: (promptId: string) => void;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const STATUS_SORT_ORDER: Record<string, number> = {
  blocked: 0,
  in_progress: 1,
  in_review: 2,
  ready: 3,
  draft: 4,
  done: 5,
  superseded: 6,
  cancelled: 7,
};

function sortPromptsByColumn(
  prompts: ParsedPrompt[],
  column: SortColumn,
  direction: SortDirection,
): ParsedPrompt[] {
  const sorted = [...prompts].sort((a, b) => {
    let cmp = 0;
    switch (column) {
      case 'promptId':
        cmp = comparePromptIds(a.promptId, b.promptId);
        break;
      case 'title':
        cmp = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        break;
      case 'epicId':
        cmp = a.epicId.localeCompare(b.epicId);
        break;
      case 'status':
        cmp = (STATUS_SORT_ORDER[a.status] ?? 99) - (STATUS_SORT_ORDER[b.status] ?? 99);
        break;
      case 'updatedAt':
        cmp = a.updatedAt.localeCompare(b.updatedAt);
        break;
    }
    return cmp;
  });
  return direction === 'desc' ? sorted.reverse() : sorted;
}

const COLUMNS: { key: SortColumn; label: string }[] = [
  { key: 'promptId', label: '#' },
  { key: 'title', label: 'Title' },
  { key: 'epicId', label: 'Epic' },
  { key: 'status', label: 'Status' },
  { key: 'updatedAt', label: 'Updated' },
];

function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export function PromptTable({
  prompts,
  sortColumn,
  sortDirection,
  onSort,
  onRowClick,
  currentPage,
  pageSize,
  onPageChange,
}: PromptTableProps) {
  const sorted = useMemo(
    () => sortPromptsByColumn(prompts, sortColumn, sortDirection),
    [prompts, sortColumn, sortDirection],
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleRowKeyDown = useCallback(
    (e: React.KeyboardEvent, promptId: string) => {
      if (e.key === 'Enter') {
        onRowClick(promptId);
      }
    },
    [onRowClick],
  );

  const sortIndicator = (col: SortColumn) => {
    if (col !== sortColumn) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const ariaSort = (col: SortColumn): 'ascending' | 'descending' | 'none' => {
    if (col !== sortColumn) return 'none';
    return sortDirection === 'asc' ? 'ascending' : 'descending';
  };

  if (prompts.length === 0) {
    return (
      <div
        className="rounded-lg border border-gray-200 bg-white p-8 text-center"
        data-testid="prompt-table-empty"
      >
        <p className="text-gray-500">No prompts match your filters</p>
      </div>
    );
  }

  return (
    <div data-testid="prompt-table-container">
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm" role="table" data-testid="prompt-table">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer hover:bg-gray-100 select-none"
                  onClick={() => onSort(col.key)}
                  aria-sort={ariaSort(col.key)}
                  data-testid={`sort-header-${col.key}`}
                >
                  {col.label}
                  {sortIndicator(col.key)}
                </th>
              ))}
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                Loc
              </th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((p) => {
              const isArchived = !!p.archivedAt;
              const isSuperseded = p.status === 'superseded';
              return (
                <tr
                  key={p.promptId}
                  onClick={() => onRowClick(p.promptId)}
                  onKeyDown={(e) => handleRowKeyDown(e, p.promptId)}
                  tabIndex={0}
                  role="row"
                  className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors ${
                    isArchived ? 'opacity-60' : ''
                  }`}
                  data-testid={`prompt-row-${p.promptId}`}
                >
                  <td className="px-4 py-2 font-mono text-gray-900">
                    {p.promptId}
                  </td>
                  <td
                    className={`px-4 py-2 text-gray-800 ${
                      isSuperseded ? 'line-through' : ''
                    }`}
                  >
                    {p.title}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{p.epicId}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={p.status as PromptStatus} size="sm" />
                  </td>
                  <td className="px-4 py-2 text-gray-500">
                    {formatDate(p.updatedAt)}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-400">
                    {isArchived ? 'arc' : 'act'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      <p
        className="mt-1 text-center text-xs text-gray-400"
        aria-live="polite"
        data-testid="prompt-count"
      >
        Showing {pageRows.length} of {sorted.length} prompts
      </p>
    </div>
  );
}
