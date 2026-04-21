"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface QualityMetricsProps {
  responseRate: number // percentage 0-100
  openRate: number // percentage 0-100
  weeklyTrend?: {
    responseRate: number // trend percentage
    openRate: number // trend percentage
  }
}

export function QualityMetrics({ responseRate, openRate, weeklyTrend }: QualityMetricsProps) {
  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-3.5 h-3.5 text-green-600" />
    if (value < 0) return <TrendingDown className="w-3.5 h-3.5 text-red-600" />
    return null
  }

  const getTrendColor = (value: number) => {
    if (value > 0) return "text-green-600"
    if (value < 0) return "text-red-600"
    return "text-muted-foreground"
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4">Outreach Quality</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Response and open rates indicate message resonance, targeting accuracy, and outreach quality.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Response Rate */}
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-medium text-foreground">Response Rate</p>
            {weeklyTrend && getTrendIcon(weeklyTrend.responseRate)}
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">{Math.round(responseRate)}%</p>
          {weeklyTrend && (
            <p className={cn("text-xs", getTrendColor(weeklyTrend.responseRate))}>
              {weeklyTrend.responseRate > 0 ? "+" : ""}{Math.round(weeklyTrend.responseRate)}% vs last week
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            Percentage of sent emails that received a reply
          </p>
        </div>

        {/* Open Rate */}
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-medium text-foreground">Open Rate</p>
            {weeklyTrend && getTrendIcon(weeklyTrend.openRate)}
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">{Math.round(openRate)}%</p>
          {weeklyTrend && (
            <p className={cn("text-xs", getTrendColor(weeklyTrend.openRate))}>
              {weeklyTrend.openRate > 0 ? "+" : ""}{Math.round(weeklyTrend.openRate)}% vs last week
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            Percentage of sent emails that were opened
          </p>
        </div>
      </div>

      {/* Interpretation guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
        <p className="text-sm font-medium text-blue-900">What this tells you:</p>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• High open rate + low response = targeting/messaging issue</li>
          <li>• Low open rate = deliverability or subject line problem</li>
          <li>• Both declining = possible list quality or fatigue</li>
          <li>• Upward trends = improving targeting and outreach quality</li>
        </ul>
      </div>
    </div>
  )
}
