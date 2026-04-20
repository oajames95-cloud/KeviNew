"use client"

import { AlertCircle, CheckCircle2, Clock, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Rep } from "@/types"

interface CoachingItemsListProps {
  rep: Rep
}

const mockCoachingItems = [
  {
    id: "1",
    theme: "Call Connect Rate",
    reason: "Below team average (22% vs 28%)",
    severity: "high",
    status: "new",
    flaggedAt: "2 days ago",
    recommendedAction: "Practice active listening techniques and rapport building",
  },
  {
    id: "2",
    theme: "Meeting-to-Pipeline Ratio",
    reason: "Not converting meetings to pipeline",
    severity: "critical",
    status: "reviewing",
    flaggedAt: "1 week ago",
    recommendedAction: "Review discovery questions and qualification process",
  },
  {
    id: "3",
    theme: "Email Follow-Up Discipline",
    reason: "54% follow-up rate vs 72% team average",
    severity: "medium",
    status: "coached",
    flaggedAt: "3 weeks ago",
    recommendedAction: "Set calendar reminders for follow-up sequences",
  },
]

function getSeverityIcon(severity: string) {
  switch (severity) {
    case "critical":
      return <AlertCircle className="w-5 h-5 text-destructive" />
    case "high":
      return <TrendingDown className="w-5 h-5 text-warning" />
    case "medium":
      return <Clock className="w-5 h-5 text-amber-500" />
    default:
      return <CheckCircle2 className="w-5 h-5 text-success" />
  }
}

function getSeverityBadge(severity: string) {
  const variants: Record<string, "destructive" | "default" | "secondary" | "outline"> = {
    critical: "destructive",
    high: "destructive",
    medium: "default",
    low: "secondary",
  }
  return variants[severity] || "default"
}

function getStatusBadge(status: string) {
  switch (status) {
    case "new":
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">New</Badge>
    case "reviewing":
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Reviewing</Badge>
    case "coached":
      return <Badge variant="outline" className="bg-success/10 text-success border-success/30">Coached</Badge>
    case "watchlist":
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Watchlist</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

export function CoachingItemsList({ rep }: CoachingItemsListProps) {
  return (
    <div className="space-y-3">
      {mockCoachingItems.map((item) => (
        <div
          key={item.id}
          className="rounded-lg border border-border bg-card p-4 hover:border-border-light hover:bg-card/80 transition-all cursor-pointer group"
        >
          <div className="flex gap-4">
            <div className="shrink-0 mt-0.5">
              {getSeverityIcon(item.severity)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                  {item.theme}
                </h3>
                {getStatusBadge(item.status)}
              </div>
              
              <p className="text-xs text-muted-foreground mb-3">{item.reason}</p>
              
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Recommended Action</p>
                  <p className="text-xs text-foreground bg-secondary/50 p-2 rounded">
                    {item.recommendedAction}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <span className="text-xs text-muted-foreground">Flagged {item.flaggedAt}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs px-2"
                >
                  Prepare Session
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
