"use client"

import type { RepVsTeamComparison } from "@/lib/performance-patterns"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface RepComparisonProps {
  comparisons: RepVsTeamComparison[]
  compact?: boolean
}

function getVarianceColor(variance: string) {
  switch (variance) {
    case "leading":
      return "bg-emerald-50 border-emerald-200"
    case "above-average":
      return "bg-blue-50 border-blue-200"
    case "average":
      return "bg-slate-50 border-slate-200"
    case "below-average":
      return "bg-amber-50 border-amber-200"
    case "lagging":
      return "bg-red-50 border-red-200"
  }
}

function getVarianceBadge(variance: string) {
  switch (variance) {
    case "leading":
      return { icon: ArrowUp, color: "text-emerald-700", bg: "bg-emerald-100" }
    case "above-average":
      return { icon: ArrowUp, color: "text-blue-700", bg: "bg-blue-100" }
    case "average":
      return { icon: Minus, color: "text-slate-600", bg: "bg-slate-100" }
    case "below-average":
      return { icon: ArrowDown, color: "text-amber-700", bg: "bg-amber-100" }
    case "lagging":
      return { icon: ArrowDown, color: "text-red-700", bg: "bg-red-100" }
  }
}

export function RepComparison({ comparisons, compact = false }: RepComparisonProps) {
  if (comparisons.length === 0) {
    return null
  }

  if (compact) {
    // Compact sidebar view
    return (
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-foreground px-3">Compared with Team</h4>
        {comparisons.map((comp) => {
          const badge = getVarianceBadge(comp.variance)
          const Icon = badge.icon
          return (
            <div key={comp.metric} className={cn("rounded p-3 border text-xs", getVarianceColor(comp.variance))}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-foreground text-xs">{comp.metric}</span>
                <span className={cn("inline-flex items-center w-5 h-5 rounded-full", badge.bg)}>
                  <Icon className={cn("w-3 h-3 mx-auto", badge.color)} />
                </span>
              </div>
              <p className="text-xs text-foreground/75">{comp.insight}</p>
            </div>
          )
        })}
      </div>
    )
  }

  // Full view
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="text-base font-semibold text-foreground mb-4">Compared with Team</h3>
      <div className="space-y-4">
        {comparisons.map((comp) => {
          const badge = getVarianceBadge(comp.variance)
          const Icon = badge.icon
          const percentOfTeam = Math.round((comp.repValue / comp.teamAverage) * 100)
          
          return (
            <div
              key={comp.metric}
              className={cn("rounded-lg border p-4", getVarianceColor(comp.variance))}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-foreground">{comp.metric}</h4>
                  <p className="text-sm text-foreground/75 mt-1">{comp.insight}</p>
                </div>
                <span className={cn("inline-flex items-center justify-center w-8 h-8 rounded-full", badge.bg)}>
                  <Icon className={cn("w-4 h-4", badge.color)} />
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-xs mt-3 pt-3 border-t border-current/10">
                <div>
                  <p className="text-foreground/60 mb-1">This Rep</p>
                  <p className="font-bold text-foreground">{comp.repValue}%</p>
                </div>
                <div>
                  <p className="text-foreground/60 mb-1">Team Avg</p>
                  <p className="font-bold text-foreground">{Math.round(comp.teamAverage)}%</p>
                </div>
                <div>
                  <p className="text-foreground/60 mb-1">Top Perf.</p>
                  <p className="font-bold text-foreground">{Math.round(comp.topPerformerValue)}%</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
