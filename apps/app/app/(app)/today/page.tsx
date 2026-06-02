import { createClient } from "@/lib/supabase/server"
import { TodayClient } from "./today-client"
import { mockCoachingInsights, mockCoachingSessions, mockReps, mockAccounts } from "@/lib/mock-data"
import { generateSignals } from "@/lib/signal-generator"
import { syncCoachingItems } from "@/lib/targets/flagging"
import { getCurrentRep, getVisibleRepIds } from "@/lib/identity/current-rep"

export const metadata = {
  title: "Today — Kevi",
  description: "Your coaching conversations for today",
}

export default async function TodayPage() {
  try {
    const supabase = await createClient()

    // Resolve the signed-in user to their rep/org/role. The (app) layout guarantees
    // this is non-null before the page renders, but guard anyway.
    const current = await getCurrentRep()
    const visibleRepIds = current ? await getVisibleRepIds(current) : []

    // Recompute breach flags on page load (track -> flag) for the user's own org.
    // Best-effort: never let flag sync block rendering the queue.
    try {
      if (current) await syncCoachingItems(current.organizationId)
    } catch (e) {
      console.error("[today] flag sync skipped:", e)
    }

    // Coaching items, scoped: a manager sees their whole org's reps; a rep sees
    // only their own items.
    const { data: coachingItems, error } = await supabase
      .from("coaching_items")
      .select(`
        *,
        rep:reps(id, full_name, email, role, trend)
      `)
      .in("status", ["new", "reviewing"])
      .in("rep_id", visibleRepIds.length ? visibleRepIds : ["00000000-0000-0000-0000-000000000000"])
      .order("severity", { ascending: true })
      .limit(200)

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
      managerId: null,
      severity: item.severity,
      status: item.status,
      title: item.title,
      theme: item.coaching_theme,
      reason: item.reason,
      recommendedAction: item.suggested_action,
      flaggedAt: item.opened_at,
      updatedAt: item.updated_at,
      metrics: {},
      notes: item.manager_notes ? [item.manager_notes] : [],
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
