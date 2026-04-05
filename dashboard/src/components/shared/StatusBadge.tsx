import type { PromptStatus } from '@/types';
import { STATUS_THEME } from '@/constants/statusTheme';

interface StatusBadgeProps {
  status: PromptStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const theme = STATUS_THEME[status] ?? STATUS_THEME.draft;
  const strikethrough = status === 'superseded' || status === 'cancelled';

  const sizeClasses =
    size === 'sm'
      ? 'text-xs px-1.5 py-0.5 rounded'
      : 'text-sm px-2 py-1 rounded-md';

  return (
    <span
      className={`inline-flex items-center font-medium ${theme.bg} ${theme.text} ${sizeClasses} ${strikethrough ? 'line-through' : ''}`}
      aria-label={`Status: ${theme.label}`}
      data-testid="status-badge"
    >
      {theme.label}
    </span>
  );
}
