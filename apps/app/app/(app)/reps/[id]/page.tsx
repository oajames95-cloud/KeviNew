import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { mockReps, mockRepTargets } from "@/lib/mock-data"
import { CoachingHub } from "@/components/rep-detail/coaching-hub"
import type { RepTrend, RepTarget } from "@/types"

export const dynamic = "force-dynamic"

export default async function RepDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let targets: RepTarget[] = mockRepTargets.filter(t => t.repId === id)

  try {
    const supabase = await createClient()

    const { data: repData, error: repError } = await supabase
      .from("reps")
      .select("id, organization_id, team_id, full_name, email, role, hire_date, trend, top_rep_similarity, workflow_drift, prospecting_focus_time, follow_up_discipline, outbound_velocity, signal_confidence")
      .eq("id", id)
      .single()

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
      return <CoachingHub rep={mockRep!} targets={targets} />
    }

    const rep = {
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

    return <CoachingHub rep={rep} targets={targets} />
  } catch (error) {
    const mockRep = mockReps.find((r) => r.id === id)
    if (!mockRep) notFound()
    return <CoachingHub rep={mockRep} targets={targets} />
  }
}

    const rep = {
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
        topRepSimilarity: repData.top_rep_similarity ?? 0,
        workflowDrift: repData.workflow_drift ?? 0,
        prospectingFocusTime: repData.prospecting_focus_time ?? 0,
        followUpDiscipline: repData.follow_up_discipline ?? 0,
        outboundVelocity: repData.outbound_velocity ?? 0,
        signalConfidence: repData.signal_confidence ?? 0,
      },
      recentActivity: (dailyMetrics || []).map((m: any) => ({
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

    return <CoachingHub rep={rep} />
  } catch {
    const mockRep = mockReps.find((r) => r.id === id)
    if (!mockRep) notFound()
    return <CoachingHub rep={mockRep!} />
  }
}
