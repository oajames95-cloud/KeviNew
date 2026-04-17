import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { RepTrend } from "@/types"

const config: Record<
  RepTrend,
  { label: string; icon: React.ElementType; className: string }
> = {
  improving: {
    label: "Improving",
    icon: TrendingUp,
    className: "text-success bg-success/10",
  },
  stable: {
    label: "Stable",
    icon: Minus,
    className: "text-muted-foreground bg-muted",
  },
  drifting: {
    label: "Drifting",
    icon: TrendingDown,
    className: "text-warning bg-warning/10",
  },
  "at-risk": {
    label: "At Risk",
    icon: AlertTriangle,
    className: "text-destructive bg-destructive/10",
  },
}

export function TrendBadge({ trend }: { trend: RepTrend }) {
  const { label, icon: Icon, className } = config[trend]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium",
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}
