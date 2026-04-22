"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Building2, Filter, Search, TrendingUp, Clock, Phone, Mail, Calendar, Linkedin, ChevronRight } from "lucide-react"
import { AppHeader } from "@/components/shell/app-header"
import { useMobileSidebar } from "@/components/shell/app-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Account, Rep, AccountStage, AccountHeat, TouchChannel } from "@/types"

interface AccountsBoardClientProps {
  accounts: Account[]
  reps: Rep[]
}

// Channel icon mapping
const channelIcons: Record<TouchChannel, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  linkedin: Linkedin,
  sms: Mail,
}

// Channel colors
const channelColors: Record<TouchChannel, string> = {
  call: "text-green-600 bg-green-50",
  email: "text-blue-600 bg-blue-50",
  meeting: "text-purple-600 bg-purple-50",
  linkedin: "text-sky-600 bg-sky-50",
  sms: "text-orange-600 bg-orange-50",
}

// Heat colors
const heatColors: Record<AccountHeat, string> = {
  hot: "bg-red-500",
  warm: "bg-amber-500",
  cold: "bg-slate-400",
}

const heatBadgeColors: Record<AccountHeat, string> = {
  hot: "bg-red-100 text-red-700 border-red-200",
  warm: "bg-amber-100 text-amber-700 border-amber-200",
  cold: "bg-slate-100 text-slate-600 border-slate-200",
}

// Stage display
const stageLabels: Record<AccountStage, string> = {
  prospecting: "Prospecting",
  discovery: "Discovery",
  evaluation: "Evaluation",
  negotiation: "Negotiation",
  "closed-won": "Closed Won",
  "closed-lost": "Closed Lost",
}

const stageColors: Record<AccountStage, string> = {
  prospecting: "bg-slate-100 text-slate-700",
  discovery: "bg-blue-100 text-blue-700",
  evaluation: "bg-purple-100 text-purple-700",
  negotiation: "bg-amber-100 text-amber-700",
  "closed-won": "bg-green-100 text-green-700",
  "closed-lost": "bg-red-100 text-red-700",
}

export function AccountsBoardClient({ accounts, reps }: AccountsBoardClientProps) {
  const { toggle } = useMobileSidebar()
  const [search, setSearch] = useState("")
  const [stageFilter, setStageFilter] = useState<string>("all")
  const [heatFilter, setHeatFilter] = useState<string>("all")
  const [repFilter, setRepFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"quadrant" | "table">("quadrant")

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      if (search && !acc.name.toLowerCase().includes(search.toLowerCase())) return false
      if (stageFilter !== "all" && acc.stage !== stageFilter) return false
      if (heatFilter !== "all" && acc.heat !== heatFilter) return false
      if (repFilter !== "all" && acc.ownerId !== repFilter) return false
      return true
    })
  }, [accounts, search, stageFilter, heatFilter, repFilter])

  // Group accounts by quadrant (Heat x Progress)
  const quadrants = useMemo(() => {
    const hot = filteredAccounts.filter(a => a.heat === "hot")
    const warm = filteredAccounts.filter(a => a.heat === "warm")
    const cold = filteredAccounts.filter(a => a.heat === "cold")
    
    // Further split by activity (active = touched in last 3 days, stale = not)
    const isActive = (a: Account) => a.daysSinceLastTouch <= 3
    
    return {
      hotActive: hot.filter(isActive),
      hotStale: hot.filter(a => !isActive(a)),
      warmActive: warm.filter(isActive),
      warmStale: warm.filter(a => !isActive(a)),
      coldActive: cold.filter(isActive),
      coldStale: cold.filter(a => !isActive(a)),
    }
  }, [filteredAccounts])

  // Summary stats
  const stats = useMemo(() => ({
    total: filteredAccounts.length,
    hot: filteredAccounts.filter(a => a.heat === "hot").length,
    stale: filteredAccounts.filter(a => a.daysSinceLastTouch > 7).length,
    pipeline: filteredAccounts.reduce((sum, a) => sum + (a.pipelineValue || 0), 0),
  }), [filteredAccounts])

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <AppHeader
        title="Accounts"
        subtitle={`${stats.total} accounts · $${(stats.pipeline / 1000).toFixed(0)}k pipeline`}
        onMenuClick={toggle}
      />

      <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search accounts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="prospecting">Prospecting</SelectItem>
              <SelectItem value="discovery">Discovery</SelectItem>
              <SelectItem value="evaluation">Evaluation</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="closed-won">Closed Won</SelectItem>
              <SelectItem value="closed-lost">Closed Lost</SelectItem>
            </SelectContent>
          </Select>

          <Select value={heatFilter} onValueChange={setHeatFilter}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue placeholder="Heat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Heat</SelectItem>
              <SelectItem value="hot">Hot</SelectItem>
              <SelectItem value="warm">Warm</SelectItem>
              <SelectItem value="cold">Cold</SelectItem>
            </SelectContent>
          </Select>

          <Select value={repFilter} onValueChange={setRepFilter}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reps</SelectItem>
              {reps.map(rep => (
                <SelectItem key={rep.id} value={rep.id}>{rep.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant={viewMode === "quadrant" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("quadrant")}
              className="h-9"
            >
              Quadrant
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-9"
            >
              Table
            </Button>
            <Link href="/accounts/patterns">
              <Button variant="outline" size="sm" className="h-9 gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Patterns
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total Accounts</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Hot Accounts</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.hot}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Stale (7+ days)</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.stale}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Pipeline Value</p>
            <p className="text-2xl font-bold text-foreground mt-1">${(stats.pipeline / 1000).toFixed(0)}k</p>
          </div>
        </div>

        {/* Quadrant View */}
        {viewMode === "quadrant" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Hot + Active */}
            <QuadrantCard
              title="Hot & Active"
              description="High-priority accounts with recent activity"
              accounts={quadrants.hotActive}
              accentColor="bg-red-500"
            />
            
            {/* Hot + Stale */}
            <QuadrantCard
              title="Hot & Stale"
              description="High-priority accounts needing attention"
              accounts={quadrants.hotStale}
              accentColor="bg-red-500"
              warning
            />
            
            {/* Warm + Active */}
            <QuadrantCard
              title="Warm & Active"
              description="Building momentum"
              accounts={quadrants.warmActive}
              accentColor="bg-amber-500"
            />
            
            {/* Warm + Stale */}
            <QuadrantCard
              title="Warm & Stale"
              description="Risk of cooling down"
              accounts={quadrants.warmStale}
              accentColor="bg-amber-500"
              warning
            />
          </div>
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Account</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Stage</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Heat</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Owner</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-4 py-3">Touches (7d)</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Last Touch</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Pipeline</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAccounts.map(account => (
                  <tr key={account.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/accounts/${account.id}`} className="flex items-center gap-3 group">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-foreground">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{account.name}</p>
                          <p className="text-xs text-muted-foreground">{account.industry}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn("text-xs", stageColors[account.stage])}>
                        {stageLabels[account.stage]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", heatColors[account.heat])} />
                        <span className="text-sm capitalize">{account.heat}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">{account.ownerName}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-medium">{account.touchesLast7Days}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className={cn(
                          "text-sm",
                          account.daysSinceLastTouch > 7 ? "text-amber-600" : "text-muted-foreground"
                        )}>
                          {account.daysSinceLastTouch === 0 ? "Today" : `${account.daysSinceLastTouch}d ago`}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium">
                        {account.pipelineValue ? `$${(account.pipelineValue / 1000).toFixed(0)}k` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/accounts/${account.id}`}>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

// Quadrant card component
function QuadrantCard({ 
  title, 
  description, 
  accounts, 
  accentColor,
  warning = false 
}: { 
  title: string
  description: string
  accounts: Account[]
  accentColor: string
  warning?: boolean
}) {
  return (
    <div className={cn(
      "rounded-lg border bg-card overflow-hidden",
      warning ? "border-amber-200" : "border-border"
    )}>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <div className={cn("w-2 h-2 rounded-full", accentColor)} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Badge variant="secondary" className="text-xs">{accounts.length}</Badge>
      </div>
      <div className="divide-y divide-border max-h-[280px] overflow-y-auto">
        {accounts.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            No accounts in this quadrant
          </div>
        ) : (
          accounts.map(account => (
            <Link
              key={account.id}
              href={`/accounts/${account.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-foreground shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{account.name}</p>
                <p className="text-xs text-muted-foreground">{account.ownerName}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-medium text-foreground">{account.touchesLast7Days} touches</p>
                <p className={cn(
                  "text-xs",
                  account.daysSinceLastTouch > 3 ? "text-amber-600" : "text-muted-foreground"
                )}>
                  {account.daysSinceLastTouch === 0 ? "Today" : `${account.daysSinceLastTouch}d ago`}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
