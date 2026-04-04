interface SummaryCardProps {
  label: string;
  value: number;
  variant?: 'scope' | 'execution';
}

export function SummaryCard({ label, value, variant = 'scope' }: SummaryCardProps) {
  const borderColor =
    variant === 'execution' ? 'border-l-emerald-500' : 'border-l-blue-500';

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm border-l-4 ${borderColor}`}
      role="status"
      aria-label={`${label} count: ${value}`}
      data-testid={`summary-card-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
