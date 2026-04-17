"use client"

import { useState } from "react"
import { AppHeader } from "@/components/shell/app-header"
import { useMobileSidebar } from "@/components/shell/app-shell"
import { CoachingList } from "@/components/coaching/coaching-list"
import { CoachingDrawer } from "@/components/coaching/coaching-drawer"
import { mockCoachingInsights } from "@/lib/mock-data"
import type { CoachingInsight, CoachingSeverity, CoachingStatus } from "@/types"
import { cn } from "@/lib/utils"

const SEVERITY_FILTERS: { label: string; value: CoachingSeverity | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
]

const STATUS_FILTERS: { label: string; value: CoachingStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Reviewing", value: "reviewing" },
  { label: "Coached", value: "coached" },
  { label: "Watchlist", value: "watchlist" },
]

export default function CoachingPage() {
  const { toggle } = useMobileSidebar()
  const [severityFilter, setSeverityFilter] = useState<CoachingSeverity | "all">("all")
  const [statusFilter, setStatusFilter] = useState<CoachingStatus | "all">("all")
  const [selected, setSelected] = useState<CoachingInsight | null>(null)
  const [insights, setInsights] = useState(mockCoachingInsights)

  const filtered = insights.filter((i) => {
    const matchesSeverity = severityFilter === "all" || i.severity === severityFilter
    const matchesStatus = statusFilter === "all" || i.status === statusFilter
    return matchesSeverity && matchesStatus
  })

  function handleStatusChange(id: string, status: CoachingStatus) {
    setInsights((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status, updatedAt: new Date().toISOString() } : i))
    )
    if (selected?.id === id) setSelected((s) => s ? { ...s, status } : null)
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AppHeader
        title="Coaching Queue"
        subtitle={`${insights.filter((i) => i.status !== "coached").length} open items`}
        onMenuClick={toggle}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 px-4 py-3 border-b border-border bg-card shrink-0">
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Severity
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {SEVERITY_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setSeverityFilter(f.value)}
                    className={cn(
                      "px-2.5 py-1.5 rounded text-xs font-medium transition-colors",
                      severityFilter === f.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={cn(
                      "px-2.5 py-1.5 rounded text-xs font-medium transition-colors",
                      statusFilter === f.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List */}
          <CoachingList
            insights={filtered}
            selected={selected}
            onSelect={setSelected}
            onStatusChange={handleStatusChange}
          />
        </div>

        {/* Detail drawer */}
        {selected && (
          <CoachingDrawer
            insight={selected}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </div>
  )
}
