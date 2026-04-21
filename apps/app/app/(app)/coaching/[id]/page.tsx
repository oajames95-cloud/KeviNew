'use server'

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CoachingDashboardClient } from "./coaching-dashboard-client"
import { mockReps } from "@/lib/mock-data"
import type { Rep, CoachingSession } from "@/types"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rep = mockReps.find(r => r.id === id)
  return {
    title: `${rep?.name || 'Rep'} Coaching — Kevi`,
    description: "Rep coaching dashboard and session history",
  }
}

export default async function CoachingDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  let rep: Rep | null = null
  let sessions: CoachingSession[] = []
  let activeTargets: any[] = []

  try {
    // Fetch rep data
    const { data: repData } = await supabase
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
      .eq('id', id)
      .single()

    if (repData) {
      rep = {
        id: repData.id,
        tenantId: repData.organization_id,
        teamId: repData.team_id,
        managerId: '',
        name: repData.full_name,
        email: repData.email || '',
        role: repData.role,
        hireDate: '',
        trend: repData.trend || 'stable',
        scores: {
          topRepSimilarity: repData.top_rep_similarity || 0,
          workflowDrift: repData.workflow_drift || 0,
          prospectingFocusTime: repData.prospecting_focus_time || 0,
          followUpDiscipline: repData.follow_up_discipline || 0,
          outboundVelocity: repData.outbound_velocity || 0,
          signalConfidence: repData.signal_confidence || 0,
        },
        recentActivity: [],
        dataSourceIds: [],
      }
    }

    // Fetch coaching sessions for this rep
    const { data: sessionsData } = await supabase
      .from('coaching_sessions')
      .select('*')
      .eq('rep_id', id)
      .order('created_at', { ascending: false })

    if (sessionsData && sessionsData.length > 0) {
      sessions = sessionsData.map((s: any) => ({
        id: s.id,
        repId: s.rep_id,
        objective: s.objective || '',
        notes: s.notes || '',
        followUpDate: s.follow_up_date,
        scheduledAt: s.scheduled_at,
        createdAt: s.created_at,
        status: 'completed',
      }))
    }

    // Fetch active targets for this rep
    const { data: targetsData } = await supabase
      .from('coaching_targets')
      .select('*')
      .eq('rep_id', id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (targetsData && targetsData.length > 0) {
      activeTargets = targetsData
    }
  } catch (error) {
    console.error('[v0] Error fetching coaching dashboard:', error)
  }

  if (!rep) {
    const mockRep = mockReps.find(r => r.id === id)
    if (!mockRep) notFound()
    rep = mockRep
  }

  return <CoachingDashboardClient rep={rep} sessions={sessions} activeTargets={activeTargets} />
}
