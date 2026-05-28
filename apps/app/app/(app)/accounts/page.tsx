import { createClient } from "@/lib/supabase/server"
import { mockAccounts, mockReps, mockAccountTouches } from "@/lib/mock-data"
import { AccountsBoardClient } from "./accounts-board-client"
import type { Account, Rep, AccountTouch } from "@/types"

export const dynamic = "force-dynamic"

export default async function AccountsPage() {
  const supabase = await createClient()
  let accounts: Account[] = mockAccounts
  let reps: Rep[] = mockReps
  let touches: AccountTouch[] = mockAccountTouches

  try {
    // Fetch accounts from database
    const { data: accountsData } = await supabase
      .from('accounts')
      .select('*')
      .order('last_touch_at', { ascending: false })

    // Fetch reps for filtering
    const { data: repsData } = await supabase
      .from('reps')
      .select('id, full_name, role, trend')
      .order('full_name')

    // Fetch touches for last 7 days for sparklines
    const sevenDaysAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: touchesData } = await supabase
      .from('account_touches')
      .select('*')
      .gte('touched_at', sevenDaysAgo)
      .order('touched_at', { ascending: false })

    if (accountsData && accountsData.length > 0) {
      accounts = accountsData.map((a: any) => ({
        id: a.id,
        tenantId: a.organization_id || a.tenant_id,
        name: a.name,
        domain: a.domain,
        industry: a.industry,
        employeeCount: a.employee_count,
        annualRevenue: a.annual_revenue,
        stage: a.stage,
        heat: a.heat,
        ownerId: a.owner_id,
        ownerName: a.owner_name || '',
        createdAt: a.created_at,
        lastTouchAt: a.last_touch_at,
        daysSinceLastTouch: a.days_since_last_touch || 0,
        totalTouches: a.total_touches || 0,
        touchesLast7Days: a.touches_last_7_days || 0,
        touchesLast30Days: a.touches_last_30_days || 0,
        meetingsBooked: a.meetings_booked || 0,
        pipelineValue: a.pipeline_value,
        winProbability: a.win_probability,
        contacts: [],
      }))
    }

    if (repsData && repsData.length > 0) {
      reps = repsData.map((r: any) => ({
        id: r.id,
        tenantId: '',
        teamId: '',
        managerId: '',
        name: r.full_name,
        email: '',
        role: r.role,
        hireDate: '',
        trend: r.trend || 'stable',
        scores: {
          topRepSimilarity: 0,
          workflowDrift: 0,
          prospectingFocusTime: 0,
          followUpDiscipline: 0,
          outboundVelocity: 0,
          signalConfidence: 0,
        },
        recentActivity: [],
        dataSourceIds: [],
      }))
    }

    if (touchesData && touchesData.length > 0) {
      touches = touchesData.map((t: any) => ({
        id: t.id,
        accountId: t.account_id,
        contactId: t.contact_id,
        repId: t.rep_id,
        repName: t.rep_name || '',
        channel: t.channel,
        direction: t.direction,
        outcome: t.outcome,
        subject: t.subject,
        notes: t.notes,
        timestamp: t.touched_at,
        durationMinutes: t.duration_minutes,
        nextStepScheduled: t.next_step_scheduled,
      }))
    }
  } catch (error) {
    console.error('[v0] Error fetching accounts:', error)
  }

  return <AccountsBoardClient accounts={accounts} reps={reps} touches={touches} />
}
