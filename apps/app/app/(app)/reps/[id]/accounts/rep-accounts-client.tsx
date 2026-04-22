"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ChevronLeft, Search, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import { AppHeader } from "@/components/shell/app-header"
import { useMobileSidebar } from "@/components/shell/app-shell"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AccountPulse } from "@/components/accounts/account-pulse"
import { cn } from "@/lib/utils"
import type { Rep, Account, AccountTouch, AccountStage, AccountHeat } from "@/types"

interface RepAccountsClientProps {
  rep: Rep
  accounts: Account[]
  touchesByAccount: Record<string, AccountTouch[]>
}

const stageLabels: Record<AccountStage, string> = {
  prospecting: "Prospecting",
  discovery: "Discovery",
  evaluation: "Evaluation",
  negotiation: "Negotiation",
  "closed-won": "Closed Won",
  "closed-lost": "Closed Lost",
}

const heatColors: Record<AccountHeat, string> = {
  hot: "bg-red-500",
  warm: "bg-amber-500",
  cold: "bg-slate-400",
}

const heatBadgeColors: Record<AccountHeat, string> = {
  hot: "bg-red-100 text-red-700",
  warm: "bg-amber-100 text-amber-700",
  cold: "bg-slate-100 text-slate-700",
}

export function RepAccountsClient({
  rep,
  accounts,
  touchesByAccount,
}: RepAccountsClientProps) {
  const { toggle } = useMobileSidebar()
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [heatFilter, setHeatFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"last_touched" | "heat" | "stalled">("last_touched")

  // Filter and sort accounts
  const filteredAccounts = useMemo(() => {
    let result = [...accounts]

    // Search
    if (search) {
      result = result.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(a => a.stage === statusFilter)
    }

    // Heat filter
    if (heatFilter !== "all") {
      if (heatFilter === "hot_high") result = result.filter(a => a.heat === "hot" && (a.winProbability || 0) >= 60)
      else if (heatFilter === "cooling") result = result.filter(a => (a.winProbability || 0) >= 30 && (a.winProbability || 0) < 60)
      else if (heatFilter === "cold") result = result.filter(a => (a.winProbability || 0) < 30)
    }

    // Sort
    if (sortBy === "last_touched") {
      result.sort((a, b) => {
        const aTime = new Date(a.lastTouchAt || 0).getTime()
        const bTime = new Date(b.lastTouchAt || 0).getTime()
        return bTime - aTime
      })
    } else if (sortBy === "heat") {
      result.sort((a, b) => {
        const heatOrder = { hot: 0, warm: 1, cold: 2 }
        return heatOrder[a.heat] - heatOrder[b.heat]
      })
    } else if (sortBy === "stalled") {
      result.sort((a, b) => b.daysSinceLastTouch - a.daysSinceLastTouch)
    }

    return result
  }, [accounts, search, statusFilter, heatFilter, sortBy])

  // Summary stats
  const stats = {
    hot: filteredAccounts.filter(a => a.heat === "hot").length,
    cooling: filteredAccounts.filter(a => (a.winProbability || 0) >= 30 && (a.winProbability || 0) < 60).length,
    new: filteredAccounts.filter(a => {
      const days = Math.floor((new Date().getTime() - new Date(a.createdAt).getTime()) / (24 * 60 * 60 * 1000))
      return days <= 7
    }).length,
    avgTouches: Math.round(
      filteredAccounts.reduce((sum, a) => sum + (touchesByAccount[a.id]?.length || 0), 0) / filteredAccounts.length
    ),
  }

  // Format relative time
  const formatRelativeTime = (date: string) => {
    const diff = new Date().getTime() - new Date(date).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (hours < 1) return "now"
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AppHeader title={rep.name} subtitle={`${rep.role} · Accounts`} onMenuClick={toggle} />

      <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <Link
          href={`/reps/${rep.id}`}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Rep Profile
        </Link>

        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-2xl font-bold text-red-600">{stats.hot}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Hot accounts</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-2xl font-bold text-amber-600">{stats.cooling}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Cooling</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
            <p className="text-xs text-muted-foreground mt-0.5">New this week</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <p className="text-2xl font-bold text-foreground">{stats.avgTouches}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Avg touches/account</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Search accounts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-48 h-9"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-md border border-border bg-background text-sm"
          >
            <option value="all">All stages</option>
            <option value="prospecting">Prospecting</option>
            <option value="discovery">Discovery</option>
            <option value="evaluation">Evaluation</option>
            <option value="negotiation">Negotiation</option>
          </select>
          <select
            value={heatFilter}
            onChange={e => setHeatFilter(e.target.value)}
            className="h-9 px-3 rounded-md border border-border bg-background text-sm"
          >
            <option value="all">All heat</option>
            <option value="hot_high">Hot (≥60%)</option>
            <option value="cooling">Cooling (30-59%)</option>
            <option value="cold">Cold (&lt;30%)</option>
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="h-9 px-3 rounded-md border border-border bg-background text-sm"
          >
            <option value="last_touched">Last touched</option>
            <option value="heat">Heat (desc)</option>
            <option value="stalled">Days stalled</option>
          </select>
        </div>

        {/* Account list */}
        <div className="space-y-2">
          {filteredAccounts.map(account => {
            const touches = touchesByAccount[account.id] || []
            const isExpanded = expandedId === account.id

            return (
              <div
                key={account.id}
                className="rounded-lg border border-border bg-card hover:border-border/80 transition-colors"
              >
                {/* Account card header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : account.id)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs font-semibold bg-blue-100 text-blue-700">
                        {account.name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-foreground truncate">{account.name}</p>
                        <div className={cn("w-2 h-2 rounded-full flex-shrink-0", heatColors[account.heat])} />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{account.domain}</p>
                    </div>
                  </div>

                  {/* Pulse - centered */}
                  <div className="flex-shrink-0 mx-2">
                    <AccountPulse touches={touches} width={100} height={24} />
                  </div>

                  {/* Right side info */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {stageLabels[account.stage]}
                    </Badge>
                    <Badge className={cn("text-xs", heatBadgeColors[account.heat])}>
                      {Math.round((account.winProbability || 0))}%
                    </Badge>
                    <div className="text-xs text-muted-foreground w-12 text-right">
                      {touches.length} touches
                    </div>
                    <div className="text-xs text-muted-foreground w-16 text-right">
                      {formatRelativeTime(account.lastTouchAt || account.createdAt)}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 flex-shrink-0" />
                    )}
                  </div>
                </button>

                {/* Expanded view */}
                {isExpanded && (
                  <div className="border-t border-border px-4 py-3 bg-muted/20 space-y-3">
                    {/* Channel mix */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Channel mix (last 30 days)</p>
                      <div className="flex gap-1 h-2 rounded-full bg-muted overflow-hidden">
                        {(() => {
                          const channelCounts = touches.reduce((acc, t) => {
                            acc[t.channel] = (acc[t.channel] || 0) + 1
                            return acc
                          }, {} as Record<string, number>)
                          const total = touches.length
                          const colors: Record<string, string> = {
                            email: "bg-blue-500",
                            call: "bg-green-500",
                            linkedin: "bg-sky-600",
                            meeting: "bg-purple-500",
                            sms: "bg-orange-500",
                          }
                          return Object.entries(channelCounts).map(([channel, count]) => (
                            <div
                              key={channel}
                              className={cn("flex-1", colors[channel])}
                              title={`${channel}: ${count}`}
                            />
                          ))
                        })()}
                      </div>
                    </div>

                    {/* Touch list */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Recent touches</p>
                      <div className="space-y-1 max-h-64 overflow-y-auto">
                        {touches.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-2">No touches in the last 30 days</p>
                        ) : (
                          touches
                            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                            .map((touch, idx) => (
                              <div key={touch.id} className="text-xs py-1 flex gap-2">
                                <span className="text-muted-foreground flex-shrink-0 w-12">
                                  {formatRelativeTime(touch.timestamp)}
                                </span>
                                <span className="capitalize text-muted-foreground flex-shrink-0">{touch.channel}</span>
                                <span className="text-foreground flex-1 truncate">{touch.subject}</span>
                              </div>
                            ))
                        )}
                      </div>
                    </div>

                    {/* Open button */}
                    <Link
                      href={`/accounts/${account.id}`}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                    >
                      Open full account view
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
