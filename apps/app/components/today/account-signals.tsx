"use client"

import Link from "next/link"
import { Building2, AlertTriangle, TrendingUp, Clock, ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Account, AccountHeat } from "@/types"

interface AccountSignalsProps {
  accounts: Account[]
}

// Heat colors
const heatColors: Record<AccountHeat, string> = {
  hot: "bg-red-500",
  warm: "bg-amber-500",
  cold: "bg-slate-400",
}

export function AccountSignals({ accounts }: AccountSignalsProps) {
  // Find accounts needing attention
  const staleHotAccounts = accounts.filter(a => a.heat === "hot" && a.daysSinceLastTouch > 3)
  const staleWarmAccounts = accounts.filter(a => a.heat === "warm" && a.daysSinceLastTouch > 5)
  const allStale = [...staleHotAccounts, ...staleWarmAccounts].sort((a, b) => {
    const heatOrder = { hot: 0, warm: 1, cold: 2 }
    if (heatOrder[a.heat] !== heatOrder[b.heat]) return heatOrder[a.heat] - heatOrder[b.heat]
    return b.daysSinceLastTouch - a.daysSinceLastTouch
  })

  if (allStale.length === 0) {
    return null
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/50 overflow-hidden">
      <div className="px-5 py-4 border-b border-amber-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 text-amber-600">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Stale Accounts</h3>
            <p className="text-xs text-muted-foreground">Hot/warm accounts needing follow-up</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
          {allStale.length} accounts
        </Badge>
      </div>

      <div className="divide-y divide-amber-100">
        {allStale.slice(0, 4).map(account => (
          <Link
            key={account.id}
            href={`/accounts/${account.id}`}
            className="flex items-center gap-3 px-5 py-3 hover:bg-amber-50 transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-amber-200 text-muted-foreground shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground truncate">{account.name}</p>
                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", heatColors[account.heat])} />
              </div>
              <p className="text-xs text-muted-foreground">{account.ownerName}</p>
            </div>
            <div className="flex items-center gap-1 text-amber-600 shrink-0">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{account.daysSinceLastTouch}d</span>
            </div>
          </Link>
        ))}
      </div>

      {allStale.length > 4 && (
        <div className="px-5 py-3 border-t border-amber-200">
          <Link href="/accounts?heat=hot&stale=true">
            <Button variant="ghost" size="sm" className="w-full h-8 text-xs gap-1 text-amber-700 hover:text-amber-800 hover:bg-amber-100">
              View all {allStale.length} stale accounts
              <ArrowUpRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
