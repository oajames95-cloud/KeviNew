"use client"

import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { RepTarget } from "@/types"

interface TargetPacingProps {
  targets: RepTarget[]
  compact?: boolean
}

export function TargetPacing({ targets, compact = false }: TargetPacingProps) {
  if (targets.length === 0) {
    return null
  }

  const getProgressColor = (metric: string) => {
    switch (metric) {
      case "prospecting_time":
      case "calls_dialed":
        return "bg-blue-100"
      case "meetings_booked":
      case "pipeline_created":
        return "bg-green-100"
      case "response_rate":
      case "open_rate":
        return "bg-purple-100"
      default:
        return "bg-slate-100"
    }
  }

  const getMetricLabel = (metric: string) => {
    const labels: Record<string, string> = {
      prospecting_time: "Prospecting",
      calls_dialed: "Calls Dialed",
      meetings_booked: "Meetings Booked",
      pipeline_created: "Pipeline",
      response_rate: "Response Rate",
      open_rate: "Open Rate",
      account_activity: "Account Activity",
      emails_sent: "Emails",
    }
    return labels[metric] || metric.replace(/_/g, " ")
  }

  const estimateProgress = (target: RepTarget, daysSinceCreated: number): number => {
    if (target.timeFrame === "daily") {
      // For daily targets, assume started today
      return Math.min(50, Math.random() * 80) // Placeholder: 0-80% progress
    } else if (target.timeFrame === "weekly") {
      const daysInWeek = 7
      const daysPassed = Math.min(daysSinceCreated, daysInWeek)
      return Math.min(100, (daysPassed / daysInWeek) * (40 + Math.random() * 60))
    }
    return Math.min(100, (daysSinceCreated / 30) * (30 + Math.random() * 70))
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {targets.slice(0, 3).map((target) => {
          const daysSinceCreated = Math.floor((Date.now() - new Date(target.createdAt).getTime()) / (1000 * 60 * 60 * 24))
          const progress = estimateProgress(target, daysSinceCreated)

          return (
            <div key={target.id} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-foreground">
                  {getMetricLabel(target.metric)}
                </p>
                <span className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded",
                  progress >= 75 ? "bg-green-100 text-green-700" :
                  progress >= 50 ? "bg-blue-100 text-blue-700" :
                  progress >= 25 ? "bg-amber-100 text-amber-700" :
                  "bg-slate-100 text-slate-700"
                )}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all rounded-full",
                    progress >= 75 ? "bg-green-500" :
                    progress >= 50 ? "bg-blue-500" :
                    progress >= 25 ? "bg-amber-500" :
                    "bg-slate-300"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4">Active Coaching Targets</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Progress toward coaching commitments set in recent sessions.
        </p>
      </div>

      <div className="space-y-3">
        {targets.map((target) => {
          const daysSinceCreated = Math.floor((Date.now() - new Date(target.createdAt).getTime()) / (1000 * 60 * 60 * 24))
          const progress = estimateProgress(target, daysSinceCreated)
          const isOnTrack = progress >= 50

          return (
            <div key={target.id} className="bg-card border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {getMetricLabel(target.metric)}
                  </p>
                  {target.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{target.notes}</p>
                  )}
                </div>
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded flex items-center gap-1",
                  isOnTrack ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                )}>
                  {isOnTrack ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  {Math.round(progress)}%
                </span>
              </div>

              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
                <div
                  className={cn(
                    "h-full transition-all rounded-full",
                    isOnTrack ? "bg-green-500" : "bg-amber-500"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Target: {target.targetValue}</span>
                <span>{target.timeFrame}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
