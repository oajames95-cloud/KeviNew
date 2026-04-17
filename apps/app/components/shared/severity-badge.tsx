import { cn } from "@/lib/utils"
import type { CoachingSeverity } from "@/types"

const config: Record<CoachingSeverity, { label: string; className: string }> = {
  critical: {
    label: "Critical",
    className: "text-destructive bg-destructive/10 border border-destructive/20",
  },
  high: {
    label: "High",
    className: "text-warning bg-warning/10 border border-warning/20",
  },
  medium: {
    label: "Medium",
    className: "text-info bg-info/10 border border-info/20",
  },
  low: {
    label: "Low",
    className: "text-muted-foreground bg-muted border border-border",
  },
}

export function SeverityBadge({ severity }: { severity: CoachingSeverity }) {
  const { label, className } = config[severity]
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide",
        className
      )}
    >
      {label}
    </span>
  )
}
