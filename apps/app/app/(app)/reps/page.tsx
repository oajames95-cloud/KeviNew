import { createClient } from "@/lib/supabase/server"
import { RepsList } from "./reps-list"
import { getCurrentRep, getVisibleRepIds } from "@/lib/identity/current-rep"

export const dynamic = "force-dynamic"

export default async function RepsPage() {
  const supabase = await createClient()

  // Resolve the signed-in user. Layout guarantees non-null, but guard.
  const current = await getCurrentRep()
  if (!current) {
    return <RepsList reps={[]} teams={[]} coachingInsights={[]} />
  }
  const visibleRepIds = await getVisibleRepIds(current)

  // Reps: scoped to the user's org, then filtered to what they may see.
  const { data: repsData } = await supabase
    .from("reps")
    .select("id, organization_id, team_id, full_name, email, role, hire_date, trend, top_rep_similarity, workflow_drift, prospecting_focus_time, follow_up_discipline, outbound_velocity, signal_confidence")
    .eq("organization_id", current.organizationId)
    .in("id", visibleRepIds.length ? visibleRepIds : ["00000000-0000-0000-0000-000000000000"])
    .order("full_name")

  const { data: teamsData } = await supabase
    .from("teams")
    .select("id, organization_id, name, created_at")
    .eq("organization_id", current.organizationId)
    .order("name")

  const { data: coachingData } = await supabase
    .from("coaching_items")
    .select("id, organization_id, rep_id, team_id, title, reason, coaching_theme, severity, status, suggested_action, opened_at, closed_at, updated_at")
    .eq("organization_id", current.organizationId)
    .in("rep_id", visibleRepIds.length ? visibleRepIds : ["00000000-0000-0000-0000-000000000000"])
    .order("opened_at", { ascending: false })
    .limit(100)

  if (!repsData?.length) {
    return <RepsList reps={[]} teams={[]} coachingInsights={[]} />
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

  const teams = (teamsData ?? []).map((t: any) => ({
    id: t.id,
    tenantId: t.organization_id,
    name: t.name,
    managerId: "",
    repCount: reps.filter((r: any) => r.teamId === t.id).length,
    avgPatternMatch: 0,
    avgDriftScore: 0,
    createdAt: t.created_at,
  }))

  // Build O(1) lookup maps to avoid O(n²) .find() inside the coaching map
  const repById = new Map(reps.map((r: any) => [r.id, r]))
  const teamById = new Map(teams.map((t: any) => [t.id, t]))

  const coachingInsights = (coachingData ?? []).map((c: any) => ({
    id: c.id,
    tenantId: c.organization_id,
    repId: c.rep_id,
    repName: repById.get(c.rep_id)?.name || "",
    teamId: c.team_id || "",
    teamName: teamById.get(c.team_id)?.name || "",
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

  return <RepsList reps={reps} teams={teams} coachingInsights={coachingInsights} />
}
