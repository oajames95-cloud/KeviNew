import { createClient } from "@/lib/supabase/server"
import { TodayClient } from "./today-client"
import { mockCoachingInsights, mockCoachingSessions, mockReps, mockAccounts } from "@/lib/mock-data"
import { generateSignals } from "@/lib/signal-generator"

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

    // Get today's date range for filtering sessions
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Fetch today's coaching sessions
    const { data: sessionsData } = await supabase
      .from("coaching_sessions")
      .select(`
        *,
        rep:reps(id, full_name)
      `)
      .gte("scheduled_at", today.toISOString())
      .lt("scheduled_at", tomorrow.toISOString())
      .eq("status", "scheduled")
      .order("scheduled_at", { ascending: true })

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
      
      // Filter mock sessions for today
      const todaySessions = mockCoachingSessions.filter(s => {
        const sessionDate = new Date(s.scheduledAt)
        return sessionDate >= today && sessionDate < tomorrow && s.status === "scheduled"
      })

      return (
        <TodayClient
          items={todayItems}
          reps={mockReps}
          sessions={todaySessions}
          signals={generateSignals(mockReps)}
          accounts={mockAccounts}
        />
      )
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

    // Map sessions data or use mock sessions
    const sessionsToUse = sessionsData && sessionsData.length > 0
      ? sessionsData.map((s: any) => ({
          id: s.id,
          tenantId: s.organization_id,
          repId: s.rep_id,
          repName: s.rep?.full_name || "Unknown",
          managerId: s.manager_id,
          scheduledAt: s.scheduled_at,
          duration: s.duration || 30,
          status: s.status,
          coachingItemId: s.coaching_item_id,
          talkingPoints: s.talking_points || [],
          actionItems: s.action_items || [],
          notes: s.notes,
          completedAt: s.completed_at,
        }))
      : mockCoachingSessions.filter(s => {
          const sessionDate = new Date(s.scheduledAt)
          return sessionDate >= today && sessionDate < tomorrow && s.status === "scheduled"
        })

    return (
      <TodayClient
        items={items}
        reps={repsToUse}
        sessions={sessionsToUse}
        signals={generateSignals(repsToUse)}
        accounts={mockAccounts}
      />
    )
  } catch {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

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

    const todaySessions = mockCoachingSessions.filter(s => {
      const sessionDate = new Date(s.scheduledAt)
      return sessionDate >= today && sessionDate < tomorrow && s.status === "scheduled"
    })

    return (
      <TodayClient
        items={todayItems}
        reps={mockReps}
        sessions={todaySessions}
        signals={generateSignals(mockReps)}
        accounts={mockAccounts}
      />
    )
  }
}
