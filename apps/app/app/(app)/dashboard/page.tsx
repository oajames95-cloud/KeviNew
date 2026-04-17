import { AppHeader } from "@/components/shell/app-header"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { createClient } from "@/lib/supabase/server"
import { mockTeamSummary, mockCoachingInsights, mockReps } from "@/lib/mock-data"
import { DashboardClient } from "./dashboard-client"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  try {
    const supabase = await createClient()

    const { data: repsData, error: repsError } = await supabase
      .from("reps")
      .select("id, organization_id, team_id, full_name, email, role, hire_date, trend, top_rep_similarity, workflow_drift, prospecting_focus_time, follow_up_discipline, outbound_velocity, signal_confidence")
      .order("full_name")

    const { data: teamsData, error: teamsError } = await supabase
      .from("teams")
      .select("id, name")

    const { data: coachingData, error: coachingError } = await supabase
      .from("coaching_items")
      .select("id, organization_id, rep_id, team_id, title, reason, coaching_theme, severity, status, suggested_action, opened_at, updated_at")
      .order("opened_at", { ascending: false })

    if (repsError || teamsError || coachingError || !repsData?.length) {
      console.log("[Dashboard] Falling back to mock data:", { repsError, teamsError, coachingError })
      return <FallbackDashboard />
    }

    const reps = repsData.map((r: any) => ({
      id: r.id,
      tenantId: r.organization_id,
      teamId: r.team_id,
      managerId: "",
      name: r.full_name,
      email: r.email || "",
      role: r.role,
      hireDate: r.hire_date || "",
      trend: r.trend,
      scores: {
        topRepSimilarity: r.top_rep_similarity ?? 0,
        workflowDrift: r.workflow_drift ?? 0,
        prospectingFocusTime: r.prospecting_focus_time ?? 0,
        followUpDiscipline: r.follow_up_discipline ?? 0,
        outboundVelocity: r.outbound_velocity ?? 0,
        signalConfidence: r.signal_confidence ?? 0,
      },
      recentActivity: [],
      dataSourceIds: [],
    }))

    const calcAvg = (nums: number[]) => nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0
    const calcMedian = (nums: number[]) => {
      const sorted = [...nums].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    }

    const sortedByScore = [...reps].sort((a: any, b: any) => b.scores.topRepSimilarity - a.scores.topRepSimilarity)
    const topCohort = sortedByScore.slice(0, Math.ceil(sortedByScore.length * 0.25))

    const teamSummary = {
      totalReps: reps.length,
      repsDrifting: reps.filter((r: any) => r.trend === "drifting").length,
      repsImproving: reps.filter((r: any) => r.trend === "improving").length,
      coachingOpportunitiesThisWeek: coachingData?.filter((i: any) => i.status !== "coached").length || 0,
      avgSignalConfidence: calcAvg(reps.map((r: any) => r.scores.signalConfidence)),
      patternShifts: mockTeamSummary.patternShifts,
      repsNeedingAttention: reps.filter((r: any) => r.trend === "drifting" || r.trend === "at-risk"),
      topCohortBenchmark: {
        topRepSimilarity: calcAvg(topCohort.map((r: any) => r.scores.topRepSimilarity)),
        workflowDrift: calcAvg(topCohort.map((r: any) => r.scores.workflowDrift)),
        prospectingFocusTime: calcAvg(topCohort.map((r: any) => r.scores.prospectingFocusTime)),
        followUpDiscipline: calcAvg(topCohort.map((r: any) => r.scores.followUpDiscipline)),
        outboundVelocity: calcAvg(topCohort.map((r: any) => r.scores.outboundVelocity)),
        signalConfidence: calcAvg(topCohort.map((r: any) => r.scores.signalConfidence)),
      },
      teamMedian: {
        topRepSimilarity: calcMedian(reps.map((r: any) => r.scores.topRepSimilarity)),
        workflowDrift: calcMedian(reps.map((r: any) => r.scores.workflowDrift)),
        prospectingFocusTime: calcMedian(reps.map((r: any) => r.scores.prospectingFocusTime)),
        followUpDiscipline: calcMedian(reps.map((r: any) => r.scores.followUpDiscipline)),
        outboundVelocity: calcMedian(reps.map((r: any) => r.scores.outboundVelocity)),
        signalConfidence: calcMedian(reps.map((r: any) => r.scores.signalConfidence)),
      },
    }

    const coachingInsights = coachingData.map((c: any) => ({
      id: c.id,
      tenantId: c.organization_id,
      repId: c.rep_id,
      repName: reps.find((r: any) => r.id === c.rep_id)?.name || "",
      teamId: c.team_id || "",
      teamName: teamsData?.find((t: any) => t.id === c.team_id)?.name || "",
      managerId: "",
      severity: c.severity,
      status: c.status,
      theme: c.coaching_theme || "",
      reason: c.reason || "",
      recommendedAction: c.suggested_action || "",
      flaggedAt: c.opened_at,
      updatedAt: c.updated_at,
      metrics: {},
      notes: [],
    }))

    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardClient reps={reps} teamSummary={teamSummary} coachingInsights={coachingInsights} />
      </div>
    )
  } catch (error) {
    console.error("[Dashboard] Error:", error)
    return <FallbackDashboard />
  }
}

function FallbackDashboard() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <DashboardClient reps={mockReps} teamSummary={mockTeamSummary} coachingInsights={mockCoachingInsights} />
    </div>
  )
}
