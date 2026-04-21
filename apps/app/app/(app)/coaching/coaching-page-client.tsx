"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Menu, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  ArrowRight,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMobileSidebar } from "@/components/shell/app-shell"
import type { CoachingInsight, CoachingSeverity, CoachingStatus } from "@/types"
import { cn } from "@/lib/utils"

const SEVERITY_FILTERS: { label: string; value: CoachingSeverity | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
]

const STATUS_FILTERS: { label: string; value: CoachingStatus | "all" }[] = [
  { label: "Open", value: "all" },
  { label: "New", value: "new" },
  { label: "Reviewing", value: "reviewing" },
  { label: "Coached", value: "coached" },
]

const severityConfig = {
  critical: {
    icon: AlertCircle,
    bg: "bg-red-50",
    border: "border-red-200",
    iconColor: "text-red-600",
    label: "Critical",
    labelBg: "bg-red-100 text-red-700",
  },
  high: {
    icon: AlertTriangle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconColor: "text-amber-600",
    label: "High",
    labelBg: "bg-amber-100 text-amber-700",
  },
  medium: {
    icon: Info,
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconColor: "text-blue-600",
    label: "Medium",
    labelBg: "bg-blue-100 text-blue-700",
  },
  low: {
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    iconColor: "text-emerald-600",
    label: "Low",
    labelBg: "bg-emerald-100 text-emerald-700",
  },
}

const statusConfig = {
  new: { label: "New", className: "bg-primary/10 text-primary" },
  reviewing: { label: "Reviewing", className: "bg-amber-100 text-amber-700" },
  coached: { label: "Coached", className: "bg-emerald-100 text-emerald-700" },
  watchlist: { label: "Watchlist", className: "bg-slate-100 text-slate-600" },
}

function formatTheme(theme: string): string {
  return theme
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

interface CoachingPageClientProps {
  initialInsights: CoachingInsight[]
}

export function CoachingPageClient({ initialInsights }: CoachingPageClientProps) {
  const { toggle } = useMobileSidebar()
  const [severityFilter, setSeverityFilter] = useState<CoachingSeverity | "all">("all")
  const [statusFilter, setStatusFilter] = useState<CoachingStatus | "all">("all")

  const filtered = initialInsights.filter((i) => {
    const matchesSeverity = severityFilter === "all" || i.severity === severityFilter
    const matchesStatus = statusFilter === "all" 
      ? i.status !== "coached" 
      : i.status === statusFilter
    return matchesSeverity && matchesStatus
  })

  // Sort by severity then by date
  const sorted = [...filtered].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 }
    const severityDiff = order[a.severity] - order[b.severity]
    if (severityDiff !== 0) return severityDiff
    return new Date(b.flaggedAt).getTime() - new Date(a.flaggedAt).getTime()
  })

  const openCount = initialInsights.filter((i) => i.status !== "coached").length

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
        <div className="flex items-center gap-4 px-6 h-14">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden -ml-2"
            onClick={toggle}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Coaching</h1>
            <p className="text-xs text-muted-foreground">{openCount} open items</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2">
            {SEVERITY_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setSeverityFilter(f.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  severityFilter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="sm:ml-auto flex items-center gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                  statusFilter === f.value
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Card feed */}
        <div className="flex flex-col gap-4 max-w-2xl">
          {sorted.map((item) => {
            const config = severityConfig[item.severity]
            const Icon = config.icon
            const status = statusConfig[item.status]

            return (
              <Link
                key={item.id}
                href={`/reps/${item.repId}`}
                className={cn(
                  "group flex flex-col p-5 rounded-xl border bg-card transition-all hover:shadow-md",
                  config.border
                )}
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn("p-2 rounded-lg shrink-0", config.bg)}>
                    <Icon className={cn("w-5 h-5", config.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{item.repName}</span>
                      <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", config.labelBg)}>
                        {config.label}
                      </span>
                      <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", status.className)}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {formatTheme(item.theme)}
                    </p>
                  </div>
                </div>

                {/* Context */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {item.reason}
                </p>

                {/* Suggested talking points */}
                {item.recommendedAction && (
                  <div className="mb-4 p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Suggested talking point
                      </span>
                    </div>
                    <p className="text-sm text-foreground line-clamp-2">
                      {item.recommendedAction}
                    </p>
                  </div>
                )}

                {/* Action */}
                <div className="flex items-center gap-2 text-sm text-primary font-medium">
                  Open coaching hub
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Empty state */}
        {sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">All caught up!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {statusFilter === "coached" 
                ? "No coached items yet. Complete a coaching session to see history here."
                : "No coaching items match your current filters."}
            </p>
            {statusFilter !== "all" && (
              <Button 
                variant="outline" 
                onClick={() => { setSeverityFilter("all"); setStatusFilter("all") }}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
