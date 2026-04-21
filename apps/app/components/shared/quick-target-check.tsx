"use client"

import { AlertCircle, TrendingUp, Target } from "lucide-react"
import { cn } from "@/lib/utils"
import type { RepTarget } from "@/types"

interface QuickTargetCheckProps {
  targets: RepTarget[]
  repName: string
  maxShow?: number
}

export function QuickTargetCheck({ targets, repName, maxShow = 2 }: QuickTargetCheckProps) {
  if (targets.length === 0) return null

  const getMetricEmoji = (metric: string): string => {
    switch (metric) {
      case "prospecting_time":
        return "⏱️"
      case "meetings_booked":
        return "📅"
      case "calls_dialed":
        return "☎️"
      case "emails_sent":
        return "📧"
      case "pipeline_created":
        return "💰"
      case "response_rate":
        return "💬"
      case "open_rate":
        return "👁️"
      default:
        return "🎯"
    }
  }

  const displayed = targets.slice(0, maxShow)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Target className="w-4 h-4 text-blue-600" />
        <p className="text-sm font-medium text-foreground">{repName}&apos;s Targets</p>
      </div>
      <div className="space-y-1.5">
        {displayed.map((target) => (
          <div
            key={target.id}
            className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded-lg"
          >
            <span className="text-sm">{getMetricEmoji(target.metric)}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {target.metric.replace(/_/g, " ")}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Target: {target.targetValue}
              </p>
            </div>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 whitespace-nowrap">
              {target.timeFrame}
            </span>
          </div>
        ))}
        {targets.length > maxShow && (
          <p className="text-xs text-muted-foreground text-center pt-1">
            +{targets.length - maxShow} more targets
          </p>
        )}
      </div>
    </div>
  )
}
