"use client"

import { useState, useEffect } from "react"
import { AppHeader } from "@/components/shell/app-header"
import { useMobileSidebar } from "@/components/shell/app-shell"
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
import { mockTeamSummary, mockCoachingInsights, mockReps } from "@/lib/mock-data"
import { getTeamReps } from "@/lib/supabase-queries-client"

export default function DashboardPage() {
  const { toggle } = useMobileSidebar()
  const [dateRange, setDateRange] = useState("7d")
  const [reps, setReps] = useState(mockReps)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        // Fetch team reps from Supabase - use seed data team UUID
        const teamId = "b0000000-0000-0000-0000-000000000001"
        const teamReps = await getTeamReps(teamId)

        if (teamReps && teamReps.length > 0) {
          // Transform Supabase data to match the app's data structure
          const transformedReps = teamReps.map((rep: any) => ({
            id: rep.id,
            name: rep.name || "Unknown",
            email: rep.email || "",
            avatar: rep.avatar_url || "",
            title: rep.role || "SDR",
            tenureDays: rep.hire_date ? Math.floor((Date.now() - new Date(rep.hire_date).getTime()) / (1000 * 60 * 60 * 24)) : 0,
            scores: {
              topRepSimilarity: rep.score_top_rep_similarity || 0,
              workflowDrift: 0,
              followUpDiscipline: rep.score_follow_up_discipline || 0,
              prospectingFocusTime: rep.score_prospecting_focus_time || 0,
              prepQuality: rep.score_prep_quality || 0,
              signalConfidence: 0,
            },
            recentActivity: (rep.rep_daily_metrics || []).map((metric: any) => ({
              date: metric.date,
              callsDialed: metric.calls_dialed || 0,
              meetingsBooked: metric.meetings_booked || 0,
              timeProspecting: metric.time_prospecting || 0,
              timeResearching: metric.time_researching || 0,
              timeInApollo: metric.time_in_apollo || 0,
              timeInCRM: metric.time_in_crm || 0,
              timeInEmail: metric.time_in_email || 0,
              contextSwitches: metric.context_switches || 0,
              focusBlocksMin: metric.focus_blocks_min || 0,
            })) || [],
          }))
          setReps(transformedReps)
        }
      } catch (error) {
        console.error("[v0] Error fetching dashboard data:", error)
        // Fall back to mock data on error
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AppHeader
        title="Team Dashboard"
        subtitle="West Enterprise"
        onMenuClick={toggle}
      >
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </AppHeader>

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6 space-y-5 max-w-[1600px]">
          {/* Summary KPI strip */}
          <SummaryCards summary={mockTeamSummary} />

          {/* Top Performer Baseline - Central Definition */}
          <TopPerformerBaseline benchmark={mockTeamSummary.topCohortBenchmark} />

          {/* Team Outcomes - How workflow correlates to results */}
          <TeamOutcomes reps={reps} />

          {/* Main content grid: left column data-heavy, right column actions */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Left column: primary data views - spans 2 columns */}
            <div className="xl:col-span-2 space-y-5">
              {/* Pattern health + cohort comparison side by side on larger screens */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <PatternHealth
                  topCohort={mockTeamSummary.topCohortBenchmark}
                  teamMedian={mockTeamSummary.teamMedian}
                />
                <CohortComparison
                  topCohort={mockTeamSummary.topCohortBenchmark}
                  teamMedian={mockTeamSummary.teamMedian}
                />
              </div>

              {/* Reps needing attention table */}
              <AttentionTable reps={mockTeamSummary.repsNeedingAttention} />
            </div>

            {/* Right column: feeds and actions */}
            <div className="space-y-5">
              <CoachingQueuePanel insights={mockCoachingInsights} />
              <PatternShiftsFeed shifts={mockTeamSummary.patternShifts} />
              <QuickActions />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
