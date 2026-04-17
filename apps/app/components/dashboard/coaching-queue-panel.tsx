import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { SeverityBadge } from "@/components/shared/severity-badge"
import type { CoachingInsight } from "@/types"

interface CoachingQueuePanelProps {
  insights: CoachingInsight[]
}

const statusLabel: Record<string, string> = {
  new: "New",
  reviewing: "Reviewing",
  coached: "Coached",
  watchlist: "Watchlist",
}

const statusClass: Record<string, string> = {
  new: "text-primary bg-primary/10",
  reviewing: "text-warning bg-warning/10",
  coached: "text-success bg-success/10",
  watchlist: "text-muted-foreground bg-muted",
}

export function CoachingQueuePanel({ insights }: CoachingQueuePanelProps) {
  const active = insights.filter((i) => i.status !== "coached").slice(0, 4)

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {"Today's Coaching Queue"}
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {active.length} items open
          </p>
        </div>
        <Link
          href="/coaching"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          Full queue <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="divide-y divide-border/50">
        {active.map((item) => (
          <Link
            key={item.id}
            href="/coaching"
            className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-foreground">{item.repName}</span>
                <SeverityBadge severity={item.severity} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 capitalize">{item.theme}</p>
              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{item.reason}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded capitalize ${statusClass[item.status]}`}
              >
                {statusLabel[item.status]}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
