import { createClient } from "@/lib/supabase/server"
import { TodayClient } from "./today-client"
import { mockCoachingInsights, mockReps } from "@/lib/mock-data"

export const metadata = {
  title: "Today — Kevi",
  description: "Your coaching conversations for today",
}

export default async function TodayPage() {
  try {
    const supabase = await createClient()
    
    // Fetch today's coaching items that need attention
    const { data: coachingItems, error } = await supabase
      .from("coaching_items")
      .select(`
        *,
        rep:reps(id, full_name, email, role, trend)
      `)
      .in("status", ["new", "reviewing"])
      .order("severity", { ascending: true })
      .limit(10)

    // Fetch reps for signal generation (with recent activity)
    const { data: repsData } = await supabase
      .from("reps")
      .select(`*`)
      .limit(50)

    if (error || !coachingItems || coachingItems.length === 0) {
      // Use mock data
      const todayItems = mockCoachingInsights
        .filter((i) => i.status === "new" || i.status === "reviewing")
        .map((insight) => {
          const rep = mockReps.find((r) => r.id === insight.repId)
          return {
            ...insight,
            rep: rep ? {
              id: rep.id,
              full_name: rep.name,
              email: rep.email,
              role: rep.role,
              trend: rep.trend,
            } : null,
          }
        })
      return <TodayClient items={todayItems} reps={mockReps} />
    }

    const items = coachingItems.map((item: any) => ({
      id: item.id,
      tenantId: item.organization_id,
      repId: item.rep_id,
      repName: item.rep?.full_name || "Unknown",
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
      metrics: item.metrics || {},
      notes: item.notes || [],
      rep: item.rep,
    }))

    // Map repsData to Rep type or use mock reps
    const repsToUse = repsData && repsData.length > 0 
      ? repsData.map((r: any) => ({
          id: r.id,
          tenantId: r.organization_id,
          teamId: r.team_id,
          managerId: r.manager_id,
          name: r.full_name,
          email: r.email,
          role: r.role,
          hireDate: r.hire_date,
          trend: r.trend || "stable",
          scores: r.scores || {},
          recentActivity: r.recentActivity || [],
          dataSourceIds: [],
        }))
      : mockReps

    return <TodayClient items={items} reps={repsToUse} />
  } catch {
    const todayItems = mockCoachingInsights
      .filter((i) => i.status === "new" || i.status === "reviewing")
      .map((insight) => {
        const rep = mockReps.find((r) => r.id === insight.repId)
        return {
          ...insight,
          rep: rep ? {
            id: rep.id,
            full_name: rep.name,
            email: rep.email,
            role: rep.role,
            trend: rep.trend,
          } : null,
        }
      })
    return <TodayClient items={todayItems} reps={mockReps} />
  }
}
