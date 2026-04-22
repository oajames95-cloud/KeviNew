import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { mockAccounts, mockAccountTouches, mockAccountPatterns } from "@/lib/mock-data"
import { AccountDetailClient } from "./account-detail-client"
import type { Account, AccountTouch, AccountPattern } from "@/types"

export const dynamic = "force-dynamic"

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Find account in mock data first
  let account: Account | undefined = mockAccounts.find(a => a.id === id)
  let touches: AccountTouch[] = mockAccountTouches.filter(t => t.accountId === id)
  let pattern: AccountPattern | undefined = account 
    ? mockAccountPatterns.find(p => p.repId === account?.ownerId)
    : undefined

  try {
    // Try to fetch from database
    const { data: accountData, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .single()

    if (accountError || !accountData) {
      // Fall back to mock data
      if (!account) notFound()
    } else {
      account = {
        id: accountData.id,
        tenantId: accountData.organization_id || accountData.tenant_id,
        name: accountData.name,
        domain: accountData.domain,
        industry: accountData.industry,
        employeeCount: accountData.employee_count,
        annualRevenue: accountData.annual_revenue,
        stage: accountData.stage,
        heat: accountData.heat,
        ownerId: accountData.owner_id,
        ownerName: accountData.owner_name || '',
        createdAt: accountData.created_at,
        lastTouchAt: accountData.last_touch_at,
        daysSinceLastTouch: accountData.days_since_last_touch || 0,
        totalTouches: accountData.total_touches || 0,
        touchesLast7Days: accountData.touches_last_7_days || 0,
        touchesLast30Days: accountData.touches_last_30_days || 0,
        meetingsBooked: accountData.meetings_booked || 0,
        pipelineValue: accountData.pipeline_value,
        winProbability: accountData.win_probability,
        contacts: [],
      }

      // Fetch touches
      const { data: touchesData } = await supabase
        .from('account_touches')
        .select('*')
        .eq('account_id', id)
        .order('timestamp', { ascending: false })
        .limit(50)

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
          timestamp: t.timestamp,
          durationMinutes: t.duration_minutes,
          nextStepScheduled: t.next_step_scheduled,
        }))
      }
    }
  } catch (error) {
    console.error('[v0] Error fetching account:', error)
    if (!account) notFound()
  }

  if (!account) notFound()

  return (
    <AccountDetailClient 
      account={account} 
      touches={touches} 
      repPattern={pattern}
    />
  )
}
