import type { PromptStatus } from '@/types';

export interface StatusTheme {
  bg: string;
  text: string;
  label: string;
}

/**
 * Canonical status theme map aligned with WCAG AA contrast requirements.
 * Referenced in docs/dashboard-ux-wireframes.md Appendix A.
 */
export const STATUS_THEME: Record<PromptStatus, StatusTheme> = {
  draft: { bg: 'bg-gray-200', text: 'text-gray-700', label: 'Draft' },
  ready: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Ready' },
  in_progress: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'In Progress' },
  in_review: { bg: 'bg-violet-100', text: 'text-violet-800', label: 'In Review' },
  blocked: { bg: 'bg-red-100', text: 'text-red-800', label: 'Blocked' },
  done: { bg: 'bg-green-100', text: 'text-green-800', label: 'Done' },
  superseded: { bg: 'bg-gray-100', text: 'text-gray-400', label: 'Superseded' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-400', label: 'Cancelled' },
};
