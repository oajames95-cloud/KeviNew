"use client"

import { AlertCircle, AlertTriangle, Info, CheckCircle2, MessageSquare, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Rep } from "@/types"
import { cn } from "@/lib/utils"

interface CoachingItemsListProps {
  rep: Rep
  onPrepareSession?: () => void
}

const mockCoachingItems = [
  {
    id: "1",
    theme: "Follow-up Discipline",
    reason: "Follow-up rate dropped 18% after new sequencer rollout. May be process friction or tool adoption issue.",
    severity: "critical" as const,
    status: "new" as const,
    flaggedAt: "2 days ago",
    talkingPoints: [
      "Walk through current follow-up workflow",
      "Check sequencer setup and cadence",
      "Identify friction points"
    ],
  },
  {
    id: "2",
    theme: "Prospecting Focus",
    reason: "Context switches up to 48/day vs 22 for top performers. Focus blocks averaging 55 min vs 85+ target.",
    severity: "high" as const,
    status: "reviewing" as const,
    flaggedAt: "5 days ago",
    talkingPoints: [
      "Review morning routine structure",
      "Discuss calendar blocking strategy",
      "Set up quiet hours/DND"
    ],
  },
  {
    id: "3",
    theme: "Research Prep",
    reason: "Pre-call research time at 18 min/day vs 28+ for top performers. Quick wins may help connect rate.",
    severity: "medium" as const,
    status: "watchlist" as const,
    flaggedAt: "1 week ago",
    talkingPoints: [
      "Share top-performer pre-call checklist",
      "Schedule co-work session with Priya"
    ],
  },
]

const severityConfig = {
  critical: {
    icon: AlertCircle,
    bg: "bg-red-50",
    border: "border-red-200 hover:border-red-300",
    iconColor: "text-red-600",
    label: "Critical",
  },
  high: {
    icon: AlertTriangle,
    bg: "bg-amber-50",
    border: "border-amber-200 hover:border-amber-300",
    iconColor: "text-amber-600",
    label: "High",
  },
  medium: {
    icon: Info,
    bg: "bg-blue-50",
    border: "border-blue-200 hover:border-blue-300",
    iconColor: "text-blue-600",
    label: "Medium",
  },
  low: {
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    border: "border-emerald-200 hover:border-emerald-300",
    iconColor: "text-emerald-600",
    label: "Low",
  },
}

const statusConfig = {
  new: { label: "New", className: "bg-primary/10 text-primary" },
  reviewing: { label: "Reviewing", className: "bg-amber-100 text-amber-700" },
  coached: { label: "Coached", className: "bg-emerald-100 text-emerald-700" },
  watchlist: { label: "Watchlist", className: "bg-slate-100 text-slate-600" },
}

export function CoachingItemsList({ rep, onPrepareSession }: CoachingItemsListProps) {
  if (mockCoachingItems.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground">No active focus areas</p>
        <p className="text-xs text-muted-foreground mt-1">Great job! All coaching items are resolved.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {mockCoachingItems.map((item) => {
        const severity = severityConfig[item.severity]
        const status = statusConfig[item.status]
        const Icon = severity.icon

        return (
          <div
            key={item.id}
            className={cn(
              "rounded-xl border bg-card p-4 transition-all",
              severity.border
            )}
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              <div className={cn("p-2 rounded-lg shrink-0", severity.bg)}>
                <Icon className={cn("w-4 h-4", severity.iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm text-foreground">{item.theme}</h3>
                  <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", status.className)}>
                    {status.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{item.reason}</p>
              </div>
            </div>

            {/* Talking Points */}
            {item.talkingPoints && item.talkingPoints.length > 0 && (
              <div className="mb-3 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-1.5 mb-2">
                  <MessageSquare className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Suggested talking points
                  </span>
                </div>
                <ul className="space-y-1">
                  {item.talkingPoints.map((point, i) => (
                    <li key={i} className="text-xs text-foreground flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Flagged {item.flaggedAt}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2 gap-1 text-primary hover:text-primary"
                onClick={onPrepareSession}
              >
                Start session
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
