import { createClient } from "@/lib/supabase/server"
import { mockReps, mockTeams, mockCoachingInsights, mockPatternShifts } from "@/lib/mock-data"
import { OverviewClient } from "./overview-client"
import type { Rep, RepTrend } from "@/types"

export const metadata = {
  title: "Overview | Kevi",
  description: "Team performance overview and activity intelligence",
}

export default async function OverviewPage() {
  let reps: Rep[] = mockReps
  let teams = mockTeams
  let coachingInsights = mockCoachingInsights
  let patternShifts = mockPatternShifts

  try {
    const supabase = await createClient()

    // Fetch teams
    const { data: teamsData } = await supabase
      .from("teams")
      .select("id, name, organization_id")
      .order("name")

    if (teamsData && teamsData.length > 0) {
      teams = teamsData.map((t: any) => ({
        id: t.id,
        tenantId: t.organization_id,
        name: t.name,
        managerId: "",
        repCount: 0,
        avgPatternMatch: 0,
        avgDriftScore: 0,
        createdAt: "",
      }))
    }

    // Fetch reps with daily metrics
    const { data: repsData } = await supabase
      .from("reps")
      .select(`
        id,
        organization_id,
        team_id,
        full_name,
        email,
        role,
        hire_date,
        trend,
        top_rep_similarity,
        workflow_drift,
        prospecting_focus_time,
        follow_up_discipline,
        outbound_velocity,
        signal_confidence
      `)
      .order("full_name")

    if (repsData && repsData.length > 0) {
      // Fetch daily metrics for each rep
      const repIds = repsData.map((r: any) => r.id)
      const { data: metricsData } = await supabase
        .from("rep_daily_metrics")
        .select("*")
        .in("rep_id", repIds)
        .order("date", { ascending: false })
        .limit(35) // 7 days * 5 reps max

      const metricsMap = new Map<string, any[]>()
      if (metricsData) {
        metricsData.forEach((m: any) => {
          if (!metricsMap.has(m.rep_id)) {
            metricsMap.set(m.rep_id, [])
          }
          metricsMap.get(m.rep_id)!.push(m)
        })
      }

      reps = repsData.map((r: any) => {
        const dailyMetrics = metricsMap.get(r.id) || []
        return {
          id: r.id,
          tenantId: r.organization_id,
          teamId: r.team_id,
          managerId: "",
          name: r.full_name,
          email: r.email || "",
          role: r.role || "SDR",
          hireDate: r.hire_date || "",
          trend: (r.trend ?? "stable") as RepTrend,
          scores: {
            topRepSimilarity: r.top_rep_similarity ?? 0,
            workflowDrift: r.workflow_drift ?? 0,
            prospectingFocusTime: r.prospecting_focus_time ?? 0,
            followUpDiscipline: r.follow_up_discipline ?? 0,
            outboundVelocity: r.outbound_velocity ?? 0,
            signalConfidence: r.signal_confidence ?? 0,
          },
          recentActivity: dailyMetrics.map((m: any) => ({
            date: m.date,
            meetingsBooked: m.meetings_booked || 0,
            timeProspecting: m.time_prospecting || 0,
            callsDialed: m.calls_dialed || 0,
            connectRate: m.connect_rate || 0,
            followUpRate: m.follow_up_rate || 0,
            timeResearching: m.time_researching || 0,
            timeBuildingLists: 0,
            timeInApollo: m.time_in_apollo || 0,
            timeInLinkedIn: 0,
            timeInCRM: m.time_in_crm || 0,
            timeInSequencer: 0,
            timeInEmail: m.time_in_email || 0,
            timeInCalendar: 0,
            idleTime: 0,
            contextSwitches: m.context_switches || 0,
            focusBlocksMin: m.focus_blocks_min || 0,
            workdayMinutes: 0,
            emailsSent: 0,
          })),
          dataSourceIds: [],
        }
      })
    }

    // Fetch coaching items for activity drops
    const { data: coachingData } = await supabase
      .from("coaching_items")
      .select(`
        id,
        organization_id,
        rep_id,
        severity,
        status,
        theme,
        reason,
        recommended_action,
        flagged_at,
        updated_at
      `)
      .order("flagged_at", { ascending: false })
      .limit(10)

    if (coachingData && coachingData.length > 0) {
      const repMap = new Map(reps.map((r) => [r.id, r]))
      const teamMap = new Map(teams.map((t) => [t.id, t]))

      coachingInsights = coachingData.map((item: any) => {
        const rep = repMap.get(item.rep_id)
        const team = teamMap.get(rep?.teamId)
        return {
          id: item.id,
          tenantId: item.organization_id,
          repId: item.rep_id,
          repName: rep?.name || "Unknown Rep",
          teamId: rep?.teamId,
          teamName: team?.name || "Unknown Team",
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
  } catch {
    // Use mock data on error
  }

  return (
    <OverviewClient
      reps={reps}
      teams={teams}
      coachingInsights={coachingInsights}
      patternShifts={patternShifts}
    />
  )
}
