"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Target,
  Users,
  ArrowRight,
  Phone,
  Mail,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Rep, Team, CoachingInsight, PatternShift } from "@/types"

interface OverviewClientProps {
  reps: Rep[]
  teams: Team[]
  coachingInsights: CoachingInsight[]
  patternShifts: PatternShift[]
}

export function OverviewClient({
  reps,
  teams,
  coachingInsights,
  patternShifts,
}: OverviewClientProps) {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)

  const filteredReps = useMemo(() => {
    if (!selectedTeam) return reps
    return reps.filter((r) => r.teamId === selectedTeam)
  }, [reps, selectedTeam])

  // Calculate team attainment metrics
  const attainmentMetrics = useMemo(() => {
    const totalMeetings = filteredReps.reduce((sum, rep) => {
      return sum + rep.recentActivity.reduce((s, d) => s + d.meetingsBooked, 0)
    }, 0)

    const avgProspectingHours =
      filteredReps.reduce((sum, rep) => {
        const totalMin = rep.recentActivity.reduce((s, d) => s + d.timeProspecting, 0)
        return sum + totalMin / 60
      }, 0) / Math.max(filteredReps.length, 1)

    const totalCalls = filteredReps.reduce((sum, rep) => {
      return sum + rep.recentActivity.reduce((s, d) => s + d.callsDialed, 0)
    }, 0)

    const avgConnectRate =
      filteredReps.reduce((sum, rep) => {
        const rates = rep.recentActivity.filter((d) => d.connectRate > 0)
        if (rates.length === 0) return sum
        return sum + rates.reduce((s, d) => s + d.connectRate, 0) / rates.length
      }, 0) / Math.max(filteredReps.length, 1)

    return {
      totalMeetings,
      avgProspectingHours: avgProspectingHours.toFixed(1),
      totalCalls,
      avgConnectRate: avgConnectRate.toFixed(0),
    }
  }, [filteredReps])

  // Activity comparison data for bar chart
  const activityComparisonData = useMemo(() => {
    return filteredReps.map((rep) => {
      const totalProspecting = rep.recentActivity.reduce((s, d) => s + d.timeProspecting, 0)
      const totalCalls = rep.recentActivity.reduce((s, d) => s + d.callsDialed, 0)
      const totalMeetings = rep.recentActivity.reduce((s, d) => s + d.meetingsBooked, 0)

      return {
        name: rep.name.split(" ")[0],
        fullName: rep.name,
        prospecting: Math.round(totalProspecting / 60),
        calls: totalCalls,
        meetings: totalMeetings,
        trend: rep.trend,
        similarity: rep.scores.topRepSimilarity,
      }
    }).sort((a, b) => b.prospecting - a.prospecting)
  }, [filteredReps])

  // Daily activity pattern data (heatmap style)
  const dailyPatterns = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"]
    return filteredReps.slice(0, 6).map((rep) => {
      const dayData = rep.recentActivity.slice(0, 5).map((d, i) => ({
        day: days[i] || `Day ${i + 1}`,
        value: d.timeProspecting,
        calls: d.callsDialed,
        meetings: d.meetingsBooked,
      }))
      return {
        name: rep.name.split(" ")[0],
        fullName: rep.name,
        data: dayData,
        trend: rep.trend,
      }
    })
  }, [filteredReps])

  // Activity drop alerts
  const activityAlerts = useMemo(() => {
    return coachingInsights
      .filter((ci) => ci.severity === "critical" || ci.severity === "high")
      .slice(0, 5)
  }, [coachingInsights])

  const getBarColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "hsl(var(--success))"
      case "drifting":
        return "hsl(var(--warning))"
      case "at-risk":
        return "hsl(var(--destructive))"
      default:
        return "hsl(var(--primary))"
    }
  }

  const getHeatmapColor = (value: number) => {
    // Normalize to 0-1 range (assume max ~200 min/day prospecting)
    const normalized = Math.min(value / 180, 1)
    if (normalized >= 0.7) return "bg-emerald-500"
    if (normalized >= 0.5) return "bg-emerald-400"
    if (normalized >= 0.3) return "bg-amber-400"
    if (normalized >= 0.1) return "bg-amber-300"
    return "bg-stone-200"
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Team Overview
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Performance metrics and activity intelligence for your team
            </p>
          </div>

          {/* Team Filter */}
          {teams.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedTeam(null)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                  !selectedTeam
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                All Teams
              </button>
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team.id)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-full transition-colors",
                    selectedTeam === team.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {team.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Attainment Scorecards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <AttainmentCard
            icon={Calendar}
            label="Meetings Booked"
            value={attainmentMetrics.totalMeetings}
            subLabel="This week"
            trend={attainmentMetrics.totalMeetings > 15 ? "up" : "neutral"}
          />
          <AttainmentCard
            icon={Clock}
            label="Avg Prospecting"
            value={`${attainmentMetrics.avgProspectingHours}h`}
            subLabel="Per rep / week"
            trend={Number(attainmentMetrics.avgProspectingHours) > 10 ? "up" : "down"}
          />
          <AttainmentCard
            icon={Phone}
            label="Total Calls"
            value={attainmentMetrics.totalCalls}
            subLabel="This week"
            trend="neutral"
          />
          <AttainmentCard
            icon={Target}
            label="Avg Connect Rate"
            value={`${attainmentMetrics.avgConnectRate}%`}
            subLabel="Team average"
            trend={Number(attainmentMetrics.avgConnectRate) > 30 ? "up" : "down"}
          />
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Activity Comparison Chart */}
          <div className="col-span-2 bg-card border border-border rounded-xl">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">
                Activity Comparison
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Weekly prospecting hours by rep (color = trend)
              </p>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={activityComparisonData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    opacity={0.4}
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, "auto"]}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    width={70}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const data = payload[0].payload
                      return (
                        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg text-xs">
                          <p className="font-semibold text-foreground mb-2">
                            {data.fullName}
                          </p>
                          <div className="space-y-1 text-muted-foreground">
                            <p>
                              Prospecting:{" "}
                              <span className="font-mono text-foreground">
                                {data.prospecting}h
                              </span>
                            </p>
                            <p>
                              Calls:{" "}
                              <span className="font-mono text-foreground">
                                {data.calls}
                              </span>
                            </p>
                            <p>
                              Meetings:{" "}
                              <span className="font-mono text-foreground">
                                {data.meetings}
                              </span>
                            </p>
                            <p>
                              Similarity:{" "}
                              <span className="font-mono text-foreground">
                                {data.similarity}
                              </span>
                            </p>
                          </div>
                        </div>
                      )
                    }}
                    cursor={{ fill: "hsl(var(--accent))", opacity: 0.1 }}
                  />
                  <Bar dataKey="prospecting" radius={[0, 4, 4, 0]} barSize={20}>
                    {activityComparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.trend)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center gap-4 text-[10px]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-success" />
                <span className="text-muted-foreground">Improving</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
                <span className="text-muted-foreground">Stable</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-warning" />
                <span className="text-muted-foreground">Drifting</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-destructive" />
                <span className="text-muted-foreground">At-Risk</span>
              </div>
            </div>
          </div>

          {/* Activity Drop Alerts */}
          <div className="bg-card border border-border rounded-xl">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Activity Alerts
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reps needing attention
                </p>
              </div>
              <Link
                href="/coaching"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                View all
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {activityAlerts.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                  No urgent alerts
                </div>
              ) : (
                activityAlerts.map((alert) => (
                  <Link
                    key={alert.id}
                    href={`/reps/${alert.repId}`}
                    className="block px-5 py-3.5 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                          alert.severity === "critical"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-warning/10 text-warning"
                        )}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {alert.repName}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {alert.reason}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Daily Activity Heatmap */}
        <div className="bg-card border border-border rounded-xl mb-8">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              Daily Activity Patterns
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Prospecting intensity by day (darker = more focused time)
            </p>
          </div>
          <div className="p-5">
            <div className="space-y-2">
              {/* Header row */}
              <div className="flex items-center gap-2">
                <div className="w-20 text-[10px] font-medium text-muted-foreground" />
                {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
                  <div
                    key={day}
                    className="flex-1 text-center text-[10px] font-medium text-muted-foreground"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Rep rows */}
              {dailyPatterns.map((rep) => (
                <div key={rep.fullName} className="flex items-center gap-2">
                  <div className="w-20 text-xs font-medium text-foreground truncate">
                    {rep.name}
                  </div>
                  {rep.data.map((d, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex-1 h-8 rounded-md flex items-center justify-center text-[10px] font-medium transition-colors",
                        getHeatmapColor(d.value),
                        d.value >= 100 ? "text-white" : "text-foreground/70"
                      )}
                      title={`${d.value} min prospecting, ${d.calls} calls, ${d.meetings} meetings`}
                    >
                      {Math.round(d.value / 60)}h
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
              <span className="text-[10px] text-muted-foreground">Intensity:</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-stone-200" />
                <span className="text-[10px] text-muted-foreground">Low</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-amber-300" />
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-amber-400" />
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-emerald-400" />
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded bg-emerald-500" />
                <span className="text-[10px] text-muted-foreground">High</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pattern Shifts Feed */}
        <div className="bg-card border border-border rounded-xl">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              Recent Pattern Shifts
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Notable changes in rep behavior this week
            </p>
          </div>
          <div className="divide-y divide-border">
            {patternShifts.slice(0, 5).map((shift) => (
              <div key={shift.id} className="px-5 py-4 flex items-start gap-4">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    shift.direction === "up"
                      ? "bg-success/10 text-success"
                      : "bg-warning/10 text-warning"
                  )}
                >
                  {shift.direction === "up" ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/reps/${shift.repId}`}
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {shift.repName}
                    </Link>
                    <span
                      className={cn(
                        "text-xs font-mono px-1.5 py-0.5 rounded",
                        shift.direction === "up"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      )}
                    >
                      {shift.direction === "up" ? "+" : "-"}
                      {shift.magnitude}%
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {shift.metric.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {shift.notes}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {new Date(shift.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Attainment Card Component
function AttainmentCard({
  icon: Icon,
  label,
  value,
  subLabel,
  trend,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  subLabel: string
  trend: "up" | "down" | "neutral"
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-primary" />
        </div>
        {trend !== "neutral" && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend === "up" ? "text-success" : "text-warning"
            )}
          >
            {trend === "up" ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
          </div>
        )}
      </div>
      <p className="text-2xl font-semibold text-foreground tracking-tight">
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      <p className="text-[10px] text-muted-foreground/70 mt-0.5">{subLabel}</p>
    </div>
  )
}
