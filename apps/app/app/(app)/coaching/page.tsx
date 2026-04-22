import { createClient } from "@/lib/supabase/server"
import { CoachingIndexClient } from "./coaching-index-client"
import { mockCoachingSessions, mockReps } from "@/lib/mock-data"
import type { CoachingSession, Rep } from "@/types"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Coaching — Kevi",
  description: "Coaching dashboard and session management",
}

export default async function CoachingPage() {
  const supabase = await createClient()
  let sessions: CoachingSession[] = mockCoachingSessions
  let reps: Rep[] = mockReps

  try {
    // Fetch all reps with target counts
    const { data: repsData } = await supabase
      .from('reps')
      .select(`
        id,
        organization_id,
        team_id,
        full_name,
        email,
        role,
        trend,
        top_rep_similarity,
        workflow_drift,
        prospecting_focus_time,
        follow_up_discipline,
        outbound_velocity,
        signal_confidence
      `)
      .order('full_name')

    if (repsData && repsData.length > 0) {
      reps = repsData.map((r: any) => ({
        id: r.id,
        tenantId: r.organization_id,
        teamId: r.team_id,
        managerId: '',
        name: r.full_name,
        email: r.email || '',
        role: r.role,
        hireDate: '',
        trend: r.trend || 'stable',
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
  } catch (error) {
    console.error('[v0] Error fetching coaching data:', error)
  }

  return <CoachingIndexClient sessions={sessions} reps={reps} />
}
