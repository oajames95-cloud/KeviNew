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
