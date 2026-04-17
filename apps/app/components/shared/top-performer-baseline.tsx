"use client"

import { Award, TrendingUp, Target } from "lucide-react"
import type { TopCohortBenchmark } from "@/types"

interface TopPerformerBaselineProps {
  benchmark: TopCohortBenchmark
}

export function TopPerformerBaseline({ benchmark }: TopPerformerBaselineProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">How Kevi Defines Top Performers</h2>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Based on 8–12 highest-meeting-booked reps in your org
        </p>
      </div>
      <div className="p-5 space-y-5">
        {/* Workflow Habits */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Target className="w-3.5 h-3.5" />
            Workflow Habits
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-[10px]">
            <div>
              <p className="text-muted-foreground">Prospecting/day</p>
              <p className="font-mono font-semibold text-foreground mt-0.5">~{benchmark.prospectingFocusTime}m</p>
            </div>
            <div>
              <p className="text-muted-foreground">Research/day</p>
              <p className="font-mono font-semibold text-foreground mt-0.5">~28m</p>
            </div>
            <div>
              <p className="text-muted-foreground">Follow-ups/day</p>
              <p className="font-mono font-semibold text-foreground mt-0.5">High discipline</p>
            </div>
            <div>
              <p className="text-muted-foreground">Context switches</p>
              <p className="font-mono font-semibold text-success mt-0.5">{'<20x/day'}</p>
            </div>
          </div>
        </div>

        {/* Weekly Outcomes */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" />
            Weekly Outcomes
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-[10px]">
            <div>
              <p className="text-muted-foreground">Meetings/week</p>
              <p className="font-mono font-semibold text-foreground mt-0.5">12–18</p>
            </div>
            <div>
              <p className="text-muted-foreground">Pipeline/week</p>
              <p className="font-mono font-semibold text-foreground mt-0.5">$220–350K</p>
            </div>
            <div>
              <p className="text-muted-foreground">Conversion</p>
              <p className="font-mono font-semibold text-success mt-0.5">8–12%</p>
            </div>
          </div>
        </div>

        {/* Key Behaviors */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Key Behaviors
          </p>
          <ul className="space-y-1.5 text-[10px] text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
              <span>Consistent daily workflow rhythm — same start time, same sequence</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
              <span>Pre-call research before reaching out — higher connect quality</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
              <span>Protected focus blocks (9–11am is sacred prospecting time)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
              <span>EOD follow-up discipline — no threads go cold overnight</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
