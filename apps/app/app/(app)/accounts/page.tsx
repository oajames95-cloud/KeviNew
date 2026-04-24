import { createClient } from "@/lib/supabase/server"
import { AccountsBoardClient } from "./accounts-board-client"
import type { Account, AccountStatus } from "@/types"

export const metadata = {
  title: "Accounts | Kevi",
}

export const dynamic = "force-dynamic"

export default async function AccountsPage() {
  const supabase = await createClient()

  const [{ data: accountsData }, { data: repsData }] = await Promise.all([
    supabase
      .from("accounts")
      .select(
        "id, organization_id, name, domain, industry, employee_count, source, external_id, assigned_rep_id, status, heat_score, progress_score, first_touched_at, last_touched_at, last_response_at, stage_entered_at, created_at, updated_at"
      )
      .order("heat_score", { ascending: false }),
    supabase
      .from("reps")
      .select("id, full_name")
      .order("full_name"),
  ])

  const accounts: Account[] = (accountsData ?? []).map((a: any) => ({
    id: a.id,
    organizationId: a.organization_id,
    name: a.name,
    domain: a.domain ?? null,
    industry: a.industry ?? null,
    employeeCount: a.employee_count ?? null,
    source: a.source ?? null,
    externalId: a.external_id ?? null,
    assignedRepId: a.assigned_rep_id ?? null,
    status: a.status as AccountStatus,
    heatScore: a.heat_score ?? 0,
    progressScore: a.progress_score ?? 0,
    firstTouchedAt: a.first_touched_at ?? null,
    lastTouchedAt: a.last_touched_at ?? null,
    lastResponseAt: a.last_response_at ?? null,
    stageEnteredAt: a.stage_entered_at ?? null,
    createdAt: a.created_at,
    updatedAt: a.updated_at,
  }))

  const reps = (repsData ?? []).map((r: any) => ({
    id: r.id,
    name: r.full_name,
  }))

  // Fetch touches for all accounts in parallel with account fetch (already done above)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const accountIds = accounts.map((a) => a.id)

  const touchesByAccount: Record<string, { channel: string; direction: string; touched_at: string }[]> = {}

  if (accountIds.length > 0) {
    const { data: touchesData } = await supabase
      .from("account_touches")
      .select("account_id, channel, direction, touched_at")
      .in("account_id", accountIds)
      .gte("touched_at", sevenDaysAgo)
      .order("touched_at", { ascending: false })

    for (const t of touchesData ?? []) {
      if (!touchesByAccount[t.account_id]) touchesByAccount[t.account_id] = []
      touchesByAccount[t.account_id].push({
        channel: t.channel,
        direction: t.direction,
        touched_at: t.touched_at,
      })
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      <AccountsBoardClient
        accounts={accounts}
        touchesByAccount={touchesByAccount}
        reps={reps}
      />
    </div>
  )
}
