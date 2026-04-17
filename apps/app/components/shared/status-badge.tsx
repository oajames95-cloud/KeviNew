import { cn } from "@/lib/utils"
import type { CoachingStatus } from "@/types"

const statusConfig: Record<CoachingStatus, { label: string; className: string }> = {
  new: {
    label: "New",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  reviewing: {
    label: "Reviewing",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  coached: {
    label: "Coached",
    className: "bg-success/10 text-success border-success/20",
  },
  watchlist: {
    label: "Watchlist",
    className: "bg-muted text-muted-foreground border-border",
  },
}

export function StatusBadge({ status }: { status: CoachingStatus }) {
  const { label, className } = statusConfig[status]
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border capitalize",
        className
      )}
    >
      {label}
    </span>
  )
}
