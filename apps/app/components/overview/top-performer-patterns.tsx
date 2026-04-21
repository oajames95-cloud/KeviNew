"use client"

import Link from "next/link"
import { TrendingUp, Lightbulb, ChevronRight } from "lucide-react"
import type { PerformancePattern } from "@/lib/performance-patterns"

interface TopPerformerPatternsProps {
  patterns: PerformancePattern[]
}

export function TopPerformerPatterns({ patterns }: TopPerformerPatternsProps) {
  if (patterns.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-sm font-semibold text-foreground mb-2">What Top Performers Do Differently</h3>
        <p className="text-xs text-muted-foreground">Analyzing team patterns...</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-emerald-600" />
        What Top Performers Do Differently
      </h3>
      
      {patterns.slice(0, 4).map((pattern) => (
        <div
          key={pattern.id}
          className="rounded-lg border bg-card p-4 hover:border-primary/30 transition-colors"
        >
          <div className="flex items-start gap-3">
            <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground mb-1">{pattern.title}</h4>
              <p className="text-xs text-foreground/75 leading-relaxed mb-2">
                {pattern.plainEnglishInsight}
              </p>
              {pattern.actionableCoachingFocus && (
                <p className="text-xs font-medium text-primary/80">
                  → {pattern.actionableCoachingFocus}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
