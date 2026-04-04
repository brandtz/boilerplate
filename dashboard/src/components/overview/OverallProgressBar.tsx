interface OverallProgressBarProps {
  scopePercent: number;
  executionPercent: number;
}

function ProgressBar({
  label,
  percent,
  color,
}: {
  label: string;
  percent: number;
  color: string;
}) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div data-testid={`progress-${label.toLowerCase()}`}>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{clamped}%</span>
      </div>
      <div
        className="h-2.5 w-full rounded-full bg-gray-200"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${clamped}%`}
      >
        <div
          className={`h-2.5 rounded-full ${color}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export function OverallProgressBar({
  scopePercent,
  executionPercent,
}: OverallProgressBarProps) {
  return (
    <div className="space-y-3" data-testid="overall-progress">
      <ProgressBar label="Scope" percent={scopePercent} color="bg-blue-500" />
      <ProgressBar
        label="Execution"
        percent={executionPercent}
        color="bg-emerald-500"
      />
    </div>
  );
}
