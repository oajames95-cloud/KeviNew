import { TrendingDown, TrendingUp, MessageSquareMore, Signal } from "lucide-react"
import type { TeamSummary } from "@/types"

interface SummaryCardsProps {
  summary: TeamSummary
}

const cards = (summary: TeamSummary) => [
  {
    label: "Reps Drifting",
    value: summary.repsDrifting,
    sublabel: `of ${summary.totalReps} total reps`,
    icon: TrendingDown,
    iconClass: "text-warning",
    bgClass: "bg-warning/10",
    valueClass: "text-warning",
  },
  {
    label: "Reps Improving",
    value: summary.repsImproving,
    sublabel: "rep similarity trending up",
    icon: TrendingUp,
    iconClass: "text-success",
    bgClass: "bg-success/10",
    valueClass: "text-success",
  },
  {
    label: "Needs Coaching",
    value: summary.coachingOpportunitiesThisWeek,
    sublabel: "flagged items this week",
    icon: MessageSquareMore,
    iconClass: "text-primary",
    bgClass: "bg-primary/10",
    valueClass: "text-foreground",
  },
  {
    label: "Avg Data Coverage",
    value: `${summary.avgSignalConfidence}`,
    sublabel: "browser activity completeness",
    icon: Signal,
    iconClass: "text-muted-foreground",
    bgClass: "bg-muted",
    valueClass: "text-foreground",
  },
]

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards(summary).map(
        ({ label, value, sublabel, icon: Icon, iconClass, bgClass, valueClass }) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-card p-4 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
              <div className={`w-6 h-6 rounded flex items-center justify-center ${bgClass}`}>
                <Icon className={`w-3.5 h-3.5 ${iconClass}`} />
              </div>
            </div>
            <p className={`text-xl font-bold font-mono tabular-nums ${valueClass}`}>{value}</p>
            <p className="text-[10px] text-muted-foreground">{sublabel}</p>
          </div>
        )
      )}
    </div>
  )
}
