"use client"

import type { Rep, CoachingInsight } from "@/types"
import type { RepVsTeamComparison, PerformancePattern } from "@/lib/performance-patterns"
import { generateSessionContext } from "@/lib/performance-patterns"
import { AlertCircle, TrendingUp, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

interface WhyThisMattersProps {
  rep: Rep
  insight?: CoachingInsight
  comparisons?: RepVsTeamComparison[]
  relatedPatterns?: PerformancePattern[]
}

export function WhyThisMatters({
  rep,
  insight,
  comparisons = [],
  relatedPatterns = [],
}: WhyThisMattersProps) {
  const context = insight
    ? generateSessionContext(rep, insight.theme, comparisons)
    : `${rep.name} is trending ${rep.trend}. This coaching session will strengthen key performance areas.`

  const relevantComparison = comparisons.find(c =>
    insight ? c.metric.toLowerCase().includes(insight.theme.toLowerCase()) : false
  )

  const relatedPattern = relatedPatterns[0]

  return (
    <div className="space-y-4">
      {/* Main context card */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-foreground mb-1">Why This Session Matters</h4>
            <p className="text-sm text-foreground/75 leading-relaxed">{context}</p>
          </div>
        </div>
      </div>

      {/* Rep vs team context */}
      {relevantComparison && (
        <div className={cn(
          "rounded-lg border p-4",
          relevantComparison.variance === "leading" ? "bg-emerald-50 border-emerald-200" :
          relevantComparison.variance === "lagging" ? "bg-red-50 border-red-200" :
          "bg-slate-50 border-slate-200"
        )}>
          <div className="flex items-start gap-2.5">
            <TrendingUp className="w-4 h-4 text-foreground/60 mt-0.5 shrink-0" />
            <div>
              <h5 className="text-sm font-medium text-foreground mb-1">Performance Context</h5>
              <p className="text-xs text-foreground/75">
                {relevantComparison.repName} is at <span className="font-bold">{relevantComparison.repValue}%</span> on {relevantComparison.metric}
                {relevantComparison.variance === "lagging" && ` — below team average of ${Math.round(relevantComparison.teamAverage)}%`}
                {relevantComparison.variance === "leading" && ` — leading the team`}
                {relevantComparison.variance === "average" && ` — in line with team average of ${Math.round(relevantComparison.teamAverage)}%`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Related top performer pattern */}
      {relatedPattern && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h5 className="text-sm font-medium text-foreground mb-1">Top Performer Insight</h5>
              <p className="text-xs text-foreground/75 mb-2">{relatedPattern.plainEnglishInsight}</p>
              {relatedPattern.actionableCoachingFocus && (
                <p className="text-xs font-medium text-amber-700">
                  → Focus: {relatedPattern.actionableCoachingFocus}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
