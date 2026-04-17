import { AppHeader } from "@/components/shell/app-header"
import { useMobileSidebar } from "@/components/shell/app-shell"
import { createClient } from "@/lib/supabase/server"
import { mockCoachingInsights, mockReps, mockTeams } from "@/lib/mock-data"
import { CoachingPageClient } from "./coaching-page-client"
import type { CoachingInsight } from "@/types"

export const dynamic = "force-dynamic"

export default async function CoachingPage() {
  let coachingInsights: CoachingInsight[] = mockCoachingInsights

  try {
    const supabase = await createClient()

    // Fetch coaching items
    const { data: coachingItems, error: coachingError } = await supabase
      .from("coaching_items")
      .select(
        `
        id,
        organization_id,
        rep_id,
        manager_id,
        severity,
        status,
        theme,
        reason,
        recommended_action,
        notes,
        flagged_at,
        updated_at
      `
      )
      .order("severity", { ascending: false })
      .order("flagged_at", { ascending: false })

    if (coachingError) {
      console.error("[v0] Error fetching coaching items:", coachingError)
    }

    // Fetch reps for name resolution
    const { data: reps, error: repsError } = await supabase
      .from("reps")
      .select("id, name, team_id")

    if (repsError) {
      console.error("[v0] Error fetching reps:", repsError)
    }

    // Fetch teams for name resolution
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id, name")

    if (teamsError) {
      console.error("[v0] Error fetching teams:", teamsError)
    }

    // Map coaching items to CoachingInsight type
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
          repName: rep?.name || "Unknown Rep",
          teamId: rep?.team_id,
          teamName: team?.name || "Unknown Team",
          managerId: item.manager_id,
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
    // Fall back to mock data on error
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AppHeader
        title="Coaching Queue"
        subtitle={`${coachingInsights.filter((i) => i.status !== "coached").length} open items`}
      />
      <CoachingPageClient initialInsights={coachingInsights} />
    </div>
  )
}
