"use client"

import { useState } from "react"
import {
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Eye,
  MessageSquare,
  Calendar,
  ChevronRight,
  Lightbulb,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Rep, CoachingInsight } from "@/types"
import { mockCoachingInsights } from "@/lib/mock-data"

interface DecisionCardProps {
  rep: Rep
}

const trendConfig = {
  "at-risk": {
    label: "At Risk",
    icon: AlertTriangle,
    bgClass: "bg-destructive/5 border-destructive/20",
    iconClass: "text-destructive",
    message: "This rep needs immediate coaching intervention",
    cta: "Start Coaching Session",
  },
  drifting: {
    label: "Drifting",
    icon: Eye,
    bgClass: "bg-warning/5 border-warning/20",
    iconClass: "text-warning",
    message: "Patterns are shifting — intervention recommended this week",
    cta: "Review Coaching Items",
  },
  stable: {
    label: "Stable",
    icon: CheckCircle2,
    bgClass: "bg-muted/50 border-border",
    iconClass: "text-muted-foreground",
    message: "Rep is on track — maintain regular check-in cadence",
    cta: "Schedule 1:1",
  },
  improving: {
    label: "Improving",
    icon: TrendingUp,
    bgClass: "bg-success/5 border-success/20",
    iconClass: "text-success",
    message: "Positive momentum — reinforce what is working",
    cta: "Acknowledge Progress",
  },
}

export function DecisionCard({ rep }: DecisionCardProps) {
  const [dismissed, setDismissed] = useState(false)
  const config = trendConfig[rep.trend]
  const Icon = config.icon

  // Find any active coaching insights for this rep
  const insight = mockCoachingInsights.find(
    (ci) => ci.repId === rep.id && ci.status !== "coached"
  )

  if (dismissed && !insight) return null

  return (
    <div
      className={cn(
        "rounded-lg border p-5",
        config.bgClass
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        {/* Left: Status + Message */}
        <div className="flex items-start gap-3 flex-1">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
              rep.trend === "at-risk" && "bg-destructive/10",
              rep.trend === "drifting" && "bg-warning/10",
              rep.trend === "stable" && "bg-muted",
              rep.trend === "improving" && "bg-success/10"
            )}
          >
            <Icon className={cn("w-5 h-5", config.iconClass)} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-foreground">
                Manager Decision: {config.label}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {config.message}
            </p>
            {insight && (
              <div className="mt-3 p-3 rounded-md bg-card border border-border">
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      Active coaching item: {insight.theme}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      {insight.recommendedAction}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {(rep.trend === "at-risk" || rep.trend === "drifting") && insight && (
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              {config.cta}
              <ChevronRight className="w-3 h-3" />
            </Button>
          )}
          {(rep.trend === "stable" || rep.trend === "improving") && (
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {config.cta}
            </Button>
          )}
          {!insight && rep.trend !== "at-risk" && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground"
              onClick={() => setDismissed(true)}
            >
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
