"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Flame,
  TrendingUp,
  ChevronRight,
  Building2,
  Users,
  Search,
  LayoutGrid,
  Table2,
  BarChart3,
  Clock,
  Target,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AccountPulse } from "@/components/accounts/account-pulse"
import type { Account, AccountStatus } from "@/types"

// ─── Types ───────────────────────────────────────────────────────────────────

type ViewMode = "quadrant" | "table" | "patterns"
type HeatFilter = "all" | "hot" | "warm" | "cold"
type StageFilter = AccountStatus | "all"

interface Rep {
  id: string
  name: string
}

interface TouchRow {
  channel: string
  direction: string
  touched_at: string
}

interface AccountsBoardClientProps {
  accounts: Account[]
  touchesByAccount: Record<string, TouchRow[]>
  reps: Rep[]
}

// ─── Constants ───────────────────────────────────────────────────────────────

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

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(isoStr: string | null): string {
  if (!isoStr) return "Never"
  const diffMs = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function isRecentlyTouched(lastTouchedAt: string | null): boolean {
  if (!lastTouchedAt) return false
  return Date.now() - new Date(lastTouchedAt).getTime() < THREE_DAYS_MS
}

function isStale7d(lastTouchedAt: string | null): boolean {
  if (!lastTouchedAt) return true
  return Date.now() - new Date(lastTouchedAt).getTime() >= SEVEN_DAYS_MS
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType
  label: string
  value: number | string
  sub?: string
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm px-5 py-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</span>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", accent ?? "bg-indigo-50")}>
          <Icon className={cn("w-4 h-4", accent ? "text-white" : "text-indigo-600")} />
        </div>
      </div>
      <p className="text-2xl font-semibold text-zinc-900 tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-zinc-400">{sub}</p>}
    </div>
  )
}

// ─── Quadrant Panel ──────────────────────────────────────────────────────────

interface QuadrantPanelProps {
  title: string
  subtitle: string
  dotColor: string
  accounts: Account[]
  touchesByAccount: Record<string, TouchRow[]>
  repMap: Map<string, string>
}

function QuadrantPanel({
  title,
  subtitle,
  dotColor,
  accounts,
  touchesByAccount,
  repMap,
}: QuadrantPanelProps) {
  const preview = accounts.slice(0, 5)

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-100 flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <span className={cn("w-2 h-2 rounded-full shrink-0 mt-1.5", dotColor)} />
          <div>
            <p className="text-sm font-semibold text-zinc-900">{title}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <span className="shrink-0 inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-zinc-100 text-[11px] font-semibold text-zinc-600">
          {accounts.length}
        </span>
      </div>

      {/* Account rows */}
      <div className="flex-1 divide-y divide-zinc-100">
        {preview.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-xs text-zinc-400">
            No accounts in this quadrant
          </div>
        ) : (
          preview.map((account) => {
            const touchCount = touchesByAccount[account.id]?.length ?? 0
            const repName = account.assignedRepId ? repMap.get(account.assignedRepId) : null

            return (
              <Link
                key={account.id}
                href={`/accounts/${account.id}`}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 truncate">{account.name}</p>
                  {repName && (
                    <p className="text-[11px] text-zinc-400 truncate">{repName}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-zinc-500 tabular-nums">
                    {touchCount > 0 ? `${touchCount} touch${touchCount !== 1 ? "es" : ""}` : "No touches"}
                  </p>
                  <p className="text-[11px] text-zinc-400">{relativeTime(account.lastTouchedAt)}</p>
                </div>
              </Link>
            )
          })
        )}
      </div>

      {/* Footer overflow hint */}
      {accounts.length > 5 && (
        <div className="px-4 py-2 border-t border-zinc-100 text-center">
          <span className="text-[11px] text-zinc-400">+{accounts.length - 5} more</span>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AccountsBoardClient({
  accounts,
  touchesByAccount,
  reps,
}: AccountsBoardClientProps) {
  const [view, setView] = useState<ViewMode>("quadrant")
  const [search, setSearch] = useState("")
  const [stageFilter, setStageFilter] = useState<StageFilter>("all")
  const [heatFilter, setHeatFilter] = useState<HeatFilter>("all")
  const [selectedRepId, setSelectedRepId] = useState<string>("all")

  const repMap = useMemo(
    () => new Map(reps.map((r) => [r.id, r.name])),
    [reps]
  )

  const filteredAccounts = useMemo(() => {
    let base = accounts

    if (selectedRepId !== "all")
      base = base.filter((a) => a.assignedRepId === selectedRepId)

    if (stageFilter !== "all")
      base = base.filter((a) => a.status === stageFilter)

    if (heatFilter === "hot") base = base.filter((a) => a.heatScore >= 60)
    else if (heatFilter === "warm") base = base.filter((a) => a.heatScore >= 30 && a.heatScore < 60)
    else if (heatFilter === "cold") base = base.filter((a) => a.heatScore < 30)

    if (search.trim()) {
      const q = search.toLowerCase()
      base = base.filter((a) => a.name.toLowerCase().includes(q))
    }

    return [...base].sort((a, b) => b.heatScore - a.heatScore)
  }, [accounts, selectedRepId, stageFilter, heatFilter, search])

  const stats = useMemo(() => ({
    total: filteredAccounts.length,
    hot: filteredAccounts.filter((a) => a.heatScore >= 60).length,
    stale: filteredAccounts.filter((a) => isStale7d(a.lastTouchedAt)).length,
    pipeline: filteredAccounts.filter(
      (a) => a.status === "qualified" || a.status === "pipeline"
    ).length,
  }), [filteredAccounts])

  const quadrants = useMemo(() => ({
    hotActive: filteredAccounts.filter(
      (a) => a.heatScore >= 60 && isRecentlyTouched(a.lastTouchedAt)
    ),
    hotStale: filteredAccounts.filter(
      (a) => a.heatScore >= 60 && !isRecentlyTouched(a.lastTouchedAt)
    ),
    warmActive: filteredAccounts.filter(
      (a) => a.heatScore >= 30 && a.heatScore < 60 && isRecentlyTouched(a.lastTouchedAt)
    ),
    warmStale: filteredAccounts.filter(
      (a) => a.heatScore >= 30 && a.heatScore < 60 && !isRecentlyTouched(a.lastTouchedAt)
    ),
  }), [filteredAccounts])

  const selectCls =
    "h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"

  return (
    <div className="flex flex-col gap-6">

      {/* Page title */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Accounts</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {filteredAccounts.length} account{filteredAccounts.length !== 1 ? "s" : ""}
          {selectedRepId !== "all" && ` · ${repMap.get(selectedRepId) ?? "Rep"}`}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          label="Total Accounts"
          value={stats.total}
          sub="matching current filters"
        />
        <StatCard
          icon={Flame}
          label="Hot Accounts"
          value={stats.hot}
          sub="heat score ≥ 60"
          accent="bg-orange-500"
        />
        <StatCard
          icon={Clock}
          label="Stale 7+ Days"
          value={stats.stale}
          sub="no touch in 7 days"
          accent="bg-amber-500"
        />
        <StatCard
          icon={Target}
          label="In Pipeline"
          value={stats.pipeline}
          sub="qualified or pipeline status"
          accent="bg-indigo-600"
        />
      </div>

      {/* Filters + view toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-52 rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-700 shadow-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
          />
        </div>

        {/* Stage filter */}
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value as StageFilter)}
          className={selectCls}
        >
          <option value="all">All Stages</option>
          {(Object.keys(STATUS_LABELS) as AccountStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>

        {/* Heat filter */}
        <select
          value={heatFilter}
          onChange={(e) => setHeatFilter(e.target.value as HeatFilter)}
          className={selectCls}
        >
          <option value="all">All Heat</option>
          <option value="hot">Hot ≥ 60</option>
          <option value="warm">Warm 30–59</option>
          <option value="cold">Cold &lt; 30</option>
        </select>

        {/* Rep filter */}
        <select
          value={selectedRepId}
          onChange={(e) => setSelectedRepId(e.target.value)}
          className={selectCls}
        >
          <option value="all">All Reps</option>
          {reps.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        {/* View toggle — pushed right */}
        <div className="ml-auto flex items-center rounded-lg border border-zinc-200 bg-white shadow-sm overflow-hidden">
          {(
            [
              { mode: "quadrant" as ViewMode, icon: LayoutGrid, label: "Quadrant" },
              { mode: "table"    as ViewMode, icon: Table2,     label: "Table"    },
              { mode: "patterns" as ViewMode, icon: BarChart3,  label: "Patterns" },
            ] as const
          ).map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setView(mode)}
              className={cn(
                "flex items-center gap-1.5 px-3 h-9 text-sm font-medium transition-colors",
                view === mode
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-500 hover:bg-zinc-50"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Quadrant view ── */}
      {view === "quadrant" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuadrantPanel
            title="Hot & Active"
            subtitle="High-priority accounts with recent activity"
            dotColor="bg-red-500"
            accounts={quadrants.hotActive}
            touchesByAccount={touchesByAccount}
            repMap={repMap}
          />
          <QuadrantPanel
            title="Hot & Stale"
            subtitle="High-priority accounts needing attention"
            dotColor="bg-red-400"
            accounts={quadrants.hotStale}
            touchesByAccount={touchesByAccount}
            repMap={repMap}
          />
          <QuadrantPanel
            title="Warm & Active"
            subtitle="Building momentum"
            dotColor="bg-amber-500"
            accounts={quadrants.warmActive}
            touchesByAccount={touchesByAccount}
            repMap={repMap}
          />
          <QuadrantPanel
            title="Warm & Stale"
            subtitle="Risk of cooling down"
            dotColor="bg-amber-400"
            accounts={quadrants.warmStale}
            touchesByAccount={touchesByAccount}
            repMap={repMap}
          />
        </div>
      )}

      {/* ── Table view ── */}
      {view === "table" && (
        filteredAccounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-400 gap-2">
            <Building2 className="w-8 h-8 opacity-30" />
            <p className="text-sm">No accounts found</p>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="grid grid-cols-[1fr_80px_80px_120px_96px_28px] gap-3 px-4 py-2.5 bg-zinc-50 border-b border-zinc-200 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
              <span>Account</span>
              <span className="text-right">Heat</span>
              <span className="text-right">Progress</span>
              <span>Activity (7d)</span>
              <span>Status</span>
              <span />
            </div>

            {filteredAccounts.map((account, i) => {
              const touches = touchesByAccount[account.id] ?? []
              const repName = account.assignedRepId
                ? repMap.get(account.assignedRepId)
                : null

              return (
                <Link
                  key={account.id}
                  href={`/accounts/${account.id}`}
                  className={cn(
                    "grid grid-cols-[1fr_80px_80px_120px_96px_28px] gap-3 px-4 py-3 items-center hover:bg-zinc-50 transition-colors",
                    i > 0 && "border-t border-zinc-100"
                  )}
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-semibold text-zinc-900 truncate">{account.name}</span>
                    {repName && (
                      <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {repName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-1">
                    <Flame
                      className={cn(
                        "w-3.5 h-3.5",
                        account.heatScore >= 60 ? "text-orange-500" : "text-zinc-300"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-medium tabular-nums",
                        account.heatScore >= 60 ? "text-orange-600" : "text-zinc-400"
                      )}
                    >
                      {account.heatScore}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-1">
                    <TrendingUp
                      className={cn(
                        "w-3.5 h-3.5",
                        account.progressScore >= 50 ? "text-indigo-500" : "text-zinc-300"
                      )}
                    />
                    <span
                      className={cn(
                        "text-sm font-medium tabular-nums",
                        account.progressScore >= 50 ? "text-indigo-600" : "text-zinc-400"
                      )}
                    >
                      {account.progressScore}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <AccountPulse touches={touches} width={120} height={32} />
                  </div>

                  <div>
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium",
                        STATUS_COLORS[account.status as AccountStatus] ??
                          "bg-zinc-100 text-zinc-500"
                      )}
                    >
                      {STATUS_LABELS[account.status as AccountStatus] ?? account.status}
                    </span>
                  </div>

                  <ChevronRight className="w-4 h-4 text-zinc-300" />
                </Link>
              )
            })}
          </div>
        )
      )}

      {/* ── Patterns view ── */}
      {view === "patterns" && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 rounded-xl border border-zinc-200 bg-white shadow-sm">
          <BarChart3 className="w-10 h-10 text-zinc-300" />
          <p className="text-sm font-medium text-zinc-500">Patterns view coming soon</p>
          <p className="text-xs text-zinc-400">Engagement trends and channel breakdowns will appear here.</p>
        </div>
      )}
    </div>
  )
}
