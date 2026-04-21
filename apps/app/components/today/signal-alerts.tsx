"use client"

import Link from "next/link"
import { TrendingUp, AlertTriangle, Zap, TrendingDown, Star, Eye } from "lucide-react"
import type { ManagerSignal, SignalType } from "@/lib/signal-generator"
import { cn } from "@/lib/utils"

interface SignalAlertsProps {
  signals: ManagerSignal[]
}

const signalConfig: Record<
  SignalType,
  {
    icon: React.ReactNode
    bg: string
    border: string
    label: string
    labelColor: string
  }
> = {
  momentum: {
    icon: <TrendingUp className="w-4 h-4" />,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    label: "Trending up",
    labelColor: "text-emerald-700 bg-emerald-100",
  },
  risk: {
    icon: <AlertTriangle className="w-4 h-4" />,
    bg: "bg-amber-50",
    border: "border-amber-200",
    label: "At risk",
    labelColor: "text-amber-700 bg-amber-100",
  },
  "efficiency-issue": {
    icon: <Zap className="w-4 h-4" />,
    bg: "bg-orange-50",
    border: "border-orange-200",
    label: "Activity mismatch",
    labelColor: "text-orange-700 bg-orange-100",
  },
  "drop-off": {
    icon: <TrendingDown className="w-4 h-4" />,
    bg: "bg-red-50",
    border: "border-red-200",
    label: "Drop-off",
    labelColor: "text-red-700 bg-red-100",
  },
  "positive-outlier": {
    icon: <Star className="w-4 h-4" />,
    bg: "bg-blue-50",
    border: "border-blue-200",
    label: "Positive outlier",
    labelColor: "text-blue-700 bg-blue-100",
  },
}

export function SignalAlerts({ signals }: SignalAlertsProps) {
  if (signals.length === 0) {
    return null
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-4 h-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-foreground">Manager Intelligence</h2>
        <span className="text-xs text-muted-foreground">({signals.length} signal{signals.length === 1 ? "" : "s"})</span>
      </div>

      <div className="flex flex-col gap-3">
        {signals.map((signal) => {
          const config = signalConfig[signal.type]

          return (
            <Link
              key={signal.id}
              href={`/reps/${signal.repId}`}
              className={cn(
                "group flex items-start gap-3 p-4 rounded-xl border transition-all",
                "bg-card hover:shadow-md hover:border-primary/20",
                config.border
              )}
            >
              {/* Icon */}
              <div className={cn("p-2 rounded-lg shrink-0 mt-0.5", config.bg)}>
                {config.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-foreground leading-tight">
                    {signal.headline}
                  </p>
                  <span className={cn("text-[10px] font-medium px-2 py-1 rounded shrink-0 whitespace-nowrap", config.labelColor)}>
                    {config.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {signal.supportText}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
