import { createClient } from "@/lib/supabase/server"
import { RepsList } from "./reps-list"
import { mockReps, mockTeams, mockCoachingInsights } from "@/lib/mock-data"
import type { Rep, Team, CoachingInsight } from "@/types"

export const dynamic = "force-dynamic"

// Map DB row to Rep type
function mapDbRepToRep(row: any): Rep {
  return {
    id: row.id,
    tenantId: row.organization_id || "",
    teamId: row.team_id,
    managerId: "",
    name: row.full_name || row.name || "Unknown",
    email: row.email || "",
    avatarUrl: row.avatar_url,
    role: row.role || "SDR",
    hireDate: row.hire_date || "",
    trend: row.trend || "stable",
    scores: {
      topRepSimilarity: row.top_rep_similarity ?? row.score_top_rep_similarity ?? 0,
      workflowDrift: row.workflow_drift ?? row.score_workflow_drift ?? 0,
      prospectingFocusTime: row.prospecting_focus_time ?? row.score_prospecting_focus_time ?? 0,
      followUpDiscipline: row.follow_up_discipline ?? row.score_follow_up_discipline ?? 0,
      prepQuality: row.prep_quality ?? row.score_prep_quality ?? 0,
      signalConfidence: row.signal_confidence ?? row.score_signal_confidence ?? 0,
    },
    recentActivity: [],
    dataSourceIds: [],
  }
}

// Map DB row to Team type
function mapDbTeamToTeam(row: any): Team {
  return {
    id: row.id,
    tenantId: row.organization_id || "",
    name: row.name,
    managerId: row.manager_id || "",
    repCount: 0,
    avgPatternMatch: 0,
    avgDriftScore: 0,
    createdAt: row.created_at || "",
  }
}

// Map DB row to CoachingInsight type
function mapDbCoachingToInsight(row: any): CoachingInsight {
  return {
    id: row.id,
    tenantId: row.organization_id || "",
    repId: row.rep_id,
    repName: row.rep?.full_name || row.rep?.name || "",
    teamId: row.rep?.team_id || "",
    teamName: "",
    managerId: row.manager_id || "",
    severity: row.severity || "medium",
    status: row.status || "new",
    theme: row.theme || "workflow mix",
    reason: row.reason || "",
    recommendedAction: row.recommended_action || "",
    flaggedAt: row.flagged_at || "",
    updatedAt: row.updated_at || "",
    metrics: {},
    notes: row.notes || [],
  }
}

export default async function RepsPage() {
  const supabase = await createClient()

  // Fetch reps from Supabase
  const { data: repsData, error: repsError } = await supabase
    .from("reps")
    .select(`
      id,
      organization_id,
      team_id,
      full_name,
      name,
      email,
      avatar_url,
      role,
      hire_date,
      trend,
      top_rep_similarity,
      workflow_drift,
      prospecting_focus_time,
      follow_up_discipline,
      prep_quality,
      signal_confidence,
      score_top_rep_similarity,
      score_workflow_drift,
      score_prospecting_focus_time,
      score_follow_up_discipline,
      score_prep_quality,
      score_signal_confidence
    `)
    .order("id")

  // Fetch teams from Supabase
  const { data: teamsData, error: teamsError } = await supabase
    .from("teams")
    .select(`
      id,
      organization_id,
      name,
      manager_id,
      created_at
    `)
    .order("name")

  // Fetch coaching items from Supabase
  const { data: coachingData, error: coachingError } = await supabase
    .from("coaching_items")
    .select(`
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
      updated_at,
      notes,
      rep:reps(full_name, name, team_id)
    `)
    .order("flagged_at", { ascending: false })

  // If any fetch fails, fall back to mock data
  if (repsError || teamsError || coachingError || !repsData?.length) {
    console.log("[v0] Using mock data - DB errors or empty:", { repsError, teamsError, coachingError })
    return (
      <RepsList
        reps={mockReps}
        teams={mockTeams}
        coachingInsights={mockCoachingInsights}
      />
    )
  }

  // Map database rows to app types
  const reps = repsData.map(mapDbRepToRep)
  const teams = teamsData?.map(mapDbTeamToTeam) || []
  const coachingInsights = coachingData?.map(mapDbCoachingToInsight) || []

  return (
    <RepsList
      reps={reps}
      teams={teams}
      coachingInsights={coachingInsights}
    />
  )
}
