"use client"

import { AlertTriangle, Eye, CheckCircle2, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import type { RepTrend, CoachingSeverity } from "@/types"

interface CoachingPriorityProps {
  trend: RepTrend
  severity?: CoachingSeverity
  className?: string
}

const priorityConfig = {
  "at-risk": {
    label: "Urgent",
    icon: AlertTriangle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
    description: "Needs immediate coaching intervention",
  },
  drifting: {
    label: "High",
    icon: Eye,
    className: "bg-warning/10 text-warning border-warning/20",
    description: "Watch closely — coaching opportunity",
  },
  stable: {
    label: "Monitor",
    icon: CheckCircle2,
    className: "bg-muted text-muted-foreground border-border",
    description: "On track — maintain cadence",
  },
  improving: {
    label: "Reinforce",
    icon: TrendingUp,
    className: "bg-success/10 text-success border-success/20",
    description: "Positive trend — reinforce habits",
  },
}

export function CoachingPriority({ trend, className }: CoachingPriorityProps) {
  const config = priorityConfig[trend]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded border text-[11px] font-medium",
        config.className,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </div>
  )
}

export function getCoachingPriorityOrder(trend: RepTrend): number {
  const order: Record<RepTrend, number> = {
    "at-risk": 0,
    drifting: 1,
    stable: 2,
    improving: 3,
  }
  return order[trend]
}

export function getCoachingDescription(trend: RepTrend): string {
  return priorityConfig[trend].description
}
