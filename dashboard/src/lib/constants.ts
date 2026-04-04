/**
 * Application constants and configuration values.
 *
 * STATUS_THEME maps canonical prompt statuses to display colors
 * per wireframe Appendix A and architecture overview.
 */

import type { PromptStatus } from '@/types';

export const STATUS_THEME: Record<PromptStatus, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
  ready: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Ready' },
  in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'In Progress' },
  in_review: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'In Review' },
  blocked: { bg: 'bg-red-100', text: 'text-red-700', label: 'Blocked' },
  done: { bg: 'bg-green-100', text: 'text-green-700', label: 'Done' },
  superseded: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Superseded' },
  cancelled: { bg: 'bg-gray-200', text: 'text-gray-500', label: 'Cancelled' },
};
