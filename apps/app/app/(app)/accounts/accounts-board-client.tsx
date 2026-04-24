"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Flame,
  TrendingUp,
  ChevronRight,
  Building2,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AccountPulse } from "@/components/accounts/account-pulse"
import type { Account, AccountTouch, AccountStatus } from "@/types"

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

interface QuadrantCardProps {
  label: string
  count: number
  description: string
  active: boolean
  color: string
}

function QuadrantCard({ label, count, description, active, color }: QuadrantCardProps) {
  return (
    <div className={cn("rounded-lg border p-4 flex flex-col gap-1", active ? "border-border" : "border-border/50 opacity-70")}>
      <div className="flex items-center gap-2">
        <span className={cn("w-2 h-2 rounded-full shrink-0", color)} />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-2xl font-semibold tabular-nums">{count}</p>
      <p className="text-[11px] text-muted-foreground">{description}</p>
    </div>
  )
}

export function AccountsBoardClient({
  accounts,
  touchesByAccount,
  reps,
}: AccountsBoardClientProps) {
  const [selectedRepId, setSelectedRepId] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"heat" | "progress" | "name">("heat")

  const filteredAccounts = useMemo(() => {
    const base =
      selectedRepId === "all"
        ? accounts
        : accounts.filter((a) => a.assignedRepId === selectedRepId)

    return [...base].sort((a, b) => {
      if (sortBy === "heat") return b.heatScore - a.heatScore
      if (sortBy === "progress") return b.progressScore - a.progressScore
      return a.name.localeCompare(b.name)
    })
  }, [accounts, selectedRepId, sortBy])

  const quadrantCounts = useMemo(() => {
    return {
      hotActive: filteredAccounts.filter((a) => a.heatScore >= 60 && a.progressScore >= 50).length,
      hotStale: filteredAccounts.filter((a) => a.heatScore >= 60 && a.progressScore < 50).length,
      warmActive: filteredAccounts.filter((a) => a.heatScore < 60 && a.progressScore >= 50).length,
      warmStale: filteredAccounts.filter((a) => a.heatScore < 60 && a.progressScore < 50).length,
    }
  }, [filteredAccounts])

  const repMap = useMemo(
    () => new Map(reps.map((r) => [r.id, r.name])),
    [reps]
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Accounts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filteredAccounts.length} account{filteredAccounts.length !== 1 ? "s" : ""}
            {selectedRepId !== "all" && ` · ${repMap.get(selectedRepId) ?? "Rep"}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Rep filter */}
          <select
            value={selectedRepId}
            onChange={(e) => setSelectedRepId(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Reps</option>
            {reps.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "heat" | "progress" | "name")}
            className="h-8 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="heat">Sort: Heat</option>
            <option value="progress">Sort: Progress</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>
      </div>

      {/* Quadrant summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuadrantCard
          label="Hot & Active"
          count={quadrantCounts.hotActive}
          description="heat ≥ 60, progress ≥ 50"
          active={quadrantCounts.hotActive > 0}
          color="bg-orange-500"
        />
        <QuadrantCard
          label="Hot & Stale"
          count={quadrantCounts.hotStale}
          description="heat ≥ 60, progress < 50"
          active={quadrantCounts.hotStale > 0}
          color="bg-red-400"
        />
        <QuadrantCard
          label="Warm & Active"
          count={quadrantCounts.warmActive}
          description="heat < 60, progress ≥ 50"
          active={quadrantCounts.warmActive > 0}
          color="bg-blue-400"
        />
        <QuadrantCard
          label="Warm & Stale"
          count={quadrantCounts.warmStale}
          description="heat < 60, progress < 50"
          active={quadrantCounts.warmStale > 0}
          color="bg-zinc-400"
        />
      </div>

      {/* Account list */}
      {filteredAccounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <Building2 className="w-8 h-8 opacity-30" />
          <p className="text-sm">No accounts found</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_80px_80px_120px_96px_28px] gap-3 px-4 py-2 bg-muted/40 border-b border-border text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
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
                  "grid grid-cols-[1fr_80px_80px_120px_96px_28px] gap-3 px-4 py-3 items-center hover:bg-muted/30 transition-colors",
                  i > 0 && "border-t border-border/60"
                )}
              >
                {/* Name + rep */}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-medium truncate">{account.name}</span>
                  {repName && (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {repName}
                    </span>
                  )}
                </div>

                {/* Heat score */}
                <div className="flex items-center justify-end gap-1">
                  <Flame
                    className={cn(
                      "w-3.5 h-3.5",
                      account.heatScore >= 60 ? "text-orange-500" : "text-zinc-400"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium tabular-nums",
                      account.heatScore >= 60 ? "text-orange-600" : "text-muted-foreground"
                    )}
                  >
                    {account.heatScore}
                  </span>
                </div>

                {/* Progress score */}
                <div className="flex items-center justify-end gap-1">
                  <TrendingUp
                    className={cn(
                      "w-3.5 h-3.5",
                      account.progressScore >= 50 ? "text-blue-500" : "text-zinc-400"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium tabular-nums",
                      account.progressScore >= 50 ? "text-blue-600" : "text-muted-foreground"
                    )}
                  >
                    {account.progressScore}
                  </span>
                </div>

                {/* Sparkline */}
                <div className="flex items-center">
                  <AccountPulse touches={touches} width={120} height={32} />
                </div>

                {/* Status badge */}
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

                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
