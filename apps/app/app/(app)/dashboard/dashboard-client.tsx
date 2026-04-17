"use client"

import { useState } from "react"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { PatternHealth } from "@/components/dashboard/pattern-health"
import { AttentionTable } from "@/components/dashboard/attention-table"
import { PatternShiftsFeed } from "@/components/dashboard/pattern-shifts-feed"
import { CoachingQueuePanel } from "@/components/dashboard/coaching-queue-panel"
import { CohortComparison } from "@/components/dashboard/cohort-comparison"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { TeamOutcomes } from "@/components/dashboard/team-outcomes"
import { TopPerformerBaseline } from "@/components/shared/top-performer-baseline"
import type { Rep, TeamSummary, CoachingInsight } from "@/types"

interface DashboardClientProps {
  reps: Rep[]
  teamSummary: TeamSummary
  coachingInsights: CoachingInsight[]
}

export function DashboardClient({
  reps,
  teamSummary,
  coachingInsights,
}: DashboardClientProps) {
  const [dateRange, setDateRange] = useState("7d")

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="p-4 lg:p-6 space-y-5 max-w-[1600px]">
        {/* Summary KPI strip */}
        <SummaryCards summary={teamSummary} />

        {/* Top Performer Baseline - Central Definition */}
        <TopPerformerBaseline benchmark={teamSummary.topCohortBenchmark} />

        {/* Team Outcomes - How workflow correlates to results */}
        <TeamOutcomes reps={reps} />

        {/* Main content grid: left column data-heavy, right column actions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Left column: primary data views - spans 2 columns */}
          <div className="xl:col-span-2 space-y-5">
            {/* Pattern health + cohort comparison side by side on larger screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <PatternHealth
                topCohort={teamSummary.topCohortBenchmark}
                teamMedian={teamSummary.teamMedian}
              />
              <CohortComparison
                topCohort={teamSummary.topCohortBenchmark}
                teamMedian={teamSummary.teamMedian}
              />
            </div>

            {/* Reps needing attention table */}
            <AttentionTable reps={teamSummary.repsNeedingAttention} />
          </div>

          {/* Right column: feeds and actions */}
          <div className="space-y-5">
            <CoachingQueuePanel insights={coachingInsights} />
            <PatternShiftsFeed shifts={teamSummary.patternShifts} />
            <QuickActions />
          </div>
        </div>
      </div>
    </main>
  )
}
