"use client"

import Link from "next/link"
import { Building2, Clock, TrendingUp, ArrowUpRight, Phone, Mail, Calendar, Linkedin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Account, TouchChannel, AccountStage, AccountHeat } from "@/types"

interface RepAccountsProps {
  accounts: Account[]
  repName: string
  pattern?: {
    avgTouchesToMeeting: number
    avgDaysToMeeting: number
    conversionRate: number
    winRate: number
  }
}

// Channel styling
const channelIcons: Record<TouchChannel, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  linkedin: Linkedin,
  sms: Mail,
}

// Heat colors
const heatColors: Record<AccountHeat, string> = {
  hot: "bg-red-500",
  warm: "bg-amber-500",
  cold: "bg-slate-400",
}

// Stage colors
const stageColors: Record<AccountStage, string> = {
  prospecting: "bg-slate-100 text-slate-700",
  discovery: "bg-blue-100 text-blue-700",
  evaluation: "bg-purple-100 text-purple-700",
  negotiation: "bg-amber-100 text-amber-700",
  "closed-won": "bg-green-100 text-green-700",
  "closed-lost": "bg-red-100 text-red-700",
}

const stageLabels: Record<AccountStage, string> = {
  prospecting: "Prospecting",
  discovery: "Discovery",
  evaluation: "Evaluation",
  negotiation: "Negotiation",
  "closed-won": "Closed Won",
  "closed-lost": "Closed Lost",
}

export function RepAccounts({ accounts, repName, pattern }: RepAccountsProps) {
  // Sort accounts: hot first, then by days since last touch
  const sortedAccounts = [...accounts].sort((a, b) => {
    const heatOrder = { hot: 0, warm: 1, cold: 2 }
    if (heatOrder[a.heat] !== heatOrder[b.heat]) {
      return heatOrder[a.heat] - heatOrder[b.heat]
    }
    return a.daysSinceLastTouch - b.daysSinceLastTouch
  })

  // Highlight stale accounts
  const staleAccounts = accounts.filter(a => a.daysSinceLastTouch > 7)
  const hotAccounts = accounts.filter(a => a.heat === "hot")
  const totalPipeline = accounts.reduce((sum, a) => sum + (a.pipelineValue || 0), 0)

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            Account Engagement
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {accounts.length} accounts · ${(totalPipeline / 1000).toFixed(0)}k pipeline
          </p>
        </div>
        <Link href={`/accounts?rep=${accounts[0]?.ownerId || ''}`}>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
            View All
            <ArrowUpRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
        <div className="px-4 py-3 text-center">
          <p className="text-lg font-bold text-red-600">{hotAccounts.length}</p>
          <p className="text-[10px] text-muted-foreground">Hot</p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className={cn(
            "text-lg font-bold",
            staleAccounts.length > 0 ? "text-amber-600" : "text-foreground"
          )}>
            {staleAccounts.length}
          </p>
          <p className="text-[10px] text-muted-foreground">Stale (7+ days)</p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="text-lg font-bold text-foreground">{pattern?.winRate || 0}%</p>
          <p className="text-[10px] text-muted-foreground">Win Rate</p>
        </div>
      </div>

      {/* Account list */}
      <div className="divide-y divide-border max-h-[320px] overflow-y-auto">
        {sortedAccounts.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            No accounts assigned
          </div>
        ) : (
          sortedAccounts.slice(0, 5).map(account => (
            <Link
              key={account.id}
              href={`/accounts/${account.id}`}
              className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted text-muted-foreground shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">{account.name}</p>
                  <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", heatColors[account.heat])} />
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4", stageColors[account.stage])}>
                    {stageLabels[account.stage]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{account.touchesLast7Days} touches this week</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className={cn(
                  "text-xs font-medium",
                  account.daysSinceLastTouch > 7 ? "text-amber-600" : "text-muted-foreground"
                )}>
                  {account.daysSinceLastTouch === 0 ? "Today" : `${account.daysSinceLastTouch}d ago`}
                </p>
                {account.pipelineValue && (
                  <p className="text-xs text-muted-foreground">${(account.pipelineValue / 1000).toFixed(0)}k</p>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pattern insight */}
      {pattern && (
        <div className="px-5 py-3 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>
              Avg <span className="font-medium text-foreground">{pattern.avgTouchesToMeeting}</span> touches in{" "}
              <span className="font-medium text-foreground">{pattern.avgDaysToMeeting}d</span> to book meetings
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
