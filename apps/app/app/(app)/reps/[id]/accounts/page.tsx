import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { mockReps, mockAccounts, mockAccountTouches } from "@/lib/mock-data"
import { RepAccountsClient } from "./rep-accounts-client"
import type { Account, AccountTouch } from "@/types"

// This page is only rendered when the rep has >10 accounts.
// For reps with ≤10 accounts the rep detail page (/reps/[id]) already shows
// all accounts inline and never links here.

interface RepAccountsPageProps {
  params: Promise<{ id: string }>
}

export const dynamic = "force-dynamic"

export default async function RepAccountsPage({ params }: RepAccountsPageProps) {
  const { id } = await params

  try {
    const supabase = await createClient()

    // Fetch rep
    const { data: repData, error: repError } = await supabase
      .from("reps")
      .select("id, full_name, role, team_id")
      .eq("id", id)
      .single()

    if (repError || !repData) {
      // Fall back to mock
      const mockRep = mockReps.find(r => r.id === id)
      if (!mockRep) notFound()

      const repAccounts = mockAccounts.filter(a => a.ownerId === id)
      // If ≤10 accounts, redirect back to detail page
      if (repAccounts.length <= 10) redirect(`/reps/${id}`)

      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const repTouches = mockAccountTouches.filter(t =>
        repAccounts.some(a => a.id === t.accountId) &&
        new Date(t.timestamp) >= thirtyDaysAgo
      )
      const touchesByAccount = repAccounts.reduce((acc, account) => {
        acc[account.id] = repTouches.filter(t => t.accountId === account.id)
        return acc
      }, {} as Record<string, typeof mockAccountTouches>)

      return <RepAccountsClient rep={mockRep} accounts={repAccounts as any} touchesByAccount={touchesByAccount as any} />
    }

    // Fetch accounts and touches in parallel
    const cutoffISO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data: accountsData } = await supabase
      .from("accounts")
      .select("id, name, domain, industry, status, heat_score, progress_score, last_touched_at, last_response_at, first_touched_at, assigned_rep_id")
      .eq("assigned_rep_id", id)
      .order("heat_score", { ascending: false })

    const accounts: Account[] = (accountsData ?? []).map((a: any) => ({
      id: a.id,
      organizationId: repData.id,
      name: a.name,
      domain: a.domain,
      industry: a.industry,
      employeeCount: null,
      source: null,
      externalId: null,
      assignedRepId: a.assigned_rep_id,
      status: a.status,
      heatScore: a.heat_score || 0,
      progressScore: a.progress_score || 0,
      firstTouchedAt: a.first_touched_at,
      lastTouchedAt: a.last_touched_at,
      lastResponseAt: a.last_response_at,
      stageEnteredAt: null,
      createdAt: a.created_at || new Date().toISOString(),
      updatedAt: a.updated_at || new Date().toISOString(),
    }))

    // If ≤10 accounts, they're already on the rep detail page — redirect
    if (accounts.length <= 10) redirect(`/reps/${id}`)

    const accountIds = accounts.map(a => a.id)
    const { data: touchesData } = accountIds.length > 0
      ? await supabase
          .from("account_touches")
          .select("id, account_id, channel, direction, touched_at")
          .in("account_id", accountIds)
          .gte("touched_at", cutoffISO)
          .order("touched_at", { ascending: false })
      : { data: [] }

    // Build touchesByAccount map (O(n))
    const touchesByAccountMap = new Map<string, AccountTouch[]>()
    for (const t of (touchesData ?? [])) {
      const touch: AccountTouch = {
        id: t.id,
        accountId: t.account_id,
        contactId: null,
        repId: id,
        organizationId: "",
        channel: t.channel,
        direction: t.direction,
        touchType: null,
        subject: null,
        bodyPreview: null,
        responseReceived: false,
        responseAt: null,
        touchedAt: t.touched_at,
        createdAt: t.touched_at,
      }
      const existing = touchesByAccountMap.get(t.account_id)
      if (existing) existing.push(touch)
      else touchesByAccountMap.set(t.account_id, [touch])
    }

    const touchesByAccount = Object.fromEntries(touchesByAccountMap)

    const rep = {
      id: repData.id,
      tenantId: "",
      teamId: repData.team_id,
      managerId: "",
      name: repData.full_name,
      email: "",
      role: repData.role || "SDR",
      hireDate: "",
      trend: "stable" as const,
      scores: { topRepSimilarity: 0, workflowDrift: 0, prospectingFocusTime: 0, followUpDiscipline: 0, outboundVelocity: 0, signalConfidence: 0 },
      recentActivity: [],
      dataSourceIds: [],
    }

    return <RepAccountsClient rep={rep} accounts={accounts as any} touchesByAccount={touchesByAccount as any} />
  } catch (error) {
    console.error("[v0] RepAccountsPage error:", error)
    const mockRep = mockReps.find(r => r.id === id)
    if (!mockRep) notFound()
    const repAccounts = mockAccounts.filter(a => a.ownerId === id)
    if (repAccounts.length <= 10) redirect(`/reps/${id}`)
    return <RepAccountsClient rep={mockRep} accounts={repAccounts as any} touchesByAccount={{}} />
  }
}
