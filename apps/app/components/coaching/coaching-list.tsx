import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { SeverityBadge } from "@/components/shared/severity-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { CoachingInsight, CoachingStatus } from "@/types"
import { cn } from "@/lib/utils"

const statusLabel: Record<CoachingStatus, string> = {
  new: "New",
  reviewing: "Reviewing",
  coached: "Coached",
  watchlist: "Watchlist",
}

const statusClass: Record<CoachingStatus, string> = {
  new: "text-primary bg-primary/10",
  reviewing: "text-warning bg-warning/10",
  coached: "text-success bg-success/10",
  watchlist: "text-muted-foreground bg-muted",
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("")
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

interface CoachingListProps {
  insights: CoachingInsight[]
  selected: CoachingInsight | null
  onSelect: (insight: CoachingInsight) => void
  onStatusChange: (id: string, status: CoachingStatus) => void
}

export function CoachingList({ insights, selected, onSelect, onStatusChange }: CoachingListProps) {
  if (insights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-16 text-center">
        <p className="text-sm font-medium text-foreground">No coaching items match</p>
        <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-border/50">
      {insights.map((item) => (
        <div
          key={item.id}
          onClick={() => onSelect(item)}
          className={cn(
            "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/30",
            selected?.id === item.id && "bg-muted/50 border-l-2 border-l-primary"
          )}
        >
          {/* Avatar */}
          <Avatar className="w-8 h-8 shrink-0 mt-0.5">
            <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
              {initials(item.repName)}
            </AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-foreground">{item.repName}</span>
              <SeverityBadge severity={item.severity} />
              <span
                className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded capitalize",
                  statusClass[item.status]
                )}
              >
                {statusLabel[item.status]}
              </span>
            </div>

            <p className="text-xs text-muted-foreground mb-1 capitalize font-medium">
              {item.theme} · {item.teamName}
            </p>

            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
              {item.reason}
            </p>

            {/* Metric badges */}
            {item.metrics && (
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(item.metrics).map(([key, val]) => {
                  const labels: Record<string, string> = {
                    topRepSimilarity: "Rep Sim",
                    workflowDrift: "Drift",
                    prospectingFocusTime: "Prospecting",
                    followUpDiscipline: "Follow-up",
                    outboundVelocity: "Outbound",
                    signalConfidence: "Coverage",
                  }
                  return (
                    <span
                      key={key}
                      className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                    >
                      {labels[key] ?? key}: {val}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right side */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-[10px] text-muted-foreground">
              {formatDate(item.flaggedAt)}
            </span>
            <Link
              href={`/reps/${item.repId}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] text-primary flex items-center gap-1 hover:underline"
            >
              Rep profile <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
