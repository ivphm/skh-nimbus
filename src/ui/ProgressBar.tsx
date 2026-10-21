export interface ProgressBarProps {
  value: number
  max: number
  label: string
  className?: string
  barClassName?: string
}

export function ProgressBar({ value, max, label, className = '', barClassName = 'bg-accent' }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={`h-2 overflow-hidden rounded-full bg-surface-2 ${className}`}
    >
      <div className={`h-full rounded-full transition-[width] duration-500 ${barClassName}`} style={{ width: `${pct}%` }} />
    </div>
  )
}
