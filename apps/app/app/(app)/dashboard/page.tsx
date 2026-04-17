import { AppHeader } from "@/components/shell/app-header"
import { useMobileSidebar } from "@/components/shell/app-shell"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { createClient } from "@/lib/supabase/server"
import { mockTeamSummary, mockCoachingInsights, mockReps } from "@/lib/mock-data"
import { DashboardClient } from "./dashboard-client"
import type { Rep, TeamSummary, CoachingInsight } from "@/types"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  let reps: Rep[] = mockReps
  let teamSummary: TeamSummary = mockTeamSummary
  let coachingInsights: CoachingInsight[] = mockCoachingInsights

  try {
    const supabase = await createClient()

    // Fetch reps with all score columns
    const { data: fetchedReps, error: repsError } = await supabase
      .from("reps")
      .select(
        `
        id,
        organization_id,
        team_id,
        name,
        email,
        role,
        hire_date,
        trend,
        score_top_rep_similarity,
        score_workflow_drift,
        score_prospecting_focus_time,
        score_follow_up_discipline,
        score_outbound_velocity,
        score_signal_confidence,
        rep_daily_metrics(
          date,
          calls_dialed,
          meetings_booked,
          time_prospecting,
          time_researching,
          time_in_apollo,
          time_in_crm,
          time_in_email,
          context_switches,
          focus_blocks_min
        )
      `
      )
      .order("id")

    if (repsError) {
      console.error("[v0] Error fetching reps:", repsError)
    }

    // Fetch teams
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id, name")

    if (teamsError) {
      console.error("[v0] Error fetching teams:", teamsError)
    }

    // Fetch coaching items
    const { data: coachingItems, error: coachingError } = await supabase
      .from("coaching_items")
      .select(
        `
        id,
        organization_id,
        rep_id,
        manager_id,
        severity,
        status,
        theme,
        reason,
        recommended_action,
        flagged_at,
        updated_at
      `
      )
      .order("severity", { ascending: false })

    if (coachingError) {
      console.error("[v0] Error fetching coaching items:", coachingError)
    }

    // Transform data if successful
    if (fetchedReps && fetchedReps.length > 0 && teams && coachingItems) {
      const teamMap = new Map(teams.map((t: any) => [t.id, t]))

      // Transform reps
      reps = fetchedReps.map((rep: any) => ({
        id: rep.id,
        name: rep.name || "Unknown",
        email: rep.email || "",
        avatar: "",
        title: rep.role || "SDR",
        tenureDays: rep.hire_date
          ? Math.floor(
              (Date.now() - new Date(rep.hire_date).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0,
        trend: rep.trend,
        scores: {
          topRepSimilarity: rep.score_top_rep_similarity || 0,
          workflowDrift: rep.score_workflow_drift || 0,
          followUpDiscipline: rep.score_follow_up_discipline || 0,
          prospectingFocusTime: rep.score_prospecting_focus_time || 0,
          outboundVelocity: rep.score_outbound_velocity || 0,
          signalConfidence: rep.score_signal_confidence || 0,
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
        })),
      }))

      // Calculate team summary from real data
      const driftingReps = reps.filter((r) => r.trend === "drifting").length
      const improvingReps = reps.filter((r) => r.trend === "improving").length

      // Calculate top cohort (top 25% by topRepSimilarity)
      const sortedByScore = [...reps].sort(
        (a, b) => b.scores.topRepSimilarity - a.scores.topRepSimilarity
      )
      const topCohortSize = Math.ceil(sortedByScore.length * 0.25)
      const topCohort = sortedByScore.slice(0, topCohortSize)

      // Calculate team median and top cohort benchmarks
      const calculateMedian = (scores: number[]): number => {
        const sorted = [...scores].sort((a, b) => a - b)
        const mid = Math.floor(sorted.length / 2)
        return sorted.length % 2
          ? sorted[mid]
          : (sorted[mid - 1] + sorted[mid]) / 2
      }

      const calcAvg = (scores: number[]): number =>
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0

      teamSummary = {
        totalReps: reps.length,
        repsDrifting: driftingReps,
        repsImproving: improvingReps,
        coachingOpportunitiesThisWeek: coachingItems.filter(
          (i: any) => i.status !== "coached"
        ).length,
        avgSignalConfidence: calcAvg(reps.map((r) => r.scores.signalConfidence)),
        patternShifts: mockTeamSummary.patternShifts,
        repsNeedingAttention: reps.filter(
          (r) => r.trend === "drifting" || r.trend === "at-risk"
        ),
        topCohortBenchmark: {
          topRepSimilarity: calcAvg(topCohort.map((r) => r.scores.topRepSimilarity)),
          workflowDrift: calcAvg(topCohort.map((r) => r.scores.workflowDrift)),
          prospectingFocusTime: calcAvg(
            topCohort.map((r) => r.scores.prospectingFocusTime)
          ),
          followUpDiscipline: calcAvg(topCohort.map((r) => r.scores.followUpDiscipline)),
          outboundVelocity: calcAvg(topCohort.map((r) => r.scores.outboundVelocity)),
          signalConfidence: calcAvg(topCohort.map((r) => r.scores.signalConfidence)),
        },
        teamMedian: {
          topRepSimilarity: Math.round(
            calculateMedian(reps.map((r) => r.scores.topRepSimilarity))
          ),
          workflowDrift: Math.round(
            calculateMedian(reps.map((r) => r.scores.workflowDrift))
          ),
          prospectingFocusTime: Math.round(
            calculateMedian(reps.map((r) => r.scores.prospectingFocusTime))
          ),
          followUpDiscipline: Math.round(
            calculateMedian(reps.map((r) => r.scores.followUpDiscipline))
          ),
          outboundVelocity: Math.round(
            calculateMedian(reps.map((r) => r.scores.outboundVelocity))
          ),
          signalConfidence: Math.round(
            calculateMedian(reps.map((r) => r.scores.signalConfidence))
          ),
        },
      }

      // Transform coaching insights
      const repMap = new Map(reps.map((r) => [r.id, r]))
      coachingInsights = coachingItems
        .slice(0, 5)
        .map((item: any) => {
          const rep = repMap.get(item.rep_id)
          return {
            id: item.id,
            tenantId: item.organization_id,
            repId: item.rep_id,
            repName: rep?.name || "Unknown Rep",
            teamId: rep?.id,
            teamName: "Team",
            managerId: item.manager_id,
            severity: item.severity,
            status: item.status,
            theme: item.theme,
            reason: item.reason,
            recommendedAction: item.recommended_action,
            flaggedAt: item.flagged_at,
            updatedAt: item.updated_at,
            metrics: {},
            notes: [],
          }
        })
    }
  } catch (error) {
    console.error("[v0] Error fetching dashboard data:", error)
    // Fall back to mock data on error
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AppHeader
        title="Team Dashboard"
        subtitle="West Enterprise"
      >
        <DateRangePicker value="7d" onChange={() => {}} />
      </AppHeader>
      <DashboardClient
        reps={reps}
        teamSummary={teamSummary}
        coachingInsights={coachingInsights}
      />
    </div>
  )
}
