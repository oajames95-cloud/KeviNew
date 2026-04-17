"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ChevronRight, Search, ArrowUpDown, MessageSquare } from "lucide-react"
import { AppHeader } from "@/components/shell/app-header"
import { useMobileSidebar } from "@/components/shell/app-shell"
import { ScoreBadge } from "@/components/shared/score-badge"
import { CoachingPriority, getCoachingPriorityOrder } from "@/components/shared/coaching-priority"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Rep, Team, CoachingInsight, RepTrend } from "@/types"
import { cn } from "@/lib/utils"

const TREND_FILTERS: { label: string; value: RepTrend | "all" }[] = [
  { label: "All", value: "all" },
  { label: "At Risk", value: "at-risk" },
  { label: "Drifting", value: "drifting" },
  { label: "Stable", value: "stable" },
  { label: "Improving", value: "improving" },
]

type SortOption = "priority" | "name" | "pattern" | "drift"

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Coaching Priority", value: "priority" },
  { label: "Name (A-Z)", value: "name" },
  { label: "Rep Similarity", value: "pattern" },
  { label: "Workflow Drift", value: "drift" },
]

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("")
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
  const [sortBy, setSortBy] = useState<SortOption>("priority")

  function hasActiveCoachingItem(repId: string) {
    return coachingInsights.some(
      (ci) => ci.repId === repId && ci.status !== "coached"
    )
  }

  const filtered = useMemo(() => {
    let result = reps.filter((rep) => {
      const matchesSearch =
        rep.name.toLowerCase().includes(search.toLowerCase()) ||
        rep.role.toLowerCase().includes(search.toLowerCase())
      const matchesTrend = trendFilter === "all" || rep.trend === trendFilter
      return matchesSearch && matchesTrend
    })

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "priority":
          return getCoachingPriorityOrder(a.trend) - getCoachingPriorityOrder(b.trend)
        case "name":
          return a.name.localeCompare(b.name)
        case "pattern":
          return b.scores.topRepSimilarity - a.scores.topRepSimilarity
        case "drift":
          return b.scores.workflowDrift - a.scores.workflowDrift
        default:
          return 0
      }
    })

    return result
  }, [reps, search, trendFilter, sortBy])

  // Group by team
  const groupedByTeam = useMemo(() => {
    const groups: Record<string, typeof filtered> = {}
    filtered.forEach((rep) => {
      if (!groups[rep.teamId]) groups[rep.teamId] = []
      groups[rep.teamId].push(rep)
    })
    return groups
  }, [filtered])

  // Stats for the subtitle
  const atRiskCount = reps.filter((r) => r.trend === "at-risk").length
  const driftingCount = reps.filter((r) => r.trend === "drifting").length
  const needsAttentionCount = atRiskCount + driftingCount

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AppHeader
        title="Reps"
        subtitle={`${needsAttentionCount} need attention · ${reps.length} total`}
        onMenuClick={toggle}
      />

      <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
        {/* Summary banner for managers */}
        {needsAttentionCount > 0 && (
          <div className="rounded-lg bg-warning/5 border border-warning/20 px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {atRiskCount > 0 && `${atRiskCount} rep${atRiskCount > 1 ? "s" : ""} at risk`}
                  {atRiskCount > 0 && driftingCount > 0 && ", "}
                  {driftingCount > 0 && `${driftingCount} drifting`}
                </p>
                <p className="text-xs text-muted-foreground">
                  Review coaching priorities before your next 1:1s
                </p>
              </div>
            </div>
            <Link href="/coaching">
              <Button variant="outline" size="sm" className="h-8 text-xs shrink-0">
                Open Coaching Queue
              </Button>
            </Link>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by name or role..."
              className="h-8 pl-8 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {TREND_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setTrendFilter(f.value)}
                className={cn(
                  "px-2.5 py-1.5 rounded text-xs font-medium transition-colors",
                  trendFilter === f.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
                {f.value === "at-risk" && atRiskCount > 0 && (
                  <span className={cn(
                    "ml-1.5 text-[10px] px-1 rounded",
                    trendFilter === f.value ? "bg-primary-foreground/20" : "bg-destructive/20 text-destructive"
                  )}>
                    {atRiskCount}
                  </span>
                )}
                {f.value === "drifting" && driftingCount > 0 && (
                  <span className={cn(
                    "ml-1.5 text-[10px] px-1 rounded",
                    trendFilter === f.value ? "bg-primary-foreground/20" : "bg-warning/20 text-warning"
                  )}>
                    {driftingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs ml-auto">
                <ArrowUpDown className="w-3.5 h-3.5" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={cn(
                    "text-xs",
                    sortBy === opt.value && "bg-accent"
                  )}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Team sections */}
        {teams.map((team) => {
          const teamReps = groupedByTeam[team.id]
          if (!teamReps || teamReps.length === 0) return null
          return (
            <section key={team.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {team.name}
                </h2>
                <span className="text-[10px] text-muted-foreground/60">
                  {teamReps.length} rep{teamReps.length !== 1 && "s"}
                </span>
              </div>
              <div className="rounded-lg border border-border bg-card overflow-hidden overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Rep
                      </th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Priority
                      </th>
                      <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Rep Sim
                      </th>
                      <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        W. Drift
                      </th>
                      <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                        Follow-up
                      </th>
                      <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                        Outbound
                      </th>
                      <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Coaching
                      </th>
                      <th className="px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {teamReps.map((rep) => {
                      const hasCoaching = hasActiveCoachingItem(rep.id)
                      return (
                        <tr
                          key={rep.id}
                          className={cn(
                            "border-b border-border/50 last:border-0 transition-colors",
                            (rep.trend === "at-risk" || rep.trend === "drifting")
                              ? "bg-warning/[0.02] hover:bg-warning/[0.04]"
                              : "hover:bg-muted/30"
                          )}
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8 shrink-0">
                                <AvatarFallback className="text-[11px] font-semibold bg-primary/10 text-primary">
                                  {initials(rep.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-foreground">{rep.name}</p>
                                <p className="text-[11px] text-muted-foreground">{rep.role}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <CoachingPriority trend={rep.trend} />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <ScoreBadge score={rep.scores.topRepSimilarity} size="sm" />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <ScoreBadge score={rep.scores.workflowDrift} size="sm" isDrift={true} />
                          </td>
                          <td className="px-4 py-3 text-center hidden lg:table-cell">
                            <ScoreBadge score={rep.scores.followUpDiscipline} size="sm" />
                          </td>
                          <td className="px-4 py-3 text-center hidden lg:table-cell">
                            <ScoreBadge score={rep.scores.outboundVelocity} size="sm" />
                          </td>
                          <td className="px-4 py-3 text-center">
                            {hasCoaching ? (
                              <Link
                                href="/coaching"
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-warning hover:underline"
                              >
                                <MessageSquare className="w-3 h-3" />
                                Active
                              </Link>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Link
                              href={`/reps/${rep.id}`}
                              className="flex items-center justify-center w-6 h-6 rounded hover:bg-muted transition-colors ml-auto"
                              aria-label={`View ${rep.name}`}
                            >
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-medium text-foreground">No reps match your filters</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your search or trend filter
            </p>
            <button
              onClick={() => { setSearch(""); setTrendFilter("all") }}
              className="mt-3 text-xs text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
