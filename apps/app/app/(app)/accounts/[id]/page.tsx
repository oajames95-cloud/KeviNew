import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Flame, TrendingUp, Globe, Building2, Users } from "lucide-react"
import { AccountPulse } from "@/components/accounts/account-pulse"
import type { AccountStatus } from "@/types"

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

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: account, error } = await supabase
    .from("accounts")
    .select(
      "id, organization_id, name, domain, industry, employee_count, source, assigned_rep_id, status, heat_score, progress_score, first_touched_at, last_touched_at, last_response_at, stage_entered_at, created_at, updated_at"
    )
    .eq("id", id)
    .single()

  if (error || !account) notFound()

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: touchesData }, { data: repData }, { data: allTouchesData }] =
    await Promise.all([
      // Touches for the sparkline (7 days)
      supabase
        .from("account_touches")
        .select("channel, direction, touched_at")
        .eq("account_id", id)
        .gte("touched_at", sevenDaysAgo)
        .order("touched_at", { ascending: false }),
      // Assigned rep
      account.assigned_rep_id
        ? supabase
            .from("reps")
            .select("id, full_name, role")
            .eq("id", account.assigned_rep_id)
            .single()
        : Promise.resolve({ data: null }),
      // All-time touches for activity count
      supabase
        .from("account_touches")
        .select("id", { count: "exact", head: true })
        .eq("account_id", id),
    ])

  const touches = (touchesData ?? []).map((t: any) => ({
    channel: t.channel,
    direction: t.direction,
    touched_at: t.touched_at,
  }))

  const status = account.status as AccountStatus

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      {/* Back */}
      <Link
        href="/accounts"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ChevronLeft className="w-4 h-4" />
        Accounts
      </Link>

      {/* Hero */}
      <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <h1 className="text-2xl font-semibold">{account.name}</h1>
            </div>
            <div className="flex items-center gap-3 flex-wrap mt-1">
              {account.domain && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Globe className="w-3.5 h-3.5" />
                  {account.domain}
                </span>
              )}
              {account.industry && (
                <span className="text-sm text-muted-foreground">{account.industry}</span>
              )}
              {account.employee_count && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  {account.employee_count.toLocaleString()} employees
                </span>
              )}
            </div>
          </div>

          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              STATUS_COLORS[status] ?? "bg-zinc-100 text-zinc-500"
            }`}
          >
            {STATUS_LABELS[status] ?? account.status}
          </span>
        </div>

        {/* Scores + sparkline */}
        <div className="flex items-center gap-6 flex-wrap pt-2 border-t border-border">
          <div className="flex items-center gap-1.5">
            <Flame
              className={`w-4 h-4 ${account.heat_score >= 60 ? "text-orange-500" : "text-zinc-400"}`}
            />
            <span className="text-sm text-muted-foreground">Heat</span>
            <span
              className={`text-base font-semibold tabular-nums ${
                account.heat_score >= 60 ? "text-orange-600" : "text-foreground"
              }`}
            >
              {account.heat_score}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <TrendingUp
              className={`w-4 h-4 ${account.progress_score >= 50 ? "text-blue-500" : "text-zinc-400"}`}
            />
            <span className="text-sm text-muted-foreground">Progress</span>
            <span
              className={`text-base font-semibold tabular-nums ${
                account.progress_score >= 50 ? "text-blue-600" : "text-foreground"
              }`}
            >
              {account.progress_score}
            </span>
          </div>

          {repData && (
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Owner</span>
              <Link
                href={`/reps/${repData.id}`}
                className="text-sm font-medium hover:underline"
              >
                {repData.full_name}
              </Link>
              <span className="text-xs text-muted-foreground">({repData.role})</span>
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Activity 7d</span>
            <AccountPulse touches={touches} width={240} height={48} />
          </div>
        </div>
      </div>

      {/* Timeline: recent touches */}
      <div className="rounded-lg border border-border">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-medium">Recent Activity (7 days)</h2>
        </div>
        {touches.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground text-center">
            No touches in the last 7 days
          </p>
        ) : (
          <div className="divide-y divide-border/60">
            {touches.map((t, i) => (
              <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                <span className="text-xs capitalize text-muted-foreground w-28 shrink-0">
                  {t.channel.replace(/_/g, " ")}
                </span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                    t.direction === "inbound"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {t.direction}
                </span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(t.touched_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
