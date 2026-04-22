import { createClient } from "@/lib/supabase/server"
import { mockAccounts, mockReps } from "@/lib/mock-data"
import { AccountsBoardClient } from "./accounts-board-client"
import type { Account, Rep } from "@/types"

export const dynamic = "force-dynamic"

export default async function AccountsPage() {
  const supabase = await createClient()
  let accounts: Account[] = mockAccounts
  let reps: Rep[] = mockReps

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
  } catch (error) {
    console.error('[v0] Error fetching accounts:', error)
  }

  return <AccountsBoardClient accounts={accounts} reps={reps} />
}
