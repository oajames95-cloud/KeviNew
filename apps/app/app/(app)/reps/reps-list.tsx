"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ChevronRight, Search, Menu } from "lucide-react"
import { useMobileSidebar } from "@/components/shell/app-shell"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Rep, Team, CoachingInsight, RepTrend } from "@/types"
import { cn } from "@/lib/utils"

const TREND_FILTERS: { label: string; value: RepTrend | "all" }[] = [
  { label: "All", value: "all" },
  { label: "At Risk", value: "at-risk" },
  { label: "Drifting", value: "drifting" },
  { label: "Stable", value: "stable" },
]

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("")
}

function TrendBadge({ trend }: { trend: RepTrend }) {
  const config = {
    "at-risk": { label: "At Risk", className: "bg-red-100 text-red-700" },
    "drifting": { label: "Drifting", className: "bg-amber-100 text-amber-700" },
    "stable": { label: "Stable", className: "bg-slate-100 text-slate-600" },
    "improving": { label: "Improving", className: "bg-emerald-100 text-emerald-700" },
  }
  const { label, className } = config[trend]
  return (
    <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", className)}>
      {label}
    </span>
  )
}

function formatRelativeDate(dateString: string | undefined): string {
  if (!dateString) return "Never"
  const date = new Date(dateString)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return `${Math.floor(diffDays / 30)}mo ago`
}

interface RepsListProps {
  reps: Rep[]
  teams: Team[]
  coachingInsights: CoachingInsight[]
}

export function RepsList({ reps, teams, coachingInsights }: RepsListProps) {
  const { toggle } = useMobileSidebar()
  const [search, setSearch] = useState("")
  const [trendFilter, setTrendFilter] = useState<RepTrend | "all">("all")

  function getLatestCoachingItem(repId: string) {
    return coachingInsights
      .filter((ci) => ci.repId === repId && ci.status !== "coached")
      .sort((a, b) => new Date(b.flaggedAt).getTime() - new Date(a.flaggedAt).getTime())[0]
  }

  function getLastCoachedDate(repId: string) {
    const coached = coachingInsights
      .filter((ci) => ci.repId === repId && ci.status === "coached")
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
    return coached?.updatedAt
  }

  const filtered = useMemo(() => {
    let result = reps.filter((rep) => {
      const matchesSearch =
        rep.name.toLowerCase().includes(search.toLowerCase()) ||
        rep.role.toLowerCase().includes(search.toLowerCase())
      const matchesTrend = trendFilter === "all" || rep.trend === trendFilter
      return matchesSearch && matchesTrend
    })

    // Sort by coaching priority (at-risk first, then drifting, then by name)
    result = [...result].sort((a, b) => {
      const order = { "at-risk": 0, "drifting": 1, "stable": 2, "improving": 3 }
      const orderDiff = order[a.trend] - order[b.trend]
      if (orderDiff !== 0) return orderDiff
      return a.name.localeCompare(b.name)
    })

    return result
  }, [reps, search, trendFilter])

  const atRiskCount = reps.filter((r) => r.trend === "at-risk").length
  const driftingCount = reps.filter((r) => r.trend === "drifting").length

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
            <h1 className="text-lg font-semibold text-foreground">Reps</h1>
            <p className="text-xs text-muted-foreground">{reps.length} total</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or role..."
              className="h-9 pl-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            {TREND_FILTERS.map((f) => {
              const count = f.value === "at-risk" ? atRiskCount 
                         : f.value === "drifting" ? driftingCount 
                         : null
              return (
                <button
                  key={f.value}
                  onClick={() => setTrendFilter(f.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    trendFilter === f.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  )}
                >
                  {f.label}
                  {count !== null && count > 0 && (
                    <span className={cn(
                      "ml-1.5 text-xs",
                      trendFilter === f.value ? "opacity-80" : ""
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Rep
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Trend
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Similarity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Last Coached
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Next Action
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((rep) => {
                  const latestItem = getLatestCoachingItem(rep.id)
                  const lastCoached = getLastCoachedDate(rep.id)
                  
                  return (
                    <tr
                      key={rep.id}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-9 h-9 shrink-0">
                            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                              {initials(rep.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{rep.name}</p>
                            <p className="text-xs text-muted-foreground">{rep.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <TrendBadge trend={rep.trend} />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={cn(
                          "text-sm font-semibold tabular-nums",
                          rep.scores.topRepSimilarity >= 70 ? "text-emerald-600" 
                            : rep.scores.topRepSimilarity >= 50 ? "text-amber-600" 
                            : "text-red-600"
                        )}>
                          {rep.scores.topRepSimilarity}%
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-muted-foreground">
                          {formatRelativeDate(lastCoached)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {latestItem ? (
                          <span className="text-sm text-foreground line-clamp-1 max-w-[200px]">
                            {latestItem.theme}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">No active items</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/reps/${rep.id}`}
                          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors ml-auto"
                          aria-label={`View ${rep.name}`}
                        >
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-medium text-foreground">No reps match your filters</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search or trend filter
            </p>
            <button
              onClick={() => { setSearch(""); setTrendFilter("all") }}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
