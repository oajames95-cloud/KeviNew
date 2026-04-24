import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Building2, Flame, TrendingUp, ChevronRight } from "lucide-react"
import { AccountPulse } from "@/components/accounts/account-pulse"
import type { AccountStatus } from "@/types"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

const STATUS_LABELS: Record<AccountStatus, string> = {
  cold: "Cold",
  touched: "Touched",
  engaged: "Engaged",
  booked: "Booked",
  qualified: "Qualified",
  pipeline: "Pipeline",
  closed_lost: "Closed Lost",
}

const STATUS_COLORS: Record<AccountStatus, string> = {
  cold: "bg-zinc-100 text-zinc-500",
  touched: "bg-blue-50 text-blue-600",
  engaged: "bg-sky-50 text-sky-600",
  booked: "bg-violet-50 text-violet-600",
  qualified: "bg-emerald-50 text-emerald-600",
  pipeline: "bg-green-50 text-green-700",
  closed_lost: "bg-red-50 text-red-500",
}

export default async function RepAccountsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: repId } = await params
  const supabase = await createClient()

  const { data: rep, error: repError } = await supabase
    .from("reps")
    .select("id, full_name, role")
    .eq("id", repId)
    .single()

  if (repError) console.error("[REP ACCOUNTS] rep query error:", repError)
  if (repError || !rep) notFound()

  const { data: accountsData, error: accountsError } = await supabase
    .from("accounts")
    .select(
      "id, name, domain, industry, status, heat_score, progress_score, last_touched_at, assigned_rep_id"
    )
    .eq("assigned_rep_id", repId)
    .order("heat_score", { ascending: false })

  if (accountsError) console.error("[REP ACCOUNTS] accounts query error:", accountsError)

  const accounts = accountsData ?? []
  const accountIds = accounts.map((a: any) => a.id)

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const touchesByAccount: Record<
    string,
    { channel: string; direction: string; touched_at: string }[]
  > = {}

  if (accountIds.length > 0) {
    const { data: touchesData, error: touchesError } = await supabase
      .from("account_touches")
      .select("account_id, channel, direction, touched_at")
      .in("account_id", accountIds)
      .gte("touched_at", sevenDaysAgo)
      .order("touched_at", { ascending: false })

    if (touchesError) console.error("[REP ACCOUNTS] touches query error:", touchesError)
    console.log("[REP ACCOUNTS] fetched", accounts.length, "accounts and", (touchesData ?? []).length, "touches for rep", rep.full_name)

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
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      {/* Back */}
      <Link
        href={`/reps/${repId}`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ChevronLeft className="w-4 h-4" />
        {rep.full_name}
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-xl font-semibold">{rep.full_name}&rsquo;s Accounts</h1>
        <p className="text-sm text-muted-foreground">
          {accounts.length} account{accounts.length !== 1 ? "s" : ""} assigned
        </p>
      </div>

      {/* List */}
      {accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <Building2 className="w-8 h-8 opacity-30" />
          <p className="text-sm">No accounts assigned to {rep.full_name}</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="grid grid-cols-[1fr_72px_72px_120px_96px_28px] gap-3 px-4 py-2 bg-muted/40 border-b border-border text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            <span>Account</span>
            <span className="text-right">Heat</span>
            <span className="text-right">Progress</span>
            <span>Activity (7d)</span>
            <span>Status</span>
            <span />
          </div>

          {accounts.map((account: any, i: number) => {
            const touches = touchesByAccount[account.id] ?? []
            const status = account.status as AccountStatus

            return (
              <Link
                key={account.id}
                href={`/accounts/${account.id}`}
                className={cn(
                  "grid grid-cols-[1fr_72px_72px_120px_96px_28px] gap-3 px-4 py-3 items-center hover:bg-muted/30 transition-colors",
                  i > 0 && "border-t border-border/60"
                )}
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium truncate">{account.name}</span>
                  {account.industry && (
                    <span className="text-[11px] text-muted-foreground truncate">
                      {account.industry}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-1">
                  <Flame
                    className={cn(
                      "w-3.5 h-3.5",
                      account.heat_score >= 60 ? "text-orange-500" : "text-zinc-400"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium tabular-nums",
                      account.heat_score >= 60 ? "text-orange-600" : "text-muted-foreground"
                    )}
                  >
                    {account.heat_score}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-1">
                  <TrendingUp
                    className={cn(
                      "w-3.5 h-3.5",
                      account.progress_score >= 50 ? "text-blue-500" : "text-zinc-400"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium tabular-nums",
                      account.progress_score >= 50 ? "text-blue-600" : "text-muted-foreground"
                    )}
                  >
                    {account.progress_score}
                  </span>
                </div>

                <div className="flex items-center">
                  <AccountPulse touches={touches} width={120} height={32} />
                </div>

                <div>
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium",
                      STATUS_COLORS[status] ?? "bg-zinc-100 text-zinc-500"
                    )}
                  >
                    {STATUS_LABELS[status] ?? account.status}
                  </span>
                </div>

                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
