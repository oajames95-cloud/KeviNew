import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { mockReps } from "@/lib/mock-data"
import { CoachingHub } from "@/components/rep-detail/coaching-hub"
import type { RepTrend, RepTarget, Rep } from "@/types"

export const dynamic = "force-dynamic"

export default async function RepDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let targets: RepTarget[] = []
  let allReps: Rep[] = mockReps

  try {
    const supabase = await createClient()

    // Fetch this rep's data
    const { data: repData, error: repError } = await supabase
      .from("reps")
      .select("id, organization_id, team_id, full_name, email, role, hire_date, trend, top_rep_similarity, workflow_drift, prospecting_focus_time, follow_up_discipline, outbound_velocity, signal_confidence")
      .eq("id", id)
      .single()

    // Fetch all reps for comparison analysis
    const { data: allRepsData } = await supabase
      .from("reps")
      .select("id, organization_id, team_id, full_name, email, role, trend, top_rep_similarity, workflow_drift, prospecting_focus_time, follow_up_discipline, outbound_velocity, signal_confidence")
      .limit(50)

    // Fetch daily metrics and outcomes in parallel
    const [{ data: dailyMetrics }, { data: outcomes }] = await Promise.all([
      supabase
        .from("rep_daily_metrics")
        .select("date, meetings_booked, time_prospecting, calls_dialed, connect_rate, follow_up_rate, time_researching, time_in_apollo, time_in_crm, time_in_email, context_switches, focus_blocks_min")
        .eq("rep_id", id)
        .order("date", { ascending: false }),
      supabase
        .from("rep_outcomes")
        .select("date, calls_dialed, meetings_booked, connect_rate, follow_up_rate")
        .eq("rep_id", id)
        .order("date", { ascending: false }),
    ])

    if (repError || !repData) {
      const mockRep = mockReps.find((r) => r.id === id)
      if (!mockRep) notFound()
      return <CoachingHub rep={mockRep!} targets={targets} allReps={allReps} />
    }

    // Map all reps for comparison
    if (allRepsData && allRepsData.length > 0) {
      allReps = allRepsData.map((r: any) => ({
        id: r.id,
        tenantId: r.organization_id,
        teamId: r.team_id,
        managerId: "",
        name: r.full_name,
        email: r.email || "",
        role: r.role || "SDR",
        hireDate: "",
        trend: (r.trend ?? "stable") as RepTrend,
        scores: {
          topRepSimilarity: r.top_rep_similarity || 0,
          workflowDrift: r.workflow_drift || 0,
          prospectingFocusTime: r.prospecting_focus_time || 0,
          followUpDiscipline: r.follow_up_discipline || 0,
          outboundVelocity: r.outbound_velocity || 0,
          signalConfidence: r.signal_confidence || 0,
        },
        recentActivity: [],
        dataSourceIds: [],
      }))
    }

    // Build the current rep object
    const rep: Rep = {
      id: repData.id,
      tenantId: repData.organization_id,
      teamId: repData.team_id,
      managerId: "",
      name: repData.full_name,
      email: repData.email || "",
      role: repData.role || "SDR",
      hireDate: repData.hire_date || "",
      trend: (repData.trend ?? "stable") as RepTrend,
      scores: {
        topRepSimilarity: repData.top_rep_similarity || 0,
        workflowDrift: repData.workflow_drift || 0,
        prospectingFocusTime: repData.prospecting_focus_time || 0,
        followUpDiscipline: repData.follow_up_discipline || 0,
        outboundVelocity: repData.outbound_velocity || 0,
        signalConfidence: repData.signal_confidence || 0,
      },
      recentActivity: (dailyMetrics || []).map((m: any) => ({
        date: m.date,
        timeProspecting: m.time_prospecting || 0,
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
        workdayMinutes: 480,
        callsDialed: m.calls_dialed || 0,
        connectRate: (m.connect_rate || 0) * 100,
        emailsSent: 0,
        meetingsBooked: m.meetings_booked || 0,
        followUpRate: (m.follow_up_rate || 0) * 100,
      })),
      dataSourceIds: [],
    }

    return <CoachingHub rep={rep} targets={targets} allReps={allReps} />
  } catch (error) {
    const mockRep = mockReps.find((r) => r.id === id)
    if (!mockRep) notFound()
    return <CoachingHub rep={mockRep} targets={targets} allReps={allReps} />
  }
}
