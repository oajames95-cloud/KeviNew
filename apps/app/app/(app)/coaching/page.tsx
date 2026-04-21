import { createClient } from "@/lib/supabase/server"
import { mockCoachingInsights, mockCoachingSessions } from "@/lib/mock-data"
import { CoachingPageClient } from "./coaching-page-client"
import type { CoachingSession, CoachingInsight } from "@/types"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Coaching — Kevi",
  description: "Manage coaching sessions and coaching priorities",
}

export default async function CoachingPage() {
  let sessions: CoachingSession[] = mockCoachingSessions
  let insights: CoachingInsight[] = mockCoachingInsights

  try {
    const supabase = await createClient()

    // Fetch coaching sessions (would need coaching_sessions table)
    // For now, we use mock data
    
    // Fetch coaching insights for priorities sidebar
    const { data: coachingItems } = await supabase
      .from("coaching_items")
      .select("*")
      .order("severity", { ascending: false })
      .limit(8)

    if (coachingItems && coachingItems.length > 0) {
      insights = coachingItems.map((item: any) => ({
        id: item.id,
        tenantId: item.organization_id,
        repId: item.rep_id,
        repName: item.rep_name || "Unknown",
        teamId: item.team_id,
        teamName: "",
        managerId: item.manager_id,
        severity: item.severity,
        status: item.status,
        theme: item.theme,
        reason: item.reason,
        recommendedAction: item.recommended_action,
        flaggedAt: item.flagged_at,
        updatedAt: item.updated_at,
        metrics: {},
      }))
    }
  } catch (error) {
    console.error("[v0] Error fetching coaching data:", error)
  }

  return <CoachingPageClient sessions={sessions} insights={insights} />
}


export default async function CoachingPage() {
  let coachingInsights: CoachingInsight[] = mockCoachingInsights

  try {
    const supabase = await createClient()

    const { data: coachingItems, error: coachingError } = await supabase
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
        notes,
        flagged_at,
        updated_at
      `)
      .order("severity", { ascending: false })
      .order("flagged_at", { ascending: false })

    if (coachingError) {
      console.error("[v0] Error fetching coaching items:", coachingError)
    }

    const { data: reps, error: repsError } = await supabase
      .from("reps")
      .select("id, full_name, team_id")

    if (repsError) {
      console.error("[v0] Error fetching reps:", repsError)
    }

    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id, name")

    if (teamsError) {
      console.error("[v0] Error fetching teams:", teamsError)
    }

    if (coachingItems && coachingItems.length > 0 && reps && teams) {
      const repMap = new Map(reps.map((r: any) => [r.id, r]))
      const teamMap = new Map(teams.map((t: any) => [t.id, t]))

      coachingInsights = coachingItems.map((item: any) => {
        const rep = repMap.get(item.rep_id)
        const team = teamMap.get(rep?.team_id)

        return {
          id: item.id,
          tenantId: item.organization_id,
          repId: item.rep_id,
          repName: rep?.full_name || "Unknown Rep",
          teamId: rep?.team_id,
          teamName: team?.name || "Unknown Team",
          severity: item.severity,
          status: item.status,
          theme: item.theme,
          reason: item.reason,
          recommendedAction: item.recommended_action,
          flaggedAt: item.flagged_at,
          updatedAt: item.updated_at,
          metrics: {},
          notes: item.notes || [],
        }
      })
    }
  } catch (error) {
    console.error("[v0] Error fetching coaching data:", error)
  }

  return <CoachingPageClient initialInsights={coachingInsights} />
}
