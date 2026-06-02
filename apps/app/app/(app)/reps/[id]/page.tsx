import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { mockReps, mockTeams, mockAccounts, mockAccountPatterns } from "@/lib/mock-data"
import { RepDetailClient } from "./rep-detail-client"
import type { RepTrend, Rep, Account, AccountTouch, TopCohortBenchmark } from "@/types"

export const dynamic = "force-dynamic"

// Default benchmark used as fallback when team data is unavailable
const FALLBACK_BENCHMARK: TopCohortBenchmark = {
  topRepSimilarity: 80,
  workflowDrift: 15,
  prospectingFocusTime: 75,
  followUpDiscipline: 78,
  outboundVelocity: 72,
  signalConfidence: 85,
}

export default async function RepDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const supabase = await createClient()

    // ── Step 1: fetch rep row ────────────────────────────────────────────────
    const { data: repData, error: repError } = await supabase
      .from("reps")
      .select("id, organization_id, team_id, full_name, email, role, hire_date, trend, top_rep_similarity, workflow_drift, prospecting_focus_time, follow_up_discipline, outbound_velocity, signal_confidence")
      .eq("id", id)
      .single()

    if (repError || !repData) {
      const mockRep = mockReps.find((r) => r.id === id)
      if (!mockRep) notFound()
      return (
        <RepDetailClient
          rep={mockRep!}
          coachingTargets={[]}
          teamName={mockTeams.find(t => t.id === mockRep!.teamId)?.name ?? "—"}
          benchmark={FALLBACK_BENCHMARK}
          repAccounts={mockAccounts.filter(a => a.ownerId === id) as any}
          repTouches={[]}
          pipelineCreated={0}
        />
      )
    }

    // ── Step 2: all parallel queries that don't depend on each other ─────────
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 30)
    const cutoffDate = cutoff.toISOString().split("T")[0]
    const cutoffISO = cutoff.toISOString()

    const [
      { data: allRepsData },
      { data: teamData },
      { data: targetData },
      { data: dailyMetrics },
      { data: outcomes },
      { data: accountsData },
    ] = await Promise.all([
      // Score columns for benchmark computation
      supabase
        .from("reps")
        .select("id, team_id, top_rep_similarity, workflow_drift, prospecting_focus_time, follow_up_discipline, outbound_velocity, signal_confidence")
        .limit(200),

      // Team name
      supabase
        .from("teams")
        .select("id, name")
        .eq("id", repData.team_id)
        .single(),

      // Active coaching targets
      supabase
        .from("coaching_targets")
        .select("*")
        .eq("rep_id", id)
        .eq("status", "active")
        .order("created_at", { ascending: false }),

      // Daily workflow metrics — 30-day bounded
      supabase
        .from("rep_daily_metrics")
        .select("metric_date, prospecting_minutes, research_minutes, apollo_minutes, linkedin_minutes, crm_minutes, email_minutes, context_switches, focus_blocks, idle_minutes")
        .eq("rep_id", id)
        .gte("metric_date", cutoffDate)
        .order("metric_date", { ascending: false })
        .limit(30),

      // Rep outcomes (pipeline_created) — 30-day bounded
      supabase
        .from("rep_outcomes")
        .select("outcome_date, meetings_booked, qualified_meetings, pipeline_created, opportunities_created, positive_replies")
        .eq("rep_id", id)
        .gte("outcome_date", cutoffDate)
        .order("outcome_date", { ascending: false })
        .limit(30),

      // This rep's accounts (no date bound — accounts are not time-series)
      supabase
        .from("accounts")
        .select("id, name, domain, industry, status, heat_score, progress_score, last_touched_at, last_response_at, first_touched_at, assigned_rep_id")
        .eq("assigned_rep_id", id)
        .order("heat_score", { ascending: false }),
    ])

    // ── Step 3: touches for those accounts (depends on accountsData) ─────────
    const accountIds = (accountsData ?? []).map((a: any) => a.id)
    const { data: touchesData } = accountIds.length > 0
      ? await supabase
          .from("account_touches")
          .select("id, account_id, channel, direction, touched_at")
          .in("account_id", accountIds)
          .gte("touched_at", cutoffISO)
          .order("touched_at", { ascending: false })
      : { data: [] }

    // ── Compute real team benchmark ──────────────────────────────────────────
    const teamReps = (allRepsData ?? []).filter((r: any) => r.team_id === repData.team_id)
    let benchmark = FALLBACK_BENCHMARK

    if (teamReps.length >= 2) {
      const scores = {
        topRepSimilarity: teamReps.map((r: any) => r.top_rep_similarity || 0),
        workflowDrift: teamReps.map((r: any) => r.workflow_drift || 0),
        prospectingFocusTime: teamReps.map((r: any) => r.prospecting_focus_time || 0),
        followUpDiscipline: teamReps.map((r: any) => r.follow_up_discipline || 0),
        outboundVelocity: teamReps.map((r: any) => r.outbound_velocity || 0),
        signalConfidence: teamReps.map((r: any) => r.signal_confidence || 0),
      }

      // Top-quartile baseline: average of top 25% of each score
      const topQuartile = (vals: number[]) => {
        const sorted = [...vals].sort((a, b) => b - a)
        const q = Math.max(1, Math.ceil(sorted.length * 0.25))
        return Math.round(sorted.slice(0, q).reduce((s, v) => s + v, 0) / q)
      }
      const topQuartileDrift = (vals: number[]) => {
        // For drift, lower is better — top quartile = lowest values
        const sorted = [...vals].sort((a, b) => a - b)
        const q = Math.max(1, Math.ceil(sorted.length * 0.25))
        return Math.round(sorted.slice(0, q).reduce((s, v) => s + v, 0) / q)
      }

      benchmark = {
        topRepSimilarity: topQuartile(scores.topRepSimilarity),
        workflowDrift: topQuartileDrift(scores.workflowDrift),
        prospectingFocusTime: topQuartile(scores.prospectingFocusTime),
        followUpDiscipline: topQuartile(scores.followUpDiscipline),
        outboundVelocity: topQuartile(scores.outboundVelocity),
        signalConfidence: topQuartile(scores.signalConfidence),
      }
    }

    // ── Sum pipeline_created over 30 days ────────────────────────────────────
    const pipelineCreated = (outcomes ?? []).reduce(
      (sum: number, row: any) => sum + (row.pipeline_created || 0),
      0
    )

    // ── Build Rep object ─────────────────────────────────────────────────────
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
      recentActivity: (dailyMetrics ?? []).map((m: any) => ({
        date: m.metric_date,
        timeProspecting: m.prospecting_minutes || 0,
        timeResearching: m.research_minutes || 0,
        timeBuildingLists: 0,
        timeInApollo: m.apollo_minutes || 0,
        timeInLinkedIn: m.linkedin_minutes || 0,
        timeInCRM: m.crm_minutes || 0,
        timeInSequencer: 0,
        timeInEmail: m.email_minutes || 0,
        timeInCalendar: 0,
        idleTime: m.idle_minutes || 0,
        contextSwitches: m.context_switches || 0,
        focusBlocksMin: m.focus_blocks || 0,
        workdayMinutes: 480,
        callsDialed: 0,
        connectRate: 0,
        emailsSent: 0,
        meetingsBooked: 0,
        followUpRate: 0,
      })),
      dataSourceIds: [],
    }

    // ── Map accounts ─────────────────────────────────────────────────────────
    const repAccounts: Account[] = (accountsData ?? []).map((a: any) => ({
      id: a.id,
      organizationId: repData.organization_id,
      name: a.name,
      domain: a.domain,
      industry: a.industry,
      employeeCount: null,
      source: null,
      externalId: null,
      assignedRepId: a.assigned_rep_id,
      status: a.status,
      heatScore: a.heat_score || 0,
      progressScore: a.progress_score || 0,
      firstTouchedAt: a.first_touched_at,
      lastTouchedAt: a.last_touched_at,
      lastResponseAt: a.last_response_at,
      stageEnteredAt: null,
      createdAt: a.created_at || new Date().toISOString(),
      updatedAt: a.updated_at || new Date().toISOString(),
    }))

    // ── Map touches ──────────────────────────────────────────────────────────
    const repTouches: AccountTouch[] = (touchesData ?? []).map((t: any) => ({
      id: t.id,
      accountId: t.account_id,
      contactId: null,
      repId: id,
      organizationId: repData.organization_id,
      channel: t.channel,
      direction: t.direction,
      touchType: null,
      subject: null,
      bodyPreview: null,
      responseReceived: false,
      responseAt: null,
      touchedAt: t.touched_at,
      createdAt: t.touched_at,
    }))

    return (
      <RepDetailClient
        rep={rep}
        coachingTargets={targetData ?? []}
        teamName={teamData?.name ?? "—"}
        benchmark={benchmark}
        repAccounts={repAccounts}
        repTouches={repTouches}
        pipelineCreated={pipelineCreated}
      />
    )
  } catch (error) {
    console.error("[v0] RepDetailPage error:", error)
    const mockRep = mockReps.find((r) => r.id === id)
    if (!mockRep) notFound()
    return (
      <RepDetailClient
        rep={mockRep!}
        coachingTargets={[]}
        teamName={mockTeams.find(t => t.id === mockRep!.teamId)?.name ?? "—"}
        benchmark={FALLBACK_BENCHMARK}
        repAccounts={mockAccounts.filter(a => a.ownerId === id) as any}
        repTouches={[]}
        pipelineCreated={0}
      />
    )
  }
}
