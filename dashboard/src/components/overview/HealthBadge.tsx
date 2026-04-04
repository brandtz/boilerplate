interface HealthBadgeProps {
  status: 'on_track' | 'at_risk' | 'blocked' | 'not_started';
}

const HEALTH_CONFIG: Record<
  HealthBadgeProps['status'],
  { label: string; className: string }
> = {
  on_track: {
    label: 'On Track',
    className: 'bg-green-100 text-green-800',
  },
  at_risk: {
    label: 'At Risk',
    className: 'bg-yellow-100 text-yellow-800',
  },
  blocked: {
    label: 'Blocked',
    className: 'bg-red-100 text-red-800',
  },
  not_started: {
    label: 'Not Started',
    className: 'bg-gray-100 text-gray-600',
  },
};

export function HealthBadge({ status }: HealthBadgeProps) {
  const config = HEALTH_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${config.className}`}
      aria-label={`Project health: ${config.label}`}
      data-testid="health-badge"
    >
      {config.label}
    </span>
  );
}
